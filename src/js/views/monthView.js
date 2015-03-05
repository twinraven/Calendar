/* global Backbone, jQuery, _, ENTER_KEY */
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

            app.events.bind('change:date', function (date) { self.handleChangeMonth(self, date) });
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.$el.html(this.template({}));

            this.cacheSelectors();
            this.renderDayLabels();

            // local (view) collection
            this.monthData = new app.dateCollection();
            this.addMonthDataToCollection(this.selfMonth);
            this.markMonth(this.selfMonth);
            this.setRowsInMonth();

            this.renderDays();

            return this.el;
        },

        renderDays: function() {
            var fragment = document.createDocumentFragment();

            this.monthData.each(function (day) {
                var view = new app.dayView({
                    model: day,
                    template: this.dayTemplate
                });
                fragment.appendChild(view.render());
            }, this);

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
            // normalise date so we're always dealing with the first day of the week
            var d = app.cal.getObjectFromDate(date);
            var newDate = app.cal.newDate(d.year, d.month, 1);

            self.gotoMonth({ 'newDate': newDate });
        },


        // Marking/highlighting dates ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        tagDateRange: function (dateFrom, dateTo, attr) {
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

        tagCurrentDateRange: function (dateFrom, dateTo) {
            this.tagDateRange(dateFrom, dateTo, 'isCurrent');
        },

        markMonth: function (date) {
            var monthStart = app.cal.newDate(app.cal.getYear(date), app.cal.getMonthNum(date), 1);
            var monthEnd = app.cal.newDate(app.cal.getYear(date), app.cal.getMonthNum(date) + 1, 0);

            this.tagCurrentDateRange(monthStart, monthEnd);
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

        addMonthDataToCollection: function (month) {
            var self = this;

            // load data
            var data = app.cal.getMonthGridData(month);

            this.monthData.reset();

            data.map(function (d) {
               self.monthData.add(d);
            });
        }
    });
})(jQuery);