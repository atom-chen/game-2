import BaseWindow from "../../base/popup/BaseWindow";
import WindowManager from "../../base/popup/WindowManager";
import LoginWindow from "../mainsceneui/LoginWindow";

WindowManager.on('FirstEntry', function(){
    WindowManager.showWindow(FirstEntryWindow, 'FirstEntryWindow')   
}, WindowManager)
/**
 * Created by yaozhiguo on 2017/2/15.
 * 匿名进入时，需要提示用户是否登录和跳过引导
 */
export default class FirstEntryWindow extends BaseWindow
{
    private btnLogin:eui.Button;
    private btnContinue:eui.Button;
    private btnRegister:eui.Button;

    public constructor()
    {
        super();
        this.skinName = "GuideCheckWindowSkin";
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.btnLogin.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onLogin, this);
        this.btnContinue.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onAnynomous, this);
        this.btnRegister.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRegister, this);
    }

    private onLogin(event:egret.TouchEvent):void
    {
        // WindowManager.closeWindow(this.name, true);
        WindowManager.showWindow(LoginWindow, 'LoginWindow');
    }

    private onAnynomous(event:egret.TouchEvent):void
    {
        WindowManager.closeWindow(this.name, true);
    }

    private onRegister(event:egret.TouchEvent):void
    {
        WindowManager.closeWindow(this.name, true);
        window.location.href ='/learn'
    }

    public dispose():void
    {
        super.dispose();
        this.btnLogin.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onLogin, this);
        this.btnContinue.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onAnynomous, this);
        this.btnRegister.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onRegister, this);
    }
}

