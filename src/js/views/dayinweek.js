/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.dayInWeek = App.Views.day.extend({
        template: _.template($('#day-week-template').html()),
        timeTemplate: _.template($('#time-template').html()),

        events: {
            'mousedown .time-link': 'handleMouseDown',
            'mouseover .time-link': 'handleMouseOver',
            'mouseup': 'handleMouseUp'
        },

        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            var self = this;

            App.Views.day.prototype.initialize.apply(this, [params]);

            this.listenTo(App.Events, 'mouse:up', function () { self.handleMouseUp(null, true); });
            this.listenTo(App.Events, 'clear:selection', this.handleClearSelection);
            this.listenTo(App.Events, 'clock:tick', this.handleClockTick); // broken?
        },

        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            App.Views.day.prototype.render.apply(this);

            this.cacheSelectors();

            this.renderTime();

            if (this.isToday()) {
                this.setTimeLinePosition();
            }

            this.$times = this.$('.time-link');

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$newEvent = this.$('.new-event');
            this.$dayTimes = this.$('.cal-day-times');
        },

        renderTime: function () {
            var timeData = App.Methods.getTimeData(this.day);

            var fragment = document.createDocumentFragment();

            // for every half-hour of the day, render the time template
            _.each(timeData, function (time) {
                fragment.appendChild($(this.timeTemplate(time))[0]);
            }, this);

            this.$dayTimes.empty();
            this.$dayTimes.append(fragment);
        },

        isToday: function () {
            return (this.model.get('date') === this.today);
        },

        setTimeLinePosition: function () {
            var $time = this.$('.now');
            var now = new Date();
            var day = App.Methods.newDate(now);

            // if we've walked into tomorrow (by staying on the page long enough),
            // fire the event to update the date to today
            if (App.State.today.getTime() !== day.getTime()) {
                App.Events.trigger('change:date', day);
                App.State.today = day;
            }

            var percentDayComplete = App.Methods.getPercentDayComplete(now);

            $time.attr('datetime', App.Methods.getNewDateId(now));
            $time.text(now.toString());

            if ($time.length) {
                $time.removeClass('is-hidden').css('top', percentDayComplete + '%');
            }
        },


        // Handle events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMouseDown: function (e) {
            var $el = $(e.target);

            App.Events.trigger('clear:selection');

            if ($el.is('.time-link')) {
                this.isDragging = true;
                this.setDragStart($el, $el.attr('id'), $el.data('pos'));
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);
            var data;

            if (this.isDragging) {
                this.setDragEnd($el, $el.attr('id'), $el.data('pos'));

                data = this.getStartEndData();
                this.markTimeRangeAsHighlight(data.startId, data.endId);
            }
        },

        handleMouseUp: function (e, externalEvent) {
            var $el = e ? $(e.target) : null;
            var data;

            if (this.isDragging) {
                this.isDragging = false;

                if (($el && $el.is('.time-link')) || externalEvent) {
                    this.createNewEvent();
                }
            }
        },

        handleClearSelection: function () {
            this.clearDrag();
        },

        // broken?
        handleClockTick: function () {
            if (this.isToday()) {
                this.setTimeLinePosition();
            }
        },


        // date selection & highlighting~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setDragStart: function ($el, date, pos) {
            this.dragIdStart = pos;
            this.dragDateTimeStart = new Date(date);

            this.setDragEnd($el, date, pos);
        },

        setDragEnd: function ($el, date, pos) {
            this.dragIdEnd = pos;
            this.dragDateTimeEnd = new Date(date);
        },

        clearDrag: function () {
            this.markTimeRangeAsHighlight(null, null);
        },

        markTimeRangeAsHighlight: function (elemFrom, elemTo) {
            if (elemFrom || elemTo) {

                var $topElem = this.$times.eq(elemFrom).parent();
                var $bottomElem = this.$times.eq(elemTo).parent();

                var top = $topElem.position().top + 1;
                var height = $bottomElem.position().top + $bottomElem.height() - top;

                this.$newEvent
                    .removeClass('is-hidden')
                    .css({
                        'top': top,
                        'height': height
                    });

            } else {
                this.$newEvent.addClass('is-hidden');
            }
        },

        createNewEvent: function () {
            var data = this.getStartEndData();
            var endTimeCorrected = App.Methods.getTimeMinsLater(30, data.endTime);

            this.markTimeRangeAsHighlight(data.startId, data.endId);

            App.Events.trigger('add:event', {
                'from': data.startTime,
                'to': endTimeCorrected,
                'fullday': App.Methods.isFullDay(data.startTime, endTimeCorrected)
            });
        },

        getStartEndData: function () {
            var invert = this.dragDateTimeStart > this.dragDateTimeEnd;

            if (invert) {
                return {
                    startTime: this.dragDateTimeEnd,
                    endTime: this.dragDateTimeStart,
                    startId: this.dragIdEnd,
                    endId: this.dragIdStart
                };

            } else {
                return {
                    startTime: this.dragDateTimeStart,
                    endTime: this.dragDateTimeEnd,
                    startId: this.dragIdStart,
                    endId: this.dragIdEnd
                };
            }
        },


        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function () {
            this.undelegateEvents();
            this.stopListening();
            this.remove();
        }
    });
})(jQuery);