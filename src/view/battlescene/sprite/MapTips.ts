import Globals from "../../../enums/Globals";
/**
 * Created by sam on 2016/11/24.
 * 场景中显示格子坐标的tips
 */
export default class MapTips extends egret.DisplayObjectContainer {
    private _bg:egret.Shape;
    private _label:egret.TextField;

    public constructor(pt:egret.Point)
    {
        super();
        this.x = pt.x*Globals.TILE_WIDTH + 20;
        this.y = pt.y*Globals.TILE_HEIGHT - 15;
        this._bg = new egret.Shape();
        this._bg.graphics.beginFill(0x000000, 0.5);
        this._bg.graphics.drawRect(0, 0, 90, 30);
        this._bg.graphics.endFill();
        this.addChild(this._bg);
        this._label = new egret.TextField();
        this._label.textColor = 0xffffff;
        this._label.width = 90;
        this._label.textAlign = "center";
        this._label.text = "x:"+pt.x+",y:"+pt.y;
        this._label.size = 18;
        this._label.x = 2;
        this._label.y = 4;
        this.addChild(this._label);
    }

    public dispose()
    {
        this._bg.graphics.clear();
        this._bg = null;
        this._label = null;
    }
}
