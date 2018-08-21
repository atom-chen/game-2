import DataAccessProxy from "./DataAccessProxy";
/**
 * Created by yaozhiguo on 2016/12/5.
 */
export default class DataAccessManager
{
    private static _das:any = {};

    public static addAccess(da:DataAccessProxy):void
    {
        DataAccessManager._das[da.name] = da;
    }

    public static getAccess(daName:string):DataAccessProxy
    {
        return DataAccessManager._das[daName];
    }

    public static removeAccess(daName:string):void
    {
        delete DataAccessManager._das[daName];
    }
}