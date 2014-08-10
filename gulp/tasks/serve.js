'use strict';

var gulp = require('gulp'),
	EXPRESS_PORT = 4000,
	EXPRESS_ROOT = 'build',
	LIVERELOAD_PORT = 35729,
	lr;

function startExpress() {

	var express = require('express'),
		app = express();

	app.use(require('connect-livereload')());
	app.use(express.static(EXPRESS_ROOT));
	app.listen(EXPRESS_PORT);
}

function startLivereload() {

	lr = require('tiny-lr')();
	lr.listen(LIVERELOAD_PORT);
}

// Notifies livereload of changes detected by `gulp.watch()`
function notifyLivereload(event) {

	// `gulp.watch()` events provide an absolute path so we need to make it relative to the server root
	var fileName = require('path').relative(EXPRESS_ROOT, event.path);

	lr.changed({
		body: {
			files: [fileName]
		}
	});
}

// Default task that will be run when no parameter is provided to gulp
gulp.task('serve', function() {
	startExpress();
	startLivereload();
	gulp.watch(['build/**'], notifyLivereload);
});
