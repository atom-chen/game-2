/**
 * @auther rappel
 * @time 2016-12-15 17:20
 */
import BattleStartLoading from "../../loading/BattleStartLoading";
import LayerManager from "../../../manager/LayerManager";
import SceneManager from "../../../manager/SceneManager";
import BattleScene from "../../battlescene/BattleScene";
import WindowManager from "../../../base/popup/WindowManager";
import ConfigManager from "../../../manager/ConfigManager";
import EquipWindow from "../equipment/EquipWindow";
import RewardBar from "../../battleui/battleresult/RewardBar";
import RewardSlot from "../../battleui/battleresult/RewardSlot";
import Platform from "../../../platforms/Platform";
import UIPopupLoading from "../../loading/UIPopupLoading";
import MaliPlatform from "../../../platforms/MaliPlatform";
import Alert from "../../common/Alert";

export default class BarrierCell extends eui.Component {
	public static STATE_OPEN  = 2; //已完成的关卡
    public static STATE_STRIP = 1; //正执行的关卡
    public static STATE_LOCK  = 0; //未完成的关卡

	public cellData:Object;

	private labelLevelName: eui.Label;
	private labelVigor: eui.Label;
	
	private rewardBar:RewardBar;
	private vSelectedStar:Array<eui.Image>;
	//按钮 
	private btnFight:eui.Button;
	private btnReFight:eui.Button;

   /* 数据格式
	*      '110001': {
	*          levelID: '1100001',
			   levelIndex: 1,
			   groupIndex: 1,
			   chapterIndex: 1,
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
	*          state_locked: 0
	*		}
	*/
	public constructor(cellData:Object) 
	{
		super();
		this.skinName = "BarrierCellSkin";
		this.cellData = cellData;
	}

	protected childrenCreated()
	{
		super.childrenCreated();
		this.refreshView(this.cellData);
	}

	public refreshView(cellData:any):void 
	{
		this.vSelectedStar = new Array<eui.Image>();
		for(let i = 0; i < 3; ++ i)
		{
			this.vSelectedStar[i] = new eui.Image();
			this.vSelectedStar[i].x = 96 + i * 60;
			this.vSelectedStar[i].y = 334;
			this.vSelectedStar[i].source = 'common_star_selected_png'//RES.getRes('common_utils_json.common_star_selected_png');
			this.vSelectedStar[i].visible = false;
			this.addChild( this.vSelectedStar[i] );
		}

		this.btnFight.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onEnterBattleHandler, this);
		this.btnReFight.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onEnterBattleHandler, this);

		var raw_data = cellData || this.cellData;
		raw_data["name"] && (this.labelLevelName.text = raw_data["name"]);
		raw_data["required_energy"] && (this.labelVigor.text= raw_data["required_energy"]);

		//奖励物品展示
		this.rewardBar = new RewardBar();
		var reward = {};
		/**
		 * star1_reward, star1_reward_num
		 * star2_reward, star2_reward_num
		 * star3_reward, star3_reward_num
		 */
		['star1_reward', 'star2_reward', 'star3_reward'].forEach( function(key) {
			raw_data[key].split('|').forEach( function(rewardId, index) 
			{
				if(reward[ rewardId ])
				{
					reward[ rewardId ].reward_num += parseInt(raw_data[key + '_num'].split('|')[index]);
				}
				else
				{
					reward[ rewardId ] = {
						reward_num: 0,
						reward_icon: ""
					};

					let rewardContent = ConfigManager.getInstance().getConfig('equip', rewardId);
					if(rewardContent)
					{
						reward[ rewardId ]['reward_icon'] = 'resource/icon/equip/' + rewardContent['icon'] + '.png';
						reward[ rewardId ]['reward_num' ] = parseInt(raw_data[key + '_num'].split('|')[index]);
					}
					if(!rewardContent ) 
					{
						rewardContent = ConfigManager.getInstance().getConfig('hero', rewardId);
						if(!rewardContent) return;
						//reward[ rewardId ]['reward_icon'] = 'resource/icon/hero/' + rewardContent['icon'] + '.png';
						reward[ rewardId ]['reward_icon'] = 'resource/icon/role/career_head/' + rewardContent['career_head'] + '_s.png'
						reward[ rewardId ]['reward_num' ] = parseInt(raw_data[key + '_num'].split('|')[index]);
					}
				}
			}, this);
		}, this);

		Object.keys( reward ).forEach( function(reward_key) {
			RES.getResByUrl( reward[reward_key].reward_icon, (data, url) => {
				this.rewardBar.addAwardSlot(new RewardSlot(data, reward[reward_key].reward_num, 'small'), 'normal', 10);
			}, this);
		}, this);

		this.addChild( this.rewardBar );
		this.rewardBar.y = 130;

		let slotCount = Object.keys( reward ).length;
		switch( slotCount )
		{
			case 1: this.rewardBar.x = 153; break;
			case 2: this.rewardBar.x = 87; break;
			case 3: this.rewardBar.x = 83; break;
			case 4: this.rewardBar.x = 49; break;
			default:this.rewardBar.x = 73; break;
		}
		
		this.btnFight.visible  = false;
		this.btnReFight.visible= false;
		//按钮状态 - 关卡开放状态
		if( BarrierCell.STATE_OPEN == raw_data['state_locked'] ) //关卡已完成
		{	
			this.btnReFight.visible = true;
		}
		else if( BarrierCell.STATE_LOCK == raw_data['state_locked'] )//关卡未开放
		{
			this.btnFight.visible = true;
			this.btnFight.enabled = false;
		}
		else//关卡正在进行
		{
			this.btnFight.visible = true;
		}

		this.updateCellStar( raw_data );
	}

	public updateCellStar(cellData:any)
	{
		//星级展示
		let star_num = cellData['star_level'];
		for(let i = 0; i < 3; ++ i)
		{
			this.vSelectedStar[i].visible = (i < star_num ? true:false);
		}
	}

	public updateCellStarLevel(star_num:number)
	{
		//星级展示
		for(let i = 0; i < star_num; ++ i)
		{
			this.vSelectedStar[i].visible = (i < star_num ? true:false);
		}
	}
	private onEnterBattleHandler(e:egret.TouchEvent)
	{
		let platform:MaliPlatform = <MaliPlatform>(Platform.currentPlatform);
		if (platform.classLockInfo.state == 1 &&  //班级锁定
			platform.classLockInfo.classId == platform.classId && //本人在该班级中
			platform.idType != 'teacher' && //本人不是教师
			parseInt(this.cellData['levelID']) >= platform.classLockInfo.lockLvl) //当前关卡超过锁定关卡进度
		{
			Alert.show('提示', '本班级的进度暂时被老师锁定，请认真学习之前关卡！', 2);
			return;
		}
		LayerManager.stage.addEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterPopup, this);
		UIPopupLoading.startPopupLoading(["equip"]);
	}

	private onEnterPopup(e:egret.TouchEvent):void
	{
		LayerManager.stage.removeEventListener(UIPopupLoading.POPUP_RES_LOAD_COMPLETE, this.onEnterPopup, this);
		WindowManager.showWindow( EquipWindow, 'EquipWindow', '装备界面', this.cellData);
	}

	private onEnterBattle(e:egret.TouchEvent)
	{
	    let loadView:BattleStartLoading = e.currentTarget;
        loadView.removeEventListener(BattleStartLoading.BATTLE_RES_LOAD_COMPLETE, this.onEnterBattle, this);

        LayerManager.stage.removeChild(loadView);
		WindowManager.closeAllWindow(true);
        SceneManager.getInstance().pushScene( new BattleScene(), this.cellData );
	}
}