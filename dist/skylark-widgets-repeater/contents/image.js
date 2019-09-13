/**
 * skylark-widgets-repeater - The skylark repeater widget
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-repeater/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-utils/noder","skylark-utils/query","../../Album"],function(t,e,r,i){var o=i.ItemFactoryBase.inherit({klassName:"ImageItemFactory",options:{stretchImages:!1},initOptions:function(e){this.overrided(),this.options=t.mixin(this.options,o.prototype.options,e)},render:function(t,i){var o,n,s,a,l=e.createElement("img"),p=(this.album,t),m=this.options.stretchImages;return"string"!=typeof p&&(p=this.getItemProperty(t,this.options.urlProperty),s=this.getItemProperty(t,this.options.titleProperty),a=this.getItemProperty(t,this.options.altTextProperty)||s),!0===m&&(m="contain"),m?n=e.createElement("div"):(n=l,l.draggable=!1),s&&(n.title=s),a&&(n.alt=a),r(l).on("load error",function t(e){o||(e={type:e.type,target:n},o=!0,r(l).off("load error",t),m&&"load"===e.type&&(n.style.background='url("'+p+'") center no-repeat',n.style.backgroundSize=m),i(e))}),l.src=p,n}}),n={name:"image",mimeType:"image",ctor:o};return i.installPlugin("items",n),n});
//# sourceMappingURL=../sourcemaps/contents/image.js.map
