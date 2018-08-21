import BasePlatform from "./BasePlatform";
import Alert from "../view/common/Alert";
import ClassLockInfo from "./ClassLockInfo";
import {storeClassInfo, checkClassInfo, checkIdentity, signin, signout, signup, getMyClasses, bindUser} from './api'
import {Promise} from 'es6-promise'
import uuid = require('uuid')
import md5 = require('md5')
 

/**
 * Created by yaozhiguo on 2017/3/16.
 */
export default class MaliPlatform extends BasePlatform
{
    public className:string;
    public classId:string;
    public classTeacherId:string;
    public idType:string = 'other';
    public price:number = 0;
    public classLockInfo:ClassLockInfo;

    public constructor()
    {
        super();
        this.root = '/api';
        this.classLockInfo = new ClassLockInfo();
    }

    /**
     * 检查登录状态
     */
    public checkMe():any
    {
        return checkIdentity().then((user)=>{
            this._isLogin = true;
            this._anonymous = false;
            
            //对应游戏服务器 也就是netmanger的userName！！！？
            this.platformUserId = md5(user['username']); //data['id'];
            this.platformUserAccount = user['username'] +'@null.com'; //data['email'];
            this.platformUserName = user['username'];
            
            //检测班级
            return checkClassInfo(this.platformUserName).then((classeInfo)=>{
                if(classeInfo) {
                    this.bindClassInfo(classeInfo)
                }
                return {'anonymous':false, platformUserId: this.platformUserId }
            })
        }).catch( (err)=>{

            this.platformUserId = md5(uuid.v1());
            this._anonymous = true
            this._isLogin = false;
           
            //弹窗让用户选择注册，登录或者匿名参与
            return Promise.resolve({'anonymous':true, platformUserId: this.platformUserId })
        })
    }

    public register(username, password, data:any):any
    {
        return signup(username, password, data)
            .then( (user)=>{
                this.platformUserId = user['username'];
                return user
            }).catch( (err) =>{
                let  tip = '这个名字已经有人用了哦！换个更帅气的名字吧';
                Alert.show('注册',  tip, 2);
            })
    }

    public bindAnonymous(username:string, password:string, gameUserId:string):any
    {
        return bindUser(username, password, gameUserId).then((user)=>{
            this.platformUserId = user['gameUserId']
            return user
        }).catch((err)=>{
            Alert.show('绑定',  '绑定用户出错', 2)
        })
        // HttpUtil.usePut(this.root + '/' + data['id'], data, (result:Object)=>{

    }

    public login(username, password):any
    {
        return signin(username, password)
            .then((user) => {
                this.platformUserId = user['gameUserId'] || user['username']
                return user
            }).catch(function(){
                let tip = '用户名或密码不正确'
                Alert.show('登录', tip, 2);
            })
    }
    public bindClassInfo(classInfo):any
    {
        this.classTeacherId = classInfo['teacherId'];
        this.classId = classInfo['id'];
        this.className = classInfo['name'];
        this.idType = classInfo['idType'];
        storeClassInfo(this.platformUserId, classInfo['id'], classInfo['name'], classInfo['idType'], classInfo['teacherId'])
    }

    public getClasses():any
    {
        return getMyClasses().then( (classes:any)=>{
            //result new
            let resolvedClasses = [];
            for (let i = 0; i < classes.length; i++) {
                let classInfo = {};
                let classObj = classes[i];
                
                let classId:string = classObj['id'];
                let className:string = classObj['name'];

                let myIdType = classObj['teacherId'] == this.platformUserId ? 'teacher' : 'student'
                classInfo['id'] = classId;
                classInfo['name'] = className;
                classInfo['teacherId'] = classObj['teacherId']
                classInfo['idType'] = myIdType; //myType:'other'  'student'  'teacher'
                resolvedClasses.push(classInfo);
            }
            return resolvedClasses
        }).then( classInfoes => {
            if (classInfoes.length > 0){  
                this.bindClassInfo(classInfoes[0])
            }
            return classInfoes
        })
    }

    public logout():any
    {
        return signout().then(
            ()=>{
                this.emit('logout')
                this.reload()
        })
    }


    /**
     * 重新加载页面时，需要根据配置判断跳转到哪个登陆界面
     */
    public reload():void
    {
        let sysConfig:any = RES.getRes('sys_json');
        if (sysConfig.embedTo == 'zc'){
            window.location.assign(sysConfig.embedLink + 'login.html');
        }else if (sysConfig.embedTo == 'ml'){
            // window.location.assign(sysConfig.embedLink);
        }
        
        window.location.reload();
        

    }
}