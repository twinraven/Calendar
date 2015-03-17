/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    App.Views.month = Backbone.View.extend({

        // templating and setup
        template: _.template($('#month-template').html()), // for containing elem & markup
        titleTemplate: _.template($('#day-title-template').html()), // for containing elem & markup

        // allows for sub-class overriding
        customDayView: App.Views.day,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {

            // keep track of own date, irrespective of App-wide state - but init with external val
            this.selfMonth = (params && params.date) || App.Methods.newDate();

            this.listenTo(App.Events, 'change:date', this.handleChangeDate);
            this.listenTo(App.Events, 'change:mark', this.handleMarkDateRange);
            this.listenTo(App.Events, 'clock:tick', this.handleClockTick);
            this.listenTo(App.Events, 'api:data', this.handleApiData);
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            // needed?
            this.$el.html(this.template({}));

            this.cacheSelectors();

            this.renderDayLabels();

            this.setMonthData();

            this.setRowsInMonth();

            this.markPredefinedDates();

            this.renderDates();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$month = this.$('.month-days');
            this.$labels = this.$('.cal-labels');
        },

        renderDayLabels: function () {
            var self = this;

            _.each(App.Labels.week, function (day, i) {
                var data = {
                    'label': App.Labels.week[i],
                    'initial': App.Labels.week[i].slice(0, 1)
                };
                self.$labels.append(self.titleTemplate(data));
            });
        },

        // flagged for removal? depends if switching to table layout
        setRowsInMonth: function () {
            this.rowsInMonth = App.Methods.getRowsInMonth(this.selfMonth);
            this.$el.attr('data-cal-rows', this.rowsInMonth);
        },

        markPredefinedDates: function () {
            // upon render, if we have already got marked dates cached, re-render these now.
            // this handles date traversals in summary view
            if (this.markedDates) {
                this.markDateRangeAsActive(this.markedDates.from, this.markedDates.to);
            }
        },

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

            var weekFragment = document.createDocumentFragment();

            var monthRowView = new App.Views.row({
                collection: weekData,
                dayView: this.customDayView
            });

            weekFragment.appendChild(monthRowView.render());

            return weekFragment;
        },


        // Marking/highlighting dates ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        markDateRange: function (dateFrom, dateTo, attr) {
            this.monthData.each(function (day) {
                var date = App.Methods.newDate(day.get('date'));
                var prop = {};
                if (date >= dateFrom && date <= dateTo) {
                    prop[attr] = true;
                } else {
                    prop[attr] = false;
                }
                day.save(prop);
            });
        },

        markDateRangeAsHighlight: function (dateFrom, dateTo) {
            this.markDateRange(dateFrom, dateTo, 'isHighlight');
        },

        markDateRangeAsActive: function (dateFrom, dateTo) {
            this.markDateRange(dateFrom, dateTo, 'isActive');
        },

        storeMarkedDates: function (dates) {
            this.markedDates = dates;
        },


        // date traversal ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // used to a fuller extend by child prototypes - monthSummaryView / monthMainView
        gotoMonth: function (params) {
            var date = App.Methods.newDate();

            if (params.type) {
                if (params.type === 'next') {
                    date = App.Methods.getNextMonth(params.month);

                } else if (params.type === 'previous') {
                    date = App.Methods.getPrevMonth(params.month);
                }
            }

            if (params.newDate) { date = params.newDate; }

            this.selfMonth = date;

            this.render();
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setMonthData: function () {
            if (this.monthData) { this.monthData.reset(); }

            this.monthData = new App.Collections.dates();
            this.addMonthDataToCollection();
        },

        addMonthDataToCollection: function () {
            // load data
            var data = App.Methods.getMonthGridData(this.selfMonth);

            data.map(function (d) {
                this.monthData.add(d);
            }, this);
        },


        // event handler ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleChangeDate: function (date) {
            this.gotoMonth({ 'newDate': date });
        },

        handleMarkDateRange: function (dates) {
            this.markDateRangeAsActive(dates.from, dates.to);

            this.storeMarkedDates(dates);

            this.renderDates();
        },

        // broken?
        handleClockTick: function () {
            if (!App.State.isDragging && !App.State.hasSelection) {
                var now = App.Methods.newDate();

                if (App.State.today.getTime() !== now.getTime()) {
                    this.selfMonth = now;
                    App.Events.trigger('change:date', now);
                    App.State.today = now;
                }
            }
        },

        handleApiData: function (data) {
            this.monthData.map(function (month) {
                //
            });
        },


        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function () {
            // remove all child/sub views completely
            _.each(this.weekViews, function (week) {
                week.remove();
            });

            // unbind all listeners from memory
            this.undelegateEvents();
            this.stopListening();
            this.dayViews = null;
        }

    });
})(jQuery);