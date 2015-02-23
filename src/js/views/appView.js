/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.appView = Backbone.View.extend({
        el: '#calapp',

        events: {
            'click .prev': 'gotoPrevMonth',
            'click .next': 'gotoNextMonth'
        },

        initialize: function () {
            this.$grid = this.$('#grid');
            this.$title = this.$('.title');

            this.setActiveMonth(new Date());

            // bind to change events in model/collection
            //this.listenTo(this.activeMonth, 'change', this.render);

            this.addMonthDataToCollection();

            this.highlightActiveMonth();
            //this.highlightDaysFrom(new Date(2015,1,16), 7);
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {
            this.addAll();
            this.$title.text(app.cal.getMonthName(this.activeMonth) + " " + app.cal.getYear(this.activeMonth));

            this.$el.attr('data-cal-rows', app.cal.getRowsInMonth(this.activeMonth));
            return this;
        },

        addDay: function (day) {
            var view = new app.dayView({ model: day });
            
            this.$grid.append(view.render().el);
        },

        addAll: function () {
            this.$grid.html('');
            app.grid.each(this.addDay, this);
        },

        highlightDateRange: function(dateFrom, dateTo) {
            app.grid.each(function(day) {
                var date = new Date(day.get('date'));
                if (date >= dateFrom && date < dateTo) {
                    day.save({ 'isInRange' : true });
                } else {
                    day.save({ 'isInRange' : false });
                }
            });
        },

        highlightActiveMonth: function() {
            var date = this.activeMonth;
            var monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            var monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);

            this.highlightDateRange(monthStart, monthEnd);
        },

        highlightDaysFrom: function (dateFrom, total) {
            var dateTo = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate() + total);
            this.highlightDateRange(dateFrom, dateTo);
        },

        gotoNextMonth: function (e) {
            e.preventDefault();

            this.setActiveMonth(app.cal.getNextMonth(this.activeMonth));
            this.addMonthDataToCollection();

            this.highlightActiveMonth();

            this.render();
        },

        gotoPrevMonth: function (e) {
            e.preventDefault();

            this.setActiveMonth(app.cal.getPrevMonth(this.activeMonth));
            this.addMonthDataToCollection();

            this.highlightActiveMonth();

            this.render();
        },

        setActiveMonth: function (newDate) {
            this.activeMonth = new Date(newDate);
        },

        addMonthDataToCollection: function () {
            // load data
            var data = app.cal.getNewGridData(this.activeMonth);

            app.grid.reset();

            data.map(function(d) {
                app.grid.add(d);
            });

            //app.grid.fetch();
        }
    });
})(jQuery);