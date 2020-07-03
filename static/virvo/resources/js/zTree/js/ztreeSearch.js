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
    }
    else if (type == "station") {
    	highlightNodes = treeObj.getNodesByFilter(monitorParamFuzzyFilter); 
        allNodes = treeObj.getNodesByParam("type",type, null); // 所有type型nodes
    	
	}else{
		highlightNodes = treeObj.getNodesByParamFuzzy("name", searchCondition, null); // 满足搜索条件的节点
        allNodes = treeObj.getNodesByParam("type",type, null); // 所有type型nodes
	}    
    if (searchCondition != "") {
    	searchParam = searchCondition;
        if (type == "group" ) {  // 企业
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
        }else if (type == "vehicle"){
        	treeObj.hideNodes(allNodes)
            treeObj.showNodes(highlightNodes);
            treeObj.expandAll(true);
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
	return (node.type == "station" && node.name.indexOf(searchParam) > -1) || 
			(node.type == "people" && node.name.indexOf(searchParam) > -1) ||
			(node.professional != undefined && node.professional != null && node.professional.indexOf(searchParam) > -1) ||
			(node.simcardNumber != undefined && node.simcardNumber != null && node.simcardNumber.indexOf(searchParam) > -1) || 
			(node.assignName != undefined && node.assignName != null && node.assignName.indexOf(searchParam) > -1) || 
			(node.deviceNumber != undefined && node.deviceNumber != null && node.deviceNumber.indexOf(searchParam) > -1)
}

function monitorFilter(node){ // 搜索type等于人或者车
	return node.type == "station" || node.type == "people" 
}

function monitorParamFuzzyFilter(node){ // 模糊匹配name,type等于人或者车
	return (node.type == "station" && node.name.indexOf(searchParam) > -1) || (node.type == "people" && node.name.indexOf(searchParam) > -1)
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
    return (node.type == "station" || node.type == "people")&&node.isHidden===false;
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
    //	var allNodes1 = treeObj.transformToArray(treeObj.getNodes()); // 所有节点
//    	treeObj.hideNodes(allNodes)
    	treeObj.showNodes(allNodes)
        treeObj.expandAll(true);
    }
    //<3>.高亮显示并展示【指定节点s】
    // highlightAndExpand_ztree(treeId, highlightNodes, flag);
}

function searchTypeFilter(node){ // 模糊搜索从业人员，终端编号
	var value = node[''+searchTypeValue+''];
	return ((node.type == "station" || node.type == "people") && value != undefined && value != null && value.indexOf(searchParam) > -1)
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
            	if ((node.type == "station" || node.type == "people") && value != undefined && value != null && value.indexOf(searchParam) > -1) {
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
//        	var value = node[''+searchType+''];
        	if ((node.type === "station" || node.type === "people") ) {
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
    return type === "station" || type === "people";
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