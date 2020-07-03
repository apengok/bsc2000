var map = null;
var map_hot = null;
var NodeTypeList = [];
var markerInfoWindow = null;
var markerList = [];

var heatmapData = [];
var heatmap = null;
var hot_show = true;
var districtSearch = null;

var ws_pipe_show = true;
var ws_pipe_lines = [];

var ws_valve_show = true;
var ws_valve_marks = [];

$(function(){
	
	//重新读取下
	load_setting();
	
	//AMRS_ROOT_PATH = "http://220.179.118.150:8082/amrs";
	//H5_ROOT_PATH = "http://220.179.118.150:8082/h5";
	//ROOT_PATH = "http://220.179.118.150:8082";
	
	//esc关闭layer
	document.onkeydown = function (event)
	{
	  var e = event || window.event || arguments.callee.caller.arguments[0];
	  var keyCode = e.keyCode || e.which;
	  if (keyCode == "27")
	  {
		  layer.closeAll();
	  }
	}
	
	map = new AMap.Map('container', {
					resizeEnable: true,
					zoom:13,
					expandZoomRange:true,
					zooms:[10,20],
					center: [128.438992,19.877615]
				});	
				
	map.plugin(["AMap.Heatmap"],function() {      //加载热力图插件
		
		 heatmap = new AMap.Heatmap(map, {
            radius: 25, //给定半径
            opacity: [0, 0.7]
            /*,gradient:{
             0.5: 'blue',
             0.65: 'rgb(117,211,248)',
             0.7: 'rgb(0, 255, 0)',
             0.9: '#ffea00',
             1.0: 'red'
             }*/
        });
		
	}); 			
				
	$(".markerFiltermarkerFilter").hide();
	$("#level_tool").mouseover(function(){
	  $(".markerFilter").show();
	});
	
	$(".markerFilter").mouseleave(function(){
	  $(".markerFilter").hide();
	});

				
	//'bg','road','building','point'			
	//map.setFeatures(['bg','road','building']);		
	
	//map.setMapStyle('amap://styles/darkblue');
	
	var arr = new Array();
	arr.push(new AMap.LngLat("117.543454","29.350001"));
	arr.push(new AMap.LngLat("119.385027","30.418026"));
	map.setLimitBounds(new AMap.Bounds(arr[0],arr[1]));

	//画歙县的镂空图
	AMapUI.loadUI(['geo/DistrictExplorer'], function(DistrictExplorer) {
		
		 var opts = {
			subdistrict: 1,   //返回下一级行政区
			extensions: 'all',  //返回行政区边界坐标组等具体信息
			level: 'city'  //查询行政级别为 市
		};
	
		//实例化DistrictSearch
		districtSearch = new AMap.DistrictSearch(opts);
		districtSearch.setLevel('district');
		//行政区查询
		districtSearch.search('歙县', function(status, result) {
			bounds = result.districtList[0].boundaries;
			initPage(DistrictExplorer);			
		});
	});  	
	
	//请求中点坐标
	$.ajax({
        type:"GET",url:AMRS_ROOT_PATH + "/param?action=getMapInfo" , 
        dataType: "jsonp",
       // data:{customer_id:customer_id},
        success:function(json){
            if(json.ret==10001)
            {			
				//更新中心点
				var Lng = json.Lng;
				var Lat = json.Lat;
				if(json.CoorType)
				{
					//坐标进行转换
					if(json.CoorType == "BD-09")
					{
						var dd = bd09togcj02(parseFloat(Lng),parseFloat(Lat));
						Lng = dd[0];
						Lat = dd[1];
					}
					else if(json.CoorType == "WGS84")
					{
						var dd = wgs84togcj02(parseFloat(Lng),parseFloat(Lat));
						Lng = dd[0];
						Lat = dd[1];
					}
				}
				
				//json.Zoom
				var zoom = 11;
				var Lng = 118.529519;
				var Lat = 29.844315;
				
				map.setZoomAndCenter(zoom, [Lng, Lat]);
				
				//缩放事件
				map.on("zoomchange",function(){  
            		dealMarkerShow();
				}); 
            }
        }
    });
	

	
	//自定义窗体
	markerInfoWindow = new AMap.InfoWindow({
		offset: new AMap.Pixel(0, 0),
		autoMove: true
	});
	
	//地图加载完成
	map.on('complete', function() {
        //加载节点类型
		$.ajax( {  
			url:H5_ROOT_PATH + "/pipemapnode?action=getMapNodeTypeList",
			type:'get',			
			dataType:'jsonp',
			success:function(json) {
				
				NodeTypeList = json.rows;
				
				NodeTypeList[0].show = false;
				NodeTypeList[1].show = false;
				NodeTypeList[2].show = true;
				NodeTypeList[3].show = true;
				NodeTypeList[4].show = true;
				
				getMapList();
			}
		});
    });
	
	
	
	//定时刷新 10分钟
	//setInterval(function() {getMapList()}, 10*60*1000);

	$("#xfs").click(function(){
		
		if(NodeTypeList[0].show)
		{
			NodeTypeList[0].show = false;
			$("#xfs").addClass("nocheck");
			$(".IXFS").addClass("nocheck");
			$("#item_xfs").hide();
		}
		else
		{
			NodeTypeList[0].show = true;
			$("#xfs").removeClass("nocheck");
			$(".IXFS").removeClass("nocheck");
			$("#item_xfs").show();
		}
		//处理显示
		dealMarkerShow();
	});
	
	$("#sz").click(function(){
		
		if(NodeTypeList[1].show)
		{
			NodeTypeList[1].show = false;
			$("#sz").addClass("nocheck");
			$(".ISZ").addClass("nocheck");
			$("#item_sz").hide();
		}
		else
		{
			NodeTypeList[1].show = true;
			$("#sz").removeClass("nocheck");
			$(".ISZ").removeClass("nocheck");
			$("#item_sz").show();
		}
		//处理显示
		dealMarkerShow();
	});
	
	$("#eg").click(function(){
		
		if(NodeTypeList[2].show)
		{
			NodeTypeList[2].show = false;
			$("#eg").addClass("nocheck");
			$(".IEG").addClass("nocheck");
			$("#item_eg").hide();
		}
		else
		{
			NodeTypeList[2].show = true;
			$("#eg").removeClass("nocheck");
			$(".IEG").removeClass("nocheck");
			$("#item_eg").show();
		}
		//处理显示
		dealMarkerShow();
	});
	
	$("#ll").click(function(){
		
		if(NodeTypeList[3].show)
		{
			NodeTypeList[3].show = false;
			$("#ll").addClass("nocheck");
			$(".ILL").addClass("nocheck");
			$("#item_ll").hide();
		}
		else
		{
			NodeTypeList[3].show = true;
			$("#ll").removeClass("nocheck");
			$(".ILL").removeClass("nocheck");
			$("#item_ll").show();
		}
		//处理显示
		dealMarkerShow();
	});
	
	$("#yl").click(function(){
		
		if(NodeTypeList[4].show)
		{
			NodeTypeList[4].show = false;
			$("#yl").addClass("nocheck");
			$(".IYL").addClass("nocheck");
			$("#item_yl").hide();
		}
		else
		{
			NodeTypeList[4].show = true;
			$("#yl").removeClass("nocheck");
			$(".IYL").removeClass("nocheck");
			$("#item_yl").show();
		}
		//处理显示
		dealMarkerShow();
	});
	
	$("#hot").click(function(){
		
		if(hot_show)
		{
			hot_show = false;
			$("#hot").addClass("nocheck");
			$(".IHOT").addClass("nocheck");
			heatmap.hide();
		}
		else
		{
			hot_show = true;
			$("#hot").removeClass("nocheck");
			$(".IHOT").removeClass("nocheck");
			heatmap.show();
		}
	});
	
	$("#gw").click(function(){
		
		if(ws_pipe_show)
		{
			ws_pipe_show = false;
			$("#gw").addClass("nocheck");
			$(".IGW").addClass("nocheck");
		}
		else
		{
			ws_pipe_show = true;
			$("#gw").removeClass("nocheck");
			$(".IGW").removeClass("nocheck");
		}
		//处理显示
		dealWsPipeShow();
	});
	
	$("#fm").click(function(){
		
		if(ws_valve_show)
		{
			ws_valve_show = false;
			$("#fm").addClass("nocheck");
			$(".IFM").addClass("nocheck");
		}
		else
		{
			ws_valve_show = true;
			$("#fm").removeClass("nocheck");
			$(".IFM").removeClass("nocheck");
		}
		//处理显示
		dealWsValveShow();
	});
	
	
	$(".searchTool").click(function(){
		
		if($("#tipMap").is(":hidden")){
			$("#tipMap").show();
			$("#tipMap").css('right', '-300px');
			$("#tipMap").animate({"right": "+=350px"}, "fast");
		}
		else{
			$("#tipMap").animate({"right": "-=350px"}, "fast",function(){
				$("#tipMap").hide();
			});
		}
		
	});
	
	//全屏
	function isFullscreen(){
		return document.fullscreenElement    ||
			   document.msFullscreenElement  ||
			   document.mozFullScreenElement ||
			   document.webkitFullscreenElement || false;
	}
	
	$('.fullTool').on('click', function() {
		
		//判断当前是否全屏
		if(isFullscreen())
		{
			if (document.exitFullscreen) {  
				document.exitFullscreen();  
			}  
			else if (document.mozCancelFullScreen) {  
				document.mozCancelFullScreen();  
			}  
			else if (document.webkitCancelFullScreen) {  
				document.webkitCancelFullScreen();  
			}
			else if (document.msExitFullscreen) {
				  document.msExitFullscreen();
			}
		}
		else
		{
			var docElm = document.documentElement;
			//W3C  
			if (docElm.requestFullscreen) {  
				docElm.requestFullscreen();  
			}
			//FireFox  
			else if (docElm.mozRequestFullScreen) {  
				docElm.mozRequestFullScreen();  
			}
			//Chrome等  
			else if (docElm.webkitRequestFullScreen) {  
				docElm.webkitRequestFullScreen();  
			}
			//IE11
			else if (elem.msRequestFullscreen) {
			  elem.msRequestFullscreen();
			}
		}
	});
	
	//数据可见
	$(".visibleTool").click(function(){
		
		if($(".leftData").is(":hidden")){
			$(".leftData").show(100);
		}
		else{
			$(".leftData").hide(100);
		}
		
	});
	
	//滚动条
	panoramBoxScroll();
	
	//定位 类型的 
    dingweiListClick();
	
	//查询按钮
	$('.searchBtn').click(function () {
		searchBtnFn();
	});
	
	//刷新左侧列表数据
	dealLeftData();
	
	//全部展开,配合selected:false,使用
	setTimeout( function()
	{
		$(".easyui-accordion .panel-header").click();
	}, 100 );
});

function dealHotMap()
{
	heatmapData.length = 0;
	
	for(var i in markerList)
	{
		var marker = markerList[i];
		var item = marker.getExtData().item;
		var nodetype = NodeTypeList[item.NodeType];
		
		//找压力
		var pressval = 0;
		if(item.Prop1Show && nodetype.Prop1.indexOf('压力') != -1)
		{
			if(item.Prop1Value != "")
			{
				var txt = Number(item.Prop1Value).toFixed(2);
				if(txt > pressval)
					pressval = txt;
			}
		}
		
		if(item.Prop2Show && nodetype.Prop2.indexOf('压力') != -1)
		{
			if(item.Prop2Value != "")
			{
				var txt = Number(item.Prop2Value).toFixed(2);
				if(txt > pressval)
					pressval = txt;
			}
		}
		
		if(item.Prop3Show && nodetype.Prop3.indexOf('压力') != -1)
		{
			if(item.Prop3Value != "")
			{
				var txt = Number(item.Prop3Value).toFixed(2);
				if(txt > pressval)
					pressval = txt;
			}
		}
		
		if(item.Prop4Show && nodetype.Prop4.indexOf('压力') != -1)
		{
			if(item.Prop4Value != "")
			{
				var txt = Number(item.Prop4Value).toFixed(2);
				if(txt > pressval)
					pressval = txt;
			}
		}
		
		if(item.Prop5Show && nodetype.Prop5.indexOf('压力') != -1)
		{
			if(item.Prop5Value != "")
			{
				var txt = Number(item.Prop5Value).toFixed(2);
				if(txt > pressval)
					pressval = txt;
			}
		}
		
		if(item.Prop6Show && nodetype.Prop6.indexOf('压力') != -1)
		{
			if(item.Prop6Value != "")
			{
				var txt = Number(item.Prop6Value).toFixed(2);
				if(txt > pressval)
					pressval = txt;
			}
		}
		
		if(item.Prop7Show && nodetype.Prop7.indexOf('压力') != -1)
		{
			if(item.Prop7Value != "")
			{
				var txt = Number(item.Prop7Value).toFixed(2);
				if(txt > pressval)
					pressval = txt;
			}
		}
		
		if(item.Prop8Show && nodetype.Prop8.indexOf('压力') != -1)
		{
			if(item.Prop8Value != "")
			{
				var txt = Number(item.Prop8Value).toFixed(2);
				if(txt > pressval)
					pressval = txt;
			}
		}
		
		if(item.Prop9Show && nodetype.Prop9.indexOf('压力') != -1)
		{
			if(item.Prop9Value != "")
			{
				var txt = Number(item.Prop9Value).toFixed(2);
				if(txt > pressval)
					pressval = txt;
			}
		}
		
		if(item.Prop10Show && nodetype.Prop10.indexOf('压力') != -1)
		{
			if(item.Prop10Value != "")
			{
				var txt = Number(item.Prop10Value).toFixed(2);
				if(txt > pressval)
					pressval = txt;
			}
		}
		
		if(pressval > 0)
		{
			heatmapData.push({
				lng: item.Lng,
				lat: item.Lat,
				count: pressval
			});
		}
	}
	
	//设置热力数据
	heatmap.setDataSet({data:heatmapData,max:"1"}); //设置热力图数据集
}

function getAllRings(feature) {

	var coords = feature.geometry.coordinates,
		rings = [];

	for (var i = 0, len = coords.length; i < len; i++) {
		rings.push(coords[i][0]);
	}

	return rings;
}

function getLongestRing(feature) {
	var rings = getAllRings(feature);

	rings.sort(function(a, b) {
		return b.length - a.length;
	});

	return rings[0];
}

function initPage(DistrictExplorer) {
	//创建一个实例
	var districtExplorer = new DistrictExplorer({
		map: map
	});

	 var countryCode = 100000, //全国
		provCodes = [
		],
		cityCodes = [
		];

	districtExplorer.loadMultiAreaNodes(
		//只需加载全国和市，全国的节点包含省级
		[countryCode].concat(cityCodes),
		function(error, areaNodes) {

			var countryNode = areaNodes[0],
				cityNodes = areaNodes.slice(1);

			var path = [];

			//首先放置背景区域，这里是大陆的边界
			path.push(getLongestRing(countryNode.getParentFeature()));


			for (var i = 0, len = provCodes.length; i < len; i++) {
				//逐个放置需要镂空的省级区域
				path.push.apply(path, getAllRings(countryNode.getSubFeatureByAdcode(provCodes[i])));
			}

			for (var i = 0, len = cityNodes.length; i < len; i++) {
				//逐个放置需要镂空的市级区域
				path.push.apply(path, getAllRings(cityNodes[i].getParentFeature()));
			}

			path.push(bounds[0]);
					
			//绘制带环多边形
			//http://lbs.amap.com/api/javascript-api/reference/overlay#Polygon
			var polygon = new AMap.Polygon({
				bubble: true,
				lineJoin: 'round',
				strokeColor: 'red', //线颜色
				strokeOpacity: 1, //线透明度
				strokeWeight: 1, //线宽
				fillColor: 'white', //填充色
				fillOpacity: 0.9, //填充透明度
				map: map,
				path: path
			});
			
		});
}
	
function drawWsPipe(ws_pipe_arr)
{	
	var nodes = [];
	for(var i in ws_pipe_arr)
	{		
		var pipe = ws_pipe_arr[i];
		var ws_pipe_path = new Array();
		
		var str = pipe.geometry;
		if(str == "")
			continue;
		
		var json = JSON.parse(str);
		//console.log(i);
		
		//WGS84
		var Lng1 = json.coordinates[0][0];
		var Lat1 = json.coordinates[0][1];
		var Lng2 = json.coordinates[1][0];
		var Lat2 = json.coordinates[1][1];
		
		var find = false;
		for(var j in nodes)
		{
			var n = nodes[j];
			if(n.lastLng == Lng1 && n.lastLat == Lat1 && n.area == pipe.area && n.caliber == pipe.caliber && n.material == pipe.material)
			{
				var point2 = [];
				point2[0] = Lng2;
				point2[1] = Lat2;
				n.path.push(point2);
				n.lastLng = Lng2;
				n.lastLat = Lat2;
				n.len += pipe.length;
				find = true;
				break;
			}
		}
		
		if(find == false)
		{
			var n = {};
			var point1 = [];
			point1[0] = Lng1;
			point1[1] = Lat1;
			
			var point2 = [];
			point2[0] = Lng2;
			point2[1] = Lat2;
			
			n.path = [];
			n.path.push(point1)
			n.path.push(point2)
			n.lastLng = Lng2;
			n.lastLat = Lat2;
			n.caliber = pipe.caliber;
			n.material = pipe.material;
			n.road = pipe.road;
			n.area = pipe.area;
			n.len = pipe.length;
			nodes.push(n);
		}
	}
	
	//画出来
	for(var i in nodes)
	{
		var n = nodes[i];
		var ws_pipe_path = new Array();
		
		for(var j in n.path)
		{
			var Lng = n.path[j][0];
			var Lat = n.path[j][1];
			var dd = wgs84togcj02(parseFloat(Lng),parseFloat(Lat));
			Lng = dd[0];
			Lat = dd[1];
			ws_pipe_path.push(new AMap.LngLat(Lng,Lat));
		}
		
		var polyline = new AMap.Polyline({
            path: ws_pipe_path,
            strokeColor: "#2f80e7",
            strokeOpacity: 1,
            strokeWeight: 2,
			strokeStyle:"solid", //线样式
			showDir: false,//是否显示箭头
			cursor:'help',
			extData: {
				item: n
			}
        });
		
		polyline.on("click", function (e) {
			markerInfoWindow.close();
			var item = e.target.getExtData().item;
			//查找同一区域的管网
			var road = item.road;
			var area = item.area;

			//统计
			var pipe_static = {};
			pipe_static.len = 0;
			pipe_static.caliber_arr = [];
			pipe_static.material_arr = [];
		
			for(var i in ws_pipe_lines)
			{
				var line = ws_pipe_lines[i];
				var pipe = line.getExtData().item;
				
				//区域一样
				if(pipe.area == area)
				{
					line.setOptions({'strokeColor':'red'});
					
					//统计
					pipe_static.len += pipe.len;
					var find = false;
					for(var j in pipe_static.caliber_arr)
					{
						if(pipe_static.caliber_arr[j].caliber == pipe.caliber)
						{
							pipe_static.caliber_arr[j].len += pipe.len; 
							find = true;
							break;
						}							
					}
					
					if(find == false)
					{
						var c = {};
						c.caliber = pipe.caliber;
						c.len = pipe.len;
						pipe_static.caliber_arr.push(c);
					}
					
					find = false;
					for(var j in pipe_static.material_arr)
					{
						if(pipe_static.material_arr[j].material == pipe.material)
						{
							pipe_static.material_arr[j].len += pipe.len; 
							find = true;
							break;
						}							
					}
					
					if(find == false)
					{
						var c = {};
						c.material = pipe.material;
						c.len = pipe.len;
						pipe_static.material_arr.push(c);
					}
				}
			}
			
			
			var position = e.lnglat;
			//动态内容显示
			var title = "管网";
		  
			var content = '<div class="power_title" id="info_title">' + title + '</div>';
			content += '<ul class="power_box">';
			content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>区域:</div><div class="number">' + item.area + '</div></li>';
			content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>总管网长度:</div><div class="number">' + parseInt(pipe_static.len) + '米</div></li>';
			
			
			var num = 0;
			var name = '';
			var c = "";
			for(var j in pipe_static.material_arr)
			{
				if(j == 0)
					name = '管网材质:';
				
				c += pipe_static.material_arr[j].material + '(' + parseInt(pipe_static.material_arr[j].len) + '米)';
				if(num == 4 || j == pipe_static.material_arr.length-1)
				{
					content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>' + name + '</div><div class="number">' + c + '</div></li>';	
					name = "";
					c = "";		
					num = 0;
				}
				else
				{
					c += " , "
					num++;
				}				
			}
			
			//排序
			function sequence(a,b){
				if (a.caliber>b.caliber) {
					return 1;
				}else{
					return 0;
				}
			}
			
			pipe_static.caliber_arr.sort(sequence);
			
			num = 0;
			name = '';
			c = "";
			for(var j in pipe_static.caliber_arr)
			{
				if(j == 0)
					name = '口径:';
				
				c += pipe_static.caliber_arr[j].caliber + '(' + parseInt(pipe_static.caliber_arr[j].len) + '米)';
				if(num == 4 || j == pipe_static.caliber_arr.length-1)
				{
					content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>' + name + '</div><div class="number">' + c + '</div></li>';	
					name = "";
					c = "";		
					num = 0;
				}
				else
				{
					c += " , "
					num++;
				}							
			}
			
			
			content += '</ul>';
			content += '</div>';
			$("#info_content").html(content);
			
			markerInfoWindow.setContent(content);
			markerInfoWindow.open(map,position);
			
			/*
			var item = e.target.getExtData().item;
			var msg = "lng1:" + item.path[0][0] + " lat1:" + item.path[0][1];
			msg += "  lng2:" + item.path[item.path.length-1][0] + " lat2:" + item.path[item.path.length-1][1];
			alert(msg);
			*/
		});
		
		polyline.on("mouseout", function (e) {
			markerInfoWindow.close();
			
			var item = e.target.getExtData().item;
			//查找同一区域的管网
			var road = item.road;
			var area = item.area;

			for(var i in ws_pipe_lines)
			{
				var line = ws_pipe_lines[i];
				var pipe = line.getExtData().item;
				if(pipe.area == area)
				{
					line.setOptions({'strokeColor':'#2f80e7'});
				}
			}
					
		});
		
		ws_pipe_lines.push(polyline);
	}

	/*
	for(var i in ws_pipe_arr)
	{		
		var pipe = ws_pipe_arr[i];
		var ws_pipe_path = new Array();
		
		var str = pipe.geometry;
		if(str == "")
			continue;
		
		var json = JSON.parse(str);
		//console.log(i);
		
		//WGS84
		var Lng = json.coordinates[0][0];
		var Lat = json.coordinates[0][1];
		var dd = wgs84togcj02(parseFloat(Lng),parseFloat(Lat));
		Lng = dd[0];
		Lat = dd[1];
		//start
		ws_pipe_path.push(new AMap.LngLat(Lng,Lat));
		
		Lng = json.coordinates[1][0];
		Lat = json.coordinates[1][1];
		dd = wgs84togcj02(parseFloat(Lng),parseFloat(Lat));
		Lng = dd[0];
		Lat = dd[1];
		//end
		ws_pipe_path.push(new AMap.LngLat(Lng,Lat));
		
		var polyline = new AMap.Polyline({
            path: ws_pipe_path,
            strokeColor: "#2f80e7",
            strokeOpacity: 1,
            strokeWeight: 2,
			strokeStyle:"solid", //线样式
        });
		
		ws_pipe_lines.push(polyline);
	}
	*/
}	
	
function dealWsPipeShow()
{
	for(var i in ws_pipe_lines)
	{
		if(ws_pipe_show)
			ws_pipe_lines[i].setMap(map);
		else
			ws_pipe_lines[i].setMap(null);
	}
}	

function drawWsValve(ws_valve_arr)
{	
	for(var i in ws_valve_arr)
	{		
		var valve = ws_valve_arr[i];
		
		var str = valve.geometry;
		if(str == "")
			continue;
		
		var json = JSON.parse(str);
		//console.log(i);
		
		//WGS84
		var Lng = json.coordinates[0];
		var Lat = json.coordinates[1];
		var dd = wgs84togcj02(parseFloat(Lng),parseFloat(Lat));
		Lng = dd[0];
		Lat = dd[1];
		
		var marker = new AMap.Marker({
			map: map,
			position: [Lng, Lat],
			topWhenClick: true,
			topWhenMouseOver: true,
			icon: addValveIcon(),
			offset:new AMap.Pixel(-5,-5),
			extData: {
				item: valve
			}
		});
		
		marker.on("mouseover", function (e) {
			
			var position = e.target.getPosition();
			var item = e.target.getExtData().item;
			//动态内容显示
			var title = "阀门";
		  
			var content = '<div class="power_title" id="info_title">' + title + '</div>';
			content += '<ul class="power_box">';
			content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>编号:</div><div class="number">' + item.industry_code + '</div></li>';
			content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>口径:</div><div class="number">' + item.caliber + '</div></li>';
			content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>材质:</div><div class="number">' + item.material + '</div></li>';
			content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>区域:</div><div class="number">' + item.area + '</div></li>';
			content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>道路:</div><div class="number">' + item.road + '</div></li>';
			
			content += '</ul>';
			content += '</div>';
			$("#info_content").html(content);
			
			markerInfoWindow.setContent(content);
			markerInfoWindow.open(map,position);

		});

		marker.on("mouseout", function (e) {
			//markerInfoWindow.close();
		});
		
		//marker.setTitle(valve.road);
		//marker.setMap(map);
		ws_valve_marks.push(marker);
	}
}	
	
function dealWsValveShow()
{
	for(var i in ws_valve_marks)
	{
		if(ws_valve_show)
			ws_valve_marks[i].setMap(map);
		else
			ws_valve_marks[i].setMap(null);
	}
}	


//高德的会自己缩小
function addValveIcon(item) {
	
    var img = "./img/famen.png";	
    return new AMap.Icon({
        size: new AMap.Size(16, 16),  //图标大小
		imageSize:new AMap.Size(16,16),  //图标大小
        image: img
    })
}

//选择 选框 的 滚动条
function panoramBoxScroll() {
    $('.panoramaMainBox').mCustomScrollbar({
        scrollbarPosition: "inside",
        theme: "minimal-dark"
    });
	$(".panoramaMainBox").mCustomScrollbar("update");
}


//数据列表点击显示

function dingweiListClick(){
    $('.dingWeiBox .panoramaItemTitle').click(function () {
     
        if ($(this).hasClass('cur')) {
            $(this).next().hide();
            $(this).parent().siblings().find('.panoramaItemTitle').next().hide();
            $('.panoramaItemTitle').removeClass('cur');
        } else {
			$(this).parent().siblings().find('.panoramaItemTitle').removeClass('cur');
            $(this).parent().siblings().find('.panoramaItemTitle').next().hide();
            $(this).addClass('cur');
            $(this).next().show();
        }
       
    });
}

//搜索 按钮 点击事件  函数

function searchBtnFn() {
    var $searchTxt = $('.searchTxt').val();
    searchShowFn($searchTxt);
}

function searchShowFn(str) {
    if ($.trim(str) == '') {
       
        dingweiListShow();
        
    }
    else {
        dingweiListShow();
        var $len = $('.dingWeiBox .itemContentItem').length;
        //alert($len);
        for (var i = 0; i < $len; i++) 
		{
            if ($('.dingWeiBox .itemContentItem').eq(i).html().indexOf(str) == -1) 
			{
                $('.dingWeiBox .itemContentItem').eq(i).hide();
                if ($('.dingWeiBox .itemContentItem').eq(i).parent().html().indexOf(str) == -1) 
				{
                    //$('.dingWeiBox .itemContentItem').eq(i).parent().parent().hide();
                }
            }
        }
    }
	
	//统计个数
	var $len = $('.dingWeiBox .panoramaItem').length;
	for (var i = 0; i < $len; i++) 
	{
		var t = $('.dingWeiBox .panoramaItem').eq(i);
		var num = t.find("li").length;
		var cnt = num;
		if($.trim(str) != '')
		{
			for (var j = 0; j < num; j++) 
			{
				if (t.find(".itemContentItem").eq(j).html().indexOf(str) == -1) 
					cnt--; 
			}
		}
		
		t.find(".badge_number").html(cnt);
	}
}


//数据列表加载函数
function dingweiListShow() {

	var html_xfs = "";
	var html_sz = "";
	var html_eg = "";
	var html_ll = "";
	var html_yl = "";
	
	
	//直接查找类型
	for(var i in markerList)
	{
		var marker = markerList[i];
		var item = marker.getExtData().item;

		if(item.NodeType == "0")
		{
			html_xfs += '<li class="itemContentItem" name="' + item.Name + '" nodetype="' + item.NodeType + '">' + 
							'<div class="contentCenter">' + 
								'<div class="contentCenterItem">' + 
									'<span class="picBox picBox"></span>' + 
									'<span class="txtBox">' + item.Name + '</span>' +
								'</div>' + 
							'</div>' + 	
						'</li>';
		}
		else if(item.NodeType == "1")
		{
			html_sz += '<li class="itemContentItem" name="' + item.Name + '" nodetype="' + item.NodeType + '">' + 
							'<div class="contentCenter">' + 
								'<div class="contentCenterItem">' + 
									'<span class="picBox picBox"></span>' + 
									'<span class="txtBox">' + item.Name + '</span>' +
								'</div>' + 
							'</div>' + 	
						'</li>';
		}
		else if(item.NodeType == "2")
		{
			html_eg += '<li class="itemContentItem" name="' + item.Name + '" nodetype="' + item.NodeType + '">' + 
							'<div class="contentCenter">' + 
								'<div class="contentCenterItem">' + 
									'<span class="picBox picBox"></span>' + 
									'<span class="txtBox">' + item.Name + '</span>' +
								'</div>' + 
							'</div>' + 	
						'</li>';
		}
		else if(item.NodeType == "3")
		{
			html_ll += '<li class="itemContentItem" name="' + item.Name + '" nodetype="' + item.NodeType + '">' + 
							'<div class="contentCenter">' + 
								'<div class="contentCenterItem">' + 
									'<span class="picBox picBox"></span>' + 
									'<span class="txtBox">' + item.Name + '</span>' +
								'</div>' + 
							'</div>' + 	
						'</li>';
		}
		else if(item.NodeType == "4")
		{
			html_yl += '<li class="itemContentItem" name="' + item.Name + '" nodetype="' + item.NodeType + '">' + 
							'<div class="contentCenter">' + 
								'<div class="contentCenterItem">' + 
									'<span class="picBox picBox"></span>' + 
									'<span class="txtBox">' + item.Name + '</span>' +
								'</div>' + 
							'</div>' + 	
						'</li>';
		}
	}
	
	$('#ul_xfs').html(html_xfs);
	$('#ul_sz').html(html_sz);
	$('#ul_eg').html(html_eg);
	$('#ul_ll').html(html_ll);
	$('#ul_yl').html(html_yl);
	
    //点击定位到 位置
    clickToDingwei();
}


//点击 快速定位到   所选 地点位置

function clickToDingwei() {
   
    $('body').delegate('.dingWeiBox .itemContentItem', 'click', function () {
				
		for(var i in markerList)
		{
			var marker = markerList[i];
			var item = marker.getExtData().item;

			if(item.NodeType == $(this).attr('nodetype') && item.Name == $(this).attr('name'))
			{
				//隐藏提示
				markerInfoWindow.close();
				
				map.setCenter(marker.getPosition());
				
				//异步函数
				(function(){
					var _marker = marker;
					_marker.setAnimation("AMAP_ANIMATION_BOUNCE");
					setTimeout(function () {
						_marker.setAnimation("AMAP_ANIMATION_NONE");
						
						//显示提示
						getContentMarkerInfo( _marker.getExtData().item,_marker.getPosition());
						
					}, 1200);//2400
				})();
				
				
				
				return;
			}
		}
    });
}	
	
function dealMarkerShow()
{
	var zoom = map.getZoom();
		
	//直接查找类型
	for(var i in markerList)
	{
		var marker = markerList[i];
		var item = marker.getExtData().item;

		if(NodeTypeList[item.NodeType].show)
		{
			if(item.ZoomMin>zoom)
			{
				marker.setIcon(z16Icon(item));
				marker.setOffset(new AMap.Pixel(-5,-5));
				marker.setMap(map);
				
				if(item.NodeType == "4" || item.NodeType == "3" || item.NodeType == "2")
					marker.valMarker.setMap(null);
			}
			else
			{
				marker.setIcon(addIcon(item));
				marker.setOffset(new AMap.Pixel(-16,-32));
				marker.setMap(map);
				
				if(item.NodeType == "4" || item.NodeType == "3" || item.NodeType == "2")
					marker.valMarker.setMap(map);
			}
		}
		else
		{
			marker.setMap(null);
			
			if(item.NodeType == "4" || item.NodeType == "3" || item.NodeType == "2")
				marker.valMarker.setMap(null);
		}
	}
}
	
function getMapList() 
{	
	$.ajax({
        type:"GET",url:H5_ROOT_PATH + "/pipemapnode?action=getMapNodeRealList" , 
        dataType: "jsonp",
        success:function(json){
            if(json.ret==10001)
            {		
				//清除原来的
				//map.clearMap();
				
				//markerList.length = 0;
				var minx = 0,miny = 0,maxx = 0,maxy = 0;
				var first = true;
				var aaData= json.aaData;
				var num = 0;
				for(var i=0;i<aaData.length;i++)
				{
					//位置不合法
					if(aaData[i].Lng == "" || aaData[i].Lat == "")
						continue;
					
					if(aaData[i].CoorType)
					{
						//坐标进行转换
						if(aaData[i].CoorType == "BD-09")
						{
							var dd = bd09togcj02(parseFloat(aaData[i].Lng),parseFloat(aaData[i].Lat));
							aaData[i].Lng = dd[0];
							aaData[i].Lat = dd[1];
						}
						else if(aaData[i].CoorType == "WGS84")
						{
							var dd = wgs84togcj02(parseFloat(aaData[i].Lng),parseFloat(aaData[i].Lat));
							aaData[i].Lng = dd[0];
							aaData[i].Lat = dd[1];
						}
					}
					
					addMarker(aaData[i]);
					
					//压力
					if(aaData[i].NodeType == "4")
					{
						var m_dx = aaData[i].Lng;
						var m_dy = aaData[i].Lat;
						
						if (first == true)
						{
							minx = m_dx;
							miny = m_dy;
							maxx = m_dx;
							maxy = m_dy; 
							first = false;
						}
						else
						{
							if (minx > m_dx)
								minx = m_dx;
							if (miny > m_dy)
								miny = m_dy;
							if (maxx < m_dx)
								maxx = m_dx;
							if (maxy < m_dy)
								maxy = m_dy;
						}
						
						num++;
					}
				}
				
				//处理显示
				dealMarkerShow();
					
				//加载定位列表
				searchBtnFn();
				
				//处理热力图
				dealHotMap();
				
				 //设置地图中心位置
				 if(num > 1)
				 {
					//根据经纬极值计算绽放级别。  
					function getZoom (maxLng, minLng, maxLat, minLat) {  
						var zoom = ["50","100","200","500","1000","2000","5000","10000","20000","25000","50000","100000","200000","500000","1000000","2000000"]//级别18到3。  
						//var pointA = new AMap.LngLat(maxLng*1.0+0.03, maxLat*1.0+0.03);	// 创建点坐标A  
						//var pointB = new AMap.LngLat(minLng*1.0-0.03, minLat*1.0-0.03); // 创建点坐标B  
						var pointA = new AMap.LngLat(maxLng, maxLat);	// 创建点坐标A  
						var pointB = new AMap.LngLat(minLng, minLat); // 创建点坐标B  
						var distance = pointA.distance(pointB).toFixed(1);  //获取两点距离,保留小数点后两位  
						for (var i = 0,zoomLen = zoom.length; i < zoomLen; i++) {  
							if(zoom[i] - distance > 0){  
								//return 18-i+3;//之所以会多3，是因为地图范围常常是比例尺距离的10倍以上。所以级别会增加3。  
								return 18-i+3;//之所以会多3，是因为地图范围常常是比例尺距离的10倍以上。所以级别会增加3。 
							}  
						}
					}						
					 
					var zoom = getZoom(maxx,minx,maxy,miny);
					
					var Lng = (parseFloat(minx)+parseFloat(maxx))/2;
					var Lat = (parseFloat(miny)+parseFloat(maxy))/2;
					
					map.setZoomAndCenter(zoom, [Lng, Lat]);
				 }
				
				/*
				//加载管网
				$.ajax( {  
					url:ROOT_PATH + "/pipeLine/query?layerName=ws_pipe&queryWhere=caliber>100",
					type:'get',			
					dataType:'json',
					success:function(json) {
									
						//画管网线
						drawWsPipe(json);
						
						//显示管网线
						dealWsPipeShow();
						
					},
					beforeSend: function () {
						$("#loading").show();
					},
					complete: function () {
						$("#loading").hide();
					},
				});
				
				//加载阀门
				$.ajax( {  
					url:ROOT_PATH + "/pipeLine/query?layerName=ws_valve&queryWhere=caliber>100",
					type:'get',			
					dataType:'json',
					success:function(json) {
												
						//画阀门
						drawWsValve(json);
						
						//显示阀门
						dealWsValveShow();
					}
				});
				
				*/
            }
        }
    });
}	

function showMarkFlash(marker,flag)
{
	var zoom = map.getZoom();
		
	//直接查找类型
	var item = marker.getExtData().item;

	if(NodeTypeList[item.NodeType].show)
	{
		if(item.ZoomMin>zoom)
		{
			if(flag)
				marker.setIcon(z16FlashIcon(item));
			else
				marker.setIcon(z16Icon(item));
				
			marker.setOffset(new AMap.Pixel(-5,-5));
			marker.setMap(map);
			
			if(item.NodeType == "4" || item.NodeType == "3" || item.NodeType == "2")
				marker.valMarker.setMap(null);
		}
		else
		{
			if(flag)
				marker.setIcon(addFlashIcon(item));
			else
				marker.setIcon(addIcon(item));					
			
			marker.setOffset(new AMap.Pixel(-16,-32));
			marker.setMap(map);
			
			if(item.NodeType == "4" || item.NodeType == "3" || item.NodeType == "2")
				marker.valMarker.setMap(map);
		}
	}
	else
	{
		marker.setMap(null);
		
		if(item.NodeType == "4" || item.NodeType == "3" || item.NodeType == "2")
			marker.valMarker.setMap(null);
	}
}

function dealMarkerDataRefresh(marker)
{
	//清除下
	showMarkFlash(marker,false);
	
	//控制闪烁
	var item = marker.getExtData().item;
	var nodetype = NodeTypeList[item.NodeType];

	//先刷新下旁边的值
	if(item.NodeType == "4" || item.NodeType == "3" || item.NodeType == "2")
	{
		var txt = "";
		if(item.Prop1Value != "")
			txt = Number(item.Prop1Value).toFixed(2);
		
		//刷新值
		marker.valMarker.setText(txt);
	}
	
	//处理压力报警
	if(item.PressureUp == "")
		return;
	
	var pressval = 0;
	if(item.Prop1Show && nodetype.Prop1.indexOf('压力') != -1)
	{
		if(item.Prop1Value != "")
		{
			var txt = Number(item.Prop1Value).toFixed(2);
			if(txt > pressval)
				pressval = txt;
		}
	}
	
	if(item.Prop2Show && nodetype.Prop2.indexOf('压力') != -1)
	{
		if(item.Prop2Value != "")
		{
			var txt = Number(item.Prop2Value).toFixed(2);
			if(txt > pressval)
				pressval = txt;
		}
	}
	
	if(item.Prop3Show && nodetype.Prop3.indexOf('压力') != -1)
	{
		if(item.Prop3Value != "")
		{
			var txt = Number(item.Prop3Value).toFixed(2);
			if(txt > pressval)
				pressval = txt;
		}
	}
	
	if(item.Prop4Show && nodetype.Prop4.indexOf('压力') != -1)
	{
		if(item.Prop4Value != "")
		{
			var txt = Number(item.Prop4Value).toFixed(2);
			if(txt > pressval)
				pressval = txt;
		}
	}
	
	if(item.Prop5Show && nodetype.Prop5.indexOf('压力') != -1)
	{
		if(item.Prop5Value != "")
		{
			var txt = Number(item.Prop5Value).toFixed(2);
			if(txt > pressval)
				pressval = txt;
		}
	}
	
	if(item.Prop6Show && nodetype.Prop6.indexOf('压力') != -1)
	{
		if(item.Prop6Value != "")
		{
			var txt = Number(item.Prop6Value).toFixed(2);
			if(txt > pressval)
				pressval = txt;
		}
	}
	
	if(item.Prop7Show && nodetype.Prop7.indexOf('压力') != -1)
	{
		if(item.Prop7Value != "")
		{
			var txt = Number(item.Prop7Value).toFixed(2);
			if(txt > pressval)
				pressval = txt;
		}
	}
	
	if(item.Prop8Show && nodetype.Prop8.indexOf('压力') != -1)
	{
		if(item.Prop8Value != "")
		{
			var txt = Number(item.Prop8Value).toFixed(2);
			if(txt > pressval)
				pressval = txt;
		}
	}
	
	if(item.Prop9Show && nodetype.Prop9.indexOf('压力') != -1)
	{
		if(item.Prop9Value != "")
		{
			var txt = Number(item.Prop9Value).toFixed(2);
			if(txt > pressval)
				pressval = txt;
		}
	}
	
	if(item.Prop10Show && nodetype.Prop10.indexOf('压力') != -1)
	{
		if(item.Prop10Value != "")
		{
			var txt = Number(item.Prop10Value).toFixed(2);
			if(txt > pressval)
				pressval = txt;
		}
	}
	
	//清除闪烁
	if(marker.timer)
		clearInterval(marker.timer);

		
	var PressureUp = Number(item.PressureUp).toFixed(2);
	if(pressval <0 || pressval>PressureUp)
	{
		//越限了
		var count = 0;
		function sansuo()
		{
			count++;
			 if(count%2==0){
				showMarkFlash(marker,true);
			 }else{
				showMarkFlash(marker,false);
			}
				
			if(count >=1000)
				count = 0;
			
			marker.timer = setTimeout(sansuo, 500);
		}
					
		sansuo();
		
	}
	
}
   
function addMarker(item) 
{
	var marker = new AMap.Marker({
		map: map,
		position: [item.Lng, item.Lat],
		topWhenClick: true,
		topWhenMouseOver: true,
		icon: z16Icon(item),
		offset:new AMap.Pixel(-5,-5),
		extData: {
			item: item
		}
	});
	//marker.setTitle(item.Name);
	marker.setMap(map);
	
	marker.on("mouseover", function (e) {
		getContentMarkerInfo( e.target.getExtData().item,e.target.getPosition());
	});

	marker.on("mouseout", function (e) {
		markerInfoWindow.close();
	});
	
	//闪烁标志
	marker.timer = null;
	
	markerList.push(marker);
	
	
	if(item.NodeType == "4" || item.NodeType == "3" || item.NodeType == "2")
	{
		var txt = "";
		if(item.Prop1Value != "")
			txt = Number(item.Prop1Value).toFixed(2);
		var border = "solid 1px #027597";
		var background = "#00b7ee";
		
		//是否显示状态
		var state = 0;//正常
		if(item.NodeStateShow)
		{
			if(Number(item.NodeStateValue) == 0)
				state = 1;//离线
		}
		
		if(item.NodeType == "0")
		{
			//消防栓
			border = "solid 1px #891005";
			background = "#ff1600";
		}
		else if(item.NodeType == "1")
		{
			//水质
			border = "solid 1px #066b86";
			background = "#08c2f3";
		}		
		else if(item.NodeType == "2")
		{
			//二供
			border = "solid 1px #014801";
			background = "#00a200";
		}		
		else if(item.NodeType == "3")
		{
			//流量
			border = "solid 1px #844801";
			background = "#ff8a00";
		}
		else if(item.NodeType == "4")
		{
			//压力
			border = "solid 1px #040483";
			background = "#0000ff";
		}		
			
		if(state == 1)
		{
			//离线
			border = "solid 1px #c8632c";
			background = "#fc7f3b";
		}		
		
		//画一给数值看看
		var text = new AMap.Text({
			text:txt,
			textAlign:'left', // 'left' 'right', 'center',
			verticalAlign:'middle', //middle 、bottom
			draggable:false,
			cursor:'pointer',
			angle:0,
			zIndex:10000,
			offset: new AMap.Pixel(12, -8),
			style:{
				'background':background,
				'border':border,
				'padding':'0px 4px',
				'margin':'0',
				'font-size':'9px',
				'text-align':'center',
				'color':'white',
				'height':'18px',
				'line-height':'18px',
			},
			position: [item.Lng, item.Lat]
		});
		text.setMap(map);
		
		//设置关联
		marker.valMarker = text;
	}
	
	//定时刷新数据
	if(1)
	{
		//5分钟刷新一次
		if(item.NodeType != "0")
		{
			//处理下值
			dealMarkerDataRefresh(marker);
			
			//异步函数
			(function(){
				var _marker = marker;
				
				var id = _marker.getExtData().item.Id;
				function getData(marker)
				{
					$.ajax({
						type:"GET",url:H5_ROOT_PATH + "/pipemapnode?action=getMapNodeRealList" , 
						dataType: "jsonp", 
						data:{Id:id},
						success:function(json){
							if(json.ret==10001)
							{		
								var aaData= json.aaData;
								for(var i=0;i<aaData.length;i++)
								{
									//位置不合法
									if(aaData[i].Lng == "" || aaData[i].Lat == "")
										continue;
									
									if(aaData[i].CoorType)
									{
										//坐标进行转换
										if(aaData[i].CoorType == "BD-09")
										{
											var dd = bd09togcj02(parseFloat(aaData[i].Lng),parseFloat(aaData[i].Lat));
											aaData[i].Lng = dd[0];
											aaData[i].Lat = dd[1];
										}
										else if(aaData[i].CoorType == "WGS84")
										{
											var dd = wgs84togcj02(parseFloat(aaData[i].Lng),parseFloat(aaData[i].Lat));
											aaData[i].Lng = dd[0];
											aaData[i].Lat = dd[1];
										}
									}
									
									_marker.getExtData().item = aaData[i];
									
									dealMarkerDataRefresh(_marker);
								}
							}
						}
					});
				}
				
				//定时器
				setInterval(function() {getData(_marker)}, 5*60*1000);
				
			})();
		}
	}
	

	marker.on('click', function (e) {
		
		var item = e.target.getExtData().item;
		
		if(item.NodeType != "0")
		{
			var nodetype = NodeTypeList[item.NodeType];
			var id = item.Id;
			if(item.Prop1Show && item.Prop1Type < 6)
			{
				var title = nodetype.Prop1;
				propClick(id,title);
			}
		}
	});	
}

function getContentMarkerInfo(item,position) {
  
	//动态内容显示
	var title = "";
	if(item.NodeType == "0")
		title = "消防栓";
	else if(item.NodeType == "1")
		title = "水质";
	else if(item.NodeType == "2")
		title = "二供";
	else if(item.NodeType == "3")
		title = "流量";
	else if(item.NodeType == "4")
		title = "压力";
  
	var nodetype = NodeTypeList[item.NodeType];
	var content = '<div class="power_title" id="info_title">' + title + '</div>';
	content += '<ul class="power_box">';
	content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>名称:</div><div class="number">' + item.Name + '</div></li>';
	//content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>经纬度:</div><div class="number">' + Number(item.Lng).toFixed(6)  + ' , ' + Number(item.Lat).toFixed(6)  + '</div></li>';
	//content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>安装地址:</div><div class="number">' + item.Address + '</div></li>';
	
	if(item.NodeStateShow)
	{
		var state = '离线';
		var color = '#fc7f3b';
		if(Number(item.NodeStateValue) == 1)
		{
			state = '在线';
			color = '#05CD00';
		}
		content += '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>状态:</div><div class="number" style="color:' + color + '">' + state + '</div></li>';
	}
	
	if(item.Prop1Show)
		content += getPropContent(nodetype.Prop1,item.Prop1Value,nodetype.Unit1,item.Id,item.Name);
	
	if(item.Prop2Show)
		content += getPropContent(nodetype.Prop2,item.Prop2Value,nodetype.Unit2,item.Id,item.Name);
	
	if(item.Prop3Show)
		content += getPropContent(nodetype.Prop3,item.Prop3Value,nodetype.Unit3,item.Id,item.Name);
	
	if(item.Prop4Show)
		content += getPropContent(nodetype.Prop4,item.Prop4Value,nodetype.Unit4,item.Id,item.Name);
	
	if(item.Prop5Show)
		content += getPropContent(nodetype.Prop5,item.Prop5Value,nodetype.Unit5,item.Id,item.Name);
	
	if(item.Prop6Show)
		content += getPropContent(nodetype.Prop6,item.Prop5Value,nodetype.Unit6,item.Id,item.Name);
	
	if(item.Prop7Show)
		content += getPropContent(nodetype.Prop7,item.Prop7Value,nodetype.Unit7,item.Id,item.Name);
	
	if(item.Prop8Show)
		content += getPropContent(nodetype.Prop8,item.Prop8Value,nodetype.Unit8,item.Id,item.Name);
	
	if(item.Prop9Show)
		content += getPropContent(nodetype.Prop9,item.Prop9Value,nodetype.Unit9,item.Id,item.Name);
	
	if(item.Prop10Show)
		content += getPropContent(nodetype.Prop10,item.Prop10Value,nodetype.Unit10,item.Id,item.Name);
	
	
	var id = item.Id;
	if(item.Prop1Show && item.Prop1Type < 6)
	{
		var title = nodetype.Prop1;
		content += getDetailContent(title,id);
	}	
	
	content += '</ul>';
	content += '</div>';
	$("#info_content").html(content);
	
	markerInfoWindow.setContent(content);
	markerInfoWindow.open(map,position);
}

function getPropContent(title,value,unit,id,name)
{
	var content = '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span>' + title + ':</div><div class="number">';
	var str_val = "";
	var str_unit = "";
	if(value!=null && value != "")
	{
		str_val = Number(value).toFixed(2);
		str_unit = unit;
	}
		
	//将tag里面的\替换成
	//var _tag = tag.replace(/\\/g,"\\\\");
	//content += '<div style="cursor: pointer;" onclick=propClick("' + id + '","' + title + '")>';
		
	content +='<span style="font:italic bold 16px/20px arial,sans-serif;">' +  str_val + '</span> <span style="color:#a9a7a7">' + str_unit + '</span>';
	//content +='<span class="QUERY"></span>';
	//content += '</div>';
	
	content += '</div></li>';
	
	return content;
}

function getDetailContent(title,id)
{
	var content = '<li class="clearfix"><div class="power_name" id><span class="power_name_bg"></span></div><div class="number">';

	//将tag里面的\替换成
	//var _tag = tag.replace(/\\/g,"\\\\");
	content += '<div style="cursor: pointer;" onclick=propClick("' + id + '","' + title + '")>';
		
	content +='<span>详细数据</span> <span style="color:#a9a7a7"></span>';
	content +='<span class="QUERY"></span>';
	content += '</div>';
	
	content += '</div></li>';
	
	return content;
}

function propClick(id,title)
{
	layer.open({
		type: 2,
		anim: 3,
		shade: .6,
		title: false,
		move: true,
		scrollbar: false,
		shadeClose: true, //点击遮罩关闭层
		area: ['80%', '80%'],
		content:["pipe_map_node_curve_1.html?id=" + id + "&title=" + escape(title),"no"]
	});	
}
	
//高德的会自己缩小
function addIcon(item) {
    var img = "";
	
	//是否显示状态
	var state = 0;//正常
	if(item.NodeStateShow)
	{
		if(Number(item.NodeStateValue) == 0)
			state = 1;//离线
	}
	
	var key = "";
	if(item.NodeType == "0")
		key = "xfs";
	else if(item.NodeType == "1")
		key = "sz";
	else if(item.NodeType == "2")
		key = "bz";
	else if(item.NodeType == "3")
		key = "ll";
	else if(item.NodeType == "4")
		key = "yl";
	
	img = "./img1/" + key + "";
	if(state == 1)
		img += "_off";
	
	img += ".png";
	
    return new AMap.Icon({
        size: new AMap.Size(32, 32),  //图标大小
		imageSize:new AMap.Size(32, 32),  //图标大小
        image: img
    })
}

function addFlashIcon(item) {
    var img = "";
	
	//是否显示状态
	var state = 0;//正常
	if(item.NodeStateShow)
	{
		if(Number(item.NodeStateValue) == 0)
			state = 1;//离线
	}
	
	var key = "";
	if(item.NodeType == "0")
		key = "xfs";
	else if(item.NodeType == "1")
		key = "sz";
	else if(item.NodeType == "2")
		key = "bz";
	else if(item.NodeType == "3")
		key = "ll";
	else if(item.NodeType == "4")
		key = "yl";
	
	img = "./img1/" + key + "";
	if(state == 1)
		img += "_off";
	else
		img += "_f";
	
	img += ".png";
	
    return new AMap.Icon({
        size: new AMap.Size(32, 32),  //图标大小
		imageSize:new AMap.Size(32, 32),  //图标大小
        image: img
    })
}

function z16Icon(item) {
    var img = "";
	
	//是否显示状态
	var state = 0;//正常
	if(item.NodeStateShow)
	{
		if(Number(item.NodeStateValue) == 0)
			state = 1;//离线
	}
	
	var key = "";
	if(item.NodeType == "0")
		key = "xfs";
	else if(item.NodeType == "1")
		key = "sz";
	else if(item.NodeType == "2")
		key = "bz";
	else if(item.NodeType == "3")
		key = "ll";
	else if(item.NodeType == "4")
		key = "yl";
	
	img = "./img1/" + key + "_s";
	img += ".png";
	
	if(state == 1)
		img = "./img1/z16_off.png";
		
    return new AMap.Icon({
        size: new AMap.Size(10, 10),  //图标大小
		imageSize:new AMap.Size(10, 10),  //图标大小
        image: img
    })
}


function z16FlashIcon(item) {
    var img = "";
	
	//是否显示状态
	var state = 0;//正常
	if(item.NodeStateShow)
	{
		if(Number(item.NodeStateValue) == 0)
			state = 1;//离线
	}
	
	var key = "";
	if(item.NodeType == "0")
		key = "xfs";
	else if(item.NodeType == "1")
		key = "sz";
	else if(item.NodeType == "2")
		key = "bz";
	else if(item.NodeType == "3")
		key = "ll";
	else if(item.NodeType == "4")
		key = "yl";
	
	img = "./img1/" + key + "_s";
	
	if(state == 1)
		img = "./img1/z16_off.png";
	else
		img += "_f.png";
		
    return new AMap.Icon({
        size: new AMap.Size(10, 10),  //图标大小
		imageSize:new AMap.Size(10, 10),  //图标大小
        image: img
    })
}

function resize()
{
	var hbody = $("body").height();
	var haccordion = $(".easyui-accordion").height();
	
	var h = 0;
	if(haccordion+20<=hbody)
		h = haccordion;
	else
		h = hbody - 20;
	
	$(".leftData").height(h);
	$(".leftData").mCustomScrollbar("update");
}

function dealLeftData()
{
	window.onresize = resize;

	$('.leftData').mCustomScrollbar({
        scrollbarPosition: "inside",
        theme: "minimal-dark"
    });
		
	resize();
	
	$('.easyui-accordion').accordion({   
		onSelect:function(title, index)
		{
			resize();
		},
		onUnselect:function(title, index)
		{
			resize();
		}
	});
	
	//值类型
	var dlist = [];
	
	//源水
	dlist.push({tag:"BFPLC\\ANPOINT\\YSHYLV_ARO.PV" , 	id:"val_1_1",	unit:"MPa"	,name:"压力"		,title:"源水"	, type:1});
	dlist.push({tag:"BFPLC\\ANPOINT\\YUSZHD_ARO.PV" , 	id:"val_1_2",	unit:"mg/l"	,name:"浊度"		,title:"源水" 	, type:1});
	dlist.push({tag:"BFPLC\\ANPOINT\\YUSSSLL_ARO.PV" , 	id:"val_1_3",	unit:"m³/h"	,name:"瞬间流量"	,title:"源水"	, type:1});
	
	//出厂水
	dlist.push({tag:"BFPLC\\ANPOINT\\CCSYAL_ARO.PV" , 	id:"val_2_1", 	unit:"MPa",		name:"压力",	title:"出厂水" 		, type:1});
	dlist.push({tag:"BFPLC\\ANPOINT\\QSKSWE_ARO.PV" , 	id:"val_2_2", 	unit:"m",		name:"水位",	title:"出厂水"  	, type:1});
	dlist.push({tag:"BFPLC\\ANPOINT\\CCSYUL_ARO.PV" , 	id:"val_2_3",	unit:"mg/l",	name:"余氯",	title:"出厂水"  	, type:1});
	dlist.push({tag:"BFPLC\\ANPOINT\\CCSPHV_ARO.PV" , 	id:"val_2_4", 	unit:"",		name:"PH值",	title:"出厂水"  	, type:1});
	dlist.push({tag:"BFPLC\\ANPOINT\\CCSZHD_ARO.PV" , 	id:"val_2_5",	unit:"mg/l",	name:"浊度",	title:"出厂水"  	, type:1});
	dlist.push({tag:"BFPLC\\ANPOINT\\CCSWDU_ARO.PV" , 	id:"val_2_6", 	unit:"℃",		name:"温度",	title:"出厂水"  	, type:1});
	dlist.push({tag:"BFPLC\\ANPOINT\\CCS1SSLL_ARO.PV" , id:"val_2_7", 	unit:"m³/h",	name:"#1瞬间流量",	title:"出厂水"	, type:1});
	dlist.push({tag:"BFPLC\\ANPOINT\\CCS2SSLL_ARO.PV" , id:"val_2_8", 	unit:"m³/h",	name:"#2瞬间流量",	title:"出厂水"	, type:1});
		
	//徽师泵站
	dlist.push({tag:"HSBZ\\PressOfIn.PV" , 	id:"val_3_1", 	unit:"MPa",		name:"压力",		title:"徽师泵站"		, type:1});
	dlist.push({tag:"HSBZ\\RunOf1FC.PV" , 	id:"val_3_2", 	unit:"",		name:"#1泵状态",	title:"徽师泵站"		, type:2});
	dlist.push({tag:"HSBZ\\RunOf2FC.PV" , 	id:"val_3_3",	unit:"",		name:"#2泵状态",	title:"徽师泵站"		, type:2});
	dlist.push({tag:"HSBZ\\LevOfPool.PV" , 	id:"val_3_4", 	unit:"m",		name:"液位",		title:"徽师泵站"		, type:1});
	
	//循环经济园
	dlist.push({tag:"XYJJY\\INVAL1_CloseSt_DI.PV" , 	id:"val_4_1", 	unit:"",		name:"#1进水阀",	title:"循环经济园"	, type:2});
	dlist.push({tag:"XYJJY\\EXP_CurPre1_AI.PV" , 		id:"val_4_2", 	unit:"MPa",		name:"#1压力",		title:"循环经济园"	, type:1});
	dlist.push({tag:"XYJJY\\EXP_CurPre2_AI.PV" , 		id:"val_4_3", 	unit:"MPa",		name:"#2压力",		title:"循环经济园"	, type:1});
	dlist.push({tag:"XYJJY\\PW_Lev_AI.PV" , 			id:"val_4_4", 	unit:"m",		name:"液位",		title:"循环经济园"	, type:1});
	
	
	for(var i in dlist)
	{
		//异步函数
		(function(){
			var _i = i;
			var _d = dlist[_i];
			
			function getD()
			{
				
				//取数
				$.ajax( {  
					url:H5_ROOT_PATH + "/secondwater?action=getRealData",
					type:'get',		
					data:{tag:_d.tag},	
					dataType:'jsonp',
					success:function(json) {
						
						if(json.ret == 10001)
						{					
							if(_d.type == 1)
							{	
								//需要显示按钮
								var value = json.value;
								var content = "";
								var str_val = "";
								var str_unit = "";
								if(value!=null && value != "")
								{
									str_val = Number(value).toFixed(2);
									str_unit = _d.unit;
								}
									
								//将tag里面的\替换成
								var _tag = _d.tag.replace(/\\/g,"\\\\");
								content += '<div style="cursor: pointer;" onclick=propLeftDataClick("' + _tag + '","' + _d.name + '","' + _d.title + '","' + _d.unit + '","0")>';
									
								content +='<span style="font:italic bold 16px/20px arial,sans-serif;">' +  str_val + '</span> <span style="color:#a9a7a7">' + str_unit + '</span>';
								content +='<span class="QUERY1"></span>';
								content += '</div>';
								
								$('#' + _d.id).html(content);
							}
							else
							{
								var close = false;
								if(json.value != "")
								{
									if(parseInt(json.value).toFixed(0) != 0)
									{
										close = true;
									}
								}
								
								if(close)
								{
									$('#' + _d.id).html('<img src="./img/z16_error.png" />');
								}
								else
								{
									$('#' + _d.id).html('<img src="./img/z16_on.png" />');
								}
								
							}
						}
					}
				});
				
				setTimeout(getD, 1000*60);//1分钟
			}
				
			getD();
				
		})();
	}
}

function propLeftDataClick(tag,title,name,unit,type)
{
	layer.open({
		type: 2,
		anim: 3,
		shade: .6,
		title: false,
		shadeClose: true, //点击遮罩关闭层
		area: ['80%', '80%'],
		content:"pipe_map_node_curve.html?tag="+ tag + "&type=" + type + "&title=" + escape(title) + "&name=" + escape(name) + "&unit=" + escape(unit),
	});	
}