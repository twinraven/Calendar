/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Calendar = Backbone.View.extend({
        el: '#app',

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Events
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        events: {
            'click .control__link--prev': 'gotoPrevDateRange',
            'click .control__link--next': 'gotoNextDateRange',
            'click .control__link--today': 'gotoToday',
            'click .control__link--add': 'addNewEvent',

            'click .shield': 'handleHideShield',
            'click .popup__close': 'handleClosePopup',

            'click .overlay__close': 'handleCloseOverlay',

            'click .control__link--summary': 'toggleSummaryDisplay',
            'click .control__link--week': 'setViewModeWeek',
            'click .control__link--month': 'setViewModeMonth',

            'mouseup': 'handleMouseUp'
        },


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Init
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {

            this.cacheSelectors();

            this.bindEvents();

            this.setActiveDate(App.Methods.newDate());

            this.initializeSubViews();

            this.addTransitionClassesToBody();

            this.render();

            this.highlightActiveViewModeLink();

            this.startClock();

            this.loadEventData();

            this.generateLabels();


            // DEBUG
            this.setActiveDate(App.Methods.newDate(2013, 9, 30));
            this.markDates();
        },


        // Init methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$body = $('body');
            this.$panels = $('#js-panels');
            this.$title = this.$('.nav__title');
            this.$modeLinks = this.$('.control--mode a');
            this.$setModeMonth = this.$('.control__link--month');
            this.$setModeWeek = this.$('.control__link--week');
            this.$toggleSummary = this.$('.control__link--summary');
            this.$summary = this.$('.summary');
            this.$overlay = this.$('#overlay');
            this.$popup = this.$('#popup');
        },

        bindEvents: function () {
            var self = this;

            // event handling
            this.listenTo(App.Events, 'add:event', this.handleNewEvent);
            this.listenTo(App.Events, 'view:event', this.handleViewEvent);
            this.listenTo(App.Events, 'close:event', this.handleHideShield);
            this.listenTo(App.Events, 'popup:eventlist', this.handlePopupEventList);

            // jump the calendar to a date
            this.listenTo(App.Events, 'goto:date', this.handleGotoDate);

            // DOM/user events
            this.$body.on('DOMMouseScroll mousewheel', _.debounce(function (e) { self.handleScroll(e); }, 50));
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

        addTransitionClassesToBody: function () {
            this.$panels.addClass('is-overlay-hidden is-popup-hidden');
        },

        generateLabels: function () {
            var currentYear = App.Methods.newDate().getFullYear();
            var yearOffsetStart = -App.Constants.DATE_SELECT_YRS_MAX_RANGE;
            var yearRangeLength = (App.Constants.DATE_SELECT_YRS_MAX_RANGE * 2) + 1;

            _.times(yearRangeLength, function (i) {
                App.Labels.year[i] = currentYear + (yearOffsetStart + i);
            });

            _.times(App.Constants.HRS_IN_DAY, function (i) {
                App.Labels.hour[i] = i;
            });
        },

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Rendering & data manipulation
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.assignViews();

            this.markDates();

            this.renderViews();

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
                    dayTemplate: '#day-full-template',
                    date: this.activeDate
                });
            }
        },

        renderViews: function () {
            this.renderView(this.summaryView, '#cal--summary');
            this.renderView(this.mainView, '#cal--full');
        },

        renderView: function (view, selector) {
            // using .setElement as it minimises DOM thrashing when re-rendering existing elements
            view.setElement(this.$(selector)).render();
        },

        markDates: function () {
            var d = App.Methods.getObjectFromDate(this.activeDate);
            var dateFrom;
            var dateTo;

            // if viewing a week, highlight from the first to the last day of the current week
            if (this.isViewModeWeek()) {
                dateFrom = App.Methods.getWeekStartDate(this.activeDate);
                dateTo = App.Methods.getWeekEndDate(this.activeDate);
            }

            // if viewing a month, highlight from the first to the last day of the current month
            if (this.isViewModeMonth()) {
                dateFrom = App.Methods.newDate(d.year, d.month, 1);
                dateTo = App.Methods.newDate(d.year, d.month + 1, 1);
            }

            App.Events.trigger('change:mark', {
                'from': dateFrom,
                'to': dateTo
            });
        },

        updateMonthTitle: function () {
            var d = this.activeDate;

            this.$title.text(App.Methods.getMonthName(d) + ' ' + App.Methods.getYear(d));
        },


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get/set View mode
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setViewMode: function (mode) {
            App.State.viewMode = mode;

            this.setActiveDate(this.activeDate);

            this.render();
        },

        setViewModeWeek: function (e) {
            if (e) { e.preventDefault(); }

            this.setViewMode(App.Constants.WEEK);

            this.highlightActiveViewModeLink($(e.currentTarget));
        },

        setViewModeMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.setViewMode(App.Constants.MONTH);

            this.highlightActiveViewModeLink($(e.currentTarget));
        },

        highlightActiveViewModeLink: function () {
            var $elem;

            this.$modeLinks.removeClass('is-active');

            if (this.isViewModeWeek()) {
                $elem = this.$setModeWeek;
            }
            if (this.isViewModeMonth()) {
                $elem = this.$setModeMonth;
            }

            $elem.addClass('is-active');
        },

        isViewModeWeek: function () {
            return App.State.viewMode === App.Constants.WEEK;
        },

        isViewModeMonth: function () {
            return App.State.viewMode === App.Constants.MONTH;
        },

        isCurrentMonthActive: function (date) {
            var d = date || this.activeDate;

            var now = App.Methods.getObjectFromDate(App.Methods.newDate());
            var active = App.Methods.getObjectFromDate(d);

            var nowMonth = App.Methods.newDate(now.year, now.month, 1);
            var activeMonth = App.Methods.newDate(active.year, active.month, 1);

            return nowMonth.getTime() === activeMonth.getTime();
        },

        toggleSummaryDisplay: function () {
            this.$summary.toggleClass('is-hidden');
            this.$toggleSummary.toggleClass('is-active');
        },


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Time-based eventing
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // work out how much time until the current minute ends.
        // Once it does, start a once-a-minute timer to update the current time line
        startClock: function () {
            var self = this;
            var now = new Date();
            var d = App.Methods.getObjectFromDate(now);
            var endOfCurrentMinute = new Date(d.year, d.month, d.day, d.hour, d.minute + 1);
            var diff = endOfCurrentMinute.getTime() - now.getTime();

            this.clockTimeout = this.minuteInterval = null;

            // timeout to the end of the minute
            this.clockTimeout = setTimeout(function () {
                // tick now, at the top of the minute - then once every minute from now
                App.Events.trigger('clock:tick');

                // interval for every minute
                self.minuteInterval = setInterval(function () {
                    App.Events.trigger('clock:tick');

                }, 10000); //App.Constants.MS_IN_MINUTE
            }, diff);
        },

        stopMinuteTimer: function () {
            clearTimeout(this.clockTimeout);
            clearInterval(this.minuteInterval);
        },


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Date traversal event handling
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
                var weekStart = App.Methods.getWeekStartDate(date);
                var d = App.Methods.getObjectFromDate(weekStart);
                // set the date as a few days into the month, so we don't march backwards in time
                // whenever we switch between week/month views repeatedly
                newDate = App.Methods.newDate(d.year, d.month, d.day + 3);
            }

            // set the currentDate to the first of the month, only if
            // we are in month view mode & we're not in the current month
            // (if the latter, we want to keep today as the active date, so if
            // we switch to week mode, it highlights the correct week)
            if (this.isViewModeMonth() && !this.isCurrentMonthActive(date)) {
                d = App.Methods.getObjectFromDate(date);
                // set the date as a few days into the month, so we don't march backwards in time
                // whenever we switch between week/month views repeatedly
                newDate = App.Methods.newDate(d.year, d.month, 4);
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


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Calendar API access
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        loadEventData: function () {
            var self = this;

            App.eventData = new App.Collections.events();

            var req = App.eventData.fetch();

            req.success(function (data) {
                App.Events.trigger('event:data');
            });

            req.error(function (data, othera, otherb) {
                //TODO: handle error
            });
        },

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Control overlays/popups
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        showShield: function () {
            this.$panels
                .removeClass('is-shield-hidden')
                .addClass('is-shield-active');
        },

        hideShield: function () {
            this.$panels
                .removeClass('is-shield-active')
                .addClass('is-shield-hidden');
        },

        openOverlay: function () {
            var self = this;

            //this.closePopup();

            setTimeout(function () {
                self.$panels
                    .removeClass('is-overlay-hidden')
                    .addClass('is-overlay-active');
            }, 130);
        },

        closeOverlay: function () {
            this.$panels
                .removeClass('is-overlay-active')
                .addClass('is-overlay-hidden');
        },

        openPopup: function () {
            var self = this;

            //this.closeOverlay();

            setTimeout(function () {
                self.$panels
                    .removeClass('is-popup-hidden')
                    .addClass('is-popup-active');
            }, 130);
        },

        closePopup: function () {
            this.$panels
                .removeClass('is-popup-active')
                .addClass('is-popup-hidden');
        },

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // user events
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleKeyPress: function (e) {
            var code = e.keyCode || e.which;

            // escape key
            if (code === App.Constants.ESC_KEY) {
                App.Events.trigger('clear:selection');
                App.Events.trigger('close:event');
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

        // global mouse-up event, so individual views can be aware of when mouse-ups
        // fire anywhere in the app - to capture, for instance, a drag-out event
        handleMouseUp: function (e) {
            var $el = $(e.target);

            if (App.State.isDragging) {
                App.Events.trigger('mouse:up');
            }
        },


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Calendar events
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        addNewEvent: function () {
            App.Events.trigger('add:event', App.Methods.newDate(this.activeDate));
        },


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // custom App events (see events object, at top)
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleGotoDate: function (date) {
            this.gotoDate({'newDate': date});
        },

        handleNewEvent: function (newEvent) {
            var view = new App.Views.eventOverlay({
                model: App.eventData.create(App.Models.Event)
            });

            this.$overlay.html(view.render());

            this.showShield();
            this.closePopup();
            this.openOverlay();
        },

        handleViewEvent: function (event) {
            var eventData = App.eventData.get(event.id);

            var view = new App.Views.eventOverlay({
                model: eventData
            });

            this.$overlay.html(view.render());

            this.showShield();
            this.closePopup();
            this.openOverlay();

        },

        handleHideShield: function () {
            if (this.$panels.hasClass('is-overlay-active')) {
                this.closeOverlay();
                this.hideShield();
                App.Events.trigger('clear:selection');

            } else if (this.$panels.hasClass('is-popup-active')) {
                this.closePopup();
                this.hideShield();
            }
        },

        handlePopupEventList: function (events, day) {
            var view = new App.Views.eventsList({
                model: day,
                eventModels: events
            });

            this.$popup.html(view.render());

            this.showShield();
            this.openPopup();
        },

        handleClosePopup: function () {
            this.closePopup();
            this.hideShield();
        },

        handleCloseOverlay: function () {
            this.closeOverlay();
            this.hideShield();
        }
    });
})(jQuery);