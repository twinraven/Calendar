/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.dayWeekView = app.dayView.extend({
        template: _.template($('#day-week-template').html()),

        events: {
            'mousedown': 'handleMouseDown',
            'mouseover .half-hour': 'handleMouseOver',
            'mouseup': 'handleMouseUp'
        },

        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            var self = this;

            app.dayView.prototype.initialize.apply(this, [params]);

            this.listenTo(app.events, 'clear:selection', function () { self.clearDrag() });
        },

        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            app.dayView.prototype.render.apply(this);

            this.setTimeLinePosition();
            // this.startTimeLineTicker();
            // this.focusCurrentTime();

            return this.el;
        },

        setState: function () {
            var m = this.model;
            this.today = app.cal.newDate().toDateString();

            // highlight today
            if (m.get('date') === this.today) {
                this.$el.addClass('is-today');
            }

            // highlight if this day is currently in our active range
            if (m.get('isActive') == true) {
                this.$el.addClass('is-range');
            } else {
                this.$el.addClass('is-not-range');
            }

            if (m.get('isHighlight') == true) {
                this.$el.addClass('is-highlight');
            }
        },

        cacheSelectors: function () {
            this.$newEvent = this.$('.new-event');
            this.$times = this.$('.half-hour');
        },

        setTimeLinePosition: function () {
            if (this.model.get('date') === this.today) {

                var $time = this.$('.now');
                var today = new Date(); // not app.cal.newDate as that creates a new data at 00:00am
                var d = app.cal.getObjectFromDate(today);
                var dayStart = app.cal.newDate(d.year, d.month, d.day);
                var msSinceDayStart = today.getTime() - dayStart.getTime();
                var percentComplete = (msSinceDayStart / app.const.MS_IN_DAY) * 100;

                if ($time.length) {
                    $time.removeClass('is-hidden').css('top', percentComplete + '%');
                }
            }
        },


        // Handle events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMouseDown: function (e) {
            var $el = $(e.target);

            app.events.trigger('clear:selection');

            if ($el.is('.half-hour')) {
                var data = $el.data();

                this.isDragging = true;
                this.setDragStart($el, data.date, data.hour, data.min, data.id);
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);

            if (this.isDragging) {
                var data = $el.data();

                this.setDragEnd($el, data.date, data.hour, data.min, data.id);
            }
        },

        handleMouseUp: function (e) {
            var $el = $(e.target);

            if ($el.is('.half-hour')) {
                this.isDragging = false;

                var invert = this.dragDateTimeStart > this.dragDateTimeEnd;

                var start = invert ? this.dragDateTimeEnd : this.dragDateTimeStart;
                var end = invert ? this.dragDateTimeStart : this.dragDateTimeEnd;

                app.events.trigger('add:event', {
                    'from': start,
                    'to': end,
                    'fullday': false
                });
            }
        },


        // date selection & highlighting~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setDragStart: function ($el, date, hour, min, id) {
            this.dragIdStart = id;

            this.dragDateTimeStart = app.cal.newDate(date);
            this.dragDateTimeStart.setHours(hour, min, 0, 0);

            this.setDragEnd($el, date, hour, min, id);
        },

        setDragEnd: function ($el, date, hour, min, id) {
            this.dragIdEnd = id;

            this.dragDateTimeEnd = app.cal.newDate(date);
            this.dragDateTimeEnd.setHours(hour, min, 0, 0);

            if (this.dragIdStart <= this.dragIdEnd) {
                this.markTimeRangeAsHighlight(this.dragIdStart, this.dragIdEnd);

            } else {
                // swap order if we're dragging backwards
                this.markTimeRangeAsHighlight(this.dragIdEnd, this.dragIdStart);
            }
        },

        clearDrag: function () {
            this.markTimeRangeAsHighlight(null, null);
        },

        markTimeRangeAsHighlight: function (elemFrom, elemTo) {
            this.$times.removeClass('is-highlight');

            if (elemFrom && elemTo) {
                this.$times.slice(elemFrom, elemTo + 1).addClass('is-highlight');
            }
        }
    });
})(jQuery);