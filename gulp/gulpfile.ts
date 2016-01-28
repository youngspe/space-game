/// <reference path="../typings/gulp/gulp" />
/// <reference path="../typings/gulp-uglify/gulp-uglify" />
/// <reference path="../typings/gulp-util/gulp-util" />
/// <reference path="../typings/gulp-sourcemaps/gulp-sourcemaps" />
/// <reference path="../typings/browserify/browserify" />
/// <reference path="../typings/through2/through2" />
/// <reference path="../typings/vinyl-source-stream/vinyl-source-stream" />
/// <reference path="../typings/vinyl-buffer/vinyl-buffer" />
/// <reference path="./gulp-run" />

import * as gulp from 'gulp';
import * as run from 'gulp-run';
import * as browserify from 'browserify';
import * as uglify from 'gulp-uglify';
import * as through from 'through2';
import source = require('vinyl-source-stream');
import * as buffer from 'vinyl-buffer';
import * as sourcemaps from 'gulp-sourcemaps';
import * as gutil from 'gulp-util';

function build() {
    gulp.watch(['./bin/*'], bundle);

    run('tsc -p ./src -w', {
        verbosity: 3
    }).exec();
    run('tsc -p ./gulp -w', {
        verbosity: 3
    }).exec();


}

let lastBrowserify = 0;
let delay = 1000;

function bundle() {
    setTimeout(() => {
        let date = Date.now();
        if (date - lastBrowserify < delay) {
            lastBrowserify = date;
            return null;
        }
        lastBrowserify = date;
        // set up the browserify instance on a task basis
        var b = browserify({
            entries: './bin/index.js',
            debug: true
        });
        console.log('Begin bundle...');
        return b.bundle()
            .pipe(source('./bundle.js'))
        //.pipe(buffer())
        //.pipe(sourcemaps.init({ loadMaps: true }))
        // Add transformation tasks to the pipeline here.
        //.pipe(uglify())
        //.on('error', gutil.log)
        //.pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./'))
            .on('finish', () => { console.log('Bundle complete.'); });
    }, 2000);
}
gulp.task('build', [], build);

gulp.task('browserify', [], bundle);
