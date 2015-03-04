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
            'click .home-all': 'gotoThisMonth'//,

            //'click #grid-summary': 'gotoSummaryMonth' // SUMMARY
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

        clearSelection: function () {
            app.events.trigger('clear:selection');
        },


        // Init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //

        initialize: function () {

            // cache selectors
            var self = this;
            this.bindEvents();

            var now = app.cal.newDate();
            this.setMonth(now);

            this.summaryView = new app.monthView({
                dayTemplate: '#day-summary-template',
                showControls: true
            });
            this.mainView = new app.monthView({
                dayTemplate: '#day-main-template',
                showControls: false
            });

            this.render();
        },

        bindEvents: function () {
            var self = this;

            $('body').on('DOMMouseScroll mousewheel', function mousescroll(e) { self.handleScroll.call(self, e); });
            $('body').on('keydown', function (e) { self.handleKeyPress.call(self, e); });
        },


        // Rendering & data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderMonthName(this.$('.title-all'), this.currentMonth);

            this.assign(this.summaryView, '#cal-summary');
            this.assign(this.mainView, '#cal-main');

            return this.el;
        },

        assign: function (view, selector) {
            view.setElement(this.$(selector)).render();
        },

        renderMonth: function(model, elem, dayTemplate) {
            elem.empty();

            var view = new app.monthView({
                model: app.monthData,
                dayTemplate: dayTemplate
            });

            elem.append(view.render());
        },

        renderMonthName: function (elem, data) {
            elem.text(app.cal.getMonthName(data) + " " + app.cal.getYear(data));
        },

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleKeyPress: function (e) {
            var code = e.keyCode || e.which;

            if (code === 27) {
                this.clearSelection();
            }
        },

        handleScroll: function (e) {
            if (e.originalEvent.detail > 0 || e.originalEvent.wheelDelta < 0) {
                this.gotoNextMonth();

            } else {
                this.gotoPrevMonth();
            }
        }
    });
})(jQuery);