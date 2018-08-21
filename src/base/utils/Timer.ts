import TweenLiteDriver from "./TweenLiteDriver";
import TimerEvent from "./TimerEvent";
/**
 * Created by yaozhiguo on 2017/2/23.
 */
export default class Timer extends egret.EventDispatcher
{
    private _repeatCount:number = 0;
    private _durationFrames:number = 0;

    private lastTick:number = 0;
    private currentRepeat:number = 0;

    /**
     *
     * @param duration 时间间隔，单位是毫秒
     * @param repeatCount 重复次数
     */
    public constructor(duration:number, repeatCount:number = 0)
    {
        super();
        this._repeatCount = repeatCount;
        this._durationFrames = duration * 0.001 * TweenLiteDriver.NORMAL_FPS;
    }

    private update(frameObject:Object):void
    {
        if (this._durationFrames <= 1)
        {
            this.run();
        }
        else
        {
            let currentTick:number = TweenLite.ticker['frame'];
            var elapsedTick:number = currentTick - this.lastTick;
            if (elapsedTick >= this._durationFrames)
            {
                this.run();
                this.lastTick = currentTick;
            }
        }
    }

    private run():void
    {
        this.currentRepeat++;
        if (this.repeatCount == 0)
        {
            this.dispatchEvent(new TimerEvent(TimerEvent.TIMER, this.currentRepeat));
        }
        else
        {
            if (this.currentRepeat < this.repeatCount)
            {
                this.dispatchEvent(new TimerEvent(TimerEvent.TIMER, this.currentRepeat));
            }
            else
            {
                this.dispatchEvent(new TimerEvent(TimerEvent.TIMER, this.currentRepeat));
                this.dispatchEvent(new TimerEvent(TimerEvent.TIMER_COMPLETE, this.currentRepeat));
                this.stop();
            }
        }
    }

    public reset():void
    {
        this.currentRepeat = 0;
    }

    public start():void
    {
        TweenLiteDriver.startTick(this.update, this);
    }

    public stop():void
    {
        TweenLiteDriver.stopTick(this.update, this);
    }

    public get durationFrames():number
    {
        return this._durationFrames;
    }

    public set durationFrames(value:number)
    {
        this._durationFrames = value;
    }

    public get repeatCount():number
    {
        return this._repeatCount;
    }

    public set repeatCount(value:number)
    {
        this._repeatCount = value;
    }
}