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
            'mouseup': 'handleMouseUp',
            'click .new-event': 'handleNewEventClick',
            'mouseup .new-event': 'handleCreateNewEvent'
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

            this.setTimeLinePosition();
            // this.startTimeLineTicker();
            // this.focusCurrentTime();
            //
            this.setTimeData();

            this.renderTime();

            this.$times = this.$('.time-link');

            return this.el;
        },

        cacheSelectors: function () {
            this.$newEvent = this.$('.new-event');
            this.$day = this.$('.cal-events-grid');
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


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setTimeData: function () {
            if (this.timeData) { this.timeData.reset(); }

            this.timeData = new app.timeCollection();
            this.addTimeDataToCollection();
        },

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
                data = this.getStartEndData();

                this.markTimeRangeAsHighlight(data.startId, data.endId);
            }
        },

        handleCreateNewEvent: function () {
            var data = this.getStartEndData();
            var endTimeCorrected = this.getTime30MinsLater(data.endTime);

            this.markTimeRangeAsHighlight(data.startId, data.endId);

            app.events.trigger('add:event', {
                'from': data.startTime,
                'to': endTimeCorrected,
                'fullday': false
            });
        },

        handleNewEventClick: function (e) {
            if (e) { e.preventDefault(); }

            this.markTimeRangeAsHighlight(null, null);
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
                }
            }
        },

        getTime30MinsLater: function (time) {

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
                var top = $topElem.position().top + 1;
                var $bottomElem = this.$times.eq(elemTo).parent();
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

        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function() {
            _.each(this.timeViews, function(time) {
                time.remove();
            });

            this.undelegateEvents();
            this.stopListening();
            this.timeViews = null;
        }
    });
})(jQuery);