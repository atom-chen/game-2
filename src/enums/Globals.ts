import EquipInfo from "../model/vo/EquipInfo";
/**
 * Created by yaozhiguo on 2016/11/30.
 */
export default class Globals{

    public static GAME_WIDTH:number = 1920;
    public static GAME_HEIGHT:number = 1080;

    /**战斗区域占整个游戏区域的宽度比例 */
    public static BATTLE_AREA_WIDTH_RATIO:number = 0.55;
    /**代码编辑区占整个游戏区域的高度比例 */
    public static CODE_AREA_HEIGHT_RATIO:number = 0.62;
    /**初始最大体力值*/
    public static MAX_INIT_VIGOR:number = 150;

    public static TILE_WIDTH:number = 16;
    public static TILE_HEIGHT:number = 16;

    public static PALETTE_WIDTH:number = (1-Globals.BATTLE_AREA_WIDTH_RATIO) * Globals.GAME_WIDTH - 5; //指令区域宽度
    public static PALETTE_HEIGHT:number = (1-Globals.CODE_AREA_HEIGHT_RATIO) * Globals.GAME_HEIGHT - 60; //指令区高度

    public static STATUS_CODE_SUCCESS:number = 200;

    public static HERO_CAREER = {
        1:'warrior',
        2:'mage',
        3:'gunman',
        4:'assassin'
    };

    /** python徽章 */
    public static BADGE_TYPE_PYTHON:number = 10;
    /** javascript徽章 */
    public static BADGE_TYPE_JAVASCRIPT:number = 11;

    //-------------------------------------------------------------------------------------
    /**
     * global variables below
     * @type {number}
     */
    public static domGameWidth:number = 0;
    public static domGameHeight:number = 0;
    public static scaleRatio:number = 0;
    public static badgeAwardInfo:EquipInfo;//某一关战斗结束之后获得的徽章信息，用于切换到主场景之后显示一个动画，对当前关卡有效

    /**
     * 是否开启新手引导功能
     * @type {boolean}
     */
    public static guide:boolean = true;
}