/*global Games*/
'use strict';

// ----- Gameplay -----

// TODO Figure out how to dedup these and move somewhere common
var getGame = function() {
		return Games.findOne({_id: Session.get('currentGame')});
	},

	currentPlayer = function() {
		return Meteor.users.findOne({_id: getGame().turn});
	};

Template.gamePlay.currentPlayer = function() {
	if (getGame().turn === Meteor.userId()) {
		return 'Your';
	}
	return currentPlayer().username + '\'s';
};

Template.gamePlay.highPlaces = function() {
	return [
		['l', 'l', 'l', 'l', 'l'],
		[],
		[],
		['h', 'h', 'h'],
		[],
		['h', 'h', 'h', 'h', 'h'],
		[],
		['l', 'l'],
		[],
		[]
	];
};

Template.gamePlay.lowPlaces = function() {
	return [
		[],
		[],
		['h', 'h'],
		[],
		['l', 'l', 'l', 'l', 'l'],
		[],
		['l', 'l', 'l'],
		[],
		[],
		['h', 'h', 'h', 'h', 'h']
	];
};

Template.gamePlay.currentUsersTurn = function() {
	return getGame().turn === Meteor.userId();
};

Template.gamePlay.events({
	'click .js-done': function(e) {
		e.preventDefault();
		Meteor.call('setTurn', Session.get('currentGame'), _.without(getGame().players, Meteor.userId())[0]);
	}
});
