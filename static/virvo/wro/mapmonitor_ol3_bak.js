
function zTreeScroll(zTree, scroll) {
    var prevTop = 0;
    var top = scroll.scrollTop;
    if(prevTop <= top) {//下滚
        // 获取没有展开的分组节点
        var notExpandNodes = zTree.getNodesByFilter(assignmentNotExpandFilter);
        if (notExpandNodes !== undefined && notExpandNodes.length > 0) {
            for (var i = 0; i< notExpandNodes.length; i++) {
                var node = notExpandNodes[i];
                var tid = node.tId + "_a";
                var divHeight = scroll.offsetTop;
                var nodeHeight = $("#" + tid).offset().top;
                if ( nodeHeight - divHeight > 696) {
                    break;
                }
                if (nodeHeight - divHeight > 0 && nodeHeight - divHeight < 696){
                    zTree.expandNode(node, true, true, false, true);
                    node.children[0].open= true;
                }
            }
        }
    }
    setTimeout(function() { prevTop = top; }, 0);
}

/**
 *  搜索没有展开的分组节点
 * @param node
 * @returns
 */
function assignmentNotExpandFilter(node){ // 搜索type等于人或者车
    return node.type == "assignment" && node.children != undefined && node.children.length >0 && node.children[0].open==false;
}



(function ($, window) {
  var nowDate = new Date();
  var travelLineList, AdministrativeRegionsList, fenceIdList, stopDataFlag = true, cdWorldType,
      nowYear, monthIndex, nowMonth, afterMonth, startTime, endTime, logoWidth, btnIconWidth, windowWidth, newwidth,
      windowHeight, headerHeight, panelHead, citySelHght, trLength, calHeight,
      zTreeHeight, titleHeight, demoHeight, mapHeight, operMenuHeight, newOperHeight, els, oldMapHeight, myTabHeight,
      wHeight, tableHeight, listIndex, carLng, carLat, stopLng, stopLat, ScrollBar,
      ProgressBar, sWidth, buildings, mouseTool, satellLayer, realTimeTraffic,googleMapLayer, infoWindow, markerMovingControl,
      lmapHeight, stopValue_num, changeArray, RegionalQuerymarker, createSuccessStm,
      createSuccessEtm, createSuccessSpid, leftToplongtitude, leftTopLatitude, rightFloorlongtitude, rightFloorLatitude,
      turnoverClickID, worldType, objType, oldMHeight, oldTHeight, marker, paths,
      clickEventListenerZoomend, alarmSIM, alarmTopic, vcolour, markerStopAnimationFlog, icos, standbyType,
      isTrafficDisplay = true, isMapThreeDFlag = true, flagOne = true,
      flagTwo = true, dragFlag = true, tableSet = [], tableSetStop = [], tableSetStopGroup = [], tableSetstops = [],
      tableSetCopy = [], alarmTableSet = [], alarmTableSetCopy = [],
      speedM = [], timeM = [], mileageM = [], longtitudestop = [], latitudestop = [], timestop = [],
      startTimestop = [], markerStopAnimation = [], endTimestop = [], timeArray = [],
      stopArray = [], peopleArray = [], msgArray = [], stopMsgArray = [], lineArr = [], markerAlarmList = [],
      contentTrackPlayback = [], alarmIndex = 1, tableIndex = 1, stoptableIndex = 1,
      nextIndexs = 1, open = 1, advance_retreat = false, Assembly = false, btnFlag = false, markerStopFlag = false,
      flagBackGo = false, flagBack = false, speed = 20000, selIndex = 0, trIndex = 0,
      mileageMax = 0, speedMax = 0, timeMax = 0, goDamoIndex = 0, markerAlarmIndex = 0, stopIndexs = 0,
      angleList = [], dragTableHeight, objectType, $myTab = $("#myTab"), $MapContainer = $("#MapContainer"), $panDefLeft = $("#panDefLeft"), 
      $contentLeft = $("#content-left"), $contentRight = $("#content-right"), $sidebar = $(".sidebar"), $mainContentWrapper = $(".main-content-wrapper"), $thetree = $("#thetree"),
      $realTimeRC = $("#realTimeRC"), $goShow = $("#goShow"), $chooseRun = $("#chooseRun"), $chooseNot = $("#chooseNot"), $chooseAlam = $("#chooseAlam"), $chooseStop = $("#chooseStop"),
      $chooseOverSeep = $("#chooseOverSeep"), $online = $("#online"), $chooseMiss = $("#chooseMiss"), $scrollBar = $("#scrollBar"), $mapPaddCon = $(".mapPaddCon"), $realTimeVideoReal = $(".realTimeVideoReal"),
      $realTimeStateTableList = $("#realTimeStateTable"), $alarmTable = $("#alarmTable"), $logging=$("#logging"), $showAlarmWinMark = $("#showAlarmWinMark"), $alarmFlashesSpan = $(".alarmFlashes span"),
      $alarmSoundSpan = $(".alarmSound span"), $alarmMsgBox = $("#alarmMsgBox"), $alarmSoundFont = $(".alarmSound font"), $alarmFlashesFont = $(".alarmFlashes font"), $alarmMsgAutoOff = $("#alarmMsgAutoOff"),
      rMenu = $("#rMenu"), alarmNum = 0, carAddress, msgSNAck, setting, ztreeStyleDbclick, $tableCarAll = $("#table-car-all"), $tableCarOnline = $("#table-car-online"), $tableCarOffline = $("#table-car-offline"),
      $tableCarRun = $("#table-car-run"), $tableCarStop = $("#table-car-stop"), $tableCarOnlinePercent = $("#table-car-online-percent"),longDeviceType,tapingTime,loadInitNowDate = new Date(),loadInitTime,
      checkFlag = false,fenceZTreeIdJson = {},fenceSize,bindFenceSetChar,fenceInputChange,scorllDefaultTreeTop,stompClientOriginal = null, stompClientSocket = null, hostUrl, DblclickName, objAddressIsTrue = [];
  ;


      var dma_layer;
      var moveendFn;
  
  var runTable = 0;
  var runTableTime = [];
  var disableFlag = true;
  var stopTable = 0;
  var stopTableTime = [];
  var allStopPoints = [];
  var warningTable = 0;
  var warningTableTime = [];
  var warningIndex = 0;
  var marking = 'run';
  var $runTableId;
  var flogKey;//判断是否绑定传感器
  var $stopTableId;
  var $warningTableId = $('#gpsTable3');
  var $thisRunTd;
  var $thisStopTd;
  var $thisWarningTd;
  var isSearch = true;
  var isAllStopPoint = false;
  var isRunAddressLoad = false;
  var isStopAddressLoad = false;
  var isWarnAddressLoad = false;
  var bflag = true;
  var crrentSubV = []; // 勾选的监控对象
  var zTreeIdJson = {};
  var setting;
  var inputChange;
  var group;
  var firstFlag = true;//解决监控对象检索,输入框内容自动回弹问题
  // 为了解决重复查询历史数据导致逆地理编码位置不准确问题
  var isSearchPlayBackData = false; // 是否对日历数据进行了点击查询
  var isLastAddressDataBack = true; // 最后一条位置信息是否返回
  var treeClickedType = "";

  var getdmamapusedata_flag = 0;
    var bindflowpressChart;
    var recent7flowpress;
    var dma_level = '2';
    var dma_selected = false;
    var dma_current_node = '';
    var dma_bindname = "";
    var dma_level2_clicked = "";
    var show_dma_level = "2";
    var dma_list = []; // dma框图和统计信息的全局列表
    var dma_no_global = []; //记录初始的全部dma_no
    var dma_color_list = ["#329e07","#ce6016","#880f8c","#60462c","#ba6b1a","#ea1526"];
    var dma_details = [];

    var old_r7fp =  $("#recent7flowpress").width();
    var dma_in_group = [];  //点击组织时记录该组织下的全部二级分区
    var dma3_and_dma2 = []; //点击二级dma蓝色统计信息，记录该二级分区及下属的三级分区
    var infow;

    var map;

    var ol3ops = {
      init:function(){
          vectorLayer1 = new ol.layer.Vector({
              // projection: 'EPSG:4326',
              source: new ol.source.Vector()
          });

          
          var controls = [
              new ol.control.Attribution({collapsed: false}),
              // new ol.control.FullScreen(),
              new ol.control.MousePosition({projection: 'EPSG:4326',coordinateFormat: ol.coordinate.createStringXY(5),}),
              // new ol.control.OverviewMap({collapsed: false, collapsible: false}),
              // new ol.control.Rotate({autoHide: false}),
              new ol.control.ScaleLine(),
              new ol.control.Zoom(),
              new ol.control.ZoomSlider(),
              new ol.control.ZoomToExtent()
          ];

          // 墨卡托
            // var vec_layer = ol3ops.crtLayerXYZ("vec_w","EPSG:3857",1);
            // var cta_wlayer = ol3ops.crtLayerXYZ("cta_w","EPSG:3857",1);
            // var cva_clayer = ol3ops.crtLayerXYZ("cva_w","EPSG:3857",1);
            
            // 经纬度
            var vec_layer = ol3ops.crtLayerXYZ("vec_c","EPSG:4326",1);
            var cta_wlayer = ol3ops.crtLayerXYZ("cta_c","EPSG:4326",1);
            var cva_clayer = ol3ops.crtLayerXYZ("cva_c","EPSG:4326",1);
          /*============================卫星图层================================*/

        //卫星底图
        var sat_background = new ol.layer.Tile({
          // extent: ol.proj.transformExtent(options.mapExtent, options.fromProject, options.toProject),
          source: new ol.source.XYZ({
               urls: ['http://www.google.cn/maps/vt?lyrs=s@692&gl=en&x={x}&y={y}&z={z}'],
               projection: "EPSG:4326"
               })
          });
          
        var sat_data =ol3ops.crtLayerWMTS("cia_c","EPSG:4326",1);

                
        var arrSat = new ol.Collection();
        arrSat.push(sat_background);
        arrSat.push(sat_data);

        var sat_group = new ol.layer.Group({
          mapType: ol.control.MapType.SATELLITE_MAP,
          layers : arrSat
        });

          
        var arrNormal = new ol.Collection();
        arrNormal.push(vec_layer);
        arrNormal.push(cva_clayer);

        var normal_group = new ol.layer.Group({
            mapType: ol.control.MapType.NORMAL_MAP,
            layers : arrNormal
        });

              
      var layerswitch = new ol.control.LayerSwitch({
        active: ol.control.MapType.NORMAL_MAP,
        // layerGroup : [sat_group, normal_group, vector_group]
        layerGroup : [sat_group, normal_group]
      });

          var center = [118.39469563,29.888188578];
          map = new ol.Map({
              // layers: [vec_layer,cta_wlayer,cva_clayer,vectorLayer1],
              controls: controls,
              target: 'map',
              view: new ol.View({
                projection: 'EPSG:4326',
                center: center,
                // center:  new ol.proj.transform(center,"EPSG:4326","EPSG:3857"),
                maxZoom : 18,
                zoom: 14
              })
            });

          // map.addLayer(sat_group);
          // map.addLayer(normal_group);
          map.addControl(layerswitch);

          var WEBSITE_ROOT='/api/ggis';

var dma_style =function(feature) { 

    
  var strokeColor = feature.getProperties().strokeColor;
  var fillColor = feature.getProperties().fillColor;
  var name = feature.getProperties().name;
  
  var color = ol.color.asArray(fillColor);
  color = color.slice();
  color[3] = 0.2; //opacity

  var style =  new ol.style.Style({
      
      stroke: new ol.style.Stroke({
          color: strokeColor,
          width: 3,
          lineDash: [8, 6]
      }),
      fill: new ol.style.Fill({
          color: color
          
      }),
      text: new ol.style.Text({
        font: '18px Calibri,sans-serif',
        fill: new ol.style.Fill({ color: 'white' }),
        stroke: new ol.style.Stroke({
          color: '#169bd5', width: 12
        }),
        // get the text from the feature - `this` is ol.Feature
        // and show only under certain resolution
        text: name + '\n' +'123 m3/h' //map.getView().getZoom() > 12 ? feature.get('description') : 'text--'
      })
      
  })
  feature.setStyle(style);
  
};

ol.layer.SXZDT = function(opt_options) {
    
  var options = opt_options || {};
  this.source_ = new ol.source.Vector();
  this.layerName_ = options.layerName ? options.layerName : '';
  this.name_ = options.name ? options.name : '';

  this.maxZoom = options.maxZoom ? options.maxZoom : -1;
  this.minZoom = options.minZoom ? options.minZoom : -1;
  
  this.visible = true;
  
  var this_ = this;
  ol.layer.Vector.call(this, {
      projection: 'EPSG:4326',
      source : this_.source_,
      style : dma_style,
  });
  
  var myExtent = map.getView().calculateExtent(map.getSize());
  var bottomLeft = ol.extent.getBottomLeft(myExtent) //ol.proj.transform(ol.extent.getBottomLeft(myExtent),'EPSG:3857', 'EPSG:4326');
  var topRight = ol.extent.getTopRight(myExtent) //ol.proj.transform(ol.extent.getTopRight(myExtent),'EPSG:3857', 'EPSG:4326');
  
  $.ajax({
      url: WEBSITE_ROOT+'/getdmageojson',
      data: "left=" + bottomLeft[0] + "&top=" + bottomLeft[1] + "&right=" + topRight[0] + "&bottom=" + topRight[1] + "&layerName="+this_.layerName_,
      type: 'GET',
      // dataType: 'json',
      success: function(res){
          // console.log(data)
          // var res = JSON.parse(data,function(k,v){
          //     console.log(k,v,typeof(v));
          //     return v
          // });
          // console.log(res)
          //var geojsonObject = Ext.util.JSON.decode(res);
          var features = (new ol.format.GeoJSON()).readFeatures(res,{featureProjection: 'EPSG:4326'});
          
          console.log(features)
          this_.source_.clear(true);
          // var new_feateres = [];
          
          // this_.source_.addFeatures(features);
          $.each(features,function(idx,feature){
            var dma_level = feature.getProperties().dma_level;
            if(dma_level == '3'){
              this_.source_.addFeature(feature)
            }
          });
          
          //this_.dimTexts = geojsonObject.dimTexts;
      }
  });
  
}

          ol.inherits(ol.layer.SXZDT, ol.layer.Vector);

          ol.layer.SXZDT.prototype.setMap = function(map) {
                  ol.layer.Vector.prototype.setMap.call(this, map);
                  var this_ = this;
                  
                  moveendFn = map.on('moveend',function(e){
                        this_.refreshSource_(e);
                  });
                  
          };
          
          
          ol.layer.SXZDT.prototype.refreshSource_ = function(e) {
                      var current_zoom = map.getView().getZoom();
                      var visible = true;
                      // if(this.maxZoom != -1 && this.minZoom != -1) {
                      //     if(current_zoom >= this.minZoom && current_zoom <= this.maxZoom)
                      //         visible = true;
                      //     else
                      //         visible = false;
                      // }
                      // else if(this.maxZoom != -1 && this.minZoom == -1) {
                      //        if(current_zoom <= this.maxZoom)
                      //          visible = false;
                      //     else
                      //         visible = true;
                      // }
                      // else if(this.minZoom != -1 && this.maxZoom == -1) {
                      //         if(current_zoom >= this.minZoom)
                      //           visible = true;
                      //     else
                      //           visible = false;
                      // }
                      if (this.halt_till_next){
                        this.halt_till_next = false;
                        return
                      }
                      var this_ = this;
                      if(this.visible & visible) {
                          var myExtent = map.getView().calculateExtent(map.getSize());
                          var bottomLeft = ol.extent.getBottomLeft(myExtent) //ol.proj.transform(ol.extent.getBottomLeft(myExtent),'EPSG:3857', 'EPSG:4326');
                          var topRight = ol.extent.getTopRight(myExtent) //ol.proj.transform(ol.extent.getTopRight(myExtent),'EPSG:3857', 'EPSG:4326');
              
                          $.ajax({
                              url: WEBSITE_ROOT+'/getdmageojson',
                              data: "left=" + bottomLeft[0] + "&top=" + bottomLeft[1] + "&right=" + topRight[0] + "&bottom=" + topRight[1] + "&layerName="+this_.layerName_,
                              type: 'GET',
                              success: function(data){
                                  // var res = eval(data);
                                  // //var geojsonObject = Ext.util.JSON.decode(res);
                                  // console.log(res)
                                  var features = (new ol.format.GeoJSON()).readFeatures(data,{featureProjection: 'EPSG:4326'});
                                  
                                  this_.source_.clear(true);
                                  // this_.source_.addFeatures(features);
                                  $.each(features,function(idx,feature){
                                    var dma_level = feature.getProperties().dma_level;
                                    if(dma_level == '2'){
                                      this_.source_.addFeature(feature)
                                    }
                                  });
                                  // dma_layer.setMoveEnd(map);
                                  // console.log(this_.source_)
                                  // this_.source_.forEachFeature(function(feature){
          
                                  //     var coords = feature.getGeometry().getInteriorPoint();
                                  //     dmades = document.getElementById('overlay');
                                  //      var vienna = new ol.Overlay({
                                  //       position: coords.getFlatCoordinates(),
                                  //       element: dmades
                                  //     });
                                  //      dmades.innerHTML = feature.getProperties().name
                                  //     map.addOverlay(vienna);
                                  // });
                                  // //this_.dimTexts = geojsonObject.dimTexts;
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
          
          //dlzxc
          dma_layer = new ol.layer.SXZDT({
              layerName : 'dlzxc',
              name:'dma分区',
              minZoom : 4
          });
          dma_layer.setMap(map);

      },
      crtLayerXYZ:function(type, proj, opacity){
          var layer = new ol.layer.Tile({
               source: new ol.source.XYZ({
                   url: 'http://t'+Math.round(Math.random()*7)+'.tianditu.com/DataServer?T='+type+'&x={x}&y={y}&l={z}&tk=e0955897c7f8a5adeba75b55bb11b600',
                   projection: proj
               }),
               opacity: opacity
           });
           layer.id = type;
           return layer;
      },
      crtLayerWMTS:function(type, proj, opacity){
        var projection = ol.proj.get(proj);
        var projectionExtent = projection.getExtent();
        var size = ol.extent.getWidth(projectionExtent) / 256;
        var resolutions = new Array(19);
        var matrixIds = new Array(19);
        for (var z = 1; z < 19; ++z) {
            // generate resolutions and matrixIds arrays for this WMTS
            resolutions[z] = size / Math.pow(2, z);
            matrixIds[z] = z;
        }
 
        var layer = new ol.layer.Tile({
            opacity: opacity,
            source: new ol.source.WMTS({
              attributions: 'Tiles © <a href="http://www.tianditu.com/service/info.html?sid=5292&type=info">天地图</a>',
              url: 'http://t'+Math.round(Math.random()*7)+'.tianditu.com/'+type+'/wmts?tk=e0955897c7f8a5adeba75b55bb11b600',
              layer: type.substr(0, 3),
              matrixSet: type.substring(4),
              format: 'tiles',
              projection: projection,
              tileGrid: new ol.tilegrid.WMTS({
                origin: ol.extent.getTopLeft(projectionExtent),
                resolutions: resolutions,
                matrixIds: matrixIds
              }),
              style: 'default',
              wrapX: true
            })
          });
        layer.id = type;
        return layer;
      },
      updateDrawControl : function(geometryType) {
          

          map.removeInteraction(drawControl);

          if (geometryType === 'None') return;

          drawControl = new ol.interaction.Draw({
              type: geometryType,
              source: vectorLayer1.getSource()
          });

          map.addInteraction(drawControl);

          drawControl.on('drawend',fenceOperation.createSuccess);
          // drawControl.on('drawend',ol3ops.exportgeojson);
      },
      exportgeojson:function(event){
          map.removeInteraction(drawControl);
          console.log(event)
          var format = new ol.format.GeoJSON();
          var features = vectorLayer1.getSource().getFeatures();
          console.log(features)
          var geoJson = format.writeFeatures(features);
          console.log(geoJson)
          console.log(JSON.stringify(geoJson))

          var geojson2 = format.writeFeature(event.feature);
          console.log(geojson2)
      }





  };//ol3op end


  trackPlayback = {
    //初始化
    init: function () {
      
      
      winHeight = $(window).height();//可视区域高度
            headerHeight = $("#header").height();//头部高度
            var tabHeight = $myTab.height();//信息列表table选项卡高度
            var tabContHeight = $("#myTabContent").height();//table表头高度
            var fenceTreeHeight = winHeight - 193;//围栏树高度
            $("#fenceZtree").css('height',fenceTreeHeight + "px");//电子围栏树高度
            //地图高度
            newMapHeight = winHeight - headerHeight - tabHeight - 10;
            $MapContainer.css({
                "height": newMapHeight + 'px'
            });
            //车辆树高度
            var newContLeftH = winHeight - headerHeight;
            //sidebar高度
            $(".sidebar").css('height',newContLeftH + 'px');
            //计算顶部logo相关padding
            logoWidth = $("#header .brand").width();
            btnIconWidth = $("#header .toggle-navigation").width();
            windowWidth = $(window).width();
            newwidth = (logoWidth + btnIconWidth + 46) / windowWidth * 100;
            //左右自适应宽度
            $contentLeft.css({
                "width": newwidth + "%"
            });
            $contentRight.css({
                "width": 100 - newwidth + "%"
            });
            //加载时隐藏left同时计算宽度
            $sidebar.attr("class", "sidebar sidebar-toggle");
            //$mainContentWrapper.attr("class", "main-content-wrapper main-content-toggle-left");
            //操作树高度自适应
            var newTreeH = winHeight - headerHeight - 203;
            $thetree.css({
                "height": newTreeH + "px"
            });
            //视频区域自适应
            var mainContentHeight = $contentLeft.height();
            var adjustHeight = $(".adjust-area").height();
            videoHeight = (mainContentHeight - adjustHeight - 65) / 2;
            $(".videoArea").css("height", videoHeight + "px");
            //地图拖动改变大小
            oldMapHeight = $MapContainer.height();
            myTabHeight = $myTab.height();
            wHeight = $(window).height();
            // 页面区域定位
            $(".amap-logo").attr("href", "javascript:void(0)").attr("target", "");
            // 监听浏览器窗口大小变化
            var sWidth = $(window).width();
            if (sWidth < 1200) {
                $("body").css("overflow", "auto");
                $("#content-left,#panDefLeft").css("height", "auto");
                $panDefLeft.css("margin-bottom", "0px");
                if (sWidth <= 414) {
                    $sidebar.removeClass("sidebar-toggle");
                    $mainContentWrapper.removeClass("main-content-toggle-left");
                }
            } else {
                $("body").css("overflow", "hidden");
            };
            window.onresize=function(){
              winHeight = $(window).height();//可视区域高度
              headerHeight = $("#header").height();//头部高度
                var tabHeight = $myTab.height();//信息列表table选项卡高度
                var tabContHeight = $("#myTabContent").height();//table表头高度
                var fenceTreeHeight = winHeight - 193;//围栏树高度
                $("#fenceZtree").css('height',fenceTreeHeight + "px");//电子围栏树高度
                //地图高度
                newMapHeight = winHeight - headerHeight - tabHeight - 10;
                $MapContainer.css({
                    "height": newMapHeight + 'px'
                });
                //车辆树高度
                var newContLeftH = winHeight - headerHeight;
                //sidebar高度
                $(".sidebar").css('height',newContLeftH + 'px');
                //计算顶部logo相关padding
                logoWidth = $("#header .brand").width();
                btnIconWidth = $("#header .toggle-navigation").width();
                windowWidth = $(window).width();
                newwidth = (logoWidth + btnIconWidth + 46) / windowWidth * 100;
                //左右自适应宽度
                $contentLeft.css({
                    "width": newwidth + "%"
                });
                $contentRight.css({
                    "width": 100 - newwidth + "%"
                });
              //操作树高度自适应
                var newTreeH = winHeight - headerHeight - 203;
                $thetree.css({
                    "height": newTreeH + "px"
                });
                //视频区域自适应
                var mainContentHeight = $contentLeft.height();
                var adjustHeight = $(".adjust-area").height();
                videoHeight = (mainContentHeight - adjustHeight - 65) / 2;
                $(".videoArea").css("height", videoHeight + "px");
            }
      
      
    
      setting = {
        async: {
          url: "/api/entm/organization/tree/", //trackPlayback.getTreeUrl,
          type: "get",
          enable: true,
          autoParam: ["id"],
          dataType: "json",
          otherParam: {"type": "single",
                        "isOrg" : "1",
                        "isDma" : "1",
                    },
          dataFilter: trackPlayback.ajaxDataFilter
        },
        // check: {
        //   enable: true,
        //   chkStyle: "radio"
        // },
        view: {
          dblClickExpand: false,
          nameIsHTML: true,
          countClass: "group-number-statistics"
        },
        data: {
          simpleData: {
            enable: true
          }
        },
        callback: {
          // beforeCheck: trackPlayback.zTreeBeforeCheck,
          // onCheck: trackPlayback.onCheck,
          beforeClick: trackPlayback.zTreeBeforeClick,
          onAsyncSuccess: trackPlayback.zTreeOnAsyncSuccess,
          // onExpand: trackPlayback.zTreeOnExpand,
          // beforeAsync: trackPlayback.zTreeBeforeAsync,
          // onNodeCreated: trackPlayback.zTreeOnNodeCreated,
          onClick: trackPlayback.zTreeOnClick,
        }
      };
      $.fn.zTree.init($("#treeDemo"), setting, null);
      ScrollBar = {
        value: 50,
        maxValue: 40000,
        step: 1,
        Initialize: function () {
          if (this.value > this.maxValue) {
            layer.msg(trackScrollBarMax, {move: false});
            return;
          }
          this.GetValue();
          var InitTrack = 20000 / (this.maxValue - 50) * 157;
          $("#scroll_Track").css("width", InitTrack + 2 + "px");
          $("#scroll_Thumb").css("margin-left", InitTrack + "px");
          this.Value();
        },
        Value: function () {
          if (flagOne) {
            speed = 20000;
            flagOne = false;
          }
          ;
          var valite = false;
          var currentValue;
          $("#scroll_Thumb").mousedown(function () {
            valite = true;
            $(document.body).mousemove(function (event) {
              dragFlag = false;
              if (valite == false) return;
              currentValue = Math.round(event.clientX) - $("#Demo").offset().left;
              if (currentValue <= 0) {
                currentValue = 0;
                ScrollBar.value = 50;
              }
              ;
              $("#scroll_Thumb").css("margin-left", currentValue + "px");
              $("#scroll_Track").css("width", currentValue + 2 + "px");
              if ((currentValue + 15) >= $("#scrollBar").width()) {
                $("#scroll_Thumb").css("margin-left", $("#scrollBar").width() - 10 + "px");
                $("#scroll_Track").css("width", $("#scrollBar").width() + 2 + "px");
                ScrollBar.value = ScrollBar.maxValue;
              } else if (currentValue <= 0) {
                $("#scroll_Thumb").css("margin-left", "0px");
                $("#scroll_Track").css("width", "0px");
              } else {
                ScrollBar.value = Math.round(39950 * (currentValue / $("#scrollBar").width()));
              }
            });
          });
          $(document.body).mouseup(function () {
            if (flagTwo || dragFlag) {
              speed = 20000;
              flagTwo = false;
            } else {
              speed = ScrollBar.value;
            }
            ;
            valite = false;
          });
        },
        GetValue: function () {
          this.currentX = 0
        }
      };
      ProgressBar = {
        maxValue: 100,
        value: 0,
        SetValue: function (aValue) {
          this.value = aValue;
          if (this.value >= this.maxValue) this.value = this.maxValue;
          if (this.value <= 0) this.value = 0;
          var mWidth = this.value / this.maxValue * $("#progressBar").width() + "px";
          $("#progressBar_Track").css("width", mWidth);
        }
      };
      sWidth = $(window).width();
      //监听浏览器窗口大小变化
      if (sWidth < 1200) {
        $("body").css("overflow", "auto");
        if (sWidth <= 414) {
          $(".sidebar").removeClass("sidebar-toggle");
          $(".main-content-wrapper").removeClass("main-content-toggle-left");
        }
      } else {
        $("body").css("overflow", "hidden");
      }
      $("[data-toggle='tooltip']").tooltip();
      //创建地图围栏相关集合
      // fenceIdList = new trackPlayback.mapVehicle();
      // AdministrativeRegionsList = new trackPlayback.mapVehicle();
      // travelLineList = new trackPlayback.mapVehicle();
      // setTimeout(function () {
      //   $(".realTimeCanArea").show()
      // }, 200);

      // infow = trackPlayback.infoWindow();
    },
    clickEventListenerDragend: function () {
      var southwest = map.getBounds().getSouthWest();//获取西南角坐标
      var northeast = map.getBounds().getNorthEast();//获取东北角坐标
      var possa = southwest.lat;//纬度（小）
      var possn = southwest.lng;
      var posna = northeast.lat;
      var posnn = northeast.lng;
      paths = new AMap.Bounds(
          [possn, possa], //西南角坐标
          [posnn, posna]//东北角坐标
      );
    },
    //数据列表及地图之间拖动
    mouseMove: function (e) {
      if (els - e.clientY > 0) {
        var y = els - e.clientY;
        var newHeight = mapHeight - y;
        if (newHeight <= 0) {
          newHeight = 0;
        }
        $("#map").css({
          "height": newHeight + "px"
        });
        if (newHeight == 0) {
          return false;
        }
        ;
        $(".trackPlaybackTable .dataTables_scrollBody").css({
          "height": (tableHeight + y) + "px"
        });
        var searchTop = 338 - y;
        if (searchTop <= 175) {
          $("#realTimeCanArea").css("top", "175px");
        } else {
          $("#realTimeCanArea").css("top", searchTop + "px");
        }
      } else {
        var dy = e.clientY - els;
        var newoffsetTop = $("#myTab").offset().top;
        var scrollBodyHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
        if (scrollBodyHeight == 0) {
          return false;
        }
        if (newoffsetTop <= (wHeight - myTabHeight)) {
          var newHeight = mapHeight + dy;
          $("#map").css({
            "height": newHeight + "px"
          });
          $(".trackPlaybackTable .dataTables_scrollBody").css({
            "height": (tableHeight - dy) + "px"
          });
        }

      }
      e.stopPropagation();
    },
    mouseUp: function () {
      dragTableHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
      $(document).unbind("mousemove", trackPlayback.mouseMove).unbind("mouseup", trackPlayback.mouseUp);
    },
    //显示隐藏导航按钮同时绑定宽度
    toggleBtn: function () {
      if ($(".sidebar").hasClass("sidebar-toggle")) {
        if ($("#content-left").is(":hidden")) {
          $("#content-right").css("width", "100%");
          $("#recent7flowpress").css("width",old_r7fp);
          console.log('toggle 1')
        } else {
          $("#content-right").css("width", 100 - newwidth + "%");
          $("#content-left").css("width", newwidth + "%");
          console.log('toggle 2')

          $("#recent7flowpress").css("width",old_r7fp);
        }
      } else {
        if ($("#content-left").is(":hidden")) {
          $("#content-right").css("width", "100%");
          console.log('toggle 3')
          $("#recent7flowpress").css("width",old_r7fp);
        } else {
          $("#content-right").css("width", (100 - newwidth - 2) + "%");
          $("#content-left").css("width", (newwidth + 2) + "%");
          console.log('toggle 4')

          $("#recent7flowpress").css("width","85%");
        };
      }

      // pwl
      if(recent7flowpress != null && recent7flowpress != undefined){
            recent7flowpress.resize();
          console.log('toggle 5')

        }
        $("#recent7flowpress").css("width","100%");
      // if($("#recent7flowpress").hasClass(".tleft")){
      //           $("#recent7flowpress").css("width",old_r7fp);
      //           $("#recent7flowpress").removeClass(".tleft").addClass(".tright")
      //       }else{
      //           $("#recent7flowpress").css("width","85%");
      //           $("#recent7flowpress").removeClass(".tright").addClass(".tleft")

      //       }
            
      //       if(recent7flowpress != null && recent7flowpress != undefined){
      //           recent7flowpress.resize();

      //       }
      //      $("#recent7flowpress").css("width","100%");
    },
    //页面(地图，卫星，实时路况)点击事件
    mapBtnActive: function () {
      $("#realTimeBtn .mapBtn").removeClass("map-active");
      $(this).addClass("map-active");
    },
    showDmaStation:function(){
      alert("station")
    },
    showStation:function () {
      if (isTrafficDisplay) {
        // realTimeTraffic.show();
        // $("#realTimeRC").addClass("map-active");
        $("#realTimeRCLab").addClass('preBlue');
        isTrafficDisplay = false;
        console.log(dma_current_node)
        trackPlayback.refreshMap_local(dma_current_node);
        
      } else {
        // realTimeTraffic.hide();
        // $("#realTimeRC").removeClass("map-active");
        $("#realTimeRCLab").removeClass('preBlue');
        console.log(dma_bindname)
        isTrafficDisplay = true;
        trackPlayback.refreshMap_local(dma_current_node);
      }
    },
    //实时路况切换
    realTimeRC: function () {
      if (isTrafficDisplay) {
        realTimeTraffic.show();
        $("#realTimeRC").addClass("map-active");
        $("#realTimeRCLab").addClass('preBlue');
        isTrafficDisplay = false;
        if(googleMapLayer){
          googleMapLayer.setMap(null);
        }
        $("#googleMap").attr("checked", false);
        $("#googleMapLab").removeClass("preBlue");
      } else {
        realTimeTraffic.hide();
        $("#realTimeRC").removeClass("map-active");
        $("#realTimeRCLab").removeClass('preBlue');
        isTrafficDisplay = true;
      }
    },
    //卫星地图及3D地图切换
    satelliteMapSwitching: function () {
      if (isMapThreeDFlag) {
        $("#setMap").addClass("map-active");
        $("#defaultMapLab").addClass('preBlue');
        satellLayer.show();
        buildings.setMap(null);
        isMapThreeDFlag = false;
        if(googleMapLayer){
          googleMapLayer.setMap(null);
        }
        $("#googleMap").attr("checked", false);
        $("#googleMapLab").removeClass("preBlue");
      } else {
        $("#setMap").removeClass("map-active");
        $("#defaultMapLab").removeClass('preBlue');
        buildings.setMap(map);
        satellLayer.hide();
        isMapThreeDFlag = true;
      }
    },
    //GOOGLE地图
    showGoogleMapLayers: function () {
      if ($("#googleMap").attr("checked")) {
        googleMapLayer.setMap(null);
        $("#googleMap").attr("checked", false);
        $("#googleMapLab").removeClass("preBlue");
      } else {
        googleMapLayer = new AMap.TileLayer({
          tileUrl: 'http://mt{1,2,3,0}.google.cn/vt/lyrs=m@142&hl=zh-CN&gl=cn&x=[x]&y=[y]&z=[z]&s=Galil', // 图块取图地址
          zIndex: 100 //设置Google层级与高德相同  避免高德路况及卫星被Google图层覆盖
        });
        googleMapLayer.setMap(map);
        $("#googleMap").attr("checked", true);
        $("#googleMapLab").addClass("preBlue");

        //取消路况与卫星选中状态
        $("#showStation").attr("checked", false);
        $("#realTimeRCLab").removeClass("preBlue");
        // realTimeTraffic.hide();
        isTrafficDisplay=true;
        isMapThreeDFlag=true;
        $("#setMap").attr("checked", false);
        $("#defaultMapLab").removeClass("preBlue");
        satellLayer.hide();
        buildings.setMap(map);
      }
    },

   
    
    
    //导出谷歌轨迹
    exportKML: function () {
      var laglatObjct = {'lineArr': lineArr};
      address_submit("POST", '/clbs/v/monitoring/exportKML', "json", false, laglatObjct, true, trackPlayback.getExportKML);
    },
    getExportKML: function () {
      layer.msg(publicExportSuccess);
    },
    
    //播放和停止
    clears: function () {
      marker, lineArr = [], paths;
      markerMovingControl;
      longtitudestop = [];
      latitudestop = [];
      timestop = [];
      startTimestop = [];
      endTimestop = [];
      latitudeStop2 = [];
      longtitudeStop2 = [];
      markerStopAnimation = [];
      markerAlarmList = [];
      selIndex = 0;
      trIndex = 0;
      listIndex = 0;
      flagBackGo = false;
      nextIndexs = 1;
      open = 1;
      flagBack = false;
      tableSet = [];
      tableSetStop = [];
      tableSetStopGroup = [];
      tableSetstops = [];
      tableSetCopy = [];
      alarmTableSet = [];
      alarmTableSetCopy = [];
      alarmIndex = 1;
      tableIndex = 1;
      stoptableIndex = 1;
      advance_retreat = false;
      speedM = [];
      timeM = [];
      mileageM = [];
      mileageMax = 0;
      speedMax = 0;
      timeMax = 0;
    },
    
    //日期转换
    UnixToDate: function (unixTime, isFull, timeZone) {
      if (typeof (timeZone) == 'number') {
        unixTime = parseInt(unixTime) + parseInt(timeZone) * 60 * 60;
      }
      var time = new Date(unixTime * 1000);
      var ymdhis = "";
      ymdhis += time.getUTCFullYear() + "-";
      ymdhis += (time.getMonth() + 1) + "-";
      ymdhis += time.getDate();
      if (isFull === true) {
        ymdhis += " " + time.getHours() + ":";
        ymdhis += time.getMinutes() + ":";
        ymdhis += time.getSeconds();
      }
      return ymdhis;
    },
    disable: function (flag) {
      if (flag == true) {
        $("#disable").attr("disabled", " disabled");
        disableFlag = false;
        return false;
      } else if (flag == false) {
        $("#disable").removeAttr("disabled");
        disableFlag = true;
        return true;
      }
      return disableFlag;

    },
    
    
    //小数点位数过滤
    fiterNumber: function (data) {
      var data = data.toString();
      data = parseFloat(data);
      return data;
    },
    //日期格式化
    formatDate: function (date, format) {
      if (!date) return;
      var dateSo = date.split(" ");
      var dateSMM = (dateSo[0].split("-"))[1] < 10 ? "0" + (dateSo[0].split("-"))[1] : (dateSo[0].split("-"))[1];
      var dateSdd = (dateSo[0].split("-"))[2] < 10 ? "0" + (dateSo[0].split("-"))[2] : (dateSo[0].split("-"))[2];
      var dateSHH = (dateSo[1].split(":"))[0] < 10 ? "0" + (dateSo[1].split(":"))[0] : (dateSo[1].split(":"))[0];
      var dateSmm = (dateSo[1].split(":"))[1] < 10 ? "0" + (dateSo[1].split(":"))[1] : (dateSo[1].split(":"))[1];
      var dateSss = (dateSo[1].split(":"))[2] < 10 ? "0" + (dateSo[1].split(":"))[2] : (dateSo[1].split(":"))[2];
      return (dateSo[0].split("-"))[0] + "-" + dateSMM + "-" + dateSdd + " " + dateSHH + ":" + dateSmm + ":" + dateSss
    },
    
    //查询
    trackDataQuery: function () {
      if (isSearch == false) {
        trackPlayback.continueAnimation();
      }
      stopDataFlag = true;
      Assembly = true;
      var carID = $("#citySel").val();
      // if (carID == "" || carID == undefined) {
      //   layer.msg(vehicleNumberChoose, {move: false});
      //   return false;
      // }
      // ;
      var chooseDate = $("#timeInterval").val().split("--");
      var ssdate = chooseDate[0];
      var sstimestamp = new Date(ssdate).getTime();
      eedate = chooseDate[1];
      var eetimestamp = new Date(eedate).getTime();
      if (eetimestamp < sstimestamp) {
        layer.msg(trackDateError, {move: false});
        return false;
      } else if (eetimestamp - sstimestamp > 604799000 && worldType != "5") {
        layer.msg(trackVehicleDateError, {move: false});
        return false;
      } else if (eetimestamp - sstimestamp > 259199000 && worldType == "5") {
        layer.msg(trackPeopleDateError, {move: false});
        return false;
      }
      var sTime = parseInt(chooseDate[0].substring(0, 10).replace(/\-/g, ""));
      var eTime = parseInt(chooseDate[1].substring(0, 10).replace(/\-/g, ""));
      // if (worldType == "vehicle") {
      //增加超待设备数据查询对比
      /*if(cdWorldType == "standby"){此判断是否需要待观察，如不影响功能，建议去掉
                for(var i = 0; i < stopArray.length; i++){
                    if(parseInt(stopArray[i][0]) >= sTime && parseInt(stopArray[i][0]) <= eTime) {
                        hasData = true;
                        playState = true;
                    }
                }
            }else{
                for(var i = 0; i < timeArray.length; i++){
                    if(parseInt(timeArray[i][0]) >= sTime && parseInt(timeArray[i][0]) <= eTime) {
                        hasData = true;
                        playState = true;
                    }
                }
            }
            if(!hasData){
                layer.msg("该时间段无数据！", {move: false});
                hasData = false;
                playState = false;
                return false;
            };*/
      // } else {
      // standbyType = "";

      // }

      $("#fenceBind").modal('show');
        trackPlayback.bindflowpress();

      // playState = true;
      // trackPlayback.clears();
      // layer.load(2);
      // map.clearMap();
      // trackPlayback.getHistory();
      setTimeout(function () {
        $("#realTimeCanArea").addClass("rtcaHidden");
      }, 500);
      //取消报警点勾选
      $("#chooseAlarmPoint").removeAttr("checked");
    },
    getTable: function (table, data, sy) {
      var dataHeight;
      if (sy !== undefined) {
        dataHeight = sy;
      } else {
        dataHeight = 221;
      }
      table = $(table).DataTable({
        "destroy": true,
        "dom": 'itprl',// 自定义显示项
        "scrollX": true,
        "scrollY": dataHeight,
        "data": data,
        "lengthChange": false,// 是否允许用户自定义显示数量
        "bPaginate": false, // 翻页功能
        "bFilter": false, // 列筛序功能
        "searching": false,// 本地搜索
        "ordering": false, // 排序功能
        "info": false,// 页脚信息
        "autoWidth": false,// 自动宽度
        "stripeClasses": [],
        "oLanguage": {// 国际语言转化
          "oAria": {
            "sSortAscending": " - click/return to sort ascending",
            "sSortDescending": " - click/return to sort descending"
          },
          "sLengthMenu": "显示 _MENU_ 记录",
          "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录。",
          "sZeroRecords": "我本将心向明月，奈何明月照沟渠，不行您再用其他方式查一下？",
          "sEmptyTable": "我本将心向明月，奈何明月照沟渠，不行您再用其他方式查一下？",
          "sLoadingRecords": "正在加载数据-请等待...",
          "sInfoEmpty": "当前显示0到0条，共0条记录",
          "sInfoFiltered": "（数据库中共为 _MAX_ 条记录）",
          "sProcessing": "<img src='../resources/user_share/row_details/select2-spinner.gif'/> 正在加载数据...",
          "sSearch": "模糊查询：",
          "sUrl": "",
          "oPaginate": {
            "sFirst": "首页",
            "sPrevious": " 上一页 ",
            "sNext": " 下一页 ",
            "sLast": " 尾页 "
          }
        },
        "order": [
          [0, null]
        ],// 第一列排序图标改为默认

      });
      table.on('order.dt search.dt', function () {
        table.column(0, {
          search: 'applied',
          order: 'applied'
        }).nodes().each(function (cell, i) {
          cell.innerHTML = i + 1;
        });
      }).draw();
    },
    
    ajaxDataFilter: function (treeId, parentNode, responseData) {
        // var binaryString = pako.deflate(JSON.stringify(test), { to: 'string' });
      // responseData = JSON.parse(ungzip(responseData.msg));
      // responseData = JSON.parse(ungzip(responseData.msg));
      if (responseData) {
        for (var i = 0; i < responseData.length; i++) {
          if (responseData[i].iconSkin != "assignmentSkin") {
            responseData[i].open = true;
          }

        }
      }
      return responseData;
    },
    zTreeBeforeClick: function () {
        
        
      return true;

    },
    
    //对象树点击
    zTreeOnClick: function (event, treeId, treeNode) {
      nowMonth = nowDate.getFullYear() + "-" + (parseInt(nowDate.getMonth() + 1) < 10 ? "0" + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate.getMonth() + 1)) + "-01";
      afterMonth = nowDate.getFullYear() + "-" + (parseInt(nowDate.getMonth() + 2) < 10 ? "0" + parseInt(nowDate.getMonth() + 2) : parseInt(nowDate.getMonth() + 2)) + "-01";
      var id = treeNode.id;
      $("#savePid").attr("value", id);
      var name = treeNode.name;
      if (treeNode.otype != 'assignment' && treeNode.otype != 'group') {
        $("#citySel").val(name);
      } else {
        $("#citySel").val('');
      }
      var type = treeNode.deviceType;
      worldType = type;
      objType = treeNode.otype;
      treeClickedType = treeNode.otype;
      var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
      var nodes = treeObj.getCheckedNodes(true);
      for (var i = 0, l = nodes.length; i < l; i++) {
        treeObj.checkNode(nodes[i], false, true);
      }
      treeObj.selectNode(treeNode, false, true);
      treeObj.checkNode(treeNode, true, true);
      // map.clearMap();
      // trackPlayback.getTable('#gpsTable', []);
      trackPlayback.getTable('#gpsTable3', [[0,'2018-12-25 12:34','未处理','分区内表具报警','','',''],
        [1,'2018-12-25','未处理','产销差过高','','',''],
        [2,'2018-12-25','未处理','夜间小流异常','','',''],
        [3,'2018-12-25','已处理','夜间小流异常','张三','2018-12-26 ','分区内有夜间施工，导致夜间正常用水量大'],
        ]);
      
      // 查询行驶数据
      // trackPlayback.getHistory("");
      // wjk 点击时隐藏播放按钮
      $("#playCarListIcon").hide();

      if(treeNode.otype == "dma"){
        $("#dma_selected").text(treeNode.name);
        var tmp_d_t = parseFloat(treeNode.leakrate);
        var colorstr;
        if(tmp_d_t < 10){
            $("#dmapredetail").removeClass()
            $("#dmapredetail").addClass("leakcolor10");
            
        }else if(tmp_d_t < 12){
            $("#dmapredetail").removeClass()
            $("#dmapredetail").addClass("leakcolor12");
        }else if(tmp_d_t < 20){
            $("#dmapredetail").removeClass()
            $("#dmapredetail").addClass("leakcolor20");
        }else if(tmp_d_t < 30){
            $("#dmapredetail").removeClass()
            $("#dmapredetail").addClass("leakcolor30");
        }else {
            $("#dmapredetail").removeClass()
            $("#dmapredetail").addClass("leakcolor30b");
        }
        
        $("#month_leaky").text(tmp_d_t);

        dma_selected = true
        dma_bindname = treeNode.name;
        dma_current_node = treeNode.name;
        var pNode = treeNode.getParentNode();
        // $("#organ_name").attr("value",pNode.name);
        $("#current_dma_no").attr("value",treeNode.dma_no);
        organ = pNode.id;
        station = treeNode.id;

        $(".realTimeCanArea").show()

        if(treeNode.dmalevel == "3"){
            show_dma_level = "3";
        }

        // trackPlayback.loadGeodata(2)
        trackPlayback.showHidePeopleOrVehicle();
        trackPlayback.getDMADetailInfo();
      }
      else{

        //map.setCenter([106.198625,37.997648])
        show_dma_level = "2";
        dma_level2_clicked = "";
        $(".realTimeCanArea").hide()
        // trackPlayback.loadGeodata(1)
      }
      dma_in_group = [];
      var childNodes = treeObj.transformToArray(treeNode);
        console.log(childNodes)
        for(var i = 0;i<childNodes.length;i++){
            if(childNodes[i].type == "dma"){
                dma_in_group.push(childNodes[i].dma_no);
            }
        }
        console.log("dma_in_group",dma_in_group)
      // trackPlayback.refreshMap_local(treeNode.name);
      $("#allMileage").text(treeNode.name);
      $("#allTime").text(0);
      $("#maxSpeend").text(0 + "km/h");
      //wjk end
      // trackPlayback.showHidePeopleOrVehicle();
      //单击时判断节点是否勾选订阅
      // trackPlayback.vehicleTreeClickGetFenceInfo(treeNode.checked, treeNode.id);

      trackPlayback.hydropressflowChart();
    },
    //当点击或dma时，访问后台返回dma详情
    getDMADetailInfo: function () {
      // ajax访问后端查询
      dma_no = $("#current_dma_no").val()
      layer.load(2);
      $.ajax({
        type: "POST",
        url: "/monitor/maprealdata/",
        data: {
          "dma_no": dma_no
        },
        dataType: "json",
        success: function (data) {
          // console.log(data)
          layer.closeAll('loading');
          if (data.success) {
            var dataList = data.dmartdata;
            var current_mon_p;
            var current_mon_in;
            var current_mon_out;
            var current_mon_leak;

            var bbbday_str = dataList.bbbday_str;
            var current_month = dataList.current_month;
            var bcurrent_month = dataList.bcurrent_month;
            var bbcurrent_month = dataList.bbcurrent_month;
            var current_day = dataList.current_day;
            var bcurrent_day = dataList.bcurrent_day;
            var bbcurrent_day = dataList.bbcurrent_day;
            var bbbcurrent_day = dataList.bbbcurrent_day;
            var current_month_sale = dataList.current_month_sale;

            var feature = data.feature;
            console.log(feature)
            if(feature){
              var features = (new ol.format.GeoJSON()).readFeatures(feature);
              // var features = (new ol.format.GeoJSON()).readFeatures(feature,{featureProjection: 'EPSG:4326'});
              
              dma_layer.getSource().clear(true);
              dma_layer.getSource().addFeatures(features);
			  var polygon = features[0].getGeometry();
                

                map.getView().fit(polygon, map.getSize()); 

            }

            // console.log(current_month)
            // 本月
            for (var i = current_month.length - 1; i >= 0; i--) {
              if(i == 0){
                current_mon_p = current_month[i];
              }else if(i==1){
                current_mon_in = current_month[i];
              }else if(i==2){
                current_mon_out = current_month[i];
              }else{
                current_mon_leak = current_month[i];
              }

            }
            // 上月
            for (var i = bcurrent_month.length - 1; i >= 0; i--) {
              if(i == 0){
                bcurrent_mon_p = bcurrent_month[i];
              }else if(i==1){
                bcurrent_mon_in = bcurrent_month[i];
              }else if(i==2){
                bcurrent_mon_out = bcurrent_month[i];
              }else{
                bcurrent_mon_leak = bcurrent_month[i];
              }

            }
            // 前月
            for (var i = bbcurrent_month.length - 1; i >= 0; i--) {
              if(i == 0){
                bbcurrent_mon_p = bbcurrent_month[i];
              }else if(i==1){
                bbcurrent_mon_in = bbcurrent_month[i];
              }else if(i==2){
                bbcurrent_mon_out = bbcurrent_month[i];
              }else{
                bbcurrent_mon_leak = bbcurrent_month[i];
              }

            }

            // 今日
            for (var i = current_day.length - 1; i >= 0; i--) {
              if(i == 0){
                current_day_p = current_day[i];
              }else if(i==1){
                current_day_in = current_day[i];
              }else if(i==2){
                current_day_out = current_day[i];
              }else{
                current_day_leak = current_day[i];
              }

            }
            // 昨日
            for (var i = bcurrent_day.length - 1; i >= 0; i--) {
              if(i == 0){
                bcurrent_day_p = bcurrent_day[i];
              }else if(i==1){
                bcurrent_day_in = bcurrent_day[i];
              }else if(i==2){
                bcurrent_day_out = bcurrent_day[i];
              }else{
                bcurrent_day_leak = bcurrent_day[i];
              }

            }
            // 前日
            for (var i = bbcurrent_day.length - 1; i >= 0; i--) {
              if(i == 0){
                bbcurrent_day_p = bbcurrent_day[i];
              }else if(i==1){
                bbcurrent_day_in = bbcurrent_day[i];
              }else if(i==2){
                bbcurrent_day_out = bbcurrent_day[i];
              }else{
                bbcurrent_day_leak = bbcurrent_day[i];
              }

            }
            // 前前日
            for (var i = bbbcurrent_day.length - 1; i >= 0; i--) {
              if(i == 0){
                bbbcurrent_day_p = bbbcurrent_day[i];
              }else if(i==1){
                bbbcurrent_day_in = bbbcurrent_day[i];
              }else if(i==2){
                bbbcurrent_day_out = bbbcurrent_day[i];
              }else{
                bbbcurrent_day_leak = bbbcurrent_day[i];
              }

            }

            $("#bbbday_str").text(bbbday_str)
            $("#month_water_out").text(bcurrent_mon_p)
            $("#current_month_sale").text(current_month_sale)
            // 本月
            $("#current_mon_p").text(current_mon_p);
            $("#current_mon_in").text(current_mon_in);
            $("#current_mon_out").text(current_mon_out);
            $("#current_mon_leak").text(current_mon_leak);
            // 上月
            $("#bcurrent_mon_p").text(bcurrent_mon_p);
            $("#bcurrent_mon_in").text(bcurrent_mon_in);
            $("#bcurrent_mon_out").text(bcurrent_mon_out);
            $("#bcurrent_mon_leak").text(bcurrent_mon_leak);
            // 前月
            $("#bbcurrent_mon_p").text(bbcurrent_mon_p);
            $("#bbcurrent_mon_in").text(bbcurrent_mon_in);
            $("#bbcurrent_mon_out").text(bbcurrent_mon_out);
            $("#bbcurrent_mon_leak").text(bbcurrent_mon_leak);

            // 今日
            $("#current_day_p").text(current_day_p);
            $("#current_day_in").text(current_day_in);
            $("#current_day_out").text(current_day_out);
            $("#current_day_leak").text(current_day_leak);
            // 昨日
            $("#bcurrent_day_p").text(bcurrent_day_p);
            $("#bcurrent_day_in").text(bcurrent_day_in);
            $("#bcurrent_day_out").text(bcurrent_day_out);
            $("#bcurrent_day_leak").text(bcurrent_day_leak);

            // 前日
            $("#bbcurrent_day_p").text(bbcurrent_day_p);
            $("#bbcurrent_day_in").text(bbcurrent_day_in);
            $("#bbcurrent_day_out").text(bbcurrent_day_out);
            $("#bbcurrent_day_leak").text(bbcurrent_day_leak);
            // 前前日
            $("#bbbcurrent_day_p").text(bbbcurrent_day_p);
            $("#bbbcurrent_day_in").text(bbbcurrent_day_in);
            $("#bbbcurrent_day_out").text(bbbcurrent_day_out);
            $("#bbbcurrent_day_leak").text(bbbcurrent_day_leak);
          }
        }
      });
    },
    
    
    //车辆树点击对象不同显示及隐藏方法
    showHidePeopleOrVehicle: function () {
      //判断点击的监控对象的协议类型
      // if (worldType == "5") {
      if (treeClickedType == "dma") {
        //隐藏车
        
        $("#warningData,#tableAlarmDate").removeClass("active");
        $("#v-travelData,#GPSData").addClass("active in").show();
        
        //计算高度赋值
              // console.log("1.")
              $("#map").css({
                "height": (lmapHeight - 241) + "px"
              });
              //表头宽度设置
              var tabWidth = $("#myTab").width();
              var tabPercent = ((tabWidth - 17) / tabWidth) * 100;
              $(".dataTables_scrollHead").css("width", tabPercent + "%");
              //列表拖动
              $("#dragDIV").mousedown(function (e) {
                tableHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
                mapHeight = $("#map").height();
                els = e.clientY;
                $(document).bind("mousemove", trackPlayback.mouseMove).bind("mouseup", trackPlayback.mouseUp);
                e.stopPropagation();
              })
              //表点击操作得到经纬度
              $("#gpsTable tbody tr").bind("click", function () {
                carLng = $(this).children("td:nth-child(11)").text();
                carLat = $(this).children("td:nth-child(12)").text();
                var nowIndex = parseInt($(this).children("td:nth-child(1)").text());
                selIndex = nowIndex - 1;
                listIndex = nowIndex - 1;
                if (nowIndex >= 4) {
                  trIndex = nowIndex - 4;
                } else {
                  trIndex = 0;
                }
                btnFlag = true;
                markerMovingControl.skip();
              });
              
              // $("#playCarListIcon").show();
              //伸缩
              // console.log("2.")

              $("#scalingBtn").unbind().bind("click", function () {
                if ($(this).hasClass("fa-chevron-down")) {
                  oldMHeight = $("#map").height();
                  oldTHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
                  $(this).attr("class", "fa  fa-chevron-up")
                  var mapHeight = windowHeight - headerHeight - titleHeight - demoHeight - 20;
                  $("#map").css({
                    "height": mapHeight + "px"
                  });
                  $(".trackPlaybackTable .dataTables_scrollBody").css({
                    "height": "0px"
                  });
                } else {
                  $(this).attr("class", "fa  fa-chevron-down");
                  $("#map").css({
                    "height": oldMHeight + "px"
                  });
                  $(".trackPlaybackTable .dataTables_scrollBody").css({
                    "height": oldTHeight + "px"
                  });
                }
              });
      } else {
        $("#scalingBtn").attr("class", "fa  fa-chevron-down");
        var mapHeight = windowHeight - headerHeight - titleHeight - demoHeight - 20;
          $("#map").css({
            "height": mapHeight + "px"
          });
          $(".trackPlaybackTable .dataTables_scrollBody").css({
            "height": "0px"
          });
      }
    },
    
    //报警数据
    tableAlarmDateClick: function () {
      $("#peopleStopData,#stopData,#peopleGPSData,#GPSData").css("display", "none");
      $("#warningData").show();
    },
    //行驶数据  车
    vehicleTravelData: function () {
      $("#peopleGPSData,#stopData").css("display", "none");
      $("#GPSData").css("display", "block");
    },
    getTreeUrl: function (treeId, treeNode) {
        // return "/dmam/district/dmatree/"
      if (treeNode == null) {
        return "/clbs/m/functionconfig/fence/bindfence/getTreeByMonitorCount";
      } else if (treeNode.otype == "assignment") {
        return "/clbs/m/functionconfig/fence/bindfence/putMonitorByAssign?assignmentId=" + treeNode.id + "&isChecked=" + treeNode.checked + "&monitorType=monitor";
      }
    },
    zTreeBeforeCheck: function (treeId, treeNode) {
      var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
      var nodes = treeObj.getCheckedNodes(true);
      for (var i = 0; i < nodes.length; i++) {
        treeObj.checkNode(nodes[i], false, true);
      }
    },
    
    //对象树加载成功
    zTreeOnAsyncSuccess: function (event, treeId, treeNode, msg) {

        trackPlayback.updateTreeNodeColor(dma_details);


      var vUuid = $('#vid').val();
      var parentId = $('#pid').val();
      if (parentId != "") {
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        var allNode = treeObj.getNodes();
        var parNode = treeObj.getNodesByParam("id", parentId, null);
        treeObj.expandNode(parNode[0], true, true, true, true); // 展开节点
        if (vUuid != "") {
          var node = treeObj.getNodesByParam("id", vUuid, null);
          if (node != null && node != undefined && node.length > 0) {
            for (var i = 0, len = node.length; i < len; i++) {
              treeObj.checkNode(node[i], true, true);
              if (crrentSubV.length == 0) { // 存入勾选数组
                crrentSubV.push(node[i].id);
              }
              var parentNode = node[i].getParentNode();
            };
            var cityObj = $("#citySel");
            if (firstFlag) {
              cityObj.val(node[0].name);
            }
            var type = node[0].deviceType;
            worldType = type;
            objType = node[0].type;
          }
          // trackPlayback.getActiveDate(vUuid, nowMonth, afterMonth);
        }
      }

        

      bflag = false;
      var zTree = $.fn.zTree.getZTreeObj(treeId);

      

      // 更新节点数量
      zTree.updateNodeCount(treeNode);
      // 默认展开200个节点
      var initLen = 0;
      notExpandNodeInit = zTree.getNodesByFilter(assignmentNotExpandFilter);
      for (i = 0; i < notExpandNodeInit.length; i++) {
        zTree.expandNode(notExpandNodeInit[i], true, true, false, true);
        initLen += notExpandNodeInit[i].children.length;
        if (initLen >= 200) {
          break;
        }
      }
    },
    zTreeOnExpand: function (event, treeId, treeNode) {
      var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
      if (treeNode.otype == "assignment" && treeNode.children === undefined) {
        var url = "/clbs/m/functionconfig/fence/bindfence/putMonitorByAssign";
        json_ajax("post", url, "json", false, {
          "assignmentId": treeNode.id,
          "isChecked": treeNode.checked,
          "monitorType": "monitor"
        }, function (data) {
          var result = JSON.parse(ungzip(data.msg));
          if (result != null && result.length > 0) {
            treeObj.addNodes(treeNode, result);
            trackPlayback.checkCurrentNodes();
          }
        })
      }
    },
    zTreeBeforeAsync: function () {
      return bflag;
    },
    zTreeOnNodeCreated: function (event, treeId, treeNode) {
      var zTree = $.fn.zTree.getZTreeObj("treeDemo");
      var id = treeNode.id.toString();
      var list = [];
      if (zTreeIdJson[id] == undefined || zTreeIdJson[id] == null) {
        list = [treeNode.tId];
        zTreeIdJson[id] = list;
      } else {
        zTreeIdJson[id].push(treeNode.tId)
      }
    },
    //左侧数据日历及对象树隐藏方法
    leftToolBarHideFn: function () {
      if ($('#scalingBtn').hasClass('fa-chevron-down')) {
        oldMHeight = $("#map").height();
        oldTHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
        $('#scalingBtn').attr('class', 'fa fa-chevron-up');
      }
      ;
      $("#content-left").hide();
      $("#content-right").attr("class", "col-md-12 content-right");
      $("#content-right").css("width", "100%");
      $("#goShow").show();
      //点击隐藏轨迹回放查询
      $("#map").css({
        "height": (initialMapH - 5) + "px"
      });
      $(".trackPlaybackTable .dataTables_scrollBody").css({
        "height": 0 + "px"
      });
    },
    //左侧数据日历及对象树显示方法
    leftToolBarShowFn: function () {
      $('#scalingBtn').attr('class', 'fa fa-chevron-down');
      if ($(".dataTables_scrollBody").length == 0) {
        $("#map").css({
          "height": initialMapH + "px"
        });
        $(".trackPlaybackTable .dataTables_scrollBody").css({
          "height": 0 + "px"
        });
      } else {
        $("#map").css({
          "height": oldMHeight + "px"
        });
        $(".trackPlaybackTable .dataTables_scrollBody").css({
          "height": oldTHeight + "px"
        });
      }
      $("#content-left").show();
      $("#content-right").attr("class", "col-md-9 content-right");
      if ($(".sidebar").hasClass("sidebar-toggle")) {
        $("#content-right").css({
          "width": 100 - newwidth + "%"
        });
        $("#content-left").css({
          "width": newwidth + "%"
        });
      } else {
        $("#content-right").css({
          "width": "75%"
        });
        $("#content-left").css({
          "width": "25%"
        });
      }
      $("#goShow").hide();
    },
    
    
    // 清除错误信息
    clearErrorMsg: function () {
      $("label.error").hide();
      $(".error").removeClass("error");
    },
    
    
    errorMsg: function (XMLHttpRequest, textStatus, errorThrown) {
      layer.closeAll('loading');
      if (textStatus === "timeout") {
        layer.msg("加载超时，请重试");
        mouseTool.close(true);
        //map.remove(RegionalQuerymarker);
        return;
      }
      if (XMLHttpRequest.responseText.indexOf("<form id=\"loginForm") > 0) {
        window.location.replace("/clbs/login?type=expired");
        return;
      }
      layer.msg("系统的情绪不稳定，并向你扔了一个错误~");
    },
    
    //时间戳转换为指定格式
    turnTimeFormat: function (time) {
      var value;
      var date = new Date(time * 1000);
      var Y = date.getFullYear() + '-';
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
      var D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + ' ';
      var h = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ':';
      var m = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + ':';
      var s = (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
      value = Y + M + D + h + m + s;
      return value;
    },
    
    //获取地址栏参数
    GetAddressUrl: function (name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]);
      return null;
    },
    warningData: function () {
      $("#gpsTable3").children("tbody").children("tr").unbind("click").bind("click", function () {
        $("#gpsTable3").children("tbody").children("tr").removeClass("tableSelected");
        var alarmDataTableTrNum = $("#gpsTable3").find("tr").length;
        for (var i = 0; i < alarmDataTableTrNum; i++) {
          $(this).addClass("tableSelected");
        }
        if (markerAlarmList[markerAlarmIndex - 1] != undefined) {
          markerAlarmList[markerAlarmIndex - 1].setAnimation('AMAP_ANIMATION_NONE');
        }
        var alarmIndex = parseInt($(this).children("td:nth-child(1)").text());
        markerAlarmIndex = alarmIndex;
        markerAlarmList[alarmIndex - 1].setAnimation('AMAP_ANIMATION_BOUNCE');
        map.setCenter(markerAlarmList[alarmIndex - 1].getPosition());
      });
    },
    
    //查询模块
    showAreaTool: function () {
      if ($("#realTimeCanArea").hasClass("rtcaHidden")) {
        $("#realTimeCanArea").removeClass("rtcaHidden");
      } else {
        $("#realTimeCanArea").addClass("rtcaHidden");
      }
    },
    
    
    //将小时分秒变成时间戳
    changedataunix: function (date) {
      var date = date.replace(/-/g, "/");
      var timestamp = new Date(date).getTime();
      timestamp = timestamp / 1000;
      return timestamp;
    },
    
    /**
     * 选中已选的节点
     */
    checkCurrentNodes: function () {
      if (crrentSubV != null && crrentSubV != undefined && crrentSubV.length !== 0) {
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        for (var i = 0; i < crrentSubV.length; i++) {
          var list = zTreeIdJson[crrentSubV[i]];
          if (list != null && list.length > 0) {
            for (var j = 0; j < list.length; j++) {
              var value = list[j];
              var znode = treeObj.getNodeByTId(value);
              if (znode != null) {
                treeObj.checkNode(znode, true, true);
              }
            }
          }
        }
      }
    },
    // 应答
    responseSocket: function () {
      trackPlayback.isGetSocketLayout();
    },
    isGetSocketLayout: function () {
      setTimeout(function () {
        if (webSocket.conFlag) {
          webSocket.subscribe(headers, '/user/' + $("#userName").text() + '/check', trackPlayback.updateTable, "/app/vehicle/inspect", null);
        } else {
          trackPlayback.isGetSocketLayout();
        }
      }, 2000);
    },
    // 应答socket回掉函数
    updateTable: function (msg) {
      if (msg != null) {
        var json = $.parseJSON(msg.body);
        var msgData = json.data;
        if (msgData != undefined) {
          var msgId = msgData.msgHead.msgID;
          // if (msgId == 0x9300) {
          //     var dataType = msgData.msgBody.dataType;
          //     $("#msgDataType").val(dataType);
          //     $("#infoId").val(msgData.msgBody.data.infoId);
          //     $("#objectType").val(msgData.msgBody.data.objectType);
          //     $("#objectId").val(msgData.msgBody.data.objectId);
          //     $("#question").text(msgData.msgBody.data.infoContent);
          //     if (dataType == 0x9301) {
          //         $("#answer").val("");
          //         $("#msgTitle").text("平台查岗");
          //         $("#goTraceResponse").modal('show');
          //         $("#error_label").hide();
          //     }
          //     if (dataType == 0x9302) {
          //         $("#answer").val("");
          //         $("#msgTitle").text("下发平台间报文");
          //         $("#goTraceResponse").modal('show');
          //     }
          // }
        }
      }
    },
    
    showErrorMsg: function (msg, inputId) {
      if ($("#error_label").is(":hidden")) {
        $("#error_label").text(msg);
        $("#error_label").insertAfter($("#" + inputId));
        $("#error_label").show();
      } else {
        $("#error_label").is(":hidden");
      }
    },
    
    //地图设置显示
    showMapView: function () {
      if (!($("#mapDropSettingMenu").is(":hidden"))) {
        $("#mapDropSettingMenu").slideUp();
      } else {
        $("#mapDropSettingMenu").slideDown();
      }
    },
    mapSetting:function () {

    },
    dmagroupdiv:function(level){
        // alert("hide dma level "+ level)
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        var nodes = treeObj.getCheckedNodes(true);
        allNodes = treeObj.getNodes();
        var childNodes = treeObj.transformToArray(allNodes[0]);
        for(var i = 0;i<childNodes.length;i++){
            // if(level=="0"){
                if(childNodes[i].isHidden){
                    treeObj.showNode(childNodes[i]);
                }
            // }
            if(childNodes[i].type == "dma" && childNodes[i].dmalevel == level){
                treeObj.hideNode(childNodes[i]);
            }
        }
    },
    // 点击二级dma分区蓝色流量方框，则该二级分区居中全图显示，然后再该分区内的三级分区都要显示
    textClicked:function(belongto_cid,clicked_dma_no){
        dma_level = 3;
        show_dma_level = "3"
        // current_organ = belongto_cid;
        $("#current_organ_id").attr("value",belongto_cid);
        // trackPlayback.loadGeodata(0)
        dma3_and_dma2 =[]
        dma3_and_dma2.push(clicked_dma_no);
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        var nodes = treeObj.getNodesByParam("id", belongto_cid, null);
        
        var childNodes = treeObj.transformToArray(nodes);
        
        var str_d = nodes[0].name;
        for(var i = 0;i<childNodes.length;i++){
            if(childNodes[i].type == "dma" && childNodes[i].dmalevel == "3"){
                dma3_and_dma2.push(childNodes[i].dma_no);
                
            }
        }
        
        trackPlayback.refreshMap_dma3();
        // show_dma_level = "2"
    },
    loadGeodata:function(dflag){
            dma_no = $("#current_dma_no").val();
            current_organ = $("#current_organ_id").val()
            map.clearMap();
            dma_in_group = [];
            map.remove(dma_list)
            dma_list=[]
            station_list = []
            $.ajax({
                type: 'POST',
                url: '/ggis/fence/bindfence/getDMAFenceDetails/',
                data: {"dma_no" : dma_no,"current_organ":current_organ,"dma_level":dma_level,"dflag":dflag},
                async:false,
                dataType: 'json',
                success: function (data) {
                    var dataList = data.obj;
                    if (dataList != null && dataList.length > 0) {
                        
                        for(var j = 0;j < dataList.length;j++){
                            polygon = data.obj[j].fenceData;
                            dmaMapStatistic = data.obj[j].dmaMapStatistic;
                            // dma 分配的站点信息
                            dmastationinfo = data.obj[j].dmastationinfo;
                            fillColor_seted = fillColor = data.obj[j].fillColor
                            // console.log(fillColor_seted)
                            strokeColor_seted = strokeColor = data.obj[j].strokeColor
                            if(fillColor === null || fillColor == ""){
                                fillColor_seted = fillColor = "#1791fc"
                            }
                            if(strokeColor === null || strokeColor == ""){
                                strokeColor_seted = strokeColor = "#FF33FF"
                            }
                            var dataArr = new Array();
                            if (polygon != null && polygon.length > 0) {
                                for (var i = 0; i < polygon.length; i++) {
                                    dataArr.push([polygon[i].longitude, polygon[i].latitude]);
                                }
                            };
                            if(data.obj !== null){
                                polyFence = new AMap.Polygon({
                                    path: dataArr,//设置多边形边界路径
                                    strokeColor:strokeColor,// "#FF33FF", //线颜色
                                    strokeOpacity: 0.9, //线透明度
                                    strokeWeight: 3, //线宽
                                    fillColor:fillColor,// "#1791fc", //填充色
                                    fillOpacity: 0.35,
                                    strokeStyle:"dashed",
                                    extData:{
                                        'dma_name':dmaMapStatistic.dma_name,
                                        'dma_level':dmaMapStatistic.dma_level,
                                        'dma_no':dmaMapStatistic.dma_no,
                                        'belongto_cid':dmaMapStatistic.belongto_cid,
                                        'leakerate':dmaMapStatistic.leakerate,
                                        'water_in':dmaMapStatistic.water_in,
                                        'readtime':dmaMapStatistic.readtime,
                                        'dmastationinfo':dmastationinfo,
                                    },
                                    //填充透明度
                                });


                                

                                // // var position = new AMap.LngLat(polygon[0].longitude,polygon[0].latitude);
                                // polyFence.on("mouseover",function(e){
                    
                                //     var position = e.lnglat;
                                //     // console.log(position);
                                //     conts = mapMonitor.createStationInfo(dmaMapStatistic.dma_name, dmaMapStatistic)

                                //     infoWindow.setContent(conts);
                                //     // markerInfoWindow.setSize(AMap.Size(400,300));
                                //     infoWindow.open(map,position);
                                // });

                                // polyFence.on("mouseout",function(){
                                //     infoWindow.close();
                                // })

                                dma_list.push(polyFence)
                                dma_details.push([dmaMapStatistic.dma_no,dmaMapStatistic.leakerate,dmaMapStatistic.dma_name])
                                dma_in_group.push(dmaMapStatistic.dma_no)
                                // dma_no_global.push(dmaMapStatistic.dma_no)
                                
                                // polyFence.setMap(map);
                                // map.setFitView(polyFence);
                                
                            }
                        }
                        dma_no_global = dma_in_group;

                        map.add(dma_list)
                        map.setFitView(dma_list);
                        console.log(dma_no_global)
                        console.log(dma_in_group)

                        trackPlayback.refreshMap_local('');
                        // 并不是每个dma分区都画了围栏，此路不通
                        // trackPlayback.updateTreeNodeColor(dma_details);
                        // console.log(dma_details)
                    }
                },      
            });
            
        },
    updateTreeNodeColor:function(data){
        //
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        var nodes = treeObj.getCheckedNodes(true);
        allNodes = treeObj.getNodes();
        var childNodes = treeObj.transformToArray(allNodes[0]);
        var all_dma_num = 0;
        var dma_leak10=0,dma_leak12=0,dma_leak20=0,dma_leak30=0,dma_leak30b=0,dma_warning_num=0;
        var dma_level1_num=0,dma_level2_num=0,dma_level3_num=0;
        for ( var j = 0; j < childNodes.length; j++) {

            if (childNodes[j].type == "group") {
                if(childNodes[j].organlevel =="1"){
                    dma_level1_num += 1;
                }
            }
            
            if (childNodes[j].type == "dma") {

                var tmp_d_t = parseFloat(childNodes[j].leakrate);

                // statstic dma level
                if(childNodes[j].dmalevel == "2"){
                    dma_level2_num += 1;
                }else if(childNodes[j].dmalevel == "3"){
                    dma_level3_num += 1;
                }
            
                //set color 
                var colorstr;
                if(tmp_d_t < 10){
                    colorstr = dma_color_list[0];
                    dma_leak10 += 1;
                }else if(tmp_d_t < 12){
                    colorstr = dma_color_list[1];
                    dma_leak12 += 1;
                }else if(tmp_d_t < 20){
                    colorstr = dma_color_list[2];
                    dma_leak20 += 1;
                }else if(tmp_d_t < 30){
                    colorstr = dma_color_list[3];
                    dma_leak30 += 1;
                }else {
                    colorstr = dma_color_list[4];
                    dma_leak30b += 1;
                }
                treeObj.setting.view.fontCss["color"] = colorstr;
                
                //调用updateNode(node)接口进行更新
                treeObj.updateNode(childNodes[j]);
                
                
            }
        }

        all_dma_num = dma_leak10 + dma_leak12 + dma_leak20 + dma_leak30 + dma_leak30b;
        $("#all_dma_num").text(all_dma_num);
        $("#dma_leak10").text(dma_leak10);
        $("#dma_leak12").text(dma_leak12);
        $("#dma_leak20").text(dma_leak20);
        $("#dma_leak30").text(dma_leak30);
        $("#dma_leak30b").text(dma_leak30b);
        $("#dma_warning_num").text(dma_warning_num);

        $("#dma_level1_num").text(dma_level1_num);
        $("#dma_level2_num").text(dma_level2_num);
        $("#dma_level3_num").text(dma_level3_num);
    },
    refreshMap_dma3:function(){
        
            var mapBounds = map.getBounds();
            var southWest = new AMap.LngLat(mapBounds.southwest.lng, mapBounds.southwest.lat);
            var northEast = new AMap.LngLat(mapBounds.northeast.lng, mapBounds.northeast.lat);

            var bounds = new AMap.Bounds(southWest, northEast)
            var rectangle = new AMap.Rectangle({
                  map: map,
                  bounds: bounds,
                  strokeColor:'#FFFFFF',
                  strokeWeight:1,
                  strokeOpacity:0,
                  fillOpacity:0,
                  zIndex:0,
                  bubble:true

            });
            // console.log(mapBounds)
            // console.log(bounds)
            
            var polygon1_path = rectangle.getPath();
            // var polygon2_path = polygon2.getPath();
            // 小圈是否在大圈内
            // var isRingInRing = AMap.GeometryUtil.isRingInRing(polygon2_path,polygon1_path);
            // 两圈是否交叉
            // var doesRingRingIntersect = AMap.GeometryUtil.doesRingRingIntersect(polygon2_path,polygon1_path);
            map.clearMap();
            var tmp_dma_fresh = []
      var marklist = [];
            var count_dma_2_in = 0;
            for(var i=0;i<dma_list.length;i++){
                var tdma = dma_list[i];
                var polygon2_path = tdma.getPath();
                var tdma_no = tdma.getExtData().dma_no;
                if($.inArray(tdma_no,dma3_and_dma2) < 0){
                    // console.log(tdma_no,'not in selected group')
                    continue;
                }
                var tdma_name = tdma.getExtData().dma_name; 
                var water_in = tdma.getExtData().water_in;
                var readtime = tdma.getExtData().readtime;
                var show_text = tdma_name + "<br/>" + water_in + "m³/h<br/>" + readtime;
                var tdma_name = tdma.getExtData().dma_name; 

                
                // 创建纯文本标记 
                var text = new AMap.Text({
                    text:show_text,
                    textAlign:'center', // 'left' 'right', 'center',
                    verticalAlign:'middle', //middle 、bottom
                    draggable:true,
                    clickable:true,
                    cursor:'pointer',
                    // angle:10,
                    style:{
                        'padding': '.75rem 1.25rem',
                        'margin-bottom': '1rem',
                        'border-radius': '.25rem',
                        'background-color': '#169bd5',
                        'width': '10rem',
                        'border-width': 0,
                        'box-shadow': '0 2px 6px 0 rgba(114, 124, 245, .5)',
                        'text-align': 'center',
                        'font-size': '12px',
                        'color': 'white'
                    },
                    
                    position: trackPlayback.calculateCenter(polygon2_path) //[116.396923,39.918203]
                });

          // 创建dma内站点信息
          if(isTrafficDisplay){
            
            var dmastationinfo = tdma.getExtData().dmastationinfo;
            // console.log(dmastationinfo)
            for(var j =0;j < dmastationinfo.length;j++){
              station = dmastationinfo[j];
              mark = trackPlayback.createMarker(station);
              marklist.push(mark);
            }
            

          }

          tmp_dma_fresh.push(tdma)
          text.setMap(map)
      }


      if(marklist.length > 0){
              map.add(marklist);
            }
      // map.remove(dma_list)
      map.add(tmp_dma_fresh)
      map.setFitView(tmp_dma_fresh);


        },

        builddmashowinfo:function(dma,polygon1_path){
          var marklist=[];
          var tmp_dma_fresh = [];

          var tdma_no = dma.getExtData().dma_no;
          var tdma_name = dma.getExtData().dma_name; 
          var tdma_level = dma.getExtData().dma_level;
          var tdma_belongto_cid = dma.getExtData().belongto_cid;
          var polygon2_path = dma.getPath();
          var water_in = dma.getExtData().water_in;
          var readtime = dma.getExtData().readtime;
          var show_text = tdma_name + "<br/>" + water_in + "m³/h<br/>" + readtime;
          // 创建纯文本标记 
          var text = new AMap.Text({
              text:show_text,
              textAlign:'center', // 'left' 'right', 'center',
              verticalAlign:'middle', //middle 、bottom
              draggable:true,
              clickable:true,
              cursor:'pointer',
              // angle:10,
              style:{
                  'padding': '.75rem 1.25rem',
                  'margin-bottom': '1rem',
                  'border-radius': '.25rem',
                  'background-color': '#169bd5',
                  'width': '10rem',
                  'border-width': 0,
                  'box-shadow': '0 2px 6px 0 rgba(114, 124, 245, .5)',
                  'text-align': 'center',
                  'font-size': '12px',
                  'color': 'white'
              },
              extData:{
                  'dma_name':tdma_name,
                  'dma_level':tdma_level,
                  'dma_no':tdma_no,
                  'belongto_cid':tdma_belongto_cid,
              },
              position: trackPlayback.calculateCenter(polygon2_path) //[116.396923,39.918203]
          });

          text.on("click",function(e){
              // console.log(e,e.target.getExtData().belongto_cid);
              var belongto_cid = e.target.getExtData().belongto_cid;
              var clicked_dma_no = e.target.getExtData().dma_no;
              trackPlayback.textClicked(belongto_cid,clicked_dma_no);
              dma_level2_clicked = e.target.getExtData().dma_name;

              
          })

          // 创建dma内站点信息
          if(isTrafficDisplay){
            
            var dmastationinfo = dma.getExtData().dmastationinfo;
            // console.log(dmastationinfo)
            for(var j =0;j < dmastationinfo.length;j++){
              station = dmastationinfo[j];
              mark = trackPlayback.createMarker(station);
              marklist.push(mark);
            }
            

          }

          tmp_dma_fresh.push(dma)
          text.setMap(map);

          if(marklist.length > 0){
              map.add(marklist);
            }

          map.add(tmp_dma_fresh)
          map.setFitView(tmp_dma_fresh);
        },
        // 只显示二级分区，三级分区另外函数实现
        refreshMap_local:function(dname){
            var mapBounds = map.getBounds();
            var southWest = new AMap.LngLat(mapBounds.southwest.lng, mapBounds.southwest.lat);
            var northEast = new AMap.LngLat(mapBounds.northeast.lng, mapBounds.northeast.lat);

            var bounds = new AMap.Bounds(southWest, northEast)
            var rectangle = new AMap.Rectangle({
                  map: map,
                  bounds: bounds,
                  strokeColor:'#FFFFFF',
                  strokeWeight:1,
                  strokeOpacity:0,
                  fillOpacity:0,
                  zIndex:0,
                  bubble:true

            });
            // console.log(mapBounds)
            console.log("dname=",dname)
            
            // console.log('dma_in_group:',dma_in_group)
            var polygon1_path = rectangle.getPath();

            map.clearMap();

            if(dname != ""){
              var  cdma="";
              for(var t=0;t<dma_list.length;t++){
                var tdm = dma_list[t];
                if(dname == tdm.getExtData().dma_name || dname == tdm.getExtData().dma_no){
                  cdma = tdm;
                  break;
                }
              }
              if(cdma == "")
                return
              trackPlayback.builddmashowinfo(cdma,polygon1_path);
              dma_current_node = "";
              return;
            }
            console.log("dname=",dname)
            
            // var polygon2_path = polygon2.getPath();
            // 小圈是否在大圈内
            // var isRingInRing = AMap.GeometryUtil.isRingInRing(polygon2_path,polygon1_path);
            // 两圈是否交叉
            // var doesRingRingIntersect = AMap.GeometryUtil.doesRingRingIntersect(polygon2_path,polygon1_path);
            
            var tmp_dma_fresh = []
            var marklist = [];
            var count_dma_2_in = 0;
            for(var i=0;i<dma_list.length;i++){
                var tdma = dma_list[i];
                var polygon2_path = tdma.getPath();
                var tdma_no = tdma.getExtData().dma_no;
                if($.inArray(tdma_no,dma_in_group) < 0){
                    // console.log(tdma_no,'not in selected group')
                    continue;
                }
                // in
                var isRingInRing = AMap.GeometryUtil.isRingInRing(polygon2_path,polygon1_path);
                if(dname != ''){
                  isRingInRing = true;
                }
                if(isRingInRing ){
                    var tdma_name = tdma.getExtData().dma_name; 
                    var tdma_level = tdma.getExtData().dma_level;
                    var tdma_belongto_cid = tdma.getExtData().belongto_cid;
                    if(tdma_level == "2"){
                        count_dma_2_in += 1;
                    }
                    else{
                      // console.log("show_dma_level",show_dma_level)
                      // console.log("dname=",dname)
                      // if(show_dma_level == ""){
                      //   if(dname == '')
                      //     continue;

                      // }
                      // else{
                      //   if(show_dma_level !== "3")
                      //     continue;
                      // }
                      continue;
                    }
                    
                    var water_in = tdma.getExtData().water_in;
                    var readtime = tdma.getExtData().readtime;
                    var show_text = tdma_name + "<br/>" + water_in + "m³/h<br/>" + readtime;
                    // 创建纯文本标记 
                    var text = new AMap.Text({
                        text:show_text,
                        textAlign:'center', // 'left' 'right', 'center',
                        verticalAlign:'middle', //middle 、bottom
                        draggable:true,
                        clickable:true,
                        cursor:'pointer',
                        // angle:10,
                        style:{
                            'padding': '.75rem 1.25rem',
                            'margin-bottom': '1rem',
                            'border-radius': '.25rem',
                            'background-color': '#169bd5',
                            'width': '10rem',
                            'border-width': 0,
                            'box-shadow': '0 2px 6px 0 rgba(114, 124, 245, .5)',
                            'text-align': 'center',
                            'font-size': '12px',
                            'color': 'white'
                        },
                        extData:{
                            'dma_name':tdma_name,
                            'dma_level':tdma_level,
                            'dma_no':tdma_no,
                            'belongto_cid':tdma_belongto_cid,
                        },
                        position: trackPlayback.calculateCenter(polygon2_path) //[116.396923,39.918203]
                    });

                    text.on("click",function(e){
                        // console.log(e,e.target.getExtData().belongto_cid);
                        var belongto_cid = e.target.getExtData().belongto_cid;
                        var clicked_dma_no = e.target.getExtData().dma_no;
                        trackPlayback.textClicked(belongto_cid,clicked_dma_no);
                        dma_level2_clicked = e.target.getExtData().dma_name;
        
                        
                    })

                    // 创建dma内站点信息
                    if(isTrafficDisplay){
                      
                      var dmastationinfo = tdma.getExtData().dmastationinfo;
                      // console.log(dmastationinfo)
                      for(var j =0;j < dmastationinfo.length;j++){
                        station = dmastationinfo[j];
                        mark = trackPlayback.createMarker(station);
                        marklist.push(mark);
                      }
                      

                    }

                    tmp_dma_fresh.push(tdma)
                    text.setMap(map);
                    
                }
                
            }

            // if(count_dma_2_in > 2){
            //             break;
            //         }
            
            // map.remove(dma_list)
            if(marklist.length > 0){
              map.add(marklist);
            }
            map.add(tmp_dma_fresh)
            map.setFitView(tmp_dma_fresh);


        },
        createMarker:function(station){
            var position = new AMap.LngLat(station.lng,station.lat);
            var marker = new AMap.Marker({
                position: position,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                title: station.stationname,
                // icon:'/static/scada/img/bz_s.png'
            });

 
            
            conts = trackPlayback.markerContent( station);
            marker.content = trackPlayback.createInfoWindow("title", conts);
            // marker点击事件
            // marker.on("click",function(e){
            //     // conts = mapSecondwater.createSecondwaterInfo(station.stationname, station)
            //     // console.log(conts)
            //     infow.setContent(e.target.content);
            //     infow.open(map, e.target.getPosition());
            // });
            // marker.emit('click', {target: marker});

            marker.on("mouseover",function(e){
                
                infow.setContent(e.target.content);
                infow.open(map,e.target.getPosition());
                // console.log("info window is Open?"+infow.getIsOpen())
                // console.log("info window content:"+infow.getContent())
                // console.log("info window position:"+infow.getPosition())
                // console.log("info window size:"+infow.getSize())
            });

            marker.on("mouseout",function(){
                infow.close();
            })

            return marker;
        },
        infoWindow:function(){
            // overlay = document.getElementById('js-overlay');
            markerInfoWindow = new AMap.InfoWindow({
                isCustom: true,  //使用自定义窗体
                // content: mapSecondwater.createInfoWindow(title, content.join("<br/>")),
                // size:new AMap.Size(400,300),
                offset: new AMap.Pixel(16, -45),
                // autoMove: true
            });
            return markerInfoWindow;
        },
        markerContent:function(station){
            content = [];
            content.push('名称:<span style="color:#0099CC;">'+station.name+"</span>");
            content.push('表类型:<span >'+station.station_type+"</span>");
            
            
            
            return content.join("<br/>");
        },
        //构建自定义信息窗体
        createInfoWindow:function (title, content) {
            var info = document.createElement("div");
            // info.className = "info";
            info.className = "custom-info input-card content-window-card";
            //可以通过下面的方式修改自定义窗体的宽高
            //info.style.width = "400px";
            // 定义顶部标题
            // var top = document.createElement("div");
            // var titleD = document.createElement("div");
            // var closeX = document.createElement("img");
            // top.className = "info-top";
            // titleD.innerHTML = title;
            // closeX.src = "http://webapi.amap.com/images/close2.gif";
            // closeX.onclick = mapSecondwater.closeInfoWindow();
     
            // top.appendChild(titleD);
            // top.appendChild(closeX);
            // info.appendChild(top);
     
            // 定义中部内容
            var middle = document.createElement("div");
            middle.className = "info-middle";
            middle.style.backgroundColor = 'white';
            middle.innerHTML = content;
            info.appendChild(middle);
     
            // 定义底部内容
            var bottom = document.createElement("div");
            bottom.className = "info-bottom";
            bottom.style.position = 'relative';
            bottom.style.top = '0px';
            bottom.style.margin = '0 auto';
            var sharp = document.createElement("img");
            sharp.src = "http://webapi.amap.com/images/sharp.png";
            bottom.appendChild(sharp);
            info.appendChild(bottom);
            return info;
        },
        calculateCenter: function(lnglatarr){
          var total = lnglatarr.length;
          var X=0,Y=0,Z=0;
          $.each(lnglatarr, function(index, lnglat) {
            var lng = lnglat.lng * Math.PI / 180;
            var lat = lnglat.lat * Math.PI / 180;
            var x,y,z;
            x = Math.cos(lat) * Math.cos(lng);
            y = Math.cos(lat) * Math.sin(lng);
            z = Math.sin(lat);
            X += x;
            Y += y;
            Z += z;
          });

          X = X/total;
          Y = Y/total;
          Z = Z/total;

          var Lng = Math.atan2(Y,X);
          var Hyp = Math.sqrt(X*X + Y*Y);
          var Lat = Math.atan2(Z,Hyp);

          return new AMap.LngLat(Lng*180/Math.PI,Lat*180/Math.PI);
        },
    // 水力分布流量和压力图标
        hydropressflowChart:function(){

            options = {
                backgroundColor: '#FFFFFF',
                
                title: {
                    text: '近7日流量压力曲线图',
                    left:'left',
                    textStyle:{
                        fontSize:12,
                        fontWeight:'100'
                    },
                },
                // tooltip: {
                //     trigger: 'axis',
                //     axisPointer: { // 坐标轴指示器，坐标轴触发有效
                //         type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                //     }
                // },
                
                legend: {
                    data: ['流量'],
                    
                },
                    grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                    },
                
                xAxis: [{
                    type: 'category',
                     boundaryGap: false,
                    //show:false,
                    data: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','20','31','32','33','34','35','36','37','38','39','40'],
                    axisLabel:{
                        textStyle:{
                            fontSize:10
                        }
                    }
                }],
                yAxis: {
                    type: 'value',
                    //show:false,
                  //  name: '流量',
                    // min: 0,
                     max: 10,
                    interval: 10,
                    splitLine:{
                        show:false,
                    }
                },
                series: [{
                    name: 'flow',
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#7acf88',
                            // areaStyle:{type:'default'}
                        },
                    },
                    
                    data: [4,6,3,7,2,4,4,4,1,2,3,2,6,3,2,0,1,2,4,0,4,6,3,7,2,4,4,4,1,2,3,2,6,3,2,0,1,2,4,0]
                }]
            };

            recent7flowpress = echarts.init(document.getElementById('recent7flowpress'));
            recent7flowpress.setOption(options);
            
        },
        // 水力分布流量和压力图标
        bindflowpress:function(){

            option = {
                // title : {
                //     text: '未来一周气温变化',
                //     subtext: '纯属虚构'
                // },
                tooltip : {
                    trigger: 'axis'
                },
                legend: {
                    data:['MNF','流量','压力','背景漏损']
                },
                
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data : ['2018-11-15','2018-11-16','2018-11-17','2018-11-18','2018-11-19','2018-11-20','2018-11-21']
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        name : '时用水量(m³/h)',
                        nameLocation : 'middle',
                        nameGap : 80,
                        axisLabel : {
                            formatter: '{value} '
                        }
                    }
                ],
                series : [
                    {
                        name:'MNF',
                        type:'line',
                        data:[11, 11, 15, 13, 12, 13, 10],
                        
                    },
                    {
                        name:'流量',
                        type:'line',
                        data:[10, 12, 7, 5, 9, 2, 6],
                        
                    },
                    {
                        name:'压力',
                        type:'line',
                        data:[2, 5, 8, 7, 9, 3, 10],
                        
                    },
                    {
                        name:'背景漏损',
                        type:'line',
                        data:[1, -2, 2, 5, 3, 2, 0],
                        
                    }
                ]
            };
                                

            bindflowpressChart = echarts.init(document.getElementById('bindflowpress'));
            bindflowpressChart.setOption(option);

            $('#fenceBind').on('shown.bs.modal',function(){
                bindflowpressChart.resize()
            })
            
        },
        
  }
  $(function () {
    $('input').inputClear().on('onClearEvent', function (e, data) {
      var id = data.id;
      if (id == 'citySel') {
        bflag = true;
        $('#vid').val("");
        $('#pid').val("");
        $.fn.zTree.init($("#treeDemo"), setting, null);
      }
      ;
      if (id == 'vFenceSearch') {
        search_ztree('vFenceTree', id, 'fence');
      }
      ;
    });
    
    var playState = false;
    isFlag = false;

    ol3ops.init();
    trackPlayback.init();
    // trackPlayback.responseSocket();

    // ----------------------------------------------------------
    //设置最大值
    ScrollBar.maxValue = 40000;
    //初始化
    ScrollBar.Initialize();
    //设置最大值
    ProgressBar.maxValue = 100;
    // trackPlayback.loadGeodata(0);
    var old_r7fp =  $("#recent7flowpress").width();
    $("#toggle-left").on("click", trackPlayback.toggleBtn);
    $("#realTimeBtn .mapBtn").on("click", trackPlayback.mapBtnActive);
    $("#showStation").on("click", trackPlayback.showStation);
    $("#trackPlayQuery").on("click", trackPlayback.trackDataQuery);
    
    $("#warningData").on("click", trackPlayback.warningData);
    // 树结构模糊搜索
    $("#citySel").on('input propertychange', function (value) {
      if (inputChange !== undefined) {
        clearTimeout(inputChange);
      }
      inputChange = setTimeout(function () {
        firstFlag = false;
        var param = $("#citySel").val();
        trackPlayback.searchVehicleTree(param);
      }, 500);
    });
    // 滚动展开
    $("#treeDemo").scroll(function () {
      var zTree = $.fn.zTree.getZTreeObj("treeDemo");
      zTreeScroll(zTree, this);
    });
    $("#timeInterval").dateRangePicker(
        {
          'element': '#query',
          'dateLimit': 7
        });
    //IE9
    console.log(navigator.appName,'version:',navigator.appVersion);
    if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE9.0") {
      var search;
      $("#citySel").bind("focus", function () {
        search = setInterval(function () {
          var param = $("#citySel").val();
          trackPlayback.searchVehicleTree(param);
        }, 500);
      }).bind("blur", function () {
        clearInterval(search);
      });
    }
    //IE9 end
    $("#goRealTime").mouseover(function () {
      $(this).css({
        "color": "#6dcff6"
      }).children("a").css("color", "#6dcff6");
    }).mouseout(function () {
      $(this).css({
        "color": "#767676"
      }).children("a").css("color", "#767676");
    });
    $("#goHidden").on("click", trackPlayback.leftToolBarHideFn);
    $("#goShow").on("click", trackPlayback.leftToolBarShowFn);
    $("#setMap").on("click", trackPlayback.satelliteMapSwitching);
    
    $(".areaTool").on("click", trackPlayback.showAreaTool);
    setTimeout(function () {
      $(document).scrollTop(0);
    }, 1000);
    // 数据表格导出
    $('#tableDataExport').on('click', trackPlayback.exportTableData);
    

    //地图设置
    $("#showStation").attr("checked", isTrafficDisplay);
    $("#mapDropSetting").on("click", trackPlayback.showMapView);
    //谷歌地图
    $("#googleMap").on('click',trackPlayback.showGoogleMapLayers);

    $("#dma_level2_div").on('click',function(){
        trackPlayback.dmagroupdiv("3");
    });
    $("#dma_level3_div").on('click',function(){
        trackPlayback.dmagroupdiv("2");
    });
    $("#refreshTable").on('click',function(){
        trackPlayback.dmagroupdiv("0");
    });

  });
}($, window))


