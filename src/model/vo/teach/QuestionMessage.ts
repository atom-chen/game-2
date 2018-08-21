import BaseInfo from "../../../base/info/BaseInfo";
import UserInfo from "../UserInfo";
/**
 * Created by yaozhiguo on 2017/3/7.
 */
export default class QuestionMessage extends BaseInfo
{
    public teacherId:string;
    public from:string;//学生id
    public fromName:string = '学生';
    public storyId:number;//问题关卡
    public code:string;
    public hadRead:boolean = false;//是否读过
    public requestTime:number;
    public userInfo:UserInfo;
    public studentEmail:string;

    public get formatRequestTime():string
    {
        let date:Date = new Date(this.requestTime * 1000);
        return date.getFullYear() + '-' + (date.getMonth() + 1)
        + '-' + date.getDate() + '    '
        + this.format60(date.getHours())
        + ':' + this.format60(date.getMinutes())
        + ':' + this.format60(date.getSeconds());
    }

    private format60(t:number):string
    {
        return t < 10 ? ('0' + t) : t.toString();
    }
}