import Dialog from "./Dialog";
import GuideManager from "../../manager/GuideManager";
/**
 * Created by yaozhiguo on 2017/2/16.
 */
export default class GuideDialog extends Dialog
{
    private labText:eui.Label;
    private imgNext:eui.Image;

    public constructor()
    {
        super();
        this.skinName = 'GuideDialogSkin';
    }

    public update(guideData:Object):void
    {
        super.update(guideData);
        this.labText.text = guideData['guide_text'];
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.imgNext.touchEnabled = true;
        this.imgNext.name = 'imgNext';
        this.imgNext.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onNext, this);
    }

    private onNext(event:egret.TouchEvent):void
    {
        if (this.guideData && parseInt(this.guideData['guide_type']) == 1)//只有弹窗而无引导点击区域时，点击箭头跳入下一步
        {
            GuideManager.getInstance().next();
        }
    }

    public dispose():void
    {
        this.imgNext.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onNext, this);
    }
}