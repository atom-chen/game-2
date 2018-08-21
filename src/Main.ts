/// <reference path="../typings/index.d.ts" />
import ConfigManager from "./manager/ConfigManager";
import SceneManager from "./manager/SceneManager";
import MainScene from "./view/mainscene/MainScene";
import NetManager from "./model/net/NetManager";
import ResizeManager from "./manager/ResizeManager";
import LayerManager from "./manager/LayerManager";
import DisplayObject = egret.DisplayObject;
import PopUpManager from "./base/popup/PopUpManager";
import {AssetAdapter} from "./themes/AssetAdapter";
import {ThemeAdapter} from "./themes/ThemeAdapter";
import GameStartLoading from "./view/loading/GameStartLoading";
import DataAccessEntry from "./model/DataAccessEntry";
import ToolTipManager from "./base/tip/ToolTipManager";
import Button = eui.Button;
import SoundManager from "./manager/SoundManager";
import DataAccessManager from "./base/da/DataAccessManager";
import TweenLiteDriver from "./base/utils/TweenLiteDriver";
import ToastManager from "../src/view/common/ToastManager";

import DataAccessProxy from "./base/da/DataAccessProxy";
import TeachSystemProxy from "./model/da/TeachSystemProxy";
import Platform from "./platforms/Platform";
import Globals from "./enums/Globals";
import GuideManager from "./manager/GuideManager";
import IDChooseWindow from './view/teach/IDChooseWindow'
import FirstEntryWindow from './view/guide/FirstEntryWindow'
import WindowManager from './base/popup/WindowManager'

export default class Main extends eui.UILayer//egret.DisplayObjectContainer
{
    /**
     * 加载进度界面
     * Process interface loading
     */
    private _loadingView: GameStartLoading;

    public constructor()
    {
        super();
        egret.registerImplementation("eui.IAssetAdapter",new AssetAdapter());
        egret.registerImplementation("eui.IThemeAdapter",new ThemeAdapter());
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
    }

    private onAddedToStage(event: egret.Event)
    {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
        ResizeManager.init();
        DataAccessEntry.init();
        LayerManager.init(this.stage);
        SceneManager.getInstance().init(LayerManager.appLayer);
        PopUpManager.init(LayerManager.popLayer);
        mouse.enable(this.stage);
        ToolTipManager.init(LayerManager.tipLayer);
        TweenLiteDriver.init();
        TweenLiteDriver.setFps(30);
        ToastManager.init( LayerManager.tipLayer );

        //设置加载进度界面
        this._loadingView = new GameStartLoading();
        LayerManager.stage.addChild(this._loadingView);
        this._loadingView.load();
        this._loadingView.addEventListener('allLoadComplete', this.initGame, this);

        this.addButtonSoundEffect();

        // GuideManager.getInstance().shut();
    }

    private addButtonSoundEffect():void
    {
        let soundFilters:string[] = ['btnClose', 'fightBtn'];
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, (event:egret.TouchEvent)=>{
            let target:egret.DisplayObject = event.target;
            if (target instanceof Button && soundFilters.indexOf(target.name) == -1)
            {
                SoundManager.getInstance().playEffect('u01_button_mp3');
            }
        }, this, true);
    }

    /**
     * 初始加载完成，初始化游戏环境，并等待初始化结果
     *  Init game
     */
    private initGame(event: egret.Event): void
    {
        this._loadingView.removeEventListener('allLoadComplete', this.initGame, this);
        let netManager = NetManager.getInstance()
        netManager.addEventListener(NetManager.SERVERINITIALLED,this.enterGame,this);
        ConfigManager.getInstance().init();
        let sysConfig:Object = RES.getRes('sys_json');
        Globals.guide = sysConfig['guide'] === 'yes';//根据配置判断是否开启游戏新手引导
        Globals.guide ? GuideManager.getInstance().open() : GuideManager.getInstance().shut();
        if (sysConfig['platform'] == ''){
            let userName:string = egret.localStorage.getItem("login_name");
            if (!userName) {
                userName = Math.floor(Math.random() * 100000).toString();
            }
            netManager.userName = userName;
            netManager.init();
        }else{
            let platform = Platform.createPlatform(sysConfig['platform']);
            let netManager = NetManager.getInstance()
            platform.on('classes', function(classInfoes){
                if (classInfoes.length > 1){
                    WindowManager.showWindow(IDChooseWindow, 'IDChooseWindow', '', classInfoes);
                }
            }, WindowManager)
            platform.checkMe().then((result)=>{
                let {anonymous, platformUserId} = result
                if ( anonymous === false ){
                    //账号登录
                    netManager.userName = platformUserId
                    netManager.init()
                }else{
                    //匿名登录
                    netManager.userName = platformUserId;
                    netManager.init();
                    
                    WindowManager.showWindow(FirstEntryWindow, 'FirstEntryWindow');
                }
            }) 
        }
    }

    /**
     * 进入游戏第一个场景
     *  Enter game
     */
    private enterGame(event: egret.Event): void
    {
        let teachProxy:DataAccessProxy = DataAccessManager.getAccess(DataAccessEntry.TEACH_SYSTEM_PROXY);
        (<TeachSystemProxy>teachProxy).addSocketPushes();
        NetManager.getInstance().removeEventListener(NetManager.SERVERINITIALLED,this.enterGame,this);
        SceneManager.getInstance().pushScene(new MainScene(),1);
    }

    public addChild(child:DisplayObject):DisplayObject
    {
        if (child)
            throw new Error('不能直接添加子对象在本容器内！');
        return child;
    }
}
