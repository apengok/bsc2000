goog.provide('ol.control.NavToolbar');

goog.require('ol.events');
goog.require('ol.events.EventType');
goog.require('ol.animation');
goog.require('ol.control.Control');
goog.require('ol.css');
goog.require('ol.easing');



ol.control.NavToolbar = function(opt_options) {

  var options = opt_options ? opt_options : {};

  var element = document.createElement('DIV');
  element.id = 'Control_NavToolbar';
  element.className = 'olControlNavToolbar';
  
  
  var pan_tool = document.createElement('DIV');
  pan_tool.id = 'Control_NavToolbar';
  pan_tool.className = 'olControlpanTool';
  
  element.appendChild(pan_tool);
 
  ol.control.Control.call(this, {
    element: element
  });

};

ol.inherits(ol.control.NavToolbar, ol.control.Control);

ol.control.NavToolbar.prototype.addToolBar = function() {
    
};




