/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.day = Backbone.View.extend({
        template: Handlebars.compile($('#day-full-template').html()),

        tagName: 'li',
        className: 'day',

        events: {
            'click .day__inner': 'handleDayClick'
        },

        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            this.options = params;

            this.day = (params && params.model && params.model.id) || App.Methods.newDate();
            this.day = new Date(this.day);

            this.listenTo(this.model, 'destroy', this.close);
        },

        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.setState();

            this.renderElem();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setState: function () {
            var m = this.model;
            var classes = [];
            this.today = App.Methods.newDate().toDateString();

            // highlight today
            if (m.get('date') === this.today) {
                classes.push('is-today');
            }

            // highlight if this day is currently in our active range
            if (m.get('isActive') === true) {
                classes.push('is-active');

            }

            if (m.get('isHighlight') === true) {
                classes.push('is-highlight');
            }

            this.$el.addClass(classes.join(' '));
        },

        renderElem: function () {
            this.$el.html(this.template(this.model.toJSON()));
        },


        handleDayClick: function (e) {
            var date = App.Events.trigger('goto:date', this.day);
        },

        // Kill switch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Remove the item, destroy the model from *localStorage* and delete its view.
        close: function () {
            this.remove();
        }
    });
})(jQuery);