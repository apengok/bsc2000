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
    var userdaily;
    var usermonthly;
    var sTime;
    var eTime;
    var vectorLayer;
    var map;
    var lng = "",lat="";

    var ol3ops = {
        init:function(){
            
            var controls = [
                new ol.control.Attribution({collapsed: false}),
                // new ol.control.FullScreen(),
                new ol.control.MousePosition({projection: 'EPSG:4326',coordinateFormat: ol.coordinate.createStringXY(5)}),
                
            ];

            // 墨卡托
            // var vec_layer = ol3ops.crtLayerXYZ("vec_w","EPSG:3857",1);
            // var cta_wlayer = ol3ops.crtLayerXYZ("cta_w","EPSG:3857",1);
            // var cva_clayer = ol3ops.crtLayerXYZ("cva_w","EPSG:3857",1);
            
            // 经纬度
            var vec_layer = ol3ops.crtLayerXYZ("vec_c","EPSG:4326",1);
            var cta_wlayer = ol3ops.crtLayerXYZ("cta_c","EPSG:4326",1);
            var cva_clayer = ol3ops.crtLayerXYZ("cva_c","EPSG:4326",1);

            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                  anchor: [0.5, 46],
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'pixels',
                  src: '/static/virvo/images/u3054.png'
                }))
              });
        
            var createMarker = function(coord){
              var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(coord),
                name: 'Null Island',
                population: 4000,
                rainfall: 500
              });
        
              iconFeature.setStyle(iconStyle);
              return iconFeature;
            }
        
              
            vectorLayer = new ol.layer.Vector({
                projection: 'EPSG:4326',
                source: new ol.source.Vector()
              });

            // var center = [118.39469563,29.888188578];
            var center;
            if(!isNaN(Number.parseFloat(lng)) && !isNaN(Number.parseFloat(lng)) ){
                center = [Number.parseFloat(lng),Number.parseFloat(lat)];
            } else{
                var longitude = $("#entlongitude").val();
                var latitude = $("#entlatitude").val();
                var zoomIn = $("#entzoomIn").val();
                var maxZoom = 18;


                if(longitude == "" || latitude == "" || zoomIn == ""){
                    longitude = 113.93125
                    latitude = 22.53579
                    zoomIn = 16
                }
                else{
                    longitude = Number.parseFloat(longitude);
                    latitude = Number.parseFloat(latitude);
                    zoomIn = Number.parseFloat(zoomIn);
                }
                center = [longitude,latitude];
            }
            console.log(center)
            map = new ol.Map({
                layers: [vec_layer,cta_wlayer,cva_clayer,vectorLayer],
                controls: controls,
                target: 'map',
                view: new ol.View({
                    projection: 'EPSG:4326',
                    center: center,
                //   center:  new ol.proj.transform(center,"EPSG:4326","EPSG:3857"),
                    maxZoom : 18,
                    zoom: 14
                })
              });

            if(lng != "" && lat != ""){
                if(!isNaN(lng) && !isNaN(lat))
                {
                    console.log(lng,lat)
                    vectorLayer.getSource().clear();
                    var marker = createMarker(center)
                    vectorLayer.getSource().addFeature(marker);
                    // map.updateSize();
                }
            }
            

        },
        crtLayerXYZ:function(type, proj, opacity){
            var layer = new ol.layer.Tile({
                 source: new ol.source.XYZ({
                     url: 'http://t'+Math.round(Math.random()*7)+'.tianditu.com/DataServer?T='+type+'&x={x}&y={y}&l={z}&tk=e0955897c7f8a5adeba75b55bb11b600',
                     projection: proj
                 }),
                 opacity: opacity
             });
             layer.id = type;
             return layer;
        },
        



    };//ol3op end

    
    showInfo = {
        init: function(){
            
        },
        openCity:function(evt, cityName) {
    
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
              
                tabcontent[i].style.display = "none";
            }
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
              tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            evt.currentTarget.className += " active";
            document.getElementById(cityName).style.display = "block";
            console.log('cityname:',cityName)
            // $("#dayUse").css("display","block")
          },
        requeryComunityData:function(flag){
            url = '/wirelessm/neiborhooddailydata/';
            data = {"communityid":communityid,"flag":flag};
            json_ajax("GET",url,"json",true,data,showInfo.requestDataCallback);

        },
        requestDataCallback:function(data){
            // console.log(data)
            if(data.success){
                dm = data.monthdata2;
                $.each(dm,function(k,v){
                    // console.log(k,":",v)
                    d = k.substring(8,10)
                    $("#d"+d).text(v)
                })
            }
        },
        showinfoStatics:function(){
            // ajax访问后端查询
            
            commaddr = $("#objId").val();
            // console.log("commaddr=",commaddr);
            $.ajax({
                type: "GET",
                url: "/api/monitor/realtimedata/showinfoStatics/",
                data: {
                  "commaddr": commaddr
                },
                dataType: "json",
                success: function (data) {
                    console.log(data.obj)
                    if(data.success)
                    {
                        
                        $("#pickperiod").text(data.obj.pickperiod);
                        $("#reportperiod").text(data.obj.reportperiod);
                        $("#dn").text(data.obj.dn);
                        $("#metertype").text(data.obj.metertype);
                        $("#yestoday_use").text(data.obj.yestoday_use);
                        $("#month_use").text(data.obj.month_use);
                        $("#year_use").text(data.obj.year_use);

                        $("#fluxreadtime").text(data.obj.fluxreadtime);
                        $("#userid").text(data.obj.userid);
                        $("#username").text(data.obj.username);
                        
                        lng = data.obj.lng;
                        lat = data.obj.lat;
                        console.log(lng,lat)
                        ol3ops.init();

                        
                    }

                }
            });

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
                tMonth = showInfo.doHandleMonth(tMonth + 1);
                tDate = showInfo.doHandleMonth(tDate);
                var num = -(day + 1);
                startTime = tYear + "-" + tMonth + "-" + tDate + " "
                    + "00:00:00";
                var end_milliseconds = today.getTime() + 1000 * 60 * 60 * 24
                    * parseInt(num);
                today.setTime(end_milliseconds); //注意，这行是关键代码
                var endYear = today.getFullYear();
                var endMonth = today.getMonth();
                var endDate = today.getDate();
                endMonth = showInfo.doHandleMonth(endMonth + 1);
                endDate = showInfo.doHandleMonth(endDate);
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
                vMonth = showInfo.doHandleMonth(vMonth + 1);
                vDate = showInfo.doHandleMonth(vDate);
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
                    vendMonth = showInfo.doHandleMonth(vendMonth + 1);
                    vendDate = showInfo.doHandleMonth(vendDate);
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
            showInfo.getsTheCurrentTime();
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
        renderSelectYear: function(id){ //时间下拉框函数
            var select = $(id);
            select.children().remove();
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var tmpl = '<option value="$name">$name 年</option>';
            var add0 = function(n){
                // if(n<10){
                //     return '0' + n.toString();
                // }
                return n.toString()
            };
            for(var i=0;i<10;i++){
                select.append($(tmpl.replace(/\$name/g,  add0(year - i))));
            }
        },
        renderSelectMonth: function(id){ //时间下拉框函数
            var select = $(id);
            select.children().remove();
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var tmpl = '<option value="$name">$name 月</option>';
            var add0 = function(n){
                if(n<10){
                    return '0' + n.toString();
                }
                return n.toString()
            };
            for(var i=0;i<12;i++){
                if(i<month){
                    select.append($(tmpl.replace(/\$name/g,  add0(month - i))));
                }
            }
        },
        renderSelectDay: function(id){ //时间下拉框函数
            var select = $(id);
            select.children().remove();
            var now = new Date();
            var year = now.getFullYear();
            var day = now.getDate() ;
            var tmpl = '<option value="$name">$name 日</option>';
            var add0 = function(n){
                if(n<10){
                    return '0' + n.toString();
                }
                return n.toString()
            };
            for(var i=0;i<31;i++){
                if(i<day){
                    select.append($(tmpl.replace(/\$name/g,  add0(day-i))));
                }
            }
        },
        renderWholeDay: function(id,mslect){ //时间下拉框函数
            var select = $(id);
            select.children().remove();
            var mont=[31,28,31,30,31,30,31,31,30,31,30,31];
            var m = Number.parseInt(mslect);
            var year = $("#select00").val();
            var d;
            if(m==2){
                year = Number.parseInt(year);
                if( ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                {
                    d = 29;
                }
                else
                {
                    d=mont[m-1];
                }

            }
            else{
                d=mont[m-1];
            }

            
            var tmpl = '<option value="$name">$name 日</option>';
            var add0 = function(n){
                if(n<10){
                    return '0' + n.toString();
                }
                return n.toString()
            };
            for(var i=0;i<d;i++){
                select.append($(tmpl.replace(/\$name/g,  add0(d-i))));
                
            }
        },
        renderWholeMonth: function(id){ //时间下拉框函数
            var select = $(id);
            select.children().remove();
            var tmpl = '<option value="$name">$name 月</option>';
            var add0 = function(n){
                if(n<10){
                    return '0' + n.toString();
                }
                return n.toString()
            };
            for(var i=0;i<12;i++){
                select.append($(tmpl.replace(/\$name/g,  add0(12 - i))));
            }
        },
        getinstanceflow_data:function(){
            // $("#flow-show-data").css("display","block")
            // $("#flaw-show-echart").css("display","none")
            
            
            commaddr = $("#objId").val();
            // console.log("commaddr=",commaddr,t1,t2);
            $.ajax({
                type: "GET",
                url: "/api/monitor/realtimedata/getinstanceflow_data/",
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
        getinstanceflow:function(){
            // $("#flow-show-data").css("display","none")
            // $("#flaw-show-echart").css("display","block")
            showInfo.getinstanceflow_data();


            
            
            commaddr = $("#objId").val();
            // console.log("commaddr=",commaddr,t1,t2);
            $.ajax({
                type: "GET",
                url: "/api/monitor/realtimedata/getinstanceflow/",
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
                        var data_seris = [];
                        var series_data = [];


                        dm = data.rawdata; //object
                        $.each(dm,function(i,d){
                            // console.log(i,":",d)
                            h = d.readtime.substring(10,16)
                            v = d.flux
                            flag = d.flag
                            if(v<0){
                                v = "-";
                            }
                            data_flow.push(v);
                            data_seris.push(h);
                        })

                        console.log(data_seris)
                        console.log(data_flow)
                        
                        option0 = {
                            // title: {
                            //     left: 'center',
                            //     text: '时段用水量统计图',
                            // },
                            toolbox: {
                                show: true,
                                feature: {
                                    dataZoom: {
                                        yAxisIndex: 'none'
                                    },
                                    dataView : {
                                        show: true, readOnly: true,
                                        optionToContent : function(opt) {
                                            var table = $("#instanceflow-show-data").html();
                                            return table;
                                        }
                                    },
                                    
                                    magicType: {type: ['line', 'bar']},
                                    restore: {},
                                    saveAsImage: {}
                                }
                            },
                            dataZoom: {
                                show: false,
                                start : 0
                            },
                            // legend: {
                            //     data:['曲线','柱状图']
                            // },
                            xAxis: {
                                type: 'category',
                                boundaryGap: false,  // 让折线图从X轴0刻度开始
                                data: data_seris,//['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12', '10-13','10-14', '10-15', '10-16', '10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25', '10-26','10-27','10-28','10-29','10-30']
                            },
                            yAxis: {
                                name:'流量(吨)',
                                nameLocation:'middle',
                                nameGap:30,
                                type: 'value'
                            },
                            // series:series_data
                            series: [{
                                data: data_flow,//[0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27],
                                type: 'line',
                                smooth: false
                            }]
                        };
            
                        instanceflowrt = echarts.init(document.getElementById('instanceflowrt'));
                        instanceflowrt.clear();
                        instanceflowrt.setOption(option0);
            
                    }

                }
            });
        },
        getWatermeterflow_data:function(){
            // $("#flow-show-data").css("display","block")
            // $("#flaw-show-echart").css("display","none")
            var t1 = $("#select00").val();
            var t2 = $("#select01").val();
            var t3 = $("#select02").val();
            
            commaddr = $("#objId").val();
            // console.log("commaddr=",commaddr,t1,t2);
            $.ajax({
                type: "GET",
                url: "/api/monitor/realtimedata/getWatermeterflow_data/",
                data: {
                  "commaddr": commaddr,
                  "syear":t1,
                  "smonth":t2,
                  "sday":t3
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
                            e.plustotalflux = d.plustotalflux;
                            e.reversetotalflux = d.reversetotalflux;
                            data_flow.push(e);
                        })
                        
                        console.log(data_flow)
                            $("#rawdata-table").bootstrapTable("destroy");
                            $("#rawdata-table").bootstrapTable({
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
        getWatermeterflow:function(){
            // $("#flow-show-data").css("display","none")
            // $("#flaw-show-echart").css("display","block")
            showInfo.getWatermeterflow_data();


            var t1 = $("#select00").val();
            var t2 = $("#select01").val();
            var t3 = $("#select02").val();
            
            commaddr = $("#objId").val();
            // console.log("commaddr=",commaddr,t1,t2);
            $.ajax({
                type: "GET",
                url: "/api/monitor/realtimedata/getWatermeterflow/",
                data: {
                  "commaddr": commaddr,
                  "syear":t1,
                  "smonth":t2,
                  "sday":t3
                },
                dataType: "json",
                success: function (data) {
                    // console.log(data)
                    if(data.success)
                    {
                        var data_flow = [];
                        var data_seris = [];
                        var series_data = [];


                        dm = data.flowdata; //object
                        $.each(dm,function(i,d){
                            // console.log(i,":",d)
                            h = d.readtime //.substring(10,16)
                            v = d.totalflux
                            flag = d.flag
                            if(v<0){
                                v = "-";
                            }
                            data_flow.push(v);
                            data_seris.push(h);
                        })

                        date_show = data.datel;
                        neg_data = data.neg_data;
                        pos_data = data.pos_data;
                        // console.log(neg_data)

                        for (let index = 0; index < neg_data.length; index++) {
                            const element = neg_data[index];
                            var dash_style = {
                                name:'曲线',
                                type:'line',     
                                smooth:false,   //关键点，为true是不支持虚线，实线就用true
                                itemStyle:{
                                    normal:{
                                        lineStyle:{
                                            width:2,
                                            type:'dotted'  //'dotted'虚线 'solid'实线
                                        }
                                    }
                                }, 
                                
                                data:neg_data[index]
                            };
                            series_data.push(dash_style)
                        }

                        for (let index = 0; index < pos_data.length; index++) {
                            const element = pos_data[index];
                            var solid_style = {
                                name:'曲线',
                                type:'line',     
                                smooth:false,   //关键点，为true是不支持虚线，实线就用true
                                // itemStyle:{
                                //     normal:{
                                //         lineStyle:{
                                //             width:2,
                                //             type:'dotted'  //'dotted'虚线 'solid'实线
                                //         }
                                //     }
                                // }, 
                                
                                data:pos_data[index]
                            };
                            series_data.push(solid_style)
                        }
                        // console.log(series_data)

                        // series_data.push({
                        //     name:'柱状图',
                        //     type:'bar',
                        //     data:data_flow
                        // })
                        
                        option1 = {
                            // title: {
                            //     left: 'center',
                            //     text: '时段用水量统计图',
                            // },
                            toolbox: {
                                show: true,
                                feature: {
                                    dataZoom: {
                                        yAxisIndex: 'none'
                                    },
                                    dataView : {
                                        show: true, readOnly: true,
                                        optionToContent : function(opt) {
                                            var table = $("#flow-show-data").html();
                                            return table;
                                        }
                                    },
                                    
                                    magicType: {type: ['line', 'bar']},
                                    restore: {},
                                    saveAsImage: {}
                                }
                            },
                            dataZoom: {
                                show: false,
                                start : 0
                            },
                            // legend: {
                            //     data:['曲线','柱状图']
                            // },
                            xAxis: {
                                type: 'category',
                                boundaryGap: false,  // 让折线图从X轴0刻度开始
                                data: date_show,//['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12', '10-13','10-14', '10-15', '10-16', '10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25', '10-26','10-27','10-28','10-29','10-30']
                            },
                            yAxis: {
                                name:'流量(吨)',
                                nameLocation:'middle',
                                nameGap:30,
                                type: 'value'
                            },
                            series:series_data
                            // series: [{
                            //     data: data_flow,//[0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27],
                            //     type: 'line',
                            //     smooth: false
                            // }]
                        };
            
                        userflowrt = echarts.init(document.getElementById('userflowrt'));
                        userflowrt.clear();
                        userflowrt.setOption(option1);
            
                    }

                }
            });
        },
        getWatermeterdaily_data:function(){
            // $("#daily-show-data").css("display","block")
            // $("#daily-show-echart").css("display","none")
            var t1 = $("#select1").val();
            var t2 = $("#select2").val();
            
            
            commaddr = $("#objId").val();
            // console.log("commaddr=",commaddr,t1,t2);
            $.ajax({
                type: "GET",
                url: "/api/monitor/realtimedata/getWatermeterdaily_data/",
                data: {
                  "commaddr": commaddr,
                  "syear":t1,
                  "smonth":t2,
                },
                dataType: "json",
                success: function (data) {
                    console.log(data)
                    if(data.success)
                    {
                        var data_flow = [];
                        

                        dm = data.day_first; //object
                        // console.log(dm)
                        $.each(dm,function(i,d){
                            
                            var e = {};
                            e.seqno =i+1;
                            e.readtime = d.readtime;
                            e.plustotalflux = d.plustotalflux;
                            e.reversetotalflux = d.reversetotalflux;
                            data_flow.push(e);
                        })
                        
                        console.log(data_flow)
                            $("#dailyrawdata-table").bootstrapTable("destroy");
                            $("#dailyrawdata-table").bootstrapTable({
                                data: data_flow,
                                classes: 'table table-condensed table-no-bordered', 
                                striped: false,
                                height: "300"
                            })
                            // $("#rawdata-table").bootstrapTable('hideLoading')
                    }

                }
            });
        },
        getWatermeterdaily:function(){
            // $("#daily-show-data").css("display","none")
            // $("#daily-show-echart").css("display","block")
            showInfo.getWatermeterdaily_data();
            var t1 = $("#select1").val();
            var t2 = $("#select2").val();
            
            commaddr = $("#objId").val();
            // console.log("commaddr=",commaddr,t1,t2);
            $.ajax({
                type: "GET",
                url: "/api/monitor/realtimedata/getWatermeterdaily_data/",
                data: {
                  "commaddr": commaddr,
                  "syear":t1,
                  "smonth":t2
                },
                dataType: "json",
                success: function (data) {
                    // console.log(data)
                    if(data.success)
                    {
                        var data_flow = [];
                        var data_seris = [];
                        var series_data = [];
                        dm = data.flowdata; //object
                        $.each(dm,function(i,d){
                            
                            v = d.totalflux
                            
                            data_flow.push(v);
                            // data_seris.push(h);
                        })
                        date_show = data.datel;
                        neg_data = data.neg_data;
                        pos_data = data.pos_data;
                        // console.log(neg_data)

                        for (let index = 0; index < neg_data.length; index++) {
                            const element = neg_data[index];
                            var dash_style = {
                                name:'曲线',
                                type:'line',     
                                smooth:false,   //关键点，为true是不支持虚线，实线就用true
                                itemStyle:{
                                    normal:{
                                        lineStyle:{
                                            width:2,
                                            type:'dotted'  //'dotted'虚线 'solid'实线
                                        }
                                    }
                                }, 
                                
                                data:neg_data[index]
                            };
                            series_data.push(dash_style)
                        }

                        for (let index = 0; index < pos_data.length; index++) {
                            const element = pos_data[index];
                            var solid_style = {
                                name:'曲线',
                                type:'line',     
                                smooth:false,   //关键点，为true是不支持虚线，实线就用true
                                // itemStyle:{
                                //     normal:{
                                //         lineStyle:{
                                //             width:2,
                                //             type:'dotted'  //'dotted'虚线 'solid'实线
                                //         }
                                //     }
                                // }, 
                                
                                data:pos_data[index]
                            };
                            series_data.push(solid_style)
                        }

                        // series_data.push({
                        //     name:'柱状图',
                        //     type:'bar',
                        //     data:data_flow
                        // })
                        console.log(series_data)
                        option1 = {
                            // title: {
                            //     left: 'center',
                            //     text: '每日用水量统计图',
                            // },
                            toolbox: {
                                show: true,
                                feature: {
                                    dataZoom: {
                                        yAxisIndex: 'none'
                                    },
                                    dataView : {
                                        show: true, readOnly: true,
                                        optionToContent : function(opt) {
                                            var table = $("#daily-show-data").html();
                                            return table;
                                        }
                                    },
                                    magicType: {type: ['line', 'bar']},
                                    restore: {},
                                    saveAsImage: {}
                                }
                            },
                            // dataZoom: {
                            //     show: true,
                            //     start : 40
                            // },
                            // legend: {
                            //     data:['曲线','柱状图']
                            // },
                            xAxis: {
                                type: 'category',
                                boundaryGap: false,  // 让折线图从X轴0刻度开始
                                data: date_show,//['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12', '10-13','10-14', '10-15', '10-16', '10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25', '10-26','10-27','10-28','10-29','10-30']
                            },
                            yAxis: {
                                name:'流量(吨)',
                                nameLocation:'middle',
                                nameGap:30,
                                type: 'value'
                            },
                            series:series_data
                            // series: [{
                            //     data: data_flow,//[0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27],
                            //     type: 'line',
                            //     smooth: true
                            // }]
                        };
            
                        userdaily = echarts.init(document.getElementById('userdaily'));
                        userdaily.clear()
                        userdaily.setOption(option1);
            
                    }

                }
            });
        },
        getWatermeterMonth_data:function(){
            // $("#month-show-data").css("display","block")
            // $("#month-show-echart").css("display","none")
            var t1 = $("#select1").val();
            var t2 = $("#select2").val();
            
            
            commaddr = $("#objId").val();
            // console.log("commaddr=",commaddr,t1,t2);
            $.ajax({
                type: "GET",
                url: "/api/monitor/realtimedata/getWatermeterMonth_data/",
                data: {
                  "commaddr": commaddr,
                  "syear":t1,
                  "smonth":t2,
                },
                dataType: "json",
                success: function (data) {
                    console.log(data)
                    if(data.success)
                    {
                        var data_flow = [];
                        

                        dm = data.day_first; //object
                        // console.log(dm)
                        $.each(dm,function(i,d){
                            
                            var e = {};
                            e.seqno =i+1;
                            e.readtime = d.readtime;
                            e.plustotalflux = d.plustotalflux;
                            e.reversetotalflux = d.reversetotalflux;
                            data_flow.push(e);
                        })
                        
                        console.log(data_flow)
                            $("#monthrawdata-table").bootstrapTable("destroy");
                            $("#monthrawdata-table").bootstrapTable({
                                data: data_flow,
                                classes: 'table table-condensed table-no-bordered', 
                                striped: false,
                                height: "300"
                            })
                            // $("#rawdata-table").bootstrapTable('hideLoading')
                    }

                }
            });
        },
        getWatermeterMonth:function(){
            // $("#month-show-data").css("display","none")
            // $("#month-show-echart").css("display","block")
            showInfo.getWatermeterMonth_data()

            var t3 = $("#select3").val();

            commaddr = $("#objId").val();
            // console.log("commaddr=",commaddr);
            $.ajax({
                type: "GET",
                url: "/api/monitor/realtimedata/getWatermeterMonth_data/",
                data: {
                  "commaddr": commaddr,
                  "syear":t3,
                },
                dataType: "json",
                success: function (data) {
                    // console.log(data)
                    if(data.success)
                    {
                        var data_flow = [];
                        var data_seris = [];
                        var series_data = [];
                        dm = data.flowdata; //object
                        $.each(dm,function(i,d){
                            
                            v = d.totalflux
                            
                            data_flow.push(v);
                            // data_seris.push(h);
                        })
                        date_show = data.datel;
                        neg_data = data.neg_data;
                        pos_data = data.pos_data;
                        // console.log(neg_data)

                        for (let index = 0; index < neg_data.length; index++) {
                            const element = neg_data[index];
                            var dash_style = {
                                name:'曲线',
                                type:'line',     
                                smooth:false,   //关键点，为true是不支持虚线，实线就用true
                                itemStyle:{
                                    normal:{
                                        lineStyle:{
                                            width:2,
                                            type:'dotted'  //'dotted'虚线 'solid'实线
                                        }
                                    }
                                }, 
                                
                                data:neg_data[index]
                            };
                            series_data.push(dash_style)
                        }

                        for (let index = 0; index < pos_data.length; index++) {
                            const element = pos_data[index];
                            var solid_style = {
                                name:'曲线',
                                type:'line',     
                                smooth:false,   //关键点，为true是不支持虚线，实线就用true
                                // itemStyle:{
                                //     normal:{
                                //         lineStyle:{
                                //             width:2,
                                //             type:'dotted'  //'dotted'虚线 'solid'实线
                                //         }
                                //     }
                                // }, 
                                
                                data:pos_data[index]
                            };
                            series_data.push(solid_style)
                        }

                        // series_data.push({
                        //     name:'柱状图',
                        //     type:'bar',
                        //     data:data_flow
                        // })
                        // console.log(series_data)

                        option2 = {
                            // title: {
                            //     left: 'center',
                            //     text: '每月用水量统计图',
                            // },
                            // dataZoom: {
                            //     show: true,
                            //     start : 40
                            // },
                            toolbox: {
                                show: true,
                                feature: {
                                    dataZoom: {
                                        yAxisIndex: 'none'
                                    },
                                    dataView : {
                                        show: true, readOnly: true,
                                        optionToContent : function(opt) {
                                            var table = $("#month-show-data").html();
                                            return table;
                                        }
                                    },
                                    magicType: {type: ['line', 'bar']},
                                    restore: {},
                                    saveAsImage: {}
                                }
                            },
                            // legend: {
                            //     data:['曲线','柱状图']
                            // },
                            xAxis: {
                                type: 'category',
                                boundaryGap: false,  // 让折线图从X轴0刻度开始
                                data: date_show,//['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12', '10-13','10-14', '10-15', '10-16', '10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25', '10-26','10-27','10-28','10-29','10-30']
                            },
                            yAxis: {
                                name:'流量(吨)',
                                nameLocation:'middle',
                                nameGap:30,
                                type: 'value'
                            },
                            series:series_data,
                            // series: [{
                            //     name:'月用水量',
                            //     data: data_flow,//[0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27],
                            //     type: 'line',
                            //     smooth: true
                            // }]
                        };

                        usermonthly = echarts.init(document.getElementById('usermonthly'));
                        usermonthly.clear();
                        usermonthly.setOption(option2);
                    }

                }
            });
        },

    }

    $(function(){
        $('input').inputClear();
        showInfo.init();

        // showInfo.renderSelectYear("#select000");
        // showInfo.renderSelectMonth("#select001");
        // showInfo.renderSelectDay("#select002");
        $('#timeInterval').dateRangePicker({dateLimit:30});
        showInfo.startDay(-7);
        $('#timeInterval').val(startTime + '--' + endTime);

        showInfo.renderSelectYear("#select00");
        showInfo.renderSelectMonth("#select01");
        showInfo.renderSelectDay("#select02");
        showInfo.renderSelectYear("#select00");
        showInfo.renderSelectYear("#select1");
        showInfo.renderSelectMonth("#select2");
        showInfo.renderSelectYear("#select3");
        showInfo.renderSelectYear("#select4");

        $("#select1").on('change',function(){
            var yearSelect = $(this).val();
            var now = new Date();
            var year = now.getFullYear();
            if(yearSelect !== year){
                showInfo.renderWholeMonth('#select2');
            }
        })

        $("#select00").on('change',function(){
            var yearSelect = $(this).val();
            var now = new Date();
            var year = now.getFullYear();
            if(yearSelect !== year){
                showInfo.renderWholeMonth('#select01');
                var monthselect = $("#select01").val();
                showInfo.renderWholeDay('#select02',monthselect);
            }
        })

        $("#select01").on('change',function(){
            var monthselect = $(this).val();
            var now = new Date();
            var month = now.getMonth();
            // console.log(monthselect)
            if(monthselect !== month){
                showInfo.renderWholeDay('#select02',monthselect);
            }
        })
        

        $("#inquirefluxflow").on('click',function(){
        showInfo.estimate();
        showInfo.getinstanceflow();
        });
        $("#inquireflow").on('click',function(){
            showInfo.getWatermeterflow();
        });
        
        $("#inquireDaily").on('click',function(){
            showInfo.getWatermeterdaily();
        });
        
        $("#inquireMonthly").on('click',function(){
            showInfo.getWatermeterMonth();
        });

        
        showInfo.showinfoStatics();
        // ol3ops.init();
        showInfo.estimate();
        showInfo.getinstanceflow();
        // showInfo.getWatermeterflow();
        // showInfo.getWatermeterdaily();
        // showInfo.getWatermeterMonth();
        

        $('#day-tab').on('shown.bs.tab', function (e) {
            console.log("showing...in tab")
            // myChart.setOption(options);
            userdaily.resize()
        })

        $('#mon-tab').on('shown.bs.tab', function (e) {
            usermonthly.resize();
        })

        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('commubitytreeDemo', id,'assignment');
            };
        });

        
        // $("#dayUse").css("display","block")
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

        // 解决怪异问题：地图在页面打开是不显示，窗口大小改变后才显示
        setTimeout(function(){map.updateSize();}, 200);
        
    })
})(window,$)