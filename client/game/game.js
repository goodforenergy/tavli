/* global $, UI, Router */
'use strict';

var getFriend = function() {
		return Router.current().data().friend;
	},

	getGame = function() {
		return Router.current().data().game;
	},

	currentlySelectedPiece;

UI.registerHelper('firstFour', function(arr) {
	return arr.slice(0, 4);
});

UI.registerHelper('remaining', function(arr) {
	return arr && arr.length > 4 ? arr.slice(4) : [];
});

Template.game.colours = function(id) {
	return this.game.colours[id] || '';
};

Template.game.gameInProgress = function() {
	return this.game.status === 'inProgress';
};

Template.game.gameSetupTemplate = function() {
	return Template[this.game.status];
};

Template.game.currentPlayerUsername = function() {
	var user = Meteor.user();
	return this.game.turn === user._id ? 'Your' : this.friend.username + '\'s';
};

Template.game.currentUsersTurn = function() {
	return this.game.turn === Meteor.userId();
};

Template.game.highPlaces = function() {
	return this.game.board.slice(10, 20);
};

Template.game.lowPlaces = function() {
	return this.game.board.slice(0, 10);
};

Template.game.piecesInLimbo = function(id) {
	return this.game.limbo[id];
};

// ------ Piece ------

Template.piece.pieceColour = function(pieceValue) {

	var game = getGame(),
		colours = game.colours,
		userBase = game.bases[Meteor.userId()];

	return pieceValue === userBase ? colours[Meteor.userId()] : colours[getFriend()._id];
};

// ------ Stacked Piece ------

Template.stackedPiece.stackedPieceColour = Template.piece.pieceColour;

Template.stackedPiece.getCount = function(pieces) {

	if (pieces.length === 1) {
		return '';
	}
	return pieces.length.toString();
};

// TODO REFACTOR THE FUCK OUT OF THIS

var handleCircleClick = function(context) {

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

	handlePlaceClick = function(gameId, context) {

		var place = context.this.place;

		if (context.inLimbo) {
			// Can't move to limbo, so just return
			return;
		}

		// If the user already had a piece selected, and they've selected a different place, move it
		if (currentlySelectedPiece && currentlySelectedPiece.place !== place) {
			Meteor.call('movePiece', gameId, Meteor.userId(), currentlySelectedPiece, place,
				function(error, result) {
					if (result) {
						currentlySelectedPiece = null;
					}
				});
		}
	};

Template.game.events({

	'click .js-forfeit': function(e) {
		e.preventDefault();
		Meteor.call('setTurn', this.game._id, this.friend._id);
	},

	'click .place': function(e) {
		e.preventDefault();

		var target = $(e.target), // What the user actually clicked on
			currentTarget = $(e.currentTarget), // The element that caused this handler to be invoked, i.e. the place
			game = getGame(),
			userBase = game.bases[Meteor.userId()],
			context = {};

		// If it's not the user's turn, don't do anything
		if (game.turn !== Meteor.userId()) {
			return;
		}

		context.inLimbo = currentTarget.parent('.limbo').length === 1;
		context.placeElement = currentTarget;
		context.userBase = userBase;
		context.this = this;

		if (target.hasClass('circle')) {
			context.circleElement = target;
			handleCircleClick(context);
		} else {
			handlePlaceClick(game._id, context);
		}
	}
});
