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

	bases = [
		{
			base: 'high',
			key: 'h'
		},
		{
			base: 'low',
			key: 'l'
		}
	],

	STATUS = {
		COLOUR_SELECTION: 'colourSelection',
		BASE_SELECTION: 'baseSelection',
		ROLL_TO_START: 'rollToStart'
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

	playersNeedToPickColours = function() {
		return Object.keys(getGame('colours')).length !== 2;
	},

	playersNeedToPickBases = function() {
		return Object.keys(getGame('bases')).length !== 2;
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

	getCurrentColour = function(id) {
		// TODO Can I only return the colours field here?
		var colours = Games.findOne({_id: Session.get('currentGame')}).colours;
		return colours && colours[id];
	},

	playerNeedsToPickColour = function() {
		return !getCurrentColour(Meteor.userId());
	},

	getCurrentBase = function(id) {
		// TODO Can I only return the base field here?
		var bases = Games.findOne({_id: Session.get('currentGame')}).bases;
		return bases && bases[id];
	},

	getGameStatus = function() {

		if (playerNeedsToPickColour()) {
			return STATUS.COLOUR_SELECTION;
		}

		// Can't progress from here until both players have picked bases
		if (playersNeedToPickBases()) {
			return STATUS.BASE_SELECTION;
		}

		// In case they have finished setup but haven't hit start yet
		return STATUS.ROLL_TO_START;
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

// ----- Colour Selection -----
Template.colourSelection.friend = getFriend;

Template.colourSelection.colours = function() {
	return colours;
};

Template.colourSelection.colourName = function(name, friendId) {
	var friendColour = getCurrentColour(friendId);
	return name === friendColour ? TOO_LATE : name;
};

Template.colourSelection.events({
	'click .js-colour': function(e) {
		e.preventDefault();

		var gameId = Session.get('currentGame'),
			userId = Meteor.userId();

		if (this.name !== TOO_LATE) {
			Meteor.call('setColour', gameId, userId, this.name);
		}
	}
});

// ----- Base Selection -----

Template.baseSelection.friend = getFriend;

Template.baseSelection.playerNeedsToPickBase = function() {
	return !getCurrentBase(Meteor.userId());
};

Template.baseSelection.bases = function() {
	return bases;
};

Template.baseSelection.baseFormatter = function(base, friendId) {
	var friendBase = getCurrentBase(friendId);
	return base.key === friendBase ? TOO_LATE : base.base;
};

Template.baseSelection.whatUserIsWaitingOn = function() {
	return playersNeedToPickColours() ? 'a colour' : 'a base';
};

Template.baseSelection.events({
	'click .js-base': function(e) {
		e.preventDefault();
		var gameId = Session.get('currentGame'),
			userId = Meteor.userId();

		if (this.base !== TOO_LATE) {
			Meteor.call('setBase', gameId, userId, this.key);
		}
	}
});

// ----- Game Roll -----

Template.rollToStart.friend = getFriend;

// TODO Refactor into some kind of roll status
Template.rollToStart.playerNeedsToRoll = function() {
	// Player needs to roll if they haven't, or if their roll is equal to their friend's roll
	var rolls = getGame('startingRolls');
	return !rolls || !rolls[Meteor.userId()] || playersNeedToRollAgain();
};

Template.rollToStart.playersNeedToRollAgain = playersNeedToRollAgain;

Template.rollToStart.bothPlayersHaveRolled = function() {
	return !playersNeedToRoll();
};

Template.rollToStart.currentUserRoll = function() {
	var rolls = getGame('startingRolls');
	return rolls && rolls[Meteor.userId()] || '-';
};

Template.rollToStart.friendRoll = function() {
	var rolls = getGame('startingRolls');
	return rolls && rolls[getFriendId()] || '-';
};

Template.rollToStart.startingPlayer = function() {
	var startingPlayer = getGame('turn');
	return Meteor.users.findOne({_id: startingPlayer}).username;
};

Template.rollToStart.events({
	'click .js-roll': function(e) {
		e.preventDefault();
		Meteor.call('rollToStart', Session.get('currentGame'), Meteor.userId(), roll());
	},

	'click .js-proceed': function(e) {
		e.preventDefault();
		Meteor.call('startGame', Session.get('currentGame'));
	}
});
