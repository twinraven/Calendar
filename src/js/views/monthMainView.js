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
            var self = this;

            // call the initialize method of parent/super class (as we want to add more init methods)
            app.monthView.prototype.initialize.apply(this, [params]);

            this.listenTo(app.events, 'clear:selection', function () { self.clearDrag() });
        },


        // event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMouseDown: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
               app.isDragging = true;
               this.setDragDateStart($el, $el.data('date'));
            }
        },

        handleMouseUp: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                app.isDragging = false;

                app.events.trigger('add:event', {
                    'from': this.dragDateStart,
                    'to': this.dragDateEnd,
                    'fullday': true
                });
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);

            if (app.isDragging) {
               this.setDragDateEnd($el, $el.data('date'));
            }
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

            this.renderDays();
        },

        clearDrag: function () {
            this.markDateRangeAsHighlight(null, null);

            this.renderDays();
        }
    });
})(jQuery);