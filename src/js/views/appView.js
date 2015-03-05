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
            'click .home-all': 'gotoToday'
        },


        // Init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {
            var self = this;

            this.viewMode = app.const.WEEK;

            this.cacheSelectors();

            this.bindEvents();

            this.setCurrentDate(app.cal.newDate());

            console.log(app.cal.getWeekStartDate(this.currentDate));
            console.log(app.cal.getWeekEndDate(this.currentDate));

            this.initializeSubViews();

            this.render();
        },


        // Init methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cacheSelectors: function () {
            this.$body = $('body');
            this.$title = $('.title-all');
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

            this.mainView = new app.weekView();
        },


        // Rendering & data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderMonthName(this.$title, this.currentDate);

            this.assign(this.summaryView, '#cal-summary');
            this.assign(this.mainView, '#cal-main');

            return this.el;
        },

        assign: function (view, selector) {
            view.setElement(this.$(selector)).render();
        },

        renderMonthName: function (elem, data) {
            elem.text(app.cal.getMonthName(data) + " " + app.cal.getYear(data));
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


         setCurrentDate: function (newDate) {
             this.currentDate = app.cal.newDate(newDate);

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