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
                    type : "get",
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

                communityDaily.requeryComunityData(1);

            }else if(treeNode.otype == "building"){
                var pNode = treeNode.getParentNode();
                selectBuilding = treeNode.name;
                selectTreeType = "building";
                selectCommunity = pNode.name;
            }else{
                selectTreeType = "group";
            }
            
        },
    },
    communityDaily = {
        init: function(){
            
        },
        
        requeryComunityData:function(flag){
            if(communityid == ""){
                layer.msg("请选择小区")
                return
            }
            //communityDaily.estimate();
            if(flag==1){
                
            }
            
            var month1 = $('#select2').val();
            

            url = '/api/wirelessm/neiborhooddailydata/';
            //data = {"communityid":communityid,"flag":flag,"sTime":startTime,"eTime":endTime};
            data = {"communityid":communityid,"flag":flag,"month":month1};
            json_ajax("GET",url,"json",true,data,communityDaily.requestDataCallback);

        },
        requestDataCallback:function(data){
            console.log(data)
            if(data.success){
                var data_flow = [];
                var data_seris = [];

                for (var i = 31; i >= 0; i--) {
                    if(i<10){
                        $("#d0"+i).text("")
                    }
                    $("#d"+i).text("")
                }

                dm = data.monthdata;
                $.each(dm,function(k,v){
                    console.log(k,":",v)
                    d = k.substring(8,10)
                    // Math.round(v,2)
                    $("#d"+d).text(Number((v).toFixed(2)))
                    if(v<0){
                        v = "";
                    }
                    data_flow.push(Number((v).toFixed(2)));
                    data_seris.push(d);
                })

                communityDaily.comunityDailyUseChart(data_flow,data_seris);
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
                tMonth = communityDaily.doHandleMonth(tMonth + 1);
                tDate = communityDaily.doHandleMonth(tDate);
                var num = -(day + 1);
                startTime = tYear + "-" + tMonth + "-" + tDate + " "+ "00:00:00";
                var end_milliseconds = today.getTime() + 1000 * 60 * 60 * 24
                    * parseInt(num);
                today.setTime(end_milliseconds); //注意，这行是关键代码
                var endYear = today.getFullYear();
                var endMonth = today.getMonth();
                var endDate = today.getDate();
                endMonth = communityDaily.doHandleMonth(endMonth + 1);
                endDate = communityDaily.doHandleMonth(endDate);
                endTime = endYear + "-" + endMonth + "-" + endDate + " " + "23:59:59";
            } else {
                var startTimeIndex = startValue.slice(0, 10).replace("-", "/").replace("-", "/");
                var vtoday_milliseconds = Date.parse(startTimeIndex) + 1000 * 60 * 60 * 24 * day;
                var dateList = new Date();
                dateList.setTime(vtoday_milliseconds);
                var vYear = dateList.getFullYear();
                var vMonth = dateList.getMonth();
                var vDate = dateList.getDate();
                vMonth = communityDaily.doHandleMonth(vMonth + 1);
                vDate = communityDaily.doHandleMonth(vDate);
                startTime = vYear + "-" + vMonth + "-" + vDate + " "+ "00:00:00";
                if (day == 1) {
                    endTime = vYear + "-" + vMonth + "-" + vDate + " " + "23:59:59";
                } else {
                    var endNum = -1;
                    var vendtoday_milliseconds = Date.parse(startTimeIndex) + 1000 * 60 * 60 * 24 * parseInt(endNum);
                    var dateEnd = new Date();
                    dateEnd.setTime(vendtoday_milliseconds);
                    var vendYear = dateEnd.getFullYear();
                    var vendMonth = dateEnd.getMonth();
                    var vendDate = dateEnd.getDate();
                    vendMonth = communityDaily.doHandleMonth(vendMonth + 1);
                    vendDate = communityDaily.doHandleMonth(vendDate);
                    endTime = vendYear + "-" + vendMonth + "-" + vendDate + " " + "23:59:59";
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
            communityDaily.getsTheCurrentTime();
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
            var firstDay = year + "-" + month + "-" + "01";//上个月的第一天
            if (sTime < firstDay) {                                 //查询判断开始时间不能超过       上个月的第一天
                $("#timeInterval-error").html(starTimeExceedOne).show();
                /*layer.msg(starTimeExceedOne, {move: false});
                key = false;*/
                return;
            }
            $("#timeInterval-error").hide();
            
            key = true;
            startTime=sTime;
            endTime=eTime;
        },
        comunityDailyUseChart:function(data_flow,data_seris){

            var myChart = echarts.init(document.getElementById('comunity_daily_chart'));

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
                    data: data_seris //communityDaily.platenumbersplitYear(data_seris)
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

    }

    $(function(){
        $('input').inputClear();
        communityTree.init();
        communityDaily.init();

        communityDaily.renderSelect('#select2');
        
        // $('#timeInterval').dateRangePicker({dateLimit:30});
        // communityDaily.getsTheCurrentTime();  
        // communityDaily.startDay(-30);  
        // $('#timeInterval').val(startTime + '--' + endTime);

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
        $("#checkAll").bind("click",communityDaily.cleckAll);
        //单选
        subChk.bind("click",communityDaily.subChkClick);
        //批量删除
        $("#del_model").bind("click",communityDaily.delModel);
        //加载完成后执行
        $("#refreshTable").on("click",communityDaily.refreshTable);
        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('commubitytreeDemo', 'search_condition', 'assignment');
        });

        $("#thismonthClick").on("click",function(){
            communityDaily.requeryComunityData(0);
        })
        $("#lastmonthClick").on("click",function(){
            communityDaily.requeryComunityData(-1);
        })
        $("#inquireClick").on("click",function(){
            communityDaily.requeryComunityData(1);
        })

        // $("#addId").bind("click",function(){
        //     $("#addDistrictForm").modal("show")
        // })
    })
})(window,$)