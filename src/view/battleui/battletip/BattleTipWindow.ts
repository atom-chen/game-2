import BaseWindow from "../../../base/popup/BaseWindow";
import ResourceItem = RES.ResourceItem;
/**
 * Created by yaozhiguo on 2017/2/21.
 */
export default class BattleTipWindow extends BaseWindow
{
    private _container:egret.Sprite;
    private _txt:egret.TextField;

    public constructor()
    {
        super();
        this.skinName = 'BattleTipWindowSkin';
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this._container = new egret.Sprite();
        this.addChild(this._container);
        this._container.x = 60;
        this._container.y = 140;
        this._txt = new egret.TextField();
        this._container.addChild(this._txt);
        this._txt.width = 488 * 2;
        this._txt.height = 316 * 2;
        this._txt.lineSpacing = 10;
        this.showTip();
    }

    private showTip():void
    {
        RES.getResByUrl('resource/battletips/110001.txt', (data:any, url:string)=>{
            this._txt.textFlow = (new egret.HtmlTextParser).parser(data);
        }, this, ResourceItem.TYPE_TEXT);
        /*let rawStr:string =
            '       <font size=20 color=#d6eaff>从这一关开始，你的英雄可以在战斗中大展身手了！</font>\n' +
            '       <font size=20 color=#d6eaff>让我们从最基础的攻击指令开始吧。</font>\n'+
            '<font size=40 color=#00F5FF fontFamily="Microsoft Yahei">方法调用</font><font size=30 color=#EEEE00 fontFamily="微软雅黑"> - attack()</font>\n'+
            '       <font size=20 color=#d6eaff>当英雄移动到适合攻击的位置后，输入如下攻击代码——\n'+
            '       <font color=#0000FF fontFamily="微软雅黑"><b>self.attack(enemy)</b></font>\n'+
            '       别小看这短短一行代码，里面却有两个很有用的知识点。</font>\n'+
            '<font size=40 color=#00F5FF fontFamily="微软雅黑">参数</font>\n'+
            '       <font size=20 color=#d6eaff>括号里的<font size=20 color=#ff6a6a>enemy</font>是一个参数。当你调用一个方法时，可以通过提供一些额外的信息来进一步设定该方法应如何作用。这些额外信息通常被称为“参数”。以\n'+
            '       <font color=#0000FF fontFamily="微软雅黑"><b>self.attack(enemy)</b></font>\n来说，就表示让英雄去攻击用<font color=#FF6A6A>enemy</font>指代的特定某个敌人。</font>\n'+
            '<font size=40 color=#00F5FF fontFamily="微软雅黑">字符串</font>\n'+
            '       <font size=20 color=#d6eaff>在这一关有两个敌人，所以接下来我们需要把enemy写得更具体。你可以把它改成<font color=#FF6A6A>"Afra"</font>，注意引号必须是英文的。这表示攻击的对象是名字叫<font color=#FF6A6A>Afra</font>的那个敌人。\n'+
            '       在Python中将文本填入双引号可以使之变成字符串格式，字符串是编程语言中表示文本的数据类型。\n'+
            '       顺带一提，Python有五个标准的数据类型：<font color=#FF6A6A>Numbers（数字）</font>、<font color=#FF6A6A>String（字符串）</font>、<font color=#FF6A6A>List（列表）</font>、<font color=#FF6A6A>Tuple（元组）</font>、<font color=#FF6A6A>Dictionary（字典）</font>。将来我们会逐一学到相关的内容。</font>';



        this._txt.textFlow = (new egret.HtmlTextParser).parser(rawStr);*/
    }

    public onCloseClick(e:egret.TouchEvent):void
    {
        super.onCloseClick(e);
        document.getElementById('code-area').style.display = 'block';
    }
}