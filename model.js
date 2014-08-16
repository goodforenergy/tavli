'use strict';

// Publications - no need to publish users because it's available by default
Meteor.users.allow({
	update: function(userId, user, fields, modifier) {
		if (user._id === userId) {
			Meteor.users.update({_id: userId}, modifier);
			return true;
		} else {
			return false;
		}
	}
});

Meteor.methods({
	addFriend: function(userId) {
		check(userId, String);

		var currentUser = Meteor.user();

		// Add new friend to current user's friend list
		Meteor.users.update({ _id: currentUser._id }, {$push: {friends: userId}});

		// Add current user to new friend's friend list
		Meteor.users.update({ _id: userId }, { $push: {friends: currentUser._id}});
	},

	removeFriend: function(userId) {
		check(userId, String);

		var currentUserId = Meteor.userId();

		Meteor.users.update({_id: currentUserId}, {$pull: {friends: userId}});
		Meteor.users.update({_id: userId }, {$pull: {friends: currentUserId}});
	},

	clearFriends: function() {
		var currentUserId = Meteor.userId();
		Meteor.users.update({_id: currentUserId}, {$set: {friends: []}});
	}
});

/*
{
	userId: 123,
	friends: [{
		userId: 234,
		currentGame: gameId,
		statistics: {
			wins: 2,
			losses: 2
		}
	},
	{
		userId: 345,
		currentGame: gameId,
		statistics: {
			wins: 3,
			losses: 2
		}
	}
	],
	totalWins: 4
}
*/

// TODO Games

// Games = new Meteor.Collection('games');
/*
{
	gameId: 987,
	players: [{
		userId: 123,
		colour: red
	}, {
		userId: 234,
		colour: black
	}],
	board: [],
	turn: userId
}
*/
