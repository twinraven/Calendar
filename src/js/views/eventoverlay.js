/* global Backbone, jQuery, _, Handlebars */
var App = App || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    App.Views.eventOverlay = Backbone.View.extend({

        template: Handlebars.compile($('#event-overlay-template').html()),
        optionTemplate: Handlebars.compile($('#select-option-template').html()),

        events: {
            'change #eventDateFromMonth': 'handleChangeDateFrom',
            'change #eventDateToMonth': 'handleChangeDateTo'
        },

        // events required:
        //  - change date: repopulate day-of-month select field
        //  - check 'isFullday' - show/hide time fields?
        //  - change any field - keep track of changes, alert people when...
        //  - closing the overlay - alert if changed

        // init ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        initialize: function (params) {

            if (this.model.isNew()) {
                // create new model? May need to change App.Methods.getNewDayData, to allow
                // for inputting hour/min.
                //
                // Amend 'handleNewEvent' method in calendar.js, to correctly send through
                // the new date data (it's not at the moment).
                //
                // How to handle deletion of event, when the user cancels etc? On .destroy?
                //
                // Need a save button in the interface;
                // Also need to save model changes locally, before actually overwriting the
                // existing model data.

            } else {
                // grab existing customEventData
                this.customEventData = this.model.get('custom');
            }

            this.listenTo(this.model, 'destroy', this.close);
        },


        // render ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        render: function (params) {

            this.renderElem();

            this.cacheSelectors();

            this.renderYears();
            this.renderMonths();
            this.renderDays();

            this.updateFullDayCheckbox();

            // check 'isFullDay' checkbox if required

            return this.el;
        },


        // Render methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        renderElem: function () {

            var html = this.template(this.model.toJSON());
            this.setElement(html);
        },

        cacheSelectors: function () {

            this.$yearFrom = this.$('#eventDateFromYear');
            this.$monthFrom = this.$('#eventDateFromMonth');
            this.$dayFrom = this.$('#eventDateFromDay');

            this.$yearTo = this.$('#eventDateToYear');
            this.$monthTo = this.$('#eventDateToMonth');
            this.$dayTo = this.$('#eventDateToDay');

            this.$fullDay = this.$('#eventFullDay');
        },

        renderYears: function () {

            var currentYear = App.Methods.newDate().getFullYear();
            var yearFrom = this.customEventData ? App.Methods.getYear(this.customEventData.startDateTime) : currentYear;
            var yearTo = this.customEventData ? App.Methods.getYear(this.customEventData.endDateTime) : currentYear;

            this.$yearFrom.empty();
            this.$yearTo.empty();

            _.each(App.Labels.year, function (year, i) {
                var data = {
                    'key': year,
                    'value': year,
                    'selected': (year === yearFrom) ? 'selected' : ''
                };

                this.$yearFrom.append(this.optionTemplate(data));

            }.bind(this));

            _.each(App.Labels.year, function (year, i) {
                var data = {
                    'key': year,
                    'value': year,
                    'selected': (year === yearTo) ? 'selected' : ''
                };

                this.$yearTo.append(this.optionTemplate(data));

            }.bind(this));
        },

        renderMonths: function () {

            var currentMonth = App.Methods.newDate().getMonth();
            var monthFrom = this.customEventData ? App.Methods.getMonthName(this.customEventData.startDateTime) : currentMonth;
            var monthTo = this.customEventData ? App.Methods.getMonthName(this.customEventData.endDateTime) : currentMonth;

            this.$monthFrom.empty();
            this.$monthTo.empty();

            _.each(App.Labels.month, function (month, i) {
                var data = {
                    'key': i,
                    'value': month,
                    'selected': (month === monthFrom) ? 'selected' : ''
                };

                this.$monthFrom.append(this.optionTemplate(data));

            }.bind(this));

            _.each(App.Labels.month, function (month, i) {
                var data = {
                    'key': i,
                    'value': month,
                    'selected': (month === monthTo) ? 'selected' : ''
                };

                this.$monthTo.append(this.optionTemplate(data));

            }.bind(this));
        },

        renderDays: function () {

            var currentDay = App.Methods.newDate();

            var dateFrom = this.customEventData ? this.customEventData.startDateTime : currentDay;
            var dateTo = this.customEventData ? this.customEventData.endDateTime : currentDay;

            var dayFrom = this.customEventData ? App.Methods.getDate(dateFrom) : currentDay.getDate();
            var dayTo = this.customEventData ? App.Methods.getDate(dateTo) : currentDay.getDate();

            var daysInFromMonth = App.Methods.getDaysInMonth(dateFrom);
            var daysInToMonth = App.Methods.getDaysInMonth(dateTo);

            this.$dayFrom.empty();
            this.$dayTo.empty();

            _.times(daysInFromMonth, function (i) {
                var data = {
                    'key': i,
                    'value': i + 1,
                    'selected': (i === dayFrom) ? 'selected' : ''
                };

                this.$dayFrom.append(this.optionTemplate(data));

            }.bind(this));

            _.times(daysInToMonth, function (i) {
                var data = {
                    'key': i,
                    'value': i + 1,
                    'selected': (i === dayTo) ? 'selected' : ''
                };

                this.$dayTo.append(this.optionTemplate(data));

            }.bind(this));
        },

        updateFullDayCheckbox: function () {

            if (this.customEventData && this.customEventData.isFullDay) {
                this.$fullDay.prop('checked', 'checked');

            } else {
                this.$fullDay.removeProp('checked');
            }
        },


        // handle Events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        handleChangeDateFrom: function (e) {

            var yFrom = this.$yearFrom.val();
            var mFrom = this.$monthFrom.val();
            var dFrom = this.$dayFrom.val();
            var hrFrom = this.customEventData.startDateTime.getHours();
            var minFrom = this.customEventData.startDateTime.getMinutes();

            var newDateFrom = new Date(yFrom, mFrom, dFrom, hrFrom, minFrom);

            this.customEventData.startDateTime = newDateFrom;

            this.renderYears();
            this.renderMonths();
            this.renderDays();
        },

        handleChangeDateTo: function (e) {
            var yTo = this.$yearTo.val();
            var mTo = this.$monthTo.val();
            var dTo = this.$dayTo.val();

            this.renderDays();
        },


        // Kill switch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Remove the item, destroy the model from *localStorage* and delete its view.
        close: function () {
            this.remove();
        }
    });
})(jQuery);