import BaseInfo from "../../../base/info/BaseInfo";
import QuestionMessage from "./QuestionMessage";
import ReplyMessage from "./ReplyMessage";
/**
 * Created by yaozhiguo on 2017/3/8.
 */
export default class TeachSystemInfo extends BaseInfo
{
    private _questionMsgMap:Object;
    private _replyMsgMap:Object;

    public constructor()
    {
        super();
        this._questionMsgMap = {};
        this._replyMsgMap = {};
    }

    public addQuestion(questionId:number, question:QuestionMessage):void
    {
        this._questionMsgMap[questionId] = question;
    }

    public getQuestion(questionId:number):QuestionMessage
    {
        return this._questionMsgMap[questionId];
    }

    public removeQuestion(questionId:number):QuestionMessage
    {
        let ques:QuestionMessage = this._questionMsgMap[questionId];
        if (ques)
        {
            delete this._questionMsgMap[questionId];
        }
        return ques;
    }

    public getQuestions():any[]
    {
        return _.values(this._questionMsgMap);
    }

    public addReply(replyId:number, reply:ReplyMessage):void
    {
        this._replyMsgMap[replyId] = reply;
    }

    public getReply(replyId:number):ReplyMessage
    {
        return this._replyMsgMap[replyId];
    }

    public removeReply(replyId:number):ReplyMessage
    {
        let reply:ReplyMessage = this._replyMsgMap[replyId];
        if (reply)
        {
            delete this._replyMsgMap[replyId];
        }
        return reply;
    }

    public getReplys():any[]
    {
        return _.values(this._replyMsgMap);
    }
}