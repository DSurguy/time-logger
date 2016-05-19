"use strict";
let gulp = require('gulp'),
    sass = require('gulp-sass');

gulp.task('default', ['sass'], function (){
	gulp.watch(['**/*.scss', '!./node_modules/**'], ['sass']);
});

gulp.task('sass', () => {
    gulp.src(['**/*.scss', '!./node_modules/**'])
        .pipe(sass())
        .pipe(gulp.dest(function(f) {
            return f.base;
        }))
})