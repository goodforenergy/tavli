'use strict';

/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   If the watch task is running, this uses watchify instead of browserify for faster bundling using caching.
*/

var argv = require('yargs').argv,
	browserify = require('browserify'),
	bundleLogger = require('../util/bundleLogger'),
	gulp = require('gulp'),
	handleErrors = require('../util/handleErrors'),
	source = require('vinyl-source-stream'),
	streamify = require('gulp-streamify'),
	watchify = require('watchify'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),

	methodConfig = {
		entries: ['./src/javascript/app.js'],
		extensions: ['.hbs']
	},

	bundle = function(bundler) {

		bundleLogger.start();

		bundler.transform({global: true}, require('hbsfy'));

		return bundler
			.bundle({debug: !argv.prod})
			.on('error', handleErrors)
			.pipe(source('app.js'))
			.pipe(gulpif(argv.prod, streamify(uglify())))
			.pipe(gulp.dest('./build/'))
			.on('end', bundleLogger.end);
	};

gulp.task('browserify', ['jshint', 'test'], function() {

	var bundler = browserify(methodConfig);
	return bundle(bundler);
});

gulp.task('watchify', ['jshint', 'test'], function() {

	var bundler = watchify(methodConfig);

	// Rebundle with watchify on changes.
	bundler.on('update', function() {
		bundle(bundler);
	});

	return bundle(bundler);
});
