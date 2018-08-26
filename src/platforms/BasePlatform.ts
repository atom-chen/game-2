/**
 * Created by yaozhiguo on 2017/2/9.
 */

import {EventEmitter}  from 'eventemitter3'

export default class BasePlatform extends EventEmitter
{
    //应用的APPID
    protected appID:string = "101371743";
    //成功授权后的回调地址
    protected redirectURI:string = "//localhost:9011";
    protected root:string;

    protected platformUserId:string = null;
    protected platformUserAccount:string = null;
    protected platformUserRealName:string = null;
    protected accessToken:string;

    protected userObject:any;
    protected _anonymous:boolean = true;


    public addEve
    public get isAnonymous():boolean
    {
        return this._anonymous;
    }

    protected _isLogin:boolean = false;

    public get isLogin():boolean
    {
        return this._isLogin;
    }

    public get platformName():string
    {
        return this.platformUserRealName;
    }

    public get platformAccount():string
    {
        return this.platformUserAccount;
    }

    public checkMe():any
    {
        return null
    }

    public get openUserId():string
    {
        return this.platformUserId;
    }

    public register(username:string, password:string, data:any):any
    {
        return null

    }

    public login(username:string, password:string):any
    {
        return null
    }

    public logout():any
    {
        return null
    }
}