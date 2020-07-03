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
    var dataListArray3 = [];
    var dataListArray4 = [];
    var dataListArray2 = [];
    var endTime;// 当天时间
    var sTime;
    var eTime;
    var key = true;
    var vid;
    var carLicense = [];
    var activeDays = [];
    var organ = '';
    var station = $("#station_id").val();
    var bflag = true;
    var zTreeIdJson = {};
    var barWidth;
    var number;
    var checkFlag = false; //判断组织节点是否是勾选操作
    var size;//当前权限监控对象数量
    var online_length;

    var week1color = 'rgba(204, 153, 255, 1)';
    var week2color = 'rgba(153, 255, 255, 1)';
    var week3color = 'rgba(204, 204, 204, 1)';
    var week4color = 'rgba(153, 204, 153, 1)';
    var week5color = 'rgba(153, 123, 235, 1)';

    monthUse = {
        init: function(){
            console.log("monthUse init");
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
                        "isStation":"1",
                        // "csrfmiddlewaretoken": "{{ csrf_token }}"
                    },
                    dataFilter: monthUse.ajaxDataFilter
                },
                view : {
                    // addHoverDom : monthUse.addHoverDom,
                    // removeHoverDom : monthUse.removeHoverDom,
                    selectedMulti : false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree
                },
                edit : {
                    enable : true,
                    editNameSelectAll : true,
                    showRemoveBtn : false,//monthUse.showRemoveBtn,
                    showRenameBtn : false
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    // beforeDrag : monthUse.beforeDrag,
                    // beforeEditName : monthUse.beforeEditName,
                    // beforeRemove : monthUse.beforeRemove,
                    // beforeRename : monthUse.beforeRename,
                    // onRemove : monthUse.onRemove,
                    // onRename : monthUse.onRename,
                    onAsyncSuccess: monthUse.zTreeOnAsyncSuccess,
                    onClick : monthUse.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#treeDemo"), treeSetting, zNodes);
            var treeObj = $.fn.zTree.getZTreeObj('treeDemo');treeObj.expandAll(true);
           
        },
        zTreeOnAsyncSuccess: function (event, treeId, treeNode, msg) {
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            var nodes = treeObj.getCheckedNodes(true);
            allNodes = treeObj.getNodes();
            var childNodes = treeObj.transformToArray(allNodes[0]);
            for (var i = 0; i < childNodes.length; i++) {
                if(childNodes[i].otype == "station")
                {
                    $("#station_id").val(childNodes[i].id);
                    $("#station_name").val(childNodes[i].name);
                    $("#organ_name").val(childNodes[i].getParentNode().name);
                    monthUse.inquireClick(1);
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
            selectTreeType = treeNode.type;
            selectDistrictId = treeNode.districtid;
            selectTreeIdAdd = treeNode.uuid;
            
            $('#simpleQueryParam').val("");
            
            if(treeNode.type == "station"){
                var pNode = treeNode.getParentNode();
                $("#organ_name").attr("value",pNode.name);
                $("#station_name").attr("value",treeNode.name);
                $("#station_id").attr("value",treeNode.id);
                organ = pNode.id;
                
                monthUse.inquireClick(1);
            }

            
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
                                 '<button onclick="monthUse.findOperationById(\''+calldata[i].id+'\')" data-target="#updateType" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp<button type="button"  onclick="monthUse.deleteType(\''+calldata[i].id+'\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>删除</button>',    
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
            if(monthUse.validates()){
                $("#eadOperation").ajaxSubmit(function(data) {
                    console.log('sdfe:',data);
                    if (data != null && typeof(data) == "object" &&
                        Object.prototype.toString.call(data).toLowerCase() == "[object object]" &&
                        !data.length) {//判断data是字符串还是json对象,如果是json对象
                            if(data.success == true){
                                $("#addType").modal("hide");//关闭窗口
                                layer.msg(publicAddSuccess,{move:false});
                                monthUse.closeClean();//清空文本框
                                $("#operationType").val("");
                                monthUse.findOperation();
                            }else{
                                layer.msg(data.msg,{move:false});
                            }
                    }else{//如果data不是json对象
                            var result = $.parseJSON(data);//转成json对象
                            if (result.success == true) {
                                    $("#addType").modal("hide");//关闭窗口
                                    layer.msg(publicAddSuccess,{move:false});
                                    $("#operationType").val("");
                                    monthUse.closeClean();//清空文本框
                                    monthUse.findOperation();
                            }else{
                                layer.msg(result.msg,{move:false});
                            }
                    }
                });
            }
        },
        updateDoSubmit:function () {
            monthUse.init();
            if(monthUse.upDateValidates()){
                var operationType=$("#updateOperationType").val();// 运营资质类型
                var explains=$("#updateDescription").val();// 说明
                var data={"id":OperationId,"operationType":operationType,"explains":explains};
                var url="group/updateOperation";
                json_ajax("POST", url, "json", true,data,monthUse.updateCallback);
            }
        },
        
        
        inquireClick: function (num) {
            $(".mileage-Content").css("display", "block");  //显示图表主体
            number = num;
            // if (number == 0) {
            //     monthUse.getsTheCurrentTime();
            // } else if (number == -1) {
            //     monthUse.startDay(-1)
            // } else if (number == -3) {
            //     monthUse.startDay(-3)
            // } else if (number == -7) {
            //     monthUse.startDay(-7)
            // };
            
            dataListArray = [];
            dataListArray2 = [];
            var url = "/api/analysis/flowdata_monthuse/";

            var station_id = $("#station_id").val();
            // var data = {"organ": organ,"treetype":selectTreeType,"station_id":station_id,"qmonth":number, 'startTime': sTime, "endTime": eTime};
            var data = {"station_id":station_id,"month":num};
            json_ajax("GET", url, "json", false, data, monthUse.processFlows);     //发送请求
        },
        fillSeriaData:function(name,lcolor,xind,yind,data){
            return  {
                        name: name,
                        yAxisIndex: yind,
                        xAxisIndex:xind,
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: lcolor //#6dcff6
                            }
                        },
                        data: data,
                        
                    }
        },
        processFlows: function (data) {//回调函数    数据组装
            var list = [];
            var myChart = echarts.init(document.getElementById('monthFlowGraphics'));
            var current_month = "";
            var last_month = "";
            var before_last_month = "";
            var history = "";
            var hdates = [];
            var legend_list = [];
            var serias_list = [];
            
            
            if (data.obj != null && data.obj != "") {
                current_month = data.obj.current_month;
                last_month = data.obj.last_month;
                before_last_month = data.obj.before_last_month;
                history = data.obj.history;
                pressure = data.obj.pressure;
                
            }
            if (data.success == true) {
                
                //当月
                dataListArray=[];
                if(current_month.length > 0){
                    flow_current_month = []
                    list=[];
                    for (var i = 0; i < current_month.length; i++) {
                        list =
                            [i + 1, 
                                current_month[i].hdate,
                                current_month[i].color,
                                current_month[i].flow,
                                // online[i].allDays == null ? "0" : online[i].allDays,
                                current_month[i].ratio == null ? "0" : current_month[i].ratio,
                                current_month[i].assignmentName == null ? "无" : current_month[i].assignmentName,
                                
                            ]

                        dataListArray.push(list);                                       //组装完成，传入  表格
                    };
                    for (var j = 0; j < dataListArray.length; j++) {// 排序后组装到图表
                        hdates.push(dataListArray[j][1]);
                        flow_current_month.push(dataListArray[j][3]);
                        
                    }
                    legend_list.push("当月曲线");
                    var tmp = monthUse.fillSeriaData("当月曲线",'rgba(22, 155, 213, 1)',0,0,flow_current_month);
                    serias_list.push(tmp);
                }
                //上月
                dataListArray=[];
                if(last_month.length > 0){
                    flow_last_month = []
                    list=[];
                    for (var i = 0; i < last_month.length; i++) {
                        list =
                            [i + 1, 
                                last_month[i].hdate,
                                last_month[i].color,
                                last_month[i].flow,
                                // online[i].allDays == null ? "0" : online[i].allDays,
                                last_month[i].ratio == null ? "0" : last_month[i].ratio,
                                last_month[i].assignmentName == null ? "无" : last_month[i].assignmentName,
                                
                            ]

                        dataListArray.push(list);                                       //组装完成，传入  表格
                    };
                    for (var j = 0; j < dataListArray.length; j++) {// 排序后组装到图表
                        // hdates.push(dataListArray[j][1]);
                        flow_last_month.push(dataListArray[j][3]);
                        
                    }
                    legend_list.push("上月曲线");
                    var tmp = monthUse.fillSeriaData("上月曲线",'rgba(220, 76, 132, 1)',0,0,flow_last_month);
                    serias_list.push(tmp);
                }

                //前月
                dataListArray=[];
                if(before_last_month.length > 0){
                    before_flow_last_month = []
                    list=[];
                    for (var i = 0; i < before_last_month.length; i++) {
                        list =
                            [i + 1, 
                                before_last_month[i].hdate,
                                before_last_month[i].color,
                                before_last_month[i].flow,
                                // online[i].allDays == null ? "0" : online[i].allDays,
                                before_last_month[i].ratio == null ? "0" : before_last_month[i].ratio,
                                before_last_month[i].assignmentName == null ? "无" : before_last_month[i].assignmentName,
                                
                            ]

                        dataListArray.push(list);                                       //组装完成，传入  表格
                    };
                    for (var j = 0; j < dataListArray.length; j++) {// 排序后组装到图表
                        // hdates.push(dataListArray[j][1]);
                        before_flow_last_month.push(dataListArray[j][3]);
                        
                    }
                    legend_list.push("前月曲线");
                    var tmp = monthUse.fillSeriaData("前月曲线",'rgba(123, 45, 67, 8)',0,0,before_flow_last_month);
                    serias_list.push(tmp);
                }

                //历史同期
                dataListArray=[];
                if(history.length > 0){
                    flow_history_month = []
                    list=[];
                    for (var i = 0; i < history.length; i++) {
                        list =
                            [i + 1, 
                                history[i].hdate,
                                history[i].color,
                                history[i].flow,
                                // online[i].allDays == null ? "0" : online[i].allDays,
                                history[i].ratio == null ? "0" : history[i].ratio,
                                history[i].assignmentName == null ? "无" : history[i].assignmentName,
                                
                            ]

                        dataListArray.push(list);                                       //组装完成，传入  表格
                    };
                    for (var j = 0; j < dataListArray.length; j++) {// 排序后组装到图表
                        // hdates.push(dataListArray[j][1]);
                        flow_history_month.push(dataListArray[j][3]);
                        
                    }
                    legend_list.push("历史同期");
                    var tmp = monthUse.fillSeriaData("历史同期",'rgba(23, 0, 167, 8)',0,0,flow_history_month);
                    serias_list.push(tmp);
                }

                // #press
                press=[];
                for (var i = 0; i < pressure.length; i++) {
                    list =
                        [i + 1, 
                            pressure[i].hdate,
                            pressure[i].color,
                            pressure[i].press,
                            // online[i].allDays == null ? "0" : online[i].allDays,
                            pressure[i].ratio == null ? "0" : pressure[i].ratio,
                            pressure[i].assignmentName == null ? "无" : pressure[i].assignmentName,
                            
                        ]

                    dataListArray2.push(list);                                       //组装完成，传入  表格
                };
                
                for (var j = 0; j < dataListArray2.length; j++) {// 排序后组装到图表
                    // hdates.push(dataListArray2[j][1]);
                    press.push(dataListArray2[j][3]);
                    
                }
                legend_list.push("压力曲线");
                var tmp = monthUse.fillSeriaData("压力曲线",'rgba(22, 155, 0, 1)',1,1,press);
                serias_list.push(tmp);

                // monthUse.reloadData(dataListArray);
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
                last_moth=[];
                last_moth.push("");
                
                press=[];
                press.push("");
                
            }

            var start;
            var end;
            var length;
            online_length = press.length;
            
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
            //carLicense = monthUse.platenumbersplitFun(carLicense);
            var option = {
                tooltip: {
                    show:true,
                    trigger: 'axis',
                    textStyle: {
                        fontSize: 20
                    },
                    // formatter: function (a) {
                    //     console.log(a);
                    //     var relVal = "";
                    //     //var relValTime = a[0].name;
                    //     var relValTime  =hdates[a[0].dataIndex];
                    //     if (a[0].data == 0) {
                    //         relVal = "无相关数据";
                    //         relVal += "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;'></span>" + a[0].seriesName + "：" + a[0].value + " m³/h";
                    //         // relVal += "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;'></span>" + a[1].seriesName + "：" + a[1].value + " Mpa";
                    //     } else {
                    //         relVal = relValTime;
                    //         relVal += "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:" + a[0].color + "'></span>" + a[0].seriesName + "：" + a[0].value + " m³/h";
                    //         // relVal += "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:" + a[1].color + "'></span>" + a[1].seriesName + "：" + a[1].value + " Mpa";
                    //     }
                    //     ;
                    //     return relVal;
                    // }
                },
                legend: {
                    data: legend_list,   //['当月曲线','上月曲线',"压力曲线"],
                    left: 'auto',
                },
                toolbox: {
                    show: false
                },
                grid: {
                    left: '80',
                    bottom:'100'
                },
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,  // 让折线图从X轴0刻度开始
                    name: "",
                    axisLabel: {
                        show: true,
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
                    splitArea : {
                        show: true,
                        areaStyle:{
                            color:monthUse.splitAreaColor(hdates)
                        }
                    },
                    data: monthUse.platenumbersplitYear(hdates)
                },
                {

                    type:'category',
                    show:true,
                    position:'bottom',
                    interval:0,
                    offset:20,
                    tooltip:{
                        show:false
                    },
                    axisTick:{
                        show:false
                    },
                    splitLine: {
                        show: false,
                        lineStyle: {
                            color: '#483d8b',
                            type: 'dashed',
                            width: 1
                        }
                    },
                    axisLabel: {
                        show: true,
                        interval:0,
                        rotate: 0
                    },
                    data:monthUse.weekshowsplitFun(hdates)
                }],
                yAxis: [
                    {
                        type: 'value',
                        name: '月用水量 （m³）',
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
                            formatter: '{value}' + 'Mpa'
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
                        
                        splitLine : {
                            show: false
                        },
                        offset : 20
                    }
                ],
                // dataZoom : [{
                //     show : true,
                //     realtime : true,
                //     //orient: 'vertical',   // 'horizontal'
                //     //x: 0,
                //     y: 550,
                //     //width: 400,
                //     height: 20,
                //     //backgroundColor: 'rgba(221,160,221,0.5)',
                //     //dataBackgroundColor: 'rgba(138,43,226,0.5)',
                //     //fillerColor: 'rgba(38,143,26,0.6)',
                //     //handleColor: 'rgba(128,43,16,0.8)',
                //     //xAxisIndex:[],
                //     //yAxisIndex:[],
                //     type: 'inside',
                //     start : start,
                //     end : end
                // },
                // {
                //     show : true,
                //     realtime : true,
                //     //orient: 'vertical',   // 'horizontal'
                //     //x: 0,
                //     y: 550,
                //     //width: 400,
                //     height: 20,
                //     //backgroundColor: 'rgba(221,160,221,0.5)',
                //     //dataBackgroundColor: 'rgba(138,43,226,0.5)',
                //     //fillerColor: 'rgba(38,143,26,0.6)',
                //     //handleColor: 'rgba(128,43,16,0.8)',
                //     //xAxisIndex:[],
                //     //yAxisIndex:[],
                //     type: 'slider',
                //     start : 0,
                //     end : 100
                // }],
                series: serias_list
            };
            myChart.setOption(option);

            // myChart.on('legendselectchanged',function(obj){
            //     var selected = obj.selected;
            //     var name = obj.name;

                
            //     if(name == "压力曲线" && selected[name] == false ){
            //         console.log(selected,name);
            //         option.xAxis[1].data.push(hdates);
            //         //myChart.setOption(option);
            //     }
            // })
            
            // $("#maxflow span").html( maxflow);
            // $("#averflow span").html( average);
            // $("#today_use span").html( today_use);
            // $("#yestoday_use span").html( yestoday_use);
            // $("#last_year_same span").html( last_year_same);
            // $("#tongbi span").html( tongbi);
            // $("#huanbi span").html( huanbi);
            // $("#average span").html( average);
            // $("#max_flow span").html( maxflow);
            // $("#min_flow span").html( minflow);
            // $("#mnf span").html( mnf);
            // $("#mnf_add span").html( mnf_add);
            // $("#back_leak span").html( back_leak);
            // $("#ref_mnf span").html( ref_mnf);
            // $("#alarm_set span").html( alarm_set);

            window.onresize = myChart.resize;
        },
        platenumbersplitYear:function(arr){
            if(arr.length == 0)
                return
            
            var today = arr[arr.length - 1].substring(8,10);
            
            var newArr = [];
            var subitem = "";
            var new_item = "";
            arr.forEach(function(item){
                if (item.length > 8) {
                    subitem = item.substring(8,10)
                    weekday = new Date(item).getDay();
                    if (parseInt(subitem,10) > parseInt(today,10)) {
                        if(weekday == 1){
                            new_item = {
                                value:subitem,// + '\n\n星\n期\n一',
                                textStyle:{
                                    color:'red',
                                    
                                }
                            }
                        }else{
                            new_item = {
                                value:subitem,
                                textStyle:{
                                    color:'red',
                                    
                                }
                            }
                        }
                    }else{
                        if(weekday == 1){
                            new_item = subitem;// + monday;
                        }else{
                            new_item = subitem;
                        }
                    }
                }
                newArr.push(new_item)
            })
            return newArr
        },
        weekshowsplitFun:function(arr){
            if(arr.length == 0)
                return
            this_month = parseInt(arr[arr.length - 1],10);
            // alert(new Date('2018/08/09').getDay());
            var today = arr[arr.length - 1].substring(8,10);
            var monday = '\n星\n期\n一';

            var statistext = '\n 本周用水量:284m3\n最大值：64m3\n最小值：12m3';

            var newArr = [];
            var subitem = "";
            var new_item = "";
            var weekcnt = 0;
            var weekcolor = [week1color,week2color,week3color,week4color,week5color]
            arr.forEach(function(item){
                if (item.length > 8) {
                    subitem = item.substring(8,10)
                    weekday = new Date(item).getDay();

                    
                    if(weekday == 1){
                        new_item = monday;
                        
                    }else if(weekday == 4){
                        new_item = {
                            value:statistext,
                            textStyle:{
                                color:weekcolor[weekcnt],
                                
                            }
                        
                        };
                        weekcnt += 1;
                    }else{
                        new_item = "";
                    }
                    
                }
                newArr.push(new_item)
            })
            return newArr
        },
        splitAreaColor:function(arr){
            
            var weekcnt = 0;
            var newArr = [];

            arr.forEach(function(item){

            })
            return ['rgba(204, 153, 255, 1)','rgba(204, 153, 255, 1)','rgba(204, 153, 255, 1)','rgba(204, 153, 255, 1)','rgba(204, 153, 255, 1)','rgba(204, 153, 255, 1)','rgba(204, 153, 255, 1)',
                    'rgba(153, 255, 255, 1)','rgba(153, 255, 255, 1)','rgba(153, 255, 255, 1)','rgba(153, 255, 255, 1)','rgba(153, 255, 255, 1)','rgba(153, 255, 255, 1)','rgba(153, 255, 255, 1)',
                    'rgba(204, 204, 204, 1)','rgba(204, 204, 204, 1)','rgba(204, 204, 204, 1)','rgba(204, 204, 204, 1)','rgba(204, 204, 204, 1)','rgba(204, 204, 204, 1)','rgba(204, 204, 204, 1)',
                    'rgba(153, 204, 153, 1)','rgba(153, 204, 153, 1)','rgba(153, 204, 153, 1)','rgba(153, 204, 153, 1)','rgba(153, 204, 153, 1)','rgba(153, 204, 153, 1)','rgba(153, 204, 153, 1)',
                    week5color,week5color,week5color,week5color,week5color,week5color,week5color
                    ];
        }
    }
    $(function(){
        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('treeDemo',id,'group');
            };
        });
        
        monthUse.userTree();
        
        monthUse.init();
        
        // monthUse.inquireClick(1);
        
        // IE9 end
        // $("#selectAll").bind("click", monthUse.selectAll);
        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('treeDemo', 'search_condition','group');
        });       
        
        
        
    })
})($,window)
