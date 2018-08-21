import BaseComponent from "./BaseComponent";
import SceneObjectActor from "../actions/SceneObjectActor";
import SceneObject from "../../view/battlescene/scene/SceneObject";
import World from "../../view/battlescene/world/World";
import Person from "../../view/battlescene/scene/Person";
import ComponentCreator from "./ComponentCreator";
import ConfigManager from "../../manager/ConfigManager";
import PersonTeams from "../../enums/PersonTeams";
/**
 * Created by yaozhiguo on 2017/3/2.
 */
export default class Command extends BaseComponent
{
    public attach(actor:SceneObjectActor):void
    {
        super.attach(actor);
        actor.addMethod('command', this.command);
        actor.addMethod('summon', this.summon);
    }

    /**
     * 玩家英雄进行command,控制特定的友方单位进行不同的动作.
     * @param friend {string|Person}
     * @param action {string}, 已知有 'move', 'attack'
     * @param target {string|SceneObject|{x,y}} 被控制的单位的动作的目标,可以enemy,也可以是{"x": 24, "y": 35}
     */
    public command(friend:any, action:string, ...target):void
    {
        if (_.isString(friend))
        {
            let sceneObjectActor:any = this;
            let sceneObject:SceneObject = sceneObjectActor.sceneObject;
            let world:World = sceneObject.gameWorld;
            let person:Person = <Person>(world.getSceneObjectByName(friend));
            if (person.batterData.team != PersonTeams.FRIEND)  return;//非友军
            if (parseInt(person.getData()['commandable']) != 1) return;//不能执行command

            let actor:SceneObjectActor = new SceneObjectActor(person);//代理对象
            actor.bindComponents(new ComponentCreator()); //添加方法集合到actor的队列中

            //从配置中读取所有可以使用的指令，用以和用户输入的action比对
            let ids:string[] = person.getData()['commandable_skill'].split("|");
            if (ids.length <= 0)return; //无可以使用的指令

            let filters:string[] = [];
            for (let id of ids)
            {
                let actionData:Object = ConfigManager.getInstance().getConfig("action", parseInt(id));
                if (!actionData)continue;
                filters.push(actionData['name']);
            }
            if (filters.indexOf(action) == -1)return;//指令不在配置中，调用无效

            //把可以使用的指令绑定到actor对象上
            for (let act of filters)
            {
                actor.addAction(act);//过滤指令集
            }

            //调用指令
            if (target.length == 0)
            {
                actor[action]();
            }
            else if (target.length == 1)
            {
                actor[action](target[0]);
            }
            else if (target.length == 2)
            {
                actor[action](target[0], target[1]);
            }
        }
        else if (friend instanceof SceneObjectActor)
        {
            let actor:SceneObjectActor = <SceneObjectActor>friend;
            actor.getAction(action)();
            //actor[action]();
        }
    }

    /**
     * 召唤一个可以被command控制的puck
     * @param type:被召唤的友军的类型,这里修改这个类型相当于使用其他技能
     */
    public summon(type:string):void
    {
        let sceneObjectActor:any = this;
        let sceneObject:Person = sceneObjectActor.sceneObject;
        let skillId:number = ConfigManager.getInstance().getSkillIdByType(type);
        if (skillId <= 0)return;
        let skillData:any = ConfigManager.getInstance().getConfig("skill", skillId);
        let dmgrang:number = parseInt(skillData['dmgrange']);
        let x:number = Math.floor(Math.random() * dmgrang);
        let y:number = Math.floor(Math.random() * dmgrang);
        sceneObjectActor.buildXY(type, sceneObject.logicPosition.x + x, sceneObject.logicPosition.y + y, true);
    }
}