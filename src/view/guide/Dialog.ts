import GuideManager from "../../manager/GuideManager";
/**
 * Created by yaozhiguo on 2017/2/16.
 */
export default class Dialog extends eui.Component
{
    protected guideData:Object;

    public constructor()
    {
        super();
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
    }

    /**
     * 刷新弹窗界面
     * @param guideData
     */
    public update(guideData:Object):void
    {
        this.guideData = guideData;
    }

    public show():void
    {
        this.visible = true;
    }

    public hide():void
    {
        this.visible = false;
    }

    private onTouch(event:egret.TouchEvent):void
    {
        if (this.guideData && parseInt(this.guideData['guide_type']) == 1)
        {
            if (event.target.name == 'btnNext' || event.target.name == 'imgNext')return;
            GuideManager.getInstance().next();
        }
    }
}