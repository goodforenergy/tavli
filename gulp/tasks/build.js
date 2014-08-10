var gulp = require('gulp');

gulp.task('build', ['jshint', 'browserify', 'sass', 'images', 'html']);
