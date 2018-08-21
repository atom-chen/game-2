import BaseInfo from "../../base/info/BaseInfo";
import Globals from "../../enums/Globals";
import Language from "../../enums/Language";
import HeroInfo from "./HeroInfo";
import EquipInfo from "./EquipInfo";
import ConfigManager from "../../manager/ConfigManager";
/**
 * Created by yaozhiguo on 2016/12/2.
 */
export default class UserInfo extends BaseInfo
{
    public static ID_TEACHER:string = 'teacher';
    public static ID_STUDENT:string = 'student';
    public static ID_OTHER:string = 'other';

    public modelID:number = 0;
    public exp:number = 0; //经验
    public diamond:number = 0; //宝石
    public nickName:string; //昵称
    public headImgUrl:string; //头像
    public headIcon:string = 'career_head_30000_c';
    public vigor:number = Globals.MAX_INIT_VIGOR; //体力
    public coin:number = 0;
    public level:number = 1;
    public serverTime:number = 0;
    public storyID:number = 0;
    public heroId:number = 0;
    
    public heros:HeroInfo[] = [];
    public equips:EquipInfo[] = [];

    public language:string = Language.PYTHON;

    public vipLevel:number = 0;
    public idType:string = UserInfo.ID_OTHER;//身份类型
    public teacherId:string = '';//当前班级的老师id
    public className:string = 'js-class-mid';
    public isAnonymous:boolean;

    private _currentHero:HeroInfo;

    public get isTeacher():boolean
    {
        return this.idType == UserInfo.ID_TEACHER;
    }

    public get isStudent():boolean
    {
        return this.idType == UserInfo.ID_STUDENT;
    }

    /**
     * 获取当前正在使用的英雄
     * @returns {HeroInfo}
     */
    public get ownedHero():HeroInfo
    {
        if (!this._currentHero || this.heroId != this._currentHero.uuid)
        {
            for (let i in this.heros)
            {
                if (this.heros[i].uuid === this.heroId)
                    this._currentHero = this.heros[i];
            }
        }
        return this._currentHero;
    }

    /**
     * 根据uid获取装备信息
     * @param id
     * @returns {any}
     */
    public getEquipById(id:number):EquipInfo
    {
        for (let i in this.equips)
        {
            if (this.equips[i].uuid === id)
                return this.equips[i];
        }
        return null;
    }

    /**
     * 根据槽位获取当前英雄装载的装备。
     * @param pos
     * @returns {any}
     */
    public getHeroSlotEquip(slot:number):EquipInfo
    {
        if (slot < 1 || slot > 8)return null;
        let ownedHero:HeroInfo = this.ownedHero;
        let item = ownedHero['item' + slot];
        if (item === 0 || item === void 0)return null;
        return this.getEquipById(item);
    }

    /**
     * 获取当前英雄的所有指令名称（取决于装备）
     */
    public getHeroActionNames():string[]
    {
        let effectiveEquipIds:number[] = this.ownedHero.items;
        let actions:string[] = [];
        for (let id of effectiveEquipIds)
        {
            let equip:EquipInfo = this.getEquipById(id);
            if (!equip)continue;
            if (equip.data.skill.length < 4)continue;
            let skillIds:string[] = equip.data.skill.split('|');
            for (let skillId of skillIds)
            {
                let skillData = ConfigManager.getInstance().getConfig('skill', parseInt(skillId));
                if (!skillData)continue;
                let action = ConfigManager.getInstance().getConfig('action', skillData['action']);
                if (!action)continue;
                actions.push(action['name']);
            }
        }
        return actions;
    }

    //公式常量
    public static a:number = 6;
    public static b:number = 100;
    public static c = UserInfo.b;


    /**
     * exp所对应的等级
     * @param exp
     */
    public static levelFromExp(exp:number):number
    {
        if (exp > 0)
        {
            return Math.floor(UserInfo.a * Math.log((1 / UserInfo.b) * (exp + UserInfo.c))) + 1;
        }
        else
        {
            return 1;
        }
    }

    /**
     * 某等级对应的经验
     * @param level
     */
    public static expForLevel(level:number):number
    {
        if (level > 1)
        {
            return Math.ceil(Math.exp((level - 1) / UserInfo.a) * UserInfo.b - UserInfo.c);
        }
        else
        {
            return 0;
        }
    }
}