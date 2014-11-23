/*global MochaWeb, chai, describe, it*/
'use strict';

var errorHandler = new window.ErrorHandler();

if (typeof MochaWeb !== 'undefined') {
	MochaWeb.testOnly(function() {

		describe('genericErrorHandler', function() {

			it('should call not call the success function if error is not null', function() {
				var counter = 0;
				errorHandler.genericErrorHandler('An error', function() { counter++; });
				chai.assert.equal(counter, 0);
			});

			it('should call a success function if error is null', function() {
				var counter = 0;
				errorHandler.genericErrorHandler(null, function() { counter++; });
				chai.assert.equal(counter, 1);
			});
		});
	});
}
