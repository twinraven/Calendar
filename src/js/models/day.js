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
        }

        /*addEvent: function(data) {
            this.set({ 'events': data.id });
        }*/
    });
})();
