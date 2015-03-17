/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Todo Router
	// ----------
	/*var Router = Backbone.Router.extend({
		routes : {
			"MONTH" : "monthCalendar",
			"WEEK" : "weekCalendar"
		},
		monthCalendar : function () {
			this.loadView(new app.Views.monthInFull(({
		        dayTemplate: '#day-main-template'
		    })));
		},
		weekCalendar : function () {
			this.loadView(new app.Views.week());
		},
		loadView : function (view) {
			this.view && (this.view.close ? this.view.close() : this.view.remove());
			this.view = view;

			this.view.render();
		}
	});

	app.router = new Router();
	Backbone.history.start();*/
})();