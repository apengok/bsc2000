(function(window,$){
    var selectTreeId = '';
    var selectTreepId="";
    var selectTreeType = '';
    var organ = $("#organ_name").val();
    var station = $("station_name").val();
    var station_id = $("#station_id").val();
    var startTime = '';
    var endTime = endTime;

    //显示隐藏列
    var menu_text = "";
    var table = $("#dataTable tr th:gt(1)");
    //单选
    var subChk = $("input[name='subChk']");
    historyData = {
        init: function(){
            menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(2) +"\" disabled />"+ table[0].innerHTML +"</label></li>"
            for(var i = 1; i < table.length; i++){
                menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(i+2) +"\" />"+ table[i].innerHTML +"</label></li>"
            };
            $("#Ul-menu-text").html(menu_text);
            //表格列定义
            var columnDefs = [ {
                //第一列，用来显示序号
                "searchable" : false,
                "orderable" : false,
                "targets" : 0
            } ];
            var columns = [
                    {
                        //第一列，用来显示序号
                        "data" : null,
                        "class" : "text-center"
                    },
                    
                    {
                        "data" : "readtime",
                        "class" : "text-center",
                        
                    }, {
                        "data" : "totalflux",
                        "class" : "text-center",
                        render:function(data){
                            return html2Escape(data)
                        }
                    }, 
                    
                     {
                        "data" : "influx",
                        "class" : "text-center",
                        

                    },{
                        "data" : "plusflux",
                        "class" : "text-center",
                        
                    }, {
                        "data" : "revertflux",
                        "class" : "text-center",
                        
                    }, {
                        "data" : "press",
                        "class" : "text-center",
                        render:function(data){
                            return html2Escape(data)
                        }
                    }
                    ];
            //ajax参数
            var ajaxDataParamFun = function(d) {
                d.simpleQueryParam = $('#simpleQueryParam').val(); //模糊查询
                d.groupName = selectTreeId;
                d.groupType = selectTreeType;

                d.startTime = startTime;
                d.endTime = endTime;
                d.organ = organ;
                d.station_id = station_id;

            };
            //表格setting
            var setting = {
                suffix  : '/',
                listUrl : '/analysis/historydata/list',
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
                enabledChange : true
            };
            //创建表格
            myTable = new TG_Tabel.createNew(setting);
            //表格初始化
            myTable.init();
        },
        //全选
        cleckAll: function(){
            $("input[name='subChk']").prop("checked", this.checked);
        },
        //单选
        subChkClick: function(){
            $("#checkAll").prop("checked",subChk.length == subChk.filter(":checked").length ? true: false);
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
                tMonth = historyData.doHandleMonth(tMonth + 1);
                tDate = historyData.doHandleMonth(tDate);
                var num = -(day + 1);
                startTime = tYear + "-" + tMonth + "-" + tDate + " "
                    + "00:00:00";
                var end_milliseconds = today.getTime() + 1000 * 60 * 60 * 24
                    * parseInt(num);
                today.setTime(end_milliseconds); //注意，这行是关键代码
                var endYear = today.getFullYear();
                var endMonth = today.getMonth();
                var endDate = today.getDate();
                endMonth = historyData.doHandleMonth(endMonth + 1);
                endDate = historyData.doHandleMonth(endDate);
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
                vMonth = historyData.doHandleMonth(vMonth + 1);
                vDate = historyData.doHandleMonth(vDate);
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
                    vendMonth = historyData.doHandleMonth(vendMonth + 1);
                    vendDate = historyData.doHandleMonth(vendDate);
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
            historyData.getsTheCurrentTime();
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
        validates: function () {
            return $("#hourslist").validate({
                rules: {
                    organ_name: {
                        required: true
                    },
                    stationname: {
                        required: true,
                        // compareDate: "#timeInterval",
                    }
                },
                messages: {
                    organ_name: {
                        required: "所属组织不能为空",
                    },
                    stationname: {
                        required: "站点不能为空",
                        // compareDate: endtimeComStarttime,
                    }
                }
            }).form();
        },
        inquireClick: function (num) {
            historyData.estimate();
            historyData.refreshTable();
            // $(".mileage-Content").css("display", "block");  //显示图表主体
            // number = num;
            
            // if (num != 1) {
            //     $('#timeInterval').val(startTime + '--' + endTime);
            // }
            // if (!historyData.validates()) {
            //     return;
            // }
            // historyData.estimate();
            // dataListArray = [];
            // var url = "/analysis/history/data/";
            
            // var data = {"organ": organ,"treetype":selectTreeType,"station":station, 'startTime': sTime, "endTime": eTime};
            // json_ajax("POST", url, "json", false, data, historyData.queryCallback);     //发送请求
        },
        queryCallback:function(data){

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
                    url : "/dmam/district/dmatree/",
                    tyoe : "post",
                    enable : true,
                    autoParam : [ "id" ],
                    dataType : "json",
                    otherParam : {  // 是否可选  Organization
                        "isOrg" : "1",
                        "isStation":"1"
                    },
                    dataFilter: historyData.groupAjaxDataFilter
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
                    // onAsyncSuccess:historyData.zTreeOnAsyncSuccess,
                    onClick : historyData.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#treeDemo"), treeSetting, null);
        },
        zTreeOnAsyncSuccess:function(event, treeId, treeNode, msg) {
            // alert(msg);
            console.log(event);
            console.log(treeId);
            console.log(treeNode);
            console.log(msg);
        },
        //组织树预处理函数
        groupAjaxDataFilter: function(treeId, parentNode, responseData){
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            var flag0 = 0;
            $("#organ_name").attr("value",responseData[0].name);
            if (responseData) {
                for (var i = 0; i < responseData.length; i++) {
                    if(responseData[i].type == "station" && flag0 == 0){
                        $("#station_name").attr("value",responseData[i].name);
                        station_id = responseData[i].id;
                        flag0 = 1;
                    }
                    // console.log(i,responseData[i].id,responseData[i].name);
                    responseData[i].open = true;
                }
            }
            return responseData;
        },
        //点击节点
        zTreeOnClick: function(event, treeId, treeNode){
            if(treeNode.type=="group"){
                selectTreepId=treeNode.id;
                selectTreeId = treeNode.uuid;
                $("#simpleQueryParam").val("");
            }else {
                selectTreepId=treeNode.pId;
                station_id = treeNode.id;
                var pNode = treeNode.getParentNode();
                $("#station_id").attr("value",station_id);
                $("#organ_name").attr("value",pNode.name);
                $("#station_name").attr("value",treeNode.name);
                // selectTreeId = treeNode.id;
            }
            selectTreeType = treeNode.type;
            myTable.requestData();
        },

    }

    $(function(){
        $('input').inputClear();
        historyData.init();
        historyData.groupListTree();
        $('#timeInterval').dateRangePicker({dateLimit:30});
        historyData.getsTheCurrentTime();  
        historyData.startDay(-7);  
        $('#timeInterval').val(startTime + '--' + endTime);
        historyData.inquireClick(1);

        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('treeDemo', id,'assignment');
            };
        });
        //IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            var search;
            $("#search_condition").bind("focus",function(){
                search = setInterval(function(){
                    search_ztree('treeDemo', 'search_condition','assignment');
                },500);
            }).bind("blur",function(){
                clearInterval(search);
            });
        }
        //全选
        $("#checkAll").bind("click",historyData.cleckAll);
        //单选
        subChk.bind("click",historyData.subChkClick);
        
        //加载完成后执行
        $("#refreshTable").on("click",historyData.refreshTable);
        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('treeDemo', 'search_condition', 'assignment');
        });
    })
})(window,$)