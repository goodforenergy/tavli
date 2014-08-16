'use strict';

Meteor.publish('userDirectory', function () {
  return Meteor.users.find({}, {fields: {emails: 1, username: 1}});
});

Meteor.publish('userData', function () {
	if (this.userId) {
		return Meteor.users.find({_id: this.userId}, {fields: {'friends': 1}});
	} else {
		this.ready();
	}
});
