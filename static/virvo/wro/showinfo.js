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
    
    showInfo = {
        init: function(){
            
        },
        requeryComunityData:function(flag){
            url = '/wirelessm/neiborhooddailydata/';
            data = {"communityid":communityid,"flag":flag};
            json_ajax("GET",url,"json",true,data,showInfo.requestDataCallback);

        },
        requestDataCallback:function(data){
            console.log(data)
            if(data.success){
                dm = data.monthdata2;
                $.each(dm,function(k,v){
                    console.log(k,":",v)
                    d = k.substring(8,10)
                    $("#d"+d).text(v)
                })
            }
        },
        pressureGauge:function(){
            // ajax访问后端查询
            
            vwaterid = $("#objId").val();
            console.log("vwaterid=",vwaterid);
            $.ajax({
                type: "GET",
                url: "/api/wirelessm/watermeter/showinfoStatics/",
                data: {
                  "vwaterid": vwaterid
                },
                dataType: "json",
                success: function (data) {
                    console.log(data.obj)
                    if(data.success)
                    {
                        
                        $("#numbersth").text(data.obj.numbersth);
                        $("#community").text(data.obj.community);
                        $("#rtime").text(data.obj.rtime);
                        $("#serialnumber").text(data.obj.serialnumber);
                        $("#buildingname").text(data.obj.buildingname);
                        $("#roomname").text(data.obj.roomname);
                        $("#username").text(data.obj.username);
                        $("#usertel").text(data.obj.usertel);
                        $("#installationsite").text(data.obj.installationsite);
                        $("#manufacturer").text(data.obj.manufacturer);
                        $("#dn").text(data.obj.dn);
                        $("#meter_catlog").text(data.obj.meter_catlog);
                        $("#valvestate").text(data.obj.valvestate);
                        $("#tmonth").text(data.tmonth);
                        $("#tyestoday").text(data.tyestoday);
                        $("#tyear").text(data.tyear);

                        
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
        getWatermeterdaily:function(){
            var t1 = $("#select1").val();
            var t2 = $("#select2").val();
            
            vwaterid = $("#objId").val();
            console.log("vwaterid=",vwaterid,t1,t2);
            $.ajax({
                type: "GET",
                url: "/api/wirelessm/watermeter/getWatermeterdaily/",
                data: {
                  "vwaterid": vwaterid,
                  "syear":t1,
                  "smonth":t2
                },
                dataType: "json",
                success: function (data) {
                    console.log(data)
                    if(data.success)
                    {
                        var data_flow = [];
                        var data_seris = [];

                        dm = data.dailydata; //object
                        $.each(dm,function(i,d){
                            console.log(i,":",d)
                            h = d.hdate.substring(5,10)
                            v = d.dosage
                            if(v<0){
                                v = "";
                            }
                            data_flow.push(v);
                            data_seris.push(h);
                        })
                        option1 = {
                            title: {
                                left: 'center',
                                text: '用水量统计图',
                            },
                            xAxis: {
                                type: 'category',
                                data: data_seris,//['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12', '10-13','10-14', '10-15', '10-16', '10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25', '10-26','10-27','10-28','10-29','10-30']
                            },
                            yAxis: {
                                name:'流量(吨)',
                                type: 'value'
                            },
                            series: [{
                                data: data_flow,//[0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27],
                                type: 'line',
                                smooth: true
                            }]
                        };
            
                        userdaily = echarts.init(document.getElementById('userdaily'));
                        userdaily.setOption(option1);
            
                    }

                }
            });
        },
        getWatermeterMonth:function(){
            var t3 = $("#select3").val();

            vwaterid = $("#objId").val();
            console.log("vwaterid=",vwaterid);
            $.ajax({
                type: "GET",
                url: "/api/wirelessm/watermeter/getWatermeterMonth/",
                data: {
                  "vwaterid": vwaterid,
                  "syear":t3,
                },
                dataType: "json",
                success: function (data) {
                    console.log(data)
                    if(data.success)
                    {
                        var data_flow = [];
                        var data_seris = [];

                        dm = data.monthlydata;
                        $.each(dm,function(i,d){
                            console.log(i,":",d)
                            h = d.hdate.substring(5,10)
                            v = d.dosage
                            if(v<0){
                                v = "";
                            }
                            data_flow.push(v);
                            data_seris.push(h);
                        })

                        option2 = {
                            title: {
                                left: 'center',
                                text: '用水量统计图',
                            },
                            xAxis: {
                                type: 'category',
                                data: data_seris,//['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12', '10-13','10-14', '10-15', '10-16', '10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25', '10-26','10-27','10-28','10-29','10-30']
                            },
                            yAxis: {
                                name:'流量(吨)',
                                type: 'value'
                            },
                            series: [{
                                data: data_flow,//[0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27,0.11,0.25,0.33,0.38, 0.35, 0.19, 0.36, 0.24, 0.39, 0.12,0.27],
                                type: 'line',
                                smooth: true
                            }]
                        };

                        usermonthly = echarts.init(document.getElementById('usermonthly'));
                        usermonthly.setOption(option2);
                    }

                }
            });
        },

    }

    $(function(){
        $('input').inputClear();
        showInfo.init();

        showInfo.renderSelectYear("#select1");
        showInfo.renderSelectMonth("#select2");
        showInfo.renderSelectYear("#select3");

        $("#select1").on('change',function(){
            var yearSelect = $(this).val();
            var now = new Date();
            var year = now.getFullYear();
            if(yearSelect !== year){
                showInfo.renderWholeMonth('#select2');
            }
        })

        $("#inquireDaily").on('click',function(){
            showInfo.getWatermeterdaily();
        });
        $("#inquireMonthly").on('click',function(){
            showInfo.getWatermeterMonth();
        });

        showInfo.pressureGauge();
        showInfo.getWatermeterdaily();
        showInfo.getWatermeterMonth();
        // $('#timeInterval').dateRangePicker({dateLimit:30});
        // showInfo.getsTheCurrentTime();  
        // showInfo.startDay(-7);  
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
        
    })
})(window,$)