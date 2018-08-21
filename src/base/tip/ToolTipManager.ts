import PopUpPosition from "../popup/PopUpPosition";
import TextToolTip from "./TextToolTip";
import {IToolTip} from "./IToolTip";
import TargetInfo from "./TargetInfo";
/**
 * Created by yaozhiguo on 2016/12/30.
 */
export default class ToolTipManager
{
    private static _tipLayer:egret.DisplayObjectContainer;
    private static _currentTarget:egret.DisplayObject;
    private static _currentToolTip: IToolTip;
    private static _targetInfoList:Array<TargetInfo> = [];
    private static _toolTipCacheMap:Object = {};

    public static init(tipLayer:egret.DisplayObjectContainer)
    {
        this._tipLayer = tipLayer;
        tipLayer.touchChildren = false;
        tipLayer.touchEnabled = false;
    }

    /**
     * 给一个显示对象注册tip功能。
     * @param target 需要绑定tip能力的目标对象
     * @param toolTipData tip实例显示时需要的数据。
     * @param ToolTipCls tip类定义。
     * @param showPos tip实例相对目标的位置。PopUpPosition中定义有可选值。
     */
    public static register(target:egret.DisplayObject, toolTipData:any, ToolTipCls: any = TextToolTip, showPos: string = PopUpPosition.CENTER):void
    {
        let targetInfo = ToolTipManager.getTargetInfo(target);
        if (!targetInfo)
        {
            targetInfo = new TargetInfo();
            targetInfo.target = target;
            targetInfo.toolTipData = toolTipData;
            targetInfo.toolTipCls = ToolTipCls;
            targetInfo.showPos = showPos;
            targetInfo.showDuration = 0;
            targetInfo.timeToShow = 0;
            ToolTipManager._targetInfoList.push(targetInfo);
        }
        else
        {
            targetInfo.toolTipData = toolTipData;
            targetInfo.toolTipCls = ToolTipCls;
            targetInfo.showPos = showPos;
        }

        target.addEventListener(mouse.MouseEvent.MOUSE_OVER, ToolTipManager.toolTipMouseOverHandler, ToolTipManager);
        target.addEventListener(mouse.MouseEvent.MOUSE_OUT, ToolTipManager.toolTipMouseOutHandler, ToolTipManager);
    }

    /**
     * 取消绑定在显示对象上的tip。
     * @param target
     */
    public static unRegister(target:egret.DisplayObject):void
    {
        let targetInfo = ToolTipManager.getTargetInfo(ToolTipManager._currentTarget);
        if(targetInfo)
        {
            let tipClass: any = targetInfo.toolTipCls;
            let key: string = egret.getQualifiedClassName(tipClass);
            targetInfo.toolTipCls = null;
            targetInfo.toolTipData = null;
            delete ToolTipManager._toolTipCacheMap[key]; //删除缓存ToolTip对象
            let targetIndex:number = ToolTipManager._targetInfoList.indexOf(targetInfo); //删除targetInfo
            if (targetIndex != -1)
            {
                ToolTipManager._targetInfoList.splice(targetIndex, 1);
            }
        }
        target.removeEventListener(mouse.MouseEvent.MOUSE_OVER,this.toolTipMouseOverHandler,this);
        target.removeEventListener(mouse.MouseEvent.MOUSE_OUT,this.toolTipMouseOutHandler,this);
    }

    private static getTargetInfo(target:egret.DisplayObject):TargetInfo
    {
        for (let targetInfo of ToolTipManager._targetInfoList)
        {
            if (targetInfo.target == target)
            {
                return targetInfo;
            }
        }
        return null;
    }

    private static toolTipMouseOverHandler(event):void
    {
        if (ToolTipManager._currentTarget)//移除之前tips
        {
            ToolTipManager.hide();
        }
        ToolTipManager._currentTarget = event.currentTarget;
        let targetInfo = ToolTipManager.getTargetInfo(ToolTipManager._currentTarget);
        if (targetInfo)
        {
            ToolTipManager.createTip(targetInfo);
        }
    }

    private static createTip(targetInfo:TargetInfo): void
    {
        let tipClass: any = targetInfo.toolTipCls;
        let key: string = egret.getQualifiedClassName(tipClass);
        ToolTipManager._currentToolTip = ToolTipManager._toolTipCacheMap[key];
        if(!ToolTipManager._currentToolTip)
        {
            ToolTipManager._currentToolTip = new tipClass();
            ToolTipManager._toolTipCacheMap[key] = ToolTipManager._currentToolTip;
        }
        ToolTipManager._currentToolTip.toolTipData = targetInfo.toolTipData;
        ToolTipManager._currentToolTip.validateNow();
        ToolTipManager._tipLayer.addChild(ToolTipManager._currentToolTip);
        ToolTipManager.layoutTip(targetInfo.showPos);
    }

    private static toolTipMouseOutHandler(event):void
    {
        ToolTipManager.hide();
    }

    private static hide():void
    {
        if(ToolTipManager._currentToolTip && ToolTipManager._currentToolTip.parent)
        {
            ToolTipManager._currentToolTip.parent.removeChild(ToolTipManager._currentToolTip);
        }
        ToolTipManager._currentToolTip = null;
    }

    /**
     * 设置ToolTip位置
     */
    private static layoutTip(pos:string): void
    {
        let x: number;
        let y: number;
        let tipLayer: eui.UILayer = <eui.UILayer>ToolTipManager._tipLayer;
        let toolTipWidth: number = ToolTipManager._currentToolTip.width;
        let toolTipHeight: number = ToolTipManager._currentToolTip.height;
        let rect: egret.Rectangle = ToolTipManager._currentTarget.getTransformedBounds(tipLayer);
        let centerX: number = rect.left + (rect.width - toolTipWidth) * 0.5;
        let centetY: number = rect.top + (rect.height - toolTipHeight) * 0.5;
        switch(pos)
        {
            case PopUpPosition.BELOW:
                x = centerX;
                y = rect.bottom;
                break;
            case PopUpPosition.ABOVE:
                x = centerX;
                y = rect.top - toolTipHeight;
                break;
            case PopUpPosition.LEFT:
                x = rect.left - toolTipWidth;
                y = centetY;
                break;
            case PopUpPosition.RIGHT:
                x = rect.right;
                y = centetY;
                break;
            case PopUpPosition.CENTER:
                x = centerX;
                y = centetY;
                break;
            case PopUpPosition.TOP_LEFT:
                x = rect.left;
                y = rect.top;
                break;
            case PopUpPosition.BOTTOM_RIGHT:
                x = rect.right;
                y = rect.bottom;
                break;
            default:
                x = centerX;
                y = centetY;
                break;
        }

        let screenWidth: number = tipLayer.width;
        let screenHeight: number = tipLayer.height;
        if(x + toolTipWidth > screenWidth)
            x = screenWidth - toolTipWidth;
        if(y + toolTipHeight > screenHeight)
            y = screenHeight - toolTipHeight;
        if(x < 0)
            x = 0;
        if(y < 0)
            y = 0;
        ToolTipManager._currentToolTip.x = x;
        ToolTipManager._currentToolTip.y = y;
    }
}