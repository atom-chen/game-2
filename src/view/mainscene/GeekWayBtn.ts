/**
 *
 * @author rappel - ljunkun
 * @time 2016-10-20 15:40
 *
 */

export default class GeekWayBtn extends eui.Component
{
    private isDisabled:boolean = true;

    private gamefeature_display: eui.Image;
    private gamefeature_name: eui.Image;

    private campaign_name_display: eui.Image;
    private campaign_name_selected: eui.Image;
    private gamefeature_disabled: eui.Image;

    public constructor()
    {
        super();
        this.skinName = 'GeekWayBtnSkin';
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        // this.campaign_name_display.texture    = RES.getRes('main_scene_json.campaign_word_normal_2');

        if( true == this.isDisabled ) return;
        this.initListeners();
    }

    private onMouseOut(e:MouseEvent)
    {
        this.gamefeature_display.texture   = RES.getRes('main_scene_json.gamefeature_display_normal_2');
        this.gamefeature_name.visible     = RES.getRes('main_scene_json.gamefeature_word_normal_2');

        this.campaign_name_display.texture = RES.getRes('main_scene_json.campaign_word_normal_2');
    }

    private onMouseOver(e:MouseEvent)
    {
        this.gamefeature_display.texture   = RES.getRes('main_scene_json.gamefeature_display_selected_2');
        this.gamefeature_name.visible     = RES.getRes('main_scene_json.gamefeature_word_selected_2');

        this.campaign_name_display.texture = RES.getRes('main_scene_json.campaign_word_selected_2');
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