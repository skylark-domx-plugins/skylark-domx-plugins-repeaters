/**
 * skylark-domx-plugins-repeater - The skylark repeater plugin library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx-plugins/skylark-domx-plugins-repeater/
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
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-domx-plugins-repeater/SearchBox',[
  "skylark-langx/langx",
  "skylark-domx-browser",
  "skylark-domx-eventer",
  "skylark-domx-noder",
  "skylark-domx-geom",
  "skylark-domx-query",
  "skylark-domx-plugins"
],function(langx,browser,eventer,noder,geom,$,plugins){


	// SEARCH CONSTRUCTOR AND PROTOTYPE

	var SearchBox = plugins.Plugin.inherit({
		klassName: "SearchBox",

		pluginName: "lark.searchbox",

		options : {
			clearOnEmpty: false,
			searchOnKeyPress: false,
			allowCancel: false
		},
	
    	_construct : function(elm,options) {
      		this.overrided(elm,options);
      		
      		this.$element = $(this._elm);
			this.$repeater = this.$element.closest('.repeater');

			if (this.$element.attr('data-searchOnKeyPress') === 'true'){
				this.options.searchOnKeyPress = true;
			}

			this.$button = this.$element.find('button');
			this.$input = this.$element.find('input');
			this.$icon = this.$element.find('.glyphicon, .fuelux-icon');

			this.$button.on('click.lark.search', langx.proxy(this.buttonclicked, this));
			this.$input.on('keyup.lark.search', langx.proxy(this.keypress, this));

			if (this.$repeater.length > 0) {
				this.$repeater.on('rendered.lark.repeater', langx.proxy(this.clearPending, this));
			}

			this.activeSearch = '';
		},

		_destroy: function () {
			this.$element.remove();
			// any external bindings
			// [none]
			// set input value attrbute
			this.$element.find('input').each(function () {
				$(this).attr('value', $(this).val());
			});
			// empty elements to return to original markup
			// [none]
			// returns string of markup
			return this.$element[0].outerHTML;
		},

		search: function (searchText) {
			if (this.$icon.hasClass('glyphicon')) {
				this.$icon.removeClass('glyphicon-search').addClass('glyphicon-remove');
			}
			if (this.$icon.hasClass('fuelux-icon')) {
				this.$icon.removeClass('fuelux-icon-search').addClass('fuelux-icon-remove');
			}

			this.activeSearch = searchText;
			this.$element.addClass('searched pending');
			this.$element.trigger('searched.lark.search', searchText);
		},

		clear: function () {
			if (this.$icon.hasClass('glyphicon')) {
				this.$icon.removeClass('glyphicon-remove').addClass('glyphicon-search');
			}
			if (this.$icon.hasClass('fuelux-icon')) {
				this.$icon.removeClass('fuelux-icon-remove').addClass('fuelux-icon-search');
			}

			if (this.$element.hasClass('pending')) {
				this.$element.trigger('canceled.lark.search');
			}

			this.activeSearch = '';
			this.$input.val('');
			this.$element.trigger('cleared.lark.search');
			this.$element.removeClass('searched pending');
		},

		clearPending: function () {
			this.$element.removeClass('pending');
		},

		action: function () {
			var val = this.$input.val();

			if (val && val.length > 0) {
				this.search(val);
			} else {
				this.clear();
			}
		},

		buttonclicked: function (e) {
			e.preventDefault();
			if ($(e.currentTarget).is('.disabled, :disabled')) return;

			if (this.$element.hasClass('pending') || this.$element.hasClass('searched')) {
				this.clear();
			} else {
				this.action();
			}
		},

		keypress: function (e) {
			var ENTER_KEY_CODE = 13;
			var TAB_KEY_CODE = 9;
			var ESC_KEY_CODE = 27;

			if (e.which === ENTER_KEY_CODE) {
				e.preventDefault();
				this.action();
			} else if (e.which === TAB_KEY_CODE) {
				e.preventDefault();
			} else if (e.which === ESC_KEY_CODE) {
				e.preventDefault();
				this.clear();
			} else if (this.options.searchOnKeyPress) {
				// search on other keypress
				this.action();
			}
		},

		disable: function () {
			this.$element.addClass('disabled');
			this.$input.attr('disabled', 'disabled');

			if (!this.options.allowCancel) {
				this.$button.addClass('disabled');
			}
		},

		enable: function () {
			this.$element.removeClass('disabled');
			this.$input.removeAttr('disabled');
			this.$button.removeClass('disabled');
		}
	});

    plugins.register(SearchBox);

	return 	SearchBox;
});

define('skylark-domx-plugins-repeater/Repeater',[
  "skylark-langx/skylark",
  "skylark-langx/langx",
  "skylark-domx-browser",
  "skylark-domx-eventer",
  "skylark-domx-noder",
  "skylark-domx-geom",
  "skylark-domx-velm",
  "skylark-domx-query",
  "skylark-domx-fx",
  "skylark-domx-plugins",
  "skylark-domx-plugins-popups/SelectList",
  "skylark-domx-plugins-popups/ComboBox",
  "./SearchBox"  
],function(skylark,langx,browser,eventer,noder,geom,elmx,$,fx,plugins,SelectList,ComboBox){

	// REPEATER CONSTRUCTOR AND PROTOTYPE

	var Repeater = plugins.Plugin.inherit({
		klassName: "Repeater",

		pluginName: "domx.repeater",

		options : {
			dataSource: function dataSource (options, callback) {
				callback({ count: 0, end: 0, items: [], page: 0, pages: 1, start: 0 });
			},
			defaultView: -1, // should be a string value. -1 means it will grab the active view from the view controls
			dropPagingCap: 10,
			staticHeight: -1, // normally true or false. -1 means it will look for data-staticheight on the element
			views: null, // can be set to an object to configure multiple views of the same type,
			searchOnKeyPress: false,
			allowCancel: true,

			addons : {
				views : ["table","tile"]
			}
		},

	    throb: function(params) {
	      return fx.throb(this._elm,params);
	    },

//		_init : function(element,options) {
	    _construct : function(elm,options) {
		    this.overrided(elm,options);
			var self = this;
			var $btn;
			var currentView;

			this.$element = $(this._elm); //$(element);

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
				$(this).plugin("domx.dropdown");
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
			//this.options = langx.mixin({}, $.fn.repeater.defaults, options);
			this.pageIncrement = 0;// store direction navigated
			this.resizeTimeout = {};
			this.stamp = new Date().getTime() + (Math.floor(Math.random() * 100) + 1);
			this.storedDataSourceOpts = null;
			this.syncingViewButtonState = false;
//			this.viewOptions = {};
			this.viewType = null;

			this.$filters.plugin("domx.selectlist");
			this.$pageSize.plugin("domx.selectlist");
			this.$primaryPaging.find('.combobox').plugin("domx.combobox");
			this.$search.plugin("lark.searchbox",{
				searchOnKeyPress: this.options.searchOnKeyPress,
				allowCancel: this.options.allowCancel
			});

			this.$filters.on('changed.lark.selectlist', function onFiltersChanged (e, value) {
				self.$element.trigger('filtered.lark.repeater', value);
				self.render({
					clearInfinite: true,
					pageIncrement: null
				});
			});
			this.$nextBtn.on('click.lark.repeater', langx.proxy(this.next, this));
			this.$pageSize.on('changed.lark.selectlist', function onPageSizeChanged (e, value) {
				self.$element.trigger('pageSizeChanged.lark.repeater', value);
				self.render({
					pageIncrement: null
				});
			});
			this.$prevBtn.on('click.lark.repeater', langx.proxy(this.previous, this));
			this.$primaryPaging.find('.combobox').on('changed.lark.combobox', function onPrimaryPagingChanged (evt, data) {
				self.pageInputChange(data.text, data);
			});
			this.$search.on('searched.lark.search cleared.lark.search', function onSearched (e, value) {
				self.$element.trigger('searchChanged.lark.repeater', value);
				self.render({
					clearInfinite: true,
					pageIncrement: null
				});
			});
			this.$search.on('canceled.lark.search', function onSearchCanceled (e, value) {
				self.$element.trigger('canceled.lark.repeater', value);
				self.render({
					clearInfinite: true,
					pageIncrement: null
				});
			});

			this.$secondaryPaging.on('blur.lark.repeater', function onSecondaryPagingBlur () {
				self.pageInputChange(self.$secondaryPaging.val());
			});
			this.$secondaryPaging.on('keyup', function onSecondaryPagingKeyup (e) {
				if (e.keyCode === 13) {
					self.pageInputChange(self.$secondaryPaging.val());
				}
			});
			this.$views.find('input').on('change.lark.repeater', langx.proxy(this.viewChanged, this));

			$(window).on('resize.lark.repeater.' + this.stamp, function onResizeRepeater () {
				clearTimeout(self.resizeTimeout);
				self.resizeTimeout = setTimeout(function resizeTimeout () {
					self.resize();
					self.$element.trigger('resized.lark.repeater');
				}, 75);
			});

			//this.$loader.loader();
			//this.$loader.loader('pause');
			if (this.options.defaultView !== -1) {
				currentView = this.options.defaultView;
			} else {
				$btn = this.$views.find('label.active input');
				currentView = ($btn.length > 0) ? $btn.val() : 'table';
			}

			//this.setViewOptions(currentView); // by lwf

			this.initViewTypes(function initViewTypes () {
				self.resize();
				self.$element.trigger('resized.lark.repeater');
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
			/* lwf
			var viewTypeObj = $.fn.repeater.viewTypes[this.viewType] || {};
			if (!viewChanged && viewTypeObj.cleared) {
				viewTypeObj.cleared.call(this, {
					options: options
				});
			}
			*/
			if (this._view) {
				this._view.cleared({
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
			langx.scall(this.$element.find('.combobox').plugin("lark.combobox"),"destroy");
			langx.scall(this.$element.find('.selectlist').plugin("domx.selectlist"),"destroy");
			langx.scall(this.$element.find('.search').plugin("lark.searchbox"),"destroy");
			if (this.infiniteScrollingEnabled) {
				$(this.infiniteScrollingCont).infinitescroll('destroy');
			}

			this.$element.remove();

			// any external events
			$(window).off('resize.lark.repeater.' + this.stamp);

			return markup;
		},

		disable: function disable () {
			//var viewTypeObj = $.fn.repeater.viewTypes[this.viewType] || {};

			langx.scall(this.$search.plugin("lark.searchbox"),"disable");
			langx.scall(this.$filters.plugin("domx.selectlist"),"disable");
			this.$views.find('label, input').addClass('disabled').attr('disabled', 'disabled');
			langx.scall(this.$pageSize.plugin("domx.selectlist"),"disable");
			langx.scall(this.$primaryPaging.find('.combobox').plugin("domx.combobox"),"disable");
			this.$secondaryPaging.attr('disabled', 'disabled');
			this.$prevBtn.attr('disabled', 'disabled');
			this.$nextBtn.attr('disabled', 'disabled');

			/* lwf
			if (viewTypeObj.enabled) {
				viewTypeObj.enabled.call(this, {
					status: false
				});
			}
			*/
			if (this._view) {
				this._view.enabled({
					status: false
				});
			}

			this.isDisabled = true;
			this.$element.addClass('disabled');
			this.$element.trigger('disabled.lark.repeater');
		},

		enable: function enable () {
			//var viewTypeObj = $.fn.repeater.viewTypes[this.viewType] || {};

			langx.scall(this.$search.plugin("lark.searchbox"),"enable");
			langx.scall(this.$filters.plugin("domx.selectlist"),"enable")
			this.$views.find('label, input').removeClass('disabled').removeAttr('disabled');
			langx.scall(this.$pageSize.plugin("domx.selectlist"),"enable")
			langx.scall(this.$primaryPaging.find('.combobox').plugin("domx.combobox"),"enable");
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
				langx.scall(this.$primaryPaging.plugin("domx.combobox"),"disable");
			}

			// if there are no items
			if (parseInt(this.$count.html(), 10) !== 0) {
				langx.scall(this.$pageSize.plugin("domx.selectlist"),"enable");
			} else {
				langx.scall(this.$pageSize.plugin("domx.selectlist"),"disable");
			}

			/* lwf
			if (viewTypeObj.enabled) {
				viewTypeObj.enabled.call(this, {
					status: true
				});
			}
			*/
			if (this._view) {
				this._view.enabled({
					status: true
				});
			}

			this.isDisabled = false;
			this.$element.removeClass('disabled');
			this.$element.trigger('enabled.lark.repeater');
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
				returnOptions.filter = this.$filters.plugin("domx.selectlist").selectedItem();
			}

			if (!this.infiniteScrollingEnabled) {
				returnOptions.pageSize = 25;

				if (this.$pageSize.length > 0) {
					returnOptions.pageSize = parseInt(this.$pageSize.plugin("domx.selectlist").selectedItem().value, 10);
				}
			}

			var searchValue = this.$search && this.$search.find('input') && this.$search.find('input').val();
			if (searchValue !== '') {
				returnOptions.search = searchValue;
			}

			/* lwf
			var viewType = $.fn.repeater.viewTypes[this.viewType] || {};
			var addViewTypeData = viewType.dataOptions;
			if (addViewTypeData) {
				returnOptions = addViewTypeData.call(this, returnOptions);
			}
			*/
			if (this._view) {
				returnOptions = this._view.dataOptions(returnOptions);
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
			if (cont.data('lark.infinitescroll')) {
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
			/*
			var viewTypes = [];

			for (var key in $.fn.repeater.viewTypes) {
				if ({}.hasOwnProperty.call($.fn.repeater.viewTypes, key)) {
					viewTypes.push($.fn.repeater.viewTypes[key]);
				}
			}
			*/

			var views = this._views = [];
			var viewTypes = this.options.addons.views;
			if (langx.isArray(viewTypes)) {
				for (var i = 0; i< viewTypes.length; i++) {
					var setting = this.constructor.addons.views[viewTypes[i]];
					if (!setting) {
						throw new Error("The view type " + viewTypes[i] + " is not defined!");
					} 
					var ctor = setting.ctor;
					this._views.push(this._views[viewTypes[i]] = new ctor(this));

				}				
			} else if (langx.isPlainObject(viewTypes)) {
				for (var name in viewTypes) {
					var setting = this.constructor.addons.views[name];
					if (!setting) {
						throw new Error("The view type " + viewTypes[i] + " is not defined!");
					} 
					var ctor = setting.ctor;
					this._views.push(this._views[name] = new ctor(this,viewTypes[name]));

				}
			}


			/*
			if (views.length > 0) {
				initViewType.call(this, 0, viewTypes, callback);
			} else {
				callback();
			}
			*/
			callback();			
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
			this.$element.trigger('nextClicked.lark.repeater');
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
				this.$element.trigger('pageChanged.lark.repeater', [value, dataFromCombobox]);
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

			if (totalPages <= this.options.dropPagingCap) {
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
			this.$element.trigger('previousClicked.lark.repeater');
			this.render({
				pageIncrement: this.pageIncrement
			});
		},

		// This functions more as a "pre-render" than a true "render"
		render: function render (opts) {
			this.disable();

			var viewChanged = false;
			//var viewTypeObj = $.fn.repeater.viewTypes[this.viewType] || {};
			var options = opts || {};

			if (options.changeView && (this.currentView !== options.changeView)) {
				var prevView = this.currentView;
				this.currentView = options.changeView;
				this.viewType = this.currentView.split('.')[0];

				this._view = this._views[this.viewType];

				//this.setViewOptions(this.currentView);

				this.$element.attr('data-currentview', this.currentView);
				this.$element.attr('data-viewtype', this.viewType);
				viewChanged = true;
				options.viewChanged = viewChanged;

				this.$element.trigger('viewChanged.lark.repeater', this.currentView);

				if (this.infiniteScrollingEnabled) {
					this.infiniteScrolling(false);
				}

				/* lwf
				viewTypeObj = $.fn.repeater.viewTypes[this.viewType] || {};
				if (viewTypeObj.selected) {
					viewTypeObj.selected.call(this, {
						prevView: prevView
					});
				}
				*/
				this._view.selected({
					prevView: prevView
				})
			}

			this.syncViewButtonState();

			options.preserve = (options.preserve !== undefined) ? options.preserve : !viewChanged;
			this.clear(options);

			if (!this.infiniteScrollingEnabled || (this.infiniteScrollingEnabled && viewChanged)) {
				//this.$loader.show().loader('play');
				this._throbber = this.throb({
					className : "throbWrap"
				});
			}

			var dataOptions = this.getDataOptions(options);

			var beforeRender = this.options.dataSource;
			var repeaterPrototypeContext = this;
			var viewTypeObj = this._view;
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
			var staticHeight = (this.options.staticHeight === -1) ? this.$element.attr('data-staticheight') : this.options.staticHeight;
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

			//if (this.viewType) {
			//	viewTypeObj = $.fn.repeater.viewTypes[this.viewType] || {};
			//}

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



			/* lwf
			if (viewTypeObj.resize) {
				viewTypeObj.resize.call(this, {
					height: this.$element.outerHeight(),
					width: this.$element.outerWidth()
				});
			}
			*/
			if (this._view) {
				this._view.resize({
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
					var addBefore = viewTypeObj.before({
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
							var addSubItem = viewTypeObj.renderItem({
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
					var addAfter = viewTypeObj.after({
						container: this.$canvas,
						data: data
					});
					addItem(this.$canvas, addAfter);
				}

				callback(data);
			} else {
				viewTypeObj.render({
					container: this.$canvas,
					data: data
				}, callback);
				callback(data);
			}
		},

		/* // by lwf
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
		*/
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
		},

		getNestedProperty: function (obj, property) {
			property.replace(
				// Matches native JavaScript notation in a String,
				// e.g. '["doubleQuoteProp"].dotProp[2]'
				// eslint-disable-next-line no-useless-escape
				/\[(?:'([^']+)'|"([^"]+)"|(\d+))\]|(?:(?:^|\.)([^\.\[]+))/g,
				function (str, singleQuoteProp, doubleQuoteProp, arrayIndex, dotProp) {
					var prop =
						dotProp ||
						singleQuoteProp ||
						doubleQuoteProp ||
						(arrayIndex && parseInt(arrayIndex, 10))
					if (str && obj) {
						obj = obj[prop]
					}
				}
			)
			return obj
		},

		getDataProperty: function (obj, property) {
			var key
			var prop
			if (obj.dataset) {
				key = property.replace(/-([a-z])/g, function (_, b) {
					return b.toUpperCase()
				})
				prop = obj.dataset[key]
			} else if (obj.getAttribute) {
				prop = obj.getAttribute(
					'data-' + property.replace(/([A-Z])/g, '-$1').toLowerCase()
				)
			}
			if (typeof prop === 'string') {
				// eslint-disable-next-line no-useless-escape
				if (
					/^(true|false|null|-?\d+(\.\d+)?|\{[\s\S]*\}|\[[\s\S]*\])$/.test(prop)
				) {
					try {
						return $.parseJSON(prop)
					} catch (ignore) {}
				}
				return prop
			}
		},

		getItemProperty: function (obj, property) {
			var prop = this.getDataProperty(obj, property)
			if (prop === undefined) {
				prop = obj[property]
			}
			if (prop === undefined) {
				prop = this.getNestedProperty(obj, property)
			}
			return prop
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

		//this.$loader.hide().loader('pause');
		if (this._throbber) {
			this._throbber.remove();
			this._throbber = null;
		}
		this.enable();

		this.$search.trigger('rendered.lark.repeater', {
			data: data,
			options: state.dataOptions,
			renderOptions: state.options
		});
		this.$element.trigger('rendered.lark.repeater', {
			data: data,
			options: state.dataOptions,
			renderOptions: state.options
		});

		// for maintaining support of 'loaded' event
		this.$element.trigger('loaded.lark.repeater', state.dataOptions);
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

	Repeater.addons = {};

   plugins.register(Repeater);


	return skylark.attach("domx.Repeater",Repeater);

});

define('skylark-domx-plugins-repeater/views',[
	"./Repeater"
],function(Repeater){
	return Repeater.addons.views = {};
});
define('skylark-domx-plugins-repeater/views/ViewBase',[
	"skylark-langx/langx",
	"skylark-domx-noder",
	"skylark-domx-query",
	"../views",	
],function(langx,noder,$,views) {

	var ViewBase = langx.Evented.inherit({
	    klassName: "ViewBase",

	    options : {
	      // The class to add when the gallery controls are visible:
	      controlsClass: "skylarkui-repeater-controls",
		    // Defines if the gallery should open in fullscreen mode:
		    fullScreen: false

	    },


    	_create$Item : function (template,itemData) {
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

        	return $(template);
    	},	    
	    
  		init : function (repeater,options) {
  			var that = this,
  				hasControls;
  			this.repeater = repeater;
  			this.initOptions(options);
  	        if (this.options.fullScreen) {
  	          noder.fullScreen(this.container[0]);
  	        }
  	        this.repeater.on("item.running",function(e){
  	            if (that.container.hasClass(that.options.controlsClass)) {
  	              hasControls = true
  	              that.container.removeClass(that.options.controlsClass);
  	            } else {
  	              hasControls = false
  	            }
  	        });

  	        this.repeater.on("item.running",function(e){
  	            if (hasControls) {
  	              that.container.addClass(that.options.controlsClass);
  	            }
  	        });
  		},

	    //initOptions: function (options) {
	    //  // Create a copy of the prototype options:
	    //  this.options = langx.mixin({}, this.options,options);
	    //},

      initOptions : function(options) {
        var ctor = this.constructor,
            cache = ctor.cache = ctor.cache || {},
            defaults = cache.defaults;
        if (!defaults) {
          var  ctors = [];
          do {
            ctors.unshift(ctor);
            if (ctor === Plugin) {
              break;
            }
            ctor = ctor.superclass;
          } while (ctor);

          defaults = cache.defaults = {};
          for (var i=0;i<ctors.length;i++) {
            ctor = ctors[i];
            if (ctor.prototype.hasOwnProperty("options")) {
              langx.mixin(defaults,ctor.prototype.options,true);
            }
            if (ctor.hasOwnProperty("options")) {
              langx.mixin(defaults,ctor.options,true);
            }
          }
        }
        Object.defineProperty(this,"options",{
          value :langx.mixin({},defaults,options,true)
        });

        //return this.options = langx.mixin({},defaults,options);
        return this.options;
      },


	    close: function () {
      		if (noder.fullScreen() === this.container[0]) {
        		noder.fullScreen(false);
      		}
    	},

    	getValue : function() {
    		return this.getSelectedItems();
    	},

    	cleared : function() {

    	},

    	selected : function() {

    	},

	    dataOptions: function (options) {
	    	return options;
	    },

	    enabled : function(helpers){
	    	
	    }

	});

	return views.ViewBase = ViewBase;
});

define('skylark-domx-plugins-repeater/views/LinearView',[
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-eventer",
    "skylark-domx-noder",
    "skylark-domx-geom",
    "skylark-domx-query",
    "../views",   
    "./ViewBase"
], function(langx, browser, eventer, noder, geom, $, views, ViewBase) {


  var LinearView = ViewBase.inherit({
    klassName : "LinearView",

    options: {
        alignment: 'left',
        infiniteScroll: false,
        itemRendered: null,
        noItemsHTML: 'no items found',
        selectable: false,

        template : '<ul class="clearfix repeater-linear" data-container="true" data-infinite="true" data-preserve="shallow"></ul>',
        item : {
            template: '<li class="repeater-item"><img  src="{{ThumbnailImage}}" class="thumb"/><h4 class="title">{{name}}</h4></div>'
        },
    },

    //ADDITIONAL METHODS
    clearSelectedItems : function() {
        this.repeater.$canvas.find('.repeater-linear .selectable.selected').removeClass('selected');
    },

    getSelectedItems : function() {
        var selected = [];
        this.repeater.$canvas.find('.repeater-linear .selectable.selected').each(function() {
            selected.push($(this));
        });
        return selected;
    },

    setSelectedItems : function(items, force) {
        var selectable = this.options.selectable;
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

        if (!langx.isArray(items)) {
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
                this.repeater.$canvas.find('.repeater-linear .selectable').each(compareItemIndex);
                if ($item.length > 0) {
                    selectItem($item, items[i].selected);
                }

            } else if (items[i].selector) {
                this.repeater.$canvas.find('.repeater-linear .selectable').each(compareItemSelector);
            }
        }
    },

    selected: function() {
        var infScroll = this.options.infiniteScroll;
        var opts;
        if (infScroll) {
            opts = (typeof infScroll === 'object') ? infScroll : {};
            this.infiniteScrolling(true, opts);
        }
    },
    before: function(helpers) {
        var alignment = this.options.alignment;
        var $cont = this.repeater.$canvas.find('.repeater-linear');
        var data = helpers.data;
        var response = {};
        var $empty, validAlignments;

        if ($cont.length < 1) {
            $cont = $(this.options.template);

            response.item = $cont;
        } else {
            response.action = 'none';
        }

        return response;
    },

    renderItem: function(helpers) {
        var selectable = this.options.selectable;
        var selected = 'selected';
        var self = this;
        var $item = this._create$Item(this.options.item.template,helpers.subset[helpers.index]);

        $item.data('item_data', helpers.data.items[helpers.index]);

        if (selectable) {
            $item.addClass('selectable');
            $item.on('click', function() {
                if (self.isDisabled) return;

                if (!$item.hasClass(selected)) {
                    if (selectable !== 'multi') {
                        self.repeater.$canvas.find('.repeater-linear .selectable.selected').each(function() {
                            var $itm = $(this);
                            $itm.removeClass(selected);
                            self.repeater.$element.trigger('deselected.lark.repeaterList', $itm);
                        });
                    }

                    $item.addClass(selected);
                    self.repeater.$element.trigger('selected.lark.repeaterList', $item);
                } else {
                    $item.removeClass(selected);
                    self.repeater.$element.trigger('deselected.lark.repeaterList', $item);
                }
            });
        }

        helpers.container.append($item);


        if (this.options.itemRendered) {
            this.options.itemRendered({
                container: helpers.container,
                item: $thumbnail,
                itemData: helpers.subset[helpers.index]
            }, function() {});
        }

        return false;
    }
    
  });


    views["linear"] = {
        name : "linear",
        ctor : LinearView
    };

    return LinearView;
    
});
/* global define, window, document, DocumentTouch */

define('skylark-domx-plugins-repeater/views/SliderView',[
  "skylark-langx/langx",
  "skylark-domx-noder",
  "skylark-domx-query",
  "../views", 
  "./ViewBase"
],function (langx,noder,$,views,ViewBase) {
  'use strict'

  var SliderView = ViewBase.inherit({
    klassName : "SliderView",

    options: {
      // The Id, element or querySelector of the repeater view:
      container: null,
      // The tag name, Id, element or querySelector of the slides container:
      slidesContainer: 'div.slides',
      // The tag name, Id, element or querySelector of the title element:
      titleElement: 'h3',
      // The class to add when the gallery is visible:
      displayClass: 'slider-display',
      // The class to add when the gallery only displays one element:
      singleClass: 'slider-single',
      // The class to add when the left edge has been reached:
      leftEdgeClass: 'slider-left',
      // The class to add when the right edge has been reached:
      rightEdgeClass: 'slider-right',
      // The class to add when the automatic slideshow is active:
      playingClass: 'slider-playing',
      // The class for all slides:
      slideClass: 'slide',
      // The slide class for loading elements:
      slideLoadingClass: 'slide-loading',
      // The slide class for elements that failed to load:
      slideErrorClass: 'slide-error',
      // The class for the content element loaded into each slide:
      slideContentClass: 'slide-content',
      // The class for the "toggle" control:
      toggleClass: 'toggle',
      // The class for the "prev" control:
      prevClass: 'prev',
      // The class for the "next" control:
      nextClass: 'next',
      // The class for the "close" control:
      closeClass: 'close',

      // The class for the "play-pause" toggle control:
      playPauseClass: 'play-pause',
      // The list object property (or data attribute) with the object type:
      //--- typeProperty: 'type',
      // The list object property (or data attribute) with the object title:
      //--- titleProperty: 'title',
      // The list object property (or data attribute) with the object alt text:
      //--- altTextProperty: 'alt',
      // The list object property (or data attribute) with the object URL:
      //--- urlProperty: 'href',
      // The list object property (or data attribute) with the object srcset URL(s):
      //--- srcsetProperty: 'urlset',
      // The gallery listens for transitionend events before triggering the
      // opened and closed events, unless the following option is set to false:
      displayTransition: true,
      // Defines if the gallery slides are cleared from the gallery modal,
      // or reused for the next gallery initialization:
      clearSlides: true,
      // Defines if images should be stretched to fill the available space,
      // while maintaining their aspect ratio (will only be enabled for browsers
      // supporting background-size="contain", which excludes IE < 9).
      // Set to "cover", to make images cover all available space (requires
      // support for background-size="cover", which excludes IE < 9):
      //--- stretchImages: false,
      // Toggle the controls on pressing the Return key:
      toggleControlsOnReturn: true,
      // Toggle the controls on slide click:
      toggleControlsOnSlideClick: true,
      // Toggle the automatic slideshow interval on pressing the Space key:
      toggleSlideshowOnSpace: true,
      // Navigate the gallery by pressing left and right on the keyboard:
      enableKeyboardNavigation: true,
      // Close the gallery on pressing the Esc key:
      closeOnEscape: true,
      // Close the gallery when clicking on an empty slide area:
      closeOnSlideClick: true,
      // Close the gallery by swiping up or down:
      closeOnSwipeUpOrDown: true,
      // Emulate touch events on mouse-pointer devices such as desktop browsers:
      emulateTouchEvents: true,
      // Stop touch events from bubbling up to ancestor elements of the Gallery:
      stopTouchEventsPropagation: false,
      // Hide the page scrollbars:
      hidePageScrollbars: false,
      // Stops any touches on the container from scrolling the page:
      disableScroll: true,
      // Carousel mode (shortcut for carousel specific options):
      carousel: false,
      // Allow continuous navigation, moving from last to first
      // and from first to last slide:
      continuous: true,
      // Remove elements outside of the preload range from the DOM:
      unloadElements: true,
      // Start with the automatic slideshow:
      startSlideshow: true,
      // Delay in milliseconds between slides for the automatic slideshow:
      slideshowInterval: 5000,
      // The starting index as integer.
      // Can also be an object of the given list,
      // or an equal object with the same url property:
      index: 0,
      // The number of elements to load around the current index:
      preloadRange: 2,
      // The transition speed between slide changes in milliseconds:
      transitionSpeed: 400,
      // The transition speed for automatic slide changes, set to an integer
      // greater 0 to override the default transition speed:
      slideshowTransitionSpeed: undefined,
      // The event object for which the default action will be canceled
      // on Gallery initialization (e.g. the click event to open the Gallery):
      event: undefined,

      // Callback function executed on slide change.
      // Is called with the gallery instance as "this" object and the
      // current index and slide as arguments:
      onslide: undefined,
      // Callback function executed after the slide change transition.
      // Is called with the gallery instance as "this" object and the
      // current index and slide as arguments:
      onslideend: undefined,
      // Callback function executed on slide content load.
      // Is called with the gallery instance as "this" object and the
      // slide index and slide element as arguments:
      onslidecomplete: undefined,


      // The tag name, Id, element or querySelector of the indicator container:
      indicatorContainer: 'ol',
      // The class for the active indicator:
      activeIndicatorClass: 'active',
      // The list object property (or data attribute) with the thumbnail URL,
      // used as alternative to a thumbnail child element:
      thumbnailProperty: 'ThumbnailImage',
      // Defines if the gallery indicators should display a thumbnail:
      thumbnailIndicators: true,

      indicators : {
            // Hide the page scrollbars:
          hidePageScrollbars: false,

          // The tag name, Id, element or querySelector of the indicator container:
          indicatorContainer: 'ol',
          // The class for the active indicator:
          activeIndicatorClass: 'active',
          // The list object property (or data attribute) with the thumbnail URL,
          // used as alternative to a thumbnail child element:
          thumbnailProperty: 'thumbnail',
          // Defines if the gallery indicators should display a thumbnail:
          thumbnailIndicators: true
      },



      "template" :'<div class="repeater-slider">' + 
                  '<div class="slides"></div>' +
                  '<h3 class="title"></h3>' +
                  '<a class="prev">‹</a>' +
                  '<a class="next">›</a>' +
                  '<a class="play-pause"></a>' +
                  '<ol class="indicator"></ol>' +
                  "</div>",

      "item" : {
        "template" : '<img height="75" src="{{ThumbnailImage}}" width="65"/>' 
      }
    },

    /*---
    carouselOptions: {
      hidePageScrollbars: false,
      toggleControlsOnReturn: false,
      toggleSlideshowOnSpace: false,
      enableKeyboardNavigation: false,
      closeOnEscape: false,
      closeOnSlideClick: false,
      closeOnSwipeUpOrDown: false,
      disableScroll: false,
      startSlideshow: true
    },
    */
    
    // Detect touch, transition, transform and background-size support:
    support: (function (element) {
      var support = {
        touch:
          window.ontouchstart !== undefined ||
          (window.DocumentTouch && document instanceof DocumentTouch)
      }
      var transitions = {
        webkitTransition: {
          end: 'webkitTransitionEnd',
          prefix: '-webkit-'
        },
        MozTransition: {
          end: 'transitionend',
          prefix: '-moz-'
        },
        OTransition: {
          end: 'otransitionend',
          prefix: '-o-'
        },
        transition: {
          end: 'transitionend',
          prefix: ''
        }
      }
      var prop
      for (prop in transitions) {
        if (
          transitions.hasOwnProperty(prop) &&
          element.style[prop] !== undefined
        ) {
          support.transition = transitions[prop]
          support.transition.name = prop
          break
        }
      }
      function elementTests () {
        var transition = support.transition
        var prop
        var translateZ
        document.body.appendChild(element)
        if (transition) {
          prop = transition.name.slice(0, -9) + 'ransform'
          if (element.style[prop] !== undefined) {
            element.style[prop] = 'translateZ(0)'
            translateZ = window
              .getComputedStyle(element)
              .getPropertyValue(transition.prefix + 'transform')
            support.transform = {
              prefix: transition.prefix,
              name: prop,
              translate: true,
              translateZ: !!translateZ && translateZ !== 'none'
            }
          }
        }
        if (element.style.backgroundSize !== undefined) {
          support.backgroundSize = {}
          element.style.backgroundSize = 'contain'
          support.backgroundSize.contain =
            window
              .getComputedStyle(element)
              .getPropertyValue('background-size') === 'contain'
          element.style.backgroundSize = 'cover'
          support.backgroundSize.cover =
            window
              .getComputedStyle(element)
              .getPropertyValue('background-size') === 'cover'
        }
        document.body.removeChild(element)
      }
      if (document.body) {
        elementTests()
      } else {
        $(document).on('DOMContentLoaded', elementTests)
      }
      return support
      // Test element, has to be standard HTML and must not be hidden
      // for the CSS3 tests using window.getComputedStyle to be applicable:
    })(document.createElement('div')),

    requestAnimationFrame:
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame,

    cancelAnimationFrame:
      window.cancelAnimationFrame ||
      window.webkitCancelRequestAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame,

    render: function (helper){
      //this.overrided(repeater,options);

      this.container = this.repeater.$canvas.find('.repeater-slider');

      if (this.container.length < 1) {
        this.container = $(this.options.template);
        this.repeater.$canvas.append(this.container);
      } 
      this.list = helper.data.items;
      //this.options.container = helper.container;
      this.num = this.list.length;

      this.initStartIndex()
      this.initView();

      this.initEventListeners()
      // Load the slide at the given index:
      this.onslide(this.index)
      // Manually trigger the slideend event for the initial slide:
      this.ontransitionend()
      // Start the automatic slideshow if applicable:
      if (this.options.startSlideshow) {
        this.play()
      }

    },

    slide: function (to, speed) {
      window.clearTimeout(this.timeout)
      var index = this.index
      var direction
      var naturalDirection
      var diff
      if (index === to || this.num === 1) {
        return
      }
      if (!speed) {
        speed = this.options.transitionSpeed
      }
      if (this.support.transform) {
        if (!this.options.continuous) {
          to = this.circle(to)
        }
        // 1: backward, -1: forward:
        direction = Math.abs(index - to) / (index - to)
        // Get the actual position of the slide:
        if (this.options.continuous) {
          naturalDirection = direction
          direction = -this.positions[this.circle(to)] / this.slideWidth
          // If going forward but to < index, use to = slides.length + to
          // If going backward but to > index, use to = -slides.length + to
          if (direction !== naturalDirection) {
            to = -direction * this.num + to
          }
        }
        diff = Math.abs(index - to) - 1
        // Move all the slides between index and to in the right direction:
        while (diff) {
          diff -= 1
          this.move(
            this.circle((to > index ? to : index) - diff - 1),
            this.slideWidth * direction,
            0
          )
        }
        to = this.circle(to)
        this.move(index, this.slideWidth * direction, speed)
        this.move(to, 0, speed)
        if (this.options.continuous) {
          this.move(
            this.circle(to - direction),
            -(this.slideWidth * direction),
            0
          )
        }
      } else {
        to = this.circle(to)
        this.animate(index * -this.slideWidth, to * -this.slideWidth, speed)
      }
      this.onslide(to)
    },

    getIndex: function () {
      return this.index
    },

    getNumber: function () {
      return this.num
    },

    prev: function () {
      if (this.options.continuous || this.index) {
        this.slide(this.index - 1)
      }
    },

    next: function () {
      if (this.options.continuous || this.index < this.num - 1) {
        this.slide(this.index + 1)
      }
    },

    circle: function (index) {
      // Always return a number inside of the slides index range:
      return (this.num + index % this.num) % this.num
    },

    move: function (index, dist, speed) {
      this.translateX(index, dist, speed)
      this.positions[index] = dist
    },

    translate: function (index, x, y, speed) {
      var style = this.slides[index].style
      var transition = this.support.transition
      var transform = this.support.transform
      style[transition.name + 'Duration'] = speed + 'ms'
      style[transform.name] =
        'translate(' +
        x +
        'px, ' +
        y +
        'px)' +
        (transform.translateZ ? ' translateZ(0)' : '')
    },

    translateX: function (index, x, speed) {
      this.translate(index, x, 0, speed)
    },

    translateY: function (index, y, speed) {
      this.translate(index, 0, y, speed)
    },

    animate: function (from, to, speed) {
      if (!speed) {
        this.slidesContainer[0].style.left = to + 'px'
        return
      }
      var that = this
      var start = new Date().getTime()
      var timer = window.setInterval(function () {
        var timeElap = new Date().getTime() - start
        if (timeElap > speed) {
          that.slidesContainer[0].style.left = to + 'px'
          that.ontransitionend()
          window.clearInterval(timer)
          return
        }
        that.slidesContainer[0].style.left =
          (to - from) * (Math.floor(timeElap / speed * 100) / 100) + from + 'px'
      }, 4)
    },

    play: function (time) {
      var that = this
      window.clearTimeout(this.timeout)
      this.interval = time || this.options.slideshowInterval;
      this.timeout = this.setTimeout(
        (!this.requestAnimationFrame && this.slide) ||
          function (to, speed) {
            that.animationFrameId = that.requestAnimationFrame.call(
              window,
              function () {
                that.slide(to, speed)
              }
            )
          },
        [this.index + 1, this.options.slideshowTransitionSpeed],
        this.interval
      )

      this.container.addClass(this.options.playingClass)
    },

    pause: function () {
      window.clearTimeout(this.timeout)
      this.interval = null
      if (this.cancelAnimationFrame) {
        this.cancelAnimationFrame.call(window, this.animationFrameId)
        this.animationFrameId = null
      }
      this.container.removeClass(this.options.playingClass)
    },

    add: function (list) {
      var i
      if (!list.concat) {
        // Make a real array out of the list to add:
        list = Array.prototype.slice.call(list)
      }
      if (!this.list.concat) {
        // Make a real array out of the Gallery list:
        this.list = Array.prototype.slice.call(this.list)
      }
      this.list = this.list.concat(list)
      this.num = this.list.length
      if (this.num > 2 && this.options.continuous === null) {
        this.options.continuous = true
        this.container.removeClass(this.options.leftEdgeClass)
      }
      this.container
        .removeClass(this.options.rightEdgeClass)
        .removeClass(this.options.singleClass)
      for (i = this.num - list.length; i < this.num; i += 1) {
        this.addSlide(i)
        this.positionSlide(i)
      }
      this.positions.length = this.num
      this.initSlides(true)
    },

    resetSlides: function () {
      this.slidesContainer.empty()
      this.unloadAllSlides()
      this.slides = []

      this.indicatorContainer.empty();
      this.indicators = [];

    },

    preventDefault: function (event) {
      if (event.preventDefault) {
        event.preventDefault()
      } else {
        event.returnValue = false
      }
    },

    stopPropagation: function (event) {
      if (event.stopPropagation) {
        event.stopPropagation()
      } else {
        event.cancelBubble = true
      }
    },

    onresize: function () {
      this.initSlides(true)
    },

    onmousedown: function (event) {
      // Trigger on clicks of the left mouse button only
      // and exclude video & audio elements:
      if (
        event.which &&
        event.which === 1 &&
        event.target.nodeName !== 'VIDEO' &&
        event.target.nodeName !== 'AUDIO'
      ) {
        // Preventing the default mousedown action is required
        // to make touch emulation work with Firefox:
        event.preventDefault()
        ;(event.originalEvent || event).touches = [
          {
            pageX: event.pageX,
            pageY: event.pageY
          }
        ]
        this.ontouchstart(event)
      }
    },

    onmousemove: function (event) {
      if (this.touchStart) {
        ;(event.originalEvent || event).touches = [
          {
            pageX: event.pageX,
            pageY: event.pageY
          }
        ]
        this.ontouchmove(event)
      }
    },

    onmouseup: function (event) {
      if (this.touchStart) {
        this.ontouchend(event)
        delete this.touchStart
      }
    },

    onmouseout: function (event) {
      if (this.touchStart) {
        var target = event.target
        var related = event.relatedTarget
        if (!related || (related !== target && !noder.contains(target, related))) {
          this.onmouseup(event)
        }
      }
    },

    ontouchstart: function (event) {
      if (this.options.stopTouchEventsPropagation) {
        this.stopPropagation(event)
      }
      // jQuery doesn't copy touch event properties by default,
      // so we have to access the originalEvent object:
      var touches = (event.originalEvent || event).touches[0]
      this.touchStart = {
        // Remember the initial touch coordinates:
        x: touches.pageX,
        y: touches.pageY,
        // Store the time to determine touch duration:
        time: Date.now()
      }
      // Helper variable to detect scroll movement:
      this.isScrolling = undefined
      // Reset delta values:
      this.touchDelta = {}
    },

    ontouchmove: function (event) {
      if (this.options.stopTouchEventsPropagation) {
        this.stopPropagation(event)
      }
      // jQuery doesn't copy touch event properties by default,
      // so we have to access the originalEvent object:
      var touches = (event.originalEvent || event).touches[0]
      var scale = (event.originalEvent || event).scale
      var index = this.index
      var touchDeltaX
      var indices
      // Ensure this is a one touch swipe and not, e.g. a pinch:
      if (touches.length > 1 || (scale && scale !== 1)) {
        return
      }
      if (this.options.disableScroll) {
        event.preventDefault()
      }
      // Measure change in x and y coordinates:
      this.touchDelta = {
        x: touches.pageX - this.touchStart.x,
        y: touches.pageY - this.touchStart.y
      }
      touchDeltaX = this.touchDelta.x
      // Detect if this is a vertical scroll movement (run only once per touch):
      if (this.isScrolling === undefined) {
        this.isScrolling =
          this.isScrolling ||
          Math.abs(touchDeltaX) < Math.abs(this.touchDelta.y)
      }
      if (!this.isScrolling) {
        // Always prevent horizontal scroll:
        event.preventDefault()
        // Stop the slideshow:
        window.clearTimeout(this.timeout)
        if (this.options.continuous) {
          indices = [this.circle(index + 1), index, this.circle(index - 1)]
        } else {
          // Increase resistance if first slide and sliding left
          // or last slide and sliding right:
          this.touchDelta.x = touchDeltaX =
            touchDeltaX /
            ((!index && touchDeltaX > 0) ||
            (index === this.num - 1 && touchDeltaX < 0)
              ? Math.abs(touchDeltaX) / this.slideWidth + 1
              : 1)
          indices = [index]
          if (index) {
            indices.push(index - 1)
          }
          if (index < this.num - 1) {
            indices.unshift(index + 1)
          }
        }
        while (indices.length) {
          index = indices.pop()
          this.translateX(index, touchDeltaX + this.positions[index], 0)
        }
      } else {
        this.translateY(index, this.touchDelta.y + this.positions[index], 0)
      }
    },

    ontouchend: function (event) {
      if (this.options.stopTouchEventsPropagation) {
        this.stopPropagation(event)
      }
      var index = this.index
      var speed = this.options.transitionSpeed
      var slideWidth = this.slideWidth
      var isShortDuration = Number(Date.now() - this.touchStart.time) < 250
      // Determine if slide attempt triggers next/prev slide:
      var isValidSlide =
        (isShortDuration && Math.abs(this.touchDelta.x) > 20) ||
        Math.abs(this.touchDelta.x) > slideWidth / 2
      // Determine if slide attempt is past start or end:
      var isPastBounds =
        (!index && this.touchDelta.x > 0) ||
        (index === this.num - 1 && this.touchDelta.x < 0)
      var isValidClose =
        !isValidSlide &&
        this.options.closeOnSwipeUpOrDown &&
        ((isShortDuration && Math.abs(this.touchDelta.y) > 20) ||
          Math.abs(this.touchDelta.y) > this.slideHeight / 2)
      var direction
      var indexForward
      var indexBackward
      var distanceForward
      var distanceBackward
      if (this.options.continuous) {
        isPastBounds = false
      }
      // Determine direction of swipe (true: right, false: left):
      direction = this.touchDelta.x < 0 ? -1 : 1
      if (!this.isScrolling) {
        if (isValidSlide && !isPastBounds) {
          indexForward = index + direction
          indexBackward = index - direction
          distanceForward = slideWidth * direction
          distanceBackward = -slideWidth * direction
          if (this.options.continuous) {
            this.move(this.circle(indexForward), distanceForward, 0)
            this.move(this.circle(index - 2 * direction), distanceBackward, 0)
          } else if (indexForward >= 0 && indexForward < this.num) {
            this.move(indexForward, distanceForward, 0)
          }
          this.move(index, this.positions[index] + distanceForward, speed)
          this.move(
            this.circle(indexBackward),
            this.positions[this.circle(indexBackward)] + distanceForward,
            speed
          )
          index = this.circle(indexBackward)
          this.onslide(index)
        } else {
          // Move back into position
          if (this.options.continuous) {
            this.move(this.circle(index - 1), -slideWidth, speed)
            this.move(index, 0, speed)
            this.move(this.circle(index + 1), slideWidth, speed)
          } else {
            if (index) {
              this.move(index - 1, -slideWidth, speed)
            }
            this.move(index, 0, speed)
            if (index < this.num - 1) {
              this.move(index + 1, slideWidth, speed)
            }
          }
        }
      } else {
          // Move back into position
          this.translateY(index, 0, speed)
      }
    },

    ontouchcancel: function (event) {
      if (this.touchStart) {
        this.ontouchend(event)
        delete this.touchStart
      }
    },

    ontransitionend: function (event) {
      var slide = this.slides[this.index]
      if (!event || slide === event.target) {
        if (this.interval) {
          this.play()
        }
        this.setTimeout(this.options.onslideend, [this.index, slide])
      }
    },

    onkeydown: function (event) {
      switch (event.which || event.keyCode) {
        case 13: // Return
          if (this.options.toggleControlsOnReturn) {
            this.preventDefault(event)
            this.toggleControls()
          }
          break
        case 27: // Esc
          break
        case 32: // Space
          if (this.options.toggleSlideshowOnSpace) {
            this.preventDefault(event)
            this.toggleSlideshow()
          }
          break
        case 37: // Left
          if (this.options.enableKeyboardNavigation) {
            this.preventDefault(event)
            this.prev()
          }
          break
        case 39: // Right
          if (this.options.enableKeyboardNavigation) {
            this.preventDefault(event)
            this.next()
          }
          break
      }
    },

    handleClick: function (event) {
      var options = this.options
      var target = event.target || event.srcElement
      var parent = target.parentNode

      if (parent === this.indicatorContainer[0]) {
        // Click on indicator element
        this.preventDefault(event)
        this.slide(this.getNodeIndex(target))
      } else if (parent.parentNode === this.indicatorContainer[0]) {
        // Click on indicator child element
        this.preventDefault(event)
        this.slide(this.getNodeIndex(parent))
      } else {
        function isTarget (className) {
          return $(target).hasClass(className) || $(parent).hasClass(className)
        }


        if (isTarget(options.toggleClass)) {
          // Click on "toggle" control
          this.preventDefault(event)
          this.toggleControls()
        } else if (isTarget(options.prevClass)) {
          // Click on "prev" control
          this.preventDefault(event)
          this.prev()
        } else if (isTarget(options.nextClass)) {
          // Click on "next" control
          this.preventDefault(event)
          this.next()
        } else if (isTarget(options.playPauseClass)) {
          // Click on "play-pause" control
          this.preventDefault(event)
          this.toggleSlideshow()
        } else if (parent === this.slidesContainer[0]) {
          // Click on slide background
          if (options.toggleControlsOnSlideClick) {
            this.preventDefault(event)
            this.toggleControls()
          }
        } else if (
          parent.parentNode &&
          parent.parentNode === this.slidesContainer[0]
        ) {
          // Click on displayed element
          if (options.toggleControlsOnSlideClick) {
            this.preventDefault(event)
            this.toggleControls()
          }
        }
      }
    },

    onclick: function (event) {
      if (
        this.options.emulateTouchEvents &&
        this.touchDelta &&
        (Math.abs(this.touchDelta.x) > 20 || Math.abs(this.touchDelta.y) > 20)
      ) {
        delete this.touchDelta
        return
      }
      return this.handleClick(event)
    },

    updateEdgeClasses: function (index) {
      if (!index) {
        this.container.addClass(this.options.leftEdgeClass)
      } else {
        this.container.removeClass(this.options.leftEdgeClass)
      }
      if (index === this.num - 1) {
        this.container.addClass(this.options.rightEdgeClass)
      } else {
        this.container.removeClass(this.options.rightEdgeClass)
      }
    },

    handleSlide: function (index) {
      if (!this.options.continuous) {
        this.updateEdgeClasses(index)
      }
      this.loadElements(index)
      if (this.options.unloadElements) {
        this.unloadElements(index)
      }
      this.setTitle(index)

      this.setActiveIndicator(index)

    },

    onslide: function (index) {
      this.index = index
      this.handleSlide(index)
      this.setTimeout(this.options.onslide, [index, this.slides[index]])
    },

    setTitle: function (index) {
      var firstChild = this.slides[index].firstChild
      var text = firstChild.title || firstChild.alt
      var titleElement = this.titleElement
      if (titleElement.length) {
        this.titleElement.empty()
        if (text) {
          titleElement[0].appendChild(document.createTextNode(text))
        }
      }
    },

    setTimeout: function (func, args, wait) {
      var that = this
      return (
        func &&
        window.setTimeout(function () {
          func.apply(that, args || [])
        }, wait || 0)
      )
    },

    createElement: function (obj, callback) {
      var $item = this._create$Item(this.options.item.template,obj);
      $item.find("img").on('load error', callback);

      $item.addClass(this.options.slideContentClass);
      return $item;
    },

    loadElement: function (index) {
      if (!this.elements[index]) {
        if (this.slides[index].firstChild) {
          this.elements[index] = $(this.slides[index]).hasClass(
            this.options.slideErrorClass
          )
            ? 3
            : 2
        } else {
          this.elements[index] = 1 // Loading
          $(this.slides[index]).append(            
            this.createElement(this.list[index], this.proxyListener)
          );
          //$(this.slides[index]).addClass(this.options.slideLoadingClass).append(            
          //  this.createElement(this.list[index], this.proxyListener)
          //);
        }
      }
    },

    loadElements: function (index) {
      var limit = Math.min(this.num, this.options.preloadRange * 2 + 1)
      var j = index
      var i
      for (i = 0; i < limit; i += 1) {
        // First load the current slide element (0),
        // then the next one (+1),
        // then the previous one (-2),
        // then the next after next (+2), etc.:
        j += i * (i % 2 === 0 ? -1 : 1)
        // Connect the ends of the list to load slide elements for
        // continuous navigation:
        j = this.circle(j)
        this.loadElement(j)
      }
    },

    unloadElements: function (index) {
      var i, diff
      for (i in this.elements) {
        if (this.elements.hasOwnProperty(i)) {
          diff = Math.abs(index - i)
          if (
            diff > this.options.preloadRange &&
            diff + this.options.preloadRange < this.num
          ) {
            this.unloadSlide(i)
            delete this.elements[i]
          }
        }
      }
    },


    createIndicator: function (obj) {
      var repeater = this.repeater,
          indicator = this.indicatorPrototype.cloneNode(false)
      var title = repeater.getItemProperty(obj,"title")
      var thumbnailProperty = this.options.thumbnailProperty
      var thumbnailUrl
      var thumbnail
      if (this.options.thumbnailIndicators) {
        if (thumbnailProperty) {
          thumbnailUrl = repeater.getItemProperty(obj, thumbnailProperty)
        }
        if (thumbnailUrl === undefined) {
          thumbnail = obj.getElementsByTagName && $(obj).find('img')[0]
          if (thumbnail) {
            thumbnailUrl = thumbnail.src
          }
        }
        if (thumbnailUrl) {
          indicator.style.backgroundImage = 'url("' + thumbnailUrl + '")'
        }
      }
      if (title) {
        indicator.title = title;
      }
      return indicator;
    },

    addIndicator: function (index) {
      if (this.indicatorContainer.length) {
        var indicator = this.createIndicator(this.list[index])
        indicator.setAttribute('data-index', index)
        this.indicatorContainer[0].appendChild(indicator)
        this.indicators.push(indicator)
      }
    },

    setActiveIndicator: function (index) {
      if (this.indicators) {
        if (this.activeIndicator) {
          this.activeIndicator.removeClass(this.options.activeIndicatorClass)
        }
        this.activeIndicator = $(this.indicators[index])
        this.activeIndicator.addClass(this.options.activeIndicatorClass)
      }
    },


    addSlide: function (index) {
      var slide = this.slidePrototype.cloneNode(false)
      slide.setAttribute('data-index', index)
      this.slidesContainer[0].appendChild(slide)
      this.slides.push(slide)

      this.addIndicator(index)
    },

    positionSlide: function (index) {
      var slide = this.slides[index]
      slide.style.width = this.slideWidth + 'px'
      if (this.support.transform) {
        slide.style.left = index * -this.slideWidth + 'px'
        this.move(
          index,
          this.index > index
            ? -this.slideWidth
            : this.index < index ? this.slideWidth : 0,
          0
        )
      }
    },

    initSlides: function (reload) {
      var clearSlides, i
      if (!reload) {
        // indicator
        this.indicatorContainer = this.container.find(
          this.options.indicatorContainer
        )
        if (this.indicatorContainer.length) {
          this.indicatorPrototype = document.createElement('li')
          this.indicators = this.indicatorContainer[0].children
        }

        this.positions = []
        this.positions.length = this.num
        this.elements = {}
        this.imagePrototype = document.createElement('img')
        this.elementPrototype = document.createElement('div')
        this.slidePrototype = document.createElement('div')
        $(this.slidePrototype).addClass(this.options.slideClass)
        this.slides = this.slidesContainer[0].children
        clearSlides =
          this.options.clearSlides || this.slides.length !== this.num
      }
      this.slideWidth = this.container[0].clientWidth
      this.slideHeight = this.container[0].clientHeight
      this.slidesContainer[0].style.width = this.num * this.slideWidth + 'px'
      if (clearSlides) {
        this.resetSlides()
      }
      for (i = 0; i < this.num; i += 1) {
        if (clearSlides) {
          this.addSlide(i)
        }
        this.positionSlide(i)
      }
      // Reposition the slides before and after the given index:
      if (this.options.continuous && this.support.transform) {
        this.move(this.circle(this.index - 1), -this.slideWidth, 0)
        this.move(this.circle(this.index + 1), this.slideWidth, 0)
      }
      if (!this.support.transform) {
        this.slidesContainer[0].style.left =
          this.index * -this.slideWidth + 'px'
      }
    },

    unloadSlide: function (index) {
      var slide, firstChild
      slide = this.slides[index]
      firstChild = slide.firstChild
      if (firstChild !== null) {
        slide.removeChild(firstChild)
      }
    },

    unloadAllSlides: function () {
      var i, len
      for (i = 0, len = this.slides.length; i < len; i++) {
        this.unloadSlide(i)
      }
    },

    toggleControls: function () {

      var controlsClass = this.options.controlsClass
      if (this.container.hasClass(controlsClass)) {
        this.container.removeClass(controlsClass)
      } else {
        this.container.addClass(controlsClass)
      }
    },

    toggleSlideshow: function () {
      if (!this.interval) {
        this.play()
      } else {
        this.pause()
      }
    },

    getNodeIndex: function (element) {
      return parseInt(element.getAttribute('data-index'), 10)
    },

    initStartIndex: function () {
      var repeater = this.repeater,
          index = this.options.index;
      var i
      // Check if the index is given as a list object:
      if (index && typeof index !== 'number') {
        for (i = 0; i < this.num; i += 1) {
          if (
            this.list[i] === index || repeater.getItemUrl(this.list[i]) ===  repeater.getItemUrl(index) ) {
            index = i
            break
          }
        }
      }
      // Make sure the index is in the list range:
      this.index = this.circle(parseInt(index, 10) || 0)
    },

    initEventListeners: function () {
      var that = this
      var slidesContainer = this.slidesContainer
      function proxyListener (event) {
        var type =
          that.support.transition && that.support.transition.end === event.type
            ? 'transitionend'
            : event.type
        that['on' + type](event)
      }
      $(window).on('resize', proxyListener)
      $(document.body).on('keydown', proxyListener)
      this.container.on('click', proxyListener)
      if (this.support.touch) {
        slidesContainer.on(
          'touchstart touchmove touchend touchcancel',
          proxyListener
        )
      } else if (this.options.emulateTouchEvents && this.support.transition) {
        slidesContainer.on(
          'mousedown mousemove mouseup mouseout',
          proxyListener
        )
      }
      if (this.support.transition) {
        slidesContainer.on(this.support.transition.end, proxyListener)
      }
      this.proxyListener = proxyListener
    },

    destroyEventListeners: function () {
      var slidesContainer = this.slidesContainer
      var proxyListener = this.proxyListener
      $(window).off('resize', proxyListener)
      $(document.body).off('keydown', proxyListener)
      this.container.off('click', proxyListener)
      if (this.support.touch) {
        slidesContainer.off(
          'touchstart touchmove touchend touchcancel',
          proxyListener
        )
      } else if (this.options.emulateTouchEvents && this.support.transition) {
        slidesContainer.off(
          'mousedown mousemove mouseup mouseout',
          proxyListener
        )
      }
      if (this.support.transition) {
        slidesContainer.off(this.support.transition.end, proxyListener)
      }
    },


    initView: function () {
      var that = this

      /*
      this.container = $(this.options.container)
      if (!this.container.length) {
        console.log(
          'blueimp Gallery: Widget container not found.',
          this.options.container
        )
        return false
      }
      */

      this.slidesContainer = this.container
        .find(this.options.slidesContainer)
        .first()
      if (!this.slidesContainer.length) {
        console.log(
          'blueimp Gallery: Slides container not found.',
          this.options.slidesContainer
        )
        return false
      }
      this.titleElement = this.container.find(this.options.titleElement).first()
      if (this.num === 1) {
        this.container.addClass(this.options.singleClass)
      }
      if (this.options.hidePageScrollbars) {
        // Hide the page scrollbars:
        this.bodyOverflowStyle = document.body.style.overflow
        document.body.style.overflow = 'hidden'
      }
      this.container[0].style.display = 'block'
      this.initSlides()
      this.container.addClass(this.options.displayClass)
    },

    initOptions: function (options) {
      // Create a copy of the prototype options:
      this.overrided(langx.mixin({}, SliderView.prototype.options,options));

      if (this.num < 3) {
        // 1 or 2 slides cannot be displayed continuous,
        // remember the original option by setting to null instead of false:
        this.options.continuous = this.options.continuous ? null : false
      }
      if (!this.support.transition) {
        this.options.emulateTouchEvents = false
      }
      if (this.options.event) {
        this.preventDefault(this.options.event)
      }
    }
  });

  views["slider"] = {
    "name" :  "slider",
    "ctor" :  SliderView
  };

  return SliderView;

});

define('skylark-domx-plugins-repeater/views/TableView',[
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-eventer",
    "skylark-domx-noder",
    "skylark-domx-geom",
    "skylark-domx-query",
    "../views",   
    "./ViewBase"
], function(langx, browser, eventer, noder, geom, $, views, ViewBase) {

  var TableView = ViewBase.inherit({
    klassName : "TableView",

    options: {
        columnRendered: null,
        columnSizing: true,
        columnSyncing: true,
        highlightSortedColumn: true,
        infiniteScroll: false,
        noItemsHTML: 'no items found',
        selectable: false,
        sortClearing: false,
        rowRendered: null,
        frozenColumns: 0,
        actions: false,

        viewClass : "repeater-table",
        tableWrapperClass : "repeater-table-wrapper",
        checkClass : "repeater-table-check",
        headingClass : "repeater-table-heading",
        actionsPlaceHolderClass : "repeater-table-actions-placeholder"
    },

    clearSelectedItems : function listClearSelectedItems () {
        this.repeater.$canvas.find(`.${this.options.checkClass}`).remove();
        this.repeater.$canvas.find(`.${this.options.viewClass} table tbody tr.selected`).removeClass('selected');
    },

    highlightColumn : function listHighlightColumn (index, force) {
        var tbody = this.repeater.$canvas.find(`.${this.options.tableWrapperClass} > table tbody`);
        if (this.options.highlightSortedColumn || force) {
            tbody.find('td.sorted').removeClass('sorted');
            tbody.find('tr').each(function eachTR () {
                var col = $(this).find('td:nth-child(' + (index + 1) + ')').filter(function filterChildren () { return !$(this).parent().hasClass('empty'); });
                col.addClass('sorted');
            });
        }
    },

    getSelectedItems : function listGetSelectedItems () {
        var selected = [];
        this.repeater.$canvas.find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table tbody tr.selected`).each(function eachSelectedTR () {
            var $item = $(this);
            selected.push({
                data: $item.data('item_data'),
                element: $item
            });
        });
        return selected;
    },

    positionHeadings : function listPositionHeadings () {
        var $wrapper = this.repeater.$element.find(`.${this.options.tableWrapperClass}`);
        var offsetLeft = $wrapper.offset().left;
        var scrollLeft = $wrapper.scrollLeft();
        if (scrollLeft > 0) {
            $wrapper.find(`.${this.options.headingClass}`).each(function eachListHeading () {
                var $heading = $(this);
                var left = ($heading.parents('th:first').offset().left - offsetLeft) + 'px';
                $heading.addClass('shifted').css('left', left);
            });
        } else {
            $wrapper.find(`.${this.options.headingClass}`).each(function eachListHeading () {
                $(this).removeClass('shifted').css('left', '');
            });
        }
    },

    setSelectedItems : function listSetSelectedItems (itms, force) {
        var selectable = this.options.selectable;
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
                    self.clearSelectedItems();
                }

                if (!$itm.hasClass('selected')) {
                    $itm.addClass('selected');

                    if (self.options.frozenColumns || self.options.selectable === 'multi') {
                        $frozenCols = self.repeater.$element.find('.frozen-column-wrapper tr:nth-child(' + (index + 1) + ')');

                        $frozenCols.addClass('selected');
                        $frozenCols.find('.repeater-select-checkbox').addClass('checked');
                    }

                    if (self.options.actions) {
                        self.repeater.$element.find('.actions-column-wrapper tr:nth-child(' + (index + 1) + ')').addClass('selected');
                    }

                    $itm.find('td:first').prepend(`<div class="${this.options.checkClass}"><span class="glyphicon glyphicon-ok"></span></div>`);
                }
            } else {
                if (self.options.frozenColumns) {
                    $frozenCols = self.repeater.$element.find('.frozen-column-wrapper tr:nth-child(' + (index + 1) + ')');

                    $frozenCols.addClass('selected');
                    $frozenCols.find('.repeater-select-checkbox').removeClass('checked');
                }

                if (self.options.actions) {
                    self.repeater.$element.find('.actions-column-wrapper tr:nth-child(' + (index + 1) + ')').removeClass('selected');
                }

                $itm.find(`.${this.options.checkClass}`).remove();
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
                $item = this.repeater.$canvas.find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table tbody tr:nth-child(` + (items[i].index + 1) + ')');
                if ($item.length > 0) {
                    selectItem($item, items[i].selected, items[i].index);
                }
            } else if (items[i].property !== undefined && items[i].value !== undefined) {
                this.repeater.$canvas.find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table tbody tr`).each(checkIfItemMatchesValue);
            }
        }
    },

    sizeHeadings : function listSizeHeadings () {
        var $table = this.repeater.$element.find(`.${this.options.viewClass} table`);
        var self = this;
        $table.find('thead th').each(function eachTH () {
            var $th = $(this);
            var $heading = $th.find(`.${self.options.headingClass}`);
            $heading.css({ height: $th.outerHeight() });
            $heading.outerWidth($heading.data('forced-width') || $th.outerWidth());
        });
    },

    setFrozenColumns : function listSetFrozenColumns () {
        var frozenTable = this.repeater.$canvas.find('.table-frozen');
        var $wrapper = this.repeater.$element.find('.repeater-canvas');
        var $table = this.repeater.$element.find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table`);
        var repeaterWrapper = this.repeater.$element.find(`.${this.options.viewClass}`);
        var numFrozenColumns = this.options.frozenColumns;
        var self = this;

        if (this.options.selectable === 'multi') {
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
            this.repeater.$canvas.addClass('frozen-enabled');
        }

        this.sizeFrozenColumns();

        $(`.frozen-thead-wrapper .${this.options.headingClass}`).on('click', function onClickHeading () {
            var index = $(this).parent('th').index();
            index = index + 1;
            self.repeater.$element.find(`.${this.options.tableWrapperClass} > table thead th:nth-child(` + index + `) .${this.options.headingClass}`)[0].click();
        });
    },

    positionColumns : function listPositionColumns () {
        var $wrapper = this.repeater.$element.find('.repeater-canvas');
        var scrollTop = $wrapper.scrollTop();
        var scrollLeft = $wrapper.scrollLeft();
        var frozenEnabled = this.options.frozenColumns || this.options.selectable === 'multi';
        var actionsEnabled = this.options.actions;

        var canvasWidth = this.repeater.$element.find('.repeater-canvas').outerWidth();
        var tableWidth = this.repeater.$element.find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table`).outerWidth();

        var actionsWidth = this.repeater.$element.find('.table-actions') ? this.repeater.$element.find('.table-actions').outerWidth() : 0;

        var shouldScroll = (tableWidth - (canvasWidth - actionsWidth)) >= scrollLeft;


        if (scrollTop > 0) {
            $wrapper.find(`.${this.options.headingClass}`).css('top', scrollTop);
        } else {
            $wrapper.find(`.${this.options.headingClass}`).css('top', '0');
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
    },

    createItemActions : function () {
        var actionsHtml = '';
        var self = this;
        var i;
        var $table = this.repeater.$element.find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table`);
        var $actionsTable = this.repeater.$canvas.find('.table-actions');
        var len = this.options.actions.items.length;
        if (len == 1) {
            var action = this.options.actions.items[0];
            actionsHtml = '<a href="javascript:void(0)" data-action="' + action.name + '" class="action-item"> ' + action.html + '</a>'
            if ($actionsTable.length < 1) {
                var $actionsColumnWrapper = $('<div class="actions-column-wrapper" style="width: ' + this.options.actions.width + 'px"></div>').insertBefore($table);
                var $actionsColumn = $table.clone().addClass('table-actions');
                $actionsColumn.find('th:not(:last-child)').remove();
                $actionsColumn.find('tr td:not(:last-child)').remove();

                var $actionsCells = $actionsColumn.find('td');

                $actionsCells.each(function (rowNumber) {
                    var id = $(this).parent().attr("id");
                    var data = $("#" + id).data("item_data")
                    if (self.options.exceptActionRows && data && langx.inArray(self.options.exceptActionRows, data.name)) {
                        $(this).html("-");
                    } else {
                        $(this).html(actionsHtml);
                    }
                    $(this).find('a').attr('data-row', rowNumber + 1);
                });
            }
        } else {
            for (i = 0; i < len; i++) {
                var action = this.options.actions.items[i];
                var html = action.html;

                actionsHtml += '<li class="' + action.name + '"><a href="javascript:void(0)" data-action="' + action.name + '" class="action-item"> ' + html + '</a></li>';
            }
            var actionsDropdown = '<ul class="ul-inline list-unstyled ul-horizontally" role="menu">' +
                actionsHtml + '</ul>';
            if ($actionsTable.length < 1) {
                var $actionsColumnWrapper = $('<div class="actions-column-wrapper" style="width: ' + this.options.actions.width + 'px"></div>').insertBefore($table);
                var $actionsColumn = $table.clone().addClass('table-actions');
                $actionsColumn.find('th:not(:last-child)').remove();
                $actionsColumn.find('tr td:not(:last-child)').remove();

                // Dont show actions dropdown in header if not multi select
                if (this.options.selectable === 'multi' || this.options.selectable === 'action') {
                    $actionsColumn.find('thead tr').html('<th><div class="repeater-list-heading">' + actionsDropdown + '</div></th>');

                    if (this.options.selectable !== 'action') {
                        // disable the header dropdown until an item is selected
                        $actionsColumn.find('thead .btn').attr('disabled', 'disabled');
                    }
                } else {
                    var label = this.options.actions.label || '<span class="actions-hidden">a</span>';
                    $actionsColumn.find('thead tr').addClass('empty-heading').html('<th>' + label + '<div class="repeater-list-heading">' + label + '</div></th>');
                }

                // Create Actions dropdown for each cell in actions table
                var $actionsCells = $actionsColumn.find('td');

                $actionsCells.each(function addActionsDropdown(rowNumber) {
                    $(this).html(actionsDropdown).addClass("r-list-action");
                    $(this).find('a').attr('data-row', rowNumber + 1);
                });
            }
        }

        $actionsColumnWrapper.append($actionsColumn);

        this.repeater.$canvas.addClass('actions-enabled');
        this.sizeActionsTable();

        // row level actions click
        this.repeater.$element.find('.table-actions tbody .action-item').on('click', function onBodyActionItemClick(e) {
            if (!self.isDisabled) {
                var actionName = $(this).data('action');
                var row = $(this).data('row');
                var selected = {
                    actionName: actionName,
                    rows: [row]
                };
                self.getActionItems(selected, e);
            }
        });
        // bulk actions click
        this.repeater.$element.find('.table-actions thead .action-item').on('click', function onHeadActionItemClick(e) {
            if (!self.isDisabled) {
                var actionName = $(this).data('action');
                var selected = {
                    actionName: actionName,
                    rows: []
                };

                var selector = `.${this.options.tableWrapperClass} > table .selected`;

                if ( self.options.selectable === 'action' ) {
                    selector = `.${this.options.tableWrapperClass} > table tr`;
                }

                self.repeater.$element.find(selector).each(function eachSelector(selectorIndex) {
                    selected.rows.push(selectorIndex + 1);
                });

                self.getActionItems(selected, e);
            }
        });
    },
    createItemActions_1: function  () {

        var actionsHtml = '';
        var self = this;
        var i;
        var length;
        var $table = this.repeater.$element.find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table`);
        var $actionsTable = this.repeater.$canvas.find('.table-actions');

        for (i = 0, length = this.options.actions.items.length; i < length; i++) {
            var action = this.options.actions.items[i];
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
            var $actionsColumnWrapper = $('<div class="actions-column-wrapper" style="width: ' + this.actions_width + 'px"></div>').insertBefore($table);
            var $actionsColumn = $table.clone().addClass('table-actions');
            $actionsColumn.find('th:not(:last-child)').remove();
            $actionsColumn.find('tr td:not(:last-child)').remove();

            // Dont show actions dropdown in header if not multi select
            if (this.options.selectable === 'multi' || this.options.selectable === 'action') {
                $actionsColumn.find('thead tr').html(`<th><div class="${this.options.headingClass}">` + actionsDropdown + '</div></th>');

                if (this.options.selectable !== 'action') {
                    // disable the header dropdown until an item is selected
                    $actionsColumn.find('thead .btn').attr('disabled', 'disabled');
                }
            } else {
                var label = this.options.actions.label || '<span class="actions-hidden">a</span>';
                $actionsColumn.find('thead tr').addClass('empty-heading').html('<th>' + label + `<div class="${this.options.headingClass}">` + label + '</div></th>');
            }

            // Create Actions dropdown for each cell in actions table
            var $actionsCells = $actionsColumn.find('td');

            $actionsCells.each(function addActionsDropdown (rowNumber) {
                $(this).html(actionsDropdown);
                $(this).find('a').attr('data-row', rowNumber + 1);
            });

            $actionsColumnWrapper.append($actionsColumn);

            this.repeater.$canvas.addClass('actions-enabled');
        }

        this.sizeActionsTable();

        // row level actions click
        this.repeater.$element.find('.table-actions tbody .action-item').on('click', function onBodyActionItemClick (e) {
            if (!self.isDisabled) {
                var actionName = $(this).data('action');
                var row = $(this).data('row');
                var selected = {
                    actionName: actionName,
                    rows: [row]
                };
                self.getActionItems(selected, e);
            }
        });
        // bulk actions click
        this.repeater.$element.find('.table-actions thead .action-item').on('click', function onHeadActionItemClick (e) {
            if (!self.isDisabled) {
                var actionName = $(this).data('action');
                var selected = {
                    actionName: actionName,
                    rows: []
                };
                var selector = `.${this.options.tableWrapperClass} > table .selected`;

                if ( self.options.selectable === 'action' ) {
                    selector = `.${this.options.tableWrapperClass} > table tr`;
                }
                self.repeater.$element.find(selector).each(function eachSelector (selectorIndex) {
                    selected.rows.push(selectorIndex + 1);
                });

                self.getActionItems(selected, e);
            }
        });
    },

    getActionItems : function listGetActionItems (selected, e) {
        var selectedObj = [];
        var actionObj = $.grep(this.options.actions.items, function matchedActions (actions) {
            return actions.name === selected.actionName;
        })[0];
        for (var i = 0, selectedRowsL = selected.rows.length; i < selectedRowsL; i++) {
            var clickedRow = this.repeater.$canvas.find(`.${this.options.tableWrapperClass} > table tbody tr:nth-child(` + selected.rows[i] + ')');
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
    },

    sizeActionsTable : function listSizeActionsTable () {
        var $actionsTable = this.repeater.$element.find(`.${this.options.viewClass} table.table-actions`);
        var $actionsTableHeader = $actionsTable.find('thead tr th');
        var $table = this.repeater.$element.find(`.${this.options.tableWrapperClass} > table`);

        $actionsTableHeader.outerHeight($table.find('thead tr th').outerHeight());
        $actionsTableHeader.find(`.${this.options.headingClass}`).outerHeight($actionsTableHeader.outerHeight());
        $actionsTable.find('tbody tr td:first-child').each(function eachFirstChild (i) {
            $(this).outerHeight($table.find('tbody tr:eq(' + i + ') td').outerHeight());
        });
    },

    sizeFrozenColumns : function listSizeFrozenColumns () {
        var $table = this.repeater.$element.find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table`);

        this.repeater.$element.find(`.${this.options.viewClass} table.table-frozen tr`).each(function eachTR (i) {
            $(this).height($table.find('tr:eq(' + i + ')').height());
        });

        var columnWidth = $table.find('td:eq(0)').outerWidth();
        this.repeater.$element.find('.frozen-column-wrapper, .frozen-thead-wrapper').width(columnWidth);
    },

    frozenOptionsInitialize : function listFrozenOptionsInitialize () {
        var $checkboxes = this.repeater.$element.find('.frozen-column-wrapper .checkbox-inline');
        var $headerCheckbox = this.repeater.$element.find('.header-checkbox .checkbox-custom');
        var $everyTable = this.repeater.$element.find(`.${this.options.viewClass} table`);
        var self = this;

        // Make sure if row is hovered that it is shown in frozen column as well
        this.repeater.$element.find('tr.selectable').on('mouseover mouseleave', function onMouseEvents (e) {
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
        var $rowCheckboxes = this.repeater.$element.find('.table-frozen tbody .checkbox-inline');
        var $checkAll = this.repeater.$element.find('.frozen-thead-wrapper thead .checkbox-inline input');
        $rowCheckboxes.on('change', function onChangeRowCheckboxes (e) {
            e.preventDefault();

            if (!self.revertingCheckbox) {
                if (self.isDisabled) {
                    revertCheckbox($(e.currentTarget));
                } else {
                    var row = $(this).attr('data-row');
                    row = parseInt(row, 10) + 1;
                    self.repeater.$element.find(`.${this.options.tableWrapperClass} > table tbody tr:nth-child(` + row + ')').click();

                    var numSelected = self.repeater.$element.find('.table-frozen tbody .checkbox-inline.checked').length;
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
            if (!self.revertingCheckbox) {
                if (self.isDisabled) {
                    revertCheckbox($(e.currentTarget));
                } else if ($(this).is(':checked')) {
                    self.repeater.$element.find(`.${this.options.tableWrapperClass} > table tbody tr:not(.selected)`).click();
                    self.repeater.$element.trigger('selected.lark.repeaterList', $checkboxes);
                } else {
                    self.repeater.$element.find(`.${this.options.tableWrapperClass} > table tbody tr.selected`).click();
                    self.repeater.$element.trigger('deselected.lark.repeaterList', $checkboxes);
                }
            }
        });

        function revertCheckbox ($checkbox) {
            self.revertingCheckbox = true;
            $checkbox.checkbox('toggle');
            delete self.revertingCheckbox;
        }
    },

    cleared: function cleared () {
        if (this.options.columnSyncing) {
            this.sizeHeadings();
        }
    },
    dataOptions: function dataOptions (options) {
        if (this.sortDirection) {
            options.sortDirection = this.sortDirection;
        }
        if (this.sortProperty) {
            options.sortProperty = this.sortProperty;
        }
        return options;
    },
    enabled: function enabled (helpers) {
        if (this.options.actions) {
            if (!helpers.status) {
                this.repeater.$canvas.find('.repeater-actions-button').attr('disabled', 'disabled');
            } else {
                this.repeater.$canvas.find('.repeater-actions-button').removeAttr('disabled');
                toggleActionsHeaderButton.call(this);
            }
        }
    },
    initialize: function initialize (helpers, callback) {
        this.sortDirection = null;
        this.sortProperty = null;
        this.specialBrowserClass = specialBrowserClass();
        this.actions_width = (this.options.actions.width !== undefined) ? this.options.actions.width : 37;
        this.noItems = false;
        callback();
    },
    resize: function resize () {
        sizeColumns.call(this, this.repeater.$element.find(`.${this.options.tableWrapperClass} > table thead tr`));
        if (this.options.actions) {
            this.sizeActionsTable();
        }
        if (this.options.frozenColumns || this.options.selectable === 'multi') {
            this.sizeFrozenColumns();
        }
        if (this.options.columnSyncing) {
            this.sizeHeadings();
        }
    },
    selected: function selected () {
        var infScroll = this.options.infiniteScroll;
        var opts;

        this.firstRender = true;
        this.repeater.$loader.addClass('noHeader');

        if (infScroll) {
            opts = (typeof infScroll === 'object') ? infScroll : {};
            this.repeater.infiniteScrolling(true, opts);
        }
    },
    before: function before (helpers) {
        var $listContainer = helpers.container.find(`.${this.options.viewClass}`);
        var self = this;
        var $table;

        // this is a patch, it was pulled out of `renderThead`
        if (helpers.data.count > 0) {
            this.noItems = false;
        } else {
            this.noItems = true;
        }

        if ($listContainer.length < 1) {
            $listContainer = $(`<div class="${this.options.viewClass} ` + this.specialBrowserClass + `" data-preserve="shallow"><div class="${this.options.tableWrapperClass}" data-infinite="true" data-preserve="shallow"><table aria-readonly="true" class="table" data-preserve="shallow" role="grid"></table></div></div>`);
            $listContainer.find(`.${this.options.tableWrapperClass}`).on('scroll.lark.repeaterList', function onScrollRepeaterList () {
                if (self.options.columnSyncing) {
                    self.positionHeadings();
                }
            });
            if (self.options.frozenColumns || self.options.actions || self.options.selectable === 'multi') {
                helpers.container.on('scroll.lark.repeaterList', function onScrollRepeaterList () {
                    self.positionColumns();
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

        if ((this.options.frozenColumns || this.options.selectable === 'multi') && !this.noItems) {
            this.setFrozenColumns();
        }

        if (this.options.actions && !this.noItems) {
            this.createItemActions();
            this.sizeActionsTable();
        }

        if ((this.options.frozenColumns || this.options.actions || this.options.selectable === 'multi') && !this.noItems) {
            this.positionColumns();
            this.frozenOptionsInitialize();
        }

        if (this.options.columnSyncing) {
            this.sizeHeadings();
            this.positionHeadings();
        }

        $sorted = this.repeater.$canvas.find(`.${this.options.tableWrapperClass} > table .${this.options.headingClass}.sorted`);
        if ($sorted.length > 0) {
            this.highlightColumn($sorted.data('fu_item_index'));
        }

        return false;
    }


  });



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
        if (this.options.actions !== false && property === '@_ACTIONS_@') {
            content = `<div class="${this.options.actionsPlaceHolderClass}" style="width: ` + this.actions_width  + 'px"></div>';
        }

        content = (content !== undefined) ? content : '';

        $col.addClass(((className !== undefined) ? className : '')).append(content);
        if (width !== undefined) {
            $col.outerWidth(width);
        }

        $row.append($col);

        if (this.options.selectable === 'multi' && columns[columnIndex].property === '@_CHECKBOX_@') {
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
        var $div = $(`<div class="${this.options.headingClass}"><span class="glyphicon rlc"></span></div>`);
        var checkAllID = (this.repeater.$element.attr('id') + '_' || '') + 'checkall';

        var checkBoxMarkup = `<div class="${this.options.headingClass} header-checkbox">` +
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

        if (this.options.actions && columns[index].property === '@_ACTIONS_@') {
            var width = this.actions_width;
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
            $div.on('click.lark.repeaterList', function onClickRepeaterList () {
                if (!self.isDisabled) {
                    self.sortProperty = (typeof sortable === 'string') ? sortable : columns[index].property;
                    if ($div.hasClass('sorted')) {
                        if ($span.hasClass(chevUp)) {
                            $spans.removeClass(chevUp).addClass(chevDown);
                            self.sortDirection = 'desc';
                        } else if (!self.options.sortClearing) {
                            $spans.removeClass(chevDown).addClass(chevUp);
                            self.sortDirection = 'asc';
                        } else {
                            $both.removeClass('sorted');
                            $spans.removeClass(chevDown);
                            self.sortDirection = null;
                            self.sortProperty = null;
                        }
                    } else {
                        $tr.find(`th, .${this.options.headingClass}`).removeClass('sorted');
                        $spans.removeClass(chevDown).addClass(chevUp);
                        self.sortDirection = 'asc';
                        $both.addClass('sorted');
                    }

                    self.repeater.render({
                        clearInfinite: true,
                        pageIncrement: null
                    });
                }
            });
        }

        if (columns[index].sortDirection === 'asc' || columns[index].sortDirection === 'desc') {
            $tr.find(`th, .${this.options.headingClass}`).removeClass('sorted');
            $both.addClass('sortable sorted');
            if (columns[index].sortDirection === 'asc') {
                $spans.addClass(chevUp);
                this.sortDirection = 'asc';
            } else {
                $spans.addClass(chevDown);
                this.sortDirection = 'desc';
            }

            this.sortProperty = (typeof sortable === 'string') ? sortable : columns[index].property;
        }

        $tr.append($header);
    };

    var onClickRowRepeaterList = function onClickRowRepeaterList (repeater) {
        var isMulti = repeater.options.selectable === 'multi';
        var isActions = repeater.options.actions;
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
                    $item.find(`.${this.options.checkClass}`).remove();
                }

                $repeater.trigger('deselected.lark.repeaterList', $item);
            } else {
                if (!isMulti) {
                    repeater.$canvas.find(`.${this.options.checkClass}`).remove();
                    repeater.$canvas.find(`.${this.options.viewClass} tbody tr.selected`).each(function deslectRow () {
                        $(this).removeClass('selected');
                        $repeater.trigger('deselected.lark.repeaterList', $(this));
                    });
                    $item.find('td:first').prepend(`<div class="${this.options.checkClass}"><span class="glyphicon glyphicon-ok"></span></div>`);
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
                $repeater.trigger('selected.lark.repeaterList', $item);
            }

            toggleActionsHeaderButton.call(repeater);
        }
    };

    var renderRow = function renderRow ($tbody, rows, index) {
        var $row = $('<tr></tr>');

        if (this.options.selectable) {
            $row.data('item_data', rows[index]);

            if (this.options.selectable !== 'action') {
                $row.addClass('selectable');
                $row.attr('tabindex', 0);   // allow items to be tabbed to / focused on

                var repeater = this;
                $row.on('click.lark.repeaterList', function callOnClickRowRepeaterList() {
                    onClickRowRepeaterList.call(this, repeater);
                });

                // allow selection via enter key
                $row.keyup(function onRowKeyup (e) {
                    if (e.keyCode === 13) {
                        // triggering a standard click event to be caught by the row click handler above
                        $row.trigger('click.lark.repeaterList');
                    }
                });
            }
        }

        if (this.options.actions && !this.options.selectable) {
            $row.data('item_data', rows[index]);
        }

        var columns = [];
        for (var i = 0, length = this.columns.length; i < length; i++) {
            columns.push(renderColumn.call(this, $row, rows, index, this.columns, i));
        }

        $tbody.append($row);

        if (this.options.columnRendered) {
            for (var columnIndex = 0, colLength = columns.length; columnIndex < colLength; columnIndex++) {
                if (!(this.columns[columnIndex].property === '@_CHECKBOX_@' || this.columns[columnIndex].property === '@_ACTIONS_@')) {
                    this.options.columnRendered({
                        container: $row,
                        columnAttr: this.columns[columnIndex].property,
                        item: columns[columnIndex],
                        rowData: rows[index]
                    }, function noop () {});
                }
            }
        }

        if (this.options.rowRendered) {
            this.options.rowRendered({
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
            $empty = $('<tr class="empty text-danger"><td colspan="' + this.columns.length + '"></td></tr>');
            $empty.find('td').append(data.error);
            $tbody.append($empty);
        } else if (data.items && data.items.length < 1) {
            $empty = $('<tr class="empty"><td colspan="' + this.columns.length + '"></td></tr>');
            $empty.find('td').append(this.options.noItemsHTML);
            $tbody.append($empty);
        }
    };

    var renderThead = function renderThead ($table, data) {
        var columns = data.columns || [];
        var $thead = $table.find('thead');
        var i;
        var length;
        var $tr;

        if (this.firstRender || areDifferentColumns(this.columns, columns) || $thead.length === 0) {
            $thead.remove();

            // noItems is set in `before` method

            if (this.options.selectable === 'multi' && !this.noItems) {
                var checkboxColumn = {
                    label: 'c',
                    property: '@_CHECKBOX_@',
                    sortable: false
                };
                columns.splice(0, 0, checkboxColumn);
            }

            this.columns = columns;
            this.firstRender = false;
            this.repeater.$loader.removeClass('noHeader');

            // keep action column header even when empty, you'll need it later....
            if (this.options.actions) {
                var actionsColumn = {
                    label: this.options.actions.label || '<span class="actions-hidden">a</span>',
                    property: '@_ACTIONS_@',
                    sortable: false,
                    width: this.actions_width
                };
                columns.push(actionsColumn);
            }


            $thead = $('<thead data-preserve="deep"><tr></tr></thead>');
            $tr = $thead.find('tr');
            for (i = 0, length = columns.length; i < length; i++) {
                renderHeader.call(this, $tr, columns, i);
            }
            $table.prepend($thead);

            if (this.options.selectable === 'multi' && !this.noItems) {
                // after checkbox column is created need to get width of checkbox column from
                // its css class
                var checkboxWidth = this.repeater.$element.find(`.${this.options.tableWrapperClass} .header-checkbox`).outerWidth();
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

        if (this.options.columnSizing) {
            i = 0;
            widthTaken = 0;
            $tr.find('th').each(function eachTH () {
                var $th = $(this);
                var width;
                if (self.columns[i].width !== undefined) {
                    width = self.columns[i].width;
                    $th.outerWidth(width);
                    widthTaken += $th.outerWidth();
                    self.columns[i]._auto_width = width;
                } else {
                    var outerWidth = $th.find(`.${self.options.headingClass}`).outerWidth();
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
                var canvasWidth = this.repeater.$canvas.find(`.${this.options.tableWrapperClass}`).outerWidth();
                newWidth = Math.floor((canvasWidth - widthTaken) / length);
                for (i = 0; i < length; i++) {
                    if (automaticallyGeneratedWidths[i].minWidth > newWidth) {
                        newWidth = automaticallyGeneratedWidths[i].minWidth;
                    }
                    automaticallyGeneratedWidths[i].col.outerWidth(newWidth);
                    this.columns[automaticallyGeneratedWidths[i].index]._auto_width = newWidth;
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
        var selectedSelector = `.${this.options.tableWrapperClass} > table .selected`;
        var $actionsColumn = this.repeater.$element.find('.table-actions');
        var $selected;

        if (this.options.selectable === 'action') {
            selectedSelector = `.${this.options.tableWrapperClass} > table tr`;
        }

        $selected = this.repeater.$canvas.find( selectedSelector );

        if ($selected.length > 0) {
            $actionsColumn.find('thead .btn').removeAttr('disabled');
        } else {
            $actionsColumn.find('thead .btn').attr('disabled', 'disabled');
        }
    };


     views["table"] = {
        name : "table",
        ctor : TableView
    }; 

    return TableView;

});
define('skylark-domx-plugins-repeater/views/TileView',[
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-eventer",
    "skylark-domx-noder",
    "skylark-domx-geom",
    "skylark-domx-query",
    "../views",   
    "./ViewBase"
], function(langx, browser, eventer, noder, geom, $, views, ViewBase) {


  var TileView = ViewBase.inherit({
    klassName : "TileView",

    options: {
        alignment: 'left',
        infiniteScroll: false,
        itemRendered: null,
        noItemsHTML: 'no items found',
        selectable: false,
        viewClass: "repeater-tile",
        template : '<div class="clearfix repeater-tile" data-container="true" data-infinite="true" data-preserve="shallow"></div>',
        item : {
            template: '<div class="thumbnail repeater-thumbnail"><img height="75" src="{{src}}" width="65"><span>{{name}}</span></div>'
        },
        renderItem : null
    },

    //ADDITIONAL METHODS
    clearSelectedItems : function() {
        this.repeater.$canvas.find(`.${this.options.viewClass} .selectable.selected`).removeClass('selected');
    },

    getSelectedItems : function() {
        var selected = [];
        this.repeater.$canvas.find(`.${this.options.viewClass} .selectable.selected`).each(function() {
            selected.push($(this));
        });
        return selected;
    },

    setSelectedItems : function(items, force) {
        var selectable = this.options.selectable;
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

        if (!langx.isArray(items)) {
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
                this.repeater.$canvas.find(`.${this.options.viewClass} .selectable`).each(compareItemIndex);
                if ($item.length > 0) {
                    selectItem($item, items[i].selected);
                }

            } else if (items[i].selector) {
                this.repeater.$canvas.find(`.${this.options.viewClass} .selectable`).each(compareItemSelector);
            }
        }
    },

    selected: function() {
        var infScroll = this.options.infiniteScroll;
        var opts;
        if (infScroll) {
            opts = (typeof infScroll === 'object') ? infScroll : {};
            this.infiniteScrolling(true, opts);
        }
    },
    before: function(helpers) {
        var alignment = this.options.alignment;
        var $cont = this.repeater.$canvas.find(`.${this.options.viewClass}`);
        var data = helpers.data;
        var response = {};
        var $empty, validAlignments;

        if ($cont.length < 1) {
            $cont = $(this.options.template);
            $cont.addClass(this.options.viewClass);
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
            $empty.append(this.options.noItemsHTML);
            $cont.append($empty);
        } else {
            $cont.find('.empty:first').remove();
        }

        return response;
    },
    renderItem: function(helpers) {
        if (this.options.renderItem) {
            return this.options.renderItem.call(this,helpers);
        }

        var selectable = this.options.selectable;

        var selected = 'selected';
        var self = this;
        var $thumbnail = this._create$Item(this.options.item.template,helpers.subset[helpers.index]);

        $thumbnail.data('item_data', helpers.data.items[helpers.index]);

        if (selectable) {
            $thumbnail.addClass('selectable');
            $thumbnail.on('click', function() {
                if (self.isDisabled) return;

                if (!$thumbnail.hasClass(selected)) {
                    if (selectable !== 'multi') {
                        self.repeater.$canvas.find(`.${this.options.viewClass} .selectable.selected`).each(function() {
                            var $itm = $(this);
                            $itm.removeClass(selected);
                            self.repeater.$element.trigger('deselected.lark.repeaterThumbnail', $itm);
                        });
                    }

                    $thumbnail.addClass(selected);
                    self.repeater.$element.trigger('selected.lark.repeaterThumbnail', $thumbnail);
                } else {
                    $thumbnail.removeClass(selected);
                    self.repeater.$element.trigger('deselected.lark.repeaterThumbnail', $thumbnail);
                }
            });
        }

        helpers.container.append($thumbnail);
        if (this.thumbnail_injectSpacers) {
            $thumbnail.after('<span class="spacer">&nbsp;</span>');
        }

        if (this.options.itemRendered) {
            this.options.itemRendered({
                container: helpers.container,
                item: $thumbnail,
                itemData: helpers.subset[helpers.index]
            }, function() {});
        }

        return false;
    }
    
  });


    views["tile"] = {
        name : "tile",
        ctor : TileView
    };

    return TileView;
    
});
define('skylark-domx-plugins-repeater/main',[
    "./Repeater",
    "./views",
    "./views/ViewBase",
    "./views/LinearView",
    "./views/SliderView",
    "./views/TableView",
    "./views/TileView"
], function(Repeater) {
    return Repeater;
});
define('skylark-domx-plugins-repeater', ['skylark-domx-plugins-repeater/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-domx-plugins-repeater.js.map
