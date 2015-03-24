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

            return {
                'class': 'event',
                'title': customData.title,
                'data-pos': this.calcStartPos(),
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
            this.renderElem();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderElem: function () {
            this.$el.text(this.model.get('summary'));
        },

        calcStartPos: function () {
            var customData = this.model.get('custom');
            var startPos = customData.pos;

            if (customData.weekNum === customData.parentWeekNum) {
                console.log('current');

            } else if (customData.weekNum < customData.parentWeekNum) {
                console.log('less');
                startPos = 0;
            }

            return startPos;
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