define([
	"skylark-langx/langx",
	"skylark-domx-noder",
	"skylark-domx-query"
],function(langx,noder,$) {

	var ViewBase = langx.Evented.inherit({
	    klassName: "ViewBase",

	    options : {
	      // The class to add when the gallery controls are visible:
	      controlsClass: "skylarkui-repeater-controls",
		    // Defines if the gallery should open in fullscreen mode:
		    fullScreen: false

	    },
      _construct : function (repeater,options) {
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
	    
	    //initOptions: function (options) {
	    //  // Create a copy of the prototype options:
	    //  this.options = langx.mixin({}, this.options,options);
	    //},

      initOptions : function(options) {
        var ctor = this.constructor,
            cache = ctor.cache = ctor.cache || {},
            defaults = cache.defaults;
        if (!defaults) {
          var  ctors = [];
          do {
            ctors.unshift(ctor);
            if (ctor === Plugin) {
              break;
            }
            ctor = ctor.superclass;
          } while (ctor);

          defaults = cache.defaults = {};
          for (var i=0;i<ctors.length;i++) {
            ctor = ctors[i];
            if (ctor.prototype.hasOwnProperty("options")) {
              langx.mixin(defaults,ctor.prototype.options,true);
            }
            if (ctor.hasOwnProperty("options")) {
              langx.mixin(defaults,ctor.options,true);
            }
          }
        }
        Object.defineProperty(this,"options",{
          value :langx.mixin({},defaults,options,true)
        });

        //return this.options = langx.mixin({},defaults,options);
        return this.options;
      },

    selected: function selected () {
        var infScroll = this.options.infiniteScroll;
        var opts;
        if (infScroll) {
            opts = (typeof infScroll === 'object') ? infScroll : {};
            this.repeater.infiniteScrolling(true, opts);
        }
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

	    dataOptions: function (options) {
	    	return options;
	    },

	    enabled : function(helpers){
	    	
	    },

      addItem : function addItem ($parent, response) {
        var action;
        if (response) {
          action = (response.action) ? response.action : 'append';
          if (action !== 'none' && response.item !== undefined) {
            var $container = (response.container !== undefined) ? $(response.container) : $parent;
            $container[action](response.item);
          }
        }
      },

      render : function(helpers) {
        if (this.before) {
          var addBefore = this.before(helpers);
          this.addItem(helpers.container, addBefore);
        }

        var $dataContainer = helpers.container.find('[data-container="true"]:last');
        var $container = ($dataContainer.length > 0) ? $dataContainer : helpers.container;

        // It appears that the following code would theoretically allow you to pass a deeply
        // nested value to "repeat on" to be added to the repeater.
        // eg. `data.foo.bar.items`
        if (this.renderItem) {
          var subset;
          var objectAndPropsToRepeatOnString = this.repeat || 'data.items';
          var objectAndPropsToRepeatOn = objectAndPropsToRepeatOnString.split('.');
          var objectToRepeatOn = objectAndPropsToRepeatOn[0];

          if (objectToRepeatOn === 'data' || objectToRepeatOn === 'this') {
            subset = (objectToRepeatOn === 'this') ? this : helpers.data;

            // Extracts subset from object chain (get `items` out of `foo.bar.items`). I think....
            var propsToRepeatOn = objectAndPropsToRepeatOn.slice(1);
            for (var prop = 0; prop < propsToRepeatOn.length; prop++) {
              if (subset[propsToRepeatOn[prop]] !== undefined) {
                subset = subset[propsToRepeatOn[prop]];
              } else {
                subset = [];
                console.warn('WARNING: Repeater unable to find property to iterate renderItem on.');
                break;
              }
            }

            for (var subItemIndex = 0; subItemIndex < subset.length; subItemIndex++) {
              var addSubItem = this.renderItem({
                container: $container,
                data: helpers.data,
                index: subItemIndex,
                subset: subset
              });
              this.addItem($container, addSubItem);
            }
          } else {
            console.warn('WARNING: Repeater plugin "repeat" value must start with either "data" or "this"');
          }
        }

        if (this.after) {
          var addAfter = this.after(helpers);
          this.addItem(helpers.container, addAfter);
        }    
      }

	});

	return ViewBase;
});
