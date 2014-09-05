/*global Games, $, UI*/
'use strict';

UI.registerHelper('firstFour', function(arr) {
	return arr.slice(0, 4);
});

UI.registerHelper('remaining', function(arr) {
	return arr && arr.length > 4 ? arr.slice(4) : [];
});

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

	playerColour = function(highOrLow) {
		var colours = getGame().colours;

		return highOrLow === getCurrentUsersBase() ? colours[Meteor.userId()] : colours[friendId()];
	},

	getVal = function(pieces) {

		if (!pieces) {
			return '';
		}

		// All pieces should be the same. Barf if not.
		pieces.reduce(function(v1, v2) {
			if (v1 !== v2) {
				console.log('baarrrgghhh what?!');
			}
			return v2;
		});

		return pieces[0];
	},

	currentlySelectedPiece,

	handleCircleClick = function(context) {

		var placeElement = context.placeElement,
			boundData = context.this,

			selectPiece = function(piece, place, elementToSelect) {
				currentlySelectedPiece = {
					piece: piece,
					place: place
				};
				$('.place .circle').removeClass('circle-active');
				elementToSelect.addClass('circle-active');
			},

			pieces,
			selectedPiece,
			selectedPieceElement;

		// If they are in limbo, just let them select the piece
		if (context.inLimbo) {
			if (placeElement.hasClass('user')) {
				selectPiece(context.userBase, 'limbo', context.circleElement);
			}
		} else {
			pieces = boundData.pieces;

			// Select the top piece in the stack
			if (pieces && pieces[pieces.length - 1]) {
				selectedPiece = pieces[pieces.length - 1];
				selectedPieceElement = placeElement.children('.circle').last();
			}

			if (selectedPiece && selectedPiece === context.userBase) {
				selectPiece(selectedPiece, boundData.place, selectedPieceElement);
			}
		}
	},

	handlePlaceClick = function(context) {

		var place = context.this.place;

		if (context.inLimbo) {
			// Can't move to limbo, so just return
			return;
		}

		// If the user already had a piece selected, and they've selected a different place, move it
		if (currentlySelectedPiece && currentlySelectedPiece.place !== place) {
			Meteor.call('movePiece', Session.get('currentGame'), currentlySelectedPiece, place, Meteor.userId(),
				function(error, result) {
					if (result) {
						currentlySelectedPiece = null;
					}
				});
		}
	};

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

Template.gamePlay.userPieces = function() {
	var limbo = getGame().limbo;
	console.log(limbo);
	return limbo[Meteor.userId()];
};

Template.gamePlay.friendPieces = function() {
	var limbo = getGame().limbo;
	return limbo[friendId()];
};

Template.piece.playerColour = playerColour;

Template.stackedPiece.playerColour = function(pieces) {
	return playerColour(getVal(pieces));
};

Template.stackedPiece.getCount = function(pieces) {

	if (pieces.length === 1) {
		return '';
	}
	return pieces.length.toString();
};

Template.gamePlay.events({

	'click .js-forfeit': function(e) {
		e.preventDefault();
		Meteor.call('setTurn', Session.get('currentGame'), friendId());
	},

	'click .place': function(e) {
		e.preventDefault();

		var target = $(e.target), // What the user actually clicked on
			currentTarget = $(e.currentTarget), // The element that caused this handler to be invoked, i.e. the place
			context = {};

		// If it's not the user's turn, don't do anything
		if (getGame().turn !== Meteor.userId()) {
			return;
		}

		context.inLimbo = currentTarget.parent('.limbo').length === 1;
		context.placeElement = currentTarget;
		context.userBase = getCurrentUsersBase();
		context.this = this;

		if (target.hasClass('circle')) {
			context.circleElement = target;
			handleCircleClick(context);
		} else {
			handlePlaceClick(context);
		}
	}
});
