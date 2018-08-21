/**
 * Created by yaozh on 2017/6/13.
 */
export default class LevelInfo
{
    public id:number;
    public name:string;
    public mapId:number;
    public tiledMap:string;
    public tiledImage:string;
    public groupId:number;
    public nextLevel:number;
    public unlockLevel:number;//
    public guideId:number;
    public requiredLvl:number;
    public requiredStar:number;
    public requiredEquipType:number;
    public requiredEquip:number;
    public restrictEquip:number;
    public topic:string;
    public energy:number;
    public hint:string;//提示
    public bgm:string;
    public expDrop:number;
    public star1Reward:Array<any>;
    public star1RewardNum:Array<any>;
    public star2Reward:Array<any>;
    public star2RewardNum:Array<any>;
    public star3Reward:Array<any>;
    public star3RewardNum:Array<any>;

    public goal1:Array<number>;
    public lifespan:number;
    public showXY:number;//是否显示XY坐标，当鼠标移动上去的时候, 0 不显示  1显示
    public findPath:number;//是否自动寻路 0 不寻路  1寻路
    public heroRotation:number;//英雄的朝向，1,2,3,4

    public constructor(config:Object)
    {
        this.id = parseInt(config['id']);
        this.name = config['name'];
        this.mapId = parseInt(config['map']);
        this.tiledMap = config['tiledmap'];
        this.tiledImage = config['tiledimage'];
        this.groupId = parseInt(config['group']);
        this.nextLevel = parseInt(config['next_level']);
        this.unlockLevel = parseInt(config['unlock_level']);
        this.guideId = parseInt(config['guide_id']);
        //this.requiredLvl = parseInt(config['required_lv']);
        this.requiredStar = parseInt(config['required_star']);
        this.requiredEquipType = parseInt(config['required_equiptype']);
        this.requiredEquip = parseInt(config['required_equip']);
        this.restrictEquip = parseInt(config['restrict_equip']);
        this.topic = config['topic'];
        this.hint = config['hint'];
        this.bgm = config['bgm'];
        this.expDrop = config['xp_drop'];
        this.star1Reward = config['star1_reward'].split('|');//award ids
        this.star1RewardNum = config['star1_reward_num'];
        this.star2Reward = config['star2_reward'].split('|');
        this.star2RewardNum = config['star2_reward_num'];
        this.star3Reward = config['star3_reward'].split('|');
        this.star3RewardNum = config['star3_reward_num'];
        this.goal1 = config['goal1'].split('|');
        this.lifespan = parseInt(config['lifespan']);
        this.showXY = parseInt(config['show_xy']);
        this.findPath = parseInt(config['find_path']);
        this.heroRotation = parseInt(config['hero_rotation']);
    }
}