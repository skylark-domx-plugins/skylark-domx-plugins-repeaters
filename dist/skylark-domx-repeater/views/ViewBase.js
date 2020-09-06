/**
 * skylark-domx-repeater - The skylark repeater plugin library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-repeater/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-noder","skylark-domx-query","../views"],function(n,t,e,i){var o=n.Evented.inherit({klassName:"ViewBase",options:{controlsClass:"skylarkui-repeater-controls",fullScreen:!1},_create$Item:function(t,i){var o,s,r,a=!1;for(;!a&&t.search("{{")>=0;)o=void 0,s=void 0,r=void 0,s=t.indexOf("{{"),o=t.indexOf("}}",s+2),s>-1&&o>-1?(r=n.trim(t.substring(s+2,o)),r=void 0!==i[r]?i[r]:"",t=t.substring(0,s)+r+t.substring(o+2)):a=!0;return e(t)},init:function(n,e){var i,o=this;this.repeater=n,this.initOptions(e),this.options.fullScreen&&t.fullScreen(this.container[0]),this.repeater.on("item.running",function(n){o.container.hasClass(o.options.controlsClass)?(i=!0,o.container.removeClass(o.options.controlsClass)):i=!1}),this.repeater.on("item.running",function(n){i&&o.container.addClass(o.options.controlsClass)})},initOptions:function(t){var e=this.constructor,i=e.cache=e.cache||{},o=i.defaults;if(!o){var s=[];do{if(s.unshift(e),e===Plugin)break;e=e.superclass}while(e);o=i.defaults={};for(var r=0;r<s.length;r++)(e=s[r]).prototype.hasOwnProperty("options")&&n.mixin(o,e.prototype.options,!0),e.hasOwnProperty("options")&&n.mixin(o,e.options,!0)}return Object.defineProperty(this,"options",{value:n.mixin({},o,t,!0)}),this.options},close:function(){t.fullScreen()===this.container[0]&&t.fullScreen(!1)},getValue:function(){return this.getSelectedItems()},cleared:function(){},selected:function(){},dataOptions:function(n){return n},enabled:function(n){}});return i.ViewBase=o});
//# sourceMappingURL=../sourcemaps/views/ViewBase.js.map
