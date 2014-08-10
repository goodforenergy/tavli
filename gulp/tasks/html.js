'use strict';

var changed = require('gulp-changed'),
	dest = './build',
	gulp = require('gulp');

gulp.task('html', function() {
	return gulp.src('src/htdocs/**')
		.pipe(changed(dest))
		.pipe(gulp.dest(dest));
});
