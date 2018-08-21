/**
 * 装备卡牌
 * @auther rappel
 * @time 2016-12-23 17:23
 */
import WindowManager from "../../../base/popup/WindowManager";
import EquipTipWindow from "./EquipTipWindow";
import ServerManager from "../../../model/net/NetManager";
import EquipSuite from "./EquipSuite";
import EquipWindow from "./EquipWindow";
import ToastManager from "../../common/ToastManager";
import FrameTweenLite from "../../../base/utils/FrameTweenLite";
import Protocols from "../../../enums/Protocols";

export default class EquipCard extends eui.Component
{
    //品质对于的颜色
    public static RANGECOLOR = ['white', 'green', 'purple', 'orange', 'golden'];

    //职业: 1战士 2法师 3枪手 4密探 5钢铁战士
    public static HEROCAREER = ['all', 'warrior', 'mage', 'gunman', 'assassin'];

    private equipQualityImg: eui.Image;
    private equipIconImg: eui.Image;
    private equipNameLabel: eui.Label;
    private heroCareer: eui.Image;
    private infoBtn: eui.Component;
    private tipImage;
    private restrictedImg: eui.Image;

    public ID: number;          //装备配置id
    public uuid: number;        //装备唯一id
    public userId: number;      //装备所属玩家id
    public type: number;        //装备类型:主手,副手,盔甲,晶石...之类的
    public cardSuite:EquipSuite;
    public heroClass: number;   //装备所属职业

    public isOwned: boolean;     //是否拥有
    public isEquiped: boolean;   //是否已装备
    public isRestricted: boolean;//是否受限
    public guidType: string; 

    constructor(cardSuite:EquipSuite)
    {
        super();
        this.skinName = "EquipCardSkin";
        this.name = 'EquipCard';

        this.cardSuite = cardSuite;
        this.ID        = cardSuite['ID'];
        this.type      = cardSuite['type'];
        this.heroClass = cardSuite['heroClass'];

        this.isOwned   = cardSuite['isOwned'];
        if(this.isOwned)
        {
            this.uuid     = cardSuite['uuid'];
            this.userId   = cardSuite['userId'];
        }
        this.isRestricted = cardSuite.isRestricted;
        this.isEquiped    = cardSuite.isEquiped;

        this.equipQualityImg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this);
        this.equipIconImg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this);
        this.equipNameLabel.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this);
        this.heroCareer.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this);

        this.infoBtn.addEventListener( egret.TouchEvent.TOUCH_TAP, this.onTouchInfoBtnHandler, this );
    }

    protected childrenCreated()
    {
        super.childrenCreated();

        this.updateView();
    }

    private onTouchHandler(e:egret.TouchEvent)
    {
        if(!this.isOwned)
        {
            let strTip = "<font color='#ff9900' size='31'>未装备上,该装备待收集</font>";
            ToastManager.showTip( strTip );
            return;
        }

        if(this.isRestricted)
        {
            let strTip = "<font color='#ff9900' size='31'>该装备不能用于当前英雄</font>";
            ToastManager.showTip( strTip );
            return;
        }
        this.RequestOperate();
    }

    public RequestOperate()
    {
        /**
         * 对于晶石与非晶石的卡牌要分类讨论
         * 1.非晶石的卡牌,搜索卡槽就能找到seat,直接通知后端
         * 2.晶石类的卡牌,就需要先找到那一组可放置的卡槽,以此追加
         */
        var type = this.type;
        if(-1 != EquipWindow.SPECIFIC_TYPES.indexOf( this.type ))
        {
            let equipWin = WindowManager.getWindowByName('EquipWindow');
            type = equipWin['getSlotPosForSpecialCard']( this );
        }

        let equipWin = WindowManager.getWindowByName('EquipWindow');
        let heroId = equipWin['heroInfo']['uuid']; 
        //发消息给后端,通知装备到卡槽
        ServerManager.getInstance().callServerSocket(Protocols.ROUTE_USEITEM, {
            hid: heroId,
            id: this.uuid,
            seat: type
        });
    }
    
    /**
     * 弹出提示界面
     */
    private onTouchInfoBtnHandler(e:egret.TouchEvent)
    {
        if(this.cardSuite)
        {
            WindowManager.showWindow( EquipTipWindow, 'EquipTipWindow', '装备提示界面', this.cardSuite );
        }
    }

    public setEquiped( isEquiped:boolean )
    {
        this.isEquiped = isEquiped;
        this.cardSuite.isEquiped = isEquiped;
    }

    public setRestricted( isRestricted:boolean )
    {
        this.isRestricted = isRestricted;
        this.cardSuite.isRestricted = isRestricted;

        if(!this.restrictedImg) {
            this.restrictedImg = new eui.Image();
            this.restrictedImg.source = RES.getRes('common_utils_json.card_icon_limit_png');
        }
        
        this.restrictedImg.x = 79;
        this.restrictedImg.y = 101;
        this.restrictedImg.visible = isRestricted;
        if(isRestricted) {
            this.restrictedImg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this);
            this.addChild( this.restrictedImg );
        }
        else {
            this.restrictedImg.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this);
        }
    }

    public updateView()
    {
        this.equipQualityImg.source = RES.getRes('card_' + EquipCard.RANGECOLOR[(this.cardSuite['rarity'] || 1)-1] + '_png');
        this.equipIconImg.source    = 'resource/icon/equip/' + this.cardSuite.iconSrc.toLowerCase() + '.png';
        this.equipNameLabel.text    = this.cardSuite['name'];

        if(this.isRestricted) {
            this.setRestricted( this.isRestricted );
        }
        let colorFlilter = new egret.ColorMatrixFilter([
                                    0.3, 0.6, 0, 0, 0,
                                    0.3, 0.6, 0, 0, 0,
                                    0.3, 0.6, 0, 0, 0,
                                    0,   0,   0, 1, 0
                            ]);
        if(!this.isOwned || this.isRestricted)
        {
            this.equipQualityImg.filters = [colorFlilter];
            this.equipIconImg.filters    = [colorFlilter];
        }

        this.heroCareer.source = RES.getRes('common_utils_json.career_' + EquipCard.HEROCAREER[this.heroClass-1] + '_icon_png');
    }

    /**
     * 必备装备提示信息,需要在提示3次后自动消失
     */
    public showEquipTipInShortTime()
    {
        this.tipImage = new eui.Image();
        this.tipImage.source = RES.getRes('equip_json.equip_prompt_png');
        this.tipImage.visible= true;
        this.addChild( this.tipImage );
        this.tipImage.x = 27;
        this.tipImage.y = 110;
        this.tipImage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this);

        this.tipImage.alpha = 1;
        egret.Tween.removeTweens( this.tipImage );
        egret.Tween.get(this.tipImage).to({
            alpha: 0
        }, 1500).wait(500).to({
            alpha: 1
        }).to({
            alpha: 0
        }, 1500).wait(500).to({
            alpha: 1
        }).to({
            alpha: 0
        }, 1500).wait(500).call(function() {
            if(this.contains(this.tipImage)) {
                this.removeChild( this.tipImage );
            }
            this.tipImage && egret.Tween.removeTweens(this.tipImage);
        }, this);
    }

    public dispose()
    {
        this.equipQualityImg = null;
        this.equipIconImg    = null;
        this.equipNameLabel  = null;
        this.cardSuite       = null;

        if(this.tipImage) 
        {
            egret.Tween.removeTweens(this.tipImage);
            this.tipImage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchInfoBtnHandler, this);
        }

        this.equipQualityImg.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this);
        this.equipIconImg.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this);
        this.equipNameLabel.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this);
        this.heroCareer.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this);
        this.restrictedImg.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this);
        
        this.infoBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchInfoBtnHandler, this);
    }
}