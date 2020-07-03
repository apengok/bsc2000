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
            biaowu.pieChart();
            // biaowu.waterattrPie();
            // biaowu.generalInfo();
        },
        inquireClick: function (num) {
            $(".mileage-Content").css("display", "block");  //显示图表主体
            
            dataListArray = [];
            var url = "/reports/biaowu/biaowudata/";
            // var endTime = $("#endtime").val()

            var data = {"organ": "virvo_organization_rzav_ehou_yslh","dma_no":"301","endTime": "2018-11"};
            json_ajax("POST", url, "json", false, data, biaowu.reportDataCallback);     //发送请求
        },
        reportDataCallback:function (data) {
            if (data != null) {
                if (data.success) { 
                    console.log(data)
                    var obj = data.obj;
                    var fault_count = obj.fault_count;
                    var dn_count = obj.dn_count;
                    var manufacturer_count = obj.manufacturer_count;
                    var metertype_count = obj.metertype_count;
                    var usertype_count = obj.usertype_count;
                    var alarm_data = obj.alarm_data;
                    var dn_data = obj.dn_data;
                    var manufacturer_data = obj.manufacturer_data;
                    var usertype_data = obj.usertype_data;
                    var metertype_data = obj.metertype_data;

                    var mon_max_flow = obj.mon_max_flow;
                    var max_flow_station = obj.max_flow_station;
                    var mon_min_flow = obj.mon_min_flow;
                    var min_flow_station = obj.min_flow_station;

                    $("#fault_count").html(fault_count + " 次")
                    $("#dn_count").html(dn_count + " 台")
                    $("#manufacturer_count").html(manufacturer_count + " 家")
                    $("#metertype_count").html(metertype_count + " 家")

                    $("#maxFlow").html(mon_max_flow);
                    $("#thisMonMax").html(max_flow_station);
                    $("#minFlow").html(mon_min_flow);
                    $("#thisMonMin").html(min_flow_station);

                    if(alarm_data != null && alarm_data.length > 0){
                        biaowu.faultRank(alarm_data);
                    }
                    if(dn_data != null && dn_data.length > 0){
                        biaowu.dnStatstic(dn_data);
                    }
                    if(manufacturer_data != null && manufacturer_data.length > 0){
                        biaowu.manuStastic(manufacturer_data);
                    }
                    if(metertype_data != null && metertype_data.length > 0){
                        biaowu.typeStastic(metertype_data);
                    }
                    if(usertype_data != null && usertype_data.length > 0){
                        biaowu.waterattrPie(usertype_data);
                    }
                }else{
                    layer.msg(data.msg,{move:false});
                }
            }
        },

        // 综合信息 -故障排行
        faultRank:function(data){
            var table = $('<table>');
            for(i=0; i<data.length; i++){
                var row = $('<tr>')
                var td1 = $('<td>').addClass('custom-col1').text(data[i].name );
                var td2 = $('<td>').addClass('custom-col2').text(data[i].count);
                row.append(td1);
                row.append(td2);
                table.append(row);
            }

            $('#faultRank').append(table);
        },
        // 综合信息 -口径统计
        dnStatstic:function(data){
            var table = $('<table>');
            for(i=0; i<data.length; i++){
                var row = $('<tr>')
                var td1 = $('<td>').addClass('custom-col1').text(data[i].name );
                var td2 = $('<td>').addClass('custom-col2').text(data[i].count);
                row.append(td1);
                row.append(td2);
                table.append(row);
            }

            $('#dnStatstic').append(table);
        },
        // 综合信息 -厂家统计
        manuStastic:function(data){
            var table = $('<table>');
            for(i=0; i<data.length; i++){
                var row = $('<tr>')
                var td1 = $('<td>').addClass('custom-col1').text(data[i].name );
                var td2 = $('<td>').addClass('custom-col2').text(data[i].count);
                row.append(td1);
                row.append(td2);
                table.append(row);
            }

            $('#manuStastic').append(table);
        },
        // 综合信息 -类型统计
        typeStastic:function(data){
            var table = $('<table>');
            for(i=0; i<data.length; i++){
                var row = $('<tr>')
                var td1 = $('<td>').addClass('custom-col1').text(data[i].name );
                var td2 = $('<td>').addClass('custom-col2').text(data[i].count);
                row.append(td1);
                row.append(td2);
                table.append(row);
            }

            $('#typeStastic').append(table);
        },
        
        // 使用年限饼图
        pieChart:function(){
            var legend_stastic = {};

            option = {
                title : {
                    text: '使用年限饼状图',
                    x:'left'
                },
                tooltip : {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    orient : 'vertical',
                    x : 'left',
                    y : 'center',
                    formatter:function(a){
                        console.log(a)
                        return a + ' '+ legend_stastic[a] + '%';
                    },
                    data:['2017','2016','2015','2014','2013']
                },
                
                calculable : true,
                series : [
                    {
                        name:'使用年限',
                        type:'pie',
                        radius : '35%',
                        center: ['60%', '50%'],
                        itemStyle:{
                            normal : {
                                label : {
                                    show : false,
                                    position : 'outer',
                                    formatter : function(p){
                                        // console.log(p)
                                        legend_stastic[p.name] = p.percent;
                                        return p.name + p.percent;
                                    },
                                    textStyle: {
                                        baseline : 'bottom'
                                    }
                                },
                                labelLine : {
                                    show : false
                                }
                            }
                        },
                        data:[
                            {value:335, name:'2017'},
                            {value:310, name:'2016'},
                            {value:234, name:'2015'},
                            {value:135, name:'2014'},
                            {value:1548, name:'2013'}
                        ]
                    }
                ]
            };

            var yearsPie = echarts.init(document.getElementById('yearsPie'));
            yearsPie.setOption(option);
        },

        // 用水性质饼图
        waterattrPie:function(data){
            var legend_stastic = {};

            var data_legend = [];
            var data_usertype = [];

            if(data != null && data.length > 0){
                for(var i =0;i<data.length;i++){
                    data_legend.push(data[i].name);
                    var obj = {};
                    obj.value = data[i].count;
                    obj.name = data[i].name;
                    data_usertype.push(obj)
                }
            }

            console.log(data_legend)
            console.log(data_usertype)

            option = {
                title : {
                    text: '用水性质',
                    x:'left'
                },
                tooltip : {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    orient : 'vertical',
                    x : 'left',
                    y : 'center',
                    formatter:function(a){
                        console.log(a)
                        return a + ' '+ legend_stastic[a] + '%';
                    },
                    data:data_legend, //['居民用水','工业用水','特种用水','商业用水','其他用水']
                },
                
                calculable : true,
                series : [
                    {
                        name:'用水性质',
                        type:'pie',
                        radius : '35%',
                        center: ['70%', '50%'],
                        itemStyle:{
                            normal : {
                                label : {
                                    show : false,
                                    position : 'outer',
                                    formatter : function(p){
                                        // console.log(p)
                                        legend_stastic[p.name] = p.percent;
                                        return p.name + p.percent;
                                    },
                                    textStyle: {
                                        baseline : 'bottom'
                                    }
                                },
                                labelLine : {
                                    show : false
                                }
                            }
                        },
                        data:data_usertype,
                        // [
                        //     {value:335, name:'居民用水'},
                        //     {value:310, name:'工业用水'},
                        //     {value:234, name:'特种用水'},
                        //     {value:135, name:'商业用水'},
                        //     {value:154, name:'其他用水'}
                        // ]
                    }
                ]
            };

            var waterattrPie = echarts.init(document.getElementById('waterattrPie'));
            waterattrPie.setOption(option);
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
