(function (window, $) {
    // var table = $("#dataTable tr th:gt(1)");
    var subChk = $("input[name='subChk']");
    var myTable;
    var concentrator_id;
    var concentrator_commaddr;
    var ROOT_PATH = "http://120.78.255.129:8080/amrs";

    configCentrator = {
        init: function () {
            
            //configCentrator.loadwatermeter();
            console.log("init");
            configCentrator.getTable('#concentrator_watermeter');
            

        },

        getwatermeterlist: function () {
            concentrator_id = $("#concentrator_id").val();
            var url="/devm/concentrator/getwatermeterlistbyconId/";
            var data = {"con_id": concentrator_id};
            json_ajax("GET",url,"json",true,data,configCentrator.getCallback);
        },
        getCallback:function(data){
			var now = new Date();
            console.log(now,data)
            if(data.success==true){
                // 集中器参数信息
                if(data.concentrator_info != null && data.concentrator_info.length != 0)
                {
                    var cinfo = data.concentrator_info;
                    console.log(data.concentrator_info)
                    $("#concentrator_time").val(cinfo.readtime);
                    $("#read_period").val(cinfo.readperiod);
                    $("#ipaddress").val(cinfo.readip);
                    $("#portno").val(cinfo.readport);
                    $("#concentrator_replystatus").val(cinfo.replystatus);
                }
                watermeterlist = [];//用来储存显示数据
                if(data.meterlist!=null&&data.meterlist.length!=0){
                    var meters=data.meterlist;
                    for(var i=0;i<meters.length;i++){
                        //阀门状态 0:无 1:开启 2:关闭 3:半开 4:异常
                        var valvestate = "";
                        if(meters[i].valvestate == 0)
                        {
                            valvestate = "无";
                        }
                        else if(meters[i].valvestate == 1)
                        {
                            valvestate = "开启";
                        }
                        else if(meters[i].valvestate == 2)
                        {
                            valvestate = "关闭";
                        }
                        else if(meters[i].valvestate == 3)
                        {
                            valvestate = "半开";
                        }
                        else if(meters[i].valvestate == 4)
                        {
                            valvestate = "异常";
                        }

                        var dateList=
                            {
                                "id":meters[i].id,
                                "operation":meters[i].operation,
                                "serialnumber":meters[i].serialnumber,
                                "valvestate":valvestate,
                                "dosage":meters[i].dosage,
                                "lastreadtime":meters[i].lastreadtime,
                                "status":meters[i].status,
                            };
                            watermeterlist.push(dateList);
                            
                    }
                    
                    configCentrator.reloadData(watermeterlist);
                    
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
              "Info": false,// 页脚信息
              "autoWidth": true,// 自动宽度
              "stripeClasses" : [],
              "lengthMenu" : [ 10, 20, 50, 100, 200 ],
              "columns": [
                    {
                        //第一列，用来显示序号
                        "data" : null,
                        "class" : "text-center"
                    },
                    { "data": null,
                        "render" : function(data, type, row, meta) {
                            // console.log("data:",data);
                            // console.log("row:",row);

                        var result = '';
                        result += '<input  type="checkbox" name="subChk"  sid="' + row.id + '" />';
                        return result;
                        
                        // if (idStr != userId) {
                        //     var result = '';
                        //     result += '<input  type="checkbox" name="subChk"  value="' + idStr + '" uid="'+ uid+'" />';
                        //     return result;
                        // }else{
                        //     var result = '';
                        //     result += '<input  type="checkbox" name="subChk" />';
                        //     return result;
                        // }
                        }
                    },
                    { "data": "operation",
                        "render": function (data, type, row, meta) {
                            
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                            // return row[2];
                        }
                    },
                    { "data": "serialnumber",
                        "render": function (data, type, row, meta) {
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                            // return row[3];
                        }
                    },
                    {
                        "data": "valvestate",
                        "render": function (data, type, row, meta) {
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                        }
                    },
                    {
                        "data": "dosage",
                        "render": function (data, type, row, meta) {
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                        }
                    },
                    {
                        "data": "lastreadtime",
                        "render": function (data, type, row, meta) {
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                        }
                    },
                    {
                        "data": "status",
                        "render": function (data, type, row, meta) {
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                        }
                    }
                ],
                
              "pagingType" : "full_numbers", // 分页样式
              "dom" : "t" + "<'row'<'col-md-3 col-sm-12 col-xs-12'l><'col-md-4 col-sm-12 col-xs-12'i><'col-md-5 col-sm-12 col-xs-12'p>>",
              "oLanguage": {// 国际语言转化
                  "oAria": {
                      "sSortAscending": " - click/return to sort ascending",
                      "sSortDescending": " - click/return to sort descending"
                  },
                  "sLengthMenu": "显示 _MENU_ 记录",
                  "sInfo": "",
                  "sZeroRecords": "集中器没有户表关联",
                  "sEmptyTable": "集中器没有户表关联",
                  "sLoadingRecords": "正在加载数据-请等待...",
                  "sInfoEmpty": "",
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
                    { 'width': "10%", "targets": 0 },
                    { 'width': "20%", "targets": 1 },
                    { 'width': "30%", "targets": 2 },
                    { 'width': "30%", "targets": 3 },
                    
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
              
        },
        reloadData: function (dataList) {
            var currentPage = myTable.page()
            myTable.clear()
            myTable.rows.add(dataList)
            // myTable.page(currentPage).draw(false);
            myTable.columns.adjust().draw(false);

        },
        //全选
        checkAllClick: function(){
            $("input[name='subChk']").prop("checked", this.checked);
        },
        //单选
        subChk: function(){
            $("#checkAll").prop("checked",subChk.length == subChk.filter(":checked").length ? true: false);
        },
        // 读取 集中器时间
        readtime:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr = $("#concentrator_commaddr").val();
			console.log("读取集中器时间" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            $("#concentrator_time").val("");
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"readtime"};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
            $("#concentrator_replystatus").val( "正在读取集中器时间");
        },
        // 发送 集中器时间
        sendtime:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            console.log("设置集中器时间" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            var myDate = (new Date()).Format("yyyy-MM-dd hh:mm:ss");
             console.log(myDate);

            $("#concentrator_time").val(myDate);
            var stime = $("#concentrator_time").val();
            if(stime == ""){
                layer.msg("请输入设置时间");
                return
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"sendtime"};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
            $("#concentrator_replystatus").val( "正在发送集中器时间");
        },
        // 发送抄表间隔
        sendperiod:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            console.log("设置抄表间隔" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            var periodtime = $("#read_period").val();
            if(periodtime == ""){
                layer.msg("请输入设置时间");
                return
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"sendperiod"+'@'+periodtime};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
            $("#concentrator_replystatus").val( "正在发送抄表间隔");
        },
        // 读取抄表间隔
        readperiod:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr = $("#concentrator_commaddr").val();
            console.log("读取抄表间隔" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            $("#read_period").val("");
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"readperiod"};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
            $("#concentrator_replystatus").val( "正在读取抄表间隔");
        },
        // 发送 ip and port
        sendip:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            console.log("设置IP地址和端口" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            var ipaddress = $("#ipaddress").val();
            if(ipaddress == ""){
                layer.msg("请输入ip");
                return
            }
            var portno = $("#portno").val();
            if(portno == ""){
                layer.msg("请输入端口号");
                return
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"sendip"+'@'+ipaddress+'@'+portno};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
            $("#concentrator_replystatus").val( "正在发送IP地址和端口号");
        },
        // 读取 ip and port
        readip:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            console.log("读取IP地址和端口" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            $("#ipaddress").val("");
            $("#portno").val("");
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"readip"};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
            $("#concentrator_replystatus").val( "正在读取IP地址和端口号");
        },
        // 抄表
        readvalue:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            console.log("抄单个表" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            var serialnumber="";
            var table = $("#concentrator_watermeter").dataTable();
            $.each(table.fnGetNodes(), function (index, value) {
                //console.log(index,value);
                var obj = {};
                var checked_flag = $(value).find('input[type="checkbox"]:checked').length;
                if(checked_flag != 0 ){

                     serialnumber = $(value).find('td:eq(3)').html();
                    console.log("serialnumber=" + serialnumber);
                }
            });
            if(serialnumber == ""){
                layer.msg("请选择需抄表的表计");
                return
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"readvalue"+'@'+serialnumber};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
            $("#concentrator_replystatus").val( "正在抄单个表数据");
        },
        // 关阀
        closevalve:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            console.log("关阀" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            var serialnumber="";
            var table = $("#concentrator_watermeter").dataTable();
            $.each(table.fnGetNodes(), function (index, value) {
                //console.log(index,value);
                var obj = {};
                var checked_flag = $(value).find('input[type="checkbox"]:checked').length;
                if(checked_flag != 0 ){

                    serialnumber = $(value).find('td:eq(3)').html();
                    console.log("serialnumber=" + serialnumber);
                }
            });
            if(serialnumber == ""){
                layer.msg("请选择需关阀的表计");
                return
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"closevalve"+'@'+serialnumber};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
            $("#concentrator_replystatus").val( "正在关阀");
        },
        // 开阀
        openvalve:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            console.log("开阀" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            var serialnumber="";
            var table = $("#concentrator_watermeter").dataTable();
            $.each(table.fnGetNodes(), function (index, value) {
                //console.log(index,value);
                var obj = {};
                var checked_flag = $(value).find('input[type="checkbox"]:checked').length;
                if(checked_flag != 0 ){

                    serialnumber = $(value).find('td:eq(3)').html();
                    console.log("serialnumber=" + serialnumber);
                }
            });
            if(serialnumber == ""){
                layer.msg("请选择需开阀的表计");
                return
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"openvalve"+'@'+serialnumber};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
            $("#concentrator_replystatus").val( "正在开阀");
        },
        // 下载表计信息到集中器
        downto:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            console.log("下载表计信息到集中器" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            var serialnumber="";
            var table = $("#concentrator_watermeter").dataTable();
            $.each(table.fnGetNodes(), function (index, value) {
                //console.log(index,value);
                var obj = {};
                var checked_flag = $(value).find('input[type="checkbox"]:checked').length;
                if(checked_flag != 0 ){

                    serialnumber = $(value).find('td:eq(3)').html();
                    console.log("serialnumber=" + serialnumber);
                }
            });
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"downto"+'@'+concentrator_commaddr};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
            $("#concentrator_replystatus").val( "正在下载表计信息到集中器");
        },
        // 读取集中器内表计信息
        readfrom:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            console.log("读取集中器内表计信息" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"readfrom"};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
            $("#concentrator_replystatus").val( "正在读取集中器内表计信息");
        },
        // 启动抄表
        readstart:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            console.log("启动立即抄表(全抄)" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"readstart"};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
            $("#concentrator_replystatus").val( "正在启动立即抄表(全抄)");

        },
        // 删除表计
        deleteMeter:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            console.log("删除表计" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            var serialnumber="";
            var table = $("#concentrator_watermeter").dataTable();
            $.each(table.fnGetNodes(), function (index, value) {
                //console.log(index,value);
                var obj = {};
                var checked_flag = $(value).find('input[type="checkbox"]:checked').length;
                if(checked_flag != 0 ){

                    serialnumber = $(value).find('td:eq(3)').html();
                    console.log("serialnumber=" + serialnumber);
                }
            });
            if(serialnumber == ""){
                layer.msg("请选择需删除的表计");
                return
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"delmeter"+'@'+serialnumber};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            // $("#concentrator_replystatus").val( "正在从集中器删除表计");
            layer.msg("正在从集中器删除表计")
            json_ajax("POST",url,"jsonp",true,data, configCentrator.getreplystatus);

        },

        getreplystatus:function(data){
			setTimeout(function(){
				concentrator_id = $("#concentrator_id").val();
				var url="/devm/concentrator/getConcentratorReplyStatus/";
				var data = {"con_id": concentrator_id};
                json_ajax("GET",url,"json",true,data,configCentrator.processbystatus);
                layer.msg("正在查询删除状态")
			},10000);
            
        },
		processbystatus:function(data){
            console.log(data);
            if(data.success){
                // delete meter from database
                concentrator_id = $("#concentrator_id").val();
                var url="/devm/concentrator/deletemeter_bystatus/";
                var data = {"con_id": concentrator_id};
                json_ajax("GET",url,"json",true,data,configCentrator.saveCommandback);
                // layer.msg("刷新当前页面")
            }else{
                layer.msg("未找到删除成功标志")
            }
        },
        // 清除表计
        clearMeter:function(){
            concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            console.log("清除表计" );
            console.log("concentrator_commaddr=" + concentrator_commaddr);
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            var serialnumber="";
            var table = $("#concentrator_watermeter").dataTable();
            $.each(table.fnGetNodes(), function (index, value) {
                //console.log(index,value);
                var obj = {};
                var checked_flag = $(value).find('input[type="checkbox"]:checked').length;
                if(checked_flag != 0 ){

                    serialnumber = $(value).find('td:eq(3)').html();
                    console.log("serialnumber=" + serialnumber);
                }
            });
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"commaddr":concentrator_commaddr,"cmd":"modifyIpAndPort","params":"clearmeter"};
            url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
            // $("#concentrator_replystatus").val( "正在从集中器清除表计");
            layer.msg("正在从集中器清除表计")
            json_ajax("POST",url,"jsonp",true,data, configCentrator.getreplystatus);

        },

        saveCommandback:function(data){
			var now = new Date();
            console.log("saveCommandback:",data,now);
            //configCentrator.getwatermeterlist();
			setTimeout(configCentrator.getwatermeterlist,1000);
        },
        checkAll : function(e){
            $("input[name='subChk']").not(':disabled').prop("checked", e.checked);

        },
        
        
        
    }
    $(function () {
        $('input').inputClear();
        //初始化
        configCentrator.init();
        
        configCentrator.getwatermeterlist();
        $("#readtime").bind("click",configCentrator.readtime);
        $("#sendtime").bind("click",configCentrator.sendtime);
        $("#sendperiod").bind("click",configCentrator.sendperiod);
        $("#readperiod").bind("click",configCentrator.readperiod);
        $("#readip").bind("click",configCentrator.readip);
        $("#sendip").bind("click",configCentrator.sendip);
        $("#readvalue").bind("click",configCentrator.readvalue);
        $("#openvalve").bind("click",configCentrator.openvalve);
        $("#downto").bind("click",configCentrator.downto);
        $("#readfrom").bind("click",configCentrator.readfrom);
        $("#readstart").bind("click",configCentrator.readstart);
        $("#closevalve").bind("click",configCentrator.closevalve);
        // add
        $("#deleteMeter").bind("click",configCentrator.deleteMeter);
        $("#clearMeter").bind("click",configCentrator.clearMeter);
        
		
    })
})(window, $)
