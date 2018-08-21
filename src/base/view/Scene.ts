import {ICallback} from  "./ICallback"

/**
 * Created by yaozhiguo on 2016/11/10.
 * 场景类。游戏场景分主场景和战斗场景
 */

export default class Scene extends eui.Component implements ICallback
{
    public constructor()
    {
        super();
    }
    protected _data:any;
    public getData():any
    {
        return this._data;
    }

    public setData(data:any):void
    {
        this._data = data;
    }

    public onEnter():void{

    }

    public dispose():void
    {
        
    }

    public callback(route:string,response:any):void{

    }
}
