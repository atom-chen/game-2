import ServerAccessProxy from "./ServerAccessProxy";
import NetManager from "../net/NetManager";
import QuestionMessage from "../vo/teach/QuestionMessage";
import Alert from "../../view/common/Alert";
import SceneManager from "../../manager/SceneManager";
import WindowManager from "../../base/popup/WindowManager";
import ClassHelpWindow from "../../view/teach/ClassHelpWindow";
import ReplyMessage from "../vo/teach/ReplyMessage";
import UserInfo from "../vo/UserInfo";
import EquipInfo from "../vo/EquipInfo";
import HeroInfo from "../vo/HeroInfo";
import IEventDispatcher = egret.IEventDispatcher;
import TeachSystemInfo from "../vo/teach/TeachSystemInfo";
import Protocols from "../../enums/Protocols";
import Platform from "../../platforms/Platform";
import MaliPlatform from "../../platforms/MaliPlatform";
/**
 * Created by yaozhiguo on 2017/3/3.
 */
export default class TeachSystemProxy extends ServerAccessProxy
{
    public static QUESTIONS_COMPLETE:string = "questionsComplete";
    public static REPLYS_COMPLETE:string = "replysComplete";
    public static USER_INFO_COMPLETE:string = "getUserInfoComplete";
    public static QUESTION_REMOVED:string = 'questionRemoved';
    public static REPLY_REMOVED:string = 'replyRemoved';

    public currentHelpId:number = 0;

    public addSocketPushes():void
    {
        //被动协议，老师收到学生提问
        NetManager.getInstance().onServerCall(Protocols.ROUTE_PUSHQUESTION, (rawData)=>{
            let systemInfo:TeachSystemInfo = this.data;
            let req:QuestionMessage = new QuestionMessage();
            req.uuid = parseInt(rawData['id']);
            req.teacherId = parseInt(rawData['uid']);
            req.from = parseInt(rawData['studentid']);
            req.storyId = parseInt(rawData['storyid']);
            req.code = rawData['code'];
            req.hadRead = parseInt(rawData['readed']) == 1;
            req.requestTime = parseInt(rawData['createTime']);
            req.studentEmail = rawData['student_mail'];
            // requests.push(req);
            systemInfo.addQuestion(req.uuid, req);
            this.dispatchEvent(new egret.Event(TeachSystemProxy.QUESTIONS_COMPLETE, false, false, systemInfo.getQuestions()));
        });

        //被动协议，学生收到老师答复
        NetManager.getInstance().onServerCall(Protocols.ROUTE_PUSHREPLY, (rawData)=>{

            let reply:ReplyMessage = new ReplyMessage();
            reply.uuid = parseInt(rawData['id']['insertid']);
            reply.storyId = parseInt(rawData['storyid']);
            reply.code = rawData['code'];
            reply.hadRead = parseInt(rawData['readed']) == 1;
            reply.createTime = parseInt(rawData['createTime']);
            let systemInfo:TeachSystemInfo = this.data;
            systemInfo.addReply(reply.uuid, reply);
            this.dispatchEvent(new egret.Event(TeachSystemProxy.REPLYS_COMPLETE, false, false, systemInfo.getReplys()));
        });

        //被动监听老师锁定班级的消息
        NetManager.getInstance().onServerCall(Protocols.ROUTE_PUSH_CLASSLOCK, (rawData)=>{
            let maliPlatform:MaliPlatform = <MaliPlatform>(Platform.currentPlatform);
            maliPlatform.classLockInfo.classId = rawData['classId'];
            maliPlatform.classLockInfo.lockLvl = parseInt(rawData['levelId']);
            maliPlatform.classLockInfo.lockOperator = rawData['teacherId'];
            maliPlatform.classLockInfo.state = rawData['state'];

            this.dispatchEvent(new egret.Event('classLockStateChanged', false, false, maliPlatform.classLockInfo));
        });
    }

    protected parseReceivedData(rawData:any):void
    {
        super.parseReceivedData(rawData);

        switch (rawData.route)
        {
            case Protocols.ROUTE_ASKQUESTION://提出疑问，发起疑问; "insertid":0,1成功与否
            {
                this.handleAskComplete(rawData);
                break;
            }
            case Protocols.ROUTE_GETQUESTIONS://获取疑问 questions:列表
            {
                this.handleGetQuestions(rawData);
                break;
            }
            case Protocols.ROUTE_GETREPLYS://获取疑问的回复 replys:列表
            {
                this.handleGetReplys(rawData);
                break;
            }
            case Protocols.ROUTE_REPLYQUESTION://老师回答疑问成功 "insertid":0,1成功与否
            {
                this.handleReplyComplete(rawData);
                break;
            }
            case Protocols.ROUTE_GETUSERINFO://请求某个玩家的信息
            {
                this.handlePlayerInfo(rawData);
                break;
            }
            case Protocols.ROUTE_READREPLY://学生查看老师答案，标记为已读
            {
                this.handleMarkRead(rawData);
                break;
            }
            case Protocols.ROUTE_REMOVE_QUESTION://删除求助
            {

                this.handleRemoveQuestion(rawData);
                break;
            }
            case Protocols.ROUTE_REMOVE_REPLY://删除回复
            {
                this.handleRemoveReply(rawData);
                break;
            }
        }
    }

    //求助发送完成
    private handleAskComplete(rawData:any):void
    {
        let insertId:number = rawData['data']['insertid'];
        if (insertId > 0){
            Alert.show('提示', '求助发送成功', 2);
        } else{
            Alert.show('提示', '求助发送失败', 2);
        }
    }

    //获取求助列表
    private handleGetQuestions(rawData:any):void
    {
        let systemInfo:TeachSystemInfo = this.data;
        let questionObjs = rawData['data']['questions'];
        console.log('questionObjs', questionObjs)
        for (let key in questionObjs)
        {
            let questionObj:Object = questionObjs[key];
            let req:QuestionMessage = new QuestionMessage();
            req.uuid = parseInt(questionObj['id']);
            req.teacherId = parseInt(questionObj['uid']);
            req.from = parseInt(questionObj['studentid']);
            req.storyId = parseInt(questionObj['storyid']);
            req.code = questionObj['code'];
            req.hadRead = parseInt(questionObj['readed']) == 1;
            req.requestTime = parseInt(questionObj['createTime']);
            req.fromName = questionObj['studentname'];
            req.studentEmail = questionObj['stu_mail'];
            systemInfo.addQuestion(req.uuid, req);
        }
        this.dispatchEvent(new egret.Event(TeachSystemProxy.QUESTIONS_COMPLETE, false, false, systemInfo.getQuestions()));
    }

    private handleGetReplys(rawData:any):void
    {
        let systemInfo:TeachSystemInfo = this.data;
        let responseObjs = rawData['data']['replys'];
        for (let key in responseObjs)
        {
            let questionObj:Object = responseObjs[key];
            let reply:ReplyMessage = new ReplyMessage();
            reply.uuid = parseInt(questionObj['id']);
            reply.storyId = parseInt(questionObj['storyid']);
            reply.code = questionObj['code'];
            reply.hadRead = parseInt(questionObj['readed']) == 1;
            reply.createTime = parseInt(questionObj['createTime']);
            systemInfo.addReply(reply.uuid, reply);
        }
        this.dispatchEvent(new egret.Event(TeachSystemProxy.REPLYS_COMPLETE, false, false, systemInfo.getReplys()));
    }

    //教师回答完成的返回
    private handleReplyComplete(rawData:any):void
    {
        let insertId:number = rawData['data']['result']['insertid'];
        let questionId:number = rawData['data']['result']['qid'];
        if (insertId > 1)
        {
            let systemInfo:TeachSystemInfo = this.data;
            systemInfo.removeQuestion(questionId);
            let alert:Alert = Alert.show('提示', '答案已发送', 2);
            alert.once('confirm', ()=>{
                WindowManager.closeAllWindow();
                SceneManager.getInstance().popScene();
                WindowManager.showWindow(ClassHelpWindow, 'ClassHelpWindow');
            }, this);
        }
    }

    private handlePlayerInfo(rawData:any):void
    {
        let systemInfo:TeachSystemInfo = this.data;
        let userInfo:UserInfo = systemInfo.getQuestion(this.currentHelpId).userInfo;
        if (!userInfo)
        {
            userInfo = new UserInfo();
            userInfo.idType = UserInfo.ID_STUDENT;
        }

        let resInfo:any = rawData.data.user;
        userInfo.uuid = parseInt(resInfo["id"]);
        userInfo.exp = parseInt(resInfo['exp']);
        userInfo.diamond = parseInt(resInfo['diamond']);
        userInfo.level = parseInt(resInfo['level']);
        userInfo.nickName = resInfo['name'];
        userInfo.vigor = parseInt(resInfo['physical']);
        userInfo.serverTime = parseFloat(resInfo['updateTime']);
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
            equipInfo.updateTime = parseFloat(equip['updateTime']||0); //创建时间
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

        this.dispatchEvent(new egret.Event(TeachSystemProxy.USER_INFO_COMPLETE, false, false, userInfo));
    }

    private handleMarkRead(rawData:any):void
    {
        let systemInfo:TeachSystemInfo = this.data;
        let readed:number = rawData['data']['readed'];
        if (readed > 0)
        {
            let reply:ReplyMessage = systemInfo.getReply(parseInt(rawData['data']['id']));
            if (reply)reply.hadRead = true;
        }
    }

    private handleRemoveQuestion(rawData:any):void
    {
        let systemInfo:TeachSystemInfo = this.data;
        let qid:number = parseInt(rawData['data']['questionId']);
        systemInfo.removeQuestion(qid);
        this.dispatchEvent(new egret.Event(TeachSystemProxy.QUESTION_REMOVED, false, false, systemInfo.getQuestions()));
    }

    private handleRemoveReply(rawData:any):void
    {
        let systemInfo:TeachSystemInfo = this.data;
        let rid:number = parseInt(rawData['data']['replyId']);
        systemInfo.removeReply(rid);
        this.dispatchEvent(new egret.Event(TeachSystemProxy.REPLY_REMOVED, false, false, systemInfo.getReplys()));
    }
}