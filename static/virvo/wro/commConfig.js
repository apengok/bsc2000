(function(window,$){
    var selectTreeId = '';
    var selectTreepId="";
    var selectTreeType = '';

    //显示隐藏列
    var menu_text = "";
    var table = $("#dataTable tr th:gt(1)");
    //单选
    var subChk = $("input[name='subChk']");
    commConfig = {
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
                            var editUrlPath = myTable.editUrl + row.id + "/"; //修改地址
                            var roleUrlPre = /*[[@{/c/user/roleList_{id}.gsp}]]*/'url';
                            var result = '';
                            //修改按钮
                            result += '<button href="'+editUrlPath+'" data-target="#commonSmWin" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp;';
                            //删除按钮
                            result += '<button type="button" onclick="myTable.deleteItem(\''
                                    + row.id
                                    + '\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>删除</button>';

                            return result;
                        }
                    }, {
                        "data" : "commname",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data != null) {
                                return data;
                            } else{
                                return "";
                            }
                        }
                    }, {
                        "data" : "commtype",
                        "class" : "text-center",
                        render : function(data, type, row, meta) {
                            if (data == 0) {
                                return "集中器";
                            } else if(data == 1){
                                return "大表";
                            }else{
                                return "";
                            }
                        }
                        
                    },{
                        "data" : "tcpport",
                        "class" : "text-center",
                        
                    } ,
                    {
                        "data" : "commprotocol",
                        "class" : "text-center",
                        

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
                listUrl : '/sysm/commconfig/list/',
                editUrl : '/sysm/commconfig/edit/',
                deleteUrl : '/sysm/commconfig/delete/',
                deletemoreUrl : '/sysm/commconfig/deletemore/',
                // enableUrl : '/devm/meter/enable_',
                // disableUrl : '/devm/meter/disable_',
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
        
        

    }

    $(function(){
        $('input').inputClear();
        commConfig.init();
        
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
        $("#checkAll").bind("click",commConfig.cleckAll);
        //单选
        subChk.bind("click",commConfig.subChkClick);
        //批量删除
        $("#del_model").bind("click",commConfig.delModel);
        //加载完成后执行
        $("#refreshTable").on("click",commConfig.refreshTable);
        
    })
})(window,$)