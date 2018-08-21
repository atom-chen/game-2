/**
 * @auther rappel
 * @time 2016-12-13 14:25
 */
import BaseWindow from "../../../base/popup/BaseWindow";
import BarrierCell from "./BarrierCell";
import FrameTweenLite from "../../../base/utils/FrameTweenLite";

export default class BarrierWindow extends BaseWindow 
{
    public static MAXBARRIERCELLNUM:number = 5;
    public static BARRIERCELL_POS:Array<number> = [33, 400, 370];//x, y, cellWidth

    //选关界面的关卡格子,为了实现左右切换的效果,用索引指针来实现
    private barrierIndex:number;
    public barrierList: Array<BarrierCell>;

    //组名
    private labGroupName: eui.Label;
    private knowledgePoints: eui.Label;
    
    //当前关的高亮箭头
    private barrier_arrow: eui.Image;

    private btnPrev: eui.Button;
    private btnNext: eui.Button;
    
    public constructor(name?:string) 
    {
        super();
        this.skinName = "BarrierWindowSKin";
    }

    protected updateView():void 
    {
        super.updateView();

        this.barrierIndex = 0;
        this.barrierList  = new Array<BarrierCell>();
        this.labGroupName.text = this.data['name'];
        this.knowledgePoints.text = this.data['topic'];

        //
        var levels = this.data['levels'];
        Object.keys( levels ).forEach( function(level_key) {
            let barrierCell = new BarrierCell( levels[level_key] );
            this.barrierList.push( barrierCell );
        }, this);
        
        this.refreshView(true);

        this.btnPrev.addEventListener(egret.TouchEvent.TOUCH_TAP, this.btnPrevTouchHandler, this);
        this.btnNext.addEventListener(egret.TouchEvent.TOUCH_TAP, this.btnNextTouchHandler, this);
    }

    /**
     * 刷新视图
     */
    private refreshView(animation:boolean, levelsInfo?:any):void
    {
        this.removeCells();

        var currLevelArrawPos = [];

        //展示所有关卡
        var listLen = this.barrierList.length;
        for(let i = this.barrierIndex; i < listLen && i < this.barrierIndex + BarrierWindow.MAXBARRIERCELLNUM; ++ i)
        {
            let barrierCell = this.barrierList[i];
            let newX:number = BarrierWindow.BARRIERCELL_POS[0] + (i - this.barrierIndex) * BarrierWindow.BARRIERCELL_POS[2];
            barrierCell.y = BarrierWindow.BARRIERCELL_POS[1];
            this.addChild( barrierCell );
            if(animation){
                barrierCell.x = newX;
                FrameTweenLite.to(barrierCell,0.2,{delay:i*0.1,x:newX});
            }
            else barrierCell.x = newX + 50;
            //找到游戏当前进度关卡,并记录下来它的位置信息
            if(barrierCell.cellData && BarrierCell.STATE_STRIP == barrierCell.cellData['state_locked'])
            {
                currLevelArrawPos = [barrierCell.x, barrierCell.y];
            }
        }

        //如果游戏当前进度所在关卡在这个分组里,就把高亮箭头展示出来
        if(currLevelArrawPos.length > 0)
        {
            //当前关的高亮箭头
            if(!this.barrier_arrow)
            {
                this.barrier_arrow = new eui.Image();
                this.barrier_arrow.source = RES.getRes("barrier_json.barrier_arrow_png");
            }
            this.barrier_arrow.visible = true;
            this.barrier_arrow.x = currLevelArrawPos[0] + 115;
            this.barrier_arrow.y = currLevelArrawPos[1] + 460;
            this.addChild( this.barrier_arrow );

            egret.Tween.get( this.barrier_arrow, {
                loop: true
            }).to({
                y: currLevelArrawPos[1] + 410
            }, 500).to({
                y: currLevelArrawPos[1] + 460
            }, 450);
        }

        //左右切换页签
        this.btnPrev.visible = this.btnNext.visible = false;
        if(this.barrierIndex > 0) this.btnPrev.visible = true;
        if(this.barrierIndex < this.barrierList.length - BarrierWindow.MAXBARRIERCELLNUM)
        {
            this.btnNext.visible = true;
        }
    }

    public updateCellStarInfo(groupInfo:any)
    {
        var levels = groupInfo['levels'] || this.data['levels'];
        var index  = 0;
        Object.keys( levels ).forEach( function(level_key) {
            // let barrierCell = new BarrierCell( levels[level_key] );
            this.barrierList[index ++].updateCellStar( levels[level_key] );
        }, this);
    }

    private removeCells()
    {
        var listLen = this.barrierList.length;
        if( this.barrierList && listLen)
        {
            for(let i = 0; i < listLen; ++ i)
            {
                if(this.contains( this.barrierList[i] )) this.removeChild( this.barrierList[i] );
            }
        }
    }

    private btnPrevTouchHandler(e:egret.TouchEvent)
    {
        if(this.barrierIndex <= 0) return;
        -- this.barrierIndex;
        this.refreshView(false);
    }

    private btnNextTouchHandler(e:egret.TouchEvent)
    {
        if(this.barrierIndex >= this.barrierList.length - BarrierWindow.MAXBARRIERCELLNUM) return;
        ++ this.barrierIndex;
        this.refreshView(false);
    }

    public dispose()
    {
        super.dispose();

        if(this.barrier_arrow) 
        {
            egret.Tween.removeTweens( this.barrier_arrow );
        }
        this.btnPrev.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.btnPrevTouchHandler, this);
        this.btnNext.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.btnNextTouchHandler, this);
    }
} 