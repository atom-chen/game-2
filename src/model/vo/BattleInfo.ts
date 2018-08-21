import BaseInfo from "../../base/info/BaseInfo";
/**
 * Created by yaozhiguo on 2017/2/24.
 */
export default class BattleInfo extends BaseInfo
{
    public codeId:number = 0;//在请求用户代码时，服务器返回的识别码，需要客户端保存
    public userCode:string;
    public classId:string;
    public teacherId:string;
    public studentId:string;
}