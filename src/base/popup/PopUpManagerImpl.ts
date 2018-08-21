import {IPopUp} from "./IPopUp";
import PopUpData from "./PopUpData";
/**
 * Created by yaozhiguo on 2016/12/1.
 */
export class PopUpManagerImpl extends egret.EventDispatcher{

    public static REMOVE_FROM_STAGE:string = egret.Event.REMOVED_FROM_STAGE;

    private _popUpList:Array<IPopUp> = [];
    private popUpDataList:Array<PopUpData> = [];
    private _modalColor:number = 0x000000;
    private _modalAlpha: number = 0.8;
    private invalidateModalFlag:boolean = false;
    private modalMask:eui.Rect = null;

    public constructor(target?:egret.IEventDispatcher)
    {
        super(target)
    }

    public get modalAlpha():number
    {
        return this._modalAlpha;
    }

    public set modalAlpha(value:number)
    {
        this._modalAlpha = value;
        this.invalidateModal();
    }

    public get modalColor():number
    {
        return this._modalColor;
    }

    public set modalColor(value:number)
    {
        this._modalColor = value;
        this.invalidateModal();
    }

    public get popUpList():Array<IPopUp>
    {
        return this._popUpList;
    }

    /**
     * 根据popUp获取对应的popUpData
     */
    private findPopUpData(popUp: IPopUp):PopUpData
    {
        var list:Array<PopUpData> = this.popUpDataList;
        var length:number = list.length;
        for(var i:number = 0;i < length;i++)
        {
            var data:PopUpData = list[i];
            if(data.popUp == popUp)
                return data;
        }
        return null;
    }

    public rootLayer:eui.Group;

    public init(root:eui.Group):void
    {
        this.rootLayer = root;
    }

    public addPopUp(popUp: IPopUp,modal: boolean=false,center: boolean=true): void
    {
        //var uiStage = eui.UIGlobals.uiStage;
        var data:PopUpData = this.findPopUpData(popUp);
        if(data)
        {
            data.modal = modal;
            popUp.removeEventListener(PopUpManagerImpl.REMOVE_FROM_STAGE,this.onRemoved,this);
        }
        else
        {
            data = new PopUpData(popUp, modal);
            this.popUpDataList.push(data);
            this._popUpList.push(popUp);
        }
//            uiStage.popUpContainer.addElement(popUp);
        this.rootLayer.addChild(popUp);
        if(center)
            this.centerPopUp(popUp);
        if("isPopUp" in popUp)
            popUp.isPopUp = true;
        if(modal)
        {
            this.invalidateModal();
        }
        popUp.addEventListener(PopUpManagerImpl.REMOVE_FROM_STAGE,this.onRemoved,this);
    }

    private onRemoved(event:egret.Event)
    {
        var index:number = 0;
        var list:Array<PopUpData> = this.popUpDataList;
        var length:number = list.length;
        for(var i:number = 0;i < length;i++)
        {
            var data:PopUpData = list[i];
            if(data.popUp == event.target)
            {
                if("isPopUp" in data.popUp)
                    (data.popUp).isPopUp = false;
                data.popUp.removeEventListener(PopUpManagerImpl.REMOVE_FROM_STAGE,this.onRemoved,this);
                this.popUpDataList.splice(index,1);
                this._popUpList.splice(index,1);
                this.invalidateModal();
                break;
            }
            index++;
        }
    }

    /**
     * 标记一个UIStage的模态层失效
     */
    private invalidateModal()
    {
        if(!this.invalidateModalFlag)
        {
            this.invalidateModalFlag = true;
            this.rootLayer.addEventListener(egret.Event.ENTER_FRAME,this.validateModal,this);
            this.rootLayer.addEventListener(egret.Event.RENDER,this.validateModal,this);
            this.rootLayer.invalidateSize();
            this.rootLayer.invalidateProperties();
            this.rootLayer.invalidateDisplayList();
        }
    }

    private validateModal(event:egret.Event):void
    {
        this.invalidateModalFlag = false;
        this.rootLayer.removeEventListener(egret.Event.ENTER_FRAME,this.validateModal,this);
        this.rootLayer.removeEventListener(egret.Event.RENDER,this.validateModal,this);
        this.updateModal(this.rootLayer);
    }
    /**
     * 更新窗口模态效果
     */
    private  updateModal(uiLayer:eui.Group):void
    {
        //var popUpContainer = uiStage.popUpContainer;
        var found = false;
        for(var i = uiLayer.numChildren - 1;i >= 0;i--)
        {
            var element:IPopUp = <IPopUp>uiLayer.getChildAt(i);
            var data = this.findPopUpData(element);
            if(data && data.modal)
            {
                found = true;
                break;
            }
        }
        if(found)
        {
            if(!this.modalMask)
            {
                this.modalMask = new eui.Rect();
                this.modalMask.touchEnabled = true;
                this.modalMask.top = this.modalMask.left = this.modalMask.right = this.modalMask.bottom = 0;
            }
            this.modalMask.fillColor = this._modalColor;
            this.modalMask.alpha = this._modalAlpha;
            if(this.modalMask.parent == uiLayer)
            {
                if(uiLayer.getChildIndex(this.modalMask) < i)
                    i--;
                uiLayer.setChildIndex(this.modalMask, i);
            }
            else
            {
                uiLayer.addChildAt(this.modalMask, i);
            }
        }
        else if(this.modalMask && this.modalMask.parent == uiLayer)
        {
            uiLayer.removeChild(this.modalMask);
        }
    };

    public bringToFront(popUp: IPopUp): void
    {
        var data:PopUpData = this.findPopUpData(popUp);
        //if(data && popUp.parent && "popUpContainer" in popUp.parent) {
        if(data && popUp.parent)
        {
            var uiStage = popUp.parent;
            uiStage.setChildIndex(popUp,uiStage.numChildren - 1);
            this.invalidateModal();
        }
    }

    public centerPopUp(popUp: IPopUp): void
    {
        popUp.top = popUp.bottom = popUp.left = popUp.right = NaN;
        popUp.verticalCenter = popUp.horizontalCenter = 0;
        var parent = popUp.parent;
        if(parent)
        {
            if("validateNow" in popUp)
                popUp.validateNow();
            var popUpBounds:egret.Rectangle = new egret.Rectangle();
            popUp.getLayoutBounds(popUpBounds);
            popUp.x = (parent.width - popUpBounds.width) * 0.5;
            popUp.y = (parent.height - popUpBounds.height) * 0.5;
        }
    }

    public removePopUp(popUp: IPopUp): void
    {
        if(popUp && popUp.parent && this.findPopUpData(popUp))
        {
            if("removeChild" in popUp.parent)
                (popUp.parent).removeChild(popUp);
//                else if(popUp.parent instanceof eui.UIComponent)
//                    (popUp.parent)._removeFromDisplayList(popUp);
            else if(popUp instanceof egret.DisplayObject)
                popUp.parent.removeChild(popUp);
        }
    }
}