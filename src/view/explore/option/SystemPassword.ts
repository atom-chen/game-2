// TypeScript file
import BaseWindow from "../../../base/popup/BaseWindow";
import WindowManager from "../../../base/popup/WindowManager";
import SceneManager from "../../../manager/SceneManager";
import DataAccessEntry from "../../../model/DataAccessEntry";
import DataAccessManager from "../../../base/da/DataAccessManager";
import PasswordHelper from "../../mainsceneui/PasswordHelper";

export default class SystemPassword extends BaseWindow
{
    private surebtn:eui.Button;  //确认
    private cancelbtn:eui.Button; //取消
    private newpassword:eui.TextInput;//新密码
    private surepassword:eui.TextInput;//确认密码
    public btnClose:eui.Button;

    private psdHelper:PasswordHelper;
    private psdAgainHelper:PasswordHelper;

    public constructor()
    {
        super();
        this.skinName = 'SystemPasswordSkin';
    }

    protected childrenCreated():void
    {
        super.childrenCreated();
        this.addListeners();
    }

    private addListeners():void
    {
        this.surebtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onsure, this);
        this.cancelbtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.oncancel, this);
    }

    private removeListeners():void
    {
        this.surebtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onsure, this);
        this.cancelbtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.oncancel, this);
    }

    private clearForm():void
    {
        this.newpassword.text = '';
        this.surepassword.text = '';
    }

    private checkPwd(pwd:string, pwdAgain:string):boolean
    {
        if (pwd === pwdAgain)return true;
        if (pwd == '' || pwdAgain == '')return false;
        if (pwd != pwdAgain)return false;
        return true;
    }

    private onsure(event:egret.TouchEvent):void
    {
         WindowManager.closeWindow('SystemPassword');   
    }

     private fileUpload(fileId:string, imgId:string)
    {
        // $('#f').fileinput({
        //     uploadAsync: true,
        //     maxFileSize: 4096,
        //     showUpload: false,
        //     uploadUrl: "/fileupload",
        //     allowedFileExtensions: ["jpg", "png"],
        //     uploadExtraData: {'path' : '/fileupload', 'postName':'file', mimetype:'image/png'}
        //     }).on('fileuploaded', (event, data)=>{
        //         console.log('sssssssssssssssssssssssssssss1');
        //         console.log(data);
        //     }).on('fileloaderror', (event, data)=>{
        //         console.log('sssssssssssssssssssssssssssss2');
        //         console.log(data);
        //     });
        // $('#f').fileinput('upload');
        
        /*var body = {
            filename: 'portrait.png',
            mimetype: 'image/png',
            //path: "db/thang.type/#{@get('original')}",
            path:"/file/player",
            b64png: '',
            force: 'true'};
        $.ajax('/file', {type: 'POST', data: body, success:(data)=>{
            console.log(data);
        }});*/
    }

    private oncancel(event:egret.TouchEvent):void
    {
        WindowManager.closeWindow('SystemPassword', true);
        //  WindowManager.closeWindow(this.name, this.isCache);
        // document.getElementById('code-area').style.display = 'block';
    }

}