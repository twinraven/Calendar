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

            this.day = (params && params.model && params.model.id) || app.cal.newDate();
            this.day = new Date(this.day);

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

            this.addElem();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setState: function () {
            var m = this.model;
            var classes = [];
            this.today = app.cal.newDate().toDateString();

            // highlight today
            if (m.get('date') === this.today) {
                classes.push('is-today');
            }

            // highlight if this day is currently in our active range
            if (m.get('isActive') === true) {
                classes.push('is-range');

            } else {
                classes.push('is-not-range');
            }

            if (m.get('isHighlight') === true) {
                classes.push('is-highlight');
            }

            this.$el.addClass(classes.join(' '));
        },

        addElem: function () {
            this.$el.html(this.template(this.model.toJSON()));
        },


        // Kill switch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Remove the item, destroy the model from *localStorage* and delete its view.
        close: function () {
            // this.stopTimeLineTicker();
            this.remove();
        }
    });
})(jQuery);