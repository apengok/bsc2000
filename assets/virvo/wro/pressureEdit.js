(function(window,$){
    var bindId = $("#bindId").val();
    var simInput = $("#sims");
    var simCardId = $("#commaddr").val();
    var simCard = $("#simCard").val();
    var installTime = $("#installTime").val();
    var serialnumber = $("#serialnumber").val();
    var oldDeviceNumber = $("#serialnumber").val();
    var deviceType = $("#deviceType").val();
    var serialnumberError = $("#serialnumber-error");
    var deviceFlag = false;
    var fts="";
    
    editpressureManagement = {
        init: function () {
            if (bindId != null && bindId != '') {
                $("#serialnumber").attr("readonly", true);
                $("#deviceType").attr("disabled", true);
                $("#bindMsg").attr("hidden", false);
            }
            var setting = {
                async: {
                    url: "/entm/user/oranizationtree/",
                    type: "GET",
                    enable: true,
                    autoParam: ["id"],
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
                    beforeClick: editpressureManagement.beforeClick,
                    onClick: editpressureManagement.onClick
                }
            };
            $.fn.zTree.init($("#ztreeDemo"), setting, null);
            fts = $("#functionalType").val();//获取当前终端通讯类型
            // laydate.render({elem: '#installDateEdit', theme: '#6dcff6'});
            // laydate.render({elem: '#procurementDateEdit', theme: '#6dcff6'});
            editpressureManagement.InitCallback();

            $("#metertype option").each(function (){
                if($(this).val()==metertype){ 
                $(this).attr("selected","selected"); 
            }});
            $("#protocol option").each(function (){
                if($(this).val()==protocol){ 
                $(this).attr("selected","selected"); 
            }});
            $("#check_cycle option").each(function (){
                if($(this).val()==check_cycle){ 
                $(this).attr("selected","selected"); 
            }});
            $("#dn option").each(function (){
                if($(this).val()==dn){ 
                $(this).attr("selected","selected"); 
            }});
            
            // var coorType_old = $("#coortypeVal").val();
            $("#coorType option").each(function (){
                if($(this).val()==coorType_old){ 
                $(this).attr("selected","selected"); 
            }});

            $('input:radio[name="state"]').filter('[value="'+state+'"]').attr('checked', true);
        },
        beforeClick: function (treeId, treeNode) {
            var check = (treeNode);
            return check;
        },
        onClick: function (e, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj("ztreeDemo"), nodes = zTree
                .getSelectedNodes(), n = "";
            v = "";
            nodes.sort(function compare(a, b) {
                return a.id - b.id;
            });
            for (var i = 0, l = nodes.length; i < l; i++) {
                n += nodes[i].name;
                v += nodes[i].uuid + ",";
            }
            if (v.length > 0)
                v = v.substring(0, v.length - 1);
            var cityObj = $("#zTreeOrganSel");
            cityObj.attr("value", v);
            cityObj.val(n);
            $("#groupId").val(v);
            $("#zTreeContent").hide();
        },
        //显示菜单
        showMenu: function () {
            if ($("#zTreeContent").is(":hidden")) {
                var inpwidth = $("#zTreeOrganSel").width();
                var spwidth = $("#zTreeOrganSelSpan").width();
                var allWidth = inpwidth + spwidth + 21;
                if (navigator.appName == "Microsoft Internet Explorer") {
                    $("#zTreeContent").css("width", (inpwidth + 7) + "px");
                } else {
                    $("#zTreeContent").css("width", allWidth + "px");
                }
                $(window).resize(function () {
                    var inpwidth = $("#zTreeOrganSel").width();
                    var spwidth = $("#zTreeOrganSelSpan").width();
                    var allWidth = inpwidth + spwidth + 21;
                    if (navigator.appName == "Microsoft Internet Explorer") {
                        $("#zTreeContent").css("width", (inpwidth + 7) + "px");
                    } else {
                        $("#zTreeContent").css("width", allWidth + "px");
                    }
                })
                $("#zTreeContent").show();
            } else {
                $("#zTreeContent").hide();
            }
            $("body").bind("mousedown", editpressureManagement.onBodyDown);
        },
        hideMenu: function () {
            $("#zTreeContent").fadeOut("fast");
            $("body").unbind("mousedown", editpressureManagement.onBodyDown);
        },
        onBodyDown: function (event) {
            if (!(event.target.id == "menuBtn" || event.target.id == "zTreeContent" || $(
                    event.target).parents("#zTreeContent").length > 0)) {
                editpressureManagement.hideMenu();
            }
        },
        serialnumberValidates: function () {
            var serialnumber = $("#serialnumber").val();
            var sn = /^[A-Za-z0-9]+$/;;
            
            if (serialnumber == "") {
                serialnumberError.html("请输入表具编号，长度12，大写字母或数字");
                serialnumberError.show();
                deviceFlag = false;
            }else if (!(serialnumber.length <= 12 && sn.test(serialnumber))) {
                serialnumberError.html("请输入表具编号，长度12，大写字母或数字");
                serialnumberError.show();
                deviceFlag = false;
            }else {
                console.log("deviceAjax")
                editpressureManagement.deviceAjax();
            }
            
        },
        deviceAjax: function () {
            serialnumber = $("#serialnumber").val();
            if (oldDeviceNumber != serialnumber) {
                $.ajax({
                        type: "post",
                        url: "/devm/pressure/pressure_repetition/",
                        data: {serialnumber: serialnumber},
                        success: function (d) {
                            var result = $.parseJSON(d);
                            if (!result) {
                                serialnumberError.html("终端号已存在！");
                                serialnumberError.show();
                                deviceFlag = false;
                            }
                            else {
                                serialnumberError.hide();
                                deviceFlag = true;
                            }
                        }
                    }
                )
            }else{
                deviceFlag = true;
            }
        },
        validates: function(){
             return $("#editForm").validate({
                 rules : {
                 /*serialnumber : {
                    required : true,
                    checkDeviceNumber : "#deviceType",                  
                    isRightfulString : true,
                    remote: {
                        type:"post",
                        async:false,
                        url:"/clbs/m/basicinfo/equipment/device/repetition" ,
                        dataType:"json",
                        data:{
                              username:function(){return $("#serialnumber").val();}
                         },
                         dataFilter: function(data, type) {
                             var oldV = $("#scn").val();
                            var newV = $("#serialnumber").val();
                            var data2 = data;
                            if (oldV == newV) {
                                return true;
                            } else {
                                if (data2 == "true"){
                                        return true;
                                 } else {
                                        return false;
                                 }
                            }
                          }
                       }
                },*/
                belongto: {
                        required: true
                    },
                    simid: {
                        required: true,
                        maxlength: 50
                    },
                    metertype: {
                        required: true,
                        maxlength: 50
                    },
                    // isVideo: {
                    //     maxlength: 6
                    // },
                    protocol: {
                        maxlength: 64
                    },
                    check_cycle: {
                        maxlength: 11
                    },
                    dn: {
                        required: false,
                        maxlength: 6
                    },
                    // manuFacturer: {
                    //     maxlength: 100
                    // },
                    
            },
            messages : {
                /*serialnumber : {
                    required: serialnumberNull,
                    checkDeviceNumber : serialnumberError,
                    isRightfulString :  serialnumberError,
                    remote: serialnumberExists
                },*/
                belongto: {
                        required: "所属组织不能为空",
                        maxlength: publicSize50
                    },
                    simid: {
                        required: publicNull
                    },
                    metertype: {
                        required: deviceTypeNull,
                        maxlength: publicSize50
                    },
                    protocol: {
                        required: publicNull,
                        maxlength: publicSize50
                    },
                    check_cycle: {
                        maxlength: publicSize6
                    },
                    dn: {
                        maxlength: publicSize64
                    },
                    
           }}).form();
        },
        //显示或隐藏输入框
        showHideValueCase: function(type,dataInput){
            var dataInputType = dataInput.selector;
            if (type == 0) {//限制输入
                
                if ("#sims" == dataInputType) { //sim卡限制
                    $(".simsList").attr("readonly",true);
                    $("#simParentGroupName").css("background-color","");
                    $("#simGroupDiv").css("display","block");
                    $("#operatorTypeDiv").css("display","block");
                    simFlag = false;
                }
            } else if (type == 1) {//放开输入
                
                if ("#sims" == dataInputType) { //sim卡放开
                    $(".simsList").removeAttr("readonly");
                    $("#simParentGroupName").css("background-color","#fafafa");
                    $("#simGroupDiv").css("display","none");
                    $("#operatorTypeDiv").css("display","none");
                    simFlag = true;
                }
            }
        },
        hideErrorMsg: function(){
            $("#error_label").hide();
        },
        InitCallback: function(){
            //sim卡
            editpressureManagement.initSimCard("/api/devm/simcard/getSimcardSelect/");
            
        },
        initSimCard: function (url) {
            editpressureManagement.initDataList(simInput, url, simCardId,editpressureManagement.simsChange);
        },
        simsChange: function (keyword) {
            // datas = keyword.key;
            // json_ajax("POST", "/devm/getSimcardInfoBySimcardNumber/", "json", true,
            //     {simcardNumber: datas}, editpressureManagement.simsChangeCallback);
        },
        simsChangeCallback: function(data){
            if(data.success){
                console.log("simsChangeCallback");
                // $("#iccidSim").val(data.obj.simcardInfo.ICCID);
                // $("#simParentGroupName").val(data.obj.simcardInfo.groupName);
                // $("#operator").val(data.obj.simcardInfo.operator);
                // $("#simFlow").val(data.obj.simcardInfo.simFlow);
                // $("#openCardTime").val(data.obj.simcardInfo.openCardTime);
            }else{
                layer.msg(data.msg);
            }
        },
        initDataList: function (dataInput, urlString, id, callback,moreCallback) {
            console.log(dataInput,id);
            // if(id.indexOf('#')<0){
            //     dataInput.attr('data-id',id);
            // }
            //if(dataInput.attr('name').indexOf('_')<0){
            //  dataInput.attr('name',dataInput.attr('name')+'__');
            //}
            $.ajax({
                type: "GET",
                url: urlString,
                data: {},   //{configId: $("#configId").val()},
                dataType: "json",
                success: function (data) {
                    var itemList = data.obj;
                    console.log(itemList);
                    var suggest=dataInput.bsSuggest({
                        indexId: 1,  //data.value 的第几个数据，作为input输入框的内容
                        indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
                        data: {value:itemList},
                        idField: "id",
                        keyField: "name",
                        effectiveFields: ["name"]
                    }).on('onDataRequestSuccess', function (e, result) {
                    }).on("focus", function() {
                        
                        dataInput.siblings('i.delIcon').remove();
                    }).on("click",function(){
                        // dataInput.siblings('i.delIcon').remove();
                    }).on('onSetSelectValue', function (e, keyword, data) {
                        console.log("onSetSelectValue")
                        if(callback){
                            dataInput.closest('.form-group').find('.dropdown-menu').hide()
                            callback(keyword)
                        }
                        $("#commaddr").attr({"value":keyword.key})
                        //限制输入
                        editpressureManagement.showHideValueCase(0,dataInput);
                        editpressureManagement.hideErrorMsg();
                    }).on('onUnsetSelectValue', function () {
                        //放开输入
                        console.log("onUnsetSelectValue")

                        editpressureManagement.showHideValueCase(1,dataInput);
                    });
                    
                    dataInput.next().find('button').removeClass('disabled loading-state-button').find('i').attr("class", 'caret');
                    if(moreCallback){
                        moreCallback()
                    }
                }
            });
        },
        //提交
        doSubmit: function(){
            deviceType = $("#deviceType").val();
            serialnumber = $("#serialnumber").val();
            editpressureManagement.serialnumberValidates();
            if ($("#serialnumber").val() != "" && deviceFlag) {
                if (editpressureManagement.validates()) {
                    $("#editForm").ajaxSubmit(function (data) {
                        var json = eval("(" + data + ")");
                        if (json.success) {
                            $("#commonWin").modal("hide");
                            myTable.refresh();
                        } else {
                            layer.msg(json.msg);
                        }
                    });
                }
                ;
            }
        },
        
        
    }
    $(function(){
        $('input').inputClear();
        editpressureManagement.init();
        
        //显示菜单
        $("#zTreeOrganSel").bind("click",editpressureManagement.showMenu);
        $("#installTime").val(installTime!=null?installTime.substr(0, 10):"");
        //表单提交
        $("#doSubmit").bind("click",editpressureManagement.doSubmit);
        // $("#deviceType").on("change", function () {
        //     deviceType = $(this).val();
        //     serialnumber = $("#serialnumber").val();
        //     editpressureManagement.serialnumberValidates();
        // })
        
        $("#serialnumber").bind("input propertychange change", function (event) {
            deviceType = $("#deviceType").val();
            serialnumber = $(this).val();
            if (oldDeviceNumber != serialnumber){
                $.ajax({
                        type: "post",
                        url: "/devm/pressure/pressure_repetition/",
                        data: {serialnumber: serialnumber},
                        success: function (d) {
                            var result = $.parseJSON(d);
                            if (!result) {
                                serialnumberError.html("终端号已存在！");
                                serialnumberError.show();
                                deviceFlag = false;
                            }
                            else {
                                editpressureManagement.serialnumberValidates();
                            }
                        }
                    }
                )
            }else{
                serialnumberError.hide();
                deviceFlag = true;

            }
        });
    })
})(window,$)
