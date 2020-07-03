(function($,window){
    var selectTreeId = '';
    var selectTreeType = '';
    var selectDistrictId = '';
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
    var stationdataListArray = [];
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

    var myTable;

    analysisCxc = {
        init: function(){
            console.log("analysisCxc init");
            analysisCxc.tableFilter();
            // analysisCxc.getsTheMaxTime();
            // laydate.render({elem: '#endtime',max: analysisCxc.getsTheMaxTime(),theme: '#6dcff6'});
        },
        tableFilter: function(){
            //显示隐藏列
            var menu_text = "";
            var table = $("#dataTable tr th:gt(1)");
            menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(2) +"\" disabled />"+ table[0].innerHTML +"</label></li>"
            for(var i = 1; i < table.length; i++){
                menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(i+2) +"\" />"+ table[i].innerHTML +"</label></li>"
            };
            $("#Ul-menu-text").html(menu_text);
        },
        getsTheMaxTime: function () {
            
                var nowDate = new Date();
                maxTime = parseInt(nowDate.getFullYear())
                    + "-"
                    + (parseInt(nowDate.getMonth() + 1) < 10 ? "0"
                        + parseInt(nowDate.getMonth() + 1)
                        : parseInt(nowDate.getMonth() + 1))
                    + "-"
                    + (nowDate.getDate() < 10 ? "0" + nowDate.getDate()
                        : nowDate.getDate()) + " ";
                $("#endtime").val(maxTime);
                return maxTime
            },
        userTree : function(){
            // 初始化文件树
            treeSetting = {
                async : {
                    url : "/dmam/district/dmatree/",
                    type : "post",
                    enable : true,
                    autoParam : [ "id" ],
                    dataType : "json",
                    data:{'csrfmiddlewaretoken': '{{ csrf_token }}'},
                    otherParam : {  // 是否可选 Organization
                        "isOrg" : "1",
                        // "csrfmiddlewaretoken": "{{ csrf_token }}"
                    },
                    dataFilter: analysisCxc.ajaxDataFilter
                },
                view : {
                    // addHoverDom : analysisCxc.addHoverDom,
                    // removeHoverDom : analysisCxc.removeHoverDom,
                    selectedMulti : false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree
                },
                edit : {
                    enable : true,
                    editNameSelectAll : true,
                    showRemoveBtn : false,//analysisCxc.showRemoveBtn,
                    showRenameBtn : false
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    // beforeDrag : analysisCxc.beforeDrag,
                    // beforeEditName : analysisCxc.beforeEditName,
                    // beforeRemove : analysisCxc.beforeRemove,
                    // beforeRename : analysisCxc.beforeRename,
                    // onRemove : analysisCxc.onRemove,
                    // onRename : analysisCxc.onRename,
                    onClick : analysisCxc.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#treeDemo"), treeSetting, zNodes);
            var treeObj = $.fn.zTree.getZTreeObj('treeDemo');treeObj.expandAll(true);
           
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
            station = treeNode.id;
            $('#simpleQueryParam').val("");
            $("#organ_name").attr("value",treeNode.name);
            if(treeNode.type == "dma"){
                var pNode = treeNode.getParentNode();
                // $("#organ_name").attr("value",pNode.name);
                $("#station_name").attr("value",treeNode.name);
                organ = pNode.id;
                station = treeNode.id;
            }

            analysisCxc.inquireClick(1);
            //analysisCxc.inquireDmastations(1);
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
                                 '<button onclick="analysisCxc.findOperationById(\''+calldata[i].id+'\')" data-target="#updateType" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp<button type="button"  onclick="analysisCxc.deleteType(\''+calldata[i].id+'\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>删除</button>',    
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
            if(analysisCxc.validates()){
                $("#eadOperation").ajaxSubmit(function(data) {
                    console.log('sdfe:',data);
                    if (data != null && typeof(data) == "object" &&
                        Object.prototype.toString.call(data).toLowerCase() == "[object object]" &&
                        !data.length) {//判断data是字符串还是json对象,如果是json对象
                            if(data.success == true){
                                $("#addType").modal("hide");//关闭窗口
                                layer.msg(publicAddSuccess,{move:false});
                                analysisCxc.closeClean();//清空文本框
                                $("#operationType").val("");
                                analysisCxc.findOperation();
                            }else{
                                layer.msg(data.msg,{move:false});
                            }
                    }else{//如果data不是json对象
                            var result = $.parseJSON(data);//转成json对象
                            if (result.success == true) {
                                    $("#addType").modal("hide");//关闭窗口
                                    layer.msg(publicAddSuccess,{move:false});
                                    $("#operationType").val("");
                                    analysisCxc.closeClean();//清空文本框
                                    analysisCxc.findOperation();
                            }else{
                                layer.msg(result.msg,{move:false});
                            }
                    }
                });
            }
        },
        updateDoSubmit:function () {
            analysisCxc.init();
            if(analysisCxc.upDateValidates()){
                var operationType=$("#updateOperationType").val();// 运营资质类型
                var explains=$("#updateDescription").val();// 说明
                var data={"id":OperationId,"operationType":operationType,"explains":explains};
                var url="group/updateOperation";
                json_ajax("POST", url, "json", true,data,analysisCxc.updateCallback);
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
                analysisCxc.findOperation();
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
                json_ajax("POST", url, "json", false,data,analysisCxc.deleteCallback);
            });
        },
        deleteCallback:function(data){
            if(data.success==true){
                layer.closeAll('dialog');
                analysisCxc.findOperation();
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
                json_ajax("POST", url, "json", false,data,analysisCxc.deleteOperationMoreCallback);
                layer.closeAll('dialog');
            });
        },
        deleteOperationMoreCallback : function(data){
            if(data.success){
                layer.msg(publicDeleteSuccess);
                analysisCxc.findOperation();
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        findOperationByVague:function(){
            analysisCxc.findOperation();
        },
        findDownKey:function(event){
            if(event.keyCode==13){
                analysisCxc.findOperation();
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
                tMonth = analysisCxc.doHandleMonth(tMonth + 1);
                tDate = analysisCxc.doHandleMonth(tDate);
                var num = -(day + 1);
                startTime = tYear + "-" + tMonth + "-" + tDate + " "
                    + "00:00:00";
                var end_milliseconds = today.getTime() + 1000 * 60 * 60 * 24
                    * parseInt(num);
                today.setTime(end_milliseconds); //注意，这行是关键代码
                var endYear = today.getFullYear();
                var endMonth = today.getMonth();
                var endDate = today.getDate();
                endMonth = analysisCxc.doHandleMonth(endMonth + 1);
                endDate = analysisCxc.doHandleMonth(endDate);
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
                vMonth = analysisCxc.doHandleMonth(vMonth + 1);
                vDate = analysisCxc.doHandleMonth(vDate);
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
                    vendMonth = analysisCxc.doHandleMonth(vendMonth + 1);
                    vendDate = analysisCxc.doHandleMonth(vendDate);
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
            
            dataListArray = [];
            var url = "/analysis/flowdata_cxc/";
            var endTime = $("#endtime").val()

            var data = {"organ": organ,"treetype":selectTreeType,"station":station,"endTime": endTime};
            json_ajax("POST", url, "json", false, data, analysisCxc.findOnline);     //发送请求
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
            analysisCxc.getsTheCurrentTime();
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
        inquireDmastations: function (number) {
            var dma_id = 1;
            var url="analysisCxc/dmastations/";
            // var parameter={"dma_id":dma_id};
            var data = {"organ": organ,'treetype':selectTreeType,"station":station,"endTime": endTime};
            json_ajax("POST",url,"json",true,data,analysisCxc.getCallback);
        },
        getCallback:function(date){
            if(date.success==true){
                stationdataListArray = [];//用来储存显示数据
                if(date.obj!=null&&date.obj.length!=0){
                    var stasticinfo=date.obj;
                    for(var i=0;i<stasticinfo.length;i++){
                        
                        var dateList=
                            [
                              i+1,
                              stasticinfo[i].organ,
                              stasticinfo[i].total,
                              stasticinfo[i].sale,
                              stasticinfo[i].uncharg,
                              stasticinfo[i].leak,
                              stasticinfo[i].cxc,
                              stasticinfo[i].cxc_percent,
                              stasticinfo[i].huanbi,
                              stasticinfo[i].leak_percent,
                              leak_tmp_str,
                              stasticinfo[i].tongbi,
                              stasticinfo[i].mnf,
                              stasticinfo[i].back_leak,
                              stasticinfo[i].other_leak,
                              stasticinfo[i].statis_date
                            ];
//                      if(stasticinfo[i].majorstasticinfo!=null||  stasticinfo[i].speedstasticinfo!=null|| stasticinfo[i].vehicleII!=null
//                        ||stasticinfo[i].timeoutParking!=null||stasticinfo[i].routeDeviation!=null||
//                       stasticinfo[i].tiredstasticinfo!=null||stasticinfo[i].inOutArea!=null||stasticinfo[i].inOutLine!=null){
                            stationdataListArray.push(dateList);
//                      }
                    }
                    analysisCxc.reloadData(stationdataListArray);
                    $("#simpleQueryParam").val("");
                    $("#search_button").click();
                }else{
                    analysisCxc.reloadData(stationdataListArray);
                    $("#simpleQueryParam").val("");
                    $("#search_button").click();
                }
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        getTable: function(table){
            $('.toggle-vis').prop('checked', true);
            myTable = $(table).DataTable({
              "destroy": true,
              "dom": 'tiprl',// 自定义显示项
              "lengthChange": true,// 是否允许用户自定义显示数量
              "bPaginate": true, // 翻页功能
              "bFilter": false, // 列筛序功能
              "searching": true,// 本地搜索
              "ordering": false, // 排序功能
              "Info": true,// 页脚信息
              "autoWidth": true,// 自动宽度
              "stripeClasses" : [],
              "lengthMenu" : [ 10, 20, 50, 100, 200 ],
              "pagingType" : "full_numbers", // 分页样式
              "dom" : "t" + "<'row'<'col-md-3 col-sm-12 col-xs-12'l><'col-md-4 col-sm-12 col-xs-12'i><'col-md-5 col-sm-12 col-xs-12'p>>",
              "oLanguage": {// 国际语言转化
                  "oAria": {
                      "sSortAscending": " - click/return to sort ascending",
                      "sSortDescending": " - click/return to sort descending"
                  },
                  "sLengthMenu": "显示 _MENU_ 记录",
                  "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录。",
                  "sZeroRecords": "该分区没有子分区",
                  "sEmptyTable": "该分区没有子分区",
                  "sLoadingRecords": "正在加载数据-请等待...",
                  "sInfoEmpty": "当前显示0到0条，共0条记录",
                  "sInfoFiltered": "（数据库中共为 _MAX_ 条记录）",
                  "sProcessing": "<img src='../resources/user_share/row_details/select2-spinner.gif'/> 正在加载数据...",
                  "sSearch": "模糊查询：",
                  "sUrl": "",
                  "oPaginate": {
                      "sFirst": "首页",
                      "sPrevious": " 上一页 ",
                      "sNext": " 下一页 ",
                      "sLast": " 尾页 "
                  },
                  "columnDefs": [
                    { 'width': "40%", "targets": 0 },
                    { 'width': "80%", "targets": 1 },
                    { 'width': "30%", "targets": 2 },
                ],
              },
              "order": [
                  [0, null]
              ],// 第一列排序图标改为默认

              });
              myTable.on('order.dt search.dt', function () {
                  myTable.column(0, {
                      search: 'applied',
                      order: 'applied'
                  }).nodes().each(function (cell, i) {
                      cell.innerHTML = i + 1;
                  });
              }).draw();
              //显示隐藏列
              $('.toggle-vis').off('change').on('change', function (e) {
                  var column = myTable.column($(this).attr('data-column'));
                  column.visible(!column.visible());
                  $(".keep-open").addClass("open");
              });
              $("#search_button").on("click",function(){
                  var tsval = $("#simpleQueryParam").val()
                  myTable.search(tsval, false, false).draw();
              });
        },
        reloadData: function (dataList) {
            var currentPage = myTable.page()
            myTable.clear()
            myTable.rows.add(dataList)
            // myTable.page(currentPage).draw(false);
            myTable.columns.adjust().draw();

        },
        findOnline: function (data) {//回调函数    数据组装
            var list = [];
            var myChart = echarts.init(document.getElementById('onlineGraphics'));
            var online = "";
            var influx;
            var total;
            var leak;
            var uncharg;
            var cp_month;
            var sale;
            var cxc;
            var cxc_percent;
            var broken_pipe;
            var mnf;
            var leak_percent;
            var back_leak;
            var stasticinfo = "";
            
            if (data.obj != null && data.obj != "") {
                online = data.obj.online;
                stasticinfo = data.obj.stationsstastic;
                influx = data.obj.influx;
                total = data.obj.total;
                leak = data.obj.leak;
                uncharg = data.obj.uncharg;
                sale = data.obj.sale;
                cxc = data.obj.cxc;
                cxc_percent = data.obj.cxc_percent;
                broken_pipe = data.obj.broken_pipe;
                mnf = data.obj.mnf;
                back_leak = data.obj.back_leak;
                leak_percent = data.obj.leak_percent;
            }
            if (data.success == true) {
                // carLicense = [];
                // activeDays = [];
                hdates = [];
                dosages = [];
                leakages = [];
                uncharged = [];
                cp_month  = [];
                stationdataListArray = [];//用来储存显示数据
                for (var i = 0; i < online.length; i++) {
                    list =
                        [i + 1, online[i].hdate,
                            online[i].color,
                            online[i].dosage,
                            // online[i].allDays == null ? "0" : online[i].allDays,
                            online[i].ratio == null ? "0" : online[i].ratio,
                            online[i].assignmentName == null ? "无" : online[i].assignmentName,
                            // online[i].professionalNames == "" ? "无" : online[i].professionalNames,
                            online[i].leak,
                            online[i].uncharged,
                            online[i].cp_month,
                        ]

                    dataListArray.push(list);                                       //组装完成，传入  表格
                };
                // 子分区统计信息
                for(var i=0;i<stasticinfo.length;i++){
                    var leak_tmp_str;
                    var leak_tmp = stasticinfo[i].leak_percent;
                        if(leak_tmp < 12 ){
                            leak_tmp_str = '<span style="background-color:#68f442;color:white;">'+ leak_tmp+'</span>';
                        }else if(leak_tmp<16){
                            leak_tmp_str = '<span style="background-color:#e58a22;color:white;">'+ leak_tmp+'</span>';
                        }else{
                            leak_tmp_str = '<span style="background-color:#f70439;color:white;">'+ leak_tmp+'</span>';
                        }
                    var dateList=
                        [
                          i+1,
                          stasticinfo[i].organ,
                          stasticinfo[i].total,
                          stasticinfo[i].sale,
                          stasticinfo[i].uncharg,
                          stasticinfo[i].leak,
                          stasticinfo[i].cxc,
                          stasticinfo[i].cxc_percent,
                          stasticinfo[i].huanbi,
                          // stasticinfo[i].leak_percent,
                          leak_tmp_str,
                          stasticinfo[i].tongbi,
                          stasticinfo[i].mnf,
                          stasticinfo[i].back_leak,
                          stasticinfo[i].other_leak,
                          stasticinfo[i].statis_date
                        ];
//                      if(stasticinfo[i].majorstasticinfo!=null||  stasticinfo[i].speedstasticinfo!=null|| stasticinfo[i].vehicleII!=null
//                        ||stasticinfo[i].timeoutParking!=null||stasticinfo[i].routeDeviation!=null||
//                       stasticinfo[i].tiredstasticinfo!=null||stasticinfo[i].inOutArea!=null||stasticinfo[i].inOutLine!=null){
                        stationdataListArray.push(dateList);
//                      }
                }
                // analysisCxc.reloadData(stationdataListArray);

                for (var j = 0; j < dataListArray.length; j++) {// 排序后组装到图表
                    hdates.push(dataListArray[j][1]);
                    dosages.push(dataListArray[j][3]);
                    leakages.push(dataListArray[j][6]);
                    uncharged.push(dataListArray[j][7]);
                    cp_month.push(dataListArray[j][8]);
                }
                

                // analysisCxc.reloadData(dataListArray);
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
                leakages = [];
                uncharged = [];
                leakages.push("");
                uncharged.push("");
                cp_month = [];
                cp_month.push("");
                stationdataListArray = [];
            }
            var start;
            var end;
            var length;
            length = online.length;
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
                end = 100 * (200 / length);
            }
            ;
            // wjk
            //carLicense = analysisCxc.platenumbersplitFun(carLicense);
            var option = {
                tooltip: {
                    trigger: 'axis',
                    textStyle: {
                        fontSize: 20
                    },
                    // formatter: function (a) {
                    //     var relVal = "";
                    //     //var relValTime = a[0].name;
                    //     var relValTime  =hdates[a[0].dataIndex];
                    //     if (a[0].data == 0) {
                    //         relVal = "无相关数据";
                    //         relVal += "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:" + a[0].color + "'></span>" + a[0].seriesName + "：" + a[0].value + " m³/h";
                    //     } else {
                    //         relVal = relValTime;
                    //         relVal += "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:" + a[0].color + "'></span>" + a[0].seriesName + "：" + a[0].value + " m³/h";
                    //     }
                    //     ;
                    //     return relVal;
                    // }
                },
                legend: {
                    data: ['售水量','未计量水量','漏水量','产销差率'],
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
                    boundaryGap: false,  // 让折线图从X轴0刻度开始
                    name: "",
                    axisLabel: {
                        show: true,
                        interval: 0,
                        rotate: 0
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: 'grey',
                            type: 'dashed',
                            width: 0.5
                        }
                    },
                    data: analysisCxc.platenumbersplitYear(hdates)
                },
                yAxis: [
                    {
                        type: 'value',
                        name: '供水总量 （万m³/月）',
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
                    {
                        type : 'value',
                        name :'产销差率(%)',
                        nameTextStyle:{
                            color: 'black',
                            fontFamily: '微软雅黑 Bold',
                            fontSize: 14,
                            fontStyle: 'normal',
                            fontWeight: 700
                        },
                        nameLocation:'middle',
                        nameGap:35,
                        min: 0,
                        max: 100,
                        interval: 25,
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
                        splitLine: {
                            show: false
                        },
                        offset : 18
                    }
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
                        name: '售水量',
                        yAxisIndex: 0,
                        type: 'bar',
                        stack:'dma',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: '#7cb4ed'
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
                        name: '未计量水量',
                        yAxisIndex: 0,
                        type: 'bar',
                        stack:'dma',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: '#474249'
                            }
                        },
                        data: uncharged
                    },
                    {
                        name: '漏水量',
                        yAxisIndex: 0,
                        xAxisIndex: 0,
                        type: 'bar',
                        stack:'dma',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: '#92eb7f'
                            }
                        },
                        data: leakages
                    },
                    {
                        name: '产销差率',
                        yAxisIndex: 1,
                        xAxisIndex: 0,
                        type: 'scatter',
                        // stack:'dma',
                        
                        itemStyle: {
                            normal: {
                                color: '#f4e804'
                            }
                        },
                        data: analysisCxc.buildScatterdata(cp_month,hdates)
                    }
                ]
            };
            myChart.setOption(option);
            
            $("#influx").html( influx);
            $("#total").html( total);
            $("#leak").html( leak);
            $("#uncharg").html( uncharg);
            $("#sale").html( sale);
            $("#cxc").html( cxc);
            $("#cxc_percent").html( cxc_percent);
            $("#broken_pipe").html( broken_pipe);
            $("#back_leak").html( back_leak);
            $("#leak_percent").html( leak_percent);
            $("#mnf").html( mnf);
            
            

            window.onresize = myChart.resize;
            analysisCxc.reloadData(stationdataListArray);
        },
        buildScatterdata:function(arr,xarr){
            var newArr = [];
            var i = 0;
            arr.forEach(function(item){
                item = [xarr[i],item,3];
                i++;
                newArr.push(item)
            })
            return newArr
        },
        // 查询全部
        refreshTable: function(){
            selectTreeId = "";
            selectDistrictId = "";
            $('#simpleQueryParam').val("");
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.selectNode("");
            zTree.cancelSelectedNode();
            // myTable.requestData();
            analysisCxc.inquireClick(1);
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
        
        analysisCxc.userTree();
        analysisCxc.getsTheMaxTime();
        analysisCxc.init();
        
        analysisCxc.getTable('#dataTable');
        analysisCxc.inquireClick(1);
        //analysisCxc.inquireDmastations(1);
        // IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            analysisCxc.refreshTable();
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
        // $("#selectAll").bind("click", analysisCxc.selectAll);
        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('treeDemo', 'search_condition','group');
        });       
        
        $('#refreshTable').on("click",analysisCxc.refreshTable);
        
    })
})($,window)
