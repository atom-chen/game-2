import {Turn} from "../scene/SceneObject";
import FrameTweenLite from "../../../base/utils/FrameTweenLite";
/**
 * Created by sam on 2016/11/24.
 * 场景中角色行走留下的脚印
 */
export default class FootPrint extends egret.Bitmap {

    public constructor(position:egret.Point,turn:Turn)
    {
        super();
        this.texture = RES.getRes("foot_png");
        this.anchorOffsetX = 8;
        this.anchorOffsetY = 8;
        if(turn==Turn.UP) this.rotation = 180;
        else if((turn==Turn.LEFT)) this.rotation = -90;
        else if((turn==Turn.RIGHT)) this.rotation = 90;
        this.x = position.x;
        this.y = position.y;
        var _this:FootPrint = this;
        FrameTweenLite.to(this,20,{alpha:0,onComplete:function () {
            if(_this.parent) _this.parent.removeChild(_this);
        },ease:Linear.easeInOut});
    }
}
