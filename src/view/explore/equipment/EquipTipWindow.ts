/**
 * 装备提示界面
 * @author rappel
 * @time 2016-12-27 18:18
 */
import BaseWindow from "../../../base/popup/BaseWindow";
import EquipCard from "../equipment/EquipCard";
import ConfigManager from "../../../manager/ConfigManager";
import ServerManager from "../../../model/net/NetManager";
import WindowManager from "../../../base/popup/WindowManager";
import EquipTipSelfDesc from "../equipment/EquipTipSelfDesc";
import EquipTipSkillDesc from "../equipment/EquipTipSkillDesc";
import EquipWindow from "./EquipWindow";
import MouseScroller from "../../common/MouseScroller";

export default class EquipTipWindow extends BaseWindow
{
    private static RANGECOLOR    = ['white', 'green', 'purple', 'orange', 'golden'];
    private static RANGENAME     = ['普通', '优秀', '精良', '史诗', '传奇'];
    private static HEROCAREER    = ['通用', '战士', '法师', '枪手', '密探', '钢铁战士'];
    private static EQUIPTYPENAME = ['主手', '副手', '护甲', '芯片', '罗盘', '晶石次元', '晶石预言', '晶石塑能'];

    private tipRange: eui.Label;
    private tipHeroClass: eui.Label;
    private tipType: eui.Label;

    private equipQualityImg: eui.Image;
    private equipIconImg: eui.Image;
    private equipNameLabel: eui.Label;

    private equipBtn: eui.Button;
    private unloadBtn: eui.Button;

    private descGroup:eui.Group;
    private tipSplitLine1: eui.Image;
    private tipSplitLine2: eui.Image;

    private txtEquipDesc:eui.Label;
    private heroCareer:eui.Image;

    private skillConfig: any;
    private descScroller: eui.Scroller;

    private actionBoxObj:any;
    private equipId:string;
    private language: string;
    private yPos:number;

    constructor()
    {
        super();
        this.skinName = "EquipTipWindowSkin";

        this.actionBoxObj = {
            item:{},
            props:[],
            short:''
        };
    }

    protected childrenCreated()
    {
        super.childrenCreated();

        this.descScroller.scrollPolicyH = "off";
        MouseScroller.enableMouseScroller(this.descScroller);
    }

    public updateView()
    {
        this.tipRange.text     = EquipTipWindow.RANGENAME[ this.data['rarity']-1 ];
        this.tipHeroClass.text = EquipTipWindow.HEROCAREER[ this.data['heroClass']-1 ];
        this.tipType.text      = EquipTipWindow.EQUIPTYPENAME[ this.data['type']-1 ];

        this.equipQualityImg.source = RES.getRes('card_' + EquipCard.RANGECOLOR[(this.data['rarity'] || 1)-1] + '_png');
        this.equipIconImg.source    = 'resource/icon/equip/' + this.data.iconSrc.toLowerCase() + '.png';
        this.equipNameLabel.text    = this.data['name'];

        if(this.data['isEquiped'])//如果已装备,说明点击的是卡槽上的卡牌,展示卸载按钮
        {
            this.equipBtn.visible = false;
            this.unloadBtn.visible= true;
        }
        else 
        {
            if(this.data['isOwned'])//说明点击的是已拥有的卡牌,那么展示可以装备按钮
            {
                this.equipBtn.visible = true;
                this.unloadBtn.visible= false;
            }
            else
            {
                this.equipBtn.visible = this.unloadBtn.visible = false;
            }
        }

        this.heroCareer.source = RES.getRes('common_utils_json.career_' + EquipCard.HEROCAREER[parseInt(this.data['heroClass'])-1] + '_icon_png');
        
        let descLines = this.data['des'].split(/\\n/), lineNum = 0;
        descLines.forEach(function(line) {
            lineNum += (line.length/15|0) + 1;
        }, this);
        this.txtEquipDesc.text = this.data['des'].split(/\\n/).join('\n');

        this.skillConfig = ConfigManager.getInstance().getConfigs('skill');

        this.yPos = 33*lineNum|0;
        this.txtEquipDesc.height = this.yPos + 7;

        this.tipSplitLine1.visible = true;
        this.tipSplitLine1.y = this.yPos;

        this.yPos += 40;
        //自身属性展示
        this.updateSelfDesc();

        this.yPos += 40;
        //技能属性展示
        this.updateSkillDesc();
        this.showSkillDesc();

        this.equipBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onEquipBtnTouchHandler, this);
        this.unloadBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onUnloadBtnTouchHandler, this);
    }

    private updateSelfDesc()
    {
        var descCell:any, selfDescMark = false;
        if(this.data['health'] && !isNaN(this.data['health']) && this.data['health'] > 0)
        {
            selfDescMark = true;

            descCell = new EquipTipSelfDesc();
            descCell.refreshView("增加生命值", "+" + this.data['health']);
            descCell.y = this.yPos;
            this.descGroup.addChild( descCell );
            this.yPos += 40;
        }

        if(this.data['attackDamage'] && !isNaN(this.data['attackDamage']) && this.data['attackDamage'] > 0)
        {
            selfDescMark = true;

            descCell = new EquipTipSelfDesc();
            descCell.refreshView("增加攻击伤害", "+" + this.data['attackDamage']);
            descCell.y = this.yPos;
            this.descGroup.addChild( descCell );
            this.yPos += 40;
        }

        if(this.data['speed'] && !isNaN(this.data['speed']) && this.data['speed'] > 0)
        {
            selfDescMark = true;

            descCell = new EquipTipSelfDesc();
            descCell.refreshView("增加移动速度", "+" + this.data['speed']);
            descCell.y = this.yPos;
            this.descGroup.addChild( descCell );
            this.yPos += 40;
        }

        if(this.data['viewrange'] && !isNaN(this.data['viewrange']) && this.data['viewrange'] > 0)
        {
            selfDescMark = true;

            descCell = new EquipTipSelfDesc();
            descCell.refreshView("增加可视范围", "+" + this.data['viewrange']);
            descCell.y = this.yPos;
            this.descGroup.addChild( descCell );
            this.yPos += 40;
        }

        this.tipSplitLine2.visible = false;
        if(true == selfDescMark)
        {
            this.tipSplitLine2.visible = true;
            this.tipSplitLine2.y = this.yPos;
        }
    }

    private updateSkillDesc()
    {
        var equipId = this.data['ID'];
        
        this.actionBoxObj['item']['name'] = this.data['name'];
        this.actionBoxObj['item']['imageURL'] = 'resource/icon/equip/' + this.data['iconSrc'] + '.png';

        var skillIds= this.data['skill'].split('|');
        skillIds.forEach( (skillId) => {
            let skillData = ConfigManager.getInstance().getConfig('skill', parseInt(skillId));
            if(!skillData) return;

            let prop:Object = {
                shortName: skillData['fullname'], //hero.moveDown()
                short_name: skillData['shortname'],//Down
                name: skillData['type'], //moveDown
                short_description: skillData['description'],
                short_example: skillData['example'],
                snippets: {},
                icon: 'resource/icon/action/' + skillData['icon'] + '_normal.png',
                type: 'function',
                owner: 'hero'
            };

            RES.getResAsync('SimplePaletteTip_tpl', (tpl,key)=>{
                let initialHTML:string = _.template(tpl)({
                    doc: prop,
                    marked: marked,
                    docName: 'docName',
                    selectedMethod: null,//skillData['type'],
                    language:'python',
                    writable:false,
                    argumentExamples:['a', 'b']
                });
                prop['initialHTML'] = initialHTML; 
            }, this);
            
            this.actionBoxObj['props'].push(prop);
        }, this);
    }

    private showSkillDesc()
    {
        var props = this.actionBoxObj['props'];
        props.forEach( function(prop) {
            var skillDesc = new EquipTipSkillDesc(prop);
            skillDesc.refreshView(prop);

            this.descGroup.addChild(skillDesc);
            skillDesc.y = this.yPos;
            this.yPos += 143;
        }, this);
    }
    /**
     * 装备该道具,并关闭装备提示界面
     */
    private onEquipBtnTouchHandler(e:egret.TouchEvent)
    {
        let equip_win = WindowManager.getWindowByName( 'EquipWindow' );
        let equipCard = equip_win['getEquipCardByUniqueId'](this.data['uuid'], equip_win['equipCards']['own']);
        if(equipCard) {
            equipCard['RequestOperate']();
            WindowManager.closeWindow('EquipTipWindow');
        }
    }

    /**
     * 卸载该道具,并关闭装备提示界面
     */
    private onUnloadBtnTouchHandler(e:egret.TouchEvent)
    {
        // let equip_win = WindowManager.getWindowByName( 'EquipWindow' );
        // let equipCard = equip_win['getEquipCardByUniqueId'](this.data['ID']);
        // if(equipCard) {
        //     equipCard['RequestOperate']();
        //     WindowManager.closeWindow('EquipTipWindow');
        // }
    }

    public dispose()
    {
        super.dispose();

        this.equipBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onEquipBtnTouchHandler, this);
        this.unloadBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onUnloadBtnTouchHandler, this);
    }
}