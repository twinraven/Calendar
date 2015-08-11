var App = App || {};

$(function () {
	'use strict';

	App.Router.start();

    setTimeout(function () {
        $('body').removeClass('is-loading');
    }, 400);
});
