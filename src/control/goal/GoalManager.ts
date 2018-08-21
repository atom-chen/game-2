import GoalInfo from "./GoalInfo";
import IEventDispatcher = egret.IEventDispatcher;
import ConfigManager from "../../manager/ConfigManager";
import GoalState from "./GoalState";
import SceneObject from "../../view/battlescene/scene/SceneObject";
import World from "../../view/battlescene/world/World";
import Person from "../../view/battlescene/scene/Person";
import Hero from "../../view/battlescene/scene/Hero";
import Interval from "../../base/utils/Interval";
import CodeWorkerManager from "../../compile/CodeWorkerManager";
/**
 * Created by yaozhiguo on 2016/12/14.
 */
export default class GoalManager extends egret.EventDispatcher
{
    /**目标类型
    1	某人抵达某地
    2	阻止某人到某地
    3	多人存活
    4	消灭某人
    5	某人拾取某物
    6	阻止某人拾取某物
    7	有效代码行数限制
    8	特定代码语句要求
    9   呼唤队友
    10  英雄MP是否到某个数
    */
    public static REACH_POINT:number = 1;
    public static NOT_REACH_POINT:number = 2;
    public static GROUP_ALIVE:number = 3;
    public static DESTROY_PERSON:number = 4;
    public static PICK_UP_ITEM:number = 5;
    public static NOT_PICK_UP_ITEM:number = 6;
    public static CODE_LINE_LIMIT:number = 7;
    public static CODE_CONTENT:number = 8;
    public static CALL_GROUP_TO_POINT:number = 9;
    public static MP_LIMIT:number = 10;


    public static GOAL_STATE_CHANGED:string = 'goal_state_changed';
    public static GOAL_STATE_INITIALIZED:string = 'goal_state_initialized';
    public static GOAL_WORLD_END:string = 'goal_world_end';

    private _keyGoals:GoalInfo[];      //关键目标，只要有一个未达成，就不能判定胜利；每个关卡至少有一个关键目标
    private _positiveGoals:GoalInfo[]; //初始为正向状态(起始默认是已完成状态)的目标
    private _negativeGoals:GoalInfo[]; //初始为负向状态(起始默认是未完成状态)的目标
    private _sceneObject:SceneObject;

    /**
     * 战斗是否取得胜利
     * @returns {boolean}
     */
    public get win():boolean
    {
        for (let i in this._keyGoals)
        {
            if (this._keyGoals[i].state != GoalState.SUCCESS)
            {
                return false;
            }
        }
        return true;
    }

    /**
     * 返回战斗获得的星级评价
     * @returns {number}
     */
    public get star():number
    {
        let result:number = 0;
        if (!this.win)//只要失败，星级一定是0
        {
            return result;
        }
        if (this.win)
        {
            result = 1;
        }
        let cs = this._positiveGoals.concat(this._negativeGoals);
        let finishedCount:number = 0;
        for (let i in cs)
        {
            if (cs[i].state === GoalState.SUCCESS)
            {
                finishedCount ++;
            }
        }
        if (finishedCount / cs.length >= 2 / 3)
        {
             result ++;
        }
        if (finishedCount / cs.length === 1)
        {
            result ++;
        }
        return result;
    }

    public get currentGoals():GoalInfo[]
    {
        return this._positiveGoals.concat(this._negativeGoals);
    }

    private static _instance:GoalManager;

    public static getInstance():GoalManager
    {
        if (!GoalManager._instance)
        {
            GoalManager._instance = new GoalManager();
        }
        return GoalManager._instance;
    }

    public setSceneObject(sceneObject:SceneObject):void
    {
        this._sceneObject = sceneObject;
    }

    public dispose():void
    {
        this._keyGoals = null;
        this._positiveGoals = null;
        this._negativeGoals = null;
        this._sceneObject = null;
        Interval.clearInterval(this._interval);
    }

    /**
     * 重置目标状态。每次运行代码之前都会调用，所以一次战斗可能会被调用多次。
     */
    public reset():void
    {
        let cs = this._positiveGoals.concat(this._negativeGoals);
        for (let i in cs)
        {
            this.setGoalInitState(cs[i]);
        }
        this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, cs));
    }

    /**
     * 初始化目标管理。每次进入战斗只调用一次。
     */
    public init(currentLevel:number):void
    {
        this._positiveGoals = [];
        this._negativeGoals = [];
        this._keyGoals = [];

        //let userInfo:UserInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
        let levelData:any = ConfigManager.getInstance().getConfig('pve_story_level', currentLevel);
        let goals:string[] = levelData['goal1'].split('|');

        for (let i = 0; i < goals.length; i++)
        {
            let goalId:number = parseInt(goals[i]);
            let goalInfo:GoalInfo = new GoalInfo();
            let goalData = ConfigManager.getInstance().getConfig('pve_story_level_goal', goalId);
            goalInfo.data = goalData;
            goalInfo.whos;goalInfo.targets;

            this.setGoalInitState(goalInfo);

            if (goalInfo.targetAllHit && goalInfo.whoAllHit)
                this._positiveGoals.push(goalInfo);
            else
                this._negativeGoals.push(goalInfo);

            if(parseInt(goalData['optional']) === 0) //关键目标
            {
                this._keyGoals.push(goalInfo);
            }
        }
        console.assert(this._keyGoals.length > 0, '关键目标不能没有！！！');

        this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_INITIALIZED, false, false,
            this._positiveGoals.concat(this._negativeGoals)));
    }

    /**
     * 循环监测目标状态
     */
    public check():void
    {
        for (let i in this._positiveGoals)
        {
            this.checkType(this._positiveGoals[i]);
        }
        for (let i in this._negativeGoals)
        {
            this.checkType(this._negativeGoals[i]);
        }
    }

    /**
     * 设置目标的初始状态，初始为已完成状态的目标置defaultHit为true；反之是false；
     * 同时把所有目标的state设置为FAILED。
     * @param goalInfo
     */
    private setGoalInitState(goalInfo:GoalInfo):void
    {
        switch (parseInt(goalInfo.data.type))
        {
            case GoalManager.REACH_POINT:
            case GoalManager.DESTROY_PERSON:
            case GoalManager.PICK_UP_ITEM:
            case GoalManager.CODE_LINE_LIMIT:
            case GoalManager.CODE_CONTENT:
            case GoalManager.CALL_GROUP_TO_POINT:
            case GoalManager.MP_LIMIT:
            {
                goalInfo.whoAllHit = false;
                goalInfo.targetAllHit = false;
                break;
            }
            case GoalManager.NOT_REACH_POINT:
            case GoalManager.GROUP_ALIVE:
            case GoalManager.NOT_PICK_UP_ITEM:
            {
                goalInfo.whoAllHit = true;
                goalInfo.targetAllHit = true;
                break;
            }
        }
        goalInfo.state = GoalState.FAILED;
    }

    private checkType(goalInfo:GoalInfo):void
    {
        switch (parseInt(goalInfo.data.type))
        {
            case GoalManager.REACH_POINT:
            {
                this.checkReachPoint(goalInfo);
                break;
            }
            case GoalManager.NOT_REACH_POINT:
            {
                this.checkNotReachPoint(goalInfo);
                break;
            }
            case GoalManager.GROUP_ALIVE:
            {
                this.checkGroupAlive(goalInfo);
                break;
            }
            case GoalManager.DESTROY_PERSON:
            {
                this.checkPersonDestroyed(goalInfo);
                break;
            }
            case GoalManager.PICK_UP_ITEM:
            {
                this.checkPickedItem(goalInfo);
                break;
            }
            case GoalManager.NOT_PICK_UP_ITEM:
            {
                this.checkPreventPickedItem(goalInfo);
                break;
            }
            case GoalManager.CODE_LINE_LIMIT:
            {
                this.checkCodeLine(goalInfo);
                break;
            }
            case GoalManager.CODE_CONTENT:
            {
                this.checkCodeContent(goalInfo);
                break;
            }
            case GoalManager.CALL_GROUP_TO_POINT:
            {
                this.checkGroupToPoint(goalInfo);
                break;
            }
            case GoalManager.MP_LIMIT:
            {
                this.checkMpLimit(goalInfo);
                break;
            }
        }
    }

    private _interval:number = 0;

    public start():void
    {
        if (this._interval)
        {
            Interval.clearInterval(this._interval);
        }
        this._interval = Interval.setInterval(()=>{
            this.check();
        }, this, 100);
    }

    public stop():void
    {
        Interval.clearInterval(this._interval);
    }

    /**
     * 检测正向任务是否完成。
     */
    public checkPositives():void
    {
        for (let i in this._positiveGoals)
        {
            if (this._positiveGoals[i].whos.length > 0 && this._positiveGoals[i].whoAllHit)
            {
                this._positiveGoals[i].state = GoalState.SUCCESS;
                this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, this._positiveGoals[i]));
            }
            if (this._positiveGoals[i].targets.length > 0 && this._positiveGoals[i].targetAllHit)
            {
                this._positiveGoals[i].state = GoalState.SUCCESS;
                this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, this._positiveGoals[i]));
            }
        }
    }

    /**
     * ---------------------------------------- implements -------------------------------------------------------------
     */

    //监测某个对象是否到达目标点
    private checkReachTarget(who:SceneObject, target:string, world:World):boolean
    {
        let reach:boolean = false;
        if (target === 'exit') //目标是终点
        {
            // reach = world.endPoint.equals(who.logicPosition);
            reach = world.exitArea.contains(who.logicPosition.x, who.logicPosition.y);
        }
        else//目标是某个指定的地图点
        {
            if(world.getAreaByID(target)) reach = world.getAreaByID(target).contains(who.x, who.y);
        }
        return reach;
    }

    //--------------------- negatives, once succeed, modifies the default state and FINISH --------------------------
    //某人抵达多地
    private checkReachPoint(goalInfo:GoalInfo):void
    {
        if (goalInfo.targetAllHit)return;
        let world:World = this._sceneObject.gameWorld;
        let whoName:string = goalInfo.whos[0];
        let who = world.getSceneObjectByName(whoName);
        console.assert(who != null && who != void 0, '目标对象不能为空！');
        for (let target of goalInfo.targets)
        {
            if (this.checkReachTarget(who, target, world))
            {
                goalInfo.targetMarkers[target] = true;
            }
        }
        if (goalInfo.targetAllHit)
        {
            goalInfo.state = GoalState.SUCCESS;
            this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, goalInfo));
        }
    }

    //消灭多人
    private checkPersonDestroyed(goalInfo:GoalInfo):void
    {
        if (goalInfo.whoAllHit)return;
        let world:World = this._sceneObject.gameWorld;
        for (let whoName of goalInfo.whos)
        {
            let who = <Person>world.getSceneObjectByName(whoName);
            if (!who)continue;
            if (who.batterData.hp <= 0)
            {
                goalInfo.whoMarkers[whoName] = true;
            }
        }
        if (goalInfo.whoAllHit)
        {
            goalInfo.state = GoalState.SUCCESS;
            this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, goalInfo));
        }
    }

    //某人拾取某些物品
    private checkPickedItem(goalInfo:GoalInfo):void
    {
        if (goalInfo.targetAllHit)return;
        let hero:Hero = <Hero>(this._sceneObject);
        for (let target of goalInfo.targets)
        {
            if (hero.getPickedItems().indexOf(target) != -1)
            {
                goalInfo.targetMarkers[target] = true;
            }
        }
        if (goalInfo.targetAllHit)
        {
            goalInfo.state = GoalState.SUCCESS;
            this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, goalInfo));
        }
    }

    //召唤一群人到某个地点
    private checkGroupToPoint(goalInfo:GoalInfo):void
    {
        if (goalInfo.whoAllHit)return;
        let world:World = this._sceneObject.gameWorld;
        let targetName:string = goalInfo.targets[0];
        for (let whoName of goalInfo.whos)
        {
            let who = <Person>(world.getSceneObjectByName(whoName));
            if (!who)continue;
            if (this.checkReachTarget(who, targetName, world))
            {
                goalInfo.whoMarkers[whoName] = true;
            }
        }
        if (goalInfo.whoAllHit)
        {
            goalInfo.state = GoalState.SUCCESS;
            this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, goalInfo));
        }
    }

    private checkMpLimit(goalInfo:GoalInfo):void
    {
        if (goalInfo.targetAllHit)return;
        let world:World = this._sceneObject.gameWorld;
        for (let i:number = 0; i < goalInfo.whos.length - 1; i++)
        {
            let whoName:string = goalInfo.whos[i];
            let who:Person = <Person>(world.getSceneObjectByName(whoName));
            if (who.batterData.mp >= parseInt(goalInfo.targets[i]))
            {
                goalInfo.targetMarkers[whoName] = true;
            }
        }
        if (goalInfo.targetAllHit)
        {
            goalInfo.state = GoalState.SUCCESS;
            this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, goalInfo));
        }
    }

    //------------------- positives, once failed, modifies the default state ---------------------------
    //阻止某人到某些地方
    private checkNotReachPoint(goalInfo:GoalInfo):void
    {
        if (!goalInfo.targetAllHit)return;
        let world:World = this._sceneObject.gameWorld;
        let whoName:string = goalInfo.whos[0];
        let who = world.getSceneObjectByName(whoName);
        console.assert(who != null && who != void 0, '目标对象不能为空！');
        for (let target of goalInfo.targets)
        {
            if (this.checkReachTarget(who, target, world))
            {
                goalInfo.targetMarkers[target] = false;
            }
        }
        if (!goalInfo.targetAllHit)
        {
            goalInfo.state = GoalState.FAILED;
            this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, goalInfo));
        }
    }

    //多个人存活
    private checkGroupAlive(goalInfo:GoalInfo):void
    {
        if (!goalInfo.whoAllHit)return;
        let world:World = this._sceneObject.gameWorld;
        if(world)
        {
            for (let whoName of goalInfo.whos) {
                let who = <Person>world.getSceneObjectByName(whoName);
                if (!who)continue;
                if (who.batterData.hp <= 0) 
                {
                    goalInfo.whoMarkers[whoName] = false;
                }
            }
            if (!goalInfo.whoAllHit) {
                goalInfo.state = GoalState.FAILED;
                this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, goalInfo));
            }
        }
    }

    //阻止某人拾取某物
    private checkPreventPickedItem(goalInfo:GoalInfo):void
    {
        if (!goalInfo.targetAllHit)return;
        let hero:Hero = <Hero>(this._sceneObject);
        for (let target of goalInfo.targets)
        {
            if (hero.getPickedItems().indexOf(target) != -1)
            {
                goalInfo.targetMarkers[target] = false;
            }
        }
        if (!goalInfo.targetAllHit)
        {
            goalInfo.state = GoalState.FAILED;
            this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, goalInfo));
        }
    }

    //有效代码行数限制
    private checkCodeLine(goalInfo:GoalInfo):void
    {
        if (goalInfo.state == GoalState.SUCCESS)return;
        let effectiveLine:number = CodeWorkerManager.getUserThread().getEffectiveCodeLine();
        let codeLineLimit:number = parseInt(goalInfo.data['codeline']);
        if (codeLineLimit > 0)
        {
            if (effectiveLine <= codeLineLimit)//超出限制
            {
                 goalInfo.state = GoalState.SUCCESS;
            }
            this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, goalInfo));
        }
    }

    //特定代码语句要求
    private checkCodeContent(goalInfo:GoalInfo):void
    {
        if (goalInfo.state == GoalState.SUCCESS)return;
        let userCode:string = CodeWorkerManager.getUserThread().getEditorText();
        if (userCode.length <= 1)return;
        let result:boolean = true;
        for (let target of goalInfo.targets)
        {
            if (userCode.indexOf(target) == -1)//找不到关键词
            {
                result = false;
            }
        }
        if (result)
        {
            goalInfo.state = GoalState.SUCCESS;
            this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, goalInfo));
        }
        /*if (!goalInfo.targetAllHit)return;
        let userCode:string = CodeWorkerManager.getUserThread().getEditorText();
        if (userCode.length <= 1)return;
        for (let target of goalInfo.targets)
        {
            if (userCode.indexOf(target) == -1)//找不到关键词
            {
                goalInfo.targetMarkers[target] = false;
            }
        }
        if (!goalInfo.targetAllHit)//由于在起始状态下，每个target都是true，因此只要有一个要求不满足，就意味着失败
        {
            goalInfo.state = GoalState.FAILED;
            this.dispatchEvent(new egret.Event(GoalManager.GOAL_STATE_CHANGED, false, false, goalInfo));
        }*/
    }
}