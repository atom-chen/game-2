import Globals from "../../enums/Globals";
import LayerManager from "../../manager/LayerManager";
/**
 *
 * @author 
 *
 */
export default class NoProgressLoading extends egret.Sprite{
    
    private mc:egret.MovieClip;
    
	public constructor() {
    	  super();
        this.drawBG();
    	  this.createView();
    	  this.touchChildren = true;
    	  this.touchEnabled = true;
	}
	
	private drawBG(alpha:number = 1):void
	{
        this.graphics.clear();
        this.graphics.beginFill(0,alpha);
        this.graphics.drawRect(0,0,Globals.GAME_WIDTH,Globals.GAME_HEIGHT);
        this.graphics.endFill();
	}
	
    private textField: egret.TextField;

    private createView(): void {
        
        var loadingBg: egret.BitmapData = RES.getRes('smallLoadingBg_png');
        var bmp: egret.Bitmap = new egret.Bitmap(loadingBg);
        this.addChild(bmp);
        this.setChildIndex(bmp,0);
        bmp.x = (Globals.GAME_WIDTH - bmp.width) * 0.5;
        bmp.y = 250;
        
        var mcDataFactory: egret.MovieClipDataFactory =
            new egret.MovieClipDataFactory(RES.getRes('smallLoading_json'),RES.getRes('smallLoading_png'));
        //创建 MovieClip，将工厂生成的 MovieClipData 传入参数
        this.mc = new egret.MovieClip(mcDataFactory.generateMovieClipData("zhuanzhuan"));
        this.addChild(this.mc);
        this.mc.x = bmp.x + (bmp.width - this.mc.width) * 0.5 + 10;
        this.mc.y = bmp.y + (bmp.height - this.mc.height) * 0.5 - 10;
        this.mc.gotoAndPlay(1,-1);
        
        
        this.textField = new egret.TextField();
        this.addChild(this.textField);
        this.textField.x = Globals.GAME_WIDTH * 0.5 - 240;
        this.textField.y = 316;
        this.textField.size = 16;
        this.textField.width = 480;
        this.textField.height = 50;
        this.textField.textAlign = "center";
        this.textField.text = '加载中...';
    }
    
    private play():void
    {
        this.mc.gotoAndPlay(1, -1);
    }
    
    private static instance:NoProgressLoading;
    
    public static show(showBg:boolean = true):void
    {
        if (!NoProgressLoading.instance)
            NoProgressLoading.instance = new NoProgressLoading();
        LayerManager.appLayer.addChildAt(NoProgressLoading.instance, LayerManager.appLayer.numChildren - 1);
        NoProgressLoading.instance.play();
        var bgAlpha:number = showBg ? 1:0.6;
        NoProgressLoading.instance.drawBG(bgAlpha);
    }
    
    public static hide():void
    {
        if(LayerManager.appLayer.contains(NoProgressLoading.instance))
            LayerManager.appLayer.removeChild(NoProgressLoading.instance);
    }
}
