/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    app.const = {
        DAYS_IN_WEEK : 7,
        MONTHS_IN_YEAR : 12
    };

    app.config = {
        startDay : "mon"
    };

    app.labels = {
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
    };

    app.cal = {
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
            var d = this.getMonthYearFrom(date);

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
            return app.labels.month[date.getMonth()];
        },

        getDate : function (date) {
            return date.getDate();
        },

        getDayOfWeekName : function (num) {
            return app.labels.week[num];
        },

        getDayOfWeekNum : function (year, month, day) {
            var num = new Date(year, month, day).getDay();

            if (app.config.startDay === "mon") {
                num = (num + (app.const.DAYS_IN_WEEK - 1)) % app.const.DAYS_IN_WEEK; // JS getDay() returns a sunday-0-indexed value
            }

            return num;
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

        // returns a number 0-6 for day of week
        getMonthStartDayNum : function (date) {
             var d = this.getMonthYearFrom(date);

            return this.getDayOfWeekNum(d.year, d.month, 1);
        },

        getMonthYearFrom : function (date) {
            return {
                year: date.getFullYear(),
                month: date.getMonth()
            };
        },

        getRowsInMonth : function (date) {
            var daysInGrid = this.getDaysInMonth(date) + this.getMonthStartDayNum(date);

            return (Math.ceil(daysInGrid / app.const.DAYS_IN_WEEK));
        },

        asTwoDigits : function (num) {
            return ('0' + num).slice(-2);
        },

        getNextMonth : function (date) {
            var d = this.getMonthYearFrom(date);

            return new Date(d.year, d.month + 1);
        },

        getPrevMonth : function (date) {
            var d = this.getMonthYearFrom(date);

            return new Date(d.year, d.month - 1);
        },

        getNewMonthData : function (date) {
            var x = 1;
            var y = this.getDaysInMonth(date);
            var data = [];
            var d = this.getMonthYearFrom(date);

            for (x, y; x <= y; x++) {
                data.push(this.getNewDayData(d.year, d.month, x));
            }

            return data;
        },

        // we want to build a full grid of days, so may need days from preceding and proceeding months
        getNewGridData : function (date) {
            var thisMonthData = this.getNewMonthData(date);
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
                prevMonthData = this.getNewMonthData(prev);
                prevMonthData = prevMonthData.slice(-daysMissingAtFront); // just the day/s we need to fill the gap
            }

            daysMissingAtEnd = totalBlocksInGrid - (thisMonthData.length + prevMonthData.length);

            if (daysMissingAtEnd > 0) {
                next = this.getNextMonth(date);
                nextMonthData = this.getNewMonthData(next);
                nextMonthData = nextMonthData.slice(0, daysMissingAtEnd); // just the day/s we need
            }
            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

            output = _.union(output, prevMonthData, thisMonthData, nextMonthData);

            return output;
        },

        getNewDateId : function (year, month, day) {
            return "" + year + '-' + this.asTwoDigits(month) + '-' + this.asTwoDigits(day);
        },

        getNewDayData : function (year, month, day) {
            var date = new Date(year, month, day);
            return {
                id : this.getNewDateId(year, month + 1, day),
                day : day.toString(),
                month: month.toString(),
                monthName: this.getMonthName(date),
                year: year.toString(),
                date: date.toDateString(),
                suffix: this.getOrdinalSuffix(day),
                weekday : this.getDayOfWeekName(this.getDayOfWeekNum(year, month, day))
            };
        }
    };
})(jQuery);