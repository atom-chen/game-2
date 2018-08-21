import EventDispatcher = egret.EventDispatcher;
import IEventDispatcher = egret.IEventDispatcher;
/**
 * Created by yaozhiguo on 2016/12/5.
 */
export default class DataAccessProxy extends EventDispatcher
{
    protected _name:string;
    protected _data:any;

    public constructor(name:string, data?:any, target?:IEventDispatcher)
    {
        super(target);
        this._name = name;
        this._data = data;
    }

    public get name():string
    {
        return this._name;
    }

    public get data():any
    {
        return this._data;
    }

    public set data(dat:any)
    {
        this._data = dat;
    }

    public dispose():void
    {
        this._data = null;
    }
}