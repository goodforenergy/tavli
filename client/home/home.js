/* global Games, Router */
'use strict';

// Subscriptions
Meteor.subscribe('userDirectory');
Meteor.subscribe('userData');

Template.home.helpers({
	friends: function() {
		return Meteor.user().friends;
	},
	gameInProgress: function() {
		var game = Games.findOne({_id: this.gameId}, {fields: {status: 1}});
		return game && _.contains(['setupColour', 'setupBase', 'setupRoll', 'inProgress'], game.status);
	},

	showAddFriendDialog: function() {
		return Session.equals('showDialog', 'addFriend');
	},

	showRemoveFriendDialog: function() {
		return Session.equals('showDialog', 'removeFriend');
	}
});

Template.home.events({
	'click .js-add-friend': function(e) {
		e.preventDefault();
		Session.set('showDialog', 'addFriend');
	},

	'click .js-remove-friend': function(e) {
		e.preventDefault();
		Session.set('showDialog', 'removeFriend');
	},

	'click .js-resume-game': function(e) {
		e.preventDefault();
		Router.go(Router.routes.game.path({_id: this.gameId}));
	},

	'click .js-forfeit-game': function(e) {
		e.preventDefault();

		Meteor.call('forfeitGame', this.gameId, Meteor.userId(), this._id);
	},

	'click .js-start-game': function(e) {
		e.preventDefault();

		Meteor.call('setupNewGame', this.gameId, Meteor.userId(), this._id);
		Router.go(Router.routes.game.path({_id: this.gameId}));
	}
});
