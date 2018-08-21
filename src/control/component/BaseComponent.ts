import SceneObjectActor from "../actions/SceneObjectActor";
/**
 * Created by yaozhiguo on 2017/3/1.
 */
export default class BaseComponent
{
    protected actor:SceneObjectActor;
    private _name:string;

    public get name():string
    {
        return this._name;
    }

    public constructor(name:string)
    {
        this._name = name;
    }

    public attach(actor:SceneObjectActor):void
    {
        this.actor = actor;
    }

    public dispose():void
    {

    }
}