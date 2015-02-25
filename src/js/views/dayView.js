/* global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.dayView = Backbone.View.extend({
        tagName: 'li',
        className: 'day',
        attributes: function () {
            return {
                'aria-labelledby': 'date-' + this.model.get('id')
            };
        },

        template: _.template($('#day-template').html()),

        /*events: {
            'mousedown': 'handleMouseDown',
            'mouseup': 'handleMouseUp',
            'mouseover': 'handleMouseOver',
            'mouseout': 'handleMouseOut'
        },*/

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function () {

            // Backbone LocalStorage is adding `id` attribute instantly after
            // creating a model.  This causes our TodoView to render twice. Once
            // after creating a model and once on `id` change.  We want to
            // filter out the second redundant render, which is caused by this
            // `ind` change.  It's known Backbone LocalStorage bug, therefore
            // we've to create a workaround.
            // https://github.com/tastejs/todomvc/issues/469
            if (this.model.changed.id !== undefined) {
                return;
            }

            var today = new Date().toDateString();

            // highlight today
            if (this.model.get('date') === today) {
                this.$el.addClass('is-today');
            }

            // highlight if this day is currently in our active range
            if (this.model.get('isCurrent') == true) {
                this.$el.addClass('is-range');
            }

            if (this.model.get('isHighlight') == true) {
                this.$el.addClass('is-highlight');
            }

            // add to the DOM
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },

        handleMouseDown: function () {
            this.isDragging = true;
            this.$el.addClass('is-highlight');
        },

        handleMouseUp: function () {
            this.isDragging = false;
        },

        handleMouseOver: function () {
            this.isMouseActive = true;

            if (this.isDragging) {
                 this.$el.addClass('is-highlight');
            }
            //this.$el.addClass('is-highlight');
            //
            //if we are in a dragging state, highlight this element (and all those preceding it, up to this date
            //if not, just do a normal hover
        },

        handleMouseOut: function () {
            this.isMouseActive = false;
            //this.$el.addClass('is-highlight');
            //
            //if we are dragging, do not remove the highlight
            //if we are not dragging, remove any hover & highlight
        },


        /*addEvent: function() {
            this.model.addEvent( {'id': this.model.id} );
        },*/

        // Remove the item, destroy the model from *localStorage* and delete its view.
        clear: function () {
            this.model.destroy();
        }
    });
})(jQuery);