(function (window, $) {
    // var table = $("#dataTable tr th:gt(1)");
    var subChk = $("input[name='subChk']");
    var myTable;
    var concentrator_id;
    var concentrator_commaddr;
    var ROOT_PATH = "http://120.78.255.129:8080/amrs";

    var discrete_start;
    var discrete_time;
    var report_period;
    var sample_period;
    
    var valve_wash;
    var valve_control;
    
    var calibration;

    var valid_flag = 0;

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
            // console.log(now,data)
            if(data.success==true){
                // 集中器参数信息
                if(data.concentrator_info != null && data.concentrator_info.length != 0)
                {
                    var cinfo = data.concentrator_info;
                    console.log(data.concentrator_info)
                    
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
                                // "valvestate":valvestate,
                                "deviceid":meters[i].deviceid,
                                "status":meters[i].status,
                                "operator":meters[i].operator
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
                        "data": "status",
                        "render": function (data, type, row, meta) {
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                        }
                    },
                    { "data": "deviceid",
                        "className":"hidevalue",
                        "render": function (data, type, row, meta) {
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                            // return row[3];
                        }
                    },
                    { "data": "operator",
                        "className":"hidevalue",
                        "render": function (data, type, row, meta) {
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                            // return row[3];
                        }
                    },
                    { "data": "wateraddr",
                        "className":"hidevalue",
                        "render": function (data, type, row, meta) {
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                            // return row[3];
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
        checkGroup:function(b){
            console.log(b)
            var x = document.getElementsByClassName('groupchecks');
            var i;
            

            for (i = 0; i < x.length; i++) {
                    console.log(x[i],x[i].value,b)
                if(x[i].value != b){
                    x[i].checked = false;
                } 
                else{
                    x[i].checked = true;

                }
            }
        },
        
        // 下载表计信息到集中器
        sendBtn:function(){
			var serialnumber="";
			concentrator_id = $("#concentrator_id").val();
            concentrator_commaddr= $("#concentrator_commaddr").val();
            
            if( concentrator_commaddr == undefined){
                layer.msg("集中器不存在");
                return;
            }
            
            var sendparams;
            var group1 = $("#group1").filter(":checked").length;
            var group2 = $("#group2").filter(":checked").length;
            var group3 = $("#group3").filter(":checked").length;
            if(!group1 && !group2 && !group3){
                layer.msg("未勾选指令")
                return
            }
            
			var deviceid="";
            var table = $("#concentrator_watermeter").dataTable();
            $.each(table.fnGetNodes(), function (index, value) {
                //console.log(index,value);
                var obj = {};
                var checked_flag = $(value).find('input[type="checkbox"]:checked').length;
                if(checked_flag != 0 ){
					serialnumber = $(value).find('td:eq(3)').html();
                    deviceid = $(value).find('td:eq(5)').html();
                    operator = $(value).find('td:eq(6)').html();
                    if(operator == '中国电信'){
                        console.log(operator)
                    } else if(operator == '中国移动'){
                        console.log(operator)
                    }else if(operator == '中国联通'){
                        console.log(operator)
                    }
                    console.log("deviceid=" + deviceid);
					if(deviceid == "")
					{
						return;
					}
					
					// group1
					if(group1){
						discrete_start = $("#discrete_start").val();
						discrete_time = $("#discrete_time").val();
						report_period = $("#report_period").val();
						sample_period = $("#sample_period").val();
						sendparams = "sendperiod"+'@'+deviceid+'@'+discrete_start+'@'+discrete_time+'@'+report_period+'@'+sample_period;
						console.log(discrete_start,discrete_time,report_period,sample_period)
					}
					
					// group2
					if(group2){
						valve_wash = $("#valve-wash").val();
						valve_control = $("#valve-control").val();
						if(valve_control == 0) //开阀
							sendparams = "openvalve"+'@'+deviceid+'@'+valve_wash;
						else
							sendparams = "closevalve"+'@'+deviceid+'@'+valve_wash;
						console.log(valve_wash,valve_control)
					}   
					
					// group3
					if(group3){
                        calibration = $("#calibration").val();
                        if(!isNaN(calibration)){
                            calibration = Number.parseFloat(calibration) * 1000;
                        }

						sendparams = "calibration"+'@'+deviceid+'@'+calibration;
						console.log("calibration:"+calibration)
					}
					
					// var ROOT_PATH = "http://localhost:8080/amrs";
					var data = {"commaddr":serialnumber,"cmd":"modifyIpAndPort","params":sendparams};
					url = ROOT_PATH + "/amrssocket?action=updateConcentratorInfo";
					console.log(data)
					json_ajax("POST",url,"jsonp",true,data, configCentrator.saveCommandback);
                }
            });
			
           
            
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
        $("#discrete_start").on('change',function(){
            var value = $("#discrete_start").val();
            console.log(value)
            if(value < 0 || value > 23){
                $("#discrete_start-error").show();
            }else{
                $("#discrete_start-error").hide();

            }
        })
        $("#discrete_time").on('change',function(){
            var value = $("#discrete_time").val();
            console.log(value)
            if(value < 0 || value > 255){
                $("#discrete_time-error").show();
            }else{
                $("#discrete_time-error").hide();

            }
        })
        $("#report_period").on('change',function(){
            var value = $("#report_period").val();
            console.log(value)
            if(value < 1 || value > 25){
                $("#report_period-error").show();
            }else{
                $("#report_period-error").hide();

            }
        })
        $("#sample_period").on('change',function(){
            var value = $("#sample_period").val();
            console.log(value)
            if(value < 0 || value > 255){
                $("#sample_period-error").show();
            }else{
                $("#sample_period-error").hide();

            }
        })
        
        $("#sendBtn").bind("click",configCentrator.sendBtn);
        
		
    })
})(window, $)
