// The app crashes when use strict is defined up here :(

// Publications - no need to publish users because it's available by default
var games = new Meteor.Collection('games');

games.allow({
	update: function() {
		'use strict';
		return true;
	},
	remove: function() {
		'use strict';
		return true;
	}
});

Meteor.users.allow({
	update: function(userId, user, fields, modifier) {
		'use strict';

		// Ensure user doesn't update fields they shouldn't have access to
		var allowed = ['friends'];

		if (_.difference(fields, allowed).length) {
			return false;
		}

		// User can only update their own profile
		if (user._id === userId) {
			Meteor.users.update({_id: userId}, modifier);
			return true;
		} else {
			return false;
		}
	}
});

Meteor.methods({

	// ----- Friends -----
	addFriend: function(friendId) {
		'use strict';
		check(friendId, String);

		var currentUser = Meteor.user();

		// Add new friend to current user's friend list
		Meteor.users.update({ _id: currentUser._id }, {$push: {friends: friendId}});

		// Add current user to new friend's friend list
		Meteor.users.update({ _id: friendId }, { $push: {friends: currentUser._id}});
	},

	removeFriend: function(friendId) {
		'use strict';
		check(friendId, String);

		var currentUserId = Meteor.userId();

		Meteor.users.update({_id: currentUserId}, {$pull: {friends: friendId}});
		Meteor.users.update({_id: friendId }, {$pull: {friends: currentUserId}});
	},

	clearFriends: function() {
		'use strict';
		var currentUserId = Meteor.userId();
		Meteor.users.update({_id: currentUserId}, {$set: {friends: []}});
	},

	// ----- Games -----

	newGame: function(player1, player2) {
		'use strict';
		return games.insert({
			players: [player1, player2],
			board: [],
			colours: {}
		});
	},

	cancelGame: function(gameId) {
		'use strict';
		games.remove(gameId);
	},

	setColour: function(gameId, playerId, colourId) {
		'use strict';
		var game = games.findOne({_id: gameId}),
			colours = game.colours;

		colours[playerId] = colourId;

		games.update({_id: gameId}, {$set: {colours: colours}});
	}
});

// Exports to Global Space
Games = games;

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
/*
{
	gameId: 987,
	players: [123, 234],
	colours: {
		123: '#ff0000',
		234: '#00ffff'
	},
	board: [],
	turn: userId
}
*/
