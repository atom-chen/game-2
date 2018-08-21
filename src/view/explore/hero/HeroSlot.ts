import HeroInfo from "../../../model/vo/HeroInfo";
import ColorFilterFactory from "../../../base/factory/ColorFilterFactory";
/**
 * Created by yaozhiguo on 2017/1/17.
 * 英雄头像的容器
 */

export default class HeroSlot extends egret.Sprite
{
    private static WIDTH:number = 251;
    private static HEIGHT:number = 226;

    public static NORMAL_UNSELECTED:string = 'normal_unselected';
    public static NORMAL_SELECTED:string = 'normal_selected';
    public static LOCK_UNSELECTED:string = 'lock_unselected';
    public static LOCK_SELECTED:string = 'lock_selected';

    private _imgBgFrame:eui.Image;
    private _imgHeadIcon:eui.Image;
    private _imgLock:eui.Image;
    private _heroData:any;//HeroInfo or ConfigData
    private _state:string = HeroSlot.NORMAL_UNSELECTED;

    public get state():string
    {
        return this._state;
    }

    public set state(value:string)
    {
        this._state = value;
        this.setBgSource(value);
    }

    public get heroData():any
    {
        return this._heroData;
    }

    public set heroData(value:any)
    {
        this._heroData = value;
    }

    public constructor(heroData:any)
    {
        super();

        this.dragBG();

        this._heroData = heroData;
        this._imgHeadIcon = new eui.Image();
        this.width = this._imgHeadIcon.width = 109;
        this.height = this._imgHeadIcon.height = 109;

        this._imgHeadIcon.anchorOffsetX = (HeroSlot.WIDTH - 109) * 0.5;
        this._imgHeadIcon.anchorOffsetY = (HeroSlot.HEIGHT - 109) * 0.5;
        this._imgHeadIcon.x = (HeroSlot.WIDTH - 109);
        this._imgHeadIcon.y = (HeroSlot.HEIGHT - 109);

        let data:any = heroData instanceof HeroInfo ? heroData.data : heroData;
        this._imgHeadIcon.source = 'resource/icon/role/career_head/' + data['career_head'] + '_c.png';
        this.addChild(this._imgHeadIcon);
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);

        this._imgBgFrame = new eui.Image();
        this.addChild(this._imgBgFrame);

        this._imgLock = new eui.Image();
        this._imgLock.x = HeroSlot.WIDTH - 125;
        this._imgLock.y = 50;
        this._imgLock.width = 50;
        this._imgLock.height = 50;
        this.addChild(this._imgLock);
        this._imgLock.source = 'hero_json.pic_lock_png';
        this._imgLock.visible = false;
    }

    private setBgSource(state:string):void
    {
        switch (state)
        {
            case HeroSlot.NORMAL_UNSELECTED:
            {
                this._imgBgFrame.source = 'hero_json.pic_head_normal_png';
                this._imgHeadIcon.filters = null;
                this._imgHeadIcon.scaleX = this._imgHeadIcon.scaleY = 1.0;
                this._imgLock.visible = false;
                break;
            }
            case HeroSlot.NORMAL_SELECTED:
            {
                this._imgBgFrame.source = 'hero_json.pic_head_selected_png';
                this._imgHeadIcon.filters = null;
                this._imgHeadIcon.scaleX = this._imgHeadIcon.scaleY = 1.2;
                this._imgLock.visible = false;
                break;
            }
            case HeroSlot.LOCK_UNSELECTED:
            {
                this._imgBgFrame.source = 'hero_json.pic_head_normal_png';
                this._imgHeadIcon.filters = [ColorFilterFactory.GRAY_FILTER];
                this._imgHeadIcon.scaleX = this._imgHeadIcon.scaleY = 1.0;
                this._imgLock.visible = true;
                break;
            }
            case HeroSlot.LOCK_SELECTED:
            {
                this._imgBgFrame.source = 'hero_json.pic_head_selected_png';
                this._imgHeadIcon.filters = [ColorFilterFactory.GRAY_FILTER];
                this._imgHeadIcon.scaleX = this._imgHeadIcon.scaleY = 1.2;
                this._imgLock.visible = true;
                break;
            }
        }
        this._imgBgFrame.x = (HeroSlot.WIDTH - this._imgBgFrame.width) * 0.5;
        this._imgBgFrame.y = (HeroSlot.HEIGHT - this._imgBgFrame.height) * 0.5;
    }

    private dragBG():void
    {
        let g:egret.Graphics = this.graphics;
        g.clear();
        g.beginFill(0,0);
        g.drawRect(0,0,251,226);
        g.endFill();
    }

    private onTouchTap(event:egret.TouchEvent):void
    {
        this.dispatchEvent(new egret.Event('heroSlotClicked', false, false, this._heroData));
    }

    public dispose():void
    {
        this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);
    }
}
