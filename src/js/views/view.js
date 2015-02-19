/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.view = Backbone.View.extend({
        el: '#calapp',

        blockTemplate: _.template($('#block-template').html()),

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
            // app.collection.fetch({reset: true});
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {

            var data = app.cal.createGridData(this.activeMonth.getYear(), this.activeMonth.getMonth());
            var self = this;

            data.map(function(d) {
                self.$grid.append(self.blockTemplate(d));
            });

            return this;
        },

        /*addDay: function (todo) {
            var view = new app.TodoView({ model: todo });
            this.$list.append(view.render().el);
        },

        addAll: function () {
            this.$grid.html('');
            app.model.each(this.addDay, this);
        },*/

        gotoNextMonth: function () {
            debugger;
            this.setActiveMonth(app.cal.getNextMonth(this.activeMonth));
        },

        gotoPrevMonth: function () {
            this.setActiveMonth(app.cal.getPrevMonth(this.activeMonth));
        },

        setActiveMonth: function (year, month) {
            this.activeMonth = new Date(year, month);
        }
    });
})(jQuery);