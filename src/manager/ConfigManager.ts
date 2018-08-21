/**
 * Created by sam on 2016/11/10.
 * 配置文件数据管理。
 */

export default class ConfigManager
{
    
    public static CONFIGLOADED:string = "config_loaded";                                        //单个文件加载完成

    private static _instance: ConfigManager;
    static getInstance(): ConfigManager
    {
        return this._instance || (this._instance = new ConfigManager());
    }

    private _dictionary:any;

    private maps:Object = {};

    public constructor()
    {
        this._dictionary = new Object();
    }
    
    //保存配置文件
    public parseConfig(fileName:string): void
    {
        var fileData:string = RES.getRes(fileName);
        console.assert(fileData != void 0, '[ConfigManager.parseConfig] file ' + fileName + '找不到！！！');
        var lines:string[] = fileData.split("\n");
        var keys: string[];
        this._dictionary[fileName] = new Object();
        if(fileName == "skill")
            this._dictionary[fileName+"name"] = new Object();
        for(var i = 0;i < lines.length-1;i++)
        {
            if(0 == i)
            {
                keys = lines[i].split("^");
            }
            else if(lines[i].length>0)
            {
                var values: string[] = lines[i].split("^");
                var dat: Object = new Object();
                for(var n = 1;n < keys.length-1;n++)
                {
                    dat[keys[n]] = values[n];
                }
                if (dat[keys[1]] && dat)
                    this._dictionary[fileName][Number(dat[keys[1]])] = dat;
                if(fileName == "skill" && dat && dat['type'] && dat['type'].length>1)                                      //技能需要双索引
                    this._dictionary[fileName+"name"][dat['type']] = Number(dat['id']);
            }
        }
    }
    
    //初始化配置文件，将preloader中的数据存库
    public init(): void
    {
        this.parseConfig("buff");
        this.parseConfig("hero");
        this.parseConfig("item");
        this.parseConfig("npc_enemy");
        this.parseConfig("pve_story_group");
        this.parseConfig("pve_story_level");
        this.parseConfig("pve_story_level_goal");
        this.parseConfig("pve_story_map");
        this.parseConfig("skill");
        this.parseConfig("action");
        this.parseConfig("equip");
        this.parseConfig("ai");
        this.parseConfig("story");
        this.parseConfig("event");
        this.parseConfig("guide");

        /*let mapConfig:Object = this.getConfigs('pve_story_map');
        for (let key in mapConfig)
        {
            this.maps[key] = new MapInfo(mapConfig[key]);
        }*/

        RES.destroyRes('config');//字符串已经赋值给Object对象，可以释放掉以节省内存
    }
    
    //加载配置文件并存库
    public loadConfig(fileName:string): void
    {
        var url: string = "resource/config/"+fileName+".csv";
        var cfgLoader: egret.URLLoader = new egret.URLLoader();
        cfgLoader.dataFormat = egret.URLLoaderDataFormat.TEXT;
        cfgLoader.addEventListener(egret.Event.COMPLETE,function(event: egret.Event): void {
            ConfigManager.getInstance().parseConfig(fileName);
            event.target.dispatchEvent(new egret.Event(ConfigManager.CONFIGLOADED,false,false,fileName));
        },url);
        cfgLoader.load(new egret.URLRequest(url));
    }

    //读取单项配置的所有文件
    public getConfigs(fileName:string): Object
    {
        return this._dictionary[fileName];
    }
    
    public getConfig(fileName:string,id: number): Object
    {
        return this._dictionary[fileName][id];
    }

    /**
     * 读取配置中的具体值
     * @param pk 配置的primary key
     * @param key 获取配置primary key下对应的具体值
     */
    public getValue(fileName:string,id: number,key: string): any
    {
        return this._dictionary[fileName][id][key];
    }

    public getIDByName(fileName:string,name:string):number
    {
        return this._dictionary[fileName+"name"][name];
    }

    /**
     * 根据技能类型反推对应的技能id
     * @param type 技能类型
     * @returns {number}
     */
    public getSkillIdByType(type:string):number
    {
        let tables = ConfigManager.getInstance().getConfigs("skill");
        for (let key in tables)
        {
            let t:Object = tables[key];
            if (t['type'] === type)
            {
                return parseInt(t['id']);
            }
        }
        return 0;
    }

    /*public getMapInfo(mapId:number):MapInfo
    {
        return this.maps[mapId];
    }*/
}
