import DataAccessManager from "../base/da/DataAccessManager";
import LoginProxy from "./da/LoginProxy";
import UserInfoProxy from "./da/UserInfoProxy";
import UserInfo from "./vo/UserInfo";
import BattleInfoProxy from "./da/BattleInfoProxy";
import BattleInfo from "./vo/BattleInfo";
import TeachSystemProxy from "./da/TeachSystemProxy";
import TeachSystemInfo from "./vo/teach/TeachSystemInfo";
/**
 * Created by yaozhiguo on 2016/12/5.
 * 统一管理所有的数据访问器
 */
export default class DataAccessEntry
{
    //传入的名字由后端定义，和后端功能模块分组保持一致
    public static LOGIN_PROXY:string = 'connector';
    public static USERINFO_PROXY:string = 'userinfo';
    public static BATTLE_INFO_PROXY:string = "battleInfoProxy";
    public static TEACH_SYSTEM_PROXY:string = "teachSytemProxy";

    public static init():void
    {
        DataAccessManager.addAccess(new LoginProxy(DataAccessEntry.LOGIN_PROXY));
        DataAccessManager.addAccess(new UserInfoProxy(DataAccessEntry.USERINFO_PROXY, new UserInfo()));
        DataAccessManager.addAccess(new BattleInfoProxy(DataAccessEntry.BATTLE_INFO_PROXY, new BattleInfo()));
        DataAccessManager.addAccess(new TeachSystemProxy(DataAccessEntry.TEACH_SYSTEM_PROXY, new TeachSystemInfo()));
    }
}