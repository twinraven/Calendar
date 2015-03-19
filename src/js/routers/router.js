/*global Backbone */
var App = App || {};

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
			this.loadView(new App.Views.monthInFull(({
		        dayTemplate: '#day-full-template'
		    })));
		},
		weekCalendar : function () {
			this.loadView(new App.Views.week());
		},
		loadView : function (view) {
			this.view && (this.view.close ? this.view.close() : this.view.remove());
			this.view = view;

			this.view.render();
		}
	});

	App.router = new Router();
	Backbone.history.start();*/
})();