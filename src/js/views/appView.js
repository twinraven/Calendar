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
            'click .prev': 'gotoPrevMonth',
            'click .next': 'gotoNextMonth',
            'click .home': 'gotoThisMonth',

            'mousedown': 'handleMouseDown',
            'mouseup': 'handleMouseUp',
            'mouseover .day': 'handleMouseOver',
            'mouseout .day': 'handleMouseOut'
        },

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

            } else {
                this.clearDrag();
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
                this.gotoNextMonth();

            } else {
                this.gotoPrevMonth();
            }
        },

        // Init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //

        initialize: function () {
            // cache selectors
            var self = this;
            this.$title = this.$('.title');
            this.$gridTitles = this.$('.grid-title');

            // bind traversal events
            $('body').on('DOMMouseScroll mousewheel', function (e) { self.handleScroll.call(self, e); });
            $('body').on('keydown', function (e) { self.handleKeyPress.call(self, e); });

            this.setCurrentMonth(new Date());

            // rendering done here, as these don't change
            this.renderTitle();
            this.renderGridTitles();

            this.addMonthDataToCollection();
            this.markCurrentMonth();
        },

        // Rendering ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //
        render: function () {
            this.renderAllDays('#grid-mini');
            this.renderAllDays('#grid-max');

            // possibly remove? If using table/tr/td for layout, this isn't required
            this.setRowsInMonth();

            return this;
        },

        renderTitle: function () {
            this.$title.text(app.cal.getMonthName(this.currentMonth) + " " + app.cal.getYear(this.currentMonth));
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

        renderDay: function (day, $grid) {
            var view = new app.dayView({ model: day });

            $grid.append(view.render().el);
        },

        renderAllDays: function (grid) {
            var $grid = $(grid);

            $grid.html('');
            app.grid.each(function(day) { this.renderDay(day, $grid); }, this);
        },

        setRowsInMonth: function () {
            this.$el.attr('data-cal-rows', app.cal.getRowsInMonth(this.currentMonth));
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
        },

        // Traversing ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        gotoNextMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth('next');
        },

        gotoPrevMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth('previous');
        },

        gotoThisMonth: function (e) {
            if (e) { e.preventDefault(); }

            this.gotoMonth(null, new Date());
        },

        gotoMonth: function (type, newDate) {
            var date;

            if (type) {
                if (type === 'next') {
                    date = app.cal.getNextMonth(this.currentMonth);

                } else if (type === 'previous') {
                    date = app.cal.getPrevMonth(this.currentMonth);
                }
            }

            if (newDate) { date = newDate; }

            this.setCurrentMonth(date);
            this.addMonthDataToCollection();
            this.markCurrentMonth();

            this.render();
        },

        setCurrentMonth: function (newDate) {
            this.currentMonth = new Date(newDate);
        },

        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        addMonthDataToCollection: function () {
            // load data
            var data = app.cal.getNewGridData(this.currentMonth);

            app.grid.reset();

            data.map(function (d) {
                app.grid.add(d);
            });
        }
    });
})(jQuery);