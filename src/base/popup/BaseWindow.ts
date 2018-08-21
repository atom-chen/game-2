import {IPopUp} from "./IPopUp";
import WindowManager from "./WindowManager";
import SoundManager from "../../manager/SoundManager";

/**
 * Created by yaozhiguo on 2016/12/1.
 */
export default class BaseWindow extends eui.Panel implements IPopUp
{
    /**
     * @params name 本窗口的名字，它作为窗口的唯一识别
     */
    public constructor(name?: string)
    {
        super();
        this.name = name;
    }

    /**
     * childrenCreated（）方法是否被父类调用过，即窗口是否初始化完成。
     * @type {boolean}
     */
    protected isComplete:boolean = false;

    /**
     * 窗口的数据
     */
    protected _data: any;
    public set data(value: any)
    {
        this._data = value;
        this.update();
    }

    public get data(): any
    {
        return this._data;
    }

    public isPopUp:boolean = false;
    /**
     * 是否缓存本窗口对象，如果缓存，在关闭时并不注销本对象，只是放入缓存池，下次打开时将直接从缓存队列中取出即可,默认是true
     */
    private _isCache:boolean = true;

    public get isCache():boolean
    {
        return this._isCache;
    }

    public set isCache(value:boolean)
    {
        this._isCache = value;
    }

    /*
     * 关闭按钮
     */
    public btnClose:eui.Button;

    /**
     * 注销本窗口对象时，需要释放资源的代码，子类需要覆盖本方法
     */
    public dispose():void
    {
        if (this.btnClose)
        {
            this.btnClose.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onCloseClick,this);
        }
    }


    /**
     * 在为data赋值之后，会自动调用本方法
     */
    private update():void
    {
        if (this.isComplete)
        {
            this.updateView();
        }
    }

    /**
     * 在update执行之后，如果皮肤初始化完毕则本方法会被调用。
     * 这个方法用于通过WindowManager传递数据给Window的形式。
     */
    protected updateView():void
    {

    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.isComplete = true;
        if (this.btnClose)
        {
            this.btnClose.name = 'btnClose';
            this.btnClose.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCloseClick, this);
        }
        if (this._data)
        {
            this.updateView();
        }
    }

    protected partAdded(partName: string,instance: any): void
    {
        super.partAdded(partName, instance);
    }

    public onCloseClick(e:egret.TouchEvent):void
    {
        SoundManager.getInstance().playEffect('u02_back_mp3');
        WindowManager.closeWindow(this.name, this.isCache);
    }
}