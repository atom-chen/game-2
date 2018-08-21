/**
 * Created by yaozh on 2017/5/10.
 */
export default class Protocols
{
    public static QUERY_ENTRY:string = 'gate.gateHandler.queryEntry';

    public static ROUTE_LOGIN       : string = 'connector.entryHandler.enter';
    public static ROUTE_PLAYSTORY   : string = 'game.gameHandler.playStory';
    public static ROUTE_GETSTORYINFO: string = 'game.gameHandler.getStoryInfo';
    public static ROUTE_USEITEM     : string = 'game.gameHandler.useItem';                      //装备卸载与安装
    public static ROUTE_SELECT_HERO : string = 'game.gameHandler.selectHero';
    public static ROUTE_BUY_HERO    : string = 'game.gameHandler.buyHero';
    public static ROUTE_SAVE_STORY_CODE:string = 'game.gameHandler.saveStoryCode';
    public static ROUTE_GET_STORY_CODE:string = 'game.gameHandler.getStoryCode';

    public static ROUTE_ASKQUESTION:string = 'game.gameHandler.askQuestion';//提出疑问，发起疑问
    public static ROUTE_GETQUESTIONS:string = 'game.gameHandler.getQuestions';//获取疑问
    public static ROUTE_GETREPLYS:string = 'game.gameHandler.getReplys';//获取疑问的回复
    public static ROUTE_REPLYQUESTION:string = 'game.gameHandler.replyQuestion';//回答答疑
    public static ROUTE_PUSHQUESTION:string = 'game.gameHandler.pushQuestion';//下行被动协议，推送给老师的求助
    public static ROUTE_PUSHREPLY:string = 'game.gameHandler.pushReply';//下行被动协议，推送给学生的答复
    public static ROUTE_GETUSERINFO:string = 'game.gameHandler.getUserInfo';
    public static ROUTE_READREPLY:string = 'game.gameHandler.readReply';//学生查看老师答案
    public static ROUTE_GETUSERID:string = 'game.gameHandler.getUserId';//通过平台id获取用户id

    public static ROUTE_PUSH_CLASSLOCK:string = 'game.gameHandler.classLock';//学生监听老师的锁定/解锁信息
    public static ROUTE_LOCK_CLASS:string = 'game.gameHandler.lockClass';//锁定/解锁班级

    public static ROUTE_REMOVE_QUESTION:string = 'game.gameHandler.removeQuestion';//删除学生请求
    public static ROUTE_REMOVE_REPLY:string = 'game.gameHandler.removeReply';//删除学生回复
}

