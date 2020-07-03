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
    var spress_input = $("#press_in");
    var spress_output = $("#press_out");
    var spress_keyput = $("#press_key");
    // var simCardId = $("#commaddr").val();

    analysisflow = {
        init: function(){
            console.log("analysisflow init");
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
                        "isStation" : "1"
                        // "csrfmiddlewaretoken": "{{ csrf_token }}"
                    },
                    dataFilter: analysisflow.ajaxDataFilter
                },
                view : {
                    // addHoverDom : analysisflow.addHoverDom,
                    // removeHoverDom : analysisflow.removeHoverDom,
                    selectedMulti : false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree
                },
                edit : {
                    enable : true,
                    editNameSelectAll : true,
                    showRemoveBtn : false,//analysisflow.showRemoveBtn,
                    showRenameBtn : false
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    // beforeDrag : analysisflow.beforeDrag,
                    // beforeEditName : analysisflow.beforeEditName,
                    // beforeRemove : analysisflow.beforeRemove,
                    // beforeRename : analysisflow.beforeRename,
                    // onRemove : analysisflow.onRemove,
                    // onRename : analysisflow.onRename,
                    onAsyncSuccess: analysisflow.zTreeOnAsyncSuccess,
                    onClick : analysisflow.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#treeDemo"), treeSetting, zNodes);
            var treeObj = $.fn.zTree.getZTreeObj('treeDemo');treeObj.expandAll(false);
           
        },

        zTreeOnAsyncSuccess: function (event, treeId, treeNode, msg) {
            close_ztree("treeDemo");

            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            var nodes = treeObj.getCheckedNodes(true);
            allNodes = treeObj.getNodes();
            var childNodes = treeObj.transformToArray(allNodes[0]);
            for (var i = 0; i < childNodes.length; i++) {
                if(childNodes[i].otype == "station")
                {
                    // $("#station_id").val(childNodes[i].id);
                    $("#station_name").val(childNodes[i].name);
                    $("#organ_name").val(childNodes[i].getParentNode().name);
                    organ = childNodes[i].getParentNode().id;
                    station = childNodes[i].id;
                    analysisflow.inquireClick(1);
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
            if(treeNode.otype == "station"){
                var pNode = treeNode.getParentNode();
                $("#organ_name").attr("value",pNode.name);
                $("#station_name").attr("value",treeNode.name);
                organ = pNode.id;
                station = treeNode.id;
            }

            analysisflow.inquireClick(1);
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
                                 '<button onclick="analysisflow.findOperationById(\''+calldata[i].id+'\')" data-target="#updateType" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp<button type="button"  onclick="analysisflow.deleteType(\''+calldata[i].id+'\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>删除</button>',    
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
            if(analysisflow.validates()){
                $("#eadOperation").ajaxSubmit(function(data) {
                    console.log('sdfe:',data);
                    if (data != null && typeof(data) == "object" &&
                        Object.prototype.toString.call(data).toLowerCase() == "[object object]" &&
                        !data.length) {//判断data是字符串还是json对象,如果是json对象
                            if(data.success == true){
                                $("#addType").modal("hide");//关闭窗口
                                layer.msg(publicAddSuccess,{move:false});
                                analysisflow.closeClean();//清空文本框
                                $("#operationType").val("");
                                analysisflow.findOperation();
                            }else{
                                layer.msg(data.msg,{move:false});
                            }
                    }else{//如果data不是json对象
                            var result = $.parseJSON(data);//转成json对象
                            if (result.success == true) {
                                    $("#addType").modal("hide");//关闭窗口
                                    layer.msg(publicAddSuccess,{move:false});
                                    $("#operationType").val("");
                                    analysisflow.closeClean();//清空文本框
                                    analysisflow.findOperation();
                            }else{
                                layer.msg(result.msg,{move:false});
                            }
                    }
                });
            }
        },
        updateDoSubmit:function () {
            analysisflow.init();
            if(analysisflow.upDateValidates()){
                var operationType=$("#updateOperationType").val();// 运营资质类型
                var explains=$("#updateDescription").val();// 说明
                var data={"id":OperationId,"operationType":operationType,"explains":explains};
                var url="group/updateOperation";
                json_ajax("POST", url, "json", true,data,analysisflow.updateCallback);
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
                analysisflow.findOperation();
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
                json_ajax("POST", url, "json", false,data,analysisflow.deleteCallback);
            });
        },
        deleteCallback:function(data){
            if(data.success==true){
                layer.closeAll('dialog');
                analysisflow.findOperation();
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
                json_ajax("POST", url, "json", false,data,analysisflow.deleteOperationMoreCallback);
                layer.closeAll('dialog');
            });
        },
        deleteOperationMoreCallback : function(data){
            if(data.success){
                layer.msg(publicDeleteSuccess);
                analysisflow.findOperation();
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        findOperationByVague:function(){
            analysisflow.findOperation();
        },
        findDownKey:function(event){
            if(event.keyCode==13){
                analysisflow.findOperation();
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
                tMonth = analysisflow.doHandleMonth(tMonth + 1);
                tDate = analysisflow.doHandleMonth(tDate);
                var num = -(day + 1);
                startTime = tYear + "-" + tMonth + "-" + tDate + " "
                    + "00:00:00";
                var end_milliseconds = today.getTime() + 1000 * 60 * 60 * 24
                    * parseInt(num);
                today.setTime(end_milliseconds); //注意，这行是关键代码
                var endYear = today.getFullYear();
                var endMonth = today.getMonth();
                var endDate = today.getDate();
                endMonth = analysisflow.doHandleMonth(endMonth + 1);
                endDate = analysisflow.doHandleMonth(endDate);
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
                vMonth = analysisflow.doHandleMonth(vMonth + 1);
                vDate = analysisflow.doHandleMonth(vDate);
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
                    vendMonth = analysisflow.doHandleMonth(vendMonth + 1);
                    vendDate = analysisflow.doHandleMonth(vendDate);
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
            if (number == 0) {
                analysisflow.getsTheCurrentTime();
            } else if (number == -1) {
                analysisflow.startDay(-1)
            } else if (number == -30) {
                analysisflow.startDay(-30)
            } else if (number == -7) {
                analysisflow.startDay(-7)
            };
            if (num != 1) {
                $('#timeInterval').val(startTime + '--' + endTime);
            }
            if (!analysisflow.validates()) {
                return;
            }
            analysisflow.estimate();
            dataListArray = [];
            var url = "/api/analysis/flowdata_analys/";

            var press_in_commaddr = $("#press_in").val()
            var press_out_commaddr = $("#press_out").val()
            var press_key_commaddr = $("#press_key").val()
            

            var data = {
                "organ": organ,
                "treetype":selectTreeType,
                "station":station,
                "press_in":press_in_commaddr,
                "press_out":press_out_commaddr,
                "press_key":press_key_commaddr,
                "qmonth":number, 
                'startTime': sTime, 
                "endTime": eTime
            };
            json_ajax("GET", url, "json", false, data, analysisflow.findOnline);     //发送请求
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
            analysisflow.getsTheCurrentTime();
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

            var hdates = [];
            var dosages = [];
            var press_dates = [];
            var press_in = [];
            var press_out = [];
            var press_key = [];

            average = data.obj.average;
            mnf = data.obj.mnf;
            mnf_add = data.obj.mnf_add;
            ref_mnf = data.obj.ref_mnf;
            back_leak = data.obj.back_leak;
            alarm_set = data.obj.alarm_set;
            
            $.each(data.obj.flow_raw,function(k,v){
                hdates.push(k); //k.substring(11,13)
                dosages.push(v);
                
            })
            if(data.obj.press_in != 0){
                press_dates = []
                $.each(data.obj.pressure_in,function(k,v){
                    press_dates.push(k); //k.substring(11,13)
                    press_in.push(v);
                    
                })
            }
            if(data.obj.press_out != 0){
                press_dates = []
                $.each(data.obj.pressure_out,function(k,v){
                    press_dates.push(k); //k.substring(11,13)
                    press_out.push(v);
                    
                })
            }
            if(data.obj.press_key != 0){
                press_dates = []
                $.each(data.obj.pressure_key,function(k,v){
                    press_dates.push(k); //k.substring(11,13)
                    press_key.push(v);
                    
                })
            }

            var myChart = echarts.init(document.getElementById('onlineGraphics'));
            option = {
                
                        legend: {
                            y: '20px',
                            data: ['流量', '入口压力', '出口压力', '关键点压力'],
                            selectedMode: false,
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'cross'
                            },
                            backgroundColor: 'rgba(245, 245, 245, 0.8)',
                            borderWidth: 1,
                            borderColor: '#ccc',
                            padding: 10,
                            textStyle: {
                                color: '#000'
                            },
                            // position: function (pos, params, el, elRect, size) {
                            //     var obj = {top: 10};
                            //     obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                            //     return obj;
                            // },
                            extraCssText: 'width: 170px'
                        },
                        axisPointer: {
                            link: {xAxisIndex: 'all'},
                            label: {
                                backgroundColor: '#777'
                            }
                        },
                        
                        xAxis: [
                            {
                                type: 'category',
                                boundaryGap: true,
                                data: hdates
                            },
                            {
                                show:false,
                                type: 'category',
                                boundaryGap: true,
                                data: press_dates
                            }
                        ],
                        
                        yAxis: [
                            {
                                scale: true,
                                name:"瞬时流量m³/h",
                                splitArea: {
                                    show: true
                                }
                            },
                            {
                                type : 'value',
                                splitNumber: 1,
                                name: 'Mpa',
                                // nameLocation:'top',
                                nameGap:30,
                                scale: false,
                                axisLabel: {
                                    formatter: '{value}' //+ 'Mpa'
                                },
                                axisLine : {    // 轴线
                                    show: true,
                                    lineStyle: {
                                        color: 'grey',
                                        // type: 'line',
                                        width: 1
                                    }
                                },
                                axisTick : {    // 轴标记
                                    show:true,
                                    inside:true,
                                    length: 10,
                                    lineStyle: {
                                        color: 'grey',
                                        type: 'solid',
                                        width: 2
                                    }
                                },
                                
                                splitLine : {
                                    show: false
                                },
                                offset : 50
                            }
                        ],
                        dataZoom: [
                            {
                                type: 'inside',
                                xAxisIndex: [0, 1],
                                start: 0,
                                end: 100
                             }
                        ],
                        
                        series: [ //用于指定图标显示类型
                            //第一个柱状图的数据
                            {
                                name: '流量',
                                type: 'line',
                                smooth:true,
                                // yAxisIndex: '0',// 第一个柱状图的数据
                                // itemStyle: {normal: {color: '#2d91ff', label: {show: true}}},
                                data: dosages,
                                itemStyle: {
                                    normal: {
                                        color: '#06B800',
                                        color0: '#FA0000',
                                        borderColor: null,
                                        borderColor0: null
                                    }
                                },
                                tooltip: {
                                    formatter: function (param) {
                                        param = param[0];
                                        return [
                                            'Date: ' + param.name + '<hr size=1 style="margin: 3px 0">',
                                            'Open: ' + param.data[0] + '<br/>',
                                            'Close: ' + param.data[1] + '<br/>',
                                            'Lowest: ' + param.data[2] + '<br/>',
                                            'Highest: ' + param.data[3] + '<br/>'
                                        ].join('');
                                    }
                                }
                            },
                            
                                //右边Y轴的数据
                            {
                                name: '入口压力',
                                type: 'line',
                                symbol: 'emptyCircle',
                                showAllSymbol: true, //动画效果
                                symbolSize: 3,
                                smooth: true, //光滑的曲线
                                xAxisIndex: '1',      
                                yAxisIndex: '1',      
                                data: press_in 
                            },
                            {
                                name: '出口压力',
                                type: 'line',
                                symbol: 'emptyCircle',
                                showAllSymbol: true, //动画效果
                                symbolSize: 3,
                                smooth: true, //光滑的曲线
                                xAxisIndex: '1',      
                                yAxisIndex: '1',      
                                data: press_out 
                            },
                            {
                                name: '关键点压力',
                                type: 'line',
                                symbol: 'emptyCircle',
                                showAllSymbol: true, //动画效果
                                symbolSize: 3,
                                smooth: true, //光滑的曲线
                                xAxisIndex: '1',      
                                yAxisIndex: '1',      
                                data: press_key 
                            },
                        ]
            };
            myChart.setOption(option);

            $("#averflow span").html( average);
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
        },
        //显示或隐藏输入框
        showHideValueCase: function(type,dataInput){
            var dataInputType = dataInput.selector;
            if (type == 0) {//限制输入
                
                if ("#sims" == dataInputType) { //sim卡限制
                    $(".simsList").attr("readonly",true);
                    $("#simParentGroupName").css("background-color","");
                    $("#simGroupDiv").css("display","block");
                    $("#operatorTypeDiv").css("display","block");
                    simFlag = false;
                }
            } else if (type == 1) {//放开输入
                
                if ("#sims" == dataInputType) { //sim卡放开
                    $(".simsList").removeAttr("readonly");
                    $("#simParentGroupName").css("background-color","#fafafa");
                    $("#simGroupDiv").css("display","none");
                    $("#operatorTypeDiv").css("display","none");
                    simFlag = true;
                }
            }
        },
        hideErrorMsg: function(){
            $("#error_label").hide();
        },
        initPressureList: function (simInput) {
            url = "/api/devm/pressure/getpressureSelect/";
            analysisflow.initDataList(simInput, url, '');
        },
        initDataList: function (dataInput, urlString, id, callback,moreCallback) {
            console.log(dataInput,id);
            // if(id.indexOf('#')<0){
            //     dataInput.attr('data-id',id);
            // }
            //if(dataInput.attr('name').indexOf('_')<0){
            //  dataInput.attr('name',dataInput.attr('name')+'__');
            //}
            $.ajax({
                type: "GET",
                url: urlString,
                data: {},   //{configId: $("#configId").val()},
                dataType: "json",
                success: function (data) {
                    analysisflow.callbackfunction(spress_input,data);
                    analysisflow.callbackfunction(spress_output,data);
                    analysisflow.callbackfunction(spress_keyput,data);
                }
            });
        },
        callbackfunction:function(dataInput,data,callback,moreCallback){
            var itemList = data.obj;
            // console.log(itemList);
            var suggest=dataInput.bsSuggest({
                indexId: 1,  //data.value 的第几个数据，作为input输入框的内容
                indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
                data: {value:itemList},
                idField: "id",
                keyField: "name",
                effectiveFields: ["name"]
            }).on('onDataRequestSuccess', function (e, result) {
            }).on("focus", function() {
                
                dataInput.siblings('i.delIcon').remove();
            }).on("click",function(){
                // dataInput.siblings('i.delIcon').remove();
            }).on('onSetSelectValue', function (e, keyword, data) {
                console.log("onSetSelectValue")
                if(callback){
                    dataInput.closest('.form-group').find('.dropdown-menu').hide()
                    callback(keyword)
                }
                $("#commaddr").attr({"value":keyword.key})
                //限制输入
                analysisflow.showHideValueCase(0,dataInput);
                analysisflow.hideErrorMsg();
            }).on('onUnsetSelectValue', function () {
                //放开输入
                console.log("onUnsetSelectValue")

                analysisflow.showHideValueCase(1,dataInput);
            });
            
            dataInput.next().find('button').removeClass('disabled loading-state-button').find('i').attr("class", 'caret');
            if(moreCallback){
                moreCallback()
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
        
        analysisflow.userTree();
        
        analysisflow.init();
        analysisflow.initPressureList(spress_input);
        // analysisflow.initPressureList(spress_output);
        // analysisflow.initPressureList(spress_keyput);
        $('#timeInterval').dateRangePicker({dateLimit:30});
        analysisflow.getsTheCurrentTime();  
        // analysisflow.startDay(-1);  
        $('#timeInterval').val(startTime + '--' + endTime);
        // analysisflow.inquireClick(1);
        // analysisflow.findOperation();
        // IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            analysisflow.refreshTable();
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
        // $("#selectAll").bind("click", analysisflow.selectAll);
        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('treeDemo', 'search_condition','group');
        });       
        
        
        $("#addId").on("click",analysisflow.addId);
        $("#closeAdd").on("click",analysisflow.closeClean);
        $("#updateClose").on("click",analysisflow.updateClean);
    })
})($,window)
