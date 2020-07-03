var searchParam = "";
var searchTypeValue = "";
/**
 * 展开树
 * @param treeId
 */
function expand_ztree(treeId) {
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    treeObj.expandAll(true);
}

/**
 * 收起树：只展开根节点下的一级节点
 * @param treeId
 */
function close_ztree(treeId) {
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    var nodes = treeObj.transformToArray(treeObj.getNodes());
    var nodeLength = nodes.length;
    for (var i = 0; i < nodeLength; i++) {
        if (nodes[i].id == '0') {
            //根节点：展开
            treeObj.expandNode(nodes[i], true, true, false);
        } else {
            //非根节点：收起
            treeObj.expandNode(nodes[i], false, true, false);
        }
    }
}

/**
 * 搜索树，高亮显示并展示【模糊匹配搜索条件的节点s】
 * @param treeId
 * @param searchConditionId 文本框的id
 */
function search_ztree(treeId, searchConditionId,type) {
    searchByFlag_ztree(treeId, searchConditionId, "",type);
}

/**
 * 搜索树，高亮显示并展示【模糊匹配搜索条件的节点s】
 * @param treeId
 * @param searchConditionId     搜索条件Id
 * @param flag                  需要高亮显示的节点标识
 */
function searchByFlag_ztree(treeId, searchConditionId, flag,type) {
    //<1>.搜索条件
    var searchCondition = $('#' + searchConditionId).val();
    var highlightNodes = [];
    var allNodes = [];
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    searchParam = searchCondition;
    if (type == "vehicle") {
        highlightNodes = treeObj.getNodesByFilter(monitorParamFuzzyFilter); 
        // allNodes = treeObj.getNodesByFilter(monitorFilter); // 所有type型nodes
        allNodes = treeObj.transformToArray(treeObj.getNodes()); // 所有节点
    }else{
        highlightNodes = treeObj.getNodesByParamFuzzy("name", searchCondition, null); // 满足搜索条件的节点
        allNodes = treeObj.getNodesByParam("type",type, null); // 所有type型nodes
    }    
    if (searchCondition != "") {
        searchParam = searchCondition;
        if (type == "group") {  // 企业
            // 需要显示是节点（包含父节点）
            var showNodes = [];
            if (highlightNodes != null) {
                for (var i = 0; i < highlightNodes.length; i++) {
                    //组装显示节点的父节点的父节点....直到根节点，并展示
                    getParentShowNodes_ztree(treeId, highlightNodes[i],showNodes);
                }
                treeObj.hideNodes(allNodes)
                treeObj.showNodes(showNodes);
                treeObj.expandAll(true);
            }
      /*  }else if (type == "vehicle"){
            treeObj.hideNodes(allNodes)
            treeObj.showNodes(highlightNodes);
            treeObj.expandAll(true);*/
        }else{
            //<2>.得到模糊匹配搜索条件的节点数组集合
//            treeObj.hideNodes(allNodes);
//            treeObj.showNodes(highlightNodes);
//            treeObj.expandAll(true);
            // 需要显示是节点（包含父节点）
            var showNodes = [];
            // 只显示直接上级
            if (highlightNodes != null) {
                for (var i = 0; i < highlightNodes.length; i++) {
                    //组装显示节点的父节点的父节点....直到根节点，并展示
                    getParentShowNodes_ztree(treeId, highlightNodes[i],showNodes);
                }
                treeObj.hideNodes(allNodes)
                treeObj.showNodes(showNodes);
                treeObj.expandAll(true);
            }
        }
    }else{
        treeObj.showNodes(allNodes)
        treeObj.expandAll(true);
    }
    //<3>.高亮显示并展示【指定节点s】
    // highlightAndExpand_ztree(treeId, highlightNodes, flag);
}

function realTimeMonitoringFilter(node){ // 模糊搜索从业人员，终端编号
    return (node.type == "vehicle" && node.name.indexOf(searchParam) > -1) || 
            (node.type == "people" && node.name.indexOf(searchParam) > -1) ||
            (node.type == "thing" && node.name.indexOf(searchParam) > -1) ||
            (node.professional != undefined && node.professional != null && node.professional.indexOf(searchParam) > -1) ||
            (node.simcardNumber != undefined && node.simcardNumber != null && node.simcardNumber.indexOf(searchParam) > -1) || 
            (node.assignName != undefined && node.assignName != null && node.assignName.indexOf(searchParam) > -1) || 
            (node.deviceNumber != undefined && node.deviceNumber != null && node.deviceNumber.indexOf(searchParam) > -1)
}

function monitorFilter(node){ // 搜索type等于人或者车
    return node.type == "vehicle" || node.type == "people" || node.type == "thing" 
}

function monitorParamFuzzyFilter(node){ // 模糊匹配name,type等于人或者车
    return (node.type == "vehicle" && node.name.indexOf(searchParam) > -1) || (node.type == "people" && node.name.indexOf(searchParam) > -1) || (node.type == "thing" && node.name.indexOf(searchParam) > -1)
}

/**
 *  搜索没有展开的分组节点
 * @param node
 * @returns
 */
function assignmentNotExpandFilter(node){ // 搜索type等于人或者车
    return node.type == "assignment" && node.children != undefined && node.children.length >0 && node.children[0].open==false;
}

/**
 *  搜索所有的对象
 * @param node
 * @returns
 */
function moniterFilter(node){ // 搜索type等于人或者车
    return (node.type == "vehicle" || node.type == "people" || node.type == "thing")&&node.isHidden===false;
}

/**
 * 搜索树，高亮显示并展示【模糊匹配搜索条件的节点s】
 * @param treeId
 * @param searchConditionId     搜索条件Id
 * @param flag                  需要高亮显示的节点标识
 */
function high_search_ztree(treeId, searchConditionId,hasBegun) {
    //<1>.搜索条件
    var searchCondition = $('#' + searchConditionId).val();
    var highlightNodes = [];
//    var allNodes = [];
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    searchParam = searchCondition;
    highlightNodes = treeObj.getNodesByFilter(realTimeMonitoringFilter); 
    // allNodes = treeObj.getNodesByFilter(monitorFilter); // 所有type型nodes
    var allNodes = treeObj.transformToArray(treeObj.getNodes()); // 所有节点
    if (searchCondition != "") {
        //<2>.得到模糊匹配搜索条件的节点数组集合
        // 需要显示是节点（包含父节点）
        var showNodes = [];
        // 只显示直接上级
        if (highlightNodes != null) {
            for (var i = 0; i < highlightNodes.length; i++) {
                //组装显示节点的父节点的父节点....直到根节点，并展示
                if(hasBegun.indexOf(highlightNodes[i].getParentNode().id)==-1){
                    hasBegun.push(highlightNodes[i].getParentNode().id)
                    treeObj.expandNode(highlightNodes[i].getParentNode(), true, true, false, true);
                }
                getParentShowNodes_ztree(treeId, highlightNodes[i],showNodes);
            }

            treeObj.hideNodes(allNodes)
            treeObj.showNodes(showNodes);
            // treeObj.expandAll(true);
        }
    }else{
    //  var allNodes1 = treeObj.transformToArray(treeObj.getNodes()); // 所有节点
//      treeObj.hideNodes(allNodes)
        treeObj.showNodes(allNodes)
        treeObj.expandAll(true);
    }
    //<3>.高亮显示并展示【指定节点s】
    // highlightAndExpand_ztree(treeId, highlightNodes, flag);
}

function searchTypeFilter(node){ // 模糊搜索从业人员，终端编号
    var value = node[''+searchTypeValue+''];
    return ((node.type == "vehicle" || node.type == "people" || node.type == "thing") && value != undefined && value != null && value.indexOf(searchParam) > -1)
}

/**
 * 搜索树，根据搜索类型模糊匹配
 * @param treeId
 * @param searchConditionId     搜索条件Id
 * @param searchType            搜索条件type
 * @param flag                  需要高亮显示的节点标识
 */
function search_ztree_by_search_type(treeId, searchConditionId,searchType,hasBegun) {
    //<1>.搜索条件
    var searchCondition = $('#' + searchConditionId).val();
    var highlightNodes = [];
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    searchParam = searchCondition;
    searchTypeValue = searchType;
    //highlightNodes = treeObj.getNodesByFilter(searchTypeFilter); 
    // highlightNodes = treeObj.getNodesByParamFuzzy(searchType, searchCondition, null);
    var allNodes = treeObj.transformToArray(treeObj.getNodes()); // 所有节点
    if (searchCondition != "") {
        //<2>.得到模糊匹配搜索条件的节点数组集合
        // 需要显示是节点（包含父节点） 
        var showNodes = [];
        // 只显示直接上级
        if (allNodes != null) {
            for (var i = 0; i < allNodes.length; i++) {
                var node = allNodes[i];
                var value = node[''+searchType+''];
                if ((node.type == "vehicle" || node.type == "people"|| node.type == "thing") && value != undefined && value != null && value.indexOf(searchParam) > -1) {
                    //highlightNodes.push(node);
                    //组装显示节点的父节点的父节点....直到根节点，并展示
                    if(hasBegun.indexOf(node.getParentNode().id)==-1){
                        hasBegun.push(node.getParentNode().id)
                        treeObj.expandNode(node.getParentNode(), true, true, false, true);
                    }
                    getParentShowNodes_ztree(treeId, node,showNodes);
                }
            }
            treeObj.hideNodes(allNodes)
            treeObj.showNodes(showNodes);
        }
        
        /*if (highlightNodes != null) {
            for (var i = 0; i < highlightNodes.length; i++) {
                //组装显示节点的父节点的父节点....直到根节点，并展示
                if(hasBegun.indexOf(highlightNodes[i].getParentNode().id)==-1){
                    hasBegun.push(highlightNodes[i].getParentNode().id)
                    treeObj.expandNode(highlightNodes[i].getParentNode(), true, true, false, true);
                }
                getParentShowNodes_ztree(treeId, highlightNodes[i],showNodes);
            }

            treeObj.hideNodes(allNodes)
            treeObj.showNodes(showNodes);
        }*/
    }else{
        treeObj.showNodes(allNodes)
        treeObj.expandAll(true);
    }
}

function showSearchNodes(treeId, checkedList) {
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    var allNodes = treeObj.transformToArray(treeObj.getNodes()); // 所有节点
    //<2>.得到模糊匹配搜索条件的节点数组集合
    // 需要显示是节点（包含父节点） 
    var showNodes = [];
    var checkedNodes = [];
    // 只显示直接上级
    if (allNodes !== null) {
        for (var i = 0; i < allNodes.length; i++) {
            var node = allNodes[i];
//          var value = node[''+searchType+''];
            if ((node.type === "vehicle" || node.type === "people" || node.type === "thing") ) {
                // 勾选搜索前勾选的车辆
                if (checkedList !== null &&　checkedList　!== undefined && checkedList.length > 0
                    && checkedList.indexOf(node.id) !== -1){
                    treeObj.checkNode(node, true, true);
                }
                //组装显示节点的父节点的父节点....直到根节点，并展示
                if (checkedNodes.indexOf(node.pId) >= 0) {
                    showNodes.push(node);
                    continue;
                }
                checkedNodes.push(node.pId);
                treeObj.expandNode(node.getParentNode(), true, true, false, true);
                getParentShowNodes_ztree(treeId, node, showNodes);
            }
        }
        treeObj.hideNodes(allNodes);
        treeObj.showNodes(showNodes);
    }
}

function filterQueryResult(data, checkedList) {
    if (data === null) {
        return;
    }

    if (checkedList === undefined || checkedList === null) {
        checkedList = [];
    }

    // 初始化节点为hashMap
    var nodes = {};
    for (var i = 0; i < data.length; i++) {
        nodes[data[i].id] = data[i];
    }
    for (i = 0; i < checkedList.length; i++) {
        var curNode = nodes[checkedList[i]];
        if (curNode != undefined && curNode != null){
            nodes[checkedList[i]].checked = true;
        }
    }

    var result = [];
    for (i = 0; i < data.length; i++) {
        if (isMonitorType(data[i].type)) {
            getAllAvailableNodes(data[i], result, nodes);
        }
    }
    return result;
}

function getAllAvailableNodes(node, result, nodes) {
    if (node === undefined || node === "checked") {
        return;
    }
    result.push(node);
    var parentNode = nodes[node.pId];
    nodes[node.pId] = "checked";
    getAllAvailableNodes(parentNode, result, nodes);
}

function isMonitorType(type) {
    return type === "vehicle" || type === "people" || type === "thing";
}

function zTreeScroll(zTree, scroll) {
    var prevTop = 0;
    var top = scroll.scrollTop;
    if(prevTop <= top) {//下滚
        // 获取没有展开的分组节点
        var notExpandNodes = zTree.getNodesByFilter(assignmentNotExpandFilter);
        if (notExpandNodes !== undefined && notExpandNodes.length > 0) {
            for (var i = 0; i< notExpandNodes.length; i++) {
                var node = notExpandNodes[i];
                var tid = node.tId + "_a";
                var divHeight = scroll.offsetTop;
                var nodeHeight = $("#" + tid).offset().top;
                if ( nodeHeight - divHeight > 696) {
                    break;
                }
                if (nodeHeight - divHeight > 0 && nodeHeight - divHeight < 696){
                    zTree.expandNode(node, true, true, false, true);
                    node.children[0].open= true;
                }
            }
        }
    }
    setTimeout(function() { prevTop = top; }, 0);
}

/**
 * 高亮显示并展示【指定节点s】
 * @param treeId
 * @param highlightNodes 需要高亮显示的节点数组
 * @param flag           需要高亮显示的节点标识
 */
function highlightAndExpand_ztree(treeId, highlightNodes, flag) {
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    //<1>. 先把全部节点更新为普通样式
    var treeNodes = treeObj.transformToArray(treeObj.getNodes());
    for (var i = 0; i < treeNodes.length; i++) {
        treeNodes[i].highlight = false;
        treeObj.updateNode(treeNodes[i]);
    }
    //<2>.收起树, 只展开根节点下的一级节点
    // close_ztree(treeId);
    //<3>.把指定节点的样式更新为高亮显示，并展开
    if (highlightNodes != null) {
        for (var i = 0; i < highlightNodes.length; i++) {
            if (flag != null && flag != "") {
                if (highlightNodes[i].flag == flag) {
                    //高亮显示节点，并展开
                    highlightNodes[i].highlight = true;
                    treeObj.updateNode(highlightNodes[i]);
                    //高亮显示节点的父节点的父节点....直到根节点，并展示
                    var parentNode = highlightNodes[i].getParentNode();
                    var parentNodes = getParentNodes_ztree(treeId, parentNode);
                    treeObj.expandNode(parentNodes, true, false, true);
                    treeObj.expandNode(parentNode, true, false, true);
                }
            } else {
                //高亮显示节点，并展开
                highlightNodes[i].highlight = true;
                treeObj.updateNode(highlightNodes[i]);
                //高亮显示节点的父节点的父节点....直到根节点，并展示
                // setFontCss_ztree(treeId,highlightNodes[i]);
                var parentNode = highlightNodes[i].getParentNode();
                var parentNodes = getParentNodes_ztree(treeId, parentNode);
                treeObj.expandNode(parentNodes, true, false, true);
                treeObj.expandNode(parentNode, true, false, true);
            }
        }
    }
}

/**
 * 递归得到指定节点的父节点的父节点....直到根节点
 */
function getParentNodes_ztree(treeId, node) {
    if (node !== null) {
        var parentNode = node.getParentNode();
        return getParentNodes_ztree(treeId, parentNode);
    } else {
        return node;
    }
}

/**
 * 递归得到指定节点的父节点的父节点....直到根节点（用于企业搜索）
 */
function getParentShowNodes_ztree(treeId, node, showNodes) {
    if (node !== null) {
        showNodes.push(node);
        var parentNode = node.getParentNode();
        return getParentShowNodes_ztree(treeId, parentNode,showNodes);
    } else {
        return node;
    }
}

/**
 * 设置树节点字体样式
 */
function setFontCss_ztree(treeId, treeNode) {
    if (treeNode.id == 0) {
        //根节点
        return {color: "#333", "font-weight": "bold"};
    } else {
        if (treeNode.vehicleType == "out") { // 车辆树结构有父级组织的车
            if (!!treeNode.highlight) {
                return {color: "#6dcff6", "font-weight": "bold"};
            } else {
                return {color: "red"};
            }
        } else {
            return (!!treeNode.highlight) ? {color: "#6dcff6", "font-weight": "bold"} : {
                color: "#333",
                "font-weight": "normal"
            };
        }

    }
}
/**
 * jquery.calendar.js 1.0
 * http://jquerywidget.com
 */
;(function (factory) {
    if (typeof define === "function" && (define.amd || define.cmd) && !jQuery) {
        // AMD或CMD
        define(["jquery"], function () {
            factory(jQuery);
        });
    } else {
        // 全局模式
        factory(jQuery);
    }
}(function ($) {
    $.fn.calendar = function (parameter, getApi) {
        parameter = parameter || {};
        var defaults = {
            prefix: 'widget',            //生成日历的class前缀
            isRange: false,              //是否选择范围
            limitRange: [],              //有效选择区域的范围
            highlightRange: [],          //指定日期范围高亮
            stopHighlightRange: [],     //超待停车标记高亮
            peopleHighlightRange: [],    //人停车标记
            thingHighlightRange: [],    //人停车标记
            onChange: function () {
            },      //当前选中月份修改时触发
            onSelect: function () {
            }       //选择日期时触发
        };
        var options = $.extend({}, defaults, parameter);

        var ifDoubleClick = true;

        return this.each(function () {
            var $this = $(this);
            var $table = $('<table>').appendTo($this);
            var $caption = $('<caption>').appendTo($table);
            var $prevYear = $('<a class="' + options.prefix + '-prevYear" href="javascript:;">&lt;&lt;</a>').appendTo($caption);
            var $prevMonth = $('<a class="' + options.prefix + '-prevMonth" href="javascript:;">&lt;</a>').appendTo($caption);
            var $title = $('<span>').appendTo($caption);
            var $nextMonth = $('<a class="' + options.prefix + '-nextMonth" href="javascript:;">&gt;</a>').appendTo($caption);
            var $nextYear = $('<a class="' + options.prefix + '-nextYear" href="javascript:;">&gt;&gt;</a>').appendTo($caption);
            var $back = $('<a class="' + options.prefix + '-back" href="javascript:;"></a>').appendTo($caption);
            var _today,         //当天
                _data,          //日期数据
                _day,           //日历状态
                _range = [];    //当前选择范围
            /*****  节点修改 *****/
            $table.append('<thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead>');
            var $tbody = $('<tbody>').appendTo($table);
            /***** 私有方法 *****/
            //获取日期数据
            if (isFlag) {
                var getDateObj = function (year, month, day) {
                    var date = arguments.length && nowYear ? new Date(nowYear, monthIndex - 1, day) : new Date();
                    var obj = {
                        'year': parseInt(nowYear),
                        'month': parseInt(monthIndex),
                        'day': date.getDate(),
                        'week': date.getDay()
                    }
                    obj['code'] = '' + obj['year'] + (obj['month'] > 9 ? obj['month'] : '0' + obj['month']) + (obj['day'] > 9 ? obj['day'] : '0' + obj['day']);
                    return obj;
                };
            } else {
                var getDateObj = function (year, month, day) {
                    var date = arguments.length && year ? new Date(year, month - 1, day) : new Date();
                    var obj = {
                        'year': date.getFullYear(),
                        'month': date.getMonth() + 1,
                        'day': date.getDate(),
                        'week': date.getDay()
                    }
                    obj['code'] = '' + obj['year'] + (obj['month'] > 9 ? obj['month'] : '0' + obj['month']) + (obj['day'] > 9 ? obj['day'] : '0' + obj['day']);
                    return obj;
                };
            }
            //获取当月天数
            var getMonthDays = function (obj) {
                var day = new Date(obj.year, obj.month, 0);
                return day.getDate();
            };
            //获取某天日期信息
            var getDateInfo = function (obj) {
                if (options.limitRange.length) {
                    obj['status'] = 'disabled';
                    for (var i = 0; i < options.limitRange.length; i++) {
                        var start = options.limitRange[i][0];
                        var end = options.limitRange[i][1];
                        if (start == 'today') {
                            start = _today['code'];
                        }
                        if (end == 'today') {
                            end = _today['code'];
                        }
                        if (start > end) {
                            start = [end, end = start][0];
                        }
                        if (obj['code'] >= start && obj['code'] <= end) {
                            obj['status'] = '';
                            break;
                        }
                    }
                }
                obj['sign'] = [];
                obj['mileage'] = [];//存放里程
                if (options.highlightRange.length) {
                    for (var i = 0; i < options.highlightRange.length; i++) {
                        var start = options.highlightRange[i][0];
                        var end = options.highlightRange[i][1];
                        var mileage = options.highlightRange[i][2];
                        if (start == 'today') {
                            start = _today['code'];
                        }
                        if (end == 'today') {
                            end = _today['code'];
                        }
                        if (start > end) {
                            start = [end, end = start][0];
                        }
                        if (obj['code'] >= start && obj['code'] <= end) {
                            obj['sign'].push('highlight');
                            obj['mileage'].push(mileage);
                            break;
                        }
                    }
                }
                //超待停车时间高亮
                if (options.stopHighlightRange.length) {
                    for (var i = 0; i < options.stopHighlightRange.length; i++) {
                        var start = options.stopHighlightRange[i][0];
                        var end = options.stopHighlightRange[i][1];
                        var mileage = options.stopHighlightRange[i][2];
                        if (start == 'today') {
                            start = _today['code'];
                        }
                        if (end == 'today') {
                            end = _today['code'];
                        }
                        if (start > end) {
                            start = [end, end = start][0];
                        }
                        if (obj['code'] >= start && obj['code'] <= end) {
                            obj['sign'].push('stopHighlight');
                            obj['mileage'].push(mileage);
                            break;
                        }
                    }
                }
                //人停车时间高亮
                if (options.peopleHighlightRange.length) {
                    for (var i = 0; i < options.peopleHighlightRange.length; i++) {
                        var start = options.peopleHighlightRange[i][0];
                        var end = options.peopleHighlightRange[i][1];
                        var mileage = options.peopleHighlightRange[i][2];
                        if (start == 'today') {
                            start = _today['code'];
                        }
                        if (end == 'today') {
                            end = _today['code'];
                        }
                        if (start > end) {
                            start = [end, end = start][0];
                        }
                        if (obj['code'] >= start && obj['code'] <= end) {
                            obj['sign'].push('peopleHighlight');
                            obj['mileage'].push(mileage);
                            break;
                        }
                    }
                }
                //物停车时间高亮
                if (options.thingHighlightRange.length) {
                    for (var i = 0; i < options.thingHighlightRange.length; i++) {
                        var start = options.thingHighlightRange[i][0];
                        var end = options.thingHighlightRange[i][1];
                        var mileage = options.thingHighlightRange[i][2];
                        if (start == 'today') {
                            start = _today['code'];
                        }
                        if (end == 'today') {
                            end = _today['code'];
                        }
                        if (start > end) {
                            start = [end, end = start][0];
                        }
                        if (obj['code'] >= start && obj['code'] <= end) {
                            obj['sign'].push('thingHighlight');
                            obj['mileage'].push(mileage);
                            break;
                        }
                    }
                }

                if (obj['code'] == _today['code']) {
                    obj['sign'].push('today');
                }
                return obj;
            };
            var getData = function (obj) {
                if (typeof obj == 'undefined') {
                    obj = _today;
                }
                _day = getDateObj(obj['year'], obj['month'], 1);      //当月第一天
                var days = getMonthDays(_day);              //当月天数
                var data = [];                              //日历信息
                var obj = {};
                //上月日期
                for (var i = _day['week']; i > 0; i--) {
                    obj = getDateObj(_day['year'], _day['month'], _day['day'] - i);
                    var info = getDateInfo(obj);
                    if (!options.limitRange.length) {
                        info['status'] = 'disabled';
                    }
                    data.push(info);
                }
                //当月日期
                for (var i = 0; i < days; i++) {
                    obj = {
                        'year': _day['year'],
                        'month': _day['month'],
                        'day': _day['day'] + i,
                        'week': (_day['week'] + i) % 7
                    };
                    obj['code'] = '' + obj['year'] + (obj['month'] > 9 ? obj['month'] : '0' + obj['month']) + (obj['day'] > 9 ? obj['day'] : '0' + obj['day']);
                    var info = getDateInfo(obj);
                    data.push(info);
                }
                //下月日期
                var last = obj;
                for (var i = 1; last['week'] + i < 7; i++) {
                    obj = getDateObj(last['year'], last['month'], last['day'] + i);
                    var info = getDateInfo(obj);
                    if (!options.limitRange.length) {
                        info['status'] = 'disabled';
                    }
                    data.push(info);
                }
                return data;
            };
            var format = function (data) {
                options.onChange(_day);
                var html = '<tr>';
                for (var i = 0, len = data.length; i < len; i++) {
                    var day = data[i];
                    var arr = [];
                    for (var s = 0; s < day['sign'].length; s++) {
                        arr.push(options.prefix + '-' + day['sign'][s]);
                    }
                    if (day['status']) {
                        arr.push(options.prefix + '-' + day['status']);
                    }
                    var className = arr.join(' ');
                    html += '<td' + (className ? ' class="' + className + '"' : '') + ' data-id="' + i + '" title="'+ (data[i].mileage[0] == "" || data[i].mileage[0] == undefined ? "-" : data[i].mileage[0]) +'">\
                        ' + (day['link'] ? '<a href="' + day['link'] + '">' + day['day'] + '</a>' : '<span class="dayShow">' + day['day'] + '<br/><span class="mileageList">' + (data[i].mileage[0] == "" || data[i].mileage[0] == undefined ? "-" : data[i].mileage[0]) + '</span></span>') + '\
                    </td>';
                    if (i % 7 == 6 && i < len - 1) {
                        html += '</tr><tr>';
                    }
                }
                html += '</tr>';
                $title.html(_day['year'] + '年' + _day['month'] + '月');
                $tbody.html(html);
            };
            /***** 初始化 *****/
            _today = getDateObj();
            _day = {
                'year': _today['year'],
                'month': _today['month']
            };
            $prevMonth.click(function () {
                var monthString = $(this).next("span").text().replace(/[\u4e00-\u9fa5]+/g, "-");
                afterMonth = monthString.substring(0, monthString.length - 1) + "-01";
                if (parseInt(afterMonth.substring(5, afterMonth.length)) - 1 <= 0) {
                    nowMonth = parseInt(afterMonth.substring(0, 4)) - 1 + "-12" + "-01";
                    nowYear = parseInt(afterMonth.substring(0, 4)) - 1;
                    monthIndex = 12;
                } else {
                    nowMonth = afterMonth.substring(0, 5) + (parseInt(afterMonth.substring(5, afterMonth.length)) - 1) + "-01";
                    nowYear = afterMonth.substring(0, 4);
                    monthIndex = parseInt(afterMonth.substring(5, afterMonth.length)) - 1;
                }
                var carID = $("#savePid").attr('value');
                var nowDateArray = nowMonth.split("-");
                var afterDateArray = afterMonth.split("-");
                nowMonth = nowDateArray[0] + "-" + (nowDateArray[1] < 10 ? "0" + nowDateArray[1] : nowDateArray[1]) + "-" + nowDateArray[2];
                afterMonth = afterDateArray[0] + "-" + (afterDateArray[1] < 10 ? "0" + afterDateArray[1] : afterDateArray[1]) + "-" + afterDateArray[2];
                if (carID != "") {
                    isFlag = true;
                    trackPlayback.getActiveDate(carID, nowMonth, afterMonth);
                }
                ;
                var zTreeDemoHeight = $("#treeDemo").height();
                var oldLength = $(".calendar3 tbody tr").length;
                _day['month']--;
                _data = getData(_day);
                format(_data);

                $('.calendar3 tbody td').each(function () {
                    if ($(this).hasClass("widget-disabled")) {
                        $(this).removeClass("widget-highlight").removeClass("widget-stopHighlight");
                        $(this).children("span").children("span.mileageList").text("");
                    }
                })
                var trBtnLength = $(".calendar3 tbody tr").length;
                if (trBtnLength > oldLength) {
                    $("#treeDemo").css("height", (zTreeDemoHeight - 34) + "px");
                } else if (trBtnLength < oldLength) {
                    $("#treeDemo").css("height", (zTreeDemoHeight + 54) + "px");
                }
            });
            $nextMonth.click(function () {
                var monthString = $(this).siblings("span").text().replace(/[\u4e00-\u9fa5]+/g, "-");
                var nowMonthString = monthString.substring(0, monthString.length - 1);
                nowMonth = nowMonthString.substring(0, 4) + "-" + (parseInt(nowMonthString.substring(5, nowMonthString.length)) + 1) + "-01";
                if ((parseInt(nowMonthString.substring(5, nowMonthString.length)) + 1) - 12 == 0) {
                    afterMonth = parseInt(nowMonthString.substring(0, 4)) + 1 + "-1" + "-01";
                    nowYear = parseInt(nowMonthString.substring(0, 4));
                    monthIndex = 12;
                } else if ((parseInt(nowMonthString.substring(5, nowMonthString.length)) + 1) - 12 > 0) {
                    afterMonth = parseInt(nowMonthString.substring(0, 4)) + 1 + "-2" + "-01";
                    nowMonth = parseInt(nowMonthString.substring(0, 4)) + 1 + "-1" + "-01";
                    nowYear = parseInt(nowMonthString.substring(0, 4)) + 1;
                    monthIndex = 1;
                } else {
                    afterMonth = nowMonthString.substring(0, 5) + (parseInt(nowMonthString.substring(5, nowMonthString.length)) + 2) + "-01";
                    nowYear = nowMonthString.substring(0, 4);
                    monthIndex = parseInt(nowMonthString.substring(5, nowMonthString.length)) + 1;
                }
                var carID = $("#savePid").attr('value');
                var nowDateArray = nowMonth.split("-");
                var afterDateArray = afterMonth.split("-");
                nowMonth = nowDateArray[0] + "-" + (nowDateArray[1] < 10 ? "0" + nowDateArray[1] : nowDateArray[1]) + "-" + nowDateArray[2];
                afterMonth = afterDateArray[0] + "-" + (afterDateArray[1] < 10 ? "0" + afterDateArray[1] : afterDateArray[1]) + "-" + afterDateArray[2];
                if (carID != "") {
                    isFlag = true;
                    trackPlayback.getActiveDate(carID, nowMonth, afterMonth);
                }
                ;
                var zTreeDemoHeight = $("#treeDemo").height();
                var oldLength = $(".calendar3 tbody tr").length;
                _day['month']++;
                _data = getData(_day);
                format(_data);
                $('.calendar3 tbody td').each(function () {
                    if ($(this).hasClass("widget-disabled")) {
                        $(this).removeClass("widget-highlight").removeClass("widget-stopHighlight");
                        $(this).children("span").children("span.mileageList").text("");
                    }
                })
                var trBtnLength = $(".calendar3 tbody tr").length;
                if (trBtnLength > oldLength) {
                    $("#treeDemo").css("height", (zTreeDemoHeight - 34) + "px");
                } else if (trBtnLength < oldLength) {
                    $("#treeDemo").css("height", (zTreeDemoHeight + 54) + "px");
                }
            });
            $prevYear.click(function () {
                var monthString = $(this).siblings("span").text().replace(/[\u4e00-\u9fa5]+/g, "-");
                var afterMonthString = monthString.substring(0, monthString.length - 1);
                afterMonth = (parseInt(afterMonthString.substring(0, 4)) - 1) + "-" + (parseInt(afterMonthString.substring(5, afterMonthString.length)) + 1) + "-01";
                nowMonth = (parseInt(afterMonthString.substring(0, 4)) - 1) + "-" + parseInt(afterMonthString.substring(5, afterMonthString.length)) + "-01";
                nowYear = parseInt(afterMonthString.substring(0, 4)) - 1;
                monthIndex = afterMonthString.substring(5, afterMonthString.length);
                var carID = $("#savePid").attr('value');
                var nowDateArray = nowMonth.split("-");
                var afterDateArray = afterMonth.split("-");
                nowMonth = nowDateArray[0] + "-" + (nowDateArray[1] < 10 ? "0" + nowDateArray[1] : nowDateArray[1]) + "-" + nowDateArray[2];
                afterMonth = afterDateArray[0] + "-" + (afterDateArray[1] < 10 ? "0" + afterDateArray[1] : afterDateArray[1]) + "-" + afterDateArray[2];
                if (carID != "") {
                    isFlag = true;
                    trackPlayback.getActiveDate(carID, nowMonth, afterMonth);
                }
                ;

                var zTreeDemoHeight = $("#treeDemo").height();
                var oldLength = $(".calendar3 tbody tr").length;
                _day['year']--;
                _data = getData(_day);
                format(_data);
                var trBtnLength = $(".calendar3 tbody tr").length;
                if (trBtnLength > oldLength) {
                    $("#treeDemo").css("height", (zTreeDemoHeight - 34) + "px");
                } else if (trBtnLength < oldLength) {
                    $("#treeDemo").css("height", (zTreeDemoHeight + 54) + "px");
                }
            });
            $nextYear.click(function () {
                var monthString = $(this).siblings("span").text().replace(/[\u4e00-\u9fa5]+/g, "-");
                var afterMonthString = monthString.substring(0, monthString.length - 1);
                afterMonth = (parseInt(afterMonthString.substring(0, 4)) + 1) + "-" + (parseInt(afterMonthString.substring(5, afterMonthString.length)) + 1) + "-01";
                nowMonth = (parseInt(afterMonthString.substring(0, 4)) + 1) + "-" + parseInt(afterMonthString.substring(5, afterMonthString.length)) + "-01";
                nowYear = parseInt(afterMonthString.substring(0, 4)) + 1;
                monthIndex = afterMonthString.substring(5, afterMonthString.length);
                var carID = $("#savePid").attr('value');
                var nowDateArray = nowMonth.split("-");
                var afterDateArray = afterMonth.split("-");
                nowMonth = nowDateArray[0] + "-" + (nowDateArray[1] < 10 ? "0" + nowDateArray[1] : nowDateArray[1]) + "-" + nowDateArray[2];
                afterMonth = afterDateArray[0] + "-" + (afterDateArray[1] < 10 ? "0" + afterDateArray[1] : afterDateArray[1]) + "-" + afterDateArray[2];
                if (carID != "") {
                    isFlag = true;
                    trackPlayback.getActiveDate(carID, nowMonth, afterMonth);
                }
                ;
                var zTreeDemoHeight = $("#treeDemo").height();
                var oldLength = $(".calendar3 tbody tr").length;
                _day['year']++;
                _data = getData(_day);
                format(_data);
                var trBtnLength = $(".calendar3 tbody tr").length;
                if (trBtnLength > oldLength) {
                    $("#treeDemo").css("height", (zTreeDemoHeight - 34) + "px");
                } else if (trBtnLength < oldLength) {
                    $("#treeDemo").css("height", (zTreeDemoHeight + 54) + "px");
                }
            });
            $back.click(function () {
                _data = getData();
                format(_data);
            });
            $this.unbind("click").on('click', 'td', function (e) {

                if (!ifDoubleClick){ //防止点击过快wjk
                    return;
                } else {
                    ifDoubleClick = false;
                }

                try {
                    trackPlayback.stopMove();
                    $("#playIcon").attr("class", "resultIcon playIcon");
                    $("#playIcon").removeAttr("data-original-title data-placement data-toggle");
                    $("#playIcon").attr({
                        "data-toggle": "tooltip",
                        "data-placement": "top",
                        "data-original-title": "播放"
                    });
                    isSearch = true;
                } catch (e) {
                    $("#playIcon").attr("class", "resultIcon playIcon");
                    $("#playIcon").removeAttr("data-original-title data-placement data-toggle");
                    $("#playIcon").attr({
                        "data-toggle": "tooltip",
                        "data-placement": "top",
                        "data-original-title": "播放"
                    });
                }
                if ($("#chooseStopPoint").attr("checked")) {
                    $("#chooseStopPoint").prop("checked", false).removeAttr("checked", "checked");
                }
                $("#myTab").children("li").removeClass("active");
                $("#myTab").children("li:first-child").addClass("active");
                $("#myTabContent").children("div").removeClass("active in");
                $("#myTabContent").children("div:first-child").addClass("active in");
                //重置播放进度
                $("#progressBar_Track").removeAttr("style");
                //点击日历天数查询时隐藏其他 显示第一个
                $("#peopleGPSData,#stopData,#peopleStopData,#warningData").hide();
                $("#GPSData").addClass("active in").show();
                //日历点击取消报警点勾选
                if ($("#chooseAlarmPoint").attr("checked")) {
                    $("#chooseAlarmPoint").prop("checked", false).removeAttr("checked", "checked");
                }
                $("#gpsTable3>tbody").html('<tr class=""><td valign="top" colspan="12" class="dataTables_empty">我本将心向明月，奈何明月照沟渠，不行您再用其他方式查一下？</td></tr>');
                //清空报警点集合(markerAlarmList)
                trackPlayback.markerAlarmClear();
                //加载时隐藏列表
                if ($(this).hasClass("widget-highlight") || $(this).hasClass("widget-peopleHighlight")) {
                    if ($("#scalingBtn").hasClass("fa-chevron-down")) {
                        var windowHeight = $(window).height();
                        headerHeight = $("#header").height();
                        titleHeight = $(".panHeadHeight").height() + 30;
                        demoHeight = $("#Demo").height();
                        var oldMHeight = $("#MapContainer").height();
                        var oldTHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
                        var mapHeight = windowHeight - headerHeight - titleHeight - demoHeight - 20;
                        $("#MapContainer").css({
                            "height": mapHeight + "px"
                        });
                        $(".trackPlaybackTable .dataTables_scrollBody").css({
                            "height": oldTHeight + "px"
                        });
                        $("#scalingBtn").attr("class", "fa  fa-chevron-down");
                    }
                }
                stopDataFlag = true;
                trackPlayback.Assemblys();
                var $this = $(this);
                var index = $(this).data('id');
                var day = _data[index];
                var flag = trackPlayback.disable();
                if (flag == false) {
                    return false;
                }
                //给开始和结束时间赋值(正常车辆)
                if ($this.hasClass("widget-highlight")) {
                    var value = $this.children('span').children('span.mileageList').text();
                    var startTime = day.year + "-" + (day.month < 10 ? "0" + day.month : day.month) + "-" + (day.day < 10 ? "0" + day.day : day.day) + " " + "00:00:00";
                    var endTime = day.year + "-" + (day.month < 10 ? "0" + day.month : day.month) + "-" + (day.day < 10 ? "0" + day.day : day.day) + " " + "23:59:59";
                    $("#timeInterval").val(startTime + "--" + endTime);
                    trackPlayback.clears();
                    playState = true;
                    map.clearMap();
                    $("#allMileage").text(0 + "km");
                    $("#allTime").text(0);
                    $("#maxSpeend").text(0 + "km/h");
                    trackPlayback.getHistory(value);
                }
                ;
                //超待设备
                if ($this.hasClass("widget-stopHighlight")) {
                    var value = $this.children('span').children('span.mileageList').text();
                    var startTime = day.year + "-" + (day.month < 10 ? "0" + day.month : day.month) + "-" + (day.day < 10 ? "0" + day.day : day.day) + " " + "00:00:00";
                    var endTime = day.year + "-" + (day.month < 10 ? "0" + day.month : day.month) + "-" + (day.day < 10 ? "0" + day.day : day.day) + " " + "23:59:59";
                    $("#timeInterval").val(startTime + "--" + endTime);
                    trackPlayback.clears();
                    playState = true;
                    map.clearMap();
                    $("#allMileage").text(0 + "km");
                    $("#allTime").text(0);
                    $("#maxSpeend").text(0 + "km/h");
                    trackPlayback.getHistory(value);
                }
                ;
                //人
                if ($this.hasClass("widget-peopleHighlight")) {
                    var value = $this.children('span').children('span.mileageList').text();
                    $(".mileageList").parent().parent().attr("title",value);
                    var startTime = day.year + "-" + (day.month < 10 ? "0" + day.month : day.month) + "-" + (day.day < 10 ? "0" + day.day : day.day) + " " + "00:00:00";
                    var endTime = day.year + "-" + (day.month < 10 ? "0" + day.month : day.month) + "-" + (day.day < 10 ? "0" + day.day : day.day) + " " + "23:59:59";
                    $("#timeInterval").val(startTime + "--" + endTime);
                    trackPlayback.clears();
                    playState = true;
                    map.clearMap();
                    $("#allMileage").text(0 + "km");
                    $("#allTime").text(0);
                    $("#maxSpeend").text(0 + "km/h");
                    trackPlayback.getHistory(value);
                }
                ;
                /*end*/
                if (day['status'] != 'disabled') {
                    if (options.isRange) {
                        if (_range.length != 1) {
                            _range = [day];
                            format(_data);
                        } else {
                            _range.push(day);
                            _range.sort(function (a, b) {
                                return a['code'] > b['code'];
                            });
                            format(_data);
                            options.onSelect(_range);
                        }
                    } else {
                        _range = [day];
                        format(_data);
                        options.onSelect(_range);
                    }
                }
                $('.calendar3 tbody td').each(function () {
                    if ($(this).hasClass("widget-disabled")) {
                        $(this).removeClass("widget-highlight").removeClass("widget-stopHighlight");
                        $(this).children("span").children("span.mileageList").text("-");
                    }
                })

                setTimeout(function () {
                    ifDoubleClick=true;
                },300)
            });
            _data = getData();
            format(_data);
        });
    };
}));
/**
 * Created by Tdz on 2016/10/12.
 */
// var stompClient;
// var webSocket = {
//     socket: null,
//     subscribeArr: [],
//     url: "",
//     conFlag: false,
//     unsubscribeMap: {},
//     init: function (url, headers, subUrl, callBack, sendUrl, requestStr) {
//         webSocket.url = url;
//         webSocket.socket = new SockJS(webSocket.url);
//         stompClient = Stomp.over(webSocket.socket);
//         stompClient.connect(headers, function () {
//             webSocket.conFlag = true;
//             webSocket.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr);
//         });
//     },
//     send: function (url, headers, requestStr) {
//         stompClient.send(url, headers, JSON.stringify(requestStr));
//     },
//     subscribeAndSend: function (subUrl, callBack, sendUrl, headers, requestStr, state) {
//         if (webSocket.subscribeArr.indexOf(subUrl) === -1 || state) {
//          if (webSocket.subscribeArr.indexOf(subUrl) === -1) {
//              webSocket.subscribeArr.push(subUrl);
//          }
//             webSocket.unsubscribeMap[subUrl] = stompClient.subscribe(subUrl, callBack);
//         }
//         webSocket.send(sendUrl, headers, requestStr);
//     },
//     subscribe: function (headers, subUrl, callBack, sendUrl, requestStr, state) {
//         if (stompClient.connected) {
//             webSocket.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr, state);
//             return;
//         }
//         stompClient.connect(headers, function () {
//             webSocket.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr);
//         });
//     },
//     unsubscribealarm: function (headers, url, requestStr) {
//         stompClient.send(url, headers, JSON.stringify(requestStr));
//     },
//     abort: function(headers, url) {
//      stompClient.disconnect(url, headers);
//     },
//     unsubscribe: function(url) {
//         var unsubscribe = webSocket.unsubscribeMap[url];
//         if (unsubscribe) {
//             unsubscribe.unsubscribe();
//         }
//         var index = webSocket.subscribeArr.indexOf(url);
//         if (index > -1) {
//             webSocket.subscribeArr.splice(index, 1);
//         }
//     },
//     close: function () {
//         if (webSocket.socket == null) {
//
//         } else {
//             webSocket.socket.close();
//         }
//     }
// };


// class WebSocketCreate {
//
//   constructor() {
//     this.socket = null;
//     this.subscribeArr = [];
//     this.url = "";
//     this.conFlag = false;
//     this.unsubscribeMap = {};
//     this.stompClient = null;
//   }
//
//   init (url, headers, subUrl, callBack, sendUrl, requestStr) {
//     this.url = url;
//     this.socket = new SockJS(this.url);
//     this.stompClient = Stomp.over(this.socket);
//     var that = this;
//     that.stompClient.connect(headers, function () {
//       that.conFlag = true;
//       that.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr);
//     });
//   }
//
//   send(url, headers, requestStr) {
//     this.stompClient.send(url, headers, JSON.stringify(requestStr));
//   }
//
//   subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr, state) {
//     if (this.subscribeArr.indexOf(subUrl) === -1 || state) {
//       if (this.subscribeArr.indexOf(subUrl) === -1) {
//         this.subscribeArr.push(subUrl);
//       }
//       this.unsubscribeMap[subUrl] = this.stompClient.subscribe(subUrl, callBack);
//     }
//     this.send(sendUrl, headers, requestStr);
//   }
//
//   subscribe(headers, subUrl, callBack, sendUrl, requestStr, state) {
//     if (this.stompClient.connected) {
//       this.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr, state);
//       return;
//     }
//     var that = this;
//     that.stompClient.connect(headers, function () {
//       that.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr);
//     });
//   }
//
//   unsubscribealarm (headers, url, requestStr) {
//     this.stompClient.send(url, headers, JSON.stringify(requestStr));
//   }
//
//   abort(headers, url) {
//     this.stompClient.disconnect(url, headers);
//   }
//
//   unsubscribe(url) {
//     var unsubscribe = this.unsubscribeMap[url];
//     if (unsubscribe) {
//       unsubscribe.unsubscribe();
//     }
//     var index = this.subscribeArr.indexOf(url);
//     if (index > -1) {
//       this.subscribeArr.splice(index, 1);
//     }
//   }
//
//   close() {
//     if (this.socket == null) {
//
//     } else {
//       this.socket.close();
//     }
//   }
// }
//
// var webSocket = new WebSocketCreate();

"use strict";

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var WebSocketCreate = function () {
  function WebSocketCreate() {
    _classCallCheck(this, WebSocketCreate);

    this.socket = null;
    this.subscribeArr = [];
    this.url = "";
    this.conFlag = false;
    this.unsubscribeMap = {};
    /*this.stompClient=null;*/
    this.stompClient = {
      'connect': function () {},
      'send': function () {}
    };
  }

  _createClass(WebSocketCreate, [{
    key: "init",
    value: function init(url, headers, subUrl, callBack, sendUrl, requestStr) {
      this.url = url;
      this.socket = new SockJS(this.url);
      this.stompClient = Stomp.over(this.socket);
      var that = this;
      that.stompClient.connect(headers, function () {
        that.conFlag = true;
        that.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr);
      });
    }
  }, {
    key: "send",
    value: function send(url, headers, requestStr) {
      this.stompClient.send(url, headers, JSON.stringify(requestStr));
    }
  }, {
    key: "subscribeAndSend",
    value: function subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr, state) {
      if (this.subscribeArr.indexOf(subUrl) === -1 || state) {
        if (this.subscribeArr.indexOf(subUrl) === -1) {
          this.subscribeArr.push(subUrl);
        }
        this.unsubscribeMap[subUrl] = this.stompClient.subscribe(subUrl, callBack);
      }
      this.send(sendUrl, headers, requestStr);
    }
  }, {
    key: "subscribe",
    value: function subscribe(headers, subUrl, callBack, sendUrl, requestStr, state) {
      if (this.stompClient.connected) {
        this.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr, state);
        return;
      }
      var that = this;
      that.stompClient.connect(headers, function () {
        that.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr);
      });
    }
  }, {
    key: "unsubscribealarm",
    value: function unsubscribealarm(headers, url, requestStr) {
      this.stompClient.send(url, headers, JSON.stringify(requestStr));
    }
  }, {
    key: "abort",
    value: function abort(headers, url) {
      this.stompClient.disconnect(url, headers);
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(url) {
      var unsubscribe = this.unsubscribeMap[url];
      if (unsubscribe) {
        unsubscribe.unsubscribe();
      }
      var index = this.subscribeArr.indexOf(url);
      if (index > -1) {
        this.subscribeArr.splice(index, 1);
      }
    }
  }, {
    key: "close",
    value: function close() {
      if (this.socket == null) {
      } else {
        this.socket.close();
      }
    }
  }]);

  return WebSocketCreate;
}();

var webSocket = new WebSocketCreate();





/**
 * 地图播放器
 */
var mapPlayer = function () {
    this.map = null;
    this.len = 0;
    this.pos = 0;
    this.speed = 0;
    this.callBack = null;
    this.interval = null;
    this.start = false;
}

mapPlayer.prototype.play = function () {
    if(mapPlayer.map !== null && mapPlayer.map != undefined){
        mapPlayer.interval = setInterval('mapPlayer.writeMap()', mapPlayer.speed);
        mapPlayer.start = true;
    }
}
mapPlayer.prototype.init = function (positions, speed) {
    mapPlayer.map = positions;
    mapPlayer.len = positions.length;
    mapPlayer.speed = speed;
}
mapPlayer.prototype.writeMap = function (positions, speed) {
    if (mapPlayer.length < mapPlayer.pos) {
        mapPlayer.start = false;
        clearInterval(mapPlayer.interval);
    }
    mapPlayer.pos++;
}
//暂停
mapPlayer.prototype.pause = function () {
    if(mapPlayer.start){
        clearInterval(mapPlayer.interval);
    }
}

//加速
mapPlayer.prototype.speedUp = function () {
    if(mapPlayer.start){
        clearInterval(mapPlayer.interval);
        mapPlayer.interval = setInterval('mapPlayer.writeMap()', (mapPlayer.speed / 2));
    }
}
//停止
mapPlayer.prototype.stop = function () {
    if(mapPlayer.start) {
        mapPlayer.pos = 0;
        mapPlayer.start = false;
        clearInterval(mapPlayer.interval);
    }
}
//前进
mapPlayer.prototype.up = function () {
    if(mapPlayer.start) {
        if (mapPlayer.len - mapPlayer.pos > 5) {
            mapPlayer.pos += 5;
        } else {
            mapPlayer.pos = mapPlayer.len - 1;
        }
        clearInterval(mapPlayer.interval);
        mapPlayer.interval = setInterval('mapPlayer.writeMap()', mapPlayer.speed);
    }
}
//后退
mapPlayer.prototype.down = function () {
    if(mapPlayer.start) {
        if (mapPlayer.pos > 5) {
            mapPlayer.pos -= 5;
        } else {
            mapPlayer.pos = 0;
        }
        clearInterval(mapPlayer.interval);
        mapPlayer.interval = setInterval('mapPlayer.writeMap()', mapPlayer.speed);
    }
}
/**
 * Created by Tdz on 2016-11-24.
 */
function json_ajax(type, url, dataType, async, data, callback) {
    $.ajax(
        {
            type: type,//通常会用到两种：GET,POST。默认是：GET
            url: url,//(默认: 当前页地址) 发送请求的地址
            dataType: dataType, //预期服务器返回的数据类型。"json"
            async: async, // 异步同步，true  false
            data: data,
            timeout: 30000, //超时时间设置，单位毫秒
            beforeSend: beforeSend, //发送请求
            success: callback, //请求成功
            error: error,//请求出错
            complete: complete//请求完成
        });
}

function ajax_submit(type, url, dataType, async, data, traditional, callback) {
    $.ajax(
        {
            type: type,//通常会用到两种：GET,POST。默认是：GET
            url: url,//(默认: 当前页地址) 发送请求的地址
            dataType: dataType, //预期服务器返回的数据类型。"json"
            async: async, // 异步同步，true  false
            data: data,
            traditional: traditional,
            timeout: 30000, //超时时间设置，单位毫秒
            beforeSend: beforeSend, //发送请求
            success: callback, //请求成功
            error: error,//请求出错
            complete: complete//请求完成
        });
}

//逆地理编码专用ajax
function address_submit(type, url, dataType, async, data, traditional, callback) {
    $.ajax(
        {
            type: type,//通常会用到两种：GET,POST。默认是：GET
            url: url,//(默认: 当前页地址) 发送请求的地址
            dataType: dataType, //预期服务器返回的数据类型。"json"
            async: async, // 异步同步，true  false
            data: data,
            traditional: traditional,
            timeout: 30000, //超时时间设置，单位毫秒
            success: callback, //请求成功
            error: error,//请求出错
        });
}

function json_ajax_p(type, url, dataType, async, data, callback) {
    $.ajax(
        {
            type: type,//通常会用到两种：GET,POST。默认是：GET
            url: url,//(默认: 当前页地址) 发送请求的地址
            dataType: dataType, //预期服务器返回的数据类型。"json"
            async: async, // 异步同步，true  false
            data: data,
            timeout: 30000, //超时时间设置，单位毫秒
            // beforeSend:beforeSend, //发送请求
            success: callback, //请求成功
            error: error,//请求出错
            // complete:complete//请求完成
        });
}

//支持Form方式excel导出
function exportExcelUseForm(url, params) {
    var form = $('<form method="POST" action="' + url + '">');
    $.each(params, function (k, v) {
        form.append($('<input type="hidden" name="' + k +
            '" value="' + v + '">'));
    });
    $('body').append(form);
    form.submit(); //自动提交
}

//支持Form方式excel导出
function exportExcelUseFormGet(url, params) {
    var form = $('<form method="GET" action="' + url + '">');
    $.each(params, function (k, v) {
        form.append($('<input type="hidden" name="' + k +
            '" value="' + v + '">'));
    });
    $('body').append(form);
    form.on('submit', function(e){
        var $form = $(this);
        if ($form.data('submitted') === true) {
            e.preventDefault();
        } else {
            $form.data('submitted', true);
        }
    });
    form.submit(); //自动提交
}


//支持post方式excel导出
function exportExcelUsePost(url, params) {
    $.ajax({
        type: "POST",
        url: url,
        data: params,
        success: function (response, status, request) {
            var disp = request.getResponseHeader('Content-Disposition');
            if (disp && disp.search('attachment') != -1) {  //判断是否为文件
                var form = $('<form method="POST" action="' + url + '">');
                $.each(params, function (k, v) {
                    form.append($('<input type="hidden" name="' + k +
                        '" value="' + v + '">'));
                });
                $('body').append(form);
                form.submit(); //自动提交
            }
        },
        beforeSend: beforeSend, //发送请求
        error: error,//请求出错
        complete: complete//请求完成
    })
}


function error(XMLHttpRequest, textStatus, errorThrown) {
    layer.closeAll('loading');
    if (textStatus === "timeout") {
        layer.msg("加载超时，请重试");
        return;
    }
    if (XMLHttpRequest.responseText.indexOf("<form id=\"loginForm") > 0) {
        window.location.replace("/clbs/login?type=expired");
        return;
    }
    layer.msg("系统的情绪不稳定，并向你扔了一个错误~");
}

function beforeSend(XMLHttpRequest) {
    layer.load(2);
}

function complete(XMLHttpRequest, textStatus) {
    layer.closeAll('loading');
}

//逆地理编码 -- 解析两个经纬度一组的数据
var startAddress, endAddress, pushIndex = 1;

function backAddressMsg(index, addressLngLat, goBackMsg, addressArray) {
    var arrayIndex = index;
    $.ajax(
        {
            type: "POST",
            url: "/clbs/v/monitoring/getAddress",
            dataType: "json",
            async: true,
            data: {lnglatXYs: addressLngLat[index]},
            traditional: true,
            timeout: 30000,
            success: function (data) {
                var carAddress = data;
                if (carAddress == "AddressNull") {
                    var geocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: "base"
                    });
                    geocoder.getAddress(addressLngLat[index]);
                    AMap.event.addListener(geocoder, "complete", function (GeocoderResult) {
                        arrayIndex++;
                        if (pushIndex == 1) {
                            if (GeocoderResult.info == 'NO_DATA') {
                                startAddress = '未定位';
                            } else {
                                startAddress = GeocoderResult.regeocode.formattedAddress;
                            }
                            ;
                            pushIndex++;
                        } else {
                            if (GeocoderResult.info == 'NO_DATA') {
                                endAddress = '未定位';
                            } else {
                                endAddress = GeocoderResult.regeocode.formattedAddress;
                            }
                            ;
                            addressArray.push([startAddress, endAddress]);
                            startAddress = null;
                            endAddress == null;
                            pushIndex = 1;
                        }
                        if (startAddress != '未定位' && endAddress != '未定位') {
                            var addressParticulars = getaddressParticulars(GeocoderResult, addressLngLat[index][0], addressLngLat[index][1]);
                            $.ajax({
                                type: "POST",
                                url: "/clbs/v/monitoring/setAddress",
                                dataType: "json",
                                async: true,
                                data: {"addressNew": addressParticulars},
                                traditional: false,
                                timeout: 30000,
                            });
                        }
                        ;
                        if (arrayIndex < addressLngLat.length) {
                            backAddressMsg(arrayIndex, addressLngLat, goBackMsg, addressArray);
                        } else {
                            return goBackMsg(addressArray);
                        }
                    });
                } else {
                    arrayIndex++;
                    if (pushIndex == 1) {
                        startAddress = carAddress;
                        pushIndex++;
                    } else {
                        endAddress = carAddress;
                        addressArray.push([startAddress, endAddress]);
                        startAddress = null;
                        endAddress == null;
                        pushIndex = 1;
                    }
                    ;
                    if (arrayIndex < addressLngLat.length) {
                        backAddressMsg(arrayIndex, addressLngLat, goBackMsg, addressArray);
                    } else {
                        return goBackMsg(addressArray);
                    }
                }
            },
        });
}

//逆地理编码 -- 解析一条加载一条
function backAddressMsg1(index, addressLngLat, goBackMsg, addressArray, tableID, tdIndex) {
    var arrayIndex = index;
    $.ajax(
        {
            type: "post",
            url: "/clbs/v/monitoring/getAddress",
            dataType: "json",
            async: true,
            data: {lnglatXYs: addressLngLat[index]},
            traditional: true,
            timeout: 30000,
            success: function (data) {
                var carAddress = data;
                if (carAddress == "AddressNull") {
                    var geocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: "base"
                    });
                    geocoder.getAddress(addressLngLat[index]);
                    AMap.event.addListener(geocoder, "complete", function (GeocoderResult) {
                        arrayIndex++;
                        var addressValue_index;
                        if (GeocoderResult.info == 'NO_DATA') {
                            addressValue_index = '未定位';
                        } else {
                            addressValue_index = GeocoderResult.regeocode.formattedAddress;
                            var addressParticulars = getaddressParticulars(GeocoderResult, addressLngLat[index][0], addressLngLat[index][1]);
                            $.ajax({
                                type: "POST",
                                url: "/clbs/v/monitoring/setAddress",
                                dataType: "json",
                                async: true,
                                data: {"addressNew": addressParticulars},
                                traditional: false,
                                timeout: 30000,
                            });
                        }
                        ;
                        $("#" + tableID).children("tbody").children("tr:nth-child(" + arrayIndex + ")").children("td:nth-child(" + tdIndex + ")").text(addressValue_index);
                        if (arrayIndex < addressLngLat.length) {
                            backAddressMsg1(arrayIndex, addressLngLat, goBackMsg, addressArray, tableID, tdIndex);
                        } else {
                            return;
                        }
                    });
                } else {
                    arrayIndex++;
                    var addressValue_index = carAddress;
                    $("#" + tableID).children("tbody").children("tr:nth-child(" + arrayIndex + ")").children("td:nth-child(" + tdIndex + ")").text(addressValue_index);
                    if (arrayIndex < addressLngLat.length) {
                        backAddressMsg1(arrayIndex, addressLngLat, goBackMsg, addressArray, tableID, tdIndex);
                    } else {
                        return;
                    }
                }
            },
        });
};

function getaddressParticulars(AddressNew, longitude, latitude) {
    var addressParticulars = {
        "longitude": longitude.substring(0, longitude.lastIndexOf(".") + 4),
        "latitude": latitude.substring(0, latitude.lastIndexOf(".") + 4),
        "adcode": AddressNew.regeocode.addressComponent.adcode,//区域编码
        "building": AddressNew.regeocode.addressComponent.building,//所在楼/大厦
        "buildingType": AddressNew.regeocode.addressComponent.buildingType,
        "city": AddressNew.regeocode.addressComponent.city,
        "cityCode": AddressNew.regeocode.addressComponent.citycode,
        "district": AddressNew.regeocode.addressComponent.district,//所在区
        "neighborhood": AddressNew.regeocode.addressComponent.neighborhood,//所在社区
        "neighborhoodType": AddressNew.regeocode.addressComponent.neighborhoodType,//社区类型
        "province": AddressNew.regeocode.addressComponent.province,//省
        "street": AddressNew.regeocode.addressComponent.street,//所在街道
        "streetNumber": AddressNew.regeocode.addressComponent.streetNumber,//门牌号
        "township": AddressNew.regeocode.addressComponent.township,//所在乡镇
        "crosses": "",
        "pois": "",
        "roads": AddressNew.regeocode.roads.name,//道路名称
        "formattedAddress": AddressNew.regeocode.formattedAddress,//格式化地址
    };
    return JSON.stringify(addressParticulars);
};

//跨域请求接口
function getJsonForCross(type, url, data, dataType, async, jsonp, jsonpCallback, callback) {
    $.ajax(
        {
            type: type,
            url: url,
            data: data,
            dataType: dataType,
            async: async,
            jsonp: jsonp,
            jsonpCallback: jsonpCallback,
            timeout: 30000, //超时时间设置，单位毫秒
            beforeSend: beforeSend, //发送请求
            success: callback, //请求成功
            error: error,//请求出错
            complete: complete//请求完成
        })
}

//校验监控对象是否输入正确
// function checkBrands(id){
//  //标准车牌规则
//  var reg = /^[\u4eac\u6d25\u5180\u664b\u8499\u8fbd\u5409\u9ed1\u6caa\u82cf\u6d59\u7696\u95fd\u8d63\u9c81\u8c6b\u9102\u6e58\u7ca4\u6842\u743c\u5ddd\u8d35\u4e91\u6e1d\u85cf\u9655\u7518\u9752\u5b81\u65b0\u6d4b]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
//  //香港车牌规则
//  var reg1 = /^[A-Z]{2}[0-9]{4}$/;
//  var value = $("#" + id).val();
//     if(reg.test(value) || reg1.test(value)) {
//         return true;
//     } else {
//         return false;
//     }
// }

// wjk
function checkBrands(id) {
    var value = $("#" + id).val();
    var reg = /^[0-9a-zA-Z\u4e00-\u9fa5-]{2,20}$/;
    return reg.test(value)
}

(function ($) {
    //备份jquery的ajax方法  
    var _ajax = $.ajax;

    //重写jquery的ajax方法  
    $.ajax = function (opt) {
        //备份opt中error和success方法  
        var fn = {
            /*  error:function(XMLHttpRequest, textStatus, errorThrown){},
              success:function(data, textStatus){} ,*/
            complete: function (msg) {
            }
        }
        /*  if(opt.error){
              fn.error=opt.error;
          }
          if(opt.success){
              fn.success=opt.success;
          }  */
        if (opt.complete) {
            fn.complete = opt.complete;
        }


        //扩展增强处理  
        var _opt = $.extend(opt, {
            /*   error:function(XMLHttpRequest, textStatus, errorThrown){
                   //错误方法增强处理

                   fn.error(XMLHttpRequest, textStatus, errorThrown);
               },
               success:function(data, textStatus){
                   //成功回调方法增强处理

                   fn.success(data, textStatus);
               },*/
            complete: function (msg) {
                if (msg.responseText && msg.responseText.indexOf("<form id=\"loginForm") > 0) {
                    window.location.replace("/clbs/login?type=expired");
                    return;
                }
                fn.complete(msg);
            },
            converters: { "text json": function (json_string) {
                    if ( (typeof json_string !== 'string' && typeof json_string !== 'boolean') || !$.trim(json_string).length ) {
                        return {};
                    } else {
                        return jQuery.parseJSON( json_string );
                    }
                }
            }
        });
        return _ajax(_opt);
    };

    //组织树下拉框显示隐藏
    $("span.fa-chevron-down").on("click", function () {
        if ($(this).next().is(":hidden")) {
            $(this).siblings('input').trigger("focus");
            $(this).siblings('input').trigger("click");
        }
    });
    /*$(".fa-chevron-down").on("click", function () {
        if ($(this).next().is(":hidden")) {
            $(this).prev().trigger("focus");
            $(this).prev().trigger("click");
        }
    })*/
    $(".layer-date").unbind("click").on("click", function () {
        $(this).trigger("focus");
    })

    //防止backspace键后退网页
    document.onkeydown = function (event) {
        if (event.keyCode == 8) {// backspace的keycode=8
            var type = document.activeElement.type;// 获取焦点类型
            if (type == "text" || type == "textarea" || type == "password"
                || type == "select") {// 判断焦点类型，无法输入的类型一律屏蔽
                if (document.activeElement.readOnly == false)// 如果不是只读，则执行本次backspace按键
                    return true;
            }
            event.keyCode = 0;// 将本次按键设为0（即无按键）
            event.returnValue = false;
            return false;
        }
    };
})(jQuery);

(function ($, window) {
  var nowDate = new Date();
  var travelLineList, AdministrativeRegionsList, fenceIdList, stopDataFlag = true, cdWorldType,
      nowYear, monthIndex, nowMonth, afterMonth, startTime, endTime, logoWidth, btnIconWidth, windowWidth, newwidth,
      windowHeight, headerHeight, panelHead, citySelHght, trLength, calHeight,
      zTreeHeight, titleHeight, demoHeight, mapHeight, operMenuHeight, newOperHeight, els, oldMapHeight, myTabHeight,
      wHeight, tableHeight, listIndex, carLng, carLat, stopLng, stopLat, ScrollBar,
      ProgressBar, sWidth, buildings, mouseTool, satellLayer, realTimeTraffic,googleMapLayer, infoWindow, markerMovingControl,
      lmapHeight, stopValue_num, changeArray, RegionalQuerymarker, createSuccessStm,
      createSuccessEtm, createSuccessSpid, leftToplongtitude, leftTopLatitude, rightFloorlongtitude, rightFloorLatitude,
      turnoverClickID, worldType, objType, oldMHeight, oldTHeight, marker, paths,
      clickEventListenerZoomend, alarmSIM, alarmTopic, vcolour, markerStopAnimationFlog, icos, standbyType,
      isTrafficDisplay = true, isMapThreeDFlag = true, flagOne = true,
      flagTwo = true, dragFlag = true, tableSet = [], tableSetStop = [], tableSetStopGroup = [], tableSetstops = [],
      tableSetCopy = [], alarmTableSet = [], alarmTableSetCopy = [],
      speedM = [], timeM = [], mileageM = [], longtitudestop = [], latitudestop = [], timestop = [],
      startTimestop = [], markerStopAnimation = [], endTimestop = [], timeArray = [],
      stopArray = [], peopleArray = [], msgArray = [], stopMsgArray = [], lineArr = [], markerAlarmList = [],
      contentTrackPlayback = [], alarmIndex = 1, tableIndex = 1, stoptableIndex = 1,
      nextIndexs = 1, open = 1, advance_retreat = false, Assembly = false, btnFlag = false, markerStopFlag = false,
      flagBackGo = false, flagBack = false, speed = 20000, selIndex = 0, trIndex = 0,
      mileageMax = 0, speedMax = 0, timeMax = 0, goDamoIndex = 0, markerAlarmIndex = 0, stopIndexs = 0,
      angleList = [], dragTableHeight, objectType;
  var stopPointInfoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -10), closeWhenClickMap: true});
  var areaCheckCarInfoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -10), closeWhenClickMap: true});
  var alarmPointInfoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -10), closeWhenClickMap: true});
  var runTable = 0;
  var runTableTime = [];
  var disableFlag = true;
  var stopTable = 0;
  var stopTableTime = [];
  var allStopPoints = [];
  var warningTable = 0;
  var warningTableTime = [];
  var warningIndex = 0;
  var marking = 'run';
  var $runTableId;
  var flogKey;//判断是否绑定传感器
  var $stopTableId;
  var $warningTableId = $('#gpsTable3');
  var $thisRunTd;
  var $thisStopTd;
  var $thisWarningTd;
  var isSearch = true;
  var isAllStopPoint = false;
  var isRunAddressLoad = false;
  var isStopAddressLoad = false;
  var isWarnAddressLoad = false;
  var bflag = true;
  var crrentSubV = []; // 勾选的监控对象
  var zTreeIdJson = {};
  var setting;
  var inputChange;
  var group;
  var firstFlag = true;//解决监控对象检索,输入框内容自动回弹问题
  // 为了解决重复查询历史数据导致逆地理编码位置不准确问题
  var isSearchPlayBackData = false; // 是否对日历数据进行了点击查询
  var isLastAddressDataBack = true; // 最后一条位置信息是否返回
  trackPlayback = {
    //初始化
    init: function () {
      //获取url参数
      var vptype = trackPlayback.GetAddressUrl("type");
      //判断参数不为空 防止发生错误
      if (vptype != null && vptype.toString().length > 1) {
        worldType = vptype;
        //执行监控对象(人车)数据列表筛选
        trackPlayback.showHidePeopleOrVehicle();
      } else {
        trackPlayback.hidePeopleRelatedInfo();
      }
      //获取车id  查询当前绑定围栏信息
      var vid = trackPlayback.GetAddressUrl("vid");
      if (vid != null && vid.toString().length > 1) {
        //订阅后查询当前对象绑定围栏信息
        trackPlayback.getCurrentVehicleAllFence(vid);
        //显示围栏树及搜索 隐藏消息提示
        $("#vFenceTree").removeClass("hidden");
        $("#vSearchContent").removeClass("hidden");
        $("#vFenceMsg").addClass("hidden");

        //默认执行一遍树结构模糊搜索
        inputChange = setTimeout(function () {
          var param = $("#citySel").val();
          if (param != '') {
            trackPlayback.searchVehicleTree(param);
          }
        }, 2000);
      } else {
        $("#vFenceTree").html("").addClass("hidden");
        $("#vSearchContent").addClass("hidden");
      }
      //监听窗口变化
      $(window).resize(function () {
        var resizeWidth = $(window).width();
        if (resizeWidth < 1200) {
          $("body").css("overflow", "auto");
        } else {
          $("body").css("overflow", "hidden");
        }
        windowHeight = $(window).height();
        headerHeight = $("#header").height();//顶部的高度
        panelHead = $(".panel-heading").height() + 20;//标题栏高度
        citySelHght = $("#citySel").parent().height() + 10;//输入框高度

        trLength = $(".calendar3 tbody tr").length;
        if (trLength == 5) {
          calHeight = 295;
        } else if (trLength == 4) {
          calHeight = 350;
        } else if (trLength == 6) {
          calHeight = 340
        }
        zTreeHeight = windowHeight - headerHeight - panelHead - calHeight - citySelHght - 26;
        $("#treeDemo").css("height", zTreeHeight + "px");
        if (windowHeight <= 667) {
          $("#treeDemo").css("height", 150 + "px");
        }
        if (windowHeight <= 880) {
          $("#realTimeCanArea").css("top", "175px");
        }
        titleHeight = $(".panHeadHeight").height() + 30;
        demoHeight = $("#Demo").height();
        tabContentHeight = $("#myTabContent .active").height();
        mapHeight = initialMapH = windowHeight - headerHeight - titleHeight - tabContentHeight - demoHeight - 20;
        $("#operationMenu").css("height", windowHeight - headerHeight + "px");
        $(".sidebar").css('height', windowHeight - headerHeight + "px");
        $("#MapContainer").css({
          "height": mapHeight + "px"
        });
        operMenuHeight = $("#operationMenu").height();
        newOperHeight = windowHeight - headerHeight;
        $("#operationMenu").css({
          "height": newOperHeight + "px"
        });
      });
      nowMonth = nowDate.getFullYear() + "-" + (parseInt(nowDate.getMonth() + 1) < 10 ? "0" + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate.getMonth() + 1)) + "-01"
      afterMonth = nowDate.getFullYear() + "-" + (parseInt(nowDate.getMonth() + 2) < 10 ? "0" + parseInt(nowDate.getMonth() + 2) : parseInt(nowDate.getMonth() + 2)) + "-01";
      startTime = nowDate.getFullYear()
          + "-" + (parseInt(nowDate.getMonth() + 1) < 10 ? "0" + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate.getMonth() + 1))
          + "-" + (nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate()) + " " + "00:00:00";
      endTime = nowDate.getFullYear()
          + "-" + (parseInt(nowDate.getMonth() + 1) < 10 ? "0" + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate.getMonth() + 1))
          + "-" + (nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate()) + " " + ("23") + ":" + ("59") + ":" + ("59");
      $("#timeInterval").val(startTime + "--" + endTime);
      logoWidth = $("#header .brand").width();
      btnIconWidth = $("#header .toggle-navigation").width();
      windowWidth = $(window).width();
      newwidth = (logoWidth + btnIconWidth + 40 + 2) / windowWidth * 100;
      $("#content-left").css({
        "width": newwidth + "%"
      });
      $("#content-right").css({
        "width": 100 - newwidth + "%"
      });
      $(".sidebar").attr("class", "sidebar sidebar-toggle");
      //$(".main-content-wrapper").attr("class","main-content-wrapper main-content-toggle-left");
      windowHeight = $(window).height();
      headerHeight = $("#header").height();//顶部的高度
      panelHead = $(".panel-heading").height() + 20;//标题栏高度
      citySelHght = $("#citySel").parent().height() + 10;//输入框高度
      //日历高亮
      $('.calendar3').calendar();
      trLength = $(".calendar3 tbody tr").length;
      if (trLength == 5) {
        calHeight = 295;
      } else if (trLength == 4) {
        calHeight = 350;
      } else if (trLength == 6) {
        calHeight = 340
      }
      zTreeHeight = windowHeight - headerHeight - panelHead - calHeight - citySelHght - 26;
      $("#treeDemo").css("height", zTreeHeight + "px");
      if (windowHeight <= 667) {
        $("#treeDemo").css("height", 150 + "px");
      }
      if (windowHeight <= 880) {
        $("#realTimeCanArea").css("top", "175px");
      }
      titleHeight = $(".panHeadHeight").height() + 30;
      demoHeight = $("#Demo").height();
      mapHeight = initialMapH = windowHeight - headerHeight - titleHeight - demoHeight - 20;
      $("#operationMenu").css("height", windowHeight - headerHeight + "px");
      $(".sidebar").css('height', windowHeight - headerHeight + "px");
      $("#MapContainer").css({
        "height": mapHeight + "px"
      });
      operMenuHeight = $("#operationMenu").height();
      newOperHeight = windowHeight - headerHeight;
      $("#operationMenu").css({
        "height": newOperHeight + "px"
      });
      oldMapHeight = $("#MapContainer").height();
      myTabHeight = $("#myTab").height();
      wHeight = $(window).height();
      map = new AMap.Map("MapContainer", {
        resizeEnable: true,
        scrollWheel: true,
        zoom: 18
      });
      //获取地址栏车辆id
      var vgasId = trackPlayback.GetAddressUrl("vid");
      if (vgasId != "") {
        $("#container").css("position", "fixed");
      }
      //监听地图拖拽
      var clickEventListenerDragend = map.on('dragend', trackPlayback.clickEventListenerDragend);
      mouseTool = new AMap.MouseTool(map);
      mouseTool.on("draw", trackPlayback.createSuccess);
      //实例化3D楼块图层
      buildings = new AMap.Buildings();
      // 在map中添加3D楼块图层
      buildings.setMap(map);
      map.getCity(function (result) {
        var html = '' + result.province + '<span class="caret"></span>';
        $("#placeChoose").html(html);
      });
      AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], function () {
        map.addControl(new AMap.ToolBar({
          "direction": false,
        }));
        map.addControl(new AMap.Scale());
      });
      //卫星地图
      satellLayer = new AMap.TileLayer.Satellite();
      satellLayer.setMap(map);
      satellLayer.hide();
      //实时路况
      realTimeTraffic = new AMap.TileLayer.Traffic();
      realTimeTraffic.setMap(map);
      realTimeTraffic.hide();
      //页面区域定位
      $(".amap-logo").attr("href", "javascript:void(0)").attr("target", "");
      MarkerMovingControl = function (map, marker, path) {
        this._map = map;
        this._marker = marker;
        this._path = path;
        this._currentIndex = 0;
        marker.setMap(map);
        marker.setPosition(path[0]);
      }
      map.on("click", function () {
        $("#fenceTool>.dropdown-menu").hide();
      });
      //移动marker，会从当前位置开始向前移动
      MarkerMovingControl.prototype.move = function () {
        if (!this._listenToStepend) {
          this._listenToStepend = AMap.event.addListener(this, 'stepend', function () {
            this.step();
          }, this);
        }
        this.step();
      };
      //停止移动marker，由于控件会记录当前位置，所以相当于暂停
      MarkerMovingControl.prototype.stop = function () {
        this._marker.stopMove();
      };
      //重新开始，会把marker移动到路径的起点然后开始移动
      MarkerMovingControl.prototype.restart = function () {
        this._marker.setPosition(this._path[0]);
        this._currentIndex = 0;
        this.stop();
      };
      MarkerMovingControl.prototype.retreat = function () {
        if (nextIndexs < 2) {
          this._marker.setPosition(this._path[nextIndexs - 1]);
          this._currentIndex = nextIndexs - 1;
          this.move();
        } else {
          this._marker.setPosition(this._path[nextIndexs - 2]);
          this._currentIndex = nextIndexs - 2;
          if (open == 0) {
            this.move();
          } else if (open == 1) {
            this.move();
            this.stop();
          }
        }
      };
      MarkerMovingControl.prototype.FF = function () {
        var allLengths = this._path.length;
        if (nextIndexs < allLengths) {
          this._marker.setPosition(this._path[nextIndexs]);
          this._currentIndex = nextIndexs;
          if (nextIndexs === 1 && !($('#gpsTable tbody tr:first-child').hasClass('tableSelected') || $('#gpsTable4 tbody tr:first-child').hasClass('tableSelected'))) {
            selIndex++;
          }
          if (open == 0) {
            this.move();
          } else if (open == 1) {
            this.move();
            this.stop();
          }
        } else {
          layer.msg(trackLastPost)
        }
      };
      MarkerMovingControl.prototype.skip = function () {//***********************
        this._marker.setPosition(this._path[listIndex]);
        var anglepeople = Number(angleList[listIndex]) + 270;
        this._marker.setAngle(anglepeople);
        this._currentIndex = listIndex;
        if (open == 0) {
          this.move();
        } else if (open == 1) {
          this.move();
          this.stop();
          map.setCenter(this._path[listIndex]);
        }
        nextIndexs = listIndex + 1; //axh 2017/7/3 edit
      };
      //向前移动一步
      MarkerMovingControl.prototype.step = function () {
        //列表高亮 end
        var allLengths = this._path.length;
        //平均走一步多少份
        var averageNum = (100 / allLengths) * selIndex;
        ProgressBar.SetValue(averageNum);
        var nextIndex = this._currentIndex + 1;
        if (nextIndex <= this._path.length) {
          nextIndexs = nextIndex;
          if (nextIndex == this._path.length) {
            trackPlayback.continueAnimation();
          }
          if (!this._listenToMoveend) {
            this._listenToMoveend = AMap.event.addListener(this._marker, 'moveend', function () {
              this._currentIndex++;
              AMap.event.trigger(this, 'stepend');
            }, this);
          }
          if (goDamoIndex != nextIndex) {
            goDamoIndex = nextIndex;
            if (worldType == "5") {
              $("#gpsTable4 tbody tr").removeClass("tableSelected");
            } else {
              $("#gpsTable tbody tr").removeClass("tableSelected");
            }
            if (btnFlag) {
              trIndex = trIndex - 1;
              btnFlag = false;
            }
            ;
            if (flagBack) {
              trIndex--;
              selIndex--;
              if (trIndex < 1) {
                trIndex = 0;
              }
              ;
              if (selIndex < 1) {
                selIndex = 1;
              }
              ;
              var tableTrHeight;
              if (worldType == "5") {
                tableTrHeight = 41 * trIndex;
                $("#gpsTable4 tbody tr:nth-child(" + selIndex + ")").addClass("tableSelected");
                $("#peopleGPSData .dataTables_scrollBody").scrollTop(tableTrHeight);
              } else {
                tableTrHeight = 41 * trIndex;
                $("#gpsTable tbody tr:nth-child(" + selIndex + ")").addClass("tableSelected");
                $("#GPSData .dataTables_scrollBody").scrollTop(tableTrHeight);
              }
              flagBack = false;
            } else {
              selIndex++;
              if (worldType == "5") {
                $("#gpsTable4 tbody tr:nth-child(" + selIndex + ")").addClass("tableSelected");
              } else {
                $("#gpsTable tbody tr:nth-child(" + selIndex + ")").addClass("tableSelected");
              }
              if (selIndex >= 5) {
                trIndex++;
                var tableTrHeight;
                if (worldType == "5") {
                  tableTrHeight = 41 * trIndex;
                  $("#peopleGPSData .dataTables_scrollBody").scrollTop(tableTrHeight);
                } else {
                  tableTrHeight = 41 * trIndex;
                  $("#GPSData .dataTables_scrollBody").scrollTop(tableTrHeight);
                }
              }
              ;
            }
          }
          if (this._path[nextIndex] != undefined) {
            if (!$('#playIcon').hasClass('playIcon')) {
              this._marker.moveTo(this._path[nextIndex], speed);
              AMap.event.addListener(marker, "moving", function () {
                var msg = marker.getPosition();
                if (paths.contains(msg) != true) {
                  if (nextIndex != 1) {
                    map.panTo(msg);
                  }
                  var southwest = map.getBounds().getSouthWest();//获取西南角坐标
                  var northeast = map.getBounds().getNorthEast();//获取东北角坐标
                  var possa = southwest.lat;//纬度（小）
                  var possn = southwest.lng;
                  var posna = northeast.lat;
                  var posnn = northeast.lng;
                  paths = new AMap.Bounds(
                      [possn, possa], //西南角坐标
                      [posnn, posna]//东北角坐标
                  );
                }
                ;
              });
            }
          }
        }
        //行驶时长
        if (mileageM[nextIndexs - 1] > 0) {
          mileageMax = (mileageM[nextIndexs - 1] - mileageM[0]).toFixed(1);
          mileageMax = trackPlayback.fiterNumber(mileageMax);
          $("#allMileage").text(mileageMax + "km");
        }
        //行驶时间
        var sta_str = timeM[0];
        var end_str = timeM[nextIndexs - 1];
        var end_date = (new Date(end_str.replace(/-/g, "/"))).getTime();
        var sra_date = (new Date(sta_str.replace(/-/g, "/"))).getTime();
        var num = (end_date - sra_date);
        var theTime = parseInt(num / 1000);// 秒
        var theTime1 = 0;// 分
        var theTime2 = 0;// 小时
        if (theTime > 60) {
          theTime1 = parseInt(theTime / 60);
          theTime = parseInt(theTime % 60);
          if (theTime1 > 60) {
            theTime2 = parseInt(theTime1 / 60);
            theTime1 = parseInt(theTime1 % 60);
          }
        }
        ;
        var result = "" + parseInt(theTime) + "秒";
        if (theTime1 > 0) {
          result = "" + parseInt(theTime1) + "分" + result;
        }
        ;
        if (theTime2 > 0) {
          result = "" + parseInt(theTime2) + "小时" + result;
        }
        ;
        timeMax = result;
        $("#allTime").text(timeMax);
        //最大速度
        var newary = speedM.slice(0, nextIndexs);
        speedMax = Math.max.apply(null, newary);
        speedMax = trackPlayback.fiterNumber(speedMax);
        $("#maxSpeend").text(speedMax + "km/h");
      };
      //监听地图缩放
      clickEventListenerZoomend = map.on('zoomend', function () {
        var southwest = map.getBounds().getSouthWest();//获取西南角坐标
        var northeast = map.getBounds().getNorthEast();//获取东北角坐标
        var possa = southwest.lat;//纬度（小）
        var possn = southwest.lng;
        var posna = northeast.lat;
        var posnn = northeast.lng;
        paths = new AMap.Bounds(
            [possn, possa], //西南角坐标
            [posnn, posna]//东北角坐标
        );
      });
      lmapHeight = $("#MapContainer").height();
      Math.formatFloat = function (f, digit) {
        var m = Math.pow(10, digit);
        return parseInt(f * m, 10) / m;
      };
      setting = {
        async: {
          url: trackPlayback.getTreeUrl,
          type: "post",
          enable: true,
          autoParam: ["id"],
          dataType: "json",
          otherParam: {"type": "single"},
          dataFilter: trackPlayback.ajaxDataFilter
        },
        check: {
          enable: true,
          chkStyle: "radio"
        },
        view: {
          dblClickExpand: false,
          nameIsHTML: true,
          countClass: "group-number-statistics"
        },
        data: {
          simpleData: {
            enable: true
          }
        },
        callback: {
          beforeCheck: trackPlayback.zTreeBeforeCheck,
          onCheck: trackPlayback.onCheck,
          beforeClick: trackPlayback.zTreeBeforeClick,
          onAsyncSuccess: trackPlayback.zTreeOnAsyncSuccess,
          onClick: trackPlayback.zTreeOnClick,
          onExpand: trackPlayback.zTreeOnExpand,
          beforeAsync: trackPlayback.zTreeBeforeAsync,
          onNodeCreated: trackPlayback.zTreeOnNodeCreated,
        }
      };
      $.fn.zTree.init($("#treeDemo"), setting, null);
      ScrollBar = {
        value: 50,
        maxValue: 40000,
        step: 1,
        Initialize: function () {
          if (this.value > this.maxValue) {
            layer.msg(trackScrollBarMax, {move: false});
            return;
          }
          this.GetValue();
          var InitTrack = 20000 / (this.maxValue - 50) * 157;
          $("#scroll_Track").css("width", InitTrack + 2 + "px");
          $("#scroll_Thumb").css("margin-left", InitTrack + "px");
          this.Value();
        },
        Value: function () {
          if (flagOne) {
            speed = 20000;
            flagOne = false;
          }
          ;
          var valite = false;
          var currentValue;
          $("#scroll_Thumb").mousedown(function () {
            valite = true;
            $(document.body).mousemove(function (event) {
              dragFlag = false;
              if (valite == false) return;
              currentValue = Math.round(event.clientX) - $("#Demo").offset().left;
              if (currentValue <= 0) {
                currentValue = 0;
                ScrollBar.value = 50;
              }
              ;
              $("#scroll_Thumb").css("margin-left", currentValue + "px");
              $("#scroll_Track").css("width", currentValue + 2 + "px");
              if ((currentValue + 15) >= $("#scrollBar").width()) {
                $("#scroll_Thumb").css("margin-left", $("#scrollBar").width() - 10 + "px");
                $("#scroll_Track").css("width", $("#scrollBar").width() + 2 + "px");
                ScrollBar.value = ScrollBar.maxValue;
              } else if (currentValue <= 0) {
                $("#scroll_Thumb").css("margin-left", "0px");
                $("#scroll_Track").css("width", "0px");
              } else {
                ScrollBar.value = Math.round(39950 * (currentValue / $("#scrollBar").width()));
              }
            });
          });
          $(document.body).mouseup(function () {
            if (flagTwo || dragFlag) {
              speed = 20000;
              flagTwo = false;
            } else {
              speed = ScrollBar.value;
            }
            ;
            valite = false;
          });
        },
        GetValue: function () {
          this.currentX = 0
        }
      };
      ProgressBar = {
        maxValue: 100,
        value: 0,
        SetValue: function (aValue) {
          this.value = aValue;
          if (this.value >= this.maxValue) this.value = this.maxValue;
          if (this.value <= 0) this.value = 0;
          var mWidth = this.value / this.maxValue * $("#progressBar").width() + "px";
          $("#progressBar_Track").css("width", mWidth);
        }
      };
      sWidth = $(window).width();
      //监听浏览器窗口大小变化
      if (sWidth < 1200) {
        $("body").css("overflow", "auto");
        if (sWidth <= 414) {
          $(".sidebar").removeClass("sidebar-toggle");
          $(".main-content-wrapper").removeClass("main-content-toggle-left");
        }
      } else {
        $("body").css("overflow", "hidden");
      }
      $("[data-toggle='tooltip']").tooltip();
      //创建地图围栏相关集合
      fenceIdList = new trackPlayback.mapVehicle();
      AdministrativeRegionsList = new trackPlayback.mapVehicle();
      travelLineList = new trackPlayback.mapVehicle();
      setTimeout(function () {
        $(".realTimeCanArea").show()
      }, 200);
    },
    clickEventListenerDragend: function () {
      var southwest = map.getBounds().getSouthWest();//获取西南角坐标
      var northeast = map.getBounds().getNorthEast();//获取东北角坐标
      var possa = southwest.lat;//纬度（小）
      var possn = southwest.lng;
      var posna = northeast.lat;
      var posnn = northeast.lng;
      paths = new AMap.Bounds(
          [possn, possa], //西南角坐标
          [posnn, posna]//东北角坐标
      );
    },
    //数据列表及地图之间拖动
    mouseMove: function (e) {
      if (els - e.clientY > 0) {
        var y = els - e.clientY;
        var newHeight = mapHeight - y;
        if (newHeight <= 0) {
          newHeight = 0;
        }
        $("#MapContainer").css({
          "height": newHeight + "px"
        });
        if (newHeight == 0) {
          return false;
        }
        ;
        $(".trackPlaybackTable .dataTables_scrollBody").css({
          "height": (tableHeight + y) + "px"
        });
        var searchTop = 338 - y;
        if (searchTop <= 175) {
          $("#realTimeCanArea").css("top", "175px");
        } else {
          $("#realTimeCanArea").css("top", searchTop + "px");
        }
      } else {
        var dy = e.clientY - els;
        var newoffsetTop = $("#myTab").offset().top;
        var scrollBodyHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
        if (scrollBodyHeight == 0) {
          return false;
        }
        if (newoffsetTop <= (wHeight - myTabHeight)) {
          var newHeight = mapHeight + dy;
          $("#MapContainer").css({
            "height": newHeight + "px"
          });
          $(".trackPlaybackTable .dataTables_scrollBody").css({
            "height": (tableHeight - dy) + "px"
          });
        }

      }
      e.stopPropagation();
    },
    mouseUp: function () {
      dragTableHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
      $(document).unbind("mousemove", trackPlayback.mouseMove).unbind("mouseup", trackPlayback.mouseUp);
    },
    //显示隐藏导航按钮同时绑定宽度
    toggleBtn: function () {
      if ($(".sidebar").hasClass("sidebar-toggle")) {
        if ($("#content-left").is(":hidden")) {
          $("#content-right").css("width", "100%");
        } else {
          $("#content-right").css("width", 100 - newwidth + "%");
          $("#content-left").css("width", newwidth + "%");
        }
      } else {
        if ($("#content-left").is(":hidden")) {
          $("#content-right").css("width", "100%");
        } else {
          $("#content-right").css("width", (100 - newwidth - 2) + "%");
          $("#content-left").css("width", (newwidth + 2) + "%");
        }
        ;
      }
    },
    //页面(地图，卫星，实时路况)点击事件
    mapBtnActive: function () {
      $("#realTimeBtn .mapBtn").removeClass("map-active");
      $(this).addClass("map-active");
    },
    //实时路况切换
    realTimeRC: function () {
      if (isTrafficDisplay) {
        realTimeTraffic.show();
        $("#realTimeRC").addClass("map-active");
        $("#realTimeRCLab").addClass('preBlue');
        isTrafficDisplay = false;
        if(googleMapLayer){
          googleMapLayer.setMap(null);
        }
        $("#googleMap").attr("checked", false);
        $("#googleMapLab").removeClass("preBlue");
      } else {
        realTimeTraffic.hide();
        $("#realTimeRC").removeClass("map-active");
        $("#realTimeRCLab").removeClass('preBlue');
        isTrafficDisplay = true;
      }
    },
    //卫星地图及3D地图切换
    satelliteMapSwitching: function () {
      if (isMapThreeDFlag) {
        $("#setMap").addClass("map-active");
        $("#defaultMapLab").addClass('preBlue');
        satellLayer.show();
        buildings.setMap(null);
        isMapThreeDFlag = false;
        if(googleMapLayer){
          googleMapLayer.setMap(null);
        }
        $("#googleMap").attr("checked", false);
        $("#googleMapLab").removeClass("preBlue");
      } else {
        $("#setMap").removeClass("map-active");
        $("#defaultMapLab").removeClass('preBlue');
        buildings.setMap(map);
        satellLayer.hide();
        isMapThreeDFlag = true;
      }
    },
    //GOOGLE地图
    showGoogleMapLayers: function () {
      if ($("#googleMap").attr("checked")) {
        googleMapLayer.setMap(null);
        $("#googleMap").attr("checked", false);
        $("#googleMapLab").removeClass("preBlue");
      } else {
        googleMapLayer = new AMap.TileLayer({
          tileUrl: 'http://mt{1,2,3,0}.google.cn/vt/lyrs=m@142&hl=zh-CN&gl=cn&x=[x]&y=[y]&z=[z]&s=Galil', // 图块取图地址
          zIndex: 100 //设置Google层级与高德相同  避免高德路况及卫星被Google图层覆盖
        });
        googleMapLayer.setMap(map);
        $("#googleMap").attr("checked", true);
        $("#googleMapLab").addClass("preBlue");

        //取消路况与卫星选中状态
        $("#realTimeRC").attr("checked", false);
        $("#realTimeRCLab").removeClass("preBlue");
        realTimeTraffic.hide();
        isTrafficDisplay=true;
        isMapThreeDFlag=true;
        $("#setMap").attr("checked", false);
        $("#defaultMapLab").removeClass("preBlue");
        satellLayer.hide();
        buildings.setMap(map);
      }
    },

    //轨迹 地图处理
    trackMap: function () {
      var laglatObjct = {'lineArr': lineArr};
      $.ajax({
        type: "POST",
        url: "/clbs/v/monitoring/exportKMLLineArr",
        dataType: "json",
        async: false,
        data: laglatObjct,
        traditional: true,
        timeout: 30000
      })
      if (lineArr.length >= 1) {
        var icon = "../../resources/img/vehicle.png";
        if (objType == "people") {
          icon = "../../resources/img/123.png";
        } else if (objType == "thing") {
          icon = "../../resources/img/thing.png";
        } else {
          icon = "../../resources/img/vehicle.png";
        }
        if (icos != null && icos != '') {
          icon = "../../resources/img/vico/" + icos;
        }

        marker = new AMap.Marker({
          map: map,
          position: lineArr[0],//基点位置
          icon: icon, //marker图标，直接传递地址url
          offset: new AMap.Pixel(-26, -13), //相对于基点的位置
          zIndex: 99999,
          autoRotation: true
        });
        var anglepeople = Number(angleList[0]) + 270;
        marker.setAngle(anglepeople);
        var polyline = new AMap.Polyline({
          map: map,
          path: lineArr,
          strokeColor: "#3366ff", //线颜色
          strokeOpacity: 0.9, //线透明度
          strokeWeight: 6, //线宽
          strokeStyle: "solid", //线样式
          showDir: true
        });

        if (standbyType == "standby") {
          polyline.hide();
          $('#playIcon').hide();
          $("#standyHide").css("padding", "0px")
        } else {
          $('#playIcon').show();
          $("#standyHide").css("padding-right", "10px")
        }
        markerMovingControl = new MarkerMovingControl(map, marker, lineArr);
        //创建移动控件
        new AMap.Marker({
          map: map,
          position: lineArr[0],
          offset: new AMap.Pixel(-16, -43), //相对于基点的位置
          icon: new AMap.Icon({
            size: new AMap.Size(40, 40), //图标大小
            image: "../../resources/img/start.svg",
            imageOffset: new AMap.Pixel(0, 0)
          })
        });
        new AMap.Marker({
          map: map,
          position: lineArr[lineArr.length - 1],
          offset: new AMap.Pixel(-16, -43), //相对于基点的位置
          icon: new AMap.Icon({
            size: new AMap.Size(40, 40), //图标大小
            image: "../../resources/img/end.svg",
            imageOffset: new AMap.Pixel(0, 0)
          })
        });
        AMap.event.addListener(marker, 'click', function () {
          var arr = [];
          if (worldType == "5") {
            var speed = trackPlayback.fiterNumber(tableSet[nextIndexs - 1][8]);
            arr.push("定位时间：" + tableSet[nextIndexs - 1][2]);
            arr.push("监控对象：" + tableSet[nextIndexs - 1][1]);
            arr.push("所属分组：" + tableSet[nextIndexs - 1][3]);
            arr.push("终端号：" + tableSet[nextIndexs - 1][4]);
            arr.push("SIM卡号：" + tableSet[nextIndexs - 1][5]);
            arr.push("电池电压：" + tableSet[nextIndexs - 1][6]);
            arr.push("信号强度：" + tableSet[nextIndexs - 1][7]);
            arr.push("速度(km/h)：" + speed);
            arr.push("海拔：" + tableSet[nextIndexs - 1][9]);
            arr.push("方向：" + tableSet[nextIndexs - 1][10]);
            arr.push("经度：" + tableSet[nextIndexs - 1][12]);
            arr.push("纬度：" + tableSet[nextIndexs - 1][13]);
            arr.push('<a href="/clbs/v/monitoring/exportKML"   >导出谷歌轨迹</a>');
          } else {
            if (objectType == "vehicle") { // 车
              arr.push("监控对象：" + contentTrackPlayback[nextIndexs - 1][0]);
              arr.push("车牌颜色：" + contentTrackPlayback[nextIndexs - 1][1]);
            } else if (objectType == "thing") { // 物品
              arr.push("物品编号：" + contentTrackPlayback[nextIndexs - 1][0]);
            }
            var speed = trackPlayback.fiterNumber(contentTrackPlayback[nextIndexs - 1][8]);
            arr.push("定位时间：" + contentTrackPlayback[nextIndexs - 1][9]);
            arr.push("终端号：" + contentTrackPlayback[nextIndexs - 1][2]);
            arr.push("SIM卡号：" + contentTrackPlayback[nextIndexs - 1][3]);
            arr.push("所属分组：" + contentTrackPlayback[nextIndexs - 1][4]);
            arr.push("经度：" + contentTrackPlayback[nextIndexs - 1][5]);
            arr.push("纬度：" + contentTrackPlayback[nextIndexs - 1][6]);
            arr.push("高程：" + contentTrackPlayback[nextIndexs - 1][7]);
            arr.push("速度(km/h)：" + speed);
            arr.push('<a href="/clbs/v/monitoring/exportKML"   >导出谷歌轨迹</a>');
            arr.push('<a type="button" id="addFence" onclick="trackPlayback.showAddFencePage()" style="cursor:pointer;display:inline-block;margin: 8px 0px 0px 0px;">轨迹生成路线</a>');
          }
          content = arr;
          infoWindow = new AMap.InfoWindow({
            content: content.join("<br/>"),
            offset: new AMap.Pixel(-20, -13),
            closeWhenClickMap: true
          });
          infoWindow.open(map, marker.getPosition());
        });
        var southwest = map.getBounds().getSouthWest();//获取西南角坐标
        var northeast = map.getBounds().getNorthEast();//获取东北角坐标
        var possa = southwest.lat;//纬度（小）
        var possn = southwest.lng;
        var posna = northeast.lat;
        var posnn = northeast.lng;
        paths = new AMap.Bounds(
            [possn, possa], //西南角坐标
            [posnn, posna]//东北角坐标
        );
      }
      var stopPointInfoWindow;
      for (var i = 0; i < timestop.length; i++) {
        marker2 = new AMap.Marker({
          position: [longtitudestop[i], latitudestop[i]],
          map: map,
          offset: new AMap.Pixel(-16, -13), //相对于基点的位置
          icon: new AMap.Icon({
            size: new AMap.Size(40, 40), //图标大小
            image: "../../resources/img/stop.svg",
            imageOffset: new AMap.Pixel(0, 0)
          })
        });
        var theTime = parseInt(timestop[i] / 1000);// 秒
        var theTime1 = 0;// 分
        var theTime2 = 0;// 小时
        if (theTime > 60) {
          theTime1 = parseInt(theTime / 60);
          theTime = parseInt(theTime % 60);
          if (theTime1 > 60) {
            theTime2 = parseInt(theTime1 / 60);
            theTime1 = parseInt(theTime1 % 60);
          }
        }
        var result = "" + parseInt(theTime) + "秒";
        if (theTime1 > 0) {
          result = "" + parseInt(theTime1) + "分" + result;
        }
        if (theTime2 > 0) {
          result = "" + parseInt(theTime2) + "小时" + result;
        }
        var arrstop = [];
        arrstop.push("停车点:" + i);
        arrstop.push("停车时间:" + result);
        arrstop.push("开始时间:" + startTimestop[i]);
        arrstop.push("结束时间:" + endTimestop[i]);
        marker2.content = arrstop.join("<br/>");
        marker2.on('click', trackPlayback.markerClick);
        marker2.setMap(map);
        markerStopAnimation.push(marker2);
      }
      map.setFitView();
      //清除围栏集合及地图显示
      trackPlayback.delFenceListAndMapClear();
    },
    //停车点
    markerStop: function (index) {
      if (markerStopFlag) {
        markerStops.setMap(null);
      }
      ;
      markerStops = new AMap.Marker({
        position: [(longtitudeStop2[index - 1]), (latitudeStop2[index - 1])],
        draggable: true,
        cursor: 'move',
        icon: new AMap.Icon({
          size: new AMap.Size(40, 40), //图标大小
          image: "../../resources/img/stop.svg",
          imageOffset: new AMap.Pixel(0, 0)
        })
      });
      markerStops.setMap(map);
      markerStops.setAnimation('AMAP_ANIMATION_BOUNCE');
      map.setCenter(markerStops.getPosition());
      markerStopFlag = true;
    },
    //停车点标注点击
    markerClick: function (e) {
      stopPointInfoWindow.setContent(e.target.content);
      stopPointInfoWindow.open(map, e.target.getPosition());
    },
    //将轨迹保存为围栏模态框显示
    showAddFencePage: function () {
      setTimeout(function () {
        $("#addFencePage").modal("show");
      }, 200);
    },
    //导出谷歌轨迹
    exportKML: function () {
      var laglatObjct = {'lineArr': lineArr};
      address_submit("POST", '/clbs/v/monitoring/exportKML', "json", false, laglatObjct, true, trackPlayback.getExportKML);
    },
    getExportKML: function () {
      layer.msg(publicExportSuccess);
    },
    //编写事件响应函数
    startAnimation: function () {
      open = 1;
      isSearch = true;
      trackPlayback.againSearchLocation();
      goDamoIndex = 0;
      ProgressBar.SetValue(0);
      $("#playIcon").attr("class", "resultIcon playIcon");
      var southwest = map.getBounds().getSouthWest();//获取西南角坐标
      var northeast = map.getBounds().getNorthEast();//获取东北角坐标
      var possa = southwest.lat;//纬度（小）
      var possn = southwest.lng;
      var posna = northeast.lat;
      var posnn = northeast.lng;
      paths = new AMap.Bounds(
          [possn, possa], //西南角坐标
          [posnn, posna]//东北角坐标
      );
      selIndex = 0;
      trIndex = 0;
      nextIndexs = 1;
      $("#allMileage").text("0km");
      $('#maxSpeend').text('0km/h');
      map.clearInfoWindow();
      if (worldType == "5") {
        $("#peopleGPSData .dataTables_scrollBody").scrollTop(0);
        $("#gpsTable4 tbody tr").removeClass("tableSelected");
      } else {
        $("#GPSData .dataTables_scrollBody").scrollTop(0);
        $("#gpsTable tbody tr").removeClass("tableSelected");
      }
      //重置播放按钮
      $("#playIcon").attr({"data-toggle": "tooltip", "data-placement": "top", "data-original-title": "播放"});
      if (markerMovingControl != undefined) {
        markerMovingControl.restart();
      }
    },
    //前进
    FFAnimation: function () {
      flagBack = false;
      advance_retreat = true;
      map.clearInfoWindow();
      markerMovingControl.FF();
    },
    //后退
    retreatAnimation: function () {
      flagBack = true;
      advance_retreat = true;
      map.clearInfoWindow();
      if (nextIndexs <= 1) {
        layer.msg(trackFirstPost);
      } else {
        markerMovingControl.retreat();
      }
    },
    //播放和停止
    clears: function () {
      marker, lineArr = [], paths;
      markerMovingControl;
      longtitudestop = [];
      latitudestop = [];
      timestop = [];
      startTimestop = [];
      endTimestop = [];
      latitudeStop2 = [];
      longtitudeStop2 = [];
      markerStopAnimation = [];
      markerAlarmList = [];
      selIndex = 0;
      trIndex = 0;
      listIndex = 0;
      flagBackGo = false;
      nextIndexs = 1;
      open = 1;
      flagBack = false;
      tableSet = [];
      tableSetStop = [];
      tableSetStopGroup = [];
      tableSetstops = [];
      tableSetCopy = [];
      alarmTableSet = [];
      alarmTableSetCopy = [];
      alarmIndex = 1;
      tableIndex = 1;
      stoptableIndex = 1;
      advance_retreat = false;
      speedM = [];
      timeM = [];
      mileageM = [];
      mileageMax = 0;
      speedMax = 0;
      timeMax = 0;
    },
    // 封装map集合
    mapVehicle: function () {
      this.elements = new Array();
      //获取MAP元素个数
      this.size = function () {
        return this.elements.length;
      };
      //判断MAP是否为空
      this.isEmpty = function () {
        return (this.elements.length < 1);
      };
      //删除MAP所有元素
      this.clear = function () {
        this.elements = new Array();
      };
      //向MAP中增加元素（key, value)
      this.put = function (_key, _value) {
        this.elements.push({
          key: _key,
          value: _value
        });
      };
      //删除指定KEY的元素，成功返回True，失败返回False
      this.remove = function (_key) {
        var bln = false;
        try {
          for (var i = 0, len = this.elements.length; i < len; i++) {
            if (this.elements[i].key == _key) {
              this.elements.splice(i, 1);
              return true;
            }
          }
        } catch (e) {
          bln = false;
        }
        return bln;
      };
      //获取指定KEY的元素值VALUE，失败返回NULL
      this.get = function (_key) {
        try {
          for (var i = 0, len = this.elements.length; i < len; i++) {
            if (this.elements[i].key == _key) {
              return this.elements[i].value;
            }
          }
        } catch (e) {
          return null;
        }
      };
      //获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL
      this.element = function (_index) {
        if (_index < 0 || _index >= this.elements.length) {
          return null;
        }
        return this.elements[_index];
      };
      //判断MAP中是否含有指定KEY的元素
      this.containsKey = function (_key) {
        var bln = false;
        try {
          for (var i = 0, len = this.elements.length; i < len; i++) {
            if (this.elements[i].key == _key) {
              bln = true;
            }
          }
        } catch (e) {
          bln = false;
        }
        return bln;
      };
      //判断MAP中是否含有指定VALUE的元素
      this.containsValue = function (_value) {
        var bln = false;
        try {
          for (var i = 0, len = this.elements.length; i < len; i++) {
            if (this.elements[i].value == _value) {
              bln = true;
            }
          }
        } catch (e) {
          bln = false;
        }
        return bln;
      };
      //获取MAP中所有VALUE的数组（ARRAY）
      this.values = function () {
        var arr = new Array();
        for (var i = 0, len = this.elements.length; i < len; i++) {
          arr.push(this.elements[i].value);
        }
        return arr;
      };
      //获取MAP中所有KEY的数组（ARRAY）
      this.keys = function () {
        var arr = new Array();
        for (var i = 0, len = this.elements.length; i < len; i++) {
          arr.push(this.elements[i].key);
        }
        return arr;
      };
    },
    stopMove: function () {
      markerMovingControl.stop();
    },
    //轨迹播放相关
    continueAnimation: function () {
      if ($("#playIcon").hasClass("playIcon")) {
        if (playState) {
          isSearch = false;
          $("#playIcon").attr("class", "resultIcon suspendedIcon");
          markerMovingControl.move();
          open = 0;
          map.clearInfoWindow();
          $("#playIcon").removeAttr("data-original-title data-placement data-toggle");
          $("#playIcon").attr({
            "data-toggle": "tooltip",
            "data-placement": "top",
            "data-original-title": "暂停"
          });
        } else {
          layer.msg(trackDataNull, {move: false});
        }
        ;
      } else {
        isSearch = true;
        trackPlayback.againSearchLocation();
        $("#playIcon").attr("class", "resultIcon playIcon");
        $("#playIcon").removeAttr("data-original-title data-placement data-toggle");
        $("#playIcon").attr({"data-toggle": "tooltip", "data-placement": "top", "data-original-title": "播放"});
        markerMovingControl.stop();
        open = 1;
        var arr = [];
        if (worldType == "5") {
          var speed = trackPlayback.fiterNumber(tableSet[nextIndexs - 1][8]);
          arr.push("定位时间：" + tableSet[nextIndexs - 1][2]);
          arr.push("监控对象：" + tableSet[nextIndexs - 1][1]);
          arr.push("所属分组：" + tableSet[nextIndexs - 1][3]);
          arr.push("终端号：" + tableSet[nextIndexs - 1][4]);
          arr.push("SIM卡号：" + tableSet[nextIndexs - 1][5]);
          arr.push("电池电压：" + tableSet[nextIndexs - 1][6]);
          arr.push("信号强度：" + tableSet[nextIndexs - 1][7]);
          arr.push("速度(km/h)：" + speed);
          arr.push("海拔：" + tableSet[nextIndexs - 1][9]);
          arr.push("方向：" + tableSet[nextIndexs - 1][10]);
          arr.push("经度：" + tableSet[nextIndexs - 1][12]);
          arr.push("纬度：" + tableSet[nextIndexs - 1][13]);
          arr.push('<a href="/clbs/v/monitoring/exportKML"   >导出谷歌轨迹</a>');
        } else {
          var speed = trackPlayback.fiterNumber(contentTrackPlayback[nextIndexs - 1][8]);
          arr.push("定位时间：" + contentTrackPlayback[nextIndexs - 1][9]);
          arr.push("监控对象：" + contentTrackPlayback[nextIndexs - 1][0]);
          arr.push("车牌颜色：" + contentTrackPlayback[nextIndexs - 1][1]);
          arr.push("终端号：" + contentTrackPlayback[nextIndexs - 1][2]);
          arr.push("SIM卡号：" + contentTrackPlayback[nextIndexs - 1][3]);
          arr.push("所属分组：" + contentTrackPlayback[nextIndexs - 1][4]);
          arr.push("经度：" + contentTrackPlayback[nextIndexs - 1][5]);
          arr.push("纬度：" + contentTrackPlayback[nextIndexs - 1][6]);
          arr.push("高程：" + contentTrackPlayback[nextIndexs - 1][7]);
          arr.push("速度(km/h)：" + speed);
          arr.push('<a href="/clbs/v/monitoring/exportKML"   >导出谷歌轨迹</a>');
          arr.push('<a type="button" id="addFence" onclick="trackPlayback.showAddFencePage()" style="cursor:pointer;display:inline-block;margin: 8px 0px 0px 0px;">轨迹生成路线</a>');
        }
        content = arr;
        infoWindow = new AMap.InfoWindow({
          content: content.join("<br/>"),
          offset: new AMap.Pixel(-20, -13),
          closeWhenClickMap: true
        });
        infoWindow.open(map, marker.getPosition());
      }
    },
    //日期转换
    UnixToDate: function (unixTime, isFull, timeZone) {
      if (typeof (timeZone) == 'number') {
        unixTime = parseInt(unixTime) + parseInt(timeZone) * 60 * 60;
      }
      var time = new Date(unixTime * 1000);
      var ymdhis = "";
      ymdhis += time.getUTCFullYear() + "-";
      ymdhis += (time.getMonth() + 1) + "-";
      ymdhis += time.getDate();
      if (isFull === true) {
        ymdhis += " " + time.getHours() + ":";
        ymdhis += time.getMinutes() + ":";
        ymdhis += time.getSeconds();
      }
      return ymdhis;
    },
    disable: function (flag) {
      if (flag == true) {
        $("#disable").attr("disabled", " disabled");
        disableFlag = false;
        return false;
      } else if (flag == false) {
        $("#disable").removeAttr("disabled");
        disableFlag = true;
        return true;
      }
      return disableFlag;

    },
    getSensorMessage: function (band) {
      var flog;
      var url = "/clbs/v/oilmassmgt/oilquantitystatistics/getSensorMessage";
      var data = {"band": band};
      json_ajax("POST", url, "json", false, data, function (data) {
        flog = data;
      });
      return flog;
    },
    getHistory: function (data) {
      isSearchPlayBackData = true;
      trackPlayback.startGetHistoryData(data);
    },
    // 开始获取历史数据
    startGetHistoryData: function (data) {
      setTimeout(function () {
        if (isLastAddressDataBack) {
          $("#gpsTable3>tbody").html("");
          trackPlayback.disable(true);
          trackPlayback.showHidePeopleOrVehicle();
          var todayM = data;//当日里程
          var vehicleId = $("#savePid").attr("value");
          var chooseDate = $("#timeInterval").val().split("--");
          var startTime = chooseDate[0];
          var endTime = chooseDate[1];
          $.ajax({
            type: "POST",
            url: "/clbs/v/monitoring/getHistoryData",
            data: {
              "vehicleId": vehicleId,
              "startTime": startTime,
              "endTime": endTime,
              "type": worldType
            },
            dataType: "json",
            async: true,
            beforeSend: function (XMLHttpRequest) {
              layer.load(2);
            },
            complete: function (XMLHttpRequest, textStatus) {
              layer.closeAll('loading');
            },
            success: function (data) {
              isLastAddressDataBack = false;
              isSearchPlayBackData = false;
              markerStopAnimation = [];
              msgArray = [];
              stopMsgArray = [];
              layer.closeAll('loading');
              tableIndex = 1;
              stoptableIndex = 1;
              stoptableIndexGroup = 1;
              alarmIndex = 1;
              if (data.success) {
                runTable = 0;
                runTableTime = [];
                stopTable = 0;
                stopTableTime = [];
                allStopPoints = [];
                warningTable = 0;
                warningTableTime = [];
                marking = 'run';
                isRunAddressLoad = false;
                isStopAddressLoad = false;
                isWarnAddressLoad = false;
                isSearch = true;
                isAllStopPoint = false;
                alarmTableSet = [];
                tableSet = [];
                alarmTableSetCopy = [];
                tableSetCopy = [];
                contentTrackPlayback = [];
                var latitude;
                var longtitude;
                // 解压缩数据
                var lastposition;
                var positionalData = ungzip(data.msg);
                var positionals = $.parseJSON(positionalData);
                group = positionals.groups == undefined ? '未分组' : positionals.groups;
                var stop = positionals.stops; // 停止点
                if (worldType == "5") { // 北斗协议
                  $runTableId = $('#gpsTable4');
                  $stopTableId = $('#gpsTable5');
                  for (var j = 0; j < stop.length; j++) {
                    if (stop[j].stopTime > 300000 && stop[j].bdtdPosition.latitude != 0 && stop[j].bdtdPosition.latitude != undefined) {
                      if (j == 0) {
                        var lasttime = "-";
                      } else {
                        var lasttime = trackPlayback.changedataunix(stop[j].startTime) - trackPlayback.changedataunix(stop[j - 1].startTime);
                        var lasttime = trackPlayback.changdatainfo(lasttime);
                      }
                      var bdtdPosition = stop[j].bdtdPosition;//停车点
                      latitude = bdtdPosition.latitude;
                      longtitude = bdtdPosition.longtitude;
                      timestop.push(stop[j].stopTime);//停车时间
                      longtitudestop.push(longtitude);
                      latitudestop.push(latitude);
                      startTimestop.push(stop[j].startTime);
                      endTimestop.push(stop[j].endTime);
                      var stopangle = bdtdPosition.bearing;
                      var direction = trackPlayback.toDirectionStr(stopangle);
                      stopTableTime.push([bdtdPosition.latitude, bdtdPosition.longtitude, bdtdPosition.vtime, bdtdPosition.peopleId, 'people']);
                      var bdtdStopdirection = trackPlayback.toDirectionStr(bdtdPosition.altitude === undefined ? "" : bdtdPosition.altitude);
                      setstopGroup = [0, bdtdPosition.plateNumber, stop[j].startTime, lasttime, group, bdtdPosition.deviceNumber, bdtdPosition.sIMCard, bdtdPosition.batteryVoltage, bdtdPosition.signalStrength, "", "", bdtdStopdirection,
                        bdtdPosition.protocolType === "T3" ? "否" : "是", bdtdPosition.longtitude, bdtdPosition.latitude, bdtdPosition.formattedAddress === undefined ? "点击获取位置信息" : bdtdPosition.formattedAddress];
                      setstopGroup[0] = stoptableIndexGroup++;
                      tableSetStopGroup.push(setstopGroup);
                    }
                  }
                  trackPlayback.getTable('#gpsTable5', tableSetStopGroup);
                } else {
                  flogKey = trackPlayback.getSensorMessage(vehicleId);
                  $runTableId = $('#gpsTable');
                  $stopTableId = $('#gpsTable2');
                  var k = 1;
                  for (var j = 0; j < stop.length; j++) {
                    if (stop[j].stopTime > 300000 && stop[j].positional.latitude != 0 && stop[j].positional.latitude != undefined) {
                      //添加间隔时间
                      if (k == 1) {
                        var lastvtime = "-";
                        lastposition = stop[j];
                        k++;
                      } else {
                        var nowstartime = stop[j].startTime;
                        var laststartime = lastposition.startTime;
                        var lastvtimeunix = trackPlayback.changedataunix(nowstartime) - trackPlayback.changedataunix(laststartime);
                        var lastposition = stop[j];
                        var lastvtime = trackPlayback.changdatainfo(lastvtimeunix);
                        k++;
                      }

                      var positional = stop[j].positional;//停车点
                      latitude = positional.latitude;
                      longtitude = positional.longtitude;
                      timestop.push(stop[j].stopTime);//停车时间
                      longtitudestop.push(longtitude);
                      latitudestop.push(latitude);
                      startTimestop.push(stop[j].startTime);
                      endTimestop.push(stop[j].endTime);
                      if (positional.latitude == 0 && positional.longtitude == 0) {
                        stopStatus = '未定位';
                      } else {
                        stopStatus = '停止';
                      }

                      var stopacc = positional.status & 1;

                      stopangle = positional.angle;
                      stopdirection = '';
                      stopdirection = trackPlayback.toDirectionStr(stopangle);
                      var stopsatelliteNumber;
                      /*if (todayM == 0.0) {
                                                 stopsatelliteNumber = 0;
                                            } else {*/
                      if (positional != undefined) {
                        stopsatelliteNumber = positional.satelliteNumber == undefined ? '0' : positional.satelliteNumber;
                        if (positional.satelliteNumber == undefined || positional.satelliteNumber == 0) {
                          stopsatelliteNumber = 0;
                        }
                      } else {
                        stopsatelliteNumber = 0;
                      }
                      /*}*/
                      var locationType = positional.locationType === undefined ? "" : positional.locationType;
                      var locateMode;
                      if (locationType == 1) {
                        locateMode = "卫星定位";
                      } else if (locationType == 2) {
                        locateMode = "LBS定位";
                        stopsatelliteNumber = "-";
                      } else if (locationType == 3) {
                        locateMode = "WiFi+LBS定位";
                        stopsatelliteNumber = "-";
                      } else {
                        locateMode = "-";
                      }
                      var miles;
                      if (flogKey != "true") {
                        miles = positional.gpsMile;
                      } else {
                        miles = positional.mileageTotal;
                      }
                      stopTableTime.push([positional.latitude, positional.longtitude, positional.vtime, positional.vehicleId, 'vehicle']);
                      setstopGroup = [
                        0,
                        positional.plateNumber,
                        stop[j].startTime,
                        lastvtime,
                        positionals.groups == undefined ? '未分组' : positionals.groups,
                        positional.deviceNumber,
                        positional.simCard == undefined ? "" : positional.simCard,
                        stopStatus,
                        stopacc == 0 ? "关" : "开",
                        stopdirection,
                        miles > 0 ? miles : "0",
                        locateMode,
                        stopsatelliteNumber,
                        positional.longtitude,
                        positional.latitude,
                        (positional.formattedAddress == undefined || positional.formattedAddress == '[]') ? "点击获取位置信息" : positional.formattedAddress
                      ];
                      setstopGroup[0] = stoptableIndexGroup++;
                      tableSetStopGroup.push(setstopGroup);
                    }
                  }
                  trackPlayback.getTable('#gpsTable2', tableSetStopGroup);
                }
                var msg = positionals.resultful; // 行驶点
                var len = msg.length;
                if (parseInt(len) > 0) {
                  $("#addFence").attr("disabled", false);
                } else {
                  $("#addFence").attr("disabled", true);
                }
                if (worldType == "5") {
                  var position;
                  index_lng_lat = 0;
                  var latitude2 = 0;
                  var longtitude2 = 0;
                  var msg_lng_lat = [];//存地理经纬度
                  for (var i = 0; i < len; i++) {
                    if (i == 0) {
                      var lasttime = "-";
                    } else {
                      var lasttime = msg[i].vtime - msg[i - 1].vtime;
                      var lasttime = trackPlayback.changdatainfo(lasttime);
                    }
                    position = msg[i];
                    listSpeed = position.speed;
                    latitude = position.latitude;//纬度
                    longtitude = position.longtitude;//经度
                    var timeTwo = trackPlayback.UnixToDate(position.vtime, true);
                    index_lng_lat++;
                    if (listSpeed != 0) {
                      if (latitude != 0 && longtitude != 0) {
                        //添加
                        lineArr.push([longtitude, latitude]);
                        speedM.push(position.speed === undefined ? 0 : position.speed);
                        timeM.push(timeTwo);
                        mileageM.push("0");
                        var stopangle = position.bearing;
                        var flag = 0;
                        if (flag == 0) {
                          angleType = stopangle;
                          flag = 1;
                        }
                        var stopdirection = '';
                        stopdirection = trackPlayback.toDirectionStr(stopangle);
                        var protocolType = position.protocolType;
                        runTableTime.push([latitude, longtitude, position.vtime, position.peopleId, 'people']);
                        var timeOte = trackPlayback.formatDate(timeTwo, "yyyy-MM-dd HH:mm:ss");
                        var pspeed = trackPlayback.fiterNumber(position.speed);
                        set = [0, position.monitorObject, timeOte, lasttime, position.groupName, position.userCode, position.sIMCard, position.batteryVoltage, position.signalStrength, pspeed, position.altitude, stopdirection, protocolType === "T3" ? "否" : "是", longtitude, latitude, position.formattedAddress === undefined ? "点击获取位置信息" : position.formattedAddress];
                        set[0] = tableIndex++;
                        tableSet.push(set);
                      }
                    }
                  }
                  var msgstop = positionals.stop;
                  var lenstop = msgstop.length;
                  var stop_lng_lat = [];
                  var stopIndex = 0;
                  stopValue_num = lenstop;
                  for (var i = 0; i < lenstop; i++) {
                    if (i == 0) {
                      var lasttime = "-";
                    } else {
                      var lasttime = msgstop[i].vtime - msgstop[i - 1].vtime;
                      var lasttime = trackPlayback.changdatainfo(lasttime);
                    }
                    var msgstops = msgstop[i];
                    latitudeStop2.push(msgstops.latitude);
                    longtitudeStop2.push(msgstops.longtitude);
                    stopangle = msgstops.bearing;
                    stopdirection = '';
                    stopdirection = trackPlayback.toDirectionStr(stopangle);
                    var protocolTypestop = msgstop[i].protocolType;
                    var timeTee = trackPlayback.UnixToDate(msgstops.vtime, true);
                    var timeTte = trackPlayback.formatDate(timeTee, "yyyy-MM-dd HH:mm:ss");
                    var msgSpeed = msgstops.speed;
                    msgSpeed = trackPlayback.fiterNumber(msgSpeed);
                    allStopPoints.push([msgstops.latitude, msgstops.longtitude, msgstops.vtime, msgstops.peopleId, 'people']);
                    setstop = [0, msgstops.plateNumber, timeTte, lasttime, group, msgstops.deviceNumber, msgstops.sIMCard, msgstops.batteryVoltage, msgstops.signalStrength, msgSpeed, msgstops.altitude, stopdirection, protocolTypestop === "T3" ? "否" : "是", msgstop[i].longtitude, msgstop[i].latitude, msgstop[i].formattedAddress === undefined ? "点击获取位置信息" : msgstop[i].formattedAddress];
                    setstop[0] = stoptableIndex++;
                    stopIndex++;
                    tableSetstops.push(setstop);
                  }
                  trackPlayback.getTable('#gpsTable4', tableSet);
                } else {
                  var position;
                  var set;
                  var setstop;
                  var acc;
                  var lineStatus;
                  var listSpeed;
                  var angle;
                  var direction = '';
                  var latitude2 = 0;
                  var longtitude2 = 0;
                  var alarmSet;
                  var groups = positionals.groups;
                  standbyType = positionals.type;
                  var msg_lng_lat = [];//存地理经纬度
                  index_lng_lat = 0;
                  if (len > 0) {
                    icos = msg[0].ico;
                  }
                  for (var i = 0; i < len; i++) {
                    position = msg[i];
                    latitude = position.latitude;//纬度
                    longtitude = position.longtitude;//经度
                    if (i == 0) {
                      var lastvtime = "-";
                    } else {
                      var lastvtime = msg[i].vtime - msg[i - 1].vtime;
                      lastvtime = trackPlayback.changdatainfo(lastvtime);
                    }
                    if (latitude != "0" && longtitude != "0") {
                      alarmSIM = position.simCard == undefined ? "" : position.simCard;
                      alarmTopic = position.deviceNumber;
                      vcolour = position.plateColor;
                      acc = position.status == undefined ? 0 : position.status;

                      if (acc.length == 32) {
                        acc = acc.substring(18, 19);
                      } else if (acc == 0) {
                        acc = 0;
                      } else {
                        acc = position.status & 1;
                      }
                      var miles;
                      var speeds;
                      if (flogKey != "true") {
                        miles = position.gpsMile;
                        speeds = position.speed;
                      } else {
                        miles = position.mileageTotal;
                        speeds = position.mileageSpeed
                      }
                      listSpeed = speeds;
                      listSpeed = trackPlayback.fiterNumber(listSpeed);
                      //超长待机
                      if (standbyType == "standby") {
                        var sPoints = [longtitude, latitude]
                        var standyMap = new AMap.Marker({
                          map: map,
                          position: sPoints,
                          offset: new AMap.Pixel(-10, -10), //相对于基点的位置
                          icon: new AMap.Icon({
                            size: new AMap.Size(40, 40), //图标大小
                            image: "../../resources/img/sectionMarker.png",
                            imageOffset: new AMap.Pixel(0, 0)
                          })
                        });
                      }
                      var timeTwo = trackPlayback.UnixToDate(position.vtime, true);
                      index_lng_lat++;
                      if (latitude != 0 && longtitude != 0) {
                        if (latitude != 0 && longtitude != 0) {
                          var pasla = Math.abs(parseFloat(latitude2) - parseFloat(latitude));
                          var paslo = Math.abs(parseFloat(longtitude2) - parseFloat(longtitude));
                          if (pasla < 0.000020 && paslo < 0.000020) {
                            latitude2 = latitude;
                            longtitude2 = longtitude;
                          } else {
                            latitude2 = latitude;
                            longtitude2 = longtitude;
                          }
                          ;
                          //添加
                          lineArr.push([longtitude, latitude]);//******************************************
                          speedM.push(speeds === undefined ? 0 : speeds);
                          timeM.push(timeTwo);

                          if (miles >= 0) {
                            mileageM.push(miles);
                          } else {
                            mileageM.push("0");
                          }
                        }
                        lineStatus = '行驶';
                      } else {
                        if (latitude == 0 && longtitude == 0) {
                          lineStatus = '未定位';
                        } else {
                          lineStatus = '停止';
                        }
                      }
                      angle = position.angle;
                      /* var flag = 0;
                                        if(flag == 0){
                                            angleType = angle;
                                            flag = 1;
                                        }*/
                      angleList.push(angle);
                      direction = '';
                      direction = trackPlayback.toDirectionStr(angle);
                      var alarmSign = position.alarm;
                      if (alarmSign != 0) {
                        var alarmStr = '';
                        if ((alarmSign & 0x01) != 0) {
                          alarmStr += "紧急报警,";
                        }
                        if ((alarmSign & 0x02) != 0) {
                          alarmStr += "超速报警,";
                        }
                        if ((alarmSign & 0x04) != 0) {
                          alarmStr += "疲劳驾驶,";
                        }
                        if ((alarmSign & 0x08) != 0) {
                          alarmStr += "危险预警,";
                        }
                        if ((alarmSign & 0x10) != 0) {
                          alarmStr += "GNSS模块发生故障,";
                        }
                        if ((alarmSign & 0x20) != 0) {
                          alarmStr += "GNSS天线未接或被剪断,";
                        }
                        if ((alarmSign & 0x40) != 0) {
                          alarmStr += "GNSS天线短路,";
                        }
                        if ((alarmSign & 0x80) != 0) {
                          alarmStr += "终端主电源欠压,";
                        }
                        if ((alarmSign & 0x100) != 0) {
                          alarmStr += "终端主电源掉电,";
                        }
                        if ((alarmSign & 0x200) != 0) {
                          alarmStr += "终端LCD或显示器故障,";
                        }
                        if ((alarmSign & 0x400) != 0) {
                          alarmStr += "TTS模块故障,";
                        }
                        if ((alarmSign & 0x800) != 0) {
                          alarmStr += "摄像头故障,";
                        }
                        if ((alarmSign & 0x1000) != 0) {
                          alarmStr += "道路运输证IC卡模块故障,";
                        }
                        if ((alarmSign & 0x2000) != 0) {
                          alarmStr += "超速预警,";
                        }
                        if ((alarmSign & 0x4000) != 0) {
                          alarmStr += "疲劳驾驶预警,";
                        }
                        if ((alarmSign & 0x40000) != 0) {
                          alarmStr += "当天累计驾驶超时,";
                        }
                        if ((alarmSign & 0x80000) != 0) {
                          alarmStr += "超时停车,";
                        }
                        if ((alarmSign & 0x100000) != 0) {
                          alarmStr += "进出区域,";
                        }
                        if ((alarmSign & 0x200000) != 0) {
                          alarmStr += "进出路线,";
                        }
                        if ((alarmSign & 0x400000) != 0) {
                          alarmStr += "路段行驶时间不足/过长,";
                        }
                        if ((alarmSign & 0x800000) != 0) {
                          alarmStr += "路线偏离报警,";
                        }
                        if ((alarmSign & 0x1000000) != 0) {
                          alarmStr += "车辆VSS故障,";
                        }
                        if ((alarmSign & 0x2000000) != 0) {
                          alarmStr += "车辆油量异常,";
                        }
                        if ((alarmSign & 0x4000000) != 0) {
                          alarmStr += "车辆被盗,";
                        }
                        if ((alarmSign & 0x8000000) != 0) {
                          alarmStr += "车辆非法点火,";
                        }
                        if ((alarmSign & 0x10000000) != 0) {
                          alarmStr += "车辆非法位移,";
                        }
                        if ((alarmSign & 0x20000000) != 0) {
                          alarmStr += "碰撞预警,";
                        }
                        if ((alarmSign & 0x40000000) != 0) {
                          alarmStr += "侧翻预警,";
                        }
                        if ((alarmSign & 0x80000000) != 0) {
                          alarmStr += "非法开门报警,";
                        }
                        if (alarmStr != '') {
                          alarmStr = alarmStr.substring(0, alarmStr.length - 1);
                        }
                        alarmSet = [alarmIndex, ""];
                        alarmIndex++;
                        alarmTableSet.push(alarmSet);
                      } else {
                        alarmTableSet.push(undefined);
                      }
                      var satelliteNumber = position.satelliteNumber == undefined ? '0' : position.satelliteNumber;
                      var locationType = position.locationType === undefined ? "" : position.locationType;
                      var locateMode;
                      if (locationType == 1) {
                        locateMode = "卫星定位";
                      } else if (locationType == 2) {
                        locateMode = "LBS定位";
                        satelliteNumber = "-";
                      } else if (locationType == 3) {
                        locateMode = "WiFi+LBS定位";
                        satelliteNumber = "-";
                      } else {
                        locateMode = "-";
                      }
                      var timeOte = trackPlayback.formatDate(timeTwo, "yyyy-MM-dd HH:mm:ss");
                      runTableTime.push([latitude, longtitude, position.vtime.toString(), position.vehicleId, 'vehicle']);
                      set = [0, position.plateNumber, timeOte, lastvtime, groups == undefined ? '未分组' : groups, position.deviceNumber, position.simCard == undefined ? "" : position.simCard, lineStatus, acc == 0 ? "关" : "开", listSpeed, direction, miles > 0 ? miles : "0",
                        locateMode, satelliteNumber, Number(longtitude).toFixed(6), Number(latitude).toFixed(6), (position.formattedAddress === undefined || position.formattedAddress == '[]') ? "点击获取位置信息" : position.formattedAddress];
                      var content = [];

                      content.push(position.plateNumber);
                      content.push(position.plateColor);
                      content.push(position.deviceNumber);
                      content.push(position.simCard == undefined ? "" : position.simCard);
                      content.push(groups == undefined ? '未分组' : groups);
                      content.push(longtitude);
                      content.push(latitude);
                      content.push(position.height === undefined ? "" : position.height);
                      content.push(listSpeed);
                      content.push(timeOte);
                      contentTrackPlayback.push(content);
                      if (lineStatus == '行驶') {
                        if (tableIndex == 1) {
                          set[3] = "-";
                        }
                        set[0] = tableIndex++;
                        tableSet.push(set);
                      }

                    }
                  }
                  if (todayM != 0.0) {
                    if (!isNaN((mileageM[mileageM.length - 1] - mileageM[0]))) {
                      var allMileage = (mileageM[mileageM.length - 1] - mileageM[0]).toFixed(1);
                      allMileage = trackPlayback.fiterNumber(allMileage);
                      $("#allMileage").text(allMileage + "km");
                    }
                    //行驶时间
                    var sta_str = timeM[0];
                    var end_str = timeM[timeM.length - 1];
                    var end_date;
                    var sra_date;
                    if (sta_str == undefined || end_str == undefined) {
                      end_date = 0;
                      sra_date = 0;
                    } else {
                      end_date = (new Date(end_str.replace(/-/g, "/"))).getTime();
                      sra_date = (new Date(sta_str.replace(/-/g, "/"))).getTime();
                    }
                    var num = (end_date - sra_date);
                    var theTime = parseInt(num / 1000);// 秒
                    var theTime1 = 0;// 分
                    var theTime2 = 0;// 小时
                    if (theTime > 60) {
                      theTime1 = parseInt(theTime / 60);
                      theTime = parseInt(theTime % 60);
                      if (theTime1 > 60) {
                        theTime2 = parseInt(theTime1 / 60);
                        theTime1 = parseInt(theTime1 % 60);
                      }
                    }
                    ;
                    var result = "" + parseInt(theTime) + "秒";
                    if (theTime1 > 0) {
                      result = "" + parseInt(theTime1) + "分" + result;
                    }
                    ;
                    if (theTime2 > 0) {
                      result = "" + parseInt(theTime2) + "小时" + result;
                    }
                    ;
                    timeMax = result;
                    $("#allTime").text(timeMax);
                    if (speedM.length > 0) {
                      var maxSpeed = Math.max.apply(Math, speedM).toFixed(2);
                      maxSpeed = trackPlayback.fiterNumber(maxSpeed);
                      $("#maxSpeend").text(maxSpeed + "km/h");
                    }
                    ;
                  }
                  var msgstop = positionals.stop;
                  var lenstop = msgstop.length;
                  var stop_lng_lat = [];
                  var stopIndex = 0;
                  stopValue_num = lenstop;
                  for (var i = 0; i < lenstop; i++) {

                    if (i == 0) {
                      var lasttime = "-";
                    } else {
                      var lasttime = msgstop[i].vtime - msgstop[i - 1].vtime;
                      var lasttime = trackPlayback.changdatainfo(lasttime);
                    }
                    var msgstops = msgstop[i];
                    var stopStatus;
                    var stopacc = msgstops.status & 1;
                    latitudeStop2.push(msgstops.latitude);
                    longtitudeStop2.push(msgstops.longtitude);
                    if (msgstops.latitude == 0 && msgstops.longtitude == 0) {
                      stopStatus = '未定位';
                    } else {
                      stopStatus = '停止';
                    }
                    stopangle = msgstops.angle;
                    stopdirection = '';
                    stopdirection = trackPlayback.toDirectionStr(stopangle);
                    if (todayM == 0.0) {
                      stopsatelliteNumber = 0;
                    } else {
                      if (msgstops != undefined) {
                        stopsatelliteNumber = msgstops.satelliteNumber;
                        if (msgstops.satelliteNumber == undefined || msgstops.satelliteNumber == 0) {
                          stopsatelliteNumber = 0;
                        }
                      } else {
                        stopsatelliteNumber = 0;
                      }
                    }
                    var stopLocationType = msgstops.locationType === undefined ? "" : msgstops.locationType;
                    var stopLocateMode;
                    if (stopLocationType == 1) {
                      stopLocateMode = "卫星定位";
                    } else if (stopLocationType == 2) {
                      stopLocateMode = "LBS定位";
                      stopsatelliteNumber = "-";
                    } else if (stopLocationType == 3) {
                      stopLocateMode = "WiFi+LBS定位";
                      stopsatelliteNumber = "-";
                    } else {
                      stopLocateMode = "-";
                    }
                    var timeTee = trackPlayback.UnixToDate(msgstops.vtime, true);
                    var timeTte = trackPlayback.formatDate(timeTee, "yyyy-MM-dd HH:mm:ss");
                    var milesMsgstops;
                    if (flogKey != "true") {
                      milesMsgstops = msgstops.gpsMile;
                    } else {
                      milesMsgstops = msgstops.mileageTotal;
                    }
                    allStopPoints.push([msgstops.latitude, msgstops.longtitude, msgstops.vtime, msgstops.vehicleId, 'vehicle']);
                    setstop = [
                      0,
                      msgstops.plateNumber,
                      timeTte,
                      lasttime,
                      groups == undefined ? '未分组' : groups,
                      msgstops.deviceNumber,
                      msgstops.simCard == undefined ? "" : msgstops.simCard,
                      stopStatus,
                      stopacc == 0 ? "关" : "开",
                      stopdirection,
                      milesMsgstops > 0 ? milesMsgstops : "0",
                      stopLocateMode,
                      stopsatelliteNumber,
                      msgstop[i].longtitude,
                      msgstop[i].latitude,
                      (msgstops.formattedAddress == undefined || msgstops.formattedAddress == '[]') ? "点击获取位置信息" : msgstops.formattedAddress
                    ];
                    setstop[0] = stoptableIndex++;
                    stopIndex++;
                    tableSetstops.push(setstop);
                  }
                  trackPlayback.getTable('#gpsTable', tableSet);
                }
              }
              //计算高度赋值
              $("#MapContainer").css({
                "height": (lmapHeight - 221) + "px"
              });
              //表头宽度设置
              var tabWidth = $("#myTab").width();
              var tabPercent = ((tabWidth - 17) / tabWidth) * 100;
              $(".dataTables_scrollHead").css("width", tabPercent + "%");
              //列表拖动
              $("#dragDIV").mousedown(function (e) {
                tableHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
                mapHeight = $("#MapContainer").height();
                els = e.clientY;
                $(document).bind("mousemove", trackPlayback.mouseMove).bind("mouseup", trackPlayback.mouseUp);
                e.stopPropagation();
              })
              //表点击操作得到经纬度
              $("#gpsTable tbody tr").bind("click", function () {
                carLng = $(this).children("td:nth-child(11)").text();
                carLat = $(this).children("td:nth-child(12)").text();
                var nowIndex = parseInt($(this).children("td:nth-child(1)").text());
                selIndex = nowIndex - 1;
                listIndex = nowIndex - 1;
                if (nowIndex >= 4) {
                  trIndex = nowIndex - 4;
                } else {
                  trIndex = 0;
                }
                btnFlag = true;
                markerMovingControl.skip();
              });
              $("#gpsTable4 tbody tr").bind("click", function () {
                carLng = $(this).children("td:nth-child(11)").text();
                carLat = $(this).children("td:nth-child(12)").text();
                var nowIndex = parseInt($(this).children("td:nth-child(1)").text());
                selIndex = nowIndex - 1;
                listIndex = nowIndex - 1;
                if (nowIndex >= 4) {
                  trIndex = nowIndex - 4;
                } else {
                  trIndex = 0;
                }
                btnFlag = true;
                markerMovingControl.skip();
              });
              $("#playCarListIcon").show();
              //伸缩
              $("#scalingBtn").unbind().bind("click", function () {
                if ($(this).hasClass("fa-chevron-down")) {
                  oldMHeight = $("#MapContainer").height();
                  oldTHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
                  $(this).attr("class", "fa  fa-chevron-up")
                  var mapHeight = windowHeight - headerHeight - titleHeight - demoHeight - 20;
                  $("#MapContainer").css({
                    "height": mapHeight + "px"
                  });
                  $(".trackPlaybackTable .dataTables_scrollBody").css({
                    "height": "0px"
                  });
                } else {
                  $(this).attr("class", "fa  fa-chevron-down");
                  $("#MapContainer").css({
                    "height": oldMHeight + "px"
                  });
                  $(".trackPlaybackTable .dataTables_scrollBody").css({
                    "height": oldTHeight + "px"
                  });
                }
              });
              trackPlayback.runDataSearch(0);
              trackPlayback.addressBindClick();
              trackPlayback.trackMap();
              trackPlayback.disable(false);
              // trackPlayback.alarmData();
              // wjk
              if ($('#chooseAlarmPoint').checked) {
                trackPlayback.alarmData();
              }
            }
          });
        } else {
          trackPlayback.startGetHistoryData(data);
        }
      }, 200);
    },
    //方向判断
    toDirectionStr: function (angle) {
      if ((angle >= 0 && angle <= 22.5) || (angle > 337.5 && angle <= 360)) {
        direction = '北';
      } else if (angle > 22.5 && angle <= 67.5) {
        direction = '东北';
      } else if (angle > 67.5 && angle <= 112.5) {
        direction = '东';
      } else if (angle > 112.5 && angle <= 157.5) {
        direction = '东南';
      } else if (angle > 157.5 && angle <= 202.5) {
        direction = '南';
      } else if (angle > 202.5 && angle <= 247.5) {
        direction = '西南';
      } else if (angle > 247.5 && angle <= 292.5) {
        direction = '西';
      } else if (angle > 292.5 && angle <= 337.5) {
        direction = '西北';
      } else {
        direction = '';
      }
      return direction;
    },
    //小数点位数过滤
    fiterNumber: function (data) {
      var data = data.toString();
      data = parseFloat(data);
      return data;
    },
    //日期格式化
    formatDate: function (date, format) {
      if (!date) return;
      var dateSo = date.split(" ");
      var dateSMM = (dateSo[0].split("-"))[1] < 10 ? "0" + (dateSo[0].split("-"))[1] : (dateSo[0].split("-"))[1];
      var dateSdd = (dateSo[0].split("-"))[2] < 10 ? "0" + (dateSo[0].split("-"))[2] : (dateSo[0].split("-"))[2];
      var dateSHH = (dateSo[1].split(":"))[0] < 10 ? "0" + (dateSo[1].split(":"))[0] : (dateSo[1].split(":"))[0];
      var dateSmm = (dateSo[1].split(":"))[1] < 10 ? "0" + (dateSo[1].split(":"))[1] : (dateSo[1].split(":"))[1];
      var dateSss = (dateSo[1].split(":"))[2] < 10 ? "0" + (dateSo[1].split(":"))[2] : (dateSo[1].split(":"))[2];
      return (dateSo[0].split("-"))[0] + "-" + dateSMM + "-" + dateSdd + " " + dateSHH + ":" + dateSmm + ":" + dateSss
    },
    //轨迹数据添加到日历
    getActiveDate: function (vehicleId, nowMonth, afterMonth) {
      var dataTime = nowMonth.split("-")[0] + nowMonth.split("-")[1];
      $.ajax({
        type: "POST",
        url: "/clbs/v/monitoring/getActiveDate",
        data: {
          "vehicleId": vehicleId,
          "nowMonth": nowMonth,
          "nextMonth": afterMonth,
          "type": worldType
        },
        dataType: "json",
        async: true,
        beforeSend: function () {
          layer.load(2);
        },
        success: function (data) {
          layer.closeAll('loading');
          timeArray = [];
          stopArray = [];
          peopleArray = [];
          thingArray = [];
          if (data.success) {
            //车的详细信息
            var msg = $.parseJSON(data.msg);
            var activeDate = msg.date;
            var mileage = msg.dailyMile;
            for (var i = 0; i < activeDate.length; i++) {
              var time = dataTime + (parseInt(activeDate[i] + 1) < 10 ? "0" + parseInt(activeDate[i] + 1) : parseInt(activeDate[i] + 1));
              var mileagei = trackPlayback.fiterNumber(mileage[i]);
              switch (msg.type) {
                case "0" : // 808 2011扩展
                case "1" : // 808 2013
                case "2" : // 移为
                case "3" : // 天禾
                case "6" : // KKS
                case "8" : // BSJ-A5
                  timeArray.push([time, time, mileagei]);
                  break;
                case "5" : // BDTD-SM
                  peopleArray.push([time, time, ""]);
                  break;
                case "9" : // ASO
                case "10" : // F3超长待机
                  cdWorldType = msg.type;
                  stopArray.push([time, time, mileagei]);
                  break;
              }
            }
          }
          if (objType == 'thing') {
            thingArray = timeArray.concat(peopleArray);
          }
          var zTreeDemoHeight = $("#treeDemo").height();
          var oldLength = $(".calendar3 tbody tr").length;
          $('.calendar3').html("");
          $('.calendar3').calendar({
            highlightRange: timeArray,
            stopHighlightRange: stopArray,
            peopleHighlightRange: peopleArray,
            thingHighlightRange: thingArray
          });
          var trBtnLength = $(".calendar3 tbody tr").length;
          if (trBtnLength > oldLength) {
            $("#treeDemo").css("height", (zTreeDemoHeight - 34) + "px");
          } else if (trBtnLength < oldLength) {
            $("#treeDemo").css("height", (zTreeDemoHeight + 54) + "px");
          }
          $('.calendar3 tbody td').each(function () {
            if ($(this).hasClass("widget-disabled")) {
              $(this).removeClass("widget-highlight").removeClass("widget-stopHighlight");
              $(this).children("span").children("span.mileageList").text("-");
            }
          })
          isFlag = false;
        }
      });
    },
    //查询
    trackDataQuery: function () {
      if (isSearch == false) {
        trackPlayback.continueAnimation();
      }
      stopDataFlag = true;
      Assembly = true;
      var carID = $("#citySel").val();
      if (carID == "" || carID == undefined) {
        layer.msg(vehicleNumberChoose, {move: false});
        return false;
      }
      ;
      var chooseDate = $("#timeInterval").val().split("--");
      var ssdate = chooseDate[0];
      var sstimestamp = new Date(ssdate).getTime();
      eedate = chooseDate[1];
      var eetimestamp = new Date(eedate).getTime();
      if (eetimestamp < sstimestamp) {
        layer.msg(trackDateError, {move: false});
        return false;
      } else if (eetimestamp - sstimestamp > 604799000 && worldType != "5") {
        layer.msg(trackVehicleDateError, {move: false});
        return false;
      } else if (eetimestamp - sstimestamp > 259199000 && worldType == "5") {
        layer.msg(trackPeopleDateError, {move: false});
        return false;
      }
      var sTime = parseInt(chooseDate[0].substring(0, 10).replace(/\-/g, ""));
      var eTime = parseInt(chooseDate[1].substring(0, 10).replace(/\-/g, ""));
      // if (worldType == "vehicle") {
      //增加超待设备数据查询对比
      /*if(cdWorldType == "standby"){此判断是否需要待观察，如不影响功能，建议去掉
                for(var i = 0; i < stopArray.length; i++){
                    if(parseInt(stopArray[i][0]) >= sTime && parseInt(stopArray[i][0]) <= eTime) {
                        hasData = true;
                        playState = true;
                    }
                }
            }else{
                for(var i = 0; i < timeArray.length; i++){
                    if(parseInt(timeArray[i][0]) >= sTime && parseInt(timeArray[i][0]) <= eTime) {
                        hasData = true;
                        playState = true;
                    }
                }
            }
            if(!hasData){
                layer.msg("该时间段无数据！", {move: false});
                hasData = false;
                playState = false;
                return false;
            };*/
      // } else {
      // standbyType = "";

      // }
      playState = true;
      trackPlayback.clears();
      layer.load(2);
      map.clearMap();
      trackPlayback.getHistory();
      setTimeout(function () {
        $("#realTimeCanArea").addClass("rtcaHidden");
      }, 500);
      //取消报警点勾选
      $("#chooseAlarmPoint").removeAttr("checked");
    },
    getTable: function (table, data, sy) {
      var dataHeight;
      if (sy !== undefined) {
        dataHeight = sy;
      } else {
        dataHeight = 221;
      }
      table = $(table).DataTable({
        "destroy": true,
        "dom": 'itprl',// 自定义显示项
        "scrollX": true,
        "scrollY": dataHeight,
        "data": data,
        "lengthChange": false,// 是否允许用户自定义显示数量
        "bPaginate": false, // 翻页功能
        "bFilter": false, // 列筛序功能
        "searching": false,// 本地搜索
        "ordering": false, // 排序功能
        "info": false,// 页脚信息
        "autoWidth": false,// 自动宽度
        "stripeClasses": [],
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
          }
        },
        "order": [
          [0, null]
        ],// 第一列排序图标改为默认

      });
      table.on('order.dt search.dt', function () {
        table.column(0, {
          search: 'applied',
          order: 'applied'
        }).nodes().each(function (cell, i) {
          cell.innerHTML = i + 1;
        });
      }).draw();
    },
    //停止数据
    tableStopData: function () {
      //停止数据点击是隐藏人车数据
      $("#peopleGPSData").removeClass("active in");
      $("#peopleGPSData").css("display", "none");
      $("#stopData").addClass("active in");
      $("#stopData").css("display", "block");
      $("#GPSData").css("display", "none");
      setTimeout(function () {
        $("#stopData .dataTables_scrollBody").scrollTop(0);
      }, 200);
      //表头宽度设置
      if (stopDataFlag) {
        setTimeout(function () {
          //停车数据点击获取数据
          $("#gpsTable2 tbody tr").bind("click", function () {
            $("#gpsTable2 tbody tr").removeClass("tableSelected");
            $(this).addClass("tableSelected");
            var stopIndex = parseInt($(this).children("td:nth-child(1)").text());
            if (markerStopAnimationFlog == 1) {
              trackPlayback.markerStop(stopIndex);
            } else {
              markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_NONE');
              stopIndexs = stopIndex - 1;
              markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_BOUNCE');
              map.setCenter(markerStopAnimation[stopIndexs].getPosition());
            }
          });
          $("#gpsTable5 tbody tr").bind("click", function () {
            $("#gpsTable5 tbody tr").removeClass("tableSelected");
            $(this).addClass("tableSelected");
            var stopIndex = parseInt($(this).children("td:nth-child(1)").text());
            if (markerStopAnimationFlog == 1) {
              trackPlayback.markerStop(stopIndex);
            } else {
              markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_NONE');
              stopIndexs = stopIndex - 1;
              markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_BOUNCE');
              map.setCenter(markerStopAnimation[stopIndexs].getPosition());
            }
          });
        }, 200);
        stopDataFlag = false;
        ;
      }
    },
    ajaxDataFilter: function (treeId, parentNode, responseData) {
      responseData = JSON.parse(ungzip(responseData.msg));
      if (responseData) {
        for (var i = 0; i < responseData.length; i++) {
          if (responseData[i].iconSkin != "assignmentSkin") {
            responseData[i].open = true;
          }
        }
      }
      return responseData;
    },
    zTreeBeforeClick: function () {
      return true;
    },
    //对象树勾选
    onCheck: function (e, treeId, treeNode) {
      var type = treeNode.deviceType;
      worldType = type;
      objType = treeNode.type;
      var objType = treeNode.type; // 监控对象类型
      objectType = objType;
      nowMonth = nowDate.getFullYear() + "-" + (parseInt(nowDate.getMonth() + 1) < 10 ? "0" + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate.getMonth() + 1)) + "-01";
      afterMonth = nowDate.getFullYear() + "-" + (parseInt(nowDate.getMonth() + 2) < 10 ? "0" + parseInt(nowDate.getMonth() + 2) : parseInt(nowDate.getMonth() + 2)) + "-01";
      var zTree = $.fn.zTree.getZTreeObj("treeDemo"), nodes = zTree
          .getCheckedNodes(true), v = "";
      var carPid = nodes[0].id;
      zTree.selectNode(treeNode, false, true);
      $("#savePid").attr("value", carPid);
      v = nodes[0].name;
      var cityObj = $("#citySel");
      cityObj.val(v);
      $("#menuContent").hide();
      trackPlayback.getActiveDate(carPid, nowMonth, afterMonth);
      trackPlayback.showHidePeopleOrVehicle();
      //单击时判断节点是否勾选订阅
      trackPlayback.vehicleTreeClickGetFenceInfo(treeNode.checked, treeNode.id);
      // 勾选的车辆
      crrentSubV = [];
      crrentSubV.push(treeNode.id);
    },
    //对象树点击
    zTreeOnClick: function (event, treeId, treeNode) {
      nowMonth = nowDate.getFullYear() + "-" + (parseInt(nowDate.getMonth() + 1) < 10 ? "0" + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate.getMonth() + 1)) + "-01";
      afterMonth = nowDate.getFullYear() + "-" + (parseInt(nowDate.getMonth() + 2) < 10 ? "0" + parseInt(nowDate.getMonth() + 2) : parseInt(nowDate.getMonth() + 2)) + "-01";
      var id = treeNode.id;
      $("#savePid").attr("value", id);
      var name = treeNode.name;
      if (treeNode.type != 'assignment' && treeNode.type != 'group') {
        $("#citySel").val(name);
      } else {
        $("#citySel").val('');
      }
      var type = treeNode.deviceType;
      worldType = type;
      objType = treeNode.type;
      var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
      var nodes = treeObj.getCheckedNodes(true);
      for (var i = 0, l = nodes.length; i < l; i++) {
        treeObj.checkNode(nodes[i], false, true);
      }
      treeObj.selectNode(treeNode, false, true);
      treeObj.checkNode(treeNode, true, true);
      map.clearMap();
      trackPlayback.getTable('#gpsTable', []);
      trackPlayback.getTable('#gpsTable2', []);
      trackPlayback.getTable('#gpsTable3', []);
      trackPlayback.getTable('#gpsTable4', []);
      trackPlayback.getTable('#gpsTable5', []);
      // 查询行驶数据
      trackPlayback.getActiveDate(id, nowMonth, afterMonth);
      // wjk 点击时隐藏播放按钮
      $("#playCarListIcon").hide();
      trackPlayback.clears();
      $("#allMileage").text(0 + "km");
      $("#allTime").text(0);
      $("#maxSpeend").text(0 + "km/h");
      //wjk end
      trackPlayback.showHidePeopleOrVehicle();
      //单击时判断节点是否勾选订阅
      trackPlayback.vehicleTreeClickGetFenceInfo(treeNode.checked, treeNode.id);
    },
    //根据车id查询当前车辆绑定围栏信息
    getCurrentVehicleAllFence: function (vId) {
      var fenceSetting = {
        async: {
          url: "/clbs/m/functionconfig/fence/bindfence/fenceTreeByVid",
          type: "post",
          enable: true,
          autoParam: ["id"],
          dataType: "json",
          otherParam: {"vid": vId}, //监控对象ID
          dataFilter: trackPlayback.FenceAjaxDataFilter
        },
        view: {
          dblClickExpand: false,
          nameIsHTML: true,
          fontCss: setFontCss_ztree
        },
        check: {
          enable: true,
          chkStyle: "checkbox",
          chkboxType: {
            "Y": "s",
            "N": "s"
          },
          radioType: "all"
        },
        data: {
          simpleData: {
            enable: true
          },
          key: {
            title: "name"
          }
        },
        callback: {
          onClick: trackPlayback.vFenceTreeClick,
          onCheck: trackPlayback.vFenceTreeCheck
        }
      };
      $.fn.zTree.init($("#vFenceTree"), fenceSetting, null);
      //IE9（模糊查询）
      if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE9.0") {
        var search;
        $("#vFenceSearch").bind("focus", function () {
          search = setInterval(function () {
            search_ztree('vFenceTree', 'vFenceSearch', 'fence');
          }, 500);
        }).bind("blur", function () {
          clearInterval(search);
        });
      }
    },
    //当前监控对象围栏点击
    vFenceTreeClick: function (e, treeId, treeNode) {
      var zTree = $.fn.zTree.getZTreeObj("vFenceTree");
      zTree.checkNode(treeNode, !treeNode.checked, null, true);
      return false;
      trackPlayback.showZtreeCheckedToMap(treeNode, zTree);
    },
    //当前监控对象围栏勾选
    vFenceTreeCheck: function (e, treeId, treeNode) {
      var zTree = $.fn.zTree.getZTreeObj("vFenceTree");
      var nodes = zTree.getCheckedNodes(true);
      trackPlayback.showZtreeCheckedToMap(treeNode, zTree);
    },
    //显示当前勾选对象围栏到地图
    showZtreeCheckedToMap: function (treeNode, zTree) {
      //判断选中属性
      if (treeNode.checked == true) {
        //获取勾选状态被改变的节点集合
        var changeNodes = zTree.getChangeCheckedNodes();
        for (var i = 0, len = changeNodes.length; i < len; i++) {
          changeNodes[i].checkedOld = true;
        }
        ;
        for (var j = 0; j < changeNodes.length; j++) {
          var nodesId = changeNodes[j].id;
          trackPlayback.showFenceInfo(nodesId, changeNodes[j]);
        }
        ;
      } else {
        var changeNodes = zTree.getChangeCheckedNodes();
        for (var i = 0, len = changeNodes.length; i < len; i++) {
          changeNodes[i].checkedOld = false;
          zTree.cancelSelectedNode(changeNodes[i]);
          var nodesId = changeNodes[i].id;
          trackPlayback.hideFenceInfo(nodesId);
        }
        ;
      }
      ;
    },
    //当前监控对象围栏查询
    vsearchFenceCarSearch: function () {
      search_ztree('vFenceTree', 'vFenceSearch', 'fence');
    },
    //当前监控对象围栏预处理的函数
    FenceAjaxDataFilter: function (treeId, parentNode, responseData) {
      if (responseData) {
        for (var i = 0; i < responseData.length; i++) {
          responseData[i].open = false;
        }
      }
      return responseData;
    },
    //车辆树单双击获取当前围栏信息
    vehicleTreeClickGetFenceInfo: function (treeStatus, treeId) {
      if (treeStatus == true) {
        //清空搜索条件
        if ($("#vFenceSearch").val() != "" || $("#vFenceSearch").val() != null) {
          $("#vFenceSearch").val("");
        }
        //清除围栏集合及地图显示
        trackPlayback.delFenceListAndMapClear();
        //订阅后查询当前对象绑定围栏信息
        trackPlayback.getCurrentVehicleAllFence(treeId);
        //显示围栏树及搜索 隐藏消息提示
        $("#vFenceTree").removeClass("hidden");
        $("#vSearchContent").removeClass("hidden");
        $("#vFenceMsg").addClass("hidden");
      } else {
        $("#vFenceTree").html("").addClass("hidden");
        $("#vSearchContent").addClass("hidden");
      }
    },
    //围栏显示隐藏
    fenceToolClickSHFn: function () {
      if ($("#fenceTool>.dropdown-menu").is(":hidden")) {
        $("#fenceTool>.dropdown-menu").show();
      } else {
        $("#fenceTool>.dropdown-menu").hide();
      }
    },
    //当点击或选择围栏时，访问后台返回围栏详情
    getFenceDetailInfo: function (fenceNode, showMap) {
      // ajax访问后端查询
      layer.load(2);
      $.ajax({
        type: "POST",
        url: "/clbs/m/functionconfig/fence/bindfence/getFenceDetails",
        data: {
          "fenceNodes": JSON.stringify(fenceNode)
        },
        dataType: "json",
        success: function (data) {
          layer.closeAll('loading');
          if (data.success) {
            var dataList = data.obj;
            if (dataList != null && dataList.length > 0) {
              if (dataList[0].fenceType == "zw_m_line") {
                fanceID = dataList[0].fenceData[0].lineId;
              }
              ;
              for (var i = 0; i < dataList.length; i++) {
                var fenceData;
                var fenceType = dataList[i].fenceType;
                var wayPointArray;
                if (fenceType == 'zw_m_travel_line') {
                  fenceData = dataList[i].allPoints;
                  wayPointArray = dataList[i].passPointData;
                } else {
                  fenceData = dataList[i].fenceData;
                }
                ;
                var lineSpot = dataList[i].lineSpot == undefined ? [] : dataList[i].lineSpot;
                var lineSegment = dataList[i].lineSegment == undefined ? [] : dataList[i].lineSegment;
                if (fenceType == "zw_m_marker") { // 标注
                  trackPlayback.drawMarkToMap(fenceData, showMap);
                } else if (fenceType == "zw_m_line") { // 线
                  trackPlayback.drawLineToMap(fenceData, lineSpot, lineSegment, showMap);
                } else if (fenceType == "zw_m_rectangle") { // 矩形
                  trackPlayback.drawRectangleToMap(fenceData, showMap);
                } else if (fenceType == "zw_m_polygon") { // 多边形
                  trackPlayback.drawPolygonToMap(fenceData, showMap);
                } else if (fenceType == "zw_m_circle") { // 圆形
                  trackPlayback.drawCircleToMap(fenceData, showMap);
                } else if (fenceType == "zw_m_administration") { // 行政区域
                  var aId = dataList[0].aId
                  trackPlayback.drawAdministrationToMap(fenceData, aId, showMap);
                } else if (fenceType == "zw_m_travel_line") { // 行驶路线
                  trackPlayback.drawTravelLineToMap(fenceData, showMap, dataList[i].travelLine, wayPointArray);
                }
              }
            }
          }
        }
      });
    },
    //显示行政区域
    drawAdministrationToMap: function (data, aId, showMap) {
      var polygonAarry = [];
      if (AdministrativeRegionsList.containsKey(aId)) {
        var this_fence = AdministrativeRegionsList.get(aId);
        map.remove(this_fence);
        AdministrativeRegionsList.remove(aId);
      }
      ;
      for (var i = 0, l = data.length; i < 1; i++) {
        var polygon = new AMap.Polygon({
          map: map,
          strokeWeight: 1,
          strokeColor: '#CC66CC',
          fillColor: '#CCF3FF',
          fillOpacity: 0.5,
          path: data
        });
        polygonAarry.push(polygon);
      }
      ;
      AdministrativeRegionsList.put(aId, polygonAarry);
      map.setFitView(polygon);//地图自适应
    },
    //标注
    drawMarkToMap: function (mark, thisMap) {
      var markId = mark.id;
      //判断集合中是否含有指定的元素
      if (fenceIdList.containsKey(markId)) {
        var markerObj = fenceIdList.get(markId);
        thisMap.remove(markerObj);
        fenceIdList.remove(markId);
      }
      ;
      var dataArr = [];
      dataArr.push(mark.longitude);
      dataArr.push(mark.latitude);
      polyFence = new AMap.Marker({
        position: dataArr,
        offset: new AMap.Pixel(-9, -23)
      });
      polyFence.setMap(thisMap);
      thisMap.setFitView(polyFence);
      fenceIdList.put(markId, polyFence);
    },
    //矩形
    drawRectangleToMap: function (rectangle, thisMap) {
      var rectangleId = rectangle.id;
      if (fenceIdList.containsKey(rectangleId)) {
        var thisFence = fenceIdList.get(rectangleId);
        thisFence.show();
        map.setFitView(thisFence);
      }
      else {
        var dataArr = new Array();
        if (rectangle != null) {
          dataArr.push([rectangle.leftLongitude, rectangle.leftLatitude]); // 左上角
          dataArr.push([rectangle.rightLongitude, rectangle.leftLatitude]); // 右上角
          dataArr.push([rectangle.rightLongitude, rectangle.rightLatitude]); // 右下角
          dataArr.push([rectangle.leftLongitude, rectangle.rightLatitude]); // 左下角
        }
        ;
        polyFence = new AMap.Polygon({
          path: dataArr,//设置多边形边界路径
          strokeColor: "#FF33FF", //线颜色
          strokeOpacity: 0.2, //线透明度
          strokeWeight: 3, //线宽
          fillColor: "#1791fc", //填充色
          fillOpacity: 0.35
          //填充透明度
        });
        polyFence.setMap(thisMap);
        thisMap.setFitView(polyFence);
        fenceIdList.put(rectangleId, polyFence);
      }
      ;
    },
    //多边形
    drawPolygonToMap: function (polygon, thisMap) {
      var polygonId = polygon[0].polygonId;
      if (fenceIdList.containsKey(polygonId)) {
        var thisFence = fenceIdList.get(polygonId);
        thisFence.hide();
        fenceIdList.remove(polygonId);
      }
      ;
      var dataArr = new Array();
      if (polygon != null && polygon.length > 0) {
        for (var i = 0; i < polygon.length; i++) {
          dataArr.push([polygon[i].longitude, polygon[i].latitude]);
        }
      }
      ;
      polyFence = new AMap.Polygon({
        path: dataArr,//设置多边形边界路径
        strokeColor: "#FF33FF", //线颜色
        strokeOpacity: 0.2, //线透明度
        strokeWeight: 3, //线宽
        fillColor: "#1791fc", //填充色
        fillOpacity: 0.35
        //填充透明度
      });
      polyFence.setMap(thisMap);
      thisMap.setFitView(polyFence);
      fenceIdList.put(polygonId, polyFence);
    },
    //圆形
    drawCircleToMap: function (circle, thisMap) {
      var circleId = circle.id;
      if (fenceIdList.containsKey(circleId)) {
        var thisFence = fenceIdList.get(circleId);
        thisFence.hide();
        fenceIdList.remove(circleId);
      }
      ;
      polyFence = new AMap.Circle({
        center: new AMap.LngLat(circle.longitude, circle.latitude),// 圆心位置
        radius: circle.radius, //半径
        strokeColor: "#F33", //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 3, //线粗细度
        fillColor: "#ee2200", //填充颜色
        fillOpacity: 0.35
        //填充透明度
      });
      polyFence.setMap(thisMap);
      thisMap.setFitView(polyFence);
      fenceIdList.put(circleId, polyFence);
    },
    //行驶路线
    drawTravelLineToMap: function (data, thisMap, travelLine, wayPointArray) {
      var lineID = travelLine.id;
      var path = [];
      var start_point_value = [travelLine.startlongtitude, travelLine.startLatitude];
      var end_point_value = [travelLine.endlongtitude, travelLine.endLatitude];
      var wayValue = [];
      if (wayPointArray != undefined) {
        for (var j = 0, len = wayPointArray.length; j < len; j++) {
          wayValue.push([wayPointArray[j].longtitude, wayPointArray[j].latitude]);
        }
        ;
      }
      ;
      for (var i = 0, len = data.length; i < len; i++) {
        path.push([data[i].longitude, data[i].latitude]);
      }
      ;
      if (travelLineList.containsKey(lineID)) {
        var this_line = travelLineList.get(lineID);
        map.remove([this_line]);
        travelLineList.remove(lineID);
      }
      ;
      var polyFencec = new AMap.Polyline({
        path: path, //设置线覆盖物路径
        strokeColor: "#3366FF", //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 5, //线宽
        strokeStyle: "solid", //线样式
        strokeDasharray: [10, 5],
        zIndex: 51
      });
      polyFencec.setMap(map);
      map.setFitView(polyFencec);
      travelLineList.put(lineID, polyFencec);
    },
    //线
    drawLineToMap: function (line, lineSpot, lineSegment, thisMap) {
      var lineId = line[0].lineId;
      //是否存在线
      if (fenceIdList.containsKey(lineId)) {
        var thisFence = fenceIdList.get(lineId);
        if (Array.isArray(thisFence)) {
          for (var i = 0; i < thisFence.length; i++) {
            thisFence[i].hide();
          }
          ;
        } else {
          thisFence.hide();
        }
        ;
        fenceIdList.remove(lineId);
      }
      ;
      //线数据
      var dataArr = new Array();
      var lineSectionArray = [];
      if (line != null && line.length > 0) {
        for (var i in line) {
          if (line[i].type == "0") {
            dataArr[i] = [line[i].longitude, line[i].latitude];
          }
        }
      }
      //地图画线
      var polyFencec = new AMap.Polyline({
        path: dataArr, //设置线覆盖物路径
        strokeColor: "#3366FF", //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 5, //线宽
        strokeStyle: "solid", //线样式
        strokeDasharray: [10, 5],
        zIndex: 51
        //补充线样式
      });
      lineSectionArray.push(polyFencec);
      fenceIdList.put(lineId, polyFencec);
      polyFencec.setMap(thisMap);
      thisMap.setFitView(polyFencec);
    },
    //围栏隐藏
    hideFenceInfo: function (nodesId) {
      if (fenceIdList.containsKey(nodesId)) {
        var thisFence = fenceIdList.get(nodesId);
        if (Array.isArray(thisFence)) {
          for (var i = 0; i < thisFence.length; i++) {
            thisFence[i].hide();
          }
          ;
        } else {
          thisFence.hide();
        }
        ;
      }
      ;
      trackPlayback.hideRegionsOrTravel(nodesId);
    },
    //隐藏行政区划及行驶路线
    hideRegionsOrTravel: function (id) {
      //行政区划
      if (AdministrativeRegionsList.containsKey(id)) {
        var this_fence = AdministrativeRegionsList.get(id);
        map.remove(this_fence);
        AdministrativeRegionsList.remove(id);
      }
      ;
      //行驶路线
      if (travelLineList.containsKey(id)) {
        var this_fence = travelLineList.get(id);
        map.remove(this_fence);
        travelLineList.remove(id);
      }
      ;
    },
    //围栏显示
    showFenceInfo: function (nodesId, node) {
      //判断集合中是否含有指定的元素
      if (fenceIdList.containsKey(nodesId)) {
        var thisFence = fenceIdList.get(nodesId);
        if (thisFence != undefined) {
          if (Array.isArray(thisFence)) {
            for (var s = 0; s < thisFence.length; s++) {
              thisFence[s].show();
              map.setFitView(thisFence[s]);
            }
            ;
          } else {
            thisFence.show();
            map.setFitView(thisFence);
          }
          ;
        }
      } else {
        trackPlayback.getFenceDetailInfo([node], map);
      }
      ;
    },
    //围栏集合数据清除及切换后初始化
    delFenceListAndMapClear: function () {
      //清除根据监控对象查询的围栏勾选
      var zTree = $.fn.zTree.getZTreeObj("vFenceTree");
      //处理判断不勾选围栏直接切换至电子围栏后错误问题
      if (zTree != null) {
        var nodes = zTree.getCheckedNodes(true);
        //获取已勾选的节点结合  变换为不勾选
        for (var i = 0, l = nodes.length; i < l; i++) {
          zTree.checkNode(nodes[i], false, false);
        }
        //改变勾选状态checkedOld
        var allNodes = zTree.getChangeCheckedNodes();
        for (var i = 0; i < allNodes.length; i++) {
          allNodes[i].checkedOld = false;
        }
        //删除 标注、线、矩形、圆形、多边形 （集合fenceIdList）
        if (fenceIdList.elements.length > 0) {
          var fLength = fenceIdList.elements.length;
          //遍历当前勾选围栏
          for (var i = 0; i < fLength; i++) {
            //获取围栏Id
            var felId = fenceIdList.elements[i].key;
            //隐藏围栏及删除数组数据
            var felGs = fenceIdList.get(felId);
            //AMap.Marker标注    AMap.Polyline线    AMap.Polygon矩形   AMap.Circle圆形
            if (felGs.CLASS_NAME == "AMap.Marker" || felGs.CLASS_NAME == "AMap.Polyline" || felGs.CLASS_NAME == "AMap.Polygon" || felGs.CLASS_NAME == "AMap.Circle") {
              felGs.hide();
            }
          }
          //清空数组
          fenceIdList.clear();
        }
        //删除行政区域 （集合AdministrativeRegionsList）
        if (AdministrativeRegionsList.elements.length > 0) {
          var aLength = AdministrativeRegionsList.elements.length;
          for (var i = 0; i < aLength; i++) {
            var admId = AdministrativeRegionsList.elements[i].key;
            var admGs = AdministrativeRegionsList.get(admId);
            map.remove(admGs);
          }
          AdministrativeRegionsList.clear();
        }
        //删除导航路线 （集合travelLineList）
        if (travelLineList.elements.length > 0) {
          var tLength = travelLineList.elements.length;
          for (var i = 0; i < tLength; i++) {
            var travelId = travelLineList.elements[i].key;
            var travelGs = travelLineList.get(travelId);
            map.remove([travelGs]);
          }
          travelLineList.clear();
        }
      }
    },
    //车辆树点击对象不同显示及隐藏方法
    showHidePeopleOrVehicle: function () {
      //显示报警点开关
      $("#showAlarmPoint,#showStopPoint").show();
      //判断点击的监控对象的协议类型
      if (worldType == "5") {
        //隐藏车
        $("#p-travelData,#peopleGPSData").css("display", "block");
        $("#v-travelData,#GPSData").css("display", "none");
        $("#p-travelData").addClass("active");
        $("#peopleGPSData").addClass("active in");
        $("#tableStopData,#tableAlarmDate").removeClass("active");
        $("#stopData,#warningData").removeClass("active in");
        $("#v-travelData").removeClass("active");
        $("#GPSData").removeClass("in active");
        $("#v-travelData,#GPSData").css("display", "none");
        //隐藏停止  车
        $("#tableStopData").removeClass("active");
        $("#stopData").removeClass("active in");
        $("#tableStopData,#stopData").css("display", "none");
        $("#peopleStopData,#p-tableStopData").css("display", "block");
        if ($("#p-travelData").hasClass("active")) {
          $("#p-tableStopData").removeClass("active")
          $("#peopleStopData").css("display", "none");
        }
      } else {
        trackPlayback.hidePeopleRelatedInfo();
      }
    },
    //隐藏人相关数据
    hidePeopleRelatedInfo: function () {
      $("#p-travelData,#peopleGPSData").css("display", "none");
      $("#v-travelData,#GPSData").css("display", "block");
      $("#tableStopData,#tableAlarmDate").removeClass("active");
      $("#stopData").removeClass("in active");
      $("#warningData").removeClass("active in");
      $("#v-travelData").addClass("active");
      $("#GPSData").addClass("active in");
      //隐藏停止  车
      $("#peopleStopData").css("display", "none");
      $("#p-travelData").removeClass("active");
      $("#peopleGPSData").removeClass("active in");
      $("#p-travelData,#peopleGPSData").css("display", "none");
      $("#p-tableStopData").removeClass("active");
      $("#peopleStopData").removeClass("acrive in");
      $("#p-tableStopData,#peopleStopData").css("display", "none");
      $("#tableStopData,#stopData").css("display", "block");
      $("#stopData").css("display", "none");
    },
    //停止数据 人
    peopleTableStopDataClick: function () {
      $("#peopleGPSData").css("display", "none");
      $("#peopleStopData").css("display", "block");
      if ($("#p-tableStopData").hasClass("active")) {
        $("#stopData").css("display", "none");
      }
      setTimeout(function () {
        $("#peopleStopData .dataTables_scrollBody").scrollTop(0);
      }, 200);
      //表头宽度设置
      if (stopDataFlag) {
        setTimeout(function () {
          //停车数据点击获取数据
          $("#gpsTable5 tbody tr").bind("click", function () {
            $("#gpsTable5 tbody tr").removeClass("tableSelected");
            $(this).addClass("tableSelected");
            var stopIndex = parseInt($(this).children("td:nth-child(1)").text());
            if (markerStopAnimationFlog == 1) {
              trackPlayback.markerStop(stopIndex);
            } else {
              markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_NONE');
              stopIndexs = stopIndex % 2 == 0 ? stopIndex / 2 - 1 : (stopIndex + 1) / 2 - 1;
              markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_BOUNCE');
              map.setCenter(markerStopAnimation[stopIndexs].getPosition());
            }
          });
        }, 200);
        stopDataFlag = false;
        ;
      }
    },
    //行驶数据 人
    peopleTravelDataClick: function () {
      $("#GPSData").removeClass("in active");
      $("#stopData").removeClass("in active");
      $("#warningData").removeClass("in active");
      $("#peopleGPSData").addClass("active in");
      $("#peopleGPSData").css("display", "block");
      $("#GPSData").css("display", "none");
      $("#peopleStopData").removeClass("active in");
      $("#peopleStopData").css("display", "none");
    },
    //报警数据
    tableAlarmDateClick: function () {
      $("#peopleStopData,#stopData,#peopleGPSData,#GPSData").css("display", "none");
      $("#warningData").show();
    },
    //行驶数据  车
    vehicleTravelData: function () {
      $("#peopleGPSData,#stopData").css("display", "none");
      $("#GPSData").css("display", "block");
    },
    getTreeUrl: function (treeId, treeNode) {
      if (treeNode == null) {
        return "/clbs/m/functionconfig/fence/bindfence/getTreeByMonitorCount";
      } else if (treeNode.type == "assignment") {
        return "/clbs/m/functionconfig/fence/bindfence/putMonitorByAssign?assignmentId=" + treeNode.id + "&isChecked=" + treeNode.checked + "&monitorType=monitor";
      }
    },
    zTreeBeforeCheck: function (treeId, treeNode) {
      var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
      var nodes = treeObj.getCheckedNodes(true);
      for (var i = 0; i < nodes.length; i++) {
        treeObj.checkNode(nodes[i], false, true);
      }
    },
    //对象树加载成功
    zTreeOnAsyncSuccess: function (event, treeId, treeNode, msg) {
      var vUuid = $('#vid').val();
      var parentId = $('#pid').val();
      if (parentId != "") {
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        var allNode = treeObj.getNodes();
        var parNode = treeObj.getNodesByParam("id", parentId, null);
        treeObj.expandNode(parNode[0], true, true, true, true); // 展开节点
        if (vUuid != "") {
          var node = treeObj.getNodesByParam("id", vUuid, null);
          if (node != null && node != undefined && node.length > 0) {
            for (var i = 0, len = node.length; i < len; i++) {
              treeObj.checkNode(node[i], true, true);
              if (crrentSubV.length == 0) { // 存入勾选数组
                crrentSubV.push(node[i].id);
              }
              var parentNode = node[i].getParentNode();
            }
            ;
            var cityObj = $("#citySel");
            if (firstFlag) {
              cityObj.val(node[0].name);
            }
            var type = node[0].deviceType;
            worldType = type;
            objType = node[0].type;
          }
          trackPlayback.getActiveDate(vUuid, nowMonth, afterMonth);
        }
      }
      bflag = false;
      var zTree = $.fn.zTree.getZTreeObj(treeId);
      // 更新节点数量
      zTree.updateNodeCount(treeNode);
      // 默认展开200个节点
      var initLen = 0;
      notExpandNodeInit = zTree.getNodesByFilter(assignmentNotExpandFilter);
      for (i = 0; i < notExpandNodeInit.length; i++) {
        zTree.expandNode(notExpandNodeInit[i], true, true, false, true);
        initLen += notExpandNodeInit[i].children.length;
        if (initLen >= 200) {
          break;
        }
      }
    },
    zTreeOnExpand: function (event, treeId, treeNode) {
      var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
      if (treeNode.type == "assignment" && treeNode.children === undefined) {
        var url = "/clbs/m/functionconfig/fence/bindfence/putMonitorByAssign";
        json_ajax("post", url, "json", false, {
          "assignmentId": treeNode.id,
          "isChecked": treeNode.checked,
          "monitorType": "monitor"
        }, function (data) {
          var result = JSON.parse(ungzip(data.msg));
          if (result != null && result.length > 0) {
            treeObj.addNodes(treeNode, result);
            trackPlayback.checkCurrentNodes();
          }
        })
      }
    },
    zTreeBeforeAsync: function () {
      return bflag;
    },
    zTreeOnNodeCreated: function (event, treeId, treeNode) {
      var zTree = $.fn.zTree.getZTreeObj("treeDemo");
      var id = treeNode.id.toString();
      var list = [];
      if (zTreeIdJson[id] == undefined || zTreeIdJson[id] == null) {
        list = [treeNode.tId];
        zTreeIdJson[id] = list;
      } else {
        zTreeIdJson[id].push(treeNode.tId)
      }
    },
    //左侧数据日历及对象树隐藏方法
    leftToolBarHideFn: function () {
      if ($('#scalingBtn').hasClass('fa-chevron-down')) {
        oldMHeight = $("#MapContainer").height();
        oldTHeight = $(".trackPlaybackTable .dataTables_scrollBody").height();
        $('#scalingBtn').attr('class', 'fa fa-chevron-up');
      }
      ;
      $("#content-left").hide();
      $("#content-right").attr("class", "col-md-12 content-right");
      $("#content-right").css("width", "100%");
      $("#goShow").show();
      //点击隐藏轨迹回放查询
      $("#MapContainer").css({
        "height": (initialMapH - 5) + "px"
      });
      $(".trackPlaybackTable .dataTables_scrollBody").css({
        "height": 0 + "px"
      });
    },
    //左侧数据日历及对象树显示方法
    leftToolBarShowFn: function () {
      $('#scalingBtn').attr('class', 'fa fa-chevron-down');
      if ($(".dataTables_scrollBody").length == 0) {
        $("#MapContainer").css({
          "height": initialMapH + "px"
        });
        $(".trackPlaybackTable .dataTables_scrollBody").css({
          "height": 0 + "px"
        });
      } else {
        $("#MapContainer").css({
          "height": oldMHeight + "px"
        });
        $(".trackPlaybackTable .dataTables_scrollBody").css({
          "height": oldTHeight + "px"
        });
      }
      $("#content-left").show();
      $("#content-right").attr("class", "col-md-9 content-right");
      if ($(".sidebar").hasClass("sidebar-toggle")) {
        $("#content-right").css({
          "width": 100 - newwidth + "%"
        });
        $("#content-left").css({
          "width": newwidth + "%"
        });
      } else {
        $("#content-right").css({
          "width": "75%"
        });
        $("#content-left").css({
          "width": "25%"
        });
      }
      $("#goShow").hide();
    },
    //历史轨迹数据查询
    getHistory1: function () {
      var pointSeqs = ""; // 点序号
      var longtitudes = ""; // 所有的经度
      var latitudes = ""; // 所有的纬度
      var vehicleId = $("#savePid").val();
      var chooseDate = $("#timeInterval").val().split("--");
      var startTime = chooseDate[0];
      var endTime = chooseDate[1];
      $.ajax({
        type: "POST",
        url: "/clbs/v/monitoring/getHistoryData",
        data: {
          "vehicleId": vehicleId,
          "startTime": startTime,
          "endTime": endTime,
          "type": worldType
        },
        dataType: "json",
        async: false,
        success: function (data) {
          if (data.success) {
            var positionalData = ungzip(data.msg);
            var positionals = $.parseJSON(positionalData);
            var msg = positionals.resultful;
            var len = msg.length;
            var position;
            var latitude;
            var longtitude;
            var m = 0;
            for (var i = 0; i < len; i++) {
              position = msg[i];
              latitude = position.latitude;//纬度
              longtitude = position.longtitude;//经度

              pointSeqs += (m++) + ",";
              longtitudes += Math.formatFloat(longtitude, 6) + ",";
              latitudes += Math.formatFloat(latitude, 6) + ",";
            }
            if (pointSeqs.length > 0) {
              pointSeqs = pointSeqs.substr(0, pointSeqs.length - 1);
            }
            if (longtitudes.length > 0) {
              longtitudes = longtitudes.substr(0, longtitudes.length - 1);
            }
            if (latitudes.length > 0) {
              latitudes = latitudes.substr(0, latitudes.length - 1);
            }
            $("#pointSeqs").val(pointSeqs);
            $("#longitudes").val(longtitudes);
            $("#latitudes").val(latitudes);
          }
        }
      });
    },
    //轨迹生成围栏，围栏名称唯一性验证
    addLineFence: function () {
      var name = $("#lineName1").val();
      var url = "/clbs/m/functionconfig/fence/managefence/addLine";
      var data = {"name": name};
      json_ajax("POST", url, "json", false, data, trackPlayback.lineCallback);
    },
    //轨迹生成围栏验证
    lineCallback: function (data) {
      if (data.success == true) {
        trackPlayback.trackLineAdded();
      } else {
        if (data.msg == null) {
          layer.msg(trackFenceExists);
        } else if (data.msg.toString().indexOf("系统错误") > -1) {
          layer.msg(data.msg, {move: false});
        }
      }
    },
    //轨迹线路添加
    trackLineAdded: function () {
      if (trackPlayback.validate_line()) {
        layer.load(2);
        $("#addFenceBtn").attr("disabled", true);
        $("#hideDialog").attr("disabled", true);
        trackPlayback.getHistory1();
        var pointSeqs = $("#pointSeqs").val();
        var longtitudes = $("#longtitudes").val();
        var latitudes = $("#latitudes").val();
        if (pointSeqs == "" || longtitudes == "" || latitudes == "") {
          layer.msg(trackHistoryDataNull);
          return;
        }
        $("#addLineForm").ajaxSubmit(function (data) {
          data = JSON.parse(data);
          if (data.success) {
            $(".cancle").click();
            $("#addFenceBtn").attr("disabled", false);
            $("#hideDialog").attr("disabled", false);
            $("#hideDialog").click();
            layer.closeAll();
            layer.msg(publicSaveSuccess);
          } else {
            if (data.msg == null) {
              layer.msg(publicSaveError);
            } else if (data.msg.toString().indexOf("系统错误") > -1) {
              layer.msg(data.msg, {move: false});
            }
          }
        });
      }
    },
    //线路添加时验证
    validate_line: function () {
      return $("#addLineForm").validate({
        rules: {
          name: {
            required: true,
            maxlength: 20
          },
          width: {
            required: true,
            maxlength: 10
          },
          description: {
            maxlength: 100
          }
        },
        messages: {
          name: {
            required: publicNull,
            maxlength: publicSize20
          },
          width: {
            required: publicNull,
            maxlength: publicSize10
          },
          description: {
            maxlength: publicSize100
          }
        }
      }).form();
    },
    //隐藏相关
    hideDialog: function () {
      $(".modal-backdrop").hide();
      $("#commonWin").hide();
      trackPlayback.clearErrorMsg();
      trackPlayback.clearLine();
    },
    // 清除错误信息
    clearErrorMsg: function () {
      $("label.error").hide();
      $(".error").removeClass("error");
    },
    // 清空线路
    clearLine: function () {
      $("#addOrUpdateLineFlag").val("0");
      $("#lineId").val("");
      $("#lineName1").val("");
      $("#lineWidth1").val("");
      $("#lineDescription1").val("");
      $("#pointSeqs").val("");
      $("#longtitudes").val("");
      $("#latitudes").val("");
    },
    toolClickList: function () {
      if (RegionalQuerymarker != null) {
        mouseTool.close(true);
        map.remove(RegionalQuerymarker);
      }
      mouseTool.rectangle();
    },
    //区域画完回调函数
    createSuccess: function (data) {
      changeArray = data.obj.getBounds();
      var chooseDate = $("#timeInterval").val().split("--");
      createSuccessStm = chooseDate[0];
      createSuccessEtm = chooseDate[1];
      createSuccessSpid = $("#savePid").val();
      createSuccessStm = new Date(Date.parse(createSuccessStm.replace(/-/g, "/")));
      createSuccessStm = createSuccessStm.getTime() / 1000;
      createSuccessEtm = new Date(Date.parse(createSuccessEtm.replace(/-/g, "/")));
      createSuccessEtm = createSuccessEtm.getTime() / 1000;
      leftToplongtitude = changeArray.getSouthWest().getLng();
      leftTopLatitude = changeArray.getSouthWest().getLat();
      rightFloorlongtitude = changeArray.getNorthEast().getLng();
      rightFloorLatitude = changeArray.getNorthEast().getLat();
      var url = "/clbs/v/monitoring/getHistoryByTimeAndAddress";
      var data = {
        "leftTopLongitude": leftToplongtitude,
        "leftTopLatitude": leftTopLatitude,
        "rightFloorLongitude": rightFloorlongtitude,
        "rightFloorLatitude": rightFloorLatitude,
        // "vehicleId": createSuccessSpid,
        "startTime": createSuccessStm,
        "endTime": createSuccessEtm,
      };
      //ajax_submit("POST", url, "json", true, data, true, trackPlayback.regionalQuery,trackPlayback.errorMsg);
      layer.load(2);
      $.ajax(
          {
            type: "POST",//通常会用到两种：GET,POST。默认是：GET
            url: url,//(默认: 当前页地址) 发送请求的地址
            dataType: "json", //预期服务器返回的数据类型。"json"
            async: true, // 异步同步，true  false
            data: data,
            traditional: true,
            timeout: 30000, //超时时间设置，单位毫秒
            success: trackPlayback.regionalQuery, //请求成功
            error: trackPlayback.errorMsg,//请求出错
          });

    },
    errorMsg: function (XMLHttpRequest, textStatus, errorThrown) {
      layer.closeAll('loading');
      if (textStatus === "timeout") {
        layer.msg("加载超时，请重试");
        mouseTool.close(true);
        //map.remove(RegionalQuerymarker);
        return;
      }
      if (XMLHttpRequest.responseText.indexOf("<form id=\"loginForm") > 0) {
        window.location.replace("/clbs/login?type=expired");
        return;
      }
      layer.msg("系统的情绪不稳定，并向你扔了一个错误~");
    },
    //区域查车
    regionalQuery: function (data) {
      layer.closeAll('loading');
      var sum = 0;
      var html = '';
      var msg = data.msg;
      var obj = JSON.parse(msg);
      var isHasCar = false;
      if (obj != null) {
        var vehicleInfos = obj.vehicleInfos;
        var peoples = obj.peoples;
        isHasCar = true;
        var arrstop = [];
        var chooseDate = $("#timeInterval").val().split("--");
        arrstop.push("开始时间:" + chooseDate[0]);
        arrstop.push("结束时间:" + chooseDate[1]);
        arrstop.push("该区域经过的监控对象:");
        var turnoverId = "turnoverId";
        if (vehicleInfos != undefined) {
          for (i = 0; i < vehicleInfos.length; i++) {
            sum++;
            turnoverId = turnoverId + "_" + i;
            var carVehicleId = vehicleInfos[i].vehicleId;
            var carName = vehicleInfos[i].carLicense;
            var carGroup = vehicleInfos[i].assignmentName;
            html += '<tr data-id="' + carVehicleId + '" class="fenceTurnoverTime"><td>' + carName + '</td><td>' + carGroup + '</td></tr><tr><td class="areaSearchTable" colspan="2"><table class="table table-striped table-bordered" cellspacing="0" width="100%"><thead><tr><th>序号</th><th>进区域时间</th><th>出区域时间</th></tr></thead><tbody id="' + turnoverId + '"></tbody></table></td></tr>';
            arrstop.push(carName);
          }
        }
        if (peoples != undefined) {
          for (i = 0; i < peoples.length; i++) {
            sum++;
            turnoverId = turnoverId + "_" + i;
            var carVehicleId = peoples[i].id;
            var carName = peoples[i].peopleNumber;
            var carGroup = peoples[i].groupName;
            html += '<tr data-id="' + carVehicleId + '" class="fenceTurnoverTime"><td>' + carName + '</td><td>' + carGroup + '</td></tr><tr><td class="areaSearchTable" colspan="2"><table class="table table-striped table-bordered" cellspacing="0" width="100%"><thead><tr><th>序号</th><th>进区域时间</th><th>出区域时间</th></tr></thead><tbody id="' + turnoverId + '"></tbody></table></td></tr>';
            arrstop.push(carName);
          }
        }
        RegionalQuerymarker = new AMap.Marker({
          map: map,
          position: changeArray.getCenter(),//基点位置
          offset: new AMap.Pixel(-26, -13), //相对于基点的位置
          content: '<div class="marker-route marker-marker-bus-from">' + sum + '</div>',
          zIndex: 99999,
          autoRotation: true
        });
        RegionalQuerymarker.content = arrstop.join("<br/>");
        RegionalQuerymarker.on('click', trackPlayback.markerClickRegionalQuery);
      }
      $("#areaSearchCarStartTime").text(chooseDate[0]);
      $("#areaSearchCarEndTime").text(chooseDate[1]);
      $("#dataTable tbody.monitoringObj").html(html);
      $(".fenceTurnoverTime").unbind("click").bind("click", trackPlayback.fenceTurnoverTime);
      if (isHasCar) {
        $("#areaSearchCar").modal('show');
        mouseTool.close(false);
      } else {
        layer.msg(trackAreaMonitorNull);
        mouseTool.close(true);
      }
      ;
    },
    //区域查车 关闭
    searchCarClose: function () {
      $("#areaSearchCar").modal('hide');
    },
    //区域查车显示数据点击
    markerClickRegionalQuery: function (e) {
      areaCheckCarInfoWindow.setContent(e.target.content);
      areaCheckCarInfoWindow.open(map, e.target.getPosition());
    },
    //进出区域tr点击事件
    fenceTurnoverTime: function () {
      createSuccessSpid = $(this).attr('data-id');
      var url = "/clbs/v/monitoring/getQueryDetails";
      turnoverClickID = $(this).next('tr').children('td').children('table').children('tbody').attr('id');
      if ($("#" + turnoverClickID).html() == '') {
        var data = {
          "leftTopLongitude": leftToplongtitude,
          "leftTopLatitude": leftTopLatitude,
          "rightFloorLongitude": rightFloorlongtitude,
          "rightFloorLatitude": rightFloorLatitude,
          "vehicleId": createSuccessSpid,
          "startTime": createSuccessStm,
          "endTime": createSuccessEtm
        };
        ajax_submit("POST", url, "json", true, data, true, trackPlayback.searchTurnoverValue);
      } else {
        var $td = $("#" + turnoverClickID).parents("td.areaSearchTable");
        if ($td.is(":hidden")) {
          $td.slideDown(200);
        } else {
          $td.slideUp(200);
        }
        ;
      }
      ;
    },
    //查询进出区域时间回调事件
    searchTurnoverValue: function (data) {
      if (data.success) {
        var html = '';
        var obj = data.obj;
        for (var i = 0; i < obj.length; i++) {
          if (obj[i][0] != '') {
            var time = trackPlayback.turnTimeFormat(obj[i][0]);
            html += '<tr><td>' + (i + 1) + '</td><td>' + time + '</td>';
          } else {
            html += '<tr><td>' + (i + 1) + '</td><td>未进区域</td>';
          }
          ;
          if (obj[i][1] != '') {
            var time = trackPlayback.turnTimeFormat(obj[i][1]);
            html += '<td>' + time + '</td></tr>';
          } else {
            html += '<td>未出区域</td></tr>';
          }
          ;
        }
        ;
        $("#" + turnoverClickID).html(html);
        $("#" + turnoverClickID).parents("td.areaSearchTable").slideDown(200);
      }
      ;
    },
    //时间戳转换为指定格式
    turnTimeFormat: function (time) {
      var value;
      var date = new Date(time * 1000);
      var Y = date.getFullYear() + '-';
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
      var D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + ' ';
      var h = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ':';
      var m = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + ':';
      var s = (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
      value = Y + M + D + h + m + s;
      return value;
    },
    //根据时间查询报警数据
    alarmData: function () {
      var vehicleId = $("#savePid").val();
      var chooseDate = $("#timeInterval").val().split("--");
      startTime = chooseDate[0];
      endTime = chooseDate[1];
      var alarmDataStm = new Date(Date.parse(startTime.replace(/-/g, "/"))) / 1000;
      var alarmDataEtm = new Date(Date.parse(endTime.replace(/-/g, "/"))) / 1000;
      trackPlayback.getTable('#gpsTable3', []);
      $.ajax({
        type: "POST",
        url: "/clbs/v/monitoring/getAlarmData",
        data: {
          "vehicleId": vehicleId,
          "startTime": alarmDataStm,
          "endTime": alarmDataEtm,
        },
        dataType: "json",
        async: false,
        success: function (data) {
          trackPlayback.alarmDatatable(data);
          trackPlayback.addressBindClick();
          trackPlayback.runDataSearch(runTable);
          trackPlayback.warningAddressGet();
        }
      })
    },
    //报警数据组装
    alarmDatatable: function (data) {
      markerAlarmList = [];
      var tableList = data.obj;
      var setstop;
      var stopIndexa = 1;
      var tableSetstop = [];
      var alarmtimeText = null;
      var alarmDescriptionText = "";
      var inext = 0;
      var history = null;
      for (var i = 0; i < tableList.length; i++) {
        var alarm = tableList[i];
        var plateNumber = alarm.plateNumber;
        var assignmentName = alarm.assignmentName;
        var alarmDescription = alarm.description;
        var alarmStatus = alarm.status;
        var alarmPersonName = alarm.personName;
        var alarmStartTime = alarm.startTime;
        var alarmStartLocation = alarm.startLocation;
        var alarmEndTime = alarm.endTime;
        var alarmEndLocation = alarm.endLocation;
        var height = alarm.height;
        var alarmFenceName = alarm.fenceName;
        var alarmFenceType = alarm.fenceType;
        if (alarmFenceType == 'zw_m_rectangle') {
          alarmFenceType = "矩形";
        } else if (alarmFenceType == 'zw_m_circle') {
          alarmFenceType = "圆形";
        } else if (alarmFenceType == 'zw_m_line') {
          alarmFenceType = "线";
        } else if (alarmFenceType == 'zw_m_polygon') {
          alarmFenceType = "多边形";
        }
        var recorderSpeed = alarm.recorderSpeed;
        if (alarm.alarmStartLocation != null) {
          var StartLocation = alarm.alarmStartLocation.split(',');//开始经纬度
        }
        if (alarm.alarmEndLocation != null) {
          var EndLocation = alarm.alarmEndLocation.split(',');//结束经纬度
        }
        warningTableTime.push([[StartLocation === undefined ? "" : StartLocation[1], StartLocation === undefined ? "" : StartLocation[0], alarm.alarmStartTime, alarm.id, 'warning'], [EndLocation === undefined ? "" : EndLocation[1], EndLocation === undefined ? "" : EndLocation[0], alarm.alarmEndTime, alarm.id, 'warning']]);
        setstop = [0, plateNumber, assignmentName == undefined ? '未分组' : assignmentName, alarmDescription, alarmStatus, alarmPersonName,
          alarmStartTime, (alarmStartLocation === null || alarmStartLocation == '[]') ? '点击获取位置信息' : alarmStartLocation, alarmEndTime, (alarmEndLocation === null || alarmEndLocation == '[]') ? '点击获取位置信息' : alarmEndLocation, alarmFenceType === undefined ? "" : alarmFenceType, alarmFenceName === undefined ? "" : alarmFenceName];
        setstop[0] = stopIndexa;
        stopIndexa++;
        tableSetstop.push(setstop);
        alarmtimeText = alarmStartTime;
        alarmDescriptionText = "";
        alarmDescriptionText = alarmDescription;
        if (alarm.alarmStartLocation != null) {
          var sLocation = alarm.alarmStartLocation.split(",");
        }
        var arrstop = [];
        if (worldType != "5") {
          arrstop.push("监控对象:" + plateNumber);
          arrstop.push("车牌颜色:" + vcolour);
          arrstop.push("所属分组:" + assignmentName);
          arrstop.push("高程:" + (height === null ? "" : height));
          arrstop.push("SIM卡号:" + alarmSIM);
          arrstop.push("终端号:" + alarmTopic);
          arrstop.push("记录仪速度:" + (recorderSpeed === null ? "" : recorderSpeed));
          arrstop.push("报警信息:" + alarmDescriptionText);
          arrstop.push("处理状态:" + alarmStatus);
          arrstop.push("处理人:" + (alarmPersonName === null ? "无" : alarmPersonName));
          arrstop.push("报警开始时间:" + (alarmStartTime === null ? "" : alarmStartTime));
          arrstop.push("报警开始坐标:" + (StartLocation === undefined ? "位置描述获取失败" : StartLocation));
          arrstop.push("报警结束时间:" + (alarmEndTime === null ? "" : alarmEndTime));
          arrstop.push("报警结束坐标:" + (EndLocation === undefined ? "位置描述获取失败" : EndLocation));
        } else {
          arrstop.push("监控对象:" + plateNumber);
          arrstop.push("所属分组:" + assignmentName);
          arrstop.push("报警信息:" + alarmDescriptionText);
          arrstop.push("处理状态:" + alarmStatus);
          arrstop.push("处理人:" + (alarmPersonName === null ? "无" : alarmPersonName));
          arrstop.push("报警开始时间:" + (alarmStartTime === null ? "" : alarmStartTime));
          arrstop.push("报警开始坐标:" + (StartLocation === undefined ? "位置描述获取失败" : StartLocation));
          arrstop.push("报警结束时间:" + (alarmEndTime === null ? "" : alarmEndTime));
          arrstop.push("报警结束坐标:" + (EndLocation === undefined ? "位置描述获取失败" : EndLocation));
        }
        if (alarmFenceName != undefined && alarmFenceName != null && alarmFenceType != undefined && alarmFenceType != null) {
          arrstop.push("围栏名称:" + alarmFenceName);
          arrstop.push("围栏类型:" + alarmFenceType);
        }
        if (sLocation != undefined) {
          var markerAlarm = new AMap.Marker({
            map: map,
            position: [sLocation[0], sLocation[1]],//基点位置
            icon: "../../resources/img/al.svg", //marker图标，直接传递地址url
            zIndex: 9999,
            autoRotation: true
          });
          markerAlarm.content = arrstop.join("<br/>");
          markerAlarm.on('click', trackPlayback.markeralarmDatatable);
          markerAlarmList.push(markerAlarm);
        }
      }
      trackPlayback.getTable('#gpsTable3', tableSetstop);

      // 如果显示报警点未勾选  则隐藏地图报警点标识
      if (!($("#chooseAlarmPoint").is(":checked"))) {
        if (markerAlarmList.length > 0) {
          for (var i = 0; i < markerAlarmList.length; i++) {
            var markerAlarmChecked = markerAlarmList[i];
            markerAlarmChecked.hide();
          }
        }
      }
    },
    //报警点信息窗体
    markeralarmDatatable: function (e) {
      alarmPointInfoWindow.setContent(e.target.content);
      alarmPointInfoWindow.open(map, e.target.getPosition());
    },
    //获取地址栏参数
    GetAddressUrl: function (name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]);
      return null;
    },
    warningData: function () {
      $("#gpsTable3").children("tbody").children("tr").unbind("click").bind("click", function () {
        $("#gpsTable3").children("tbody").children("tr").removeClass("tableSelected");
        var alarmDataTableTrNum = $("#gpsTable3").find("tr").length;
        for (var i = 0; i < alarmDataTableTrNum; i++) {
          $(this).addClass("tableSelected");
        }
        if (markerAlarmList[markerAlarmIndex - 1] != undefined) {
          markerAlarmList[markerAlarmIndex - 1].setAnimation('AMAP_ANIMATION_NONE');
        }
        var alarmIndex = parseInt($(this).children("td:nth-child(1)").text());
        markerAlarmIndex = alarmIndex;
        markerAlarmList[alarmIndex - 1].setAnimation('AMAP_ANIMATION_BOUNCE');
        map.setCenter(markerAlarmList[alarmIndex - 1].getPosition());
      });
    },
    //日历点击报警点集合清空
    markerAlarmClear: function () {
      markerAlarmList = [];
    },
    //报警点显示隐藏执行方法
    hideAlarmPointFn: function () {
      if ($("#chooseAlarmPoint").attr("checked")) {
        $("#chooseAlarmPoint").attr("checked", false);
        layer.msg("隐藏报警点");
        if (markerAlarmList.length > 0) {
          for (var i = 0; i < markerAlarmList.length; i++) {
            var markerAlarmChecked = markerAlarmList[i];
            markerAlarmChecked.hide();
          }
        }
        alarmPointInfoWindow.close();
      } else {
        $("#chooseAlarmPoint").attr("checked", true);
        layer.msg("显示报警点");
        if (markerAlarmList.length <= 0 || markerAlarmList == null) {
          trackPlayback.alarmData();
        }
        if (markerAlarmList.length > 0) {
          for (var i = 0; i < markerAlarmList.length; i++) {
            var markerAlarmChecked = markerAlarmList[i];
            markerAlarmChecked.show();
          }
        }
      }
    },
    //停车数据点击获取数据
    showHidestopDataTrClickFn: function () {
      $("#gpsTable2 tbody tr").bind("click", function () {
        $("#gpsTable2 tbody tr").removeClass("tableSelected");
        $(this).addClass("tableSelected");
        var stopIndex = parseInt($(this).children("td:nth-child(1)").text());
        if (markerStopAnimationFlog == 1) {
          trackPlayback.markerStop(stopIndex);
        } else {
          markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_NONE');
          stopIndexs = stopIndex % 2 == 0 ? stopIndex / 2 - 1 : (stopIndex + 1) / 2 - 1;
          markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_BOUNCE');
          map.setCenter(markerStopAnimation[stopIndexs].getPosition());
        }
      });
    },
    //停止点显示隐藏
    hideStopPointFn: function () {
      isSearch = false;
      if (!($("#chooseStopPoint").attr("checked"))) {
        isAllStopPoint = true;
        markerStopAnimationFlog = 1;
        if (markerStopAnimation.length != 0) {
          markerStopAnimation[stopIndexs].setAnimation('AMAP_ANIMATION_NONE');
        }
        $("#chooseStopPoint").attr("checked", "checked");
        layer.msg("显示所有停止点");
        if (worldType == "5") {
          trackPlayback.getTable('#gpsTable5', tableSetstops, dragTableHeight);
        } else {
          trackPlayback.getTable('#gpsTable2', tableSetstops, dragTableHeight);
        }
        trackPlayback.showHidestopDataTrClickFn();
      } else {
        isAllStopPoint = false;
        markerStopAnimationFlog = 2;
        if (markerAlarmIndex != 0) {
          markerAlarmList[markerAlarmIndex - 1].setAnimation('AMAP_ANIMATION_NONE');
        }
        $("#chooseStopPoint").removeAttr("checked", "checked");
        layer.msg("隐藏所有停止点");
        if (worldType == "5") {
          trackPlayback.getTable('#gpsTable5', tableSetStopGroup, dragTableHeight);
        } else {
          trackPlayback.getTable('#gpsTable2', tableSetStopGroup, dragTableHeight);
        }
        trackPlayback.showHidestopDataTrClickFn();
      }
      if (marking !== 'run') {
        marking = 'stop';
        stopTable = 0;
        warningTable = 0;
      }
      trackPlayback.addressBindClick();
      isSearch = true;
      trackPlayback.againSearchLocation();
    },
    //查询模块
    showAreaTool: function () {
      if ($("#realTimeCanArea").hasClass("rtcaHidden")) {
        $("#realTimeCanArea").removeClass("rtcaHidden");
      } else {
        $("#realTimeCanArea").addClass("rtcaHidden");
      }
    },
    // 列表address查询
    runDataSearch: function (index) {
      if (isSearch) {
        isLastAddressDataBack = false;
        var value;
        var url = '/clbs/v/monitoring/address';
        if (marking === 'run') {
          if (runTableTime.length > 0) {


            // wjk 优化如果已经有位置信息，则跳过这一行的位置信息查询
            for (var i = runTable; i < runTableTime.length - 1; i++) {
              var n = parseInt(runTable) + 1
              if ($runTableId.find('tbody tr:nth-child(' + n + ')').find('td:nth-child(17)').text() == '点击获取位置信息'
                  || $runTableId.find('tbody tr:nth-child(' + n + ')').find('td:nth-child(16)').text() == '点击获取位置信息') {
                break;
              } else {
                runTable++;
                index++;
              }
            }


            value = runTableTime[index];
            var data = {addressReverse: value};
            $.ajax({
              type: "POST",//通常会用到两种：GET,POST。默认是：GET
              url: url,//(默认: 当前页地址) 发送请求的地址
              dataType: "json", //预期服务器返回的数据类型。"json"
              async: true, // 异步同步，true  false
              data: data,
              traditional: true,
              timeout: 8000, //超时时间设置，单位毫秒
              success: trackPlayback.runDataCallBack, //请求成功
            })
          } else {
            isLastAddressDataBack = true;
            isRunAddressLoad = true;
            marking = 'stop';
            trackPlayback.runDataSearch(0);
          }
        } else if (marking === 'stop') {
          if (!isAllStopPoint) {
            if (stopTableTime.length > 0) {


              // wjk 优化如果已经有位置信息，则跳过这一行的位置信息查询
              for (var i = stopTable; i < stopTableTime.length - 1; i++) {
                var n = parseInt(stopTable) + 1
                if ($stopTableId.find('tbody tr:nth-child(' + n + ')').find('td:nth-child(16)').text() == '点击获取位置信息') {
                  break;
                } else {
                  stopTable++;
                  index++;
                }
              }


              value = stopTableTime[index];
              var data = {addressReverse: value};
              ajax_submit("POST", url, "json", true, data, true, trackPlayback.stopDataCallBack);
            } else {
              isLastAddressDataBack = true;
              isStopAddressLoad = true;
              marking = 'warning';
              trackPlayback.runDataSearch(0);
            }
          } else { // 显示所有停车点
            if (allStopPoints.length > 0) {
              value = allStopPoints[index];
              var data = {addressReverse: value};
              ajax_submit("POST", url, "json", true, data, true, trackPlayback.stopDataCallBack);
            } else {
              isLastAddressDataBack = true;
              isStopAddressLoad = true;
              marking = 'warning';
              trackPlayback.runDataSearch(0);
            }
          }
        } else if (marking === 'warning') {
          if (warningTableTime.length > 0) {

            // wjk 优化如果已经有位置信息，则跳过这一行的位置信息查询
            for (var i = warningTable; i < warningTableTime.length - 1; i++) {
              var n = parseInt(warningTable) + 1
              if ($warningTableId.find('tbody tr:nth-child(' + n + ')').find('td:nth-child(8)').text() == '点击获取位置信息' || $warningTableId.find('tbody tr:nth-child(' + n + ')').find('td:nth-child(10)').text() == '点击获取位置信息') {
                break;
              } else {
                warningTable++;
                index++;
              }
            }

            value = warningTableTime[index][warningIndex];
            var data = {addressReverse: value};
            ajax_submit("POST", url, "json", true, data, true, trackPlayback.warningDataCallBack);
          } else {
            isLastAddressDataBack = true;
            isWarnAddressLoad = true;
            return false;
          }
        }
      }
    },
    // 行驶数据回调函数
    runDataCallBack: function (data) {
      if (!isSearchPlayBackData) { // 没有重新加载历史数据
        runTable += 1;
        if (worldType === '5') {
          $runTableId.find('tbody tr:nth-child(' + runTable + ')').find('td:nth-child(16)').text(data == '[]' ? '未定位' : data).css('color', '#5D5F63');
        } else {
          $runTableId.find('tbody tr:nth-child(' + runTable + ')').find('td:nth-child(17)').text(data == '[]' ? '未定位' : data).css('color', '#5D5F63');
        }
        if (runTable <= runTableTime.length - 1) {
          trackPlayback.runDataSearch(runTable);
        } else {
          isRunAddressLoad = true;
          marking = 'stop';
          runTable = 0;
          trackPlayback.runDataSearch(0);
        }
      }
      isLastAddressDataBack = true;
    },
    // 停止数据回调函数
    stopDataCallBack: function (data) {
      if (!isSearchPlayBackData) { // 没有重新加载历史数据
        stopTable += 1;
        $stopTableId.find('tbody tr:nth-child(' + stopTable + ')').find('td:nth-child(16)').text(data == '[]' ? '未定位' : data).css('color', '#5D5F63');
        if (isAllStopPoint) {
          if (stopTable <= allStopPoints.length - 1) {
            trackPlayback.runDataSearch(stopTable);
          } else {
            isStopAddressLoad = true;
            marking = 'warning';
            runTable = 0;
            trackPlayback.runDataSearch(0);
          }
        } else {
          if (stopTable <= stopTableTime.length - 1) {
            trackPlayback.runDataSearch(stopTable);
          } else {
            isStopAddressLoad = true;
            marking = 'warning';
            runTable = 0;
            trackPlayback.runDataSearch(0);
          }
        }
      }
      isLastAddressDataBack = true;
    },
    // 报警数据回调函数
    warningDataCallBack: function (data) {
      if (!isSearchPlayBackData) { // 没有重新加载历史数据
        if (warningTable <= warningTableTime.length - 1) {
          warningTable += 1;
          if (warningIndex === 0) {
            warningIndex += 1;
            $warningTableId.find('tbody tr:nth-child(' + warningTable + ')').find('td:nth-child(8)').text(data == '[]' ? '未定位' : data).css('color', '#5D5F63');
            warningTable -= 1;
            trackPlayback.runDataSearch(warningTable);
          } else {
            $warningTableId.find('tbody tr:nth-child(' + warningTable + ')').find('td:nth-child(10)').text(data == '[]' ? '未定位' : data).css('color', '#5D5F63');
            warningIndex = 0;
            if (warningTable <= warningTableTime.length - 1) {
              trackPlayback.runDataSearch(warningTable);
            } else {
              isWarnAddressLoad = true;
              return false;
            }
          }
        }
      }
      isLastAddressDataBack = true;
    },
    // 继续查询address
    againSearchLocation: function () {
      var index;
      if (marking === 'run') {
        index = runTable;
      } else if (marking === 'stop') {
        index = stopTable;
      } else if (marking === 'warning') {
        index = warningTable - 1;
      }
      trackPlayback.runDataSearch(index);
    },
    // 列表点击地址获取
    addressBindClick: function () {
      if (worldType === '5') {
        if ($runTableId != undefined) {
          $runTableId.find('tbody tr td:nth-child(16)').each(function () {
            if ($(this).text() === '点击获取位置信息') {
              $(this).css({'color': '#6dcff6', 'cursor': 'pointer'});
              $(this).off('click').on('click', trackPlayback.getRunAddress);
            }
          });
        }
      } else {
        if ($runTableId != undefined) {
          $runTableId.find('tbody tr td:nth-child(17)').each(function () {
            if ($(this).text() === '点击获取位置信息') {
              $(this).css({'color': '#6dcff6', 'cursor': 'pointer'});
              $(this).off('click').on('click', trackPlayback.getRunAddress);
            }
          });
        }
      }
      if ($stopTableId != undefined) {
        var $thisTd = $stopTableId.find('tbody tr td:nth-child(16)');
      }
      if ($thisTd != undefined) {
        $thisTd.each(function () {
          if ($(this).text() === '点击获取位置信息') {
            $(this).css({'color': '#6dcff6', 'cursor': 'pointer'});
            $(this).off('click').on('click', trackPlayback.getStopAddress);
          }
        });
      }
    },
    // 报警点击地址获取
    warningAddressGet: function () {
      $warningTableId.find('tbody tr td:nth-child(8)').each(function () {
        if ($(this).text() === '点击获取位置信息') {
          $(this).css({'color': '#6dcff6', 'cursor': 'pointer'});
          $(this).off('click').on('click', trackPlayback.getWarningStartAddress);
        }
      });
      $warningTableId.find('tbody tr td:nth-child(10)').each(function () {
        if ($(this).text() === '点击获取位置信息') {
          $(this).css({'color': '#6dcff6', 'cursor': 'pointer'});
          $(this).off('click').on('click', trackPlayback.getWarningEndAddress);
        }
      });
    },
    // 点击获取行驶数据address
    getRunAddress: function () {
      $thisRunTd = $(this);
      var index = $(this).parent('tr').find('td:nth-child(1)').text();
      var url = '/clbs/v/monitoring/address';
      var value = runTableTime[index - 1];
      var data = {addressReverse: value};
      ajax_submit("POST", url, "json", true, data, true, trackPlayback.runClickDataCallBack);
      event.stopPropagation();
    },
    runClickDataCallBack: function (data) {
      $thisRunTd.text(data == '[]' ? '未定位' : data).css('color', '#5D5F63');
    },
    // 点击获取停止数据address
    getStopAddress: function () {
      $thisStopTd = $(this);
      var index = $(this).parent('tr').find('td:nth-child(1)').text();
      var url = '/clbs/v/monitoring/address';
      var value;
      if (!isAllStopPoint) {
        value = stopTableTime[index - 1];
      } else {
        value = allStopPoints[index - 1];
      }
      var data = {addressReverse: value};
      ajax_submit("POST", url, "json", true, data, true, trackPlayback.stopClickDataCallBack);
      event.stopPropagation();
    },
    stopClickDataCallBack: function (data) {
      $thisStopTd.text(data).css('color', '#5D5F63');
    },
    // 点击获取报警数据开始address
    getWarningStartAddress: function () {
      $thisWarningTd = $(this);
      var index = $(this).parent('tr').find('td:nth-child(1)').text();
      var url = '/clbs/v/monitoring/address';
      var value = warningTableTime[index - 1][0];
      var data = {addressReverse: value};
      ajax_submit("POST", url, "json", true, data, true, trackPlayback.warningClickDataCallBack);
      event.stopPropagation();
    },
    // 点击获取报警数据结束address
    getWarningEndAddress: function () {
      $thisWarningTd = $(this);
      var index = $(this).parent('tr').find('td:nth-child(1)').text();
      var url = '/clbs/v/monitoring/address';
      var value = warningTableTime[index - 1][1];
      var data = {addressReverse: value};
      ajax_submit("POST", url, "json", true, data, true, trackPlayback.warningClickDataCallBack);
      event.stopPropagation();
    },
    warningClickDataCallBack: function (data) {
      $thisWarningTd.text(data).css('color', '#5D5F63');
    },
    // 表格数据导出
    exportTableData: function () {
      // 人  报警数据
      if ($("#tableAlarmDate").hasClass("active")) {
        if (worldType == "5") {
          if ($("#gpsTable3 tbody tr td").hasClass("dataTables_empty")) {
            layer.msg("列表无任何数据，无法导出");
            return;
          }
        } else {

          if ($("#warningData tbody tr td").hasClass("dataTables_empty")) {
            layer.msg("列表无任何数据，无法导出");
            return;
          }
        }
      }
      // 北斗协议的监控对象的停止数据
      if ($("#p-tableStopData").hasClass("active")) {
        if ($("#gpsTable5 tbody tr td").hasClass("dataTables_empty")) {
          layer.msg("列表无任何数据，无法导出");
          return;
        }
      }
      // 北斗协议的监控对象的行驶数据
      if ($("#p-travelData").hasClass("active")) {
        if ($("#gpsTable4 tbody tr td").hasClass("dataTables_empty")) {
          layer.msg("列表无任何数据，无法导出");
          return;
        }
      }
      //  其他协议监控对象的行驶数据
      if ($("#v-travelData").hasClass("active")) {
        if ($("#gpsTable tbody tr td").hasClass("dataTables_empty")) {
          layer.msg("列表无任何数据，无法导出");
          return;
        }
      }
      // 其他协议监控对象的停止数据
      if ($("#tableStopData").hasClass("active")) {
        if ($("#gpsTable2 tbody tr td").hasClass("dataTables_empty")) {
          layer.msg("列表无任何数据，无法导出");
          return;
        }
      }
      var id
          , monitoringObjectType
          , load = false;
      $('#myTab li').each(function () {
        if ($(this).hasClass('active')) {
          id = $(this).attr('id');
          if (id === 'v-travelData') {
            monitoringObjectType = '1';
          } else if (id === 'p-travelData') {
            monitoringObjectType = '2';
          } else if (id === 'tableStopData') {
            monitoringObjectType = '3';
          } else if (id === 'p-tableStopData') {
            monitoringObjectType = '4';
          } else if (id === 'tableAlarmDate') {
            monitoringObjectType = '5';
          }
        }
      });
      if (monitoringObjectType === '1' || monitoringObjectType === '2') {
        if (isRunAddressLoad) {
          load = true;
        }
      } else if (monitoringObjectType === '3' || monitoringObjectType === '4') {
        if (isStopAddressLoad) {
          load = true;
        }
      } else if (monitoringObjectType === '5') {
        if (isWarnAddressLoad) {
          load = true;
        }
      }
      var carID = $("#citySel").val();
      if (carID == "" || carID == undefined) {
        layer.msg(vehicleNumberChoose, {move: false});
        return false;
      }
      if (!Assembly) {
        layer.msg(trackDateNull, {move: false});
        return false;
      }
      if (load) {
        var tableID = $('#' + id).find('a').attr('href');
        trackPlayback.tableDataAssembly(tableID, monitoringObjectType);
      } else {
        layer.msg(trackDataLoading);
      }


    },
    Assemblys: function () {
      Assembly = true;
      stopDataFlag = true;
    },
    // table导出数据组装
    tableDataAssembly: function (id, monitoringObjectType) {
      var trackPlayBackValue = []
          , url = '/clbs/v/monitoring/exportTrackPlayback'
          , data;
      $(id).find('tbody tr').each(function () {
        var tdData = "";
        $(this).find('td').each(function () {
          var text = $(this).text();
          tdData += (text + ";");
        })
        trackPlayBackValue.push(tdData);
      })
      trackPlayBackValue.push(" ");
      var str = trackPlayBackValue.join("_");
      var compress = unzip(str);
      data = {
        'trackPlayBackValue': compress,
        'tableType': monitoringObjectType,
      }
      ajax_submit('POST', url, 'json', true, data, true, trackPlayback.exportDataCallback);
    },
    // 导出回调函数
    exportDataCallback: function (data) {
      if (data != "") {
        var url = "/clbs/v/monitoring/exportTrackPlaybackGet?tableType=" + data + "";
        window.location.href = url;
      } else {
        layer.msg("亲，没有数据，不能导出哦！");
        /*layer.msg(publicExportError);*/
      }
    },
    //将时间戳变成小时分秒
    changdatainfo: function (data) {
      var day = parseInt(data / (24 * 60 * 60));//计算整数天数
      var afterDay = data - day * 24 * 60 * 60;//取得算出天数后剩余的秒数
      var hour = parseInt(afterDay / (60 * 60));//计算整数小时数
      var afterHour = data - day * 24 * 60 * 60 - hour * 60 * 60;//取得算出小时数后剩余的秒数
      var min = parseInt(afterHour / 60);//计算整数分
      var afterMin = data - day * 24 * 60 * 60 - hour * 60 * 60 - min * 60;//取得算出分后剩余的秒数
      if (day != 0 && hour != 0 && min != 0) {
        var time = day + "天" + hour + "小时" + min + "分" + afterMin + "秒";
        return time;
      }
      var time = day + "天" + hour + "小时" + min + "分" + afterMin + "秒";
      if (day == 0) {
        var time = time.replace(/0天/, "");
      }
      if (hour == 0) {
        var time = time.replace(/0小时/, "");
      }
      if (min == 0) {
        var time = time.replace(/0分/, "");
      }
      return time;


    },
    //将小时分秒变成时间戳
    changedataunix: function (date) {
      var date = date.replace(/-/g, "/");
      var timestamp = new Date(date).getTime();
      timestamp = timestamp / 1000;
      return timestamp;
    },
    ajaxQueryDataFilter: function (treeId, parentNode, responseData) {
      responseData = JSON.parse(ungzip(responseData));
      return filterQueryResult(responseData, crrentSubV);
    },
    searchVehicleTree: function (param) {
      if (param == null || param == undefined || param == '') {
        bflag = true;
        // 清空搜索条件的车辆
        $('#vid').val("");
        $('#pid').val("");
        $.fn.zTree.init($("#treeDemo"), setting, null);
      } else {
        bflag = true;
        var querySetting = {
          async: {
            url: "/clbs/m/functionconfig/fence/bindfence/monitorTreeFuzzy",
            type: "post",
            enable: true,
            autoParam: ["id"],
            dataType: "json",
            otherParam: {"type": "single", "queryParam": param, "queryType": "name"},
            dataFilter: trackPlayback.ajaxQueryDataFilter
          },
          check: {
            enable: true,
            chkStyle: "radio"
          },
          view: {
            dblClickExpand: false
          },
          data: {
            simpleData: {
              enable: true
            }
          },
          callback: {
            beforeCheck: trackPlayback.zTreeBeforeCheck,
            onCheck: trackPlayback.onCheck,
            beforeClick: trackPlayback.zTreeBeforeClick,
            onAsyncSuccess: trackPlayback.zTreeOnAsyncSuccess,
            onClick: trackPlayback.zTreeOnClick,
            onExpand: trackPlayback.zTreeOnExpand,
            beforeAsync: trackPlayback.zTreeBeforeAsync,
            onNodeCreated: trackPlayback.zTreeOnNodeCreated,
          }
        };
        $.fn.zTree.init($("#treeDemo"), querySetting, null);
      }
    },
    /**
     * 选中已选的节点
     */
    checkCurrentNodes: function () {
      if (crrentSubV != null && crrentSubV != undefined && crrentSubV.length !== 0) {
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        for (var i = 0; i < crrentSubV.length; i++) {
          var list = zTreeIdJson[crrentSubV[i]];
          if (list != null && list.length > 0) {
            for (var j = 0; j < list.length; j++) {
              var value = list[j];
              var znode = treeObj.getNodeByTId(value);
              if (znode != null) {
                treeObj.checkNode(znode, true, true);
              }
            }
          }
        }
      }
    },
    // 应答
    responseSocket: function () {
      trackPlayback.isGetSocketLayout();
    },
    isGetSocketLayout: function () {
      setTimeout(function () {
        if (webSocket.conFlag) {
          webSocket.subscribe(headers, '/user/' + $("#userName").text() + '/check', trackPlayback.updateTable, "/app/vehicle/inspect", null);
        } else {
          trackPlayback.isGetSocketLayout();
        }
      }, 2000);
    },
    // 应答socket回掉函数
    updateTable: function (msg) {
      if (msg != null) {
        var json = $.parseJSON(msg.body);
        var msgData = json.data;
        if (msgData != undefined) {
          var msgId = msgData.msgHead.msgID;
          // if (msgId == 0x9300) {
          //     var dataType = msgData.msgBody.dataType;
          //     $("#msgDataType").val(dataType);
          //     $("#infoId").val(msgData.msgBody.data.infoId);
          //     $("#objectType").val(msgData.msgBody.data.objectType);
          //     $("#objectId").val(msgData.msgBody.data.objectId);
          //     $("#question").text(msgData.msgBody.data.infoContent);
          //     if (dataType == 0x9301) {
          //         $("#answer").val("");
          //         $("#msgTitle").text("平台查岗");
          //         $("#goTraceResponse").modal('show');
          //         $("#error_label").hide();
          //     }
          //     if (dataType == 0x9302) {
          //         $("#answer").val("");
          //         $("#msgTitle").text("下发平台间报文");
          //         $("#goTraceResponse").modal('show');
          //     }
          // }
        }
      }
    },
    // 应答确定
    platformMsgAck: function () {
      var answer = $("#answer").val();
      if (answer == "") {
        trackPlayback.showErrorMsg("应答不能为空", "answer");
        return;
      }
      $("#goTraceResponse").modal('hide');
      var msgDataType = $("#msgDataType").val();
      var infoId = $("#infoId").val();
      var objectType = $("#objectType").val();
      var objectId = $("#objectId").val();
      var url = "/clbs/m/connectionparamsset/platformMsgAck";
      json_ajax("POST", url, "json", false, {
        "infoId": infoId,
        "answer": answer,
        "msgDataType": msgDataType,
        "objectType": objectType,
        "objectId": objectId
      });
    },

    showErrorMsg: function (msg, inputId) {
      if ($("#error_label").is(":hidden")) {
        $("#error_label").text(msg);
        $("#error_label").insertAfter($("#" + inputId));
        $("#error_label").show();
      } else {
        $("#error_label").is(":hidden");
      }
    },
    trackBlackToReal: function () {
      var jumpFlag = false;
      var permissionUrls = $("#permissionUrls").val();
      if (permissionUrls != null && permissionUrls != undefined) {
        var urllist = permissionUrls.split(",");
        if (urllist.indexOf("/v/monitoring/realTimeMonitoring") > -1) {
          jumpFlag = true;
          location.href = "/clbs/v/monitoring/realTimeMonitoring";
        }
      }
      if (!jumpFlag) {
        layer.msg("无操作权限，请联系管理员");
      }
    },
    //地图设置显示
    showMapView: function () {
      if (!($("#mapDropSettingMenu").is(":hidden"))) {
        $("#mapDropSettingMenu").slideUp();
      } else {
        $("#mapDropSettingMenu").slideDown();
      }
    },
    mapSetting:function () {

    }
  }
  $(function () {
    $('input').inputClear().on('onClearEvent', function (e, data) {
      var id = data.id;
      if (id == 'citySel') {
        bflag = true;
        $('#vid').val("");
        $('#pid').val("");
        $.fn.zTree.init($("#treeDemo"), setting, null);
      }
      ;
      if (id == 'vFenceSearch') {
        search_ztree('vFenceTree', id, 'fence');
      }
      ;
    });
    var map;
    var playState = false;
    isFlag = false;
    trackPlayback.init();
    trackPlayback.responseSocket();
    //设置最大值
    ScrollBar.maxValue = 40000;
    //初始化
    ScrollBar.Initialize();
    //设置最大值
    ProgressBar.maxValue = 100;
    $("#toggle-left").on("click", trackPlayback.toggleBtn);
    $("#realTimeBtn .mapBtn").on("click", trackPlayback.mapBtnActive);
    $("#realTimeRC").on("click", trackPlayback.realTimeRC);
    $("#trackPlayQuery").on("click", trackPlayback.trackDataQuery);
    $("#tableStopData").on("click", trackPlayback.tableStopData);
    $("#warningData").on("click", trackPlayback.warningData);
    // 树结构模糊搜索
    $("#citySel").on('input propertychange', function (value) {
      if (inputChange !== undefined) {
        clearTimeout(inputChange);
      }
      inputChange = setTimeout(function () {
        firstFlag = false;
        var param = $("#citySel").val();
        trackPlayback.searchVehicleTree(param);
      }, 500);
    });
    // 滚动展开
    $("#treeDemo").scroll(function () {
      var zTree = $.fn.zTree.getZTreeObj("treeDemo");
      zTreeScroll(zTree, this);
    });
    $("#timeInterval").dateRangePicker(
        {
          'element': '#query',
          'dateLimit': 7
        });
    //IE9
    if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE9.0") {
      var search;
      $("#citySel").bind("focus", function () {
        search = setInterval(function () {
          var param = $("#citySel").val();
          trackPlayback.searchVehicleTree(param);
        }, 500);
      }).bind("blur", function () {
        clearInterval(search);
      });
    }
    //IE9 end
    $("#goRealTime").mouseover(function () {
      $(this).css({
        "color": "#6dcff6"
      }).children("a").css("color", "#6dcff6");
    }).mouseout(function () {
      $(this).css({
        "color": "#767676"
      }).children("a").css("color", "#767676");
    });
    $("#goHidden").on("click", trackPlayback.leftToolBarHideFn);
    $("#goShow").on("click", trackPlayback.leftToolBarShowFn);
    $("#setMap").on("click", trackPlayback.satelliteMapSwitching);
    $("#retreatAnimation").on("click", trackPlayback.retreatAnimation);
    $("#startAnimation").on("click", trackPlayback.startAnimation);
    $("#FFAnimation").on("click", trackPlayback.FFAnimation);
    $("#addFenceBtn").on("click", trackPlayback.addLineFence);
    $("#hideDialog").on("click", trackPlayback.hideDialog);
    $("#searchCarClose").on("click", trackPlayback.searchCarClose);
    $("#playIcon").on("click", trackPlayback.continueAnimation);
    //区域查车
    $("#specialTimePlayBack").on("click", trackPlayback.toolClickList);
    $("#p-travelData").on("click", trackPlayback.peopleTravelDataClick);
    $("#tableAlarmDate").on("click", trackPlayback.tableAlarmDateClick);
    $("#v-travelData").on("click", trackPlayback.vehicleTravelData);
    $("#p-tableStopData").on("click", trackPlayback.peopleTableStopDataClick);
    //报警点
    $("#chooseAlarmPoint").on("click", trackPlayback.hideAlarmPointFn);
    //停止点
    $("#chooseStopPoint").on("click", trackPlayback.hideStopPointFn);
    $(".areaTool").on("click", trackPlayback.showAreaTool);
    setTimeout(function () {
      $(document).scrollTop(0);
    }, 1000);
    // 数据表格导出
    $('#tableDataExport').on('click', trackPlayback.exportTableData);
    $("#vFenceSearch").bind('input oninput', trackPlayback.vsearchFenceCarSearch);
    $("#fenceToolBtn").on("click", trackPlayback.fenceToolClickSHFn);
    // 应答确定
    $('#parametersResponse').on('click', trackPlayback.platformMsgAck);
    // 跳转至实时监控
    $("#trackBlackToReal").on("click", trackPlayback.trackBlackToReal);

    //地图设置
    $("#mapDropSetting").on("click", trackPlayback.showMapView);
    //谷歌地图
    $("#googleMap").on('click',trackPlayback.showGoogleMapLayers);
  });
}($, window))
