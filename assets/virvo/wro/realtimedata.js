(function(window,$){
    var selectTreeId = '';
    var selectTreepId="";
    var selectTreeType = '';
    var sTime,eTime;
    // focus,biguser,alarm
    var station_color_list = ["#02470e","#8c4380","#f20804"];
    //显示隐藏列
    var menu_text = "";
    var table = $("#dataTable tr th:gt(1)");
    //单选
    var subChk = $("input[name='subChk']");

    var travelLineList,AdministrativeRegionsList,fenceIdList,organTree=$("#treeDemo"),
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
    $contentLeft = $("#content-left"), $contentRight = $("#content-right"), $sidebar = $(".sidebar"), $mainContentWrapper = $(".main-content-wrapper"), $thetree = $("#treeDemo"),
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
        // winHeight = $(window).height();//可视区域高度
        winHeight = $(".sidebar").height();//sidebar height
        console.log("wHeight:",winHeight);
        headerHeight = $("#header").height();//头部高度
        var stationStateHeight = $("#station_status").height()
        console.log("station status height",stationStateHeight);
        var paneHeaderHeight = $(".panel-heading").height();
        console.log("paneHeaderHeight",paneHeaderHeight);

        
        //树高度
        var newContLeftH = winHeight - headerHeight - stationStateHeight - 2*paneHeaderHeight - 80;
        // //sidebar高度
        // $(".sidebar").css('height',newContLeftH + 'px');
        // organTree.css('height',newContLeftH + 'px');
        //计算顶部logo相关padding
        logoWidth = $("#header .brand").width();
        btnIconWidth = $("#header .toggle-navigation").width();
        windowWidth = $(window).width();
        newwidth = (logoWidth + btnIconWidth + 40) / windowWidth * 100 - 0.5;
        
        
        //加载时隐藏left同时计算宽度
        $sidebar.attr("class", "sidebar sidebar-toggle");
       $mainContentWrapper.attr("class", "main-content-wrapper main-content-toggle-left");
        // //操作树高度自适应
        var newTreeH = winHeight - headerHeight - 2*stationStateHeight - 2*paneHeaderHeight;
        console.log("newTreeH=",newTreeH)
        organTree.css({
            "height": newTreeH + "px"
        });

        //左右自适应宽度
        $contentLeft.css({
            "width": newwidth + "%",
            "height":newTreeH +  + 'px'
        });
        $contentRight.css({
            "width": 100 - newwidth + "%",
            "height":newTreeH + 'px'
        });
        // //视频区域自适应
        // var mainContentHeight = $contentLeft.height();
        // var adjustHeight = $(".adjust-area").height();
        // videoHeight = (mainContentHeight - adjustHeight - 65) / 2;
        // $(".videoArea").css("height", videoHeight + "px");
        // //地图拖动改变大小
        // oldMapHeight = $MapContainer.height();
        // myTabHeight = $myTab.height();
        // wHeight = $(window).height();
        // console.log("wHeight:",wHeight);
        // // 页面区域定位
        // $(".amap-logo").attr("href", "javascript:void(0)").attr("target", "");
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
            // $("body").css("overflow", "hidden");
        };
        $(".imitateMenuBg").toggleClass("imitateMenuBg-left");
        $(".defaultFootBg").toggleClass("defaultFootBg-left");

        
        window.onresize=function(){
            winHeight = $(window).height();//可视区域高度
            console.log("onresize:",winHeight);
            headerHeight = $("#header").height();//头部高度
            var stationStateHeight = $("#station_status").height()
            console.log("station status height",stationStateHeight);
            var paneHeaderHeight = $(".panel-heading").height();
            console.log("paneHeaderHeight",paneHeaderHeight);
            
            var newContLeftH = winHeight - headerHeight - stationStateHeight - 2*paneHeaderHeight - 80;
            //sidebar高度
            // $(".sidebar").css('height',newContLeftH + 'px');
            // organTree.css('height',newContLeftH + 'px');

            //计算顶部logo相关padding
            logoWidth = $("#header .brand").width();
            btnIconWidth = $("#header .toggle-navigation").width();
            windowWidth = $(window).width();
            newwidth = (logoWidth + btnIconWidth + 40) / windowWidth * 100;
            //左右自适应宽度
            $contentLeft.css({
                "width": newwidth + "%"
            });
            $contentRight.css({
                "width": 100 - newwidth + "%",
                "height":newTreeH + "px"
            });
          //操作树高度自适应
            var newTreeH = winHeight - headerHeight - 503;
            organTree.css({
                "height": newTreeH + "px"
            });
            
            }
        },
    },
    realtimeData = {
        init: function(){
            menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(2) +"\" disabled />"+ table[0].innerHTML +"</label></li>"
            for(var i = 1; i < table.length; i++){
                menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(i+2) +"\" />"+ table[i].innerHTML +"</label></li>"
            };
            $("#Ul-menu-text").html(menu_text);
            //表格列定义
            var columnDefs = [ 
                { "orderable": false, "targets": [ 0 ] },
                { "orderSequence": [ "asc","desc" ], "targets": [ 1 ] },
                { "orderable": false, "targets": [ 3,7,13,14,15 ] },
                // { "orderable": false, "targets": [ 3 ] },
                // { "orderSequence": [ "desc", "asc", "asc" ], "targets": [ 2 ] },
                { "orderSequence": [ "asc","desc" ], "targets": [ 3 ] }
            ];
            var columns = [
                    {
                        //第一列，用来显示序号
                        "data" : null,
                        "class" : "text-center"
                    },
                    {
                        "data" : "userid",
                        "class" : "text-center",
                        
                    } ,
                    {
                        "data" : "username",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            ret_html='<a href="/monitor/realtimedata/realtimeData/'+row.id+'/"  data-target="#commonSIWin" data-toggle="modal"  >'+data+'</a>&nbsp;';
                            return ret_html;
                            if (data != null) {
                                return data;
                            } else{
                                return "";
                            }
                        }
                    },
                    {
                        "data" : "belongto",
                        "class" : "text-center", //最后一列，操作按钮
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return "";
                            }
                        }
                    }, {
                        "data" : "serialnumber",
                        "class" : "text-center",
                        
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return "";
                            }
                        }
                    },
                    {
                        "data" : "manufacturer",
                        "class" : "text-center",
                    } ,
                    {
                        "data" : "metertype",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data == "0") {
                                return "电磁水表";
                            } else if (data == "1"){
                                return "超声水表";
                            } else if (data == "2"){
                                return "机械水表";
                            }else if (data == "3"){
                                return "插入电磁";
                            }else {
                                return data;
                            }

                        }
                    } ,
                    {
                        "data" : "dn",
                        "class" : "text-center",
                        
                    } ,
                    {
                        "data" : "commstate",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data == "1") {
                                return "在线";
                            } else if (data == "0"){
                                return "离线";
                            } else {
                                return data;
                            }

                        }
                    }, 
                    {
                        "data" : "fluxreadtime",
                        "class" : "text-center",
                        render : function(data,type,row,meta){
                            if(row.pressure != "" && row.pressure != null && (row.flux == "" || row.flux == null))
                            {
                                // console.log(row)
                                return row.pressurereadtime;
                            }
                            return data;

                        }
                    }, 
                    // {
                    //     "data" : "pickperiod",
                    //     "class" : "text-center",
                        

                    // },
                    // {
                    //     "data":"reportperiod",
                    // },
                     {
                        "data" : "flux",
                        "class" : "text-center",
                        

                    },{
                        "data" : "plustotalflux",
                        "class" : "text-center",
                        render : function(data,type,row,meta){
                            return Number((parseFloat(data)).toFixed(0));

                        }
                    },  {
                        "data" : "pressure",
                        "class" : "text-center",
                        
                    },
                    {
                        "data" : "day_use",
                        "class" : "text-center",
                    } ,
                    {
                        "data" : "month_use",
                        "class" : "text-center",
                    } ,
                    {
                        "data" : "range_use",
                        "class" : "text-center",
                    } ,
                    {
                        "data" : "reversetotalflux",
                        "class" : "text-center",
                        render : function(data,type,row,meta){
                            return Number((parseFloat(data)).toFixed(0));

                        }                                                                                                                            
                    }, {
                        "data" : "meterv",
                        "class" : "text-center",
                        
                    },{
                        "data" : "gprsv",
                        "class" : "text-center",
                        
                    
                    },
                    // {
                    //     "data":"signlen",
                    //     "class":"text-center",
                        
                    // }, 
                    {
                        "data" : "alarm",
                        "class" : "text-center",
                        render:function(data,type,row,meta){
                            if(data==0){
                                ret_html= ""
                            }else{
                                ret_html='<button href="/monitor/rtdata/showalarm/'+row.id+'/"  data-target="#commonLgWin" data-toggle="modal"  type="button" class="btn-danger" >'+data+'</button>&nbsp;';
                            }
                            return ret_html;
                        }
                    }
                    ];
            //ajax参数
            var ajaxDataParamFun = function(d) {
                d.simpleQueryParam = $('#simpleQueryParam').val(); //模糊查询
                d.groupName = selectTreeId;
                d.groupType = selectTreeType;

                d.sTime = sTime;
                d.eTime = eTime;

            };
            //表格setting
            var setting = {
                suffix  : '/',
                listUrl : '/api/monitor/station/list/',
                // editUrl : '/devm/meter/edit/',
                // deleteUrl : '/devm/meter/delete/',
                // deletemoreUrl : '/devm/meter/deletemore/',
                // enableUrl : '/devm/meter/enable_',
                // disableUrl : '/devm/meter/disable_',
                columnDefs : columnDefs, //表格列定义
                columns : columns, //表格列
                dataTableDiv : 'dataTable', //表格
                ajaxDataParamFun : ajaxDataParamFun, //ajax参数
                pageable : true, //是否分页
                showIndexColumn : true, //是否显示第一列的索引列
                enabledChange : true,
                ordering:true,
                pageNumber:20,
                // drawCallbackFun:realtimeData.drawCallbackFun,
            };
            //创建表格
            myTable = new TG_Tabel.createNew(setting);
            //表格初始化
            myTable.init();


        },
        drawCallbackFun:function(){
// alert("akjdsfjsdf")
            
        },
        //全选
        cleckAll: function(){
            $("input[name='subChk']").prop("checked", this.checked);
        },
        //单选
        subChkClick: function(){
            $("#checkAll").prop("checked",subChk.length == subChk.filter(":checked").length ? true: false);
        },
        //批量删除
        delModel: function(){
            //判断是否至少选择一项
            var chechedNum = $("input[name='subChk']:checked").length;
            if (chechedNum == 0) {
                layer.msg(selectItem,{move:false});
                return
            }
            var checkedList = new Array();
            $("input[name='subChk']:checked").each(function() {
                checkedList.push($(this).val());
            });
            myTable.deleteItems({
                'deltems' : checkedList.toString()
            });
        },
        //加载完成后执行
        refreshTable: function(){
            $("#simpleQueryParam").val("");
//            selectTreeId = '';
//            selectTreeType = '';
//            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
//            zTree.selectNode("");
//            zTree.cancelSelectedNode();
            myTable.requestData();
            
        },
        groupListTree : function(){
            var treeSetting = {
                async : {
                    url : "/api/entm/organization/tree/",
                    type : "GET",
                    enable : true,
                    autoParam : [ "id" ],
                    dataType : "json",
                    otherParam : {  // 是否可选  Organization
                        "isOrg" : "1",
                        "isStation":"1",
                        "isPressure":"1",
                        "isFilter":"0",
                        "iscountstation":"1"
                    },
                    dataFilter: realtimeData.groupAjaxDataFilter
                },
                view : {
                    selectedMulti : false,
                    nameIsHTML: true,
                    // fontCss: setFontCss_ztree
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    onAsyncSuccess: realtimeData.AsyncSuccess,
                    onClick : realtimeData.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#treeDemo"), treeSetting, null);
        },
        //组织树预处理函数
        groupAjaxDataFilter: function(treeId, parentNode, responseData){
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            if (responseData) {
                for (var i = 0; i < responseData.length; i++) {
                    responseData[i].open = true;
                }
            }
            return responseData;
        },
        AsyncSuccess:function(treeId) {
            realtimeData.updateTreeNodeColor();
            close_ztree("treeDemo");
            
        },
        updateTreeNodeColor:function(){
            //
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            var nodes = treeObj.getCheckedNodes(true);
            allNodes = treeObj.getNodes();
            var childNodes = treeObj.transformToArray(allNodes[0]);
            
            for ( var j = 0; j < childNodes.length; j++) {
    
                
                
                if (childNodes[j].otype == "station") {
    
                    
                    //set color 
                    var colorstr;
                    if(childNodes[j].focus == "1"){
                        colorstr = station_color_list[0];
                    }else if(childNodes[j].biguser == "1"){
                        colorstr = station_color_list[1];
                    }else if(childNodes[j].alarm == "1"){
                        colorstr = station_color_list[2];
                    }else {
                        colorstr = "#333333";
                    }
                    treeObj.setting.view.fontCss["color"] = colorstr;
                    
                    //调用updateNode(node)接口进行更新
                    treeObj.updateNode(childNodes[j]);
                    
                    
                }
            }
    
            
        },
        //点击节点
        zTreeOnClick: function(event, treeId, treeNode){
            if(treeNode.otype=="group"){
                selectTreepId=treeNode.id;
                selectTreeId = treeNode.uuid;
                $("#simpleQueryParam").val("");
            }else {
                selectTreepId=treeNode.pId;
                // selectTreeId = treeNode.id;
            }
            selectTreeType = treeNode.otype;
            myTable.requestData();
        },
        //左侧数据日历及对象树隐藏方法
    leftToolBarHideFn: function () {
        if ($('#scalingBtn').hasClass('fa-chevron-down')) {
        //   oldMHeight = $("#map").height();
        //   oldTHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
          $('#scalingBtn').attr('class', 'fa fa-chevron-up');
        }
        ;
        $("#content-left").hide();
        $("#content-right").attr("class", "col-md-12 content-right");
        $("#content-right").css("width", "100%");
        $("#goShow").show();
        //点击隐藏轨迹回放查询
        // $("#map").css({
        //   "height": (initialMapH - 5) + "px"
        // });
        // $(".trackPlaybackTable .dataTables_scrollBody").css({
        //   "height": 0 + "px"
        // });
      },
      //左侧数据日历及对象树显示方法
      leftToolBarShowFn: function () {
        $('#scalingBtn').attr('class', 'fa fa-chevron-down');
        // if ($(".dataTables_scrollBody").length == 0) {
        //   $("#map").css({
        //     "height": initialMapH + "px"
        //   });
        //   $(".trackPlaybackTable .dataTables_scrollBody").css({
        //     "height": 0 + "px"
        //   });
        // } else {
        //   $("#map").css({
        //     "height": oldMHeight + "px"
        //   });
        //   $(".trackPlaybackTable .dataTables_scrollBody").css({
        //     "height": oldTHeight + "px"
        //   });
        // }
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
      //开始时间
      startDay: function (day) {
        var timeInterval = $('#timeInterval').val().split('--');
        var startValue = timeInterval[0];
        var endValue = timeInterval[1];
        if (startValue == "" || endValue == "") {
            var today = new Date();
            var targetday_milliseconds = today.getTime() + 1000 * 60 * 60
                * 24 * day;

            today.setTime(targetday_milliseconds); //注意，这行是关键代码

            var tYear = today.getFullYear();
            var tMonth = today.getMonth();
            var tDate = today.getDate();
            tMonth = realtimeData.doHandleMonth(tMonth + 1);
            tDate = realtimeData.doHandleMonth(tDate);
            var num = -(day + 1);
            startTime = tYear + "-" + tMonth + "-" + tDate + " "
                + "00:00:00";
            var end_milliseconds = today.getTime() + 1000 * 60 * 60 * 24
                * parseInt(num);
            today.setTime(end_milliseconds); //注意，这行是关键代码
            var endYear = today.getFullYear();
            var endMonth = today.getMonth();
            var endDate = today.getDate();
            endMonth = realtimeData.doHandleMonth(endMonth + 1);
            endDate = realtimeData.doHandleMonth(endDate);
            endTime = endYear + "-" + endMonth + "-" + endDate + " "
                + "23:59:59";
        } else {
            var startTimeIndex = startValue.slice(0, 10).replace("-", "/").replace("-", "/");
            var vtoday_milliseconds = Date.parse(startTimeIndex) + 1000 * 60 * 60 * 24 * day;
            var dateList = new Date();
            dateList.setTime(vtoday_milliseconds);
            var vYear = dateList.getFullYear();
            var vMonth = dateList.getMonth();
            var vDate = dateList.getDate();
            vMonth = realtimeData.doHandleMonth(vMonth + 1);
            vDate = realtimeData.doHandleMonth(vDate);
            startTime = vYear + "-" + vMonth + "-" + vDate + " "
                + "00:00:00";
            if (day == 1) {
                endTime = vYear + "-" + vMonth + "-" + vDate + " "
                    + "23:59:59";
            } else {
                var endNum = -1;
                var vendtoday_milliseconds = Date.parse(startTimeIndex) + 1000 * 60 * 60 * 24 * parseInt(endNum);
                var dateEnd = new Date();
                dateEnd.setTime(vendtoday_milliseconds);
                var vendYear = dateEnd.getFullYear();
                var vendMonth = dateEnd.getMonth();
                var vendDate = dateEnd.getDate();
                vendMonth = realtimeData.doHandleMonth(vendMonth + 1);
                vendDate = realtimeData.doHandleMonth(vendDate);
                endTime = vendYear + "-" + vendMonth + "-" + vendDate + " "
                    + "23:59:59";
            }
        }
    },
    doHandleMonth: function (month) {
        var m = month;
        if (month.toString().length == 1) {
            m = "0" + month;
        }
        return m;
    },
    //当前时间
    getsTheCurrentTime: function () {
        var nowDate = new Date();
        startTime = nowDate.getFullYear()
            + "-"
            + (parseInt(nowDate.getMonth() + 1) < 10 ? "0"
                + parseInt(nowDate.getMonth() + 1)
                : parseInt(nowDate.getMonth() + 1))
            + "-"
            + (nowDate.getDate() < 10 ? "0" + nowDate.getDate()
                : nowDate.getDate()) + " " + "00:00:00";
        endTime = nowDate.getFullYear()
            + "-"
            + (parseInt(nowDate.getMonth() + 1) < 10 ? "0"
                + parseInt(nowDate.getMonth() + 1)
                : parseInt(nowDate.getMonth() + 1))
            + "-"
            + (nowDate.getDate() < 10 ? "0" + nowDate.getDate()
                : nowDate.getDate())
            + " "
            + ("23")
            + ":"
            + ("59")
            + ":"
            + ("59");
        var atime = $("#atime").val();
        if (atime != undefined && atime != "") {
            startTime = atime;
        }
    },
    unique: function (arr) {
        var result = [], hash = {};
        for (var i = 0, elem; (elem = arr[i]) != null; i++) {
            if (!hash[elem]) {
                result.push(elem);
                hash[elem] = true;
            }
        }
        return result;
    },
    estimate: function () {
        var timeInterval = $('#timeInterval').val().split('--');
        sTime = timeInterval[0];
        eTime = timeInterval[1];
        realtimeData.getsTheCurrentTime();
        if (eTime > endTime) {                              //查询判断
            layer.msg(endTimeGtNowTime, {move: false});
            key = false
            return;
        }
        if (sTime > eTime) {
            layer.msg(endtimeComStarttime, {move: false});
            key = false;
            return;
        }
        var nowdays = new Date();                       // 获取当前时间  计算上个月的第一天
        var year = nowdays.getFullYear();
        var month = nowdays.getMonth();
        if (month == 0) {
            month = 12;
            year = year - 1;
        }
        if (month < 10) {
            month = "0" + month;
        }
        var firstDay = year + "-" + month + "-" + "01 00:00:00";//上个月的第一天
        if (sTime < firstDay) {                                 //查询判断开始时间不能超过       上个月的第一天
            $("#timeInterval-error").html(starTimeExceedOne).show();
            /*layer.msg(starTimeExceedOne, {move: false});
            key = false;*/
            return;
        }
        $("#timeInterval-error").hide();
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");       //遍历树节点，获取vehicleID 存入集合
        var nodes = treeObj.getCheckedNodes(true);
        vid = "";
        for (var j = 0; j < nodes.length; j++) {
            if (nodes[j].type == "vehicle") {
                vid += nodes[j].id + ",";
            }
        }
        key = true;
        startTime=sTime;
        endTime=eTime;
    },
    getrangeflow_data:function(){
        // return;
        realtimeData.estimate();
        myTable.requestData();
        return;
        // $("#flow-show-data").css("display","block")
        // $("#flaw-show-echart").css("display","none")
        var table = $("#dataTable").dataTable();
        
        
        var rows = table.fnGetNodes();
        var list = [];
        $.each(table.fnGetNodes(), function (index, value) {
            console.log(index,value);
            

            var commaddr = $(value).find('td:eq(5)').html();
            var station_type = $(value).find('td:eq(6)').html();
            
            console.log(commaddr)
            
        $('#dataTable').find('tr#'+index).find('td:eq(15)').html('newValue');
    });
        $('#dataTable').find('td:eq(15)').html('newValue');
        return;
        // table.cell('#td_5_' + data.job_id).data(variable)
        commaddr = $("#objId").val();
        // console.log("commaddr=",commaddr,t1,t2);
        $.ajax({
            type: "GET",
            url: "/api/monitor/realtimedata/getrangeflow_data/",
            data: {
              "commaddr": commaddr,
              "stime":sTime,
              "etime":eTime
            },
            dataType: "json",
            success: function (data) {
                // console.log(data)
                if(data.success)
                {
                    var data_flow = [];
                    

                    dm = data.rawdata; //object
                    // console.log(dm)
                    $.each(dm,function(i,d){
                        
                        var e = {};
                        e.seqno =i+1;
                        e.readtime = d.readtime;
                        e.flux = d.flux;
                        // e.reversetotalflux = d.reversetotalflux;
                        data_flow.push(e);
                    })
                    
                    console.log(data_flow)
                        $("#instancerawdata-table").bootstrapTable("destroy");
                        $("#instancerawdata-table").bootstrapTable({
                            data: data_flow,
                            classes: 'table table-condensed table-no-bordered', 
                            striped: false,
                            height: "300"
                        })
                        // $("#rawdata-table").bootstrapTable({'load':data_flow})
                }

            }
        });
    },


    }

    $(function(){
        $('input').inputClear();
        
        realtimeData.init();
        realtimeData.groupListTree();

        $('#timeInterval').dateRangePicker({dateLimit:30});
        realtimeData.startDay(-7);
        $('#timeInterval').val(startTime + '--' + endTime);
        realtimeData.estimate();

        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('treeDemo', id,'station');
            };
        });
        //IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            var search;
            $("#search_condition").bind("focus",function(){
                search = setInterval(function(){
                    search_ztree('treeDemo', 'search_condition','station');
                },500);
            }).bind("blur",function(){
                clearInterval(search);
            });
        }

        // $("#toggle-left").bind("click",'button', function(e) {
        //     $(".sidebarRight").hasClass(".sidebar-toggle-right") || ($(".sidebarRight").removeClass("sidebar-toggle-right"),
        //     $(".main-content-wrapper").removeClass("main-content-toggle-right")),
        //     $(".sidebar").toggleClass("sidebar-toggle"),
        //     $(".main-content-wrapper").toggleClass("main-content-toggle-left"),
        //     $(".imitateMenuBg").toggleClass("imitateMenuBg-left"),
        //     $(".defaultFootBg").toggleClass("defaultFootBg-left"),
        //     e.stopPropagation()
        // })
        //全选
        $("#checkAll").bind("click",realtimeData.cleckAll);
        //单选
        subChk.bind("click",realtimeData.subChkClick);
        //批量删除
        $("#del_model").bind("click",realtimeData.delModel);
        //加载完成后执行
        $("#refreshTable").on("click",realtimeData.refreshTable);
        

        pageLayout.init();

    $("#goHidden").on("click", realtimeData.leftToolBarHideFn);
    $("#goShow").on("click", realtimeData.leftToolBarShowFn);

    $("#inquirefluxflow").on('click',function(){
        realtimeData.estimate();
        realtimeData.getrangeflow_data();
        });

        $('.dumb').click(function() {
            
            // this.href="/wirelessm/watermeter/exportbyselect/";
            $(this).attr("href", "/monitor/realtimedata/export/?groupName="+selectTreeId+"&groupType="+selectTreeType
            +"&selectTreeType="+selectTreeType
            );

            // $(this).attr("href", this.href + "?communityid="+selectTreeId+"&dnselect=25");
                
        });

        $('#dataTable').on( 'draw', function ( e, settings, len ) {
            // console.log( 'New page length: '+len );
            
            winHeight = $(window).height();
            var newpageheight = $('#dataTable').height();
            var sidebarHeight = $('.sidebar').height()

            if(newpageheight > sidebarHeight){

                // console.log("winHeight",winHeight,newpageheight);
                headerHeight = $("#header").height();//头部高度
                var stationStateHeight = $("#station_status").height()
                // console.log("station status height",stationStateHeight);
                var paneHeaderHeight = $(".panel-heading").height();
                // console.log("paneHeaderHeight",paneHeaderHeight);
                
                var newContLeftH = newpageheight - headerHeight - stationStateHeight - 2*paneHeaderHeight - 100;
                //sidebar高度
                // $(".sidebar").css('height',newContLeftH + 'px');
                // organTree.css('height',newpageheight + 'px');
            }
            // $('#sidebar').css({"height":newpageheight+"px"});
            // console.log("sidwbar heith",sidebarHeight);
            var newTreeH = newpageheight - headerHeight - 110;
            // console.log("newpageheight heith",newpageheight);

            // console.log("newTreeH heith",newTreeH);

            organTree.css('height',newTreeH + 'px');
        } );

        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('treeDemo', 'search_condition', 'station');
        });
    })
})(window,$)