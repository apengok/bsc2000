(function (window, $) {
    var submissionFlag = false;
    var simInput = $("#sims");
    var simCardId = $("#simID").val();
    var name = $("#name").val();
    var nameError = $("#name-error");
    var deviceFlag = false;
    var old_sw_name = $("#name").val();



    secondwaterEdit = {
        init: function () {
            var setting = {
                async: {
                    url: "/entm/user/oranizationtree/",
                    tyoe: "post",
                    enable: true,
                    autoParam: ["id"],
                    contentType: "application/json",
                    dataType: "json",
                    // dataFilter: secondwaterEdit.ajaxDataFilter
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
                    beforeClick: secondwaterEdit.beforeClick,
                    onClick: secondwaterEdit.onClick
                }
            };
            $.fn.zTree.init($("#ztreeDemo"), setting, null);
            // laydate.render({elem: '#installDate', theme: '#6dcff6'});
            laydate.render({elem: '#product_date', theme: '#6dcff6'});
            
            $("#coortype option").each(function (){
                if($(this).val()==coortype){ 
                $(this).attr("selected","selected"); 
            }});

            $("#artist option").each(function (){
                if($(this).val()==artist){ 
                $(this).attr("selected","selected"); 
            }});

            secondwaterEdit.artistPreviewImg();

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
            $("body").bind("mousedown", secondwaterEdit.onBodyDown);
        },
        //隐藏菜单
        hideMenu: function () {
            $("#zTreeContent").fadeOut("fast");
            $("body").unbind("mousedown", secondwaterEdit.onBodyDown);
        },
        onBodyDown: function (event) {
            if (!(event.target.id == "menuBtn" || event.target.id == "zTreeContent" || $(
                    event.target).parents("#zTreeContent").length > 0)) {
                secondwaterEdit.hideMenu();
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

        artistPreviewImg:function(){
            var imgObjPreview=document.getElementById("preview-ico");
            console.log("artistPreview",artistPreview)
            if(artistPreview != '')
            {
                //火狐下，直接设img属性
                imgObjPreview.style.display = 'block';
                imgObjPreview.style.width = '240px';
                imgObjPreview.style.height = '80px'; 

                imgObjPreview.src = '/media/resources/img/secondwater/' + artistPreview;
                
            }
        },
        
        //下面用于图片上传预览功能
        setImagePreview: function(avalue){
            // personalizedConfiguration.uploadImageIco(); // 上传图片到服务器 
            var docObj=document.getElementById("doc-ico");
            var imgObjPreview=document.getElementById("preview-ico");
            if(docObj.files &&docObj.files[0])
            {
                //火狐下，直接设img属性
                imgObjPreview.style.display = 'block';
                imgObjPreview.style.width = '240px';
                imgObjPreview.style.height = '80px'; 
                //火狐7以上版本不能用上面的getAsDataURL()方式获取，需要一下方式
                if(window.navigator.userAgent.indexOf("Chrome") >= 1 || window.navigator.userAgent.indexOf("Safari") >= 1){
                    imgObjPreview.src = window.webkitURL.createObjectURL(docObj.files[0]); 
                }else{
                    imgObjPreview.src = window.URL.createObjectURL(docObj.files[0]);
                }
                $('#imgchange').val("1")
            }
            else
            {
                //IE下，使用滤镜
                docObj.select();
                var imgSrc = document.selection.createRange().text;
                var localImagId = document.getElementById("localImag-ico");
                //必须设置初始大小
                localImagId.style.width = "240px";
                localImagId.style.height = "80px";
                //图片异常的捕捉，防止用户修改后缀来伪造图片
                try{
                    localImagId.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
                    localImagId.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = imgSrc;
                }
                catch(e)
                {
                    alert("您上传的图片格式不正确，请重新选择!");
                    return false;
                }
                imgObjPreview.style.display = 'none';
                document.selection.empty();
            }
            
            
            return true;
        },
        //组织树预处理函数
        ajaxDataFilter: function (treeId, parentNode, responseData) {
            secondwaterEdit.hideErrorMsg();//隐藏错误提示样式
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
                secondwaterEdit.showErrorMsg("您需要先新增一个组织", "zTreeOrganSel");
                return;
            }
        },
        doSubmit: function () {
            if (submissionFlag) {  // 防止重复提交
                return;
            } else {
                name = $("#name").val();
                console.log("doSubmit");
                secondwaterEdit.nameValidates();
                if ($("#name").val() != "" && deviceFlag) {
                    if (secondwaterEdit.validates()) {
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
                nameError.html("请输入名称");
                nameError.show();
                deviceFlag = false;
            }else {
                console.log("deviceAjax")
                secondwaterEdit.deviceAjax();
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
                        required: "名称不能为空",
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
            var now_name = $("#name").val();
            if(old_sw_name != now_name){
                $.ajax({
                        type: "post",
                        url: "/devm/concentrator/repetition/",
                        data: {name: name},
                        success: function (d) {
                            var result = $.parseJSON(d);
                            // if (!result) {
                            if (result.success == false) {
                                nameError.html("该名称已存在！");
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
        secondwaterEdit.init();
        
        $('input').inputClear();

        $("#name").on("change", function () {
            name = $("#name").val();
            secondwaterEdit.nameValidates();
        });
        
        $("#name").bind("input propertychange change", function (event) {
            name = $(this).val();
            $.ajax({
                    type: "post",
                    url: "/dmam/secondwater/repetition/",
                    data: {name: name},
                    success: function (d) {
                        var result = $.parseJSON(d);
                        if (!result) {
                            nameError.html("该名称已存在！");
                            nameError.show();
                            deviceFlag = false;
                        }
                        else {
                            secondwaterEdit.nameValidates();
                        }
                    }
                }
            )
        });

        //显示菜单
        $("#zTreeOrganSel").bind("click", secondwaterEdit.showMenu);
        //提交
        $("#doSubmit").bind("click", secondwaterEdit.doSubmit);
    })
})(window, $)
