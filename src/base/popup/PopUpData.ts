import {IPopUp} from "./IPopUp";
/**
 * Created by yaozhiguo on 2016/12/1.
 */
export default class PopUpData
{
    public constructor(popUp?:IPopUp, modal?:boolean)
    {
        this.popUp = popUp;
        this.modal = modal;
    }

    public popUp:IPopUp;
    public modal:boolean = false;
}