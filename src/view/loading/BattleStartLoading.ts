import Globals from "../../enums/Globals";
import ConfigManager from "../../manager/ConfigManager";
import UserInfo from "../../model/vo/UserInfo";
import DataAccessManager from "../../base/da/DataAccessManager";
import DataAccessEntry from "../../model/DataAccessEntry";
import SoundManager from "../../manager/SoundManager";
import LayerManager from "../../manager/LayerManager";
import WindowManager from "../../base/popup/WindowManager";
import SceneManager from "../../manager/SceneManager";
import BattleScene from "../battlescene/BattleScene";
import FrameTweenLite from "../../base/utils/FrameTweenLite";
/**
 * 分两步，先加载tiledmap配置及ui等系统素材，再加载tilemap里面的资源
 * @author sam
 *
 */
export default class BattleStartLoading extends egret.Sprite
{
    public static BATTLE_RES_LOAD_COMPLETE:string = "battleResLoadComplete";

    private loadingMask: egret.Sprite;
    private maskContainer: egret.Sprite;
    private MASK_WIDTH: number = 0;

   // private mc: egret.MovieClip;
    private thumb:egret.Bitmap;
    private resQueue:Object;
    private mapKey: string = "";
    private levelData:any;
    private userInfo:UserInfo;

    private tipsList:Array<string> = ['对我来说，幻想的天赋比吸收知识的能力更有意义。——爱因斯坦',
        '时间有没有尽头？——霍金',
        '成功没有捷径。——扎克伯格',
        '有非凡志向，才有非凡成就。——比尔·盖茨',
        '不要等到明天，明天太遥远，今天就行动。——马云',
        '真正的世界不在你的书里和地图上，而是在外面。——《霍比特人1：意外之旅》',
        '愿原力与你同在。',
        '开拓视野，冲破艰险。看见世界，身临其境。贴近彼此，感受人生。这就是生活的目的。——《白日梦想家》',
        '你必须抛开一切思虑，尼奥。恐惧，疑惑，难以置信。要解放你的心灵。——《黑客帝国1》',
        '最终决定我们命运的不是能力，而是我们自己的选择。——邓布利多',
        '时间就是金钱，我的朋友！——WOW某地精',
        '祈愿夜空暮星闪耀，星光温柔，将你永照。祈愿深浓黑暗降临，你心坚定，无惧无扰。——《指环王》'];

    public constructor()
    {
        super();
        this.showLoading();
        this.createView();
        this.resQueue = {};
    }

    private textField: egret.TextField;
    private tipsText:egret.TextField;

    private OFF_SET_X:number = 440;
    private OFF_SET_Y:number = 280;

    private createView(): void
    {
        this.textField = new egret.TextField();
        this.addChild(this.textField);
        this.textField.x = Globals.GAME_WIDTH * 0.5 - 240;
        this.textField.y = 450 + this.OFF_SET_Y;
        this.textField.size = 24;
        this.textField.width = 480;
        this.textField.height = 50;
        this.textField.textAlign = "center";
        this.textField.text = '请稍等...';
    }

    public showLoading(): void
    {
        var loadingBg: egret.BitmapData = RES.getRes('loading1Bg_jpg');
        var bmp: egret.Bitmap = new egret.Bitmap(loadingBg);
        this.addChild(bmp);
        this.setChildIndex(bmp,0);

        this.maskContainer = new egret.Sprite();
        this.addChild(this.maskContainer);
        this.setChildIndex(this.maskContainer,1);

        this.loadingMask = new egret.Sprite();
        this.maskContainer.addChild(this.loadingMask);

        var bar: egret.BitmapData = RES.getRes('pic_progress-bar_png');
        var bmpBar: egret.Bitmap = new egret.Bitmap(bar);
        this.maskContainer.addChild(bmpBar);
        this.maskContainer.setChildIndex(bmpBar,0);
        bmpBar.mask = this.loadingMask;
        this.MASK_WIDTH = bmpBar.width;
        this.updateMaskGraphics(this.MASK_WIDTH, bmpBar.height);

        //背景
        var barBg: egret.BitmapData = RES.getRes('loading_pic_bg_png');
        var bmpBarBg: egret.Bitmap = new egret.Bitmap(barBg);
        bmpBarBg.x = (Globals.GAME_WIDTH - bmpBarBg.width) * 0.5;
        bmpBarBg.y = 800;
        this.addChild(bmpBarBg);
        this.setChildIndex(bmpBarBg,1);

        this.maskContainer.x = (Globals.GAME_WIDTH - this.maskContainer.width) * 0.5;
        this.maskContainer.y = bmpBarBg.y +　(bmpBarBg.height - this.maskContainer.height) * 0.5;

        this.thumb = new egret.Bitmap(RES.getRes('pic_effect_png'));
        this.addChild(this.thumb);
        this.thumb.x = this.maskContainer.x - this.thumb.width;
        this.thumb.y = this.maskContainer.y + (this.maskContainer.height - this.thumb.height) * 0.5;
        
        var index = Math.floor(Math.random() * this.tipsList.length);
        this.tipsText = new egret.TextField();
        this.tipsText.width = 470;
        this.tipsText.height = 80;
        this.tipsText.x = 340 + this.OFF_SET_X;
        this.tipsText.y = 190 + this.OFF_SET_Y;
        this.tipsText.textColor = 0x222222;
        this.tipsText.bold = true;
        this.tipsText.size = 24;
        this.tipsText.multiline = true;
        this.tipsText.lineSpacing = 5;
        this.tipsText.wordWrap = true;
        this.addChild(this.tipsText);
        this.tipsText.text = this.tipsList[index];
    }

    private updateMaskGraphics(w:number, h:number):void
    {
        this.maskContainer.graphics.clear();
        this.maskContainer.graphics.beginFill(0,0);
        this.maskContainer.graphics.drawRect(0,0,w,h);
        this.maskContainer.graphics.endFill();
    }

    public setProgress(words:string,current: number,total: number): void
    {
        this.updateMask(words,current/total);
    }

    private updateMask(words:string,progress: number): void
    {
        this.textField.text = " "+words + '...  ' + '(' + (Math.ceil(progress * 100)) + '%)';
        var offset:number = 20;
        this.loadingMask.graphics.clear();
        this.loadingMask.graphics.beginFill(0, 1);
        this.loadingMask.graphics.moveTo(0, 0);
        this.loadingMask.graphics.lineTo(this.MASK_WIDTH *progress - offset, 0);
        this.loadingMask.graphics.lineTo(this.MASK_WIDTH *progress, this.maskContainer.height/2);
        this.loadingMask.graphics.lineTo(this.MASK_WIDTH *progress - offset, this.maskContainer.height);
        this.loadingMask.graphics.lineTo(0, this.maskContainer.height);
        this.loadingMask.graphics.lineTo(0, 0);
        this.thumb.x = offset + (this.maskContainer.x - this.thumb.width) + this.MASK_WIDTH *progress;

    }
    //STEP 1 先加载tiledmap配置及ui等系统素材
    /**
     * 添加tilemap资源
     * @param key
     * @param url
     * @param type
     * @param name
     */
    public addTileMap(key:string):void
    {
        if(this.mapKey.length>1) throw new Error('每个战斗场景只支持一个tilemap,不可以加载或重复加载');
        this.mapKey = key;
        this.resQueue[this.mapKey] = {
            "url":"battle/map/"+key+".tmx",
            "name":this.mapKey,
            "type":"text"
        };
    }
    /**
     * 添加一项待加载的资源
     * @param key
     * @param url
     * @param type
     * @param name
     */
    public addRes(key:string, url:string, type:string, name?:string):void

    {
        if(this.resQueue[key]==null) {
            this.resQueue[key] = {
                "url": url,
                "name": name || key,
                "type": type
            };
        }else console.log("资源重复添加到加载队列"+key);
    }

    public loadCommonRes():void
    {
        let keys:string = "";
        let resources:Array<any> = [];
        for(var key in this.resQueue)
        {
            let res = this.resQueue[key];
            keys += key + ',';
            resources.push(res);
        }

        let configData = {
            "groups":[{
                "keys":keys.substr(0, keys.length - 1),
                "name":"battle"
            }],
            "resources":resources
        };

        RES.parseConfig(configData, 'resource/');
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR,this.onResourceLoadError,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onResourceProgress,this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR,this.onItemLoadError,this);
        RES.loadGroup("battle", 0);
        RES.loadGroup("battlescene", 1);
        this.resQueue = {};
    }

    public parseCommonRes(levelData:any):void
    {
        this.levelData = levelData;
        this.userInfo = levelData['player_info'];
        console.log('parseCommonRes', this.userInfo)
        this.addTileMap(levelData.tiledmap);
        if(levelData.tiledimage==null) levelData.tiledimage = "map1_1_0";
        this.addRes(levelData.tiledmap+"battleMap_png", "battle/map/" + levelData.tiledimage + ".png","image");
        this.addRes("foot_png", "battle/map/foot.png","image");
        this.addRes("bubble_png", "battle/map/bubble.png","image");
        let path:string = 'codes/' + levelData.levelID + '.' + this.userInfo.language + '.txt';
        let answer:string = 'answers/' + levelData.levelID + '.' + this.userInfo.language + '.txt';
        this.addRes(levelData.levelID + "_code_txt", path, "text");
        this.addRes(levelData.levelID + "_answer_txt", answer, "text");
        this.addRes(levelData.levelID + "_script_js", "scripts/" + levelData.levelID + ".script.js", "text");
    }

    //STEP 2 加载tilemap里面的资源
    private onResourceLoadComplete(event:RES.ResourceEvent):void
    {
        if (event.groupName === 'battle')
        {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR,this.onResourceLoadError,this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onResourceProgress,this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR,this.onItemLoadError,this);

            this.parseContentRes();
            this.loadContentRes();
        }
    }

    private parseContentRes():void
    {
        var data: any = egret.XML.parse(RES.getRes(this.mapKey));
        for (var i=0;i<data.children.length;i++){
            let layer = data.children[i];
            if(layer.name=="tileset"){
                for (var j=0;j<layer.children.length;j++)
                {
                    let tileset = layer.children[j];
                    if(tileset.children.length>0)
                    {
                        let picName:string = tileset.children[0].attributes.source;
                        this.addRes(picName, "battle/map/"+picName, "image");
                    }
                }
            }else if(layer.attributes.name=="npc"){
                for (var j=0;j<layer.children.length;j++) {
                    let npc = layer.children[j];
                    if(npc.attributes.name.indexOf("npc")>=0) {
                        var names: string[] = npc.attributes.name.split("|");
                        var cfg: any = ConfigManager.getInstance().getConfig("npc_enemy", Number(names[2]));
                        this.addRes(cfg.icon + "_texture_png", "battle/anim/" + cfg.icon + "/" + cfg.icon + "_texture.png", "image");
                        this.addRes(cfg.icon + "_texture_json", "battle/anim/" + cfg.icon + "/" + cfg.icon + "_texture.json", "json");
                        this.addRes(cfg.icon + "_skeleton_json", "battle/anim/" + cfg.icon + "/" + cfg.icon + "_skeleton.json", "json");
                        if (Number(cfg['ai']) > 0) {
                            var aicfg: any = ConfigManager.getInstance().getConfig("ai", Number(cfg['ai']));
                            if (Number(aicfg['type']) == 2  && Number(aicfg['skill'])>0)//build ai
                            {
                                var skillcfg: any = ConfigManager.getInstance().getConfig("skill", Number(aicfg['skill']));
                                if (skillcfg['skill_type'] == "build" && skillcfg['build_id'].length > 1) {
                                    var builds: string[] = skillcfg['build_id'].split("|");
                                    for(var f=0;f<builds.length;f++)
                                    {
                                        var buildID:number = Number(builds[f]);
                                        if(buildID>0)
                                        {
                                            var cfg: any = ConfigManager.getInstance().getConfig("item", buildID);
                                            if (cfg == null) cfg = ConfigManager.getInstance().getConfig("npc_enemy", buildID);
                                            this.addRes(cfg.icon + "_texture_png", "battle/anim/" + cfg.icon + "/" + cfg.icon + "_texture.png", "image");
                                            this.addRes(cfg.icon + "_texture_json", "battle/anim/" + cfg.icon + "/" + cfg.icon + "_texture.json", "json");
                                            this.addRes(cfg.icon + "_skeleton_json", "battle/anim/" + cfg.icon + "/" + cfg.icon + "_skeleton.json", "json");
                                        }
                                    }
                                }
                            }
                        }
                        if(Number(cfg['attack'])>0)
                        {
                            var skillcfg:any = ConfigManager.getInstance().getConfig("skill",Number(cfg['attack']));
                            if(skillcfg['s_effect'].length>0)
                            {
                                console.log(skillcfg['s_effect']);
                                this.addRes(skillcfg['s_effect']+"_png", "battle/effect/"+skillcfg['s_effect']+".png", "image");
                                this.addRes(skillcfg['s_effect']+"_plist", "battle/effect/"+skillcfg['s_effect']+".plist", "xml");
                            }
                            if(skillcfg['e_effect'].length>0)
                            {
                                this.addRes(skillcfg['e_effect']+"_png", "battle/effect/"+skillcfg['e_effect']+".png", "image");
                                this.addRes(skillcfg['e_effect']+"_plist", "battle/effect/"+skillcfg['e_effect']+".plist", "xml");
                            }
                            if(skillcfg['m_effect'].length>0)
                            {
                                this.addRes(skillcfg['m_effect']+"_png", "battle/effect/"+skillcfg['m_effect']+".png", "image");
                                this.addRes(skillcfg['m_effect']+"_plist", "battle/effect/"+skillcfg['m_effect']+".plist", "xml");
                            }
                        }
                    }else if(npc.attributes.name.indexOf("item")>=0) {
                        var names: string[] = npc.attributes.name.split("|");
                        var cfg: any = ConfigManager.getInstance().getConfig("item", Number(names[2]));
                        this.addRes(cfg.icon + "_texture_png", "battle/anim/" + cfg.icon + "/" + cfg.icon + "_texture.png", "image");
                        this.addRes(cfg.icon + "_texture_json", "battle/anim/" + cfg.icon + "/" + cfg.icon + "_texture.json", "json");
                        this.addRes(cfg.icon + "_skeleton_json", "battle/anim/" + cfg.icon + "/" + cfg.icon + "_skeleton.json", "json");
                    }
                }
            }
        }
        let userInfo:UserInfo = this.userInfo;
        this.addRes(userInfo.ownedHero.icon+"_texture_png", "battle/anim/"+userInfo.ownedHero.icon+"/"+userInfo.ownedHero.icon+"_texture.png", "image");
        this.addRes(userInfo.ownedHero.icon+"_texture_json", "battle/anim/"+userInfo.ownedHero.icon+"/"+userInfo.ownedHero.icon+"_texture.json", "json");
        this.addRes(userInfo.ownedHero.icon+"_skeleton_json", "battle/anim/"+userInfo.ownedHero.icon+"/"+userInfo.ownedHero.icon+"_skeleton.json", "json");
        for(var i = 1;i<9;i++)      //遍历8件装备确定哪些技能加载
        {
            if(userInfo.ownedHero['item'+i]>0)
            {
                var ids:string[] = userInfo.getEquipById(userInfo.ownedHero['item'+i]).data['skill'].split("|");
                for(var j = 0;j < ids.length;j++)
                {
                    if(Number(ids[j])>0)
                    {
                        var skillcfg:any = ConfigManager.getInstance().getConfig("skill",Number(ids[j]));
                        if(skillcfg['s_effect'].length>0)
                        {
                            this.addRes(skillcfg['s_effect']+"_png", "battle/effect/"+skillcfg['s_effect']+".png", "image");
                            this.addRes(skillcfg['s_effect']+"_plist", "battle/effect/"+skillcfg['s_effect']+".plist", "xml");
                        }
                        if(skillcfg['m_effect'].length>0)
                        {
                            this.addRes(skillcfg['m_effect']+"_png", "battle/effect/"+skillcfg['m_effect']+".png", "image");
                            this.addRes(skillcfg['m_effect']+"_plist", "battle/effect/"+skillcfg['m_effect']+".plist", "xml");
                        }
                        if(skillcfg['e_effect'].length>0)
                        {
                            this.addRes(skillcfg['e_effect']+"_png", "battle/effect/"+skillcfg['e_effect']+".png", "image");
                            this.addRes(skillcfg['e_effect']+"_plist", "battle/effect/"+skillcfg['e_effect']+".plist", "xml");
                        }
                        if(skillcfg['skill_type']=="build" && skillcfg['build_id']+0>0)
                        {
                            var cfg: any = ConfigManager.getInstance().getConfig("item", Number(skillcfg['build_id']));
                            if(cfg == null){
                                cfg = ConfigManager.getInstance().getConfig("npc_enemy", Number(skillcfg['build_id']));
                                if(Number(cfg['attack'])>0)
                                {
                                    var skillcfg:any = ConfigManager.getInstance().getConfig("skill",Number(cfg['attack']));
                                    if(skillcfg['s_effect'].length>0)
                                    {
                                        console.log(skillcfg['s_effect']);
                                        this.addRes(skillcfg['s_effect']+"_png", "battle/effect/"+skillcfg['s_effect']+".png", "image");
                                        this.addRes(skillcfg['s_effect']+"_plist", "battle/effect/"+skillcfg['s_effect']+".plist", "xml");
                                    }
                                    if(skillcfg['e_effect'].length>0)
                                    {
                                        this.addRes(skillcfg['e_effect']+"_png", "battle/effect/"+skillcfg['e_effect']+".png", "image");
                                        this.addRes(skillcfg['e_effect']+"_plist", "battle/effect/"+skillcfg['e_effect']+".plist", "xml");
                                    }
                                    if(skillcfg['m_effect'].length>0)
                                    {
                                        this.addRes(skillcfg['m_effect']+"_png", "battle/effect/"+skillcfg['m_effect']+".png", "image");
                                        this.addRes(skillcfg['m_effect']+"_plist", "battle/effect/"+skillcfg['m_effect']+".plist", "xml");
                                    }
                                }
                            }
                            this.addRes(cfg.icon + "_texture_png", "battle/anim/" + cfg.icon + "/" + cfg.icon + "_texture.png", "image");
                            this.addRes(cfg.icon + "_texture_json", "battle/anim/" + cfg.icon + "/" + cfg.icon + "_texture.json", "json");
                            this.addRes(cfg.icon + "_skeleton_json", "battle/anim/" + cfg.icon + "/" + cfg.icon + "_skeleton.json", "json");
                        }
                    }
                }
            }
        }
    }

    private loadContentRes():void
    {
        let keys:string = "";
        let resources:Array<any> = [];
        for(var key in this.resQueue)
        {
            let res = this.resQueue[key];
            keys += key + ',';
            resources.push(res);
        }
        let configData = {
            "groups":[{
                "keys":keys.substr(0, keys.length - 1),
                "name":"battleContent"
            }],
            "resources":resources
        };

        RES.parseConfig(configData, 'resource/');
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onContentLoadComplete,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR,this.onResourceLoadError,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onContentProgress,this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR,this.onItemLoadError,this);
        RES.loadGroup("battleContent", 0);
        this.resQueue = {};
    }

    private onContentLoadComplete(event:RES.ResourceEvent):void
    {
        RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onContentLoadComplete,this);
        RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR,this.onResourceLoadError,this);
        RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onContentProgress,this);
        RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR,this.onItemLoadError,this);

        this.setProgress("成功创建世界,即将开始游戏",1, 1);
        this.dispatchEvent(new egret.Event(BattleStartLoading.BATTLE_RES_LOAD_COMPLETE,false,false,this.levelData));
    }

    /**
     * preload资源组加载进度
     * loading process of preload resource
     */
    private onContentProgress(event: RES.ResourceEvent): void
    {
        this.setProgress("加载界面素材资源",event.itemsTotal+event.itemsLoaded*4, event.itemsTotal*5);
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent): void
    {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }
    /**
     * 资源组加载出错
     * Resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent): void
    {
        console.warn("Group:" + event.groupName + " has failed to load");
    }
    /**
     * preload资源组加载进度
     * loading process of preload resource
     */
    private onResourceProgress(event: RES.ResourceEvent): void
    {
        this.setProgress("加载界面素材资源",event.itemsLoaded, event.itemsTotal*5);
    }

    public static startBattleLoading(levelData:Object):void
    {
        SoundManager.getInstance().stop('ui_mp3');
        let levelBgm:string = levelData['level_bgm'];
        if (levelBgm && levelBgm.length > 0)SoundManager.getInstance().stop(levelBgm);
        SoundManager.getInstance().playMusic(levelBgm + '_mp3', 0, 0);

        let loadView:BattleStartLoading = new BattleStartLoading();
        if (!levelData['player_info'])//如果不存在玩家信息，就用自己的信息补充(非教学关卡)
        {
            levelData['player_info'] = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
        }
        LayerManager.stage.addChildAt(loadView, LayerManager.stage.numChildren - 1);
        loadView.addEventListener(BattleStartLoading.BATTLE_RES_LOAD_COMPLETE, this.onEnterBattle, this);
        loadView.parseCommonRes(levelData);
        loadView.loadCommonRes();
    }

    private static onEnterBattle(e:egret.TouchEvent)
    {
        let loadView:BattleStartLoading = e.currentTarget;
        loadView.removeEventListener(BattleStartLoading.BATTLE_RES_LOAD_COMPLETE, this.onEnterBattle, this);

        LayerManager.stage.removeChild(loadView);
        WindowManager.closeAllWindow(true);
        FrameTweenLite.killAll();
        SceneManager.getInstance().pushScene(new BattleScene(), e.data);
        console.log('[BattleStartLoading.onEnterBattle]', e.data);
    }
}
