/**
 * Created by bx7kv on 6/15/2016.
 */
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    wrap = require('gulp-wrap');


function compileJs() {
    return gulp.src(
        [
            './front/R/core/**/*.js',
            './front/R/engine/**/*.js'
        ]
    )
        .pipe(sourcemaps.init())
        .pipe(concat('reflect-engine.js'))
        .pipe(uglify({
            mangle: {keep_fnames: true},
            compress: {keep_fnames: true}
        }))
        .pipe(wrap('(function(){<%= contents %> window.$R = $R})()'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./output'));
}

function compileES6() {
    return gulp.src(
        [
            './front/R/core/**/*.js',
            './front/R/engine/**/*.js'
        ]
    )
        .pipe(sourcemaps.init())
        .pipe(concat('reflect-engine-es6.js'))
        .pipe(uglify({
            mangle: {keep_fnames: true},
            compress: {keep_fnames: true}
        }))
        .pipe(wrap('<%= contents %> export default core'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./output'));
}


function watchChange() {
    gulp.watch('./front/R/', gulp.series(compileJs, compileES6));
}

gulp.task('default', gulp.series(compileJs, compileES6, watchChange));







