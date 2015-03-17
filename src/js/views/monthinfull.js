/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------
    // extending app.Views.month
    app.Views.monthInFull = app.Views.month.extend({
        //
        dayTemplate: _.template($('#day-main-template').html()),

        customDayView: app.Views.day,

        events: {
            'mousedown': 'handleMouseDown',
            'mouseup': 'handleMouseUp',
            'mouseover .day': 'handleMouseOver'
        },


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {

            // call the initialize method of parent/super class (as we want to add more init methods)
            app.Views.month.prototype.initialize.apply(this, [params]);

            this.listenTo(app.Events, 'clear:selection', this.handleClearSelection);
        },


        // event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMouseDown: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                app.State.isDragging = true;
                this.setDragDateStart($el, $el.data('date'));
            }
        },

        handleMouseUp: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                var endDateCorrected = app.Methods.getDateTomorrow(this.dragDateEnd);
                app.State.isDragging = false;

                app.Events.trigger('add:event', {
                    'from': this.dragDateStart,
                    'to': endDateCorrected,
                    'fullday': true
                });

                app.State.hasSelection = true;
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);

            if (app.State.isDragging) {
                this.setDragDateEnd($el, $el.data('date'));
            }
        },

        handleClearSelection: function () {
            this.clearDrag();
        },


        // date selection & highlighting~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setDragDateStart: function ($el, date) {
            this.dragDateStart = app.Methods.newDate(date);

            this.setDragDateEnd($el, date);
        },

        setDragDateEnd: function ($el, date) {
            this.dragDateEnd = app.Methods.newDate(date);

            if (this.dragDateStart < this.dragDateEnd) {
                this.markDateRangeAsHighlight(this.dragDateStart, this.dragDateEnd);

            } else {
                // swap order if we're dragging backwards
                this.markDateRangeAsHighlight(this.dragDateEnd, this.dragDateStart);
            }

            this.renderDates();
        },

        clearDrag: function () {
            this.markDateRangeAsHighlight(null, null);

            app.State.hasSelection = false;

            this.renderDates();
        }
    });
})(jQuery);