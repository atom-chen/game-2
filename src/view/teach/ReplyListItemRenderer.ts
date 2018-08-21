import ReplyMessage from "../../model/vo/teach/ReplyMessage";
import ConfigManager from "../../manager/ConfigManager";
import WindowManager from "../../base/popup/WindowManager";
import EquipWindow from "../explore/equipment/EquipWindow";
import SceneManager from "../../manager/SceneManager";
import ServerManager from "../../model/net/NetManager";
import Alert from "../common/Alert";
import LayerManager from "../../manager/LayerManager";
import UIPopupLoading from "../loading/UIPopupLoading";
import Protocols from "../../enums/Protocols";
import NetManager from "../../model/net/NetManager";
import UserInfo from "../../model/vo/UserInfo";
import DataAccessEntry from "../../model/DataAccessEntry";
import DataAccessManager from "../../base/da/DataAccessManager";
/**
 * Created by yaozhiguo on 2017/3/8.
 */
export default class ReplyListItemRenderer extends eui.ItemRenderer
{
    private labMsg:eui.Label;
    private btnView:eui.Button;
    private btnRemove:eui.Button;
    private levelData:any;

    public constructor()
    {
        super();
        this.skinName = 'ReplyListItemRendererSkin';
        this.labMsg.touchEnabled = true;
        this.btnView.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
        this.btnRemove.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRemove, this);
    }

    protected dataChanged():void
    {
        super.dataChanged();
        let msg:ReplyMessage = this.data;
        let levelData:Object = ConfigManager.getInstance().getConfig('pve_story_level', msg.storyId);
        let mapData:Object = ConfigManager.getInstance().getConfig('pve_story_map', parseInt(levelData['map']));
        this.labMsg.text = '查看地图' + mapData['name'] + '关卡' + levelData['name'] + '的教师回复';
    }

    private onRemove(event:egret.TouchEvent):void
    {
        let alert:Alert = Alert.show('', '确认删除老师的回复么？');
        alert.once('confirm', ()=>{
            let msg:ReplyMessage = this.data;
            let userInfo:UserInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
            NetManager.getInstance().callServerSocket(Protocols.ROUTE_REMOVE_REPLY, {id:msg.uuid, uid:userInfo.uuid});
            document.getElementById('code-area').style.display = 'none';
        }, this);
        alert.once('cancel', ()=>{
            document.getElementById('code-area').style.display = 'none';
        }, this);
    }

    private onTouch(event:egret.TouchEvent):void
    {

        let alert:Alert = Alert.show('', '确认是否前往此关卡，并覆盖您的当前代码？');
        alert.once('confirm', ()=>{

            WindowManager.closeAllWindow();
            SceneManager.getInstance().popScene();

            let responseMsg:ReplyMessage = this.data;
            let level:Object = ConfigManager.getInstance().getConfig('pve_story_level', responseMsg.storyId);

            this.levelData = responseMsg;

            LayerManager.stage.addEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterPopup, this);
            UIPopupLoading.startPopupLoading(["equip"]);
        }, this);
        alert.once('cancel', ()=>{
            document.getElementById('code-area').style.display = 'none';
        }, this);
    }

    private onEnterPopup(e:egret.TouchEvent):void
    {
        LayerManager.stage.removeEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterPopup, this);
        let level:Object = this.levelData['tempLevelData'];
        level['level_code'] = this.levelData.code;
        WindowManager.showWindow( EquipWindow, 'EquipWindow', '装备界面', level);
        ServerManager.getInstance().callServerSocket(Protocols.ROUTE_READREPLY, {'id':this.levelData.uuid});
    }
}