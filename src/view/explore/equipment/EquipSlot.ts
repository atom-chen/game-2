/**
 * 装备卡槽
 * @auther rappel
 * @time 2016-12-22 19:30
 */
import CommonConfig from "../../../enums/CommonConfig";
import ServerManager from "../../../model/net/NetManager";
import EquipSuite from "./EquipSuite";
import WindowManager from "../../../base/popup/WindowManager";
import SoundManager from "../../../manager/SoundManager";
import Protocols from "../../../enums/Protocols";

export default class EquipSlot extends eui.Component {
	public slotType: number;//Slot类型,这个属性一旦设置好,就不要再改变了

	public uniqueId: number;//已装备上去的卡牌唯一ID
	public cardType: number;//已装备上去的卡牌类型,记录当前卡槽装备的是哪一张卡牌
	public allowTypes: Array<number>;//卡槽只允许安装的卡牌类型,对于一些特殊类型的装备,如晶石类型,需要单独考虑

	public slotSuite: EquipSuite;//已装备上去的卡牌信息

	private imgIcon: eui.Image;
	private imgSelected: eui.Image;

	public constructor(slotType:number = CommonConfig.EQUIP_PRIMARY_ATTACK, allowTypes?:Array<number>) {
		super();
		this.skinName = "EquipSlotSkin";

		this.slotType  = slotType;
		this.slotSuite = null;

		this.allowTypes = new Array<number>();
		if(allowTypes && allowTypes.length)
		{
			this.allowTypes = allowTypes;
		}
	}

	protected childrenCreated()
	{
		super.childrenCreated();

		this.imgSelected.visible = false;
		this.imgIcon.source = "common_utils_json.equip_icon_" + this.slotType +"_png";
		this.updateView();

		this.addEventListener( egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this );
		this.addEventListener( mouse.MouseEvent.MOUSE_OVER, this.onMouseRollOverHandler, this );
		this.addEventListener( mouse.MouseEvent.MOUSE_OUT, this.onMouseRollOutHandler, this );
	}

	/**
	 * 给当前卡槽添加卡牌信息,表示玩家安装装备的动作
	 * @param {EquipSlot} slotSuite 该卡槽需要装备上去的卡牌信息
	 */
	public setSlotSuite(slotSuite:EquipSuite)
	{
		if( slotSuite && this.allowTypes && this.allowTypes.length && -1 == this.allowTypes.indexOf(slotSuite.type) ) return;

		this.slotSuite = slotSuite;
		this.cardType  = slotSuite? slotSuite.type:0;
		if(this.slotSuite && this.slotSuite['uuid'])
		{
			this.uniqueId = this.slotSuite['uuid'];
		}
		this.updateView();
	}
	/**
	 * 根据type [1-8]来显示已装备卡槽,如果type不存在或为0就表示未装备
	 */
	private updateView( )
	{
		if(!this.slotSuite)
		{
			this.imgIcon.source = RES.getRes( "common_utils_json.equip_icon_" + this.slotType + "_png" );
		}
		else
		{
			this.imgIcon.source = 'resource/icon/equip/' + this.slotSuite.iconSrc.toLowerCase() + '.png';
		}
	}

	private onTouchHandler(e:egret.TouchEvent)
	{
		SoundManager.getInstance().playEffect('u01_button_mp3');
		if(null == this.slotSuite) return;//该卡槽上没装备

        let equipWin = WindowManager.getWindowByName('EquipWindow');
        let heroId = equipWin['heroInfo']['uuid']; 
		ServerManager.getInstance().callServerSocket(Protocols.ROUTE_USEITEM, {
			hid: heroId,
			id: this.slotSuite.uuid,
			seat: 0
		});
	}

	private onMouseRollOverHandler(e:egret.TouchEvent)
	{
		this.imgSelected.visible = true;
	}

	private onMouseRollOutHandler(e:egret.TouchEvent)
	{
		this.imgSelected.visible = false;
	}

	public isSelected( bIsSelected:boolean )
	{
		this.imgSelected.visible = bIsSelected;
	}

	protected dispose()
	{
		this.slotSuite = null;

		this.removeEventListener( egret.TouchEvent.TOUCH_ROLL_OVER, this.onMouseRollOverHandler, this);
		this.removeEventListener( egret.TouchEvent.TOUCH_ROLL_OUT, this.onMouseRollOutHandler, this);

		this.removeEventListener( egret.TouchEvent.TOUCH_TAP, this.onTouchHandler, this );
		this.removeEventListener( mouse.MouseEvent.MOUSE_OVER, this.onMouseRollOverHandler, this );
		this.removeEventListener( mouse.MouseEvent.MOUSE_OUT, this.onMouseRollOutHandler, this );
	}
}