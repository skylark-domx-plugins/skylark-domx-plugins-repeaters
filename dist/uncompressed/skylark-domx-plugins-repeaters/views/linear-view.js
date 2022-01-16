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


  var LinearView = ViewBase.inherit({
    klassName : "LinearView",

    options: {
        alignment: 'left',
        infiniteScroll: false,
        itemRendered: null,
        noItemsHTML: 'no items found',
        selectable: false,
        viewClass: "repeater-linear",

        template : '<ul class="clearfix repeater-linear" data-container="true" data-infinite="true" data-preserve="shallow"></ul>',
        item : {
            template: '<li class="repeater-item"><img  src="{{ThumbnailImage}}" class="thumb"/><h4 class="title">{{name}}</h4></div>'
        },
    },

     _construct : function (repeater,options) {
        ViewBase.prototype._construct.call(this,repeater,options);
        

    },

    //ADDITIONAL METHODS
    clearSelectedItems : function() {
        this.$el.find('.selectable.selected').removeClass('selected');
    },

    getSelectedItems : function() {
        var selected = [];
        this.$el.find('.selectable.selected').each(function() {
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
                this.$el.find('.selectable').each(compareItemIndex);
                if ($item.length > 0) {
                    selectItem($item, items[i].selected);
                }

            } else if (items[i].selector) {
                this.$el.find('.selectable').each(compareItemSelector);
            }
        }
    },

    before: function(helpers) {
        var alignment = this.options.alignment;
        var $cont = this.$el = this.repeater.$canvas.find(`.${this.options.viewClass}`);
        var data = helpers.data;
        var response = {};
        var $empty, validAlignments;

        if ($cont.length < 1) {
            $cont = this.$el = $(this.options.template);

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
                            self.repeater.$().trigger('deselected.lark.repeaterList', $itm);
                        });
                    }

                    $item.addClass(selected);
                    self.repeater.$().trigger('selected.lark.repeaterList', $item);
                } else {
                    $item.removeClass(selected);
                    self.repeater.$().trigger('deselected.lark.repeaterList', $item);
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


    viewTypeRegistry["linear"] = {
        name : "linear",
        ctor : LinearView
    };

    return LinearView;
    
});