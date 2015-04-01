/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------
    // extending App.Views.month
    App.Views.monthInFull = App.Views.month.extend({
        //
        dayTemplate: Handlebars.compile($('#day-full-template').html()),

        customDayView: App.Views.day,

        events: {
            'mousedown': 'handleMouseDown',
            'mouseup': 'handleMouseUp',
            'mouseover .day': 'handleMouseOver'
        },


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            // call the initialize method of parent/super class (as we want to add more init methods)
            App.Views.month.prototype.initialize.apply(this, [params]);

            this.listenTo(App.Events, 'clear:selection', this.handleClearSelection);
            this.listenTo(App.Events, 'mouse:up', this.handleMouseUp);
        },


        // render method overrides ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderDates: function () {
            var weekFragment;
            var monthFragment = document.createDocumentFragment();
            var x, y;

            for (x = 0, y = this.rowsInMonth; x < y; x++) {
                weekFragment = this.renderWeekFragment(x);
                monthFragment.appendChild(weekFragment);
            }

            this.$month.empty();
            this.$month.append(monthFragment);
        },

        renderWeekFragment: function (x) {
            var startPos = App.Constants.DAYS_IN_WEEK * x;
            var endPos = startPos + App.Constants.DAYS_IN_WEEK;
            var weekData = this.monthData.slice(startPos, endPos);
            var weekNum = App.Methods.getWeekNum(weekData[0].id);

            var weekFragment = document.createDocumentFragment();

            var monthRowView = new App.Views.row({
                collection: weekData,
                dayView: this.customDayView,
                weekStartDate: weekData[0].id,
                model: { weekNum: weekNum }
            });

            weekFragment.appendChild(monthRowView.render());

            return weekFragment;
        },


        // event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMouseDown: function (e) {
            var $el = $(e.target);

            if ($el.is('.day__inner')) {
                App.State.isDragging = true;
                this.setDragDateStart($el, $el.data('date'));
            }
        },

        handleMouseUp: function (e) {
            // this can be indirectly called from calendar.js via a custom event ('mouse:up')
            // so 'e' may not refer to anything
            var $el = e ? $(e.target) : null;

            if ($el && $el.is('.day__inner')) {
                this.setDragDateEnd($el, $el.data('date'));
            }

            App.State.isDragging = false;

            if (this.dragDateStart > this.dragDateEnd) {
                this.swapDragStartEndDates();
            }

            if (this.dragDateStart && this.dragDateEnd) {
                App.Events.trigger('add:event', {
                    'from': this.dragDateStart,
                    'to': App.Methods.getDateTomorrow(this.dragDateEnd),
                    'fullday': true
                });

                this.dragDateStart = null;
                this.dragDateEnd = null;

                App.State.hasSelection = true;
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);

            if (App.State.isDragging) {
                this.setDragDateEnd($el, $el.data('date'));
            }
        },

        handleClearSelection: function () {
            this.clearDrag();
        },


        // date modification ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        swapDragStartEndDates: function () {
            var start = this.dragDateStart;
            var end = this.dragDateEnd;

            this.dragDateStart = end;
            this.dragDateEnd = start;
        },


        // date selection & highlighting ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setDragDateStart: function ($el, date) {
            this.dragDateStart = App.Methods.newDate(date);

            this.setDragDateEnd($el, date);
        },

        setDragDateEnd: function ($el, date) {
            var dateStart = this.dragDateStart;
            var dateEnd = App.Methods.newDate(date);

            this.dragDateEnd = dateEnd;

            // if we're dragging backwards, highlight the dates reversed
            if (dateStart > dateEnd) {
                dateStart = App.Methods.getDateTomorrow(dateStart);

                this.markDateRangeAsHighlight(dateEnd, dateStart);

            } else {
                dateEnd = App.Methods.getDateTomorrow(dateEnd);

                this.markDateRangeAsHighlight(dateStart, dateEnd);
            }

            this.renderDates();
        },

        clearDrag: function () {
            this.markDateRangeAsHighlight(null, null);

            App.State.hasSelection = false;
            App.State.isDragging = false;

            this.renderDates();
        }
    });
})(jQuery);