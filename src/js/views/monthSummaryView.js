/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------
    // extending app.monthView
    app.monthSummaryView = app.monthView.extend({
        //
        template: _.template($('#month-summary-template').html()),
        dayTemplate: _.template($('#day-summary-template').html()),

        events: {
            'click .prev-self': 'gotoPrevMonth',
            'click .next-self': 'gotoNextMonth',
            'click .date': 'gotoDate'
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            // call the render method of super class, before running our extension code
            app.monthView.prototype.render.apply(this);

            this.renderMonthName(this.$('.cal-title'));

            return this.el;
        },

        renderMonthName: function ($elem) {
            var d = this.selfMonth;

            $elem.text(app.cal.getMonthName(d) + " " + app.cal.getYear(d));
        },


        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        gotoDate: function (e) {
            if (e) { e.preventDefault(); }

            var date = $(e.currentTarget).data('ref');

            app.events.trigger('goto:date', app.cal.newDate(date));
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