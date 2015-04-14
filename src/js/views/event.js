/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.event = Backbone.View.extend({

        template: Handlebars.compile($('#event-template').html()),

        events: {
            'click': 'handleEventClick'
        },


        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            this.params = params;
            this.context = params.context;

            var m = this.model.attributes;

            // clone the model - because we may need to be able to adjust it locally, without
            // the changes being propagated to all instances of this data, i.e. wrapped events
            // (events that are longer than any 1 week).
            // We still have a local reference to this.model, so if and when we do need to
            // makes changes, it's not a problem.
            // We could split it so that only wrapped events clone & modify the model, but
            // the interface for handling cloned data (as below) and real models is different
            this.isolatedModel = _.clone(this.model.get('custom'));
            this.adjustModelIfWrappedEvent();

            this.listenTo(this.model, 'destroy', this.close);
        },


        // Init methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        adjustModelIfWrappedEvent: function () {
            if (this.context && this.isolatedModel.weekNum < this.context.weekNum) {
                this.isolatedModel.pos = 0;

                // if we're a split date (a timed event that runs through from one day to the next),
                // then we don't need this adjustment, which only applies to true full-day events
                if (!this.isolatedModel.isSplitDate) {
                    if (this.isolatedModel.endDateTime < this.context.weekEndDate) {
                        this.isolatedModel.span = App.Methods.getDayOfWeekNum(this.isolatedModel.endDateTime);

                    } else {
                        this.isolatedModel.span = App.Constants.DAYS_IN_WEEK;
                    }
                }
            }
        },


        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function () {
            this.renderElem();

            return this.el;
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderElem: function () {
            var html = this.template(this.isolatedModel);
            this.setElement(html);
        },


        // handle Events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleEventClick: function (e) {
            App.Events.trigger('view:event', {
                'id': this.model.get('id')
            });

        },


        // Kill switch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Remove the item, destroy the model from *localStorage* and delete its view.
        close: function () {
            this.remove();
        }
    });
})(jQuery);