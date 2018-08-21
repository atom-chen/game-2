import FrameTweenLite from "../../../base/utils/FrameTweenLite";
/**
 * Created by sam on 2016/11/25.
 * 场景中角色发起聊天泡泡
 */
export default class ChatBubble extends egret.DisplayObjectContainer {

    private _bg:egret.Bitmap;
    private _label:egret.TextField;

    /**
     * 获取单元格周围范围内的生物，没有返回空数组单元格坐标
     * @param pos 气泡弹出坐标
     * @param content 气泡内容
     */
    public constructor(fromLeft:boolean,pos:egret.Point,content:string)
    {
        super();
        this._label = new egret.TextField();
        this._label.textColor = 0xffffff;
        this._label.width = 260;
        this._label.textAlign = "left";
        this._label.text = content;
        this._label.size = 22;
        this._label.x = 32;
        this._label.y = 15;

        this._bg = new egret.Bitmap();
        this._bg.texture = RES.getRes("bubble_png");
        this._bg.scale9Grid = new egret.Rectangle(30,20,10,10);
        this._bg.width = 300;
        this._bg.height = this._label.numLines*22+40;
        this.addChild(this._bg);
        this.addChild(this._label);

        if(fromLeft)
        {
            this._bg.scaleX = -1;
            this._label.x = -277;
            this.x = pos.x-25;
        }
        else this.x = pos.x+40;
        this.y = pos.y;
        var _this:ChatBubble = this;
        FrameTweenLite.to(this,2,{delay:content.length*3+3,alpha:0,onComplete:function () {
            _this.removeChild(_this._bg);
            _this._bg = null;
            _this.removeChild(_this._label);
            _this._label = null;
            if(_this.parent) _this.parent.removeChild(_this);
        },ease:Linear.easeInOut});
    }
}
