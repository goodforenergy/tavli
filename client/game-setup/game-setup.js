/*global Games*/
'use strict';

Meteor.subscribe('games');

var colours = [
		{name: 'turquoise'},
		{name: 'emerald'},
		{name: 'peter-river'},
		{name: 'amethyst'},
		{name: 'wet-asphalt'},
		{name: 'sunflower'},
		{name: 'carrot'},
		{name: 'alizarin'}
	],

	STATUS = {
		SETUP: 'gameSetup',
		ROLL_TO_START: 'gameRollToStart'
	},

	TOO_LATE = 'Too Late! Already Taken',

	getGame = function(property) {
		var fields = {},
			game;

		if (property) {
			fields[property] = 1;
		}
		game = Games.findOne({_id: Session.get('currentGame')}, fields);
		return game && property ? game[property] : game;
	},

	getFriendId = function() {
		return _.without(getGame().players, Meteor.userId())[0];
	},

	getFriend = function() {
		return Meteor.users.findOne({_id: getFriendId()});
	},

	playersNeedToPickAColour = function() {
		return Object.keys(getGame('colours')).length !== 2;
	},

	playersNeedToRoll = function() {
		var rolls = getGame('startingRolls'),
			players = Object.keys(rolls);

		if (players.length !== 2) {
			return true;
		}
		return !rolls[players[0]] || !rolls[players[1]] || rolls[players[0]] === rolls[players[1]];
	},

	playersNeedToRollAgain = function() {
		var rolls = getGame('startingRolls'),
			players = Object.keys(rolls);

		return players.length === 2 && rolls[players[0]] === rolls[players[1]];
	},

	getGameStatus = function() {

		// If either player needs to choose a colour, game is still in setup
		if (playersNeedToPickAColour()) {
			return STATUS.SETUP;

		// Flow into this block in case they haven't clicked the 'start' button yet
		}
		return STATUS.ROLL_TO_START;
	},

	getCurrentColour = function(id) {
		// TODO Can I only return the colours field here?
		var colours = Games.findOne({_id: Session.get('currentGame')}).colours;
		return colours && colours[id];
	},

	roll = function() {
		return Math.floor(Math.random() * 7);
	};

// ----- Game Page -----

Template.gamePage.friend = getFriend;

Template.gamePage.colours = function(id) {
	return getCurrentColour(id) || '';
};

Template.gamePage.gameInProgress = function() {
	var game = getGame();
	return game && game.status;
};

Template.gamePage.gameSetupTemplate = function() {
	return Template[getGameStatus()];
};

// ----- Game Setup -----
Template.gameSetup.playerNeedsToPickColour = function() {
	return !getCurrentColour(Meteor.userId());
};

Template.gameSetup.friend = getFriend;

Template.gameSetup.colours = function() {
	return colours;
};

Template.gameSetup.colourName = function(name, friendId) {
	var friendColour = getCurrentColour(friendId);
	return name === friendColour ? TOO_LATE : name;
};

Template.gameSetup.events({
	'click .js-colour': function(e) {
		e.preventDefault();

		var gameId = Session.get('currentGame'),
			userId = Meteor.userId();

		if (this.name !== TOO_LATE) {
			Meteor.call('setColour', gameId, userId, this.name);
		}
	}
});

// ----- Game Roll -----

Template.gameRollToStart.friend = getFriend;

// TODO Refactor into some kind of roll status
Template.gameRollToStart.playerNeedsToRoll = function() {
	// Player needs to roll if they haven't, or if their roll is equal to their friend's roll
	var rolls = getGame('startingRolls');
	return !rolls || !rolls[Meteor.userId()] || playersNeedToRollAgain();
};

Template.gameRollToStart.playersNeedToRollAgain = playersNeedToRollAgain;

Template.gameRollToStart.bothPlayersHaveRolled = function() {
	console.log(!playersNeedToRoll());
	return !playersNeedToRoll();
};

Template.gameRollToStart.currentUserRoll = function() {
	var rolls = getGame('startingRolls');
	return rolls && rolls[Meteor.userId()] || '-';
};

Template.gameRollToStart.friendRoll = function() {
	var rolls = getGame('startingRolls');
	return rolls && rolls[getFriendId()] || '-';
};

Template.gameRollToStart.startingPlayer = function() {
	var startingPlayer = getGame('turn');
	return Meteor.users.findOne({_id: startingPlayer}).username;
};

Template.gameRollToStart.events({
	'click .js-roll': function(e) {
		e.preventDefault();
		Meteor.call('rollToStart', Session.get('currentGame'), Meteor.userId(), roll());
	},

	'click .js-proceed': function(e) {
		e.preventDefault();
		Meteor.call('startGame', Session.get('currentGame'));
	}
});
