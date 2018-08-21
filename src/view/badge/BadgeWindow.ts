import BaseWindow from "../../base/popup/BaseWindow";
import ConfigManager from "../../manager/ConfigManager";
import UserInfo from "../../model/vo/UserInfo";
import DataAccessManager from "../../base/da/DataAccessManager";
import DataAccessEntry from "../../model/DataAccessEntry";
import Language from "../../enums/Language";
import BadgeListItemRenderer from "./BadgeListItemRenderer";
import EquipInfo from "../../model/vo/EquipInfo";
import MouseScroller from "../common/MouseScroller";
/**
 * Created by yaozhiguo on 2017/1/23.
 * 徽章窗口
 */
export default class BadgeWindow extends BaseWindow
{
    private PYTHON_TYPE:number = 10;
    private JAVASCRIPT_TYPE:number = 11;

    private tabBar:eui.TabBar;
    private list:eui.List;
    private scrollerBadge:eui.Scroller;
    private userInfo:UserInfo;
    private preSelectedIndex:number = 0;

    public constructor()
    {
        super();
        this.skinName = 'BadgeWindowSkin';
        this.userInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        MouseScroller.enableMouseScroller(this.scrollerBadge);
        this.tabBar.dataProvider = new eui.ArrayCollection([{label:'Python'}]);//, {label:'Javascript'}]);
        this.list.itemRenderer = BadgeListItemRenderer;
        this.list.dataProvider = new eui.ArrayCollection(this.parseCurrentKnowledges(Language.PYTHON));
        this.tabBar.addEventListener(egret.Event.CHANGE, this.onTabClick, this);
        this.preSelectedIndex = this.tabBar.selectedIndex;
    }

    private parseCurrentKnowledges(language:string):Object[]
    {
        let equipInfos:EquipInfo[] = this.userInfo.equips;
        let checkType:number = language == Language.PYTHON ? this.PYTHON_TYPE : this.JAVASCRIPT_TYPE;
        let equips:Object = ConfigManager.getInstance().getConfigs('equip');
        let result:Object[] = [];
        for (let key in equips)
        {
            let config:Object = equips[key];
            if (parseInt(config['type']) === checkType)
            {
                let tag:boolean = false;
                for (let i in equipInfos)
                {
                    if (equipInfos[i].data == config)
                    {
                        result.push(equipInfos[i]);
                        tag = true;
                        break;
                    }
                }
                if (!tag)result.push(config);
            }
        }
        return result;
    }

    private onTabClick(event:egret.Event):void
    {
        if (this.tabBar.selectedIndex != this.preSelectedIndex)
        {
            let language:string = this.tabBar.selectedItem.label.toLowerCase();
            this.list.dataProvider = new eui.ArrayCollection(this.parseCurrentKnowledges(language));
        }
        this.preSelectedIndex = this.tabBar.selectedIndex;
    }

    public dispose():void
    {
        super.dispose();
        this.tabBar.removeEventListener(egret.Event.CHANGE, this.onTabClick, this);
    }
}
