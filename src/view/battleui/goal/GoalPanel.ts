import GoalManager from "../../../control/goal/GoalManager";
import GoalInfo from "../../../control/goal/GoalInfo";
import GoalState from "../../../control/goal/GoalState";
import GoalLabel from "./GoalLabel";
import SoundManager from "../../../manager/SoundManager";
import GuideManager from "../../../manager/GuideManager";
import FrameTweenLite from "../../../base/utils/FrameTweenLite";
/**
 * Created by yaozhiguo on 2016/12/15.
 * 战斗目标的显示
 */

export default class GoalPanel extends eui.Component
{
    public isExpand: boolean = false;
    private goalBackground: eui.Image;
    private goalTaskWordImg:eui.Image;
    private goalUpSelectedImg:eui.Image;

    private labels:GoalLabel[]; //每个目标对应的一个显示对象，包含一个图片和文本
    private labelContainer:egret.Sprite;  //目标显示对象的容器，自动布局
    private highLightImages:Array<eui.Image>;

    public constructor()
    {
        super();

        this.x = 780;
        this.y = -200;

        //背景
        this.goalBackground = new eui.Image();
        this.goalBackground.source = RES.getRes('battle_scene_json.goal_frame_png');
        //this.goalBackground.x = 60;
        //this.goalBackground.y = -10;
        this.goalBackground.width  = 283;
        this.goalBackground.height = 260;
        // this.goalBackground.fillMode = 'SCALE';
        // this.goalBackground.scale9Grid = new egret.Rectangle(32, 11, 195, 48);
        this.addChild( this.goalBackground );

        //'任务'图片
        this.goalTaskWordImg= new eui.Image();
        this.goalTaskWordImg.source= RES.getRes('battle_scene_json.goal_word_img_png');
        this.goalTaskWordImg.x = 118;
        this.goalTaskWordImg.y = 23;
        this.goalTaskWordImg.fillMode = 'SCALE';
        this.addChild( this.goalTaskWordImg );

        //按钮箭头
        this.goalUpSelectedImg= new eui.Image();
        this.goalUpSelectedImg.source= 'function_up_selected_png';
        this.goalUpSelectedImg.x = 118;
        this.goalUpSelectedImg.y = 230;
        this.goalUpSelectedImg.fillMode = 'SCALE';
        this.addChild( this.goalUpSelectedImg );

        this.touchEnabled = true;
        this.touchChildren= false;
        this.addEventListener( egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this );

        GoalManager.getInstance().addEventListener(GoalManager.GOAL_STATE_CHANGED, this.update, this);
        GoalManager.getInstance().addEventListener(GoalManager.GOAL_STATE_INITIALIZED, this.init, this);

        //任务目标的容器，存放多个目标显示对象
        this.labelContainer = new egret.Sprite();
        this.labelContainer.x = 30;
        this.labelContainer.y = 52;
        let g:egret.Graphics = this.labelContainer.graphics;
        g.clear();
        g.beginFill(0xff0000, 0.0);
        g.drawRect(0, 0, 220, 150);
        g.endFill();
        this.addChild(this.labelContainer);

        this.highLightImages = [];

        for (let i = 0; i < 3; i++)
        {
            let imgStar:eui.Image = new eui.Image();
            this.addChild(imgStar);
            imgStar.source = 'resource/icon/item/common_star_normal.png';
            imgStar.x = 75 + i * 50;
            imgStar.y = 200;
            this.addChild(imgStar);

            let highStar:eui.Image = new eui.Image();
            highStar.source = 'resource/icon/item/common_star_selected.png';
            highStar.x = 75 + i * 50;
            highStar.y = 200;
            this.addChild(highStar);
            this.highLightImages.push(highStar);
        }

        this.setStar(0);
    }

    private onTouchHandler( e: egret.TouchEvent ):void
    {
        if( this.isExpand )
        {
            this.collapsePanel();
        }
        else
        {
            this.expandPanel();
        }
    }

    /**
     * 打开面板
     * @constructor
     */
    public expandPanel():void
    {
        FrameTweenLite.to(this, 1.0, {
            y:0,
            onComplete:()=>{
                this.isExpand = true;
                FrameTweenLite.killTweensOf(this);
            }
        });
    }

    /**
     * 关闭面板
     * @constructor
     */
    public collapsePanel():void
    {
        FrameTweenLite.to(this, 0.3, {
            y:-200,
            onComplete:()=>{
                this.isExpand = false;
                FrameTweenLite.killTweensOf(this);
            }
        });
    }

    //进入战斗界面后的动画效果
    public patrolPanel():void
    {
        TweenLite.to(this, 1.0, {
            y:0,
            onComplete:()=>{
                this.isExpand = true;
            }
        }).delay(2);

        TweenLite.to(this, 0.5, {
            y:-200,
            onComplete:()=>{
                this.isExpand = false;
            }
        }).delay(5);
    }

    private init(event:egret.Event):void
    {
        let cs:GoalInfo[] = event.data;
        console.log('goal:',cs);
        this.labels = [];
        for (let i in cs)
        {
            let c:GoalInfo = cs[i];
            let goalLabel:GoalLabel = new GoalLabel(c.data, GoalState.FAILED);
            goalLabel.x = 0;
            goalLabel.y = parseInt(i) * 50;
            this.labelContainer.addChild(goalLabel);
            this.labels.push(goalLabel);
        }
        this.layoutLabels();
    }

    //自动对目标栏进行布局
    private layoutLabels():void
    {
        let len: number = this.labels.length;
        let partHeight = this.labelContainer.height / (len + 1);
        for (let i:number = 0; i < len; i++)
        {
            this.labels[i].y = partHeight * (i + 1) - this.labels[i].height;
        }
    }

    private update(event:egret.Event):void
    {
        let cs:any = event.data;
        if (cs instanceof Array)
        {
            for (let i in cs)
            {
                this.getLabelByName(cs[i].data.name).setState(cs[i].state);
            }
        }
        else if (cs instanceof GoalInfo)
        {
            this.getLabelByName(cs.data.name).setState(cs.state);
            if (cs.state === GoalState.SUCCESS)
            {
                SoundManager.getInstance().playEffect('u08_succeed_mp3');
            }
            if (parseInt(cs.data['world_end_after']) === 1)//需要终止战斗
            {
                GoalManager.getInstance().dispatchEvent(new egret.Event(GoalManager.GOAL_WORLD_END, false, false, 1.5));
            }
        }
        this.setStar(GoalManager.getInstance().star);
        if (GoalManager.getInstance().win)
        {
            GuideManager.getInstance().start(2014);
        }
    }

    private getLabelByName(name:string):GoalLabel
    {
        for (let key in this.labels)
        {
            if (this.labels[key].data.name === name)
            {
                return this.labels[key];
            }
        }
        return null;
    }
    
    private setStar(star:number):void
    {
        for (let i = 0; i < 3; i++)
        {
            this.highLightImages[i].visible = i < star;
        }
    }

    public dispose():void
    {
        this.removeChildren();
        this.labels = null;
        this.highLightImages = null;
        GoalManager.getInstance().removeEventListener(GoalManager.GOAL_STATE_CHANGED, this.update, this);
        GoalManager.getInstance().removeEventListener(GoalManager.GOAL_STATE_INITIALIZED, this.init, this);
    }
}
