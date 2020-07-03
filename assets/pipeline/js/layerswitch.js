goog.provide('ol.control.LayerSwitch');
goog.provide('ol.control.MapType')

goog.require('ol.events');
goog.require('ol.events.EventType');
goog.require('ol.animation');
goog.require('ol.control.Control');
goog.require('ol.css');
goog.require('ol.easing');


ol.control.MapType = {
  NORMAL_MAP: 1,
  SATELLITE_MAP: 2,
  VECTOR_MAP: 3
};

ol.control.LayerSwitchEventType = {
	CHANGE_TYPE : 'layerChange' 
}

ol.control.LayerSwitch = function(opt_options) {

  var options = opt_options ? opt_options : {};

  this.layerGroup_ = opt_options.layerGroup ? opt_options.layerGroup : {},
  
  this.active_ = opt_options.active ? opt_options.active : ol.control.MapType.SATELLITE_MAP;
  
  var element = document.createElement('DIV');
  element.id = 'mapType';

  /*
  <div style="position: absolute; top: 21px; left: 37px; z-index: -1; display: black;"><div title="显示带有街道的卫星影像" style="border-right:1px solid #8ba4dc;border-bottom:1px solid #8ba4dc;border-left:1px solid #8ba4dc;background:white;font:12px arial,sans-serif;padding:0 8px 0 6px;line-height:1.6em;box-shadow:2px 2px 3px rgba(0, 0, 0, 0.35)"><span checked="checked" "="" class="_checkbox checked"></span><label style="vertical-align: middle; cursor: pointer;">混合</label></div></div>
  */
  
  //普通二位地图
  var normal = document.createElement('DIV');
  normal.className = 'mapType_position';
  var div = document.createElement('DIV');
  div.className = this.active_ == ol.control.MapType.NORMAL_MAP ? 'mapType_active' : 'mapType_normal',
  div.innerHTML = '地图';
  div.setAttribute('type', ol.control.MapType.NORMAL_MAP);
   ol.events.listen(div, ol.events.EventType.CLICK,
      ol.control.LayerSwitch.prototype.changMapType.bind(this, div));
  normal.appendChild(div);
  
  //卫星地图
  var satellite = document.createElement('DIV');
  satellite.className = 'mapType_position';
  div = document.createElement('DIV');
  div.className = this.active_ == ol.control.MapType.SATELLITE_MAP ? 'mapType_active' : 'mapType_normal',
  div.innerHTML = '卫星';
  div.setAttribute('type', ol.control.MapType.SATELLITE_MAP);
   ol.events.listen(div, ol.events.EventType.CLICK,
      ol.control.LayerSwitch.prototype.changMapType.bind(this, div));
  satellite.appendChild(div);
  
  //矢量地图
  var vector = document.createElement('DIV');
  vector.className = 'mapType_position';
  div = document.createElement('DIV');
  div.className = this.active_ == ol.control.MapType.VECTOR_MAP ? 'mapType_active' : 'mapType_normal',
  div.innerHTML = '矢量';
  div.setAttribute('type', ol.control.MapType.VECTOR_MAP);
  ol.events.listen(div, ol.events.EventType.CLICK,
      ol.control.LayerSwitch.prototype.changMapType.bind(this, div));
  vector.appendChild(div);
  
  element.appendChild(normal);
  element.appendChild(satellite);
  // element.appendChild(vector);

  ol.control.Control.call(this, {
    element: element
  });
};
ol.inherits(ol.control.LayerSwitch, ol.control.Control);


ol.control.LayerSwitch.prototype.changMapType = function(target)
{
	if(this.map_){
	   var mapType_ = target.getAttribute("type");
	   if(mapType_ != this.active_){
		   var old_layerGroup_ = this.map_.getLayerGroup();
		   $(".mapType_active").removeClass('mapType_active').addClass('mapType_normal');
		   target.className = 'mapType_active';
		   this.active_ = mapType_;
		   for(var i=0; i<this.layerGroup_.length; i++){
			  if(this.layerGroup_[i].values_.mapType == mapType_) {
				  this.map_.setLayerGroup(this.layerGroup_[i]);
				  this.dispatchEvent(new ol.control.LayerSwitch.ChangMapEvent(ol.control.LayerSwitchEventType.CHANGE_TYPE,
                       old_layerGroup_, this.layerGroup_[i]));
			  }
		   }
	   }
	}
}

ol.control.LayerSwitch.prototype.setMap = function(map) {
  ol.control.Control.prototype.setMap.call(this, map);
      for(var i=0; i<this.layerGroup_.length; i++){
		  if(this.layerGroup_[i].values_.mapType == this.active_)
			  map.setLayerGroup(this.layerGroup_[i]);
	  }
};

ol.control.LayerSwitch.ChangMapEvent = function(type, old_layerGroup, new_layerGroup) {

  ol.events.Event.call(this, type);

  this.old_layerGroup = old_layerGroup;

  this.new_layerGroup = new_layerGroup;

};
ol.inherits(ol.control.LayerSwitch.ChangMapEvent, ol.events.Event);

