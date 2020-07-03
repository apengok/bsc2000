(function($,window){
    var $subChk = $("input[name='subChk']");
    var selectTreeId = '';
    var selectTreeType = '';
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
    var startOperation;// 点击运营资质类别的修改按钮时，弹出界面时运营资质类别文本的内容
    var expliant;// 点击运营资质类别的修改按钮时，弹出界面时说明文本的内容
    var vagueSearchlast = $("#operationType").val();
    var stationdataListArray = [];
    var dataListArray = [];
    var endTime;// 当天时间
    var sTime;
    var eTime;
    var key = true;
    var vid;
    var carLicense = [];
    var activeDays = [];
    
    var bflag = true;
    var zTreeIdJson = {};
    var barWidth;
    var number;
    var checkFlag = false; //判断组织节点是否是勾选操作
    var size;//当前权限监控对象数量

    var organ = '';     //组织
    var station = '';
    var community = '';
    var dma_pk = $("#dma_pk").val(); //分区id
    var dma_no = $("#dma_no").val(); //分区编号
    var dma_name = $("#dma_name").val(); //分区名
    var current_dma_group = $("dma_group").val(); //分区所在组织

    var meter_types = ["出水表","进水表","贸易结算表","未计费水表","官网检测表"];

    var dmastation_list = $("#dmastation_list").val()

    console.log(dmastation_list);


    var myTable;
    var rows_selected = [];
    var edit_dmastation_list = [];
    var change_flag = false;

    dmaStation = {
        init: function(){
            console.log("dmaStation init");
            dmaStation.tableFilter();
            // dmaStation.getsTheMaxTime();
            // laydate.render({elem: '#endtime',max: dmaStation.getsTheMaxTime(),theme: '#6dcff6'});
        },
        tableFilter: function(){
            //显示隐藏列
            var menu_text = "";
            var table = $("#stationdataTable tr th:gt(1)");
            menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(2) +"\" disabled />"+ table[0].innerHTML +"</label></li>"
            for(var i = 1; i < table.length; i++){
                menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(i+2) +"\" />"+ table[i].innerHTML +"</label></li>"
            };
            $("#Ul-menu-text").html(menu_text);
        },
        getsTheMaxTime: function () {
            
                var nowDate = new Date();
                maxTime = parseInt(nowDate.getFullYear())
                    + "-"
                    + (parseInt(nowDate.getMonth() + 1) < 10 ? "0"
                        + parseInt(nowDate.getMonth() + 1)
                        : parseInt(nowDate.getMonth() + 1))
                    + "-"
                    + (nowDate.getDate() < 10 ? "0" + nowDate.getDate()
                        : nowDate.getDate()) + " ";
                $("#endtime").val(maxTime);
                return maxTime
            },
        userTree : function(){
            // 初始化文件树
            treeSetting = {
                async : {
                    url : "/api/entm/organization/tree/",
                    type : "GET",
                    enable : true,
                    autoParam : [ "id" ],
                    dataType : "json",
                    data:{'csrfmiddlewaretoken': '{{ csrf_token }}'},
                    otherParam : {  // 是否可选 Organization
                        "isStation" : "1",
                        "isDma":"1",
                        "isCommunity":"1",
                        // "csrfmiddlewaretoken": "{{ csrf_token }}"
                    },
                    dataFilter: dmaStation.ajaxDataFilter
                },
                view : {
                    // addHoverDom : dmaStation.addHoverDom,
                    // removeHoverDom : dmaStation.removeHoverDom,
                    selectedMulti : true,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree
                },
                edit : {
                    enable : true,
                    editNameSelectAll : true,
                    showRemoveBtn : false,//dmaStation.showRemoveBtn,
                    showRenameBtn : false
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    // beforeDrag : dmaStation.beforeDrag,
                    // beforeEditName : dmaStation.beforeEditName,
                    // beforeRemove : dmaStation.beforeRemove,
                    // beforeRename : dmaStation.beforeRename,
                    // onRemove : dmaStation.onRemove,
                    // onRename : dmaStation.onRename,
                    beforeClick : dmaStation.beforeClick,
                    onClick : dmaStation.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#stationtreeDemo"), treeSetting, zNodes);
            var treeObj = $.fn.zTree.getZTreeObj('stationtreeDemo');treeObj.expandAll(true);
           
        },
        beforeClick: function(treeId, treeNode){
            var zTree = $.fn.zTree.getZTreeObj("stationtreeDemo");
            if(treeNode.otype != "station" || treeNode.otype != "dma" || treeNode.otype != "community"){
                zTree.cancelSelectedNode(treeNode);
                
            }
            // var check = (treeNode);
            // return check;
        },
        
        // 组织树预处理函数
        ajaxDataFilter: function(treeId, parentNode, responseData){
            var treeObj = $.fn.zTree.getZTreeObj("stationtreeDemo");
            if (responseData) {
                for (var i = 0; i < responseData.length; i++) {
                        responseData[i].open = true;
                }
            }
            return responseData;
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
        selectAll: function(){
            var zTree = $.fn.zTree.getZTreeObj("stationtreeDemo");
            zTree.treeSetting.edit.editNameSelectAll = $("#selectAll").attr("checked");
        },
        //点击节点
        zTreeOnClick: function(event, treeId, treeNode){

            var zTree = $.fn.zTree.getZTreeObj("stationtreeDemo");
            selectTreeId = treeNode.id;
            selectTreeType = treeNode.otype;
            selectDistrictId = treeNode.districtid;
            selectTreeIdAdd = treeNode.uuid;
            $('#simpleQueryParam').val("");

            if(treeNode.otype == "dma" ){
                // zTree.cancelSelectedNode(treeNode);
                if(dma_name == treeNode.name){
                    return
                }
                var pNode = treeNode.getParentNode(); //父节点---组织

                if (change_flag) {
                    layer.confirm("分区编辑中，是否换到其他分区",{
                        title :'操作确认',
                        icon : 3, // 问号图标
                        btn: ['确认','取消'] // 按钮
                    },function(index){
                        // layer.msg('yes', {icon: 1});
                        change_flag = false;
                        dma_pk = treeNode.id;
                        dma_name = treeNode.name;
                        $("#dma_pk").attr("value",dma_pk);
                        $("#dma_name").attr("value",dma_name);
                        $("#dma_group").attr("value",pNode.name);
                        $("#current_dma span").html(dma_name);

                        layer.close(index,{move:false});
                        edit_dmastation_list = [];
                        dmaStation.inquireDmastations(1);
                        zTree.cancelSelectedNode(treeNode);
                    },function(index){
                        layer.close(index,{move:false});
                    });
                }else{
                    dma_pk = treeNode.id;
                    dma_name = treeNode.name;
                    $("#dma_pk").attr("value",dma_pk);
                    $("#dma_name").attr("value",dma_name);
                    $("#dma_group").attr("value",pNode.name);
                    $("#current_dma span").html(dma_name);

                    dmaStation.inquireDmastations(1);
                    zTree.cancelSelectedNode(treeNode);
                }
                
                

            }else if(treeNode.otype == "station"){
                
                station = treeNode.id;
                
                var pNode = treeNode.getParentNode(); //父节点---组织
                var dma_group = $("#dma_group").val();
                if(dma_group != pNode.name){
                    // layer.msg("非当前组织站点");
                    layer.confirm("选择了非当前分区组织的站点,是否继续",{
                        title :'操作确认',
                        icon : 3, // 问号图标
                        btn: ['确认','取消'] // 按钮
                    },function(index){
                        layer.close(index,{move:false});
                        
                    },function(index){
                        zTree.cancelSelectedNode(treeNode);
                        layer.close(index,{move:false});
                    });
                }
                
                // if(treeNode.otype == "dma"){
                    
                //     // $("#organ_name").attr("value",pNode.name);
                //     $("#station_name").attr("value",treeNode.name);
                //     organ = pNode.id;
                //     station = treeNode.id;
                // }

            }else if(treeNode.otype == "community"){  //选择了小区
                
                community = treeNode.id;
                
                var pNode = treeNode.getParentNode(); //父节点---组织
                var dma_group = $("#dma_group").val();
                if(dma_group != pNode.name){
                    // layer.msg("非当前组织站点");
                    layer.confirm("选择了非当前分区组织的站点,是否继续",{
                        title :'操作确认',
                        icon : 3, // 问号图标
                        btn: ['确认','取消'] // 按钮
                    },function(index){
                        layer.close(index,{move:false});
                        
                    },function(index){
                        zTree.cancelSelectedNode(treeNode);
                        layer.close(index,{move:false});
                    });
                }
                
                // if(treeNode.otype == "dma"){
                    
                //     // $("#organ_name").attr("value",pNode.name);
                //     $("#station_name").attr("value",treeNode.name);
                //     organ = pNode.id;
                //     station = treeNode.id;
                // }

            }else{
                zTree.cancelSelectedNode(treeNode);
            }
        },

        
        export:function(){
            var zTree = $.fn.zTree.getZTreeObj("stationtreeDemo"), nodes = zTree.getSelectedNodes(), v = "";

                console.log(nodes);
            n = "";
            if(nodes.length == 0){
                layer.msg("没有站点选中",{move:false});
                return
            }
            nodes.sort(function compare(a, b) {
                return a.id - b.id;
            });
            // var oTable = $('#stationdataTable').dataTable();
            // var rowLength = oTable.rows().count();
            var oTable = document.getElementById('stationdataTable');

            // //gets rows of table
            var rowLength = oTable.rows.length;
            
            stationdataListArray=[];
            for (var i = 0, l = nodes.length; i < l; i++) {
                if($.inArray(nodes[i].id,edit_dmastation_list) !== -1){
                    layer.msg("该站点已存在");
                    zTree.cancelSelectedNode(nodes[i]);
                    continue;
                }

                if(nodes[i].type == "group" || nodes[i].type == "dma"){
                    layer.msg("请选择站点或小区导入");
                    continue;
                }
            
                var dateList=
                            {
                              "pnode_id":nodes[i].pId,
                              "station_id":nodes[i].id,
                              "dma_name":dma_name,
                              "station_name":nodes[i].name,
                              "metertype":"",
                              "commaddr":nodes[i].commaddr,
                              "station_type":nodes[i].dma_station_type
                              
                            };
                // oTable.row.add(dateList);
                stationdataListArray.push(dateList);
                edit_dmastation_list.push(nodes[i].id);
                // zTree.removeNode(nodes[i]);
            }
            dmaStation.rowaddData(stationdataListArray);
            console.log("row add data:",stationdataListArray);
            

            zTree.cancelSelectedNode();
            change_flag = true;
            // var tnodes = zTree.getSelectedNodes();
            // console.log("after cancle:",tnodes);
            
        },
        import:function(){
            var chechedNum = $("input[name='subChk']:checked").length;
            if (chechedNum == 0) {
                layer.msg("没有站点选中",{move:false});
                return
            }

            var table = $("#stationdataTable").dataTable();
            var rows = table.fnGetNodes();
            var list = [];
            var zTree = $.fn.zTree.getZTreeObj("stationtreeDemo");
            $.each(table.fnGetNodes(), function (index, value) {
                console.log(index,value);
                var obj = {};
                var checked_flag = $(value).find('input[type="checkbox"]:checked').length;
                if(checked_flag != 0 ){
                    // var station_id = $(value).find('input').val();
                    // var dma_name = $(value).find('td:eq(2)').html();
                    var station_name = $(value).find('td:eq(3)').html();
                    var metertype = $(value).find('select').val();

                    var sid = $(value).find('input[type="checkbox"]').attr('sid');
                    var commaddr = $(value).find('td:eq(5)').html();
                    
                    // 站点没有从左侧树删除，所以不用添加到树
                    // var pid = $(value).find('input[type="checkbox"]').attr('pid');
                    // var pnode = zTree.getNodeByParam("id", pid, null);
                    // var newNode = { id:sid, pId:pid, name:station_name,icon:"/static/virvo/resources/img/station.png",type:"station"};
                    // zTree.addNodes(pnode,0,newNode);

                    obj.station_id = sid;
                    obj.dma_name = dma_name;
                    obj.station_name = station_name;
                    obj.metertype = metertype;
                    obj.commaddr = commaddr;

                    list.push(obj);
                }
            });  
            var dmastation_json = JSON.stringify(list);
            console.log(dmastation_json);

            dmaStation.removeseleted();
            change_flag = true;
            
            // var anSelected = table.$('tr.selected');
            
            // $(anSelected).remove();
            
            zTree.cancelSelectedNode();
            
            
        },
        // ajax参数
        ajaxDataParamFun: function(d){
            d.simpleQueryParam = $('#simpleQueryParam').val(); // 模糊查询
            d.groupName = selectTreeId;
            d.districtId = selectDistrictId;
        },
        saveDmaStation:function(){
            console.log("saveDmaStation click",change_flag);
            if(change_flag == false){
                return
            }
            console.log("saveDmaStation");
            var table = $("#stationdataTable").dataTable();
            var rows = table.fnGetNodes();
            var list = [];
            $.each(table.fnGetNodes(), function (index, value) {
                // console.log(index,value);
                var obj = {};
                
                var dma_name = $(value).find('td:eq(2)').html();
                var station_name = $(value).find('td:eq(3)').html();
                var metertype = $(value).find('select').val();

                var sid = $(value).find('input[type="checkbox"]').attr('sid');

                var commaddr = $(value).find('td:eq(5)').html();
                var station_type = $(value).find('td:eq(6)').html();
                

                obj.station_id = sid;
                obj.dma_name = dma_name;
                obj.station_name = station_name;
                obj.metertype = metertype;
                obj.commaddr = commaddr;
                obj.station_type = station_type;

                list.push(obj);
                
            });  
            var dmastation_json = JSON.stringify(list);
            $("#dmastation_json").val(dmastation_json);
            var now_dma_pk = $("#dma_pk").val();

            var dma_id = 1;
            var url="/dmam/dmaStation/saveDmaStation/";
            // var parameter={"dma_id":dma_id};
            var data = {"dma_pk": dma_pk,"stationassign":dmastation_json};
            json_ajax("POST",url,"json",true,data,function(data) {
                    console.log('sdfe:',data);
                    if (data != null && typeof(data) == "object" &&
                        Object.prototype.toString.call(data).toLowerCase() == "[object object]" &&
                        !data.length) {//判断data是字符串还是json对象,如果是json对象
                            if(data.success == true){
                                $("#commonLgWin").modal("hide");//关闭窗口
                                change_flag = true;
                                layer.msg(publicAddSuccess,{move:false});
                                
                            }else{
                                layer.msg(data.msg,{move:false});
                            }
                    }else{//如果data不是json对象
                            var result = $.parseJSON(data);//转成json对象
                            if (result.success == true) {
                                    $("#commonLgWin").modal("hide");//关闭窗口
                                    layer.msg(publicAddSuccess,{move:false});
                                    
                            }else{
                                layer.msg(result.msg,{move:false});
                            }
                    }
                });

            // form submit cant resoled error
            // $("#dmastationform").attr("action","district/assignstation/"+now_dma_pk+"/");
            // $("#dmastationform").ajaxSubmit(function(data) {
            //         console.log('sdfe:',data);
            //         if (data != null && typeof(data) == "object" &&
            //             Object.prototype.toString.call(data).toLowerCase() == "[object object]" &&
            //             !data.length) {//判断data是字符串还是json对象,如果是json对象
            //                 if(data.success == true){
            //                     $("#commonLgWin").modal("hide");//关闭窗口
            //                     change_flag = true;
            //                     layer.msg(publicAddSuccess,{move:false});
                                
            //                 }else{
            //                     layer.msg(data.msg,{move:false});
            //                 }
            //         }else{//如果data不是json对象
            //                 var result = $.parseJSON(data);//转成json对象
            //                 if (result.success == true) {
            //                         $("#commonLgWin").modal("hide");//关闭窗口
            //                         layer.msg(publicAddSuccess,{move:false});
                                    
            //                 }else{
            //                     layer.msg(result.msg,{move:false});
            //                 }
            //         }
            //     });
            
            console.log(dmastation_json);
        },
        doSubmit:function () {
            if(dmaStation.validates()){
                $("#eadOperation").ajaxSubmit(function(data) {
                    console.log('sdfe:',data);
                    if (data != null && typeof(data) == "object" &&
                        Object.prototype.toString.call(data).toLowerCase() == "[object object]" &&
                        !data.length) {//判断data是字符串还是json对象,如果是json对象
                            if(data.success == true){
                                $("#addType").modal("hide");//关闭窗口
                                layer.msg(publicAddSuccess,{move:false});
                                dmaStation.closeClean();//清空文本框
                                $("#operationType").val("");
                                dmaStation.findOperation();
                            }else{
                                layer.msg(data.msg,{move:false});
                            }
                    }else{//如果data不是json对象
                            var result = $.parseJSON(data);//转成json对象
                            if (result.success == true) {
                                    $("#addType").modal("hide");//关闭窗口
                                    layer.msg(publicAddSuccess,{move:false});
                                    $("#operationType").val("");
                                    dmaStation.closeClean();//清空文本框
                                    dmaStation.findOperation();
                            }else{
                                layer.msg(result.msg,{move:false});
                            }
                    }
                });
            }
        },
        
        checkAll : function(e){
            $("input[name='subChk']").not(':disabled').prop("checked", e.checked);

        },
        checkAllTwo : function(e){
            $("input[name='subChkTwo']").prop("checked", e.checked);
        },
        
        unique: function (arr) {
            var result = [], hash = {};
            for (var i = 0, elem; (elem = arr[i]) != null; i++) {
                if (!hash[elem]) {
                    result.push(elem);
                    hash[elem] = true;
                }
            }
            return result;
        },
        
        inquireDmastations: function (number) {
            var dma_id = 1;
            var url="/dmam/dmaStation/getdmastationsbyId/";
            // var parameter={"dma_id":dma_id};
            var data = {"dma_pk": dma_pk};
            json_ajax("POST",url,"json",true,data,dmaStation.getCallback);
        },
        getCallback:function(date){
            
            if(date.success==true){
                edit_dmastation_list = []; //用来储存当前dma分区站点的id
                stationdataListArray = [];//用来储存显示数据
                if(date.obj!=null&&date.obj.length!=0){
                    var ustasticinfo=date.obj;
                    for(var i=0;i<ustasticinfo.length;i++){
                        
                        var dateList=
                            {
                              "pnode_id":ustasticinfo[i].pid,
                              "station_id":ustasticinfo[i].id,
                              "dma_name":dma_name,
                              "station_name":ustasticinfo[i].username,
                              "metertype":ustasticinfo[i].dmametertype,
                              "commaddr":ustasticinfo[i].commaddr,
                              "station_type":ustasticinfo[i].station_type
                            };
//                      if(stasticinfo[i].majorstasticinfo!=null||  stasticinfo[i].speedstasticinfo!=null|| stasticinfo[i].vehicleII!=null
//                        ||stasticinfo[i].timeoutParking!=null||stasticinfo[i].routeDeviation!=null||
//                       stasticinfo[i].tiredstasticinfo!=null||stasticinfo[i].inOutArea!=null||stasticinfo[i].inOutLine!=null){
                            stationdataListArray.push(dateList);
                            edit_dmastation_list.push(ustasticinfo[i].id);
//                      }
                    }
                    console.log(stationdataListArray);
                    dmaStation.reloadData(stationdataListArray);
                    // $("#simpleQueryParam").val("");
                    // $("#search_button").click();
                }else{
                    dmaStation.reloadData(stationdataListArray);
                    
                }
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        getTable: function(table){
            $('.toggle-vis').prop('checked', true);
            myTable = $(table).DataTable({
              "destroy": true,
              "dom": 'tiprl',// 自定义显示项
              "lengthChange": true,// 是否允许用户自定义显示数量
              "bPaginate": false, // 翻页功能
              "bFilter": false, // 列筛序功能
              "searching": true,// 本地搜索
              "ordering": false, // 排序功能
              "Info": false,// 页脚信息
              "autoWidth": true,// 自动宽度
              "stripeClasses" : [],
              "lengthMenu" : [ 10, 20, 50, 100, 200 ],
              "columns": [
                    { "data": null,
                        "render" : function(data, type, row, meta) {
                            // console.log("data:",data);
                            // console.log("row:",row);

                        var result = '';
                        result += '<input  type="checkbox" name="subChk"  sid="' + row.station_id + '" pid="'+ row.pnode_id +'" />';
                        return result;
                        
                        // if (idStr != userId) {
                        //     var result = '';
                        //     result += '<input  type="checkbox" name="subChk"  value="' + idStr + '" uid="'+ uid+'" />';
                        //     return result;
                        // }else{
                        //     var result = '';
                        //     result += '<input  type="checkbox" name="subChk" />';
                        //     return result;
                        // }
                        }
                    },
                    { "data": null },
                    { "data": "dma_name",
                        "render": function (data, type, row, meta) {
                            
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                            // return row[2];
                        }
                    },
                    { "data": "station_name",
                        "render": function (data, type, row, meta) {
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                            // return row[3];
                        }
                    },
                    {
                        "data": "metertype",
                        "render": function (data, type, row, meta) {
                            console.log(row);
                            var $select = $("<select></select>", {"id": "meter_type"+data,
                                "value": data
                            });
                            $.each(meter_types, function (k, v) {

                                var $option = $("<option></option>", {
                                    "text": v,
                                    "value": v
                                });
                                if (data === v) {
                                    $option.attr("selected", "selected")
                                }
                                $select.append($option);
                            });
                            console.log($select.prop("outerHTML"));
                            return $select.prop("outerHTML");
                        }
                    },
                    {
                        "data": "commaddr",
                        "className":"hidevalue",
                        "render": function (data, type, row, meta) {
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                        }
                    },
                    {
                        "data": "station_type",
                        "className":"hidevalue",
                        "render": function (data, type, row, meta) {
                            if(data == "null" || data == null || data == undefined){
                                data = "";
                            }
                            return data;
                        }
                    }
                ],
                'rowCallback': function(row, data, dataIndex){
                     // Get row ID
                     var rowId = data[0];
                     console.log("rowCallback",row)
                     // If row ID is in the list of selected row IDs
                     if($.inArray(rowId, rows_selected) !== -1){
                        $(row).find('input[type="checkbox"]').prop('checked', true);
                        $(row).addClass('selected');
                     }
                        change_flag = true;
                  },
              "pagingType" : "full_numbers", // 分页样式
              "dom" : "t" + "<'row'<'col-md-3 col-sm-12 col-xs-12'l><'col-md-4 col-sm-12 col-xs-12'i><'col-md-5 col-sm-12 col-xs-12'p>>",
              "oLanguage": {// 国际语言转化
                  "oAria": {
                      "sSortAscending": " - click/return to sort ascending",
                      "sSortDescending": " - click/return to sort descending"
                  },
                  "sLengthMenu": "显示 _MENU_ 记录",
                  "sInfo": "",
                  "sZeroRecords": "该分区还没有站点",
                  "sEmptyTable": "该分区还没有站点",
                  "sLoadingRecords": "正在加载数据-请等待...",
                  "sInfoEmpty": "",
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
                    { 'width': "10%", "targets": 0 },
                    { 'width': "20%", "targets": 1 },
                    { 'width': "30%", "targets": 2 },
                    { 'width': "30%", "targets": 3 },
                    
                ],
                
              },
              "order": [
                  [0, null]
              ],// 第一列排序图标改为默认

              });
              myTable.on('order.dt search.dt', function () {
                  myTable.column(1, {
                      search: 'applied',
                      order: 'applied'
                  }).nodes().each(function (cell, i) {
                      cell.innerHTML = i + 1;
                  });
              }).draw();
              //显示隐藏列
              
        },
        reloadData: function (dataList) {
            var currentPage = myTable.page()
            myTable.clear()
            myTable.rows.add(dataList)
            // myTable.page(currentPage).draw(false);
            myTable.columns.adjust().draw(false);

        },
        rowaddData: function (dataList) {
            var currentPage = myTable.page()
            // myTable.clear()
            myTable.rows.add(dataList)
            // myTable.page(currentPage).draw(false);
            myTable.columns.adjust().draw(false);

        },
        removeseleted: function (dataList) {
            var currentPage = myTable.page()
            // myTable.clear()
            myTable.row('.selected').remove().draw( false ); 
            

        },
        // 查询全部
        refreshTable: function(){
            selectTreeId = "";
            selectDistrictId = "";
            $('#simpleQueryParam').val("");
            var zTree = $.fn.zTree.getZTreeObj("stationtreeDemo");
            zTree.selectNode("");
            zTree.cancelSelectedNode();
            // myTable.requestData();
            dmaStation.inquireClick(1);
        },
        
    }
    $(function(){
        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_station_condition'){
                search_ztree('stationtreeDemo',id,'station');
            };
        });

        console.log("sdafsdfasdfasd");
        function updateDataTableSelectAllCtrl(table){
           var $table             = myTable.table().node();
           var $chkbox_all        = $('tbody input[type="checkbox"]', $table);
           var $chkbox_checked    = $('tbody input[type="checkbox"]:checked', $table);
           var chkbox_select_all  = $('thead input[name="select_all"]', $table).get(0);

           // If none of the checkboxes are checked
           if($chkbox_checked.length === 0){
              chkbox_select_all.checked = false;
              if('indeterminate' in chkbox_select_all){
                 chkbox_select_all.indeterminate = false;
              }

           // If all of the checkboxes are checked
           } else if ($chkbox_checked.length === $chkbox_all.length){
              chkbox_select_all.checked = true;
              if('indeterminate' in chkbox_select_all){
                 chkbox_select_all.indeterminate = false;
              }

           // If some of the checkboxes are checked
           } else {
              chkbox_select_all.checked = true;
              if('indeterminate' in chkbox_select_all){
                 chkbox_select_all.indeterminate = true;
              }
           }
        }
        
        dmaStation.userTree();
        
        dmaStation.init();
        
        dmaStation.getTable('#stationdataTable');

        
        dmaStation.inquireDmastations(1);

        // Handle click on checkbox
   $('#stationdataTable tbody').on('click', 'input[type="checkbox"]', function(e){
      var $row = $(this).closest('tr');


      // Get row data
      var data = myTable.row($row).data();

      // Get row ID
      var rowId = data[0];

      // Determine whether row ID is in the list of selected row IDs 
      var index = $.inArray(rowId, rows_selected);

      // If checkbox is checked and row ID is not in list of selected row IDs
      if(this.checked && index === -1){
         rows_selected.push(rowId);

      // Otherwise, if checkbox is not checked and row ID is in list of selected row IDs
      } else if (!this.checked && index !== -1){
         rows_selected.splice(index, 1);
      }

      if(this.checked){
         $row.addClass('selected');
      } else {
         $row.removeClass('selected');
      }

      // Update state of "Select all" control
      // updateDataTableSelectAllCtrl(table);

      // Prevent click event from propagating to parent
      e.stopPropagation();
   });

   // Handle click on table cells with checkboxes
   $('#stationdataTable').on('click', 'tbody td, thead th:first-child', function(e){
      $(this).parent().find('input[type="checkbox"]').trigger('click');
   });

   // Handle click on "Select all" control
   $('thead input[name="select_all"]').on('click', function(e){
      if(this.checked){
         $('#stationdataTable tbody input[type="checkbox"]:not(:checked)').trigger('click');
      } else {
         $('#stationdataTable tbody input[type="checkbox"]:checked').trigger('click');
      }

      // Prevent click event from propagating to parent
      e.stopPropagation();
   });

        
        // IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            dmaStation.refreshTable();
            var search;
            $("#search_station_condition").bind("focus",function(){
                search = setInterval(function(){
                    search_ztree('stationtreeDemo', 'search_station_condition','station');
                },500);
            }).bind("blur",function(){
                clearInterval(search);
            });
        }
        // IE9 end
        $("#checkAll").bind("click", dmaStation.checkAll);
        // 全选
        $("input[name='subChk']").click(function() {
            $("#checkAll").prop(
                "checked",
                subChk.length == subChk.filter(":checked").length ? true: false);
        });
        $("#export").on("click",dmaStation.export);
        $("#import").on("click",dmaStation.import);
        $("#saveDmaStation").on("click",dmaStation.saveDmaStation);

        // $("#selectAll").bind("click", dmaStation.selectAll);
        // 组织架构模糊搜索
        $("#search_station_condition").on("input oninput",function(){
            search_ztree('stationtreeDemo', 'search_station_condition','station');
        });       
        
        
        
    })
})($,window)
