import BaseWindow from "../../../base/popup/BaseWindow";
import UserInfo from "../../../model/vo/UserInfo";
import DataAccessManager from "../../../base/da/DataAccessManager";
import DataAccessEntry from "../../../model/DataAccessEntry";
import ConfigManager from "../../../manager/ConfigManager";
import ServerManager from "../../../model/net/NetManager";
import HeroInfo from "../../../model/vo/HeroInfo";
import HeroSlotBar from "./HeroSlotBar";
import SkillBar from "./SkillBar";
import Globals from "../../../enums/Globals";
import UserInfoProxy from "../../../model/da/UserInfoProxy";
import HeroSlot from "./HeroSlot";
import ToastManager from "../../common/ToastManager";
import Protocols from "../../../enums/Protocols";
/**
 * Created by yaozhiguo on 2017/1/16.
 */
export default class HeroWindow extends BaseWindow
{
    private labHp:eui.Label;
    private labAttack:eui.Label;
    private labSpeed:eui.Label;
    private labViewRange:eui.Label;
    private labDesc:eui.Label;
    private labOpenDesc:eui.Label;

    private btnChoose:eui.Button;
    private imgStar1:eui.Image;
    private imgStar2:eui.Image;
    private imgStar3:eui.Image;
    private imgStar4:eui.Image;
    private imgStar5:eui.Image;
    private imgStar6:eui.Image;
    private grpSkill:eui.Group; //技能栏容器
    private imgCareer:eui.Image; //职业
    private imgFigure:eui.Image; //英雄全身像
    private imgHeroName:eui.Image; //英雄名字

    private imgHero1:eui.Image;
    private imgHero2:eui.Image;
    private imgHero3:eui.Image;

    private imgRecruite:eui.Image;
    private imgGem:eui.Image;

    private currentHero:any;//当前选择查看的英雄
    private userInfo:UserInfo;
    private slotBar:HeroSlotBar;

    public constructor()
    {
        super();
        this.skinName = 'HeroWindowSkin';
        this.isCache = false;
        this.touchEnabled = true;
        this.userInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
    }

    protected childrenCreated():void
    {
        super.childrenCreated();

        this.btnChoose.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onChoose, this);
        this.slotBar = new HeroSlotBar(this.resolveHeroData());
        this.slotBar.x = 50;
        this.slotBar.y = 100;
        this.addChild(this.slotBar);
        this.slotBar.addEventListener('slotClicked', this.onSlotBarClicked, this);
        let currentHeroData:HeroInfo = this.userInfo.ownedHero;
        this.updateHeroInfo(currentHeroData);
        this.slotBar.selectedData = currentHeroData;
        ServerManager.getInstance().addEventListener(UserInfoProxy.HERO_BOUGHT, this.heroBought, this);
        ServerManager.getInstance().addEventListener(UserInfoProxy.HERO_CHANGED, this.heroChanged, this);
    }

    //提取未获取的和已获取的英雄信息
    private resolveHeroData():any[]
    {
        let heroMap:Object = ConfigManager.getInstance().getConfigs('hero');
        let myHeros:HeroInfo[] = this.userInfo.heros;

        let result:any[] = [];
        let checks:any[] = [];
        result = result.concat(myHeros);
        for (let heroInfo of myHeros)
        {
            checks.push(heroInfo.data);
        }
        for (let i in heroMap)
        {
            let heroData = heroMap[i];
            if (checks.indexOf(heroData) == -1)
            {
                result.push(heroData);
            }
        }
        return result;
    }

    private updateHeroInfo(currentData:any):void
    {
        let heroData = currentData instanceof HeroInfo ? currentData.data : currentData;
        this.currentHero = currentData;
        this.labHp.text = heroData['hp'];
        this.labSpeed.text = Math.round((parseFloat(heroData['speed']) * 100)).toString();
        this.labAttack.text = heroData['atkdamage'];
        this.labViewRange.text = heroData['viewrange'];
        this.labDesc.text = heroData['description'];

        this.imgGem.visible = false;
        this.imgRecruite.visible = false;

        if (currentData instanceof HeroInfo)
        {
            this.labOpenDesc.text = '';
            this.btnChoose.icon = '';
            if (currentData == this.userInfo.ownedHero)
            {
                this.btnChoose.label = '已出战';
                this.btnChoose.skinName = 'HeroFightButtonSkin';
                this.imgRecruite.visible = true;
                this.btnChoose.x = 1497 - 44;
                this.btnChoose.y = 959 - 26;
            }
            else
            {
                this.btnChoose.label = '出战';
                this.btnChoose.skinName = 'CommonButtonSkin';
                this.btnChoose.x = 1497;
                this.btnChoose.y = 959;
            }
        }
        else
        {
            this.labOpenDesc.text = currentData['price_description'];
            if (parseInt(heroData['price']) < 0)
            {
                this.btnChoose.label = '需解锁';
                this.btnChoose.skinName = 'CommonButtonSkin';
                this.btnChoose.x = 1497;
                this.btnChoose.y = 959;
            }
            else
            {
                this.btnChoose.label = heroData['price'];
                this.btnChoose.skinName = 'CommonButtonSkin';
                this.imgGem.visible = true;
                this.btnChoose.x = 1497;
                this.btnChoose.y = 959;
            }
        }
        this.imgFigure.source = 'resource/icon/role/career_figure/' + heroData['career_figure'] + '.png';
        this.imgCareer.source = RES.getRes('hero_json.pic_soldier_logo_' + Globals.HERO_CAREER[heroData['type']] + '_png');
        this.imgHeroName.source = RES.getRes('hero_json.pic_name_' +　heroData['icon'] + '_png');
        this.setQuality(parseInt(heroData['rarity']));
        this.setSkill(heroData['skill'].split('|'));
    }

    private setQuality(quality:number):void
    {
        if(quality < 1 || quality > 6)return;
        for (let i:number = 1; i <= 6; i++)
        {
            this['imgStar' + i].visible = i <= quality;
        }
    }

    private setSkill(skillIds:string[]):void
    {
        this.grpSkill.removeChildren();
        for (let skillIdStr of skillIds)
        {
            let skillId:number = parseInt(skillIdStr);
            if (skillId < 10000)continue;
            let skillData:Object = ConfigManager.getInstance().getConfig('skill', skillId);
            let skillBar:SkillBar = new SkillBar();
            skillBar.setSkillData(skillData);
            this.grpSkill.addChild(skillBar);
        }
    }

    private onChoose(event:egret.TouchEvent):void
    {
        if (!(this.currentHero instanceof HeroInfo))
        {
            let price:number = parseInt(this.currentHero['price']);
            if (price < 0)
            {
                ToastManager.centerShowTip('需战斗闯关获得！');
                return ;//不能购买
            }
            if (this.userInfo.diamond < price)
            {
                ToastManager.centerShowTip('宝石不足！');
                return;//价格太高
            }
            ServerManager.getInstance().callServerSocket(Protocols.ROUTE_BUY_HERO, {mid:parseInt(this.currentHero['id'])});
            //解锁
            return;
        }
        if (this.userInfo.ownedHero.uuid == this.currentHero.uuid)return;
        ServerManager.getInstance().callServerSocket(Protocols.ROUTE_SELECT_HERO, {hid:this.currentHero.uuid});
    }

    private onSlotBarClicked(event:egret.Event):void
    {
        this.updateHeroInfo(this.slotBar.selectedData);
    }

    private heroBought(event:egret.Event):void
    {
        let heroInfo:HeroInfo = event.data;
        let slot:HeroSlot = this.slotBar.getSlotByData(heroInfo.data);
        if (slot)
        {
            slot.heroData = heroInfo;
            this.updateHeroInfo(heroInfo);
            this.slotBar.selectedData = heroInfo;
            ToastManager.centerShowTip('英雄购买成功！');
        }
    }

    private heroChanged(event:egret.Event):void
    {
        let heroInfo:HeroInfo = event.data;
        this.updateHeroInfo(heroInfo);
        ToastManager.centerShowTip('英雄出战成功！');
    }

    public dispose():void
    {
        super.dispose();
        this.slotBar.dispose();
        ServerManager.getInstance().removeEventListener(UserInfoProxy.HERO_BOUGHT, this.heroBought, this);
        this.slotBar.removeEventListener('slotClicked', this.onSlotBarClicked, this);
        this.btnChoose.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onChoose, this);
    }
}