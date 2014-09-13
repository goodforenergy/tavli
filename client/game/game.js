/* global $, UI, Router */
'use strict';

var getFriend = function() {
		return Router.current().data().friend;
	},

	getGame = function() {
		return Router.current().data().game;
	},

	inLimbo = function(element) {
		return element.parents('.limbo').length === 1;
	},

	// Keep track of what's selected
	currentlySelectedPiece,

	movePiece = function(pieceToMove, place) {
		Meteor.call('movePiece', getGame()._id, Meteor.userId(), getFriend()._id, pieceToMove, place, function(error, result) {
			// If the piece was successfully moved, set the currently selected piece to null
			if (result) {
				currentlySelectedPiece = null;
			}
		});
	};

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
	return this.game.turn === user._id ? 'your' : this.friend.username + '\'s';
};

Template.game.base = function() {
	return this.game.bases[Meteor.userId()];
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

// ----- Place -----

Template.place.base = function() {

	var game = getGame(),
		userId = Meteor.userId(),
		userColour = game.colours[userId],
		userBase = game.bases[userId],
		homeBase = userBase === 'h' ? [15, 16, 17, 18, 19] : [0, 1, 2, 3, 4];

	return _.contains(homeBase, this.place) ? userColour + ' base' : '';
};

Template.game.events({

	'click .js-done': function(e) {
		e.preventDefault();
		Meteor.call('setTurn', this.game._id, this.friend._id);
	},

	'click .place .piece': function(e) {
		e.stopPropagation();

		var pieceElement = $(e.currentTarget),
			game = getGame(),
			userBase = game.bases[Meteor.userId()],
			baseOfSelectedPiece = $.isArray(this) ? this[0] : this,
			pieceInLimbo,
			placeElement,
			place,
			elementToSelect;

		// If it's not the user's turn, or if they're trying to select an enemy piece, don't do anything
		if (game.turn !== Meteor.userId() || baseOfSelectedPiece !== userBase) {
			return;
		}

		pieceInLimbo = inLimbo(pieceElement);
		placeElement = pieceInLimbo ? null : pieceElement.parent('.place');

		// Place number is stored in the data-place attr on the place element
		place = pieceInLimbo ? 'limbo' : placeElement.data('place');

		// If the user already has a piece selected and they're not in limbo, move the piece
		if (currentlySelectedPiece && currentlySelectedPiece.place !== place) {
			movePiece(currentlySelectedPiece, place);
			return;
		}

		// Select either the piece (if in limbo) or else the top piece in the stack
		elementToSelect = pieceInLimbo ? pieceElement : placeElement.children('.piece').last();

		// Select piece
		currentlySelectedPiece = {
			base: baseOfSelectedPiece,
			place: place
		};

		$('.place .piece').removeClass('piece-active');
		elementToSelect.addClass('piece-active');
	},

	'click .place': function(e) {
		e.stopPropagation();

		var placeElement = $(e.currentTarget), // The element that caused this handler to be invoked, i.e. the place
			place = this.place,
			game = getGame();

		// If it's not the user's turn, or they're trying to move to limbo (?) don't do anything
		if (game.turn !== Meteor.userId() || inLimbo(placeElement)) {
			return;
		}

		// If the user already had a piece selected, and they've selected a different place, move it
		if (currentlySelectedPiece && currentlySelectedPiece.place !== place) {
			movePiece(currentlySelectedPiece, place);
		}
	}
});
