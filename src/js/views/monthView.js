/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.monthView = Backbone.View.extend({
        template: _.template($('#month-template').html()),
        titleTemplate: _.template($('#day-title-template').html()),

        collection: app.monthCollection,

        events: {
            'click .prev-self': '_gotoPrevMonth',
            'click .next-self': '_gotoNextMonth',

            'mousedown': 'handleMouseDown',
            'mouseup': 'handleMouseUp',
            'mouseover .day': 'handleMouseOver',
            'mouseout .day': 'handleMouseOut'
        },

        initialize: function (attrs) {
            var self = this;
            this.options = attrs;

            this.selfMonth = app.cal.newDate();

            app.events.bind('change:month', function (date) { self.handleChangeMonth(self, date); });
            app.events.bind('clear:selection', this.clearDrag);
        },

        render: function () {
            this.$el.html(this.template({}));

            this.cacheSelectors();
            this.renderDayLabels();

            // Create a global collection of **Collection**.
            this.monthData = new app.monthCollection();
            this.addMonthDataToCollection(this.selfMonth);
            this.markMonth(this.selfMonth);

            if (this.options.showControls) {
                this.renderMonthName(this.$title, this.selfMonth);

            } else {
                this.$title.remove();
                this.$controls.remove();
            }

            this.setRowsInMonth();

            this.renderDays();

            return this.el;
        },

        renderDays: function() {
            var fragment = document.createDocumentFragment();

            this.monthData.each(function eachMonthData(day) {
                var compiledTemplate = _.template($(this.options.dayTemplate).html());

                var view = new app.dayView({
                    model: day,
                    template: compiledTemplate
                });
                fragment.appendChild(view.render());
            }, this);

            this.$month.empty();
            this.$month.append(fragment);
        },

        renderDayLabels: function () {
            var self = this;

            _.each(app.labels.week, function eachLabelWeek(day, i) {
                var data = {
                    'label': app.labels.week[i],
                    'initial': app.labels.week[i].slice(0, 1)
                };
                self.$labels.append(self.titleTemplate(data));
            });
        },

        renderMonthName: function (elem, data) {
            elem.text(app.cal.getMonthName(data) + " " + app.cal.getYear(data));
        },

        cacheSelectors: function () {
            this.$month = this.$('.month');
            this.$labels = this.$('.cal-labels');
            this.$title = this.$('.cal-title');
            this.$controls = this.$('.cal-controls');
        },

        // flagged for removal? depends if switching to table layout
        setRowsInMonth: function () {
            this.$el.attr('data-cal-rows', app.cal.getRowsInMonth(this.selfMonth));
        },

        // event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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

        handleChangeMonth: function (self, date) {
            self._gotoMonth({ 'newDate': date });
        },


        // Marking/highlighting dates ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        tagDateRange: function (dateFrom, dateTo, attr) {
            this.monthData.each(function (day) {
                var date = app.cal.newDate(day.get('date'));
                var prop = {};
                if (date >= dateFrom && date <= dateTo) {
                    prop[attr] = true;
                } else {
                    prop[attr] = false;
                }
                day.save(prop);
            });
            //console.log(this.monthData);
        },

        tagCurrentDateRange: function (dateFrom, dateTo) {
            this.tagDateRange(dateFrom, dateTo, 'isCurrent');
        },

        markMonth: function (date) {
            var monthStart = app.cal.newDate(app.cal.getYear(date), app.cal.getMonthNum(date), 1);
            var monthEnd = app.cal.newDate(app.cal.getYear(date), app.cal.getMonthNum(date) + 1, 0);

            this.tagCurrentDateRange(monthStart, monthEnd);
        },

        markDaysFrom: function (dateFrom, total) {
            var dateTo = app.cal.newDate(app.cal.getYear(dateFrom), app.cal.getMonthNum(dateFrom), app.cal.getDate(dateFrom) + total);

            this.tagCurrentDateRange(dateFrom, dateTo);
        },

        tagHighlightDateRange: function (dateFrom, dateTo) {
            this.tagDateRange(dateFrom, dateTo, 'isHighlight');
        },

        setDragStartDate: function ($el, date) {
            this.dragDateStart = app.cal.newDate(date);

            this.setDragEndDate($el, date);
        },

        setDragEndDate: function ($el, date) {
            this.dragDateEnd = app.cal.newDate(date);

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

        // Date traversal event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        _gotoMonth: function (params) {
           var date;

           if (params.type) {
               if (params.type === 'next') {
                   date = app.cal.getNextMonth(params.month);

               } else if (params.type === 'previous') {
                   date = app.cal.getPrevMonth(params.month);
               }
           }

           if (params.newDate) { date = params.newDate; }

           this._setMonth(date);

           this.render();
        },


        _gotoNextMonth: function (e) {
           if (e) { e.preventDefault(); }

           this._gotoMonth({
               'type': 'next',
               'month': this.selfMonth,
               'dest': 'summary'
           });
        },

        _gotoPrevMonth: function (e) {
           if (e) { e.preventDefault(); }

           this._gotoMonth({
               'type': 'previous',
               'month': this.selfMonth,
               'dest': 'summary'
           });
        },

        _setMonth: function (newDate) {
           this.selfMonth = newDate;
        },

        addMonthDataToCollection: function (month) {
            var self = this;

            // load data
            var data = app.cal.getNewGridData(month);

            this.monthData.reset();

            data.map(function (d) {
               self.monthData.add(d);
            });
        },


        // Date events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        actionDates: function () {
            // fire popup to handle date range - add event
            console.log('add cal entry: ' + app.cal.newDate(this.dragDateStart).toDateString() + ' -> ' + app.cal.newDate(this.dragDateEnd).toDateString());
        },
    });
})(jQuery);