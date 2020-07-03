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

    var fenceOperation = {
        
        //行政区域选择后数据处理
        getData: function (data) {
            var bounds = data.boundaries;
            if (bounds) {
                // $('#administrativeLngLat').val(bounds.join('-'));
                for (var i = 0, l = bounds.length; i < l; i++) {
                    var polygon = new AMap.Polygon({
                        map: map,
                        strokeWeight: 1,
                        strokeColor: '#CC66CC',
                        fillColor: '#CCF3FF',
                        fillOpacity: 0.5,
                        path: bounds[i]
                    });
                    // administrativeAreaFence.push(polygon);
                    map.setFitView(polygon);//地图自适应
                }
                ;
            };
            
        },
        //显示行政区域
        drawAdministration: function (data, aId, showMap) {
            var polygonAarry = [];
            if (administrationMap.containsKey(aId)) {
                var this_fence = administrationMap.get(aId);
                map.remove(this_fence);
                administrationMap.remove(aId);
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
                administrativeAreaFence.push(polygon);
            }
            ;
            administrationMap.put(aId, polygonAarry);
            map.setFitView(polygon);//地图自适应
        },
    }

    mapStation = {
         // 地图初始化
        amapinit: function () {
            // 创建地图
            map = new AMap.Map("map-container", {
                resizeEnable: true,   //是否监控地图容器尺寸变化
                zoom: 18,       //地图显示的缩放级别
            });
            // // 输入提示
            // var startPoint = new AMap.Autocomplete({
            //     input: "startPoint"
            // });
            // startPoint.on('select', fenceOperation.dragRoute);
            // var endPoint = new AMap.Autocomplete({
            //     input: "endPoint"
            // });
            // endPoint.on('select', fenceOperation.dragRoute);
            // 行政区划查询
            adcode = $("#entadcode").val()
            if(adcode != ""){
                var entislocation = $("#entislocation").val()
                var entdistrictlevel = $("#entdistrictlevel").val()

                console.log(entislocation,entdistrictlevel,adcode)
                var opts = {
                    subdistrict: 0,   //获取边界不需要返回下级行政区
                    extensions: 'all',  //返回行政区边界坐标组等具体信息
                    level: 'district'  //查询行政级别为 市
                };
                district = new AMap.DistrictSearch(opts);//注意：需要使用插件同步下发功能才能这样直接使用
                district.search('china', function (status, result) {
                    console.log(status,result,result.districtList[0])
                    if (status == 'complete') {
                        fenceOperation.getData(result.districtList[0]);
                    }
                });
            }
            // 地图移动结束后触发，包括平移和缩放
            mouseTool = new AMap.MouseTool(map);
            // mouseTool.on("draw", fenceOperation.createSuccess);
            mouseToolEdit = new AMap.MouseTool(map);
            // 实例化3D楼块图层
            buildings = new AMap.Buildings();
            // 在map中添加3D楼块图层
            buildings.setMap(map);
            // 地图标尺
            var mapScale = AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], function () {
                map.addControl(new AMap.ToolBar());
                map.addControl(new AMap.Scale());
            });
            // 卫星地图
            satellLayer = new AMap.TileLayer.Satellite();
            satellLayer.setMap(map);
            satellLayer.hide();
            // // 实时路况
            // realTimeTraffic = new AMap.TileLayer.Traffic({zIndex: 1});
            // realTimeTraffic.setMap(map);
            // realTimeTraffic.hide();
            // 当范围缩小时触发该方法
            // var clickEventListener = map.on('zoomend', amapOperation.clickEventListener);
            // 当拖拽结束时触发该方法
            // var clickEventListener2 = map.on('dragend', amapOperation.clickEventListener2);
            // 地图点击隐藏车辆树右键菜单
            map.on("click", function () {
                $("#rMenu").css("visibility", "hidden");
                $("#disSetMenu").slideUp();
                $("#mapDropSettingMenu").slideUp();
                $("#fenceTool>.dropdown-menu").hide();
            });
            infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -10), closeWhenClickMap: true});
        },
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

            mapStation.amapinit();

            // // map
            // var layer = new AMap.TileLayer({
            //       zooms:[3,20],    //可见级别
            //       visible:true,    //是否可见
            //       opacity:1,       //透明度
            //       zIndex:0         //叠加层级
            // });
            

            // map = new AMap.Map('map-container',{
            //     zoom: 15,  //设置地图显示的缩放级别
            //     center: [118.438781,29.871515],
            //     layers:[layer], //当只想显示标准图层时layers属性可缺省
            //     viewMode: '2D',  //设置地图模式
            //     lang:'zh_cn',  //设置地图语言类型
            // });

            
            
            
        },
        //构建自定义信息窗体
        createInfoWindow:function (title, content) {
            var info = document.createElement("div");
            info.className = "info";
     
            //可以通过下面的方式修改自定义窗体的宽高
            //info.style.width = "400px";
            // 定义顶部标题
            var top = document.createElement("div");
            var titleD = document.createElement("div");
            var closeX = document.createElement("img");
            top.className = "info-top";
            titleD.innerHTML = title;
            closeX.src = "http://webapi.amap.com/images/close2.gif";
            closeX.onclick = mapStation.closeInfoWindow();
     
            top.appendChild(titleD);
            top.appendChild(closeX);
            info.appendChild(top);
     
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
        infoWindow:function(){
            // overlay = document.getElementById('js-overlay');
            markerInfoWindow = new AMap.InfoWindow({
                isCustom: true,  //使用自定义窗体
                // content: mapStation.createInfoWindow("title", overlay.innerHTML),
                // size:new AMap.Size(400,300),
                offset: new AMap.Pixel(16, -45),
                autoMove: true
            });
            return markerInfoWindow;
        },
        createMarker:function(station){
            var position = new AMap.LngLat(station.lng,station.lat);
            var marker = new AMap.Marker({
                position: position,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                title: station.stationname
            });
            infow = mapStation.infoWindow();
            marker.on("mouseover",function(e){
                
                // var position = e.lnglat;
                // console.log(position);
                conts = mapStation.createStationInfo(station.stationname, station)

                infow.setContent(conts);
                // markerInfoWindow.setSize(AMap.Size(400,300));
                infow.open(map,position);
            });

            marker.on("mouseout",function(){
                infow.close();
            })

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
            span.innerHTML = content.stationname;
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
            span.innerHTML = content.serialnumber;
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
            if(content.status == "在线"){
                span.className = "span3";
            }else{
                span.className = "span4";
            }
            span.innerHTML = content.status;
            meterstate.appendChild(span);
            info.appendChild(meterstate);
            
            var split = document.createElement("img");
            split.src = "/static/virvo/images/u3922.png";
            info.appendChild(split);

            var readtime = document.createElement("div");
            readtime.innerHTML = "采集时间:";
            var span = document.createElement("span");
            span.className = "span1";
            span.innerHTML = content.readtime;
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
            span.innerHTML = content.totalflux;
            accumuflux.appendChild(span);
            info.appendChild(accumuflux);
            
            var press = document.createElement("div");
            press.innerHTML = "管网压力:";
            var span = document.createElement("span");
            span.className = "span1";
            span.innerHTML = content.press;
            press.appendChild(span);
            info.appendChild(press);
            
            var signlen = document.createElement("div");
            signlen.innerHTML = "信号强度:";
            var span = document.createElement("span");
            span.className = "span1";
            span.innerHTML = content.signal;
            signlen.appendChild(span);
            info.appendChild(signlen);
            
            
            // 定义底部内容
            var bottom = document.createElement("div");
            bottom.className = "info-bottom";
            bottom.style.position = 'relative';
            bottom.style.top = '10px';
            bottom.style.margin = '0 auto';
            var sharp = document.createElement("img");
            sharp.src = "http://webapi.amap.com/images/sharp.png";
            bottom.appendChild(sharp);
            info.appendChild(bottom);
            return info;
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
            if(data.entminfo != null && data.entminfo != ""){
                entminfo = data.entminfo
                mapStation.adaptMap(entminfo)
            }
            map.remove(markerList)
            markerList = [];
            if (data.obj != null && data.obj != ""){
                stationinfo = data.obj;
                
                for (var i = 0; i < stationinfo.length; i++){
                    station = stationinfo[i];
                    
                    if(station.lng == null)
                        continue;
                    // console.log(station.lng,station.lng)
                    if(station.lng == 'q1')
                    {
                        continue;
                    }
                    marker = mapStation.createMarker(station);
                    markerList.push(marker);
                }

                
                map.add(markerList);

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
