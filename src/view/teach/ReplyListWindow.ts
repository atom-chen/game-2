import BaseWindow from "../../base/popup/BaseWindow";
import ServerManager from "../../model/net/NetManager";
import DataAccessManager from "../../base/da/DataAccessManager";
import DataAccessEntry from "../../model/DataAccessEntry";
import TeachSystemProxy from "../../model/da/TeachSystemProxy";
import ReplyListItemRenderer from "./ReplyListItemRenderer";
import MouseScroller from "../common/MouseScroller";
import ReplyMessage from "../../model/vo/teach/ReplyMessage";
import Protocols from "../../enums/Protocols";
/**
 * Created by yaozhiguo on 2017/3/3.
 * 学生收到的老师的回复列表窗口
 */
export default class ReplyListWindow extends BaseWindow
{
    private list:eui.List;
    private scrollerReply:eui.Scroller;
    private labTip:eui.Label;

    public constructor()
    {
        super();
        this.skinName = 'ReplyListWindowSkin';
        DataAccessManager.getAccess(DataAccessEntry.TEACH_SYSTEM_PROXY).
            addEventListener(TeachSystemProxy.REPLYS_COMPLETE, this.onReplys, this);
        DataAccessManager.getAccess(DataAccessEntry.TEACH_SYSTEM_PROXY).
            addEventListener(TeachSystemProxy.REPLY_REMOVED, this.onReplyRemoved, this);
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.labTip.visible = false;
    }

    protected updateView():void
    {
        super.updateView();
        MouseScroller.enableMouseScroller(this.scrollerReply);
        this.list.itemRenderer = ReplyListItemRenderer;
        ServerManager.getInstance().callServerSocket(Protocols.ROUTE_GETREPLYS);
    }

    private onReplys(event:egret.Event):void
    {
        let ar:ReplyMessage[] = event.data;
        let effectQ:ReplyMessage[] = [];//提取未读取过的答复
        for (let i in ar)
        {
            if (ar[i].hadRead)continue;
            effectQ.push(ar[i]);
            ar[i]['tempLevelData'] = this.data;
        }
        if (effectQ.length < 1)this.labTip.visible = true;
        this.list.dataProvider = new eui.ArrayCollection(effectQ);
    }

    private onReplyRemoved(event:egret.Event):void
    {
        let ar:ReplyMessage[] = event.data;
        let effectQ:ReplyMessage[] = [];//提取未读取过的答复
        for (let i in ar)
        {
            if (ar[i].hadRead)continue;
            effectQ.push(ar[i]);
            ar[i]['tempLevelData'] = this.data;
        }
        if (effectQ.length < 1)this.labTip.visible = true;
        this.list.dataProvider = new eui.ArrayCollection(effectQ);
    }

    public onCloseClick(e:egret.TouchEvent):void
    {
        super.onCloseClick(e);
        document.getElementById('code-area').style.display = 'block';
    }
}

