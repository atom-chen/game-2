import BaseComponent from "./BaseComponent";
import SceneObjectActor from "../actions/SceneObjectActor";
import Person from "../../view/battlescene/scene/Person";
import World from "../../view/battlescene/world/World";
import PersonTeams from "../../enums/PersonTeams";
import SceneObject from "../../view/battlescene/scene/SceneObject";
import SceneItem from "../../view/battlescene/scene/SceneItem";
/**
 * Created by yaozhiguo on 2017/3/3.
 */
export  default class Find extends BaseComponent
{
    public attach(actor:SceneObjectActor):void
    {
        super.attach(actor);
        actor.addMethod('findNearestEnemy', this.findNearestEnemy);
        actor.addMethod('findNearestFriend', this.findNearestFriend);
        actor.addMethod('findNearest', this.findNearest);
        actor.addMethod('findByType', this.findByType);
        actor.addMethod('findEnemies', this.findEnemies);
        actor.addMethod('findFriendlyMissiles', this.findFriendlyMissiles);
        actor.addMethod('findFriends', this.findFriends);
        actor.addMethod('findHazards', this.findHazards);
        actor.addMethod('findItems', this.findItems);
        actor.addMethod('findNearestItem', this.findNearestItem);
    }

    /**
     * 找到离自己最近的敌人
     * @returns {Person}
     */
    public findNearestEnemy():SceneObjectActor
    {
        let sceneObjectActor:any = this;
        let sceneObject:Person = sceneObjectActor.sceneObject;
        let world:World = sceneObject.gameWorld;

        let result:Person[] = world.findPersonsByViewRange(sceneObject, sceneObject.batterData.viewrange);
        let hostiles:Person[] = _.filter(result, (person)=>{
            if (person.batterData.team === PersonTeams.HOSTILE)return true;
        });
        if (hostiles.length < 1)return null;
        let distance:number = Infinity;
        let findResult:Person = hostiles[0];
        for (let i= 0; i < hostiles.length; i++)
        {
            let tempDistance:number = egret.Point.distance(hostiles[i].logicPosition, sceneObject.logicPosition);
            if (tempDistance < distance)
            {
                distance = tempDistance;
                findResult = hostiles[i];
            }
        }
        let actor:SceneObjectActor = new SceneObjectActor(findResult);
        // new ComponentCreator().attach(actor);
        return actor;
    }

    /**
     * 在候选队伍中选出离自己最近的对象。
     * @param candidates 候选场景元素组
     * @returns {SceneObject}
     */
    public findNearest(candidates:SceneObjectActor[]):SceneObjectActor
    {
        let sceneObjectActor:any = this;
        let sceneObject:SceneObject = sceneObjectActor.sceneObject;
        let result:SceneObjectActor;
        let dis:number = Number.MAX_VALUE;
        for (let i in candidates)
        {
            let candidate:SceneObjectActor = candidates[i];
            let deltaX:number = candidate.sceneObject.x - sceneObject.x;
            let deltaY:number = candidate.sceneObject.y - sceneObject.y;
            let distance:number = deltaX * deltaX + deltaY * deltaY;
            if (distance < dis)
            {
                dis = distance;
                result = candidate;
            }
        }
        return result;
    }

    /**
     * 找出视线内距离最近的道具
     * @returns {SceneObject}
     */
    public findNearestItem():SceneObjectActor
    {
        let sceneObjectActor:any = this;
        let sceneObject:Person = sceneObjectActor.sceneObject;

        let world:World = sceneObject.gameWorld;
        let result:SceneObject[] = world.findAllByViewRange(sceneObject, sceneObject.batterData.viewrange);
        let candidates:SceneObjectActor[] = [];
        for (let i in result)
        {
            if (result[i] instanceof SceneItem)
            {
                var item:SceneItem = <SceneItem>(result[i]);
                if(item.picked==false) candidates.push(new SceneObjectActor(item));
            }
        }
        return this['_methods']['findNearest'].call(this, candidates);
    }

    public findNearestFriend():SceneObjectActor
    {
        let sceneObjectActor:any = this;
        let sceneObject:Person = sceneObjectActor.sceneObject;
        let world:World = sceneObject.gameWorld;

        let result:Person[] = world.findPersonsByRange(sceneObject.logicPosition, sceneObject.batterData.viewrange);
        let pos:number = result.indexOf(sceneObject);//剔除自己
        if (pos != -1)
        {
            result.splice(pos, 1);
        }
        let hostiles:Person[] = _.filter(result, (person)=>{
            if (person.batterData.team === PersonTeams.FRIEND)return true;
        });
        if (hostiles.length < 1)return null;
        let distance:number = Infinity;
        let findResult:Person = hostiles[0];
        for (let i= 0; i < hostiles.length; i++)
        {
            let tempDistance:number = egret.Point.distance(hostiles[i].logicPosition, sceneObject.logicPosition);
            if (tempDistance < distance)
            {
                distance = tempDistance;
                findResult = hostiles[i];
            }
        }
        return new SceneObjectActor(findResult);
    }

    public findByType(type:string):SceneObjectActor[]
    {
        let result:SceneObjectActor[] = [];
        let sceneObjectActor:any = this;
        let sceneObject:Person = sceneObjectActor.sceneObject;
        let world:World = sceneObject.gameWorld;
        let candidates:SceneObject[] = world.findAllByViewRange(sceneObject, sceneObject.batterData.viewrange);
        for (let i in candidates)
        {
            let obj:SceneObject = candidates[i];
            if (obj.getData().findtype === type)
            {
                result.push(new SceneObjectActor(obj));
            }
        }
        return result;
    }

    /**
     * 找出自己视距内所有的敌人。
     * @returns {Array}
     */
    public findEnemies():SceneObjectActor[]
    {
        let sceneObjectActor:any = this;
        let sceneObject:Person = sceneObjectActor.sceneObject;
        let world:World = sceneObject.gameWorld;
        let objs:Person[] = world.findPersonsByRange(sceneObject.logicPosition, sceneObject.batterData.viewrange);
        let result:SceneObjectActor[] = [];
        for (let i in objs)
        {
            let person:Person = objs[i];
            if (person.batterData.team === PersonTeams.HOSTILE)
            {
                result.push(new SceneObjectActor(person));
            }
        }
        return result;
    }

    public findFriendlyMissiles():any[]
    {
        return [];
    }

    public findFriends():SceneObjectActor[]
    {
        let sceneObjectActor:any = this;
        let sceneObject:Person = sceneObjectActor.sceneObject;
        let world:World = sceneObject.gameWorld;
        let objs:Person[] = world.findPersonsByViewRange(sceneObject, sceneObject.batterData.viewrange);
        let result:SceneObjectActor[] = [];
        for (let i in objs)
        {
            let person:Person = <Person>(objs[i]);
            if (person.batterData.team === PersonTeams.FRIEND)
            {
                result.push(new SceneObjectActor(person));
            }
        }
        return result;
    }

    public findHazards():void
    {

    }

    public findItems():SceneObjectActor[]
    {
        let sceneObjectActor:any = this;
        let sceneObject:Person = sceneObjectActor.sceneObject;
        let world:World = sceneObject.gameWorld;

        let result:SceneObject[] = world.findAllByViewRange(sceneObject, sceneObject.batterData.viewrange);
        let candidates:SceneObjectActor[] = [];
        for (let i in result)
        {
            if (result[i] instanceof SceneItem)
            {
                var item:SceneItem = <SceneItem>(result[i]);
                if(item.picked==false) candidates.push(new SceneObjectActor(item));
            }
        }
        return candidates;
    }
}