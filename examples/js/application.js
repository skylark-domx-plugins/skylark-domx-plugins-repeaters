/*!
 * JavaScript for Fuel UX's docs
 * Copyright 2011-2014 ExactTarget, Inc.
 * Licensed under the Creative Commons Attribution 3.0 Unported License. For
 * details, see http://creativecommons.org/licenses/by/3.0/.
 */

define([
	"skylark-domx-query",
	"skylark-bootstrap3/scrollspy",
	"skylark-bootstrap3/affix",
	"./repeater-examples"
],function ($) {
	var $body = $(document.body);
	var $window = $(window);

	$body.plugin("bs3.scrollspy",{
		target: '.fu-sidebar'
	});

	setTimeout(function () {
		var $sideBar = $('.fu-sidebar');

		$sideBar.plugin("bs3.affix",{
			offset: {
				top: function () {
					var offsetTop = $sideBar.offset().top;
					var sideBarMargin = parseInt($sideBar.children(0).css('margin-top'), 10);
					var navOuterHeight = $('.fu-docs-nav').height();

					this.top = offsetTop - navOuterHeight - sideBarMargin;
					return this.top;
				},
				bottom: function () {
					this.bottom = $('.fu-footer').outerHeight(true);
					return this.bottom;
				}
			}
		});
	}, 100);

	//programmatically injecting this is so much easier than writing the html by hand 376 times...
	$('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id], dt[id]').each(function (i) {
		$(this).prepend(['<a class="header-anchor" href="#', this.id, '"><span class="glyphicon glyphicon-link"></span></a>'].join(''));
	});

});
