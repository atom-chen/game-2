/**
 * Created by yaozhiguo on 2017/1/4.
 */
var mix = mix || {};

mix.mixButton = function(){
    eui.Button.prototype['mouseOver'] = false;
    eui.Button.prototype['onMouseOver'] = function(){
        this.mouseOver = true;
        this.invalidateState();
    };

    eui.Button.prototype['onMouseOut'] = function(){
        this.mouseOver = false;
        this.invalidateState();
    };

    eui.Button.prototype['getCurrentState'] = function(){
        if (!this.enabled)
            return "disabled";

        if (this.touchCaptured)
            return "down";

        if (this.mouseOver){
            return this.touchCaptured ? 'down' : 'over';
        }

        return "up";
    };

    /*eui.Button.prototype.constructor = function(){
     eui.Component.prototype.constructor.call(this);
     this.touchChildren = false;
     this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
     this.addEventListener(mouse.MouseEvent.MOUSE_OVER, this.onMouseOver, this);
     this.addEventListener(mouse.MouseEvent.MOUSE_OUT, this.onMouseOut, this);
     };*/

    eui.Button.prototype['initMouseEvent'] = function(){
        this.addEventListener(mouse.MouseEvent.MOUSE_OVER, this.onMouseOver, this);
        this.addEventListener(mouse.MouseEvent.MOUSE_OUT, this.onMouseOut, this);
    };

    // eui.Button.prototype.initMouseEvent();
};

mix.mixButton();