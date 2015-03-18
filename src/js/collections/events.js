/*global Backbone */
var App = App || {};

(function () {
	'use strict';

	// Collection
	// ---------------

	// The collection of todos is backed by *localStorage* instead of a remote
	// server.
	App.Collections.events = Backbone.Collection.extend({
		url: 'api/data.json',
		// Reference to this collection's model.
		model: App.Models.event,

		comparator: 'etag',

		parse: function (dates) {
			dates.map(function (model) {
				var datetime = model.start.date || model.start.dateTime;

				model.isFullDay = _.has(model.start, 'date');
				model.weekNum = App.Methods.getWeekNum(datetime);
				model.startTimeFormatted = model.isFullDay ? '' : App.Methods.getTimeFormatted(datetime) + ' ';

				return model;
			});

			return dates;
		}
	});
})();
