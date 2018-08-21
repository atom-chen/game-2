
/**
 * 一个多线程,用于单独处理编辑器的语法检查
 * @author rappel
 * @time 2017-3-3 16:10
 */
import Editor = AceAjax.Editor;
import EditorAdapter from "./EditorAdapter";

export default class SyntaxCheckLoop
{
    private editor: Editor;
    private language:string;
    private worker: Worker;
    
    constructor(editorAdapter:EditorAdapter, language:string)
    {
        this.editor = editorAdapter.editor;
        //Worker
        this.worker = new Worker('js/worker.js');

        let userCode = this.editor.getValue();
        this.worker.postMessage({
            'type': 'transpile',
            'rawCode': userCode
        });
        
        var notifyErrors = (function(e) {
            let data = e.data;
            let type = data['type'];
            if('compile_info' == type) {
                let problems = data['problems'];
                let errors   = problems['errors'];
                // if(errors && errors.length > 0)
                {
                    errors.forEach(function(error) {
                        error['type']= 'error';
                        error['row'] = (error['range'] && error['range'][0] && error['range'][0]['row']);
                        error['text']= error['message'];
                    });
                    this.editor.renderer.setAnnotations( errors );
                    editorAdapter['problemShow']['setProblems']( errors );
                }
            }
        }).bind(this);

        this.worker.onmessage = notifyErrors;
    }

    public transpile(userCode?:any)
    {
        if(!userCode) {
            userCode = this.editor.getValue();
        }
    
        this.worker.postMessage({
            'type': 'transpile',
            'rawCode': userCode
        });
    }

    public changeLanguage(language:string)
    {
        this.worker.postMessage({
            'type': 'change_language',
            'language': language
        });
    }

    public terminate() {
        this.worker && this.worker.terminate();
    }
}