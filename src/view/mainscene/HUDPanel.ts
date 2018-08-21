import Globals from "../../enums/Globals";
import UserInfo from "../../model/vo/UserInfo";
import ServerManager from "../../model/net/NetManager";
import UserInfoProxy from "../../model/da/UserInfoProxy";
import WindowManager from "../../base/popup/WindowManager";
import LoginWindow from "../mainsceneui/LoginWindow";

import Alert from "../../view/common/Alert";
import Platform from "../../platforms/Platform";
/**
 * Created by rappel
 */
export default class HUDPanel extends eui.Component
{
    //UI
    private player_name_label: eui.Label;
    private player_vigor_label:eui.Label;
    private imgHead: eui.Image;    //玩家头像

    public labelLvl: eui.Label;
    public labelExp: eui.Label;
    public labelVigorCount: eui.Label;
    public labelGemCount: eui.Label;
    public labTime:eui.Label;

    private vigor_cell_0: eui.Image; private vigor_cell_1: eui.Image; private vigor_cell_2: eui.Image; private vigor_cell_3: eui.Image; private vigor_cell_4: eui.Image;
    private vigor_cell_5: eui.Image; private vigor_cell_6: eui.Image; private vigor_cell_7: eui.Image; private vigor_cell_8: eui.Image; private vigor_cell_9: eui.Image;

    //登录,登出,注册
    private btnRegister: eui.Button;
    private btnLoginIn: eui.Button;
    private btnLoginOut: eui.Button;
    public btnBuyGem: eui.Button;
    public btnBuyVigor: eui.Button;

    public constructor()
    {
        super();
        this.skinName = 'HUDPanelSkin';
    }

    protected childrenCreated()
    {
        super.childrenCreated();

        this.btnLoginIn.name = 'btnLogin';
        this.touchEnabled = this.touchChildren = true;

        this.btnRegister.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnRegisterTouchHandler, this);
        this.btnLoginIn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnLoginTouchHandler, this);
        this.btnLoginOut.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnLogOutTouchHandler, this);
        this.btnBuyVigor.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBuyVigor, this);
        this.btnBuyGem.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBuyGem, this);

        ServerManager.getInstance().addEventListener(UserInfoProxy.STORY_UPDATE_DATA, this.onUserInfoUpdate, this);
    }

    private onBtnRegisterTouchHandler(e:egret.TouchEvent) :void
    {
        window.location.href ='/learn'
    }

    private onBtnLoginTouchHandler(e:egret.TouchEvent) :void
    {
        WindowManager.showWindow(LoginWindow, 'LoginWindow');
    }

    private onBtnLogOutTouchHandler(e:egret.TouchEvent):void
    {
        TDGA.onPageLeave();
        Platform.currentPlatform.logout();
    }

    private onBuyVigor(event:egret.TouchEvent):void
    {
        Alert.show("体力购买", "暂未开放", 2);
    }

    private onBuyGem(event:egret.TouchEvent):void
    {
        Alert.show("钻石购买", "暂未开放", 2);
    }

    private onUserInfoUpdate(event:egret.Event):void
    {
        let userInfo:UserInfo = event.data.userInfo;
        if (!userInfo) return;

        this.update(userInfo);
    }

    public update(userInfo:UserInfo):void
    {
        this.player_name_label.text = userInfo.nickName || '玩家';
        this.imgHead.source  = userInfo.headImgUrl || 'resource/icon/role/career_head/' + userInfo.headIcon + '.png';

        this.labelGemCount.text   = userInfo.diamond.toString();
        this.labelLvl.text        = "Lv. " + userInfo.level.toString();
        this.labelVigorCount.text = userInfo.vigor + '/' + Globals.MAX_INIT_VIGOR;

        this.calculateExp(userInfo.exp);
        this.calculateVigor(userInfo.vigor);

        if (Platform.currentPlatform.isLogin)
        {
            if (Platform.currentPlatform.isAnonymous)
            {
                this.btnLoginIn.visible = true;
                this.btnLoginOut.visible= false;
                this.btnRegister.visible = true;
            }
            else
            {
                this.btnLoginIn.visible = false;
                this.btnLoginOut.visible= true;
                this.btnRegister.visible = false;
            }
        }
        else
        {
            this.btnLoginIn.visible = true;
            this.btnLoginOut.visible= false;
            this.btnRegister.visible = true;
        }
    }

    private calculateExp(userExp:number):void
    {
        let currLevel = this.levelFromExp( userExp );
        let currLevelExp = this.expForLevel( currLevel );
        let currExp   = userExp - currLevelExp;
        let totalExp  = this.expForLevel( currLevel+1 ) - currLevelExp;
        this.labelExp.text = "EXP   " + currExp + "/" + totalExp;
    }

    private levelFromExp(exp:number):number
    {
        /* a = 5, b = 100, c = b
         * y = a * ln(1/b * (x + c)) + 1
         */
        if( exp <= 0 ) return 1;
        return Math.floor( 5 * Math.log( (1/100) * (exp + 100))) + 1;
    }

    private expForLevel(level:number):number
    {
        /**
         * a = 5, b = 100, c = b;
         * x = b * e ^ ((y-1)/a) - c
         */
        if( level <= 1 ) return 0;
        return Math.ceil( Math.exp((level - 1)/5)*100 - 100 )
    }

    private calculateVigor(userVigor:number):void
    {
        let vigor_cell_num = Math.floor(userVigor / 15);
        for(let i = 0; i < 10; ++ i)
        {
            this['vigor_cell_' + i].visible = (i < vigor_cell_num ? true:false);
        }
    }

    public dispose():void
    {
        this.btnRegister.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnRegisterTouchHandler, this);
        this.btnLoginIn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnLoginTouchHandler, this);
        this.btnLoginOut.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnLoginTouchHandler, this);
        this.btnBuyVigor.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onBuyVigor, this);
        this.btnBuyGem.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onBuyGem, this);
        this.btnLoginOut.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnLogOutTouchHandler, this);

        ServerManager.getInstance().removeEventListener(UserInfoProxy.STORY_UPDATE_DATA, this.onUserInfoUpdate, this);
    }
}