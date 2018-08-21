/**
 * 装备界面,用于英雄战斗前的准备工作
 * @auther rappel
 * @time 2016-12-22 15:46
 */
import BaseWindow from "../../../base/popup/BaseWindow";
import DataAccessManager from "../../../base/da/DataAccessManager";
import DataAccessEntry from "../../../model/DataAccessEntry";
import UserInfo from "../../../model/vo/UserInfo";
import ConfigManger from "../../../manager/ConfigManager";
import EquipCard from "./EquipCard";
import EquipSlot from "./EquipSlot";
import EquipSuite from "./EquipSuite";
import CommonConfig from "../../../enums/CommonConfig";
import HeroInfo from "../../../model/vo/HeroInfo";
import ServerManager from "../../../model/net/NetManager";
import UserInfoProxy from "../../../model/da/UserInfoProxy";
import BattleStartLoading from "../../loading/BattleStartLoading";
import SoundManager from "../../../manager/SoundManager";

import ToastManager from "../../../view/common/ToastManager";
import MouseScroller from "../../common/MouseScroller";


export default class EquipWindow extends BaseWindow
{
    public static CARD_ATTRIBUTE = [214, 278, 214+37, 278+97];//card宽, 高, 水平间隙, 垂直间隙
    public static CARD_PERLINE:number = 5; //每行最多5张卡牌
    public static CARD_XPOS:number = 210;

    public static SPECIFIC_TYPES = [CommonConfig.EQUIP_BARITE_TYPE1, CommonConfig.EQUIP_BARITE_TYPE2, CommonConfig.EQUIP_BARITE_TYPE3];

    public static EQUIP_SLOT_POS:Array<number> = [64, 931, 180];

    private heroProfileImg: eui.Image;
    public heroInfo:HeroInfo;
    //Tabs
    private equipTabs:Array<any>;
    private equipTabIndex: number;
    private equipTab0:eui.Component;    private equipTab1:eui.Component;    private equipTab2:eui.Component;
    private equipTab3:eui.Component;    private equipTab4:eui.Component;    private equipTab5:eui.Component;
    private equipTab6:eui.Component;    private equipTab7:eui.Component;    private equipTab8:eui.Component;

    //Cards
    public equipCards: any;
    private equipScroller: eui.Scroller;
    private equipGroup: eui.Group;

    private equipSuites: any;
    private yPos: number = 0;

    private ownCutoffLineImg: eui.Image;
    private notownCutoffLineImg: eui.Image;
    private ownFrameImg: eui.Image;
    private notownFrameImg: eui.Image;
    private ownSignImg: eui.Image;
    private notownSignImg: eui.Image;
    private ownPrompt: eui.Image;
    private notownPrompt: eui.Image;

    //Slots
    private equipSlots: any;

    private healthValue: eui.Label;
    private damageValue: eui.Label;
    private speedValue: eui.Label;
    private viewValue: eui.Label;

    //fightBtn
    private fightBtn: eui.Button;
    /**
     * 前端数据 equipData
     * 后端数据 equipInfo
     * 前后端数据会被整合成 equipSuite,方便equipCards, equipSlots统一存储数据
     */
    constructor()
    {
        super();
        this.skinName = "EquipWindowSkin";
    }

    // private sortRule(equipCard1:EquipCard, equipCard2:EquipCard)
    // {
    //     let suite1:EquipSuite = equipCard1.cardSuite;
    //     let suite2:EquipSuite = equipCard2.cardSuite;

    //     if(suite1.heroClass == this.heroInfo['data']['type']) return 1;//职业
    //     if(suite2.heroClass == this.heroInfo['data']['type']) return 1;
    // }

    public setData(_data):void
    {
        this.data = _data;
    }

    protected updateView():void
    {
        super.updateView();
        this.fightBtn.name = 'fightBtn';
        this.equipScroller.scrollPolicyH = "off";

        MouseScroller.enableMouseScroller(this.equipScroller);

        //后端数据
        let userInfo:UserInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
        this.heroInfo = userInfo['ownedHero'];
        //this.heroProfileImg.source = RES.getRes('herocareer_' + this.heroInfo['data']['type'] + '_png');
        this.heroProfileImg.source = 'resource/icon/role/career_profile/' + this.heroInfo.data['career_figure'].replace('figure', 'profile') + '.png';

        let userEquipInfo = userInfo['equips'];
        let userHeroInfo  = userInfo['heros']; 

        //前端数据
        let equipConfig = ConfigManger.getInstance().getConfigs('equip');
        // console.log( equipConfig );

        //equipTabs
        this.equipTabs = [];
        this.equipTabIndex = CommonConfig.EQUIP_ALL;
        let len = CommonConfig.EQUIP_TYPES.length;
        for(let i = 0; i <= len; ++ i)
        {
            this.equipTabs.push( this['equipTab'+i] );
            this.equipTabs[i].addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTabTouchHandler, this);
        }

        //equipCards
        let ownedEquipTypes = [];
        this.equipSuites = {
            "own": [],
            "notown": []
        };
        this.equipCards = {};

        //获取关卡限制装备信息
        let levelInfo = ConfigManger.getInstance().getConfig('pve_story_level', this.data['levelID']);
        let restrictEquips = levelInfo['restrict_equip'].split('|'); //限制装备

        //已拥有的卡牌
        for(let i = 0; i < userEquipInfo.length; ++ i)
        {
            let equipInfo = userEquipInfo[i];
            let equipData = new EquipSuite(null, equipInfo);
            equipData.isEquiped = (this.isEquipedByPlayer(equipData.uuid, userInfo.ownedHero) ? true:false);
            equipData.isOwned   = true;
            //装备的职业限制
            equipData.isRestricted = ((1 == equipData.heroClass || equipData.heroClass - 1 == this.heroInfo.data.type) ? false :true);
            //装备的关卡限制
            if(-1 != restrictEquips.indexOf(equipData.ID.toString()))
            {
                equipData.isRestricted = true;
            }

            if(0 < equipInfo['data']['type'] && equipInfo['data']['type'] <= 8  && -1 == ownedEquipTypes.indexOf(equipInfo.modelID)) 
            {
                ownedEquipTypes.push( equipInfo.modelID );
                this.equipSuites['own'].push( equipData );
            }
        }

        //待收集的卡牌
        for(var key in equipConfig)
        {
            let modelID = parseInt(key);
            if( -1 != ownedEquipTypes.indexOf( modelID ) ) continue;//已拥有的卡牌类型直接忽略

            let equipChunk =  equipConfig[modelID] ;
            if( parseInt(equipChunk['type']) < 1 || parseInt(equipChunk['type']) > CommonConfig.EQUIP_TYPES.length ) continue;//卡牌类型不在要求类型的范围内

            let equipSuite = new EquipSuite(equipConfig[key], null);
            equipSuite.isEquiped = false; //不可装备
            this.equipSuites['notown'].push( equipSuite );
        }
        
        Object.keys( this.equipSuites ).forEach( function(key) {
            let vEquipSuite = this.equipSuites[key];

            this.equipCards[key] = [];
            for(let i = 0; i < vEquipSuite.length; ++ i) 
            {
                let equipCard = new EquipCard( vEquipSuite[i] );
                this.equipCards[key].push( equipCard );
            }
        }, this);

        //equipSlots
        let currHeroInfo = userInfo['ownedHero'];
        this.equipSlots = [];
        var equipSlot:EquipSlot;
        for(let i = 1; i <= len; ++ i)
        {
            if(EquipWindow.SPECIFIC_TYPES.indexOf( i ) > -1)
            {
                equipSlot = new EquipSlot( i, EquipWindow.SPECIFIC_TYPES );
            }
            else 
            {
                equipSlot = new EquipSlot( i );
            }

            if(0 != currHeroInfo['item' + i])
            {
                //找到已装备上去的那个卡牌信息
                let equipSuite = this.getEquipSuiteByUniqueId( currHeroInfo['item' + i], this.equipSuites['own'] );
                equipSuite && equipSlot.setSlotSuite( equipSuite );
            }
            equipSlot.x = EquipWindow.EQUIP_SLOT_POS[0] + (i-1) * EquipWindow.EQUIP_SLOT_POS[2];
            equipSlot.y = EquipWindow.EQUIP_SLOT_POS[1];
            
            this.equipSlots.push( equipSlot );
            this.addChild( equipSlot );
        }
        this.updatePanel();

        //当前英雄数值信息
        this.handleCurrHeroAttributes();

        this.onFightBtnTouchHandler.bind( this );
        this.fightBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onFightBtnTouchHandler, this);
        ServerManager.getInstance().addEventListener(UserInfoProxy.EQUIP_UPDATE_STATE, this.equipStateUpdate, this);
    }

    private updatePanel()
    {
        this.highlightOnlyTabByIndex( this.equipTabIndex );
        this.showCardsByType( this.equipTabIndex );

        this.handleCurrHeroAttributes();
    }
    /**
     * 处理后端发过来的装备卸载/安装消息
     * @param {Event} e e.data里面包含了后端消息 {code, id, seat, ret}
     */
    private equipStateUpdate(e:egret.Event)
    {
        let code = e.data['data']['code'];
        if(200 != code) return;//后端数据出错,直接不处理

        let equipUniqueId = e.data['data']['id'];
        let slotId        = e.data['data']['seat'];
        let equipState    = e.data['data']['ret'];

        if(false == equipState) //表示卸载操作
        {
            let equipSlot = this.getEquipSlotByUniqueId( equipUniqueId, this.equipSlots );
            if(equipSlot && equipSlot.slotSuite)
            {
                equipSlot.setSlotSuite(null);
                let equipCard = this.getEquipCardByUniqueId( equipUniqueId, this.equipCards['own'] );
                equipCard.setEquiped(false);
            }
        }
        else //安装
        {
            //先区分晶石与非晶石
            
            //如果该卡槽上已经有装备占了位置,要先卸载该装备
            let equipCard, equipSlot;
            equipSlot = this.equipSlots[ slotId-1 ];
            if( equipSlot.slotSuite )
            {
                let slotSuite = equipSlot.slotSuite;
                let slotCardId= slotSuite.uuid;
                equipCard =  this.getEquipCardByUniqueId( slotCardId, this.equipCards['own'] );
                equipCard.setEquiped( false );
            }

            //如果未装备过卡牌,或已卸载了卡牌,那么进行安装
            equipCard = this.getEquipCardByUniqueId( equipUniqueId, this.equipCards['own'] );
            equipCard.setEquiped( true );
            equipSlot.setSlotSuite( equipCard.cardSuite );
        }
        
        this.updatePanel();
    }

    private onTabTouchHandler(e:egret.TouchEvent)
    {
        let target:eui.Component = e.target.parent;
        if(!(target instanceof eui.Component)) return;

        var len = this.equipTabs.length;
        for(let i = 0; i < len; ++ i)
        {
            if(target == this.equipTabs[i])
            {
                this.equipTabIndex = i;
                break;
            }
        }
        
        this.updatePanel();
    }

    /**
     * 进入战斗场景,需要把英雄装备信息,关卡信息都传进去
     */
    private onFightBtnTouchHandler(e:egret.TouchEvent)
    {
        SoundManager.getInstance().playEffect('u10_start_mp3');
        //进关卡前需要先判断各种条件:等级,星星个数,必备装备,限制装备
        let levelID = this.data['levelID'];
        //let levelInfo:Object = ConfigManger.getInstance().getConfig('pve_story_level', levelID);
        
        if (this.allCheckBeforeFight())
        {
            BattleStartLoading.startBattleLoading(this.data);
            TDGA.onMissionBegin(levelID);
        }
    }

    /**
     * 进关卡前需要先判断各种条件:等级,星星个数,必备装备,限制装备
     * 处理的逻辑顺序:1.必备卡槽 -> 2.必备装备 -> 3.限制装备 -> 4.等级限制 -> 5.星级限制
     */
    private allCheckBeforeFight():boolean
    {
        let levelInfo = ConfigManger.getInstance().getConfig('pve_story_level', this.data['levelID']);

        var isChecked = true;
        //1.必备卡槽 +++
        let requiredSlots = levelInfo['required_equiptype'].split('|'), strTip = "", slotType = -1;
        for( var index in this.equipSlots )
        {
            var slot = this.equipSlots[index];
            slotType = slot.slotType;
            if(-1 != requiredSlots.indexOf(slotType.toString()) && !slot.slotSuite) {
                isChecked = false;

                let slotType_cn = CommonConfig.EQUIP_TYPES_CN[ slotType-1 ];
                strTip += "<font color='#00CD00'>" + slotType_cn + "</font>";
                break;
            }
        }

        if(false == isChecked) {
            //找适合该卡槽,品质最高的装备,提示玩家装备上去,否则提示玩家该卡槽缺少装备
            let equipCards = this.getEquipCardsBySlotType( slotType, this.equipCards['own'], true );
            if(equipCards && equipCards.length > 0)
            {
                strTip = "请装备上" + "<font color='#00CD00'>" +  equipCards[0].cardSuite['name'] + "</font>";
                equipCards[0].showEquipTipInShortTime();
            }
            else
            {
                strTip += "位置必须有装备";
            }
            ToastManager.showTip( strTip );
            return false;
        }

        //2.必备装备 --- 
        let requiredEquips= levelInfo['required_equip'].split('|'); //必备装备
        //取出所有已装备在英雄身上的装备配置ID
        let currSlotEquipIDs = [];
        this.equipSlots.forEach( function(slot) {
            if(slot && slot.slotSuite) 
            {
                currSlotEquipIDs.push(slot.slotSuite['ID']);
            }
        }, this);
        
        //检查必备装备是否都已装备好
        let equipId:number = 0;
        let needEquip = requiredEquips.find( function(requiredEquipId) {
            if(!isNaN( parseInt(requiredEquipId) ) && -1 == currSlotEquipIDs.indexOf( parseInt(requiredEquipId) ))
            {
                equipId = requiredEquipId;
                return true;
            }
            return false;
        }, this);

        if( needEquip )
        {
           //在已拥有的卡牌里找到目标装备卡牌
           let equipCards = this.getEquipCardsByConfigId(equipId, this.equipCards['own']);
           if(equipCards && equipCards.length > 0)
           {
               this.equipScroller.viewport.scrollV = equipCards[0].y - 31;
               equipCards[0].showEquipTipInShortTime();


               strTip = "<font color='#CD8500' size =27>" + equipCards[0].cardSuite['name'] +"</font>";
               strTip = "<font size=27>请装备<font>" + strTip;
           }
           else
           {
               equipCards = this.getEquipCardsByConfigId(equipId, this.equipCards['notown']);
               this.equipScroller.viewport.scrollV = equipCards[0].y - 31;
               equipCards[0].showEquipTipInShortTime();
               
               strTip = "<font color='#00cd00'>" + equipCards[0].cardSuite['name'] +"</font>";
           }
           ToastManager.showTip( strTip );
           return false;
        }
        
        //3.限制装备
        let restrictEquips = levelInfo['restrict_equip'].split('|'); //限制装备
        equipId = 0;
        let notNeedEquip = restrictEquips.find( function(restrictEquipId) {
            if(!isNaN( parseInt(restrictEquipId) ) && -1 != currSlotEquipIDs.indexOf( parseInt(restrictEquipId) ))
            {
                equipId = restrictEquipId;
                return true;
            }
            return false;
        }, this);
        
        if( notNeedEquip )//如果存在限制装备
        {
           let equipCards = this.getEquipCardsByConfigId(equipId, this.equipCards['own']);
           if(equipCards && equipCards.length > 0)
           {
               for(let i = 0; i < equipCards.length; ++ i)
               {
                   equipCards[i].setRestricted( true );
               }

               let notNeedEquipCheck = true;
               for(let i = 0; i < this.equipSlots.length; ++ i)
               {
                   if( this.equipSlots[i] && this.equipSlots[i].slotSuite && this.equipSlots[i].slotSuite['ID'] == equipId )
                   {
                       notNeedEquipCheck = false;

                       strTip = "<font color='#CD8500' size =27>" + this.equipSlots[i].slotSuite['name'] +"</font>";
                       strTip = "<font size=27>当前关卡内不得使用<font>" + strTip;
                       ToastManager.showTip( strTip );
                       break;
                   }
               }
           }
           return false;
        }

        //4.等级限制
        let requiredLevel = parseInt(levelInfo['required_lv']);

        //5.星级限制
        let requiredStar  = parseInt(levelInfo['required_star']);

        return true;
    }

    /*private battleLoading()
    {
        let loadView:BattleStartLoading = new BattleStartLoading();
		LayerManager.stage.addChildAt(loadView, LayerManager.stage.numChildren - 1);
        loadView.addEventListener(BattleStartLoading.BATTLE_RES_LOAD_COMPLETE, this.onEnterBattle, this);
        loadView.parseCommonRes( this.data );
        loadView.loadCommonRes();
    }
	private onEnterBattle(e:egret.TouchEvent)
	{
	    let loadView:BattleStartLoading = e.currentTarget;
        loadView.removeEventListener(BattleStartLoading.BATTLE_RES_LOAD_COMPLETE, this.onEnterBattle, this);

        LayerManager.stage.removeChild(loadView);
		WindowManager.closeAllWindow(true);
        SceneManager.getInstance().pushScene( new BattleScene(), this.data );
        console.log('[EquipWindow.onEnterBattle]', this.data);
	}*/
    /**
     * 对于晶石类卡牌,需要根据该类型,找到允许安装该类型卡牌的合适位置
     * 如果有空位就直接插入;如果都满了,就把最后一个可用卡槽,提供给晶石卡牌使用
     * 这个函数仅提供给晶石卡牌使用,非晶石卡牌慎用
     * 
     * @param {EquipCard} equipCard 晶石卡牌
     * @return {number} 返回一个可用的卡槽位置 
     */
    public getSlotPosForSpecialCard(equipCard:EquipCard):number
    {
        let vEquipSlot = this.getEquipSlotsByType( equipCard.type, this.equipSlots, true );
        if(0 == vEquipSlot.length)//没有可用的卡槽
        {
            vEquipSlot = this.getEquipSlotsByType( equipCard.type, this.equipSlots );
            let slotLen= vEquipSlot.length;
            return vEquipSlot[slotLen - 1].slotType;
        }

        //存在可用的卡槽 
         return vEquipSlot[0].slotType;
    }
    /**
     * 下面的函数都是工具函数
     */
    private highlightOnlyTabByIndex(tabIndex:number)
    {
        let len = this.equipTabs.length;

        tabIndex = Math.min( Math.max(0, tabIndex), len);
        for(let i = 0; i < len; ++ i)
        {
            this.equipTabs[i].imgSelected.visible = (i == tabIndex ? true:false);
        }
    }

    private highlightOnlySlotByIndex(slotIndex:number)
    {
        let len = this.equipSlots.length;
        //如果slotIndex = -1,表明没有一个选中
        if(-1 != slotIndex) 
        {
            slotIndex = Math.min( Math.max(1, slotIndex), len );
        }

        for(let i = 1; i <= len; ++ i)
        {
            this.equipSlots[i].imgSelected.visible = (i == slotIndex ? true:false);
        }
    }

    /**
     * 根据装备唯一ID,到已拥有卡牌里找到该装备的详细信息,用于给EquipSlot设置数据
     * @param {number} equipUniqueId 装备的uuid
     * @param {Array} vEquipSuite 已拥有的卡牌信息
     * @return {EquipSuite} 装备卡牌信息
     */
    private getEquipSuiteByUniqueId(equipUniqueId:number, vEquipCardSuite:Array<EquipSuite>):EquipSuite
    {
        if(0 == equipUniqueId) return null;

        let len = vEquipCardSuite.length;
        for(let i = 0; i < len; ++ i)
        {
            let equipCardSuite = vEquipCardSuite[i];
            if(equipCardSuite.isEquiped && equipUniqueId == equipCardSuite.uuid)
            {
                return equipCardSuite;
            }
        }
        return null;
    }

    /**
     * 根据装备唯一ID,找到对应卡牌信息
     * @param {number} equipUniqueId 装备唯一ID
     * @param {Array} vEquipCard 一组装备卡牌信息,如:equipCards['own'],equipCards['notown']
     * @param {boolean} requireEquiped 是否要求只查已装备的卡牌
     * @return {EquipCard} 卡牌信息
     */
    private getEquipCardByUniqueId(equipUniqueId:number, vEquipCard:Array<EquipCard>, requireEquiped:boolean = false):EquipCard
    {
        let cardLen = vEquipCard.length;
        for(let i = 0; i < cardLen; ++ i)
        {
            let equipCard = vEquipCard[i];
            if(equipUniqueId == equipCard.uuid)
            {
                if(requireEquiped)
                {
                    if(equipCard.isEquiped) return equipCard;
                    return null;
                }
                return equipCard;
            }
        }
        return null;
    }
    /**
     * 根据装备唯一ID,找到卡槽上的位置信息
     * @param {number} equipUniqueId 装备唯一ID
     * @param {Array} vEquipSlot 卡槽信息
     * @return {EquipSlot} 卡槽信息
     */
    private getEquipSlotByUniqueId(equipUniqueId:number, vEquipSlot:Array<EquipSlot>):EquipSlot
    {
        let slotLen = vEquipSlot.length;
        for(let i = 0; i < slotLen; ++ i)
        {
            let equipSlot = vEquipSlot[i];
            if(equipSlot.uniqueId && equipUniqueId == equipSlot.uniqueId)
            {
                return equipSlot;
            }
        }
        return null;
    }

    /**
     * 根据装备配置ID,找到[已拥有或未拥有]卡牌中的这一类
     * @param {number} equipConfigId 装备配置ID
     * @param {Array} vEquipCard 一组卡牌[own|notown] 
     * @param {boolean} isBestRange 是否要求最好的品质装备
     */
    private getEquipCardsByConfigId(equipConfigId:number, vEquipCard:Array<EquipCard>, isBestRange:boolean = true):Array<EquipCard>
    {
        let vCards = Array<EquipCard>(), len = vEquipCard.length, bestEquipRange;
        for(let i = 0; i < len; ++ i)
        {
            let equipCard = vEquipCard[i];
            if(equipCard.ID == equipConfigId)
            {
                if(isBestRange)
                {
                    if(!bestEquipRange || bestEquipRange < equipCard.cardSuite['rarity'])
                    {
                        bestEquipRange = equipCard.cardSuite['rarity'];
                        vCards.push( equipCard );
                    }
                }
                else
                {
                    vCards.push( equipCard );
                }
            }
        }

        //对于要求最高品质的装备来说,vCards里面包含很多不是最高品质的装备卡牌,这就要剔除这些不合要求的卡牌
        if(isBestRange)
        {
            len = vCards.length;
            for(let i = len-1; i >= 0; -- i)
            {
                let equipCard = vCards[i];
                if(equipCard.cardSuite['rarity'] != bestEquipRange)
                {
                    vCards.splice(i, 1);
                }
            }
        }
        return vCards;
    }

    /**
     * 根据卡槽所在的类型来找所有适合该卡槽的卡牌
     * @param {number} slotType 卡槽类型
     * @param {Array} vEquipCard 一组装备卡牌信息
     * @param {boolean} isBestRange 是否要求最好的品质装备
     * @return {Array} 一组卡牌
     */
    public getEquipCardsBySlotType(slotType:number, vEquipCard:Array<EquipCard>, isBestRange?:boolean)
    {
        let vCards = Array<EquipCard>(), len = vEquipCard.length, bestEquipRange;
        for(let i = 0; i < len; ++ i)
        {
            let equipCard = vEquipCard[i];
            if(-1 != EquipWindow.SPECIFIC_TYPES.indexOf( slotType ) || equipCard.type == slotType)
            {
                if(isBestRange)
                {
                    if(!bestEquipRange || bestEquipRange < equipCard.cardSuite['rarity'])
                    {
                        bestEquipRange = equipCard.cardSuite['rarity'];
                        vCards.push( equipCard );
                    }
                }
                else
                {
                    vCards.push( equipCard );
                }
            }
        }

        //对于要求最高品质的装备来说,vCards里面包含很多不是最高品质的装备卡牌,这就要剔除这些不合要求的卡牌
        if(isBestRange)
        {
            len = vCards.length;
            for(let i = len-1; i >= 0; -- i)
            {
                let equipCard = vCards[i];
                if(equipCard.cardSuite['rarity'] != bestEquipRange)
                {
                    vCards.splice(i, 1);
                }
            }
        }
        return vCards;
    }
    /**
     * 根据装备唯一ID,查找当前英雄身上是否装备了该装备,以此来判断玩家是否已经装备了该装备
     * @param {number} equipUniqueId 装备唯一ID
     * @param {HeroInfo} currHeroInfo 当前玩家所用英雄
     * @return {boolean} 标识是否装备了该装备
     */
    private isEquipedByPlayer(equipUniqueId:number, currHeroInfo:HeroInfo)
    {
        if(0 == equipUniqueId) return false;
        
        let itemLen = CommonConfig.EQUIP_TYPES.length;
        for(let i = 0; i < itemLen; ++ i)
        {
            let key = 'item' + (i+1);
            let heroEquipId = currHeroInfo[key];
            if(heroEquipId && equipUniqueId == heroEquipId) return true;
        }
        return false;
    }

    /**
     * 根据type[0-8]来展示所有卡牌
     * @param {number} type 卡牌类型 [装备所在位置:主手,副手,盔甲等]
     */
    public showCardsByType( type:number ):void
    {
        //在每次展示卡牌前,要将yPos设为0,并清空显示区域之前的展示卡牌
        this.yPos = 55;
        while( this.equipGroup.numChildren ) this.equipGroup.removeChildAt(0);
        if(0 != this.equipScroller.viewport.scrollV)
        {
            this.equipScroller.viewport.scrollV = 0;
        }

        this.ownPrompt.visible = this.notownPrompt.visible = false;
        this.equipGroup.addChild( this.ownPrompt );
        this.equipGroup.addChild( this.notownPrompt );

        Object.keys( this.equipCards ).forEach( function(key) {
            //"已拥有", "待收集"两个标识图片
            this[key + 'FrameImg'].x = 90;
            this[key + 'FrameImg'].y = this.yPos + 17;
            this.equipGroup.addChild( this[key + 'FrameImg'] );

            this[key + 'SignImg'].x = this[key + 'FrameImg'].x + 15;
            this[key + 'SignImg'].y = this[key + 'FrameImg'].y + 31;
            this.equipGroup.addChild( this[key + 'SignImg'] );

            //不同类型的卡牌集
            var cards = this.equipCards[key], card, cardCount = 0;
            for(let i = 0; i < cards.length; ++ i)
            {
                card = cards[i];
                if( !card.isEquiped && (card.type == type || CommonConfig.EQUIP_ALL == type) )
                {
                    card.x = EquipWindow.CARD_XPOS + (cardCount%EquipWindow.CARD_PERLINE) * EquipWindow.CARD_ATTRIBUTE[2];
                    card.y = this.yPos;
                    if(0 == (cardCount+1)%EquipWindow.CARD_PERLINE)
                    {
                        this.yPos += EquipWindow.CARD_ATTRIBUTE[3];
                    } 
                    ++ cardCount;
                    this.equipGroup.addChild( card );
                }
            }
            
            //当该类型卡牌未达到CARD_PERLINE的倍数时,需要占满一整行空间
            //同时需要注意:玩家拥有的卡牌个数为0的时候,也需要独占一行空间
            if(0 == cardCount || cardCount%EquipWindow.CARD_PERLINE) 
            {
                this.yPos += EquipWindow.CARD_ATTRIBUTE[3];
            }
            if(0 == cardCount)
            {
                if('own' == key) 
                {
                    this['ownPrompt'].visible = true;
                }
                else
                {
                    if(0 == type)
                    {
                        this['notownPrompt'].visible = true;
                    }
                }
            }
            this[key + 'CutoffLineImg'].y = this.yPos - 395;
            this.equipGroup.addChildAt(this[key + 'CutoffLineImg'], 0);
        }, this);
    }

    /**
     * 通过前端配置数据的equipId,去拿后端equipInfo信息
     */
    private getEquipInfoById(equipId:string, userEquipInfo:any)
    {
        for(let key in userEquipInfo) 
        {
            let equipInfo = userEquipInfo[key];
            if(equipId == equipInfo['modelID']) return equipInfo['data']; 
        };
        return null;
    }

    /**
     * 根据卡牌的类型,找到允许安装该类型卡牌的所有卡槽
     * @param {number} cardType 卡牌类型[装备所在位置:主手,副手,盔甲等]
     * @param {Array} vEquipSlot 一组卡槽
     * @param {boolean} requireNotUsed 要求没用被占用的卡槽
     * @return {Array} 返回符合条件的卡槽组
     */
    private getEquipSlotsByType(cardType:number, vEquipSlot:Array<EquipSlot>, requireNotUsed:boolean = false):Array<EquipSlot>
    {
        var slotLen = vEquipSlot.length, equipSlots = new Array<EquipSlot>();
        for(let i = 0; i < slotLen; ++ i)
        {
            let equipSlot = vEquipSlot[i];
            if( -1 == equipSlot.allowTypes.indexOf( cardType )) continue;
            if(requireNotUsed && equipSlot.slotSuite) continue;//只查空位卡槽,该卡槽已经被占用,那么就跳过

            equipSlots.push( equipSlot ); 
        }
        return equipSlots;
    }

    private handleCurrHeroAttributes()
    {
        //血量,攻击力,速度数据展示部分
        this.healthValue.text = this.getCurrHeroHPValue().toString();
        this.damageValue.text = this.getCurrHeroNormalDamage().toString();
        this.speedValue.text  = (this.getCurrHeroSpeedValue() * 100).toFixed(0) + "";
        this.viewValue.text   = this.getCurrentHeroViewRangeValue().toString();
    }
    /**
     * 计算当前所用英雄生命值,英雄初始血量 + 每件装备的血量加成 * 生命值比率
     * @return {number} 返回血量值
     */
    private getCurrHeroHPValue():number
    {
        return this.getCurrHeroAttribute('hp', 'healthfactor');
    }

    /**
     * 计算当前英雄普通攻击伤害值,英雄初始攻击伤害 + 主手装备攻击伤害 * 装备攻击比率
     * @return {number} 返回普攻伤害值
     */
    private getCurrHeroNormalDamage():number
    {
        // return this.getCurrHeroAttribute('atkdamage', 'atkdamagefactor');
        let result = parseFloat(this.heroInfo['data']['atkdamage']);
        let factor = parseFloat(this.heroInfo['data']['atkdamagefactor']);

        let equipSlot = this.equipSlots[0];
        if(!equipSlot || !equipSlot.slotSuite) return result;

        let skillId = equipSlot.slotSuite['skill'].split('|')[0];
        let skillConfig = ConfigManger.getInstance().getConfig('skill', skillId);
        result += parseInt(skillConfig['atkdamage']) * factor;
        return result;
    }

    /**
     * 计算当前英雄移动速度, 英雄初始移动值 + 每件装备移动值 * 装备移动比率
     * @return {number} 返回速度值
     */
    private getCurrHeroSpeedValue():number
    {
        return this.getCurrHeroAttribute('speed', 'speedfactor');
    }

    /**
     * 计算当前英雄视野范围, 英雄初始范围值 + 每件装备范围值 * 装备可视率
     * @return {number} 视野范围值
     */
    private getCurrentHeroViewRangeValue():number
    {
        return this.getCurrHeroAttribute('viewrange', 'viewfactor');
        // let result = parseFloat(this.heroInfo['data']['viewrange']);
        // let factor = parseFloat(this.heroInfo['data']['viewfactor']);

        // let equipSlot = this.equipSlots[0];
        // if(!equipSlot || !equipSlot.slotSuite) return result;

        // let skillId = equipSlot.slotSuite['skill'].split('|')[0];
        // let skillConfig = ConfigManger.getInstance().getConfig('skill', skillId);
        // result += parseInt(skillConfig['viewrange']) * factor;
        // return result;
    }

    /**
     * 将英雄的生命值,攻击力,速度,视野等属性值,根据公式 属性值 = 英雄初始值 + 装备属性值*英雄加成比,来统一获得数据
     * @param {string} attrDefault 英雄属性初始值
     * @param {string} attrFactor 英雄属性加成比
     * @return number 属性值
     */
    private getCurrHeroAttribute(attrDefault:string, attrFactor:string):number
    {
        let result = parseFloat(this.heroInfo['data'][attrDefault]);
        let factor = parseFloat(this.heroInfo['data'][attrFactor]);

        let slotLen = this.equipSlots.length;
        for(let i = 0; i < slotLen; ++ i)
        {
            let equipSlot = this.equipSlots[i];
            
            'hp' == attrDefault && (attrDefault = 'health');
            if(equipSlot.slotSuite && equipSlot.slotSuite[attrDefault])
            {
                result += parseInt(equipSlot.slotSuite[attrDefault]) * factor;
            }
        }
        return result;
    }

    public dispose()
    {
        super.dispose();
        
        ServerManager.getInstance().removeEventListener(UserInfoProxy.EQUIP_UPDATE_STATE, this.equipStateUpdate, this);       
    }
}