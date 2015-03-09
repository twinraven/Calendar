/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    app.weekView = Backbone.View.extend({

        // templating and setup
        template: _.template($('#week-template').html()), // for containing elem & markup
        titleTemplate: _.template($('#day-title-template').html()), // for mon/tue/wed labels
        dayTemplate: _.template($('#day-week-template').html()), // for each day of week

        collection: app.dateCollection,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {
            var self = this;

            // keep track of own date, irrespective of app-wide state
            this.selfWeek = app.cal.newDate();

            this.listenTo(app.events, 'change:date', function (date) { self.handleChangeWeek(self, date) });
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.$el.html(this.template({}));

            this.cacheSelectors();
            this.renderDayLabels();

            this.setWeekData();

            this.renderDays();

            return this.el;
        },

        cacheSelectors: function () {
            this.$week = this.$('.week');
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

        renderDays: function() {
            var fragment = document.createDocumentFragment();

            this.dayViews = this.weekData.map(function (day) {
                var view = new app.dayView({
                    model: day,
                    template: this.dayTemplate
                });
                fragment.appendChild(view.render());

                return view;
            }, this);

            this.$week.empty();
            this.$week.append(fragment);
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setWeekData: function () {
            if (this.weekData) { this.weekData.reset(); }

            this.weekData = new app.dateCollection();
            this.addWeekDataToCollection(this.selfWeek);
        },

        addWeekDataToCollection: function (week) {
            var self = this;

            // load data
            var data = app.cal.getWeekData(week);

            data.map(function (d) {
               self.weekData.add(d);
            });
        },


        // event handler ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleChangeWeek: function (self, date) {
            // normalise date so we're always dealing with the first day of the week
            var newDate = app.cal.getWeekStartDate(date);

            self.selfWeek = newDate;

            self.render();
        },


        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function() {
            _.each(this.dayViews, function(day) {
                day.remove();
            });

            this.undelegateEvents();
            this.stopListening();
            this.dayViews = null;
        }
    });
})(jQuery);