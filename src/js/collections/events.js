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
				var startDateTime = new Date(model.start.date || model.start.dateTime);
				var endDateTime = new Date(model.end.date || model.end.dateTime);

				var d = App.Methods.getObjectFromDate(startDateTime);
				var pos = App.Methods.getDayOfWeekNum(d.year, d.month, d.day);

				var isFullDay = _.has(model.start, 'date');

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

			return dates;
		}
	});
})();
