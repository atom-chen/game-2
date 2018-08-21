import BaseInfo from "../../base/info/BaseInfo";
import GoalState from "./GoalState";
/**
 * Created by yaozhiguo on 2016/12/14.
 */
export default class GoalInfo extends BaseInfo
{
    public constructor()
    {
        super();
    }

    public state:number = GoalState.FAILED;
    public data:any;
    //public defaultHit:boolean = false; //默认是否处于达成目标状态，跟state类似，但是state是最终结果，该值用于记录实时状态。

    private _whos:string[];//目标发起者
    private _targets:string[];//目标作用对象

    public whoMarkers:Object = {};
    public targetMarkers:Object = {};

    public get whos():string[]
    {
        if (!this.data['who'])return null;
        if (!this._whos)
        {
            this._whos = this.data['who'].split('|');
            for(let i = this._whos.length - 1; i >= 0; i--)
            {
                let who:string = this._whos[i];
                if (who.length <= 1)
                {
                    this._whos.splice(i, 1);
                    continue;
                }
                this.whoMarkers[who] = false;
            }
        }
        return this._whos;
    }

    public get targets():string[]
    {
        if (!this.data['target'])return null;
        if (!this._targets)
        {
            this._targets = this.data['target'].split('|');
            for(let i = this._targets.length - 1; i >= 0; i--)
            {
                let target:string = this._targets[i];
                if (target.length <= 1)
                {
                    this._targets.splice(i, 1);
                    continue;
                }
                this.targetMarkers[target] = false;
            }
        }
        return this._targets;
    }

    public get targetAllHit():boolean
    {
        for (let key in this.targetMarkers)
        {
            if (!this.targetMarkers[key])return false;
        }
        return true;
    }

    public get whoAllHit():boolean
    {
        for (let key in this.whoMarkers)
        {
            if (!this.whoMarkers[key])return false;
        }
        return true;
    }

    public set targetAllHit(value:boolean)
    {
        for (let key in this.targetMarkers)
        {
            this.targetMarkers[key] = value;
        }
    }

    public set whoAllHit(value:boolean)
    {
        for (let key in this.whoMarkers)
        {
            this.whoMarkers[key] = value;
        }
    }
}