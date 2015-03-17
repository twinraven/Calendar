/*global Backbone */
var app = app || {};

(function () {
    'use strict';

    // Model
    // ----------

    app.dayModel = Backbone.Model.extend({
        // Default attributes for the model
        defaults: {
            isActive: false,
            isHighlight: false,
            events: {
                day: [],
                timed: []
            }
        }
    });
})();
