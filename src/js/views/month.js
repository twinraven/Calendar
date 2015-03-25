/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    App.Views.month = Backbone.View.extend({

        // templating and setup
        template: Handlebars.compile($('#month-template').html()), // for containing elem & markup
        titleTemplate: Handlebars.compile($('#day-title-template').html()), // for containing elem & markup

        // allows for sub-class overriding
        customDayView: App.Views.day,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            // keep track of own date, irrespective of App-wide state - but init with external val
            this.selfMonth = (params && params.date) || App.Methods.newDate();

            this.setMonthData();

            this.listenTo(App.Events, 'change:date', this.handleChangeDate);
            this.listenTo(App.Events, 'change:mark', this.handleMarkDateRange);
            this.listenTo(App.Events, 'clock:tick', this.handleClockTick);
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            // needed?
            this.$el.html(this.template({}));

            this.cacheSelectors();

            this.renderMonthName();

            this.renderDayLabels();

            this.setMonthData();

            this.setRowsInMonth();

            this.markPredefinedDates();

            this.renderDates();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$title = this.$('.cal__title');
            this.$month = this.$('.month');
            this.$labels = this.$('.cal__labels');
        },

        renderMonthName: function () {
            var d = this.selfMonth;

            this.$title.text(App.Methods.getMonthName(d) + ' ' + App.Methods.getYear(d));
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
        },


        // Marking/highlighting dates ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        markDateRange: function (dateFrom, dateTo, attr) {
            this.monthData.each(function (day) {
                var date = App.Methods.newDate(day.get('date'));
                var prop = {};

                if (date >= dateFrom && date < dateTo) {
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

        handleMarkDateRange: function (data) {
            this.markDateRangeAsActive(data.from, data.to);

            this.storeMarkedDates(data);

            // only re-render the calendar if we've got an element to put the elements in --
            // i.e. we've already run render. We've split the date marking out from the date
            // rendering, to reduce the number of times the DOM is redrawn, so this data is
            // populated & modified before it's first rendered
            if (this.$month) { this.renderDates();}
        },

        // broken?
        handleClockTick: function () {
            if (!App.State.isDragging && !App.State.hasSelection) {
                var now = App.Methods.newDate();

                if (App.State.today.getTime() !== now.getTime()) {
                    this.selfMonth = App.State.today = now;

                    App.Events.trigger('change:date', now);
                }
            }
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