import ProblemAlertView from "../editor/ProblemAlertView";
/**
 * Created by yaozhiguo on 2017/3/1.
 */
export default class CodeEngine
{
    private _aether: Aether;
    private _executorObj:Object;

    private _lastAST:any;
    public get lastAST():any
    {
        return this._lastAST;
    }

    private _language:string;
    public get language():string
    {
        return this._language;
    }

    private _code:string = '';

    public getCode():string
    {
        return this._code;
    }

    public setCode(code:string):void
    {
        this._code = code;
    }

    public getAether():any
    {
        return this._aether;
    }
    
    public getCompileInfo():any
    {
        if(this._aether) {
            return {
                'problems': this._aether['problems'],
                'flow': this._aether['flow'],
                'metrics': this._aether['metrics']
            }
        }
    }

    public setStepExecutor(executor:Function, context:any, ...param):void
    {
        this._executorObj = {
            exec:executor,
            thisObj:context,
            param:param
        };
    }

    public constructor(language:string)
    {
        let aetherOptions =
        {
            executionLimit: 10000,
            problems:
            {
                jshint_W040:
                {
                    level: "ignore"
                }
            },
            language:language,
            includeFlow: true,
            includeMetrics: true,
            protectBuiltins: true,
            protectAPI:false,
            languageVersion:'es6'
        };
        this._aether = new Aether(aetherOptions);
        this._aether.setLanguage(language);
        this._language = language;
    }

    public compile():void
    {
        // this.aether.lint(this.editor.getValue());

        this._aether.transpile(this._code);

        console.log('%cINFORMATION ABOUT AETHER:', 'background: #fff000; color: #000000');
        console.log(this._aether.problems);
        //console.log(this.aether.pure);
        console.log(this._aether.flow);
        console.log(this._aether.metrics);
        console.log('%cAETHER INFORMATION COMPLETE!', 'background: #fff000; color: #000000');
        this._aether.createFunction();
        this._aether.esperEngine.loadAST(this._aether.ast);
    }

    public addObject(name:string, object:any):void
    {
        this._aether.esperEngine.addGlobalBridge(name, object);
    }

    public addFunction(name:string, func:Function):void
    {
        this._aether.esperEngine.addGlobalFx(name, func);
    }

    private _interval:number = 0;

    public start():void
    {
        // TweenLiteDriver.startTick(this.update, this);
        clearInterval(this._interval);
        this._interval = setInterval(this.update, 0, this);
    }

    public stop():void
    {
        // TweenLiteDriver.stopTick(this.update, this);
        clearInterval(this._interval);
    }

    private update(context:any):void
    {
        if (context._executorObj)
        {
            let exec:Function = context._executorObj['exec'];
            let thisObj:any = context._executorObj['thisObj'];
            let param:any = context._executorObj['param'];
            if (param)
                exec.apply(thisObj, param);
            else
                exec.apply(thisObj);
        }
    }

    public reset():void
    {
        this._aether.reset();
        this._aether.esperEngine = null;
        this._lastAST = null;
    }

    /**
     * 执行一步代码
     * @param engine
     * @returns {boolean}
     */
      public stepOne():boolean
    {
        let engine:Engine = this._aether.esperEngine;
        let result:any;
        try
        {
            result = engine.step();
        }
        catch (e)
        {
            console.log(e);
            let errors = [{
                'type': 'error',
                'text': e
            }];
            ProblemAlertView.getInstance().setProblems( errors );
            
            result = e;
        }
        this.collectStepAST(engine);
        if (result)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    private collectStepAST(engine:Engine):void
    {
        let frames:any[] = engine.evaluator.frames;
        let ast:any;
        for(var i:number = 0; i < frames.length; i++)
        {
            if (frames[i].ast)
            {
                ast = frames[i].ast;
                break;
            }
        }
        if ( ast ) {
            this._lastAST = ast;
        }
    }

    public dispose():void
    {
        this.reset();
        this._executorObj = null;
    }
}