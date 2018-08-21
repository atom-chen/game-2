/**
 * Created by yaozhiguo on 2017/1/4.
 */
var mix = mix || {};

mix.mixDisplayObject = function(){
    egret.DisplayObject.prototype['t1'] = 0;
    egret.DisplayObject.prototype['initDoubleEvent'] = function() {
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);
    };

    egret.DisplayObject.prototype['onTouchTap'] = function(){
        var t2 = egret.getTimer();
        if (t2 - this.t1 <= 400)
        {
            this.dispatchEvent(new egret.Event('doubleClick', true, true));
        }
        this.t1 = t2;
    };

    /*egret.DisplayObject.prototype.constructor = function(){
        egret.EventDispatcher.prototype.constructor.call(this);
        this.initDoubleEvent();
    };*/
};

mix.mixDisplayObject();