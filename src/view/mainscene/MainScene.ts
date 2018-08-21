import Scene from "../../base/view/Scene";
import LoginProxy from "./../../model/da/LoginProxy";
import UserInfo from "../../model/vo/UserInfo";
import HUDPanel from "./HUDPanel";
import MainToolBtn from "./MainToolBtn";
import ExploreWayBtn from "./ExploreWayBtn";
import GeekWayBtn from "./GeekWayBtn";
import ArenaBtn from "./ArenaBtn";
import NetManager from "../../model/net/NetManager";
import ExploreWindow from "../explore/ExploreWindow";
import WindowManager from "../../base/popup/WindowManager";
import GuideManager from "../../manager/GuideManager";
import FrameTweenLite from "../../base/utils/FrameTweenLite";
import SoundManager from "../../manager/SoundManager";
import ConfigManager from "../../../src/manager/ConfigManager";
import Platform from "../../platforms/Platform";
import BattleStartLoading from "../loading/BattleStartLoading";
import EquipInfo from "../../model/vo/EquipInfo";
import HeroInfo from "../../model/vo/HeroInfo";
import UIPopupLoading from "../loading/UIPopupLoading";
import LayerManager from "../../manager/LayerManager";
import UserInfoProxy from "../../model/da/UserInfoProxy";
import Globals from "../../enums/Globals";
import Protocols from "../../enums/Protocols";
import MaliPlatform from "../../platforms/MaliPlatform";
import CreditsWindow from "../mainsceneui/CreditsWindow";
/**
 * Created by yaozhiguo on 2016/11/10.
 * 主场景
 */
export default class MainScene extends Scene
{
    private hudPanel: HUDPanel;
    private mainToolBtns: MainToolBtn;
    private exploreWayBtn: ExploreWayBtn;
    private geekWayBtn: GeekWayBtn;
    private arenaBtn: ArenaBtn;
    private userInfo: UserInfo;
    private btnCredit:eui.Button;

    private user_carrer_figure:eui.Image;

    public constructor()
    {
        super();
        this.skinName = 'MainSceneSkin';
    }

    public setData(dat:any)
    {
        NetManager.getInstance().addEventListener(LoginProxy.LOGIN_DATA,this.onLoginData, this);
        NetManager.getInstance().callServerSocket(Protocols.ROUTE_LOGIN, {
            name:Platform.currentPlatform.platformName || '玩家',
            classId:(<MaliPlatform>(Platform.currentPlatform)).classId
        });
    }

    protected childrenCreated()
    {
        super.childrenCreated();

        // this.getCurrLevelInfo();

        //HUD
        this.hudPanel = new HUDPanel();
        this.addChild( this.hudPanel );

        //探险之路
        this.exploreWayBtn = new ExploreWayBtn();
        this.addChild( this.exploreWayBtn );
        this.exploreWayBtn.x = 2217;
        this.exploreWayBtn.y = 140;
        // this.exploreWayBtn.setCurrLevelTip("7-13");

        FrameTweenLite.to(this.exploreWayBtn,0.3,{x:1017});

        //极客之旅
        this.geekWayBtn = new GeekWayBtn();
        this.addChild( this.geekWayBtn );
        this.geekWayBtn.x = 2217;
        this.geekWayBtn.y = 140 + 240;
        FrameTweenLite.to(this.geekWayBtn,0.3,{delay:0.15,x:1017});

        //竞技场
        this.arenaBtn = new ArenaBtn();
        this.addChild( this.arenaBtn );
        this.arenaBtn.x = 2217;
        this.arenaBtn.y = 140 + 240 + 240;
        FrameTweenLite.to(this.arenaBtn,0.3,{delay:0.3,x:1017});

        //下方功能按钮
        this.mainToolBtns = new MainToolBtn();
        this.addChild( this.mainToolBtns );
        this.mainToolBtns.x = 1024;
        this.mainToolBtns.y = 912;

        //下方功能按钮,注册监听
        this.initListeners();

        NetManager.getInstance().addEventListener(UserInfoProxy.HERO_CHANGED, this.onUserInfoUpdate, this);
    }

    private onUserInfoUpdate(e:egret.Event)
    {
        let heroInfo:HeroInfo = e.data;
        if (!this.userInfo) return;

        this.user_carrer_figure.source = 'resource/icon/role/career_figure/' + heroInfo['data']['career_figure'] + '.png';
    }

    public onLoginData(event:egret.Event):void
    {
        NetManager.getInstance().removeEventListener(LoginProxy.LOGIN_DATA, this.onLoginData, this);

        //update the current view with userinfo
        this.userInfo = event.data;

        this.hudPanel.update(this.userInfo);
        this.exploreWayBtn.setCurrLevelTip( this.getCurrLevelInfo( this.userInfo ) );
        this.mainToolBtns.btnTeacher.visible = this.userInfo.isTeacher;
        
        this.user_carrer_figure.source = 'resource/icon/role/career_figure/' + this.userInfo['ownedHero']['data']['career_figure'] + '.png';

        if (!Globals.guide)return;
        //guide
        if (!GuideManager.getInstance().finishGuideLevel())
        {
            // WindowManager.showWindow(GuideCheckWindow, 'GuideCheckWindow');
            this.enterGuideLevel();
        }
        else
        {
            GuideManager.getInstance().startByLevel(this.userInfo.storyID, 0);
        }
    }

    private initListeners() :void
    {
        this.touchEnabled = this.touchChildren = true;
        this.exploreWayBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnExploreWayTouchHandler, this);
        this.btnCredit.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCredit, this);
    }

    private onBtnExploreWayTouchHandler(e:egret.TouchEvent):void
    {
        SoundManager.getInstance().playEffect('u01_button_mp3');
        FrameTweenLite.to(this.exploreWayBtn,0.22,{x:2100});
        FrameTweenLite.to(this.geekWayBtn,0.22,{delay:0.15,x:2100});
        FrameTweenLite.to(this.arenaBtn,0.22,{delay:0.3,x:2100});
        LayerManager.stage.addEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterPopup, this);
        UIPopupLoading.startPopupLoading(["explore"]);
    }

    private onEnterPopup(e:egret.TouchEvent):void
    {
        this.stage.removeEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterPopup, this);
        WindowManager.showWindow( ExploreWindow, "ExploreWindow", "地图界面", this.userInfo );
        FrameTweenLite.killTweensOf(this.exploreWayBtn);
        FrameTweenLite.killTweensOf(this.geekWayBtn);
        FrameTweenLite.killTweensOf(this.arenaBtn);
        this.exploreWayBtn.x = 1017;
        this.geekWayBtn.x = 1017;
        this.arenaBtn.x = 1017;
    }

    private getCurrLevelInfo(userInfo:UserInfo)
    {
        let chapter_config = ConfigManager.getInstance().getConfigs('pve_story_map');
        let group_config   = ConfigManager.getInstance().getConfigs('pve_story_group');
        let level_config   = ConfigManager.getInstance().getConfigs('pve_story_level');
        
        let retain_level_index = userInfo['storyID'];
        let retain_group_index = level_config[ retain_level_index ]['group'];
        let retain_chapter_index=level_config[ retain_level_index ]['map'];

        let chapter_chunck = Object.keys( chapter_config ).indexOf( retain_chapter_index ) + 1;
        var levels = [];
        for(let levelId in level_config)
        {
            if(level_config[levelId]['map'] == retain_chapter_index)
            {
                levels.push( levelId );
            }
        }

        let level_chunck = (levels.indexOf( retain_level_index.toString() ) + 1);
        return chapter_chunck + "-" + level_chunck;
    }

    private removeListeners() :void
    {
        this.touchEnabled = this.touchChildren = false;
        this.exploreWayBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnExploreWayTouchHandler, this);
        this.btnCredit.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onCredit, this);
    }

    private onCredit(event:egret.TouchEvent):void
    {
        WindowManager.showWindow(CreditsWindow, 'CreditsWindow');
    }

    public dispose():void
    {
        this.removeListeners();
    }

    //进入引导关卡，数据都是临时的
    private enterGuideLevel():void
    {
        let level:Object = ConfigManager.getInstance().getConfig('pve_story_level', 110000);

        let userInfo:UserInfo = new UserInfo();
        let data:any = {
            user:{
                activate:0,
                coin:0,
                diamond:0,
                exp:0,
                hid:55,
                id:264,
                level:1,
                mid:1001,
                name:'namePlayer',
                storyID:110000
            },
            /**
             * 主手：
             10100 雷霆法杖
             护甲：
             12101 旅者法袍
             芯片：
             13001 逻辑芯片β
             罗盘
             14004 精金罗盘
             */
            equips:[
                {
                    id:130,
                    mid:10100,
                    uid:264
                },
                {
                    id:131,
                    mid:12101,
                    uid:264
                },
                {
                    id:132,
                    mid:13001,
                    uid:264
                },
                {
                    id:133,
                    mid:14004,
                    uid:264
                },
            ],
            heros:[
                {
                    exp:0,
                    id:55,
                    mid:30002,
                    item1:130,
                    item2:0,
                    item3:131,
                    item4:132,
                    item5:133,
                    item6:0,
                    item7:0,
                    item8:0,
                    uid:264
                }
            ]
        };
        let resInfo:any = data.user;                                       //保存自身数据，频繁调用
        userInfo.uuid = parseInt(resInfo["id"]);
        userInfo.exp = parseInt(resInfo['exp']);
        userInfo.diamond = parseInt(resInfo['diamond']);
        userInfo.level = parseInt(resInfo['level']);
        userInfo.nickName = resInfo['name'];
        userInfo.vigor = parseInt(resInfo['physical']);
        userInfo.serverTime = parseFloat(resInfo['createTime']);
        userInfo.coin = parseInt(resInfo['coin']);
        userInfo.storyID = parseInt(resInfo['storyID']);
        userInfo.modelID = parseInt(resInfo['mid']);
        userInfo.heroId = parseInt(resInfo['hid']);

        let equips:Object[] = data.equips;
        let heros:Object[] = data.heros;

        userInfo.equips = [];
        for (let equip of equips)
        {
            let equipInfo:EquipInfo = new EquipInfo();
            equipInfo.uuid = parseFloat(equip['id']); //对象唯一识别id
            equipInfo.modelID = parseInt(equip['mid']); //配置文件模板id
            equipInfo.userId = parseFloat(equip['uid']); //所属User的id
            equipInfo.updateTime = parseFloat(equip['createTime']||0); //创建时间
            userInfo.equips.push(equipInfo);
        }

        userInfo.heros = [];
        for (let hero of heros)
        {
            let heroInfo:HeroInfo = new HeroInfo();
            heroInfo.exp = parseFloat(hero['exp']);
            heroInfo.uuid = parseFloat(hero['id']);
            heroInfo.item1 = parseInt(hero['item1']);
            heroInfo.item2 = parseInt(hero['item2']);
            heroInfo.item3 = parseInt(hero['item3']);

            heroInfo.item4 = parseInt(hero['item4']);
            heroInfo.item5 = parseInt(hero['item5']);
            heroInfo.item6 = parseInt(hero['item6']);
            heroInfo.item7 = parseInt(hero['item7']);
            heroInfo.item8 = parseInt(hero['item8']);
            heroInfo.mid = parseInt(hero['mid']);
            heroInfo.userId = parseFloat(hero['uid']);
            userInfo.heros.push(heroInfo);
        }

        let levelData:Object = {
            'levelID': level['id'],
            'name': level['name'],
            'topic': level['topic'],
            'required_energy': level['energy'],
            'hero_rotation': level['hero_rotation'],
            // 'required_star': level['star'],
            'tiledmap': level['tiledmap'],
            'tiledimage': level['tiledimage'],
            'star1_reward': level['star1_reward'],
            'star1_reward_num': level['star1_reward_num'],
            'star2_reward': level['star2_reward'],
            'star2_reward_num': level['star2_reward_num'],
            'star3_reward': level['star3_reward'],
            'star3_reward_num': level['star3_reward_num'],
            'star_level': 0,
            'state_locked': ExploreWindow.STATE_STRIP,
            'next_level': level['next_level'],
            'level_bgm': level['bgm'],
            'find_path':level['find_path'],
            'player_info':userInfo
        };
        SoundManager.getInstance().playEffect('u10_start_mp3');
        BattleStartLoading.startBattleLoading(levelData);
    } 
}