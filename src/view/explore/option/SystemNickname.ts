import BaseWindow from "../../../base/popup/BaseWindow";
import WindowManager from "../../../base/popup/WindowManager";

export default class SystemNickname extends BaseWindow
{
    private surebtn:eui.Button;  //确认
    private InputNickname:eui.TextInput;
    public btnClose:eui.Button;

    public constructor()
    {
        super();
        this.skinName = 'SystemNicknameSkin';
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.addListeners();

    }

    private addListeners():void
    {
        this.surebtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onsure, this);
    }

    private removeListeners():void
    {
        this.surebtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onsure, this);
    }

        private clearForm():void
    {
        this.InputNickname.text = '';
    }

    private onsure(event:egret.TouchEvent):void
    {
        WindowManager.closeWindow('SystemNickname', true);
    }

}