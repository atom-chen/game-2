import Scene from "../../base/view/Scene";
import World from "./world/World";
import Globals from "../../enums/Globals";
import BattleSceneUI from "../battleui/BattleSceneUI";
import PopUpManager from "../../base/popup/PopUpManager";
import ConfigManager from "../../manager/ConfigManager";
import DataAccessManager from "../../base/da/DataAccessManager";
import DataAccessEntry from "../../model/DataAccessEntry";
import SceneMoveObject from "./scene/SceneMoveObject";
import GoalManager from "../../control/goal/GoalManager";
import SoundManager from "../../manager/SoundManager";
import GuideManager from "../../manager/GuideManager";
import ServerManager from "../../model/net/NetManager";
import Timeout from "../../base/utils/Timeout";
import BattleInfo from "../../model/vo/BattleInfo";
import BattleInfoProxy from "../../model/da/BattleInfoProxy";
import CodeWorkerManager from "../../compile/CodeWorkerManager";
import SceneObjectActor from "../../control/actions/SceneObjectActor";
import UserInfo from "../../model/vo/UserInfo";
import QuestionMessage from "../../model/vo/teach/QuestionMessage";
import FrameTweenLite from "../../base/utils/FrameTweenLite";
import GoalInfo from "../../control/goal/GoalInfo";
import GoalState from "../../control/goal/GoalState";
import Protocols from "../../enums/Protocols";

/**
 * Created by yaozhiguo on 2016/11/10.
 * 战斗场景
 */
export default class BattleScene extends Scene
{
    public static BATTLELOADED:string = "battle_loaded";
    private _heroActor:SceneObjectActor;
    private _world:World;
    private _codeLifeSpan:number;

    private _worldContainer:egret.Sprite;

    private _battleUI:BattleSceneUI;
    private _levelID:number;
    private _battleInfo:BattleInfo;
    private _codeLifeTime:number;//每次代码运行时间限制
    private _uiLock:boolean = false;
    private _userInfo:UserInfo;

    public get battleUI():BattleSceneUI
    {
        return this._battleUI;
    }

    public constructor()
    {
        super();
    }

    public onEnter():void
    {
        super.onEnter();
    }

    public setData(data:any):void
    {
        super.setData(data);
        this._userInfo = data['player_info'];
        this._levelID = parseInt(data['levelID']);
        this._codeLifeSpan = parseInt(ConfigManager.getInstance().getValue('pve_story_level', this._levelID, 'lifespan'));
        this._battleInfo = DataAccessManager.getAccess(DataAccessEntry.BATTLE_INFO_PROXY).data;
        //draw map
        this._worldContainer = new egret.Sprite();
        this._worldContainer.graphics.clear();
        this._worldContainer.graphics.beginFill(0, 0.2);
        this._worldContainer.graphics.drawRect(0, 0, Globals.GAME_WIDTH * Globals.BATTLE_AREA_WIDTH_RATIO, Globals.GAME_HEIGHT);
        this._worldContainer.graphics.endFill();
        this.addChild(this._worldContainer);

        let world:World = new World();
        world.setData(data);
        this._worldContainer.addChild(world);
        this._world = world;

        //ui
        this._battleUI = new BattleSceneUI(data);
        PopUpManager.addPopUp(this._battleUI, false);
        this._battleUI.addEventListener(BattleSceneUI.RUN_TOUCH_TAP, this.onRunBtnTouch, this);
        this._battleUI.addEventListener(BattleSceneUI.BTN_ZOOM_IN, this.onZoominTouch, this);
        this._battleUI.addEventListener(BattleSceneUI.BTN_ZOOM_OUT, this.onZoomoutTouch, this);
        this._battleUI.miniScale = Math.max(Globals.GAME_WIDTH * Globals.BATTLE_AREA_WIDTH_RATIO/this._world.getWidth(),Globals.GAME_HEIGHT/this._world.getHeight());
        ServerManager.getInstance().addEventListener(BattleInfoProxy.USER_CODE_CHANGED, this.onGetUserCode, this);
        this.onWorldComplete();
    }

    private onZoominTouch(event:egret.TouchEvent):void
    {
        this._world.camera.zoom(event.data);
    }

    private onZoomoutTouch(event:egret.TouchEvent):void
    {
        this._world.camera.zoom(event.data);
    }

    //点击运行按钮
    private onRunBtnTouch(event:egret.TouchEvent):void
    {
        if (this._battleUI.codeFreeze)
        {
            this.fightPause();
        }
        else
        {
            this.fightStart();
        }
    }

    private onWorldComplete():void
    {
        this.createCodeRuntime();
        this._world.addEventListener(SceneMoveObject.HERO_HP, this.onHeroHpChanged, this);
        this._world.addEventListener(World.HERO_CLICKED, this.insertSpecificName, this);
        GoalManager.getInstance().addEventListener(GoalManager.GOAL_WORLD_END, this.stopFightGracefully, this);
        GuideManager.getInstance().startByLevel(this._levelID, 1);
        if (this.getData()['teach_info'])//教学关卡
        {
            let requestMsg:QuestionMessage = this.getData()['teach_info'];
            CodeWorkerManager.getUserThread().setEditorText(requestMsg.code);
        }
        else//正常关卡
        {
            if (this.getData()['level_code'])//传入了教学代码
            {
                CodeWorkerManager.getUserThread().setEditorText(this.getData()['level_code']);
            }
            else
            {
                ServerManager.getInstance().callServerSocket(Protocols.ROUTE_GET_STORY_CODE, {storyid:this._levelID});
            }
        }
        this.battleUI.showGoalPatrol();
    }

    private insertSpecificName(e)
    {
        console.log(e.data);
        //CodeWorkerManager.getUserThread().insertEditorText(e.data);
    }
    private onGetUserCode(event:egret.Event):void
    {
        CodeWorkerManager.getUserThread().setEditorText(this._battleInfo.userCode);
    }

    private createCodeRuntime():void
    {
        this._heroActor = new SceneObjectActor(this._world.hero);
        CodeWorkerManager.init(this._heroActor);
        CodeWorkerManager.getUserThread().init();
        CodeWorkerManager.getUserThread().setEditorText(RES.getRes(this._levelID + "_code_txt"));
        CodeWorkerManager.getUserThread().addEventListener('EditEvent', ()=>{
            let guideData:Object = GuideManager.getInstance().currentGuideData;
            if (!guideData)return;
            if (guideData['guide_type'] == '1')GuideManager.getInstance().next();
        }, this);
        //预先运行后台脚本
        CodeWorkerManager.getInjectTread().setCode(RES.getRes(this._levelID + "_script_js"));
        CodeWorkerManager.getInjectTread().onSetupLevel();

        this.configActions();
        // this.testConfigActions();

        //用户代码执行完毕
        CodeWorkerManager.setUserCompleteCallback(()=>{
            this._battleUI.codeDone();
        }, this);
    }

    private configActions():void
    {
        let actions:string[] = this._userInfo.getHeroActionNames();
        let filterMethods:string[] = ['hp', 'pos', 'type', 'MP', 'say', 'dropMP'];
        for (let index in actions)
        {
            let action:string = actions[index];
            if (!action)continue;
            if (filterMethods.indexOf(action) != -1)continue;
            CodeWorkerManager.getUserThread().actor.addAction(action);
        }
    }

    private testConfigActions():void
    {
        let actions:any = ConfigManager.getInstance().getConfigs("action");
        let filterMethods:string[] = ['hp', 'pos', 'type', 'MP', 'say', 'dropMP'];
        for (let index in actions)
        {
            let action:Object = actions[index];
            if (!action)continue;
            if (filterMethods.indexOf(action['name']) != -1)continue;
            CodeWorkerManager.getUserThread().actor.addAction(action['name']);
        }
    }

    private onHeroHpChanged(event:egret.Event):void
    {
        let data = event.data;
        this._battleUI.updateHeroHp(100 * data.hp / data.maxhp, 100);
        if (data.hp <= 0)
        {
            this.stopFightGracefully(4);
        }
    }

    //目前有三种情况下结束战斗：英雄死亡，到达终点，到达战斗时间限制。战斗结束，先停止代码，然后待动画完成
    private stopFightGracefully(param:any):void
    {
        let duration:number = _.isNumber(param) ? param : param.data;
        CodeWorkerManager.getUserThread().stop();//停止代码运行
        CodeWorkerManager.getInjectTread().stop();
        this._uiLock = true;
        FrameTweenLite.delayedCall(duration, ()=>{
            this._uiLock = false;
            this._world.stopPlay(); //停止world
            GoalManager.getInstance().stop(); //停止目标检查
            GoalManager.getInstance().checkPositives();
            this._battleUI.codeDone();//UI按钮状态，目标框移出

            GuideManager.getInstance().startByLevel(this._levelID, 2);

            let goals:GoalInfo[] = GoalManager.getInstance().currentGoals;
            for (let goal of goals)
            {
                if (goal.state == GoalState.SUCCESS)
                {
                    TDGA.onMissionCompleted(goal.data.name);
                }
                else
                {
                    TDGA.onMissionFailed(goal.data.name, 'failed');
                }
            }
        });
    }

    /*private onWorldEndAfter(event:egret.Event):void
    {
        this.stopFightLogic();
        FrameTweenLite.delayedCall(5, ()=>{
            this.stopFightAnimation();
        });
    }*/

    //重置战斗状态
    public fightReload():void
    {
        CodeWorkerManager.getUserThread().stop();
        CodeWorkerManager.getUserThread().setEditorText(RES.getRes(this._levelID + "_code_txt"));
        CodeWorkerManager.getInjectTread().stop();
        CodeWorkerManager.getInjectTread().onSetupLevel();
    }

    /*public fightFinish():void
    {
        CodeWorkerManager.getUserThread().stop();
        CodeWorkerManager.getInjectTread().stop();
        GoalManager.getInstance().stop();
        GoalManager.getInstance().checkPositives();
        this._battleUI.codeDone();
        this._world.stopPlay();
    }*/

    public fightPause():void
    {
        if (this._uiLock)return;
        if(this._world.hero.batterData.hp>0) this._world.hero.idle();
        this._heroActor.lock();
        CodeWorkerManager.getUserThread().stop();
        CodeWorkerManager.getInjectTread().stop();
        GoalManager.getInstance().stop();
        this._world.stopPlay();
        Timeout.clearTimeout(this._codeLifeTime);
    }

    public fightStart():void
    {
        if (this._uiLock)return;
        //目标状态重置
        FrameTweenLite.killAll();
        this._heroActor.unlock();
        //代码运行的时间限制，by second
        this._world.startPlay();
        CodeWorkerManager.getUserThread().runCode();
        CodeWorkerManager.getInjectTread().onFirstFrame();
        CodeWorkerManager.getInjectTread().runCode();
        this._battleUI.updateHeroHp(100, 100);
        GoalManager.getInstance().reset();
        GoalManager.getInstance().setSceneObject(this._world.hero);
        GoalManager.getInstance().start();
        //战斗时间限制
        Timeout.clearTimeout(this._codeLifeTime);
        this._codeLifeTime = Timeout.setTimeout(()=>{
            this.stopFightGracefully(2);
        }, this, this._codeLifeSpan * 1000);
        //保存用户代码
        ServerManager.getInstance().callServerSocket(Protocols.ROUTE_SAVE_STORY_CODE,
            {id:this._battleInfo.codeId, code:CodeWorkerManager.getUserThread().getEditorText()});
    }

    public dispose():void
    {
        //保存用户代码
        FrameTweenLite.killAll();
        ServerManager.getInstance().callServerSocket(Protocols.ROUTE_SAVE_STORY_CODE,
            {id:this._battleInfo.codeId, code:CodeWorkerManager.getUserThread().getEditorText()});
        let levelBgm:string = this.getData()['level_bgm'];
        if (levelBgm && levelBgm.length > 0)SoundManager.getInstance().stop(levelBgm + '_mp3');
        SoundManager.getInstance().playMusic('ui_mp3', 0, 0);
        Timeout.clearTimeout(this._codeLifeTime);
        // Timeout.clearTimeout(this._fightFinishDelay);
        RES.destroyRes('battle');
        RES.destroyRes('battlescene');
        RES.destroyRes('battleContent');
        this._battleUI.removeEventListener(BattleSceneUI.RUN_TOUCH_TAP, this.onRunBtnTouch, this);
        this._battleUI.removeEventListener(BattleSceneUI.BTN_ZOOM_IN, this.onZoominTouch, this);
        this._battleUI.removeEventListener(BattleSceneUI.BTN_ZOOM_OUT, this.onZoomoutTouch, this);
        this._battleUI.dispose();
        PopUpManager.removePopUp(this._battleUI);
        CodeWorkerManager.release();
        this._world.removeEventListener(SceneMoveObject.HERO_HP, this.onHeroHpChanged, this);
        this._world.dispose();
        this._worldContainer.removeChild(this._world);
        this._world = null;
        this._worldContainer.graphics.clear();
        this.removeChild(this._worldContainer);
        this._worldContainer = null;
        GoalManager.getInstance().stop();
        GoalManager.getInstance().removeEventListener(GoalManager.GOAL_WORLD_END, this.stopFightGracefully, this);
        ServerManager.getInstance().removeEventListener(BattleInfoProxy.USER_CODE_CHANGED, this.onGetUserCode, this);
    }
}