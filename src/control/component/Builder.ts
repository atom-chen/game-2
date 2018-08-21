import BaseComponent from "./BaseComponent";
import SceneObjectActor from "../actions/SceneObjectActor";
import ConfigManager from "../../manager/ConfigManager";
import Person from "../../view/battlescene/scene/Person";
import SceneMoveObject from "../../view/battlescene/scene/SceneMoveObject";
import {Turn} from "../../view/battlescene/scene/SceneObject";
/**
 * Created by yaozhiguo on 2017/3/2.
 */
export default class Builder extends BaseComponent
{
    public attach(actor:SceneObjectActor):void
    {
        super.attach(actor);
        actor.addMethod('buildXY', this.buildXY);
    }

    /**
     * 在世界中某个位置构建指定类型的SceneObject。
     * @param type
     * @param x
     * @param y
     */
    public buildXY(type:string, x:number, y:number, isSummon?:boolean):void
    {
        let sceneObjectActor:any = this;
        let sceneObject:Person = <Person>(sceneObjectActor.sceneObject);
        let filters:string[] = ['ravidelfin', 'iceelfin', 'shadowelfin'];
        switch(type)
        {
            case 'bomb':
            case 'block':
            case 'ravidelfin':
            case 'iceelfin':
            case 'shadowelfin':
            {
                if (isSummon && filters.indexOf(type) == -1)break;
                if (!isSummon && filters.indexOf(type) != -1)break;
                let skillId:number = ConfigManager.getInstance().getSkillIdByType(type);
                if (skillId <= 0)return;
                sceneObjectActor.lock();
                let targetPoint:egret.Point = new egret.Point(x, y);
                if (targetPoint.equals(sceneObject.logicPosition))//在英雄当前位置建造
                {
                    sceneObject.playSkill(skillId, targetPoint);
                    //建造完成，从当前位置往所在方向移动2个单位
                    sceneObject.once(SceneMoveObject.HERO_ANIMATION_FINISH,()=>{
                        if (sceneObject.turn === Turn.LEFT)
                        {
                            sceneObject.moveBy(-4, 0);
                        }
                        else if (sceneObject.turn === Turn.RIGHT)
                        {
                            sceneObject.moveBy(4, 0);
                        }
                        else if (sceneObject.turn === Turn.UP)
                        {
                            sceneObject.moveBy(0, -4);
                        }
                        else if (sceneObject.turn === Turn.DOWN)
                        {
                            sceneObject.moveBy(0, 4);
                        }
                        else
                        {
                            sceneObject.moveBy(4, 0);
                        }
                        //移动结束，状态重置
                        sceneObject.once(SceneMoveObject.MOVE_FINISHED, ()=>{
                            sceneObjectActor.unlock();
                        }, this)

                    }, this);
                }
                else
                {
                    sceneObject.moveCloseTo(targetPoint, 6);
                    sceneObject.once(SceneMoveObject.MOVE_FINISHED, ()=>{
                        sceneObjectActor.lock();
                        sceneObject.playSkill(skillId, targetPoint);
                        sceneObject.once(SceneMoveObject.HERO_ANIMATION_FINISH,()=>{
                            sceneObjectActor.unlock();
                        }, this);
                    }, this);
                    break;
                }
            }
        }
    }
}