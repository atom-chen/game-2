import BaseWindow from "../../base/popup/BaseWindow";
import WindowManager from "../../base/popup/WindowManager";
import ToolTipManager from "../../base/tip/ToolTipManager";
import TextToolTip from "../../base/tip/TextToolTip";
import PopUpPosition from "../../base/popup/PopUpPosition";
import PasswordHelper from "./PasswordHelper";
import QQPlatform from "../../platforms/QQPlatform";
import Platform from "../../platforms/Platform";

/**
 * Created by yaozhiguo on 2017/2/6.
 */
export default class LoginWindow extends BaseWindow
{
    private txtEmail:eui.TextInput;
    private txtPsd:eui.TextInput;
    private labNoUser:eui.Label;
    private labForgetPsd:eui.Label;
    private imgQQ:eui.Image;
    private btnLogin:eui.Button;
    private labNewAccount:eui.Label;

    private passwordHelper:PasswordHelper;

    public constructor()
    {
        super();
        this.skinName = 'LoginWindowSkin';
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.labNoUser.visible = false;
        this.labForgetPsd.touchEnabled = this.labNewAccount.touchEnabled = this.imgQQ.touchEnabled = true;
        this.labForgetPsd.name = 'labForgetPsd';
        this.labForgetPsd.visible = false;
        this.labNewAccount.name = 'labNewAccount';
        this.imgQQ.name = 'imgQQ';
        this.btnLogin.name = 'btnLogin';
        ToolTipManager.register(this.imgQQ, '使用QQ登录', TextToolTip, PopUpPosition.RIGHT);
        this.passwordHelper = new PasswordHelper(this.txtPsd);
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);
        this.labNewAccount.touchEnabled = true;
        this.labNewAccount.textFlow = new Array<egret.ITextElement>(
            { text:"注册新账号", style: {'underline':true} }
        );
        this.labNewAccount.addEventListener(mouse.MouseEvent.MOUSE_OVER , ( evt ) => {
            this.labNewAccount.textColor = 0xffff00;
        }, this );
        this.labNewAccount.addEventListener(mouse.MouseEvent.MOUSE_OUT , ( evt ) => {
            this.labNewAccount.textColor = 0xffffff;
        }, this );
    }

    private onTouchTap(event:egret.TouchEvent):void
    {
        let target:egret.DisplayObject = event.target;
        switch (target.name)
        {
            case 'btnLogin':
            {
                let platform = Platform.currentPlatform
                platform.login(this.txtEmail.text,this.passwordHelper.passwordChars)
                    .then(() => {
                        return platform.getClasses()
                    }).then(() =>{
                        platform['reload']()
                    })
                    
                break;
            }
            case 'imgQQ':
            {
                egret.localStorage.setItem('platform', 'qq');
                new QQPlatform().openLogin();
                break;
            }
            case 'labNewAccount':
            {
                WindowManager.closeWindow(this.name);
                window.location.href= '/learn'

                break;
            }
            case 'labForgetPsd':
            {
                break;
            }
        }
    }

    public dispose():void
    {
        super.dispose();
        ToolTipManager.unRegister(this.imgQQ);
        this.passwordHelper.dispose();
        this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);
    }
}