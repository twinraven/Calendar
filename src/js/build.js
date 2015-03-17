/**
 *   - v0.3.0 - 2015-03-17
 *  (c) 2015 Tom Bran All Rights Reserved
 */ 

/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    app.Methods = {
        labels : {
            week : [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
            ],
            month: [
                'January',
                'Febuary',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ]
        },

        // Basic date methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        newDate: function () { // using arguments, not params
            var args;
            var newDate;

            // if no params are passed, set date as today (in UCT string)
            if (arguments.length === 0) {
                args = [Date.now()];
            } else {
                args =  _.toArray(arguments);
            }
            // add null to start of array, to make it
            //format-friendly to the bind.apply statement below
            args.unshift(null);

            newDate = new (Date.bind.apply(Date, args))();
            newDate.setHours(0,0,0,0); // remove chance of GMT weirdness

            if (newDate.getTimezoneOffset() !== 0) {
                // bugger.
            }

            return newDate;
        },


        getDaysInMonth : function (date) {
            var d = this.getObjectFromDate(date);

            // add 1 to month, then request day 0 -- gets last day of previous month
            return new Date(d.year, d.month + 1, 0).getDate();
        },


        getYear : function (date) {
            return date.getFullYear();
        },


        getMonthNum : function (date) {
            return date.getMonth();
        },


        getMonthName : function (date) {
            return this.labels.month[date.getMonth()];
        },


        getDate : function (date) {
            return date.getDate();
        },


        // Get a particular property of a date ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        getObjectFromDate : function (date) {
            return {
                year:   date.getFullYear(),
                month:  date.getMonth(),
                day:    date.getDate(),
                hour:  date.getHours(),
                minute:   date.getMinutes()
            };
        },


        getRowsInMonth : function (date) {
            var daysInGrid = this.getDaysInMonth(date) + this.getMonthStartDayNum(date);

            return (Math.ceil(daysInGrid / app.constants.DAYS_IN_WEEK));
        },


        getNewDateId : function (date) {
            var d = new Date(date);

            return '' +
                    d.getFullYear() +
                    '-' +
                    this.asTwoDigits(d.getMonth() + 1) +
                    '-' +
                    this.asTwoDigits(d.getDate()) +
                    'T' +
                    this.asTwoDigits(d.getHours()) +
                    ':' +
                    this.asTwoDigits(d.getMinutes()) +
                    ':00Z';
        },


        getOrdinalSuffix : function (num) {
            var dec = num % 10,
                cent = num % 100;

            if (dec === 1 && cent !== 11) {
                return 'st';
            }

            if (dec === 2 && cent !== 12) {
                return 'nd';
            }

            if (dec === 3 && cent !== 13) {
                return 'rd';
            }

            return 'th';
        },


        asTwoDigits : function (num) {
            return ('0' + num).slice(-2);
        },

        getDayOfWeekName : function (num) {
            return this.labels.week[num];
        },


        getDayOfWeekNum : function (year, month, day) {
            var num = new Date(year, month, day).getDay();

            if (app.State.startDay === 'mon') {
                 // JS getDay() returns a sunday-0-indexed value
                num = (num + (app.constants.DAYS_IN_WEEK - 1)) % app.constants.DAYS_IN_WEEK;
            }

            return num;
        },

        // returns a number 0-6 for day of week
        getMonthStartDayNum : function (date) {
            var d = this.getObjectFromDate(date);

            return this.getDayOfWeekNum(d.year, d.month, 1);
        },


        getWeekStartDate : function (date) {
            var d = this.getObjectFromDate(date);
            var dayNum = this.getDayOfWeekNum(d.year, d.month, d.day);

            return this.newDate(d.year, d.month, d.day - dayNum);
        },


        getWeekEndDate : function (date) {
            var weekStartDate = this.getWeekStartDate(date);
            var d = this.getObjectFromDate(weekStartDate);

            return this.newDate(d.year, d.month, d.day + (app.constants.DAYS_IN_WEEK - 1));
        },

        getTimeAs12HourFormat : function (num) {
            var suffix = 'am';

            if (num === 0) {
                num = 12;

            } else if (num > 12) {
                num = num - 12;
                suffix = 'pm';
            }

            //return this.asTwoDigits(num) + suffix;
            return num + suffix;
        },

        getPercentDayComplete : function (date) {
            var d = this.getObjectFromDate(date);
            var dayStart = this.newDate(d.year, d.month, d.day);
            var msSinceDayStart = date.getTime() - dayStart.getTime();
            var percentComplete = (msSinceDayStart / app.constants.MS_IN_DAY) * 100;

            return percentComplete;
        },

        getTimeMinsLater : function (mins, time) {
            var d = this.getObjectFromDate(time);
            var later = new Date(d.year, d.month, d.day, d.hour, d.minute + mins);

            return later;
        },

        getDateTomorrow : function (date) {
            var d = this.getObjectFromDate(date);
            var tomorrow = this.newDate(d.year, d.month, d.day + 1);

            return tomorrow;
        },

        isCurrentWeek : function (date) {
            var d = this.newDate(date);
            var weekStartDate = this.getWeekStartDate(d);
            var now = this.newDate();
            var currentWeekStartDate = this.getWeekStartDate(now);

            return (weekStartDate.getTime() === currentWeekStartDate.getTime());
        },

        isDateToday : function (date) {
            var now = new Date(); // not this.newDate as that creates a new data at 00:00am
            var active = new Date(date);
            var nowDate = now.getDate();
            var activeDate = active.getDate();

            return (nowDate === activeDate);
        },

        isFullDay : function (timeFrom, timeTo) {
            var from = timeFrom.getTime();
            var to = timeTo.getTime();
            var diff = to - from;

            return diff === app.constants.MS_IN_DAY;
        },


        // Date traversal ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


        getPrevDateRange : function (date, mode) {
            if (mode === app.constants.WEEK) {
                return this.getPrevWeek(date);
            }

            if (mode === app.constants.MONTH) {
                return this.getPrevMonth(date);
            }
        },


        getNextDateRange : function (date, mode) {
            if (mode === app.constants.WEEK) {
                return this.getNextWeek(date);
            }

            if (mode === app.constants.MONTH) {
                return this.getNextMonth(date);
            }
        },


        getNextWeek : function (date) {
            var d = this.getObjectFromDate(date);

            return new Date(d.year, d.month, d.day + 7);
        },


        getPrevWeek : function (date) {
            var d = this.getObjectFromDate(date);

            return new Date(d.year, d.month, d.day - 7);
        },


        getNextMonth : function (date) {
            var d = this.getObjectFromDate(date);

            return new Date(d.year, d.month + 1);
        },


        getPrevMonth : function (date) {
            var d = this.getObjectFromDate(date);

            return new Date(d.year, d.month - 1);
        },

        // Return array-based date collections ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


        getDaysInRangeNum : function (dateFrom, dateTo) {
            var dFrom = this.newDate(dateFrom);
            var dTo = this.newDate(dateTo);

            return Math.floor((dTo.getTime() - dFrom.getTime()) / app.constants.MS_IN_DAY) + 1;
        },


        getDateRangeData : function (dateFrom, dateTo) {
            var dateFromObj = this.getObjectFromDate(dateFrom);
            var totalDays = this.getDaysInRangeNum(dateFrom, dateTo);
            var x, y;
            var data = [];

            for (x = 0, y = totalDays; x < y; x++) {
                data.push(this.getNewDayData(dateFromObj.year, dateFromObj.month, dateFromObj.day + x));
            }

            return data;
        },


        getMonthData : function (date) {
            var d = this.getObjectFromDate(date);
            var dateFrom = new Date(d.year, d.month, 1);
            var dateTo = new Date(d.year, d.month, this.getDaysInMonth(date));

            var data = this.getDateRangeData(dateFrom, dateTo);

            return data;
        },


        getWeekData : function (date) {
            var weekStartDate = this.getWeekStartDate(date);
            var weekEndDate = this.getWeekEndDate(date);
            var data = this.getDateRangeData(weekStartDate, weekEndDate);

            return data;
        },

        getTimeData : function (date) {
            var d = this.getObjectFromDate(date);
            var x, y;
            var data = [];

            for (x = 0, y = app.constants.HRS_IN_DAY; x < y; x++) {
                data.push(this.getNewTimeData(d.year, d.month, d.day, x, 0, (x * 2)));
                data.push(this.getNewTimeData(d.year, d.month, d.day, x, 30, (x * 2 + 1)));
            }

            return data;
        },


        // we want to build a full grid of days, so may need days from preceding and proceeding months
        getMonthGridData : function (date) {
            var thisMonthData = this.getMonthData(date);
            var totalBlocksInGrid = this.getRowsInMonth(date) * app.constants.DAYS_IN_WEEK;

            var daysMissingAtFront = 0;
            var daysMissingAtEnd = 0;
            var prev;
            var prevMonthData = [];
            var next;
            var nextMonthData = [];
            var output = [];


            // refactor? - code duplication. Rework ~~~~~~~~~~~~~~~~~~~~~~~
            daysMissingAtFront = this.getMonthStartDayNum(date);

            if (daysMissingAtFront > 0) {
                prev = this.getPrevMonth(date);
                prevMonthData = this.getMonthData(prev);
                prevMonthData = prevMonthData.slice(-daysMissingAtFront); // just the day/s we need to fill the gap
            }

            daysMissingAtEnd = totalBlocksInGrid - (thisMonthData.length + prevMonthData.length);

            if (daysMissingAtEnd > 0) {
                next = this.getNextMonth(date);
                nextMonthData = this.getMonthData(next);
                nextMonthData = nextMonthData.slice(0, daysMissingAtEnd); // just the day/s we need
            }
            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

            output = _.union(output, prevMonthData, thisMonthData, nextMonthData);

            return output;
        },

        getNewDayData : function (year, month, day) {
            var newDate = new Date(year, month, day);
            var d = this.getObjectFromDate(newDate);

            return {
                id : this.getNewDateId(newDate),
                day : d.day.toString(),
                month: d.month.toString(),
                monthName: this.getMonthName(newDate),
                year: d.year.toString(),
                date: newDate.toDateString(),
                suffix: this.getOrdinalSuffix(d.day),
                weekday : this.getDayOfWeekName(this.getDayOfWeekNum(d.year, d.month, d.day))
            };
        },

        getNewTimeData : function (year, month, day, hour, minute, position) {
            var newDate = new Date(year, month, day, hour, minute);
            var d = this.getObjectFromDate(newDate);

            return {
                position: position, // simple incrementing number
                id: this.getNewDateId(newDate),
                date: newDate.toDateString(),
                hour: d.hour.toString(),
                minute: d.minute.toString()
            };
        }
    };
})(jQuery);
/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
	'use strict';

	// Settings ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// immutable app-wide properties
	app.constants = {
	    DAYS_IN_WEEK : 7,
	    MONTHS_IN_YEAR : 12,
	    ESC_KEY : 27,
	    WEEK : 'WEEK',
	    MONTH : 'MONTH',
	    MS_IN_DAY : 86400000,
	    MS_IN_MINUTE : 60000,
	    MINS_IN_DAY: 1440,
	    HRS_IN_DAY: 24
	};

	// mutable app-wide properties
	app.State = {
		today: app.Methods.newDate(),
	    startDay : 'mon',
		viewMode: app.constants.MONTH
	};

	app.Models = {};
	app.Collections = {};
	app.Views = {};
	app.Events = {};

})(jQuery);

/* global Backbone */
var app = app || {};

(function ($) {
    'use strict';

	_.extend(app.Events, Backbone.Events);

})(jQuery);
/*global Backbone */
var app = app || {};

(function () {
    'use strict';

    // Model
    // ----------

    app.dayModel = Backbone.Model.extend({
        // Default attributes for the model
        defaults: {
            isActive: false,
            isHighlight: false,
            events: {
                day: [],
                timed: []
            }
        }
    });
})();

/*global Backbone */
var app = app || {};

(function () {
    'use strict';

    // Model
    // ----------

    app.eventModel = Backbone.Model.extend({});
})();

/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Collection
	// ---------------

	// The collection of todos is backed by *localStorage* instead of a remote
	// server.
	app.dateCollection = Backbone.Collection.extend({
		url: '/',
		// Reference to this collection's model.
		model: app.dayModel,

		// Save all of the todo items under the `"calendar"` namespace.
		localStorage: new Backbone.LocalStorage('calendar-backbone')
	});
})();

/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Collection
	// ---------------

	// The collection of todos is backed by *localStorage* instead of a remote
	// server.
	app.eventCollection = Backbone.Collection.extend({
		url: 'api/calendar-v3.json',
		// Reference to this collection's model.
		model: app.eventModel,

		comparator: 'etag',

		parse: function (dates) {
			dates.map(function (item) {
				item.isFullDay = _.has(item.start.date);

				return item;
			});

			return dates;
		}
	});
})();

/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.Views.day = Backbone.View.extend({
        template: _.template($('#day-main-template').html()),

        tagName: 'li',
        className: 'day',

        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            this.options = params;

            this.day = (params && params.model && params.model.id) || app.Methods.newDate();
            this.day = new Date(this.day);

            this.listenTo(this.model, 'destroy', this.close);
        },

        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.setState();

            this.addElem();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setState: function () {
            var m = this.model;
            var classes = [];
            this.today = app.Methods.newDate().toDateString();

            // highlight today
            if (m.get('date') === this.today) {
                classes.push('is-today');
            }

            // highlight if this day is currently in our active range
            if (m.get('isActive') === true) {
                classes.push('is-range');

            } else {
                classes.push('is-not-range');
            }

            if (m.get('isHighlight') === true) {
                classes.push('is-highlight');
            }

            this.$el.addClass(classes.join(' '));
        },

        addElem: function () {
            this.$el.html(this.template(this.model.toJSON()));
        },


        // Kill switch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Remove the item, destroy the model from *localStorage* and delete its view.
        close: function () {
            this.remove();
        }
    });
})(jQuery);
/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.Views.dayInSummary = app.Views.day.extend({
        template: _.template($('#day-summary-template').html())
    });
})(jQuery);
/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.Views.dayInWeek = app.Views.day.extend({
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

            app.Views.day.prototype.initialize.apply(this, [params]);

            this.listenTo(app.Events, 'mouse:up', function () { self.handleMouseUp(null, true); });
            this.listenTo(app.Events, 'clear:selection', this.handleClearSelection);
            //this.listenTo(app.Events, 'clock:tick', this.handleClockTick); // broken?
        },

        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            app.Views.day.prototype.render.apply(this);

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
            var timeData = app.Methods.getTimeData(this.day);

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

            // if we've walked into tomorrow (by staying on the page long enough),
            // fire the event to update the date to today
            /*if (app.State.today.getTime() !== now.getTime()) {
                app.Events.trigger('change:date', now);
                app.State.today = now;
            }*/

            var percentDayComplete = app.Methods.getPercentDayComplete(now);

            $time.attr('datetime', app.Methods.getNewDateId(now));
            $time.text(now.toString());

            if ($time.length) {
                $time.removeClass('is-hidden').css('top', percentDayComplete + '%');
            }
        },


        // Handle events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMouseDown: function (e) {
            var $el = $(e.target);

            app.Events.trigger('clear:selection');

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
            var endTimeCorrected = app.Methods.getTimeMinsLater(30, data.endTime);

            this.markTimeRangeAsHighlight(data.startId, data.endId);

            app.Events.trigger('add:event', {
                'from': data.startTime,
                'to': endTimeCorrected,
                'fullday': app.Methods.isFullDay(data.startTime, endTimeCorrected)
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
/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    app.Views.week = Backbone.View.extend({

        // templating and setup
        template: _.template($('#week-template').html()), // for containing elem & markup
        titleTemplate: _.template($('#day-week-title-template').html()), // for mon/tue/wed labels
        timeLabelTemplate: _.template($('#time-label-template').html()),

        collection: app.dateCollection,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {

            // keep track of own date, irrespective of app-wide state
            this.selfWeek = (params && params.date) || app.Methods.newDate();

            this.listenTo(app.Events, 'change:date', this.handleChangeDate);
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.$el.html(this.template({}));

            this.cacheSelectors();

            this.renderDayLabels();

            this.renderTimeLabels();

            this.setWeekData();

            this.renderDates();

            this.scrollTimeIntoView();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$week = this.$('.week-days');
            this.$labels = this.$('.cal-labels');
            this.$grid = this.$('.cal-grid');
            this.$timeLabels = this.$('.day-time-labels');
        },

        renderDayLabels: function () {
            var self = this;
            var d = app.Methods.getObjectFromDate(self.selfWeek);

            _.each(app.Methods.labels.week, function (day, i) {
                var newDate = app.Methods.newDate(d.year, d.month, d.day + i);
                var newDateObj = app.Methods.getObjectFromDate(newDate);

                var data = {
                    'date': newDateObj.day + '/' + newDateObj.month,
                    'label': app.Methods.labels.week[i].slice(0, 3),
                    'initial': app.Methods.labels.week[i].slice(0, 1)
                };

                self.$labels.append(self.titleTemplate(data));
            });
        },

        renderTimeLabels: function () {
            var x = 0;
            var data = {};

            while (x < app.constants.HRS_IN_DAY) {
                data = { 'hour': app.Methods.getTimeAs12HourFormat(x) };

                this.$timeLabels.append(this.timeLabelTemplate(data));

                x++;
            }
        },

        setWeekData: function () {
            if (this.weekData) { this.weekData.reset(); }

            this.weekData = new app.dateCollection();
            this.addWeekDataToCollection();
        },

        renderDates: function () {
            var fragment = document.createDocumentFragment();

            this.dayViews = this.weekData.map(function (day) {
                var view = new app.Views.dayInWeek({
                    model: day
                });

                fragment.appendChild(view.render());

                return view;
            }, this);

            this.$week.empty();
            this.$week.append(fragment);
        },

        scrollTimeIntoView: function () {
            var now = new Date();

            if (now.getHours() >= 12 && app.Methods.isCurrentWeek(this.selfWeek)) {
                this.$grid.scrollTop(500);
            }
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        addWeekDataToCollection: function () {
            // load data
            var data = app.Methods.getWeekData(this.selfWeek);

            data.map(function (d) {
                this.weekData.add(d);
            }, this);
        },


        // event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleChangeDate: function (date) {
            // normalise date so we're always dealing with the first day of the week
            var newDate = app.Methods.getWeekStartDate(date);

            this.selfWeek = newDate;

            this.render();
        },


        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function () {
            _.each(this.dayViews, function (day) {
                day.remove();
            });

            this.undelegateEvents();
            this.stopListening();
            this.dayViews = null;
        }
    });
})(jQuery);
/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    app.Views.row = Backbone.View.extend({
        tagName: 'li',
        className: 'week-row',

        // templating and setup
        template: _.template($('#week-month-template').html()), // for containing elem & markup

        collection: app.dateCollection,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            this.options = params;
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.$el.html(this.template({}));

            this.renderDates();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderDates: function () {
            var $weekDays = this.$('.week-row-days');
            var $weekEvents = this.$('.week-row-events');
            var fragment = document.createDocumentFragment();

            this.dayViews = this.collection.map(function (day) {
                var view = new this.options.dayView({
                    model: day
                });
                fragment.appendChild(view.render());

                return view;
            }, this);

            $weekDays.empty();
            $weekDays.append(fragment);
        },


        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function () {
            _.each(this.dayViews, function (day) {
                day.remove();
            });

            this.undelegateEvents();
            this.stopListening();
            this.dayViews = null;
        }
    });
})(jQuery);
/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    app.Views.month = Backbone.View.extend({

        // templating and setup
        template: _.template($('#month-template').html()), // for containing elem & markup
        titleTemplate: _.template($('#day-title-template').html()), // for containing elem & markup

        // allows for sub-class overriding
        customDayView: app.Views.day,

        //collection: app.dateCollection,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {

            // keep track of own date, irrespective of app-wide state - but init with external val
            this.selfMonth = (params && params.date) || app.Methods.newDate();

            this.listenTo(app.Events, 'change:date', this.handleChangeDate);
            this.listenTo(app.Events, 'change:mark', this.handleMarkDateRange);
            //this.listenTo(app.Events, 'clock:tick', this.handleClockTick); // broken?
            this.listenTo(app.Events, 'api:data', this.handleApiData);
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            // needed?
            this.$el.html(this.template({}));

            this.cacheSelectors();

            this.renderDayLabels();

            this.setMonthData();

            this.setRowsInMonth();

            this.markPredefinedDates();

            this.renderDates();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$month = this.$('.month-days');
            this.$labels = this.$('.cal-labels');
        },

        renderDayLabels: function () {
            var self = this;

            _.each(app.Methods.labels.week, function (day, i) {
                var data = {
                    'label': app.Methods.labels.week[i],
                    'initial': app.Methods.labels.week[i].slice(0, 1)
                };
                self.$labels.append(self.titleTemplate(data));
            });
        },

        // flagged for removal? depends if switching to table layout
        setRowsInMonth: function () {
            this.rowsInMonth = app.Methods.getRowsInMonth(this.selfMonth);
            this.$el.attr('data-cal-rows', this.rowsInMonth);
        },

        markPredefinedDates: function () {
            // upon render, if we have already got marked dates cached, re-render these now.
            // this handles date traversals in summary view
            if (this.markedDates) {
                this.markDateRangeAsActive(this.markedDates.from, this.markedDates.to);
            }
        },

        renderDates: function () {
            var weekFragment;
            var monthFragment = document.createDocumentFragment();
            var x, y;

            for (x = 0, y = this.rowsInMonth; x < y; x++) {
                weekFragment = this.renderWeekFragment(x);
                monthFragment.appendChild(weekFragment);
            }

            this.$month.empty();
            this.$month.append(monthFragment);
        },

        renderWeekFragment: function (x) {
            var startPos = app.constants.DAYS_IN_WEEK * x;
            var endPos = startPos + app.constants.DAYS_IN_WEEK;
            var weekData = this.monthData.slice(startPos, endPos);

            var weekFragment = document.createDocumentFragment();

            var monthRowView = new app.Views.row({
                collection: weekData,
                dayView: this.customDayView
            });

            weekFragment.appendChild(monthRowView.render());

            return weekFragment;
        },


        // Marking/highlighting dates ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        markDateRange: function (dateFrom, dateTo, attr) {
            this.monthData.each(function (day) {
                var date = app.Methods.newDate(day.get('date'));
                var prop = {};
                if (date >= dateFrom && date <= dateTo) {
                    prop[attr] = true;
                } else {
                    prop[attr] = false;
                }
                day.save(prop);
            });
        },

        markDateRangeAsHighlight: function (dateFrom, dateTo) {
            this.markDateRange(dateFrom, dateTo, 'isHighlight');
        },

        markDateRangeAsActive: function (dateFrom, dateTo) {
            this.markDateRange(dateFrom, dateTo, 'isActive');
        },

        storeMarkedDates: function (dates) {
            this.markedDates = dates;
        },


        // date traversal ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // used to a fuller extend by child prototypes - monthSummaryView / monthMainView
        gotoMonth: function (params) {
            var date = app.Methods.newDate();

            if (params.type) {
                if (params.type === 'next') {
                    date = app.Methods.getNextMonth(params.month);

                } else if (params.type === 'previous') {
                    date = app.Methods.getPrevMonth(params.month);
                }
            }

            if (params.newDate) { date = params.newDate; }

            this.selfMonth = date;

            this.render();
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setMonthData: function () {
            if (this.monthData) { this.monthData.reset(); }

            this.monthData = new app.dateCollection();
            this.addMonthDataToCollection();
        },

        addMonthDataToCollection: function () {
            // load data
            var data = app.Methods.getMonthGridData(this.selfMonth);

            data.map(function (d) {
                this.monthData.add(d);
            }, this);
        },


        // event handler ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleChangeDate: function (date) {
            this.gotoMonth({ 'newDate': date });
        },

        handleMarkDateRange: function (dates) {
            this.markDateRangeAsActive(dates.from, dates.to);

            this.storeMarkedDates(dates);

            this.renderDates();
        },

        // broken?
        handleClockTick: function () {
            if (!app.State.isDragging && !app.State.hasSelection) {
                var now = app.Methods.newDate();

                if (app.State.today.getTime() !== now.getTime()) {
                    this.selfMonth = now;
                    app.Events.trigger('change:date', now);
                    app.State.today = now;
                }
            }
        },

        handleApiData: function (data) {
            this.monthData.map(function (month) {
                //
            });
        },


        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function () {
            // remove all child/sub views completely
            _.each(this.weekViews, function (week) {
                week.remove();
            });

            // unbind all listeners from memory
            this.undelegateEvents();
            this.stopListening();
            this.dayViews = null;
        }

    });
})(jQuery);
/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------
    // extending app.Views.month
    app.Views.monthInSummary = app.Views.month.extend({
        template: _.template($('#month-summary-template').html()),

        customDayView: app.Views.dayInSummary,

        events: {
            'click .prev-self': 'gotoPrevMonth',
            'click .next-self': 'gotoNextMonth',
            'click .date': 'gotoDate'
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            // call the render method of super class, before running our extension code
            app.Views.month.prototype.render.apply(this);

            this.renderMonthName(this.$('.cal-title'));

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderMonthName: function ($elem) {
            var d = this.selfMonth;

            $elem.text(app.Methods.getMonthName(d) + ' ' + app.Methods.getYear(d));
        },


        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        gotoDate: function (e) {
            if (e) { e.preventDefault(); }

            var date = $(e.currentTarget).data('date');

            app.Events.trigger('goto:date', app.Methods.newDate(date));
        },

        gotoNextMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth({
                'type': 'next',
                'month': this.selfMonth,
                'dest': 'summary'
            });
        },

        gotoPrevMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth({
                'type': 'previous',
                'month': this.selfMonth,
                'dest': 'summary'
            });
        }
    });
})(jQuery);
/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------
    // extending app.Views.month
    app.Views.monthInFull = app.Views.month.extend({
        //
        dayTemplate: _.template($('#day-main-template').html()),

        customDayView: app.Views.day,

        events: {
            'mousedown': 'handleMouseDown',
            'mouseup': 'handleMouseUp',
            'mouseover .day': 'handleMouseOver'
        },


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {

            // call the initialize method of parent/super class (as we want to add more init methods)
            app.Views.month.prototype.initialize.apply(this, [params]);

            this.listenTo(app.Events, 'clear:selection', this.handleClearSelection);
        },


        // event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMouseDown: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                app.State.isDragging = true;
                this.setDragDateStart($el, $el.data('date'));
            }
        },

        handleMouseUp: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                var endDateCorrected = app.Methods.getDateTomorrow(this.dragDateEnd);
                app.State.isDragging = false;

                app.Events.trigger('add:event', {
                    'from': this.dragDateStart,
                    'to': endDateCorrected,
                    'fullday': true
                });

                app.State.hasSelection = true;
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);

            if (app.State.isDragging) {
                this.setDragDateEnd($el, $el.data('date'));
            }
        },

        handleClearSelection: function () {
            this.clearDrag();
        },


        // date selection & highlighting~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setDragDateStart: function ($el, date) {
            this.dragDateStart = app.Methods.newDate(date);

            this.setDragDateEnd($el, date);
        },

        setDragDateEnd: function ($el, date) {
            this.dragDateEnd = app.Methods.newDate(date);

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

            app.State.hasSelection = false;

            this.renderDates();
        }
    });
})(jQuery);
/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.Calendar = Backbone.View.extend({
        el: '#app',

        // Events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //
        events: {
            'click .prev-all': 'gotoPrevDateRange',
            'click .next-all': 'gotoNextDateRange',
            'click .home-all': 'gotoToday',

            'click .cal-mode-week': 'setViewModeWeek',
            'click .cal-mode-month': 'setViewModeMonth',

            'mouseup': 'handleMouseUp'
        },


        // Init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {

            this.cacheSelectors();

            this.bindEvents();

            this.setActiveDate(app.Methods.newDate());

            this.initializeSubViews();

            this.render();

            this.highlightActiveViewModeLink();

            this.startClock();

            this.loadApiData();
        },


        // Init methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$body = $('body');
            this.$title = this.$('.title-all');
            this.$modeLinks = this.$('.cal-mode');
            this.$modeLinkMonth = this.$('.cal-mode-month');
            this.$modeLinkWeek = this.$('.cal-mode-week');
        },

        bindEvents: function () {
            var self = this;

            // custom events
            this.listenTo(app.Events, 'add:event', this.handleAddEvent);
            this.listenTo(app.Events, 'goto:date', this.handleGotoDate);

            // DOM/user events
            this.$body.on('DOMMouseScroll mousewheel', _.debounce(function(e) { self.handleScroll(e); }, 50));
            this.$body.on('keydown', function (e) { self.handleKeyPress.call(self, e); });
        },

        initializeSubViews: function () {
            // summary -- sidebar mini-calendar
            // always initialize this, as it is permanent. View used in main panel is changeable,
            // so this is handled in assignViews (called from .render())
            this.summaryView = new app.Views.monthInSummary({
                dayTemplate: '#day-summary-template'
            });
        },


        // Rendering & data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.assignViews();

            this.markDates();

            this.updateMonthTitle();

            return this.el;
        },


        // Rendering methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        assignViews: function () {
            // it a view has already been assigned, call its custom 'close' method now
            // to safely & thoroughly unbind/remove all listeners & elements
            if (this.mainView) {
                this.mainView.close();
            }

            if (this.isViewModeWeek()) {
                this.mainView = new app.Views.week({
                    date: this.activeDate
                });
            }

            if (this.isViewModeMonth()) {
                this.mainView = new app.Views.monthInFull({
                    dayTemplate: '#day-main-template',
                    date: this.activeDate
                });
            }

            this.assign(this.summaryView, '#cal-summary');
            this.assign(this.mainView, '#cal-main');
        },

        assign: function (view, selector) {
            // using .setElement as it minimises DOM thrashing when re-rendering existing elements
            view.setElement(this.$(selector)).render();
        },

        markDates: function () {
            var d = app.Methods.getObjectFromDate(this.activeDate);

            // if viewing a week, highlight from the first to the last day of the current week
            if (this.isViewModeWeek()) {
                app.Events.trigger('change:mark', {
                    'from': app.Methods.getWeekStartDate(this.activeDate),
                    'to': app.Methods.getWeekEndDate(this.activeDate)
                });
            }

            // if viewing a month, highlight from the first to the last day of the current month
            if (this.isViewModeMonth()) {
                app.Events.trigger('change:mark', {
                    'from': app.Methods.newDate(d.year, d.month, 1),
                    'to': app.Methods.newDate(d.year, d.month, app.Methods.getDaysInMonth(this.activeDate))
                });
            }
        },

        updateMonthTitle: function () {
            var d = this.activeDate;

            this.$title.text(app.Methods.getMonthName(d) + ' ' + app.Methods.getYear(d));
        },


        // View mode ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setViewMode: function (mode) {
            app.State.viewMode = mode;

            this.setActiveDate(this.activeDate);

            this.render();
        },

        setViewModeWeek: function (e) {
            if (e) { e.preventDefault(); }

            this.setViewMode(app.constants.WEEK);

            this.highlightActiveViewModeLink($(e.currentTarget));
        },

        setViewModeMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.setViewMode(app.constants.MONTH);

            this.highlightActiveViewModeLink($(e.currentTarget));
        },

        highlightActiveViewModeLink: function () {
            var $elem;

            this.$modeLinks.removeClass('cal-mode-active');

            if (this.isViewModeWeek()) {
                $elem = this.$modeLinkWeek;
            }
            if (this.isViewModeMonth()) {
                $elem = this.$modeLinkMonth;
            }

            $elem.addClass('cal-mode-active');
        },

        isViewModeWeek: function () {
            return app.State.viewMode === app.constants.WEEK;
        },

        isViewModeMonth: function () {
            return app.State.viewMode === app.constants.MONTH;
        },

        isCurrentMonthActive: function (date) {
            var d = date || this.activeDate;

            var now = app.Methods.getObjectFromDate(app.Methods.newDate());
            var active = app.Methods.getObjectFromDate(d);

            var nowMonth = app.Methods.newDate(now.year, now.month, 1);
            var activeMonth = app.Methods.newDate(active.year, active.month, 1);

            return nowMonth.getTime() === activeMonth.getTime();
        },

        // Time-based eventing ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // work out how much time until the current minute ends.
        // Once it does, start a once-a-minute timer to update the current time line
        startClock: function () {
            var self = this;
            var newDate = new Date();
            var d = app.Methods.getObjectFromDate(newDate);
            var endOfCurrentMinute = new Date(d.year, d.month, d.day, d.hour, d.minute + 1);
            var diff = endOfCurrentMinute.getTime() - newDate.getTime();

            this.clockTimeout = this.minuteInterval = null;

            // timeout to the end of the minute
            this.clockTimeout = setTimeout(function () {
                // tick now, at the top of the minute - then once every minute from now
                app.Events.trigger('clock:tick');

                // interval for every minute
                self.minuteInterval = setInterval(function () {
                    app.Events.trigger('clock:tick');

                }, 10000); //app.constants.MS_IN_MINUTE
            }, diff);
        },

        stopMinuteTimer: function () {
            clearTimeout(this.clockTimeout);
            clearInterval(this.minuteInterval);
        },


        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        gotoNextDateRange: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoDate({
                'increment': 'next'
            });
        },

        gotoPrevDateRange: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoDate({
                'increment': 'prev'
            });
        },

        gotoToday: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoDate({
                'newDate': app.Methods.newDate()
            });
        },

        gotoDate: function (params) {
            var date;

            if (params.increment) {
                if (params.increment === 'next') {
                    date = app.Methods.getNextDateRange(this.activeDate, app.State.viewMode);

                } else if (params.increment === 'prev') {
                    date = app.Methods.getPrevDateRange(this.activeDate, app.State.viewMode);
                }

            } else if (params.newDate) {
                date = params.newDate;
            }

            this.setActiveDate(date);
            this.markDates();
        },


        setActiveDate: function (date) {
            var d;
            var newDate = app.Methods.newDate();

            if (this.isViewModeWeek()) {
                // normalise date so we're always dealing with the first day of the week
                newDate = app.Methods.getWeekStartDate(date);
            }

            // set the currentDate to the first of the month, only if
            // we are in month view mode & we're not in the current month
            // (if the latter, we want to keep today as the active date, so if
            // we switch to week mode, it highlights the correct week)
            if (this.isViewModeMonth() && !this.isCurrentMonthActive(date)) {
                d = app.Methods.getObjectFromDate(date);
                newDate = app.Methods.newDate(d.year, d.month, 1);
            }

            this.activeDate = newDate;

            this.updateAllCalendars();

            this.updateMonthTitle();
        },

        updateAllCalendars: function () {
            // this event is listened to in the week and month views, so by
            // triggering this, we prompt the calendar views to update themselves
            app.Events.trigger('change:date', this.activeDate);
        },


        // Calendar API access ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        loadApiData: function () {
            app.apiData = new app.eventCollection();

            var req = app.apiData.fetch();

            req.success(function(data) {
                app.Events.trigger('api:data', app.apiData);
            });

            req.error(function(data, othera, otherb) {
                // handle error
            });
        },


        // user events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleKeyPress: function (e) {
            var code = e.keyCode || e.which;

            // escape key
            if (code === app.constants.ESC_KEY) {
                app.Events.trigger('clear:selection');
            }
        },

        handleScroll: function (e) {
            if (this.isViewModeMonth()) {
                if (e.originalEvent.detail > 0 || e.originalEvent.wheelDelta < 0) {
                    this.gotoNextDateRange();

                } else {
                    this.gotoPrevDateRange();
                }
            }
        },

        handleMouseUp: function (e) {
            if (e) { e.preventDefault(); }

            app.Events.trigger('mouse:up');
        },


        // custom app events (see events object, at top) ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleGotoDate: function (date) {
            this.gotoDate({'newDate': date});
        },

        handleAddEvent: function (newEvent) {
            // to be flesh out, when I get to events!
            console.log('add new event from **' + newEvent.from + '** to **' + newEvent.to + '**');
            console.log('all day event: ' + (newEvent.fullday));
            console.log('~~~~~~~~~~~~~~~~');
        }
    });
})(jQuery);
var app = app || {};

$(function () {
	'use strict';

	// kick things off by creating the `App` ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	var calApp = new app.Calendar(); // self-rendering in initialize()
});
