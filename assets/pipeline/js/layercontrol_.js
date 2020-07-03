goog.provide('ol.control.layerControl');

goog.require('ol.events');
goog.require('ol.events.EventType');
goog.require('ol.animation');
goog.require('ol.control.Control');
goog.require('ol.css');
goog.require('ol.easing');

var pipeLineAppLayerGroup = function(opt_options) {
	
	var options = opt_options ? opt_options : {};
	this.name_ = options.name ? options.name : '';
	this.groups_ = options.groups ? options.groups : [];
}	

var pipeLineAppLayer = function(opt_options) {
	
	var options = opt_options ? opt_options : {};
	
	this.name_ = options.name ? options.name : '';
	
	this.type_ = options.type ? options.type : '';
	
	this.style_ = options.style ? options.style : null;
	
	this.maxZoom = options.maxZoom ? options.maxZoom : -1;
	
	this.minZoom = options.minZoom ? options.minZoom : -1;
	
	this.isLabel = options.isLabel ? options.isLabel : false;
	
	this.isRotate = options.isRotate ? options.isRotate : false;
	
	this.visible = true;
	
	this.condition_ = options.condition ? options.condition : "";
	
	var this_ = this;
	

	this.layer = new ol.layer.Vector({
	    source: new ol.source.Vector()
	});
	
	if(this.style_)
		this.layer.setStyle(this.style_);
	
	this.layerChange_ = function(event) {
		 this.layer.setMap(event.target.map);
	};
	
	//重新加载数据
	this.refreshSource_ = function(event) {
		var map_ = map;
        var current_zoom = map_.getView().getZoom();
		
		var visible = true;
		if(this.maxZoom != -1 && this.minZoom != -1) {
			if(current_zoom >= minZoom && current_zoom <= maxZoom)
				visible = true;
			else
				visible = false;
		}
		else if(this.maxZoom != -1 && this.minZoom == -1) {
			if(current_zoom <= this.maxZoom)
				visible = false;
			else
				visible = true;
		}
		else if(this.minZoom != -1 && this.maxZoom == -1) {
			if(current_zoom >= this.minZoom)
				visible = true;
			else
				visible = false;
		}

		labels = "";
		
		if(this.visible & visible) {
			var myExtent = map_.getView().calculateExtent(map_.getSize());
			var bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(myExtent),'EPSG:3857', 'EPSG:4326');
			var topRight = ol.proj.transform(ol.extent.getTopRight(myExtent),'EPSG:3857', 'EPSG:4326');
			var this_ = this;
			$.ajax({
				url: WEBSITE_ROOT + 'getFeatureEx',
				// url: 'http://220.179.118.150:8082/pipeLine/getPipeFeature',
				data: "left=" + bottomLeft[0] + "&top=" + bottomLeft[1] + "&right=" + topRight[0] + "&bottom=" + topRight[1] + "&layerName="+this.type_ ,//+"&condition="+this.condition_,
				type: 'GET',
				success: function(res){
					// console.log(res)
					var geojsonObject = JSON.parse(res) ;//Ext.util.JSON.decode(res);
					// console.log(geojsonObject)
					var features = (new ol.format.GeoJSON()).readFeatures(geojsonObject);
					if(this_.isRotate) {
						for(var i=0; i<features.length; i++) {
							var feature = features[i];
							var feature_ = feature;
							var point = feature.getGeometry();
							var coords = point.getCoordinates();
							var pixel = map.getPixelFromCoordinate(coords);
							
							var angle = ol.Utils.fromDegree(feature.values_.angle);
							var valve_style1 = new ol.style.Style({
								image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
									src: valve_img_src,
									rotation:-angle
								}))
							});
							
							feature.setStyle(valve_style1);
						}
					}
					this_.layer.getSource().clear(true);
					this_.layer.getSource().addFeatures(features);
				}
			});
			this.layer.setVisible(true);
		}
		else{
			this.layer.setVisible(false);
			this.layer.getSource().clear(true);
		}
	}
	
	//创建标注
	this.createLabel_ = function(event) {
		 if(!this.visible)
			return;
		 if(this.isLabel) {
			var ctx = event.context;
			ctx.font = "1px";
			ctx.fillStyle = "#0080FF";

			var source = this.layer.getSource();
			var features = source.getFeatures();
			labels = "";
			for(var i=0; i<features.length; i++) {
				var feature = features[i];
				var poly = feature.getGeometry();
				if(poly instanceof ol.geom.LineString) {
					
					var text = feature.values_.text;
					if(text!="") {
						var coords = poly.getCoordinates();

						var p1 = map.getPixelFromCoordinate(coords[0]);
						var p2 = map.getPixelFromCoordinate(coords[1]);

						var px1, py1, px2, py2;
						px1 = p1[0], py1 = p1[1];
						px2 = p2[0], py2 = p2[1];
						var length = ol.Utils.distancePointToPoint(px1, py1, px2, py2);
					  
						var textWidth = ctx.measureText(text).width;
						if(length >= textWidth) {
							labels += feature.values_.id+",";
							p1 = ol.proj.toLonLat(coords[0]);
							p2 = ol.proj.toLonLat(coords[1]);
							px1 = p1[0], py1 = p1[1];
							px2 = p2[0], py2 = p2[1];
							var offset = 4;
							ol.Utils.drawLineLabelText(text, textWidth, px1, py1, px2, py2, offset, ctx);
						}
					}
				}
			}
		}
	} 

	return this;
}


ol.control.layerControl = function(opt_options) {
	
        var options = opt_options || {};

        var tipLabel = options.tipLabel ?
        options.tipLabel : 'Legend';
		
		this.layers = options.layers ? options.layers : [];
		
		this.layers1 = options.layers1 ? options.layers1 : [];

        this.mapListeners = [];
		
		this.layerSwitch = options.layerSwitch ? options.layerSwitch : null;

        this.hiddenClassName = 'ol-unselectable ol-control layerControl';
        if (ol.control.layerControl.isTouchDevice_()) {
            this.hiddenClassName += ' touch';
        }
        this.shownClassName = 'shown';

        var element = document.createElement('div');
        element.className = this.hiddenClassName;

        var button = document.createElement('button');
        button.setAttribute('title', tipLabel);
        element.appendChild(button);

        this.panel = document.createElement('div');
        this.panel.className = 'panel';
        element.appendChild(this.panel);
        ol.control.layerControl.enableTouchScroll_(this.panel);

        var this_ = this;
		
		
		var ul = document.createElement('ul');
        this.panel.appendChild(ul);
		
		var group1 = document.createElement('li');
		group1.className = 'group';
		var label1 = document.createElement('label');
		label1.innerHTML = '管网层';
		group1.appendChild(label1);
		ul.appendChild(group1);
		var ul1 = document.createElement('ul');
		group1.appendChild(ul1);
		
		/*
		var pipeGroup = document.createElement('li');
		pipeGroup.className = 'group';
		
		var pipeGroup_input = document.createElement('input');
		pipeGroup_input.type = 'checkbox';
		pipeGroup_input.checked = true;
		pipeGroup.appendChild(pipeGroup_input);
		
		
		var pipeGroup_label = document.createElement('label');
		pipeGroup_label.innerHTML = '管线层';
		pipeGroup.appendChild(pipeGroup_label);
		
		ul1.appendChild(pipeGroup);
		var pipeprops = document.createElement('ul');
		pipeGroup.appendChild(pipeprops);
		*/
		
		
		//添加图层控制器
		for(var i=0; i<this.layers.getArray().length;i++) {
			var appLayer = this.layers.item(i);
			if(appLayer instanceof pipeLineAppLayerGroup) {
				
				  var ul = document.createElement('ul');
				  this.panel.appendChild(ul);
					
				  var pli = document.createElement('li');
				  pli.className = 'group';
				  ul.appendChild(pli);
				  
				  var pInput = document.createElement('input');
				  pInput.type = 'checkbox';
		          pInput.checked = true;
				  pInput.lyr = appLayer;
				  pInput.onchange = function(e) {
					  var lyr = this.lyr;
					  if(lyr instanceof pipeLineAppLayerGroup){
						  var ul = $(this).parent();
						  ul.find("input").each(function(index,element){ 
							   $(element).prop('checked',e.target.checked);
                               if($(element).get(0).lyr instanceof pipeLineAppLayer) {
								   $(element).get(0).lyr.visible = e.target.checked;
								   $(element).get(0).lyr.layer.setVisible(e.target.checked);
								   $(element).get(0).lyr.refreshSource_();
								   $(element).get(0).lyr.layer.setMap(map);
							   }							   
						  }); 
						  
						  
					  }
				  }
		          pli.appendChild(pInput);
				  
				  var plabel = document.createElement('label');
				  plabel.innerHTML = appLayer.name_;
				  pli.appendChild(plabel);
				  
				  for(var j=0; j<appLayer.groups_.length;j++) {
					  var group_layer = appLayer.groups_[j];
					  if(group_layer instanceof pipeLineAppLayerGroup) {
						  
						  var child_ul = document.createElement('ul');
						  pli.appendChild(child_ul);
							
						  var child_li = document.createElement('li');
						  child_li.className = 'group';
						  child_ul.appendChild(child_li);
						  
						  var child_Input = document.createElement('input');
						  child_Input.type = 'checkbox';
						  child_Input.checked = true;
						  child_Input.lyr = group_layer;
						  child_Input.onchange = function(e) {
							  var lyr = this.lyr;
							  if(lyr instanceof pipeLineAppLayerGroup){
								  var ul = $(this).parent();
								  ul.find("input").each(function(index,element){ 
									   $(element).prop('checked',e.target.checked);
										if($(element).get(0).lyr instanceof pipeLineAppLayer) {
											$(element).get(0).lyr.visible = e.target.checked;
											$(element).get(0).lyr.layer.setVisible(e.target.checked);
											$(element).get(0).lyr.refreshSource_();
											$(element).get(0).lyr.layer.setMap(map);
										}									   
								  }); 
							  }
						  }
						  child_li.appendChild(child_Input);
						  
						  var child_label = document.createElement('label');
						  child_label.innerHTML = group_layer.name_;
						  child_li.appendChild(child_label);
						  
						  
						  var child_layer_ul = document.createElement('ul');
						  child_li.appendChild(child_layer_ul);
						  
						  for(var c=0; c<group_layer.groups_.length; c++) {
							  var lyr = group_layer.groups_[c];
							  
							  var layer_li = document.createElement('li');
							  layer_li.className = 'layer';
							  var layer_input = document.createElement('input');
							  layer_input.type = 'checkbox';
							  layer_input.checked = true;
							  layer_input.lyr = lyr;
							  layer_input.onchange = function(e) {
								this.lyr.visible = e.target.checked;
								this.lyr.layer.setVisible(e.target.checked);
								this.lyr.refreshSource_();
								this.lyr.layer.setMap(map);
							  }

							  layer_li.appendChild(layer_input);
							  
							  var layer_label = document.createElement('label');
							  layer_label.innerHTML = lyr.name_;
							  layer_li.appendChild(layer_label);
							  child_layer_ul.appendChild(layer_li);
							  
						  }
					  }
				  }
			} else {
				
				  var ul = document.createElement('ul');
				  this.panel.appendChild(ul);
					
				  var pli = document.createElement('li');
				  pli.className = 'group';
				  ul.appendChild(pli);
				  
				  var pInput = document.createElement('input');
				  pInput.type = 'checkbox';
		          pInput.checked = true;
				  pInput.lyr = appLayer;
				  pInput.onchange = function(e) {
						this.lyr.visible = e.target.checked;
						this.lyr.layer.setVisible(e.target.checked);
						this.lyr.refreshSource_();
						this.lyr.layer.setMap(map);
				  }
		          pli.appendChild(pInput);
				  
				  var plabel = document.createElement('label');
				  plabel.innerHTML = appLayer.name_;
				  pli.appendChild(plabel);
				  
				  
			}
			/*
			var appLayer = this.layers.item(i);
			var li = document.createElement('li');
			li.className = 'layer';
			var input = document.createElement('input');
			input.type = 'checkbox';
			input.checked = true;
			input.lyr = appLayer;
			input.onchange = function(e) {
				this.lyr.visible = e.target.checked;
				this.lyr.layer.setVisible(e.target.checked);
				this.lyr.refreshSource_();
				this.lyr.layer.setMap(map);
			}
			li.appendChild(input);
			var label = document.createElement('label');
			label.innerHTML = appLayer.name_;
			li.appendChild(label);
			ul1.appendChild(li);
			*/
		}
		
		
		var group2 = document.createElement('li');
		group2.className = 'group';
		var label2 = document.createElement('label');
		label2.innerHTML = '宗地图层';
		group2.appendChild(label2);
		ul.appendChild(group2);
		

		for(var i=0; i<this.layers1.getArray().length;i++) {

			var vecLayer = this.layers1.item(i);
			var li = document.createElement('li');
			li.className = 'layer';
			var input = document.createElement('input');
			input.type = 'checkbox';
			input.checked = true;
			input.lyr = vecLayer;
			input.onchange = function(e) {
				this.lyr.visible = e.target.checked;
				this.lyr.setVisible(e.target.checked);
				this.lyr.refreshSource_();
			}
			li.appendChild(input);
			var label = document.createElement('label');
			label.innerHTML = vecLayer.name_;
			li.appendChild(label);
			ul.appendChild(li);
		}
		
        button.onmouseover = function(e) {
            this_.showPanel();
        };

        button.onclick = function(e) {
            e = e || window.event;
            this_.showPanel();
            e.preventDefault();
        };

        this_.panel.onmouseout = function(e) {
            e = e || window.event;
            if (!this_.panel.contains(e.toElement || e.relatedTarget)) {
                this_.hidePanel();
            }
        };

        ol.control.Control.call(this, {
            element: element,
            target: options.target
        });

};
ol.inherits(ol.control.layerControl, ol.control.Control);


 ol.control.layerControl.prototype.showPanel = function() {
        if (!this.element.classList.contains(this.shownClassName)) {
            this.element.classList.add(this.shownClassName);
            //this.renderPanel();
        }
    };

    /**
     * Hide the layer panel.
     */
    ol.control.layerControl.prototype.hidePanel = function() {
        if (this.element.classList.contains(this.shownClassName)) {
            this.element.classList.remove(this.shownClassName);
        }
    };

    /**
     * Re-draw the layer panel to represent the current state of the layers.
     */
    ol.control.layerControl.prototype.renderPanel = function() {

  

       
    };

    /**
     * Set the map instance the control is associated with.
     * @param {ol.Map} map The map instance.
     */
    ol.control.layerControl.prototype.setMap = function(map) {
        ol.control.Control.prototype.setMap.call(this, map);

		for(var i=0; i<this.layers.getArray().length;i++) {
			var appLayer = this.layers.item(i);
			if(appLayer instanceof pipeLineAppLayerGroup) {
				for(var j=0; j<appLayer.groups_.length;j++){
				     var obj = appLayer.groups_[j];
                     if(obj instanceof pipeLineAppLayerGroup) {
						 for(var c=0; c<obj.groups_.length;c++){
							 var obj_ = obj.groups_[c];
							 if(obj_ instanceof pipeLineAppLayer) {
							    ol.events.listen(map, 'moveend', obj_.refreshSource_.bind(obj_));
								ol.events.listen(obj_.layer, 'postcompose', obj_.createLabel_.bind(obj_));
								obj_.layer.setMap(map);
							 }
						 }
					 }					 
				}
			}
			else{
				  ol.events.listen(map, 'moveend', appLayer.refreshSource_.bind(appLayer));
				  ol.events.listen(appLayer.layer, 'postcompose', appLayer.createLabel_.bind(appLayer));
				  appLayer.layer.setMap(map);
			}
			
			//ol.events.listen(layerswitch, 'layerChange', appLayer.layerChange_.bind(appLayer));
		}
		for(var i=0; i<this.layers1.getArray().length;i++) {
			var vecLayer = this.layers1.item(i);
			vecLayer.setMap(map);
		}
		
    };

    /**
     * Ensure only the top-most base layer is visible if more than one is visible.
     * @private
     */
    ol.control.layerControl.prototype.ensureTopVisibleBaseLayerShown_ = function() {
        var lastVisibleBaseLyr;
        ol.control.layerControl.forEachRecursive(this.getMap(), function(l, idx, a) {
            if (l.get('type') === 'base' && l.getVisible()) {
                lastVisibleBaseLyr = l;
            }
        });
        if (lastVisibleBaseLyr) this.setVisible_(lastVisibleBaseLyr, true);
    };

    /**
     * Toggle the visible state of a layer.
     * Takes care of hiding other layers in the same exclusive group if the layer
     * is toggle to visible.
     * @private
     * @param {ol.layer.Base} The layer whos visibility will be toggled.
     */
    ol.control.layerControl.prototype.setVisible_ = function(lyr, visible) {
        var map = this.getMap();
        lyr.setVisible(visible);
        if (visible && lyr.get('type') === 'base') {
            // Hide all other base layers regardless of grouping
            ol.control.layerControl.forEachRecursive(map, function(l, idx, a) {
                if (l != lyr && l.get('type') === 'base') {
                    l.setVisible(false);
                }
            });
        }
    };

    /**
     * Render all layers that are children of a group.
     * @private
     * @param {ol.layer.Base} lyr Layer to be rendered (should have a title property).
     * @param {Number} idx Position in parent group list.
     */
    ol.control.layerControl.prototype.renderLayer_ = function(lyr, idx) {

        var this_ = this;

        var li = document.createElement('li');

        var lyrTitle = lyr.get('title');
        var lyrId = ol.control.layerControl.uuid();

        var label = document.createElement('label');

        if (lyr.getLayers && !lyr.get('combine')) {

            li.className = 'group';
            label.innerHTML = "aaaaa";
            li.appendChild(label);
            var ul = document.createElement('ul');
            li.appendChild(ul);

            this.renderLayers_(lyr, ul);

        } else {

            li.className = 'layer';
            var input = document.createElement('input');
            if (lyr.get('type') === 'base') {
                input.type = 'radio';
                input.name = 'base';
            } else {
                input.type = 'checkbox';
            }
            input.id = lyrId;
            input.checked = lyr.get('visible');
            input.onchange = function(e) {
                this_.setVisible_(lyr, e.target.checked);
            };
            li.appendChild(input);

            label.htmlFor = lyrId;
            label.innerHTML = lyrTitle;

            var rsl = this.getMap().getView().getResolution();
            if (rsl > lyr.getMaxResolution() || rsl < lyr.getMinResolution()){
                label.className += ' disabled';
            }

            li.appendChild(label);

        }

        return li;

    };

    /**
     * Render all layers that are children of a group.
     * @private
     * @param {ol.layer.Group} lyr Group layer whos children will be rendered.
     * @param {Element} elm DOM element that children will be appended to.
     */
    ol.control.layerControl.prototype.renderLayers_ = function(lyr, elm) {
		/*
        var lyrs = lyr.getLayers().getArray().slice().reverse();
        for (var i = 0, l; i < lyrs.length; i++) {
            l = lyrs[i];
            if (l.get('title')) {
                elm.appendChild(this.renderLayer_(l, i));
            }
        }
		*/
		
		
    };

    /**
     * **Static** Call the supplied function for each layer in the passed layer group
     * recursing nested groups.
     * @param {ol.layer.Group} lyr The layer group to start iterating from.
     * @param {Function} fn Callback which will be called for each `ol.layer.Base`
     * found under `lyr`. The signature for `fn` is the same as `ol.Collection#forEach`
     */
    ol.control.layerControl.forEachRecursive = function(lyr, fn) {
        lyr.getLayers().forEach(function(lyr, idx, a) {
            fn(lyr, idx, a);
            if (lyr.getLayers) {
                ol.control.layerControl.forEachRecursive(lyr, fn);
            }
        });
    };

    /**
     * Generate a UUID
     * @returns {String} UUID
     *
     * Adapted from http://stackoverflow.com/a/2117523/526860
     */
    ol.control.layerControl.uuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    /**
    * @private
    * @desc Apply workaround to enable scrolling of overflowing content within an
    * element. Adapted from https://gist.github.com/chrismbarr/4107472
    */
    ol.control.layerControl.enableTouchScroll_ = function(elm) {
       if(ol.control.layerControl.isTouchDevice_()){
           var scrollStartPos = 0;
           elm.addEventListener("touchstart", function(event) {
               scrollStartPos = this.scrollTop + event.touches[0].pageY;
           }, false);
           elm.addEventListener("touchmove", function(event) {
               this.scrollTop = scrollStartPos - event.touches[0].pageY;
           }, false);
       }
    };

    /**
     * @private
     * @desc Determine if the current browser supports touch events. Adapted from
     * https://gist.github.com/chrismbarr/4107472
     */
    ol.control.layerControl.isTouchDevice_ = function() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch(e) {
            return false;
        }
   };

