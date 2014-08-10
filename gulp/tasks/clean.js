'use strict';

var gulp = require('gulp'),
	rimraf = require('rimraf');

require('./build');

gulp.task('clean', function() {
	rimraf('build', function() {
		gulp.start('build');
	});
});
