/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------
    // extending App.Views.month
    App.Views.monthInSummary = App.Views.month.extend({
        template: _.template($('#month-summary-template').html()),

        customDayView: App.Views.dayInSummary,

        events: {
            'click .cal__control--prev': 'gotoPrevMonth',
            'click .cal__control--next': 'gotoNextMonth',
            'click .day__date': 'gotoDate'
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            // call the render method of super class, before running our extension code
            App.Views.month.prototype.render.apply(this);

            return this.el;
        },


        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        gotoDate: function (e) {
            if (e) { e.preventDefault(); }

            var date = $(e.currentTarget).data('date');

            App.Events.trigger('goto:date', App.Methods.newDate(date));
        },

        gotoNextMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth({
                'type': 'next',
                'month': this.selfMonth,
                'dest': 'summary'
            });
        },

        gotoPrevMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth({
                'type': 'previous',
                'month': this.selfMonth,
                'dest': 'summary'
            });
        }
    });
})(jQuery);