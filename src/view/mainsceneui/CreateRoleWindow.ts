import BaseWindow from "../../base/popup/BaseWindow";
import WindowManager from "../../base/popup/WindowManager";
import ConfigManager from "../../manager/ConfigManager";
import ColorFilterFactory from "../../base/factory/ColorFilterFactory";
import GuideManager from "../../manager/GuideManager";
import UserInfo from "../../model/vo/UserInfo";
import DataAccessManager from "../../base/da/DataAccessManager";
import DataAccessEntry from "../../model/DataAccessEntry";
import ServerManager from "../../model/net/NetManager";
import HeroInfo from "../../model/vo/HeroInfo";
import Protocols from "../../enums/Protocols";
/**
 * Created by yaozhiguo on 2017/2/8.
 */
export default class CreateRoleWindow extends BaseWindow
{
    private btnCreate:eui.Button;

    private imgFigure:eui.Image;
    private labDesc:eui.Label;
    private imgHeroName:eui.Image;
    private labHp:eui.Label;
    private labAttack:eui.Label;
    private labSpeed:eui.Label;
    private labViewRange:eui.Label;

    private imgFigure0:eui.Image;
    private labDesc0:eui.Label;
    private imgHeroName0:eui.Image;
    private labHp0:eui.Label;
    private labAttack0:eui.Label;
    private labSpeed0:eui.Label;
    private labViewRange0:eui.Label;

    private selectedHero:HeroInfo;
    private selectedHeroImg:eui.Image;
    private userInfo:UserInfo;

    public constructor()
    {
        super();
        this.skinName = 'CreateRoleWindowSkin';
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.btnCreate.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCreateRole, this);

        this.userInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
        let hero = this.userInfo.heros[0];
        let hero0 = this.userInfo.heros[1];

        let grace:Object = hero.data;//ConfigManager.getInstance().getConfig('hero', 30000);
        let turing:Object = hero0.data;//ConfigManager.getInstance().getConfig('hero', 30001);

        this.labHp.text = grace['hp'];
        this.labSpeed.text = Math.round((parseFloat(grace['speed']) * 100)).toString();
        this.labAttack.text = grace['atkdamage'];
        this.labViewRange.text = grace['viewrange'];
        this.labDesc.text = grace['description'];
        this.imgFigure.source = 'resource/icon/role/career_figure/' + grace['career_figure'] + '.png';
        this.imgHeroName.source = RES.getRes('hero_json.pic_name_' +　grace['icon'] + '_png');

        this.labHp0.text = turing['hp'];
        this.labSpeed0.text = Math.round((parseFloat(turing['speed']) * 100)).toString();
        this.labAttack0.text = turing['atkdamage'];
        this.labViewRange0.text = turing['viewrange'];
        this.labDesc0.text = turing['description'];
        this.imgFigure0.source = 'resource/icon/role/career_figure/' + turing['career_figure'] + '.png';
        this.imgHeroName0.source = RES.getRes('hero_json.pic_name_' +　turing['icon'] + '_png');

        // this.imgFigure.anchorOffsetX = this.imgFigure.width * 0.5;
        // this.imgFigure.anchorOffsetY = this.imgFigure.height * 0.5;
        // this.imgFigure0.anchorOffsetX = this.imgFigure0.width * 0.5;
        // this.imgFigure0.anchorOffsetY = this.imgFigure0.height * 0.5;
        this.imgFigure.touchEnabled = this.imgFigure0.touchEnabled = true;
        this.imgFigure.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onSelectedHero, this);
        this.imgFigure0.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onSelectedHero, this);

        this.selectedHero = hero;
        this.selectedHeroImg = this.imgFigure;
        this.updateFigure(this.imgFigure, this.imgFigure0);
    }

    private updateFigure(selected:eui.Image, other:eui.Image):void
    {
        selected.scaleX = selected.scaleY = 1;
        selected.filters = null;
        other.scaleX = other.scaleY = 0.8;
        other.filters = [ColorFilterFactory.createBrightnessFilter(-100)];
    }

    private onSelectedHero(event:egret.TouchEvent):void
    {
        if (this.selectedHeroImg == event.currentTarget)return;
        if (event.currentTarget == this.imgFigure)
        {
            this.selectedHeroImg = this.imgFigure;
            this.selectedHero = this.userInfo.heros[0];//ConfigManager.getInstance().getConfig('hero', 30000);
            this.updateFigure(this.imgFigure, this.imgFigure0);
        }
        else
        {
            this.selectedHeroImg = this.imgFigure0;
            this.selectedHero = this.userInfo.heros[1];//ConfigManager.getInstance().getConfig('hero', 30001);
            this.updateFigure(this.imgFigure0, this.imgFigure);
        }
    }

    private onCreateRole(event:egret.TouchEvent):void
    {
        ServerManager.getInstance().callServerSocket(Protocols.ROUTE_SELECT_HERO, {hid:this.selectedHero.uuid});
        WindowManager.closeWindow(this.name, true);
        // GuideManager.getInstance().start(2006);
        //RES.destroyRes('createrole');
        GuideManager.getInstance().startByLevel(this.userInfo.storyID, 0);
    }

    public dispose():void
    {
        super.dispose();
        this.btnCreate.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onCreateRole, this);
        this.imgFigure.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onSelectedHero, this);
        this.imgFigure0.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onSelectedHero, this);
    }
}