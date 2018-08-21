import ServerAccessProxy from "./ServerAccessProxy";
import UserInfo from "../vo/UserInfo";
import ServerManager from "../net/NetManager";
import DataAccessEntry from "../DataAccessEntry";
import DataAccessManager from "../../base/da/DataAccessManager";
import HeroInfo from "../vo/HeroInfo";
import EquipInfo from "../vo/EquipInfo";
import Platform from "../../platforms/Platform";
import MaliPlatform from "../../platforms/MaliPlatform";
import Protocols from "../../enums/Protocols";
/**
 * Created by yaozhiguo on 2016/12/5.
 */
export default class LoginProxy extends ServerAccessProxy
{
    public static LOGIN_DATA:string = 'login_data';

    protected parseReceivedData(rawData:any):void
    {
        super.parseReceivedData(rawData);
        //parse raw data or cache into current class, then dispatch event to notify some listeners.
        if(rawData.route==Protocols.ROUTE_LOGIN)
        {
            var resInfo:any = rawData.data.user;                                       //保存自身数据，频繁调用
            let userInfo:UserInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
            userInfo.uuid = parseInt(resInfo["id"]);
            userInfo.exp = parseInt(resInfo['exp']);
            userInfo.diamond = parseInt(resInfo['diamond']);
            userInfo.level = parseInt(resInfo['level']);
            userInfo.nickName = resInfo['name'];
            userInfo.vigor = parseInt(resInfo['physical']);
            userInfo.serverTime = parseFloat(resInfo['createTime']);
            userInfo.coin = parseInt(resInfo['coin']);
            userInfo.storyID = parseInt(resInfo['storyID']);
            userInfo.modelID = parseInt(resInfo['mid']);
            userInfo.heroId = parseInt(resInfo['hid']);

            let equips:Object[] = rawData.data.equips;
            let heros:Object[] = rawData.data.heros;

            userInfo.equips = [];
            for (let equip of equips)
            {
                let equipInfo:EquipInfo = new EquipInfo();
                equipInfo.uuid = parseFloat(equip['id']); //对象唯一识别id
                equipInfo.modelID = parseInt(equip['mid']); //配置文件模板id
                equipInfo.userId = parseFloat(equip['uid']); //所属User的id
                equipInfo.updateTime = parseFloat(equip['createTime']||0); //创建时间
                userInfo.equips.push(equipInfo);
            }

            userInfo.heros = [];
            for (let hero of heros)
            {
                let heroInfo:HeroInfo = new HeroInfo();
                heroInfo.exp = parseFloat(hero['exp']);
                heroInfo.uuid = parseFloat(hero['id']);
                heroInfo.item1 = parseInt(hero['item1']);
                heroInfo.item2 = parseInt(hero['item2']);
                heroInfo.item3 = parseInt(hero['item3']);

                heroInfo.item4 = parseInt(hero['item4']);
                heroInfo.item5 = parseInt(hero['item5']);
                heroInfo.item6 = parseInt(hero['item6']);
                heroInfo.item7 = parseInt(hero['item7']);
                heroInfo.item8 = parseInt(hero['item8']);
                heroInfo.mid = parseInt(hero['mid']);
                heroInfo.userId = parseFloat(hero['uid']);
                userInfo.heros.push(heroInfo);
            }

            //about platforms
            if (Platform.currentPlatform instanceof MaliPlatform)
            {
                let platform:MaliPlatform = <MaliPlatform>(Platform.currentPlatform);
                userInfo.isAnonymous = platform.isAnonymous;
                userInfo.idType = platform.idType;
                userInfo.nickName = Platform.currentPlatform.platformName || userInfo.nickName;
                userInfo.teacherId = platform.classTeacherId
                userInfo.className = platform.className;
                if (platform.classTeacherId)//通过老师的平台id获取老师的游戏内id，用于请求帮助时的协议
                {
                    ServerManager.getInstance().callServerSocket(Protocols.ROUTE_GETUSERID, {pid:platform.classTeacherId});
                }
                //当前班级的锁定状态
                let lockState:Object = rawData.data.lockState;
                platform.classLockInfo.classId = lockState['class_id'];
                platform.classLockInfo.lockLvl = parseInt(lockState['lock_level']);
                platform.classLockInfo.lockOperator = lockState['teacher_id'];
                platform.classLockInfo.state = lockState['state'];
            }

            // ServerManager.getInstance().userInfo = userInfo;                                //保存数据，频繁调用
            ServerManager.getInstance().dispatchEvent(new egret.Event(LoginProxy.LOGIN_DATA, false, false, userInfo));

            let accountInfo = {
                'accountId':userInfo.uuid,
                'level':userInfo.level || 1,
                'gameServer':'mali',
                'accountType':userInfo.isAnonymous ? 0 : 1,
                'age':0,
                'gender':1
            };
            //登录
            TDGA.Account(accountInfo);
        }
        else if(rawData.route == Protocols.ROUTE_GETUSERID)
        {
            let resInfo:any = rawData.data;
            let userInfo:UserInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
            userInfo.teacherId = resInfo['userId'];
        }
    }
}