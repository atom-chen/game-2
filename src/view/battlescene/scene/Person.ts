/**
 * Created by sam on 2016/11/24.
 * 包含英雄,NPC,怪物和自然生物，即可以释放技能的单位
 */
import {Turn, default as SceneObject} from "./SceneObject";
import IArmatureDisplay = dragonBones.IArmatureDisplay;
import AnimationState = dragonBones.AnimationState;
import ConfigManager from "../../../manager/ConfigManager";
import PersonInfo from "../../../model/battle/PersonInfo";
import PersonTeams from "../../../enums/PersonTeams";
import SceneMoveObject from "./SceneMoveObject";
import AIInfo from "../../../model/battle/AIInfo";
import PointUtil from "../../../base/math/PointUtil";
import BuffInfo from "../../../model/battle/BuffInfo";
import Hero from "./Hero";
import {Status} from "./SceneMoveObject";
import PersonTypes from "../../../enums/PersonTypes";
import SoundManager from "../../../manager/SoundManager";
import FrameTweenLite from "../../../base/utils/FrameTweenLite";
import Timeout from "../../../base/utils/Timeout";

export default class Person extends SceneMoveObject {
    protected _floorTimer: number = 0;             //本地的时钟，整数，每秒刷新一次
    private _skillCD: Object;                     //技能cd时间
    private _focusTarget: Person;                 //当前角色攻击目标
    private _batterData: PersonInfo;              //战斗相关的数值
    protected _attackRange: number = 1;          //普通攻击范围，决定玩家离怪多远停下来
    protected _birthPoint: egret.Point = new egret.Point(0, 0);          //普通攻击范围，决定玩家离怪多远停下来
    private _onControl: boolean = false;         //是否被指令控制
    private _AIList: AIInfo[];
    private _BuffList: BuffInfo[];
    private _buildIndex = 0;
    private _storyID = 0;
    private _isRotating = 0;
    protected _hpbg:egret.Bitmap;
    protected _hpbar:egret.Bitmap;
    protected _hptext:egret.TextField;
    private _birthTimer: number = -1;

    public constructor() {
        super();
    }

    public get birthPoint(): egret.Point {
        return this._birthPoint;
    }

    public set birthPoint(pt: egret.Point) {
        this._birthPoint = pt;
    }

    public get onControl(): boolean {
        return this._onControl;
    }

    public set onControl(ct: boolean) {
        this._onControl = ct;
    }

    public get batterData(): PersonInfo {
        return this._batterData;
    }

    public set batterData(dat: PersonInfo) {
        this._batterData = dat;
    }

    public birth(): void {
        this.batterData.hp = 0;
        let that = this;
        let state: AnimationState = this._animation.play("born", 1);
        Timeout.setTimeout(function () {
            if(that.batterData) that.batterData.hp = that.batterData.maxhp;
        }, this, state.animationData.duration * 1000);
    }

    public setData(dat: any): void {
        this.batterData = new PersonInfo(dat);
        this._baseAttackRange = Math.max(1,this.batterData.viewrange-1);
        if (this.batterData.attackID > 0) {
            var skillCFG: any = ConfigManager.getInstance().getConfig("skill", this.batterData.attackID);
            this._attackRange = Math.max(1, Number(skillCFG['atkrange']));
        }
        this._skillCD = {};
        super.setData(dat);
        this._BuffList = [];
        this._AIList = [];
        this._isRotating = Number(dat['isrotating']);

        this._hpbg = new egret.Bitmap();
        this._hpbar = new egret.Bitmap();
        if(this.batterData.team == PersonTeams.FRIEND)
        {
            this._hpbg.texture = RES.getRes("hp_blue_bg_png");
            this._hpbar.texture = RES.getRes("hp_blue_png");
        }
        else if(this.batterData.team == PersonTeams.NEUTRAL || this.batterData.team == PersonTeams.GOODMAN)
        {
            this._hpbg.texture = RES.getRes("hp_green_bg_png");
            this._hpbar.texture = RES.getRes("hp_green_png");
        }else{
            this._hpbg.texture = RES.getRes("hp_red_bg_png");
            this._hpbar.texture = RES.getRes("hp_red_png");
        }
        this._hpbg.x = -36;
        this._hpbg.y= -135;
        this.addChild(this._hpbg);
        this._hpbar.x = -24;
        this._hpbar.y = -125;
        this.addChild(this._hpbar);

        this._hptext = new egret.TextField();
        this._hptext.textColor = 0xffffff;
        this._hptext.width = 120;
        this._hptext.textAlign = "center";
        this._hptext.text = name;
        this._hptext.size = 7;
        this._hptext.x = -57;
        this._hptext.y = -132;
        this.addChild(this._hptext);
        this._hptext.text = this.batterData.hp+"/"+this.batterData.maxhp;

        this._hpbg.visible = false;
        this._hpbar.visible = false;
        this._hptext.visible = false;

        if(Number(dat.hero_rotation)==3) this._display.scaleX = 1;
        else this._display.scaleX = -1;
    }

    /**
     *
     */
    public dispose():void
    {
        super.dispose();
        this.removeChild(this._hpbg);
        this._hpbg.texture.dispose();
        this._hpbg = null;
        this.removeChild(this._hpbar);
        this._hpbar.texture.dispose();
        this._hpbar = null;
        this.removeChild(this._hptext);
        this._hptext = null;
        this._focusTarget = null;
        this._AIList = null;
        this._BuffList = null;
        this._batterData = null;
        this._skillCD = null;
    }

    public get attackRange():number
    {
        return this._attackRange;
    }

    /**
     *重置AI
     */
    public initAI(): void {
        this._AIList = [];
        if (this._data['ai'] && this._data['ai'].length > 0) {
            var ids: string[] = this._data['ai'].split("|");
            for (var i = 0; i < ids.length; i++) {
                if (Number(ids[i]) > 0) {
                    var ai: AIInfo = new AIInfo(0,ConfigManager.getInstance().getConfig("ai", Number(ids[i])));
                    this._AIList.push(ai);
                }
            }
        }
    }

    /**
     * 重置角色
     */
    public restart(): void {
        super.restart();
        this._focusTarget = null;
        this._floorTimer = 0;
        this.batterData.hp = this.batterData.maxhp;
        this.batterData.mp = 0;
        this.batterData.sayhi = Number(this._data['sayhi']);
        this.position = this.birthPoint;
        this.speed = this.baseSpeed;
        this.initAI();
        this._BuffList = [];
        this._skillCD = {};
        this._storyID = 0;
        this._buildIndex = 0;
        this._hpbar.scaleX = 1;
        this._hptext.text = this.batterData.hp+"/"+this.batterData.maxhp;
        this._hpbg.visible = false;
        this._hpbar.visible = false;
        this._hptext.visible = false;
    }

    public turnUp(): void {
        if (this._turn == Turn.UP) return;
        super.turnUp();
        this._animation.play('move_fore', 0);
    }

    public turnDown(): void {
        if (this._turn == Turn.DOWN) return;
        super.turnDown();
        this._animation.play('move_back', 0);
    }

    public turnLeft(): void {
        if (this._turn == Turn.LEFT) return;
        super.turnLeft();
        if(this._isRotating>0) this._display.scaleX = 1;
        this._animation.play('move_side', 0);
    }

    public turnRight(): void {
        if (this._turn == Turn.RIGHT) return;
        super.turnRight();
        if(this._isRotating>0) this._display.scaleX = -1;
        this._animation.play('move_side', 0);
    }

    public turnLeftUp(): void {
        if (this._turn == Turn.LEFTUP) return;
        super.turnUp();
        if(this._isRotating>0) this._display.scaleX = 1;
        this._animation.play('move_sideb', 0);
    }

    public turnRightUp(): void {
        if (this._turn == Turn.RIGHTUP) return;
        super.turnUp();
        if(this._isRotating>0) this._display.scaleX = -1;
        this._animation.play('move_sideb', 0);
    }

    public turnLeftDown(): void {
        if (this._turn == Turn.LEFTDOWN) return;
        super.turnDown();
        if(this._isRotating>0) this._display.scaleX = 1;
        this._animation.play('move_right', 0);
    }

    public turnRightDown(): void {
        if (this._turn == Turn.RIGHTDOWN) return;
        super.turnDown();
        if(this._isRotating>0) this._display.scaleX = -1;
        this._animation.play('move_right', 0);
    }

    private addBuffCFG(buff: BuffInfo): void {
        if (buff.delayTime > 0) {
            buff.overTime = Math.floor(this._timer) + buff.delayTime;
            this._BuffList.push(buff);
            if (buff.speed > 0) this.speed = this.speed + this.baseSpeed * (buff.speed - 1);
            if (buff.attack_add > 0) this.batterData.attack_add = this.batterData.attack_add + buff.attack_add;
            if (buff.safe_range > 0) this.batterData.safeRange = this.batterData.safeRange + buff.safe_range;
            if (buff.hurt_cut > 0) this.batterData.hurt_cut = this.batterData.hurt_cut + buff.hurt_cut;
        } else if (buff.delayTime == 0) {
            if (buff.hp > 0) this.hurt(-buff.hp);
        } else {
            this._BuffList.push(buff);
            if (buff.speed > 0) this.speed = this.speed + this.baseSpeed * (buff.speed - 1);
            if (buff.attack_add > 0) this.batterData.attack_add = this.batterData.attack_add + buff.attack_add;
        }
        this._hpbar.scaleX = Math.min(1,this.batterData.hp/this.batterData.maxhp);
        this._hptext.text = this.batterData.hp+"/"+this.batterData.maxhp;
    }

    public addBuff(buffID: number): void {
        this.addBuffCFG(new BuffInfo(ConfigManager.getInstance().getConfig("buff", buffID)));
    }

    private updateBuff(): void {
        for (var i = 0; i < this._BuffList.length; i++) {
            if (this._BuffList[i].isOver == false && this._BuffList[i].overTime - Math.floor(this._timer) >= 0) {
                this._BuffList[i].isOver = true;
                if (this._BuffList[i].speed > 0) this.speed = this.speed / this._BuffList[i].speed;
                if (this._BuffList[i].attack_add > 0) this.speed = this.batterData.attack_add - this._BuffList[i].attack_add;
                if (this._BuffList[i].safe_range > 0) this.batterData.safeRange = this.batterData.safeRange - this._BuffList[i].safe_range;
                if (this._BuffList[i].hurt_cut > 0) this.batterData.hurt_cut = this.batterData.hurt_cut - this._BuffList[i].hurt_cut;
            }
        }
        this._hpbar.scaleX = Math.min(1,this.batterData.hp/this.batterData.maxhp);
        this._hptext.text = this.batterData.hp+"/"+this.batterData.maxhp;
    }

    /**
     * 释放技能
     * @param name 技能名称
     * @param pt 攻击对象
     */
    public playSkillByName(name: string, pt: egret.Point): void
    {
        this.playSkill(ConfigManager.getInstance().getIDByName("skill", name), pt);
    }

    /**
     * 释放shield技能
     * @param time 持续的时间
     */
    public shieldAction(time: number, skillID: number): void {
        if (this.batterData.hp < 1 && skillID > 0 && this._skillCD[skillID] && this._skillCD[skillID] > this._timer) {
            this.dispatchEvent(new egret.Event(SceneMoveObject.HERO_ANIMATION_FINISH));
            return;
        }
        var skillCFG: any = ConfigManager.getInstance().getConfig("skill", skillID);
        var oldState: boolean = this.onControl;
        this.onControl = true;
        this._animation.play(skillCFG['skill_action'], -1);
        if (Number(skillCFG['buff']) > 0) {
            var buff: BuffInfo = new BuffInfo(ConfigManager.getInstance().getConfig("buff", Number(skillCFG['buff'])));
            buff.delayTime = time;
            this.addBuffCFG(buff);
        }
        FrameTweenLite.delayedCall(time, function () {
            this.dispatchEvent(new egret.Event(SceneMoveObject.HERO_ANIMATION_FINISH));
            this.onControl = oldState;
            this.idle();
        });
    }

    /**
     * 冲击
     * @param logicPos 目标格子
     */
    public dashAction(logicPos: egret.Point): void
    {
        this._dashed = true;
        this.speed = this.speed * 2;
        this.moveTo(logicPos);
    }

    /**
     * 释放技能
     * @param skillID 技能ID
     * @param pt 攻击对象坐标
     * @param buildID build对象
     */
    public playSkill(skillID: number, pt: egret.Point): void
    {
        if (skillID<1||this.batterData.hp < 1 || (skillID > 0 && this._skillCD[skillID] && this._skillCD[skillID] > this._timer))
        {
            if(this instanceof Hero) this.say("技能还不能施放");
            this.dispatchEvent(new egret.Event(SceneMoveObject.HERO_ANIMATION_FINISH));
            return;
        }
        if (pt.x > this.logicPosition.x) this._display.scaleX = -1;
        else this._display.scaleX = 1;
        var skillCFG: any = ConfigManager.getInstance().getConfig("skill", skillID);
        let that = this;
        if (this.sceneType == PersonTypes.BOMB) pt = this.logicPosition;
        if (skillCFG['s_sound'].length > 1) SoundManager.getInstance().playAsyncEffect(skillCFG['s_sound']);
        if (skillCFG['skill_type'] == "build")
        {
            this.playBuildSkill(pt, skillCFG);
        }
        else
        {
            this.playCommonSkill(pt, skillCFG, skillID);
        }
    }

    private playBuildSkill(pt:egret.Point, skillCFG:Object):void
    {
        let state: AnimationState = this._animation.play(skillCFG['skill_action'], -1);
        Timeout.setTimeout(()=> {
            this.dispatchEvent(new egret.Event(SceneMoveObject.HERO_ANIMATION_FINISH));
        }, this, state.animationData.duration * 1000);
        var builds: string[] = skillCFG['build_id'].split("|");
        var buildIDs:string = builds[0];
        if (builds.length > 1) buildIDs = builds[Math.floor(Math.random() * builds.length)];
        builds = buildIDs.split(",");
        for (var i = 0; i < builds.length; i++)
        {
            var buildID:number = Number(builds[i]);
            if (Number(skillCFG['dmgrange']) > 0)
            {
                pt.x = pt.x + Math.floor(Math.random() * Number(skillCFG['dmgrange']));
                pt.y = pt.y + Math.floor(Math.random() * Number(skillCFG['dmgrange']));
            }
            this._buildIndex = this._buildIndex + 1;
            let showName: string = skillCFG['build_name'] + "_" + this._buildIndex;
            let trueName: string = showName;
            if (skillCFG['build_name'].length <= 1)
            {
                showName = "";
                trueName = this.name + "_" + this._buildIndex;
            }
            if (buildID >= 50000)
            {
                var person: Person = this.gameWorld.addPerson(buildID, trueName, showName, PointUtil.getInstance().logicToPosition(pt).x, PointUtil.getInstance().logicToPosition(pt).y);
                if (buildID == 50000) person.birth();                              //地雷，创建时开启倒计时.
                person.initAI();
                this.gameWorld.buildObjects.push(person);
            }
            else if (buildID >= 40000)
            {
                this.gameWorld.buildObjects.push(this.gameWorld.addItem(buildID, trueName, showName, PointUtil.getInstance().logicToPosition(pt).x, PointUtil.getInstance().logicToPosition(pt).y))
            }
        }
        this.gameWorld.updateDepth();
    }

    private playCommonSkill(pt:egret.Point, skillCFG:Object, skillID:number):void
    {
        let state: AnimationState;
        if (this instanceof Hero && this.batterData.attackID == skillID && Math.random() > 0.5)
        {
            if (this.logicPosition.y < pt.y) state = this._animation.play(skillCFG['skill_action'] + "2", -1);
            else state = this._animation.play(skillCFG['skill_action'] + "2_b", -1);
        }
        else
        {
            if (this.logicPosition.y < pt.y) state = this._animation.play(skillCFG['skill_action'], -1);
            else state = this._animation.play(skillCFG['skill_action'] + "_b", -1);
        }
        Timeout.setTimeout(() => {
            this.dispatchEvent(new egret.Event(SceneMoveObject.HERO_ANIMATION_FINISH));
        }, this, state.animationData.duration * 1000);

        var targets: Person[] = [];
        this._skillCD[skillID] = this._timer + Number(skillCFG['cd'])/1000;
        var alltargets: Person[] = this.gameWorld.findPersonsByRange(pt, skillCFG['dmgrange']);                                                                                           //伤害产生AOE类技能
        var dmftype: number = Number(skillCFG['dmgtype']);
        for (var i = 0; i < alltargets.length; i++)
        {
            if(alltargets[i].batterData.hp > 0)
            {
                if (alltargets[i]!=this||this.sceneType == PersonTypes.BOMB)
                {
                    if (dmftype == 3 || alltargets[i].batterData.team == dmftype) targets.push(alltargets[i]);
                }
            }
        }
        if (skillCFG['s_effect'].length > 1) this.gameWorld.createEffect(0.3, skillCFG['s_effect'], this.position);                                                                      //播放技能释放动作
        var needTime: number = 0;
        if (skillCFG['m_effect'].length > 1) needTime = this.gameWorld.createParticleEffect(skillCFG['m_effect'], this.position, PointUtil.getInstance().logicToPosition(pt));           //播放技能过程动作
        needTime = needTime + Number(skillCFG['e_holdtime']);
        var _that = this;
        FrameTweenLite.delayedCall(needTime,  ()=> {
            for (var i = 0; i < targets.length; i++) {
                if (skillCFG['e_effect'].length > 1)                                                                                                                                     //播放技能受击动作
                {
                    _that.gameWorld.createEffect(needTime, skillCFG['e_effect'], _that.gameWorld.getSceneObjectByName(targets[i].name).position);
                }
            }
        });
        var hurtNumber: number = this.batterData.attack_base + this.batterData.attack_add + Number(skillCFG['atkdamage']);
        if (hurtNumber != 0) {
            FrameTweenLite.delayedCall(needTime, ()=> {
                for (var i = 0; i < targets.length; i++) {
                    if (targets[i].batterData.hp > 0 && targets[i].sceneType == PersonTypes.BOMB) targets[i].playAttack(targets[i].logicPosition);
                    targets[i].hurt(hurtNumber);
                    if (skillCFG['buff'].length > 0) {
                        var buffs: string[] = skillCFG['buff'].split("|");
                        for (var j = 0; j < buffs.length; j++) {
                            if (Number(buffs[j]) > 0) targets[i].addBuff(Number(buffs[j]));
                        }
                    }
                }
            });
        }
    }

    public getStoryID(): number
    {
        return this._storyID;
    }

    /**
     * 播放剧情对话（龙柱）
     * @param id story id
     */
    public playStory(id: number): void
    {
        this._storyID = id;
        if (id <= 0) {
            if (id == -1) {
                this.batterData.hp = 0;
                this.die();
            }
            return;
        }
        var storyCFG: any = ConfigManager.getInstance().getConfig("story", id);
        var that = this;
        if (Number(storyCFG['delay_time']) > 0) {
            FrameTweenLite.delayedCall(Number(storyCFG['delay_time']), function () {
                var keys: string[] = storyCFG['next'].split("|");
                for (var i = 0; i < keys.length; i++) {
                    if (Number(keys[i]) > 0) that.playStory(Number(keys[i]));
                }
            });
        }
        this.playEvent(storyCFG['event']);
        this.say(storyCFG['content']);
    }

    public playEvent(val: string): void
    {
        var that = this;
        var events: string[] = val.split("|");
        for (var i = 0; i < events.length; i++) {
            if (Number(events[i]) > 0) {
                var eventCFG: any = ConfigManager.getInstance().getConfig("event", Number(events[i]));
                if (Number(eventCFG['ai']) > 0) {
                    if (Number(eventCFG['delay_time']) > 0) {
                        FrameTweenLite.delayedCall(Number(eventCFG['delay_time']), function () {
                            var ai: AIInfo = new AIInfo(that._timer,ConfigManager.getInstance().getConfig("ai", Number(eventCFG['ai'])));
                            if (ai.type==1 && ai.focusName.length > 1) ai.endPoint = that.gameWorld.getSceneObjectByName(ai.focusName).logicPosition;
                            that._AIList.push(ai);
                        });
                    } else {
                        var ai: AIInfo = new AIInfo(that._timer,ConfigManager.getInstance().getConfig("ai", Number(eventCFG['ai'])));
                        if (ai.type==1 && ai.focusName.length > 1) ai.endPoint = that.gameWorld.getSceneObjectByName(ai.focusName).logicPosition;
                        that._AIList.push(ai);
                    }
                } else if (Number(eventCFG['skill']) > 0) {
                    if (Number(eventCFG['delay_time']) > 0) {
                        FrameTweenLite.delayedCall(Number(eventCFG['delay_time']), function () {
                            if(eventCFG['npc'].length>1) that.playSkill(Number(eventCFG['skill']), that.gameWorld.getSceneObjectByName(eventCFG['npc']).logicPosition);
                            else that.playSkill(Number(eventCFG['skill']), that.logicPosition);
                        });
                    } else{
                        if(eventCFG['npc'].length>1) that.playSkill(Number(eventCFG['skill']), that.gameWorld.getSceneObjectByName(eventCFG['npc']).logicPosition);
                        else that.playSkill(Number(eventCFG['skill']), that.logicPosition);
                    }
                } else if (eventCFG['action'].length > 1) {
                    var ps: Person = <Person>(that.gameWorld.getSceneObjectByName(eventCFG['npc']));
                    ps.animation.play(eventCFG['action'], -1);
                }
                if (eventCFG['kill'].length > 1) {
                    if (Number(eventCFG['delay_time']) > 0) {
                        FrameTweenLite.delayedCall(Number(eventCFG['delay_time']), function () {
                            if (eventCFG['kill'] == "self") {
                                that.batterData.hp = 0;
                                that.die();
                            } else {
                                var ps: Person = <Person>(that.gameWorld.getSceneObjectByName(eventCFG['kill']));
                                ps.batterData.hp = 0;
                                ps.die();
                            }
                        });
                    }else{
                        if (eventCFG['kill'] == "self") {
                            that.batterData.hp = 0;
                            that.die();
                        } else {
                            var ps: Person = <Person>(that.gameWorld.getSceneObjectByName(eventCFG['kill']));
                            ps.batterData.hp = 0;
                            ps.die();
                        }
                    }
                }
            }
        }
    }

    /**
     * 检查响应剧情对话（龙柱）
     */
    public checkStory(words:string):boolean
    {
        var storyCFG:any = ConfigManager.getInstance().getConfig("story",this._storyID);
        if(storyCFG['answer'].length>1) {
            var answers: string[] = storyCFG['answer'].split("|");
            var nexts: string[] = storyCFG['next'].split("|");
            for (var i = 0; i < answers.length; i++) {
                if(answers[i]=="qitade"){
                    this.playStory(Number(nexts[i]));
                }else if (answers[i].length > 0) {
                    var keys: string[] = answers[i].split(",");
                    for(var j = 0; j < keys.length; j++) {
                        if (keys[j].length > 0) {
                            if (words.indexOf(keys[j]) >= 0) {
                                this.playStory(Number(nexts[i]));
                                return true;
                            }else if(keys[j]=="NUM"){
                                var n = parseInt(words);
                                if (!isNaN(n))
                                {
                                    this.playStory(Number(storyCFG['next']));
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * 核验某个技能的CD是否结束。
     * @param skillType {string}, 如lightning-bolt
     * @returns {boolean}
     */
    public checkSkillReady(skillType:string):boolean
    {
        let skillId:number = ConfigManager.getInstance().getSkillIdByType(skillType);
        if (this._skillCD[skillId] === void 0 || this._skillCD[skillId] == null)return true;
        return this._skillCD[skillId] - this._timer <= 0;
    }

    /**
     * 播放攻击动作
     */
    public playAttack(pt:egret.Point):void
    {
        this.playSkill(this.batterData.attackID,pt);
    }

    /**
     * 受击
     */
    public hurt(value:number):void
    {
        if(this.batterData.hurt_cut>0) value = Math.max(1,value-this.batterData.hurt_cut);//
        this.batterData.hp = Math.min(this.batterData.maxhp,Math.max(0,this.batterData.hp - value));
        this._hpbar.scaleX = Math.min(1,this.batterData.hp/this.batterData.maxhp);
        this._hptext.text = this.batterData.hp+"/"+this.batterData.maxhp;
        if(this.batterData.hp<=0)
        {
            this._hpbg.visible = false;
            this._hpbar.visible = false;
            this._hptext.visible = false;
        }else if(this._hpbg.visible==false){
            this._hpbg.visible = true;
            this._hpbar.visible = true;
            this._hptext.visible = true;
        }
        if(value>0)
        {
            var colorMatrix = [
                1, 0, 0, 0, 100,
                0, 1, 0, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 0, 1, 0
            ];
            this._armature.display.filters = [new egret.ColorMatrixFilter(colorMatrix)];
            var _that = this;
            FrameTweenLite.delayedCall(0.4, function () {
                _that._armature.display.filters = [];
                if (_that.batterData.hp <= 0) _that.die();
            });
        }
    }

    /**
     * 寻找攻击目标
     */
    private findTarget(range:number):Person
    {
        var targets: Person[] = this.gameWorld.findPersonsByViewRange(this, range);
        var tempTarget:Person;
        var dis:number = 1000;
        for (var i = 0; i < targets.length; i++) {
            if(targets[i]!=this)
            {
                if (this.batterData.team == PersonTeams.CHAOS ||(this.batterData.team == PersonTeams.HOSTILE && targets[i].batterData.team == PersonTeams.GOODMAN)|| (this.batterData.team != targets[i].batterData.team && (targets[i].batterData.team < PersonTeams.NEUTRAL&&this.batterData.team < PersonTeams.NEUTRAL))) {
                    if(egret.Point.distance(targets[i].logicPosition, this.logicPosition)<dis) {
                        tempTarget = targets[i];
                        dis = egret.Point.distance(targets[i].logicPosition, this.logicPosition);
                    }
                }
            }
        }
        return tempTarget;
    }

    /**
     * 自动攻击
     */
    private autoFight():void
    {
        if(this._focusTarget)
        {
            if (this._focusTarget.batterData.hp < 1){
                this.lostTarget();
                return;
            }
            var dis: number = egret.Point.distance(this._focusTarget.logicPosition, this.logicPosition);
            if (dis <= this._attackRange && this.gameWorld.checkPersonsInViewRange(this,this._focusTarget,this._attackRange))
            {
                this.idle();
                this.playSkill(this.batterData.attackID, this._focusTarget.logicPosition);
                if(this.batterData.skillID>0 && !(this instanceof Hero)) this.playSkill(this.batterData.skillID, this._focusTarget.logicPosition);
            } else this.moveTo(this._focusTarget.logicPosition);
        }
    }

    private lostTarget():void
    {
        FrameTweenLite.killTweensOf(this);
        this.idle();
        this._focusTarget = null;
    }

    private finishAI(ai:AIInfo):void
    {
        for(var i=0;i<this._AIList.length;i++)
        {
            if(this._AIList[i]==ai)
            {
                this._AIList.splice(i,1);
                break;
            }
        }
        if(ai.next.length>0)
        {
            for(var i=0;i<ai.next.length;i++)
            {
                var aiNext:AIInfo = new AIInfo(this._timer,ConfigManager.getInstance().getConfig("ai",ai.next[i]));
                if(aiNext.type==1 && aiNext.focusName.length>1) aiNext.endPoint = this.gameWorld.getSceneObjectByName(ai.focusName).logicPosition;
                this._AIList.push(aiNext);
            }
        }
        if(ai.event.length>0)
            this.playEvent(ai.event);
    }

    //检查AI完成情况
    private checkAI(ai:AIInfo):boolean
    {
        if(ai.type==0) this.finishAI(ai);
        else if(ai.type==1)
        {
            if (ai.focusName.length > 1) ai.endPoint = this.gameWorld.getSceneObjectByName(ai.focusName).logicPosition;
            if(egret.Point.distance(ai.endPoint,this.logicPosition)<1)
            {
                this.finishAI(ai);
                return true;
            }else if(ai.gNPC.length>1){
                if(egret.Point.distance(this.gameWorld.getSceneObjectByName(ai.gNPC).logicPosition,this.logicPosition)>this.batterData.viewrange) return true;
            }else if(ai.gHP>0){
               if(this.batterData.hp*100/this.batterData.maxhp-ai.gHP<=0) return true;
            }
        }else if(ai.type==2){
            if(Math.floor(this._timer)>=ai.overTime)
            {
                this.finishAI(ai);
                return true;
            }
        }else if(ai.type==3){
            if(this.batterData.hp<=ai.gHP) this.finishAI(ai);
        }else if(ai.type==4){
            var answers: string[] = ai.focusName.split("|");
            for (var i = 0; i < answers.length; i++) {
                if(this.gameWorld.getDeadNames().indexOf(answers[i])>=0){
                    this.finishAI(ai);
                    break;
                }
            }
        }
        return false;
    }

    //执行AI
    private runAI(ai:AIInfo)
    {
        if(this.checkAI(ai)==false)
        {
            if(ai.type==1)
            {
                if (ai.focusName.length > 1) ai.endPoint = this.gameWorld.getSceneObjectByName(ai.focusName).logicPosition;
                this.moveTo(ai.endPoint);
            }
        }else{
            if(ai.type==2){
                if(ai.skill>0) this.playSkill(ai.skill,this.logicPosition);
            }else if(ai.type==5){                //旋转AI
                let rotatePoint:egret.Point = PointUtil.getInstance().logicToPosition(ai.endPoint);
                var newX:number = rotatePoint.x + (this.position.x - rotatePoint.x) * Math.cos(90) - (this.position.y - rotatePoint.y) * Math.sin(90);
                var newY:number = rotatePoint.y + (this.position.x - rotatePoint.x) * Math.sin(90) + (this.position.y - rotatePoint.y) * Math.cos(90);
                this.position = new egret.Point(newX,newY);
                var skillCFG:any = ConfigManager.getInstance().getConfig("skill",ai.skill);
                let that = this;
                if(skillCFG['skill_type']=="build") {
                    let state:AnimationState = this._animation.play(skillCFG['skill_action'], -1);
                    Timeout.setTimeout(function(){
                        that.dispatchEvent(new egret.Event(SceneMoveObject.HERO_ANIMATION_FINISH));
                    }, this, state.animationData.duration * 1000);
                    var builds: string[] = skillCFG['build_id'].split("|");
                    var buildID:number = Number(builds[0]);
                    if(builds.length>1) buildID = Number(builds[Math.floor(Math.random()*builds.length)]);
                    if(buildID>=50000){
                        let showName:string = skillCFG['build_name'] + "_" + this._buildIndex;
                        let trueName:string = showName;
                        if(skillCFG['build_name'].length<=1){
                            showName = "";
                            trueName = this.name + "_" + this._buildIndex;
                        }
                        var person: Person = this.gameWorld.addPerson(buildID, trueName, showName, this.position.x, this.position.y);
                        if (buildID == 50000) person.birth();                              //地雷，创建时开启倒计时.
                        this.gameWorld.buildObjects.push(person);
                        person.moveTo(new egret.Point(this.logicPosition.x+10*(this.logicPosition.x-ai.endPoint.x),this.logicPosition.y+10*(this.logicPosition.y-ai.endPoint.y)));
                    }
                }
            }
        }
    }

    //设置攻击目标
    public setTarget(_target:Person)
    {
        this._focusTarget = _target;
    }

    //获取攻击目标
    public getTarget():Person
    {
        return this._focusTarget;
    }

    /**
     * 每帧都跑的更新方法，先处理阵营AI，再根据配置来实现AI
     */
    public update(timeObject:any):void
    {
        super.update(timeObject);
        if(this.batterData.hp<=0 || this.onControl) return;
        if(this._focusTarget)
        {
            if (egret.Point.distance(this._focusTarget.logicPosition, this.logicPosition) <= this._attackRange && this._status!=Status.IDLE && this.gameWorld.checkPersonsInViewRange(this,this._focusTarget,this._attackRange)) this.idle();
        }
        if(Math.floor(this._timer)-this._floorTimer>0) {
            if(this.batterData.sayhi>0)
            {
                var targets: Person[] = this.gameWorld.findPersonsByViewRange(this, this.batterData.viewrange);
                for (var i = 0; i < targets.length; i++) {
                    if(targets[i] instanceof Hero)
                    {
                        this.playStory(this.batterData.sayhi);
                        this.batterData.sayhi = 0;
                        break;
                    }
                }
            }
            this.updateBuff();
            if(this.batterData.team != PersonTeams.NEUTRAL && this._focusTarget == null)this._focusTarget = this.findTarget(this.batterData.viewrange);
            if(this._focusTarget != null)
            {
                this.autoFight();
            }else{
                for(var i=0;i<this._AIList.length;i++)
                {
                    this.runAI(this._AIList[i]);
                }
            }
            this._floorTimer = Math.floor(this._timer);
            if(this.batterData.safeRange>0)  //驱赶敌对
            {
                var targets:Person[] = this.gameWorld.findPersonsByRange(this.logicPosition,this.batterData.safeRange);
                for (var i = 0; i < targets.length; i++) {
                    if(targets[i]!=this)
                    {
                        if (this.batterData.team == PersonTeams.CHAOS || (this.batterData.team != targets[i].batterData.team && (targets[i].batterData.team < PersonTeams.NEUTRAL&&this.batterData.team < PersonTeams.NEUTRAL))) {
                            targets[i].pushedByPerson(this,this.batterData.safeRange);
                        }
                    }
                }
            }
        }
    }

    //被人推走
    private pushedByPerson(ps:Person,range:number):void
    {
        let dist:number = egret.Point.distance(ps.position,this.position);
        let endPos:egret.Point = new egret.Point(ps.position.x+range*(this.position.x-ps.position.x)/dist,ps.position.y+range*(this.position.y-ps.position.y)/dist);
        let end:egret.Point = PointUtil.getInstance().positionToLogic(endPos);
        if(this.gameWorld.checkTilePassable(this,end)){
            let targetPoints:any[] = [];
            for (var i = 1; i<30 ; i++) {
                for(var j=0;j<i*2;j++){
                    let x = end.x - i + j;
                    let y = end.y - i;
                    if(this.gameWorld.checkTilePassable(this,new egret.Point(x,y))){
                        targetPoints.push(new egret.Point(x,y));
                        break;
                    }
                }
                for(var j=0;j<i*2;j++){
                    let x = end.x + i;
                    let y = end.y - i + j;
                    if(this.gameWorld.checkTilePassable(this,new egret.Point(x,y))){
                        targetPoints.push(new egret.Point(x,y));
                        break;
                    }
                }
                for(var j=0;j<i*2;j++){
                    let x = end.x + i - j;
                    let y = end.y + i;
                    if(this.gameWorld.checkTilePassable(this,new egret.Point(x,y))){
                        targetPoints.push(new egret.Point(x,y));
                        break;
                    }
                }
                for(var j=0;j<i*2;j++){
                    let x = end.x - i;
                    let y = end.y + i - j;
                    if(this.gameWorld.checkTilePassable(this,new egret.Point(x,y))){
                        targetPoints.push(new egret.Point(x,y));
                        break;
                    }
                }
                if(targetPoints.length>0)
                {
                    var targetPoint:egret.Point;
                    var _distance = -1;
                    for(var j=0;j<targetPoints.length;j++){
                        if(egret.Point.distance(ps.logicPosition,targetPoints[j])<_distance||_distance==-1)
                        {
                            targetPoint = targetPoints[j];
                        }
                    }
                    end = targetPoint;
                    break;
                }
            }
        }
        this.logicPosition = end;
    }

    /**
     * 死亡
     */
    public die():void
    {
        this.gameWorld.addDeadNames(this.name);
        FrameTweenLite.killTweensOf(this);
        this._status = Status.DIE;
        this._animation.play("die", -1);
        this._focusTarget = null;
        FrameTweenLite.to(this._display,1,{alpha:0,delay:3});
        if(this._nameLabel) FrameTweenLite.to(this._nameLabel,1,{alpha:0});
    }

    /**
     * 人物血量
     * @returns {number}
     */
    public get hp():number
    {
        return this.batterData.hp;
    }

    /**
     * 人物最大血量
     * @returns {number}
     */
    public get maxHp():number
    {
        return this.batterData.maxhp;
    }

    /**
     * 当前对象移动到最近的关键点，如果操作条件不满足，返回false，反之，执行移动操作，同时返回true。
     * @returns {boolean}
     */
    public moveToNearestKeyPoint():boolean
    {
        let nearestPoint:egret.Point = this.getNearestPoint();
        if (!nearestPoint)//没找到关键点
        {
            return false;
        }
        if (nearestPoint.equals(this.logicPosition))//如果攻击时站立位置和最近点重合，直接结束
        {
            return false;
        }
        if (this.batterData.hp <= 0) //血量为0，直接结束
        {
            return false;
        }
        if (egret.Point.distance(this.logicPosition, nearestPoint) > 15) //关键点距离超过设定值，则不返回
        {
            return false;
        }

        this.moveTo(nearestPoint);
        return true;
    }
}
