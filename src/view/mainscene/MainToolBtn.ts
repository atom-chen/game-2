import ToolTipManager from "../../base/tip/ToolTipManager";
import PopUpPosition from "../../base/popup/PopUpPosition";
import TextToolTip from "../../base/tip/TextToolTip";
import WindowManager from "../../base/popup/WindowManager";
import OptionWindow from "../explore/option/OptionWindow";
import HeroWindow from "../explore/hero/HeroWindow";
import BadgeWindow from "../badge/BadgeWindow";
import ClassHelpWindow from "../teach/ClassHelpWindow";
import LayerManager from "../../manager/LayerManager";
import UIPopupLoading from "../loading/UIPopupLoading";
/**
 * @author rappel - ljunkun
 */
export default class MainToolBtn extends eui.Component
{
    public btnSetting:eui.Button;
    public btnWarrior: eui.Button;
    public btnAchievement:eui.Button;
    public btnMall: eui.Button;
    public btnTeacher:eui.Button;

    private lockState:number = 0;//未锁定

    public constructor()
    {
        super();
        this.skinName = 'MainToolBtnSkin';
    }

    protected childrenCreated()
    {
        super.childrenCreated();

        this.initListeners();
    }

    protected partAdded(partName: string, instance: any):void
    {
        super.partAdded(partName, instance);
        if (partName === 'btnSetting')
        {
            this.btnSetting;
        }
        if (partName == "btnTeacher")
        {
            this.btnTeacher.visible = false;
        }
    }

    private initListeners()
    {
        this.touchEnabled = this.touchChildren = true;

        this.btnSetting.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnSettingTouchHandler, this);
        this.btnWarrior.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnWarriorTouchHandler, this);
        this.btnAchievement.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnAchievementTouchHandler, this);
        this.btnMall.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnMallTouchHandler, this);
        this.btnTeacher.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnTeachTouchHandler, this);

        ToolTipManager.register(this.btnSetting, '用户设置：昵称、密码、头像、音效等', TextToolTip, PopUpPosition.ABOVE);
        ToolTipManager.register(this.btnAchievement, '徽章：查看获得徽章、领取徽章奖励', TextToolTip, PopUpPosition.ABOVE);
        ToolTipManager.register(this.btnWarrior, '英雄：查看、选择出战英雄和语言类型', TextToolTip, PopUpPosition.ABOVE);

        this.btnMall.addEventListener('doubleClick', ()=>{
            console.log('double clicked!');
        }, this);
    }

    private removeListeners()
    {
        this.touchEnabled = this.touchChildren = false;

        this.btnSetting.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnSettingTouchHandler, this);
        this.btnWarrior.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnWarriorTouchHandler, this);
        this.btnAchievement.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnAchievementTouchHandler, this);
        this.btnMall.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnMallTouchHandler, this);
        this.btnTeacher.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onBtnTeachTouchHandler, this);

        ToolTipManager.unRegister(this.btnSetting);
        ToolTipManager.unRegister(this.btnAchievement);
        ToolTipManager.unRegister(this.btnWarrior);
    }

    private onBtnSettingTouchHandler(e:egret.TouchEvent)
    {
        //base.WindowManager.showWindow(SettingWindow, 'SettingWindow');

        //document.getElementsByTagName('title')[0].innerHTML = 'Setting-Panel';
        //Globals.replaceURI({'panel': 'setting'});
        LayerManager.stage.addEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterOptionPopup, this);
        UIPopupLoading.startPopupLoading(["option"]);
    }

    private onEnterOptionPopup(e:egret.TouchEvent):void
    {
        LayerManager.stage.removeEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterOptionPopup, this);
        WindowManager.showWindow(OptionWindow, 'OptionWindow');
    }

    private onBtnWarriorTouchHandler(e:egret.TouchEvent)
    {
        LayerManager.stage.addEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterHeroPopup, this);
        UIPopupLoading.startPopupLoading(["hero"]);
    }

    private onEnterHeroPopup(e:egret.TouchEvent):void
    {
        LayerManager.stage.removeEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterHeroPopup, this);
        WindowManager.showWindow(HeroWindow, 'HeroWindow');
    }

    private onBtnAchievementTouchHandler(e:egret.TouchEvent)
    {
        LayerManager.stage.addEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterBadgePopup, this);
        UIPopupLoading.startPopupLoading(["badge"]);
    }

    private onEnterBadgePopup(e:egret.TouchEvent):void
    {
        LayerManager.stage.removeEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterBadgePopup, this);
        WindowManager.showWindow(BadgeWindow, 'BadgeWindow');
    }

    private onBtnMallTouchHandler(e:egret.TouchEvent)
    {
        //Payment.toRecharge();
        // Globals.replaceURI();
        //Globals.replaceURI({'panel': 'tips_not_open'});
        //return;
        // base.WindowManager.showWindow(MallWindow, 'MallWindow');
        // document.getElementsByTagName('title')[0].innerHTML = 'Mall-Panel';
    }

    private onBtnTeachTouchHandler(event:egret.TouchEvent):void
    {
        WindowManager.showWindow(ClassHelpWindow, "ClassHelpWindow");
    }

    public dispose():void
    {
        this.removeListeners();
    }
}