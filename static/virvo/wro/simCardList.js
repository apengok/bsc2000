(function (window, $) {
    var params = [];
    //显示隐藏列
    var menu_text = "";
    var subChk = $("input[name='subChk']");
    var simsenflag=true;
    simCardManagement = {
        init: function () {
            // webSocket.init('/clbs/vehicle');
            // 请求后台，获取所有订阅的车
            // setTimeout(function () {
            //     webSocket.subscribe(headers,'/topic/fencestatus', simCardManagement.updataSimData,null, null);
            // },500);
            //列筛选
            var table = $("#dataTable tr th:gt(1)");
            menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(2) + "\" disabled />" + table[0].innerHTML + "</label></li>"
            for (var i = 1; i < table.length; i++) {
                menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(i + 2) + "\" />" + table[i].innerHTML + "</label></li>"
            }
            ;
            $("#Ul-menu-text").html(menu_text);
            //表格列定义
            var columnDefs = [{
                //第一列，用来显示序号
                "searchable": false,
                "orderable": false,
                "targets": 0
            }];
            var columns = [
                {
                    //第一列，用来显示序号
                    "data": null,
                    "class": "text-center"
                },
                {
                    "data": null,
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (row.meter == "") {
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
                    "data": null,
                    "class": "text-center", //最后一列，操作按钮
                    render: function (data, type, row, meta) {
                        var editUrlPath = myTable.editUrl + row.id + "/"; //修改地址
                        var result = '';
                        console.log(row.meter)
                        //修改按钮
                        result += '<button href="' + editUrlPath + '" data-target="#commonWin" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp;';
                        // if (!row.brand) {
                        //     result += '<button disabled class="editBtn btn-default deleteButton" type="button"><i class=" fa fa-ban"></i>下发参数</button>&nbsp;'
                        // }else {
                        //     result += '<button onclick="simCardManagement.sendSimParam(\''+row.id+'\',\''+row.vehicleId+'\',\''+row.configId+'\',\''+row.paramId+'\')" class="editBtn editBtn-info" type="button"><i class="glyphicon glyphicon-circle-arrow-down"></i>下发参数</button>&nbsp;'
                        // }
                        //删除按钮
                        if(row.meter != null){
                            // result += '<button type="button" onclick="simCardManagement.releaseRelate(\'' + row.id + '\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>解除关联</button>';
                            result += '<button disabled type="button" onclick="myTable.deleteItem(\'' + row.id + '\')" class="deleteButton editBtn disableClick"><i class="fa fa-ban"></i>删除</button>';

                        }else{
                            result += '<button type="button" onclick="myTable.deleteItem(\'' + row.id + '\')" class="deleteButton editBtn "><i class="fa fa-trash-o"></i>删除</button>';
                            // result += '<button type="button" onclick="simCardManagement.checkDeleteItem(\'' + row.simcardNumber + '\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>删除</button>';
                        }
                        return result;
                    }
                },
                {
                    "data": "iccid",
                    "class": "text-center",
                    render:function(data){
    	            	return html2Escape(data)
    	            }
                },
                {
                    "data": "imei",
                    "class": "text-center",
                    render:function(data){
    	            	return html2Escape(data)
    	            }
                },
                {
                    "data": "imsi",
                    "class": "text-center",
                    render:function(data){
    	            	return html2Escape(data)
    	            }
                },{
                    "data": "simcardNumber",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data == null ? "" : data;
                    }
                }, {
                    "data": "belongto",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data == null ? "" : data;
                    }
                }, {
                    "data": "isStart",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        if (data == 0) {
                            return '停用';
                        } else if (data == 1) {
                            return '启用';
                        }
                    }
                },
                {
                    "data": "operator",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data == null ? "" : data;
                    }
                },
                {
                    "data": "simFlow",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data == null ? "" : data;
                    }
                }, {
                    "data": "openCardTime",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data ? data:"";
                    }
                }, {
                    "data": "endTime",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data ? data:"";
                    }
                }, {
                    "data": "meter",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data == null ? "" : data;
                    }
                },{
                    "data": "station",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data == null ? "" : data;
                    }
                },{
                    "data":"createDataTime",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data ? data:"";
                    }
                },{
                    "data":"updateDataTime",
                    "class": "text-center",
                    render: function (data, type, row, meta) {
                        return data ? data:"";
                    }
                },{
                    "data":"remark",
                    "class": "text-center",
                    render:function(data){
    	            	return html2Escape(data)
    	            }
                }];
            //ajax参数
            var ajaxDataParamFun = function (d) {
                d.simpleQueryParam = $('#simpleQueryParam').val(); //模糊查询
            };
            //表格setting
            var setting = {
                suffix  : '/',
                listUrl: '/api/devm/simcard/list/',
                editUrl: '/devm/simcard/edit/',
                deleteUrl: '/devm/simcard/delete/',
                deletemoreUrl: '/devm/simcard/deletemore/',
                enableUrl: '/devm/user/enable_',
                disableUrl: '/devm/user/disable_',
                columnDefs: columnDefs, //表格列定义
                columns: columns, //表格列
                dataTableDiv: 'dataTable', //表格
                ajaxDataParamFun: ajaxDataParamFun, //ajax参数
                pageable: true, //是否分页
                showIndexColumn: true, //是否显示第一列的索引列sda
                enabledChange: true
            };
            //创建表格
            myTable = new TG_Tabel.createNew(setting);
            //表格初始化
            myTable.init();
        },
        releaseRelate:function(sid){
            //如果必要的话判断sim卡是否关联再决定是否删除
            var url="/devm/simcard/releaseRelate/";
            json_ajax("POST",url,"json",false,{"sid":sid},function(data){
                if (data != null) {
                    var result = $.parseJSON(data);
                    if (result != null) {
                        layer.msg("已解除关联的表具")
                        myTable.refresh();
                    }
                }
            })
        },
        checkDeleteItem:function(sid){
            //如果必要的话判断sim卡是否关联再决定是否删除
            var url="/devm/simcard/getSimRelated/";
            json_ajax("POST",url,"json",false,{"sid":sid},simCardManagement.sendCallBack)
        },
        //全选
        checkAll: function () {
            $("input[name='subChk']").prop("checked", this.checked);
        },
        //单选
        subChkClick: function () {
            $("#checkAll").prop("checked", subChk.length == subChk.filter(":checked").length ? true : false);
        },
        sendSimParam:function (id,vid,cid,paramId) {
            var url="/devm/simcard/sendSimP";
            json_ajax("POST",url,"json",false,{"sid":id,"vid":vid,"cid":cid,"type":2},simCardManagement.sendCallBack)
            layer.msg(sendCommandComplete);
        },
        sendCallBack:function (data) {
            if(simsenflag){
                webSocket.subscribe(headers,'/topic/fencestatus', simCardManagement.updataSimData,null, null);
                simsenflag=false;
            }
            layer.closeAll()
            myTable.refresh();
        },
        updataSimData: function(msg){
            if (msg != null) {
                var result = $.parseJSON(msg.body);
                if (result != null) {
                    myTable.refresh();
                }
            }
        },
        //批量删除
        delModelClick: function () {
            //判断是否至少选择一项
            var chechedNum = $("input[name='subChk']:checked").length;
            if (chechedNum == 0) {
                layer.msg(selectItem, {move: false});
                return
            }
            var checkedList = new Array();
            $("input[name='subChk']:checked").each(function () {
                checkedList.push($(this).val());
            });
            myTable.deleteItems({
                'deltems': checkedList.toString()
            });
        },
        //刷新
        refreshTable: function () {
            $("#simpleQueryParam").val("");
            myTable.requestData();
        },
    }
    $(function () {
    	$('input').inputClear();
        //初始化
        simCardManagement.init();
        //全选
        $("#checkAll").bind("click", simCardManagement.checkAll);
        //单选
        subChk.bind("click", simCardManagement.subChkClick);
        //批量删除
        $("#del_model").bind("click", simCardManagement.delModelClick);
        //刷新
        $("#refreshTable").on("click", simCardManagement.refreshTable);
    })
})(window, $)
