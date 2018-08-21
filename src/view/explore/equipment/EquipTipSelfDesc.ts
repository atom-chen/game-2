/**
 * 装备自身的其中一个属性展示
 * 装备展示的有自身属性,技能属性需要区别开来
 * @author rappel
 * @time 2017-01-11 11:00
 */
export default class EquipTipSelfDesc extends eui.Component
{
    public propertyIcon:eui.Image; //一个icon图片,与属性|技能对应
    public propertyDesc1:eui.Label; //一行文字展示
    public propertyDesc2:eui.Label;

    constructor()
    {
        super();
        this.skinName = "EquipTipSelfDescSkin";
    }

    public refreshView(desc1:string, desc2:string)
    {
        this.propertyDesc1.text = desc1;
        this.propertyDesc2.text = desc2;
    }
}