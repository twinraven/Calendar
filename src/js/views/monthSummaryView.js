/* global Backbone, jQuery, _, ENTER_KEY */
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
            // call the render method of parent class
            app.monthView.prototype.render.apply(this);

            this.$title = this.$('.cal-title');
            this.$controls = this.$('.cal-controls');

            this.renderMonthName(this.$title, this.selfMonth);

            return this.el;
        },

        renderMonthName: function (elem, data) {
            elem.text(app.cal.getMonthName(data) + " " + app.cal.getYear(data));
        },


        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        gotoDate: function (e) {
            var date = $(e.currentTarget).data('ref');

            app.events.trigger('goto:date', app.cal.newDate(date));
        },

        gotoNextMonth: function (e) {
            if (e) { e.preventDefault(); }

            this._gotoMonth({
               'type': 'next',
               'month': this.selfMonth,
               'dest': 'summary'
            });
        },

        gotoPrevMonth: function (e) {
            if (e) { e.preventDefault(); }

            this._gotoMonth({
               'type': 'previous',
               'month': this.selfMonth,
               'dest': 'summary'
            });
        }
    });
})(jQuery);