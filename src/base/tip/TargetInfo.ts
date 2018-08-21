import PopUpPosition from "../popup/PopUpPosition";
import TextToolTip from "./TextToolTip";
/**
 * Created by yaozhiguo on 2016/12/30.
 * 用于描述某个ToolTip相关信息的类。
 */
export default class TargetInfo
{
    /**
     * 绑定tip显示到某个目标，如某个Button
     */
    public target:egret.DisplayObject;
    /**
     * 目标对应的tooltip类。在鼠标移动到该目标上时，会生成或获取对应的实例，用于显示
     * @type {TextToolTip}
     */
    public toolTipCls:any = TextToolTip;
    /**
     * tooltip对象处于目标的相对位置。
     * @type {string}
     */
    public showPos:string = PopUpPosition.CENTER;
    /**
     * 当前ToolTipCls实例在显示时需要用到的数据：字符串或者其他类型
     */
    public toolTipData:any;
    /**
     * 每次鼠标移动到目标上,ToolTip显示的时间。
     * @type {number}
     */
    public showDuration:number = 0;
    /**
     * 鼠标移动到目标上，隔多久才显示ToolTip实例。
     * @type {number}
     */
    public timeToShow:number = 0;
}