define([
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-eventer",
    "skylark-domx-noder",
    "skylark-domx-geom",
    "skylark-domx-query",
    "../view-type-registry",   
    "./view-base"
], function(langx, browser, eventer, noder, geom, $, viewTypeRegistry, ViewBase) {

  var TileView = ViewBase.inherit({
    klassName : "TileView",

    options: {
        alignment: 'left',
        infiniteScroll: false,
        itemRendered: null,
        noItemsHTML: 'no items found',
        selectable: true,
        viewClass: "repeater-tile",
        template : '<div class="clearfix repeater-tile" data-container="true" data-infinite="true" data-preserve="shallow"></div>',
        item : {
            template: '<div class="thumbnail repeater-thumbnail"><img height="75" src="{{src}}" width="65"><span>{{name}}</span></div>'
        },
        renderItem : null
    },

    _construct : function (repeater,options) {
        ViewBase.prototype._construct.call(this,repeater,options);
    },

    //ADDITIONAL METHODS
    clearSelectedItems : function() {
        this.$el.find(`.selectable.selected`).removeClass('selected');
    },

    getSelectedItems : function() {
        var selected = [];
        this.$el.find(`.selectable.selected`).each(function() {
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
                this.$el.find(`.selectable`).each(compareItemIndex);
                if ($item.length > 0) {
                    selectItem($item, items[i].selected);
                }

            } else if (items[i].selector) {
                this.$el.find(`.selectable`).each(compareItemSelector);
            }
        }
    },

    before: function(helpers) {
        var alignment = this.options.alignment;
        var $cont =   this.$el = this.repeater.$canvas.find(`.${this.options.viewClass}`);
        var data = helpers.data;
        var response = {};
        var $empty, validAlignments;

        if ($cont.length < 1) {
            $cont = this.$el = $(this.options.template);
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
                        self.$el.find(`.selectable.selected`).each(function() {
                            var $itm = $(this);
                            $itm.removeClass(selected);
                            self.repeater.$().trigger('deselected', $itm);
                        });
                    }

                    $thumbnail.addClass(selected);
                    self.repeater.$().trigger('selected.lark.repeaterThumbnail', $thumbnail);
                } else {
                    $thumbnail.removeClass(selected);
                    self.repeater.$().trigger('deselected.lark.repeaterThumbnail', $thumbnail);
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


    viewTypeRegistry["tile"] = {
        name : "tile",
        ctor : TileView
    };

    return TileView;
    
});