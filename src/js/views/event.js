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
            var position = this.getEventPosition();

            return {
                'class': 'event',
                'title': customData.title,
                'data-pos':position.pos,
                'data-span': position.span,
                'data-fullday': customData.isFullDay
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

        getEventPosition: function () {
            var customData = this.model.get('custom');
            var output = {
                pos: customData.pos,
                span: customData.span
            };

            if (customData.weekNum < customData.parentWeekNum) {
                output.pos = 0;

                if (customData.endDateTime < customData.parentWeekEndDate) {
                    output.span = App.Methods.getDayOfWeekNum(customData.endDateTime);
                } else {
                    output.span = App.Constants.DAYS_IN_WEEK;
                }
            }

            return output;
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