/**
 * Created by sam on 2016/11/24.
 * 场景中无生命参与碰撞的单位
 */

import SceneMoveObject from './SceneMoveObject';
import Person from "./Person";
import Hero from "./Hero";
import LoadBitmap from "../sprite/LoadBitmap";
import FrameTweenLite from "../../../base/utils/FrameTweenLite";

export const enum ItemType {
    NONE = 0,
    NORMAL = 1,
    EVENTPOINT = 2,
    BOTTLE = 3,
    BOX = 4,
    PATHPOINT = 5,
    OTHERS = 6
}

export default class SceneItem extends SceneMoveObject {
    private _pickabled:boolean = true;
    private _picked:boolean = false;
    private _openabled:boolean = true;
    public get pickabled()
    {
        return this._pickabled;
    }

    public set pickabled(pa:boolean)
    {
        this._pickabled = pa;
    }

    public get picked()
    {
        return this._picked;
    }

    public get openabled()
    {
        return this._openabled;
    }

    public set openabled(oa:boolean)
    {
        this._openabled = oa;
    }

    public constructor()
    {
        super();
    }

    public setData(dat)
    {
        super.setData(dat);
    }

    public restart():void
    {
        super.restart();
        this._picked = false;
        if(Number(this._data.whocollect)>0) this._pickabled = true;
        else this._pickabled = false;
        if(Number(this._data.openable)>0) this._openabled = true;
        else this._openabled = false;
    }

    public idle()
    {
        super.idle();
        this.alpha = 1;
        this.scaleX = 1;
        this.scaleY = 1;
    }

    public pickedByPerson(person:Person)
    {
        if (this.pickabled || this.openabled)
        {
            this._picked = true;
            if(this.gameWorld) this.gameWorld.addDeadNames(this.name);
            if(this.getData().buff.length>0)
            {
                var buffs: string[] = this.getData().buff.split("|");
                for (var i = 0; i < buffs.length; i++)
                {
                    if (Number(buffs[i]) > 0) person.addBuff(Number(buffs[i]));
                }
            }
            if(this.getData().drop_type.length>1)
            {
                var drops: string[] = this.getData().drop_type.split("|");
                for (var i = 0; i < drops.length; i++)
                {
                    if(Number(drops[i])>700000){
                        person.playEvent(drops[i]);
                    }else{
                        var bit:LoadBitmap = new LoadBitmap("resource/battle/drop/" + drops[i] + ".png");
                        bit.x = this.x;
                        bit.y = this.y;
                        this.gameWorld.addEffect(bit);
                        FrameTweenLite.to(bit,0.6,{delay:0.1*i,x:bit.x + 10 - Math.random()*20,y:bit.y - Math.random()*20});
                        FrameTweenLite.to(bit,0.2,{delay:0.1*i+0.6,scale:0,x:person.x,y:person.y,onComplete:function () {
                            if(bit.parent) bit.parent.removeChild(bit);
                        }});
                    }
                }
            }
            this.disappear();
            this.pickabled = false;
            this.openabled = false;
            if(person instanceof Hero) person.pick(this.name);
        }
    }

    public disappear()
    {
        FrameTweenLite.to(this,0.5,{delay:0.3,alpha:0,scale:0});
    }
}
