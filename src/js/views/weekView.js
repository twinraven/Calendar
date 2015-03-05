/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    app.weekView = Backbone.View.extend({

        // templating and setup
        template: _.template($('#week-template').html()),
        titleTemplate: _.template($('#day-title-template').html()),
        dayTemplate: _.template($('#day-week-template').html()),

        collection: app.dateCollection,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {
            var self = this;

            this.selfWeek = app.cal.newDate();

            app.events.bind('change:date', function (date) { self.handleChangeWeek(self, date) });
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.$el.html(this.template({}));

            this.cacheSelectors();
            this.renderDayLabels();

            // local (view) collection
            this.weekData = new app.dateCollection();
            this.addWeekDataToCollection(this.selfWeek);

            this.renderDays();

            return this.el;
        },

        renderDays: function() {
            var fragment = document.createDocumentFragment();

            this.weekData.each(function (day) {
                var view = new app.dayView({
                    model: day,
                    template: this.dayTemplate
                });
                fragment.appendChild(view.render());
            }, this);

            this.$week.empty();
            this.$week.append(fragment);
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
            this.$week = this.$('.week');
            this.$labels = this.$('.cal-labels');
        },


        // event handler ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleChangeWeek: function (self, date) {
            self.gotoWeek({ 'newDate': date });
        },


        // Marking/highlighting dates ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


        /*markWeek: function (date) {
            var weekStart = app.cal.getWeekStartDate(this.selfWeek);
            var weekEnd = app.cal.getWeekEndDate(this.selfWeek);

            this.tagCurrentDateRange(weekStart, weekEnd);
        },*/


        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        gotoWeek: function (params) {
           var date;

           if (params.newDate) { date = params.newDate; }

           this.setWeek(date);

           this.render();
        },

        setWeek: function (newDate) {
           this.selfWeek = newDate;
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        addWeekDataToCollection: function (week) {
            var self = this;

            // load data
            var data = app.cal.getWeekData(week);

            this.weekData.reset();

            data.map(function (d) {
               self.weekData.add(d);
            });
        }
    });
})(jQuery);