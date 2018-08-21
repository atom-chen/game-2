import Globals from "../../../enums/Globals";
import ActionGroup from "./ActionGroup";
import ActionItem from "./ActionItem";
import MouseScroller from "../../common/MouseScroller";
/**
 * Created by yaozhiguo on 2016/12/29.
 * 显示指令集合的容器。
 */

export default class ActionBox extends egret.Sprite
{
    public isCollapse:boolean = true;

    private HGAP:number = 5;
    private VGAP:number = 0;

    private paletteGroupList:Array<any> = [];
    private scrollView:egret.ScrollView;
    private groupContent:egret.Sprite;

    private entryGroups;
    private realPos:number = 0; //记录滚动区域的top的值，即滚动区域的上沿和视区上沿的距离.
    private scrollThumb:egret.Sprite;

    private _iconState:string = 'txt';

    public setIconState(value:string):void
    {
        this._iconState = value;
    }

    public constructor()
    {
        super();

        this.paletteGroupList = [];
        this.drawBg();
        this.touchEnabled = true;
        this.scrollView = new egret.ScrollView();
        this.scrollView.width = Globals.PALETTE_WIDTH;
        this.scrollView.height = Globals.PALETTE_HEIGHT;
        this.groupContent = new egret.Sprite();
        this.scrollView.setContent(this.groupContent);
        this.addChild(this.scrollView);
        this.scrollView.verticalScrollPolicy = 'auto';
        //添加滚动按钮到舞台
        this.drawScroll();

        MouseScroller.enableMouseScrollView(this.scrollView, 2 * this.VGAP);
    }

    public updateContentPosition(deltaStep:number):void
    {
        this.realPos = this.scrollView.scrollTop;
        var deltaH:number = this.groupContent.height + 2*this.VGAP - this.scrollView.height;
        if (deltaH <= 0)
        {
            this.realPos = 0;
        }
        else
        {
            this.realPos += deltaStep;
            if (this.realPos < 0)
            {
                this.realPos = 0;
            }
            else if (this.realPos > deltaH)
            {
                this.realPos = deltaH;
            }
        }
        this.updateScrollPos();
    }

    //绘制滚动按钮
    private drawScroll():void
    {
        this.scrollThumb = new egret.Sprite();
        let g:egret.Graphics = this.scrollThumb.graphics;
        g.clear();
        g.beginFill(0x0181f1, 0.6);
        g.drawRect(0,0,5,35);
        g.endFill();
        this.scrollThumb.x = Globals.PALETTE_WIDTH - 5;
        this.scrollThumb.y = 0;
        this.addChild(this.scrollThumb);
        this.scrollThumb.visible = false;
    }

    //绘制背景图片
    private drawBg():void
    {
        this.graphics.clear();
        this.graphics.beginFill(0x00fddf, 0);
        this.graphics.drawRoundRect(0, 0, Globals.PALETTE_WIDTH, Globals.PALETTE_HEIGHT, 5, 5);
        this.graphics.endFill();
    }

    private updateScrollPos():void
    {
        this.scrollView.scrollTop = this.realPos;
        var deltaH:number = this.groupContent.height + 2*this.VGAP - this.scrollView.height;
        if(deltaH <= 0)
        {
            this.scrollThumb.visible = false;
        }
        else
        {
            // this.scrollThumb.visible = true;
            this.scrollThumb.visible = false;
            this.scrollThumb.y = (Globals.PALETTE_HEIGHT - this.scrollThumb.height) * this.realPos / deltaH;
        }
    }

    public updatePalette(groups,language='python'):void
    {
        this.dispose();
        this.entryGroups = groups;
        for (let key in groups)
        {
            let group:Object = groups[key];
            let item:Object = group['item']; //name,imageURL
            let props:Array<Object> = group['props']; //Array<Object>, object=>description,i18n,name,snippets,type
            let short = group['short'];
            let actionGroup:ActionGroup = new ActionGroup();
            for (let index in props)
            {
                let obj:Object = props[index];
                let paletteItem = new ActionItem(obj, language);
                actionGroup.addItem(paletteItem);
            }
            actionGroup.setProperty(item, short);
            actionGroup.layout();
            this.groupContent.addChild(actionGroup);
            this.paletteGroupList.push(actionGroup);
        }
    }

    public charLayout(nColumns:number = 2):void
    {
        this.paletteGroupList.sort((a:ActionGroup, b:ActionGroup)=>{
            if (a.numChildren > b.numChildren)return -1;
            else if (a.numChildren < b.numChildren)return 1;
            else return 0;
        });

        let baselines:Array<number> = [0, 0];//nColumns == 2 ? [0, 0] : [0, 0, 0]; //每列占据的高度
        let columnCursor:number = 0; //标记当前函数组块所处的列索引
        let columnWidth:number = 170;

        for (let i:number = 0; i < this.paletteGroupList.length; i++){
            let paletteGroup:ActionGroup = this.paletteGroupList[i];
            paletteGroup.changeToTxtState();
            /*var min = nColumns==2 ? Math.min(baselines[0], baselines[1]) :
             Math.min(baselines[0], baselines[1],baselines[2]);*/
            let min = Math.min(baselines[0], baselines[1]);
            let minHeightColumn = baselines.indexOf(min);
            columnCursor = minHeightColumn;
            paletteGroup.x = this.HGAP + columnCursor * (paletteGroup.width + this.HGAP);
            paletteGroup.y = this.VGAP + min;
            baselines[columnCursor] = paletteGroup.y + paletteGroup.height;
        }
        this.realPos = 0;
        this.scrollThumb.x = Globals.PALETTE_WIDTH - 5;
        this.updateScrollPos();
        egret.localStorage.setItem('spellBoxLayout', 'txt');
    }

    public iconLayout(nColumns:number = 2):void
    {
        this.paletteGroupList.sort((a:ActionGroup, b:ActionGroup)=>{
            if (a.numChildren > b.numChildren)return 1;
            else if (a.numChildren < b.numChildren)return -1;
            else return 0;
        });

        let rowIndex:number = 0;
        let columnBaseLines:Array<number> = [0];
        let baseY:number = 0;
        for (let i:number = 0; i < this.paletteGroupList.length; i++)
        {
            var paletteGroup:ActionGroup = this.paletteGroupList[i];
            paletteGroup.changeToIconState();
            //如果当前组过宽，则放入下一行
            if (paletteGroup.width + columnBaseLines[rowIndex] > Globals.PALETTE_WIDTH)
            {
                rowIndex ++;
                paletteGroup.x = this.HGAP;
                paletteGroup.y = this.VGAP + baseY;//rowIndex * (paletteGroup.height + this.VGAP);
                columnBaseLines.push(this.HGAP + paletteGroup.width);
            }
            //否则，直接追加到当前行的末尾
            else
            {
                paletteGroup.x = this.HGAP;//columnBaseLines[rowIndex] + this.HGAP;
                paletteGroup.y = this.VGAP + baseY;//rowIndex * (paletteGroup.height + this.VGAP);
                columnBaseLines[rowIndex] = paletteGroup.x + paletteGroup.width;
            }
            if (paletteGroup.y + paletteGroup.height > baseY)
            {
                baseY = paletteGroup.y + paletteGroup.height;
            }
        }
        this.realPos = 0;
        this.scrollThumb.x = Globals.PALETTE_WIDTH - 5;
        this.updateScrollPos();
        egret.localStorage.setItem('spellBoxLayout', 'icon');
    }

    public dispose():void
    {
        for (let i in this.paletteGroupList)
        {
            var group:ActionGroup = this.paletteGroupList[i];
            group.dispose();
        }
        this.groupContent.removeChildren();
        this.paletteGroupList = [];
    }
}
