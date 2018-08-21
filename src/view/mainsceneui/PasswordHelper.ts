/**
 * Created by yaozhiguo on 2017/2/7.
 * 这个类用于修正egret密码输入框的bug：输入密码时，密码依旧是明文显示，焦点移除才恢复为隐藏字符。
 * 本类监听文本输入，实时切换输入字符为隐藏字符。
 */
export default class PasswordHelper
{
    private txtPassword:eui.TextInput;

    public constructor(txtPassword:eui.TextInput)
    {
        this.txtPassword = txtPassword;
        this.txtPassword.displayAsPassword = true;
        this.txtPassword.textDisplay.addEventListener(egret.Event.CHANGE,this.onPsdChanged,this);
        this.txtPassword.textDisplay.displayAsPassword = true;
    }

    private getCursortPosition(ctrl: HTMLInputElement) {
        var CaretPos = 0;   // IE Support
        if(document['selection']) {
            ctrl.focus();
            document.getSelection().getRangeAt(0);
            var Sel = document['selection'].createRange();
            Sel.moveStart('character',-ctrl.value.length);
            CaretPos = Sel.text.length;
        }
        // Firefox support
        else if(ctrl.selectionStart || ctrl.selectionStart == 0)
            CaretPos = ctrl.selectionStart;
        return (CaretPos);
    }

    private insertAt(str: string,substr: string,pos: number): string {
        var newstr = "";
        if(str.length == 0) {
            newstr = substr;
            return newstr;
        }
        var newstr = str.substring(0,pos) + substr + str.substring(pos,str.length);
        return newstr;
    }

    private removeAt(str: string,pos: number,len: number): string {
        str = str.substring(0,pos) + str.substring(pos + len,str.length);
        return str;
    }

    private currentPsdChars: string = '';

    private onPsdChanged(event): void {
        var currentPsd: string = event.currentTarget.text;
        var he: HTMLInputElement = <HTMLInputElement>$('#egretInput').get(0);
        var curPos: number = this.getCursortPosition(he);

        if(currentPsd.length > this.currentPsdChars.length) {
            var newChar = currentPsd.substr(curPos - 1,1);
            this.currentPsdChars = this.insertAt(this.currentPsdChars,newChar,curPos - 1);
        }
        else {
            var delChar = currentPsd.substr(curPos,1);
            this.currentPsdChars = this.removeAt(this.currentPsdChars,curPos,1);
        }
        var result: string = '';
        for(var i = 0;i < currentPsd.length;i++) {
            result += '*';
        }
        this.txtPassword.textDisplay.text = result;
        //        console.log(currentPsd);
        //        console.log(this.currentPsdChars);
    }

    public get passwordChars():string
    {
        return this.currentPsdChars;
    }

    public dispose():void
    {
        this.txtPassword.textDisplay.removeEventListener(egret.Event.CHANGE,this.onPsdChanged,this);
        this.txtPassword = null;
    }
}