/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.view = Backbone.View.extend({
        el: '#container',

        template: _.template($('#block-template').html()),

        // At initialization we bind to the relevant events on the `Todos`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved in *localStorage*.
        initialize: function () {
            // this.xxx - cache selectors

            // bind to change events in model/collection
            //this.listenTo(app.collection, 'custom', this.method);

            // load data
            // app.collection.fetch({reset: true});
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {
            var self = this;
            var now = app.cal.getMonthAndYearFromDate(new Date());
            
            var data = app.cal.createGridData(now.year, now.month);

            data.map(function(d) {
                self.$el.append(self.template(d));
            });

            return this;
        },

        method: function () {
            // custom method
        }
    });
})(jQuery);

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

    nextMonth : function (year, month) {
        return new Date(year, month + 1);
    },

    prevMonth : function (year, month) {
        return new Date(year, month - 1);
    },

    createDateId : function (year, month, day) {
        return "" + year + this.asTwoDigits(month) + this.asTwoDigits(day);
    },

    createGridData : function (year, month) {
        var monthData = this.createMonthData(year, month);
        var missingFromStart = this.getMonthStartDayNum(year, month);
        var prevMonth;
        var prevMonthData = [];
        var missingFromEnd;
        var nextMonth;
        var nextMonthData = [];
        var data = [];

        if (missingFromStart > 0) {
            prevMonth = this.prevMonth(year, month);
            prevMonthData = this.createMonthData(prevMonth.getYear(), prevMonth.getMonth());
            prevMonthData = prevMonthData.slice(-missingFromStart);
        }

        missingFromEnd = (this.getRowsInMonth(year, month) * app.const.DAYS_IN_WEEK) - (monthData.length + prevMonthData.length);

        if (missingFromEnd > 0) {
            nextMonth = this.nextMonth(year, month);
            nextMonthData = this.createMonthData(nextMonth.getYear(), nextMonth.getMonth());
            
            nextMonthData = nextMonthData.slice(0, missingFromEnd);
        }

        data = _.union(data, prevMonthData, monthData, nextMonthData);

        return data;
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