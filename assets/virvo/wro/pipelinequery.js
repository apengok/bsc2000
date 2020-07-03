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
        // 创建map集合
        createMap: function() {
            mapVehicleTimeW = new pageLayout.mapVehicle();
            mapVehicleTimeQ = new pageLayout.mapVehicle();
            fenceIDMap = new pageLayout.mapVehicle();
            PolyEditorMap = new pageLayout.mapVehicle();
            fenceSectionPointMap = new pageLayout.mapVehicle();
            markerMap = new pageLayout.mapVehicle();
            mapflog = new pageLayout.mapVehicle();
            mapVehicleNum = new pageLayout.mapVehicle();
            sectionPointMarkerMap = new pageLayout.mapVehicle();
            carNameMarkerMap  = new pageLayout.mapVehicle();
            carNameMarkerContentMap = new pageLayout.mapVehicle();
            carNameContentLUMap = new pageLayout.mapVehicle();
            lineSpotMap = new pageLayout.mapVehicle();
            sectionMarkerPointArray = new pageLayout.mapVehicle();
            travelLineMap = new pageLayout.mapVehicle();
            administrationMap = new pageLayout.mapVehicle();
            dragPointMarkerMap = new pageLayout.mapVehicle();
            //创建地图围栏相关集合
            fenceIdList = new pageLayout.mapVehicle();
          AdministrativeRegionsList = new pageLayout.mapVehicle();
          travelLineList = new pageLayout.mapVehicle();
        },
        // 应答
        responseSocket: function() {
          /*setTimeout(function() {
            webSocket.subscribe(headers, '/user/' + $("#userName").text() + '/check', pageLayout.updateTable, "/app/vehicle/inspect", null);
          }, 1000);*/
          pageLayout.isGetSocketLayout();
        },
        isGetSocketLayout: function() {
          setTimeout(function(){
            if (webSocket.conFlag) {
              webSocket.subscribe(headers, '/user/' + $("#userName").text() + '/check', pageLayout.updateTable, "/app/vehicle/inspect", null);
            } else {
              pageLayout.isGetSocketLayout();
            }
          }, 2000);
        },
        // 应答socket回掉函数
        updateTable: function(msg) {
          if (msg != null) {
            var json = $.parseJSON(msg.body);
                var msgData = json.data;
                if (msgData != undefined) {
                  var msgId = msgData.msgHead.msgID;
                    if (msgId == 0x9300) {
                        var dataType = msgData.msgBody.dataType;
                        $("#msgDataType").val(dataType);
                        $("#infoId").val(msgData.msgBody.data.infoId);
                        $("#objectType").val(msgData.msgBody.data.objectType);
                        $("#objectId").val(msgData.msgBody.data.objectId);
                        $("#question").text(msgData.msgBody.data.infoContent);
                        if (dataType == 0x9301) {
                            $("#answer").val("");
                            $("#msgTitle").text("平台查岗");
                            $("#goTraceResponse").modal('show');
                        }
                        if (dataType == 0x9302) {
                            $("#answer").val("");
                            $("#msgTitle").text("下发平台间报文");
                            $("#goTraceResponse").modal('show');
                        }
                    }
                }
          }
        },
        // 应答确定
        platformMsgAck: function() {
            var answer = $("#answer").val();
            if (answer == "") {
                showErrorMsg("应答不能为空", "answer");
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
        //鼠标按住拖动事件
        mouseMove: function (e) {
            if (els - e.clientY > 0) {
                var y = els - e.clientY;
                var newHeight = mapHeight - y;
                if (newHeight <= 0) {
                    newHeight = 0;
                }
                $MapContainer.css("height", newHeight + "px");
                if (newHeight == 0) {
                    return false;
                }
                $("#realTimeStateTable-div").css("max-height", (tableHeight + y) + "px");
            } else {
                var dy = e.clientY - els;
                var newoffsetTop = $myTab.offset().top;
                var scrollBodyHeight = $("#realTimeState .dataTables_scrollBody").height();
                if (scrollBodyHeight == 0) {
                    return false;
                }
                if (newoffsetTop <= (wHeight - myTabHeight)) {
                    var newHeight = mapHeight + dy;
                    $MapContainer.css("height", newHeight + "px");
                    $("#realTimeStateTable-div").css("max-height", (tableHeight - dy) + "px");
                }
            }
            e.stopPropagation();
        },
        // 鼠标移除事件
        mouseUp: function () {
            $(document).unbind("mousemove", pageLayout.mouseMove).unbind("mouseup", pageLayout.mouseUp);
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
        //拖拽DIV
        dragDiv: function (e) {
          //报警记录及日志信息不能拖拽 隐藏不能拖拽
          if($("#realTimeStatus").hasClass("active") && $("#scalingBtn").hasClass("fa fa-chevron-down")){
                if (stateName.length > 5) {
                    tableHeight = $("#realTimeStateTable-div").height();
                    mapHeight = $MapContainer.height();
                    els = e.clientY;
                    $(document).bind("mousemove", pageLayout.mouseMove).bind("mouseup", pageLayout.mouseUp);
                    e.stopPropagation();
                }
          }
        },
        //实时视频
        videoRealTimeShow: function (callback) {
            //实时视频 判断IE模式
            if(navigator.appName == "Microsoft Internet Explorer"){
                if(parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE",""))<10){
                  layer.msg("亲！您的IE浏览器版本过低，请下载IE10及以上版本查看！");
                }else{
                    var $this = $('#btn-videoRealTime-show').children("i");
                    if(!$this.hasClass("active")) {
                        // $realTimeVideoReal.removeClass("realTimeVideoShow");
                        // $mapPaddCon.removeClass("mapAreaTransform");

                        // wjk 通话时不关闭画面
                        if (!$('#phoneCall').find('i').hasClass('active')) {
                            $realTimeVideoReal.removeClass("realTimeVideoShow");
                            $mapPaddCon.removeClass("mapAreaTransform");
                            m_videoFlag = 0; //标识视频窗口关闭
                        }

                        // realTimeVideo.beventAllMediaStop();
                        clearInterval(computingTimeInt)
                        realTimeVideo.closeVideo(0);
                    } else {

                        // wjk
                        $(this).addClass("map-active");
                        $realTimeVideoReal.addClass("realTimeVideoShow");
                        $mapPaddCon.addClass("mapAreaTransform");
                        m_videoFlag = 1; //标识视频窗口打开
                        realTimeVideo.downloadVideoOcx();
                        realTimeVideo.windowSet();
                        //传入限制单次实时视频回调
                        setTimeout("realTimeVideo.beventLiveView(pageLayout.computingTimeIntFun)", 5);

                        // $(this).addClass("map-active");
                        // $realTimeVideoReal.addClass("realTimeVideoShow");
                        // $mapPaddCon.addClass("mapAreaTransform");
                        // m_videoFlag = 1; //标识视频窗口打开
                        // realTimeVideo.downloadVideoOcx();
                        // realTimeVideo.windowSet();
                        // setTimeout("realTimeVideo.beventLiveView()", 5);

                    }
                 }
            }else{
              $("#btn-videoRealTime-show i").removeClass("active");
              $("#btn-videoRealTime-show span").removeAttr("style");
              layer.msg("亲！实时视频暂时仅支持IE浏览器哟！请使用IE浏览器查看！");
            }
        },
        // wjk 对讲，实时通话
        phoneCallRealTimeshow:function(){
            //实时通话 判断IE模式
            if(navigator.appName == "Microsoft Internet Explorer"){
                if(parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE",""))<10){
                  layer.msg("亲！您的IE浏览器版本过低，请下载IE10及以上版本！");
                }else{
                    var $this = $('#phoneCall').children("i");
                    if(!$this.hasClass("active")) {
                        // wjk 视频时不关闭画面
                        if (!$('#btn-videoRealTime-show').find('i').hasClass('active')) {
                            $realTimeVideoReal.removeClass("realTimeVideoShow");
                            $mapPaddCon.removeClass("mapAreaTransform");
                            m_videoFlag = 0; //标识视频窗口关闭
                        }

                        clearInterval(computingTimeCallInt)
                        realTimeVideo.closeAudio();
                    } else {

                        // wjk
                        $(this).addClass("map-active");
                        $realTimeVideoReal.addClass("realTimeVideoShow");
                        $mapPaddCon.addClass("mapAreaTransform");
                        m_videoFlag = 1; //标识视频窗口打开
                        realTimeVideo.windowSet();
                        //传入限制单次实时视频回调
                        setTimeout("realTimeVideo.beventLiveIpTalk(pageLayout.computingTimeCallIntFun)", 5);
                    }
                 }
            }else{
              $("#phoneCall i").removeClass("active");
              $("#phoneCall span").removeAttr("style");
              layer.msg("亲！实时通话暂时仅支持IE浏览器哟！请使用IE浏览器！");
            }
        },
        // 关闭视频区域
        closeVideo: function() {
          if ($('#btn-videoRealTime-show i').hasClass('active')) {
            $realTimeVideoReal.removeClass("realTimeVideoShow");
                $mapPaddCon.removeClass("mapAreaTransform");
                $('#btn-videoRealTime-show i').removeClass('active');
                $('#btn-videoRealTime-show span').css('color','#5c5e62');
          }
        },
        //点击显示报警
        showAlarmWindow: function () {
            $showAlarmWinMark.show();
            $("#showAlarmWin").hide();
        },
        //点击切换状态栏
        showAlarmWinMarkRight: function () {
            $("#TabFenceBox a").click();
            $("#myTab li").removeAttr("class");
            $("#realTtimeAlarm").attr("class", "active");
            $("#operationLogTable").attr("class", "tab-pane fade");
            $("#realTimeState").attr("class", "tab-pane fade");
            $("#realTimeCall").attr("class", "tab-pane fade active in");
            $(this).css("background-position", "0px -67px");
            setTimeout(function () {
                $showAlarmWinMark.css("background-position", "0px 0px");
            }, 100)
            $("#realTtimeAlarm").click();
            dataTableOperation.realTtimeAlarmClick();
        },
        alarmToolMinimize: function () {
            $("#context-menu").removeAttr("class");
            $("#showAlarmWin").show();
            $showAlarmWinMark.hide();
        },
        //开启关闭声音
        alarmOffSound: function () {
            if (navigator.userAgent.indexOf('MSIE') >= 0) {
                //IE浏览器
                if ($alarmSoundSpan.hasClass("soundOpen")) {
                    $alarmSoundSpan.addClass("soundOpen-off");
                    $alarmSoundSpan.removeClass("soundOpen");
                    $alarmSoundFont.css("color", "#a8a8a8");
                    $alarmMsgBox.html('<embed id="IEalarmMsg" src=""/>');
                } else {
                    $alarmSoundSpan.removeClass("soundOpen-off");
                    $alarmSoundSpan.addClass("soundOpen");
                    $alarmSoundFont.css("color", "#fff");
                    $alarmMsgBox.html('<embed id="IEalarmMsg" src="../../file/music/alarm.wav" autostart="true"/>');
                }
            } else {
                //其他浏览器
                if ($alarmSoundSpan.hasClass("soundOpen")) {
                    $alarmSoundSpan.addClass("soundOpen-off");
                    $alarmSoundSpan.removeClass("soundOpen");
                    $alarmSoundFont.css("color", "#a8a8a8");
                    if (alarmNum > 0) {
                        $("#alarmMsgAutoOff")[0].pause();
                    }
                    $alarmMsgAutoOff.removeAttr("autoplay");
                } else {
                    $alarmSoundSpan.removeClass("soundOpen-off");
                    $alarmSoundSpan.addClass("soundOpen");
                    $alarmSoundFont.css("color", "#fff");
                    if (alarmNum > 0) {
                        $("#alarmMsgAutoOff")[0].play();
                    }
                }
            }
        },
        //开启关闭闪烁
        alarmOffFlashes: function () {
            if ($alarmFlashesSpan.hasClass("flashesOpen")) {
                $alarmFlashesSpan.addClass("flashesOpen-off");
                $alarmFlashesSpan.removeClass("flashesOpen");
                $alarmFlashesFont.css("color", "#a8a8a8");
                $showAlarmWinMark.css("background-position", "0px 0px");
            } else {
                $alarmFlashesSpan.removeClass("flashesOpen-off");
                $alarmFlashesSpan.addClass("flashesOpen");
                $alarmFlashesFont.css("color", "#fff");
                if (alarmNum > 0) {
                    $showAlarmWinMark.css("background-position", "0px -134px");
                    setTimeout(function () {
                        $showAlarmWinMark.css("background-position", "0px 0px");
                    }, 1500)
                } else {
                    $showAlarmWinMark.css("background-position", "0px 0px");
                }
            }
        },
        //显示报警设置详情
        showAlarmInfoSettings: function () {
          pageLayout.closeVideo();
            $("#alarmSettingInfo").modal("show");
            $("#context-menu").removeClass("open");
        },
        //工具图标按钮
        toolClick: function(){
            // var $toolOperateClick = $("#toolOperateClick");
            // if($toolOperateClick.css("margin-right") == "-702px"){
            //     $toolOperateClick.animate({marginRight:"7px"});
            // }else{
            //     $("#disSetMenu,#mapDropSettingMenu").hide();
            //     $toolOperateClick.animate({marginRight:"-702px"});
            //     $("#toolOperateClick i").removeClass('active');
            //     $("#toolOperateClick span").css('color','#5c5e62');
            //     mouseTool.close(true);
            // };

            // wjk
            var $toolOperateClick = $("#toolOperateClick");
            if($toolOperateClick.css("margin-right") == "-776px"){
                $toolOperateClick.animate({marginRight:"7px"});
            }else{
                $("#disSetMenu,#mapDropSettingMenu").hide();
                $toolOperateClick.animate({marginRight:"-776px"});
                $("#toolOperateClick i").removeClass('active');
                $("#toolOperateClick span").css('color','#5c5e62');
                mouseTool.close(true);
            };
        },
        //显示设置
        smoothMoveOrlogoDisplayClickFn: function(){
            var id = $(this).attr("id");
            //平滑移动
            if(id == "smoothMove"){
                if($("#smoothMove").attr("checked")){
                    flagSwitching = false;
                    $("#smoothMove").attr("checked",false);
                    $("#smoothMoveLab").removeClass("preBlue");
                }else{
                    flagSwitching = true;
                    $("#smoothMove").attr("checked",true);
                    $("#smoothMoveLab").addClass("preBlue");
                }
            }
            //标识显示
            else if(id == "logoDisplay"){
                if($("#logoDisplay").attr("checked")){
                    isCarNameShow = false;
                    $("#logoDisplay").attr("checked",false);
                    $("#logoDisplayLab").removeClass("preBlue");
                }else{
                    isCarNameShow = true;
                    $("#logoDisplay").attr("checked",true);
                    $("#logoDisplayLab").addClass("preBlue");
                }
                amapOperation.carNameState(isCarNameShow);
            }
        },
        //地图设置
        mapDropdownSettingClickFn: function(){
            var id = $(this).attr("id");
            //路况开关
            if(id == "realTimeRC"){
              amapOperation.realTimeRC();
            }
            //卫星地图
            else if(id == "defaultMap"){
              amapOperation.satelliteMapSwitching();
            }
            //谷歌地图
            else if(id == "googleMap"){
              amapOperation.showGoogleMapLayers();
            }
        },
        //获取当前服务器系统时间
        getNowFormatDate : function () {
            var url="/clbs/v/monitoring/getTime"
            json_ajax("POST", url, "json", false,null,function(data){
                logTime=data;
            });
        },
        // wjk,视频时间限制回调函数
        computingTimeIntFun:function(){
                clearInterval(computingTimeInt);
                if (m_isVideo !== 0 && m_videoFlag !== 0) {
                    var index = 0;
                    computingTimeInt = setInterval(function(){
                        index ++ ;
                        if (index > 30) {
                            clearInterval(computingTimeInt);
                            if (!$('#phoneCall').find('i').hasClass('active')) {
                                $realTimeVideoReal.removeClass("realTimeVideoShow");
                                $mapPaddCon.removeClass("mapAreaTransform");
                            }
                            $("#btn-videoRealTime-show i").removeClass("active");
                          $("#btn-videoRealTime-show span").removeAttr("style");
                            m_videoFlag = 0; //标识视频窗口关闭
                            realTimeVideo.closeVideo(0);
                            layer.msg('单次视频时长已达到30s上限')
                        }
                    },1000)
                }
        },
        //wjk 通话时间限制回调函数
        computingTimeCallIntFun:function(){
            clearInterval(computingTimeCallInt);
            if (m_videoFlag !== 0) {
                var index = 0;
                computingTimeCallInt = setInterval(function(){
                    index ++ ;
                    if (index > 60) {
                        clearInterval(computingTimeCallInt);
                        if (!$('#btn-videoRealTime-show').find('i').hasClass('active')) {
                            $realTimeVideoReal.removeClass("realTimeVideoShow");
                            $mapPaddCon.removeClass("mapAreaTransform");
                            m_videoFlag = 0; //标识视频窗口关闭
                        }
                        $("#phoneCall i").removeClass("active");
                        $("#phoneCall span").removeAttr("style");
                        realTimeVideo.closeAudio();
                        layer.msg('单次实时通话时长已达到60s上限')
                    }
                },1000)
            }
        }
    };

    var amapOperation = {
        // 地图初始化
        init: function () {
            // 创建地图
            map = new AMap.Map("MapContainer", {
                resizeEnable: true,   //是否监控地图容器尺寸变化
                zoom: 18,       //地图显示的缩放级别
            });
            // 输入提示
            var startPoint = new AMap.Autocomplete({
                input: "startPoint"
            });
            startPoint.on('select', fenceOperation.dragRoute);
            var endPoint = new AMap.Autocomplete({
                input: "endPoint"
            });
            endPoint.on('select', fenceOperation.dragRoute);
            // 行政区划查询
            var opts = {
                subdistrict: 1,   //返回下一级行政区
                level: 'city',
                showbiz: false  //查询行政级别为 市
            };
            district = new AMap.DistrictSearch(opts);//注意：需要使用插件同步下发功能才能这样直接使用
            district.search('中国', function (status, result) {
                if (status == 'complete') {
                    fenceOperation.getData(result.districtList[0]);
                }
            });
            // 地图移动结束后触发，包括平移和缩放
            mouseTool = new AMap.MouseTool(map);
            mouseTool.on("draw", fenceOperation.createSuccess);
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
            // 实时路况
            realTimeTraffic = new AMap.TileLayer.Traffic({zIndex: 1});
            realTimeTraffic.setMap(map);
            realTimeTraffic.hide();
            // 当范围缩小时触发该方法
            var clickEventListener = map.on('zoomend', amapOperation.clickEventListener);
            // 当拖拽结束时触发该方法
            var clickEventListener2 = map.on('dragend', amapOperation.clickEventListener2);
            // 地图点击隐藏车辆树右键菜单
            map.on("click", function () {
                $("#rMenu").css("visibility", "hidden");
                $("#disSetMenu").slideUp();
                $("#mapDropSettingMenu").slideUp();
                $("#fenceTool>.dropdown-menu").hide();
            });
            infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -10), closeWhenClickMap: true});
        },
        getDCallBack: function (data) {
            msgSNAck = data.obj.msgSN;
        },
        // 订阅最后位置信息
        subscribeLatestLocation: function (param) {
            var requestStrS = {
                "desc": {
                    "MsgId": 40964,
                    "UserName": $("#userName").text(),
                    "cmsgSN": msgSNAck
                },
                "data": param
            };
            setTimeout(function () {
                webSocket.subscribe(headers, "/user/" + $("#userName").text() + "/realLocationS", amapOperation.getLastOilDataCallBack, "/app/vehicle/realLocationS", requestStrS);
            });
        },
        // 对象点名传递数据
        getLastOilDataCallBack: function (data) {
            var data = $.parseJSON(data.body);
            if (data.desc.msgID === 513) {
                if (msgSNAck == data.data.msgBody.msgSNAck) {
                    var obj = {};
                    obj.desc = data.desc;
                    var da = {};
                    da.msgHead = data.data.msgHead;
                    da.msgBody = data.data.msgBody.gpsInfo;
                    obj.data = da;
                    // 状态信息
                    dataTableOperation.updateVehicleStatusInfoTable(obj);
                }
            }
        },
        completeEventHandler: function (vehicle) {//1
            if (vehicle[11] == "people") {
                // 判断位置信息的经纬度是否正确
                if (vehicle[9] == 0 && vehicle[10] == 0) {
                    if (objAddressIsTrue.indexOf(vehicle[12]) == -1) {
                        objAddressIsTrue.push(vehicle[12]);
                    }
                    return;
                } else {
                    var index = objAddressIsTrue.indexOf(vehicle[12]);
                    if (index != -1) {
                        objAddressIsTrue.splice(index, 1);
                    }
                }
                ;
                /**************************************/
                var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                var nodes = treeObj.getCheckedNodes(true);
                var uuids = [];
                var type;
                var pid;
                for (var j = 0; j < nodes.length; j++) {
                    var vObj = {};
                    vObj.id = nodes[j].id;
                    vObj.pid = nodes[j].pType;
                    uuids.push(vObj);
                    if (nodes[j].id == vehicle[12]) {
                        type = nodes[j].type;
                        pid = nodes[j].pType;
                    }
                }
                /******************************************/
                var coordinateNew = [];
                var x = vehicle[9];
                var y = vehicle[10];
                coordinateNew.push(y);
                coordinateNew.push(x);
                var content = [];
                content.push("<div>时间：" + vehicle[0] + "</div>");
                content.push("<div>监控对象：" + vehicle[1] + "</div>");
                content.push("<div>所属分组：" + vehicle[2] + "</div>");
                content.push("<div>终端号：" + vehicle[3] + "</div>");
                content.push("<div>SIM卡号：" + vehicle[4] + "</div>");
                content.push("<div>电池电压：" + vehicle[5] + "</div>");
                content.push("<div>信号强度：" + vehicle[6] + "</div>");
                content.push("<div>速度：" + vehicle[7] + "</div>");
                content.push("<div>海拔：" + vehicle[8] + "</div>");
                content.push(
                    '<div class="infoWindowSetting">' +
                    '<a class="col-md-3" id="jumpTo" onClick="window.amapOperation.jumpToTrackPlayer(\'' + vehicle[12] + '\',\'' + type + '\',\'' + pid + '\',\'' + uuids + '\')">' +
                    '<img src="../../resources/img/v-track.svg" style="height:28px;width:28px;"/>轨迹' +
                    '</a>' +
                    '</div>'
                );
                if (mapVehicleTimeQ != undefined) {
                    if (mapVehicleTimeQ.containsKey(vehicle[12]) == true) {
                        mapVehicleTimeQ.remove(vehicle[12]);
                    }
                }
                var mapVehicleTimeT = [];
                var oldPosition = [];
                mapVehicleTimeT.push(coordinateNew);
                mapVehicleTimeT.push(content);
                mapVehicleTimeT.push(vehicle[12]);
                mapVehicleTimeT.push("1");
                mapVehicleTimeQ.put(vehicle[12], mapVehicleTimeT);
                var anglepeople = Number(vehicle[13]) + 270;
                if (flog == true) {//2
                    var markerList = [];
                    flog = false;//关闭第一个点进入入口
                    //
                    markerRealTime = amapOperation.carNameEvade(vehicle[12], vehicle[1], [vehicle[10], vehicle[9]], true, "1", null, false, vehicle[14]);
                    markerRealTime.setAngle(anglepeople);
                    markerRealTime.extData = vehicle[12];
                    markerRealTime.content = content.join("");
                    markerRealTime.stateInfo = vehicle[14];
                    markerRealTime.on('click', amapOperation.markerClick);
                    map.setZoomAndCenter(18, coordinateNew);//将这个点设置为中心点和缩放级别
                    markerList.push(markerRealTime);//点
                    markerList.push(coordinateNew);//坐标
                    markerList.push(content);//详情
                    markerList.push("1");
                    markerList.push(vehicle[14]);
                    if (markerMap.containsKey(vehicle[12])) {
                        markerMap.remove(vehicle[12]);
                    }
                    markerMap.put(vehicle[12], markerList);

                    amapOperation.LimitedSize(6);//第一个点限制范围
                } else {
                    if (paths.contains(coordinateNew) == true && map.getZoom() >= 11) {//3
                        var isExistVehicle = false;//判断是否是第一个点
                        var lineArr = [];
                        if (markerMap.containsKey(vehicle[12]) == false) {//判断最新点集合里面是否包含该车
                            oldPosition = coordinateNew;
                        } else {
                            oldPositionlng = (markerMap.get(vehicle[12]))[1][0];
                            if (oldPositionlng == null) {
                                oldPositionlng = (markerMap.get(vehicle[12]))[1].lng;
                            }
                            oldPositionlat = (markerMap.get(vehicle[12]))[1][1];
                            if (oldPositionlat == null) {
                                oldPositionlat = (markerMap.get(vehicle[12]))[1].lat;
                            }
                            oldPosition.push(oldPositionlng);
                            oldPosition.push(oldPositionlat);
                        }
                        ;
                        if (markerMap.containsKey(vehicle[12]) == true) {
                            isExistVehicle = true;
                            markerInside = (markerMap.get(vehicle[12]))[0];
                            markerInside.stateInfo = vehicle[14];
                            markerInsidePosition = (markerMap.get(vehicle[12]))[1];
                            if (mapflog.containsKey(vehicle[12]) == false) {//判断是否是第一个点 7
                                mapflog.put(vehicle[12], "1");
                                markerInside.content = content.join("");
                                markerInside.setPosition(oldPosition);
                                markerInside.on('click', amapOperation.markerClick);
                                if (flagSwitching == true) {
                                    markerInside.moveTo(coordinateNew, 300);

                                    if (!markerInside.ej.moving) {
                                        markerInside.on('moving', function (msg) {
                                            //监听车牌移动
                                            //
                                            amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), null, "1", null, false, markerInside.stateInfo);
                                            if (fixedPoint != null && fixedPoint == markerInside.extData) {
                                                amapOperation.LimitedSizeTwo();
                                                var msg = markerInside.getPosition();
                                                if (pathsTwo.contains(msg) == false) {
                                                    map.setZoomAndCenter(map.getZoom(), msg);
                                                    if (map.getZoom() == 18) {
                                                        amapOperation.LimitedSize(6);
                                                    } else if (map.getZoom() == 17) {
                                                        amapOperation.LimitedSize(5);
                                                    } else if (map.getZoom() == 16) {
                                                        amapOperation.LimitedSize(4);
                                                    } else if (map.getZoom() == 15) {
                                                        amapOperation.LimitedSize(3);
                                                    } else if (map.getZoom() == 14) {
                                                        amapOperation.LimitedSize(2);
                                                    } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                                                        amapOperation.LimitedSize(1);
                                                    }
                                                    ;
                                                    amapOperation.LimitedSizeTwo();
                                                    amapOperation.vehicleMovement();
                                                }
                                                ;
                                            }
                                            ;
                                        })
                                    }

                                } else {
                                    markerInside.setPosition(coordinateNew);
                                    markerInside.setAngle(anglepeople);
                                    // 
                                    amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), null, "1", null, false, markerInside.stateInfo);
                                    if (fixedPoint != null && fixedPoint == markerInside.extData) {
                                        amapOperation.LimitedSizeTwo();
                                        var msg = markerInside.getPosition();
                                        if (pathsTwo.contains(msg) == false) {
                                            map.setZoomAndCenter(map.getZoom(), msg);
                                            if (map.getZoom() == 18) {
                                                amapOperation.LimitedSize(6);
                                            } else if (map.getZoom() == 17) {
                                                amapOperation.LimitedSize(5);
                                            } else if (map.getZoom() == 16) {
                                                amapOperation.LimitedSize(4);
                                            } else if (map.getZoom() == 15) {
                                                amapOperation.LimitedSize(3);
                                            } else if (map.getZoom() == 14) {
                                                amapOperation.LimitedSize(2);
                                            } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                                                amapOperation.LimitedSize(1);
                                            }
                                            ;
                                            amapOperation.LimitedSizeTwo();
                                            amapOperation.vehicleMovement();
                                        }
                                        ;
                                    }
                                    ;
                                }
                                markerMap.remove(vehicle[12]);
                                var markerList = [];
                                markerList.push(markerInside);
                                markerList.push(coordinateNew);//坐标
                                markerList.push(content);
                                markerList.push("1");
                                markerList.push(vehicle[14]);
                                if (markerMap.containsKey(vehicle[12])) {
                                    markerMap.remove(vehicle[12]);
                                }
                                markerMap.put(vehicle[12], markerList);

                                if (!markerInside.ej.moveend) {
                                    markerInside.on('moveend', function (msg) {
                                        amapOperation.ListeningMovement(markerInside.extData);
                                        //
                                        amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), false, "1", null, false, markerInside.stateInfo);
                                    })
                                }

                            } else {//7
                                var posa = markerInsidePosition[1] === undefined ? markerInsidePosition.lat : markerInsidePosition[1]; //当前的坐标
                                var posn = markerInsidePosition[0] === undefined ? markerInsidePosition.lng : markerInsidePosition[0];
                                var oldn = oldPosition[0];//当前的坐标
                                var olda = oldPosition[1];
                                if (posa.substring(0, 9) == olda.substring(0, 9) && posn.substring(0, 10) == oldn.substring(0, 10)) {//8
                                    markerInside.content = content.join("");
                                    markerInside.setPosition(oldPosition); // 更新点标记位置
                                    markerInside.on('click', amapOperation.markerClick);
                                    if (flagSwitching == true) {
                                        markerInside.moveTo(coordinateNew, 300);

                                        if (!markerInside.ej.moving) {
                                            markerInside.on('moving', function () {
                                                //监听车牌移动
                                                //
                                                amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), null, "1", null, false, markerInside.stateInfo);
                                                if (fixedPoint != null && fixedPoint == markerInside.extData) {
                                                    amapOperation.LimitedSizeTwo();
                                                    var msg = markerInside.getPosition();
                                                    if (pathsTwo.contains(msg) == false) {
                                                        map.setZoomAndCenter(map.getZoom(), msg);
                                                        if (map.getZoom() == 18) {
                                                            amapOperation.LimitedSize(6);
                                                        } else if (map.getZoom() == 17) {
                                                            amapOperation.LimitedSize(5);
                                                        } else if (map.getZoom() == 16) {
                                                            amapOperation.LimitedSize(4);
                                                        } else if (map.getZoom() == 15) {
                                                            amapOperation.LimitedSize(3);
                                                        } else if (map.getZoom() == 14) {
                                                            amapOperation.LimitedSize(2);
                                                        } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                                                            amapOperation.LimitedSize(1);
                                                        }
                                                        ;
                                                        amapOperation.LimitedSizeTwo();
                                                        amapOperation.vehicleMovement();
                                                    }
                                                    ;
                                                }
                                                ;
                                            })
                                        }

                                    } else {
                                        markerInside.setPosition(coordinateNew);
                                        markerInside.setAngle(anglepeople);
                                        //
                                        amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), null, "1", null, false, markerInside.stateInfo);
                                        if (fixedPoint != null && fixedPoint == markerInside.extData) {
                                            amapOperation.LimitedSizeTwo();
                                            var msg = markerInside.getPosition();
                                            if (pathsTwo.contains(msg) == false) {
                                                map.setZoomAndCenter(map.getZoom(), msg);
                                                if (map.getZoom() == 18) {
                                                    amapOperation.LimitedSize(6);
                                                } else if (map.getZoom() == 17) {
                                                    amapOperation.LimitedSize(5);
                                                } else if (map.getZoom() == 16) {
                                                    amapOperation.LimitedSize(4);
                                                } else if (map.getZoom() == 15) {
                                                    amapOperation.LimitedSize(3);
                                                } else if (map.getZoom() == 14) {
                                                    amapOperation.LimitedSize(2);
                                                } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                                                    amapOperation.LimitedSize(1);
                                                }
                                                ;
                                                amapOperation.LimitedSizeTwo();
                                                amapOperation.vehicleMovement();
                                            }
                                            ;
                                        }
                                        ;
                                    }
                                    markerMap.remove(vehicle[12]);
                                    var markerList = [];
                                    markerList.push(markerInside);
                                    markerList.push(coordinateNew);
                                    markerList.push(content);
                                    markerList.push("1");
                                    markerList.push(vehicle[14]);
                                    if (markerMap.containsKey(vehicle[12])) {
                                        markerMap.remove(vehicle[12]);
                                    }
                                    markerMap.put(vehicle[12], markerList);

                                    if (!markerInside.ej.moveend) {
                                        markerInside.on('moveend', function () {
                                            amapOperation.ListeningMovement(markerInside.extData);
                                            //
                                            amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), false, "1", null, false, markerInside.stateInfo);
                                        })
                                    }

                                } else {//8
                                    lineArr.push(oldPosition);
                                    lineArr.push(coordinateNew);
                                    var VehicleNum = [];
                                    VehicleNum.push(oldPosition);//车辆坐标
                                    VehicleNum.push(lineArr);//线的坐标
                                    VehicleNum.push(content);//详情
                                    VehicleNum.push(300);//速度
                                    var VehicleNums = [];
                                    if (mapVehicleNum.containsKey(vehicle[12]) == true) {
                                        var numa = mapVehicleNum.get(vehicle[12]);//取出值
                                        numa.push(VehicleNum);//将新的值放进去
                                        mapVehicleNum.remove(vehicle[12]);//删除map中的键值对
                                        mapVehicleNum.put(vehicle[12], numa);//将新的键值对放进去
                                    } else {
                                        VehicleNums.push(VehicleNum);
                                        mapVehicleNum.put(vehicle[12], VehicleNums);
                                    }
                                    markerMap.remove(vehicle[12]);
                                    var markerList = [];
                                    markerList.push(markerInside);
                                    markerList.push(coordinateNew);
                                    markerList.push(content);
                                    markerList.push("1");
                                    markerList.push(vehicle[14]);
                                    if (markerMap.containsKey(vehicle[12])) {
                                        markerMap.remove(vehicle[12]);
                                    }
                                    markerMap.put(vehicle[12], markerList);
                                }//8
                            }//7
                        }//6
                        // if (isExistVehicle == false) {//4
                        //
                        var markerRealTime = amapOperation.carNameEvade(vehicle[12], vehicle[1], oldPosition, true, "1", null, false, vehicle[14]);

                        markerRealTime.setAngle(anglepeople);
                        markerRealTime.extData = vehicle[12];
                        markerRealTime.content = content.join("");
                        markerRealTime.stateInfo = vehicle[14];
                        markerRealTime.on('click', amapOperation.markerClick);
                        markerList = [];
                        markerList.push(markerRealTime);//点
                        markerList.push(coordinateNew);//坐标
                        markerList.push(content);//详情
                        markerList.push("1");
                        markerList.push(vehicle[14]);
                        if (markerMap.containsKey(vehicle[12])) {
                            markerMap.remove(vehicle[12]);
                        }
                        markerMap.put(vehicle[12], markerList);
                        // }//4
                    } else {//3
                        if (markerMap.containsKey(vehicle[12]) == true) {
                            var markerInside = (markerMap.get(vehicle[12]))[0];
                            markerInside.stateInfo = vehicle[14];
                            markerMap.remove(vehicle[12]);
                            map.remove([markerInside]);
                            mapflog.remove(vehicle[12]);
                            mapVehicleNum.remove(vehicle[12]);
                        }
                        if (mapVehicleTimeW.containsKey(vehicle[12]) == true) {
                            mapVehicleTimeW.remove(vehicle[12]);
                        }
                        var mapVehicleTimeM = [];
                        mapVehicleTimeM.push(coordinateNew);
                        mapVehicleTimeM.push(content);
                        mapVehicleTimeM.push(vehicle[12]);
                        mapVehicleTimeM.push("1");
                        mapVehicleTimeM.push(anglepeople);
                        mapVehicleTimeM.push('123.png');
                        mapVehicleTimeM.push(vehicle[14]);
                        mapVehicleTimeW.put(vehicle[12], mapVehicleTimeM);
                    }//3
                }//2
            } else if (vehicle[11] != "people") {
                //获取车Id
                var vehicleId = vehicle[13];
                /**************************************/
                var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                var nodes = treeObj.getCheckedNodes(true);
                var uuids = [];
                var type;
                var pid;
                for (var j = 0; j < nodes.length; j++) {
                    var vObj = {};
                    vObj.id = nodes[j].id;
                    vObj.pid = nodes[j].pType;
                    uuids.push(vObj);
                    if (nodes[j].id == vehicleId) {
                        type = nodes[j].type;
                        pid = nodes[j].pType;
                    }
                }
                /******************************************/
                //取出报警集合中等同于当前车Id的报警信息  赋值到当前车辆信息集合
                if (alarmInfoList.get(vehicleId) == undefined) {
                    vehicle[20] = "";
                } else {
                    vehicle[20] = alarmInfoList.get(vehicleId);
                }

                // 判断位置信息传过来的经纬度是否正确
                if (vehicle[11] == 0 && vehicle[12] == 0) {
                    if (objAddressIsTrue.indexOf(vehicleId) == -1) {
                        objAddressIsTrue.push(vehicleId);
                    }
                    return;
                } else {
                    var index = objAddressIsTrue.indexOf(vehicleId);
                    if (index != -1) {
                        objAddressIsTrue.splice(index, 1);
                    }
                }
                ;
                var coordinateNew = [];
                var x = vehicle[11];
                var y = vehicle[12];
                var vStatusInfoShows = [];
                for (var i = 0; i < vehicle.length; i++) {
                    if (i != 2 && i != 14 && i != 20) {
                        vStatusInfoShows.push(vehicle[i]);
                    }
                }
                coordinateNew.push(y);
                coordinateNew.push(x);
                var content = [];
                //begin-1
                content.push("<div class='col-md-12' id='basicStatusInformation' style='padding:0px;'>");
                content.push("<div>时间：" + vehicle[10] + "</div>");
                if (vehicle[15] == "") {
                    content.push("<div>监控对象：" + vehicle[0] + "</div>");
                } else {
                    content.push("<div>监控对象：" + vehicle[0] + "(" + vehicle[15] + ")</div>");
                }
                content.push("<div>终端号：" + (vehicle[3] === undefined ? "" : vehicle[3]) + "</div>");
                content.push("<div>SIM卡号：" + vehicle[4] + "</div>");
                if (vehicle[9] == "行驶") {
                    content.push("<div>行驶状态：" + "<font color='#78af3a'>" + vehicle[9] + "</font>" + "</div>");
                } else if (vehicle[9] == "停止") {
                    content.push("<div>行驶状态：" + "<font color='#c80002'>" + vehicle[9] + "</font>" + "</div>");
                }
                var speed7 = dataTableOperation.fiterNumber(vehicle[7]);
                content.push("<div>行驶速度：" + speed7 + "</div>");
                content.push("<div>位置：" + vehicle[17] + "</div>");
                //轨迹跟踪点名
                var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                var deviceType = vehicle[27];
                if (deviceType == "0" || deviceType == "1") {
                    content.push(
                        '<div class="infoWindowSetting">' +
                        '<a class="col-md-2" id="jumpTo" onClick="window.amapOperation.jumpToTrackPlayer(\'' + vehicleId + '\',\'' + type + '\',\'' + pid + '\',\'' + uuids + '\')">' +
                        '<img src="../../resources/img/v-track.svg" style="height:28px;width:28px;"/>轨迹' +
                        '</a>' +
                        '<a class="col-md-2 traceTo" onClick="fenceOperation.goTrace(\'' + vehicle[13] + '\')">' +
                        '<img src="../../resources/img/whereabouts.svg" style="height:28px;width:28px;"/>跟踪' +
                        '</a>' +
                        '<a class="col-md-2 callName" onClick="treeMonitoring.callName_(\'' + vehicle[13] + '\')">' +
                        '<img src="../../resources/img/v-named.svg" style="height:28px;width:28px;"/>点名' +
                        '</a>' +

                        '<a class="col-md-2 callName" onClick="treeMonitoring.jumpToRealTimeVideoPage(\'' + vehicleId + '\')">' +
                        '<img src="../../resources/img/video_info_jump.svg" style="height:28px;width:28px;"/>视频' +
                        '</a>' +

                        '<a class="col-md-2 text-right pull-right" style="padding-top:24px;">' +
                        '<i class="fa fa-chevron-circle-right fa-2x vStatusInfoShowMore" id="vStatusInfoShowMore" onclick="amapOperation.vStatusInfoShow(\'' + vStatusInfoShows + '\',\'' + vehicle[2] + '\',\'' + vehicle[14] + '\',\'' + vehicle[20] + '\')"></i>' +
                        '</a>' +
                        '</div>'
                    );
                } else if (deviceType == "8" || deviceType == "9" || deviceType == "10") {
                    content.push(
                        '<div class="infoWindowSetting">' +
                        '<a class="col-md-3" id="jumpTo" onClick="window.amapOperation.jumpToTrackPlayer(\'' + vehicleId + '\',\'' + type + '\',\'' + pid + '\',\'' + uuids + '\')">' +
                        '<img src="../../resources/img/v-track.svg" style="height:28px;width:28px;"/>轨迹' +
                        '</a>' +
                        '<a class="col-md-3 traceTo" onClick="fenceOperation.goF3Trace(\'' + vehicle[13] + '\')">' +
                        '<img src="../../resources/img/whereabouts.svg" style="height:28px;width:28px;"/>跟踪' +
                        '</a>' +

                        '<a class="col-md-2 callName" onClick="treeMonitoring.jumpToRealTimeVideoPage(\'' + vehicleId + '\')">' +
                        '<img src="../../resources/img/video_info_jump.svg" style="height:28px;width:28px;"/>视频' +
                        '</a>' +

                        '<a class="col-md-3 text-right pull-right" style="padding-top:24px;">' +
                        '<i class="fa fa-chevron-circle-right fa-2x vStatusInfoShowMore" id="vStatusInfoShowMore" onclick="amapOperation.vStatusInfoShow(\'' + vStatusInfoShows + '\',\'' + vehicle[2] + '\',\'' + vehicle[14] + '\',\'' + vehicle[20] + '\')"></i>' +
                        '</a>' +
                        '</div>'
                    );
                } else {
                    content.push(
                        '<div class="infoWindowSetting">' +
                        '<a class="col-md-3" id="jumpTo" onClick="window.amapOperation.jumpToTrackPlayer(\'' + vehicleId + '\',\'' + type + '\',\'' + pid + '\',\'' + uuids + '\')">' +
                        '<img src="../../resources/img/v-track.svg" style="height:28px;width:28px;"/>轨迹' +
                        '</a>' +

                        '<a class="col-md-2 callName" onClick="treeMonitoring.jumpToRealTimeVideoPage(\'' + vehicleId + '\')">' +
                        '<img src="../../resources/img/video_info_jump.svg" style="height:28px;width:28px;"/>视频' +
                        '</a>' +

                        '<a class="col-md-3 text-right pull-right" style="padding-top:24px;">' +
                        '<i class="fa fa-chevron-circle-right fa-2x vStatusInfoShowMore" id="vStatusInfoShowMore" onclick="amapOperation.vStatusInfoShow(\'' + vStatusInfoShows + '\',\'' + vehicle[2] + '\',\'' + vehicle[14] + '\',\'' + vehicle[20] + '\')"></i>' +
                        '</a>' +
                        '</div>'
                    );
                }
                content.push("</div>");
                //begin-2
                content.push("<div class='col-md-8' id='v-statusInfo-show'>");
                content.push("<div class='col-md-6' style=''>");
                content.push("<div>所属企业：" + vehicle[26] + "</div>");
                content.push("<div>所属分组：" + vehicle[2] + "</div>");
                content.push("<div>对象类型：" + vehicle[1] + "</div>");
                if (vehicle[8] == "开" || (vehicle[8].indexOf("无") == -1 && vehicle[8].indexOf("点火") > -1)) {
                    content.push("<div>ACC：" + vehicle[8] + " <img src='../../resources/img/acc_on.svg' style='margin: -3px 0px 0px 0px;height:24px;'/></div>");
                } else {
                    content.push("<div>ACC：" + vehicle[8] + " <img src='../../resources/img/acc_off.svg' style='margin: -3px 0px 0px 0px;height:24px;'/></div>");
                }
                content.push("<div>当日里程：" + Number(vehicle[5]).toFixed(1) + "公里</div>");
                content.push("<div><span id='bombBox2'></span></div>");
                content.push("<div><span id='bombBox3'></span></div>");
                content.push("<div>总里程：" + Number(vehicle[6]).toFixed(1) + "公里</div>");

                content.push("<div><span id='bombBox0'></span></div>");
                content.push("<div><span id='bombBox1'></span></div>");
                content.push("</div>");
                //begin-3
                content.push(
                    '<div class="col-md-6" style="">' +
                    '<div class="arrow"></div>' +
                    '<div><span id="bombBox4"></span></div>' +
                    '<div><span id="bombBox5"></span></div>' +
                    '<div><span id="bombBox6"></span></div>' +
                    '<div><span id="bombBox7"></span></div>' +
                    '<div><span id="bombBox8"></span></div>' +
                    '<div><span id="bombBox9"></span></div>' +
                    '<div><span id="bombBox10"></span></div>' +
                    '<div><span id="bombBox11"></span></div>' +
                    '<div><span id="bombBox12"></span></div>' +
                    '<div><span id="bombBox13"></span></div>' +
                    '<div><span id="bombBox14"></span></div>' +
                    '<div><span id="bombBox15"></span></div>' +
                    '<div><span id="bombBox16"></span></div>' +
                    '</div>' +
                    '</div>'
                );
                content.push("</div>");

                var mapVehicleTimeT = [];
                var oldPosition = [];
                if (mapVehicleTimeQ != undefined) {
                    if (mapVehicleTimeQ.containsKey(vehicle[13]) == true) {
                        mapVehicleTimeQ.remove(vehicle[13]);
                    }
                }
                mapVehicleTimeT = [];
                mapVehicleTimeT.push(coordinateNew);
                mapVehicleTimeT.push(content);
                mapVehicleTimeT.push(vehicle[13]);
                mapVehicleTimeQ.put(vehicle[13], mapVehicleTimeT);
                var angleVehicle = Number(vehicle[24]) + 270;
                if (flog == true) {//2
                    var markerList = [];
                    flog = false;//关闭第一个点进入入口
                    //
                    markerRealTime = amapOperation.carNameEvade(vehicle[13], vehicle[0], [vehicle[12], vehicle[11]], true, "0", vehicle[25], false, vehicle[29]);
                    markerRealTime.setAngle(angleVehicle);
                    markerRealTime.extData = vehicle[13];
                    markerRealTime.stateInfo = vehicle[29];
                    markerRealTime.content = content.join("");
                    markerRealTime.on('click', amapOperation.markerClick);
                    map.setZoomAndCenter(18, coordinateNew);//将这个点设置为中心点和缩放级别
                    markerList.push(markerRealTime);//点
                    markerList.push(coordinateNew);//坐标
                    markerList.push(content);//详情
                    markerList.push(vehicle[6]);//里程
                    var timeOld = (new Date(vehicle[10])).getTime();//获得时间（毫秒）
                    markerList.push(timeOld);//时间
                    markerList.push("0");
                    markerList.push(vehicle[29]);
                    markerMap.put(vehicle[13], markerList);
                    amapOperation.LimitedSize(6);//第一个点限制范围
                } else {
                    if (paths.contains(coordinateNew) == true && map.getZoom() >= 11) {//3
                        var isExistVehicle = false;//判断是否是第一个点
                        var lineArr = [];
                        if (markerMap.containsKey(vehicle[13]) == false) {//判断最新点集合里面是否包含该车
                            oldPosition = coordinateNew;
                        } else {
                            oldPositionlng = (markerMap.get(vehicle[13]))[1][0];
                            if (oldPositionlng == null) {
                                oldPositionlng = (markerMap.get(vehicle[13]))[1].lng;
                            }
                            oldPositionlat = (markerMap.get(vehicle[13]))[1][1];
                            if (oldPositionlat == null) {
                                oldPositionlat = (markerMap.get(vehicle[13]))[1].lat;
                            }
                            oldPosition.push(oldPositionlng);
                            oldPosition.push(oldPositionlat);
                        }
                        ;
                        if (markerMap.containsKey(vehicle[13]) == true) {//6
                            isExistVehicle = true;
                            markerInside = (markerMap.get(vehicle[13]))[0];
                            markerInside.stateInfo = vehicle[29];
                            /********************************************************************/
                            if (markerInside.getIcon() != "../../resources/img/vico/" + vehicle[25] && vehicle[25] != undefined) {
                                markerInside.setIcon("../../resources/img/vico/" + vehicle[25]);
                            }
                            /********************************************************************/
                            if (mapflog.containsKey(vehicle[13]) == false) {//判断是否是第一个点 7
                                mapflog.put(vehicle[13], "1");
                                markerInside.content = content.join("");
                                markerInside.setPosition(oldPosition);
                                markerInside.on('click', amapOperation.markerClick);
                                if (flagSwitching == true) {
                                    var mileageMarker = vehicle[6] - (markerMap.get(vehicle[13]))[3];//当前点里程减去上个点的里程，得到里程差
                                    var timeOldA = (new Date(vehicle[10])).getTime();//获取当前点时间
                                    var timeOldB = timeOldA - (markerMap.get(vehicle[13]))[4];
                                    var timeMarker = timeOldB / 1000 / 60 / 60; //获取时间差，并将毫秒换算成小时
                                    var SpeedMarker = parseInt(mileageMarker / timeMarker);//获得平均速度并取整
                                    if (vehicle[18] == 1) {
                                        markerInside.moveTo(coordinateNew, 10000);
                                    } else if (SpeedMarker > 0) {
                                        if (mileageMarker > 6 || timeOldB > 300000) {
                                            markerInside.moveTo(coordinateNew, 10000);
                                        } else {
                                            markerInside.moveTo(coordinateNew, SpeedMarker);
                                        }
                                    } else {
                                        if (vehicle[7] != 0) {
                                            markerInside.moveTo(coordinateNew, vehicle[7]);
                                        } else {
                                            markerInside.moveTo(coordinateNew, 100);
                                        }
                                    }

                                    if (!markerInside.ej.moving) {
                                        markerInside.on('moving', function (msg) {
                                            //监听车牌移动
                                            //
                                            amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), null, "0", null, false, markerInside.stateInfo);
                                            if (fixedPoint != null && fixedPoint == markerInside.extData) {
                                                amapOperation.LimitedSizeTwo();
                                                var msg = markerInside.getPosition();
                                                if (pathsTwo.contains(msg) == false) {
                                                    map.setZoomAndCenter(map.getZoom(), msg);
                                                    if (map.getZoom() == 18) {
                                                        amapOperation.LimitedSize(6);
                                                    } else if (map.getZoom() == 17) {
                                                        amapOperation.LimitedSize(5);
                                                    } else if (map.getZoom() == 16) {
                                                        amapOperation.LimitedSize(4);
                                                    } else if (map.getZoom() == 15) {
                                                        amapOperation.LimitedSize(3);
                                                    } else if (map.getZoom() == 14) {
                                                        amapOperation.LimitedSize(2);
                                                    } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                                                        amapOperation.LimitedSize(1);
                                                    }
                                                    ;
                                                    amapOperation.LimitedSizeTwo();
                                                    amapOperation.vehicleMovement();
                                                }
                                                ;
                                            }
                                            ;
                                        })
                                    }

                                } else {
                                    markerInside.setPosition(coordinateNew);
                                    markerInside.setAngle(angleVehicle);
                                    //
                                    amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), null, "0", null, false, markerInside.stateInfo);
                                    if (fixedPoint != null && fixedPoint == markerInside.extData) {
                                        amapOperation.LimitedSizeTwo();
                                        var msg = markerInside.getPosition();
                                        if (pathsTwo.contains(msg) == false) {
                                            map.setZoomAndCenter(map.getZoom(), msg);
                                            if (map.getZoom() == 18) {
                                                amapOperation.LimitedSize(6);
                                            } else if (map.getZoom() == 17) {
                                                amapOperation.LimitedSize(5);
                                            } else if (map.getZoom() == 16) {
                                                amapOperation.LimitedSize(4);
                                            } else if (map.getZoom() == 15) {
                                                amapOperation.LimitedSize(3);
                                            } else if (map.getZoom() == 14) {
                                                amapOperation.LimitedSize(2);
                                            } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                                                amapOperation.LimitedSize(1);
                                            }
                                            ;
                                            amapOperation.LimitedSizeTwo();
                                            amapOperation.vehicleMovement();
                                        }
                                        ;
                                    }
                                    ;
                                }
                                markerMap.remove(vehicle[13]);
                                var markerList = [];
                                markerList.push(markerInside);
                                markerList.push(coordinateNew);//坐标
                                markerList.push(content);
                                markerList.push(vehicle[6]);//里程
                                markerList.push(timeOldA);
                                markerList.push("0");
                                markerList.push(vehicle[29]);
                                if (markerMap.containsKey(vehicle[13])) {
                                    markerMap.remove(vehicle[13]);
                                }
                                markerMap.put(vehicle[13], markerList);

                                if (!markerInside.ej.moveend) {
                                    markerInside.on('moveend', function (msg) {
                                        amapOperation.ListeningMovement(markerInside.extData);
                                        //
                                        amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), false, "0", null, false, markerInside.stateInfo);
                                    })
                                }

                            } else {//7
                                var posa = markerInside.getPosition().lat; //当前的坐标
                                var posn = markerInside.getPosition().lng;
                                var oldn = oldPosition[0];//当前的坐标
                                var olda = oldPosition[1];
                                if (posa == olda && posn == oldn) {//8
                                    markerInside.content = content.join("");
                                    markerInside.setPosition(oldPosition); // 更新点标记位置
                                    markerInside.on('click', amapOperation.markerClick);
                                    if (flagSwitching == true) {
                                        var mileageMarker = vehicle[6] - (markerMap.get(vehicle[13]))[3];//当前点里程减去上个点的里程，得到里程差
                                        var timeOldA = (new Date(vehicle[10])).getTime();//获取当前点时间
                                        var timeOldB = timeOldA - (markerMap.get(vehicle[13]))[4];
                                        var timeMarker = timeOldB / 1000 / 60 / 60; //获取时间差，并将毫秒换算成小时
                                        var SpeedMarker = parseInt(mileageMarker / timeMarker);//获得平均速度并取整
                                        if (vehicle[18] == 1) {
                                            markerInside.moveTo(coordinateNew, 10000);
                                            mapVehicleNum.remove(vehicle[13]);
                                        } else if (SpeedMarker > 0) {
                                            if (mileageMarker > 6 || timeOldB > 300000) {
                                                markerInside.moveTo(coordinateNew, 10000);
                                            } else {

                                                markerInside.moveTo(coordinateNew, SpeedMarker);
                                            }
                                        } else {
                                            if (vehicle[7] != 0) {
                                                markerInside.moveTo(coordinateNew, vehicle[7]);
                                            } else {
                                                markerInside.moveTo(coordinateNew, 100);
                                            }
                                        }

                                        if (!markerInside.ej.moving) {
                                            markerInside.on('moving', function () {
                                                //监听车牌移动
                                                //
                                                amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), null, "0", null, false, markerInside.stateInfo);
                                                if (fixedPoint != null && fixedPoint == markerInside.extData) {
                                                    amapOperation.LimitedSizeTwo();
                                                    var msg = markerInside.getPosition();
                                                    if (pathsTwo.contains(msg) == false) {
                                                        map.setZoomAndCenter(map.getZoom(), msg);
                                                        if (map.getZoom() == 18) {
                                                            amapOperation.LimitedSize(6);
                                                        } else if (map.getZoom() == 17) {
                                                            amapOperation.LimitedSize(5);
                                                        } else if (map.getZoom() == 16) {
                                                            amapOperation.LimitedSize(4);
                                                        } else if (map.getZoom() == 15) {
                                                            amapOperation.LimitedSize(3);
                                                        } else if (map.getZoom() == 14) {
                                                            amapOperation.LimitedSize(2);
                                                        } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                                                            amapOperation.LimitedSize(1);
                                                        }
                                                        ;
                                                        amapOperation.LimitedSizeTwo();
                                                        amapOperation.vehicleMovement();
                                                    }
                                                    ;
                                                }
                                                ;
                                            })
                                        }

                                    } else {
                                        markerInside.setPosition(coordinateNew);
                                        markerInside.setAngle(angleVehicle);
                                        // 
                                        amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), null, "0", null, false, markerInside.stateInfo);
                                        if (fixedPoint != null && fixedPoint == markerInside.extData) {
                                            amapOperation.LimitedSizeTwo();
                                            var msg = markerInside.getPosition();
                                            if (pathsTwo.contains(msg) == false) {
                                                map.setZoomAndCenter(map.getZoom(), msg);
                                                if (map.getZoom() == 18) {
                                                    amapOperation.LimitedSize(6);
                                                } else if (map.getZoom() == 17) {
                                                    amapOperation.LimitedSize(5);
                                                } else if (map.getZoom() == 16) {
                                                    amapOperation.LimitedSize(4);
                                                } else if (map.getZoom() == 15) {
                                                    amapOperation.LimitedSize(3);
                                                } else if (map.getZoom() == 14) {
                                                    amapOperation.LimitedSize(2);
                                                } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                                                    amapOperation.LimitedSize(1);
                                                }
                                                ;
                                                amapOperation.LimitedSizeTwo();
                                                amapOperation.vehicleMovement();
                                            }
                                            ;
                                        }
                                        ;
                                    }
                                    markerMap.remove(vehicle[13]);
                                    var markerList = [];
                                    markerList.push(markerInside);
                                    markerList.push(coordinateNew);
                                    markerList.push(content);
                                    markerList.push(vehicle[6]);//里程
                                    markerList.push(timeOldA);
                                    markerList.push("0");
                                    markerList.push(vehicle[29]);
                                    if (markerMap.containsKey(vehicle[13])) {
                                        markerMap.remove(vehicle[13]);
                                    }
                                    markerMap.put(vehicle[13], markerList);

                                    if (!markerInside.ej.moveend) {
                                        markerInside.on('moveend', function () {
                                            amapOperation.ListeningMovement(markerInside.extData);
                                            //
                                            amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), false, "0", null, false, markerInside.stateInfo);
                                        })
                                    }

                                } else if (vehicle[18] == 1) {
                                    // posa//经度
                                    // posn//纬度
                                    oldPosition = [posn, posa];
                                    markerInside.content = content.join("");
                                    markerInside.setPosition(oldPosition); // 更新点标记位置
                                    markerInside.on('click', amapOperation.markerClick);
                                    if (flagSwitching == true) {
                                        markerInside.moveTo(coordinateNew, 10000);
                                        mapVehicleNum.remove(vehicle[13]);

                                        if (!markerInside.ej.moving) {
                                            markerInside.on('moving', function () {
                                                if (fixedPoint != null && fixedPoint == markerInside.extData) {
                                                    //监听车牌移动
                                                    //
                                                    amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), null, "0", null, false, markerInside.stateInfo);
                                                    amapOperation.LimitedSizeTwo();
                                                    var msg = markerInside.getPosition();
                                                    if (pathsTwo.contains(msg) == false) {
                                                        map.setZoomAndCenter(map.getZoom(), msg);
                                                        if (map.getZoom() == 18) {
                                                            amapOperation.LimitedSize(6);
                                                        } else if (map.getZoom() == 17) {
                                                            amapOperation.LimitedSize(5);
                                                        } else if (map.getZoom() == 16) {
                                                            amapOperation.LimitedSize(4);
                                                        } else if (map.getZoom() == 15) {
                                                            amapOperation.LimitedSize(3);
                                                        } else if (map.getZoom() == 14) {
                                                            amapOperation.LimitedSize(2);
                                                        } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                                                            amapOperation.LimitedSize(1);
                                                        }
                                                        ;
                                                        amapOperation.LimitedSizeTwo();
                                                        amapOperation.vehicleMovement();
                                                    }
                                                    ;
                                                }
                                                ;
                                            })
                                        }

                                    } else {
                                        markerInside.setPosition(coordinateNew);
                                        markerInside.setAngle(angleVehicle);
                                        mapVehicleNum.remove(vehicle[13]);
                                        if (fixedPoint != null && fixedPoint == markerInside.extData) {
                                            //监听车牌移动
                                            //
                                            amapOperation.carNameEvade(markerInside.extData, markerInside.name, markerInside.getPosition(), null, "0", null, false, markerInside.stateInfo);
                                            amapOperation.LimitedSizeTwo();
                                            var msg = markerInside.getPosition();
                                            if (pathsTwo.contains(msg) == false) {
                                                map.setZoomAndCenter(map.getZoom(), msg);
                                                if (map.getZoom() == 18) {
                                                    amapOperation.LimitedSize(6);
                                                } else if (map.getZoom() == 17) {
                                                    amapOperation.LimitedSize(5);
                                                } else if (map.getZoom() == 16) {
                                                    amapOperation.LimitedSize(4);
                                                } else if (map.getZoom() == 15) {
                                                    amapOperation.LimitedSize(3);
                                                } else if (map.getZoom() == 14) {
                                                    amapOperation.LimitedSize(2);
                                                } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                                                    amapOperation.LimitedSize(1);
                                                }
                                                ;
                                                amapOperation.LimitedSizeTwo();
                                                amapOperation.vehicleMovement();
                                            }
                                            ;
                                        }
                                        ;
                                    }
                                    var timeOldA = (new Date(vehicle[10])).getTime();//获取当前点时间
                                    markerMap.remove(vehicle[13]);
                                    var markerList = [];
                                    markerList.push(markerInside);
                                    markerList.push(coordinateNew);
                                    markerList.push(content);
                                    markerList.push(vehicle[6]);//里程
                                    markerList.push(timeOldA);
                                    markerList.push("0");
                                    markerList.push(vehicle[29]);
                                    if (markerMap.containsKey(vehicle[13])) {
                                        markerMap.remove(vehicle[13]);
                                    }
                                    markerMap.put(vehicle[13], markerList);
                                } else {//8
                                    lineArr.push(oldPosition);
                                    lineArr.push(coordinateNew);
                                    var VehicleNum = [];
                                    VehicleNum.push(oldPosition);//车辆坐标
                                    VehicleNum.push(lineArr);//线的坐标
                                    VehicleNum.push(content);//详情
                                    var mileageMarker = vehicle[6] - (markerMap.get(vehicle[13]))[3];//当前点里程减去上个点的里程，得到里程差
                                    var timeOldA = (new Date(vehicle[10])).getTime();//获取当前点时间
                                    var timeOldB = timeOldA - (markerMap.get(vehicle[13]))[4];
                                    var timeMarker = timeOldB / 1000 / 60 / 60; //获取时间差，并将毫秒换算成小时
                                    var SpeedMarker = parseInt(mileageMarker / timeMarker);//获得平均速度并取整
                                    if (SpeedMarker > 0) {
                                        if (mileageMarker > 6 || timeOldB > 300000) {
                                            VehicleNum.push(10000);//速度
                                        } else {
                                            VehicleNum.push(SpeedMarker);//速度
                                        }
                                    } else {
                                        if (vehicle[7] != 0) {
                                            VehicleNum.push(vehicle[7]);//速度
                                        } else {
                                            VehicleNum.push(100);//速度
                                        }
                                    }
                                    var VehicleNums = [];
                                    if (mapVehicleNum.containsKey(vehicle[13]) == true) {
                                        var numa = mapVehicleNum.get(vehicle[13]);//取出值
                                        numa.push(VehicleNum);//将新的值放进去
                                        mapVehicleNum.remove(vehicle[13]);//删除map中的键值对
                                        mapVehicleNum.put(vehicle[13], numa);//将新的键值对放进去
                                    } else {
                                        VehicleNums.push(VehicleNum);
                                        mapVehicleNum.put(vehicle[13], VehicleNums);
                                    }
                                    markerMap.remove(vehicle[13]);
                                    var markerList = [];
                                    markerList.push(markerInside);
                                    markerList.push(coordinateNew);
                                    markerList.push(content);
                                    markerList.push(vehicle[6]);//里程
                                    markerList.push(timeOldA);
                                    markerList.push("0");
                                    markerList.push(vehicle[29]);
                                    if (markerMap.containsKey(vehicle[13])) {
                                        markerMap.remove(vehicle[13]);
                                    }
                                    markerMap.put(vehicle[13], markerList);
                                }//8
                            }//7
                        }//6
                        else {
                            
                        }
                        // 这里注释掉是为了解决监控对象状态变了后，地图上的车辆状态无变化
                        //  if (isExistVehicle == false) {//4
                        //
                        var markerRealTime;
                        if (isExistVehicle == false) {
                          markerRealTime = amapOperation.carNameEvade(vehicle[13], vehicle[0], oldPosition, true, "0", vehicle[25], false, vehicle[29]);
                        } else {
                            markerRealTime = amapOperation.carNameEvade(vehicle[13], vehicle[0], oldPosition, null, "0", vehicle[25], true, vehicle[29]);
                        }
                        if(markerRealTime != undefined){
                            markerRealTime.setAngle(angleVehicle);
                            markerRealTime.extData = vehicle[13];
                            markerRealTime.content = content.join("");
                            markerRealTime.stateInfo = vehicle[29];
                            markerRealTime.on('click', amapOperation.markerClick);
                            markerList = [];
                            markerList.push(markerRealTime);//点
                            markerList.push(coordinateNew);//坐标
                            markerList.push(content);//详情
                            markerList.push(vehicle[6]);//里程
                            var timeOld = (new Date(vehicle[10])).getTime();//获得时间（毫秒）
                            markerList.push(timeOld);//时间
                            markerList.push("0");
                            markerList.push(vehicle[29]);
                            if (markerMap.containsKey(vehicle[13])) {
                              markerMap.remove(vehicle[13]);
                            }
                            markerMap.put(vehicle[13], markerList);
                        }
                        
                        // }//4
                    } else {//3
                        if (markerMap.containsKey(vehicle[13]) == true) {
                            var markerInside = (markerMap.get(vehicle[13]))[0];
                            markerInside.stateInfo = vehicle[29];
                            markerMap.remove(vehicle[13]);
                            map.remove([markerInside]);
                            mapflog.remove(vehicle[13]);
                            mapVehicleNum.remove(vehicle[13]);
                        }
                        if (mapVehicleTimeW.containsKey(vehicle[13]) == true) {
                            mapVehicleTimeW.remove(vehicle[13]);
                        }
                        var mapVehicleTimeM = [];
                        mapVehicleTimeM.push(coordinateNew);
                        mapVehicleTimeM.push(content);
                        mapVehicleTimeM.push(vehicle[13]);
                        mapVehicleTimeM.push("0");
                        mapVehicleTimeM.push(angleVehicle);
                        mapVehicleTimeM.push(vehicle[25]);
                        mapVehicleTimeM.push(vehicle[29]);
                        mapVehicleTimeW.put(vehicle[13], mapVehicleTimeM);
                    }//3
                }//2
            }
        },//1
        ListeningMovement: function (plate) {
            var markerInside = markerMap.get(plate);
            var leng = mapVehicleNum.get(plate);
            if (mapVehicleNum.containsKey(plate) == true && leng.length != 0) {
                lineArr = [];
                var realtA = leng[0];
                var realtB = realtA[0];//车的坐标
                var realtC = realtA[1];//线的坐标
                var realtD = realtA[2];//详情
                var realtE = realtA[3];//速度
                markerInside[0].content = realtD.join("");
                markerInside[0].setPosition(realtB); // 更新点标记位置
                markerInside[0].on('click', amapOperation.markerClick);
                /**
                 *  监听拖拽地图（若车辆离开当前区域）
                 */
                if (flagSwitching == true) {
                    markerInside[0].moveTo(realtC[1], realtE);

                    if (!markerInside[0].ej.moving) {
                        markerInside[0].on('moving', function () {
                            if (fixedPoint != null && fixedPoint == markerInside[0].extData) {
                                //监听车牌移动
                                //
                                amapOperation.carNameEvade(markerInside[0].extData, markerInside[0].name, markerInside[0].getPosition(), null, "0", null, false, markerInside[0].stateInfo);
                                amapOperation.LimitedSizeTwo();
                                var msg = markerInside[0].getPosition();
                                if (pathsTwo.contains(msg) == false) {
                                    map.setZoomAndCenter(map.getZoom(), msg);
                                    if (map.getZoom() == 18) {
                                        amapOperation.LimitedSize(6);
                                    } else if (map.getZoom() == 17) {
                                        amapOperation.LimitedSize(5);
                                    } else if (map.getZoom() == 16) {
                                        amapOperation.LimitedSize(4);
                                    } else if (map.getZoom() == 15) {
                                        amapOperation.LimitedSize(3);
                                    } else if (map.getZoom() == 14) {
                                        amapOperation.LimitedSize(2);
                                    } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                                        amapOperation.LimitedSize(1);
                                    }
                                    ;
                                    amapOperation.LimitedSizeTwo();
                                    amapOperation.vehicleMovement();
                                }
                                ;
                            }
                            ;
                        })
                    }

                } else {
                    markerInside[0].setPosition(realtC[1]);
                    if (fixedPoint != null && fixedPoint == markerInside[0].extData) {
                        //监听车牌移动
                        //
                        amapOperation.carNameEvade(markerInside[0].extData, markerInside[0].name, markerInside[0].getPosition(), null, "0", null, false, markerInside[0].stateInfo);
                        amapOperation.LimitedSizeTwo();
                        var msg = markerInside[0].getPosition();
                        if (pathsTwo.contains(msg) == false) {
                            map.setZoomAndCenter(map.getZoom(), msg);
                            if (map.getZoom() == 18) {
                                amapOperation.LimitedSize(6);
                            } else if (map.getZoom() == 17) {
                                amapOperation.LimitedSize(5);
                            } else if (map.getZoom() == 16) {
                                amapOperation.LimitedSize(4);
                            } else if (map.getZoom() == 15) {
                                amapOperation.LimitedSize(3);
                            } else if (map.getZoom() == 14) {
                                amapOperation.LimitedSize(2);
                            } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                                amapOperation.LimitedSize(1);
                            }
                            ;
                            amapOperation.LimitedSizeTwo();
                            amapOperation.vehicleMovement();
                        }
                        ;
                    }
                    ;
                }

                if (!markerInside[0].ej.moveend) {
                    markerInside[0].on('moveend', function () {
                        amapOperation.ListeningMovement(markerInside[0].extData);
                        amapOperation.carNameEvade(markerInside[0].extData, markerInside[0].name, markerInside[0].getPosition(), false, "0", null, false, markerInside[0].stateInfo);
                    })
                }

                leng.splice(0, 1);
                mapVehicleNum.remove(plate);
                mapVehicleNum.put(plate, leng);
                //break;
            }
            ;
        },
        LimitedSizeTwo: function () {
            var southwest = map.getBounds().getSouthWest();
            var northeast = map.getBounds().getNorthEast();
            var mcenter = map.getCenter();                  //获取中心坐标
            var pixel2 = map.lnglatTocontainer(mcenter);//根据坐标获得中心点像素
            var mcx = pixel2.getX();                    //获取中心坐标经度像素
            var mcy = pixel2.getY();                    //获取中心坐标纬度像素
            var southwestx = mcx + (mcx * 0.8);
            var southwesty = mcy * 0.2;
            var northeastx = mcx * 0.2;
            var northeasty = mcy + (mcy * 0.8);
            var ll = map.containTolnglat(new AMap.Pixel(southwestx, southwesty));
            var lll = map.containTolnglat(new AMap.Pixel(northeastx, northeasty));
            pathsTwo = new AMap.Bounds(
                lll,//东北角坐标
                ll //西南角坐标
            );
        },
        LimitedSize: function (size) {
            paths = null;
            var southwest = map.getBounds().getSouthWest();//获取西南角坐标
            var northeast = map.getBounds().getNorthEast();//获取东北角坐标
            var possa = southwest.lat;//纬度（小）
            var possn = southwest.lng;
            var posna = northeast.lat;
            var posnn = northeast.lng;
            var psa = possa - ((posna - possa) * size);
            var psn = possn - ((posnn - possn) * size);
            var pna = posna + ((posna - possa) * size);
            var pnn = posnn + ((posnn - possn) * size);
            paths = new AMap.Bounds(
                [psn, psa], //西南角坐标
                [pnn, pna]//东北角坐标
            );
        },
        //当范围缩小时触发该方法
        clickEventListener: function () {
            setTimeout(function () {
                if (map.getZoom() == 18) {
                    amapOperation.LimitedSize(6);
                } else if (map.getZoom() == 17) {
                    amapOperation.LimitedSize(5);
                } else if (map.getZoom() == 16) {
                    amapOperation.LimitedSize(4);
                } else if (map.getZoom() == 15) {
                    amapOperation.LimitedSize(3);
                } else if (map.getZoom() == 14) {
                    amapOperation.LimitedSize(2);
                } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                    amapOperation.LimitedSize(1);
                }
                ;
                markerListT = [];
                if (cluster) {
                    cluster.setMap(null);
                }
                ;
                if (map.getZoom() >= 11) {
                    if (zoom < 11) {
                        var markerList = markerMap.values();
                        for (var i = 0; i < markerList.length; i++) {
                            markerList[i][0].stopMove();
                            map.remove(markerList[i][0]);
                        }
                        ;
                        cluster.setMap(null);
                        amapOperation.vehicleMovement();
                    } else {
                        amapOperation.setCarNameCircle();
                        amapOperation.vehicleMovement();
                    }
                    ;
                } else {
                    var markerList = markerMap.values();
                    var j = markerList.length - 1;
                    for (var i = j; i >= 0; i--) {
                        markerList[i][0].stopMove();
                        map.remove([markerList[i][0]]);
                        var markerInside = markerList[i];
                        var mapVehiclesNew = [];
                        if (mapVehicleTimeW.containsKey(markerInside[0].extData) == true) {
                            mapVehicleTimeW.remove(markerInside[0].extData);
                        }
                        mapVehiclesNew.push(markerInside[0].getPosition());
                        mapVehiclesNew.push(markerInside[2]);
                        mapVehiclesNew.push(markerInside[0].extData);
                        if (markerInside[3] == "1") {
                            mapVehiclesNew.push("1");
                        } else {
                            mapVehiclesNew.push("0");
                        }
                        mapVehiclesNew.push(markerInside[0].getAngle());
                        var icons = markerInside[0].getIcon().split("/");
                        var icon = icons[icons.length - 1];
                        mapVehiclesNew.push(icon);
                        mapVehiclesNew.push(markerInside[0].stateInfo);
                        mapVehicleTimeW.put(markerInside[0].extData, mapVehiclesNew);
                        markerMap.remove(markerInside[0].extData);
                        mapflog.remove(markerInside[0].extData);
                        mapVehicleNum.remove(markerInside[0].extData);
                    }
                    ;
                    amapOperation.addCluster(fixedPoint);//点聚合
                }
                zoom = map.getZoom();
            }, 50);
        },
        //当拖拽结束时触发该方法
        clickEventListener2: function () {
            if (map.getZoom() == 18) {
                amapOperation.LimitedSize(6);
            } else if (map.getZoom() == 17) {
                amapOperation.LimitedSize(5);
            } else if (map.getZoom() == 16) {
                amapOperation.LimitedSize(4);
            } else if (map.getZoom() == 15) {
                amapOperation.LimitedSize(3);
            } else if (map.getZoom() == 14) {
                amapOperation.LimitedSize(2);
            } else if (map.getZoom() <= 13 && map.getZoom() >= 6) {
                amapOperation.LimitedSize(1);
            }
            ;
            markerListT = [];
            if (cluster) {
                cluster.setMap(null);
            }
            if (map.getZoom() >= 11) {
                if (zoom < 11) {
                    //map.clearMap();//清空地图覆盖物
                    var markerList = markerMap.values();
                    for (var i = 0; i < markerList.length; i++) {
                        map.remove(markerList[i][0]);
                    }
                    ;
                    amapOperation.vehicleMovement();
                } else {
                    amapOperation.vehicleMovement();
                }
                ;
            } else {
                var markerList = markerMap.values();
                var j = markerList.length - 1;
                for (var i = j; i >= 0; i--) {
                    markerList[i][0].stopMove();
                    map.remove([markerList[i][0]]);
                    var markerInside = markerList[i];
                    var mapVehiclesNew = [];
                    if (mapVehicleTimeW.containsKey(markerInside[0].extData) == true) {
                        mapVehicleTimeW.remove(markerInside[0].extData);
                    }
                    mapVehiclesNew.push(markerInside[0].getPosition());
                    mapVehiclesNew.push(markerInside[2]);
                    mapVehiclesNew.push(markerInside[0].extData);
                    if (markerInside[3] == "1") {
                        mapVehiclesNew.push("1");
                    } else {
                        mapVehiclesNew.push("0");
                    }
                    mapVehiclesNew.push(markerInside[0].getAngle());
                    var icons = markerInside[0].getIcon().split("/");
                    var icon = icons[icons.length - 1];
                    mapVehiclesNew.push(icon);
                    mapVehiclesNew.push(markerInside[0].stateInfo);
                    mapVehicleTimeW.put(markerInside[0].extData, mapVehiclesNew);
                    markerMap.remove(markerInside[0].extData);
                    mapflog.remove(markerInside[0].extData);
                    mapVehicleNum.remove(markerInside[0].extData);
                }
                amapOperation.addCluster(fixedPoint);//点聚合
            }
            zoom = map.getZoom();
        },
        vehicleMovement: function () {
            var mapVehicles = mapVehicleTimeW.values();
            var mapVehicleList = markerMap.values();
            var j = mapVehicles.length - 1;
            //清空车牌号显示位置信息
            carNameContentLUMap.clear();
            for (var i = j; i >= 0; i--) {
                var vehicleleg = mapVehicles[i];
                vehicleBans = vehicleleg[2];
                coordinateNew = vehicleleg[0];
                content = vehicleleg[1];
                var angal = vehicleleg[4];
                var ico = vehicleleg[5];
                var stateInfo = vehicleleg[6];
                if (paths.contains(coordinateNew) == true) {
                    var carLngLat;
                    if (coordinateNew.lat == undefined) {
                        carLngLat = coordinateNew;
                    } else {
                        carLngLat = [coordinateNew.lng, coordinateNew.lat];
                    }
                    ;
                    var carName = crrentSubName[crrentSubV.indexOf(vehicleBans)];
                    var markerRealTime;
                    // 
                    if (vehicleleg[3] == "1") {
                        markerRealTime = amapOperation.carNameEvade(vehicleBans, carName, carLngLat, true, "1", ico, false, stateInfo);
                    } else {
                        markerRealTime = amapOperation.carNameEvade(vehicleBans, carName, carLngLat, true, "0", ico, false, stateInfo);
                    }
                    markerRealTime.setAngle(angal);
                    markerRealTime.extData = vehicleBans;
                    markerRealTime.content = content.join("");
                    markerRealTime.stateInfo = stateInfo;
                    markerRealTime.on('click', amapOperation.markerClick);
                    markerList = [];
                    markerList.push(markerRealTime);
                    markerList.push(coordinateNew);//坐标
                    markerList.push(content);
                    if (vehicleleg[3] == "1") {
                        markerList.push("1");
                    } else {
                        markerList.push("0");
                    }
                    markerList.push(stateInfo);
                    if (markerMap.containsKey(markerRealTime.extData)) {
                        markerMap.remove(markerRealTime.extData);
                    }
                    markerMap.put(markerRealTime.extData, markerList);

                    mapVehicleTimeW.remove(markerRealTime.extData);//根据下标删除该元素
                }
                ;
            }
            ;
            var g = mapVehicleList.length - 1;
            for (var i = g; i >= 0; i--) {
                var markerInside = mapVehicleList[i];
                if (paths.contains(markerInside[0].getPosition()) == false) {
                    markerInside[0].stopMove();
                    var mapVehiclesNew = [];
                    mapVehiclesNew.push(markerInside[1]);
                    mapVehiclesNew.push(markerInside[2]);
                    mapVehiclesNew.push(markerInside[0].extData);
                    if (markerInside[3] == "1") {
                        mapVehiclesNew.push("1");
                    } else {
                        mapVehiclesNew.push("0");
                    }
                    mapVehiclesNew.push(markerInside[0].getAngle());
                    var icons = markerInside[0].getIcon().split("/");
                    var icon = icons[icons.length - 1];
                    mapVehiclesNew.push(icon);
                    mapVehiclesNew.push(markerInside[0].stateInfo);
                    markerInside[0].setMap(null);
                    markerMap.remove(markerInside[0].extData);
                    mapflog.remove(markerInside[0].extData);
                    mapVehicleNum.remove(markerInside[0].extData);
                    mapVehicleTimeW.put(markerInside[0].extData, mapVehiclesNew);
                }
                ;
            }
            ;
        },
        vehicleReplacement: function () {
            var mapVehicles = mapVehicleTimeQ.values();
            var j = mapVehicles.length;
            for (var i = 0; i < j; i++) {
                var vehicleleg = mapVehicles[i];
                vehicleBans = vehicleleg[2];
                coordinateNew = vehicleleg[0];
                content = vehicleleg[1];
                if (paths.contains(coordinateNew) == true || map.getZoom() <= 5) {
                    markerRealTimeT = new AMap.Marker({
                        position: coordinateNew,
                        icon: "../../resources/img/1.png",
                        offset: new AMap.Pixel(-26, -13), //相对于基点的位置
                        autoRotation: true
                    });
                    markerRealTimeT.extData = vehicleBans;
                    markerRealTimeT.content = content.join("");
                    markerRealTimeT.on('click', amapOperation.markerClick);
                    markerListT.push(markerRealTimeT);
                }
                ;
            }
            ;
        },
        addCluster: function (id) {
            console.log("addCluster",id)
            fixedPoint = null;
            if (id != null) {
                var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                var nodes = treeObj.getNodesByParam("id", id, null);
                var list = zTreeIdJson[nodes[0].id];
                if (list.length >= 1) {
                    $.each(list, function (index, value) {
                        $("#" + value).parent().removeAttr("class");
                        $(".ztree li a").removeAttr("class", "curSelectedNode");
                    })
                }
                $("#realTimeStateTable tbody tr").removeAttr("class", "tableHighlight");
            }
            amapOperation.clearContentValue();
            amapOperation.vehicleReplacement();
            map.plugin(["AMap.MarkerClusterer"], function () {
                cluster = new AMap.MarkerClusterer(map, markerListT);
            });
        },
        //车辆标注点击
        markerClick: function (e) {
            vinfoWindwosClickVid = e.target.extData;
            infoWindow.setContent(e.target.content);
            infoWindow.open(map, e.target.getPosition());
        },
        jumpToTrackPlayer: function (sid, type, pid, uuids) {
            var jumpFlag = false;
            var permissionUrls = $("#permissionUrls").val();
            if (permissionUrls != null && permissionUrls != undefined) {
                var urllist = permissionUrls.split(",");
                if (urllist.indexOf("/v/monitoring/trackPlayback") > -1) {
                    var uuidStr = JSON.stringify(uuids);
                    sessionStorage.setItem('uuid', uuidStr);
                    var url = "/clbs/v/monitoring/trackPlayBackLog";
                    var data = {"vehicleId": sid, "type": type};
                    json_ajax("POST", url, "json", false, data, null);
                    setTimeout("dataTableOperation.logFindCilck()", 500);
                    jumpFlag = true;
                    location.href = "/clbs/v/monitoring/trackPlayback?vid=" + sid + "&type=" + type + "&pid=" + pid;
                }
            }
            if (!jumpFlag) {
                layer.msg("无操作权限，请联系管理员");
            }
        },
        // 实时路况点击
        realTimeRC: function () {
            if ($realTimeRC.attr("checked")) {
                realTimeTraffic.hide();
                $realTimeRC.attr("checked", false);
                $("#realTimeRCLab").removeClass("preBlue");
            } else {
                //取消谷歌地图选中状态
                if (googleMapLayer) {
                    googleMapLayer.setMap(null);
                }
                $("#googleMap").attr("checked", false);
                $("#googleMapLab").removeClass("preBlue");
                /* if ($("#googleMap").attr("checked")) {
                     realTimeTraffic = new AMap.TileLayer.Traffic({zIndex: 100});
                     realTimeTraffic.setMap(map);
                 }*/
                realTimeTraffic.show();
                $realTimeRC.attr("checked", true);
                $("#realTimeRCLab").addClass("preBlue");
            }
        },
        //卫星地图及3D地图切换
        satelliteMapSwitching: function () {
            if ($("#defaultMap").attr("checked")) {
                satellLayer.hide();
                buildings.setMap(map);
                if (googleMapLayer) {
                    googleMapLayer.setMap(null);
                }
                $("#defaultMap").attr("checked", false);
                $("#defaultMapLab").removeClass("preBlue");
            } else {
                // 判断未切换到谷歌地图直接选择卫星地图时 未初始化问题
                if (googleMapLayer) {
                    //取消谷歌地图选中状态
                    googleMapLayer.setMap(null);
                }
                $("#googleMap").attr("checked", false);
                $("#googleMapLab").removeClass("preBlue");

                satellLayer.show();
                buildings.setMap(null);
                $("#defaultMap").attr("checked", true);
                $("#defaultMapLab").addClass("preBlue");
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
                $realTimeRC.attr("checked", false);
                $("#realTimeRCLab").removeClass("preBlue");
                realTimeTraffic.hide();
                $("#defaultMap").attr("checked", false);
                $("#defaultMapLab").removeClass("preBlue");
                satellLayer.hide();
                buildings.setMap(map);
            }
        },
        //工具操作
        toolClickList: function () {
            var id = $(this).attr('id');
            var i = $("#" + id).children('i');

            //显示设置
            if (id == 'displayClick') {
                if (!($("#mapDropSettingMenu").is(":hidden"))) {
                    $("#mapDropSettingMenu").slideUp();
                    $("#disSetMenu").slideDown();
                } else {
                    if ($("#disSetMenu").is(":hidden")) {
                        $("#disSetMenu").slideDown();
                    } else {
                        $("#disSetMenu").slideUp();
                    }
                }
            }
            //地图设置
            else if (id == "mapDropSetting") {
                if (!($("#disSetMenu").is(":hidden"))) {
                    $("#disSetMenu").slideUp();
                    $("#mapDropSettingMenu").slideDown();
                } else {
                    if ($("#mapDropSettingMenu").is(":hidden")) {
                        $("#mapDropSettingMenu").slideDown();
                    } else {
                        $("#mapDropSettingMenu").slideUp();
                    }
                }
            } else {

                // wjk 加一个通话功能 通话与视频可以同时存在
                var phoneCall_i = $('#phoneCall').find('i');
                var video_i = $('#btn-videoRealTime-show').find('i');
                if (!i.hasClass("active") && id == 'phoneCall' && video_i.hasClass('active') ||
                    !i.hasClass("active") && id == 'btn-videoRealTime-show' && phoneCall_i.hasClass('active')) {

                    i.addClass('active');
                    $("#" + id).children('span.mapToolClick').css('color', '#6dcff6');
                    mouseTool.close(true);
                }
                else
                //end


                if (i.hasClass("active")) {
                    i.removeClass('active');
                    $("#" + id).children('span.mapToolClick').css('color', '#5c5e62');
                    mouseTool.close(true);

                    // wjk 通话时取消视频也关闭时关闭画面
                    if (id == 'phoneCall' && !video_i.hasClass('active')) {
                        $realTimeVideoReal.removeClass("realTimeVideoShow");
                        $mapPaddCon.removeClass("mapAreaTransform");
                    }
                    //end

                } else {
                    $("#toolOperateClick i").removeClass('active');
                    $("#toolOperateClick span.mapToolClick").css('color', '#5c5e62');
                    i.addClass('active');
                    $("#" + id).children('span.mapToolClick').css('color', '#6dcff6');
                    mouseTool.close(true);
                }
                ;
                if (i.hasClass("active")) {
                    // wjk
                    // if (id == 'phoneCall') {
                    //     $realTimeVideoReal.addClass("realTimeVideoShow");
                    //     $mapPaddCon.addClass("mapAreaTransform");
                    // }
                    //end

                    if (id == "magnifyClick") {
                        //拉框放大
                        mouseTool.rectZoomIn();
                    } else if (id == "shrinkClick") {
                        //拉框放小
                        mouseTool.rectZoomOut();
                    } else if (id == "countClick") {
                        //距离量算
                        isDistanceCount = true;
                        mouseTool.rule();
                    } else if (id == "queryClick") {
                        //区域查车
                        isAreaSearchFlag = true;
                        mouseTool.rectangle();
                    }
                    ;
                }
                ;
                if (id == 'btn-videoRealTime-show') {
                    // pageLayout.videoRealTimeShow();

                    // wjk
                    //先注释掉次数
                    // json_ajax("POST", '/clbs/r/riskManagement/RiskCombat/canOpenMedia', "json", false, {'type':'video'}, function(res){
                    // if (res == true) {
                    pageLayout.videoRealTimeShow();
                    // }else{ //实时视频总次数达到上限后不允许开启
                    // i.removeClass('active');
                    // $("#" + id).children('span.mapToolClick').css('color', '#5c5e62');
                    // mouseTool.close(true);
                    // layer.msg('视频总次数已达到上限')
                    // }
                    // })
                }

                // wjk 通话
                if (id == 'phoneCall') {
                    // pageLayout.videoRealTimeShow();

                    // wjk
                    json_ajax("POST", '/clbs/r/riskManagement/RiskCombat/canOpenMedia', "json", false, {'type': 'audio'}, function (res) {
                        if (res == true) {
                            pageLayout.phoneCallRealTimeshow();
                        } else { //实时通话总次数达到上限后不允许开启
                            i.removeClass('active');
                            $("#" + id).children('span.mapToolClick').css('color', '#5c5e62');
                            mouseTool.close(true);
                            layer.msg('实时通话总次数已达到上限')
                        }
                    })
                }
                //wjk end
            }
        },
        //车牌号规避
        carNameEvade: function (id, name, lnglat, flag, type, ico, showFlag, stateInfo) {
            //监控对象图片大小
            var value = lnglat;
            var picWidth;
            var picHeight;
            var icons;
            if (type == "0") {
                if (ico == "null" || ico == undefined || ico == null) {
                    icons = "../../resources/img/vehicle.png";
                } else {
                    icons = "../../resources/img/vico/" + ico;
                }
                picWidth = 58 / 2;
                picHeight = 26 / 2;
            } else if (type == "1") {
                icons = "../../resources/img/123.png";
                picWidth = 30 / 2;
                picHeight = 30 / 2;
            }
            if (isCarNameShow) {
                //显示对象姓名区域大小
                var nameAreaWidth = 90;
                var nameAreaHeight = 38;
                //车辆状态没判断
                var carState = amapOperation.stateCallBack(stateInfo);
                var id = id;
                var name = name;
                //判断是否第一个创建
                var markerAngle = 0; //图标旋转角度
                if (carNameMarkerMap.containsKey(id)) {
                    var thisCarMarker = carNameMarkerMap.get(id);
                    var ssmarker = new AMap.Marker({
                        icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                        position: [116.41, 39.91]
                    });
                    markerAngle = thisCarMarker.getAngle();
                    var s = ssmarker.getAngle();
                    if (markerAngle > 360) {
                        var i = Math.floor(markerAngle / 360);
                        markerAngle = markerAngle - 360 * i;
                    }
                    ;
                }
                //将经纬度转为像素
                var pixel = map.lngLatToContainer(value);
                var pixelX = pixel.getX();
                var pixelY = pixel.getY();
                var pixelPX = [pixelX, pixelY];
                //得到车辆图标四个角的像素点(假设车图标永远正显示)58*26
                var defaultLU = [pixelX - picWidth, pixelY - picHeight];//左上
                var defaultRU = [pixelX + picWidth, pixelY - picHeight];//右上
                var defaultLD = [pixelX - picWidth, pixelY + picHeight];//左下
                var defaultRD = [pixelX + picWidth, pixelY + picHeight];//右下
                //计算后PX
                var pixelRD = amapOperation.countAnglePX(markerAngle, defaultRD, pixelPX, 1, picWidth, picHeight);
                var pixelRU = amapOperation.countAnglePX(markerAngle, defaultRU, pixelPX, 2, picWidth, picHeight);
                var pixelLU = amapOperation.countAnglePX(markerAngle, defaultLU, pixelPX, 3, picWidth, picHeight);
                var pixelLD = amapOperation.countAnglePX(markerAngle, defaultLD, pixelPX, 4, picWidth, picHeight);
                //四点像素转为经纬度
                var llLU = map.containTolnglat(new AMap.Pixel(pixelLU[0], pixelLU[1]));
                var llRU = map.containTolnglat(new AMap.Pixel(pixelRU[0], pixelRU[1]));
                var llLD = map.containTolnglat(new AMap.Pixel(pixelLD[0], pixelLD[1]));
                var llRD = map.containTolnglat(new AMap.Pixel(pixelRD[0], pixelRD[1]));
                //车牌显示位置左上角PX
                var nameRD_LU = [pixelRD[0], pixelRD[1]];
                var nameRU_LU = [pixelRU[0], pixelRU[1] - nameAreaHeight];
                var nameLU_LU = [pixelLU[0] - nameAreaWidth, pixelLU[1] - nameAreaHeight];
                var nameLD_LU = [pixelLD[0] - nameAreaWidth, pixelLD[1]];
                //分别将上面四点转为经纬度
                var llNameRD_LU = map.containTolnglat(new AMap.Pixel(nameRD_LU[0], nameRD_LU[1]));
                var llNameRU_LU = map.containTolnglat(new AMap.Pixel(nameRU_LU[0], nameRU_LU[1]));
                var llNameLU_LU = map.containTolnglat(new AMap.Pixel(nameLU_LU[0], nameLU_LU[1]));
                var llNameLD_LU = map.containTolnglat(new AMap.Pixel(nameLD_LU[0], nameLD_LU[1]));
                //判断车牌号该显示的区域
                var isOneArea = true;
                var isTwoArea = true;
                var isThreeArea = true;
                var isFourArea = true;
                //取出所有的左上角的经纬度并转为像素
                var contentArray = [];
                if (!carNameContentLUMap.isEmpty()) {
                    carNameContentLUMap.remove(id);
                    var carContent = carNameContentLUMap.values();
                    for (var i = 0; i < carContent.length; i++) {
                        var contentPixel = map.lngLatToContainer(carContent[i]);
                        contentArray.push([contentPixel.getX(), contentPixel.getY()]);
                    }
                    ;
                }
                ;
                if (contentArray.length != 0) {
                    for (var i = 0; i < contentArray.length; i++) {
                        if (!((contentArray[i][0] + nameAreaWidth) <= nameRD_LU[0] || (contentArray[i][1] + nameAreaHeight) <= nameRD_LU[1] || (nameRD_LU[0] + nameAreaWidth) <= contentArray[i][0] || (nameRD_LU[1] + nameAreaHeight) <= contentArray[i][1])) {
                            isOneArea = false;
                        }
                        ;
                        if (!((contentArray[i][0] + nameAreaWidth) <= nameRU_LU[0] || (contentArray[i][1] + nameAreaHeight) <= nameRU_LU[1] || (nameRU_LU[0] + nameAreaWidth) <= contentArray[i][0] || (nameRU_LU[1] + nameAreaHeight) <= contentArray[i][1])) {
                            isTwoArea = false;
                        }
                        ;
                        if (!((contentArray[i][0] + nameAreaWidth) <= nameLU_LU[0] || (contentArray[i][1] + nameAreaHeight) <= nameLU_LU[1] || (nameLU_LU[0] + nameAreaWidth) <= contentArray[i][0] || (nameLU_LU[1] + nameAreaHeight) <= contentArray[i][1])) {
                            isThreeArea = false;
                        }
                        ;
                        if (!((contentArray[i][0] + nameAreaWidth) <= nameLD_LU[0] || (contentArray[i][1] + nameAreaHeight) <= nameLD_LU[1] || (nameLD_LU[0] + nameAreaWidth) <= contentArray[i][0] || (nameLD_LU[1] + nameAreaHeight) <= contentArray[i][1])) {
                            isFourArea = false;
                        }
                        ;
                    }
                    ;
                }
                ;
                var isConfirm = true;
                var mapPixel;
                var LUPX;
                var showLocation;
                if (isOneArea) {
                    mapPixel = llRD;
                    LUPX = llNameRD_LU;
                    offsetCarName = new AMap.Pixel(0, 0);
                    isConfirm = false;
                    showLocation = "carNameShowRD";
                } else if (isConfirm && isTwoArea) {
                    mapPixel = llRU;
                    LUPX = llNameRU_LU;
                    offsetCarName = new AMap.Pixel(0, -nameAreaHeight);
                    isConfirm = false;
                    showLocation = "carNameShowRU";
                } else if (isThreeArea && isConfirm) {
                    mapPixel = llLU;
                    LUPX = llNameLU_LU;
                    offsetCarName = new AMap.Pixel(-nameAreaWidth, -nameAreaHeight);
                    isConfirm = false;
                    showLocation = "carNameShowLU";
                } else if (isFourArea && isConfirm) {
                    mapPixel = llLD;
                    LUPX = llNameLD_LU;
                    offsetCarName = new AMap.Pixel(-nameAreaWidth, 0);
                    isConfirm = false;
                    showLocation = "carNameShowLD";
                }
                ;
                if (mapPixel == undefined) {
                    mapPixel = llRD;
                    LUPX = llNameRD_LU;
                    offsetCarName = new AMap.Pixel(0, 0);
                    showLocation = "carNameShowRD";
                }
                ;
            }
            ;
            if (flag != null) {
                if (flag) {//创建marker
                    //车辆
                    if (!showFlag) {
                        var markerLocation = new AMap.Marker({
                            position: value,
                            icon: icons,
                            offset: new AMap.Pixel(-picWidth, -picHeight), //相对于基点的位置
                            autoRotation: true,//自动调节图片角度
                            map: map,
                        });
                        markerLocation.name = name;
                        //车辆名
                        carNameMarkerMap.put(id, markerLocation);
                    }
                    ;
                    if (isCarNameShow) {
                        var carContent = "<p class='" + showLocation + "'><i class='" + carState + "'></i>&nbsp;" + name + "</p>";
                        if (carNameMarkerContentMap.containsKey(id)) {
                            var nameValue = carNameMarkerContentMap.get(id);
                            map.remove([nameValue]);
                            carNameMarkerContentMap.remove(id);
                        }
                        ;
                        var markerContent = new AMap.Marker({
                            position: mapPixel,
                            content: carContent,
                            offset: offsetCarName,
                            autoRotation: true,//自动调节图片角度
                            map: map,
                            zIndex: 999

                        });
                        markerContent.setMap(map);
                        carNameMarkerContentMap.put(id, markerContent);
                        carNameContentLUMap.put(id, LUPX);
                        if (isConfirm) {
                            markerContent.hide();
                        } else {
                            markerContent.show();
                        }
                        ;
                    }
                    ;
                    if (!showFlag) {
                        return markerLocation;
                    }
                    ;
                } else {//改变位置
                    if (isCarNameShow) {
                        var carContentHtml = "<p class='" + showLocation + "'><i class='" + carState + "'></i>&nbsp;" + name + "</p>";
                        if (carNameMarkerContentMap.containsKey(id)) {
                            var carContent = carNameMarkerContentMap.get(id);
                            if (isConfirm) {
                                carContent.hide();
                            } else {
                                map.remove([carContent]);
                                carNameMarkerContentMap.remove(id);
                                var markerContent = new AMap.Marker({
                                    position: mapPixel,
                                    content: carContentHtml,
                                    offset: offsetCarName,
                                    autoRotation: true,//自动调节图片角度
                                    map: map,
                                    zIndex: 999
                                });
                                markerContent.setMap(map);
                                carNameMarkerContentMap.put(id, markerContent);
                            }
                        }
                        ;
                        carNameContentLUMap.put(id, LUPX);
                    }
                    ;
                }
                ;
            } else {
                if (isCarNameShow) {
                    var carContentHtml = "<p class='" + showLocation + "'><i class='" + carState + "'></i>&nbsp;" + name + "</p>";
                    if (carNameMarkerContentMap.containsKey(id)) {
                        var thisMoveMarker = carNameMarkerContentMap.get(id);
                        //llRD 移动中默认显示在右下脚
                        thisMoveMarker.show();
                        thisMoveMarker.setContent(carContentHtml);
                        thisMoveMarker.setPosition(llRD);
                        thisMoveMarker.setOffset(new AMap.Pixel(0, 0));
                    }
                    ;
                }
                ;
            }
            ;
        },
        //计算车牌号四个定点的像素坐标
        countAnglePX: function (angle, pixel, centerPX, num, picWidth, picHeight) {
            var thisPX;
            var thisX;
            var thisY;
            if ((angle <= 45 && angle > 0) || ( angle > 180 && angle <= 225) || (angle >= 135 && angle < 180) || (angle >= 315 && angle < 360)) {
                angle = 0;
            }
            ;
            if ((angle < 90 && angle > 45) || ( angle < 270 && angle > 225) || (angle > 90 && angle < 135) || (angle > 270 && angle < 315)) {
                angle = 90;
            }
            ;
            if (angle == 90 || angle == 270) {
                if (num == 1) {
                    thisX = centerPX[0] + picHeight;
                    thisY = centerPX[1] + picWidth;
                }
                ;
                if (num == 2) {
                    thisX = centerPX[0] + picHeight;
                    thisY = centerPX[1] - picWidth;
                }
                ;
                if (num == 3) {
                    thisX = centerPX[0] - picHeight;
                    thisY = centerPX[1] - picWidth;
                }
                ;
                if (num == 4) {
                    thisX = centerPX[0] - picHeight;
                    thisY = centerPX[1] + picWidth;
                }
                ;
            }
            ;
            if (angle == 0 || angle == 180 || angle == 360) {
                thisX = pixel[0];
                thisY = pixel[1];
            }
            ;
            thisPX = [thisX, thisY];
            return thisPX;
        },
        // 监控对象状态返回
        stateCallBack: function (stateInfo) {
            var state;
            switch (stateInfo) {
                case 4:
                    state = 'carStateStop';
                    break;
                case 10:
                    state = 'carStateRun';
                    break;
                case 5:
                    state = 'carStateAlarm';
                    break;
                case 2:
                    state = 'carStateMiss';
                    break;
                case 3:
                    state = 'carStateOffLine';
                    break;
                case 9:
                    state = 'carStateOverSpeed';
                    break;
                case 11:
                    state = 'carStateheartbeat';
                    break;
            }
            ;
            return state;
        },
        //重新设置区域
        setCarNameCircle: function () {
            var markerMapValue = markerMap.values();
            if (markerMapValue != undefined) {
                //清空车牌号显示位置信息
                carNameContentLUMap.clear();
                for (var i = 0; i < markerMapValue.length; i++) {
                    var carId = markerMapValue[i][0].extData;
                    var carName = markerMapValue[i][0].name;
                    var stateInfo = markerMapValue[i][0].stateInfo;
                    var lngLatValue = markerMapValue[i][0].getPosition();
                    // 
                    if (isCarNameShow) {
                        if (markerMapValue[i][5] == "1") {
                            amapOperation.carNameEvade(carId, carName, lngLatValue, false, "1", null, false, stateInfo);
                        } else {
                            amapOperation.carNameEvade(carId, carName, lngLatValue, false, "0", null, false, stateInfo);
                        }
                    }
                    ;
                }
                ;
            }
            ;
        },
        //清空所有content marker的value值
        clearContentValue: function () {
            if (!carNameMarkerContentMap.isEmpty()) {
                var contentValue = carNameMarkerContentMap.values();
                map.remove(contentValue);
                carNameMarkerContentMap.clear();
            }
            ;
        },
        vStatusInfoShow: function (data, group, people, alam) {
            //获取当前车辆点击的经纬度
            var currentCarCoordinate = "";
            if (map.getZoom() >= 11) {
                currentCarCoordinate = (markerMap.get(vinfoWindwosClickVid))[0].getPosition();
            } else {
                currentCarCoordinate = (mapVehicleTimeQ.get(vinfoWindwosClickVid))[0];
            }
            //点击时判断是否显示信息框
            if ($("#v-statusInfo-show").is(":hidden")) {
                //执行显示
                $("#basicStatusInformation").removeAttr("class");
                $("#basicStatusInformation").addClass("col-md-4");
                $("#basicStatusInformation").parent().css("width", "574px");
                $("#vStatusInfoShowMore").removeClass("fa-chevron-circle-right").addClass("fa-chevron-circle-left");
                $("#v-statusInfo-show").show();
                //执行信息框底部移动方法
                amapOperation.amapInfoSharpAdaptiveFn();
                //执行信息框整体基点位置方法
                infoWindow.setPosition(currentCarCoordinate);
                $("#basicStatusInformation").css({"width": "158px", "margin-right": "20px"});
                //加入数据
                var dataList = data.split(",");
                var num = +dataList[17];
                var dataa = num.toString(2);
                dataa = (Array(32).join(0) + dataa).slice(-32);//高位补零
                if (dataList[16] == 1) {
                    $("#bombBox0").text("单次回报应答");
                }
                $("#bombBox1").text(alam);
                if (dataa.substring(29, 30) == 0) {
                    $("#bombBox2").text("北纬：" + dataList[10]);
                } else if (dataa.substring(30, 31) == 1) {
                    $("#bombBox2").text("南纬：" + dataList[10]);
                }
                ;
                if (dataa.substring(28, 29) == 0) {
                    $("#bombBox3").text("东经：" + dataList[11]);
                } else if (dataa.substring(28, 29) == 1) {
                    $("#bombBox3").text("西经：" + dataList[11]);
                }
                ;
                $("#bombBox4").text("方向：" + dataList[14]);
                $("#bombBox5").text("记录仪速度：" + dataList[20]);
                $("#bombBox6").text("高程：" + dataList[19]);
                $("#bombBox7").text("电子运单：");
                if (people == "null") {
                    people = "";
                }
                $("#bombBox8").text("从业人员：" + people);
                var peopleIDcard = "";
                if (dataList[18] == "null") {
                    peopleIDcard = "";
                } else {
                    peopleIDcard = dataList[18];
                }
                $("#bombBox9").text("从业资格证号：" + peopleIDcard);
                if (dataa.substring(27, 28) == 0) {
                    $("#bombBox10").text("运营状态");
                } else if (dataa.substring(27, 28) == 1) {
                    $("#bombBox10").text("停运状态");
                }
                ;
                if (dataa.substring(21, 22) == 0) {
                    $("#bombBox11").text("车辆油路正常");
                } else if (dataa.substring(21, 22) == 1) {
                    $("#bombBox11").text("车辆油路断开");
                }
                ;
                if (dataa.substring(20, 21) == 0) {
                    $("#bombBox12").text("车辆电路正常");
                } else if (dataa.substring(20, 21) == 1) {
                    $("#bombBox12").text("车辆电路断开");
                }
                ;
                if (dataa.substring(19, 20) == 0) {
                    $("#bombBox13").text("车门解锁");
                } else if (dataa.substring(19, 20) == 1) {
                    $("#bombBox13").text("车门加锁");
                }
                ;
            } else {
                //执行显示
                $("#basicStatusInformation").removeAttr("class");
                $("#basicStatusInformation").addClass("col-md-12");
                $("#basicStatusInformation").parent().css("width", "196px");
                $("#vStatusInfoShowMore").removeClass("fa-chevron-circle-left").addClass("fa-chevron-circle-right");
                $("#v-statusInfo-show").hide();
                //执行信息框底部移动方法
                amapOperation.amapInfoSharpAdaptiveFn();
                //执行信息框整体基点位置方法
                infoWindow.setPosition(currentCarCoordinate);
                $("#basicStatusInformation").css("width", "none");
            }
        },
        //车牌号标注是否显示
        carNameState: function (flag) {
            var carNameMarkerValue;
            if (!carNameMarkerContentMap.isEmpty()) {
                carNameMarkerValue = carNameMarkerContentMap.values();
            }
            ;
            if (flag) {
                //重新计算对象名称位置
                amapOperation.carNameShow();
            } else {
                if (carNameMarkerValue != undefined) {
                    for (var i = 0, len = carNameMarkerValue.length; i < len; i++) {
                        carNameMarkerValue[i].hide();
                    }
                    ;
                }
                ;
            }
            ;
        },
        // 重新计算对象名称位置
        carNameShow: function () {
            //清空车牌号显示位置信息
            if (map.getZoom() > 10) {
                var mapVehicles = mapVehicleTimeW.values();
                for (var i = 0, len = mapVehicles.length; i < len; i++) {
                    var vehicleleg = mapVehicles[i];
                    vehicleBans = vehicleleg[2];
                    coordinateNew = vehicleleg[0];
                    content = vehicleleg[1];
                    var angal = vehicleleg[4];
                    var ico = vehicleleg[5];
                    if (paths.contains(coordinateNew)) {
                        var carLngLat;
                        if (coordinateNew.lat == undefined) {
                            carLngLat = coordinateNew;
                        } else {
                            carLngLat = [coordinateNew.lng, coordinateNew.lat];
                        }
                        ;
                        var carName = crrentSubName[crrentSubV.indexOf(vehicleBans)];
                        var markerRealTime;
                        //
                        if (vehicleleg[3] == "1") {
                            amapOperation.carNameEvade(vehicleBans, carName, carLngLat, true, "1", ico, true, vehicleleg[0].stateInfo);
                        } else {
                            amapOperation.carNameEvade(vehicleBans, carName, carLngLat, true, "0", ico, true, vehicleleg[0].stateInfo);
                        }
                    }
                    ;
                }
                ;
                var mapVehicleList = markerMap.values();
                for (var j = 0, len = mapVehicleList.length; j < len; j++) {
                    var vehicleleg = mapVehicleList[j];
                    vehicleBans = vehicleleg[0].extData; // id
                    coordinateNew = vehicleleg[1];
                    content = vehicleleg[2];
                    var this_marker = vehicleleg[0];
                    var angal = this_marker.getAngle();
                    if (angal > 360) {
                        var num = Math.floor(angal / 360);
                        angal = angal - 360 * num;
                    }
                    ;
                    var ico = this_marker.getIcon().split('/')[this_marker.getIcon().split('/').length - 1];
                    if (paths.contains(coordinateNew)) {
                        var carLngLat;
                        if (coordinateNew.lat == undefined) {
                            carLngLat = coordinateNew;
                        } else {
                            carLngLat = [coordinateNew.lng, coordinateNew.lat];
                        }
                        ;
                        var carName = crrentSubName[crrentSubV.indexOf(vehicleBans)];
                        var markerRealTime;
                        // 
                        if (vehicleleg[3] == "1") {
                            amapOperation.carNameEvade(vehicleBans, carName, carLngLat, true, "1", ico, true, vehicleleg[0].stateInfo);
                        } else {
                            amapOperation.carNameEvade(vehicleBans, carName, carLngLat, true, "0", ico, true, vehicleleg[0].stateInfo);
                        }
                    }
                    ;
                }
                ;
            }
            ;
        },
        //手动清除label错误提示语
        clearLabel: function () {
            $('label.error').remove();
        },
        //监控对象信息框更多显示方法
        amapInfoSharpAdaptiveFn: function () {
            if ($("#v-statusInfo-show").is(":hidden")) {
                $(".amap-info-sharp").removeClass("amap-info-sharp-marleft-hide");
                $(".amap-info-sharp").removeClass("amap-info-sharp-marleft-show");
                $(".amap-info-sharp").addClass("amap-info-sharp-marleft-hide");
            } else {
                $(".amap-info-sharp").removeClass("amap-info-sharp-marleft-hide");
                $(".amap-info-sharp").removeClass("amap-info-sharp-marleft-show");
                $(".amap-info-sharp").addClass("amap-info-sharp-marleft-show");
            }
        },
    };

    var fenceOperation = {
    // 初始化
    init: function () {
        // 围栏树
            var fenceAll = {
                async: {
                    url: "/gis/bindfence/fenceTree/",
                    type: "post",
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
            // 时分秒选择器
            var hmsTime = '<div id="hmsTime" style="text-align:center;background-color:#ffffff;border:1px solid #cccccc;width:200px; display:none;"><div id="hourseSelect"><div style="text-align:center;width:200px;background-color:#6dcff6;color:#ffffff;">时</div><table style="width:200px;border-top:1px solid #cccccc; color:#6dcff6;"><thead></thead><tbody><tr><td>01</td><td>02</td><td>03</td><td>04</td></tr><tr><td>05</td><td>06</td><td>07</td><td>08</td></tr><tr><td>09</td><td>10</td><td>11</td><td>12</td></tr><tr><td>13</td><td>14</td><td>15</td><td>16</td></tr><tr><td>17</td><td>18</td><td>19</td><td>20</td></tr><tr><td>21</td><td>22</td><td>23</td><td>00</td></tr></tbody></table></div><div id="minuteSelect" style="display:none;"><div style="text-align:center;width:200px;background-color:#6dcff6;color:#ffffff;">分</div><table style="width:200px;border-top:1px solid #cccccc; color:#6dcff6"><thead></thead><tbody><tr><td>01</td><td>02</td><td>03</td><td>04</td><td>05</td><td>06</td></tr><tr><td>07</td><td>08</td><td>09</td><td>10</td><td>11</td><td>12</td></tr><tr><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td></tr><tr><td>19</td><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td></tr><tr><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td><td>30</td></tr><tr><td>31</td><td>32</td><td>33</td><td>34</td><td>35</td><td>36</td></tr><tr><td>37</td><td>38</td><td>39</td><td>40</td><td>41</td><td>42</td></tr><tr><td>43</td><td>44</td><td>45</td><td>46</td><td>47</td><td>48</td></tr><tr><td>49</td><td>50</td><td>51</td><td>52</td><td>53</td><td>54</td></tr><tr><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td><td>00</td></tr></tbody></table></div><div id="secondSelect" style="display:none;"><div style="text-align:center;width:200px;background-color:#6dcff6;color:#ffffff;">秒</div><table style="width:200px;border-top:1px solid #cccccc;color:#6dcff6;"><thead></thead><tbody><tr><td>01</td><td>02</td><td>03</td><td>04</td><td>05</td><td>06</td></tr><tr><td>07</td><td>08</td><td>09</td><td>10</td><td>11</td><td>12</td></tr><tr><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td></tr><tr><td>19</td><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td></tr><tr><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td><td>30</td></tr><tr><td>31</td><td>32</td><td>33</td><td>34</td><td>35</td><td>36</td></tr><tr><td>37</td><td>38</td><td>39</td><td>40</td><td>41</td><td>42</td></tr><tr><td>43</td><td>44</td><td>45</td><td>46</td><td>47</td><td>48</td></tr><tr><td>49</td><td>50</td><td>51</td><td>52</td><td>53</td><td>54</td></tr><tr><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td><td>00</td></tr></tbody></table></div></div>';
            $("body").append(hmsTime);
            $("#hmsTime tr td").on("mouseover", function () {
                $(this).css({
                    "background-color": "#6dcff6",
                    "color": "#ffffff"
                })
            }).on("mouseout", function () {
                $(this).css({
                    "background-color": "#ffffff",
                    "color": "#6dcff6"
                })
            });
            // datatable列表显示隐藏列
            var table = $("#dataTableBind tr th:gt(1)");
            var menu_text = '';
            menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(2) + "\" disabled />" + table[0].innerHTML + "</label></li>"
            for (var i = 1; i < table.length; i++) {
                menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(i + 2) + "\" />" + table[i].innerHTML + "</label></li>"
            }
            ;
            $("#Ul-menu-text-bind").html(menu_text);
            laydate.render({elem: '#arriveTime', type: 'datetime', theme: '#6dcff6'});
            laydate.render({elem: '#leaveTime', type: 'datetime', theme: '#6dcff6'});
            laydate.render({elem: '#msStartTime', type: 'datetime', theme: '#6dcff6'});
            laydate.render({elem: '#msEndTime', type: 'datetime', theme: '#6dcff6'});
            laydate.render({elem: '#muStartTime', type: 'datetime', theme: '#6dcff6'});
            laydate.render({elem: '#muEndTime', type: 'datetime', theme: '#6dcff6'});
        },
        // 围栏绑定列表
        fenceBindList: function () {
            //表格列定义
            var columnDefs = [{
                //第一列，用来显示序号
                "searchable": false,
                "orderable": false,
                "targets": 0
            }];
            var columns = [
                {
                    //第一列，用来显示序号
                    "data": null,
                    "class": "text-center"
                },
                {
                    "data": null,
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        var result = '';
                        var obj = {};
                        obj.fenceConfigId = row.id;
                        obj.paramId = row.paramId;
                        obj.vehicleId = row.vehicle_id;
                        obj.fenceId = row.fence_id;
                        var jsonStr = JSON.stringify(obj)
                        result += "<input  type='checkbox' name='subChk'  value='" + jsonStr + "' />";
                        return result;
                    }
                },
                {
                    "data": null,
                    "class": "text-center", //最后一列，操作按钮
                    render: function (data, type, row, meta) {
                        var editUrlPath = myTable.editUrl + ".gsp?id=" + row.id + "&brand=" + row.brand + "&name=" + row.name + "&type=" + row.type + "&alarmSource=" + row.alarm_source; //修改地址
                        var result = '';
                        //修改按钮
                        result += '<button href="' + editUrlPath + '" data-target="#commonWin" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp;';
                        // 围栏下发按钮
                        if (row.type == 'zw_m_marker' || row.alarm_source == 1 || row.monitorType == '1') {
                            result += ' <button disabled onclick="fenceOperation.sendFenceOne(\'' + row.id + '\',\'' + row.paramId + '\',\'' + row.vehicle_id + '\',\'' + row.fence_id + '\')" class="editBtn btn-default" type="button"><i class="glyphicon glyphicon-circle-arrow-down"></i>围栏下发</button>&nbsp;'
                        } else {
                            result += ' <button onclick="fenceOperation.sendFenceOne(\'' + row.id + '\',\'' + row.paramId + '\',\'' + row.vehicle_id + '\',\'' + row.fence_id + '\')" class="editBtn editBtn-info" type="button"><i class="glyphicon glyphicon-circle-arrow-down"></i>围栏下发</button>&nbsp;'
                        }
                        //删除按钮
                        result += '<button type="button" onclick="myTable.deleteItem(\''
                            + row.id
                            + '\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>解除绑定</button>';
                        return result;
                    }
                }, {
                    "data": "type",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return fenceOperation.fencetypepid(data);
                    }
                }, {
                    "data": "name",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        var fenceId = '<a onclick="fenceOperation.tableFence(\'' + row.fenceId + '\')">' + data + '</a>';
                        return fenceId;
                    }
                }, {
                    "data": "brand",
                    "class": "text-center"
                }, {
                    "data": "dirStatus",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (data == "0") {
                            return '指令已生效';
                        } else if (data == "1") {
                            return '指令未生效';
                        } else if (data == "2") {
                            return "指令未生效";
                        } else if (data == "3") {
                            return "指令未生效";
                        } else if (data == "4") {
                            return "指令已发出";
                        } else if (data == "5") {
                            return "设备离线，未下发";
                        } else {
                            return "";
                        }
                    }
                }, {
                    "data": "send_fence_type",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (row.alarm_source == 1) {
                            return "";
                        } else {
                            if (data == "0") {
                                return '更新';
                            } else if (data == "1") {
                                return '追加';
                            } else if (data == "2") {
                                return "修改";
                            }
                        }
                    }
                }, {
                    "data": "alarm_source",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (data == "0") {
                            return '终端报警';
                        } else if (data == "1") {
                            return '平台报警';
                        }
                    }
                }, {
                    "data": "alarm_start_time",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (data != null && data != "") {
                            var dateStr = data.substring(0, 10);
                            return dateStr;
                        } else {
                            return "";
                        }
                    }
                }, {
                    "data": "alarm_end_time",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (data != null && data != "") {
                            var dateStr = data.substring(0, 10);
                            return dateStr;
                        } else {
                            return "";
                        }
                    }
                }, {
                    "data": "alarm_start_date",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (data != null && data != "") {
                            var dateStr = data.substring(10);
                            return dateStr;
                        } else {
                            return "";
                        }
                    }
                }, {
                    "data": "alarm_end_date",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (data != null && data != "") {
                            var dateStr = data.substring(10);
                            return dateStr;
                        } else {
                            return "";
                        }
                    }
                }, {
                    "data": "alarm_in_platform",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (data == "1") {
                            return 'V';
                        } else if (data == "0") {
                            return 'X';
                        } else {
                            return "";
                        }
                    }
                }, {
                    "data": "alarm_out_platform",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (data == "1") {
                            return 'V';
                        } else if (data == "0") {
                            return 'X';
                        } else {
                            return "";
                        }
                    }
                }, {
                    "data": "alarm_in_driver",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (row.alarm_source == 1) {
                            return "";
                        } else {
                            if (data == "1") {
                                return 'V';
                            } else if (data == "0") {
                                return 'X';
                            } else {
                                return "";
                            }
                        }
                    }
                }, {
                    "data": "alarm_out_driver",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (row.alarm_source == 1) {
                            return "";
                        } else {
                            if (data == "1") {
                                return 'V';
                            } else if (data == "0") {
                                return 'X';
                            } else {
                                return "";
                            }
                        }
                    }
                }, {
                    "data": "speed",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data;
                    }
                }, {
                    "data": "over_speed_last_time",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (row.alarm_source == 1) {
                            return "";
                        } else {
                            return data;
                        }
                    }
                }, {
                    "data": "travel_long_time",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (row.alarm_source == 1) {
                            return "";
                        } else {
                            return data;
                        }
                    }
                }, {
                    "data": "travel_small_time",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (row.alarm_source == 1) {
                            return "";
                        } else {
                            return data;
                        }
                    }
                }, {
                    "data": "open_door",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (row.alarm_source == 1) {
                            return "";
                        } else {
                            if (data == "0") {
                                return 'V';
                            } else if (data == "1") {
                                return 'X';
                            } else {
                                return "";
                            }
                        }
                    }
                }, {
                    "data": "communication_flag",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (row.alarm_source == 1) {
                            return "";
                        } else {
                            if (data == "0") {
                                return 'V';
                            } else if (data == "1") {
                                return 'X';
                            } else {
                                return "";
                            }
                        }
                    }
                }, {
                    "data": "gnss_flag",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (row.alarm_source == 1) {
                            return "";
                        } else {
                            if (data == "0") {
                                return 'V';
                            } else if (data == "1") {
                                return 'X';
                            } else {
                                return "";
                            }
                        }
                    }
                }

            ];
            //ajax参数
            var ajaxDataParamFun = function (d) {
                d.simpleQueryParam = $('#simpleQueryParam').val(); //模糊查询
                d.queryFenceIdStr = queryFenceId.unique3().join(",");
            };
            // 表格setting
            var bindSetting = {
                listUrl: "/gis/bindfence/list/",
                editUrl: "/clbs/m/functionconfig/fence/bindfence/editById",
                deleteUrl: "/clbs/m/functionconfig/fence/bindfence/delete_",
                deletemoreUrl: "/clbs/m/functionconfig/fence/bindfence/deletemore",
                enableUrl: "/clbs/c/user/enable_",
                disableUrl: "clbs/c/user/disable_",
                columnDefs: columnDefs, //表格列定义
                columns: columns, //表格列
                dataTableDiv: 'dataTableBind', //表格
                ajaxDataParamFun: ajaxDataParamFun, //ajax参数
                pageable: true, //是否分页
                showIndexColumn: true, //是否显示第一列的索引列
                enabledChange: true,
                pageNumber: 4,
                setPageNumber: false
            };
            // 创建表格
            myTable = new TG_Tabel.createNew(bindSetting);
            // 表格初始化
            myTable.init();
        },
        // 围栏绑定checked操作
        tableCheckAll: function () {
            $('input[name="subChk"]').prop("checked", this.checked);
        },
        // 电子围栏查询
        searchFenceCarSearch: function () {
            search_ztree('fenceDemo', 'searchFence', 'fence');
        },
        // 围栏隐藏
        fenceHidden: function (nodesId) {
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
        // 围栏显示
        fenceShow: function (nodesId, node) {
            if (fenceIDMap.containsKey(nodesId)) {
                var thisFence = fenceIDMap.get(nodesId);
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
                fenceOperation.getFenceDetail([node], map);
            }
            ;
            if (lineSpotMap.containsKey(nodesId)) {
                var thisStopArray = lineSpotMap.get(nodesId);
                for (var y = 0; y < thisStopArray.length; y++) {
                    thisStopArray[y].show();
                }
                ;
            }
            ;
        },
        // 分段点显示与否
        sectionPointState: function (nodesId, flag) {
            if (sectionPointMarkerMap.containsKey(nodesId)) {
                var thisPointMarker = sectionPointMarkerMap.get(nodesId);
                for (var i = 0; i < thisPointMarker.length; i++) {
                    if (flag) {
                        thisPointMarker[i].show();
                    } else {
                        thisPointMarker[i].hide();
                    }
                }
                ;
            }
            ;
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
                fenceOperation.fenceHidden(nodesId);
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
                        fenceOperation.sectionPointState(nodesId, false);
                        charFlag = false;
                    } else {
                        charFlag = true;
                        clickStateChar = nodesId;
                        zTree.checkNode(nodes[0], true, true);
                        nodes[0].checkedOld = true;
                        fenceOperation.fenceHidden(nodesId);
                        fenceOperation.getFenceDetail(nodes, map);
                        fenceOperation.sectionPointState(nodesId, true);
                    }
                } else {
                    charFlag = true;
                    clickStateChar = nodesId;
                    zTree.checkNode(nodes[0], true, true);
                    nodes[0].checkedOld = true;
                    fenceOperation.fenceHidden(nodesId);
                    fenceOperation.getFenceDetail(nodes, map);
                    fenceOperation.sectionPointState(nodesId, true);
                }
            }
            // 通过所选择的围栏节点筛选绑定列表
            fenceOperation.getcheckFenceNode(zTree);
            myTable.filter();
            myTable.requestData();
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
                    fenceOperation.sectionPointState(nodesId, true);
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
                    fenceOperation.sectionPointState(nodesId, false);
                }
                ;
            }
            ;
        },
        //当点击或选择围栏时，访问后台返回围栏详情
        getFenceDetail: function (fenceNode, showMap) {
            // ajax访问后端查询
            layer.load(2);
            $.ajax({
                type: "POST",
                url: "/gis/fence/bindfence/getFenceDetails",
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
                                var polygon_fillColor = dataList[i].fillColor == undefined ? "#1791fc" : dataList[i].fillColor;
                                var polygon_strokeColor = dataList[i].strokeColor == undefined ? "#FF33FF" : dataList[i].strokeColor;
                                if (fenceType == "zw_m_marker") { // 标注
                                    fenceOperation.drawMark(fenceData, showMap);
                                } else if (fenceType == "zw_m_line") { // 线
                                    fenceOperation.drawLine(fenceData, lineSpot, lineSegment, showMap);
                                } else if (fenceType == "zw_m_rectangle") { // 矩形
                                    fenceOperation.drawRectangle(fenceData, showMap);
                                } else if (fenceType == "zw_m_polygon") { // 多边形
                                    fenceOperation.drawPolygon(fenceData, showMap,polygon_fillColor,polygon_strokeColor);
                                } else if (fenceType == "zw_m_circle") { // 圆形
                                    fenceOperation.drawCircle(fenceData, showMap);
                                } else if (fenceType == "zw_m_administration") { // 行政区域
                                    var aId = dataList[0].aId
                                    fenceOperation.drawAdministration(fenceData, aId, showMap);
                                } else if (fenceType == "zw_m_travel_line") { // 行驶路线
                                    fenceOperation.drawTravelLine(fenceData, showMap, dataList[i].travelLine, wayPointArray);
                                }
                            }
                        }
                    }
                }
            });
        },
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
                type: "POST",
                async: false,
                url: "/gis/fence/managefence/previewFence",
                data: {"fenceIdShape": fenceId_shape_value},
                dataType: "json",
                success: function (data) {
                    if (data.success) {
                        var dataList = data.obj;
                        if (flag) {
                            width = dataList[0].line.width;
                        } else {
                            if (strs.length == 2) {
                                if (dataList != null && dataList.length > 0) {
                                    $("#myPageTop").hide();
                                    $("#result").hide();
                                    $(".fenceA").removeClass("fenceA-active");
                                    mouseTool.close(true);
                                    for (var i = 0; i < dataList.length; i++) {
                                        var fenceType = dataList[i].fenceType;
                                        var fenceData;
                                        var travelLine;
                                        var passPointData;
                                        if (fenceType == 'zw_m_travel_line') {
                                            travelLine = dataList[i].travelLine;
                                            passPointData = dataList[i].passPointData;
                                        } else {
                                            fenceData = dataList[i].fenceData;
                                        }
                                        ;
                                        var line = dataList[i].line;
                                        var lineSegment = dataList[i].lineSegment == undefined ? [] : dataList[i].lineSegment;
                                        var lineSpot = [];
                                        var polygon = dataList[i].polygon;
                                        // pwl polygon fillColor and strokeColor
                                        var polygon_fillColor = dataList[i].fillColor == undefined ? "#1791fc" : dataList[i].fillColor;
                                        var polygon_strokeColor = dataList[i].strokeColor == undefined ? "#FF33FF" : dataList[i].strokeColor;
                                        if (fenceType == "zw_m_marker") { // 标注
                                            layer.msg(fenceOperationLableEdit);
                                            map.off("rightclick", amendLine);
                                            map.off("rightclick", amendPolygon);
                                            map.off("rightclick", amendCircle);
                                            fenceOperation.drawMark(fenceData, map);
                                            polyFence.setDraggable(true);
                                            moveMarkerFenceId = fenceId;
                                            moveMarkerBackData = fenceData;
                                            polyFence.on("mouseup", fenceOperation.moveMarker);
                                        } else if (fenceType == "zw_m_line") { // 线
                                            // layer.confirm("是否重置该线路的分段？", {btn : ["是", "否"]}, function () {
                                            $("#lineId").val(fenceId);
                                            var url = "/clbs/m/functionconfig/fence/managefence/resetSegment";
                                            json_ajax("POST", url, "json", false, {"lineId": fenceId}, fenceOperation.resetSegment)
                                            layer.closeAll();
                                            if (fenceSectionPointMap.containsKey(fenceId)) {
                                                fenceSectionPointMap.remove(fenceId);
                                            }
                                            ;
                                            if (PolyEditorMap.containsKey(fenceId)) {
                                                PolyEditorMap.remove(fenceId);
                                            }
                                            ;
                                            var lineEditorObjArray = [];
                                            for (var i = 0; i < polyFence.length; i++) {
                                                var lineEditorObj = new AMap.PolyEditor(map, polyFence[i]);
                                                lineEditorObj.open();
                                                lineEditorObjArray.push(lineEditorObj);
                                            }
                                            ;
                                            PolyEditorMap.put(fenceId, lineEditorObjArray);
                                            //隐藏分段限速点
                                            if (sectionPointMarkerMap.containsKey(fenceId)) {
                                                var sectionPointMarkerMapValue = sectionPointMarkerMap.get(fenceId);
                                                for (var t = 0; t < sectionPointMarkerMapValue.length; t++) {
                                                    sectionPointMarkerMapValue[t].hide();
                                                }
                                                ;
                                                sectionPointMarkerMap.remove(fenceId);
                                            }
                                            ;
                                            if (lineSpotMap.containsKey(fenceId)) {
                                                var thisStopArray = lineSpotMap.get(fenceId);
                                                for (var i = 0; i < thisStopArray.length; i++) {
                                                    thisStopArray[i].hide();
                                                }
                                                ;
                                            }
                                            ;
                                            map.off("rightclick", amendCircle);
                                            map.off("rightclick", amendPolygon);
                                            amendLine = function () {
                                                fenceOperation.rightClickHandler(fenceType, line, fenceId);
                                            };
                                            map.on("rightclick", amendLine);
                                            //});
                                        } else if (fenceType == "zw_m_rectangle") { // 矩形
                                            layer.msg(fenceOperationAreaReelect);
                                            fenceOperation.drawRectangle(fenceData, map);
                                            mouseToolEdit.rectangle();
                                            rectangle = true;
                                            mouseToolEdit.on("draw", function (e) {
                                                if (!isAddFlag && !isAreaSearchFlag) {
                                                    var changeArray = e.obj.getPath();
                                                    var pointSeqs = ""; // 点序号
                                                    var longitudes = ""; // 所有的经度
                                                    var latitudes = ""; // 所有的纬度
                                                    var array = new Array();
                                                    if (changeArray) {
                                                        for (var i = 0; i < changeArray.length; i++) {
                                                            array.push([changeArray[i].lng, changeArray[i].lat]);
                                                        }
                                                        ;
                                                        $("#LUPointLngLat").val(array[0][0] + "," + array[0][1]);
                                                        if (array.length > 2) {
                                                            $("#RDPointLngLat").val(array[2][0] + "," + array[2][1]);
                                                        }
                                                        for (var i = 0; i < array.length; i++) {
                                                            $("#table-lng-lat tbody tr:nth-child(" + parseInt(i + 1) + ")").children("td:nth-child(2)").text(array[i][0]);
                                                            $("#table-lng-lat tbody tr:nth-child(" + parseInt(i + 1) + ")").children("td:nth-child(3)").text(array[i][1]);
                                                            pointSeqs += i + ","; // 点序号
                                                            longitudes += array[i][0] + ","; // 把所有的经度组合到一起
                                                            latitudes += array[i][1] + ","; // 把所有的纬度组合到一起
                                                        }
                                                    }
                                                    // 去掉点序号、经度、纬度最后的一个逗号
                                                    if (pointSeqs.length > 0) {
                                                        pointSeqs = pointSeqs.substr(0, pointSeqs.length - 1);
                                                    }
                                                    if (longitudes.length > 0) {
                                                        longitudes = longitudes.substr(0, longitudes.length - 1);
                                                    }
                                                    if (latitudes.length > 0) {
                                                        latitudes = latitudes.substr(0, latitudes.length - 1);
                                                    }
                                                    $("#addOrUpdateRectangleFlag").val("1"); // 修改矩形，给此文本框赋值为1
                                                    $("#rectangleId").val(fenceId); // 矩形区域id
                                                    // 矩形修改框弹出时给文本框赋值
                                                    $("#rectangleName").val(fenceData.name);
                                                    $("#rectangleType").val(fenceData.type);
                                                    $("#rectangleDescription").val(fenceData.description);
                                                    $("#pointSeqsRectangles").val(pointSeqs);
                                                    $("#longitudesRectangles").val(longitudes);
                                                    $("#latitudesRectangles").val(latitudes);
                                                    pageLayout.closeVideo();
                                                    setTimeout(function () {
                                                        $("#rectangle-form").modal("show");
                                                    }, 200);
                                                }
                                                ;
                                            });
                                            map.off("rightclick", amendLine);
                                            map.off("rightclick", amendPolygon);
                                            map.off("rightclick", amendCircle);
                                        } else if (fenceType == "zw_m_polygon") { // 多边形
                                            fenceOperation.drawPolygon(fenceData, map,polygon_fillColor,polygon_strokeColor);
                                            if (PolyEditorMap.containsKey(fenceId)) {
                                                PolyEditorMap.remove(fenceId);
                                            }
                                            ;
                                            var polygonEditorObj = new AMap.PolyEditor(map, polyFence);
                                            polygonEditorObj.open();
                                            PolyEditorMap.put(fenceId, polygonEditorObj);
                                            map.off("rightclick", amendCircle);
                                            map.off("rightclick", amendLine);
                                            amendPolygon = function () {
                                                fenceOperation.rightClickHandler(fenceType, polygon, fenceId);
                                            };
                                            map.on("rightclick", amendPolygon);
                                        } else if (fenceType == "zw_m_circle") { // 圆形
                                            fenceOperation.drawCircle(fenceData, map);
                                            if (PolyEditorMap.containsKey(fenceId)) {
                                                PolyEditorMap.remove(fenceId);
                                            }
                                            ;
                                            var circleEditorObj = new AMap.CircleEditor(map, polyFence);
                                            circleEditorObj.open();
                                            PolyEditorMap.put(fenceId, circleEditorObj);
                                            map.off("rightclick", amendLine);
                                            map.off("rightclick", amendPolygon);
                                            amendCircle = function () {
                                                $("#addOrUpdateCircleFlag").val("1"); // 修改圆，给此文本框赋值为1
                                                $("#circleId").val(fenceId); // 圆形区域id
                                                // 圆形区域修改框弹出时给文本框赋值
                                                $("#circleName").val(fenceData.name);
                                                $("#circleType").val(fenceData.type);
                                                $("#circleDescription").val(fenceData.description);
                                                var center = polyFence.getCenter();
                                                var radius = polyFence.getRadius();
                                                $("#circle-lng").attr("value", center.lng);
                                                $("#circle-lat").attr("value", center.lat);
                                                $("#circle-radius").attr("value", radius);
                                                $("#editCircleLng").val(center.lng);
                                                $("#editCircleLat").val(center.lat);
                                                $("#editCircleRadius").val(radius);
                                                pageLayout.closeVideo();
                                                setTimeout(function () {
                                                    $("#circleArea").modal("show")
                                                }, 200);
                                            }
                                            map.on("rightclick", amendCircle);
                                        } else if ("zw_m_administration" == fenceType) {

                                        } else if (fenceType == 'zw_m_travel_line') { //修改行驶路线
                                            isAddDragRoute = true;
                                            $('#addOrUpdateTravelFlag').val('1');
                                            var this_line_id = travelLine.id;
                                            $('#travelLineId').val(this_line_id);
                                            if (travelLineMap.containsKey(this_line_id)) {
                                                var this_fence = travelLineMap.get(this_line_id);
                                                map.remove([this_fence]);
                                                travelLineMap.remove(this_line_id);
                                            }
                                            ;
                                            var lineOffset = travelLine.lineOffset; //偏移量
                                            var lineType = travelLine.lineType;//围栏类型
                                            var lineName = travelLine.name; //围栏名称
                                            var description = travelLine.description;//描述信息
                                            $('#dragRouteLineName').val(lineName);
                                            $('#dragRouteType').val(lineType);
                                            $('#excursion').val(lineOffset);
                                            $('#dragRouteDescription').val(description);
                                            var start_lnglat = [travelLine.startLongitude, travelLine.startLatitude];
                                            var end_lnglat = [travelLine.endLongitude, travelLine.endLatitude];
                                            var pointArray = [];
                                            pointArray.push(start_lnglat);
                                            if (passPointData != undefined) {
                                                for (var j = 0, len = passPointData.length; j < len; j++) {
                                                    pointArray.push([passPointData[j].longitude, passPointData[j].latitude]);
                                                }
                                                ;
                                            }
                                            ;
                                            pointArray.push(end_lnglat);
                                            //逆地理编码
                                            fenceOperation.getAddressValue(pointArray, 0, []);
                                            $('#drivenRoute').show();
                                            //路径规划
                                            fenceOperation.madeDragRoute(pointArray);
                                        }
                                        ;
                                    }
                                }
                            } else {
                                fenceOperation.fenceDetails(dataList);
                            }
                            ;
                        }
                    } else {
                        layer.msg(data.msg);
                    }
                }
            });
            return width;
        },
        //修改时右键点击事件:type-围栏类型；data-当前修改需要回显的数据
        rightClickHandler: function (type, data, fenceId) {
            var changeArray;
            if (Array.isArray(polyFence)) {
                var lineAllArray = [];

                for (var j = 0; j < polyFence.length; j++) {
                    var changeLineArray = polyFence[j].getPath();
                    lineAllArray = lineAllArray.concat(changeLineArray);
                }
                ;
                changeArray = lineAllArray
            } else {
                changeArray = polyFence.getPath();
            }
            ;
            var pointSeqs = ""; // 点序号
            var longitudes = ""; // 所有的经度
            var latitudes = ""; // 所有的纬度
            var array = new Array();
            for (var i = 0; i < changeArray.length; i++) {
                array.push([changeArray[i].lng, changeArray[i].lat]);
            }
            ;
            for (var i = 0; i < array.length; i++) {
                $("#table-lng-lat tbody tr:nth-child(" + parseInt(i + 1) + ")").children("td:nth-child(2)").text(array[i][0]);
                $("#table-lng-lat tbody tr:nth-child(" + parseInt(i + 1) + ")").children("td:nth-child(3)").text(array[i][1]);
                pointSeqs += i + ","; // 点序号
                longitudes += array[i][0] + ","; // 把所有的经度组合到一起
                latitudes += array[i][1] + ","; // 把所有的纬度组合到一起
            }
            // 去掉点序号、经度、纬度最后的一个逗号
            if (pointSeqs.length > 0) {
                pointSeqs = pointSeqs.substr(0, pointSeqs.length - 1);
            }
            if (longitudes.length > 0) {
                longitudes = longitudes.substr(0, longitudes.length - 1);
            }
            if (latitudes.length > 0) {
                latitudes = latitudes.substr(0, latitudes.length - 1);
            }
            if (type == "zw_m_line") {
                $("#addOrUpdateLineFlag").val("1"); // 修改线路，给此文本框赋值为1
                $("#lineId").val(fenceId); // 线路id
                // 路线修改框弹出时给文本框赋值
                $("#lineName1").val(data.name);
                $("#lineType1").val(data.type);
                $("#lineWidth1").val(data.width);
                $("#lineDescription1").val(data.description);
                $("#pointSeqs").val(pointSeqs);
                $("#longitudes").val(longitudes);
                $("#latitudes").val(latitudes);
                pageLayout.closeVideo();
                setTimeout(function () {
                    $("#addLine").modal("show");
                }, 200);
            } else if (type == "zw_m_rectangle") {
                $("#addOrUpdateRectangleFlag").val("1"); // 修改矩形，给此文本框赋值为1
                $("#rectangleId").val(fenceId); // 矩形区域id
                // 矩形修改框弹出时给文本框赋值
                $("#rectangleName").val(data.name);
                $("#rectangleType").val(data.type);
                $("#rectangleDescription").val(data.description);
                $("#pointSeqsRectangles").val(pointSeqs);
                $("#longitudesRectangles").val(longitudes);
                $("#latitudesRectangles").val(latitudes);
                pageLayout.closeVideo();
                setTimeout(function () {
                    $("#rectangle-form").modal("show");
                }, 200);
            } else if (type == "zw_m_polygon") {
                var html = '';
                for (var i = 0; i < array.length; i++) {
                    html += '<div class="form-group">'
                        + '<label class="col-md-3 control-label">顶点' + (i + 1) + '经纬度：</label>'
                        + '<div class=" col-md-8">'
                        + '<input type="text" name="polygonPointLngLat" placeholder="请输入顶点经纬度" value="' + array[i][0] + "," + array[i][1] + '" class="form-control rectangleAllPointLngLat"/>'
                        + '</div>'
                        + '</div>'
                }
                ;
                $("#rectangleAllPointShow").html(html);
                $("#addOrUpdatePolygonFlag").val("1"); // 修改多边形，给此文本框赋值为1
                $("#polygonId").val(fenceId); // 多边形区域id
                // 多边形修改框弹出时给文本框赋值
                $("#polygonName").val(data.name);
                $("#polygonType").val(data.type);
                $("#polygonDescription").val(data.description);
                $("#pointSeqsPolygons").val(pointSeqs);
                $("#longitudesPolygons").val(longitudes);
                $("#latitudesPolygons").val(latitudes);
                // pwl add belongto
                $("#zTreeOrganSel").val(data.belongto)
                // pageLayout.closeVideo();
                setTimeout(function () {
                    console.log("timeout show?")
                    $("#myModal").modal("show");
                    $("#myModal").modal('show');
                    // pwl add edit belongto
                    customFucn.userTree();
                    $("#zTreeContent").hide();
                    console.log("data.dma_no",data.dma_no)
                    $("#dma_no_Val").val(data.dma_no)
                    // fenceOperation.initDMAList();
                }, 200);
            }
        },
        // 删除围栏
        deleteFence: function (treeNode) {
            var url = "/gis/fence/managefence/delete_/";// + treeNode.id + "/";
            layer.confirm(fenceOperationFenceDeleteConfirm, {
                btn: ['确定', '取消'],
                icon: 3,
                move: false,
                title: "操作确认",
            }, function (index) {
                json_ajax("POST", url, "json", true, {"fenceId":treeNode.id}, function (data) {
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
        //标注
        drawMark: function (mark, thisMap) {
            var markId = mark.id;
            if (fenceIDMap.containsKey(markId)) {
                var markerObj = fenceIDMap.get(markId);
                thisMap.remove(markerObj);
                fenceIDMap.remove(markId);
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
            fenceIDMap.put(markId, polyFence);
        },
        //线
        drawLine: function (line, lineSpot, lineSegment, thisMap) {
            var lineAllPointArray = [];
            for (var i = 0, len = line.length; i < len; i++) {
                lineAllPointArray.push([line[i].longitude, line[i].latitude]);
            }
            ;
            lineAllPointArray = lineAllPointArray.unique3();
            var startPointLatLng = [line[0].longitude, line[0].latitude];//起点坐标
            var endPointLatLng = [line[line.length - 1].longitude, line[line.length - 1].latitude];//终点坐标
            var lineId = line[0].lineId;
            $("#lineId").val(lineId);
            //是否存在线
            if (fenceIDMap.containsKey(lineId)) {
                var thisFence = fenceIDMap.get(lineId);
                if (Array.isArray(thisFence)) {
                    for (var i = 0; i < thisFence.length; i++) {
                        thisFence[i].hide();
                    }
                    ;
                } else {
                    thisFence.hide();
                }
                ;
                fenceIDMap.remove(lineId);
            }
            ;
            if (PolyEditorMap.containsKey(lineId)) {
                var mapEditFence = PolyEditorMap.get(lineId);
                if (Array.isArray(mapEditFence)) {
                    for (var i = 0; i < mapEditFence.length; i++) {
                        mapEditFence[i].close();
                    }
                    ;
                } else {
                    mapEditFence.close();
                }
                ;
            }
            ;
            var dataArr = new Array();
            if (line != null && line.length > 0) {
                for (var i in line) {
                    if (line[i].type == "0") {
                        dataArr[i] = [line[i].longitude, line[i].latitude];
                    }
                }
                var spotArray = [];
                for (var i = 0; i < lineSpot.length; i++) {
                    var dataArrm = [];
                    content = [];
                    content.push("名称：" + lineSpot[i].name);
                    content.push("经度：" + lineSpot[i].longitude);
                    content.push("维度：" + lineSpot[i].latitude);
                    content.push("达到时间：" + lineSpot[i].arriveTime);
                    content.push("离开时间：" + lineSpot[i].leaveTime);
                    content.push("描述：" + lineSpot[i].description);
                    content.push('<a id="jump" onClick="fenceOperation.deleteKeyPoint(\'' + lineSpot[i].id + '\')">删除</a>');
                    dataArrm.push(lineSpot[i].longitude);
                    dataArrm.push(lineSpot[i].latitude);
                    drawFence = new AMap.Marker({
                        position: dataArrm
                    });
                    drawFence.content = content.join("<br/>");
                    drawFence.setMap(thisMap);
                    thisMap.setFitView(drawFence);
                    spotArray.push(drawFence);
                    drawFence.on('click', amapOperation.markerClick);
                }
                if (lineSpotMap.containsKey(lineId)) {
                    var thisStopArray = lineSpotMap.get(lineId);
                    map.remove(thisStopArray);
                    lineSpotMap.remove(lineId);
                }
                ;
                lineSpotMap.put(lineId, spotArray);
                $.each(dataArr, function (index, item) {
                    // index是索引值（即下标）   item是每次遍历得到的值；
                    if (item == undefined) {
                        dataArr.splice(index, 1);
                    }
                });
            }
            var c = 1;
            var lineSectionArray = [];
            if (lineSegment.length != 0) {
                if (lineSegment.length != 0) {
                    c = 0;
                }
                ;
                var segment = [];
                for (var i = 0; i < lineSegment.length; i++) {
                    var segmentE = new Array();
                    var segmentLon = lineSegment[i].longitude.split(",")
                    var segmentLat = lineSegment[i].latitude.split(",")
                    for (var j = 0; j < segmentLon.length; j++) {
                        segmentE[j] = [Number(segmentLon[j]), Number(segmentLat[j])]
                    }
                    segment.push(segmentE)
                }
                ;
                if (sectionPointMarkerMap.containsKey(lineId)) {
                    var sectionPointMarkerMapValue = sectionPointMarkerMap.get(lineId);
                    for (var t = 0; t < sectionPointMarkerMapValue.length; t++) {
                        sectionPointMarkerMapValue[t].hide();
                    }
                    ;
                    sectionPointMarkerMap.remove(lineId);
                }
                ;
                var createSectionMarkerValue = [];
                for (var i = 0; i < segment.length; i++) {
                    if (segment[i].length > 1) {
                        var pointLatLng = segment[i][segment[i].length - 1];
                        var num = '<p class="sectionPointIcon">' + (i + 1) + '</p>';
                        var sectionMarker = new AMap.Marker({
                            icon: "../../resources/img/sectionPoint.png",
                            position: pointLatLng,
                            content: num,
                            offset: new AMap.Pixel(-10, -25)
                        });
                        sectionMarker.setMap(map);
                        createSectionMarkerValue.push(sectionMarker);
                        if (lineSegment[i].maximumSpeed >= 0 && lineSegment[i].maximumSpeed <= 40) {
                            var polyFencec = new AMap.Polyline({
                                path: segment[i], //设置线覆盖物路径
                                strokeColor: "#66CD00", //线颜色
                                strokeOpacity: 1, //线透明度
                                strokeWeight: 5, //线宽
                                strokeStyle: "dashed", //线样式
                                strokeDasharray: [10, 5]
                                //补充线样式
                            });
                            polyFencec.setMap(thisMap);
                            thisMap.setFitView(polyFencec);
                            lineSectionArray.push(polyFencec);
                        }
                        ;
                        if (lineSegment[i].maximumSpeed > 40 && lineSegment[i].maximumSpeed <= 80) {
                            var polyFencec = new AMap.Polyline({
                                path: segment[i], //设置线覆盖物路径
                                strokeColor: "#EEEE00", //线颜色
                                strokeOpacity: 1, //线透明度
                                strokeWeight: 5, //线宽
                                strokeStyle: "dashed", //线样式
                                strokeDasharray: [10, 5]
                                //补充线样式
                            });
                            polyFencec.setMap(thisMap);
                            thisMap.setFitView(polyFencec);
                            lineSectionArray.push(polyFencec);
                        }
                        if (lineSegment[i].maximumSpeed > 80 && lineSegment[i].maximumSpeed <= 100) {
                            var polyFencec = new AMap.Polyline({
                                path: segment[i], //设置线覆盖物路径
                                strokeColor: "#EE7600", //线颜色
                                strokeOpacity: 1, //线透明度
                                strokeWeight: 5, //线宽
                                strokeStyle: "dashed", //线样式
                                strokeDasharray: [10, 5]
                                //补充线样式
                            });
                            polyFencec.setMap(thisMap);
                            thisMap.setFitView(polyFencec);
                            lineSectionArray.push(polyFencec);
                        }
                        if (lineSegment[i].maximumSpeed > 100) {
                            var polyFencec = new AMap.Polyline({
                                path: segment[i], //设置线覆盖物路径
                                strokeColor: "#EE0000", //线颜色
                                strokeOpacity: 1, //线透明度
                                strokeWeight: 5, //线宽
                                strokeStyle: "dashed", //线样式
                                strokeDasharray: [10, 5]
                                //补充线样式
                            });
                            polyFencec.setMap(thisMap);
                            thisMap.setFitView(polyFencec);
                            lineSectionArray.push(polyFencec);
                        }
                    }
                    ;
                }
                ;
                sectionPointMarkerMap.put(lineId, createSectionMarkerValue);
                fenceIDMap.put(lineId, lineSectionArray);
            } else {
                var polyFencec = new AMap.Polyline({
                    path: dataArr, //设置线覆盖物路径
                    strokeColor: "#3366FF", //线颜色
                    strokeOpacity: c, //线透明度
                    strokeWeight: 5, //线宽
                    strokeStyle: "solid", //线样式
                    strokeDasharray: [10, 5],
                    zIndex: 51
                    //补充线样式
                });
                lineSectionArray.push(polyFencec);
                fenceIDMap.put(lineId, polyFencec);
                polyFencec.setMap(thisMap);
                thisMap.setFitView(polyFencec);
            }
            ;
            polyFence = lineSectionArray;
            if (isEdit) {
                for (var j = 0; j < polyFence.length; j++) {
                    var polyFenceList = polyFence[j];
                    //线单击
                    polyFenceList.on('click', function (e) {
                        if (map.getZoom() >= 16) {
                            var clickLng = e.lnglat.getLng();
                            var clickLat = e.lnglat.getLat();
                            var clickLngLat = [clickLng, clickLat];
                            if (sectionMarkerPointArray.containsKey(lineId)) {
                                var sectionValue = sectionMarkerPointArray.get(lineId);
                                var value = sectionValue[0];
                                var valueArray = [];
                                for (var m = 0; m < value.length; m++) {
                                    if (sectionValue[1] == false) {
                                        var index = lineAllPointArray.indexOf(value[m]);
                                        lineAllPointArray.splice(index, 1);
                                    } else {
                                        valueArray.push(value[m]);
                                    }
                                    ;
                                }
                                ;
                                valueArray.push(clickLngLat);
                                sectionMarkerPointArray.remove(lineId);
                                sectionMarkerPointArray.put(lineId, [valueArray, true]);
                            } else {
                                sectionMarkerPointArray.put(lineId, [[clickLngLat], true]);
                            }
                            ;
                            layer.confirm(fenceOperationOperationSelect, {
                                btn: ['关键点', '分段', '取消'],
                                closeBtn: 0,
                                btn3: function () {
                                    if (lineSegment.length == 0) {
                                        fenceOperation.sectionRateLimitingClose(lineId);
                                    }
                                    ;
                                },
                                id: 'lineClickOperation',
                                success: function (layero) {
                                    var btn = layero.find('.layui-layer-btn').children('.layui-layer-btn1').css({
                                        'border-color': '#4898d5',
                                        'background-color': '#2e8ded',
                                        'color': '#ffffff',
                                    });
                                },
                            }, function () {
                                layer.closeAll();
                                if (lineSegment.length == 0) {
                                    fenceOperation.sectionRateLimitingClose(lineId);
                                }
                                ;
                                $("#marking-lng").val(clickLng);
                                $("#marking-lat").val(clickLat);
                                $("#lineIDs").val(lineId);
                                pageLayout.closeVideo();
                                $('#addMonitoringTag').modal('show');
                            }, function () {
                                if (lineSegment.length != 0) {
                                    // layer.confirm("是否重置该线路的分段？", {btn : ["是", "否"]}, function () {
                                    $("#lineId").val(lineId);
                                    var url = "/clbs/m/functionconfig/fence/managefence/resetSegment"
                                    json_ajax("POST", url, "json", false, {"lineId": lineId}, fenceOperation.resetSegment);
                                    layer.closeAll();
                                    //清除分段点标注
                                    if (sectionPointMarkerMap.containsKey(lineId)) {
                                        var sectionPointMarkerMapValue = sectionPointMarkerMap.get(lineId);
                                        for (var t = 0; t < sectionPointMarkerMapValue.length; t++) {
                                            sectionPointMarkerMapValue[t].hide();
                                        }
                                        ;
                                        sectionPointMarkerMap.remove(lineId);
                                    }
                                    ;
                                    if (fenceSectionPointMap.containsKey(lineId)) {
                                        fenceSectionPointMap.remove(lineId);
                                    }
                                    ;
                                    //});
                                } else if (lineSegment.length == 0) {
                                    //把分段点区域的所有经纬度按顺序存在集合
                                    if (fenceSectionPointMap.containsKey(lineId)) {
                                        var sectionPointLatLng = [];//分段点经纬度集合
                                        var fenceSectionPointMapValue = fenceSectionPointMap.get(lineId);
                                        sectionPointLatLng.push(clickLngLat);
                                        //取出分段点经纬度存入
                                        for (var m = 0; m < fenceSectionPointMapValue.length; m++) {
                                            sectionPointLatLng.push(fenceSectionPointMapValue[m][fenceSectionPointMapValue[m].length - 1]);
                                        }
                                        ;
                                        //把点击的分段点经纬度加入路线经纬度集合中
                                        for (var i = 0, len = lineAllPointArray.length; i < len - 1; i++) {
                                            var twoPointDistance = new AMap.LngLat(lineAllPointArray[i][0], lineAllPointArray[i][1]).distance(lineAllPointArray[i + 1]);
                                            var clickPointDistance = new AMap.LngLat(lineAllPointArray[i][0], lineAllPointArray[i][1]).distance(clickLngLat) + new AMap.LngLat(lineAllPointArray[i + 1][0], lineAllPointArray[i + 1][1]).distance(clickLngLat);
                                            if (parseInt(twoPointDistance) == parseInt(clickPointDistance) || Math.abs(clickPointDistance - twoPointDistance) <= 3) {
                                                if (!(lineAllPointArray[i][0] == clickLngLat[0] && lineAllPointArray[i][1] == clickLngLat[1])) {
                                                    lineAllPointArray.splice(i + 1, 0, clickLngLat);
                                                    break;
                                                }
                                                ;
                                            }
                                            ;
                                        }
                                        ;
                                        fenceSectionPointMap.remove(lineId);
                                        var indexArray = [];
                                        //将各个分段点位置存入集合
                                        for (var n = 0; n < sectionPointLatLng.length; n++) {//循环分段点集合
                                            for (var s = 0, len = lineAllPointArray.length; s < len; s++) {//循环所有点
                                                if (lineAllPointArray[s][0] == sectionPointLatLng[n][0] && lineAllPointArray[s][1] == sectionPointLatLng[n][1]) {
                                                    indexArray.push(s);
                                                    continue;
                                                }
                                                ;
                                            }
                                            ;
                                        }
                                        ;
                                        var startIndex = 0;
                                        var sectionValue = [];
                                        //是否含有该ID标注,然后删除
                                        if (sectionPointMarkerMap.containsKey(lineId)) {
                                            var sectionPointMarkerMapValue = sectionPointMarkerMap.get(lineId);
                                            for (var t = 0; t < sectionPointMarkerMapValue.length; t++) {
                                                sectionPointMarkerMapValue[t].hide();
                                            }
                                            ;
                                            sectionPointMarkerMap.remove(lineId);
                                        }
                                        ;
                                        var markerPointMap = [];
                                        var indexSortArray = indexArray.sort(fenceOperation.sortNumber);
                                        for (var y = 0; y < indexSortArray.length; y++) {
                                            var end = Number(indexSortArray[y]);
                                            var section = lineAllPointArray.slice(startIndex, end + 1);
                                            startIndex = end;
                                            sectionValue.push(section);
                                            var pointLatLng = lineAllPointArray[indexSortArray[y]];
                                            var num = '<p class="sectionPointIcon">' + (y + 1) + '</p>';
                                            var sectionMarker = new AMap.Marker({
                                                icon: "../../resources/img/sectionPoint.png",
                                                position: pointLatLng,
                                                content: num,
                                                offset: new AMap.Pixel(-10, -25)
                                            });
                                            sectionMarker.setMap(map);
                                            markerPointMap.push(sectionMarker);
                                        }
                                        ;
                                        sectionPointMarkerMap.put(lineId, markerPointMap);
                                        fenceSectionPointMap.put(lineId, sectionValue);
                                    } else {
                                        //第一次存值
                                        for (var i = 0, len = lineAllPointArray.length; i < len - 1; i++) {
                                            var twoPointDistance = new AMap.LngLat(lineAllPointArray[i][0], lineAllPointArray[i][1]).distance(lineAllPointArray[i + 1]);
                                            var clickPointDistance = new AMap.LngLat(lineAllPointArray[i][0], lineAllPointArray[i][1]).distance(clickLngLat) + new AMap.LngLat(lineAllPointArray[i + 1][0], lineAllPointArray[i + 1][1]).distance(clickLngLat);
                                            if (parseInt(twoPointDistance) == parseInt(clickPointDistance) || Math.abs(clickPointDistance - twoPointDistance) <= 3) {
                                                if (!(lineAllPointArray[i][0] == clickLngLat[0] && lineAllPointArray[i][1] == clickLngLat[1])) {
                                                    lineAllPointArray.splice(i + 1, 0, clickLngLat);
                                                    var sectionValue = [];
                                                    var firstSection = lineAllPointArray.slice(0, i + 2);
                                                    sectionValue.push(firstSection);
                                                    var lastSection = lineAllPointArray.slice(i + 1, lineAllPointArray.length);
                                                    sectionValue.push(lastSection);
                                                    fenceSectionPointMap.put(lineId, sectionValue);
                                                    break;
                                                } else {
                                                    var firstSection = lineAllPointArray.slice(0, i + 1);
                                                    sectionValue.push(firstSection);
                                                    var lastSection = lineAllPointArray.slice(i + 1, lineAllPointArray.length);
                                                    sectionValue.push(lastSection);
                                                    fenceSectionPointMap.put(lineId, sectionValue);
                                                }
                                                ;
                                            }
                                            ;
                                        }
                                        ;
                                        //添加分段点图标
                                        var markerPointMap = [];
                                        for (var j = 0; j < 2; j++) {
                                            var num = '<p class="sectionPointIcon">' + (j + 1) + '</p>';
                                            var pointLatLng = [];
                                            if (j == 0) {
                                                pointLatLng = clickLngLat;
                                            } else {
                                                pointLatLng = lineAllPointArray[lineAllPointArray.length - 1];
                                            }
                                            ;
                                            var sectionMarker = new AMap.Marker({
                                                icon: "../../resources/img/sectionPoint.png",
                                                position: pointLatLng,
                                                content: num,
                                                offset: new AMap.Pixel(-10, -25)
                                            });
                                            sectionMarker.setMap(map);
                                            markerPointMap.push(sectionMarker);
                                        }
                                        ;
                                        sectionPointMarkerMap.put(lineId, markerPointMap);
                                    }
                                    ;
                                    var routMap = [];
                                    var sectionPointArray = fenceSectionPointMap.get(lineId);
                                    for (var i = 0; i < sectionPointArray.length; i++) {
                                        var array = [];
                                        for (var j = 0; j < sectionPointArray[i].length; j++) {
                                            array.push(sectionPointArray[i][j][0] + ";" + sectionPointArray[i][j][1]);
                                        }
                                        ;
                                        routMap.push(array);
                                    }
                                    ;
                                    layer.confirm(fenceOperationLineSubsection, {
                                        btn: ["完成", "继续分段"],
                                        closeBtn: 0
                                    }, function () {
                                        $("#lineId").val(lineId);
                                        var value = lineId + "#zw_m_line";
                                        var width = fenceOperation.updateFence(value, true);
                                        var str = "";
                                        var strc = "";
                                        layer.closeAll();
                                        for (var i = 0; i < routMap.length; i++) {
                                            var hrefs = "#route" + (i + 1);
                                            var rids = "route" + (i + 1);
                                            var lineIDmsid = "#lineIDms" + (i + 1);
                                            var lineIDms = "lineIDms" + (i + 1);
                                            var sectionlng = "section-lng" + (i + 1);
                                            var sectionlat = "section-lat" + (i + 1);
                                            if (i == 0) {
                                                str += '<li class="active" id="TabFenceBox"><a href="#route1" data-toggle="tab">路段1</a></li>'
                                                strc += '<div class="tab-pane active" id="route1">'
                                                strc += '<div class="form-group hidden">'
                                                strc += '&lt;!&ndash;<input type="hidden" id="addOrUpdateMarkerFlag" name="addOrUpdateMarkerFlag" value="" />&ndash;&gt;'
                                                strc += '<input id="lineIDms1" name="lineId" value=""/>'
                                                strc += '<input id="sumn" name="sumn" value=""/>'
                                                strc += '<div class="col-md-3">'
                                                strc += '<input  id="section-lng1"   name="longitude" value=""/>'
                                                strc += '</div>'
                                                strc += '<div class="col-md-3" >'
                                                strc += '<input id="section-lat1"   name="latitude" value=""/>'
                                                strc += '</div>'
                                                strc += '</div>'
                                                strc += '<div class="form-group">'
                                                strc += '<label class="col-md-5 control-label"><label class="text-danger">*</label> 偏移量(m)：</label>'
                                                strc += '<div class=" col-md-5">'
                                                strc += '<input type="text" placeholder="请输入偏移量" value="' + width + '" onkeyup="value=value.replace(/[^0-9]/g,\'\') " class="form-control" id="sectionOffset' + i + '" name="offset"/>'
                                                strc += '</div>'
                                                strc += '</div>'
                                                strc += '<div class="form-group">'
                                                strc += '<label class="col-md-5 control-label">路段行驶过长阈值(s)：</label>'
                                                strc += '<div class=" col-md-5">'
                                                strc += '<input type="text" placeholder="请输入路段行驶过长阈值" value="0" class="form-control" id="sectionLongThreshold' + i + '" name="overlengthThreshold"/>'
                                                strc += '</div>'
                                                strc += '</div>'
                                                strc += '<div class="form-group">'
                                                strc += '<label class="col-md-5 control-label">路段行驶不足阈值(s)：</label>'
                                                strc += '<div class=" col-md-5">'
                                                strc += '<input type="text" placeholder="请输入路段行驶不足阈值" value="0" class="form-control" id="sectionInsufficientThreshold' + i + '" name="shortageThreshold"/>'
                                                strc += '</div>'
                                                strc += '</div>'
                                                strc += '<div class="form-group">'
                                                strc += '<label class="col-md-5 control-label">路段最高速度（km/h）：</label>'
                                                strc += '<div class=" col-md-5">'
                                                strc += '<input type="text" placeholder="请输入路段最高速度" value="0" class="form-control" id="maxSpeed' + i + '" name="maximumSpeed"/>'
                                                strc += '</div>'
                                                strc += '</div>'
                                                strc += '<div class="form-group">'
                                                strc += '<label class="col-md-5 control-label">超速持续时间（s）：</label>'
                                                strc += '<div class=" col-md-5">'
                                                strc += '<input type="text" placeholder="请输入超速持续时间" value="0" class="form-control" id="durationSpeeding' + i + '" name="overspeedTime"/>'
                                                strc += '</div>'
                                                strc += '</div>';
                                                strc += '<div class="isQueryShow"><label>拐点数据 <span class="fa fa-chevron-up" aria-hidden="true"></span></label></div>';
                                                strc += '<div class="pointList">';
                                                for (var t = 0; t < routMap[i].length - 1; t++) {
                                                    var routMapArray = routMap[i][t].split(';');
                                                    var num = i + '' + t;
                                                    strc += '<div class="form-group sectionLngLat">'
                                                    strc += '<label class="col-md-2 control-label">经度：</label>'
                                                    strc += '<div class="col-md-3 sectionLng">'
                                                    strc += '<input type="text" id="piecewiseLng' + num + '" name="lng" placeholder="请输入经度值" value="' + routMapArray[0] + '" class="form-control" />'
                                                    strc += '</div>'
                                                    strc += '<label class="col-md-2 control-label">纬度：</label>'
                                                    strc += '<div class="col-md-3 sectionLat">'
                                                    strc += '<input type="text" id="piecewiseLat' + num + '" name="lat" placeholder="请输入纬度值" value="' + routMapArray[1] + '" class="form-control" />'
                                                    strc += '</div>'
                                                    if (t == 0) {
                                                        strc += '<button type="button" class="btn btn-primary addLngLat">'
                                                        strc += '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>'
                                                        strc += '</button>'
                                                    } else {
                                                        strc += '<button type="button" class="btn btn-danger removeLngLat">'
                                                        strc += '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>'
                                                        strc += '</button>'
                                                    }
                                                    ;
                                                    strc += '</div>'
                                                }
                                                ;
                                                strc += '</div>';
                                                strc += '</div>';
                                            } else {
                                                str += '<li id="TabFenceBox"><a href="' + hrefs + '" + data-toggle="tab">路段' + (i + 1) + '</a></li>'
                                                strc += '<div class="tab-pane" id="' + rids + '">'
                                                strc += '<div class="form-group hidden">'
                                                strc += '&lt;!&ndash;<input type="hidden" id="addOrUpdateMarkerFlag"  name="addOrUpdateMarkerFlag" value="" />&ndash;&gt;'
                                                strc += '<div class="col-md-3">'
                                                strc += '<input  id="' + sectionlng + '"    name="longitude" value=""/>'
                                                strc += '</div>'
                                                strc += '<div class="col-md-3" >'
                                                strc += '<input id="' + sectionlat + '"   name="latitude" value=""/>'
                                                strc += '</div>'
                                                strc += '</div>'
                                                strc += '<div class="form-group">'
                                                strc += '<label class="col-md-5 control-label"><label class="text-danger">*</label> 偏移量(m)：</label>'
                                                strc += '<div class=" col-md-5">'
                                                strc += '<input type="text" placeholder="请输入偏移量" value="' + width + '" onkeyup="value=value.replace(/[^0-9]/g,\'\') " class="form-control" id="sectionOffset' + i + '" name="offset"/>'
                                                strc += '</div>'
                                                strc += '</div>'
                                                strc += '<div class="form-group">'
                                                strc += '<label class="col-md-5 control-label">  路段行驶过长阈值(s)：</label>'
                                                strc += '<div class=" col-md-5">'
                                                strc += '<input type="text" placeholder="请输入路段行驶过长阈值" value="0" class="form-control" id="sectionLongThreshold' + i + '" name="overlengthThreshold"/>'
                                                strc += '</div>'
                                                strc += '</div>'
                                                strc += '<div class="form-group">'
                                                strc += '<label class="col-md-5 control-label">路段行驶不足阈值(s)：</label>'
                                                strc += '<div class=" col-md-5">'
                                                strc += '<input type="text" placeholder="请输入路段行驶不足阈值" value="0" class="form-control" id="sectionInsufficientThreshold' + i + '" name="shortageThreshold"/>'
                                                strc += '</div>'
                                                strc += '</div>'
                                                strc += '<div class="form-group">'
                                                strc += '<label class="col-md-5 control-label">路段最高速度（km/h）：</label>'
                                                strc += '<div class=" col-md-5">'
                                                strc += '<input type="text" placeholder="请输入路段最高速度" value="0" class="form-control" id="maxSpeed' + i + '" name="maximumSpeed"/>'
                                                strc += '</div>'
                                                strc += '</div>'
                                                strc += '<div class="form-group">'
                                                strc += '<label class="col-md-5 control-label">超速持续时间（s）：</label>'
                                                strc += '<div class=" col-md-5">'
                                                strc += '<input type="text" placeholder="请输入超速持续时间" value="0" class="form-control" id="durationSpeeding' + i + '" name="overspeedTime"/>'
                                                strc += '</div>'
                                                strc += '</div>';
                                                strc += '<div class="isQueryShow"><label>拐点数据 <span class="fa fa-chevron-up" aria-hidden="true"></span></label></div>';
                                                strc += '<div class="pointList">';
                                                if (i == routMap.length - 1) {
                                                    for (var t = 0; t < routMap[i].length; t++) {
                                                        var routMapArray = routMap[i][t].split(';');
                                                        var num = i + '' + t;
                                                        strc += '<div class="form-group sectionLngLat">'
                                                        strc += '<label class="col-md-2 control-label">经度：</label>'
                                                        strc += '<div class="col-md-3 sectionLng">'
                                                        strc += '<input type="text" id="piecewiseLng' + num + '" name="lng" placeholder="请输入经度值" value="' + routMapArray[0] + '" class="form-control" />'
                                                        strc += '</div>'
                                                        strc += '<label class="col-md-2 control-label">纬度：</label>'
                                                        strc += '<div class="col-md-3 sectionLat">'
                                                        strc += '<input type="text" id="piecewiseLat' + num + '" name="lat" placeholder="请输入纬度值" value="' + routMapArray[1] + '" class="form-control" />'
                                                        strc += '</div>'
                                                        if (t == 0) {
                                                            strc += '<button type="button" class="btn btn-primary addLngLat">'
                                                            strc += '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>'
                                                            strc += '</button>'
                                                        } else {
                                                            strc += '<button type="button" class="btn btn-danger removeLngLat">'
                                                            strc += '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>'
                                                            strc += '</button>'
                                                        }
                                                        ;
                                                        strc += '</div>'
                                                    }
                                                    ;
                                                } else {
                                                    for (var t = 0; t < routMap[i].length - 1; t++) {
                                                        var routMapArray = routMap[i][t].split(';');
                                                        strc += '<div class="form-group sectionLngLat">'
                                                        strc += '<label class="col-md-2 control-label">经度：</label>'
                                                        strc += '<div class="col-md-3 sectionLng">'
                                                        strc += '<input type="number" type="number" min="73.66" max="135.05" name="lng" placeholder="请输入经度值" value="' + routMapArray[0] + '" class="form-control" />'
                                                        strc += '</div>'
                                                        strc += '<label class="col-md-2 control-label">纬度：</label>'
                                                        strc += '<div class="col-md-3 sectionLat">'
                                                        strc += '<input type="number" min="3.86" max="53.55" name="lat" placeholder="请输入纬度值" value="' + routMapArray[1] + '" class="form-control" />'
                                                        strc += '</div>'
                                                        if (t == 0) {
                                                            strc += '<button type="button" class="btn btn-primary addLngLat">'
                                                            strc += '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>'
                                                            strc += '</button>'
                                                        } else {
                                                            strc += '<button type="button" class="btn btn-danger removeLngLat">'
                                                            strc += '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>'
                                                            strc += '</button>'
                                                        }
                                                        ;
                                                        strc += '</div>'
                                                    }
                                                    ;
                                                }
                                                ;
                                                strc += '</div>';
                                                strc += '</div>';
                                            }
                                        }
                                        $("#tenples").html(str);
                                        $("#pagecontent").html(strc);
                                        $(".addLngLat").unbind("click").bind("click", fenceOperation.addLngLat);
                                        $(".removeLngLat").unbind("click").bind("click", fenceOperation.removeLngLat);
                                        $(".isQueryShow").unbind("click").bind("click", fenceOperation.isQueryShow);
                                        $("#lineIDms1").attr("value", lineId);
                                        $("#sumn").attr("value", routMap.length);
                                        for (var i = 0; i < routMap.length; i++) {
                                            var sectionlng = "section-lng" + (i + 1);
                                            $("#" + sectionlng).attr("value", routMap[i] + "]");
                                        }
                                        pageLayout.closeVideo();
                                        $('#addMonitoringSection').modal('show');
                                    }, function () {
                                    });
                                }
                            });
                        } else {
                            thisMap.setZoomAndCenter(16, [e.lnglat.getLng(), e.lnglat.getLat()]);
                        }
                        ;
                    });
                }
                ;
            }
        },
        //删除关键点
        deleteKeyPoint: function (id) {
            infoWindow.close();
            var url = "/clbs/m/functionconfig/fence/bindfence/deleteKeyPoint";
            json_ajax("post", url, "json", false, {"kid": id}, fenceOperation.deleteKeyPointCallBack)
        },
        // 删除关键点更新围栏
        deleteKeyPointCallBack: function (data) {
            if (data.success == true) {
                fenceOperation.resetFance();
            } else {
                if (data.msg.toString().indexOf("系统错误") > -1) {
                    layer.msg(data.msg, {move: false});
                }
            }
        },
        //重置返回
        resetSegment: function (data) {
            if (data.success) {
                fenceOperation.resetFance()
            } else {
                if (data.msg.toString().indexOf("系统错误") > -1) {
                    layer.msg(data.msg, {move: false});
                }
            }
        },
        //新增修改成功重置围栏
        resetFance: function () {
            var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
            var lineFenceId = $("#lineId").val();
            var nodes = zTree.getNodesByParam('id', lineFenceId, null);
            // ajax访问后端查询
            layer.load(2);
            $.ajax({
                type: "POST",
                url: "/gis/fence/bindfence/getFenceDetails",
                async: false,
                data: {
                    "fenceNodes": JSON.stringify(nodes)
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
                            for (var i = 0; i < dataList.length; i++) {
                                var fenceType = dataList[i].fenceType;
                                var fenceData = dataList[i].fenceData;
                                var lineSpot = dataList[i].lineSpot;
                                var lineSegment = dataList[i].lineSegment == undefined ? [] : dataList[i].lineSegment;
                                var polygon_fillColor = dataList[i].fillColor == undefined ? "#1791fc" : dataList[i].fillColor;
                                var polygon_strokeColor = dataList[i].strokeColor == undefined ? "#FF33FF" : dataList[i].strokeColor;
                                if (fenceType == "zw_m_marker") { // 标注
                                    fenceOperation.drawMark(fenceData, map);
                                } else if (fenceType == "zw_m_line") { // 线
                                    fenceOperation.drawLine(fenceData, lineSpot, lineSegment, map);
                                } else if (fenceType == "zw_m_rectangle") { // 矩形
                                    fenceOperation.drawRectangle(fenceData, map);
                                } else if (fenceType == "zw_m_polygon") { // 多边形
                                    fenceOperation.drawPolygon(fenceData, map,polygon_fillColor,polygon_strokeColor);
                                } else if (fenceType == "zw_m_circle") { // 圆形
                                    fenceOperation.drawCircle(fenceData, map);
                                }
                            }
                        }
                    }
                }
            });
        },
        //矩形
        drawRectangle: function (rectangle, thisMap) {
            $("#LUPointLngLat").val(rectangle.leftLongitude + "," + rectangle.leftLatitude);
            $("#RDPointLngLat").val(rectangle.rightLongitude + "," + rectangle.rightLatitude);
            var rectangleId = rectangle.id;
            if (fenceIDMap.containsKey(rectangleId)) {
                var thisFence = fenceIDMap.get(rectangleId);
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
                fenceIDMap.put(rectangleId, polyFence);
            }
            ;
        },
        //多边形
        drawPolygon: function (polygon, thisMap,fillColor,strokeColor) {
            var polygonId = polygon[0].polygonId;
            if (fenceIDMap.containsKey(polygonId)) {
                var thisFence = fenceIDMap.get(polygonId);
                thisFence.hide();
                fenceIDMap.remove(polygonId);
            }
            ;
            if (PolyEditorMap.containsKey(polygonId)) {
                var mapEditFence = PolyEditorMap.get(polygonId);
                mapEditFence.close();
            }
            ;
            map.off("rightclick", amendPolygon);
            var dataArr = new Array();
            if (polygon != null && polygon.length > 0) {
                for (var i = 0; i < polygon.length; i++) {
                    dataArr.push([polygon[i].longitude, polygon[i].latitude]);
                }
            }
            ;
            var html = '';
            for (var i = 0; i < dataArr.length; i++) {
                html += '<div class="form-group">'
                    + '<label class="col-md-3 control-label">顶点' + (i + 1) + '经纬度：</label>'
                    + '<div class=" col-md-8">'
                    + '<input type="text" placeholder="请输入顶点经纬度" value="' + dataArr[i][0] + "," + dataArr[i][1] + '" class="form-control rectangleAllPointLngLat"/>'
                    + '</div>'
                    + '</div>'
            }
            ;
            $("#rectangleAllPointShow").html(html);
            polyFence = new AMap.Polygon({
                path: dataArr,//设置多边形边界路径
                strokeColor: strokeColor, // "#FF33FF", //线颜色
                strokeOpacity: 0.2, //线透明度
                strokeWeight: 3, //线宽
                fillColor: fillColor, // "#1791fc", //填充色
                fillOpacity: 0.35
                //填充透明度
            });
            polyFence.setMap(thisMap);
            thisMap.setFitView(polyFence);
            fenceIDMap.put(polygonId, polyFence);
        },
        //圆形
        drawCircle: function (circle, thisMap) {
            var circleId = circle.id;
            if (fenceIDMap.containsKey(circleId)) {
                var thisFence = fenceIDMap.get(circleId);
                thisFence.hide();
                fenceIDMap.remove(circleId);
            }
            ;
            if (PolyEditorMap.containsKey(circleId)) {
                var mapEditFence = PolyEditorMap.get(circleId);
                mapEditFence.close();
            }
            ;
            map.off("rightclick", amendCircle);
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
            fenceIDMap.put(circleId, polyFence);
        },
        // 树结构  围栏类型旁新增按钮
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
                        mouseToolEdit.close(true);
                        amapOperation.clearLabel();
                        isAddDragRoute = false;
                        $('#drivenRoute').hide();
                        $('.lngLat_show').children('span').attr('class', 'fa fa-chevron-up');
                        $('.pointList').hide();
                        $(".fenceA i").removeClass("active");
                        $(".fenceA span").css('color', '#5c5e62');
                        isAddFlag = true;
                        isAreaSearchFlag = false;
                        if (treeNode.name == "标注") {
                            layer.msg('请在地图上点出标注点', {time: 1000});
                            fenceOperation.clearMapMarker();
                            mouseTool.marker({offset: new AMap.Pixel(-9, -23)});
                        } else if (treeNode.name == "路线") {
                            layer.msg('请在地图上画出路线', {time: 1000});
                            isDistanceCount = false;
                            fenceOperation.clearLine();
                            mouseTool.polyline();
                        } else if (treeNode.name == "矩形") {
                            layer.msg('请在地图上画出矩形', {time: 1000});
                            fenceOperation.clearRectangle();
                            mouseTool.rectangle();
                            clickRectangleFlag = true;
                        } else if (treeNode.name == "圆形") {
                            layer.msg('请在地图上画出圆形', {time: 1000});
                            fenceOperation.clearCircle();
                            mouseTool.circle();
                        } else if (treeNode.name == "多边形") {
                            layer.msg('请在地图上画出多边形', {time: 1000});
                            fenceOperation.clearPolygon();
                            mouseTool.polygon();
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
                        amapOperation.clearLabel();
                        //关闭其它围栏修改功能
                        fenceOperation.closeFenceEdit();
                        isAddDragRoute = false;
                        $('#drivenRoute').hide();
                        $('.lngLat_show').children('span').attr('class', 'fa fa-chevron-up');
                        $('.pointList').hide();
                        mouseToolEdit.close(true);
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
                        $('#drivenRoute').hide();
                        infoWindow.close();
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
                        pageLayout.closeVideo();
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
        //关键点
        doSubmits1: function () {
            if (fenceOperation.validate_key()) {
                $("#monitoringTag").ajaxSubmit(function (data) {
                    data = JSON.parse(data);
                    if (data.success) {
                        $("#addMonitoringTag").modal("hide");
                        $("#monitoringTag").clearForm();
                        fenceOperation.resetFance();
                    } else {
                        layer.msg(data.msg, {move: false});
                    }
                });
            }
        },
        //分段监控
        doSubmitsMonitor: function () {
            fenceOperation.sectionRateLimitLngLat();
            fenceOperation.sectionThreadSave();
            if (fenceOperation.validate_Monitor()) {
                $("#monitoringSection").ajaxSubmit(function (data) {
                    data = JSON.parse(data);
                    if (data.success) {
                        $("#addMonitoringSection").modal("hide");
                        $("#monitoringSection").clearForm();
                        fenceOperation.resetFance();
                    } else {
                        layer.msg(data.msg, {move: false});
                    }
                });
            }
            ;
        },
        //分段限速提交前将修改后的经纬度塞值
        sectionRateLimitLngLat: function () {
            var thisLineID = $("#lineId").val();
            fenceOperation.clearLine();
            $("#lineId").val(thisLineID);
            var tableLength = $("#tenples li").length;
            var lineLng = '';
            var lineLat = '';
            var index = -1;
            var indexValue = '';
            for (var i = 0; i < tableLength; i++) {
                var id = 'route' + (i + 1);
                var listLength = $("#" + id).children('div.pointList').children('div.sectionLngLat').length;
                var value = '';
                if (i < tableLength - 1) {
                    for (var y = 0; y < listLength; y++) {
                        var getLng = $("#" + id).children('div.pointList').children('div.sectionLngLat:eq(' + y + ')').children('.sectionLng').children('input');
                        var lng = getLng.val() == '' ? getLng.attr('value') : getLng.val();
                        var getLat = $("#" + id).children('div.pointList').children('div.sectionLngLat:eq(' + y + ')').children('.sectionLat').children('input')
                        var lat = getLat.val() == '' ? getLat.attr('value') : getLat.val();
                        if (lng != '' && lat != '') {
                            lineLng += lng + ",";
                            lineLat += lat + ",";
                            index++;
                            indexValue += index + ",";
                            value += lng + ";" + lat + ",";
                        }
                        ;
                    }
                    ;
                    var nextID = 'route' + (i + 2);
                    var nextLngID = $("#" + nextID).children('div.pointList').children('div.sectionLngLat:eq(0)').children('.sectionLng').children('input');
                    var nextLng = nextLngID.val() == '' ? nextLngID.attr('value') : nextLngID.val();
                    var nextLatID = $("#" + nextID).children('div.pointList').children('div.sectionLngLat:eq(0)').children('.sectionLat').children('input');
                    var nextLat = nextLatID.val() == '' ? nextLatID.attr('value') : nextLatID.val();
                    if (nextLng != '' && nextLat != '') {
                        value += nextLng + ";" + nextLat + "]";
                    }
                    ;
                    var section = 'section-lng' + (i + 1);
                    $("#" + section).attr('value', value);
                } else {
                    for (var y = 0; y < listLength; y++) {
                        var getLng = $("#" + id).children('div.pointList').children('div.sectionLngLat:eq(' + y + ')').children('.sectionLng').children('input');
                        var lng = getLng.val() == '' ? getLng.attr('value') : getLng.val();
                        var getLat = $("#" + id).children('div.pointList').children('div.sectionLngLat:eq(' + y + ')').children('.sectionLat').children('input')
                        var lat = getLat.val() == '' ? getLat.attr('value') : getLat.val();
                        if (y != listLength - 1) {
                            if (lng != '' && lat != '') {
                                lineLng += lng + ",";
                                lineLat += lat + ",";
                                index++;
                                indexValue += index + ",";
                                value += lng + ";" + lat + ",";
                            }
                            ;
                        } else {
                            if (lng != '' && lat != '') {
                                lineLng += lng + ",";
                                lineLat += lat + ",";
                                index++;
                                indexValue += index + ",";
                                value += lng + ";" + lat + "]";
                            }
                            ;
                        }
                        ;
                    }
                    ;
                    var section = 'section-lng' + (i + 1);
                    $("#" + section).attr('value', value);
                }
                ;
            }
            ;
            lineLng = lineLng.substring(0, lineLng.length - 1);
            lineLat = lineLat.substring(0, lineLat.length - 1);
            indexValue = indexValue.substring(0, indexValue.length - 1);
            $("#pointSeqs").val(indexValue);
            $("#longitudes").val(lineLng);
            $("#latitudes").val(lineLat);
            fenceOperation.editLngLat();
        },
        //分段限速修改后的经纬度提交
        editLngLat: function () {
            var thisId = $("#lineId").val();
            $("#addOrUpdateLineFlag").val("1");
            var thisData = thisId + "#" + "zw_m_line";
            var thisParams = {"fenceIdShape": thisData};
            var url = "/gis/fence/managefence/previewFence";
            ajax_submit("POST", url, "json", true, thisParams, true, fenceOperation.editCallBack);
        },
        editCallBack: function (data) {
            if (data.success) {
                var datalist = data.obj[0];
                var text = datalist.line.description;
                var type = datalist.line.type;
                var width = datalist.line.width;
                var name = datalist.line.name;
                $("#lineWidth1").val(width);
                $("#lineDescription1").val(text);
                $("#lineType1").val(type);
                $("#lineName1").val(name);
            } else {
                layer.msg(data.msg, {move: false});
            }
        },
        //关键点验证
        validate_key: function () {
            return $("#monitoringTag").validate({
                rules: {
                    name: {
                        required: true,
                        maxlength: 20
                    },
                    arriveTime: {
                        required: true
                    },
                    leaveTime: {
                        required: true,
                        compareDate: "#arriveTime"
                    },
                    description: {
                        maxlength: 100
                    }
                },
                messages: {
                    name: {
                        required: fenceOperationPointNameNull,
                        maxlength: publicSize20
                    },
                    arriveTime: {
                        required: fenceOperationArriveTimeSelect,
                    },
                    leaveTime: {
                        required: fenceOperationLeaveTimeSelect,
                        compareDate: fenceOperationAlTimeCheck
                    },
                    description: {
                        maxlength: publicSize100
                    }
                }
            }).form();
        },
        //路段验证
        validate_Monitor: function () {
            return $("#monitoringSection").validate({
                ignore: '',
                rules: {
                    offset: {
                        required: true,
                        range: [0, 255],
                    },
                    overlengthThreshold: {
                        required: false,
                        range: [0, 65535],
                    },
                    shortageThreshold: {
                        required: false,
                        range: [0, 65535],
                    },
                    maximumSpeed: {
                        required: true,
                        range: [0, 65535],
                    },
                    overspeedTime: {
                        required: true,
                        range: [0, 65535],
                    },
                    lng: {
                        required: true,
                        range: [73.66, 135.05],
                    },
                    lat: {
                        required: true,
                        range: [3.86, 53.55],
                    },
                },
                messages: {
                    offset: {
                        required: fenceOperationOffsetNull,
                        maxlength: fenceOperationScope255
                    },
                    overlengthThreshold: {
                        required: fenceOperationOverLength,
                        range: fenceOperationScope65535,
                    },
                    shortageThreshold: {
                        required: fenceOperationTooShort,
                        range: fenceOperationScope65535,
                    },
                    maximumSpeed: {
                        required: fenceOperationMaxSpeed,
                        range: fenceOperationScope65535,
                    },
                    overspeedTime: {
                        required: fenceOperationOverSpeedTime,
                        range: fenceOperationScope65535,
                    },
                    lng: {
                        required: fenceOperationLongitudeNull,
                        range: fenceOperationLongitudeScope,
                    },
                    lat: {
                        required: fenceOperationLatitudeNull,
                        range: fenceOperationLatitudeScope,
                    },
                }
            }).form();
        },
        //图形画完回调事件
        createSuccess: function (data) {
            //区域查车成功后
            if ($("#queryClick i").hasClass("active")) {
                changeArray = data.obj.getBounds();
                var url = "/clbs/v/monitoring/regionalQuery";
                ajax_submit("POST", url, "json", true, null, true, fenceOperation.regionalQuery);
            }
            ;
            //标注
            if (data.obj.CLASS_NAME == "AMap.Marker") {
                $("#addOrUpdateMarkerFlag").val("0");
                var marker = data.obj.getPosition();
                $("#mark-lng").attr("value", marker.lng);
                $("#mark-lat").attr("value", marker.lat);
                pageLayout.closeVideo();
                $("#mark").modal('show');
            }
            ;
            //圆
            if (data.obj.CLASS_NAME == "AMap.Circle") {
                $("#addOrUpdateCircleFlag").val("0");
                var center = data.obj.getCenter();
                var radius = data.obj.getRadius();
                $("#circle-lng").attr("value", center.lng);
                $("#circle-lat").attr("value", center.lat);
                $("#circle-radius").attr("value", radius);
                $("#editCircleLng").val(center.lng);
                $("#editCircleLat").val(center.lat);
                $("#editCircleRadius").val(radius);
                pageLayout.closeVideo();
                $("#circleArea").modal('show');
            }
            ;
            if (data.obj.CLASS_NAME == "AMap.Polyline" || data.obj.CLASS_NAME == "AMap.Polygon") {
                var pointSeqs = ""; // 点序号
                var longitudes = ""; // 所有的经度
                var latitudes = ""; // 所有的纬度
                var array = new Array();
                var path = data.obj.getPath();
                for (var i = 0; i < path.length; i++) {
                    array.push([path[i].lng, path[i].lat]);
                }
                ;
                // 去除array中相邻的重复点
                array = fenceOperation.removeAdjoinRepeatPoint(array);
                var fileinfo = "";
                for (var i = 0; i < array.length; i++) {
                    fileinfo += '<tr>';
                    fileinfo += '<td>' + i + '</td>';
                    fileinfo += '<td>' + 'aa' + '</td>';
                    fileinfo += '<td>' + 'bb' + '</td>';
                    fileinfo += '</tr>';
                }
                ;
                $('#tal').html(fileinfo);
                //矩形判断
                for (var i = 0; i < array.length; i++) {
                    $("#table-lng-lat tbody tr:nth-child(" + parseInt(i + 1) + ")").children("td:nth-child(2)").text(array[i][0]);
                    $("#table-lng-lat tbody tr:nth-child(" + parseInt(i + 1) + ")").children("td:nth-child(3)").text(array[i][1]);
                    pointSeqs += i + ","; // 点序号
                    longitudes += array[i][0] + ","; // 把所有的经度组合到一起
                    latitudes += array[i][1] + ","; // 把所有的纬度组合到一起
                }
                // 去掉点序号、经度、纬度最后的一个逗号
                if (pointSeqs.length > 0) {
                    pointSeqs = pointSeqs.substr(0, pointSeqs.length - 1);
                }
                if (longitudes.length > 0) {
                    longitudes = longitudes.substr(0, longitudes.length - 1);
                }
                if (latitudes.length > 0) {
                    latitudes = latitudes.substr(0, latitudes.length - 1);
                }
                $("#pointSeqs").val(pointSeqs);
                $("#longitudes").val(longitudes);
                $("#latitudes").val(latitudes);
                $("#pointSeqsRectangles").val(pointSeqs);
                $("#longitudesRectangles").val(longitudes);
                $("#latitudesRectangles").val(latitudes);
                $("#pointSeqsPolygons").val(pointSeqs);
                $("#longitudesPolygons").val(longitudes);
                $("#latitudesPolygons").val(latitudes);
                //线
                if (data.obj.CLASS_NAME == "AMap.Polyline" && !isDistanceCount) {
                    $("#addOrUpdateLineFlag").val("0");
                    pageLayout.closeVideo();
                    $("#addLine").modal('show');
                }
                ;
                //矩形
                if (data.obj.CLASS_NAME == "AMap.Polygon" && clickRectangleFlag && isAddFlag) {
                    if (!isAreaSearchFlag) {
                        if (array.length < 4) {
                            return false;
                        } else {
                            $("#LUPointLngLat").val(array[0][0] + "," + array[0][1]);
                            $("#RDPointLngLat").val(array[2][0] + "," + array[2][1]);
                            $("#addOrUpdateRectangleFlag").val("0");
                            pageLayout.closeVideo();
                            $("#rectangle-form").modal('show');
                        }
                    }
                    ;
                }
                ;
                //多边形
                if (data.obj.CLASS_NAME == "AMap.Polygon" && !clickRectangleFlag && isAddFlag) {
                    if (!$("#queryClick i").hasClass("active")) {
                        var html = '';
                        for (var i = 0; i < array.length; i++) {
                            html += '<div class="form-group">'
                                + '<label class="col-md-3 control-label">顶点' + (i + 1) + '经纬度：</label>'
                                + '<div class=" col-md-8">'
                                + '<input type="text" placeholder="请输入顶点经纬度" value="' + array[i][0] + "," + array[i][1] + '" class="form-control rectangleAllPointLngLat"/>'
                                + '</div>'
                                + '</div>'
                        }
                        ;
                        $("#rectangleAllPointShow").html(html);
                        $("#zTreeContent").show();
                        $("#addOrUpdatePolygonFlag").val("0");
                        // fenceOperation.initDMAList();
                        
                        pageLayout.closeVideo();
                        
                        $("#myModal").modal('show');
                        customFucn.userTree();
                        $("#zTreeContent").hide();
                    }
                }
                ;
            }
            ;
        },
        regionalQuery: function (data) {
            $("#dataTable tbody").html('');
            var objRegional = data.obj;
            var isHasCar = false;
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            var html = '';
            var param = [];
            var select = [];//去重
            var sum = 0;
            for (var i = 0; i < objRegional.length; i++) {
                var longitude = objRegional[i][2];
                var latitude = objRegional[i][1];
                var flagssss = changeArray.contains([longitude, latitude]);
                if (flagssss == true) {
                    isHasCar = true;
                    var carMsgID = objRegional[i][0];//车辆ID
                    if (select.toString().indexOf(carMsgID) == -1) {
                        sum++;
                        var carName = objRegional[i][4];
                        var carGroup = objRegional[i][3];
                        var nodes = zTree.getNodesByParam("id", carMsgID, null);
                        for (var j = 0; j < nodes.length; j++) {
                            crrentSubV.push(objRegional[i][0]);
                            crrentSubName.push(objRegional[i][4]);
                            zTree.checkNode(nodes[j], true, true);
                            nodes[j].checkedOld = true;
                            zTree.updateNode(nodes[j]);
                        }
                        ;
                        cheakdiyuealls.push(carMsgID);
                        html += '<tr><td>' + carName + '</td><td>' + carGroup + '</td></tr>';
                        var obj = new Object();
                        obj.vehicleID = carMsgID;
                        param.push(obj)
                        select.push(carMsgID);
                    }
                }
                ;
            }
            ;
            $("#sumRegionalQuery").text("共计" + sum + "监控对象！");
            $("#dataTable tbody").html(html);
            if (isHasCar) {
                pageLayout.closeVideo();
                $("#areaSearchCar").modal('show');
                var requestStrS = {
                    "desc": {
                        "MsgId": 40964,
                        "UserName": $("#userName").text()
                    },
                    "data": param
                };
                cancelList = [];
                webSocket.subscribe(headers, "/user/" + $("#userName").text() + "/location", dataTableOperation.updateRealLocation, "/app/vehicle/location", requestStrS);
            } else {
                layer.msg(trackAreaMonitorNull);
                mouseTool.close(true);
                $("#queryClick i").removeClass("active");
                $("#queryClick span").css('color', '#5c5e62');
            }
            ;
        },
        //去除array中相邻的重复点
        removeAdjoinRepeatPoint: function (array) {
            //去除array中相邻的重复点
            var tempArray = new Array();
            if (null != array && array.length > 1) {
                tempArray.push([array[0][0], array[0][1]]);
                for (var i = 1; i < array.length; i++) {
                    var templongtitude = array[i][0];
                    var templatitude = array[i][1];
                    if (templongtitude == array[i - 1][0] && templatitude == array[i - 1][1]) {
                        continue;
                    } else {
                        tempArray.push([templongtitude, templatitude]);
                    }
                }
                array = tempArray;
            }
            return array;
        },
        //清空标注
        clearMapMarker: function () {
            $("#addOrUpdateMarkerFlag").val("0");
            $("#markerId").val("");
            $("#markerName").val("");
            $("#markerDescription").val("");
            $("#mark-lng").attr("value", "");
            $("#mark-lat").attr("value", "");
        },
        //清空线路
        clearLine: function () {
            $("#addOrUpdateLineFlag").val("0");
            $("#lineId").val("");
            $("#lineName1").val("");
            $("#lineWidth1").val("");
            $("#lineDescription1").val("");
            $("#pointSeqs").val("");
            $("#longitudes").val("");
            $("#latitudes").val("");
        },
        //清空矩形
        clearRectangle: function () {
            $("#addOrUpdateRectangleFlag").val("0");
            $("#rectangleId").val("");
            $("#rectangleName").val("");
            $("#rectangleDescription").val("");
            $("#pointSeqsRectangles").val("");
            $("#longitudesRectangles").val("");
            $("#latitudesRectangles").val("");
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
        //清空圆形
        clearCircle: function () {
            $("#addOrUpdateCircleFlag").val("0");
            $("#circleId").val("");
            $("#circleName").val("");
            $("#circleDescription").val("");
            $("#circle-lng").attr("value", "");
            $("#circle-lat").attr("value", "");
            $("#circle-radius").attr("value", "");
        },
        searchCarClose: function () {
            $("#areaSearchCar").modal('hide');
            $("#queryClick i").removeClass("active");
            $("#queryClick span").css('color', '#5c5e62');
            mouseTool.close(true);
        },
        //标注保存
        annotatedSave: function (thisBtn) {
            if (fenceOperation.validate_marker()) {
                thisBtn.disabled = true;
                $("#marker").ajaxSubmit(function (data) {
                    var datas = eval("(" + data + ")");
                    if (datas.success == true) {
                        saveFenceName = $('#markerName').val();
                        saveFenceType = 'zw_m_marker';
                        $("#mark").modal("hide");
                        mouseTool.close(true);
                        var markFenceID = $("#markerId").val();
                        fenceOperation.addNodes();
                        var markFence = fenceIDMap.get(markFenceID);
                        if (markFence != undefined) {
                            markFence.setDraggable(false);
                        }
                        ;
                        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
                        var nodes = zTree.getNodesByParam("id", markFenceID, null);
                        fenceOperation.getFenceDetail(nodes, map);
                    } else {
                        if (datas.msg == null) {
                            layer.msg(fenceOperationLableExist);
                        } else if (datas.msg != null) {
                            layer.msg(data.msg, {move: false});
                        }
                    }
                });
            }
            ;
        },
        //标注添加时验证
        validate_marker: function () {
            return $("#marker").validate({
                rules: {
                    name: {
                        required: true,
                        maxlength: 50
                    },
                    description: {
                        maxlength: 100
                    },
                    groupName: {
                        required: true,
                    },
                },
                messages: {
                    name: {
                        required: markerNameNull,
                        maxlength: publicSize50
                    },
                    description: {
                        maxlength: publicSize100
                    },
                    groupName: {
                        required: publicSelectGroupNull,
                    },
                }
            }).form();
        },
        //线保存
        threadSave: function (thisBtn) {
            if (fenceOperation.validate_line()) {
                layer.load(2);
                thisBtn.disabled = true;
                $("#addLineForm").ajaxSubmit(function (data) {
                    var datas = eval("(" + data + ")");
                    if (datas.success == true) {
                        isEdit = true;
                        $("#addLine").modal("hide");
                        saveFenceName = $('#lineName1').val();
                        saveFenceType = 'zw_m_line';
                        mouseTool.close(true);
                        var lineId = $("#lineId").val();
                        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
                        var node = zTree.getNodesByParam("id", lineId, null);
                        fenceOperation.getFenceDetail(node, map);
                        fenceOperation.addNodes();
                        map.off("rightclick", amendLine);
                        if (PolyEditorMap.containsKey(lineId)) {
                            var mapEditFence = PolyEditorMap.get(lineId);
                            if (Array.isArray(mapEditFence)) {
                                for (var i = 0; i < mapEditFence.length; i++) {
                                    mapEditFence[i].close();
                                }
                                ;
                            } else {
                                mapEditFence.close();
                            }
                            ;
                        }
                        ;
                    } else {
                        if (datas.msg == null) {
                            layer.msg(fenceOperationLineExist);
                            layer.closeAll('loading');
                        } else if (datas.msg != null) {
                            layer.msg(data.msg, {move: false});
                        }
                    }
                });
            }
            ;
        },
        sectionThreadSave: function () {
            if (fenceOperation.validate_line()) {
                $("#addLineForm").ajaxSubmit();
            }
            ;
        },
        //线路添加时验证
        validate_line: function () {
            return $("#addLineForm").validate({
                rules: {
                    name: {
                        required: true,
                        maxlength: 20
                    },
                    width: {
                        required: true,
                        range: [0, 255],
                    },
                    description: {
                        maxlength: 100
                    },
                    groupName: {
                        required: true,
                    }
                },
                messages: {
                    name: {
                        required: lineNameNull,
                        maxlength: publicSize20
                    },
                    width: {
                        required: fenceOperationOffsetNull,
                        maxlength: fenceOperationScope255
                    },
                    description: {
                        maxlength: publicSize100
                    },
                    groupName: {
                        required: publicSelectGroupNull,
                    }
                }
            }).form();
        },
        //矩形保存
        rectangleSave: function (thisBtn) {
            var nowLULnglat = $("#LUPointLngLat").val().split(',');
            var nowRDLngLat = $("#RDPointLngLat").val().split(',');
            $("#longitudesRectangles").attr('value', nowLULnglat[0] + "," + nowRDLngLat[0] + "," + nowRDLngLat[0] + "," + nowLULnglat[0]);
            $("#latitudesRectangles").attr('value', nowLULnglat[1] + "," + nowRDLngLat[1] + "," + nowRDLngLat[1] + "," + nowLULnglat[1]);
            if (fenceOperation.validate_rectangle()) {
                thisBtn.disabled = true;
                $("#rectangles").ajaxSubmit(function (data) {
                    var datas = eval("(" + data + ")");
                    if (datas.success == true) {
                        $("#rectangle-form").modal("hide");
                        saveFenceName = $('#rectangleName').val();
                        saveFenceType = 'zw_m_rectangle';
                        mouseToolEdit.close(true);
                        mouseTool.close(true);
                        var rectang_fenceId = $("#rectangleId").val();
                        if (rectang_fenceId != "") {
                            var thisFence = fenceIDMap.get(rectang_fenceId);
                            fenceIDMap.remove(rectang_fenceId);
                            thisFence.hide();
                        }
                        ;
                        fenceOperation.addNodes();
                    } else {
                        if (datas.msg == null) {
                            layer.msg(fenceOperationRectangleExist);
                        } else if (datas.msg != null) {
                            layer.msg(data.msg, {move: false});
                        }
                    }
                });
            }
        },
        //矩形添加时验证
        validate_rectangle: function () {
            return $("#rectangles").validate({
                rules: {
                    name: {
                        required: true,
                        maxlength: 20
                    },
                    type: {
                        required: false,
                        maxlength: 20
                    },
                    description: {
                        maxlength: 100
                    },
                    lnglatQuery_LU: {
                        required: true,
                        isLngLat: [[135.05, 53.55], [73.66, 3.86]],
                    },
                    lnglatQuery_RD: {
                        required: true,
                        isLngLat: [[135.05, 53.55], [73.66, 3.86]],
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
                        required: deviationNull,
                        maxlength: publicSize20
                    },
                    description: {
                        maxlength: publicSize100
                    },
                    lnglatQuery_LU: {
                        required: fenceOperationLoAlaNull,
                        isLngLat: fenceOperationLoAlaError,
                    },
                    lnglatQuery_RD: {
                        required: fenceOperationLoAlaNull,
                        isLngLat: fenceOperationLoAlaError,
                    },
                    groupName: {
                        required: publicSelectGroupNull
                    }
                },
            }).form();
        },
        //多边形保存
        polygonSave: function (thisBtn) {
            var polygonId = $("#polygonId").val();
            var rectanglePointMag = [];
            var allPointArray = [];
            $('.rectangleAllPointLngLat').each(function () {
                var value = $(this).val().split(',');
                var msgArray = [];
                msgArray.polygonId = polygonId;
                msgArray.longitude = value[0];
                msgArray.latitude = value[1];
                rectanglePointMag.push(msgArray);
                allPointArray.push(value);
            });
            var lngValue = '';
            var latValue = '';
            for (var i = 0, len = allPointArray.length; i < len; i++) {
                if (i != len - 1) {
                    lngValue += allPointArray[i][0] + ",";
                    latValue += allPointArray[i][1] + ",";
                } else {
                    lngValue += allPointArray[i][0];
                    latValue += allPointArray[i][1];
                }
                ;
            }
            ;
            $("#longitudesPolygons").attr('value', lngValue);
            $("#latitudesPolygons").attr('value', latValue);
            var polygonId = $("#polygonId").val();
            var rectanglePointMag = [];
            var allPointArray = [];
            $('.rectangleAllPointLngLat').each(function () {
                var value = $(this).val().split(',');
                var msgArray = [];
                msgArray.polygonId = polygonId;
                msgArray.longitude = value[0];
                msgArray.latitude = value[1];
                rectanglePointMag.push(msgArray);
                allPointArray.push(value);
            });
            var lngValue = '';
            var latValue = '';
            for (var i = 0, len = allPointArray.length; i < len; i++) {
                if (i != len - 1) {
                    lngValue += allPointArray[i][0] + ",";
                    latValue += allPointArray[i][1] + ",";
                } else {
                    lngValue += allPointArray[i][0];
                    latValue += allPointArray[i][1];
                }
                ;
            }
            ;
            $("#longitudesPolygons").attr('value', lngValue);
            $("#latitudesPolygons").attr('value', latValue);
            if (fenceOperation.validate_polygon()) {
                thisBtn.disabled = true;
                $("#polygons").ajaxSubmit(function (data) {
                    var datas = eval("(" + data + ")");
                    if (datas.success == true) {
                        $("#myModal").modal("hide");
                        saveFenceName = $('#polygonName').val();
                        saveFenceType = 'zw_m_polygon';
                        $(".fenceA").removeClass("fenceA-active");
                        mouseTool.close(true);
                        map.off("rightclick", amendPolygon);
                        var polygonId = $("#polygonId").val();
                        if (PolyEditorMap.containsKey(polygonId)) {
                            var mapEditFence = PolyEditorMap.get(polygonId);
                            mapEditFence.close();
                        }
                        ;
                        fenceOperation.addNodes();
                    } else {
                        if (datas.msg == null) {
                            layer.msg(fenceOperationPolygonExist);
                        } else {
                            layer.msg(datas.msg, {move: false});
                        }
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
        initDMAList:function(){
            var url="/dmam/getDmaSelect/";
            
            var parameter={"organ":organSelected};
            json_ajax("POST",url,"json",true,parameter, fenceOperation.initDMAListBack);
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
                    // if(dmalist[i].dma_no == dma_no_Val){
                    //     html+= '<option value="'+dmalist[i].dma_no+' selected="selected">'+dmalist[i].dma_name+'</option>'

                    // }else{
                        
                    //     html+= '<option value="'+dmalist[i].dma_no+'">'+dmalist[i].dma_name+'</option>'
                    // }
                    html+= '<option value="'+dmalist[i].dma_no+'">'+dmalist[i].dma_name+'</option>'


                }
                $("#dma_no").html(html);
            }

            $("#dma_no option").each(function (){
                if($(this).val()==dma_no_Val){ 
                $(this).attr("selected","selected"); 
            }});

            //DMAlist
            // var dmalist = data.obj;
            // // 初始化车辆数据
            // var dataList = {value: []};
            // if (dmalist !== null && dmalist.length > 0) {
            //     for (var i=0; i< dmalist.length; i++) {
            //         var obj = {};
            //         obj.id = dmalist[i].dma_no;
            //         obj.name = dmalist[i].dma_name;
            //         dataList.value.push(obj);
            //     }
                
            // }
            // $("#dma_no").bsSuggest({
            //     indexId: 1,  //data.value 的第几个数据，作为input输入框的内容
            //     indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
            //     idField: "id",
            //     keyField: "name",
            //     effectiveFields: ["name"],
            //     searchFields:["id"],
            //     data: dataList
            // }).on('onDataRequestSuccess', function (e, result) {
            // }).on('onSetSelectValue', function (e, keyword, data) {
            //     // 当选择参考车牌
            //     var dma_no_selected = keyword.id;
                
            // }).on('onUnsetSelectValue', function () {
            // });
        
        },
        initOrganList:function(){
            var url="/entm/user/oranizationSelectlist/";
            
            var parameter={};
            json_ajax("POST",url,"json",true,parameter, fenceOperation.initOrganListBack);
        },

        initOrganListBack: function(data){
            // console.log("dmalist",data);
            // var dma_no_Val = $("#dma_no_Val").val();
            // var html = '<option value="">未选择</option>'
            //         console.log("data.dma_no",dma_no_Val)
            // $("#dma_no").val(dma_no_Val)
            // // //DMAlist
            // var dmalist = data.obj;
            // // 初始化dma数据
            
            // if (dmalist.length > 0) {
            //     for (var i=0; i< dmalist.length; i++) {
            //         // if(dmalist[i].dma_no == dma_no_Val){
            //         //     html+= '<option value="'+dmalist[i].dma_no+' selected="selected">'+dmalist[i].dma_name+'</option>'

            //         // }else{
                        
            //         //     html+= '<option value="'+dmalist[i].dma_no+'">'+dmalist[i].dma_name+'</option>'
            //         // }
            //         html+= '<option value="'+dmalist[i].dma_no+'">'+dmalist[i].dma_name+'</option>'


            //     }
            //     $("#dma_no").html(html);
            // }

            // $("#dma_no option").each(function (){
            //     if($(this).val()==dma_no_Val){ 
            //     $(this).attr("selected","selected"); 
            // }});

            // DMAlist
            var organlist = data.obj;
            // 初始化车辆数据
            var dataList = {value: []};
            if (organlist !== null && organlist.length > 0) {
                for (var i=0; i< organlist.length; i++) {
                    var obj = {};
                    obj.id = organlist[i].id;
                    obj.name = organlist[i].name;
                    dataList.value.push(obj);
                }
                
            }
            $("#organSel").bsSuggest({
                indexId: 1,  //data.value 的第几个数据，作为input输入框的内容
                indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
                idField: "id",
                keyField: "name",
                effectiveFields: ["name"],
                searchFields:["id"],
                data: dataList,
                listStyle: {
                    'padding-top': 0,
                    'max-height': '375px',
                    'max-width': '800px',
                    'overflow': 'auto',
                    'width': 'auto',
                    'transition': '0.3s',
                    '-webkit-transition': '0.3s',
                    '-moz-transition': '0.3s',
                    '-o-transition': '0.3s'
                },                              //列表的样式控制
                listAlign: 'left',              //提示列表对齐位置，left/right/auto
            }).on('onDataRequestSuccess', function (e, result) {
            }).on('onSetSelectValue', function (e, keyword, data) {
                // 当选择参考车牌
                var dma_no_selected = keyword.id;
                
            }).on('onUnsetSelectValue', function () {
            });
        
        },
        //圆保存
        roundSave: function (thisBtn) {
            var circleLng = $("#editCircleLng").val();
            var circleLat = $("#editCircleLat").val();
            var circleRadius = $("#editCircleRadius").val();
            if (circleLng != '') {
                $("#circle-lng").attr('value', circleLng);
            }
            ;
            if (circleLat != '') {
                $("#circle-lat").attr('value', circleLat);
            }
            ;
            if (circleRadius != '') {
                $("#circle-radius").attr('value', circleRadius);
            }
            ;
            if (fenceOperation.validate_circle()) {
                thisBtn.disabled = true;
                $("#circles").ajaxSubmit(function (data) {
                    var datas = eval("(" + data + ")");
                    if (datas.success == true) {
                        $("#circleArea").modal("hide");
                        saveFenceName = $('#circleName').val();
                        saveFenceType = 'zw_m_circle';
                        mouseTool.close(true);
                        var circleId = $("#circleId").val();
                        if (PolyEditorMap.containsKey(circleId)) {
                            var mapEditFence = PolyEditorMap.get(circleId);
                            mapEditFence.close();
                        }
                        ;
                        map.off("rightclick", amendCircle);
                        fenceOperation.addNodes();
                    } else {
                        if (datas.msg == null) {
                            layer.msg(fenceOperationCircleExist);
                        } else if (datas.msg != null) {
                            layer.msg(data.msg, {move: false});
                        }
                    }
                });
            }
            ;
        },
        //圆形区域添加时验证
        validate_circle: function () {
            return $("#circles").validate({
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
                    centerPointLng: {
                        required: true,
                        isLng: [135.05, 53.55],
                    },
                    centerPointLat: {
                        required: true,
                        isLat: [73.66, 3.86],
                    },
                    centerRadius: {
                        required: true,
                        number: true,
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
                    centerPointLng: {
                        required: fenceOperationLongitudeNull,
                        isLng: fenceOperationLongitudeError,
                    },
                    centerPointLat: {
                        required: fenceOperationLatitudeNull,
                        isLat: fenceOperationLatitudeError,
                    },
                    centerRadius: {
                        required: fenceOperationCircleRadiusNull,
                        number: publicNumberNull,
                    },
                    groupName: {
                        required: publicSelectGroupNull
                    }
                }
            }).form();
        },
        //清除错误信息
        clearErrorMsg: function () {
            mouseTool.close(true);
            $("label.error").hide();
            $(".error").removeClass("error");
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
                    url: "/gis/bindfence/fenceTree/",
                    type: "post",
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
        //围栏绑定
        fenceBind: function (fenceId, fenceName, fenceInfoId, fenceIdstr) {
            fenceOperation.clearFenceBind();
            $("#fenceID").val(fenceId);
            $("#fenceName").val(fenceName);
            $("#fenceInfoId").val(fenceInfoId);
            pageLayout.closeVideo();
            $("#fenceBind").modal('show');
            fenceOperation.initBindFenceTree();

            // json_ajax("post", '/clbs/m/functionconfig/fence/bindfence/getVehicleIdsByFenceId', "json", false, {"fenceId": fenceIdstr}, function (data) {
            //     oldFencevehicleIds = data.obj;
            // })
            return false;
        },
        initBindFenceTree: function () {
            bindFenceSetChar = {
                async: {
                    url: fenceOperation.getFenceTreeUrl,
                    type: "post",
                    enable: true,
                    autoParam: ["id"],
                    dataType: "json",
                    otherParam: {"type": "multiple"},
                    dataFilter: fenceOperation.ajaxDataFilter
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
                    dblClickExpand: false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    beforeClick: fenceOperation.beforeClickFenceVehicle,
                    onAsyncSuccess: fenceOperation.zTreeVFenceOnAsyncSuccess,
                    beforeCheck: fenceOperation.zTreeBeforeCheck,
                    onCheck: fenceOperation.onCheckFenceVehicle,
                    onExpand: fenceOperation.zTreeOnExpand,
                    onNodeCreated: fenceOperation.zTreeOnNodeCreated,
                }
            };
            $.fn.zTree.init($("#treeDemoFence"), bindFenceSetChar, null);
        },
        getFenceTreeUrl: function (treeId, treeNode) {
            if (treeNode == null) {
                return "/clbs/m/functionconfig/fence/bindfence/alarmSearchTree";
            } else if (treeNode.type == "assignment") {
                return "/clbs/m/functionconfig/fence/bindfence/putMonitorByAssign?assignmentId=" + treeNode.id + "&isChecked=" + treeNode.checked + "&monitorType=allMonitor";
            }
        },
        ajaxDataFilter: function (treeId, parentNode, responseData) { //组织树预处理函数

            var treeObj = $.fn.zTree.getZTreeObj("treeDemoFence");
            if (responseData.msg) {
                var obj = JSON.parse(ungzip(responseData.msg));
                var data;
                if (obj.tree != null && obj.tree != undefined) {
                    data = obj.tree;
                    fenceSize = obj.size;
                } else {
                    data = obj
                }
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type == "group") {
                        data[i].open = true;
                    }
                }
            }
            return data;
        },
        beforeClickFenceVehicle: function (treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj("treeDemoFence");
            zTree.checkNode(treeNode, !treeNode.checked, null, true);
            return false;
        },
        zTreeBeforeCheck: function (treeId, treeNode) {
            var flag = true;
            if (!treeNode.checked) {
                if (treeNode.type == "group" || treeNode.type == "assignment") { //若勾选的为组织或分组
                    var zTree = $.fn.zTree.getZTreeObj("treeDemo"), nodes = zTree
                        .getCheckedNodes(true), v = "";
                    var nodesLength = 0;

                    json_ajax("post", "/clbs/a/search/getMonitorNum",
                        "json", false, {"id": treeNode.id, "type": treeNode.type}, function (data) {
                            if (data.success) {
                                nodesLength += data.obj;
                            } else {
                                layer.msg(treeCheckError);
                            }
                        });

                    //存放已记录的节点id(为了防止车辆有多个分组而引起的统计不准确)
                    var ns = [];
                    //节点id
                    var nodeId;
                    for (var i = 0; i < nodes.length; i++) {
                        nodeId = nodes[i].id;
                        if (nodes[i].type == "people" || nodes[i].type == "vehicle") {
                            //查询该节点是否在勾选组织或分组下，若在则不记录，不在则记录
                            var nd = zTree.getNodeByParam("tId", nodes[i].tId, treeNode);
                            if (nd == null && $.inArray(nodeId, ns) == -1) {
                                ns.push(nodeId);
                            }
                        }
                    }
                    nodesLength += ns.length;
                } else if (treeNode.type == "people" || treeNode.type == "vehicle") { //若勾选的为监控对象
                    var zTree = $.fn.zTree.getZTreeObj("treeDemo"), nodes = zTree
                        .getCheckedNodes(true), v = "";
                    var nodesLength = 0;
                    //存放已记录的节点id(为了防止车辆有多个分组而引起的统计不准确)
                    var ns = [];
                    //节点id
                    var nodeId;
                    for (var i = 0; i < nodes.length; i++) {
                        nodeId = nodes[i].id;
                        if (nodes[i].type == "people" || nodes[i].type == "vehicle") {
                            if ($.inArray(nodeId, ns) == -1) {
                                ns.push(nodeId);
                            }
                        }
                    }
                    nodesLength = ns.length + 1;
                }

                if (nodesLength > 5000) {
                    layer.msg(treeMaxLength5000);
                    flag = false;
                }
            }
            if (flag) {
                //若组织节点已被勾选，则是勾选操作，改变勾选操作标识
                if (treeNode.type == "group" && !treeNode.checked) {
                    checkFlag = true;
                }
            }
            return flag;
        },
        onCheckFenceVehicle: function (e, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj("treeDemoFence"), nodes = zTree
                .getCheckedNodes(true), v = "";
            //若为取消勾选则不展开节点
            if (treeNode.checked) {
                zTree.expandNode(treeNode, true, true, true, true); // 展开节点
            }
            // 记录勾选的节点
            var v = "";
            for (var i = 0, l = nodes.length; i < l; i++) {
                if (nodes[i].type == "vehicle" || nodes[i].type == "people") {
                    v += nodes[i].id + ",";
                }
            }
            vehicleFenceList = v;
        },
        zTreeOnExpand: function (event, treeId, treeNode) {
            //判断是否是勾选操作展开的树(是则继续执行，不是则返回)
            if (treeNode.type == "group" && !checkFlag) {
                return;
            }
            var treeObj = $.fn.zTree.getZTreeObj("treeDemoFence");
            // if (treeNode.children) {
            //     for (var i = 0, l = treeNode.children.length; i < l; i++) {
            //         treeObj.checkNode(treeNode.children[i], false, true);
            //         if ($.inArray(treeNode.children[i].id, oldFencevehicleIds) != -1) {
            //             console.log(treeNode.children[i].id)
            //             treeObj.checkNode(treeNode.children[i], true, true);
            //         }
            //     }
            // }
            //初始化勾选操作判断表示
            checkFlag = false;

            if (treeNode.type == "group") {
                var url = "/clbs/m/functionconfig/fence/bindfence/putMonitorByGroup";
                json_ajax("post", url, "json", false, {
                    "groupId": treeNode.id,
                    "isChecked": treeNode.checked,
                    "monitorType": "monitor"
                }, function (data) {
                    var result = data.obj;
                    if (result != null && result != undefined) {
                        $.each(result, function (i) {
                            var pid = i; //获取键值
                            var chNodes = result[i] //获取对应的value
                            var parentTid = fenceZTreeIdJson[pid][0];
                            var parentNode = treeObj.getNodeByTId(parentTid);
                            if (parentNode.children === undefined) {
                                treeObj.addNodes(parentNode, chNodes);
                            }
                        });
                    }
                })
            }
        },
        zTreeOnNodeCreated: function (event, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj("treeDemoFence");
            var id = treeNode.id.toString();
            var list = [];
            if (fenceZTreeIdJson[id] == undefined || fenceZTreeIdJson[id] == null) {
                list = [treeNode.tId];
                fenceZTreeIdJson[id] = list;
            } else {
                fenceZTreeIdJson[id].push(treeNode.tId)
            }
        },
        zTreeVFenceOnAsyncSuccess: function (event, treeId, treeNode, msg) {

            var treeObj = $.fn.zTree.getZTreeObj(treeId);
            // 更新节点数量
            treeObj.updateNodeCount(treeNode);
            // 默认展开200个节点
            var initLen = 0;
            notExpandNodeInit = treeObj.getNodesByFilter(assignmentNotExpandFilter);
            for (i = 0; i < notExpandNodeInit.length; i++) {
                treeObj.expandNode(notExpandNodeInit[i], true, true, false, true);
                initLen += notExpandNodeInit[i].children.length;
                if (initLen >= 200) {
                    break;
                }
            }

        },
        /**
         * 选中已选的节点
         */
        checkCurrentNodes: function (treeNode) {
            // var crrentSubV = vehicleFenceList.split(",");
            // var treeObj = $.fn.zTree.getZTreeObj("treeDemoFence");
            // if (treeNode != undefined && treeNode != null && treeNode.type === "assignment" && treeNode.children != undefined) {
            //     var list = treeNode.children;
            //     if (list != null && list.length > 0) {
            //         for (var j = 0; j < list.length; j++) {
            //             var znode = list[j];
            //             if (crrentSubV != null && crrentSubV != undefined && crrentSubV.length !== 0 && $.inArray(znode.id, crrentSubV) != -1) {
            //                 treeObj.checkNode(znode, true, true);
            //             }
            //         }
            //     }
            // }
            var treeObj = $.fn.zTree.getZTreeObj("treeDemoFence");
            if (treeNode.children) {
                for (var i = 0, l = treeNode.children.length; i < l; i++) {
                    if ($.inArray(treeNode.children[i].id, oldFencevehicleIds) != -1) {
                        treeObj.checkNode(treeNode.children[i], true, true);
                    }
                }
            }
        },
        //围栏绑定模糊查询
        searchVehicleSearch: function () {
            //search_ztree('treeDemoFence', 'searchVehicle','vehicle');
            if (fenceInputChange !== undefined) {
                clearTimeout(fenceInputChange);
            }
            ;
            fenceInputChange = setTimeout(function () {
                var param = $("#searchVehicle").val();
                if (param == '') {
                    fenceOperation.initBindFenceTree();
                } else {
                    fenceOperation.searchBindFenceTree(param);
                }
            }, 500);
        },
        ajaxQueryDataFilter: function (treeId, parentNode, responseData) {
            responseData = JSON.parse(ungzip(responseData));
            var list = [];
            if (vehicleFenceList != null && vehicleFenceList != undefined && vehicleFenceList != "") {
                var str = (vehicleFenceList.slice(vehicleFenceList.length - 1) == ',') ? vehicleFenceList.slice(0, -1) : vehicleFenceList;
                list = str.split(",");
            }
            return filterQueryResult(responseData, list);
        },
        //check选择
        checkAllClick: function () {
            if ($(this).prop("checked") === true) {
                $("#checkAll").attr("checked", true);
                $("#tableList input[type='checkbox']").prop("checked",
                    $(this).prop("checked"));
                $('#tableList tbody tr').addClass('selected');
                trid = [];
                for (i = 1; i < $("#tableList tr").length; i++) {
                    trid.push("list" + i);
                }
            } else {
                $("#checkAll").attr("checked", false);
                $("#tableList input[type='checkbox']").prop("checked", false);
                $('#tableList tbody tr').removeClass('selected');
                trid = [];
            }
        },
        // 点击添加(按围栏 )
        addBtnClick: function () {
            trid = [];
            // 动态添加表格
            vehicelTree = $.fn.zTree.getZTreeObj("treeDemoFence");
            vehicleNode = vehicelTree.getCheckedNodes();
            if (vehicleNode == null || vehicleNode.length == 0) {
                layer.msg(fenceOperationMonitorNull, {move: false});
            } else {
                var fenceName = $("#fenceName").val();
                var fenceInfoId = $("#fenceInfoId").val();
                // 先清空table 中的数据
                $("#tableList tbody").html("");
                // 去重
                vehicleNode = vehicleNode.unique2();
                var j = 1;
                for (var i = 0; i < vehicleNode.length; i++) {
                    if (vehicleNode[i].type == "vehicle" || vehicleNode[i].type == "people") {
                        j++;
                        var inRadioName = "Inradio" + j;
                        var outRadioName = "Outradio" + j;
                        var inDriverName = "InDriver" + j;
                        var outDriverName = "OutDriver" + j;
                        var sendFenceTypeName = "sendFenceType" + j;
                        var alarmSourceName = "alarmSourceName" + j;
                        var openDoorName = "openDoor" + j;
                        var communicationFlagName = "communicationFlag" + j;
                        var GNSSFlagName = "GNSSFlag" + j;
                        var fencetype = $("#fenceID").val();
                        var tr = "<tr id='list" + j + "'><td><input id='checkList" + j + "' type='checkbox' onclick='fenceOperation.checkboxis(this)'   name='thead'/></td><td>"
                            + fenceName
                            + "</td><td>"
                            + vehicleNode[i].name
                            + "</td><td><label name = 'fenceType' style='margin-bottom:0px;'>"
                            + fenceOperation.fencetypepid(fencetype, alarmSourceName)
                            + "</label></td>"
                            + fenceOperation.sendFenceTypeTd(fencetype, sendFenceTypeName)
                            + fenceOperation.alarmSourceCheck(fencetype, alarmSourceName)
                            + "<td id = 'startTime'><input id='startDatePlugin" + j + "' onclick='fenceOperation.selectDate(this)' style='width:120px;cursor:default;' class='form-control layer-date laydate-icon selectTime' name='startTime' readonly /></td>"
                            + "<td id = 'endTime'><input id='endDatePlugin" + j + "'onclick='fenceOperation.selectDate(this)' style='width:120px;cursor:default;'  class='form-control layer-date laydate-icon selectTime' name='endTime' readonly /></td>"
                            + "<td id = 'alarmStartDateTD'><input id='startTimeHMS" + j + "'onclick='fenceOperation.selectTime(this)' style='width:120px;cursor:default;'  class='form-control layer-date laydate-icon'  name='alarmStartDateTD'  readonly /></td>"
                            + "<td id = 'alarmEndDateTD'><input id='endTimeHMS" + j + "' onclick='fenceOperation.selectTime(this)' style='width:120px;cursor:default;'  class='form-control layer-date laydate-icon' name='alarmEndDateTD'  readonly /></td>"
                            + "<td id = 'alarmIn'><input type='radio' value = 1 checked name='" + inRadioName + "' id='" + inRadioName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + inRadioName + "'>是</label><input type='radio' value = 0 name='" + inRadioName + "' id='" + inRadioName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + inRadioName + "s'>否</label></td>"
                            + "<td id = 'alarmOut'><input type='radio'  value = 1 checked name='" + outRadioName + "' id='" + outRadioName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + outRadioName + "'>是</label><input type='radio'  value = 0 name='" + outRadioName + "' id='" + outRadioName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + outRadioName + "s'>否</label></td>"
                            + "<td id = 'alarmInDriver'><input type='radio' value = 1 checked name='" + inDriverName + "' id='" + inDriverName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + inDriverName + "'>是</label><input type='radio' value = 0 name='" + inDriverName + "' id='" + inDriverName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + inDriverName + "s'>否</label></td>"
                            + "<td id = 'alarmOutDriver'><input type='radio'  value = 1 checked name='" + outDriverName + "' id='" + outDriverName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + outDriverName + "'>是</label><input type='radio'  value = 0 name='" + outDriverName + "' id='" + outDriverName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + outDriverName + "s'>否</label></td>"
                            + "<td id='speed'><input type= 'number' name = 'speed' class='form-control'/></td>"
                            + "<td id='overSpeedLastTime'><input type= 'number' name = 'overSpeedLastTime' class='form-control'/></td>"
                            +
                            fenceOperation.travelLongAndSmallTime(fencetype)
                            +
                            fenceOperation.otherInfo(fencetype, openDoorName, communicationFlagName, GNSSFlagName)
                            + "<td class='hidden' id='fenceId'>"
                            + fenceInfoId
                            + "</td><td class='hidden' id = 'vehicleId'>"
                            + vehicleNode[i].id + "</td><td id = 'monitorType' class='hidden'>" + vehicleNode[i].type + "</td></tr>";
                        $("#tableList tbody").append(tr);
                        var checkRadio;
                        if (fencetype == "zw_m_administration" || fencetype == "zw_m_travel_line") {
                            checkRadio = $("input[name=" + alarmSourceName + "]")[1];
                        } else {
                            checkRadio = $("input[name=" + alarmSourceName + "]")[0];
                        }
                        if ($(checkRadio).val() == 1) {
                            $("#tableList tbody tr").find("#sendFenceType,#alarmInDriver,#alarmOutDriver,#overSpeedLastTime,#travelLongTime,#travelSmallTime,#openDoor,#communicationFlag,#GNSSFlag").css('opacity', '0');
                        }
                    }
                }
                fenceOperation.accordingToFenceTypeSHTable(fencetype);
                // 区分终端报警平台报警
                $("input[name*='alarmSourceName']").change(function () {
                    var value = $(this).val();
                    var p_tr = $(this).parent().parent();
                    if (value == 1) { // 若为平台报警，禁用与终端报警相关的参数
                        p_tr.children("td#sendFenceType").css('opacity', '0');
                        p_tr.children("td#alarmInDriver").css('opacity', '0');
                        p_tr.children("td#alarmOutDriver").css('opacity', '0');
                        p_tr.children("td#overSpeedLastTime").css('opacity', '0');
                        p_tr.children("td#travelLongTime").css('opacity', '0');
                        p_tr.children("td#travelSmallTime").css('opacity', '0');
                        p_tr.children("td#openDoor").css('opacity', '0');
                        p_tr.children("td#communicationFlag").css('opacity', '0');
                        p_tr.children("td#GNSSFlag").css('opacity', '0');
                    } else {
                        p_tr.children("td#sendFenceType").css('opacity', '1');
                        p_tr.children("td#alarmInDriver").css('opacity', '1');
                        p_tr.children("td#alarmOutDriver").css('opacity', '1');
                        p_tr.children("td#overSpeedLastTime").css('opacity', '1');
                        p_tr.children("td#travelLongTime").css('opacity', '1');
                        p_tr.children("td#travelSmallTime").css('opacity', '1');
                        p_tr.children("td#openDoor").css('opacity', '1');
                        p_tr.children("td#communicationFlag").css('opacity', '1');
                        p_tr.children("td#GNSSFlag").css('opacity', '1');
                    }
                });
            }
        },
        // 根据围栏类型显示隐藏数据表格内容
        accordingToFenceTypeSHTable: function (fenceType) {
            if (fenceType == "zw_m_rectangle" || fenceType == "zw_m_circle" || fenceType == "zw_m_polygon" || fenceType == "zw_m_administration") {
                $("#openDoor,#communicationFlag,#GNSSFlag").removeClass("hidden");
                $("#tableList thead tr th:nth-child(19)").removeClass("hidden");
                $("#tableList thead tr th:nth-child(20)").removeClass("hidden");
                $("#tableList thead tr th:nth-child(21)").removeClass("hidden");
                $("#travelLongTime,#travelSmallTime").addClass("hidden");
                $("#tableList thead tr th:nth-child(17)").addClass("hidden");
                $("#tableList thead tr th:nth-child(18)").addClass("hidden");
            }
            else if (fenceType == "zw_m_line" || fenceType == "zw_m_travel_line") {
                $("#travelLongTime,#travelSmallTime").removeClass("hidden");
                $("#tableList thead tr th:nth-child(17)").removeClass("hidden");
                $("#tableList thead tr th:nth-child(18)").removeClass("hidden");
                $("#openDoor,#communicationFlag,#GNSSFlag").addClass("hidden");
                $("#tableList thead tr th:nth-child(19)").addClass("hidden");
                $("#tableList thead tr th:nth-child(20)").addClass("hidden");
                $("#tableList thead tr th:nth-child(21)").addClass("hidden");
            }
            else {
                $("#travelLongTime,#travelSmallTime,#openDoor,#communicationFlag,#GNSSFlag").removeClass("hidden");
                $("#tableList thead tr th:nth-child(17)").removeClass("hidden");
                $("#tableList thead tr th:nth-child(18)").removeClass("hidden");
                $("#tableList thead tr th:nth-child(19)").removeClass("hidden");
                $("#tableList thead tr th:nth-child(20)").removeClass("hidden");
                $("#tableList thead tr th:nth-child(21)").removeClass("hidden");
            }
        },
        //点击解绑按围栏
        removeBtnClick: function () {
            if ($("#checkAll").attr("checked") == "checked") {
                for (var k = 0; k <= vehicleNode.length; k++) {
                    trid.push($("#list" + k))
                    $("#list" + k).remove();
                }
                $("#checkAll").attr("checked", false)
            } else {
                if (trid.length == 0) {
                    layer.msg(userDeleteChooseNull, {move: false});
                }
                for (var i = 0; i < trid.length; i++) {
                    $("#" + trid[i]).remove();
                }
            }
            trid = [];
        },
        //依例全设
        setAllClick: function () {
            var i = 0;
            var setSendFenceType = '';
            var setalarmSource = '';
            var setalarmIn = '';
            var setalarmOut = '';
            var setalarmInDriver = '';
            var setalarmOutDriver = '';
            var setOpenDoor = '';
            var setCommunicationFlag = '';
            var setGNSSFlag = '';
            var startTimeVal = '';
            var endTimeVal = '';
            var nameSendFenceType = '';
            var nameAlarmSource = '';
            var namein = '';
            var nameout = '';
            var nameinDriver = '';
            var nameoutDriver = '';
            var nameOpenDoor = '';
            var nameCommunicationFlag = '';
            var nameGNSSFlag = '';
            var startDateVal = '';
            var endDateVal = '';
            var speedVal = '';
            var overSpeedLastTimeVal = '';
            var travelLongTimeVal = '';
            var travelSmallTimeVal = '';
            var fenceType = $("#" + trid[0]).children("td").eq(3).find("label").text();
            if (trid.length < 1) {
                layer.msg("请选择一项！")
            } else if (trid.length > 1) {
                layer.msg("只能选择一项！")
            } else {
                if ($("#" + trid[0]).children("td").eq(4).id = "sendFenceType") {
                    nameSendFenceType = $("#" + trid[0]).children("td").eq(4).find("input").attr("name")
                    setSendFenceType = $('input[name="' + nameSendFenceType + '"]:checked').val();
                }
                if ($("#" + trid[0]).children("td").eq(5).id = "alarmSource") {
                    nameAlarmSource = $("#" + trid[0]).children("td").eq(5).find("input").attr("name")
                    setalarmSource = $('input[name="' + nameAlarmSource + '"]:checked').val();
                }
                if ($("#" + trid[0]).children("td").eq(6).find("input").val() != null) {
                    startTimeVal = $("#" + trid[0]).children("td").eq(6).find("input").val();
                }
                if ($("#" + trid[0]).children("td").eq(7).find("input").val() != null) {
                    endTimeVal = $("#" + trid[0]).children("td").eq(7).find("input").val();
                }
                if ($("#" + trid[0]).children("td").eq(8).find("input").val() != null) {
                    startDateVal = $("#" + trid[0]).children("td").eq(8).find("input").val();
                }
                if ($("#" + trid[0]).children("td").eq(9).find("input").val() != null) {
                    endDateVal = $("#" + trid[0]).children("td").eq(9).find("input").val();
                }
                if ($("#" + trid[0]).children("td").eq(10).id = "alarmIn") {
                    namein = $("#" + trid[0]).children("td").eq(10).find("input").attr("name")
                    setalarmIn = $('input[name="' + namein + '"]:checked').val();
                }
                if ($("#" + trid[0]).children("td").eq(11).id = "alarmOut") {
                    nameout = $("#" + trid[0]).children("td").eq(11).find("input").attr("name")
                    setalarmOut = $('input[name="' + nameout + '"]:checked').val();
                }
                if ($("#" + trid[0]).children("td").eq(12).id = "alarmInDriver") {
                    nameinDriver = $("#" + trid[0]).children("td").eq(12).find("input").attr("name")
                    setalarmInDriver = $('input[name="' + nameinDriver + '"]:checked').val();
                }
                if ($("#" + trid[0]).children("td").eq(13).id = "alarmOutDriver") {
                    nameoutDriver = $("#" + trid[0]).children("td").eq(13).find("input").attr("name")
                    setalarmOutDriver = $('input[name="' + nameoutDriver + '"]:checked').val();
                }

                if ($("#" + trid[0]).children("td").eq(14).find("input").val() != null) {
                    speedVal = $("#" + trid[0]).children("td").eq(14).find("input").val();
                }
                if ($("#" + trid[0]).children("td").eq(15).find("input").val() != null) {
                    overSpeedLastTimeVal = $("#" + trid[0]).children("td").eq(15).find("input").val();
                }
                if ($("#" + trid[0]).children("td").eq(16).find("input").val() != null) {
                    travelLongTimeVal = $("#" + trid[0]).children("td").eq(16).find("input").val();
                }
                if ($("#" + trid[0]).children("td").eq(17).find("input").val() != null) {
                    travelSmallTimeVal = $("#" + trid[0]).children("td").eq(17).find("input").val();
                }
                if ($("#" + trid[0]).children("td").eq(18).id = "openDoor") {
                    nameOpenDoor = $("#" + trid[0]).children("td").eq(18).find("input").attr("name")
                    setOpenDoor = $('input[name="' + nameOpenDoor + '"]:checked').val();
                }
                if ($("#" + trid[0]).children("td").eq(19).id = "communicationFlag") {
                    nameCommunicationFlag = $("#" + trid[0]).children("td").eq(19).find("input").attr("name")
                    setCommunicationFlag = $('input[name="' + nameCommunicationFlag + '"]:checked').val();
                }
                if ($("#" + trid[0]).children("td").eq(20).id = "GNSSFlag") {
                    nameGNSSFlag = $("#" + trid[0]).children("td").eq(20).find("input").attr("name")
                    setGNSSFlag = $('input[name="' + nameGNSSFlag + '"]:checked').val();
                }
                for (i = 2; i <= $("#tableList tr").length; i++) {
                    var tds = $("#tableList tr")[i - 1]
                    $(tds).each(function () {
                        var td = this;
                        if (fenceType != "路线" && fenceType != "多边形") {
                            if (setSendFenceType == 0) {
                                $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(0).prop("checked", true);
                                $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(1).prop("checked", false)
                                $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(2).prop("checked", false)
                            } else if (setSendFenceType == 1) {
                                $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(0).prop("checked", false);
                                $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(1).prop("checked", true)
                                $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(2).prop("checked", false)
                            } else if (setSendFenceType == 2) {
                                $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(0).prop("checked", false);
                                $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(1).prop("checked", false)
                                $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(2).prop("checked", true)
                            }
                        }
                        if (setalarmIn == 1) {
                            $(td).find('input[name="Inradio' + i + '"][type="radio"]').eq(0).prop("checked", true);
                            $(td).find('input[name="Inradio' + i + '"][type="radio"]').eq(1).prop("checked", false)
                        } else if (setalarmIn == 0) {
                            $(td).find('input[name="Inradio' + i + '"][type="radio"]').eq(1).prop("checked", true);
                            $(td).find('input[name="Inradio' + i + '"][type="radio"]').eq(0).prop("checked", false)
                        }
                        if (setalarmOut == 1) {
                            $(td).find('input[name="Outradio' + i + '"][type="radio"]').eq(0).prop("checked", true);
                            $(td).find('input[name="Outradio' + i + '"][type="radio"]').eq(1).prop("checked", false)
                        } else if (setalarmOut == 0) {
                            $(td).find('input[name="Outradio' + i + '"][type="radio"]').eq(1).prop("checked", true);
                            $(td).find('input[name="Outradio' + i + '"][type="radio"]').eq(0).prop("checked", false)
                        }
                        if (setalarmInDriver == 1) {
                            $(td).find('input[name="InDriver' + i + '"][type="radio"]').eq(0).prop("checked", true);
                            $(td).find('input[name="InDriver' + i + '"][type="radio"]').eq(1).prop("checked", false)
                        } else if (setalarmInDriver == 0) {
                            $(td).find('input[name="InDriver' + i + '"][type="radio"]').eq(1).prop("checked", true);
                            $(td).find('input[name="InDriver' + i + '"][type="radio"]').eq(0).prop("checked", false)
                        }
                        if (setalarmOutDriver == 1) {
                            $(td).find('input[name="OutDriver' + i + '"][type="radio"]').eq(0).prop("checked", true);
                            $(td).find('input[name="OutDriver' + i + '"][type="radio"]').eq(1).prop("checked", false)
                        } else if (setalarmOutDriver == 0) {
                            $(td).find('input[name="OutDriver' + i + '"][type="radio"]').eq(1).prop("checked", true);
                            $(td).find('input[name="OutDriver' + i + '"][type="radio"]').eq(0).prop("checked", false)
                        }
                        if (startTimeVal != null) {
                            $(td).find('input[name="startTime"]').val(startTimeVal);
                        }
                        if (endTimeVal != null) {
                            $(td).find('input[name="endTime"]').val(endTimeVal);
                        }
                        if (startDateVal != null) {
                            $(td).find('input[name="alarmStartDateTD"]').val(startDateVal);
                        }
                        if (endDateVal != null) {
                            $(td).find('input[name="alarmEndDateTD"]').val(endDateVal);
                        }
                        if (speedVal != null) {
                            $(td).find('input[name="speed"]').val(speedVal);
                        }
                        if (overSpeedLastTimeVal != null) {
                            $(td).find('input[name="overSpeedLastTime"]').val(overSpeedLastTimeVal);
                        }
                        if (fenceType == "路线") {
                            if (travelLongTimeVal != null) {
                                $(td).find('input[name="travelLongTime"]').val(travelLongTimeVal);
                            }
                            if (travelSmallTimeVal != null) {
                                $(td).find('input[name="travelSmallTime"]').val(travelSmallTimeVal);
                            }
                        }
                        if (fenceType != "路线") {
                            if (setOpenDoor == 0) {
                                $(td).find('input[name="openDoor' + i + '"][type="radio"]').eq(0).prop("checked", true);
                                $(td).find('input[name="openDoor' + i + '"][type="radio"]').eq(1).prop("checked", false)
                            } else if (setOpenDoor == 1) {
                                $(td).find('input[name="openDoor' + i + '"][type="radio"]').eq(1).prop("checked", true);
                                $(td).find('input[name="openDoor' + i + '"][type="radio"]').eq(0).prop("checked", false)
                            }
                            if (setCommunicationFlag == 0) {
                                $(td).find('input[name="communicationFlag' + i + '"][type="radio"]').eq(0).prop("checked", true);
                                $(td).find('input[name="communicationFlag' + i + '"][type="radio"]').eq(1).prop("checked", false)
                            } else if (setCommunicationFlag == 1) {
                                $(td).find('input[name="communicationFlag' + i + '"][type="radio"]').eq(1).prop("checked", true);
                                $(td).find('input[name="communicationFlag' + i + '"][type="radio"]').eq(0).prop("checked", false)
                            }
                            if (setGNSSFlag == 0) {
                                $(td).find('input[name="GNSSFlag' + i + '"][type="radio"]').eq(0).prop("checked", true);
                                $(td).find('input[name="GNSSFlag' + i + '"][type="radio"]').eq(1).prop("checked", false)
                            } else if (setGNSSFlag == 1) {
                                $(td).find('input[name="GNSSFlag' + i + '"][type="radio"]').eq(1).prop("checked", true);
                                $(td).find('input[name="GNSSFlag' + i + '"][type="radio"]').eq(0).prop("checked", false)
                            }
                        }

                        if (setalarmSource == 0) { // 终端报警
                            $(td).find('input[name="alarmSourceName' + i + '"][type="radio"]').eq(0).prop("checked", true);
                            $(td).find('input[name="alarmSourceName' + i + '"][type="radio"]').eq(1).prop("checked", false);

                            var y_tr = $(td).parent();
                            y_tr.find("td#sendFenceType").css('opacity', '1');
                            y_tr.find("td#alarmInDriver").css('opacity', '1');
                            y_tr.find("td#alarmOutDriver").css('opacity', '1');
                            y_tr.find("td#overSpeedLastTime").css('opacity', '1');
                            y_tr.find("td#travelLongTime").css('opacity', '1');
                            y_tr.find("td#travelSmallTime").css('opacity', '1');
                            y_tr.find("td#openDoor").css('opacity', '1');
                            y_tr.find("td#communicationFlag").css('opacity', '1');
                            y_tr.find("td#GNSSFlag").css('opacity', '1');
                        } else if (setalarmSource == 1) { // 平台报警
                            $(td).find('input[name="alarmSourceName' + i + '"][type="radio"]').eq(1).prop("checked", true);
                            $(td).find('input[name="alarmSourceName' + i + '"][type="radio"]').eq(0).prop("checked", false);

                            var y_tr = $(td).parent();
                            y_tr.find("td#sendFenceType").css('opacity', '0');
                            y_tr.find("td#alarmInDriver").css('opacity', '0');
                            y_tr.find("td#alarmOutDriver").css('opacity', '0');
                            y_tr.find("td#overSpeedLastTime").css('opacity', '0');
                            y_tr.find("td#travelLongTime").css('opacity', '0');
                            y_tr.find("td#travelSmallTime").css('opacity', '0');
                            y_tr.find("td#openDoor").css('opacity', '0');
                            y_tr.find("td#communicationFlag").css('opacity', '0');
                            y_tr.find("td#GNSSFlag").css('opacity', '0');
                        }
                    });
                }
            }
        },
        fencetypepid: function (fencetype) {
            if (fencetype == "zw_m_marker") {
                return "标注";
            } else if (fencetype == "zw_m_line") {
                return "路线";
            } else if (fencetype == "zw_m_rectangle") {
                return "矩形";
            } else if (fencetype == "zw_m_circle") {
                return "圆形";
            } else if (fencetype == "zw_m_polygon") {
                return "多边形";
            } else if (fencetype == "zw_m_administration") {
                return "行政区划";
            } else if (fencetype == "zw_m_travel_line") {
                return "导航路线";
            }
        },
        laydateTime: function (e) {
            id = e.id;
            var offset = $("#" + id).offset();
            var height = $("#" + id).height();
            $("#hmsTime").show().css({
                "position": "absolute",
                "top": offset.top + height + 10 + "px",
                "left": offset.left + "px"
            });
        },
        checkboxis: function (checkbox) {
            $("#checkAll").attr("checked", false)
            if (checkbox.checked == true) {
                trid.push($("#" + checkbox.id).parents("tr").attr("id"));
            } else {
                trid = $.grep(trid, function (value, i) {
                    return value != $("#" + checkbox.id).parents("tr").attr("id");
                });
                return trid;
            }
        },

        bodyClickEvent: function (event) {
            if ($(event.target).parents("#hmsTime").length == 0 && event.target.id != "hmsTime" && event.target.id.indexOf('TimeHMS') == -1) {
                $("#hmsTime").hide();
            };
            // if ($(event.target).className != 'ztreeModelBox' && $(event.target).parents(".ztreeModelBox").length == 0 && event.target.id.indexOf('FenceEnterprise') == -1) {
            //     console.log("ztreeModelBox hide...?")
            //     $('.ztreeModelBox').hide();
            // };
        },
        hourseSelectClick: function () {
            hourseSelect = $(this).text();
            $("#hourseSelect").hide();
            $("#minuteSelect").show();
        },
        minuteSelectClick: function () {
            minuteSelect = $(this).text();
            $("#minuteSelect").hide();
            $("#secondSelect").show();
        },
        secondSelectClick: function () {
            secondSelect = $(this).text();
            $("#secondSelect").hide();
            $("#hourseSelect").show();
            $("#hmsTime").hide();
            time = hourseSelect + ":" + minuteSelect + ":" + secondSelect;
            $("#" + id).val(time);
        },
        // 提交(按围栏)
        fenceSaveBtnClick: function () {
            var arr = [];
            var errFlag = 1;
            var errMsg = "";
            var i = 1;
            // 遍历表格，组装Json
            $("#tableList tr").each(function () {
                var tr = this;
                var obj = {};
                $(tr).children("td").each(function () {
                    var td = this;
                    if (td.id == "fenceId") {
                        obj.fenceId = $(td).html();
                    } else if (td.id == "vehicleId") {
                        obj.vehicleId = $(td).html();
                    } else if (td.id == "monitorType") {
                        obj.monitorType = $(td).html();
                    } else if (td.id == "sendFenceType") {
                        obj.sendFenceType = $(td).find("input[name='sendFenceType" + i + "']:checked ").attr("value");
                    } else if (td.id == "alarmSource") {
                        obj.alarmSource = $(td).find("input[name='alarmSourceName" + i + "']:checked ").attr("value");
                    } else if (td.id == "alarmIn") {
                        obj.alarmInPlatform = $(td).find("input[name='Inradio" + i + "']:checked ").attr("value");
                    } else if (td.id == "alarmOut") {
                        obj.alarmOutPlatform = $(td).find("input[name='Outradio" + i + "']:checked ").attr("value");
                    } else if (td.id == "alarmInDriver") {
                        obj.alarmInDriver = $(td).find("input[name='InDriver" + i + "']:checked ").attr("value");
                    } else if (td.id == "alarmOutDriver") {
                        obj.alarmOutDriver = $(td).find("input[name='OutDriver" + i + "']:checked ").attr("value");
                    } else if (td.id == "startTime") {
                        obj.alarmStartTime = $(td).find("input").val();
                    } else if (td.id == "endTime") {
                        obj.alarmEndTime = $(td).find("input").val();
                    } else if (td.id == "alarmStartDateTD") {
                        var time = $(td).find("input").val();
                        if (time != null && time != "") {
                            obj.alarmStartDate = "2016-01-01 " + time;
                        }
                    } else if (td.id == "alarmEndDateTD") {
                        var time = $(td).find("input").val();
                        if (time != null && time != "") {
                            obj.alarmEndDate = "2016-01-01 " + time;
                        }
                    } else if (td.id == "speed") {
                        obj.speed = $(td).find("input").val();
                    } else if (td.id == "overSpeedLastTime") {
                        obj.overSpeedLastTime = $(td).find("input").val();
                    } else if (td.id == "travelLongTime") {
                        var travelLongTimeVal = $(td).find("input").val();
                        if (travelLongTimeVal != undefined && travelLongTimeVal != null) {
                            obj.travelLongTime = travelLongTimeVal;
                        } else {
                            obj.travelLongTime = "";
                        }
                    } else if (td.id == "travelSmallTime") {
                        var travelSmallTimeVal = $(td).find("input").val();
                        if (travelSmallTimeVal != undefined && travelSmallTimeVal != null) {
                            obj.travelSmallTime = travelSmallTimeVal;
                        } else {
                            obj.travelSmallTime = "";
                        }
                    } else if (td.id == "openDoor") {
                        var openDoorVal = $(td).find("input[name='openDoor" + i + "']:checked ").attr("value");
                        if (openDoorVal != undefined && openDoorVal != null && openDoorVal != '') {
                            obj.openDoor = openDoorVal;
                        } else {
                            obj.openDoor = 2;
                        }
                    } else if (td.id == "communicationFlag") {
                        var communicationFlagVal = $(td).find("input[name='communicationFlag" + i + "']:checked ").attr("value");
                        if (communicationFlagVal != undefined && communicationFlagVal != null && communicationFlagVal != '') {
                            obj.communicationFlag = communicationFlagVal;
                        } else {
                            obj.communicationFlag = 2;
                        }
                    } else if (td.id == "GNSSFlag") {
                        var GNSSFlagVal = $(td).find("input[name='GNSSFlag" + i + "']:checked ").attr("value");
                        if (GNSSFlagVal != undefined && GNSSFlagVal != null && GNSSFlagVal != '') {
                            obj.GNSSFlag = GNSSFlagVal;
                        } else {
                            obj.GNSSFlag = 2;
                        }
                    }
                });
                var a = i - 1;
                // 开始时间和结束时间要么都有，要么都没有
                if (obj.alarmStartTime != "" && obj.alarmEndTime == "") {
                    errFlag = 0;
                    errMsg += '第' + (a) + '条数据请选择结束时间！<br/>';
                } else if (obj.alarmStartTime == "" && obj.alarmEndTime != "") {
                    errFlag = 0;
                    errMsg += '第' + (a) + '条数据请选择开始时间！<br/>';
                } else if (obj.alarmStartTime != "" && obj.alarmEndTime != "") { // 结束日期必须大于开始日期
                    if (fenceOperation.compareDate(obj.alarmStartTime, obj.alarmEndTime)) {
                        errFlag = 0;
                        errMsg += '第' + (a) + '条数据结束日期必须大于开始日期！<br/>';
                    }
                }
                if (obj.speed < 0 || obj.speed > 65535) { // 限速校验最大值最小值
                    errFlag = 0;
                    errMsg += '第' + (a) + '条数限速的最小值为0，最大值为65535！<br/>';
                }
                if (obj.overSpeedLastTime < 0 || obj.overSpeedLastTime > 65535) { // 超速持续时长校验最大值最小值
                    errFlag = 0;
                    errMsg += '第' + (a) + '条数超速持续时长的最小值为0，最大值为65535！<br/>';
                }
                // 行驶过长阈值，行驶不足阈值，要么都有，要么都没有
                if (obj.travelLongTime != "" && obj.travelSmallTime == "") {
                    errFlag = 0;
                    errMsg += '第' + (a) + '条数据请输入行驶不足阈值！<br/>';
                } else if (obj.travelLongTime == "" && obj.travelSmallTime != "") {
                    errFlag = 0;
                    errMsg += '第' + (a) + '条数据请输入行驶过长阈值！<br/>';
                }
                if (!jQuery.isEmptyObject(obj)) {
                    arr.push(obj);
                }
                i++;
            });
            // ajax访问后端
            if (arr == null || arr.length == 0) {
                layer.msg(fenceOperationFenceBound, {move: false});
            } else if (errFlag == 0) {
                layer.msg(errMsg);
            } else {
                var url = "/clbs/m/functionconfig/fence/bindfence/saveBindFence";
                var parameter = {"data": JSON.stringify(arr)};
                json_ajax("POST", url, "json", true, parameter, fenceOperation.saveBindCallback);
            }
        },
        //保存围栏绑定回调方法
        saveBindCallback: function (data) {
            if (data != null) {
                if (data.success) {
                    if (data.obj.flag == 1) {
                        $("#fenceBind").modal('hide');
                        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
                        fenceOperation.getcheckFenceNode(zTree);
                        myTable.filter();
                        layer.msg(fenceOperationFenceBoundSuccess, {closeBtn: 0}, function () {
                            layer.close();
                        });
                    } else if (data.obj.flag == 2) {
                        // layer.msg(data.obj.errMsg,{move:false});
                        layer.alert(data.obj.errMsg, {
                            id: "promptMessage"
                        });
                    }
                } else {
                    layer.msg(data.msg, {move: false});
                }
            }
        },
        //比较时间大小 a > b true
        compareDate: function (a, b) {
            var dateA = new Date(a);
            var dateB = new Date(b);
            if (isNaN(dateA) || isNaN(dateB)) {
                return false;
            }
            if (dateA > dateB) {
                return true;
            } else {
                return false;
            }
        },
        TabCarBox: function () {
            monitoringObjMapHeight = $("#MapContainer").height();
            $("#carInfoTable").hide();
            $("#dragDIV").hide();
            $("#fenceBindTable").css("display", "block");
            $("#fenceBindTable").show();
            var bingLength = $('#dataTableBind tbody tr').length;
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            // var checkNode = treeObj.getCheckedNodes(true);
            if ( 0) {
                $("#MapContainer").css("height", newMapHeight + 'px');
            } else {
                if ($('#bingListClick i').hasClass('fa fa-chevron-down')) {
                    if (bingLength == 0) {
                        $("#MapContainer").css("height", newMapHeight + 'px');
                    } else {
                        $("#MapContainer").css('height', (newMapHeight - 80 - 44 * bingLength - 105) + 'px');
                    }
                    ;
                } else {
                    $("#MapContainer").css("height", newMapHeight + 'px');
                }
                ;
            }
            ;
            $("#MapContainer").css('height', (newMapHeight - 80 - 44 * bingLength - 105) + 'px');
            // 订阅电子围栏
            // if (clickFenceCount == 0) {
            //     webSocket.subscribe(headers, "/user/" + $("#userName").text() + '/fencestatus', fenceOperation.updataFenceData, null, null);
            // };
            clickFenceCount = 1;
        },
        TabFenceBox: function () {
            $("#dragDIV").show();
            $("#MapContainer").css('height', monitoringObjMapHeight + 'px');
            $("#carInfoTable").show();
            $("#fenceBindTable").hide();
            $("body").css("overflow", 'hidden');
            $(document).scrollTop(0);
        },
        parametersTrace: function (data) {
            if (data.success) {
                layer.msg("开始跟踪！");
                $("#goTrace").modal("hide");
            } else {
                layer.msg(data.msg);
            }
        },
        updataFenceData: function (msg) {
            if (msg != null) {
                var result = $.parseJSON(msg.body);
                if (result != null) {
                    myTable.refresh();
                }
            }
        },
        // 下发围栏 （单个）
        sendFenceOne: function (id, paramId, vehicleId, fenceId) {
            var arr = [];
            var obj = {};
            obj.fenceConfigId = id;
            obj.paramId = paramId;
            obj.vehicleId = vehicleId;
            obj.fenceId = fenceId
            arr.push(obj);
            var jsonStr = JSON.stringify(arr);
            fenceOperation.sendFence(jsonStr);
        },
        // 下发围栏
        sendFence: function (sendParam) {
            var url = "/clbs/m/functionconfig/fence/bindfence/sendFence";
            var parameter = {"sendParam": sendParam};
            json_ajax("POST", url, "json", true, parameter, fenceOperation.sendFenceCallback);
        },
        // 围栏下发回调
        sendFenceCallback: function (data) {
            layer.msg(fenceOperationFenceIssue, {closeBtn: 0}, function (refresh) {
                //取消全选勾
                $("#checkAll").prop('checked', false);
                $("input[name=subChk]").prop("checked", false);
                myTable.refresh(); //执行的刷新语句
                layer.close(refresh);
            });
        },
        //数据表格围栏显示
        tableFence: function (id) {
            var treeObj = $.fn.zTree.getZTreeObj("fenceDemo");
            var nodesArray = [];
            var nodes = treeObj.getNodeByParam("id", id, null);
            nodesArray.push(nodes);
            fenceOperation.getFenceDetail(nodesArray, map);
        },
        // 批量下发
        sendModelClick: function () {
            //判断是否至少选择一项
            var chechedNum = $("input[name='subChk']:checked").length;
            if (chechedNum == 0) {
                layer.msg(fenceOperationDataNull);
                return
            }
            var checkedList = new Array();
            $("input[name='subChk']:checked").each(function () {
                var jsonStr = $(this).val();
                var jsonObj = $.parseJSON(jsonStr);
                checkedList.push(jsonObj);
            });
            // 下发
            fenceOperation.sendFence(JSON.stringify(checkedList));
        },
        //批量删除
        delModelClick: function () {
            //判断是否至少选择一项
            var chechedNum = $("input[name='subChk']:checked").length;
            if (chechedNum == 0) {
                layer.msg(fenceOperationDataNull);
                return
            }
            var checkedList = new Array();
            $("input[name='subChk']:checked").each(function () {
                var jsonStr = $(this).val();
                var jsonObj = $.parseJSON(jsonStr);
                checkedList.push(jsonObj.fenceConfigId);
            });
            myTable.deleteItems({
                'deltems': checkedList.toString()
            });
        },
        //跟踪
        goTrace: function (id) {
            parametersID = id;
            var listParameters = [];
            listParameters.push(parametersID);
            var validity = $("#validity").val();
            var interval = $("#interval").val();
            listParameters.push(interval);
            listParameters.push(validity);
            var url = "/clbs/v/monitoring/parametersTrace";
            var parameters = {"parameters": listParameters};
            ajax_submit("POST", url, "json", true, parameters, true, fenceOperation.parametersTrace);
            setTimeout("dataTableOperation.logFindCilck()", 500);
        },
        //F3跟踪
        goF3Trace: function (id) {
            parametersID = id;
            var validity = $("#validity").val();
            var interval = $("#interval").val();
            var url = "/clbs/v/monitoringLong/sendParam";
            var parameters = {"vid": parametersID, "longValidity": validity, "longInterval": interval, "orderType": 19};
            ajax_submit("POST", url, "json", true, parameters, true, fenceOperation.parametersTrace);
            setTimeout("dataTableOperation.logFindCilck()", 500);
        },
        // 围栏绑定列表模糊搜索
        searchBindTable: function () {
            myTable.filter();
        },
        //修改矩形取消
        rectangleEditClose: function () {
            mouseTool.close(true);
            mouseToolEdit.close(true);
        },
        //更新围栏预处理函数
        ajaxFenceDataFilter: function (treeId, parentNode, responseData) {
            if (responseData) {
                for (var i = 0; i < responseData.length; i++) {
                    responseData[i].open = false;
                    if (responseData[i].type == "fence" && fenceIdArray.indexOf(responseData[i].id) != -1) {
                        responseData[i].checked = true;
                    }
                    ;
                    if (responseData[i].type == "fenceParent" && fenceOpenArray.indexOf(responseData[i].id) != -1) {
                        responseData[i].open = true;
                    }
                    ;
                    if (responseData[i].type == "fenceParent" && responseData[i].id == saveFenceType) {
                        responseData[i].open = true;
                    }
                    ;
                }
                ;
            }
            ;
            return responseData;
        },
        //更新围栏成功函数
        zTreeOnAsyncFenceSuccess: function (event, treeId, treeNode, msg) {
            var rectang_fenceId = $("#rectangleId").val();
            var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
            var nodes = zTree.getNodesByParam("id", rectang_fenceId, null);
            if (nodes.length != 0) {
                fenceOperation.getFenceDetail(nodes, map);
            }
            ;
            $("#rectangleId").val('');
            var fenceNode = zTree.getNodesByParam('id', saveFenceType, null);
            if (fenceNode != undefined && fenceNode != null && fenceNode.length > 0) {
                var childrenNode = fenceNode[0].children;
                if (childrenNode != undefined) {
                    for (var i = 0, len = childrenNode.length; i < len; i++) {
                        if (saveFenceName == childrenNode[i].name) {
                            zTree.checkNode(childrenNode[i], true, true);
                            zTree.selectNode(childrenNode[i]); //选中第一个父节点下面第一个子节点
                            fenceCheckLength = zTree.getCheckedNodes(true).length;
                            childrenNode[i].checkedOld = true;
                            fenceOperation.getFenceDetail([childrenNode[i]], map);
                        }
                        ;
                    }
                    ;
                }
                ;
            }
            ;
        },
        //标注取消
        markFenceClose: function () {
            mouseTool.close(true);
            var markFenceID = $("#markerId").val();
            var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
            var nodes = zTree.getNodesByParam("id", markFenceID, null);
            fenceOperation.getFenceDetail(nodes, map);
        },
        moveMarker: function (e) {
            $("#addOrUpdateMarkerFlag").val("1"); // 修改标注，给此文本框赋值为1
            $("#markerId").val(moveMarkerFenceId); // 标注id
            // 标注修改框弹出时给文本框赋值
            $("#markerName").val(moveMarkerBackData.name);
            $("#markerType").val(moveMarkerBackData.type);
            $("#markerDescription").val(moveMarkerBackData.description);
            $("#mark-lng").attr("value", e.lnglat.lng);
            $("#mark-lat").attr("value", e.lnglat.lat);
            pageLayout.closeVideo();
            $('#mark').modal('show');
            polyFence.off("mouseup", fenceOperation.moveMarker);
        },
        //线路取消
        lineEditClose: function () {
            mouseTool.close(true);
            map.off("rightclick", amendLine);
            var lineFenceID = $("#lineId").val();
            var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
            var nodes = zTree.getNodesByParam("id", lineFenceID, null);
            fenceOperation.getFenceDetail(nodes, map);
        },
        //圆取消
        circleFenceClose: function () {
            mouseTool.close(true);
            var circleFenceID = $("#circleId").val();
            var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
            var nodes = zTree.getNodesByParam("id", circleFenceID, null);
            fenceOperation.getFenceDetail(nodes, map);
        },
        //多边形取消
        polygonFenceClose: function () {
            mouseTool.close(true);
            var polygonFenceID = $("#polygonId").val();
            var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
            var nodes = zTree.getNodesByParam("id", polygonFenceID, null);
            fenceOperation.getFenceDetail(nodes, map);
        },
        //数组大小排序
        sortNumber: function (a, b) {
            return a - b;
        },
        // 报警区分平台
        alarmSourceCheck: function (fencetype, alarmSourceName) {
            if (fencetype == "zw_m_administration" || fencetype == "zw_m_travel_line") {
                return "<td id = 'alarmSource'><input type='radio' value = 0 name='" + alarmSourceName + "' id='" + alarmSourceName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + alarmSourceName + "'>终端报警</label><input type='radio' value = 1 checked='checked' name='" + alarmSourceName + "' id='" + alarmSourceName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + alarmSourceName + "s'>平台报警</label></td>"
            } else {
                return "<td id = 'alarmSource'><input type='radio' value = 0 checked='checked' name='" + alarmSourceName + "' id='" + alarmSourceName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + alarmSourceName + "'>终端报警</label><input type='radio' value = 1 name='" + alarmSourceName + "' id='" + alarmSourceName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + alarmSourceName + "s'>平台报警</label></td>"
            }
        },
        sendFenceTypeTd: function (fencetype, sendFenceTypeName) {
            if (fencetype != "zw_m_line" && fencetype != "zw_m_polygon" && fencetype != "zw_m_travel_line" && fencetype != "zw_m_administration") {
                return "<td id = 'sendFenceType'><input type='radio' value = 0 checked name='" + sendFenceTypeName + "' id='" + sendFenceTypeName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + sendFenceTypeName + "'>更新</label><input type='radio' value = 1 name='" + sendFenceTypeName + "' id='" + sendFenceTypeName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + sendFenceTypeName + "s'>追加</label><input type='radio' value = 2 name='" + sendFenceTypeName + "' id='" + sendFenceTypeName + "ss'><label style='margin-bottom:0px;cursor:pointer' for='" + sendFenceTypeName + "ss'>修改</label></td>";
            } else {
                return "<td id = 'sendFenceType'><input type='radio' disabled value = 0 checked name='" + sendFenceTypeName + "'>更新</td>"
            }
        },
        //判断绑定详细列表中行驶时间阈值过长或者不足是否需要填写
        travelLongAndSmallTime: function (fencetype) {
            if (fencetype == "zw_m_line" || fencetype == "zw_m_travel_line") {
                return "<td id='travelLongTime'><input type= 'number' name = 'travelLongTime' class='form-control'/></td>" + "<td id='travelSmallTime'><input type= 'number' name = 'travelSmallTime' class='form-control'/></td>";
            } else {
                return "<td id='travelLongTime'></td>" + "<td id='travelSmallTime'></td>";
            }
        },
        //判断绑定详细列表中最后三项是否需要显示
        otherInfo: function (fencetype, openDoorName, communicationFlagName, GNSSFlagName) {
            if (fencetype != "zw_m_line" && fencetype != "zw_m_travel_line") {
                return "<td id = 'openDoor'><input type='radio' value = 0 checked name='" + openDoorName + "' id='" + openDoorName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + openDoorName + "'>是</label><input type='radio' value =1 name='" + openDoorName + "' id='" + openDoorName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + openDoorName + "s'>否</lebal></td>"
                    + "<td id = 'communicationFlag'><input type='radio'  value = 0 checked name='" + communicationFlagName + "' id='" + communicationFlagName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + communicationFlagName + "'>是</label><input type='radio'  value = 1 name='" + communicationFlagName + "' id='" + communicationFlagName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + communicationFlagName + "s'>否</lebal></td>"
                    + "<td id = 'GNSSFlag'><input type='radio' value = 0 checked name='" + GNSSFlagName + "' id='" + GNSSFlagName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + GNSSFlagName + "'>是</label><input type='radio' value = 1 name='" + GNSSFlagName + "' id='" + GNSSFlagName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + GNSSFlagName + "s'>否</lebal></td>";
            } else {
                return "<td id = 'openDoor'></td>"
                    + "<td id = 'communicationFlag'></td>"
                    + "<td id = 'GNSSFlag'></td>";
            }
        },
        //收缩绑定列表
        bingListClick: function () {
            if ($(this).children('i').hasClass('fa-chevron-down')) {
                $(this).children('i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
                $("#MapContainer").animate({'height': newMapHeight + "px"});
            } else {
                $(this).children('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
                var trLength = $('#dataTableBind tbody tr').length;
                $("#MapContainer").animate({'height': (winHeight - 80 - trLength * 46 - 220) + "px"});
            }
            ;
        },
        addaskQuestions: function () {
            addaskQuestionsIndex++;
            var html = '<div class="form-group" id="answer-add_' + addaskQuestionsIndex + '"><label class="col-md-3 control-label">答案：</label><div class="col-md-5"><input type="text" placeholder="请输入答案" class="form-control" name="value" id=""/><label class="error">请输入答案</label></div><div class="col-md-1"><button type="button" class="btn btn-danger answerDelete deleteIcon"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button></div></div>';
            $("#answer-add-content").append(html);
            $(".answerDelete").on("click", function () {
                $(this).parent().parent().remove();
            });
        },
        //分段限速取消
        sectionRateLimitingClose: function (id) {
            fenceOperation.clearErrorMsg();
            var sectionLineID
            if (typeof(id) === 'object') {
                sectionLineID = $("#lineIDms1").attr("value");
            } else {
                sectionLineID = id;
            }
            ;
            if (sectionMarkerPointArray.containsKey(sectionLineID)) {
                var thisValue = sectionMarkerPointArray.get(sectionLineID);
                thisValue[1] = false;
                sectionMarkerPointArray.remove(sectionLineID);
            }
            ;
            if (fenceSectionPointMap.containsKey(sectionLineID)) {
                fenceSectionPointMap.remove(sectionLineID);
            }
            ;
            if (sectionPointMarkerMap.containsKey(sectionLineID)) {
                var pointArray = sectionPointMarkerMap.get(sectionLineID);
                map.remove(pointArray);
                sectionPointMarkerMap.remove(sectionLineID);
                $("#tenples").html('');
                $("#pagecontent").html('');
            }
            ;
        },
        //围栏详情
        fenceDetails: function (data) {
            var fenceData = data[0].fenceData;
            var fenceType = data[0].fenceType;
            var detailsFenceShape = fenceOperation.fencetypepid(fenceType);
            var detailsFenceName;
            var detailsFenceType;
            var detailsFenceCreateName;
            var detailsFenceCreateTime;
            var detailsFenceBelongtoName;
            if (fenceType == 'zw_m_line') {
                detailsFenceType = data[0].line.type;
                detailsFenceDescribe = data[0].line.description;
                if (detailsFenceDescribe == "" || detailsFenceDescribe == null) {
                    detailsFenceDescribe = "无任何描述"
                }
                detailsFenceCreateName = data[0].line.createDataUsername;
                detailsFenceCreateTime = data[0].line.createDataTime;
            } else if (fenceType == 'zw_m_polygon') {
                detailsFenceType = data[0].polygon.type;
                detailsFenceDescribe = data[0].polygon.description;
                detailsFenceBelongtoName = data[0].polygon.belongto;
                if (detailsFenceDescribe == "" || detailsFenceDescribe == null) {
                    detailsFenceDescribe = "无任何描述"
                }
                if (detailsFenceBelongtoName == "" || detailsFenceBelongtoName == null) {
                    detailsFenceBelongtoName = "未设置"
                }
                detailsFenceCreateName = data[0].polygon.createDataUsername;
                detailsFenceCreateTime = data[0].polygon.createDataTime;
            } else if (fenceType == "zw_m_administration") {
                detailsFenceType = "行政区域";
                detailsFenceDescribe = data[0].administration.description == '' ? '无任何描述' : data[0].administration.description;
                detailsFenceCreateName = data[0].administration.createDataUsername;
                detailsFenceCreateTime = data[0].administration.createDataTime;
            } else if (fenceType == "zw_m_travel_line") {
                detailsFenceShape = '导航路线';
                detailsFenceType = data[0].travelLine.lineType;
                detailsFenceCreateName = data[0].travelLine.createDataUsername;
                detailsFenceCreateTime = data[0].travelLine.createDataTime;
                detailsFenceDescribe = data[0].travelLine.description;
            } else {
                detailsFenceType = fenceData.type;
                detailsFenceCreateName = fenceData.createDataUsername;
                detailsFenceCreateTime = fenceData.createDataTime;
                detailsFenceDescribe = fenceData.description == '' ? '无任何描述' : fenceData.description;
            }
            ;
            $("#detailsFenceShape").text(detailsFenceShape);
            $("#detailsFenceType").text(detailsFenceType);
            $("#detailsFenceCreateName").text(detailsFenceCreateName);
            $("#detailsFenceCreateTime").text(detailsFenceCreateTime);
            $("#detailsFenceDescribe").text(detailsFenceDescribe);
            $("#detailsFenceBelongtoName").text(detailsFenceBelongtoName);
        },
        //清空围栏绑定
        clearFenceBind: function () {
            $("#searchVehicle").val('');
            $("#tableList tbody").html('');
        },
        //添加拐点
        addLngLat: function () {
            var id = $(this).parent('.sectionLngLat').parent('div').parents('div').attr('id');
            var thisArea = $(this).parent('div.sectionLngLat').clone(true);
            var lastSectionLngLat = $(this).parent('.sectionLngLat').parent('div').children('.sectionLngLat:last-child');
            var this_lng_id = lastSectionLngLat.children('.sectionLng').children('input').attr('id') + 1;
            var this_lat_id = lastSectionLngLat.children('.sectionLat').children('input').attr('id') + 1;
            thisArea.children('div.sectionLng').children('input').attr('value', '').val('').attr('id', this_lng_id).siblings('label.error').remove();
            thisArea.children('div.sectionLat').children('input').attr('value', '').val('').attr('id', this_lat_id).siblings('label.error').remove();
            thisArea.children('button').attr('class', 'btn btn-danger removeLngLat').children('span').attr('class', 'glyphicon glyphicon-trash');
            $("#" + id).children('div.pointList').append(thisArea);
            $(".removeLngLat").unbind("click").bind("click", fenceOperation.removeLngLat);
        },
        //删除拐点
        removeLngLat: function () {
            $(this).parent('.sectionLngLat').remove();
        },
        //是否显示拐点
        isQueryShow: function () {
            if ($(this).next('div.pointList').is(':hidden')) {
                $(this).children('label').children('span').attr('class', 'fa fa-chevron-down');
                $(this).next('div.pointList').slideDown();
            } else {
                $(this).children('label').children('span').attr('class', 'fa fa-chevron-up');
                $(this).next('div.pointList').slideUp();
            }
            ;
        },
        //围栏经纬度区域显示
        lngLatTextShow: function () {
            var $pointList = $(this).parent('div').next('div.pointList');
            if ($pointList.is(':hidden')) {
                $(this).children('span').attr('class', 'fa fa-chevron-down');
                $pointList.slideDown();
            } else {
                $(this).children('span').attr('class', 'fa fa-chevron-up');
                $pointList.slideUp();
            }
            ;
        },
        //行政区域选择
        administrativeAreaSelect: function (obj) {
            var provin = $("#province").val();
            if (provin == "province") {
                $("#provinceError").css("display", "none");
            }
            else if (provin == "--请选择--") {
                $("#provinceError").css("display", "block");
            }
            for (var i = 0, l = administrativeAreaFence.length; i < l; i++) {
                administrativeAreaFence[i].setMap(null);
            }
            var option = obj[obj.options.selectedIndex];
            var keyword = option.text; //关键字
            var adcode = option.adcode;
            district.setLevel(option.value); //行政区级别
            district.setExtensions('all');
            //行政区查询
            //按照adcode进行查询可以保证数据返回的唯一性
            district.search(adcode, function (status, result) {
                if (status === 'complete') {
                    fenceOperation.getData(result.districtList[0]);
                }
            });
        },
        //行政区域选择后数据处理
        getData: function (data) {
            var bounds = data.boundaries;
            if (bounds) {
                $('#administrativeLngLat').val(bounds.join('-'));
                for (var i = 0, l = bounds.length; i < l; i++) {
                    var polygon = new AMap.Polygon({
                        map: map,
                        strokeWeight: 1,
                        strokeColor: '#CC66CC',
                        fillColor: '#CCF3FF',
                        fillOpacity: 0.5,
                        path: bounds[i]
                    });
                    administrativeAreaFence.push(polygon);
                    map.setFitView(polygon);//地图自适应
                }
                ;
            }
            ;
            var subList = data.districtList;
            var level = data.level;
            //清空下一级别的下拉列表
            if (level === 'province') {
                document.getElementById('city').innerHTML = '';
                document.getElementById('district').innerHTML = '';
            } else if (level === 'city') {
                document.getElementById('district').innerHTML = '';
            } else if (level === 'district') {
            }
            if (subList) {
                var contentSub = new Option('--请选择--');
                for (var i = 0, l = subList.length; i < l; i++) {
                    var name = subList[i].name;
                    var levelSub = subList[i].level;
                    if (levelSub == 'street') {
                        return false;
                    }
                    ;
                    var cityCode = subList[i].citycode;
                    if (i == 0) {
                        document.querySelector('#' + levelSub).add(contentSub);
                    }
                    contentSub = new Option(name);
                    contentSub.setAttribute("value", levelSub);
                    contentSub.center = subList[i].center;
                    contentSub.adcode = subList[i].adcode;
                    document.querySelector('#' + levelSub).add(contentSub);
                }
            }
        },
        //行政区域保存
        administrativeSave: function () {
            var province = $("#province").find('option:selected').text();
            $("#provinceVal").val(province);
            var city = $("#city").find('option:selected').text();
            $("#cityVal").val(city);
            var district = $("#district").find('option:selected').text();
            $("#districtVal").val(district);
            var provin = $("#province").val();
            if (provin == "--请选择--") {
                $("#provinceError").css("display", "block");
                return false;
            }
            if (fenceOperation.validate_administration()) {
                $("#administrativeSave").attr("disabled", "disabled");
                $("#administrativeSave").text("保存中");
                layer.load(2);
                $("#administration").ajaxSubmit(function (data) {
                    var datas = eval("(" + data + ")");
                    if (datas.success == true) {
                        layer.closeAll('loading');
                        $("#administrativeArea").modal("hide");
                        saveFenceName = $('#administrationName').val();
                        saveFenceType = 'zw_m_administration';
                        $(".fenceA").removeClass("fenceA-active");
                        mouseTool.close(true);
                        fenceOperation.addNodes();
                        $("#administrationName").val("");
                        $("#administrationDistrict").val("");
                        $("#administrativeSave").text("保存");
                        $("#administrativeSave").removeAttr("disabled");
                        fenceOperation.administrativeClose();
                    } else {
                        if (datas.msg == null) {
                            $("#administrativeSave").text("保存");
                            $("#administrativeSave").removeAttr("disabled");
                            layer.msg(fenceOperationJudgementASExist);
                        } else {
                            layer.msg(datas.msg, {move: false});
                        }
                    }
                });
            }
        },
        //行政区域添加时验证
        validate_administration: function () {
            return $("#administration").validate({
                rules: {
                    province: {
                        required: true,

                    },
                    name: {
                        required: true,
                        maxlength: 20
                    },
                    description: {
                        maxlength: 50
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
                    description: {
                        maxlength: publicSize50
                    },
                    groupName: {
                        required: publicSelectGroupNull
                    }
                }
            }).form();
        },
        //行政区域取消
        administrativeClose: function () {
            for (var i = 0, l = administrativeAreaFence.length; i < l; i++) {
                administrativeAreaFence[i].setMap(null);
            };
            $("#provinceError").hide();
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
        //添加途经点
        addWayToPoint: function (msg) {
            var length = $('#wayPointArea').children('div').length;
            var searchId = 'wayPoint' + (length + 1);
            var html = '<div class="form-group">'
                + '<div class="col-md-10">'
                + '<input type="text" id="' + searchId + '" placeholder="请输入途经点" class="form-control wayPoint" name="wayPoint" />'
                + '</div>'
                + '<button type="button" class="btn btn-danger padBottom deleteWayPoint"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>'
                + '</div>';
            $(html).appendTo($('#wayPointArea'));
            $('#' + searchId).inputClear().on('onClearEvent', fenceOperation.wayPointInputClear);
            if (Array.isArray(msg)) {
                $('#' + searchId).val(msg[0]).attr('data-address', msg[0]).attr('data-lnglat', msg[2]);
            }
            ;
            var wayPoint = new AMap.Autocomplete({
                input: searchId
            });
            wayPoint.on('select', fenceOperation.dragRoute);
            $('.deleteWayPoint').off('click').on('click', fenceOperation.deleteWayPoint);
        },
        //途经点删除
        deleteWayPoint: function () {
            $(this).parent('div.form-group').remove();
            fenceOperation.dragRoute(null);
        },
        //隐藏区域划分
        hideFence: function (id) {
            if (administrationMap.containsKey(id)) {
                var this_fence = administrationMap.get(id);
                map.remove(this_fence);
                administrationMap.remove(id);
            }
            ;
            //行驶路线travelLineMap
            if (travelLineMap.containsKey(id)) {
                var this_fence = travelLineMap.get(id);
                map.remove(this_fence);
                travelLineMap.remove(id);
            }
            ;
        },
        //路径规划
        dragRoute: function (data) {
            var addressArray = [];
            if (data != null && data != 'drag') {
                var this_input_id = $(this)[0].input.id;
                $("#" + this_input_id).attr('data-address', data.poi.district + data.poi.name).removeAttr('data-lnglat');
            }
            ;
            var startAddress = $('#startPoint').attr('data-address');
            var start_lnglat = $('#startPoint').attr('data-lnglat');
            var endAddress = $('#endPoint').attr('data-address');
            var end_lnglat = $('#endPoint').attr('data-lnglat');
            if (startAddress != '' && endAddress != '' && startAddress != undefined && endAddress != undefined) {
                if (lineRoute != undefined) {
                    lineRoute.destroy();//销毁拖拽导航插件
                }
                ;
                if (start_lnglat != undefined) {
                    addressArray.push(start_lnglat);
                } else {
                    addressArray.push(startAddress);
                }
                ;
                $('#wayPointArea input').each(function () {
                    var this_value = $(this).val();
                    if (this_value != '') {
                        var value = $(this).attr('data-address');
                        var lnglat = $(this).attr('data-lnglat');
                        if (lnglat != undefined) {
                            addressArray.push(lnglat);
                        } else {
                            addressArray.push(value);
                        }
                        ;
                    } else {
                        $(this).parent('div').parent('div').remove();
                    }
                    ;
                });
                if (end_lnglat != undefined) {
                    addressArray.push(end_lnglat);
                } else {
                    addressArray.push(endAddress);
                }
                ;
                var lngLatArray = [];
                fenceOperation.getAddressLngLat(addressArray, 0, lngLatArray);
            }
            ;
        },
        //地理编码
        getAddressLngLat: function (addressArray, index, lngLatArray) {
            var this_address = addressArray[index];
            if (fenceOperation.isChineseChar(this_address)) {
                var geocoder = new AMap.Geocoder({
                    city: "全国", //城市，默认：“全国”
                    radius: 500 //范围，默认：500
                });
                geocoder.getLocation(this_address);
                geocoder.on('complete', function (GeocoderResult) {
                    if (GeocoderResult.type == 'complete') {
                        var this_lng = GeocoderResult.geocodes[0].location.lng;
                        var this_lat = GeocoderResult.geocodes[0].location.lat;
                        lngLatArray.push([this_lng, this_lat]);
                        index++;
                        if (index == addressArray.length) {
                            fenceOperation.madeDragRoute(lngLatArray);
                        } else {
                            fenceOperation.getAddressLngLat(addressArray, index, lngLatArray);
                        }
                    }
                    ;
                });
            } else {
                index++;
                lngLatArray.push(this_address.split(';'));
                if (index == addressArray.length) {
                    fenceOperation.madeDragRoute(lngLatArray);
                } else {
                    fenceOperation.getAddressLngLat(addressArray, index, lngLatArray);
                }
                ;
            }
            ;
        },
        //开始路径规划
        madeDragRoute: function (array) {
            isDragRouteFlag = false;
            map.plugin("AMap.DragRoute", function () {
                lineRoute = new AMap.DragRoute(map, array, AMap.DrivingPolicy.REAL_TRAFFIC); //构造拖拽导航类
                lineRoute.search(); //查询导航路径并开启拖拽导航
                //路径规划完成
                lineRoute.on('complete', fenceOperation.dragRouteComplete);
            });
        },
        //行驶路线关闭
        lineDragRouteClose: function () {
            var dragRouteId = $('#travelLineId').val();
            var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
            var node = zTree.getNodeByParam('id', dragRouteId, null);
            fenceOperation.getFenceDetail([node], map);
            fenceOperation.closeDragRoute();
            if (lineRoute != undefined) {
                lineRoute.destroy();
            }
            ;
            fenceOperation.clearLineDragRoute();
            isDragRouteFlag = false;
        },
        //清空行驶路线input
        clearLineDragRoute: function () {
            $('#drivenRoute').hide();
            $('#drivenRoute input').each(function () {
                $(this).val('').attr('data-address', '').removeAttr('data-lnglat');
            });
            $('#wayPointArea').html('');
            $('#dragRouteDescription').val('');
            var start_point = dragPointMarkerMap.get('0');
            var end_point = dragPointMarkerMap.get('2');
            var wayPoint = dragPointMarkerMap.get('1');
            if (start_point != undefined) {
                map.remove([start_point]);
            }
            ;
            if (end_point != undefined) {
                map.remove([end_point]);
            }
            ;
            if (wayPoint != undefined) {
                map.remove([wayPoint]);
            }
            ;
            dragPointMarkerMap.clear();
        },
        //行驶路线保存
        lineDragRouteSave: function () {
            if (isDragRouteFlag) {
                if (fenceOperation.validate_dragRoute()) {
                    $("#dragRouteLine").ajaxSubmit(function (data) {
                        var datas = eval("(" + data + ")")
                        if (datas.success == true) {
                            var dragRouteId = $('#travelLineId').val();
                            saveFenceName = $('#dragRouteLineName').val();
                            saveFenceType = 'zw_m_travel_line';
                            var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
                            var node = zTree.getNodeByParam('id', dragRouteId, null);
                            fenceOperation.getFenceDetail([node], map);
                            fenceOperation.closeDragRoute();
                            fenceOperation.addNodes();
                            fenceOperation.clearLineDragRoute();
                            if (lineRoute != undefined) {
                                lineRoute.destroy();//销毁拖拽导航插件
                            }
                            ;
                        } else {
                            if (datas.msg == null) {
                                layer.msg(fenceOperationTravelLineExist);
                            } else {
                                layer.msg(datas.msg, {move: false});
                            }
                        }
                    });
                }
            } else {
                layer.msg(fenceOperationTravelLineError);
            }
            ;
        },
        //预览行驶路线
        drawTravelLine: function (data, thisMap, travelLine, wayPointArray) {
            $('#drivenRoute').hide();
            if (lineRoute != undefined) {
                lineRoute.destroy();
            }
            ;
            var lineID = travelLine.id;
            var path = [];
            var start_point_value = [travelLine.startLongitude, travelLine.startLatitude];
            var end_point_value = [travelLine.endLongitude, travelLine.endLatitude];
            var wayValue = [];
            if (wayPointArray != undefined) {
                for (var j = 0, len = wayPointArray.length; j < len; j++) {
                    wayValue.push([wayPointArray[j].longitude, wayPointArray[j].latitude]);
                }
                ;
            }
            ;
            for (var i = 0, len = data.length; i < len; i++) {
                path.push([data[i].longitude, data[i].latitude]);
            }
            ;
            if (travelLineMap.containsKey(lineID)) {
                var this_line = travelLineMap.get(lineID);
                map.remove([this_line]);
                travelLineMap.remove(lineID);
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
            travelLineMap.put(lineID, polyFencec);
        },
        //路线规划逆地理编码
        getAddressValue: function (array, index, addressArray) {
            var this_lnglat = array[index];
            var geocoder = new AMap.Geocoder({
                radius: 1000,
                extensions: "all"
            });
            geocoder.getAddress(this_lnglat);
            geocoder.on('complete', function (GeocoderResult) {
                if (GeocoderResult.type == 'complete') {
                    var this_address_value = GeocoderResult.regeocode.addressComponent.township
                    var this_address = GeocoderResult.regeocode.formattedAddress;
                    addressArray.push([this_address, this_address_value]);
                    index++;
                    if (index == array.length) {
                        // return addressArray;
                        var html = '';
                        for (var i = 1, len = addressArray.length - 1; i < len; i++) {
                            html += '<div class="form-group">'
                                + '<div class="col-md-10">'
                                + '<input type="text" id="wayPoint' + i + '" placeholder="请输入途经点" class="form-control wayPoint" name="wayPoint" />'
                                + '</div>'
                                + '<button type="button" class="btn btn-danger padBottom deleteWayPoint"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>'
                                + '</div>';
                        }
                        ;
                        $('#wayPointArea').html(html);
                        $('#startPoint').val(addressArray[0][0]).attr('data-address', addressArray[0][0]);
                        $('#endPoint').val(addressArray[addressArray.length - 1][0]).attr('data-address', addressArray[addressArray.length - 1][0]);
                        for (var j = 1, len = addressArray.length - 1; j < len; j++) {
                            var id = 'wayPoint' + j;
                            $('#' + id).val(addressArray[j][0]).attr('data-address', addressArray[j][0]).attr('data-lnglat', array[j][0] + ';' + array[j][1]);
                            var wayPoint = new AMap.Autocomplete({
                                input: id
                            });
                            wayPoint.on('select', fenceOperation.dragRoute);
                            $('#' + id).inputClear().on('onClearEvent', fenceOperation.wayPointInputClear);
                        }
                        ;
                        $('.deleteWayPoint').off('click').on('click', fenceOperation.deleteWayPoint);
                    } else {
                        fenceOperation.getAddressValue(array, index, addressArray);
                    }
                }
                ;
            });
        },
        //路径规划完成回调函数
        dragRouteComplete: function (data) {
            isDragRouteFlag = true;
            fenceOperation.clearPointMarker();
            var dragRouteArray = [];
            var start_lnglat = [data.data.start.location.lng, data.data.start.location.lat];
            var wayPointValue = data.data.waypoints;
            var end_lnglat = [data.data.end.location.lng, data.data.end.location.lat];
            dragRouteArray.push(start_lnglat);
            for (var j = 0, len = wayPointValue.length; j < len; j++) {
                dragRouteArray.push([wayPointValue[j].location.lng, wayPointValue[j].location.lat]);
            }
            ;
            dragRouteArray.push(end_lnglat);
            fenceOperation.getAddressValue(dragRouteArray, 0, []);
            var startToEndLngString = '', startToEndLatString = '', wayPointLngString = '', wayPointLatString = '';
            for (var i = 0, len = dragRouteArray.length; i < len; i++) {
                if (i == 0 || i == len - 1) {
                    startToEndLngString += dragRouteArray[i][0] + ';';
                    startToEndLatString += dragRouteArray[i][1] + ';';
                } else {
                    wayPointLngString += dragRouteArray[i][0] + ';';
                    wayPointLatString += dragRouteArray[i][1] + ';';
                }
                ;
            }
            ;
            $('#startToEndLng').val(startToEndLngString);
            $('#startToEndLat').val(startToEndLatString);
            $('#wayPointLng').val(wayPointLngString);
            $('#wayPointLat').val(wayPointLatString);
            //所有点
            var allPointLngLat = lineRoute.getRoute();
            var lngString = '';
            var latString = '';
            for (var i = 0, len = allPointLngLat.length; i < len; i++) {
                lngString += allPointLngLat[i].lng + ';';
                latString += allPointLngLat[i].lat + ';';
            }
            ;
            $('#allPointLng').val(lngString);
            $('#allPointLat').val(latString);
        },
        validate_dragRoute: function () {
            return $("#dragRouteLine").validate({
                rules: {
                    name: {
                        required: true,
                        maxlength: 20
                    },
                    startPoint: {
                        required: true,
                    },
                    endPoint: {
                        required: true,
                    },
                    excursion: {
                        required: true,
                        maxlength: 10
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
                        required: lineNameNull,
                        maxlength: publicSize20
                    },
                    startPoint: {
                        required: fenceOperationTravelLineStart
                    },
                    endPoint: {
                        required: fenceOperationTravelLineEnd
                    },
                    excursion: {
                        required: fenceOperationOffsetNull,
                        maxlength: publicSize10
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
        //添加右键菜单
        addItem: function () {
            $('#addOrUpdateTravelFlag').val('0');
            isAddDragRoute = true;
            //创建右键菜单
            var this_point_lnglat;
            contextMenu = new AMap.ContextMenu();
            contextMenu.addItem("<i class='menu-icon menu-icon-from'></i>&nbsp;&nbsp;&nbsp;<span>起点</span>", function (e) {
                fenceOperation.itemCallBack(this_point_lnglat, 0);
            }, 0);
            contextMenu.addItem("<i class='menu-icon menu-icon-via'></i>&nbsp;&nbsp;&nbsp;<span>途经点</span>", function () {
                fenceOperation.itemCallBack(this_point_lnglat, 1);
            }, 1);
            contextMenu.addItem("<i class='menu-icon menu-icon-to'></i>&nbsp;&nbsp;&nbsp;<span>终点</span>", function () {
                fenceOperation.itemCallBack(this_point_lnglat, 2);
            }, 2);
            contextMenu.addItem("<i class='icon-clearmap'></i>&nbsp;&nbsp;&nbsp;<span>清除路线</span>", function () {
                fenceOperation.itemCallBack(this_point_lnglat, 3);
            }, 3);
            //地图绑定鼠标右击事件——弹出右键菜单
            map.on('rightclick', function (e) {
                if (isAddDragRoute) {
                    this_point_lnglat = [e.lnglat.lng, e.lnglat.lat];
                    contextMenu.open(map, e.lnglat);
                    contextMenuPositon = e.lnglat;
                }
                ;
            });
        },
        //右键菜单选择回调函数
        itemCallBack: function (lnglat, type) {
            if (type != 3) {
                var iconType;
                if (type == 0) { // 起点
                    iconType = '../../resources/img/start_point.png';
                } else if (type == 1) {// 途经
                    iconType = '../../resources/img/mid_point.png';
                } else if (type == 2) {// 终点
                    iconType = '../../resources/img/end_point.png';
                }
                ;
                var dragRouteMarker = new AMap.Marker({
                    map: map,
                    position: lnglat,
                    icon: new AMap.Icon({
                        size: new AMap.Size(40, 40),  //图标大小
                        image: iconType
                    })
                });
                if (type == 0) {
                    if (dragPointMarkerMap.containsKey(type)) {
                        var this_marker = dragPointMarkerMap.get(type);
                        map.remove(this_marker);
                        dragPointMarkerMap.remove(type);
                    }
                    ;
                    dragPointMarkerMap.put(type, dragRouteMarker);
                } else if (type == 2) {
                    if (dragPointMarkerMap.containsKey(type)) {
                        var this_marker = dragPointMarkerMap.get(type);
                        map.remove(this_marker);
                        dragPointMarkerMap.remove(type);
                    }
                    ;
                    dragPointMarkerMap.put(type, dragRouteMarker);
                } else if (type == 1) {
                    var this_marker_array = [];
                    if (dragPointMarkerMap.containsKey(type)) {
                        this_marker_array = dragPointMarkerMap.get(type);
                        dragPointMarkerMap.remove(type);
                    }
                    ;
                    this_marker_array.push(dragRouteMarker);
                    dragPointMarkerMap.put(type, this_marker_array);
                }
                ;
                fenceOperation.getAddressOneInfo(lnglat, type);
            } else {
                isDragRouteFlag = false;
                fenceOperation.clearLineDragRoute();
                fenceOperation.addItem();
                if (lineRoute != undefined) {
                    lineRoute.destroy();
                }
                ;
                $('#drivenRoute').show();
            }
            ;
        },
        //单独一条信息逆地理编码
        getAddressOneInfo: function (array, type) {
            var arrayString = array[0] + ';' + array[1];
            var geocoder = new AMap.Geocoder({
                city: "全国", //城市，默认：“全国”
                radius: 500 //范围，默认：500
            });
            geocoder.getAddress(array);
            geocoder.on('complete', function (GeocoderResult) {
                if (GeocoderResult.type == 'complete') {
                    var this_address_value = GeocoderResult.regeocode.addressComponent.township;
                    var this_address = GeocoderResult.regeocode.formattedAddress;
                    if (type == 0) {
                        $('#startPoint').val(this_address).attr('data-address', this_address).attr('data-lnglat', arrayString);
                    }
                    ;
                    if (type == 2) {
                        $('#endPoint').val(this_address).attr('data-address', this_address).attr('data-lnglat', arrayString);
                    }
                    ;
                    if (type == 1) {
                        fenceOperation.addWayToPoint([this_address, this_address_value, arrayString]);
                    }
                    ;
                    fenceOperation.dragRoute('drag');
                }
                ;
            });
        },
        //清空右键规划的marker
        clearPointMarker: function () {
            if (dragPointMarkerMap != undefined) {
                if (dragPointMarkerMap.containsKey('0')) {
                    var this_marker = dragPointMarkerMap.get('0');
                    map.remove([this_marker]);
                }
                ;
                if (dragPointMarkerMap.containsKey('2')) {
                    var this_marker = dragPointMarkerMap.get('2');
                    map.remove([this_marker]);
                }
                ;
                if (dragPointMarkerMap.containsKey('1')) {
                    var this_marker_array = dragPointMarkerMap.get('1');
                    map.remove(this_marker_array);
                }
                ;
                dragPointMarkerMap.clear();
            }
            ;
        },
        //关闭路径规划
        closeDragRoute: function () {
            isAddDragRoute = false;
            if (contextMenu != undefined) {
                contextMenu.close();
            }
            ;
            $('#drivenRoute').hide();
        },
        //判断是否还有中文
        isChineseChar: function (str) {
            var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
            return reg.test(str);
        },
        //途经点文本框清除事件
        wayPointInputClear: function (e, data) {
            var id = data.id;
            $('#' + id).attr('data-address', '').removeAttr('data-lnglat');
        },
        //关闭围栏修改功能
        closeFenceEdit: function () {
            fenceOperation.lineDragRouteClose();
            if (polyFence != undefined && polyFence.CLASS_NAME == 'AMap.Marker') {
                polyFence.setDraggable(false);
                polyFence.off("mouseup", fenceOperation.moveMarker);
                polyFence = undefined;
            }
            ;
            mouseToolEdit.close(true);
            var polyEditorArray = PolyEditorMap.values();
            if (Array.isArray(polyEditorArray)) {
                for (var i = 0, len = polyEditorArray.length; i < len; i++) {
                    if (Array.isArray(polyEditorArray[i])) {
                        for (var j = 0, fenceLength = polyEditorArray[i].length; j < fenceLength; j++) {
                            polyEditorArray[i][j].close();
                        }
                        ;
                    } else {
                        polyEditorArray[i].close();
                    }
                    ;
                }
                ;
            } else {
                polyEditorArray.close();
            }
            ;
            PolyEditorMap.clear()
        },
        // //围栏所属企业
        // fenceEnterprise: function(){
        //     var setting = {
        //         async : {
        //             url : "/clbs/m/basicinfo/enterprise/professionals/tree",
        //             tyoe : "post",
        //             enable : true,
        //             autoParam : [ "id" ],
        //             contentType : "application/json",
        //             dataType : "json",
        //         },
        //         view : {
        //             dblClickExpand : false
        //         },
        //         data : {
        //             simpleData : {
        //                 enable : true
        //             }
        //         },
        //         callback : {
        //             onClick : fenceOperation.enterpriseonClick
        //         },
        //     };
        //     $.fn.zTree.init($("#markerFenceEnterprise-tree"), setting, null);
        //     $.fn.zTree.init($("#lineFenceEnterprise-tree"), setting, null);
        //     $.fn.zTree.init($("#rectangleFenceEnterprise-tree"), setting, null);
        //     $.fn.zTree.init($("#circleFenceEnterprise-tree"), setting, null);
        //     $.fn.zTree.init($("#polygonFenceEnterprise-tree"), setting, null);
        //     $.fn.zTree.init($("#areaFenceEnterprise-tree"), setting, null);
        //     $.fn.zTree.init($("#dragRouteFenceEnterprise-tree"), setting, null);
        // },
        //属于企业选择
        enterpriseonClick: function (event, treeId, treeNode) {
            var this_tId = treeNode.tId
            if (this_tId.indexOf('markerFenceEnterprise-tree') != -1) {//标注
                $('#markerFenceEnterprise').val(treeNode.name);
                $('#markerGroupId').val(treeNode.id);
                $('#markerFenceEnterprise-content').hide();
            } else if (this_tId.indexOf('lineFenceEnterprise-tree') != -1) {//线
                $('#lineFenceEnterprise').val(treeNode.name);
                $('#lineGroupId').val(treeNode.id);
                $('#lineFenceEnterprise-content').hide();
            } else if (this_tId.indexOf('rectangleFenceEnterprise-tree') != -1) {//矩形
                $('#rectangleFenceEnterprise').val(treeNode.name);
                $('#rectangleGroupId').val(treeNode.id);
                $('#rectangleFenceEnterprise-content').hide();
            } else if (this_tId.indexOf('circleFenceEnterprise-tree') != -1) {//圆形
                $('#circleFenceEnterprise').val(treeNode.name);
                $('#circleGroupId').val(treeNode.id);
                $('#circleFenceEnterprise-content').hide();
            } else if (this_tId.indexOf('polygonFenceEnterprise-tree') != -1) {//多边形
                $('#polygonFenceEnterprise').val(treeNode.name);
                $('#polygonGroupId').val(treeNode.id);
                $('#polygonFenceEnterprise-content').hide();
            } else if (this_tId.indexOf('areaFenceEnterprise-tree') != -1) {//行政区划
                $('#areaFenceEnterprise').val(treeNode.name);
                $('#areaGroupId').val(treeNode.id);
                $('#areaFenceEnterprise-content').hide();
            } else if (this_tId.indexOf('dragRouteFenceEnterprise-tree') != -1) {//行驶路线
                $('#dragRouteFenceEnterprise').val(treeNode.name);
                $('#dragRouteGroupId').val(treeNode.id);
                $('#dragRouteFenceEnterprise-content').hide();
            }
            ;
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
        searchBindFenceTree: function (param) {
            var setQueryChar = {
                async: {
                    url: "/clbs/a/search/monitorTreeFuzzy",
                    type: "post",
                    enable: true,
                    autoParam: ["id"],
                    dataType: "json",
                    sync: false,
                    otherParam: {"type": "multiple", "queryParam": param, "webType": "1"},
                    dataFilter: fenceOperation.ajaxQueryDataFilter
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
                    dblClickExpand: false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree,
                    countClass: "group-number-statistics"
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    beforeClick: fenceOperation.beforeClickFenceVehicle,
                    onAsyncSuccess: fenceOperation.fuzzyZTreeOnAsyncSuccess,
                    //beforeCheck: fenceOperation.fuzzyZTreeBeforeCheck,
                    onCheck: fenceOperation.fuzzyOnCheckVehicle,
                    //onExpand: fenceOperation.zTreeOnExpand,
                    //onNodeCreated: fenceOperation.zTreeOnNodeCreated,
                }
            };
            $.fn.zTree.init($("#treeDemoFence"), setQueryChar, null);
        },
        fuzzyZTreeOnAsyncSuccess: function (event, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj("treeDemoFence");
            zTree.expandAll(true);
            // var treeNodes = getAllChildNodes(zTree);
            // if (treeNodes) {
            //     for (var i = 0, l = treeNodes.length; i < l; i++) {
            //         zTree.checkNode(treeNodes[i], false, true);
            //         if ($.inArray(treeNodes[i].id, oldFencevehicleIds) != -1) {
            //             zTree.checkNode(treeNodes[i], true, true);
            //         }
            //     }
            // }
        },
        fuzzyOnCheckVehicle: function (e, treeId, treeNode) {
            //获取树结构
            var zTree = $.fn.zTree.getZTreeObj("treeDemoFence");
            //获取勾选状态改变的节点
            var changeNodes = zTree.getChangeCheckedNodes();
            if (treeNode.checked) { //若是取消勾选事件则不触发5000判断
                var checkedNodes = zTree.getCheckedNodes(true);
                var nodesLength = 0;
                for (var i = 0; i < checkedNodes.length; i++) {
                    if (checkedNodes[i].type == "people" || checkedNodes[i].type == "vehicle") {
                        nodesLength += 1;
                    }
                }

                if (nodesLength > 5000) {
                    //zTree.checkNode(treeNode,false,true);
                    layer.msg(treeMaxLength5000);
                    for (var i = 0; i < changeNodes.length; i++) {
                        changeNodes[i].checked = false;
                        zTree.updateNode(changeNodes[i]);
                    }
                }
            }
            //获取勾选状态被改变的节点并改变其原来勾选状态（用于5000准确校验）
            for (var i = 0; i < changeNodes.length; i++) {
                changeNodes[i].checkedOld = changeNodes[i].checked;
            }
            // 记录勾选的节点
            var v = "", nodes = zTree.getCheckedNodes(true);
            for (var i = 0, l = nodes.length; i < l; i++) {
                if (nodes[i].type == "vehicle" || nodes[i].type == "people") {
                    v += nodes[i].id + ",";
                }
            }
            vehicleFenceList = v;
        },
        selectDate:function(node){
            var id  = $(node).attr('id');
            laydate.render({elem: '#'+id, theme: '#6dcff6',show: true});
        },
        selectTime:function(node){
            var id  = $(node).attr('id');
            laydate.render({elem: '#'+id, theme: '#6dcff6', type: 'time',show: true});
        }
    };

    customFucn = {
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
            fenceOperation.initDMAList();
            
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
                    fenceOperation.initDMAList();
                }
                return responseData;
            }else{
                layer.msg("您需要先新增一个组织");
                return;
            }

        },
        
        
        
    }
    $(function(){
        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('treeDemo',id,'group');
            };
        });
        var map;
        //地图
    var lineVid = [];//在线车辆id
    var allCid = [];
    var missVid = []//离线车辆id
    var lineAndRun = []//在线行驶id;
    var lineAndStop = [];//在线停止id
    var lineAndAlarm = [];//报警
    var lineAndmiss = [];//未定位
    var offLineTable = [];
    var overSpeed = [];
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
    pageLayout.createMap();
    pageLayout.responseSocket();
    fenceOperation.init();
    fenceOperation.fenceBindList();
    // customFucn.userTree();
    // fenceOperation.initDMAList();
    // fenceOperation.fenceEnterprise();
    amapOperation.init();
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
