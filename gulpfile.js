"use strict";
const gulp = require('gulp'),
    sass = require('gulp-sass'),
    exec = require('child_process').exec,
    fse = require('fs-extra');

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

gulp.task('run', ['sass'], (cb) => {
    let args = process.argv,
        flags = {
            devTools: false
        };
    for( var i=0; i<args.length; i++ ){
        if( args[i] == '--dt' || args[i] == '--dev-tools' ){
            flags.devTools = true;
        }
    }
    
    if( flags.devTools ){
        exec('npm run startWithDevTools', (err,stdout,stderr) => {
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
    }
    else{
        exec('npm start', (err,stdout,stderr) => {
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
    }
});

gulp.task('clear-db', function (cb){
    fse.remove(appData()+'/time-logger', function (err){
        if( err ) throw err;
        else cb();
    });
});

function appData(){
	return process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local');
}