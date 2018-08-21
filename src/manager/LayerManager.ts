/**
 * Created by yaozhiguo on 2016/12/1.
 * 本类把游戏舞台stage分成app, pop, tip层，每个层自动匹配舞台大小。层的深度依次增加。
 */

export default class LayerManager
{
    private static _stage:egret.Stage;
    private static _appLayer:eui.UILayer;
    private static _popLayer:eui.UILayer;
    private static _tipLayer:eui.UILayer;

    public constructor()
    {
        throw new Error('Current class could  not be instantiated!');
    }

    public static init(stage:egret.Stage):void
    {
        LayerManager._stage = stage;
        LayerManager.create();
    }

    private static create():void
    {
        LayerManager._appLayer = new eui.UILayer();
        LayerManager._popLayer = new eui.UILayer();
        LayerManager._tipLayer = new eui.UILayer();
        LayerManager._stage.addChild(LayerManager._appLayer);
        LayerManager._stage.addChild(LayerManager._popLayer);
        LayerManager._stage.addChild(LayerManager._tipLayer);
        LayerManager.enableInteractive(LayerManager._appLayer);
        LayerManager.enableInteractive(LayerManager._popLayer);
        LayerManager.enableInteractive(LayerManager._tipLayer);
    }

    private static enableInteractive(layer:eui.UILayer):void
    {
        layer.touchEnabled = true;
        layer.touchChildren = true;
        layer.touchThrough = true;
    }

    /**
     * 游戏的应用层，通常用于渲染
     * @returns {eui.UILayer}
     */
    public static get appLayer():eui.UILayer
    {
        return LayerManager._appLayer;
    }

    /**
     * 游戏的弹窗层
     * @returns {eui.UILayer}
     */
    public static get popLayer():eui.UILayer
    {
        return LayerManager._popLayer;
    }

    /**
     * 鼠标状态（形态）层
     * @returns {eui.UILayer}
     */
    public static get tipLayer():eui.UILayer
    {
        return LayerManager._tipLayer;
    }

    /**
     * 可视化对象的根容器，在调用本类的init方法后即拥有stage对象，可全局访问。
     * @returns {egret.Stage}
     */
    public static get stage():egret.Stage
    {
        return LayerManager._stage;
    }
}
