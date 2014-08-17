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
		ROLL_TO_START: 'gameRollToStart',
		GAMEPLAY: 'gamePlay'
	},

	getGame = function() {
		return Games.findOne({_id: Session.get('currentGame')});
	},

	getColours = function() {
		return getGame().colours;
	},

	getFriendId = function() {
		return _.without(getGame().players, Meteor.userId())[0];
	};

// ----- Game Page -----
Template.gamePage.game = function() {
	return getGame();
};

Template.gamePage.currentUser = function() {
	return Meteor.user();
};

// TODO Make the next two functions better - mix into game or current user / friend data
Template.gamePage.currentUserColour = function() {
	return getColours()[Meteor.userId()] || '';
};

Template.gamePage.friendColour = function() {
	return getColours()[getFriendId()] || '';
};

Template.gamePage.friend = function() {
	return Meteor.users.findOne({_id: getFriendId()});
};

Template.gamePage.gameTemplate = function() {
	return Template[Session.get('gameStatus')];
};

// ----- Game Setup -----
Template.gameSetup.colours = function() {
	return colours;
};

Template.gameSetup.events({
	'click .js-colour': function() {
		var gameId = getGame()._id,
			userId = Meteor.userId();
		Meteor.call('setColour', gameId, userId, this.name);
	}
});

// ----- Initialisation Code -----
Meteor.startup(function() {
	Session.setDefault('gameStatus', STATUS.SETUP);
});
