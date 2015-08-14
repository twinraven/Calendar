/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.eventOverlay = Backbone.View.extend({

        template: Handlebars.compile($('#event-overlay-template').html()),

        /*events: {
            'click .event': 'handleEventClick'
        },*/

        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {
            if (this.model.isNew()) {
                // new model

            } else {
                // grab existing customEventData
                var customEventData = this.model.get('custom');

                console.log('VIEW/EDIT EVENT');
                console.log('title: ' + customEventData.summary);
                console.log('from: ' + customEventData.startDateTime);
                console.log('to: ' + customEventData.endDateTime);
                console.log('all day event: ' + (customEventData.isFullDay));
                console.log('~~~~~~~~~~~~~~~~');
            }

            //customEventData.isFullDayChecked = customEventData.isFullDay ? 'checked' : '';

            this.listenTo(this.model, 'destroy', this.close);
        },


        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function (params) {

            this.renderElem();

            return this.el;
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderElem: function () {

            var html = this.template(this.model.toJSON());
            this.setElement(html);
        },


        // handle Events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        /*handleEventClick: function (e) {
            var $el = $(e.target);
            var id = $el.data('id');

            App.Events.trigger('view:event', {
                'id': id
            });

        },*/


        // Kill switch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Remove the item, destroy the model from *localStorage* and delete its view.
        close: function () {
            this.remove();
        }
    });
})(jQuery);