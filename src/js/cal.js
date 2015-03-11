/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    app.cal = {
        labels : {
            week : [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            month: [
                "January",
                "Febuary",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
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

            newDate = new (Date.bind.apply(Date, args));
            newDate.setHours(0,0,0,0); // remove chance of GMT weirdness

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
            return app.cal.labels.month[date.getMonth()];
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

            return (Math.ceil(daysInGrid / app.const.DAYS_IN_WEEK));
        },


         getNewDateId : function (date) {
            var d = new Date(date);

            return "" +
                    d.getFullYear() +
                    '-' +
                    this.asTwoDigits(d.getMonth() + 1) +
                    '-' +
                    this.asTwoDigits(d.getDate()) +
                    'T' +
                    this.asTwoDigits(d.getHours()) +
                    ':' +
                    this.asTwoDigits(d.getMinutes()) +
                    ':00';
        },


        getOrdinalSuffix : function (num) {
            var dec = num % 10,
                cent = num % 100;

            if (dec == 1 && cent != 11) {
                return "st";
            }

            if (dec == 2 && cent != 12) {
                return "nd";
            }

            if (dec == 3 && cent != 13) {
                return "rd";
            }

            return "th";
        },


        asTwoDigits : function (num) {
            return ('0' + num).slice(-2);
        },

        getDayOfWeekName : function (num) {
            return app.cal.labels.week[num];
        },


        getDayOfWeekNum : function (year, month, day) {
            var num = new Date(year, month, day).getDay();

            if (app.state.startDay === "mon") {
                 // JS getDay() returns a sunday-0-indexed value
                num = (num + (app.const.DAYS_IN_WEEK - 1)) % app.const.DAYS_IN_WEEK;
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

            return this.newDate(d.year, d.month, d.day + (app.const.DAYS_IN_WEEK - 1));
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

        isCurrentWeek : function (date) {
            var d = this.newDate(date);
            var weekStartDate = this.getWeekStartDate(d);
            var now = this.newDate();
            var currentWeekStartDate = this.getWeekStartDate(now);

            return (weekStartDate.getTime() === currentWeekStartDate.getTime());
        },


        // Date traversal ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


        getPrevDateRange : function (date, mode) {
            if (mode == app.const.WEEK) {
                return this.getPrevWeek(date);
            }

            if (mode == app.const.MONTH) {
                return this.getPrevMonth(date);
            }
        },


        getNextDateRange : function (date, mode) {
            if (mode == app.const.WEEK) {
                return this.getNextWeek(date);
            }

            if (mode == app.const.MONTH) {
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

            return Math.ceil((dTo.getTime() - dFrom.getTime()) / app.const.MS_IN_DAY) + 1;
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

            for (x = 0, y = app.const.HRS_IN_DAY; x < y; x++) {
                data.push(this.getNewTimeData(d.year, d.month, d.day, x, 0, (x * 2)));
                data.push(this.getNewTimeData(d.year, d.month, d.day, x, 30, (x * 2 + 1)));
            }

            return data;
        },


        // we want to build a full grid of days, so may need days from preceding and proceeding months
        getMonthGridData : function (date) {
            var thisMonthData = this.getMonthData(date);
            var totalBlocksInGrid = this.getRowsInMonth(date) * app.const.DAYS_IN_WEEK;

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