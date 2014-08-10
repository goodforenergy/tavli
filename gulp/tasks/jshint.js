'use strict';

var cache = require('gulp-cached'),
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	jshintStylish = require('jshint-stylish');

gulp.task('jshint', function() {
	return gulp.src('src/javascript/**')
		.pipe(cache('linting'))
		.pipe(jshint())
		.pipe(jshint.reporter(jshintStylish));
});
