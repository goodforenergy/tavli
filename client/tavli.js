'use strict';

// Config
Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_EMAIL'
});

// Subscriptions
Meteor.subscribe('userDirectory');
Meteor.subscribe('userData');

// ----- Add Friend Dialog -----

Template.addFriendDialog.users = function() {
	var currentUser = Meteor.user(),
		friendIdList = _.map(currentUser.friends, function(friend) { return friend._id; });

	if (currentUser.friends) {
		return Meteor.users.find({$nor: [{_id: {$in: friendIdList}}, {_id: currentUser._id}]});
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

// ----- Main Page -----

var openAddFriendDialog = function() {
	Session.set('showAddFriendDialog', true);
};

Template.mainPage.showAddFriendDialog = function() {
	return Session.get('showAddFriendDialog');
};

// ----- Logged in User Information -----

Template.userInformation.events({
	'click .js-add-friend': openAddFriendDialog
});
