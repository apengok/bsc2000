(function($,window){
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
    var startOperation;// 点击运营资质类别的修改按钮时，弹出界面时运营资质类别文本的内容
    var expliant;// 点击运营资质类别的修改按钮时，弹出界面时说明文本的内容
    var vagueSearchlast = $("#userType").val();
    stationManage = {
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
            columnDefs = [ {
                // 第一列，用来显示序号
                "searchable" : false,
                "orderable" : false,
                "targets" : 0
            }];
            columns = [
                {
                    // 第一列，用来显示序号
                    "data" : null,
                    "class" : "text-center"
                },
                {
                    "data" : null,
                    "class" : "text-center",
                    render : function(data, type, row, meta) {
                        var userId = $("#currentUserId").val();
                        var idStr = row.id;
                        var uid = row.user_name;
                        // var arrayObj = row.id.all;
                        // arrayObj.reverse();
                        // var idStr = arrayObj.join(",");
                        if (!row.related) {
                            var result = '';
                            result += '<input  type="checkbox" name="subChk"  value="' + idStr + '" uid="'+ uid+'" />';
                            return result;
                        }else{
                            var result = '';
                            result += '<input  type="checkbox" name="subChk" disabled/>';
                            return result;
                        }
                    }
                },
                {
                    "data" : null,
                    "class" : "text-center", // 最后一列，操作按钮
                    render : function(data, type, row, meta) {
                        var idStr = row.id;
                        // var arrayObj = row.id.all;
                        // var idStr = arrayObj.join(",");
                        var editUrlPath = myTable.editUrl + idStr + "/"; // 修改地址
                        
                        var result = '';
                        var userId = $("#currentUserId").val();
                        var userId2 = $("#currentUserId").attr("value");
                        // 修改按钮
                        result += '<button href="'+editUrlPath+'" data-target="#commonLgWin" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp;';
                        if(row.related){
                            result += '<button  type="button" onclick="stationManage.deleteStation_related(\''+idStr+'\')" class="deleteButton editBtn disableClick"><i class="fa fa-ban"></i>删除</button>';

                        }else{
                            result += '<button type="button" onclick="stationManage.deleteStation(\''+idStr+'\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>删除</button>';
                        }
                        return result;
                    }
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
                    "data" : "simid",
                    "class" : "text-center",
                    
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
                    "data" : "big_user",
                    "class" : "text-center",
                    render : function(data, type, row, meta) {
                        if (data == "1") {
                            return '是';
                        } else {
                            return '';
                        }
                    }
                } ,
                {
                    "data" : "focus",
                    "class" : "text-center",
                    render : function(data, type, row, meta) {
                        if (data == "1") {
                            return '是';
                        } else {
                            return '';
                        }
                    }
                } ,
                {
                    "data" : "madedate",
                    "class" : "text-center",
                    render : function (data,type,row,meta) {
                        if(data == "null" || data == null || data == undefined){
                            data = "";
                        }
                        return data;
                    }
                } ,
            ];
            // 表格setting
            setting = {
                suffix  : '/',
                listUrl : "/api/dmam/stations/list/",
                editUrl : "/dmam/stations/edit/",
                deleteUrl : "/dmam/stations/delete/",
                deletemoreUrl : "/dmam/stations/deletemore",
                enableUrl : "/dmam/stations/enable_",
                disableUrl : "/dmam/stations/disable_",
                columnDefs : columnDefs, // 表格列定义
                columns : columns, // 表格列
                dataTableDiv : 'dataTable', // 表格
                ajaxDataParamFun : stationManage.ajaxDataParamFun, // ajax参数
                pageable : true, // 是否分页
                showIndexColumn : true, // 是否显示第一列的索引列
                // "Scroll":{"sX":"200px","sY":"100%"},
                enabledChange : true
            };
            // 创建表格
            myTable = new TG_Tabel.createNew(setting);
            // 表格初始化
            myTable.init();
        },
        userTree : function(){
            // 初始化文件树
            treeSetting = {
                async : {
                    url : "/api/entm/organization/tree/",
                    // url : "/dmam/district/dmatree/",
                    type : "get",
                    enable : true,
                    autoParam : [ "id" ],
                    dataType : "json",
                    data:{'csrfmiddlewaretoken': '{{ csrf_token }}'},
                    otherParam : {  // 是否可选 Organization
                        "isOrg" : "1",
                        // "csrfmiddlewaretoken": "{{ csrf_token }}"
                    },
                    dataFilter: stationManage.ajaxDataFilter
                },
                view : {
                    // addHoverDom : stationManage.addHoverDom,
                    // removeHoverDom : stationManage.removeHoverDom,
                    selectedMulti : false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree
                },
                edit : {
                    enable : true,
                    editNameSelectAll : true,
                    showRemoveBtn : false,//stationManage.showRemoveBtn,
                    showRenameBtn : false
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    beforeDrag : stationManage.beforeDrag,
                    beforeEditName : stationManage.beforeEditName,
                    beforeRemove : stationManage.beforeRemove,
                    beforeRename : stationManage.beforeRename,
                    // onRemove : stationManage.onRemove,
                    onRename : stationManage.onRename,
                    onClick : stationManage.zTreeOnClick
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
            stationManage.showLog("[ " + stationManage.getTime() + " beforeEditName ]&nbsp;&nbsp;&nbsp;&nbsp; "
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
            stationManage.showLog("[ " + stationManage.getTime() + " beforeRemove ]&nbsp;&nbsp;&nbsp;&nbsp; "
                    + treeNode.name);
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.selectNode(treeNode);
            var result;
            layer.confirm(userGroupDeleteConfirm, {
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
                                type: 'POST',
                                url: '/dmam/district/dmatree/',
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
                                    myTable.requestData();
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
            stationManage.showLog("[ " + stationManage.getTime() + " onRemove ]&nbsp;&nbsp;&nbsp;&nbsp; "
                + treeNode.name);
        },
        beforeRename: function(treeId, treeNode, newName, isCancel){
            className = (className === "dark" ? "" : "dark");
            stationManage.showLog((isCancel ? "<span style='color:red'>" : "") + "[ " + stationManage.getTime()
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
            stationManage.showLog((isCancel ? "<span style='color:red'>" : "") + "[ " + stationManage.getTime()
                + " onRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name
                + (isCancel ? "</span>" : ""));
        },
        // 显示删除组织按钮
        showRemoveBtn: function(treeId, treeNode){
            return treeNode.children==undefined;
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
            var id = (100 + newCount);
            var pid = treeNode.id;
            pid = window.encodeURI(window.encodeURI(pid));
            
            var addStr = "<span class='button add' id='addBtn_"
                    + treeNode.tId
                    + "' title='增加' href='/dmam/district/add/?id="
                    + id
                    + "&pid="
                    + pid
                    + "' data-target='#commonWin' data-toggle='modal'></span>";
            var editStr = "<span class='button edit' id='editBtn_"
                    + treeNode.tId
                    + "' title='编辑' href='/dmam/district/edit/"
                    + pid
                    + "/' data-target='#commonWin' data-toggle='modal'></span>";
            var detailsStr = "<span class='button details' id='detailsBtn_"
                    + treeNode.tId
                    + "' title='详情'  href='/dmam/district/detail/"
                    + pid
                    + "/' data-target='#commonWin' data-toggle='modal'</span>";
            sDetails.after(detailsStr);
            sEdit.after(editStr);
            sObj.after(addStr);
            var btn = $("#addBtn_" + treeNode.tId);
            if (btn)
                btn.bind("click", function() {
                    var oldData;
                    $.ajax({
                        url: '/dmam/district/dmatree/',
                        type: 'POST',
                        data: {"isOrg" : "1"},
                        async:false,
                        dataType: 'json',
                        success: function (data) {
                            var data2 = JSON.stringify(data);
                            var addData = $.parseJSON(data2);
                            oldData = addData.length;
                        },
                    });
                    var windowId = 'commonWin'; 
                    $("#" + windowId).on("hidden.bs.modal", function(data) {
                        $(this).removeData("bs.modal");                     
                        $.ajax({
                            url: '/dmam/district/dmatree/',
                            type: 'POST',
                            data: {"isOrg" : "1"},
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
                    var windowId = 'commonWin';
                    $("#" + windowId).on("hidden.bs.modal", function(data) {
                        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                        var nodes = treeObj.getSelectedNodes();        
                        $(this).removeData("bs.modal");
                        $.ajax({
                            url: '/dmam/district/dmatree/',
                            type: 'POST',
                            data: {"isOrg" : "1"},
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
            myTable.requestData();
        },
        // ajax参数
        ajaxDataParamFun: function(d){
            d.simpleQueryParam = $('#simpleQueryParam').val(); // 模糊查询
            d.groupName = selectTreeId;
            d.districtId = selectDistrictId;
        },
        // 删除站点
        deleteStation: function(id){
            if (id == "uid=admin,ou=organization") {
                layer.msg(userSupermanagerDeleteTip,{move:false});
            }else{
                myTable.deleteItem(id);
            }
        },
        // 删除关联dma站点
        deleteStation_related: function(id){
            layer.msg("该站点已绑定到DMA分区，请先解除",{move:false});
        },
        // 查询全部
        refreshTable: function(){
            selectTreeId = "";
            selectDistrictId = "";
            $('#simpleQueryParam').val("");
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.selectNode("");
            zTree.cancelSelectedNode();
            myTable.requestData();
        },
        // 批量删除
        delModel: function(){
            // 判断是否至少选择一项
            console.log('批量删除');
            var chechedNum = $("input[name='subChk']:checked").length;
            if (chechedNum == 0) {
                layer.msg(userDeleteChooseNull,{move:false});
                return
            }
            var checkedList = new Array();
            var flag = true;
            $("input[name='subChk']:checked").each(function() {
                console.log("$(this).val():",$(this).val(),$(this).attr("uid"));
                var uid = $(this).attr("uid"); //pengwl
                // if ($(this).val() == "uid=admin,ou=organization") {
                if(uid == "admin"){
                    flag = false;
                    return false;
                }else{
                    checkedList.push($(this).val());
                }
            });
            if (flag) {
                myTable.deleteItems({
                    'deltems' : checkedList.join(";")
                });
            }else{
                layer.msg(userSupermanagerDeleteTip,{move:false});
            }
        },
        findUsertype:function(){
            var vagueSearch = $("#userType").val();
            var url="/dmam/station/findUsertypes";
            var data={"type":vagueSearch};
            json_ajax("POST", url, "json", true,data,stationManage.findCallback);
        },
        findCallback:function(data){
            if(data.success){
                var operations=[];
                if(data.obj.operation != null || data.obj.operation.length>0){
                    var calldata = data.obj.operation;
                    var s=0;
                    for(var i=0;i<calldata.length;i++){
                        var list=[
                                 ++s,
                                 '<input type="checkbox" id="checkAllTwo" name="subChkTwo" value="'+calldata[i].id+'">',
                                 '<button onclick="stationManage.findUsertypeById(\''+calldata[i].id+'\')" data-target="#updateType" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp<button type="button"  onclick="stationManage.deleteType(\''+calldata[i].id+'\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>删除</button>',    
                                 calldata[i].userType,
                                 calldata[i].explains
                                 ];
                        operations.push(list);
                    }
                }
                console.log(operations);
                reloadData(operations);
            }else{
                layer.msg(data.msg);
            }
        },
         getTable:function(table,operations){
           myTableTwo = $(table).DataTable({
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
        },
        doSubmit:function () {
            if(stationManage.validates()){
                $("#adduserType").ajaxSubmit(function(data) {
                    console.log('sdfe:',data);
                    if (data != null && typeof(data) == "object" &&
                        Object.prototype.toString.call(data).toLowerCase() == "[object object]" &&
                        !data.length) {//判断data是字符串还是json对象,如果是json对象
                            if(data.success == true){
                                $("#addType").modal("hide");//关闭窗口
                                layer.msg(publicAddSuccess,{move:false});
                                stationManage.closeClean();//清空文本框
                                $("#userType").val("");
                                stationManage.findUsertype();
                            }else{
                                layer.msg(data.msg,{move:false});
                            }
                    }else{//如果data不是json对象
                            var result = $.parseJSON(data);//转成json对象
                            if (result.success == true) {
                                    $("#addType").modal("hide");//关闭窗口
                                    layer.msg(publicAddSuccess,{move:false});
                                    $("#userType").val("");
                                    stationManage.closeClean();//清空文本框
                                    stationManage.findUsertype();
                            }else{
                                layer.msg(result.msg,{move:false});
                            }
                    }
                });
            }
        },
        updateDoSubmit:function () {
            stationManage.init();
            if(stationManage.upDateValidates()){
                var userType=$("#updateuserType").val();// 运营资质类型
                var explains=$("#updateDescription").val();// 说明
                var data={"id":OperationId,"userType":userType,"explains":explains};
                var url="station/updateOperation";
                json_ajax("POST", url, "json", true,data,stationManage.updateCallback);
            }
        },
        closeClean:function(){
            $("#addpruserType").val("");
            $("#adddescription").val("");
            $("#addpruserType-error").hide();//隐藏上次新增时未清除的validate样式
            $("#adddescription-error").hide();
        },
        updateClean:function () {
            $("#updateuserType-error").hide();
            $("#updateDescription-error").hide();
        },
        findUsertypeById:function(id){
            OperationId=id;
            var data={"id":OperationId};
            var url="station/findUsertypeById";
            json_ajax("POST",url,"json",true,data,stationManage.findByIdback);
        },
        findByIdback:function(data){
            if(data.success==true){
                 $("#updateuserType").val(data.obj.operation.userType);
                 $("#updateDescription").val(data.obj.operation.explains);
                 startOperation=$("#updateuserType").val();
                 console.log('startOperation:',startOperation);
                 expliant=$("#updateDescription").val();
            }else{
                 layer.msg(data.msg,{move:false});
            }
        },
        updateCallback:function(data){
            if(data.success == true){
                $("#updateType").modal('hide');
                layer.msg("修改成功");
                stationManage.findUsertype();
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        deleteType:function(id){
            layer.confirm(publicDelete, {
                title :'操作确认',
                icon : 3, // 问号图标
                btn: [ '确定', '取消'] // 按钮
            }, function(){
                var url="station/deleteOperation";
                var data={"id" : id}
                json_ajax("POST", url, "json", false,data,stationManage.deleteCallback);
            });
        },
        deleteCallback:function(data){
            if(data.success==true){
                layer.closeAll('dialog');
                stationManage.findUsertype();
            }else{
                layer.msg(publicError,{move:false});
            }
        },
        deleteTypeMore : function(){
            // 判断是否至少选择一项
            var chechedNum = $("input[name='subChkTwo']:checked").length;
            if (chechedNum == 0) {
                layer.msg(selectItem);
                return
            }
            var ids="";
            $("input[name='subChkTwo']:checked").each(function() {
                ids+=($(this).val())+",";
            });
            var url="station/deleteOperationMore";
            var data={"ids" : ids};
            layer.confirm(publicDelete, {
                title :'操作确认',
                icon : 3, // 问号图标
                btn: [ '确定', '取消'] // 按钮
            }, function(){
                json_ajax("POST", url, "json", false,data,stationManage.deleteOperationMoreCallback);
                layer.closeAll('dialog');
            });
        },
        deleteOperationMoreCallback : function(data){
            if(data.success){
                layer.msg(publicDeleteSuccess);
                stationManage.findUsertype();
            }else{
                layer.msg(data.msg,{move:false});
            }
        },
        findUsertypeByVague:function(){
            stationManage.findUsertype();
        },
        findDownKey:function(event){
            if(event.keyCode==13){
                stationManage.findUsertype();
            }
        },
        checkAll : function(e){
            $("input[name='subChk']").not(':disabled').prop("checked", e.checked);

        },
        checkAllTwo : function(e){
            $("input[name='subChkTwo']").prop("checked", e.checked);
        },
        addStation : function (){
            $("#addStation").attr("href","/dmam/stations/add/newstation?uuid="+selectTreeIdAdd+"");
        },
        validates:function () {//增加运营资质类别时的数据验证
           return $("#adduserType").validate({
               rules : {
                   usertype: {
                       required: true,
                       stringCheck: true,
                       maxlength: 20,
                       minlength:2,
                       remote: {
                           type:"post",
                           async:false,
                           url:"/dmam/station/findusertypeByusertype/" ,
                           data:{
                               type:function(){return $("#addpruserType").val();}
                           },
                       }
                   },
                   explains:{
                        stringCheck:true,
                        maxlength:30,
                   }
               },
               messages:{
                   usertype:{
                        required : userQualificationNull,
                        stringCheck : publicPerverseData,
                        maxlength : publicSize20,
                        minlength:publicMinSize2Length,
                        remote:userQualificationExists
                    },
                   explains : {
                        stringCheck:publicPerverseData,
                        maxlength:publicSize30
                   }
               }
           }).form();
        },
        upDateValidates:function () {//修改运营资质类别时的数据验证
            var userType=$("#updateuserType").val();// 运营资质类型
            var explains=$("#updateDescription").val();// 说明
            if(userType==startOperation && explains==expliant){
                $("#updateType").modal('hide');
            }else if(userType==startOperation && explains != expliant){
                return $("#edituserType").validate({
                    rules : {
                        usertype:{
                            required:true,
                            maxlength:20,
                            minlength:2
                        },
                        explains:{
                            stringCheck:true,
                            maxlength:30,
                        }
                    },
                    messages:{
                        usertype:{
                            required:userQualificationNull,
                            maxlength:publicSize20,
                            minlength:publicMinSize2Length
                        },
                        explains : {
                            stringCheck:publicPerverseData,
                            maxlength:publicSize30
                        }
                    }
                }).form();
            }else{
                return $("#edituserType").validate({
                    rules : {
                        usertype: {
                            required: true,
                            stringCheck: true,
                            maxlength: 20,
                            remote: {
                                type:"post",
                                async:false,
                                url:"/dmam/station/findUsertypeCompare" ,
                                data:{
                                    type:function(){
                                        return $("#updateuserType").val();
                                    },
                                    recomposeType: function(){
                                        return startOperation;
                                    }
                                },
                                // dataFilter:function(data){
                                //     var resultData = $.parseJSON(data);
                                //     if(resultData.success == true){
                                //         return true;
                                //     }else{
                                //         return false;
                                //     }
                                // }
                            }
                        },
                        explains:{
                            stringCheck:true,
                            maxlength:30,
                        }
                    },
                    messages:{
                        usertype:{
                            required : userQualificationNull,
                            stringCheck : publicPerverseData,
                            maxlength : publicSize20,
                            remote:userQualificationExists
                        },
                        explains : {
                            stringCheck:publicPerverseData,
                            maxlength:publicSize30
                        }
                    }
                }).form();
            }

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
        stationManage.userTree();
        getTable('dataTables');
        stationManage.init();
        stationManage.findUsertype();
        // IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            stationManage.refreshTable();
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
        $("#selectAll").bind("click", stationManage.selectAll);
        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('treeDemo', 'search_condition','group');
        });       
        // 查询全部
        $('#refreshTable').on("click",stationManage.refreshTable);
        $("input[name='subChkTwo']").click(function(){
            $("#checkAllTwo").prop("checked",subChkTwo.lenght == subChkTwo.filter(":checked").length ? true:false);
        });
        // 全选
        $("input[name='subChk']").click(function() {
            $("#checkAll").prop(
                "checked",
                subChk.length == subChk.filter(":checked").length ? true: false);
        });
        // 批量删除
        $("#del_model").on("click",stationManage.delModel);
        $("#addoperation").on("click",stationManage.doSubmit);
        $("#deleteOperation").on("click",stationManage.deleteType);
        $("#updateOperation").on("click",stationManage.updateDoSubmit);
        $("#del_modelTwo").on("click",stationManage.deleteTypeMore);
        $("#search_operation").on("click",stationManage.findUsertypeByVague);
        $("#addStation").on("click",stationManage.addStation);
        $("#closeAdd").on("click",stationManage.closeClean);
        $("#updateClose").on("click",stationManage.updateClean);
    })
})($,window)
