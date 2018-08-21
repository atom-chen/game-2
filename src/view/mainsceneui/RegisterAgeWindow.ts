import BaseWindow from "../../base/popup/BaseWindow";
import WindowManager from "../../base/popup/WindowManager";
import RegisterWindow from "./RegisterWindow";
import LoginWindow from "./LoginWindow";
import Alert from "../common/Alert";
import LayerManager from "../../manager/LayerManager";
import UIPopupLoading from "../loading/UIPopupLoading";
/**
 * Created by yaozhiguo on 2017/2/8.
 */
export default class RegisterAgeWindow extends BaseWindow
{
    private btnNext:eui.Button;
    private txtAge:eui.TextInput;
    private labAccount:eui.Label;

    public constructor()
    {
        super();
        this.skinName = 'RegisterAgeWindowSkin';
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.txtAge.restrict = '0-9';
        this.txtAge.maxChars = 2;
        this.labAccount.touchEnabled = true;
        this.btnNext.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onNext, this);
        this.labAccount.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onLogin, this);
        this.labAccount.textFlow = new Array<egret.ITextElement>(
            { text:"已有账号", style: {'underline':true} }
        );
        this.labAccount.addEventListener(mouse.MouseEvent.MOUSE_OVER , ( evt ) => {
            this.labAccount.textColor = 0xffff00;
        }, this );
        this.labAccount.addEventListener(mouse.MouseEvent.MOUSE_OUT , ( evt ) => {
            this.labAccount.textColor = 0xffffff;
        }, this );
    }

    private onNext(event:egret.TouchEvent):void
    {
        if(!this.txtAge.text || this.txtAge.text.length == 0)//必须输入年龄
        {
            Alert.show('错误', '请输入年龄！', 2);
            return;
        }
        if (this.txtAge.text.charAt(0) == '0')//第一个数字不能是0
        {
            Alert.show('错误', '输入的年龄非法！', 2);
            return;
        }
        WindowManager.closeWindow(this.name);
        LayerManager.stage.addEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterPopup, this);
        UIPopupLoading.startPopupLoading(["register"]);
    }

    private onEnterPopup(e:egret.TouchEvent):void
    {
        LayerManager.stage.removeEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterPopup, this);
        WindowManager.showWindow(RegisterWindow, 'RegisterWindow');
    }

    private onLogin(event:egret.TouchEvent):void
    {
        WindowManager.closeWindow(this.name);
        WindowManager.showWindow(LoginWindow, 'LoginWindow');
    }

    public dispose():void
    {
        this.btnNext.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onNext, this);
        this.labAccount.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onLogin, this);
    }
}