//# sourceURL=biaowu.js
(function($,window){
    var dateForMonth = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'];
    var hostMyChart;
    var mileageStatisticsData = [];
    var thisMouthData = [];
    var lastMouthData = [];
    var vehicleIds = [];
    var mileageDate;
    var mileageVSData;
    var barWidth;
    var hotspoteChartData = [];
    var cycleDate;
    var sum = 0;
    var point = 0;
    //显示隐藏列
    var menu_text = "";
    var table = $("#dataTable tr th:gt(1)");
    // http://echartsjs.com/vendors/echarts/map/json/province/anhui.json
    
    var biaowu = {
        //测试数据
        ceshi: function(){
            // biaowu.hotspoteChart(hotspoteChartData,geoCoordMap);
            biaowu.biguserFlowChart();
            // biaowu.waterattrPie();
            // biaowu.generalInfo();
        },
        inquireClick: function (num) {
            $(".mileage-Content").css("display", "block");  //显示图表主体
            
            dataListArray = [];
            var url = "/reports/biguser/biguserdata/";
            // var endTime = $("#endtime").val()

            var data = {"organ": "virvo_organization_rzav_ehou_yslh","dma_no":"301","endTime": "2018-11"};
            json_ajax("POST", url, "json", false, data, biaowu.reportDataCallback);     //发送请求
        },
        reportDataCallback:function (data) {
            if (data != null) {
                if (data.success) { 
                    console.log(data)
                    var obj = data.obj;
                    var biguserCount = obj.biguserCount;
                    

                    $("#bigUserCount").html(biguserCount + " 个")
                    $("#bigUserAddCount").html(biguserCount + " 个")
                    
                }else{
                    layer.msg(data.msg,{move:false});
                }
            }
        },

        
        
        // 本年度大用户用水曲线图
        biguserFlowChart:function(){
            
            option = {
                title : {
                    text : '本年度大用户用水曲线图',
                    // subtext : 'dataZoom支持'
                },
                tooltip : {
                    trigger: 'item',
                    formatter : function (params) {
                        var date = new Date(params.value[0]);
                        data = date.getFullYear() + '-'
                               + (date.getMonth() + 1) + '-'
                               + date.getDate() + ' '
                               + date.getHours() + ':'
                               + date.getMinutes();
                        return data + '<br/>'
                               + params.value[1] + ', ' 
                               + params.value[2];
                    }
                },
                // toolbox: {
                //     show : true,
                //     feature : {
                //         mark : {show: true},
                //         dataView : {show: true, readOnly: false},
                //         restore : {show: true},
                //         saveAsImage : {show: true}
                //     }
                // },
                dataZoom: {
                    show: true,
                    start : 70
                },
                legend : {
                    data : ['series1'],
                    show:false
                },
                grid: {
                    y2: 80
                },
                xAxis : [
                    {
                        type : 'time',
                        splitNumber:10
                    }
                ],
                yAxis : [
                    {
                        type : 'value'
                    }
                ],
                series : [
                    {
                        name: 'series1',
                        type: 'line',
                        showAllSymbol: true,
                        symbolSize: function (value){
                            return Math.round(value[2]/10) + 2;
                        },
                        data: (function () {
                            var d = [];
                            var len = 0;
                            var now = new Date();
                            var value;
                            while (len++ < 200) {
                                d.push([
                                    new Date(2018, 0, 0, 0, len * 2380),
                                    (Math.random()*30).toFixed(2) - 0,
                                    (Math.random()*100).toFixed(2) - 0
                                ]);
                            }
                            return d;
                        })()
                    }
                ]
            };

            var biguserFlowChart = echarts.init(document.getElementById('biguserFlowChart'));
            biguserFlowChart.setOption(option);
        },

        
        
        // 配表初始化
        init_table: function(){
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
                        "data":"station_name",
                        "class":"text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return "";
                            }
                        }

                    },
                     {
                        "data" : "serialnumber",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return "";
                            }
                        }
                    }, {
                        "data" : "simid",
                        "class" : "text-center",
                        render:function(data){
                            return html2Escape(data)
                        }
                    },{
                        "data" : "dn",
                        "class" : "text-center",
                        
                    } ,
                    // {
                    //     "data" : "version",
                    //     "class" : "text-center",
                        
                    // }, 
                    {
                        "data" : "metertype",
                        "class" : "text-center",
                        render : function(data, type, row, meta){
                            if(data == "0") {
                                return "水表";
                            }else if(data == "1"){
                                return "流量计";
                            }else{
                                return data;
                            }
                        }

                    },
                    {
                        "data":"belongto",
                    },
                     {
                        "data" : "mtype",
                        "class" : "text-center",
                        render : function(data, type, row, meta){
                            if(data == "0"){
                                return "电磁水表";
                            }else if(data == "1") {
                                return "超声水表";
                            }else if(data == "2"){
                                return "机械水表";
                            }else if(data == "3"){
                                return "插入电磁";
                            }else{
                                return data;
                            }
                        }

                    },{
                        "data" : "manufacturer",
                        "class" : "text-center",
                        
                    }, {
                        "data" : "flow_today",
                        "class" : "text-center",
                        
                    }, {
                        "data" : "flow_yestoday",
                        "class" : "text-center",
                        
                    }, {
                        "data" : "flow_b_yestoday",
                        "class" : "text-center",
                        
                    },{
                        "data" : "flow_tomon",
                        "class" : "text-center",
                        
                    
                    },{
                        "data":"flow_yestomon",
                        "class":"text-center",
                        
                    },{
                        "data":"flow_b_yestomon",
                        "class":"text-center",
                        

                    },{
                        "data":"station",
                        "class":"text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return "";
                            }
                        }

                    }];
            //ajax参数
            var ajaxDataParamFun = function(d) {
                d.simpleQueryParam = $('#simpleQueryParam').val(); //模糊查询
                // d.groupName = selectTreeId;
                // d.groupType = selectTreeType;

            };
            //表格setting
            var setting = {
                suffix  : '/',
                listUrl : '/api/reports/meter/list/',
                
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

        
        
        formatSeconds : function (value,isFormate) { // 秒转时分秒
            var theTime = parseInt(value);// 秒
            var theTime1 = 0;// 分
            var theTime2 = 0;// 小时
            if(theTime > 60) {
                theTime1 = parseInt(theTime/60);
                theTime = parseInt(theTime%60);
                if(theTime1 > 60) {
                    theTime2 = parseInt(theTime1/60);
                    theTime1 = parseInt(theTime1%60);
                }
            }
            if (isFormate) {
                var result = "<font class='dateColr' style='font-size:18px'> "+parseInt(theTime)+" </font><font style='font-size:12px'>秒</font>";
                if(theTime1 > 0) {
                    result = "<font class='dateColr' style='font-size:18px'> "+parseInt(theTime1)+" </font><font style='font-size:12px'>分</font>"+result;
                }
                if(theTime2 > 0) {
                    result = "<font class='dateColr' style='font-size:18px'> "+parseInt(theTime2)+" </font><font style='font-size:12px'>小时</font>"+result;
                }
            }else{
                var result = parseInt(theTime)+"秒";
                if(theTime1 > 0) {
                    result = parseInt(theTime1)+"分"+result;
                }
                if(theTime2 > 0) {
                    result = parseInt(theTime2)+"小时"+result;
                }
            }
            return result;
        },
        
        windowResize: function(){
            // biaowu.cycleVS(cycleDate,thisMouthData,lastMouthData);
            // biaowu.mileageVS(mileageDate,mileageVSData);
            // biaowu.mileageStatistics(dateForMonth,mileageStatisticsData);
            // biaowu.hotspoteChart(hotspoteChartData,geoCoordMap);
        },
        fiterNumber : function(data){
            if(data==null||data==undefined||data==""){
                return data;
            }else{
                var data=data.toString();
                data=parseFloat(data);
                return data;
            }
        },
        // wjk 车牌号太长显示不完截取
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
        var validVehicleCount = 0; // 有数据的车辆数量
        biaowu.inquireClick(1);
        biaowu.init_table();
        biaowu.ceshi();
        // $("#checkGroup").bind("click",biaowu.checkGroup);
        $(document).bind('click',biaowu.hideGroup);
        $(window).resize(biaowu.windowResize);
    })
})($,window)
