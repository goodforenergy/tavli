/*global Router, Games*/
'use strict';

// Config
Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_EMAIL'
});

// Hooks
var isLoggedIn = function(pause) {
	if (!(Meteor.user())) {
		this.render('splash');
		pause();
	}
};

// Routing
Router.map(function() {
	this.route('home', {
		path: '/',
		layoutTemplate: 'main-layout',
		onBeforeAction: isLoggedIn
	});

	this.route('game', {
		path: '/game/:_id',
		layoutTemplate: 'main-layout',
		onBeforeAction: isLoggedIn,
		waitOn: function() {
			return [Meteor.subscribe('games', this.params._id), Meteor.subscribe('users')];
		},
		data: function() {
			// TODO validation of id?
			var game = Games.findOne({_id: this.params._id}),
				friendId;

			if (!game) {
				return {};
			}

			friendId = _.without(game.players, Meteor.userId())[0];

			return {
				game: game,
				friend: Meteor.users.findOne({_id: friendId})
			};
		}
	});
});

// ----- Nav Bar -----
Template.navBar.events({
	'click .home': function(e) {
		e.preventDefault();
		Session.set('currentGame', null);
		Router.go('/');
	}
});
