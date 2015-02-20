/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Model
	// ----------

	app.day = Backbone.Model.extend({
		// Default attributes for the model
		defaults: {
			num: 0,
			label: 'day',
			events: {}
		}
	});
})();
