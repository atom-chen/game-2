import PomeloConnector from "./PomeloConnector";
/**
 * Created by sam on 2016/11/24.
 * 服务器管理前后端通讯。
 */

export default class NetManager extends egret.EventDispatcher
{
    public static SERVERINITIALLED  : string = "server_initialled";                             //服务器初始化完成
    public static SERVERCALLBACK    : string = "server_data_callback";

    private _userName:string = "";

    private _connector:PomeloConnector;
    
    private static _instance: NetManager;
    static getInstance(): NetManager
    {
        if(this._instance == null)
        {
            this._instance = new NetManager();
        }
        return this._instance;
    }

    public get userName():string
    {
        return this._userName;
    }

    public set userName(value:string)
    {
        this._userName = value;
    }

    //初始化服务器连接
    public init(): void
    {
        let sysConfig:Object = RES.getRes('sys_json');
        let gateSocketIP:string = sysConfig['websocket']['host'];
        let gateSocketPort:number = sysConfig['websocket']['port'];

        this._connector = new PomeloConnector(this);
        this._connector.init(gateSocketIP, gateSocketPort);
    }

    //访问后台socket
    public callServerSocket(route:string,value?:any): void
    {
        console.log('callServerSocket', route, value)
        this._connector.callSocket(route, value);
    }

    //被动接受服务器推送消息， cb逻辑处理function
    public onServerCall(route:string,cb?:any): void
    {
        console.log('onServerCall', route)
        this._connector.socketPush(route, cb);
    }
}
