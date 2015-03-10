/*global Backbone */
var app = app || {};

(function () {
    'use strict';

    // Model
    // ----------

    app.time = Backbone.Model.extend({
        // Default attributes for the model
        defaults: {
            hour: 0,
            minute: 0
        }
    });
})();
