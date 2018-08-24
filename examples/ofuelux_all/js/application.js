/*!
 * JavaScript for Fuel UX's docs
 * Copyright 2011-2014 ExactTarget, Inc.
 * Licensed under the Creative Commons Attribution 3.0 Unported License. For
 * details, see http://creativecommons.org/licenses/by/3.0/.
 */

define([
	"skylark-ui-swt",
	"./combobox-examples",
	"./infinite-scroll-examples",
	"./repeater-examples",
	"./placard-examples",
	"./pillbox-examples",
	"./search-examples",
	"./selectlist-examples",
	"./spinbox-examples",
	"./tree-examples",
	"./wizard-examples",
	"supercopy"
],function ($) {
	var $body = $(document.body);
	var $window = $(window);

	$body.scrollspy({
		target: '.fu-sidebar'
	});

	setTimeout(function () {
		var $sideBar = $('.fu-sidebar');

		$sideBar.affix({
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

	$(function () {
		$('[data-initialize=checkbox]').each(function() {
			var $this = $(this);
			if (!$this.data('fu.checkbox')) {
				$this.checkbox($this.data());
			}
		});

		$('[data-initialize=combobox]').each(function () {
			var $this = $(this);
			if (!$this.data('fu.combobox')) {
				$this.combobox($this.data());
			}
		});	

		$('[data-initialize=loader]').each(function () {
			var $this = $(this);
			if (!$this.data('fu.loader')) {
				$this.loader($this.data());
			}
		});

		$('[data-initialize=picker]').each(function () {
			var $this = $(this);
			if ($this.data('fu.picker')) return;
			$this.picker($this.data());
		});

		$('[data-initialize=pillbox]').each(function init () {
			var $this = $(this);
			if ($this.data('fu.pillbox')) return;
			$this.pillbox($this.data());
		});

		$('[data-initialize=placard]').each(function () {
			var $this = $(this);
			if ($this.data('fu.placard')) return;
			$this.placard($this.data());
		});

		$('[data-initialize=radio]').each(function initializeRadio () {
			var $this = $(this);
			if (!$this.data('fu.radio')) {
				$this.radio($this.data());
			}
		});


	    $('[data-spy="scroll"]').each(function () {
	      var $this = $(this)
	      $this.scrollspy();
	    })
						
		$('[data-initialize=search]').each(function () {
			var $this = $(this);
			if ($this.data('fu.search')) return;
			$this.search($this.data());
		});

		$('[data-initialize=selectlist]').each(function () {
			var $this = $(this);
			if (!$this.data('fu.selectlist')) {
				$this.selectlist($this.data());
			}
		});

		$('[data-initialize=spinbox]').each(function () {
			var $this = $(this);
			if (!$this.data('fu.spinbox')) {
				$this.spinbox($this.data());
			}
		});	

		$('[data-initialize=wizard]').each(function () {
			var $this = $(this);
			if ($this.data('fu.wizard')) return;
			$this.wizard($this.data());
		});		
	});

});
