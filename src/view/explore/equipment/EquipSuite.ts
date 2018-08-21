/**
 * 装备详细信息类,用于将前端配置信息与后端数据整合,便于UI统一使用
 * 前端数据 equipData
 * 后端数据 equipInfo
 * 前后端数据会被整合成equipSuite,并且equipCards中[cardData], equipSlots中[slotData]都以EquipSuite保存数据
 * 
 * @author rappel
 * @time 2016-12-26 11:06
 */
import EquipInfo from "../../../model/vo/EquipInfo";

export default class EquipSuite
{
    public ID:number;
    public name:string;
    public type:number; //装备类型[1主手,2副手,3护甲,4芯片,5罗盘,6晶石次元,7晶石预言,8晶石塑能]
    public attackDamage:number;
    public des:string;
    public health:number;
    public heroClass:number; //职业类型[1不限制,2战士,3法师,4枪手,5密探,6钢铁战士]
    private icon:string;
    private isThroughWalls: number;
    public rarity:number;
    public skill:string;
    public speed:number;
    private viewrange: string;
    
    public iconSrc:string;
    public isOwned:boolean;
    public isRestricted:boolean;
    public isEquiped:boolean;

    public uuid: number;
    public userId: number;
    /**
     * @param {any} equipData 前端数据
     * @param {any} equipInfo 后端数据
     */
    constructor(equipData:Object = null, equipInfo:EquipInfo = null)
    {
        if(equipData)
        {
            this.ID             = parseInt(equipData['ID']);
            this.name           = equipData['name'];
            this.type           = parseInt(equipData['type']);
            this.attackDamage   = parseInt(equipData['atkdamage']);
            this.rarity         = equipData['rarity'];
            this.skill          = equipData['skill'];
            this.speed          = parseInt(equipData['speed']);
            this.health         = parseInt(equipData['hp']);
            this.heroClass      = equipData['heroclass'];
            this.viewrange      = equipData['viewrange'];
            this.isThroughWalls = equipData['isThroughwalls'];
            this.iconSrc        = equipData['icon'];
            this.des            = equipData['description'];

            this.isOwned        = false;
        }
        else if(equipInfo)
        {
            this.ID             = equipInfo['modelID'];
            this.name           = equipInfo['data']['name'];
            this.type           = parseInt(equipInfo['data']['type']);
            this.attackDamage   = parseInt(equipInfo['data']['atkdamage']);
            this.rarity         = equipInfo['data']['rarity'];
            this.skill          = equipInfo['data']['skill'];
            this.speed          = parseInt(equipInfo['data']['speed']);
            this.health         = parseInt(equipInfo['data']['hp']);
            this.heroClass      = equipInfo['data']['heroclass'];
            this.viewrange      = equipInfo['data']['viewrange'];
            this.isThroughWalls = equipInfo['data']['isThroughwalls'];
            this.iconSrc        = equipInfo['data']['icon'];
            this.des            = equipInfo['data']['description'];

            this.isOwned        = true;
            this.uuid           = equipInfo['uuid'];
            this.userId         = equipInfo['userId'];
        }
    }
}