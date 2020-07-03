// (function(window,$){
    //显示隐藏列
    var menu_text = "";
    var table = $("#dataTable tr th:gt(1)");
    var subChk = $("input[name='subChk']");
    var clickTreeNodeName;
    var addEventIndex = 2,addPhoneIndex = 2,addInfoDemandIndex = 2,addBaseStationIndex = 2;
    var vehicleList = "";
    var vehicleIdList = "";
    var commandNodes = "";
    var treeClickFlag;
    var currentCommandType;
    var currentStation;
    var loadTime;
    var requestRootURL = "/clbs/m/functionconfig/fence/bindfence";
    var zTreeIdJson = {};
    var setChar;
    var realsendflag = true;

    var ROOT_PATH = "http://120.78.255.129:8080/amrs";
    
    realTimeCommand = {
        init: function(){
            //显示隐藏列
            menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(2) +"\" disabled />"+ table[0].innerHTML +"</label></li>"
            for(var i = 1; i < table.length; i++){
                menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(i+2) +"\" />"+ table[i].innerHTML +"</label></li>"
            };
            $("#Ul-menu-text").html(menu_text);
            realTimeCommand.initTreeData("1");
            //指令类型树
            var setting = {
                // check: {
                //     enable: true,
                //     chkboxType: { "Y": "ps", "N": "s" }
                // },
                view: {
                    showIcon: false,
                    //showLine: false
                },
                data: {
                    simpleData: {
                        enable: true
                    },
                },
                callback: {
                    onClick: realTimeCommand.onClickCommand,
                    onCheck: realTimeCommand.onCheckCommand
                }
            };
            // realTimeCommand.baseStationReportModeCheckFn("1");
            var zNodes = [
                { id:1, pId:0, name:"VIRVO平台",open:true},//,nocheck:true
                { id:11, pId:1, name:"通讯参数"},
                { id:12, pId:1, name:"终端参数"},
                { id:13, pId:1, name:"采集指令"},
                { id:14, pId:1, name:"基本设置"},

                
            ];
            $.fn.zTree.init($("#commandTreeDemo"), setting, zNodes);
            $("[data-toggle='tooltip']").tooltip();
            // realTimeCommand.baseStationReportModeCheckFn();
        },
        updataFenceData: function(msg){
            if (msg != null) {
                var result = $.parseJSON(msg.body);
                if (result != null) {
                    myTable.refresh();
                }
            }
        },
        //当前时间(时分秒)
        getHoursMinuteSeconds: function(){
            var nowDate = new Date();
            loadTime = 
            + (nowDate.getHours() < 10 ? "0" + nowDate.getHours() : nowDate.getHours())
            + ":" 
            + (nowDate.getMinutes() < 10 ? "0" + nowDate.getMinutes() : nowDate.getMinutes())
            + ":" 
            + (nowDate.getSeconds() < 10 ? "0" + nowDate.getSeconds() : nowDate.getSeconds());
            $("#baseStationStartTimePoint,#baseStationFixedTime").val(loadTime);
        },
        initTreeData : function(deviceType){
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
                        "isStation": "1",
                        "isProtocol": "1",
                        // "csrfmiddlewaretoken": "{{ csrf_token }}"
                    },
                    dataFilter: realTimeCommand.ajaxDataFilter
                },
                view : {
                    // addHoverDom : stationManage.addHoverDom,
                    // removeHoverDom : stationManage.removeHoverDom,
                    selectedMulti : false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree
                },
                edit : {
                    enable : true,
                    editNameSelectAll : true,
                    showRemoveBtn : false,//stationManage.showRemoveBtn,
                    showRenameBtn : false
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    // beforeDrag : realTimeCommand.beforeDrag,
                    // beforeEditName : realTimeCommand.beforeEditName,
                    // beforeRemove : realTimeCommand.beforeRemove,
                    // beforeRename : realTimeCommand.beforeRename,
                    // // onRemove : stationManage.onRemove,
                    // onRename : realTimeCommand.onRename,
                    onClick : realTimeCommand.onClickStation
                }
            };
            $.fn.zTree.init($("#treeDemo"), treeSetting, null);
            var treeObj = $.fn.zTree.getZTreeObj('treeDemo');treeObj.expandAll(true);
           
        },
        initTreeData_old:function (deviceType) {
            //组织树
            setChar = {
                async: {
                    url: "/api/entm/organization/tree/", //realTimeCommand.getTreeUrl,
                    type: "GET",
                    enable: true,
                    autoParam: ["id"],
                    dataType: "json",
//                    otherParam: {"type": "multiple", "deviceType": deviceType},
                    // otherParam: {"type": "multiple","icoType": "0","deviceType": deviceType},
                    otherParam : {  // 是否可选 Organization
                        "isOrg" : "1",
                        "isStation": "1"
                    },
                    dataFilter: realTimeCommand.ajaxDataFilter
                },
                // check: {
                //     enable: true,
                //     chkStyle: "checkbox",
                //     chkboxType: {
                //         "Y": "s",
                //         "N": "s"
                //     },
                //     radioType: "all"
                // },
                view: {
                    dblClickExpand: false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree,
                    countClass: "group-number-statistics"
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    beforeClick:realTimeCommand.beforeClick,
                    onClick: realTimeCommand.onClickStation,
                    // onAsyncSuccess: realTimeCommand.zTreeOnAsyncSuccess,
                    // beforeCheck: realTimeCommand.zTreeBeforeCheck,
                    // onCheck: realTimeCommand.onCheckVehicle,
                    // onExpand: realTimeCommand.zTreeOnExpand,
                    // onNodeCreated: realTimeCommand.zTreeOnNodeCreated,
                }
            };
//            $.ajax({
//                async: false,
//                type: "post",
//                url: requestRootURL + "/count",
//                data: {"type": "multiple", "deviceType": deviceType},
//                success: function (msg) {
//                    var count = parseInt(msg);
//                    if (count > 0 && count <= 5000) {
//                        setChar.async.url = requestRootURL + "/vehicleTreeByDeviceType";
//                    }
//                }
//            });
            $.fn.zTree.init($("#treeDemo"), setChar, null);
        },
        
        getMinotorObj: function(commandType){
              switch (commandType){
                case 11:
                    return $("#commObject").val();
                case 12:
                    return $("#terminalObject").val();
                case 13:
                    return $("#aquiryObject").val();
                case 14:
                    return $("#meterbaseObject").val();
                // case 22:
                //     return $("#baseStationObject").val();
                default: return "";
                }
        },
        //组织树预处理加载函数
        ajaxDataFilter: function(treeId, parentNode, responseData) {
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            if (responseData) {
                for (var i = 0; i < responseData.length; i++) {
                        responseData[i].open = true;
                }
            }
            return responseData;
        },
        beforeClick :function (treeId,treeNode){
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.checkNode(treeNode, !treeNode.checked, false, true);
            return true;
        },
        //组织架构树点击事件
        onClickStation: function(e,treeId,treeNode) {
            //判断点击企业 dma or station
            if (treeNode.otype == "station" ) {
                treeClickFlag = true;
                currentStation = treeNode.id;
                console.log(currentStation)
                myTable.requestData();
                if(currentCommandType === undefined){
                    currentCommandType = 11;
                }
                var url="/api/devm/paramsmanager/command/getCommandParam";
                var parameter={"sid": currentStation,"commandType":currentCommandType,"isRefer":false};
                json_ajax("POST",url,"json",true,parameter, realTimeCommand.setCommand);
				
				
				
            }
        },
        
        // 组织架构树加载成功事件
        zTreeOnAsyncSuccess: function(event, treeId, treeNode, msg){
            var treeObj = $.fn.zTree.getZTreeObj(treeId);
            var avid = $("#avid").val();
            if(avid !== undefined && avid !== ""){
                var node = treeObj.getNodesByParam("name", avid, null);
                if(node !== undefined && node.length > 0){
                    treeObj.checkNode(node[0], true, true);
                }
                vehicleList = avid;
                $("#alarmSearch").click();
            }
            
            // 更新节点数量
            treeObj.updateNodeCount(treeNode);
            // 默认展开200个节点
            var initLen = 0;
            notExpandNodeInit = treeObj.getNodesByFilter(assignmentNotExpandFilter);
            for (i = 0; i < notExpandNodeInit.length; i++) {
                treeObj.expandNode(notExpandNodeInit[i], true, true, false, true);
                initLen += notExpandNodeInit[i].children.length;
                if (initLen >= 200) {
                    break;
                }
            }
            // webSocket.subscribe(headers, '/topic/fencestatus', realTimeCommand.updataFenceData,null, null);
        },
        
        zTreeOnNodeCreated: function (event, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            var id = treeNode.id.toString();
            var list = [];
            if (zTreeIdJson[id] == undefined || zTreeIdJson[id] == null) {
                list = [treeNode.tId];
                zTreeIdJson[id] = list;
            } else {
                zTreeIdJson[id].push(treeNode.tId)
            }
        },
        //指令类型树 勾选事件
        onCheckCommand: function(){
            var zTree = $.fn.zTree.getZTreeObj("commandTreeDemo");
            var nodes = zTree.getCheckedNodes(true);
            var changedNodes = zTree.getChangeCheckedNodes();
            for (var i = 0, l = changedNodes.length; i < l; i++) {
                changedNodes[i].checkedOld = changedNodes[i].checked;
            }
        },
        //指令类型树 点击事件
        onClickCommand : function(e,treeId,treeNode) {
            $("#eventMain-container").find(">div").find("div.eventIdInfo>input").removeAttr("disabled","disabled");
            console.log("currentStation",currentStation);
            
            clickTreeNodeName = treeNode.tId;
            realTimeCommand.executeCommandShow();
            currentCommandType = treeNode.id;
            if( currentStation === undefined){
                layer.msg("请先选择站点");
                return;
            }
            if(treeClickFlag){//仅当点击站点时，才进行指令参数的查询。
                var url="/api/devm/paramsmanager/command/getCommandParam";
                var parameter={"sid": currentStation,"commandType":treeNode.id,"isRefer":false};
                json_ajax("POST",url,"json",true,parameter, realTimeCommand.setCommand);
            }
            
            
        },
        
        setCommand: function(data){
            console.log('setCommand',data);
                if(data.success == true){
                    $("#meterbaseObject,#aquiryObject,#terminalObject,#commObject,#baseStationObject").val(data.obj.station__username);
                    $("#meterbaseSerialnumber,#aquirySerialnumber,#terminalSerialnumber,#commSerialnumber").val(data.obj.serialnumber);
                    $("#sid").val(data.obj.sid);
                    $("#commaddr").val(data.obj.commaddr);
                    // 通讯参数
                    if (data.msg == null&&data.obj.commParam!= null) {
                        var commParam = data.obj.commParam;
                        $("#tcpresendcount").val(commParam.tcpresendcount);
                        $("#tcpresponovertime").val(commParam.tcpresponovertime);
                        $("#udpresendcount").val(commParam.udpresendcount);
                        $("#udpresponovertime").val(commParam.udpresponovertime);
                        $("#smsresendcount").val(commParam.smsresendcount);
                        $("#smsresponovertime").val(commParam.smsresponovertime);
                        $("#heartbeatperiod").val(commParam.heartbeatperiod);
                        
                    }else{

                    }
                    // 终端参数
                    if(data.msg == null&&data.obj.terminalParam!= null){
                        var terminalParam = data.obj.terminalParam;
                        $("#ipaddr").val(terminalParam.ipaddr);
                        $("#port").val(terminalParam.port);
                        $("#entrypoint").val(terminalParam.entrypoint);
                        
                    }
                    // 采集指令
                    if(data.msg == null&&data.obj.aquiryParam!= null){
                        var aquiryParam = data.obj.aquiryParam;
                        $("#updatastarttime").val(aquiryParam.updatastarttime);
                        $("#updatamode").val(aquiryParam.updatamode);
                        $("#collectperiod").val(aquiryParam.collectperiod);
                        $("#updataperiod").val(aquiryParam.updataperiod);
                        $("#updatatime1").val(aquiryParam.updatatime1);
                        $("#updatatime2").val(aquiryParam.updatatime2);
                        $("#updatatime3").val(aquiryParam.updatatime3);
                        $("#updatatime4").val(aquiryParam.updatatime4);
                        
                    }
                    // 基表设置
                    if(data.msg == null&&data.obj.meterbaseParam!= null){
                        var meterbaseParam = data.obj.meterbaseParam;
                        $("#dn").val(meterbaseParam.dn);
                        $("#liciperoid").val(meterbaseParam.liciperoid);
                        $("#maintaindate").val(meterbaseParam.maintaindate);
                        $("#transimeterfactor").val(meterbaseParam.transimeterfactor);
                        $("#biaofactor").val(meterbaseParam.biaofactor);
                        $("#manufacturercode").val(meterbaseParam.manufacturercode);
                        $("#issmallsignalcutpoint").val(meterbaseParam.issmallsignalcutpoint);
                        $("#smallsignalcutpoint").val(meterbaseParam.smallsignalcutpoint);

                        $("#isflowzerovalue").val(meterbaseParam.isflowzerovalue);
                        $("#flowzerovalue").val(meterbaseParam.flowzerovalue);
                        $("#pressurepermit").val(meterbaseParam.pressurepermit);
                        $("#flowdorient").val(meterbaseParam.flowdorient);
                        $("#plusaccumupreset").val(meterbaseParam.plusaccumupreset);
                    }
                    
                    
                }else{
                    layer.msg(data.msg,{move:false});
                }
            },
        getCommandCheckedNodes : function() {
            var zTree = $.fn.zTree.getZTreeObj("commandTreeDemo"), nodes = zTree
                    .getCheckedNodes(true), v = "";
            for (var i = 0, l = nodes.length; i < l; i++) {
                if (nodes[i].id != 1) {
                    v += nodes[i].id + ",";
                }
            }
            commandNodes = v;
        },
        //执行类型及参数显示
        executeCommandShow: function(){
            console.log("clickTreeNodeName:",clickTreeNodeName);
            switch(clickTreeNodeName){
                //通讯参数
                case "commandTreeDemo_2":
                    $("#commParameters,.report-para-footer").show();
                    $("#terminalParameters,#aquiryParameters,#meterbaseParameters,.report-para-footer-control,.report-para-footer-control-1").hide();
                    break;
                //终端参数
                case "commandTreeDemo_3":
                    $("#terminalParameters,.report-para-footer").show();
                    $("#commParameters,#aquiryParameters,#meterbaseParameters,.report-para-footer-control,.report-para-footer-control-1").hide();
                    break;
                //采集指令
                case "commandTreeDemo_4":
                    $("#aquiryParameters,.report-para-footer").show();
                    $("#commParameters,#terminalParameters,#meterbaseParameters,.report-para-footer-control,.report-para-footer-control-1").hide();
                    break;
                //基表设置
                case "commandTreeDemo_5":
                    $("#meterbaseParameters,.report-para-footer").show();
                    $("#commParameters,#terminalParameters,#aquiryParameters,.report-para-footer-control,.report-para-footer-control-1").hide();
                    break;
                
            }
        },
        initTable: function(){
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
                    "data" : null,
                    "class" : "text-center",
                    render : function(data, type, row, meta) {
                        var result = '';
                            var obj = {};
                            if (row.paramId != null && row.paramId != "") {
                                obj.paramId = row.paramId;
                            }
                         obj.id = row.id;
                         obj.paramId = row.paramId;
                         obj.vehicleId = row.vehicleId;
                         obj.type = row.commandType;
                         obj.dId = row.dId;
                         var jsonStr = JSON.stringify(obj)
                         result += "<input  type='checkbox' name='subChk'  value='" + jsonStr + "' />";
                         return result;
                    }
                },
                {
                    "data" : "status",
                    "class" : "text-center",
                    render : function(data, type, row, meta) {
                         if (data == "0") {
                                return '未下发';
                            } else if (data == "1") {
                                return '已下发';
                            } else if (data == "2") {
                                return "已读取";
                            } else {
                                return data;
                            }
                    }
                }, {
                    "data" : "commandType",
                    "class" : "text-center",
                    render : function(data, type, row, meta) {
                        if (data == "11") {
                            return '通讯参数';
                        }else if (data == "12"){
                            return '终端参数';
                        }else if (data == "13"){
                            return '采集指令';
                        }else if (data == "14"){
                            return '基表设置';
                        }

                    }
                },
                {
                    "data" : "sierialnumber", // 表具编号
                    "class" : "text-center",
                }, 
                {
                    "data" : "station_name", // 站点名称
                    "class" : "text-center",
                }, 
                {
                    "data" : "simcardnumber", // sim卡号
                    "class" : "text-center",
                },  
                {
                    "data" : "belongto",   // 所属组织
                    "class" : "text-center"
                },
                {
                    "data" : "sendparametertime", // 最新下发参数时间
                    "class" : "text-center",
                }, {
                    "data" : "readparametertime", // 最新读取参数时间
                    "class" : "text-center",
                },  {
                    "data" : "createDataTime",  //安装日期
                    "class" : "text-center"
                }
            ];//ajax参数
            var ajaxDataParamFun = function(d) {
                d.simpleQueryParam = $('#simpleQueryParam').val(); //模糊查询
                sid = $("#sid").val()
                d.sid = sid;
            };
            //表格setting
            var setting = {
                listUrl : "/api/devm/paramsmanager/command/list/",
                // editUrl : "/devm/paramsmanager/command/edit_",
                // deleteUrl : "/devm/paramsmanager/command/delete_",
                // deletemoreUrl : "/devm/paramsmanager/command/deletemore",
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
        //全选
        checkAllClick: function(){
            $("input[name='subChk']").prop("checked", this.checked);
        },
        //单选
        subChk: function(){
            $("#checkAll").prop("checked",subChk.length == subChk.filter(":checked").length ? true: false);
        },
        //批量删除
        delModel: function(){
            //判断是否至少选择一项
            var chechedNum = $("input[name='subChk']:checked").length;
            if (chechedNum == 0) {
                return;

            }
            var checkedList = new Array();
            $("input[name='subChk']:checked").each(function() {
                var jsonObj = $.parseJSON($(this).val());
                checkedList.push(jsonObj.id);
            });
            myTable.deleteItems({
                'deltems' : checkedList.toString()
            });
        },
        //刷新
        refreshTable: function(){
            $("#simpleQueryParam").val("");
            myTable.requestData();
        },
        readCommand:function(){
            if( currentStation === undefined){
                layer.msg("请先选择站点");
                return;
            }
            if(currentCommandType === undefined){
                layer.msg("请选择指令类型");
                return
            }
            // var ROOT_PATH = "http://localhost:8080/amrs";
            var commaddr = $("#commaddr").val();
            var data = {"commaddr":commaddr,"cmd":"modifyIpAndPort","params":"readparam"};
            url = ROOT_PATH + "/amrssocket?action=updateBigMeterInfo";
            json_ajax("POST",url,"jsonp",true,data, realTimeCommand.saveCommandback);
        },
        saveCommand: function(){
            if(currentCommandType === undefined){
                layer.msg("请先选择站点和指令类型");
                return
            }
            // if(!realTimeCommand.checkSubmit() ){
            //     layer.msg("请检查配置")
            //     return;
            // };
            commaddr = $("#commaddr").val();
            
            // var ROOT_PATH = "http://localhost:8080/amrs";
            // 通讯参数
            if (currentCommandType == "11") {
                tcpresendcount = $("#tcpresendcount").val();
                tcpresponovertime = $("#tcpresponovertime").val();
                udpresendcount = $("#udpresendcount").val();
                udpresponovertime = $("#udpresponovertime").val();
                smsresendcount = $("#smsresendcount").val();
                smsresponovertime = $("#smsresponovertime").val();
                heartbeatperiod = $("#heartbeatperiod").val();
                
                //data = {"commaddr":commaddr,"tcpresendcount":tcpresendcount,"tcpresponovertime":tcpresponovertime,
                    //"udpresendcount":udpresendcount,"udpresponovertime":udpresponovertime,"smsresendcount":smsresendcount,
                    //"smsresponovertime":smsresponovertime,"heartbeatperiod":heartbeatperiod}
				data = {"commaddr":commaddr,"cmd":"modifyIpAndPort","params":tcpresendcount+'@'+tcpresponovertime+'@'+udpresendcount
											+'@'+udpresponovertime+'@'+smsresendcount+'@'+smsresponovertime+'@'+heartbeatperiod}
                //url = "/devm/paramsmanager/command/saveCommand/";
				url = ROOT_PATH + "/amrssocket?action=updateBigMeterInfo";
            }
            // 终端参数
            if(currentCommandType == "12"){
                ipaddr = $("#ipaddr").val();
                port = $("#port").val();
                entrypoint = $("#entrypoint").val();

                //data = {"commaddr":commaddr,"ip":ipaddr,"port":port}
                //url = ROOT_PATH + "/amrssocket?action=updateBigMeterInfo";
                
				
				data = {"commaddr":commaddr,"cmd":"modifyIpAndPort","params":ipaddr+'@'+port}
				console.log(data);
                url = ROOT_PATH + "/amrssocket?action=updateBigMeterInfo";
				console.log(url);


            }
            // 采集指令
            if(currentCommandType == "13"){
                updatastarttime = $("#updatastarttime").val();
                updatamode = $("#updatamode").val();
                collectperiod = $("#collectperiod").val();
                updataperiod = $("#updataperiod").val();
                updatatime1 = $("#updatatime1").val();
                updatatime2 = $("#updatatime2").val();
                updatatime3 = $("#updatatime3").val();
                updatatime4 = $("#updatatime4").val();
                
                //data = {"commaddr":commaddr,"updatastarttime":updatastarttime,"updatamode":updatamode,
                    //"collectperiod":collectperiod,"updataperiod":updataperiod,"updatatime1":updatatime1,
                    //"updatatime2":updatatime2,"updatatime3":updatatime3,"updatatime4":updatatime4}
				
				data = {"commaddr":commaddr,"cmd":"modifyIpAndPort","params":updatastarttime+'@'+updatamode+'@'+collectperiod
											+'@'+updataperiod+'@'+updatatime1+'@'+updatatime2+'@'+updatatime3+'@'+updatatime4}
				
                //url = "/devm/paramsmanager/command/saveCommand/";
				url = ROOT_PATH + "/amrssocket?action=updateBigMeterInfo";
            }
            // 基表设置
            if(currentCommandType == "14"){
                dn = $("#dn").val();
                liciperoid = $("#liciperoid").val();
                maintaindate = $("#maintaindate").val();
                transimeterfactor = $("#transimeterfactor").val();
                biaofactor = $("#biaofactor").val();
                manufacturercode = $("#manufacturercode").val();
                issmallsignalcutpoint = $("#issmallsignalcutpoint").val();
                smallsignalcutpoint = $("#smallsignalcutpoint").val();

                isflowzerovalue = $("#isflowzerovalue").val();
                flowzerovalue = $("#flowzerovalue").val();
                pressurepermit = $("#pressurepermit").val();
                flowdorient = $("#flowdorient").val();
                plusaccumupreset = $("#plusaccumupreset").val();

                //data = {"commaddr":commaddr,"dn":dn,"liciperoid":liciperoid,
                    //"maintaindate":maintaindate,"transimeterfactor":transimeterfactor,"biaofactor":biaofactor,
                    //"manufacturercode":manufacturercode,"issmallsignalcutpoint":issmallsignalcutpoint,
                    //"smallsignalcutpoint":smallsignalcutpoint,"isflowzerovalue":isflowzerovalue,"flowzerovalue":flowzerovalue,
                    //"pressurepermit":pressurepermit,"flowdorient":flowdorient,"plusaccumupreset":plusaccumupreset
                //}

				data = {"commaddr":commaddr,"cmd":"modifyIpAndPort","params":dn+'@'+liciperoid+'@'+maintaindate+'@'+transimeterfactor
											+'@'+biaofactor+'@'+manufacturercode+'@'+issmallsignalcutpoint+'@'+smallsignalcutpoint
											+'@'+isflowzerovalue+'@'+flowzerovalue+'@'+pressurepermit+'@'+flowdorient+'@'+plusaccumupreset}
                //url = "/devm/paramsmanager/command/saveCommand/";
				url = ROOT_PATH + "/amrssocket?action=updateBigMeterInfo";
            }
            // url = "/devm/paramsmanager/command/saveCommand/";

            json_ajax("POST",url,"jsonp",true,data, realTimeCommand.saveCommandback);
              
        },
        saveCommandback:function(data){
            console.log("saveCommandback",data);
            if(data.ret == 10001){
                layer.msg("下发成功")
                myTable.refresh()
            }
        },
        // 显示错误提示信息
        showErrorMsg: function(msg, inputId){
            if ($("#error_label").is(":hidden")) {
                $("#error_label").text(msg);
                $("#error_label").insertAfter($("#" + inputId));
                $("#error_label").show();
            } else {
                $("#error_label").is(":hidden");
            }
        },
        hideErrorMsg: function(){
            $("#error_label").hide();
        },
        inputBlur: function(){
            realTimeCommand.hideErrorMsg();
        },
        validateSubmit: function(){
            var commandTypes = commandNodes.split(",");
            for(var i =0;i<commandTypes.length;i++){
                var commandType = commandTypes[i];
                if(commandType =="19"){
                    var events = $("input[id^='eventId']");
                    var eventContents = $("input[id^='eventContent']");
                    for(var j=0;j<events.length;j++){
                        if(events[j].value==""){
                            realTimeCommand.showErrorMsg(commandIncidentIdNull, "eventId_2");
                            return false;
                        }else{
                            realTimeCommand.hideErrorMsg();
                        }
                        if(eventContents[j].value==""){
                            realTimeCommand.showErrorMsg(commandIncidentDataNull, eventContents[j].id);
                            return false;
                        }else{
                            realTimeCommand.hideErrorMsg();
                        }
                    }
                }else if(commandType =="20"){
                    var events = $("input[id^='phoneBookId']");
                    var eventContents = $("input[id^='phoneBookContact']");
                    var phoneBookNumbers = $("input[id^='phoneBookNumber']");
                    for(var j=0;j<events.length;j++){
                        if(events[j].value==""){
                            realTimeCommand.showErrorMsg(commandContactIdNull, "phoneBookId_2");
                            return false;
                        }else{
                            realTimeCommand.hideErrorMsg();
                        }
                        if(eventContents[j].value==""){
                            realTimeCommand.showErrorMsg(commandContactNameNull, eventContents[j].id);
                            return false;
                        }else{
                            realTimeCommand.hideErrorMsg();
                        }
                        if(phoneBookNumbers[j].value==""){
                            realTimeCommand.showErrorMsg(commandContactPhoneNull, phoneBookNumbers[j].id);
                            return false;
                        }else{
                            realTimeCommand.hideErrorMsg();
                        }
                    }
                }else if(commandType =="21"){
                    var events = $("input[id^='infoDemandId']");
                    var eventContents = $("input[id^='infoDemandName']");
                    for(var j=0;j<events.length;j++){
                        if(events[j].value==""){
                            realTimeCommand.showErrorMsg(commandMessageIdNull, event[j].id);
                            return false;
                        }else{
                            realTimeCommand.hideErrorMsg();
                        }
                        if(eventContents[j].value==""){
                            realTimeCommand.showErrorMsg(commandMessageNameNull, eventContents[j].id);
                            return false;
                        }else{
                            realTimeCommand.hideErrorMsg();
                        }
                    }
                }else if(commandType =="17"){
                    var videoCameraTimeInterval = $("#videoCameraTimeInterval").val();
                    var videoCameraDistanceInterval = $("#videoCameraDistanceInterval").val();
                    if(videoCameraTimeInterval==""){
                        realTimeCommand.showErrorMsg(commandIntervalNull, "videoCameraTimeInterval");
                        return false;
                    }else{
                        realTimeCommand.hideErrorMsg();
                    }
                    if(videoCameraDistanceInterval==""){
                        realTimeCommand.showErrorMsg(commandDistanceNull, "videoCameraDistanceInterval");
                        return false;
                    }else{
                        realTimeCommand.hideErrorMsg();
                    }
                }
            }
            return true;
        },
        checkSubmit: function(){
             var zTree = $.fn.zTree.getZTreeObj("treeDemo");
              nodes = zTree.getCheckedNodes(true);
              if(nodes.length==0){
                  layer.msg(commandVehicleNull);
                  return false;
              }
              return true;
        },
        
        ajaxQueryDataFilter: function(treeId, parentNode, responseData) {
            responseData = JSON.parse(ungzip(responseData));
            var list = [];
            if (vehicleIdList != null && vehicleIdList != undefined && vehicleIdList != ""){
                var str=(vehicleIdList.slice(vehicleIdList.length-1)==',')?vehicleIdList.slice(0,-1):vehicleIdList;
                list = str.split(",");
            }
            return filterQueryResult(responseData,list);
        },
         //模糊查询
        inputTextAutoSearch: function(param){
         search_ztree('treeDemo', 'search_condition', 'station');

            // if (param != null && param != undefined && param != '') {
            //     var setQueryChar = {
            //             async: {
            //                 url: "/clbs/m/personalized/ico/vehicleTreeFuzzy",
            //                 type: "post",
            //                 enable: true,
            //                 autoParam: ["id"],
            //                 dataType: "json",
            //                 otherParam: {"type": "multiple","queryParam":param, "deviceType":"1"},
            //                 dataFilter: realTimeCommand.ajaxQueryDataFilter
            //             },
            //             check: {
            //                 enable: true,
            //                 chkStyle: "checkbox",
            //                 chkboxType: {
            //                     "Y": "s",
            //                     "N": "s"
            //                 },
            //                 radioType: "all"
            //             },
            //             view: {
            //                 dblClickExpand: false,
            //                 nameIsHTML: true,
            //                 fontCss: setFontCss_ztree,
            //                 countClass: "group-number-statistics"
            //             },
            //             data: {
            //                 simpleData: {
            //                     enable: true
            //                 }
            //             },
            //             callback: {
            //                 beforeClick:realTimeCommand.beforeClick,
            //                 onClick: realTimeCommand.onClickStation,
            //                 onAsyncSuccess: realTimeCommand.fuzzyZTreeOnAsyncSuccess,
            //                 //beforeCheck: realTimeCommand.fuzzyZTreeBeforeCheck,
            //                 onCheck: realTimeCommand.fuzzyOnCheckVehicle,
            //                 //onExpand: realTimeCommand.zTreeOnExpand,
            //                 //onNodeCreated: realTimeCommand.zTreeOnNodeCreated,
            //             }
            //         };
            //     $.fn.zTree.init($("#treeDemo"), setQueryChar, null);
            // }else{
            //     realTimeCommand.initTreeData("1");
            // }
            
        },
        
         fuzzyZTreeOnAsyncSuccess : function (event, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.expandAll(true);
         },
         fuzzyZTreeBeforeCheck : function(treeId, treeNode){
            var flag = true;
            if (!treeNode.checked) {
                 var zTree = $.fn.zTree.getZTreeObj("treeDemo"), nodes = zTree
                     .getCheckedNodes(true), v = "";
                 var nodesLength = 0;
                 for (var i=0;i<nodes.length;i++) {
                     if(nodes[i].type == "people" || nodes[i].type == "vehicle"){
                         nodesLength += 1;
                     }
                 }
                 if (treeNode.otype == "group" || treeNode.otype == "assignment"){ // 判断若勾选节点数大于5000，提示
                     var zTree = $.fn.zTree.getZTreeObj("treeDemo")
                     json_ajax("post", "/clbs/a/search/monitorTreeFuzzyCount",
                         "json", false, {"type": "multiple","queryParam":fuzzyParam}, function (data) {
                             nodesLength += data;
                         })
                 } else if (treeNode.otype == "people" || treeNode.otype == "vehicle"){
                     nodesLength += 1;
                 }
                 if(nodesLength > 5000){
                     layer.msg(treeMaxLength5000);
                     flag = false;
                 }
             }
            return flag;
         },
         fuzzyOnCheckVehicle : function(e, treeId, treeNode) {
            //获取树结构
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            //获取勾选状态改变的节点
            var changeNodes = zTree.getChangeCheckedNodes();
            if(treeNode.checked){ //若是取消勾选事件则不触发5000判断
                 var checkedNodes = zTree.getCheckedNodes(true);
                 var nodesLength = 0;
                 //
                 for (var i=0;i<checkedNodes.length;i++) {
                     if(checkedNodes[i].type == "people" || checkedNodes[i].type == "vehicle"){
                         nodesLength += 1;
                     }
                 }
                 
                 if(nodesLength > 5000){
                    //zTree.checkNode(treeNode,false,true);
                    layer.msg(treeMaxLength5000);
                    for (var i=0;i<changeNodes.length;i++) {
                        changeNodes[i].checked = false;
                        zTree.updateNode(changeNodes[i]);
                    }
                 }
            }
            //获取勾选状态被改变的节点并改变其原来勾选状态（用于5000准确校验）
             for(var i=0;i<changeNodes.length;i++){
                changeNodes[i].checkedOld = changeNodes[i].checked;
             }
         },
         
        
//        showErrorMsg: function(msg, inputId) {
//          if ($("#error_label").is(":hidden")) {
//              $("#error_label").text(msg);
//              $("#error_label").insertAfter($("#" + inputId));
//              $("#error_label").show();
//          } else {
//              $("#error_label").is(":hidden");
//          }
//      }
    }
    $(function(){
        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
             search_ztree('treeDemo', id, 'station');
             // realTimeCommand.initTreeData("1");
            };
        });
        console.log("start..")
        $("#commParameters,.report-para-footer").show();
        $("#terminalParameters,#aquiryParameters,#meterbaseParameters,.report-para-footer-control,.report-para-footer-control-1").hide();
        realTimeCommand.init();
        realTimeCommand.getHoursMinuteSeconds();
        realTimeCommand.initTable();
        // realTimeCommand.responseSocket();
        // $("#generateListBtn").on("click",realTimeCommand.generateClick);
        // $("#event-add-btn").on("click",realTimeCommand.addEventSetting);
        // $("#phoneBook-add-btn").on("click",realTimeCommand.addPhoneBookEvent);
        // $("#infoDemand-add-btn").on("click",realTimeCommand.addInfoDemandEvent);
        // $("#baseStation-add-btn").on("click",realTimeCommand.addBaseStationEvent);
        $("#checkAll").bind("click",realTimeCommand.checkAllClick);
        subChk.bind("click",realTimeCommand.subChk);
        // $("#jiaoTong_f3_standby").bind("click",realTimeCommand.getTree);
        $("#del_model").bind("click",realTimeCommand.delModel);
        $("#refreshTable").bind("click",realTimeCommand.refreshTable);
        $("#saveCommand").bind("click",realTimeCommand.saveCommand);
        $("#readCommand").bind("click",realTimeCommand.readCommand);
        // $("#generateDeviceSearch").on("click",realTimeCommand.generateDeviceSearch);
        // 批量下发
        // $("#send_model").bind("click",realTimeCommand.sendBatch);
        //自动模糊查询
//        $("#search_condition").on('input oninput',realTimeCommand.inputTextAutoSearch);
        // 树结构模糊搜索
        var inputChange;
        $("#search_condition").on('input propertychange', function(value){
            if (inputChange !== undefined) {
                clearTimeout(inputChange);
            };
            inputChange = setTimeout(function(){
                // search
                var param = $("#search_condition").val();
                if(param == ''){
                    realTimeCommand.initTreeData("1");
                }else{
                    realTimeCommand.inputTextAutoSearch(param);
                }
            }, 500);
        });
        // 滚动展开
        $("#treeDemo").scroll(function () {
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTreeScroll(zTree, this);
        });
        //IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            var search;
            $("#search_condition").bind("focus",function(){
                search = setInterval(function(){
                   search_ztree('treeDemo', 'search_condition','station');
                    // realTimeCommand.inputTextAutoSearch(param);
                },500);
            }).bind("blur",function(){
                clearInterval(search);
            });
        }
        laydate.render({elem: '#updatastarttime',type: 'time',theme: '#6dcff6'});
        laydate.render({elem: '#updatatime1',type: 'time',theme: '#6dcff6'});
        laydate.render({elem: '#updatatime2',type: 'time',theme: '#6dcff6'});
        laydate.render({elem: '#updatatime3',type: 'time',theme: '#6dcff6'});
        laydate.render({elem: '#updatatime4',type: 'time',theme: '#6dcff6'});
        laydate.render({elem: '#baseStationFixedTime',type: 'time',theme: '#6dcff6'});
        // 应答确定
        $('#parametersResponse').on('click', realTimeCommand.platformMsgAck);
    })
// })(window,$)
