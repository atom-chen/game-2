import BaseWindow from "../../base/popup/BaseWindow";
import MaliPlatform from "../../platforms/MaliPlatform";
import Platform from "../../platforms/Platform";
import WindowManager from "../../base/popup/WindowManager";
import RadioButton = eui.RadioButton;
/**
 * Created by yaozh on 2017/5/16.
 */
export default class IDChooseWindow extends BaseWindow
{
    private btnConfirm:eui.Button;

    private choosedClassInfo:Object;

    public constructor()
    {
        super();
        this.skinName = 'IDChooseWindowSkin';
    }

    protected updateView():void
    {
        super.updateView();
        this.btnConfirm.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onConfirm, this);
        let classInfoes:Object[] = this.data;

        let grp:eui.RadioButtonGroup = new eui.RadioButtonGroup();
        grp.enabled = true;

        for (let i:number = 0; i < classInfoes.length; i++)
        {
            let classInfo = classInfoes[i];
            let rb:RadioButton = new RadioButton();
            rb.group = grp;
            rb.label = classInfo['name'] + '-' + classInfo['idType'];
            rb['anchor'] = classInfo;
            rb.skinName = 'skins.RadioButtonSkin';
            rb.x = 500;
            rb.y = 200 + i * 80;
            this.addChild(rb);
            rb.addEventListener(egret.Event.CHANGE, (event)=>{
                this.choosedClassInfo = event.currentTarget['anchor'];
            }, this);
        }
    }

    private onConfirm(event:egret.TouchEvent):void
    {
        let classInfo:Object = this.choosedClassInfo;
        if (!classInfo)return;
        let platform:MaliPlatform = <MaliPlatform>(Platform.currentPlatform);
        platform.bindClassInfo(classInfo)
        
        WindowManager.closeWindow('IDChooseWindow', true);
    }

    public dispose():void
    {
        super.dispose();
        this.btnConfirm.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onConfirm, this);
    }
}
