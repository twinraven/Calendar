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
        fullDayTemplate: Handlebars.compile($('#fullday-link-template').html()),

        collection: App.Collections.dates,

        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            // keep track of own date, irrespective of App-wide state
            this.selfWeek = (params && params.date) || App.Methods.newDate();
            this.selfWeek = App.Methods.getWeekStartDate(this.selfWeek);
            this.weekNum = App.Methods.getWeekNum(this.selfWeek);

            this.getEventData();

            // mixin common event methods here
            _.extend(App.Views.week.prototype, App.Methods.Events);

            this.listenTo(App.Events, 'event:data', this.handleEventData);
            this.listenTo(App.Events, 'change:date', this.handleChangeDate);
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderElem();

            this.cacheSelectors();

            this.renderMonthName();

            this.renderLabels();

            this.setWeekData();

            this.renderDates();

            this.renderFullDayLinks();

            this.renderEvents();

            this.scrollTimeIntoView();

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderElem: function () {
            this.$el.html(this.template({}));
        },

        cacheSelectors: function () {
            this.$title = this.$('.cal__title');
            this.$week = this.$('.week-days');
            this.$labels = this.$('.cal__labels');
            this.$grid = this.$('.cal__grid');
            this.$timeLabels = this.$('.time-labels');
            this.$allDayEvents = this.$('.events--fullday .events__inner');
            this.$allDayLinks = this.$('.events__days');
            this.$events = this.$('.week-events');
        },

        // use template engine for this?
        renderMonthName: function () {
            var d = this.selfWeek;

            this.$title.text(App.Methods.getMonthName(d) + ' ' + App.Methods.getYear(d));
        },

        renderLabels: function () {
            this.renderDayLabels();
            this.renderTimeLabels();
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

        renderFullDayLinks: function () {
            var fragment = document.createDocumentFragment();

            this.dayViews = this.weekData.map(function (day) {
                var view = new App.Views.fullDayLink({
                    model: day
                });

                fragment.appendChild(view.render());

                return view;
            }, this);

            this.$allDayLinks.empty();
            this.$allDayLinks.append(fragment);
        },

        // Render events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderEvents: function () {
            this.renderAllDayEvents();
            this.renderTimedEvents();
        },

        renderTimedEvents: function () {
            if (this.activeDatesEventData) {
                var fragment = document.createDocumentFragment();

                var events = _.filter(this.activeDatesEventData,
                    function (event) {
                        return !event.get('custom').isFullDay;
                    });

                if (events) {
                    events.forEach(function (event) {
                        var context = this.createContext();
                        var custom = event.get('custom');

                        var view = new App.Views.eventInWeek({
                            model: event,
                            context: context
                        });

                        fragment.appendChild(view.render());

                        // if the start and end times are on different days, we need to show 2 date
                        // blocks: one for the end of the first day, the second for the start
                        // of the next. Only do this for dates before the last day of the week
                        if (custom.isSplitDate &&
                            custom.startDateTime.getDay() < 6) {

                            view = new App.Views.eventInWeek({
                                model: event,
                                isEndOfSplitDate: true,
                                context: context
                            });

                            fragment.appendChild(view.render());
                        }
                    }, this);

                    this.$events.empty();
                    this.$events.append(fragment);
                }
            }
        },

        createContext: function () {
            return {
                weekNum: this.weekNum,
                weekStartDate: this.selfWeek,
                weekEndDate: App.Methods.getWeekEndDate(this.selfWeek)
            };
        },

        renderAllDayEvents: function () {
            // external methods - see App.Methods.Events
            this.createEventStackAry();
            this.createEventViews({ 'type': 'fullday' });
            this.positionEvents();
            this.renderEventFragment(this.$allDayEvents);

            this.resizeAllDayEventsContainer();
        },

        resizeAllDayEventsContainer: function () {
            var containerHeight = this.$allDayEvents.height();
            var maxRows = App.Constants.MAX_ALL_DAY_EVENTS_ROWS;
            var eventHeight = App.Constants.WEEK_VIEW_GRID_HEIGHT - 1; // oops. Magic
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