/**
 * Created by sam on 2016/11/14.
 * 队列加载器，提供队列加载功能
 */

export default class EasyLoader extends egret.EventDispatcher {
    private _loadItems: any[];
    private _name: string;

    public constructor(name: string) {
        super();
        this._name = name;
        this._loadItems = [];
    }

    //增加加载队列
    public addItem(url: string, type: string): void
    {
        var item: Object = new Object();
        item['url'] = url;
        item['type'] = type;
        this._loadItems.push(item);
    }

    //开始加载
    public load():void
    {
        var configData:Object = {
            "groups":[],
            "resources":[]
        };
        let keys:string = "";
        for(var i=0;i<this._loadItems.length;i++)
        {
            let tmpNames:string = this._loadItems[i]['url'].split("/");
            let tmpName:string = tmpNames[tmpNames.length-1];
            tmpNames = null;
            keys = keys + "," + tmpName;
            configData['resources'].push({
                "url": this._loadItems[i]['url'],
                "type": this._loadItems[i]['type'],
                "name": tmpName
            });
        }
        configData['groups'].push({
            "keys":keys,
            "name":this._name
        });
        RES.parseConfig(configData);
        RES.loadGroup(this._name);
    }
}
