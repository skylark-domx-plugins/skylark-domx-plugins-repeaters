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
  "skylark-domx-plugins",
  "skylark-domx-popups/SelectList",
  "skylark-domx-popups/ComboBox",
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
			this.$element.find('.combobox').plugin("lark.combobox").destroy();
			this.$element.find('.selectlist').plugin("domx.selectlist").destroy();
			this.$element.find('.search').plugin("lark.searchbox").destroy();
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

			this.$search.plugin("lark.searchbox").disable();
			this.$filters.plugin("domx.selectlist").disable();
			this.$views.find('label, input').addClass('disabled').attr('disabled', 'disabled');
			this.$pageSize.plugin("domx.selectlist").disable();
			this.$primaryPaging.find('.combobox').plugin("domx.combobox").disable();
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

			this.$search.plugin("lark.searchbox").enable();
			this.$filters.plugin("domx.selectlist").enable()
			this.$views.find('label, input').removeClass('disabled').removeAttr('disabled');
			this.$pageSize.plugin("domx.selectlist").enable()
			this.$primaryPaging.find('.combobox').plugin("domx.combobox").enable();
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
				this.$primaryPaging.plugin("domx.combobox").disable();
			}

			// if there are no items
			if (parseInt(this.$count.html(), 10) !== 0) {
				this.$pageSize.plugin("domx.selectlist").enable();
			} else {
				this.$pageSize.plugin("domx.selectlist").disable();
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
			for (var i = 0; i< viewTypes.length; i++) {
				var setting = this.constructor.addons.views[viewTypes[i]];
				if (!setting) {
					throw new Error("The view type " + viewTypes[i] + " is not defined!");
				} 
				var ctor = setting.ctor;
				this._views.push(this._views[viewTypes[i]] = new ctor(this));

			}

			if (views.length > 0) {
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
