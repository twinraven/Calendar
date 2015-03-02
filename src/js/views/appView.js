/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.appView = Backbone.View.extend({
        el: '#app',

        titleTemplate: _.template($('#day-title-template').html()),

        // Events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //
        events: {
            'click .prev-all': 'gotoPrevMonthAll',
            'click .next-all': 'gotoNextMonthAll',
            'click .home-all': 'gotoThisMonthAll',
            'click #grid-summary': 'gotoSummaryMonth',

            'click .prev-summary': 'gotoPrevMonthSummary',
            'click .next-summary': 'gotoNextMonthSummary',

            'mousedown': 'handleMouseDown',
            'mouseup': 'handleMouseUp',
            'mouseover .day': 'handleMouseOver',
            'mouseout .day': 'handleMouseOut'
        },

        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        gotoNextMonthAll: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth({ 'type': 'next' });
        },

        gotoPrevMonthAll: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth({ 'type': 'previous' });
        },

        gotoThisMonthAll: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth({'newDate': new Date()});
        },

        gotoSummaryMonth: function () {
            this.gotoMonth({ newDate: this.currentMonth });
        },

        gotoNextMonthSummary: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth({
                'type': 'next',
                'dest': 'summary'
            });
        },

        gotoPrevMonthSummary: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth({
                'type': 'previous',
                'dest': 'summary'
            });
        },


        gotoMonth: function (params) {
            var date;

            if (params.type) {
                if (params.type === 'next') {
                    date = app.cal.getNextMonth(this.currentMonth);

                } else if (params.type === 'previous') {
                    date = app.cal.getPrevMonth(this.currentMonth);
                }
            }

            if (params.newDate) { date = params.newDate; }

            this.setCurrentMonth(date);
            this.addMonthDataToCollection();
            this.markCurrentMonth();

            if (params.dest && params.dest === 'summary') {
                this.renderGridSummary();

            } else {
                this.render();
            }
        },

        setCurrentMonth: function (newDate) {
            this.currentMonth = new Date(newDate);
        },

        // Mouse event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleMouseDown: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                this.isDragging = true;
                this.setDragStartDate($el, $el.data('ref'));
            }
        },

        handleMouseUp: function (e) {
            var $el = $(e.target);

            if ($el.is('.day-inner')) {
                this.isDragging = false;
                this.actionDates();
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);

            if (this.isDragging) {
                this.setDragEndDate($el, $el.data('ref'));
            }
        },

        handleMouseOut: function () {
            //
        },

        handleKeyPress: function (e) {
            var code = e.keyCode || e.which;

            if (code === 27) {
                this.clearDrag();
            }
        },

        handleScroll: function (e) {
            if (e.originalEvent.detail > 0 || e.originalEvent.wheelDelta < 0) {
                this.gotoNextMonthAll();

            } else {
                this.gotoPrevMonthAll();
            }
        },

        // Init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //

        initialize: function () {
            // cache selectors
            var self = this;
            this.$titleAll = this.$('.title-all');
            this.$titleSummary = this.$('.title-summary');
            this.$gridTitles = this.$('.grid-labels');
            this.$gridSummary = this.$('#grid-summary');
            this.$gridFull = this.$('#grid-full');

            // bind traversal events
            $('body').on('DOMMouseScroll mousewheel', function (e) { self.handleScroll.call(self, e); });
            $('body').on('keydown', function (e) { self.handleKeyPress.call(self, e); });

            this.setCurrentMonth(new Date());

            // rendering done here, as these don't change
            this.renderGridTitles();

            this.addMonthDataToCollection();
            this.markCurrentMonth();
        },

        // Rendering & data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //
        render: function () {
            // possibly remove? If using table/tr/td for layout, this isn't required
            this.setRowsInMonth();

            this.renderMonthNameAll();

            this.renderGridSummary();
            this.renderGridFull();

            return this;
        },

        renderMonthNameAll: function () {
            this.$titleAll.text(app.cal.getMonthName(this.currentMonth) + " " + app.cal.getYear(this.currentMonth));
        },

        renderMonthNameSummary: function () {
            this.$titleSummary.text(app.cal.getMonthName(this.currentMonth) + " " + app.cal.getYear(this.currentMonth));
        },

        renderGridTitles: function () {
            var self = this;

            _.each(app.labels.week, function (day, i) {
                var data = {
                    'label': app.labels.week[i],
                    'initial': app.labels.week[i].slice(0, 1)
                };
                self.$gridTitles.append(self.titleTemplate(data));
            });
        },

        renderGridSummary: function() {
            this.$gridSummary.html('');

            app.grid.each(function(day) {
                var view = new app.daySummaryView({ model: day });
                this.$gridSummary.append(view.render().el);
            }, this);

            this.renderMonthNameSummary();
        },

        renderGridFull: function() {
            this.$gridFull.html('');

            app.grid.each(function(day) {
                var view = new app.dayFullView({ model: day });
                this.$gridFull.append(view.render().el);
            }, this);
        },

        // flagged for removal? depends if switching to table layout
        setRowsInMonth: function () {
            this.$el.attr('data-cal-rows', app.cal.getRowsInMonth(this.currentMonth));
        },

        addMonthDataToCollection: function () {
            // load data
            var data = app.cal.getNewGridData(this.currentMonth);

            app.grid.reset();

            data.map(function (d) {
                app.grid.add(d);
            });
        },


        // Date events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //
        actionDates: function () {
            // fire popup to handle date range - add event

            console.log('add cal entry: ' + new Date(this.dragDateStart).toDateString() + ' -> ' + new Date(this.dragDateEnd).toDateString());
        },

        // Marking/highlighting dates ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //
        tagDateRange: function (dateFrom, dateTo, attr) {
            app.grid.each(function (day) {
                var date = new Date(day.get('date'));
                var prop = {};
                if (date >= dateFrom && date <= dateTo) {
                    prop[attr] = true;
                } else {
                    prop[attr] = false;
                }
                day.save(prop);
            });
        },

        tagCurrentDateRange: function (dateFrom, dateTo) {
            this.tagDateRange(dateFrom, dateTo, 'isCurrent');
        },

        tagHighlightDateRange: function (dateFrom, dateTo) {
            this.tagDateRange(dateFrom, dateTo, 'isHighlight');
        },

        markCurrentMonth: function () {
            var date = this.currentMonth;
            var monthStart = new Date(app.cal.getYear(date), app.cal.getMonthNum(date), 1);
            var monthEnd = new Date(app.cal.getYear(date), app.cal.getMonthNum(date) + 1, 0);

            this.tagCurrentDateRange(monthStart, monthEnd);
        },

        markDaysFrom: function (dateFrom, total) {
            var dateTo = new Date(app.cal.getYear(dateFrom), app.cal.getMonthNum(dateFrom), app.cal.getDate(dateFrom) + total);

            this.tagCurrentDateRange(dateFrom, dateTo);
        },

        setDragStartDate: function ($el, date) {
            this.dragDateStart = new Date(date);
            this.setDragEndDate($el, date);
        },

        setDragEndDate: function ($el, date) {
            this.dragDateEnd = new Date(date);

            if (this.dragDateStart < this.dragDateEnd) {
                this.tagHighlightDateRange(this.dragDateStart, this.dragDateEnd);

            } else {
                // swap order if we're dragging backwards
                this.tagHighlightDateRange(this.dragDateEnd, this.dragDateStart);
            }

            this.render();
        },

        clearDrag: function () {
            this.tagHighlightDateRange(null, null);

            this.render();
        }
    });
})(jQuery);