
import RewardSlot from "./RewardSlot";

export default class RewardBar extends egret.Sprite
{
    public txtPos: egret.TextField;
    private labDesc:egret.TextField;
    public slots:Array<RewardSlot> = [];
    
    public constructor(){
        super();
        
        this.graphics.clear();
        this.graphics.beginFill(0x000000, 0);
        this.graphics.drawRect(0, 0, 500 ,80);
        this.graphics.endFill();
        
        this.labDesc = new egret.TextField();
        this.labDesc.width  = 400;
        this.labDesc.height = 20;
        this.labDesc.textAlign = egret.HorizontalAlign.CENTER;
        this.labDesc.verticalAlign = egret.VerticalAlign.MIDDLE;
        this.labDesc.size = 17;
        this.labDesc.bold = true;
        this.labDesc.x = (this.width - this.labDesc.width) * 0.5;
        this.labDesc.y = 0;
        this.addChild(this.labDesc);
    }
    
    public setAwardDescription(desc:string):void
    {
        this.labDesc.text = desc;
    }
    /**
     * 添加奖励格子
     * @param {RewardSlot} 奖励格子
     * @param {"normal"|"center"} type类型,用于布局
     * @param {number} gap 格子之间的间隙
     * @param {boolean} showDesc 是否要显示格子的数量信息
     */
    public addAwardSlot(slot:RewardSlot, type?:string, gap?:number, showDesc?:boolean):void
    {
        slot.x = 0;
        var iconHeight: number = this.height - this.labDesc.height; 
        // slot.y = (iconHeight - slot.height) * 0.5 + this.labDesc.height;
        slot.y = 0;

        this.addChild(slot);
        this.slots.push(slot);
        if( showDesc ) {
            slot.addChild( slot.txtPos );
            slot.txtPos.x = 1;
        }
        //布局 - 向左对齐,且间距为gap
        if('normal' === type) {
            this.layout_normal(gap);
        }
        else {//default - center 居中
            this.layout_center();
        }
    }
    
    public get awardSlotsCount():number
    {
        return this.slots.length;
    }

    private layout_center():void
    {
        var len: number = this.slots.length;
        var partWidth = this.width / (len + 1);
        for (var i:number = 0; i < this.slots.length; i++)
        {
            this.slots[i].x = partWidth * (i + 1) - this.slots[i].width * 0.5;
        }
    }

    public layout_normal( gap?:number ):void {
        gap || (gap = 0);

        var len: number = this.slots.length;
        for(var i:number = 0; i < this.slots.length; ++ i) {
            this.slots[i].x = ( this.slots[i].width + gap ) * i;
        }
    }

    public clone():RewardBar
    {
        return new RewardBar();
    }
}