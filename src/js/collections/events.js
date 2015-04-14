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

				// separate property to isFullDay, as certain events can be both -- see 'else'
				// side of 'isFullDay' if statement below
				var isTimedEvent = !isFullDay;

				var startDateTime = new Date(model.start.date || model.start.dateTime);
				var endDateTime = new Date(model.end.date || model.end.dateTime);

				// whether a timed event is split over 2 days, i.e. runs through midnight to next day
				var isSplitDate = isTimedEvent && !App.Methods.isSameDate(startDateTime, endDateTime);

				// to avoid any 1am weirdness
				if (isFullDay) {
					startDateTime = App.Methods.newDate(startDateTime);
					endDateTime = App.Methods.newDate(endDateTime);

				} else {
					// if the event is not explicitly a full-day event, but runs longer than 1 day,
					// mark is as a full-day event
					if (App.Methods.getDuration(startDateTime, endDateTime).days > 1) {
						isFullDay = true;
					}
				}

				var pos = App.Methods.getDayOfWeekNum(startDateTime);

				var startTime = isFullDay ? '' : App.Methods.getTimeFormatted(startDateTime) + ' ';

				var spanMax = App.Constants.DAYS_IN_WEEK - pos;
				var span = App.Methods.getDaysInRangeNum(startDateTime, endDateTime);

				span = isSplitDate ? 2 : span;

				// make sure span is within bounds
				span = span > spanMax ? spanMax : span;
				span = span < 1 ? 1 : span;

				// namespace our custom properties
				var customData = {
					id: model.id,
					startDateTime: startDateTime,
					endDateTime: endDateTime,
					pos: pos,
					span: span,
					isFullDay: isFullDay,
					isTimedEvent: isTimedEvent,
					isSplitDate: isSplitDate,
					title: startTime + model.summary,
					summary: model.summary,
					weekNum: App.Methods.getWeekNum(startDateTime)
				};

				model.custom = customData;

				return model;
			});

			return events;
		}
	});
})();
