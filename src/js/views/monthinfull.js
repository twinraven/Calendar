/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------
    // extending App.Views.month
    App.Views.monthInFull = App.Views.month.extend({
        //
        dayTemplate: _.template($('#day-main-template').html()),

        customDayView: App.Views.day,

        events: {
            'mousedown': 'handleMouseDown',
            'mouseup': 'handleMouseUp',
            'mouseover .day': 'handleMouseOver'
        },


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {

            // call the initialize method of parent/super class (as we want to add more init methods)
            App.Views.month.prototype.initialize.apply(this, [params]);

            this.listenTo(App.Events, 'clear:selection', this.handleClearSelection);
        },


        // event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMouseDown: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                App.State.isDragging = true;
                this.setDragDateStart($el, $el.data('date'));
            }
        },

        handleMouseUp: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                var endDateCorrected = App.Methods.getDateTomorrow(this.dragDateEnd);
                App.State.isDragging = false;

                App.Events.trigger('add:event', {
                    'from': this.dragDateStart,
                    'to': endDateCorrected,
                    'fullday': true
                });

                App.State.hasSelection = true;
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);

            if (App.State.isDragging) {
                this.setDragDateEnd($el, $el.data('date'));
            }
        },

        handleClearSelection: function () {
            this.clearDrag();
        },


        // date selection & highlighting~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setDragDateStart: function ($el, date) {
            this.dragDateStart = App.Methods.newDate(date);

            this.setDragDateEnd($el, date);
        },

        setDragDateEnd: function ($el, date) {
            this.dragDateEnd = App.Methods.newDate(date);

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

            App.State.hasSelection = false;

            this.renderDates();
        }
    });
})(jQuery);