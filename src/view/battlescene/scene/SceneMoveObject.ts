/**
 * Created by yaozhiguo on 2016/11/8.
 * 包含英雄，怪物，NPC;可以移动到某一个指定的位置
 */
import SceneObject from './SceneObject'
import AStar from "../../../base/math/AStar";
import Hero from "./Hero";
import {Turn} from "./SceneObject";
import PointUtil from "../../../base/math/PointUtil";
import FrameTweenLite from "../../../base/utils/FrameTweenLite";
import GlowFilter = egret.GlowFilter;

export const enum Status {
    IDLE = 0,
    RUN = 1,
    ATTACK = 2,
    HURT = 3,
    DIE = 4
}

export default class SceneMoveObject extends SceneObject {
    private _path: egret.Point[];
    private _nameHeight:number = 0;
    protected _baseAttackRange:number = 1;
    protected _status = Status.IDLE;
    private _baseSpeed:number = 1;
    private _speed:number = 1;
    private _sceneType:number = 1;
    private _8face:boolean = false;
    protected _dashed:boolean = false;
    protected _oldTarget:egret.Point = new egret.Point(-1,0);
    protected _animation: dragonBones.Animation;
    protected _armature: dragonBones.Armature;
    protected _display: any;
    protected _nameLabel:any;
    protected _dragonbonesFactory: dragonBones.EgretFactory;

    public static HERO_STOPPED:string = 'hero_stopped';//英雄停下
    public static MOVE_FINISHED:string = 'hero_move_finished';//移动到某一位置停下
    public static HERO_PASSBY:string = 'hero_passby';
    public static HERO_HP:string = 'hero_hp';//hp变化
    public static HERO_ANIMATION_FINISH:string = 'hero_animation_over';//攻击或者技能动作完成

    public constructor()
    {
        super();
    }

    public getDisplay():any
    {
        return this._display;
    }

    public get animation():dragonBones.Animation
    {
        return this._animation;
    }

    public get speed():number
    {
        return this._speed;
    }

    public set speed(value:number)
    {
        this._speed = value;
    }

    public get sceneType():number
    {
        return this._sceneType;
    }

    public set sceneType(value:number)
    {
        this._sceneType = value;
    }

    public get baseSpeed():number
    {
        return this._baseSpeed;
    }

    public set baseSpeed(value:number)
    {
        this._baseSpeed = value;
    }

    public setData(dat: any): void
    {
        this._data = dat;
        this.physicalWidth = Number(dat.physicalw);
        this.physicalHeight = Number(dat.physicalh);
        this.sightBlock = Number(dat.isvisionblock);
        this.moveBlock = Number(dat.ismoveblock);
        this.physicalBlock = Number(dat.isphysicalblock);
        this.speed = Number(dat.speed);
        this.baseSpeed = this.speed;
        this.sceneType = Number(dat.type);
        this._nameHeight = Number(dat.nameh);
        if(Number(dat.isfullangle)>0)this._8face = true;

        let dragonBoneData = RES.getRes(dat.icon + "_skeleton_json");
        let textureData = RES.getRes(dat.icon + "_texture_json");
        let texture = RES.getRes(dat.icon + "_texture_png");

        if (!dragonBoneData)
            console.error('[SceneMoveObject.setData] animation res error:', dat.icon + ' not found');

        this._dragonbonesFactory = new dragonBones.EgretFactory();
        this._dragonbonesFactory.addDragonBonesData(this._dragonbonesFactory.parseDragonBonesData(dragonBoneData));
        this._dragonbonesFactory.addTextureAtlasData(new dragonBones.EgretTextureAtlas(texture, textureData));

        this._armature = this._dragonbonesFactory.buildArmature(dat.icon);
        this._animation = this._armature.animation;
        this._armature.display.x = 0;
        this._armature.display.y = 0;
        dragonBones.WorldClock.clock.add(this._armature);

        this._animation.play("idle", 0);
        this._turn = Turn.NONE;
        this.addChild(<egret.DisplayObject>this._armature.display);
        this._display = this._armature.display;
    }

    public showName(name:string): void
    {
        this._nameLabel = new egret.TextField();
        this._nameLabel.textColor = 0xffffff;
        this._nameLabel.width = 200;
        this._nameLabel.textAlign = "center";
        this._nameLabel.text = name;
        this._nameLabel.size = 22;
        this._nameLabel.x = -102;
        this._nameLabel.y = -this._nameHeight;
        this._nameLabel.filters = [new egret.GlowFilter(0xfdff71,0.5,3,3)];
        this.addChild(this._nameLabel);
    }

    /**
     * 设置路径，让本场景对象沿着路径走起来。
     * @param path
     */
    public setPath(path:egret.Point[]):void
    {
        this._path = path;
        FrameTweenLite.killTweensOf(this);
        // if (this instanceof Hero) this.dispatchEvent(new egret.Event(SceneMoveObject.HERO_STOPPED,false,false,this.logicPosition));
        this._status = Status.RUN;
        this.runPath();
    }

    private runPath():void
    {
        if(this._path) {
            if (this._path.length > 0 && this._status != Status.IDLE) {
                let targetTile: egret.Point = this._path.shift();
                this.changeFace(PointUtil.getInstance().logicToPosition(targetTile));
                this.moveFirstStep(targetTile);                      //第一步：移动到新格子的边界
            }
        }
    }
    /**
     * 让本场景对象从当前逻辑格移动一段距离。先横后竖
     * @param logicX
     * @param logicY
     */
    public moveBy(logicX: number,logicY:number): void
    {
        if(this._speed>0)
        {
            var path: egret.Point[] = [];
            for (var i = 0; i < Math.abs(logicX); i++)
            {
                path.push(new egret.Point(this.logicPosition.x + (i + 1) * logicX / Math.abs(logicX), this.logicPosition.y));
            }
            for (var i = 0; i < Math.abs(logicY); i++)
            {
                path.push(new egret.Point(this.logicPosition.x, this.logicPosition.y + (i + 1) * logicY / Math.abs(logicY)));
            }
            this.setPath(path);
        }
    }

    /**
     * 无视逻辑格，直线走到对象位置
     * @param logicPos
     */
    public moveTo(logicPos: egret.Point): void
    {
        if(this._speed>0&&this.logicPosition!=logicPos)
        {
            if(this.gameWorld.usePath)
            {
                //if (egret.Point.distance(this._oldTarget, logicPos) >= 3)
                this.setPath(AStar.getInstance().findPath(this, this.logicPosition, logicPos));
                //else this.moveStraightStep(PointUtil.getInstance().logicToPosition(logicPos));
                this._oldTarget = logicPos;
            }else{
                FrameTweenLite.killTweensOf(this);
                this._status = Status.RUN;
                this.changeFace(PointUtil.getInstance().logicToPosition(logicPos));
                this.moveStraightStep(PointUtil.getInstance().logicToPosition(logicPos));
                this._oldTarget = logicPos;
            }
        }
    }

    private changeFace(faceTarget:egret.Point):void
    {
        if(this._8face)
        {
            let angle:number = Math.atan((faceTarget.y-this.position.y)/(faceTarget.x-this.position.x));
            if(faceTarget.x>this.position.x){
                if(angle>Math.PI*3/8){
                    this.turnUp();
                }
                else if(angle>Math.PI/8){
                    this.turnLeft();
                }
                else if(angle>-Math.PI/8){
                    this.turnLeftDown();
                }
                else if(angle>-Math.PI*3/8){
                    this.turnLeftUp();
                }
                else{
                    this.turnDown();
                }
            }else{
                if(angle>Math.PI*3/8){
                    this.turnUp();
                }
                else if(angle>Math.PI/8){
                    console.log("RightUp");
                    this.turnRightUp();
                }
                else if(angle>-Math.PI/8){
                    console.log("RightDown");
                    this.turnRightDown();
                }
                else if(angle>-Math.PI*3/8){
                    console.log("Right");
                    this.turnRight();
                }
                else{
                    console.log("Up");
                    this.turnUp();
                }
            }
        }else {
            if (Math.abs(this.position.x - faceTarget.x) > Math.abs(this.position.y - faceTarget.y)) {
                if (this.position.x - faceTarget.x > 0) this.turnLeft();
                else this.turnRight();
            } else {
                if (this.position.y - faceTarget.y > 0) this.turnDown();
                else this.turnUp();
            }
        }
    }

    //直线走实现类
    private moveStraightStep(pos: egret.Point): void
    {
        var moveLength = 5;
        var targetPos:egret.Point;
        var distance:number = egret.Point.distance(pos,this.position);
        if(distance<=moveLength)
        {
            targetPos = pos;
        }else{
            targetPos = new egret.Point(this.position.x+(pos.x-this.position.x)*moveLength/distance,this.position.y+(pos.y-this.position.y)*moveLength/distance);
        }
        var newLogicPoint = PointUtil.getInstance().positionToLogic(targetPos);
        if(newLogicPoint!=this.logicPosition && this instanceof Hero) this.gameWorld.dispatchEvent(new egret.Event(SceneMoveObject.HERO_PASSBY,false,false,this));
        if(this.gameWorld.checkTilePassable(this,newLogicPoint)==false)
        {
            if (this instanceof Hero)
            {
                this.dispatchEvent(new egret.Event(SceneMoveObject.MOVE_FINISHED,false,false,{type:'abnormal',pos:this.logicPosition}));
                this.say("被阻挡了");
            }
            this.idle();
        }else{
            var needTime = 0.0175*egret.Point.distance(this.position,targetPos)/this.speed;
            var _this = this;
            if(needTime==0) return;
            FrameTweenLite.to(this, needTime, {
                x: targetPos.x, y: targetPos.y, onComplete: function () {
                    if(_this.gameWorld) {
                        _this.gameWorld.updateDepth();
                        if (egret.Point.distance(_this.logicPosition, _this._oldTarget) >= 1) {
                            _this.moveStraightStep(PointUtil.getInstance().logicToPosition(_this._oldTarget));
                        } else {
                            if (_this instanceof Hero) {
                                // _this.dispatchEvent(new egret.Event(SceneMoveObject.HERO_STOPPED,false,false,_this.logicPosition));
                                _this.dispatchEvent(new egret.Event(SceneMoveObject.MOVE_FINISHED, false, false, {
                                    type: 'normal',
                                    pos: _this.logicPosition
                                }));
                            }
                            _this.idle();
                        }
                    }
                },ease:Linear.easeNone
            });
        }
    }

    /**
     * 靠近并保持距离
     * @param logicPos 目标坐标
     * @param range  距离
     */
    public moveCloseTo(logicPos: egret.Point,range:number): void
    {
        let targetPoints:any[] = [];
        for (var i = range; i>0 ; i--) {
            for(var j=0;j<i*2;j++){
                let dPoint = new egret.Point(logicPos.x - i + j,logicPos.y - i);
                if(egret.Point.distance(logicPos,dPoint)<=range&&this.gameWorld.checkTilePassable(this,dPoint)==true){
                    targetPoints.push(dPoint);
                }
            }
            for(var j=0;j<i*2;j++){
                let dPoint = new egret.Point(logicPos.x + i,logicPos.y - i + j);
                if(egret.Point.distance(logicPos,dPoint)<=range&&this.gameWorld.checkTilePassable(this,dPoint)==true){
                    targetPoints.push(dPoint);
                }
            }
            for(var j=0;j<i*2;j++){
                let dPoint = new egret.Point(logicPos.x + i - j,logicPos.y + i);
                if(egret.Point.distance(logicPos,dPoint)<=range&&this.gameWorld.checkTilePassable(this,dPoint)==true){
                    targetPoints.push(dPoint);
                }
            }
            for(var j=0;j<i*2;j++){
                let dPoint = new egret.Point(logicPos.x - i,logicPos.y + i - j);
                if(egret.Point.distance(logicPos,dPoint)<=range&&this.gameWorld.checkTilePassable(this,dPoint)==true){
                    targetPoints.push(dPoint);
                }
            }
            if(targetPoints.length>0)
            {
                var targetPoint:egret.Point;
                var _distance = -1;
                for(var j=0;j<targetPoints.length;j++){
                    if(egret.Point.distance(this.logicPosition,targetPoints[j])<_distance || _distance == -1)
                    {
                        targetPoint = targetPoints[j];
                        _distance = egret.Point.distance(this.logicPosition,targetPoints[j]);
                    }
                }
                this.setPath(AStar.getInstance().findPath(this, this.logicPosition, targetPoint));
                this._oldTarget = targetPoint;
                break;
            }
        }
    }

    /**
    * 第一步 让本场景对象从当前位置移动到某个其他位置的边界。
     * @param targetTile
     */
    private moveFirstStep(targetTile: egret.Point): void
    {
        var _this:SceneMoveObject = this;
        var targetPos:egret.Point = PointUtil.getInstance().logicToPosition(targetTile);
        var oldLogicPoint = this.logicPosition;
        var needTime = 0.00875*egret.Point.distance(this.position,targetPos)/this.speed;                  //根据速度计算角色移动需要的时间
        if(needTime==0) return;
        //if(_this._path.length%2==1 && this instanceof Hero) _this.gameWorld.showFootPrint(this.position,this._turn);
        FrameTweenLite.to(this, needTime, {
            x: (targetPos.x+this.position.x)/2, y: (targetPos.y+this.position.y)/2, onComplete: function () {
                if(_this.gameWorld) {
                    if (_this.gameWorld.checkTilePassable(_this, targetTile) == false) {                                     //由于碰撞导致不可移动时停下来
                        _this._oldTarget = new egret.Point(-1, 0);
                        _this.idle();
                        _this.logicPosition = oldLogicPoint;
                        if (_this instanceof Hero) {
                            _this.dispatchEvent(new egret.Event(SceneMoveObject.MOVE_FINISHED, false, false, {
                                type: 'abnormal',
                                pos: this.logicPosition
                            }));
                            _this.say("被阻挡了");
                        }
                    } else {
                        if (_this.gameWorld)_this.gameWorld.updateDepth();
                        _this.moveSecondStep(needTime, targetPos);                                              //有人换格子，景深重刷
                    }
                }
            },ease:Linear.easeNone
        });
    }

    /**
     * 第二步 让本场景对象从某个其他位置的边界进入该位置。
     * @param targetTile
     */
    private moveSecondStep(needTime:number,targetPos: egret.Point): void
    {
        var _this:SceneMoveObject = this;
        FrameTweenLite.to(this, needTime, {
            x: targetPos.x, y: targetPos.y, onComplete: function () {
                if(_this.gameWorld) {
                    _this.gameWorld.dispatchEvent(new egret.Event(SceneMoveObject.HERO_PASSBY, false, false, _this));
                    if (_this._path.length > 0) _this.runPath();
                    else {
                        if (_this._dashed) {
                            _this._dashed = false;
                            _this.speed = _this.speed / 2;
                        }
                        _this.idle();
                        if (_this instanceof Hero) {
                            _this.dispatchEvent(new egret.Event(SceneMoveObject.MOVE_FINISHED, false, false, {
                                type: 'normal',
                                pos: _this.logicPosition
                            }));
                        }
                    }
                }
            },ease:Linear.easeNone
        });
    }

    public restart():void
    {
        super.restart();
        this._display.alpha = 1;
        FrameTweenLite.killTweensOf(this._display);
        if(this._nameLabel)
        {
            FrameTweenLite.killTweensOf(this._nameLabel);
            this._nameLabel.alpha = 1;
        }
        this._oldTarget = new egret.Point(-1,0);
    }

    public idle(): void
    {
        super.idle();
        if(this._status!=Status.IDLE)
        {
            FrameTweenLite.killTweensOf(this);
            this._status = Status.IDLE;
            this._turn = Turn.NONE;
            this._animation.play('idle', 0);
        }
    }

    public dispose():void
    {
        super.dispose();
        dragonBones.WorldClock.clock.remove(this._armature);
        this._dragonbonesFactory.clear(true);
        this._armature.dispose();
        this._animation.stop();
    }
}
