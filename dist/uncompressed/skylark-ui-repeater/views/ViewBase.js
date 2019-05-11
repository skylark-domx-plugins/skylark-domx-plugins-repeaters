define([
	"skylark-langx/langx",
	"skylark-utils-dom/noder",
	"../views",	
],function(langx,noder,views) {

	var ViewBase = langx.Evented.inherit({
	    klassName: "ViewBase",

	    options : {
	      // The class to add when the gallery controls are visible:
	      controlsClass: "skylarkui-repeater-controls",
		  // Defines if the gallery should open in fullscreen mode:
		  fullScreen: false

	    },
	    
		init : function (repeater,options) {
			var that = this,
				hasControls;
			this.repeater = repeater;
			this.initOptions(options);
	        if (this.options.fullScreen) {
	          noder.fullScreen(this.container[0]);
	        }
	        this.repeater.on("item.running",function(e){
	            if (that.container.hasClass(that.options.controlsClass)) {
	              hasControls = true
	              that.container.removeClass(that.options.controlsClass);
	            } else {
	              hasControls = false
	            }
	        });

	        this.repeater.on("item.running",function(e){
	            if (hasControls) {
	              that.container.addClass(that.options.controlsClass);
	            }
	        });
		},

	    initOptions: function (options) {
	      // Create a copy of the prototype options:
	      this.options = langx.mixin({}, this.options,options);
	    },

	    close: function () {
      		if (noder.fullScreen() === this.container[0]) {
        		noder.fullScreen(false);
      		}
      	},

      	getValue : function() {
      		return this.getSelectedItems();
      	} 

	});

	return views.ViewBase = ViewBase;
});
