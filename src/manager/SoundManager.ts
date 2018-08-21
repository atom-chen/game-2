/**
 * Created by yaozhiguo on 2016/12/1.
 * 音乐管理类
 */
export default class SoundManager
{
    public constructor() {
    }

    public sounds:Object = {};
    public soundChannels:Object = {};
    private volume:number = 1;

    private musicVolume:number = 1;
    private effectVolume:number = 1;

    /**
     * 设置音量，介于0-1之间
     */
    public setVolume(volume:number):void
    {
        for (var soundId in this.soundChannels)
        {
            var channel:egret.SoundChannel = this.soundChannels[soundId];
            if (channel.position != 0)
                channel.volume = volume;
        }
        this.volume = volume;
    }

    /**
     * 播放背景音乐，同时只能播放一个
     */
    public playMusic(soundId: string,startTime: number = 0,loops: number = 1):void
    {
        this.play(soundId, startTime, loops, egret.Sound.MUSIC);
    }

    /**
     * 播放音效，同时可以播放多个
     */
    public playEffect(soundId: string,startTime: number = 0,loops: number = 1):void
    {
        this.play(soundId,startTime,loops,egret.Sound.EFFECT);
    }

    /**
     * 动态播放音效，同时可以播放多个
     */
    public playAsyncEffect(url: string,startTime: number = 0,loops: number = 1):void
    {
        if(this.soundChannels[url] && this.sounds[url])
        {
            this.soundChannels[url].stop();
            var chanel: egret.SoundChannel = this.sounds[url].play(startTime,loops);
            chanel.volume = this.effectVolume;
            this.soundChannels[url] = chanel;
            return;
        }
        RES.getResByUrl("resource/sounds/"+url+".mp3",function(data:any,url:string){
            if (!data)return;
            this.sounds[url] = data;
            this.sounds[url].type = egret.Sound.EFFECT;
            var chanel: egret.SoundChannel = this.sounds[url].play(startTime,loops);
            chanel.volume = this.effectVolume;
            this.soundChannels[url] = chanel;
            console.log('loaded sound:' + url);
        }, this);
    }

    /**
     * 播放一个音乐或者音效
     */
    public play(soundId:string, startTime:number = 0, loops:number = 1, type:string = egret.Sound.EFFECT):void
    {
        if(this.soundChannels[soundId] && this.sounds[soundId])
        {
            this.soundChannels[soundId].stop();
            var chanel: egret.SoundChannel = this.sounds[soundId].play(startTime,loops);
            chanel.volume = type == egret.Sound.EFFECT ? this.effectVolume : this.musicVolume;
            this.soundChannels[soundId] = chanel;
            return;
        }

        RES.getResAsync(soundId,function(data:any,url:string){
            if (!data)return;
            this.sounds[soundId] = data;
            this.sounds[soundId].type = type;
            var chanel: egret.SoundChannel = this.sounds[soundId].play(startTime,loops);
            chanel.volume = type == egret.Sound.EFFECT ? this.effectVolume : this.musicVolume;
            this.soundChannels[soundId] = chanel;
            console.log('loaded sound:' + url);
        }, this);
    }

    /*public stop(soundId:string):void
     {
     this.soundChannels[soundId].stop();
     }*/

    /**
     * 关闭音效或者音乐
     */
    public stop(soundId:string):void
    {
        if (this.sounds.hasOwnProperty(soundId))
        {
            this.soundChannels[soundId].stop();
            // this.sounds[soundId].close();
            delete this.soundChannels[soundId];
            delete this.sounds[soundId];
        }
    }

    /**
     * 关闭音乐
     */
    public stopMusic():void
    {
        for(var soundId in this.soundChannels)
        {
            if (this.sounds[soundId].type === egret.Sound.MUSIC)
            {
                this.soundChannels[soundId].stop();
                // this.sounds[soundId].close();
            }
        }
    }

    /**
     * 关闭所有音效
     */
    public stopEffect():void
    {
        for(var soundId in this.soundChannels)
        {
            if (this.sounds[soundId].type === egret.Sound.EFFECT)
            {
                this.soundChannels[soundId].stop();
                // this.sounds[soundId].close();
            }
        }
    }

    /**
     * 设置音乐音量
     * @param vol 0-1
     */
    public setMusicVolume(vol:number):void
    {
        for(var soundId in this.soundChannels)
        {
            if (this.sounds[soundId].type === egret.Sound.MUSIC)
            {
                let channel:egret.SoundChannel = this.soundChannels[soundId];
                if (channel.position != 0)channel.volume = vol;
            }
        }
        this.musicVolume = vol;
    }

    /**
     * 设置所有音效音量
     * @param vol 0-1
     */
    public setEffectVolume(vol:number):void
    {
        for(var soundId in this.soundChannels)
        {
            if (this.sounds[soundId].type === egret.Sound.EFFECT)
            {
                let channel:egret.SoundChannel = this.soundChannels[soundId];
                if (channel.position != 0)channel.volume = vol;
            }
        }
        this.effectVolume = vol;
    }


    /**
     * 注销所有音效和音乐
     */
    public dispose():void
    {
        for(var soundId in this.soundChannels)
        {
            this.soundChannels[soundId].stop();
            this.sounds[soundId].close();
        }
        this.soundChannels = {};
        this.sounds = {};
    }

    public restoreSoundSetting():void
    {
        var musicState: string = egret.localStorage.getItem('musicSwitch');
        if(musicState == 'on' || !musicState)
        {
            SoundManager.getInstance().setMusicVolume(1);
        }
        else
        {
            SoundManager.getInstance().setMusicVolume(0);
        }
        var effectState: string = egret.localStorage.getItem('effectSwitch');
        if(effectState == 'on' || !effectState)
        {
            SoundManager.getInstance().setEffectVolume(1);
        }
        else
        {
            SoundManager.getInstance().setEffectVolume(0);
        }
    }

    private static _instance:SoundManager;

    public static getInstance():SoundManager
    {
        if (SoundManager._instance == null)
            SoundManager._instance = new SoundManager();
        return SoundManager._instance;
    }
}