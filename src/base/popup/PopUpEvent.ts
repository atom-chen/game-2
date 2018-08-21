import {IPopUp} from "./IPopUp";
/**
 * Created by yaozhiguo on 2016/12/1.
 */
export default class PopUpEvent extends egret.Event
{
    /**
     * 添加一个弹出框，在执行完添加之后抛出。
     * @constant egret.eui.PopUpEvent.ADD_POPUP
     */
    public static ADD_POPUP = "addPopUp";
    /**
     * 移除一个弹出框，在执行完移除之后抛出。
     * @constant egret.eui.PopUpEvent.REMOVE_POPUP
     */
    public static REMOVE_POPUP = "removePopUp";
    /**
     * 移动弹出框到最前，在执行完前置之后抛出。
     * @constant egret.eui.PopUpEvent.BRING_TO_FRONT
     */
    public static BRING_TO_FRONT = "bringToFront";

    public popUp:IPopUp;
    public modal:boolean = false;

    public constructor(type: string,bubbles?: boolean,cancelable?: boolean,data?: any,
                       popUp: IPopUp = null,modal: boolean = false)
    {
        super(type,bubbles,cancelable,data);
    }

    public dispatchPopUpEvent(target: egret.EventDispatcher,type: string,popUp: IPopUp,modal:boolean):boolean
    {
        var event:PopUpEvent = egret.Event.create(PopUpEvent,type);
        event.popUp = popUp;
        event.modal = modal;
        var result = target.dispatchEvent(event);
        egret.Event.release(event);
        return result;
    }
}