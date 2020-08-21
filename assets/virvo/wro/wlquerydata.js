(function(window,$){
    var selectTreeId = '';
    var selectTreepId="";
    var selectTreeType = '';

    var selectCommunity = "";
    var selectBuilding = "";
    var communityid = "";
    var startTime,endTime;
    var srTime = "";
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
                    type : "GET",
                    enable : true,
                    autoParam : [ "id" ],
                    dataType : "json",
                    data:{'csrfmiddlewaretoken': '{{ csrf_token }}'},
                    otherParam : {  // 是否可选 Organization
                        "isOrg" : "1",
                        "isCommunity" : "1",
                        "isBuilding":"1",
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
                    onAsyncSuccess: communityTree.AsyncSuccess,
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
        AsyncSuccess:function(treeId) {
            close_ztree("commubitytreeDemo");
            
        },
        //点击节点
        zTreeOnClick: function(event, treeId, treeNode){
            selectTreeId = treeNode.id;
            selectDistrictId = treeNode.districtid;
            selectTreeIdAdd=treeNode.uuid;
            
            $('#simpleQueryParam').val("");
            selectBuilding = "";
            selectCommunity = "";
            // dmaManage.getBaseinfo();
            if(treeNode.otype == "community"){
                var pNode = treeNode.getParentNode();
                selectCommunity = treeNode.name;
                selectTreeType = "community";
                selectBuilding = "";
                console.log(selectCommunity,'-',selectBuilding)

            }else if(treeNode.otype == "building"){
                var pNode = treeNode.getParentNode();
                selectBuilding = treeNode.name;
                selectTreeType = "building";
                selectCommunity = pNode.name;
                console.log(selectCommunity,'-',selectBuilding)
            }else{
                selectTreeType = "group";
                // selectTreeId = treeNode.name;
                console.log(treeNode.name,selectTreeId,'-',selectTreeType)
            }
            myTable.requestData();
            // wlqData.readpercent();
            
        },
    },
    wlqData = {
        init: function(){
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
                "targets" : [0,2,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41]
            }];
            var columns = [
                    {
                        //第一列，用来显示序号
                        "data" : null,
                        "class" : "text-center"
                    },
                    {
                        "data" : "numbersth",//户号
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // result = '<button  href="'
                            //         + '#'
                            //         + '" data-target="#commonSmWin" class="btn-default " type="button" data-toggle="modal"><i class="fa fa-ban"></i>'+data+'</button>&nbsp;'

                            // return result;
                            // console.log(row.numbersth)
                            // result = '<a href="javascript:void(0)" id="addBtn_' +row.numbersth+'" class="aaf">'+data+'</a>';
                            // var btn = $("#addBtn_" + row.numbersth);

                            // if(btn)
                            //     btn.click(function(){ alert("link to"); return false; });
                            ret_html='<a href="/wirelessm/wlquerydata/showinfo/'+row.details.id+'/"  data-target="#commonSIWin" data-toggle="modal"  >'+row.details.numbersth+'</a>&nbsp;';
                            return ret_html;

                        }
                        
                    },
                    {
                        "data" : "community",
                        "class" : "text-center", 
                        // render : function(data, type, row, meta) {
                        //     return row.details.community
                        // }
                    }, {
                        "data" : "buildingname",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // console.log(row)
                            return row.details.buildingname
                        }
                    },{
                        "data" : "roomname",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // console.log(row.details.roomname,typeof row.details.roomname)
                            return row.details.roomname
                        }
                    },
                    // {
                    //     "data" : "nodeaddr",
                    //     "class" : "text-center",
                    //     render : function(data, type, row, meta) {
                    //         return row.details.nodeaddr
                    //     }
                    // },
                    {
                        "data" : "serialnumber",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            return row.details.serialnumber
                        }
                    }, {
                        "data" : "rvalue",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            return row.details.rvalue
                        }
                    }, 
                    {
                        "data" : "rtime",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            return row.details.rtime
                        }
                    },
                    {
                        "data" : "dur_use",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            return row.dur_use
                        }
                    },
                    {
                        "data" : "commstate",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            return row.details.commstate
                        }
                    }, {
                        "data" : "valvestate",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            return row.details.valvestate
                        }
                    },{
                        "data" : "signlen",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            return row.details.signlen
                        }
                    }, {
                        "data" : "temperature",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            return row.details.temperature
                        }
                    },{
                        "data" : "meterv",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            return row.details.meterv
                        }
                    },{
                        "data" : "alarm",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if(row.details.alarm != '')
                            {
                                return ret_html='<a href="/wirelessm/wlquerydata/showalarm/'+row.details.id+'/"  data-target="#commonWin" data-toggle="modal"  >'+row.details.alarm+'</a>&nbsp;';
                            }
                            
                            return '无';
                        }
                    },{
                        "data" : "d01",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d01;
                        }
                    }, {
                        "data" : "d02",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d02;
                        }
                    },{
                        "data" : "d03",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d03;
                        }
                    }, {
                        "data" : "d04",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d04;
                        }
                    },{
                        "data" : "d05",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d05;
                        }
                    }, {
                        "data" : "d06",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d06;
                        }
                    },{
                        "data" : "d07",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d07;
                        }
                    }, {
                        "data" : "d08",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d08;
                        }
                    }, {
                        "data" : "d09",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d09;
                        }
                    }, {
                        "data" : "d10",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d10;
                        }
                    },{
                        "data" : "d11",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d11;
                        }
                    }, {
                        "data" : "d12",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d12;
                        }
                    },{
                        "data" : "d13",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d13;
                        }
                    }, {
                        "data" : "d14",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d14;
                        }
                    },{
                        "data" : "d15",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d15;
                        }
                    }, {
                        "data" : "d16",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d16;
                        }
                    },{
                        "data" : "d17",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d17;
                        }
                    }, {
                        "data" : "d18",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d18;
                        }
                    }, {
                        "data" : "d19",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d19;
                        }
                    }, {
                        "data" : "d20",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d20;
                        }
                    },{
                        "data" : "d21",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d21;
                        }
                    }, {
                        "data" : "d22",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d22;
                        }
                    },{
                        "data" : "d23",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d23;
                        }
                    }, {
                        "data" : "d24",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d24;
                        }
                    },{
                        "data" : "d25",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d25;
                        }
                    }, {
                        "data" : "d26",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d26;
                        }
                    },{
                        "data" : "d27",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d27;
                        }
                    }, {
                        "data" : "d28",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d28;
                        }
                    }, {
                        "data" : "d29",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d29;
                        }
                    }, {
                        "data" : "d30",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d30;
                        }
                    }, {
                        "data" : "d31",
                        "class" : "text-center",
                        "hidden":true,
                        render : function(data, type, row, meta) {
                            // var day_use = row.details.day_use.d01;
                            return row.details.day_use.d31;
                        }
                    }];
            //ajax参数
            var ajaxDataParamFun = function(d) {
                d.simpleQueryParam = $('#simpleQueryParam').val(); //模糊查询
                d.groupName = selectTreeId;
                d.groupType = selectTreeType;
                d.selectBuilding = selectBuilding;
                d.selectCommunity = selectCommunity;
                d.selectTreeType = selectTreeType;

                // querybyselect
                d.dnselect = $('#dnselect').val(); 
                d.manuselect = $("#manuselect").val();
                d.rmodeselect = $("#rmodeselect").val();
                // d.zeroselect = $("#zeroselect").val();
                d.sTime = startTime
                d.eTime = endTime
                console.log(startTime,endTime)

            };
            //表格setting
            var setting = {
                suffix  : '/',
                listUrl : '/api/wirelessm/watermeter/comunitiquery/',
                // editUrl : '/wirelessm/watermeter/edit/',
                // deleteUrl : '/wirelessm/watermeter/delete/',
                // deletemoreUrl : '/wirelessm/watermeter/deletemore/',
                // enableUrl : '/wirelessm/watermeter/enable_',
                // disableUrl : '/wirelessm/watermeter/disable_',
                columnDefs : columnDefs, //表格列定义
                columns : columns, //表格列
                dataTableDiv : 'dataTable', //表格
                ajaxDataParamFun : ajaxDataParamFun, //ajax参数
                pageable : true, //是否分页
                showIndexColumn : true, //是否显示第一列的索引列
                enabledChange : true,
                ordering:true,
                // order: [[ 3, "asc" ]]
            };
            //创建表格
            myTable = new TG_Tabel.createNew(setting);
            //表格初始化
            myTable.init();
            console.log('fixed columns')
            new $.fn.dataTable.FixedColumns(myTable,{
                leftColumns:2,  //开启左侧两列固定
                
            });
            

            //隐藏大于当日日期的日期
            var dt = $('#dataTable').dataTable().api();
            var now = new Date();
            var tday = now.getDate();
            for(var i = 0; i < table.length; i++){

                    
                if(parseInt(i-12) > parseInt(tday)){
                    //menu_text data-column is i+2
                    dt.column(parseInt(i+2)).visible(false);
                }
            }
            
        },
         //加载完成后执行
        refreshTable: function(){
            $("#simpleQueryParam").val("");
            console.log('refreshtable')
            selectTreeId = '';
//            selectTreeType = '';
//            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
//            zTree.selectNode("");
//            zTree.cancelSelectedNode();
            myTable.requestData();
            
        },
        
        requeryComunityData:function(flag){
            url = '/wirelessm/neiborhooddailydata/';
            data = {"communityid":communityid,"flag":flag};
            json_ajax("GET",url,"json",true,data,wlqData.requestDataCallback);

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
                tMonth = wlqData.doHandleMonth(tMonth + 1);
                tDate = wlqData.doHandleMonth(tDate);
                var num = -(day + 1);
                startTime = tYear + "-" + tMonth + "-" + tDate + " "
                    + "00:00:00";
                var end_milliseconds = today.getTime() + 1000 * 60 * 60 * 24
                    * parseInt(num);
                today.setTime(end_milliseconds); //注意，这行是关键代码
                var endYear = today.getFullYear();
                var endMonth = today.getMonth();
                var endDate = today.getDate();
                endMonth = wlqData.doHandleMonth(endMonth + 1);
                endDate = wlqData.doHandleMonth(endDate);
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
                vMonth = wlqData.doHandleMonth(vMonth + 1);
                vDate = wlqData.doHandleMonth(vDate);
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
                    vendMonth = wlqData.doHandleMonth(vendMonth + 1);
                    vendDate = wlqData.doHandleMonth(vendDate);
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
            wlqData.getsTheCurrentTime();
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
            
            startTime=sTime;
            endTime=eTime;
        },
        readpercent:function(){

            url = '/api/wirelessm/watermeter/readpercent/';
            rdata = {
                "groupName":selectTreeId,
                "groupType" : selectTreeType,
                "selectBuilding" : selectBuilding,
                "selectCommunity" : selectCommunity,
                "selectTreeType" : selectTreeType,
                "rdate":srTime,
                "manuselect":$("#manuselect").val(),
                "rmodeselect":$("#rmodeselect").val(),
                // "zeroselect":$("#zeroselect").val(),
                "dnselect":$("#dnselect").val()
            };
            json_ajax("GET",url,"json",true,rdata,function(data){
                console.log(data)
                $("#totalmeter").text(data.totalmeter)
                // $("#readpercent").text(data.readpercent)
            });
        },
        queryselect:function(){

            
            wlqData.refreshTable();
            wlqData.readpercent();
            json_ajax("GET",url,"json",true,rdata,function(data){
                console.log(data)
                $("#totalmeter").text(data.totalmeter)
                $("#readpercent").text(data.readpercent)
            });
        },
        exportbyselect:function(){
            alert("???exportbyselect?")
            url = '/wirelessm/watermeter/exportbyselect/';
            rdata = {
                "groupName":selectTreeId,
                "groupType" : selectTreeType,
                "selectBuilding" : selectBuilding,
                "selectCommunity" : selectCommunity,
                "selectTreeType" : selectTreeType,
                "rdate":srTime,
                "manuselect":$("#manuselect").val(),
                "rmodeselect":$("#rmodeselect").val(),
                // "zeroselect":$("#zeroselect").val(),
                "dnselect":$("#dnselect").val()
            };
            json_ajax("GET",url,"json",true,rdata,function(data){
                // console.log(data)
                // layer.msg("导出成功");
            });
        },

    }

    $(function(){
        $('input').inputClear();
        communityTree.init();

        
        $('#timeInterval').dateRangePicker({dateLimit:30});
        wlqData.getsTheCurrentTime();  
        wlqData.estimate();
        wlqData.startDay(-7);  
        $('#timeInterval').val(startTime + '--' + endTime);
        
        wlqData.init();

        wlqData.readpercent(srTime);

        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('commubitytreeDemo', id,'community');
            };
        });

        
        //IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            var search;
            $("#search_condition").bind("focus",function(){
                search = setInterval(function(){
                    search_ztree('commubitytreeDemo', 'search_condition','community');
                },500);
            }).bind("blur",function(){
                clearInterval(search);
            });
        }
        //全选
        $("#checkAll").bind("click",wlqData.cleckAll);
        //单选
        subChk.bind("click",wlqData.subChkClick);
        //批量删除
        $("#del_model").bind("click",wlqData.delModel);
        //加载完成后执行
        $("#refreshTable").on("click",wlqData.refreshTable);
        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('commubitytreeDemo', 'search_condition', 'community');
        });

        $("#querybyselect").on("click",wlqData.queryselect);
        // $("#exportbyselect").on("click",wlqData.exportbyselect);

         
        $('.dumb').click(function() {
            manuselect = $("#manuselect").val(),
            rmodeselect = $("#rmodeselect").val(),
            // zeroselect = $("#zeroselect").val(),
            dnselect = $("#dnselect").val()
            console.log(selectTreeId)
            // url = this.href + "?groupName="+selectTreeId+"&groupType="+selectTreeType+"&selectBuilding="+selectBuilding
            // +"&selectCommunity="+selectCommunity+"&selectTreeType="+selectTreeType+"&manuselect="+manuselect+
            // "&rmodeselect="+rmodeselect+"&dnselect="+dnselect;
            console.log(this.href)
            // this.href="/wirelessm/watermeter/exportbyselect/";
            $(this).attr("href", "/wirelessm/watermeter/exportbyselect/?groupName="+selectTreeId+"&groupType="+selectTreeType+"&selectBuilding="+selectBuilding
            +"&selectCommunity="+selectCommunity+"&selectTreeType="+selectTreeType+"&manuselect="+manuselect+
            "&rmodeselect="+rmodeselect+"&dnselect="+dnselect
            );

            // $(this).attr("href", this.href + "?communityid="+selectTreeId+"&dnselect=25");
                
        });
        // $("#addId").bind("click",function(){
        //     $("#addDistrictForm").modal("show")
        // })
    })
})(window,$)