/**
 * @author rappel
 * @time 2016-12-09
 */
import MainToolBtn from "../mainscene/MainToolBtn";
import BarrierBtn from "../explore/barrier/BarrierBtn";
import BarrierWindow from "./barrier/BarrierWindow";
import BaseWindow from "../../base/popup/BaseWindow";

import DataAccessManager from "../../base/da/DataAccessManager";
import DataAccessEntry from "../../model/DataAccessEntry";

import NetManager from "../../model/net/NetManager";

import ConfigManager from "../../manager/ConfigManager";
import WindowManager from "../../base/popup/WindowManager";
import UserInfo from "../../model/vo/UserInfo";
import UserInfoProxy from "../../model/da/UserInfoProxy";
import SoundManager from "../../manager/SoundManager";
import HUDPanel from "../mainscene/HUDPanel";
import Alert from "../../view/common/Alert";
import Protocols from "../../enums/Protocols";
import MaliPlatform from "../../platforms/MaliPlatform";
import Platform from "../../platforms/Platform";

export default class ExploreWindow extends BaseWindow 
{
    public static STATE_OPEN = 2; //开放状态
    public static STATE_STRIP= 1; //正在进行状态
    public static STATE_LOCK = 0; //锁定状态

    public imgBg:eui.Image;
    public imgHead:eui.Image;
    // public labFullName:eui.Label;
    public btnPrevious: eui.Button;
    public btnNext: eui.Button;

    private map_config:any;
    private group_config:any;
    private level_config:any;
    public starInfo:any;
    //地图名称
    private chapter_name: string;
    private mapIdOfPage: number;//标记当前翻页的位置（ID）
    private mapStateOfPage: number;//标记当前翻页的地图状态（三种）

    private currentMapID: number;    //标记玩家当前关卡进度所在的chapter
    private currentGroupID: number;  //标记玩家当前关卡进度所在的group
    private currentLevelID: number;  //标记玩家当前关卡进度所在的level

    private flyweight_groups: Object;//所在地图,所有分组下面的关卡id
    private flyweight_levels: Array<string>;//所在地图,所有关卡的id
    private groups_info:any;

    private hudPanel: HUDPanel;
    private userInfo: UserInfo;

    private btnContainer: egret.Sprite;
    private barrierBtns: any;
    private mainToolBtns: MainToolBtn;

    private isShowGroup:boolean;
    private groupInfo: any;
    private groupPanel: BaseWindow;

    public constructor()
    {
        super();
        this.skinName = 'ExploreWindowSkin';

        this.map_config = ConfigManager.getInstance().getConfigs('pve_story_map');
        this.group_config   = ConfigManager.getInstance().getConfigs('pve_story_group');
        this.level_config   = ConfigManager.getInstance().getConfigs('pve_story_level');

        this.hudPanel = new HUDPanel();
        this.addChild( this.hudPanel );

        this.userInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;

        this.currentLevelID   = this.userInfo.storyID; //11xxx
        this.currentGroupID   = this.level_config[ this.currentLevelID ]['group'];//11xx
        this.currentMapID = this.level_config[ this.currentLevelID ]['map']; //100x

        this.isShowGroup = false;

        NetManager.getInstance().callServerSocket(Protocols.ROUTE_GETSTORYINFO);
        NetManager.getInstance().addEventListener(UserInfoProxy.STORY_UPDATE_STAR, this.storyStarUpdate, this);
    }

    protected childrenCreated()
    {
        super.childrenCreated();

        //下方功能按钮
        this.mainToolBtns = new MainToolBtn();
        this.addChild( this.mainToolBtns );
        this.mainToolBtns.x = 1024;
        this.mainToolBtns.y = 912;
    }

    private storyStarUpdate(e:egret.Event)
    {
        this.starInfo = e.data;
        this.updateView();
        for(let i = 0; this.groupPanel && i < this.groupPanel['barrierList'].length; ++ i)
        {
            let star_level = this.getStarByStoryId(this.groupPanel['barrierList'][i]['cellData'].levelID, this.starInfo);
            this.groupPanel['barrierList'][i].updateCellStarLevel( star_level );
        }
    }
    
    protected updateView(chapter_index?:number): void
    {
        this.removeAll();

        this.hudPanel.update(this.userInfo);
        //进入指定的地图
        this.mapIdOfPage = chapter_index ? chapter_index : this.currentMapID;
        
        if(this.mapIdOfPage != this.currentMapID)
        {
            this.mapStateOfPage = (this.mapIdOfPage < this.currentMapID ? ExploreWindow.STATE_OPEN : ExploreWindow.STATE_LOCK);
        }
        else
        {
            this.mapStateOfPage = ExploreWindow.STATE_STRIP;
        }
        this.imgBg.source  = RES.getRes("chapterMap_" + this.mapIdOfPage + "_jpg");
        
        /**
         * 数据处理部分
         * 将数据适配成可以直接用于UI界面显示的数据形式
         */
        /**
         * groups = {
         *  '1101': {
         *     chapterIndex: 1, 地图索引
         *     groupIndex: 1, 分组索引
         *     name: '奇遇之星,
         *     rewards: {},
         *     levels: {
         *      '110001': {
         *          chapterIndex:1,
         *          groupIndex:1,
         *          levelIndex:1,
         *          levelID: '1100001',
         *          name: '紊乱的时空',
         *          topic: '基本方法,方法使用',
         *          required_energy: 6,
         *          required_star: 3,
         *          tiledmap:'Map_1_1_2',
         *          star1_reward: '40002',
         *          star1_reward_num: 1,
         *          star2_reward: '40002',
         *          star2_reward_num: 1,
         *          star3_reward: '40002',
         *          star3_reward_num: 1,
         *          star_level: 1,
         *          state_locked: 0,
         *          next_level: 下一关
         *       },
         *       '110002': {
         *       }
         *     },
         *     point: [101, 102]
         *   },
         *   '1102': {}
         * }
         * 
         */
        var group = {}, level = {};
        this.groups_info = {};
        this.flyweight_groups = {};
        this.flyweight_levels = [];
        
        let mapRawInfo:Object = this.map_config[ this.mapIdOfPage ];
        let groupIDs:Array<any> = mapRawInfo['group'].split('|');

        let userCurrentMapIndex:number = Object.keys( this.map_config ).indexOf( this.currentMapID.toString() ) + 1;

        var raw_group_info = {}, raw_level_info = {}, group_key, level_key, state_lock = ExploreWindow.STATE_LOCK;
        for(var group_index = 0; group_index < groupIDs.length; ++ group_index ) //枚举group
        {
            group_key = groupIDs[group_index];
            raw_group_info[ group_key ] = this.group_config[ group_key ];

            var pos = (raw_group_info[ group_key ]['point'] && raw_group_info[ group_key ]['point'].split('|')) || [101, 101];
            var topic = (raw_group_info[ group_key ]['topic'] && raw_group_info[ group_key ]['topic'].split('|')[0]);
            group = {
                'chapterIndex': userCurrentMapIndex,
                'groupIndex': group_index+1,
                'name': raw_group_info[ group_key ]['name'],
                'rewards': {},
                'levels': {},
                'point': [pos[0], pos[1]],
                'topic': topic
            };

            this.flyweight_groups[group_key] = [];

            var level_chuncks = raw_group_info[ group_key ]['level'].split('|');
            for(var level_index = 0; level_index < level_chuncks.length; ++ level_index) //枚举level
            {
                level_key = level_chuncks[level_index];
                level = raw_level_info[ level_key ] = this.level_config[ level_key ];

                this.flyweight_levels.push( level_key );
                this.flyweight_groups[group_key].push( level_key );

                if(!level_key || !level) continue;

                if(ExploreWindow.STATE_STRIP != this.mapStateOfPage)
                {
                    state_lock = this.mapStateOfPage;
                }
                else 
                {
                    var group_ind = groupIDs.indexOf( this.currentGroupID );
                    group_ind = Math.min( Math.max( group_ind, 0), groupIDs.length - 1 );

                    if(group_index != group_ind) state_lock = (group_index < group_ind ? ExploreWindow.STATE_OPEN:ExploreWindow.STATE_LOCK);
                    else 
                    {
                        var level_ind = level_chuncks.indexOf( this.currentLevelID.toString() );
                        level_ind = Math.min( Math.max( level_ind, 0), level_chuncks.length - 1 );

                        if( level_index != level_ind) state_lock = (level_index < level_ind ? ExploreWindow.STATE_OPEN:ExploreWindow.STATE_LOCK);
                        else
                        {
                            state_lock = ExploreWindow.STATE_STRIP;//当前进度所在关卡
                        }
                    }
                }

                let star_level = this.getStarByStoryId( level_key, this.starInfo);
                group['levels'][ level_key ] = {
                    'levelIndex': level_index,
                    'groupIndex': group_index + 1,
                    'chapterIndex': userCurrentMapIndex + 1,
                    'levelID': level_key,
                    'name': level['name'],
                    'topic': level['topic'],
                    'required_energy': level['energy'],
                    'hero_rotation': level['hero_rotation'],
                    // 'required_star': level['star'],
                    'tiledmap': level['tiledmap'],
                    'tiledimage': level['tiledimage'],
                    'star1_reward': level['star1_reward'],
                    'star1_reward_num': level['star1_reward_num'],
                    'star2_reward': level['star2_reward'],
                    'star2_reward_num': level['star2_reward_num'],
                    'star3_reward': level['star3_reward'],
                    'star3_reward_num': level['star3_reward_num'],
                    'star_level': star_level,
                    'state_locked': state_lock,
                    'next_level': level['next_level'],
                    'level_bgm': level['bgm'],
                    'find_path':level['find_path']
                };
            }
            this.groups_info[ group_key ] = group;
        }
        // console.log( raw_chapter_info, raw_group_info, raw_level_info, this.groups_info );

        /**
         * UI显示部分
         * 地图,分组按钮显示,当前关卡位置指示
         */
        var groups_labels = Object.keys( this.groups_info ),
            barrier_state = BarrierBtn.STATE_OPEN,
            curr_group_index;

        this.barrierBtns = [];
        for(var i = 0; i < groups_labels.length; ++ i) //枚举group
        {
            group_key = groups_labels[i];
            group = this.groups_info[ group_key ];

            if(ExploreWindow.STATE_STRIP != this.mapStateOfPage)
            {
                barrier_state = (ExploreWindow.STATE_OPEN == this.mapStateOfPage ? BarrierBtn.STATE_OPEN : BarrierBtn.STATE_LOCK);
            }
            else
            {
               curr_group_index = groups_labels.indexOf( this.currentGroupID.toString() );
               curr_group_index = Math.min( Math.max( curr_group_index, 0), groups_labels.length - 1);

               if( i != curr_group_index)
               {
                   barrier_state = ( i < curr_group_index ? BarrierBtn.STATE_OPEN : BarrierBtn.STATE_LOCK );
               }
               else
               {
                   barrier_state = BarrierBtn.STATE_STRIP;
               }
            }

            var nowStarCount = 0, totalStarCount = 0;
            //遍历一遍该组所有的关卡
            for(let levelId in group['levels'])
            {
                if(!topic) topic = group['levels'][levelId]['topic'].split('|')[0];

                nowStarCount += group['levels'][levelId]['star_level'];
                totalStarCount  += 3;
            }
            this.barrierBtns[i] = new BarrierBtn( barrier_state, i + 1, {
                "topic": group['topic'],
                "nowStarCount": nowStarCount,
                "totalStarCount": totalStarCount
            });
            this.barrierBtns[i].x = parseInt(group['point'][0]);
            this.barrierBtns[i].y = parseInt(group['point'][1]) - this.barrierBtns[i].height/2;
            if(BarrierBtn.STATE_LOCK == barrier_state) {
                this.barrierBtns[i].x -= this.barrierBtns[i].width/4;
            }
            else if(BarrierBtn.STATE_OPEN == barrier_state) {
                this.barrierBtns[i].x -= this.barrierBtns[i].width/4;
            }
            else {
                this.barrierBtns[i].y += this.barrierBtns[i].height/4;
            }
            this.barrierBtns[i].name = 'btnBarrier' + i;
            this.addChild( this.barrierBtns[i] );
            this.barrierBtns[i].addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBarrierBtnTouchHandler, this);
        }

        //地图左右切换按钮 - 地图的选择
        this.btnPrevious = new eui.Button();
        this.btnPrevious.skinName = "ExplorePageUpBtnSkin";
        this.btnPrevious.x = 0;
        this.btnPrevious.y = 504;
        this.btnNext     = new eui.Button();
        this.btnNext.skinName    = "ExplorePageDownBtnSkin";
        this.btnNext.x = 1854;
        this.btnNext.y = 504;
        this.btnPrevious.visible = this.btnNext.visible = true;
        this.addChildAt( this.btnNext, this.numChildren-1 );
        this.addChildAt( this.btnPrevious, this.numChildren-2 );

        var chapter_labels = Object.keys( this.map_config );
        var chapter_ind    = chapter_labels.indexOf( this.mapIdOfPage.toString() );
        if(chapter_ind <= 0) this.btnPrevious.visible = false;
        if(chapter_ind >= chapter_labels.length - 1) this.btnNext.visible = false;
        
        this.btnPrevious.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchBtnMapChangeHandler, this);
        this.btnNext.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchBtnMapChangeHandler, this);
    }

    private onBarrierBtnTouchHandler(e:egret.TouchEvent)
    {
        SoundManager.getInstance().playEffect('u01_button_mp3');
        if( BarrierBtn.STATE_LOCK == e.currentTarget.type )
        {
            Alert.show("提示", "请先通关前置关卡，解锁本章节", 2);
            return;
        }

        var groups_labels = Object.keys( this.groups_info ),
            group_info = {};
        
        for(var i = 0; i < groups_labels.length; ++ i)
        {
            if(e.currentTarget == this.barrierBtns[i])
            {
                group_info = this.groups_info[ groups_labels[i] ];
                break;
            }
        }

        WindowManager.showWindow( BarrierWindow, "BarrierWindow", "选关界面", group_info );
    }

    private onTouchBtnMapChangeHandler(e:egret.TouchEvent)
    {
        var chapter_labels = Object.keys( this.map_config ), //['1001', '1002', '1003', '1004', '1005']
            chapter_ind = chapter_labels.indexOf( this.mapIdOfPage.toString() ); //0 - 4

        if( e.currentTarget == this.btnPrevious )
        {
            if( chapter_ind <= 0 ) return;
            -- chapter_ind;
            this.updateView( parseInt(chapter_labels[chapter_ind]) );
        }
        else if( e.currentTarget == this.btnNext )
        {
            if( chapter_ind >= chapter_labels.length - 1 ) return;
            ++ chapter_ind;
            this.updateView( parseInt(chapter_labels[chapter_ind]) );
        }
    }

    private getStarByStoryId(storyId:any, vStarInfo:Object[]):number
    {
        for(var index in vStarInfo)
        {
            let starInfo = vStarInfo[index];
            if(parseInt(storyId) === starInfo['storyID']) return parseInt(starInfo['star']);
        }
        return 0;
    }

    /**
     * 判断该关是否在当前地图关卡列表内
     * @param {string} levelId 目标关卡id
     * @return {boolean} 是否在地图关卡列表内
     */
    public isLevelInChapter(levelId:string):boolean
    {
        let levelIndex = this.flyweight_levels.indexOf( levelId );
        return levelIndex > -1 ? true:false;
    }

    /**
     * 判断2个关卡是否在同一组
     * @param {string} levelId1 关卡1的Id
     * @param {string} levelId2 关卡2的Id
     * @return {boolean} 返回是否在同一组
     */
    public isInSameGroup(levelId1:string, levelId2:string)
    {
        let groupId1 = this.findLevelGroupId( levelId1 );
        let groupId2 = this.findLevelGroupId( levelId2 );
        if(-1 != groupId1 && -1 != groupId2 && groupId1 == groupId2) return true;
        return false;
    }

    /**
     * 找到关卡所在的组
     * @param {string} levelId 关卡id
     * @return {number} 返回关卡所在的组index
     */
    public findLevelGroupId(levelId:string):any
    {
        for(var group_key in this.flyweight_groups)
        {
            let levels = this.flyweight_groups[ group_key ];
            if(levels.indexOf(levelId) > -1) return group_key; 
        }
        return -1;
    }

    /**
     * 弹出某一组关卡的选关界面
     * @param {string} groupId 
     * @return 
     */
    public showGroupPanel(groupId:string):void
    {
        let group_info = this.groups_info[groupId];
        if(!group_info) return;

        this.isShowGroup= true;
        this.groupInfo  = group_info;
        this.groupPanel = WindowManager.showWindow( BarrierWindow, "BarrierWindow", "选关界面", group_info );
    }

    /**
     * 跳到下一张地图
     * 
     */
    public gotoNextChapter():void
    {
        var chapter_labels = Object.keys( this.map_config ), //['1001', '1002', '1003', '1004', '1005']
            chapter_ind = chapter_labels.indexOf( this.mapIdOfPage.toString() ); //0 - 4

        if( chapter_ind >= chapter_labels.length - 1 ) return;
        ++ chapter_ind;
        this.updateView( parseInt(chapter_labels[chapter_ind]) );
    }

    private removeAll()
    {
        if( this.barrierBtns && this.barrierBtns.length )
        {
            for(var i = 0; i < this.barrierBtns.length; ++ i)
            {
                if( this.contains( this.barrierBtns[i] ) ) this.removeChild( this.barrierBtns[i] );
            }
        }
    }

    public dispose()
    {
        super.dispose();
        NetManager.getInstance().removeEventListener(UserInfoProxy.STORY_UPDATE_STAR, this.storyStarUpdate, this);
    }
}