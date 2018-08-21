import BaseComponent from "./BaseComponent";
import SceneObjectActor from "../actions/SceneObjectActor";
import ConfigManager from "../../manager/ConfigManager";
import Person from "../../view/battlescene/scene/Person";
import SceneMoveObject from "../../view/battlescene/scene/SceneMoveObject";
import World from "../../view/battlescene/world/World";
import Globals from "../../enums/Globals";
/**
 * Created by yaozhiguo on 2017/3/2.
 */
export default class Attack extends BaseComponent
{
    public attach(actor:SceneObjectActor):void
    {
        super.attach(actor);
        actor.addMethod('attack', this.attack);
        actor.addMethod('cleave', this.cleave);
        actor.addMethod('powerUp', this.powerUp);
        actor.addMethod('scattershot', this.scattershot);
        actor.addMethod('shield', this.shield);
        actor.addMethod('bash', this.bash);
        actor.addMethod('attackRange', this.attackRange);
    }

    /**
     * 控制英雄进行旋风斩，对英雄一定范围内的敌方单位造成伤害
     */
    public cleave():void
    {
        let sceneObjectActor:any = this;
        let sceneObject:Person = sceneObjectActor.sceneObject;
        let skillId:number = ConfigManager.getInstance().getSkillIdByType('cleave');
        if (skillId <= 0)return;
        sceneObjectActor.lock();
        sceneObject.playSkill(skillId, sceneObject.logicPosition);
        sceneObject.once(SceneMoveObject.HERO_ANIMATION_FINISH, ()=>{
            sceneObjectActor.unlock();
        }, this);
    }

    /**
     * 强化英雄N秒内的普通攻击伤害，可以有武器强化的动画效果
     */
    public powerUp():void
    {
        let sceneObjectActor:any = this;
        let sceneObject:Person = sceneObjectActor.sceneObject;
        let skillId:number = ConfigManager.getInstance().getSkillIdByType('powerUp');
        if (skillId <= 0)return;
        sceneObjectActor.lock();
        sceneObject.playSkill(skillId, sceneObject.logicPosition);
        sceneObject.once(SceneMoveObject.HERO_ANIMATION_FINISH, ()=>{
            sceneObjectActor.unlock();
        }, this);
    }

    /**
     * 向前方三个方向各射1支箭
     */
    public scattershot():void
    {

    }

    /**
     * 控制英雄举盾防御,在持续时间内百分比减少伤害(根据不同盾牌配的数值)
     * @param time 持续该动作的时间
     */
    public shield(time:number):void
    {
        let sceneObjectActor:any = this;
        let sceneObject:Person = sceneObjectActor.sceneObject;
        let skillId:number = ConfigManager.getInstance().getSkillIdByType('shield');
        if (skillId <= 0)return;
        sceneObjectActor.lock();
        sceneObject.shieldAction(time, skillId);
        sceneObject.once(SceneMoveObject.HERO_ANIMATION_FINISH, ()=>{
            sceneObjectActor.unlock();
        }, this);
    }

    /**
     * 角色对目标进行盾击，造成伤害（最好可以有击退效果)
     * @param target {string|Person},required
     */
    public bash(target:any):void
    {

    }

    /**
     * 攻击动作比较复杂，要经历寻敌，自主移动，接敌攻击，退回最近一个关键点的过程。
     * @param target
     */
    public attack(targetName?:any):void
    {
        let sceneObjectActor:any = this;
        //let sceneObject:Person = sceneObjectActor.sceneObject;
        let self:Person = <Person>(sceneObjectActor.sceneObject);
        self.onControl = true;
        let world:World = self.gameWorld;
        let target:Person = null;
        if (typeof (targetName) == 'string')
        {
            target = <Person>world.getSceneObjectByName(targetName);
        }
        else if (typeof(targetName) == 'object' && targetName instanceof SceneObjectActor)
        {
            target = <Person>(targetName.sceneObject);
        }
        if (!target)return; //是否存在
        if (target.batterData.hp <= 0)return;
        //判断怪物是否在视距内
        let deltaX = target.x - self.x;
        let deltaY = target.y - self.y;
        let slideLength:number = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        let dis:number = slideLength / Globals.TILE_WIDTH;
        if (dis <= self.batterData.viewrange)//在视线内才攻击
        {
            if ( !self.collideWith(target))//是否和攻击对象相交
            {
                sceneObjectActor.lock();
                self.setTarget(target);
                self.onControl = false;
            }
            else
            {
                sceneObjectActor.lock();
                self.playAttack(target.logicPosition);
            }

            //攻击结束
            self.once(SceneMoveObject.HERO_ANIMATION_FINISH, ()=>{

                self.onControl = true;
                self.setTarget(null);

                /*let nearestPoint:egret.Point = self.getNearestPoint();
                if (!nearestPoint)//没找到关键点
                {
                    sceneObjectActor.unlock();
                    return;
                }
                if (nearestPoint.equals(self.logicPosition))//如果攻击时站立位置和最近点重合，直接结束
                {
                    sceneObjectActor.unlock();
                    return;
                }
                if (self.batterData.hp <= 0) //血量为0，直接结束
                {
                    sceneObjectActor.unlock();
                    return;
                }
                if (egret.Point.distance(self.logicPosition, nearestPoint) > 15) //关键点距离超过设定值，则不返回
                {
                    sceneObjectActor.unlock();
                    return;
                }

                self.moveTo(nearestPoint);
                console.log('moveTo:', nearestPoint);
                self.once(SceneMoveObject.MOVE_FINISHED, (event:egret.Event)=>{
                    console.log('moveFinished!');
                    sceneObjectActor.unlock();
                }, this);*/

                if (self.moveToNearestKeyPoint())
                {
                    self.once(SceneMoveObject.MOVE_FINISHED, (event:egret.Event)=>{
                        console.log('moveFinished!');
                        sceneObjectActor.unlock();
                    }, this)
                }
                else
                {
                    sceneObjectActor.unlock();
                }

            }, self)
        }
    }

    /**
     * 获取人物的攻击距离
     * @returns {number}
     */
    public attackRange():number
    {
        let sceneObjectActor:any = this;
        let self:Person = <Person>(sceneObjectActor.sceneObject);
        return self.attackRange;
    }
}