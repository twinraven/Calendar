/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.appView = Backbone.View.extend({
        el: '#app',

        // Events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //
        events: {
            'click .prev-all': 'gotoPrevMonth',
            'click .next-all': 'gotoNextMonth',
            'click .home-all': 'gotoThisMonth',

            'click #cal-summary': 'gotoSummaryMonth'
        },

        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

       gotoNextMonth: function (e) {
           if (e) { e.preventDefault(); }

           this.gotoMonth({
               'type': 'next',
               'month': this.currentMonth,
           });
       },

       gotoPrevMonth: function (e) {
           if (e) { e.preventDefault(); }

           this.gotoMonth({
               'type': 'previous',
               'month': this.currentMonth,
           });
       },

        gotoThisMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth({'newDate': app.cal.newDate()});
        },

        gotoSummaryMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth({'newDate': this.summaryView.selfMonth});
        },

        gotoMonth: function (params) {
           var date;

           if (params.type) {
               if (params.type === 'next') {
                   date = app.cal.getNextMonth(params.month);

               } else if (params.type === 'previous') {
                   date = app.cal.getPrevMonth(params.month);
               }
           }

           if (params.newDate) { date = params.newDate; }

           this.setMonth(date);
           this.render();
       },

        setMonth: function (newDate) {
            this.currentMonth = app.cal.newDate(newDate);
            app.events.trigger('change:month', this.currentMonth);
        },

        // Init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function () {
            var self = this;

            this.cacheSelectors();

            this.bindEvents();

            this.setMonth(app.cal.newDate());

            this.initializeSubViews();

            this.render();
        },

        cacheSelectors: function () {
            this.$body = $('body');
            this.$title = $('.title-all');
        },

        bindEvents: function () {
            var self = this;

            app.events.bind('add:event', this.addEvent);

            this.$body.on('DOMMouseScroll mousewheel', function mousescroll(e) { self.handleScroll.call(self, e); });
            this.$body.on('keydown', function (e) { self.handleKeyPress.call(self, e); });
        },

        initializeSubViews: function () {
            this.summaryView = new app.monthSummaryView({
                dayTemplate: '#day-summary-template'
            });
            this.mainView = new app.monthMainView({
                dayTemplate: '#day-main-template'
            });
        },


        // Rendering & data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderMonthName(this.$title, this.currentMonth);

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

        // key events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleKeyPress: function (e) {
            var code = e.keyCode || e.which;

            // escape key
            if (code === 27) {
                app.events.trigger('clear:selection');
            }
        },

        handleScroll: function (e) {
            if (e.originalEvent.detail > 0 || e.originalEvent.wheelDelta < 0) {
                this.gotoNextMonth();

            } else {
                this.gotoPrevMonth();
            }
        },

        // custom app events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        addEvent: function (newEvent) {
            console.log('add new event from **' + newEvent.from + '** to **' + newEvent.to + '**');
            console.log('all day event: ' + (newEvent.fullday));
            console.log('~~~~~~~~~~~~~~~~');
        }
    });
})(jQuery);