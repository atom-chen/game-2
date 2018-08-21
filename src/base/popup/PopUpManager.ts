import {IPopUp} from "./IPopUp";
import {PopUpManagerImpl} from "./PopUpManagerImpl";
/**
 * Created by yaozhiguo on 2016/12/1.
 * 管理弹窗，所有实现了IPopUp接口的类均可被管理。
 * @see IPopUp
 * @see PopUpManagerImpl
 */
export default class PopUpManager
{
    /**
     * 被当前类所维护的弹窗列表
     * @returns {Array<IPopUp>}
     */
    private static get popUpList(): Array<IPopUp>
    {
        return PopUpManager.Impl.popUpList;
    }

    /**
     * 模态窗口背景遮罩层的透明度
     * @returns {number}
     */
    public static get modalAlpha():number
    {
        return PopUpManager.Impl.modalAlpha;
    }

    public static set modalAlpha(value:number)
    {
        PopUpManager.Impl.modalAlpha = value;
    }

    /**
     * 模态窗口背景遮罩层的颜色
     * @returns {number}
     */
    public static get modalColor(): number
    {
        return PopUpManager.Impl.modalColor;
    }

    public static set modalColor(value: number)
    {
        PopUpManager.Impl.modalColor = value;
    }

    private static _impl:PopUpManagerImpl;

    public static get Impl():PopUpManagerImpl
    {
        if(!PopUpManager._impl)
        {
            PopUpManager._impl = new PopUpManagerImpl();
        }
        return PopUpManager._impl;
    }

    /**
     * 初始化
     * @param rootLayer 弹窗类的根容器，通常是eui.UILayer
     */
    public static init(rootLayer:eui.Group):void
    {
        PopUpManager.Impl.init(rootLayer);
    }

    /**
     * 弹出一个PopUp对象，如果center属性设置为false，则其会被放置于根容器的左上（0,0）
     * @param popUp 弹出对象
     * @param modal 是否模态，默认true
     * @param center 是否居于根容器中央，默认true
     */
    public static addPopUp(popUp: IPopUp,modal: boolean = true,center: boolean = true): void
    {
        PopUpManager.Impl.addPopUp(popUp, modal, center);
    }

    /**
     * 把某个弹出对象放置于最上层
     * @param popUp
     */
    public static bringToFront(popUp: IPopUp): void
    {
        PopUpManager.Impl.bringToFront(popUp);
    }

    /**
     * 让弹出对象位于根容器中央
     * @param popUp
     */
    public static centerPopUp(popUp: IPopUp): void
    {
        PopUpManager.Impl.centerPopUp(popUp);
    }

    /**
     * 从根容器移除一个弹出对象。注意，本操作只是把对象从跟容器移除，并没有销毁本对象。
     * @param popUp
     */
    public static removePopUp(popUp: IPopUp): void
    {
        PopUpManager.Impl.removePopUp(popUp);
    }

    public static addEventListener(type: string,listener: Function,thisObject: any,useCapture: boolean,priority: number): void
    {

    }

    // public static removeEventListener(type: string,listener: Function,thisObject: any,useCapture: boolean): void
    public static removeEventListener(popUp: IPopUp): void
    {
         PopUpManager.Impl.removePopUp(popUp);
    }
}