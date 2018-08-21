var isWebWorker = function(){
    try {
        return (window) ? false : true;
    } catch (x) {
        return true;
    }
}();

if( isWebWorker )   {
    importScripts("../lib/aether-plugin/lodash/lodash.js");
    importScripts("../lib/aether-lib/commonjs-mode/aether.js");
}

let aetherOptions = {
    executionLimit: 10000,
    problems:
    {
        jshint_W040:
        {
            level: "ignore"
        }
    },
    language:'python',
    includeFlow: true,
    includeMetrics: true,
    protectBuiltins: true,
    protectAPI:false,
    languageVersion:'es6'
};
var aether = new Aether(aetherOptions);

onmessage = function(e) {
    var data = e.data;
    var type = data['type'];
    
    if('transpile' == type) { //编译
        let rawCode= data['rawCode'];
        aether.transpile( rawCode );

        // console.log('%cAETHER Info:', 'background: #ff0000; color: #000000');
        // console.log(aether.problems);
        // console.log(aether.flow);
        // console.log(aether.metrics);
        // console.log('%cAether Info!', 'background: #ff0000; color: #000000');

        postMessage({
            'type': 'compile_info',
            'problems': aether.problems,
            'flow': aether.flow,
            'metrics': aether.metrics
        });
    }
    else if('change_language' == type) { //切换语言
        let language = data['language'];
        aether.setLanguage( language );
    }

}
