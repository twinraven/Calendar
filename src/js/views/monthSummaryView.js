/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------
    // extending app.monthView
    app.monthSummaryView = app.monthView.extend({
        template: _.template($('#month-summary-template').html()),
        dayTemplate: _.template($('#day-summary-template').html()),

        events: {
            'click .prev-self': '_gotoPrevMonth',
            'click .next-self': '_gotoNextMonth',
        },

        render: function () {
            // call the render method of parent class
            app.monthView.prototype.render.apply(this);

            this.$title = this.$('.cal-title');
            this.$controls = this.$('.cal-controls');

            this.renderMonthName(this.$title, this.selfMonth);

            return this.el;
        },

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderMonthName: function (elem, data) {
            elem.text(app.cal.getMonthName(data) + " " + app.cal.getYear(data));
        },

        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        _gotoNextMonth: function (e) {
           if (e) { e.preventDefault(); }

           this._gotoMonth({
               'type': 'next',
               'month': this.selfMonth,
               'dest': 'summary'
           });
        },

        _gotoPrevMonth: function (e) {
           if (e) { e.preventDefault(); }

           this._gotoMonth({
               'type': 'previous',
               'month': this.selfMonth,
               'dest': 'summary'
           });
        }
    });
})(jQuery);