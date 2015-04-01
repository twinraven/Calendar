/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    App.Views.fullDayLink = Backbone.View.extend({

        template: Handlebars.compile($('#fullday-link-template').html()),

        events: {
            'click': 'handleFullDayLinkClick'
        },

        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {
            this.listenTo(this.model, 'destroy', this.close);
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderElem();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderElem: function () {
            var html = this.template(this.model.toJSON());
            this.setElement(html);
        },

        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleFullDayLinkClick: function (e) {
            e.preventDefault();

            var dateFrom = App.Methods.newDate(this.model.get('date'));
            var dateTo = App.Methods.getDateTomorrow(dateFrom);

            App.Events.trigger('add:event', {
                'from': dateFrom,
                'to': dateTo,
                'fullday': true
            });
        },


        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function () {
            this.undelegateEvents();
            this.stopListening();
            this.remove();
        }
    });
})(jQuery);