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
};

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

var openAddFriendDialog = function() {
		Session.set('showAddFriendDialog', true);
	},

	openRemoveFriendDialog = function() {
		Session.set('showRemoveFriendDialog', true);
	};

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
	return getFriends();
};

Template.userInformation.events({
	'click .js-add-friend': openAddFriendDialog,
	'click .js-remove-friend': openRemoveFriendDialog
});
