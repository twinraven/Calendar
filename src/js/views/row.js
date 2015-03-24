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
                this.renderEvents(App.eventData.toJSON());
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

        renderEvents: function () {
            var fragment = document.createDocumentFragment();

            this.eventViews = App.activeDatesEventData.map(function (event) {
                event.attributes.custom.parentWeekNum = this.model.weekNum;
                event.attributes.custom.parentWeekStartDate = this.selfWeek;
                event.attributes.custom.parentWeekEndDate = App.Methods.getWeekEndDate(this.selfWeek);

                var view = new App.Views.eventInMonth({
                    model: event
                });

                fragment.appendChild(view.render());

                return view;
            }, this);

            this.$weekEvents.empty();
            this.$weekEvents.append(fragment);
        },


        // Data manipulation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        getEventData: function () {
            if (App.eventData) {
                var firstDay = this.selfWeek;
                var lastDay = App.Methods.getWeekEndDate(this.selfWeek);

                App.activeDatesEventData = App.eventData.filter(function (event) {
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