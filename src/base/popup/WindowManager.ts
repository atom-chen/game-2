import WindowDesc from "./WindowDesc";
import BaseWindow from "./BaseWindow";
import PopUpManager from "./PopUpManager";
import {EventEmitter} from 'eventemitter3'
/**
 * Created by yaozhiguo on 2016/12/1.
 * 管理窗口弹出和消除。
 * @see BaseWindow
 */
export default class WindowManager
{
    private static windows: Array<WindowDesc> = [];
    private static eventEmitter = new EventEmitter()

    public constructor()
    {
        throw new Error("current class can not be constructed!");
    }

    public static emit(event: string, ...args: Array<any>): boolean
    {
        return WindowManager.eventEmitter.emit(event, ...args)

    }

    public static on(event: string, fn, context?: any){
        WindowManager.eventEmitter.on(event,fn, context)
        return WindowManager
    }
    public static once(event: string, fn, context?: any)
    {
        WindowManager.eventEmitter.once(event,fn, context)
        return WindowManager
    }
    public static off(event: string, fn?, context?: any, once?: boolean)
    {
        WindowManager.eventEmitter.off(event,fn, context, once)
        return WindowManager
    }
    /**
     * 创建一个窗口对象。与showWindow的区别在于，它只负责创建，并不弹出。
     * @param WinClass 窗口的类定义。
     * @param winName 窗口的名字，可以自定义
     * @param desc 窗口的描述信息，默认无。
     * @param winData 需要传入窗口的数据。
     * @returns {BaseWindow} 创建或者缓存中对应类签名的对象。
     */
    public static createWindow(WinClass: any,winName: string, desc?: string, winData?: any): BaseWindow
    {
        var win: BaseWindow = WindowManager.getWindowByName(winName);
        if(win == null)
        {
            win = new WinClass();
            win.name = winName;
            if (winData)
                win.data = winData;
            var winDesc: WindowDesc = new WindowDesc();
            winDesc.winName = winName;
            winDesc.window = win;
            winDesc.desc = desc;
            WindowManager.windows.push(winDesc);
        }
        else
        {
            if(winData)
                win.data = winData;
        }
        return win;
    }

    /**
     * 弹出一个窗口对象。如果缓存中没有对应签名的弹出对象，则会先创建，再弹出，并保存于当前管理器中。
     * @param WinClass 窗口的类定义。
     * @param winName 窗口的名字，可以自定义
     * @param desc 窗口的描述信息，默认无。
     * @param winData 需要传入窗口的数据。
     * @returns {BaseWindow} 创建或者缓存中对应类签名的对象。
     */
    public static showWindow(WinClass: any,winName: string,desc?: string, winData?: any): BaseWindow
    {
        var win: BaseWindow = WindowManager.createWindow(WinClass,winName,desc,winData);
        PopUpManager.addPopUp(win);
        return win;
    }

    /**
     * 根据窗口名获取窗口对象。
     * @param winName 窗口名
     * @returns {any}
     */
    public static getWindowByName(winName: string): BaseWindow
    {
        for(var i: number = WindowManager.windows.length - 1;i >= 0;i--)
        {
            var win: WindowDesc = WindowManager.windows[i];
            if(win.winName == winName)
            {
                return win.window;
            }
        }
        return null;
    }

    /**
     * 判断某个窗口是否存在于本管理器中（缓存队列）。
     * @param window
     * @returns {boolean}
     */
    public static exist(window:BaseWindow):boolean
    {
        for(var i: number = WindowManager.windows.length - 1;i >= 0;i--)
        {
            var win: WindowDesc = WindowManager.windows[i];
            if(win.window == window)
            {
                return true;
            }
        }
        return false;
    }

    /**
     * 注销一个窗口：调用窗口自身的closeWindow(true)方法，然后从窗口池中注销。
     * @param winName
     * @param dispose
     */
    public static closeWindow(winName: string, dispose:boolean = false): boolean
    {
        for(var i: number = WindowManager.windows.length - 1;i >= 0;i--)
        {
            var winDesc: WindowDesc = WindowManager.windows[i];
            if(winDesc.winName == winName)
            {
                PopUpManager.removePopUp(winDesc.window);
                if (dispose)
                {
                    winDesc.window.dispose();
                    WindowManager.windows.splice(i,1);
                }
                return true;
            }
        }
        return false;
    }

    /**
     * 关闭当前所有窗口
     * @param dispose 是否注销所有窗口资源。如果是，则分别调用每个窗口的dispose方法，销毁窗口资源。默认false。
     */
    public static closeAllWindow(dispose: boolean = false):void
    {
        for(var i: number = WindowManager.windows.length - 1;i >= 0;i--)
        {
            var winDesc: WindowDesc = WindowManager.windows[i];
            PopUpManager.removePopUp(winDesc.window);
            if(dispose)
            {
                winDesc.window.dispose();
                WindowManager.windows.splice(i,1);
            }
        }
    }
}