/* global Games */
'use strict';

// Config
Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_EMAIL'
});

// Subscriptions
Meteor.subscribe('userDirectory');
Meteor.subscribe('userData');

// ----- Helper Functions -----
var getFriends = function() {
		var user = Meteor.user();
		return user && user.friends ? Meteor.users.find({_id: {$in: user.friends}}, {sort: {username: 1}}) : [];
	},

	getGameByPlayers = function(player1, player2) {
		return Games.findOne({players: {$all: [player1, player2]}});
	};

// ----- Home Page -----
Template.page.currentGame = function() {
	return Session.get('currentGame');
};

// ----- Nav Bar -----
Template.navBar.events({
	'click .home': function(e) {
		e.preventDefault();
		Session.set('currentGame', null);
	}
});

// ----- Add Friend Dialog -----

Template.addFriendDialog.users = function() {
	var currentUser = Meteor.user();

	if (currentUser.friends) {
		return Meteor.users.find({$nor: [{_id: {$in: currentUser.friends}}, {_id: currentUser._id}]});
	} else {
		return Meteor.users.find({_id: {$not: currentUser._id}});
	}
};

Template.addFriendDialog.events({
	'click .add': function() {
		Meteor.call('addFriend', this._id);
	},

	'click .done': function() {
		Session.set('showAddFriendDialog', false);
	}
});

// ----- Remove Friend Dialog -----

Template.removeFriendDialog.friends = function() {
	return getFriends();
};

Template.removeFriendDialog.events({
	'click .remove': function() {
		Meteor.call('removeFriend', this._id);
	},

	'click .done': function() {
		Session.set('showRemoveFriendDialog', false);
	}
});

// ----- Main Page -----

Template.mainPage.showAddFriendDialog = function() {
	return Session.get('showAddFriendDialog');
};

Template.mainPage.showRemoveFriendDialog = function() {
	return Session.get('showRemoveFriendDialog');
};

// ----- Logged in User Information -----

Template.userInformation.currentUser = function() {
	return Meteor.user();
};

Template.userInformation.friends = function() {
	var friends = getFriends(),
		currentUserId = Meteor.userId();

	if (friends) {
		return friends.map(function(friend) {
			return _.extend(friend, {
				currentGame: getGameByPlayers(friend._id, currentUserId)
			});
		});
	}
	return friends;
};

Template.userInformation.events({
	'click .js-add-friend': function(e) {
		e.preventDefault();
		Session.set('showAddFriendDialog', true);
	},

	'click .js-remove-friend': function(e) {
		e.preventDefault();
		Session.set('showRemoveFriendDialog', true);
	},

	'click .js-resume-game': function(e) {
		e.preventDefault();
		Session.set('currentGame', this.currentGame._id);
	},

	'click .js-cancel-game': function(e) {
		e.preventDefault();
		Meteor.call('cancelGame', this.currentGame._id);
		// TODO A warning or some notification to other users
		Session.set('currentGame', null);
	},

	'click .js-start-game': function(e) {
		e.preventDefault();
		Meteor.call('newGame', this._id, Meteor.userId(), function(error, newGameId) {
			// TODO error handling
			Session.set('currentGame', newGameId);
		});
	}
});
