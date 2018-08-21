import ToolTip from "./ToolTip";
/**
 * Created by yaozhiguo on 2016/12/30.
 * 一个纯文本的tip类，用于简单的文本场合。
 */

export default class TextToolTip extends ToolTip
{
    static MAX_WIDTH:number = 300;

    //背景区
    private _bg:egret.Sprite;
    //文本显示对象
    private _textField:egret.TextField;

    public constructor()
    {
        super();
        this._bg = new egret.Sprite();
        this.addChild(this._bg);

        this._textField = new egret.TextField();
        this._textField.textAlign = egret.HorizontalAlign.LEFT;
        this._textField.verticalAlign = egret.VerticalAlign.MIDDLE;
        this._textField.multiline = true;
        this._textField.touchEnabled = false;
        this._textField.wordWrap = true;
        this._textField.width = 200;
        this._textField.height = 22;
        this._textField.size = 20;
        this._textField.fontFamily = 'Microsoft Yahei';
        this._textField.textColor = 0xFFFFFF;
        this._textField.lineSpacing = 5;

        this.addChild(this._textField);
    }

    protected commitProperties():void
    {
        super.commitProperties();
        if (this.dataChanged)
        {
            this._textField.text = this.toolTipData;
            this.dataChanged = false;
        }
    }

    protected measure():void
    {
        super.measure();

        let widthSlop:number = 10;
        let heightSlop:number = 10;
        this._textField.wordWrap = false;

        if (this._textField.textWidth + widthSlop > TextToolTip.MAX_WIDTH)
        {
            this._textField.width = TextToolTip.MAX_WIDTH - widthSlop;
            this._textField.wordWrap = true;
        }

        //this.measuredWidth = this._textField.textWidth + widthSlop;
        //this.measuredHeight = this._textField.textHeight + heightSlop;

        this.updateBackground();
    }

    protected updateDisplayList(unscaledWidth: number, unscaledHeight: number):void
    {
        super.updateDisplayList(unscaledWidth, unscaledHeight);

        let margin:number = 5;
        this._textField.x = margin;
        this._textField.y = margin;
        this._textField.width = this._textField.textWidth + margin;
        this._textField.height = this._textField.textHeight + margin;
        this.updateBackground();
    }

    private updateBackground():void
    {
        this._bg.graphics.clear();
        this._bg.graphics.beginFill(0x000000, 0.7);
        this._bg.graphics.drawRoundRect(0,0,this._textField.width + 10, this._textField.height +　10, 10, 10);
        this._bg.graphics.endFill();
    }
}
