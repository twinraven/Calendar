/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------
    // extending app.monthView
    app.monthMainView = app.monthView.extend({
        //
        dayTemplate: _.template($('#day-main-template').html()),

        customDayView: app.dayView,

        events: {
            'mousedown': 'handleMouseDown',
            'mouseup': 'handleMouseUp',
            'mouseover .day': 'handleMouseOver'
        },


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {

            // call the initialize method of parent/super class (as we want to add more init methods)
            app.monthView.prototype.initialize.apply(this, [params]);

            this.listenTo(app.events, 'clear:selection', this.handleClearSelection);
        },


        // event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMouseDown: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                app.state.isDragging = true;
                this.setDragDateStart($el, $el.data('date'));
            }
        },

        handleMouseUp: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                var endDateCorrected = app.cal.getDateTomorrow(this.dragDateEnd);
                app.state.isDragging = false;

                app.events.trigger('add:event', {
                    'from': this.dragDateStart,
                    'to': endDateCorrected,
                    'fullday': true
                });

                app.state.hasSelection = true;
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);

            if (app.state.isDragging) {
                this.setDragDateEnd($el, $el.data('date'));
            }
        },

        handleClearSelection: function () {
            this.clearDrag();
        },


        // date selection & highlighting~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setDragDateStart: function ($el, date) {
            this.dragDateStart = app.cal.newDate(date);

            this.setDragDateEnd($el, date);
        },

        setDragDateEnd: function ($el, date) {
            this.dragDateEnd = app.cal.newDate(date);

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

            app.state.hasSelection = false;

            this.renderDates();
        }
    });
})(jQuery);