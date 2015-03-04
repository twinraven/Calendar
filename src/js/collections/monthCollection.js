/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Collection
	// ---------------

	// The collection of todos is backed by *localStorage* instead of a remote
	// server.
	app.monthCollection = Backbone.Collection.extend({
		url: '/',
		// Reference to this collection's model.
		model: app.day,

		// Save all of the todo items under the `"calendar"` namespace.
		localStorage: new Backbone.LocalStorage('calendar-backbone')
	});
})();
