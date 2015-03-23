/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.eventInWeek = App.Views.event.extend({
        tagName: 'li',

        className: 'event event--week',

        attributes: function () {
            var customData = this.model.get('custom');

            return {
                'class': 'event',
                'title': customData.title,
                'data-pos': customData.pos
            };
        },

        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderElem: function () {
            var data = this.model.get('custom');
            var eventDurationInHrs = App.Methods.getHrsBetween(data.startDateTime, data.endDateTime);

            var startHr = new Date(data.startDateTime).getHours();

            this.$el.text(this.model.get('summary'));

            this.$el.css({
                'height': (eventDurationInHrs * 2) * App.Constants.WEEK_VIEW_GRID_HEIGHT - 1,
                'top': (startHr * 2) * App.Constants.WEEK_VIEW_GRID_HEIGHT
            });
        }
    });
})(jQuery);