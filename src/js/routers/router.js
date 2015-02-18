/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Todo Router
	// ----------
	var Router = Backbone.Router.extend({
		routes: {
			'/path/:param': 'callbackMethod'
		},

		callbackMethod: function (param) {
			app.todos.trigger('custom');
		}
	});

	app.router = new Router();
	Backbone.history.start();
})();
