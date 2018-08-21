/**
 * Created by sam on 2016/11/24.
 * 场景中角色行走留下的花瓣
 */
export default class Flower extends egret.Bitmap {

    public constructor(textrueName:string,position:egret.Point)
    {
        super();
        this.texture = RES.getRes(textrueName);
        this.anchorOffsetX = 8;
        this.anchorOffsetY = 8;
        this.x = position.x;
        this.y = position.y;
    }
}
