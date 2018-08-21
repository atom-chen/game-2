import TweenLiteDriver from "./TweenLiteDriver";
/**
 * Created by yaozhiguo on 2017/2/23.
 */
export default class Interval
{
    private static setIntervalCache:any = {};
    private static setIntervalIndex:number = 0;

    private static setIntervalCount:number = 0;
    private static lastFrame:number = 0;

    /**
     * 以指定的延迟（以毫秒为单位）间隔循环调用指定的函数。
     * @param listener {Function} 侦听函数
     * @param thisObject {any} this对象
     * @param delay {number} 延迟时间，以毫秒为单位
     * @param ...args {any} 参数列表
     */
     public static setInterval(listener:Function, thisObject:any, delay:number, ...args):number
    {
        let delayFrames:number = delay * 0.001 * TweenLiteDriver.NORMAL_FPS;
        let data = {listener: listener, thisObject: thisObject, delay: delayFrames,
            originDelay: delayFrames, params: args};

        this.setIntervalCount++;
        if (this.setIntervalCount == 1)
        {
            this.lastFrame = TweenLite.ticker['frame'];
            TweenLiteDriver.startTick(this.intervalUpdate, this);
        }
        this.setIntervalIndex++;
        this.setIntervalCache[this.setIntervalIndex] = data;
        return this.setIntervalIndex;
    }

    public static clearInterval(key:number):void
    {
        if (this.setIntervalCache[key])
        {
            this.setIntervalCount--;

            delete this.setIntervalCache[key];
            if (this.setIntervalCount == 0)
            {
                TweenLiteDriver.stopTick(this.intervalUpdate, this);
            }
        }
    }

    /**
     * @private
     *
     * @param dt
     */
    private static intervalUpdate(timeStamp:Object):boolean
    {
        let deltaFrames:number = timeStamp['frame'] - this.lastFrame;
        this.lastFrame = timeStamp['frame'];

        for (let key in this.setIntervalCache)
        {
            let data = this.setIntervalCache[key];
            data.delay -= deltaFrames;
            if (data.delay <= 0)
            {
                data.delay = data.originDelay;
                data.listener.apply(data.thisObject, data.params);
            }
        }
        return false;
    }
}