/*global Router*/

// Hooks
var isLoggedIn = function(pause) {
	'use strict';
	if (!(Meteor.loggingIn() || Meteor.user())) {
		this.render('splash');
		pause();
	}
};

Router.map(function() {
	'use strict';
	this.route('home', {
		path: '/',
		layoutTemplate: 'main-layout',
		onBeforeAction: isLoggedIn
	});
});
