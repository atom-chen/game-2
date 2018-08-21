import BaseWindow from "../../../base/popup/BaseWindow";
import UserInfo from "../../../model/vo/UserInfo";
import WindowManager from "../../../base/popup/WindowManager";
import SystemNickname from "./SystemNickname";
import DataAccessEntry from "../../../model/DataAccessEntry";
import DataAccessManager from "../../../base/da/DataAccessManager";
import HostConfig from "../../../enums/HostConfig";
import SoundManager from "../../../manager/SoundManager";
import MaliPlatform from "../../../platforms/MaliPlatform";
import Alert from "../../common/Alert";
import Platform from "../../../platforms/Platform";

/**
 * Created by yinya on 2017/2/10.
 */
export default class OptionWindow extends BaseWindow
{
    private NicknamePanel: SystemNickname;

    private systembtn0:eui.Component; //玩家信息
    private systembtn1:eui.Component; //系统设置
    public btnClose:eui.Button;

    private renamebtn:eui.Button;  //更名  
    private avatarbtn:eui.Button;  //更改头像
    // private changepsdbtn:eui.Button; //更改密码
    private imgHead:eui.Image;   //勇士头像
    private player_name_label:eui.Label; //昵称
    private player_email_label:eui.Label; //邮箱

    private InputNickname:eui.TextInput;


    // private hostbtn: number = 0;
    private systembtns:Array<any>;
    private systemhost: number;
    private systemSlots: any;
    public systemSkin: any;

    private selectedbtn0:eui.ToggleButton;//系统音乐
    private selectedbtn1:eui.ToggleButton;//系统音效
    private Languagebtn:eui.Button;//语言选择
    private alterHeight:number = 0;

    private viewStack:eui.ViewStack;
    private isMusicOpen:boolean;

     public constructor(heroData:any)
    {
        super();
        this.skinName = 'SystemSkin';
        this.isMusicOpen = true;
    }

    // private list:eui.List;
    protected childrenCreated():void
    {
        super.childrenCreated();
        this.addListeners();
        this.onUserInfo();
        this.updateView();

        let effectState: string = egret.localStorage.getItem('effectSwitch');
        if(effectState == 'on' || !effectState)
        {
            this.selectedbtn1.selected = false;
        }
        else
        {
            this.selectedbtn1.selected = true;
        }

        let musicState: string = egret.localStorage.getItem('musicSwitch');
        if(musicState == 'on' || !musicState)
        {
            this.selectedbtn0.selected = false;
        }
        else
        {
            this.selectedbtn0.selected = true;
        }
    }

    private addListeners():void
    {
        this.renamebtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onrename, this);
        // this.changepsdbtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onchangepassword, this);       
        // NetManager.getInstance().addEventListener(UserInfoProxy.STORY_UPDATE_DATA, this.onUserInfo, this);
        this.selectedbtn0.addEventListener(eui.UIEvent.CHANGE, this.systemMusic, this);
        this.selectedbtn1.addEventListener(eui.UIEvent.CHANGE, this.systemSound, this);
        this.Languagebtn.addEventListener(eui.UIEvent.CHANGE, this.onLanguage, this);
    }
    
    private onUserInfo():void
    {
        let userInfo:UserInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data
        if (!userInfo)return;
        this.player_name_label.text = userInfo.nickName || '玩家';
        this.imgHead.source  = userInfo.headImgUrl || 'resource/icon/role/career_head/' + userInfo.headIcon + '.png';
        this.player_email_label.text = Platform.currentPlatform.platformAccount;
    }

    protected updateView():void
    {
        super.updateView();
        //systembtns
        this.systembtns = [];
        this.systemhost = HostConfig.SESTEM_PLAYER;
        let len = HostConfig.EQUIP_TYPES.length;
        for(let i = 0; i < len; ++ i)
        {
            this.systembtns.push( this['systembtn'+i] );
            this.systembtns[i].addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTabTouchHandler, this);
        }
        this.updatePanel();
    }

    private updatePanel()
    {
        this.highlightOnlyTabByIndex( this.systemhost );
        this.showSkinByType( this.systemhost );
    }

    private onTabTouchHandler(e:egret.TouchEvent)
    {
        let target:eui.Component = e.target.parent;
        if(!(target instanceof eui.Component)) return;

        var len = this.systembtns.length;
        for(let i = 0; i < len; ++ i)
        {
            if(target == this.systembtns[i])
            {
                this.systemhost = i;
                break;
            }
        }
        
        this.updatePanel();
    }

    private highlightOnlyTabByIndex(tabIndex:number)
    {
        let len = this.systembtns.length;

        tabIndex = Math.min( Math.max(0, tabIndex), len);
        for(let i = 0; i < len; ++ i)
        {
            this.systembtns[i].imgSelected.visible = (i == tabIndex ? true:false);
        }
    }

    private highlightOnlySlotByIndex(slotIndex:number)
    {
        let len = this.systemSlots.length;
        //如果slotIndex = -1,表明没有一个选中
        if(-1 != slotIndex) 
        {
            slotIndex = Math.min( Math.max(1, slotIndex), len );
        }

        for(let i = 1; i <= len; ++ i)
        {
            this.systemSlots[i].imgSelected.visible = (i == slotIndex ? true:false);
        }
    }

    //不同类型的皮肤集
    public showSkinByType( type:number ):void
    {
        //教室
        if (type == 2){
            let platform:MaliPlatform = <MaliPlatform>(Platform.currentPlatform);
            this.viewStack.selectedIndex = type;
        }else{
            this.viewStack.selectedIndex = type;
        }
    }

    private removeListeners():void
    {
        this.renamebtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onrename, this);
        // this.changepsdbtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onchangepassword, this);
        // NetManager.getInstance().removeEventListener(UserInfoProxy.STORY_UPDATE_DATA, this.onUserInfo, this);
        this.selectedbtn0.removeEventListener(eui.UIEvent.CHANGE, this.systemMusic, this);
        this.selectedbtn1.removeEventListener(eui.UIEvent.CHANGE, this.systemSound, this);
        this.Languagebtn.removeEventListener(eui.UIEvent.CHANGE, this.onLanguage, this);
    }

    private onrename(event:egret.TouchEvent):void
    {
        WindowManager.showWindow(SystemNickname, "SystemNickname");
    }

    private onchangepassword(event:egret.TouchEvent):void
    {
        WindowManager.showWindow(SystemPassword, "SystemPassword");
    }


    private systemMusic(evt:eui.UIEvent) 
    {
        if (this.selectedbtn0.selected)
        {
            SoundManager.getInstance().setMusicVolume(0);
            egret.localStorage.setItem('musicSwitch', 'off');
        }
        else
        {
            SoundManager.getInstance().setMusicVolume(1); 
            egret.localStorage.setItem('musicSwitch', 'on');   
        } 
    }

    private systemSound(evt:eui.UIEvent) 
    {
        if (this.selectedbtn1.selected)
        {
            SoundManager.getInstance().setEffectVolume(0);
            egret.localStorage.setItem('effectSwitch', 'off');
        }
        else
        {
            SoundManager.getInstance().setEffectVolume(1); 
            egret.localStorage.setItem('effectSwitch', 'on');   
        }
    }

    private onLanguage(evt:eui.UIEvent) 
    {
        console.log('语言选择');
        // console.log(this.list.selectedItem,this.list.selectedIndex)
    }

}