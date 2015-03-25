/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    App.Views.row = Backbone.View.extend({

        tagName: 'li',
        className: 'month__week',

        // templating and setup
        template: _.template($('#row-template').html()), // for containing elem & markup

        collection: App.Collections.dates,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            this.options = params;

            this.selfWeek = App.Methods.newDate(this.options.weekStartDate);

            this.getEventData();

            this.listenTo(App.Events, 'event:data', this.handleEventData);
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderElem();

            this.cacheSelectors();

            this.renderDays();

            if (App.eventData && App.eventData.models) {
                this.renderEvents();
            }

            return this.el;
        },

        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderElem: function () {
            var data = {
                weekNum: this.options.weekNum
            };

            this.$el.html(this.template(data));
        },

        cacheSelectors: function () {
            this.$weekDays = this.$('.week');
            this.$weekEvents = this.$('.events');
        },

        renderDays: function () {
            var fragment = document.createDocumentFragment();

            this.dayViews = this.collection.map(function (day) {
                var view = new this.options.dayView({
                    model: day
                });

                fragment.appendChild(view.render());

                return view;
            }, this);

            this.$weekDays.empty();
            this.$weekDays.append(fragment);
        },




        createRowAry: function () {
            var x, y;

            this.rowAry = [];

            for (x = 0, y = App.Constants.DAYS_IN_WEEK; x < y; x++) {
                this.rowAry[x] = [];
            }
        },

        setRowFill: function (pos, span, row) {
            var x, y;

            for (x = pos, y = (pos + span); x < y; x++) {
                this.rowAry[x][row] = true;
            }
        },

        hasSpaceInRow: function (pos, span, row) {
            var x, y;
            var output = true;

            for (x = pos, y = (pos + span); x < y; x++) {
                if (this.rowAry[x][row]) {
                    output = false;
                }
            }

            return output;
        },

        findSpaceForEvent: function (pos, span) {
            var row = 0;

            while (!this.hasSpaceInRow(pos, span, row)) {
              row++;
            }

            this.setRowFill(pos, span, row);

            return row;
        },


        // TODO: refactor, getting too large
        parseEvents: function () {
            this.createRowAry();

            var events = _.clone(this.activeDatesEventData);

            this.eventViews = events.map(function (event) {
                 var context = {
                    weekNum: this.model.weekNum,
                    weekStartDate: this.selfWeek,
                    weekEndDate: App.Methods.getWeekEndDate(this.selfWeek)
                }

                var view = new App.Views.eventInMonth({
                    model: event,
                    context: context
                });

                return view;
            }, this);

            if (this.eventViews.length) {
                // position the longer-running events first
                this.eventViews.sort(function (a, b) {
                    return b.model.attributes.custom.span - a.model.attributes.custom.span;
                });

                // always full-day events first
                this.eventViews.sort(function (a, b) {
                    return b.model.attributes.custom.isFullDay - a.model.attributes.custom.isFullDay;
                });

                this.eventViews.forEach(function (event) {
                    var customData = event.model.attributes.custom;

                    customData.row = this.findSpaceForEvent(customData.pos, customData.span);
                }, this);
            }
        },

        renderEvents: function () {
            this.parseEvents();

            var fragment = document.createDocumentFragment();

            this.eventViews.forEach(function (view) {
                fragment.appendChild(view.render());
            }, this);

            this.$weekEvents.empty();
            this.$weekEvents.append(fragment);
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        getEventData: function () {
            if (App.eventData) {
                var firstDay = this.selfWeek;
                var lastDay = App.Methods.getWeekEndDate(this.selfWeek);

                this.activeDatesEventData = App.eventData.filter(function (event) {
                    var data = event.get('custom');

                    return (data.startDateTime <= firstDay && data.endDateTime > firstDay)
                        || (data.startDateTime >= firstDay && data.startDateTime < lastDay);
                });

                //console.log(this.activeDatesEventData);
                //debugger;
            }
        },


        // Handle events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleEventData: function () {
            this.getEventData();

            this.renderEvents();
        },


        // Remove/destroy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        close: function () {
            _.each(this.dayViews, function (day) {
                day.remove();
            });

            this.undelegateEvents();
            this.stopListening();
            this.dayViews = null;
        }
    });
})(jQuery);