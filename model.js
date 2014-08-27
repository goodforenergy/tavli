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

	// ----- Game Setup -----

	newGame: function(player1, player2) {
		'use strict';
		return games.insert({
			players: [player1, player2],
			board: [
				{
					place: 0,
					pieces: []
				},
				{
					place: 1,
					pieces: []
				},
				{
					place: 2,
					pieces: ['h', 'h']
				},
				{
					place: 3,
					pieces: []
				},
				{
					place: 4,
					pieces: ['l', 'l', 'l', 'l', 'l']
				},
				{
					place: 5,
					pieces: []
				},
				{
					place: 6,
					pieces: ['l', 'l', 'l']
				},
				{
					place: 7,
					pieces: []
				},
				{
					place: 8,
					pieces: []
				},
				{
					place: 9,
					pieces: ['h', 'h', 'h', 'h', 'h']
				},
				{
					place: 10,
					pieces: ['l', 'l', 'l', 'l', 'l']
				},
				{
					place: 11,
					pieces: []
				},
				{
					place: 12,
					pieces: []
				},
				{
					place: 13,
					pieces: ['h', 'h', 'h']
				},
				{
					place: 14,
					pieces: []
				},
				{
					place: 15,
					pieces: ['h', 'h', 'h', 'h', 'h']
				},
				{
					place: 16,
					pieces: []
				},
				{
					place: 17,
					pieces: ['l', 'l']
				},
				{
					place: 18,
					pieces: []
				},
				{
					place: 19,
					pieces: []
				}
			],
			colours: {},
			bases: {},
			startingRolls: {}
		});
	},

	startGame: function(gameId) {
		'use strict';
		games.update({_id: gameId}, {$set: {status: 'IN_PROGRESS'}});
	},

	cancelGame: function(gameId) {
		'use strict';
		games.remove(gameId);
	},

	rollToStart: function(gameId, playerId, roll) {
		'use strict';

		var game = games.findOne({_id: gameId}),
			startingRolls = game.startingRolls,
			player2Id = _.without(game.players, playerId)[0],
			player1Roll,
			player2Roll;

		startingRolls[playerId] = roll;

		player1Roll = startingRolls[playerId];
		player2Roll = startingRolls[player2Id];

		if (player1Roll && player2Roll && player1Roll !== player2Roll) {
			games.update({_id: gameId}, {$set: {
				startingRolls: startingRolls,
				turn: player1Roll > player2Roll ? playerId : player2Id
			}});
		} else {
			games.update({_id: gameId}, {$set: {
				startingRolls: startingRolls
			}});
		}
	},

	setColour: function(gameId, playerId, colourId) {
		'use strict';

		var game = games.findOne({_id: gameId}),
			colours = game.colours,
			player2Id = _.without(game.players, playerId)[0];

		if (colours[player2Id] === colourId) {
			return false;
		}

		colours[playerId] = colourId;
		games.update({_id: gameId}, {$set: {colours: colours}});

		return true;
	},

	setBase: function(gameId, playerId, base) {
		'use strict';

		var game = games.findOne({_id: gameId}),
			bases = game.bases;

		// Can't set if already defined or if base is not one of 'h' or 'l'
		if (bases[playerId] || ['h', 'l'].indexOf(base) === -1) {
			return false;
		}

		bases[playerId] = base;
		games.update({_id: gameId}, {$set: {bases: bases}});

		return true;
	},

	// ----- Gameplay -----
	setTurn: function(gameId, playerId) {
		'use strict';
		games.update({_id: gameId}, {$set: {turn: playerId}});
	},

	movePiece: function(gameId, piece, place) {
		'use strict';

		var game = games.findOne({_id: gameId}),
			board = game.board,
			fromStack = board[piece.place],
			toStack = board[place],
			movedPiece;

		// Ensure the piece requested is the top of the pile (TODO - change to always select top?)
		if (!fromStack.pieces || fromStack.pieces[fromStack.pieces.length - 1] !== piece.piece) {
			return false;
		}

		movedPiece = fromStack.pieces.pop();
		toStack.pieces.push(movedPiece);

		board[piece.place] = fromStack;
		board[place] = toStack;

		games.update({_id: gameId}, {$set: {board: board}});
		return board;
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

/*
{
	gameId: 987,
	players: [123, 234],
	colours: {
		123: '#ff0000',
		234: '#00ffff'
	},
	startingRolls: {
		123: 4,
		234: 3
	},
	base: {
		123: 'l',
		234: 'h'
	}
	board: [
		1: [],
		2: [],
		3: ['h', 'h'],
		4: [],
		5: ['l', 'l', 'l', 'l', 'l'],
		6: [],
		7: ['l', 'l', 'l'],
		8: [],
		9: [],
		10: ['h', 'h', 'h', 'h', 'h'],
		11: ['l', 'l', 'l', 'l', 'l'],
		12: [],
		13: [],
		14: ['h', 'h', 'h'],
		15: [],
		16: ['h', 'h', 'h', 'h', 'h'],
		17: [],
		18: ['l', 'l'],
		19: [],
		20: [],
		limbo: [],
		removed: {
			l: [],
			h: []
		}
	],
	turn: userId
}

// Low
// Base is 1-5
// Moves are made by subtracting rolls from places
// Render from low to high, starting at bottom right corner and proceeding clockwise

// High
// Base is 16 - 20
// Moves are made by adding rolls to places
// Render from high to low, starting at bottom left corner and proceeding anti-clockwise

- render circles
- move one circle to a different place on the board
- click events on circles
- render a board

*/
