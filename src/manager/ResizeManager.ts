import Globals from "../enums/Globals";
/**
 * Created by yaozhiguo on 2016/11/30.
 */
export default class ResizeManager
{
    public static init():void
    {
        ResizeManager.resizeView();
        window.addEventListener('resize', function(event){
            ResizeManager.resizeView();
        }, false);
    }

    public static resizeView():void
    {
        var realWidth:number = 0;
        var realHeight:number = 0;
        var left:number = 0;
        var top:number = 0;
        if (window.innerWidth / window.innerHeight >= Globals.GAME_WIDTH / Globals.GAME_HEIGHT)
        {
            realHeight = window.innerHeight;
            realWidth = realHeight * Globals.GAME_WIDTH / Globals.GAME_HEIGHT;
            left = (window.innerWidth - realWidth) * 0.5;
        }
        else
        {
            realWidth = window.innerWidth;
            realHeight = realWidth * Globals.GAME_HEIGHT / Globals.GAME_WIDTH;
            top = (window.innerHeight - realHeight) * 0.5;
        }
        //console.log(realWidth, realHeight, left, top);
        Globals.domGameWidth = realWidth;
        Globals.domGameHeight = realHeight;
        Globals.scaleRatio = realWidth / Globals.GAME_WIDTH;

        document.getElementById('code-area').style.left = (realWidth * Globals.BATTLE_AREA_WIDTH_RATIO + left + 10) + 'px';
        document.getElementById('code-area').style.top = (top + 20) + 'px';
        document.getElementById('code-area').style.width = (realWidth * (1 - Globals.BATTLE_AREA_WIDTH_RATIO) - 20) + 'px';
        document.getElementById('code-area').style.height = (realHeight * Globals.CODE_AREA_HEIGHT_RATIO - 70) + 'px';
        //console.log(document.querySelector('ace ace_editor ace-tm'));
        var aceWidth:string = realWidth * (1 - Globals.BATTLE_AREA_WIDTH_RATIO) - 45 + 'px';
        var aceHeight:string = (realHeight * Globals.CODE_AREA_HEIGHT_RATIO - 120) + 'px';
        /*$('#code-area .ace').css('width', aceWidth);
        $('#code-area .ace').css('height', aceHeight);

        $('#code-area .ace_content').css({
            'width': aceWidth,
            'height': aceHeight
        });*/
        //document.getElementById('storyArea').style.left = ((realWidth - 444)/2 + left) + 'px';
        //document.getElementById('storyArea').style.top = ((realHeight - 540)/2 + top) + 'px';

        document.getElementById('problem-alert-view').style.top = (110 + top) + 'px';
        document.getElementById('problem-alert-view').style.left = ((realWidth * Globals.BATTLE_AREA_WIDTH_RATIO - 255) + left) + 'px';
    }
}