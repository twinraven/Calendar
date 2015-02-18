/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
	'use strict';

	// The Application
	// ---------------

	// Our overall **AppView** is the top-level piece of UI.
	app.view = Backbone.View.extend({
		el: '#container',

		template: _.template($('#block-template').html()),

		// At initialization we bind to the relevant events on the `Todos`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting todos that might be saved in *localStorage*.
		initialize: function () {
			// this.xxx - cache selectors

			// bind to change events in model/collection
			//this.listenTo(app.collection, 'custom', this.method);

			// load data
			// app.collection.fetch({reset: true});
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function () {
			var self = this;
			app.data.map(function(d) {
				self.$el.append(self.template(d));
			});

			var now = new Date();

			console.log(app.cal.getMonthStartDay(now.getFullYear(), now.getMonth()));

			return this;
		},

		method: function () {
			// custom method
		}
	});
})(jQuery);

app.const = {
	DAYS_IN_WEEK : 7,
	MONTHS_IN_YEAR : 12
};

app.config = {
	startDay : "mon"
};

app.labels = {
	week : [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday"
	]
};

app.cal = {
	getDaysInMonth : function(year, month) {
		return new Date(year, month+1, 0).getDate();
	},
	getMonthStartDay : function(year, month) {
		var startDay = new Date(year, month+1, 1).getDay();

		if (app.config.startDay === "mon") {
			startDay = (startDay + 6) % 7;
		}
		return startDay;
	}
};

app.data = [
	{
		title : "Monday"
	},
	{
		title : "Tuesday"
	},
	{
		title : "Wednesday"
	},
	{
		title : "Thursday"
	},
	{
		title : "Friday"
	},
	{
		title : "Saturday"
	},
	{
		title : "Sunday"
	}
];