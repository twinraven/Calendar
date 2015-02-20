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

            var now = app.cal.getMonthAndYearFromDate(new Date());
            this.setActiveMonth(now.year, now.month);

            // bind to change events in model/collection
            //this.listenTo(this.activeMonth, 'change', this.render);

            // load data
<<<<<<< HEAD:src/js/views/view.js
            //app.grid.add();
=======
            var data = app.cal.createGridData(this.activeMonth.getFullYear(), this.activeMonth.getMonth());

            data.map(function(d) {
                app.grid.add(d);
            });

            //app.grid.fetch();
>>>>>>> 3a51cec879a21752a5729f32c34790a87b74b3cd:src/js/views/appView.js
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {
            this.addAll();
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

        gotoNextMonth: function () {
            this.setActiveMonth(app.cal.getNextMonth(this.activeMonth));
        },

        gotoPrevMonth: function () {
            this.setActiveMonth(app.cal.getPrevMonth(this.activeMonth));
        },

        setActiveMonth: function (year, month) {
            this.activeMonth = new Date(year, month, 1);
        }
    });
})(jQuery);