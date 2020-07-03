(function($,window){
    var userVehicleNodes=[];
    var submitFlag = true;

    var userVehiclePer = {
        init: function(){
            // 车组权限 
            var setVehicleGroup = {
                async : {
                    type : "post",
                    enable : true,
                    autoParam : [ "id" ],
                    dataType : "json",
                },
                check : {
                    enable : true,
                    chkStyle : "checkbox",
                    chkboxType : {
                        "Y" : "s",
                        "N" : "s"
                    },
                    radioType : "all"
                },
                view : {
                    dblClickExpand : false,
                    fontCss : userVehiclePer.setFontCss
                },
                data : {
                    simpleData : {
                        enable : true
                    }
                },
                callback : {
                    beforeClick : userVehiclePer.beforeClickVehicleGroup,
                    onCheck : userVehiclePer.onCheckVehicleGroup,
                }
            }
            var treeData = $("#vehicleTreeData").attr("value");
            $.fn.zTree.init($("#vehicleGroupDemo"), setVehicleGroup, JSON.parse(treeData));
            // 去重
            Array.prototype.unique1 = function() {
                var res = [ this[0] ];
                for (var i = 1; i < this.length; i++) {
                    var repeat = false;
                    for (var j = 0; j < res.length; j++) {
                        if (this[i] == res[j]) {
                            repeat = true;
                            break;
                        }
                    }
                    if (!repeat) {
                        res.push(this[i]);
                    }
                }
                return res;
            }
            var wHeight = $(window).height();
            $("#vehicleGroupDemo").css({"max-height":(wHeight-284)+"px","overflow":"auto"});
        },
        beforeClickVehicleGroup: function(treeId, treeNode){
            var zTree = $.fn.zTree.getZTreeObj("vehicleGroupDemo");
            zTree.checkNode(treeNode, !treeNode.checked, null, true);
            return false;
        },
        onCheckVehicleGroup: function(e, treeId, treeNode){
            var zTree = $.fn.zTree.getZTreeObj("vehicleGroupDemo");
            var param = treeNode.id;
            var nodes = zTree.getNodesByParam("id", param, null);
            if (treeNode.checked) {
                for (var i = 0; i < nodes.length; i++) {
                    zTree.checkNode(nodes[i], true, true);
                }
                ;
                flag = false;
            } else {
                for (var i = 0; i < nodes.length; i++) {
                    zTree.checkNode(nodes[i], false, true);
                }
                ;
                flag = true;
            };
        },
        setFontCss: function(treeId, treeNode){
            return treeNode.vehicleType == "out" ? {
                color : "red"
            } : {};
        },
        doSubmit: function(){
            var userVehicleTree = $.fn.zTree.getZTreeObj("vehicleGroupDemo");
            var userVehicleNode = userVehicleTree.getCheckedNodes();
            if(userVehicleNode.length == userVehicleNodes.length && userVehiclePer.equalsArray(userVehicleNode,userVehicleNodes)){//如果初始化窗口时获取的节点信息与提交时获取的节点信息相同,说明用户并没有做新的操作,直接关闭窗口
                $("#commonSmWin").modal("hide");//关闭弹窗
                return;
            }else{
                var arr = [];
                if (userVehicleNode != null && userVehicleNode.length > 0) {
                    for (var i = 0; i < userVehicleNode.length; i++) {
                        if (userVehicleNode[i].type == "assignment") {
                            arr.push(userVehicleNode[i].id);
                        }
                    }
                    if (arr != null && arr.length > 0) {
                        arr = arr.unique1(); // 去重
                        $("#userVehicle").val(JSON.stringify(arr));
                        // $("#vehiclePerForm").submit();
                        if (submitFlag) { // 防止重复提交
                            submitFlag = false;
                            $("#vehiclePerForm").ajaxSubmit(function(data) {
                                if(typeof(data) == "object" &&
                                    Object.prototype.toString.call(data).toLowerCase() == "[object object]" && !data.length){//如果后台返回的数据是json数据,则直接过去msg
                                    layer.msg(data.msg,{move:false});
                                }else{
                                    var dataset = $.parseJSON(data);//转为json对象
                                    layer.msg(dataset.msg,{move:false});
                                }
                                submitFlag = true;
                                $("#commonSmWin").modal("hide");//关闭弹窗
                                myTable.refresh();//刷新列表
                            });
                        }
                    }else{
                        $("#userVehicle").val("");
                        layer.msg("请至少勾选一个分组授权查看！");
                    }
                }else{
                    //验证授权是否勾选分组
                    layer.msg("请至少勾选一个分组授权查看！");
                }
            }
        },
        equalsArray:function(arr1,arr2) {//比较两个数组的值是否相同
            arr1.sort();
            arr2.sort();
            for(var i=0;i<arr1.length;i++){
                if(typeof arr1[i] != typeof arr2[i]){
                    return false;
                }else if(arr1[i] !== arr2[i]){
                    return false;
                }
            }
            return true;
        }
    }
    $(function(){
        var flag = true;
        userVehiclePer.init();
        myTable.add('commonSmWin', 'vehiclePerForm', null, null);
        var treeObj = $.fn.zTree.getZTreeObj("vehicleGroupDemo");
        treeObj.expandAll(true);
        userVehicleNodes = treeObj.getCheckedNodes();//初始化页面时用户选择的组织（如果为空，说明是新增的用户.不为空,就跟提交时过去的比较，判断用户有没有勾选组织）
        $("#doSubmitVehiclePer").on("click",userVehiclePer.doSubmit);
    })
})($,window)
