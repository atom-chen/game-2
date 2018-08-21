/**
 * 错误展示面板
 * @author rappel
 * @time 2017-3-8 11:30
 */

export default class ProblemAlertView 
{
    private template = _.template(
        "<p><div style='position:absolute; left:3px; width:248px; height:30px;border-bottom:1px solid white;'>"
        +  "<span style='position:relative; left:7px; top: 10px;font-size:14px; color: #ffffff;'>修正你的代码</span>"

        +  "<span style='position:absolute; top:3px; width: 31px; height: 31px; right:-3px;'>"
        +    "<span id='problem-alert-close-btn'" + "onmouseover='this.style.backgroundPosition=\"left -27px\"'" + "onmouseout='this.style.backgroundPosition=\"left top\"'"
                // + "onclick='function() { if(\'none\' == this.parent.parent.style.display) { this.parent.parent.style.display = \'block\';} else {this.parent.parent.style.display = \'none\';}}'"
                + "style='position:absolute; width:27px; height:27px; background:url(\"" + "resource\/battle\/ace\/error_btn\.png" + "\")'" + "></span>"
        +  "</span>"
        +"</div></p>"

        + "<span  style='position:relative; left:7px; top: 34px; font: monaco bold 13px; text-align:left; color:#ffffff;'>可能的错误:</span>"

        + "<% for(var i=0; i<problems.length; ++ i) {%>"
        + "<div style='left:7px; color: #ffffff; display:block; top: <%= 7 * i + 37 %>px; position:relative;line-height:120%'><%= problems[i]['text'] %></div> <% } %>"
        + "</div>"
    );
    private el:any;
    private problems:any;

    private static pInstance:ProblemAlertView;
    constructor() {
        var problems = [{
            'text': 'Unmerged error',
            'raw': 'Merged Warning'
        }];

        this.el = document.getElementById('problem-alert-view');
        this.el.innerHTML = this.template( {'problems':problems} ); 

        var self = this;
        document.getElementById('problem-alert-close-btn').onclick = function(e) {
            self.hideProblems();
        }
    }
  
    public static getInstance():ProblemAlertView
    {
        return this.pInstance || (this.pInstance = new ProblemAlertView());
    }
    
    destroy() {
        // super.destroy()
    }

    public onCloseBtnClick(e) {
        this.hideProblems();
    }

    public setProblems(problems:any) {
        if(!problems || problems.length <= 0) {
            this.hideProblems();   
        }
        else {
            this.showProblems( problems );
        }
    }

    public showProblems(problems?:any)
    {
        problems && problems.length && (this.problems = problems);

        if(this.problems && this.problems.length) {
            this.el.innerHTML = this.template( {'problems': this.problems} ); 
            this.el.visible = true;
            this.el.style.display = 'block';
        }

        if(null == document.getElementById('problem-alert-close-btn').onclick) {
            var self = this;
            document.getElementById('problem-alert-close-btn').onclick = function(e) {
                self.hideProblems();
            }
        }
    }

    public hideProblems()
    {
        this.el.visible = false;
        this.el.style.display = 'none';
    }
}
