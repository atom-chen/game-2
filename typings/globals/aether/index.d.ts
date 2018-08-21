/**
 * Created by yaozhiguo on 2016/11/21.
 */
declare class Aether{
    constructor(options?:any);
    depth:number;
    getAddedGlobals():any;
    addGlobal(name:string, value:any):void;

    setLanguage(language:string);

    /**
     * Resets the state of Aether, readying it for a fresh transpile.
     */
    reset():void;

    /**
     * Transpile it. Even if it can't transpile, it will give syntax errors and warnings and such. Clears any old state.
     * @param code
     */
    transpile(code:string):void;

    /**
     * Convert to JSON so we can pass it across web workers and HTTP requests and store it in databases and such.
     */
    serialize():any;

    /**
     * Convert a serialized Aether instance back from JSON.
     */
    deserialize(serialized:any);

    /**
     * Performs quick heuristics to determine whether the code will run or produce compilation errors.
     * If thorough, it will perform detailed linting and return false if there are any lint errors.
     * @param rawCode source code
     * @param thorough default false
     */
    canTranspile(rawCode:string, thorough?:boolean):boolean;

    /**
     * Determine whether two strings of code are significantly different.
     * If careAboutLineNumbers, we strip trailing comments and whitespace and compare line count.
     * If careAboutLint, we also lint and make sure lint problems are the same.
     * @param a
     * @param b
     * @param careAboutLineNumbers default false
     * @param careAboutLint default false
     */
    hasChangedSignificantly(a, b, careAboutLineNumbers?:boolean, careAboutLint?:boolean):boolean;

    /**
     * Return a beautified representation of the code (cleaning up indentation, etc.)
     * @param rawCode
     */
    beautify(rawCode:string):void;

    /**
     * Perform some fast static analysis (without transpiling) and find any lint problems.
     * @param rawCode
     */
    lint(rawCode):any;

    flow:any;
    problems:Object;
    metrics:Object;

    /**
     * Return a ready-to-interpret function from the parsed code.
     */
    createFunction():Function;

    /**
     * Like createFunction, but binds method to thisValue.
     * @param thisValue the current context in which code running.
     */
    createMethod(thisValue?:any);
    esperEngine:Engine;
    ast:any;

    /**
     * Convenience wrapper for running the compiled function with default error handling
     */
    run(fn?:any, args?:any):void;

    /**
     * 
     * @param fx
     */
    createThread(fx):any;

    updateProblemContext(problemContext:any):void;

    /**
     * Add problem to the proper level's array within the given problems object (or @problems).
     * @param problem
     * @param problems
     */
    addProblem(problem, problems?):any;

    /**
     * Return all the problems as a flat array.
     * @param problems
     */
    getAllProblems(problems):any[];

    /**
     * The meat of the transpilation.
     * @param rawCode
     */
    purifyCode(rawCode:string):string;

    /**
     * 把代码转换成语法树
     * @param code
     * @param transforms
     * @param parseFn
     */
    transform(code, transforms, parseFn):any[];

    getFunctionBody(func:any):string;

    /**
     * Convert obj to current language's equivalent type if necessary
     # E.g. if language is Python, JavaScript Array is converted to a Python list
     * @param obj
     */
    convertToNativeType(obj);

    getStatementCount():number;
}

declare class Engine{
    constructor(options?);

    evaluator:Evaluator;
    /**
     * Evalute `code` and return a promise for the result.
     *
     * @access public
     * @param {string} code - String of code to evaulate
     * @return {Promise<Value>} - The result of execution, as a promise.
     */
    eval(code:string):any;

    /**
     * Evalute `code` and return a the result.
     *
     * @access public
     * @param {string} code - String of code to evaulate
     * @return {Value} - The result of execution
     */
    evalSync(code:string):any;
    /**
     * Evalute `ast` and return a promise for the result.
     *
     * @access public
     * @param {Node} ast - ESTree AST representing the code to run.
     * @param {string} codeRef - The code that was used to generate the AST.
     * @return {Value} - The result of execution, as a promise.
     */
    evalAST(ast, opts?):any;

    evalASTSync(ast, opts?);
    loadAST(ast, opts?);
    load(code:string);
    step():void;
    run():void;
    runSync():void;

    addGlobal(name, what);
    addGlobalFx(name, what);
    addGlobalValue(name, what);
    addGlobalBridge(name, what);
    fetchFunctionSync(name, shouldYield);
    fetchFunction(name, shouldYield);

    functionFromSource(source, shouldYield);
    functionFromAST(ast, shouldYield, source);
    functionFromSourceSync(source, shouldYield);
    functionFromASTSync(ast, shouldYield, source);
    makeFunctionFromClosure(val, shouldYield, evalu);

    /**
     * Returns a new engine that executes in the same Realm.  Useful
     * for creating threads / coroutines
     * @return {Engine}
     */
    fork();
    makeEvaluatorClone();
}

declare class Evaluator
{
    constructor(realm:Realm, n, s);
    ast:any;
    defaultYieldPower:number;//default = 5
    yieldPower:number;
    realm:Realm;
    frames:any[];
    pushAST(n, s);
    unwindStack(target, canCrossFxBounds, label);
    next(lastValueOverride?:boolean):any;
}

declare class Realm
{
    print();
    parser(code, options);
    constructor(options);
    lookupWellKnown(v);
    valueFromNative(native);
    fromNative(native);
    import(native, modeHint);
}