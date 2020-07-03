(function (window, $) {
    var submissionFlag = false;
    var simInput = $("#sims");
    var simCardId = $("#simID").val();
    var simCard = $("#simCard").val();
    var numbersth = $("#numbersth").val();  //户号
    var numbersthError = $("#numbersth-error");
    var buildingname = $("#buildingname").val(); //栋号
    var buildingnameError = $("#buildingname-error");
    var roomname = $("#roomname").val(); //房号
    var roomnameError = $("#roomname-error");
    var metertype = $('#metertype').val();

    var deviceFlag = true;
    waterMeterAdd = {
        init: function () {
            var setting = {
                async: {
                    url: "/api/entm/user/oranizationtree/",
                    type: "get",
                    enable: true,
                    autoParam: ["id"],
                    contentType: "application/json",
                    dataType: "json",
                    dataFilter: waterMeterAdd.ajaxDataFilter
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
                    beforeClick: waterMeterAdd.beforeClick,
                    onClick: waterMeterAdd.onClick
                }
            };
            $.fn.zTree.init($("#ztreeDemo"), setting, null);
            // laydate.render({elem: '#installDate', theme: '#6dcff6'});
            // laydate.render({elem: '#procurementDate', theme: '#6dcff6'});
            waterMeterAdd.Initcommunity();
            // waterMeterAdd.InitCallback();
            waterMeterAdd.InitsimsCallback();
        },
        beforeClick: function (treeId, treeNode) {
            var check = (treeNode);
            return check;
        },
        onClick: function (e, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj("ztreeDemo"), nodes = zTree
                .getSelectedNodes(), v = "";
            n = "";
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
            $("body").bind("mousedown", waterMeterAdd.onBodyDown);
        },
        //隐藏菜单
        hideMenu: function () {
            $("#zTreeContent").fadeOut("fast");
            $("body").unbind("mousedown", waterMeterAdd.onBodyDown);
        },
        onBodyDown: function (event) {
            if (!(event.target.id == "menuBtn" || event.target.id == "zTreeContent" || $(
                    event.target).parents("#zTreeContent").length > 0)) {
                waterMeterAdd.hideMenu();
            }
        },
        
        hideErrorMsg: function(){
            $("#error_label").hide();
        },
        Initcommunity: function(){
            //sim卡
            var url="/api/devm/community/getCommunitySelect/";
            var parameter={};
            json_ajax("get",url,"json",true,parameter, waterMeterAdd.initcommunityList);
            
        },
        initcommunityList: function(data){
            console.log(data);
                //集中器list
            var ConcentratorList = data.obj;
            // 初始化集中器数据
            var dataList = {value: []};
            if (ConcentratorList !== null && ConcentratorList.length > 0) {
                for (var i=0; i< ConcentratorList.length; i++) {
                    var obj = {};
                    obj.id = ConcentratorList[i].id;
                    obj.name = ConcentratorList[i].name;
                    dataList.value.push(obj);
                }
                
            }
            $("#communitysel").bsSuggest({
                indexId: 1,  //data.value 的第几个数据，作为input输入框的内容
                indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
                idField: "id",
                keyField: "name",
                effectiveFields: ["name"],
                searchFields:["id"],
                data: dataList
            }).on('onDataRequestSuccess', function (e, result) {
            }).on('onSetSelectValue', function (e, keyword, data) {
                // 当选择集中器
                console.log("select community",keyword.id,data);
                $("#communityid").attr({"value":keyword.id})
                var commut_id = keyword.id;
                var url="/devm/concentrator/getConcentratorByComunityId/";
                
                var parameter={"commut_id": commut_id};
                json_ajax("POST",url,"json",false,parameter, waterMeterAdd.initConcentratorList);
            }).on('onUnsetSelectValue', function () {
            });
        
        },

        InitCallback: function(){
            //sim卡
            var url="/api/devm/concentrator/getConcentratorSelect/";
            var parameter={};
            json_ajax("get",url,"json",true,parameter, waterMeterAdd.initConcentratorList);
            
        },
        initConcentratorList: function(data){
            console.log(data);
            $("#concentrator").attr({"value":data.obj});
                //集中器list
            // var ConcentratorList = data.obj;
            // // 初始化集中器数据
            // var dataList = {value: []};
            // if (ConcentratorList !== null && ConcentratorList.length > 0) {
            //     for (var i=0; i< ConcentratorList.length; i++) {
            //         var obj = {};
            //         obj.id = ConcentratorList[i].id;
            //         obj.name = ConcentratorList[i].name;
            //         dataList.value.push(obj);
            //     }
                
            // }
            // $("#concentrator").bsSuggest({
            //     indexId: 1,  //data.value 的第几个数据，作为input输入框的内容
            //     indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
            //     idField: "id",
            //     keyField: "name",
            //     effectiveFields: ["name"],
            //     searchFields:["id"],
            //     data: dataList
            // }).on('onDataRequestSuccess', function (e, result) {
            // }).on('onSetSelectValue', function (e, keyword, data) {
            //     // 当选择集中器
            //     // var vehicleId = keyword.id;
            //     // var url="/clbs/v/monitoring/command/getCommandParam";
            //     // var minotor = realTimeCommand.getMinotorObj(currentCommandType);
            //     // var parameter={"vid": vehicleId,"commandType":currentCommandType,"isRefer":true,"minotor":minotor};
            //     // json_ajax("POST",url,"json",true,parameter, realTimeCommand.setCommand);
            // }).on('onUnsetSelectValue', function () {
            // });
        
        },
        //组织树预处理函数
        ajaxDataFilter: function (treeId, parentNode, responseData) {
            waterMeterAdd.hideErrorMsg();//隐藏错误提示样式
            var isAdminStr = $("#isAdmin").attr("value");    // 是否是admin
            var isAdmin = isAdminStr == 'true';
            var userGroupId = $("#userGroupId").attr("value");  // 用户所属组织 id
            var userGroupName = $("#userGroupName").attr("value");  // 用户所属组织 name
            //如果根企业下没有节点,就显示错误提示(根企业下不能创建终端)
            if (responseData != null && responseData != "" && responseData != undefined && responseData.length >= 1) {
                if (!isAdmin) { // 不是admin，默认组织为当前组织
                    $("#groupId").val(userGroupId);
                    $("#zTreeOrganSel").val(userGroupName);
                } else { // admin，默认组织为树结构第一个组织
                    $("#groupId").val(responseData[0].uuid);
                    $("#zTreeOrganSel").attr("value", responseData[0].name);
                }
                return responseData;
            } else {
                waterMeterAdd.showErrorMsg("您需要先新增一个组织", "zTreeOrganSel");
                return;
            }
        },

        InitsimsCallback: function(){
            //sim卡
            if(metertype != 0)
                return;
            waterMeterAdd.initSimCard("/api/devm/simcard/getIMEISelect/?format=json");
            
        },
        initSimCard: function (url) {
            waterMeterAdd.initDataList(simInput, url, simCardId,waterMeterAdd.simsChange);
        },
        simsChange: function (keyword) {
            // datas = keyword.key;
            // json_ajax("POST", "/devm/getSimcardInfoBySimcardNumber/", "json", true,
            //     {simcardNumber: datas}, addMeterManagement.simsChangeCallback);
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
                type: "get",
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
                    }).on("click",function(){
                    }).on('onSetSelectValue', function (e, keyword, data) {
                        if(callback){
                            dataInput.closest('.form-group').find('.dropdown-menu').hide()
                            callback(keyword)
                        }
                        //限制输入
                        waterMeterAdd.showHideValueCase(0,dataInput);
                        waterMeterAdd.hideErrorMsg();
                    }).on('onUnsetSelectValue', function () {
                        //放开输入
                        waterMeterAdd.showHideValueCase(1,dataInput);
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
        doSubmit: function () {
            if (submissionFlag) {  // 防止重复提交
                console.log("repete??")
                return;
            } else {
                
                // waterMeterAdd.nameValidates(0);
                console.log("deviceFlag=",deviceFlag)

                if ( deviceFlag) {
                    if (waterMeterAdd.validates()) {
                        
                        $("#addForm").ajaxSubmit(function (data) {
                            var json = eval("(" + data + ")");
                            if (json.success) {
                                submissionFlag = true;
                                $("#commonWin").modal("hide");
                                layer.msg("新建水表成功");
                                myTable.requestData();
                            } else {
                                layer.msg(json.msg+",failed!");
                            }
                        });
                    }
                }
            }
        },
        nameValidates: function (num) {
        
            numbersth = $("#numbersth").val();
            buildingname = $("#buildingname").val()
            roomname = $("#roomname").val()
            
            console.log(numbersth)
            console.log(buildingname)
            console.log(buildingname)
            var judge = true;
            if (numbersth == "" && num==1) {
                numbersthError.html("请输入小区名称");
                numbersthError.show();
                judge = false;
            } 
            if (buildingname == "" && num==2) {
                buildingnameError.html("请输入栋号");
                buildingnameError.show();
                judge = false;
            }
            if (roomname == "" && num==3) {
                roomnameError.html("请输入房号");
                roomnameError.show();
                judge = false;
            }
            if(num == 0)
            {
                if (numbersth == "") {
                    numbersthError.html("请输入小区名称");
                    numbersthError.show();
                    judge = false;
                } 
                if (buildingname == "") {
                    buildingnameError.html("请输入栋号");
                    buildingnameError.show();
                    judge = false;
                }
                if (roomname == "") {
                    roomnameError.html("请输入房号");
                    roomnameError.show();
                    judge = false;
                }
            }
            if(judge)
            {
                waterMeterAdd.deviceAjax();
            }
            
        },
        validates: function () {
            return $("#addForm").validate({
                rules: {
                    
                    numbersth: {
                        required: true
                    },
                    buildingname: {
                        required: true
                    },
                    roomname: {
                        required: true
                    },
                    belongto: {
                        required: true
                    },
                    vconcentrator1:{
                        required:true
                    }
                    
                },
                messages: {
                    numbersth: {
                        required: "户号不能为空",
                    },
                    buildingname: {
                        required: "请输入栋号",
                    },
                    roomname: {
                        required: "请输入房号",
                    },
                    belongto: {
                        required: "所属组织不能为空",
                        maxlength: publicSize50
                    },
                    vconcentrator1: {
                        required: "至少选择一个集中器",
                        
                    },
                    
                },
                submitHandler: function (form) {
                    // var typeVal = $("#deviceType").val();
                    // var name = $("#name").val();
                    // if (typeVal == "5") {
                    //     $("#name-error").html("请输入终端号，范围：1~20");
                    //     var reg = /^(?=.*[0-9a-zA-Z])[0-9a-zA-Z-]{1,20}$/;
                    //     if (!reg.test(name)) {
                    //         alert("请输入终端号，范围：1~20");
                    //         return;
                    //     }
                    // }
                }
            }).form();
        },
        
        showErrorMsg: function (msg, inputId) {
            if ($("#error_label_add").is(":hidden")) {
                $("#error_label_add").text(msg);
                $("#error_label_add").insertAfter($("#" + inputId));
                $("#error_label_add").show();
            } else {
                $("#error_label_add").is(":hidden");
            }
        },
        //错误提示信息隐藏
        hideErrorMsg: function () {
            $("#error_label_add").is(":hidden");
            $("#error_label_add").hide();
        },
        deviceAjax: function () {
            $.ajax({
                    type: "post",
                    url: "/wirelessm/communitymeter/repetition/",
                    data: {"numbersth": numbersth,"buildingname":buildingname,"roomname":roomname},
                    success: function (d) {
                        var result = $.parseJSON(d);
                        // if (!result) {
                        if (result.success == false) {
                            numbersthError.html("小区名称已存在！");
                            numbersthError.show();
                            deviceFlag = false;
                        }
                        else {
                            numbersthError.hide();
                            deviceFlag = true;
                            console.log("deviceFlag=",deviceFlag)
                        }
                    }
                }
            )
        },
        
    }
    $(function () {
        $('input').inputClear();
        //初始化
        waterMeterAdd.init();
        
        $('input').inputClear();

        // $("#numbersth").on("change", function () {
        //     // numbersth = $("#numbersth").val();
        //     waterMeterAdd.nameValidates(1);
        // });
        // $("#buildingname").on("change", function () {
        //     // numbersth = $("#numbersth").val();
        //     waterMeterAdd.nameValidates(2);
        // });
        // $("#roomname").on("change", function () {
        //     // numbersth = $("#numbersth").val();
        //     waterMeterAdd.nameValidates(3);
        // });

        $("#metertype").on("change",function(){
            var     metertype = $("#metertype").val();
            console.log(metertype)
            if(metertype == 0){

                waterMeterAdd.InitsimsCallback();
                simInput.removeAttr('disabled');
                simInput.next().find('button').removeAttr('disabled');

                simInput.next().find('button').removeClass('disabled loading-state-button').find('i').attr("class", 'caret');

            }
            else{
                // $("#simID").attr("disabled", true);
                simInput.val('');
                simInput.attr('disabled','disabled');
                simInput.next().find('button').removeClass('loading-state-button')
                simInput.next().find('button').attr('disabled','disabled');
                
                // simInput.next().find('button').addclass('disabled loading-state-button').find('i').attr("class", 'caret');
            }
        });
        
        
        // $("#numbersth,#buildingname,#roomname").bind("input propertychange change", function (event) {
        //     numbersth = $("numbersth").val();
        //     buildingname = $("#buildingname").val()
        //     roomname = $("#roomname").val()
        //     $.ajax({
        //             type: "post",
        //             url: "/wirelessm/communitymeter/repetition/",
        //             data: {"numbersth": numbersth,"buildingname":buildingname,"roomname":roomname},
        //             success: function (d) {
        //                 var result = $.parseJSON(d);
        //                 if (!result) {
        //                     numbersthError.html("该户号已存在！");
        //                     numbersthError.show();
        //                     deviceFlag = false;
        //                 }
        //                 else {
        //                     waterMeterAdd.nameValidates();
        //                 }
        //             }
        //         }
        //     )
        // });

        //显示菜单
        $("#zTreeOrganSel").bind("click", waterMeterAdd.showMenu);
        //提交
        $("#doSubmit").bind("click", waterMeterAdd.doSubmit);
    })
})(window, $)
