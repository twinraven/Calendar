/* global Backbone, jQuery, _ */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    app.weekView = Backbone.View.extend({

        // templating and setup
        template: _.template($('#week-template').html()), // for containing elem & markup
        titleTemplate: _.template($('#day-week-title-template').html()), // for mon/tue/wed labels
        dayTemplate: _.template($('#day-week-template').html()), // for each day of week

        collection: app.dateCollection,

        events: {
            'mousedown': 'handleMouseDown',
            'mouseover .half-hour': 'handleMouseOver',
            'mouseup': 'handleMouseUp'
        },


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            var self = this;

            // keep track of own date, irrespective of app-wide state
            this.selfWeek = (params && params.date) || app.cal.newDate();

            this.listenTo(app.events, 'change:date', function (date) { self.handleChangeWeek(self, date) });
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.$el.html(this.template({}));

            this.cacheSelectors();

            this.renderDayLabels();

            this.setWeekData();

            this.renderDays();

            return this.el;
        },

        renderDayLabels: function () {
            var self = this;
            var d = app.cal.getObjectFromDate(self.selfWeek);

            _.each(app.cal.labels.week, function (day, i) {
                var newDate = app.cal.newDate(d.year, d.month, d.day + i);
                var newDateObj = app.cal.getObjectFromDate(newDate);

                var data = {
                    'date': newDateObj.day + '/' + newDateObj.month,
                    'label': app.cal.labels.week[i].slice(0, 3),
                    'initial': app.cal.labels.week[i].slice(0, 1)
                };
                self.$labels.append(self.titleTemplate(data));
            });
        },

        renderDays: function() {
            var fragment = document.createDocumentFragment();

            this.dayViews = this.weekData.map(function (day) {
                var view = new app.dayView({
                    model: day,
                    template: this.dayTemplate
                });
                fragment.appendChild(view.render());

                return view;
            }, this);

            this.$week.empty();
            this.$week.append(fragment);

            this.$times = this.$('.half-hour'); // MOVE THIS
        },

        cacheSelectors: function () {
            this.$week = this.$('.week-days');
            this.$labels = this.$('.cal-labels');
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setWeekData: function () {
            if (this.weekData) { this.weekData.reset(); }

            this.weekData = new app.dateCollection();
            this.addWeekDataToCollection(this.selfWeek);
        },

        addWeekDataToCollection: function (week) {
            var self = this;

            // load data
            var data = app.cal.getWeekData(week);

            data.map(function (d) {
               self.weekData.add(d);
            });
        },


        // event handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleChangeWeek: function (self, date) {
            // normalise date so we're always dealing with the first day of the week
            var newDate = app.cal.getWeekStartDate(date);

            self.selfWeek = newDate;

            self.render();
        },

        handleMouseDown: function (e) {
            var $el = $(e.target);

            if ($el.is('.half-hour')) {
                var data = $el.data();

                this.isDragging = true;
                this.setDragStart($el, data.date, data.hour, data.min, data.id);
            }
        },

        handleMouseOver: function (e) {
            var $el = $(e.target);

            if (this.isDragging) {
                var data = $el.data();

                this.setDragEnd($el, data.date, data.hour, data.min, data.id);
            }
        },

        handleMouseUp: function (e) {
            var $el = $(e.target);

            if ($el.is('.half-hour')) {
                this.isDragging = false;

                app.events.trigger('add:event', {
                    'from': this.dragDateTimeStart,
                    'to': this.dragDateTimeEnd,
                    'fullday': false
                });
            }
        },


        // date selection & highlighting~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setDragStart: function ($el, date, hour, min, id) {
            var date = app.cal.newDate(date);
            var d = app.cal.getObjectFromDate(date);

            this.dragElemStart = id;

            this.dragDateTimeStart = app.cal.newDate(d.year, d.month, d.day);
            this.dragDateTimeStart.setHours(hour, min, 0, 0);

            this.setDragEnd($el, date, hour, min, id);
        },

        setDragEnd: function ($el, date, hour, min, id) {
            var date = app.cal.newDate(date);
            var d = app.cal.getObjectFromDate(date);

            this.dragElemEnd = id;

            this.dragDateTimeEnd = app.cal.newDate(d.year, d.month, d.day);
            this.dragDateTimeEnd.setHours(hour, min, 0, 0);

            if (this.dragElemStart <= this.dragElemEnd) {
                this.markTimeRangeAsHighlight(this.dragElemStart, this.dragElemEnd);

            } else {
                // swap order if we're dragging backwards
                this.markTimeRangeAsHighlight(this.dragElemEnd, this.dragElemStart);
            }

            //this.renderDays();
        },

        clearDrag: function () {
            this.markTimeRangeAsHighlight(null, null);

            //this.renderDays();
        },

        markTimeRangeAsHighlight: function (elemFrom, elemTo) {
            //ebugger;
            this.$times.removeClass('is-highlight');
            this.$times.slice(elemFrom, elemTo).addClass('is-highlight');
        },


        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function() {
            _.each(this.dayViews, function(day) {
                day.remove();
            });

            this.undelegateEvents();
            this.stopListening();
            this.dayViews = null;
        }
    });
})(jQuery);