import BaseWindow from "../../../base/popup/BaseWindow";
import WindowManager from "../../../base/popup/WindowManager";
import SoundManager from "../../../manager/SoundManager";
import SceneManager from "../../../manager/SceneManager";
import BattleScene from "../../battlescene/BattleScene";
import BattleResultWindow from "../battleresult/BattleResultWindow";
/**
 * Created by yaozhiguo on 2016/12/13.
 */
export default class BattleSettingWindow extends BaseWindow
{
    public btnQuit:eui.Button;
    public btnContinue:eui.Button;
    public btnMusic:eui.ToggleButton;
    public btnSound:eui.ToggleButton;
    public btnReload:eui.Button;

    public constructor(name?:string)
    {
        super(name);
        this.skinName = 'BattleSettingWindowSkin';
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.addListeners();

        let effectState: string = egret.localStorage.getItem('effectSwitch');
        if(effectState == 'on' || !effectState)
        {
            this.btnSound.selected = false;
        }
        else
        {
            this.btnSound.selected = true;
        }

        let musicState: string = egret.localStorage.getItem('musicSwitch');
        if(musicState == 'on' || !musicState)
        {
            this.btnMusic.selected = false;
        }
        else
        {
            this.btnMusic.selected = true;
        }
    }
    
     private addListeners():void
    {
        this.btnQuit.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onQuit, this);
        this.btnContinue.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onContinue, this);
        this.btnReload.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onReload, this);
        this.btnMusic.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onMusic, this);
        this.btnSound.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onSound, this);
    }

    private removeListeners():void
    {
        this.btnQuit.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onQuit, this);
        this.btnContinue.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onContinue, this);
        this.btnReload.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onReload, this);
        this.btnMusic.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onMusic, this);
        this.btnSound.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onSound, this);
    }

    private onQuit(event:egret.TouchEvent):void
    {
        WindowManager.closeWindow('BattleSettingWindow', true);
        let battleScene:BattleScene = <BattleScene>(SceneManager.getInstance().getRunningScene());
        battleScene.battleUI.skip(BattleResultWindow.SKIP_CONITNUE);
        SceneManager.getInstance().popScene();
    }

    private onContinue(event:egret.TouchEvent):void
    {
        WindowManager.closeWindow('BattleSettingWindow', true);
        document.getElementById('code-area').style.display = 'block';
    }

    private onMusic(event:egret.TouchEvent):void
    {
        if (this.btnMusic.selected)
        {
            SoundManager.getInstance().setMusicVolume(0);
            egret.localStorage.setItem('musicSwitch', 'off');
        }
        else
        {
            SoundManager.getInstance().setMusicVolume(1); 
            egret.localStorage.setItem('musicSwitch', 'on');   
        } 
    }

    private onSound(event:egret.TouchEvent):void
    {
        if (this.btnSound.selected)
        {
            SoundManager.getInstance().setEffectVolume(0);
            egret.localStorage.setItem('effectSwitch', 'off');
        }
        else
        {
            SoundManager.getInstance().setEffectVolume(1); 
            egret.localStorage.setItem('effectSwitch', 'on');   
        } 
    }

    private onReload(event:egret.TouchEvent):void
    {
        console.log("重新开始");
        WindowManager.closeWindow('BattleSettingWindow', true);
        document.getElementById('code-area').style.display = 'block';
        let battleScene:BattleScene = <BattleScene>SceneManager.getInstance().getRunningScene();
        battleScene.fightReload();
    }

    public onCloseClick(e:egret.TouchEvent):void
    {
        super.onCloseClick(e);
        document.getElementById('code-area').style.display = 'block';
    }
}