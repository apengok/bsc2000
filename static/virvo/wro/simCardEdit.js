//# sourceURL=simCardEdit.js
(function(window,$){
    var bindId = $("#bindId").val();
    editSimCardManagement = {
        init: function(){
            if (bindId != null && bindId != ''){
                $("#simcardNumber").attr("readonly",true);
                $("#bindMsg").attr("hidden",false);
            }
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
                    beforeClick : editSimCardManagement.beforeClick,
                    onClick : editSimCardManagement.onClick
                }
            };
            $.fn.zTree.init($("#ztreeDemo"), setting, null);
            laydate.render({elem: '#openCardTimeEdit',theme: '#6dcff6'});
            laydate.render({elem: '#endTimeEdit',theme: '#6dcff6'});

            //init form value
            $('input:radio[name="isStart"]').filter('[value="'+isStart+'"]').attr('checked', true);
            $("#operator option").each(function (){
                if($(this).val()==operator){ 
                $(this).attr("selected","selected"); 
            }});
        },
        beforeClick: function (treeId, treeNode){
            var check = (treeNode);
            return check;
        },
        onClick: function(e, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj("ztreeDemo"), nodes = zTree
                    .getSelectedNodes(), n = "";
            v = "";
            nodes.sort(function compare(a, b) {
                return a.id - b.id;
            });
            for (var i = 0, l = nodes.length; i < l; i++) {
                n += nodes[i].name;
                v += nodes[i].uuid + ",";
            }
            if (v.length > 0)
                v = v.substring(0, v.length - 1);
            var cityObj = $("#zTreeOrganSel");
            cityObj.attr("value", v);
            cityObj.val(n);
            $("#groupId").val(v);
            $("#zTreeContent").hide();
        },
        showMenu: function(){
            if ($("#zTreeContent").is(":hidden")) {
                var inpwidth = $("#zTreeOrganSel").width();
                var spwidth = $("#zTreeOrganSelSpan").width();
                var allWidth = inpwidth + spwidth + 21;
                if(navigator.appName=="Microsoft Internet Explorer") {
                    $("#zTreeContent").css("width",(inpwidth+7) + "px");
                }else{
                    $("#zTreeContent").css("width",allWidth + "px");
                }
                $(window).resize(function() {
                    var inpwidth = $("#zTreeOrganSel").width();
                    var spwidth = $("#zTreeOrganSelSpan").width();
                    var allWidth = inpwidth + spwidth + 21;
                    if(navigator.appName=="Microsoft Internet Explorer") {
                        $("#zTreeContent").css("width",(inpwidth+7) + "px");
                    }else{
                        $("#zTreeContent").css("width",allWidth + "px");
                    }
                })
                $("#zTreeContent").show();
            } else {
                $("#zTreeContent").hide();
            }
            $("body").bind("mousedown", editSimCardManagement.onBodyDown);
        },
        hideMenu: function(){
            $("#zTreeContent").fadeOut("fast");
            $("body").unbind("mousedown", editSimCardManagement.onBodyDown);
        },
        onBodyDown: function(event){
            if (!(event.target.id == "menuBtn" || event.target.id == "zTreeContent" || $(
                    event.target).parents("#zTreeContent").length > 0)) {
                editSimCardManagement.hideMenu();
            }
        },
        validates: function(){
            return $("#editForm").validate({
                rules : {
                simcardNumber : {
                    required : true,
                    // isSim:true,
                    remote: {
                        type:"post",
                        async:false,
                        url:"/devm/simcard/repetition/" ,
                        dataType:"json",  
                        data:{  
                              username:function(){return $("#simcardNumber").val();}  
                        },  
                        dataFilter: function(data, type) { 
                            var oldV = $("#scn").val();
                            var newV = $("#simcardNumber").val();
                            var data2 = data;
                            if (oldV == newV) {
                                return true;
                            } else {
                                if (data2 == "true"){
                                    return true; 
                                } else {
                                    return false;
                                } 
                            }
                         }  
                      }
                },
                groupId : {
                    required : true
                },
                isStart : {
                    required : false,
                    maxlength : 6
                },
                operator : {
                    required : false,
                    maxlength : 50
                },
                openCardTime : {
                    date:true
                },
                // capacity : {
                //     required : false,
                //     maxlength : 20
                // },
                simFlow : {
                    required : false,
                    maxlength : 20
                },
                // useFlow : {
                //     maxlength : 20
                // },
                // alertsFlow : {
                //     required : false,
                //     maxlength : 20
                // },
                endTime : {
                    required : false,
                    compareDate:"#openCardTimeEdit"
                },
                    // correctionCoefficient:{
                    //     isRightNumber:true,
                    //     isInt1tov:200,
                    // },
                    // forewarningCoefficient:{
                    //     isRightNumber:true,
                    //     isInt1tov:200,
                    // },
                    // hourThresholdValue:{
                    //     range:[0,6553]
                    // },
                    // dayThresholdValue:{
                    //     range:[0,42949672.9]
                    // },
                    // monthThresholdValue:{
                    //     range:[0,42949672.9]
                    // },
                    iccid:{
                        required: false,
                        maxlength:50
                    },
                    imsi:{
                        required: false,
                        maxlength:50
                    },
                    imei:{
                        required: false,
                        maxlength:20
                    },
                    remark: {
                        maxlength: 50
                    }
            },
             messages : {
                    simcardNumber : {
                        required:simNumberError,
                        // isSim:simNumberError,
                        remote:simNumberExists
                    },
                 groupName: {
                     required: publicNull
                 },
                 isStart: {
                     required: publicNull,
                     maxlength: publicSize6
                 },
                 operator: {
                     required:publicNull,
                     maxlength: publicSize50
                 },
                 openCardTime: {
                     required: publicNull,
                 },
                 // capacity: {
                 //     required: publicNull,
                 //     maxlength: publicSize20
                 // },
                 simFlow: {
                     required: publicNull,
                     maxlength: publicSize20
                 },
                 // useFlow: {
                 //     maxlength: publicSize20
                 // },
                 // alertsFlow: {
                 //     required: publicNull,
                 //     maxlength: publicSize20
                 // },
                 endTime: {
                     required: publicNull,
                     compareDate: simCompareOpenCardTime
                 },
                 // forewarningCoefficient:{
                 //     isRightNumber:publicNumberInt,
                 //     isInt1tov:simMax200Length,
                 // },
                 // correctionCoefficient:{
                 //     isRightNumber:publicNumberInt,
                 //     isInt1tov:simMax200Length,
                 // },
                 // hourThresholdValue:{
                 //     range:simHourTrafficLength
                 // },
                 // dayThresholdValue:{
                 //     range:simDayTrafficLength
                 // },
                 // monthThresholdValue:{
                 //     range:simMonthTrafficLength
                 // },
                 iccid:{
                     maxlength:publicSize50
                 },
                 imsi:{
                     maxlength:publicSize50
                 },
                 imei:{
                     maxlength:publicSize50
                 },
                 remark: {
                     maxlength: publicSize50
                 }
                } 
            }).form();
        },
        doSubmit: function(){
            if(editSimCardManagement.validates()){
                $("#editForm").ajaxSubmit(function(data) {
                    var json = eval("("+data+")");
                    if(json.success){
                        $("#commonWin").modal("hide");
                        myTable.refresh();
                    }else{
                        layer.msg(json.msg);
                    }
                });
            };
        },
    }
    $(function(){
        $('input').inputClear().on('onClearEvent', function (msg) {
            if (msg.target.id === 'monthThresholdValue') {
                $("#alertsFlow").val("");
            };
        });
        editSimCardManagement.init();
        $("#forewarningCoefficient").bind('input oninput', function() {
            $("#alertsFlow").val((Number($("#forewarningCoefficient")[0].value)/100*Number($("#monthThresholdValue")[0].value)).toFixed(2))
            if($("#alertsFlow").val()=="NaN"){
                $("#alertsFlow").val(0)
            }
        });
        $("#monthThresholdValue").bind('input oninput', function() {
            $("#alertsFlow").val((Number($("#forewarningCoefficient")[0].value)/100*Number($("#monthThresholdValue")[0].value)).toFixed(2))
            if($("#alertsFlow").val()=="NaN"){
                $("#alertsFlow").val(0)
            }
        });
        $("#zTreeOrganSel").bind("click",editSimCardManagement.showMenu);
        $("#doSubmit").bind("click",editSimCardManagement.doSubmit);
    })
})(window,$)
