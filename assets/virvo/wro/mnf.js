(function($,window){
    var selectTreeId = '';
    var selectDistrictId = '';
    var selectTreeType = '';
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
    var vagueSearchlast = $("#operationType").val();

    var dataListArray = [];
    var endTime;// 当天时间
    var sTime;
    var eTime;
    var key = true;
    var vid;
    var carLicense = [];
    var activeDays = [];
    var organ = '';
    var station = '';
    var bflag = true;
    var zTreeIdJson = {};
    var barWidth;
    var number;
    var checkFlag = false; //判断组织节点是否是勾选操作
    var size;//当前权限监控对象数量
    var online_length;
    analysisMnf = {
        init: function(){
            console.log("analysisMnf init");
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
                        "isDma" : "1"
                        // "csrfmiddlewaretoken": "{{ csrf_token }}"
                    },
                    dataFilter: analysisMnf.ajaxDataFilter
                },
                view : {
                    // addHoverDom : analysisMnf.addHoverDom,
                    // removeHoverDom : analysisMnf.removeHoverDom,
                    selectedMulti : false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree
                },
                edit : {
                    enable : true,
                    editNameSelectAll : true,
                    showRemoveBtn : false,//analysisMnf.showRemoveBtn,
                    showRenameBtn : false
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    // beforeDrag : analysisMnf.beforeDrag,
                    // beforeEditName : analysisMnf.beforeEditName,
                    // beforeRemove : analysisMnf.beforeRemove,
                    // beforeRename : analysisMnf.beforeRename,
                    // onRemove : analysisMnf.onRemove,
                    // onRename : analysisMnf.onRename,
                    onAsyncSuccess: analysisMnf.zTreeOnAsyncSuccess,
                    onClick : analysisMnf.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#treeDemo"), treeSetting, zNodes);
            var treeObj = $.fn.zTree.getZTreeObj('treeDemo');treeObj.expandAll(true);
           
        },

        zTreeOnAsyncSuccess: function (event, treeId, treeNode, msg) {
            close_ztree("treeDemo");
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            var nodes = treeObj.getCheckedNodes(true);
            allNodes = treeObj.getNodes();
            var childNodes = treeObj.transformToArray(allNodes[0]);
            for (var i = 0; i < childNodes.length; i++) {
                if(childNodes[i].otype == "dma")
                {
                    // $("#station_id").val(childNodes[i].id);
                    $("#station_name").val(childNodes[i].name);
                    $("#organ_name").val(childNodes[i].getParentNode().name);
                    organ = childNodes[i].getParentNode().id;
                    station = childNodes[i].id;
                    analysisMnf.inquireClick(1);
                    treetype = childNodes[i].otype;
                    break;
                }
                
            }
            
            bflag = false;
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
        getTime: function(){
            var now = new Date(), h = now.getHours(), m = now.getMinutes(), s = now
                .getSeconds(), ms = now.getMilliseconds();
            return (h + ":" + m + ":" + s + " " + ms);
        },
        selectAll: function(){
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.treeSetting.edit.editNameSelectAll = $("#selectAll").attr("checked");
        },
        //点击节点
        zTreeOnClick: function(event, treeId, treeNode){
            selectTreeId = treeNode.id;
            selectTreeType = treeNode.otype;
            selectDistrictId = treeNode.districtid;
            selectTreeIdAdd = treeNode.uuid;
            station = treeNode.id;
            $('#simpleQueryParam').val("");
            $("#organ_name").attr("value",treeNode.name);
            $("#station_name").attr("value","");
            if(treeNode.otype == "dma"){
                var pNode = treeNode.getParentNode();
                $("#organ_name").attr("value",pNode.name);
                $("#station_name").attr("value",treeNode.name);
                organ = pNode.id;
                station = treeNode.id;
            }

            analysisMnf.inquireClick(1);
            // myTable.requestData();
        },
        // ajax参数
        ajaxDataParamFun: function(d){
            d.simpleQueryParam = $('#simpleQueryParam').val(); // 模糊查询
            d.groupName = selectTreeId;
            d.districtId = selectDistrictId;
        },
        findCallback:function(data){
            if(data.success){
                var operations=[];
                if(data.obj.operation != null || data.obj.operation.length>0){
                    var calldata = data.obj.operation;
                    var s=0;
                    for(var i=0;i<calldata.length;i++){
                        var list=[
                                 ++s,
                                 '<input type="checkbox" id="checkAllTwo" name="subChkTwo" value="'+calldata[i].id+'">',
                                 '<button onclick="analysisMnf.findOperationById(\''+calldata[i].id+'\')" data-target="#updateType" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp<button type="button"  onclick="analysisMnf.deleteType(\''+calldata[i].id+'\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>删除</button>',    
                                 calldata[i].operationType,
                                 calldata[i].explains
                                 ];
                        operations.push(list);
                    }
                }
                // reloadData(operations);
            }else{
                layer.msg(data.msg);
            }
        },
         doSubmit:function () {
            if(analysisMnf.validates()){
                $("#eadOperation").ajaxSubmit(function(data) {
                    console.log('sdfe:',data);
                    if (data != null && typeof(data) == "object" &&
                        Object.prototype.toString.call(data).toLowerCase() == "[object object]" &&
                        !data.length) {//判断data是字符串还是json对象,如果是json对象
                            if(data.success == true){
                                $("#addType").modal("hide");//关闭窗口
                                layer.msg(publicAddSuccess,{move:false});
                                analysisMnf.closeClean();//清空文本框
                                $("#operationType").val("");
                                analysisMnf.findOperation();
                            }else{
                                layer.msg(data.msg,{move:false});
                            }
                    }else{//如果data不是json对象
                            var result = $.parseJSON(data);//转成json对象
                            if (result.success == true) {
                                    $("#addType").modal("hide");//关闭窗口
                                    layer.msg(publicAddSuccess,{move:false});
                                    $("#operationType").val("");
                                    analysisMnf.closeClean();//清空文本框
                                    analysisMnf.findOperation();
                            }else{
                                layer.msg(result.msg,{move:false});
                            }
                    }
                });
            }
        },
        updateDoSubmit:function () {
            analysisMnf.init();
            if(analysisMnf.upDateValidates()){
                var operationType=$("#updateOperationType").val();// 运营资质类型
                var explains=$("#updateDescription").val();// 说明
                var data={"id":OperationId,"operationType":operationType,"explains":explains};
                var url="group/updateOperation";
                json_ajax("POST", url, "json", true,data,analysisMnf.updateCallback);
            }
        },
        closeClean:function(){
            $("#addproperationtype").val("");
            $("#adddescription").val("");
            $("#addproperationtype-error").hide();//隐藏上次新增时未清除的validate样式
            $("#adddescription-error").hide();
        },
        updateClean:function () {
            $("#updateOperationType-error").hide();
            $("#updateDescription-error").hide();
        },
        updateCallback:function(data){
            if(data.success == true){
                $("#updateType").modal('hide');
                layer.msg("修改成功");
                analysisMnf.findOperation();
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        deleteType:function(id){
            layer.confirm(publicDelete, {
                title :'操作确认',
                icon : 3, // 问号图标
                btn: [ '确定', '取消'] // 按钮
            }, function(){
                var url="group/deleteOperation";
                var data={"id" : id}
                json_ajax("POST", url, "json", false,data,analysisMnf.deleteCallback);
            });
        },
        deleteCallback:function(data){
            if(data.success==true){
                layer.closeAll('dialog');
                analysisMnf.findOperation();
            }else{
                layer.msg(publicError,{move:false});
            }
        },
        deleteTypeMore : function(){
            // 判断是否至少选择一项
            var chechedNum = $("input[name='subChkTwo']:checked").length;
            if (chechedNum == 0) {
                layer.msg(selectItem);
                return
            }
            var ids="";
            $("input[name='subChkTwo']:checked").each(function() {
                ids+=($(this).val())+",";
            });
            var url="group/deleteOperationMore";
            var data={"ids" : ids};
            layer.confirm(publicDelete, {
                title :'操作确认',
                icon : 3, // 问号图标
                btn: [ '确定', '取消'] // 按钮
            }, function(){
                json_ajax("POST", url, "json", false,data,analysisMnf.deleteOperationMoreCallback);
                layer.closeAll('dialog');
            });
        },
        deleteOperationMoreCallback : function(data){
            if(data.success){
                layer.msg(publicDeleteSuccess);
                analysisMnf.findOperation();
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        findOperationByVague:function(){
            analysisMnf.findOperation();
        },
        findDownKey:function(event){
            if(event.keyCode==13){
                analysisMnf.findOperation();
            }
        },
        checkAll : function(e){
            $("input[name='subChk']").not(':disabled').prop("checked", e.checked);

        },
        checkAllTwo : function(e){
            $("input[name='subChkTwo']").prop("checked", e.checked);
        },
        addId : function (){
            $("#addId").attr("href","stations/add/newuser?uuid="+selectTreeIdAdd+"");
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
                tMonth = analysisMnf.doHandleMonth(tMonth + 1);
                tDate = analysisMnf.doHandleMonth(tDate);
                var num = -(day + 1);
                startTime = tYear + "-" + tMonth + "-" + tDate + " "
                    + "00:00:00";
                var end_milliseconds = today.getTime() + 1000 * 60 * 60 * 24
                    * parseInt(num);
                today.setTime(end_milliseconds); //注意，这行是关键代码
                var endYear = today.getFullYear();
                var endMonth = today.getMonth();
                var endDate = today.getDate();
                endMonth = analysisMnf.doHandleMonth(endMonth + 1);
                endDate = analysisMnf.doHandleMonth(endDate);
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
                vMonth = analysisMnf.doHandleMonth(vMonth + 1);
                vDate = analysisMnf.doHandleMonth(vDate);
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
                    vendMonth = analysisMnf.doHandleMonth(vendMonth + 1);
                    vendDate = analysisMnf.doHandleMonth(vendDate);
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
        inquireClick: function (num) {
            $(".mileage-Content").css("display", "block");  //显示图表主体
            number = num;
            // if (number == 0) {
            //     analysisMnf.getsTheCurrentTime();
            // } else if (number == -1) {
            //     analysisMnf.startDay(-1)
            // } else if (number == -3) {
            //     analysisMnf.startDay(-3)
            // } else if (number == -7) {
            //     analysisMnf.startDay(-7)
            // };
            if (num != 1) {
                $('#timeInterval').val(startTime + '--' + endTime);
            }
            if (!analysisMnf.validates()) {
                return;
            }
            analysisMnf.estimate();
            dataListArray = [];
            var url = "/api/analysis/flowdata_mnf/";

            var data = {"organ": organ,"treetype":selectTreeType,"station":station,"qmonth":number, 'startTime': sTime, "endTime": eTime};
            json_ajax("GET", url, "json", false, data, analysisMnf.findOnline);     //发送请求
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

        estimate: function () {
            var timeInterval = $('#timeInterval').val().split('--');
            sTime = timeInterval[0];
            eTime = timeInterval[1];
            analysisMnf.getsTheCurrentTime();
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
        },
        reloadData: function (dataList) {
            var currentPage = myTable.page()
            myTable.clear()
            myTable.rows.add(dataList)
            myTable.page(currentPage).draw(false);
        },
        findOnline: function (data) {//回调函数    数据组装
            var list = [];
            var myChart = echarts.init(document.getElementById('onlineGraphics'));
            var online = "";
            var today_use = "";
            var yestoday_use = "";
            var last_year_same = "";
            var tongbi = "";
            var huanbi = "";
            var maxflow = "";
            var minflow = "";
            var average = "";
            var mnf = "";
            var mnf_add = "";
            var ref_mnf = "";
            var back_leak = "";
            var alarm_set = "";
            if (data.obj != null && data.obj != "") {
                online = data.obj.online;
                today_use = data.obj.today_use;
                yestoday_use = data.obj.yestoday_use;
                last_year_same = data.obj.last_year_same;
                tongbi = data.obj.tongbi;
                huanbi = data.obj.huanbi;
                maxflow = data.obj.maxflow;
                minflow = data.obj.minflow;
                average = data.obj.average;
                mnf = data.obj.mnf;
                mnf_add = data.obj.mnf_add;
                ref_mnf = data.obj.ref_mnf;
                back_leak = data.obj.back_leak;
                alarm_set = data.obj.alarm_set;
            }
            if (data.success == true) {
                // carLicense = [];
                // activeDays = [];
                hdates = [];
                dosages = [];
                press = [];
                mnfs = [];
                ref_mnfs = [];
                maxflows = [];
                averages = [];
                for (var i = 0; i < online.length; i++) {
                    list =
                        [i + 1, 
                            online[i].hdate,
                            online[i].color,
                            online[i].dosage,
                            // online[i].allDays == null ? "0" : online[i].allDays,
                            online[i].ratio == null ? "0" : online[i].ratio,
                            online[i].assignmentName == null ? "无" : online[i].assignmentName,
                            // online[i].professionalNames == "" ? "无" : online[i].professionalNames,
                            online[i].maxflow,
                            online[i].average,
                            online[i].mnf,
                            online[i].ref_mnf,
                            online[i].press,
                        ]

                    dataListArray.push(list);                                       //组装完成，传入  表格
                };
                for (var j = 0; j < dataListArray.length; j++) {// 排序后组装到图表
                    hdates.push(dataListArray[j][1]);
                    dosages.push(dataListArray[j][3]);
                    maxflows.push(dataListArray[j][6]);
                    averages.push(dataListArray[j][7]);
                    mnfs.push(dataListArray[j][8]);
                    ref_mnfs.push(dataListArray[j][9]);
                    press.push(dataListArray[j][10])
                }
                

                // analysisMnf.reloadData(dataListArray);
                $("#simpleQueryParam").val("");
                $("#search_button").click();
            } else {
                if (data.msg != null) {
                    layer.msg(data.msg, {move: false});
                }
                hdates = [];
                dosages = [];
                hdates.push("");
                dosages.push("");
                maxflows = [];
                averages = [];
                maxflows.push("");
                averages.push("");
                mnfs = [];
                ref_mnfs = [];
                mnfs.push("");
                ref_mnfs.push("");
                press=[];
                press.push("");
                today_use = "";
                yestoday_use = "";
                last_year_same = "";
                tongbi = "";
                huanbi = "";
                maxflow = "";
                minflow = "";
                average = "";
                mnf = "";
                mnf_add = "";
                ref_mnf = "";
                back_leak = "";
                alarm_set = "";
            }
            var start;
            var end;
            var length;
            online_length = online.length;
            
            if (length < 4) {
                barWidth = "30%";
            } else if (length < 6) {
                barWidth = "20%";
            } else {
                barWidth = null;
            }
            ;
            if (length <= 200) {
                start = 0;
                end = 100;
            } else {
                start = 0;
                // end = 100 * (200 / length);
                end = 100;
            }
            ;
            // wjk
            //carLicense = analysisMnf.platenumbersplitFun(carLicense);
            var option = {
                tooltip: {
                    trigger: 'axis',
                    textStyle: {
                        fontSize: 20
                    },
                    formatter: function (a) {
                        // console.log(a);
                        var relVal = "";
                        //var relValTime = a[0].name;
                        var relValTime  =hdates[a[0].dataIndex];
                        if (a[0].data == 0) {
                            relVal = "无相关数据";
                            relVal += "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:" + a[0].color + "'></span>" + a[0].seriesName + "：" + a[0].value + " m³/h";
                            relVal += "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:" + a[5].color + "'></span>" + a[5].seriesName + "：" + a[5].value + " Mpa";
                        } else {
                            relVal = relValTime;
                            relVal += "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:" + a[0].color + "'></span>" + a[0].seriesName + "：" + a[0].value + " m³/h";
                            relVal += "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:" + a[5].color + "'></span>" + a[5].seriesName + "：" + a[5].value + " Mpa";
                        }
                        ;
                        return relVal;
                    }
                },
                legend: {
                    data: ['MNF','最大流量','平均流量','背景漏损',"压力曲线"],
                    left: 'auto',
                },
                toolbox: {
                    show: false
                },
                grid: {
                    left: '120',
                    bottom:'100'
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,  // 让折线图从X轴0刻度开始
                    name: "",
                    axisLabel: {
                        show: true,
                        interval: function(index,name){
                            // console.log(index,name);
                            // if(index==0 || index == online_length-1 || index == online_length/2 ){
                            if(index==0 || name == '' || index == online_length-1 ){

                                return true;
                            }else{
                                if(name.includes("00:00:00")){
                                    return true;
                                }
                                return false;
                            }
                        },
                        rotate: 0
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#483d8b',
                            type: 'dashed',
                            width: 1
                        }
                    },
                    data: hdates //analysisMnf.platenumbersplitYear(hdates)
                },
                yAxis: [
                    {
                        type: 'value',
                        name: '瞬时流量 （m³/h）',
                        nameTextStyle:{
                            color: 'black',
                            fontFamily: '微软雅黑 Bold',
                            fontSize: 14,
                            fontStyle: 'normal',
                            fontWeight: 700
                        },
                        nameLocation:'middle',
                        nameGap:80,
                        scale: false,
                        position: 'left',
                        axisLabel : {
                            show:true,
                            interval: 'auto',    // {number}
                            rotate: 0,
                            margin: 18,
                            formatter: '{value}',    // Template formatter!
                            textStyle: {
                                color: 'black',
                                fontFamily: 'verdana',
                                fontSize: 10,
                                fontStyle: 'normal',
                                fontWeight: 'bold'
                            }
                        },
                        axisTick : {    // 轴标记
                            show:false,
                            length: 10,
                            lineStyle: {
                                color: 'green',
                                type: 'solid',
                                width: 2
                            }
                        },
                        splitLine: {
                            show: true
                        }
                    },

                    {
                        type : 'value',
                        splitNumber: 1,
                        name: 'Mpa',
                        nameLocation:'middle',
                        nameGap:30,
                        scale: false,
                        axisLabel: {
                            formatter: '{value}'
                        },
                        axisLine : {    // 轴线
                            show: true,
                            lineStyle: {
                                color: 'grey',
                                type: 'dashed',
                                width: 1
                            }
                        },
                        axisTick : {    // 轴标记
                            show:false,
                            length: 10,
                            lineStyle: {
                                color: 'green',
                                type: 'solid',
                                width: 2
                            }
                        },
                        // axisLabel : {
                        //     formatter: function (value) {
                        //         // Function formatter
                        //         return value + ' Mpa'
                        //     }
                        // },
                        splitLine : {
                            show: false
                        },
                        offset : 20
                    }
                ],
                dataZoom : [{
                    show : true,
                    realtime : true,
                    //orient: 'vertical',   // 'horizontal'
                    //x: 0,
                    y: 550,
                    //width: 400,
                    height: 20,
                    //backgroundColor: 'rgba(221,160,221,0.5)',
                    //dataBackgroundColor: 'rgba(138,43,226,0.5)',
                    //fillerColor: 'rgba(38,143,26,0.6)',
                    //handleColor: 'rgba(128,43,16,0.8)',
                    //xAxisIndex:[],
                    //yAxisIndex:[],
                    type: 'inside',
                    start : start,
                    end : end
                },
                {
                    show : true,
                    realtime : true,
                    //orient: 'vertical',   // 'horizontal'
                    //x: 0,
                    y: 550,
                    //width: 400,
                    height: 20,
                    //backgroundColor: 'rgba(221,160,221,0.5)',
                    //dataBackgroundColor: 'rgba(138,43,226,0.5)',
                    //fillerColor: 'rgba(38,143,26,0.6)',
                    //handleColor: 'rgba(128,43,16,0.8)',
                    //xAxisIndex:[],
                    //yAxisIndex:[],
                    type: 'slider',
                    start : 0,
                    end : 100
                }],
                series: [
                    {
                        name: '流量',
                        yAxisIndex: 0,
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: '#6dcff6'
                            }
                        },
                        data: dosages,
                        // markLine : {
                        //   symbol : 'none',
                        //   itemStyle : {
                        //     normal : {
                        //       color:'#1e90ff',
                        //       label : {
                        //         show:true
                        //       }
                        //     }
                        //   },
                        //   data : [{type : 'average', name: '平均值'}]
                        // }
                    },
                    {
                        name: '最大流量',
                        yAxisIndex: 0,
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: '#422d0c'
                            }
                        },
                        data: maxflows
                    },
                    {
                        name: '平均流量',
                        yAxisIndex: 0,
                        xAxisIndex: 0,
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: '#e00d1f'
                            }
                        },
                        data: averages
                    },
                    {
                        name: 'MNF',
                        yAxisIndex: 0,
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: '#65F015'
                            }
                        },
                        data: mnfs
                    },
                    {
                        name: '背景漏损',
                        yAxisIndex: 0,
                        xAxisIndex: 0,
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: '#152BF0'
                            }
                        },
                        data: ref_mnfs
                    },
                    {
                        name: '压力曲线',
                        yAxisIndex: 1,
                        xAxisIndex: 0,
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: '#cc1cae'
                            }
                        },
                        data: press
                    }
                ]
            };
            myChart.setOption(option);
            
            $("#maxflow span").html( maxflow);
            $("#averflow span").html( average);
            $("#today_use span").html( today_use);
            $("#yestoday_use span").html( yestoday_use);
            $("#last_year_same span").html( last_year_same);
            $("#tongbi span").html( tongbi);
            $("#huanbi span").html( huanbi);
            $("#average span").html( average);
            $("#max_flow span").html( maxflow);
            $("#min_flow span").html( minflow);
            $("#mnf span").html( mnf);
            $("#mnf_add span").html( mnf_add);
            $("#back_leak span").html( back_leak);
            $("#ref_mnf span").html( ref_mnf);
            $("#alarm_set span").html( alarm_set);

            window.onresize = myChart.resize;
        },
        platenumbersplitYear:function(arr){

            var newArr = [ '08','09','10','11',
                {
                    value:'12',
                    textStyle: {
                        color: 'red',
                        fontSize: 30,
                        fontStyle: 'normal',
                        fontWeight: 'bold'
                    }
                },
                '01','02','03','04','05','06','07'];
            // arr.forEach(function(item){
            //     if (item.length > 8) {
            //         item = item.substring(0,7) + '...'
            //     }
            //     newArr.push(item)
            // })
            return newArr
        },
        platenumbersplitFun:function(arr){
            var newArr = [];
            arr.forEach(function(item){
                if (item.length > 8) {
                    item = item.substring(0,7) + '...'
                }
                newArr.push(item)
            })
            return newArr
        }
    }
    $(function(){
        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('treeDemo',id,'group');
            };
        });
        
        analysisMnf.userTree();
        
        analysisMnf.init();
        $('#timeInterval').dateRangePicker({dateLimit:30});
        analysisMnf.getsTheCurrentTime();  
        analysisMnf.startDay(-7);  
        $('#timeInterval').val(startTime + '--' + endTime);
        // analysisMnf.inquireClick(1);
        // analysisMnf.findOperation();
        // IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            analysisMnf.refreshTable();
            var search;
            $("#search_condition").bind("focus",function(){
                search = setInterval(function(){
                    search_ztree('treeDemo', 'search_condition','group');
                },500);
            }).bind("blur",function(){
                clearInterval(search);
            });
        }
        // IE9 end
        // $("#selectAll").bind("click", analysisMnf.selectAll);
        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('treeDemo', 'search_condition','group');
        });       
        
        
        $("#addId").on("click",analysisMnf.addId);
        $("#closeAdd").on("click",analysisMnf.closeClean);
        $("#updateClose").on("click",analysisMnf.updateClean);
    })
})($,window)
