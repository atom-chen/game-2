/**
 * Created by sam on 2017/02/07.
 * 带自加载功能的图片
 */
export default class LoadBitmap extends egret.Bitmap {

    public constructor(address:string)
    {
        super();
        RES.getResByUrl(address,this.onComplete,this,RES.ResourceItem.TYPE_IMAGE);
    }

    private onComplete(event:any):void
    {
        this.texture = <egret.Texture>event;
    }
}
