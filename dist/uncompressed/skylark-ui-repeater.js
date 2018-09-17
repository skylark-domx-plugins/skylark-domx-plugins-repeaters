/**
 * skylark-ui-repeater - The skylark repeater widget
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylarkui/skylark-ui-repeater/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
  	  require = globals.require,
  	  isAmd = (typeof define === 'function' && define.amd),
  	  isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");    
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                exports: null
            };
            require(id);
        } else {
            resolved[id] = factory;
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.exports) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(window, args);
        }
        return module.exports;
    };
  }

  factory(define,require);

  if (!isAmd) { 
    if (isCmd) {
      exports = require("skylark-langx/skylark");
    } else {
      if (!globals.skylarkjs) {
         globals.skylarkjs = require("skylark-langx/skylark");
      }

    }
  }

})(function(define,require) {

/**
 * skylark-fuelux - A version of fuelux that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.2
 * @link https://github.com/skylarkui/skylark-fuelux/
 * @license MIT
 */
define('skylark-fuelux/sbswt',[
  "skylark-utils/skylark",
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/query",
  "skylark-utils/widgets"
],function(skylark,langx,browser,eventer,noder,geom,$,widgets){
	var ui = skylark.ui = skylark.ui || {}, 
		sbswt = ui.sbswt = {};

/*---------------------------------------------------------------------------------*/
	/*
	 * Fuel UX utilities.js
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */
	var CONST = {
		BACKSPACE_KEYCODE: 8,
		COMMA_KEYCODE: 188, // `,` & `<`
		DELETE_KEYCODE: 46,
		DOWN_ARROW_KEYCODE: 40,
		ENTER_KEYCODE: 13,
		TAB_KEYCODE: 9,
		UP_ARROW_KEYCODE: 38
	};

	var isShiftHeld = function isShiftHeld (e) { return e.shiftKey === true; };

	var isKey = function isKey (keyCode) {
		return function compareKeycodes (e) {
			return e.keyCode === keyCode;
		};
	};

	var isBackspaceKey = isKey(CONST.BACKSPACE_KEYCODE);
	var isDeleteKey = isKey(CONST.DELETE_KEYCODE);
	var isTabKey = isKey(CONST.TAB_KEYCODE);
	var isUpArrow = isKey(CONST.UP_ARROW_KEYCODE);
	var isDownArrow = isKey(CONST.DOWN_ARROW_KEYCODE);

	var ENCODED_REGEX = /&[^\s]*;/;
	/*
	 * to prevent double encoding decodes content in loop until content is encoding free
	 */
	var cleanInput = function cleanInput (questionableMarkup) {
		// check for encoding and decode
		while (ENCODED_REGEX.test(questionableMarkup)) {
			questionableMarkup = $('<i>').html(questionableMarkup).text();
		}

		// string completely decoded now encode it
		return $('<i>').text(questionableMarkup).html();
	};




	langx.mixin(sbswt, {
		CONST: CONST,
		cleanInput: cleanInput,
		isBackspaceKey: isBackspaceKey,
		isDeleteKey: isDeleteKey,
		isShiftHeld: isShiftHeld,
		isTabKey: isTabKey,
		isUpArrow: isUpArrow,
		isDownArrow: isDownArrow
	});

/*---------------------------------------------------------------------------------*/

	var WidgetBase = widgets.Widget.inherit({
        klassName: "WidgetBase",
    });


	langx.mixin(sbswt, {
		WidgetBase : WidgetBase
	});

	return sbswt;
});

/**
 * skylark-fuelux - A version of fuelux that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.2
 * @link https://github.com/skylarkui/skylark-fuelux/
 * @license MIT
 */
define('skylark-fuelux/loader',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){


	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */


	var old = $.fn.loader;

	// LOADER CONSTRUCTOR AND PROTOTYPE

	var Loader = sbswt.Loader = sbswt.WidgetBase.inherit({
		klassName: "Loader",

		init : function(element,options) {
			this.$element = $(element);
			this.options = langx.mixin({}, $.fn.loader.defaults, options);
		},
		destroy: function () {
			this.$element.remove();
			// any external bindings
			// [none]
			// empty elements to return to original markup
			// [none]
			// returns string of markup
			return this.$element[0].outerHTML;
		},

		ieRepaint: function () {},

		msieVersion: function () {},

		next: function () {},

		pause: function () {},

		play: function () {},

		previous: function () {},

		reset: function () {}
	});

	// LOADER PLUGIN DEFINITION

	$.fn.loader = function (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.loader');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.loader', (data = new Loader(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.loader.defaults = {};

	$.fn.loader.Constructor = Loader;

	$.fn.loader.noConflict = function () {
		$.fn.loader = old;
		return this;
	};

	// INIT LOADER ON DOMCONTENTLOADED
	/*
	$(function () {
		$('[data-initialize=loader]').each(function () {
			var $this = $(this);
			if (!$this.data('fu.loader')) {
				$this.loader($this.data());
			}
		});
	});
	*/

	return $.fn.loader;
});

/**
 * skylark-fuelux - A version of fuelux that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.2
 * @link https://github.com/skylarkui/skylark-fuelux/
 * @license MIT
 */
define('skylark-fuelux/selectlist',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){


	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	var old = $.fn.selectlist;
	// SELECT CONSTRUCTOR AND PROTOTYPE

	var Selectlist = sbswt.Selectlist = sbswt.WidgetBase.inherit({
		klassName: "Selectlist",

		init : function(element,options) {
			this.$element = $(element);
			this.options = langx.mixin({}, $.fn.selectlist.defaults, options);


			this.$button = this.$element.find('.btn.dropdown-toggle');
			this.$hiddenField = this.$element.find('.hidden-field');
			this.$label = this.$element.find('.selected-label');
			this.$dropdownMenu = this.$element.find('.dropdown-menu');

			this.$button.dropdown();

			this.$element.on('click.fu.selectlist', '.dropdown-menu a', langx.proxy(this.itemClicked, this));
			this.setDefaultSelection();

			if (options.resize === 'auto' || this.$element.attr('data-resize') === 'auto') {
				this.resize();
			}

			// if selectlist is empty or is one item, disable it
			var items = this.$dropdownMenu.children('li');
			if( items.length === 0) {
				this.disable();
				this.doSelect( $(this.options.emptyLabelHTML));
			}

			// support jumping focus to first letter in dropdown when key is pressed
			this.$element.on('shown.bs.dropdown', function () {
					var $this = $(this);
					// attach key listener when dropdown is shown
					$(document).on('keypress.fu.selectlist', function(e){

						// get the key that was pressed
						var key = String.fromCharCode(e.which);
						// look the items to find the first item with the first character match and set focus
						$this.find("li").each(function(idx,item){
							if ($(item).text().charAt(0).toLowerCase() === key) {
								$(item).children('a').focus();
								return false;
							}
						});

				});
			});

			// unbind key event when dropdown is hidden
			this.$element.on('hide.bs.dropdown', function () {
					$(document).off('keypress.fu.selectlist');
			});
		},

		destroy: function () {
			this.$element.remove();
			// any external bindings
			// [none]
			// empty elements to return to original markup
			// [none]
			// returns string of markup
			return this.$element[0].outerHTML;
		},

		doSelect: function ($item) {
			var $selectedItem;
			this.$selectedItem = $selectedItem = $item;

			this.$hiddenField.val(this.$selectedItem.attr('data-value'));
			this.$label.html($(this.$selectedItem.children()[0]).html());

			// clear and set selected item to allow declarative init state
			// unlike other controls, selectlist's value is stored internal, not in an input
			this.$element.find('li').each(function () {
				if ($selectedItem.is($(this))) {
					$(this).attr('data-selected', true);
				} else {
					$(this).removeData('selected').removeAttr('data-selected');
				}
			});
		},

		itemClicked: function (e) {
			this.$element.trigger('clicked.fu.selectlist', this.$selectedItem);

			e.preventDefault();
			// ignore if a disabled item is clicked
			if ($(e.currentTarget).parent('li').is('.disabled, :disabled')) { return; }

			// is clicked element different from currently selected element?
			if (!($(e.target).parent().is(this.$selectedItem))) {
				this.itemChanged(e);
			}

			// return focus to control after selecting an option
			this.$element.find('.dropdown-toggle').focus();
		},

		itemChanged: function (e) {
			//selectedItem needs to be <li> since the data is stored there, not in <a>
			this.doSelect($(e.target).closest('li'));

			// pass object including text and any data-attributes
			// to onchange event
			var data = this.selectedItem();
			// trigger changed event
			this.$element.trigger('changed.fu.selectlist', data);
		},

		resize: function () {
			var width = 0;
			var newWidth = 0;
			var sizer = $('<div/>').addClass('selectlist-sizer');


			if (Boolean($(document).find('html').hasClass('fuelux'))) {
				// default behavior for fuel ux setup. means fuelux was a class on the html tag
				$(document.body).append(sizer);
			} else {
				// fuelux is not a class on the html tag. So we'll look for the first one we find so the correct styles get applied to the sizer
				$('.fuelux:first').append(sizer);
			}

			sizer.append(this.$element.clone());

			this.$element.find('a').each(function () {
				sizer.find('.selected-label').text($(this).text());
				newWidth = sizer.find('.selectlist').outerWidth();
				newWidth = newWidth + sizer.find('.sr-only').outerWidth();
				if (newWidth > width) {
					width = newWidth;
				}
			});

			if (width <= 1) {
				return;
			}

			this.$button.css('width', width);
			this.$dropdownMenu.css('width', width);

			sizer.remove();
		},

		selectedItem: function () {
			var txt = this.$selectedItem.text();
			return langx.mixin({
				text: txt
			}, this.$selectedItem.data());
		},

		selectByText: function (text) {
			var $item = $([]);
			this.$element.find('li').each(function () {
				if ((this.textContent || this.innerText || $(this).text() || '').toLowerCase() === (text || '').toLowerCase()) {
					$item = $(this);
					return false;
				}
			});
			this.doSelect($item);
		},

		selectByValue: function (value) {
			var selector = 'li[data-value="' + value + '"]';
			this.selectBySelector(selector);
		},

		selectByIndex: function (index) {
			// zero-based index
			var selector = 'li:eq(' + index + ')';
			this.selectBySelector(selector);
		},

		selectBySelector: function (selector) {
			var $item = this.$element.find(selector);
			this.doSelect($item);
		},

		setDefaultSelection: function () {
			var $item = this.$element.find('li[data-selected=true]').eq(0);

			if ($item.length === 0) {
				$item = this.$element.find('li').has('a').eq(0);
			}

			this.doSelect($item);
		},

		enable: function () {
			this.$element.removeClass('disabled');
			this.$button.removeClass('disabled');
		},

		disable: function () {
			this.$element.addClass('disabled');
			this.$button.addClass('disabled');
		}

	});	


	Selectlist.prototype.getValue = Selectlist.prototype.selectedItem;


	// SELECT PLUGIN DEFINITION

	$.fn.selectlist = function (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.selectlist');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.selectlist', (data = new Selectlist(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.selectlist.defaults = {
		emptyLabelHTML: '<li data-value=""><a href="#">No items</a></li>'
	};

	$.fn.selectlist.Constructor = Selectlist;

	$.fn.selectlist.noConflict = function () {
		$.fn.selectlist = old;
		return this;
	};


	// DATA-API

	/*
	$(document).on('mousedown.fu.selectlist.data-api', '[data-initialize=selectlist]', function (e) {
		var $control = $(e.target).closest('.selectlist');
		if (!$control.data('fu.selectlist')) {
			$control.selectlist($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function () {
		$('[data-initialize=selectlist]').each(function () {
			var $this = $(this);
			if (!$this.data('fu.selectlist')) {
				$this.selectlist($this.data());
			}
		});
	});

	*/

	return $.fn.selectlist;
});

/**
 * skylark-fuelux - A version of fuelux that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.2
 * @link https://github.com/skylarkui/skylark-fuelux/
 * @license MIT
 */
define('skylark-fuelux/combobox',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){


	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	var old = $.fn.combobox;


	// COMBOBOX CONSTRUCTOR AND PROTOTYPE

	var Combobox = sbswt.Combobox = sbswt.WidgetBase.inherit({
		klassName: "Combobox",

		init : function(element,options) {
			this.$element = $(element);
			this.options = langx.mixin({}, $.fn.combobox.defaults, options);

			this.$dropMenu = this.$element.find('.dropdown-menu');
			this.$input = this.$element.find('input');
			this.$button = this.$element.find('.btn');
			this.$button.dropdown();
			this.$inputGroupBtn = this.$element.find('.input-group-btn');

			this.$element.on('click.fu.combobox', 'a', langx.proxy(this.itemclicked, this));
			this.$element.on('change.fu.combobox', 'input', langx.proxy(this.inputchanged, this));
			this.$element.on('shown.bs.dropdown', langx.proxy(this.menuShown, this));
			this.$input.on('keyup.fu.combobox', langx.proxy(this.keypress, this));

			// set default selection
			this.setDefaultSelection();

			// if dropdown is empty, disable it
			var items = this.$dropMenu.children('li');
			if( items.length === 0) {
				this.$button.addClass('disabled');
			}

			// filter on load in case the first thing they do is press navigational key to pop open the menu
			if (this.options.filterOnKeypress) {
				this.options.filter(this.$dropMenu.find('li'), this.$input.val(), this);
			}
		},

		destroy: function () {
			this.$element.remove();
			// remove any external bindings
			// [none]

			// set input value attrbute in markup
			this.$element.find('input').each(function () {
				$(this).attr('value', $(this).val());
			});

			// empty elements to return to original markup
			// [none]

			return this.$element[0].outerHTML;
		},

		doSelect: function ($item) {

			if (typeof $item[0] !== 'undefined') {
				// remove selection from old item, may result in remove and
				// re-addition of class if item is the same
				this.$element.find('li.selected:first').removeClass('selected');

				// add selection to new item
				this.$selectedItem = $item;
				this.$selectedItem.addClass('selected');

				// update input
				this.$input.val(this.$selectedItem.text().trim());
			} else {
				// this is a custom input, not in the menu
				this.$selectedItem = null;
				this.$element.find('li.selected:first').removeClass('selected');
			}
		},

		clearSelection: function () {
			this.$selectedItem = null;
			this.$input.val('');
			this.$dropMenu.find('li').removeClass('selected');
		},

		menuShown: function () {
			if (this.options.autoResizeMenu) {
				this.resizeMenu();
			}
		},

		resizeMenu: function () {
			var width = this.$element.outerWidth();
			this.$dropMenu.outerWidth(width);
		},

		selectedItem: function () {
			var item = this.$selectedItem;
			var data = {};

			if (item) {
				var txt = this.$selectedItem.text().trim();
				data = langx.mixin({
					text: txt
				}, this.$selectedItem.data());
			} else {
				data = {
					text: this.$input.val().trim(),
					notFound: true
				};
			}

			return data;
		},

		selectByText: function (text) {
			var $item = $([]);
			this.$element.find('li').each(function () {
				if ((this.textContent || this.innerText || $(this).text() || '').trim().toLowerCase() === (text || '').trim().toLowerCase()) {
					$item = $(this);
					return false;
				}
			});

			this.doSelect($item);
		},

		selectByValue: function (value) {
			var selector = 'li[data-value="' + value + '"]';
			this.selectBySelector(selector);
		},

		selectByIndex: function (index) {
			// zero-based index
			var selector = 'li:eq(' + index + ')';
			this.selectBySelector(selector);
		},

		selectBySelector: function (selector) {
			var $item = this.$element.find(selector);
			this.doSelect($item);
		},

		setDefaultSelection: function () {
			var selector = 'li[data-selected=true]:first';
			var item = this.$element.find(selector);

			if (item.length > 0) {
				// select by data-attribute
				this.selectBySelector(selector);
				item.removeData('selected');
				item.removeAttr('data-selected');
			}
		},

		enable: function () {
			this.$element.removeClass('disabled');
			this.$input.removeAttr('disabled');
			this.$button.removeClass('disabled');
		},

		disable: function () {
			this.$element.addClass('disabled');
			this.$input.attr('disabled', true);
			this.$button.addClass('disabled');
		},

		itemclicked: function (e) {
			this.$selectedItem = $(e.target).parent();

			// set input text and trigger input change event marked as synthetic
			this.$input.val(this.$selectedItem.text().trim()).trigger('change', {
				synthetic: true
			});

			// pass object including text and any data-attributes
			// to onchange event
			var data = this.selectedItem();

			// trigger changed event
			this.$element.trigger('changed.fu.combobox', data);

			e.preventDefault();

			// return focus to control after selecting an option
			this.$element.find('.dropdown-toggle').focus();
		},

		keypress: function (e) {
			var ENTER = 13;
			//var TAB = 9;
			var ESC = 27;
			var LEFT = 37;
			var UP = 38;
			var RIGHT = 39;
			var DOWN = 40;

			var IS_NAVIGATIONAL = (
				e.which === UP ||
				e.which === DOWN ||
				e.which === LEFT ||
				e.which === RIGHT
			);

			if(this.options.showOptionsOnKeypress && !this.$inputGroupBtn.hasClass('open')){
				this.$button.dropdown('toggle');
				this.$input.focus();
			}

			if (e.which === ENTER) {
				e.preventDefault();

				var selected = this.$dropMenu.find('li.selected').text().trim();
				if(selected.length > 0){
					this.selectByText(selected);
				}else{
					this.selectByText(this.$input.val());
				}

				this.$inputGroupBtn.removeClass('open');
			} else if (e.which === ESC) {
				e.preventDefault();
				this.clearSelection();
				this.$inputGroupBtn.removeClass('open');
			} else if (this.options.showOptionsOnKeypress) {
				if (e.which === DOWN || e.which === UP) {
					e.preventDefault();
					var $selected = this.$dropMenu.find('li.selected');
					if ($selected.length > 0) {
						if (e.which === DOWN) {
							$selected = $selected.next(':not(.hidden)');
						} else {
							$selected = $selected.prev(':not(.hidden)');
						}
					}

					if ($selected.length === 0){
						if (e.which === DOWN) {
							$selected = this.$dropMenu.find('li:not(.hidden):first');
						} else {
							$selected = this.$dropMenu.find('li:not(.hidden):last');
						}
					}
					this.doSelect($selected);
				}
			}

			// Avoid filtering on navigation key presses
			if (this.options.filterOnKeypress && !IS_NAVIGATIONAL) {
				this.options.filter(this.$dropMenu.find('li'), this.$input.val(), this);
			}

			this.previousKeyPress = e.which;
		},

		inputchanged: function (e, extra) {
			var val = $(e.target).val();
			// skip processing for internally-generated synthetic event
			// to avoid double processing
			if (extra && extra.synthetic) {
				this.selectByText(val);
				return;
			}
			this.selectByText(val);

			// find match based on input
			// if no match, pass the input value
			var data = this.selectedItem();
			if (data.text.length === 0) {
				data = {
					text: val
				};
			}

			// trigger changed event
			this.$element.trigger('changed.fu.combobox', data);
		}

	});



	Combobox.prototype.getValue = Combobox.prototype.selectedItem;

	// COMBOBOX PLUGIN DEFINITION

	$.fn.combobox = function (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.combobox');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.combobox', (data = new Combobox(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.combobox.defaults = {

		autoResizeMenu: true,
		filterOnKeypress: false,
		showOptionsOnKeypress: false,
		filter: function filter (list, predicate, self) {
			var visible = 0;
			self.$dropMenu.find('.empty-indicator').remove();

			list.each(function (i) {
				var $li = $(this);
				var text = $(this).text().trim();

				$li.removeClass();

				if (text === predicate) {
					$li.addClass('text-success');
					visible++;
				} else if (text.substr(0, predicate.length) === predicate) {
					$li.addClass('text-info');
					visible++;
				} else {
					$li.addClass('hidden');
				}
			});

			if (visible === 0) {
				self.$dropMenu.append('<li class="empty-indicator text-muted"><em>No Matches</em></li>');
			}
		}
	};

	$.fn.combobox.Constructor =  Combobox;

	$.fn.combobox.noConflict = function () {
		$.fn.combobox = old;
		return this;
	};

	// DATA-API

	/*

	$(document).on('mousedown.fu.combobox.data-api', '[data-initialize=combobox]', function (e) {
		var $control = $(e.target).closest('.combobox');
		if (!$control.data('fu.combobox')) {
			$control.combobox($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function () {
		$('[data-initialize=combobox]').each(function () {
			var $this = $(this);
			if (!$this.data('fu.combobox')) {
				$this.combobox($this.data());
			}
		});
	});
	*/

	return $.fn.combobox;
});

define('skylark-ui-repeater/repeater',[
  "skylark-utils/skylark",
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "skylark-utils/widgets",
  "skylark-fuelux/loader",
  "skylark-fuelux/selectlist",
  "skylark-fuelux/combobox"  
],function(skylark,langx,browser,eventer,noder,geom,velm,$,widgets){

	var ui = skylark.ui = skylark.ui || {};

	/*
	 * Repeater
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	var old = $.fn.repeater;

	// REPEATER CONSTRUCTOR AND PROTOTYPE

	var Repeater = ui.Repeater = widgets.Widget.inherit({
		klassName: "Repeater",

		init : function(element,options) {
			var self = this;
			var $btn;
			var currentView;

			this.$element = $(element);

			this.$canvas = this.$element.find('.repeater-canvas');
			this.$count = this.$element.find('.repeater-count');
			this.$end = this.$element.find('.repeater-end');
			this.$filters = this.$element.find('.repeater-filters');
			this.$loader = this.$element.find('.repeater-loader');
			this.$pageSize = this.$element.find('.repeater-itemization .selectlist');
			this.$nextBtn = this.$element.find('.repeater-next');
			this.$pages = this.$element.find('.repeater-pages');
			this.$prevBtn = this.$element.find('.repeater-prev');
			this.$primaryPaging = this.$element.find('.repeater-primaryPaging');
			this.$search = this.$element.find('.repeater-search').find('.search');
			this.$secondaryPaging = this.$element.find('.repeater-secondaryPaging');
			this.$start = this.$element.find('.repeater-start');
			this.$viewport = this.$element.find('.repeater-viewport');
			this.$views = this.$element.find('.repeater-views');

			this.$element.on('mousedown.bs.dropdown.data-api', '[data-toggle="dropdown"]',function(e) {
				$(this).dropdown();
			}); 

			this.currentPage = 0;
			this.currentView = null;
			this.isDisabled = false;
			this.infiniteScrollingCallback = function noop () {};
			this.infiniteScrollingCont = null;
			this.infiniteScrollingEnabled = false;
			this.infiniteScrollingEnd = null;
			this.infiniteScrollingOptions = {};
			this.lastPageInput = 0;
			this.options = langx.mixin({}, $.fn.repeater.defaults, options);
			this.pageIncrement = 0;// store direction navigated
			this.resizeTimeout = {};
			this.stamp = new Date().getTime() + (Math.floor(Math.random() * 100) + 1);
			this.storedDataSourceOpts = null;
			this.syncingViewButtonState = false;
			this.viewOptions = {};
			this.viewType = null;

			this.$filters.selectlist();
			this.$pageSize.selectlist();
			this.$primaryPaging.find('.combobox').combobox();
			this.$search.search({
				searchOnKeyPress: this.options.searchOnKeyPress,
				allowCancel: this.options.allowCancel
			});

			this.$filters.on('changed.fu.selectlist', function onFiltersChanged (e, value) {
				self.$element.trigger('filtered.fu.repeater', value);
				self.render({
					clearInfinite: true,
					pageIncrement: null
				});
			});
			this.$nextBtn.on('click.fu.repeater', langx.proxy(this.next, this));
			this.$pageSize.on('changed.fu.selectlist', function onPageSizeChanged (e, value) {
				self.$element.trigger('pageSizeChanged.fu.repeater', value);
				self.render({
					pageIncrement: null
				});
			});
			this.$prevBtn.on('click.fu.repeater', langx.proxy(this.previous, this));
			this.$primaryPaging.find('.combobox').on('changed.fu.combobox', function onPrimaryPagingChanged (evt, data) {
				self.pageInputChange(data.text, data);
			});
			this.$search.on('searched.fu.search cleared.fu.search', function onSearched (e, value) {
				self.$element.trigger('searchChanged.fu.repeater', value);
				self.render({
					clearInfinite: true,
					pageIncrement: null
				});
			});
			this.$search.on('canceled.fu.search', function onSearchCanceled (e, value) {
				self.$element.trigger('canceled.fu.repeater', value);
				self.render({
					clearInfinite: true,
					pageIncrement: null
				});
			});

			this.$secondaryPaging.on('blur.fu.repeater', function onSecondaryPagingBlur () {
				self.pageInputChange(self.$secondaryPaging.val());
			});
			this.$secondaryPaging.on('keyup', function onSecondaryPagingKeyup (e) {
				if (e.keyCode === 13) {
					self.pageInputChange(self.$secondaryPaging.val());
				}
			});
			this.$views.find('input').on('change.fu.repeater', langx.proxy(this.viewChanged, this));

			$(window).on('resize.fu.repeater.' + this.stamp, function onResizeRepeater () {
				clearTimeout(self.resizeTimeout);
				self.resizeTimeout = setTimeout(function resizeTimeout () {
					self.resize();
					self.$element.trigger('resized.fu.repeater');
				}, 75);
			});

			this.$loader.loader();
			this.$loader.loader('pause');
			if (this.options.defaultView !== -1) {
				currentView = this.options.defaultView;
			} else {
				$btn = this.$views.find('label.active input');
				currentView = ($btn.length > 0) ? $btn.val() : 'list';
			}

			this.setViewOptions(currentView);

			this.initViewTypes(function initViewTypes () {
				self.resize();
				self.$element.trigger('resized.fu.repeater');
				self.render({
					changeView: currentView
				});
			});
		},

		clear: function clear (opts) {
			var options = opts || {};

			if (!options.preserve) {
				// Just trash everything because preserve is false
				this.$canvas.empty();
			} else if (!this.infiniteScrollingEnabled || options.clearInfinite) {
				// Preserve clear only if infiniteScrolling is disabled or if specifically told to do so
				scan(this.$canvas);
			} // Otherwise don't clear because infiniteScrolling is enabled

			// If viewChanged and current viewTypeObj has a cleared function, call it
			var viewChanged = (options.viewChanged !== undefined) ? options.viewChanged : false;
			var viewTypeObj = $.fn.repeater.viewTypes[this.viewType] || {};
			if (!viewChanged && viewTypeObj.cleared) {
				viewTypeObj.cleared.call(this, {
					options: options
				});
			}
		},

		clearPreservedDataSourceOptions: function clearPreservedDataSourceOptions () {
			this.storedDataSourceOpts = null;
		},

		destroy: function destroy () {
			var markup;
			// set input value attrbute in markup
			this.$element.find('input').each(function eachInput () {
				$(this).attr('value', $(this).val());
			});

			// empty elements to return to original markup
			this.$canvas.empty();
			markup = this.$element[0].outerHTML;

			// destroy components and remove leftover
			this.$element.find('.combobox').combobox('destroy');
			this.$element.find('.selectlist').selectlist('destroy');
			this.$element.find('.search').search('destroy');
			if (this.infiniteScrollingEnabled) {
				$(this.infiniteScrollingCont).infinitescroll('destroy');
			}

			this.$element.remove();

			// any external events
			$(window).off('resize.fu.repeater.' + this.stamp);

			return markup;
		},

		disable: function disable () {
			var viewTypeObj = $.fn.repeater.viewTypes[this.viewType] || {};

			this.$search.search('disable');
			this.$filters.selectlist('disable');
			this.$views.find('label, input').addClass('disabled').attr('disabled', 'disabled');
			this.$pageSize.selectlist('disable');
			this.$primaryPaging.find('.combobox').combobox('disable');
			this.$secondaryPaging.attr('disabled', 'disabled');
			this.$prevBtn.attr('disabled', 'disabled');
			this.$nextBtn.attr('disabled', 'disabled');

			if (viewTypeObj.enabled) {
				viewTypeObj.enabled.call(this, {
					status: false
				});
			}

			this.isDisabled = true;
			this.$element.addClass('disabled');
			this.$element.trigger('disabled.fu.repeater');
		},

		enable: function enable () {
			var viewTypeObj = $.fn.repeater.viewTypes[this.viewType] || {};

			this.$search.search('enable');
			this.$filters.selectlist('enable');
			this.$views.find('label, input').removeClass('disabled').removeAttr('disabled');
			this.$pageSize.selectlist('enable');
			this.$primaryPaging.find('.combobox').combobox('enable');
			this.$secondaryPaging.removeAttr('disabled');

			if (!this.$prevBtn.hasClass('page-end')) {
				this.$prevBtn.removeAttr('disabled');
			}
			if (!this.$nextBtn.hasClass('page-end')) {
				this.$nextBtn.removeAttr('disabled');
			}

			// is 0 or 1 pages, if using $primaryPaging (combobox)
			// if using selectlist allow user to use selectlist to select 0 or 1
			if (this.$prevBtn.hasClass('page-end') && this.$nextBtn.hasClass('page-end')) {
				this.$primaryPaging.combobox('disable');
			}

			// if there are no items
			if (parseInt(this.$count.html(), 10) !== 0) {
				this.$pageSize.selectlist('enable');
			} else {
				this.$pageSize.selectlist('disable');
			}

			if (viewTypeObj.enabled) {
				viewTypeObj.enabled.call(this, {
					status: true
				});
			}

			this.isDisabled = false;
			this.$element.removeClass('disabled');
			this.$element.trigger('enabled.fu.repeater');
		},

		getDataOptions: function getDataOptions (opts) {
			var options = opts || {};
			if (options.pageIncrement !== undefined) {
				if (options.pageIncrement === null) {
					this.currentPage = 0;
				} else {
					this.currentPage += options.pageIncrement;
				}
			}

			var dataSourceOptions = {};
			if (options.dataSourceOptions) {
				dataSourceOptions = options.dataSourceOptions;

				if (options.preserveDataSourceOptions) {
					if (this.storedDataSourceOpts) {
						this.storedDataSourceOpts = langx.mixin(this.storedDataSourceOpts, dataSourceOptions);
					} else {
						this.storedDataSourceOpts = dataSourceOptions;
					}
				}
			}

			if (this.storedDataSourceOpts) {
				dataSourceOptions = langx.mixin(this.storedDataSourceOpts, dataSourceOptions);
			}

			var returnOptions = {
				view: this.currentView,
				pageIndex: this.currentPage,
				filter: {
					text: 'All',
					value: 'all'
				}
			};
			if (this.$filters.length > 0) {
				returnOptions.filter = this.$filters.selectlist('selectedItem');
			}

			if (!this.infiniteScrollingEnabled) {
				returnOptions.pageSize = 25;

				if (this.$pageSize.length > 0) {
					returnOptions.pageSize = parseInt(this.$pageSize.selectlist('selectedItem').value, 10);
				}
			}

			var searchValue = this.$search && this.$search.find('input') && this.$search.find('input').val();
			if (searchValue !== '') {
				returnOptions.search = searchValue;
			}

			var viewType = $.fn.repeater.viewTypes[this.viewType] || {};
			var addViewTypeData = viewType.dataOptions;
			if (addViewTypeData) {
				returnOptions = addViewTypeData.call(this, returnOptions);
			}

			returnOptions = langx.mixin(returnOptions, dataSourceOptions);

			return returnOptions;
		},

		infiniteScrolling: function infiniteScrolling (enable, opts) {
			var footer = this.$element.find('.repeater-footer');
			var viewport = this.$element.find('.repeater-viewport');
			var options = opts || {};

			if (enable) {
				this.infiniteScrollingEnabled = true;
				this.infiniteScrollingEnd = options.end;
				delete options.dataSource;
				delete options.end;
				this.infiniteScrollingOptions = options;
				viewport.css({
					height: viewport.height() + footer.outerHeight()
				});
				footer.hide();
			} else {
				var cont = this.infiniteScrollingCont;
				var data = cont.data();
				delete data.infinitescroll;
				cont.off('scroll');
				cont.removeClass('infinitescroll');

				this.infiniteScrollingCont = null;
				this.infiniteScrollingEnabled = false;
				this.infiniteScrollingEnd = null;
				this.infiniteScrollingOptions = {};
				viewport.css({
					height: viewport.height() - footer.outerHeight()
				});
				footer.show();
			}
		},

		infiniteScrollPaging: function infiniteScrollPaging (data) {
			var end = (this.infiniteScrollingEnd !== true) ? this.infiniteScrollingEnd : undefined;
			var page = data.page;
			var pages = data.pages;

			this.currentPage = (page !== undefined) ? page : NaN;

			if (data.end === true || (this.currentPage + 1) >= pages) {
				this.infiniteScrollingCont.infinitescroll('end', end);
			}
		},

		initInfiniteScrolling: function initInfiniteScrolling () {
			var cont = this.$canvas.find('[data-infinite="true"]:first');

			cont = (cont.length < 1) ? this.$canvas : cont;
			if (cont.data('fu.infinitescroll')) {
				cont.infinitescroll('enable');
			} else {
				var self = this;
				var opts = langx.mixin({}, this.infiniteScrollingOptions);
				opts.dataSource = function dataSource (helpers, callback) {
					self.infiniteScrollingCallback = callback;
					self.render({
						pageIncrement: 1
					});
				};
				cont.infinitescroll(opts);
				this.infiniteScrollingCont = cont;
			}
		},

		initViewTypes: function initViewTypes (callback) {
			var viewTypes = [];

			for (var key in $.fn.repeater.viewTypes) {
				if ({}.hasOwnProperty.call($.fn.repeater.viewTypes, key)) {
					viewTypes.push($.fn.repeater.viewTypes[key]);
				}
			}

			if (viewTypes.length > 0) {
				initViewType.call(this, 0, viewTypes, callback);
			} else {
				callback();
			}
		},

		itemization: function itemization (data) {
			this.$count.html((data.count !== undefined) ? data.count : '?');
			this.$end.html((data.end !== undefined) ? data.end : '?');
			this.$start.html((data.start !== undefined) ? data.start : '?');
		},

		next: function next () {
			this.$nextBtn.attr('disabled', 'disabled');
			this.$prevBtn.attr('disabled', 'disabled');
			this.pageIncrement = 1;
			this.$element.trigger('nextClicked.fu.repeater');
			this.render({
				pageIncrement: this.pageIncrement
			});
		},

		pageInputChange: function pageInputChange (val, dataFromCombobox) {
			// dataFromCombobox is a proxy for data from combobox's changed event,
			// if no combobox is present data will be undefined
			var pageInc;
			if (val !== this.lastPageInput) {
				this.lastPageInput = val;
				var value = parseInt(val, 10) - 1;
				pageInc = value - this.currentPage;
				this.$element.trigger('pageChanged.fu.repeater', [value, dataFromCombobox]);
				this.render({
					pageIncrement: pageInc
				});
			}
		},

		pagination: function pagination (data) {
			this.$primaryPaging.removeClass('active');
			this.$secondaryPaging.removeClass('active');

			var totalPages = data.pages;
			this.currentPage = (data.page !== undefined) ? data.page : NaN;
			// set paging to 0 if total pages is 0, otherwise use one-based index
			var currenPageOutput = totalPages === 0 ? 0 : this.currentPage + 1;

			if (totalPages <= this.viewOptions.dropPagingCap) {
				this.$primaryPaging.addClass('active');
				var dropMenu = this.$primaryPaging.find('.dropdown-menu');
				dropMenu.empty();
				for (var i = 0; i < totalPages; i++) {
					var l = i + 1;
					dropMenu.append('<li data-value="' + l + '"><a href="#">' + l + '</a></li>');
				}

				this.$primaryPaging.find('input.form-control').val(currenPageOutput);
			} else {
				this.$secondaryPaging.addClass('active');
				this.$secondaryPaging.val(currenPageOutput);
			}

			this.lastPageInput = this.currentPage + 1 + '';

			this.$pages.html('' + totalPages);

			// this is not the last page
			if ((this.currentPage + 1) < totalPages) {
				this.$nextBtn.removeAttr('disabled');
				this.$nextBtn.removeClass('page-end');
			} else {
				this.$nextBtn.attr('disabled', 'disabled');
				this.$nextBtn.addClass('page-end');
			}

			// this is not the first page
			if ((this.currentPage - 1) >= 0) {
				this.$prevBtn.removeAttr('disabled');
				this.$prevBtn.removeClass('page-end');
			} else {
				this.$prevBtn.attr('disabled', 'disabled');
				this.$prevBtn.addClass('page-end');
			}

			// return focus to next/previous buttons after navigating
			if (this.pageIncrement !== 0) {
				if (this.pageIncrement > 0) {
					if (this.$nextBtn.is(':disabled')) {
						// if you can't focus, go the other way
						this.$prevBtn.focus();
					} else {
						this.$nextBtn.focus();
					}
				} else if (this.$prevBtn.is(':disabled')) {
					// if you can't focus, go the other way
					this.$nextBtn.focus();
				} else {
					this.$prevBtn.focus();
				}
			}
		},

		previous: function previous () {
			this.$nextBtn.attr('disabled', 'disabled');
			this.$prevBtn.attr('disabled', 'disabled');
			this.pageIncrement = -1;
			this.$element.trigger('previousClicked.fu.repeater');
			this.render({
				pageIncrement: this.pageIncrement
			});
		},

		// This functions more as a "pre-render" than a true "render"
		render: function render (opts) {
			this.disable();

			var viewChanged = false;
			var viewTypeObj = $.fn.repeater.viewTypes[this.viewType] || {};
			var options = opts || {};

			if (options.changeView && (this.currentView !== options.changeView)) {
				var prevView = this.currentView;
				this.currentView = options.changeView;
				this.viewType = this.currentView.split('.')[0];
				this.setViewOptions(this.currentView);
				this.$element.attr('data-currentview', this.currentView);
				this.$element.attr('data-viewtype', this.viewType);
				viewChanged = true;
				options.viewChanged = viewChanged;

				this.$element.trigger('viewChanged.fu.repeater', this.currentView);

				if (this.infiniteScrollingEnabled) {
					this.infiniteScrolling(false);
				}

				viewTypeObj = $.fn.repeater.viewTypes[this.viewType] || {};
				if (viewTypeObj.selected) {
					viewTypeObj.selected.call(this, {
						prevView: prevView
					});
				}
			}

			this.syncViewButtonState();

			options.preserve = (options.preserve !== undefined) ? options.preserve : !viewChanged;
			this.clear(options);

			if (!this.infiniteScrollingEnabled || (this.infiniteScrollingEnabled && viewChanged)) {
				this.$loader.show().loader('play');
			}

			var dataOptions = this.getDataOptions(options);

			var beforeRender = this.viewOptions.dataSource;
			var repeaterPrototypeContext = this;
			beforeRender(
				dataOptions,
				// this serves as a bridge function to pass all required data through to the actual function
				// that does the rendering for us.
				function callDoRender (dataSourceReturnedData) {
					doRender.call(
						repeaterPrototypeContext,
						{
							data: dataSourceReturnedData,
							dataOptions: dataOptions,
							options: options,
							viewChanged: viewChanged,
							viewTypeObj: viewTypeObj
						}
					);
				}
			);
		},

		resize: function resize () {
			var staticHeight = (this.viewOptions.staticHeight === -1) ? this.$element.attr('data-staticheight') : this.viewOptions.staticHeight;
			var viewTypeObj = {};
			var height;
			var viewportMargins;
			var scrubbedElements = [];
			var previousProperties = [];
			//var $hiddenElements = this.$element.parentsUntil(':visible').addBack(); // del addBack() not supported by skyalrk
			var $hiddenElements = this.$element.parentsUntil(':visible');
			var currentHiddenElement;
			var currentElementIndex = 0;

			// Set parents to 'display:block' until repeater is visible again
			while (currentElementIndex < $hiddenElements.length && this.$element.is(':hidden')) {
				currentHiddenElement = $hiddenElements[currentElementIndex];
				// Only set display property on elements that are explicitly hidden (i.e. do not inherit it from their parent)
				if ($(currentHiddenElement).is(':hidden')) {
					previousProperties.push(currentHiddenElement.style['display']);
					currentHiddenElement.style['display'] = 'block';
					scrubbedElements.push(currentHiddenElement);
				}
				currentElementIndex++;
			}

			if (this.viewType) {
				viewTypeObj = $.fn.repeater.viewTypes[this.viewType] || {};
			}

			if (staticHeight !== undefined && staticHeight !== false && staticHeight !== 'false') {
				this.$canvas.addClass('scrolling');
				viewportMargins = {
					bottom: this.$viewport.css('margin-bottom'),
					top: this.$viewport.css('margin-top')
				};

				var staticHeightValue = (staticHeight === 'true' || staticHeight === true) ? this.$element.height() : parseInt(staticHeight, 10);
				var headerHeight = this.$element.find('.repeater-header').outerHeight();
				var footerHeight = this.$element.find('.repeater-footer').outerHeight();
				var bottomMargin = (viewportMargins.bottom === 'auto') ? 0 : parseInt(viewportMargins.bottom, 10);
				var topMargin = (viewportMargins.top === 'auto') ? 0 : parseInt(viewportMargins.top, 10);

				height = staticHeightValue - headerHeight - footerHeight - bottomMargin - topMargin;
				this.$viewport.outerHeight(height);
			} else {
				this.$canvas.removeClass('scrolling');
			}

			if (viewTypeObj.resize) {
				viewTypeObj.resize.call(this, {
					height: this.$element.outerHeight(),
					width: this.$element.outerWidth()
				});
			}

			scrubbedElements.forEach(function (element, i) {
				element.style['display'] = previousProperties[i];
			});
		},

		// e.g. "Rows" or "Thumbnails"
		renderItems: function renderItems (viewTypeObj, data, callback) {
			if (!viewTypeObj.render) {
				if (viewTypeObj.before) {
					var addBefore = viewTypeObj.before.call(this, {
						container: this.$canvas,
						data: data
					});
					addItem(this.$canvas, addBefore);
				}

				var $dataContainer = this.$canvas.find('[data-container="true"]:last');
				var $container = ($dataContainer.length > 0) ? $dataContainer : this.$canvas;

				// It appears that the following code would theoretically allow you to pass a deeply
				// nested value to "repeat on" to be added to the repeater.
				// eg. `data.foo.bar.items`
				if (viewTypeObj.renderItem) {
					var subset;
					var objectAndPropsToRepeatOnString = viewTypeObj.repeat || 'data.items';
					var objectAndPropsToRepeatOn = objectAndPropsToRepeatOnString.split('.');
					var objectToRepeatOn = objectAndPropsToRepeatOn[0];

					if (objectToRepeatOn === 'data' || objectToRepeatOn === 'this') {
						subset = (objectToRepeatOn === 'this') ? this : data;

						// Extracts subset from object chain (get `items` out of `foo.bar.items`). I think....
						var propsToRepeatOn = objectAndPropsToRepeatOn.slice(1);
						for (var prop = 0; prop < propsToRepeatOn.length; prop++) {
							if (subset[propsToRepeatOn[prop]] !== undefined) {
								subset = subset[propsToRepeatOn[prop]];
							} else {
								subset = [];
								logWarn('WARNING: Repeater unable to find property to iterate renderItem on.');
								break;
							}
						}

						for (var subItemIndex = 0; subItemIndex < subset.length; subItemIndex++) {
							var addSubItem = viewTypeObj.renderItem.call(this, {
								container: $container,
								data: data,
								index: subItemIndex,
								subset: subset
							});
							addItem($container, addSubItem);
						}
					} else {
						logWarn('WARNING: Repeater plugin "repeat" value must start with either "data" or "this"');
					}
				}

				if (viewTypeObj.after) {
					var addAfter = viewTypeObj.after.call(this, {
						container: this.$canvas,
						data: data
					});
					addItem(this.$canvas, addAfter);
				}

				callback(data);
			} else {
				viewTypeObj.render.call(this, {
					container: this.$canvas,
					data: data
				}, callback);
			}
		},

		setViewOptions: function setViewOptions (curView) {
			var opts = {};
			var viewName = curView.split('.')[1];

			if (this.options.views) {
				opts = this.options.views[viewName] || this.options.views[curView] || {};
			} else {
				opts = {};
			}

			this.viewOptions = langx.mixin({}, this.options, opts);
		},

		viewChanged: function viewChanged (e) {
			var $selected = $(e.target);
			var val = $selected.val();

			if (!this.syncingViewButtonState) {
				if (this.isDisabled || $selected.parents('label:first').hasClass('disabled')) {
					this.syncViewButtonState();
				} else {
					this.render({
						changeView: val,
						pageIncrement: null
					});
				}
			}
		},

		syncViewButtonState: function syncViewButtonState () {
			var $itemToCheck = this.$views.find('input[value="' + this.currentView + '"]');

			this.syncingViewButtonState = true;
			this.$views.find('input').prop('checked', false);
			this.$views.find('label.active').removeClass('active');

			if ($itemToCheck.length > 0) {
				$itemToCheck.prop('checked', true);
				$itemToCheck.parents('label:first').addClass('active');
			}
			this.syncingViewButtonState = false;
		}
		
	});

	var logWarn = function logWarn (msg) {
		if (window.console && window.console.warn) {
			window.console.warn(msg);
		}
	};

	var scan = function scan (cont) {
		var keep = [];
		cont.children().each(function eachContainerChild () {
			var item = $(this);
			var pres = item.attr('data-preserve');
			if (pres === 'deep') {
				item.detach();
				keep.push(item);
			} else if (pres === 'shallow') {
				scan(item);
				item.detach();
				keep.push(item);
			}
		});
		cont.empty();
		cont.append(keep);
	};

	var addItem = function addItem ($parent, response) {
		var action;
		if (response) {
			action = (response.action) ? response.action : 'append';
			if (action !== 'none' && response.item !== undefined) {
				var $container = (response.container !== undefined) ? $(response.container) : $parent;
				$container[action](response.item);
			}
		}
	};

	var callNextInit = function callNextInit (currentViewType, viewTypes, callback) {
		var nextViewType = currentViewType + 1;
		if (nextViewType < viewTypes.length) {
			initViewType.call(this, nextViewType, viewTypes, callback);
		} else {
			callback();
		}
	};

	var initViewType = function initViewType (currentViewtype, viewTypes, callback) {
		if (viewTypes[currentViewtype].initialize) {
			viewTypes[currentViewtype].initialize.call(this, {}, function afterInitialize () {
				callNextInit.call(this, currentViewtype, viewTypes, callback);
			});
		} else {
			callNextInit.call(this, currentViewtype, viewTypes, callback);
		}
	};

	// Does all of our cleanup post-render
	var afterRender = function afterRender (state) {
		var data = state.data || {};

		if (this.infiniteScrollingEnabled) {
			if (state.viewChanged || state.options.clearInfinite) {
				this.initInfiniteScrolling();
			}

			this.infiniteScrollPaging(data, state.options);
		}

		this.$loader.hide().loader('pause');
		this.enable();

		this.$search.trigger('rendered.fu.repeater', {
			data: data,
			options: state.dataOptions,
			renderOptions: state.options
		});
		this.$element.trigger('rendered.fu.repeater', {
			data: data,
			options: state.dataOptions,
			renderOptions: state.options
		});

		// for maintaining support of 'loaded' event
		this.$element.trigger('loaded.fu.repeater', state.dataOptions);
	};

	// This does the actual rendering of the repeater
	var doRender = function doRender (state) {
		var data = state.data || {};

		if (this.infiniteScrollingEnabled) {
			// pass empty object because data handled in infiniteScrollPaging method
			this.infiniteScrollingCallback({});
		} else {
			this.itemization(data);
			this.pagination(data);
		}

		var self = this;
		this.renderItems(
			state.viewTypeObj,
			data,
			function callAfterRender (d) {
				state.data = d;
				afterRender.call(self, state);
			}
		);
	};



	// For backwards compatibility.
	Repeater.prototype.runRenderer = Repeater.prototype.renderItems;

	// REPEATER PLUGIN DEFINITION

	$.fn.repeater = function fnrepeater (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function eachThis () {
			var $this = $(this);
			var data = $this.data('fu.repeater');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.repeater', (data = new Repeater(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.repeater.defaults = {
		dataSource: function dataSource (options, callback) {
			callback({ count: 0, end: 0, items: [], page: 0, pages: 1, start: 0 });
		},
		defaultView: -1, // should be a string value. -1 means it will grab the active view from the view controls
		dropPagingCap: 10,
		staticHeight: -1, // normally true or false. -1 means it will look for data-staticheight on the element
		views: null, // can be set to an object to configure multiple views of the same type,
		searchOnKeyPress: false,
		allowCancel: true
	};

	$.fn.repeater.viewTypes = {};

	$.fn.repeater.Constructor = Repeater;

	$.fn.repeater.noConflict = function noConflict () {
		$.fn.repeater = old;
		return this;
	};


	return $.fn.repeater;

});

define('skylark-ui-repeater/repeater-list',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/query",
  "./repeater"
],function(langx,browser,eventer,noder,geom,$){

	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	if ($.fn.repeater) {
		// ADDITIONAL METHODS
		$.fn.repeater.Constructor.prototype.list_clearSelectedItems = function listClearSelectedItems () {
			this.$canvas.find('.repeater-list-check').remove();
			this.$canvas.find('.repeater-list table tbody tr.selected').removeClass('selected');
		};

		$.fn.repeater.Constructor.prototype.list_highlightColumn = function listHighlightColumn (index, force) {
			var tbody = this.$canvas.find('.repeater-list-wrapper > table tbody');
			if (this.viewOptions.list_highlightSortedColumn || force) {
				tbody.find('td.sorted').removeClass('sorted');
				tbody.find('tr').each(function eachTR () {
					var col = $(this).find('td:nth-child(' + (index + 1) + ')').filter(function filterChildren () { return !$(this).parent().hasClass('empty'); });
					col.addClass('sorted');
				});
			}
		};

		$.fn.repeater.Constructor.prototype.list_getSelectedItems = function listGetSelectedItems () {
			var selected = [];
			this.$canvas.find('.repeater-list .repeater-list-wrapper > table tbody tr.selected').each(function eachSelectedTR () {
				var $item = $(this);
				selected.push({
					data: $item.data('item_data'),
					element: $item
				});
			});
			return selected;
		};

		$.fn.repeater.Constructor.prototype.getValue = $.fn.repeater.Constructor.prototype.list_getSelectedItems;

		$.fn.repeater.Constructor.prototype.list_positionHeadings = function listPositionHeadings () {
			var $wrapper = this.$element.find('.repeater-list-wrapper');
			var offsetLeft = $wrapper.offset().left;
			var scrollLeft = $wrapper.scrollLeft();
			if (scrollLeft > 0) {
				$wrapper.find('.repeater-list-heading').each(function eachListHeading () {
					var $heading = $(this);
					var left = ($heading.parents('th:first').offset().left - offsetLeft) + 'px';
					$heading.addClass('shifted').css('left', left);
				});
			} else {
				$wrapper.find('.repeater-list-heading').each(function eachListHeading () {
					$(this).removeClass('shifted').css('left', '');
				});
			}
		};

		$.fn.repeater.Constructor.prototype.list_setSelectedItems = function listSetSelectedItems (itms, force) {
			var selectable = this.viewOptions.list_selectable;
			var self = this;
			var data;
			var i;
			var $item;
			var length;

			var items = itms;
			if (!$.isArray(items)) {
				items = [items];
			}

			// this function is necessary because lint yells when a function is in a loop
			var checkIfItemMatchesValue = function checkIfItemMatchesValue (rowIndex) {
				$item = $(this);

				data = $item.data('item_data') || {};
				if (data[items[i].property] === items[i].value) {
					selectItem($item, items[i].selected, rowIndex);
				}
			};

			var selectItem = function selectItem ($itm, slct, index) {
				var $frozenCols;

				var select = (slct !== undefined) ? slct : true;
				if (select) {
					if (!force && selectable !== 'multi') {
						self.list_clearSelectedItems();
					}

					if (!$itm.hasClass('selected')) {
						$itm.addClass('selected');

						if (self.viewOptions.list_frozenColumns || self.viewOptions.list_selectable === 'multi') {
							$frozenCols = self.$element.find('.frozen-column-wrapper tr:nth-child(' + (index + 1) + ')');

							$frozenCols.addClass('selected');
							$frozenCols.find('.repeater-select-checkbox').addClass('checked');
						}

						if (self.viewOptions.list_actions) {
							self.$element.find('.actions-column-wrapper tr:nth-child(' + (index + 1) + ')').addClass('selected');
						}

						$itm.find('td:first').prepend('<div class="repeater-list-check"><span class="glyphicon glyphicon-ok"></span></div>');
					}
				} else {
					if (self.viewOptions.list_frozenColumns) {
						$frozenCols = self.$element.find('.frozen-column-wrapper tr:nth-child(' + (index + 1) + ')');

						$frozenCols.addClass('selected');
						$frozenCols.find('.repeater-select-checkbox').removeClass('checked');
					}

					if (self.viewOptions.list_actions) {
						self.$element.find('.actions-column-wrapper tr:nth-child(' + (index + 1) + ')').removeClass('selected');
					}

					$itm.find('.repeater-list-check').remove();
					$itm.removeClass('selected');
				}
			};

			if (force === true || selectable === 'multi') {
				length = items.length;
			} else if (selectable) {
				length = (items.length > 0) ? 1 : 0;
			} else {
				length = 0;
			}

			for (i = 0; i < length; i++) {
				if (items[i].index !== undefined) {
					$item = this.$canvas.find('.repeater-list .repeater-list-wrapper > table tbody tr:nth-child(' + (items[i].index + 1) + ')');
					if ($item.length > 0) {
						selectItem($item, items[i].selected, items[i].index);
					}
				} else if (items[i].property !== undefined && items[i].value !== undefined) {
					this.$canvas.find('.repeater-list .repeater-list-wrapper > table tbody tr').each(checkIfItemMatchesValue);
				}
			}
		};

		$.fn.repeater.Constructor.prototype.list_sizeHeadings = function listSizeHeadings () {
			var $table = this.$element.find('.repeater-list table');
			$table.find('thead th').each(function eachTH () {
				var $th = $(this);
				var $heading = $th.find('.repeater-list-heading');
				$heading.css({ height: $th.outerHeight() });
				$heading.outerWidth($heading.data('forced-width') || $th.outerWidth());
			});
		};

		$.fn.repeater.Constructor.prototype.list_setFrozenColumns = function listSetFrozenColumns () {
			var frozenTable = this.$canvas.find('.table-frozen');
			var $wrapper = this.$element.find('.repeater-canvas');
			var $table = this.$element.find('.repeater-list .repeater-list-wrapper > table');
			var repeaterWrapper = this.$element.find('.repeater-list');
			var numFrozenColumns = this.viewOptions.list_frozenColumns;
			var self = this;

			if (this.viewOptions.list_selectable === 'multi') {
				numFrozenColumns = numFrozenColumns + 1;
				$wrapper.addClass('multi-select-enabled');
			}

			if (frozenTable.length < 1) {
				// setup frozen column markup
				// main wrapper and remove unneeded columns
				var $frozenColumnWrapper = $('<div class="frozen-column-wrapper"></div>').insertBefore($table);
				var $frozenColumn = $table.clone().addClass('table-frozen');
				$frozenColumn.find('th:not(:lt(' + numFrozenColumns + '))').remove();
				$frozenColumn.find('td:not(:nth-child(n+0):nth-child(-n+' + numFrozenColumns + '))').remove();

				// need to set absolute heading for vertical scrolling
				var $frozenThead = $frozenColumn.clone().removeClass('table-frozen');
				$frozenThead.find('tbody').remove();
				var $frozenTheadWrapper = $('<div class="frozen-thead-wrapper"></div>').append($frozenThead);

				// this gets a little messy with all the cloning. We need to make sure the ID and FOR
				// attribs are unique for the 'top most' cloned checkbox
				var $checkboxLabel = $frozenTheadWrapper.find('th label.checkbox-custom.checkbox-inline');
				$checkboxLabel.attr('id', $checkboxLabel.attr('id') + '_cloned');

				$frozenColumnWrapper.append($frozenColumn);
				repeaterWrapper.append($frozenTheadWrapper);
				this.$canvas.addClass('frozen-enabled');
			}

			this.list_sizeFrozenColumns();

			$('.frozen-thead-wrapper .repeater-list-heading').on('click', function onClickHeading () {
				var index = $(this).parent('th').index();
				index = index + 1;
				self.$element.find('.repeater-list-wrapper > table thead th:nth-child(' + index + ') .repeater-list-heading')[0].click();
			});
		};

		$.fn.repeater.Constructor.prototype.list_positionColumns = function listPositionColumns () {
			var $wrapper = this.$element.find('.repeater-canvas');
			var scrollTop = $wrapper.scrollTop();
			var scrollLeft = $wrapper.scrollLeft();
			var frozenEnabled = this.viewOptions.list_frozenColumns || this.viewOptions.list_selectable === 'multi';
			var actionsEnabled = this.viewOptions.list_actions;

			var canvasWidth = this.$element.find('.repeater-canvas').outerWidth();
			var tableWidth = this.$element.find('.repeater-list .repeater-list-wrapper > table').outerWidth();

			var actionsWidth = this.$element.find('.table-actions') ? this.$element.find('.table-actions').outerWidth() : 0;

			var shouldScroll = (tableWidth - (canvasWidth - actionsWidth)) >= scrollLeft;


			if (scrollTop > 0) {
				$wrapper.find('.repeater-list-heading').css('top', scrollTop);
			} else {
				$wrapper.find('.repeater-list-heading').css('top', '0');
			}

			if (scrollLeft > 0) {
				if (frozenEnabled) {
					$wrapper.find('.frozen-thead-wrapper').css('left', scrollLeft);
					$wrapper.find('.frozen-column-wrapper').css('left', scrollLeft);
				}
				if (actionsEnabled && shouldScroll) {
					$wrapper.find('.actions-thead-wrapper').css('right', -scrollLeft);
					$wrapper.find('.actions-column-wrapper').css('right', -scrollLeft);
				}
			} else {
				if (frozenEnabled) {
					$wrapper.find('.frozen-thead-wrapper').css('left', '0');
					$wrapper.find('.frozen-column-wrapper').css('left', '0');
				}
				if (actionsEnabled) {
					$wrapper.find('.actions-thead-wrapper').css('right', '0');
					$wrapper.find('.actions-column-wrapper').css('right', '0');
				}
			}
		};

		$.fn.repeater.Constructor.prototype.list_createItemActions = function listCreateItemActions () {
			var actionsHtml = '';
			var self = this;
			var i;
			var length;
			var $table = this.$element.find('.repeater-list .repeater-list-wrapper > table');
			var $actionsTable = this.$canvas.find('.table-actions');

			for (i = 0, length = this.viewOptions.list_actions.items.length; i < length; i++) {
				var action = this.viewOptions.list_actions.items[i];
				var html = action.html;

				actionsHtml += '<li><a href="#" data-action="' + action.name + '" class="action-item"> ' + html + '</a></li>';
			}

			var actionsDropdown = '<div class="btn-group">' +
				'<button type="button" class="btn btn-xs btn-default dropdown-toggle repeater-actions-button" data-toggle="dropdown" data-flip="auto" aria-expanded="false">' +
				'<span class="caret"></span>' +
				'</button>' +
				'<ul class="dropdown-menu dropdown-menu-right" role="menu">' +
				actionsHtml +
				'</ul></div>';

			if ($actionsTable.length < 1) {
				var $actionsColumnWrapper = $('<div class="actions-column-wrapper" style="width: ' + this.list_actions_width + 'px"></div>').insertBefore($table);
				var $actionsColumn = $table.clone().addClass('table-actions');
				$actionsColumn.find('th:not(:last-child)').remove();
				$actionsColumn.find('tr td:not(:last-child)').remove();

				// Dont show actions dropdown in header if not multi select
				if (this.viewOptions.list_selectable === 'multi' || this.viewOptions.list_selectable === 'action') {
					$actionsColumn.find('thead tr').html('<th><div class="repeater-list-heading">' + actionsDropdown + '</div></th>');

					if (this.viewOptions.list_selectable !== 'action') {
						// disable the header dropdown until an item is selected
						$actionsColumn.find('thead .btn').attr('disabled', 'disabled');
					}
				} else {
					var label = this.viewOptions.list_actions.label || '<span class="actions-hidden">a</span>';
					$actionsColumn.find('thead tr').addClass('empty-heading').html('<th>' + label + '<div class="repeater-list-heading">' + label + '</div></th>');
				}

				// Create Actions dropdown for each cell in actions table
				var $actionsCells = $actionsColumn.find('td');

				$actionsCells.each(function addActionsDropdown (rowNumber) {
					$(this).html(actionsDropdown);
					$(this).find('a').attr('data-row', rowNumber + 1);
				});

				$actionsColumnWrapper.append($actionsColumn);

				this.$canvas.addClass('actions-enabled');
			}

			this.list_sizeActionsTable();

			// row level actions click
			this.$element.find('.table-actions tbody .action-item').on('click', function onBodyActionItemClick (e) {
				if (!self.isDisabled) {
					var actionName = $(this).data('action');
					var row = $(this).data('row');
					var selected = {
						actionName: actionName,
						rows: [row]
					};
					self.list_getActionItems(selected, e);
				}
			});
			// bulk actions click
			this.$element.find('.table-actions thead .action-item').on('click', function onHeadActionItemClick (e) {
				if (!self.isDisabled) {
					var actionName = $(this).data('action');
					var selected = {
						actionName: actionName,
						rows: []
					};
					var selector = '.repeater-list-wrapper > table .selected';

					if ( self.viewOptions.list_selectable === 'action' ) {
						selector = '.repeater-list-wrapper > table tr';
					}
					self.$element.find(selector).each(function eachSelector (selectorIndex) {
						selected.rows.push(selectorIndex + 1);
					});

					self.list_getActionItems(selected, e);
				}
			});
		};

		$.fn.repeater.Constructor.prototype.list_getActionItems = function listGetActionItems (selected, e) {
			var selectedObj = [];
			var actionObj = $.grep(this.viewOptions.list_actions.items, function matchedActions (actions) {
				return actions.name === selected.actionName;
			})[0];
			for (var i = 0, selectedRowsL = selected.rows.length; i < selectedRowsL; i++) {
				var clickedRow = this.$canvas.find('.repeater-list-wrapper > table tbody tr:nth-child(' + selected.rows[i] + ')');
				selectedObj.push({
					item: clickedRow,
					rowData: clickedRow.data('item_data')
				});
			}
			if (selectedObj.length === 1) {
				selectedObj = selectedObj[0];
			}

			if (actionObj.clickAction) {
				var callback = function noop () {};// for backwards compatibility. No idea why this was originally here...
				actionObj.clickAction(selectedObj, callback, e);
			}
		};

		$.fn.repeater.Constructor.prototype.list_sizeActionsTable = function listSizeActionsTable () {
			var $actionsTable = this.$element.find('.repeater-list table.table-actions');
			var $actionsTableHeader = $actionsTable.find('thead tr th');
			var $table = this.$element.find('.repeater-list-wrapper > table');

			$actionsTableHeader.outerHeight($table.find('thead tr th').outerHeight());
			$actionsTableHeader.find('.repeater-list-heading').outerHeight($actionsTableHeader.outerHeight());
			$actionsTable.find('tbody tr td:first-child').each(function eachFirstChild (i) {
				$(this).outerHeight($table.find('tbody tr:eq(' + i + ') td').outerHeight());
			});
		};

		$.fn.repeater.Constructor.prototype.list_sizeFrozenColumns = function listSizeFrozenColumns () {
			var $table = this.$element.find('.repeater-list .repeater-list-wrapper > table');

			this.$element.find('.repeater-list table.table-frozen tr').each(function eachTR (i) {
				$(this).height($table.find('tr:eq(' + i + ')').height());
			});

			var columnWidth = $table.find('td:eq(0)').outerWidth();
			this.$element.find('.frozen-column-wrapper, .frozen-thead-wrapper').width(columnWidth);
		};

		$.fn.repeater.Constructor.prototype.list_frozenOptionsInitialize = function listFrozenOptionsInitialize () {
			var $checkboxes = this.$element.find('.frozen-column-wrapper .checkbox-inline');
			var $headerCheckbox = this.$element.find('.header-checkbox .checkbox-custom');
			var $everyTable = this.$element.find('.repeater-list table');
			var self = this;

			// Make sure if row is hovered that it is shown in frozen column as well
			this.$element.find('tr.selectable').on('mouseover mouseleave', function onMouseEvents (e) {
				var index = $(this).index();
				index = index + 1;
				if (e.type === 'mouseover') {
					$everyTable.find('tbody tr:nth-child(' + index + ')').addClass('hovered');
				} else {
					$everyTable.find('tbody tr:nth-child(' + index + ')').removeClass('hovered');
				}
			});

			$headerCheckbox.checkbox();
			$checkboxes.checkbox();

			// Row checkboxes
			var $rowCheckboxes = this.$element.find('.table-frozen tbody .checkbox-inline');
			var $checkAll = this.$element.find('.frozen-thead-wrapper thead .checkbox-inline input');
			$rowCheckboxes.on('change', function onChangeRowCheckboxes (e) {
				e.preventDefault();

				if (!self.list_revertingCheckbox) {
					if (self.isDisabled) {
						revertCheckbox($(e.currentTarget));
					} else {
						var row = $(this).attr('data-row');
						row = parseInt(row, 10) + 1;
						self.$element.find('.repeater-list-wrapper > table tbody tr:nth-child(' + row + ')').click();

						var numSelected = self.$element.find('.table-frozen tbody .checkbox-inline.checked').length;
						if (numSelected === 0) {
							$checkAll.prop('checked', false);
							$checkAll.prop('indeterminate', false);
						} else if (numSelected === $rowCheckboxes.length) {
							$checkAll.prop('checked', true);
							$checkAll.prop('indeterminate', false);
						} else {
							$checkAll.prop('checked', false);
							$checkAll.prop('indeterminate', true);
						}
					}
				}
			});

			// "Check All" checkbox
			$checkAll.on('change', function onChangeCheckAll (e) {
				if (!self.list_revertingCheckbox) {
					if (self.isDisabled) {
						revertCheckbox($(e.currentTarget));
					} else if ($(this).is(':checked')) {
						self.$element.find('.repeater-list-wrapper > table tbody tr:not(.selected)').click();
						self.$element.trigger('selected.fu.repeaterList', $checkboxes);
					} else {
						self.$element.find('.repeater-list-wrapper > table tbody tr.selected').click();
						self.$element.trigger('deselected.fu.repeaterList', $checkboxes);
					}
				}
			});

			function revertCheckbox ($checkbox) {
				self.list_revertingCheckbox = true;
				$checkbox.checkbox('toggle');
				delete self.list_revertingCheckbox;
			}
		};

		// ADDITIONAL DEFAULT OPTIONS
		$.fn.repeater.defaults = langx.mixin({}, $.fn.repeater.defaults, {
			list_columnRendered: null,
			list_columnSizing: true,
			list_columnSyncing: true,
			list_highlightSortedColumn: true,
			list_infiniteScroll: false,
			list_noItemsHTML: 'no items found',
			list_selectable: false,
			list_sortClearing: false,
			list_rowRendered: null,
			list_frozenColumns: 0,
			list_actions: false
		});

		// EXTENSION DEFINITION
		$.fn.repeater.viewTypes.list = {
			cleared: function cleared () {
				if (this.viewOptions.list_columnSyncing) {
					this.list_sizeHeadings();
				}
			},
			dataOptions: function dataOptions (options) {
				if (this.list_sortDirection) {
					options.sortDirection = this.list_sortDirection;
				}
				if (this.list_sortProperty) {
					options.sortProperty = this.list_sortProperty;
				}
				return options;
			},
			enabled: function enabled (helpers) {
				if (this.viewOptions.list_actions) {
					if (!helpers.status) {
						this.$canvas.find('.repeater-actions-button').attr('disabled', 'disabled');
					} else {
						this.$canvas.find('.repeater-actions-button').removeAttr('disabled');
						toggleActionsHeaderButton.call(this);
					}
				}
			},
			initialize: function initialize (helpers, callback) {
				this.list_sortDirection = null;
				this.list_sortProperty = null;
				this.list_specialBrowserClass = specialBrowserClass();
				this.list_actions_width = (this.viewOptions.list_actions.width !== undefined) ? this.viewOptions.list_actions.width : 37;
				this.list_noItems = false;
				callback();
			},
			resize: function resize () {
				sizeColumns.call(this, this.$element.find('.repeater-list-wrapper > table thead tr'));
				if (this.viewOptions.list_actions) {
					this.list_sizeActionsTable();
				}
				if (this.viewOptions.list_frozenColumns || this.viewOptions.list_selectable === 'multi') {
					this.list_sizeFrozenColumns();
				}
				if (this.viewOptions.list_columnSyncing) {
					this.list_sizeHeadings();
				}
			},
			selected: function selected () {
				var infScroll = this.viewOptions.list_infiniteScroll;
				var opts;

				this.list_firstRender = true;
				this.$loader.addClass('noHeader');

				if (infScroll) {
					opts = (typeof infScroll === 'object') ? infScroll : {};
					this.infiniteScrolling(true, opts);
				}
			},
			before: function before (helpers) {
				var $listContainer = helpers.container.find('.repeater-list');
				var self = this;
				var $table;

				// this is a patch, it was pulled out of `renderThead`
				if (helpers.data.count > 0) {
					this.list_noItems = false;
				} else {
					this.list_noItems = true;
				}

				if ($listContainer.length < 1) {
					$listContainer = $('<div class="repeater-list ' + this.list_specialBrowserClass + '" data-preserve="shallow"><div class="repeater-list-wrapper" data-infinite="true" data-preserve="shallow"><table aria-readonly="true" class="table" data-preserve="shallow" role="grid"></table></div></div>');
					$listContainer.find('.repeater-list-wrapper').on('scroll.fu.repeaterList', function onScrollRepeaterList () {
						if (self.viewOptions.list_columnSyncing) {
							self.list_positionHeadings();
						}
					});
					if (self.viewOptions.list_frozenColumns || self.viewOptions.list_actions || self.viewOptions.list_selectable === 'multi') {
						helpers.container.on('scroll.fu.repeaterList', function onScrollRepeaterList () {
							self.list_positionColumns();
						});
					}

					helpers.container.append($listContainer);
				}
				helpers.container.removeClass('actions-enabled actions-enabled multi-select-enabled');

				$table = $listContainer.find('table');
				renderThead.call(this, $table, helpers.data);
				renderTbody.call(this, $table, helpers.data);

				return false;
			},
			renderItem: function renderItem (helpers) {
				renderRow.call(this, helpers.container, helpers.subset, helpers.index);
				return false;
			},
			after: function after () {
				var $sorted;

				if ((this.viewOptions.list_frozenColumns || this.viewOptions.list_selectable === 'multi') && !this.list_noItems) {
					this.list_setFrozenColumns();
				}

				if (this.viewOptions.list_actions && !this.list_noItems) {
					this.list_createItemActions();
					this.list_sizeActionsTable();
				}

				if ((this.viewOptions.list_frozenColumns || this.viewOptions.list_actions || this.viewOptions.list_selectable === 'multi') && !this.list_noItems) {
					this.list_positionColumns();
					this.list_frozenOptionsInitialize();
				}

				if (this.viewOptions.list_columnSyncing) {
					this.list_sizeHeadings();
					this.list_positionHeadings();
				}

				$sorted = this.$canvas.find('.repeater-list-wrapper > table .repeater-list-heading.sorted');
				if ($sorted.length > 0) {
					this.list_highlightColumn($sorted.data('fu_item_index'));
				}

				return false;
			}
		};
	}

	// ADDITIONAL METHODS
	var areDifferentColumns = function areDifferentColumns (oldCols, newCols) {
		if (!newCols) {
			return false;
		}
		if (!oldCols || (newCols.length !== oldCols.length)) {
			return true;
		}
		for (var i = 0, newColsL = newCols.length; i < newColsL; i++) {
			if (!oldCols[i]) {
				return true;
			}

			for (var j in newCols[i]) {
				if (newCols[i].hasOwnProperty(j) && oldCols[i][j] !== newCols[i][j]) {
					return true;
				}
			}
		}
		return false;
	};

	var renderColumn = function renderColumn ($row, rows, rowIndex, columns, columnIndex) {
		var className = columns[columnIndex].className;
		var content = rows[rowIndex][columns[columnIndex].property];
		var $col = $('<td></td>');
		var width = columns[columnIndex]._auto_width;

		var property = columns[columnIndex].property;
		if (this.viewOptions.list_actions !== false && property === '@_ACTIONS_@') {
			content = '<div class="repeater-list-actions-placeholder" style="width: ' + this.list_actions_width  + 'px"></div>';
		}

		content = (content !== undefined) ? content : '';

		$col.addClass(((className !== undefined) ? className : '')).append(content);
		if (width !== undefined) {
			$col.outerWidth(width);
		}

		$row.append($col);

		if (this.viewOptions.list_selectable === 'multi' && columns[columnIndex].property === '@_CHECKBOX_@') {
			var checkBoxMarkup = '<label data-row="' + rowIndex + '" class="checkbox-custom checkbox-inline body-checkbox repeater-select-checkbox">' +
				'<input class="sr-only" type="checkbox"></label>';

			$col.html(checkBoxMarkup);
		}

		return $col;
	};

	var renderHeader = function renderHeader ($tr, columns, index) {
		var chevDown = 'glyphicon-chevron-down';
		var chevron = '.glyphicon.rlc:first';
		var chevUp = 'glyphicon-chevron-up';
		var $div = $('<div class="repeater-list-heading"><span class="glyphicon rlc"></span></div>');
		var checkAllID = (this.$element.attr('id') + '_' || '') + 'checkall';

		var checkBoxMarkup = '<div class="repeater-list-heading header-checkbox">' +
				'<label id="' + checkAllID + '" class="checkbox-custom checkbox-inline">' +
					'<input class="sr-only" type="checkbox" value="">' +
					'<span class="checkbox-label">&nbsp;</span>' +
				'</label>' +
			'</div>';

		var $header = $('<th></th>');
		var self = this;
		var $both;
		var className;
		var sortable;
		var $span;
		var $spans;

		$div.data('fu_item_index', index);
		$div.prepend(columns[index].label);
		$header.html($div.html()).find('[id]').removeAttr('id');

		if (columns[index].property !== '@_CHECKBOX_@') {
			$header.append($div);
		} else {
			$header.append(checkBoxMarkup);
		}

		$both = $header.add($div);
		$span = $div.find(chevron);
		$spans = $span.add($header.find(chevron));

		if (this.viewOptions.list_actions && columns[index].property === '@_ACTIONS_@') {
			var width = this.list_actions_width;
			$header.css('width', width);
			$div.css('width', width);
		}

		className = columns[index].className;
		if (className !== undefined) {
			$both.addClass(className);
		}

		sortable = columns[index].sortable;
		if (sortable) {
			$both.addClass('sortable');
			$div.on('click.fu.repeaterList', function onClickRepeaterList () {
				if (!self.isDisabled) {
					self.list_sortProperty = (typeof sortable === 'string') ? sortable : columns[index].property;
					if ($div.hasClass('sorted')) {
						if ($span.hasClass(chevUp)) {
							$spans.removeClass(chevUp).addClass(chevDown);
							self.list_sortDirection = 'desc';
						} else if (!self.viewOptions.list_sortClearing) {
							$spans.removeClass(chevDown).addClass(chevUp);
							self.list_sortDirection = 'asc';
						} else {
							$both.removeClass('sorted');
							$spans.removeClass(chevDown);
							self.list_sortDirection = null;
							self.list_sortProperty = null;
						}
					} else {
						$tr.find('th, .repeater-list-heading').removeClass('sorted');
						$spans.removeClass(chevDown).addClass(chevUp);
						self.list_sortDirection = 'asc';
						$both.addClass('sorted');
					}

					self.render({
						clearInfinite: true,
						pageIncrement: null
					});
				}
			});
		}

		if (columns[index].sortDirection === 'asc' || columns[index].sortDirection === 'desc') {
			$tr.find('th, .repeater-list-heading').removeClass('sorted');
			$both.addClass('sortable sorted');
			if (columns[index].sortDirection === 'asc') {
				$spans.addClass(chevUp);
				this.list_sortDirection = 'asc';
			} else {
				$spans.addClass(chevDown);
				this.list_sortDirection = 'desc';
			}

			this.list_sortProperty = (typeof sortable === 'string') ? sortable : columns[index].property;
		}

		$tr.append($header);
	};

	var onClickRowRepeaterList = function onClickRowRepeaterList (repeater) {
		var isMulti = repeater.viewOptions.list_selectable === 'multi';
		var isActions = repeater.viewOptions.list_actions;
		var $repeater = repeater.$element;

		if (!repeater.isDisabled) {
			var $item = $(this);
			var index = $(this).index() + 1;
			var $frozenRow = $repeater.find('.frozen-column-wrapper tr:nth-child(' + index + ')');
			var $actionsRow = $repeater.find('.actions-column-wrapper tr:nth-child(' + index + ')');
			var $checkBox = $repeater.find('.frozen-column-wrapper tr:nth-child(' + index + ') .checkbox-inline');

			if ($item.is('.selected')) {
				$item.removeClass('selected');
				if (isMulti) {
					$checkBox.click();
					$frozenRow.removeClass('selected');
					if (isActions) {
						$actionsRow.removeClass('selected');
					}
				} else {
					$item.find('.repeater-list-check').remove();
				}

				$repeater.trigger('deselected.fu.repeaterList', $item);
			} else {
				if (!isMulti) {
					repeater.$canvas.find('.repeater-list-check').remove();
					repeater.$canvas.find('.repeater-list tbody tr.selected').each(function deslectRow () {
						$(this).removeClass('selected');
						$repeater.trigger('deselected.fu.repeaterList', $(this));
					});
					$item.find('td:first').prepend('<div class="repeater-list-check"><span class="glyphicon glyphicon-ok"></span></div>');
					$item.addClass('selected');
					$frozenRow.addClass('selected');
				} else {
					$checkBox.click();
					$item.addClass('selected');
					$frozenRow.addClass('selected');
					if (isActions) {
						$actionsRow.addClass('selected');
					}
				}
				$repeater.trigger('selected.fu.repeaterList', $item);
			}

			toggleActionsHeaderButton.call(repeater);
		}
	};

	var renderRow = function renderRow ($tbody, rows, index) {
		var $row = $('<tr></tr>');

		if (this.viewOptions.list_selectable) {
			$row.data('item_data', rows[index]);

			if (this.viewOptions.list_selectable !== 'action') {
				$row.addClass('selectable');
				$row.attr('tabindex', 0);	// allow items to be tabbed to / focused on

				var repeater = this;
				$row.on('click.fu.repeaterList', function callOnClickRowRepeaterList() {
					onClickRowRepeaterList.call(this, repeater);
				});

				// allow selection via enter key
				$row.keyup(function onRowKeyup (e) {
					if (e.keyCode === 13) {
						// triggering a standard click event to be caught by the row click handler above
						$row.trigger('click.fu.repeaterList');
					}
				});
			}
		}

		if (this.viewOptions.list_actions && !this.viewOptions.list_selectable) {
			$row.data('item_data', rows[index]);
		}

		var columns = [];
		for (var i = 0, length = this.list_columns.length; i < length; i++) {
			columns.push(renderColumn.call(this, $row, rows, index, this.list_columns, i));
		}

		$tbody.append($row);

		if (this.viewOptions.list_columnRendered) {
			for (var columnIndex = 0, colLength = columns.length; columnIndex < colLength; columnIndex++) {
				if (!(this.list_columns[columnIndex].property === '@_CHECKBOX_@' || this.list_columns[columnIndex].property === '@_ACTIONS_@')) {
					this.viewOptions.list_columnRendered({
						container: $row,
						columnAttr: this.list_columns[columnIndex].property,
						item: columns[columnIndex],
						rowData: rows[index]
					}, function noop () {});
				}
			}
		}

		if (this.viewOptions.list_rowRendered) {
			this.viewOptions.list_rowRendered({
				container: $tbody,
				item: $row,
				rowData: rows[index]
			}, function noop () {});
		}
	};

	var renderTbody = function renderTbody ($table, data) {
		var $tbody = $table.find('tbody');
		var $empty;

		if ($tbody.length < 1) {
			$tbody = $('<tbody data-container="true"></tbody>');
			$table.append($tbody);
		}

		if (typeof data.error === 'string' && data.error.length > 0) {
			$empty = $('<tr class="empty text-danger"><td colspan="' + this.list_columns.length + '"></td></tr>');
			$empty.find('td').append(data.error);
			$tbody.append($empty);
		} else if (data.items && data.items.length < 1) {
			$empty = $('<tr class="empty"><td colspan="' + this.list_columns.length + '"></td></tr>');
			$empty.find('td').append(this.viewOptions.list_noItemsHTML);
			$tbody.append($empty);
		}
	};

	var renderThead = function renderThead ($table, data) {
		var columns = data.columns || [];
		var $thead = $table.find('thead');
		var i;
		var length;
		var $tr;

		if (this.list_firstRender || areDifferentColumns(this.list_columns, columns) || $thead.length === 0) {
			$thead.remove();

			// list_noItems is set in `before` method

			if (this.viewOptions.list_selectable === 'multi' && !this.list_noItems) {
				var checkboxColumn = {
					label: 'c',
					property: '@_CHECKBOX_@',
					sortable: false
				};
				columns.splice(0, 0, checkboxColumn);
			}

			this.list_columns = columns;
			this.list_firstRender = false;
			this.$loader.removeClass('noHeader');

			// keep action column header even when empty, you'll need it later....
			if (this.viewOptions.list_actions) {
				var actionsColumn = {
					label: this.viewOptions.list_actions.label || '<span class="actions-hidden">a</span>',
					property: '@_ACTIONS_@',
					sortable: false,
					width: this.list_actions_width
				};
				columns.push(actionsColumn);
			}


			$thead = $('<thead data-preserve="deep"><tr></tr></thead>');
			$tr = $thead.find('tr');
			for (i = 0, length = columns.length; i < length; i++) {
				renderHeader.call(this, $tr, columns, i);
			}
			$table.prepend($thead);

			if (this.viewOptions.list_selectable === 'multi' && !this.list_noItems) {
				// after checkbox column is created need to get width of checkbox column from
				// its css class
				var checkboxWidth = this.$element.find('.repeater-list-wrapper .header-checkbox').outerWidth();
				var selectColumn = $.grep(columns, function grepColumn (column) {
					return column.property === '@_CHECKBOX_@';
				})[0];
				selectColumn.width = checkboxWidth;
			}
			sizeColumns.call(this, $tr);
		}
	};

	var sizeColumns = function sizeColumns ($tr) {
		var automaticallyGeneratedWidths = [];
		var self = this;
		var i;
		var length;
		var newWidth;
		var widthTaken;

		if (this.viewOptions.list_columnSizing) {
			i = 0;
			widthTaken = 0;
			$tr.find('th').each(function eachTH () {
				var $th = $(this);
				var width;
				if (self.list_columns[i].width !== undefined) {
					width = self.list_columns[i].width;
					$th.outerWidth(width);
					widthTaken += $th.outerWidth();
					self.list_columns[i]._auto_width = width;
				} else {
					var outerWidth = $th.find('.repeater-list-heading').outerWidth();
					automaticallyGeneratedWidths.push({
						col: $th,
						index: i,
						minWidth: outerWidth
					});
				}

				i++;
			});

			length = automaticallyGeneratedWidths.length;
			if (length > 0) {
				var canvasWidth = this.$canvas.find('.repeater-list-wrapper').outerWidth();
				newWidth = Math.floor((canvasWidth - widthTaken) / length);
				for (i = 0; i < length; i++) {
					if (automaticallyGeneratedWidths[i].minWidth > newWidth) {
						newWidth = automaticallyGeneratedWidths[i].minWidth;
					}
					automaticallyGeneratedWidths[i].col.outerWidth(newWidth);
					this.list_columns[automaticallyGeneratedWidths[i].index]._auto_width = newWidth;
				}
			}
		}
	};

	var specialBrowserClass = function specialBrowserClass () {
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf('MSIE ');
		var firefox = ua.indexOf('Firefox');

		if (msie > 0 ) {
			return 'ie-' + parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		} else if (firefox > 0) {
			return 'firefox';
		}

		return '';
	};

	var toggleActionsHeaderButton = function toggleActionsHeaderButton () {
		var selectedSelector = '.repeater-list-wrapper > table .selected';
		var $actionsColumn = this.$element.find('.table-actions');
		var $selected;

		if (this.viewOptions.list_selectable === 'action') {
			selectedSelector = '.repeater-list-wrapper > table tr';
		}

		$selected = this.$canvas.find( selectedSelector );

		if ($selected.length > 0) {
			$actionsColumn.find('thead .btn').removeAttr('disabled');
		} else {
			$actionsColumn.find('thead .btn').attr('disabled', 'disabled');
		}
	};

});

define('skylark-ui-repeater/repeater-thumbnail',[
    "skylark-utils/langx",
    "skylark-utils/browser",
    "skylark-utils/eventer",
    "skylark-utils/noder",
    "skylark-utils/geom",
    "skylark-utils/query",
    "./repeater"
], function(langx, browser, eventer, noder, geom, $) {

    /*
     * Fuel UX Checkbox
     * https://github.com/ExactTarget/fuelux
     *
     * Copyright (c) 2014 ExactTarget
     * Licensed under the BSD New license.
     */

    if ($.fn.repeater) {
        //ADDITIONAL METHODS
        $.fn.repeater.Constructor.prototype.thumbnail_clearSelectedItems = function() {
            this.$canvas.find('.repeater-thumbnail-cont .selectable.selected').removeClass('selected');
        };

        $.fn.repeater.Constructor.prototype.thumbnail_getSelectedItems = function() {
            var selected = [];
            this.$canvas.find('.repeater-thumbnail-cont .selectable.selected').each(function() {
                selected.push($(this));
            });
            return selected;
        };

        $.fn.repeater.Constructor.prototype.thumbnail_setSelectedItems = function(items, force) {
            var selectable = this.viewOptions.thumbnail_selectable;
            var self = this;
            var i, $item, l, n;

            //this function is necessary because lint yells when a function is in a loop
            function compareItemIndex() {
                if (n === items[i].index) {
                    $item = $(this);
                    return false;
                } else {
                    n++;
                }
            }

            //this function is necessary because lint yells when a function is in a loop
            function compareItemSelector() {
                $item = $(this);
                if ($item.is(items[i].selector)) {
                    selectItem($item, items[i].selected);
                }
            }

            function selectItem($itm, select) {
                select = (select !== undefined) ? select : true;
                if (select) {
                    if (!force && selectable !== 'multi') {
                        self.thumbnail_clearSelectedItems();
                    }

                    $itm.addClass('selected');
                } else {
                    $itm.removeClass('selected');
                }
            }

            if (!$.isArray(items)) {
                items = [items];
            }

            if (force === true || selectable === 'multi') {
                l = items.length;
            } else if (selectable) {
                l = (items.length > 0) ? 1 : 0;
            } else {
                l = 0;
            }

            for (i = 0; i < l; i++) {
                if (items[i].index !== undefined) {
                    $item = $();
                    n = 0;
                    this.$canvas.find('.repeater-thumbnail-cont .selectable').each(compareItemIndex);
                    if ($item.length > 0) {
                        selectItem($item, items[i].selected);
                    }

                } else if (items[i].selector) {
                    this.$canvas.find('.repeater-thumbnail-cont .selectable').each(compareItemSelector);
                }
            }
        };

        //ADDITIONAL DEFAULT OPTIONS
        $.fn.repeater.defaults = langx.mixin({}, $.fn.repeater.defaults, {
            thumbnail_alignment: 'left',
            thumbnail_infiniteScroll: false,
            thumbnail_itemRendered: null,
            thumbnail_noItemsHTML: 'no items found',
            thumbnail_selectable: false,
            thumbnail_template: '<div class="thumbnail repeater-thumbnail"><img height="75" src="{{src}}" width="65"><span>{{name}}</span></div>'
        });

        //EXTENSION DEFINITION
        $.fn.repeater.viewTypes.thumbnail = {
            selected: function() {
                var infScroll = this.viewOptions.thumbnail_infiniteScroll;
                var opts;
                if (infScroll) {
                    opts = (typeof infScroll === 'object') ? infScroll : {};
                    this.infiniteScrolling(true, opts);
                }
            },
            before: function(helpers) {
                var alignment = this.viewOptions.thumbnail_alignment;
                var $cont = this.$canvas.find('.repeater-thumbnail-cont');
                var data = helpers.data;
                var response = {};
                var $empty, validAlignments;

                if ($cont.length < 1) {
                    $cont = $('<div class="clearfix repeater-thumbnail-cont" data-container="true" data-infinite="true" data-preserve="shallow"></div>');
                    if (alignment && alignment !== 'none') {
                        validAlignments = {
                            'center': 1,
                            'justify': 1,
                            'left': 1,
                            'right': 1
                        };
                        alignment = (validAlignments[alignment]) ? alignment : 'justify';
                        $cont.addClass('align-' + alignment);
                        this.thumbnail_injectSpacers = true;
                    } else {
                        this.thumbnail_injectSpacers = false;
                    }
                    response.item = $cont;
                } else {
                    response.action = 'none';
                }

                if (data.items && data.items.length < 1) {
                    $empty = $('<div class="empty"></div>');
                    $empty.append(this.viewOptions.thumbnail_noItemsHTML);
                    $cont.append($empty);
                } else {
                    $cont.find('.empty:first').remove();
                }

                return response;
            },
            renderItem: function(helpers) {
                var selectable = this.viewOptions.thumbnail_selectable;
                var selected = 'selected';
                var self = this;
                var $thumbnail = $(fillTemplate(helpers.subset[helpers.index], this.viewOptions.thumbnail_template));

                $thumbnail.data('item_data', helpers.data.items[helpers.index]);

                if (selectable) {
                    $thumbnail.addClass('selectable');
                    $thumbnail.on('click', function() {
                        if (self.isDisabled) return;

                        if (!$thumbnail.hasClass(selected)) {
                            if (selectable !== 'multi') {
                                self.$canvas.find('.repeater-thumbnail-cont .selectable.selected').each(function() {
                                    var $itm = $(this);
                                    $itm.removeClass(selected);
                                    self.$element.trigger('deselected.fu.repeaterThumbnail', $itm);
                                });
                            }

                            $thumbnail.addClass(selected);
                            self.$element.trigger('selected.fu.repeaterThumbnail', $thumbnail);
                        } else {
                            $thumbnail.removeClass(selected);
                            self.$element.trigger('deselected.fu.repeaterThumbnail', $thumbnail);
                        }
                    });
                }

                helpers.container.append($thumbnail);
                if (this.thumbnail_injectSpacers) {
                    $thumbnail.after('<span class="spacer">&nbsp;</span>');
                }

                if (this.viewOptions.thumbnail_itemRendered) {
                    this.viewOptions.thumbnail_itemRendered({
                        container: helpers.container,
                        item: $thumbnail,
                        itemData: helpers.subset[helpers.index]
                    }, function() {});
                }

                return false;
            }
        };
    }

    //ADDITIONAL METHODS
    function fillTemplate(itemData, template) {
        var invalid = false;

        function replace() {
            var end, start, val;

            start = template.indexOf('{{');
            end = template.indexOf('}}', start + 2);

            if (start > -1 && end > -1) {
                val = langx.trim(template.substring(start + 2, end));
                val = (itemData[val] !== undefined) ? itemData[val] : '';
                template = template.substring(0, start) + val + template.substring(end + 2);
            } else {
                invalid = true;
            }
        }

        while (!invalid && template.search('{{') >= 0) {
            replace(template);
        }

        return template;
    }

});
define('skylark-ui-repeater/main',[
    "skylark-utils/query",
    "./repeater",
    "./repeater-list",
    "./repeater-thumbnail"
], function($) {
    return $;
});
define('skylark-ui-repeater', ['skylark-ui-repeater/main'], function (main) { return main; });


},this);