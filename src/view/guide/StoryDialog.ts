import Dialog from "./Dialog";
import WindowManager from "../../base/popup/WindowManager";
import GuideManager from "../../manager/GuideManager";
/**
 * Created by yaozhiguo on 2017/2/16.
 */
export default class StoryDialog extends Dialog
{
    private labStory:eui.Label;
    private btnSkip:eui.Button;
    private btnNext:eui.Button;

    public constructor()
    {
        super();
        this.skinName = 'DialogWindowSkin';
    }

    public update(guideData:Object):void
    {
        super.update(guideData);
        this.labStory.text = guideData['guide_text'];
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.btnNext.name = 'btnNext';
        this.btnSkip.name = 'btnSkip';
        this.btnSkip.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onSkip, this);
        this.btnNext.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onNext, this);
    }

    private onSkip(event:egret.TouchEvent):void
    {
        WindowManager.closeWindow(this.name);
    }

    private onNext(event:egret.TouchEvent):void
    {
        let result:boolean = GuideManager.getInstance().next();
        if (result)
        {
            console.log("[StoryDialog.onNext] dialogs finished.");
        }
    }

    public dispose():void
    {
        this.btnSkip.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onSkip, this);
        this.btnNext.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onNext, this);
    }
}