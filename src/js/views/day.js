/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.day = Backbone.View.extend({
        template: _.template($('#day-full-template').html()),

        tagName: 'li',
        className: 'day',

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

            this.addElem();

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

            } else {
                classes.push('is-inactive');
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
            this.remove();
        }
    });
})(jQuery);