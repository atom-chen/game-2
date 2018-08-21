import {IToolTip} from "./IToolTip";
/**
 * Created by yaozhiguo on 2016/12/30.
 * tip基类。不同的tip需要继承本类，可以通过skinName设置皮肤来定制外观，也可动态创建内容。
 * 在设置本类的toolTipData之后，需重写commitProperties, measure, updateDisplayList方法。
 * @see TextToolTip
 */
export default class ToolTip extends eui.Component implements IToolTip
{
    protected dataChanged:boolean = false;

    private _toolTipData:any;
    
    public get toolTipData():any
    {
        return this._toolTipData;
    }

    public set toolTipData(value:any)
    {
        this._toolTipData = value;
        this.dataChanged = true;

        this.invalidateProperties();
        this.invalidateSize();
        this.invalidateDisplayList();
    }

    public constructor()
    {
        super();
        this.touchChildren = false;
        this.touchEnabled = false;
    }
}