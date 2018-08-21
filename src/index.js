Main = require('./Main').default;

/**
 * {
 * "renderMode":, //引擎渲染模式，"canvas" 或者 "webgl"
 * "audioType": "" //使用的音频类型，0:默认，1:qq audio，2:web audio，3:audio
 * "antialias": //WebGL模式下是否开启抗锯齿，true:开启，false:关闭，默认为false
 * }
 **/

egret.runEgret({
    renderMode: "webgl",
    audioType: 0
});