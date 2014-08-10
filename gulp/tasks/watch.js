'use strict';

var gulp = require('gulp');

gulp.task('watch', function() {

	gulp.watch('test/**/*.js', ['test']);
	gulp.watch('src/sass/**', ['sass']);
	gulp.watch('src/images/**', ['images']);
	gulp.watch('src/htdocs/**', ['html']);
	gulp.start('serve');
});
