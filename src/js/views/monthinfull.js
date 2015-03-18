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
                this.setDragDateEnd($el, $el.data('date'));

                App.State.isDragging = false;

                App.Events.trigger('add:event', {
                    'from': this.dragDateStart,
                    'to': this.dragDateEnd,
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
            var dateStart = this.dragDateStart;
            var dateEnd = App.Methods.newDate(date);

            // if we're dragging backwards, swap the dates
            if (dateStart > dateEnd) {
                this.dragDateStart = dateEnd;
                this.dragDateEnd = dateStart;

            } else {
                this.dragDateEnd = dateEnd;
            }

            //this.dragDateEnd = App.Methods.getDateTomorrow(this.dragDateEnd);

            this.markDateRangeAsHighlight(this.dragDateStart, this.dragDateEnd);

            this.renderDates();
        },

        clearDrag: function () {
            this.markDateRangeAsHighlight(null, null);

            App.State.hasSelection = false;

            this.renderDates();
        }
    });
})(jQuery);