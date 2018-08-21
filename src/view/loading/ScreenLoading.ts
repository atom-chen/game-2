import Globals from "../../enums/Globals";
import LayerManager from "../../manager/LayerManager";
/**
 *
 * @author 
 *
 */
export default class ScreenLoading extends egret.Sprite {
    
    private loadingMask: egret.Sprite;
    private maskContainer: egret.Sprite;
    private MASK_WIDTH: number = 0;
    
    // private mc: egret.MovieClip;
    private thumb:egret.Bitmap;

    private OFF_SET_X:number = 440;
    private OFF_SET_Y:number = 280;
    
	public constructor() 
	{
    	  super();
        this.createView();
	}
	
    private textField: egret.TextField;

    private createView(): void {
        this.textField = new egret.TextField();
        this.addChild(this.textField);
        this.textField.x = Globals.GAME_WIDTH * 0.5 - 240;
        this.textField.y = 450 + this.OFF_SET_Y;
        this.textField.size = 24;
        this.textField.width = 480;
        this.textField.height = 50;
        this.textField.textAlign = "center";
        this.textField.text = '请稍等...';
    }
    
    public showLoading(bgRes: string = 'loadingBg_jpg'):void
    {
        var loadingBg: egret.BitmapData = RES.getRes(bgRes);
        var bmp: egret.Bitmap = new egret.Bitmap(loadingBg);
        this.addChild(bmp);
        this.setChildIndex(bmp,0);

        this.maskContainer = new egret.Sprite();
        this.addChild(this.maskContainer);
        this.setChildIndex(this.maskContainer,1);

        this.loadingMask = new egret.Sprite();
        this.maskContainer.addChild(this.loadingMask);

        var bar: egret.BitmapData = RES.getRes('pic_progress-bar_png');
        var bmpBar: egret.Bitmap = new egret.Bitmap(bar);
        this.maskContainer.addChild(bmpBar);
        this.maskContainer.setChildIndex(bmpBar,0);
        bmpBar.mask = this.loadingMask;
        this.MASK_WIDTH = bmpBar.width;
        this.updateMaskGraphics(this.MASK_WIDTH, bmpBar.height);

        //背景
        var barBg: egret.BitmapData = RES.getRes('loading_pic_bg_png');
        var bmpBarBg: egret.Bitmap = new egret.Bitmap(barBg);
        bmpBarBg.x = (Globals.GAME_WIDTH - bmpBarBg.width) * 0.5;
        bmpBarBg.y = 800
        this.addChild(bmpBarBg);
        this.setChildIndex(bmpBarBg,1);

        this.maskContainer.x = (Globals.GAME_WIDTH - this.maskContainer.width) * 0.5;
        this.maskContainer.y = bmpBarBg.y +　(bmpBarBg.height - this.maskContainer.height) * 0.5;

        this.thumb = new egret.Bitmap(RES.getRes('pic_effect_png'));
        this.addChild(this.thumb);
        this.thumb.x = this.maskContainer.x - this.thumb.width;
        this.thumb.y = this.maskContainer.y + (this.maskContainer.height - this.thumb.height) * 0.5;
    }
    
    private updateMaskGraphics(w:number, h:number):void
    {
        this.maskContainer.graphics.clear();
        this.maskContainer.graphics.beginFill(0,0);
        this.maskContainer.graphics.drawRect(0,0,w,h);
        this.maskContainer.graphics.endFill();
    }

    public setProgress(current: number,total: number): void 
    {
        this.updateMask(current,total);
    }

    private updateMask(cur: number,max: number): void 
    {
        var offset:number = 20;
        this.loadingMask.graphics.clear();
        this.loadingMask.graphics.beginFill(0,1);
        var progress: number = this.MASK_WIDTH * cur / max;
        this.loadingMask.graphics.moveTo(0, 0);
        this.loadingMask.graphics.lineTo(progress - offset, 0);
        this.loadingMask.graphics.lineTo(progress, this.maskContainer.height/2);
        this.loadingMask.graphics.lineTo(progress - offset, this.maskContainer.height);
        this.loadingMask.graphics.lineTo(0, this.maskContainer.height);
        this.loadingMask.graphics.lineTo(0, 0);
        // this.loadingMask.graphics.drawRect(0,0,progress,this.maskContainer.height);
        this.loadingMask.graphics.endFill();
        this.thumb.x = offset +　(this.maskContainer.x - this.thumb.width) + progress;
        this.textField.text = "loading..." + Math.ceil(cur) + "/" + max + '  ' + 
        '(' + (Math.ceil(progress / this.MASK_WIDTH * 100)) + '%)';
//        console.log(this.textField.text);
    }
    
    private static instance: ScreenLoading;

    public static show(): void {
        if(!ScreenLoading.instance)
            ScreenLoading.instance = new ScreenLoading();
        LayerManager.appLayer.addChildAt(ScreenLoading.instance, LayerManager.appLayer.numChildren - 1);
        ScreenLoading.instance.showLoading();
    }

    public static setProgress(cur:number, max:number):void
    {
        if(ScreenLoading.instance)
            ScreenLoading.instance.setProgress(cur, max);
    }
    
    public static hide(): void {
        if(LayerManager.appLayer.contains(ScreenLoading.instance))
            LayerManager.appLayer.removeChild(ScreenLoading.instance);
    }
}
