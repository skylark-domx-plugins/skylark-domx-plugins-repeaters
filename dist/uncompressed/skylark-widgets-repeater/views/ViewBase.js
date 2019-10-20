define([
	"skylark-langx/langx",
	"skylark-domx-noder",
	"skylark-domx-query",
	"../views",	
],function(langx,noder,$,views) {

	var ViewBase = langx.Evented.inherit({
	    klassName: "ViewBase",

	    options : {
	      // The class to add when the gallery controls are visible:
	      controlsClass: "skylarkui-repeater-controls",
		  // Defines if the gallery should open in fullscreen mode:
		  fullScreen: false

	    },


    	_create$Item : function (template,itemData) {
        	var invalid = false;

        	function replace() {
            	var end, start, val;

            	start = template.indexOf('{{');
            	end = template.indexOf('}}', start + 2);

            	if (start > -1 && end > -1) {
                	val = langx.trim(template.substring(start + 2, end));
                	val = (itemData[val] !== undefined) ? itemData[val] : '';
                	template = template.substring(0, start) + val + template.substring(end + 2);
            	} else {
                	invalid = true;
            	}
       		}

        	while (!invalid && template.search('{{') >= 0) {
            	replace(template);
        	}

        	return $(template);
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
      	},

      	cleared : function() {

      	},

      	selected : function() {

      	},

	    dataOptions: function (options) {
	    	return options;
	    },

	    enabled : function(helpers){
	    	
	    }

	});

	return views.ViewBase = ViewBase;
});
