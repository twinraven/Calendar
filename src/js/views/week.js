/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    App.Views.week = Backbone.View.extend({

        // templating and setup
        template: _.template($('#week-template').html()), // for containing elem & markup
        titleTemplate: _.template($('#day-week-title-template').html()), // for mon/tue/wed labels
        timeLabelTemplate: _.template($('#time-label-template').html()),

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

        renderAllDayEvents: function () {
            this.renderEvents('event', this.$allDayEvents, function (event) {
                return event.get('custom').isFullDay;
            });

            this.resizeAllDayEventsContainer();
        },

        renderTimedEvents: function () {
            this.renderEvents('eventInWeek', this.$events, function (event) {
                return !event.get('custom').isFullDay;
            });
        },


        renderEvents: function (eventView, $eventsElem, filterFn) {
            if (this.activeDatesEventData) {
                var fragment = document.createDocumentFragment();

                var events = _.filter(this.activeDatesEventData, filterFn);

                if (events) {
                    events.forEach(function (event) {
                        event.attributes.custom.parentWeekNum = this.weekNum;
                        event.attributes.custom.parentWeekStartDate = this.selfWeek;
                        event.attributes.custom.parentWeekEndDate = App.Methods.getWeekEndDate(this.selfWeek);

                        var view = new App.Views[eventView]({
                            model: event
                        });

                        fragment.appendChild(view.render());
                    }, this);

                    $eventsElem.empty();
                    $eventsElem.append(fragment);
                }
            }
        },

        resizeAllDayEventsContainer: function () {
            var containerHeight = this.$allDayEvents.height();
            var maxHeight = App.Constants.MAX_ALL_DAY_EVENTS_HEIGHT;
            var eventsHeight;

            this.$allDayEvents.find('.event').each(function () {
                var thisHeight = $(this).outerHeight();

                if (thisHeight > containerHeight) {
                    eventsHeight = thisHeight;
                }
            });

            eventsHeight = (eventsHeight > maxHeight) ? maxHeight : eventsHeight;

            if (eventsHeight > containerHeight) {
                this.$allDayEvents.parent().height(eventsHeight + 1);
            }
        },

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