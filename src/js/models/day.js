/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Model
	// ----------

	app.day = Backbone.Model.extend({
		// Default attributes for the model
		defaults: {
            events: []
        },

        addEvent: function(data) {
            var ary = this.get('events');
            ary[ary.length] = data
            this.set({ 'events': ary });
        }
	});
})();
