import JsonAnalyzer = RES.JsonAnalyzer;
import Timer from "../../../base/utils/Timer";
import TimerEvent from "../../../base/utils/TimerEvent";
/**
 * Created by sam on 2016/11/25.
 * 实现plist动画文件的读取,显示
 */
export default class FrameEffect extends egret.Bitmap {

    private _allTexture:Object;                         //纹理全部
    private _length:number;
    private _name;
    private _animationIndex = 1;
    private _speed = 1;
    public isLoop:boolean = false;
    public constructor(plistName:string)
    {
        super();
        this._name = plistName;
        this._allTexture = new Object();
        var plist:egret.XML = RES.getRes(plistName+"_plist");
        var test: egret.Bitmap = new egret.Bitmap();
        test.texture = RES.getRes(plistName+"_png");
        var dict:egret.XML = <egret.XML><any>plist.children[0];
        var data:egret.XML = <egret.XML><any>dict.children[1];
        this._length = Math.floor(data.children.length/2);
        for (var i=0;i<this._length;i++)
        {
            var key:egret.XML = <egret.XML><any>data.children[i*2];
            var obj:egret.XMLText = <egret.XMLText><any>key.children[0];
            var fName:string = obj.text;
            var drawTexture: egret.RenderTexture = new egret.RenderTexture();
            var allT:egret.XML = <egret.XML><any>data.children[i*2+1];
            key = <egret.XML><any>allT.children[1];
            obj = <egret.XMLText><any>key.children[0];
            var sArr = obj.text.split(',');
            sArr[0] = sArr[0].slice(1);
            var offX:number = Number(sArr[0].slice(1));
            var offY:number = Number(sArr[1].slice(0,-1));
            var width:number = Number(sArr[2].slice(1));
            sArr[3] = sArr[3].slice(0,-1);
            var height:number = Number(sArr[3].slice(0,-1));
            key = <egret.XML><any>allT.children[7];
            obj = <egret.XMLText><any>key.children[0];
            sArr = obj.text.split(',');
            sArr[0] = sArr[0].slice(1);
            var fromX:number = Number(sArr[0].slice(1));
            var fromY:number = Number(sArr[1].slice(0,-1));
            key = <egret.XML><any>allT.children[9];
            obj = <egret.XMLText><any>key.children[0];
            drawTexture.drawToTexture(test, new egret.Rectangle(offX, offY, width, height), 1);
            drawTexture.$initData(0,0,width,height,fromX,fromY,width,height,width,height);
            if(i==0)
            {
                this.texture = drawTexture;
                key = <egret.XML><any>allT.children[9];
                obj = <egret.XMLText><any>key.children[0];
                sArr = obj.text.split(',');
                sArr[0] = sArr[0].slice(1);
                sArr[1] = sArr[1].slice(0,-1);
                this.anchorOffsetX = Number(sArr[0])/2;
                this.anchorOffsetY = Number(sArr[1])/2;
            }
            this._allTexture[fName] = drawTexture;
        }
        test = null;
        var timer:Timer = new Timer(40/this._speed,this._length);
        timer.addEventListener(TimerEvent.TIMER, this.onTimer, this);
        timer.addEventListener(TimerEvent.TIMER_COMPLETE, this.onTimerComplete, this);
        timer.start();
    }

    private onTimer(event:TimerEvent):void
    {
        this._animationIndex++;
        if(this._animationIndex>this._length) this._animationIndex = 1;
        this.texture = this._allTexture[this._name+" ("+this._animationIndex+").png"];
    }

    private onTimerComplete(event:TimerEvent):void
    {
        let timer:Timer = event.currentTarget;
        if(this.isLoop){
            timer.reset();
            timer.start();
        }else {
            timer.removeEventListener(TimerEvent.TIMER, this.onTimer, this);
            timer.removeEventListener(TimerEvent.TIMER_COMPLETE, this.onTimerComplete, this);
            if (this.parent) this.parent.removeChild(this);
            for (var texKey in this._allTexture) {
                this._allTexture[texKey].dispose();
                this._allTexture[texKey] = null;
            }
            this._allTexture = null;
        }
    }
}

//TODO dispose _allTexture
