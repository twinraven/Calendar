/*global $ */
/*jshint unused:false */
var app = app || {};

$(function () {
	'use strict';

	// Settings ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// immutable app-wide properties
	app.constants = {
	    DAYS_IN_WEEK : 7,
	    MONTHS_IN_YEAR : 12,
	    ESC_KEY : 27,
	    WEEK : 'WEEK',
	    MONTH : 'MONTH',
	    MS_IN_DAY : 86400000,
	    MS_IN_MINUTE : 60000,
	    MINS_IN_DAY: 1440,
	    HRS_IN_DAY: 24
	};

	// mutable app-wide properties
	app.state = {
	    startDay : 'mon',
		viewMode: app.constants.MONTH
	};

	// kick things off by creating the `App` ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	var calApp = new app.appView(); // self-rendering in initialize()
});
