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

        collection: app.dateCollection,


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

            this.renderWeekDayLabels();

            this.setMonthData();

            this.setRowsInMonth();

            this.markPredefinedDates();

            this.renderDays();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$month = this.$('.month-days');
            this.$labels = this.$('.cal-labels');
        },

        renderWeekDayLabels: function () {
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
            this.$el.attr('data-cal-rows', app.cal.getRowsInMonth(this.selfMonth));
        },

        markPredefinedDates: function () {
            // upon render, if we have already got marked dates cached, re-render these now.
            // this handles date traversals in summary view
            if (this.markedDates) {
                this.markDateRangeAsActive(this.markedDates.from, this.markedDates.to);
            }
        },

        renderDays: function () {
            var self = this;
            // using documentFragment to minimise DOM contact
            var fragment = document.createDocumentFragment();

            // keep a cache of all sub-views created, so we can unbind them properly later
            this.dayViews = this.monthData.map(function (day) {
                var view = new self.customDayView({
                    model: day
                });
                fragment.appendChild(view.render());

                return view;
            });

            this.$month.empty();
            this.$month.append(fragment);
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
            var self = this;

            // load data
            var data = app.cal.getMonthGridData(this.selfMonth);

            data.map(function (d) {
                self.monthData.add(d);
            });
        },


        // event handler ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleChangeDate: function (date) {
            this.gotoMonth({ 'newDate': date });
        },

        handleMarkDateRange: function (dates) {
            this.markDateRangeAsActive(dates.from, dates.to);

            this.storeMarkedDates(dates);

            this.renderDays();
        },

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
            _.each(this.dayViews, function (day) {
                day.remove();
            });

            // unbind all listeners from memory
            this.undelegateEvents();
            this.stopListening();
            this.dayViews = null;
        }

    });
})(jQuery);