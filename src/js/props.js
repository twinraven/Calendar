/*global $ */
/*jshint unused:false */
var app = app || {};

$(function () {
	'use strict';

	// immutable app-wide properties
	app.const = {
	    DAYS_IN_WEEK : 7,
	    MONTHS_IN_YEAR : 12,
	    ESC_KEY : 27,
	    WEEK : 'WEEK',
	    MONTH : 'MONTH',
	    MS_IN_DAY : 86400000
	};

	// mutable app-wide properties
	app.state = {
	    startDay : "mon",
		viewMode: app.const.MONTH
	};
});
