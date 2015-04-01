/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    App.Views.moreEventsLink = Backbone.View.extend({

        template: Handlebars.compile($('#more-events-template').html()),

        events: {
            'click': 'handleMoreEventsLinkClick'
        },

        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            this.config = params.config;

            this.events = this.config.stackAry[this.config.col];

            this.listenTo(this.model, 'destroy', this.close);
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderElem();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderElem: function () {
            var html = this.template(this.config);
            this.setElement(html);
        },

        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMoreEventsLinkClick: function (e) {
            e.preventDefault();

            console.log(this.events);
        },


        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function () {
            this.undelegateEvents();
            this.stopListening();
            this.remove();
        }
    });
})(jQuery);