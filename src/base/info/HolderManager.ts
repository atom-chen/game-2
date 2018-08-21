import InfoHolder from "./InfoHolder";
/**
 * Created by yaozhiguo on 2016/12/2.
 */
export default class HolderManager
{
    private static _holders:any = {};

    public static addHolder(holder:InfoHolder):void
    {
        HolderManager._holders[holder.name] = holder;
    }

    public static getHolder(holderName:string):InfoHolder
    {
        return HolderManager[holderName];
    }

    public static removeHolder(holderName:string):void
    {
        delete HolderManager[holderName];
    }
}