/**
 * skylark-widgets-repeater - The skylark repeater widget
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-repeater/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-noder","skylark-domx-query","../views"],function(n,t,e,i){var s=n.Evented.inherit({klassName:"ViewBase",options:{controlsClass:"skylarkui-repeater-controls",fullScreen:!1},_create$Item:function(t,i){var s,o,r,a=!1;for(;!a&&t.search("{{")>=0;)s=void 0,o=void 0,r=void 0,o=t.indexOf("{{"),s=t.indexOf("}}",o+2),o>-1&&s>-1?(r=n.trim(t.substring(o+2,s)),r=void 0!==i[r]?i[r]:"",t=t.substring(0,o)+r+t.substring(s+2)):a=!0;return e(t)},init:function(n,e){var i,s=this;this.repeater=n,this.initOptions(e),this.options.fullScreen&&t.fullScreen(this.container[0]),this.repeater.on("item.running",function(n){s.container.hasClass(s.options.controlsClass)?(i=!0,s.container.removeClass(s.options.controlsClass)):i=!1}),this.repeater.on("item.running",function(n){i&&s.container.addClass(s.options.controlsClass)})},initOptions:function(t){this.options=n.mixin({},this.options,t)},close:function(){t.fullScreen()===this.container[0]&&t.fullScreen(!1)},getValue:function(){return this.getSelectedItems()},cleared:function(){},selected:function(){},dataOptions:function(n){return n},enabled:function(n){}});return i.ViewBase=s});
//# sourceMappingURL=../sourcemaps/views/ViewBase.js.map
