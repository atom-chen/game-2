import GroupInfo from "./GroupInfo";
import ConfigManager from "../../../manager/ConfigManager";
/**
 * Created by yaozh on 2017/6/13.
 */
export default class MapInfo
{
    private _mapConfig:Object;

    public groups:Array<GroupInfo>;

    public id:number;
    public name:string;
    public englishName:string;
    public groupIds:Array<string>;
    public nextMap:number;
    public image:string;

    public constructor(mapConfig?:Object)
    {
        this._mapConfig = mapConfig;
        if (mapConfig)
        {
            this.parse();
        }
    }

    public setMapConfig(config:Object):void
    {
        this._mapConfig = config;
        this.parse();
    }

    private parse():void
    {
        this.id = parseInt(this._mapConfig['id']);
        this.name = this._mapConfig['id'];
        this.englishName = this._mapConfig['n_en'];
        this.groupIds = this._mapConfig['group'].split('|');
        this.nextMap = parseInt(this._mapConfig['next_map_id']);
        this.image = this._mapConfig['bg_image'];

        this.groups = [];
        let group_config:Object = ConfigManager.getInstance().getConfigs('pve_story_group');
        for (let groupId of this.groupIds)
        {
            let group:GroupInfo = new GroupInfo(group_config[groupId]);
            this.groups.push(group);
        }
    }

    public getGroupInfo(groupId:number):GroupInfo
    {
        for (let group of this.groups)
        {
            if (group.id == groupId)return group;
        }
        return null;
    }
}