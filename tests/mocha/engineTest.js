/*global MochaWeb, describe, it, chai, Engine */
'use strict';

if (typeof MochaWeb !== 'undefined') {
	MochaWeb.testOnly(function() {
		describe('Game Engine', function() {
			it('should exist', function() {
				chai.assert.equal(typeof Engine.doesStuff, 'function');
			});

			it('should not expose hidden functions', function() {
				chai.assert.equal(typeof Engine.cantSeeMe, 'undefined');
			});
		});
	});
}
