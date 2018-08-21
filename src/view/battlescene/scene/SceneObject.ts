/**
 * Created by yaozhiguo on 2016/11/7.
 * 一个游戏场景对象。具备添加组件的能力，当然也就可以执行不同的动作。
 */
/// <reference path="../../../../typings/index.d.ts" />
import World from "../world/World";
import PointUtil from "../../../base/math/PointUtil";
import FrameTweenLite from "../../../base/utils/FrameTweenLite";

export const enum Turn {
    NONE = 0,
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4,
    LEFTUP = 5,
    RIGHTDOWN = 6,
    LEFTDOWN = 7,
    RIGHTUP = 8
}
export default class SceneObject extends egret.Sprite {

    protected _position: egret.Point;
    protected _logicPosition: egret.Point;
    protected _turn:Turn = Turn.NONE;
    protected _data: any;
    protected _timer:number = 0;
    private _sightBlock:number = 0;
    private _moveBlock:number = 0;
    private _physicalBlock:number = 0;
    private _physicalWidth:number = 0;
    private _physicalHeight:number = 0;


    public getData(): any
    {
        return this._data;
    }

    /**
     * 获取场景对象的findtype属性字符串，本属性不同于sceneType。
     * @returns {any}
     */
    public get type():string
    {
        return this._data['findtype'];
    }

    public get sightBlock():number
    {
        return this._sightBlock;
    }

    public set sightBlock(value:number)
    {
        this._sightBlock = value;
    }

    public get moveBlock():number
    {
        return this._moveBlock;
    }

    public set moveBlock(value:number)
    {
        this._moveBlock = value;
    }

    public get physicalBlock():number
    {
        return this._physicalBlock;
    }

    public set physicalBlock(value:number)
    {
        this._physicalBlock = value;
    }

    public get physicalWidth():number
    {
        return this._physicalWidth;
    }

    public set physicalWidth(value:number)
    {
        this._physicalWidth = value;
    }

    public get physicalHeight():number
    {
        return this._physicalHeight;
    }

    public set physicalHeight(value:number)
    {
        this._physicalHeight = value;
    }

    public set position(pos: egret.Point)
    {
        this.x = pos.x;
        this.y = pos.y;
        this._position = pos;
    }

    public get position(): egret.Point
    {
        return new egret.Point(this.x, this.y);
    }

    public set logicPosition(pt: egret.Point)
    {
        this.position = PointUtil.getInstance().logicToPosition(pt);
        this._logicPosition = pt;
    }

    public get logicPosition(): egret.Point
    {
        this._logicPosition = PointUtil.getInstance().positionToLogic(this.position);
        return this._logicPosition;
    }

    public checkPointIn(pt:egret.Point):boolean
    {
        if(pt)
        {
            var tmpPoint: egret.Point = pt.subtract(this.logicPosition);
            if (tmpPoint.x <= Math.floor(this.physicalWidth/2) && tmpPoint.x >= -Math.floor(this.physicalWidth/2) && tmpPoint.y <= Math.floor(this.physicalHeight/2) && tmpPoint.y >= -Math.floor(this.physicalHeight/2)) return true;
        }
        return false;
    }

    public constructor()
    {
        super();
        this._position = new egret.Point(0,0);
    }

    public get turn():number
    {
        return this._turn;
    }

    /**
     * 让场景对象转向
     */
    public turnUp(): void {
        this._turn = Turn.UP;
    }

    public turnDown(): void {
        this._turn = Turn.DOWN;
    }

    public turnLeft(): void {
        this._turn = Turn.LEFT;
    }

    public turnRight(): void {
        this._turn = Turn.RIGHT;
    }

    public turnLeftUp(): void {
        this._turn = Turn.LEFTUP;
    }

    public turnRightUp(): void {
        this._turn = Turn.RIGHTUP;
    }

    public turnLeftDown(): void {
        this._turn = Turn.LEFTDOWN;
    }

    public turnRightDown(): void {
        this._turn = Turn.RIGHTDOWN;
    }

    public getSize(): egret.Rectangle {
        return new egret.Rectangle(this.logicPosition.x-Math.floor(this.physicalWidth/2),this.logicPosition.y-Math.floor(this.physicalHeight/2),this.physicalWidth,this.physicalHeight);
    }

    public update(timeObject:any):void
    {
        this._timer = timeObject.frame/30;
    }

    /**
     *  说话
     */
    public say(word:any):void
    {
        if(word.toString()!="biexianshi")
            this.gameWorld.addChatBubble(this,word.toString());
    }

    /**
     * 注销本对象的资源。子类在必要时需要重写本方法。
     */
    public dispose(): void
    {
        FrameTweenLite.killTweensOf(this);
        this._data = null;
    }

    /**
     * 游戏重置
     */
    public restart():void
    {
        FrameTweenLite.killTweensOf(this);
        this.idle();
    }

    /**
     * 让对象处于待机状态。
     */
    public idle(): void
    {
        //this._inAction = false;
    }

    /**
     * 提供给用户输入代码用。
     * @returns {egret.Point}
     */
    public get pos():egret.Point
    {
        return this.logicPosition;
    }

    public get gameWorld():World
    {
        if(this.parent && this.parent.parent && this.parent.parent instanceof World) return <World>this.parent.parent;
        return null;
    }

    /**
     * 判断是否和某个场景元素相交
     * @param collider
     * @returns 相交返回true 否则返回false
     */
    public collideWith(collider:any):boolean
    {
        return egret.Point.distance(this.logicPosition,collider.logicPosition)==0;
    }

    /**
     * 获取离自身当前位置最近的关键点，不包含起始点和终点
     * @returns {egret.Point}
     */
    public getNearestPoint():egret.Point
    {
        let points:egret.Point[] = this.gameWorld.points;
        let distance:number = Infinity;
        let nearestPoint:egret.Point = points[0];//记录最近关键点
        for (let i= 0; i < points.length; i++)
        {
            if (!points[i])continue;
            let tempDistance:number = egret.Point.distance(points[i], this.logicPosition);
            if (tempDistance < distance)
            {
                distance = tempDistance;
                nearestPoint = points[i];
            }
        }
        return nearestPoint;
    }
}
