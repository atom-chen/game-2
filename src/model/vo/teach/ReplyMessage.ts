import BaseInfo from "../../../base/info/BaseInfo";
/**
 * Created by yaozhiguo on 2017/3/8.
 */
export default class ReplyMessage extends BaseInfo
{
    public storyId:number;
    public hadRead:boolean;
    public code:string;
    public createTime:number;

    public get formatCreateTime():string
    {
        let date:Date = new Date(this.createTime * 1000);
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