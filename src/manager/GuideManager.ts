import GuideWindow from "../view/guide/GuideWindow";
import LayerManager from "./LayerManager";
import ConfigManager from "./ConfigManager";
import UserInfo from "../model/vo/UserInfo";
import DataAccessManager from "../base/da/DataAccessManager";
import DataAccessEntry from "../model/DataAccessEntry";
import ServerManager from "../model/net/NetManager";
/**
 * Created by yaozhiguo on 2017/2/14.
 */
export default class GuideManager
{
    public static GUIDE_LEVEL_START:number = 2001;
    public static GUIDE_LEVEL_DIALOG:number = 2003;
    public static GUIDE_FIRST_LEVEL_START:number = 2006;
    public static GUIDE_FIRST_LEVEL_CODE:number = 2011;
    public static GUIDE_FIRST_LEVEL_WIN:number = 2014;

    private static _instance:GuideManager;

    public static getInstance():GuideManager
    {
        if (!GuideManager._instance)
            GuideManager._instance = new GuideManager;
        return GuideManager._instance;
    }

    private _guideView:GuideWindow;//引导界面，包含dialog和点击区域
    private _currentGuideData:Object;//当前引导数据
    private _guideCallbacks:Object;//引导执行结束的回调列表
    private _enabled:boolean = true;

    public get currentGuideData():Object
    {
        return this._currentGuideData;
    }

    public constructor()
    {
        this._guideCallbacks = {};
        LayerManager.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onGuideTouch, this);
    }

    private onGuideTouch(event:egret.TouchEvent):void
    {
        if (!this._currentGuideData)return;
        let targetName:string = event.target.name;
        if (!targetName || targetName.length == 0)
        {
            targetName = event.target.parent.name;
        }
        console.log('[GuideManager.onGuideTouch]', targetName, event.stageX, event.stageY);
        if (this._currentGuideData['ui_target'] === targetName && targetName != "")
        {
            this.next();
        }
    }

    /**
     * 判断当前玩家是否通过引导关卡
     * @returns {boolean}
     */
    public finishGuideLevel():boolean
    {
        let userInfo:UserInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
        if (userInfo.storyID > 110001)return true;
        let cacheName:string = egret.localStorage.getItem("login_name");
        if (!cacheName || cacheName.length == 0)return false;
        if (cacheName != ServerManager.getInstance().userName)return false;
        let guideCache:string = egret.localStorage.getItem("guide_state");
        if (!guideCache || guideCache.length == 0)return false;
        let guideInfo:string[] = guideCache.split("|");
        if (guideInfo[0] == cacheName && guideInfo[1] == "yes")return true;
        return false;
    }

    /**
     * 开始引导。
     * @param guideId 当前引导序列的起始步骤id。
     * @param callback 本系列引导结束之后的回调。
     */
    public start(guideId:number, callback:Function = null):void
    {
        if (!this._enabled)return;
        let guideData:Object = ConfigManager.getInstance().getConfig('guide', guideId);
        if (!guideData)return;
        if (parseInt(guideData['is_key']) != 1)return;
        if (!this.checkTrigger(guideData))return;
        this._guideView = this.getGuideView();
        this._guideView.updateGuideData(guideData);
        this.show();
        this._currentGuideData = guideData;
        if (callback)
        {
            this._guideCallbacks[guideId] = callback;
        }
    }

    public startByLevel(levelID:number, pos:number):void
    {
        let levelData:Object = ConfigManager.getInstance().getConfig('pve_story_level', levelID);
        let guideIds:string[] = levelData['guide_id'].split('|');
        if (parseInt(guideIds[pos]) == 0)return;
        this.start(parseInt(guideIds[pos]));
    }

    /**
     * 跳转到下一步引导，如果引导结束，返回true。
     * @returns {boolean}
     */
    public next():boolean
    {
        if (!this._currentGuideData)return;
        let nextGuideId:number = parseInt(this._currentGuideData['next']);
        if (nextGuideId === 0)//引导结束
        {
            this.hide();
            //执行回调
            let guideKey:number = parseInt(this._currentGuideData['guide_key']);
            let calllback:Function = this._guideCallbacks[guideKey];
            if (calllback)
            {
                calllback();
                delete this._guideCallbacks[guideKey];
            }
            console.log("[GuideManager.next]", "current guide finished.");
            return true;
        }
        let guideData:Object = ConfigManager.getInstance().getConfig('guide', nextGuideId);
        this._guideView.updateGuideData(guideData);
        this._currentGuideData = guideData;
        console.log("[GuideManager.next]", guideData);
        return false;
    }

    private checkTrigger(guideData:Object):boolean
    {
        let userInfo:UserInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
        let guideTriggerType:number = parseInt(guideData['trigger_type']);
        let guideTriggerValue:any = guideData['trigger_value'];

        let result:boolean = false;
        switch(guideTriggerType)
        {
            case 0: //引导定制关卡
            {
                result = (110000 == parseInt(guideTriggerValue)) && !this.finishGuideLevel();
                break;
            }
            case 1: //storyid
            {
                result = (userInfo.storyID == parseInt(guideTriggerValue)) && this.finishGuideLevel();
                break;
            }
        }
        return result;
    }

    private getGuideView():GuideWindow
    {
        if (!this._guideView)
        {
            this._guideView = new GuideWindow();
            LayerManager.stage.addChildAt(this._guideView, LayerManager.stage.numChildren - 1);
        }
        return this._guideView;
    }

    public show():void
    {
        if (this._guideView)
        {
            this._guideView.visible = true;
        }
    }

    public hide():void
    {
        if (this._guideView)
        {
            this._guideView.visible = false;
        }
    }

    /**
     * 打开新手引导
     */
    public open():void
    {
        this._enabled = true;
    }

    /**
     * 关掉新手引导
     */
    public shut():void
    {
        this._enabled = false;
    }
}