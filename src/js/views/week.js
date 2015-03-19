/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    App.Views.week = Backbone.View.extend({

        // templating and setup
        template: _.template($('#week-template').html()), // for containing elem & markup
        titleTemplate: _.template($('#day-week-title-template').html()), // for mon/tue/wed labels
        timeLabelTemplate: _.template($('#time-label-template').html()),

        collection: App.Collections.dates,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {

            // keep track of own date, irrespective of App-wide state
            this.selfWeek = (params && params.date) || App.Methods.newDate();

            this.listenTo(App.Events, 'change:date', this.handleChangeDate);
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.$el.html(this.template({}));

            this.cacheSelectors();

            this.renderDayLabels();

            this.renderTimeLabels();

            this.setWeekData();

            this.renderDates();

            this.scrollTimeIntoView();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$week = this.$('.week-days');
            this.$labels = this.$('.cal__labels');
            this.$grid = this.$('.cal__grid');
            this.$timeLabels = this.$('.day-time-labels');
        },

        renderDayLabels: function () {
            var self = this;
            var d = App.Methods.getObjectFromDate(self.selfWeek);

            _.each(App.Labels.week, function (day, i) {
                var newDate = App.Methods.newDate(d.year, d.month, d.day + i);
                var newDateObj = App.Methods.getObjectFromDate(newDate);

                var data = {
                    'date': newDateObj.day + '/' + newDateObj.month,
                    'label': App.Labels.week[i].slice(0, 3),
                    'initial': App.Labels.week[i].slice(0, 1)
                };

                self.$labels.append(self.titleTemplate(data));
            });
        },

        renderTimeLabels: function () {
            var x = 0;
            var data = {};

            while (x < App.Constants.HRS_IN_DAY) {
                data = { 'hour': App.Methods.getHourAs12HourFormat(x) };

                this.$timeLabels.append(this.timeLabelTemplate(data));

                x++;
            }
        },

        setWeekData: function () {
            if (this.weekData) { this.weekData.reset(); }

            this.weekData = new App.Collections.dates();
            this.addWeekDataToCollection();
        },

        renderDates: function () {
            var fragment = document.createDocumentFragment();

            this.dayViews = this.weekData.map(function (day) {
                var view = new App.Views.dayInWeek({
                    model: day
                });

                fragment.appendChild(view.render());

                return view;
            }, this);

            this.$week.empty();
            this.$week.append(fragment);
        },

        scrollTimeIntoView: function () {
            var now = new Date();

            if (now.getHours() >= 12 && App.Methods.isCurrentWeek(this.selfWeek)) {
                this.$grid.scrollTop(500);
            }
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        addWeekDataToCollection: function () {
            // load data
            var data = App.Methods.getWeekData(this.selfWeek);

            data.map(function (d) {
                this.weekData.add(d);
            }, this);
        },


        // event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleChangeDate: function (date) {
            // normalise date so we're always dealing with the first day of the week
            var newDate = App.Methods.getWeekStartDate(date);

            this.selfWeek = newDate;

            this.render();
        },


        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function () {
            _.each(this.dayViews, function (day) {
                day.remove();
            });

            this.undelegateEvents();
            this.stopListening();
            this.dayViews = null;
        }
    });
})(jQuery);