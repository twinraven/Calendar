/* global Backbone, jQuery, _, ESC_KEY */
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

            this.viewMode = app.const.MONTH;
            this.setModeLinkActive(this.$('.cal-mode-month'));

            this.bindEvents();

            this.setCurrentDate(app.cal.newDate());

            this.initializeSubViews();

            this.render();
        },


        // Init methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$body = $('body');
            this.$title = this.$('.title-all');
            this.$modeLinks = this.$('.cal-mode');
        },

        bindEvents: function () {
            var self = this;

            // custom events
            app.events.bind('add:event', function (event) { self.handleAddEvent(event) });
            app.events.bind('goto:date', function (date) { self.handleGotoDate(date) });

            // DOM/user events
            this.$body.on('DOMMouseScroll mousewheel', function (e) { self.handleScroll.call(self, e) });
            this.$body.on('keydown', function (e) { self.handleKeyPress.call(self, e); });
        },

        initializeSubViews: function () {
            this.summaryView = new app.monthSummaryView({
                dayTemplate: '#day-summary-template'
            });

            this.mainWeekView = new app.weekView();

            this.mainMonthView = new app.monthMainView({
                dayTemplate: '#day-main-template'
            });
        },


        // Rendering & data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderMonthName(this.$title, this.currentDate);

            this.assignViews();

            return this.el;
        },

        assign: function (view, selector) {
            view.setElement(this.$(selector)).render();
        },

        assignViews: function () {
            var mainView;

            if (this.viewMode === app.const.WEEK) {
                mainView = this.mainWeekView;
            }

            if (this.viewMode === app.const.MONTH) {
                mainView = this.mainMonthView;
            }

            this.assign(this.summaryView, '#cal-summary');
            this.assign(mainView, '#cal-main');
        },

        renderMonthName: function (elem, data) {
            elem.text(app.cal.getMonthName(data) + " " + app.cal.getYear(data));
        },

        setViewMode: function (mode) {
            this.viewMode = mode;

            this.render();
        },


        // Setting view mode ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setViewModeWeek: function (e) {
            if (e) { e.preventDefault(); }

            this.setModeLinkActive($(e.currentTarget));

            this.setViewMode(app.const.WEEK);
        },

        setViewModeMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.setModeLinkActive($(e.currentTarget));

            this.setViewMode(app.const.MONTH);
        },

        setModeLinkActive: function ($elem) {
            this.$modeLinks.removeClass('cal-mode-active');
            $elem.addClass('cal-mode-active');
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
                'increment': 'previous'
            });
        },

         gotoToday: function (e) {
             if (e) { e.preventDefault(); }

             this.gotoDate({'newDate': app.cal.newDate()});
         },

         gotoDate: function (params) {
            var date;

            if (params.increment) {
                if (params.increment === 'next') {
                    date = app.cal.getNextDateRange(this.currentDate, this.viewMode);

                } else if (params.increment === 'previous') {
                    date = app.cal.getPrevDateRange(this.currentDate, this.viewMode);
                }
            }

            if (params.newDate) {
                date = params.newDate;
            }

            this.setCurrentDate(date);
            this.render();
        },


         setCurrentDate: function (date) {
            var newDate;

            // normalise date so we're always dealing with the first day of the week
            if (this.viewMode === app.const.WEEK) {
                newDate = app.cal.getWeekStartDate(date);
            }

            if (this.viewMode === app.const.MONTH) {
                var d = app.cal.getObjectFromDate(date);
                var newDate = app.cal.newDate(d.year, d.month, 1);
            }

            this.currentDate = newDate;

            app.events.trigger('change:date', this.currentDate);
         },

        // key events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleKeyPress: function (e) {
            var code = e.keyCode || e.which;

            // escape key
            if (code === app.const.ESC_KEY) {
                app.events.trigger('clear:selection');
            }
        },

        handleScroll: function (e) {
            if (e.originalEvent.detail > 0 || e.originalEvent.wheelDelta < 0) {
                this.gotoNextDateRange();

            } else {
                this.gotoPrevDateRange();
            }
        },


        // custom app events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleGotoDate: function (date) {
            this.gotoDate({'newDate': date});
        },

        handleAddEvent: function (newEvent) {
            console.log('add new event from **' + newEvent.from + '** to **' + newEvent.to + '**');
            console.log('all day event: ' + (newEvent.fullday));
            console.log('~~~~~~~~~~~~~~~~');
        }
    });
})(jQuery);