import BasePlatform from "./BasePlatform";
import QQPlatform from "./QQPlatform";
import MaliPlatform from "./MaliPlatform";
/**
 * Created by yaozhiguo on 2017/3/22.
 */
export default class Platform
{
    public static currentPlatform:BasePlatform;

    public static createPlatform(platformName:string):BasePlatform
    {
        let platform:BasePlatform;
        //let platformId = egret.localStorage.getItem('platform');
        if (platformName == 'qq')
        {
            platform = new QQPlatform();
        }
        else if (platformName == 'mali')
        {
            platform = new MaliPlatform();
        }
        else
        {
            platform = new MaliPlatform();
        }
        this.currentPlatform = platform;
        return platform;
    }
}