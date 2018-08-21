import BaseInfo from "./BaseInfo";
/**
 * Created by yaozhiguo on 2016/12/2.
 */
export default class InfoHolder
{
    protected _name:string;
    private _infos:Array<BaseInfo> = [];

    public get name():string
    {
        return this._name;
    }

    public constructor(name:string)
    {
        this._name = name;
    }

    public add(info:BaseInfo):BaseInfo
    {
        let index:number = this._infos.indexOf(info);
        if (index != -1)return info;
        if (!this.isUnique(info))
        {
            this._infos[index] = info;
        }
        else
        {
            this._infos.push(info);
        }
        return info;
    }

    public remove(info:BaseInfo):BaseInfo
    {
        let index:number = this._infos.indexOf(info);
        if (index != -1)
        {
            return this._infos.splice(index, 1)[0];
        }
        return null;
    }

    public getInfo(uid:number):BaseInfo
    {
        for (let i in this._infos)
        {
            let inf:BaseInfo = this._infos[i];
            if (inf.uuid === uid)return inf;
        }
        return null;
    }

    /**
     * 判断是否id重复.若重复，则返回false。
     * @param info
     * @returns {boolean}
     */
    public isUnique(info:BaseInfo):boolean
    {
        for (let i in this._infos)
        {
            let inf:BaseInfo = this._infos[i];
            if (inf.uuid === info.uuid)return false;
        }
        return true;
    }
}