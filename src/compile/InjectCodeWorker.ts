import CodeEngine from "./CodeEngine";
import SceneObjectActor from "../control/actions/SceneObjectActor";
/**
 * Created by yaozhiguo on 2017/3/2.
 * 注入代码的执行线程，和用户的代码可以并行运行。
 */
export default class InjectCodeWorker
{
    private _codeEngine:CodeEngine;
    private _counter:number = 0;
    private _code:string;
    private _actor:SceneObjectActor;

    public constructor(actor?:SceneObjectActor)
    {
        let language:string = 'javascript';
        this._codeEngine = new CodeEngine(language);
        this._codeEngine.setStepExecutor(this.tick, this);
        this._actor = actor;
    }

    public setCode(code:string):void
    {
        this._code = code;
    }

    public runCode():void
    {
        let extra:string = '\n' +
            'var script = new Script(); \n' +
            'while(true){ \n' +
            '   script.chooseAction(); \n' +
            '   script.checkVictory(); \n' +
            '}\n';

        this._codeEngine.reset();
        this._codeEngine.setCode(this._code + extra);
        this._codeEngine.compile();
        this._codeEngine.addObject('hero', this._actor.sceneObject);
        this._codeEngine.addObject('actor', this._actor);
        this._codeEngine.start();
    }

    private tick():void
    {
        let result = this._codeEngine.stepOne();
        if (result)
        {
            this.stop();
            return;
        }
        this._counter ++;
        if (this._counter >= 4800) //limitation of 3 minutes for running background script
        {
            this.stop();
            this._counter = 0;
        }
    }

    public stop():void
    {
        this._codeEngine.stop();
    }

    public onSetupLevel():void
    {
        let extraCode:string = '\n' +
            'var script = new Script(); \n' +
            'script.setupLevel(); \n';
        this.runCodeFragment(extraCode);
    }

    public onFirstFrame():void
    {
        let extraCode:string = '\n' +
            'var script = new Script(); \n' +
            'script.onFirstFrame(); \n';
        this.runCodeFragment(extraCode);
    }

    public dispose():void
    {
        this.stop();
        this._codeEngine.dispose();
    }

    private runCodeFragment(codeFragment:string):void
    {
        this._codeEngine.reset();
        this._codeEngine.setCode(this._code + codeFragment);
        this._codeEngine.compile();
        this._codeEngine.addObject('hero', this._actor.sceneObject);
        this._codeEngine.addObject('actor', this._actor);
        let result:boolean = this._codeEngine.stepOne();
        while (!result)
        {
            result = this._codeEngine.stepOne();
        }
    }
}
