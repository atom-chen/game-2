/**
 * Created by yaozhiguo on 2017/2/23.
 */
export default class TimerEvent extends egret.Event
{
    public static TIMER:string = "timerEvent";
    public static TIMER_COMPLETE:string = "timerComplete";

    public currentCount:number = 0;

    public constructor(type:string, currentCount:number, bubbles:boolean=false, cancelable:boolean=false)
    {
        super(type, bubbles, cancelable);
        this.currentCount = currentCount;
    }
}