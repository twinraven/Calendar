/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.eventsList = Backbone.View.extend({

        template: Handlebars.compile($('#event-list-template').html()),

        collection: App.Collections.dates,

        events: {
            'click .event': 'handleEventClick'
        },

        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            this.eventsData = params.eventModels.map(function (event) {
                return event.get('custom');
            });

            this.listenTo(this.model, 'destroy', this.close);
        },


        // Init methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~




        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderElem();

            return this.el;
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderElem: function () {
            var date = App.Methods.newDate(this.model.get('id'));
            var dateFormatted = App.Labels.week[date.getDay()] + ' ' + date.getDate() + ' ' + App.Labels.month[date.getMonth()] + ' ' + date.getFullYear();

            var data = {
                'date': dateFormatted,
                'events': this.eventsData
            };

            var html = this.template(data);
            this.setElement($(html));
        },


        // handle Events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleEventClick: function (e) {
            var $el = $(e.target);
            var id = $el.data('id');

            App.Events.trigger('view:event', {
                'id': id
            });

        },


        // Kill switch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Remove the item, destroy the model from *localStorage* and delete its view.
        close: function () {
            this.remove();
        }
    });
})(jQuery);