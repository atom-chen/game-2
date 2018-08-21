/**
 * Created by yaozhiguo on 2016/11/4.
 */
var fs    = require('fs');
var path  = require('path');
var gulp = require('gulp');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var gutil = require('gulp-util');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var tsify = require("tsify");
var browserify_shim = require('browserify-shim');
var assign = require('lodash.assign');

var dest = 'dist';
var src = 'src';

// 在这里添加自定义 browserify 选项
var customOpts = {
    entries: [src + '/index.js'],
    extensions: ['.js', '.ts'],
    debug: true,
    // standalone: 'Main'
};


var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts).plugin("tsify", {
    noImplicitAny: false,
    target: "es5"
}));
b.transform(browserify_shim, {
    global: true
});

// 在这里加入变换操作
// 比如： b.transform(coffeeify);

gulp.task('scripts', bundle); // 可以运行 `gulp scripts` 来编译文件了
b.on('update', bundle); // 当任何依赖发生改变的时候，运行打包工具
b.on('log', gutil.log); // 输出编译日志到终端

function bundle() {
    return b.bundle()
        // 如果有错误发生，记录这些错误
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('mali-bundle.js'))
        // 可选项，如果你不需要缓存文件内容，就删除
        .pipe(buffer())
        // 可选项，如果你不需要 sourcemaps，就删除
        .pipe(sourcemaps.init({
            loadMaps: true
        })) // 从 browserify 文件载入 map
        // 在这里将变换操作加入管道
        .pipe(sourcemaps.write('./')) // 写入 .map 文件
        .pipe(gulp.dest(dest));
}

function parseExml(options){
    var through = require('through2');
    return through.obj(function (file, encoding, cb) {
        // 如果文件为空，不做任何操作，转入下一个操作，即下一个 .pipe()
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        // 插件不支持对 Stream 对直接操作，跑出异常
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return cb();
        }
        var data = file.contents.toString('utf-8');
        var thm = JSON.parse(data);

        if(thm && thm.exmls){
            var fs = require('fs');
            var exmls = [];

            thm.exmls.forEach(function(ele){
                var data = fs.readFileSync( ele,{flag: 'r', encoding: 'utf8'});
                // var data = fs.readFileSync('node_modules/game-ui/'+ ele,{flag: 'r', encoding: 'utf8'});
                if(data){
                    exmls.push({path:ele, content:data});
                }
            });
            thm.exmls = exmls;
            file.contents = new Buffer(JSON.stringify(thm));
        }

        this.push(file);
        cb();
     });
}

gulp.task('build-ui', function(){

    // 转换布局文件
    // gulp.src('node_modules/game-ui/resource/default.thm.json')
    gulp.src('resource/default.thm.json')
        .pipe(parseExml())
        .pipe(gulp.dest(dest + '/resource'));
    
    //资源加载
    var gulpIgnore = require('gulp-ignore');
    var res = require('./resource/default.res.json'); //require('game-ui/resource/default.res.json');
    var resourceFiles = {};
    if(res && res.resources){
        res.resources.forEach(function(ele){
            resourceFiles[ele.url] = true;
            if(ele.type == 'sheet'){
                var sheet = require('./resource/' + ele.url);
                // var sheet = require('game-ui/resource/' + ele.url);
                if(sheet && sheet.file){
                   var arry = ele.url.split('/');
                   var path = "";
                   for(var i=0; i < arry.length -1; i++ ){
                       path +=  arry[i] + "/";
                   }
                   path += sheet.file;
                   resourceFiles[ path ] =true;
                }
            }      
        });
    }

    // gulp.src('node_modules/game-ui/resource/default.res.json')
    gulp.src('resource/default.res.json')
        .pipe(gulp.dest(dest + '/resource'));

    // 启用异步方式，复制资源文件，必要时可对资源进行压缩
    // return gulp.src('node_modules/game-ui/resource/**/*')
    return gulp.src('resource/**/*')
        .pipe(gulpIgnore(function(file){
            // console.log(file.relative);
            return !(resourceFiles.hasOwnProperty(file.relative));
        }))
        .pipe(gulp.dest(dest + '/resource'));
});

gulp.task('css', function(){
    return gulp.src('css/**/*')
        .pipe(gulp.dest(dest + '/css'));
});

gulp.task('libs', function(){
    gulp.src('ace-lib/**/*')
        .pipe(gulp.dest(dest + '/ace-lib'));
    gulp.src('aether-lib/**/*')
        .pipe(gulp.dest(dest + '/aether-lib'));
    gulp.src('aether-plugin/**/*')
        .pipe(gulp.dest(dest + '/aether-plugin'));

    return gulp.src('libs/**/*.js')
        .pipe(gulp.dest(dest + '/libs'));
});

gulp.task('html', function(){
    return gulp.src('*.html')
        .pipe(gulp.dest(dest))
});

gulp.task('dist', ['html', 'css', 'libs','build-ui','scripts']);

gulp.task('webserver', function () {
    connect.server({
        name: 'server',
        root: '',
        port: 9011
    });
});

function getFolders( dir ) {
    return fs.readdirSync( dir )
            .filter( function( file ) {
                return fs.statSync( path.join(dir, file) ).isDirectory();
            });
}

gulp.task('js-compress', function() {
  var folders = getFolders('lib/ace/');

  var tasks = folders.map( function(folder) {
    return gulp.src(path.join('lib/ace/', folder, '/*.js'))
          .pipe(uglify())
          .pipe(gulp.dest(path.join('lib/ace/', folder)));
          // .pipe(rename(folder + '.min.js'))
          // .pipe(gulp.dest(path.join(srcPath, folder)));
  });
  // return tasks;

  gulp.src(path.join('lib/ace/', '/*.js')).pipe(uglify())
    .pipe(gulp.dest('lib/ace/'));
});

gulp.task('aether-compress', function() {
    gulp.src('lib/aether-lib/commonjs-mode/aether.js').pipe(uglify({
        mangle: false
    }))
    .pipe(gulp.dest('lib/aether-lib/commonjs-mode/'))
});

gulp.task('main-compress', function(){
    gulp.src('dist/mali-bundle.js').pipe(uglify({
        mangle:false
    }))
    .pipe(gulp.dest('dist/min'))
});

gulp.task('default', ['scripts', 'webserver']);
//gulp.task('default', ['main-compress']);