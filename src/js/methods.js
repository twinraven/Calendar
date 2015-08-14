/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // Reusable methods across views ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //
    App.Methods = {

        // Event-specific methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //
        Events: {

            // Creating a stacking context for all-day events  ~~~~~~~

            createEventStackAry: function () {
                var x, y;

                this.stackAry = [];

                for (x = 0, y = App.Constants.DAYS_IN_WEEK; x < y; x++) {
                    this.stackAry[x] = [];
                }
            },


            setRowFill: function (event, pos, span, row) {
                var x, y;

                for (x = pos, y = (pos + span); x < y; x++) {
                    this.stackAry[x][row] = event.model;
                }
            },


            hasSpaceInRow: function (pos, span, row) {
                var x, y;
                var output = true;

                for (x = pos, y = (pos + span); x < y; x++) {
                    if (this.stackAry[x][row]) {
                        output = false;
                    }
                }

                return output;
            },


            getHighestFullRow: function () {
                var x, y;
                var highest = 0;

                for (x = 0, y = App.Constants.DAYS_IN_WEEK; x < y; x++) {
                    var len = this.stackAry[x].length;

                    if (len > highest) {
                        highest = len;
                    }
                }

                return highest;
            },

            isColTallerThanMax: function (col) {
                var colHeight = this.getEventTotalInCol(col);

                return colHeight > App.Constants.MAX_EVENT_ROWS_IN_MONTH;
            },

            getEventTotalInCol: function (col) {
                return this.stackAry[col].length;
            },

            findSpaceForEvent: function (event, pos, span) {
                var row = 0;

                while (!this.hasSpaceInRow(pos, span, row)) {
                  row++;
                }

                this.setRowFill(event, pos, span, row);

                return row;
            },

            // Rendering event views ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

            createEventViews: function (props) {
                this.eventViews = [];

                var events;

                if (props.type === 'fullday') {
                    events = _.filter(this.activeDatesEventData,
                        function (event) {
                            return event.get('custom').isFullDay;
                        });

                } else {
                    events = _.clone(this.activeDatesEventData);
                }

                if (events) {
                    this.eventViews = events.map(function (event) {
                        var view = new App.Views.eventInMonth({
                            model: event,
                            context: this.createContext()
                        });

                        return view;
                    }, this);
                }
            },


            positionEvents: function () {
                // re-order to put the longer-running events first
                this.eventViews.sort(function (a, b) {
                    return b.model.attributes.custom.span - a.model.attributes.custom.span;
                });

                // then, make sure that full-day events are ahead of timed events in the list
                // (will still maintain the key order above though)
                this.eventViews.sort(function (a, b) {
                    return b.model.attributes.custom.isFullDay - a.model.attributes.custom.isFullDay;
                });

                // finally, calculate the position of each event, using our stacking algorithm
                // (if that's what it is? It's pretty faaancy)
                this.eventViews.forEach(function (event) {
                    event.isolatedModel.stackRow = this.findSpaceForEvent(event, event.isolatedModel.pos, event.isolatedModel.span);
                }, this);
            },


            renderEventFragment: function ($elem) {
                var fragment = document.createDocumentFragment();

                this.eventViews.forEach(function (view) {
                    fragment.appendChild(view.render());
                }, this);

                $elem.empty();
                $elem.append(fragment);
            }
        },


        // Basic date methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //
        // TODO: REFACTOR!
        // could move into App.Methods.Dates -- but rather ugly interface
        // for a v. highly used collection of methods.
        // Possibilities:
        //
        // a) extend root View (and Collection?) to include these methods -- then just refer to this.Dates.XX
        // b) Create own root View, with methods baked in, then all views are extension of this
        // c) cache method collection as this.Dates, from the init function in each view
        //

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


        getDaysInMonth: function (date) {
            var d = this.getObjectFromDate(date);
            var monthStart = this.newDate(d.year, d.month, 1);
            var monthEnd = this.newDate(d.year, d.month + 1, 1);
            var len = Math.round((monthEnd - monthStart) / App.Constants.MS_IN_DAY);

            // add 1 to month, then request day 0 -- gets last day of previous month (i.e. this month)
            return len;
        },


        getYear: function (date) {
            return date.getFullYear();
        },


        getMonthNum: function (date) {
            return date.getMonth();
        },


        getMonthName: function (date) {
            return App.Labels.month[date.getMonth()];
        },


        getDate: function (date) {
            return date.getDate();
        },


        // Get a particular property of a date ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        getWeekNum: function (date) {
            var date = new Date(date);

            date.setHours(0, 0, 0, 0);

            // Thursday in current week decides the year.
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);

            // January 4 is always in week 1.
            var week1 = new Date(date.getFullYear(), 0, 4);
            var week = Math.round(((date.getTime() - week1.getTime()) / App.Constants.MS_IN_DAY - 3 + (week1.getDay() + 6) % 7) / 7);
            var year = date.getFullYear();

            // Adjust to Thursday in week 1 and count number of weeks from date to week1.
            return Number(year + '.' + week).toFixed(2); // results in number with decimal: e.g. 2015.43
        },


        getObjectFromDate: function (date) {
            return {
                year:   date.getFullYear(),
                month:  date.getMonth(),
                day:    date.getDate(),
                hour:  date.getHours(),
                minute:   date.getMinutes()
            };
        },


        getRowsInMonth: function (date) {
            var daysInGrid = this.getDaysInMonth(date) + this.getMonthStartDayNum(date);

            return (Math.ceil(daysInGrid / App.Constants.DAYS_IN_WEEK));
        },


        getNewDateId: function (date) {
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


        getOrdinalSuffix: function (num) {
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


        asTwoDigits: function (num) {
            return ('0' + num).slice(-2);
        },

        getDayOfWeekName: function (num) {
            return App.Labels.week[num];
        },


        getDayOfWeekNum: function (date, year, month, day) {
            var num;

            // allows us to either pass in a date object as-is, or specify an exact date
            if (date) {
                num = date.getDay();
            } else {
                num = new Date(year, month, day).getDay();
            }

            if (App.State.startDay === 'mon') {
                 // JS getDay() returns a sunday-0-indexed value
                num = (num + (App.Constants.DAYS_IN_WEEK - 1)) % App.Constants.DAYS_IN_WEEK;
            }

            return num;
        },

        // returns a number 0-6 for day of week
        getMonthStartDayNum: function (date) {
            var d = this.getObjectFromDate(date);

            return this.getDayOfWeekNum(null, d.year, d.month, 1);
        },


        getWeekStartDate: function (date) {
            var d = this.getObjectFromDate(date);
            var dayNum = this.getDayOfWeekNum(date);

            return this.newDate(d.year, d.month, d.day - dayNum);
        },


        getDuration: function (startDate, endDate) {
            var diff = endDate.getTime() - startDate.getTime();

            return {
                days: diff / App.Constants.MS_IN_DAY,
                hours:  diff / App.Constants.MS_IN_DAY * App.Constants.HRS_IN_DAY
            };
        },


        getWeekEndDate: function (date) {
            var weekStartDate = this.getWeekStartDate(date);
            var d = this.getObjectFromDate(weekStartDate);

            return this.newDate(d.year, d.month, d.day + (App.Constants.DAYS_IN_WEEK));
        },

        getHourAs12HourFormat: function (num) {
            var suffix = 'am';
            var hrs = Math.floor(num);
            var mins = num > hrs ? ':' + ((num - hrs) * 60) : '';

            if (hrs === 0) {
                hrs = 12;

            } else if (hrs > 12) {
                hrs = hrs - 12;
                suffix = 'pm';
            }

            return hrs + mins + suffix;
        },

        getHrsBetween: function (dateFrom, dateTo) {
            var from = new Date(dateFrom);
            var to = new Date(dateTo);
            var difference = to - from;

            return difference / App.Constants.MS_IN_HR;
        },

        getTimeFormatted: function (date) {
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
            if (Math.floor(hours) > 12) { hours = hours - 12; }

            return Math.floor(hours) + ':' + this.asTwoDigits(minutes) + suffix;
        },

        getPercentDayComplete: function (date) {
            var d = this.getObjectFromDate(date);
            var dayStart = this.newDate(d.year, d.month, d.day);
            var msSinceDayStart = date.getTime() - dayStart.getTime();
            var percentComplete = (msSinceDayStart / App.Constants.MS_IN_DAY) * 100;

            return percentComplete;
        },

        getTimeMinsLater: function (mins, time) {
            var d = this.getObjectFromDate(time);
            var later = new Date(d.year, d.month, d.day, d.hour, d.minute + mins);

            return later;
        },

        getDateTomorrow: function (date) {
            var d = this.getObjectFromDate(date);
            var tomorrow = this.newDate(d.year, d.month, d.day + 1);

            return tomorrow;
        },

        getDaysInRangeNum: function (dateFrom, dateTo) {
            var dFrom = new Date(dateFrom);
            var dTo = new Date(dateTo);
            var tzOffsetDifference = dFrom.getTimezoneOffset() - dTo.getTimezoneOffset();
            var diff = dTo.getTime() - dFrom.getTime();

            if (tzOffsetDifference !== 0) {
                diff = diff + (tzOffsetDifference * 1000 * 60);
            }

            return Math.ceil(diff / App.Constants.MS_IN_DAY);
        },

        // we tweak the end date, moving it back by 1 second --
        // so that events that end at midnight are not classes as 'split date' events,
        // where the end is on the next day
        isSameDate: function (dateA, dateB) {
            var a = new Date(dateA);
            var b = new Date(dateB);
            var bAdjusted = new Date(b.getTime() - 1000);

            return a.getDate() === bAdjusted.getDate();
        },

        isCurrentWeek: function (date) {
            var d = this.newDate(date);
            var weekStartDate = this.getWeekStartDate(d);
            var now = this.newDate();
            var currentWeekStartDate = this.getWeekStartDate(now);

            return (weekStartDate.getTime() === currentWeekStartDate.getTime());
        },

        isCurrentMonth: function (date) {
            var d = this.getObjectFromDate(this.newDate(date));
            var now = this.getObjectFromDate(this.newDate());
            var monthStartDate = this.newDate(d.year, d.month, 1);
            var currentMonthStartDate = this.newDate(now.year, now.month, 1);

            return (monthStartDate.getTime() === currentMonthStartDate.getTime());
        },

        isDateToday: function (date) {
            var now = new Date(); // not this.newDate as that creates a new data at 00:00:00
            var active = new Date(date);
            var nowDate = now.getDate();
            var activeDate = active.getDate();

            return (nowDate === activeDate);
        },

        isFullDay: function (timeFrom, timeTo) {
            var from = timeFrom.getTime();
            var to = timeTo.getTime();
            var diff = to - from;

            return diff === App.Constants.MS_IN_DAY;
        },


        // Date traversal ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


        getPrevDateRange: function (date, mode) {
            if (mode === App.Constants.WEEK) {
                return this.getPrevWeek(date);
            }

            if (mode === App.Constants.MONTH) {
                return this.getPrevMonth(date);
            }
        },


        getNextDateRange: function (date, mode) {
            if (mode === App.Constants.WEEK) {
                return this.getNextWeek(date);
            }

            if (mode === App.Constants.MONTH) {
                return this.getNextMonth(date);
            }
        },


        getNextWeek: function (date) {
            var d = this.getObjectFromDate(date);

            return new Date(d.year, d.month, d.day + 7);
        },


        getPrevWeek: function (date) {
            var d = this.getObjectFromDate(date);

            return new Date(d.year, d.month, d.day - 7);
        },


        getNextMonth: function (date) {
            var d = this.getObjectFromDate(date);

            return new Date(d.year, d.month + 1);
        },


        getPrevMonth: function (date) {
            var d = this.getObjectFromDate(date);

            return new Date(d.year, d.month - 1);
        },


        // Return array-based date collections ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        getDateRangeData: function (dateFrom, dateTo) {
            var dateFromObj = this.getObjectFromDate(dateFrom);
            var totalDays = this.getDaysInRangeNum(dateFrom, dateTo);
            var x, y;
            var data = [];

            for (x = 0, y = totalDays; x < y; x++) {
                data.push(this.getNewDayData(dateFromObj.year, dateFromObj.month, dateFromObj.day + x));
            }

            return data;
        },


        getMonthData: function (date) {
            var d = this.getObjectFromDate(date);
            var dateFrom = new Date(d.year, d.month, 1);
            var dateTo = new Date(d.year, d.month + 1, 1);

            var data = this.getDateRangeData(dateFrom, dateTo);
            return data;
        },


        getWeekData: function (date) {
            var weekStartDate = this.getWeekStartDate(date);
            var weekEndDate = this.getWeekEndDate(date);
            var data = this.getDateRangeData(weekStartDate, weekEndDate);

            return data;
        },

        getTimeData: function (date) {
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
        getMonthGridData: function (date) {
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

        getNewDayData: function (year, month, day) {
            var newDate = new Date(year, month, day);
            var d = this.getObjectFromDate(newDate);

            return {
                id: this.getNewDateId(newDate),
                day: d.day.toString(),
                month: d.month.toString(),
                monthName: this.getMonthName(newDate),
                year: d.year.toString(),
                date: newDate.toDateString(),
                suffix: this.getOrdinalSuffix(d.day),
                weekday: this.getDayOfWeekName(this.getDayOfWeekNum(newDate))
            };
        },

        getNewTimeData: function (year, month, day, hour, minute, position) {
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