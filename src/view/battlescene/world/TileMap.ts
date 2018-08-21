import SceneObject from "../scene/SceneObject";
import Person from "../scene/Person";
import Globals from "../../../enums/Globals";
import BitmapObject from "../scene/BitmapObject";
import ConfigManager from "../../../manager/ConfigManager";
import SceneItem from "../scene/SceneItem";

/**
 * Created by sam on 2017/1/22.
 */

export default class TileMap extends egret.Sprite {

    protected _birthPoint:egret.Point;                            //出生地
    protected _exitPoint:egret.Point;                             //出口
    protected _points:egret.Point[] = [];                         //关键点，不包括出生点和终点
    protected _width:number;
    protected _height:number;
    public sceneObjects:SceneObject[];                          //管理所有对象
    public grids:any[];                                         //地图数据信息 二维数组 -1：不可行走 0：空 〉0有人 值为索引
    protected _bgEffectLayer:egret.Sprite;                        //脚下特效层
    protected _mainLayer:egret.Sprite;                            //角色层（主要层）
    protected _effectLayer:egret.Sprite;                          //特效层 置顶

    public getWidth():number
    {
        return this._width;
    }

    public getHeight():number
    {
        return this._height;
    }

    //刷新场景所有生物的 ZDepth
    public updateDepth():void
    {
        this.sceneObjects.sort(function (a,b) { return a.y-b.y; });
        for(var i=0;i<this.sceneObjects.length;i++)
        {
            this._mainLayer.setChildIndex(this.sceneObjects[i],i);
        }
    }

    public setData(mapKey:any):void
    {
        var data: any = egret.XML.parse(RES.getRes(mapKey));
        this.sceneObjects = [];
        this.grids = new Array();
        this._birthPoint = new egret.Point(0,0);
        var texture = RES.getRes(mapKey+"battleMap_png");
        this._width = Globals.TILE_WIDTH*data.attributes.width;
        this._height = Globals.TILE_HEIGHT*data.attributes.height;
        for(var i=0;i<Math.ceil(this._width/texture.textureWidth);i++){
            for(var j=0;j<Math.ceil(this._height/texture.textureHeight);j++){
                var bitmap = new egret.Bitmap();
                bitmap.texture = texture;
                bitmap.x = texture.textureWidth*i;
                bitmap.y = texture.textureHeight*j;
                this.addChild(bitmap);
            }
        }
        texture = null;
        this._bgEffectLayer = new egret.Sprite();//背景
        this.addChild(this._bgEffectLayer);
        this._mainLayer = new egret.Sprite();//主场景
        this.addChild(this._mainLayer);
        this._effectLayer = new egret.Sprite();//特效
        this.addChild(this._effectLayer);
        //初始化网格
        for(var i=0;i<data.attributes.width;i++){
            this.grids[i] = new Array();
            for(var j=0;j<data.attributes.height;j++){
                this.grids[i][j] = 0;
            }
        }
        //parse tiledMap
        var tilesets:string[] = [];
        for (var i=0;i<data.children.length;i++){
            let layer = data.children[i];
            if(layer.name=="tileset"){
                for (var j=0;j<layer.children.length;j++) {
                    let tileset = layer.children[j];
                    if(tileset.children.length>0)
                    {
                        tilesets[tileset.attributes.id] = tileset.children[0].attributes.source;
                    }
                }
            }
        }
        for (var i=0;i<data.children.length;i++){
            let layer = data.children[i];
            if(layer.attributes.name=="obstacles"){
                var gridWidth = Number(layer.attributes.width);
                if(layer.children.length>0 && layer.children[0].children.length>0)
                {
                    var values = layer.children[0].children[0].text.split(",");
                    for(var j=0;j<values.length;j++)
                    {
                        if(Number(values[j])>0) this.grids[j%gridWidth][Math.floor(j/gridWidth)] = 1;
                    }
                }
            }else if(layer.attributes.name=="object"){
                for (var j=0;j<layer.children.length;j++) {
                    let point = layer.children[j];
                    var imageOBJ:BitmapObject = new BitmapObject(RES.getRes(tilesets[point.attributes.gid-1]));
                    imageOBJ.x = Math.floor(point.attributes.x);
                    imageOBJ.y = Math.floor(point.attributes.y);
                    imageOBJ.name = point.attributes.name;
                    this._bgEffectLayer.addChild(imageOBJ);
                    if (point.attributes.name == "entry") this._birthPoint = this.createWorldLogicPoint(point.attributes);
                    else if (point.attributes.name == "exit") this._exitPoint = this.createWorldLogicPoint(point.attributes);
                    else if (point.attributes.name.indexOf('point') != -1)this._points.push(this.createWorldLogicPoint(point.attributes));
                }
            }else if(layer.attributes.name=="npc"){
                for (var j=0;j<layer.children.length;j++) {
                    let npc = layer.children[j];
                    if(npc.attributes.name.indexOf("npc")>=0){
                        var names: string[] = npc.attributes.name.split("|");
                        this.addPerson(Number(names[2]),names[1],names[3],npc.attributes.x,npc.attributes.y);
                    }else if(npc.attributes.name.indexOf("item")>=0){
                        var names: string[] = npc.attributes.name.split("|");
                        this.addItem(Number(names[2]),names[1],names[3],npc.attributes.x,npc.attributes.y);
                    }else{
                        var imageOBJ:BitmapObject = new BitmapObject(RES.getRes(tilesets[npc.attributes.gid-1]));
                        imageOBJ.x = Math.floor(npc.attributes.x);
                        imageOBJ.y = Math.floor(npc.attributes.y);
                        imageOBJ.name = npc.attributes.name;
                        this._mainLayer.addChild(imageOBJ);
                        this.sceneObjects.push(imageOBJ);
                    }
                }
            }else if(layer.attributes.name=="ground"){
                for (var j=0;j<layer.children.length;j++) {
                    let npc = layer.children[j];
                    var imageOBJ:BitmapObject = new BitmapObject(RES.getRes(tilesets[npc.attributes.gid-1]));
                    imageOBJ.x = Math.floor(npc.attributes.x);
                    imageOBJ.y = Math.floor(npc.attributes.y);
                    this._bgEffectLayer.addChild(imageOBJ);
                }
            }
        }
    }

    public addPerson(id:number,name:string,showName:string,x:number,y:number):Person
    {
        var cfg: any = ConfigManager.getInstance().getConfig("npc_enemy", id);
        var person = new Person();
        this._mainLayer.addChild(person);
        person.setData(cfg);
        person.name = name;
        if(showName&&showName.length>0) person.showName(showName);
        person.x = Math.floor(x);
        person.y = Math.floor(y);
        person.birthPoint = person.position;
        this.sceneObjects.push(person);
        return person;
    }

    public addItem(id:number,name:string,showName:string,x:number,y:number):SceneItem
    {
        var cfg: any = ConfigManager.getInstance().getConfig("item", id);
        var item = new SceneItem();
        this._mainLayer.addChild(item);
        item.setData(cfg);
        item.name = name;
        if(showName&&showName.length>0) item.showName(showName);
        item.x = Math.floor(x);
        item.y = Math.floor(y);
        this.sceneObjects.push(item);
        return item;
    }

    public dispose():void
    {
        this._bgEffectLayer.removeChildren();
        this._mainLayer.removeChildren();
        this._effectLayer.removeChildren();
        for(var i=0;i<this.sceneObjects.length;i++)
        {
            if (!this.sceneObjects[i])continue;
            this.sceneObjects[i].dispose();
            this.sceneObjects[i] = null;
        }
        this.sceneObjects = null;
    }

    public addEffect(sp:egret.DisplayObject):void
    {
        this._effectLayer.addChild(sp);
    }

    private createWorldLogicPoint(pointAttribute:any):egret.Point
    {
        let x:number = Math.floor((Math.floor(pointAttribute.x) + Math.floor(pointAttribute.width) / 2) / Globals.TILE_WIDTH);
        let y:number = Math.floor((Math.floor(pointAttribute.y) - Math.floor(pointAttribute.height) / 2) / Globals.TILE_HEIGHT);
        return new egret.Point(x, y);
        //return PointUtil.getInstance().positionToLogic(new egret.Point(Math.floor(pointAttribute.x),Math.floor(pointAttribute.y)));
    }

    /**
     * 检测碰撞
     * @param obj 检测碰撞的场景对象（防止自身碰撞）
     * @param pt 检测坐标 logic
     * @return boolean
     */
    public checkTilePassable(obj:SceneObject,pt:egret.Point):boolean
    {
        if(obj && obj.moveBlock==0) return true;
        for(var i=0;i<this.sceneObjects.length;i++)
        {
            if(this.sceneObjects[i].physicalBlock>0 && obj!=this.sceneObjects[i])
            {
                if(this.sceneObjects[i] instanceof Person)
                {
                    var person:Person = <Person>this.sceneObjects[i];
                    if(person.batterData.hp<1) continue;
                }
                var fromX:number = this.sceneObjects[i].logicPosition.x - Math.floor(this.sceneObjects[i].physicalWidth/2);
                var fromY:number = this.sceneObjects[i].logicPosition.y - Math.floor(this.sceneObjects[i].physicalHeight/2);
                if(pt.x>=fromX && pt.x<=fromX+this.sceneObjects[i].physicalWidth&&pt.y>=fromY && pt.y<=fromY+this.sceneObjects[i].physicalHeight){
                    return false;
                }
            }
        }
        if(this.grids[pt.x]!=null && this.grids[pt.x][pt.y]!=null)
        {
            if(this.grids[pt.x][pt.y]>0) return false;
            else return true;
        }
        else return false;
    }
}
