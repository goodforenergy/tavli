/*global Games, $*/
'use strict';

// ----- Gameplay -----

// TODO Figure out how to dedup these and move somewhere common
var getGame = function() {
		return Games.findOne({_id: Session.get('currentGame')});
	},

	currentPlayer = function() {
		return Meteor.users.findOne({_id: getGame().turn});
	},

	friendId = function() {
		return _.without(getGame().players, Meteor.userId())[0];
	},

	getCurrentUsersBase = function() {
		return getGame().bases[Meteor.userId()];
	},

	currentlySelectedPiece;

Template.gamePlay.currentPlayer = function() {
	if (getGame().turn === Meteor.userId()) {
		return 'Your';
	}
	return currentPlayer().username + '\'s';
};

Template.gamePlay.highPlaces = function() {
	return getGame().board.slice(10, 20);
};

Template.gamePlay.lowPlaces = function() {
	return getGame().board.slice(0, 10);
};

Template.gamePlay.currentUsersTurn = function() {
	return getGame().turn === Meteor.userId();
};

Template.piece.playerColour = function(highOrLow) {
	var colours = getGame().colours;

	return highOrLow === getCurrentUsersBase() ? colours[Meteor.userId()] : colours[friendId()];
};

Template.gamePlay.events({

	'click .js-forfeit': function(e) {
		e.preventDefault();
		Meteor.call('setTurn', Session.get('currentGame'), friendId());
	},

	'click .place': function(e) {
		e.preventDefault();

		var target = $(e.target),
			pieces = this.pieces,
			place = this.place,
			currentUsersBase = getCurrentUsersBase(),
			selectedPiece,
			selectedPieceElement;

		// If it's not the user's turn, don't do anything
		if (getGame().turn !== Meteor.userId()) {
			return;
		}

		// Select the top piece in the stack
		if ((target && target.hasClass('circle')) && (pieces && pieces[pieces.length - 1])) {
			selectedPiece = pieces[pieces.length - 1];
			selectedPieceElement = $(e.currentTarget).children('.circle').last();
		}

		// If the user already had a piece selected, and they've selected a different place, move it
		if (currentlySelectedPiece && currentlySelectedPiece.place !== place) {
			Meteor.call('movePiece', Session.get('currentGame'), currentlySelectedPiece, place, function(error) {
				if (!error) {
					currentlySelectedPiece = null;
				}
			});

		// Otherwise, if they are trying to select a piece that belongs to them, select it
		} else if (selectedPiece && selectedPiece === currentUsersBase) {

			// Don't do anything if a piece on this place is already selected
			if (!currentlySelectedPiece || currentlySelectedPiece.place !== place) {
				currentlySelectedPiece = {
					piece: selectedPiece,
					place: place
				};
				selectedPieceElement.addClass('circle-active');
			}
		}
	}
});
