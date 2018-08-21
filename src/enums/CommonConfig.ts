/**
 * 游戏共用的配置信息,参数信息
 * @auther rappel
 * @time 2016-12-22 18:17
 */

export default class CommonConfig 
{
    //英雄身上装备类型
    public static EQUIP_ALL:number              = 0; //所有装备
    public static EQUIP_PRIMARY_ATTACK: number  = 1; //主手
    public static EQUIP_ASSISTANT_ATTACK:number = 2; //副手
    public static EQUIP_ARMOR:  number          = 3; //护甲
    public static EQUIP_MICROCHIP: number       = 4; //芯片
    public static EQUIP_COMPASS: number         = 5; //罗盘
    public static EQUIP_BARITE_TYPE1:number     = 6; //晶石次元
    public static EQUIP_BARITE_TYPE2:number     = 7; //晶石预言
    public static EQUIP_BARITE_TYPE3:number     = 8; //晶石塑能

    public static EQUIP_TYPES = ['EQUIP_PRIMARY_ATTACK', 'EQUIP_ASSISTANT_ATTACK', 'EQUIP_ARMOR', 'EQUIP_MICROCHIP', 'EQUIP_COMPASS', 'EQUIP_BARITE_TYPE1', 'EQUIP_BARITE_TYPE2', 'EQUIP_BARITE_TYPE3'];
    public static EQUIP_TYPES_CN = ['主手', '副手', '护甲', '芯片', '罗盘', '晶石次元', '晶石预言', '晶石塑能'];
    //职业
    public static CAREER_WARRIOR: number = 1;
    public static CAREER_MAGICIAN:number = 2;
    public static CAREER_SHOOTER: number = 3;
    public static CAREER_ASSASSIN:number = 4;

}