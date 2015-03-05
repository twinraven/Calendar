/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------
    // extending app.monthView
    app.monthMainView = app.monthView.extend({
        //
        dayTemplate: _.template($('#day-main-template').html()),

        events: {
            'mousedown': 'handleMouseDown',
            'mouseup': 'handleMouseUp',
            'mouseover .day': 'handleMouseOver'
        },


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {
            var self = this;

            // call the initialize method of parent class (as we want to add more init methods here)
            app.monthView.prototype.initialize.apply(this);

            app.events.bind('clear:selection', function () { self.clearDrag() });
        },


        // event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMouseDown: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
               this.isDragging = true;
               this.setDragStartDate($el, $el.data('ref'));
            }
        },

        handleMouseUp: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
            this.isDragging = false;

            app.events.trigger('add:event', {
                    'from': this.dragDateStart,
                    'to': this.dragDateEnd,
                    'fullday': true
                });
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);

            if (this.isDragging) {
               this.setDragEndDate($el, $el.data('ref'));
            }
        },


        // date selection & highlighting~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setDragStartDate: function ($el, date) {
            this.dragDateStart = app.cal.newDate(date);

            this.setDragEndDate($el, date);
        },

        setDragEndDate: function ($el, date) {
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