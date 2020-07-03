(function($,window){
    var isAdminStr = $("#isAdmin").attr("value");//是否是admin
    var AuthorizedDeadline = $("#userAuthorizationDate").attr("value");//获取当前用户授权截止日期

    var meterInput = $("#relate_meter");
    var meterId = $("#meterID").val();
    
    var vectorLayer;

    var ol3ops = {
        init:function(){
            
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

            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                  anchor: [0.5, 46],
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'pixels',
                  src: '/static/virvo/images/u3054.png'
                }))
              });
        
            var createMarker = function(coord){
              var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(coord),
                name: 'Null Island',
                population: 4000,
                rainfall: 500
              });
        
              iconFeature.setStyle(iconStyle);
              return iconFeature;
            }
        
              
            vectorLayer = new ol.layer.Vector({
                projection: 'EPSG:4326',
                source: new ol.source.Vector()
              });
            
            var longitude = $("#entlongitude").val();
            var latitude = $("#entlatitude").val();
            var zoomIn = $("#entzoomIn").val();
            var maxZoom = 18;


            if(longitude == "" || latitude == "" || zoomIn == ""){
                longitude = 113.93125
                latitude = 22.53579
                zoomIn = 16
            }
            else{
                longitude = Number.parseFloat(longitude);
                latitude = Number.parseFloat(latitude);
                zoomIn = Number.parseFloat(zoomIn);
            }

            var center = [longitude,latitude];
            map = new ol.Map({
                layers: [vec_layer,cta_wlayer,cva_clayer,vectorLayer],
                controls: controls,
                target: 'map',
                view: new ol.View({
                    projection: 'EPSG:4326',
                    center: center,
                //   center:  new ol.proj.transform(center,"EPSG:4326","EPSG:3857"),
                    maxZoom : 18,
                    zoom: 14
                })
              });

            var draw; // global so we can remove it later
            function addInteraction() {
                draw = new ol.interaction.Draw({
                source: vectorLayer.getSource(),
                type: 'Point'
                });
                map.addInteraction(draw);

                draw.on('drawend',function(evt){
                    console.log(evt);
                    var feature = evt.feature;
                    if (feature) {
                        var coordinates = feature.getGeometry().getCoordinates();
                        $("#lng").val(coordinates[0].toFixed(3));
                        $("#lat").val(coordinates[1].toFixed(3));
                    }
                });
            }
                
        
                // display popup on click
            map.on('click', function(evt) {
                vectorLayer.getSource().clear();
                var pixel = map.getEventPixel(evt.originalEvent);
                var position = evt.target.getCoordinateFromPixel(pixel);
                console.log(pixel);
                $("#lng").val(position[0]),
                $("#lat").val(position[1])
                marker = createMarker(position)
                vectorLayer.getSource().addFeature(marker);
                // addInteraction();
            });

            console.log('map initialized')

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
        



    };//ol3op end

    
    var stationAdd = {
        //初始化
        init:function(){
            console.log('stationAdd.init ...');
            var setting = {
                async : {
                    url : "/entm/user/oranizationtree/",
                    tyoe : "post",
                    enable : true,
                    autoParam : [ "id" ],
                    contentType : "application/json",
                    dataType : "json",
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
                    beforeClick : stationAdd.beforeClick,
                    onClick : stationAdd.onClick

                }
            };
            $.fn.zTree.init($("#ztreeOrganEdit"), setting, null);
            laydate.render({elem: '#madedate',
              theme: '#6dcff6',
              done: function(value, date, endDate){
                var stdt=new Date();
                var etdt=new Date(value.replace("-","/"));
                if(stdt<=etdt){
                    $("#state").val("1");
                    $("#madedate-error").hide();
                }   
              }
           });

            stationAdd.InitCallback()
           
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
            var cityObj = $("#zTreeStationSelEdit");
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
                $("#zTreeContentEdit").show();
            } else {
                $("#zTreeContentEdit").hide();
            }
            $("body").bind("mousedown", stationAdd.onBodyDown);
        },
        hideMenu: function(){
            $("#zTreeContentEdit").fadeOut("fast");
            $("body").unbind("mousedown", stationAdd.onBodyDown);
        },
        onBodyDown: function(event){
            if (!(event.target.id == "menuBtn" || event.target.id == "zTreeContentEdit" || $(event.target).parents("#zTreeContentEdit").length > 0)) {
                stationAdd.hideMenu();
            }
        },
        locatechange:function(){
            var selectedopt = $("#locatesel :selected").text();
            $("#installationsite").val(selectedopt);
        },
        initUsertype:function(){
            var url="/dmam/station/findUsertypes/";
            var parameter={};
            // var parameter={"vid": currentVehicle,"commandType":treeNode.id,"isRefer":false};
            json_ajax("POST",url,"json",true,parameter, stationAdd.setUsertype);
        },
        setUsertype:function(data){
            if(data.success == true){
                // $("#phoneBookObject,#infoDemandObject,#eventObject,#gnssObject,#videoCameraObject,#telephoneObject,#locationObject,#specifyServerObject,#UpgradeObject,#terminalObject,#reportObject,#baseStationObject").val(vehicleList);
                if(data.msg == ''&&data.obj.operation!= null){
                    stationAdd.initUsertypeList(data.obj.operation);
                }
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        initUsertypeList: function(data){
        
            //meter list
            var usertypelist = data;

            // 初始化车辆数据
            var dataList = {value: []};
            if (usertypelist !== null && usertypelist.length > 0) {
                for (var i=0; i< usertypelist.length; i++) {
                    var obj = {};
                    obj.id = usertypelist[i].id;
                    obj.name = usertypelist[i].userType;
                    dataList.value.push(obj);
                }
                
            }
            $("#usertype").bsSuggest({
                indexId: 1,  //data.value 的第几个数据，作为input输入框的内容
                indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
                idField: "id",
                keyField: "name",
                effectiveFields: ["name"],
                searchFields:["id"],
                data: dataList
            }).on('onDataRequestSuccess', function (e, result) {
            }).on('onSetSelectValue', function (e, keyword, data) {
                // 当选择meter
                
            }).on('onUnsetSelectValue', function () {
            });
            
        },
        initRefer:function(){
            var url="/dmam/station/getmeterlist/";
            var parameter={};
            // var parameter={"vid": currentVehicle,"commandType":treeNode.id,"isRefer":false};
            json_ajax("POST",url,"json",true,parameter, stationAdd.setRefer);
        },
        setRefer:function(data){
            if(data.success == true){
                // $("#phoneBookObject,#infoDemandObject,#eventObject,#gnssObject,#videoCameraObject,#telephoneObject,#locationObject,#specifyServerObject,#UpgradeObject,#terminalObject,#reportObject,#baseStationObject").val(vehicleList);
                if(data.msg == null&&data.obj.meterlist!= null){
                    stationAdd.initReferMeterList(data.obj.meterlist);
                }
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        initReferMeterList: function(data){
        
            //meter list
            var meterlist = data;
            console.log('meterlist:',meterlist);

            // 初始化车辆数据
            var dataList = {value: []};
            if (meterlist !== null && meterlist.length > 0) {
                for (var i=0; i< meterlist.length; i++) {
                    var obj = {};
                    obj.id = meterlist[i].id;
                    obj.name = meterlist[i].serialnumber;
                    dataList.value.push(obj);
                }
                
            }
            $("#relate_meter").bsSuggest({
                indexId: 1,  //data.value 的第几个数据，作为input输入框的内容
                indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
                idField: "id",
                keyField: "name",
                effectiveFields: ["name"],
                searchFields:["id"],
                data: dataList
            }).on('onDataRequestSuccess', function (e, result) {
            }).on('onSetSelectValue', function (e, keyword, data) {
                // 当选择meter
                

                var meterid = keyword.id;
                var url="/dmam/station/getmeterParam/";
                var parameter={"mid": meterid};
                json_ajax("POST",url,"json",true,parameter, stationAdd.setMeterParam);
            }).on('onUnsetSelectValue', function () {
            });
            
        },
        setMeterParam:function(data){
            if(data.success == true){
                if(data.msg == null&&data.obj != null){
                    var mtype = data.obj.metertype;
                    $("#serialnumber").val(data.obj.serialnumber);
                    $("#simid").val(data.obj.simid);
                    $("#dn").val(data.obj.dn);
                    // $('input:radio[name="meter_type"]').filter('[value="Male"]').attr('checked', true);
                    $("[name=meter_type]").val([mtype]);
                    $("#metertypeEdit").val(mtype);
                }
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        //newwee
        //显示或隐藏输入框
        showHideValueCase: function(type,dataInput){
            var dataInputType = dataInput.selector;
            if (type == 0) {//限制输入
                
                if ("#relate_meter" == dataInputType) { //sim卡限制
                    $(".simsList").attr("readonly",true);
                    $("#simParentGroupName").css("background-color","");
                    $("#simGroupDiv").css("display","block");
                    $("#operatorTypeDiv").css("display","block");
                    simFlag = false;
                }
            } else if (type == 1) {//放开输入
                
                if ("#relate_meter" == dataInputType) { //sim卡放开
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
            stationAdd.initMeter("/api/devm/meter/getMeterSelect/");
            
        },
        initMeter: function (url) {
            stationAdd.initDataList(meterInput, url, meterId,stationAdd.meterChange);
        },
        meterChange: function (keyword) {
            console.log("meter change",keyword);
            var meterid = keyword.id;
            var url="/dmam/station/getmeterParam/";
            var parameter={"mid": meterid};
            json_ajax("POST",url,"json",true,parameter, stationAdd.setMeterParam);
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
                    // console.log(itemList);
                    // console.log({value:itemList});
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
                        stationAdd.showHideValueCase(0,dataInput);
                        stationAdd.hideErrorMsg();
                    }).on('onUnsetSelectValue', function () {
                        //放开输入
                        stationAdd.showHideValueCase(1,dataInput);
                    });
                    
                    dataInput.next().find('button').removeClass('disabled loading-state-button').find('i').attr("class", 'caret');
                    if(moreCallback){
                        moreCallback()
                    }
                }
            });
        },

        doSubmit: function(){
        
            if(stationAdd.validates()){
                $('#simpleQueryParam').val("");
                
                $("#addForm").ajaxSubmit(function(data) {
                    if (data != null) {
                        var result =  $.parseJSON(data);
                        console.log(result);
                        if (result.success == true) {
                            if (result.obj.flag == 1){
                                $("#commonLgWin").modal("hide");
                                layer.msg(publicEditSuccess,{move:false});
                                myTable.refresh()
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
            
        },
        //校验
        validates: function(){
            var isAdmin = isAdminStr == 'true'
            console.log('isadmin?',isAdmin);
            if(isAdmin == true){
                return $("#addForm").validate({
                    rules : {
                        username : {
                            required : true,
                            remote: {
                                type:"post",
                                async:false,
                                url:"/dmam/station/verifyusername/" ,
                                data:{
                                    username:function(){return $("#username").val();}
                                },
                                dataFilter:function(data){
                                    var resultData = $.parseJSON(data);
                                    if(resultData.success == true){
                                        return true;
                                    }else{
                                        if(resultData.msg != null && resultData.msg != ""){
                                            layer.msg(resultData.msg,{move:false});
                                        }else{
                                            return false;
                                        }
                                    }
                                }
                            }
                        },
                        belongto :{
                            required : true,
                        },
                        meter : {
                            required : true,
                        }
                        
                    },
                    messages : {
                        username : {
                            required : userNameNull,
                            remote:"该名称已被使用"
                        },
                        belongto :{
                            required : "请选择所属组织",
                        },
                        meter : {
                            required : "请关联表具"
                        }
                        
                    }
                }).form();
            }else{
                return $("#addForm").validate({
                    rules : {
                        username : {
                            required : true,
                            remote: {
                                type:"post",
                                async:false,
                                url:"/dmam/station/verifyusername/" ,
                                data:{
                                    username:function(){return $("#username").val();}
                                },
                                dataFilter:function(data){
                                    var resultData = $.parseJSON(data);
                                    if(resultData.success == true){
                                        return true;
                                    }else{
                                        if(resultData.msg != null && resultData.msg != ""){
                                            layer.msg(resultData.msg,{move:false});
                                        }else{
                                            return false;
                                        }
                                    }
                                }
                            }
                        },
                        belongto :{
                            required : true,
                        },
                        meter : {
                            required : true,
                        }
                    },
                    messages : {
                        username : {
                            required : userNameNull,
                            remote:"该名称已被使用"
                        },
                        belongto :{
                            required : "请选择所属组织",
                        },
                        meter : {
                            required : "请关联表具"
                        }
                    }
                }).form();
            }

        },
        getsTheCurrentTime: function () {
            var time=$("#madedate").val();
                var nowDate = new Date();
                var startTime = parseInt(nowDate.getFullYear()+1)
                    + "-"
                    + (parseInt(nowDate.getMonth() + 1) < 10 ? "0"
                        + parseInt(nowDate.getMonth() + 1)
                        : parseInt(nowDate.getMonth() + 1))
                    + "-"
                    + (nowDate.getDate() < 10 ? "0" + nowDate.getDate()
                        : nowDate.getDate()) + " ";
                $("#madedate").val(startTime);
        },
        setImagePreview:function(){
            console.log('setImagePreviewico')
            // stationAdd.uploadImageIco(); // 上传图片到服务器 
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
    }
    $(function(){
        var myTable;
            ol3ops.init();
            stationAdd.init();
        stationAdd.initUsertype();
        // stationAdd.initRefer();
        $('input').inputClear();
        var userId = $("#currentUserId").val();
        console.log('userId',$("#userId").val());
        console.log('current userId',$("#currentUserId").val());

        $(':radio:not(:checked)').attr('disabled', true);

        $("#locatesel").on("change",stationAdd.locatechange);
        // $("#doc-ico").on("change",stationAdd.setImagePreview);

        // if ($("#userId").val() == userId) {
        //     $("#zTreeStationSelEdit").attr("disabled","disabled"); // 禁用选择组织控件
        //     $("#state").attr("disabled","disabled"); // 禁用启停状态下拉选
        //     $("#authorizationDateEdit").attr("disabled","disabled"); // 禁用选择授权截止日期控件
        // } else {
        //     $("#zTreeStationSelEdit").on("click",function(){stationAdd.showMenu(this)});
        // }
        $("#zTreeStationSelEdit").on("click",function(){stationAdd.showMenu(this)});
        $("#doSubmitEdit").on("click",stationAdd.doSubmit);
        // 解决怪异问题：地图在页面打开是不显示，窗口大小改变后才显示
        setTimeout(function(){map.updateSize();}, 200);
        
    })
})($,window)
