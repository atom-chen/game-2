import IEventDispatcher = egret.IEventDispatcher;
import Editor = AceAjax.Editor;
import CodeEngine from "./CodeEngine";
import SceneObjectActor from "../control/actions/SceneObjectActor";
import Interval from "../base/utils/Interval";
import EditorAdapter from "../editor/EditorAdapter";
import UserInfo from "../model/vo/UserInfo";
import DataAccessManager from "../base/da/DataAccessManager";
import DataAccessEntry from "../model/DataAccessEntry";
/**
 * Created by yaozhiguo on 2017/3/2.
 * 用户代码的处理类，包含编辑器和代码执行引擎两个部分。
 */

export default class UserCodeWorker extends egret.EventDispatcher
{
    private _editorAdapter: EditorAdapter;
    private _markers:any[];
    private _language:string;
    private _codeEngine:CodeEngine;
    private _actor:SceneObjectActor;
    private _lastActionInterval:number;//代码执行的步进间隔
    private _isComplete:boolean = false;//是否彻底执行完所有动作，代码引擎执行

    public constructor(actor?:SceneObjectActor, target?:IEventDispatcher)
    {
        super(target);
        this._markers = [];
        this._actor = actor;
    }

    public get actor():SceneObjectActor
    {
        return this._actor;
    }

    /**
     * 代码是否执行完毕；暂停并不表示执行完。只有用户输入的代码全部运行结束才算完毕。
     * @returns {boolean}
     */
    public get isComplete():boolean
    {
        return this._isComplete;
    }

    public init():void
    {
        let userInfo:UserInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
        this._editorAdapter = new EditorAdapter();
        this._editorAdapter.init(userInfo.language);
        this._editorAdapter.show();
        this._codeEngine = new CodeEngine(this._editorAdapter.language);
        this._codeEngine.setStepExecutor(this.tick, this);
        this._language = this._editorAdapter.language;
        this._editorAdapter.addEventListener('EditEvent', this.onEditEvent, this);
    }

    public runCode():void
    {
        this.reset();
        this._codeEngine.setCode(this._editorAdapter.editor.getValue());
        this._codeEngine.compile();
        this._codeEngine.addObject('hero', this._actor);
        this._codeEngine.start();

        let compileInfo = this._codeEngine.getCompileInfo();
        var errors = [];
        if(compileInfo) {
            errors = compileInfo['problems']['errors'];
            errors.forEach( function(error) {
                error['type']= 'error';
                error['row'] = (error['range'] && error['range'][0] && error['range'][0]['row']);
                error['text']= error['message'];
            });
        }
        this._editorAdapter.editor.renderer.setAnnotations( errors );
        this._editorAdapter['problemShow']['setProblems']( errors );
        
        this.actor['startTick'] = egret.getTimer();//记录代码开始运行的时刻
        //this.printExecutedMethod();
    }

    private tick():void
    {
        this.clearMarkers();//清除编辑器标记
        if (this._actor.isLock)return;//代码处于阻塞状态，比如，英雄处于move或者attack时
        if (this._codeEngine.lastAST)//设置高亮部分
        {
            this.setAstCodeHighLight(this._codeEngine.lastAST);
        }
        let result = this._codeEngine.stepOne();//执行一步
        if (result)//如果代码执行完毕，返回true
        {
            this.stop();
            Interval.clearInterval(this._lastActionInterval);
            //最后一个动作完全执行完毕才算结束
            this._lastActionInterval = Interval.setInterval(()=>{
                if (!this._actor.isLock)
                {
                    Interval.clearInterval(this._lastActionInterval);
                    this._isComplete = true;
                    this._editorAdapter.editor.getSession().selection.clearSelection();
                    this.dispatchEvent(new egret.Event('codeRunComplete'));
                }
            }, this, 200);
        }
    }

    private onEditEvent(event:egret.Event):void
    {
        this.dispatchEvent(event);
    }

    private reset():void
    {
        Interval.clearInterval(this._lastActionInterval);
        this._isComplete = false;
        this._codeEngine.reset();
    }

    private clearMarkers():void
    {
        this._markers = [];
    }

    public setEditorText(text:string):void
    {
        this._editorAdapter.editor.setValue(text, 1);
    }

    public getEditorText():string
    {
        return this._editorAdapter.editor.getSession().getValue();
    }

    public insertEditorText(text:string):void
    {
        this._editorAdapter.editor.insert(text);
    }

    public insertSnippet(snippet:any)
    {
        this._editorAdapter.editor['completer'] && this._editorAdapter.editor['completer'].insertMatch(snippet, this._editorAdapter.editor);
    }
    public getEffectiveCodeLine():number
    {
        return this._editorAdapter.getValidCodeLines();
    }

    public stop():void
    {
        this._codeEngine.stop();
        this.reset();
    }

    public dispose():void
    {
        Interval.clearInterval(this._lastActionInterval);
        this._editorAdapter.removeEventListener('EditEvent', this.onEditEvent, this);
        this._codeEngine.stop();
        this._codeEngine.dispose();
        this._actor.dispose();
        this.clearMarkers();
        this._markers = null;
        this._editorAdapter.dispose();
        this._editorAdapter = null;
        this._actor = null;
    }

    /**
     * 不同语言的语法树结构不完全相同，单独处理高亮显示
     * @param ast
     */
    private setAstCodeHighLight(ast:any):void
    {
        switch (this._language)
        {
            case 'javascript':
            {
                this.setJSAstCodeHighLight(ast);
                break;
            }
            case 'python':
            {
                this.setPythonAstCodeHighLight(ast);
                break;
            }
        }
    }

    /**
     * JavaScript 高亮设置
     */
    private setJSAstCodeHighLight(ast:any):void
    {
        let range = ast.loc;
        let Range = ace.require('./range').Range;
        let rr = new Range(range.start.line - 1, range.start.column, range.end.line - 1, range.end.column);
        this._markers.push(this._editorAdapter.editor.getSession().addMarker(rr,'executing', 'text', true));
        // this._editorAdapter.editor.getSession().selection.setRange(rr, false);
        this.highlightCurrGutterLine(range.start.row);
        console.log(range.start.line - 1, range.start.column, range.end.line - 1, range.end.column);
    }

    /**
     * Python 高亮设置
     */
    private setPythonAstCodeHighLight(ast:any):void
    {
        let range = ast.originalRange;
        if (!range)return;
        let startLine = range.start.row;
        let startColumn = range.start.col;
        let endLine = range.end.row;
        let endColumn = range.end.col;
        let initStartLine = startLine;
        let initEndColumn = endColumn;
        //special handle issue
        if (ast.srcName && ast.type === 'CallExpression')
        {
            let lineNum:number = this._editorAdapter.editor.getSession().getLength();
            let srcPart:string = ast.srcName.split('(')[0]; //just like 'hero.moveLeft'
            let line:string = this._editorAdapter.editor.getSession().getLine(initStartLine);
            while (line.indexOf(srcPart) === -1)
            {
                line = this._editorAdapter.editor.getSession().getLine(++initStartLine);
                if (line.indexOf(srcPart) != -1)
                {
                    initEndColumn = srcPart.length;
                }
                if (initStartLine >= lineNum)
                {
                    initStartLine = startLine;
                    initEndColumn = endColumn;
                    break;
                }
            }
            startLine = endLine = initStartLine;
            endColumn = initEndColumn;
        }
        let Range = ace.require('./range').Range;
        let rr = new Range(startLine, startColumn, endLine, endColumn);
        this._markers.push(this._editorAdapter.editor.getSession().addMarker(rr,'executing', 'text', true));
        // this._editorAdapter.editor.getSession().selection.setRange(rr, false);

        this.highlightCurrGutterLine(startLine);
        if (ast.srcName && ast.srcName.indexOf('.') != -1)
        {
            // console.log(startLine, startColumn, endLine, endColumn, ast.srcName);
        }
    }

    public highlightCurrGutterLine(row:number)
    {
        //运行时,箭头指向的变化
        let docLength = this._editorAdapter.editor.getSession().getLength();
        for(let i = 0; i < docLength; ++ i)
        {
            this._editorAdapter.editor.renderer.removeGutterDecoration(i, 'executing');
        }
        this._editorAdapter.editor.renderer.addGutterDecoration(row, 'executing');
        this._editorAdapter.editor.moveCursorTo(row);
        this._editorAdapter.editor.renderer.scrollToRow( row );
    }
    /**
     * 打印代码执行引擎当前的执行信息
     */
    /*private printExecutedMethod():void
    {
        let states = this._aether.flow.states;
        for (var index in states)// the length of states means the times the user code executed.
        {
            var stateObj = states[index];
            var statements = stateObj.statements;
            for (var key in statements)
            {
                let ranges = statements[key].range;//array of ranges, every range object represents a method string in the code line
                let line = this._editor.getSession().getLine(ranges[0].row);
                let methodStr = line.substring(ranges[0].col, ranges[1].col);
                console.log(methodStr,'current line:',ranges[0].row);
            }
        }
    }*/
}
