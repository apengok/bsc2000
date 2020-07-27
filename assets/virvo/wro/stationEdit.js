(function($,window){
    var isAdminStr = $("#isAdmin").attr("value");//是否是admin
    var AuthorizedDeadline = $("#userAuthorizationDate").attr("value");//获取当前用户授权截止日期
    var zTreeStationSelEdit = $("#zTreeStationSelEdit").val();
    var relate_meter = $("#relate_meter").val();
    // var locate = $("#locate").val();

    var flag1 = false;
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

            // var center = [118.39469563,29.888188578];
            var center;
            if(!isNaN(Number.parseFloat(lng)) && !isNaN(Number.parseFloat(lng)) ){
                center = [Number.parseFloat(lng),Number.parseFloat(lat)];
            } else{
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
                center = [longitude,latitude];
            }
            console.log(center)
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


            if(!isNaN(lng) && !isNaN(lat))
            {
                console.log(lng,lat)
                vectorLayer.getSource().clear();
                var marker = createMarker(center)
                vectorLayer.getSource().addFeature(marker);
                // map.updateSize();
            }

            

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

    var stationEdit = {
        //初始化
        init:function(){
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
                    beforeClick : stationEdit.beforeClick,
                    onClick : stationEdit.onClick

                }
            };
            $.fn.zTree.init($("#ztreeDemoEdit"), setting, null);
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
           
           $("[name=meter_type]").val([$("#metertypeEdit").val()]);

           $("#locatesel option").filter(function() {
                return $(this).text() == locate;
            }).attr('selected', true);
            
            if(focus == "1"){
                $("#focusBtn").removeClass("btn btn-default").attr("class","btn btn-primary")
            }

            if(biguser == "1"){
                $("#biguserBtn").removeClass("btn btn-default").attr("class","btn btn-primary")
            }

           // $('#relate_meter').val(relate_meter).trigger('onSetSelectValue', [relate_meter]);
        },
        beforeClick: function(treeId, treeNode){
            var check = (treeNode);
            return check;
        },
        onClick: function(e, treeId, treeNode){
            
            var zTree = $.fn.zTree.getZTreeObj("ztreeDemoEdit"), nodes = zTree
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
            $("body").bind("mousedown", stationEdit.onBodyDown);
        },
        hideMenu: function(){
            $("#zTreeContentEdit").fadeOut("fast");
            $("body").unbind("mousedown", stationEdit.onBodyDown);
        },
        onBodyDown: function(event){
            if (!(event.target.id == "menuBtn" || event.target.id == "zTreeContentEdit" || $(event.target).parents("#zTreeContentEdit").length > 0)) {
                stationEdit.hideMenu();
            }
        },
        valueChange:function () { // 判断值是否改变
            var edit_userid = $("#userid").val();
            var edit_username = $("#username").val();
            var edit_description  = $("#description").val();
            var edit_zTreeStationSelEdit = $("#zTreeStationSelEdit").val();
            var edit_usertype = $("#usertype").val();
            var edit_relate_meter = $("#relate_meter").val();
            var edit_serialnumber = $("#serialnumber").val();
            var edit_simid = $("#simid").val();
            var edit_metertype = $("input[type='radio']:checked").val();
            var edit_dn = $("#dn").val();
            var edit_madedate = $("#madedate").val();
            var edit_lng = $("#lng").val();
            var edit_lat = $("#lat").val();
            var edit_locate = $("#installationsite").val();
            var edit_focus = $("#focusVal").val();
            var edit_biguser = $("#biguserVal").val();
            // 值已经发生改变
            if (userid != edit_userid ||username != edit_username || description != edit_description || zTreeStationSelEdit != edit_zTreeStationSelEdit || usertype != edit_usertype
                || madedate != edit_madedate || lng != edit_lng || lat != edit_lat || locate != edit_locate || focus != edit_focus || biguser != edit_biguser
                || relate_meter != edit_relate_meter ) {
                    flag1 = true;
            } else { // 表单值没有发生改变
                
                flag1 = false;
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
            json_ajax("POST",url,"json",true,parameter, stationEdit.setUsertype);
        },
        setUsertype:function(data){
            if(data.success == true){
                // $("#phoneBookObject,#infoDemandObject,#eventObject,#gnssObject,#videoCameraObject,#telephoneObject,#locationObject,#specifyServerObject,#UpgradeObject,#terminalObject,#reportObject,#baseStationObject").val(vehicleList);
                if(data.msg == ''&&data.obj.operation!= null){
                    stationEdit.initUsertypeList(data.obj.operation);
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
            var url="/api/devm/meter/getMeterSelect/";
            var parameter={};
            // var parameter={"vid": currentVehicle,"commandType":treeNode.id,"isRefer":false};
            json_ajax("GET",url,"json",true,parameter, stationEdit.setRefer);
        },
        setRefer:function(data){
            if(data.success == true){
                // $("#phoneBookObject,#infoDemandObject,#eventObject,#gnssObject,#videoCameraObject,#telephoneObject,#locationObject,#specifyServerObject,#UpgradeObject,#terminalObject,#reportObject,#baseStationObject").val(vehicleList);
                if(data.msg == null&&data.obj!= null){
                    stationEdit.initReferMeterList(data.obj);
                }
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        initReferMeterList: function(data){
        
            //meter list
            var meterlist = data;
            // console.log('meterlist:',meterlist);

            // 初始化车辆数据
            var dataList = {value: data};
            
            
            $("#relate_meter").bsSuggest({
                indexId: 1,  //data.value 的第几个数据，作为input输入框的内容
                indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
                idField: "id",
                keyField: "name",
                effectiveFields: ["name"],
                searchFields:["id"],
                data: dataList
            }).on('onDataRequestSuccess', function (e, result) {
                //更精确的查找
                console.log("onDataRequestSuccess");
                $(this).click().next().find('ul tr td').each(function() {
                    //拿缓存的信息作比对，比如文本
                    if ($(this).text() === meter) {
                        $(this).parents('tr').trigger('mousedown');
                        //终止继续 each
                        return false;
                    }
                });
            }).on('onSetSelectValue', function (e, keyword, data) {
                // 当选择meter
                

                var meterid = keyword.id;
                var url="/dmam/station/getmeterParam/";
                var parameter={"mid": meterid};
                json_ajax("POST",url,"json",true,parameter, stationEdit.setMeterParam);
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
        setImagePreview: function(di1,pi1,li1){
            // personalizedConfiguration.uploadImageIndex(); // 上传图片到服务器 
            console.log("preview")
            var docObj=document.getElementById(di1);
            var imgObjPreview=document.getElementById(pi1);
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
                var localImagId = document.getElementById(li1);
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
        doSubmit: function(){
            
            stationEdit.valueChange();
            if (flag1){
                if(stationEdit.validates()){
                    $('#simpleQueryParam').val("");
                    //验证通过后,获取到用户名，与窗口加载时的用户名比较,看用户是否修改过用户名
                    var nowUserName = $("#username").val();
                    if(nowUserName === userName){
                        //如果没有修改用户名
                        //则重新赋值
                        $("#sign").val("1");
                    }
                    $("#editForm").ajaxSubmit(function(data) {
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
            } else {
                $("#commonLgWin").modal("hide"); // 关闭窗口
            }
        },
        //校验
        validates: function(){
        
            return $("#editForm").validate({
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
                                console.log(data)
                                var resultData = $.parseJSON(data);
                                if(resultData.success == true){
                                    return true;
                                }else{
                                    if(username == $("#username").val()){
                                        return true;    //没有修改站点名
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
    }
    $(function(){
        var myTable;
        
        stationEdit.initUsertype();
        
        stationEdit.initRefer();
        stationEdit.init();
        ol3ops.init();
        map.updateSize();
        $('input').inputClear();
        var userId = $("#currentUserId").val();
        console.log('userId',$("#userId").val());
        console.log('current userId',$("#currentUserId").val());

        $(':radio:not(:checked)').attr('disabled', true);

        $("#locatesel").on("change",stationEdit.locatechange);
        $("#doc-index1").on("change",function(){
            stationEdit.setImagePreview("doc-index1","preview-index1","localImag-index1");
        });
        $("#doc-index2").on("change",function(){
            stationEdit.setImagePreview("doc-index2","preview-index2","localImag-index2");
        });
        $("#doc-index3").on("change",function(){
            stationEdit.setImagePreview("doc-index3","preview-index3","localImag-index3");
        });
        $("#doc-index4").on("change",function(){
            stationEdit.setImagePreview("doc-index4","preview-index4","localImag-index4");
        });
        $("#doc-index5").on("change",function(){
            stationEdit.setImagePreview("doc-index5","preview-index5","localImag-index5");
        });
        

        if ($("#userId").val() == userId) {
            $("#zTreeStationSelEdit").attr("disabled","disabled"); // 禁用选择组织控件
            $("#state").attr("disabled","disabled"); // 禁用启停状态下拉选
            $("#authorizationDateEdit").attr("disabled","disabled"); // 禁用选择授权截止日期控件
        } else {
            $("#zTreeStationSelEdit").on("click",function(){stationEdit.showMenu(this)});
        }
        $("#doSubmitEdit").on("click",stationEdit.doSubmit);

        // 解决怪异问题：地图在页面打开是不显示，窗口大小改变后才显示
        setTimeout(function(){map.updateSize();}, 200);
    })
})($,window)
