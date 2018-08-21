import BaseInfo from "../../base/info/BaseInfo";
import ConfigManager from "../../manager/ConfigManager";
/**
 * Created by yaozhiguo on 2016/12/2.
 */
export default class HeroInfo extends BaseInfo
{
    public constructor() {
        super();
    }

    public hp:number = 1;                   //血量
    public icon:string = "";

    public exp:number = 0;
    public item1:number = 0;
    public item2:number = 0;
    public item3:number = 0;
    public item4:number = 0;
    public item5:number = 0;
    public item6:number = 0;
    public item7:number = 0;
    public item8:number = 0;

    private _mid:number = 0;
    public get mid():number
    {
        return this._mid;
    }

    public set mid(val:number)
    {
        this._mid = val;
        this.icon = this.data['icon'];
    }

    /**
     * 所属的角色id
     */
    public userId:number;

    public get data():any
    {
        return ConfigManager.getInstance().getConfig("hero", this._mid);
    }

    /**
     * 获取有效的装备位置id
     * @returns {number[]}
     */
    public get items():number[]
    {
        let result:number[] = [];
        for (let i = 1; i<= 8; i++)
        {
            if (this['item' + i] != 0 && this['item' + i] != void 0)
            {
                result.push(this['item' + i]);
            }
        }
        return result;
    }
}