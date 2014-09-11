// The app crashes when use strict is defined up here :(

// Publications - no need to publish users because it's available by default
var games = new Meteor.Collection('games'),

	updateStatistics = function(losingPlayerId, winningPlayerId) {
		'use strict';

		Meteor.users.update({_id: losingPlayerId, 'friends._id': winningPlayerId}, {$inc: {'friends.$.statistics.losses': 1}});
		Meteor.users.update({_id: winningPlayerId, 'friends._id': losingPlayerId}, {$inc: {'friends.$.statistics.wins': 1}});
		return true;
	};

// TODO HHHMHHMHMMMMMM????!?!
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

	/*
	Friends are stored as an array on a user, i.e.:

	{
		_id: 123,
		username: 'goodforenergy',
		friends: [{
			_id: friendId,
			username: friend.username,
			gameId: KJSDS98EJASD9,
			statistics: {
				wins: 0,
				losses: 0
			}
		}]
	}
	*/
	addFriend: function(friendId) {
		'use strict';

		check(friendId, String);

		var currentUser = Meteor.user(),
			friend = Meteor.users.findOne({_id: friendId}, {fields: {username: 1}});

		Meteor.call('createGame', currentUser._id, friendId, function(error, newGameId) {
			// TODO error handling

			// Add new friend to current user's friend list
			Meteor.users.update({ _id: currentUser._id }, {$push: {friends: {
				_id: friendId,
				username: friend.username,
				gameId: newGameId,
				statistics: {
					wins: 0,
					losses: 0
				}
			}}});

			// Add current user to new friend's friend list
			Meteor.users.update({ _id: friendId }, { $push: {friends: {
				_id: currentUser._id,
				username: currentUser.username,
				gameId: newGameId,
				statistics: {
					wins: 0,
					losses: 0
				}
			}}});
		});
	},

	removeFriend: function(friendId) {
		'use strict';
		check(friendId, String);

		var currentUser = Meteor.user(),
			friendship = _.find(currentUser.friends, function(friend) {
				return friend._id === friendId;
			});

		if (!friendship) {
			return false;
		}

		Meteor.users.update({_id: currentUser._id}, {$pull: {friends: { id: friendId }}});
		Meteor.users.update({_id: friendId}, {$pull: {friends: { id: currentUser._id }}});

		games.remove(friendship.gameId);

		return true;
	},

	// ----- Game Setup -----

	/*
	A game looks like this:
	{
		_id: 'JSDFK8X38057',
		players: [playerId, friendId],
		board: [
			...
			{
				place: 1,
				pieces: []
			},
			{
				place: 2,
				pieces: ['h', 'h']
			},
			...
		],
		limbo: {
			playerId: ['h', 'h'],
			friendId: ['l']
		},
		removed: {
			playerId: ['h', 'h'],
			friendId: ['l']
		},
		colours: {
			playerId: 'wet-ashphalt',
			friendId: 'carrot'
		},
		bases: {
			playerId: 'h',
			friendId: 'l'
		},
		startingRolls: {
			playerId: '4',
			friendId: '5'
		},
		turn: friendId,
		status: 'inProgress'
	}
	*/

	// Status Changes

	// createGame		-> 	notStarted
	// setupNewGame 	-> 	setupColour
	// setColour 		->	setupBase
	// setBase  		->	setupRoll
	// rollToStart		-> 	inProgress
	// forfeit 			-> 	forfeited

	createGame: function(playerId, friendId) {
		'use strict';

		var newGame = {
			players: [playerId, friendId],
			board: [],
			limbo: {},
			removed: {},
			colours: {},
			bases: {},
			startingRolls: {},
			status: 'notStarted'
		};

		newGame.limbo[playerId] = newGame.limbo[friendId] = [];
		newGame.removed[playerId] = newGame.removed[friendId] = [];

		return games.insert(newGame);
	},

	setupNewGame: function(gameId) {
		'use strict';
		games.update({_id: gameId}, {$set: {
			status: 'setupColour',
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
			]
		}});
	},

	setColour: function(gameId, playerId, friendId, colourId) {
		'use strict';

		var game = games.findOne({_id: gameId}),
			colours = game.colours,
			updates;

		if (colours[friendId] === colourId) {
			return false;
		}

		colours[playerId] = colourId;
		updates = {colours: colours};

		if (Object.keys(colours).length === 2) {
			updates.status = 'setupBase';
		}

		games.update({_id: gameId}, {$set: updates});

		return true;
	},

	setBase: function(gameId, playerId, base) {
		'use strict';

		var game = games.findOne({_id: gameId}),
			bases = game.bases,
			updates;

		// Can't set if already defined or if base is not one of 'h' or 'l'
		if (bases[playerId] || ['h', 'l'].indexOf(base) === -1) {
			return false;
		}

		bases[playerId] = base;
		updates = {bases: bases};

		if (Object.keys(bases).length === 2) {
			updates.status = 'setupRoll';
		}

		games.update({_id: gameId}, {$set: updates});

		return true;
	},

	rollToStart: function(gameId, playerId, friendId) {
		'use strict';

		var game = games.findOne({_id: gameId}),
			startingRolls = game.startingRolls,
			friendRoll,
			playerRoll,
			firstTurn;

		if (startingRolls[playerId] && startingRolls[playerId] !== 'draw') {
			// They've already rolled, ignore this.
			return false;
		}

		startingRolls[playerId] = Math.floor(Math.random() * 6) + 1;

		playerRoll = startingRolls[playerId];

		// Still waiting for someone to roll
		if (Object.keys(startingRolls).length !== 2) {
			games.update({_id: gameId}, {$set: {startingRolls: startingRolls}});
			return true;
		}

		friendRoll = startingRolls[friendId];

		// Both have rolled but they are the same.
		if (playerRoll === friendRoll) {
			startingRolls[playerId] = 'draw';
			startingRolls[friendId] = 'draw';
			games.update({_id: gameId}, {$set: {startingRolls: startingRolls}});
			return true;
		}

		firstTurn = playerRoll > friendRoll ? playerId : friendId;

		// All good!
		games.update({_id: gameId}, {$set: {
			startingRolls: startingRolls,
			turn: firstTurn
		}});

		return firstTurn;
	},

	startGame: function(gameId) {
		'use strict';

		games.update({_id: gameId}, {$set: {status: 'inProgress'}});
	},

	forfeitGame: function(gameId, playerId, friendId) {
		'use strict';

		var clearBoard;

		updateStatistics(playerId, friendId);

		clearBoard = {
			board: [],
			limbo: {},
			removed: {},
			colours: {},
			bases: {},
			startingRolls: {},
			status: 'forfeited'
		};

		clearBoard.limbo[playerId] = clearBoard.limbo[friendId] = [];
		clearBoard.removed[playerId] = clearBoard.removed[friendId] = [];

		games.update({_id: gameId}, {$set: clearBoard});
		return true;
	},

	// ----- Gameplay -----

	setTurn: function(gameId, playerId) {
		'use strict';
		games.update({_id: gameId}, {$set: {turn: playerId}});
	},

	// Piece must be top of the pile or in limbo
	movePiece: function(gameId, playerId, pieceToMove, place) {
		'use strict';

		var game = games.findOne({_id: gameId}),
			friendId = _.without(game.players, playerId)[0],
			board = game.board,
			limbo = game.limbo,
			destinationPieces = board[place].pieces,
			numberOfDestPieces = destinationPieces.length,
			topDestinationPiece,
			movedPiece;

		if (numberOfDestPieces > 0) {
			topDestinationPiece = destinationPieces[numberOfDestPieces - 1];

			// Trying to place on an enemy piece
			if (pieceToMove.piece !== topDestinationPiece) {

				// There is only one piece on the stack - success! Move to limbo.
				if (numberOfDestPieces === 1) {
					limbo[friendId].push(destinationPieces.pop());
				} else {
					// The enemy is guarded, no such luck
					return false;
				}
			}
		}

		// Move piece
		if (pieceToMove.place === 'limbo') {
			movedPiece = limbo[playerId].pop();
		} else {
			movedPiece = board[pieceToMove.place].pieces.pop();
		}

		destinationPieces.push(movedPiece);
		board[place].pieces = destinationPieces;

		games.update({_id: gameId}, {$set: {
			board: board,
			limbo: limbo
		}});

		return true;
	}
});

// Exports to Global Space
Games = games;
