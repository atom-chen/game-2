import Scene from "../base/view/Scene";
import {ICallback} from  "../base/view/ICallback"
/**
 * Created by sam on 2016/11/11.
 * 界面管理。
 */
export default class SceneManager
{
    private _scenes:Scene[];
    private _popups:any[];
    private _stage:eui.UILayer;
    public constructor()
    {
        this._scenes = [];
        this._popups = [];
    }

    private static _instance: SceneManager;
    static getInstance(): SceneManager
    {
        if(this._instance == null)
        {
            this._instance = new SceneManager();
        }
        return this._instance;
    }

    //初始化界面管理器
    public init(stage:eui.UILayer): void
    {
        this._stage = stage;
    }

    //获取舞台
    public getStage():eui.UILayer
    {
        return this._stage;
    }

    //服务器返回的数据分派到各界面
    public serverBack(route:string,data:any):void
    {
        this._scenes[this._scenes.length-1].callback(route,data);
        for(var i=0;i<this._popups.length;i++)
        {
            this._popups[i].callback(route,data);
        }
    }

    //层级scen层级管理
    public getRunningScene():Scene
    {
        return this._scenes[this._scenes.length-1];
    }

    public popScene():void
    {
        this._stage.removeChild(this._scenes[this._scenes.length-1]);
        this._scenes.pop().dispose();
        if (this._scenes.length > 0)
        {
            this._scenes[this._scenes.length-1].onEnter();
        }
    }

    public pushScene(scene:Scene,data?:any):void
    {
        this._scenes.push(scene);
        this._stage.addChild(this._scenes[this._scenes.length-1]);
        this._scenes[this._scenes.length-1].onEnter();
        if (data) this._scenes[this._scenes.length-1].setData(data);
    }

    public replaceScene(scene:Scene,data?:any):void
    {
        this.popScene();
        this._scenes.push(scene);
        this._stage.addChild(this._scenes[this._scenes.length-1]);
        this._scenes[this._scenes.length-1].onEnter();
        if (data) this._scenes[this._scenes.length-1].setData(data);
    }

    public get numScenes():number
    {
        return this._scenes.length;
    }
}
