/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Collection
	// ---------------

	// The collection of todos is backed by *localStorage* instead of a remote
	// server.
	var Collection = Backbone.Collection.extend({
		// Reference to this collection's model.
		model: app.model,

		// Save all of the todo items under the `"calendar"` namespace.
		localStorage: new Backbone.LocalStorage('calendar-backbone')
	});

	// Create our global collection of **Collection**.
	app.collection = new Collection();
})();
