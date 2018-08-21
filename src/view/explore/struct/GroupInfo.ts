import LevelInfo from "./LevelInfo";
import Point = egret.Point;
import ConfigManager from "../../../manager/ConfigManager";
/**
 * Created by yaozh on 2017/6/13.
 */
export default class GroupInfo
{
    public levels:Array<LevelInfo>;

    public id:number;
    public name:string;
    public mapId:number;
    public index:number;//在地图上的序号
    public nextGroup:number;
    public point:Point;//在地图上坐标点
    public levelIDs:Array<string>;
    public topic:string;
    public reward:number;

    public constructor(config:Object)
    {
        this.id = parseInt(config['id']);
        this.name = config['name'];
        this.mapId = parseInt(config['map']);
        this.index = parseInt(config['number']);
        this.nextGroup = parseInt(config['next_group']);
        let p:Array<any> = config['point'].split('|');
        this.point = new Point(parseFloat(p[0]), parseFloat(p[1]));
        this.levelIDs = config['level'].split('|');
        this.topic = config['topic'];
        this.reward = parseInt(config['reward']);

        this.levels = [];
        if (this.levelIDs.length <= 1)return;
        let level_config:Object = ConfigManager.getInstance().getConfigs('pve_story_level');
        for (let levelId of this.levelIDs)
        {
            let levelInfo:LevelInfo = new LevelInfo(level_config[levelId]);
            this.levels.push(levelInfo);
        }
    }

    public getLevelInfo(levelId:number):LevelInfo
    {
        for (let level of this.levels)
        {
            if (level.id == levelId)return level;
        }
        return null;
    }
}