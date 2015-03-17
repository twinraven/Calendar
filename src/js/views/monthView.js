/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    app.monthView = Backbone.View.extend({

        // templating and setup
        template: _.template($('#month-template').html()), // for containing elem & markup
        titleTemplate: _.template($('#day-title-template').html()), // for containing elem & markup

        // allows for sub-class overriding
        customDayView: app.dayView,

        //collection: app.dateCollection,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {

            // keep track of own date, irrespective of app-wide state - but init with external val
            this.selfMonth = (params && params.date) || app.cal.newDate();

            this.listenTo(app.events, 'change:date', this.handleChangeDate);
            this.listenTo(app.events, 'change:mark', this.handleMarkDateRange);
            //this.listenTo(app.events, 'clock:tick', this.handleClockTick); // broken?
            this.listenTo(app.events, 'api:data', this.handleApiData);
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

            _.each(app.cal.labels.week, function (day, i) {
                var data = {
                    'label': app.cal.labels.week[i],
                    'initial': app.cal.labels.week[i].slice(0, 1)
                };
                self.$labels.append(self.titleTemplate(data));
            });
        },

        // flagged for removal? depends if switching to table layout
        setRowsInMonth: function () {
            this.rowsInMonth = app.cal.getRowsInMonth(this.selfMonth);
            this.$el.attr('data-cal-rows', this.rowsInMonth);
        },

        markPredefinedDates: function () {
            // upon render, if we have already got marked dates cached, re-render these now.
            // this handles date traversals in summary view
            if (this.markedDates) {
                this.markDateRangeAsActive(this.markedDates.from, this.markedDates.to);
            }
        },

        /*renderDays: function () {
            // using documentFragment to minimise DOM contact
            var fragment = document.createDocumentFragment();

            // keep a cache of all sub-views created, so we can unbind them properly later
            this.dayViews = this.monthData.map(function (day) {
                var view = new this.customDayView({
                    model: day
                });
                fragment.appendChild(view.render());

                return view;
            }, this);

            this.$month.empty();
            this.$month.append(fragment);
        },*/

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
            var startPos = app.constants.DAYS_IN_WEEK * x;
            var endPos = startPos + app.constants.DAYS_IN_WEEK;
            var weekData = this.monthData.slice(startPos, endPos);

            var weekFragment = document.createDocumentFragment();

            var monthRowView = new app.monthRowView({
                collection: weekData,
                dayView: this.customDayView
            });

            weekFragment.appendChild(monthRowView.render());

            return weekFragment;
        },


        // Marking/highlighting dates ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        markDateRange: function (dateFrom, dateTo, attr) {
            this.monthData.each(function (day) {
                var date = app.cal.newDate(day.get('date'));
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
            var date = app.cal.newDate();

            if (params.type) {
                if (params.type === 'next') {
                    date = app.cal.getNextMonth(params.month);

                } else if (params.type === 'previous') {
                    date = app.cal.getPrevMonth(params.month);
                }
            }

            if (params.newDate) { date = params.newDate; }

            this.selfMonth = date;

            this.render();
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setMonthData: function () {
            if (this.monthData) { this.monthData.reset(); }

            this.monthData = new app.dateCollection();
            this.addMonthDataToCollection();
        },

        addMonthDataToCollection: function () {
            // load data
            var data = app.cal.getMonthGridData(this.selfMonth);

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
            if (!app.state.isDragging && !app.state.hasSelection) {
                var now = app.cal.newDate();

                if (app.state.today.getTime() !== now.getTime()) {
                    this.selfMonth = now;
                    app.events.trigger('change:date', now);
                    app.state.today = now;
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