import Globals from "../../../enums/Globals";
import SoundManager from "../../../manager/SoundManager";
import ColorFilterFactory from "../../../base/factory/ColorFilterFactory";
/**
 * Created by yaozhiguo on 2016/12/29.
 * 一个指令，是ActionGroup的子集。
 */

export default class ActionItem extends egret.Sprite
{
    public static ACTION_ITEM_CLICKED:string = 'actionItemClicked';

    private _doc:any;
    private _language:string;

    private _txtMethod:egret.TextField;
    private _imgIcon:eui.Image;
    private _imgBg:eui.Image;

    public ITEM_HEIGHT:number = 20;
    public ITEM_WIDTH:number = 170;

    public FRAME_BORDER:number = 10; //整个区域的边框厚度

    public constructor(doc, language:string)
    {
        super();
        this._doc = doc;
        this._language = language;

        this._txtMethod = new egret.TextField();
        this._txtMethod.textColor = 0x00caff;//0x2f6fb4;
        this._txtMethod.text = doc.shortName;
        this._txtMethod.verticalAlign = egret.VerticalAlign.MIDDLE;

        this.addChild(this._txtMethod);

        this.changeToTxtState();

        this.addEventListener(mouse.MouseEvent.MOUSE_OVER, this.onMouseOver,this, true);
        this.addEventListener(mouse.MouseEvent.MOUSE_OUT, this.onMouseOut, this, true);
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
        this.name = "actionItem";
    }

    public changeToIconState():void
    {
        var nameLength:number = this._doc.short_name ? this._doc.short_name.length : 0;
        this.ITEM_WIDTH = nameLength <= 6 ? 115 : nameLength * 15;
        this.ITEM_HEIGHT = 105;

        this._txtMethod.width = this.ITEM_WIDTH;
        this._txtMethod.height = 26;
        this._txtMethod.size = 20;
        this._txtMethod.bold = false;
        this._txtMethod.x = 0;
        this._txtMethod.y = 80;
        this._txtMethod.text = this._doc.short_name || 'method';
        this._txtMethod.textAlign = egret.HorizontalAlign.CENTER;

        if (!this._imgIcon){
            this._imgIcon = new eui.Image();
            this._imgIcon.width = 50;
            this._imgIcon.height = 50;
            if (this._doc.icon)
            {
                this._imgIcon.source = this._doc.icon;
            }
            else
            {
                RES.getResAsync('method_default_png', (data, url)=>{
                    this._imgIcon.source = data;
                }, this);
            }
        }
        if (!this.contains(this._imgIcon)){
            this.addChild(this._imgIcon);
        }
        if (!this._imgBg){
            this._imgBg = new eui.Image();
            this._imgBg.width = this.ITEM_WIDTH;
            this._imgBg.height = (this.ITEM_HEIGHT - this._txtMethod.height) - 10;//* 1.35;
            this._imgBg.y = this.FRAME_BORDER;
            this._imgBg.fillMode = egret.BitmapFillMode.SCALE;
            this._imgBg.scale9Grid = new egret.Rectangle(22, 22, 70, 22);
            // this.imgbg.source = RES.getRes('palette_item_bg_png');
            RES.getResAsync('palette_item_bg_png', (data,key)=>{
                this._imgBg.source = data;
            }, this);
        }
        if (!this.contains(this._imgBg)){
            this.addChild(this._imgBg);
            this.swapChildren(this._imgBg, this._imgIcon);
        }
        // this.imgIcon.visible = true;
        this.drawBg();
        this._imgIcon.x = (this.ITEM_WIDTH - this._imgIcon.width) * 0.5;
        this._imgIcon.y = (this.ITEM_HEIGHT  - this._txtMethod.height - this._imgIcon.height) * 0.5 + 5;
    }

    public changeToTxtState():void
    {
        this.ITEM_WIDTH = Globals.PALETTE_WIDTH * 0.5 - 110;
        this.ITEM_HEIGHT = 25;
        this._txtMethod.width = this.ITEM_WIDTH;
        this._txtMethod.height = this.ITEM_HEIGHT;
        this._txtMethod.size = 20;
        this._txtMethod.bold = false;
        this._txtMethod.x = 0;
        this._txtMethod.y = 0;
        this._txtMethod.text = this._doc.shortName;
        this._txtMethod.textAlign = egret.HorizontalAlign.LEFT;
        //console.log(this.txtMethod.fontFamily);
        if (this._imgIcon && this.contains(this._imgIcon))
        {
            // this.imgIcon.visible = false;
            this.removeChild(this._imgIcon);
        }
        if (this._imgBg && this.contains(this._imgBg))
        {
            this.removeChild(this._imgBg);
        }
        this.drawBg();
    }

    private drawBg(): void {
        this.graphics.clear();
        //this.graphics.lineStyle(1, 0x003366);
        this.graphics.beginFill(0x00093e,0);
        // this.graphics.beginFill(0x00ffff,0.5);
        this.graphics.drawRoundRect(0,0,this.ITEM_WIDTH,this.ITEM_HEIGHT,2,2);
        this.graphics.endFill();
    }

    private onTap(event:egret.TouchEvent):void
    {
        //Backbone.Mediator.publish('paletteMethodClicked', this.doc);
        console.log('you clicked method name:', this._doc.shortName);
        this.dispatchEvent(new egret.Event(ActionItem.ACTION_ITEM_CLICKED, true, false, this._doc.shortName));
    }

    private onMouseOver(event:mouse.MouseEvent):void
    {
        let actionTip = $("#codeTipData");
        actionTip.html(this._doc.initialHTML);
        this._txtMethod.textColor = 0xf3ff8d;
        let self:ActionItem = this;
        let wstr = actionTip.css('width');
        let hstr = actionTip.css('height');
        let tipWidth = parseFloat(wstr.substr(0, wstr.length - 2));
        let tipHeight = parseFloat(hstr.substr(0, hstr.length - 2));
        //console.log(tipWidth, tipHeight);
        let globalPos:egret.Point = self.parent.localToGlobal(self.x, self.y);
        let dw:number = (window.innerWidth - Globals.domGameWidth) * 0.5;
        let dh:number = (window.innerHeight - Globals.domGameHeight) * 0.5;
        let rx:number = Globals.scaleRatio * globalPos.x;
        let ry:number = Globals.scaleRatio * globalPos.y;
        actionTip.css('left', dw + rx + self.width * Globals.scaleRatio * 0.5 - tipWidth - 10);
        actionTip.css('top', dh + ry - tipHeight - 25);
        actionTip.removeClass('hidden');
        SoundManager.getInstance().playEffect('u07_skill_mp3');
        this.filters = [ColorFilterFactory.HIGHLIGHT_FILTER];
    }

    private onMouseOut(event:mouse.MouseEvent):void
    {
        $("#codeTipData").addClass('hidden');
        this._txtMethod.textColor = 0x00caff;
        this.filters = null;
    }

    public dispose():void
    {
        this._txtMethod.removeEventListener(mouse.MouseEvent.MOUSE_OVER,this.onMouseOver,this);
        this._txtMethod.removeEventListener(mouse.MouseEvent.MOUSE_OUT,this.onMouseOut,this);
        this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
    }
}