/**
 * skylark-widgets-repeater - The skylark repeater widget
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-repeater/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-browser","skylark-domx-eventer","skylark-domx-noder","skylark-domx-geom","skylark-domx-query","../views","./ViewBase"],function(e,t,a,i,s,n,r,l){var c=l.inherit({klassName:"LinearView",options:{alignment:"left",infiniteScroll:!1,itemRendered:null,noItemsHTML:"no items found",selectable:!1,template:'<ul class="clearfix repeater-linear" data-container="true" data-infinite="true" data-preserve="shallow"></ul>',item:{template:'<li class="repeater-item"><img  src="{{ThumbnailImage}}" class="thumb"/><h4 class="title">{{name}}</h4></div>'}},clearSelectedItems:function(){this.repeater.$canvas.find(".repeater-linear .selectable.selected").removeClass("selected")},getSelectedItems:function(){var e=[];return this.repeater.$canvas.find(".repeater-linear .selectable.selected").each(function(){e.push(n(this))}),e},setSelectedItems:function(t,a){var i,s,r,l,c=this.options.selectable,o=this;function d(){if(l===t[i].index)return s=n(this),!1;l++}function m(){(s=n(this)).is(t[i].selector)&&h(s,t[i].selected)}function h(e,t){(t=void 0===t||t)?(a||"multi"===c||o.thumbnail_clearSelectedItems(),e.addClass("selected")):e.removeClass("selected")}for(e.isArray(t)||(t=[t]),r=!0===a||"multi"===c?t.length:c&&t.length>0?1:0,i=0;i<r;i++)void 0!==t[i].index?(s=n(),l=0,this.repeater.$canvas.find(".repeater-linear .selectable").each(d),s.length>0&&h(s,t[i].selected)):t[i].selector&&this.repeater.$canvas.find(".repeater-linear .selectable").each(m)},selected:function(){var e,t=this.options.infiniteScroll;t&&(e="object"==typeof t?t:{},this.infiniteScrolling(!0,e))},before:function(e){this.options.alignment;var t=this.repeater.$canvas.find(".repeater-linear"),a=(e.data,{});return t.length<1?(t=n(this.options.template),a.item=t):a.action="none",a},renderItem:function(e){var t=this.options.selectable,a=this,i=this._create$Item(this.options.item.template,e.subset[e.index]);return i.data("item_data",e.data.items[e.index]),t&&(i.addClass("selectable"),i.on("click",function(){a.isDisabled||(i.hasClass("selected")?(i.removeClass("selected"),a.repeater.$element.trigger("deselected.lark.repeaterList",i)):("multi"!==t&&a.repeater.$canvas.find(".repeater-linear .selectable.selected").each(function(){var e=n(this);e.removeClass("selected"),a.repeater.$element.trigger("deselected.lark.repeaterList",e)}),i.addClass("selected"),a.repeater.$element.trigger("selected.lark.repeaterList",i)))})),e.container.append(i),this.options.itemRendered&&this.options.itemRendered({container:e.container,item:$thumbnail,itemData:e.subset[e.index]},function(){}),!1}});return r.linear={name:"linear",ctor:c},c});
//# sourceMappingURL=../sourcemaps/views/LinearView.js.map
