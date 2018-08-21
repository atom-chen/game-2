import World from "./World";
import Hero from "../scene/Hero";
import Globals from "../../../enums/Globals";
import TweenLiteDriver from "../../../base/utils/TweenLiteDriver";
/**
 * Created by sam on 2016/11/11.
 */

export default class Camera{
    private _world:World;
    private _hero:Hero;
    private _oldPosition:egret.Point;
    private _scale:number;
    private _centerPoint:egret.Point;
    private _velocity:number;
    private _lock:boolean = false;
    private _x:number;
    private _y:number;
    public constructor() {
        this._scale = 1;
        this._velocity = 0;
        this._centerPoint = new egret.Point(Globals.GAME_WIDTH * Globals.BATTLE_AREA_WIDTH_RATIO/2, Globals.GAME_HEIGHT/2);
    }

    public get lock():boolean
    {
        return this._lock;
    }

    public set lock(value:boolean)
    {
        this._lock = value;
    }

    public get focusPoint():egret.Point
    {
        return this._oldPosition;
    }

    public bind(world:World)
    {
        this._world = world;
        this._oldPosition = new egret.Point(this._world.hero.x,this._world.hero.y);
        this.updatePosition();
    }

    private update(time:Object):void
    {
        if(this._oldPosition.x!=this._hero.x || this._oldPosition.y!=this._hero.y ) this.updatePosition();
    }

    public lockAt(hero:Hero)
    {
        this._hero = hero;
        this._oldPosition = new egret.Point(this._hero.x,this._hero.y);
        TweenLiteDriver.startTick(this.update, this);
        this.updatePosition();
        this._lock = true;
    }

    public unLock()
    {
        if(this._lock)
        {
            TweenLiteDriver.stopTick(this.update, this);
            this._lock = false;
        }
    }

    private updatePosition()
    {
        if(this.lock)
        {
            if (egret.Point.distance(this._oldPosition, this._hero.position) < 1 || egret.Point.distance(this._oldPosition, this._hero.position) > 5) {
                this._oldPosition.x = this._hero.x;
                this._oldPosition.y = this._hero.y;
            } else {
                if (Math.abs(this._hero.x - this._oldPosition.x) > 0) {
                    this._velocity = Math.min(Math.abs(this._hero.x - this._oldPosition.x), 4);
                    this._oldPosition.x = this._oldPosition.x + this._velocity * (this._hero.x - this._oldPosition.x) / Math.abs(this._hero.x - this._oldPosition.x);
                }
                if (Math.abs(this._hero.y - this._oldPosition.y) > 0) {
                    this._velocity = Math.min(Math.abs(this._hero.y - this._oldPosition.y), 4);
                    this._oldPosition.y = this._oldPosition.y + this._velocity * (this._hero.y - this._oldPosition.y) / Math.abs(this._hero.y - this._oldPosition.y);
                }
            }
        }
        this.focusAt(this._oldPosition.x,this._oldPosition.y);
    }

    public focusAt(x:number,y:number):void
    {
        this._world.x = Math.max(Math.min(0,Globals.GAME_WIDTH * Globals.BATTLE_AREA_WIDTH_RATIO-this._world.getWidth()*this._scale),Math.min(0,this._centerPoint.x - x*this._scale));
        this._world.y = Math.max(Math.min(0,Globals.GAME_HEIGHT-this._world.getHeight()*this._scale),Math.min(0,this._centerPoint.y - y*this._scale));
        this._oldPosition = new egret.Point((this._centerPoint.x-this._world.x)/this._scale,(this._centerPoint.y-this._world.y)/this._scale);
        this._x = x;
        this._y = y;
    }

    public getScale():number
    {
        return this._scale;
    }

    public zoom(scale:number):number
    {
        this._scale = scale;
        this._world.scaleX = this._scale;
        this._world.scaleY = this._scale;
        this.focusAt(this._x,this._y);
        return this._scale;
    }
}

