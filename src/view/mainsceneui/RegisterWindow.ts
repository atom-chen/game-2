import BaseWindow from "../../base/popup/BaseWindow";
import PasswordHelper from "./PasswordHelper";
import WindowManager from "../../base/popup/WindowManager";
import LoginWindow from "./LoginWindow";
import Alert from "../common/Alert";
import Platform from "../../platforms/Platform";
import MaliPlatform from "../../platforms/MaliPlatform";
/**
 * Created by yaozhiguo on 2017/2/6.
 */
export default class RegisterWindow extends BaseWindow
{
    private txtEmail:eui.TextInput;
    private txtPsd:eui.TextInput;
    private txtPsd2:eui.TextInput;
    private txtNickName:eui.TextInput;
    private btnRandName:eui.Button;
    private btnRegister:eui.Button;
    private labHasAccount:eui.Label;

    private psdHelper:PasswordHelper;
    private psd1Helper:PasswordHelper;

    private familyNames:string[] = ['阳光','宇宙','波动','光明','黑暗','弑神','星际','破碎','天使','恶魔','深渊','流浪','绝对','能量',
                                    '星辰','恒星',' 透明','时空','未来','量子','平行','多维','太阳','逐风','平衡','冰雪','翡翠','青空','无尽',
                                    '旋风','深空','时间','死光','银翼','寂静','骇客','幻影','银河','瀚海','超能','心灵','再见','绝地','次元',
                                    '黑体','四季','预言','无声','流金','灰烬','零度','震荡波','黑洞','永恒','超新星','创生','别了','反重力',
                                    '迷失','奇迹','重生','暮星','风暴','寒冰','逝去的','沉思的','微笑','烈炎','全息','至尊','超光速','零重力',
                                    '果壳中的','造梦','神奇','天外','以太','遗落','真 实','传说','彩虹','金色','七彩','全金属','最终','最后的',
                                    '纯黑','循环','爆裂','信仰','反物质','万物','奇异','异世','星河','天选','无翼','苍蓝','幻世','紫罗兰'];

    private firstNames:string[] =  ['梦想','公主','骑士','末裔','守护者','旅人','彼端','圆环','礼赞','荣耀',
                                    '魔比斯环','星云','效应','之魂','之心','之瞳','之外','之翼','之歌','之风','记忆','流星雨','碎片','雨滴',
                                    '梦境','旅程','小子','心晴','沙漏','空间','力场','武士','预感','机器','力量','猎人','战警','杀手',
                                    '普朗克','薛定谔','沐歌','回溯','纪元','太阳风','幻梦','咏叹调','之森','岁月','翘曲','使者','劫灰',
                                    '阿西莫夫','赛博格','勇者','之主','尘埃','之眼','之手','漫游者','之壁','狂想','梦想家','少女','宝贝',
                                    '浪人','圆舞曲','矩阵','之愿','光年','战神','之怒','之绊','之下','流亡者','斜晖','冲击','赛博朋克',
                                    '超弦','来客','镜像','穿越','乌托邦','帝国','狂猎','的祝福','秘密 ','之夜','之门','凝视者','理想乡',
                                    '万岁','之誓','的祈祷','勇士','之女','之子','的陨落','降临','残阳','悠悠','狂潮','幻想','浮生','领域'];

    public constructor()
    {
        super();
        this.skinName = 'RegisterWindowSkin';
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.psdHelper = new PasswordHelper(this.txtPsd);
        this.psd1Helper = new PasswordHelper(this.txtPsd2);
        this.btnRegister.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRegister, this);
        this.btnRandName.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onUpdateName, this);
        this.labHasAccount.touchEnabled = true;
        this.labHasAccount.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onLogin, this);
        this.txtNickName.text = this.randomName();

        this.labHasAccount.textFlow = new Array<egret.ITextElement>(
            { text:"已有账号", style: {'underline':true} }
        );
        this.labHasAccount.addEventListener(mouse.MouseEvent.MOUSE_OVER , ( evt ) => {
            this.labHasAccount.textColor = 0xffff00;
        }, this );
        this.labHasAccount.addEventListener(mouse.MouseEvent.MOUSE_OUT , ( evt ) => {
            this.labHasAccount.textColor = 0xffffff;
        }, this );
    }

    private onRegister(event:egret.TouchEvent):void
    {
        let checkResult:number = this.check();
        if (checkResult != 0){
            let tip:string = '输入的信息有误';
            switch(checkResult){
                case 2:{
                    tip = '密码未输入';
                    break;
                }case 3:{
                    tip = '密码长度不能小于6';
                    break;
                }case 4:{
                    tip = '昵称不能省略';
                    break;
                }case 1:{
                    tip = '两次密码不一致';
                    break;
                }case 6:{
                    tip = '用户名或者密码中含有空格';
                    break;
                }
            }
            Alert.show('输入错误', tip, 2);
            return;
        }

        let username = this.txtEmail.text
        let name = this.txtNickName.text
        let password = this.psd1Helper.passwordChars

        if (Platform.currentPlatform.isAnonymous){
            //绑定匿名账号
            (<MaliPlatform>Platform.currentPlatform).bindAnonymous(username, password, Platform.currentPlatform.openUserId)
                .then( (user)=>{
                    return Platform.currentPlatform.login( username,password)
                }).then((result)=>{
                    window.location.reload();
                })
        }else{
            Platform.currentPlatform.register(username, password, {name:name})
                .then( (user)=>{
                    return Platform.currentPlatform.login( username, password)
                }).then( (result)=>{
                    window.location.reload();
                })
        }
    }

    private onUpdateName(event:egret.TouchEvent):void
    {
        this.txtNickName.text = this.randomName();
    }

    private onLogin(event:egret.TouchEvent):void
    {
        WindowManager.closeWindow(this.name);
        WindowManager.showWindow(LoginWindow, 'LoginWindow');
    }

    private randomName():string
    {
        let familyName:string = this.familyNames[Math.floor(this.familyNames.length * Math.random())];
        let firstName:string = this.firstNames[Math.floor(this.firstNames.length * Math.random())];
        return familyName + firstName;
    }


    private check():number
    {
       
        if (this.psdHelper.passwordChars != this.psd1Helper.passwordChars)//密码不相同
        {
            return 1;
        }
        if (this.psdHelper.passwordChars == '' || this.psd1Helper.passwordChars == '' )//密码未输入
        {
            return 2;
        }
        if (this.psdHelper.passwordChars.length < 6)
        {
            return 3;
        }
        if (this.txtNickName.text == '')
        {
            return 4;
        }
        if (this.txtNickName.text.split(' ').length != 1 || this.psdHelper.passwordChars.split(' ').length != 1)
        {
            return 6;
        }
        return 0;
        
    }

    public dispose():void
    {
        super.dispose();

        this.psdHelper.dispose();
        this.psd1Helper.dispose();
        this.btnRegister.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onRegister,this);
        this.btnRandName.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onUpdateName,this);
        this.labHasAccount.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onLogin,this);
    }
}