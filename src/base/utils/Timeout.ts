import TweenLiteDriver from "./TweenLiteDriver";
/**
 * Created by yaozhiguo on 2017/2/23.
 */
export default class Timeout
{
    private static setTimeoutCache:any = {};
    private static setTimeoutIndex:number = 0;

    private static setTimeoutCount:number = 0;
    private static lastFrame:number = 0;

    /**
     * 在指定的延迟（以毫秒为单位）后运行指定的函数。
     * @param listener {Function} 侦听函数
     * @param thisObject {any} this对象
     * @param delay {number} 延迟时间，以毫秒为单位
     * @param ...args {any} 参数列表
     * @returns {number} 返回索引，可以用于 clearTimeout
     */
    public static setTimeout(listener:Function, thisObject:any, delay:number, ...args):number
    {
        let delayFrames:number = delay * 0.001 * TweenLiteDriver.NORMAL_FPS;

        let data = {listener: listener, thisObject: thisObject, delay: delayFrames, params: args};

        this.setTimeoutCount++;
        if (this.setTimeoutCount == 1 && TweenLite.ticker)
        {
            this.lastFrame = TweenLite.ticker['frame'];
            TweenLiteDriver.startTick(this.timeoutUpdate, this);
        }

        this.setTimeoutIndex++;
        this.setTimeoutCache[this.setTimeoutIndex] = data;
        return this.setTimeoutIndex;
    }


    /**
     * 清除指定延迟后运行的函数。
     * @param key {number} egret.setTimeout所返回的索引
     */
    public static clearTimeout(key:number):void
    {
        if (this.setTimeoutCache[key])
        {
            this.setTimeoutCount--;
            delete this.setTimeoutCache[key];

            if (this.setTimeoutCount == 0 && TweenLite.ticker)
            {
                TweenLiteDriver.stopTick(this.timeoutUpdate, this);
            }
        }

    }

    /**
     * @private
     */
    private static timeoutUpdate(timeStamp:number):boolean
    {
        let deltaFrames:number = timeStamp['frame'] - this.lastFrame;
        this.lastFrame = timeStamp['frame'];

        for (let key in this.setTimeoutCache)
        {
            let key2:any = key;
            let data = this.setTimeoutCache[key2];
            data.delay -= deltaFrames;
            if (data.delay <= 0)
            {
                data.listener.apply(data.thisObject, data.params);
                this.clearTimeout(<number>key2);
            }
        }

        return false;
    }
}