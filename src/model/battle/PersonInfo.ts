/**
 * Created by sam on 2016/12/27.
 */
export default class PersonInfo
{
    private _hp:number = 0;
    private _mp:number = 0;
    public maxhp:number = 0;
    public team:number = 0;
    public viewrange:number = 0;
    public attackID:number = 0;
    public skillID:number = 0;
    public attack_add:number = 0;
    public attack_base:number = 0;
    public hurt_cut:number = 0;
    public sayhi:number = 0;
    public safeRange = 0;
    public constructor(cfg:any)
    {
        this._hp = Number(cfg['hp']);
        this.maxhp = this._hp;
        this.team = Number(cfg['team']);
        this.viewrange = Number(cfg['viewrange']);
        this.attackID = Number(cfg['attack']);
        this.skillID = Number(cfg['skill']);
        this.attack_base = Number(cfg['atkdamage']);
        this.sayhi = Number(cfg['sayhi']);
    }

    public get hp():number
    {
        return this._hp;
    }

    public set hp(v:number)
    {
        this._hp = v;
    }

    public get mp():number
    {
        return this._mp;
    }

    public set mp(v:number)
    {
        this._mp = v;
    }
}