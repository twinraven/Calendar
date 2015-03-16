/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Collection
	// ---------------

	// The collection of todos is backed by *localStorage* instead of a remote
	// server.
	app.gApiCollection = Backbone.Collection.extend({
		url: 'api/calendar-v3.json',
		// Reference to this collection's model.
		model: app.gApi,

		comparator: 'etag',

		parse: function (dates) {
			dates.map(function (item) {
				item.isFullDay = _.has(item.start.date);

				return item;
			});

			return dates;
		}
	});
})();
