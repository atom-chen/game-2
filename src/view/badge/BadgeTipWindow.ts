import BaseWindow from "../../base/popup/BaseWindow";
import Globals from "../../enums/Globals";
import WindowManager from "../../base/popup/WindowManager";
/**
 * Created by yaozhiguo on 2017/1/24.
 * 返回关卡界面时弹出的徽章收获界面
 */
export default class BadgeTipWindow extends BaseWindow
{
    private imgBadgeIcon:eui.Image;

    public constructor()
    {
        super();
        this.width = Globals.GAME_WIDTH;
        this.height = Globals.GAME_HEIGHT;
        this.touchEnabled = true;
        this.touchChildren = true;
        this.skinName = 'BadgeTipWindowSkin';
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.imgBadgeIcon.source = 'resource/icon/badge/' + Globals.badgeAwardInfo.data['icon'] + '.png';
    }

    private onTouch(event:egret.TouchEvent):void
    {
        WindowManager.closeWindow(this.name);
    }

    public dispose():void
    {
        super.dispose();
        this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
    }
}
