'use strict';
function ErrorHandler() {}

ErrorHandler.prototype.genericErrorHandler = function(error, successCallback) {
	if (error) {
		Notifications.error('Oops..', 'Something has gone wrong. Sorry about that! Try refreshing the page.');
	} else if (_.isFunction(successCallback)) {
		successCallback.apply(successCallback, Array.prototype.slice.call(arguments, 2));
	}
};

window.ErrorHandler = ErrorHandler;
