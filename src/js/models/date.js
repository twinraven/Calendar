/*global Backbone */
var App = App || {};

(function () {
    'use strict';

    // Model
    // ----------

    App.Models.date = Backbone.Model.extend({
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
