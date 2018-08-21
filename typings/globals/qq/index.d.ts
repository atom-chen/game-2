/**
 * Created by yaozhiguo on 2017/2/7.
 */
declare module QC{
    module Login{
        function showPopup(opts:any);
        function signOut();
        function check();
        function getMe(callback:Function);
    }

    function Login(opts);
}