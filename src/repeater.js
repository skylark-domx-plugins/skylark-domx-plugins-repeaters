define([
  "skylark-langx/skylark",
  "skylark-langx/langx",
  "skylark-domx-browser",
  "skylark-domx-eventer",
  "skylark-domx-noder",
  "skylark-domx-geom",
  "skylark-domx-velm",
  "skylark-domx-query",
  "skylark-domx-fx",
  "skylark-domx-plugins-base",
  "skylark-domx-plugins-popups/select-list",
  "skylark-domx-plugins-popups/combobox",
  "./repeaters",
  "./searchbox",
  "./view-type-registry"
],function(skylark,langx,browser,eventer,noder,geom,elmx,$,fx,plugins,SelectList,ComboBox,repeaters,Searchbox,viewTypeRegistry){

	// REPEATER CONSTRUCTOR AND PROTOTYPE

	var Repeater = plugins.Plugin.inherit({
		klassName: "Repeater",

		pluginName: "lark.repeaters.repeater",

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

			var $el = this.$();

			this.$canvas = $el.find('.repeater-canvas');
			this.$count = $el.find('.repeater-count');
			this.$end = $el.find('.repeater-end');
			this.$filters = $el.find('.repeater-filters');
			this.$loader = $el.find('.repeater-loader');
			this.$pageSize = $el.find('.repeater-itemization .selectlist');
			this.$nextBtn = $el.find('.repeater-next');
			this.$pages = $el.find('.repeater-pages');
			this.$prevBtn = $el.find('.repeater-prev');
			this.$primaryPaging = $el.find('.repeater-primaryPaging');
			this.$search = $el.find('.repeater-search').find('.search');
			this.$secondaryPaging = $el.find('.repeater-secondaryPaging');
			this.$start = $el.find('.repeater-start');
			this.$viewport = $el.find('.repeater-viewport');
			this.$views = $el.find('.repeater-views');

			$el.on('mousedown.bs.dropdown.data-api', '[data-toggle="dropdown"]',function(e) {
				$(this).plugin("lark.popups.dropdown");
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
			this.viewType = null;

			this.$filters.plugin("lark.popups.selectlist");
			this.$pageSize.plugin("lark.popups.selectlist");
			this.$primaryPaging.find('.combobox').plugin("lark.popups.combobox");
			this.$search.plugin("lark.repeaters.searchbox",{
				searchOnKeyPress: this.options.searchOnKeyPress,
				allowCancel: this.options.allowCancel
			});

			this.$filters.on('changed.lark.selectlist', function onFiltersChanged (e, value) {
				self.$().trigger('filtered', value);
				self.render({
					clearInfinite: true,
					pageIncrement: null
				});
			});
			this.$nextBtn.on('click.lark.repeater', langx.proxy(this.next, this));
			this.$pageSize.on('changed.lark.selectlist', function onPageSizeChanged (e, value) {
				self.$().trigger('pageSizeChanged', value);
				self.render({
					pageIncrement: null
				});
			});
			this.$prevBtn.on('click.lark.repeater', langx.proxy(this.previous, this));
			this.$primaryPaging.find('.combobox').on('changed.lark.combobox', function onPrimaryPagingChanged (evt, data) {
				self.pageInputChange(data.text, data);
			});
			this.$search.on('searched.lark.search cleared.lark.search', function onSearched (e, value) {
				self.$().trigger('searchChanged', value);
				self.render({
					clearInfinite: true,
					pageIncrement: null
				});
			});
			this.$search.on('canceled.lark.search', function onSearchCanceled (e, value) {
				self.$().trigger('canceled', value);
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
					self.$().trigger('resized');
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
				self.$().trigger('resized');
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
			var markup,
				$el = this.$();
			// set input value attrbute in markup
			$el.find('input').each(function eachInput () {
				$(this).attr('value', $(this).val());
			});

			// empty elements to return to original markup
			this.$canvas.empty();
			markup = this._elm.outerHTML;

			// destroy components and remove leftover
			langx.scall($el.find('.combobox').plugin("lark.popups.combobox"),"destroy");
			langx.scall($el.find('.selectlist').plugin("lark.popups.selectlist"),"destroy");
			langx.scall($el.find('.search').plugin("lark.repeaters.searchbox"),"destroy");
			if (this.infiniteScrollingEnabled) {
				$(this.infiniteScrollingCont).infinitescroll('destroy');
			}

			$el.remove();

			// any external events
			$(window).off('resize.lark.repeater.' + this.stamp);

			return markup;
		},

		disable: function disable () {
			langx.scall(this.$search.plugin("lark.repeaters.searchbox"),"disable");
			langx.scall(this.$filters.plugin("lark.popups.selectlist"),"disable");
			this.$views.find('label, input').addClass('disabled').attr('disabled', 'disabled');
			langx.scall(this.$pageSize.plugin("lark.popups.selectlist"),"disable");
			langx.scall(this.$primaryPaging.find('.combobox').plugin("lark.popups.combobox"),"disable");
			this.$secondaryPaging.attr('disabled', 'disabled');
			this.$prevBtn.attr('disabled', 'disabled');
			this.$nextBtn.attr('disabled', 'disabled');

			if (this._view) {
				this._view.enabled({
					status: false
				});
			}

			this.isDisabled = true;
			this.$().addClass('disabled');
			this.$().trigger('disabled');
		},

		enable: function enable () {
			langx.scall(this.$search.plugin("lark.repeaters.searchbox"),"enable");
			langx.scall(this.$filters.plugin("lark.popups.selectlist"),"enable")
			this.$views.find('label, input').removeClass('disabled').removeAttr('disabled');
			langx.scall(this.$pageSize.plugin("lark.popups.selectlist"),"enable")
			langx.scall(this.$primaryPaging.find('.combobox').plugin("lark.popups.combobox"),"enable");
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
				langx.scall(this.$primaryPaging.plugin("lark.popups.combobox"),"disable");
			}

			// if there are no items
			if (parseInt(this.$count.html(), 10) !== 0) {
				langx.scall(this.$pageSize.plugin("lark.popups.selectlist"),"enable");
			} else {
				langx.scall(this.$pageSize.plugin("lark.popups.selectlist"),"disable");
			}

			if (this._view) {
				this._view.enabled({
					status: true
				});
			}

			this.isDisabled = false;
			this.$().removeClass('disabled');
			this.$().trigger('enabled');
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
				returnOptions.filter = this.$filters.plugin("lark.popups.selectlist").selectedItem();
			}

			if (!this.infiniteScrollingEnabled) {
				returnOptions.pageSize = 25;

				if (this.$pageSize.length > 0) {
					returnOptions.pageSize = parseInt(this.$pageSize.plugin("lark.popups.selectlist").selectedItem().value, 10);
				}
			}

			var searchValue = this.$search && this.$search.find('input') && this.$search.find('input').val();
			if (searchValue !== '') {
				returnOptions.search = searchValue;
			}


			if (this._view) {
				returnOptions = this._view.dataOptions(returnOptions);
			}


			returnOptions = langx.mixin(returnOptions, dataSourceOptions);

			return returnOptions;
		},

		infiniteScrolling: function infiniteScrolling (enable, opts) {
			var footer = this.$().find('.repeater-footer');
			var viewport = this.$().find('.repeater-viewport');
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

			var views = this._views = [];
			var viewTypes = this.options.addons.views;
			if (langx.isArray(viewTypes)) {
				for (var i = 0; i< viewTypes.length; i++) {
					var setting = viewTypeRegistry[viewTypes[i]];
					if (!setting) {
						throw new Error("The view type " + viewTypes[i] + " is not defined!");
					} 
					var ctor = setting.ctor;
					this._views.push(this._views[viewTypes[i]] = new ctor(this));

				}				
			} else if (langx.isPlainObject(viewTypes)) {
				for (var name in viewTypes) {
					var setting = viewTypeRegistry[name];
					if (!setting) {
						throw new Error("The view type " + viewTypes[i] + " is not defined!");
					} 
					var ctor = setting.ctor;
					this._views.push(this._views[name] = new ctor(this,viewTypes[name]));

				}
			}

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
			this.$().trigger('nextClicked');
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
				this.$().trigger('pageChanged', [value, dataFromCombobox]);
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
			this.$().trigger('previousClicked');
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

				this.$().attr('data-currentview', this.currentView);
				this.$().attr('data-viewtype', this.viewType);
				viewChanged = true;
				options.viewChanged = viewChanged;

				this.$().trigger('viewChanged', this.currentView);

				if (this.infiniteScrollingEnabled) {
					this.infiniteScrolling(false);
				}

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
			var self = this;
			var viewTypeObj = this._view;
			this.options.dataSource(
				dataOptions,
				// this serves as a bridge function to pass all required data through to the actual function
				// that does the rendering for us.
				function callDoRender (dataSourceReturnedData) {
					self.doRender({
						data: dataSourceReturnedData,
						dataOptions: dataOptions,
						options: options,
						viewChanged: viewChanged,
						viewTypeObj: viewTypeObj
					});
				}
			);
		},

		resize: function resize () {
			var staticHeight = (this.options.staticHeight === -1) ? this.$().attr('data-staticheight') : this.options.staticHeight;
			var viewTypeObj = {};
			var height;
			var viewportMargins;
			var scrubbedElements = [];
			var previousProperties = [];
			//var $hiddenElements = this.$().parentsUntil(':visible').addBack(); // del addBack() not supported by skyalrk
			var $hiddenElements = this.$().parentsUntil(':visible');
			var currentHiddenElement;
			var currentElementIndex = 0;

			// Set parents to 'display:block' until repeater is visible again
			while (currentElementIndex < $hiddenElements.length && this.$().is(':hidden')) {
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

				var staticHeightValue = (staticHeight === 'true' || staticHeight === true) ? this.$().height() : parseInt(staticHeight, 10);
				var headerHeight = this.$().find('.repeater-header').outerHeight();
				var footerHeight = this.$().find('.repeater-footer').outerHeight();
				var bottomMargin = (viewportMargins.bottom === 'auto') ? 0 : parseInt(viewportMargins.bottom, 10);
				var topMargin = (viewportMargins.top === 'auto') ? 0 : parseInt(viewportMargins.top, 10);

				height = staticHeightValue - headerHeight - footerHeight - bottomMargin - topMargin;
				this.$viewport.outerHeight(height);
			} else {
				this.$canvas.removeClass('scrolling');
			}


			if (this._view) {
				this._view.resize({
					height: this.$().outerHeight(),
					width: this.$().outerWidth()
				});
			}

			scrubbedElements.forEach(function (element, i) {
				element.style['display'] = previousProperties[i];
			});
		},

		// e.g. "Rows" or "Thumbnails"
		renderItems: function renderItems (viewTypeObj, data, callback) {
			viewTypeObj.render({
				container: this.$canvas,
				data: data
			}, callback);
			callback(data);
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
		},

		// This does the actual rendering of the repeater
		doRender : function doRender (state) {
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
					self.afterRender(state);
				}
			);
		},

		callNextInit : function callNextInit (currentViewType, viewTypes, callback) {
			var nextViewType = currentViewType + 1;
			if (nextViewType < viewTypes.length) {
				this.initViewType(nextViewType, viewTypes, callback);
			} else {
				callback();
			}
		},

		initViewType : function initViewType (currentViewtype, viewTypes, callback) {
			var self = this;
			if (viewTypes[currentViewtype].initialize) {
				viewTypes[currentViewtype].initialize.call(this, {}, function afterInitialize () {
					self.callNextInit(currentViewtype, viewTypes, callback);
				});
			} else {
				self.callNextInit(currentViewtype, viewTypes, callback);
			}
		},

		// Does all of our cleanup post-render
		afterRender : function afterRender (state) {
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

			this.$search.trigger('rendered', {
				data: data,
				options: state.dataOptions,
				renderOptions: state.options
			});
			this.$().trigger('rendered', {
				data: data,
				options: state.dataOptions,
				renderOptions: state.options
			});

			// for maintaining support of 'loaded' event
			this.$().trigger('loaded', state.dataOptions);
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

	Repeater.addons = {};

    plugins.register(Repeater);


	return repeaters.Repeater = Repeater;

});
