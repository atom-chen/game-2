import ServerAccessProxy from "./ServerAccessProxy";
import ServerManager from "../net/NetManager";
import UserInfo from "../vo/UserInfo";
import EquipInfo from "../vo/EquipInfo";
import HeroInfo from "../vo/HeroInfo";
import Protocols from "../../enums/Protocols";
/**
 * Created by yaozhiguo on 2016/12/5.
 */
export default class UserInfoProxy extends ServerAccessProxy
{
    public static STORY_UPDATE_DATA:string = 'story_update_data';
    public static STORY_UPDATE_STAR:string = 'story_update_star';
    public static EQUIP_UPDATE_STATE:string= 'equip_update_state';
    public static HERO_BOUGHT:string = 'heroBought';
    public static HERO_CHANGED:string = 'heroChanged';

    protected parseReceivedData(rawData:any):void
    {
        super.parseReceivedData(rawData);
        /**
         * 获取用户关卡信息
         */
        if(Protocols.ROUTE_GETSTORYINFO == rawData.route)
        {
            // console.log( event.data );
            ServerManager.getInstance().dispatchEvent(new egret.Event(UserInfoProxy.STORY_UPDATE_STAR, false, false, rawData['data']['story']));
        }

        if(rawData.route==Protocols.ROUTE_PLAYSTORY)
        {
            console.log(rawData);
            let result:any = rawData.data;
            let code:number = result.code;

            let userInfo:UserInfo = this.data;
            let updateInfo:any = result.updateInfo;
            if (!updateInfo)return;
            userInfo.storyID = updateInfo['storyID'] || userInfo.storyID;
            let deltaDiamond:number = updateInfo['adddiamond'] || 0;
            let deltaExp:number = updateInfo['addexp'] || 0;
            let deltaVigor:number = updateInfo['addphysical'] || 0;
            userInfo.diamond += deltaDiamond;
            userInfo.exp += deltaExp;
            userInfo.vigor += deltaVigor;
            userInfo.level = UserInfo.levelFromExp(userInfo.exp);

            TDGA.Account.setLevel(userInfo.level);

            //parse level item rewards
            let equips:Object[] = updateInfo['items'];//其实是装备和英雄
            let deltaEquips:EquipInfo[] = [];
            let deltaHeros:HeroInfo[] = [];
            for (let i in equips)
            {
                let item:Object = equips[i];
                let mid:number = parseInt(item['mid']); //配置文件模板id
                if (mid >= 10000 && mid < 20000)//equip
                {
                    let equipInfo:EquipInfo = new EquipInfo();
                    equipInfo.uuid = parseFloat(item['id']); //对象唯一识别id
                    equipInfo.modelID = mid;
                    equipInfo.userId = parseFloat(item['uid']); //所属User的id
                    equipInfo.updateTime = parseFloat(item['createTime'] || 0); //创建时间
                    userInfo.equips.push(equipInfo);
                    deltaEquips.push(equipInfo);
                }
                else if (mid >= 30000 && mid < 40000)//hero
                {
                    let heroInfo:HeroInfo = new HeroInfo();
                    let obj:Object = rawData.data;
                    heroInfo.uuid = parseInt(item['id']);
                    heroInfo.mid = mid;
                    userInfo.heros.push(heroInfo);
                    deltaHeros.push(heroInfo);
                }
            }

            ServerManager.getInstance().dispatchEvent(new egret.Event(UserInfoProxy.STORY_UPDATE_DATA,
                false, false, {
                    userInfo:userInfo,
                    deltaExp:deltaExp,
                    deltaEquips:deltaEquips,
                    deltaVigor:deltaVigor,
                    deltaDiamond:deltaDiamond,
                    deltaHeros:deltaHeros
                }));
        }
        else if(Protocols.ROUTE_USEITEM == rawData.route)
        {
            let obj:Object = rawData.data;
            let userInfo:UserInfo = this.data;
            if (obj['ret']) //装备
            {
                userInfo.ownedHero['item' + obj['seat']] = obj['id'];
            }
            else //卸载
            {
                userInfo.ownedHero['item' + obj['seat']] = 0;
            }
            ServerManager.getInstance().dispatchEvent(new egret.Event(UserInfoProxy.EQUIP_UPDATE_STATE, false, false, rawData));
        }
        else if (Protocols.ROUTE_SELECT_HERO == rawData.route)
        {
            console.log(rawData);
            let userInfo:UserInfo = this.data;
            userInfo.heroId = rawData.data['hid'];
            ServerManager.getInstance().dispatchEvent(new egret.Event(UserInfoProxy.HERO_CHANGED, false, false, userInfo.ownedHero));
        }
        else if (Protocols.ROUTE_BUY_HERO == rawData.route)
        {
            let userInfo:UserInfo = this.data;
            let heroInfo:HeroInfo = new HeroInfo();
            //"id":hero id
            //"updateInfo":{diamond：100}扣除钻石100
            let obj:Object = rawData.data;
            heroInfo.uuid = parseInt(obj['id']);
            heroInfo.mid = parseInt(obj['mid']) || heroInfo.mid;
            userInfo.heros.push(heroInfo);
            userInfo.diamond -= parseInt(obj['diamond']);
            ServerManager.getInstance().dispatchEvent(new egret.Event(UserInfoProxy.HERO_BOUGHT, false, false, heroInfo));
        }
    }
}