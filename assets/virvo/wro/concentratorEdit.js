(function (window, $) {
    var submissionFlag = false;
    var simInput = $("#sims");
    var simCardId = $("#simID").val();
    var old_name = $("#name").val();
    var nameError = $("#name-error");
    var commaddrError = $("#commaddr-error");
    var editflag = false;
    // var lng = $("#lng").val();
    // var lat = $("#lat").val();
    // var coortype = $("#coortype").val();
    // var address = $("#address").val();
    // var commaddr = $("#sims").val();
    // var model = $("#model").val();
    // var serialnumber = $("#serialnumber").val();
    // var manufacturer = $("#manufacturer").val();
    // var madedate = $("#madedate").val();
    // console.log(old_name,coortype,manufacturer,lng);
    var deviceFlag = true;
    editCentratorManagement = {
        init: function () {
            var setting = {
                async: {
                    url: "/entm/user/oranizationtree/",
                    tyoe: "post",
                    enable: true,
                    autoParam: ["id"],
                    contentType: "application/json",
                    dataType: "json",
                    // dataFilter: editCentratorManagement.ajaxDataFilter
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
                    beforeClick: editCentratorManagement.beforeClick,
                    onClick: editCentratorManagement.onClick
                }
            };
            $.fn.zTree.init($("#ztreeDemo"), setting, null);
            // laydate.render({elem: '#installDate', theme: '#6dcff6'});
            // laydate.render({elem: '#procurementDate', theme: '#6dcff6'});
            editCentratorManagement.InitCallback();

            //init paramter input
            $("#manufacturerSelect option").each(function (){
                if($(this).val()==manufacturer){ 
                $(this).attr("selected","selected"); 
            }});

            $("#coortype option").each(function (){
                if($(this).val()==coortype){ 
                $(this).attr("selected","selected"); 
            }});

            $("#model option").each(function (){
                if($(this).val()==model){ 
                $(this).attr("selected","selected"); 
            }});


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
            $("body").bind("mousedown", editCentratorManagement.onBodyDown);
        },
        //隐藏菜单
        hideMenu: function () {
            $("#zTreeContent").fadeOut("fast");
            $("body").unbind("mousedown", editCentratorManagement.onBodyDown);
        },
        onBodyDown: function (event) {
            if (!(event.target.id == "menuBtn" || event.target.id == "zTreeContent" || $(
                    event.target).parents("#zTreeContent").length > 0)) {
                editCentratorManagement.hideMenu();
            }
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
            editCentratorManagement.initSimCard("/api/devm/simcard/getSimcardSelect/");
            
        },
        initSimCard: function (url) {
            editCentratorManagement.initDataList(simInput, url, simCardId,editCentratorManagement.simsChange);
        },
        simsChange: function (keyword) {
            // datas = keyword.key;
            // json_ajax("POST", "/devm/getSimcardInfoBySimcardNumber/", "json", true,
            //     {simcardNumber: datas}, editCentratorManagement.simsChangeCallback);
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
            // console.log(dataInput,id);
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
                    // console.log(itemList);
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
                        var url="/devm/concentrator/repetition_commaddr/";
                        
                        var parameter={"commaddr": keyword.key};
                        json_ajax("POST",url,"json",false,parameter, editCentratorManagement.deviceAjax);
                        //限制输入
                        editCentratorManagement.showHideValueCase(0,dataInput);
                        editCentratorManagement.hideErrorMsg();
                    }).on('onUnsetSelectValue', function () {
                        //放开输入
                        editCentratorManagement.showHideValueCase(1,dataInput);
                    });
                    
                    dataInput.next().find('button').removeClass('disabled loading-state-button').find('i').attr("class", 'caret');
                    if(moreCallback){
                        moreCallback()
                    }
                }
            });
        },
        //组织树预处理函数
        ajaxDataFilter: function (treeId, parentNode, responseData) {
            editCentratorManagement.hideErrorMsg();//隐藏错误提示样式
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
                editCentratorManagement.showErrorMsg("您需要先新增一个组织", "zTreeOrganSel");
                return;
            }
        },
        doSubmit: function () {
            var edit_name = $("#name").val();
            var edit_commaddr = $("#sims").val();
            var edit_lng = $("#lng").val();
            var edit_lat = $("#lat").val();
            var edit_model = $("#model").val();
            var edit_serialnumber = $("#serialnumber").val();
            var edit_madedate = $("#madedate").val();
            var edit_address = $("#address").val();
            var edit_manufacturer = $("#manufacturer").val();
            var edit_coortype = $("#coortype").val();
            var edit_belongto = $("#zTreeOrganSel").val();
            if(edit_name != name || edit_commaddr != commaddr || edit_lng != lng || edit_lat != lat||
                edit_model != model || edit_serialnumber != serialnumber || edit_madedate != madedate||
                edit_address != address || edit_manufacturer != manufacturer || edit_coortype != coortype||
                edit_belongto != belongto){
                editflag = true;
            }
            if(!editflag){
                console.log("no edit")
                $("#commonWin").modal("hide");
                return;
            }
            if(!deviceFlag){
                layer.msg("集中器名称重复")
                return;
            }
            if (submissionFlag) {  // 防止重复提交
                return;
            } else {
                // name = $("#name").val();
                // console.log("doSubmit");
                // editCentratorManagement.nameValidates();
                
                if (editCentratorManagement.validates()) {
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
        },
        nameValidates: function () {
        
            var check_name = $("#name").val();
            var sn = /^[A-Za-z0-9]+$/;;
            
            if (check_name == "") {
                nameError.html("请输入集中器名称");
                nameError.show();
                deviceFlag = false;
            }else {
                editCentratorManagement.namerepetion();
            }
            
        },
        validates: function () {
            return $("#editForm").validate({
                rules: {
                    
                    name: {
                        required: true
                    },
                    lng: {
                        required: true
                    },
                    lat: {
                        required: true
                    },
                    belongto: {
                        required: true
                    },
                    commaddr: {
                        required: true,
                        maxlength: 50
                    },
                    
                },
                messages: {
                    name: {
                        required: "集中器名称不能为空",
                    },
                    lng: {
                        required: "经度不能为空",
                    },
                    lat: {
                        required: "纬度不能为空",
                    },
                    belongto: {
                        required: "所属组织不能为空",
                        maxlength: publicSize50
                    },
                    commaddr: {
                        required: publicNull
                    },
                    
                },
                submitHandler: function (form) {
                    console.log("submitHandler")
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
        deviceAjax: function (data) {
            if (data.success == false) {
                commaddrError.html("该卡号已被绑定！");
                commaddrError.show();
                deviceFlag = false;
            }
            else {
                commaddrError.hide();
                deviceFlag = true;
            }
        },

        namerepetion: function () {
            console.log("namerepetion")
            var check_name = $("#name").val();
            $.ajax({
                    type: "post",
                    url: "/devm/concentrator/repetition/",
                    data: {name: check_name},
                    success: function (d) {
                        console.log(d)
                        var result = $.parseJSON(d);
                        if (!result.success) {
                            nameError.html("集中器名称已存在！");
                            nameError.show();
                            deviceFlag = false;
                        }
                        else {
                            nameError.hide();
                        }
                    }
                }
            )
        },
        
    }
    $(function () {
        $('input').inputClear();
        //初始化
        editCentratorManagement.init();
        
        $('input').inputClear();

        $("#name").on("change", function () {
            // name = $("#name").val();
            editCentratorManagement.nameValidates();
        });

        $("#coortypeSelect").on("change",function(){
            console.log($(this).val())
            $("#coortype").attr("value",$(this).val())
        })

        $("#manufacturerSelect").on("change",function(){
            console.log($(this).val())
            $("#manufacturer").attr("value",$(this).val())
        })
        
        $("#name").bind("input propertychange change", editCentratorManagement.namerepetion);

        //显示菜单
        $("#zTreeOrganSel").bind("click", editCentratorManagement.showMenu);
        //提交
        $("#doSubmit").bind("click", editCentratorManagement.doSubmit);
    })
})(window, $)
