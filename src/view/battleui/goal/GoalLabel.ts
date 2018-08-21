import GoalState from "../../../control/goal/GoalState";
/**
 * Created by yaozhiguo on 2016/12/15.
 */
export default class GoalLabel extends egret.Sprite
{
    private _imgState:eui.Image;
    private _txtGoal:egret.TextField;
    private _data:any;

    public get data():any
    {
        return this._data;
    }

    public constructor(data:any, state:number)
    {
        super();
        this._data = data;
        this._imgState = new eui.Image();
        this._txtGoal = new egret.TextField();
        this._txtGoal.text = data.name;
        this._txtGoal.x = 45;
        this._txtGoal.y = 9;
        this._txtGoal.size = 20;
        this._txtGoal.fontFamily = 'Microsoft Yahei';
        // this._txtGoal.bold = true;

        this.addChild(this._imgState);
        this.addChild(this._txtGoal);

        this.setState(state);
    }

    public setState(state:number):void
    {
        if (state === GoalState.FAILED)
        {
            this._txtGoal.textColor   = 0x00fcff;
            this._txtGoal.strokeColor = 0x001d45;
            this._txtGoal.stroke = 2;
            this._imgState.source = '';
        }
        else
        {
            this._txtGoal.textColor   = 0xfef9a1;
            this._txtGoal.strokeColor = 0x4a2b14;
            this._txtGoal.stroke = 2;
            this._imgState.source = 'resource/skin_assets/battlescene/battle_scene_assets/goals/mission_finish_img.png';
        }
    }
}