define([
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
        template: '<div class="thumbnail repeater-thumbnail"><img height="75" src="{{src}}" width="65"><span>{{name}}</span></div>'
    },

    //ADDITIONAL METHODS
    clearSelectedItems : function() {
        this.repeater.$canvas.find('.repeater-tile .selectable.selected').removeClass('selected');
    },

    getSelectedItems : function() {
        var selected = [];
        this.repeater.$canvas.find('.repeater-tile .selectable.selected').each(function() {
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
                this.repeater.$canvas.find('.repeater-tile .selectable').each(compareItemIndex);
                if ($item.length > 0) {
                    selectItem($item, items[i].selected);
                }

            } else if (items[i].selector) {
                this.repeater.$canvas.find('.repeater-tile .selectable').each(compareItemSelector);
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
        var $cont = this.repeater.$canvas.find('.repeater-tile');
        var data = helpers.data;
        var response = {};
        var $empty, validAlignments;

        if ($cont.length < 1) {
            $cont = $('<div class="clearfix repeater-tile" data-container="true" data-infinite="true" data-preserve="shallow"></div>');
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
        var selectable = this.options.selectable;
        var selected = 'selected';
        var self = this;
        var $thumbnail = $(fillTemplate(helpers.subset[helpers.index], this.options.template));

        $thumbnail.data('item_data', helpers.data.items[helpers.index]);

        if (selectable) {
            $thumbnail.addClass('selectable');
            $thumbnail.on('click', function() {
                if (self.isDisabled) return;

                if (!$thumbnail.hasClass(selected)) {
                    if (selectable !== 'multi') {
                        self.repeater.$canvas.find('.repeater-tile .selectable.selected').each(function() {
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

    views["tile"] = {
        name : "tile",
        ctor : TileView
    };

    return TileView;
    
});