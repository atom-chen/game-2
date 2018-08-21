import BaseInfo from "../../base/info/BaseInfo";
import ConfigManager from "../../manager/ConfigManager";
/**
 * Created by yaozhiguo on 2016/12/22.
 */
export default class EquipInfo extends BaseInfo
{
    public modelID:number;
    public userId:number;
    public updateTime:number;
    
    public get data():any
    {
        let equipData:Object = ConfigManager.getInstance().getConfig("equip", this.modelID);
        /*if (this.modelID >= 15000 && this.modelID <= 17002)
        {
            console.log(equipData);
        }*/
        return equipData;
    }
}