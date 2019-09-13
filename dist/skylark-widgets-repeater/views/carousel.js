/**
 * skylark-widgets-repeater - The skylark repeater widget
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-repeater/
 * @license MIT
 */
define(["../views","./slider"],function(e,s){var a=s.ctor.inherit({klassName:"CarouselView",options:{hidePageScrollbars:!1,toggleControlsOnReturn:!1,toggleSlideshowOnSpace:!1,enableKeyboardNavigation:!1,closeOnEscape:!1,closeOnSlideClick:!1,closeOnSwipeUpOrDown:!1,disableScroll:!1,startSlideshow:!0},initOptions:function(e){e=langx.mixin({},a.prototype.options,e);this.overrided(e)}});return e.carousel={name:"carousel",ctor:a,templates:{default:'<div class="slides"></div><h3 class="title"></h3><a class="prev">‹</a><a class="next">›</a><a class="close">×</a><a class="play-pause"></a><ol class="indicator"></ol>'}}});
//# sourceMappingURL=../sourcemaps/views/carousel.js.map
