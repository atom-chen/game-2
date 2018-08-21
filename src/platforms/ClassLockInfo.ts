/**
 * Created by yaozh on 2017/7/20.
 */
export default class ClassLockInfo
{
    public classId:string = '';
    public state:number = 0;//状态 1锁定  0未锁定
    public lockOperator:string;//锁定者的教师ID
    public lockLvl:number = 0;//锁定等级
}