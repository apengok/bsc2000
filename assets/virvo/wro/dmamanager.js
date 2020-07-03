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
    ol3ops = {
        init:function(){
            var dma_style =function(feature) { 

    
                var strokeColor = feature.getProperties().strokeColor;
                var fillColor = feature.getProperties().fillColor;
                var name = feature.getProperties().name;
                
                var color = ol.color.asArray(fillColor);
                color = color.slice();
                color[3] = 0.2; //opacity
            
                var style =  new ol.style.Style({
                    
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 3,
                        lineDash: [8, 6]
                    }),
                    fill: new ol.style.Fill({
                        color: color
                        
                    }),
                    text: new ol.style.Text({
                      font: '18px Calibri,sans-serif',
                      fill: new ol.style.Fill({ color: 'white' }),
                      stroke: new ol.style.Stroke({
                        color: '#169bd5', width: 12
                      }),
                      // get the text from the feature - `this` is ol.Feature
                      // and show only under certain resolution
                      text: name //map.getView().getZoom() > 12 ? feature.get('description') : 'text--'
                    })
                    
                })
                feature.setStyle(style);
                
            };
            vectorLayer1 = new ol.layer.Vector({
                projection: 'EPSG:4326',
                source: new ol.source.Vector(),
                style : dma_style,
            });

            
            var controls = [
                new ol.control.Attribution({collapsed: false}),
                // new ol.control.FullScreen(),
                new ol.control.MousePosition({projection: 'EPSG:4326',coordinateFormat: ol.coordinate.createStringXY(5)}),
                
            ];

            // 墨卡托
            // var vec_layer = ol3ops.crtLayerXYZ("vec_w","EPSG:3857",1);
            // var cta_wlayer = ol3ops.crtLayerXYZ("cta_w","EPSG:3857",1);
            // var cva_clayer = ol3ops.crtLayerXYZ("cva_w","EPSG:3857",1);
            
            // 经纬度
            var vec_layer = ol3ops.crtLayerXYZ("vec_c","EPSG:4326",1);
            var cta_wlayer = ol3ops.crtLayerXYZ("cta_c","EPSG:4326",1);
            var cva_clayer = ol3ops.crtLayerXYZ("cva_c","EPSG:4326",1);


            var center = [118.39469563,29.888188578];
            map = new ol.Map({
                layers: [vec_layer,cta_wlayer,cva_clayer,vectorLayer1],
                controls: controls,
                target: 'mapContainer',
                view: new ol.View({
                    projection: 'EPSG:4326',
                    center: center,
                //   center:  new ol.proj.transform(center,"EPSG:4326","EPSG:3857"),
                    maxZoom : 18,
                    zoom: 14
                })
              });

            

            // 行政区划查询
            // var opts = {
            //     subdistrict: 1,   //返回下一级行政区
            //     level: 'city',
            //     showbiz: false  //查询行政级别为 市
            // };
            // district = new AMap.DistrictSearch(opts);//注意：需要使用插件同步下发功能才能这样直接使用
            // district.search('中国', function (status, result) {
            //     if (status == 'complete') {
            //         fenceOperation.getData(result.districtList[0]);
            //     }
            // });


        },
        crtLayerXYZ:function(type, proj, opacity){
            var layer = new ol.layer.Tile({
                 source: new ol.source.XYZ({
                     url: 'http://t'+Math.round(Math.random()*7)+'.tianditu.com/DataServer?T='+type+'&x={x}&y={y}&l={z}&tk=e0955897c7f8a5adeba75b55bb11b600',
                     projection: proj
                 }),
                 opacity: opacity
             });
             layer.id = type;
             return layer;
        },
        updateDrawControl : function(geometryType) {
            

            map.removeInteraction(drawControl);

            if (geometryType === 'None') return;

            drawControl = new ol.interaction.Draw({
                type: geometryType,
                source: vectorLayer1.getSource()
            });

            map.addInteraction(drawControl);

            drawControl.on('drawend',fenceOperation.createSuccess);
            // drawControl.on('drawend',ol3ops.exportgeojson);
        },
        exportgeojson:function(event){
            map.removeInteraction(drawControl);
            console.log(event)
            var format = new ol.format.GeoJSON();
            var features = vectorLayer1.getSource().getFeatures();
            console.log(features)
            var geoJson = format.writeFeatures(features);
            console.log(geoJson)
            console.log(JSON.stringify(geoJson))

            var geojson2 = format.writeFeature(event.feature);
            console.log(geojson2)
        }





    },//ol3op end

    amapbase = {
        init: function(){
            ol3ops.init();
            amapbase.loadGeodata();
        },
        loadGeodata:function(){
            dma_no = $("#current_dma_no").val();
            vectorLayer1.getSource().clear();   
            $.ajax({
                type: 'GET',
                url: '/api/ggis/getFenceDetails/',
                data: {"dma_no" : $("#current_dma_no").val()},
                async:false,
                dataType: 'json',
                success: function (data) {
                    console.log(data)
                    if(data.features.length ==0){
                        return;
                    }
                    var format = new ol.format.GeoJSON({defaultDataProjection:'EPSG:4326'});//{dataProjection: 'EPSG:3857'}
                    var features = format.readFeatures(data.features[0]) //{dataProjection: 'EPSG:3857',featureProjection:'EPSG:3857'}
                    // var features = format.readFeatures(JSON.parse(data.features[0]))
                    console.log(features)
                    vectorLayer1.getSource().addFeatures(features); //vectorLayer1==map.getLayerGroup().getLayersArray()[2]
                    
                    var polygon = features[0].getGeometry();
                    console.log(polygon)
                    // vectorLayer1.changed();
                    console.log(map)
                    map.getView().fit(polygon, map.getSize()); 
                    polyFence = polygon;
                },      
            });
            
        },
        alterFillColor:function(fillColor){
            dma_no = $("#current_dma_no").val();
            vectorLayer1.getSource().clear();
            $.ajax({
                type: 'POST',
                url: '/ggis/fence/bindfence/alterFillColor/',
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
            vectorLayer1.getSource().clear();
            $.ajax({
                type: 'GET',
                url: '/api/ggis/getFenceDetails/',
                data: {"dma_no" : $("#current_dma_no").val()},
                async:false,
                dataType: 'json',
                success: function (data) {
                    console.log(data)
                    if(data.features.length ==0){
                        return;
                    }
                    var format = new ol.format.GeoJSON({defaultDataProjection:'EPSG:4326'});//{dataProjection: 'EPSG:3857'}
                    var features = format.readFeatures(data.features[0]) //{dataProjection: 'EPSG:3857',featureProjection:'EPSG:3857'}
                    // var features = format.readFeatures(JSON.parse(data.features[0]))
                    console.log(features)
                    vectorLayer1.getSource().addFeatures(features); //vectorLayer1==map.getLayerGroup().getLayersArray()[2]
                    
                    var polygon = features[0].getGeometry();
                    console.log(polygon)
                    // vectorLayer1.changed();
                    console.log(map)
                    map.getView().fit(polygon, map.getSize()); 
                },      
            });
            
        },
        alterstrokeColor:function(strokeColor){
            dma_no = $("#current_dma_no").val();
            vectorLayer1.getSource().clear();
            $.ajax({
                type: 'POST',
                url: '/ggis/fence/bindfence/alterstrokeColor/',
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
            vectorLayer1.getSource().clear();

            $.ajax({
                type: 'GET',
                url: '/api/ggis/getFenceDetails/',
                data: {"dma_no" : $("#current_dma_no").val()},
                async:false,
                dataType: 'json',
                success: function (data) {
                    console.log(data)
                    var format = new ol.format.GeoJSON({defaultDataProjection:'EPSG:4326'});//{dataProjection: 'EPSG:3857'}
                    var features = format.readFeatures(data.features[0]) //{dataProjection: 'EPSG:3857',featureProjection:'EPSG:3857'}
                    // var features = format.readFeatures(JSON.parse(data.features[0]))
                    console.log(features)
                    vectorLayer1.getSource().addFeatures(features); //vectorLayer1==map.getLayerGroup().getLayersArray()[2]
                    
                    var polygon = features[0].getGeometry();
                    console.log(polygon)
                    // vectorLayer1.changed();
                    console.log(map)
                    map.getView().fit(polygon, map.getSize()); 
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
                    onAsyncSuccess: dmaManage.AsyncSuccess,
                    onClick : dmaManage.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#treeDemo"), treeSetting, zNodes);
            var treeObj = $.fn.zTree.getZTreeObj('treeDemo');treeObj.expandAll(true);
           
        },

        beforeDrag: function(treeId, treeNodes){
            return false;
        },
        AsyncSuccess:function(treeId) {
            close_ztree("treeDemo");
            
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
                if(data.obj == undefined){
                    return
                }
                if (data.msg == null&&data.obj!= undefined) {
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
                    // layer.msg(data.msg);
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
                                "createdate":ustasticinfo[i].madedate
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

    windowHeight = $(window).height();
        headerHeight = $("#header").height();//顶部的高度
        panelHead = $(".panel-heading").height() + 20;//标题栏高度
        citySelHght = $("#citySel").parent().height() + 10;//输入框高度
        //日历高亮
        
        calHeight = 160


        zTreeHeight = windowHeight - headerHeight +350;//- panelHead - calHeight ;//- citySelHght - 26;
        

        $("#treeDemo").css("height", zTreeHeight + "px");
        if (windowHeight <= 667) {
            $("#treeDemo").css("height", 150 + "px");
        }
        
        window.onresize=function(){
            windowHeight = $(window).height();
            headerHeight = $("#header").height();//顶部的高度
            panelHead = $(".panel-heading").height() + 20;//标题栏高度
            citySelHght = $("#citySel").parent().height() + 10;//输入框高度
            //日历高亮
            
            calHeight = 240

            


            zTreeHeight = windowHeight - headerHeight - panelHead - calHeight - citySelHght - 26;
            console.log(zTreeHeight)
            $("#treeDemo").css("height", zTreeHeight + "px");
            if (windowHeight <= 667) {
                $("#treeDemo").css("height", 150 + "px");
            }
        }
    

    })
})($,window)
