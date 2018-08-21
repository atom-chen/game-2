/**
 *
 * @author rappel - ljunkun
 * @time 2016-10-20 15:50
 *
 */

export default class ArenaBtn extends eui.Component
{
    private isDisabled:boolean = true;

    private selected_frame: eui.Image;
    public constructor()
    {
        super();
        this.skinName = 'ArenaBtnSkin';
    }

    protected childrenCreated():void
    {
        super.childrenCreated();

        // this.selected_frame.texture = RES.getRes('main_scene_json.gamefeature_frame_selected');
        if( true == this.isDisabled ) return;
        this.initListeners();
    }

    private onMouseOut(e:MouseEvent)
    {
        this.selected_frame.visible        = false;
    }

    private onMouseOver(e:MouseEvent)
    {
        this.selected_frame.visible        = true;
    }

    private initListeners()
    {
        this.touchEnabled = this.touchChildren = true;
        this.addEventListener(mouse.MouseEvent.MOUSE_OVER, this.onMouseOver, this);
        this.addEventListener(mouse.MouseEvent.MOUSE_OUT,  this.onMouseOut, this);
    }

    private removeListeners()
    {
        this.touchEnabled = this.touchChildren = false;
        this.removeEventListener(mouse.MouseEvent.MOUSE_OVER, this.onMouseOver, this);
        this.removeEventListener(mouse.MouseEvent.MOUSE_OUT,  this.onMouseOut, this);
    }
}