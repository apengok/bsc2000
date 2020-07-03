
var plotDraw, plotEdit, drawOverlay, drawStyle;

var WEBSITE_ROOT='http://192.168.1.145:8000/gis/';
// var WEBSITE_ROOT='http://192.168.1.111:8080/pipeLine/';

var click_selected = [];
/*============================设备管线部分================================*/

var pipe_line_style =function(feature) { 

	var color='#0080FF';
	var item = feature.getProperties().id;
	if(click_selected.includes(item)){
		color = 'red';
	}
	return new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: color,
			width: 2
		})
	})
};

/*
var mark_img_src = $ctx + '/img/flag_mark.png';
var mark_style = new ol.style.Style({
    image: new ol.style.Icon(({
		src: mark_img_src,
		offset : [0, 10]
	}))
});

var markLayer = new ol.layer.Vector({
	 source: new ol.source.Vector(),
	 style : mark_style
});
*/


/***********************底图应用层部分***********************/
var appLayer = function (options) {
   var layer = new ol.layer.Tile({
   extent: ol.proj.transformExtent(options.mapExtent, options.fromProject, options.toProject),
   source: new ol.source.XYZ({
		urls: options.urls,
		tilePixelRatio: options.tilePixelRatio,
		minZoom: options.mapMinZoom,
		maxZoom: options.mapMaxZoom
		})
   });
   return layer;
}

/*============================卫星图层================================*/

//卫星底图
var sat_background = new appLayer({
	urls: ['http://www.google.cn/maps/vt?lyrs=s@692&gl=en&x={x}&y={y}&z={z}'],
	mapExtent: [-2.0037508342787E7, -2.0037508342787E7, 2.0037508342787E7, 2.0037508342787E7],
	tilePixelRatio: 1,
	fromProject: "EPSG:102100",
	toProject: "EPSG:3857"
})

//卫星路网数据
var sat_data = new appLayer({
	urls : ['http://t0.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5&tk=af218d8a9536478231c24fa299fc48f5',
	         'http://t2.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5&tk=af218d8a9536478231c24fa299fc48f5',
			 'http://t3.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5&tk=af218d8a9536478231c24fa299fc48f5',
			 'http://t4.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5&tk=af218d8a9536478231c24fa299fc48f5',
			 'http://t5.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5&tk=af218d8a9536478231c24fa299fc48f5',
			 'http://t6.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5&tk=af218d8a9536478231c24fa299fc48f5',
			 'http://t7.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5&tk=af218d8a9536478231c24fa299fc48f5',
			 'http://t1.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5&tk=af218d8a9536478231c24fa299fc48f5'],
	mapExtent: [-2.0037508342787E7, -2.0037508342787E7, 2.0037508342787E7, 2.0037508342787E7],
	tilePixelRatio: 1,
	fromProject: "EPSG:900913",
	toProject: "EPSG:3857"
})


var arrSat = new ol.Collection();
arrSat.push(sat_background);
arrSat.push(sat_data);

var sat_group = new ol.layer.Group({
	mapType: ol.control.MapType.SATELLITE_MAP,
	layers : arrSat
});


/*============================地形图层================================*/
var normal_background = new appLayer({
	urls: ['http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
	        'http://t1.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
			'http://t2.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
			'http://t3.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
			'http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
			'http://t5.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
			'http://t6.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
			'http://t7.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5'],
	mapExtent: [-2.0037508342787E7, -2.0037508342787E7, 2.0037508342787E7, 2.0037508342787E7],
	tilePixelRatio: 1,
	fromProject: "EPSG:102100",
	toProject: "EPSG:3857"
})

var normal_data = new appLayer({
	urls: ['http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
	        'http://t1.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
			'http://t2.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
			'http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
			'http://t4.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
			'http://t5.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
			'http://t6.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5',
			'http://t7.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=af218d8a9536478231c24fa299fc48f5'],
	mapExtent: [-2.0037508342787E7, -2.0037508342787E7, 2.0037508342787E7, 2.0037508342787E7],
	tilePixelRatio: 1,
	fromProject: "EPSG:102100",
	toProject: "EPSG:3857"
})


var arrNormal = new ol.Collection();
arrNormal.push(normal_background);
arrNormal.push(normal_data);

var normal_group = new ol.layer.Group({
	mapType: ol.control.MapType.NORMAL_MAP,
	layers : arrNormal
});

/*============================矢量图层================================*/
var vector_background = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: function(extent, resolution, projection){
		var topRight = ol.proj.transform(ol.extent.getTopRight(extent),'EPSG:3857', 'EPSG:4326');
		var bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent),'EPSG:3857', 'EPSG:4326');
		var tUrl = "getGeom?left=" + bottomLeft[0] + '&top=' + bottomLeft[1] +
   		                    '&right=' + topRight[0] + "&bottom=" + topRight[1]; 
        //var tUrl = "china.json";  							  
		return tUrl;
	},
	//strategy : 加载策略
	//目标是从数据源请求矢量的方式，包括单次请求全部元素 ol.loadingstrategy.all,默认
	//当前视图范围 ol.loadingstrategy.bbox
	//切片范围 ol.loadingststrategy.tile
	strategy: ol.loadingstrategy.bbox,
	//strategy: ol.loadingstrategy.all,
    format: new ol.format.GeoJSON({
        extractStyles: false
    })
  })
});

var arrVector = new ol.Collection();
arrVector.push(vector_background);

var vector_group = new ol.layer.Group({
	mapType: ol.control.MapType.VECTOR_MAP,
	layers : arrVector
});

//初始化
var mousePositionControl = new ol.control.MousePosition({
	coordinateFormat: ol.coordinate.createStringXY(5),
	projection: 'EPSG:4326',
	className: 'my-mouse-position',
	undefinedHTML: ''
});

//比例尺
var scaleLineControl = new ol.control.ScaleLine({
	className : 'my-scale-line'
});

var slider = new ol.control.ZoomSlider({
});

var attribution = new ol.control.Attribution({
	className : 'none'
});

var navToolbar = new ol.control.NavToolbar({
});


var layerswitch = new ol.control.LayerSwitch({
	active: ol.control.MapType.NORMAL_MAP,
	layerGroup : [sat_group, normal_group, vector_group]
	//layerGroup : [sat_group, normal_group]
});



var center = [118.39469563,29.888188578];
//var center = [118.47150,29.91398];
var map = new ol.Map({
	view: new ol.View({
		center:  new ol.proj.transform(center,"EPSG:4326","EPSG:3857"),
		maxZoom : 26,
		minZoom : 13,
		zoom: 16
		//zoom: 18
	}),
	controls: ol.control.defaults({ attribution: false }).extend([attribution]),
	target:"map"
});

map.addControl(layerswitch);
map.addControl(slider);
map.addControl(navToolbar);
map.addControl(mousePositionControl);

var overview = new ol.control.OverviewMap({
	
});
map.addControl(overview);

var pop_container = document.getElementById('popup');  
var pop_content = document.getElementById('popup-content');  
var pop_closer = document.getElementById('popup-closer');  
var popTitle = document.getElementById('popup-title');  
var popup = new ol.Overlay({  
      element: pop_container,  
      autoPan: true,  
      autoPanAnimation: {  
          duration: 250  
      }  
  });  
pop_closer.onclick = function () {  
    popup.setPosition(undefined);  
    pop_closer.blur();  
    return false;  
};  
map.addOverlay(popup);

// 初始化标绘绘制工具，添加绘制结束事件响应
    plotDraw = new P.PlotDraw(map);
    plotDraw.on(P.Event.PlotDrawEvent.DRAW_END, onDrawEnd, false, this);

    // 初始化标绘编辑工具
    plotEdit = new P.PlotEdit(map);

    // 设置标绘符号显示的默认样式
    var stroke = new ol.style.Stroke({
        color: '#FF0000',
        width: 2
    });
    var fill = new ol.style.Fill({color: 'rgba(0,255,0,0.4)'});
    var image = new ol.style.Circle({fill: fill, stroke: stroke, radius: 8});
    drawStyle = new ol.style.Style({image: image, fill:fill, stroke:stroke});

    // 绘制好的标绘符号，添加到FeatureOverlay显示。
    drawOverlay = new ol.layer.Vector({
        source: new ol.source.Vector()
    });
    drawOverlay.setStyle(drawStyle);
    drawOverlay.setMap(map);
	
// 绘制结束后，添加到FeatureOverlay显示。
function onDrawEnd(event){
    var feature = event.feature;
    drawOverlay.getSource().addFeature(feature);
    // 开始编辑
    plotEdit.activate(feature);
   //activeDelBtn();
}

// 指定标绘类型，开始绘制。
function activate(type){
	drawOverlay.getSource().clear(true);
    plotEdit.deactivate();
    plotDraw.activate(type);
};

function windowClose() {
	drawOverlay.getSource().clear(true);
	plotEdit.deactivate();
    plotDraw.deactivate();
}

// Main control bar
var mainbar = new ol.control.Bar();
map.addControl(mainbar);

// Edit control bar 
var editbar = new ol.control.Bar({
	toggleOne: true,
	group:true	
});
mainbar.addControl(editbar);

var select = new ol.interaction.Select({
	  condition: ol.events.condition.click,
	  //对选择进行过滤处理  
	  filter: function(feature, layer){
		  if(!feature.values_.className)
			  return false;
		  return true;
      }
});

function modifyFeatures(features) {
    features.forEach(function(feature) {
        var geometry = feature.getGeometry();
        geometry.transform('EPSG:4326', 'EPSG:3857');

        if (geometry.getType() === 'Point') {
            feature.setStyle(
                new ol.style.Style({
                    image: new ol.style.RegularShape({
                        fill: new ol.style.Fill({
                            color: [255, 0, 0, 0.6]
                        }),
                        stroke: new ol.style.Stroke({
                            width: 2,
                            color: 'blue'
                        }),
                        points: 5,
                        radius1: 25,
                        radius2: 12.5
                    })
                })
            );
        }

        if (geometry.getType() === 'LineString') {
            click_selected.push(feature.values_.id);
        }
    });
    return features;
}

select.on('select', function(e) {
	var feature = e.selected[0];
	var coordinate = e.mapBrowserEvent.coordinate;
	if(feature && feature.values_.className){
		var element = popup.getElement();
		$(element).popover('destroy');
		popup.setPosition(coordinate);
		$(element).popover('show');
	}else{
		return;
	}

	click_selected = [];
	
	$.ajax({
		url: WEBSITE_ROOT + 'getTopoByNode',
		data: "id="+feature.values_.id ,//+"&className=" + feature.values_.className ,
		type: 'GET',
		success: function(res){
			var data = Ext.util.JSON.decode(res);
			var format = new ol.format.GeoJSON();
			var features = format.readFeatures(data);
			console.log(features);
			modifyFeatures(features);
			console.log(data);
			pipe_layer_32.layer.changed();
			var html = '<table>';
			if(feature.values_.className == 'ws_pipe') {
				html += "<tr>";
				html += "<td width='60px' align='left' >类 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;型:</td>";
				html += "<td width='120px' align='left'>管线</td>";
				html += "</tr>";
				
				// html += "<tr>";
				// html += "<td width='60px' align='left'>编&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;号:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].industryCode + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>长&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;度:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].length + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>管&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;径:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].caliber + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>管&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;材:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].material + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>起点埋深:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].start_depth + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>终点埋深:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].end_depth + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>起点高程:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].start_altitude + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>终点高程:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].end_altitude + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>录入时间:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].input_time + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>录入人员:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].input_staff + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>修改时间:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].modify_time + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>修改人员:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].modify_staff + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>埋设方式:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].burying + "</td>";
						
				// html += "</tr>";

				// html += "<tr>";
				// html += "<td width='60px' align='left'>所在道路:</td>";
				// html += "<td width='120px' align='left'>"+ data[0].road + "</td>";
						
				// html += "</tr>";
			}else if(feature.values_.className == 'ws_flow_meter'){
				html +="<tr>";
				html +="<td width='60px' align='left'>节点类型:</td>";
				html +="<td width='120px' align='left'>"+ language[feature.values_.className]  + "</td>";
						
				html +="</tr>";
				
				html += "<tr>";
				html += "<td width='60px' align='left'>编&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;号:</td>";
				html += "<td width='120px' align='left'>"+ data.features[0].properties.industryCode + "</td>";
						
				html += "</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>口&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;径:</td>";
				html +="<td width='120px' align='left'>"+ feature.values_.caliber + "</td>";
						
				html +="</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>管&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;材:</td>";
				html +="<td width='120px' align='left'>"+ feature.values_.length + "</td>";
						
				html +="</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>埋&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;深:</td>";
				html +="<td width='120px' align='left'>"+ feature.values_.endDepth + "</td>";
						
				html +="</tr>";
			}
			else{
				
				html +="<tr>";
				html +="<td width='60px' align='left'>节点类型:</td>";
				html +="<td width='120px' align='left'>"+ language[feature.values_.className]  + "</td>";
						
				html +="</tr>";
				
				html += "<tr>";
				html += "<td width='60px' align='left'>编&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;号:</td>";
				html += "<td width='120px' align='left'>"+ data[0].industry_code + "</td>";
						
				html += "</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>口&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;径:</td>";
				html +="<td width='120px' align='left'>"+ data[0].caliber + "</td>";
						
				html +="</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>管&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;材:</td>";
				html +="<td width='120px' align='left'>"+ data[0].material + "</td>";
						
				html +="</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>埋&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;深:</td>";
				html +="<td width='120px' align='left'>"+ data[0].depth + "</td>";
						
				html +="</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>高 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;程:</td>";
				html +="<td width='120px' align='left'>"+ data[0].altitude + "</td>";
						
				html +="</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>录入时间:</td>";
				html +="<td width='120px' align='left'>"+ data[0].input_time + "</td>";
						
				html +="</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>录入人员:</td>";
				html +="<td width='120px' align='left'>"+ data[0].input_staff + "</td>";
						
				html +="</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>修改时间:</td>";
				html +="<td width='120px' align='left'>"+ data[0].modify_time + "</td>";
						
				html +="</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>修改人员:</td>";
				html +="<td width='120px' align='left'>"+ data[0].modify_staff + "</td>";
						
				html +="</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>埋设方式:</td>";
				html +="<td width='120px' align='left'>"+ data[0].burying + "</td>";
						
				html +="</tr>";

				html +="<tr>";
				html +="<td width='60px' align='left'>所在道路:</td>";
				html +="<td width='120px' align='left'>"+ data[0].road + "</td>";
				html +="</tr>";
				
			}
			html += '</table>';
			pop_content.innerHTML = html; 
		}
	});
});

console.log('fuck')

var attrSelect = new ol.control.Toggle({	
    html: '<i class="fa fa-hand-pointer-o fa-2x" ></i>',
	title: '属性选择',
    interaction: select
});
	
editbar.addControl ( attrSelect );


var burstingselect = new ol.interaction.Select({
	  condition: ol.events.condition.click,
	  //对选择进行过滤处理  
	  filter: function(feature, layer){
		  if(!feature.values_.className)
			  return false;
		  return true;
      }
});

var burstingAnalysis = new ol.control.Toggle({	
    html: '<i class="fa fa-podcast fa-2x" >alkdsjfeioeuqwr</i>',
	title: '爆管分析',
    interaction: burstingselect
});

var timerTask = null;
burstingselect.on('select', function(e) {
	var feature = e.selected[0];
	if(feature && feature.values_.className){
		if(timerTask)
			clearInterval(timerTask);
		var bounce = 5;
		var a = (2*bounce+1) * Math.PI/2;
		var b = -0.01;
		var c = -Math.cos(a) * Math.pow(2, b);
		ol.easing.bounce = function(t)
		{	t = 1-Math.cos(t*Math.PI/2);
			return (1 + Math.abs( Math.cos(a*t) ) * Math.pow(2, b*t) + c*t)/2;
		}
		
		timerTask = setInterval(function(){
				var f = new ol.Feature (new ol.geom.Point(e.mapBrowserEvent.coordinate));
				f.setStyle (new ol.style.Style({	
				   image: new ol.style.Circle({
							radius: 20, 
							points: 10,
							stroke: new ol.style.Stroke ({ color: 'red', width:2 })
					})
				}));
				var a = map.animateFeature(f, new ol.featureAnimation.Zoom({	
					fade: ol.easing.easeOut, 
					duration:3000, 
					easing: ol.easing.easeOut 
				}));
		}, 800);
		burstingAnalysis(feature.values_.id);
	}
});


burstingselect.on('change:active', function(data){
      if(timerTask)
		 clearInterval(timerTask);

});

editbar.addControl ( burstingAnalysis );

// Add editing tools
var zoomOut = new ol.control.Toggle({	
    html: '+',
	title: '放大',
	interaction: new ol.interaction.DragZoom({
        condition: ol.events.condition.always,
        out: false // 此处为设置拉框完成时放大还是缩小
    })
});

var zoomIn = new ol.control.Toggle({	
    html: '-',
	title: '缩小',
	interaction: new ol.interaction.DragZoom({
        condition: ol.events.condition.always,
        out: true // 此处为设置拉框完成时放大还是缩小
    })
});

var pan = new ol.control.Toggle({	
    html: '<i class="fa fa-hand-paper-o fa-2x" ></i>',
	title: '平移',
	interaction: new ol.interaction.DragPan()
});

var cadExportInteraction = new ol.interaction.Draw({
	type: 'LineString',
	source: new ol.source.Vector(),
	geometryFunction: function(coordinates, geometry) {
		if (!geometry) {
			geometry = new ol.geom.Polygon(null);
		}
		var start = coordinates[0];
		var end = coordinates[1];
		geometry.setCoordinates([
			[start, [start[0], end[1]], end, [end[0], start[1]], start]
		]);
		return geometry;
	},
	snapTolerance:0,
	maxPoints: 2
});

function cadMode(e, isPlugin) {
	Ext.Msg.show({  
		modal:true,  
		title:"CAD出图",  
		msg:"正在出图中,请稍后...",  
		closable:false,  
		width:300,  
		wait:true  
      });
	
	  var coords = e.feature.getGeometry().getCoordinates();
	  var leftTop = ol.proj.toLonLat(coords[0][0], "EPSG:3857");
	  var rightBottom = ol.proj.toLonLat(coords[0][2], "EPSG:3857");
	  
	  var lys = "";
	  for(var i=0; i<layers.array_.length; i++) {
		  var ly = layers.array_[i];
		  if(ly instanceof pipeLineAppLayer) {
			  if(ly.layer.getVisible()) {
				  lys += 'sx_gs_' + ly.type_ + ",";
			  }
		  }
	  };
	  
	  lys +="sx_gs_ws_pipe,";
	  
	  for(var i=0; i<layers1.array_.length; i++) {
		  var ly = layers1.array_[i];
		  if(ly.getVisible()) {
			  lys += ly.layerName_ + ",";
		  }
	  };
	  
	  var lineLabels = "";
	  var source = pipe_layer_32.layer.getSource();
	  var features = source.getFeatures();
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
					  
				if(length >= 50) {
					lineLabels += feature.values_.id+",";
				}
			}
		}
	  }
	  
	  var zoom = map.getView().getZoom();
	  $.ajax({
		url: 'cadExport',
		//data: "left="+leftTop[0]+"&top=" + leftTop[1]+"&rigth=" + rightBottom[0]+"&bottom=" + rightBottom[1]+"&layerNames="+lys+"&labels=" + labels+ "&zoom=" + zoom,
		data: "left="+leftTop[0]+"&top=" + leftTop[1]+"&rigth=" + rightBottom[0]+"&bottom=" + rightBottom[1]+"&layerNames="+lys+"&zoom=" + zoom+"&labels="+lineLabels+"&mark="+isPlugin,
		type: 'POST',
		success: function(res){
			Ext.Msg.hide();

            var form = $("<form>"); 
			form.attr("style", "display:none");  
			form.attr("target", "");  
			form.attr("method", "post");  
			form.attr("action", "downDxf");  
			var input = $("<input>");  
			input.attr("type", "hidden");  
			input.attr("name", "fileName");  
			input.attr("value", res);  
			$("body").append(form); 
			form.append(input);  
			form.submit();			
		}
	  });
	
}

cadExportInteraction.on('drawend', function(e) {

	Ext.MessageBox.confirm("提示", "是否要带插件方式出图", function (btnId) {  
		if (btnId == "yes") {  
			 cadMode(e, 0); 
		}  
		else if (btnId == "no") {  
			cadMode(e, 1); 
		}
	}); 

});

var cadExport = new ol.control.Toggle({	
    html: '<i class="fa fa-file-pdf-o fa-2x" ></i>',
	title: 'CAD出图',
	interaction: cadExportInteraction
});


var measure = new ol.control.Toggle({	
    html: '<i class="fa fa-hand-paper-o fa-2x" ></i>',
	title: '测量',
	interaction: new ol.interaction.measureInteraction({
	})
});

editbar.addControl ( cadExport );
editbar.addControl ( zoomOut );
editbar.addControl ( zoomIn );
editbar.addControl ( pan );
editbar.addControl ( new ol.control.FullScreen() );

//editbar.addControl ( measure );


//阀门
var valve_img_src = $ctx + '/img/Icon_WsValve.png';
var valve_style = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
		src: valve_img_src
	}))
});

//消防栓
var fire_hydrant_img_src = $ctx + '/img/ws_fire_hydrant.png';
var fire_hydrant_style = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
		src: fire_hydrant_img_src
	}))
});

//阀门井
var valve_well_img_src = $ctx + '/img/valveWell.png';
var valve_well_style = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
		src: valve_well_img_src
	}))
});

//水表井
var water_well_img_src = $ctx + '/img/WaterMeterWell.png';
var water_well_style = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
		src: water_well_img_src
	}))
});

//流量计
var flow_meter_img_src = $ctx + '/img/ws_flow_meter.png';
var flow_meter_style = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
		src: flow_meter_img_src
	}))
});

var pipe_layer_32 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : '管线层',
	isLabel: false,
	style : pipe_line_style
});
/*
var pipe_layer_32 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN32',
	condition : 'caliber=32',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_50 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN50',
	condition : 'caliber=50',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_63 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN32',
	condition : 'caliber=32',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_80 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN80',
	condition : 'caliber=80',
	isLabel: true,
	style : pipe_line_style
});


var pipe_layer_90 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN90',
	condition : 'caliber=90',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_100 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN100',
	condition : 'caliber=100',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_110 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN110',
	condition : 'caliber=110',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_150 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN150',
	condition : 'caliber=150',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_160 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN160',
	condition : 'caliber=160',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_200 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN200',
	condition : 'caliber=200',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_225 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN225',
	condition : 'caliber=225',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_300 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN300',
	condition : 'caliber=300',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_400 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN400',
	condition : 'caliber=400',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_500 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN500',
	condition : 'caliber=500',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_600 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN600',
	condition : 'caliber=600',
	isLabel: true,
	style : pipe_line_style
});

var pipe_layer_800 = new pipeLineAppLayer({
	type : 'ws_pipe',
	name : 'DN800',
	condition : 'caliber=800',
	isLabel: true,
	style : pipe_line_style
});

var pipe_line_group1 = new pipeLineAppLayerGroup({
	name: '口径',
	groups: [pipe_layer_32,pipe_layer_50,pipe_layer_63,pipe_layer_80,
	         pipe_layer_90,pipe_layer_100,pipe_layer_110,
			 pipe_layer_150,pipe_layer_160,pipe_layer_200,pipe_layer_225,
			 pipe_layer_300,pipe_layer_400,pipe_layer_500,pipe_layer_600,
			 pipe_layer_800]
});


var pipe_line_group2 = new pipeLineAppLayerGroup({
	name: '管线层',
	groups: [pipe_line_group1]
});
*/


var valve_layer = new pipeLineAppLayer({
	type : 'ws_valve',
	name : '阀门层',
	minZoom : 15,
	isRotate : true,
	style : valve_style
});

var fire_hydrant_layer = new pipeLineAppLayer({
	type : 'ws_fire_hydrant',
	name : '消防栓层',
	minZoom : 15,
	style : fire_hydrant_style
});


var valve_well_layer = new pipeLineAppLayer({
	type : 'ws_valve_well',
	name : '阀门井层',
	minZoom : 16,
	style : valve_well_style
});

var water_well_layer = new pipeLineAppLayer({
	type : 'ws_watermeter_basin',
	name : '水表井层',
	minZoom : 16,
	style : water_well_style
});

var flow_meter_layer = new pipeLineAppLayer({
	type : 'ws_flow_meter',
	name : '流量计层',
	minZoom : 16,
	style : flow_meter_style
});

var layers = new ol.Collection();
//layers.push(pipe_line_group2);

layers.push(pipe_layer_32);
// layers.push(valve_layer);
// layers.push(fire_hydrant_layer);
// layers.push(valve_well_layer);
// layers.push(water_well_layer);
layers.push(flow_meter_layer);






//dlzxc
var dlzxc_layer = new ol.layer.SXZDT({
	layerName : 'dlzxc',
	name:'道路中线层',
	minZoom : 15
});


var dmxc_layer = new ol.layer.SXZDT({
	layerName : 'dmxc',
	name:'地貌线层',
	minZoom : 18
});

var fzxc_layer = new ol.layer.SXZDT({
	layerName : 'fzxc',
	name:'辅助线层',
	minZoom : 18
});

var jmdxc_layer = new ol.layer.SXZDT({
	layerName : 'jmdxc',
	name:'居民地线层',
	minZoom : 18
});

var jtxc_layer = new ol.layer.SXZDT({
	layerName : 'jtxc',
	name:'交通线层',
	minZoom : 15
});


var mczjc_layer = new ol.layer.SXZDT({
	layerName : 'mczjc',
	name:'名称注记层',
	isDimText : true,
	minZoom : 18
});


var sxxc_layer = new ol.layer.SXZDT({
	layerName : 'sxxc',
	name:'水系线层',
	minZoom : 16
});


var sxzxc_layer = new ol.layer.SXZDT({
	layerName : 'sxzxc',
	name:'水系中线层',
	minZoom : 16
});

var zbxc_layer = new ol.layer.SXZDT({
	layerName : 'zbxc',
	name:'植被线层',
	minZoom : 16
});


var jtmc_layer = new ol.layer.SXZDT({
	layerName : 'jtmc',
	name:'交通面层',
	minZoom : 18
});

var jmdmc_layer = new ol.layer.SXZDT({
	layerName : 'jmdmc',
	name:'居民地面层',
	minZoom : 19
});

var sxmc_layer = new ol.layer.SXZDT({
	layerName : 'sxmc',
	name:'水系面层',
	minZoom : 18
});

var sxzxc_layer = new ol.layer.SXZDT({
	layerName : 'sxzxc',
	name:'水系中线层',
	minZoom : 16
});

var layers1 = new ol.Collection();

// layers1.push(dmxc_layer);
// layers1.push(fzxc_layer);
// layers1.push(jtxc_layer);
// layers1.push(sxxc_layer);
// layers1.push(zbxc_layer);
// layers1.push(dlzxc_layer);
// layers1.push(jmdxc_layer);
// layers1.push(sxzxc_layer);
// layers1.push(mczjc_layer);
// layers1.push(jtmc_layer);
// layers1.push(jmdmc_layer);
// layers1.push(sxmc_layer);
// layers1.push(sxzxc_layer);


var temp = new ol.Collection();
var layercontrol = new ol.control.layerControl({
	tipLabel: 'Légende',
	layerSwitch : layerswitch,
	layers : layers,
	layers1 :  layers1
});

/*
var p = new Array();
p.push([13185654.908791903,3490258.030929182]);
p.push([13186858.791987395,3486531.72580028]);
p.push([13189113.684321808,3490086.0476155407]);
p.push([13186954.338272752,3491289.930811032]);
p.push([13185349.160678763,3488691.0718493364]);

var polyCoords = new Array();

polyCoords.push(p);


var polyFeature = new ol.Feature({
	geometry: new ol.geom.Polygon(polyCoords, ol.geom.GeometryLayout.XY),
	name: 'My Polygon'
});
dlzxc_layer.getSource().addFeature(polyFeature);
*/


map.addControl(layercontrol);
mainbar.setPosition("bottom");


var map_mark_src = $ctx + '/img/map_mark.png';
var map_mark_style = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
		src: map_mark_src
	}))
});

var mark_layer = new ol.layer.Vector({
	source : new ol.source.Vector(),
	style : map_mark_style
});
var mark_feature = new ol.Feature({
	geometry: new ol.geom.Point(new ol.proj.transform(center,"EPSG:4326","EPSG:3857"))
});
mark_layer.getSource().addFeature(mark_feature);
mark_layer.setMap(map);
mark_layer.setVisible(false);

function fitToNode(id, className) {
	mark_layer.setVisible(true);
	$.ajax({
		url: 'fixToNode',
		data: "id="+id+"&className=" + className ,
		type: 'GET',
		success: function(res){
			var geojsonObject = Ext.util.JSON.decode(res);
			var features = (new ol.format.GeoJSON()).readFeatures(geojsonObject);
			if(features[0].getGeometry() instanceof ol.geom.LineString){
				var x = (features[0].values_.geometry.flatCoordinates[0] + features[0].values_.geometry.flatCoordinates[2]) /2;
				var y = (features[0].values_.geometry.flatCoordinates[1] + features[0].values_.geometry.flatCoordinates[3]) /2;
				mark_feature.setGeometry(new ol.geom.Point([x,y]));
			}
			else{
				mark_feature.setGeometry(features[0].getGeometry());
			}
			
			map.getView().fit(features[0].getGeometry(), map.getSize());
		}
	});
}

/*
map.on('singleclick',function(e){
	  var current_point = e.coordinate;
	  mark_feature.setGeometry(new ol.geom.Point(current_point));
	  var collapsed =  $("#panorama").panel('options').collapsed;
	  if(collapsed)
		  return;
	  load_mask = layer.load(0, {shade: false});
	  setTimeout(function(){
		    var p1 = new ol.proj.transform(current_point,"EPSG:3857","EPSG:4326");
		    var ggPoint = new BMap.Point(p1[0],p1[1]);
			var convertor = new BMap.Convertor();
			var pointArr = [];
			pointArr.push(ggPoint);
			convertor.translate(pointArr, 1, 5, function(data){
				panoramaService.getPanoramaByLocation(data.points[0], function(ponit){
					if (ponit == null) {
						panorama.hide();
						layer.msg('当前区域无数据');
					}else{
						panorama.show();
						panorama.setPosition(data.points[0]);
					}
                    layer.close(load_mask);				
				});
			});
    }, 1000);
});


var oldCenterValue = map.getView().getCenter();
map.on('moveend',function(e){
	  var current_point = map.getView().getCenter();
	  if(oldCenterValue == current_point)
		  return;
	  
	  oldCenterValue = current_point;
	  mark_feature.setGeometry(new ol.geom.Point(current_point));
	  
	  var collapsed =  $("#panorama").panel('options').collapsed;
	  if(collapsed)
		  return;
	  
	  load_mask = layer.load(0, {shade: false});
	  setTimeout(function(){
		    var p1 = new ol.proj.transform(current_point,"EPSG:3857","EPSG:4326");
		    var ggPoint = new BMap.Point(p1[0],p1[1]);
			var convertor = new BMap.Convertor();
			var pointArr = [];
			pointArr.push(ggPoint);
			convertor.translate(pointArr, 1, 5, function(data){
				panoramaService.getPanoramaByLocation(data.points[0], function(ponit){
					if (ponit == null){
					   layer.msg('当前区域无地图数据');
					   panorama.hide();
					}else{
						panorama.show();
						panorama.setPosition(data.points[0]);
					}
                    layer.close(load_mask);				
				});
			});
     }, 1000);
});
*/

