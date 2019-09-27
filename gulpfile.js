/**
 * Created by bx7kv on 6/15/2016.
 */
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    wrap = require('gulp-wrap');


gulp.task('compile-js', function () {
    return gulp.src(
        [
            './front/R/core/**/*.js',
            './front/R/engine/**/*.js'
        ]
    )
        .pipe(concat('reflect-engine.js'))
        .pipe(wrap('(function(){<%= contents %> window.$R = $R})()'))
        /*.pipe(uglify({
            mangle: {keep_fnames: true},
            compress: {keep_fnames: true}
        }))*/
        .pipe(gulp.dest('./output'));
});


gulp.task('compile-es6', function () {
    return gulp.src(
        [
            './front/R/core/**/*.js',
            './front/R/engine/**/*.js'
        ]
    )
        .pipe(concat('reflect-engine-es6.js'))
        .pipe(wrap('<%= contents %> module.exports = $R;'))
   /*     .pipe(uglify({
            mangle: {keep_fnames: true},
            compress: {keep_fnames: true}
        }))*/
        .pipe(gulp.dest('./output'));
});


var watchClient = gulp.watch('./front/**/*.js', ['compile-js']);

