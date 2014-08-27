/*global Games*/
'use strict';

// ----- Gameplay -----

// TODO Figure out how to dedup these and move somewhere common
var getGame = function() {
		return Games.findOne({_id: Session.get('currentGame')});
	},

	currentPlayer = function() {
		return Meteor.users.findOne({_id: getGame().turn});
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

Template.gamePlay.events({
	'click .js-done': function(e) {
		e.preventDefault();
		Meteor.call('setTurn', Session.get('currentGame'), _.without(getGame().players, Meteor.userId())[0]);
	},
	'click .place': function(e) {
		e.preventDefault();

		var pieces = this.pieces,
			place = this.place,
			selectedPiece = pieces && pieces[pieces.length - 1],
			currentUsersBase = getGame().bases[Meteor.userId()];

		// If it's not the user's turn, don't do anything
		if (getGame().turn !== Meteor.userId()) {
			return;
		}

		// If the user already had a piece selected, move it
		if (currentlySelectedPiece) {
			Meteor.call('movePiece', Session.get('currentGame'), currentlySelectedPiece, place, function(error, result) {
				if (!error) {
					console.log('Move complete');
					console.log(result);
					currentlySelectedPiece = null;
				}
			});

		// Otherwise, if they are trying to select a piece that belongs to them, select it
		} else if (selectedPiece && selectedPiece === currentUsersBase) {
			currentlySelectedPiece = {
				piece: selectedPiece,
				place: place
			};
			console.log('Selecting piece');
			console.log(currentlySelectedPiece);
		}
	}
});
