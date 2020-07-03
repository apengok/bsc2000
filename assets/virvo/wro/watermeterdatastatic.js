(function (window, $) {
    var selectTreeId = '';
    var selectTreepId="";
    var selectTreeType = '';

    var selectCommunity = "";
    var selectBuilding = "";
    var communityid = "";
    
    var params = [];
    //显示隐藏列
    var menu_text = "";
    var subChk = $("input[name='subChk']");
    var simsenflag=true;
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
                    // beforeCollapse: communityTree.zTreeBeforeCollapse,
                    onAsyncSuccess: communityTree.AsyncSuccess,
                    onClick : communityTree.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#commubitytreeDemo"), treeSetting, null);
            var treeObj = $.fn.zTree.getZTreeObj('commubitytreeDemo');
            // treeObj.expandAll(false);
            
        },
        zTreeBeforeCollapse:function(treeId, treeNodes){
            return false;
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
                    if(responseData[i].otype == "community"){
                        responseData[i].open = false;
                    }else{
                        responseData[i].open = true;
                    }
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
            console.log('level:',treeNode.level)
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
            
        },
    },
    wdatastatic = {
        init: function () {
            // webSocket.init('/clbs/vehicle');
            // 请求后台，获取所有订阅的车
            // setTimeout(function () {
            //     webSocket.subscribe(headers,'/topic/fencestatus', wdatastatic.updataSimData,null, null);
            // },500);
            //列筛选
            var table = $("#dataTable tr th:gt(1)");
            menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(2) + "\" disabled />" + table[0].innerHTML + "</label></li>"
            for (var i = 1; i < table.length; i++) {
                menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(i + 2) + "\" />" + table[i].innerHTML + "</label></li>"
            }
            ;
            $("#Ul-menu-text").html(menu_text);
            //表格列定义
            var columnDefs = [{
                //第一列，用来显示序号
                "searchable": false,
                "orderable": false,
                // "targets": 0
            }];
            var columns = [
                // {
                //     //第一列，用来显示序号
                //     "data": null,
                //     "class": "text-center"
                // },
                // {
                //     "data": null,
                //     "class": "text-center",
                //     render: function (data, type, row, meta) {
                //         console.log(row.meter)
                //         if (row.meter == "") {
                //             var result = '';
                //             result += '<input  type="checkbox" name="subChk"  value="' + row.id + '" />';
                //             return result;
                //         }else{
                //             var result = '';
                //             result += '<input  type="checkbox" name="subChk" disabled/>';
                //             return result;
                //         }
                //     }
                // },
                // {
                //     "data": null,
                //     "class": "text-center", //最后一列，操作按钮
                //     render: function (data, type, row, meta) {
                //         var editUrlPath = myTable.editUrl + row.id + "/"; //修改地址
                //         var result = '';
                //         console.log(row.meter)
                //         //修改按钮
                //         result += '<button href="' + editUrlPath + '" data-target="#commonWin" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp;';
                //         // if (!row.brand) {
                //         //     result += '<button disabled class="editBtn btn-default deleteButton" type="button"><i class=" fa fa-ban"></i>下发参数</button>&nbsp;'
                //         // }else {
                //         //     result += '<button onclick="wdatastatic.sendSimParam(\''+row.id+'\',\''+row.vehicleId+'\',\''+row.configId+'\',\''+row.paramId+'\')" class="editBtn editBtn-info" type="button"><i class="glyphicon glyphicon-circle-arrow-down"></i>下发参数</button>&nbsp;'
                //         // }
                //         //删除按钮

                //         if(row.meter != ""){
                //             // result += '<button type="button" onclick="wdatastatic.releaseRelate(\'' + row.id + '\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>解除关联</button>';
                //             result += '<button disabled type="button" onclick="myTable.deleteItem(\'' + row.id + '\')" class="deleteButton editBtn disableClick"><i class="fa fa-ban"></i>删除</button>';

                //         }else{
                //             result += '<button type="button" onclick="myTable.deleteItem(\'' + row.id + '\')" class="deleteButton editBtn "><i class="fa fa-trash-o"></i>删除</button>';
                //             // result += '<button type="button" onclick="wdatastatic.checkDeleteItem(\'' + row.simcardNumber + '\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>删除</button>';
                //         }
                //         return result;
                //     }
                // },
                {
                    "data": "belongto",
                    "class": "text-center col-belong",
                    render:function(data){
    	            	return html2Escape(data)
    	            }
                },
                {
                    "data": "todayuse",
                    "class": "text-center",
                    
                },
                {
                    "data": "yestodayuse",
                    "class": "text-center",
                    
                },{
                    "data": "totaluser",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data == null ? "" : data;
                    }
                }, {
                    "data": "zerouser",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data == null ? "" : data;
                    }
                }, {
                    "data": "yestodaypercent",
                    "class": "text-center",
                    
                },
                {
                    "data": "faultuser",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data == null ? "" : data;
                    }
                },
                {
                    "data": "overflowuser",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data == null ? "" : data;
                    }
                },
                {
                    "data": "nouse3m",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data == null ? "" : data;
                    }
                }, {
                    "data":"gongdan",
                    "class": "text-center",
                    render:function(data){
    	            	return html2Escape(data)
    	            }
                }];
            //ajax参数
            var ajaxDataParamFun = function (d) {
                d.simpleQueryParam = $('#simpleQueryParam').val(); //模糊查询
                d.groupName = selectTreeId;
                d.groupType = selectTreeType;
                d.selectBuilding = selectBuilding;
                d.selectCommunity = selectCommunity;
                d.selectTreeType = selectTreeType;
                d.stime = startTime
                d.etime = endTime
            };
            //表格setting
            var setting = {
                suffix  : '/',
                listUrl: '/api/wirelessm/funcdatastastics/',
                
                columnDefs: columnDefs, //表格列定义
                columns: columns, //表格列
                dataTableDiv: 'dataTable', //表格
                ajaxDataParamFun: ajaxDataParamFun, //ajax参数
                pageable: true, //是否分页
                showIndexColumn: false, //是否显示第一列的索引列sda
                enabledChange: true
            };
            //创建表格
            myTable = new TG_Tabel.createNew(setting);
            //表格初始化
            myTable.init();
        },
        releaseRelate:function(sid){
            //如果必要的话判断sim卡是否关联再决定是否删除
            var url="/devm/simcard/releaseRelate/";
            json_ajax("POST",url,"json",false,{"sid":sid},function(data){
                if (data != null) {
                    var result = $.parseJSON(data);
                    if (result != null) {
                        layer.msg("已解除关联的表具")
                        myTable.refresh();
                    }
                }
            })
        },
        checkDeleteItem:function(sid){
            //如果必要的话判断sim卡是否关联再决定是否删除
            var url="/devm/simcard/getSimRelated/";
            json_ajax("POST",url,"json",false,{"sid":sid},wdatastatic.sendCallBack)
        },
        //全选
        checkAll: function () {
            $("input[name='subChk']").prop("checked", this.checked);
        },
        //单选
        subChkClick: function () {
            $("#checkAll").prop("checked", subChk.length == subChk.filter(":checked").length ? true : false);
        },
        sendSimParam:function (id,vid,cid,paramId) {
            var url="/devm/simcard/sendSimP";
            json_ajax("POST",url,"json",false,{"sid":id,"vid":vid,"cid":cid,"type":2},wdatastatic.sendCallBack)
            layer.msg(sendCommandComplete);
        },
        sendCallBack:function (data) {
            if(simsenflag){
                webSocket.subscribe(headers,'/topic/fencestatus', wdatastatic.updataSimData,null, null);
                simsenflag=false;
            }
            layer.closeAll()
            myTable.refresh();
        },
        updataSimData: function(msg){
            if (msg != null) {
                var result = $.parseJSON(msg.body);
                if (result != null) {
                    myTable.refresh();
                }
            }
        },
        //批量删除
        delModelClick: function () {
            //判断是否至少选择一项
            var chechedNum = $("input[name='subChk']:checked").length;
            if (chechedNum == 0) {
                layer.msg(selectItem, {move: false});
                return
            }
            var checkedList = new Array();
            $("input[name='subChk']:checked").each(function () {
                checkedList.push($(this).val());
            });
            myTable.deleteItems({
                'deltems': checkedList.toString()
            });
        },
        //刷新
        refreshTable: function () {
            $("#simpleQueryParam").val("");
            myTable.requestData();
        },
        getwholedata:function(){
            url = '/api/wirelessm/wholedatastastics';
            data = {};
            json_ajax("GET",url,"json",true,data,wdatastatic.getwholedataCallback);
        },
        getwholedataCallback:function(data){
            // console.log(data.wateruse.todayuse)
            // 用水情况
            var wateruse = data.wateruse;
            $("#todayuse").text(wateruse.yestoday)
            $("#thismonth").text(wateruse.thismonth)
            $("#lastmonth").text(wateruse.lastmonth)
            $("#thisyear").text(wateruse.thisyear)

            // 抄见数据
            var rchao = data.rchao;
            $("#communitynum").text(rchao.communitynum)
            $("#usernum").text(rchao.usernum)
            $("#yestodaypercent").text(rchao.yestodaypercent)
            $("#monthpercent").text(rchao.monthpercent)

            // 异常用水
            var faultuse = data.faultuse;
            $("#nouse1d").text(faultuse.nouse1d)
            $("#nouse1m").text(faultuse.nouse1m)
            $("#nouse3m").text(faultuse.nouse3m)
            $("#overflowuse").text(faultuse.overflowuse)

            
            // 厂家统计
            $.each(data.manufactory,function(i,d){
                // console.log(i,d)
                $("#manutable").find('tbody').append("<tr><td>"+d[0]+"</td><td>"+d[1]+"</td></tr>");
            })

            //  使用年限饼状图
            var useyears = data.useyears;
            var useyears_total = 0;
            $.each(useyears,function(n,d){
                
                useyears_total += d.value;
            })
            console.log(useyears_total);
            option = {
                title : {
                    text: '使用年限饼状图',
                    x:'left'
                },
                // tooltip : {
                //     trigger: 'item',
                //     formatter: "{a} <br/>{b} : {c} ({d}%)"
                // },
                legend: {
                    orient: 'vertical',
                    top:30,
                    left: 'left',
                    // data: ['LORA智能','NB物联','有线远传','其它'],
                    formatter: function (name) {
                        usedata = useyears.filter(function(key){
                            return key.name == name
                        })
                        if(useyears_total != 0 ){
                            percent = usedata[0].value/useyears_total * 100
                            percent = Number((percent).toFixed(0));
                        }
                        else{
                            percent = 0;
                        }
                        
                        return  name + '  ' + percent +'%';
                    },
                },
                series : [
                    {
                        name: '表类型',
                        type: 'pie',
                        radius : '55%',
                        center: ['75%', '60%'],
                        label:{
                            show:false
                        },
                        // data:[
                        //     {value:335, name:'LORA智能'},
                        //     {value:310, name:'NB物联'},
                        //     {value:234, name:'有线远传'},
                        //     {value:135, name:'其它'},
                        // ],
                        data:useyears,
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };


            pressure_gauge = echarts.init(document.getElementById('useyears'));
            pressure_gauge.setOption(option);

            // 用水性质分布图
            
            var useproperty = data.useproperty;
            useyears_total = 0;
            $.each(useproperty,function(n,d){
                
                useyears_total += d.value;
            })
            option = {
                title : {
                    text: '用水性质分布图',
                    x:'left'
                },
                // tooltip : {
                //     trigger: 'item',
                //     formatter: "{a} <br/>{b} : {c} ({d}%)"
                // },
                legend: {
                    orient: 'vertical',
                    top:30,
                    left: 'left',
                    // data: ['LORA智能','NB物联','有线远传','其它'],
                    formatter: function (name) {
                        usedata = useproperty.filter(function(key){
                            return key.name == name
                        })
                        if(useyears_total != 0 ){
                            percent = usedata[0].value/useyears_total * 100
                            percent = Number((percent).toFixed(0));
                        }
                        else{
                            percent = 0;
                        }
                        
                        return  name + '  ' + percent +'%';
                    },
                },
                series : [
                    {
                        name: '表类型',
                        type: 'pie',
                        radius : '55%',
                        center: ['75%', '60%'],
                        label:{
                            show:false
                        },
                        
                        data:useproperty,
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };

            pressure_gauge = echarts.init(document.getElementById('useproperty'));
            pressure_gauge.setOption(option);


            // 
            // 表具类型分布图
            var metertypes = data.metertypes;
            useyears_total = 0;
            $.each(metertypes,function(n,d){
                
                useyears_total += d.value;
            })
            option = {
                title : {
                    text: '表具类型分布图',
                    x:'left'
                },
                // tooltip : {
                //     trigger: 'item',
                //     formatter: "{a} <br/>{b} : {c} ({d}%)"
                // },
                legend: {
                    orient: 'vertical',
                    top:30,
                    left: 'left',
                    // data: ['LORA智能','NB物联','有线远传','其它'],
                    formatter: function (name) {
                        usedata = metertypes.filter(function(key){
                            return key.name == name
                        })
                        if(useyears_total != 0 ){
                            percent = usedata[0].value/useyears_total * 100
                            percent = Number((percent).toFixed(0));
                        }
                        else{
                            percent = 0;
                        }
                        
                        return  name + '  ' + percent +'%';
                    },
                },
                series : [
                    {
                        name: '表类型',
                        type: 'pie',
                        radius : '55%',
                        center: ['75%', '60%'],
                        label:{
                            show:false
                        },
                        
                        data:metertypes,
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };

            pressure_gauge = echarts.init(document.getElementById('metertypes'));
            pressure_gauge.setOption(option);
            

            // 水表口径分布图
            var meterdns = data.meterdns;
            useyears_total = 0;
            $.each(meterdns,function(n,d){
                
                useyears_total += d.value;
            })
            option = {
                title : {
                    text: '水表口径分布图',
                    x:'left'
                },
                // tooltip : {
                //     trigger: 'item',
                //     formatter: "{a} <br/>{b} : {c} ({d}%)"
                // },
                legend: {
                    orient: 'vertical',
                    top:30,
                    left: 'left',
                    // data: ['LORA智能','NB物联','有线远传','其它'],
                    formatter: function (name) {
                        usedata = meterdns.filter(function(key){
                            return key.name == name
                        })
                        if(useyears_total != 0 ){
                            percent = usedata[0].value/useyears_total * 100
                            percent = Number((percent).toFixed(0));
                        }
                        else{
                            percent = 0;
                        }
                        
                        return  name + '  ' + percent +'%';
                    },
                },
                series : [
                    {
                        name: '表类型',
                        type: 'pie',
                        radius : '55%',
                        center: ['75%', '60%'],
                        label:{
                            show:false
                        },
                        
                        data:meterdns,
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };

            pressure_gauge = echarts.init(document.getElementById('meterdns'));
            pressure_gauge.setOption(option);
            

            // 阀控表分布图
            var metervalves = data.metervalves;
            useyears_total = 0;
            $.each(metervalves,function(n,d){
                
                useyears_total += d.value;
            })
            option = {
                title : {
                    text: '阀控表分布图',
                    x:'left'
                },
                // tooltip : {
                //     trigger: 'item',
                //     formatter: "{a} <br/>{b} : {c} ({d}%)"
                // },
                legend: {
                    orient: 'vertical',
                    top:30,
                    left: 'left',
                    // data: ['LORA智能','NB物联','有线远传','其它'],
                    formatter: function (name) {
                        usedata = metervalves.filter(function(key){
                            return key.name == name
                        })
                        if(useyears_total != 0 ){
                            percent = usedata[0].value/useyears_total * 100
                            percent = Number((percent).toFixed(0));
                        }
                        else{
                            percent = 0;
                        }
                        
                        return  name + '  ' + percent +'%';
                    },
                },
                series : [
                    {
                        name: '表类型',
                        type: 'pie',
                        radius : '55%',
                        center: ['75%', '60%'],
                        label:{
                            show:false
                        },
                        
                        data:metervalves,
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };

            pressure_gauge = echarts.init(document.getElementById('metervalves'));
            pressure_gauge.setOption(option);
            

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
                tMonth = wdatastatic.doHandleMonth(tMonth + 1);
                tDate = wdatastatic.doHandleMonth(tDate);
                var num = -(day + 1);
                startTime = tYear + "-" + tMonth + "-" + tDate + " "
                    + "00:00:00";
                var end_milliseconds = today.getTime() + 1000 * 60 * 60 * 24
                    * parseInt(num);
                today.setTime(end_milliseconds); //注意，这行是关键代码
                var endYear = today.getFullYear();
                var endMonth = today.getMonth();
                var endDate = today.getDate();
                endMonth = wdatastatic.doHandleMonth(endMonth + 1);
                endDate = wdatastatic.doHandleMonth(endDate);
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
                vMonth = wdatastatic.doHandleMonth(vMonth + 1);
                vDate = wdatastatic.doHandleMonth(vDate);
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
                    vendMonth = wdatastatic.doHandleMonth(vendMonth + 1);
                    vendDate = wdatastatic.doHandleMonth(vendDate);
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
            console.log(startTime,endTime)
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
            wdatastatic.getsTheCurrentTime();
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
        queryClick:function(days){
            if(days != 0)
            {
                
                wdatastatic.getsTheCurrentTime(); 
                $('#timeInterval').val(startTime + '--' + endTime);
                wdatastatic.startDay(days); 
                // wdatastatic.startDay(-1);  
                $('#timeInterval').val(startTime + '--' + endTime);
            }
            // wdatastatic.estimate();
            myTable.requestData();
        },
    }
    $(function () {
        $('input').inputClear();
        $('#timeInterval').dateRangePicker({dateLimit:30});
        wdatastatic.getsTheCurrentTime(); 
        wdatastatic.startDay(-7); 
        // wdatastatic.startDay(-1);  
        $('#timeInterval').val(startTime + '--' + endTime);
        //初始化
        communityTree.init();
        wdatastatic.init();
        wdatastatic.getwholedata();

        $("#search_button7").on("click",function(){
            
            wdatastatic.queryClick(-7);
        })

        $("#search_button30").on("click",function(){
            wdatastatic.queryClick(-30);
        })

        $("#search_button").on("click",function(){
            wdatastatic.queryClick(0);
        })
        
        //全选
        $("#checkAll").bind("click", wdatastatic.checkAll);
        //单选
        subChk.bind("click", wdatastatic.subChkClick);
        //批量删除
        $("#del_model").bind("click", wdatastatic.delModelClick);
        //刷新
        $("#refreshTable").on("click", wdatastatic.refreshTable);


    })
})(window, $)
