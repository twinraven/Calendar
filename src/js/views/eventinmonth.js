/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.eventInMonth = App.Views.event.extend({
        template: _.template($('#event-month-template').html())
    });
})(jQuery);