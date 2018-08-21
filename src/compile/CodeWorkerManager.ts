import InjectCodeWorker from "./InjectCodeWorker";
import UserCodeWorker from "./UserCodeWorker";
import SceneObjectActor from "../control/actions/SceneObjectActor";
import ComponentCreator from "../control/component/ComponentCreator";
/**
 * Created by yaozhiguo on 2017/3/2.
 */
export default class CodeWorkerManager
{
    private static _injectThread:InjectCodeWorker;
    private static _userThread:UserCodeWorker;
    private static _componentCreator:ComponentCreator;

    private static _userCodeComplete:Function;
    private static _userCodeCbContext:any;

    public static init(actor:SceneObjectActor):void
    {
        this._componentCreator = new ComponentCreator();
        this._componentCreator.attach(actor);
        this._injectThread = new InjectCodeWorker(actor);
        this._userThread = new UserCodeWorker(actor);
    }

    public static getInjectTread():InjectCodeWorker
    {
        return this._injectThread;
    }

    public static getUserThread():UserCodeWorker
    {
        return this._userThread;
    }

    public static getComponentCreator():ComponentCreator
    {
        return this._componentCreator;
    }

    public static setUserCompleteCallback(cb:Function, context?:any):void
    {
        this._userCodeComplete = cb;
        this._userCodeCbContext = context;
        this._userThread.addEventListener('codeRunComplete', cb, context);
    }

    public static release():void
    {
        this._componentCreator.dispose();
        this._injectThread.dispose();
        this._userThread.dispose();
        this._injectThread = null;
        this._userThread = null;
        this._componentCreator = null;
        this._userCodeCbContext = null;
        this._userCodeComplete = null;
    }
}