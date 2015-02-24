/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.appView = Backbone.View.extend({
        el: '#calapp',

        events: {
            'click .prev': 'gotoPrevMonth',
            'click .next': 'gotoNextMonth',

            'mousedown': 'handleMouseDown',
            'mouseup': 'handleMouseUp',
            'mouseover .day': 'handleMouseOver',
            'mouseout .day': 'handleMouseOut'
        },

        handleMouseDown: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                this.isDragging = true;
                this.setDragStartDate($el, $el.data('ref'));
            }
        },

        handleMouseUp: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                this.isDragging = false;

                this.actionDates();
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);

            if (this.isDragging) {
                this.setDragEndDate($el, $el.data('ref'));
            }
        },

        handleMouseOut: function () {
            //
        },

        initialize: function () {
            this.$grid = this.$('#grid');
            this.$title = this.$('.title');

            this.setCurrentMonth(new Date());

            // bind to change events in model/collection
            //this.listenTo(this.currentMonth, 'change', this.render);

            this.addMonthDataToCollection();

            this.markCurrentMonth();
            //this.markDaysFrom(new Date(2015,1,16), 7);
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {
            this.addAll();

            this.$title.text(app.cal.getMonthName(this.currentMonth) + " " + app.cal.getYear(this.currentMonth));
            this.$el.attr('data-cal-rows', app.cal.getRowsInMonth(this.currentMonth));

            return this;
        },

        actionDates: function () {
            // fire popup to handle date range - add event

            console.log('add cal entry: ' + new Date(this.dragDateStart).toDateString() + ' -> ' + new Date(this.dragDateEnd).toDateString());
        },

        addDay: function (day) {
            var view = new app.dayView({ model: day });

            this.$grid.append(view.render().el);
        },

        addAll: function () {
            this.$grid.html('');
            app.grid.each(this.addDay, this);
        },

        tagDateRange: function (dateFrom, dateTo, attr) {
            app.grid.each(function (day) {
                var date = new Date(day.get('date'));
                var prop = {};
                if (date >= dateFrom && date <= dateTo) {
                    prop[attr] = true;
                } else {
                    prop[attr] = false;
                }
                day.save(prop);
            });
        },

        tagCurrentDateRange: function (dateFrom, dateTo) {
            this.tagDateRange(dateFrom, dateTo, 'isCurrent');
        },

        tagHighlightDateRange: function (dateFrom, dateTo) {
            this.tagDateRange(dateFrom, dateTo, 'isHighlight');
        },

        markCurrentMonth: function () {
            var date = this.currentMonth;
            var monthStart = new Date(app.cal.getYear(date), app.cal.getMonthNum(date), 1);
            var monthEnd = new Date(app.cal.getYear(date), app.cal.getMonthNum(date) + 1, 0);

            this.tagCurrentDateRange(monthStart, monthEnd);
        },

        markDaysFrom: function (dateFrom, total) {
            var dateTo = new Date(app.cal.getYear(dateFrom), app.cal.getMonthNum(dateFrom), app.cal.getDate(dateFrom) + total);

            this.tagCurrentDateRange(dateFrom, dateTo);
        },

        gotoNextMonth: function (e) {
            e.preventDefault();

            this.gotoMonth('next');
        },

        gotoPrevMonth: function (e) {
            e.preventDefault();

            this.gotoMonth('prev');
        },

        gotoMonth: function(type) {
            var month;

            if (type === 'next') {
                month = app.cal.getNextMonth(this.currentMonth);

            } else if (type === 'prev') {
                month = app.cal.getPrevMonth(this.currentMonth);
            }

            this.setCurrentMonth(month);
            this.addMonthDataToCollection();
            this.markCurrentMonth();

            this.render();
        },

        setCurrentMonth: function (newDate) {
            this.currentMonth = new Date(newDate);
        },

        addMonthDataToCollection: function () {
            // load data
            var data = app.cal.getNewGridData(this.currentMonth);

            app.grid.reset();

            data.map(function (d) {
                app.grid.add(d);
            });
        },

        setDragStartDate: function ($el, date) {
            this.dragDateStart = new Date(date);
            this.setDragEndDate($el, date);
        },

        setDragEndDate: function ($el, date) {
            this.dragDateEnd = new Date(date);

            if (this.dragDateStart < this.dragDateEnd) {
                this.tagHighlightDateRange(this.dragDateStart, this.dragDateEnd);

            } else {
                // swap order if we're dragging backwards
                this.tagHighlightDateRange(this.dragDateEnd, this.dragDateStart);
            }

            this.render();
        }
    });
})(jQuery);