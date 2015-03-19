/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    App.Views.row = Backbone.View.extend({
        tagName: 'li',
        className: 'month__week',

        attributes: function () {
            return {
                'data-row': this.model.weekNum // this is only for debugging
            };
        },

        // templating and setup
        template: _.template($('#row-template').html()), // for containing elem & markup

        collection: App.Collections.dates,


        // initialize ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            this.options = params;

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

        renderEvents: function (data) {
            var fragment = document.createDocumentFragment();

            data.map(function (event) {
                if (event.weekNum === this.model.weekNum) {
                    var date = new Date(event.start.date || event.start.dateTime);
                    var d = App.Methods.getObjectFromDate(date);

                    var classes = [];
                    classes.push('start-' + App.Methods.getDayOfWeekNum(d.year, d.month, d.day));

                    if (event.isFullDay) {
                        classes.push('is-fullday');
                    }

                    var markup = $('<a class="event ' + classes.join(' ') + '" href="javascript:;" title="' + event.summary + '">' + event.startTimeFormatted + event.summary + '</a>')[0];
                    fragment.appendChild(markup);
                }
            }, this);

            this.$weekEvents.empty();
            this.$weekEvents.append(fragment);
        },


        // Handle events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleEventData: function (data) {
            this.renderEvents(data);
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