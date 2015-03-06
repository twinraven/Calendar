/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    app.monthView = Backbone.View.extend({

        // templating and setup
        template: _.template($('#month-template').html()),
        titleTemplate: _.template($('#day-title-template').html()),
        dayTemplate: _.template($('#day-main-template').html()),

        collection: app.dateCollection,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {
            var self = this;

            this.selfMonth = app.cal.newDate();

            this.listenTo(app.events, 'change:date', function (date) { self.handleChangeMonth(self, date) });
            this.listenTo(app.events, 'change:mark', function (dates) { self.handleMarkDateRange(self, dates) });
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.$el.html(this.template({}));

            this.cacheSelectors();
            this.renderDayLabels();

            this.setMonthData();

            this.setRowsInMonth();

            if (this.markedDates) {
                this.markDateRangeAsCurrent(this.markedDates.from, this.markedDates.to);
            }

            this.renderDays();

            return this.el;
        },

        renderDays: function() {
            var self = this;
            var fragment = document.createDocumentFragment();

            this.dayViews = this.monthData.map(function (day) {
                var view = new app.dayView({
                    model: day,
                    template: self.dayTemplate
                });
                fragment.appendChild(view.render());

                return view;
            });

            this.$month.empty();
            this.$month.append(fragment);
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

        cacheSelectors: function () {
            this.$month = this.$('.month');
            this.$labels = this.$('.cal-labels');
        },

        // flagged for removal? depends if switching to table layout
        setRowsInMonth: function () {
            this.$el.attr('data-cal-rows', app.cal.getRowsInMonth(this.selfMonth));
        },


        // event handler ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleChangeMonth: function (self, date) {
            self.gotoMonth({ 'newDate': date });
        },

        handleMarkDateRange: function (self, dates) {
            self.markDateRangeAsCurrent(dates.from, dates.to);

            this.setStoredMarkedDates(dates);

            this.renderDays();
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

        markDateRangeAsCurrent: function (dateFrom, dateTo) {
            this.markDateRange(dateFrom, dateTo, 'isCurrent');
        },

        markMonthAsCurrent: function (date) {
            var d = app.cal.getObjectFromDate(date);

            var monthStart = app.cal.newDate(d.year, d.month, 1);
            var monthEnd = app.cal.newDate(d.year, (d.month + 1), 0);

            this.markDateRangeAsCurrent(monthStart, monthEnd);
        },

        markWeekAsCurrent: function (date) {
            var weekStart = app.cal.getWeekStartDate(date);
            var weekEnd = app.cal.getWeekEndDate(date);

            this.markDateRangeAsCurrent(weekStart, weekEnd);
        },

        setStoredMarkedDates: function (dates) {
            this.markedDates = dates;
        },

        getStoredMarkedDates: function () {
            return this.markedDates;
        },


        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        gotoMonth: function (params) {
           var date;

           if (params.type) {
               if (params.type === 'next') {
                   date = app.cal.getNextMonth(params.month);

               } else if (params.type === 'previous') {
                   date = app.cal.getPrevMonth(params.month);
               }
           }

           if (params.newDate) { date = params.newDate; }

           this.setMonth(date);

           this.render();
        },

        setMonth: function (newDate) {
           this.selfMonth = newDate;
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setMonthData: function () {
            this.monthData = new app.dateCollection();
            this.addMonthDataToCollection(this.selfMonth);
        },

        addMonthDataToCollection: function (month) {
            var self = this;

            // load data
            var data = app.cal.getMonthGridData(month);

            this.monthData.reset();

            data.map(function (d) {
               self.monthData.add(d);
            });
        },

        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function() {
            debugger;
            _.each(this.dayViews, function(day) {
                day.close();
            });

            this.remove();
        }

    });
})(jQuery);