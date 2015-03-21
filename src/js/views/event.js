/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.event = Backbone.View.extend({

        tagName: 'a',

        attributes: function () {
            var customData = this.model.get('custom');

            return {
                'class': 'event',
                'title': customData.title,
                'data-pos': customData.pos,
                'data-fullday': customData.isFullDay,
                'data-span': customData.span
            };
        },

        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {
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
        },

        renderElem: function () {
            this.$el.text(this.model.get('custom').title);
        },


        // Kill switch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Remove the item, destroy the model from *localStorage* and delete its view.
        close: function () {
            this.remove();
        }
    });
})(jQuery);