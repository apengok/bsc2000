goog.provide('ol.layer.SXZDT');

goog.require('ol.layer.Vector');

ol.layer.SXZDT = function(opt_options) {
	
	var options = opt_options || {};
	this.source_ = new ol.source.Vector();
	this.layerName_ = options.layerName ? options.layerName : '';
	this.name_ = options.name ? options.name : '';
  
	this.maxZoom = options.maxZoom ? options.maxZoom : -1;
	this.minZoom = options.minZoom ? options.minZoom : -1;
	
	this.visible = true;
	
	this.isDimText = options.isDimText ? options.isDimText : false;
	
	var this_ = this;
	ol.layer.Vector.call(this, {
		source : this_.source_,
		style : new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#7F7F7F',
				width: 1
		    })
		})
	});
	
	this.dimTexts = null;
	
}
ol.inherits(ol.layer.SXZDT, ol.layer.Vector);


ol.layer.SXZDT.prototype.setMap = function(map) {
        ol.layer.Vector.prototype.setMap.call(this, map);
		var this_ = this;
		map.on('moveend',function(e){
              this_.refreshSource_(e);
		});
		//层的标注
		this_.on('postcompose', function(e){
			    if(!this.visible)
					return;
			    if(!this.isDimText)
					return;
			    var ctx = e.context;
				ctx.font = "50px";
				ctx.fillStyle = "#7F7F7F";
				var scale = 1;
				var current_zoom = map.getView().getZoom();
				for(var i=0; i<this_.source_.getFeatures().length; i++) {
					var object = this_.source_.getFeatures()[i];
					var text = object.values_.text;
					var coords = object.getGeometry().flatCoordinates;
					//文字标注
					//if(object.type == "Dot" || object.type == "Point") {
					ol.Utils.drawLabelText(text, object.getGeometry().flatCoordinates[0], object.getGeometry().flatCoordinates[1], 5, ctx, scale);
					//}
					/*
				    else{  
					   //折线标注
					   var center = parseInt(coords.coordinates.length / 2);
					   var tp1 = ol.proj.fromLonLat([coords.coordinates[0][0],coords.coordinates[0][1]]);
					   var tp2 = ol.proj.fromLonLat([coords.coordinates[coords.coordinates.length-1][0],coords.coordinates[coords.coordinates.length-1][1]]);
					   var p1 = map.getPixelFromCoordinate(tp1);
					   var p2 = map.getPixelFromCoordinate(tp2);
					   var px1, py1, px2, py2;
					   px1 = p1[0], py1 = p1[1];
					   px2 = p2[0], py2 = p2[1];
					   var length = ol.Utils.distancePointToPoint(px1, py1, px2, py2);
							
					   var textWidth = ctx.measureText(text).width;
					   if(length >= textWidth) {
							p1 = [coords.coordinates[center-1][0],coords.coordinates[center-1][1]];
							p2 = [coords.coordinates[center][0],coords.coordinates[center][1]];
							px1 = p1[0], py1 = p1[1];
							px2 = p2[0], py2 = p2[1];
							var offset = -4;
							ol.Utils.drawLineLabelText(text, textWidth, px1, py1, px2, py2, offset, ctx);
						}
					  
					}
                    */					
				}
		})
};

ol.layer.SXZDT.prototype.refreshSource_ = function(e) {
	        var current_zoom = map.getView().getZoom();
			var visible = true;
			if(this.maxZoom != -1 && this.minZoom != -1) {
				if(current_zoom >= this.minZoom && current_zoom <= this.maxZoom)
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
            var this_ = this;
            if(this.visible & visible) {
				var myExtent = map.getView().calculateExtent(map.getSize());
				var bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(myExtent),'EPSG:3857', 'EPSG:4326');
				var topRight = ol.proj.transform(ol.extent.getTopRight(myExtent),'EPSG:3857', 'EPSG:4326');

				$.ajax({
					url: WEBSITE_ROOT+'getFeatureEx',
					data: "left=" + bottomLeft[0] + "&top=" + bottomLeft[1] + "&right=" + topRight[0] + "&bottom=" + topRight[1] + "&layerName="+this_.layerName_,
					type: 'GET',
					success: function(res){
						// console.log(res)
						var geojsonObject = Ext.util.JSON.decode(res);
						// var features = (new ol.format.GeoJSON()).readFeatures(geojsonObject.featureCollection);
						var features = (new ol.format.GeoJSON()).readFeatures(geojsonObject);
						this_.source_.clear(true);
						this_.source_.addFeatures(features);
						//this_.dimTexts = geojsonObject.dimTexts;
					}
				});
				this.setVisible(true);
			}
			else{
				this.dimTexts = null;
				this.setVisible(false);
				this.source_.clear(true);
			}
}