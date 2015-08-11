/*global Backbone */
var App = App || {};

(function () {
	'use strict';

	// Todo Router
	// ----------
	App.Router = new (Backbone.Router.extend({
		routes : {
			"" : "index"
		},
		index : function () {
			console.log('Calendar start');
			var calApp = new App.Calendar(); // self-rendering in initialize()
		},

		start: function () {
			Backbone.history.start();
		}
	}));
})();