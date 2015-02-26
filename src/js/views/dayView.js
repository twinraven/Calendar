/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.dayView = Backbone.View.extend({
        tagName: 'li',
        className: 'day',
        attributes: function () {
            return {
                'aria-labelledby': 'date-' + this.model.get('id')
            };
        },

        template: _.template($('#day-template').html()),

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },

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

            var today = new Date().toDateString();

            // highlight today
            if (this.model.get('date') === today) {
                this.$el.addClass('is-today');
            }

            // highlight if this day is currently in our active range
            if (this.model.get('isCurrent') == true) {
                this.$el.addClass('is-range');
            } else {
                this.$el.addClass('is-not-range');
            }

            if (this.model.get('isHighlight') == true) {
                this.$el.addClass('is-highlight');
            }

            // add to the DOM
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },

        /*addEvent: function() {
            this.model.addEvent( {'id': this.model.id} );
        },*/

        // Remove the item, destroy the model from *localStorage* and delete its view.
        clear: function () {
            this.model.destroy();
        }
    });
})(jQuery);