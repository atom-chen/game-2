/**
 * Created by yaozhiguo on 2016/11/7.
 */

import Person from './Person'
import ConfigManager from "../../../manager/ConfigManager";
import SceneMoveObject from "./SceneMoveObject";
import SceneObject from "./SceneObject";
import SceneItem from "./SceneItem";
import {ItemType} from "./SceneItem";
import HeroInfo from "../../../model/vo/HeroInfo";
import UserInfo from "../../../model/vo/UserInfo";
import CommonConfig from "../../../enums/CommonConfig";

export default class Hero extends Person
{
    private _picks:string[];
    private _stories:number[];
    private _drawable:string;
    private _oldPosisition:egret.Point;
    public constructor()
    {
        super();
    }

    /**
     * 根据装备唯一ID,查找当前英雄身上是否装备了该装备,以此来判断玩家是否已经装备了该装备
     * @param {number} equipUniqueId 装备唯一ID
     * @param {HeroInfo} currHeroInfo 当前玩家所用英雄
     * @return {boolean} 标识是否装备了该装备
     */
    private isEquipedByPlayer(equipUniqueId:number, currHeroInfo:HeroInfo)
    {
        if(0 == equipUniqueId) return false;

        let itemLen = CommonConfig.EQUIP_TYPES.length;
        for(let i = 0; i < itemLen; ++ i)
        {
            let key = 'item' + (i+1);
            let heroEquipId = currHeroInfo[key];
            if(heroEquipId && equipUniqueId == heroEquipId) return true;
        }
        return false;
    }

    public setData(data:any): void
    {
        this._picks = [];
        this._stories = [];
        this._drawable = "";
        this._oldPosisition = new egret.Point(0,0);
        var cfg: any = ConfigManager.getInstance().getConfig("hero",data['ownedHero'].mid);
        super.setData(cfg);
        this.name = "hero";
        this.onControl = true;
        let userInfo:UserInfo = data;// DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
        let userEquipInfo = userInfo['equips'];
        for(let i = 0; i < userEquipInfo.length; ++ i)
        {
            if(Number(userEquipInfo[i]['userId'])-userInfo.ownedHero.userId==0 && this.isEquipedByPlayer(Number(userEquipInfo[i]['uuid']),userInfo.ownedHero))
            {
                let itemCFG: any = ConfigManager.getInstance().getConfig("equip",userEquipInfo[i]['modelID']);
                if(Number(itemCFG['hp'])>0) this.batterData.hp = this.batterData.hp + Number(itemCFG['hp']);
                if(Number(itemCFG['speed'])>0) this.speed = this.speed + Number(itemCFG['speed']);
                if(Number(itemCFG['atkdamage'])>0) this.batterData.attack_base = this.batterData.attack_base + Number(itemCFG['atkdamage']);
                if(Number(itemCFG['viewrange'])>0) this.batterData.viewrange = this.batterData.viewrange + Number(itemCFG['viewrange']);
                if(Number(itemCFG['skill'])>0)
                {
                    let skillCFG: any = ConfigManager.getInstance().getConfig("skill",Number(itemCFG['skill']));
                    if(Number(skillCFG['isattack'])==1) this.batterData.attackID = Number(itemCFG['skill']);
                }
            }
        }
        if(this.batterData.attackID>0)
        {
            var skillCFG: any = ConfigManager.getInstance().getConfig("skill", this.batterData.attackID);
            this._attackRange = Math.max(1, Number(skillCFG['atkrange']));
        }
        this.batterData.maxhp = this.batterData.hp;
        this._hptext.text = this.batterData.hp+"/"+this.batterData.maxhp;
    }

    public restart():void
    {
        super.restart();
        this._picks = [];
        this._stories = [];
        this.onControl = true;
    }

    public update(timeObject:any):void
    {
        super.update(timeObject);
        if(Math.floor(this._timer)-this._floorTimer>0 && this._drawable.length>0 && this._oldPosisition!=this.position)
        {
            this.gameWorld.showFlower(this._drawable,this.position);
            this._oldPosisition = this.position;
        }
    }

    /**
     * 打开画图功能的开关，true表示行走中画图，false关闭该功能
     */
    public get drawContent():string
    {
        return this._drawable;
    }

    public set drawContent(val:string)
    {
       if(RES.getRes(val)==null) this.say("找不到这个颜色");
        this._drawable = val;
    }

    /**
     * 传送
     * @param pt 传送位置
     */
    public transfer(pt:egret.Point):void
    {
        var items:SceneObject[] = this.gameWorld.findAllByRange(this.logicPosition,0);
        for(var i=0;i<items.length;i++)
        {
            if(items[i] instanceof SceneItem)
            {
                var item:SceneItem = <SceneItem>items[i];
                if(item.getData().type == ItemType.PATHPOINT && item.getData().teleport_target.length>0)
                {
                    var targets:any[] = item.getData().teleport_target.split("|");
                    for(var j=0;j<targets.length;j++)
                    {
                        var point = this.gameWorld.getSceneObjectByName(targets[j]);
                        if(point.x==pt.x && point.y == pt.y) this.logicPosition = pt;
                    }
                }
            }
        }
    }

    /**
     * 打开宝箱
     */
    public openSceneItem(item:SceneItem)
    {
        if(item.getData().type == ItemType.BOX)
        {
            item.pickedByPerson(this);
        }
    }

    public answered(id:number):void
    {
        this._stories.push(id);
    }

    public pick(nam:string):void
    {
        this._picks.push(nam);
    }

    /**
     * 获取当前主角回答完的问题回答完的问题，没有为[]
     * @returns {}
     */
    public getStoriesAnswered():number[]
    {
        return this._stories;
    }

    /**
     * 获取当前主角拾取的item名，没有为[]
     * @returns {}
     */
    public getPickedItems():string[]
    {
        return this._picks;
    }

    public hurt(value):void
    {
        super.hurt(value);
        this.dispatchEvent(new egret.Event(SceneMoveObject.HERO_HP,true,false,this.batterData));
    }
}
