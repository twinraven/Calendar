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
        ]
    };

    app.cal = {
        getDaysInMonth : function (year, month) {
            // add 1 to month, then request day 0 -- gets last day of previous month
            return new Date(year, month + 1, 0).getDate();
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

        // returns a number 0-6 for day of week
        getMonthStartDayNum : function (year, month) {
            return this.getDayOfWeekNum(year, month, 1);
        },

        getMonthAndYearFromDate : function (date) {
            return {
                month: date.getMonth(),
                year: date.getFullYear()
            };
        },

        getRowsInMonth : function (year, month) {
            var daysInGrid = this.getDaysInMonth(year, month) + this.getMonthStartDayNum(year, month);

            return (Math.ceil(daysInGrid / app.const.DAYS_IN_WEEK));
        },

        asTwoDigits : function (num) {
            return ("0" + num).slice(-2);
        },

        incrementWithinLimit : function (num, limit) {
            if (num + 1 >= limit) { return 0; }

            return num + 1;
        },

        getNextMonth : function (year, month) {
            return new Date(year, month + 1);
        },

        getPrevMonth : function (year, month) {
            return new Date(year, month - 1);
        },

        createDateId : function (year, month, day) {
            return "" + year + this.asTwoDigits(month) + this.asTwoDigits(day);
        },

        // we want to build a full grid of days, so may need days from preceding and proceeding months
        createGridData : function (year, month) {

            var thisMonthData = this.createMonthData(year, month);
            var totalBlocksInGrid = this.getRowsInMonth(year, month) * app.const.DAYS_IN_WEEK;

            var daysMissingAtFront = 0;
            var daysMissingAtEnd = 0;
            var prev;
            var prevMonthData = [];
            var next;
            var nextMonthData = [];
            var output = [];

            daysMissingAtFront = this.getMonthStartDayNum(year, month);

            if (daysMissingAtFront > 0) {
                prev = this.getPrevMonth(year, month);
                prevMonthData = this.createMonthData(prev.getYear(), prev.getMonth());
                prevMonthData = prevMonthData.slice(-daysMissingAtFront); // just the day/s we need to fill the gap
            }

            daysMissingAtEnd = totalBlocksInGrid - (thisMonthData.length + prevMonthData.length);

            if (daysMissingAtEnd > 0) {
                next = this.getNextMonth(year, month);
                nextMonthData = this.createMonthData(next.getYear(), next.getMonth());

                nextMonthData = nextMonthData.slice(0, daysMissingAtEnd); // just the day/s we need
            }

            output = _.union(output, prevMonthData, thisMonthData, nextMonthData);

            return output;
        },

        createMonthData : function (year, month) {
            var x = 1;
            var y = this.getDaysInMonth(year, month);
            var data = [];

            for (x, y; x <= y; x++) {
                data.push(this.createDayData(year, month, x));
            }

            return data;
        },

        createDayData : function (year, month, day) {
            return {
                id : this.createDateId(year, month + 1, day),
                num : day.toString(),
                month: month.toString(),
                year: year.toString(),
                weekday : this.getDayOfWeekName(this.getDayOfWeekNum(year, month, day))
            };
        }
    };
})(jQuery);