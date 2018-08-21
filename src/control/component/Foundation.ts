import BaseComponent from "./BaseComponent";
import SceneObjectActor from "../actions/SceneObjectActor";
import SceneObject from "../../view/battlescene/scene/SceneObject";
import Globals from "../../enums/Globals";
import World from "../../view/battlescene/world/World";
import SceneItem from "../../view/battlescene/scene/SceneItem";
import Hero from "../../view/battlescene/scene/Hero";
import SceneMoveObject from "../../view/battlescene/scene/SceneMoveObject";
import SceneItemTypes from "../../enums/SceneItemTypes";
import BattleScene from "../../view/battlescene/BattleScene";
import SceneManager from "../../manager/SceneManager";
import FrameTweenLite from "../../base/utils/FrameTweenLite";
import Person from "../../view/battlescene/scene/Person";
/**
 * Created by yaozhiguo on 2017/3/3.
 */
export default class Foundation extends BaseComponent
{
    public attach(actor:SceneObjectActor):void
    {
        super.attach(actor);
        actor.addMethod('distanceTo', this.distanceTo);
        actor.addMethod('wait', this.wait);
        actor.addMethod('now', this.now);
        actor.addMethod('open', this.open);
        actor.addMethod('check', this.check);
        actor.addMethod('costOf', this.costOf);
        actor.addMethod('setLightColor', this.setLightColor);
        actor.addMethod('toggleLight', this.toggleLight);
    }

    /**
     * 当前英雄距离某个场景元素的距离，以格子长度为单位
     * @param obj 场景元素
     * @returns {number}
     */
    public distanceTo(obj:SceneObjectActor):number
    {
        //if (!obj || !obj.sceneObject)return Number.MAX_VALUE;
        let sceneObjectActor:any = this;
        let sceneObject:SceneObject = sceneObjectActor.sceneObject;
        let deltaX = obj.sceneObject.x - sceneObject.x;
        let deltaY = obj.sceneObject.y - sceneObject.y;
        let slideLength:number = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        return slideLength / Globals.TILE_WIDTH;
    }

    /**
     * 使用open技能后，如果是不需条件的箱子，会直接打开；
     * 如果是需要条件（如英雄持有特定钥匙、或英雄say了特定语句）的箱子，满足条件则箱子打开，否则会发出开启失败的音效，而箱子不会打开
     * @param target
     */
    public open(target:any):void
    {
        let sceneObjectActor:any = this;
        let sceneObject:SceneObject = sceneObjectActor.sceneObject;
        let world:World = sceneObject.gameWorld;
        let targetObj:SceneObject;
        let targetPos:egret.Point;
        if (_.isString(target))
        {
            targetObj = world.getSceneObjectByName(target);
        }
        else if (target instanceof SceneObjectActor)
        {
            targetObj = target.sceneObject;
        }
        if (targetObj)
        {
            targetPos = targetObj.logicPosition;
        }
        if (targetPos)
        {
            if (targetPos.equals(sceneObject.logicPosition))
            {
                (<Hero>sceneObject).openSceneItem(<SceneItem>targetObj);
            }
            else
            {
                sceneObjectActor.lock();
                (<Hero>sceneObject).moveCloseTo(targetPos, 2);
                sceneObject.once(SceneMoveObject.MOVE_FINISHED, ()=>{
                    let hero:Hero = <Hero>sceneObject;
                    hero.openSceneItem(<SceneItem>targetObj);
                    //sceneObjectActor.unlock();
                    if (hero.moveToNearestKeyPoint())
                    {
                        hero.once(SceneMoveObject.MOVE_FINISHED, (event:egret.Event)=>{
                            //console.log('moveFinished!');
                            sceneObjectActor.unlock();
                        }, this)
                    }
                    else
                    {
                        sceneObjectActor.unlock();
                    }
                }, this)
            }
        }
    }

    /**
     * 使用check技能后，会在关卡画面中激活查看窗口，呈现目标对应的查看内容，该窗口持续代码所写的秒数后自动消失
     * 然后程序自动运行下一行代码
     * @param target 为检查的目标
     * @param time  为窗口持续时间
     */
    public check(target:any, time:number):void
    {
        let sceneObjectActor:any = this;
        let sceneObject:SceneObject = sceneObjectActor.sceneObject;
        let world:World = sceneObject.gameWorld;
        let targetObj:SceneObject;
        if (_.isString(target))
        {
            targetObj = world.getSceneObjectByName(target);
        }
        else if (target instanceof SceneObjectActor)
        {
            targetObj = target.sceneObject;
            if (targetObj instanceof SceneItem)
            {
                let sceneItem:SceneItem = <SceneItem>targetObj;
                if (parseInt(sceneItem.getData().type) != SceneItemTypes.CHECKABLE_ITEM)//必须是可检测的道具
                {
                    return;
                }
            }
        }
        if (targetObj)
        {
            let battleScene:BattleScene = <BattleScene>(SceneManager.getInstance().getRunningScene());
            sceneObjectActor.lock();
            battleScene.battleUI.showCheckTip(<SceneItem>targetObj);
            FrameTweenLite.delayedCall(time || 3, ()=>{
                sceneObjectActor.unlock();
                battleScene.battleUI.hideCheckTip();
            });
        }
    }

    /**
     * 控制英雄在time时间内原地idle
     * @param time 以秒为单位
     */
    public wait(time:number):void
    {
        let sceneObjectActor:any = this;
        let sceneObject:SceneObject = sceneObjectActor.sceneObject;
        sceneObjectActor.lock();
        sceneObject.idle();
        FrameTweenLite.delayedCall(time || 3, ()=>{
            sceneObjectActor.unlock();
        });
    }

    /**
     *  从开始执行代码到调用本方法时的时间间隔
     * @returns {number}
     */
    public now():number
    {
        let sceneObjectActor:any = this;
        return Math.floor((egret.getTimer() - sceneObjectActor['startTick']) * 0.001);
    }

    public costOf(target:any):void
    {

    }

    public setLightColor(color:string):void
    {
        let colorTexture:string;
        switch(color)
        {
            case 'pink':
            {
                colorTexture = 'Streamer_1';
                break;
            }
            case 'white':
            {
                colorTexture = 'Streamer_2';
                break;
            }
            case 'green':
            {
                colorTexture = 'Streamer_3';
                break;
            }
            case 'yellow':
            {
                colorTexture = 'Streamer_4';
                break;
            }
            case 'red':
            {
                colorTexture = 'Streamer_5';
                break;
            }
        }
        if (!colorTexture)return;
        let sceneObjectActor:any = this;
        let sceneObject:Hero = sceneObjectActor.sceneObject;
        if (!sceneObject.drawContent || sceneObject.drawContent.length < 1)return;//没有开启画图
        sceneObject.drawContent = colorTexture;
    }

    public toggleLight(toggle:boolean):void
    {
        let sceneObjectActor:any = this;
        let sceneObject:Hero = sceneObjectActor.sceneObject;
        sceneObject.drawContent = toggle ? 'Streamer_1' : '';
    }
}