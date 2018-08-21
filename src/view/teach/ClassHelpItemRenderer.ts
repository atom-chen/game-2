import ItemRenderer = eui.ItemRenderer;
import QuestionMessage from "../../model/vo/teach/QuestionMessage";
import ConfigManager from "../../manager/ConfigManager";
import BattleStartLoading from "../loading/BattleStartLoading";
import SoundManager from "../../manager/SoundManager";
import ExploreWindow from "../explore/ExploreWindow";
import NetManager from "../../model/net/NetManager";
import DataAccessManager from "../../base/da/DataAccessManager";
import DataAccessEntry from "../../model/DataAccessEntry";
import TeachSystemProxy from "../../model/da/TeachSystemProxy";
import DataAccessProxy from "../../base/da/DataAccessProxy";
import Protocols from "../../enums/Protocols";
import Alert from "../common/Alert";
/**
 * Created by yaozhiguo on 2017/3/6.
 */
export default class ClassHelpItemRenderer extends ItemRenderer
{
    private labMsg:eui.Label;
    private labDate:eui.Label;
    private labTime:eui.Label;
    private btnGoToHelp:eui.Button;
    private btnRemove:eui.Button;

    public constructor()
    {
        super();
        this.skinName = 'ClassHelpItemRendererSkin';
    }

    protected dataChanged():void
    {
        super.dataChanged();
        let requestMsg:QuestionMessage = this.data;
        let levelData:Object = ConfigManager.getInstance().getConfig('pve_story_level', requestMsg.storyId);
        let prefix:string = requestMsg.studentEmail.length > 0 ? requestMsg.studentEmail : requestMsg.fromName;
        this.labMsg.text =  prefix + '在' + levelData['tiledmap'] + '关卡遇到困难，发来求助。';
        this.labDate.text = requestMsg.formatRequestTime;
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.btnGoToHelp.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onGoToBattle, this);

        this.btnRemove.addEventListener(egret.TouchEvent.TOUCH_TAP, ()=>{
            let alert:Alert = Alert.show('', '确认删除学生的求助么？');
            alert.once('confirm', ()=>{
                let requestMsg:QuestionMessage = this.data;
                NetManager.getInstance().callServerSocket(Protocols.ROUTE_REMOVE_QUESTION,
                    {'id':requestMsg.uuid, 'teacherId':requestMsg.teacherId});
            }, this);
        }, this);
    }

    private onGoToBattle(event:egret.TouchEvent):void
    {
        let requestMsg:QuestionMessage = this.data;
        NetManager.getInstance().callServerSocket(Protocols.ROUTE_GETUSERINFO, {'id':requestMsg.from});
        let teachProxy:DataAccessProxy = DataAccessManager.getAccess(DataAccessEntry.TEACH_SYSTEM_PROXY);
        teachProxy.addEventListener(TeachSystemProxy.USER_INFO_COMPLETE, this.onUserInfoComplete, this);
        (<TeachSystemProxy>teachProxy).currentHelpId = requestMsg.uuid;
        SoundManager.getInstance().playEffect('u10_start_mp3');
    }

    private onUserInfoComplete(event:egret.Event):void
    {
        DataAccessManager.getAccess(DataAccessEntry.TEACH_SYSTEM_PROXY).
            removeEventListener(TeachSystemProxy.USER_INFO_COMPLETE, this.onUserInfoComplete, this);
        let requestMsg:QuestionMessage = this.data;

        let level:Object = ConfigManager.getInstance().getConfig('pve_story_level', requestMsg.storyId);

        let levelData:Object = {
            'levelID': level['id'],
            'name': level['name'],
            'topic': level['topic'],
            'required_energy': level['energy'],
            'hero_rotation': level['hero_rotation'],
            // 'required_star': level['star'],
            'tiledmap': level['tiledmap'],
            'tiledimage': level['tiledimage'],
            'star1_reward': level['star1_reward'],
            'star1_reward_num': level['star1_reward_num'],
            'star2_reward': level['star2_reward'],
            'star2_reward_num': level['star2_reward_num'],
            'star3_reward': level['star3_reward'],
            'star3_reward_num': level['star3_reward_num'],
            'star_level': 0,
            'state_locked': ExploreWindow.STATE_STRIP,
            'next_level': level['next_level'],
            'level_bgm': level['bgm'],
            'find_path':level['find_path'],
            'teach_info':requestMsg,
            'player_info':event.data
        };
        BattleStartLoading.startBattleLoading(levelData);
    }
}