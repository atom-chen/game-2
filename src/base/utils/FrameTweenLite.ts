import TweenLiteDriver from "./TweenLiteDriver";
/**
 * Created by yaozhiguo on 2017/2/23.
 * 本类中所有的时间单位是秒
 */
export default class FrameTweenLite
{
    private static tweenSet:TweenLite[] = [];

    public static delayedCall(delay:number, callback:Function, params?:any[], scope?:any):TweenLite
    {
        let tween:TweenLite = TweenLite.delayedCall(delay * TweenLiteDriver.NORMAL_FPS, callback, params, scope, true);
        this.tweenSet.push(tween);
        return tween;
    }

    public static from(target:Object, duration:number, vars:Object):TweenLite
    {
        vars['useFrames'] = true;
        let tween:TweenLite = TweenLite.from(target, duration * TweenLiteDriver.NORMAL_FPS, vars);
        this.tweenSet.push(tween);
        return tween;
    }

    public static fromTo(target:Object, duration:number, fromVars:Object, toVars:Object):TweenLite
    {
        fromVars['useFrames'] = true;
        toVars['useFrames'] = true;
        let tween:TweenLite = TweenLite.fromTo(target, duration * TweenLiteDriver.NORMAL_FPS, fromVars, toVars);
        this.tweenSet.push(tween);
        return tween;
    }

    public static getTweensOf(target:Object):any[]
    {
        return TweenLite.getTweensOf(target);
    }

    public static killDelayedCallsTo(func:Function):void
    {
        TweenLite.killDelayedCallsTo(func);
    }

    public static killTweensOf(target:Object, vars?:Object):void
    {
        let tweens:TweenLite[] = this.getTweensOf(target);
        for (let tween of tweens)
        {
            let pos:number = this.tweenSet.indexOf(tween);
            if (pos != -1)
            {
                this.tweenSet.splice(pos, 1);
            }
        }
        TweenLite.killTweensOf(target, vars);
    }

    public static killTween(tweenLite:TweenLite):void
    {
        let pos:number = this.tweenSet.indexOf(tweenLite);
        if (pos != -1)
        {
            this.tweenSet[pos].kill();
            this.tweenSet.splice(pos, 1);
        }
    }

    public static set(target:Object, vars:Object):TweenLite
    {
        let tween:TweenLite = TweenLite.set(target, vars);
        this.tweenSet.push(tween);
        return tween;
    }

    /**
     *
     * @param target
     * @param duration 单位是秒
     * @param vars
     * @returns {TweenLite}
     */
    public static to(target:Object, duration:number, vars:Object):TweenLite
    {
        vars['useFrames'] = true;
        let tween:TweenLite = TweenLite.to(target, duration * TweenLiteDriver.NORMAL_FPS, vars);
        this.tweenSet.push(tween);
        return tween;
    }

    public static killAll():void
    {
        for (let i in this.tweenSet)
        {
            this.tweenSet[i].kill();
        }
        this.tweenSet.length = 0;
    }
}