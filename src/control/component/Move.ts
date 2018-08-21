import BaseComponent from "./BaseComponent";
import SceneObjectActor from "../actions/SceneObjectActor";
import SceneMoveObject from "../../view/battlescene/scene/SceneMoveObject";
import SceneObject from "../../view/battlescene/scene/SceneObject";
import World from "../../view/battlescene/world/World";
/**
 * Created by yaozhiguo on 2017/3/1.
 */
export default class Move extends BaseComponent
{
    public attach(actor:SceneObjectActor):void
    {
        super.attach(actor);
        actor.addMethod('moveSimply', this.moveSimply);
        actor.addMethod('moveLeft', this.moveLeft);
        actor.addMethod('moveRight', this.moveRight);
        actor.addMethod('moveUp', this.moveUp);
        actor.addMethod('moveDown', this.moveDown);
        actor.addMethod('moveXY', this.moveXY);
        actor.addMethod('dash', this.dash);
        actor.addMethod('move', this.move);
        actor.addMethod('jumpTo', this.jumpTo);
    }

    private moveSimply(mx:number, my:number, times?:number):void
    {
        let sceneObjectActor:any = this; //当前上下文是sceneObjectActor
        sceneObjectActor.lock();
        times = times || 1;
        let sceneObject:SceneObject = sceneObjectActor.sceneObject;
        (<SceneMoveObject>sceneObject).moveBy(mx * times, my * times);
        sceneObject.once(SceneMoveObject.MOVE_FINISHED, ()=>{
            sceneObjectActor.unlock();
        }, this);
    };

    public moveLeft(times?:number): void
    {
        this['_methods']['moveSimply'].apply(this, [-10, 0, times]);
    }

    public moveRight(times?:number): void
    {
        this['_methods']['moveSimply'].apply(this, [10, 0, times]);
    }

    public moveUp(times?:number): void
    {
        this['_methods']['moveSimply'].apply(this, [0, -10, times]);
    }

    public moveDown(times?:number): void
    {
        this['_methods']['moveSimply'].apply(this, [0, 10, times]);
    }

    public moveXY(x:number, y:number): void
    {
        let sceneObjectActor:any = this;
        let sceneObject:SceneObject = sceneObjectActor.sceneObject;
        sceneObjectActor.lock();
        let targetPos:egret.Point = new egret.Point(x, y);
        if (sceneObject.logicPosition.equals(targetPos))
        {
            sceneObjectActor.unlock();
            return;
        }
        (<SceneMoveObject>sceneObject).moveTo(targetPos);
        sceneObject.once(SceneMoveObject.MOVE_FINISHED, ()=>{
            sceneObjectActor.unlock();
        }, this);
    }

    /**
     * 英雄快速冲向目的地
     * @param x
     * @param y
     */
    public dash(x:number, y:number):void
    {
        let actor:any = this;
        actor.lock();
        actor.sceneObject.dashAction(new egret.Point(x, y));
        actor.sceneObject.once(SceneMoveObject.MOVE_FINISHED, ()=>{
            actor.unlock();
        }, this);
    }

    /**
     * 高级版本的move，可以直接向目标move，比如hero.move("Barbarian1")。需要寻路
     * @param target {string|SceneObjectActor|{x,y}}
     */
    public move(target:any):void
    {
        let actor:any = this;
        let targetPos:egret.Point;
        if (_.isString(target))
        {
            let world:World = actor.sceneObject.gameWorld;
            let targetObj:SceneObject = world.getSceneObjectByName(target);
            targetPos = targetObj.logicPosition;

        }
        else if (target instanceof SceneObjectActor)
        {
            targetPos = (<SceneObjectActor>target).sceneObject.logicPosition;
        }
        else if (_.isObject(target) && target.hasOwnProperty('x') && target.hasOwnProperty('y'))
        {
            targetPos = new egret.Point(target.x, target.y);
        }
        this.moveXY(targetPos.x, targetPos.y);
    }

    /**
     * 使英雄跳向目标地点，跳跃期间无视地形阻挡
     * @param x
     * @param y
     */
    public jumpTo(x:number, y:number):void
    {

    }
}