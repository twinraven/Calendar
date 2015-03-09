/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.appView = Backbone.View.extend({
        el: '#app',

        // Events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //
        events: {
            'click .prev-all': 'gotoPrevDateRange',
            'click .next-all': 'gotoNextDateRange',
            'click .home-all': 'gotoToday',

            'click .cal-mode-week': 'setViewModeWeek',
            'click .cal-mode-month': 'setViewModeMonth'
        },


        // Init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {
            var self = this;

            this.cacheSelectors();
            this.bindEvents();

            // load state & dates from local storage (inc. viewMode)
            //

            this.highlightActiveViewModeLink(this.$('.cal-mode-week'));

            this.setActiveDate(app.cal.newDate());

            this.initializeSubViews();

            this.render();
        },


        // Init methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$body = $('body');
            this.$title = this.$('.title-all');
            this.$modeLinks = this.$('.cal-mode');
        },

        bindEvents: function () {
            var self = this;

            // custom events
            app.events.bind('add:event', function (event) { self.handleAddEvent(event) });
            app.events.bind('goto:date', function (date) { self.handleDateChange(date) });

            // DOM/user events
            this.$body.on('DOMMouseScroll mousewheel', function (e) { self.handleScroll.call(self, e) });
            this.$body.on('keydown', function (e) { self.handleKeyPress.call(self, e); });
        },

        initializeSubViews: function () {
            // summary -- sidebar mini-calendar
            // always initialize this, as it is permanent. View used in main panel is changeable,
            // so this is handled in assignViews (called from .render())
            this.summaryView = new app.monthSummaryView({
                dayTemplate: '#day-summary-template'
            });
        },


        // Rendering & data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderMonthName();

            this.assignViews();

            this.markDates();

            return this.el;
        },


        // Rendering methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderMonthName: function () {
            var d = this.activeDate;

            this.$title.text(app.cal.getMonthName(d) + " " + app.cal.getYear(d));
        },

        assignViews: function () {
            // it a view has already been assigned, call its custom 'close' method now
            // to safely & thoroughly unbind/remove all listeners & elements
            if (this.mainView) {
                this.mainView.close();
            }

            if (this.isViewModeWeek()) {
                this.mainView = new app.weekView();
            }

            if (this.isViewModeMonth()) {
                this.mainView = new app.monthMainView(({
                    dayTemplate: '#day-main-template'
                }));
            }

            this.assign(this.summaryView, '#cal-summary');
            this.assign(this.mainView, '#cal-main');
        },

        assign: function (view, selector) {
            // using .setElement as it minimises DOM thrashing when re-rendering existing elements
            view.setElement(this.$(selector)).render();
        },

        markDates: function () {
            var d = app.cal.getObjectFromDate(this.activeDate);

            // if viewing a week, highlight from the first to the last day of the current week
            if (this.isViewModeWeek()) {
                app.events.trigger('change:mark', {
                    'from': app.cal.getWeekStartDate(this.activeDate),
                    'to': app.cal.getWeekEndDate(this.activeDate)
                });
            }

            // if viewing a month, highlight from the first to the last day of the current month
            if (this.isViewModeMonth()) {
                app.events.trigger('change:mark', {
                    'from': app.cal.newDate(d.year, d.month, 1),
                    'to': app.cal.newDate(d.year, d.month, app.cal.getDaysInMonth(this.activeDate))
                });
            }
        },


        // View mode ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setViewMode: function (mode) {
            app.state.viewMode = mode;

            this.setActiveDate(this.activeDate);

            this.render();
        },

        setViewModeWeek: function (e) {
            if (e) { e.preventDefault(); }

            this.highlightActiveViewModeLink($(e.currentTarget));

            this.setViewMode(app.const.WEEK);
        },

        setViewModeMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.highlightActiveViewModeLink($(e.currentTarget));

            this.setViewMode(app.const.MONTH);
        },

        highlightActiveViewModeLink: function ($elem) {
            this.$modeLinks.removeClass('cal-mode-active');
            $elem.addClass('cal-mode-active');
        },

        isViewModeWeek: function () {
            return app.state.viewMode === app.const.WEEK;
        },

        isViewModeMonth: function () {
            return app.state.viewMode === app.const.MONTH;
        },

        isCurrentMonthActive: function (date) {
            var d = date || this.activeDate;

            var now = app.cal.getObjectFromDate(app.cal.newDate());
            var active = app.cal.getObjectFromDate(d);

            var nowMonth = app.cal.newDate(now.year, now.month, 1);
            var activeMonth = app.cal.newDate(active.year, active.month, 1);

            return nowMonth.getTime() === activeMonth.getTime();
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
                'newDate': app.cal.newDate()
            });
         },

         gotoDate: function (params) {
            var date;

            if (params.increment) {
                if (params.increment === 'next') {
                    date = app.cal.getNextDateRange(this.activeDate, app.state.viewMode);

                } else if (params.increment === 'prev') {
                    date = app.cal.getPrevDateRange(this.activeDate, app.state.viewMode);
                }

            } else if (params.newDate) {
                date = params.newDate;
            }

            this.setActiveDate(date);
            this.markDates();
        },


        setActiveDate: function (date) {
            var d;
            var newDate = app.cal.newDate();

            if (this.isViewModeWeek()) {
                // normalise date so we're always dealing with the first day of the week
                newDate = app.cal.getWeekStartDate(date);
            }

            // set the currentDate to the first of the month, only if
            // we are in month view mode & we're not in the current month
            // (if the latter, we want to keep today as the active date, so if
            // we switch to week mode, it highlights the correct week)
            if (this.isViewModeMonth() && !this.isCurrentMonthActive(date)) {
                d = app.cal.getObjectFromDate(date);
                newDate = app.cal.newDate(d.year, d.month, 1);
            }

            this.activeDate = newDate;

            this.updateAllCalendars();
        },

        updateAllCalendars: function () {
            // this event is listened to in the week and month views, so by
            // triggering this, we prompt the calendar views to update themselves
            app.events.trigger('change:date', this.activeDate);
        },


        // user events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleKeyPress: function (e) {
            var code = e.keyCode || e.which;

            // escape key
            if (code === app.const.ESC_KEY) {
                app.events.trigger('clear:selection');
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


        // custom app events (see events object, at top) ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleDateChange: function (date) {
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