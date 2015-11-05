/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    App.Labels = {
        minute: [
            0,
            15,
            30,
            45
        ],
        hour: [], // populated programmatically - see calendar.js
        day: [], // populated programmatically
        week : [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
        ],
        month: [
            'January',
            'Febuary',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ],
        year: [] // populated programmatically
    };
})(jQuery);