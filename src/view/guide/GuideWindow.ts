import Globals from "../../enums/Globals";
import Dialog from "./Dialog";
import GuideDialog from "./GuideDialog";
import StoryDialog from "./StoryDialog";
/**
 * Created by yaozhiguo on 2017/2/14.
 */
export const enum GuideConst{
    AREA_TYPE_CIRCLE = 1,
    AREA_TYPE_RECT = 2,

    GUIDE_TYPE_DIALOG_ONLY = 1,//1只有弹窗，2只有箭头，3弹窗和箭头都有
    GUIDE_TYPE_ARROW_ONLY = 2,
    GUIDE_TYPE_BOTH = 3,

    DIALOG_TYPE_GUIDE = 1,//1，引导弹窗 2：剧情弹窗
    DIALOG_TYPE_STORY = 2,

    DIALOG_POS_LEFT = 3, //引导弹窗相对位置 3，4代表左右
    DIALOG_POS_RIGHT = 4
}

export default class GuideWindow extends egret.Sprite
{
    private alphaBg:egret.Sprite;
    private av:number = 0.4;
    private currentDialog:Dialog;
    private arrow:dragonBones.EgretArmatureDisplay;
    private dialogs:Object;

    public constructor()
    {
        super();
        this.alphaBg = new egret.Sprite();
        this.alphaBg.touchEnabled = true;
        this.addChild(this.alphaBg);
        this.dialogs = {};
    }

    public updateGuideData(guideData:any):void
    {
        let guideType:number = parseInt(guideData['guide_type']);//1只有弹窗，2只有箭头，3弹窗和箭头都有
        switch (guideType)
        {
            case GuideConst.GUIDE_TYPE_DIALOG_ONLY:
            {
                this.hideArrow();
                this.updateDialog(guideData, true);
                break;
            }
            case GuideConst.GUIDE_TYPE_ARROW_ONLY:
            {
                this.hideDialog();
                this.updateGuide(guideData);
                break;
            }
            case GuideConst.GUIDE_TYPE_BOTH:
            {
                this.updateDialog(guideData, false);
                this.updateGuide(guideData);
                break;
            }
        }
    }

    private hideDialog():void
    {
        if (this.currentDialog)
        {
            this.currentDialog.hide();
        }
    }

    private hideArrow():void
    {
        if (this.arrow)
        {
            this.arrow.visible = false;
        }
    }

    //构造弹窗
    private updateDialog(guideData:Object, isMask:boolean):void
    {
        this.hideDialog();
        this.currentDialog = this.createDialog(guideData);
        this.currentDialog.update(guideData);
        this.currentDialog.show();
        isMask ? this.drawMaskBg() : this.alphaBg.graphics.clear();
    }

    //构造引导区域
    private updateGuide(guideData:Object):void
    {
        let clickAreaType:number = parseInt(guideData['click_area_type']);
        let clickAreaSize:string = guideData['click_area_size'];
        let size:string[] = clickAreaSize.split("|");
        if (clickAreaType === GuideConst.AREA_TYPE_CIRCLE)//圆形点击区域
        {
            this.drawCircleArea(parseInt(size[0]), parseInt(size[1]), parseInt(size[2]));
        }
        else //矩形点击区域
        {
            this.drawRectArea(parseInt(size[0]), parseInt(size[1]), parseInt(size[2]), parseInt(size[3]));
        }
        this.updateArrow(clickAreaType, size, guideData['arrow_direction']);
    }

    /*private updateArrow(areaType:number, size:string[], direction:string):void
    {
        if (!this.arrow)// for test
        {
            this.arrow = new egret.Sprite();
            this.arrow.graphics.clear();
            this.arrow.graphics.lineStyle(2, 0xff0000);
            this.arrow.graphics.beginFill(0xffff00);
            this.arrow.graphics.moveTo(0, 0);
            this.arrow.graphics.lineTo(50, 0);
            this.arrow.graphics.lineTo(25, 25);
            this.arrow.graphics.lineTo(0, 0);
            this.arrow.graphics.endFill();
            this.addChild(this.arrow);
            this.arrow.anchorOffsetX = 25;
            this.arrow.anchorOffsetY = 25;
            this.arrow.visible = false;
        }
        if (areaType == GuideConst.AREA_TYPE_CIRCLE)
        {
            this.arrow.x = parseInt(size[0]);
            this.arrow.y = parseInt(size[1]) - parseInt(size[2]) - 10;
        }
        else
        {
            this.arrow.x = parseInt(size[0]) + parseInt(size[2]) * 0.5;
            this.arrow.y = parseInt(size[1]) - 10;
        }
        this.arrow.visible = true;
    }*/

    private updateArrow(areaType:number, size:string[], direction:string):void
    {
        if (!this.arrow)// for test
        {
            this.arrow = this.createArrowAnim();
            this.addChild(this.arrow);
            this.arrow.anchorOffsetX = 25 - 18;
            this.arrow.anchorOffsetY = 25 - 36;
            this.arrow.visible = false;
            this.arrow.animation.stop();
        }
        if (areaType == GuideConst.AREA_TYPE_CIRCLE)
        {
            this.arrow.x = parseInt(size[0]);
            this.arrow.y = parseInt(size[1]) - parseInt(size[2]) - 10;
        }
        else
        {
            this.arrow.x = parseInt(size[0]) + parseInt(size[2]) * 0.5;
            this.arrow.y = parseInt(size[1]) - 10;
        }
        this.arrow.visible = true;
        this.arrow.animation.play('idle', 0);
    }

    private createArrowAnim():dragonBones.EgretArmatureDisplay
    {
        let factory:dragonBones.EgretFactory = new dragonBones.EgretFactory();
        factory.parseDragonBonesData(RES.getRes("jiantou_skeleton_json"));
        factory.parseTextureAtlasData(RES.getRes("jiantou_texture_json"), RES.getRes("jiantou_texture_png"));
        let ar:dragonBones.EgretArmatureDisplay = factory.buildArmatureDisplay("jiantou");
        return ar;
    }

    //创建不同的弹窗
    private createDialog(guideData:Object):Dialog
    {
        let dialogType:number = parseInt(guideData['dialog_type']);//1，引导弹窗 2：剧情弹窗
        let dialogPos:number = parseInt(guideData['story_dialog_pos']);//story_dialog_pos，3，4代表左右
        if (dialogType === GuideConst.DIALOG_TYPE_GUIDE)
        {
            let dialog = this.dialogs['guide'];
            if (!dialog)
            {
                dialog = new GuideDialog();
                this.addChild(dialog);
                dialog.x = dialogPos === GuideConst.DIALOG_POS_LEFT ? 0 : Globals.GAME_WIDTH - 900;
                dialog.y = Globals.GAME_HEIGHT - 360;
                this.dialogs['guide'] = dialog;
            }
            return dialog;
        }
        else
        {
            let dialog = this.dialogs['story'];
            if (!dialog)
            {
                dialog = new StoryDialog();
                this.addChild(dialog);
                this.dialogs['story'] = dialog;
            }
            return dialog;
        }
    }

    //绘制一个半透明背景
    private drawMaskBg():void
    {
        let g:egret.Graphics = this.alphaBg.graphics;
        g.clear();
        g.beginFill(0, this.av);
        g.drawRect(0, 0, Globals.GAME_WIDTH, Globals.GAME_HEIGHT);
        g.endFill();
    }

    //绘制一个圆形镂空区域
    private drawCircleArea(x:number, y:number, radius:number):void
    {
        let g:egret.Graphics = this.alphaBg.graphics;
        g.clear();

        //part above
        g.beginFill(0, this.av);

        g.drawArc(x, y, radius, 0, Math.PI, true);
        g.moveTo(x - radius, y);
        g.lineTo(0, y);
        g.lineTo(0, 0);
        g.lineTo(Globals.GAME_WIDTH, 0);
        g.lineTo(Globals.GAME_WIDTH, y);
        g.lineTo(x + radius, y);

        g.endFill();

        //part below
        g.beginFill(0, this.av);

        g.drawArc(x, y, radius, Math.PI, 0, true);
        g.moveTo(x + radius, y);
        g.lineTo(Globals.GAME_WIDTH, y);
        g.lineTo(Globals.GAME_WIDTH, Globals.GAME_HEIGHT);
        g.lineTo(0, Globals.GAME_HEIGHT);
        g.lineTo(0, y);
        g.lineTo(x - radius, y);

        g.endFill();
    }

    //绘制一个矩形镂空区域
    private drawRectArea(x:number, y:number, width:number, height:number):void
    {
        let g:egret.Graphics = this.alphaBg.graphics;
        g.clear();

        let halfHeight:number = height * 0.5;

        //part above
        g.beginFill(0, this.av);

        g.moveTo(x, y);
        g.lineTo(x, y + halfHeight);
        g.lineTo(0, y + halfHeight);
        g.lineTo(0, 0);
        g.lineTo(Globals.GAME_WIDTH, 0);
        g.lineTo(Globals.GAME_WIDTH, y + halfHeight);
        g.lineTo(x + width, y + halfHeight);
        g.lineTo(x + width, y);
        g.lineTo(x, y);

        g.endFill();

        //part below
        g.beginFill(0, this.av);

        g.moveTo(x + width, y + halfHeight);
        g.lineTo(Globals.GAME_WIDTH, y + halfHeight);
        g.lineTo(Globals.GAME_WIDTH, Globals.GAME_HEIGHT);
        g.lineTo(0, Globals.GAME_HEIGHT);
        g.lineTo(0, y + halfHeight);
        g.lineTo(x, y + halfHeight);
        g.lineTo(x, y + height);
        g.lineTo(x + width, y + height);
        g.lineTo(x + width, y + halfHeight);

        g.endFill();
    }
}