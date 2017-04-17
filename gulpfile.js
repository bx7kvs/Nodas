/**
 * Created by bx7kv on 6/15/2016.
 */
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    cleanCss = require('gulp-clean-css');

gulp.task('compile-js', function () {
    return gulp.src(['./front/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('game.js'))
        .pipe(uglify({
            mangle: {keep_fnames: true},
            compress: {keep_fnames: true}
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./output'));
});

var watchClient = gulp.watch('./front/**/*.js', ['compile-js']);
watchClient.on('change', function () {
    console.log('Client recompiling...');
});

