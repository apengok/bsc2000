(function(window,$){
    var selectTreeId = '';
    var selectTreepId="";
    var selectTreeType = '';

    var selectCommunity = "";
    var selectBuilding = "";
    var communityid = "";
    //显示隐藏列
    var menu_text = "";
    var table = $("#dataTable tr th:gt(1)");
    //单选
    var subChk = $("input[name='subChk']");
    var communityTree = {
        init : function(){
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
                        "isCommunity" : "1",

                        // "csrfmiddlewaretoken": "{{ csrf_token }}"
                    },
                    dataFilter: communityTree.ajaxDataFilter
                },
                view : {
                    // addHoverDom : communityTree.addHoverDom,
                    // removeHoverDom : communityTree.removeHoverDom,
                    selectedMulti : false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree
                },
                // edit : {
                //     enable : true,
                //     editNameSelectAll : true,
                //     showRenameBtn : false
                // },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    // beforeDrag : dmaManage.beforeDrag,
                    // beforeEditName : dmaManage.beforeEditName,
                    // beforeRemove : dmaManage.beforeRemove,
                    // beforeRename : dmaManage.beforeRename,
                    // // onRemove : dmaManage.onRemove,
                    // onRename : dmaManage.onRename,
                    onClick : communityTree.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#commubitytreeDemo"), treeSetting, null);
            var treeObj = $.fn.zTree.getZTreeObj('commubitytreeDemo');treeObj.expandAll(true);
           
        },

        beforeDrag: function(treeId, treeNodes){
            return false;
        },
        beforeEditName: function(treeId, treeNode){
            className = (className === "dark" ? "" : "dark");
            dmaManage.showLog("[ " + dmaManage.getTime() + " beforeEditName ]&nbsp;&nbsp;&nbsp;&nbsp; "
                    + treeNode.name);
            var zTree = $.fn.zTree.getZTreeObj("commubitytreeDemo");
            zTree.selectNode(treeNode);
            return tg_confirmDialog(null,userGroupDeleteConfirm);
        },
        // 组织树预处理函数
        ajaxDataFilter: function(treeId, parentNode, responseData){
            var treeObj = $.fn.zTree.getZTreeObj("commubitytreeDemo");
            if (responseData) {
                for (var i = 0; i < responseData.length; i++) {
                        responseData[i].open = true;
                }
            }
            return responseData;
        },
        //点击节点
        zTreeOnClick: function(event, treeId, treeNode){
            selectTreeId = treeNode.id;
            selectDistrictId = treeNode.districtid;
            selectTreeIdAdd=treeNode.uuid;
            
            $('#simpleQueryParam').val("");
            
            
            // dmaManage.getBaseinfo();
            if(treeNode.otype == "community"){
                var pNode = treeNode.getParentNode();
                selectCommunity = treeNode.name;
                selectTreeType = "community";
                communityid = treeNode.id;
                $("#station_name").val(treeNode.name)
                $("#commaddr").val(treeNode.id)

                communityMonth.requeryComunityData();

            }else if(treeNode.otype == "building"){
                var pNode = treeNode.getParentNode();
                selectBuilding = treeNode.name;
                selectTreeType = "building";
                selectCommunity = pNode.name;
            }else{
                selectTreeType = "group";
            }
            
        },
    };
    var 
    communityMonth = {
        init: function(){
            
        },
        
        inquireClick: function (number) {
            var month;
            if (number == 1) {
                month = $('#select2').val()
            }
            if (number == 'thisMonth') {
                month = publicFun.getCurrentMonth();
                $('#select2').val(month)
            }
            if (number == 'lastMonth') {
                // month = publicFun.getCurrentMonth('lastMonth');
                // $('#select2').val(month)
                var currentMonth = $('#select2').val();

                if($('#select2').val() == $("#select2 option:last").val()) {

                    layer.msg('查询时间范围不超过12个月');
                    return;
                }

                var date = new Date(currentMonth);
                date.setMonth(date.getMonth()-1);
                var str = publicFun.formatMonth(date);
                $('#select2').val(str);
                month = $('#select2').val()
            }

        },
        requeryComunityData:function(flag){
            var month1 = $('#select2').val();
            var month2 = $('#select3').val()
            console.log(communityid,month1,month2)
            if(communityid == ""){
                layer.msg("请选择小区")
                return
            }
            url = '/api/wirelessm/neiborhoodmonthdata/';
            data = {"communityid":communityid,"flag":flag,"sMonth":month1,"eMonth":month2};
            json_ajax("GET",url,"json",true,data,communityMonth.requestDataCallback);

        },
        requestDataCallback:function(data){
            console.log(data)
            var table = $('<table>');
            var row = $('<tr>')
            var td1 = $('<td>').text("日期" );
            var td2 = $('<td>').text("用水量");
            row.append(td1);
            row.append(td2);
            table.append(row);

            if(data.success){
                dm = data.monthdata;
                var data_flow = [];
                var data_date = [];
                $.each(dm,function(k,v){
                    console.log(k,":",v)
                    var row = $('<tr>')
                    var td1 = $('<td>').text(k );
                    var td2 = $('<td>').text(Number((v).toFixed(2)));
                    row.append(td1);
                    row.append(td2);
                    table.append(row);
                    d = k.substring(5,8);
                    if (v < 0){
                        v = 0; // 要怎么处理待定
                    }
                    data_flow.push(Number((v).toFixed(2)));
                    data_date.push(d);
                })
                $('#montable').html(table);
                communityMonth.comunityMonthlyUseChart(data_flow,data_date);
            }
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
                tMonth = communityMonth.doHandleMonth(tMonth + 1);
                tDate = communityMonth.doHandleMonth(tDate);
                var num = -(day + 1);
                startTime = tYear + "-" + tMonth + "-" + tDate + " "
                    + "00:00:00";
                var end_milliseconds = today.getTime() + 1000 * 60 * 60 * 24
                    * parseInt(num);
                today.setTime(end_milliseconds); //注意，这行是关键代码
                var endYear = today.getFullYear();
                var endMonth = today.getMonth();
                var endDate = today.getDate();
                endMonth = communityMonth.doHandleMonth(endMonth + 1);
                endDate = communityMonth.doHandleMonth(endDate);
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
                vMonth = communityMonth.doHandleMonth(vMonth + 1);
                vDate = communityMonth.doHandleMonth(vDate);
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
                    vendMonth = communityMonth.doHandleMonth(vendMonth + 1);
                    vendDate = communityMonth.doHandleMonth(vendDate);
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
            communityMonth.getsTheCurrentTime();
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
        renderSelect: function(id){ //时间下拉框函数
            var select = $(id);
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var tmpl = '<option value="$name">$name</option>';
            var add0 = function(n){
                if(n<10){
                    return '0' + n.toString();
                }
                return n.toString()
            };
            for(var i=0;i<12;i++){
                if(i<month){
                    select.append($(tmpl.replace(/\$name/g, year + '-' + add0(month - i))));
                }else{
                    select.append($(tmpl.replace(/\$name/g, (year -1)  + '-' + add0(12 - i + month))));
                }
            }
        },
        // 获取当月天数
        getDaysInOneMonth:function(year, month){
            month = parseInt(month,10);
            var d= new Date(year,month,0);
            return d.getDate(); 
        },
         // 获取当前月或上一月
         getCurrentMonth:function(parm){
            var nowDate = new Date();
            var y = nowDate.getFullYear();
            var m = nowDate.getMonth()+1;

            if (parm) {
                m = nowDate.getMonth();
            }

            if (m<10) {
                m = '0' + m
            }

            return y + '-' + m;
        },
        //格式化年月
        formatMonth:function(monthStr){
            var now = new Date(monthStr);
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var add0 = function(n){
                if(n<10){
                    return '0' + n.toString();
                }
                return n.toString()
            };
            return year + '-' + add0(month);
        },
        // 判断时间范围
        datedifference:function(sDate1, sDate2){
            var dateSpan,
            tempDate,
            iDays;
            sDate1 = Date.parse(sDate1);
            sDate2 = Date.parse(sDate2);
            dateSpan = sDate2 - sDate1;
            dateSpan = Math.abs(dateSpan);
            iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
            // return iDays
            return (iDays+1) //加一才是正常天数
        },
        comunityMonthlyUseChart:function(data_flow,data_seris){

            var myChart = echarts.init(document.getElementById('comunity_monthly_chart'));

            var option = {
                tooltip: {
                    trigger: 'axis',
                    textStyle: {
                        fontSize: 20
                    },
                    
                },
                legend: {
                    data: ['用水量','用水量bar'],
                    left: 'auto',
                },
                toolbox: {
                    show: false
                },
                grid: {
                    left: '80',
                    bottom:'50',
                    right:'80'
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: true,  // 让折线图从X轴0刻度开始
                    name: "",
                    axisLabel: {
                        show: true,
                        interval: 0,
                        rotate: 0
                    },
                    axisTick:{
                        show:true,
                        inside:true,
                        length:300,
                        alignWithLabel:true ,    //让柱状图在坐标刻度中间
                        lineStyle: {
                            color: 'grey',
                            type: 'dashed',
                            width: 0.5
                        }
                    },
                    splitLine: {
                        show: false,
                        offset:5,
                        lineStyle: {
                            color: 'grey',
                            type: 'dashed',
                            width: 0.5
                        }
                    },
                    data: communityMonth.platenumbersplitYear(data_seris)
                },
                yAxis: [
                    {
                        type: 'value',
                        name: '月用水总量 （m³/月）',
                        nameTextStyle:{
                            color: 'black',
                            fontFamily: '微软雅黑 Bold',
                            fontSize: 14,
                            fontStyle: 'normal',
                            fontWeight: 700
                        },
                        nameLocation:'middle',
                        nameGap:60,
                        scale: false,
                        position: 'left',

                        axisTick : {    // 轴标记
                            show:false,
                            length: 10,
                            lineStyle: {
                                color: 'green',
                                type: 'solid',
                                width: 2
                            }
                        },
                        axisLabel : {
                            show:true,
                            interval: 'auto',    // {number}
                            rotate: 0,
                            margin: 18,
                            formatter: '{value}',    // Template formatter!
                            textStyle: {
                                color: 'grey',
                                fontFamily: 'verdana',
                                fontSize: 10,
                                fontStyle: 'normal',
                                fontWeight: 'bold'
                            }

                        },
                        splitLine: {
                            show: true
                        }
                    },
                    
                ],
                // dataZoom: [{
                //     type: 'inside',
                //     start: start,
                //     end: end
                // }, {

                //     show: true,
                //     height: 20,
                //     type: 'slider',
                //     top: 'top',
                //     xAxisIndex: [0],
                //     start: 0,
                //     end: 10,
                //     showDetail: false,
                // }],
                series: [
                    {
                        name: '用水量',
                        yAxisIndex: 0,
                        type: 'line',
                        // stack:'dma',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: '#7cb4ed'
                            }
                        },
                        data: data_flow,
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
                        name: '用水量bar',
                        yAxisIndex: 0,
                        type: 'bar',
                        // stack:'dma',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: '#474249'
                            }
                        },
                        data: data_flow
                    },
                    
                ]
            };
            myChart.setOption(option);

            
            
        },

        platenumbersplitYear:function(arr){
            // var newArr = [ '08','09','10','11',
            //     {
            //         value:'12',
            //         textStyle: {
            //             color: 'red',
                        
            //         }
            //     },
            //     '01','02','03','04','05','06','07'];
            console.log(arr)
            var newArr = [];
            this_month = parseInt(arr[arr.length - 1],10);
            arr.forEach(function(item){
                if (parseInt(item,10) > this_month) {
                    item = {
                        value:item,
                        textStyle:{
                            color:'red',
                        }
                    }
                }
                newArr.push(item)
            })
            return newArr
        },

    }

    $(function(){
        $('input').inputClear();
        communityTree.init();
        communityMonth.init();
        
        communityMonth.renderSelect('#select2')
        communityMonth.renderSelect('#select3')
        $("#select2 option:last").prop('selected', true);

        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('commubitytreeDemo', id,'assignment');
            };
        });
        //IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            var search;
            $("#search_condition").bind("focus",function(){
                search = setInterval(function(){
                    search_ztree('commubitytreeDemo', 'search_condition','assignment');
                },500);
            }).bind("blur",function(){
                clearInterval(search);
            });
        }
        //全选
        $("#checkAll").bind("click",communityMonth.cleckAll);
        //单选
        subChk.bind("click",communityMonth.subChkClick);
        //批量删除
        $("#del_model").bind("click",communityMonth.delModel);
        //加载完成后执行
        $("#refreshTable").on("click",communityMonth.refreshTable);
        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('commubitytreeDemo', 'search_condition', 'assignment');
        });
        $("#inquireClickBtn").on("click",function(){
            communityMonth.requeryComunityData(1);
        })
        // $("#inquireClickBtn").bind('click',communityMonth.requeryComunityData);
        // $("#addId").bind("click",function(){
        //     $("#addDistrictForm").modal("show")
        // })
    })
})(window,$)