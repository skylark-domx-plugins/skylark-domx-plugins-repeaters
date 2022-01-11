/**
 * skylark-fuelux-repeater - The skylark repeater plugin library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-fuelux-repeater/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-noder","skylark-domx-query","../views"],function(t,e,n,i){var r=t.Evented.inherit({klassName:"ViewBase",options:{controlsClass:"skylarkui-repeater-controls",fullScreen:!1},_create$Item:function(e,i){var r,o,a,s=!1;for(;!s&&e.search("{{")>=0;)r=void 0,o=void 0,a=void 0,o=e.indexOf("{{"),r=e.indexOf("}}",o+2),o>-1&&r>-1?(a=t.trim(e.substring(o+2,r)),a=void 0!==i[a]?i[a]:"",e=e.substring(0,o)+a+e.substring(r+2)):s=!0;return n(e)},init:function(t,n){var i,r=this;this.repeater=t,this.initOptions(n),this.options.fullScreen&&e.fullScreen(this.container[0]),this.repeater.on("item.running",function(t){r.container.hasClass(r.options.controlsClass)?(i=!0,r.container.removeClass(r.options.controlsClass)):i=!1}),this.repeater.on("item.running",function(t){i&&r.container.addClass(r.options.controlsClass)})},initOptions:function(e){var n=this.constructor,i=n.cache=n.cache||{},r=i.defaults;if(!r){var o=[];do{if(o.unshift(n),n===Plugin)break;n=n.superclass}while(n);r=i.defaults={};for(var a=0;a<o.length;a++)(n=o[a]).prototype.hasOwnProperty("options")&&t.mixin(r,n.prototype.options,!0),n.hasOwnProperty("options")&&t.mixin(r,n.options,!0)}return Object.defineProperty(this,"options",{value:t.mixin({},r,e,!0)}),this.options},close:function(){e.fullScreen()===this.container[0]&&e.fullScreen(!1)},getValue:function(){return this.getSelectedItems()},cleared:function(){},selected:function(){},dataOptions:function(t){return t},enabled:function(t){},addItem:function(t,e){var i;e&&("none"!==(i=e.action?e.action:"append")&&void 0!==e.item&&(void 0!==e.container?n(e.container):t)[i](e.item))},render:function(t){if(this.before){var e=this.before(t);this.addItem(t.container,e)}var n=t.container.find('[data-container="true"]:last'),i=n.length>0?n:t.container;if(this.renderItem){var r,o=(this.repeat||"data.items").split("."),a=o[0];if("data"===a||"this"===a){r="this"===a?this:t.data;for(var s=o.slice(1),c=0;c<s.length;c++){if(void 0===r[s[c]]){r=[],console.warn("WARNING: Repeater unable to find property to iterate renderItem on.");break}r=r[s[c]]}for(var l=0;l<r.length;l++){var d=this.renderItem({container:i,data:t.data,index:l,subset:r});this.addItem(i,d)}}else console.warn('WARNING: Repeater plugin "repeat" value must start with either "data" or "this"')}if(this.after){var u=this.after(t);this.addItem(t.container,u)}}});return i.ViewBase=r});
//# sourceMappingURL=../sourcemaps/views/view-base.js.map
