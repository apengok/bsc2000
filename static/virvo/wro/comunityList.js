(function(window,$){
    var selectTreeId = '';
    var selectTreepId="";
    var selectTreeType = '';

    //显示隐藏列
    var menu_text = "";
    var table = $("#dataTable tr th:gt(1)");
    //单选
    var subChk = $("input[name='subChk']");
    communityManagement = {
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

                            if (row.related) {
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
                            var editUrlPath = myTable.editUrl + row.id + "/"; //修改地址
                            var roleUrlPre = /*[[@{/c/user/roleList_{id}.gsp}]]*/'url';
                            var result = '';
                            //修改按钮
                            result += '<button href="'+editUrlPath+'" data-target="#commonWin" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp;';
                            //删除按钮

                            if(row.related){
                                result += '<button  type="button" onclick="communityManagement.deleteComunity_related(\''
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
                        "data" : "name",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return "";
                            }
                        }
                    },{
                        "data" : "belongto",
                        "class" : "text-center",
                        
                    }, {
                        "data" : "address",
                        "class" : "text-center",
                        
                    },{
                        "data":"concentrator",
                        "class":"text-center"
                    }];
            //ajax参数
            var ajaxDataParamFun = function(d) {
                d.simpleQueryParam = $('#simpleQueryParam').val(); //模糊查询
                d.groupName = selectTreeId;
                d.groupType = selectTreeType;

            };
            //表格setting
            var setting = {
                suffix  : '/',
                listUrl : '/api/dmam/community/list/',
                editUrl : '/dmam/community/edit/',
                deleteUrl : '/dmam/community/delete/',
                deletemoreUrl : '/dmam/community/deletemore/',
                enableUrl : '/dmam/community/enable_',
                disableUrl : '/dmam/community/disable_',
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
        // 删除关联小区提示
        deleteComunity_related: function(id){
            layer.msg("该小区已绑定到DMA分区，请先解除",{move:false});
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
                    url : "/entm/user/oranizationtree/",
                    tyoe : "post",
                    enable : true,
                    autoParam : [ "id" ],
                    dataType : "json",
                    otherParam : {  // 是否可选  Organization
                        "isOrg" : "1"
                    },
                    dataFilter: communityManagement.groupAjaxDataFilter
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
                    onClick : communityManagement.zTreeOnClick
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
            if(treeNode.type=="group"){
                selectTreepId=treeNode.id;
                selectTreeId = treeNode.uuid;
            }else {
                selectTreepId=treeNode.pId;
                selectTreeId = treeNode.id;
            }
            selectTreeType = treeNode.type;
            myTable.requestData();
        },

    }

    $(function(){
        $('input').inputClear();
        communityManagement.init();
        communityManagement.groupListTree();
        $('input').inputClear().on('onClearEvent',function(e,data){
            var id = data.id;
            if(id == 'search_condition'){
                search_ztree('treeDemo', id,'assignment');
            };
        });
        //IE9
        if(navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE9.0") {
            var search;
            $("#search_condition").bind("focus",function(){
                search = setInterval(function(){
                    search_ztree('treeDemo', 'search_condition','assignment');
                },500);
            }).bind("blur",function(){
                clearInterval(search);
            });
        }
        //全选
        $("#checkAll").bind("click",communityManagement.cleckAll);
        //单选
        subChk.bind("click",communityManagement.subChkClick);
        //批量删除
        $("#del_model").bind("click",communityManagement.delModel);
        //加载完成后执行
        $("#refreshTable").on("click",communityManagement.refreshTable);
        // 组织架构模糊搜索
        $("#search_condition").on("input oninput",function(){
            search_ztree('treeDemo', 'search_condition', 'assignment');
        });

        // $("#addId").bind("click",function(){
        //     $("#addDistrictForm").modal("show")
        // })
    })
})(window,$)