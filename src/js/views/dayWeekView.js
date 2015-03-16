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
            'mousedown .time-link': 'handleMouseDown',
            'mouseover .time-link': 'handleMouseOver',
            'mouseup': 'handleMouseUp'
        },

        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            var self = this;

            app.dayView.prototype.initialize.apply(this, [params]);

            this.listenTo(app.events, 'mouse:up', function () { self.handleMouseUp(null, true); });
            this.listenTo(app.events, 'clear:selection', this.handleClearSelection);
            this.listenTo(app.events, 'clock:tick', this.handleClockTick);
        },

        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            app.dayView.prototype.render.apply(this);

            this.cacheSelectors();

            this.setTimeData();

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
            this.$day = this.$('.cal-events-grid');
        },

        setTimeData: function () {
            if (this.timeData) { this.timeData.reset(); }

            this.timeData = new app.timeCollection();
            this.addTimeDataToCollection();
        },

        renderTime: function () {
            var fragment = document.createDocumentFragment();

            this.timeViews = this.timeData.map(function (time) {
                var view = new app.timeView({
                    model: time
                });
                fragment.appendChild(view.render());

                return view;
            }, this);

            this.$day.empty();
            this.$day.append(fragment);
        },

        isToday: function () {
            return (this.model.get('date') === this.today);
        },

        setTimeLinePosition: function () {
            var $time = this.$('.now');
            var now = new Date();

            // if we've walked into tomorrow (by staying on the page long enough),
            // fire the event to update the date to today
            if (app.state.today.getTime() !== now.getTime()) {
                app.events.trigger('change:date', now);
                app.state.today = now;
            }

            var percentDayComplete = app.cal.getPercentDayComplete(now);

            $time.attr('datetime', app.cal.getNewDateId(now));
            $time.text(now.toString());

            if ($time.length) {
                $time.removeClass('is-hidden').css('top', percentDayComplete + '%');
            }
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        addTimeDataToCollection: function (day) {
            var self = this;

            // load data
            var data = app.cal.getTimeData(this.day);

            data.map(function (d) {
                self.timeData.add(d);
            });
        },


        // Handle events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMouseDown: function (e) {
            var $el = $(e.target);

            app.events.trigger('clear:selection');

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
            var endTimeCorrected = app.cal.getTimeMinsLater(30, data.endTime);

            this.markTimeRangeAsHighlight(data.startId, data.endId);

            app.events.trigger('add:event', {
                'from': data.startTime,
                'to': endTimeCorrected,
                'fullday': app.cal.isFullDay(data.startTime, endTimeCorrected)
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
            _.each(this.timeViews, function (time) {
                time.remove();
            });

            this.undelegateEvents();
            this.stopListening();
            this.timeViews = null;
        }
    });
})(jQuery);