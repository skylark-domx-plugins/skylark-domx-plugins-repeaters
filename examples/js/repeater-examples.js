/*!
 * JavaScript for Fuel UX's docs - Repeater Examples
 * Copyright 2011-2014 ExactTarget, Inc.
 * Licensed under the Creative Commons Attribution 3.0 Unported License. For
 * details, see http://creativecommons.org/licenses/by/3.0/.
 */

define([
	"skylark-langx/langx",
	"skylark-utils-dom",
	"skylark-widgets-repeater",
	"./data/pokemon",
	"./data/colors"
],function (langx,sutils,Repeater,pokemon,colors) {
	var $ = sutils.query;

	var columns = [
		{
			label: 'Name',
			property: 'name',
			sortable: true
		},
		{
			label: 'Id',
			property: 'id',
			sortable: true
		},
		{
			label: 'Type',
			property: 'type',
			sortable: true
		},
		{
			label: 'Height (in)',
			property: 'height',
			sortable: true
		},
		{
			label: 'Weight (lbs)',
			property: 'weight',
			sortable: true
		},
		{
			label: 'Abilities',
			property: 'abilities',
			sortable: true
		},
		{
			label: 'Weakness',
			property: 'weakness',
			sortable: true
		}
	];
	var delays = ['300', '600', '900', '1200'];

	var dataFilter = function dataFilter(options) {
		var items = langx.clone(pokemon);

		var filterValue = new RegExp(options.filter, 'i');//Explicitly make a regex object instead of just using String.search() to avoid confusion with FuelUX search() and options.search
		if (!filterValue.test('all')) {
			items = langx.filter(items, function (item) {
				var isFilterMatch = filterValue.test(item.type);
				return isFilterMatch;
			});
		}

		var searchTerm;
		if (options.search) {
			searchTerm = new RegExp(options.search, 'i');//Explicitly make a regex object instead of just using String.search() to avoid confusion with FuelUX search() and options.search
			items = langx.filter(items, function (item) {
				//collapse all item property values down to a single string to make matching on it easier to manage
				var itemText = langx.reduce(langx.values(langx.omit(item, 'ThumbnailAltText', 'ThumbnailImage')), function (finalText, currentText) {
					return finalText + " " + currentText;
				});

				var isSearchMatch = searchTerm.test(itemText);
				return isSearchMatch;
			});
		}

		if (options.sortProperty) {
			items = items.sort(function (item) {
				if (options.sortProperty === 'id' || options.sortProperty === 'height' || options.sortProperty === 'weight') {
					return parseFloat(item[options.sortProperty]);
				} else {
					return item[options.sortProperty];
				}
			});
			if (options.sortDirection === 'desc') {
				items.reverse();
			}

		}

		return items;
	};

	var dataSource = function dataSource(options, callback) {
		var items = dataFilter(options);
		var responseData = {
			count: items.length,
			items: [],
			page: options.pageIndex,
			pages: Math.ceil(items.length / (options.pageSize || 50))
		};
		var firstItem, lastItem;

		firstItem = options.pageIndex * (options.pageSize || 50);
		lastItem = firstItem + (options.pageSize || 50);
		lastItem = (lastItem <= responseData.count) ? lastItem : responseData.count;
		responseData.start = firstItem + 1;
		responseData.end = lastItem;

		if (options.view === 'tile') {
			for (var i = firstItem; i < lastItem; i++) {
				responseData.items.push({
					color: colors[items[i].type.split(', ')[0]],
					name: items[i].name,
					src: items[i].ThumbnailImage
				});
			}
		} else {//default to 'list'
			responseData.columns = columns;
			for (var i = firstItem; i < lastItem; i++) {
				responseData.items.push(items[i]);
			}

		}

		//use setTimeout to simulate server response delay. In production, you would not want to do this
		setTimeout(function () {
			callback(responseData);
		}, delays[Math.floor(Math.random() * 4)]);
	};

	// REPEATER
	$('#repeaterIllustration').plugin("lark.repeater",{
		dataSource: dataSource
	});

	$('#myRepeater').plugin("lark.repeater",{
		dataSource: dataSource
	});

	$('#myRepeaterList').plugin("lark.repeater",{
		dataSource: dataSource
	});

	$('#myRepeaterThumbnail').plugin("lark.repeater",{
		dataSource: dataSource,
		thumbnail_template: '<div class="thumbnail repeater-thumbnail" style="background: {{color}};"><img height="75" src="{{src}}" width="65"><span>{{name}}</span></div>'
	});
});
