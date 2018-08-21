/**
 * 装备技能属性展示
 * @author rappel
 * @time 2017-01-11 12:40
 */
import Globals from "../../../enums/Globals";
import ActionItem from "../../../view/battleui/action/ActionItem";

export default class EquipTipSkillDesc extends eui.Component
{
    private skillPropertyIcon:eui.Image;
    private skillPropertyName:eui.Label;
    private skillPropertyAdd:eui.Label;
    private skillPropertyAddValue:eui.Label;
    private skillPropertyDesc:eui.Label;

    private prop:any;

    constructor(prop:any)
    {
        super();
        this.skinName = "EquipTipSkillDescSkin";

        this.prop = prop;
    }

    protected chilrenCreated()
    {
        super.childrenCreated();
    }
    /**
     * prop: {
     *  shortName: 'hero.moveDown',
     *  short_name: Down,
     *  name: moveDown,
     *  short_description: '',
     *  snippets: {},
     *  icon: 'resource/xxx/yyy/xxx.png',
     *  type: 'function',
     *  owner: 'hero'
     * }
     */
    public refreshView(prop:Object)
    {
        this.prop = prop;

        this.skillPropertyIcon.source   = prop['icon'];
        this.skillPropertyName.text     = prop['name'];
        this.skillPropertyAddValue.text = prop['skillPropertyAdd'];
        this.skillPropertyDesc.text     = prop['short_description'];

        this.onMouseOut.bind(this);
        this.onMouseOver.bind(this);
        this.addEventListener(mouse.MouseEvent.MOUSE_OVER, this.onMouseOver,this, true);
        this.addEventListener(mouse.MouseEvent.MOUSE_OUT, this.onMouseOut, this, true);
    }

    private onMouseOver(e:mouse.MouseEvent):void
    {
        let skillDescTip = $("#codeTipData");
        // skillDescTip.html( this.skillPropertyName.text + "\n" +
        //                    "技能加成  +" + this.skillPropertyAddValue.text + "%" +
        //                    this.skillPropertyDesc.text );
        skillDescTip.html(this.prop.initialHTML);

        let self = this;
        let wstr = skillDescTip.css('width');
        let hstr = skillDescTip.css('height');
        let tipWidth = parseFloat(wstr.substr(0, wstr.length - 2));
        let tipHeight = parseFloat(hstr.substr(0, hstr.length - 2));
        
        let globalPos:egret.Point = self.parent.localToGlobal(self.x, self.y);
        let dw:number = (window.innerWidth - Globals.domGameWidth) * 0.5;
        let dh:number = (window.innerHeight - Globals.domGameHeight) * 0.5;
        let rx:number = Globals.scaleRatio * globalPos['x'];
        let ry:number = Globals.scaleRatio * globalPos['y'];
        skillDescTip.css('left', dw + rx + self.width * Globals.scaleRatio * 0.5 - tipWidth - 10);
        skillDescTip.css('top', dh + ry - tipHeight - 25);
        skillDescTip.removeClass('hidden');
        // this.filters = [ColorFilterFactory.HIGHLIGHT_FILTER];
    }

    private onMouseOut(e:mouse.MouseEvent):void
    {
        $("#codeTipData").addClass('hidden');
        this.filters = null;
    }

    // private onMouseOver(event:mouse.MouseEvent):void
    // {
    //     let actionTip = $("#codeTipData");
        // actionTip.html(this._doc.initialHTML);
        // this._txtMethod.textColor = 0xf3ff8d;
        // let self:ActionItem = this;
        // let wstr = actionTip.css('width');
        // let hstr = actionTip.css('height');
        // let tipWidth = parseFloat(wstr.substr(0, wstr.length - 2));
        // let tipHeight = parseFloat(hstr.substr(0, hstr.length - 2));
        // //console.log(tipWidth, tipHeight);
        // let globalPos:egret.Point = self.parent.localToGlobal(self.x, self.y);
        // let dw:number = (window.innerWidth - Globals.domGameWidth) * 0.5;
        // let dh:number = (window.innerHeight - Globals.domGameHeight) * 0.5;
        // let rx:number = Globals.scaleRatio * globalPos.x;
        // let ry:number = Globals.scaleRatio * globalPos.y;
        // actionTip.css('left', dw + rx + self.width * Globals.scaleRatio * 0.5 - tipWidth - 10);
        // actionTip.css('top', dh + ry - tipHeight - 25);
        // actionTip.removeClass('hidden');
        // SoundManager.getInstance().playEffect('u07_skill_mp3');
        // this.filters = [ColorFilterFactory.HIGHLIGHT_FILTER];
    // }

    // private onMouseOut(event:mouse.MouseEvent):void
    // {
    //     $("#codeTipData").addClass('hidden');
    //     this._txtMethod.textColor = 0x00caff;
    //     this.filters = null;
    // }

    protected convertLocalToGlobal(lx:number, ly:number):Object
    {
        lx = lx + 1070;
        ly = ly + 270;
        return {
            x: lx,
            y: ly
        };
    }

    public dispose()
    {
        this.removeEventListener(mouse.MouseEvent.MOUSE_OVER, this.onMouseOver,this, true);
        this.removeEventListener(mouse.MouseEvent.MOUSE_OUT, this.onMouseOut, this, true);
    }
}