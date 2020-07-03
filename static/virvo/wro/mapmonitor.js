
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
      angleList = [], dragTableHeight, objectType;
  var stopPointInfoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -10), closeWhenClickMap: true});
  var areaCheckCarInfoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -10), closeWhenClickMap: true});
  var alarmPointInfoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -10), closeWhenClickMap: true});
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

  trackPlayback = {
    //初始化
    init: function () {
      
      //监听窗口变化
      $(window).resize(function () {
        var resizeWidth = $(window).width();
        if (resizeWidth < 1200) {
          $("body").css("overflow", "auto");
        } else {
          $("body").css("overflow", "hidden");
        }
        windowHeight = $(window).height();
        headerHeight = $("#header").height();//顶部的高度
        panelHead = $(".panel-heading").height() + 20;//标题栏高度
        citySelHght = $("#citySel").parent().height() + 10;//输入框高度

        trLength = $(".calendar3 tbody tr").length;
        if (trLength == 5) {
          calHeight = 295;
        } else if (trLength == 4) {
          calHeight = 350;
        } else if (trLength == 6) {
          calHeight = 340
        }
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
        tabContentHeight = $("#myTabContent .active").height();
        mapHeight = initialMapH = windowHeight - headerHeight - titleHeight - tabContentHeight - demoHeight - 20;
        $("#operationMenu").css("height", windowHeight - headerHeight + "px");
        $(".sidebar").css('height', windowHeight - headerHeight + "px");
        $("#MapContainer").css({
          "height": mapHeight + "px"
        });
        operMenuHeight = $("#operationMenu").height();
        newOperHeight = windowHeight - headerHeight;
        $("#operationMenu").css({
          "height": newOperHeight + "px"
        });
      });
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
      newwidth = (logoWidth + btnIconWidth + 40 + 2) / windowWidth * 100;
      $("#content-left").css({
        "width": newwidth + "%"
      });
      $("#content-right").css({
        "width": 100 - newwidth + "%"
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
      mapHeight = initialMapH = windowHeight - headerHeight - titleHeight - demoHeight - 20;
      $("#operationMenu").css("height", windowHeight - headerHeight + "px");
      $(".sidebar").css('height', windowHeight - headerHeight + "px");
      $("#MapContainer").css({
        "height": mapHeight + "px"
      });
      operMenuHeight = $("#operationMenu").height();
      newOperHeight = windowHeight - headerHeight;
      $("#operationMenu").css({
        "height": newOperHeight + "px"
      });
      oldMapHeight = $("#MapContainer").height();
      myTabHeight = $("#myTab").height();
      wHeight = $(window).height();
      map = new AMap.Map("MapContainer", {
        resizeEnable: true,
        scrollWheel: true,
        zoom: 14
      });
      //获取地址栏车辆id
      var vgasId = trackPlayback.GetAddressUrl("vid");
      if (vgasId != "") {
        $("#container").css("position", "fixed");
      }
      //监听地图拖拽
      var clickEventListenerDragend = map.on('dragend', trackPlayback.clickEventListenerDragend);
      mouseTool = new AMap.MouseTool(map);
      mouseTool.on("draw", trackPlayback.createSuccess);
      //实例化3D楼块图层
      buildings = new AMap.Buildings();
      // 在map中添加3D楼块图层
      buildings.setMap(map);
      // map.getCity(function (result) {
      //   var html = '' + result.province + '<span class="caret"></span>';
      //   $("#placeChoose").html(html);
      // });
      AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], function () {
        map.addControl(new AMap.ToolBar({
          "direction": false,
        }));
        map.addControl(new AMap.Scale());
      });
      //卫星地图
      satellLayer = new AMap.TileLayer.Satellite();
      satellLayer.setMap(map);
      satellLayer.hide();
      //实时路况
      // realTimeTraffic = new AMap.TileLayer.Traffic();
      // realTimeTraffic.setMap(map);
      // realTimeTraffic.hide();
      //页面区域定位
      $(".amap-logo").attr("href", "javascript:void(0)").attr("target", "");
      
      map.on("click", function () {
        $("#fenceTool>.dropdown-menu").hide();
      });
      
      
      //监听地图缩放
      clickEventListenerZoomend = map.on('zoomend', function () {
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
            console.log("??????1",show_dma_level)
        if(show_dma_level == "3"){
            show_dma_level = ""
            console.log("??????2",show_dma_level)
        }
        else{
            dma_in_group = dma_no_global;
            console.log("on zoomend")
            trackPlayback.refreshMap_local(dma_current_node);
        }
      });
      lmapHeight = $("#MapContainer").height();
      Math.formatFloat = function (f, digit) {
        var m = Math.pow(10, digit);
        return parseInt(f * m, 10) / m;
      };
      setting = {
        async: {
          url: "/api/entm/organization/tree/", //trackPlayback.getTreeUrl,
          type: "GET",
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

      infow = trackPlayback.infoWindow();
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
        $("#MapContainer").css({
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
          $("#MapContainer").css({
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
    // 封装map集合
    mapVehicle: function () {
      this.elements = new Array();
      //获取MAP元素个数
      this.size = function () {
        return this.elements.length;
      };
      //判断MAP是否为空
      this.isEmpty = function () {
        return (this.elements.length < 1);
      };
      //删除MAP所有元素
      this.clear = function () {
        this.elements = new Array();
      };
      //向MAP中增加元素（key, value)
      this.put = function (_key, _value) {
        this.elements.push({
          key: _key,
          value: _value
        });
      };
      //删除指定KEY的元素，成功返回True，失败返回False
      this.remove = function (_key) {
        var bln = false;
        try {
          for (var i = 0, len = this.elements.length; i < len; i++) {
            if (this.elements[i].key == _key) {
              this.elements.splice(i, 1);
              return true;
            }
          }
        } catch (e) {
          bln = false;
        }
        return bln;
      };
      //获取指定KEY的元素值VALUE，失败返回NULL
      this.get = function (_key) {
        try {
          for (var i = 0, len = this.elements.length; i < len; i++) {
            if (this.elements[i].key == _key) {
              return this.elements[i].value;
            }
          }
        } catch (e) {
          return null;
        }
      };
      //获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL
      this.element = function (_index) {
        if (_index < 0 || _index >= this.elements.length) {
          return null;
        }
        return this.elements[_index];
      };
      //判断MAP中是否含有指定KEY的元素
      this.containsKey = function (_key) {
        var bln = false;
        try {
          for (var i = 0, len = this.elements.length; i < len; i++) {
            if (this.elements[i].key == _key) {
              bln = true;
            }
          }
        } catch (e) {
          bln = false;
        }
        return bln;
      };
      //判断MAP中是否含有指定VALUE的元素
      this.containsValue = function (_value) {
        var bln = false;
        try {
          for (var i = 0, len = this.elements.length; i < len; i++) {
            if (this.elements[i].value == _value) {
              bln = true;
            }
          }
        } catch (e) {
          bln = false;
        }
        return bln;
      };
      //获取MAP中所有VALUE的数组（ARRAY）
      this.values = function () {
        var arr = new Array();
        for (var i = 0, len = this.elements.length; i < len; i++) {
          arr.push(this.elements[i].value);
        }
        return arr;
      };
      //获取MAP中所有KEY的数组（ARRAY）
      this.keys = function () {
        var arr = new Array();
        for (var i = 0, len = this.elements.length; i < len; i++) {
          arr.push(this.elements[i].key);
        }
        return arr;
      };
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
    
    getHistory: function (data) {
      isSearchPlayBackData = true;
      trackPlayback.startGetHistoryData(data);
    },
    // 开始获取历史数据
    startGetHistoryData: function (data) {
      setTimeout(function () {
        if (isLastAddressDataBack) {
          $("#gpsTable3>tbody").html("");
          trackPlayback.disable(true);
          trackPlayback.showHidePeopleOrVehicle();
          var todayM = data;//当日里程
          var vehicleId = $("#savePid").attr("value");
          var chooseDate = $("#timeInterval").val().split("--");
          var startTime = chooseDate[0];
          var endTime = chooseDate[1];
          $.ajax({
            type: "POST",
            url: "/clbs/v/monitoring/getHistoryData",
            data: {
              "vehicleId": vehicleId,
              "startTime": startTime,
              "endTime": endTime,
              "type": worldType
            },
            dataType: "json",
            async: true,
            // beforeSend: function (XMLHttpRequest) {
            //   layer.load(2);
            // },
            complete: function (XMLHttpRequest, textStatus) {
              layer.closeAll('loading');
            },
            success: function (data) {
              isLastAddressDataBack = false;
              isSearchPlayBackData = false;
              markerStopAnimation = [];
              msgArray = [];
              stopMsgArray = [];
              layer.closeAll('loading');
              tableIndex = 1;
              stoptableIndex = 1;
              stoptableIndexGroup = 1;
              alarmIndex = 1;
              if (data.success) {
                runTable = 0;
                runTableTime = [];
                stopTable = 0;
                stopTableTime = [];
                allStopPoints = [];
                warningTable = 0;
                warningTableTime = [];
                marking = 'run';
                isRunAddressLoad = false;
                isStopAddressLoad = false;
                isWarnAddressLoad = false;
                isSearch = true;
                isAllStopPoint = false;
                alarmTableSet = [];
                tableSet = [];
                alarmTableSetCopy = [];
                tableSetCopy = [];
                contentTrackPlayback = [];
                var latitude;
                var longtitude;
                // 解压缩数据
                var lastposition;
                var positionalData = ungzip(data.msg);
            // console.log('positondata unzip',positionalData)

                var positionals = $.parseJSON(positionalData);
                group = positionals.groups == undefined ? '未分组' : positionals.groups;
                var stop = positionals.stops; // 停止点
                if (worldType == "5") { // 北斗协议
                  $runTableId = $('#gpsTable4');
                  $stopTableId = $('#gpsTable5');
                  for (var j = 0; j < stop.length; j++) {
                    if (stop[j].stopTime > 300000 && stop[j].bdtdPosition.latitude != 0 && stop[j].bdtdPosition.latitude != undefined) {
                      if (j == 0) {
                        var lasttime = "-";
                      } else {
                        var lasttime = trackPlayback.changedataunix(stop[j].startTime) - trackPlayback.changedataunix(stop[j - 1].startTime);
                        var lasttime = trackPlayback.changdatainfo(lasttime);
                      }
                      var bdtdPosition = stop[j].bdtdPosition;//停车点
                      latitude = bdtdPosition.latitude;
                      longtitude = bdtdPosition.longtitude;
                      timestop.push(stop[j].stopTime);//停车时间
                      longtitudestop.push(longtitude);
                      latitudestop.push(latitude);
                      startTimestop.push(stop[j].startTime);
                      endTimestop.push(stop[j].endTime);
                      var stopangle = bdtdPosition.bearing;
                      var direction = trackPlayback.toDirectionStr(stopangle);
                      stopTableTime.push([bdtdPosition.latitude, bdtdPosition.longtitude, bdtdPosition.vtime, bdtdPosition.peopleId, 'people']);
                      var bdtdStopdirection = trackPlayback.toDirectionStr(bdtdPosition.altitude === undefined ? "" : bdtdPosition.altitude);
                      setstopGroup = [0, bdtdPosition.plateNumber, stop[j].startTime, lasttime, group, bdtdPosition.deviceNumber, bdtdPosition.sIMCard, bdtdPosition.batteryVoltage, bdtdPosition.signalStrength, "", "", bdtdStopdirection,
                        bdtdPosition.protocolType === "T3" ? "否" : "是", bdtdPosition.longtitude, bdtdPosition.latitude, bdtdPosition.formattedAddress === undefined ? "点击获取位置信息" : bdtdPosition.formattedAddress];
                      setstopGroup[0] = stoptableIndexGroup++;
                      tableSetStopGroup.push(setstopGroup);
                    }
                  }
                  trackPlayback.getTable('#gpsTable5', tableSetStopGroup);
                } else {
                  flogKey = trackPlayback.getSensorMessage(vehicleId);
                  $runTableId = $('#gpsTable');
                  $stopTableId = $('#gpsTable2');
                  var k = 1;
                  for (var j = 0; j < stop.length; j++) {
                    if (stop[j].stopTime > 300000 && stop[j].positional.latitude != 0 && stop[j].positional.latitude != undefined) {
                      //添加间隔时间
                      if (k == 1) {
                        var lastvtime = "-";
                        lastposition = stop[j];
                        k++;
                      } else {
                        var nowstartime = stop[j].startTime;
                        var laststartime = lastposition.startTime;
                        var lastvtimeunix = trackPlayback.changedataunix(nowstartime) - trackPlayback.changedataunix(laststartime);
                        var lastposition = stop[j];
                        var lastvtime = trackPlayback.changdatainfo(lastvtimeunix);
                        k++;
                      }

                      var positional = stop[j].positional;//停车点
                      latitude = positional.latitude;
                      longtitude = positional.longtitude;
                      timestop.push(stop[j].stopTime);//停车时间
                      longtitudestop.push(longtitude);
                      latitudestop.push(latitude);
                      startTimestop.push(stop[j].startTime);
                      endTimestop.push(stop[j].endTime);
                      if (positional.latitude == 0 && positional.longtitude == 0) {
                        stopStatus = '未定位';
                      } else {
                        stopStatus = '停止';
                      }

                      var stopacc = positional.status & 1;

                      stopangle = positional.angle;
                      stopdirection = '';
                      stopdirection = trackPlayback.toDirectionStr(stopangle);
                      var stopsatelliteNumber;
                      /*if (todayM == 0.0) {
                                                 stopsatelliteNumber = 0;
                                            } else {*/
                      if (positional != undefined) {
                        stopsatelliteNumber = positional.satelliteNumber == undefined ? '0' : positional.satelliteNumber;
                        if (positional.satelliteNumber == undefined || positional.satelliteNumber == 0) {
                          stopsatelliteNumber = 0;
                        }
                      } else {
                        stopsatelliteNumber = 0;
                      }
                      /*}*/
                      var locationType = positional.locationType === undefined ? "" : positional.locationType;
                      var locateMode;
                      if (locationType == 1) {
                        locateMode = "卫星定位";
                      } else if (locationType == 2) {
                        locateMode = "LBS定位";
                        stopsatelliteNumber = "-";
                      } else if (locationType == 3) {
                        locateMode = "WiFi+LBS定位";
                        stopsatelliteNumber = "-";
                      } else {
                        locateMode = "-";
                      }
                      var miles;
                      if (flogKey != "true") {
                        miles = positional.gpsMile;
                      } else {
                        miles = positional.mileageTotal;
                      }
                      stopTableTime.push([positional.latitude, positional.longtitude, positional.vtime, positional.vehicleId, 'vehicle']);
                      setstopGroup = [
                        0,
                        positional.plateNumber,
                        stop[j].startTime,
                        lastvtime,
                        positionals.groups == undefined ? '未分组' : positionals.groups,
                        positional.deviceNumber,
                        positional.simCard == undefined ? "" : positional.simCard,
                        stopStatus,
                        stopacc == 0 ? "关" : "开",
                        stopdirection,
                        miles > 0 ? miles : "0",
                        locateMode,
                        stopsatelliteNumber,
                        positional.longtitude,
                        positional.latitude,
                        (positional.formattedAddress == undefined || positional.formattedAddress == '[]') ? "点击获取位置信息" : positional.formattedAddress
                      ];
                      setstopGroup[0] = stoptableIndexGroup++;
                      tableSetStopGroup.push(setstopGroup);
                    }
                  }
                  trackPlayback.getTable('#gpsTable2', tableSetStopGroup);
                }
                var msg = positionals.resultful; // 行驶点
                var len = msg.length;
                if (parseInt(len) > 0) {
                  $("#addFence").attr("disabled", false);
                } else {
                  $("#addFence").attr("disabled", true);
                }
                if (worldType == "5") {
                  var position;
                  index_lng_lat = 0;
                  var latitude2 = 0;
                  var longtitude2 = 0;
                  var msg_lng_lat = [];//存地理经纬度
                  for (var i = 0; i < len; i++) {
                    if (i == 0) {
                      var lasttime = "-";
                    } else {
                      var lasttime = msg[i].vtime - msg[i - 1].vtime;
                      var lasttime = trackPlayback.changdatainfo(lasttime);
                    }
                    position = msg[i];
                    listSpeed = position.speed;
                    latitude = position.latitude;//纬度
                    longtitude = position.longtitude;//经度
                    var timeTwo = trackPlayback.UnixToDate(position.vtime, true);
                    index_lng_lat++;
                    if (listSpeed != 0) {
                      if (latitude != 0 && longtitude != 0) {
                        //添加
                        lineArr.push([longtitude, latitude]);
                        speedM.push(position.speed === undefined ? 0 : position.speed);
                        timeM.push(timeTwo);
                        mileageM.push("0");
                        var stopangle = position.bearing;
                        var flag = 0;
                        if (flag == 0) {
                          angleType = stopangle;
                          flag = 1;
                        }
                        var stopdirection = '';
                        stopdirection = trackPlayback.toDirectionStr(stopangle);
                        var protocolType = position.protocolType;
                        runTableTime.push([latitude, longtitude, position.vtime, position.peopleId, 'people']);
                        var timeOte = trackPlayback.formatDate(timeTwo, "yyyy-MM-dd HH:mm:ss");
                        var pspeed = trackPlayback.fiterNumber(position.speed);
                        set = [0, position.monitorObject, timeOte, lasttime, position.groupName, position.userCode, position.sIMCard, position.batteryVoltage, position.signalStrength, pspeed, position.altitude, stopdirection, protocolType === "T3" ? "否" : "是", longtitude, latitude, position.formattedAddress === undefined ? "点击获取位置信息" : position.formattedAddress];
                        set[0] = tableIndex++;
                        tableSet.push(set);
                      }
                    }
                  }
                  var msgstop = positionals.stop;
                  var lenstop = msgstop.length;
                  var stop_lng_lat = [];
                  var stopIndex = 0;
                  stopValue_num = lenstop;
                  for (var i = 0; i < lenstop; i++) {
                    if (i == 0) {
                      var lasttime = "-";
                    } else {
                      var lasttime = msgstop[i].vtime - msgstop[i - 1].vtime;
                      var lasttime = trackPlayback.changdatainfo(lasttime);
                    }
                    var msgstops = msgstop[i];
                    latitudeStop2.push(msgstops.latitude);
                    longtitudeStop2.push(msgstops.longtitude);
                    stopangle = msgstops.bearing;
                    stopdirection = '';
                    stopdirection = trackPlayback.toDirectionStr(stopangle);
                    var protocolTypestop = msgstop[i].protocolType;
                    var timeTee = trackPlayback.UnixToDate(msgstops.vtime, true);
                    var timeTte = trackPlayback.formatDate(timeTee, "yyyy-MM-dd HH:mm:ss");
                    var msgSpeed = msgstops.speed;
                    msgSpeed = trackPlayback.fiterNumber(msgSpeed);
                    allStopPoints.push([msgstops.latitude, msgstops.longtitude, msgstops.vtime, msgstops.peopleId, 'people']);
                    setstop = [0, msgstops.plateNumber, timeTte, lasttime, group, msgstops.deviceNumber, msgstops.sIMCard, msgstops.batteryVoltage, msgstops.signalStrength, msgSpeed, msgstops.altitude, stopdirection, protocolTypestop === "T3" ? "否" : "是", msgstop[i].longtitude, msgstop[i].latitude, msgstop[i].formattedAddress === undefined ? "点击获取位置信息" : msgstop[i].formattedAddress];
                    setstop[0] = stoptableIndex++;
                    stopIndex++;
                    tableSetstops.push(setstop);
                  }
                  trackPlayback.getTable('#gpsTable4', tableSet);
                } else {
                  var position;
                  var set;
                  var setstop;
                  var acc;
                  var lineStatus;
                  var listSpeed;
                  var angle;
                  var direction = '';
                  var latitude2 = 0;
                  var longtitude2 = 0;
                  var alarmSet;
                  var groups = positionals.groups;
                  standbyType = positionals.type;
                  var msg_lng_lat = [];//存地理经纬度
                  index_lng_lat = 0;
                  if (len > 0) {
                    icos = msg[0].ico;
                  }
                  for (var i = 0; i < len; i++) {
                    position = msg[i];
                    latitude = position.latitude;//纬度
                    longtitude = position.longtitude;//经度
                    if (i == 0) {
                      var lastvtime = "-";
                    } else {
                      var lastvtime = msg[i].vtime - msg[i - 1].vtime;
                      lastvtime = trackPlayback.changdatainfo(lastvtime);
                    }
                    if (latitude != "0" && longtitude != "0") {
                      alarmSIM = position.simCard == undefined ? "" : position.simCard;
                      alarmTopic = position.deviceNumber;
                      vcolour = position.plateColor;
                      acc = position.status == undefined ? 0 : position.status;

                      if (acc.length == 32) {
                        acc = acc.substring(18, 19);
                      } else if (acc == 0) {
                        acc = 0;
                      } else {
                        acc = position.status & 1;
                      }
                      var miles;
                      var speeds;
                      if (flogKey != "true") {
                        miles = position.gpsMile;
                        speeds = position.speed;
                      } else {
                        miles = position.mileageTotal;
                        speeds = position.mileageSpeed
                      }
                      listSpeed = speeds;
                      listSpeed = trackPlayback.fiterNumber(listSpeed);
                      //超长待机
                      if (standbyType == "standby") {
                        var sPoints = [longtitude, latitude]
                        var standyMap = new AMap.Marker({
                          map: map,
                          position: sPoints,
                          offset: new AMap.Pixel(-10, -10), //相对于基点的位置
                          icon: new AMap.Icon({
                            size: new AMap.Size(40, 40), //图标大小
                            image: "/static/virvo/resources/img/sectionMarker.png",
                            imageOffset: new AMap.Pixel(0, 0)
                          })
                        });
                      }
                      var timeTwo = trackPlayback.UnixToDate(position.vtime, true);
                      index_lng_lat++;
                      if (latitude != 0 && longtitude != 0) {
                        if (latitude != 0 && longtitude != 0) {
                          var pasla = Math.abs(parseFloat(latitude2) - parseFloat(latitude));
                          var paslo = Math.abs(parseFloat(longtitude2) - parseFloat(longtitude));
                          if (pasla < 0.000020 && paslo < 0.000020) {
                            latitude2 = latitude;
                            longtitude2 = longtitude;
                          } else {
                            latitude2 = latitude;
                            longtitude2 = longtitude;
                          }
                          ;
                          //添加
                          lineArr.push([longtitude, latitude]);//******************************************
                          speedM.push(speeds === undefined ? 0 : speeds);
                          timeM.push(timeTwo);

                          if (miles >= 0) {
                            mileageM.push(miles);
                          } else {
                            mileageM.push("0");
                          }
                        }
                        lineStatus = '行驶';
                      } else {
                        if (latitude == 0 && longtitude == 0) {
                          lineStatus = '未定位';
                        } else {
                          lineStatus = '停止';
                        }
                      }
                      angle = position.angle;
                      /* var flag = 0;
                                        if(flag == 0){
                                            angleType = angle;
                                            flag = 1;
                                        }*/
                      angleList.push(angle);
                      direction = '';
                      direction = trackPlayback.toDirectionStr(angle);
                      var alarmSign = position.alarm;
                      if (alarmSign != 0) {
                        var alarmStr = '';
                        if ((alarmSign & 0x01) != 0) {
                          alarmStr += "紧急报警,";
                        }
                        if ((alarmSign & 0x02) != 0) {
                          alarmStr += "超速报警,";
                        }
                        if ((alarmSign & 0x04) != 0) {
                          alarmStr += "疲劳驾驶,";
                        }
                        if ((alarmSign & 0x08) != 0) {
                          alarmStr += "危险预警,";
                        }
                        if ((alarmSign & 0x10) != 0) {
                          alarmStr += "GNSS模块发生故障,";
                        }
                        if ((alarmSign & 0x20) != 0) {
                          alarmStr += "GNSS天线未接或被剪断,";
                        }
                        if ((alarmSign & 0x40) != 0) {
                          alarmStr += "GNSS天线短路,";
                        }
                        if ((alarmSign & 0x80) != 0) {
                          alarmStr += "终端主电源欠压,";
                        }
                        if ((alarmSign & 0x100) != 0) {
                          alarmStr += "终端主电源掉电,";
                        }
                        if ((alarmSign & 0x200) != 0) {
                          alarmStr += "终端LCD或显示器故障,";
                        }
                        if ((alarmSign & 0x400) != 0) {
                          alarmStr += "TTS模块故障,";
                        }
                        if ((alarmSign & 0x800) != 0) {
                          alarmStr += "摄像头故障,";
                        }
                        if ((alarmSign & 0x1000) != 0) {
                          alarmStr += "道路运输证IC卡模块故障,";
                        }
                        if ((alarmSign & 0x2000) != 0) {
                          alarmStr += "超速预警,";
                        }
                        if ((alarmSign & 0x4000) != 0) {
                          alarmStr += "疲劳驾驶预警,";
                        }
                        if ((alarmSign & 0x40000) != 0) {
                          alarmStr += "当天累计驾驶超时,";
                        }
                        if ((alarmSign & 0x80000) != 0) {
                          alarmStr += "超时停车,";
                        }
                        if ((alarmSign & 0x100000) != 0) {
                          alarmStr += "进出区域,";
                        }
                        if ((alarmSign & 0x200000) != 0) {
                          alarmStr += "进出路线,";
                        }
                        if ((alarmSign & 0x400000) != 0) {
                          alarmStr += "路段行驶时间不足/过长,";
                        }
                        if ((alarmSign & 0x800000) != 0) {
                          alarmStr += "路线偏离报警,";
                        }
                        if ((alarmSign & 0x1000000) != 0) {
                          alarmStr += "车辆VSS故障,";
                        }
                        if ((alarmSign & 0x2000000) != 0) {
                          alarmStr += "车辆油量异常,";
                        }
                        if ((alarmSign & 0x4000000) != 0) {
                          alarmStr += "车辆被盗,";
                        }
                        if ((alarmSign & 0x8000000) != 0) {
                          alarmStr += "车辆非法点火,";
                        }
                        if ((alarmSign & 0x10000000) != 0) {
                          alarmStr += "车辆非法位移,";
                        }
                        if ((alarmSign & 0x20000000) != 0) {
                          alarmStr += "碰撞预警,";
                        }
                        if ((alarmSign & 0x40000000) != 0) {
                          alarmStr += "侧翻预警,";
                        }
                        if ((alarmSign & 0x80000000) != 0) {
                          alarmStr += "非法开门报警,";
                        }
                        if (alarmStr != '') {
                          alarmStr = alarmStr.substring(0, alarmStr.length - 1);
                        }
                        alarmSet = [alarmIndex, ""];
                        alarmIndex++;
                        alarmTableSet.push(alarmSet);
                      } else {
                        alarmTableSet.push(undefined);
                      }
                      var satelliteNumber = position.satelliteNumber == undefined ? '0' : position.satelliteNumber;
                      var locationType = position.locationType === undefined ? "" : position.locationType;
                      var locateMode;
                      if (locationType == 1) {
                        locateMode = "卫星定位";
                      } else if (locationType == 2) {
                        locateMode = "LBS定位";
                        satelliteNumber = "-";
                      } else if (locationType == 3) {
                        locateMode = "WiFi+LBS定位";
                        satelliteNumber = "-";
                      } else {
                        locateMode = "-";
                      }
                      var timeOte = trackPlayback.formatDate(timeTwo, "yyyy-MM-dd HH:mm:ss");
                      runTableTime.push([latitude, longtitude, position.vtime.toString(), position.vehicleId, 'vehicle']);
                      set = [0, position.plateNumber, timeOte, lastvtime, groups == undefined ? '未分组' : groups, position.deviceNumber, position.simCard == undefined ? "" : position.simCard, lineStatus, acc == 0 ? "关" : "开", listSpeed, direction, miles > 0 ? miles : "0",
                        locateMode, satelliteNumber, Number(longtitude).toFixed(6), Number(latitude).toFixed(6), (position.formattedAddress === undefined || position.formattedAddress == '[]') ? "点击获取位置信息" : position.formattedAddress];
                      var content = [];

                      content.push(position.plateNumber);
                      content.push(position.plateColor);
                      content.push(position.deviceNumber);
                      content.push(position.simCard == undefined ? "" : position.simCard);
                      content.push(groups == undefined ? '未分组' : groups);
                      content.push(longtitude);
                      content.push(latitude);
                      content.push(position.height === undefined ? "" : position.height);
                      content.push(listSpeed);
                      content.push(timeOte);
                      contentTrackPlayback.push(content);
                      if (lineStatus == '行驶') {
                        if (tableIndex == 1) {
                          set[3] = "-";
                        }
                        set[0] = tableIndex++;
                        tableSet.push(set);
                      }

                    }
                  }
                  if (todayM != 0.0) {
                    if (!isNaN((mileageM[mileageM.length - 1] - mileageM[0]))) {
                      var allMileage = (mileageM[mileageM.length - 1] - mileageM[0]).toFixed(1);
                      allMileage = trackPlayback.fiterNumber(allMileage);
                      $("#allMileage").text(allMileage + "km");
                    }
                    //行驶时间
                    var sta_str = timeM[0];
                    var end_str = timeM[timeM.length - 1];
                    var end_date;
                    var sra_date;
                    if (sta_str == undefined || end_str == undefined) {
                      end_date = 0;
                      sra_date = 0;
                    } else {
                      end_date = (new Date(end_str.replace(/-/g, "/"))).getTime();
                      sra_date = (new Date(sta_str.replace(/-/g, "/"))).getTime();
                    }
                    var num = (end_date - sra_date);
                    var theTime = parseInt(num / 1000);// 秒
                    var theTime1 = 0;// 分
                    var theTime2 = 0;// 小时
                    if (theTime > 60) {
                      theTime1 = parseInt(theTime / 60);
                      theTime = parseInt(theTime % 60);
                      if (theTime1 > 60) {
                        theTime2 = parseInt(theTime1 / 60);
                        theTime1 = parseInt(theTime1 % 60);
                      }
                    }
                    ;
                    var result = "" + parseInt(theTime) + "秒";
                    if (theTime1 > 0) {
                      result = "" + parseInt(theTime1) + "分" + result;
                    }
                    ;
                    if (theTime2 > 0) {
                      result = "" + parseInt(theTime2) + "小时" + result;
                    }
                    ;
                    timeMax = result;
                    $("#allTime").text(timeMax);
                    if (speedM.length > 0) {
                      var maxSpeed = Math.max.apply(Math, speedM).toFixed(2);
                      maxSpeed = trackPlayback.fiterNumber(maxSpeed);
                      $("#maxSpeend").text(maxSpeed + "km/h");
                    }
                    ;
                  }
                  var msgstop = positionals.stop;
                  var lenstop = msgstop.length;
                  var stop_lng_lat = [];
                  var stopIndex = 0;
                  stopValue_num = lenstop;
                  for (var i = 0; i < lenstop; i++) {

                    if (i == 0) {
                      var lasttime = "-";
                    } else {
                      var lasttime = msgstop[i].vtime - msgstop[i - 1].vtime;
                      var lasttime = trackPlayback.changdatainfo(lasttime);
                    }
                    var msgstops = msgstop[i];
                    var stopStatus;
                    var stopacc = msgstops.status & 1;
                    latitudeStop2.push(msgstops.latitude);
                    longtitudeStop2.push(msgstops.longtitude);
                    if (msgstops.latitude == 0 && msgstops.longtitude == 0) {
                      stopStatus = '未定位';
                    } else {
                      stopStatus = '停止';
                    }
                    stopangle = msgstops.angle;
                    stopdirection = '';
                    stopdirection = trackPlayback.toDirectionStr(stopangle);
                    if (todayM == 0.0) {
                      stopsatelliteNumber = 0;
                    } else {
                      if (msgstops != undefined) {
                        stopsatelliteNumber = msgstops.satelliteNumber;
                        if (msgstops.satelliteNumber == undefined || msgstops.satelliteNumber == 0) {
                          stopsatelliteNumber = 0;
                        }
                      } else {
                        stopsatelliteNumber = 0;
                      }
                    }
                    var stopLocationType = msgstops.locationType === undefined ? "" : msgstops.locationType;
                    var stopLocateMode;
                    if (stopLocationType == 1) {
                      stopLocateMode = "卫星定位";
                    } else if (stopLocationType == 2) {
                      stopLocateMode = "LBS定位";
                      stopsatelliteNumber = "-";
                    } else if (stopLocationType == 3) {
                      stopLocateMode = "WiFi+LBS定位";
                      stopsatelliteNumber = "-";
                    } else {
                      stopLocateMode = "-";
                    }
                    var timeTee = trackPlayback.UnixToDate(msgstops.vtime, true);
                    var timeTte = trackPlayback.formatDate(timeTee, "yyyy-MM-dd HH:mm:ss");
                    var milesMsgstops;
                    if (flogKey != "true") {
                      milesMsgstops = msgstops.gpsMile;
                    } else {
                      milesMsgstops = msgstops.mileageTotal;
                    }
                    allStopPoints.push([msgstops.latitude, msgstops.longtitude, msgstops.vtime, msgstops.vehicleId, 'vehicle']);
                    setstop = [
                      0,
                      msgstops.plateNumber,
                      timeTte,
                      lasttime,
                      groups == undefined ? '未分组' : groups,
                      msgstops.deviceNumber,
                      msgstops.simCard == undefined ? "" : msgstops.simCard,
                      stopStatus,
                      stopacc == 0 ? "关" : "开",
                      stopdirection,
                      milesMsgstops > 0 ? milesMsgstops : "0",
                      stopLocateMode,
                      stopsatelliteNumber,
                      msgstop[i].longtitude,
                      msgstop[i].latitude,
                      (msgstops.formattedAddress == undefined || msgstops.formattedAddress == '[]') ? "点击获取位置信息" : msgstops.formattedAddress
                    ];
                    setstop[0] = stoptableIndex++;
                    stopIndex++;
                    tableSetstops.push(setstop);
                  }
                  trackPlayback.getTable('#gpsTable', tableSet);
                }
              }
              //计算高度赋值
              console.log("1.")
              $("#MapContainer").css({
                "height": (lmapHeight - 221) + "px"
              });
              //表头宽度设置
              var tabWidth = $("#myTab").width();
              var tabPercent = ((tabWidth - 17) / tabWidth) * 100;
              $(".dataTables_scrollHead").css("width", tabPercent + "%");
              //列表拖动
              $("#dragDIV").mousedown(function (e) {
                tableHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
                mapHeight = $("#MapContainer").height();
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
              $("#gpsTable4 tbody tr").bind("click", function () {
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
              console.log("2.")

              $("#scalingBtn").unbind().bind("click", function () {
                if ($(this).hasClass("fa-chevron-down")) {
                  oldMHeight = $("#MapContainer").height();
                  oldTHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
                  $(this).attr("class", "fa  fa-chevron-up")
                  var mapHeight = windowHeight - headerHeight - titleHeight - demoHeight - 20;
                  $("#MapContainer").css({
                    "height": mapHeight + "px"
                  });
                  $(".trackPlaybackTable .dataTables_scrollBody").css({
                    "height": "0px"
                  });
                } else {
                  $(this).attr("class", "fa  fa-chevron-down");
                  $("#MapContainer").css({
                    "height": oldMHeight + "px"
                  });
                  $(".trackPlaybackTable .dataTables_scrollBody").css({
                    "height": oldTHeight + "px"
                  });
                }
              });
              trackPlayback.runDataSearch(0);
              trackPlayback.addressBindClick();
              trackPlayback.trackMap();
              trackPlayback.disable(false);
              trackPlayback.alarmData();
              // wjk
              if ($('#chooseAlarmPoint').checked) {
                trackPlayback.alarmData();
              }
            }
          });
        } else {
          trackPlayback.startGetHistoryData(data);
        }
      }, 200);
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
    //停止数据
    tableStopData: function () {
      //停止数据点击是隐藏人车数据
      $("#peopleGPSData").removeClass("active in");
      $("#peopleGPSData").css("display", "none");
      $("#stopData").addClass("active in");
      $("#stopData").css("display", "block");
      $("#GPSData").css("display", "none");
      setTimeout(function () {
        $("#stopData .dataTables_scrollBody").scrollTop(0);
      }, 200);
      //表头宽度设置
      if (stopDataFlag) {
        setTimeout(function () {
          //停车数据点击获取数据
          $("#gpsTable2 tbody tr").bind("click", function () {
            $("#gpsTable2 tbody tr").removeClass("tableSelected");
            $(this).addClass("tableSelected");
            var stopIndex = parseInt($(this).children("td:nth-child(1)").text());
            if (markerStopAnimationFlog == 1) {
              trackPlayback.markerStop(stopIndex);
            } else {
              markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_NONE');
              stopIndexs = stopIndex - 1;
              markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_BOUNCE');
              map.setCenter(markerStopAnimation[stopIndexs].getPosition());
            }
          });
          $("#gpsTable5 tbody tr").bind("click", function () {
            $("#gpsTable5 tbody tr").removeClass("tableSelected");
            $(this).addClass("tableSelected");
            var stopIndex = parseInt($(this).children("td:nth-child(1)").text());
            if (markerStopAnimationFlog == 1) {
              trackPlayback.markerStop(stopIndex);
            } else {
              markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_NONE');
              stopIndexs = stopIndex - 1;
              markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_BOUNCE');
              map.setCenter(markerStopAnimation[stopIndexs].getPosition());
            }
          });
        }, 200);
        stopDataFlag = false;
        ;
      }
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
      map.clearMap();
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
      trackPlayback.refreshMap_local(treeNode.name);
      $("#allMileage").text(treeNode.name);
      $("#allTime").text(0);
      $("#maxSpeend").text(0 + "km/h");
      //wjk end
      trackPlayback.showHidePeopleOrVehicle();
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
    //当点击或选择围栏时，访问后台返回围栏详情
    getFenceDetailInfo: function (fenceNode, showMap) {
      // ajax访问后端查询
      layer.load(2);
      $.ajax({
        type: "POST",
        url: "/clbs/m/functionconfig/fence/bindfence/getFenceDetails",
        data: {
          "fenceNodes": JSON.stringify(fenceNode)
        },
        dataType: "json",
        success: function (data) {
          layer.closeAll('loading');
          if (data.success) {
            var dataList = data.obj;
            if (dataList != null && dataList.length > 0) {
              if (dataList[0].fenceType == "zw_m_line") {
                fanceID = dataList[0].fenceData[0].lineId;
              }
              ;
              for (var i = 0; i < dataList.length; i++) {
                var fenceData;
                var fenceType = dataList[i].fenceType;
                var wayPointArray;
                if (fenceType == 'zw_m_travel_line') {
                  fenceData = dataList[i].allPoints;
                  wayPointArray = dataList[i].passPointData;
                } else {
                  fenceData = dataList[i].fenceData;
                }
                ;
                var lineSpot = dataList[i].lineSpot == undefined ? [] : dataList[i].lineSpot;
                var lineSegment = dataList[i].lineSegment == undefined ? [] : dataList[i].lineSegment;
                if (fenceType == "zw_m_marker") { // 标注
                  trackPlayback.drawMarkToMap(fenceData, showMap);
                } else if (fenceType == "zw_m_line") { // 线
                  trackPlayback.drawLineToMap(fenceData, lineSpot, lineSegment, showMap);
                } else if (fenceType == "zw_m_rectangle") { // 矩形
                  trackPlayback.drawRectangleToMap(fenceData, showMap);
                } else if (fenceType == "zw_m_polygon") { // 多边形
                  trackPlayback.drawPolygonToMap(fenceData, showMap);
                } else if (fenceType == "zw_m_circle") { // 圆形
                  trackPlayback.drawCircleToMap(fenceData, showMap);
                } else if (fenceType == "zw_m_administration") { // 行政区域
                  var aId = dataList[0].aId
                  trackPlayback.drawAdministrationToMap(fenceData, aId, showMap);
                } else if (fenceType == "zw_m_travel_line") { // 行驶路线
                  trackPlayback.drawTravelLineToMap(fenceData, showMap, dataList[i].travelLine, wayPointArray);
                }
              }
            }
          }
        }
      });
    },
    //显示行政区域
    drawAdministrationToMap: function (data, aId, showMap) {
      var polygonAarry = [];
      if (AdministrativeRegionsList.containsKey(aId)) {
        var this_fence = AdministrativeRegionsList.get(aId);
        map.remove(this_fence);
        AdministrativeRegionsList.remove(aId);
      }
      ;
      for (var i = 0, l = data.length; i < 1; i++) {
        var polygon = new AMap.Polygon({
          map: map,
          strokeWeight: 1,
          strokeColor: '#CC66CC',
          fillColor: '#CCF3FF',
          fillOpacity: 0.5,
          path: data
        });
        polygonAarry.push(polygon);
      }
      ;
      AdministrativeRegionsList.put(aId, polygonAarry);
      map.setFitView(polygon);//地图自适应
    },
    //标注
    drawMarkToMap: function (mark, thisMap) {
      var markId = mark.id;
      //判断集合中是否含有指定的元素
      if (fenceIdList.containsKey(markId)) {
        var markerObj = fenceIdList.get(markId);
        thisMap.remove(markerObj);
        fenceIdList.remove(markId);
      }
      ;
      var dataArr = [];
      dataArr.push(mark.longitude);
      dataArr.push(mark.latitude);
      polyFence = new AMap.Marker({
        position: dataArr,
        offset: new AMap.Pixel(-9, -23)
      });
      polyFence.setMap(thisMap);
      thisMap.setFitView(polyFence);
      fenceIdList.put(markId, polyFence);
    },
    //矩形
    drawRectangleToMap: function (rectangle, thisMap) {
      var rectangleId = rectangle.id;
      if (fenceIdList.containsKey(rectangleId)) {
        var thisFence = fenceIdList.get(rectangleId);
        thisFence.show();
        map.setFitView(thisFence);
      }
      else {
        var dataArr = new Array();
        if (rectangle != null) {
          dataArr.push([rectangle.leftLongitude, rectangle.leftLatitude]); // 左上角
          dataArr.push([rectangle.rightLongitude, rectangle.leftLatitude]); // 右上角
          dataArr.push([rectangle.rightLongitude, rectangle.rightLatitude]); // 右下角
          dataArr.push([rectangle.leftLongitude, rectangle.rightLatitude]); // 左下角
        }
        ;
        polyFence = new AMap.Polygon({
          path: dataArr,//设置多边形边界路径
          strokeColor: "#FF33FF", //线颜色
          strokeOpacity: 0.2, //线透明度
          strokeWeight: 3, //线宽
          fillColor: "#1791fc", //填充色
          fillOpacity: 0.35
          //填充透明度
        });
        polyFence.setMap(thisMap);
        thisMap.setFitView(polyFence);
        fenceIdList.put(rectangleId, polyFence);
      }
      ;
    },
    //多边形
    drawPolygonToMap: function (polygon, thisMap) {
      var polygonId = polygon[0].polygonId;
      if (fenceIdList.containsKey(polygonId)) {
        var thisFence = fenceIdList.get(polygonId);
        thisFence.hide();
        fenceIdList.remove(polygonId);
      }
      ;
      var dataArr = new Array();
      if (polygon != null && polygon.length > 0) {
        for (var i = 0; i < polygon.length; i++) {
          dataArr.push([polygon[i].longitude, polygon[i].latitude]);
        }
      }
      ;
      polyFence = new AMap.Polygon({
        path: dataArr,//设置多边形边界路径
        strokeColor: "#FF33FF", //线颜色
        strokeOpacity: 0.2, //线透明度
        strokeWeight: 3, //线宽
        fillColor: "#1791fc", //填充色
        fillOpacity: 0.35
        //填充透明度
      });
      polyFence.setMap(thisMap);
      thisMap.setFitView(polyFence);
      fenceIdList.put(polygonId, polyFence);
    },
    //圆形
    drawCircleToMap: function (circle, thisMap) {
      var circleId = circle.id;
      if (fenceIdList.containsKey(circleId)) {
        var thisFence = fenceIdList.get(circleId);
        thisFence.hide();
        fenceIdList.remove(circleId);
      }
      ;
      polyFence = new AMap.Circle({
        center: new AMap.LngLat(circle.longitude, circle.latitude),// 圆心位置
        radius: circle.radius, //半径
        strokeColor: "#F33", //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 3, //线粗细度
        fillColor: "#ee2200", //填充颜色
        fillOpacity: 0.35
        //填充透明度
      });
      polyFence.setMap(thisMap);
      thisMap.setFitView(polyFence);
      fenceIdList.put(circleId, polyFence);
    },
    //行驶路线
    drawTravelLineToMap: function (data, thisMap, travelLine, wayPointArray) {
      var lineID = travelLine.id;
      var path = [];
      var start_point_value = [travelLine.startlongtitude, travelLine.startLatitude];
      var end_point_value = [travelLine.endlongtitude, travelLine.endLatitude];
      var wayValue = [];
      if (wayPointArray != undefined) {
        for (var j = 0, len = wayPointArray.length; j < len; j++) {
          wayValue.push([wayPointArray[j].longtitude, wayPointArray[j].latitude]);
        }
        ;
      }
      ;
      for (var i = 0, len = data.length; i < len; i++) {
        path.push([data[i].longitude, data[i].latitude]);
      }
      ;
      if (travelLineList.containsKey(lineID)) {
        var this_line = travelLineList.get(lineID);
        map.remove([this_line]);
        travelLineList.remove(lineID);
      }
      ;
      var polyFencec = new AMap.Polyline({
        path: path, //设置线覆盖物路径
        strokeColor: "#3366FF", //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 5, //线宽
        strokeStyle: "solid", //线样式
        strokeDasharray: [10, 5],
        zIndex: 51
      });
      polyFencec.setMap(map);
      map.setFitView(polyFencec);
      travelLineList.put(lineID, polyFencec);
    },
    //线
    drawLineToMap: function (line, lineSpot, lineSegment, thisMap) {
      var lineId = line[0].lineId;
      //是否存在线
      if (fenceIdList.containsKey(lineId)) {
        var thisFence = fenceIdList.get(lineId);
        if (Array.isArray(thisFence)) {
          for (var i = 0; i < thisFence.length; i++) {
            thisFence[i].hide();
          }
          ;
        } else {
          thisFence.hide();
        }
        ;
        fenceIdList.remove(lineId);
      }
      ;
      //线数据
      var dataArr = new Array();
      var lineSectionArray = [];
      if (line != null && line.length > 0) {
        for (var i in line) {
          if (line[i].type == "0") {
            dataArr[i] = [line[i].longitude, line[i].latitude];
          }
        }
      }
      //地图画线
      var polyFencec = new AMap.Polyline({
        path: dataArr, //设置线覆盖物路径
        strokeColor: "#3366FF", //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 5, //线宽
        strokeStyle: "solid", //线样式
        strokeDasharray: [10, 5],
        zIndex: 51
        //补充线样式
      });
      lineSectionArray.push(polyFencec);
      fenceIdList.put(lineId, polyFencec);
      polyFencec.setMap(thisMap);
      thisMap.setFitView(polyFencec);
    },
    //围栏隐藏
    hideFenceInfo: function (nodesId) {
      if (fenceIdList.containsKey(nodesId)) {
        var thisFence = fenceIdList.get(nodesId);
        if (Array.isArray(thisFence)) {
          for (var i = 0; i < thisFence.length; i++) {
            thisFence[i].hide();
          }
          ;
        } else {
          thisFence.hide();
        }
        ;
      }
      ;
      trackPlayback.hideRegionsOrTravel(nodesId);
    },
    //隐藏行政区划及行驶路线
    hideRegionsOrTravel: function (id) {
      //行政区划
      if (AdministrativeRegionsList.containsKey(id)) {
        var this_fence = AdministrativeRegionsList.get(id);
        map.remove(this_fence);
        AdministrativeRegionsList.remove(id);
      }
      ;
      //行驶路线
      if (travelLineList.containsKey(id)) {
        var this_fence = travelLineList.get(id);
        map.remove(this_fence);
        travelLineList.remove(id);
      }
      ;
    },
    //围栏显示
    showFenceInfo: function (nodesId, node) {
      //判断集合中是否含有指定的元素
      if (fenceIdList.containsKey(nodesId)) {
        var thisFence = fenceIdList.get(nodesId);
        if (thisFence != undefined) {
          if (Array.isArray(thisFence)) {
            for (var s = 0; s < thisFence.length; s++) {
              thisFence[s].show();
              map.setFitView(thisFence[s]);
            }
            ;
          } else {
            thisFence.show();
            map.setFitView(thisFence);
          }
          ;
        }
      } else {
        trackPlayback.getFenceDetailInfo([node], map);
      }
      ;
    },
    //围栏集合数据清除及切换后初始化
    delFenceListAndMapClear: function () {
      //清除根据监控对象查询的围栏勾选
      var zTree = $.fn.zTree.getZTreeObj("vFenceTree");
      //处理判断不勾选围栏直接切换至电子围栏后错误问题
      if (zTree != null) {
        var nodes = zTree.getCheckedNodes(true);
        //获取已勾选的节点结合  变换为不勾选
        for (var i = 0, l = nodes.length; i < l; i++) {
          zTree.checkNode(nodes[i], false, false);
        }
        //改变勾选状态checkedOld
        var allNodes = zTree.getChangeCheckedNodes();
        for (var i = 0; i < allNodes.length; i++) {
          allNodes[i].checkedOld = false;
        }
        //删除 标注、线、矩形、圆形、多边形 （集合fenceIdList）
        if (fenceIdList.elements.length > 0) {
          var fLength = fenceIdList.elements.length;
          //遍历当前勾选围栏
          for (var i = 0; i < fLength; i++) {
            //获取围栏Id
            var felId = fenceIdList.elements[i].key;
            //隐藏围栏及删除数组数据
            var felGs = fenceIdList.get(felId);
            //AMap.Marker标注    AMap.Polyline线    AMap.Polygon矩形   AMap.Circle圆形
            if (felGs.CLASS_NAME == "AMap.Marker" || felGs.CLASS_NAME == "AMap.Polyline" || felGs.CLASS_NAME == "AMap.Polygon" || felGs.CLASS_NAME == "AMap.Circle") {
              felGs.hide();
            }
          }
          //清空数组
          fenceIdList.clear();
        }
        //删除行政区域 （集合AdministrativeRegionsList）
        if (AdministrativeRegionsList.elements.length > 0) {
          var aLength = AdministrativeRegionsList.elements.length;
          for (var i = 0; i < aLength; i++) {
            var admId = AdministrativeRegionsList.elements[i].key;
            var admGs = AdministrativeRegionsList.get(admId);
            map.remove(admGs);
          }
          AdministrativeRegionsList.clear();
        }
        //删除导航路线 （集合travelLineList）
        if (travelLineList.elements.length > 0) {
          var tLength = travelLineList.elements.length;
          for (var i = 0; i < tLength; i++) {
            var travelId = travelLineList.elements[i].key;
            var travelGs = travelLineList.get(travelId);
            map.remove([travelGs]);
          }
          travelLineList.clear();
        }
      }
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
              $("#MapContainer").css({
                "height": (lmapHeight - 241) + "px"
              });
              //表头宽度设置
              var tabWidth = $("#myTab").width();
              var tabPercent = ((tabWidth - 17) / tabWidth) * 100;
              $(".dataTables_scrollHead").css("width", tabPercent + "%");
              //列表拖动
              $("#dragDIV").mousedown(function (e) {
                tableHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
                mapHeight = $("#MapContainer").height();
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
                  oldMHeight = $("#MapContainer").height();
                  oldTHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
                  $(this).attr("class", "fa  fa-chevron-up")
                  var mapHeight = windowHeight - headerHeight - titleHeight - demoHeight - 20;
                  $("#MapContainer").css({
                    "height": mapHeight + "px"
                  });
                  $(".trackPlaybackTable .dataTables_scrollBody").css({
                    "height": "0px"
                  });
                } else {
                  $(this).attr("class", "fa  fa-chevron-down");
                  $("#MapContainer").css({
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
          $("#MapContainer").css({
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
        oldMHeight = $("#MapContainer").height();
        oldTHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
        $('#scalingBtn').attr('class', 'fa fa-chevron-up');
      }
      ;
      $("#content-left").hide();
      $("#content-right").attr("class", "col-md-12 content-right");
      $("#content-right").css("width", "100%");
      $("#goShow").show();
      //点击隐藏轨迹回放查询
      $("#MapContainer").css({
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
        $("#MapContainer").css({
          "height": initialMapH + "px"
        });
        $(".trackPlaybackTable .dataTables_scrollBody").css({
          "height": 0 + "px"
        });
      } else {
        $("#MapContainer").css({
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
    
    //隐藏相关
    hideDialog: function () {
      $(".modal-backdrop").hide();
      $("#commonWin").hide();
      trackPlayback.clearErrorMsg();
      trackPlayback.clearLine();
    },
    // 清除错误信息
    clearErrorMsg: function () {
      $("label.error").hide();
      $(".error").removeClass("error");
    },
    // 清空线路
    clearLine: function () {
      $("#addOrUpdateLineFlag").val("0");
      $("#lineId").val("");
      $("#lineName1").val("");
      $("#lineWidth1").val("");
      $("#lineDescription1").val("");
      $("#pointSeqs").val("");
      $("#longtitudes").val("");
      $("#latitudes").val("");
    },
    toolClickList: function () {
      if (RegionalQuerymarker != null) {
        mouseTool.close(true);
        map.remove(RegionalQuerymarker);
      }
      mouseTool.rectangle();
    },
    //区域画完回调函数
    createSuccess: function (data) {
      changeArray = data.obj.getBounds();
      var chooseDate = $("#timeInterval").val().split("--");
      createSuccessStm = chooseDate[0];
      createSuccessEtm = chooseDate[1];
      createSuccessSpid = $("#savePid").val();
      createSuccessStm = new Date(Date.parse(createSuccessStm.replace(/-/g, "/")));
      createSuccessStm = createSuccessStm.getTime() / 1000;
      createSuccessEtm = new Date(Date.parse(createSuccessEtm.replace(/-/g, "/")));
      createSuccessEtm = createSuccessEtm.getTime() / 1000;
      leftToplongtitude = changeArray.getSouthWest().getLng();
      leftTopLatitude = changeArray.getSouthWest().getLat();
      rightFloorlongtitude = changeArray.getNorthEast().getLng();
      rightFloorLatitude = changeArray.getNorthEast().getLat();
      var url = "/clbs/v/monitoring/getHistoryByTimeAndAddress";
      var data = {
        "leftTopLongitude": leftToplongtitude,
        "leftTopLatitude": leftTopLatitude,
        "rightFloorLongitude": rightFloorlongtitude,
        "rightFloorLatitude": rightFloorLatitude,
        // "vehicleId": createSuccessSpid,
        "startTime": createSuccessStm,
        "endTime": createSuccessEtm,
      };
      //ajax_submit("POST", url, "json", true, data, true, trackPlayback.regionalQuery,trackPlayback.errorMsg);
      layer.load(2);
      $.ajax(
          {
            type: "POST",//通常会用到两种：GET,POST。默认是：GET
            url: url,//(默认: 当前页地址) 发送请求的地址
            dataType: "json", //预期服务器返回的数据类型。"json"
            async: true, // 异步同步，true  false
            data: data,
            traditional: true,
            timeout: 30000, //超时时间设置，单位毫秒
            success: trackPlayback.regionalQuery, //请求成功
            error: trackPlayback.errorMsg,//请求出错
          });

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
    //根据时间查询报警数据
    alarmData: function () {
        
      var vehicleId = $("#savePid").val();
      var chooseDate = $("#timeInterval").val().split("--");
      startTime = chooseDate[0];
      endTime = chooseDate[1];
      var alarmDataStm = new Date(Date.parse(startTime.replace(/-/g, "/"))) / 1000;
      var alarmDataEtm = new Date(Date.parse(endTime.replace(/-/g, "/"))) / 1000;
      trackPlayback.getTable('#gpsTable3', []);
      $.ajax({
        type: "POST",
        url: "/clbs/v/monitoring/getAlarmData",
        data: {
          "vehicleId": vehicleId,
          "startTime": alarmDataStm,
          "endTime": alarmDataEtm,
        },
        dataType: "json",
        async: false,
        success: function (data) {
          trackPlayback.alarmDatatable(data);
          trackPlayback.addressBindClick();
          trackPlayback.runDataSearch(runTable);
          trackPlayback.warningAddressGet();
        }
      })
    },
    //报警数据组装
    alarmDatatable: function (data) {
      markerAlarmList = [];
      var tableList = data.obj;
      var setstop;
      var stopIndexa = 1;
      var tableSetstop = [];
      var alarmtimeText = null;
      var alarmDescriptionText = "";
      var inext = 0;
      var history = null;
      // console.log("alarmDatatable....")
      for (var i = 0; i < tableList.length; i++) {
        var alarm = tableList[i];
        var plateNumber = alarm.plateNumber;
        var assignmentName = alarm.assignmentName;
        var alarmDescription = alarm.description;
        var alarmStatus = alarm.status;
        var alarmPersonName = alarm.personName;
        var alarmStartTime = alarm.startTime;
        var alarmStartLocation = alarm.startLocation;
        var alarmEndTime = alarm.endTime;
        var alarmEndLocation = alarm.endLocation;
        var height = alarm.height;
        var alarmFenceName = alarm.fenceName;
        var alarmFenceType = alarm.fenceType;
        if (alarmFenceType == 'zw_m_rectangle') {
          alarmFenceType = "矩形";
        } else if (alarmFenceType == 'zw_m_circle') {
          alarmFenceType = "圆形";
        } else if (alarmFenceType == 'zw_m_line') {
          alarmFenceType = "线";
        } else if (alarmFenceType == 'zw_m_polygon') {
          alarmFenceType = "多边形";
        }
        var recorderSpeed = alarm.recorderSpeed;
        if (alarm.alarmStartLocation != null) {
          var StartLocation = alarm.alarmStartLocation.split(',');//开始经纬度
        }
        if (alarm.alarmEndLocation != null) {
          var EndLocation = alarm.alarmEndLocation.split(',');//结束经纬度
        }
        warningTableTime.push([[StartLocation === undefined ? "" : StartLocation[1], StartLocation === undefined ? "" : StartLocation[0], alarm.alarmStartTime, alarm.id, 'warning'], [EndLocation === undefined ? "" : EndLocation[1], EndLocation === undefined ? "" : EndLocation[0], alarm.alarmEndTime, alarm.id, 'warning']]);
        setstop = [0, plateNumber, assignmentName == undefined ? '未分组' : assignmentName, alarmDescription, alarmStatus, alarmPersonName,
          alarmStartTime, (alarmStartLocation === null || alarmStartLocation == '[]') ? '点击获取位置信息' : alarmStartLocation, alarmEndTime, (alarmEndLocation === null || alarmEndLocation == '[]') ? '点击获取位置信息' : alarmEndLocation, alarmFenceType === undefined ? "" : alarmFenceType, alarmFenceName === undefined ? "" : alarmFenceName];
        setstop[0] = stopIndexa;
        stopIndexa++;
        tableSetstop.push(setstop);
        alarmtimeText = alarmStartTime;
        alarmDescriptionText = "";
        alarmDescriptionText = alarmDescription;
        if (alarm.alarmStartLocation != null) {
          var sLocation = alarm.alarmStartLocation.split(",");
        }
        var arrstop = [];
        if (worldType != "5") {
          arrstop.push("监控对象:" + plateNumber);
          arrstop.push("车牌颜色:" + vcolour);
          arrstop.push("所属分组:" + assignmentName);
          arrstop.push("高程:" + (height === null ? "" : height));
          arrstop.push("SIM卡号:" + alarmSIM);
          arrstop.push("终端号:" + alarmTopic);
          arrstop.push("记录仪速度:" + (recorderSpeed === null ? "" : recorderSpeed));
          arrstop.push("报警信息:" + alarmDescriptionText);
          arrstop.push("处理状态:" + alarmStatus);
          arrstop.push("处理人:" + (alarmPersonName === null ? "无" : alarmPersonName));
          arrstop.push("报警开始时间:" + (alarmStartTime === null ? "" : alarmStartTime));
          arrstop.push("报警开始坐标:" + (StartLocation === undefined ? "位置描述获取失败" : StartLocation));
          arrstop.push("报警结束时间:" + (alarmEndTime === null ? "" : alarmEndTime));
          arrstop.push("报警结束坐标:" + (EndLocation === undefined ? "位置描述获取失败" : EndLocation));
        } else {
          arrstop.push("监控对象:" + plateNumber);
          arrstop.push("所属分组:" + assignmentName);
          arrstop.push("报警信息:" + alarmDescriptionText);
          arrstop.push("处理状态:" + alarmStatus);
          arrstop.push("处理人:" + (alarmPersonName === null ? "无" : alarmPersonName));
          arrstop.push("报警开始时间:" + (alarmStartTime === null ? "" : alarmStartTime));
          arrstop.push("报警开始坐标:" + (StartLocation === undefined ? "位置描述获取失败" : StartLocation));
          arrstop.push("报警结束时间:" + (alarmEndTime === null ? "" : alarmEndTime));
          arrstop.push("报警结束坐标:" + (EndLocation === undefined ? "位置描述获取失败" : EndLocation));
        }
        if (alarmFenceName != undefined && alarmFenceName != null && alarmFenceType != undefined && alarmFenceType != null) {
          arrstop.push("围栏名称:" + alarmFenceName);
          arrstop.push("围栏类型:" + alarmFenceType);
        }
        if (sLocation != undefined) {
          var markerAlarm = new AMap.Marker({
            map: map,
            position: [sLocation[0], sLocation[1]],//基点位置
            icon: "/static/virvo/resources/img/al.svg", //marker图标，直接传递地址url
            zIndex: 9999,
            autoRotation: true
          });
          markerAlarm.content = arrstop.join("<br/>");
          markerAlarm.on('click', trackPlayback.markeralarmDatatable);
          markerAlarmList.push(markerAlarm);
        }
      }
      trackPlayback.getTable('#gpsTable3', tableSetstop);

      // 如果显示报警点未勾选  则隐藏地图报警点标识
      if (!($("#chooseAlarmPoint").is(":checked"))) {
        if (markerAlarmList.length > 0) {
          for (var i = 0; i < markerAlarmList.length; i++) {
            var markerAlarmChecked = markerAlarmList[i];
            markerAlarmChecked.hide();
          }
        }
      }
    },
    //报警点信息窗体
    markeralarmDatatable: function (e) {
      alarmPointInfoWindow.setContent(e.target.content);
      alarmPointInfoWindow.open(map, e.target.getPosition());
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
    //日历点击报警点集合清空
    markerAlarmClear: function () {
      markerAlarmList = [];
    },
    //报警点显示隐藏执行方法
    hideAlarmPointFn: function () {
      if ($("#chooseAlarmPoint").attr("checked")) {
        $("#chooseAlarmPoint").attr("checked", false);
        layer.msg("隐藏报警点");
        if (markerAlarmList.length > 0) {
          for (var i = 0; i < markerAlarmList.length; i++) {
            var markerAlarmChecked = markerAlarmList[i];
            markerAlarmChecked.hide();
          }
        }
        alarmPointInfoWindow.close();
      } else {
        $("#chooseAlarmPoint").attr("checked", true);
        layer.msg("显示报警点");
        if (markerAlarmList.length <= 0 || markerAlarmList == null) {
          trackPlayback.alarmData();
        }
        if (markerAlarmList.length > 0) {
          for (var i = 0; i < markerAlarmList.length; i++) {
            var markerAlarmChecked = markerAlarmList[i];
            markerAlarmChecked.show();
          }
        }
      }
    },
    //停车数据点击获取数据
    showHidestopDataTrClickFn: function () {
      $("#gpsTable2 tbody tr").bind("click", function () {
        $("#gpsTable2 tbody tr").removeClass("tableSelected");
        $(this).addClass("tableSelected");
        var stopIndex = parseInt($(this).children("td:nth-child(1)").text());
        if (markerStopAnimationFlog == 1) {
          trackPlayback.markerStop(stopIndex);
        } else {
          markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_NONE');
          stopIndexs = stopIndex % 2 == 0 ? stopIndex / 2 - 1 : (stopIndex + 1) / 2 - 1;
          markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_BOUNCE');
          map.setCenter(markerStopAnimation[stopIndexs].getPosition());
        }
      });
    },
    //停止点显示隐藏
    hideStopPointFn: function () {
      isSearch = false;
      if (!($("#chooseStopPoint").attr("checked"))) {
        isAllStopPoint = true;
        markerStopAnimationFlog = 1;
        if (markerStopAnimation.length != 0) {
          markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_NONE');
        }
        $("#chooseStopPoint").attr("checked", "checked");
        layer.msg("显示所有停止点");
        if (worldType == "5") {
          trackPlayback.getTable('#gpsTable5', tableSetstops, dragTableHeight);
        } else {
          trackPlayback.getTable('#gpsTable2', tableSetstops, dragTableHeight);
        }
        trackPlayback.showHidestopDataTrClickFn();
      } else {
        isAllStopPoint = false;
        markerStopAnimationFlog = 2;
        if (markerAlarmIndex != 0) {
          markerAlarmList[markerAlarmIndex - 1].setAnimation('AMAP_ANIMATION_NONE');
        }
        $("#chooseStopPoint").removeAttr("checked", "checked");
        layer.msg("隐藏所有停止点");
        if (worldType == "5") {
          trackPlayback.getTable('#gpsTable5', tableSetStopGroup, dragTableHeight);
        } else {
          trackPlayback.getTable('#gpsTable2', tableSetStopGroup, dragTableHeight);
        }
        trackPlayback.showHidestopDataTrClickFn();
      }
      if (marking !== 'run') {
        marking = 'stop';
        stopTable = 0;
        warningTable = 0;
      }
      trackPlayback.addressBindClick();
      isSearch = true;
      trackPlayback.againSearchLocation();
    },
    //查询模块
    showAreaTool: function () {
      if ($("#realTimeCanArea").hasClass("rtcaHidden")) {
        $("#realTimeCanArea").removeClass("rtcaHidden");
      } else {
        $("#realTimeCanArea").addClass("rtcaHidden");
      }
    },
    
    // 点击获取报警数据结束address
    getWarningEndAddress: function () {
      $thisWarningTd = $(this);
      var index = $(this).parent('tr').find('td:nth-child(1)').text();
      var url = '/clbs/v/monitoring/address';
      var value = warningTableTime[index - 1][1];
      var data = {addressReverse: value};
      ajax_submit("POST", url, "json", true, data, true, trackPlayback.warningClickDataCallBack);
      event.stopPropagation();
    },
    warningClickDataCallBack: function (data) {
      $thisWarningTd.text(data).css('color', '#5D5F63');
    },
    // 表格数据导出
    exportTableData: function () {
      // 人  报警数据
      if ($("#tableAlarmDate").hasClass("active")) {
        if (worldType == "5") {
          if ($("#gpsTable3 tbody tr td").hasClass("dataTables_empty")) {
            layer.msg("列表无任何数据，无法导出");
            return;
          }
        } else {

          if ($("#warningData tbody tr td").hasClass("dataTables_empty")) {
            layer.msg("列表无任何数据，无法导出");
            return;
          }
        }
      }
      // 北斗协议的监控对象的停止数据
      if ($("#p-tableStopData").hasClass("active")) {
        if ($("#gpsTable5 tbody tr td").hasClass("dataTables_empty")) {
          layer.msg("列表无任何数据，无法导出");
          return;
        }
      }
      // 北斗协议的监控对象的行驶数据
      if ($("#p-travelData").hasClass("active")) {
        if ($("#gpsTable4 tbody tr td").hasClass("dataTables_empty")) {
          layer.msg("列表无任何数据，无法导出");
          return;
        }
      }
      //  其他协议监控对象的行驶数据
      if ($("#v-travelData").hasClass("active")) {
        if ($("#gpsTable tbody tr td").hasClass("dataTables_empty")) {
          layer.msg("列表无任何数据，无法导出");
          return;
        }
      }
      // 其他协议监控对象的停止数据
      if ($("#tableStopData").hasClass("active")) {
        if ($("#gpsTable2 tbody tr td").hasClass("dataTables_empty")) {
          layer.msg("列表无任何数据，无法导出");
          return;
        }
      }
      var id
          , monitoringObjectType
          , load = false;
      $('#myTab li').each(function () {
        if ($(this).hasClass('active')) {
          id = $(this).attr('id');
          if (id === 'v-travelData') {
            monitoringObjectType = '1';
          } else if (id === 'p-travelData') {
            monitoringObjectType = '2';
          } else if (id === 'tableStopData') {
            monitoringObjectType = '3';
          } else if (id === 'p-tableStopData') {
            monitoringObjectType = '4';
          } else if (id === 'tableAlarmDate') {
            monitoringObjectType = '5';
          }
        }
      });
      if (monitoringObjectType === '1' || monitoringObjectType === '2') {
        if (isRunAddressLoad) {
          load = true;
        }
      } else if (monitoringObjectType === '3' || monitoringObjectType === '4') {
        if (isStopAddressLoad) {
          load = true;
        }
      } else if (monitoringObjectType === '5') {
        if (isWarnAddressLoad) {
          load = true;
        }
      }
      var carID = $("#citySel").val();
      if (carID == "" || carID == undefined) {
        layer.msg(vehicleNumberChoose, {move: false});
        return false;
      }
      if (!Assembly) {
        layer.msg(trackDateNull, {move: false});
        return false;
      }
      if (load) {
        var tableID = $('#' + id).find('a').attr('href');
        trackPlayback.tableDataAssembly(tableID, monitoringObjectType);
      } else {
        layer.msg(trackDataLoading);
      }


    },
    Assemblys: function () {
      Assembly = true;
      stopDataFlag = true;
    },
    // table导出数据组装
    tableDataAssembly: function (id, monitoringObjectType) {
      var trackPlayBackValue = []
          , url = '/clbs/v/monitoring/exportTrackPlayback'
          , data;
      $(id).find('tbody tr').each(function () {
        var tdData = "";
        $(this).find('td').each(function () {
          var text = $(this).text();
          tdData += (text + ";");
        })
        trackPlayBackValue.push(tdData);
      })
      trackPlayBackValue.push(" ");
      var str = trackPlayBackValue.join("_");
      var compress = unzip(str);
      data = {
        'trackPlayBackValue': compress,
        'tableType': monitoringObjectType,
      }
      ajax_submit('POST', url, 'json', true, data, true, trackPlayback.exportDataCallback);
    },
    // 导出回调函数
    exportDataCallback: function (data) {
      if (data != "") {
        var url = "/clbs/v/monitoring/exportTrackPlaybackGet?tableType=" + data + "";
        window.location.href = url;
      } else {
        layer.msg("亲，没有数据，不能导出哦！");
        /*layer.msg(publicExportError);*/
      }
    },
    //将时间戳变成小时分秒
    changdatainfo: function (data) {
      var day = parseInt(data / (24 * 60 * 60));//计算整数天数
      var afterDay = data - day * 24 * 60 * 60;//取得算出天数后剩余的秒数
      var hour = parseInt(afterDay / (60 * 60));//计算整数小时数
      var afterHour = data - day * 24 * 60 * 60 - hour * 60 * 60;//取得算出小时数后剩余的秒数
      var min = parseInt(afterHour / 60);//计算整数分
      var afterMin = data - day * 24 * 60 * 60 - hour * 60 * 60 - min * 60;//取得算出分后剩余的秒数
      if (day != 0 && hour != 0 && min != 0) {
        var time = day + "天" + hour + "小时" + min + "分" + afterMin + "秒";
        return time;
      }
      var time = day + "天" + hour + "小时" + min + "分" + afterMin + "秒";
      if (day == 0) {
        var time = time.replace(/0天/, "");
      }
      if (hour == 0) {
        var time = time.replace(/0小时/, "");
      }
      if (min == 0) {
        var time = time.replace(/0分/, "");
      }
      return time;


    },
    //将小时分秒变成时间戳
    changedataunix: function (date) {
      var date = date.replace(/-/g, "/");
      var timestamp = new Date(date).getTime();
      timestamp = timestamp / 1000;
      return timestamp;
    },
    ajaxQueryDataFilter: function (treeId, parentNode, responseData) {
      responseData = JSON.parse(ungzip(responseData));
      return filterQueryResult(responseData, crrentSubV);
    },
    searchVehicleTree: function (param) {
      if (param == null || param == undefined || param == '') {
        bflag = true;
        // 清空搜索条件的车辆
        $('#vid').val("");
        $('#pid').val("");
        $.fn.zTree.init($("#treeDemo"), setting, null);
      } else {
        bflag = true;
        var querySetting = {
          async: {
            url: "/clbs/m/functionconfig/fence/bindfence/monitorTreeFuzzy",
            type: "post",
            enable: true,
            autoParam: ["id"],
            dataType: "json",
            otherParam: {"type": "single", "queryParam": param, "queryType": "name"},
            dataFilter: trackPlayback.ajaxQueryDataFilter
          },
          check: {
            enable: true,
            chkStyle: "radio"
          },
          view: {
            dblClickExpand: false
          },
          data: {
            simpleData: {
              enable: true
            }
          },
          callback: {
            beforeCheck: trackPlayback.zTreeBeforeCheck,
            onCheck: trackPlayback.onCheck,
            beforeClick: trackPlayback.zTreeBeforeClick,
            onAsyncSuccess: trackPlayback.zTreeOnAsyncSuccess,
            onClick: trackPlayback.zTreeOnClick,
            onExpand: trackPlayback.zTreeOnExpand,
            beforeAsync: trackPlayback.zTreeBeforeAsync,
            onNodeCreated: trackPlayback.zTreeOnNodeCreated,
          }
        };
        $.fn.zTree.init($("#treeDemo"), querySetting, null);
      }
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
    // 应答确定
    platformMsgAck: function () {
      var answer = $("#answer").val();
      if (answer == "") {
        trackPlayback.showErrorMsg("应答不能为空", "answer");
        return;
      }
      $("#goTraceResponse").modal('hide');
      var msgDataType = $("#msgDataType").val();
      var infoId = $("#infoId").val();
      var objectType = $("#objectType").val();
      var objectId = $("#objectId").val();
      var url = "/clbs/m/connectionparamsset/platformMsgAck";
      json_ajax("POST", url, "json", false, {
        "infoId": infoId,
        "answer": answer,
        "msgDataType": msgDataType,
        "objectType": objectType,
        "objectId": objectId
      });
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
    trackBlackToReal: function () {
      var jumpFlag = false;
      var permissionUrls = $("#permissionUrls").val();
      if (permissionUrls != null && permissionUrls != undefined) {
        var urllist = permissionUrls.split(",");
        if (urllist.indexOf("/v/monitoring/realTimeMonitoring") > -1) {
          jumpFlag = true;
          location.href = "/clbs/v/monitoring/realTimeMonitoring";
        }
      }
      if (!jumpFlag) {
        layer.msg("无操作权限，请联系管理员");
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
                url: '/gis/fence/bindfence/getDMAFenceDetails/',
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
    var map;
    var playState = false;
    isFlag = false;
    trackPlayback.init();
    trackPlayback.responseSocket();
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
