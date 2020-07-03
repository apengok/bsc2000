(function (window, $) {
    // var table = $("#dataTable tr th:gt(1)");
    var subChk = $("input[name='subChk']");
    var myTable;
    var concentrator_id;
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
            console.log(data)
            if(data.success==true){
                watermeterlist = [];//用来储存显示数据
                if(data.meterlist!=null&&data.meterlist.length!=0){
                    var meters=data.meterlist;
                    for(var i=0;i<meters.length;i++){
                        
                        var dateList=
                            {
                                "id":meters[i].id,
                                "operation":meters[i].operation,
                                "serialnumber":meters[i].serialnumber,
                                "valvestate":meters[i].valvestate,
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
            
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"concentrator_id":concentrator_id,"cmd":"readtime","params":"readparam"};
            url = ROOT_PATH + "/amrssocket?action=readtime";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
        },
        // 发送 集中器时间
        sendtime:function(){
            concentrator_id = $("#concentrator_id").val();
            if( concentrator_id === undefined){
                layer.msg("集中器不存在");
                return;
            }
            var stime = $("#concentrator_time").val();
            if(stime === ""){
                layer.msg("请输入设置时间");
                return
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"concentrator_id":concentrator_id,"stime":stime,"cmd":"sendtime","params":"readparam"};
            url = ROOT_PATH + "/amrssocket?action=sendtime";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
        },
        // 发送抄表间隔
        sendperiod:function(){
            concentrator_id = $("#concentrator_id").val();
            if( concentrator_id === undefined){
                layer.msg("集中器不存在");
                return;
            }
            var periodtime = $("#read_period").val();
            if(periodtime === ""){
                layer.msg("请输入设置时间");
                return
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"concentrator_id":concentrator_id,"periodtime":periodtime,"cmd":"sendperiod","params":"readparam"};
            url = ROOT_PATH + "/amrssocket?action=sendperiod";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
        },
        // 发送 ip and port
        sendip:function(){
            concentrator_id = $("#concentrator_id").val();
            if( concentrator_id === undefined){
                layer.msg("集中器不存在");
                return;
            }
            var ipaddress = $("#ipaddress").val();
            if(ipaddress === ""){
                layer.msg("请输入ip");
                return
            }
            var portno = $("#portno").val();
            if(portno === ""){
                layer.msg("请输入端口号");
                return
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"concentrator_id":concentrator_id,"ipaddress":ipaddress,"portno":portno,"cmd":"sendip","params":"readparam"};
            url = ROOT_PATH + "/amrssocket?action=sendip";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
        },
        // 读取 ip and port
        readip:function(){
            concentrator_id = $("#concentrator_id").val();
            
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"concentrator_id":concentrator_id,"cmd":"readip","params":"readparam"};
            url = ROOT_PATH + "/amrssocket?action=readip";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
        },
        // 抄表
        readvalue:function(){
            concentrator_id = $("#concentrator_id").val();
            
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"concentrator_id":concentrator_id,"cmd":"readvalue","params":"readparam"};
            url = ROOT_PATH + "/amrssocket?action=readvalue";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
        },
        // 关阀
        closevalve:function(){
            concentrator_id = $("#concentrator_id").val();
            
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"concentrator_id":concentrator_id,"cmd":"closevalve","params":"readparam"};
            url = ROOT_PATH + "/amrssocket?action=closevalve";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
        },
        // 开阀
        openvalve:function(){
            concentrator_id = $("#concentrator_id").val();
            
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"concentrator_id":concentrator_id,"cmd":"openvalve","params":"readparam"};
            url = ROOT_PATH + "/amrssocket?action=openvalve";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
        },
        // 下载表计信息到集中器
        downto:function(){
            concentrator_id = $("#concentrator_id").val();
            
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"concentrator_id":concentrator_id,"cmd":"downto","params":"readparam"};
            url = ROOT_PATH + "/amrssocket?action=downto";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
        },
        // 读取集中器内表计信息
        readfrom:function(){
            concentrator_id = $("#concentrator_id").val();
            
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"concentrator_id":concentrator_id,"cmd":"closreadfromevalve","params":"readparam"};
            url = ROOT_PATH + "/amrssocket?action=readfrom";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
        },
        // 启动抄表
        readstart:function(){
            concentrator_id = $("#concentrator_id").val();
            
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var data = {"concentrator_id":concentrator_id,"cmd":"readstart","params":"readparam"};
            url = ROOT_PATH + "/amrssocket?action=readstart";
            json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
        },

        saveCommandback:function(){

        }
        
        
        
        
    }
    $(function () {
        $('input').inputClear();
        //初始化
        configCentrator.init();
        
        configCentrator.getwatermeterlist();
        $("#readtime").bind("click",configCentrator.readtime);
        $("#sendtime").bind("click",configCentrator.sendtime);
        $("#sendperiod").bind("click",configCentrator.sendperiod);
        $("#readip").bind("click",configCentrator.readip);
        $("#sendip").bind("click",configCentrator.sendip);
        $("#readvalue").bind("click",configCentrator.readvalue);
        $("#openvalve").bind("click",configCentrator.openvalve);
        $("#downto").bind("click",configCentrator.downto);
        $("#readfrom").bind("click",configCentrator.readfrom);
        $("#readstart").bind("click",configCentrator.readstart);
        $("#closevalve").bind("click",configCentrator.closevalve);
        concentrator_commaddr = $("#concentrator_commaddr").val();
        console.log('concentrator_commaddr=',concentrator_commaddr)
    })
})(window, $)
