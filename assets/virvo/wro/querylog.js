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
    
    var organ = '';
    var station = '';
    var bflag = true;
    var zTreeIdJson = {};
    var barWidth;
    var number;
    var checkFlag = false; //判断组织节点是否是勾选操作
    var size;//当前权限监控对象数量
    var online_length;
    

    var commaddr = $("#commaddr").val();
    console.log("commaddr",commaddr)
    //显示隐藏列
    var menu_text = "";
    var table = $("#dataTable tr th:gt(1)");

    querylog = {
        init: function(){
            menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(2) +"\" disabled />"+ table[0].innerHTML +"</label></li>"
            for(var i = 1; i < table.length; i++){
                menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(i+2) +"\" />"+ table[i].innerHTML +"</label></li>"
            };
            $("#Ul-menu-text").html(menu_text);
            //表格列定义
            var columnDefs = [ 
                { "orderable": false, "targets": [ 0 ] },
                { "orderSequence": [ "asc","desc" ], "targets": [ 1 ] },
                { "orderable": false, "targets": [ 2 ] },
                // { "orderable": false, "targets": [ 3 ] },
                // { "orderSequence": [ "desc", "asc", "asc" ], "targets": [ 2 ] },
                { "orderSequence": [ "asc","desc" ], "targets": [ 3 ] }
            ];
            var columns = [
                    {
                        //第一列，用来显示序号
                        "data" : null,
                        "class" : "text-center"
                    },
                    
                    {
                        "data" : "signin_time",
                        "class" : "text-center",
                        
                    }, 
                    {
                        "data" : "ip",
                        "class" : "text-center",
                        

                    },{
                        "data" : "user",
                        "class" : "text-center",
                        
                    },{
                        "data" : "belongto",
                        "class" : "text-center",
                        
                    }, {
                        "data" : "description",
                        "class" : "text-center",
                        
                    }, {
                        "data" : "log_from",
                        "class" : "text-center",
                        
                    }
                    ];
            //ajax参数
            var ajaxDataParamFun = function(d) {
                d.search_user = $('#search_user').val(); //操作用户
                

                d.startTime = sTime
                d.endTime = eTime
                d.commaddr = commaddr

            };
            //表格setting
            var setting = {
                suffix  : '/',
                listUrl : '/api/reports/querylogdata/',
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
        
        
         
        findDownKey:function(event){
            if(event.keyCode==13){
                querylog.findOperation();
            }
        },
        

        //开始时间
        startDay: function (day) {
            var timeInterval = $('#timeInterval').val().split('--');
            var startValue = startTime;// timeInterval[0];
            var endValue = endTime;// timeInterval[1];
            if (startValue == "" || endValue == "") {
                var today = new Date();
                var targetday_milliseconds = today.getTime() + 1000 * 60 * 60
                    * 24 * day;

                today.setTime(targetday_milliseconds); //注意，这行是关键代码

                var tYear = today.getFullYear();
                var tMonth = today.getMonth();
                var tDate = today.getDate();
                tMonth = querylog.doHandleMonth(tMonth + 1);
                tDate = querylog.doHandleMonth(tDate);
                var num = -(day + 1);
                startTime = tYear + "-" + tMonth + "-" + tDate + " "
                    + "00:00:00";
                var end_milliseconds = today.getTime() + 1000 * 60 * 60 * 24
                    * parseInt(num);
                today.setTime(end_milliseconds); //注意，这行是关键代码
                var endYear = today.getFullYear();
                var endMonth = today.getMonth();
                var endDate = today.getDate();
                endMonth = querylog.doHandleMonth(endMonth + 1);
                endDate = querylog.doHandleMonth(endDate);
                endTime = endYear + "-" + endMonth + "-" + endDate + " "  + "23:59:59";
            } else {
                var startTimeIndex = startValue.slice(0, 10).replace("-", "/").replace("-", "/");
                var vtoday_milliseconds = Date.parse(startTimeIndex) + 1000 * 60 * 60 * 24 * day;
                var dateList = new Date();
                dateList.setTime(vtoday_milliseconds);
                var vYear = dateList.getFullYear();
                var vMonth = dateList.getMonth();
                var vDate = dateList.getDate();
                vMonth = querylog.doHandleMonth(vMonth + 1);
                vDate = querylog.doHandleMonth(vDate);
                startTime = vYear + "-" + vMonth + "-" + vDate + " "
                    + "00:00:00";
                if (day == 1) {
                    endTime = vYear + "-" + vMonth + "-" + vDate + " "
                        + "23:59:59";
                } else {
                    // var endNum = -1;
                    // var vendtoday_milliseconds = Date.parse(startTimeIndex) + 1000 * 60 * 60 * 24 * parseInt(endNum);
                    // var dateEnd = new Date();
                    // dateEnd.setTime(vendtoday_milliseconds);
                    // var vendYear = dateEnd.getFullYear();
                    // var vendMonth = dateEnd.getMonth();
                    // var vendDate = dateEnd.getDate();
                    // vendMonth = querylog.doHandleMonth(vendMonth + 1);
                    // vendDate = querylog.doHandleMonth(vendDate);
                    // endTime = vendYear + "-" + vendMonth + "-" + vendDate + " "
                    //     + "23:59:59";
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
            querylog.getsTheCurrentTime();
            
            if(num != 1){
                querylog.startDay(num)
                $('#timeInterval').val(startTime + '--' + endTime);
            }
            querylog.estimate();

            myTable.requestData();

            // dataListArray = [];
            // var url = "/analysis/flowdata_mnf/";

            // var data = {"organ": organ,"treetype":selectTreeType,"station":station,"qmonth":number, 'startTime': sTime, "endTime": eTime};
            // json_ajax("POST", url, "json", false, data, querylog.findOnline);     //发送请求


        },
        

        estimate: function () {
            var timeInterval = $('#timeInterval').val().split('--');
            sTime = timeInterval[0];
            eTime = timeInterval[1];
            querylog.getsTheCurrentTime();
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
            
            key = true;
        },
        reloadData: function (dataList) {
            var currentPage = myTable.page()
            myTable.clear()
            myTable.rows.add(dataList)
            myTable.page(currentPage).draw(false);
        },
        
        
    }
    $(function(){
        
        
        
        $('#timeInterval').dateRangePicker({dateLimit:30});
        querylog.getsTheCurrentTime();  
        // querylog.startDay(-1);  
        $('#timeInterval').val(startTime + '--' + endTime);

        querylog.init();
        querylog.inquireClick(0);
        // querylog.findOperation();
        // IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            querylog.refreshTable();
            
        }
        // IE9 end
        // $("#selectAll").bind("click", querylog.selectAll);
             
        
    })
})($,window)
