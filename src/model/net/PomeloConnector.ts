import Protocols from "../../enums/Protocols";
import NetManager from "./NetManager";
import Alert from "../../view/common/Alert";
import Platform from "../../platforms/Platform";
import md5 = require('md5')
/**
 * Created by yaozh on 2017/5/10.
 */
export default class PomeloConnector
{
    private socket:Pomelo;//后续通讯Socket
    private gate:Pomelo;//网关服务器

    private _isInitialled = false;
    private _boss:NetManager;

    private _userName:string;
    private _uid:number;

    public constructor(boss:NetManager)
    {
        this._userName = boss.userName;
        this._boss = boss;
    }

    public init(host:string, port:number):void
    {
        let _this = this;
        this.gate = new Pomelo();
        this.gate.on('io-error', function(e:any):void {
            console.log("socket has error:", e);
        });
        this.gate.init({host: host, port: port}, initCallback);

        function initCallback():void
        {
            _this.gate.request(
                Protocols.QUERY_ENTRY,
                {
                    name: _this._userName,
                    // pid:  ''
                    pid:  Platform.currentPlatform.platformAccount|| ''
                },
                (initResult) => {
                    _this.gate.disconnect();//在服务器把当前连接交给逻辑服务器时，网关服务器断开
                    if(initResult.code === 500)
                    {
                        console.error("Has error with GATE connection");
                        return;
                    }
                    egret.localStorage.setItem("login_name", initResult.username);
                    _this._uid = initResult.uid;
                    console.log("user id:" + _this._uid, "user name:" + _this._userName);

                    _this.initSocketServer(initResult, _this);
                }
            );
        }
    }

    private initSocketServer(gateServerResult:any, _this:PomeloConnector):void
    {
        _this.socket = new Pomelo();
        _this.socket.on('io-error', function(e:any):void {
            console.log("socket has error:");
        });
        _this.socket.on('close', function(e:any):void {
            console.log("socket is closed!");
            Alert.show('错误', '断开与服务器的连接', 2).once('confirm', ()=>{
                window.location.reload();
            }, this);
        });
        _this.socket.on('onResponse', function(e:any):void {
            console.log("onResponse");
        });

        _this.socket.init(
            {
                host: gateServerResult.host,
                port: gateServerResult.port
            },
            () => {
                _this._isInitialled = true;
                _this._boss.dispatchEvent(new egret.Event(NetManager.SERVERINITIALLED));
            }
        );
    }

    public callSocket(route:string, value?:Object):void
    {
        if(this._isInitialled)
        {
            if(value) value['uid'] = this._uid;
            else value = {uid:this._uid};
            this.socket.request(route, value, (data) => {
                this._boss.dispatchEvent(new egret.Event(NetManager.SERVERCALLBACK,false,false,{"route":route,"data":data}));
            });
        }else{
            console.error("服务器连接还没有初始化完成");
        }
    }

    public socketPush(route:string, callback:(response)=>void):void
    {
        if(this._isInitialled)
        {
            this.socket.on(route, callback);
        }
    }
}