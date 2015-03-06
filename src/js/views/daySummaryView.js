/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.daySummaryView = Backbone.View.extend({
        tagName: 'li',
        className: 'day',
        attributes: function () {
            return {
                'aria-labelledby': 'date-summary-' + this.model.get('id')
            };
        },

        template: _.template($('#day-summary-template').html()),

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function () {
            var m = this.model;

            // Backbone LocalStorage is adding `id` attribute instantly after
            // creating a model.  This causes our TodoView to render twice. Once
            // after creating a model and once on `id` change.  We want to
            // filter out the second redundant render, which is caused by this
            // `ind` change.  It's known Backbone LocalStorage bug, therefore
            // we've to create a workaround.
            // https://github.com/tastejs/todomvc/issues/469
            if (m.changed.id !== undefined) {
                return;
            }

            var today = new Date().toDateString();

            // highlight today
            if (m.get('date') === today) {
                this.$el.addClass('is-today');
            }

            // highlight if this day is currently in our active range
            if (m.get('isCurrent') == true) {
                this.$el.addClass('is-range');
            } else {
                this.$el.addClass('is-not-range');
            }

            // add to the DOM
            this.$el.html(this.template(m.toJSON()));

            return this;
        },

        // Remove the item, destroy the model from *localStorage* and delete its view.
        clear: function () {
            this.model.destroy();
        }
    });
})(jQuery);