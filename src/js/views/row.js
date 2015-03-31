/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    App.Views.row = Backbone.View.extend({

        tagName: 'li',
        className: 'month__week',

        // templating and setup
        template: Handlebars.compile($('#row-template').html()), // for containing elem & markup

        collection: App.Collections.dates,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            this.options = params;

            this.selfWeek = App.Methods.newDate(this.options.weekStartDate);

            this.getEventData();

            // mixin common event methods here
            _.extend(App.Views.row.prototype, App.Methods.Events);

            this.listenTo(App.Events, 'event:data', this.handleEventData);
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderElem();

            this.cacheSelectors();

            this.renderDays();

            this.renderEvents();

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

        renderEvents: function () {
            // External methods - see App.Methods.Events
            this.createEventStackAry();
            this.createEventViews({ 'type': 'all' });
            this.positionEvents();
            this.renderEventFragment(this.$weekEvents);
        },

        // Sort, parse, and render events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


        // add some local context to each event - we need this if an event is wrapped
        createContext: function () {
            return {
                weekNum: this.model.weekNum,
                weekStartDate: this.selfWeek,
                weekEndDate: App.Methods.getWeekEndDate(this.selfWeek)
            };
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