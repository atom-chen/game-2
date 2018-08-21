import SceneObject from "../../view/battlescene/scene/SceneObject";
import Person from "../../view/battlescene/scene/Person";
import ComponentCreator from "../component/ComponentCreator";
import SceneItem from "../../view/battlescene/scene/SceneItem";
import FrameTweenLite from "../../base/utils/FrameTweenLite";
/**
 * Created by yaozhiguo on 2017/3/1.
 * 场景对象的代理类，用于动态配置指令。要调用指令只能通过本类对象，包括主角英雄。
 */
export default class SceneObjectActor
{
    private _sceneObject:SceneObject;
    private _methods:Object;//存储指令方法，没有直接绑定在本类对象上，是为了隔离用户调用，希望用户直接调用的指令会通过配置绑定到当前对象上
    private _block:boolean = false;

    public constructor(sceneObject?:SceneObject)
    {
        this._sceneObject = sceneObject;
        this._methods = {};
    }

    public get sceneObject():SceneObject
    {
        return this._sceneObject;
    }

    public get isLock():boolean
    {
        return this._block;
    }

    public lock():void
    {
        this._block = true;
    }

    public unlock():void
    {
        this._block = false;
    }

    public attach(sceneObject:SceneObject):void
    {
        this._sceneObject = sceneObject;
    }

    /**
     * 把所有的指令集合绑定到当前对象，只是缓存到队列，并不能直接调用。
     * @param creator
     */
    public bindComponents(creator:ComponentCreator):void
    {
        creator.attach(this);
    }

    /**
     * 动态添加一个方法包裹器到当前对象，通过指令调用本方法时，包裹器会根据上下文调用执行。
     * @param name
     * @param context
     */
    public addAction(name:string, context?:any):void
    {
        this[name] = _.partial(this.callMethod, name, context || this);
    }

    public getAction(name:string):any
    {
        return this[name];
    }
    /**
     * 往队列中增加一个方法，这个方法不能通过actor直接调用
     * @param name
     * @param method
     */
    public addMethod(name:string, method:Function):void
    {
        this._methods[name] = method;
    }

    private callMethod(methodName:string, context:any):any
    {
        let args:Array<any> = [];
        for (let i = 2; i < arguments.length; i++)
        {
            args.push(arguments[i]);
        }
        let method:Function = this._methods[methodName];
        return method.apply(context, args);
    }

    public dispose():void
    {
        for (let key in this._methods)
        {
            delete this._methods[key];
        }
        this._methods = null;
        this._sceneObject = null;
    }

    /**
     * 把某个对象转换成二进制形式的字符串，如01010101
     * @param param 待转换的对象 {number|string|object}
     * @returns {string}
     */
    public bin(param:any):string
    {
        let candidate:any;
        let bytes:egret.ByteArray = new egret.ByteArray();
        let result:string = '0b';
        if (_.isString(param))
        {
            bytes.writeUTFBytes(param);
            bytes.position = 0;
        }
        else if (_.isObject(param))
        {
            candidate = param.toString();
            bytes.writeUTFBytes(candidate);
            bytes.position = 0;
        }
        else if (_.isNumber(param))
        {
            result += param.toString(2);
        }

        if (bytes.bytesAvailable > 0)
        {
            while (bytes.bytesAvailable > 0)
            {
                let byteNumber:number = bytes.readByte();
                result += byteNumber.toString(2);
            }
        }
        return result;
    }

    public get pos():egret.Point
    {
        return this._sceneObject.logicPosition;
    }

    public get hp():number
    {
        if (this._sceneObject instanceof Person)
            return (<Person>(this._sceneObject)).batterData.hp;
        return 0;
    }

    /**
     * person当前拥有的mp
     * @returns {number}
     * @constructor
     */
    public get MP():number
    {
        if (this._sceneObject instanceof Person)
            return (<Person>(this._sceneObject)).batterData.mp;
        return 0;
    }

    /**
     * 获取一个道具掉落收获的MP
     * @returns {number}
     */
    public get dropMP():number
    {
        if (this._sceneObject instanceof SceneItem)
        {
            let dropType:number = parseInt(this._sceneObject.getData()['drop_type']);
            if (dropType != 40002)
            {
                return 0;
            }
            return parseInt(this._sceneObject.getData()['drop_number']);
        }
        return 0;
    }

    public get type():string
    {
        return this._sceneObject.type;
    }

    public say(word:string):void
    {
        let person:Person = <Person>(this._sceneObject);
        person.say(word);
        this.lock();
        let lite:TweenLite = FrameTweenLite.delayedCall(1, ()=>{
            this.unlock();
            FrameTweenLite.killTween(lite);
        });
    }
}
