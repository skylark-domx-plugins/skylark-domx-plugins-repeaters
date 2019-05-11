/**
 * skylark-ui-repeater - The skylark repeater widget
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylarkui/skylark-ui-repeater/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-utils-dom/noder","../views"],function(n,t,e){var i=n.Evented.inherit({klassName:"ViewBase",options:{controlsClass:"skylarkui-repeater-controls",fullScreen:!1},init:function(n,e){var i,s=this;this.repeater=n,this.initOptions(e),this.options.fullScreen&&t.fullScreen(this.container[0]),this.repeater.on("item.running",function(n){s.container.hasClass(s.options.controlsClass)?(i=!0,s.container.removeClass(s.options.controlsClass)):i=!1}),this.repeater.on("item.running",function(n){i&&s.container.addClass(s.options.controlsClass)})},initOptions:function(t){this.options=n.mixin({},this.options,t)},close:function(){t.fullScreen()===this.container[0]&&t.fullScreen(!1)},getValue:function(){return this.getSelectedItems()},cleared:function(){},dataOptions:function(n){return n},enabled:function(n){}});return e.ViewBase=i});
//# sourceMappingURL=../sourcemaps/views/ViewBase.js.map
