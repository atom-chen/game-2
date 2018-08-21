import BasePlatform from "./BasePlatform";
/**
 * Created by yaozhiguo on 2017/2/9.
 */
export default class QQPlatform extends BasePlatform
{
    public constructor()
    {
        super();
        this.appID = "101371743";
        this.redirectURI = "//localhost:9999";
        this.root = 'https://graph.qq.com/';
    }

    public openLogin():void
    {
        var path = 'https://graph.qq.com/oauth2.0/authorize?';
        var queryParams = ['client_id=' + this.appID,'redirect_uri=' + this.redirectURI,
            'scope=' + 'get_user_info,list_album,upload_pic,add_feeds,do_like','response_type=token'];

        var query = queryParams.join('&');
        var url = path + query;
        window.open(url, '_self');
    }

    public checkRedirectUrl(callback:Function=null):void
    {
        if (window.location.hash.length > 0){
            //获取access token
            var accessToken = window.location.hash.substring(1);
            this.accessToken = accessToken;
            //使用Access Token来获取用户的OpenID
            var path = "https://graph.qq.com/oauth2.0/me?";
            var queryParams = [accessToken, 'callback=userCallback'];
            var query = queryParams.join('&');
            var url = path + query;
            var script = document.createElement('script');
            script.src = url;
            document.body.appendChild(script);
        }

        let self = this;

        function userCallback(response){
            this.platformUserId = response.openid;
            if (this.platformUserId){
                var path = 'https://graph.qq.com/user/get_user_info?';
                var params = ['access_token=' + self.accessToken, 'oauth_consumer_key=' + self.appID, 'openid=' + self.platformUserId, 'callback=infoCallback'];
                var query = params.join('&');
                var url = path + query;
                var script = document.createElement('script');
                script.src = url;
                document.body.appendChild(script);
            }
        }

        function infoCallback(response){
            if (response['ret'] == 0){
                response['nickname'];
                response['gender'];
                response['figureurl'];

                self.userObject = response;
                if (callback){
                    callback(response);
                }
            }
        }
    }
}