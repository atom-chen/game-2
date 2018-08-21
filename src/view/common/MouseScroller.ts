/**
 * Created by yaozhiguo on 2017/3/14.
 * egret不支持鼠标滚轮，这里是一个简单的实现。
 */
import IViewport = eui.IViewport;
import ScrollPolicy = eui.ScrollPolicy;
export default class MouseScroller
{
    public static enableMouseScroller(scroller:eui.Scroller):void
    {
        scroller.addEventListener(mouse.MouseEvent.MOUSE_OVER,(e) => {

            scroller.scrollPolicyV = ScrollPolicy.ON;
            if (scroller.verticalScrollBar)scroller.verticalScrollBar.visible = true;
            $('.egret-player').bind('mousewheel', (event)=>{

                let delta:number = (<WheelEvent>event.originalEvent).deltaY/5;
                let viewport:IViewport = scroller.viewport;
                let up:number = 0;
                let down:number = viewport.contentHeight - viewport.height;
                if (down <= 0)return;
                scroller.verticalScrollBar.visible = true;
                if (viewport.scrollV <= up)
                {
                    viewport.scrollV = up;
                }
                else if (viewport.scrollV >= down)
                {
                    viewport.scrollV = down;
                }
                viewport.scrollV += delta;
            });
        }, this);

        scroller.addEventListener(mouse.MouseEvent.MOUSE_OUT,(e) => {
            scroller.scrollPolicyV = ScrollPolicy.AUTO;
            $('.egret-player').unbind('mousewheel');
        }, this);
    }

    public static enableMouseScrollView(scrollView:egret.ScrollView, offset?:number):void
    {
        scrollView.touchEnabled = true;

        scrollView.addEventListener(mouse.MouseEvent.MOUSE_OVER,(e) => {

            $('.egret-player').bind('mousewheel', (event)=>{

                let contentHeight:number = scrollView._getContentHeight();
                if (contentHeight <= scrollView.height)return;
                let delta:number = (<WheelEvent>event.originalEvent).deltaY/5;
                let up:number = 0;
                let down:number = contentHeight - scrollView.height + (offset || 0);
                if (scrollView.scrollTop <= up)
                {
                    scrollView.scrollTop = up;
                }
                else if (scrollView.scrollTop >= down)
                {
                    scrollView.scrollTop = down;
                }
                scrollView.scrollTop += delta;
            });
        }, this);

        scrollView.addEventListener(mouse.MouseEvent.MOUSE_OUT,(e) => {
            $('.egret-player').unbind('mousewheel');
        }, this);
    }
}