import ActionItem from "./ActionItem";
import Globals from "../../../enums/Globals";
/**
 * Created by yaozhiguo on 2016/12/29.
 * 一组指令集合的容器，只包含一组相关的指令。如move，是ActionBox的子集。
 */

export default class ActionGroup extends egret.Sprite
{
    private entries:Array<ActionItem> = [];

    private vGap:number = 12;
    private hGap:number = 5;
    private itemIcon:eui.Image; //道具icon
    private imgIconBg:eui.Image;
    private imgBg:eui.Image;

    // private ICON_WIDTH:number = 118;
    // private ICON_HEIGHT:number = 109;


    // private txtName:egret.TextField;
    private short:any;

    private ICON_STATE_BG_HEIGHT:number = 119;
    private PALETTE_WIDTH:number = Globals.PALETTE_WIDTH - 15;
    private currentWidth:number = this.PALETTE_WIDTH;
    private currentHeight:number = 0; //根据内容指定容器的实际宽高

    private ICON_BG_WIDTH:number = 108;
    private ICON_BG_HEIGHT:number = 101;
    private ICON_WIDTH2:number = 80;
    private ICON_HEIGHT2:number = 80;
    private TXT_NAME_WIDTH:number = 150;
    private TXT_NAME_HEIGHT:number = 24;
    private FRAME_TOP:number = 15;
    private FRAME_LEFT:number = 12;
    private txtName:egret.TextField;

    public addItem(actionItem:ActionItem):void
    {
        this.addChild(actionItem);
        this.entries.push(actionItem);
    }

    public setProperty(property:Object, short):void
    {
        this.imgIconBg = new eui.Image();
        this.imgIconBg.width = this.ICON_BG_WIDTH;
        this.imgIconBg.height = this.ICON_BG_HEIGHT;
        RES.getResAsync('palette_icon_bg_png', (data,key)=>{
            this.imgIconBg.source = data;
        }, this);
        this.addChild(this.imgIconBg);
        this.imgIconBg.x = (this.TXT_NAME_WIDTH - this.ICON_BG_WIDTH) * 0.5 + this.FRAME_LEFT;
        this.imgIconBg.y = this.FRAME_TOP;

        this.itemIcon = new eui.Image();
        this.itemIcon.width = this.ICON_WIDTH2;
        this.itemIcon.height = this.ICON_HEIGHT2;
        this.itemIcon.source = property['imageURL'];
        this.short = short;
        this.addChild(this.itemIcon);

        this.txtName = new egret.TextField();
        this.txtName.width = this.TXT_NAME_WIDTH;
        this.txtName.height = this.TXT_NAME_HEIGHT;
        this.txtName.size = 20;
        this.txtName.textAlign = egret.HorizontalAlign.CENTER;
        this.txtName.x = this.FRAME_LEFT;
        this.txtName.y = this.ICON_STATE_BG_HEIGHT - this.TXT_NAME_HEIGHT;
        this.addChild(this.txtName);
        // this.txtName.border = true;
        this.txtName.stroke = 2;
        this.txtName.strokeColor = 0x023d8c;
        this.txtName.fontFamily = 'Microsoft Yahei';
        this.txtName.text = property['name'] || '装备名称';
    }

    public layout(state:string = 'txt'):void
    {
        this.currentHeight = 0;
        this.currentWidth = 0;

        for(var i: number = 0,length: number = this.entries.length;i < length;i++)
        {
            var entry: ActionItem = this.entries[i];
            var ny: number = i > 0 ? (this.entries[i - 1].height + this.entries[i - 1].y) : 5;
            if (state == 'txt')
            {
                entry.x = this.ICON_WIDTH2 + this.FRAME_LEFT * 2 + this.hGap;
                entry.y = ny + this.vGap;
                this.currentWidth = entry.x + entry.width;
                var h:number = entry.y + entry.height;
                this.currentHeight = h > this.currentHeight ? h : this.currentHeight;
            }
            else
            {
                var nx: number = i > 0 ? (this.entries[i - 1].width + this.entries[i - 1].x) : this.TXT_NAME_WIDTH + this.hGap;
                if (nx + entry.width + this.hGap > this.PALETTE_WIDTH) //换行
                {
                    entry.x = this.FRAME_LEFT;
                    entry.y = this.currentHeight + this.vGap;
                }
                else
                {
                    entry.x = nx + this.hGap;
                    entry.y = i == 0 ? (this.vGap + this.currentHeight) : (this.currentHeight - entry.height);
                }
                this.currentHeight = entry.y + entry.height;
                // var w:number = entry.x + entry.width;
                // this.currentWidth = w > this.currentWidth ? w : this.currentWidth;
                this.currentWidth = this.PALETTE_WIDTH;
            }
        }

        // state === 'icon' ? this.showGroupName() : this.hideGroupName();
        state === 'icon' ? this.iconToBig() : this.iconToSmall();
        //this.itemIcon.y = (this.currentHeight - this.itemIcon.height) * 0.5;

        if (!this.imgBg)
        {
            this.imgBg = new eui.Image();
            this.addChildAt(this.imgBg, 0);
            this.imgBg.scale9Grid = new egret.Rectangle(33, 33, 780, 48);
            RES.getResAsync('palette_group_bg_png', (data,key)=>{
                this.imgBg.source = data;
            }, this);
        }

        this.currentHeight = this.currentHeight < this.ICON_STATE_BG_HEIGHT ? this.ICON_STATE_BG_HEIGHT : this.currentHeight;
        this.graphics.clear();
        this.graphics.lineStyle(0, 0x0033aa, 0);
        this.graphics.drawRoundRect(0,0, this.currentWidth + this.hGap, this.currentHeight + this.vGap, 1, 1);

        this.width = this.currentWidth + this.hGap;
        this.height = this.currentHeight + this.vGap;

        this.imgBg.width = this.currentWidth + this.hGap;
        this.imgBg.height = this.currentHeight + this.vGap;

        this.imgIconBg.visible = state === 'icon';
        this.txtName.visible = state === 'icon';
    }

    private iconToSmall():void
    {
        this.itemIcon.width = this.ICON_WIDTH2;
        this.itemIcon.height = this.ICON_HEIGHT2;
        this.itemIcon.x = this.FRAME_LEFT;
        this.itemIcon.y = this.FRAME_TOP;//(this.currentHeight  + this.vGap - this.itemIcon.height) * 0.5;
    }

    private iconToBig():void
    {
        this.itemIcon.width = this.ICON_WIDTH2;
        this.itemIcon.height = this.ICON_HEIGHT2;
        this.itemIcon.x = (this.TXT_NAME_WIDTH - this.ICON_WIDTH2) * 0.5 + this.FRAME_LEFT;
        this.itemIcon.y = (this.ICON_STATE_BG_HEIGHT - this.ICON_HEIGHT2) * 0.5;
        // this.itemIcon.x = this.hGap;
        // this.itemIcon.y = 15;
        // this.itemIcon.y = (this.currentHeight  + this.vGap - this.txtName.height - this.itemIcon.height) * 0.5;
    }

    /**
     * 切换至文本状态
     */
    public changeToTxtState():void
    {
        this.entries.forEach((value:ActionItem, index:number)=>{
            value.changeToTxtState();
        }, this);
        this.layout('txt');
    }

    /**
     * 切换至icon状态
     */
    public changeToIconState():void
    {
        this.entries.forEach((value:ActionItem, index:number)=>{
            value.changeToIconState();
        }, this);
        this.layout('icon');
    }

    public dispose():void
    {
        for (var i in this.entries)
        {
            var paletteItem = this.entries[i];
            paletteItem.dispose();
        }
    }
}
