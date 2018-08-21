import Hero from "../scene/Hero";
import Camera from "./Camera";
import MapTips from "../sprite/MapTips";
import FootPrint from "../sprite/FootPrint";
import SceneObject from "../scene/SceneObject";
import {Turn} from "../scene/SceneObject";
import Person from "../scene/Person";
import FrameEffect from "../sprite/FrameEffect";
import Globals from "../../../enums/Globals";
import SceneItem from "../scene/SceneItem";
import SceneMoveObject from "../scene/SceneMoveObject";
import ChatBubble from "../sprite/ChatBubble";
import PointUtil from "../../../base/math/PointUtil";
import UserInfo from "../../../model/vo/UserInfo";
import TileMap from "./TileMap";
import Flower from "../sprite/Flower";
import TweenLiteDriver from "../../../base/utils/TweenLiteDriver";
import FrameTweenLite from "../../../base/utils/FrameTweenLite";

/**
 * Created by yaozhiguo on 2016/11/7.
 */

export default class World extends TileMap {

    public buildObjects:SceneObject[];                          //管理技能build出来的所有对象
    public hero:Hero;                                           //主角
    public camera:Camera;                                       //摄像机
    private _mousePoint:egret.Point;                            //坐标tips
    private _isTimeDelayed:boolean = false;
    private _mapTips:any;
    private _deadNames:string[];
    private _startTime:number = 0;
    public usePath:Boolean = false;
    public static HERO_CLICKED:string = 'hero_clicked';        //英雄被点击

    //显示地图坐标信息
    private showMapTips(world:World):void
    {
        if(world._mapTips)
        {
            world._effectLayer.removeChild(world._mapTips);
            world._mapTips.dispose();
            world._mapTips = null;
        }
        world._mapTips = new MapTips(world._mousePoint);
        world._effectLayer.addChild(world._mapTips);
    }

    //隐藏地图坐标信息
    private hideMapTips():void
    {
        if(this._mapTips)
        {
            if (this._mapTips.parent)
                this._effectLayer.removeChild(this._mapTips);
            this._mapTips.dispose();
            this._mapTips = null;
        }
    }

    //显示脚印
    public showFootPrint(position:egret.Point,turn:Turn):void
    {
        this._bgEffectLayer.addChild(new FootPrint(position,turn));
    }

    //显示花瓣
    public showFlower(textrueName:string,position:egret.Point):void
    {
        this._bgEffectLayer.addChild(new Flower(textrueName,position));
    }

    //获取死亡名单
    public getDeadNames():string[]
    {
        return this._deadNames;
    }

    public addDeadNames(n:string):void
    {
        this._deadNames.push(n);
    }

    public setData(data:any):void
    {
        super.setData(data.tiledmap);

        if(parseInt(data['find_path'])>0) this.usePath = true;
        this.buildObjects = [];
        this._deadNames = [];
        this.hero = new Hero();
        let userInfo:UserInfo = data['player_info'];
        this.hero.setData(userInfo);
        this._mainLayer.addChild(this.hero);
        this.sceneObjects.push(this.hero);
        this.hero.logicPosition = new egret.Point(this._birthPoint.x,this._birthPoint.y);
        this.hero.birthPoint = PointUtil.getInstance().logicToPosition(this.hero.logicPosition);
        if(Number(data.hero_rotation)==3) this.hero.getDisplay().scaleX = 1;
        else this.hero.getDisplay().scaleX = -1;
        this.camera = new Camera();
        this.camera.bind(this);
        var _this:World = this;
        var onDrag = false;
        var startPos:egret.Point = new egret.Point(0,0);
        var oldCamera:egret.Point = new egret.Point(0,0);
        var canvas:any = document.getElementsByTagName("CANVAS")[0];
        if(canvas){
            canvas.onmousedown = (evt: MouseEvent)=>{
                if(evt.x < Globals.GAME_WIDTH * Globals.BATTLE_AREA_WIDTH_RATIO * Globals.scaleRatio)
                {
                    _this.camera.unLock();
                    onDrag = true;
                    startPos = new egret.Point(evt.x,evt.y);
                    oldCamera= _this.camera.focusPoint;
                    for(var i=0;i<_this.sceneObjects.length;i++){
                        if(_this.sceneObjects[i] instanceof Person){
                            if(_this.sceneObjects[i].checkPointIn(_this._mousePoint)){
                                _this.dispatchEvent(new egret.Event(World.HERO_CLICKED,false,false,_this.sceneObjects[i].name));
                                console.log('hero clicked - push msg')
                            }
                        }
                    }
                }
            };
            canvas.onmouseup = ()=>{
                onDrag = false;
            };
            canvas.onmousemove = (evt: MouseEvent)=>{
                if(onDrag) _this.camera.focusAt(oldCamera.x-evt.x+startPos.x,oldCamera.y-evt.y+startPos.y);
                else{
                    var nowPoint = new egret.Point(Math.floor(((evt.x - canvas.offsetLeft) * Globals.GAME_WIDTH / canvas.clientWidth - _this.x - Globals.TILE_WIDTH / 2) / _this.camera.getScale() / Globals.TILE_WIDTH)
                        ,Math.floor(((evt.y - canvas.offsetTop) * Globals.GAME_HEIGHT / canvas.clientHeight - _this.y - Globals.TILE_HEIGHT / 2) / _this.camera.getScale() / Globals.TILE_HEIGHT ));
                    if (_this._mousePoint){
                        if (egret.Point.distance(_this._mousePoint, nowPoint) > 0) {
                            _this._isTimeDelayed = false;
                            TweenLite.killDelayedCallsTo(_this.showMapTips);
                            _this.hideMapTips();
                        } else if (_this._isTimeDelayed == false) {
                            _this._isTimeDelayed = true;
                            TweenLite.delayedCall(0.5, _this.showMapTips, [_this]);
                        }
                    }
                    _this._mousePoint = nowPoint;
                }
            };
        }
        this.updateDepth();
        this.addEventListener(SceneMoveObject.HERO_PASSBY, this.onPersonPick, this);
        TweenLiteDriver.startTick(this.updateDragonBones, this);
    }

    private onPersonPick(event:egret.Event)
    {
        let person: Person = <Person>event.data;
        for (var i = 0; i < this.sceneObjects.length; i++) {
            if (this.sceneObjects[i] instanceof SceneItem && person instanceof Hero && this.sceneObjects[i].checkPointIn(person.logicPosition)) {
                let item: SceneItem = <SceneItem>this.sceneObjects[i];
                if(item.pickabled) item.pickedByPerson(person);
            }
        }
    }

    public play():void                                                          //演绎场景
    {
        this._deadNames = [];
        this._effectLayer.removeChildren();
        for(var i=0;i<this.buildObjects.length;i++)
        {
            for(var j=0;j<this.sceneObjects.length;j++)
            {
                if(this.sceneObjects[j].name==this.buildObjects[i].name){
                    if(this.sceneObjects[j].parent){
                        this.sceneObjects[j].parent.removeChild(this.sceneObjects[j]);
                        this.sceneObjects[j] = null;
                    }
                    this.sceneObjects.splice(j,1);
                    break;
                }
            }
        }
        this.buildObjects = [];
        for(var i=0;i<this.sceneObjects.length;i++)
        {
            this.sceneObjects[i].restart();
            if (this.sceneObjects[i] instanceof Person)                          //复活
            {
                var person: Person = <Person>this.sceneObjects[i];
                person.batterData.hp = Math.max(1, person.batterData.maxhp);
            }
        }
        this._startTime = TweenLiteDriver.getCurrentTick();
        TweenLiteDriver.startTick(this.update, this);
    }

    private updateDragonBones():boolean
    {
        dragonBones.WorldClock.clock.advanceTime(0.034);
        return false;
    }

    private update(timeObj:any):boolean
    {
        timeObj.frame = timeObj.frame - this._startTime;
        for(var i=0;i<this.sceneObjects.length;i++)
        {
            this.sceneObjects[i].update(timeObj);
        }
        return false;
    }

    public dispose():void
    {
        super.dispose();
        var canvas:any = document.getElementsByTagName("CANVAS")[0];
        if(canvas)
        {
            canvas.onmousedown = null;
            canvas.onmouseup = null;
            canvas.onmousemove = null;
        }
        TweenLiteDriver.stopTick(this.updateDragonBones, this);
        TweenLiteDriver.stopTick(this.update, this);
        this.hideMapTips();
    }

    public stopPlay():void
    {
        TweenLiteDriver.stopTick(this.updateDragonBones, this);
        TweenLiteDriver.stopTick(this.update, this);
        FrameTweenLite.killAll();
    }

    public startPlay():void
    {
        this.play();
        TweenLiteDriver.startTick(this.updateDragonBones, this);
        this.camera.lockAt(this.hero);
    }

    public addChatBubble(ps:SceneObject,words:any):void
    {
        var pt:egret.Point = ps.logicPosition.add(new egret.Point(0,-6));
        var screenPoint:egret.Point = new egret.Point(pt.x*Globals.TILE_WIDTH,pt.y*Globals.TILE_HEIGHT).subtract(new egret.Point(this.x,this.y));
        this._effectLayer.addChild(new ChatBubble(screenPoint.x>Globals.GAME_WIDTH*Globals.BATTLE_AREA_WIDTH_RATIO/2,new egret.Point(pt.x*Globals.TILE_WIDTH,pt.y*Globals.TILE_WIDTH),words.toString()));
        for(var i=0;i<this.sceneObjects.length;i++)
        {
            if(this.sceneObjects[i] instanceof Person && this.sceneObjects[i]!=ps)
            {
                var person:Person = <Person> this.sceneObjects[i];
                var storyID:number = person.getStoryID();
                if(storyID>0 && person.checkStory(words)){
                    this.hero.answered(storyID);
                }
            }
        }
    }

    /**
     * 通过SceneObject名称，获取SceneObject，没有为null
     * @returns {null}
     */
    public getSceneObjectByName(name:string):SceneObject
    {
        for(var i=0;i<this.sceneObjects.length;i++)
        {
            if(this.sceneObjects[i].name==name) return this.sceneObjects[i];
        }
        return null;
    }

    /**
     * 获取单元格周围范围内的生物，没有返回空数组单元格坐标
     * * @param pt 返回空数组单元格坐标
     * @param range 搜索范围
     * @return 对象数组
     */
    public findAllByRange(pt:egret.Point,range:number):SceneObject[]
    {
        var result:SceneObject[] = [];
        for(var i=0;i<this.sceneObjects.length;i++)
        {
            var npc:SceneObject = this.sceneObjects[i];
            if(npc instanceof SceneObject && Math.abs(npc.logicPosition.x-pt.x)<=range && Math.abs(npc.logicPosition.y-pt.y)<=range) result.push(npc);
        }
        return result;
    }

    /**
     * 获取单元格周围范围内的生物，没有返回空数组单元格坐标
     * * @param pt 单元格坐标
     * @param range 搜索范围
     * @return 对象数组
     */
    public findPersonsByRange(pt:egret.Point,range:number):any[]
    {
        var result:any[] = [];
        for(var i=0;i<this.sceneObjects.length;i++)
        {
            var npc:any = this.sceneObjects[i];
            if(npc instanceof Person && egret.Point.distance(npc.logicPosition,pt)<=range)
            {
                if ((<Person>npc).batterData.hp > 0)
                {
                    result.push(npc);
                }
            }
        }
        return result;
    }

    /**
     * 获取单元格周围范围内的生物，没有返回空数组单元格坐标
     * * @param pt 返回空数组单元格坐标
     * @param range 搜索范围
     * @return 对象数组
     */
    public findAllByViewRange(person:Person,range:number):SceneObject[]
    {
        var result:SceneObject[] = [];
        for(var i=0;i<this.sceneObjects.length;i++)
        {
            if(this.sceneObjects[i]!=person && egret.Point.distance(this.sceneObjects[i].logicPosition,person.logicPosition)<=range){
                var isInSightLine:boolean = true;
                for (var j = 0; j < this.sceneObjects.length; j++) {            //场景对象视线碰撞
                    if (this.sceneObjects[j].sightBlock>0 && this.sceneObjects[j] != person && i != j && PointUtil.getInstance().checkCollision(person.logicPosition, this.sceneObjects[i].logicPosition, this.sceneObjects[j].getSize())) {
                        if(this.sceneObjects[j] instanceof Person)
                        {
                            var p:Person = <Person> this.sceneObjects[j];
                            if(p.batterData.hp>0) isInSightLine = false;
                        }else isInSightLine = false;
                        break;
                    }
                }
                for (var k = 0; k < this.grids.length; k++) {                   //grid视线碰撞
                    for (var j = 0; j < this.grids[k].length; j++) {
                        if (this.grids[k][j] > 0 && PointUtil.getInstance().checkCollision(person.logicPosition, this.sceneObjects[i].logicPosition, new egret.Rectangle(k, j, 1, 1))) {
                            isInSightLine = false;
                            PointUtil.getInstance().checkCollision(person.logicPosition, this.sceneObjects[i].logicPosition, new egret.Rectangle(k, j, 1, 1));
                            break;
                        }
                    }
                }
                if(isInSightLine) result.push(this.sceneObjects[i]);
            }
        }
        return result;
    }

    /**
     * 获取视距范围内的生物，没有返回空数组单元格坐标
     * @param person 查看对象
     * @param range 搜索范围
     * @return 对象数组
     */
    public findPersonsByViewRange(person:Person,range:number):Person[]
    {
        var result:Person[] = [];
        for(var i=0;i<this.sceneObjects.length;i++)
        {
            if(this.sceneObjects[i] instanceof Person && this.sceneObjects[i]!=person && egret.Point.distance(this.sceneObjects[i].logicPosition,person.logicPosition)<=range){
                var npc:Person = <Person> this.sceneObjects[i];
                var isInSightLine:boolean = true;
                if(npc.batterData.hp<1) isInSightLine = false;
                else{
                    for (var j = 0; j < this.sceneObjects.length; j++) {            //场景对象视线碰撞
                        if (this.sceneObjects[j].sightBlock>0 && this.sceneObjects[j] != person && i != j && PointUtil.getInstance().checkCollision(person.logicPosition, npc.logicPosition, this.sceneObjects[j].getSize())) {
                            if(this.sceneObjects[j] instanceof Person)
                            {
                                var p:Person = <Person> this.sceneObjects[j];
                                if(p.batterData.hp>0) isInSightLine = false;
                            }else isInSightLine = false;
                            break;
                        }
                    }
                    for (var k = 0; k < this.grids.length; k++) {                   //grid视线碰撞
                        for (var j = 0; j < this.grids[k].length; j++) {
                            if (this.grids[k][j] > 0 && PointUtil.getInstance().checkCollision(person.logicPosition, npc.logicPosition, new egret.Rectangle(k, j, 1, 1))) {
                                isInSightLine = false;
                                break;
                            }
                        }
                    }
                }
                if(isInSightLine) result.push(npc);
            }
        }
        return result;
    }

    /**
     * 获取视距范围内的生物，没有返回空数组单元格坐标
     * @param person 查看对象
     * @param npc 目标对象
     * @param range 搜索范围
     * @return 对象数组
     */
    public checkPersonsInViewRange(person:Person,npc:Person,range:number):boolean
    {
        var isInSightLine:boolean = true;
        if(egret.Point.distance(npc.logicPosition,person.logicPosition)<=range){
            if(npc.batterData.hp<1) isInSightLine = false;
            else{
                for (var j = 0; j < this.sceneObjects.length; j++) {            //场景对象视线碰撞
                    if (this.sceneObjects[j].sightBlock>0 && this.sceneObjects[j] != person && this.sceneObjects[j] != npc && PointUtil.getInstance().checkCollision(person.logicPosition, npc.logicPosition, this.sceneObjects[j].getSize())) {
                        if(this.sceneObjects[j] instanceof Person)
                        {
                            var p:Person = <Person> this.sceneObjects[j];
                            if(p.batterData.hp>0) isInSightLine = false;
                        }else isInSightLine = false;
                        break;
                    }
                }
                for (var k = 0; k < this.grids.length; k++) {                   //grid视线碰撞
                    for (var j = 0; j < this.grids[k].length; j++) {
                        if (this.grids[k][j] > 0 && PointUtil.getInstance().checkCollision(person.logicPosition, npc.logicPosition, new egret.Rectangle(k, j, 1, 1))) {
                            isInSightLine = false;
                            break;
                        }
                    }
                }
            }
        }
        return isInSightLine;
    }

    public createEffect(delayTime:number,skillName:string,pos:egret.Point):void                              //释放技能特效
    {
        var _this = this;
        FrameTweenLite.delayedCall(delayTime,function () {
            let eff:FrameEffect = new FrameEffect(skillName);
            eff.x = pos.x;
            eff.y = pos.y;
            if(skillName.indexOf("Add")>-1) eff.blendMode = egret.BlendMode.ADD;
            _this._effectLayer.addChild(eff);
        });
    }

    /**
     * 实现伤害飘特效
     * @param pos 飘伤害位置
     * @param value 伤害数量
     */
    public createHurtEffect(pos:egret.Point,value:number):void
    {
        //TODO
    }

    /**
     * 实现粒子特效，返回过程时间
     * @param skillName 技能名称
     * @param frompos 出发位置
     * @param topos 到达位置
     * @return 过程时间
     */
    public createParticleEffect(skillName:string,frompos:egret.Point,topos:egret.Point):number                       //释放技能过程粒子特效
    {
        let sprite:FrameEffect = new FrameEffect(skillName);
        sprite.isLoop = true;
        if(skillName.indexOf("Add")>-1) sprite.blendMode = egret.BlendMode.ADD;
        sprite.anchorOffsetX = sprite.texture.textureWidth/2;
        sprite.anchorOffsetY = sprite.texture.textureHeight/2;
        sprite.x = frompos.x;
        sprite.y = frompos.y-100;
        this._effectLayer.addChild(sprite);
        let angle:number = Math.atan((topos.y-frompos.y)/(topos.x-frompos.x))*180/Math.PI;
        if(topos.x>=frompos.x){
            sprite.rotation = angle;
            topos.y = topos.y - 60;
        }
        else{
            sprite.rotation = angle-180;
        }
        let needTime:number = egret.Point.distance(frompos,topos)*0.001;
        FrameTweenLite.to(sprite,needTime,{x:topos.x,y:topos.y,onComplete:function () {
            if(sprite.parent) sprite.parent.removeChild(sprite);
        }});
        return needTime;
    }

    /**
     * 获取所有关键点,不包含出口和入口
     * @returns {Array}
     */
    public get points():egret.Point[]
    {
        return this._points;
    }

    /**
     * 获取出生点逻辑坐标
     * @returns {null}
     */
    public get birthPoint():egret.Point
    {
        return this._birthPoint;
    }

    /**
     * 获取终点逻辑坐标
     * @returns {null}
     */
    public get endPoint():egret.Point
    {
        return this._exitPoint;
    }

    /**
     * 获取终点范围
     * @returns {null}
     */
    public get exitArea():egret.Rectangle
    {
        return new egret.Rectangle(this._exitPoint.x-1,this._exitPoint.y-1,3,3);
    }

    //utils 下面的functions提供场景管理工具
    public getAreaByID(name:string):egret.Rectangle
    {
        var obj = this.getSceneObjectByName(name);
        if(obj) return new egret.Rectangle(obj.x,obj.y,obj.physicalWidth*Globals.TILE_WIDTH,obj.physicalHeight*Globals.TILE_HEIGHT);
        else return null;
    }
}
