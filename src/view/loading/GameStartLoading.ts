import SoundManager from "../../manager/SoundManager";
import ScreenLoading from "./ScreenLoading";
import LayerManager from "../../manager/LayerManager";
/**
 *
 * @author yzhiguo
 * 进入游戏时的loading
 */
export default class GameStartLoading extends egret.Sprite{
    
    private screenLoading:ScreenLoading;
    private RES_GROUP_COUNT:number   = 4;
    private currentGroupIndex:number = 0;
    
	public constructor()
    {
    	  super();
	}
	
	public load():void
	{
        this.screenLoading = new ScreenLoading();
        this.addChild(this.screenLoading);

        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json?ver=1.0.0", "resource/");
	}

    /**
     * 配置文件加载完成,开始预加载皮肤主题资源和preload资源组。
     */
    private onConfigComplete(event:RES.ResourceEvent):void
    {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onPreloadResourceComplete,this);
        RES.loadGroup('preload',100);
    }

    private onPreloadResourceComplete(event: RES.ResourceEvent): void
    {
        RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onPreloadResourceComplete,this);
        this.screenLoading.showLoading();
        //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
        var theme = new eui.Theme("resource/default.thm.json",this.stage);
        theme.addEventListener(eui.UIEvent.COMPLETE,this.onThemeLoadComplete,this);

        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR,this.onResourceLoadError,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onResourceProgress,this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR,this.onItemLoadError,this);
        RES.loadGroup("config",0);
        RES.loadGroup("mainscene",1);
        RES.loadGroup("common",2);
        RES.loadGroup("login",3);
    }
    
    private isThemeLoadEnd: boolean = false;
    /**
     * 主题文件加载完成,开始预加载
     */
    private onThemeLoadComplete(): void
    {
        this.isThemeLoadEnd = true;
        this.createScene();
    }
    private isResourceLoadEnd: boolean = false;
    /**
     * preload资源组加载完成
     */
    private onResourceLoadComplete(event: RES.ResourceEvent): void
    {
        if(event.groupName == "config")
        {
            LayerManager.stage.removeChild(this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR,this.onResourceLoadError,this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onResourceProgress,this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR,this.onItemLoadError,this);
            this.isResourceLoadEnd = true;
            this.currentGroupIndex = 0;
            this.createScene();
        }
        if(event.groupName == "sounds")
        {
            SoundManager.getInstance().playMusic('ui_mp3',0,0);//主城背景音乐
            SoundManager.getInstance().restoreSoundSetting();//还原缓存设置
        }
        this.currentGroupIndex++;
    }

    private createScene()
    {
        if(this.isThemeLoadEnd && this.isResourceLoadEnd)
        {
            //this.startCreateScene();
            this.dispatchEvent(new egret.Event('allLoadComplete'));
        }
    }
    
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent): void
    {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }
    /**
     * 资源组加载出错
     * Resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent): void
    {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //ignore loading failed projects
        this.onResourceLoadComplete(event);
    }
    /**
     * preload资源组加载进度
     * loading process of preload resource
     */
    private onResourceProgress(event: RES.ResourceEvent): void
    {
        var pro: number = this.currentGroupIndex + event.itemsLoaded / event.itemsTotal;
        this.screenLoading.setProgress(pro, this.RES_GROUP_COUNT);
    }
}
