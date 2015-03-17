/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.dayInSummary = App.Views.day.extend({
        template: _.template($('#day-summary-template').html())
    });
})(jQuery);