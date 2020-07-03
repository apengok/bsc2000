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

    var organSelected = "";

    var $contentLeft = $("#content-left"), $contentRight = $("#content-right");

    var travelLineList,AdministrativeRegionsList,fenceIdList,
  administrativeAreaFence = [],district,googleMapLayer, buildings, satellLayer, realTimeTraffic, map, logoWidth, btnIconWidth, windowWidth,
    newwidth, els, oldMapHeight, myTabHeight, wHeight, tableHeight, mapHeight, newMapHeight, winHeight, headerHeight, dbclickCheckedId, oldDbclickCheckedId,
    onClickVId, oldOnClickVId, zTree, clickStateChar,logTime,operationLogLength, licensePlateInformation, groupIconSkin, markerListT = [], markerRealTimeT,
    zoom = 18, requestStrS, cheakNodec = [], realTimeSet = [], alarmSet = [], neverOline = [], lineVid = [], zTreeIdJson = {}, cheakdiyuealls = [], lineAr = [],
    lineAs = [], lineAa = [], lineAm = [], lineOs = [], changeMiss = [], diyueall = [], params = [], lineV = [], lineHb = [], cluster, fixedPoint = null, fixedPointPosition = null,
    flog = true, mapVehicleTimeW, mapVehicleTimeQ, markerMap, mapflog, mapVehicleNum, infoWindow, paths = null, uptFlag = true, flagState = true,
    videoHeight, addaskQuestionsIndex = 2, dbClickHeighlight = false, checkedVehicles = [], runVidArray = [], stopVidArray = [], msStartTime, msEndTime,
    videoTimeIndex,voiceTimeIndex,charFlag = true, fanceID = "", newCount = 1, mouseTool, mouseToolEdit, clickRectangleFlag = false, isAddFlag = false, isAreaSearchFlag = false, isDistanceCount = false, fenceIDMap=[], PolyEditorMap=[],
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
    var drawControl;
    var fenceChanged = false;
    var editing_fenceId;


    var pageLayout = {
        // 页面布局
        init: function(){
          
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
        },
        // 数组原型链拓展方法
        arrayExpand: function() {
            Array.prototype.isHas = function (a) {
                if (this.length === 0) {
                    return false
                };
                for (var i = 0, len = this.length; i < len; i++) {
                    if (this[i] === a) {
                        return true
                    }
                }
            };
            // 数组功能扩展
            Array.prototype.each = function (fn) {
                fn = fn || Function.K;
                var a = [];
                var args = Array.prototype.slice.call(arguments, 1);
                for (var i = 0, len = this.length; i < len; i++) {
                    var res = fn.apply(this, [this[i], i].concat(args));
                    if (res != null) a.push(res);
                }
                return a;
            };
            // 数组是否包含指定元素
            Array.prototype.contains = function (suArr) {
                for (var i = 0, len = this.length; i < len; i++) {
                    if (this[i] == suArr) {
                        return true;
                    }
                }
                return false;
            }
            // 两个数组的交集
            Array.intersect = function (a, b) {
                return a.each(function (o) {
                    return b.contains(o) ? o : null
                });
            };
            // 两个数组的差集
            Array.minus = function (a, b) {
                return a.each(function (o) {
                    return b.contains(o) ? null : o
                });
            };
            // 删除数组指定下标或指定对象
            Array.prototype.remove = function (obj) {
                for (var i = 0; i < this.length; i++) {
                    var temp = this[i];
                    if (!isNaN(obj)&&obj.length<4) {
                        temp = i;
                    }
                    if (temp == obj) {
                        for (var j = i; j < this.length; j++) {
                            this[j] = this[j + 1];
                        }
                        this.length = this.length - 1;
                    }
                }
            };
            Array.prototype.removeObj = function (obj) {
                for (var i = 0; i < this.length; i++) {
                    var temp = this[i];
                    if (temp == obj) {
                        for (var j = i; j < this.length; j++) {
                            this[j] = this[j + 1];
                        }
                        this.length = this.length - 1;
                    }
                }
            };
            // 去重
            Array.prototype.unique2 = function () {
                var res = [this[0]];
                for (var i = 1, len = this.length; i < len; i++) {
                    var repeat = false;
                    for (var j = 0, jlen = res.length; j < jlen; j++) {
                        if (this[i].id == res[j].id) {
                            repeat = true;
                            break;
                        }
                    }
                    if (!repeat) {
                        res.push(this[i]);
                    }
                }
                return res;
            };
            Array.prototype.unique3 = function(){
                var res = [];
                var json = {};
                for(var i = 0, len = this.length; i < len; i++){
                    if(!json[this[i]]){
                        res.push(this[i]);
                        json[this[i]] = 1;
                    }
                };
                return res;
            };
        },
        
        
        //右边菜单显示隐藏切换
        toggleLeft: function () {
            if ($sidebar.hasClass("sidebar-toggle")) {
                if ($contentLeft.is(":hidden")) {
                    $contentRight.css("width", "100%");
                } else {
                    $contentLeft.css("width",newwidth + "%");
                    $contentRight.css("width",(100 - newwidth) + "%");
                }
            } else {
                if ($contentLeft.is(":hidden")) {
                    $contentRight.css("width", "100%");
                } else {
                    $contentRight.css("width", (100 - newwidth -5) + "%");
                    $contentLeft.css("width", (newwidth + 5) + "%");
                }
            }
        },
        //左侧操作树点击隐藏
        goHidden: function () {
            $contentLeft.hide();
            $contentRight.attr("class", "col-md-12 content-right");
            $contentRight.css("width", "100%");
            $goShow.show();
        },
        //左侧操作树点击显示
        goShow: function () {
            $contentLeft.show();
            $contentRight.attr("class", "col-md-9 content-right");
            if ($sidebar.hasClass("sidebar-toggle")) {
                $contentRight.css("width", (100 - newwidth) + "%");
                $contentLeft.css("width", newwidth + "%");
            } else {
                $contentRight.css("width", "75%");
                $contentLeft.css("width", "25%");
            }
            $goShow.hide();
        },
        
        
    };//pageLayout end

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
                style : dma_style,
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
                    zoom: 14
                })
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

    var customFucn = {
        userTree: function () {
            var setting = {
                async: {
                    url: "/entm/user/oranizationtree/",
                    type: "post",
                    enable: true,
                    autoParam: ["id"],
                    contentType: "application/json",
                    dataType: "json",
                    dataFilter: customFucn.ajaxDataFilter
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
                    beforeClick: customFucn.beforeClick,
                    onClick: customFucn.onClick

                }
            };
            $.fn.zTree.init($("#ztreeDemo"), setting, null);
            $('.ztreeModelBox').hide();
            $("#zTreeContent").hide();
        },
        beforeClick: function (treeId, treeNode) {
            var check = (treeNode);
            return check;
        },
        onClick: function (e, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj("ztreeDemo"), nodes = zTree
                .getSelectedNodes(), v = "";
            n = "";
            nodes.sort(function compare(a, b) {
                return a.id - b.id;
            });
            for (var i = 0, l = nodes.length; i < l; i++) {
                n += nodes[i].name;
                v += nodes[i].uuid + ",";
            }
            if (v.length > 0)
                v = v.substring(0, v.length - 1);
            var cityObj = $("#zTreeOrganSel");
            cityObj.val(n);
            $("#groupId").val(v);
            organSelected = v;
            customFucn.initDMAList();
            
            $("#zTreeContent").hide();
            // $('.ztreeModelBox').hide();
        },
        showMenu: function (e) {
            if ($("#zTreeContent").is(":hidden")) {
                var inpwidth = $("#zTreeOrganSel").width();
                var spwidth = $("#zTreeOrganSelSpan").width();
                var allWidth = inpwidth + spwidth + 21;
                if(navigator.appName=="Microsoft Internet Explorer") {
                    $("#zTreeContent").css("width",(inpwidth+7) + "px");
                }else{
                    $("#zTreeContent").css("width", allWidth + "px");
                }
                $(window).resize(function() {
                    var inpwidth = $("#zTreeOrganSel").width();
                    var spwidth = $("#zTreeOrganSelSpan").width();
                    var allWidth = inpwidth + spwidth + 21;
                    if(navigator.appName=="Microsoft Internet Explorer") {
                        $("#zTreeContent").css("width",(inpwidth+7) + "px");
                    }else{
                        $("#zTreeContent").css("width", allWidth + "px");
                    }
                })
                $("#zTreeContent").show();
                console.log("zTreeContent show")
            } else {
                $("#zTreeContent").hide();
                console.log("zTreeContent hide")
            }
            $("body").bind("mousedown", customFucn.onBodyDown);
        },
        hideMenu: function () {
            console.log("zTreeContent hide")
            $("#zTreeContent").fadeOut("fast");
            $("body").unbind("mousedown", customFucn.onBodyDown);
        },
        onBodyDown: function (event) {
            if (!(event.target.id == "zTreeOrganSel"||event.target.id == "menuBtn" || event.target.id == "zTreeContent" || $(
                    event.target).parents("#zTreeContent").length > 0)) {
                customFucn.hideMenu();
            }
        },
        //组织树预处理函数
        ajaxDataFilter: function (treeId, parentNode, responseData) {
            
            var isAdminStr = $("#isAdmin").attr("value");    // 是否是admin
            var isAdmin = isAdminStr == 'true';
            var userGroupId = $("#userGroupId").attr("value");  // 用户所属组织 id
            var userGroupName = $("#userGroupName").attr("value");  // 用户所属组织 name
            var fenceBelongto = $("#zTreeOrganSel").val();
            //如果根企业下没有节点,就显示错误提示(根企业下不能创建Sim卡)
            if(responseData != null && responseData != "" && responseData != undefined && responseData.length >= 1){
                if (fenceBelongto != "") { // 不是admin，默认组织为当前组织
                    // $("#groupId").val(userGroupId);
                    $("#zTreeOrganSel").val(fenceBelongto);
                } else { // admin，默认组织为树结构第一个组织
                    // $("#groupId").val(responseData[0].uuid);
                    $("#zTreeOrganSel").attr("value", responseData[0].name);
                    customFucn.initDMAList();
                }
                return responseData;
            }else{
                layer.msg("您需要先新增一个组织");
                return;
            }

        },
        initDMAList:function(){
            var url="/api/dmam/dma/getDmaSelect/";
            
            var parameter={"organ":organSelected};
            json_ajax("GET",url,"json",true,parameter, customFucn.initDMAListBack);
        },

        initDMAListBack: function(data){
            console.log("dmalist",data);
            var dma_no_Val = $("#dma_no_Val").val();
            var html = '<option value="">未选择</option>'
                    console.log("data.dma_no",dma_no_Val)
            $("#dma_no").val(dma_no_Val)
            $('#dma_no')
                .find('option')
                .remove()
                .end()
                .append('<option value="">没有分区</option>')
                .val('whatever');
            
            // //DMAlist
            var dmalist = data.obj;
            // 初始化dma数据
            
            if (dmalist.length > 0) {
                for (var i=0; i< dmalist.length; i++) {
                    html+= '<option value="'+dmalist[i].dma_no+'">'+dmalist[i].dma_name+'</option>'


                }
                $("#dma_no").html(html);
            }

            $("#dma_no option").each(function (){
                if($(this).val()==dma_no_Val){ 
                $(this).attr("selected","selected"); 
            }});

            
        },
        
        
    };

    var fenceOperation = {
        // 初始化
        init: function () {
            // 围栏树
            var fenceAll = {
                async: {
                    url: "/api/ggis/fence/tree/",
                    type: "get",
                    enable: true,
                    autoParam: ["id"],
                    dataType: "json",
                    otherParam: {"type": "multiple"},
                    dataFilter: fenceOperation.FenceAjaxDataFilter
                },
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                    chkboxType: {
                        "Y": "s",
                        "N": "s"
                    },
                    radioType: "all"
                },
                view: {
                    addHoverDom: fenceOperation.addHoverDom,
                    removeHoverDom: fenceOperation.removeHoverDom,
                    dblClickExpand: false,
                    nameIsHTML: true,
                    // fontCss: setFontCss_ztree
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    onClick: fenceOperation.onClickFenceChar,
                    onCheck: fenceOperation.onCheckFenceChar
                }
            };
            $.fn.zTree.init($("#fenceDemo"), fenceAll, null);
            //IE9（模糊查询）
            if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE9.0") {
                var search;
                $("#searchFence").bind("focus", function () {
                    search = setInterval(function () {
                        search_ztree('fenceDemo', 'searchFence', 'fence');
                    }, 500);
                }).bind("blur", function () {
                    clearInterval(search);
                });
            }
            
        },
        //电子围栏预处理的函数
        FenceAjaxDataFilter: function (treeId, parentNode, responseData) {
            if (responseData) {
                for (var i = 0; i < responseData.length; i++) {
                    responseData[i].open = false;
                }
            }
            return responseData;
        },
        addHoverDom: function (treeId, treeNode) {
            // 树节点的类型
            var nodeType = treeNode.type;
            // 权限
            var permissionValue = "true";// $('#permission').val();

            if (nodeType != null && nodeType != undefined && nodeType != "" && nodeType == "fenceParent") {
                var sObj = $("#" + treeNode.tId + "_span");
                var theImport = $("#" + treeNode.tId + "_span");
                if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0)
                    return;
                var id = (100 + newCount);
                var pid = treeNode.id;
                var addStr = "<span class='button add' id='addBtn_"
                    + treeNode.tId
                    + "' title='增加'></span>";
                var tImport;
                if (pid == "zw_m_line") {
                    tImport = "<a class='button import' id='import_" + treeNode.tId + "' href='/clbs/v/monitoring/import?pid=" + pid + "' data-toggle='modal' data-target='#commonSmWin' title='导入'></a>";
                } else if (pid == "zw_m_polygon") {
                    tImport = "<a class='button import' id='import_" + treeNode.tId + "' href='/clbs/v/monitoring/import?pid=" + pid + "' data-toggle='modal' data-target='#commonSmWin' title='导入'></a>";
                }
                // 判断是否有可写权限
                if (permissionValue == "true") {
                    // theImport.after(tImport);
                    sObj.after(addStr);
                }
                var btn = $("#addBtn_" + treeNode.tId);
                if (btn)
                    btn.bind("click", function () {
                        // mouseToolEdit.close(true);
                        // amapOperation.clearLabel();
                        isAddDragRoute = false;
                        // $('#drivenRoute').hide();
                        // $('.lngLat_show').children('span').attr('class', 'fa fa-chevron-up');
                        // $('.pointList').hide();
                        $(".fenceA i").removeClass("active");
                        $(".fenceA span").css('color', '#5c5e62');
                        isAddFlag = true;
                        isAreaSearchFlag = false;
                        if (treeNode.name == "标注") {
                            layer.msg('请在地图上点出标注点', {time: 1000});
                            fenceOperation.clearMapMarker();
                            // mouseTool.marker({offset: new AMap.Pixel(-9, -23)});
                            ol3ops.updateDrawControl('Marker');

                        } else if (treeNode.name == "路线") {
                            layer.msg('请在地图上画出路线', {time: 1000});
                            isDistanceCount = false;
                            fenceOperation.clearLine();
                            ol3ops.updateDrawControl('Line');
                            // mouseTool.polyline();
                        } else if (treeNode.name == "矩形") {
                            layer.msg('请在地图上画出矩形', {time: 1000});
                            fenceOperation.clearRectangle();
                            // mouseTool.rectangle();
                            ol3ops.updateDrawControl('Rectangle');
                            clickRectangleFlag = true;
                        } else if (treeNode.name == "圆形") {
                            layer.msg('请在地图上画出圆形', {time: 1000});
                            fenceOperation.clearCircle();
                            ol3ops.updateDrawControl('Circle');
                            // mouseTool.circle();
                        } else if (treeNode.name == "多边形") {
                            layer.msg('请在地图上画出多边形', {time: 1000});
                            fenceOperation.clearPolygon();
                            // mouseTool.polygon();
                            ol3ops.updateDrawControl('Polygon');
                            clickRectangleFlag = false;
                        } else if (treeNode.name == '导航路线') {
                            $('#drivenRoute').show();
                            fenceOperation.addItem();
                        } else if (treeNode.name == '行政区划') {
                            $("#administrationName").val("");
                            $("#administrationDistrict").val("");
                            $('#province').val('--请选择--');
                            document.getElementById('city').innerHTML = '';
                            document.getElementById('district').innerHTML = '';
                            // pageLayout.closeVideo();
                            console.log("show administration modal ")
                            $('#administrativeArea').modal('show');
                            // customFucn.userTree();
                            fenceOperation.initOrganList();

                        }
                        ;
                        return false;
                    });
            } else if (nodeType != null && nodeType != undefined && nodeType != "" && nodeType == "fence") {
                var sEdit = $("#" + treeNode.tId + "_span");
                var sDetails = $("#" + treeNode.tId + "_span");
                var deleteList = $("#" + treeNode.tId + "_span");
                var sBind = $("#" + treeNode.tId + "_span");
                if (treeNode.editNameFlag || $("#editBtn_" + treeNode.tId).length > 0)
                    return;
                var detailsStr = "<span class='button binds' id='detailsBtn_"
                    + treeNode.tId
                    + "' title='详情'></span>";
                var bindStr = "<span class='button details' id='bindBtn_"
                    + treeNode.tId
                    + "' title='绑定'></span>";
                var editStr = '';
                if (treeNode.pType != "zw_m_administration") {
                    editStr = "<span class='button edit' id='editBtn_"
                        + treeNode.tId
                        + "' title='修改' ></span>";
                } else {
                    editStr = "<span id='editBtn_"
                        + treeNode.tId
                        + "' title='修改' ></span>";
                }
                var deleteStr = "<span class='button remove' id='deleteBtn_"
                    + treeNode.tId
                    + "' title='删除' ></span>";
                // 判断是否有可写权限
                if (permissionValue == "true") {
                    deleteList.after(deleteStr);
                    sDetails.after(detailsStr);
                    sEdit.after(editStr);
                    // sBind.after(bindStr);
                }
                var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
                var editBtn = $("#editBtn_" + treeNode.tId);
                if (editBtn) {
                    editBtn.bind("click", function () {
                        //关闭其它围栏修改功能
                        // fenceOperation.closeFenceEdit();
                        isAddDragRoute = false;

                        


                        isEdit = false;
                        isAddFlag = false;
                        isAreaSearchFlag = false;
                        var value = treeNode.id + "#" + treeNode.pType;
                        zTree.checkNode(treeNode, true, true);
                        treeNode.checkedOld = true;
                        fenceOperation.updateFence(value);
                        return false;
                    });
                }
                ;
                var bindBtn = $("#bindBtn_" + treeNode.tId);
                if (bindBtn) {
                    bindBtn.bind("click", function () {
                        isAddDragRoute = false;
                        $('#drivenRoute').hide();
                        trid = [];
                        fenceOperation.fenceBind(treeNode.pType, treeNode.name, treeNode.fenceInfoId,treeNode.id);
                        return false;
                    });
                }
                ;
                var deleteBtn = $("#deleteBtn_" + treeNode.tId);
                if (deleteBtn) {
                    deleteBtn.bind("click", function () {
                        //fenceOperation.hideFence(treeNode.id);
                        isAddDragRoute = false;
                        // $('#drivenRoute').hide();
                        // infoWindow.close();
                        fenceOperation.deleteFence(treeNode);
                        //fenceOperation.fenceHidden(treeNode.id);

                        return false;
                    });
                }
                ;
                var detailsBtn = $("#detailsBtn_" + treeNode.tId);
                if (detailsBtn) {
                    detailsBtn.bind("click", function () {
                        isAddDragRoute = false;
                        $('#drivenRoute').hide();
                        $("#detailsFenceName").text(treeNode.name);
                        var value = treeNode.id + "#" + treeNode.pType + "#" + true;
                        fenceOperation.updateFence(value);
                        $("#detailsModel").modal('show');
                        return false;
                    })
                }
                ;
            }
        },
        // 删除电子围栏按钮
        removeHoverDom: function (treeId, treeNode) {
            // 树节点的类型
            var nodeType = treeNode.type;
            if (nodeType != null && nodeType != undefined && nodeType != "" && nodeType == "fenceParent") {
                $("#addBtn_" + treeNode.tId).unbind().remove();
                $("#import_" + treeNode.tId).unbind().remove();
            } else if (nodeType != null && nodeType != undefined && nodeType != "" && nodeType == "fence") {
                $("#editBtn_" + treeNode.tId).unbind().remove();
                $("#detailsBtn_" + treeNode.tId).unbind().remove();
                $("#bindBtn_" + treeNode.tId).unbind().remove();
                $("#deleteBtn_" + treeNode.tId).unbind().remove();
            }
        },
        // 电子围栏点击事件
        onClickFenceChar: function (e, treeId, treeNode) {
            
            isAddDragRoute = false;
            isEdit = true;
            var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
            var nodes = zTree.getSelectedNodes(true);
            if (treeNode.isParent == true) {
                zTree.cancelSelectedNode(nodes[0]);
                return false;
            }
            ;
            $("#charMap").attr("class", "fa fa-chevron-down mapBind");
            $("#charMapArea").css("display", "block");
            var nodesId = treeNode.id;
            if (clickStateChar == undefined) {
                clickStateChar = nodesId;
                zTree.checkNode(nodes[0], true, true);
                nodes[0].checkedOld = true;
                // fenceOperation.fenceHidden(nodesId);
                fenceOperation.getFenceDetail(nodes, map);
            } else {
                if (nodesId == clickStateChar) {
                    if (charFlag) {
                        zTree.checkNode(nodes[0], false, true);
                        nodes[0].checkedOld = false;
                        zTree.cancelSelectedNode(nodes[0]);
                        var checkNodes = zTree.getCheckedNodes(true);
                        fenceCheckLength = checkNodes.length;
                        fenceOperation.fenceHidden(nodesId);
                        // fenceOperation.sectionPointState(nodesId, false);
                        charFlag = false;
                    } else {
                        charFlag = true;
                        clickStateChar = nodesId;
                        zTree.checkNode(nodes[0], true, true);
                        nodes[0].checkedOld = true;
                        // fenceOperation.fenceHidden(nodesId);
                        fenceOperation.getFenceDetail(nodes, map);
                        // fenceOperation.sectionPointState(nodesId, true);
                    }
                } else {
                    charFlag = true;
                    clickStateChar = nodesId;
                    zTree.checkNode(nodes[0], true, true);
                    nodes[0].checkedOld = true;
                    // fenceOperation.fenceHidden(nodesId);
                    fenceOperation.getFenceDetail(nodes, map);
                    // fenceOperation.sectionPointState(nodesId, true);
                }
            }
            // 通过所选择的围栏节点筛选绑定列表
            fenceOperation.getcheckFenceNode(zTree);
            // myTable.filter();
            // myTable.requestData();
        },
        //当点击或选择围栏时，访问后台返回围栏详情
        getFenceDetail:function(fenceNode){

            $.ajax({
                type:"GET",
                url:"/api/ggis/fence/selected/",
                // url:"/gis/getgeojson/",
                data: {
                    "fenceNodes": JSON.stringify(fenceNode)
                },
                // context:this
            }).done(function(data){
                console.log(data)
                var format = new ol.format.GeoJSON({defaultDataProjection:'EPSG:4326'});//{dataProjection: 'EPSG:3857'}
                var features = format.readFeatures(data.features[0]) //{dataProjection: 'EPSG:3857',featureProjection:'EPSG:3857'}
                // var features = format.readFeatures(JSON.parse(data.features[0]))
                console.log(features)
                vectorLayer1.getSource().addFeatures(features); //vectorLayer1==map.getLayerGroup().getLayersArray()[2]
                
                var polygon = features[0].getGeometry();
                console.log(polygon)
                // vectorLayer1.changed();
                console.log(map)
                map.getView().fit(polygon, map.getSize()); 
            })
        },
        
        getcheckFenceNode: function (zTree) {
            var checkFences = zTree.getCheckedNodes(true);
            queryFenceId = [];
            if (checkFences != null && checkFences.length > 0) {
                for (var i = 0; i < checkFences.length; i++) {
                    if (checkFences[i].isParent == false) {
                        queryFenceId.push(checkFences[i].id);
                    }
                }
            }
            ;
        },
        // 电子围栏勾选事件
        onCheckFenceChar: function (e, treeId, treeNode) {
            isAddDragRoute = false;
            isEdit = true;
            var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
            var nodes = zTree.getCheckedNodes(true);
            var nodeLength = nodes.length;
            // 通过所选择的围栏节点筛选绑定列表
            fenceOperation.getcheckFenceNode(zTree);
            // myTable.requestData();
            /*myTable.filter();*/
            if (nodeLength > fenceCheckLength) {
                fenceCheckLength = nodeLength;
                var changeNodes = zTree.getChangeCheckedNodes();
                for (var i = 0, len = changeNodes.length; i < len; i++) {
                    changeNodes[i].checkedOld = true;
                }
                ;
                for (var j = 0; j < changeNodes.length; j++) {
                    var nodesId = changeNodes[j].id;
                    fenceOperation.fenceShow(nodesId, changeNodes[j]);
                    // fenceOperation.sectionPointState(nodesId, true);
                }
                ;
            } else {
                fenceCheckLength = nodeLength;
                var changeNodes = zTree.getChangeCheckedNodes();
                for (var i = 0, len = changeNodes.length; i < len; i++) {
                    changeNodes[i].checkedOld = false;
                    zTree.cancelSelectedNode(changeNodes[i]);
                    var nodesId = changeNodes[i].id;
                    fenceOperation.hideFence(nodesId);
                    fenceOperation.fenceHidden(nodesId);
                    // fenceOperation.sectionPointState(nodesId, false);
                }
                ;
            }
            ;
        },
        //图形画完回调事件
        createSuccess: function (data) {
            console.log(data);
            map.removeInteraction(drawControl);
            var f = data.feature;
            var format = new ol.format.GeoJSON();
            var geoJson = format.writeFeature(data.feature);
            console.log(geoJson);
            $("#pgeojson").val(geoJson);
            // $("#pgeojson").val(JSON.stringify(geoJson));
            var dtype = f.getGeometry().getType();

            //标注
            if (dtype == "Marker") {
                $("#addOrUpdateMarkerFlag").val("0");
                var marker = data.obj.getPosition();
                $("#mark-lng").attr("value", marker.lng);
                $("#mark-lat").attr("value", marker.lat);
                pageLayout.closeVideo();
                $("#mark").modal('show');
            }
            ;
            //圆
            if (dtype == "Circle") {
                $("#addOrUpdateCircleFlag").val("0");
                var center = data.obj.getCenter();
                var radius = data.obj.getRadius();
                $("#circle-lng").attr("value", center.lng);
                $("#circle-lat").attr("value", center.lat);
                $("#circle-radius").attr("value", radius);
                $("#editCircleLng").val(center.lng);
                $("#editCircleLat").val(center.lat);
                $("#editCircleRadius").val(radius);
                $("#circleArea").modal('show');
            };
            //多边形
            if (dtype == "Polygon" && !clickRectangleFlag && isAddFlag ) {
                $("#zTreeContent").show();
                $("#addOrUpdatePolygonFlag").val("0");
                // fenceOperation.initDMAList();
                
                $("#myModal").modal('show');
                customFucn.userTree();
                $("#zTreeContent").hide();
            };
            //矩形
            if (dtype == "Polygon" && clickRectangleFlag && isAddFlag) {
                if (!isAreaSearchFlag) {
                    if (array.length < 4) {
                        return false;
                    } else {
                        $("#LUPointLngLat").val(array[0][0] + "," + array[0][1]);
                        $("#RDPointLngLat").val(array[2][0] + "," + array[2][1]);
                        $("#addOrUpdateRectangleFlag").val("0");
                        
                        $("#rectangle-form").modal('show');
                    }
                }
                ;
            };
            
        },
        // 编辑围栏事件
        updateFence: function (fenceId_shape, flag) {
            var width;
            var strs = fenceId_shape.split("#");
            var fenceId = strs[0];
            var shape = strs[1];
            var fenceId_shape_value;
            if (strs.length == 3) {
                fenceId_shape_value = strs[0] + "#" + strs[1];
            } else {
                fenceId_shape_value = fenceId_shape;
            }
            ;
            // ajax访问后端查询
            $.ajax({
                type: "GET",
                async: false,
                url: "/api/ggis/fence/preview/",
                data: {"fenceId": fenceId},
                dataType: "json",
                success: function (data) {
                    console.log(data)
                    // 编辑前清除围栏
                    vectorLayer1.getSource().clear();
                    var format = new ol.format.GeoJSON({defaultDataProjection:'EPSG:4326'});//{dataProjection: 'EPSG:3857'}
                    var features =  format.readFeatures(data.features[0]) //{dataProjection: 'EPSG:3857',featureProjection:'EPSG:3857'}
                    console.log(features)
                    vectorLayer1.getSource().addFeatures(features); //vectorLayer1==map.getLayerGroup().getLayersArray()[2]
                    
                    var polygon = features[0].getGeometry();
                    console.log(polygon.getType())
                    var dtype = polygon.getType();
                    // vectorLayer1.changed();
                    map.getView().fit(polygon, map.getSize()); 

                    var fencetype = data.features[0].properties.fencetype;
                    var fencename = data.features[0].properties.name;
                    var belongto = data.features[0].properties.belongto;
                    var dma_no =data.features[0].properties.dma_no;
                    var description = data.features[0].properties.description;
                    var pgeojson = data.pgeojson;
                    console.log(pgeojson);

                    editing_fenceId = data.features[0].properties.shapeId;
                    $("#polygonId").val(editing_fenceId); // 多边形区域id

                    // details
                    $("#polygonName").val(fencename);
                    $("#detailsFenceBelongtoName").val(belongto);
                    $("#detailsFenceDescribe").val(description);
                    $("#detailsFenceCreateName").val(description);
                    $("#detailsFenceCreateTime").val(description);

                    if(fencetype == "zw_m_polygon")
                    {
                        $("#detailsFenceShape").val("多边形");
                        $("#polygonName").val(fencename);
                        $("#belongto").val(belongto);
                        $("#dma_no").val(dma_no);
                        $("#description").val(description);
                        $("#pgeojson").val(pgeojson);
                        // $("#polygonName").val();
                    }
 

                    var select = new ol.interaction.Select({
                        filter: function(feature, layer) {
                            return /Polygon|LineString/.test(
                                    feature.getGeometry().getType()
                                );
                        },
                        condition: ol.events.condition.click
                    });
                    map.addInteraction(select);

                    var modify = new ol.interaction.Modify({
                        features: select.getFeatures(),
                        // the SHIFT key must be pressed to delete vertices, so
                        // that new vertices can be drawn at the same position
                        // of existing vertices
                        deleteCondition: function(event) {
                          return ol.events.condition.shiftKeyOnly(event) &&
                              ol.events.condition.singleClick(event);
                        }
                      });
                    // fence修改完成事件
                    modify.on('modifyend',function(e){
                        // console.log("feature id is",e.features.getArray()[0].getId());
                        console.log("feature change ",e.features.getArray()[0].getProperties().shapeId);
                        fenceChanged = true;
                        // editing_fenceId = e.features.getArray()[0].getProperties().shapeId;
                    });

                    map.addInteraction(modify);

                    // map.addInteraction(new ol.interaction.Translate({
                    //     features: select.getFeatures()
                    // }));

                    // 修改完成后，点鼠标右键弹出对话框提交修改
                    map.getViewport().addEventListener('contextmenu', function (evt) {
                        evt.preventDefault();
                        console.log(map.getEventCoordinate(evt));
                        fenceOperation.ol3drawendHandle()
                    })

                }
            });
            return width;
        },
        // 删除围栏
        deleteFence: function (treeNode) {
            var url = "/api/ggis/fence/delete/";// + treeNode.id + "/";
            layer.confirm(fenceOperationFenceDeleteConfirm, {
                btn: ['确定', '取消'],
                icon: 3,
                move: false,
                title: "操作确认",
            }, function (index) {
                json_ajax("POST", url, "json", true, {"fenceId":treeNode.id}, function (data) {
                    console.log(data)
                    if (data.success) {
                        fenceOperation.fenceHidden(treeNode.id);
                        fenceIDMap.remove(treeNode.id);
                        fenceOperation.sectionPointState(treeNode.id, false);
                        if (lineSpotMap.containsKey(treeNode.id)) {
                            var thisStopArray = lineSpotMap.get(treeNode.id);
                            map.remove(thisStopArray);
                            lineSpotMap.remove(treeNode.id);
                        };
                        var zTree = $.fn.zTree.getZTreeObj("fenceDemo"); //add pwl
                        zTree.removeNode(treeNode);
                        fenceOperation.addNodes();
                    } else {
                        layer.msg(data.msg);
                    }
                });
                layer.close(index);
            }, function (index) {
                layer.close(index);
            });
        },
        
        //ol3 图形修改完回调事件
        ol3drawendHandle:function(){
            if (!$("#queryClick i").hasClass("active")) {
                var html = '';
                // for (var i = 0; i < array.length; i++) {
                //     html += '<div class="form-group">'
                //         + '<label class="col-md-3 control-label">顶点' + (i + 1) + '经纬度：</label>'
                //         + '<div class=" col-md-8">'
                //         + '<input type="text" placeholder="请输入顶点经纬度" value="' + array[i][0] + "," + array[i][1] + '" class="form-control rectangleAllPointLngLat"/>'
                //         + '</div>'
                //         + '</div>'
                // }
                // ;
                // $("#rectangleAllPointShow").html(html);
                // $("#zTreeContent").show();
                $("#addOrUpdatePolygonFlag").val("1");
                // fenceOperation.initDMAList();
                if(fenceChanged)
                {
                    map.removeInteraction(drawControl);
                    var format = new ol.format.GeoJSON();
                    var features = vectorLayer1.getSource().getFeatures();
                    console.log(features)
                    var geoJson = format.writeFeatures(features);
                    
                    $("#pgeojson").val(geoJson);
                }
                
                $("#polygons").attr({
                    "action":"/api/ggis/fence/update/",//+ editing_fenceId +"/",
                    // "method":"PUT"
                })
                fenceChanged = false;
                $("#myModal").modal('show');
                customFucn.userTree();
                $("#zTreeContent").hide();
            }
        },
        //隐藏区域划分
        hideFence: function (id) {
            
            var features = vectorLayer1.getSource().getFeatures();
            for (var i = 0; i < features.length; i++) {
                  var tf = features[i];
                  tid = tf.getProperties().shapeId;
                  if (id == tid) {
                    vectorLayer1.getSource().removeFeature(tf)
                }
            }
            
        },
        fenceHidden: function (nodesId) {
            return fenceOperation.hideFence(nodesId);
            if (lineSpotMap.containsKey(nodesId)) {
                var thisStopArray = lineSpotMap.get(nodesId);
                for (var i = 0; i < thisStopArray.length; i++) {
                    thisStopArray[i].hide();
                }
                ;
            }
            ;
            if (fenceIDMap.containsKey(nodesId)) {
                var thisFence = fenceIDMap.get(nodesId);
                if (PolyEditorMap != undefined) {
                    var obj = PolyEditorMap.get(nodesId);
                    if (obj != undefined) {
                        if (Array.isArray(obj)) {
                            for (var j = 0; j < obj.length; j++) {
                                obj[j].close();
                            }
                            ;
                        } else {
                            obj.close();
                        }
                        ;
                    }
                    ;
                }
                ;
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
            fenceOperation.hideFence(nodesId);
        },
        // 新增围栏树节点
        addNodes: function () {
            fenceIdArray = [];
            fenceOpenArray = [];
            var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
            var allNodes = zTree.getNodes();
            for (var i = 0, len = allNodes.length; i < len; i++) {
                if (allNodes[i].open == true) {
                    fenceOpenArray.push(allNodes[i].id);
                }
                ;
            }
            ;
            var nodes = zTree.getCheckedNodes(true);
            for (var i = 0, len = nodes.length; i < len; i++) {
                fenceIdArray.push(nodes[i].id);
            }
            ;
            var fenceAll = {
                async: {
                    url: "/api/ggis/fence/tree/",
                    type: "get",
                    enable: true,
                    autoParam: ["id"],
                    dataType: "json",
                    dataFilter: fenceOperation.ajaxFenceDataFilter,
                    otherParam: {"type": "multiple"}
                },
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                    chkboxType: {
                        "Y": "s",
                        "N": "s"
                    },
                    radioType: "all"
                },
                view: {
                    addHoverDom: fenceOperation.addHoverDom,
                    removeHoverDom: fenceOperation.removeHoverDom,
                    dblClickExpand: false,
                    nameIsHTML: true,
                    // fontCss: setFontCss_ztree
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    onClick: fenceOperation.onClickFenceChar,
                    onCheck: fenceOperation.onCheckFenceChar,
                    onAsyncSuccess: fenceOperation.zTreeOnAsyncFenceSuccess
                }
            };
            $.fn.zTree.init($("#fenceDemo"), fenceAll, null);
        },
        //清空多边形
        clearPolygon: function () {
            $("#addOrUpdatePolygonFlag").val("0");
            $("#polygonId").val("");
            $("#polygonName").val("");
            $("#polygonDescription").val("");
            $("#pointSeqsPolygons").val("");
            $("#longitudesPolygons").val("");
            $("#latitudesPolygons").val("");
        },
        //多边形保存
        polygonSave: function (thisBtn) {



            var polygonId = $("#polygonId").val();
            
            if (fenceOperation.validate_polygon()) {
                thisBtn.disabled = true;
                $("#polygons").ajaxSubmit(function (data) {
                    // var datas = eval("(" + data + ")");
                    var datas = data;
                    console.log(data)
                    if (datas.success == true) {
                        $("#myModal").modal("hide");
                        saveFenceName = $('#polygonName').val();
                        saveFenceType = 'zw_m_polygon';
                        $(".fenceA").removeClass("fenceA-active");
                        // mouseTool.close(true);
                        // map.off("rightclick", amendPolygon);
                        var polygonId = $("#polygonId").val();
                        console.log("polygonId:",polygonId)
                        // if (PolyEditorMap.containsKey(polygonId)) {
                        //     var mapEditFence = PolyEditorMap.get(polygonId);
                        //     mapEditFence.close();
                        // };
                        // fenceOperation.addNodes();
                    } else {
                        msg = "";
                        jQuery.each(datas, function(i, val) {
                            console.log(i,val);
                            msg += val[0];
                          });
                          layer.msg(msg, {move: false});
                        
                    }
                });
            }
        },
        //多边形区域添加时验证
        validate_polygon: function () {
            return $("#polygons").validate({
                rules: {
                    name: {
                        required: true,
                        maxlength: 20
                    },
                    type: {
                        maxlength: 20
                    },
                    description: {
                        maxlength: 100
                    },
                    groupName: {
                        required: true
                    }
                },
                messages: {
                    name: {
                        required: areaNameNull,
                        maxlength: publicSize20
                    },
                    type: {
                        maxlength: publicSize20
                    },
                    description: {
                        maxlength: publicSize100
                    },
                    groupName: {
                        required: publicSelectGroupNull
                    }
                }
            }).form();
        },



    };


    $(function(){
        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('treeDemo',id,'group');
            };
        });
        var map;
        //地图
        
        var vnodesId =[];
        var vnodemId=[];
        var vnodelmId = [];
        var vnoderId = [];
        var vnodeaId = [];
        var vnodespId=[];
        var markerRealTime;
        var lineArr = [];
        var pathsTwo = null;
        var myTable;
        var nmoline;
        //初始化页面
        //初始化页面
        pageLayout.init();
        pageLayout.arrayExpand();
        // pageLayout.createMap();
        // pageLayout.responseSocket();
        fenceOperation.init();
        // fenceOperation.fenceBindList();

        
        ol3ops.init();
        // treeMonitoring.init();
        // pageLayout.getNowFormatDate();
        $("[data-toggle='tooltip']").tooltip();
        //右边菜单显示隐藏切换
        $("#toggle-left").on("click", pageLayout.toggleLeft);
        //左侧操作树点击隐藏
        $("#goHidden").on("click", pageLayout.goHidden);

        $("#annotatedSave").on("click", fenceOperation.annotatedSave);
        $("#threadSave").on("click", fenceOperation.threadSave);
        $("#rectangleSave").on("click", fenceOperation.rectangleSave);
        $("#polygonSave").on("click", fenceOperation.polygonSave);
        $("#roundSave").on("click", fenceOperation.roundSave);
        $(".modalClose").on("click", fenceOperation.clearErrorMsg);
        $("#searchVehicle").bind('input oninput', fenceOperation.searchVehicleSearch);

        $("#addBtn").bind("click", fenceOperation.addBtnClick);
        $("#tableCheckAll").bind("click", fenceOperation.tableCheckAll);
        //点击移除围栏
        $("#removeBtn").bind("click", fenceOperation.removeBtnClick);
        //check选择
        $("#checkAll").bind("click", fenceOperation.checkAllClick);
        //依例全设
        $("#setAll").bind("click", fenceOperation.setAllClick);
        // 提交(按围栏)
        $("#fenceSaveBtn").bind("click", fenceOperation.fenceSaveBtnClick);
        // 围栏绑定-取消按钮
        $("#fenceCancelBtn").bind("click", fenceOperation.fenceCancelBtnClick);

        // 批量下发
        $("#send_model").bind("click", fenceOperation.sendModelClick);
        //批量删除
        $("#del_model").bind("click", fenceOperation.delModelClick);
        // 模糊搜索围栏绑定列表
        $("#search_button").bind("click", fenceOperation.searchBindTable);
        $("body").bind("click", fenceOperation.bodyClickEvent);
        $("#hourseSelect tr td").bind("click", fenceOperation.hourseSelectClick);
        $("#minuteSelect tr td").bind("click", fenceOperation.minuteSelectClick);
        $("#secondSelect tr td").bind("click", fenceOperation.secondSelectClick);
        //切换电子围栏
        // $("#TabCarBox").bind("click", fenceOperation.TabCarBox);
        //切换监控对象
        $("#TabFenceBox").bind("click", fenceOperation.TabFenceBox);
        $("#rectangleEditClose").bind("click", fenceOperation.rectangleEditClose);
        //围栏取消
        $("#markFenceClose").bind("click", fenceOperation.markFenceClose);
        $("#saveSection").bind("click", fenceOperation.doSubmitsMonitor);
        $("#lineEditClose").bind("click", fenceOperation.lineEditClose);
        $("#circleFenceClose").bind("click", fenceOperation.circleFenceClose);
        $("#polygonFenceClose").bind("click", fenceOperation.polygonFenceClose);
        $("#bingListClick").bind("click", fenceOperation.bingListClick);
        $("#fenceDemo").bind('contextmenu', function (event) {
            return false
        });

        $('.lngLat_show').on('click', fenceOperation.lngLatTextShow);
        $('#province, #city, #district, #street').on('change', function () {
            fenceOperation.administrativeAreaSelect(this)
        });
        $('#administrativeSave').on('click', fenceOperation.administrativeSave);
        $('#administrativeClose').on('click', fenceOperation.administrativeClose);
        $('#tableCheckAll').on('click', function () {
            $("input[name='subChk']").prop("checked", this.checked);
        });
        // $("#fenceBindTable").modal('show');
        // fenceOperation.TabCarBox();
        $("#zTreeOrganSel").bind("click", customFucn.showMenu);
        
    })
    
})($,window)