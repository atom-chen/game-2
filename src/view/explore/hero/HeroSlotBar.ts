import HeroSlot from "./HeroSlot";
import HeroInfo from "../../../model/vo/HeroInfo";
/**
 * Created by yaozhiguo on 2017/1/17.
 * HeroSlot的容器，负责对HeroSlot的布局，
 */
export default class HeroSlotBar extends egret.Sprite
{
    private TOP:number = 10;
    private GAP:number = 25;

    private _slots:HeroSlot[];
    private _heroDatas:any[];
    private _selectedSlot:HeroSlot;
    private _selectedData:any;

    //[{x:0,y:0}, {x:120,y:135},{x:160,y:290},{x:120,y:450},{x:0,y:585}];
    private COOD_POINTS:Object[] = [{x:0,y:0}, {x:0,y:180},{x:0,y:360},{x:0,y:540},{x:0,y:720}];

    public get selectedData():any
    {
        return this._selectedData;
    }

    public set selectedData(value:any)
    {
        this._selectedData = value;
        this.setSelectedSlot(value);
    }

    public get selectedSlot():HeroSlot
    {
        return this._selectedSlot;
    }

    public get heroDatas():any[]
    {
        return this._heroDatas;
    }

    public constructor(heroDatas:any[])
    {
        super();
        this._heroDatas = heroDatas;
        this._slots = [];
        for (let i in heroDatas)
        {
            let heroSlot:HeroSlot = new HeroSlot(heroDatas[i]);
            this.addChild(heroSlot);
            this._slots.push(heroSlot);
            heroSlot.addEventListener('heroSlotClicked', this.onSlotClicked, this);
        }
        this.layout();
        if (this._slots.length > 0)
        {
            this._selectedData = heroDatas[0];
            this._selectedSlot = this._slots[0];
        }
    }

    private layout():void
    {
        for (let i in this._slots)
        {
            let heroSlot:HeroSlot = this._slots[i];
            //let index:number = parseInt(i);
            //heroSlot.x = 0;
            //heroSlot.y = this.TOP + heroSlot.height * index + this.GAP * (index + 1);
            heroSlot.x = this.COOD_POINTS[i]['x'];
            heroSlot.y = this.COOD_POINTS[i]['y'];
        }
    }

    private onSlotClicked(event:egret.Event):void
    {
        let heroSlot:HeroSlot = event.currentTarget;
        this.setSelectedSlot(heroSlot.heroData);
        this.dispatchEvent(new egret.Event('slotClicked', false,false, this._selectedData));
    }

    public setSelectedSlot(heroData:any):void
    {
        this._selectedData = heroData;
        this._selectedSlot = this.getSlotByData(heroData);
        for (let i in this._slots)
        {
            let heroSlot:HeroSlot = this._slots[i];
            if (this.selectedSlot == heroSlot)
            {
                if (heroSlot.heroData instanceof HeroInfo)
                {
                    heroSlot.state = HeroSlot.NORMAL_SELECTED;
                }
                else
                {
                    heroSlot.state = HeroSlot.LOCK_SELECTED;
                }
            }
            else
            {
                if (heroSlot.heroData instanceof HeroInfo)
                {
                    heroSlot.state = HeroSlot.NORMAL_UNSELECTED;
                }
                else
                {
                    heroSlot.state = HeroSlot.LOCK_UNSELECTED;
                }
            }
        }
    }

    public getSlotByData(heroData:any):HeroSlot
    {
        for (let i in this._slots)
        {
            let heroSlot:HeroSlot = this._slots[i];
            if (heroSlot.heroData == heroData)return heroSlot;
        }
        return null;
    }

    public dispose():void
    {
        for (let i in this._slots)
        {
            let heroSlot:HeroSlot = this._slots[i];
            heroSlot.addEventListener('heroSlotClicked', this.onSlotClicked, this);
            heroSlot.dispose();
        }
        this._slots = null;
    }
}