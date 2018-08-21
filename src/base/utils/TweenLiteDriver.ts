/**
 * Created by yaozhiguo on 2017/2/23.
 */
/**
 * Created by yaozhiguo on 2017/2/23.
 */
export default class TweenLiteDriver
{
    public static NORMAL_FPS:number = 30;

    private static ticks:Array<Object> = [];
    private static _fps:number = 30;
    private static _time:number = 0;

    public static getFps():number
    {
        return this._fps;
    }

    public static init():void
    {
        TweenLite.ticker['useRAF'](false);//do not use RequestAnimationFrame
        TweenLite.ticker.addEventListener('tick', (event)=>{
            this.update();
        }, TweenLiteDriver);
        this._time = 0;
    }

    private static update():void
    {
        let timeTick:number = egret.getTimer();
        for (let i in this.ticks)
        {
            let tick = this.ticks[i];
            if (tick)
            {
                //let tickParam:Object = {frame:TweenLite.ticker['frame'], time:TweenLite.ticker['time']};
                //TweenLite的bug：无论帧率多少，time始终按1000ms/30帧来算，所以这里自己做了一个时间累加器
                let tickParam:Object = {frame:TweenLite.ticker['frame'], time:timeTick};
                tick['callback'].apply(tick['context'], [tickParam]);
            }
        }
    }

    /**
     * 返回当前驱动的tick值
     * @returns {any}
     */
    public static getCurrentTick():number
    {
        return TweenLite.ticker['frame'];
    }

    public static setFps(frameRate:number):void
    {
        TweenLite.ticker['fps'](frameRate);
        this._fps = frameRate;
    }

    public static startTick(tick:Function, context:any):void
    {
        for (let key in this.ticks)
        {
            if (this.ticks[key]['callback'] === tick && this.ticks[key]['context'] === context)return;
        }
        let tickObj:Object = {callback:tick, context:context};
        this.ticks.push(tickObj);
    }

    public static stopTick(callback:Function, context:any):void
    {
        for (let i:number = this.ticks.length - 1; i>= 0; i--)
        {
            let tick:Object = this.ticks[i];
            if (tick['callback'] === callback && tick['context'] === context)
            {
                let deleteObj:Object = this.ticks.splice(i, 1)[0];
                deleteObj['callback'] = null;
                deleteObj['context'] = null;
                break;
            }
        }
    }

    /**
     * 帧数转换成真实时间长度
     * @param numFrame
     * @returns {number}
     */
    public static frame2time(numFrame:number):number
    {
        return 1000 / this._fps * numFrame;
    }

    /**
     * 时间长度转换成当前fps下的对应的帧数
     * @param timeDuration 毫秒
     */
    public static time2frame(timeDuration:number):number
    {
        return Math.floor(timeDuration * this.NORMAL_FPS / 1000);
    }
}