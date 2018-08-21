
/**
 * 用于管理漂浮的文字,提示信息,并在相当短的时间内自动消失
 * @author rappel
 * @time 2017-3-13 16:00
 */

import FrameTweenLite from "../../base/utils/FrameTweenLite";
import Globals from "../../enums/Globals";
export default class ToastManager
{
    private static tipsContainer: egret.DisplayObjectContainer;

    public static init(layer:eui.UILayer):void
    {
        this.tipsContainer = new egret.DisplayObjectContainer();
        layer.addChild( this.tipsContainer );
    }

    public static centerShowTip(strTip:string, interval?:number):void
    {
        this.showTip(strTip, (Globals.GAME_WIDTH - 800) * 0.5, 560, interval);
    }

    /**
     * 利用egret.Tween将提示信息,平滑地在屏幕上飘动
     * 在没有设置posx, posy的情况下,默认将提示信息从正下方平滑上升到正中间的位置
     * @param {string} test 提示的文字,可以为html格式
     * @param {number} posx 提示信息起始的位置
     * @param {number} posy 提示信息起始的位置
     * @param {number} interval 提示信息展示的时长
     */
    public static showTip(strTip:string, posx?:number, posy?:number, interval?:number):void
    {
        posx || (posx = 360);
        posy || (posy = 560);
        //创建Egret TextField
        var wordTextField = new egret.TextField();
        wordTextField.textAlign = egret.HorizontalAlign.CENTER;
        wordTextField.verticalAlign = egret.VerticalAlign.MIDDLE;

        wordTextField.x = posx;
        wordTextField.y = posy;
        wordTextField.width = 800;
        wordTextField.height= 120;
        wordTextField.bold  = true;
        //渲染文字
        if(/<font[\s\S]*?>/.test( strTip )) 
        {
            wordTextField.textFlow = new egret.HtmlTextParser().parser( strTip );
        }
        else 
        {
            wordTextField.text = strTip;
        }
        this.tipsContainer.addChild( wordTextField );

        //平滑缓动效果
        var self = this;
        FrameTweenLite.killTweensOf(wordTextField);
        FrameTweenLite.fromTo(wordTextField, 1.2, {
                y: 560
            }, {
                y: 360,
                onComplete: function() {
                    if(self.tipsContainer.contains(wordTextField)) {
                        self.tipsContainer.removeChild( wordTextField );
                    }
                    FrameTweenLite.killTweensOf( wordTextField );
                }
        });
    }

    public showTips(tips:any, posx?:number, posy?:number, interval?:number)
    {
        if(tips.length)
        {
            tips.forEach( function(tip) {
                this.showTip(tip);
            }, this);
        }
    }
} 