/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.dayView = Backbone.View.extend({
        template: _.template($('#day-main-template').html()),

        tagName: 'li',
        className: 'day',

        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            this.options = params;

            this.day = (params && params.date) || app.cal.newDate();

            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.close);
        },

        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            // Backbone LocalStorage is adding `id` attribute instantly after
            // creating a model.  This causes our TodoView to render twice. Once
            // after creating a model and once on `id` change.  We want to
            // filter out the second redundant render, which is caused by this
            // `ind` change.  It's known Backbone LocalStorage bug, therefore
            // we've to create a workaround.
            // https://github.com/tastejs/todomvc/issues/469
            if (this.model.changed.id !== undefined) {
                return;
            }

            this.setState();

            // add to the DOM
            this.$el.html(this.template(this.model.toJSON()));

            this.cacheSelectors();

            this.setTimeData();

            this.renderTime();

            return this.el;
        },

        setState: function () {
            var m = this.model;
            this.today = app.cal.newDate().toDateString();

            // highlight today
            if (m.get('date') === this.today) {
                this.$el.addClass('is-today');
            }

            // highlight if this day is currently in our active range
            if (m.get('isActive') == true) {
                this.$el.addClass('is-range');
            } else {
                this.$el.addClass('is-not-range');
            }

            if (m.get('isHighlight') == true) {
                this.$el.addClass('is-highlight');
            }
        },

        cacheSelectors: function () {
            this.$newEvent = this.$('.new-event');
            this.$times = this.$('.half-hour');
            this.$day = this.$('.cal-events-grid');
        },

        renderTime: function () {
            var fragment = document.createDocumentFragment();

            this.timeViews = this.timeData.map(function (day) {
                var view = new app.timeView({
                    model: day
                });
                fragment.appendChild(view.render());

                return view;
            }, this);

            this.$day.empty();
            this.$day.append(fragment);
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setTimeData: function () {
            if (this.timeData) { this.timeData.reset(); }

            this.timeData = new app.timeCollection();
            this.addTimeDataToCollection();
        },

        addTimeDataToCollection: function (day) {
            var self = this;

            // load data
            var data = this.getTimeData();

            data.map(function (d) {
               self.timeData.add(d);
            });
        },

        getTimeData: function () {
            var x, y;
            var data = [];

            for (x = 0, y = app.const.HRS_IN_DAY; x < y; x++) {

            }

            return data;
        },


        // Kill switch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Remove the item, destroy the model from *localStorage* and delete its view.
        close: function () {
            // this.stopTimeLineTicker();
            this.remove();
        }
    });
})(jQuery);