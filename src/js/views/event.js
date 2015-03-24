/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.event = Backbone.View.extend({

        tagName: 'a',

        events: {
            'click': 'handleEventClick'
        },

        attributes: function () {
            var customData = this.model.get('custom');

            this.setEventPosition();

            return {
                'class': 'event',
                'title': customData.title,
                'data-pos':customData.pos,
                'data-span': customData.span,
                'data-fullday': customData.isFullDay,
                'data-row': customData.row
            };
        },

        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {
            this.listenTo(this.model, 'destroy', this.close);
        },

        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderElem();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderElem: function () {
            this.$el.text(this.model.get('summary'));
        },

        setEventPosition: function () {
            var customData = this.model.get('custom');

            if (customData.weekNum < customData.parentWeekNum) {
                customData.pos = 0;

                if (customData.endDateTime < customData.parentWeekEndDate) {
                    customData.span = App.Methods.getDayOfWeekNum(customData.endDateTime);

                } else {
                    customData.span = App.Constants.DAYS_IN_WEEK;
                }
            }
        },


        // handle Events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleEventClick: function (e) {
            console.log(this.model.get('custom'));
        },


        // Kill switch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Remove the item, destroy the model from *localStorage* and delete its view.
        close: function () {
            this.remove();
        }
    });
})(jQuery);