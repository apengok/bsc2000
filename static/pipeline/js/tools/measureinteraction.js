goog.provide('ol.interaction.measureInteraction');


goog.require('ol.interaction.Draw');

ol.interaction.measureInteraction = function(options) {
	
	this.drawEnd = function(evt) {
		feature_ = evt.feature;
	}
	
	this.source_ = new ol.source.Vector();
	
	this.layer_ = new ol.layer.Vector({
	   source: this.source_,
	   style: new ol.style.Style({
		  stroke: new ol.style.Stroke({
			  color: '#ff0000',
			  width: 2
		   })
	    })
    });
	
	ol.interaction.Draw.call(this, {
	    type : ol.geom.GeometryType.LINE_STRING,
		source : this.source_,
		style: new ol.style.Style({
		  stroke: new ol.style.Stroke({
			color: '#ff0000',
			lineDash: [10, 10],
			width: 2
		  })
		})
    });

	ol.events.listen(this, ol.interaction.DrawEventType.DRAWSTART,
      ol.interaction.measureInteraction.prototype.drawStart.bind(this));
	  
    ol.events.listen(this, ol.interaction.DrawEventType.DRAWEND,
      ol.interaction.measureInteraction.prototype.drawEnd.bind(this));
	  
	  
	ol.events.listen(this,
      ol.Object.getChangeEventType(ol.interaction.InteractionProperty.ACTIVE),
      function(){
		  var map = this.getMap();
		  var active = this.getActive();
		  if (map && active)
			  map.getTargetElement().style.cursor = "url(./static/assets/js/tools/ruler.cur),default";
		  else if(map && !active)
			  map.getTargetElement().style.cursor = "default";
	  }, this);
	    
};

ol.inherits(ol.interaction.measureInteraction, ol.interaction.Draw);


ol.interaction.measureInteraction.prototype.setMap = function(map) {
  ol.interaction.Draw.prototype.setMap.call(this, map);
  
  this.layer_.setMap(map);
  ol.events.listen(map, 'pointermove',ol.interaction.measureInteraction.prototype.drawMove.bind(this));
       
};

ol.interaction.measureInteraction.prototype.drawStart = function(evt) {
	
}

ol.interaction.measureInteraction.prototype.drawMove = function(evt) {
	
}

ol.interaction.measureInteraction.prototype.drawEnd = function(evt) {
	
}

ol.interaction.measureInteraction.prototype.createHelpTooltip = function(text) {
	 var helpTooltipElement = document.createElement('div');
	 helpTooltipElement.className = 'tooltip hidden';
	 helpTooltip = new ol.Overlay({
		element: helpTooltipElement,
		offset: [15, 0],
		positioning: 'center-left'
	 });
	 map.addOverlay(helpTooltip);
}




