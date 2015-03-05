/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.monthView = Backbone.View.extend({
        template: _.template($('#month-template').html()),
        titleTemplate: _.template($('#day-title-template').html()),
        dayTemplate: _.template($('#day-main-template').html()),

        collection: app.monthCollection,

        initialize: function (attrs) {
            var self = this;

            this.selfMonth = app.cal.newDate();

            app.events.bind('change:month', function (date) { self.handleChangeMonth(self, date); });
            app.events.bind('clear:selection', this.clearDrag);
        },

        render: function () {
            this.$el.html(this.template({}));

            this.cacheSelectors();
            this.renderDayLabels();

            // local (view) collection
            this.monthData = new app.monthCollection();
            this.addMonthDataToCollection(this.selfMonth);
            this.markMonth(this.selfMonth);
            this.setRowsInMonth();

            this.renderDays();

            return this.el;
        },

        renderDays: function() {
            var fragment = document.createDocumentFragment();

            this.monthData.each(function eachMonthData(day) {
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

            _.each(app.labels.week, function eachLabelWeek(day, i) {
                var data = {
                    'label': app.labels.week[i],
                    'initial': app.labels.week[i].slice(0, 1)
                };
                self.$labels.append(self.titleTemplate(data));
            });
        },

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$month = this.$('.month');
            this.$labels = this.$('.cal-labels');
        },

        // flagged for removal? depends if switching to table layout
        setRowsInMonth: function () {
            this.$el.attr('data-cal-rows', app.cal.getRowsInMonth(this.selfMonth));
        },

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleChangeMonth: function (self, date) {
            self._gotoMonth({ 'newDate': date });
        },


        // Marking/highlighting dates ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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

        markDaysFrom: function (dateFrom, total) {
            var dateTo = app.cal.newDate(app.cal.getYear(dateFrom), app.cal.getMonthNum(dateFrom), app.cal.getDate(dateFrom) + total);

            this.tagCurrentDateRange(dateFrom, dateTo);
        },

        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        _gotoMonth: function (params) {
           var date;

           if (params.type) {
               if (params.type === 'next') {
                   date = app.cal.getNextMonth(params.month);

               } else if (params.type === 'previous') {
                   date = app.cal.getPrevMonth(params.month);
               }
           }

           if (params.newDate) { date = params.newDate; }

           this._setMonth(date);

           this.render();
        },

        _setMonth: function (newDate) {
           this.selfMonth = newDate;
        },

        addMonthDataToCollection: function (month) {
            var self = this;

            // load data
            var data = app.cal.getNewGridData(month);

            this.monthData.reset();

            data.map(function (d) {
               self.monthData.add(d);
            });
        }
    });
})(jQuery);