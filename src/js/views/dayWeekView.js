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

            this.listenTo(app.events, 'clear:selection', function () { self.clearDrag() });
        },

        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            app.dayView.prototype.render.apply(this);

            this.cacheSelectors();

            this.setTimeData();

            this.renderTime();

            if (this.isToday()) {
                this.setTimeLinePosition();
                this.startTimeLineTicker();
            }

            this.$times = this.$('.time-link');

            return this.el;
        },

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

        // HANDLE NEXT DAY / ETC
        setTimeLinePosition: function () {
            var $time = this.$('.now');
            var now = new Date(); // not app.cal.newDate as that creates a new data at 00:00am
            var d = app.cal.getObjectFromDate(now);
            var dayStart = app.cal.newDate(d.year, d.month, d.day);
            var msSinceDayStart = now.getTime() - dayStart.getTime();
            var percentComplete = (msSinceDayStart / app.const.MS_IN_DAY) * 100;

            if ($time.length) {
                $time.removeClass('is-hidden').css('top', percentComplete + '%');
            }
        },

        // work out how much time until the current minute ends. Once it does, start a
        // once-a-minute timer to update the current time line
        startTimeLineTicker: function () {
            var self = this;
            var newDate = new Date();
            var now = app.cal.getObjectFromDate(newDate);
            var endOfCurrentMinute = new Date(now.year, now.month, now.day, now.hour, now.minute + 1);
            var diff = endOfCurrentMinute.getTime() - newDate.getTime();

            this.tickerTimeout = this.tickerInterval = null;

            // timeout to the end of the minute
            this.tickerTimeout = setTimeout(function () {
                // interval for every minute
                self.tickerInterval = setInterval(function () {
                    self.setTimeLinePosition();

                }, app.const.MS_IN_MINUTE);
            }, diff);
        },

        stopTimeLineTicker: function () {
            clearTimeout(this.tickerTimeout);
            clearInterval(this.tickerInterval);
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
                app.isDragging = true;
                this.setDragStart($el, $el.attr('id'), $el.data('pos'));
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);
            var data;

            if (app.isDragging) {
                this.setDragEnd($el, $el.attr('id'), $el.data('pos'));

                data = this.getStartEndData();
                this.markTimeRangeAsHighlight(data.startId, data.endId);
            }
        },

        handleMouseUp: function (e) {
            var $el = $(e.target);
            var data;

            app.isDragging = false;

            if ($el.is('.time-link')) {
                this.createNewEvent();
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
            if (elemFrom && elemTo) {

                var $topElem = this.$times.eq(elemFrom).parent();
                var $bottomElem = this.$times.eq(elemTo).parent();

                var top = $topElem.position().top + 1;
                var height = $bottomElem.position().top + $bottomElem.height() - top;

                this.$newEvent.css({
                    'display': 'block',
                    'top': top,
                    'height': height,
                });

            } else {
                this.$newEvent.css('display', 'none');
            }
        },

        createNewEvent: function () {
            var data = this.getStartEndData();
            var endTimeCorrected = this.getTime30MinsLater(data.endTime);

            this.markTimeRangeAsHighlight(data.startId, data.endId);

            app.events.trigger('add:event', {
                'from': data.startTime,
                'to': endTimeCorrected,
                'fullday': false
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

        getTime30MinsLater: function (time) {
            return time;
        },

        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function () {
            _.each(this.timeViews, function (time) {
                time.remove();
            });

            this.stopTimeLineTicker();
            this.undelegateEvents();
            this.stopListening();
            this.timeViews = null;
        }
    });
})(jQuery);