import DataAccessProxy from "../../base/da/DataAccessProxy";
import IEventDispatcher = egret.IEventDispatcher;
import ServerManager from "../net/NetManager";
import Globals from "../../enums/Globals";
/**
 * Created by yaozhiguo on 2016/12/5.
 * 具有服务器数据访问能力的数据代理。内置服务器访问管理器server。
 */
export default class ServerAccessProxy extends DataAccessProxy
{

    public constructor(name:string, data?:any, target?:IEventDispatcher)
    {
        super(name, data, target);
        ServerManager.getInstance().addEventListener(ServerManager.SERVERCALLBACK,this.onServerDataReceived,this);
    }
    
    /**
     * parse raw data or cache into current class, then dispatch event to notify some listeners.
     * @param event
     */
    protected onServerDataReceived(event: egret.Event):void
    {
        let rawData:any = event.data;
        let route:string = rawData.route;
        let result:any = rawData.data;
        let code:number = result.code;
        if (code != Globals.STATUS_CODE_SUCCESS)
        {
            console.log('[ServerAccessProxy.onServerDataReceived] result code :', code);
            //to be handled error code here.
        }
        else
        {
            //console.log('[ServerAccessProxy.onServerDataReceived] result data :', rawData);
            this.parseReceivedData(rawData);
        }
        //console.log('[ServerAccessProxy.onServerDataReceived], result route:', route, 'data', rawData);
    }

    /**
     * subclass of this may override this method to parse the CORRECT(status code equals 200) data
     * @param rawData
     */
    protected parseReceivedData(rawData:any):void
    {

    }
}