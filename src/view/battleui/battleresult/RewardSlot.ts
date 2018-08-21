/**
 *
 * @author 
 *
 */
export default class RewardSlot extends egret.Sprite{
    
    private bg: egret.Bitmap;
    private contentFrame: eui.Image;
    private contentIcon: eui.Image;
    public txtPos: egret.TextField;

    private icon:any;
    private text:string;
    private type;
    private kind;
    
    /**
     * 构造道具奖励格子
     * @param {any} icon 道具格子的图片资源,是一个可显示对象
     * @param {string} text 道具数量
     * @param {type} 格子类型,根据用途划分为大,小两种,小格子用在选关界面奖励物品展示上
     * @param {string} kind 用于区分是否要显示text,有些地方要求不显示道具数量等信息
     * @constructor
     */
	public constructor(icon:any, text:string, type?:string, kind?:string) {
    	super();

        this.icon = icon;
        this.text = text;
        this.type = type;
        this.kind = kind;

        type || (type = 'normal');

        this.bg = new egret.Bitmap(RES.getRes('common_utils_json.item_frame_png'));
        this.addChild(this.bg);

        this.contentIcon = new eui.Image();
        this.addChild(this.contentIcon);
        this.contentIcon.width  = 100;
        this.contentIcon.height = 100;
        this.contentIcon.x = (this.bg.width - this.contentIcon.width) * 0.5;
        this.contentIcon.y = (this.bg.height - this.contentIcon.height) * 0.5;
        this.contentIcon.source = icon;
        if('small' === type) {
            this.width = this.height = 55;
            this.bg.width = this.bg.height = 55;
            this.contentIcon.width = this.contentIcon.height = 55;
        }

        this.txtPos = new egret.TextField();
        this.txtPos.width  = 40;
        this.txtPos.height = 20;
        this.txtPos.textAlign = egret.HorizontalAlign.CENTER;
        this.txtPos.verticalAlign = egret.VerticalAlign.MIDDLE;
        this.txtPos.size = 17;
        this.txtPos.textColor = 0xeeeeee;
        this.txtPos.x = (this.bg.width - this.txtPos.width);
        this.txtPos.y = (this.bg.height - this.txtPos.height);
        this.txtPos.text = text;
        this.addChild(this.txtPos);
	}

    public clone():RewardSlot
    {
        return new RewardSlot(this.icon, this.text, this.type, this.kind);
    }
}
