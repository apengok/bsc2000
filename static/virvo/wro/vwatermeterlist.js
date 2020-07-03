(function(window,$){
    var selectTreeId = '';
    var selectTreepId="";
    var selectTreeType = '';

    var selectCommunity = "";
    var selectBuilding = "";

    //显示隐藏列
    var menu_text = "";
    var table = $("#dataTable tr th:gt(1)");
    //单选
    var subChk = $("input[name='subChk']");
    var communityTree = {
        init : function(){
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
                        "isCommunity" : "1",
                        // "isBuilding":"1",
                        // "csrfmiddlewaretoken": "{{ csrf_token }}"
                    },
                    dataFilter: communityTree.ajaxDataFilter
                },
                view : {
                    // addHoverDom : communityTree.addHoverDom,
                    // removeHoverDom : communityTree.removeHoverDom,
                    selectedMulti : false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree
                },
                // edit : {
                //     enable : true,
                //     editNameSelectAll : true,
                //     showRenameBtn : false
                // },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    // beforeDrag : dmaManage.beforeDrag,
                    // beforeEditName : dmaManage.beforeEditName,
                    // beforeRemove : dmaManage.beforeRemove,
                    // beforeRename : dmaManage.beforeRename,
                    // // onRemove : dmaManage.onRemove,
                    // onRename : dmaManage.onRename,
                    onClick : communityTree.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#commubitytreeDemo"), treeSetting, null);
            var treeObj = $.fn.zTree.getZTreeObj('commubitytreeDemo');treeObj.expandAll(true);
           
        },

        beforeDrag: function(treeId, treeNodes){
            return false;
        },
        beforeEditName: function(treeId, treeNode){
            className = (className === "dark" ? "" : "dark");
            dmaManage.showLog("[ " + dmaManage.getTime() + " beforeEditName ]&nbsp;&nbsp;&nbsp;&nbsp; "
                    + treeNode.name);
            var zTree = $.fn.zTree.getZTreeObj("commubitytreeDemo");
            zTree.selectNode(treeNode);
            return tg_confirmDialog(null,userGroupDeleteConfirm);
        },
        // 组织树预处理函数
        ajaxDataFilter: function(treeId, parentNode, responseData){
            var treeObj = $.fn.zTree.getZTreeObj("commubitytreeDemo");
            if (responseData) {
                for (var i = 0; i < responseData.length; i++) {
                        responseData[i].open = true;
                }
            }
            return responseData;
        },
        //点击节点
        zTreeOnClick: function(event, treeId, treeNode){
            selectTreeId = treeNode.id;
            selectDistrictId = treeNode.districtid;
            selectTreeIdAdd=treeNode.uuid;
            
            $('#simpleQueryParam').val("");
            
            
            // dmaManage.getBaseinfo();
            if(treeNode.otype == "community"){
                var pNode = treeNode.getParentNode();
                selectCommunity = treeNode.name;
                selectTreeType = "community";

                

            }else if(treeNode.otype == "building"){
                var pNode = treeNode.getParentNode();
                selectBuilding = treeNode.name;
                selectTreeType = "building";
                selectCommunity = pNode.name;
            }else{
                selectTreeType = "group";
            }
            myTable.requestData();
        },
    },
    vwatermeterManagement = {
        init: function(){
            menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(2) +"\" disabled />"+ table[0].innerHTML +"</label></li>"
            for(var i = 1; i < table.length; i++){
                menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(i+2) +"\" />"+ table[i].innerHTML +"</label></li>"
            };
            $("#Ul-menu-text").html(menu_text);
            //表格列定义
            var columnDefs = [ {
                //第一列，用来显示序号
                "searchable" : false,
                "orderable" : false,
                "targets" : 0
            } ];
            var columns = [
                    {
                        //第一列，用来显示序号
                        "data" : null,
                        "class" : "text-center"
                    },
                    {
                        "data" : null,
                        "class" : "text-center",
                        render : function(data, type, row, meta) {

                            if (row.station == "") {
                                var result = '';
                                result += '<input  type="checkbox" name="subChk"  value="' + row.id + '" />';
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
                        "class" : "text-center", //最后一列，操作按钮
                        render : function(data, type, row, meta) {
                            var editUrlPath = myTable.editUrl + row.amrs.id + "/"; //修改地址
                            var roleUrlPre = /*[[@{/c/user/roleList_{id}.gsp}]]*/'url';
                            var result = '';
                            //修改按钮
                            result += '<button href="'+editUrlPath+'" data-target="#commonWin" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp;';
                            //删除按钮
                            if(row.station == ""){
                                result += '<button disabled type="button" onclick="myTable.deleteItem(\''
                                    + row.id
                                    + '\')" class="deleteButton editBtn disableClick"><i class="fa fa-ban"></i>删除</button>';
                                }else{
                                result += '<button type="button" onclick="myTable.deleteItem(\''
                                    + row.id
                                    + '\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>删除</button>';
                                }
                            return result;
                        }
                    }, {
                        "data" : "serialnumber",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return row.amrs.serialnumber
                            }
                        }
                    },{
                        "data" : "numbersth",//户号
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return row.amrs.numbersth
                            }
                        }
                    },{
                        "data" : "buildingname",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return row.amrs.buildingname
                            }
                        }
                    }, {
                        "data" : "roomname",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return row.amrs.roomname
                            }
                        }
                    },{
                        "data" : "communityid",
                        "class" : "text-center",
                        
                    }, {
                        "data" : "concentrator",
                        "class" : "text-center",
                        
                    },{
                        "data" : "username",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return row.amrs.username
                            }
                        }
                    }, {
                        "data" : "usertel",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return row.amrs.usertel
                            }
                        }
                    },{
                        "data" : "dn",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return row.amrs.dn
                            }
                        }
                    }, {
                        "data" : "manufacturer",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return row.amrs.manufacturer
                            }
                        }
                    },{
                        "data" : "metercontrol",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (row.amrs.metercontrol == "1") {
                                return "是";
                            } else{
                                return "";
                            }
                        }
                        
                    }, {
                        "data" : "madedate",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return row.amrs.madedate
                            }
                        }
                    }];
            //ajax参数
            var ajaxDataParamFun = function(d) {
                d.simpleQueryParam = $('#simpleQueryParam').val(); //模糊查询
                d.groupName = selectTreeId;
                d.groupType = selectTreeType;
                d.selectBuilding = selectBuilding;
                d.selectCommunity = selectCommunity;
                d.selectTreeType = selectTreeType;

            };
            //表格setting
            var setting = {
                suffix  : '/',
                listUrl : '/api/wirelessm/watermeter/list/',
                editUrl : '/wirelessm/watermeter/edit/',
                deleteUrl : '/wirelessm/watermeter/delete/',
                deletemoreUrl : '/wirelessm/watermeter/deletemore/',
                enableUrl : '/wirelessm/watermeter/enable_',
                disableUrl : '/wirelessm/watermeter/disable_',
                columnDefs : columnDefs, //表格列定义
                columns : columns, //表格列
                dataTableDiv : 'dataTable', //表格
                ajaxDataParamFun : ajaxDataParamFun, //ajax参数
                pageable : true, //是否分页
                showIndexColumn : true, //是否显示第一列的索引列
                enabledChange : true
            };
            //创建表格
            myTable = new TG_Tabel.createNew(setting);
            //表格初始化
            myTable.init();
        },
        //全选
        cleckAll: function(){
            $("input[name='subChk']").prop("checked", this.checked);
        },
        //单选
        subChkClick: function(){
            $("#checkAll").prop("checked",subChk.length == subChk.filter(":checked").length ? true: false);
        },
        //批量删除
        delModel: function(){
            //判断是否至少选择一项
            var chechedNum = $("input[name='subChk']:checked").length;
            if (chechedNum == 0) {
                layer.msg(selectItem,{move:false});
                return
            }
            var checkedList = new Array();
            $("input[name='subChk']:checked").each(function() {
                checkedList.push($(this).val());
            });
            myTable.deleteItems({
                'deltems' : checkedList.toString()
            });
        },
        //加载完成后执行
        refreshTable: function(){
            $("#simpleQueryParam").val("");
//            selectTreeId = '';
//            selectTreeType = '';
//            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
//            zTree.selectNode("");
//            zTree.cancelSelectedNode();
            myTable.requestData();
        },
        groupListTree : function(){
            var treeSetting = {
                async : {
                    url : "/api/entm/organization/tree/",
                    type : "GET",
                    enable : true,
                    autoParam : [ "id" ],
                    dataType : "json",
                    otherParam : {  // 是否可选  Organization
                        "isOrg" : "1"
                    },
                    dataFilter: vwatermeterManagement.groupAjaxDataFilter
                },
                view : {
                    selectedMulti : false,
                    nameIsHTML: true,
                    fontCss: setFontCss_ztree
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    onClick : vwatermeterManagement.zTreeOnClick
                }
            };
            $.fn.zTree.init($("#treeDemo"), treeSetting, null);
        },
        //组织树预处理函数
        groupAjaxDataFilter: function(treeId, parentNode, responseData){
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            if (responseData) {
                for (var i = 0; i < responseData.length; i++) {
                    responseData[i].open = true;
                }
            }
            return responseData;
        },
        //点击节点
        zTreeOnClick: function(event, treeId, treeNode){
            if(treeNode.otype=="group"){
                selectTreepId=treeNode.id;
                selectTreeId = treeNode.uuid;
            }else {
                selectTreepId=treeNode.pId;
                selectTreeId = treeNode.id;
            }
            selectTreeType = treeNode.otype;
            myTable.requestData();
        },

    }

    $(function(){
        $('input').inputClear();
        communityTree.init();
        vwatermeterManagement.init();
        vwatermeterManagement.groupListTree();
        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('commubitytreeDemo', id,'assignment');
            };
        });
        //IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            var search;
            $("#search_condition").bind("focus",function(){
                search = setInterval(function(){
                    search_ztree('commubitytreeDemo', 'search_condition','assignment');
                },500);
            }).bind("blur",function(){
                clearInterval(search);
            });
        }
        //全选
        $("#checkAll").bind("click",vwatermeterManagement.cleckAll);
        //单选
        subChk.bind("click",vwatermeterManagement.subChkClick);
        //批量删除
        $("#del_model").bind("click",vwatermeterManagement.delModel);
        //加载完成后执行
        $("#refreshTable").on("click",vwatermeterManagement.refreshTable);
        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('commubitytreeDemo', 'search_condition', 'assignment');
        });

        // $("#addId").bind("click",function(){
        //     $("#addDistrictForm").modal("show")
        // })
    })
})(window,$)