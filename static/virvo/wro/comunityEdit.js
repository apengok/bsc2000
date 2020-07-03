(function (window, $) {
    var submissionFlag = false;
    
    var name = $("#name").val();
    var nameError = $("#name-error");
    var deviceFlag = false;
    editConmunityManagement = {
        init: function () {
            var setting = {
                async: {
                    url: "/entm/user/oranizationtree/",
                    tyoe: "post",
                    enable: true,
                    autoParam: ["id"],
                    contentType: "application/json",
                    dataType: "json",
                    dataFilter: editConmunityManagement.ajaxDataFilter
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
                    beforeClick: editConmunityManagement.beforeClick,
                    onClick: editConmunityManagement.onClick
                }
            };
            $.fn.zTree.init($("#ztreeDemo"), setting, null);
            // laydate.render({elem: '#installDate', theme: '#6dcff6'});
            // laydate.render({elem: '#procurementDate', theme: '#6dcff6'});
            editConmunityManagement.InitCallback();
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
            $("body").bind("mousedown", editConmunityManagement.onBodyDown);
        },
        //隐藏菜单
        hideMenu: function () {
            $("#zTreeContent").fadeOut("fast");
            $("body").unbind("mousedown", editConmunityManagement.onBodyDown);
        },
        onBodyDown: function (event) {
            if (!(event.target.id == "menuBtn" || event.target.id == "zTreeContent" || $(
                    event.target).parents("#zTreeContent").length > 0)) {
                editConmunityManagement.hideMenu();
            }
        },
        
        hideErrorMsg: function(){
            $("#error_label").hide();
        },
        InitCallback: function(){
            //sim卡
            var url="/devm/concentrator/getConcentratorSelect/";
            var parameter={};
            json_ajax("POST",url,"json",true,parameter, editConmunityManagement.initConcentratorList);
            
        },
        initConcentratorList: function(data){
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
            $("#concentrator1,#concentrator2,#concentrator3,#concentrator4").bsSuggest({
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
                // var vehicleId = keyword.id;
                // var url="/clbs/v/monitoring/command/getCommandParam";
                // var minotor = realTimeCommand.getMinotorObj(currentCommandType);
                // var parameter={"vid": vehicleId,"commandType":currentCommandType,"isRefer":true,"minotor":minotor};
                // json_ajax("POST",url,"json",true,parameter, realTimeCommand.setCommand);
            }).on('onUnsetSelectValue', function () {
            });
        
        },

        
        //组织树预处理函数
        ajaxDataFilter: function (treeId, parentNode, responseData) {
            editConmunityManagement.hideErrorMsg();//隐藏错误提示样式
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
                editConmunityManagement.showErrorMsg("您需要先新增一个组织", "zTreeOrganSel");
                return;
            }
        },
        doSubmit: function () {
            if (submissionFlag) {  // 防止重复提交
                return;
            } else {
                name = $("#name").val();
                console.log("doSubmit");
                editConmunityManagement.nameValidates();
                if ($("#name").val() != "" && deviceFlag) {
                    if (editConmunityManagement.validates()) {
                        submissionFlag = true;
                        $("#editForm").ajaxSubmit(function (data) {
                            var json = eval("(" + data + ")");
                            if (json.success) {
                                $("#commonWin").modal("hide");
                                myTable.requestData();
                            } else {
                                layer.msg(json.msg);
                            }
                        });
                    }
                }
            }
        },
        nameValidates: function () {
        
            var name = $("#name").val();
            var sn = /^[A-Za-z0-9]+$/;;
            
            if (name == "") {
                nameError.html("请输入小区名称");
                nameError.show();
                deviceFlag = false;
            }else {
                editConmunityManagement.deviceAjax();
            }
            
        },
        validates: function () {
            return $("#editForm").validate({
                rules: {
                    
                    name: {
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
                    name: {
                        required: "集中器名称不能为空",
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
            edit_name = $("#name").val();
            if(old_name != edit_name){
                $.ajax({
                        type: "post",
                        url: "/dmam/community/repetition/",
                        data: {name: name},
                        success: function (d) {
                            var result = $.parseJSON(d);
                            // if (!result) {
                            if (result.success == false) {
                                nameError.html("小区名称已存在！");
                                nameError.show();
                                deviceFlag = false;
                            }
                            else {
                                nameError.hide();
                                deviceFlag = true;
                            }
                        }
                    }
                )
            }else{
                deviceFlag = true;
            }
        },
        
    }
    $(function () {
        $('input').inputClear();
        //初始化
        editConmunityManagement.init();
        
        $('input').inputClear();

        $("#name").on("change", function () {
            name = $("#name").val();
            editConmunityManagement.nameValidates();
        });
        
        $("#name").bind("input propertychange change", function (event) {
            name = $(this).val();
            $.ajax({
                    type: "post",
                    url: "/dmam/community/repetition/",
                    data: {name: name},
                    success: function (d) {
                        var result = $.parseJSON(d);
                        if (!result) {
                            nameError.html("小区名称已存在！");
                            nameError.show();
                            deviceFlag = false;
                        }
                        else {
                            editConmunityManagement.nameValidates();
                        }
                    }
                }
            )
        });

        //显示菜单
        $("#zTreeOrganSel").bind("click", editConmunityManagement.showMenu);
        //提交
        $("#doSubmit").bind("click", editConmunityManagement.doSubmit);
    })
})(window, $)
