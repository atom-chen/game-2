import BaseWindow from "../../base/popup/BaseWindow";
import ClassHelpItemRenderer from "./ClassHelpItemRenderer";
import ServerManager from "../../model/net/NetManager";
import DataAccessManager from "../../base/da/DataAccessManager";
import DataAccessEntry from "../../model/DataAccessEntry";
import TeachSystemProxy from "../../model/da/TeachSystemProxy";
import UserInfo from "../../model/vo/UserInfo";
import QuestionMessage from "../../model/vo/teach/QuestionMessage";
import MouseScroller from "../common/MouseScroller";
import Protocols from "../../enums/Protocols";
/**
 * Created by yaozhiguo on 2017/3/3.
 * 求助窗口，统计显示当前班级的所有求助信息
 */
export default class ClassHelpWindow extends BaseWindow
{
    private labClassName:eui.Label;
    private labWait:eui.Label;
    private list:eui.List;
    private scrollerHelp:eui.Scroller;

    private btnIDSort:eui.Button;
    private btnTimeSort:eui.Button;

    private _userInfo:UserInfo;

    private sortType:number = 1;

    public constructor()
    {
        super();
        this.skinName = 'ClassHelpWindowSkin';
        ServerManager.getInstance().callServerSocket(Protocols.ROUTE_GETQUESTIONS);
        DataAccessManager.getAccess(DataAccessEntry.TEACH_SYSTEM_PROXY).
            addEventListener(TeachSystemProxy.QUESTIONS_COMPLETE, this.onQuestions, this);
        DataAccessManager.getAccess(DataAccessEntry.TEACH_SYSTEM_PROXY).
            addEventListener(TeachSystemProxy.QUESTION_REMOVED, this.onQuestionRemoved, this);
        this._userInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;

        this.btnIDSort.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onIDSort, this);
        this.btnTimeSort.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTimeSort, this);
    }

    private onQuestions(event:egret.Event):void
    {
        let clean = event.data;//this.eliminateRepeat(event.data);
        if (this.isComplete)
        {
            this.updateData(clean);
        }
        this.data = clean;
    }

    private onQuestionRemoved(event:egret.Event):void
    {
        let clean = event.data;//this.eliminateRepeat(event.data);
        if (this.isComplete)
        {
            this.updateData(clean);
        }
        this.data = clean;
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        MouseScroller.enableMouseScroller(this.scrollerHelp);
        this.list.itemRenderer = ClassHelpItemRenderer;
        if (this.data)
        {
            this.updateData(this.data);
        }
        this.labClassName.text = this._userInfo.className;
    }

    private updateData(data:any):void
    {
        let ar:QuestionMessage[] = data;
        let effectQ:QuestionMessage[] = [];//提取未辅导过的请求
        for (let i in ar)
        {
            if (ar[i].hadRead)continue;
            effectQ.push(ar[i]);
        }
        effectQ.sort(this.sortByStoryId);
        this.sortType = 1;
        this.list.dataProvider = new eui.ArrayCollection(effectQ);
        this.labWait.text = this.list.dataProvider.length.toString();
    }

    //消除相同关卡且相同账号的请求
    private eliminateRepeat(origin:QuestionMessage[]):QuestionMessage[]
    {
        let result:QuestionMessage[] = [];
        let questionCount:number = origin.length;
        for (let i = 0; i < questionCount; i++)
        {
            let can = origin[i];
            let isRepeat:boolean = false;
            for (let j = i + 1; j < questionCount; j++)
            {
                let test = origin[j];
                if (test.fromName == can.fromName && test.storyId == can.storyId && !test.hadRead)
                {
                    isRepeat = true;
                    break;
                }
            }
            if (!isRepeat)
            {
                result.push(can);
            }
        }
        return result;
    }

    //根据请求时间排序
    private sortByRequestTime(a:QuestionMessage, b:QuestionMessage):number
    {
        if (a.requestTime > b.requestTime)return 1;
        else if (a.requestTime < b.requestTime)return -1;
        else return 0;
    }

    //根据请求的关卡id排序：关卡越小，越靠前
    private sortByStoryId(a:QuestionMessage, b:QuestionMessage):number
    {
        if (a.storyId > b.storyId)return 1;
        else if (a.storyId < b.storyId)return -1;
        else return 0;
    }

    private onIDSort(event:egret.TouchEvent):void
    {
        if (this.sortType == 1)return;
        let ar:QuestionMessage[] = this.data;
        let effectQ:QuestionMessage[] = [];//提取未辅导过的请求
        for (let i in ar)
        {
            if (ar[i].hadRead)continue;
            effectQ.push(ar[i]);
        }
        effectQ.sort(this.sortByStoryId);
        this.sortType = 1;
        this.list.dataProvider = new eui.ArrayCollection(effectQ);
    }

    private onTimeSort(event:egret.TouchEvent):void
    {
        if (this.sortType == 2)return;
        let ar:QuestionMessage[] = this.data;
        let effectQ:QuestionMessage[] = [];//提取未辅导过的请求
        for (let i in ar)
        {
            if (ar[i].hadRead)continue;
            effectQ.push(ar[i]);
        }
        effectQ.sort(this.sortByRequestTime);
        this.sortType = 2;
        this.list.dataProvider = new eui.ArrayCollection(effectQ);
    }

    public dispose():void
    {
        super.dispose();
        this.btnIDSort.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onIDSort, this);
        this.btnTimeSort.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTimeSort, this);
        DataAccessManager.getAccess(DataAccessEntry.TEACH_SYSTEM_PROXY).
            removeEventListener(TeachSystemProxy.QUESTIONS_COMPLETE, this.onQuestions, this);
    }
}