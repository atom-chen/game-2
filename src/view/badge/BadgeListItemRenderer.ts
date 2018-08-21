import EquipInfo from "../../model/vo/EquipInfo";
import ColorFilterFactory from "../../base/factory/ColorFilterFactory";
/**
 * Created by yaozhiguo on 2017/1/23.
 */
export default class BadgeListItemRenderer extends eui.ItemRenderer
{
    private imgContent:eui.Image;
    private labTime:eui.Label;

    public constructor()
    {
        super();
        this.skinName = 'BadgeListItemRenderSkin';
    }

    protected dataChanged(): void
    {
        super.dataChanged();
        // this.imgContent.source = 'resource/skin_assets/badge_win/badge_win_assets/badge.png';

        if(this.data instanceof EquipInfo)
        {
            let equipInfo:EquipInfo = <EquipInfo>(this.data);
            this.labTime.text = this.formatCreateTime(equipInfo.updateTime);
            this.imgContent.source = 'resource/icon/badge/' + equipInfo.data['icon'] + '.png';
            this.filters = null;
        }
        else
        {
            this.labTime.text = '未获得';
            this.imgContent.source = 'resource/icon/badge/' + this.data['icon'] + '.png';
            this.filters = [ColorFilterFactory.GRAY_FILTER];
        }
    }

    public formatCreateTime(time:number):string
    {
        let date:Date = new Date(time * 1000);
        return date.getFullYear() + '-' + (date.getMonth() + 1)
            + '-' + date.getDate() + '    '
            + this.format60(date.getHours())
            + ':' + this.format60(date.getMinutes())
            + ':' + this.format60(date.getSeconds());
    }

    private format60(t:number):string
    {
        return t < 10 ? ('0' + t) : t.toString();
    }
}