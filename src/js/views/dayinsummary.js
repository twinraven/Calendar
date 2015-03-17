/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.Views.dayInSummary = app.Views.day.extend({
        template: _.template($('#day-summary-template').html())
    });
})(jQuery);