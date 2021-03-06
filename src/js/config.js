/* global Backbone, jQuery, _ */
var App = App || {};

(function ($) {
	'use strict';

	// Settings ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// immutable App-wide properties
	App.Constants = {
		MAX_EVENT_ROWS_IN_MONTH: 2,
		MAX_ALL_DAY_EVENTS_ROWS: 5,
		WEEK_VIEW_GRID_HEIGHT: 20,

	    ESC_KEY : 27,

	    DAYS_IN_WEEK : 7,
	    MONTHS_IN_YEAR : 12,
	    WEEK : 'WEEK',
	    MONTH : 'MONTH',
	    MS_IN_DAY : 86400000,
	    MS_IN_HR : 3600000,
	    MS_IN_MINUTE : 60000,
	    MINS_IN_DAY: 1440,
	    HRS_IN_DAY: 24,

	    DATE_SELECT_YRS_MAX_RANGE: 10
	};

	// mutable App-wide properties
	App.State = {
		today: App.Methods.newDate(),
	    startDay : 'mon',
		viewMode: App.Constants.WEEK
	};

	App.Models = {};
	App.Collections = {};
	App.Views = {};
	App.Events = {};

})(jQuery);
