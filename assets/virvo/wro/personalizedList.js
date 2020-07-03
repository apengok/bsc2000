(function($,window){
    var userGroupId;//用户组织ID
    var loginLogo;//登录页logo
    var homeLogo;//首页logo
    var webIco; //网页标题ico
    var indexTitle;//顶部标题
    var copyright;//版权信息
    var websiteName;//官网域名
    var recordNumber;//备案方案
    var resourceName;//首页默认资源名称
    var beforeLoginLogo;//修改前Logo
    var beforeHomeLogo;//修改前Logo
    var beforeWebIco;
    var frontPage;
    var frontPageUrl;
    personalizedConfiguration = {
        init: function(){
            var url="/sysm/personalized/find";
            var data={"uuid":userGroupId}
            json_ajax("POST", url, "json", false,data,personalizedConfiguration.initCallback);
        },
        initCallback : function(data){
            if(data.success==true){
                var list =data.obj.list;
                beforeLoginLogo=list.loginLogo;
                beforeHomeLogo=list.homeLogo;
                beforeWebIco=list.webIco;
                var loginLogo="/media/resources/img/logo/"+list.loginLogo;
                var homeLogo="/media/resources/img/logo/"+list.homeLogo;
                var webIco="/media/resources/img/logo/"+list.webIco;
                var copyright=list.copyright;
                var websiteName=list.websiteName;
                var recordNumber=list.recordNumber;
                var bottomTitleMsg=copyright+","+websiteName+","+recordNumber;
                var topTitleMsg=list.topTitle;
                frontPage = list.frontPage; // 默认首页id
                frontPageUrl = list.frontPageUrl; // 默认首页id
                $("#topTitleMsg").html(topTitleMsg);
                $("#indexTitle").val(topTitleMsg);
                $("#bottomTitleMsg").html(bottomTitleMsg);
                $("#copyright").val(copyright);
                $("#websiteName").val(websiteName);
                $("#recordNumber").val(recordNumber);
                $("#preview").attr('src',loginLogo);
                $("#photograph").val(list.loginLogo);
                $("#loginLogo").attr('src',loginLogo);
                $("#preview-ico").attr('src',webIco);
                $("#photograph-ico").val(list.webIco);
                $("#webIcoShow").attr('src',webIco);
                $("#preview-index").attr('src',homeLogo);
                $("#homeLogo").attr('src',homeLogo);
                $("#photograph-index").val(list.homeLogo);
                $("#frontPage").attr("value",frontPage);
                $("#frontPageUrl").attr("value",frontPageUrl);
                // 树结构 
                var setting = {
                    async:{
                        url:"/entm/role/personlizedFrontTree/",
                        type:"post",
                        enable:true,
                        autoParam:["id"],
                        contentType: "application/json",
                        dataType: "json",
                        dataFilter: personalizedConfiguration.ajaxDataFilter
                    },
                    check: {
                        enable: true,
                        chkStyle: "radio",
                        radioType: "all",
                        chkboxType: {
                            "Y": "s",
                            "N": "s"
                        }
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
                        onClick: personalizedConfiguration.onClick,
                        onCheck: personalizedConfiguration.onCheck,
                        onAsyncSuccess: personalizedConfiguration.zTreeOnAsyncSuccess,
                    }
                };
                $.fn.zTree.init($("#ztreeDemo"), setting, null);
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        //上传图片
        uploadImage: function(){
            var docObj=document.getElementById("doc"); 
            if(docObj.files &&docObj.files[0]){
                var formData = new FormData(); 
                formData.append("file", docObj.files[0]);  
                $.ajax({  
                    url: '/sysm/personalized/upload_img' , 
                    type: 'POST',  
                    data: formData,  
                    async: false,  
                    cache: false,  
                    contentType: false,  
                    processData: false,  
                    success: function (data) {  
                        data = $.parseJSON(data);
                        if(data.imgName == "0"){
                            layer.msg("图片格式不正确！请选择png文件");
                            $("#updateLoginLogo").attr("disabled","disabled");
                        }else{
                            $("#updateLoginLogo").removeAttr("disabled","disabled");
                            $("#photograph").val(data.imgName);
                        }
                    },  
                    error: function (data) {  
                        layer.msg("上传失败！");  
                    }  
                });  
            }
        },
        //下面用于图片上传预览功能
        setImagePreview: function(avalue){
            personalizedConfiguration.uploadImage(); // 上传图片到服务器 
            var docObj=document.getElementById("doc");
            var imgObjPreview=document.getElementById("preview");
            if(docObj.files &&docObj.files[0])
            {
                //火狐下，直接设img属性
                imgObjPreview.style.display = 'block';
                imgObjPreview.style.width = "100%";
                //imgObjPreview.style.height = '123px'; 
                //火狐7以上版本不能用上面的getAsDataURL()方式获取，需要一下方式
                if(window.navigator.userAgent.indexOf("Chrome") >= 1 || window.navigator.userAgent.indexOf("Safari") >= 1){
                    imgObjPreview.src = window.webkitURL.createObjectURL(docObj.files[0]); 
                }else{
                    imgObjPreview.src = window.URL.createObjectURL(docObj.files[0]);
                }
            }
            else
            {
                //IE下，使用滤镜
                docObj.select();
                var imgSrc = document.selection.createRange().text;
                var localImagId = document.getElementById("localImag");
                //必须设置初始大小
                localImagId.style.width = "100%";
               // localImagId.style.height = "123px";
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
        //平台网页标题 - 上传图片
        uploadImageIco: function(){
            var docObj=document.getElementById("doc-ico"); 
            if(docObj.files &&docObj.files[0]){
                var formData = new FormData(); 
                formData.append("file", docObj.files[0]);  
                $.ajax({  
                    url: '/sysm/personalized/upload_ico', 
                    type: 'POST',  
                    data: formData,  
                    async: false,  
                    cache: false,  
                    contentType: false,  
                    processData: false,  
                    success: function (data) {  
                        data = $.parseJSON(data);
                        if(data.imgName=="0"){
                            $("#webIco").attr("disabled","disabled");
                            layer.msg("图片格式不正确！请选择ico文件");  
                        }else{
                            $("#webIco").removeAttr("disabled","disabled");
                            $("#photograph-ico").val(data.imgName);
                        }
                    },  
                    error: function (data) {  
                        layer.msg("上传失败！");  
                    }  
                });  
            }
        },
        //下面用于图片上传预览功能
        setImagePreviewico: function(avalue){
            personalizedConfiguration.uploadImageIco(); // 上传图片到服务器 
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
        //平台首页logo - 上传图片
        uploadImageIndex: function(){
            var docObj=document.getElementById("doc-index"); 
            if(docObj.files &&docObj.files[0]){
                var formData = new FormData(); 
                formData.append("file", docObj.files[0]);  
                $.ajax({  
                    url: '/sysm/personalized/upload_img', 
                    type: 'POST',  
                    data: formData,  
                    async: false,  
                    cache: false,  
                    contentType: false,  
                    processData: false,  
                    success: function (data) {
                        data = $.parseJSON(data);
                        if(data.imgName=="0"){
                            $("#IndexLogo").attr("disabled","disabled");
                            layer.msg("图片格式不正确！请选择png文件");  
                        }else{
                            $("#IndexLogo").removeAttr("disabled","disabled");
                            $("#photograph-index").val(data.imgName);
                        }
                    },  
                    error: function (data) {  
                        layer.msg("上传失败！");  
                    }  
                });  
            }
        },
        //下面用于图片上传预览功能
        setImagePreviewIndex: function(avalue){
            personalizedConfiguration.uploadImageIndex(); // 上传图片到服务器 
            var docObj=document.getElementById("doc-index");
            var imgObjPreview=document.getElementById("preview-index");
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
            }
            else
            {
                //IE下，使用滤镜
                docObj.select();
                var imgSrc = document.selection.createRange().text;
                var localImagId = document.getElementById("localImag-index");
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
        //登录页照片查看
        logoPagesPhotoShow: function(){
            $("#logoPhotoShow").modal("show");
        },  
        //平台首页照片查看
        indexPagesPhotoShow: function(){
            $("#indexLogoPhotoShow").modal("show");
        },
        //平台网页ico
        webIcoPhotoShow : function(){
            $("#webIcoPhotoShow").modal("show");
        },
        topTitle : function(){
            personalizedConfiguration.updateAll();
            var url="/sysm/personalized/update";
            var data={"topTitle" : indexTitle,"loginLogo":loginLogo,"homeLogo":homeLogo,"webIco":webIco,"copyright":copyright,"websiteName":websiteName,"recordNumber":recordNumber,"groupId":userGroupId,"frontPage":frontPage,"frontPageUrl":frontPageUrl};
            json_ajax("POST", url, "json", false,data,personalizedConfiguration.topTitleCallback);
        },
        topTitleCallback : function(data){
            if(data.success==true) {
                $("#editIndexTitle").hide();
                location.reload();
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        BottomTitle : function(){
            personalizedConfiguration.updateAll();
            var url="/sysm/personalized/update";
            var data={"topTitle" : indexTitle,"loginLogo":loginLogo,"homeLogo":homeLogo,"webIco":webIco,"copyright":copyright,"websiteName":websiteName,"recordNumber":recordNumber,"groupId":userGroupId,"frontPage":frontPage,"frontPageUrl":frontPageUrl};
            json_ajax("POST", url, "json", false,data,personalizedConfiguration.BottomTitleCallback);
        },
        BottomTitleCallback : function(data){
            location.reload() ;
        },
        frontPage : function(){
            personalizedConfiguration.updateAll();
            var url="/sysm/personalized/update";
            var data={"topTitle" : indexTitle,"loginLogo":loginLogo,"homeLogo":homeLogo,"copyright":copyright,"websiteName":websiteName,"recordNumber":recordNumber,"groupId":userGroupId,"frontPage":frontPage,"frontPageUrl":frontPageUrl};
            json_ajax("POST", url, "json", false,data,personalizedConfiguration.frontPageCallback);
        },
        frontPageCallback : function(data){
            location.reload() ;
        },
        IndexLogo : function(){
            personalizedConfiguration.updateAll();
            if (homeLogo != beforeHomeLogo) {
                var imgSrc = $("#preview-index").attr("src");
                var url="/sysm/personalized/update";
                var data={"topTitle" : indexTitle,"loginLogo":loginLogo,"homeLogo":homeLogo,"webIco":webIco,"copyright":copyright,"websiteName":websiteName,"recordNumber":recordNumber,"groupId":userGroupId,"name":beforeHomeLogo,"frontPage":frontPage,"frontPageUrl":frontPageUrl};
                personalizedConfiguration.getImageWidth(imgSrc,function(width,height){
                    if(width>240&&height>80){
                        layer.msg("图片大小不要超过240x80");
                    }else{
                        json_ajax("POST", url, "json", false,data,personalizedConfiguration.IndexLogoCallback);
                    }   
                });
            } else {
                $("#editIndexLogo").modal("hide");
            }
        },
        IndexLogoCallback : function(data){
            location.reload();
        },
        webIco : function(){
            personalizedConfiguration.updateAll();
            if (webIco != beforeWebIco) {
                var imgSrc = $("#preview-ico").attr("src");
                var url="/sysm/personalized/update";
                var data={"topTitle" : indexTitle,"loginLogo":loginLogo,"homeLogo":homeLogo,"webIco":webIco,"copyright":copyright,"websiteName":websiteName,"recordNumber":recordNumber,"groupId":userGroupId,"name":beforeWebIco,"frontPage":frontPage,"frontPageUrl":frontPageUrl};
                json_ajax("POST", url, "json", false,data,personalizedConfiguration.webIcoCallback);
            } else {
                $("#editWebIco").modal("hide");
            }
        },
        webIcoCallback : function(data){
            location.reload();
        },
        updateLoginLogo : function(){
            personalizedConfiguration.updateAll();
            if (loginLogo != beforeLoginLogo) {
                var imgSrc = $("#preview").attr("src");
                var url="/sysm/personalized/update";
                var data={"topTitle" : indexTitle,"loginLogo":loginLogo,"homeLogo":homeLogo,"webIco":webIco,"copyright":copyright,"websiteName":websiteName,"recordNumber":recordNumber,"groupId":userGroupId,"name":beforeLoginLogo,"frontPage":frontPage,"frontPageUrl":frontPageUrl};
                personalizedConfiguration.getImageWidth(imgSrc,function(width,height){
                    if(width>689&&height>123){
                        layer.msg("图片大小不要超过689x123");
                    }else{
                        json_ajax("POST", url, "json", false,data,personalizedConfiguration.updateLoginLogoCallback);
                    }   
                });
            } else {
                $("#editLoginLogo").modal("hide");
            }
        },
        updateLoginLogoCallback : function(data){
            location.reload();
        },
        getImageWidth : function (url,callback){
            var img = new Image();
            img.src = url;
            // 如果图片被缓存，则直接返回缓存数据
            if(img.complete){
                callback(img.width, img.height);
            }else{
                    // 完全加载完毕的事件
                img.onload = function(){
                callback(img.width, img.height);
                }
             }
        },
        updateAll :function(){
             loginLogo=$("#photograph").val();
             homeLogo=$("#photograph-index").val();
             webIco=$("#photograph-ico").val();
             indexTitle= $("#indexTitle").val();
             copyright= $("#copyright").val();
             websiteName= $("#websiteName").val();
             recordNumber= $("#recordNumber").val();
             resourceName= $("#resourceName").val();
             frontPage = $("#frontPage").val();
        },
        defaultLoginLogo : function(){
            personalizedConfiguration.popupWindow(0);
        },
        defaultIndexLogo : function(){
            personalizedConfiguration.popupWindow(1);
        },
        defaultIndexTitle : function(){
            console.log("defaultIndexTitle");
            personalizedConfiguration.popupWindow(2);
        },
        defaultBottomTitle : function(){
            personalizedConfiguration.popupWindow(3);
        },
        defaultResourceName : function(){
            personalizedConfiguration.popupWindow(4);
        },
        defaultWebIco : function(){
            personalizedConfiguration.popupWindow(5);
        },
        popupWindow : function(type){
            console.log("popupWindow",type);
            var url="/sysm/personalized/default"
            var data={"topTitle" : indexTitle,"loginLogo":loginLogo,"homeLogo":homeLogo,"webIco":webIco,"copyright":copyright,"websiteName":websiteName,"recordNumber":recordNumber,"groupId":userGroupId,"type":type,"frontPage":frontPage};
            layer.confirm('是否恢复默认信息', {
              title :'操作确认',
              icon : 3, // 问号图标
              btn: [ '确定', '取消'] //按钮
            }, function(){
                json_ajax("POST", url, "json", false,data,null);
                layer.closeAll('dialog');
                location.reload();
            });
        },
        ajaxDataFilter : function(treeId, parentNode, responseData){
            if (responseData) {
              for(var i =0; i < responseData.length; i++) {
                responseData[i].open = true;
              }
            }
            return responseData;
        },
        beforeClick : function(treeId, treeNode){
            var check = (treeNode);
            return check;
        },
        // 分组下拉点击事件
        onClick : function(e, treeId, treeNode){
            var zTree = $.fn.zTree.getZTreeObj("ztreeDemo"),
                nodes = zTree.getSelectedNodes();
            console.log('onClick',treeNode);
            if(treeNode.type == 0){     // 按钮菜单 
                zTree.checkNode(nodes[0], true, false,true);
            }
        }, 
        onCheck: function(e, treeId, treeNode){
            var type = treeNode.type;
            var zTree = $.fn.zTree.getZTreeObj("ztreeDemo"), nodes = zTree
                .getCheckedNodes(true), v = "";
            console.log('onCheck',treeNode);
            
            if (type == 0) {
                zTree.selectNode(treeNode,false,true);
                $("#frontPage").attr("value", nodes[0].id);
                $("#frontPageUrl").attr("value", nodes[0].url);
                frontPage = nodes[0].id;
                frontPageUrl = nodes[0].url;
                v = nodes[0].name;
                var cityObj = $("#resourceName");
                cityObj.val(v);
                $("#menuContent").hide();
            }
        },
        zTreeOnAsyncSuccess: function(event, treeId, treeNode, msg){
            var defautPage = $("#frontPage").val();
            console.log("zTreeOnAsyncSuccess",frontPage);
            if(defautPage != undefined && defautPage != null && defautPage != ""){
                var treeObj = $.fn.zTree.getZTreeObj("ztreeDemo");
                var allNode = treeObj.transformToArray(treeObj.getNodes());
                if (allNode != null && allNode.length > 0){
                    for(var i = 0, len = allNode.length; i < len; i++){
                        if (allNode[i].id == frontPage && allNode[i].type == 0){
                            treeObj.checkNode(allNode[i], true, false,true);
                            $("#frontPageMsg").html(allNode[i].name);
                        }
                    }
                }
            }
        },
        // 获取当前点击资源详情
        getResourceDetail: function(id){
            $.ajax({
                type: 'POST',
                url: '/clbs/c/role/getResourceById',
                data: {"id": id},
                dataType: 'json',
                success: function (data) {
                    $("#resourceName").val(data.obj.resourceInfo.resourceName);
                },
                error: function () {
                  layer.msg(systemError, {
                     time: 1500, 
                  });
                }
            });
        },
        //将null转成空字符串
        converterNullToBlank: function(nullValue){
            if (nullValue == null || nullValue == undefined || nullValue == "null" || nullValue == "")
                return "-";
            else 
                return nullValue;
        },
        // 清除错误信息 
        clearErrorMsg: function () {
            $("label.error").hide();
        },
        // 分组下拉框
        showMenu: function(e){
            $("#ztreeDemo").show();
            var v_id = e.id;
            rid=v_id;
            if ($("#menuContent").is(":hidden")) {
                var width = $(e).parent().width();
                $("#menuContent").css("width",width + "px");
                $(window).resize(function() {
                    var width = $(e).parent().width();
                    $("#menuContent").css("width",width + "px");
                })
                $("#menuContent").insertAfter($("#" + rid));
                $("#menuContent").show();
            } else {
                $("#menuContent").is(":hidden");
            }
            $("body").bind("mousedown", personalizedConfiguration.onBodyDown);
        },
        onBodyDown: function(event){
            if (!(event.target.id == "menuBtn" || event.target.id == "menuContent" || $(event.target).parents("#menuContent").length>0)) {
                personalizedConfiguration.hideMenu();
            }
        },
        hideMenu: function(){
            $("#menuContent").fadeOut("fast");
            $("body").unbind("mousedown", personalizedConfiguration.onBodyDown);
        },
        setDefLoginLogo : function(){
            personalizedConfiguration.setDefWindow(0);
        },
        setDefIndexLogo : function(){
            personalizedConfiguration.setDefWindow(1);
        },
        setDefIndexTitle : function(){
            personalizedConfiguration.setDefWindow(2);
        },
        setDefBottomTitle : function(){
            personalizedConfiguration.setDefWindow(3);
        },
        setDefResourceName : function(){
            personalizedConfiguration.setDefWindow(4);
        },
        setDefWebIco : function(){
            personalizedConfiguration.setDefWindow(5);
        },
        setDefWindow : function(type){
            personalizedConfiguration.updateAll();
            var url="/sysm/personalized/update";
            var data={"topTitle" : indexTitle,"loginLogo":loginLogo,"homeLogo":homeLogo,"webIco":webIco,"copyright":copyright,"websiteName":websiteName,"recordNumber":recordNumber,"groupId":"defult","frontPage":frontPage};
            layer.confirm('是否设置为默认', {
              title :'操作确认',
              icon : 3, // 问号图标
              btn: [ '确定', '取消'] //按钮
            }, function(){
                json_ajax("POST", url, "json", false,data,null);
                layer.closeAll('dialog');
                location.reload();
            });
        },
    }
    $(function(){
        userGroupId=$("#userGroupId").val();
        $('input').inputClear();
        personalizedConfiguration.init();
        $("#topTitle").on("click",personalizedConfiguration.topTitle);
        $("#BottomTitle").on("click",personalizedConfiguration.BottomTitle);
        $("#resourceName").on("click",function(){personalizedConfiguration.showMenu(this)});
        $("#resourceName").siblings('span').on("click",function(){
            $("#resourceName").click();
        });

        $("#frontPageSubmit").on("click",personalizedConfiguration.frontPage)
        $("#IndexLogo").on("click",personalizedConfiguration.IndexLogo);
        $("#webIco").on("click",personalizedConfiguration.webIco);
        $("#updateLoginLogo").on("click",personalizedConfiguration.updateLoginLogo);
        $("#defaultLoginLogo").on("click",personalizedConfiguration.defaultLoginLogo);
        $("#defaultIndexLogo").on("click",personalizedConfiguration.defaultIndexLogo);
        $("#defaultWebIco").on("click",personalizedConfiguration.defaultWebIco);
        $("#defaultIndexTitle").on("click",personalizedConfiguration.defaultIndexTitle);
        $("#defaultBottomTitle").on("click",personalizedConfiguration.defaultBottomTitle);
        $("#defaultResourceName").on("click",personalizedConfiguration.defaultResourceName);
        
        $("#setDefLoginLogo").on("click",personalizedConfiguration.setDefLoginLogo);
        $("#setDefIndexLogo").on("click",personalizedConfiguration.setDefIndexLogo);
        $("#setDefWebIco").on("click",personalizedConfiguration.setDefWebIco);
        $("#setDefIndexTitle").on("click",personalizedConfiguration.setDefIndexTitle);
        $("#setDefBottomTitle").on("click",personalizedConfiguration.setDefBottomTitle);
        $("#setDefResourceName").on("click",personalizedConfiguration.setDefResourceName);
        
//      INSERT INTO `zw_c_logo_config` (`id`, `login_logo`, `home_logo`, `top_title`, `copyright`, `website_name`, `record_number`, `group_id`, `web_ico`, `front_page`, `flag`, `create_data_time`, `create_data_username`, `update_data_time`, `update_data_username`) VALUES('2','loginLogo.png','indexLogo.png','中位F3物联网监控平台','?2015-2018 中位（北京）科技有限公司','www.zwlbs.com','京ICP备15041746号-1','defult','favicon.ico',NULL,'1','2017-06-05 09:57:22','yangyi1','2017-06-05 16:23:37','lyman');

    })
})($,window)