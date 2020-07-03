(function (window, $) {
    var submissionFlag = false;
    addSimCardManagement = {
        init: function () {
            var setting = {
                async: {
                    url: "/entm/user/oranizationtree/",
                    tyoe: "post",
                    enable: true,
                    autoParam: ["id"],
                    contentType: "application/json",
                    dataType: "json",
                    dataFilter: addSimCardManagement.ajaxDataFilter
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
                    beforeClick: addSimCardManagement.beforeClick,
                    onClick: addSimCardManagement.onClick

                }
            };
            $.fn.zTree.init($("#ztreeDemo"), setting, null);
            laydate.render({elem: '#openCardTime',theme: '#6dcff6'});
            laydate.render({elem: '#endTime',theme: '#6dcff6'});
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
        showMenu: function (e) {
            if ($("#zTreeContent").is(":hidden")) {
                var inpwidth = $("#zTreeOrganSel").width();
                var spwidth = $("#zTreeOrganSelSpan").width();
                var allWidth = inpwidth + spwidth + 21;
                if(navigator.appName=="Microsoft Internet Explorer") {
                    $("#zTreeContent").css("width",(inpwidth+7) + "px");
                }else{
                    $("#zTreeContent").css("width", allWidth + "px");
                }
                $(window).resize(function() {
                    var inpwidth = $("#zTreeOrganSel").width();
                    var spwidth = $("#zTreeOrganSelSpan").width();
                    var allWidth = inpwidth + spwidth + 21;
                    if(navigator.appName=="Microsoft Internet Explorer") {
                        $("#zTreeContent").css("width",(inpwidth+7) + "px");
                    }else{
                        $("#zTreeContent").css("width", allWidth + "px");
                    }
                })
                $("#zTreeContent").show();
            } else {
                $("#zTreeContent").hide();
            }
            $("body").bind("mousedown", addSimCardManagement.onBodyDown);
        },
        hideMenu: function () {
            $("#zTreeContent").fadeOut("fast");
            $("body").unbind("mousedown", addSimCardManagement.onBodyDown);
        },
        onBodyDown: function (event) {
            if (!(event.target.id == "menuBtn" || event.target.id == "zTreeContent" || $(
                    event.target).parents("#zTreeContent").length > 0)) {
                addSimCardManagement.hideMenu();
            }
        },
        //组织树预处理函数
        ajaxDataFilter: function (treeId, parentNode, responseData) {
            addSimCardManagement.hideErrorMsg();//隐藏错误提示样式
            var isAdminStr = $("#isAdmin").attr("value");    // 是否是admin
            var isAdmin = isAdminStr == 'true';
            var userGroupId = $("#userGroupId").attr("value");  // 用户所属组织 id
            var userGroupName = $("#userGroupName").attr("value");  // 用户所属组织 name
            //如果根企业下没有节点,就显示错误提示(根企业下不能创建Sim卡)
            if(responseData != null && responseData != "" && responseData != undefined && responseData.length >= 1){
                if (!isAdmin) { // 不是admin，默认组织为当前组织
                    $("#groupId").val(userGroupId);
                    $("#zTreeOrganSel").val(userGroupName);
                } else { // admin，默认组织为树结构第一个组织
                    $("#groupId").val(responseData[0].uuid);
                    $("#zTreeOrganSel").attr("value", responseData[0].name);
                }
                return responseData;
            }else{
                addSimCardManagement.showErrorMsg("您需要先新增一个组织","zTreeOrganSel");
                return;
            }

        },
        validates: function () {
            return $("#addForm").validate({
                rules: {
                    simcardNumber: {
                        required: true,
                        // isSim: true,
                        remote: {
                            type: "post",
                            async: false,
                            url: "/devm/simcard/repetition/",
                            data: {
                                username: function () {
                                    return $("#simcardNumber").val();
                                }
                            }
                        }
                    },
                    belongto: {
                        required: true
                    },
                    isStart: {
                        required: false,
                        maxlength: 6
                    },
                    operator: {
                        required: false,
                        maxlength: 50
                    },
                    openCardTime: {
                        required: false
                    },
                    capacity: {
                        required: false,
                        maxlength: 20
                    },
                    simFlow: {
                        required: false,
                        maxlength: 20
                    },
                    // useFlow: {
                    //     maxlength: 20
                    // },
                    // alertsFlow: {
                    //     required: false,
                    //     maxlength: 20
                    // },
                    endTime: {
                        required: false,
                        compareDate: "#openCardTime"
                    },
                    // correctionCoefficient:{
                    //     required: false,
                    //     isRightNumber:true,
                    //     isInt1tov:200,
                    // },
                    // forewarningCoefficient:{
                    //     required: false,
                    //     isRightNumber:true,
                    //     isInt1tov:200,
                    // },
                    // hourThresholdValue:{
                    //     range:[0,6553]
                    // },
                    // dayThresholdValue:{
                    //     range:[0,429496729]
                    // },
                    // monthThresholdValue:{
                    //     range:[0,429496729]
                    // },
                    iccid:{
                        required: false,
                        maxlength:50
                    },
                    imsi:{
                        required: false,
                        maxlength:50
                    },
                    imei:{
                        required: false,
                        maxlength:20
                    },
                    remark: {
                        maxlength: 50
                    }
                },
                messages: {
                    simcardNumber: {
                        required: simNumberError,
                        // isSim: simNumberError,
                        remote: simNumberExists
                    },
                    belongto: {
                        required: publicNull
                    },
                    isStart: {
                        required: publicNull,
                        maxlength: publicSize6
                    },
                    operator: {
                        required:publicNull,
                        maxlength: publicSize50
                    },
                    openCardTime: {
                        required: publicNull,
                    },
                    capacity: {
                        required: publicNull,
                        maxlength: publicSize20
                    },
                    simFlow: {
                        required: publicNull,
                        maxlength: publicSize20
                    },
                    // useFlow: {
                    //     maxlength: publicSize20
                    // },
                    alertsFlow: {
                        required: publicNull,
                        maxlength: publicSize20
                    },
                    endTime: {
                        required: publicNull,
                        compareDate: simCompareOpenCardTime
                    },
                    // forewarningCoefficient:{
                    //     isRightNumber:publicNumberInt,
                    //     isInt1tov:simMax200Length,
                    // },
                    // correctionCoefficient:{
                    //     isRightNumber:publicNumberInt,
                    //     isInt1tov:simMax200Length,
                    // },
                    // hourThresholdValue:{
                    //     range:simHourTrafficLength
                    // },
                    // dayThresholdValue:{
                    //     range:simDayTrafficLength
                    // },
                    // monthThresholdValue:{
                    //     range:simMonthTrafficLength
                    // },
                    iccid:{
                        maxlength:publicSize50
                    },
                    imsi:{
                        maxlength:publicSize50
                    },
                    imei:{
                        maxlength:publicSize50
                    },
                    remark: {
                        maxlength: publicSize50
                    }
                }
            }).form();
        },
        doSubmit: function () {
            if (submissionFlag) {
                return;
            } else {
                if (addSimCardManagement.validates()) {
                    submissionFlag = true;
                    $("#addForm").ajaxSubmit(function (data) {
                        var json = eval("("+data+")");
                        if(json.success){
                            $("#commonWin").modal("hide");
                            myTable.requestData();
                        }else{
                            layer.msg(json.msg);
                        }
                    });
                }
                ;
            }
        },
        showErrorMsg: function(msg, inputId){
            if ($("#error_label_add").is(":hidden")) {
                $("#error_label_add").text(msg);
                $("#error_label_add").insertAfter($("#" + inputId));
                $("#error_label_add").show();
            } else {
                $("#error_label_add").is(":hidden");
            }
        },
        //错误提示信息隐藏
        hideErrorMsg: function(){
            $("#error_label_add").is(":hidden");
            $("#error_label_add").hide();
        },
    }
    $(function () {
        $('input').inputClear();
        addSimCardManagement.init();
        $("#forewarningCoefficient").bind('input oninput', function() {
            $("#alertsFlow").val((Number($("#forewarningCoefficient")[0].value)/100*Number($("#monthThresholdValue")[0].value)).toFixed(2))
            if($("#alertsFlow").val()=="NaN"){
                $("#alertsFlow").val(0)
            }
        });
        $("#monthThresholdValue").bind('input oninput', function() {
            $("#alertsFlow").val((Number($("#forewarningCoefficient")[0].value)/100*Number($("#monthThresholdValue")[0].value)).toFixed(2))
            if($("#alertsFlow").val()=="NaN"){
                $("#alertsFlow").val(0)
            }
        });
        //显示菜单
        $("#zTreeOrganSel").bind("click", addSimCardManagement.showMenu);
        //提交
        $("#doSubmit").bind("click", addSimCardManagement.doSubmit);
    })
})(window, $)
