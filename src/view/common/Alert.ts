import BaseWindow from "../../base/popup/BaseWindow";
import PopUpManager from "../../base/popup/PopUpManager";
import SoundManager from "../../manager/SoundManager";
import SceneManager from "../../manager/SceneManager";
/**
 * Created by yaozhiguo on 2017/2/8.
 */
export default class Alert extends BaseWindow
{
    public labContent:eui.Label;
    public btnCancel:eui.Button;
    public btnConfirm:eui.Button;
    public btnClose:eui.Button;

    public constructor()
    {
        super();
        this.skinName = 'AlertSkin';
    }

    /**
     * @params title string 提示框的标题
     * @params content string 提示框的文本内容
     * @params type number 提示框类型： 1 默认，具有取消按钮和确认按钮； 2 只有确认按钮
     */
    public static show(title:string='title', content:string='content', type:number = 1):Alert
    {
        var al:Alert = new Alert();
        // al.labTitle.text = title;
        al.labContent.text = content;
        if(type == 1)
        {
            al.btnCancel.visible = true;
            al.btnCancel.x = al.width * 0.22;
            al.btnConfirm.x = al.width * 0.53;
        }
        else if (type == 2)
        {
            al.btnCancel.visible = false;
            al.btnConfirm.x = (al.width - al.btnConfirm.width) * 0.5;
        }
        if (al.btnCancel)
        {
            al.btnCancel.addEventListener(egret.TouchEvent.TOUCH_TAP,al.onCancel,al);
        }
        if (al.btnClose)
        {
            al.btnClose.addEventListener(egret.TouchEvent.TOUCH_TAP, al.onClose, al);
        }
        al.btnConfirm.addEventListener(egret.TouchEvent.TOUCH_TAP,al.onConfirm, al);
        PopUpManager.addPopUp(al, true, true);
        document.getElementById('code-area').style.display = 'none';
        return al;
    }

    private checkCodeEditorVisible():void
    {
        /*if (SceneManager.getInstance().getRunningScene() instanceof BattleScene)
        {
            document.getElementById('code-area').style.display = 'block';
        }*/
        if (SceneManager.getInstance().numScenes >= 2)
            document.getElementById('code-area').style.display = 'block';
    }

    private onClose(event:egret.TouchEvent):void
    {
        PopUpManager.removePopUp(this);
        this.checkCodeEditorVisible();
        this.removeListeners();
        this.dispatchEvent(new egret.Event('close'));
        SoundManager.getInstance().playEffect('button003_mp3');
    }

    private onCancel(event:egret.TouchEvent):void
    {
        PopUpManager.removePopUp(this);
        this.checkCodeEditorVisible();
        this.removeListeners();
        this.dispatchEvent(new egret.Event('cancel'));
    }

    private onConfirm(event: egret.TouchEvent): void
    {
        PopUpManager.removePopUp(this);
        this.checkCodeEditorVisible();
        this.removeListeners();
        this.dispatchEvent(new egret.Event('confirm'));
    }

    private removeListeners():void
    {
        if (this.btnClose)
        {
            this.btnCancel.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onCancel,this);
        }
        if (this.btnClose)
        {
            this.btnClose.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onClose, this);
        }
        this.btnConfirm.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onConfirm, this);
    }
}