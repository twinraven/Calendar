/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.event = Backbone.View.extend({

        template: _.template($('#event-template').html()),

        events: {
            'click': 'handleEventClick'
        },


        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {
            this.options = params;

            this.adjustedModel = _.clone(this.model.attributes);
            debugger;
            this.setEventPosition();

            this.listenTo(this.model, 'destroy', this.close);
        },


        // Init methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        setEventPosition: function () {
            this.adjustedModel.custom.row = 0;

            if (this.adjustedModel.custom.weekNum < this.options.context.weekNum) {
                this.adjustedModel.custom.pos = 0;

                if (this.adjustedModel.custom.endDateTime < this.options.context.weekEndDate) {
                    this.adjustedModel.custom.span = App.Methods.getDayOfWeekNum(this.adjustedModel.custom.endDateTime);

                } else {
                    this.adjustedModel.custom.span = App.Constants.DAYS_IN_WEEK;
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
            this.$el.html(this.template(JSON.stringify(this.adjustedModel)));
        },


        // handle Events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleEventClick: function (e) {
            console.log(this.model.get('custom'));
        },


        // Kill switch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Remove the item, destroy the model from *localStorage* and delete its view.
        close: function () {
            this.remove();
        }
    });
})(jQuery);