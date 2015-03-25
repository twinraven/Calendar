/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.eventInMonth = App.Views.event.extend({
        template: Handlebars.compile($('#event-month-template').html())
    });
})(jQuery);