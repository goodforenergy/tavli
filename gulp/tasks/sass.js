'use strict';

var argv = require('yargs').argv,
	cache = require('gulp-cached'),
	gulp = require('gulp'),
	gulpif = require('gulp-if'),
	handleErrors = require('../util/handleErrors'),
	minifyCSS = require('gulp-minify-css'),
	prefix = require('gulp-autoprefixer'),
	sass = require('gulp-sass');

gulp.task('sass', function() {

	// TODO Add in source maps when this issue is resolved
	return gulp.src('src/sass/*.scss')
		.pipe(cache('sass'))
        .pipe(sass())
        .pipe(prefix('last 2 versions', 'ie 8'))
        .pipe(gulpif(argv.prod, minifyCSS()))
        .pipe(gulp.dest('build'))
        .on('error', handleErrors);
});
