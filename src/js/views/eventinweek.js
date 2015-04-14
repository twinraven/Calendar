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
            var startDateTime = model.startDateTime;
            // if this event started yesterday, start the time
            var startHour = new Date(model.startDateTime).getHours();

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

            // split dates need careful handling, especially if they wrap around
            // the start/end of a week
            if (this.isolatedModel.isSplitDate) {
                // to render split dates, this view is run twice from the same forEach loop
                // in the parent view - with the second iteration passed with 'isEndOfSplitDate'
                if (this.params.isEndOfSplitDate) {
                    // if we are attempting to render the second half, but the event starts
                    // on the last day of the week, return --> don't render this block
                    if (this.isolatedModel.pos === App.Constants.DAYS_IN_WEEK - 1) {
                        return;
                    }

                    startHour = 0;
                    // set to start of day when event ends -- which we know can only be 1 day after
                    // the start, as any longer would qualify the event as a full-day event
                    startDateTime = App.Methods.newDate(model.endDateTime);

                    // if this event started in the current week, the second half needs to be
                    // moved along by 1 day, so increase the pos accordingly
                    if (this.isolatedModel.weekNum === this.context.weekNum) {
                        this.isolatedModel.pos++;
                    }

                } else {
                    // if we are in the first half of the split date, but this event started
                    // in the previous week (i.e. we only expect to render the second half),
                    // then return --> don't render this block
                    if (this.isolatedModel.weekNum !== this.context.weekNum) {
                        return;
                    }
                }
            }

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

            var eventDurationInHours = App.Methods.getHrsBetween(startDateTime, model.endDateTime);
            var gridHeight = App.Constants.WEEK_VIEW_GRID_HEIGHT * App.Constants.HRS_IN_DAY * 2;

            this.isolatedModel.eventHeight = (eventDurationInHours * 2) * App.Constants.WEEK_VIEW_GRID_HEIGHT - 1;
            this.isolatedModel.eventTop = (startHour * 2) * App.Constants.WEEK_VIEW_GRID_HEIGHT;

            // make sure we don't spill out the bottom of the grid, if this event
            // runs past midnight
            if (this.isolatedModel.eventHeight + this.isolatedModel.eventTop > gridHeight) {
                this.isolatedModel.eventHeight = gridHeight - this.isolatedModel.eventTop;
            }

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

            this.$el.html(this.template(this.isolatedModel));
        }
    });
})(jQuery);