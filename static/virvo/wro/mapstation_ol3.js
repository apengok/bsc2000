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

    var $contentLeft = $("#content-left"), $contentRight = $("#content-right");

    var travelLineList,AdministrativeRegionsList,fenceIdList,
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

    var vectorLayer1;

    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: 'https://openlayers.org/en/v3.20.1/examples/data/icon.png'
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
        
        init: function(){

            var winHeight = $(window).height();//可视区域高度
            console.log("winHeight",winHeight);
            var headerHeight = $("#header").height();//头部高度
            console.log("headerHeight",headerHeight);
            console.log("$contentLeft",$contentLeft.height());
            console.log("$sidebar height",$(".sidebar").height());

            //计算顶部logo相关padding
            var logoWidth = $("#header .brand").width();
            var btnIconWidth = $("#header .toggle-navigation").width();
            var windowWidth = $(window).width();
            var newwidth = (logoWidth + btnIconWidth + 46) / windowWidth * 100;
            //左右自适应宽度
            $contentLeft.css({
                "width": newwidth + "%",
            });
            $contentRight.css({
                "width": 100 - newwidth + "%"
            });

            //地图高度
            var newMapHeight = winHeight - headerHeight  - 10;
            $("#map-container").css({
                "height": newMapHeight + 'px'
            });
            console.log("$newMapHeight",$("#map-container").height());
            $contentLeft.css({
                "height": newMapHeight + "px",
            });
            console.log("$contentLeft",$contentLeft.height());
            var newContLeftH = winHeight - headerHeight ;

            $("#sidebar").css({
                "height": newMapHeight + "px"
            });
            console.log("$sidebar height",$(".sidebar").height());

            $("#treeDemo").css({
                "height": 388 + "px"
            });

            // mapStation.amapinit();
            ol3ops.init();

            
            
        },
        //构建自定义信息窗体
        
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
                    
                    if(isNaN(station.lng) || isNaN(station.lat)){
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
    $(function(){
        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('treeDemo',id,'group');
            };
        });
        var map;
        mapStation.userTree();
        
        mapStation.init();
        
        mapStation.requireStation();
        // map.on(['pointermove', 'singleclick'], mapStation.moveonmapevent);
        
    })
})($,window)
