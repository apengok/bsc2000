(function (window, $) {
    var allAlarmList = [];
    var userName = $("#userName");
    var leftToolTip = $("#toggle-left-tooltip");
    pagesNav = {
        init: function () {

            $("#main-content").css("min-height", ($(window).height() - 126) + "px");

            if (userName.html() === "experience1") {
                $("#editPwd").remove();
            }
            // var ip = returnCitySN["cip"];
            // $.cookie('ip', ip);

            $("#toggle-left-button").on("mouseover", function () {
                leftToolTip.addClass("in");
                leftToolTip.css({
                    "top": "31px",
                    "left": "292px"
                })
            }).on("mouseout", function () {
                leftToolTip.removeClass("in");
            });
            // webSocket.init('/clbs/vehicle', headers, "/user/" + userName.text() + "/alarmGlobal", pagesNav.getintimeno, null, null);
            // pagesNav.isConnectSocket();
//            setTimeout(function () {
//                webSocket.subscribe(headers, "/user/" + userName.text() + "/specialReport", pagesNav.specialAlarm, null, null);
//            }, 2000);

        },

        // socket连接建立
        isConnectSocket: function () {
            setTimeout(function () {
                if (webSocket.conFlag) {
                    webSocket.subscribe(headers, "/user/" + userName.text() + "/specialReport", pagesNav.specialAlarm, null, null);
                } else {
                    pagesNav.isConnectSocket();
                }
            }, 1000);
        },

        logout: function () {
            var url4 = "/clbs/out";
            $.ajax({
                type: "POST",
                url: url4,
                dataType: "json",
                async: false,
                data: null,
                timeout: 30000,
                success: function () {
                    location.href = "/clbs/logout";
                },
                error: function () {
                    location.href = "/clbs/logout";
                }
            });
        },
        gethistoryno: function () {
            var name = $("#userName").text();
            json_ajax("POST", "/clbs/vehicle/global", "json", true, {
                "userName": name
            }, function (data) {
                if (data.success) {
                    allAlarmList = data.obj;
                    $("#alarmno").text(data.obj.length);
                }
            });
        },
        getintimeno: function (data) {
            var json = JSON.parse(data.body);
            var msgID = json.desc.msgID;
            if (msgID === 3088) {
                var id = json.desc.vid;
                var flag = $.inArray(id, allAlarmList);
                if (flag === -1) {
                    allAlarmList.push(id);
                }
                $("#alarmno").text(allAlarmList.length);
                //声音
                if (navigator.userAgent.indexOf('MSIE') >= 0) {
                    $("#IEalarmMsg").remove();
                    $("#alarmIcoHide").append('<embed id="IEalarmMsg" src="/clbs/file/music/alarm.wav" autostart="true" style="visibility:hidden;"/>');
                } else {
                    $("#alarmMsgAutoOff").remove();
                    $("#alarmIcoHide").append('<audio id="alarmMsgAutoOff" src="/clbs/file/music/alarm.wav" autoplay="autoplay" style="visibility:hidden;"></audio>');
                }
                //闪烁
                $(".waves").css("visibility", "visible");
                setTimeout("$('.waves').css('visibility','hidden');", 2000);
            } else if (msgID === 3071) {
                id = json.desc.vId;
                flag = $.inArray(id, allAlarmList);
                if (flag !== -1) {
                    for (var i = 0; i < allAlarmList.length; i++) {
                        if (id === allAlarmList[i]) {
                            allAlarmList.splice(i, 1);
                        }
                    }
                }
                $("#alarmno").text(allAlarmList.length);
            }

        },
        alarmDeal: function () {
            var jumpFlag = false;
            var permissionUrls = $("#permissionUrls").val();
            if (permissionUrls != null && permissionUrls != undefined) {
                var urllist = permissionUrls.split(",");
                if (urllist.indexOf("/a/search/list") > -1) {
                    var str = "";
                    jumpFlag = true;
                    if (allAlarmList.length !== 0) {
                        for (var j = 0; j < allAlarmList.length; j++) {
                            str += allAlarmList[j] + ",";
                        }
                        var data = {"vehicleId": str};
                        var url = "/clbs/a/search/addSession";
                        json_ajax("POST", url, "json", false, data, function (result) {
                            if (result) {
                                location.href = "/clbs/a/search/list?atype=2";
                            }
                        });
                    } else {
                        location.href = "/clbs/a/search/list";
                    }
                }
            }
            if (!jumpFlag) {
                layer.msg("无操作权限，请联系管理员");
            }
        },
        specialAlarm: function (data) {
            var json = JSON.parse(data.body);
            var confirmMsg = "监控对象:" + json.data.msgBody.vehicleInfo.brand + "发现" + json.data.msgBody.alarmName + ",请处理";
            var videoUrl = "/clbs/realTimeVideo/video/list";
            if (!json.desc.vId) {
                return;
            }
            // 调用接口查询车辆的pid，及分组的id(任意获取一个)
            var assignmentId = "";
            $.ajax({
                type: "POST",
                url: "/clbs/realTimeVideo/video/getPidByVid",
                dataType: "json",
                async: false,
                data: {"vehicleId": json.desc.vId},
                success: function (data) {
                    if (data != null && data != undefined && data != "") {
                        assignmentId = data;
                    }
                }
            });

            layer.confirm(confirmMsg, {btn: ['确定'], icon: 3, title: "操作确认"}, function () {
                if (window.location.pathname !== videoUrl) {
                    var jumpFlag = false;
                    var permissionUrls = $("#permissionUrls").val();
                    if (permissionUrls != null && permissionUrls != undefined) {
                        var urllist = permissionUrls.split(",");
                        if (urllist.indexOf("/realTimeVideo/video/list") > -1) {
                            jumpFlag = true;
                            location.href = videoUrl + '?vid=' + json.desc.vId + '&pid=' + assignmentId;
                        }
                    }
                    if (!jumpFlag) {
                        layer.msg("无操作权限，请联系管理员");
                    }
                } else {
                    var node = {'id': json.desc.vId, 'pid': assignmentId};
                    realTimeVideLoad.vehicleLoctionFun(node);
                    layer.closeAll();
                }
            });
        },
        //字体修改提示
        helpCenterModal: function () {
            $("#helpCenterModal").modal('show');
        }
    };
    $(function () {
        // pagesNav.gethistoryno();
        pagesNav.init();
        $("#updateFontSize").bind("click", pagesNav.helpCenterModal);
    })
})(window, $);
