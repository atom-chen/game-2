import BaseComponent from "./BaseComponent";
import SceneObjectActor from "../actions/SceneObjectActor";
import CodeWorkerManager from "../../compile/CodeWorkerManager";
import SceneObject from "../../view/battlescene/scene/SceneObject";
import Person from "../../view/battlescene/scene/Person";
import ConfigManager from "../../manager/ConfigManager";
import World from "../../view/battlescene/world/World";
import SceneMoveObject from "../../view/battlescene/scene/SceneMoveObject";
/**
 * Created by yaozhiguo on 2017/3/2.
 */
export default class Cast extends BaseComponent
{
    public attach(actor:SceneObjectActor):void
    {
        super.attach(actor);
        actor.addMethod('cast', this.cast);
        actor.addMethod('isReady', this.isReady);
    }

    /**
     *
     * @param {string} type
     * @param {Person|string|{x:1,y:1}} target
     */
    public cast(type:string, target?:any):void
    {
        switch (type)
        {
            case 'magic-missile'://施放魔法飞弹打击目标,飞弹和弓箭类似，从英雄飞向目标
            case 'fireball'://对目标施放火球术,飞行至目标处后爆炸,略微击退周围敌方单位,并造成伤害
            case 'lightning-bolt'://1级的闪电箭,伤害低于2级.需要有冷却时间
            case 'root'://单体法术，能持续一段时间，召唤藤蔓荆棘缠住目标并对目标造成伤害。
            case 'confuse'://使目标进入迷惑状态，原地打转。迷惑状态的单位如果被攻击
            case 'chaotic-energy'://在英雄身周一定范围内随机刷出若干能量宝石
            case 'drain-life'://对目标持续造成伤害，并持续回复自己相同的生命值
            case 'fear'://对单目标施放，击中后使目标范围内所有敌方点位陷入恐惧状态。
            case 'haste'://使目标移动、攻击速度增加
            {
                let cast:BaseComponent = CodeWorkerManager.getComponentCreator().getComponent('Cast');
                (<Cast>cast).playCastSkill(type, target);
                break;
            }
            case 'poison-cloud'://在目标区域召唤毒云，区域内单位全部获得中毒debuff，持续时间内每秒受到伤害。
            {
                break;
            }
            default:
            {
                break;
            }
        }
    }

    /**
     * 某个技能是否准备好(CD是否清除).
     * @param skillType
     * @returns {boolean}
     */
    public isReady(skillType:string):boolean
    {
        let sceneObjectActor:any = this;
        let sceneObject:SceneObject = sceneObjectActor.sceneObject;
        return (<Person>sceneObject).checkSkillReady(skillType);
    }

    /**------------------------------------------ private call, not for user code ----------------------------------**/

    public playCastSkill(type:string, target?:any):void
    {
        let skillId:number = ConfigManager.getInstance().getSkillIdByType(type);
        if (skillId <= 0)return;
        let sceneObject:SceneObject = this.actor.sceneObject;
        if (target instanceof SceneObjectActor)//攻击对象为Actor
        {
            this.actor.lock();
            let targetPerson:Person = <Person>(target.sceneObject);
            (<Person>sceneObject).playSkill(skillId, targetPerson.logicPosition);
        }
        else if (_.isString(target))
        {
            this.actor.lock();
            let world:World = sceneObject.gameWorld;
            let tar = world.getSceneObjectByName(target);
            if (!tar)
            {
                this.actor.unlock();
                return;
            }
            (<Person>sceneObject).playSkill(skillId, tar.logicPosition);
        }
        else if (_.isObject(target) && target.hasOwnProperty('x') && target.hasOwnProperty('y'))
        {
            this.actor.lock();
            (<Person>sceneObject).playSkill(skillId, new egret.Point(target['x'], target['y']));
        }
        sceneObject.once(SceneMoveObject.HERO_ANIMATION_FINISH, ()=>{
            this.actor.unlock();
        }, this);
    }
}