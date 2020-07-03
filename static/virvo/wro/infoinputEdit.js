//@ sourceURL=infoinputEdit.js

(function($,window){
    var inputIdArray;
    var datas;
    var group = 1;
    var people = 1;
    var monitorType = $("#monitorType").val();
    var monitorId = $("#vehicleid").val();
    var brandName = $("#brandName").val();
    var deviceId = $("#deviceid").val();
    var simCardId = $("#simid").val();
    var simCard = $("#simCard").val();
    var peopleId = $("#peopleIds").val();
    var peopleName = $("#peopleNames").val();
    var brandInput = $("#brands");
    var deviceInput = $("#devices");
    var simInput = $("#sims");
    var employeeInput = $(".peopleSelect");
    var btnMonitor = $("#btnMonitor");
    var vehicleFlag = false;//监控对象是否新增标识
    var deviceFlag = false;//终端是否新增标识
    var simFlag = false;//sim卡是否新增标识
    var msgEdit = {
        //初始化
        init: function(){
            if(monitorType === "1"){ //人
                $('.monitoring-people').hide();
                msgEdit.InitCallback1();
                msgEdit.deviceTypeMenu(monitorType);
            } else if(monitorType === "0") { //车
                msgEdit.InitCallback();
                msgEdit.deviceTypeMenu(monitorType);
            }
            var setting = {
                async: {
                    url: "/clbs/m/infoconfig/infoinput/tree",
                    type: "post",
                    enable: true,
                    autoParam: ["id"],
                    contentType: "application/json",
                    dataType: "json",
                    dataFilter: msgEdit.ajaxDataFilter
                },
                view: {
                    dblClickExpand: false
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    beforeClick: msgEdit.beforeClick,
                    onClick: msgEdit.onClick
                }
            };
            //分组树初始化
            $.fn.zTree.init($("#ztreeDemo"), setting, null);
            var setting2 = {
                async:{
                    url:"/clbs/m/basicinfo/enterprise/professionals/tree",
                    type:"post",
                    enable:true,
                    autoParam:["id"],
                    contentType: "application/json",
                    dataType: "json",
                },
                view: {
                    dblClickExpand: false
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    beforeClick:msgEdit.beforeClick,
                    onClick: msgEdit.onClick2,
                }
            };
            //组织树初始化
            $.fn.zTree.init($("#ztreeDemo2"), setting2, null);
            var editForm = $("#editForm");
            editForm.parent().parent().css("width","80%");
            laydate.render({elem: '#billingDate', theme: '#6dcff6'});
            laydate.render({elem: '#dueDate', theme: '#6dcff6'});
        },
        initMonitor: function (url) {
            msgEdit.initDataList(brandInput, url, monitorId,msgEdit.brandsChange);
        },
        initDevice: function (url) {
            msgEdit.initDataList(deviceInput, url, deviceId,msgEdit.devicesChange);
        },
        initSimCard: function (url) {
            msgEdit.initDataList(simInput, url, simCardId,msgEdit.simsChange);
        },
        initEmployee: function (url) {
            msgEdit.initDataList(employeeInput, url, peopleId,
                    function(keyword){msgEdit.checkDoubleChoosePro(keyword.id, "professionals");},
                    msgEdit.initProfessional);
        },
        initDataList: function (dataInput, urlString, id, callback,moreCallback) {
            if(id.indexOf('#')<0){
                dataInput.attr('data-id',id);
            }
            //if(dataInput.attr('name').indexOf('_')<0){
            //  dataInput.attr('name',dataInput.attr('name')+'__');
            //}
            $.ajax({
                type: "POST",
                url: urlString,
                data: {configId: $("#configId").val()},
                dataType: "json",
                success: function (data) {
                    var itemList = data.obj;
                    var suggest=dataInput.bsSuggest({
                        indexId: 1,  //data.value 的第几个数据，作为input输入框的内容
                        indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
                        data: {value:itemList},
                        effectiveFields: ["name"]
                    }).on('onDataRequestSuccess', function (e, result) {
                    }).on("click",function(){
                    }).on('onSetSelectValue', function (e, keyword, data) {
                        if(callback){
                            dataInput.closest('.form-group').find('.dropdown-menu').hide()
                            callback(keyword)
                        }
                        //限制输入
                        msgEdit.showHideValueCase(0,dataInput);
                        msgEdit.hideErrorMsg();
                    }).on('onUnsetSelectValue', function () {
                        //放开输入
                        msgEdit.showHideValueCase(1,dataInput);
                    });
                    
                    dataInput.next().find('button').removeClass('disabled loading-state-button').find('i').attr("class", 'caret');
                    if(moreCallback){
                        moreCallback()
                    }
                }
            });
        },
        //显示或隐藏输入框
        showHideValueCase: function(type,dataInput){
            var dataInputType = dataInput.selector;
            if (type == 0) {//限制输入
                if ("#brands" == dataInputType) { //车辆限制
                    $(".vehicleList").attr("readonly",true);
                    $("#vehicleTypeDiv").css("display","block");
                    $("#carGroupName").css("background-color","");
                    $("#vehicleGroupDiv").css("display","block");
                    vehicleFlag = false;
                }
                if ("#devices" == dataInputType) { //终端限制
                    $(".deviceList").attr("readonly",true);
                    $("#deviceTypeDiv").css("display","block");
                    $("#functionalTypeDiv").css("display","block");
                    $("#deviceGroupName").css("background-color","");
                    $("#deviceGroupDiv").css("display","block");
                    deviceFlag = false;
                }
                if ("#sims" == dataInputType) { //sim卡限制
                    $(".simsList").attr("readonly",true);
                    $("#simParentGroupName").css("background-color","");
                    $("#simGroupDiv").css("display","block");
                    $("#operatorTypeDiv").css("display","block");
                    simFlag = false;
                }
            } else if (type == 1) {//放开输入
                if ("#brands" == dataInputType) { //车辆放开
                    $(".vehicleList").removeAttr("readonly");
                    $("#vehicleTypeDiv").css("display","none");
                    $("#carGroupName").css("background-color","#fafafa");
                    $("#vehicleGroupDiv").css("display","none");
                    vehicleFlag = true;
                }
                if ("#devices" == dataInputType) { //终端放开
                    $(".deviceList").removeAttr("readonly");
                    $("#deviceTypeDiv").css("display","none");
                    $("#functionalTypeDiv").css("display","none");
                    $("#deviceGroupName").css("background-color","#fafafa");
                    $("#deviceGroupDiv").css("display","none");
                    deviceFlag = true;
                }
                if ("#sims" == dataInputType) { //sim卡放开
                    $(".simsList").removeAttr("readonly");
                    $("#simParentGroupName").css("background-color","#fafafa");
                    $("#simGroupDiv").css("display","none");
                    $("#operatorTypeDiv").css("display","none");
                    simFlag = true;
                }
            }
        },
        //查询车辆类型回调方法
        vehicleTypeCallback: function() {
            json_ajax("POST","/clbs/m/basicinfo/monitoring/vehicle/addList","json",false,{},function(data){
                var dataLength = data.obj.VehicleTypeList.length;
                for (var i = 0; i < dataLength; i++){
                    $("#vehicleType").append("<option value=" + data.obj.VehicleTypeList[i].id + ">" + data.obj.VehicleTypeList[i].vehicleType + "</option>")
                }
            });
            
            var fvt = $("#firstVehicleType").val();
            $("#vehicleType").val(fvt);
        },
        //根据不同的监控对象类型加载不同的协议类型和功能类型
        deviceTypeMenu: function(type) {
            if ("0" == type) { //车
                $("#deviceType").append(
                        "<option value='0'>交通部JT/T808-2011(扩展)</option>" +
                        "<option value='1'>交通部JT/T808-2013</option>" +
                        "<option value='2'>移为</option>" +
                        "<option value='3'>天禾</option>" +
                        "<option value='6'>KKS</option>" + 
                        "<option value='8'>BSJ-A5</option>" +
                        "<option value='9'>ASO</option>" +
                        "<option value='10'>F3超长待机</option>"
                );
                $("#functionalType").append(
                        "<option value='1'>简易型车机</option>" + 
                        "<option value='2'>行车记录仪</option>" +
                        "<option value='3'>对讲设备</option>" +
                        "<option value='5'>超长待机设备</option>"
                );
            }
            if ("1" == type) { //人
                $("#deviceType").append(
                        "<option value='5'>BDTD-SM</option>"
                );
                $("#functionalType").append(
                        "<option value='4'>手咪设备</option>"
                );
            }
            //装入值
            var dt = $("#firstDeviceType").val();
            var ft = $("#firstFunctionalType").val();
            $("#deviceType").val(dt);
            $("#functionalType").val(ft);
        },
        processData: function (data) {
            var dataList = data.obj;
            var itemList = {
                value: []
            };
            for (var i = 0; i < dataList.length; i++) {
                itemList.value.push({ id: dataList[i].id, name: dataList[i].name});
            }
            return itemList;
        },
        InitCallback: function(){
            //监控对象
            msgEdit.initMonitor("/clbs/m/infoconfig/infoinput/getVehicleSelect");
            //终端编号
            msgEdit.initDevice("/clbs/m/infoconfig/infoinput/getVDeviceSelect");
            //sim卡
            msgEdit.initSimCard("/clbs/m/infoconfig/infoinput/getSimcardSelect");
            //从业人员
            msgEdit.initEmployee("/clbs/m/infoconfig/infoinput/getProfessionalSelect");
            //组装车辆类型
            msgEdit.vehicleTypeCallback();
        },
        InitCallback1: function(){
            //监控对象
            msgEdit.initMonitor("/clbs/m/infoconfig/infoinput/getPeopleSelect");
            //终端编号
            msgEdit.initDevice("/clbs/m/infoconfig/infoinput/getPDeviceSelect");
            //sim卡
            msgEdit.initSimCard("/clbs/m/infoconfig/infoinput/getSimcardSelect");
        },
        //显示错误提示信息
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
        brandsChange: function (keyword) {
            datas = keyword.id;
            if (monitorType == 0) {
                json_ajax("POST", "/clbs/m/infoconfig/infoinput/getVehicleInfoById", "json", true, {"vehicleId": datas},
                        msgEdit.brandsChangeCallback);
            } else {
                json_ajax("POST", "/clbs/m/infoconfig/infoinput/getPeopleInfoById", "json", true, {"peopleId": datas},
                        msgEdit.brandsPeopleChangeCallback);
            }
            
        },
        brandsChangeCallback: function(data){
            if(data.success){
                if (data !== null && data.obj !== null && data.obj.vehicleInfo !== null) {
                    $("#carGroupName").val(data.obj.vehicleInfo.groupName);
                    $("#vehicleOwnerPhone").val(data.obj.vehicleInfo.vehicleOwnerPhone);
                    $("#vehicleType").val(data.obj.vehicleInfo.vehicleType);
                }else{
                    layer.msg(data.msg);
                }
            }
        },
        brandsPeopleChangeCallback: function(data){
            if(data.success){
                if (data !== null && data.obj !== null && data.obj.vehicleInfo !== null) {
                    $("#carGroupName").val(data.obj.peopleInfo.groupName);
                }else{
                    layer.msg(data.msg);
                }
            }
        },
        devicesChange: function (keyword) {
            datas = keyword.key;
            json_ajax("POST", "/clbs/m/infoconfig/infoinput/getDeviceInfoByDeviceNumber", "json", true,
                {"deviceNumber": datas}, msgEdit.devicesChangeCallback);
        },
        devicesChangeCallback: function(data){
            if(data.success){
                if (data != null && data.obj != null && data.obj.deviceInfo != null) {
                    $("#deviceGroupName").val(data.obj.deviceInfo.groupName);
                    $("#deviceType").val(data.obj.deviceInfo.deviceType);
                    $("#functionalType").val(data.obj.deviceInfo.functionalType);
                    $("#manuFacturer").val(data.obj.deviceInfo.manuFacturer);
                }
            }else{
                layer.msg(data.msg);
            }
        },
        simsChange: function (keyword) {
            datas = keyword.key;
            json_ajax("POST", "/clbs/m/infoconfig/infoinput/getSimcardInfoBySimcardNumber", "json", true,
                {simcardNumber: datas}, msgEdit.simsChangeCallback);
        },
        simsChangeCallback: function(data){
            if(data.success){
                $("#iccidSim").val(data.obj.simcardInfo.ICCID);
                $("#simParentGroupName").val(data.obj.simcardInfo.groupName);
                $("#operator").val(data.obj.simcardInfo.operator);
                $("#simFlow").val(data.obj.simcardInfo.simFlow);
                $("#openCardTime").val(data.obj.simcardInfo.openCardTime);
            }else{
                layer.msg(data.msg);
            }
        },
        // 校验是否重复选择从业人员
        checkDoubleChoosePro: function(proId, selectId){
            var flag = true;
            var selects = $("[name='professionalsId__']");
            if (selects !== null && selects !== undefined && selects !== 'undefined' && selects.length > 0) {
                selects.each(function (i){
                    if (proId === $(this).attr("data-id") && selectId !== $(this).attr("id")) {
                        layer.msg(repeateChooseProfession);
                        $("#" + selectId).val("");
                        flag = false;
                    }
                });
            }
            return flag ;
        },
        ajaxDataFilter: function(treeId, parentNode, responseData){
            if (responseData) {
              for(var i =0,responseDataLength = responseData.length; i < responseDataLength; i++) {
                responseData[i].open = true;
              }
            }
            return responseData;
        },
        beforeClick: function(treeId, treeNode){
            return treeNode;
        },
        onClick: function(e, treeId, treeNode){
            var zTree = $.fn.zTree.getZTreeObj("ztreeDemo"),
                nodes = zTree.getSelectedNodes(),
                name = "",
                id = "";
            nodes.sort(function compare(a, b) {
                return a.id - b.id;
            });
            var type = "";
            for (var i = 0, l = nodes.length; i < l; i++) {
                if (nodes[i].type === "assignment") { // 选择的是分组，才组装值
                    type = nodes[i].type;
                    name += nodes[i].name;
                    id += nodes[i].id + ",";
                }
            }
            if (id.length > 0) {
                id = id.substring(0, id.length - 1);
            }

            if (type === "assignment" && msgEdit.checkDoubleChooseAssignment(id)
                && msgEdit.checkMaxVehicleCountOfAssignment(id, name)) { // 点击的是分组，才往下执行
                var cityObj = $("#" + inputIdArray);
                cityObj.attr("value", id);
                cityObj.val(name);
                cityObj.siblings("input:last").val(id);
                $("#zTreeContent").hide();
                msgEdit.hideErrorMsg();
            }
        },
        onClick2: function(e, treeId, treeNode){
            var zTree = $.fn.zTree.getZTreeObj("ztreeDemo2"),
                nodes = zTree.getSelectedNodes(),
                v = "";
            var t = "";
            nodes.sort(function compare(a,b){return a.id-b.id;});
            for (var i=0, l=nodes.length; i<l; i++) {
                t+= nodes[i].name;
                v += nodes[i].uuid + ",";
            }
            if (v.length > 0 ) v = v.substring(0, v.length-1);
            var cityObj = $("#" + inputIdArray);
            cityObj.attr("value",v);
            cityObj.val(t);
            cityObj.siblings().val(v);
            $("#groupTree").hide();
        },
        // 校验当前分组下的车辆数是否已经达到最大值（最大值目前设定为：100台）
        checkMaxVehicleCountOfAssignment:function(assignmentId, assignmentName){
            var b = true;
            $.ajax({
                type: 'POST',
                url: '/clbs/m/infoconfig/infoinput/checkMaxVehicleCount',
                data: {"assignmentId": assignmentId, "assignmentName" : assignmentName},
                dataType: 'json',
                async: false,
                success: function (data) {
                  b = data.obj.success;
                  if (!data.obj.success) {
                      layer.msg("【"+assignmentName+"】" + assignmentMaxCarNum, {
                         time: 1500,
                      });
                  }
                },
                error: function () {
                    layer.msg(systemError, {
                         time: 1500,
                    });
                    b = false;
                }
            });
            return b;
        },
        // 校验是否重复选择
        checkDoubleChooseAssignment: function(curValue){
            var model = $("#edit-area").children("div");
            var edit = $("#edit-list").children("div");
            var added = $("#edit-add-area").children("div");
            var gid = '';
            var flag = true;
            if (model != null && model != undefined && model != 'undefined' && model.length > 0) {
                if (curValue == model.children("input:last-child").val()) {
                    layer.msg(repeateChooseAssignment);
                    flag = false;
                }
            }
            if (edit != null && edit != undefined && edit != 'undefined' && edit.length > 0) {
                edit.each(function(i){
                    if (curValue == $(this).children("div").children("div").children("input:last-child").val()) {
                        layer.msg(repeateChooseAssignment);
                        flag = false;
                    }
                });
            }
            if (added != null && added != undefined && added != 'undefined' && added.length > 0) {
                added.each(function(i){
                    if (curValue == $(this).children("div").children("input:last-child").val()) {
                        layer.msg(repeateChooseAssignment);
                        flag = false;
                    }
                });
            }
            return flag;
        },
        showMenu: function(e,zTreeId){
            var inputID = e.id;
            inputIdArray = inputID;
            if ($(zTreeId).is(":hidden")) {
                var width = $(e).parent().width();
                $(zTreeId).css("width",width + "px");
                $(window).resize(function() {
                    var width = $(e).parent().width();
                    $(zTreeId).css("width",width + "px");
                })
                $(zTreeId).insertAfter($("#" + inputID));
                $(zTreeId).show();
            } else {
                $(zTreeId).hide();
            }
            $("body").bind("mousedown", msgEdit.onBodyDown);
        },
        hideMenu: function(zTreeId){
            $(zTreeId).fadeOut("fast");
            // $("body").unbind("mousedown", msgEdit.onBodyDown);
        },
        onBodyDown: function(event){
            if (!(event.target.id == "menuBtn" || event.target.id == "zTreeContent" || $(
                event.target).parents("#zTreeContent").length > 0)) {
                msgEdit.hideMenu("#zTreeContent");
            }
            if (!(event.target.id == "menuBtn" || event.target.id == "groupTree" || $(
                event.target).parents("#groupTree").length > 0)) {
                msgEdit.hideMenu("#groupTree");
            }
        },
        editAdd: function(){
            $("#zTreeContent").hide().appendTo($("#zTreeArea"));
            var obj = $("#edit-area").clone(true);
            var html = obj.html() + '<button type="button" class="btn btn-danger edit_Delete"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>';
            obj.attr("id", "edit-area" + group).attr("class","form-group edit-area-marbottom").html(html);
            obj.children("div").children("input").attr("id","zTreeCitySel" + group).val("");
            obj.children("div").children("input").next().attr("id", "assignmentId" + group).attr("value", "");
            obj.appendTo($("#edit-add-area"));
            group++;
            $(".zTreeCitySel").unbind("click").on("click",function(){msgEdit.showMenu(this,"#zTreeContent")});
            var scrollOrNot=function(){
                if($('#edit-object-area .edit-area-marbottom').length>4){
                    $('#edit-object-area').css('overflow-y','scroll')
                }else{
                    $('#edit-object-area').css('overflow-y','visible')
                }
            }
            scrollOrNot()
            $(".edit_Delete").click(function () {
                $("#zTreeContent").hide().appendTo($("#zTreeArea"));
                $(this).parent().remove();
                scrollOrNot();
            });
        },
        peopleAdd: function(){
            var obj = $("#people-area").clone(true);
            var html = obj.html() + '<button type="button" class="btn btn-danger people_Delete"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>';
            obj.attr("id", "people-area" + people).html(html);
            obj.attr("class","form-group");
            var bs=obj.find('.peopleSelect')
            bs.attr("id","professionals" + people);
            bs.val("");
            var tmpPeople=people;
            msgEdit.initDataList(bs, '/clbs/m/infoconfig/infoinput/getProfessionalSelect', '', 
                    function(keyword){msgEdit.checkDoubleChoosePro(keyword.id, "professionals" + tmpPeople);});
            obj.appendTo($("#people-add-area"));
            people++;
            var scrollOrNot=function(){
                if($('#people-add-area>div').length>3){
                    $('#people-object-area').css('overflow-y','scroll')
                }else{
                    $('#people-object-area').css('overflow-y','visible')
                }
            }
            scrollOrNot()
            $(".people_Delete").click(function () {
                $(this).parent().remove();
                scrollOrNot()
            });
        },
        // 初始化分组信息
        initGroup: function(){
            var groupid = $("#groupID").val();
            var groupName = $("#groupName").val();
            var groupids = groupid.split("#");
            var groupNames = groupName.split("#");
            $("#edit-area").children("div").children("input").attr("value",groupNames.length > 0 ? groupNames[0] : "");
            $("#edit-area").children("div").children("input").next().attr("value", groupids.length > 0 ? groupids[0] : "");
            var editHtml = "";
            if (groupNames != null && groupNames.length > 1) {
                for(var i = 1; i < groupNames.length; i++){
                    editHtml += '<div class="form-group edit-area-marbottom" style="margin-bottom: 0px;"><div id="edit-list-area_'+i+'"><label class="col-sm-3 col-md-3 control-label">分组：</label><div class="col-sm-7 col-md-6 form-group assignment-div"><input name="groupName" value="'+ groupNames[i] +'" class="form-control groupName" style="background-color: #fafafa; cursor: pointer;" id="zTree-list_'+i+'" placeholder="请选择组织" readonly /><input id="assignmentId_'+i+'" value="'+ groupids[i] +'" type="hidden" /></div></div><button type="button" class="btn btn-danger edit_Delete_default btnPaddLeft"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button></div>'
                }
            }
            var scrollOrNot=function(){
                if($('#edit-object-area .edit-area-marbottom').length>4){
                    $('#edit-object-area').css('overflow-y','scroll')
                }else{
                    $('#edit-object-area').css('overflow-y','visible')
                }
            }
            
            $("#edit-list").html(editHtml);
            scrollOrNot()
            $(".groupName").unbind("click").on("click",function(){msgEdit.showMenu(this,"#zTreeContent")});
            $(".edit_Delete_default").click(function () {
                $("#zTreeContent").appendTo($("#zTreeArea"));
                $(this).parent().remove();
                scrollOrNot()
            });
        },
        // 初始化从业人员信息
        initProfessional: function(){
            var peopleIds = peopleId.length > 0 ? peopleId.split("#") : null;
            var peopleNames=peopleName.length>0?peopleName.split('#'):null;
            var peopleArea = $("#people-area");
            // 给默认的赋值
            peopleArea.find('.peopleSelect').attr('data-id',(peopleIds !== null && peopleIds.length > 0) ? peopleIds[0] : "");
            peopleArea.find('.peopleSelect').val((peopleNames !== null && peopleNames.length > 0) ? peopleNames[0] : "")
            var obj;
            var html;
            if (null !== peopleIds && peopleIds.length > 0) {
                for (var i=1,peopleIdsLength = peopleIds.length; i<peopleIdsLength; i++) {
                    obj = peopleArea.clone(true);
                    html = obj.html() + '<button type="button" class="btn btn-danger people_Delete"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>';
                    obj.attr("id", "people-area-" + i).html(html);
                    obj.attr("class","form-group");
                    
                    
                    var bs=obj.find('.peopleSelect')
                    bs.attr("id","professionals" + people);
                    bs.attr('data-id',peopleIds[i]);
                    bs.val(peopleNames[i]);
                    var tmpPeople=people;
                    msgEdit.initDataList(bs, '/clbs/m/infoconfig/infoinput/getProfessionalSelect', peopleId, 
                            function(keyword){msgEdit.checkDoubleChoosePro(keyword.id, "professionals" + tmpPeople);});
                    obj.appendTo($("#people-add-area"));
                    people++;

                    var scrollOrNot=function(){
                        if($('#people-add-area>div').length>3){
                            $('#people-object-area').css('overflow-y','scroll')
                        }else{
                            $('#people-object-area').css('overflow-y','visible')
                        }
                    }
                    scrollOrNot()
                    $(".people_Delete").click(function () {
                        $(this).parent().remove();
                        scrollOrNot()
                    });
                }
            }

        },
        validates: function(){
            return $("#editForm").validate({
                rules: {
                    carGroupName : {
                        required : true
                    },
                    vehicleOwnerPhone : {
                        isTel:true
                    },
                    vehicleType : {
                        required : true
                    },
                    deviceGroupName : {
                        required : true
                    },
                    deviceType : {
                        required : true
                    },
                    functionalType : {
                        required : true
                    },
                    iccidSim:{
                        required: false,
                        maxlength:50
                    },
                    simParentGroupName : {
                        required : true
                    },
                    operator: {
                        required: false,
                        maxlength: 50
                    },
                    durDateStr : {
                        compareDate:"#billingDate"
                    }
                },
                messages: {
                    carGroupName : {
                        required : groupNameNull
                    },
                    vehicleOwnerPhone : {
                        isTel:telPhoneError
                    },
                    vehicleType: {
                        required: vehicleTypeNull
                    },
                    deviceGroupName : {
                        required : groupNameNull
                    },
                    deviceType : {
                        required: deviceTypeNull
                    },
                    functionalType : {
                        required : functionalTypeNull
                    },
                    iccidSim:{
                        maxlength: publicSize50
                    },
                    simParentGroupName : {
                        required : groupNameNull
                    },
                    operator: {
                        maxlength: publicSize50
                    },
                    durDateStr:{
                        compareDate: dueDateCompareBillingDate
                    }
                }
            }).form();
        },
        doSubmits: function(){
            if (vehicleFlag) { //判断是否新增车辆
                if (monitorType == 0) {//车
                    if (!msgEdit.check_brand()) {
                        return;
                    }
                } else if (monitorType == 1) {//人
                    if (!msgEdit.check_people_number()) {
                        return;
                    }
                }
            } else { //没有新增，校验是否为空
                if (monitorType == 0) {//车
                                                        //wjk
                    if (!msgEdit.checkIsEmpty("brands", '监控对象不能为空')) {
                        return;
                    }
                } else if (monitorType == 1) {//人
                    if (!msgEdit.checkIsEmpty("brands", personnelNumberNull)) {
                        return;
                    }
                }
            }
            
            if (deviceFlag) { //判断是否新增终端
                if (!msgEdit.check_device()) {
                    return;
                }
            } else { //没有新增，校验是否为空
                if (!msgEdit.checkIsEmpty("devices", deviceNumberSelect)) {
                    return;
                }
            }
            
            if (simFlag) { //判断是否新增sim卡
                if (!msgEdit.check_sim()) {
                    return;
                }
            } else { //没有新增，校验是否为空
                if (!msgEdit.checkIsEmpty("sims", simNumberNull)) {
                    return;
                }
            }
            
            if(msgEdit.validates()){
                $("#simpleQueryParam").val("");
                msgEdit.setAssignmentIds();
                if ($("#groupID").val() == '') {
                    msgEdit.showErrorMsg("请选择分组", "zTreeCitySel");
                    return;
                }
//                if ($("#brands").attr('data-id') == '') {
//                  layer.msg("请选择或新增监控对象");
//                    return;
//                }
//                if ($("#devices").attr('data-id') == '') {
//                  layer.msg("请选择或新增终端");
//                    return;
//                }
//                if ($("#sims").attr('data-id') == '') {
//                  layer.msg("请选择或新增SIM卡");
//                    return;
//                }
                layer.confirm('您确定本次操作吗？', {
                  btn: ['确定','取消'] //按钮
                }, function(){
                    //组装检查是否新增标识值
                    if (vehicleFlag || deviceFlag || simFlag) { //新增
                        $("#checkEdit").val(0);
                        //名称为值
                        $("#hideBrands").val($("#brands").val());
                        $("#hideDevices").val($("#devices").val());
                        $("#hideSims").val($("#sims").val());
                    } else { //修改
                        $("#checkEdit").val(1);
                        //id为值
                        $("#hideBrands").val($("#brands").attr("data-id"));
                        $("#hideDevices").val($("#devices").attr("data-id"));
                        $("#hideSims").val($("#sims").attr("data-id"));
                    }
//                      var form=$("#editForm");
//                      form.find('.hidenSubmitControl').each(function(index,ele){
//                          debugger;
//                      var $this=$(ele);
//                      var $prev=$this.parent().prev();
//                      if($prev.attr('data-id')!=undefined&&$prev.attr('data-id')!=null&&$prev.attr('data-id').length>0){
//                          if ($("#checkEdit").val() == 0) {
//                              $this.attr('name',$prev.attr('name').replace('__','')).val($prev.val())
//                          } else {
//                              $this.attr('name',$prev.attr('name').replace('__','')).val($prev.attr('data-id'))
//                          }
//                      } else {
//                          $this.attr('name',$prev.attr('name').replace('__','')).val($prev.val())
//                      }
//                      
//                    })
                    
                    //组装从业人员id值
                    var proIds = "";
                    $(".peopleSelect").each(function(index,ele){
                        proIds += $(ele).attr("data-id") + ",";
                    })
                    if (monitorType == 1) {
                        //若为人，则把从业人员标签值赋值为空，为了避免传入后台为undefined
                        $("#professionalIds").val("");
                    } else {
                        $("#professionalIds").val(proIds);
                    }
                    
                    //开始旋转
                    // setTimeout(function(){
                    layer.load(2);
                    //},200);
                    $("#editForm").ajaxSubmit(function(message) {
                        var json = eval("("+message+")");
                        if(!json.success){
                            layer.msg(json.msg);
                        }else{
                            $("#commonWin").modal("hide");
                            myTable.refresh()
                        }
                        setTimeout(function(){
                            layer.closeAll();
                        }, 300);
                    });
                });
            }
        },
        // 校验车辆信息(是否为空、是否输入正确、是否已经绑定)
        check_brand: function(){
            var elementId = "brands";
            var maxLength = 10;
            // var errorMsg1 = vehicleBrandNull;

            // wjk
            var errorMsg1 = '监控对象不能为空';
            if (msgEdit.checkIsEmpty(elementId, errorMsg1)
                && msgEdit.checkRightBrand(elementId)
                && msgEdit.checkBrand()) {
                return true;
            } else {
                return false;
            }
        },
        // 校验人员信息(是否为空、是否输入正确、是否已经绑定)
        check_people_number: function(){
            var elementId = "brands";
            var maxLength = 8;
            var errorMsg1 = personnelNumberNull;
            var errorMsg2 = publicSize8Length;
            var errorMsg3 = personnelNumberError;
            var errorMsg4 = personnelNumberExists;
            var reg = /^[A-Za-z0-9\u4e00-\u9fa5_-]{2,20}$/;
            if (msgEdit.checkIsEmpty(elementId, errorMsg1)
                //&& msgEdit.checkLength(elementId, maxLength, errorMsg2)
                && msgEdit.checkIsLegal(elementId, reg, null, errorMsg3)
                && msgEdit.checkPeopleNumber()) {
                return true;
            } else {
                return false;
            }
        },
        //校验终端信息
        check_device: function(){
            var elementId = "devices";
            var maxLength = 20;
            var errorMsg1 = deviceNumberSelect;
            var errorMsg2 = deviceNumberMaxlength;
            var errorMsg3 = deviceNumberError;
            var errorMsg4 = deviceNumberExists;
            var reg = "";
            if(monitorType==0){
                reg = /^[A-Za-z0-9_-]{7,15}$/;
            }else{
                reg = /^[0-9a-zA-Z]{1,20}$/;
            }
            if (msgEdit.checkIsEmpty(elementId, errorMsg1)
                //&& msgEdit.checkLength(elementId, maxLength, errorMsg2)
                && msgEdit.checkIsLegal(elementId, reg, null, errorMsg3)
                && msgEdit.checkDevice()) {
                return true;
            } else {
                return false;
            }

        },
        //校验SIM卡信息
        check_sim: function(){
            var elementId = "sims";
            var maxLength = 14;
            var errorMsg1 = simNumberNull;
            var errorMsg2 = simNumberMaxlength;
            var errorMsg3 = simNumberError;
            var errorMsg4 = simNumberExists;
            var reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
            var reg1 = /^(\d{3,4}-?)?\d{7,9}$/g;
            if (msgEdit.checkIsEmpty(elementId, errorMsg1)
                //&& msgEdit.checkLength(elementId, maxLength, errorMsg2)
                && msgEdit.checkIsLegal(elementId, reg, reg1, errorMsg3)
                && msgEdit.checkSIM()) {
                return true;
            } else {
                return false;
            }
        },
        // 校验是否为空
        checkIsEmpty: function(elementId, errorMsg){
            var value = $("#" + elementId).val();
            if (value == "") {
                msgEdit.hideErrorMsg();
                msgEdit.showErrorMsg(errorMsg, elementId);
                return false;
            } else {
                msgEdit.hideErrorMsg();
                return true;
            }
        },
        // 校验车牌号是否填写规范或者回车时不小心输入了异常字符
        checkRightBrand : function (id) {
            // var errorMsg3 = vehicleBrandError;
            // wjk
            var errorMsg3 = "请输入汉字、字母、数字或短横杠，长度2-20位"
            if(checkBrands(id)){
                msgEdit.hideErrorMsg();
                return true;
            }else{
                msgEdit.showErrorMsg(errorMsg3, id);
                return false;
            }
        },
        // 校验填写数据的合法性
        checkIsLegal: function(elementId, reg, reg1, errorMsg){
            var value = $("#" + elementId).val();
            if (reg1 != null) {
                if(!reg.test(value) && !reg1.test(value)) {
                    msgEdit.showErrorMsg(errorMsg, elementId);
                    return false;
                } else {
                    msgEdit.hideErrorMsg();
                    return true;
                }
            } else {
                if(!reg.test(value)) {
                    msgEdit.showErrorMsg(errorMsg, elementId);
                    return false;
                } else {
                    msgEdit.hideErrorMsg();
                    return true;
                }
            }
        },
        // 校验车牌号是否已存在
        checkBrand: function(){
            var tempFlag = true;
            $.ajax({
                type: 'POST',
                url: '/clbs/m/basicinfo/monitoring/vehicle/repetition',
                data: {"brand": $("#brands").val()},
                dataType: 'json',
                async:false,
                success: function (data) {
                    if (!data) {
                        msgEdit.showErrorMsg(vehicleBrandExists, "brands");
                        tempFlag = false;
                    } else {
                        msgEdit.hideErrorMsg();
                        tempFlag = true;
                    }
                },
                error: function () {
                    layer.msg("车牌号校验异常！", {
                        time: 1500,
                    });
                    tempFlag = false;
                }
            });
            return tempFlag;
        },
        // 校验人员编号是否已存在
        checkPeopleNumber: function(){
            var tempFlag = true;
            $.ajax({
                type: 'POST',
                url: '/clbs/m/basicinfo/monitoring/personnel/repetitionAdd',
                data: {"peopleNumber": $("#brands").val()},
                dataType: 'json',
                async:false,
                success: function (data) {
                    if (!data) {
                        msgEdit.showErrorMsg(personnelNumberExists, "brands");
                        tempFlag = false;
                    } else {
                        msgEdit.hideErrorMsg();
                        tempFlag = true;
                    }
                },
                error: function () {
                    layer.msg("人员编号校验异常！", {
                        time: 1500,
                    });
                    tempFlag = false;
                }
            });
            return tempFlag;
        },
        // 校验终端编号是否已存在
        checkDevice: function(){
            var tempFlag = true;
            $.ajax({
                type: 'POST',
                url: '/clbs/m/basicinfo/equipment/device/repetition',
                data: {"deviceNumber": $("#devices").val()},
                dataType: 'json',
                async:false,
                success: function (data) {
                    if (!data) {
                        msgEdit.showErrorMsg(deviceNumberExists, "devices");
                        tempFlag = false;
                    } else {
                        msgEdit.hideErrorMsg();
                        tempFlag = true;
                    }
                },
                error: function () {
                    layer.msg("终端号校验异常！", {
                        time: 1500,
                    });
                    tempFlag = false;
                }
            });
            return tempFlag;
        },
        // 校验SIM卡号是否已存在
        checkSIM: function(){
            var tempFlag = true;
            $.ajax({
                type: 'POST',
                url: '/clbs/m/basicinfo/equipment/simcard/repetition',
                data: {"simcardNumber": $("#sims").val()},
                dataType: 'json',
                async:false,
                success: function (data) {
                    if (!data) {
                        msgEdit.showErrorMsg(simNumberExists, "sims");
                        tempFlag = false;
                    } else {
                        msgEdit.hideErrorMsg();
                        tempFlag = true;
                    }
                },
                error: function () {
                    layer.msg("SIM卡号校验异常！", {
                        time: 1500,
                    });
                    tempFlag = false;
                }
            });
            return tempFlag;
        },
        // 读取页面选择的分组id
        setAssignmentIds: function(){
            var model = $("#edit-area").children("div");
            var edit = $("#edit-list").children("div");
            var added = $("#edit-add-area").children("div");
            var gid = '';
            if (model != null && model != undefined && model != 'undefined' && model.length > 0) {
                var modelV = model.children("input:last-child").val();
                if (modelV != "") {
                    gid += modelV + "#";
                }
            }
            if (edit != null && edit != undefined && edit != 'undefined' && edit.length > 0) {
                edit.each(function(i){
                    var editV = $(this).children("div").children("div").children("input:last-child").val();
                    if (editV != "") {
                        gid += editV + "#";
                    }
                });
            }
            if (added != null && added != undefined && added != 'undefined' && added.length > 0) {
                added.each(function(i){
                    var addedV = $(this).children("div").children("input:last-child").val();
                    if (addedV != "") {
                        gid += addedV + "#";
                    }
                });
            }
            if (gid.length > 0) {
                gid = gid.substr(0, gid.length - 1);
            }
            $("#groupID").val(gid);
        },
        // 通讯类型
        getDeviceTypeValue: function(deviceTypeIntVal){
            if (deviceTypeIntVal == 0) {
                return "交通部JT/T808-2011(扩展)";
            } else if (deviceTypeIntVal == 1) {
                return "交通部JT/T808-2013";
            }else if (deviceTypeIntVal == 2) {
                return "移为";
            } else if (deviceTypeIntVal == 3) {
                return "天禾";
            } else if(deviceTypeIntVal == 5){
                return "BDTD-SM";
            }else if(deviceTypeIntVal == 6){
                return "KKS";
            }else if(deviceTypeIntVal == 7){
                return "";
            }else if(deviceTypeIntVal == 8){
                return "BSJ-A5";
            }else if(deviceTypeIntVal == 9){
                return "ASO";
            }else if(deviceTypeIntVal == 10){
                return "F3超长待机";
            }else{
                return "";
            }
        },
        // 功能类型
        getFunctionalTypeValue:function(functionalTypeIntVal){
            if (functionalTypeIntVal == 1) {
                return "简易型车机";
            } else if (functionalTypeIntVal == 2) {
                return "行车记录仪";
            } else if (functionalTypeIntVal == 3) {
                return "对讲设备";
            } else if(functionalTypeIntVal == 4){
                return "手咪设备";
            } else if(functionalTypeIntVal == 5){
                return "超长待机设备";
            }else{
                return "";
            }
        }
    }
    $(function(){
        msgEdit.init();
        msgEdit.initGroup();
        $("#edit-add-btn").on("click",msgEdit.editAdd);
        $("#people-add-btn").on("click",msgEdit.peopleAdd);
        $("#doSubmit").on("click",msgEdit.doSubmits);
        $("#zTreeCitySel").on("click",function(){msgEdit.showMenu(this,"#zTreeContent")});
        $(".groupCitySel").on("click",function(){msgEdit.showMenu(this,"#groupTree")});
    })
})($,window)
