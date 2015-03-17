/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------
    // extending app.Views.month
    app.Views.monthInSummary = app.Views.month.extend({
        template: _.template($('#month-summary-template').html()),

        customDayView: app.Views.dayInSummary,

        events: {
            'click .prev-self': 'gotoPrevMonth',
            'click .next-self': 'gotoNextMonth',
            'click .date': 'gotoDate'
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            // call the render method of super class, before running our extension code
            app.Views.month.prototype.render.apply(this);

            this.renderMonthName(this.$('.cal-title'));

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderMonthName: function ($elem) {
            var d = this.selfMonth;

            $elem.text(app.Methods.getMonthName(d) + ' ' + app.Methods.getYear(d));
        },


        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        gotoDate: function (e) {
            if (e) { e.preventDefault(); }

            var date = $(e.currentTarget).data('date');

            app.Events.trigger('goto:date', app.Methods.newDate(date));
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