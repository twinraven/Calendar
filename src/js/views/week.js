/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    App.Views.week = Backbone.View.extend({

        template: Handlebars.compile($('#week-template').html()), // for containing elem & markup
        titleTemplate: Handlebars.compile($('#day-week-title-template').html()), // for mon/tue/wed labels
        timeLabelTemplate: Handlebars.compile($('#time-label-template').html()),

        collection: App.Collections.dates,

        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            // keep track of own date, irrespective of App-wide state
            this.selfWeek = (params && params.date) || App.Methods.newDate();
            this.selfWeek = App.Methods.getWeekStartDate(this.selfWeek);
            this.weekNum = App.Methods.getWeekNum(this.selfWeek);

            this.getEventData();

            this.listenTo(App.Events, 'change:date', this.handleChangeDate);
            this.listenTo(App.Events, 'event:data', this.handleEventData);
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.$el.html(this.template({}));

            this.cacheSelectors();

            this.renderMonthName();

            this.renderDayLabels();

            this.renderTimeLabels();

            this.setWeekData();

            this.renderDates();

            this.renderAllDayEvents();

            this.renderTimedEvents();

            this.scrollTimeIntoView();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$title = this.$('.cal__title');
            this.$week = this.$('.week-days');
            this.$labels = this.$('.cal__labels');
            this.$grid = this.$('.cal__grid');
            this.$timeLabels = this.$('.time-labels');
            this.$allDayEvents = this.$('.events--fullday .events__inner');
            this.$events = this.$('.week-events');
        },

        // use template engine for this?
        renderMonthName: function () {
            var d = this.selfWeek;

            this.$title.text(App.Methods.getMonthName(d) + ' ' + App.Methods.getYear(d));
        },

        renderDayLabels: function () {
            var self = this;
            var d = App.Methods.getObjectFromDate(self.selfWeek);

            _.each(App.Labels.week, function (day, i) {
                var newDate = App.Methods.newDate(d.year, d.month, d.day + i);
                var newDateObj = App.Methods.getObjectFromDate(newDate);

                var data = {
                    'date': newDateObj.day + '/' + (newDateObj.month + 1),
                    'label': App.Labels.week[i].slice(0, 3),
                    'initial': App.Labels.week[i].slice(0, 1)
                };

                self.$labels.append(self.titleTemplate(data));
            });
        },

        renderTimeLabels: function () {
            var x = 0;
            var data = {};

            while (x < App.Constants.HRS_IN_DAY) {
                data = { 'hour': App.Methods.getHourAs12HourFormat(x) };

                this.$timeLabels.append(this.timeLabelTemplate(data));

                x++;
            }
        },

        setWeekData: function () {
            if (this.weekData) { this.weekData.reset(); }

            this.weekData = new App.Collections.dates();
            this.addWeekDataToCollection();
        },

        renderDates: function () {
            var fragment = document.createDocumentFragment();

            this.dayViews = this.weekData.map(function (day) {
                var view = new App.Views.dayInWeek({
                    model: day
                });

                fragment.appendChild(view.render());

                return view;
            }, this);

            this.$week.empty();
            this.$week.append(fragment);
        },

        // Render events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderTimedEvents: function () {
            if (this.activeDatesEventData) {
                var fragment = document.createDocumentFragment();

                var events = _.filter(this.activeDatesEventData,
                    function (event) {
                        return !event.get('custom').isFullDay;
                    });

                if (events) {
                    events.forEach(function (event) {
                        var view = new App.Views.eventInWeek({
                            model: event,
                            context: this.createContext()
                        });

                        fragment.appendChild(view.render());
                    }, this);

                    this.$events.empty();
                    this.$events.append(fragment);
                }
            }
        },

        renderAllDayEvents: function () {
            this.createEventStackAry();

            this.createEventViews();

            this.positionEvents();

            this.renderEventFragment();

            this.resizeAllDayEventsContainer();
        },

        // TODO
        createEventViews: function () {
            this.eventViews = [];

            var events = _.filter(this.activeDatesEventData,
                function (event) {
                    return event.get('custom').isFullDay;
                });

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

        // TODO
        createContext: function () {
            return {
                weekNum: this.weekNum,
                weekStartDate: this.selfWeek,
                weekEndDate: App.Methods.getWeekEndDate(this.selfWeek)
            };
        },

        // TODO
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
                event.isolatedModel.stackRow = this.findSpaceForEvent(event.isolatedModel.pos, event.isolatedModel.span);
            }, this);
        },

        // TODO
        renderEventFragment: function () {
            var fragment = document.createDocumentFragment();

            this.eventViews.forEach(function (view) {
                fragment.appendChild(view.render());
            }, this);

            this.$allDayEvents.empty();
            this.$allDayEvents.append(fragment);
        },

        resizeAllDayEventsContainer: function () {
            var containerHeight = this.$allDayEvents.height();
            var maxRows = App.Constants.MAX_ALL_DAY_EVENTS_ROWS;
            var eventHeight = App.Constants.WEEK_VIEW_GRID_HEIGHT - 2; // oops. Magic
            var fulldayEventRows = this.getHighestFullRow();

            if (fulldayEventRows > maxRows) {
                fulldayEventRows = maxRows;
            }

            this.$allDayEvents.parent().height(fulldayEventRows * eventHeight);
        },

        // position viewport ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        scrollTimeIntoView: function () {
            var now = new Date();

            if (now.getHours() >= 12 && App.Methods.isCurrentWeek(this.selfWeek)) {
                this.$grid.scrollTop(500);
            }
        },


        // Stacking/packing methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // TODO
        createEventStackAry: function () {
            var x, y;

            this.stackAry = [];

            for (x = 0, y = App.Constants.DAYS_IN_WEEK; x < y; x++) {
                this.stackAry[x] = [];
            }
        },

        // TODO
        setRowFill: function (pos, span, row) {
            var x, y;

            for (x = pos, y = (pos + span); x < y; x++) {
                this.stackAry[x][row] = true;
            }
        },

        // TODO
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

        // TODO
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

        // TODO
        findSpaceForEvent: function (pos, span) {
            var row = 0;

            while (!this.hasSpaceInRow(pos, span, row)) {
              row++;
            }

            this.setRowFill(pos, span, row);

            return row;
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        addWeekDataToCollection: function () {
            // load data
            var data = App.Methods.getWeekData(this.selfWeek);

            data.map(function (d) {
                this.weekData.add(d);
            }, this);
        },

        getEventData: function () {
            if (App.eventData) {
                var firstDay = this.selfWeek;
                var lastDay = App.Methods.getWeekEndDate(this.selfWeek);

                this.activeDatesEventData = App.eventData.filter(function (event) {
                    var data = event.get('custom');

                    return ((data.startDateTime <= firstDay && data.endDateTime > firstDay)
                        || (data.startDateTime >= firstDay && data.startDateTime < lastDay));
                });
            }
        },


        // event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleChangeDate: function (date) {
            // normalise date so we're always dealing with the first day of the week
            var newDate = App.Methods.getWeekStartDate(date);

            this.selfWeek = App.Methods.getWeekStartDate(newDate);

            this.weekNum = App.Methods.getWeekNum(this.selfWeek);

            this.getEventData();

            this.render();
        },

        handleEventData: function () {
            this.getEventData();

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