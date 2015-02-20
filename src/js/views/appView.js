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
            
            if (day.get('month') == app.cal.getMonthNum(this.activeMonth)) {
                day.set('isCurrentMonth', true);
            } else {
                day.set('isCurrentMonth', false);
            }
            
            this.$grid.append(view.render().el);
        },

        addAll: function () {
            this.$grid.html('');
            app.grid.each(this.addDay, this);
        },

        gotoNextMonth: function (e) {
            e.preventDefault();

            this.setActiveMonth(app.cal.getNextMonth(this.activeMonth));
            this.addMonthDataToCollection();

            this.render();
        },

        gotoPrevMonth: function (e) {
            e.preventDefault();

            this.setActiveMonth(app.cal.getPrevMonth(this.activeMonth));
            this.addMonthDataToCollection();

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