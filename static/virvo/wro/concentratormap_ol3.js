(function($,window){
    var selectTreeId = '';
    var selectDistrictId = '';
    var zNodes = null;
    var log, className = "dark";
    var newCount = 1;
    var columnDefs;
    var columns;
    var setting;
    var treeSetting;
    var idStr;
    var OperationId;
    var selectTreeIdAdd="";
    var startOperation;// 点击运营资质类别的修改按钮时，弹出界面时运营资质类别文本的内容
    var expliant;// 点击运营资质类别的修改按钮时，弹出界面时说明文本的内容
    var vagueSearchlast = $("#userType").val();
    var overlay;
    var getdmamapusedata_flag = 0;
    var markerInfoWindow = null;
    var markerList = [];
    var pressure_gauge;
    var timeTicket = 1;
    var treeClickedType = "";
    var secondw_selected = false;
    var sw_name = "";

    var manufacture_set;

    var infow;

    var $contentLeft = $("#content-left"), $contentRight = $("#content-right");

    var travelLineList,AdministrativeRegionsList,fenceIdList,titleHeight,demoHeight,
  administrativeAreaFence = [],district,googleMapLayer, buildings, satellLayer, realTimeTraffic, map, logoWidth, btnIconWidth, windowWidth,
    newwidth, els, oldMapHeight, myTabHeight, wHeight, tableHeight, mapHeight, newMapHeight, winHeight, headerHeight, dbclickCheckedId, oldDbclickCheckedId,
    onClickVId, oldOnClickVId, zTree, clickStateChar,logTime,operationLogLength, licensePlateInformation, groupIconSkin, markerListT = [], markerRealTimeT,
    zoom = 18, requestStrS, cheakNodec = [], realTimeSet = [], alarmSet = [], neverOline = [], lineVid = [], zTreeIdJson = {}, cheakdiyuealls = [], lineAr = [],
    lineAs = [], lineAa = [], lineAm = [], lineOs = [], changeMiss = [], diyueall = [], params = [], lineV = [], lineHb = [], cluster, fixedPoint = null, fixedPointPosition = null,
    flog = true, mapVehicleTimeW, mapVehicleTimeQ, markerMap, mapflog, mapVehicleNum, infoWindow, paths = null, uptFlag = true, flagState = true,
    videoHeight, addaskQuestionsIndex = 2, dbClickHeighlight = false, checkedVehicles = [], runVidArray = [], stopVidArray = [], msStartTime, msEndTime,
    videoTimeIndex,voiceTimeIndex,charFlag = true, fanceID = "", newCount = 1, mouseTool, mouseToolEdit, clickRectangleFlag = false, isAddFlag = false, isAreaSearchFlag = false, isDistanceCount = false, fenceIDMap, PolyEditorMap,
    sectionPointMarkerMap, fenceSectionPointMap, travelLineMap, fenceCheckLength = 0, amendCircle, amendPolygon, amendLine, polyFence, changeArray, trid = [], parametersID, brand, clickFenceCount = 0,
    clickLogCount = 0, fenceIdArray = [], fenceOpenArray = [], save, moveMarkerBackData, moveMarkerFenceId, monitoringObjMapHeight, carNameMarkerContentMap, carNameMarkerMap, carNameContentLUMap,
    lineSpotMap, isEdit = true, sectionMarkerPointArray, stateName = [], stateIndex = 1, alarmName = [], alarmIndex = 1, activeIndex = 1, queryFenceId = [], crrentSubV=[], crrentSubName=[],
    suFlag=true, administrationMap, lineRoute, contextMenu, dragPointMarkerMap, isAddDragRoute = false, misstype=false,misstypes = false, alarmString, saveFenceName, saveFenceType, alarmSub = 0, cancelList = [], hasBegun=[],
    isDragRouteFlag = false, flagSwitching = true, isCarNameShow = true, notExpandNodeInit,vinfoWindwosClickVid, $myTab = $("#myTab"), $MapContainer = $("#MapContainer"), $panDefLeft = $("#panDefLeft"), 
    $contentLeft = $("#content-left"), $contentRight = $("#content-right"), $sidebar = $(".sidebar"), $mainContentWrapper = $(".main-content-wrapper"), $thetree = $("#thetree"),
    $realTimeRC = $("#realTimeRC"), $goShow = $("#goShow"), $chooseRun = $("#chooseRun"), $chooseNot = $("#chooseNot"), $chooseAlam = $("#chooseAlam"), $chooseStop = $("#chooseStop"),
    $chooseOverSeep = $("#chooseOverSeep"), $online = $("#online"), $chooseMiss = $("#chooseMiss"), $scrollBar = $("#scrollBar"), $mapPaddCon = $(".mapPaddCon"), $realTimeVideoReal = $(".realTimeVideoReal"),
    $realTimeStateTableList = $("#realTimeStateTable"), $alarmTable = $("#alarmTable"), $logging=$("#logging"), $showAlarmWinMark = $("#showAlarmWinMark"), $alarmFlashesSpan = $(".alarmFlashes span"),
    $alarmSoundSpan = $(".alarmSound span"), $alarmMsgBox = $("#alarmMsgBox"), $alarmSoundFont = $(".alarmSound font"), $alarmFlashesFont = $(".alarmFlashes font"), $alarmMsgAutoOff = $("#alarmMsgAutoOff"),
    rMenu = $("#rMenu"), alarmNum = 0, carAddress, msgSNAck, setting, ztreeStyleDbclick, $tableCarAll = $("#table-car-all"), $tableCarOnline = $("#table-car-online"), $tableCarOffline = $("#table-car-offline"),
    $tableCarRun = $("#table-car-run"), $tableCarStop = $("#table-car-stop"), $tableCarOnlinePercent = $("#table-car-online-percent"),longDeviceType,tapingTime,loadInitNowDate = new Date(),loadInitTime,
    checkFlag = false,fenceZTreeIdJson = {},fenceSize,bindFenceSetChar,fenceInputChange,scorllDefaultTreeTop,stompClientOriginal = null, stompClientSocket = null, hostUrl, DblclickName, objAddressIsTrue = [];

    var pageLayout = {
        // 页面布局
        init: function(){
          var url = "/clbs/v/monitoring/getHost";
            // ajax_submit("POST", url, "json", true, {}, true, function(data){
            //  hostUrl = 'http://' + data.obj.host + '/F3/sockjs/webSocket';
            // });
            winHeight = $(window).height();//可视区域高度
            headerHeight = $("#header").height();//头部高度
            var tabHeight = $myTab.height();//信息列表table选项卡高度
            var panhead = $(".panel-heading").height();
            // tabHeight = panhead;
            // console.log("tabHeight height ",tabHeight,"panel head",panhead)
            var tabContHeight = $("#myTabContent").height();//table表头高度
            var fenceTreeHeight = winHeight - 380;//围栏树高度
            $("#treeDemo").css('height',fenceTreeHeight + "px");//电子围栏树高度
            titleHeight = $(".panHeadHeight").height() + 30;
            demoHeight = $("#Demo").height();
            //地图高度
            newMapHeight = winHeight - headerHeight - tabHeight - 5;// - panhead;
            $MapContainer.css({
                "height": newMapHeight + 'px'
            });
            //车辆树高度
            var newContLeftH = winHeight - headerHeight;
            //sidebar高度
            //$(".sidebar").css('height',newContLeftH + 'px');
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
            $mainContentWrapper.attr("class", "main-content-wrapper main-content-toggle-left");
            //操作树高度自适应
            var newTreeH = winHeight - headerHeight - 203;
            $thetree.css({
                "height": newTreeH + "px"
            });
            
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
            // window.onresize=function(){
            //     console.log("onresize ??")
            //     winHeight = $(window).height();//可视区域高度
            //     headerHeight = $("#header").height();//头部高度
            //     var tabHeight = $myTab.height();//信息列表table选项卡高度
            //     var tabContHeight = $("#myTabContent").height();//table表头高度
            //     var fenceTreeHeight = winHeight - 193;//围栏树高度
            //     $("#treeDemo").css('height',fenceTreeHeight + "px");//电子围栏树高度
            //     //地图高度
            //     newMapHeight = winHeight - headerHeight - tabHeight - 10;
            //     $MapContainer.css({
            //         "height": newMapHeight + 'px'
            //     });
            //     //车辆树高度
            //     var newContLeftH = winHeight - headerHeight;
            //     //sidebar高度
            //     $(".sidebar").css('height',newContLeftH + 'px');
            //     //计算顶部logo相关padding
            //     logoWidth = $("#header .brand").width();
            //     btnIconWidth = $("#header .toggle-navigation").width();
            //     windowWidth = $(window).width();
            //     newwidth = (logoWidth + btnIconWidth + 46) / windowWidth * 100;
            //     //左右自适应宽度
            //     $contentLeft.css({
            //         "width": newwidth + "%"
            //     });
            //     $contentRight.css({
            //         "width": 100 - newwidth + "%"
            //     });
            //   //操作树高度自适应
            //     var newTreeH = winHeight - headerHeight - 203;
            //     $thetree.css({
            //         "height": newTreeH + "px"
            //     });
                
            // }
        },
    };
    var vectorLayer1;

    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: '/static/scada/img/bz_s.png'
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


            var center = [118.39469563,29.888188578];
            map = new ol.Map({
                layers: [vec_layer,cta_wlayer,cva_clayer,vectorLayer1],
                controls: controls,
                target: 'MapContainer',
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
                  var content = concentratormap.createStationInfo('demo',feature.get('properties'));
                  console.log(content);
                  element.appendChild(content);
                //   var content = mapSecondwater.markerContent(feature.get('properties'));
                //   console.log(content);
                //   element.appendChild('<div class="info">'+content+'</div>');
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

    concentratormap = {
        
        init: function(){

            

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
            stationname.innerHTML = "集中器名称:" ;
            var span = document.createElement("span");
            span.className = "span2";
            span.innerHTML = content.name;
            stationname.appendChild(span);
            info.appendChild(stationname);
            
            
            
            var meterstate = document.createElement("div");
            meterstate.innerHTML = "状&nbsp; &nbsp; &nbsp; 态:";
            var span = document.createElement("span");
            if(content.status == "在线"){
                span.className = "span3";
            }else{
                span.className = "span4";
            }
            span.innerHTML = content.status;
            meterstate.appendChild(span);
            info.appendChild(meterstate);
            
           
            
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
        markerContent:function(station){
            content = [];
            content.push('集中器名称:<span style="color:#0099CC;">'+station.stationname+"</span>");
            if(station.status == "在线"){
                content.push('通讯状态:<span style="color:#008000;">'+station.status+"</span>");
            }else{
                content.push('通讯状态:<span style="color:#008000;">'+station.status+"</span>");
            }
            // content.push('进水压力:<span >'+station.press_in+"</span>");
            // content.push('出水压力:<span >'+station.press_out+"</span>");
            // content.push('瞬时流量:<span >'+station.flux+"</span>");
            
            
            return content.join("<br/>");
        },
        
        // 从实时库获取数据
        getContent:function(){
            var obj = new JGaraphPlugin.ClientDataAccess({hostName:'220.179.118.150',port:'8082'});

            var arr = new Array();
            var nVal0 = new NumericVal("0",'sxss_a3_11', 0, 'cccc/ccc/ccc_ccc:ccc:ccc', 'cccc/ccc/ccc_ccc:ccc:ccc');
            var nVal1 = new NumericVal("1",'sxss_a3_12', 0, 'cccc/ccc/ccc_ccc:ccc:ccc', 'cccc/ccc/ccc_ccc:ccc:ccc');
            arr.push(nVal0);
            arr.push(nVal1);
            
            for(var i=0;i<1;i++){
                obj.getSingleData(arr,function(res, textStatus){
                   if(textStatus === "success"){
                    console.log("res",res,typeof(res))
                        res_json = JSON.parse(res)
                      for(var i=0; i<res_json.length; i++){
                         var tVal = res_json[i];
                         console.log("id:" + tVal.id + " value:" + tVal.value);
                      }
                   }
                },function(XMLHttpRequest, textStatus, errorThrown){
                    console.log(" error msg: " + textStatus);
                });
            }
        },
        //关闭信息窗体
        closeInfoWindow:function () {
            map.clearInfoWindow();
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
                        // "isConcentrator" : "1",
                        "isCommunity":"1",
                        // "csrfmiddlewaretoken": "{{ csrf_token }}"
                    },
                    dataFilter: concentratormap.ajaxDataFilter
                },
                view : {
                    // addHoverDom : concentratormap.addHoverDom,
                    // removeHoverDom : concentratormap.removeHoverDom,
                    selectedMulti : false,
                    nameIsHTML: true,
                    // fontCss: setFontCss_ztree
                },
                edit : {
                    enable : true,
                    editNameSelectAll : true,
                    showRemoveBtn : false,//concentratormap.showRemoveBtn,
                    showRenameBtn : false
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    onClick : concentratormap.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#treeDemo"), treeSetting, zNodes);
            var treeObj = $.fn.zTree.getZTreeObj('treeDemo');treeObj.expandAll(true);
           
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
            if(treeNode.otype == "community"){

                var columns1 = [
                    {
                        //第一列，用来显示序号
                        "data" : "seq",
                        "width":"80px",
                        "class" : "text-center"
                    },
                    {
                        //第2列，报警时间
                        "data" : "happentime",
                        "width":"150px",
                        "class" : "text-center"
                    },
                    {
                        //第3列，处理状态
                        "data" : "procesState",
                        "width":"150px",
                        "class" : "text-center"
                    },
                    {
                        //第4列，报警类型
                        "data" : "alarmtype",
                        "width":"150px",
                        "class" : "text-center"
                    },
                    {
                        //第5列，报警等级
                        "data" : "alarmlevel",
                        "width":"150px",
                        "class" : "text-center"
                    },
                    {
                        //第6列，处理人
                        "data" : "processor",
                        "width":"100px",
                        "class" : "text-center"
                    },
                    {
                        //第7列，处理时间
                        "data" : "processtime",
                        "width":"150px",
                        "class" : "text-center"
                    },
                    {
                        //第8列，处理方法
                        "data" : "why",
                        "width":"300px",
                        "class" : "text-center"
                    },
                ];

                var data1 = [
                    {"seq":1,"happentime":"2018-12-25 09:29:08","procesState":"未处理","alarmtype":"变频器接地故障","alarmlevel":"全局","processor":"张三","processtime":"2019-01-19","why":"鸿基商贸城表具未实时上传，去现场看正常"},
                    {"seq":2,"happentime":"2018-12-25","procesState":"已处理","alarmtype":"水泵故障","alarmlevel":"全局","processor":"张三","processtime":"2019-01-19 09:29:08","why":"鸿基商贸城表具未实时上传，去现场看正常"},
                    {"seq":3,"happentime":"2018-12-25","procesState":"未处理","alarmtype":"溢流报警","alarmlevel":"局部","processor":"张三","processtime":"2019-01-19","why":"鸿基商贸城表具未实时上传，去现场看正常"},
                    {"seq":4,"happentime":"2018-12-25","procesState":"已处理","alarmtype":"月度常规巡检","alarmlevel":"全局","processor":"张三","processtime":"2019-01-19","why":"鸿基商贸城表具未实时上传，去现场看正常"},
                    {"seq":5,"happentime":"2018-12-25","procesState":"已处理","alarmtype":"月度常规巡检","alarmlevel":"全局","processor":"张三","processtime":"2019-01-19","why":"鸿基商贸城表具未实时上传，去现场看正常"},
                ];

                var columns2 = [
                    {
                        //第一列，用来显示序号
                        "data" : "seq",
                        "width":"80px",
                        "class" : "text-center"
                    },
                    {
                        //第2列，维修时间
                        "data" : "happentime",
                        "width":"150px",
                        "class" : "text-center"
                    },
                    {
                        //第3列，维修类型
                        "data" : "procesState",
                        "width":"150px",
                        "class" : "text-center"
                    },
                    {
                        //第4列，处理人
                        "data" : "processor",
                        "width":"100px",
                        "class" : "text-center"
                    },
                    {
                        //第5列，处理时间
                        "data" : "processtime",
                        "width":"150px",
                        "class" : "text-center"
                    },
                    {
                        //第6列，处理方法
                        "data" : "why",
                        "width":"350px",
                        "class" : "text-center"
                    },
                ];

                var data2 = [
                    {"seq":1,"happentime":"2018-12-25 09:29:08","procesState":"变频器接地故障","processor":"","processtime":"","why":""},
                    {"seq":2,"happentime":"2018-12-25 09:29:08","procesState":"水泵故障","processor":"","processtime":"","why":""},
                    {"seq":3,"happentime":"2018-12-25 09:29:08","procesState":"溢流报警","processor":"张三","processtime":"","why":""},
                    {"seq":4,"happentime":"2018-12-25 09:29:08","procesState":"月度常规巡检","processor":"张三","processtime":"2019-01-19 08:00:00","why":"分区内有夜间施工，导致夜间正常用水量大"},
                    {"seq":5,"happentime":"2018-12-25 09:29:08","procesState":"月度常规巡检","processor":"李四","processtime":"2019-01-19 08:00:00","why":"鸿基商贸城表具未实时上传，去现场看正常"},
                ];

                // concentratormap.getTable('#gpsTable3', [[0,'2018-12-25 12:34','未处理','分区内表具报警','','',''],
                // [1,'2018-12-25','未处理','产销差过高','','',''],
                // [2,'2018-12-25','未处理','夜间小流异常','','',''],
                // [3,'2018-12-25','已处理','夜间小流异常','张三','2018-12-26 ','分区内有夜间施工，导致夜间正常用水量大'],
                // ]);

                // concentratormap.getTable('#maintaininfoTable', [
                //     [0,'2018-12-25 12:34','分区内表具报警','','',''],
                //     [1,'2018-12-25','产销差过高','','',''],
                //     [2,'2018-12-25','夜间小流异常','','',''],
                //     [3,'2018-12-25','夜间小流异常','张三','2018-12-26 ','分区内有夜间施工，导致夜间正常用水量大'],
                //     [4,'2018-12-25','变频器接地故障','张三','2018-12-26 ','分区内有夜间施工，导致夜间正常用水量大'],
                //     [5,'2018-12-25','月度常规巡检','张三','2018-12-26 ','鸿基商贸城表具未实时上传，去现场看正常'],
                // ]);
                
                // concentratormap.getTable('#gpsTable3',data1,columns1);
                // concentratormap.getTable('#maintaininfoTable',data2,columns2);
                secondw_selected = true;
                sw_name = treeNode.name;
                $("#bindswname").html(sw_name);
                // do something
                // $("#fenceBindTable").show();
                concentratormap.pressureGauge();
            }else{
                secondw_selected = false;
                concentratormap.requireConcentratorinfo();
            }
            treeClickedType = treeNode.otype;
            // concentratormap.TabCarBox();
            concentratormap.showHidePeopleOrVehicle();
            
        },
        pressureGauge:function(){
            // ajax访问后端查询
            
            communityid = selectTreeId
            $.ajax({
                type: "GET",
                url: "/wirelessm/concentratorStatics/",
                data: {
                  "communityid": communityid
                },
                dataType: "json",
                success: function (data) {
                    console.log(data.condata)
                    if(data.success)
                    {
                        $("#total_meter").text();
                        $("#year_use").text();
                        $("#concentrator_count").text();
                        $("#online_water").text();
                        $("#online_ratio").text();
                        $("#alarm_count").text();
                        $("#nb_count").text();
                        $("#lora_count").text();
                        $("#this_mon_use").text();
                        $("#last_mon_use").text();

                        $("#total_meter").text(data.condata.total_meter);
                        $("#year_use").text(data.condata.year_use);
                        $("#concentrator_count").text(data.condata.concentrator_count);
                        $("#online_water").text(data.condata.online_water);
                        $("#online_ratio").text(data.condata.online_ratio + '%');
                        $("#alarm_count").text(data.condata.alarm_count);
                        $("#nb_count").text(data.condata.nb_count);
                        $("#lora_count").text(data.condata.lora_count);
                        $("#this_mon_use").text(data.condata.this_mon_use);
                        $("#last_mon_use").text(data.condata.last_mon_use);

                        // manufarure
                        manufacture_set = data.manufacturer_data;

                        console.log(manufacture_set)

                        option = {
                            title : {
                                text: '厂家统计表',
                                x:'center'
                            },
                            tooltip : {
                                trigger: 'item',
                                formatter: "{a} <br/>{b} : {c} ({d}%)"
                            },
                            // legend: {
                            //     orient: 'vertical',
                            //     left: 'left',
                            //     data: ['LORA智能','NB物联','有线远传','其它']
                            // },
                            series : [
                                {
                                    name: '表类型',
                                    type: 'pie',
                                    radius : '55%',
                                    center: ['50%', '60%'],
                                    // data:[
                                    //     {value:335, name:'LORA智能'},
                                    //     {value:310, name:'NB物联'},
                                    //     {value:234, name:'有线远传'},
                                    //     {value:135, name:'其它'},
                                    // ],
                                    data:manufacture_set,
                                    itemStyle: {
                                        emphasis: {
                                            shadowBlur: 10,
                                            shadowOffsetX: 0,
                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                    }
                                }
                            ]
                        };


                        pressure_gauge = echarts.init(document.getElementById('pressure_gauge'));
                        pressure_gauge.setOption(option);

                        var data_flow = [];
                        var data_seris = [];

                        dm = data.monthlydata;
                        $.each(dm,function(k,v){
                            // console.log(k,":",v)
                            d = k.substring(5,10)
                            
                            if(v<0){
                                v = "";
                            }
                            data_flow.push(v);
                            data_seris.push(d);
                        })

                        option2 = {
                            title: {
                                left: 'center',
                                text: '用水量统计图',
                            },
                            xAxis: {
                                type: 'category',
                                data: data_seris,//['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12', '10-13','10-14', '10-15', '10-16', '10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25', '10-26','10-27','10-28','10-29','10-30']
                            },
                            yAxis: {
                                name:'流量(吨)',
                                type: 'value'
                            },
                            series: [{
                                data: data_flow,//[0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27],
                                type: 'line',
                                smooth: true
                            }]
                        };

                        usewaterstatics = echarts.init(document.getElementById('usewaterstatics'));
                        usewaterstatics.setOption(option2);
                    }

                }
            });

            

            // clearInterval(timeTicket);
            // timeTicket = setInterval(function (){
            //     option.series[0].data[0].value = (Math.random()).toFixed(2) - 0;
            //     pressure_gauge.setOption(option, true);
            // },2000);


            
        },
        getTable: function (table, data,columns, sy) {
          var dataHeight;
          if (sy !== undefined) {
            dataHeight = sy;
          } else {
            dataHeight = 221;
          }

          //表格列定义
            var columnDefs = [ {
                //第一列，用来显示序号
                "searchable" : false,
                "orderable" : false,
                "targets" : 0
            } ];
          
          table = $(table).DataTable({
            "destroy": true,
            "dom": 'itprl',// 自定义显示项
            "scrollX": false,
            "scrollY": false,
            "columnDefs":columnDefs,
            "columns":columns,
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
        //收缩绑定列表
        bingListClick: function () {
            if(secondw_selected){
                if ($(this).children('i').hasClass('fa-chevron-down')) {
                    $(this).children('i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
                    //  $("#MapContainer").animate({'height':(winHeight - (winHeight/8)+5  )+ "px"});
                    $("#MapContainer").animate({'height':(winHeight - 130 )+ "px"});
                    // $("#binddmaname").html("");

                } else {
                    $(this).children('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
                    var trLength = $('#dataTableBind tbody tr').length;
                    $("#MapContainer").animate({'height': (winHeight  - trLength * 46 - 127) + "px"});
                };
            }
        },
        showHidePeopleOrVehicle: function () {
          //判断点击的监控对象的协议类型
          // if (worldType == "5") {
          if (treeClickedType == "community") {
            //隐藏车
            
            $("#warningData,#tableAlarmDate").removeClass("active");
            $("#baseinfo,#tableBaseinfoDate").removeClass("active");
            $("#artprocess,#tableArtisanDate").removeClass("active");
            $("#maintaininfo,#tableMaintainDate").removeClass("active");
            $("#v-travelData,#GPSData").addClass("active in").show();
            
            //计算高度赋值
                  console.log("1.mapHeight=",newMapHeight)
                  $("#MapContainer").css({
                    "height": (newMapHeight - 241) + "px"
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
                    $(document).bind("mousemove", concentratormap.mouseMove).bind("mouseup", concentratormap.mouseUp);
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
                  console.log("2.")

                  $("#scalingBtn").unbind().bind("click", function () {
                    if ($(this).hasClass("fa-chevron-down")) {
                      oldMHeight = $("#MapContainer").height();
                      oldTHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
                      $(this).attr("class", "fa  fa-chevron-up")
                      var mapHeight = winHeight - headerHeight - titleHeight - demoHeight - 10;
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
            var mapHeight = winHeight - headerHeight - titleHeight - demoHeight - 10;
              $("#MapContainer").css({
                "height": mapHeight + "px"
              });
              $(".trackPlaybackTable .dataTables_scrollBody").css({
                "height": "0px"
              });
          }
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
        TabCarBox: function () {
            monitoringObjMapHeight = $("#MapContainer").height();
            
            $("#fenceBindTable").css("display", "block");
            
            var bingLength = $('#dataTableBind tbody tr').length;
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            var nodes = treeObj.getSelectedNodes()
            var stype = nodes[0].type;
            console.log("tree selete type ",stype);

            // var checkNode = treeObj.getCheckedNodes(true);
            // if ( 0) {
            //     $("#MapContainer").css("height", newMapHeight + 'px');
            // } else {
            //     if ($('#bingListClick i').hasClass('fa fa-chevron-down')) {
            //         if (bingLength == 0) {
            //             $("#MapContainer").css("height", newMapHeight + 'px');
            //         } else {
            //             $("#MapContainer").css('height', (newMapHeight - 80 - 30 * bingLength - 105) + 'px');
            //         }
            //         ;
            //     } else {
            //         $("#MapContainer").css("height", newMapHeight + 'px');
            //     }
            //     ;
            // };
            if(stype == "secondwater"){
                $("#MapContainer").css('height', (newMapHeight - 30 * bingLength - 137) + 'px');
                $("#fenceInfoTable").show();
                // recent7flowpress.resize();
                // $("#binddmaname").html(dma_bindname);
                // findOperation.fenceBind();
            }
            else{
                // $("#fenceBindTable").hide();
                // $("#MapContainer").css("height", (winHeight - (winHeight/8)+10  ) + 'px');
                $("#MapContainer").css("height", (winHeight - 130  ) + 'px');
                $("#searchBtnInput").hide()
                $("#searchInput").hide()
                // $("#binddmaname").html("");


                // if ($('#bingListClick i').hasClass('fa fa-chevron-down')){
                //     $("#MapContainer").animate({'height': newMapHeight + "px"});
                // }
                
            }
            // $("#MapContainer").css('height', (newMapHeight - 80 - 44 * bingLength - 205) + 'px');
            // 订阅电子围栏
            // if (clickFenceCount == 0) {
            //     webSocket.subscribe(headers, "/user/" + $("#userName").text() + '/fencestatus', fenceOperation.updataFenceData, null, null);
            // };
            clickFenceCount = 1;
        },
        requireConcentratorinfo:function(){

            var data={"groupName":selectTreeId};
            var url="/api/wirelessm/getconcentratormaplist/";
            json_ajax("POST", url, "json", true,data,concentratormap.buildstationinfo);
        },
        buildstationinfo:function(data){
            // console.log(data);
            var stationinfo ;
            // for(var i = 0;i<markerList.length;i++){
            //     marker = markerList[i];
            //     console.log(marker);
            //     map.remove(marker)
            // }
            // if(data.entminfo != null && data.entminfo != ""){
            //     entminfo = data.entminfo
            //     concentratormap.adaptMap(entminfo)
            // }
            // map.remove(markerList)
            vectorLayer1.getSource().clear();   
            markerList = [];
            if (data.obj != null && data.obj != ""){
                stationinfo = data.obj;
                
                for (var i = 0; i < stationinfo.length; i++){
                    station = stationinfo[i];
                    
                    if(isNaN(station.lng) || isNaN(station.lat)){
                        continue;
                      }
                    marker = concentratormap.createMarker(station);
                    markerList.push(marker);
                }

                vectorLayer1.getSource().addFeatures(markerList);
                var polygon = markerList[0].getGeometry();
                console.log(polygon)
                map.getView().fit(polygon, map.getSize()); 
                // map.getView().setCenter([stationinfo[0].lng,stationinfo[0].lat]);


            }

            
        },
        adaptMap:function(data){
            console.log(data)
            var islocation = data.islocation;
            var zoomIn = data.zoomIn;
            var coorType = data.coorType;
            var longitude = data.longitude;
            var latitude = data.latitude;
            var districtlevel = data.districtlevel;
            var adcode = data.adcode;

            if(islocation == "on"){
                var opts = {
                    subdistrict: 0,   //获取边界不需要返回下级行政区
                    extensions: 'all',  //返回行政区边界坐标组等具体信息
                    level: districtlevel  //查询行政级别为 市
                };
                district = new AMap.DistrictSearch(opts);//注意：需要使用插件同步下发功能才能这样直接使用
                district.search(adcode, function (status, result) {
                    console.log(status,result,result.districtList[0])
                    if (status == 'complete') {
                        fenceOperation.getData(result.districtList[0]);
                    }
                });
            }else{
                if(longitude == null || latitude == null || zoomIn == null){
                    longitude = 113.93678
                    latitude = 22.527372
                    zoomIn = 14
                }
                map.setCenter([longitude,latitude]);
                map.setZoom(zoomIn)
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
                concentratormap.findOperation();
            }
        }
    }
    $(function(){
        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('treeDemo',id,'group');
            };
        });
        var map;
        concentratormap.userTree();
        
        pageLayout.init();
        concentratormap.init();
        
        concentratormap.requireConcentratorinfo();

        $("#bingListClick").bind("click", concentratormap.bingListClick);
        // map.on(['pointermove', 'singleclick'], concentratormap.moveonmapevent);
        
    })
})($,window)
