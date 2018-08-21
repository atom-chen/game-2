/**
 * Created by yaozhiguo on 2016/11/4.
 */
var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProj = ts.createProject('tsconfig.json');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var order = require('gulp-order');

gulp.task('tsc', function () {
    gulp.src('src/**/*.ts')
        .pipe(ts(tsProj()))
        .pipe(gulp.dest('bin-debug'));
});

//debug
gulp.task('js-concat', function(){
    gulp.src('bin-debug/**/*.js')
        .pipe(order([
            'components/Component.js',
            'components/MoveSimply.js',
            'scene/SceneObject.js',
            'scene/SceneMoveObject.js',
            'scene/Hero.js',
            'world/*.js',
            '*.js'
        ], {base:'./bin-debug'}))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist'));
});

//release
gulp.task('js-compress', function(){
    gulp.src('bin-debug/**/*.js')
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename({suffix:'.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/min'));
});

gulp.task('webserver', function () {
    // connect.server({
    //     name:'server',
    //     root:'',
    //     port:9011
    // });
});

gulp.task('default', ['tsc', 'js-concat', 'webserver']);