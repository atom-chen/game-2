/**
 * Created by yaozhiguo on 2017/1/17.
 */
export default class SkillBar extends egret.Sprite
{
    private imgIcon:eui.Image;
    private labName:eui.Label;
    private labDesc:eui.Label;

    public constructor()
    {
        super();

        this.graphics.clear();
        this.graphics.beginFill(0,0);
        this.graphics.drawRect(0, 0, 590, 120);
        this.graphics.endFill();

        this.imgIcon = new eui.Image();
        this.addChild(this.imgIcon);
        this.imgIcon.x = 40;
        this.imgIcon.y = 30;

        this.labName = new eui.Label();
        this.labName.x = 130;
        this.labName.y = 20;
        this.addChild(this.labName);
        this.labName.size = 28;
        this.labName.textColor = 0xffffff;
        this.labName.fontFamily = 'Microsoft Yahei';
        this.labName.stroke = 3;
        this.labName.strokeColor = 0x003479;

        this.labDesc = new eui.Label();
        this.labDesc.x = 130;
        this.labDesc.y = 60;
        this.addChild(this.labDesc);
        this.labDesc.size = 22;
        this.labDesc.textColor = 0xffffff;
        this.labDesc.fontFamily = 'Microsoft Yahei';
        this.labDesc.multiline = true;
        this.labDesc.wordWrap = true;
    }

    public setSkillData(skillData:Object):void
    {
        this.labName.text = skillData['name_cn'];
        this.imgIcon.source = 'resource/icon/action/' + skillData['icon'] + '_normal.png';
        this.labDesc.text = skillData['description'];
    }
}