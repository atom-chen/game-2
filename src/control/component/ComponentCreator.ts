import Move from "./Move";
import SceneObjectActor from "../actions/SceneObjectActor";
import BaseComponent from "./BaseComponent";
import Attack from "./Attack";
import Builder from "./Builder";
import Cast from "./Cast";
import Command from "./Command";
import Foundation from "./Foundation";
import Find from "./Find";
/**
 * Created by yaozhiguo on 2017/3/1.
 */
export default class ComponentCreator
{
    private _actor:SceneObjectActor;
    private _components:Object = {};

    public attach(actor:SceneObjectActor):void
    {
        this._actor = actor;
        this.createComponent(Move, 'Move');
        this.createComponent(Attack, 'Attack');
        this.createComponent(Builder, 'Builder');
        this.createComponent(Cast, 'Cast');
        this.createComponent(Command, 'Command');
        this.createComponent(Foundation, 'Foundation');
        this.createComponent(Find, 'Find');
    }

    private createComponent(componentDef:any, name:string):void
    {
        this._components[name] = new componentDef(name);
        this._components[name].attach(this._actor);
    }

    public getComponent(name:string):BaseComponent
    {
        return this._components[name];
    }

    public dispose():void
    {
        for (var key in this._components)
        {
            let componet:BaseComponent = this._components[key];
            componet.dispose();
        }
        this._components = {};
        this._actor.dispose();
    }
}