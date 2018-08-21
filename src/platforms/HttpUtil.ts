import HttpMethod = egret.HttpMethod;
/**
 * Created by yaozhiguo on 2017/3/16.
 */
export default class HttpUtil
{
    public static useGet(route:string, sendData:any, onComplete:any, onError?:any):void
    {
        $.ajax(route, {
            type:HttpMethod.GET,
            data:JSON.stringify(sendData),
            dataType:'json',
            contentType:"application/json;charset=utf-8",
            xhrFields: {withCredentials: false},
            success:onComplete,
            error:onError
        });
    }

    public static usePost(route:string, sendData:any, onComplete:any, onError?:any):void
    {
        let setting = {
            type:egret.HttpMethod.POST,
            contentType:"application/json;charset=utf-8",
            data:JSON.stringify(sendData),
            dataType:'json',
            success:onComplete,
            xhrFields: {withCredentials: false},
            error:onError
        };
        $.ajax(route, setting);
    }

    public static usePut(route:string, sendData:any, onComplete:any, onError?:any):void
    {
        let setting = {
            type:'put',
            contentType:"application/json;charset=utf-8",
            data:JSON.stringify(sendData),
            dataType:'json',
            success:onComplete,
            xhrFields: {withCredentials: false},
            error:onError
        };
        $.ajax(route, setting);
    }

    public static jsonpGet(route:string, onComplete:Function, onError?:Function):void
    {
        $.ajax({
            type:'get',
            async:false,
            url:route + '?_format=application/javascript',
            dataType:'jsonp',
            jsonp:'callback',
            //jsonpCallback:'?',
            xhrFields: {withCredentials: false},
            success:(json:any)=>{
                onComplete(json);
            },
            error:(result)=>{
                if (onError){
                    onError(result);
                }
            }
        });
    }
}