/**
 * Created by sam on 2016/12/28.
 */
export default class AIInfo
{
    public endPoint:egret.Point = new egret.Point(0,0);
    public type:number = 0;
    public event:string = "";
    public next:number[] = [];
    public overTime:number = 0;
    public skill:number = 0;
    public focusName:string = "";
    public gNPC:string = "";
    public gHP:number = 0;

    //类型1：移动，类型2：延时，类型3：ghp-〉event,类型5 旋转
    public constructor(timer:number,cfg:any)
    {
        if(cfg['gNPC'].length>1) this.gNPC = cfg['gNPC'];
        if(Number(cfg['gHP'])>0) this.gHP = Number(cfg['gHP']);
        if(cfg['focusName'].length>1) this.focusName = cfg['focusName'];
        if(Number(cfg.endX)>0) this.endPoint = new egret.Point(Math.floor(Number(cfg.endX)+Math.random()*Number(cfg.endRange)),Math.floor(Number(cfg.endY)+Math.random()*Number(cfg.endRange)));
        this.type = Number(cfg['type']);
        if(cfg.next.length>0)
        {
            var ids: string[] = cfg['next'].split("|");
            for (var i = 0; i < ids.length; i++) {
                if(Number(ids[i])>0) this.next.push(Number(ids[i]));
            }
        }
        this.overTime = Math.floor(timer) + Number(cfg['delayTime']);
        this.skill = Number(cfg['skill']);
        this.event = cfg['event'];
    }
}