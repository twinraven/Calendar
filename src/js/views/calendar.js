/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Calendar = Backbone.View.extend({
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

            this.setActiveDate(App.Methods.newDate());

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
            this.listenTo(App.Events, 'add:event', this.handleAddEvent);
            this.listenTo(App.Events, 'goto:date', this.handleGotoDate);

            // DOM/user events
            this.$body.on('DOMMouseScroll mousewheel', _.debounce(function(e) { self.handleScroll(e); }, 50));
            this.$body.on('keydown', function (e) { self.handleKeyPress.call(self, e); });
        },

        initializeSubViews: function () {
            // summary -- sidebar mini-calendar
            // always initialize this, as it is permanent. View used in main panel is changeable,
            // so this is handled in assignViews (called from .render())
            this.summaryView = new App.Views.monthInSummary({
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
                this.mainView = new App.Views.week({
                    date: this.activeDate
                });
            }

            if (this.isViewModeMonth()) {
                this.mainView = new App.Views.monthInFull({
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
            var d = App.Methods.getObjectFromDate(this.activeDate);

            // if viewing a week, highlight from the first to the last day of the current week
            if (this.isViewModeWeek()) {
                App.Events.trigger('change:mark', {
                    'from': App.Methods.getWeekStartDate(this.activeDate),
                    'to': App.Methods.getWeekEndDate(this.activeDate)
                });
            }

            // if viewing a month, highlight from the first to the last day of the current month
            if (this.isViewModeMonth()) {
                App.Events.trigger('change:mark', {
                    'from': App.Methods.newDate(d.year, d.month, 1),
                    'to': App.Methods.newDate(d.year, d.month, App.Methods.getDaysInMonth(this.activeDate))
                });
            }
        },

        updateMonthTitle: function () {
            var d = this.activeDate;

            this.$title.text(App.Methods.getMonthName(d) + ' ' + App.Methods.getYear(d));
        },


        // View mode ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setViewMode: function (mode) {
            App.State.viewMode = mode;

            this.setActiveDate(this.activeDate);

            this.render();
        },

        setViewModeWeek: function (e) {
            if (e) { e.preventDefault(); }

            this.setViewMode(App.constants.WEEK);

            this.highlightActiveViewModeLink($(e.currentTarget));
        },

        setViewModeMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.setViewMode(App.constants.MONTH);

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
            return App.State.viewMode === App.constants.WEEK;
        },

        isViewModeMonth: function () {
            return App.State.viewMode === App.constants.MONTH;
        },

        isCurrentMonthActive: function (date) {
            var d = date || this.activeDate;

            var now = App.Methods.getObjectFromDate(App.Methods.newDate());
            var active = App.Methods.getObjectFromDate(d);

            var nowMonth = App.Methods.newDate(now.year, now.month, 1);
            var activeMonth = App.Methods.newDate(active.year, active.month, 1);

            return nowMonth.getTime() === activeMonth.getTime();
        },

        // Time-based eventing ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // work out how much time until the current minute ends.
        // Once it does, start a once-a-minute timer to update the current time line
        startClock: function () {
            var self = this;
            var newDate = new Date();
            var d = App.Methods.getObjectFromDate(newDate);
            var endOfCurrentMinute = new Date(d.year, d.month, d.day, d.hour, d.minute + 1);
            var diff = endOfCurrentMinute.getTime() - newDate.getTime();

            this.clockTimeout = this.minuteInterval = null;

            // timeout to the end of the minute
            this.clockTimeout = setTimeout(function () {
                // tick now, at the top of the minute - then once every minute from now
                App.Events.trigger('clock:tick');

                // interval for every minute
                self.minuteInterval = setInterval(function () {
                    App.Events.trigger('clock:tick');

                }, 10000); //App.constants.MS_IN_MINUTE
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
                'newDate': App.Methods.newDate()
            });
        },

        gotoDate: function (params) {
            var date;

            if (params.increment) {
                if (params.increment === 'next') {
                    date = App.Methods.getNextDateRange(this.activeDate, App.State.viewMode);

                } else if (params.increment === 'prev') {
                    date = App.Methods.getPrevDateRange(this.activeDate, App.State.viewMode);
                }

            } else if (params.newDate) {
                date = params.newDate;
            }

            this.setActiveDate(date);
            this.markDates();
        },


        setActiveDate: function (date) {
            var d;
            var newDate = App.Methods.newDate();

            if (this.isViewModeWeek()) {
                // normalise date so we're always dealing with the first day of the week
                newDate = App.Methods.getWeekStartDate(date);
            }

            // set the currentDate to the first of the month, only if
            // we are in month view mode & we're not in the current month
            // (if the latter, we want to keep today as the active date, so if
            // we switch to week mode, it highlights the correct week)
            if (this.isViewModeMonth() && !this.isCurrentMonthActive(date)) {
                d = App.Methods.getObjectFromDate(date);
                newDate = App.Methods.newDate(d.year, d.month, 1);
            }

            this.activeDate = newDate;

            this.updateAllCalendars();

            this.updateMonthTitle();
        },

        updateAllCalendars: function () {
            // this event is listened to in the week and month views, so by
            // triggering this, we prompt the calendar views to update themselves
            App.Events.trigger('change:date', this.activeDate);
        },


        // Calendar API access ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        loadApiData: function () {
            App.apiData = new App.Collections.events();

            var req = App.apiData.fetch();

            req.success(function(data) {
                App.Events.trigger('api:data', App.apiData);
            });

            req.error(function(data, othera, otherb) {
                // handle error
            });
        },


        // user events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleKeyPress: function (e) {
            var code = e.keyCode || e.which;

            // escape key
            if (code === App.constants.ESC_KEY) {
                App.Events.trigger('clear:selection');
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

            App.Events.trigger('mouse:up');
        },


        // custom App events (see events object, at top) ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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