import {IPopUp} from "../../base/popup/IPopUp";
import WindowManager from "../../base/popup/WindowManager";

import BattleSettingWindow from "./battlesetting/BattleSettingWindow";
import BattleResultWindow from "./battleresult/BattleResultWindow";

import GoalPanel from "./goal/GoalPanel";
import GoalManager from "../../control/goal/GoalManager";
import ActionBox from "./action/ActionBox";
import Globals from "../../enums/Globals";
import UserInfo from "../../model/vo/UserInfo";
import EquipInfo from "../../model/vo/EquipInfo";
import ConfigManager from "../../manager/ConfigManager";
import SoundManager from "../../manager/SoundManager";
import ExploreWindow from "../explore/ExploreWindow";
import EquipWindow from "../explore/equipment/EquipWindow";
import BadgeTipWindow from "../badge/BadgeTipWindow";
import BattleTipWindow from "./battletip/BattleTipWindow";
import SceneItem from "../battlescene/scene/SceneItem";
import ResourceItem = RES.ResourceItem;
import TweenLiteDriver from "../../base/utils/TweenLiteDriver";
import NetManager from "../../model/net/NetManager";
import CodeWorkerManager from "../../compile/CodeWorkerManager";
import QuestionMessage from "../../model/vo/teach/QuestionMessage";
import ReplyListWindow from "../teach/ReplyListWindow";
import DataAccessManager from "../../base/da/DataAccessManager";
import DataAccessEntry from "../../model/DataAccessEntry";
import ActionItem from "./action/ActionItem";
import Alert from "../common/Alert";
import TeachSystemProxy from "../../model/da/TeachSystemProxy";
import SceneManager from "../../manager/SceneManager";
import CreateRoleWindow from "../mainsceneui/CreateRoleWindow";
import LayerManager from "../../manager/LayerManager";
import UIPopupLoading from "../loading/UIPopupLoading";
import Protocols from "../../enums/Protocols";
import Platform from "../../platforms/Platform";
import MaliPlatform from "../../platforms/MaliPlatform";
import ClassLockInfo from "../../platforms/ClassLockInfo";

/**
 * Created by yaozhiguo on 2016/12/1.
 */
export default class BattleSceneUI extends eui.Component implements IPopUp
{
    public static RUN_TOUCH_TAP:string = 'runTouchTap';
    public static BTN_ZOOM_IN:string = 'battleZoomIn';
    public static BTN_ZOOM_OUT:string = 'battleZoomUut';

    public isPopUp:boolean = false;
    private _codeFreeze:boolean = true;//代码是否中途停止执行；
    private isPaletteIconState:boolean = false;

    private _zoomValue:number = 1;
    private _miniZoom:number;
    private _skipType:boolean;

    public btnCast:eui.Button; //运行代码
    public btnSubmit:eui.Button; //提交
    public btnDone:eui.Button; //完成
    private btnStory:eui.Button; //剧情
    private btnLayout:eui.Button;//字符显示或者大图标显示方法候选区
    private btnSetting:eui.Button; //设置按钮
    private btnUp:eui.Button; //指令区上翻页
    private btnDown:eui.Button; //指令区下翻页
    private speedx1Btn: eui.Button;
    private speedx2Btn: eui.Button;
    private zoominBtn: eui.Button;
    private zoomoutBtn: eui.Button;

    private btnRequest:eui.Button;//请求帮助
    private btnCheckReply:eui.Button;//查看老师回复
    private btnResponse:eui.Button;//老师回复学生
    private imgReply:eui.Image;//有新回复过来，图片亮起，提示可以查看老师回复
    public btnLock:eui.Button;
    private btnQuickReply:eui.Button;//一键回复正确的答案

    private pgbHp:eui.ProgressBar;//血条
    // private btnFullScreen:eui.ToggleButton;

    private goalPanel:GoalPanel;
    private _battleData:any;
    private _actionBox : ActionBox;//指令区
    private _userInfo:UserInfo;

    private _checkTipBox:eui.Image;//check指令执行时悬浮于界面的信息提示框

    private _requestTick:number = -60000;//记录点击求助的时间戳，避免过于频繁调用

    private maliPlatform:MaliPlatform;

    public constructor(data:any)
    {
        super();
        this.skinName = 'BattleSceneUISkin';
        this._battleData = data;
        this._userInfo = data['player_info'];

        //血条初始值
        this.updateHeroHp(100,100);
    }

    public set miniScale(val:number)
    {
        this._miniZoom = val;
    }

    public set codeFreeze(value:boolean)
    {
        this._codeFreeze = value;
    }

    public get codeFreeze():boolean
    {
        return this._codeFreeze;
    }

    public updateHeroHp(cur:number, max:number):void
    {
        this.pgbHp.maximum = max;
        this.pgbHp.value = cur;
    }

    protected childrenCreated():void
    {
        super.childrenCreated();

        this.maliPlatform = <MaliPlatform>(Platform.currentPlatform);
        this.btnLock.visible = this.maliPlatform.classTeacherId == this.maliPlatform.openUserId;
        this.btnLock.label = this.maliPlatform.classLockInfo.state == 1 ? '解锁班级' : '锁定班级';

        this.speedx1Btn.visible = true;
        this.speedx2Btn.visible = false;
        let mySelf:UserInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
        this.btnRequest.visible = this.btnCheckReply.visible = !mySelf.isTeacher;
        this.btnResponse.visible = mySelf.isTeacher && this._battleData['teach_info'];
        this.btnQuickReply.visible = mySelf.isTeacher && this._battleData['teach_info'];
        this.imgReply.visible = false;

        this.pgbHp.slideDuration = 0;
        this.pgbHp.maximum = 100;
        this.pgbHp.minimum = 0;

        this.btnCast.skinName = 'battleCastBtnSkin';
        this.btnCast.name = 'btnCast';
        this.btnSubmit.name = 'btnSubmit';
        this.btnDone.name = 'btnDone';
        this.btnStory.name = 'btnStory';
        this.btnLayout.name = 'btnLayout';
        this.btnSetting.name = 'btnSetting';
        this.btnUp.name = 'btnUp';
        this.btnDown.name = 'btnDown';
        this.speedx1Btn.name = 'speedx1Btn';
        this.speedx2Btn.name = 'speedx2Btn';
        this.zoominBtn.name = 'zoominBtn';
        this.zoomoutBtn.name = 'zoomoutBtn';
        this.btnRequest.name = 'btnRequest';
        this.btnCheckReply.name = 'btnCheckReply';
        this.btnResponse.name = 'btnResponse';
        this.btnLock.name = 'btnLock';
        this.btnQuickReply.name = 'btnQuickReply';

        this._actionBox = new ActionBox();
        this._actionBox.x = Globals.GAME_WIDTH * Globals.BATTLE_AREA_WIDTH_RATIO;
        this._actionBox.y = Globals.CODE_AREA_HEIGHT_RATIO * Globals.GAME_HEIGHT + 25;
        this.addChild(this._actionBox);
        this._actionBox.updatePalette(this.parseActionGroups(), this._userInfo.language);
        var layout:string = egret.localStorage.getItem('spellBoxLayout');
        var view:string = egret.localStorage.getItem('spellBoxView');
        this._actionBox.isCollapse = view === 'expand';
        this.isPaletteIconState = layout === 'txt';
        //this.onCollapse(null);
        this.onLayoutChanged(null);

        this.goalPanel = new GoalPanel();
        this.addChild(this.goalPanel);
        GoalManager.getInstance().init(parseInt(this._battleData['levelID']));

        this.btnSubmit.visible = false;
        this.btnDone.visible = false;//如果本关卡通过，则直接显示

        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onbtnClick, this);
        this.btnLayout.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onLayoutChanged, this);
        this.createCheckTipBox();

        //点击指令,输入代码
        this.addEventListener(ActionItem.ACTION_ITEM_CLICKED, (event:egret.TouchEvent)=>{
            let isLineWrap = false;
            let skillConfig = ConfigManager.getInstance().getConfigs('skill');
            var needLineWrap = [];
            for(var skillId in skillConfig)
            {
                if( skillConfig[skillId]['islinebreak'] == '1' ) {
                    needLineWrap.push( skillConfig[skillId]['snippet_' + this._userInfo.language] );
                }
            }
            if(-1 != needLineWrap.indexOf( event.data )) {
                isLineWrap = true;
                if(/\${/.test( event.data )) {
                    CodeWorkerManager.getUserThread().insertSnippet({'snippet': event.data});
                }
                else {
                    CodeWorkerManager.getUserThread().insertEditorText(event.data + '\n');
                }
            }
            else
            {
                if(/\${/.test( event.data )) {
                    CodeWorkerManager.getUserThread().insertSnippet({'snippet': event.data});
                }
                else {
                    CodeWorkerManager.getUserThread().insertEditorText(event.data);
                }
            }
        }, this, true);

        DataAccessManager.getAccess(DataAccessEntry.TEACH_SYSTEM_PROXY).
            addEventListener(TeachSystemProxy.REPLYS_COMPLETE, this.onReplys, this);
        DataAccessManager.getAccess(DataAccessEntry.TEACH_SYSTEM_PROXY).
            addEventListener('classLockStateChanged', this.onLockStateChanged, this);
    }

    public showGoalPatrol():void
    {
        this.goalPanel.patrolPanel();
    }

    private parseActionGroups():Object
    {
        let result:Object = {};
        
        let userInfo:UserInfo = this._userInfo;
        let effectiveEquipIds:number[] = userInfo.ownedHero.items;
        for (let id of effectiveEquipIds)
        {
            let equip:EquipInfo = userInfo.getEquipById(id);
            if (!equip)continue;
            if (!equip.data.skill || equip.data.skill.length < 5)continue;
            let skillIds:string[] = equip.data.skill.split('|');

            let actionBoxObj:Object = result[equip.data.ID] = {
                item:{},
                props:[],
                short:''
            };

            actionBoxObj['item']['name'] = equip.data.name;
            actionBoxObj['item']['imageURL'] = 'resource/icon/equip/' + equip.data.icon + '.png';

            for (let skillId of skillIds)
            {
                let skillData = ConfigManager.getInstance().getConfig('skill', parseInt(skillId));
                if (!skillData)continue;
                let prop:Object = {
                    shortName:skillData['fullname'], //hero.moveDown()
                    short_name:skillData['shortname'],//Down
                    name:skillData['type'], //moveDown
                    short_description:skillData['description'],
                    short_example:skillData['example'],
                    snippets:{},
                    icon:'resource/icon/action/' + skillData['icon'] + '_normal.png',
                    type:'function',
                    owner:'hero'
                };
                actionBoxObj['props'].push(prop);

                let tpl:string = RES.getRes('SimplePaletteTip_tpl');
                let initialHTML:string = _.template(tpl)({
                    doc: prop,
                    marked: marked,
                    docName: 'docName',
                    selectedMethod: null,//skillData['type'],
                    language:'python',
                    writable:false,
                    argumentExamples:['a', 'b']
                });

                prop['initialHTML'] = initialHTML;
            }
        }

        return result;
    }

    //函数候选区以icon或者文本形式显示
    private onLayoutChanged(event:egret.TouchEvent):void
    {
        this.isPaletteIconState = !this.isPaletteIconState;
        this.btnLayout.skinName = this.isPaletteIconState ? 'LayoutIconButtonSkin' : 'LayoutTxtButtonSkin';
        //this.paletteBox.setIconState(this.isPaletteIconState ? 'icon' : 'txt');
        var numColumn:number = this._actionBox.isCollapse ? 2 : 4;
        this.isPaletteIconState ? this._actionBox.iconLayout(numColumn) : this._actionBox.charLayout(numColumn);
        this._actionBox.setIconState(this.isPaletteIconState ? 'icon' : 'txt');
    }

    private onEnterCreateRolePopup(e:egret.TouchEvent):void
    {
        SceneManager.getInstance().popScene();
        LayerManager.stage.removeEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterCreateRolePopup, this);
        WindowManager.showWindow(CreateRoleWindow, 'CreateRoleWindow');
    }

    private onbtnClick(event:egret.TouchEvent):void
    {
        switch (event.target.name)
        {
            case "btnCast":
            {
                SoundManager.getInstance().playEffect('u11_run_mp3');
                let effectiveLine:number = CodeWorkerManager.getUserThread().getEffectiveCodeLine();
                if (effectiveLine < 1)break;                                                                            //没有输入代码，不能运行
                this.btnCast.label = this.codeFreeze ? 'RUN' : 'STOP';
                this.codeFreeze = !this.codeFreeze;
                this.btnDone.visible = false;
                this.btnCast.skinName = this.codeFreeze ? 'battleCastBtnSkin' : 'battlePauseBtnSkin';
                this.goalPanel.collapsePanel();
                this.dispatchEvent(new egret.Event(BattleSceneUI.RUN_TOUCH_TAP));
                break;
            }
            case "btnSetting":
            {
                WindowManager.showWindow(BattleSettingWindow, 'BattleSettingWindow', '', this._battleData);
                document.getElementById('code-area').style.display = 'none';
                break;
            }
            case "btnSubmit":
            {
                break;
            }
            case "btnDone"://代码运行完成
            {
                if (parseInt(this._battleData['levelID']) == 110000)//引导关卡
                {
                    egret.localStorage.setItem("guide_state", NetManager.getInstance().userName + "|yes");
                    LayerManager.stage.addEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterCreateRolePopup, this);
                    UIPopupLoading.startPopupLoading(["hero"]);
                    break;
                }
                WindowManager.showWindow(BattleResultWindow, 'BattleResultWindow', '', this._battleData);
                document.getElementById('code-area').style.display = 'none';
                // SceneManager.getInstance().popScene();
                break;
            }
            case "btnStory":
            {
                WindowManager.showWindow(BattleTipWindow, "BattleTipWindow");
                document.getElementById('code-area').style.display = 'none';
                break;
            }
            case "btnLayout":
            {
                break;
            }
            case "btnUp":
            {
                this._actionBox.updateContentPosition(-100);
                break;
            }
            case "btnDown":
            {
                this._actionBox.updateContentPosition(100);
                break;
            }
            case "speedx1Btn":
            {
                this.speedx1Btn.visible = false;
                this.speedx2Btn.visible = true;
                TweenLiteDriver.setFps(60);
                break;
            }
            case "speedx2Btn":
            {
                this.speedx2Btn.visible = false;
                this.speedx1Btn.visible = true;
                TweenLiteDriver.setFps(30);
                break;
            }
            case "zoominBtn":
            {
                this._zoomValue = this._zoomValue + 0.2;
                this.zoomoutBtn.$setEnabled(true);
                if(this._zoomValue>=3)
                {
                    this._zoomValue = 3;
                    this.zoominBtn.$setEnabled(false);
                }
                this.dispatchEvent(new egret.Event(BattleSceneUI.BTN_ZOOM_IN,false,false,this._zoomValue));
                break;
            }
            case "zoomoutBtn":
            {
                this._zoomValue = this._zoomValue - 0.2;
                this.zoominBtn.$setEnabled(true);
                if(this._zoomValue<=this._miniZoom){
                    this._zoomValue = this._miniZoom;
                    this.zoomoutBtn.$setEnabled(false);
                }
                this.dispatchEvent(new egret.Event(BattleSceneUI.BTN_ZOOM_OUT,false,false,this._zoomValue));
                break;
            }
            case "btnRequest"://for stu
            {
                this.handleAskHelp();
                break;
            }
            case "btnResponse": //for teacher
            {
                this.handleReplyQuestion();
                break;
            }
            case "btnCheckReply"://for stu
            {
                WindowManager.showWindow(ReplyListWindow, 'ReplyListWindow', '', this._battleData);
                document.getElementById('code-area').style.display = 'none';
                this.imgReply.visible = false;
                break;
            }
            case 'btnLock'://锁定当前老师所在的班级
            {
                let maliPlatform:MaliPlatform = this.maliPlatform;
                NetManager.getInstance().callServerSocket(Protocols.ROUTE_LOCK_CLASS, {
                    classId:maliPlatform.classId,
                    lock:maliPlatform.classLockInfo.state == 1 ? 0 : 1,
                    teacherId:maliPlatform.classTeacherId,
                    levelId:this._battleData.levelID
                });
                break;
            }
            case 'btnQuickReply':
            {
                this.handleQuickReplyQuestion();
                break;
            }
        }
    }

    private handleAskHelp():void
    {
        let mySelf:UserInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
        if(!mySelf.isStudent) {
            Alert.show('提示', '您得先注册，找到老师，加入一个班级，然后再提问！', 2)
            return
        }
        let curTick:number = egret.getTimer();
        if (curTick - this._requestTick < 60000)//一分钟只能求助一次
        {
            // this._requestTick = curTick;
            Alert.show('提示', '一分钟只能请求一次，先耐心研究一下吧，加油！', 2);
            return;
        }
        let alert:Alert = Alert.show('提示','确认发送请求？');
        alert.once('confirm', ()=>{
            console.log('confirm', this._userInfo)
            this._requestTick = curTick;
            let msg:Object = {
                teacherid: this._userInfo.teacherId,
                classname: this._userInfo.className,
                storyid: parseInt(this._battleData['levelID']),
                code: CodeWorkerManager.getUserThread().getEditorText(),
                student_mail: Platform.currentPlatform.platformAccount
            };
            NetManager.getInstance().callServerSocket(Protocols.ROUTE_ASKQUESTION, msg);
        }, this);
    }

    private handleReplyQuestion():void
    {
        let alert:Alert = Alert.show('提示','您确认发送当前编辑的答案么？');
        alert.once('confirm', ()=>{

            let requestMsg:QuestionMessage = this._battleData['teach_info'];
            let message:Object = {
                studentid: requestMsg.from,
                storyid: parseInt(this._battleData['levelID']),
                code: CodeWorkerManager.getUserThread().getEditorText(),
                id: requestMsg.uuid
            };
            NetManager.getInstance().callServerSocket(Protocols.ROUTE_REPLYQUESTION, message);

        }, this);
    }

    private handleQuickReplyQuestion():void
    {
        let alert:Alert = Alert.show('提示','您确认发送标准答案么？');
        alert.once('confirm', ()=>{

            let requestMsg:QuestionMessage = this._battleData['teach_info'];
            let message:Object = {
                studentid: requestMsg.from,
                storyid: parseInt(this._battleData['levelID']),
                code: RES.getRes(this._battleData['levelID'] + "_answer_txt"),
                id: requestMsg.uuid
            };
            NetManager.getInstance().callServerSocket(Protocols.ROUTE_REPLYQUESTION, message);

        }, this);
    }

    private onReplys(event:egret.Event):void
    {
        if (event.data.length > 0)
            this.imgReply.visible = true;
    }

    private onLockStateChanged(event:egret.Event):void
    {
        let classLockInfo:ClassLockInfo = event.data;
        this.btnLock.label = classLockInfo.state == 1 ? '解锁班级' : '锁定班级';
    }

    /**
     * 代码执行完
     */
    public codeDone():void
    {
        if (!this._battleData['teach_info'])
            this.btnDone.visible = GoalManager.getInstance().win;
        this.btnCast.label = 'RUN';
        this.btnCast.skinName = 'battleCastBtnSkin';
        this.codeFreeze = true;
        this.goalPanel.expandPanel();
    }

    public dispose():void
    {
        this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onbtnClick, this);
        this.btnLayout.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onLayoutChanged, this);
        GoalManager.getInstance().dispose();
        TweenLiteDriver.setFps(30);
        DataAccessManager.getAccess(DataAccessEntry.TEACH_SYSTEM_PROXY).
            removeEventListener(TeachSystemProxy.REPLYS_COMPLETE, this.onReplys, this);
        DataAccessManager.getAccess(DataAccessEntry.TEACH_SYSTEM_PROXY).
            removeEventListener('classLockStateChanged', this.onLockStateChanged, this);
    }

    private createCheckTipBox():void
    {
        this._checkTipBox = new eui.Image();
        this.addChild(this._checkTipBox);
        this._checkTipBox.visible = false;
    }

    private onEnterPopup(e:egret.TouchEvent):void
    {
        LayerManager.stage.removeEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterPopup, this);
        let explore_win = WindowManager.showWindow( ExploreWindow, "ExploreWindow", "地图界面" );
        // NetManager.getInstance().callServerSocket(NetManager.ROUTE_GETSTORYINFO);
        console.log('explore update view');
        explore_win['updateView']();

        //判断下一关是否在当前地图的关卡列表中
        let isSameChapter = explore_win['isLevelInChapter'](this._battleData['next_level']);
        if(!isSameChapter)//下一关是下一张地图的关卡
        {
            //下一关其实不存在,说明已经打完所有地图的所有关卡,已经不存在可玩下一关.此时不能再跳转,应该回到当前地图界面
            if(!this._battleData['next_level'])
            {
                //explore_win.show
            }
            else
            {
                explore_win['gotoNextChapter']();
                this.showBadgeTipWindow();
            }
        }
        else
        {
            //下一关其实不存在,说明已经打完所有地图的所有关卡,已经不存在可玩下一关.此时不能再跳转,应该回到当前地图界面
            if(!this._battleData['next_level'])
            {
                //explore_win.show
            }
            else
            {
                //需要先判断是否在同一组中
                let currLevelId = this._battleData['levelID'];
                let nextLevelId = this._battleData['next_level'];

                let isInSameGroup = explore_win['isInSameGroup'](currLevelId, nextLevelId);
                let groupId = explore_win['findLevelGroupId']( nextLevelId );
                //在同一组
                if(isInSameGroup)
                {
                    if(BattleResultWindow.SKIP_NEXT_LEVEL == this._skipType) //下一关 -> 装备界面
                    {
                        let equip_win = WindowManager.showWindow( EquipWindow, 'EquipWindow', '装备界面');
                        equip_win['setData']( explore_win['groups_info'][groupId]['levels'][nextLevelId] );
                        equip_win['updateView']();
                    }
                    else
                    {
                        explore_win['showGroupPanel']( groupId );
                    }
                }
                else
                {
                    //不在同一组,无需再做多余的操作
                }
                this.showBadgeTipWindow();
            }
        }
    }

    /**
     * 根据跳转的类型:下一关,继续(就两种),实现跳转到指定界面的效果
     * @param {boolean} skipType 跳转类型,SKIP_NEXT_LEVEL, SKIP_CONITNUE
     */
    public skip(skipType:boolean = true)
    {
        //请求关卡信息
        this._skipType = skipType;
        LayerManager.stage.addEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterPopup, this);
        UIPopupLoading.startPopupLoading(["explore","equip"]);
    }

    //弹出获得徽章的界面
    private showBadgeTipWindow():void
    {
        if (Globals.badgeAwardInfo)
        {
            WindowManager.showWindow(BadgeTipWindow, 'BadgeTipWindow', '', Globals.badgeAwardInfo);
        }
    }
    
    public showCheckTip(targetSceneItem:SceneItem):void
    {
        this._checkTipBox.visible = true;
        let sceneItemData:Object = targetSceneItem.getData();
        RES.getResByUrl('resource/icon/checkicon/check_' +　sceneItemData['id'] + '.png', (data:egret.Texture, url:string)=>{
            this._checkTipBox.source = data;
            this._checkTipBox.x = (Globals.GAME_WIDTH * Globals.BATTLE_AREA_WIDTH_RATIO - data.bitmapData.width) * 0.5;
            this._checkTipBox.y = (Globals.GAME_HEIGHT - data.bitmapData.height) * 0.5;
        }, this, ResourceItem.TYPE_IMAGE);
    }

    public hideCheckTip():void
    {
        this._checkTipBox.visible = false;
    }
}