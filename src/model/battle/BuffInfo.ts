/**
 * Created by sam on 2016/01/08.
 */
export default class BuffInfo
{
    public overTime:number;
    public delayTime:number = 0;
    public hp:number = 0;
    public speed:number = 1;
    public attack_add:number = 1;
    public safe_range:number = 1;
    public hurt_cut:number = 0;
    public isOver:Boolean = false;
    public confuse:number = 0;
    public constructor(cfg:any)
    {
        this.delayTime = Number(cfg.delay_time);
        this.hp = Number(cfg.hp_add);
        this.speed = Number(cfg.speed);
        this.attack_add = Number(cfg.attack_add);
        this.safe_range = Number(cfg.safe_range);
        this.hurt_cut = Number(cfg.hurt_cut);
        this.confuse = Number(cfg.confuse);
    }
}