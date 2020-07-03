/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A simple push button control 
* @constructor
* @extends {ol.control.Control}
* @param {Object=} options Control options.
*	@param {String} options.className class of the control
*	@param {String} options.title title of the control
*	@param {String} options.html html to insert in the control
*	@param {function} options.handleClick callback when control is clicked (or use change:active event)
*/
ol.control.Button = function(options) 
{	options = options || {};
	var element = $("<div>").addClass((options.className||"") + ' ol-button ol-unselectable ol-control');
	var self = this;

	var bt = $("<button>").html(options.html || "")
				.attr('type','button')
				.attr('title', options.title)
				.attr('style', "width:2.375em;height:2.375em;border-radius:5px 5px 5px 5px;")
				.on("click", function(e)
				{	if (e && e.preventDefault) 
					{	e.preventDefault();
						e.stopPropagation();
					}
					if (options.handleClick) options.handleClick.call(self, e);
				})
				.appendTo(element);
	// Try to get a title in the button content
	if (!options.title) bt.attr("title", bt.children().first().attr('title'));

	ol.control.Control.call(this, 
	{	element: element.get(0),
		target: options.target
	});

	if (options.title) this.set("title", options.title);
};
ol.inherits(ol.control.Button, ol.control.Control);

/** A simple push button control drawn as text
* @constructor
* @extends {ol.control.Button}
* @param {Object=} options Control options.
*	@param {String} options.className class of the control
*	@param {String} options.title title of the control
*	@param {String} options.html html to insert in the control
*	@param {function} options.handleClick callback when control is clicked (or use change:active event)
*/
ol.control.TextButton = function(options) 
{	options = options || {};
	options.className = (options.className||"") + " ol-text-button";
	ol.control.Button.call(this, options);
};
ol.inherits(ol.control.TextButton, ol.control.Button);
