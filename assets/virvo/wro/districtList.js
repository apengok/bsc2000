(function($,window){
    var isAdminStr = $("#isAdmin").attr("value");//是否是admin
    var selectTreeId = '';
    var selectDistrictId = '';
    var zNodes = null;
    var log, className = "dark";
    var newCount = 1;
    var columnDefs;
    var columns;
    var setting;
    var treeSetting;
    var idStr;
    var OperationId;
    var selectTreeIdAdd="";
    var current_dma_pk =$("#current_dma_pk").val();
    var startOperation;// 点击运营资质类别的修改按钮时，弹出界面时运营资质类别文本的内容
    var expliant;// 点击运营资质类别的修改按钮时，弹出界面时说明文本的内容
    var vagueSearchlast = $("#userType").val();

    //dmabaseinfo
    var dma_no = $("#id_dma_no").val();
    var pipe_texture = $("#id_pipe_texture").val();
    var ifc = $("#id_ifc").val();
    var ozTreeOrganSelEdit = $("#zTreeOrganSelEdit").val();
    var pipe_length = $("#id_pipe_length").val();
    var aznp = $("#id_aznp").val();
    var pepoles_num = $("#id_pepoles_num").val();
    var pipe_links = $("#id_pipe_links").val();
    var night_use = $("#id_night_use").val();
    var acreage = $("#id_acreage").val();
    var pipe_years = $("#id_pipe_years").val();
    var cxc_value = $("#id_cxc_value").val();
    var user_num = $("#id_user_num").val();
    var pipe_private = $("#id_pipe_private").val();
    var flag1 = false;
    var modify_flag = false;

    var fillColor_seted = "#1791fc";
    var strokeColor_seted = "#FF33FF"
    var polyFence = null;
    var DMABaseEdit = {
        //初始化
        init:function(){
            var setting = {
                async : {
                    // url : "/dmam/district/dmatree/",
                    url : "/api/entm/organization/tree/",
                    type : "GET",
                    enable : true,
                    autoParam : [ "id" ],
                    contentType : "application/json",
                    dataType : "json",
                    otherParam : {  // 是否可选 Organization
                        // "isDma" : "1",
                        // "csrfmiddlewaretoken": "{{ csrf_token }}"
                    },
                },
                view : {
                    dblClickExpand : false
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    beforeClick : DMABaseEdit.beforeClick,
                    onClick : DMABaseEdit.onClick

                }
            };
            $.fn.zTree.init($("#ztreeOrganEdit"), setting, null);
            
           
        },
        beforeClick: function(treeId, treeNode){
            var check = (treeNode);
            return check;
        },
        onClick: function(e, treeId, treeNode){
            var zTree = $.fn.zTree.getZTreeObj("ztreeOrganEdit"), nodes = zTree
                .getSelectedNodes(), v = "";
            n = "";
            nodes.sort(function compare(a, b) {
                return a.id - b.id;
            });
            for (var i = 0, l = nodes.length; i < l; i++) {
                n += nodes[i].name;
                v += nodes[i].id + ",";
            }
            if (v.length > 0)
                v = v.substring(0, v.length - 1);
            var cityObj = $("#zTreeOrganSelEdit");
            console.log('before:',$("#groupIds").val());
            $("#groupIds").val(v);
            $("#idstr").val(v);
            console.log('after:',$("#groupIds").val());
            cityObj.val(n);
            $("#zTreeContentEdit").hide();
        },
        showMenu: function(e){
            // 判断是否是当前用户,不能修改自己的组织 
            if ($("#zTreeContentEdit").is(":hidden")) {
                var width = $(e).parent().width();
                $("#zTreeContentEdit").css("width",width + "px");
                $(window).resize(function() {
                    var width = $(e).parent().width();
                    $("#zTreeContentEdit").css("width",width + "px");
                })
                if(modify_flag){
                    $("#zTreeContentEdit").show();
                }
            } else {
                $("#zTreeContentEdit").hide();
            }
            $("body").bind("mousedown", DMABaseEdit.onBodyDown);
        },
        hideMenu: function(){
            $("#zTreeContentEdit").fadeOut("fast");
            $("body").unbind("mousedown", DMABaseEdit.onBodyDown);
        },
        onBodyDown: function(event){
            if (!(event.target.id == "menuBtn" || event.target.id == "zTreeContentEdit" || $(event.target).parents("#zTreeContentEdit").length > 0)) {
                DMABaseEdit.hideMenu();
            }
        },
        valueChange:function () { // 判断值是否改变
            var edit_dma_no = $("#id_dma_no").val();
            var edit_pipe_texture = $("#id_pipe_texture").val();
            var edit_ifc = $("#id_ifc").val();
            var edit_zTreeOrganSelEdit = $("#zTreeOrganSelEdit").val();
            var edit_pipe_length = $("#id_pipe_length").val();
            var edit_aznp = $("#id_aznp").val();
            var edit_pepoles_num = $("#id_pepoles_num").val();
            var edit_pipe_links = $("#id_pipe_links").val();
            var edit_night_use = $("#id_night_use").val();
            var edit_acreage = $("#id_acreage").val();
            var edit_pipe_years = $("#id_pipe_years").val();
            var edit_cxc_value = $("#id_cxc_value").val();
            var edit_user_num = $("#id_user_num").val();
            var edit_pipe_private = $("#id_pipe_private").val();
            
            // 值已经发生改变
            if (dma_no != edit_dma_no || pipe_texture != edit_pipe_texture || ifc != edit_ifc || ozTreeOrganSelEdit != edit_zTreeOrganSelEdit
                || pipe_length != edit_pipe_length || aznp != edit_aznp || pepoles_num != edit_pepoles_num || pipe_links != edit_pipe_links || night_use != edit_night_use
                || acreage != edit_acreage || pipe_years != edit_pipe_years || cxc_value != edit_cxc_value || user_num != edit_user_num || pipe_private != edit_pipe_private ) {
                    flag1 = true;
            } else { // 表单值没有发生改变
                
                flag1 = false;
            }
        },
        Alterdma:function(){
            modify_flag = true;
            $("#id_pepoles_num,#id_acreage,#id_user_num,#id_pipe_texture,#id_pipe_length,#id_pipe_links,#id_pipe_years,#id_pipe_private,#id_ifc,#id_aznp,#id_night_use,#id_cxc_value,#id_belongto").removeAttr("readonly");
            $("#zTreeOrganSelEdit").attr("disabled",false);
        },
        restore:function(){
            $("#id_pepoles_num,#id_acreage,#id_user_num,#id_pipe_texture,#id_pipe_length,#id_pipe_links,#id_pipe_years,#id_pipe_private,#id_ifc,#id_aznp,#id_night_use,#id_cxc_value,#id_belongto").attr("readonly","readonly");
            $("#zTreeOrganSelEdit").attr("disabled","disabled");
            modify_flag = false;
        },
        doSubmit: function(){
            
            DMABaseEdit.valueChange();
            if (flag1){
                var     baseinfo_action = "/dmam/district/dmabaseinfo/edit/{id}/";
                dma_id = $("#current_dma_pk").val();
                
                new_action = baseinfo_action.replace("{id}", dma_id);
                
                $("#baseinfoForm").attr("action",new_action);

                if(DMABaseEdit.validates()){
                    $('#simpleQueryParam').val("");
                    
                    $("#baseinfoForm").ajaxSubmit(function(data) {
                        if (data != null) {
                            var result =  $.parseJSON(data);
                            console.log(result);
                            if (result.success == true) {
                                if (result.obj.flag == 1){
                                    // $("#commonLgWin").modal("hide");
                                    layer.msg(publicEditSuccess,{move:false});
                                    // myTable.refresh()
                                    modify_flag = false;
                                }else{
                                    if(date != null){
                                        layer.msg(publicEditError,{move:false});
                                    }
                                }
                            }else{
                                layer.msg(result.obj.errMsg,{move:false});
                            }
                        }
                    });
                    // $("#commonLgWin").modal("hide"); // 关闭窗口
                }
            } else {
                // $("#commonLgWin").modal("hide"); // 关闭窗口
            }
        },
        //校验
        validates: function(){
            var isAdmin = isAdminStr == 'true'
            console.log('isadmin?',isAdmin);
            if(isAdmin == true){
                return $("#baseinfoForm").validate({
                    rules : {
                        dma_no : {
                            required : true,
                            
                        },
                        belongto : {
                            required : true
                        }
                    },
                    messages : {
                        dma_no : {
                            required : "分区编号不能为空",
                            
                        },
                        
                        belongto : {
                            required : "组织不能为空"
                        }
                    }
                }).form();
            }else{
                return $("#baseinfoForm").validate({
                    rules : {
                        dma_no : {
                            required : true,
                            
                        },
                        
                        belongto : {
                            required : true
                        }
                        
                    },
                    messages : {
                        dma_no : {
                            required : "分区编号不能为空",
                            
                        },
                        belongto : {
                            required : "组织不能为空"
                        }
                    }
                }).form();
            }

        },
        getsTheCurrentTime: function () {
            var time=$("#authorizationDateEdit").val();
                var nowDate = new Date();
                var startTime = parseInt(nowDate.getFullYear()+1)
                    + "-"
                    + (parseInt(nowDate.getMonth() + 1) < 10 ? "0"
                        + parseInt(nowDate.getMonth() + 1)
                        : parseInt(nowDate.getMonth() + 1))
                    + "-"
                    + (nowDate.getDate() < 10 ? "0" + nowDate.getDate()
                        : nowDate.getDate()) + " ";
                $("#authorizationDateEdit").val(startTime);
        },
    },
    amapbase = {
        init: function(){
            // map
            var layer = new AMap.TileLayer({
                  zooms:[3,20],    //可见级别
                  visible:true,    //是否可见
                  opacity:1,       //透明度
                  zIndex:0         //叠加层级
            });
            

            map = new AMap.Map('mapContainer',{
                zoom: 15,  //设置地图显示的缩放级别
                center: [118.438781,29.871515],
                layers:[layer], //当只想显示标准图层时layers属性可缺省
                viewMode: '2D',  //设置地图模式
                lang:'zh_cn',  //设置地图语言类型
            });

            // var path = [
            //     [116.424124,39.906614],
            //     [116.438115,39.911552],
            //     [116.447299,39.906745],
            //     [116.437771,39.89621],
            //     [116.421292,39.903914],
            //     [116.420863,39.905231]
            // ]

            // var polygon = new AMap.Polygon({
            //     path: path,
            //     isOutline: true,
            //     borderWeight: 3,
            //     strokeColor: "#FF33FF", 
            //     strokeWeight: 6,
            //     strokeOpacity: 0.2,
            //     fillOpacity: 0.4,
            //     // 线样式还支持 'dashed'
            //     fillColor: '#1791fc',
            //     zIndex: 50,
            // })

            // polygon.setMap(map)
            // // 缩放地图到合适的视野级别
            // map.setFitView([ polygon ])
            // amapbase.loadGeodata(); //2020-02-06 

            mouseTool = new AMap.MouseTool(map);

            mouseTool.on('draw', function(event) {
              // event.obj 为绘制出来的覆盖物对象
                pgpath = event.obj.getPath();
                // console.log(pgpath);
                // console.log('覆盖物对象绘制完成')
                dmaManage.saveDmaGisinfo(event.obj);
            })
        },
        loadGeodata:function(){
            dma_no = $("#current_dma_no").val();
            map.clearMap();
            $.ajax({
                type: 'POST',
                url: '/gis/fence/bindfence/getFenceDetails/',
                data: {"dma_no" : $("#current_dma_no").val()},
                async:false,
                dataType: 'json',
                success: function (data) {
                    var dataList = data.obj;
                    if (dataList != null && dataList.length > 0) {
                        polygon = data.obj[0].fenceData;
                        fillColor_seted = fillColor = data.obj[0].fillColor
                        strokeColor_seted = strokeColor = data.obj[0].strokeColor
                        if(fillColor === null){
                            fillColor_seted = fillColor = "#1791fc"
                        }
                        if(strokeColor === null){
                            strokeColor_seted = strokeColor = "#FF33FF"
                        }
                        var dataArr = new Array();
                        if (polygon != null && polygon.length > 0) {
                            for (var i = 0; i < polygon.length; i++) {
                                dataArr.push([polygon[i].longitude, polygon[i].latitude]);
                            }
                        };
                        if(data.obj !== null){
                            polyFence = new AMap.Polygon({
                                path: dataArr,//设置多边形边界路径
                                strokeColor:strokeColor,// "#FF33FF", //线颜色
                                strokeOpacity: 0.2, //线透明度
                                strokeWeight: 3, //线宽
                                fillColor:fillColor,// "#1791fc", //填充色
                                fillOpacity: 0.35
                                //填充透明度
                            });
                            polyFence.setMap(map);
                            map.setFitView(polyFence);
                            // 创建 geoJSON 实例
                            // var geoJson = new AMap.GeoJSON({
                            //     geoJSON: data.obj[0].geoJsonData,//JSON.parse(data.obj.geoJsonData),   // GeoJSON对象
                            //     getPolygon:  function(geojson, lnglats) {//还可以自定义getMarker和getPolyline
                            //         console.log(geojson,lnglats,data.obj[0].strokeColor,data.obj[0].fillColor)
                            //         return new AMap.Polygon({
                            //             path: lnglats,
                            //             fillOpacity: .8,
                            //             strokeColor:data.obj[0].strokeColor,
                            //             fillColor:data.obj[0].fillColor
                            //         });   
                            //     }
                            // }); 

                            // map.add(geoJson);
                        }
                    }
                },      
            });
            
        },
        alterFillColor:function(fillColor){
            dma_no = $("#current_dma_no").val();
            map.clearMap();
            $.ajax({
                type: 'POST',
                url: '/gis/fence/bindfence/alterFillColor/',
                data: {"dma_no" : dma_no,"fillColor":fillColor},
                async:false,
                dataType: 'json',
                success: function (data) {
                    console.log(data);
                    if(data.success){

                        amapbase.loadGeodata();
                        layer.msg("修改成功")
                    }
                },      
            });
            
        },
        previewFillColor:function(color){
            dma_no = $("#current_dma_no").val();
            map.clearMap();
            $.ajax({
                type: 'POST',
                url: '/gis/fence/bindfence/getFenceDetails/',
                data: {"dma_no" : $("#current_dma_no").val()},
                async:false,
                dataType: 'json',
                success: function (data) {
                    var dataList = data.obj;
                    if (dataList != null && dataList.length > 0) {
                        polygon = data.obj[0].fenceData
                        fillColor = data.obj[0].fillColor
                        strokeColor = data.obj[0].strokeColor
                        if(fillColor === null){
                            fillColor = "#1791fc"
                        }
                        if(strokeColor === null){
                            strokeColor = "#FF33FF"
                        }
                        var dataArr = new Array();
                        if (polygon != null && polygon.length > 0) {
                            for (var i = 0; i < polygon.length; i++) {
                                dataArr.push([polygon[i].longitude, polygon[i].latitude]);
                            }
                        };
                        if(data.obj !== null){
                            polyFence = new AMap.Polygon({
                                path: dataArr,//设置多边形边界路径
                                strokeColor: strokeColor, //线颜色
                                strokeOpacity: 0.2, //线透明度
                                strokeWeight: 3, //线宽
                                fillColor: color, //填充色
                                fillOpacity: 0.35
                                //填充透明度
                            });
                            polyFence.setMap(map);
                            map.setFitView(polyFence);
                            
                        }
                    }
                },      
            });
            
        },
        alterstrokeColor:function(strokeColor){
            dma_no = $("#current_dma_no").val();
            map.clearMap();
            $.ajax({
                type: 'POST',
                url: '/gis/fence/bindfence/alterstrokeColor/',
                data: {"dma_no" : dma_no,"strokeColor":strokeColor},
                async:false,
                dataType: 'json',
                success: function (data) {
                    console.log(data);
                    if(data.success){

                        amapbase.loadGeodata();
                        layer.msg("修改成功")
                    }
                },      
            });
            
        },
        previewstrokeColor:function(color){
            dma_no = $("#current_dma_no").val();
            map.clearMap();
            $.ajax({
                type: 'POST',
                url: '/gis/fence/bindfence/getFenceDetails/',
                data: {"dma_no" : $("#current_dma_no").val()},
                async:false,
                dataType: 'json',
                success: function (data) {
                    var dataList = data.obj;
                    if (dataList != null && dataList.length > 0) {
                        polygon = data.obj[0].fenceData
                        fillColor = data.obj[0].fillColor
                        strokeColor = data.obj[0].strokeColor
                        console.log(fillColor,strokeColor)
                        if(fillColor === null){
                            fillColor = "#1791fc"
                        }
                        if(strokeColor === null){
                            strokeColor = "#FF33FF"
                        }
                        var dataArr = new Array();
                        if (polygon != null && polygon.length > 0) {
                            for (var i = 0; i < polygon.length; i++) {
                                dataArr.push([polygon[i].longitude, polygon[i].latitude]);
                            }
                        };
                        if(data.obj !== null){
                            polyFence = new AMap.Polygon({
                                path: dataArr,//设置多边形边界路径
                                strokeColor: color, //线颜色
                                strokeOpacity: 0.2, //线透明度
                                strokeWeight: 3, //线宽
                                fillColor: fillColor, //填充色
                                fillOpacity: 0.35
                                //填充透明度
                            });
                            polyFence.setMap(map);
                            map.setFitView(polyFence);
                            
                        }
                    }
                },      
            });
            
        },
        drawPolygon:function() {
            console.log("drawPolygon");
            if(1){
                mouseTool.polygon({
                strokeColor: "#FF33FF", 
                strokeOpacity: 1,
                strokeWeight: 6,
                strokeOpacity: 0.2,
                fillColor: '#1791fc',
                fillOpacity: 0.4,
                // 线样式还支持 'dashed'
                strokeStyle: "solid",
                // strokeStyle是dashed时有效
                // strokeDasharray: [30,10],
              })
            } else {

            }
        },

    },
    dmaManage = {
        init: function(){
            // 显示隐藏列
            var menu_text = "";
            var table = $("#dataTable tr th:gt(1)");
            menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(2) +"\" disabled />"+ table[0].innerHTML +"</label></li>"
            for(var i = 1; i < table.length; i++){
                menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(i+2) +"\" />"+ table[i].innerHTML +"</label></li>"
            };
            $("#Ul-menu-text").html(menu_text);
            // 表格列定义
            
        },
        userTree : function(){
            // 初始化文件树
            treeSetting = {
                async : {
                    url : "/api/entm/organization/tree/",
                    type : "get",
                    enable : true,
                    autoParam : [ "id" ],
                    dataType : "json",
                    data:{'csrfmiddlewaretoken': '{{ csrf_token }}'},
                    otherParam : {  // 是否可选 Organization
                        "isOrg" : "1",
                        "isDma" : "1",

                        // "csrfmiddlewaretoken": "{{ csrf_token }}"
                    },
                    dataFilter: dmaManage.ajaxDataFilter
                },
                view : {
                    addHoverDom : dmaManage.addHoverDom,
                    removeHoverDom : dmaManage.removeHoverDom,
                    selectedMulti : false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree
                },
                edit : {
                    enable : true,
                    editNameSelectAll : true,
                    showRemoveBtn : dmaManage.showRemoveBtn,
                    showRenameBtn : false
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    beforeDrag : dmaManage.beforeDrag,
                    beforeEditName : dmaManage.beforeEditName,
                    beforeRemove : dmaManage.beforeRemove,
                    beforeRename : dmaManage.beforeRename,
                    // onRemove : dmaManage.onRemove,
                    onRename : dmaManage.onRename,
                    onClick : dmaManage.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#treeDemo"), treeSetting, zNodes);
            var treeObj = $.fn.zTree.getZTreeObj('treeDemo');treeObj.expandAll(true);
           
        },

        beforeDrag: function(treeId, treeNodes){
            return false;
        },
        beforeEditName: function(treeId, treeNode){
            className = (className === "dark" ? "" : "dark");
            dmaManage.showLog("[ " + dmaManage.getTime() + " beforeEditName ]&nbsp;&nbsp;&nbsp;&nbsp; "
                    + treeNode.name);
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.selectNode(treeNode);
            return tg_confirmDialog(null,userGroupDeleteConfirm);
        },
        // 组织树预处理函数
        ajaxDataFilter: function(treeId, parentNode, responseData){
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            if (responseData) {
                for (var i = 0; i < responseData.length; i++) {
                        responseData[i].open = true;
                }
            }
            return responseData;
        },
        beforeRemove: function(treeId, treeNode){
            className = (className === "dark" ? "" : "dark");
            dmaManage.showLog("[ " + dmaManage.getTime() + " beforeRemove ]&nbsp;&nbsp;&nbsp;&nbsp; "
                    + treeNode.name);
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.selectNode(treeNode);
            var result;
            layer.confirm("确定删除该分区吗", { //userGroupDeleteConfirm
                title :'操作确认',
                icon : 3, // 问号图标
                btn: ['确认','取消'] // 按钮
            }, function(index){
                selectTreeIdAdd="";
                var nodes = zTree.getSelectedNodes();
                var preNode = nodes[0].getPreNode();
                var nextNode = nodes[0].getNextNode();
                var parentNode = nodes[0].getParentNode();
                $.ajax({
                    type: 'POST',
                    url: '/dmam/district/delete/',
                    data: {"pId": treeNode.id},
                    async:false,
                    dataType: 'json',
                    success: function (data) {
                        var flag=data.success;      
                        if(flag==false){
                            layer.msg(data.msg,{move:false})
                        }
                        if(flag==true){
                            $('#simpleQueryParam').val("");
                            selectTreeId = "";
                            selectDistrictId = "";
                            $.ajax({
                                type: 'GET',
                                url: '/api/entm/organization/tree/',
                                data: {"isOrg" : "1"},
                                async:false,
                                dataType: 'json',
                                success: function (data) {
                                    var data2 = JSON.stringify(data);
                                    var addData = JSON.parse(data2);             
                                    var nodeName;
                                    if(preNode != null){
                                        nodeName = preNode.name;
                                    }else if(nextNode != null){
                                        nodeName = nextNode.name;
                                    }else{
                                        nodeName = parentNode.name;
                                    };
                                    $.fn.zTree.init($("#treeDemo"), treeSetting, addData);  
                                    var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                                    var nodes = treeObj.getNodes();
                                    for(var j=0;j<nodes.length;j++){
                                         zTree.expandNode(nodes[j], true, true, true);
                                    }
                                    // pengwl delete group and user refresh tabale
                                    // myTable.requestData();
                                },      
                            });
                        }
                        layer.close(index,{move:false});
                    },
                    error: function () {
                        layer.msg(systemError, {move: false});
                    }
                });
            }, function(index){
                layer.close(index,{move:false});
            });
            return false;
        },
        onRemove: function(e, treeId, treeNode){
            selectTreeIdAdd="";
            dmaManage.showLog("[ " + dmaManage.getTime() + " onRemove ]&nbsp;&nbsp;&nbsp;&nbsp; "
                + treeNode.name);
        },
        beforeRename: function(treeId, treeNode, newName, isCancel){
            className = (className === "dark" ? "" : "dark");
            dmaManage.showLog((isCancel ? "<span style='color:red'>" : "") + "[ " + dmaManage.getTime()
                    + " beforeRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name
                    + (isCancel ? "</span>" : ""));
            if (newName.length == 0) {
                layer.msg(userNodeNameNull, {move: false});
                var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                setTimeout(function() {
                    zTree.editName(treeNode)
                }, 10);
                return false;
            }
            return true;
        },
        onRename: function(e, treeId, treeNode, isCancel){
            dmaManage.showLog((isCancel ? "<span style='color:red'>" : "") + "[ " + dmaManage.getTime()
                + " onRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name
                + (isCancel ? "</span>" : ""));
        },
        // 显示删除组织按钮
        showRemoveBtn: function(treeId, treeNode){
            return (treeNode.children==undefined && treeNode.otype != 'group');
        },
        showRenameBtn: function(treeId, treeNode){
            return !treeNode.isLastNode;
        },
        showLog: function(str){
            if (!log)
                log = $("#log");
                log.append("<li class='"+className+"'>" + str + "</li>");
            if (log.children("li").length > 8) {
                log.get(0).removeChild(log.children("li")[0]);
            }
        },
        getTime: function(){
            var now = new Date(), h = now.getHours(), m = now.getMinutes(), s = now
                .getSeconds(), ms = now.getMilliseconds();
            return (h + ":" + m + ":" + s + " " + ms);
        },
        addHoverDom: function(treeId, treeNode){
            var sObj = $("#" + treeNode.tId + "_span");
            var sEdit = $("#" + treeNode.tId + "_span");
            var sDetails = $("#" + treeNode.tId + "_span");
            if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0)
                return;
            if (treeNode.editNameFlag || $("#editBtn_" + treeNode.tId).length > 0)
                return;

            var id = (100 + newCount);
            var pid = treeNode.id;
            pid = window.encodeURI(window.encodeURI(pid));
            
            var addStr = "<span class='button add' id='addBtn_"
                    + treeNode.tId
                    + "' title='增加' href='/dmam/district/add/?id="
                    + id
                    + "&pid="
                    + pid
                    + "' data-target='#commonSmWin' data-toggle='modal' style='background-image:url(/static/virvo/images/add.png)'><img  src='/static/virvo/images/add.png' style='outline: none;'></span>";
            var editStr = "<span class='button edit' id='editBtn_"
                    + treeNode.tId
                    + "' title='编辑' href='/dmam/district/edit/"
                    + pid
                    + "/' data-target='#commonSmWin' data-toggle='modal' style='background-image:url(/static/virvo/images/edit.png)' >"
                    + "<img  src='/static/virvo/images/edit.png' style='outline: none;'>"
                    +"</span>";
            
            var detailsStr = "<span class='button details' id='detailsBtn_"
                    + treeNode.tId
                    + "' title='详情'  href='/dmam/district/detail/"
                    + pid
                    + "/' data-target='#commonSmWin' data-toggle='modal' style='background-image:url(/static/virvo/images/detail.png)'><img  src='/static/virvo/images/detail.png' style='outline: none;'></span>";
            // sDetails.after(detailsStr);
            // sEdit.after(editStr);
            // sObj.after(addStr);
            var organlevel = parseInt(treeNode.organlevel);
            var permission = "false";
            if(treeNode.attribute == "自来水公司" && organlevel <= 3){
                permission = "true";
            }
            if(treeNode.otype == "group" && permission == "true"){
                sObj.after(addStr);
            }
            if(treeNode.otype == "dma"){
                sDetails.after(detailsStr);
                // sEdit.after(editStr);
                sObj.after(editStr);
            }
            var btn = $("#addBtn_" + treeNode.tId);
            if (btn)
                btn.bind("click", function() {
                    var oldData;
                    $.ajax({
                        url: '/api/entm/organization/tree/',
                        type: 'GET',
                        data: {"isOrg" : "1","isDma":"1"},
                        async:false,
                        dataType: 'json',
                        success: function (data) {
                            var data2 = JSON.stringify(data);
                            var addData = $.parseJSON(data2);
                            oldData = addData.length;
                        },
                    });
                    var windowId = 'commonSmWin'; 
                    $("#" + windowId).on("hidden.bs.modal", function(data) {
                        $(this).removeData("bs.modal");                     
                        $.ajax({
                            url: '/api/entm/organization/tree/',
                            type: 'GET',
                            data: {"isOrg" : "1","isDma":"1"},
                            async:false,
                            dataType: 'json',
                            success: function (data) {
                                var data2 = JSON.stringify(data);
                                var addData =  JSON.parse(data2);     
                                if(addData.length != oldData){
                                    var lastData = addData[addData.length-1];           
                                    $.fn.zTree.init($("#treeDemo"), treeSetting, addData);
                                    var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                                    var treenode = treeObj.getNodeByParam("name", lastData.name, null);
                                    var treeObj = $.fn.zTree.getZTreeObj('treeDemo');treeObj.expandAll(true);
                                   /* treeObj.expandNode(treenode, true, true, true);
                                    treeObj.selectNode(treenode);*/
                                }
                                treeObj.expandAll(true);
                                dmaManage.getBaseinfo();
                            },
                            error: function () {
                                layer.msg(systemError, {move: false});
                            }
                        });
                    });
                    return true;
                });
            var editBtn = $("#editBtn_" + treeNode.tId);
            if(editBtn)
                editBtn.bind("click", function() {      
                    var windowId = 'commonSmWin';
                    $("#" + windowId).on("hidden.bs.modal", function(data) {
                        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                        var nodes = treeObj.getSelectedNodes();        
                        $(this).removeData("bs.modal");
                        $.ajax({
                            url: '/api/entm/organization/tree/',
                            type: 'GET',
                            data: {"isOrg" : "1","isDma":"1"},
                            async:false,
                            dataType: 'json',
                            success: function (data) {
                                var data2 = JSON.stringify(data);
                                var addData =  JSON.parse(data2);                 
                                $.fn.zTree.init($("#treeDemo"), treeSetting, addData);  
                                var treeObjNew = $.fn.zTree.getZTreeObj("treeDemo");
                                if (nodes != null && nodes.length > 0){
                                    var treenode = treeObjNew.getNodeByParam("id", nodes[0].id, null);
                                    //treeObj.expandAll(true);
                                   /* treeObj.expandNode(treenode, false, false, false);
                                    treeObj.selectNode(treenode);*/
                                }
                                treeObj.expandAll(true);
                            },
                            error: function () {
                                layer.msg(systemError, {move: false});
                            }
                        });
                    });
                    return true;
                });
            var detBtn = $("#detailsBtn_" + treeNode.tId);
        },
        removeHoverDom: function(treeId, treeNode){

            $("#addBtn_" + treeNode.tId).unbind().remove();
            $("#editBtn_" + treeNode.tId).unbind().remove();
            $("#detailsBtn_" + treeNode.tId).unbind().remove();
        },
        selectAll: function(){
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.treeSetting.edit.editNameSelectAll = $("#selectAll").attr("checked");
        },
        //点击节点
        zTreeOnClick: function(event, treeId, treeNode){
            selectTreeId = treeNode.id;
            selectDistrictId = treeNode.districtid;
            selectTreeIdAdd=treeNode.uuid;
            
            $('#simpleQueryParam').val("");
            
            
            // dmaManage.getBaseinfo();
            if(treeNode.otype == "dma"){
                var pNode = treeNode.getParentNode();
                current_dma_pk = treeNode.id;
                $("#current_dma_pk").attr("value",treeNode.id);
                $("#current_dma_no").attr("value",treeNode.dma_no);
                $("#current_dma_name").attr("value",treeNode.name);
                dmaManage.getBaseinfo();
                polyFence = null;
                amapbase.loadGeodata();


                // var organ = pNode.id;
                // dma_no = pNode.id;
                // dma_name = treeNode.name;
                // var url="/dmam/district/dmabaseinfo/";
                // var parameter={"dma_no":treeNode.id,"dma_name":treeNode.name};
                // json_ajax("GET",url,"json",true,parameter, dmaManage.setBaseinfo);
            }else{
                // myTable.requestData();

            }
        },
        getBaseinfo:function(){
            
            dma_no = $("#current_dma_no").val();
            dma_name = $("#current_dma_name").val();
            var url="/api/dmam/district/dmabaseinfo/";
            var parameter={"dma_no":dma_no,"dma_name":dma_name};
            json_ajax("GET",url,"json",true,parameter, dmaManage.setBaseinfo);
        },
        setBaseinfo:function(data){
            if(data.success == true){
                // $("#phoneBookObject").val(data.obj.vid);
                // if(data.msg == null&&data.obj.referVehicleList!= null){
                //     realTimeCommand.initReferVehicleList(data.obj.referVehicleList);
                // }
                if (data.msg == null&&data.obj.details!= null) {
                    var baseinfo = data.obj.details;
                    $("#id_dma_no").val(baseinfo.dma_no);
                    $("#id_pepoles_num").val(baseinfo.pepoles_num);
                    $("#id_acreage").val(baseinfo.acreage);
                    $("#id_user_num").val(baseinfo.user_num);
                    $("#id_pipe_texture").val(baseinfo.pipe_texture);
                    $("#id_pipe_length").val(baseinfo.pipe_length);
                    $("#id_pipe_links").val(baseinfo.pipe_links);
                    $("#id_pipe_years").val(baseinfo.pipe_years);
                    $("#id_pipe_private").val(baseinfo.pipe_private);
                    $("#id_ifc").val(baseinfo.ifc);
                    $("#id_aznp").val(baseinfo.aznp);
                    $("#id_night_use").val(baseinfo.night_use);
                    $("#id_cxc_value").val(baseinfo.cxc_value);
                    $("#zTreeOrganSelEdit").val(baseinfo.belongto);
                }else{
                    layer.msg(data.msg);
                }
                
                var stationdataListArray = [];//用来储存显示数据
                if(data.obj.stationlist !=null&&data.obj.stationlist.length!=0){
                    var ustasticinfo=data.obj.stationlist;
                    for(var i=0;i<ustasticinfo.length;i++){
                        
                        var dateList=
                            {
                                // "id":ustasticinfo.pk,
                                "username":ustasticinfo[i].username,
                                "usertype":ustasticinfo[i].usertype,
                                "simid":ustasticinfo[i].simid,
                                "dn":ustasticinfo[i].dn,
                                "belongto":ustasticinfo[i].belongto,
                                "metertype":ustasticinfo[i].metertype,
                                "serialnumber":ustasticinfo[i].serialnumber,
                                "createdate":ustasticinfo[i].createdate
                            }
//                      if(stasticinfo[i].majorstasticinfo!=null||  stasticinfo[i].speedstasticinfo!=null|| stasticinfo[i].vehicleII!=null
//                        ||stasticinfo[i].timeoutParking!=null||stasticinfo[i].routeDeviation!=null||
//                       stasticinfo[i].tiredstasticinfo!=null||stasticinfo[i].inOutArea!=null||stasticinfo[i].inOutLine!=null){
                            stationdataListArray.push(dateList);
//                      }
                    }
                    dmaManage.reloadData(stationdataListArray);
                    
                }else{
                    dmaManage.reloadData(stationdataListArray);
                    
                }
            
            }
            else{
                layer.msg("没有分区");
            }
        },
        baseinfoCommit: function(){
            var     baseinfo_action = "/dmam/district/dmabaseinfo/edit/{id}/";
            dma_id = $("#current_dma_no").val();
            
            new_action = baseinfo_action.replace("{id}", dma_id);
            
            $("#baseinfoForm").attr("action",new_action);
            console.log("new_form_action:",new_action);
            console.log("ajaxSubmit_action:",$("#baseinfoForm").attr("action"));
                    
            if(dmaManage.validateSubmit()){
                $("#baseinfoForm").ajaxSubmit(function(data) {
                    if(data.success){
                        layer.msg("保存成功");
                    }
                    else{
                        layer.msg(data.obj.errMsg);
                    }
                    myTable.refresh()
                });
            }
        },
        validateSubmit:function(){
            return true;
        },
        
        // ajax参数
        ajaxDataParamFun: function(d){
            d.simpleQueryParam = $('#simpleQueryParam').val(); // 模糊查询
            d.groupName = selectTreeId;
            d.districtId = selectDistrictId;
        },
        reloadData: function (dataList) {
            var currentPage = myTable.page()
            myTable.clear()
            myTable.rows.add(dataList)
            // myTable.page(currentPage).draw(false);
            myTable.columns.adjust().draw(false);

        },
        // 查询全部
        refreshTable: function(){
            selectTreeId = "";
            selectDistrictId = "";
            $('#simpleQueryParam').val("");
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.selectNode("");
            zTree.cancelSelectedNode();
            // myTable.requestData();
        },
        
        getTable:function(table,operations){
           myTable = $(table).DataTable({
          "destroy": true,
            "dom": 'tiprl',// 自定义显示项
            "data": operations,
            "lengthChange": true,// 是否允许用户自定义显示数量
            "bPaginate": true, // 翻页功能
            "bFilter": false, // 列筛序功能
            "searching": true,// 本地搜索
            "ordering": false, // 排序功能
            "Info": true,// 页脚信息
           // "autoWidth": true,// 自动宽度
            // "scrollX": "100%",
            "columns" : [
                {
                    // 第一列，用来显示序号
                    "data" : null,
                    "class" : "text-center"
                },
                {
                    "data" : "username",    //站点名称
                    "class" : "text-center"
                },
                {
                    "data" : "usertype",
                    "class" : "text-center",
                    render : function (data,type,row,meta) {

                        if(data == "null" || data == null || data == undefined){
                            data = "";
                        }
                        return data;
                    }
                },
                {
                    "data" : "metertype",
                    "class" : "text-center"
                },
                {
                    "data" : "serialnumber",
                    "class" : "text-center"
                },
                {
                    "data" : "dn",
                    "class" : "text-center",
                    render : function (data,type,row,meta) {
                        if(data == "null" || data == null || data == undefined){
                            data = "";
                        }
                        return data;
                    }
                },
                {
                    "data" : "belongto",
                    "class" : "text-center",
                    render : function (data,type,row,meta) {
                        if(data == "null" || data == null || data == undefined){
                            data = "";
                        }
                        return data;
                    }
                } ,
                
                
                
                {
                    "data" : "createdate",
                    "class" : "text-center",
                    render : function (data,type,row,meta) {
                        if(data == "null" || data == null || data == undefined){
                            data = "";
                        }
                        return data;
                    }
                } ,
            ],
            
              "stripeClasses" : [],
              "lengthMenu" : [ 10, 20, 50, 100, 200 ],
            "pagingType" : "full_numbers", // 分页样式
            "dom" : "t" + "<'row'<'col-md-3 col-sm-12 col-xs-12'l><'col-md-4 col-sm-12 col-xs-12'i><'col-md-5 col-sm-12 col-xs-12'p>>",
            "oLanguage": {// 国际语言转化
                "oAria": {
                    "sSortAscending": " - click/return to sort ascending",
                    "sSortDescending": " - click/return to sort descending"
                },
                "sLengthMenu": "显示 _MENU_ 记录",
                "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录。",
                "sZeroRecords": "我本将心向明月，奈何明月照沟渠，不行您再用其他方式查一下？",
                "sEmptyTable": "我本将心向明月，奈何明月照沟渠，不行您再用其他方式查一下？",
                "sLoadingRecords": "正在加载数据-请等待...",
                "sInfoEmpty": "当前显示0到0条，共0条记录",
                "sInfoFiltered": "（数据库中共为 _MAX_ 条记录）",
                "sProcessing": "<img src='../resources/user_share/row_details/select2-spinner.gif'/> 正在加载数据...",
                "sSearch": "模糊查询：",
                "sUrl": "",
                "oPaginate": {
                    "sFirst": "首页",
                    "sPrevious": " 上一页 ",
                    "sNext": " 下一页 ",
                    "sLast": " 尾页 "
                },
                "columnDefs": [
                    { 'width': "40%", "targets": 0 },
                    { 'width': "30%", "targets": 1 },
                    { 'width': "30%", "targets": 2 },
                ],
            },
            "order": [
                [0, null]
            ],// 第一列排序图标改为默认

              });
                myTable.on('order.dt search.dt', function () {
                  myTable.column(0, {
                      search: 'applied',
                      order: 'applied'
                  }).nodes().each(function (cell, i) {
                      cell.innerHTML = i + 1;
                  });
              }).draw();
        },
        
        saveDmaGisinfo:function(data){
            console.log(data);
            dma_no = $("#current_dma_no").val();
            strokeColor = data.getOptions().strokeColor;
            fillColor = data.getOptions().fillColor;
            geodata = JSON.stringify(data.toGeoJSON());
            var data={"dma_no":dma_no,"geodata":geodata,"strokeColor":strokeColor,"fillColor":fillColor}
            var url="/dmam/district/saveDmaGisinfo/";
            json_ajax("POST",url,"json",true,data,dmaManage.saveDmaGisinfoBack);
        },
        saveDmaGisinfoBack:function(data){
            console.log(data);
            if(data.success == true){
                // $("#updateType").modal('hide');
                layer.msg("修改成功");
                
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        
        assignstation : function (){
            $("#assignstation").attr("href","/dmam/district/assignstation/"+current_dma_pk+"/");
        }
        
        
    }
    $(function(){
        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('treeDemo',id,'group');
            };
        });
        var myTable;
        dmaManage.userTree();
        
        dmaManage.getTable('#dataTable');
        dmaManage.init();
        DMABaseEdit.init();
        dmaManage.getBaseinfo();

        //map
        var map,mouseTool;
        amapbase.init();
        $("#drawDistrict").on("click",amapbase.drawPolygon);
        $("#saveDmaGisinfo").on("click",dmaManage.saveDmaGisinfo);
        $("#getFillColor,#getFrameColor").on("click",function(){ 
            $("#getFillColor").spectrum({
                color: "#f00"
            });
        });

        
        // IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            dmaManage.refreshTable();
            var search;
            $("#search_condition").bind("focus",function(){
                search = setInterval(function(){
                    search_ztree('treeDemo', 'search_condition','group');
                },500);
            }).bind("blur",function(){
                clearInterval(search);
            });
        }
        // IE9 end
        $("#selectAll").bind("click", dmaManage.selectAll);
        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('treeDemo', 'search_condition','group');
        });       
        // 查询全部
        $('#refreshTable').on("click",dmaManage.refreshTable);
        $("input[name='subChkTwo']").click(function(){
            $("#checkAllTwo").prop("checked",subChkTwo.lenght == subChkTwo.filter(":checked").length ? true:false);
        });
        // 全选
        $("input[name='subChk']").click(function() {
            $("#checkAll").prop(
                "checked",
                subChk.length == subChk.filter(":checked").length ? true: false);
        });
        //basic dma infor invole
        $("#zTreeOrganSelEdit").attr("disabled","disabled"); // 禁用选择组织控件 zTreeOrganSelSpan
        $("#zTreeContentEdit").hide();
        $("#zTreeOrganSelEdit").on("click",function(){DMABaseEdit.showMenu(this)});
        $("#baseinfomMdify").on("click",DMABaseEdit.Alterdma);
        $("#baseinfoCommit").on("click",DMABaseEdit.doSubmit);
        $("#baseinfoRestore").on("click",DMABaseEdit.restore);

        

        //提交基本信息
        // $("#baseinfoCommit").bind("click",dmaManage.baseinfoCommit);
        
        
        $("#assignstation").on("click",dmaManage.assignstation);
        


        var windowId = 'commonLgWin'; 
        $("#" + windowId).on("hidden.bs.modal", function(data) {
            $(this).removeData("bs.modal");       
            // layer.msg(" close modal window", {move: false});              
            dmaManage.getBaseinfo();
        });

        $("#fillColor").spectrum({
            color: fillColor_seted,
            preferredFormat: "hex",
            showInput: true,
            move: function(tinycolor) {
              var fillcolor = tinycolor.toHexString(); // #ff0000
              console.log("move:",fillcolor)
              if(polyFence == null){
                layer.msg("没有分区框图")
                return
              }
              amapbase.previewFillColor(fillcolor)
              
            },
            // show: function(tinycolor) { 
            //   var fillcolor = tinycolor.toHexString(); // #ff0000
            //   console.log("show",fillcolor)
            // },
            // hide: function(tinycolor) { 
            //   var fillcolor = tinycolor.toHexString(); // #ff0000
            //   console.log("hide",fillcolor)
            // },
            // beforeShow: function(tinycolor) { 
            //   var fillcolor = tinycolor.toHexString(); // #ff0000
            //   console.log("beforeShow",fillcolor)
            // },
            change: function(tinycolor) {
              var fillcolor = tinycolor.toHexString(); // #ff0000
              console.log(fillcolor)
              if(polyFence == null){
                layer.msg("没有分区框图")
                return
              }
              amapbase.alterFillColor(fillcolor)
            }
        });


        $("#strokeColor").spectrum({
            color: strokeColor_seted,
            preferredFormat: "hex",
            showInput: true,
            move: function(tinycolor) {
              var fillcolor = tinycolor.toHexString(); // #ff0000
              console.log("move:",fillcolor)
              amapbase.previewstrokeColor(fillcolor)
              
            },
            // show: function(tinycolor) { 
            //   var fillcolor = tinycolor.toHexString(); // #ff0000
            //   console.log("show",fillcolor)
            // },
            // hide: function(tinycolor) { 
            //   var fillcolor = tinycolor.toHexString(); // #ff0000
            //   console.log("hide",fillcolor)
            // },
            // beforeShow: function(tinycolor) { 
            //   var fillcolor = tinycolor.toHexString(); // #ff0000
            //   console.log("beforeShow",fillcolor)
            // },
            change: function(tinycolor) {
              var fillcolor = tinycolor.toHexString(); // #ff0000
              console.log(fillcolor)
              if(polyFence == null){
                layer.msg("没有分区框图")
                return
              }
              amapbase.alterstrokeColor(fillcolor)
            }
        });

    $("#fillColor").css("display", "none");

    $("#strokeColor").css("display", "none");
    

    })
})($,window)
