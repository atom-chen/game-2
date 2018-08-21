import BaseWindow from "../../../base/popup/BaseWindow";
import WindowManager from "../../../base/popup/WindowManager";
import UserInfo from "../../../model/vo/UserInfo";
import DataAccessManager from "../../../base/da/DataAccessManager";
import DataAccessEntry from "../../../model/DataAccessEntry";
import ServerManager from "../../../model/net/NetManager";
import GoalManager from "../../../control/goal/GoalManager";
import UserInfoProxy from "../../../model/da/UserInfoProxy";
import RewardSlot from "./RewardSlot";
import RewardBar from "./RewardBar";
import SceneManager from "../../../manager/SceneManager";
import ExploreWindow from "../../explore/ExploreWindow";
import Globals from "../../../enums/Globals";
import BadgeTipWindow from "../../badge/BadgeTipWindow";
import EquipInfo from "../../../model/vo/EquipInfo";
import SoundManager from "../../../manager/SoundManager";
import BattleScene from "../../battlescene/BattleScene";
import HeroInfo from "../../../model/vo/HeroInfo";
import Protocols from "../../../enums/Protocols";
/**
 * Created by yaozhiguo on 2016/12/13.
 */
export default class BattleResultWindow extends BaseWindow
{
    /**
     * 跳转类型:skipType,只有2种,设置为
     * SKIP_NEXT_LEVEL(true), SKIP_CONTINUE(false);
     */
    public static SKIP_NEXT_LEVEL:boolean = true;
    public static SKIP_CONITNUE:boolean   = false;

    public btnContinue:eui.Button;
    public btnNext:eui.Button;
    public pgbExp:eui.ProgressBar;
    public labLvl:eui.Label;

    public labAward:eui.Image; //显示获取的成就描述
    public grpAward:eui.Group;

    public imgShengli:eui.Image;
    public imgStarBg:eui.Image;

    private _winCb:egret.MovieClip;
    private _winCbReverse:egret.MovieClip;
    private _winStar:egret.MovieClip;
    private _blinkClip:egret.MovieClip;

    private userInfo:UserInfo;

    public constructor(name?:string)
    {
        super(name);
        this.skinName = 'BattleVictorySkin';
        this.userInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
        this.createAnimation();
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        Globals.badgeAwardInfo = null;
        this.addListeners();
        this.updateExp(0);
        this.playAnimation();
        this.labAward.visible = this.checkIfGotAward();
        SoundManager.getInstance().playEffect('u06_score_mp3');
    }

    private storyDataUpdate(event:egret.Event):void
    {
        this.updateExp(event.data.deltaExp);
        this.updateRewards(event.data);
    }

    public set data(value:any)
    {
        this._data = value;
        if (this.checkIfGotAward())return;//已经领取奖励不再发协议。
        ServerManager.getInstance().callServerSocket(Protocols.ROUTE_PLAYSTORY,
            {id:parseInt(this.data.levelID), star:GoalManager.getInstance().star});
        ServerManager.getInstance().addEventListener(UserInfoProxy.STORY_UPDATE_DATA, this.storyDataUpdate, this);
    }

    public get data(): any
    {
        return this._data;
    }

    //监测是否已经领取过本关本星级的奖励
    private checkIfGotAward():boolean
    {
        TDGA.onMissionCompleted(this.data.levelID);
        let achievedStar:number = GoalManager.getInstance().star;
        if (parseInt(this.data.levelID) <= this.userInfo.storyID &&
            this.data.star_level >= achievedStar) return true;
        else    
            return false;       
    }

    private updateExp(deltaExp:number):void
    {
        let previousExp:number = this.userInfo.exp;//本次战斗之前的等级
        let currentExp:number = previousExp + deltaExp;//当前拥有的exp
        let currentLevel:number = UserInfo.levelFromExp(currentExp);//当前拥有的exp所对应的等级，应 >= previousLevel
        let currentLevelExp:number = UserInfo.expForLevel(currentLevel);//当前等级对应的exp

        let nextLevel = currentLevel + 1;
        let nextLevelXP = UserInfo.expForLevel(nextLevel); //下一级对应exp数
        let totalXPNeeded = nextLevelXP - currentLevelExp; //由当前等级升到下一等级所需的exp总数

        this.pgbExp.value = currentExp - currentLevelExp;
        this.pgbExp.maximum = totalXPNeeded;
        this.labLvl.text = 'Lv' + currentLevel;

        this.labAward.visible = false;
        //TDGA.Account.setLevel(currentLevel);
    }

    //奖励界面
    /*{deltaExp:deltaExp,
       deltaEquips:deltaEquips,
       deltaVigor:deltaVigor,
       deltaDiamond:deltaDiamond}*/
    private updateRewards(awardData:any):void
    {
       let star:number = GoalManager.getInstance().star;
        let rewardBar: RewardBar = new RewardBar();//坐标
        rewardBar.x = (this.grpAward.width - rewardBar.width) * 0.5;
        rewardBar.y = (this.grpAward.height - rewardBar.height) * 0.5;
        this.grpAward.addChild(rewardBar);

        if (awardData['deltaExp'] > 0) //exp
        {
            RES.getResByUrl('resource/icon/equip/icon_exp.png', (data, url)=>{
                rewardBar.addAwardSlot(new RewardSlot(data, awardData['deltaExp']));
            }, this);
        }
        if (awardData['deltaVigor'] > 0) //vigor
        {
            RES.getResByUrl('resource/icon/equip/energy.png', (data, url)=>{
                rewardBar.addAwardSlot(new RewardSlot(data, awardData['deltaVigor']));
            }, this);
        }
        if (awardData['deltaDiamond'] > 0) //diamond
        {
            RES.getResByUrl('resource/icon/equip/icon_gem.png', (data, url)=>{
                rewardBar.addAwardSlot(new RewardSlot(data, awardData['deltaDiamond']));
            }, this);
            TDGA.onReward(awardData['deltaDiamond'], '战斗胜利奖励');
        }
        if (awardData['deltaEquips'].length > 0)
        {
            for (let equipInfo of awardData['deltaEquips'])
            {
                //徽章奖励，不显示
                if (equipInfo.data.type == Globals.BADGE_TYPE_PYTHON || equipInfo.data.type == Globals.BADGE_TYPE_JAVASCRIPT)
                {
                    Globals.badgeAwardInfo = equipInfo;
                }
                //其他装备奖励
                else
                {
                    RES.getResByUrl('resource/icon/equip/' + equipInfo.data['icon'] + '.png', (data, url)=>{
                        rewardBar.addAwardSlot(new RewardSlot(data, ''));
                    }, this);
                }
            }
        }
        if (awardData['deltaHeros'].length > 0) //hero
        {
            for (let heroInfo of awardData['deltaHeros'])
            {
                RES.getResByUrl('resource/icon/role/career_head/' + heroInfo.data['career_head'] + '_s.png', (data, url)=>{
                    rewardBar.addAwardSlot(new RewardSlot(data, heroInfo.data['name']));
                }, this);
            }
        }
    }

    //星星动画
    private createAnimation():void
    {
        let achievedStar:number = GoalManager.getInstance().star;
        var mcDataFactory: egret.MovieClipDataFactory =
            new egret.MovieClipDataFactory(RES.getRes('win_' + achievedStar + '_json'), RES.getRes('win_' + achievedStar + '_png'));
        this._winStar = new egret.MovieClip( mcDataFactory.generateMovieClipData('win_star' + achievedStar) );

        var cbDataFactory: egret.MovieClipDataFactory =
            new egret.MovieClipDataFactory(RES.getRes('win_chib_json'), RES.getRes('win_chib_png'));
        this._winCb = new egret.MovieClip(cbDataFactory.generateMovieClipData('win_chib'));
        this._winCbReverse = new egret.MovieClip(cbDataFactory.generateMovieClipData('win_chib'));
        this._winCbReverse.scaleX = -1;

        var blDataFactory: egret.MovieClipDataFactory =
            new egret.MovieClipDataFactory(RES.getRes('win_blingbling_json'), RES.getRes('win_blingbling_png'));
        this._blinkClip = new egret.MovieClip(blDataFactory.generateMovieClipData('win_blingbling'));
    }

    private playAnimation():void
    {
        this.addChild(this._winCb);
        this.addChild(this._winCbReverse);
        this.addChild(this._winStar);
        this.addChild(this._blinkClip);

        this.swapChildren(this._winCb, this.imgShengli);
        this.swapChildren(this._winCbReverse, this.imgShengli);

        this._winCb.x = this.imgShengli.x + 960;
        this._winCb.y = this.imgShengli.y + 80;

        this._winCbReverse.x = 975;
        this._winCbReverse.y = this._winCb.y;

        this._winStar.x = this.imgStarBg.x + 855;
        this._winStar.y = this.imgStarBg.y + 175;

        this._blinkClip.x = this.imgStarBg.x + 850;
        this._blinkClip.y = this.imgStarBg.y + 170;

        this._winCb.play();
        this._winCb.addEventListener(egret.Event.COMPLETE, ()=>{
            this._winStar.play();
        }, this);
        this._winCbReverse.play();
        this._blinkClip.play(-1);
    }

    private addListeners():void
    {
        this.btnContinue.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onContinue, this);
        this.btnNext.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onNext, this);
    }

    private removeListeners():void
    {
        this.btnContinue.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onContinue, this);
        this.btnNext.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onNext, this);
    }

    /**
     * 点击"继续"按钮后的跳转
     * 三种情况考虑:
     *      不同地图  -> 大地图界面(基本不在同一张)
     *      同一组    -> 大地图界面(基本在同一张)
     *      不在同一组->  选关界面
     */
    private onContinue(event:egret.TouchEvent):void
    {
        WindowManager.closeWindow('BattleResultWindow', true);
        let battleScene:BattleScene = <BattleScene>(SceneManager.getInstance().getRunningScene());
        battleScene.battleUI.skip(BattleResultWindow.SKIP_CONITNUE);
        SceneManager.getInstance().popScene();
    }

    /**
     * 点击"下一关"按钮后的跳转
     * 三种情况考虑:
     *      不同地图  -> 大地图界面(基本不在同一张)
     *      同一组    -> 大地图界面(基本在同一张)
     *      不在同一组->  装备界面
     */
    private onNext(event:egret.TouchEvent):void
    {
        WindowManager.closeWindow('BattleResultWindow', true);
        let battleScene:BattleScene = <BattleScene>(SceneManager.getInstance().getRunningScene());
        battleScene.battleUI.skip(BattleResultWindow.SKIP_NEXT_LEVEL);
        SceneManager.getInstance().popScene();
    }

    public onCloseClick(e:egret.TouchEvent):void
    {
        super.onCloseClick(e);
        // document.getElementById('code-area').style.display = 'block';
        SceneManager.getInstance().popScene();
    }

    public dispose():void
    {
        super.dispose();
        this.removeListeners();
        ServerManager.getInstance().removeEventListener(UserInfoProxy.STORY_UPDATE_DATA, this.storyDataUpdate, this);

        this._blinkClip.stop();
        this._blinkClip.movieClipData.spriteSheet.dispose();

        this._winStar.stop();
        this._winStar.movieClipData.spriteSheet.dispose();

        this._winCb.stop();
        this._winCb.movieClipData.spriteSheet.dispose();

        this._winCbReverse.stop();
        this._winCbReverse.movieClipData.spriteSheet.dispose();
    }
}