/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    App.Methods = {

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
            var monthStart = this.newDate(d.year, d.month, 1);
            var monthEnd = this.newDate(d.year, d.month + 1, 1);
            var len = Math.round((monthEnd - monthStart) / App.Constants.MS_IN_DAY);

            // add 1 to month, then request day 0 -- gets last day of previous month
            return len;
        },


        getYear : function (date) {
            return date.getFullYear();
        },


        getMonthNum : function (date) {
            return date.getMonth();
        },


        getMonthName : function (date) {
            return App.Labels.month[date.getMonth()];
        },


        getDate : function (date) {
            return date.getDate();
        },


        // Get a particular property of a date ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        getWeekNum : function (date) {
            var date = new Date(date);

            date.setHours(0, 0, 0, 0);

            // Thursday in current week decides the year.
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);

            // January 4 is always in week 1.
            var week1 = new Date(date.getFullYear(), 0, 4);

            // Adjust to Thursday in week 1 and count number of weeks from date to week1.
            return Math.round(((date.getTime() - week1.getTime()) / App.Constants.MS_IN_DAY - 3 + (week1.getDay() + 6) % 7) / 7);
        },


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

            return (Math.ceil(daysInGrid / App.Constants.DAYS_IN_WEEK));
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
            return App.Labels.week[num];
        },


        getDayOfWeekNum : function (year, month, day) {
            var num = new Date(year, month, day).getDay();

            if (App.State.startDay === 'mon') {
                 // JS getDay() returns a sunday-0-indexed value
                num = (num + (App.Constants.DAYS_IN_WEEK - 1)) % App.Constants.DAYS_IN_WEEK;
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

            return this.newDate(d.year, d.month, d.day + (App.Constants.DAYS_IN_WEEK));
        },

        getHourAs12HourFormat : function (num) {
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

        getTimeFormatted : function (date) {
            var dateStart = this.newDate(date);
            var dateTime = new Date(date);
            var timeAsMs = dateTime.getTime() - dateStart.getTime();

            var time = timeAsMs / 1000;
            var seconds = time % 60;
            time = time / 60;
            var minutes = time % 60;
            time = time / 60;
            var hours = time % 24;
            var suffix = 'a';

            if (hours >= 12) { suffix = 'p'; }
            if (hours > 12) { hours = hours - 12; }

            return hours + ':' + this.asTwoDigits(minutes) + suffix;
        },

        getPercentDayComplete : function (date) {
            var d = this.getObjectFromDate(date);
            var dayStart = this.newDate(d.year, d.month, d.day);
            var msSinceDayStart = date.getTime() - dayStart.getTime();
            var percentComplete = (msSinceDayStart / App.Constants.MS_IN_DAY) * 100;

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

        getDaysInRangeNum : function (dateFrom, dateTo) {
            var dFrom = this.newDate(dateFrom);
            var dTo = this.newDate(dateTo);

            return Math.round((dTo.getTime() - dFrom.getTime()) / App.Constants.MS_IN_DAY);
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

            return diff === App.Constants.MS_IN_DAY;
        },


        // Date traversal ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


        getPrevDateRange : function (date, mode) {
            if (mode === App.Constants.WEEK) {
                return this.getPrevWeek(date);
            }

            if (mode === App.Constants.MONTH) {
                return this.getPrevMonth(date);
            }
        },


        getNextDateRange : function (date, mode) {
            if (mode === App.Constants.WEEK) {
                return this.getNextWeek(date);
            }

            if (mode === App.Constants.MONTH) {
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
            var dateTo = new Date(d.year, d.month + 1, 1);

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

            for (x = 0, y = App.Constants.HRS_IN_DAY; x < y; x++) {
                data.push(this.getNewTimeData(d.year, d.month, d.day, x, 0, (x * 2)));
                data.push(this.getNewTimeData(d.year, d.month, d.day, x, 30, (x * 2 + 1)));
            }

            return data;
        },


        // we want to build a full grid of days, so may need days from preceding and proceeding months
        getMonthGridData : function (date) {
            var thisMonthData = this.getMonthData(date);
            var totalBlocksInGrid = this.getRowsInMonth(date) * App.Constants.DAYS_IN_WEEK;

            var daysMissingAtFront = 0;
            var daysMissingAtEnd = 0;
            var prev;
            var prevMonthData = [];
            var next;
            var nextMonthData = [];
            var output = [];


            // TODO: refactor? - code duplication. Rework ~~~~~~~~~~~~~~~~~~~~~~~
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