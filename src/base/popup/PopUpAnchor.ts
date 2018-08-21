import PopUpPosition from "./PopUpPosition";
/**
 * Created by yaozhiguo on 2016/12/1.
 */
export default class PopUpAnchor extends eui.Component
{
    public constructor()
    {
        super();
    }

    public closeDuration: number = 0;
    public displayPopUp:boolean = false;
    public openDuration:number = 0;
    public popUp:eui.Component;
    public popUpHeightMatchesAnchorHeight: boolean = false;
    public popUpPosition:string = PopUpPosition.CENTER;
    public popUpWidthMatchesAnchorWidth:boolean = false;
}