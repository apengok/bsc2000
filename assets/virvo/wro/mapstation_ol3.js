
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
  var selectTreeId = '';
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
      contentmapStation = [], alarmIndex = 1, tableIndex = 1, stoptableIndex = 1,
      nextIndexs = 1, open = 1, advance_retreat = false, Assembly = false, btnFlag = false, markerStopFlag = false,
      flagBackGo = false, flagBack = false, speed = 20000, selIndex = 0, trIndex = 0,
      mileageMax = 0, speedMax = 0, timeMax = 0, goDamoIndex = 0, markerAlarmIndex = 0, stopIndexs = 0,
      angleList = [], dragTableHeight, objectType,$myTab = $("#myTab"), $MapContainer = $("#MapContainer"), $panDefLeft = $("#panDefLeft"), 
      $contentLeft = $("#content-left"), $contentRight = $("#content-right"), $sidebar = $(".sidebar"), $mainContentWrapper = $(".main-content-wrapper");


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

    var vectorLayer1;

    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
         // src: 'https://openlayers.org/en/v3.20.1/examples/data/icon.png'
            src: '/static/virvo/images/20200929154640.png'

        }))
      });

    var ol3ops = {
        init:function(){
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
                      text: name //map.getView().getZoom() > 12 ? feature.get('description') : 'text--'
                    })
                    
                })
                feature.setStyle(style);
                
            };
            vectorLayer1 = new ol.layer.Vector({
                projection: 'EPSG:4326',
                source: new ol.source.Vector(),
                // style : dma_style,
            });

            
            var controls = [
                new ol.control.Attribution({collapsed: false}),
                // new ol.control.FullScreen(),
                new ol.control.MousePosition({projection: 'EPSG:4326',coordinateFormat: ol.coordinate.createStringXY(5)}),
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


            var longitude = $("#entlongitude").val();
            var latitude = $("#entlatitude").val();
            var zoomIn = $("#entzoomIn").val();
            var maxZoom = 18;


            if(longitude == "" || latitude == "" || zoomIn == ""){
                longitude = 113.93125
                latitude = 22.53579
                zoomIn = 16
            }
            else{
                longitude = Number.parseFloat(longitude);
                latitude = Number.parseFloat(latitude);
                zoomIn = Number.parseFloat(zoomIn);
            }
            if(navigator.appName == "Microsoft Internet Explorer")
            {
            if(zoomIn > 9)
                zoomIn = 9;
            maxZoom = 13;
            }

            var center = [longitude,latitude];
            map = new ol.Map({
                layers: [vec_layer,cta_wlayer,cva_clayer,vectorLayer1],
                controls: controls,
                target: 'map',
                view: new ol.View({
                    projection: 'EPSG:4326',
                    center: center,
                //   center:  new ol.proj.transform(center,"EPSG:4326","EPSG:3857"),
                    maxZoom : 18,
                    zoom: 4
                })
              });

              var element = document.getElementById('popup');
              var popup = new ol.Overlay({
                element: element,
                positioning: 'top-center',
                stopEvent: false,
                offset: [0, -50]
                });
                map.addOverlay(popup);
                
        
                // display popup on click
              map.on('pointermove', function(evt) {
                //   console.log(evt);
                var feature = map.forEachFeatureAtPixel(evt.pixel,
                    function(feature) {
                      return feature;
                    });
                if (feature) {
                  var coordinates = feature.getGeometry().getCoordinates();
                  popup.setPosition(coordinates);
                  console.log(coordinates)
                //   $(element).popover({
                //     'placement': 'top',
                //     'html': true,
                //     'content': feature.get('name')
                //   });
                  console.log($(element))
                  element.innerHTML = '';
                  var content = mapStation.createStationInfo('demo',feature.get('properties'));
                  console.log(content);
                  element.appendChild(content);
                //   element.innerHTML = content;
                  element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                //   $(element).popover('destroy');
                }
              });

            

            // 行政区划查询
            // var opts = {
            //     subdistrict: 1,   //返回下一级行政区
            //     level: 'city',
            //     showbiz: false  //查询行政级别为 市
            // };
            // district = new AMap.DistrictSearch(opts);//注意：需要使用插件同步下发功能才能这样直接使用
            // district.search('中国', function (status, result) {
            //     if (status == 'complete') {
            //         fenceOperation.getData(result.districtList[0]);
            //     }
            // });


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
        



    };//ol3op end


  mapStation = {
    //初始化
    init: function () {
      
            
      //监听窗口变化
      
      
      nowMonth = nowDate.getFullYear() + "-" + (parseInt(nowDate.getMonth() + 1) < 10 ? "0" + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate.getMonth() + 1)) + "-01"
      afterMonth = nowDate.getFullYear() + "-" + (parseInt(nowDate.getMonth() + 2) < 10 ? "0" + parseInt(nowDate.getMonth() + 2) : parseInt(nowDate.getMonth() + 2)) + "-01";
      startTime = nowDate.getFullYear()
          + "-" + (parseInt(nowDate.getMonth() + 1) < 10 ? "0" + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate.getMonth() + 1))
          + "-" + (nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate()) + " " + "00:00:00";
      endTime = nowDate.getFullYear()
          + "-" + (parseInt(nowDate.getMonth() + 1) < 10 ? "0" + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate.getMonth() + 1))
          + "-" + (nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate()) + " " + ("23") + ":" + ("59") + ":" + ("59");
      $("#timeInterval").val(startTime + "--" + endTime);
      logoWidth = $("#header .brand").width();
      btnIconWidth = $("#header .toggle-navigation").width();
      windowWidth = $(window).width();
     // newwidth = (logoWidth + btnIconWidth + 40 + 6) / windowWidth * 100;
      newwidth = 300 / windowWidth * 100;
      $("#content-left").css({
       // "width": newwidth + "%"
       "width": 310 + "px"
      });
      $("#content-right").css({
        //"width": 100 - newwidth + "%"
        "width": windowWidth - 310 + "px"
      });
      $(".sidebar").attr("class", "sidebar sidebar-toggle");
      //$(".main-content-wrapper").attr("class","main-content-wrapper main-content-toggle-left");
      windowHeight = $(window).height();
      headerHeight = $("#header").height();//顶部的高度
      panelHead = $(".panel-heading").height() + 20;//标题栏高度
      citySelHght = $("#citySel").parent().height() + 10;//输入框高度
      //日历高亮
      
      calHeight = 240
      zTreeHeight = windowHeight - headerHeight - panelHead - calHeight - citySelHght - 26;
      $("#treeDemo").css("height", zTreeHeight + "px");
      if (windowHeight <= 667) {
        $("#treeDemo").css("height", 150 + "px");
      }
      if (windowHeight <= 880) {
        $("#realTimeCanArea").css("top", "175px");
      }
      titleHeight = $(".panHeadHeight").height() + 30;
      demoHeight = $("#Demo").height();
      mapHeight = initialMapH = windowHeight - headerHeight;// - titleHeight ;// - 20;
      $("#operationMenu").css("height", windowHeight - headerHeight + "px");
      $(".sidebar").css('height', windowHeight - headerHeight + "px");
      $("#map").css({
        "height": mapHeight + "px"
      });
      operMenuHeight = $("#operationMenu").height();
      newOperHeight = windowHeight - headerHeight;
      $("#operationMenu").css({
        "height": newOperHeight + "px"
      });
      oldMapHeight = $("#map").height();
      myTabHeight = $("#myTab").height();
      wHeight = $(window).height();

      window.onresize=function(){
        winHeight = $(window).height();//可视区域高度
        headerHeight = $("#header").height();//头部高度
          var tabHeight = $("#myTab").height();//信息列表table选项卡高度
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
          // $thetree.css({
          //     "height": newTreeH + "px"
          // });
          //视频区域自适应
          var mainContentHeight = $contentLeft.height();
          var adjustHeight = $(".adjust-area").height();
          videoHeight = (mainContentHeight - adjustHeight - 65) / 2;
          $(".videoArea").css("height", videoHeight + "px");
      }

      // ol3

    


    
      //实时路况
      // realTimeTraffic = new AMap.TileLayer.Traffic();
      // realTimeTraffic.setMap(map);
      // realTimeTraffic.hide();
      //页面区域定位
      $(".amap-logo").attr("href", "javascript:void(0)").attr("target", "");
      
      lmapHeight = $("#map").height();
      Math.formatFloat = function (f, digit) {
        var m = Math.pow(10, digit);
        return parseInt(f * m, 10) / m;
      };
      
      
    
      setting = {
        async: {
          url: "/api/entm/organization/tree/", //mapStation.getTreeUrl,
          type: "get",
          enable: true,
          autoParam: ["id"],
          dataType: "json",
          otherParam: {"type": "single",
                        "isOrg" : "1",
                        // "isDma" : "1",
                    },
          dataFilter: mapStation.ajaxDataFilter
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
          // beforeCheck: mapStation.zTreeBeforeCheck,
          // onCheck: mapStation.onCheck,
          beforeClick: mapStation.zTreeBeforeClick,
          onAsyncSuccess: mapStation.zTreeOnAsyncSuccess,
          // onExpand: mapStation.zTreeOnExpand,
          // beforeAsync: mapStation.zTreeBeforeAsync,
          // onNodeCreated: mapStation.zTreeOnNodeCreated,
          onClick: mapStation.zTreeOnClick,
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
      
      ol3ops.init();

    },
    createMarker: function(station){
        var marker = new ol.Feature({
            geometry: new ol.geom.Point([station.lng,station.lat]),
            properties: station.properties,
            population: 4000,
            rainfall: 500
        });
        marker.setStyle(iconStyle);

        return marker;
    },
    createStationInfo:function (title, content) {
        var info = document.createElement("div");
        info.className = "info";
 
        //可以通过下面的方式修改自定义窗体的宽高
        //info.style.width = "400px";
        // 定义顶部标题
        var stationname = document.createElement("div");
        stationname.innerHTML = "站点名称:" ;
        var span = document.createElement("span");
        span.className = "span2";
        span.innerHTML = content.username;
        stationname.appendChild(span);
        info.appendChild(stationname);
        
        var belongto = document.createElement("div");
        belongto.innerHTML = "所属组织:";
        var span = document.createElement("span");
        span.className = "span1";
        span.innerHTML = content.belongto;
        belongto.appendChild(span);
        info.appendChild(belongto);
        
        var relatemeter = document.createElement("div");
        relatemeter.innerHTML = "关联表具:";
        var span = document.createElement("span");
        span.className = "span1";
        span.innerHTML = content.meter;
        relatemeter.appendChild(span);
        info.appendChild(relatemeter);
        
        var metertype = document.createElement("div");
        metertype.innerHTML = "表具类型:";
        var span = document.createElement("span");
        span.className = "span1";
        span.innerHTML = content.metertype;
        metertype.appendChild(span);
        info.appendChild(metertype);
        
        var meterdn = document.createElement("div");
        meterdn.innerHTML = "表具口径:";
        var span = document.createElement("span");
        span.className = "span1";
        span.innerHTML = content.dn;
        meterdn.appendChild(span);
        info.appendChild(meterdn);
        
        var meterstate = document.createElement("div");
        meterstate.innerHTML = "状&nbsp; &nbsp; &nbsp; 态:";
        var span = document.createElement("span");
        if(content.commstate == "在线"){
            span.className = "span3";
        }else{
            span.className = "span4";
        }
        span.innerHTML = content.commstate;
        meterstate.appendChild(span);
        info.appendChild(meterstate);
        
        var split = document.createElement("img");
        split.src = "/static/virvo/images/u3922.png";
        info.appendChild(split);

        var readtime = document.createElement("div");
        readtime.innerHTML = "采集时间:";
        var span = document.createElement("span");
        span.className = "span1";
        span.innerHTML = content.fluxreadtime;
        readtime.appendChild(span);
        info.appendChild(readtime);
        
        var flux = document.createElement("div");
        flux.innerHTML = "瞬时流量:";
        var span = document.createElement("span");
        span.className = "span1";
        span.innerHTML = content.flux;
        flux.appendChild(span);
        info.appendChild(flux);
        
        var accumuflux = document.createElement("div");
        accumuflux.innerHTML = "累积流量:";
        var span = document.createElement("span");
        span.className = "span1";
        span.innerHTML = content.plustotalflux;
        accumuflux.appendChild(span);
        info.appendChild(accumuflux);
        
        var press = document.createElement("div");
        press.innerHTML = "管网压力:";
        var span = document.createElement("span");
        span.className = "span1";
        span.innerHTML = content.pressure;
        press.appendChild(span);
        info.appendChild(press);
        
        var signlen = document.createElement("div");
        signlen.innerHTML = "信号强度:";
        var span = document.createElement("span");
        span.className = "span1";
        span.innerHTML = content.signlen;
        signlen.appendChild(span);
        info.appendChild(signlen);
        
        
        // 定义底部内容
        // var bottom = document.createElement("div");
        // bottom.className = "info-bottom";
        // bottom.style.position = 'relative';
        // bottom.style.top = '10px';
        // bottom.style.margin = '0 auto';
        // var sharp = document.createElement("img");
        // sharp.src = "http://webapi.amap.com/images/sharp.png";
        // bottom.appendChild(sharp);
        // info.appendChild(bottom);
        return info;
    },
    
    
    userTree : function(){
        // 初始化文件树
        treeSetting = {
            async : {
                url : "/api/entm/organization/tree/",
                type : "GET",
                enable : true,
                autoParam : [ "id" ],
                dataType : "json",
                data:{'csrfmiddlewaretoken': '{{ csrf_token }}'},
                otherParam : {  // 是否可选 Organization
                    "isOrg" : "1",
                    // "csrfmiddlewaretoken": "{{ csrf_token }}"
                },
                dataFilter: mapStation.ajaxDataFilter
            },
            view : {
                // addHoverDom : mapStation.addHoverDom,
                // removeHoverDom : mapStation.removeHoverDom,
                selectedMulti : false,
                nameIsHTML: true,
                // fontCss: setFontCss_ztree
            },
            edit : {
                enable : true,
                editNameSelectAll : true,
                showRemoveBtn : false,//mapStation.showRemoveBtn,
                showRenameBtn : false
            },
            data : {
                simpleData : {
                    enable : true
                }
            },
            callback : {
                onClick : mapStation.zTreeOnClick
            }
        };
        $.fn.zTree.init($("#treeDemo"), treeSetting, zNodes);
        var treeObj = $.fn.zTree.getZTreeObj('treeDemo');treeObj.expandAll(true);
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
    },
    // 组织树预处理函数
    ajaxDataFilter: function(treeId, parentNode, responseData){
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        if (responseData) {
            for (var i = 0; i < responseData.length; i++) {
                    responseData[i].open = true;
            }
        }
        return responseData;
    },
    showLog: function(str){
        if (!log)
            log = $("#log");
            log.append("<li class='"+className+"'>" + str + "</li>");
        if (log.children("li").length > 8) {
            log.get(0).removeChild(log.children("li")[0]);
        }
    },
    selectAll: function(){
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        zTree.treeSetting.edit.editNameSelectAll = $("#selectAll").attr("checked");
    },
    //点击节点
    zTreeOnClick: function(event, treeId, treeNode){
        selectTreeId = treeNode.id;
        selectDistrictId = treeNode.districtid;
        selectTreeIdAdd=treeNode.uuid;
        $('#simpleQueryParam').val("");
        mapStation.requireStation();
    },
    requireStation:function(){

        var data={"groupName":selectTreeId};
        var url="/api/monitor/getmapstationlist/";
        json_ajax("GET", url, "json", true,data,mapStation.buildstationinfo);
    },
    buildstationinfo:function(data){
        console.log(data);
        var stationinfo ;
        // for(var i = 0;i<markerList.length;i++){
        //     marker = markerList[i];
        //     console.log(marker);
        //     map.remove(marker)
        // }
        // if(data.entminfo != null && data.entminfo != ""){
        //     entminfo = data.entminfo
        //     mapStation.adaptMap(entminfo)
        // }
        // map.remove(markerList)
        vectorLayer1.getSource().clear();   
        markerList = [];
        if (data.obj != null && data.obj != ""){
            stationinfo = data.obj;
            
            for (var i = 0; i < stationinfo.length; i++){
                station = stationinfo[i];

                
                
                if(isNaN(Number.parseFloat(station.lng)) || isNaN(Number.parseFloat(station.lat))){
                    continue;
                  }
                marker = mapStation.createMarker(station);
                // vectorLayer1.getSource().addFeature(marker);
                markerList.push(marker);
            }

            vectorLayer1.getSource().addFeatures(markerList);
            // map.add(markerList);
            // var extent1 = vectorLayer1.getSource().getExtent();
            // console.log(extent1)
            // var extent = map.getView().calculateExtent(map.getSize());
            // console.log(extent)
            // map.getView().fit(extent, {size:map.getSize(), maxZoom:4})
            var polygon = markerList[0].getGeometry();
            console.log(polygon)
            map.getView().fit(polygon, map.getSize()); 
            // map.getView().setCenter([stationinfo[0].lng,stationinfo[0].lat]);
        }

        
    },
    
    // ajax参数
    ajaxDataParamFun: function(d){
        d.simpleQueryParam = $('#simpleQueryParam').val(); // 模糊查询
        d.groupName = selectTreeId;
        d.districtId = selectDistrictId;
    },
    findDownKey:function(event){
        if(event.keyCode==13){
            mapStation.findOperation();
        }
    }

        
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
    
    var map;
        
        mapStation.init();
        ScrollBar.maxValue = 40000;
        //初始化
        ScrollBar.Initialize();
        
        mapStation.requireStation();
    // 滚动展开
    $("#treeDemo").scroll(function () {
      var zTree = $.fn.zTree.getZTreeObj("treeDemo");
      zTreeScroll(zTree, this);
    });
    
    //IE9
    console.log(navigator.appName,'version:',navigator.appVersion);
    if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE9.0") {
      var search;
      $("#citySel").bind("focus", function () {
        search = setInterval(function () {
          var param = $("#citySel").val();
        //   mapStation.searchVehicleTree(param);
        }, 500);
      }).bind("blur", function () {
        clearInterval(search);
      });
    }
    

    // setTimeout(function(){map.updateSize();}, 200);

  });
}($, window))


