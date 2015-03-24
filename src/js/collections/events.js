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

		parse: function (data) {
			var events = data.items;

			// TODO: refactor? getting quite long
			events.map(function (model) {
				var isFullDay = _.has(model.start, 'date');

				var startDateTime = new Date(model.start.date || model.start.dateTime);
				var endDateTime = new Date(model.end.date || model.end.dateTime);

				// to avoid any 1am weirdness
				if (isFullDay) {
					startDateTime = App.Methods.newDate(startDateTime);
					endDateTime = App.Methods.newDate(endDateTime);
				}

				var d = App.Methods.getObjectFromDate(startDateTime);
				var pos = App.Methods.getDayOfWeekNum(d.year, d.month, d.day);

				var startTime = isFullDay ? '' : App.Methods.getTimeFormatted(startDateTime) + ' ';

				var spanMax = App.Constants.DAYS_IN_WEEK - pos;
				var span = App.Methods.getDaysInRangeNum(startDateTime, endDateTime);

				span = span > spanMax ? spanMax : span;

				// namespace our custom properties
				var customData = {
					startDateTime: startDateTime,
					endDateTime: endDateTime,
					pos: pos,
					span: span,
					isFullDay: isFullDay,
					title: startTime + model.summary,
					weekNum: App.Methods.getWeekNum(startDateTime)
				};

				model.custom = customData;

				return model;
			});

			return events;
		}
	});
})();
