/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.eventInWeek = App.Views.event.extend({

        template: Handlebars.compile($('#event-week-template').html()),

        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderElem: function () {
            var model = this.isolatedModel;
            var eventDurationInHrs = App.Methods.getHrsBetween(model.startDateTime, model.endDateTime);

            var startHr = new Date(model.startDateTime).getHours();

            this.isolatedModel.eventHeight = (eventDurationInHrs * 2) * App.Constants.WEEK_VIEW_GRID_HEIGHT - 1;
            this.isolatedModel.eventTop = (startHr * 2) * App.Constants.WEEK_VIEW_GRID_HEIGHT;

            this.$el.html(this.template(this.isolatedModel));
        }
    });
})(jQuery);