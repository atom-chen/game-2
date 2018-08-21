import LayerManager from "../../manager/LayerManager";
import Globals from "../../enums/Globals";
import FrameTweenLite from "../../base/utils/FrameTweenLite";
/**
 * 加载ui系统素材
 * @author sam
 *
 */
export default class UIPopupLoading extends egret.Sprite
{
    public static POPUP_RES_LOAD_COMPLETE:string = "popupResLoadComplete";

    public sceneMask:egret.Sprite;
    private data:any;
    private bmpbg:egret.Bitmap;
    private bmp:egret.Bitmap;
    private currentGroupIndex:number = 0;
    private loadingMask: egret.Sprite;

    public constructor()
    {
        super();
        this.createLoadingUI();
    }

    public createLoadingUI(): void
    {
        this.sceneMask = new egret.Sprite();
        this.sceneMask.graphics.clear();
        this.sceneMask.graphics.beginFill(0, 1);
        this.sceneMask.graphics.drawRect(0,0,Globals.GAME_WIDTH,Globals.GAME_HEIGHT);
        this.sceneMask.alpha = 0;
        this.addChild(this.sceneMask);

        this.bmpbg = new egret.Bitmap(RES.getRes('small_loading_bg'));
        this.bmpbg.x = Globals.GAME_WIDTH/2 - 75;
        this.bmpbg.y = Globals.GAME_HEIGHT/2 - 75;
        this.bmpbg.alpha = 0;
        this.addChild(this.bmpbg);

        this.loadingMask = new egret.Sprite();
        this.addChild(this.loadingMask);

        this.bmp = new egret.Bitmap(RES.getRes('small_loading_top'));
        this.bmp.x = Globals.GAME_WIDTH/2 - 75;
        this.bmp.y = Globals.GAME_HEIGHT/2 - 75;
        this.addChild(this.bmp);
        this.bmp.alpha = 0;
        this.bmp.mask = this.loadingMask;

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
    }

    public onAddedToStage(event: egret.Event)
    {
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR,this.onResourceLoadError,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onResourceProgress,this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR,this.onItemLoadError,this);
        for(var i=0;i<this.data.length;i++)
        {
            RES.loadGroup(this.data[i],i);
        }
        this.sceneMask.alpha = 0;
        var that:any = this;
        FrameTweenLite.to(this.sceneMask,1,{alpha:0.7,onComplete:function () {
            that.bmp.alpha = 1;
            that.bmpbg.alpha = 1;
        }});
    }

    public static startPopupLoading(dat:any):void
    {
        let loadView:UIPopupLoading = new UIPopupLoading();
        loadView.loadCommonRes(dat);
        LayerManager.stage.addChildAt(loadView, LayerManager.stage.numChildren - 1);
    }

    public loadCommonRes(dat:any):void
    {
        this.data = dat;
        this.currentGroupIndex = 0;
    }

    /**
     * preload资源组加载完成
     */
    private onResourceLoadComplete(event: RES.ResourceEvent): void
    {
        this.currentGroupIndex++;
        if(this.currentGroupIndex>=this.data.length)
        {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR,this.onResourceLoadError,this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onResourceProgress,this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR,this.onItemLoadError,this);
            FrameTweenLite.killAll();
            LayerManager.stage.dispatchEvent(new egret.Event(UIPopupLoading.POPUP_RES_LOAD_COMPLETE,false,false,this.data));
            LayerManager.stage.removeChild(this);
        }
    }

    /**
     * 资源组加载出错
     * Resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent): void
    {

    }

    /**
     * preload资源组加载进度
     * loading process of preload resource
     */
    private onResourceProgress(event: RES.ResourceEvent): void
    {
        let angle = 360*event.itemsLoaded/event.itemsTotal;
        let n = Math.ceil(Math.abs(angle)/45);
        let angleA:number =angle/n;
        let startFrom = 270;
        angleA=angleA * Math.PI/180;
        this.loadingMask.graphics.clear();
        this.loadingMask.graphics.beginFill(0, 1);
        this.loadingMask.graphics.moveTo(Globals.GAME_WIDTH/2, Globals.GAME_HEIGHT/2);
        this.loadingMask.graphics.lineTo(Globals.GAME_WIDTH/2+80*Math.cos(startFrom),Globals.GAME_HEIGHT/2+80*Math.sin(startFrom));
        for (var i=1; i<=n; i++) {
            startFrom+=angleA;
            var angleMid=startFrom-angleA/2;
            var bx=Globals.GAME_WIDTH/2+80/Math.cos(angleA/2)*Math.cos(angleMid);
            var by=Globals.GAME_HEIGHT/2+80/Math.cos(angleA/2)*Math.sin(angleMid);
            var cx=Globals.GAME_WIDTH/2+80*Math.cos(startFrom);
            var cy=Globals.GAME_HEIGHT/2+80*Math.sin(startFrom);
            this.loadingMask.graphics.curveTo(bx,by,cx,cy);
        }
        if(angle!=360) this.loadingMask.graphics.moveTo(Globals.GAME_WIDTH/2, Globals.GAME_HEIGHT/2);
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent): void
    {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }
}
