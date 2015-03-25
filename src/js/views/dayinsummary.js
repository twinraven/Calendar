/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.dayInSummary = App.Views.day.extend({
        template: Handlebars.compile($('#day-summary-template').html())
    });
})(jQuery);