/**
 *
 * @author rappel - ljunkun
 * @time 2016-10-20 15:30
 *
 */

export default class ExploreWayBtn extends eui.Component
{
    private isDisabled:boolean = false;

    private gamefeature_display: eui.Image;
    private gamefeature_name: eui.Image;
    private selected_frame: eui.Image;

    public campaign_name_display: eui.Image;
    public campaign_name_selected: eui.Image;
    public gamefeature_disabled: eui.Image;

    private level_start_0: eui.Image; private level_start_1: eui.Image; private level_connect: eui.Image;
    private level_end_0: eui.Image;   private level_end_1: eui.Image;
    private level_chunk: string;

    public constructor( options?:any )
    {
        super();

        this.skinName = 'ExploreWayBtnSkin';
        this.name = 'btnExploreWay';
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.campaign_name_display.texture    = RES.getRes('main_scene_json.campaign_word_normal_1');

        if( true == this.isDisabled ) return;
        this.initListeners();
    }

    /**
     * 设置当前关卡进度
     * @param {string} levelTip eg: "1-3", "10-7" 
     */
    public setCurrLevelTip(levelTip:string, state?:string)
    {
        this.level_start_0.visible = this.level_start_1.visible = this.level_end_0.visible = this.level_end_1.visible = false;
        this.level_connect.visible = true;

        levelTip || (levelTip = "1-1");
        this.level_chunk = levelTip;

        if(undefined == state || "normal" == state) state = "blue";
        if("selected" == state) state = "yellow";

        let tip = levelTip.split('-'), mapIndex = tip[0], levelIndex = tip[1];
        if( 2 == mapIndex.length )
        {
            this.level_start_0.visible = this.level_start_1.visible = true;

            this.level_start_0.texture = RES.getRes('common_utils_json.num_' + state + '_' + mapIndex[0] + '_png');
            this.level_start_1.texture = RES.getRes('common_utils_json.num_' + state + '_' + mapIndex[1] + '_png');
        }
        else if( 1 == mapIndex.length )
        {
            this.level_start_1.visible = true;
            this.level_start_0.visible = false;

            this.level_start_1.texture = RES.getRes('common_utils_json.num_' + state + '_' + mapIndex[0] + '_png');
        }

        this.level_connect.texture = RES.getRes('common_utils_json.num_' + state + '_and_png');
        if( 2 == levelIndex.length)
        {
            this.level_end_0.visible = this.level_end_1.visible = true;

            this.level_end_0.texture = RES.getRes('common_utils_json.num_' + state + '_' + levelIndex[0] + '_png');
            this.level_end_1.texture = RES.getRes('common_utils_json.num_' + state + '_' + levelIndex[1] + '_png');
        }
        else if( 1 == levelIndex.length )
        {
            this.level_end_0.visible = true;
            this.level_end_1.visible = false;

            this.level_end_0.texture = RES.getRes('common_utils_json.num_' + state + '_' + levelIndex[0] + '_png');
        }
    }

    private onMouseOut(e:MouseEvent)
    {
        this.gamefeature_display.texture   = RES.getRes('main_scene_json.gamefeature_display_normal');
        this.gamefeature_name.texture      = RES.getRes('main_scene_json.gamefeature_word_normal_1');

        this.campaign_name_display.texture = RES.getRes('main_scene_json.campaign_word_normal_1');
        this.setCurrLevelTip(this.level_chunk, "normal");
    }

    private onMouseOver(e:MouseEvent)
    {
        this.gamefeature_display.texture   = RES.getRes('main_scene_json.gamefeature_display_selected');
        this.gamefeature_name.texture      = RES.getRes('main_scene_json.gamefeature_word_selected_1');

        this.campaign_name_display.texture = RES.getRes('main_scene_json.campaign_word_selected_1');
        this.setCurrLevelTip(this.level_chunk, "selected");
    }

    private initListeners()
    {
        this.touchEnabled = true;
        this.touchChildren = false;
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