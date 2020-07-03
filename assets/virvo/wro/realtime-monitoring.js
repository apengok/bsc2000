/*!
 * Distpicker v1.0.4
 * https://github.com/fengyuanchen/distpicker
 *
 * Copyright (c) 2014-2016 Fengyuan Chen
 * Released under the MIT license
 *
 * Date: 2016-06-01T15:05:52.606Z
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define(['jquery', 'ChineseDistricts'], factory);
  } else if (typeof exports === 'object') {
    // Node / CommonJS
    factory(require('jquery'), require('ChineseDistricts'));
  } else {
    // Browser globals.
    factory(jQuery, ChineseDistricts);
  }
})(function ($, ChineseDistricts) {

  'use strict';

  if (typeof ChineseDistricts === 'undefined') {
    throw new Error('The file "distpicker.data.js" must be included first!');
  }

  var NAMESPACE = 'distpicker';
  var EVENT_CHANGE = 'change.' + NAMESPACE;
  var PROVINCE = 'province';
  var CIRY = 'city';
  var DISTRICT = 'district';

  function Distpicker(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Distpicker.DEFAULTS, $.isPlainObject(options) && options);
    this.placeholders = $.extend({}, Distpicker.DEFAULTS);
    this.active = false;
    this.init();
  }

  Distpicker.prototype = {
    constructor: Distpicker,

    init: function () {
      var options = this.options;
      var $select = this.$element.find('select');
      var length = $select.length;
      var data = {};

      $select.each(function () {
        $.extend(data, $(this).data());
      });

      $.each([PROVINCE, CIRY, DISTRICT], $.proxy(function (i, type) {
        if (data[type]) {
          options[type] = data[type];
          this['$' + type] = $select.filter('[data-' + type + ']');
        } else {
          this['$' + type] = length > i ? $select.eq(i) : null;
        }
      }, this));

      this.bind();

      // Reset all the selects (after event binding)
      this.reset();

      this.active = true;
    },

    bind: function () {
      if (this.$province) {
        this.$province.on(EVENT_CHANGE, (this._changeProvince = $.proxy(function () {
          this.output(CIRY);
          this.output(DISTRICT);
        }, this)));
      }

      if (this.$city) {
        this.$city.on(EVENT_CHANGE, (this._changeCity = $.proxy(function () {
          this.output(DISTRICT);
        }, this)));
      }
    },

    unbind: function () {
      if (this.$province) {
        this.$province.off(EVENT_CHANGE, this._changeProvince);
      }

      if (this.$city) {
        this.$city.off(EVENT_CHANGE, this._changeCity);
      }
    },

    output: function (type) {
      var options = this.options;
      var placeholders = this.placeholders;
      var $select = this['$' + type];
      var districts = {};
      var data = [];
      var code;
      var matched;
      var value;

      if (!$select || !$select.length) {
        return;
      }

      value = options[type];

      code = (
        type === PROVINCE ? 86 :
        type === CIRY ? this.$province && this.$province.find(':selected').data('code') :
        type === DISTRICT ? this.$city && this.$city.find(':selected').data('code') : code
      );

      districts = $.isNumeric(code) ? ChineseDistricts[code] : null;

      if ($.isPlainObject(districts)) {
        $.each(districts, function (code, address) {
          var selected = address === value;

          if (selected) {
            matched = true;
          }

          data.push({
            code: code,
            address: address,
            selected: selected
          });
        });
      }

      if (!matched) {
        if (data.length && (options.autoSelect || options.autoselect)) {
          data[0].selected = true;
        }

        // Save the unmatched value as a placeholder at the first output
        if (!this.active && value) {
          placeholders[type] = value;
        }
      }

      // Add placeholder option
      if (options.placeholder) {
        data.unshift({
          code: '',
          address: placeholders[type],
          selected: false
        });
      }

      $select.html(this.getList(data));
    },

    getList: function (data) {
      var list = [];

      $.each(data, function (i, n) {
        list.push(
          '<option' +
          ' value="' + (n.address && n.code ? n.address : '') + '"' +
          ' data-code="' + (n.code || '') + '"' +
          (n.selected ? ' selected' : '') +
          '>' +
            (n.address || '') +
          '</option>'
        );
      });

      return list.join('');
    },

    reset: function (deep) {
      if (!deep) {
        this.output(PROVINCE);
        this.output(CIRY);
        this.output(DISTRICT);
      } else if (this.$province) {
        this.$province.find(':first').prop('selected', true).trigger(EVENT_CHANGE);
      }
    },

    destroy: function () {
      this.unbind();
      this.$element.removeData(NAMESPACE);
    }
  };

  Distpicker.DEFAULTS = {
    autoSelect: false,
    placeholder: true,
    province: '—— 省 ——',
    city: '—— 市 ——',
    district: '—— 区 ——'
  };

  Distpicker.setDefaults = function (options) {
    $.extend(Distpicker.DEFAULTS, options);
  };

  // Save the other distpicker
  Distpicker.other = $.fn.distpicker;

  // Register as jQuery plugin
  $.fn.distpicker = function (option) {
    var args = [].slice.call(arguments, 1);

    return this.each(function () {
      var $this = $(this);
      var data = $this.data(NAMESPACE);
      var options;
      var fn;

      if (!data) {
        if (/destroy/.test(option)) {
          return;
        }

        options = $.extend({}, $this.data(), $.isPlainObject(option) && option);
        $this.data(NAMESPACE, (data = new Distpicker(this, options)));
      }

      if (typeof option === 'string' && $.isFunction(fn = data[option])) {
        fn.apply(data, args);
      }
    });
  };

  $.fn.distpicker.Constructor = Distpicker;
  $.fn.distpicker.setDefaults = Distpicker.setDefaults;

  // No conflict
  $.fn.distpicker.noConflict = function () {
    $.fn.distpicker = Distpicker.other;
    return this;
  };

  $(function () {
    $('[data-toggle="distpicker"]').distpicker();
  });
});

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
var m_vehId;
var m_vehLic;
var m_vehChannel;
var m_vehColor;
var m_deviceNo;
var m_streamType;       // 0-主码流，1-子码流
var m_timeBarString;    // 时间轴的搜索结果
var m_videoFlag = 0;  //标识视频窗口是否打开
var m_imgFlag = 0;    //标识是否多通道同时抓图
var m_trans = 0;
var m_videoHost;
var m_videoPort;
var m_isVideo = 0;
var m_func;
var m_usec;
var m_vcid = [];
var m_voiceid;
var m_stime = [];
var m_riskNumber;
var m_vuuid;
var taskList = {};
var channels = [1, 5, 6, 7, 8]; // 1 5 6 7 - 视频通道, 8 - 音频通道
$(function () {
  m_videoHost = $("#videoHost").val();
  m_videoPort = $("#videoPort").val();
});

realTimeVideo = {

  generalTransNo: function () {
    m_trans = m_trans + 1;
    return m_trans;
  },
  getVideoOcx: function () {
    return document.getElementById("videoplayer");
  },
  //设置视频铺满窗口
  windowSet: function () {
    var cmdstr = '{"PARAM":{"WINNAME":"PREVIEW","VSMODE":2}}';
    realTimeVideo.getVideoOcx().WindowSet(cmdstr);
  },
  //查询是否IE浏览器
  ieExplorer: function () {
    var explorer = window.navigator.userAgent;
    var result = false;
    if (explorer.indexOf("MSIE") !== -1) {
      result = true;
    }
    return result;
  },
  downloadVideoOcx: function () {
    if (!realTimeVideo.ieExplorer()) {
      layer.alert("请使用IE浏览器才能观看视频哦");
    }
    /*if(realTimeVideo.getVideoOcx().object == null) {
        layer.alert("视频插件加载失败，请先下载安装插件<br>请不要使用迅雷下载", {btn : ['确定', '取消']},
        function(){location.href="/clbs/file/videoOcx/videocx.exe";layer.closeAll();},
        function(){layer.msg('取消');} );
    } */
  },
  showtask: function (strmsg) {
    var obj = document.getElementById("taskmsg");
    obj.innerHTML = "视频控件功能演示，当前业务：" + strmsg
  },
  showmsg: function (strmsg) {
    var obj = document.getElementById("locmsg");
    obj.innerHTML = strmsg + '<br>' + obj.innerHTML;
  },
  //设置车辆信息
  setVehicleInfo: function (vehicleParam) {
    var param = vehicleParam;
    m_vehLic = param.brand;
    m_streamType = 1;
    m_vehColor = parseInt(param.plateColor);
    m_deviceNo = param.deviceNumber;
    m_vehId = 0;
    m_isVideo = param.isVideo;
    m_func = param.func;
    m_usec = param.usec;
    m_riskNumber = param.riskNumber;
    m_vuuid = param.vuuid;
    //视频窗口打开才请求视频
    // if (m_func === 1 && realTimeVideo.ieExplorer()) {
    //     realTimeVideo.windowSet();
    //     realTimeVideo.beventLiveView();
    // } else if (m_func === 3) {
    //     realTimeVideo.beventLiveIpTalk();
    // }

    // if(m_videoFlag==1 && realTimeVideo.ieExplorer()){
    //  realTimeVideo.windowSet();
    //  // realTimeVideo.beventLiveView();

    //  // wjk
    //  realTimeVideo.beventLiveView(pageLayout.computingTimeIntFun);
    // }
  },
  //getchn：0 - 不用取通道号，1 - 取通道号
  // getstreamtype：0 - 不用取码流类型，1 - 取码流类型
  getVehicleInfo: function (getchn, getstreamtype) {
    var cmd = {
      VEHICLELICENSE: m_vehLic,
      PLATECOLOR: m_vehColor,
      DEVICENO: m_deviceNo,
      VEHICLEID: 0
    };
    if (getstreamtype === 1) {
      cmd.STREAMTYPE = m_streamType;
    }
    return cmd;
  },
  openVideo: function (vehicleInfo) {
    realTimeVideo.setVehicleInfo(vehicleInfo);
    realTimeVideo.windowSet();
    realTimeVideo.beventLiveView();
  },
  closeVideo: function (channel) {
    if (channel !== 0) {
      realTimeVideo.beventMediaStop(channel);
      return;
    }
    for (var i = 0; i < 4; i++) {
      realTimeVideo.beventMediaStop(channels[i]);
    }
  },
  openAudio: function (vehicleInfo) {
    realTimeVideo.setVehicleInfo(vehicleInfo);
    realTimeVideo.beventLiveIpTalk();
  },
  closeAudio: function () {
    realTimeVideo.beventMediaStop(8);
  },
  getRestChannels: function (channel) {
    var restChannels = [];
    if (!channel) {
      return restChannels;
    }

    for (var i = 0; i < 4; i++) {
      if (channels[i] === channel) {
        continue;
      }
      restChannels.push(channels[i]);
    }
    return restChannels;
  },
  // streamType: 0 - 不用取码流类型，1 - 取码流类型
  // dataType： 0 - 音视频，1 - 视频，2 - 双向对讲，3 - 监听
  // channelNumber: 通道号
  getVideoCmdStr: function (streamType, dataType, channelNumber) {
    var cmd = realTimeVideo.getCmd(streamType, dataType, channelNumber);
    cmd.DEVICETYPE = 0; // 锐明视频设备
    return JSON.stringify(cmd);
  },
  getAudioCmdStr: function (streamType, dataType, channelNumber) {
    var cmd = realTimeVideo.getCmd(streamType, dataType, channelNumber);
    cmd.DEVICETYPE = 53248; // 锐明音频设备
    cmd.STOREMEDIAFLAG = 0;
    // cmd.ALARMUUID = combat.alarmUUID;
    cmd.ALARMUUID = new Date().getTime()
    return JSON.stringify(cmd);
  },
  getCmd: function (streamType, dataType, channelNumber) {
    var cmd = {
      VEHICLELICENSE: m_vehLic,
      PLATECOLOR: m_vehColor,
      DEVICENO: m_deviceNo,
      VEHICLEID: 0,
      DATATYPE: dataType,
      RECORDFLAG: 0,
      CHANNEL: channelNumber
    };
    if (streamType === 1) {
      cmd.STREAMTYPE = m_streamType;
    }
    return cmd;
  },
  //直通业务, taskType：0 - 直通预览(音视频)，1 - 直通预览(仅视频)，2 - 对讲，3 - 监听
  beventLiveTask: function (taskType) { //wjk,回调定时器函数设置时间限制 ,callback 先注释掉
    //判断打开视频窗口是否有车辆信息
    if (typeof(m_vehLic) === "undefined") {
      return;
    }
    if (m_isVideo === 0) {
      layer.alert("当前设备未有视频哦");
      return;
    }
    var cmdList = [];
    if (m_usec === 0) {
      for (var i = 0; i < 4; i++) {
        var channel = channels[i];
        if (taskList[channel]) {
          // 如果该通道已经打开，则跳过，不重复打开
          continue;
        }
        var cmdStr = realTimeVideo.getVideoCmdStr(1, taskType, channels[i]);
        var taskId = realTimeVideo.generalTransNo();

        cmdList.push({taskId: taskId, cmdStr: cmdStr});
        m_vcid.push(taskId);
        taskList[channel] = taskId; // 记录通道号对应的任务id
      }
    } else if (m_usec === 8) {
      cmdStr = realTimeVideo.getAudioCmdStr(1, taskType, m_usec);
      taskId = realTimeVideo.generalTransNo();

      cmdList.push({taskId: taskId, cmdStr: cmdStr});
      m_voiceid = taskId;
      taskList[m_usec] = taskId; // 记录通道号对应的任务id
    } else {
      cmdStr = realTimeVideo.getVideoCmdStr(1, taskType, m_usec);
      taskId = realTimeVideo.generalTransNo();

      cmdList.push({taskId: taskId, cmdStr: cmdStr});
      m_vcid.push(taskId);
      taskList[m_usec] = taskId; // 记录通道号对应的任务id
    }
    var n = cmdList.length;
    for (i = 0; i < n; i++) {
      var retv = realTimeVideo.getVideoOcx().StartLiveTask(cmdList[i].taskId, m_videoHost, m_videoPort, cmdList[i].cmdStr);
      if (retv !== 0) {
        if (retv.toString(16) === "80f00003") {
          //layer.alert("请不要重复请求音频服务");
          realTimeVideo.showtask("");
        } else {
          layer.alert("开始实时音视频业务失败，错误号码:0x" + retv.toString(16));
        }
      }
    }
    // wjk
    // 先注释掉
    // if (callback) {
    //  callback()
    // }
  },
  //根据任务号抓取图片
  snapAPicture: function (trans_no) {
    if (trans_no === 0) {
      layer.alert("还没开始视频，不能抓图哦");
      return;
    }
    if (m_imgFlag === 1) {//抓取所有通道图片
      var channelStr = "",
          channelError = "",
          message = "",
          transNo,
          retv;
      for (var i = 0; i < 4; i++) {
        transNo = i + 1;
        retv = realTimeVideo.cmdPictureParam(transNo);
        if (retv === "0") {
          channelStr += "," + transNo;
        } else {
          channelError += "," + transNo;
        }
        //组织抓取图片提示语言
        message = "";
        if (channelStr !== "") {
          message += "已成功抓取【" + channelStr.substring(1) + "】通道图片\n";
        }
        if (channelError !== "") {
          message += "抓取失败【" + channelError.substring(1) + "】通道图片，请确定视频请求成功了吗";
        }
        layer.alert(message);
      }
    } else { //抓取当前通道图片
      retv = realTimeVideo.cmdPictureParam(trans_no);
      if (retv === "0") {
        layer.alert("抓图成功,已存在" + $("#photoPath").val() + "目录");
      } else {
        layer.alert("请确定视频请求成功了吗");
      }
    }
    //realTimeVideo.showmsg('ScreenControl() return 0x' + retv.toString(16));
  },
  //执行抓图命令
  cmdPictureParam: function (trans_no) {
    var myDate = new Date();
    var strTime = "" + parseInt(myDate.getMonth() + 1) + myDate.getDate() + myDate.getHours() + myDate.getMinutes() + myDate.getSeconds();
    var path = $("#photoPath").val();
    var fileName = '"' + path + '/' + m_vehLic + '-' + strTime + '[' + trans_no + '].bmp"';
    var cmdstr = '{"DISPLAY":"' + m_vehLic + '","CAPWAY":2,"TIME":1,"SAVETO":' + fileName + '}';
    return realTimeVideo.getVideoOcx().ScreenControl(trans_no, 0x10000E, cmdstr);
  },

  //录像
  saveVidio: function (type) {

    var myDate = new Date();
    if (type === 1) {
      m_stime = [];
    }
    var strTime = "" + parseInt(myDate.getMonth() + 1) + myDate.getDate() + myDate.getHours() + myDate.getMinutes() + myDate.getSeconds();
    for (var i = 0; i < m_vcid.length; i++) {
      var fileName = '"C:/clbsVideo/' + m_riskNumber + '/' + m_vuuid + '/' + strTime + '[' + m_vcid[i] + '].avi"';
      if (type === 1) {
        m_stime.push(fileName.substring(65, fileName.length - 1))
      }
      var cmdstr = '{"VEHICLELICENSE":"' + m_vehLic + '","PLATECOLOR":2,"DEVICENO":"' + m_deviceNo + '","VEHICLEID":0,"CHANNEL":' + m_vcid[i] + ',"SAVETO":' + fileName + ',"STATE":' + type + '}';
      realTimeVideo.getVideoOcx().ScreenControl(m_vcid[i], 0x100013, cmdstr);
    }
  },

  //录音
  saveVoice: function (type) {
    var myDate = new Date();
    var strTime = "" + parseInt(myDate.getMonth() + 1) + myDate.getDate() + myDate.getHours() + myDate.getMinutes() + myDate.getSeconds();
    var fileName = '"' + path + '/' + m_vehLic + '-' + strTime + '[' + trans_no + '].avi"';
    var cmdstr = '{"VEHICLELICENSE":"' + m_vehLic + '","PLATECOLOR":2,"DEVICENO":"' + m_deviceNo + '","VEHICLEID":0,"CHANNEL":' + trans_no + ',"SAVETO":' + fileName + ',"STATE":"' + type + '"}';
    return realTimeVideo.getVideoOcx().ScreenControl($("#channel").val(), 0x100015, cmdstr);
  },

  //imgFlag标识是否多通道抓图:1多通道(用于页面下抓图按钮)，0单通道(用于窗口上的抓图按钮)
  beventCapture: function () {
    realTimeVideo.snapAPicture(m_trans);

  },
  //直通预览
  beventLiveView: function (callback) { //wjk ,加一个回调
    m_vcid = [];
    m_usec = 0;
    realTimeVideo.showtask("直通预览");
    realTimeVideo.beventLiveTask(0, callback);
  },
  // 监听，需要用到通道
  beventLiveMonitor: function () {
    realTimeVideo.showtask("监听");
    realTimeVideo.beventLiveTask(3);
  },
  //对讲，和通道无关
  beventLiveIpTalk: function (callback) { //wjk 加回调定时器
    m_usec = 8;
    realTimeVideo.showtask("对讲");
    realTimeVideo.beventLiveTask(2, callback);
  },
  //由于使用了固定的m_trans，所以在调用此接口之前，不能对m_trans的值进行改变
  //channel: 通道号 1 5 6 7 - 视频通道, 8 - 音频通道
  beventMediaStop: function (channel) {
    var taskId = taskList[channel];
    if (!taskId) {
      return;
    }
    var retv = realTimeVideo.getVideoOcx().StopMediaTask(taskId);
    realTimeVideo.showtask("");
    realTimeVideo.showmsg('StopMediaTask() return 0x' + retv.toString(16));

    if (retv === 0) {
      delete taskList[channel];
    }
  },
  //停止所有媒体业务，这里采用直接关闭。如果要异步关闭，则传入0并处理关闭事件，在关闭事件中进行视频关闭
  beventAllMediaStop: function () {
    if (realTimeVideo.getVideoOcx().CloseAllMedia) {
      var retv = realTimeVideo.getVideoOcx().CloseAllMedia(1);
      realTimeVideo.showtask("");
      realTimeVideo.showmsg('CloseAllMedia() return 0x' + retv.toString(16));
    }

    m_trans = 0;
    for (var i = 0; i < 5; i++) {
      delete taskList[channels[i]];
    }
  },
  video_event: function (msg_type, trans_no, data_type, server_ip, server_port, cmd_str, cmd_len) {

    switch (msg_type) {
        // 响应视频窗口右键菜单中的打开声音命令
      case 0x100001:
        realTimeVideo.getVideoOcx().OpenSound();
        break;

        // 响应视频窗口右键菜单中的关闭声音命令
      case 0x100002:
        realTimeVideo.getVideoOcx().CloseSound();
        break;

        // 响应视频窗口右键菜单中的关闭视频或者视频窗口右上角的“x”号，用于关闭一个视频
      case 0x100007:
        realTimeVideo.getVideoOcx().StopMediaTask(trans_no);
        break;

        // 抓图，需要调用抓图接口开始抓图
      case 0x10000E:
        m_imgFlag = 0; //标识当前通道抓图
        //$("#videoPhotograph").modal('show');
        realTimeVideo.snapAPicture(trans_no);
        break;
      case 0x100015:
        layer.alert("系统暂不支持此功能");
        break;
      default:
        break;

    }
  }
};
$("#btnPhotoWindow").click(function () {
  m_imgFlag = 1; //标识启动多通道抓图
});
$("#btnPhoto").click(function () {
  realTimeVideo.beventCapture(); //调用抓图
});

var travelLineList, AdministrativeRegionsList, fenceIdList,
    administrativeAreaFence = [], district, googleMapLayer, buildings, satellLayer, realTimeTraffic, map, logoWidth,
    btnIconWidth, windowWidth,
    newwidth, els, oldMapHeight, myTabHeight, wHeight, tableHeight, mapHeight, newMapHeight, winHeight, headerHeight,
    dbclickCheckedId, oldDbclickCheckedId,
    onClickVId, oldOnClickVId, zTree, clickStateChar, logTime, operationLogLength, licensePlateInformation,
    groupIconSkin, markerListT = [], markerRealTimeT,
    zoom = 18, requestStrS, cheakNodec = [], realTimeSet = [], alarmSet = [], neverOline = [], lineVid = [],
    zTreeIdJson = {}, cheakdiyuealls = [], lineAr = [],
    lineAs = [], lineAa = [], lineAm = [], lineOs = [], changeMiss = [], diyueall = [], params = [], lineV = [],
    lineHb = [], cluster, fixedPoint = null, fixedPointPosition = null,
    flog = true, mapVehicleTimeW, mapVehicleTimeQ, markerMap, mapflog, mapVehicleNum, infoWindow, paths = null,
    uptFlag = true, flagState = true,
    videoHeight, addaskQuestionsIndex = 2, dbClickHeighlight = false, checkedVehicles = [], runVidArray = [],
    stopVidArray = [], msStartTime, msEndTime,
    videoTimeIndex, voiceTimeIndex, charFlag = true, fanceID = "", newCount = 1, mouseTool, mouseToolEdit,
    clickRectangleFlag = false, isAddFlag = false, isAreaSearchFlag = false, isDistanceCount = false, fenceIDMap,
    PolyEditorMap,
    sectionPointMarkerMap, fenceSectionPointMap, travelLineMap, fenceCheckLength = 0, amendCircle, amendPolygon,
    amendLine, polyFence, changeArray, trid = [], parametersID, brand, clickFenceCount = 0,
    clickLogCount = 0, fenceIdArray = [], fenceOpenArray = [], save, moveMarkerBackData, moveMarkerFenceId,
    monitoringObjMapHeight, carNameMarkerContentMap, carNameMarkerMap, carNameContentLUMap,
    lineSpotMap, isEdit = true, sectionMarkerPointArray, stateName = [], stateIndex = 1, alarmName = [], alarmIndex = 1,
    activeIndex = 1, queryFenceId = [], crrentSubV = [], crrentSubName = [],
    suFlag = true, administrationMap, lineRoute, contextMenu, dragPointMarkerMap, isAddDragRoute = false,
    misstype = false, misstypes = false, alarmString, saveFenceName, saveFenceType, alarmSub = 0, cancelList = [],
    hasBegun = [],
    isDragRouteFlag = false, flagSwitching = true, isCarNameShow = true, notExpandNodeInit, vinfoWindwosClickVid,
    $myTab = $("#myTab"), $MapContainer = $("#MapContainer"), $panDefLeft = $("#panDefLeft"),
    $contentLeft = $("#content-left"), $contentRight = $("#content-right"), $sidebar = $(".sidebar"),
    $mainContentWrapper = $(".main-content-wrapper"), $thetree = $("#thetree"),
    $realTimeRC = $("#realTimeRC"), $goShow = $("#goShow"), $chooseRun = $("#chooseRun"), $chooseNot = $("#chooseNot"),
    $chooseAlam = $("#chooseAlam"), $chooseStop = $("#chooseStop"),
    $chooseOverSeep = $("#chooseOverSeep"), $online = $("#online"), $chooseMiss = $("#chooseMiss"),
    $scrollBar = $("#scrollBar"), $mapPaddCon = $(".mapPaddCon"), $realTimeVideoReal = $(".realTimeVideoReal"),
    $realTimeStateTableList = $("#realTimeStateTable"), $alarmTable = $("#alarmTable"), $logging = $("#logging"),
    $showAlarmWinMark = $("#showAlarmWinMark"), $alarmFlashesSpan = $(".alarmFlashes span"),
    $alarmSoundSpan = $(".alarmSound span"), $alarmMsgBox = $("#alarmMsgBox"), $alarmSoundFont = $(".alarmSound font"),
    $alarmFlashesFont = $(".alarmFlashes font"), $alarmMsgAutoOff = $("#alarmMsgAutoOff"),
    rMenu = $("#rMenu"), alarmNum = 0, carAddress, msgSNAck, setting, ztreeStyleDbclick,
    $tableCarAll = $("#table-car-all"), $tableCarOnline = $("#table-car-online"),
    $tableCarOffline = $("#table-car-offline"),
    $tableCarRun = $("#table-car-run"), $tableCarStop = $("#table-car-stop"),
    $tableCarOnlinePercent = $("#table-car-online-percent"), longDeviceType, tapingTime, loadInitNowDate = new Date(),
    loadInitTime,drivingState,
    checkFlag = false, fenceZTreeIdJson = {}, fenceSize, bindFenceSetChar, fenceInputChange, scorllDefaultTreeTop,
    stompClientOriginal = null, stompClientSocket = null, hostUrl, DblclickName, objAddressIsTrue = [];
// wjk 实时视频时间定时器
var computingTimeInt;
var computingTimeCallInt;
// var VideoOrPhoneCall = 0; // 0 通话视频无，1视频，2通话，3都有

var markerViewingArea;
var markerOutside;
var markerAllUpdateData;
var isCluster = false; // 是否集合
var markerFocus; // 聚焦跟踪id
var isAreaSearch = false; // 是否区域查询
var callTheRollId; // 点名车辆ID
var markerClickLngLat = null; // 点击监控对象图标后，获取经纬度

//图标向上标记
var icoUpFlag;
var pageLayout = {
        // 页面布局
        init: function () {
            var url = "/clbs/v/monitoring/getHost";
            ajax_submit("POST", url, "json", true, {}, true, function (data) {
                hostUrl = 'http://' + data.obj.host + '/f3/sockjs/webSocket';
            });
            winHeight = $(window).height();//可视区域高度
            headerHeight = $("#header").height();//头部高度
            var tabHeight = $myTab.height();//信息列表table选项卡高度
            var tabContHeight = $("#myTabContent").height();//table表头高度
            var fenceTreeHeight = winHeight - 193;//围栏树高度
            $("#fenceZtree").css('height', fenceTreeHeight + "px");//电子围栏树高度
            //地图高度
            newMapHeight = winHeight - headerHeight - tabHeight - 10;
            $MapContainer.css({
                "height": newMapHeight + 'px'
            });
            //车辆树高度
            var newContLeftH = winHeight - headerHeight;
            //sidebar高度
            $(".sidebar").css('height', newContLeftH + 'px');
            //计算顶部logo相关padding
            logoWidth = $("#header .brand").width();
            btnIconWidth = $("#header .toggle-navigation").width();
            windowWidth = $(window).width();
            newwidth = (logoWidth + btnIconWidth + 46) / windowWidth * 100;
            //左右自适应宽度
            $contentLeft.css({
                "width": newwidth + "%"
            });
            $contentRight.css({
                "width": 100 - newwidth + "%"
            });
            //加载时隐藏left同时计算宽度
            $sidebar.attr("class", "sidebar sidebar-toggle");
//        $mainContentWrapper.attr("class", "main-content-wrapper main-content-toggle-left");
            //操作树高度自适应
            var newTreeH = winHeight - headerHeight - 203;
            $thetree.css({
                "height": newTreeH + "px"
            });
            //视频区域自适应
            var mainContentHeight = $contentLeft.height();
            var adjustHeight = $(".adjust-area").height();
            videoHeight = (mainContentHeight - adjustHeight - 65) / 2;
            $(".videoArea").css("height", videoHeight + "px");
            //地图拖动改变大小
            oldMapHeight = $MapContainer.height();
            myTabHeight = $myTab.height();
            wHeight = $(window).height();
            // 页面区域定位
            $(".amap-logo").attr("href", "javascript:void(0)").attr("target", "");
            // 监听浏览器窗口大小变化
            var sWidth = $(window).width();
            if (sWidth < 1200) {
                $("body").css("overflow", "auto");
                $("#content-left,#panDefLeft").css("height", "auto");
                $panDefLeft.css("margin-bottom", "0px");
                if (sWidth <= 414) {
                    $sidebar.removeClass("sidebar-toggle");
                    $mainContentWrapper.removeClass("main-content-toggle-left");
                }
            } else {
                $("body").css("overflow", "hidden");
            }
            ;
            window.onresize = function () {
                winHeight = $(window).height();//可视区域高度
                headerHeight = $("#header").height();//头部高度
                var tabHeight = $myTab.height();//信息列表table选项卡高度
                var tabContHeight = $("#myTabContent").height();//table表头高度
                var fenceTreeHeight = winHeight - 193;//围栏树高度
                $("#fenceZtree").css('height', fenceTreeHeight + "px");//电子围栏树高度
                //地图高度
                newMapHeight = winHeight - headerHeight - tabHeight - 10;
                $MapContainer.css({
                    "height": newMapHeight + 'px'
                });
                //车辆树高度
                var newContLeftH = winHeight - headerHeight;
                //sidebar高度
                $(".sidebar").css('height', newContLeftH + 'px');
                //计算顶部logo相关padding
                logoWidth = $("#header .brand").width();
                btnIconWidth = $("#header .toggle-navigation").width();
                windowWidth = $(window).width();
                newwidth = (logoWidth + btnIconWidth + 46) / windowWidth * 100;
                //左右自适应宽度
                $contentLeft.css({
                    "width": newwidth + "%"
                });
                $contentRight.css({
                    "width": 100 - newwidth + "%"
                });
                //操作树高度自适应
                var newTreeH = winHeight - headerHeight - 203;
                $thetree.css({
                    "height": newTreeH + "px"
                });
                //视频区域自适应
                var mainContentHeight = $contentLeft.height();
                var adjustHeight = $(".adjust-area").height();
                videoHeight = (mainContentHeight - adjustHeight - 65) / 2;
                $(".videoArea").css("height", videoHeight + "px");
            }
            pageLayout.showOperatingAndRepairNum();
        },
        // 数组原型链拓展方法
        arrayExpand: function () {
            Array.prototype.isHas = function (a) {
                if (this.length === 0) {
                    return false
                }
                ;
                for (var i = 0, len = this.length; i < len; i++) {
                    if (this[i] === a) {
                        return true
                    }
                }
            };
            // 数组功能扩展
            Array.prototype.each = function (fn) {
                fn = fn || Function.K;
                var a = [];
                var args = Array.prototype.slice.call(arguments, 1);
                for (var i = 0, len = this.length; i < len; i++) {
                    var res = fn.apply(this, [this[i], i].concat(args));
                    if (res != null) a.push(res);
                }
                return a;
            };
            // 数组是否包含指定元素
            Array.prototype.contains = function (suArr) {
                for (var i = 0, len = this.length; i < len; i++) {
                    if (this[i] == suArr) {
                        return true;
                    }
                }
                return false;
            }
            // 两个数组的交集
            Array.intersect = function (a, b) {
                return a.each(function (o) {
                    return b.contains(o) ? o : null
                });
            };
            // 两个数组的差集
            Array.minus = function (a, b) {
                return a.each(function (o) {
                    return b.contains(o) ? null : o
                });
            };
            // 删除数组指定下标或指定对象
            Array.prototype.remove = function (obj) {
                for (var i = 0; i < this.length; i++) {
                    var temp = this[i];
                    if (!isNaN(obj) && obj.length < 4) {
                        temp = i;
                    }
                    if (temp == obj) {
                        for (var j = i; j < this.length; j++) {
                            this[j] = this[j + 1];
                        }
                        this.length = this.length - 1;
                    }
                }
            };
            Array.prototype.removeObj = function (obj) {
                for (var i = 0; i < this.length; i++) {
                    var temp = this[i];
                    if (temp == obj) {
                        for (var j = i; j < this.length; j++) {
                            this[j] = this[j + 1];
                        }
                        this.length = this.length - 1;
                    }
                }
            };
            // 去重
            Array.prototype.unique2 = function () {
                var res = [this[0]];
                for (var i = 1, len = this.length; i < len; i++) {
                    var repeat = false;
                    for (var j = 0, jlen = res.length; j < jlen; j++) {
                        if (this[i].id == res[j].id) {
                            repeat = true;
                            break;
                        }
                    }
                    if (!repeat) {
                        res.push(this[i]);
                    }
                }
                return res;
            };
            Array.prototype.unique3 = function () {
                var res = [];
                var json = {};
                for (var i = 0, len = this.length; i < len; i++) {
                    if (!json[this[i]]) {
                        res.push(this[i]);
                        json[this[i]] = 1;
                    }
                }
                ;
                return res;
            };
        },
        // 创建map集合
        createMap: function () {
            mapVehicleTimeW = new pageLayout.mapVehicle();
            mapVehicleTimeQ = new pageLayout.mapVehicle();
            fenceIDMap = new pageLayout.mapVehicle();
            PolyEditorMap = new pageLayout.mapVehicle();
            fenceSectionPointMap = new pageLayout.mapVehicle();
            markerMap = new pageLayout.mapVehicle();
            mapflog = new pageLayout.mapVehicle();
            mapVehicleNum = new pageLayout.mapVehicle();
            sectionPointMarkerMap = new pageLayout.mapVehicle();
            carNameMarkerMap = new pageLayout.mapVehicle();
            carNameMarkerContentMap = new pageLayout.mapVehicle();
            carNameContentLUMap = new pageLayout.mapVehicle();
            lineSpotMap = new pageLayout.mapVehicle();
            sectionMarkerPointArray = new pageLayout.mapVehicle();
            travelLineMap = new pageLayout.mapVehicle();
            administrationMap = new pageLayout.mapVehicle();
            dragPointMarkerMap = new pageLayout.mapVehicle();
            //创建地图围栏相关集合
            fenceIdList = new pageLayout.mapVehicle();
            AdministrativeRegionsList = new pageLayout.mapVehicle();
            travelLineList = new pageLayout.mapVehicle();
            markerViewingArea = new pageLayout.mapVehicle();
            markerOutside = new pageLayout.mapVehicle();
            markerAllUpdateData = new pageLayout.mapVehicle();
            drivingState = new pageLayout.mapVehicle();
        },
        // 应答
        responseSocket: function () {
            /*setTimeout(function() {
                webSocket.subscribe(headers, '/user/' + $("#userName").text() + '/check', pageLayout.updateTable, "/app/vehicle/inspect", null);
            }, 1000);*/
            pageLayout.isGetSocketLayout();
        },
        isGetSocketLayout: function () {
            setTimeout(function () {
                if (webSocket.conFlag) {
                    webSocket.subscribe(headers, '/user/' + $("#userName").text() + '/check', pageLayout.updateTable, "/app/vehicle/inspect", null);
                } else {
                    pageLayout.isGetSocketLayout();
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
                showErrorMsg("应答不能为空", "answer");
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
        //右边菜单显示隐藏切换
        toggleLeft: function () {
            if ($sidebar.hasClass("sidebar-toggle")) {
                if ($contentLeft.is(":hidden")) {
                    $contentRight.css("width", "100%");
                } else {
                    $contentLeft.css("width", newwidth + "%");
                    $contentRight.css("width", (100 - newwidth) + "%");
                }
            } else {
                if ($contentLeft.is(":hidden")) {
                    $contentRight.css("width", "100%");
                } else {
                    $contentRight.css("width", (100 - newwidth - 5) + "%");
                    $contentLeft.css("width", (newwidth + 5) + "%");
                }
            }
        },
        //左侧操作树点击隐藏
        goHidden: function () {
            $contentLeft.hide();
            $contentRight.attr("class", "col-md-12 content-right");
            $contentRight.css("width", "100%");
            $goShow.show();
        },
        //左侧操作树点击显示
        goShow: function () {
            $contentLeft.show();
            $contentRight.attr("class", "col-md-9 content-right");
            if ($sidebar.hasClass("sidebar-toggle")) {
                $contentRight.css("width", (100 - newwidth) + "%");
                $contentLeft.css("width", newwidth + "%");
            } else {
                $contentRight.css("width", "75%");
                $contentLeft.css("width", "25%");
            }
            $goShow.hide();
        },
        //鼠标按住拖动事件
        mouseMove: function (e) {
            if (els - e.clientY > 0) {
                var y = els - e.clientY;
                var newHeight = mapHeight - y;
                if (newHeight <= 0) {
                    newHeight = 0;
                }
                $MapContainer.css("height", newHeight + "px");
                if (newHeight == 0) {
                    return false;
                }
                $("#realTimeStateTable-div").css("max-height", (tableHeight + y) + "px");
            } else {
                var dy = e.clientY - els;
                var newoffsetTop = $myTab.offset().top;
                var scrollBodyHeight = $("#realTimeState .dataTables_scrollBody").height();
                if (scrollBodyHeight == 0) {
                    return false;
                }
                if (newoffsetTop <= (wHeight - myTabHeight)) {
                    var newHeight = mapHeight + dy;
                    $MapContainer.css("height", newHeight + "px");
                    $("#realTimeStateTable-div").css("max-height", (tableHeight - dy) + "px");
                }
            }
            e.stopPropagation();
        },
        // 鼠标移除事件
        mouseUp: function () {
            $(document).unbind("mousemove", pageLayout.mouseMove).unbind("mouseup", pageLayout.mouseUp);
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
        //拖拽DIV
        dragDiv: function (e) {
            //报警记录及日志信息不能拖拽 隐藏不能拖拽
            if ($("#realTimeStatus").hasClass("active") && $("#scalingBtn").hasClass("fa fa-chevron-down")) {
                if (stateName.length > 5) {
                    tableHeight = $("#realTimeStateTable-div").height();
                    mapHeight = $MapContainer.height();
                    els = e.clientY;
                    $(document).bind("mousemove", pageLayout.mouseMove).bind("mouseup", pageLayout.mouseUp);
                    e.stopPropagation();
                }
            }
        },
        //实时视频
        videoRealTimeShow: function (callback) {
            //实时视频 判断IE模式
            if (navigator.appName == "Microsoft Internet Explorer") {
                if (parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE", "")) < 10) {
                    layer.msg("亲！您的IE浏览器版本过低，请下载IE10及以上版本查看！");
                } else {
                    var $this = $('#btn-videoRealTime-show').children("i");
                    if (!$this.hasClass("active")) {
                        // $realTimeVideoReal.removeClass("realTimeVideoShow");
                        // $mapPaddCon.removeClass("mapAreaTransform");

                        // wjk 通话时不关闭画面
                        if (!$('#phoneCall').find('i').hasClass('active')) {
                            $realTimeVideoReal.removeClass("realTimeVideoShow");
                            $mapPaddCon.removeClass("mapAreaTransform");
                            m_videoFlag = 0; //标识视频窗口关闭
                        }

                        // realTimeVideo.beventAllMediaStop();
                        clearInterval(computingTimeInt)
                        realTimeVideo.closeVideo(0);
                    } else {

                        // wjk
                        $(this).addClass("map-active");
                        $realTimeVideoReal.addClass("realTimeVideoShow");
                        $mapPaddCon.addClass("mapAreaTransform");
                        m_videoFlag = 1; //标识视频窗口打开
                        realTimeVideo.downloadVideoOcx();
                        realTimeVideo.windowSet();
                        //传入限制单次实时视频回调
                        setTimeout("realTimeVideo.beventLiveView(pageLayout.computingTimeIntFun)", 5);

                        // $(this).addClass("map-active");
                        // $realTimeVideoReal.addClass("realTimeVideoShow");
                        // $mapPaddCon.addClass("mapAreaTransform");
                        // m_videoFlag = 1; //标识视频窗口打开
                        // realTimeVideo.downloadVideoOcx();
                        // realTimeVideo.windowSet();
                        // setTimeout("realTimeVideo.beventLiveView()", 5);

                    }
                }
            } else {
                $("#btn-videoRealTime-show i").removeClass("active");
                $("#btn-videoRealTime-show span").removeAttr("style");
                layer.msg("亲！实时视频暂时仅支持IE浏览器哟！请使用IE浏览器查看！");
            }
        },
        // wjk 对讲，实时通话
        phoneCallRealTimeshow: function () {
            //实时通话 判断IE模式
            if (navigator.appName == "Microsoft Internet Explorer") {
                if (parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE", "")) < 10) {
                    layer.msg("亲！您的IE浏览器版本过低，请下载IE10及以上版本！");
                } else {
                    var $this = $('#phoneCall').children("i");
                    if (!$this.hasClass("active")) {
                        // wjk 视频时不关闭画面
                        if (!$('#btn-videoRealTime-show').find('i').hasClass('active')) {
                            $realTimeVideoReal.removeClass("realTimeVideoShow");
                            $mapPaddCon.removeClass("mapAreaTransform");
                            m_videoFlag = 0; //标识视频窗口关闭
                        }

                        clearInterval(computingTimeCallInt)
                        realTimeVideo.closeAudio();
                    } else {

                        // wjk
                        $(this).addClass("map-active");
                        $realTimeVideoReal.addClass("realTimeVideoShow");
                        $mapPaddCon.addClass("mapAreaTransform");
                        m_videoFlag = 1; //标识视频窗口打开
                        realTimeVideo.windowSet();
                        //传入限制单次实时视频回调
                        setTimeout("realTimeVideo.beventLiveIpTalk(pageLayout.computingTimeCallIntFun)", 5);
                    }
                }
            } else {
                $("#phoneCall i").removeClass("active");
                $("#phoneCall span").removeAttr("style");
                layer.msg("亲！实时通话暂时仅支持IE浏览器哟！请使用IE浏览器！");
            }
        },
        // 关闭视频区域
        closeVideo: function () {
            if ($('#btn-videoRealTime-show i').hasClass('active')) {
                $realTimeVideoReal.removeClass("realTimeVideoShow");
                $mapPaddCon.removeClass("mapAreaTransform");
                $('#btn-videoRealTime-show i').removeClass('active');
                $('#btn-videoRealTime-show span').css('color', '#5c5e62');
            }
        },
        //点击显示报警
        showAlarmWindow: function () {
            $showAlarmWinMark.show();
            $("#showAlarmWin").hide();
        },
        //点击切换状态栏
        showAlarmWinMarkRight: function () {
            $("#TabFenceBox a").click();
            $("#myTab li").removeAttr("class");
            $("#realTtimeAlarm").attr("class", "active");
            $("#operationLogTable").attr("class", "tab-pane fade");
            $("#realTimeState").attr("class", "tab-pane fade");
            $("#realTimeCall").attr("class", "tab-pane fade active in");
            $(this).css("background-position", "0px -67px");
            setTimeout(function () {
                $showAlarmWinMark.css("background-position", "0px 0px");
            }, 100)
            $("#realTtimeAlarm").click();
            dataTableOperation.realTtimeAlarmClick();
        },
        alarmToolMinimize: function () {
            $("#context-menu").removeAttr("class");
            $("#showAlarmWin").show();
            $showAlarmWinMark.hide();
        },
        //开启关闭声音
        alarmOffSound: function () {
            if (navigator.userAgent.indexOf('MSIE') >= 0) {
                //IE浏览器
                if ($alarmSoundSpan.hasClass("soundOpen")) {
                    $alarmSoundSpan.addClass("soundOpen-off");
                    $alarmSoundSpan.removeClass("soundOpen");
                    $alarmSoundFont.css("color", "#a8a8a8");
                    $alarmMsgBox.html('<embed id="IEalarmMsg" src=""/>');
                } else {
                    $alarmSoundSpan.removeClass("soundOpen-off");
                    $alarmSoundSpan.addClass("soundOpen");
                    $alarmSoundFont.css("color", "#fff");
                    $alarmMsgBox.html('<embed id="IEalarmMsg" src="../../file/music/alarm.wav" autostart="true"/>');
                }
            } else {
                //其他浏览器
                if ($alarmSoundSpan.hasClass("soundOpen")) {
                    $alarmSoundSpan.addClass("soundOpen-off");
                    $alarmSoundSpan.removeClass("soundOpen");
                    $alarmSoundFont.css("color", "#a8a8a8");
                    if (alarmNum > 0) {
                        $("#alarmMsgAutoOff")[0].pause();
                    }
                    $alarmMsgAutoOff.removeAttr("autoplay");
                } else {
                    $alarmSoundSpan.removeClass("soundOpen-off");
                    $alarmSoundSpan.addClass("soundOpen");
                    $alarmSoundFont.css("color", "#fff");
                    if (alarmNum > 0) {
                        $("#alarmMsgAutoOff")[0].play();
                    }
                }
            }
        },
        //开启关闭闪烁
        alarmOffFlashes: function () {
            if ($alarmFlashesSpan.hasClass("flashesOpen")) {
                $alarmFlashesSpan.addClass("flashesOpen-off");
                $alarmFlashesSpan.removeClass("flashesOpen");
                $alarmFlashesFont.css("color", "#a8a8a8");
                $showAlarmWinMark.css("background-position", "0px 0px");
            } else {
                $alarmFlashesSpan.removeClass("flashesOpen-off");
                $alarmFlashesSpan.addClass("flashesOpen");
                $alarmFlashesFont.css("color", "#fff");
                if (alarmNum > 0) {
                    $showAlarmWinMark.css("background-position", "0px -134px");
                    setTimeout(function () {
                        $showAlarmWinMark.css("background-position", "0px 0px");
                    }, 1500)
                } else {
                    $showAlarmWinMark.css("background-position", "0px 0px");
                }
            }
        },
        //显示报警设置详情
        showAlarmInfoSettings: function () {
            pageLayout.closeVideo();
            $("#alarmSettingInfo").modal("show");
            $("#context-menu").removeClass("open");
        },
        //工具图标按钮
        toolClick: function () {
            // var $toolOperateClick = $("#toolOperateClick");
            // if($toolOperateClick.css("margin-right") == "-702px"){
            //     $toolOperateClick.animate({marginRight:"7px"});
            // }else{
            //     $("#disSetMenu,#mapDropSettingMenu").hide();
            //     $toolOperateClick.animate({marginRight:"-702px"});
            //     $("#toolOperateClick i").removeClass('active');
            //     $("#toolOperateClick span").css('color','#5c5e62');
            //     mouseTool.close(true);
            // };

            // wjk
            var $toolOperateClick = $("#toolOperateClick");
            if ($toolOperateClick.css("margin-right") == "-776px") {
                $toolOperateClick.animate({marginRight: "7px"});
            } else {
                $("#disSetMenu,#mapDropSettingMenu").hide();
                $toolOperateClick.animate({marginRight: "-776px"});
                $("#toolOperateClick i").removeClass('active');
                $("#toolOperateClick span").css('color', '#5c5e62');
                mouseTool.close(true);
            }
            ;
        },
        //显示设置
        smoothMoveOrlogoDisplayClickFn: function () {
            var id = $(this).attr("id");
            //平滑移动
            if (id == "smoothMove") {
                if ($("#smoothMove").attr("checked")) {
                    flagSwitching = false;
                    $("#smoothMove").attr("checked", false);
                    $("#smoothMoveLab").removeClass("preBlue");
                } else {
                    flagSwitching = true;
                    $("#smoothMove").attr("checked", true);
                    $("#smoothMoveLab").addClass("preBlue");
                }
            }
            //标识显示
            else if (id == "logoDisplay") {
                if ($("#logoDisplay").attr("checked")) {
                    isCarNameShow = false;
                    $("#logoDisplay").attr("checked", false);
                    $("#logoDisplayLab").removeClass("preBlue");
                } else {
                    isCarNameShow = true;
                    $("#logoDisplay").attr("checked", true);
                    $("#logoDisplayLab").addClass("preBlue");
                }
                amapOperation.carNameState(isCarNameShow);
            }
            //图标向上
            else if (id == "icoUp") {
                if ($("#icoUp").attr("checked")) {
                    icoUpFlag = false;
                    $("#icoUp").attr("checked", false);
                    $("#icoUpLab").removeClass("preBlue");
                } else {
                    icoUpFlag = true;
                    $("#icoUp").attr("checked", true);
                    $("#icoUpLab").addClass("preBlue");
                    var values = carNameMarkerMap.values();
                    console.log(values);
                    for (var i = 0; i < values.length; i++) {
                        values[i].setAngle(0);
                    }
                }
            }
        },
        //地图设置
        mapDropdownSettingClickFn: function () {
            var id = $(this).attr("id");
            //路况开关
            if (id == "realTimeRC") {
                amapOperation.realTimeRC();
            }
            //卫星地图
            else if (id == "defaultMap") {
                amapOperation.satelliteMapSwitching();
            }
            //谷歌地图
            else if (id == "googleMap") {
                amapOperation.showGoogleMapLayers();
            }
        },
        //获取当前服务器系统时间
        getNowFormatDate: function () {
            var url = "/clbs/v/monitoring/getTime"
            json_ajax("POST", url, "json", false, null, function (data) {
                logTime = data;
            });
        },
        // wjk,视频时间限制回调函数
        computingTimeIntFun: function () {
            clearInterval(computingTimeInt);
            if (m_isVideo !== 0 && m_videoFlag !== 0) {
                var index = 0;
                computingTimeInt = setInterval(function () {
                    index++;
                    if (index > 30) {
                        clearInterval(computingTimeInt);
                        if (!$('#phoneCall').find('i').hasClass('active')) {
                            $realTimeVideoReal.removeClass("realTimeVideoShow");
                            $mapPaddCon.removeClass("mapAreaTransform");
                        }
                        $("#btn-videoRealTime-show i").removeClass("active");
                        $("#btn-videoRealTime-show span").removeAttr("style");
                        m_videoFlag = 0; //标识视频窗口关闭
                        realTimeVideo.closeVideo(0);
                        layer.msg('单次视频时长已达到30s上限')
                    }
                }, 1000)
            }
        },
        //wjk 通话时间限制回调函数
        computingTimeCallIntFun: function () {
            clearInterval(computingTimeCallInt);
            if (m_videoFlag !== 0) {
                var index = 0;
                computingTimeCallInt = setInterval(function () {
                    index++;
                    if (index > 60) {
                        clearInterval(computingTimeCallInt);
                        if (!$('#btn-videoRealTime-show').find('i').hasClass('active')) {
                            $realTimeVideoReal.removeClass("realTimeVideoShow");
                            $mapPaddCon.removeClass("mapAreaTransform");
                            m_videoFlag = 0; //标识视频窗口关闭
                        }
                        $("#phoneCall i").removeClass("active");
                        $("#phoneCall span").removeAttr("style");
                        realTimeVideo.closeAudio();
                        layer.msg('单次实时通话时长已达到60s上限')
                    }
                }, 1000)
            }
        },
        //显示车辆运营数量和维修数量
        showOperatingAndRepairNum: function () {
            var url = "/clbs/m/basicinfo/monitoring/vehicle/getOperatingAndRepairNum";
            json_ajax("POST", url, "json", true, {}, pageLayout.operatingAndRepairNumCall);
        },
        operatingAndRepairNumCall: function (data) {
            if (data.success) {
                $("#table-car-operating-num").text(data.obj.operatingNum);
                $("#table-car-repair-num").text(data.obj.repairNum);
            }
        }
    }
;
// wjk 实时视频时间定时器
var computingTimeInt;

var amapOperation = {
    // 地图初始化
    init: function () {
        // 创建地图
        map = new AMap.Map("MapContainer", {
            resizeEnable: true,   //是否监控地图容器尺寸变化
            zoom: 18,       //地图显示的缩放级别
        });
        // 输入提示
        var startPoint = new AMap.Autocomplete({
            input: "startPoint"
        });
        startPoint.on('select', fenceOperation.dragRoute);
        var endPoint = new AMap.Autocomplete({
            input: "endPoint"
        });
        endPoint.on('select', fenceOperation.dragRoute);
        // 行政区划查询
        var opts = {
            subdistrict: 1,   //返回下一级行政区
            level: 'city',
            showbiz: false  //查询行政级别为 市
        };
        district = new AMap.DistrictSearch(opts);//注意：需要使用插件同步下发功能才能这样直接使用
        district.search('中国', function (status, result) {
            if (status == 'complete') {
                fenceOperation.getData(result.districtList[0]);
            }
        });
        // 地图移动结束后触发，包括平移和缩放
        mouseTool = new AMap.MouseTool(map);
        mouseTool.on("draw", fenceOperation.createSuccess);
        mouseToolEdit = new AMap.MouseTool(map);
        // 实例化3D楼块图层
        buildings = new AMap.Buildings();
        // 在map中添加3D楼块图层
        buildings.setMap(map);
        // 地图标尺
        var mapScale = AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], function () {
            map.addControl(new AMap.ToolBar());
            map.addControl(new AMap.Scale());
        });
        // 卫星地图
        satellLayer = new AMap.TileLayer.Satellite();
        satellLayer.setMap(map);
        satellLayer.hide();
        // 实时路况
        realTimeTraffic = new AMap.TileLayer.Traffic();
        realTimeTraffic.setMap(map);
        realTimeTraffic.hide();
        // 当范围缩小时触发该方法
        map.on('zoomend', amapOperation.markerStateListening);
        // var clickEventListener = map.on('zoomend', amapOperation.clickEventListener);
        // 当拖拽结束时触发该方法
        map.on('dragend', amapOperation.markerStateListening);
        // var clickEventListener2 = map.on('dragend', amapOperation.clickEventListener2);
        // 地图点击隐藏车辆树右键菜单
        map.on("click", function () {
            $("#rMenu").css("visibility", "hidden");
            $("#disSetMenu").slideUp();
            $("#mapDropSettingMenu").slideUp();
            $("#fenceTool>.dropdown-menu").hide();
        });
        infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -10), closeWhenClickMap: true});
        // 地图移动结束后触发，包括平移，以及中心点变化的缩放
        map.on('moveend', amapOperation.mapMoveendFun);
    },
    // 地图setcenter完成后触发事件
    mapMoveendFun: function () {
        amapOperation.pathsChangeFun();
        amapOperation.LimitedSizeTwo();
    },
    getDCallBack: function (data) {
        msgSNAck = data.obj.msgSN;
    },
    // 订阅最后位置信息
    subscribeLatestLocation: function (param) {
        var requestStrS = {
            "desc": {
                "MsgId": 40964,
                "UserName": $("#userName").text(),
                "cmsgSN": msgSNAck
            },
            "data": param
        };
        webSocket.subscribe(headers, "/user/" + $("#userName").text() + "/realLocationS", amapOperation.getLastOilDataCallBack, "/app/vehicle/realLocationS", requestStrS);
    },
    // 对象点名传递数据
    getLastOilDataCallBack: function (data) {
        var data = $.parseJSON(data.body);
        if (data.desc.msgID === 513) {
            if (msgSNAck == data.data.msgBody.msgSNAck) {
                var obj = {};
                obj.desc = data.desc;
                var da = {};
                da.msgHead = data.data.msgHead;
                da.msgBody = data.data.msgBody;
                obj.data = da;
                // 状态信息
                dataTableOperation.updateVehicleStatusInfoTable(obj);
            }
        }
    },
    completeEventHandler: function (vehicle) {//1
        if (vehicle[11] == "people") {
            // 判断位置信息的经纬度是否正确
            if (vehicle[9] == 0 && vehicle[10] == 0) {
                if (objAddressIsTrue.indexOf(vehicle[12]) == -1) {
                    objAddressIsTrue.push(vehicle[12]);
                }
                return;
            } else {
                var index = objAddressIsTrue.indexOf(vehicle[12]);
                if (index != -1) {
                    objAddressIsTrue.splice(index, 1);
                }
            }
            ;
            /**************************************/
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            var nodes = treeObj.getCheckedNodes(true);
            var uuids = [];
            var type;
            var pid;
            for (var j = 0; j < nodes.length; j++) {
                var vObj = {};
                vObj.id = nodes[j].id;
                vObj.pid = nodes[j].pId;
                uuids.push(vObj);
                if (nodes[j].id == vehicle[12]) {
                    type = nodes[j].type;
                    pid = nodes[j].pId;
                }
            }
            /******************************************/
            var coordinateNew = [];
            var x = vehicle[9];
            var y = vehicle[10];
            coordinateNew.push(y);
            coordinateNew.push(x);
            var content = [];
            content.push("<div>时间：" + vehicle[0] + "</div>");
            content.push("<div>监控对象：" + vehicle[1] + "</div>");
            content.push("<div>所属分组：" + vehicle[2] + "</div>");
            content.push("<div>终端号：" + vehicle[3] + "</div>");
            content.push("<div>SIM卡号：" + vehicle[4] + "</div>");
            content.push("<div>电池电压：" + vehicle[5] + "</div>");
            content.push("<div>信号强度：" + vehicle[6] + "</div>");
            content.push("<div>速度：" + vehicle[7] + "</div>");
            content.push("<div>海拔：" + vehicle[8] + "</div>");
            content.push(
                '<div class="infoWindowSetting">' +
                '<a class="col-md-3" id="jumpTo" onClick="window.amapOperation.jumpToTrackPlayer(\'' + vehicle[12] + '\',\'' + type + '\',\'' + pid + '\',\'' + uuids + '\')">' +
                '<img src="../../resources/img/v-track.svg" style="height:28px;width:28px;"/>轨迹' +
                '</a>' +
                '</div>'
            );
            // 获取现在的订阅对象数据长度
            var subscribeObjOldLength = markerAllUpdateData.values().length;

            // 删除对应监控对象以前的数据
            if (markerAllUpdateData.containsKey(vehicle[12])) {
                markerAllUpdateData.remove(vehicle[12]);
            }
            // if(icoUpFlag){
            //     markerInside.setAngle(0);
            // }
            // 组装监控对象需要保存的信息
            var objSaveInfo = [
                vehicle[12], // 监控对象ID
                vehicle[1], // 监控对象名称
                vehicle[10], // 经度
                vehicle[9], // 纬度
                vehicle[13], // 角度
                vehicle[14], // 状态
                vehicle[16], // 图标
                vehicle[0], // 时间
                vehicle[17], // 里程
                vehicle[15],//监控对象类型
            ];


            var updateInfo = [
                objSaveInfo,
                content
            ];
            markerAllUpdateData.put(vehicle[12], updateInfo);

            // 获取现在的订阅对象数据长度
            var subscribeObjNowLength = markerAllUpdateData.values().length;

            // 针对区域查询后，监控对象的聚合显示
            if (map.getZoom() < 11 && subscribeObjNowLength != subscribeObjOldLength) {
                amapOperation.markerStateListening();
            }

            // var angleVehicle = Number(vehicle[24]) + 270;
            // 判断是否是订阅的第一个对象
            if (markerViewingArea.size() == 0 && map.getZoom() >= 11 && markerAllUpdateData.size() == 1) {
                amapOperation.createMarker(objSaveInfo, content, !isAreaSearch);
                isAreaSearch = false;
            } else {
                // 判断当前位置点是否在可视区域内且层级大于11
                if ((paths.contains(coordinateNew) || markerFocus == vehicle[12]) && map.getZoom() >= 11) {
                    if (markerViewingArea.containsKey(vehicle[12])) { // 判断是否含有该id数据
                        var value = markerViewingArea.get(vehicle[12]);

                        var marker = value[0];
                        marker.extData = vehicle[12]; // 监控对象id
                        marker.stateInfo = vehicle[14]; // 监控对象状态
                        marker.content = content.join(""); // 监控对象信息弹窗

                        var markerLngLat = [vehicle[10], vehicle[9]];
                        markerViewingArea.remove(vehicle[12]);
                        value[0] = marker;
                        value[1].push(markerLngLat);
                        value[2] = content;
                        value[3].push(null); // 里程
                        value[4].push(null); // 时间
                        value[6] = vehicle[14];
                        value[8].push(vehicle[13]);
                        markerViewingArea.put(vehicle[12], value);
                        amapOperation.carNameEvade(vehicle[12], vehicle[1], marker.getPosition(), null, "1", null, false, vehicle[14]);// 监控对象进行移动
                        amapOperation.markerMoveFun(objSaveInfo);
                    } else { // 创建监控对象图标
                        amapOperation.createMarker(objSaveInfo, content, false);
                    }
                } else {
                    amapOperation.saveMarkerOutsideInfo(objSaveInfo, content);
                }
            }

        } else if (vehicle[11] != "people") {
            //获取车Id
            var vehicleId = vehicle[13];
            /**************************************/
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            var nodes = treeObj.getCheckedNodes(true);
            var uuids = [];
            var type;
            var pid;
            for (var j = 0; j < nodes.length; j++) {
                var vObj = {};
                vObj.id = nodes[j].id;
                vObj.pid = nodes[j].pId;
                uuids.push(vObj);
                if (nodes[j].id == vehicleId) {
                    type = nodes[j].type;
                    pid = nodes[j].pId;
                }
            }
            /******************************************/
            //取出报警集合中等同于当前车Id的报警信息  赋值到当前车辆信息集合
            if (alarmInfoList.get(vehicleId) == undefined) {
                vehicle[20] = "";
            } else {
                vehicle[20] = alarmInfoList.get(vehicleId);
            }

            // 判断位置信息传过来的经纬度是否正确
            if (vehicle[11] == 0 && vehicle[12] == 0) {
                if (objAddressIsTrue.indexOf(vehicleId) == -1) {
                    objAddressIsTrue.push(vehicleId);
                }
                return;
            } else {
                var index = objAddressIsTrue.indexOf(vehicleId);
                if (index != -1) {
                    objAddressIsTrue.splice(index, 1);
                }
            }
            ;
            var coordinateNew = [];
            var x = vehicle[11];
            var y = vehicle[12];
            var vStatusInfoShows = [];
            for (var i = 0; i < vehicle.length; i++) {
                if (i != 2 && i != 14 && i != 20) {
                    vStatusInfoShows.push(vehicle[i]);
                }
            }
            coordinateNew.push(y);
            coordinateNew.push(x);
            var content = [];
            //begin-1
            content.push("<div class='col-md-12' id='basicStatusInformation' style='padding:0px;'>");
            content.push("<div>时间：" + vehicle[10] + "</div>");
            if (vehicle[15] == "") {
                content.push("<div>监控对象：" + vehicle[0] + "</div>");
            } else {
                content.push("<div>监控对象：" + vehicle[0] + "(" + vehicle[15] + ")</div>");
            }
            content.push("<div>终端号：" + (vehicle[3] === undefined ? "" : vehicle[3]) + "</div>");
            content.push("<div>SIM卡号：" + vehicle[4] + "</div>");
            if (vehicle[9] == "行驶") {
                content.push("<div>行驶状态：" + "<font color='#78af3a'>" + vehicle[9] + "</font>" + "</div>");
            } else if (vehicle[9] == "停止") {
                content.push("<div>行驶状态：" + "<font color='#c80002'>" + vehicle[9] + "</font>" + "</div>");
            }
            var speed7 = dataTableOperation.fiterNumber(vehicle[7]);
            content.push("<div>行驶速度：" + speed7 + "</div>");
            content.push("<div>位置：" + vehicle[17] + "</div>");
            //轨迹跟踪点名
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            var deviceType = vehicle[27];
            var protocolType = vehicle[31];//协议类型
            var state = vehicle[29];//在线状态
            if (deviceType == "0" || deviceType == "1") {
                var html = '<div class="infoWindowSetting">' +
                    '<a class="col-md-2" id="jumpTo" onClick="window.amapOperation.jumpToTrackPlayer(\'' + vehicleId + '\',\'' + deviceType + '\',\'' + pid + '\',\'' + uuids + '\')">' +
                    '<img src="../../resources/img/v-track.svg" style="height:28px;width:28px;"/>轨迹' +
                    '</a>' +
                    '<a class="col-md-2 traceTo" onClick="fenceOperation.goTrace(\'' + vehicle[13] + '\')">' +
                    '<img src="../../resources/img/whereabouts.svg" style="height:28px;width:28px;"/>跟踪' +
                    '</a>' +
                    '<a class="col-md-2 callName" onClick="treeMonitoring.callName_(\'' + vehicle[13] + '\')">' +
                    '<img src="../../resources/img/v-named.svg" style="height:28px;width:28px;"/>点名' +
                    '</a>';
                if (protocolType == '1' && state != '3') {//交通部JT/808-2013协议且车辆在线
                    html += '<a class="col-md-2 callName" onClick="treeMonitoring.jumpToRealTimeVideoPage(\'' + vehicleId + '\')">' +
                        '<img src="../../resources/img/video_info_jump.svg" style="height:28px;width:28px;"/>视频' +
                        '</a>';
                }
                html += '<a class="col-md-2 text-right pull-right" style="padding-top:24px;">' +
                    '<i class="fa fa-chevron-circle-right fa-2x vStatusInfoShowMore" id="vStatusInfoShowMore" onclick="amapOperation.vStatusInfoShow(\'' + vStatusInfoShows + '\',\'' + vehicle[2] + '\',\'' + vehicle[14] + '\',\'' + vehicle[20] + '\')"></i>' +
                    '</a>' +
                    '</div>';
                content.push(html);

                /* content.push(
                     '<div class="infoWindowSetting">' +
                     '<a class="col-md-2" id="jumpTo" onClick="window.amapOperation.jumpToTrackPlayer(\'' + vehicleId + '\',\'' + deviceType + '\',\'' + pid + '\',\'' + uuids + '\')">' +
                     '<img src="../../resources/img/v-track.svg" style="height:28px;width:28px;"/>轨迹' +
                     '</a>' +
                     '<a class="col-md-2 traceTo" onClick="fenceOperation.goTrace(\'' + vehicle[13] + '\')">' +
                     '<img src="../../resources/img/whereabouts.svg" style="height:28px;width:28px;"/>跟踪' +
                     '</a>' +
                     '<a class="col-md-2 callName" onClick="treeMonitoring.callName_(\'' + vehicle[13] + '\')">' +
                     '<img src="../../resources/img/v-named.svg" style="height:28px;width:28px;"/>点名' +
                     '</a>' +

                     '<a class="col-md-2 callName" onClick="treeMonitoring.jumpToRealTimeVideoPage(\'' + vehicleId + '\')">' +
                     '<img src="../../resources/img/video_info_jump.svg" style="height:28px;width:28px;"/>视频' +
                     '</a>' +

                     '<a class="col-md-2 text-right pull-right" style="padding-top:24px;">' +
                     '<i class="fa fa-chevron-circle-right fa-2x vStatusInfoShowMore" id="vStatusInfoShowMore" onclick="amapOperation.vStatusInfoShow(\'' + vStatusInfoShows + '\',\'' + vehicle[2] + '\',\'' + vehicle[14] + '\',\'' + vehicle[20] + '\')"></i>' +
                     '</a>' +
                     '</div>'
            )*/
            } else if (deviceType == "8" || deviceType == "9" || deviceType == "10") {
                var html = '<div class="infoWindowSetting">' +
                    '<a class="col-md-3" id="jumpTo" onClick="window.amapOperation.jumpToTrackPlayer(\'' + vehicleId + '\',\'' + deviceType + '\',\'' + pid + '\',\'' + uuids + '\')">' +
                    '<img src="../../resources/img/v-track.svg" style="height:28px;width:28px;"/>轨迹' +
                    '</a>' +
                    '<a class="col-md-3 traceTo" onClick="fenceOperation.goF3Trace(\'' + vehicle[13] + '\')">' +
                    '<img src="../../resources/img/whereabouts.svg" style="height:28px;width:28px;"/>跟踪' +
                    '</a>';

                if (protocolType == '1' && state != '3') {//交通部JT/808-2013协议
                    html += '<a class="col-md-2 callName" onClick="treeMonitoring.jumpToRealTimeVideoPage(\'' + vehicleId + '\')">' +
                        '<img src="../../resources/img/video_info_jump.svg" style="height:28px;width:28px;"/>视频' +
                        '</a>';
                }
                html += '<a class="col-md-3 text-right pull-right" style="padding-top:24px;">' +
                    '<i class="fa fa-chevron-circle-right fa-2x vStatusInfoShowMore" id="vStatusInfoShowMore" onclick="amapOperation.vStatusInfoShow(\'' + vStatusInfoShows + '\',\'' + vehicle[2] + '\',\'' + vehicle[14] + '\',\'' + vehicle[20] + '\')"></i>' +
                    '</a>' +
                    '</div>';
                content.push(html);

                /* content.push(
                     '<div class="infoWindowSetting">' +
                     '<a class="col-md-3" id="jumpTo" onClick="window.amapOperation.jumpToTrackPlayer(\'' + vehicleId + '\',\'' + deviceType + '\',\'' + pid + '\',\'' + uuids + '\')">' +
                     '<img src="../../resources/img/v-track.svg" style="height:28px;width:28px;"/>轨迹' +
                     '</a>' +
                     '<a class="col-md-3 traceTo" onClick="fenceOperation.goF3Trace(\'' + vehicle[13] + '\')">' +
                     '<img src="../../resources/img/whereabouts.svg" style="height:28px;width:28px;"/>跟踪' +
                     '</a>' +

                     '<a class="col-md-2 callName" onClick="treeMonitoring.jumpToRealTimeVideoPage(\'' + vehicleId + '\')">' +
                     '<img src="../../resources/img/video_info_jump.svg" style="height:28px;width:28px;"/>视频' +
                     '</a>' +

                     '<a class="col-md-3 text-right pull-right" style="padding-top:24px;">' +
                     '<i class="fa fa-chevron-circle-right fa-2x vStatusInfoShowMore" id="vStatusInfoShowMore" onclick="amapOperation.vStatusInfoShow(\'' + vStatusInfoShows + '\',\'' + vehicle[2] + '\',\'' + vehicle[14] + '\',\'' + vehicle[20] + '\')"></i>' +
                     '</a>' +
                     '</div>'
                 );*/
            } else {
                var html = '<div class="infoWindowSetting">' +
                    '<a class="col-md-3" id="jumpTo" onClick="window.amapOperation.jumpToTrackPlayer(\'' + vehicleId + '\',\'' + deviceType + '\',\'' + pid + '\',\'' + uuids + '\')">' +
                    '<img src="../../resources/img/v-track.svg" style="height:28px;width:28px;"/>轨迹' +
                    '</a>';
                if (protocolType == '1' && state != '3') {//交通部JT/808-2013协议
                    html += '<a class="col-md-2 callName" onClick="treeMonitoring.jumpToRealTimeVideoPage(\'' + vehicleId + '\')">' +
                        '<img src="../../resources/img/video_info_jump.svg" style="height:28px;width:28px;"/>视频' +
                        '</a>';
                }
                html += '<a class="col-md-3 text-right pull-right" style="padding-top:24px;">' +
                    '<i class="fa fa-chevron-circle-right fa-2x vStatusInfoShowMore" id="vStatusInfoShowMore" onclick="amapOperation.vStatusInfoShow(\'' + vStatusInfoShows + '\',\'' + vehicle[2] + '\',\'' + vehicle[14] + '\',\'' + vehicle[20] + '\')"></i>' +
                    '</a>' +
                    '</div>';
                content.push(html);
                /*content.push(
                    '<div class="infoWindowSetting">' +
                    '<a class="col-md-3" id="jumpTo" onClick="window.amapOperation.jumpToTrackPlayer(\'' + vehicleId + '\',\'' + deviceType + '\',\'' + pid + '\',\'' + uuids + '\')">' +
                    '<img src="../../resources/img/v-track.svg" style="height:28px;width:28px;"/>轨迹' +
                    '</a>' +

                    '<a class="col-md-2 callName" onClick="treeMonitoring.jumpToRealTimeVideoPage(\'' + vehicleId + '\')">' +
                    '<img src="../../resources/img/video_info_jump.svg" style="height:28px;width:28px;"/>视频' +
                    '</a>' +

                    '<a class="col-md-3 text-right pull-right" style="padding-top:24px;">' +
                    '<i class="fa fa-chevron-circle-right fa-2x vStatusInfoShowMore" id="vStatusInfoShowMore" onclick="amapOperation.vStatusInfoShow(\'' + vStatusInfoShows + '\',\'' + vehicle[2] + '\',\'' + vehicle[14] + '\',\'' + vehicle[20] + '\')"></i>' +
                    '</a>' +
                    '</div>'
                );*/
            }
            content.push("</div>");
            //begin-2
            content.push("<div class='col-md-8' id='v-statusInfo-show'>");
            content.push("<div class='col-md-6' style=''>");
            content.push("<div>所属企业：" + vehicle[26] + "</div>");
            content.push("<div>所属分组：" + vehicle[2] + "</div>");
            content.push("<div>对象类型：" + ((vehicle[1] == null || vehicle[1] == 'null' || !vehicle[1]) ? '' : vehicle[1]) + "</div>");
            if (vehicle[8] == "开" || (vehicle[8].indexOf("无") == -1 && vehicle[8].indexOf("点火") > -1)) {
                content.push("<div>ACC：" + vehicle[8] + " <img src='../../resources/img/acc_on.svg' style='margin: -3px 0px 0px 0px;height:24px;'/></div>");
            } else {
                content.push("<div>ACC：" + vehicle[8] + " <img src='../../resources/img/acc_off.svg' style='margin: -3px 0px 0px 0px;height:24px;'/></div>");
            }
            content.push("<div>当日里程：" + Number(vehicle[5]).toFixed(1) + "公里</div>");
            content.push("<div><span id='bombBox2'></span></div>");
            content.push("<div><span id='bombBox3'></span></div>");
            content.push("<div>总里程：" + Number(vehicle[6]).toFixed(1) + "公里</div>");

            content.push("<div><span id='bombBox0'></span></div>");
            content.push("<div><span id='bombBox1'></span></div>");
            content.push("</div>");
            //begin-3
            content.push(
                '<div class="col-md-6" style="">' +
                '<div class="arrow"></div>' +
                '<div><span id="bombBox4"></span></div>' +
                '<div><span id="bombBox5"></span></div>' +
                '<div><span id="bombBox6"></span></div>' +
                '<div><span id="bombBox7"></span></div>' +
                '<div><span id="bombBox8"></span></div>' +
                '<div><span id="bombBox9"></span></div>' +
                '<div><span id="bombBox10"></span></div>' +
                '<div><span id="bombBox11"></span></div>' +
                '<div><span id="bombBox12"></span></div>' +
                '<div><span id="bombBox13"></span></div>' +
                '<div><span id="bombBox14"></span></div>' +
                '<div><span id="bombBox15"></span></div>' +
                '<div><span id="bombBox16"></span></div>' +
                '</div>' +
                '</div>'
            );
            content.push("</div>");

            // 获取之前的订阅对象数据长度
            var subscribeObjOldLength = markerAllUpdateData.values().length;

            // 删除对应监控对象以前的数据
            if (markerAllUpdateData.containsKey(vehicle[13])) {
                markerAllUpdateData.remove(vehicle[13]);
            }

            // 组装监控对象需要保存的信息
            var objSaveInfo = [
                vehicle[13], // 监控对象ID
                vehicle[0], // 监控对象名称
                vehicle[12], // 经度
                vehicle[11], // 纬度
                vehicle[24], // 角度
                vehicle[29], // 状态
                vehicle[25], // 图标
                vehicle[10], // 时间
                vehicle[5], // 里程
                vehicle[30], //监控对象类型
            ];

            var updateInfo = [
                objSaveInfo,
                content
            ];


            markerAllUpdateData.put(vehicle[13], updateInfo);

            // 获取现在的订阅对象数据长度
            var subscribeObjNowLength = markerAllUpdateData.values().length;

            // 针对区域查询后，监控对象的聚合显示
            if (map.getZoom() < 11 && subscribeObjNowLength != subscribeObjOldLength) {
                amapOperation.markerStateListening();
            }

            // var angleVehicle = Number(vehicle[24]) + 270;
            // 判断是否是订阅的第一个对象
            if (markerViewingArea.size() == 0 && map.getZoom() >= 11 && markerAllUpdateData.size() == 1) {
                amapOperation.createMarker(objSaveInfo, content, !isAreaSearch);
                isAreaSearch = false;
            } else {
                // 判断当前位置点是否在可视区域内且层级大于11
                if ((paths.contains(coordinateNew) || vehicle[13] == markerFocus) && map.getZoom() >= 11) {
                    if (markerViewingArea.containsKey(vehicle[13])) { // 判断是否含有该id数据
                        var value = markerViewingArea.get(vehicle[13]);
                        var marker = value[0];
                        marker.extData = vehicle[13]; // 监控对象id
                        marker.stateInfo = vehicle[29]; // 监控对象状态
                        marker.content = content.join(""); // 监控对象信息弹窗

                        var markerLngLat = [vehicle[12], vehicle[11]];
                        var timeOld = (new Date(vehicle[10].replace(/-/g, '/'))).getTime();//获得时间（毫秒）
                        markerViewingArea.remove(vehicle[13]);
                        value[0] = marker;
                        value[1].push(markerLngLat);
                        value[2] = content;
                        value[3].push(vehicle[5]);
                        value[4].push(timeOld);
                        value[6] = vehicle[29];
                        value[8].push(vehicle[24]);
                        amapOperation.carNameEvade(vehicle[13], vehicle[0], marker.getPosition(), null, '0', null, false, vehicle[29]);
                        markerViewingArea.put(vehicle[13], value);
                        // 监控对象进行移动
                        amapOperation.markerMoveFun(objSaveInfo);
                    } else { // 创建监控对象图标
                        amapOperation.createMarker(objSaveInfo, content, false);
                    }
                } else {
                    amapOperation.saveMarkerOutsideInfo(objSaveInfo, content);
                }
            }
        }
    },//1
    // 点名操作
    callTheRollFun: function () {
        if (markerViewingArea.containsKey(callTheRollId)) {
            var value = markerViewingArea.get(callTheRollId);
            var positions = value[1];
            if (positions.length > 1) {
                markerViewingArea.remove(callTheRollId);
                var marker = value[0];
                marker.stopMove();
                value[1].splice(1, value[1].length - 2);
                value[3].splice(1, value[3].length - 2);
                value[4].splice(1, value[4].length - 2);
                value[8].splice(1, value[8].length - 2);
                markerViewingArea.put(callTheRollId, value);

                marker.moveTo(value[1][1], 10000);
                // 判断监控对象是否已经绑定了移动监听事件
                if (!marker.ej.moving) {
                    // 绑定移动监听事件
                    marker.on('moving', function (e) {
                        amapOperation.markerMovingFun(e, callTheRollId)
                    });
                }
                // 判断监控对象是否已经绑定了移动结束事件
                if (!marker.ej.moveend) {
                    // 绑定移动监听事件
                    marker.on('moveend', function (e) {
                        amapOperation.markerMoveendFun(e, callTheRollId)
                    });
                }
            }
            callTheRollId = null;
        }
    },
    // 创建监控对象图标
    createMarker: function (info, content, isFocus) {
        var markerLngLat = [info[2], info[3]]; // 经纬度
        var angle;
        if (icoUpFlag) {
            angle = 0;
        } else {
            angle = Number(info[4]) + 270; // 角度
        }

        // 删除已经存在的marker图标
        if (markerViewingArea.containsKey(info[0])) {
            markerViewingArea.remove(info[0]);
        }


        //创建监控对象图标
        var marker = amapOperation.carNameEvade(
            info[0],
            info[1],
            markerLngLat,
            true,
            info[9],
            info[6],
            false,
            info[5]
        );
        // 监控对象添加字段
        marker.setAngle(angle);
        marker.extData = info[0]; // 监控对象id
        marker.stateInfo = info[5]; // 监控对象状态
        marker.content = content.join(""); // 监控对象信息弹窗
        marker.on('click', amapOperation.markerClick);
        if (markerViewingArea.size() == 0 && isFocus) {
            map.setZoomAndCenter(18, markerLngLat);//将这个点设置为中心点和缩放级别
            amapOperation.LimitedSize(6);// 第一个点限制范围
        }
        var timeOld = (new Date(info[7].replace(/-/g, '/'))).getTime();//获得时间（毫秒）
        var markerList = [
            marker, // marker
            [markerLngLat], // 坐标
            content, // 信息弹窗信息
            [info[8]], // 里程
            [timeOld], // 时间
            '0', // ?
            info[5], // 车辆状态
            info[6], // 车辆图标
            [info[4]], // 角度
        ];
        markerViewingArea.put(info[0], markerList);
    },
    // 保存可以区域外的监控对象信息
    saveMarkerOutsideInfo: function (info, content) {
        var id = info[0];
        // 删除可视区域内的信息
        if (markerViewingArea.containsKey(id)) {
            var marker = markerViewingArea.get(id)[0];
            marker.stopMove();
            map.remove([marker]);
            markerViewingArea.remove(id);
        }

        var markerLngLat = [info[2], info[3]]; // 经纬度
        // var angle = Number(info[24]) + 270; // 角度
        var timeOld = info[7] == null ? info[7] : (new Date(info[7].replace(/-/g, '/'))).getTime();//获得时间（毫秒）

        var markerList = [
            // markerRealTime, // marker
            [markerLngLat], // 坐标
            content, // 信息弹窗信息
            [info[8]], // 里程
            [timeOld], // 时间
            '0', // ?
            info[5], // ?
            [info[4]] // 角度
        ];

        if (markerOutside.containsKey(id)) {
            markerOutside.remove(id);
        }
        markerOutside.put(id, markerList);
    },
    // 监控对象进行移动
    markerMoveFun: function (info) {
        var id = info[0];
        var value = markerViewingArea.get(id);
        // 判断监控对象存储了多少个经纬度坐标，超过2个就暂时不移动
        if (value[1].length == 2) {
            // 平滑移动
            if (flagSwitching) {
                var presentPoint = value[1][0];
                var moveToPoint = value[1][1];

                // 判断如果两个点的经纬度相等，不执行移动事件且删除经纬度点
                if (presentPoint[0] == moveToPoint[0] && presentPoint[1] == moveToPoint[1]) {
                    markerViewingArea.remove(id);
                    value[1].splice(0, 1);
                    value[3].splice(0, 1);
                    value[4].splice(0, 1);
                    value[8].splice(0, 1);
                    markerViewingArea.put(id, value);
                } else {
                    var moveMarker = value[0];
                    var speed = amapOperation.markerMoveSpeed(value[3], value[4]); // marker移动速度
                    if (isNaN(speed)) {
                        speed = 50;
                    }
                    moveMarker.moveTo(moveToPoint, speed);
                    // 判断监控对象是否已经绑定了移动监听事件
                    if (!moveMarker.ej.moving) {
                        // 绑定移动监听事件
                        moveMarker.on('moving', function (e) {
                            amapOperation.markerMovingFun(e, id)
                        });
                    }
                    // 判断监控对象是否已经绑定了移动结束事件
                    if (!moveMarker.ej.moveend) {
                        // 绑定移动监听事件
                        moveMarker.on('moveend', function (e) {
                            amapOperation.markerMoveendFun(e, id)
                        });
                    }
                }
            } else { // 跳点
                amapOperation.markerJumpPoint(id, value);
            }
        }
    },
    // 跳点运动
    markerJumpPoint: function (id, value) {
        var marker = value[0];
        var movePosition = value[1][1];

        // marker设置经纬度
        marker.setPosition(movePosition);
        // 设置图标角度
        var angle;
        if (icoUpFlag) {
            angle = 0;
        } else {
            angle = Number(value[8][1]) + 270;
        }
        marker.setAngle(angle);

        // 判断跳到指定点是否超出范围
        if (!pathsTwo.contains(movePosition)) {
            map.setCenter(movePosition);
            amapOperation.pathsChangeFun();
            amapOperation.LimitedSizeTwo();
        }
        ;

        // 删除集合中已经走完的点
        markerViewingArea.remove(id);
        value[1].splice(0, 1);
        value[3].splice(0, 1);
        value[4].splice(0, 1);
        value[8].splice(0, 1);
        markerViewingArea.put(id, value);
        //车牌避让
        amapOperation.carNameEvade(
            id,
            marker.name,
            movePosition,
            null,
            "0",
            null,
            false,
            marker.stateInfo
        );
        // 跳点完成后，判断经纬度数据长度是否有堆积
        if (value[1].length > 1) {
            var newValue = markerViewingArea.get(id);
            amapOperation.markerJumpPoint(id, newValue);
        }
    },
    // 监控对象移动监听事件
    markerMovingFun: function (e, id) {
        var marker = markerViewingArea.get(id)[0];
        // 车牌向上
        if (icoUpFlag) {
            marker.setAngle(0);
        }
        amapOperation.carNameEvade(
            marker.extData,
            marker.name,
            marker.getPosition(),
            null,
            "0",
            null,
            false,
            marker.stateInfo
        );
        // 判断是否为聚焦跟踪监控对象
        if (markerFocus == marker.extData) {
            // amapOperation.LimitedSizeTwo();
            var msg = marker.getPosition();
            if (!pathsTwo.contains(msg)) {
                map.setCenter(msg);
            }
            ;
        }
        ;
    },
    // 监控对象移动结束事件
    markerMoveendFun: function (e, id) {
        var marker = markerViewingArea.get(id)[0];

        amapOperation.carNameEvade(
            marker.extData,
            marker.name,
            marker.getPosition(),
            false,
            '0',
            null,
            false,
            marker.stateInfo
        );

        var value = markerViewingArea.get(id);
        markerViewingArea.remove(id);
        value[1].splice(0, 1);
        value[3].splice(0, 1);
        value[4].splice(0, 1);
        value[8].splice(0, 1);
        markerViewingArea.put(id, value);
        // 判断行驶结束后
        if (value[1].length > 1) {
            if (flagSwitching) {
                // 监控对象图标持续移动
                amapOperation.markerContinueMoving(id);
            } else {
                // 跳点
                var newValue = markerViewingArea.get(id);
                amapOperation.markerJumpPoint(id, newValue);
            }
        }
    },
    // 监控对象图标持续移动
    markerContinueMoving: function (id) {
        var value = markerViewingArea.get(id);

        var presentPoint = value[1][0];
        var moveToPoint = value[1][1];

        // 判断如果两个点的经纬度相等，不执行移动事件且删除经纬度点
        if (presentPoint[0] == moveToPoint[0] && presentPoint[1] == moveToPoint[1]) {
            markerViewingArea.remove(id);
            value[1].splice(0, 1);
            value[3].splice(0, 1);
            value[4].splice(0, 1);
            value[8].splice(0, 1);
            markerViewingArea.put(id, value);
        } else {
            var moveMarker = value[0];
            var speed = amapOperation.markerMoveSpeed(value[3], value[4]); // marker移动速度
            moveMarker.moveTo(moveToPoint, speed);

            if (!moveMarker.ej.moving) {
                // 绑定移动监听事件
                moveMarker.on('moving', function (e) {
                    amapOperation.markerMovingFun(e, id)
                });
            }
            // 判断监控对象是否已经绑定了移动结束事件
            if (!moveMarker.ej.moveend) {
                // 绑定移动监听事件
                moveMarker.on('moveend', function (e) {
                    amapOperation.markerMoveendFun(e, id)
                });
            }
        }
    },
    // 计算marker移动速度
    markerMoveSpeed: function (mileage, time) {
        var speed;
        if (mileage != null) {
            var markerMileage = Number(mileage[1]) - Number(mileage[0]);
            var markerTime = (Number(time[1]) - Number(time[0])) / 1000 / 60 / 60;
            if (markerTime == 0) {
                speed = 50;
            } else {
                speed = Number((markerMileage / markerTime).toFixed(2));
            }
        } else {
            speed = 300;
        }
        return speed == 0 ? 100 : speed;
    },
    // 监控对象在地图层级改变或拖拽后状态更新
    markerStateListening: function () {
        // 根据地图层级变化相应改变paths
        amapOperation.pathsChangeFun();
        amapOperation.LimitedSizeTwo();

        var mapZoom = map.getZoom();
        // 判断地图层级是否大于等于11
        // 大于等于11：重新计算地图上哪些监控对象在可视区域内||区域外
        // 小于11：进行聚合
        if (mapZoom >= 11) {
            // 判断是否是刚从聚合状态切换过来
            // 如果是就把最新点集合的数据进行创建marker
            if (isCluster) {
                if (cluster != undefined) {
                    cluster.clearMarkers();
                }
                isCluster = false;
            }
            amapOperation.clusterToCreateMarker();
        } else {
            // 刚进入聚合状态，进行清空聚焦车辆
            if (!isCluster) {
                isCluster = true;
                amapOperation.clearFocusObj();
            }
            // 清空地图上已创建监控对象图标
            amapOperation.clearMapForMarker();
            // 创建地图可视区域聚合点
            amapOperation.createMarkerClusterer();
        }
    },
    // 清空聚焦车辆
    clearFocusObj: function () {
        markerFocus = null;
        $('#treeDemo li a').removeClass('curSelectedNode_dbClick');
        $('#treeDemo li a').removeClass('curSelectedNode');
        $('#realTimeStateTable tbody tr').removeClass('tableHighlight');
        $('#realTimeStateTable tbody tr').removeClass('tableHighlight-blue');
    },
    // 根据地图层级变化相应改变paths
    pathsChangeFun: function () {
        var mapZoom = map.getZoom();

        if (mapZoom == 18) {
            amapOperation.LimitedSize(6);
        } else if (mapZoom == 17) {
            amapOperation.LimitedSize(5);
        } else if (mapZoom == 16) {
            amapOperation.LimitedSize(4);
        } else if (mapZoom == 15) {
            amapOperation.LimitedSize(3);
        } else if (mapZoom == 14) {
            amapOperation.LimitedSize(2);
        } else if (mapZoom <= 13 && mapZoom >= 6) {
            amapOperation.LimitedSize(1);
        }
        ;
    },
    // 清空地图上已创建监控对象图标
    clearMapForMarker: function () {
        var values = markerViewingArea.values();

        for (var i = 0, len = values.length; i < len; i++) {
            var marker = values[i][0];
            marker.stopMove();
            map.remove([marker]);
        }
        // 清空可视区域内经纬度集合
        markerViewingArea.clear();
        // 清空可视区域外经纬度集合
        markerOutside.clear();
        // 清空地图上的监控对象名称
        var nameValues = carNameMarkerContentMap.values();
        map.remove(nameValues);
    },
    // 创建地图可视区域聚合点
    createMarkerClusterer: function () {
        if (cluster != undefined) {
            cluster.clearMarkers();
            cluster.off('click', amapOperation.clusterClickFun);
        }
        var values = markerAllUpdateData.values();
        var markerList = [];
        for (var i = 0, len = values.length; i < len; i++) {
            var markerLngLat = [values[i][0][2], values[i][0][3]];
            var id = values[i][0][0];
            var content = values[i][1];
            // if (paths.contains(markerLngLat)) {
            var marker = new AMap.Marker({
                position: markerLngLat,
                icon: "../../resources/img/1.png",
                offset: new AMap.Pixel(-26, -13), //相对于基点的位置
                autoRotation: true
            });
            marker.extData = id;
            marker.content = content.join("");
            marker.on('click', amapOperation.markerClick);
            markerList.push(marker);
            // }
        }
        cluster = new AMap.MarkerClusterer(map, markerList, {zoomOnClick: false});
        cluster.on('click', amapOperation.clusterClickFun);
    },
    // 聚合点击事件
    clusterClickFun: function (data) {
        var position = data.lnglat;
        var zoom = map.getZoom();
        if (zoom < 6) {
            map.setZoomAndCenter(6, position);
        } else {
            map.setZoomAndCenter(11, position);
        }

        // return false;
        // amapOperation.markerStateListening();
    },
    // 聚合状态刚消失创建marker
    clusterToCreateMarker: function () {
        var values = markerAllUpdateData.values();

        for (var i = 0, len = values.length; i < len; i++) {
            var id = values[i][0][0];
            var markerLngLat = [values[i][0][2], values[i][0][3]];

            if (paths.contains(markerLngLat) || markerFocus == id) {
                if (markerViewingArea.containsKey(id)) {
                    var marker = markerViewingArea.get(id)[0];

                    var info = values[i][0];
                    var carName = info[1];
                    var stateInfo = info[5];
                    amapOperation.carNameEvade(id, carName, marker.getPosition(), false, '0', null, false, stateInfo);
                } else {
                    amapOperation.createMarker(values[i][0], values[i][1], false);
                }
            } else {
                amapOperation.saveMarkerOutsideInfo(values[i][0], values[i][1]);
            }
        }
    },
    LimitedSizeTwo: function () {
        var southwest = map.getBounds().getSouthWest();
        var northeast = map.getBounds().getNorthEast();
        var mcenter = map.getCenter();                  //获取中心坐标
        var pixel2 = map.lnglatTocontainer(mcenter);//根据坐标获得中心点像素
        var mcx = pixel2.getX();                    //获取中心坐标经度像素
        var mcy = pixel2.getY();                    //获取中心坐标纬度像素
        var southwestx = mcx + (mcx * 0.8);
        var southwesty = mcy * 0.2;
        var northeastx = mcx * 0.2;
        var northeasty = mcy + (mcy * 0.8);
        var ll = map.containTolnglat(new AMap.Pixel(southwestx, southwesty));
        var lll = map.containTolnglat(new AMap.Pixel(northeastx, northeasty));
        pathsTwo = new AMap.Bounds(
            lll,//东北角坐标
            ll //西南角坐标
        );
    },
    LimitedSize: function (size) {
        paths = null;
        var southwest = map.getBounds().getSouthWest();//获取西南角坐标
        var northeast = map.getBounds().getNorthEast();//获取东北角坐标
        var possa = southwest.lat;//纬度（小）
        var possn = southwest.lng;
        var posna = northeast.lat;
        var posnn = northeast.lng;
        var psa = possa - ((posna - possa) * size);
        var psn = possn - ((posnn - possn) * size);
        var pna = posna + ((posna - possa) * size);
        var pnn = posnn + ((posnn - possn) * size);
        paths = new AMap.Bounds(
            [psn, psa], //西南角坐标
            [pnn, pna]//东北角坐标
        );
    },
    //车辆标注点击
    markerClick: function (e) {
        var markerLngLat = e.target.getPosition();
        vinfoWindwosClickVid = e.target.extData;
        infoWindow.setContent(e.target.content);
        infoWindow.open(map, markerLngLat);
        markerClickLngLat = markerLngLat;
    },
    jumpToTrackPlayer: function (sid, type, pid, uuids) {
        var jumpFlag = false;
        var permissionUrls = $("#permissionUrls").val();
        if (permissionUrls != null && permissionUrls != undefined) {
            var urllist = permissionUrls.split(",");
            if (urllist.indexOf("/v/monitoring/trackPlayback") > -1) {
                var uuidStr = JSON.stringify(uuids);
                sessionStorage.setItem('uuid', uuidStr);
                var url = "/clbs/v/monitoring/trackPlayBackLog";
                var data = {"vehicleId": sid, "type": type};
                json_ajax("POST", url, "json", false, data, null);
                setTimeout("dataTableOperation.logFindCilck()", 500);
                jumpFlag = true;
                location.href = "/clbs/v/monitoring/trackPlayback?vid=" + sid + "&type=" + type + "&pid=" + pid;
            }
        }
        if (!jumpFlag) {
            layer.msg("无操作权限，请联系管理员");
        }
    },
    // 实时路况点击
    realTimeRC: function () {
        if ($realTimeRC.attr("checked")) {
            realTimeTraffic.hide();
            $realTimeRC.attr("checked", false);
            $("#realTimeRCLab").removeClass("preBlue");
        } else {
            //取消谷歌地图选中状态
            if (googleMapLayer) {
                googleMapLayer.setMap(null);
            }
            $("#googleMap").attr("checked", false);
            $("#googleMapLab").removeClass("preBlue");
            /* if ($("#googleMap").attr("checked")) {
                 realTimeTraffic = new AMap.TileLayer.Traffic({zIndex: 100});
                 realTimeTraffic.setMap(map);
             }*/
            realTimeTraffic.show();
            $realTimeRC.attr("checked", true);
            $("#realTimeRCLab").addClass("preBlue");
        }
    },
    //卫星地图及3D地图切换
    satelliteMapSwitching: function () {
        if ($("#defaultMap").attr("checked")) {
            satellLayer.hide();
            buildings.setMap(map);
            if (googleMapLayer) {
                googleMapLayer.setMap(null);
            }
            $("#defaultMap").attr("checked", false);
            $("#defaultMapLab").removeClass("preBlue");
        } else {
            // 判断未切换到谷歌地图直接选择卫星地图时 未初始化问题
            if (googleMapLayer) {
                //取消谷歌地图选中状态
                googleMapLayer.setMap(null);
            }
            $("#googleMap").attr("checked", false);
            $("#googleMapLab").removeClass("preBlue");

            satellLayer.show();
            buildings.setMap(null);
            $("#defaultMap").attr("checked", true);
            $("#defaultMapLab").addClass("preBlue");
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
            $realTimeRC.attr("checked", false);
            $("#realTimeRCLab").removeClass("preBlue");
            realTimeTraffic.hide();
            $("#defaultMap").attr("checked", false);
            $("#defaultMapLab").removeClass("preBlue");
            satellLayer.hide();
            buildings.setMap(map);
        }
    },
    //工具操作
    toolClickList: function () {
        var id = $(this).attr('id');
        var i = $("#" + id).children('i');

        //显示设置
        if (id == 'displayClick') {
            if (!($("#mapDropSettingMenu").is(":hidden"))) {
                $("#mapDropSettingMenu").slideUp();
                $("#disSetMenu").slideDown();
            } else {
                if ($("#disSetMenu").is(":hidden")) {
                    $("#disSetMenu").slideDown();
                } else {
                    $("#disSetMenu").slideUp();
                }
            }
        }
        //地图设置
        else if (id == "mapDropSetting") {
            if (!($("#disSetMenu").is(":hidden"))) {
                $("#disSetMenu").slideUp();
                $("#mapDropSettingMenu").slideDown();
            } else {
                if ($("#mapDropSettingMenu").is(":hidden")) {
                    $("#mapDropSettingMenu").slideDown();
                } else {
                    $("#mapDropSettingMenu").slideUp();
                }
            }
        } else {

            // wjk 加一个通话功能 通话与视频可以同时存在
            var phoneCall_i = $('#phoneCall').find('i');
            var video_i = $('#btn-videoRealTime-show').find('i');
            if (!i.hasClass("active") && id == 'phoneCall' && video_i.hasClass('active') ||
                !i.hasClass("active") && id == 'btn-videoRealTime-show' && phoneCall_i.hasClass('active')) {

                i.addClass('active');
                $("#" + id).children('span.mapToolClick').css('color', '#6dcff6');
                mouseTool.close(true);
            }
            else
            //end


            if (i.hasClass("active")) {
                i.removeClass('active');
                $("#" + id).children('span.mapToolClick').css('color', '#5c5e62');
                mouseTool.close(true);

                // wjk 通话时取消视频也关闭时关闭画面
                if (id == 'phoneCall' && !video_i.hasClass('active')) {
                    $realTimeVideoReal.removeClass("realTimeVideoShow");
                    $mapPaddCon.removeClass("mapAreaTransform");
                }
                //end

            } else {
                $("#toolOperateClick i").removeClass('active');
                $("#toolOperateClick span.mapToolClick").css('color', '#5c5e62');
                i.addClass('active');
                $("#" + id).children('span.mapToolClick').css('color', '#6dcff6');
                mouseTool.close(true);
            }
            ;
            if (i.hasClass("active")) {
                // wjk
                // if (id == 'phoneCall') {
                //     $realTimeVideoReal.addClass("realTimeVideoShow");
                //     $mapPaddCon.addClass("mapAreaTransform");
                // }
                //end

                if (id == "magnifyClick") {
                    //拉框放大
                    mouseTool.rectZoomIn();
                } else if (id == "shrinkClick") {
                    //拉框放小
                    mouseTool.rectZoomOut();
                } else if (id == "countClick") {
                    //距离量算
                    isDistanceCount = true;
                    mouseTool.rule();
                } else if (id == "queryClick") {
                    //区域查车
                    isAreaSearchFlag = true;
                    mouseTool.rectangle();
                }
                ;
            }
            ;
            if (id == 'btn-videoRealTime-show') {
                // pageLayout.videoRealTimeShow();

                // wjk
                //先注释掉次数
                // json_ajax("POST", '/clbs/r/riskManagement/RiskCombat/canOpenMedia', "json", false, {'type':'video'}, function(res){
                // if (res == true) {
                pageLayout.videoRealTimeShow();
                // }else{ //实时视频总次数达到上限后不允许开启
                // i.removeClass('active');
                // $("#" + id).children('span.mapToolClick').css('color', '#5c5e62');
                // mouseTool.close(true);
                // layer.msg('视频总次数已达到上限')
                // }
                // })
            }

            // wjk 通话
            if (id == 'phoneCall') {
                // pageLayout.videoRealTimeShow();

                // wjk
                json_ajax("POST", '/clbs/r/riskManagement/RiskCombat/canOpenMedia', "json", false, {'type': 'audio'}, function (res) {
                    if (res == true) {
                        pageLayout.phoneCallRealTimeshow();
                    } else { //实时通话总次数达到上限后不允许开启
                        i.removeClass('active');
                        $("#" + id).children('span.mapToolClick').css('color', '#5c5e62');
                        mouseTool.close(true);
                        layer.msg('实时通话总次数已达到上限')
                    }
                })
            }
            //wjk end
        }
    },
    //车牌号规避
    carNameEvade: function (id, name, lnglat, flag, type, ico, showFlag, stateInfo) {
        //监控对象图片大小
        var value = lnglat;
        var picWidth = 0;
        var picHeight = 0;
        var icons;
        var span = getTextWH(name, {
            "fontSize": "12px",
            "fontFamily": "微软雅黑"
        });
        if (span.width > 70) {
            if (name.length > 8) {
                name = name.substring(0, 7) + '...';
            }
            var num = 0;
            for (var i = 0; i < name.length; i++) {//判断车牌号含有汉字数量
                if (name[i].match(/^[\u4E00-\u9FA5]{1,}$/)) {
                    num++;
                }
            }
            if (num > 3) {
                name = name.substring(0, 4) + '...';
            }

            span = getTextWH(name, {
                "fontSize": "12px",
                "fontFamily": "微软雅黑"
            });
            if (span.width > 70) {
                name = name.substring(0, name.length - 4) + '...';
            }
        }
        if (type == "0") {
            if (ico == "null" || ico == undefined || ico == null) {
                icons = "../../resources/img/vehicle.png";
            } else {
                icons = "../../resources/img/vico/" + ico;
            }
            picWidth = 58 / 2;
            picHeight = 26 / 2;
        } else if (type == "1") {
            if (ico == "null" || ico == undefined || ico == null) {
                icons = "../../resources/img/123.png";
            } else {
                icons = "../../resources/img/vico/" + ico;
            }
            picWidth = 30 / 2;
            picHeight = 30 / 2;
        } else if (type == "2") {
            if (ico == "null" || ico == undefined || ico == null) {
                icons = "../../resources/img/thing.png";
            } else {
                icons = "../../resources/img/vico/" + ico;
            }
            picWidth = 40 / 2;
            picHeight = 40 / 2;
        }
        if (isCarNameShow) {
            //显示对象姓名区域大小
            var nameAreaWidth = 90;
            var nameAreaHeight = 38;
            //车辆状态没判断
            var carState = amapOperation.stateCallBack(stateInfo);
            var id = id;
            var name = name;
            //判断是否第一个创建
            var markerAngle = 0; //图标旋转角度
            if (carNameMarkerMap.containsKey(id)) {
                var thisCarMarker = carNameMarkerMap.get(id);
                var ssmarker = new AMap.Marker({
                    icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                    position: [116.41, 39.91]
                });
                markerAngle = thisCarMarker.getAngle();
                var s = ssmarker.getAngle();
                if (markerAngle > 360) {
                    var i = Math.floor(markerAngle / 360);
                    markerAngle = markerAngle - 360 * i;
                }
                ;
            }
            //将经纬度转为像素
            var pixel = map.lngLatToContainer(value);
            var pixelX = pixel.getX();
            var pixelY = pixel.getY();
            var pixelPX = [pixelX, pixelY];
            //得到车辆图标四个角的像素点(假设车图标永远正显示)58*26
            var defaultLU = [pixelX - picWidth, pixelY - picHeight];//左上
            var defaultRU = [pixelX + picWidth, pixelY - picHeight];//右上
            var defaultLD = [pixelX - picWidth, pixelY + picHeight];//左下
            var defaultRD = [pixelX + picWidth, pixelY + picHeight];//右下
            //计算后PX
            var pixelRD = amapOperation.countAnglePX(markerAngle, defaultRD, pixelPX, 1, picWidth, picHeight);
            var pixelRU = amapOperation.countAnglePX(markerAngle, defaultRU, pixelPX, 2, picWidth, picHeight);
            var pixelLU = amapOperation.countAnglePX(markerAngle, defaultLU, pixelPX, 3, picWidth, picHeight);
            var pixelLD = amapOperation.countAnglePX(markerAngle, defaultLD, pixelPX, 4, picWidth, picHeight);
            //四点像素转为经纬度
            var llLU = map.containTolnglat(new AMap.Pixel(pixelLU[0], pixelLU[1]));
            var llRU = map.containTolnglat(new AMap.Pixel(pixelRU[0], pixelRU[1]));
            var llLD = map.containTolnglat(new AMap.Pixel(pixelLD[0], pixelLD[1]));
            var llRD = map.containTolnglat(new AMap.Pixel(pixelRD[0], pixelRD[1]));
            //车牌显示位置左上角PX
            var nameRD_LU = [pixelRD[0], pixelRD[1]];
            var nameRU_LU = [pixelRU[0], pixelRU[1] - nameAreaHeight];
            var nameLU_LU = [pixelLU[0] - nameAreaWidth, pixelLU[1] - nameAreaHeight];
            var nameLD_LU = [pixelLD[0] - nameAreaWidth, pixelLD[1]];
            //分别将上面四点转为经纬度
            var llNameRD_LU = map.containTolnglat(new AMap.Pixel(nameRD_LU[0], nameRD_LU[1]));
            var llNameRU_LU = map.containTolnglat(new AMap.Pixel(nameRU_LU[0], nameRU_LU[1]));
            var llNameLU_LU = map.containTolnglat(new AMap.Pixel(nameLU_LU[0], nameLU_LU[1]));
            var llNameLD_LU = map.containTolnglat(new AMap.Pixel(nameLD_LU[0], nameLD_LU[1]));
            //判断车牌号该显示的区域
            var isOneArea = true;
            var isTwoArea = true;
            var isThreeArea = true;
            var isFourArea = true;
            //取出所有的左上角的经纬度并转为像素
            var contentArray = [];
            if (!carNameContentLUMap.isEmpty()) {
                carNameContentLUMap.remove(id);
                var carContent = carNameContentLUMap.values();
                for (var i = 0; i < carContent.length; i++) {
                    var contentPixel = map.lngLatToContainer(carContent[i]);
                    contentArray.push([contentPixel.getX(), contentPixel.getY()]);
                }
                ;
            }
            ;
            if (contentArray.length != 0) {
                for (var i = 0; i < contentArray.length; i++) {
                    if (!((contentArray[i][0] + nameAreaWidth) <= nameRD_LU[0] || (contentArray[i][1] + nameAreaHeight) <= nameRD_LU[1] || (nameRD_LU[0] + nameAreaWidth) <= contentArray[i][0] || (nameRD_LU[1] + nameAreaHeight) <= contentArray[i][1])) {
                        isOneArea = false;
                    }
                    ;
                    if (!((contentArray[i][0] + nameAreaWidth) <= nameRU_LU[0] || (contentArray[i][1] + nameAreaHeight) <= nameRU_LU[1] || (nameRU_LU[0] + nameAreaWidth) <= contentArray[i][0] || (nameRU_LU[1] + nameAreaHeight) <= contentArray[i][1])) {
                        isTwoArea = false;
                    }
                    ;
                    if (!((contentArray[i][0] + nameAreaWidth) <= nameLU_LU[0] || (contentArray[i][1] + nameAreaHeight) <= nameLU_LU[1] || (nameLU_LU[0] + nameAreaWidth) <= contentArray[i][0] || (nameLU_LU[1] + nameAreaHeight) <= contentArray[i][1])) {
                        isThreeArea = false;
                    }
                    ;
                    if (!((contentArray[i][0] + nameAreaWidth) <= nameLD_LU[0] || (contentArray[i][1] + nameAreaHeight) <= nameLD_LU[1] || (nameLD_LU[0] + nameAreaWidth) <= contentArray[i][0] || (nameLD_LU[1] + nameAreaHeight) <= contentArray[i][1])) {
                        isFourArea = false;
                    }
                    ;
                }
                ;
            }
            ;
            var isConfirm = true;
            var mapPixel;
            var LUPX;
            var showLocation;
            if (isOneArea) {
                mapPixel = llRD;
                LUPX = llNameRD_LU;
                offsetCarName = new AMap.Pixel(0, 0);
                isConfirm = false;
                showLocation = "carNameShowRD";
            } else if (isConfirm && isTwoArea) {
                mapPixel = llRU;
                LUPX = llNameRU_LU;
                offsetCarName = new AMap.Pixel(0, -nameAreaHeight);
                isConfirm = false;
                showLocation = "carNameShowRU";
            } else if (isThreeArea && isConfirm) {
                mapPixel = llLU;
                LUPX = llNameLU_LU;
                offsetCarName = new AMap.Pixel(-nameAreaWidth, -nameAreaHeight);
                isConfirm = false;
                showLocation = "carNameShowLU";
            } else if (isFourArea && isConfirm) {
                mapPixel = llLD;
                LUPX = llNameLD_LU;
                offsetCarName = new AMap.Pixel(-nameAreaWidth, 0);
                isConfirm = false;
                showLocation = "carNameShowLD";
            }
            ;
            if (mapPixel == undefined) {
                mapPixel = llRD;
                LUPX = llNameRD_LU;
                offsetCarName = new AMap.Pixel(0, 0);
                showLocation = "carNameShowRD";
            }
            ;
        }
        ;
        if (flag != null) {
            if (flag) {//创建marker
                //车辆
                if (!showFlag) {
                    var markerLocation = new AMap.Marker({
                        position: value,
                        icon: icons,
                        offset: new AMap.Pixel(-picWidth, -picHeight), //相对于基点的位置
                        autoRotation: true,//自动调节图片角度
                        map: map,
                    });
                    markerLocation.name = name;
                    //车辆名
                    carNameMarkerMap.put(id, markerLocation);
                }
                ;
                if (isCarNameShow) {
                    var carContent = "<p class='" + showLocation + "'><i class='" + carState + "'></i>&nbsp;" + name + "</p>";
                    if (carNameMarkerContentMap.containsKey(id)) {
                        var nameValue = carNameMarkerContentMap.get(id);
                        map.remove([nameValue]);
                        carNameMarkerContentMap.remove(id);
                        carNameContentLUMap.remove(id);
                    }
                    ;
                    var markerContent = new AMap.Marker({
                        position: mapPixel,
                        content: carContent,
                        offset: offsetCarName,
                        autoRotation: true,//自动调节图片角度
                        map: map,
                        zIndex: 999

                    });
                    markerContent.setMap(map);
                    carNameMarkerContentMap.put(id, markerContent);
                    carNameContentLUMap.put(id, LUPX);
                    if (isConfirm) {
                        markerContent.hide();
                        carNameContentLUMap.remove(id);
                    } else {
                        markerContent.show();
                    }
                    ;
                }
                ;
                if (!showFlag) {
                    return markerLocation;
                }
                ;
            } else {//改变位置
                if (isCarNameShow) {
                    var carContentHtml = "<p class='" + showLocation + "'><i class='" + carState + "'></i>&nbsp;" + name + "</p>";
                    if (carNameMarkerContentMap.containsKey(id)) {
                        var carContent = carNameMarkerContentMap.get(id);
                        if (isConfirm) {
                            carContent.hide();
                            carNameContentLUMap.remove(id);
                        } else {
                            // map.remove([carContent]);
                            carContent.show();
//                            carNameMarkerContentMap.remove(id);
//                            var markerContent = new AMap.Marker({
//                                position: mapPixel,
//                                content: carContentHtml,
//                                offset: offsetCarName,
//                                autoRotation: true,//自动调节图片角度
//                                map: map,
//                                zIndex: 999
//                            });
//                            markerContent.setMap(map);
//                            carNameMarkerContentMap.put(id, markerContent);

                            carContent.setContent(carContentHtml);
                            carContent.setPosition(mapPixel);
                            carContent.setOffset(offsetCarName);
                            carNameContentLUMap.put(id, LUPX);
                        }
                    }
                    ;
                }
                ;
            }
            ;
        } else {
            if (isCarNameShow) {
                var carContentHtml = "<p class='" + showLocation + "'><i class='" + carState + "'></i>&nbsp;" + name + "</p>";
                if (carNameMarkerContentMap.containsKey(id)) {
                    var thisMoveMarker = carNameMarkerContentMap.get(id);
                    if (isConfirm) {
                        thisMoveMarker.hide();
                    } else {
                        thisMoveMarker.show();
                        thisMoveMarker.setContent(carContentHtml);
                        thisMoveMarker.setPosition(mapPixel);
                        thisMoveMarker.setOffset(offsetCarName);
                    }
                    carNameContentLUMap.put(id, LUPX);
                }
                ;
            }
            ;
        }
        ;
    },
    //计算车牌号四个定点的像素坐标
    countAnglePX: function (angle, pixel, centerPX, num, picWidth, picHeight) {
        var thisPX;
        var thisX;
        var thisY;
        if ((angle <= 45 && angle > 0) || (angle > 180 && angle <= 225) || (angle >= 135 && angle < 180) || (angle >= 315 && angle < 360)) {
            angle = 0;
        }
        ;
        if ((angle < 90 && angle > 45) || (angle < 270 && angle > 225) || (angle > 90 && angle < 135) || (angle > 270 && angle < 315)) {
            angle = 90;
        }
        ;
        if (angle == 90 || angle == 270) {
            if (num == 1) {
                thisX = centerPX[0] + picHeight;
                thisY = centerPX[1] + picWidth;
            }
            ;
            if (num == 2) {
                thisX = centerPX[0] + picHeight;
                thisY = centerPX[1] - picWidth;
            }
            ;
            if (num == 3) {
                thisX = centerPX[0] - picHeight;
                thisY = centerPX[1] - picWidth;
            }
            ;
            if (num == 4) {
                thisX = centerPX[0] - picHeight;
                thisY = centerPX[1] + picWidth;
            }
            ;
        }
        ;
        if (angle == 0 || angle == 180 || angle == 360) {
            thisX = pixel[0];
            thisY = pixel[1];
        }
        ;
        thisPX = [thisX, thisY];
        return thisPX;
    },
    // 监控对象状态返回
    stateCallBack: function (stateInfo) {
        var state;
        switch (stateInfo) {
            case 4:
                state = 'carStateStop';
                break;
            case 10:
                state = 'carStateRun';
                break;
            case 5:
                state = 'carStateAlarm';
                break;
            case 2:
                state = 'carStateMiss';
                break;
            case 3:
                state = 'carStateOffLine';
                break;
            case 9:
                state = 'carStateOverSpeed';
                break;
            case 11:
                state = 'carStateheartbeat';
                break;
        }
        ;
        return state;
    },
    //重新设置区域
    setCarNameCircle: function () {
        var markerMapValue = markerMap.values();
        if (markerMapValue != undefined) {
            //清空车牌号显示位置信息
            carNameContentLUMap.clear();
            for (var i = 0; i < markerMapValue.length; i++) {
                var carId = markerMapValue[i][0].extData;
                var carName = markerMapValue[i][0].name;
                var stateInfo = markerMapValue[i][0].stateInfo;
                var lngLatValue = markerMapValue[i][0].getPosition();
                //
                if (isCarNameShow) {
                    if (markerMapValue[i][5] == "1") {
                        amapOperation.carNameEvade(carId, carName, lngLatValue, false, "1", null, false, stateInfo);
                    } else {
                        amapOperation.carNameEvade(carId, carName, lngLatValue, false, "0", null, false, stateInfo);
                    }
                }
                ;
            }
            ;
        }
        ;
    },
    //清空所有content marker的value值
    clearContentValue: function () {
        if (!carNameMarkerContentMap.isEmpty()) {
            var contentValue = carNameMarkerContentMap.values();
            map.remove(contentValue);
            carNameMarkerContentMap.clear();
        }
        ;
    },
    vStatusInfoShow: function (data, group, people, alam) {
        //获取当前车辆点击的经纬度
        var currentCarCoordinate = "";
        if (map.getZoom() >= 11) {
            currentCarCoordinate = (markerViewingArea.get(vinfoWindwosClickVid))[0].getPosition();
        } else {
            currentCarCoordinate = markerClickLngLat;
        }
        //点击时判断是否显示信息框
        if ($("#v-statusInfo-show").is(":hidden")) {
            //执行显示
            $("#basicStatusInformation").removeAttr("class");
            $("#basicStatusInformation").addClass("col-md-4");
            $("#basicStatusInformation").parent().css("width", "574px");
            $("#vStatusInfoShowMore").removeClass("fa-chevron-circle-right").addClass("fa-chevron-circle-left");
            $("#v-statusInfo-show").show();
            //执行信息框底部移动方法
            amapOperation.amapInfoSharpAdaptiveFn();
            //执行信息框整体基点位置方法
            infoWindow.setPosition(currentCarCoordinate);
            $("#basicStatusInformation").css({"width": "158px", "margin-right": "20px"});
            //加入数据
            var dataList = data.split(",");
            var num = +dataList[17];
            var dataa = num.toString(2);
            dataa = (Array(32).join(0) + dataa).slice(-32);//高位补零
            if (dataList[16] == 1) {
                $("#bombBox0").text("单次回报应答");
            }
            $("#bombBox1").text(alam);
            if (dataa.substring(29, 30) == 0) {
                $("#bombBox2").text("北纬：" + dataList[10]);
            } else if (dataa.substring(30, 31) == 1) {
                $("#bombBox2").text("南纬：" + dataList[10]);
            }
            ;
            if (dataa.substring(28, 29) == 0) {
                $("#bombBox3").text("东经：" + dataList[11]);
            } else if (dataa.substring(28, 29) == 1) {
                $("#bombBox3").text("西经：" + dataList[11]);
            }

            $("#bombBox4").text("方向：" + dataTableOperation.toDirectionStr(dataList[21]));
            $("#bombBox5").text("记录仪速度：" + dataList[20]);
            $("#bombBox6").text("高程：" + dataList[19]);
            $("#bombBox7").text("电子运单：");
            if (people == "null") {
                people = "";
            }
            $("#bombBox8").text("从业人员：" + people);
            var peopleIDcard = "";
            if (dataList[18] == "null") {
                peopleIDcard = "";
            } else {
                peopleIDcard = dataList[18];
            }
            $("#bombBox9").text("从业资格证号：" + peopleIDcard);
            if (dataa.substring(27, 28) == 0) {
                $("#bombBox10").text("运营状态");
            } else if (dataa.substring(27, 28) == 1) {
                $("#bombBox10").text("停运状态");
            }
            ;
            if (dataa.substring(21, 22) == 0) {
                $("#bombBox11").text("车辆油路正常");
            } else if (dataa.substring(21, 22) == 1) {
                $("#bombBox11").text("车辆油路断开");
            }
            ;
            if (dataa.substring(20, 21) == 0) {
                $("#bombBox12").text("车辆电路正常");
            } else if (dataa.substring(20, 21) == 1) {
                $("#bombBox12").text("车辆电路断开");
            }
            ;
            if (dataa.substring(19, 20) == 0) {
                $("#bombBox13").text("车门解锁");
            } else if (dataa.substring(19, 20) == 1) {
                $("#bombBox13").text("车门加锁");
            }
            ;
        } else {
            //执行显示
            $("#basicStatusInformation").removeAttr("class");
            $("#basicStatusInformation").addClass("col-md-12");
            $("#basicStatusInformation").parent().css("width", "196px");
            $("#vStatusInfoShowMore").removeClass("fa-chevron-circle-left").addClass("fa-chevron-circle-right");
            $("#v-statusInfo-show").hide();
            //执行信息框底部移动方法
            amapOperation.amapInfoSharpAdaptiveFn();
            //执行信息框整体基点位置方法
            infoWindow.setPosition(currentCarCoordinate);
            $("#basicStatusInformation").css("width", "none");
        }
    },
    //车牌号标注是否显示
    carNameState: function (flag) {
        var carNameMarkerValue;
        if (!carNameMarkerContentMap.isEmpty()) {
            carNameMarkerValue = carNameMarkerContentMap.values();
        }
        ;
        if (flag) {
            //重新计算对象名称位置
            amapOperation.carNameShow();
        } else {
            if (carNameMarkerValue != undefined) {
                for (var i = 0, len = carNameMarkerValue.length; i < len; i++) {
                    carNameMarkerValue[i].hide();
                }
                ;
            }
            ;
        }
        ;
    },
    // 重新计算对象名称位置
    carNameShow: function () {
        //清空车牌号显示位置信息
        if (map.getZoom() > 10) {
            var values = markerViewingArea.values();
            for (var i = 0, len = values.length; i < len; i++) {
                var marker = values[i][0]; // [7] 图标
                var id = marker.extData;
                var name = marker.name;
                var markerLngLat = marker.getPosition();
                var icon = values[i][7];
                var stateInfo = marker.stateInfo;
                amapOperation.carNameEvade(id, name, markerLngLat, true, "1", icon, true, stateInfo);
            }
        }
        ;
    },
    //手动清除label错误提示语
    clearLabel: function () {
        $('label.error').remove();
    },
    //监控对象信息框更多显示方法
    amapInfoSharpAdaptiveFn: function () {
        if ($("#v-statusInfo-show").is(":hidden")) {
            $(".amap-info-sharp").removeClass("amap-info-sharp-marleft-hide");
            $(".amap-info-sharp").removeClass("amap-info-sharp-marleft-show");
            $(".amap-info-sharp").addClass("amap-info-sharp-marleft-hide");
        } else {
            $(".amap-info-sharp").removeClass("amap-info-sharp-marleft-hide");
            $(".amap-info-sharp").removeClass("amap-info-sharp-marleft-show");
            $(".amap-info-sharp").addClass("amap-info-sharp-marleft-show");
        }
    },
    //显示obd信息窗口
    showObdInfo: function (name, id) {
        var highLight = $("#realTimeStateTable .tableHighlight-blue,#realTimeStateTable .tableHighlight");
        var len = highLight.length;
        var isShow = false;
        if (name != undefined || len > 0) {
            isShow = true;
        }
        if (isShow) {
            $(this).hide();
            $('.loadingBox').show();
            $('#obdInfo').html('');
            if (name) {
                amapOperation.setObdInfo(name, id);
            } else {
                amapOperation.setObdInfo();
            }
            $('.obdContent').slideDown();
        } else {
            layer.msg('请双击监控对象');
        }
    },

    // 设置OBD窗口信息信息
    setObdInfo: function (name, id) {
        var highLight = $("#realTimeStateTable .tableHighlight-blue,#realTimeStateTable .tableHighlight");
        var vName = highLight.find('td').eq(1).text();
        var vId = highLight.find('td').eq(1).data('id');
        if (name != undefined) {
            vName = name;
            vId = id;
        }
        $("#obdName").html(vName);
        var url = '/clbs/v/monitoring/getLastOBDData';
        var param = {
            'vehicleId': vId
        }
        json_ajax("POST", url, "json", true, param, function (data) {
            if (data.success) {
                var obdInfo = data.obj;
                amapOperation.changeObdInfo(obdInfo);
            } else {
                $('.loadingBox').hide();
                $('#obdInfo').html('<li class="text-center">无数据</li>');
            }
        });
    },
    // 修改OBD信息
    changeObdInfo: function (data) {
        var info = null;
        if (data.data.msgBody.obdObjStr != undefined) {
            info = data.data.msgBody.obdObjStr;
        }
        var newHtml = '<li class="text-center">无数据</li>';
        if (info != undefined && info != null) {
            newHtml = '';
            var arr = JSON.parse(info);
            var len = arr.length;
            for (var i = 0; i < len; i++) {
                if (arr[i].name == '报警信息') {
                    newHtml += '<li style="text-align: justify">' + arr[i].name + '：' + arr[i].status + '</li>';
                } else {
                    newHtml += '<li>' + arr[i].name + '：' + arr[i].status + '</li>';
                }
            }
        }
        $('.loadingBox').hide();
        $('#obdInfo').html(newHtml);
    }
};
var setting;
var bflag = true;
var eflag = true;
var onLineIsExpandAll = false;
var cheakedAll = [];
var cheackGourpNum;
var allflag = true;
var missAll = false;
var fzzflag = false;
var stopVidArray = [];
var runVidArray = [];
var lineAndStop = [];
var nmoline = [];
var lineAndmiss = [];
var lineAndRun = [];
var lineAndAlarm = [];
var overSpeed = [];
var heartBeat = [];
var treeNodeNew;
// 有时间的命令字,控制时间控件开启或关闭
var commandSign = ["8H", "9H", "10H", "11H", "12H", "13H", "14H", "15H"];
var isInitDatePicker = true;// 避免重复初始化
var treeMonitoring = {
    // 初始化
    init: function () {
        // 多媒体检索和多媒体上传时间赋值
        var nowDate = new Date();
        msStartTime = nowDate.getFullYear()
            + "-"
            + (parseInt(nowDate.getMonth() + 1) < 10 ? "0"
                + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate
                .getMonth() + 1))
            + "-"
            + (nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate())
            + " " + "00:00:00";
        msEndTime = nowDate.getFullYear()
            + "-"
            + (parseInt(nowDate.getMonth() + 1) < 10 ? "0"
                + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate
                .getMonth() + 1))
            + "-"
            + (nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate())
            + " " + ("23") + ":" + ("59") + ":" + ("59");

        $("#msStartTime").val(msStartTime);
        $("#msEndTime").val(msEndTime);
        $("#muStartTime").val(msStartTime);
        $("#muEndTime").val(msEndTime);
        if ($("#tall").text() === "(...)") {


            json_ajax("POST", "/clbs/m/functionconfig/fence/bindfence/getStatistical", "json", true, null, treeMonitoring.setNumber);
        }
        //修改终端车牌
        $("#continuousReturnValue").bind('change', function () {
            if ($(this).val() == 0) {
                $('#timeInterval0').show();
                $('#timeInterval2').hide();
                $('#timeInterval1').hide();
            } else if ($(this).val() == 1) {
                $('#timeInterval1').show();
                $('#timeInterval0').hide();
                $('#timeInterval2').hide();
            } else if ($(this).val() == 2) {
                $('#timeInterval2').show();
                $('#timeInterval0').hide();
                $('#timeInterval1').hide();
            }
        });
        //OBD
        $("#classification").bind('change', function () {
            if ($(this).val() == 0) {
                $('#modelName').html("<label class='text-danger'>*</label> 车型名称：");
                treeMonitoring.getOBDVehicle();
            } else if ($(this).val() == 1) {
                $('#modelName').html("<label class='text-danger'>*</label> 发动机类型：");
                treeMonitoring.getOBDVehicle();
            }
        })
    },
    // 双击车辆，车辆居中
    centerMarker: function (id, type) {
        var id = id
        if (type == 'DBLCLICK') {
            markerFocus = id;
        }
        var zoom = map.getZoom();
        // 判断可视区域集合里面是否已经创建了marker
        if (markerViewingArea.containsKey(id)) {
            var marker = markerViewingArea.get(id)[0];
            map.setZoomAndCenter(18, marker.getPosition());
        } else {
            if (markerAllUpdateData.containsKey(id)) {
                var info = markerAllUpdateData.get(id);
                var markerLngLat = [info[0][2], info[0][3]];
                map.setZoomAndCenter(18, markerLngLat);
            }
        }
        setTimeout(function () {
            amapOperation.markerStateListening();
        }, zoom < 13 ? 500 : 0);
    },
    centerMarkerNo: function () {
        markerFocus = null;
    },
    //取消点
    clearMarker: function (param) {
        for (var i = 0, len = param.length; i < len; i++) {
            var id = param[i].vehicleID; // 监控对象ID

            // 删除所有监控对象集合信息
            if (markerAllUpdateData.containsKey(id)) {
                markerAllUpdateData.remove(id);
            }

            // 删除可视区域内监控对象集合信息
            if (markerViewingArea.containsKey(id)) {
                var marker = markerViewingArea.get(id)[0]
                marker.stopMove();
                map.remove([marker]);
                markerViewingArea.remove(id);
            }

            // 删除可视区域外监控对象集合信息
            if (markerOutside.containsKey(id)) {
                markerOutside.remove(id);
            }

            // 删除车牌号marker图标
            if (carNameMarkerMap.containsKey(id)) {
                var marker = carNameMarkerMap.get(id);
                marker.stopMove();
                map.remove([marker]);
                carNameMarkerMap.remove(id);
            }
        }
        // 关闭地图信息弹窗
        map.clearInfoWindow();
    },
    //组织树预处理函数
    ajaxDataFilter: function (treeId, parentNode, responseData) {
        responseData = JSON.parse(ungzip(responseData));
        return responseData;
    },
    zTreeOnNodeCreated: function (event, treeId, treeNode) {
        var id = treeNode.id.toString();
        var list = [];
        if (zTreeIdJson[id] == null) {
            list = [treeNode.tId];
            zTreeIdJson[id] = list;
        } else {
            zTreeIdJson[id].push(treeNode.tId)
        }
    },
    //车辆树加载成功事件
    zTreeOnAsyncSuccess: function (event, treeId, treeNode, msg) {
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        var nodes = treeObj.getCheckedNodes(true);
        allNodes = treeObj.getNodes();
        var childNodes = zTree.transformToArray(allNodes[0]);
        var initLen = 0;
        initArr = [];
        notExpandNodeInit = zTree.getNodesByFilter(assignmentNotExpandFilter);
        zTree.expandNode(notExpandNodeInit[0], true, true, false, true);
        for (var i = 0; i < notExpandNodeInit.length; i++) {
            initArr.push(i)
            initLen += notExpandNodeInit[i].children.length;
            if (initLen >= 400) {
                break;
            }
        }
        if (onLineIsExpandAll == true) {
            for (var j = 0; j < initArr.length; j++) {
                zTree.expandNode(notExpandNodeInit[j], true, true, false, true);
            }
            onLineIsExpandAll = false;
        }
        var jumpId = $("#jumpId").val();
        if (jumpId == "trackPlayer") {
            var cheakdiyueall = [];
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].type === "vehicle" || nodes[i].type === "people" || nodes[i] == "thing") {
                    cheakdiyueall.push(nodes[i].id)
                }
            }
            var param = [];
            cheakdiyuealls = treeMonitoring.unique(cheakdiyueall);
            for (var j = 0; j < cheakdiyuealls.length; j++) {
                var obj = new Object();
                obj.vehicleID = cheakdiyuealls[j];
                param.push(obj)
            }
            var requestStrS = {
                "desc": {
                    "MsgId": 40964,
                    "UserName": $("#userName").text()
                },
                "data": param
            };
            webSocket.subscribe(headers, '/user/' + $("#userName").text() + '/location', treeMonitoring.updataRealTree, "/app/vehicle/location", requestStrS);
        }
        bflag = false;
    },
    //模糊查询
    searchNeverOnline: function (treeId, searchConditionId) {
        //<2>.得到模糊匹配搜索条件的节点数组集合
        var highlightNodes = new Array();
        if (searchConditionId != "") {
            var treeObj = $.fn.zTree.getZTreeObj(treeId);
            highlightNodes = treeObj.getNodesByParamFuzzy("id", searchConditionId, null);
            return highlightNodes;
        }
    },
    // 获取车辆状态
    searchByFlag: function (treeId, searchConditionId, flag, type) {
        //<2>.得到模糊匹配搜索条件的节点数组集合
        var highlightNodes = new Array();
        if (searchConditionId != "") {
            var treeObj = $.fn.zTree.getZTreeObj(treeId);
            highlightNodes = treeObj.getNodesByParamFuzzy("id", searchConditionId, null);
        }
        //<3>.高亮显示并展示【指定节点s】
        treeMonitoring.highlightAndExpand(treeId, highlightNodes, flag, type);
    },
    highlightAndExpand: function (treeId, highlightNodes, flag, type) {
        var treeObj = $.fn.zTree.getZTreeObj(treeId);
        //<3>.把指定节点的样式更新为高亮显示，并展开
        if (highlightNodes != null) {
            for (var i = 0; i < highlightNodes.length; i++) {
                //高亮显示节点的父节点的父节点....直到根节点，并展示
                treeMonitoring.setFontCss(treeId, highlightNodes[i], type);
                var parentNode = highlightNodes[i].getParentNode();
            }
        }
    },
    // 递归得到指定节点的父节点的父节点....直到根节点
    getParentNodes: function (treeId, node) {
        if (node != null) {
            var treeObj = $.fn.zTree.getZTreeObj(treeId);
            var parentNode = node.getParentNode();
            return treeMonitoring.getParentNodes(treeId, parentNode);
        }
        return node;

    },
    // 设置树节点字体样式
    setFontCss: function (treeId, treeNode, type) {
        var treeObj = $.fn.zTree.getZTreeObj(treeId);
        //在线停车图标
        if (type == 1) {
            if (lineAndStop.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea onlineParking";
                var nodeID = treeNode.tId + "_span";
                vnodesId.push(nodeID);
                treeObj.updateNode(treeNode);
            }
            if (nmoline.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea offlineIcon";
                var nodeID = treeNode.tId + "_span";
                vnodemId.push(nodeID);
                treeObj.updateNode(treeNode);
            }
            if (lineAndmiss.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea onlineNotPositioning";
                var nodeID = treeNode.tId + "_span";
                vnodelmId.push(nodeID);
                treeObj.updateNode(treeNode);
            }
            if (lineAndRun.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea onlineDriving";
                var nodeID = treeNode.tId + "_span";
                vnoderId.push(nodeID);
                treeObj.updateNode(treeNode);
            }
            if (lineAndAlarm.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea warning";
                var nodeID = treeNode.tId + "_span";
                vnodeaId.push(nodeID);
                treeObj.updateNode(treeNode);
            }
            if (overSpeed.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea speedLimitWarning";
                var nodeID = treeNode.tId + "_span";
                vnodespId.push(nodeID);
                treeObj.updateNode(treeNode);
            }
            if (heartBeat.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea heartBeatWarning";
                var nodeID = treeNode.tId + "_span";
                vnodespId.push(nodeID);
                treeObj.updateNode(treeNode);
            }
        }
        if (type == 4) {
            if (lineAndStop.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea onlineParking";
                var nodeID = treeNode.tId + "_span";
                treeObj.updateNode(treeNode);
                $("#" + nodeID).css('color', '#c80002');
            } else if (lineAndmiss.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea onlineNotPositioning";
                var nodeID = treeNode.tId + "_span";
                treeObj.updateNode(treeNode);
                $("#" + nodeID).css('color', '#754801');
            } else if (lineAndRun.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea onlineDriving";
                var nodeID = treeNode.tId + "_span";
                treeObj.updateNode(treeNode);
                $("#" + nodeID).css('color', '#78af3a');
            } else if (lineAndAlarm.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea warning";
                var nodeID = treeNode.tId + "_span";
                treeObj.updateNode(treeNode);
                $("#" + nodeID).css('color', '#ffab2d');
            } else if (overSpeed.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea speedLimitWarning";
                var nodeID = treeNode.tId + "_span";
                treeObj.updateNode(treeNode);
                $("#" + nodeID).css('color', '#960ba3');
            } else if (nmoline.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea offlineIcon";
                var nodeID = treeNode.tId + "_span";
                treeObj.updateNode(treeNode);
                $("#" + nodeID).css('color', '#b6b6b6');
            } else if (heartBeat.isHas(treeNode.id)) {
                treeNode.iconSkin = "btnImage iconArea heartBeatWarning";
                var nodeID = treeNode.tId + "_span";
                treeObj.updateNode(treeNode);
                $("#" + nodeID).css('color', '#fb8c96');
            }
        }
        if (type == 2) {
            treeObj.checkNode(treeNode, true, true);
            treeObj.expandNode(treeNode.getParentNode(), true, true, false, true)
        }
        if (type == 3) {
            treeObj.checkNode(treeNode, false, true);
        }
        if (type == 5) {
            treeObj.hideNodes(treeNode)
        }
    },
    unique: function (arr) {
        var result = [], hash = {};
        for (var i = 0, elem; (elem = arr[i]) != null; i++) {
            if (!hash[elem]) {
                result.push(elem);
                hash[elem] = true;
            }
        }
        return result;
    },
    //车辆树取消点击事件
    zTreeBeforeClick: function () {
        return true;
    },
    //单击事件
    onClickV: function (e, treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        if (treeNode.iconSkin != "assignmentSkin" && treeNode.iconSkin != "groupSkin") {
            zTree.selectNode(treeNode, false, true);
        }
        var nodes = zTree.getSelectedNodes(true);
        var nodeName = treeNode.id;
        treeMonitoring.centerMarkerNo();
        if (treeNode.checked) {
            treeMonitoring.centerMarker(nodes[0].id, 'CLICK');
        }
        $("#" + dbclickCheckedId).parent().removeAttr("class", "curSelectedNode_dbClick"); //单击时取消双击Style
        $("#" + ztreeStyleDbclick).children("a").removeAttr("class", "curSelectedNode_dbClick");
        $(".ztree li a").removeClass("curSelectedNode_dbClick");
        //得到当前单击车辆的外层id信息
        onClickVId = e.target.id;
        if (treeNode.iconSkin != "assignmentSkin" && treeNode.iconSkin != "groupSkin") {
            $("#" + onClickVId).parent().attr("class", "curSelectedNode");
            $("#" + onClickVId).parent().attr("data-id", nodeName);
        }
        //单击下一辆车取消上一辆
        if (oldOnClickVId != "") {
            $("#" + oldOnClickVId).parent().removeAttr("class");
        }
        oldOnClickVId = onClickVId;
        //处理单击订阅同一辆车
        if (oldOnClickVId = onClickVId) {
            $("#" + onClickVId).parent().attr("class", "curSelectedNode");
            $("#" + onClickVId).parent().attr("data-id", nodeName);
        }
        dataTableOperation.tableHighlightBlue(treeNode.type, nodeName);
        //单击时判断节点是否勾选订阅 用于围栏查询
        treeMonitoring.vehicleTreeClickGetFenceInfo(treeNode.checked, treeNode.id);
    },
    //双击事件
    onDbClickV: function (e, treeId, treeNode) {
        dbClickHeighlight = true;
        var cheakdiyueall = [];
        var changedNodes;
        var param = [];
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        if (treeNode) {
            if (treeNode.children === undefined && treeNode.type === "assignment" && treeNode.isParent === true) {
                treeMonitoring.zTreeOnExpand(e, treeId, treeNode);
                if (treeNode.children !== undefined) {
                    for (var m = 0; m < treeNode.children.length; m++) {
                        treeNode.children[m].checkedOld = false;
                    }
                }
            }
            if (treeNode.iconSkin != "assignmentSkin" && treeNode.iconSkin != "groupSkin") {
                zTree.selectNode(treeNode, false, true);
                if (treeNode.checkedOld == false) {
                    cheakedAll.push(treeNode.id)
                    cheakdiyueall.push(treeNode.id);
                }
            }
            licensePlateInformation = treeNode.id;
            DblclickName = licensePlateInformation;
            // 状态信息table表对应监控对象信息高亮
            dataTableOperation.tableHighlight(treeNode.type, licensePlateInformation);
            groupIconSkin = treeNode.iconSkin;
            var nodes = zTree.getSelectedNodes(true);
            if (nodes[0].checked == false) {
                cheakdiyuealls.push(nodes[0].id)
                var flag = treeMonitoring.getChannel(nodes, map);
                if (!flag) {
                    return true;
                }
            }
            zTree.checkNode(nodes[0], true, true);
            //
            dbclickCheckedId = e.target.id;
            if (treeNode.iconSkin != "assignmentSkin" && treeNode.iconSkin != "groupSkin") {
                $("#" + dbclickCheckedId).parent().attr("class", "curSelectedNode_dbClick");
            }
            //双击下一辆车取消上一辆
            if (oldDbclickCheckedId != "") {
                $("#" + oldDbclickCheckedId).parent().removeAttr("class");
            }
            oldDbclickCheckedId = dbclickCheckedId;
            //处理双击订阅同一辆车
            if (oldDbclickCheckedId = dbclickCheckedId) {
                $("#" + dbclickCheckedId).parent().attr("class", "curSelectedNode_dbClick");
            }
            //创建车辆对象参数信息(用于实时视频)
            var vehicleInfo = new Object();
            vehicleInfo.vid = treeNode.id;
            vehicleInfo.brand = treeNode.name;
            vehicleInfo.deviceNumber = treeNode.deviceNumber;
            vehicleInfo.plateColor = treeNode.plateColor;
            vehicleInfo.isVideo = treeNode.isVideo;

            // wjk
            // 是否IE
            if (realTimeVideo.ieExplorer()) {
                realTimeVideo.beventAllMediaStop(); //先关闭所有
            }
            //end

            realTimeVideo.setVehicleInfo(vehicleInfo)

            // wjk
            if (m_videoFlag == 1 && realTimeVideo.ieExplorer()) {
                //没有通话只有视频  开启视频
                realTimeVideo.windowSet();
                clearInterval(computingTimeInt)
                clearInterval(computingTimeCallInt)
                if ($('#btn-videoRealTime-show i').hasClass('active') && !$('#phoneCall i').hasClass('active')) {
                    realTimeVideo.beventLiveView(pageLayout.computingTimeIntFun);
                }
                else if (!$('#btn-videoRealTime-show i').hasClass('active') && $('#phoneCall i').hasClass('active')) {
                    realTimeVideo.beventLiveIpTalk(pageLayout.computingTimeCallIntFun);
                }
                else if ($('#btn-videoRealTime-show i').hasClass('active') && $('#phoneCall i').hasClass('active')) {
                    realTimeVideo.beventLiveView(pageLayout.computingTimeIntFun);
                    realTimeVideo.beventLiveIpTalk(pageLayout.computingTimeCallIntFun);
                }
            }
            //end

            if (nodes[0].type === "vehicle" || nodes[0].type === "people" || nodes[0].type === "thing") {
                var list = zTreeIdJson[nodes[0].id];
                if (list.length > 1) {
                    $.each(list, function (index, value) {
                        var treeNoded = zTree.getNodeByTId(value);
                        zTree.checkNode(treeNoded, true, true);
                        treeNoded.checkedOld = true;
                    })
                }
            }
            if (nodes[0].type == "assignment" || nodes[0].type == "group") {
                changedNodes = zTree.getChangeCheckedNodes();
                var count = 0;
                for (var i = 0, l = changedNodes.length; i < l; i++) {
                    changedNodes[i].checkedOld = true;
                    if (changedNodes[i].type === "vehicle" || changedNodes[i].type === "people" || changedNodes[i].type === "thing") {
                        var list = zTreeIdJson[changedNodes[i].id];
                        if (cheakedAll.length > 400) {
                            layer.alert("我们的监控上限是400辆,您刚刚勾选数量超过了400个,请重新勾选！");
                            for (var j = 0, l = changedNodes.length; j < l; j++) {
                                // 只有一个节点
                                if (changedNodes.length == 1) {
                                    zTree.checkNode(changedNodes[j], false, true);
                                } else {
                                    // 如果某个分组树节点未展开，并且已经有勾选的数据，changedNodes中会包含当前树的所有节点
                                    if (j >= 1) {
                                        // cheakdiyueall已经剔除已勾选对象
                                        /*if ($.inArray(changedNodes[j].id, cheakdiyueall) !== -1) {*/
                                        zTree.checkNode(changedNodes[j], false, true);
                                        /*}*/
                                    } else if (j <= 0) {
                                        // 取消父节点勾选
                                        changedNodes[j].checked = false;
                                    }
                                }
                                changedNodes[j].checkedOld = false;
                                crrentSubV.remove(changedNodes[j].id);
                                cheakedAll.remove(changedNodes[j].id);
                            }
                            // crrentSubV 用于刷新左侧树后， 重新勾选已选择树节点,此处不能清空，否则无法勾选树节点。
                            // crrentSubV = [];
                            cheakdiyuealls = [];
                            return;
                        }
                        if (list.length > 1) {
                            $.each(list, function (index, value) {
                                var treeNoded = zTree.getNodeByTId(value);
                                zTree.checkNode(treeNoded, true, true);
                                treeNoded.checkedOld = true;
                            })
                        } else if (list.length == 1) {
                            zTree.checkNode(changedNodes[i], true, true);
                            changedNodes[i].checkedOld = true;
                        }
                        if ($.inArray(changedNodes[i].id, crrentSubV) === -1) {
                            count++;
                            cheakdiyueall.push(changedNodes[i].id);
                            crrentSubV.push(changedNodes[i].id)
                            crrentSubName.push(changedNodes[i].name);
                            cheakedAll.push(changedNodes[i].id)
                        }
                    }
                }
            }
            cheakdiyuealls = treeMonitoring.unique(cheakdiyueall);
            if (treeMonitoring.unique(cheakedAll).length <= 400) {
                for (var j = 0; j < cheakdiyuealls.length; j++) {
                    var obj = new Object();
                    obj.vehicleID = cheakdiyuealls[j];
                    param.push(obj)
                }
                var requestStrS = {
                    "desc": {
                        "MsgId": 40964,
                        "UserName": $("#userName").text()
                    },
                    "data": param
                };
                cancelList = [];
                // 状态信息
                webSocket.subscribe(headers, "/user/" + $("#userName").text() + "/location", dataTableOperation.updateRealLocation, "/app/vehicle/location", requestStrS);
            } else {
                layer.alert("为了更好的性能,请少于400个监控对象,您刚刚勾选了" + treeMonitoring.unique(cheakedAll).length + "个,请重新勾选！")
                for (var i = 0, l = changedNodes.length; i < l; i++) {
                    // 只有一个节点
                    if (changedNodes.length == 1) {
                        zTree.checkNode(changedNodes[i], false, true);
                    } else {
                        // 如果某个分组树节点未展开，并且已经有勾选的数据，changedNodes中会包含当前树的所有节点
                        if (i >= 1) {
                            // cheakdiyueall已经剔除已勾选对象
                            if ($.inArray(changedNodes[i].id, cheakdiyueall) !== -1) {
                                zTree.checkNode(changedNodes[i], false, true);
                            }
                        } else if (i <= 0) {
                            // 取消父节点勾选
                            changedNodes[i].checked = false;
                        }
                    }
                    changedNodes[i].checkedOld = false;
                    crrentSubV.remove(changedNodes[i].id);
                    cheakedAll.remove(changedNodes[i].id);
                }
                // crrentSubV 用于刷新左侧树后， 重新勾选已选择树节点,此处不能清空，否则无法勾选树节点。
                // crrentSubV = [];
                cheakdiyuealls = [];
            }
            nodes[0].checkedOld = nodes[0].checked;
            treeMonitoring.markerTimeout(nodes);
            treeMonitoring.realTimeDatatAdapt(nodes[0].type);
            //双击时判断节点是否勾选订阅 用于围栏查询
            treeMonitoring.vehicleTreeClickGetFenceInfo(treeNode.checked, treeNode.id)
        }
    },
    // 双击聚焦轮询方法
    markerTimeout: function (nodes) {
        setTimeout(function () {
            var id = nodes[0].id;
            if (markerAllUpdateData.containsKey(id)) {
                treeMonitoring.centerMarker(id, 'DBLCLICK');
            } else if (objAddressIsTrue.indexOf(id) != -1) {
                return true;
            } else {
                treeMonitoring.markerTimeout(nodes);
            }
        }, 250);
    },

    //组织树勾选
    onCheckVehicle: function (e, treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        var curSelect = $('.curSelectedNode');
        var vName = treeNode.name;
        var vId = treeNode.id;
        if (treeNode.checked && curSelect.attr('title') == vName) {
            if (curSelect.length > 0) {
                amapOperation.setObdInfo(vName, vId);
            }
        }

        /*var parNode=treeNode.getParentNode();
         if(!treeNode.isParent){
         if(parNode!=null&&parNode!=undefined) {
         if(parNode.check_Child_State==0){
         parNode.halfCheck=false;
         parNode.checked=false;
         parNode.checkedOld=false;
         }else if(parNode.check_Child_State==1){
         parNode.halfCheck=true;
         parNode.checked=false;
         parNode.checkedOld=false;
         }else if(parNode.check_Child_State==2){
         parNode.halfCheck=false;
         parNode.checked=true;
         parNode.checkedOld=true;
         }
         }
         }else{
         if(treeNode.check_Child_State==0){
         treeNode.halfCheck=false;
         treeNode.checked=false;
         treeNode.checkedOld=false;
         }else if(treeNode.check_Child_State==1){
         treeNode.halfCheck=true;
         treeNode.checked=false;
         treeNode.checkedOld=false;
         }else if(treeNode.check_Child_State==2){
         treeNode.halfCheck=false;
         treeNode.checked=true;
         treeNode.checkedOld=true;
         }
         }*/
        if (treeNode.children === undefined && treeNode.type === "assignment" && treeNode.isParent === true) {
            treeMonitoring.zTreeOnExpand(e, treeId, treeNode);
            if (treeNode.children !== undefined) {
                for (var m = 0; m < treeNode.children.length; m++) {
                    treeNode.children[m].checkedOld = false;
                }
            }
        } else if (treeNode.type === "group" && allflag) {
            treeMonitoring.zTreeOnExpand(e, treeId, treeNode);
        }
        var changedNodes = zTree.getChangeCheckedNodes();
        var cancelVehicle = [];//被取消的车辆
        var subVeh = [];//订阅的车辆
        var subName = [];
        var cheakdiyueall = [];

        for (var i = 0, l = changedNodes.length; i < l; i++) {
            if ((changedNodes[i].type === "vehicle" || changedNodes[i].type === "people" || changedNodes[i].type === "thing") && changedNodes[i].isHidden == false) {
                if (cheakedAll.length > 400) {
                    layer.alert("我们的监控上限是400辆,您刚刚勾选数量超过了400个,请重新勾选！");
                    for (var j = 0, l = changedNodes.length; j < l; j++) {
                        if (!crrentSubV.contains(changedNodes[j].id)) {
                            if (changedNodes.length == 1) {
                                zTree.checkNode(changedNodes[j], false, true);
                            }
                            if (changedNodes.length > 1 && j >= 1) {
                                zTree.checkNode(changedNodes[j], false, true);
                            } else if (changedNodes.length > 1 && j == 0) {
                                changedNodes[j].checked = false;
                            }
                            changedNodes[j].checkedOld = false;
                            cheakedAll.remove(changedNodes[j].id)
                        }
                    }
                    checkedVehicles = [];
                    return;
                }
                if (changedNodes[i].checked == false) {
                    cancelVehicle.push(changedNodes[i].id);
                    cheakedAll.remove(changedNodes[i].id);
                    carNameContentLUMap.remove(changedNodes[i].id);
                } else if (!subVeh.contains(changedNodes[i].id)) {
                    subVeh.push(changedNodes[i].id);
                    subName.push(changedNodes[i].name);
                    cheakdiyueall.push(changedNodes[i].id);
                    cheakedAll.push(changedNodes[i].id)
                }
                var list = zTree.getNodesByParam('id', changedNodes[i].id, null);
                if (list !== undefined) {
                    for (var j = 0; j < list.length; j++) {
                        zTree.checkNode(list[j], treeNode.checked, true);
                        list[j].checkedOld = treeNode.checked;
                    }
                } else {
                    changedNodes[i].checkedOld = changedNodes[i].checked;
                }
            } else {
                changedNodes[i].checkedOld = changedNodes[i].checked;
            }
        }
        var param = [];
        cheakdiyuealls = treeMonitoring.unique(cheakdiyueall);
        checkedVehicles = $.merge(checkedVehicles, cheakdiyuealls);//合并
        checkedVehicles.sort();//排序
        for (var i = 0; i < checkedVehicles.length - 1; i++) {//去重
            if (checkedVehicles[i] == checkedVehicles[i + 1]) {
                checkedVehicles.remove(checkedVehicles[i]);
            }
        }
        for (var i = 0; i < cancelVehicle.length; i++) {
            checkedVehicles.remove(cancelVehicle[i]);
        }
        if (treeMonitoring.unique(cheakedAll).length <= 400) {
            var cCheacked = Array.minus(cheakdiyuealls, cheakNodec)
            cheakNodec = cheakdiyuealls;
            for (var j = 0; j < cCheacked.length; j++) {
                var obj = new Object();
                obj.vehicleID = cCheacked[j];
                param.push(obj)
            }
            var requestStrS = {
                "desc": {
                    "MsgId": 40964,
                    "UserName": $("#userName").text()
                },
                "data": param
            };
            var offlineVids = [];
            if (treeNode.checked) {//订阅
                cancelList = [];
                if (subVeh.length > 0) {
                    for (var i = 0; i < subVeh.length; i++) {
                        if (crrentSubV.indexOf(subVeh[i]) == -1) {
                            crrentSubV.push(subVeh[i])
                            crrentSubName.push(subName[i])
                        }
                    }
                } else if (treeNode.type === "vehicle" || treeNode.type === "people" || treeNode.type === "thing") {
                    crrentSubV.push(treeNode.id)
                    crrentSubName.push(treeNode.name);
                }
                webSocket.subscribe(headers, "/user/" + $("#userName").text() + "/location", dataTableOperation.updateRealLocation, "/app/vehicle/location", requestStrS);
                treeMonitoring.realTimeDatatAdapt(treeNode.type);
                var treeType = treeNode.type;
            } else {//取消订阅
                if ((treeNode.type == "assignment") && treeNode.children != undefined) {
                    for (var i = 0; i < treeNode.children.length; i++) {
                        if (treeNode.children[i].isHidden === false) {
                            crrentSubV.removeObj(treeNode.children[i].id)
                            crrentSubName.removeObj(treeNode.children[i].name);
                        }
                    }
                } else if (treeNode.type == "vehicle" || treeNode.type == "people" || treeNode.type == "thing") {
                    crrentSubV.removeObj(treeNode.id)
                    crrentSubName.removeObj(treeNode.name);
                }
                cheakNodec = [];
                param = [];
                var plateNumbers = [];
                if (treeNode.type == "vehicle" || treeNode.type == "people" || treeNode.type == "thing") {
                    var obj = new Object();
                    obj.vehicleID = treeNode.id;
                    plateNumbers.push(treeNode.id);
                    param.push(obj);
                } else if (treeNode.type == "assignment") {
                    treeMonitoring.getCancelNodes(changedNodes, param, plateNumbers);
                    param = treeMonitoring.removeDuplicates(param);
                } else if (treeNode.type == "group") {
                    for (var i = 0, l = changedNodes.length; i < l; i++) {
                        if ((changedNodes[i].type === "vehicle" || changedNodes[i].type === "people" || changedNodes[i].type == "thing") && changedNodes[i].checked == false) {
                            var obj = new Object();
                            crrentSubV.removeObj(changedNodes[i].id)
                            crrentSubName.removeObj(changedNodes[i].name)
                            obj.vehicleID = changedNodes[i].id;
                            param.push(obj);
                            plateNumbers.push(changedNodes[i].id)
                        }
                    }
                } else if (treeNode.type == "group" && treeNode.pId == "null") {
                    plateNumbers.push(crrentSubV);
                }
                plateNumbers = treeMonitoring.removeDuplicates(plateNumbers);
                cancelList = plateNumbers;
                dataTableOperation.deleteRowByRealTime(cancelList);
                //取消订阅去掉隐藏车牌号
                for (var i = 0; i < param.length; i++) {
                    var isID = param[i].vehicleID;
                    if (carNameMarkerContentMap.containsKey(isID)) {
                        var thisNameMarker = carNameMarkerContentMap.get(isID);
                        thisNameMarker.stopMove()
                        map.remove([thisNameMarker]);
                    }
                    ;
                }
                ;
                var cancelStrS = {
                    "desc": {
                        "MsgId": 40964,
                        "UserName": $("#userName").text()
                    },
                    "data": param
                };
                webSocket.unsubscribealarm(headers, "/app/vehicle/unsubscribelocation", cancelStrS);
                treeMonitoring.searchByFlag("treeDemo", treeNode.id, null, 3);
                treeMonitoring.clearMarker(param);
                //取消订阅之后取消单击和双击背景
                $("#" + oldDbclickCheckedId).parent().removeAttr("class");
                $(".ztree li a").removeAttr("class", "curSelectedNode");
                //取消订阅时 使用此Fn判断围栏模块显示隐藏
                treeMonitoring.vehicleTreeClickGetFenceInfo(treeNode.checked, treeNode.id);
                // 删除未定位监控对象元素
                for (var z = 0, zlen = param.length; z < zlen; z++) {
                    var zIndex = objAddressIsTrue.indexOf(param[z].vehicleID);
                    if (zIndex != -1) {
                        objAddressIsTrue.splice(zIndex, 1);
                    }
                }
            }
        } else {
            layer.alert("我们的监控上限是400辆,您刚刚勾选了" + treeMonitoring.unique(cheakedAll).length + "辆,请重新勾选！")
            for (var i = 0, l = changedNodes.length; i < l; i++) {
                if (!crrentSubV.contains(changedNodes[i].id)) {
                    if (changedNodes.length == 1) {
                        zTree.checkNode(changedNodes[i], false, true);
                    }
                    if (changedNodes.length > 1 && i >= 1) {
                        zTree.checkNode(changedNodes[i], false, true);
                    } else if (changedNodes.length > 1 && i == 0) {
                        changedNodes[i].checked = false;
                    }
                    changedNodes[i].checkedOld = false;
                    cheakedAll.remove(changedNodes[i].id)
                }
            }
            checkedVehicles = [];
        }
    },
    removeDuplicates: function (arr) {
        var result = [];
        for (var i = 0, n = arr.length; i < n; i++) {
            if (!result.isHas(arr[i])) {
                result.push(arr[i]);
            }
        }
        return result;
    },
    getCancelNodes: function (changedNodes, param, plateNumbers) {
        for (var i = 0; i < changedNodes.length; i++) {
            if ((changedNodes[i].type == 'vehicle' || changedNodes[i].type == 'people' || changedNodes[i].type == 'thing') && changedNodes[i].isHidden == false && changedNodes[i].checked == false) {
                var obj = new Object();
                obj.vehicleID = changedNodes[i].id;
                plateNumbers.push(changedNodes[i].id);
                param.push(obj);
            }
        }
    },
    getChannel: function (fenceNode, showMap) {
        if (fenceNode == null || fenceNode.length == 0 || (fenceNode[0].type !== 'vehicle' && fenceNode[0].type !== 'people' && fenceNode[0].type !== 'thing')) {
            return true;
        }
        if (treeMonitoring.unique(cheakedAll).length <= 400) {
            if ($.inArray(fenceNode[0].id, crrentSubV) === -1) {
                crrentSubV.push(fenceNode[0].id)
                crrentSubName.push(fenceNode[0].name);
            }
            cancelList = [];
            var requestStr = {
                "desc": {
                    "MsgId": 40964,
                    "UserName": $("#userName").text()
                },
                "data": [{
                    "vehicleID": fenceNode[0].id
                }]
            };
            //状态信息
            webSocket.subscribe(headers, "/user/" + $("#userName").text() + "/location", dataTableOperation.updateRealLocation, "/app/vehicle/location", requestStr);
            return true;
        }
        zTree.checkNode(fenceNode, false, true);
        layer.alert("为了更好的性能,请少于400个监控对象,您刚刚勾选了" + treeMonitoring.unique(cheakedAll).length + "个,请重新勾选！");
        cheakedAll.remove(fenceNode[0].id);
        // crrentSubV = [];
        // cheakdiyuealls = [];
        return false;


    },
    // 实时更新监控对象树状态
    updataRealTree: function (msg) {
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        if (suFlag == true) {
            for (var j = 0; j < initArr.length; j++) {
                zTree.expandNode(notExpandNodeInit[j], true, true, false, true);
            }
            ;
            suFlag = false;
        }

        var data = $.parseJSON(msg.body);
        var carStopLine = 0;
        var carRunLine = 0;
        if (data.desc.msgID == 39321) {
            var position = data.data;
            for (var i = 0; i < position.length; i++) {
                if (position[i].vehicleStatus != 3) {
                    if (lineV.indexOf(position[i].vehicleId) == -1) {
                        lineV.push(position[i].vehicleId);
                    }
                }
                lineVid = treeMonitoring.unique(lineV);
                if (position[i].vehicleStatus == 4) {
                    if (lineAs.indexOf(position[i].vehicleId) == -1) {
                        lineAs.push(position[i].vehicleId);
                    }
                    lineAr.remove(position[i].vehicleId);
                    lineAa.remove(position[i].vehicleId);
                    lineAm.remove(position[i].vehicleId);
                    changeMiss.remove(position[i].vehicleId);
                    lineOs.remove(position[i].vehicleId);
                    lineHb.remove(position[i].vehicleId);
                } else if (position[i].vehicleStatus == 10) {
                    if (lineAr.indexOf(position[i].vehicleId) == -1) {
                        lineAr.push(position[i].vehicleId);
                    }
                    lineAs.remove(position[i].vehicleId);
                    lineAa.remove(position[i].vehicleId);
                    lineAm.remove(position[i].vehicleId);
                    changeMiss.remove(position[i].vehicleId);
                    lineOs.remove(position[i].vehicleId);
                    lineHb.remove(position[i].vehicleId);
                } else if (position[i].vehicleStatus == 5) {
                    if (lineAa.indexOf(position[i].vehicleId) == -1) {
                        lineAa.push(position[i].vehicleId);
                    }
                    lineAr.remove(position[i].vehicleId);
                    lineAs.remove(position[i].vehicleId);
                    lineAm.remove(position[i].vehicleId);
                    changeMiss.remove(position[i].vehicleId);
                    lineOs.remove(position[i].vehicleId);
                    lineHb.remove(position[i].vehicleId);
                } else if (position[i].vehicleStatus == 2) {
                    if (lineAm.indexOf(position[i].vehicleId) == -1) {
                        lineAm.push(position[i].vehicleId);
                    }
                    lineAr.remove(position[i].vehicleId);
                    lineAs.remove(position[i].vehicleId);
                    lineAa.remove(position[i].vehicleId);
                    changeMiss.remove(position[i].vehicleId);
                    lineOs.remove(position[i].vehicleId);
                    lineHb.remove(position[i].vehicleId);
                } else if (position[i].vehicleStatus == 3) {//未上线
                    if (changeMiss.indexOf(position[i].vehicleId) == -1) {
                        changeMiss.push(position[i].vehicleId)
                    }
                    lineAm.remove(position[i].vehicleId);
                    lineAr.remove(position[i].vehicleId);
                    lineAs.remove(position[i].vehicleId);
                    lineAa.remove(position[i].vehicleId);
                    lineOs.remove(position[i].vehicleId);
                    lineHb.remove(position[i].vehicleId);
                } else if (position[i].vehicleStatus == 9) {//超速
                    if ($.inArray(position[i].vehicleId, lineOs) === -1) {
                        lineOs.push(position[i].vehicleId)
                        changeMiss.remove(position[i].vehicleId)
                        lineAm.remove(position[i].vehicleId);
                        lineAr.remove(position[i].vehicleId);
                        lineAs.remove(position[i].vehicleId);
                        lineAa.remove(position[i].vehicleId);
                        lineHb.remove(position[i].vehicleId);
                    }
                } else if (position[i].vehicleStatus == 11) {//心跳
                    if (lineHb.indexOf(position[i].vehicleId) == -1) {
                        lineHb.push(position[i].vehicleId);
                    }
                    changeMiss.remove(position[i].vehicleId);
                    lineAm.remove(position[i].vehicleId);
                    lineAr.remove(position[i].vehicleId);
                    lineAs.remove(position[i].vehicleId);
                    lineAa.remove(position[i].vehicleId);
                    lineOs.remove(position[i].vehicleId);
                }
            }
            missVid = changeMiss;
            lineAndStop = lineAs;//停车
            lineAndRun = lineAr;//行驶
            lineAndAlarm = lineAa;////报警
            lineAndmiss = lineAm;//未定位
            overSpeed = lineOs;//超速
            heartBeat = lineHb;//心跳
            if (lineVid != null) {
                nmoline = Array.minus(diyueall, lineVid);
            } else {
                nmoline = diyueall;
            }
            neverOline = Array.minus(nmoline, missVid);
            var attrs;
            if (lineAndStop.length != 0) {
                var len = lineAndStop.length;
                for (var i = 0; i < len; i++) {
                    clineAndStop = lineAndStop[i];
                    var list = zTreeIdJson[clineAndStop];
                    if (list != null) {
                        $.each(list, function (index, value) {
                            var treeNode = zTree.getNodeByTId(value);
                            treeNode.iconSkin = "btnImage iconArea onlineParking"
                            zTree.updateNode(treeNode);
                            $("#" + value + "_span")[0].style.color = "#c80002";
                            if (misstype) {
                                zTree.hideNode(treeNode);
                            }
                        })
                    }
                }
            }
            if (lineAndmiss.length != 0) {
                var len = lineAndmiss.length;
                for (var i = 0; i < len; i++) {
                    clineAndmiss = lineAndmiss[i];
                    var list = zTreeIdJson[clineAndmiss];
                    if (list != null) {
                        $.each(list, function (index, value) {
                            var treeNode = zTree.getNodeByTId(value);
                            treeNode.iconSkin = "button btnImage iconArea onlineNotPositioning"
                            zTree.updateNode(treeNode);
                            $("#" + value + "_span")[0].style.color = "#754801";
                            if (misstype) {
                                zTree.hideNode(treeNode);
                            }
                        })
                    }
                }
            }
            if (lineAndRun.length != 0) {
                var len = lineAndRun.length;
                for (var i = 0; i < len; i++) {
                    clineAndRun = lineAndRun[i];
                    var list = zTreeIdJson[clineAndRun];
                    if (list != null) {
                        $.each(list, function (index, value) {
                            var treeNode = zTree.getNodeByTId(value);
                            treeNode.iconSkin = "button btnImage iconArea onlineDriving"
                            zTree.updateNode(treeNode);
                            $("#" + value + "_span")[0].style.color = "#78af3a";
                            if (misstype) {
                                zTree.hideNode(treeNode);
                            }
                        })
                    }
                }
            }
            if (lineAndAlarm.length != 0) {
                var len = lineAndAlarm.length;
                for (var i = 0; i < len; i++) {
                    clineAndAlarm = lineAndAlarm[i];
                    var list = zTreeIdJson[clineAndAlarm];
                    if (list != null) {
                        $.each(list, function (index, value) {
                            var treeNode = zTree.getNodeByTId(value);
                            treeNode.iconSkin = "button btnImage iconArea warning"
                            zTree.updateNode(treeNode);
                            $("#" + value + "_span")[0].style.color = "#ffab2d";
                            if (misstype) {
                                zTree.hideNode(treeNode);
                            }
                        })
                    }
                }

            }
            if (overSpeed.length != 0) {
                var len = overSpeed.length;
                for (var i = 0; i < len; i++) {
                    coverSpeed = overSpeed[i];
                    var list = zTreeIdJson[coverSpeed];
                    if (list != null) {
                        $.each(list, function (index, value) {
                            var treeNode = zTree.getNodeByTId(value);
                            treeNode.iconSkin = "btnImage iconArea speedLimitWarning"
                            zTree.updateNode(treeNode);
                            $("#" + value + "_span")[0].style.color = "#960ba3";
                            if (misstype) {
                                zTree.hideNode(treeNode);
                            }
                        })
                    }
                }
            }
            if (heartBeat.length != 0) {
                var len = heartBeat.length;
                for (var i = 0; i < len; i++) {
                    var heartbeatValue = heartBeat[i];
                    var list = zTreeIdJson[heartbeatValue];
                    if (list != null) {
                        $.each(list, function (index, value) {
                            var treeNode = zTree.getNodeByTId(value);
                            treeNode.iconSkin = "btnImage iconArea heartBeatWarning"
                            zTree.updateNode(treeNode);
                            $("#" + value + "_span")[0].style.color = "#fb8c96";
                            if (misstype) {
                                zTree.hideNode(treeNode);
                            }
                        })
                    }
                }
            }
            if (misstypes) {
                var nodesList = [];
                var treeNodeChildren = treeNodeNew.children;
                $.each(treeNodeChildren, function (index, value) {
                    if (value.isHidden == false) {
                        nodesList.push(value.id);
                    }
                });
                address_submit("POST", "/clbs/m/functionconfig/fence/bindfence/getNodesList", "json", true, {"nodesList": nodesList}, true, treeMonitoring.getNodesList);
            }
            var Vjiaoji = Array.intersect(lineVid, diyueall);
            var vmiss = params.length - Vjiaoji.length;
        } else if (data.desc.msgID == 34952) {//新增
            var upPosition = data.data;
            if (upPosition[0].vehicleStatus == 4) {
                if (lineAndStop.indexOf(upPosition[0].vehicleId) == -1) {
                    lineAndStop.push(upPosition[0].vehicleId);
                }
                nmoline.remove(upPosition[0].vehicleId)
                treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
            } else if (upPosition[0].vehicleStatus == 10) {
                if (lineAndRun.indexOf(upPosition[0].vehicleId) == -1) {
                    lineAndRun.push(upPosition[0].vehicleId);
                }
                // if (nmoline.isHas(upPosition[0].vehicleId)) {
                nmoline.remove(upPosition[0].vehicleId)
                // }
                treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
            } else if (upPosition[0].vehicleStatus == 5) {
                if (lineAndAlarm.indexOf(upPosition[0].vehicleId) == -1) {
                    lineAndAlarm.push(upPosition[0].vehicleId);
                }
                // if (nmoline.isHas(upPosition[0].vehicleId)) {
                nmoline.remove(upPosition[0].vehicleId)
                // }
                treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
            } else if (upPosition[0].vehicleStatus == 2) {
                if (lineAndmiss.indexOf(upPosition[0].vehicleId) == -1) {
                    lineAndmiss.push(upPosition[0].vehicleId);
                }

                // if (nmoline.isHas(upPosition[0].vehicleId)) {
                nmoline.remove(upPosition[0].vehicleId)
                // }
                treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
            } else if (upPosition[0].vehicleStatus == 3) { // 离线
                if (changeMiss.indexOf(upPosition[0].vehicleId) == -1) {
                    changeMiss.push(upPosition[0].vehicleId);
                }
                treeMonitoring.objHeartbeatChange(upPosition[0].vehicleId, 3);
            } else if (upPosition[0].vehicleStatus == 9) {
                if (overSpeed.indexOf(upPosition[0].vehicleId) == -1) {
                    overSpeed.push(upPosition[0].vehicleId);
                }

                // if (nmoline.isHas(upPosition[0].vehicleId)) {
                nmoline.remove(upPosition[0].vehicleId)
                // }
                treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
            } else if (upPosition[0].vehicleStatus == 11) {
                if (heartBeat.indexOf(upPosition[0].vehicleId) == -1) {
                    heartBeat.push(upPosition[0].vehicleId);
                }
                // if (nmoline.isHas(upPosition[0].vehicleId)) {
                nmoline.remove(upPosition[0].vehicleId)
                // }
                treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
                treeMonitoring.objHeartbeatChange(upPosition[0].vehicleId, 11);
            }
            var list = zTreeIdJson[upPosition[0].vehicleId];
            var brand = null;
            if (list != null) {
                $.each(list, function (index, value) {
                    brand = zTree.getNodeByTId(value).name;
                })
            }
            if (diyueall.isHas(upPosition[0].vehicleId)) {
                if (upPosition[0].speed < 1) {
                    $tableCarStop.text(parseInt($tableCarStop.text()) + 1);
                    if (stopVidArray.indexOf(upPosition[0].vehicleId) == -1) {
                        stopVidArray.push(upPosition[0].vehicleId);
                    }
                } else {
                    $tableCarRun.text(parseInt($tableCarRun.text()) + 1);
                    if (runVidArray.indexOf(upPosition[0].vehicleId) == -1) {
                        runVidArray.push(upPosition[0].vehicleId);
                    }
                }
                ;
                $("#tline").text("(" + (parseInt($tableCarRun.text()) + parseInt($tableCarStop.text())) + ")");
                $tableCarOnline.text(parseInt($tableCarRun.text()) + parseInt($tableCarStop.text()));
                $tableCarOffline.text(parseInt($tableCarAll.text()) - parseInt($tableCarOnline.text()));
                $tableCarOnlinePercent.text(((parseInt($tableCarOnline.text()) / parseInt($tableCarAll.text())) * 100).toFixed(2) + "%");
                $("#tmiss").text("(" + parseInt($tableCarOffline.text()) + ")");
                if (upPosition[0].brand.length > 8) {
                    upPosition[0].brand = upPosition[0].brand.substring(0, 7) + '...';
                }
                $("#fixSpan").text(upPosition[0].brand + "  " + "  已上线");
                $(".btn-videoRealTime").show();
                $("#fixArea").show();
                if ($("#recentlyC").children().length >= 10) {
                    $($("#recentlyC").children().get(0)).remove();
                }
                $("#recentlyC").append("<p class='carStateShow'>" + $("#fixSpan").text() + "</p>")
            }
        } else if (data.desc.msgID == 30583) {//更新
            var upPosition = data.data;
            if (upPosition !== null) {
                if (diyueall.isHas(upPosition[0].vehicleId)) {
                    if (upPosition[0].vehicleStatus != 3) {
                        if (upPosition[0].speed < 1) {
                            if (stopVidArray.indexOf(upPosition[0].vehicleId) == -1) {
                                $tableCarStop.text(parseInt($tableCarStop.text()) + 1);
                                $tableCarRun.text(parseInt($tableCarRun.text()) - 1);
                                if (stopVidArray.indexOf(upPosition[0].vehicleId) == -1) {
                                    stopVidArray.push(upPosition[0].vehicleId);
                                }
                                runVidArray.splice(runVidArray.indexOf(upPosition[0].vehicleId), 1);
                            }
                            ;
                        } else {
                            if (runVidArray.indexOf(upPosition[0].vehicleId) == -1) {
                                $tableCarStop.text(parseInt($tableCarStop.text()) - 1);
                                $tableCarRun.text(parseInt($tableCarRun.text()) + 1);
                                if (runVidArray.indexOf(upPosition[0].vehicleId) == -1) {
                                    runVidArray.push(upPosition[0].vehicleId);
                                }
                                stopVidArray.splice(stopVidArray.indexOf(upPosition[0].vehicleId), 1);
                            }
                        }
                        ;
                    }
                    ;
                }
                if (upPosition[0].vehicleStatus == 4) {//停止
                    lineAndRun.remove(upPosition[0].vehicleId);
                    lineAndAlarm.remove(upPosition[0].vehicleId);
                    lineAndmiss.remove(upPosition[0].vehicleId);
                    overSpeed.remove(upPosition[0].vehicleId);
                    nmoline.remove(upPosition[0].vehicleId);
                    heartBeat.remove(upPosition[0].vehicleId);
                    if (lineAndStop.indexOf(upPosition[0].vehicleId) == -1) {
                        lineAndStop.push(upPosition[0].vehicleId);
                    }
                    treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
                } else if (upPosition[0].vehicleStatus == 10) {
                    lineAndStop.remove(upPosition[0].vehicleId);
                    lineAndAlarm.remove(upPosition[0].vehicleId);
                    lineAndmiss.remove(upPosition[0].vehicleId);
                    overSpeed.remove(upPosition[0].vehicleId);
                    nmoline.remove(upPosition[0].vehicleId);
                    heartBeat.remove(upPosition[0].vehicleId);
                    if (lineAndRun.indexOf(upPosition[0].vehicleId) == -1) {
                        lineAndRun.push(upPosition[0].vehicleId);
                    }
                    treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
                } else if (upPosition[0].vehicleStatus == 5) {
                    lineAndStop.remove(upPosition[0].vehicleId);
                    lineAndRun.remove(upPosition[0].vehicleId);
                    lineAndmiss.remove(upPosition[0].vehicleId);
                    overSpeed.remove(upPosition[0].vehicleId);
                    nmoline.remove(upPosition[0].vehicleId);
                    heartBeat.remove(upPosition[0].vehicleId);
                    if (lineAndAlarm.indexOf(upPosition[0].vehicleId) == -1) {
                        lineAndAlarm.push(upPosition[0].vehicleId);
                    }
                    treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
                } else if (upPosition[0].vehicleStatus == 2) {
                    lineAndStop.remove(upPosition[0].vehicleId);
                    lineAndRun.remove(upPosition[0].vehicleId);
                    lineAndAlarm.remove(upPosition[0].vehicleId);
                    overSpeed.remove(upPosition[0].vehicleId);
                    nmoline.remove(upPosition[0].vehicleId);
                    heartBeat.remove(upPosition[0].vehicleId);
                    if (lineAndmiss.indexOf(upPosition[0].vehicleId) == -1) {
                        lineAndmiss.push(upPosition[0].vehicleId);
                    }
                    treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
                } else if (upPosition[0].vehicleStatus == 3) {//离线
                    treeMonitoring.objHeartbeatChange(upPosition[0].vehicleId, 3);
                    lineAndStop.remove(upPosition[0].vehicleId);
                    lineAndRun.remove(upPosition[0].vehicleId);
                    lineAndAlarm.remove(upPosition[0].vehicleId);
                    lineAndmiss.remove(upPosition[0].vehicleId);
                    overSpeed.remove(upPosition[0].vehicleId);
                    heartBeat.remove(upPosition[0].vehicleId);
                    if (nmoline.indexOf(upPosition[0].vehicleId) == -1) {
                        nmoline.push(upPosition[0].vehicleId);
                    }
                    treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
                    var list = zTreeIdJson[upPosition[0].vehicleId];
                    var brand = null;
                    if (list != null) {
                        $.each(list, function (index, value) {
                            brand = zTree.getNodeByTId(value).name;
                        })
                    }
                    if (stopVidArray.isHas(upPosition[0].vehicleId)) {
                        $tableCarStop.text(parseInt($tableCarStop.text()) - 1);
                        stopVidArray.splice(stopVidArray.indexOf(upPosition[0].vehicleId), 1);
                    }
                    if (runVidArray.isHas(upPosition[0].vehicleId)) {
                        $tableCarRun.text(parseInt($tableCarRun.text()) - 1);
                        runVidArray.splice(runVidArray.indexOf(upPosition[0].vehicleId), 1);
                    }
                    if (diyueall.isHas(upPosition[0].vehicleId)) {
                        $("#tline").text("(" + (parseInt($tableCarRun.text()) + parseInt($tableCarStop.text())) + ")");
                        $tableCarOnline.text(parseInt($tableCarRun.text()) + parseInt($tableCarStop.text()));
                        $tableCarOffline.text(parseInt($tableCarAll.text()) - parseInt($tableCarOnline.text()));
                        $tableCarOnlinePercent.text(((parseInt($tableCarOnline.text()) / parseInt($tableCarAll.text())) * 100).toFixed(2) + "%");
                        $("#tmiss").text("(" + parseInt($tableCarOffline.text()) + ")");
                        if (upPosition[0].brand.length > 8) {
                            upPosition[0].brand = upPosition[0].brand.substring(0, 7) + '...';
                        }
                        $("#fixSpan").text(upPosition[0].brand + "  " + "  已下线");
                        $(".btn-videoRealTime").show();
                        $("#fixArea").show();
                        if ($("#recentlyC").children().length >= 10) {
                            $($("#recentlyC").children().get(0)).remove();
                        }
                        $("#recentlyC").append("<p class='carStateShow'>" + $("#fixSpan").text() + "</p>")
                    }
                } else if (upPosition[0].vehicleStatus == 9) {//超速
                    lineAndStop.remove(upPosition[0].vehicleId);
                    lineAndRun.remove(upPosition[0].vehicleId);
                    lineAndAlarm.remove(upPosition[0].vehicleId);
                    lineAndmiss.remove(upPosition[0].vehicleId);
                    nmoline.remove(upPosition[0].vehicleId);
                    heartBeat.remove(upPosition[0].vehicleId);
                    if (overSpeed.indexOf(upPosition[0].vehicleId) == -1) {
                        overSpeed.push(upPosition[0].vehicleId)
                    }
                    treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
                } else if (upPosition[0].vehicleStatus == 11) {//心跳
                    lineAndStop.remove(upPosition[0].vehicleId);
                    lineAndRun.remove(upPosition[0].vehicleId);
                    lineAndAlarm.remove(upPosition[0].vehicleId);
                    lineAndmiss.remove(upPosition[0].vehicleId);
                    nmoline.remove(upPosition[0].vehicleId);
                    overSpeed.remove(upPosition[0].vehicleId);
                    if (heartBeat.indexOf(upPosition[0].vehicleId) == -1) {
                        heartBeat.push(upPosition[0].vehicleId);
                    }
                    treeMonitoring.searchByFlag("treeDemo", upPosition[0].vehicleId, null, 4);
                    treeMonitoring.objHeartbeatChange(upPosition[0].vehicleId, 11);
                    // amapOperation.carNameEvade(carId, carName, lngLatValue, false, "1", null, false, stateInfo);
                }
            }
        }
    },

    // 监控对象状态变更心跳后，更新地图车辆状态
    objHeartbeatChange: function (id, stateIndex) {
        // 改变全局位置信息车辆状态
        if (markerAllUpdateData.containsKey(id)) {
            var value = markerAllUpdateData.get(id);
            markerAllUpdateData.remove(id);
            value[0][5] = stateIndex;
            markerAllUpdateData.put(id, value);
        }

        // 改变可视区域内的车辆状态
        if (markerViewingArea.containsKey(id)) {
            var value = markerViewingArea.get(id);
            markerViewingArea.remove(id);
            var marker = value[0];
            marker.stateInfo = stateIndex;
            value[0] = marker;
            value[6] = stateIndex;
            markerViewingArea.put(id, value);
            amapOperation.carNameEvade(id, marker.name, marker.getPosition(), null, "1", null, false, stateIndex);
        }

        // 改变可视区域外的车俩状态
        if (markerOutside.containsKey(id)) {
            var value = markerOutside.get(id);
            markerOutside.remove(id);
            value[5] = stateIndex;
            markerOutside.put(id, value);
        }
    },

    getNodesList: function (data) {
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        var dataObj = data.obj;
        if (dataObj != null) {
            $.each(dataObj, function (index, value) {
                var treeNode = zTree.getNodeByParam("id", value, null);
                zTree.hideNode(treeNode);
            })
        }
    },
    // 处理报警
    updataRealAlarmMessage: function (data) {
        var jsonStr = data.body;
        var obj = JSON.parse(jsonStr);
        var type = obj.desc.type;
        // 判断用户是否有监控对象的权限
        if (diyueall.indexOf(obj.desc.monitorId) != -1) {
            // 报警更新方法
            dataTableOperation.updateAlarmInfoTable(obj);

            // wjk 报警记录更新也为隐藏按钮添加方法
            $("#scalingBtn").unbind("click").bind("click", treeMonitoring.hideDataClick);
        }
    },
    //刷新树
    refreshTree: function () {
        treeMonitoring.alltree();
        bflag = true;
        // json_ajax("POST", "/clbs/m/functionconfig/fence/bindfence/getStatistical", "json", false, null, treeMonitoring.setNumber);
        $("#search_condition").val("");
        $thetree.animate({scrollTop: 0});//回到顶端
    },
    ajaxQueryDataFilter: function (treeId, parentNode, responseData) {
        responseData = JSON.parse(ungzip(responseData));
        return filterQueryResult(responseData, null);
    },
    search_condition: function () {
        fzzflag = true;
        missAll = false;
        misstype = false;
        misstypes = false;
        zTreeIdJson = {}
        suFlag = true;
        allflag = false;
        var queryType = $("#searchType").val();
        var queryParam = $("#search_condition").val();
        if (queryParam !== null && queryParam !== "") {
            var searchTree = {
                async: {
                    url: "/clbs/m/functionconfig/fence/bindfence/monitorTreeFuzzy",
                    type: "post",
                    enable: true,
                    autoParam: ["id"],
                    dataType: "json",
                    otherParam: {"queryParam": queryParam, "queryType": queryType, "webType": 1},
                    dataFilter: treeMonitoring.ajaxQueryDataFilter
                },
                view: {
                    addHoverDom: treeMonitoring.addHoverDom,
                    removeHoverDom: treeMonitoring.removeHoverDom,
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
                    onClick: treeMonitoring.onClickV,
                    onDblClick: treeMonitoring.onDbClickV,
                    beforeCheck: treeMonitoring.zTreeBeforeCheck,
                    beforeClick: treeMonitoring.zTreeBeforeClick,
                    onCheck: treeMonitoring.onCheckVehicle,
                    onAsyncSuccess: treeMonitoring.zTreeOnAsyncSuccess,
                    onExpand: treeMonitoring.zTreeOnExpand,
                    onNodeCreated: treeMonitoring.zTreeOnNodeCreated,
                    onRightClick: treeMonitoring.zTreeShowRightMenu
                }
            };
            $.fn.zTree.init($("#treeDemo"), searchTree);
        } else {
            treeMonitoring.alltree();
        }
    },
    //添加树节点悬浮dom
    addHoverDom: function (treeId, treeNode) {
        var sObj = $("#" + treeNode.tId + "_span");
        var id = (100 + newCount);
        var pid = treeNode.id;
        pid = window.encodeURI(window.encodeURI(pid));
        if ($("#" + treeNode.tId + "_ico").hasClass("offlineIcon_ico_docu") || $("#" + treeNode.tId + "_ico").hasClass("onlineDriving_ico_docu") ||
            $("#" + treeNode.tId + "_ico").hasClass("onlineNotPositioning_ico_docu") || $("#" + treeNode.tId + "_ico").hasClass("warning_ico_docu") ||
            $("#" + treeNode.tId + "_ico").hasClass("onlineParking_ico_docu") || $("#" + treeNode.tId + "_ico").hasClass("speedLimitWarning_ico_docu") ||
            $("#" + treeNode.tId + "_ico").hasClass("heartBeatWarning_ico_docu")) {
            var addStr = "<span class='button trackreplay' id='trackreplay_" + treeNode.tId + "'"
                + 'onClick="amapOperation.jumpToTrackPlayer(\'' + treeNode.id + '\',\'' + treeNode.deviceType + '\',\'' + treeNode.pId + '\')"'
                + "></span>";

            if (treeNode.deviceType == '1') {//只有808-2013协议有视频
                addStr += "<span class='button realtime-video-jump' id='realTimeVideoJump_" + treeNode.tId + "'"
                    + 'onClick="treeMonitoring.jumpToRealTimeVideoPage(\'' + treeNode.id + '\')"'
                    + "></span>";
            }
        } else {
            var addStr = "<span class='button trackreplay' id='trackreplay_" + treeNode.tId + "'"
                + 'onClick="amapOperation.jumpToTrackPlayer(\'' + treeNode.id + '\',\'' + treeNode.deviceType + '\',\'' + treeNode.pId + '\')"'
                + "></span>";
        }
        if (!sObj.nextAll().hasClass("trackreplay") && (treeNode.type == "vehicle" || treeNode.type == "people" || treeNode.type == "thing")) {
            sObj.after(addStr);
        }
    },
    //移除树节点悬浮dom
    removeHoverDom: function (treeId, treeNode) {
        $("#trackreplay_" + treeNode.tId).unbind().remove();
        $("#realTimeVideoJump_" + treeNode.tId).unbind().remove();
    },
    //跳转到实时视频页面
    jumpToRealTimeVideoPage: function (sid) {
        var jumpFlag = false;
        var permissionUrls = $("#permissionUrls").val();
        if (permissionUrls != null && permissionUrls != undefined) {
            var urllist = permissionUrls.split(",");
            if (urllist.indexOf("/realTimeVideo/video/list") > -1) {
                jumpFlag = true;
                location.href = "/clbs/realTimeVideo/video/list?videoId=" + sid;
            }
        }
        if (!jumpFlag) {
            layer.msg("无操作权限，请联系管理员");
        }
    },
    //实时监控数据加载
    realTimeDatatAdapt: function (type) {
        $("#scalingBtn").unbind("click").bind("click", treeMonitoring.hideDataClick);
        dataTableOperation.dataTableDbclick(type);
    },
    //隐藏数据
    hideDataClick: function () {
        var mapHeightdata = winHeight - headerHeight - headerHeight + 30;
        var num;
        //判断不同数据获取不同数据条数
        if ($("#realTimeStatus").hasClass("active")) {
            num = $realTimeStateTableList.children("tbody").children("tr").length;
        } else if ($("#realTtimeAlarm").hasClass("active")) {
            num = $("#alarmTable").children("tbody").children("tr").length;
        } else if ($("#operationLog").hasClass("active")) {
            num = $("#logging").children("tbody").children("tr").length;
        }
        if (num > 0) {
            if ($(this).hasClass("fa-chevron-down")) {
                uptFlag = false;
                $MapContainer.css('height', mapHeightdata + 'px');
                $(this).attr("class", "fa fa-chevron-up");
            } else {
                uptFlag = true;
                if (num >= 5) {
                    $("#realTimeStateTable-div").css({
                        "max-height": "266px"
                    });
                    $MapContainer.css('height', (newMapHeight - (41 * 5 + 43 + 17)) + 'px');
                } else {
                    $MapContainer.css('height', (newMapHeight - (41 * num + 43 + 17)) + 'px');
                }
                $(this).attr("class", "fa fa-chevron-down");
            }
        }
    },
    //车辆树右键菜单
    zTreeShowRightMenu: function (event, treeId, treeNode) {
        if (treeNode != null) {
            // 判断用户是否拥有可操作权限
            var data;
            var permission = $('#permission').val();
            var deviceType = treeNode.deviceType;//终端类型（用于区别超待）
            if (deviceType != '8') {
                data = treeNode.id + ';' + treeNode.name + ';' + treeNode.deviceNumber + ';' + treeNode.simcardNumber;
            } else {
                var deviceNumber = treeMonitoring.IntegerMobileIPAddress(treeNode.simcardNumber);
                data = treeNode.id + ';' + treeNode.name + ';' + deviceNumber + ';' + treeNode.simcardNumber;
            }
            // 判断deviceType是否取到 防止抛出错误信息
            if (deviceType != undefined) {
                //获取到节点信息
                if (permission == "true") {
                    if (treeNode && !treeNode.noR) {
                        if (treeNode.type == "vehicle" || treeNode.type == "people" || treeNode.type == "thing") {
                            zTree.selectNode(treeNode);
                            var menuTopPos = winHeight - event.clientY;
                            $("#rMenu").css("width", "143px");
                            longDeviceType = deviceType;//给超长待机类型全局变量赋值（用作后续判断）
                            if (treeNode.iconSkin != "vehicleSkin" && treeNode.iconSkin != "peopleSkin" && treeNode.iconSkin != "thingSkin" && treeNode.iconSkin != 'btnImage iconArea offlineIcon') {
                                if (deviceType == "9") {
                                    if (menuTopPos <= 152 && menuTopPos > 0) {
                                        treeMonitoring.gsmCdmaShowRmenu(treeNode.id, event.clientX, (event.clientY - 152), data);
                                    } else {
                                        treeMonitoring.gsmCdmaShowRmenu(treeNode.id, event.clientX, event.clientY, data);
                                    }
                                } else if (deviceType == "10") {
                                    if (menuTopPos <= 117 && menuTopPos > 0) {
                                        treeMonitoring.gsmCdmaShowRmenu(treeNode.id, event.clientX, (event.clientY - 117), data);
                                    } else {
                                        treeMonitoring.gsmCdmaShowRmenu(treeNode.id, event.clientX, event.clientY, data);
                                    }
                                } else if (deviceType == "0" || deviceType == "1") {
                                    if ($("#userName").text() == "admin") {//464
                                        if (menuTopPos <= 500 && menuTopPos > 0) {
                                            treeMonitoring.showRMenu(treeNode.id, event.clientX, (event.clientY - 500), data);
                                        } else {
                                            treeMonitoring.showRMenu(treeNode.id, event.clientX, event.clientY, data);
                                        }
                                    } else {
                                        if (menuTopPos <= 500 && menuTopPos > 0) {
                                            treeMonitoring.showRMenu(treeNode.id, event.clientX, (event.clientY - 500), data);
                                        } else {
                                            treeMonitoring.showRMenu(treeNode.id, event.clientX, event.clientY, data);
                                        }
                                    }
                                } else {
                                    treeMonitoring.noShowRMenu(event.clientX, event.clientY, data);
                                }
                            } else {
                                treeMonitoring.noShowRMenu(event.clientX, event.clientY, data);
                            }
                        }
                    }
                }
            }

            $('.curSelectedNode').attr("data-id", treeNode.id);
        }
    },
    // 博实杰伪ID
    IntegerMobileIPAddress: function (sSim) {
        var sTemp = [];
        var sIp = [];
        var iHigt;
        if (sSim.length == 13 && sSim.startsWith("106")) {
            sSim = "1" + sSim.substring(3);
        }
        if (sSim.length == 11) {
            sTemp[0] = parseInt(sSim.substring(3, 5));
            sTemp[1] = parseInt(sSim.substring(5, 7));
            sTemp[2] = parseInt(sSim.substring(7, 9));
            sTemp[3] = parseInt(sSim.substring(9, 11));
            iHigt = parseInt(sSim.substring(1, 3));
            if (iHigt > 45) {
                iHigt -= 46;
            } else {
                iHigt -= 30;
            }
        } else if (sSim.length == 10) {
            sTemp[0] = parseInt(sSim.substring(2, 4));
            sTemp[1] = parseInt(sSim.substring(4, 6));
            sTemp[2] = parseInt(sSim.substring(6, 8));
            sTemp[3] = parseInt(sSim.substring(8, 10));
            iHigt = parseInt(sSim.substring(0, 2));
            if (iHigt > 45) {
                iHigt -= 46;
            } else {
                iHigt -= 30;
            }
        } else if (sSim.length == 9) {
            sTemp[0] = parseInt(sSim.substring(1, 3));
            sTemp[1] = parseInt(sSim.substring(3, 5));
            sTemp[2] = parseInt(sSim.substring(5, 7));
            sTemp[3] = parseInt(sSim.substring(7, 9));
            iHigt = parseInt(sSim.substring(0, 1));
        } else if (sSim.length < 9) {
            switch (sSim.length) {
                case 8:
                    sSim = "140" + sSim;
                    break;
                case 7:
                    sSim = "1400" + sSim;
                    break;
                case 6:
                    sSim = "14000" + sSim;
                    break;
                case 5:
                    sSim = "140000" + sSim;
                    break;
                case 4:
                    sSim = "1400000" + sSim;
                    break;
                case 3:
                    sSim = "14000000" + sSim;
                    break;
                case 2:
                    sSim = "140000000" + sSim;
                    break;
                case 1:
                    sSim = "1400000000" + sSim;
                    break;
            }
            sTemp[0] = parseInt(sSim.substring(3, 5));
            sTemp[1] = parseInt(sSim.substring(5, 7));
            sTemp[2] = parseInt(sSim.substring(7, 9));
            sTemp[3] = parseInt(sSim.substring(9, 11));
            iHigt = parseInt(sSim.substring(1, 3));
            if (iHigt > 45) {
                iHigt -= 46;
            } else {
                iHigt -= 30;
            }
        } else {
            return "";
        }
        if ((iHigt & 0x8) != 0) {
            sIp[0] = sTemp[0] | 128;
        }
        else {
            sIp[0] = sTemp[0];
        }
        if ((iHigt & 0x4) != 0) {
            sIp[1] = sTemp[1] | 128;
        }
        else {
            sIp[1] = sTemp[1];
        }
        if ((iHigt & 0x2) != 0) {
            sIp[2] = sTemp[2] | 128;
        }
        else {
            sIp[2] = sTemp[2];
        }
        if ((iHigt & 0x1) != 0) {
            sIp[3] = sTemp[3] | 128;
        }
        else {
            sIp[3] = sTemp[3];
        }
        return sIp[0] + '' + sIp[1] + '' + sIp[2] + '' + sIp[3];

    },
    gsmCdmaShowRmenu: function (type, x, y, data) {
        treeMonitoring.showLocationTime();//组装定点框
        if (longDeviceType == "9") {//艾赛欧超长待机
            $("#baseStation-add-btn").hide();
            $("#rMenu").html('<div class="col-md-12" id="treeRightMenu-l" style="padding:0px">' +
                '<a onclick="treeMonitoring.reportFrequencySet(\'' + type + '\')">上报频率设置</a>' +
                '<a onclick="treeMonitoring.fixedPointAndTiming(\'' + type + '\')">定点和校时</a>' +
                '<a onclick="treeMonitoring.throughInstruction(\'' + type + '\')">透传指令</a>' +
                '<a class="rmenu-last-a" onclick="treeMonitoring.restart(\'' + type + '\')">远程复位</a>' +
                '<a onclick="treeMonitoring.searchOriginalData(\'' + data + '\')">查询原始数据</a>' +
                '</div>'
            );
        } else {//F3超长待机
            $("#baseStation-add-btn").show();
            $("#rMenu").html('<div class="col-md-12" id="treeRightMenu-l" style="padding:0px">' +
                '<a onclick="treeMonitoring.reportFrequencySet(\'' + type + '\')">上报频率设置</a>' +
                '<a onclick="treeMonitoring.fixedPointAndTiming(\'' + type + '\')">定点和校时</a>' +
                '<a class="rmenu-last-a" onclick="treeMonitoring.locationTailAfter(\'' + type + '\')">位置跟踪</a>' +
                '<a onclick="treeMonitoring.searchOriginalData(\'' + data + '\')">查询原始数据</a>' +
                '</div>'
            );
        }
        treeMonitoring.rMenuUlShowOrPosition(x, y);
    },
    showRMenu: function (type, x, y, data) {
        editUrlPath = "/clbs/m/basicinfo/equipment/simcard/proofreading_" + type;
        $("#rMenu").html(
            '<div class="col-md-12" id="treeRightMenu-l" style="padding:0px">' +
            '<a href= "' + editUrlPath + '" data-toggle="modal" onclick="treeMonitoring.simLog(\'' + type + '\')" data-target="#commonWin">获取SIM卡信息</a>' +
            '<a onclick="treeMonitoring.setOBD(\'' + type + '\')">设置OBD车型信息</a>' +
            '<a onclick="treeMonitoring.callName_(\'' + type + '\')">单次回报(点名)</a>' +
            '<a onclick="treeMonitoring.following(\'' + type + '\')">临时位置跟踪</a>' +
            '<a onclick="treeMonitoring.ContinuousReturn(\'' + type + '\')">连续回报</a>' +
            '<a onclick="treeMonitoring.setPlateNumber(\'' + type + '\')">设置终端车牌号</a>' +
            '<a onclick="treeMonitoring.goPhotograph(\'' + type + '\')">监控对象-拍照</a>' +
            '<a onclick="treeMonitoring.monitoringObjectListening(\'' + type + '\')">监控对象-监听</a>' +
            '<a onclick="treeMonitoring.goVideotape(\'' + type + '\')">监控对象-录像</a>' +
            '<a onclick="treeMonitoring.goOverspeedSetting(\'' + type + '\')">设置超速</a>' +
            '<a onclick="treeMonitoring.sendOriginalCommand(\'' + type + '\')">发送原始命令</a>' +
            '<a onclick="treeMonitoring.textInfoSend(\'' + type + '\')">文本信息下发</a>' +
            '<a class="menu-show-more" onclick="treeMonitoring.showRightMenuMoreClick()">查看更多<span>&gt;</span></a>' +
            '</div>' +
            '<div class="col-md-6 hidden" id="treeRightMenu-r" style="padding:0px 0px 0px 5px;">' +
            '<a onclick="treeMonitoring.askQuestionsIssued(\'' + type + '\')">提问下发</a>' +
            '<a onclick="treeMonitoring.reantimeCallBack(\'' + type + '\')">电话回拨</a>' +
            '<a onclick="treeMonitoring.terminalReset(\'' + type + '\')">终端复位</a>' +
            '<a onclick="treeMonitoring.restoreSettings(\'' + type + '\')">恢复出厂设置</a>' +
            '<a onclick="treeMonitoring.doorLock(\'' + type + '\',\'' + 1 + '\')">车门加锁</a>' +
            '<a onclick="treeMonitoring.doorLock(\'' + type + '\',\'' + 0 + '\')">车门解锁</a>' +
            '<a id="cutoil" onclick="treeMonitoring.cutOilElec(\'' + type + '\'' + ')">断油断电</a>' +
            '<a onclick="treeMonitoring.recordCollection(\'' + type + '\')">行驶记录数据采集</a>' +
            '<a onclick="treeMonitoring.recordSend(\'' + type + '\')">行驶记录参数下传</a>' +
            '<a onclick="treeMonitoring.multimediaSearch(\'' + type + '\')">多媒体检索</a>' +
            '<a onclick="treeMonitoring.multimediaUpload(\'' + type + '\')">多媒体上传</a>' +
            '<a onclick="treeMonitoring.recordingUpload(\'' + type + '\')">录音上传</a>' +
            '<a onclick="treeMonitoring.terminalParameters(\'' + type + '\')">查询终端参数</a>' +
            '<a onclick="treeMonitoring.searchOriginalData(\'' + data + '\')">查询原始数据</a>' +
            '</div>'
        );
        var roleName = $("#allUserRole").attr("value");
        if (roleName.indexOf("POWER_USER") != -1 || roleName.indexOf("ROLE_ADMIN") != -1) {
            $("#cutoil").css("display", "block");
        } else {
            $("#cutoil").css("display", "none");
        }
        treeMonitoring.rMenuUlShowOrPosition(x, y);
    },
    noShowRMenu: function (x, y, data) {
        $("#rMenu").html('<div class="col-md-12" id="treeRightMenu-l" style="padding:0px">' +
            '<a class="rmenu-last-a" onclick="treeMonitoring.searchOriginalData(\'' + data + '\')">查询原始数据</a>' +
            '</div>'
        );
        treeMonitoring.rMenuUlShowOrPosition(x, y);
    },
    rMenuUlShowOrPosition: function (x, y) {
        $("#rMenu ul").show();
        if (y < 0) {
            rMenu.css({"top": (y - y) + "px", "left": (x + 35) + "px", "visibility": "visible"});
        } else {
            rMenu.css({"top": (y) + "px", "left": (x + 35) + "px", "visibility": "visible"});
        }
        $("body").bind("mousedown", treeMonitoring.onBodyMouseDown);
        //右键显示菜单节点跳动问题
        $("#thetree").scrollTop(scorllDefaultTreeTop);
    },
    showLocationTime: function () {
        $("#baseStation-MainContent").html(
            "<div class='form-group'>" +
            "<label class='col-md-4 control-label'>定点时间：</label>" +
            "<div class='col-md-4'>" +
            "<input type='text' id='locationTimes' name='locationTimes' class='form-control' " +
            "style='cursor: pointer;  background-color: #fafafa;' readonly/>" +
            "</div>" +
            "<div class='col-md-1'>" +
            "<button id='baseStation-add-btn' type='button' class='btn btn-primary addIcon'>" +
            "<span class='glyphicon glyphiconPlus' aria-hidden='true'></span>" +
            "</button>" +
            "</div>" +
            "</div>"
        );
        var loadInitTime =
            +(loadInitNowDate.getHours() < 10 ? "0" + loadInitNowDate.getHours() : loadInitNowDate.getHours()) + ":"
            + (loadInitNowDate.getMinutes() < 10 ? "0" + loadInitNowDate.getMinutes() : loadInitNowDate.getMinutes()) + ":"
            + (loadInitNowDate.getSeconds() < 10 ? "0" + loadInitNowDate.getSeconds() : loadInitNowDate.getSeconds());
        $("#locationTimes").val(loadInitTime);
        $("#baseStation-add-btn").on("click", realTimeMonitoringGsmCdma.addLocationTimeEvent);
    },
    onBodyMouseDown: function (event) {
        if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length > 0)) {
            rMenu.css({"visibility": "hidden"});
        }
    },
    simLog: function (vid) {
        pageLayout.closeVideo();
        var url = "/clbs/m/basicinfo/equipment/simcard/simLog";
        var data = {"vehicleId": vid};
        json_ajax("POST", url, "json", false, data, null);
        setTimeout("dataTableOperation.logFindCilck()", 500);
    },
    callName_: function (type) {
        pageLayout.closeVideo();
        var param = [];
        var obj = new Object();
        obj.vehicleID = type;
        param.push(obj);
        var url = "/clbs/v/oilmassmgt/oilcalibration/getLatestOilData";
        var data = {"vehicleId": type};
        json_ajax_p("POST", url, "json", false, data, amapOperation.getDCallBack);
        amapOperation.subscribeLatestLocation(param);
        layer.msg("点名成功");
        callTheRollId = type;
        amapOperation.callTheRollFun();
        rMenu.css({"visibility": "hidden"});
        setTimeout("dataTableOperation.logFindCilck()", 500);
    },
    following: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        var carBrand = brand;
        parametersID = type;
        $("#traceParameter").html("临时位置跟踪：" + brand);
        $("#goTrace").modal('show');
        rMenu.css({"visibility": "hidden"});
        setTimeout("dataTableOperation.logFindCilck()", 500);
    },
    goPhotograph: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#goPhotographBrand").html("监控对象-拍照：" + brand);
        $("#vid1").val(type);
        $("#goPhotograph").modal('show');
        rMenu.css({"visibility": "hidden"});
    },
    goVideotape: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#videotapeBrand").html("监控对象-录像：" + brand);
        $("#vid2").val(type);
        $("#goVideotape").modal('show');
        rMenu.css({"visibility": "hidden"});
    },
    goOverspeedSetting: function (type) {
        pageLayout.closeVideo();
        var url = "/clbs/v/monitoring/findSpeedParameter";
        var data = {"vehicleId": type};
        json_ajax("POST", url, "json", false, data, treeMonitoring.findSpeedParameterCallBack);
        treeMonitoring.getBrandParameter(type);
        $("#goOverspeedSettingBrand").html("设置超速：" + brand);
        $("#goOverspeedSetting").modal('show');
        $("#vid9").val(type);
        rMenu.css({"visibility": "hidden"});
    },
    //给右键超速设置赋值
    findSpeedParameterCallBack: function (data) {
        var datas = data.obj;
        for (var i = 0; i < datas.length; i++) {
            if (datas[i].alarmParameterId == null) {
                if (datas[i].paramCode == "param1") {
                    $("#masSpeed").val(datas[i].defaultValue);
                } else if (datas[i].paramCode == "param2") {
                    $("#speedTime").val(datas[i].defaultValue);
                }
            } else {
                if (datas[i].paramCode == "param1") {
                    $("#masSpeed").val(datas[i].parameterValue);
                } else if (datas[i].paramCode == "param2") {
                    $("#speedTime").val(datas[i].parameterValue);
                }
            }
        }
    },
    /*    continuousReturnTiming: function (type) {
            pageLayout.closeVideo();
            treeMonitoring.getBrandParameter(type);
            $("#continuousReturnTimingBrand").html("连续回报(定时)：" + brand);
            $("#vid30").val(type);
            $("#continuousReturnTiming").modal('show');
            rMenu.css({"visibility": "hidden"});
        },
        ContinuousReturnFixedDistance: function (type) {
            pageLayout.closeVideo();
            treeMonitoring.getBrandParameter(type);
            $("#continuousReturnFixedDistanceBrand").html("连续回报(定距)：" + brand);
            $("#vid31").val(type);
            $("#continuousReturnFixedDistance").modal('show');
            rMenu.css({"visibility": "hidden"});
        },*/
    ContinuousReturn: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#continuousReturnTimingDistanceBrand").html("连续回报：" + brand);
        $("#vid32").val(type);
        $("#vid31").val(type);
        $("#vid30").val(type);
        $("#continuousReturnTimingDistance").modal('show');
        rMenu.css({"visibility": "hidden"});
        treeMonitoring.setContinuousReturnDefaultValue();
        $('#timeInterval0').show();
        $('#timeInterval1').hide();
        $('#timeInterval2').hide();
        $('#timeInterval2 label.error').hide();
        $('#timeInterval0 label.error').hide();
        $('#timeInterval1 label.error').hide();
    },
    /**
     * 设置连续回报默认值
     */
    setContinuousReturnDefaultValue: function () {
        $("#continuousReturnValue").val(0);
        $("input[name='driverLoggingOutUpTimeSpace']").val(30);
        $("input[name='driverLoggingOutUpDistanceSpace']").val(200);
        $("input[name='dormancyUpTimeSpace']").val(120);
        $("input[name='dormancyUpDistanceSpace']").val(20000);
        $("input[name='emergencyAlarmUpTimeSpace']").val(15);
        $("input[name='emergencyAlarmUpDistanceSpace']").val(100);
        $("input[name='defaultTimeUpSpace']").val(30);
        $("input[name='defaultDistanceUpSpace']").val(500);
    },
    sendOriginalCommand: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#sendOriginalCommandBrand").html("发送原始命令：" + brand);
        $("#sendOriginalCommand").modal('show');
        $("#vid14").val(type);
        rMenu.css({"visibility": "hidden"});
    },
    textInfoSend: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#textInfoSendBrand").html("文本信息下发：" + brand);
        $("#textInfoSend").modal('show');
        $("#vid5").val(type);
        rMenu.css({"visibility": "hidden"});
    },
    askQuestionsIssued: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#askQuestionsIssuedBrand").html("提问下发：" + brand);
        $("#askQuestionsIssued").modal('show');
        $("#vid6").val(type);
        rMenu.css({"visibility": "hidden"});
    },
    reantimeCallBack: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#reantimeCallBackBrand").html("电话回拨：" + brand);
        $("#reantimeCallBack").modal('show');
        $("#vid40").val(type);
        rMenu.css({"visibility": "hidden"});
    },
    informationService: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#informationServiceBrand").html("信息服务：" + brand);
        $("#informationService").modal('show');
        $("#vid16").val(type);
        rMenu.css({"visibility": "hidden"});
    },
    reportFrequencySet: function (type) {
        pageLayout.closeVideo();
        $("label.error").hide();//隐藏错误提示
        laydate.render({elem: '#requiteTime', type: 'time', theme: '#6dcff6'});
        if (longDeviceType == "9") {
            $("#requiteTime").css('background-color', '#DCDCDC');
            $("#requiteTime").attr("disabled", "disabled");
            $("#requiteTimeDiv").hide();
        } else {
            $("#requiteTime").css('background-color', '#fafafa');
            $("#requiteTime").removeAttr("disabled", "disabled");
            $("#requiteTimeDiv").show();
        }
        treeMonitoring.getBrandParameter(type);
        $("#reportFrequencyBrand").html("上报频率设置：" + brand);
        $("#reportFrequencySet").modal('show');
        $("#vid17").val(type);
        $("#hours").val("");
        $("#minute").val("");
        rMenu.css({"visibility": "hidden"});
    },
    fixedPointAndTiming: function (type) {
        pageLayout.closeVideo();
        laydate.render({elem: '#locationTimes', type: 'time', theme: '#6dcff6'});
        treeMonitoring.getBrandParameter(type);
        $("#fixedPointAndTimingBrand").html("定点和校时：" + brand);
        $("#fixedPointAndTiming").modal('show');
        $("#vid18").val(type);
        $("#showTime").val("");
        rMenu.css({"visibility": "hidden"});
    },
    locationTailAfter: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#locationTailAfterBrand").html("位置跟踪：" + brand);
        $("#locationTailAfter").modal('show');
        $("#vid19").val(type);
        $("#tailAfterTime").val("");
        $("#IntervalTime").val("");
        rMenu.css({"visibility": "hidden"});
    },
    throughInstruction: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#throughInstructionBrand").html("透传指令：" + brand);
        $("#throughInstruction").modal('show');
        $("#vid20").val(type);
        rMenu.css({"visibility": "hidden"});
    },
    restart: function (type) {
        layer.confirm("确定要远程复位吗？", {btn: ["确定", "取消"], icon: 3, title: "操作确认"}, function () {
            var url = "/clbs/v/monitoringLong/sendParam";
            var data = {"vid": type, "orderType": 21};
            json_ajax_p("POST", url, "json", false, data, treeMonitoring.restartCallBack);
        });
        setTimeout("dataTableOperation.logFindCilck()", 500);
        rMenu.css({"visibility": "hidden"});
    },
    restartCallBack: function (data) {
        if (data.obj.type) {
            layer.msg("复位指令已发送");
        } else {
            layer.msg("复位指令发送失败");
        }
    },
    terminalReset: function (type) {
        pageLayout.closeVideo();
        var url = "/clbs/v/monitoring/orderMsg"
        json_ajax("post", url, "json", false, {"vid": type, "orderType": 7, "cw": 4}, treeMonitoring.terminalResetBack);
        rMenu.css({"visibility": "hidden"});
    },
    restoreSettings: function (type) {
        pageLayout.closeVideo();
        var url = "/clbs/v/monitoring/orderMsg"
        json_ajax("post", url, "json", false, {"vid": type, "orderType": 7, "cw": 5}, treeMonitoring.terminalResetBack);
        rMenu.css({"visibility": "hidden"});
    },
    doorLock: function (type, f) {
        pageLayout.closeVideo();
        var url = "/clbs/v/monitoring/orderMsg"
        var sign = 0;
        if (f == 1) {
            sign = 1
        }
        json_ajax("post", url, "json", false, {
            "vid": type,
            "orderType": 8,
            "sign": sign
        }, treeMonitoring.terminalResetBack);
        rMenu.css({"visibility": "hidden"});
    },
    //断油电功能
    cutOilElec: function (type) {
        //获取断电油量信息
        var getstopoildata = {
            getlastestoildata: function () {
                var url = "/clbs/v/oilmassmgt/oilcalibration/getLatestOilData";
                json_ajax("post", url, "json", false, {"vehicleId": type, "curBox": null}, getstopoildata.getDCallBack);
            },
            getDCallBack: function (data) {
                msgSNAck = data.obj.msgSN;
                if (msgSNAck != null && msgSNAck != "") {
                    getstopoildata.subscribeLatestLocation2(msgSNAck, type);
                }
            },
            subscribeLatestLocation2: function (msgSNAck, type) {
                var requestStrS = {
                    "desc": {
                        "MsgId": 40964,
                        "UserName": $("#userName").text(),
                        "cmsgSN": msgSNAck
                    },
                    "data": {"vehicleID": type}
                };
                setTimeout(function () {
                    webSocket.subscribe(headers, "/user/" + $("#userName").text() + "/realLocationS", getstopoildata.oilElectric, "/app/vehicle/realLocationS", requestStrS);
                });
            },
            oilElectric: function (data) {
                var data = $.parseJSON(data.body);
                var vid = data.desc.monitorId;
                data = data.data.msgBody;
                var formattedAddress = data.positionDescription ? data.positionDescription : "";
                var speed = data.gpsSpeed;

                var status = data.status.toString(2);
                status = status.substr(9, 1);
                if (status == 0) {
                    status = "通油电";
                } else {
                    status = "断油电";
                }
                $("#cutOilElecState").text(status);
                $("#cutOilElecSpeed").text(speed);
                $("#cutOilElecLocation").text(formattedAddress);

                $("#gpCutOilElec").removeAttr("disabled");


                $("#gpCutOilElec").unbind().on("click", function () {
                    if (treeMonitoring.validates()) {
                        var value = $("#cutOilElecToken").val()
                        var oilElectricMsg = $("#cutOilElecToken").val();
                        var checkvalue = $("input:radio[name='cutOilElecOpe']:checked").val();
                        if (!checkvalue || !oilElectricMsg) {
                            layer.msg("请选择您要执行的操作或输入口令");
                        } else {
                            layer.open({
                                closeBtn: false,
                                offset: 't',
                                title: '提示',
                                content: '当前操作影响重大，请再次确认操作',
                                btn: ['确定', '返回'],
                                btn1: function (index, layero) {
                                    Issuedstopoil.clickIssuedstopoil(vid, oilElectricMsg, checkvalue);
                                    layer.close(index);
                                    $("#cutOilElecToken").val('');
                                    $(':input', "#cutOilElecForm").removeAttr('checked');
                                },
                                btn2: function (index, layero) {
                                    getstopoildata.getlastestoildata();
                                    $("#cutOilElecToken").val('');
                                    $(':input', "#cutOilElecForm").removeAttr('checked');
                                }
                            });

                        }
                    }
                })

            }
        }
        getstopoildata.getlastestoildata();
        //断油电指令下发工功能
        var Issuedstopoil = {
            clickIssuedstopoil: function (vid, oilElectricMsg, checkvalue) {
                var url = "/clbs/v/monitoring/orderMsg";
                json_ajax("post", url, "json", false, {
                    "vid": vid,
                    "orderType": 42,
                    "oilElectricMsg": oilElectricMsg,
                    "flag": checkvalue
                }, getDCallBack3);

                function getDCallBack3(data) {
                    if (data.obj.type == true) {
                        layer.msg("口令发送成功");
                    } else {
                        layer.msg("口令错误！");
                    }
                }
            }

        }
        //断油电刷新
        $("#cutOilElecRefresh").unbind().on("click", function () {
            getstopoildata.getlastestoildata(type);
            $("#cutOilElecToken").val('');
            $(':input', "#cutOilElecForm").removeAttr('checked');
        })
        treeMonitoring.getBrandParameter(type);
        $("#cutOilElecBrand").html("断油断电：" + brand);
        $("#cutOilElec").modal('show');
        rMenu.css({"visibility": "hidden"});
    },
    //关闭清空表单
    cutoilclose: function () {
        $("#cutOilElecForm").find("input").not(':button,:submit,:reset,:hidden,:radio').val('').removeAttr('checked');
        $("#cutOilElecState").text("");
        $("#cutOilElecSpeed").text("");
        $("#cutOilElecLocation").text("");
        // $('input').removeAttr('checked');
        $("#cutOilElecToken").val('');
    },
    validates: function () {
        return $("#cutOilElecForm").validate({
            rules: {
                cutOilElecToken: {
                    required: true,
                    minlength: 6,
                }
            },
            messages: {
                cutOilElecToken: {
                    required: "输入内容不能为空",
                    minlength: "不能少于6个字符",
                }
            }
        }).form();
    },
    recordCollection: function (type) {
        //设置当前时间显示
        if (isInitDatePicker) {
            // dateRangePicker 不刷新页面, 二次初始存在问题
            isInitDatePicker = false;
            // $('#recordTimeInterval').dateRangePicker();
        } else {
            treeMonitoring.getCurrentRangeTIme();
        }

        $("#sign").val('0H');
        $("#recordTimeIntervalIsHidden").addClass('hidden');
        treeMonitoring.getBrandParameter(type);
        $("#recordCollectionCommandBrand").html("行驶记录数据采集：" + brand);
        $("#recordCollectionCommand").modal('show');
        $("#vid10").val(type);
        rMenu.css({"visibility": "hidden"});
    },
    getCurrentRangeTIme: function () {
        var nowDate = new Date();
        msStartTime = nowDate.getFullYear()
            + "-"
            + (parseInt(nowDate.getMonth() + 1) < 10 ? "0"
                + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate
                .getMonth() + 1))
            + "-"
            + (nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate())
            + " " + "00:00:00";
        msEndTime = nowDate.getFullYear()
            + "-"
            + (parseInt(nowDate.getMonth() + 1) < 10 ? "0"
                + parseInt(nowDate.getMonth() + 1) : parseInt(nowDate
                .getMonth() + 1))
            + "-"
            + (nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate())
            + " " + ("23") + ":" + ("59") + ":" + ("59");
        $('#recordTimeInterval').val(msStartTime + "--" + msEndTime);
    }
    ,
    recordSend: function (type) {
        treeMonitoring.getBrandParameter(type);
        $("#recordSendCommandBrand").html("行驶记录参数下传：" + brand);
        $("#recordSendCommand").modal('show');
        $("#recordSend").val(type);
        rMenu.css({"visibility": "hidden"});
    },
    goRecordCollect: function () {
        var vid = $("#recordCollectionCommand").find("#vid10").val();
        var orderType = $("#recordCollectionCommand").find("#orderType").val();
        var sign = $("#recordCollectionCommand").find("#sign").val();
        var param = {
            vid: vid,
            orderType: orderType,
            commandSign: sign,
        };
        if (commandSign.indexOf(sign) != -1) {
            var timeInterval = $('#recordTimeInterval').val().split('--');
            var startTimes = timeInterval[0];
            var endTimes = timeInterval[1];
            // 判断时间范围
            if ("2000-01-01 00:00:00" > startTimes || endTimes > "2099-12-31 23:59:59") {
                layer.msg('已超出范围(范围为: 2000-01-01 00:00:00～2099-12-31 23:59:59)');
                return;
            }
            param.startTime = startTimes;
            param.endTime = endTimes;
        }
        json_ajax("post", "/clbs/v/monitoring/orderMsg",
            "json", false, param, function (data) {
                $("#recordCollectionCommand").modal("hide");
                if (data) {
                    if (data.success) {
                        layer.msg("指令发送成功");
                        setTimeout("dataTableOperation.logFindCilck()", 500);
                    } else {
                        layer.msg(data.msg);
                    }
                }
            });
    },
    monitorSignChange: function (signSelected) {
        var sign = $(signSelected).val();

        if (commandSign.indexOf(sign) != -1) {
            $("#recordTimeIntervalIsHidden").removeClass('hidden');
        } else {
            $("#recordTimeIntervalIsHidden").addClass('hidden');
        }
    }
    ,
    goRecordSend: function () {
        $("#recordSends").ajaxSubmit(function (data) {
            $("#recordSendCommand").modal("hide");
            if (JSON.parse(data).success) {
                layer.msg("指令发送成功")
                setTimeout("dataTableOperation.logFindCilck()", 500);
            } else {
                layer.msg(JSON.parse(data).msg)
            }
        });
    },
    terminalResetBack: function (data) {
        if (data.success) {
            layer.msg("指令发送成功")
        } else {
            layer.msg(JSON.parse(data).msg)
        }
        setTimeout("dataTableOperation.logFindCilck()", 500);
    },
    monitoringObjectListening: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#monitoringObjectListeningBrand").html("监控对象-监听：" + brand);
        $("#monitoringObjectListening").modal('show');
        $("#vid41").val(type);
        rMenu.css({"visibility": "hidden"});
    },
    multimediaSearch: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#multimediaSearchBrand").html("多媒体检索：" + brand);
        $("#multimediaSearch").modal('show');
        $("#vid11").val(type);
        rMenu.css({"visibility": "hidden"});
    },
    multimediaUpload: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        $("#multimediaUploadBrand").html("多媒体上传：" + brand);
        $("#multimediaUpload").modal('show');
        $("#vid12").val(type);
        rMenu.css({"visibility": "hidden"});
    },
    recordingUpload: function (type) {
        pageLayout.closeVideo();
        if ($(".taping-timeline").is(":hidden")) {//没有录音
            treeMonitoring.getBrandParameter(type);
            $("#recordingUploadBrand").html("录音上传：" + brand);
            $("#recordingUpload").modal('show');
            $("#vid13").val(type);
            rMenu.css({"visibility": "hidden"});
        } else {//正在录音
            layer.msg("设备正在录音，请先停止当前录音再下发！");
        }
    },
    terminalParameters: function (type) {
        pageLayout.closeVideo();
        var url = "/clbs/v/monitoring/orderMsg"
        json_ajax("post", url, "json", false, {"vid": type, "orderType": 15}, treeMonitoring.terminalResetBack)
        setTimeout("dataTableOperation.logFindCilck()", 500);
        rMenu.css({"visibility": "hidden"});
    },
    // 查询原始数据
    searchOriginalData: function (data) {
        rMenu.css({"visibility": "hidden"});
        var info = data.split(';');
        var id = '' + new Date().getTime() + ''
        var requestData = {
            'socketId': id,
            'deviceNumber': info[2],
            'plateNumber': info[1],
            'mobile': info[3],
        };
        $('#searchForName').text(info[1]);
        $('#searchDviceNumber').text(info[2]);
        $('#searchSimNumber').text(info[3]);
        if (stompClientSocket != null) {
            stompClientSocket.close();
        }
        stompClientSocket = new SockJS(hostUrl);
        stompClientOriginal = Stomp.over(stompClientSocket);
        $('#controlGetData').text('暂停');
        stompClientOriginal.connect({}, function (frame) {
            stompClientOriginal.subscribe("/user/" + id + "/t808Msg", treeMonitoring.originalFunCallBack);
            stompClientOriginal.send('/app/webSocket/updateDevice', {}, JSON.stringify(requestData));
            $('#originalDataList').html('');
            $('#originalDataModal').animate({bottom: 0});
        });
    },
    // 原始数据获取回掉函数
    originalFunCallBack: function (data) {
        var msg = data.body;
        var html = '<li style="word-wrap: break-word;white-space: initial;">' + msg + '</li>';
        $('#originalDataList').append(html);
        treeMonitoring.copyDataFun();
    },
    // modal关闭事件
    modalCloseFun: function () {
        if (stompClientSocket != null) {
            stompClientSocket.close();
        }
        stompClientSocket = null;
        stompClientOriginal = null;
        $('#originalDataModal').animate({bottom: '-300px'});
    },
    // 复制原始数据
    copyDataFun: function () {
        var clipboard = new Clipboard('#copyOriginalData', {
            text: function () {
                return $('#originalDataList').text();
            }
        });
        clipboard.on('success', function (e) {
            layer.msg('复制成功');
        })
    },
    // 清空数据
    clearDataFun: function () {
        $('#originalDataList').html('');
    },
    // 暂停 or获取历史数据
    isGetOriginalData: function () {
        var text = $('#controlGetData').text();
        if (text == '暂停') {
            stompClientSocket.close();
            stompClientSocket = null;
            stompClientOriginal = null;
            $('#controlGetData').text('开始');
        } else {
            $('#controlGetData').text('暂停');
            var requestData = {
                'socketId': $("#userName").text(),
                'deviceNumber': $('#searchDviceNumber').text(),
                'plateNumber': $('#searchForName').text(),
                'mobile': $('#searchSimNumber').text(),
            };
            stompClientSocket = new SockJS(hostUrl);
            stompClientOriginal = Stomp.over(stompClientSocket);
            stompClientOriginal.connect({}, function (frame) {
                stompClientOriginal.subscribe("/user/" + $("#userName").text() + "/t808Msg", treeMonitoring.originalFunCallBack);
                stompClientOriginal.send('/app/webSocket/updateDevice', {}, JSON.stringify(requestData));
            });
        }
    },
    showRightMenuMoreClick: function () {
        pageLayout.closeVideo();
        if ($("#treeRightMenu-r").is(":hidden")) {
            $("#rMenu").css("width", "286px");
            $("#treeRightMenu-l").attr("class", "col-md-6");
            $("#treeRightMenu-r").removeAttr("class", "hidden");
            $("#treeRightMenu-r").attr("class", "col-md-6");
            $(".menu-show-more span").html("&lt;");
        } else {
            $("#rMenu").css("width", "143px");
            $("#treeRightMenu-l").attr("class", "col-md-12");
            $("#treeRightMenu-r").attr("class", "col-md-6 hidden");
            $(".menu-show-more span").html("&gt;");
        }
    },
    getBrandParameter: function (type) {
        var url = "/clbs/v/monitoring/getBrandParameter";
        var data = {"vehicleId": type};
        json_ajax_p("POST", url, "json", false, data, treeMonitoring.getBrand);
    },
    getBrand: function (data) {
        brand = data;
    },
    parameter: function (type) {
        var validity = $("#validity").val();
        var interval = $("#interval").val();
        if (interval.length > 5) {
            layer.msg("时间间隔不能超过五位！", {move: false});
            return;
        }
        if (validity.length > 5) {
            layer.msg("有效时间不能超过五位！", {move: false});
            return;
        }
        if (interval.length == 0) {
            layer.msg("时间间隔不能为空！", {move: false});
            return;
        }
        if (validity.length == 0) {
            layer.msg("有效时间不能为空！", {move: false});
            return;
        }
        var listParameters = [];
        listParameters.push(type);
        listParameters.push(interval);
        listParameters.push(validity);
        var url = "/clbs/v/monitoring/parametersTrace";
        var parameters = {"parameters": listParameters};
        ajax_submit("POST", url, "json", true, parameters, true, fenceOperation.parametersTrace);
        setTimeout("dataTableOperation.logFindCilck()", 500);
    },
    //树优化测试代码块todo
    zTreeOnExpand: function (event, treeId, treeNode) {
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        treeNodeNew = treeNode; //获取当前展开节点
        if (treeNode.pId !== null) {
            if (treeNode.children === undefined && treeNode.type == "assignment") {
                var url = "/clbs/m/functionconfig/fence/bindfence/putMonitorByAssign";
                json_ajax("post", url, "json", false, {
                    "assignmentId": treeNode.id, "isChecked": treeNode.checked, "monitorType": "monitor", "webType": 1
                }, function (data) {
                    var addV = treeObj.addNodes(treeNode, JSON.parse(ungzip(data.msg)));
                    if (addV !== null) {
                        var param = [];
                        for (var i = 0; i < treeNode.children.length; i++) {
                            var obj = new Object();
                            obj.vehicleID = treeNode.children[i].id;
                            param.push(obj)
                        }
                        // 订阅所有车辆
                        requestStrS = {
                            "desc": {
                                "MsgId": 40964,
                                "UserName": $("#userName").text()
                            },
                            "data": param
                        };
                        webSocket.subscribe(headers, '/user/' + $("#userName").text() + '/cachestatus', treeMonitoring.updataRealTree, "/app/vehicle/subscribeCacheStatusNew", requestStrS);
                        if (crrentSubV.length !== 0) {
                            for (var i = 0; i < crrentSubV.length; i++) {
                                var list = zTreeIdJson[crrentSubV[i]]
                                if (list != null) {
                                    $.each(list, function (index, value) {
                                        var znode = treeObj.getNodeByTId(value);
                                        treeObj.checkNode(znode, true, true);
                                        znode.checkedOld = true;
                                        treeObj.updateNode(znode);
                                    })
                                }
                            }
                        }
                    }
                })
            } else if (treeNode.type == "group") {
                var url = "/clbs/m/functionconfig/fence/bindfence/putMonitorByGroup";
                json_ajax("post", url, "json", false, {
                    "groupId": treeNode.id
                    , "isChecked": treeNode.checked, "monitorType": "vehicle"
                }, function (data) {
                    var result = data.obj;
                    if (result != null && result != undefined) {
                        $.each(result, function (i) {
                            var pid = i; //获取键值
                            var chNodes = result[i] //获取对应的value
                            var parentTid = zTreeIdJson[pid][0];
                            var parentNode = treeObj.getNodeByTId(parentTid);
                            if (parentNode.children === undefined) {
                                treeObj.addNodes(parentNode, []);
                            }
                        });
                    }
                })

            } else {
                if (crrentSubV.length !== 0) {
                    for (var i = 0; i < crrentSubV.length; i++) {
                        var list = zTreeIdJson[crrentSubV[i]]
                        if (list != null) {
                            $.each(list, function (index, value) {
                                var znode = treeObj.getNodeByTId(value);
                                treeObj.checkNode(znode, true, true);
                                znode.checkedOld = true;
                                treeObj.updateNode(znode);
                            })
                        }
                    }
                }
                var param = [];
                for (var i = 0; i < treeNode.children.length; i++) {
                    var obj = new Object();
                    obj.vehicleID = treeNode.children[i].id;
                    param.push(obj)
                }
                // 订阅所有车辆
                requestStrS = {
                    "desc": {
                        "MsgId": 40964,
                        "UserName": $("#userName").text()
                    },
                    "data": param
                };
                treeMonitoring.isExpendSocket(requestStrS);
            }
        }
    },

    // socket 订阅连接
    isExpendSocket: function (requestStrS) {
        setTimeout(function () {
            if (webSocket.conFlag) {
                webSocket.subscribe(headers, '/user/' + $("#userName").text() + '/cachestatus', treeMonitoring.updataRealTree, "/app/vehicle/subscribeCacheStatusNew", requestStrS);
            } else {
                treeMonitoring.isExpendSocket(requestStrS);
            }
        }, 1000);
    },

    getGroupChild: function (node, assign) { // 递归获取组织及下级组织的分组节点
        var nodes = node.children;
        if (nodes != null && nodes != undefined && nodes.length > 0) {
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                if (node.type == "assignment") {
                    assign.push(node);
                } else if (node.type == "group" && node.children != undefined) {
                    treeMonitoring.getGroupChild(node.children, assign);
                }
            }
        }
    },

    //筛选在线车辆
    onlines: function (event) {
        changeMiss = [];
        lineAs = [];//停车
        lineAr = [];//行驶
        lineAa = [];////报警
        lineAm = [];//未定位
        lineOs = [];//超速
        lineHb = [];//心跳
        misstype = false;
        misstypes = false;
        suFlag = true;
        //用于判断在线车辆是否展开节点
        onLineIsExpandAll = true;
        zTreeIdJson = {};
        allflag = false;
        fzzflag = false;
        $("#search_condition").val("");
        var settingTree = {
            async: {
                url: "/clbs/m/basicinfo/monitoring/vehicle/treeStateInfo",
                type: "post",
                enable: true,
                autoParam: ["id"],
                dataType: "json",
                otherParam: {"type": event.data.type, "webType": 1},
            },
            view: {
                addHoverDom: treeMonitoring.addHoverDom,
                removeHoverDom: treeMonitoring.removeHoverDom,
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
                onClick: treeMonitoring.onClickV,
                onDblClick: treeMonitoring.onDbClickV,
                beforeClick: treeMonitoring.zTreeBeforeClick,
                onCheck: treeMonitoring.onCheckVehicle,
                onAsyncSuccess: treeMonitoring.zTreeOnAsyncSuccess,
                onExpand: treeMonitoring.zTreeOnExpand,
                onNodeCreated: treeMonitoring.zTreeOnNodeCreated,
                onRightClick: treeMonitoring.zTreeShowRightMenu,
            }
        };
        $.fn.zTree.init($("#treeDemo"), settingTree, null);
        if (event.data.type === 1) {
            $online.css("text-decoration", "underline");
            $chooseOverSeep.css("text-decoration", "none");
            $chooseStop.css("text-decoration", "none");
            $chooseRun.css("text-decoration", "none");
            $chooseNot.css("text-decoration", "none");
            $chooseAlam.css("text-decoration", "none");
            $chooseMiss.css("text-decoration", "none");
            $('#chooseHeartBeat').css("text-decoration", "none");
        } else if (event.data.type === 2) {
            $chooseStop.css("text-decoration", "underline");
            $chooseOverSeep.css("text-decoration", "none");
            $online.css("text-decoration", "none");
            $chooseRun.css("text-decoration", "none");
            $chooseNot.css("text-decoration", "none");
            $chooseAlam.css("text-decoration", "none");
            $chooseMiss.css("text-decoration", "none");
            $('#chooseHeartBeat').css("text-decoration", "none");
        } else if (event.data.type === 3) {
            $chooseRun.css("text-decoration", "underline");
            $chooseStop.css("text-decoration", "none");
            $chooseOverSeep.css("text-decoration", "none");
            $online.css("text-decoration", "none");
            $chooseNot.css("text-decoration", "none");
            $chooseAlam.css("text-decoration", "none");
            $chooseMiss.css("text-decoration", "none");
            $('#chooseHeartBeat').css("text-decoration", "none");
        } else if (event.data.type === 4) {
            $chooseAlam.css("text-decoration", "underline");
            $chooseRun.css("text-decoration", "none");
            $chooseStop.css("text-decoration", "none");
            $chooseOverSeep.css("text-decoration", "none");
            $online.css("text-decoration", "none");
            $chooseNot.css("text-decoration", "none");
            $chooseMiss.css("text-decoration", "none");
            $('#chooseHeartBeat').css("text-decoration", "none");
        } else if (event.data.type === 5) {
            $chooseOverSeep.css("text-decoration", "underline");
            $chooseAlam.css("text-decoration", "none");
            $chooseRun.css("text-decoration", "none");
            $chooseStop.css("text-decoration", "none");
            $online.css("text-decoration", "none");
            $chooseNot.css("text-decoration", "none");
            $chooseMiss.css("text-decoration", "none");
            $('#chooseHeartBeat').css("text-decoration", "none");
        } else if (event.data.type === 6) {
            $chooseNot.css("text-decoration", "underline");
            $chooseOverSeep.css("text-decoration", "none");
            $chooseAlam.css("text-decoration", "none");
            $chooseRun.css("text-decoration", "none");
            $chooseStop.css("text-decoration", "none");
            $online.css("text-decoration", "none");
            $chooseMiss.css("text-decoration", "none");
            $('#chooseHeartBeat').css("text-decoration", "none");
        } else if (event.data.type === 9) {
            $('#chooseHeartBeat').css("text-decoration", "underline");
            $chooseNot.css("text-decoration", "none");
            $chooseOverSeep.css("text-decoration", "none");
            $chooseAlam.css("text-decoration", "none");
            $chooseRun.css("text-decoration", "none");
            $chooseStop.css("text-decoration", "none");
            $online.css("text-decoration", "none");
            $chooseMiss.css("text-decoration", "none");
        }
    },
    alltree: function () {
        fzzflag = false;
        missAll = false;
        bflag = true;
        changeMiss = [];
        lineAs = [];//停车
        lineAr = [];//行驶
        lineAa = [];////报警
        lineAm = [];//未定位
        lineOs = [];//超速
        lineHb = [];//心跳
        misstype = false;
        misstypes = false;
        suFlag = true;
        zTreeIdJson = {};
        $("#search_condition").val("");
        var otherParam = null;
        if ($tableCarAll.text() <= 300) {
            var zurl = "/clbs/m/functionconfig/fence/bindfence/monitorTree";
            otherParam = {"webType": 1};
        } else {
            var zurl = "/clbs/m/functionconfig/fence/bindfence/bigDataMonitorTree";
        }
        var allsetting = {
            async: {
                url: zurl,
                type: "post",
                enable: true,
                autoParam: ["id"],
                otherParam: otherParam,
                dataType: "json",
                dataFilter: treeMonitoring.ajaxDataFilter
            },
            view: {
                addHoverDom: treeMonitoring.addHoverDom,
                removeHoverDom: treeMonitoring.removeHoverDom,
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
                onClick: treeMonitoring.onClickV,
                beforeDblClick: treeMonitoring.zTreeBeforeDblClick,
                onDblClick: treeMonitoring.onDbClickV,
                beforeClick: treeMonitoring.zTreeBeforeClick,
                beforeCheck: treeMonitoring.zTreeBeforeCheck,
                onCheck: treeMonitoring.onCheckVehicle,
                beforeAsync: treeMonitoring.zTreeBeforeAsync,
                onAsyncSuccess: treeMonitoring.zTreeOnAsyncSuccess,
                beforeExpand: treeMonitoring.zTreeBeforeExpand,
                onExpand: treeMonitoring.zTreeOnExpand,
                onNodeCreated: treeMonitoring.zTreeOnNodeCreated,
                onRightClick: treeMonitoring.zTreeShowRightMenu,
            }
        };
        $.fn.zTree.init($("#treeDemo"), allsetting);
        $chooseNot.css("text-decoration", "none");
        $chooseOverSeep.css("text-decoration", "none");
        $chooseAlam.css("text-decoration", "none");
        $chooseRun.css("text-decoration", "none");
        $chooseStop.css("text-decoration", "none");
        $online.css("text-decoration", "none");
        $chooseMiss.css("text-decoration", "none");
        bflag = false
    },
    // 筛选离线车辆
    misslines: function (event) {
        fzzflag = false;
        allflag = false;
        missAll = true;
        bflag = true;
        changeMiss = [];
        lineAs = [];//停车
        lineAr = [];//行驶
        lineAa = [];////报警
        lineAm = [];//未定位
        lineOs = [];//超速
        lineHb = [];//心跳
        var numberMiss = 7;
        if (event == 0) {
            misstypes = true;
            numberMiss = 8;
        } else {
            misstypes = false;
        }
        misstype = true;
        suFlag = true;
        zTreeIdJson = {};
        var otherParam = null;
        $("#search_condition").val("");
        if ($("#table-car-offline").text() <= 300) {
            zurl = "/clbs/m/basicinfo/monitoring/vehicle/treeStateInfo";
            otherParam = {"type": numberMiss, "webType": 1}
        } else {
            zurl = "/clbs/m/functionconfig/fence/bindfence/bigDataMonitorTree";
        }
        var settingTree = {
            async: {
                url: zurl,
                type: "post",
                enable: true,
                autoParam: ["id"],
                otherParam: otherParam,
                dataType: "json",
                dataFilter: treeMonitoring.ajaxDataFilter
            },
            view: {
                addHoverDom: treeMonitoring.addHoverDom,
                removeHoverDom: treeMonitoring.removeHoverDom,
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
                onClick: treeMonitoring.onClickV,
                onDblClick: treeMonitoring.onDbClickV,
                beforeClick: treeMonitoring.zTreeBeforeClick,
                beforeCheck: treeMonitoring.zTreeBeforeCheck,
                onCheck: treeMonitoring.onCheckVehicle,
                beforeAsync: treeMonitoring.zTreeBeforeAsync,
                onAsyncSuccess: treeMonitoring.zTreeOnAsyncSuccess,
                onExpand: treeMonitoring.zTreeOnExpand,
                onNodeCreated: treeMonitoring.zTreeOnNodeCreated,
                onRightClick: treeMonitoring.zTreeShowRightMenu,
            }
        };
        $.fn.zTree.init($("#treeDemo"), settingTree, null);
        $online.css("text-decoration", "none");
        $chooseOverSeep.css("text-decoration", "none");
        $chooseStop.css("text-decoration", "none");
        $chooseRun.css("text-decoration", "none");
        $chooseNot.css("text-decoration", "none");
        $chooseAlam.css("text-decoration", "none");
        $chooseMiss.css("text-decoration", "underline");
        bflag = false;
    },
    setNumber: function (data) {
        $("#tline").text("(" + data.obj.onlineNum + ")");
        $("#tmiss").text("(" + (data.obj.allV - data.obj.onlineNum) + ")");
        $("#table-car-online").text(data.obj.onlineNum);
        $("#table-car-offline").text(data.obj.allV - data.obj.onlineNum);
        $("#table-car-run").text(data.obj.runArrNum);
        $("#table-car-stop").text(data.obj.onlineParkNum);
        $("#tall").text("(" + data.obj.allV + ")");
        $tableCarAll.text(data.obj.allV);
        if (data.obj.allV !== 0) {
            $tableCarOnlinePercent.text((data.obj.onlineNum / data.obj.allV * 100).toFixed(2) + "%");
        } else {
            $tableCarOnlinePercent.text("0%")
        }
        runVidArray = data.obj.runVidArray;
        stopVidArray = data.obj.stopVidArray;
        diyueall = data.obj.vehicleIdArray;
        var otherParam = null;
        if (data.obj.allV <= 300) {
            zurl = "/clbs/m/functionconfig/fence/bindfence/monitorTree";
            otherParam = {"webType": 1};
        } else {
            zurl = "/clbs/m/functionconfig/fence/bindfence/bigDataMonitorTree";
        }
        // 初始化文件树
        setting = {
            async: {
                url: zurl,
                type: "post",
                enable: true,
                autoParam: ["id"],
                otherParam: otherParam,
                dataType: "json",
                dataFilter: treeMonitoring.ajaxDataFilter
            },
            view: {
                addHoverDom: treeMonitoring.addHoverDom,
                removeHoverDom: treeMonitoring.removeHoverDom,
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
                }
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
                onClick: treeMonitoring.onClickV,
                beforeDblClick: treeMonitoring.zTreeBeforeDblClick,
                onDblClick: treeMonitoring.onDbClickV,
                beforeClick: treeMonitoring.zTreeBeforeClick,
                beforeCheck: treeMonitoring.zTreeBeforeCheck,
                onCheck: treeMonitoring.onCheckVehicle,
                beforeAsync: treeMonitoring.zTreeBeforeAsync,
                onAsyncSuccess: treeMonitoring.zTreeOnAsyncSuccess,
                beforeExpand: treeMonitoring.zTreeBeforeExpand,
                onExpand: treeMonitoring.zTreeOnExpand,
                onNodeCreated: treeMonitoring.zTreeOnNodeCreated,
                onRightClick: treeMonitoring.zTreeShowRightMenu
            }
        };
        $.fn.zTree.init($("#treeDemo"), setting);
        zTree = $.fn.zTree.getZTreeObj("treeDemo");
        treeMonitoring.isGetSocket();
    },
    isGetSocket: function () {
        setTimeout(function () {
            if (webSocket.conFlag) {
                webSocket.subscribe(headers, '/user/' + $("#userName").text() + '/cachestatus', treeMonitoring.updataRealTree, null, null);
                setTimeout(function () {
                    webSocket.subscribe(headers, '/user/' + $("#userName").text() + '/alarm', treeMonitoring.updataRealAlarmMessage, "/app/vehicle/subscribeStatus", null);
                }, 1000);
            } else {
                treeMonitoring.isGetSocket();
            }
        }, 2000);
    },
    getIcoTreeUrl: function (treeId, treeNode) {
        if (treeNode == null) {
            return "/clbs/m/personalized/ico/IcoTree";
        } else if (treeNode.type == "assignment") {
            return "/clbs/m/functionconfig/fence/bindfence/putMonitorByAssign?assignmentId=" + treeNode.id + "&isChecked=" + treeNode.checked;
        }
    },
    zTreeBeforeAsync: function () {
        return bflag;
    },
    zTreeBeforeCheck: function (treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        var changedNodes = zTree.getChangeCheckedNodes();
        var flag = true;
        if (fzzflag && !treeNode.checked) {
            var queryType = $("#searchType").val();
            var queryParam = $("#search_condition").val();
            if (treeNode.type === 'group' && treeNode.pId === null) {
                json_ajax("POST", "/clbs/a/search/monitorTreeFuzzyCount", "json", false, {
                    "queryParam": queryParam,
                    "queryType": queryType
                }, function (data) {
                    if (data > 400) {
                        cheackGourpNum = data;
                        layer.alert("我们的监控上限是400辆,您刚刚勾选了" + cheackGourpNum + "辆,请重新勾选！");
                        flag = false;
                    }
                });
            }
            return flag;
        }
        if (treeNode.type === 'group' && !fzzflag) {
            json_ajax("POST", "/clbs/m/functionconfig/fence/bindfence/subGroup", "json", false, {
                "pid": treeNode.id,
                "type": treeNode.type
            }, function (data) {
                if (missAll) {
                    cheackGourpNum = (data.obj.num) - ($("#table-car-online").text());
                    if (cheackGourpNum > 400) {
                        layer.alert("我们的监控上限是400辆,您刚刚勾选了" + cheackGourpNum + "辆,请重新勾选！");
                        flag = false;
                    }
                } else {
                    if (data.obj.num > 400) {
                        cheackGourpNum = data.obj.num;
                        layer.alert("我们的监控上限是400辆,您刚刚勾选了" + data.obj.num + "辆,请重新勾选！");
                        flag = false;
                    }
                }
            });
        }
        return flag;
    },
    zTreeBeforeExpand: function () {
        return eflag;
    },
    zTreeBeforeDblClick: function (treeId, treeNode) {
        var flag = true;
        if (treeNode.type === 'group') {
            json_ajax("POST", "/clbs/m/functionconfig/fence/bindfence/subGroup", "json", false, {
                "pid": treeNode.id,
                "type": treeNode.type
            }, function (data) {
                if (data.obj.num > 400) {
                    cheackGourpNum = data.obj.num
                    layer.alert("我们的监控上限是400辆,您刚刚勾选了" + data.obj.num + "辆,请重新勾选！")
                    flag = false;
                }
            });
        }
        return flag;
    },
    getVehicleArr: function (data) {
        diyueall = data.obj;
    },
    //企业树显示
    enterpriseShow: function () {
        var this_tree = $(this).siblings('div.ztreeModelBox');
        if (this_tree.is(":hidden")) {
            var width = this_tree.parent('div').width();
            this_tree.css('width', width + 'px');
            this_tree.show();
        } else {
            this_tree.hide();
        }
        ;
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
                dataFilter: treeMonitoring.FenceAjaxDataFilter
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
                onClick: treeMonitoring.vFenceTreeClick,
                onCheck: treeMonitoring.vFenceTreeCheck
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
    //电子围栏及监控对象切换
    fenceAndVehicleFn: function () {
        var id = $(this).attr("id");
        //隐藏地图工具栏相关
        if (!($("#mapDropSettingMenu").is(":hidden"))) {
            $("#mapDropSettingMenu").hide();//地图设置
        }
        if (!($("#disSetMenu").is(":hidden"))) {
            $("#disSetMenu").hide();//显示设置
        }
        $("#toolOperateClick").animate({marginRight: "-776px"});
        //判断点击电子围栏
        if (id == "TabCarBox") {
            $("#fenceTool").hide();
            treeMonitoring.delFenceListAndMapClear();
        } else {
            $("#fenceTool").show();
        }
    },
    //当前监控对象围栏点击
    vFenceTreeClick: function (e, treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("vFenceTree");
        zTree.checkNode(treeNode, !treeNode.checked, true);
        treeMonitoring.vFenceTreeCheck(e, treeId, treeNode);
        return false;
        treeMonitoring.showZtreeCheckedToMap(treeNode, zTree);
    },
    //当前监控对象围栏勾选
    vFenceTreeCheck: function (e, treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("vFenceTree");
        if (treeNode.checked) {
            zTree.expandNode(treeNode, true, true, true, true); // 展开节点
        }
        var nodes = zTree.getCheckedNodes(true);
        treeMonitoring.showZtreeCheckedToMap(treeNode, zTree);
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
            for (var j = 0; j < changeNodes.length; j++) {
                var nodesId = changeNodes[j].id;
                treeMonitoring.showFenceInfo(nodesId, changeNodes[j]);
            }
        } else {
            var changeNodes = zTree.getChangeCheckedNodes();
            for (var i = 0, len = changeNodes.length; i < len; i++) {
                changeNodes[i].checkedOld = false;
                zTree.cancelSelectedNode(changeNodes[i]);
                var nodesId = changeNodes[i].id;
                treeMonitoring.hideFenceInfo(nodesId);
            }
        }
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
            //清空围栏数组及地图
            treeMonitoring.delFenceListAndMapClear();
            //订阅后查询当前对象绑定围栏信息
            treeMonitoring.getCurrentVehicleAllFence(treeId);
            //显示围栏树及搜索 隐藏消息提示
            $("#vFenceTree").removeClass("hidden");
            $("#vSearchContent").removeClass("hidden");
            $("#vFenceMsg").addClass("hidden");
        } else {
            $("#vFenceTree").html("").addClass("hidden");
            $("#vSearchContent").addClass("hidden");
            $("#vFenceMsg").removeClass("hidden");
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
                            var lineSpot = dataList[i].lineSpot == undefined ? [] : dataList[i].lineSpot;
                            var lineSegment = dataList[i].lineSegment == undefined ? [] : dataList[i].lineSegment;
                            if (fenceType == "zw_m_marker") { // 标注
                                treeMonitoring.drawMarkToMap(fenceData, showMap);
                            } else if (fenceType == "zw_m_line") { // 线
                                treeMonitoring.drawLineToMap(fenceData, lineSpot, lineSegment, showMap);
                            } else if (fenceType == "zw_m_rectangle") { // 矩形
                                treeMonitoring.drawRectangleToMap(fenceData, showMap);
                            } else if (fenceType == "zw_m_polygon") { // 多边形
                                treeMonitoring.drawPolygonToMap(fenceData, showMap);
                            } else if (fenceType == "zw_m_circle") { // 圆形
                                treeMonitoring.drawCircleToMap(fenceData, showMap);
                            } else if (fenceType == "zw_m_administration") { // 行政区域
                                var aId = dataList[0].aId
                                treeMonitoring.drawAdministrationToMap(fenceData, aId, showMap);
                            } else if (fenceType == "zw_m_travel_line") { // 行驶路线
                                treeMonitoring.drawTravelLineToMap(fenceData, showMap, dataList[i].travelLine, wayPointArray);
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
    },
    //多边形
    drawPolygonToMap: function (polygon, thisMap) {
        var polygonId = polygon[0].polygonId;
        if (fenceIdList.containsKey(polygonId)) {
            var thisFence = fenceIdList.get(polygonId);
            thisFence.hide();
            fenceIdList.remove(polygonId);
        }
        var dataArr = new Array();
        if (polygon != null && polygon.length > 0) {
            for (var i = 0; i < polygon.length; i++) {
                dataArr.push([polygon[i].longitude, polygon[i].latitude]);
            }
        }
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
        var start_point_value = [travelLine.startLongitude, travelLine.startLatitude];
        var end_point_value = [travelLine.endLongitude, travelLine.endLatitude];
        var wayValue = [];
        if (wayPointArray != undefined) {
            for (var j = 0, len = wayPointArray.length; j < len; j++) {
                wayValue.push([wayPointArray[j].longitude, wayPointArray[j].latitude]);
            }
        }
        for (var i = 0, len = data.length; i < len; i++) {
            path.push([data[i].longitude, data[i].latitude]);
        }
        if (travelLineList.containsKey(lineID)) {
            var this_line = travelLineList.get(lineID);
            map.remove([this_line]);
            travelLineList.remove(lineID);
        }
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
            } else {
                thisFence.hide();
            }
            fenceIdList.remove(lineId);
        }
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
            } else {
                thisFence.hide();
            }
        }
        treeMonitoring.hideRegionsOrTravel(nodesId);
    },
    //隐藏行政区划及行驶路线
    hideRegionsOrTravel: function (id) {
        //行政区划
        if (AdministrativeRegionsList.containsKey(id)) {
            var this_fence = AdministrativeRegionsList.get(id);
            map.remove(this_fence);
            AdministrativeRegionsList.remove(id);
        }
        //行驶路线
        if (travelLineList.containsKey(id)) {
            var this_fence = travelLineList.get(id);
            map.remove(this_fence);
            travelLineList.remove(id);
        }
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
            }
        } else {
            treeMonitoring.getFenceDetailInfo([node], map);
        }
    },
    treeToTrackBlack: function () {
        var jumpFlag = false;
        var permissionUrls = $("#permissionUrls").val();
        if (permissionUrls != null && permissionUrls != undefined) {
            var urllist = permissionUrls.split(",");
            if (urllist.indexOf("/v/monitoring/trackPlayback") > -1) {
                jumpFlag = true;
                location.href = "/clbs/v/monitoring/trackPlayback";
            }
        }
        if (!jumpFlag) {
            layer.msg("无操作权限，请联系管理员");
        }
    },

    /**
     * 设置终端车牌号
     * @param type
     */
    setPlateNumber: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        parametersID = type;
        $("#terminalPlate").html("设置终端车牌号：" + brand);
        $("#oldNumber").val(brand);
        $("#plateId").val(type);
        $("#setPlateNumber").modal('show');
        rMenu.css({"visibility": "hidden"});
        setTimeout("dataTableOperation.logFindCilck()", 500);
        $("#brand").val('');
    },

    /**
     * 设置OBD
     */
    setOBD: function (type) {
        pageLayout.closeVideo();
        treeMonitoring.getBrandParameter(type);
        parametersID = type;
        var OBDMultiplicative = [];
        var OBDCommercial = [];
        var url = "/clbs/v/monitoring/findOBD";
        json_ajax("POST", url, "json", false, null, function (data) {
            if (data.success) {
                var datas = data.obj;
                if (datas != null && datas.length > 0) {
                    for (var i = 0; i < datas.length; i++) {
                        if (datas[i].type == 'OBD1') {
                            OBDMultiplicative.push({
                                code: datas[i].code,
                                name: datas[i].value
                            });
                        } else if (datas[i].type == 'OBD2') {
                            OBDCommercial.push({
                                code: datas[i].code,
                                name: datas[i].value + '-' + datas[i].description
                            });
                        }
                    }
                    $("#model").val(datas[0].value);
                    $("#OBDVid").val(datas[0].code);
                }
                $("#OBDMultiplicative").val(JSON.stringify(OBDMultiplicative));
                $("#OBDCommercial").val(JSON.stringify(OBDCommercial))
            } else {
                layer.msg("获取OBD车型信息失败");
                return
            }
        });
        setTimeout("dataTableOperation.logFindCilck()", 500);
        $("#OBDtitle").html("设置OBD车型信息：" + brand);
        $("#classification").val(0);
        $('#modelName').html("<label class='text-danger'>*</label> 车型名称：");
        $("#OBDId").val(type);
        treeMonitoring.getOBDVehicle();
        $("#OBD").modal('show');
        rMenu.css({"visibility": "hidden"});
        setTimeout("dataTableOperation.logFindCilck()", 500);
        $("#newPlateNumber").val('');
    },

    /**
     * OBD车辆类型下拉选
     * @param data
     */
    getOBDVehicle: function () {
        var data;
        var classification = $("#classification").val();
        if (classification == 0) {
            //乘用车
            data = JSON.parse($("#OBDMultiplicative").val());
        } else if (classification == 1) {
            //商用车
            data = JSON.parse($("#OBDCommercial").val());
        }
        var dataList = {value: []};
        if (data != null && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                dataList.value.push({
                    name: data[i].name,
                    code: data[i].code
                });
            }
            $("#model").val(data[0].name);
            $("#OBDVid").val(data[0].code);
        }
        $("#OBDVName").val('');
        $("#model").bsSuggest("destroy"); // 销毁事件
        $("#model").bsSuggest({
            indexId: 1,  //data.value 的第几个数据，作为input输入框的内容
            indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
            data: dataList,
            effectiveFields: ["name"]
        }).on('onDataRequestSuccess', function (e, result) {
        }).on('onSetSelectValue', function (e, keyword, data) {
            $("#OBDVid").val(keyword.id);
            $("#OBDVName").val(keyword.key);
        }).on('onUnsetSelectValue', function () {
        });
    },

}

function showErrorMsg(msg, inputId) {
    if ($("#error_label").is(":hidden")) {
        $("#error_label").text(msg);
        $("#error_label").insertAfter($("#" + inputId));
        $("#error_label").show();
    } else {
        $("#error_label").is(":hidden");
    }
}
var vehicleFenceList = "";
var oldFencevehicleIds;
var fenceOperation = {
    // 初始化
    init: function () {
        // 围栏树
        var fenceAll = {
            async: {
                url: "/clbs/m/functionconfig/fence/bindfence/fenceTree",
                type: "post",
                enable: true,
                autoParam: ["id"],
                dataType: "json",
                otherParam: {"type": "multiple"},
                dataFilter: fenceOperation.FenceAjaxDataFilter
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
            view: {
                addHoverDom: fenceOperation.addHoverDom,
                removeHoverDom: fenceOperation.removeHoverDom,
                dblClickExpand: false,
                nameIsHTML: true,
                fontCss: setFontCss_ztree
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                onClick: fenceOperation.onClickFenceChar,
                onCheck: fenceOperation.onCheckFenceChar
            }
        };
        $.fn.zTree.init($("#fenceDemo"), fenceAll, null);
        //IE9（模糊查询）
        if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE9.0") {
            var search;
            $("#searchFence").bind("focus", function () {
                search = setInterval(function () {
                    search_ztree('fenceDemo', 'searchFence', 'fence');
                }, 500);
            }).bind("blur", function () {
                clearInterval(search);
            });
        }
        // 时分秒选择器
        var hmsTime = '<div id="hmsTime" style="text-align:center;background-color:#ffffff;border:1px solid #cccccc;width:200px; display:none;"><div id="hourseSelect"><div style="text-align:center;width:200px;background-color:#6dcff6;color:#ffffff;">时</div><table style="width:200px;border-top:1px solid #cccccc; color:#6dcff6;"><thead></thead><tbody><tr><td>01</td><td>02</td><td>03</td><td>04</td></tr><tr><td>05</td><td>06</td><td>07</td><td>08</td></tr><tr><td>09</td><td>10</td><td>11</td><td>12</td></tr><tr><td>13</td><td>14</td><td>15</td><td>16</td></tr><tr><td>17</td><td>18</td><td>19</td><td>20</td></tr><tr><td>21</td><td>22</td><td>23</td><td>00</td></tr></tbody></table></div><div id="minuteSelect" style="display:none;"><div style="text-align:center;width:200px;background-color:#6dcff6;color:#ffffff;">分</div><table style="width:200px;border-top:1px solid #cccccc; color:#6dcff6"><thead></thead><tbody><tr><td>01</td><td>02</td><td>03</td><td>04</td><td>05</td><td>06</td></tr><tr><td>07</td><td>08</td><td>09</td><td>10</td><td>11</td><td>12</td></tr><tr><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td></tr><tr><td>19</td><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td></tr><tr><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td><td>30</td></tr><tr><td>31</td><td>32</td><td>33</td><td>34</td><td>35</td><td>36</td></tr><tr><td>37</td><td>38</td><td>39</td><td>40</td><td>41</td><td>42</td></tr><tr><td>43</td><td>44</td><td>45</td><td>46</td><td>47</td><td>48</td></tr><tr><td>49</td><td>50</td><td>51</td><td>52</td><td>53</td><td>54</td></tr><tr><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td><td>00</td></tr></tbody></table></div><div id="secondSelect" style="display:none;"><div style="text-align:center;width:200px;background-color:#6dcff6;color:#ffffff;">秒</div><table style="width:200px;border-top:1px solid #cccccc;color:#6dcff6;"><thead></thead><tbody><tr><td>01</td><td>02</td><td>03</td><td>04</td><td>05</td><td>06</td></tr><tr><td>07</td><td>08</td><td>09</td><td>10</td><td>11</td><td>12</td></tr><tr><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td></tr><tr><td>19</td><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td></tr><tr><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td><td>30</td></tr><tr><td>31</td><td>32</td><td>33</td><td>34</td><td>35</td><td>36</td></tr><tr><td>37</td><td>38</td><td>39</td><td>40</td><td>41</td><td>42</td></tr><tr><td>43</td><td>44</td><td>45</td><td>46</td><td>47</td><td>48</td></tr><tr><td>49</td><td>50</td><td>51</td><td>52</td><td>53</td><td>54</td></tr><tr><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td><td>00</td></tr></tbody></table></div></div>';
        $("body").append(hmsTime);
        $("#hmsTime tr td").on("mouseover", function () {
            $(this).css({
                "background-color": "#6dcff6",
                "color": "#ffffff"
            })
        }).on("mouseout", function () {
            $(this).css({
                "background-color": "#ffffff",
                "color": "#6dcff6"
            })
        });
        // datatable列表显示隐藏列
        var table = $("#dataTableBind tr th:gt(1)");
        var menu_text = '';
        menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(2) + "\" disabled />" + table[0].innerHTML + "</label></li>"
        for (var i = 1; i < table.length; i++) {
            menu_text += "<li><label><input type=\"checkbox\" checked=\"checked\" class=\"toggle-vis\" data-column=\"" + parseInt(i + 2) + "\" />" + table[i].innerHTML + "</label></li>"
        }
        ;
        $("#Ul-menu-text-bind").html(menu_text);
        laydate.render({elem: '#arriveTime', type: 'datetime', theme: '#6dcff6'});
        laydate.render({elem: '#leaveTime', type: 'datetime', theme: '#6dcff6'});
        laydate.render({elem: '#msStartTime', type: 'datetime', theme: '#6dcff6'});
        laydate.render({elem: '#msEndTime', type: 'datetime', theme: '#6dcff6'});
        laydate.render({elem: '#muStartTime', type: 'datetime', theme: '#6dcff6'});
        laydate.render({elem: '#muEndTime', type: 'datetime', theme: '#6dcff6'});
    },
    // 围栏绑定列表
    fenceBindList: function () {
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
                    var result = '';
                    var obj = {};
                    obj.fenceConfigId = row.id;
                    obj.paramId = row.paramId;
                    obj.vehicleId = row.vehicle_id;
                    obj.fenceId = row.fence_id;
                    var jsonStr = JSON.stringify(obj)
                    result += "<input  type='checkbox' name='subChk'  value='" + jsonStr + "' />";
                    return result;
                }
            },
            {
                "data": null,
                "class": "text-center", //最后一列，操作按钮
                render: function (data, type, row, meta) {
                    var editUrlPath = myTable.editUrl + ".gsp?id=" + row.id + "&brand=" + row.brand + "&name=" + row.name + "&type=" + row.type + "&alarmSource=" + row.alarm_source; //修改地址
                    var result = '';
                    //修改按钮
                    result += '<button href="' + editUrlPath + '" data-target="#commonWin" data-toggle="modal"  type="button" class="editBtn editBtn-info"><i class="fa fa-pencil"></i>修改</button>&nbsp;';
                    // 围栏下发按钮
                    if (row.type == 'zw_m_marker' || row.alarm_source == 1 || (row.deviceType != '0' && row.deviceType != '1')) {
                        result += ' <button disabled onclick="fenceOperation.sendFenceOne(\'' + row.id + '\',\'' + row.paramId + '\',\'' + row.vehicle_id + '\',\'' + row.fence_id + '\')" class="editBtn btn-default" type="button"><i class="glyphicon glyphicon-circle-arrow-down"></i>围栏下发</button>&nbsp;'
                    } else {
                        result += ' <button onclick="fenceOperation.sendFenceOne(\'' + row.id + '\',\'' + row.paramId + '\',\'' + row.vehicle_id + '\',\'' + row.fence_id + '\')" class="editBtn editBtn-info" type="button"><i class="glyphicon glyphicon-circle-arrow-down"></i>围栏下发</button>&nbsp;'
                    }
                    //删除按钮
                    result += '<button type="button" onclick="myTable.deleteItem(\''
                        + row.id
                        + '\')" class="deleteButton editBtn disableClick"><i class="fa fa-trash-o"></i>解除绑定</button>';
                    return result;
                }
            }, {
                "data": "type",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    return fenceOperation.fencetypepid(data);
                }
            }, {
                "data": "name",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    var fenceId = '<a onclick="fenceOperation.tableFence(\'' + row.fenceId + '\')">' + data + '</a>';
                    return fenceId;
                }
            }, {
                "data": "brand",
                "class": "text-center"
            }, {
                "data": "dirStatus",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (data == "0") {
                        return '参数已生效';
                    } else if (data == "1") {
                        return '参数未生效';
                    } else if (data == "2") {
                        return "参数消息有误";
                    } else if (data == "3") {
                        return "参数不支持";
                    } else if (data == "4") {
                        return "参数下发中";
                    } else if (data == "5") {
                        return "终端离线，未下发";
                    }  else if (data == "7") {
                        return "终端处理中";
                    } else if (data == "8") {
                        return "终端接收失败";
                    } else {
                        return "";
                    }
                }
            }, {
                "data": "send_fence_type",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (row.alarm_source == 1) {
                        return "";
                    } else {
                        if (data == "0") {
                            return '更新';
                        } else if (data == "1") {
                            return '追加';
                        } else if (data == "2") {
                            return "修改";
                        }
                    }
                }
            }, {
                "data": "alarm_source",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (data == "0") {
                        return '终端报警';
                    } else if (data == "1") {
                        return '平台报警';
                    }
                }
            }, {
                "data": "alarm_start_time",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (data != null && data != "") {
                        var dateStr = data.substring(0, 10);
                        return dateStr;
                    } else {
                        return "";
                    }
                }
            }, {
                "data": "alarm_end_time",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (data != null && data != "") {
                        var dateStr = data.substring(0, 10);
                        return dateStr;
                    } else {
                        return "";
                    }
                }
            }, {
                "data": "alarm_start_date",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (data != null && data != "") {
                        var dateStr = data.substring(10);
                        return dateStr;
                    } else {
                        return "";
                    }
                }
            }, {
                "data": "alarm_end_date",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (data != null && data != "") {
                        var dateStr = data.substring(10);
                        return dateStr;
                    } else {
                        return "";
                    }
                }
            }, {
                "data": "alarm_in_platform",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (data == "1") {
                        return 'V';
                    } else if (data == "0") {
                        return 'X';
                    } else {
                        return "";
                    }
                }
            }, {
                "data": "alarm_out_platform",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (data == "1") {
                        return 'V';
                    } else if (data == "0") {
                        return 'X';
                    } else {
                        return "";
                    }
                }
            }, {
                "data": "alarm_in_driver",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (row.alarm_source == 1) {
                        return "";
                    } else {
                        if (data == "1") {
                            return 'V';
                        } else if (data == "0") {
                            return 'X';
                        } else {
                            return "";
                        }
                    }
                }
            }, {
                "data": "alarm_out_driver",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (row.alarm_source == 1) {
                        return "";
                    } else {
                        if (data == "1") {
                            return 'V';
                        } else if (data == "0") {
                            return 'X';
                        } else {
                            return "";
                        }
                    }
                }
            }, {
                "data": "speed",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    return data;
                }
            }, {
                "data": "over_speed_last_time",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (row.alarm_source == 1) {
                        return "";
                    } else {
                        return data;
                    }
                }
            }, {
                "data": "travel_long_time",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (row.alarm_source == 1) {
                        return "";
                    } else {
                        return data;
                    }
                }
            }, {
                "data": "travel_small_time",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (row.alarm_source == 1) {
                        return "";
                    } else {
                        return data;
                    }
                }
            }, {
                "data": "open_door",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (row.alarm_source == 1) {
                        return "";
                    } else {
                        if (data == "0") {
                            return 'V';
                        } else if (data == "1") {
                            return 'X';
                        } else {
                            return "";
                        }
                    }
                }
            }, {
                "data": "communication_flag",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (row.alarm_source == 1) {
                        return "";
                    } else {
                        if (data == "0") {
                            return 'V';
                        } else if (data == "1") {
                            return 'X';
                        } else {
                            return "";
                        }
                    }
                }
            }, {
                "data": "gnss_flag",
                "class": "text-center",
                render: function (data, type, row, meta) {
                    if (row.alarm_source == 1) {
                        return "";
                    } else {
                        if (data == "0") {
                            return 'V';
                        } else if (data == "1") {
                            return 'X';
                        } else {
                            return "";
                        }
                    }
                }
            }

        ];
        //ajax参数
        var ajaxDataParamFun = function (d) {
            d.simpleQueryParam = $('#simpleQueryParam').val(); //模糊查询
            d.queryFenceIdStr = queryFenceId.unique3().join(",");
        };
        // 表格setting
        var bindSetting = {
            listUrl: "/clbs/m/functionconfig/fence/bindfence/list",
            editUrl: "/clbs/m/functionconfig/fence/bindfence/editById",
            deleteUrl: "/clbs/m/functionconfig/fence/bindfence/delete_",
            deletemoreUrl: "/clbs/m/functionconfig/fence/bindfence/deletemore",
            enableUrl: "/clbs/c/user/enable_",
            disableUrl: "clbs/c/user/disable_",
            columnDefs: columnDefs, //表格列定义
            columns: columns, //表格列
            dataTableDiv: 'dataTableBind', //表格
            ajaxDataParamFun: ajaxDataParamFun, //ajax参数
            pageable: true, //是否分页
            showIndexColumn: true, //是否显示第一列的索引列
            enabledChange: true,
            pageNumber: 4,
            setPageNumber: false
        };
        // 创建表格
        myTable = new TG_Tabel.createNew(bindSetting);
        // 表格初始化
        myTable.init();
    },
    // 围栏绑定checked操作
    tableCheckAll: function () {
        $('input[name="subChk"]').prop("checked", this.checked);
    },
    // 电子围栏查询
    searchFenceCarSearch: function () {
        search_ztree('fenceDemo', 'searchFence', 'fence');
    },
    // 围栏隐藏
    fenceHidden: function (nodesId) {
        if (lineSpotMap.containsKey(nodesId)) {
            var thisStopArray = lineSpotMap.get(nodesId);
            for (var i = 0; i < thisStopArray.length; i++) {
                thisStopArray[i].hide();
            }
            ;
        }
        ;
        if (fenceIDMap.containsKey(nodesId)) {
            var thisFence = fenceIDMap.get(nodesId);
            if (PolyEditorMap != undefined) {
                var obj = PolyEditorMap.get(nodesId);
                if (obj != undefined) {
                    if (Array.isArray(obj)) {
                        for (var j = 0; j < obj.length; j++) {
                            obj[j].close();
                        }
                        ;
                    } else {
                        obj.close();
                    }
                    ;
                }
                ;
            }
            ;
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
        fenceOperation.hideFence(nodesId);
    },
    // 围栏显示
    fenceShow: function (nodesId, node) {
        if (fenceIDMap.containsKey(nodesId)) {
            var thisFence = fenceIDMap.get(nodesId);
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
            fenceOperation.getFenceDetail([node], map);
        }
        ;
        if (lineSpotMap.containsKey(nodesId)) {
            var thisStopArray = lineSpotMap.get(nodesId);
            for (var y = 0; y < thisStopArray.length; y++) {
                thisStopArray[y].show();
            }
            ;
        }
        ;
    },
    // 分段点显示与否
    sectionPointState: function (nodesId, flag) {
        if (sectionPointMarkerMap.containsKey(nodesId)) {
            var thisPointMarker = sectionPointMarkerMap.get(nodesId);
            for (var i = 0; i < thisPointMarker.length; i++) {
                if (flag) {
                    thisPointMarker[i].show();
                } else {
                    thisPointMarker[i].hide();
                }
            }
            ;
        }
        ;
    },
    // 电子围栏点击事件
    onClickFenceChar: function (e, treeId, treeNode) {
        isAddDragRoute = false;
        isEdit = true;
        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
        var nodes = zTree.getSelectedNodes(true);
        if (treeNode.isParent == true) {
            zTree.cancelSelectedNode(nodes[0]);
            return false;
        }
        ;
        $("#charMap").attr("class", "fa fa-chevron-down mapBind");
        $("#charMapArea").css("display", "block");
        var nodesId = treeNode.id;
        if (clickStateChar == undefined) {
            clickStateChar = nodesId;
            zTree.checkNode(nodes[0], true, true);
            nodes[0].checkedOld = true;
            fenceOperation.fenceHidden(nodesId);
            fenceOperation.getFenceDetail(nodes, map);
        } else {
            if (nodesId == clickStateChar) {
                if (charFlag) {
                    zTree.checkNode(nodes[0], false, true);
                    nodes[0].checkedOld = false;
                    zTree.cancelSelectedNode(nodes[0]);
                    var checkNodes = zTree.getCheckedNodes(true);
                    fenceCheckLength = checkNodes.length;
                    fenceOperation.fenceHidden(nodesId);
                    fenceOperation.sectionPointState(nodesId, false);
                    charFlag = false;
                } else {
                    charFlag = true;
                    clickStateChar = nodesId;
                    zTree.checkNode(nodes[0], true, true);
                    nodes[0].checkedOld = true;
                    fenceOperation.fenceHidden(nodesId);
                    fenceOperation.getFenceDetail(nodes, map);
                    fenceOperation.sectionPointState(nodesId, true);
                }
            } else {
                charFlag = true;
                clickStateChar = nodesId;
                zTree.checkNode(nodes[0], true, true);
                nodes[0].checkedOld = true;
                fenceOperation.fenceHidden(nodesId);
                fenceOperation.getFenceDetail(nodes, map);
                fenceOperation.sectionPointState(nodesId, true);
            }
        }
        // 通过所选择的围栏节点筛选绑定列表
        fenceOperation.getcheckFenceNode(zTree);
        myTable.filter();
        myTable.requestData();
    },
    getcheckFenceNode: function (zTree) {
        var checkFences = zTree.getCheckedNodes(true);
        queryFenceId = [];
        if (checkFences != null && checkFences.length > 0) {
            for (var i = 0; i < checkFences.length; i++) {
                if (checkFences[i].isParent == false) {
                    queryFenceId.push(checkFences[i].id);
                }
            }
        }
        ;
    },
    // 电子围栏勾选事件
    onCheckFenceChar: function (e, treeId, treeNode) {
        isAddDragRoute = false;
        isEdit = true;
        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
        var nodes = zTree.getCheckedNodes(true);
        var nodeLength = nodes.length;
        // 通过所选择的围栏节点筛选绑定列表
        fenceOperation.getcheckFenceNode(zTree);
        myTable.requestData();
        /*myTable.filter();*/
        if (nodeLength > fenceCheckLength) {
            fenceCheckLength = nodeLength;
            var changeNodes = zTree.getChangeCheckedNodes();
            for (var i = 0, len = changeNodes.length; i < len; i++) {
                changeNodes[i].checkedOld = true;
            }
            ;
            for (var j = 0; j < changeNodes.length; j++) {
                var nodesId = changeNodes[j].id;
                fenceOperation.fenceShow(nodesId, changeNodes[j]);
                fenceOperation.sectionPointState(nodesId, true);
            }
            ;
        } else {
            fenceCheckLength = nodeLength;
            var changeNodes = zTree.getChangeCheckedNodes();
            for (var i = 0, len = changeNodes.length; i < len; i++) {
                changeNodes[i].checkedOld = false;
                zTree.cancelSelectedNode(changeNodes[i]);
                var nodesId = changeNodes[i].id;
                fenceOperation.hideFence(nodesId);
                fenceOperation.fenceHidden(nodesId);
                fenceOperation.sectionPointState(nodesId, false);
            }
            ;
        }
        ;
    },
    //当点击或选择围栏时，访问后台返回围栏详情
    getFenceDetail: function (fenceNode, showMap) {
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
                                fenceOperation.drawMark(fenceData, showMap);
                            } else if (fenceType == "zw_m_line") { // 线
                                fenceOperation.drawLine(fenceData, lineSpot, lineSegment, showMap);
                            } else if (fenceType == "zw_m_rectangle") { // 矩形
                                fenceOperation.drawRectangle(fenceData, showMap);
                            } else if (fenceType == "zw_m_polygon") { // 多边形
                                fenceOperation.drawPolygon(fenceData, showMap);
                            } else if (fenceType == "zw_m_circle") { // 圆形
                                fenceOperation.drawCircle(fenceData, showMap);
                            } else if (fenceType == "zw_m_administration") { // 行政区域
                                var aId = dataList[0].aId
                                fenceOperation.drawAdministration(fenceData, aId, showMap);
                            } else if (fenceType == "zw_m_travel_line") { // 行驶路线
                                fenceOperation.drawTravelLine(fenceData, showMap, dataList[i].travelLine, wayPointArray);
                            }
                        }
                    }
                }
            }
        });
    },
    updateFence: function (fenceId_shape, flag) {
        var width;
        var strs = fenceId_shape.split("#");
        var fenceId = strs[0];
        var shape = strs[1];
        var fenceId_shape_value;
        if (strs.length == 3) {
            fenceId_shape_value = strs[0] + "#" + strs[1];
        } else {
            fenceId_shape_value = fenceId_shape;
        }
        ;
        // ajax访问后端查询
        $.ajax({
            type: "POST",
            async: false,
            url: "/clbs/m/functionconfig/fence/managefence/previewFence",
            data: {"fenceIdShape": fenceId_shape_value},
            dataType: "json",
            success: function (data) {
                if (data.success) {
                    var dataList = data.obj;
                    if (flag) {
                        width = dataList[0].line.width;
                    } else {
                        if (strs.length == 2) {
                            if (dataList != null && dataList.length > 0) {
                                $("#myPageTop").hide();
                                $("#result").hide();
                                $(".fenceA").removeClass("fenceA-active");
                                mouseTool.close(true);
                                for (var i = 0; i < dataList.length; i++) {
                                    var fenceType = dataList[i].fenceType;
                                    var fenceData;
                                    var travelLine;
                                    var passPointData;
                                    if (fenceType == 'zw_m_travel_line') {
                                        travelLine = dataList[i].travelLine;
                                        passPointData = dataList[i].passPointData;
                                    } else {
                                        fenceData = dataList[i].fenceData;
                                    }
                                    ;
                                    var line = dataList[i].line;
                                    var lineSegment = dataList[i].lineSegment == undefined ? [] : dataList[i].lineSegment;
                                    var lineSpot = [];
                                    var polygon = dataList[i].polygon;
                                    if (fenceType == "zw_m_marker") { // 标注
                                        layer.msg(fenceOperationLableEdit);
                                        map.off("rightclick", amendLine);
                                        map.off("rightclick", amendPolygon);
                                        map.off("rightclick", amendCircle);
                                        fenceOperation.drawMark(fenceData, map);
                                        polyFence.setDraggable(true);
                                        moveMarkerFenceId = fenceId;
                                        moveMarkerBackData = fenceData;
                                        polyFence.on("mouseup", fenceOperation.moveMarker);
                                    } else if (fenceType == "zw_m_line") { // 线
                                        // layer.confirm("是否重置该线路的分段？", {btn : ["是", "否"]}, function () {
                                        $("#lineId").val(fenceId);
                                        var url = "/clbs/m/functionconfig/fence/managefence/resetSegment";
                                        json_ajax("POST", url, "json", false, {"lineId": fenceId}, fenceOperation.resetSegment)
                                        layer.closeAll();
                                        if (fenceSectionPointMap.containsKey(fenceId)) {
                                            fenceSectionPointMap.remove(fenceId);
                                        }
                                        ;
                                        if (PolyEditorMap.containsKey(fenceId)) {
                                            PolyEditorMap.remove(fenceId);
                                        }
                                        ;
                                        var lineEditorObjArray = [];
                                        for (var i = 0; i < polyFence.length; i++) {
                                            var lineEditorObj = new AMap.PolyEditor(map, polyFence[i]);
                                            lineEditorObj.open();
                                            lineEditorObjArray.push(lineEditorObj);
                                        }
                                        ;
                                        PolyEditorMap.put(fenceId, lineEditorObjArray);
                                        //隐藏分段限速点
                                        if (sectionPointMarkerMap.containsKey(fenceId)) {
                                            var sectionPointMarkerMapValue = sectionPointMarkerMap.get(fenceId);
                                            for (var t = 0; t < sectionPointMarkerMapValue.length; t++) {
                                                sectionPointMarkerMapValue[t].hide();
                                            }
                                            ;
                                            sectionPointMarkerMap.remove(fenceId);
                                        }
                                        ;
                                        if (lineSpotMap.containsKey(fenceId)) {
                                            var thisStopArray = lineSpotMap.get(fenceId);
                                            for (var i = 0; i < thisStopArray.length; i++) {
                                                thisStopArray[i].hide();
                                            }
                                            ;
                                        }
                                        ;
                                        map.off("rightclick", amendCircle);
                                        map.off("rightclick", amendPolygon);
                                        amendLine = function () {
                                            fenceOperation.rightClickHandler(fenceType, line, fenceId);
                                        };
                                        map.on("rightclick", amendLine);
                                        //});
                                    } else if (fenceType == "zw_m_rectangle") { // 矩形
                                        layer.msg(fenceOperationAreaReelect);
                                        fenceOperation.drawRectangle(fenceData, map);
                                        mouseToolEdit.rectangle();
                                        rectangle = true;
                                        mouseToolEdit.on("draw", function (e) {
                                            if (!isAddFlag && !isAreaSearchFlag) {
                                                var changeArray = e.obj.getPath();
                                                var pointSeqs = ""; // 点序号
                                                var longitudes = ""; // 所有的经度
                                                var latitudes = ""; // 所有的纬度
                                                var array = new Array();
                                                if (changeArray) {
                                                    for (var i = 0; i < changeArray.length; i++) {
                                                        array.push([changeArray[i].lng, changeArray[i].lat]);
                                                    }
                                                    ;
                                                    $("#LUPointLngLat").val(array[0][0] + "," + array[0][1]);
                                                    if (array.length > 2) {
                                                        $("#RDPointLngLat").val(array[2][0] + "," + array[2][1]);
                                                    }
                                                    for (var i = 0; i < array.length; i++) {
                                                        $("#table-lng-lat tbody tr:nth-child(" + parseInt(i + 1) + ")").children("td:nth-child(2)").text(array[i][0]);
                                                        $("#table-lng-lat tbody tr:nth-child(" + parseInt(i + 1) + ")").children("td:nth-child(3)").text(array[i][1]);
                                                        pointSeqs += i + ","; // 点序号
                                                        longitudes += array[i][0] + ","; // 把所有的经度组合到一起
                                                        latitudes += array[i][1] + ","; // 把所有的纬度组合到一起
                                                    }
                                                }
                                                // 去掉点序号、经度、纬度最后的一个逗号
                                                if (pointSeqs.length > 0) {
                                                    pointSeqs = pointSeqs.substr(0, pointSeqs.length - 1);
                                                }
                                                if (longitudes.length > 0) {
                                                    longitudes = longitudes.substr(0, longitudes.length - 1);
                                                }
                                                if (latitudes.length > 0) {
                                                    latitudes = latitudes.substr(0, latitudes.length - 1);
                                                }
                                                $("#addOrUpdateRectangleFlag").val("1"); // 修改矩形，给此文本框赋值为1
                                                $("#rectangleId").val(fenceId); // 矩形区域id
                                                // 矩形修改框弹出时给文本框赋值
                                                $("#rectangleName").val(fenceData.name);
                                                $("#rectangleType").val(fenceData.type);
                                                $("#rectangleDescription").val(fenceData.description);
                                                $("#pointSeqsRectangles").val(pointSeqs);
                                                $("#longitudesRectangles").val(longitudes);
                                                $("#latitudesRectangles").val(latitudes);
                                                pageLayout.closeVideo();
                                                setTimeout(function () {
                                                    $("#rectangle-form").modal("show");
                                                }, 200);
                                            }
                                            ;
                                        });
                                        map.off("rightclick", amendLine);
                                        map.off("rightclick", amendPolygon);
                                        map.off("rightclick", amendCircle);
                                    } else if (fenceType == "zw_m_polygon") { // 多边形
                                        fenceOperation.drawPolygon(fenceData, map);
                                        if (PolyEditorMap.containsKey(fenceId)) {
                                            PolyEditorMap.remove(fenceId);
                                        }
                                        ;
                                        var polygonEditorObj = new AMap.PolyEditor(map, polyFence);
                                        polygonEditorObj.open();
                                        PolyEditorMap.put(fenceId, polygonEditorObj);
                                        map.off("rightclick", amendCircle);
                                        map.off("rightclick", amendLine);
                                        amendPolygon = function () {
                                            fenceOperation.rightClickHandler(fenceType, polygon, fenceId);
                                        };
                                        map.on("rightclick", amendPolygon);
                                    } else if (fenceType == "zw_m_circle") { // 圆形
                                        fenceOperation.drawCircle(fenceData, map);
                                        if (PolyEditorMap.containsKey(fenceId)) {
                                            PolyEditorMap.remove(fenceId);
                                        }
                                        ;
                                        var circleEditorObj = new AMap.CircleEditor(map, polyFence);
                                        circleEditorObj.open();
                                        PolyEditorMap.put(fenceId, circleEditorObj);
                                        map.off("rightclick", amendLine);
                                        map.off("rightclick", amendPolygon);
                                        amendCircle = function () {
                                            $("#addOrUpdateCircleFlag").val("1"); // 修改圆，给此文本框赋值为1
                                            $("#circleId").val(fenceId); // 圆形区域id
                                            // 圆形区域修改框弹出时给文本框赋值
                                            $("#circleName").val(fenceData.name);
                                            $("#circleType").val(fenceData.type);
                                            $("#circleDescription").val(fenceData.description);
                                            var center = polyFence.getCenter();
                                            var radius = polyFence.getRadius();
                                            $("#circle-lng").attr("value", center.lng);
                                            $("#circle-lat").attr("value", center.lat);
                                            $("#circle-radius").attr("value", radius);
                                            $("#editCircleLng").val(center.lng);
                                            $("#editCircleLat").val(center.lat);
                                            $("#editCircleRadius").val(radius);
                                            pageLayout.closeVideo();
                                            setTimeout(function () {
                                                $("#circleArea").modal("show")
                                            }, 200);
                                        }
                                        map.on("rightclick", amendCircle);
                                    } else if ("zw_m_administration" == fenceType) {

                                    } else if (fenceType == 'zw_m_travel_line') { //修改行驶路线
                                        isAddDragRoute = true;
                                        $('#addOrUpdateTravelFlag').val('1');
                                        var this_line_id = travelLine.id;
                                        $('#travelLineId').val(this_line_id);
                                        if (travelLineMap.containsKey(this_line_id)) {
                                            var this_fence = travelLineMap.get(this_line_id);
                                            map.remove([this_fence]);
                                            travelLineMap.remove(this_line_id);
                                        }
                                        ;
                                        var lineOffset = travelLine.lineOffset; //偏移量
                                        var lineType = travelLine.lineType;//围栏类型
                                        var lineName = travelLine.name; //围栏名称
                                        var description = travelLine.description;//描述信息
                                        $('#dragRouteLineName').val(lineName);
                                        $('#dragRouteType').val(lineType);
                                        $('#excursion').val(lineOffset);
                                        $('#dragRouteDescription').val(description);
                                        var start_lnglat = [travelLine.startLongitude, travelLine.startLatitude];
                                        var end_lnglat = [travelLine.endLongitude, travelLine.endLatitude];
                                        var pointArray = [];
                                        pointArray.push(start_lnglat);
                                        if (passPointData != undefined) {
                                            for (var j = 0, len = passPointData.length; j < len; j++) {
                                                pointArray.push([passPointData[j].longitude, passPointData[j].latitude]);
                                            }
                                            ;
                                        }
                                        ;
                                        pointArray.push(end_lnglat);
                                        //逆地理编码
                                        fenceOperation.getAddressValue(pointArray, 0, []);
                                        $('#drivenRoute').show();
                                        //路径规划
                                        fenceOperation.madeDragRoute(pointArray);
                                    }
                                    ;
                                }
                            }
                        } else {
                            fenceOperation.fenceDetails(dataList);
                        }
                        ;
                    }
                } else {
                    layer.msg(data.msg);
                }
            }
        });
        return width;
    },
    //修改时右键点击事件:type-围栏类型；data-当前修改需要回显的数据
    rightClickHandler: function (type, data, fenceId) {
        var changeArray;
        if (Array.isArray(polyFence)) {
            var lineAllArray = [];

            for (var j = 0; j < polyFence.length; j++) {
                var changeLineArray = polyFence[j].getPath();
                lineAllArray = lineAllArray.concat(changeLineArray);
            }
            ;
            changeArray = lineAllArray
        } else {
            changeArray = polyFence.getPath();
        }
        ;
        var pointSeqs = ""; // 点序号
        var longitudes = ""; // 所有的经度
        var latitudes = ""; // 所有的纬度
        var array = new Array();
        for (var i = 0; i < changeArray.length; i++) {
            array.push([changeArray[i].lng, changeArray[i].lat]);
        }
        ;
        for (var i = 0; i < array.length; i++) {
            $("#table-lng-lat tbody tr:nth-child(" + parseInt(i + 1) + ")").children("td:nth-child(2)").text(array[i][0]);
            $("#table-lng-lat tbody tr:nth-child(" + parseInt(i + 1) + ")").children("td:nth-child(3)").text(array[i][1]);
            pointSeqs += i + ","; // 点序号
            longitudes += array[i][0] + ","; // 把所有的经度组合到一起
            latitudes += array[i][1] + ","; // 把所有的纬度组合到一起
        }
        // 去掉点序号、经度、纬度最后的一个逗号
        if (pointSeqs.length > 0) {
            pointSeqs = pointSeqs.substr(0, pointSeqs.length - 1);
        }
        if (longitudes.length > 0) {
            longitudes = longitudes.substr(0, longitudes.length - 1);
        }
        if (latitudes.length > 0) {
            latitudes = latitudes.substr(0, latitudes.length - 1);
        }
        if (type == "zw_m_line") {
            $("#addOrUpdateLineFlag").val("1"); // 修改线路，给此文本框赋值为1
            $("#lineId").val(fenceId); // 线路id
            // 路线修改框弹出时给文本框赋值
            $("#lineName1").val(data.name);
            $("#lineType1").val(data.type);
            $("#lineWidth1").val(data.width);
            $("#lineDescription1").val(data.description);
            $("#pointSeqs").val(pointSeqs);
            $("#longitudes").val(longitudes);
            $("#latitudes").val(latitudes);
            pageLayout.closeVideo();
            setTimeout(function () {
                $("#addLine").modal("show");
            }, 200);
        } else if (type == "zw_m_rectangle") {
            $("#addOrUpdateRectangleFlag").val("1"); // 修改矩形，给此文本框赋值为1
            $("#rectangleId").val(fenceId); // 矩形区域id
            // 矩形修改框弹出时给文本框赋值
            $("#rectangleName").val(data.name);
            $("#rectangleType").val(data.type);
            $("#rectangleDescription").val(data.description);
            $("#pointSeqsRectangles").val(pointSeqs);
            $("#longitudesRectangles").val(longitudes);
            $("#latitudesRectangles").val(latitudes);
            pageLayout.closeVideo();
            setTimeout(function () {
                $("#rectangle-form").modal("show");
            }, 200);
        } else if (type == "zw_m_polygon") {
            var html = '';
            for (var i = 0; i < array.length; i++) {
                html += '<div class="form-group">'
                    + '<label class="col-md-3 control-label">顶点' + (i + 1) + '经纬度：</label>'
                    + '<div class=" col-md-8">'
                    + '<input type="text" name="polygonPointLngLat" placeholder="请输入顶点经纬度" value="' + array[i][0] + "," + array[i][1] + '" class="form-control rectangleAllPointLngLat"/>'
                    + '</div>'
                    + '</div>'
            }
            ;
            $("#rectangleAllPointShow").html(html);
            $("#addOrUpdatePolygonFlag").val("1"); // 修改多边形，给此文本框赋值为1
            $("#polygonId").val(fenceId); // 多边形区域id
            // 多边形修改框弹出时给文本框赋值
            $("#polygonName").val(data.name);
            $("#polygonType").val(data.type);
            $("#polygonDescription").val(data.description);
            $("#pointSeqsPolygons").val(pointSeqs);
            $("#longitudesPolygons").val(longitudes);
            $("#latitudesPolygons").val(latitudes);
            pageLayout.closeVideo();
            setTimeout(function () {
                $("#myModal").modal("show");
            }, 200);
        }
    },
    // 删除围栏
    deleteFence: function (treeNode) {
        var url = "/clbs/m/functionconfig/fence/managefence/delete_" + treeNode.id + ".gsp";
        layer.confirm(fenceOperationFenceDeleteConfirm, {
            btn: ['确定', '取消'],
            icon: 3,
            move: false,
            title: "操作确认",
        }, function (index) {
            json_ajax("POST", url, "json", true, null, function (data) {
                if (data.success) {
                    fenceOperation.fenceHidden(treeNode.id);
                    fenceIDMap.remove(treeNode.id);
                    fenceOperation.sectionPointState(treeNode.id, false);
                    if (lineSpotMap.containsKey(treeNode.id)) {
                        var thisStopArray = lineSpotMap.get(treeNode.id);
                        map.remove(thisStopArray);
                        lineSpotMap.remove(treeNode.id);
                    }
                    ;
                    zTree.removeNode(treeNode);
                    fenceOperation.addNodes();
                } else {
                    layer.msg(data.msg);
                }
            });
            layer.close(index);
        }, function (index) {
            layer.close(index);
        });
    },
    //标注
    drawMark: function (mark, thisMap) {
        var markId = mark.id;
        if (fenceIDMap.containsKey(markId)) {
            var markerObj = fenceIDMap.get(markId);
            thisMap.remove(markerObj);
            fenceIDMap.remove(markId);
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
        fenceIDMap.put(markId, polyFence);
    },
    //线
    drawLine: function (line, lineSpot, lineSegment, thisMap) {
        var lineAllPointArray = [];
        for (var i = 0, len = line.length; i < len; i++) {
            lineAllPointArray.push([line[i].longitude, line[i].latitude]);
        }
        ;
        lineAllPointArray = lineAllPointArray.unique3();
        var startPointLatLng = [line[0].longitude, line[0].latitude];//起点坐标
        var endPointLatLng = [line[line.length - 1].longitude, line[line.length - 1].latitude];//终点坐标
        var lineId = line[0].lineId;
        $("#lineId").val(lineId);
        //是否存在线
        if (fenceIDMap.containsKey(lineId)) {
            var thisFence = fenceIDMap.get(lineId);
            if (Array.isArray(thisFence)) {
                for (var i = 0; i < thisFence.length; i++) {
                    thisFence[i].hide();
                }
                ;
            } else {
                thisFence.hide();
            }
            ;
            fenceIDMap.remove(lineId);
        }
        ;
        if (PolyEditorMap.containsKey(lineId)) {
            var mapEditFence = PolyEditorMap.get(lineId);
            if (Array.isArray(mapEditFence)) {
                for (var i = 0; i < mapEditFence.length; i++) {
                    mapEditFence[i].close();
                }
                ;
            } else {
                mapEditFence.close();
            }
            ;
        }
        ;
        var dataArr = new Array();
        if (line != null && line.length > 0) {
            for (var i in line) {
                if (line[i].type == "0") {
                    dataArr[i] = [line[i].longitude, line[i].latitude];
                }
            }
            var spotArray = [];
            for (var i = 0; i < lineSpot.length; i++) {
                var dataArrm = [];
                content = [];
                content.push("名称：" + lineSpot[i].name);
                content.push("经度：" + lineSpot[i].longitude);
                content.push("维度：" + lineSpot[i].latitude);
                content.push("达到时间：" + lineSpot[i].arriveTime);
                content.push("离开时间：" + lineSpot[i].leaveTime);
                content.push("描述：" + lineSpot[i].description);
                content.push('<a id="jump" onClick="fenceOperation.deleteKeyPoint(\'' + lineSpot[i].id + '\')">删除</a>');
                dataArrm.push(lineSpot[i].longitude);
                dataArrm.push(lineSpot[i].latitude);
                drawFence = new AMap.Marker({
                    position: dataArrm
                });
                drawFence.content = content.join("<br/>");
                drawFence.setMap(thisMap);
                thisMap.setFitView(drawFence);
                spotArray.push(drawFence);
                drawFence.on('click', amapOperation.markerClick);
            }
            if (lineSpotMap.containsKey(lineId)) {
                var thisStopArray = lineSpotMap.get(lineId);
                map.remove(thisStopArray);
                lineSpotMap.remove(lineId);
            }
            ;
            lineSpotMap.put(lineId, spotArray);
            $.each(dataArr, function (index, item) {
                // index是索引值（即下标） ? item是每次遍历得到的值；
                if (item == undefined) {
                    dataArr.splice(index, 1);
                }
            });
        }
        var c = 1;
        var lineSectionArray = [];
        if (lineSegment.length != 0) {
            if (lineSegment.length != 0) {
                c = 0;
            }
            ;
            var segment = [];
            for (var i = 0; i < lineSegment.length; i++) {
                var segmentE = new Array();
                var segmentLon = lineSegment[i].longitude.split(",")
                var segmentLat = lineSegment[i].latitude.split(",")
                for (var j = 0; j < segmentLon.length; j++) {
                    segmentE[j] = [Number(segmentLon[j]), Number(segmentLat[j])]
                }
                segment.push(segmentE)
            }
            ;
            if (sectionPointMarkerMap.containsKey(lineId)) {
                var sectionPointMarkerMapValue = sectionPointMarkerMap.get(lineId);
                for (var t = 0; t < sectionPointMarkerMapValue.length; t++) {
                    sectionPointMarkerMapValue[t].hide();
                }
                ;
                sectionPointMarkerMap.remove(lineId);
            }
            ;
            var createSectionMarkerValue = [];
            for (var i = 0; i < segment.length; i++) {
                if (segment[i].length > 1) {
                    var pointLatLng = segment[i][segment[i].length - 1];
                    var num = '<p class="sectionPointIcon">' + (i + 1) + '</p>';
                    var sectionMarker = new AMap.Marker({
                        icon: "../../resources/img/sectionPoint.png",
                        position: pointLatLng,
                        content: num,
                        offset: new AMap.Pixel(-10, -25)
                    });
                    sectionMarker.setMap(map);
                    createSectionMarkerValue.push(sectionMarker);
                    if (lineSegment[i].maximumSpeed >= 0 && lineSegment[i].maximumSpeed <= 40) {
                        var polyFencec = new AMap.Polyline({
                            path: segment[i], //设置线覆盖物路径
                            strokeColor: "#66CD00", //线颜色
                            strokeOpacity: 1, //线透明度
                            strokeWeight: 5, //线宽
                            strokeStyle: "dashed", //线样式
                            strokeDasharray: [10, 5]
                            //补充线样式
                        });
                        polyFencec.setMap(thisMap);
                        thisMap.setFitView(polyFencec);
                        lineSectionArray.push(polyFencec);
                    }
                    ;
                    if (lineSegment[i].maximumSpeed > 40 && lineSegment[i].maximumSpeed <= 80) {
                        var polyFencec = new AMap.Polyline({
                            path: segment[i], //设置线覆盖物路径
                            strokeColor: "#EEEE00", //线颜色
                            strokeOpacity: 1, //线透明度
                            strokeWeight: 5, //线宽
                            strokeStyle: "dashed", //线样式
                            strokeDasharray: [10, 5]
                            //补充线样式
                        });
                        polyFencec.setMap(thisMap);
                        thisMap.setFitView(polyFencec);
                        lineSectionArray.push(polyFencec);
                    }
                    if (lineSegment[i].maximumSpeed > 80 && lineSegment[i].maximumSpeed <= 100) {
                        var polyFencec = new AMap.Polyline({
                            path: segment[i], //设置线覆盖物路径
                            strokeColor: "#EE7600", //线颜色
                            strokeOpacity: 1, //线透明度
                            strokeWeight: 5, //线宽
                            strokeStyle: "dashed", //线样式
                            strokeDasharray: [10, 5]
                            //补充线样式
                        });
                        polyFencec.setMap(thisMap);
                        thisMap.setFitView(polyFencec);
                        lineSectionArray.push(polyFencec);
                    }
                    if (lineSegment[i].maximumSpeed > 100) {
                        var polyFencec = new AMap.Polyline({
                            path: segment[i], //设置线覆盖物路径
                            strokeColor: "#EE0000", //线颜色
                            strokeOpacity: 1, //线透明度
                            strokeWeight: 5, //线宽
                            strokeStyle: "dashed", //线样式
                            strokeDasharray: [10, 5]
                            //补充线样式
                        });
                        polyFencec.setMap(thisMap);
                        thisMap.setFitView(polyFencec);
                        lineSectionArray.push(polyFencec);
                    }
                }
                ;
            }
            ;
            sectionPointMarkerMap.put(lineId, createSectionMarkerValue);
            fenceIDMap.put(lineId, lineSectionArray);
        } else {
            var polyFencec = new AMap.Polyline({
                path: dataArr, //设置线覆盖物路径
                strokeColor: "#3366FF", //线颜色
                strokeOpacity: c, //线透明度
                strokeWeight: 5, //线宽
                strokeStyle: "solid", //线样式
                strokeDasharray: [10, 5],
                zIndex: 51
                //补充线样式
            });
            lineSectionArray.push(polyFencec);
            fenceIDMap.put(lineId, polyFencec);
            polyFencec.setMap(thisMap);
            thisMap.setFitView(polyFencec);
        }
        ;
        polyFence = lineSectionArray;
        if (isEdit) {
            for (var j = 0; j < polyFence.length; j++) {
                var polyFenceList = polyFence[j];
                //线单击
                polyFenceList.on('click', function (e) {
                    if (map.getZoom() >= 16) {
                        var clickLng = e.lnglat.getLng();
                        var clickLat = e.lnglat.getLat();
                        var clickLngLat = [clickLng, clickLat];
                        if (sectionMarkerPointArray.containsKey(lineId)) {
                            var sectionValue = sectionMarkerPointArray.get(lineId);
                            var value = sectionValue[0];
                            var valueArray = [];
                            for (var m = 0; m < value.length; m++) {
                                if (sectionValue[1] == false) {
                                    var index = lineAllPointArray.indexOf(value[m]);
                                    lineAllPointArray.splice(index, 1);
                                } else {
                                    valueArray.push(value[m]);
                                }
                                ;
                            }
                            ;
                            valueArray.push(clickLngLat);
                            sectionMarkerPointArray.remove(lineId);
                            sectionMarkerPointArray.put(lineId, [valueArray, true]);
                        } else {
                            sectionMarkerPointArray.put(lineId, [[clickLngLat], true]);
                        }
                        ;
                        layer.confirm(fenceOperationOperationSelect, {
                            btn: ['关键点', '分段', '取消'],
                            closeBtn: 0,
                            btn3: function () {
                                if (lineSegment.length == 0) {
                                    fenceOperation.sectionRateLimitingClose(lineId);
                                }
                                ;
                            },
                            id: 'lineClickOperation',
                            success: function (layero) {
                                var btn = layero.find('.layui-layer-btn').children('.layui-layer-btn1').css({
                                    'border-color': '#4898d5',
                                    'background-color': '#2e8ded',
                                    'color': '#ffffff',
                                });
                            },
                        }, function () {
                            layer.closeAll();
                            if (lineSegment.length == 0) {
                                fenceOperation.sectionRateLimitingClose(lineId);
                            }
                            ;
                            $("#marking-lng").val(clickLng);
                            $("#marking-lat").val(clickLat);
                            $("#lineIDs").val(lineId);
                            pageLayout.closeVideo();
                            $('#addMonitoringTag').modal('show');
                        }, function () {
                            if (lineSegment.length != 0) {
                                // layer.confirm("是否重置该线路的分段？", {btn : ["是", "否"]}, function () {
                                $("#lineId").val(lineId);
                                var url = "/clbs/m/functionconfig/fence/managefence/resetSegment"
                                json_ajax("POST", url, "json", false, {"lineId": lineId}, fenceOperation.resetSegment);
                                layer.closeAll();
                                //清除分段点标注
                                if (sectionPointMarkerMap.containsKey(lineId)) {
                                    var sectionPointMarkerMapValue = sectionPointMarkerMap.get(lineId);
                                    for (var t = 0; t < sectionPointMarkerMapValue.length; t++) {
                                        sectionPointMarkerMapValue[t].hide();
                                    }
                                    ;
                                    sectionPointMarkerMap.remove(lineId);
                                }
                                ;
                                if (fenceSectionPointMap.containsKey(lineId)) {
                                    fenceSectionPointMap.remove(lineId);
                                }
                                ;
                                //});
                            } else if (lineSegment.length == 0) {
                                //把分段点区域的所有经纬度按顺序存在集合
                                if (fenceSectionPointMap.containsKey(lineId)) {
                                    var sectionPointLatLng = [];//分段点经纬度集合
                                    var fenceSectionPointMapValue = fenceSectionPointMap.get(lineId);
                                    sectionPointLatLng.push(clickLngLat);
                                    //取出分段点经纬度存入
                                    for (var m = 0; m < fenceSectionPointMapValue.length; m++) {
                                        sectionPointLatLng.push(fenceSectionPointMapValue[m][fenceSectionPointMapValue[m].length - 1]);
                                    }
                                    ;
                                    //把点击的分段点经纬度加入路线经纬度集合中
                                    for (var i = 0, len = lineAllPointArray.length; i < len - 1; i++) {
                                        var twoPointDistance = new AMap.LngLat(lineAllPointArray[i][0], lineAllPointArray[i][1]).distance(lineAllPointArray[i + 1]);
                                        var clickPointDistance = new AMap.LngLat(lineAllPointArray[i][0], lineAllPointArray[i][1]).distance(clickLngLat) + new AMap.LngLat(lineAllPointArray[i + 1][0], lineAllPointArray[i + 1][1]).distance(clickLngLat);
                                        if (parseInt(twoPointDistance) == parseInt(clickPointDistance) || Math.abs(clickPointDistance - twoPointDistance) <= 3) {
                                            if (!(lineAllPointArray[i][0] == clickLngLat[0] && lineAllPointArray[i][1] == clickLngLat[1])) {
                                                lineAllPointArray.splice(i + 1, 0, clickLngLat);
                                                break;
                                            }
                                            ;
                                        }
                                        ;
                                    }
                                    ;
                                    fenceSectionPointMap.remove(lineId);
                                    var indexArray = [];
                                    //将各个分段点位置存入集合
                                    for (var n = 0; n < sectionPointLatLng.length; n++) {//循环分段点集合
                                        for (var s = 0, len = lineAllPointArray.length; s < len; s++) {//循环所有点
                                            if (lineAllPointArray[s][0] == sectionPointLatLng[n][0] && lineAllPointArray[s][1] == sectionPointLatLng[n][1]) {
                                                indexArray.push(s);
                                                continue;
                                            }
                                            ;
                                        }
                                        ;
                                    }
                                    ;
                                    var startIndex = 0;
                                    var sectionValue = [];
                                    //是否含有该ID标注,然后删除
                                    if (sectionPointMarkerMap.containsKey(lineId)) {
                                        var sectionPointMarkerMapValue = sectionPointMarkerMap.get(lineId);
                                        for (var t = 0; t < sectionPointMarkerMapValue.length; t++) {
                                            sectionPointMarkerMapValue[t].hide();
                                        }
                                        ;
                                        sectionPointMarkerMap.remove(lineId);
                                    }
                                    ;
                                    var markerPointMap = [];
                                    var indexSortArray = indexArray.sort(fenceOperation.sortNumber);
                                    for (var y = 0; y < indexSortArray.length; y++) {
                                        var end = Number(indexSortArray[y]);
                                        var section = lineAllPointArray.slice(startIndex, end + 1);
                                        startIndex = end;
                                        sectionValue.push(section);
                                        var pointLatLng = lineAllPointArray[indexSortArray[y]];
                                        var num = '<p class="sectionPointIcon">' + (y + 1) + '</p>';
                                        var sectionMarker = new AMap.Marker({
                                            icon: "../../resources/img/sectionPoint.png",
                                            position: pointLatLng,
                                            content: num,
                                            offset: new AMap.Pixel(-10, -25)
                                        });
                                        sectionMarker.setMap(map);
                                        markerPointMap.push(sectionMarker);
                                    }
                                    ;
                                    sectionPointMarkerMap.put(lineId, markerPointMap);
                                    fenceSectionPointMap.put(lineId, sectionValue);
                                } else {
                                    //第一次存值
                                    for (var i = 0, len = lineAllPointArray.length; i < len - 1; i++) {
                                        var twoPointDistance = new AMap.LngLat(lineAllPointArray[i][0], lineAllPointArray[i][1]).distance(lineAllPointArray[i + 1]);
                                        var clickPointDistance = new AMap.LngLat(lineAllPointArray[i][0], lineAllPointArray[i][1]).distance(clickLngLat) + new AMap.LngLat(lineAllPointArray[i + 1][0], lineAllPointArray[i + 1][1]).distance(clickLngLat);
                                        if (parseInt(twoPointDistance) == parseInt(clickPointDistance) || Math.abs(clickPointDistance - twoPointDistance) <= 3) {
                                            if (!(lineAllPointArray[i][0] == clickLngLat[0] && lineAllPointArray[i][1] == clickLngLat[1])) {
                                                lineAllPointArray.splice(i + 1, 0, clickLngLat);
                                                var sectionValue = [];
                                                var firstSection = lineAllPointArray.slice(0, i + 2);
                                                sectionValue.push(firstSection);
                                                var lastSection = lineAllPointArray.slice(i + 1, lineAllPointArray.length);
                                                sectionValue.push(lastSection);
                                                fenceSectionPointMap.put(lineId, sectionValue);
                                                break;
                                            } else {
                                                var firstSection = lineAllPointArray.slice(0, i + 1);
                                                sectionValue.push(firstSection);
                                                var lastSection = lineAllPointArray.slice(i + 1, lineAllPointArray.length);
                                                sectionValue.push(lastSection);
                                                fenceSectionPointMap.put(lineId, sectionValue);
                                            }
                                            ;
                                        }
                                        ;
                                    }
                                    ;
                                    //添加分段点图标
                                    var markerPointMap = [];
                                    for (var j = 0; j < 2; j++) {
                                        var num = '<p class="sectionPointIcon">' + (j + 1) + '</p>';
                                        var pointLatLng = [];
                                        if (j == 0) {
                                            pointLatLng = clickLngLat;
                                        } else {
                                            pointLatLng = lineAllPointArray[lineAllPointArray.length - 1];
                                        }
                                        ;
                                        var sectionMarker = new AMap.Marker({
                                            icon: "../../resources/img/sectionPoint.png",
                                            position: pointLatLng,
                                            content: num,
                                            offset: new AMap.Pixel(-10, -25)
                                        });
                                        sectionMarker.setMap(map);
                                        markerPointMap.push(sectionMarker);
                                    }
                                    ;
                                    sectionPointMarkerMap.put(lineId, markerPointMap);
                                }
                                ;
                                var routMap = [];
                                var sectionPointArray = fenceSectionPointMap.get(lineId);
                                for (var i = 0; i < sectionPointArray.length; i++) {
                                    var array = [];
                                    for (var j = 0; j < sectionPointArray[i].length; j++) {
                                        array.push(sectionPointArray[i][j][0] + ";" + sectionPointArray[i][j][1]);
                                    }
                                    ;
                                    routMap.push(array);
                                }
                                ;
                                layer.confirm(fenceOperationLineSubsection, {
                                    btn: ["完成", "继续分段"],
                                    closeBtn: 0
                                }, function () {
                                    $("#lineId").val(lineId);
                                    var value = lineId + "#zw_m_line";
                                    var width = fenceOperation.updateFence(value, true);
                                    var str = "";
                                    var strc = "";
                                    layer.closeAll();
                                    for (var i = 0; i < routMap.length; i++) {
                                        var hrefs = "#route" + (i + 1);
                                        var rids = "route" + (i + 1);
                                        var lineIDmsid = "#lineIDms" + (i + 1);
                                        var lineIDms = "lineIDms" + (i + 1);
                                        var sectionlng = "section-lng" + (i + 1);
                                        var sectionlat = "section-lat" + (i + 1);
                                        if (i == 0) {
                                            str += '<li class="active" id="TabFenceBox"><a href="#route1" data-toggle="tab">路段1</a></li>'
                                            strc += '<div class="tab-pane active" id="route1">'
                                            strc += '<div class="form-group hidden">'
                                            strc += '<input id="lineIDms1" name="lineId" value=""/>'
                                            strc += '<input id="sumn" name="sumn" value=""/>'
                                            strc += '<div class="col-md-3">'
                                            strc += '<input  id="section-lng1"   name="longitude" value=""/>'
                                            strc += '</div>'
                                            strc += '<div class="col-md-3" >'
                                            strc += '<input id="section-lat1"   name="latitude" value=""/>'
                                            strc += '</div>'
                                            strc += '</div>'
                                            strc += '<div class="form-group">'
                                            strc += '<label class="col-md-5 control-label"><label class="text-danger">*</label> 偏移量(m)：</label>'
                                            strc += '<div class=" col-md-5">'
                                            strc += '<input type="text" placeholder="请输入偏移量" value="' + width + '" onkeyup="value=value.replace(/[^0-9]/g,\'\') " class="form-control" id="sectionOffset' + i + '" name="offset"/>'
                                            strc += '</div>'
                                            strc += '</div>'
                                            strc += '<div class="form-group">'
                                            strc += '<label class="col-md-5 control-label">路段行驶过长阈值(s)：</label>'
                                            strc += '<div class=" col-md-5">'
                                            strc += '<input type="text" placeholder="请输入路段行驶过长阈值" value="0" class="form-control" id="sectionLongThreshold' + i + '" name="overlengthThreshold"/>'
                                            strc += '</div>'
                                            strc += '</div>'
                                            strc += '<div class="form-group">'
                                            strc += '<label class="col-md-5 control-label">路段行驶不足阈值(s)：</label>'
                                            strc += '<div class=" col-md-5">'
                                            strc += '<input type="text" placeholder="请输入路段行驶不足阈值" value="0" class="form-control" id="sectionInsufficientThreshold' + i + '" name="shortageThreshold"/>'
                                            strc += '</div>'
                                            strc += '</div>'
                                            strc += '<div class="form-group">'
                                            strc += '<label class="col-md-5 control-label">路段最高速度（km/h）：</label>'
                                            strc += '<div class=" col-md-5">'
                                            strc += '<input type="text" placeholder="请输入路段最高速度" value="0" class="form-control" id="maxSpeed' + i + '" name="maximumSpeed"/>'
                                            strc += '</div>'
                                            strc += '</div>'
                                            strc += '<div class="form-group">'
                                            strc += '<label class="col-md-5 control-label">超速持续时间（s）：</label>'
                                            strc += '<div class=" col-md-5">'
                                            strc += '<input type="text" placeholder="请输入超速持续时间" value="0" class="form-control" id="durationSpeeding' + i + '" name="overspeedTime"/>'
                                            strc += '</div>'
                                            strc += '</div>';
                                            strc += '<div class="isQueryShow"><label>拐点数据 <span class="fa fa-chevron-up" aria-hidden="true"></span></label></div>';
                                            strc += '<div class="pointList">';
                                            for (var t = 0; t < routMap[i].length - 1; t++) {
                                                var routMapArray = routMap[i][t].split(';');
                                                var num = i + '' + t;
                                                strc += '<div class="form-group sectionLngLat">'
                                                strc += '<label class="col-md-2 control-label">经度：</label>'
                                                strc += '<div class="col-md-3 sectionLng">'
                                                strc += '<input type="text" id="piecewiseLng' + num + '" name="lng" placeholder="请输入经度值" value="' + routMapArray[0] + '" class="form-control" />'
                                                strc += '</div>'
                                                strc += '<label class="col-md-2 control-label">纬度：</label>'
                                                strc += '<div class="col-md-3 sectionLat">'
                                                strc += '<input type="text" id="piecewiseLat' + num + '" name="lat" placeholder="请输入纬度值" value="' + routMapArray[1] + '" class="form-control" />'
                                                strc += '</div>'
                                                if (t == 0) {
                                                    strc += '<button type="button" class="btn btn-primary addLngLat">'
                                                    strc += '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>'
                                                    strc += '</button>'
                                                } else {
                                                    strc += '<button type="button" class="btn btn-danger removeLngLat">'
                                                    strc += '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>'
                                                    strc += '</button>'
                                                }
                                                ;
                                                strc += '</div>'
                                            }
                                            ;
                                            strc += '</div>';
                                            strc += '</div>';
                                        } else {
                                            str += '<li id="TabFenceBox"><a href="' + hrefs + '" + data-toggle="tab">路段' + (i + 1) + '</a></li>'
                                            strc += '<div class="tab-pane" id="' + rids + '">'
                                            strc += '<div class="form-group hidden">'
                                            strc += '<div class="col-md-3">'
                                            strc += '<input  id="' + sectionlng + '"    name="longitude" value=""/>'
                                            strc += '</div>'
                                            strc += '<div class="col-md-3" >'
                                            strc += '<input id="' + sectionlat + '"   name="latitude" value=""/>'
                                            strc += '</div>'
                                            strc += '</div>'
                                            strc += '<div class="form-group">'
                                            strc += '<label class="col-md-5 control-label"><label class="text-danger">*</label> 偏移量(m)：</label>'
                                            strc += '<div class=" col-md-5">'
                                            strc += '<input type="text" placeholder="请输入偏移量" value="' + width + '" onkeyup="value=value.replace(/[^0-9]/g,\'\') " class="form-control" id="sectionOffset' + i + '" name="offset"/>'
                                            strc += '</div>'
                                            strc += '</div>'
                                            strc += '<div class="form-group">'
                                            strc += '<label class="col-md-5 control-label">  路段行驶过长阈值(s)：</label>'
                                            strc += '<div class=" col-md-5">'
                                            strc += '<input type="text" placeholder="请输入路段行驶过长阈值" value="0" class="form-control" id="sectionLongThreshold' + i + '" name="overlengthThreshold"/>'
                                            strc += '</div>'
                                            strc += '</div>'
                                            strc += '<div class="form-group">'
                                            strc += '<label class="col-md-5 control-label">路段行驶不足阈值(s)：</label>'
                                            strc += '<div class=" col-md-5">'
                                            strc += '<input type="text" placeholder="请输入路段行驶不足阈值" value="0" class="form-control" id="sectionInsufficientThreshold' + i + '" name="shortageThreshold"/>'
                                            strc += '</div>'
                                            strc += '</div>'
                                            strc += '<div class="form-group">'
                                            strc += '<label class="col-md-5 control-label">路段最高速度（km/h）：</label>'
                                            strc += '<div class=" col-md-5">'
                                            strc += '<input type="text" placeholder="请输入路段最高速度" value="0" class="form-control" id="maxSpeed' + i + '" name="maximumSpeed"/>'
                                            strc += '</div>'
                                            strc += '</div>'
                                            strc += '<div class="form-group">'
                                            strc += '<label class="col-md-5 control-label">超速持续时间（s）：</label>'
                                            strc += '<div class=" col-md-5">'
                                            strc += '<input type="text" placeholder="请输入超速持续时间" value="0" class="form-control" id="durationSpeeding' + i + '" name="overspeedTime"/>'
                                            strc += '</div>'
                                            strc += '</div>';
                                            strc += '<div class="isQueryShow"><label>拐点数据 <span class="fa fa-chevron-up" aria-hidden="true"></span></label></div>';
                                            strc += '<div class="pointList">';
                                            if (i == routMap.length - 1) {
                                                for (var t = 0; t < routMap[i].length; t++) {
                                                    var routMapArray = routMap[i][t].split(';');
                                                    var num = i + '' + t;
                                                    strc += '<div class="form-group sectionLngLat">'
                                                    strc += '<label class="col-md-2 control-label">经度：</label>'
                                                    strc += '<div class="col-md-3 sectionLng">'
                                                    strc += '<input type="text" id="piecewiseLng' + num + '" name="lng" placeholder="请输入经度值" value="' + routMapArray[0] + '" class="form-control" />'
                                                    strc += '</div>'
                                                    strc += '<label class="col-md-2 control-label">纬度：</label>'
                                                    strc += '<div class="col-md-3 sectionLat">'
                                                    strc += '<input type="text" id="piecewiseLat' + num + '" name="lat" placeholder="请输入纬度值" value="' + routMapArray[1] + '" class="form-control" />'
                                                    strc += '</div>'
                                                    if (t == 0) {
                                                        strc += '<button type="button" class="btn btn-primary addLngLat">'
                                                        strc += '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>'
                                                        strc += '</button>'
                                                    } else {
                                                        strc += '<button type="button" class="btn btn-danger removeLngLat">'
                                                        strc += '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>'
                                                        strc += '</button>'
                                                    }
                                                    ;
                                                    strc += '</div>'
                                                }
                                                ;
                                            } else {
                                                for (var t = 0; t < routMap[i].length - 1; t++) {
                                                    var routMapArray = routMap[i][t].split(';');
                                                    strc += '<div class="form-group sectionLngLat">'
                                                    strc += '<label class="col-md-2 control-label">经度：</label>'
                                                    strc += '<div class="col-md-3 sectionLng">'
                                                    strc += '<input type="number" type="number" min="73.66" max="135.05" name="lng" placeholder="请输入经度值" value="' + routMapArray[0] + '" class="form-control" />'
                                                    strc += '</div>'
                                                    strc += '<label class="col-md-2 control-label">纬度：</label>'
                                                    strc += '<div class="col-md-3 sectionLat">'
                                                    strc += '<input type="number" min="3.86" max="53.55" name="lat" placeholder="请输入纬度值" value="' + routMapArray[1] + '" class="form-control" />'
                                                    strc += '</div>'
                                                    if (t == 0) {
                                                        strc += '<button type="button" class="btn btn-primary addLngLat">'
                                                        strc += '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>'
                                                        strc += '</button>'
                                                    } else {
                                                        strc += '<button type="button" class="btn btn-danger removeLngLat">'
                                                        strc += '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>'
                                                        strc += '</button>'
                                                    }
                                                    ;
                                                    strc += '</div>'
                                                }
                                                ;
                                            }
                                            ;
                                            strc += '</div>';
                                            strc += '</div>';
                                        }
                                    }
                                    $("#tenples").html(str);
                                    $("#pagecontent").html(strc);
                                    $(".addLngLat").unbind("click").bind("click", fenceOperation.addLngLat);
                                    $(".removeLngLat").unbind("click").bind("click", fenceOperation.removeLngLat);
                                    $(".isQueryShow").unbind("click").bind("click", fenceOperation.isQueryShow);
                                    $("#lineIDms1").attr("value", lineId);
                                    $("#sumn").attr("value", routMap.length);
                                    for (var i = 0; i < routMap.length; i++) {
                                        var sectionlng = "section-lng" + (i + 1);
                                        $("#" + sectionlng).attr("value", routMap[i] + "]");
                                    }
                                    pageLayout.closeVideo();
                                    $('#addMonitoringSection').modal('show');
                                }, function () {
                                });
                            }
                        });
                    } else {
                        thisMap.setZoomAndCenter(16, [e.lnglat.getLng(), e.lnglat.getLat()]);
                    }
                    ;
                });
            }
            ;
        }
    },
    //删除关键点
    deleteKeyPoint: function (id) {
        infoWindow.close();
        var url = "/clbs/m/functionconfig/fence/bindfence/deleteKeyPoint";
        json_ajax("post", url, "json", false, {"kid": id}, fenceOperation.deleteKeyPointCallBack)
    },
    // 删除关键点更新围栏
    deleteKeyPointCallBack: function (data) {
        if (data.success == true) {
            fenceOperation.resetFance();
        } else {
            if (data.msg.toString().indexOf("系统错误") > -1) {
                layer.msg(data.msg, {move: false});
            }
        }
    },
    //重置返回
    resetSegment: function (data) {
        if (data.success) {
            fenceOperation.resetFance()
        } else {
            if (data.msg.toString().indexOf("系统错误") > -1) {
                layer.msg(data.msg, {move: false});
            }
        }
    },
    //新增修改成功重置围栏
    resetFance: function () {
        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
        var lineFenceId = $("#lineId").val();
        var nodes = zTree.getNodesByParam('id', lineFenceId, null);
        // ajax访问后端查询
        layer.load(2);
        $.ajax({
            type: "POST",
            url: "/clbs/m/functionconfig/fence/bindfence/getFenceDetails",
            async: false,
            data: {
                "fenceNodes": JSON.stringify(nodes)
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
                        for (var i = 0; i < dataList.length; i++) {
                            var fenceType = dataList[i].fenceType;
                            var fenceData = dataList[i].fenceData;
                            var lineSpot = dataList[i].lineSpot;
                            var lineSegment = dataList[i].lineSegment == undefined ? [] : dataList[i].lineSegment;
                            if (fenceType == "zw_m_marker") { // 标注
                                fenceOperation.drawMark(fenceData, map);
                            } else if (fenceType == "zw_m_line") { // 线
                                fenceOperation.drawLine(fenceData, lineSpot, lineSegment, map);
                            } else if (fenceType == "zw_m_rectangle") { // 矩形
                                fenceOperation.drawRectangle(fenceData, map);
                            } else if (fenceType == "zw_m_polygon") { // 多边形
                                fenceOperation.drawPolygon(fenceData, map);
                            } else if (fenceType == "zw_m_circle") { // 圆形
                                fenceOperation.drawCircle(fenceData, map);
                            }
                        }
                    }
                }
            }
        });
    },
    //矩形
    drawRectangle: function (rectangle, thisMap) {
        $("#LUPointLngLat").val(rectangle.leftLongitude + "," + rectangle.leftLatitude);
        $("#RDPointLngLat").val(rectangle.rightLongitude + "," + rectangle.rightLatitude);
        var rectangleId = rectangle.id;
        if (fenceIDMap.containsKey(rectangleId)) {
            var thisFence = fenceIDMap.get(rectangleId);
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
            fenceIDMap.put(rectangleId, polyFence);
        }
        ;
    },
    //多边形
    drawPolygon: function (polygon, thisMap) {
        var polygonId = polygon[0].polygonId;
        if (fenceIDMap.containsKey(polygonId)) {
            var thisFence = fenceIDMap.get(polygonId);
            thisFence.hide();
            fenceIDMap.remove(polygonId);
        }
        ;
        if (PolyEditorMap.containsKey(polygonId)) {
            var mapEditFence = PolyEditorMap.get(polygonId);
            mapEditFence.close();
        }
        ;
        map.off("rightclick", amendPolygon);
        var dataArr = new Array();
        if (polygon != null && polygon.length > 0) {
            for (var i = 0; i < polygon.length; i++) {
                dataArr.push([polygon[i].longitude, polygon[i].latitude]);
            }
        }
        ;
        var html = '';
        for (var i = 0; i < dataArr.length; i++) {
            html += '<div class="form-group">'
                + '<label class="col-md-3 control-label">顶点' + (i + 1) + '经纬度：</label>'
                + '<div class=" col-md-8">'
                + '<input type="text" placeholder="请输入顶点经纬度" value="' + dataArr[i][0] + "," + dataArr[i][1] + '" class="form-control rectangleAllPointLngLat"/>'
                + '</div>'
                + '</div>'
        }
        ;
        $("#rectangleAllPointShow").html(html);
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
        fenceIDMap.put(polygonId, polyFence);
    },
    //圆形
    drawCircle: function (circle, thisMap) {
        var circleId = circle.id;
        if (fenceIDMap.containsKey(circleId)) {
            var thisFence = fenceIDMap.get(circleId);
            thisFence.hide();
            fenceIDMap.remove(circleId);
        }
        ;
        if (PolyEditorMap.containsKey(circleId)) {
            var mapEditFence = PolyEditorMap.get(circleId);
            mapEditFence.close();
        }
        ;
        map.off("rightclick", amendCircle);
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
        fenceIDMap.put(circleId, polyFence);
    },
    // 树结构  围栏类型旁新增按钮
    addHoverDom: function (treeId, treeNode) {
        // 树节点的类型
        var nodeType = treeNode.type;
        // 权限
        var permissionValue = $('#permission').val();

        if (nodeType != null && nodeType != undefined && nodeType != "" && nodeType == "fenceParent") {
            var sObj = $("#" + treeNode.tId + "_span");
            var theImport = $("#" + treeNode.tId + "_span");
            if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0)
                return;
            var id = (100 + newCount);
            var pid = treeNode.id;
            var addStr = "<span class='button add' id='addBtn_"
                + treeNode.tId
                + "' title='增加'></span>";
            var tImport;
            if (pid == "zw_m_line") {
                tImport = "<a class='button import' id='import_" + treeNode.tId + "' href='/clbs/v/monitoring/import?pid=" + pid + "' data-toggle='modal' data-target='#commonSmWin' title='导入'></a>";
            } else if (pid == "zw_m_polygon") {
                tImport = "<a class='button import' id='import_" + treeNode.tId + "' href='/clbs/v/monitoring/import?pid=" + pid + "' data-toggle='modal' data-target='#commonSmWin' title='导入'></a>";
            }
            // 判断是否有可写权限
            if (permissionValue == "true") {
                theImport.after(tImport);
                sObj.after(addStr);
            }
            var btn = $("#addBtn_" + treeNode.tId);
            if (btn)
                btn.bind("click", function () {
                    mouseToolEdit.close(true);
                    amapOperation.clearLabel();
                    isAddDragRoute = false;
                    $('#drivenRoute').hide();
                    $('.lngLat_show').children('span').attr('class', 'fa fa-chevron-up');
                    $('.pointList').hide();
                    $(".fenceA i").removeClass("active");
                    $(".fenceA span").css('color', '#5c5e62');
                    isAddFlag = true;
                    isAreaSearchFlag = false;
                    if (treeNode.name == "标注") {
                        layer.msg('请在地图上点出标注点', {time: 1000});
                        fenceOperation.clearMapMarker();
                        mouseTool.marker({offset: new AMap.Pixel(-9, -23)});
                    } else if (treeNode.name == "路线") {
                        layer.msg('请在地图上画出路线', {time: 1000});
                        isDistanceCount = false;
                        fenceOperation.clearLine();
                        mouseTool.polyline();
                    } else if (treeNode.name == "矩形") {
                        layer.msg('请在地图上画出矩形', {time: 1000});
                        fenceOperation.clearRectangle();
                        mouseTool.rectangle();
                        clickRectangleFlag = true;
                    } else if (treeNode.name == "圆形") {
                        layer.msg('请在地图上画出圆形', {time: 1000});
                        fenceOperation.clearCircle();
                        mouseTool.circle();
                    } else if (treeNode.name == "多边形") {
                        layer.msg('请在地图上画出多边形', {time: 1000});
                        fenceOperation.clearPolygon();
                        mouseTool.polygon();
                        clickRectangleFlag = false;
                    } else if (treeNode.name == '导航路线') {
                        $('#drivenRoute').show();
                        fenceOperation.addItem();
                    } else if (treeNode.name == '行政区划') {
                        $("#administrationName").val("");
                        $("#administrationDistrict").val("");
                        $('#province').val('--请选择--');
                        document.getElementById('city').innerHTML = '';
                        document.getElementById('district').innerHTML = '';
                        pageLayout.closeVideo();
                        $('#administrativeArea').modal('show');
                    }
                    ;
                    return false;
                });
        } else if (nodeType != null && nodeType != undefined && nodeType != "" && nodeType == "fence") {
            var sEdit = $("#" + treeNode.tId + "_span");
            var sDetails = $("#" + treeNode.tId + "_span");
            var deleteList = $("#" + treeNode.tId + "_span");
            var sBind = $("#" + treeNode.tId + "_span");
            if (treeNode.editNameFlag || $("#editBtn_" + treeNode.tId).length > 0)
                return;
            var detailsStr = "<span class='button binds' id='detailsBtn_"
                + treeNode.tId
                + "' title='详情'></span>";
            var bindStr = "<span class='button details' id='bindBtn_"
                + treeNode.tId
                + "' title='绑定'></span>";
            var editStr = '';
            if (treeNode.pId != "zw_m_administration") {
                editStr = "<span class='button edit' id='editBtn_"
                    + treeNode.tId
                    + "' title='修改' ></span>";
            } else {
                editStr = "<span id='editBtn_"
                    + treeNode.tId
                    + "' title='修改' ></span>";
            }
            var deleteStr = "<span class='button remove' id='deleteBtn_"
                + treeNode.tId
                + "' title='删除' ></span>";
            // 判断是否有可写权限
            if (permissionValue == "true") {
                deleteList.after(deleteStr);
                sDetails.after(detailsStr);
                sEdit.after(editStr);
                sBind.after(bindStr);
            }
            var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
            var editBtn = $("#editBtn_" + treeNode.tId);
            if (editBtn) {
                editBtn.bind("click", function () {
                    amapOperation.clearLabel();
                    //关闭其它围栏修改功能
                    fenceOperation.closeFenceEdit();
                    isAddDragRoute = false;
                    $('#drivenRoute').hide();
                    $('.lngLat_show').children('span').attr('class', 'fa fa-chevron-up');
                    $('.pointList').hide();
                    mouseToolEdit.close(true);
                    isEdit = false;
                    isAddFlag = false;
                    isAreaSearchFlag = false;
                    var value = treeNode.id + "#" + treeNode.pId;
                    zTree.checkNode(treeNode, true, true);
                    treeNode.checkedOld = true;
                    fenceOperation.updateFence(value);
                    return false;
                });
            }
            ;
            var bindBtn = $("#bindBtn_" + treeNode.tId);
            if (bindBtn) {
                bindBtn.bind("click", function () {
                    isAddDragRoute = false;
                    $('#drivenRoute').hide();
                    trid = [];
                    fenceOperation.fenceBind(treeNode.pId, treeNode.name, treeNode.fenceInfoId,treeNode.id);
                    return false;
                });
            }
            ;
            var deleteBtn = $("#deleteBtn_" + treeNode.tId);
            if (deleteBtn) {
                deleteBtn.bind("click", function () {
                    //fenceOperation.hideFence(treeNode.id);
                    isAddDragRoute = false;
                    $('#drivenRoute').hide();
                    infoWindow.close();
                    fenceOperation.deleteFence(treeNode);
                    //fenceOperation.fenceHidden(treeNode.id);

                    return false;
                });
            }
            ;
            var detailsBtn = $("#detailsBtn_" + treeNode.tId);
            if (detailsBtn) {
                detailsBtn.bind("click", function () {
                    isAddDragRoute = false;
                    $('#drivenRoute').hide();
                    $("#detailsFenceName").text(treeNode.name);
                    var value = treeNode.id + "#" + treeNode.pId + "#" + true;
                    fenceOperation.updateFence(value);
                    pageLayout.closeVideo();
                    $("#detailsModel").modal('show');
                    return false;
                })
            }
            ;
        }
    },
    // 删除电子围栏按钮
    removeHoverDom: function (treeId, treeNode) {
        // 树节点的类型
        var nodeType = treeNode.type;
        if (nodeType != null && nodeType != undefined && nodeType != "" && nodeType == "fenceParent") {
            $("#addBtn_" + treeNode.tId).unbind().remove();
            $("#import_" + treeNode.tId).unbind().remove();
        } else if (nodeType != null && nodeType != undefined && nodeType != "" && nodeType == "fence") {
            $("#editBtn_" + treeNode.tId).unbind().remove();
            $("#detailsBtn_" + treeNode.tId).unbind().remove();
            $("#bindBtn_" + treeNode.tId).unbind().remove();
            $("#deleteBtn_" + treeNode.tId).unbind().remove();
        }
    },
    //关键点
    doSubmits1: function () {
        if (fenceOperation.validate_key()) {
            $("#monitoringTag").ajaxSubmit(function (data) {
                data = JSON.parse(data);
                if (data.success) {
                    $("#addMonitoringTag").modal("hide");
                    $("#monitoringTag").clearForm();
                    fenceOperation.resetFance();
                } else {
                    layer.msg(data.msg, {move: false});
                }
            });
        }
    },
    //分段监控
    doSubmitsMonitor: function () {
        fenceOperation.sectionRateLimitLngLat();
        fenceOperation.sectionThreadSave();
        if (fenceOperation.validate_Monitor()) {
            $("#monitoringSection").ajaxSubmit(function (data) {
                data = JSON.parse(data);
                if (data.success) {
                    $("#addMonitoringSection").modal("hide");
                    $("#monitoringSection").clearForm();
                    fenceOperation.resetFance();
                } else {
                    layer.msg(data.msg, {move: false});
                }
            });
        }
        ;
    },
    //分段限速提交前将修改后的经纬度塞值
    sectionRateLimitLngLat: function () {
        var thisLineID = $("#lineId").val();
        fenceOperation.clearLine();
        $("#lineId").val(thisLineID);
        var tableLength = $("#tenples li").length;
        var lineLng = '';
        var lineLat = '';
        var index = -1;
        var indexValue = '';
        for (var i = 0; i < tableLength; i++) {
            var id = 'route' + (i + 1);
            var listLength = $("#" + id).children('div.pointList').children('div.sectionLngLat').length;
            var value = '';
            if (i < tableLength - 1) {
                for (var y = 0; y < listLength; y++) {
                    var getLng = $("#" + id).children('div.pointList').children('div.sectionLngLat:eq(' + y + ')').children('.sectionLng').children('input');
                    var lng = getLng.val() == '' ? getLng.attr('value') : getLng.val();
                    var getLat = $("#" + id).children('div.pointList').children('div.sectionLngLat:eq(' + y + ')').children('.sectionLat').children('input')
                    var lat = getLat.val() == '' ? getLat.attr('value') : getLat.val();
                    if (lng != '' && lat != '') {
                        lineLng += lng + ",";
                        lineLat += lat + ",";
                        index++;
                        indexValue += index + ",";
                        value += lng + ";" + lat + ",";
                    }
                    ;
                }
                ;
                var nextID = 'route' + (i + 2);
                var nextLngID = $("#" + nextID).children('div.pointList').children('div.sectionLngLat:eq(0)').children('.sectionLng').children('input');
                var nextLng = nextLngID.val() == '' ? nextLngID.attr('value') : nextLngID.val();
                var nextLatID = $("#" + nextID).children('div.pointList').children('div.sectionLngLat:eq(0)').children('.sectionLat').children('input');
                var nextLat = nextLatID.val() == '' ? nextLatID.attr('value') : nextLatID.val();
                if (nextLng != '' && nextLat != '') {
                    value += nextLng + ";" + nextLat + "]";
                }
                ;
                var section = 'section-lng' + (i + 1);
                $("#" + section).attr('value', value);
            } else {
                for (var y = 0; y < listLength; y++) {
                    var getLng = $("#" + id).children('div.pointList').children('div.sectionLngLat:eq(' + y + ')').children('.sectionLng').children('input');
                    var lng = getLng.val() == '' ? getLng.attr('value') : getLng.val();
                    var getLat = $("#" + id).children('div.pointList').children('div.sectionLngLat:eq(' + y + ')').children('.sectionLat').children('input')
                    var lat = getLat.val() == '' ? getLat.attr('value') : getLat.val();
                    if (y != listLength - 1) {
                        if (lng != '' && lat != '') {
                            lineLng += lng + ",";
                            lineLat += lat + ",";
                            index++;
                            indexValue += index + ",";
                            value += lng + ";" + lat + ",";
                        }
                        ;
                    } else {
                        if (lng != '' && lat != '') {
                            lineLng += lng + ",";
                            lineLat += lat + ",";
                            index++;
                            indexValue += index + ",";
                            value += lng + ";" + lat + "]";
                        }
                        ;
                    }
                    ;
                }
                ;
                var section = 'section-lng' + (i + 1);
                $("#" + section).attr('value', value);
            }
            ;
        }
        ;
        lineLng = lineLng.substring(0, lineLng.length - 1);
        lineLat = lineLat.substring(0, lineLat.length - 1);
        indexValue = indexValue.substring(0, indexValue.length - 1);
        $("#pointSeqs").val(indexValue);
        $("#longitudes").val(lineLng);
        $("#latitudes").val(lineLat);
        fenceOperation.editLngLat();
    },
    //分段限速修改后的经纬度提交
    editLngLat: function () {
        var thisId = $("#lineId").val();
        $("#addOrUpdateLineFlag").val("1");
        var thisData = thisId + "#" + "zw_m_line";
        var thisParams = {"fenceIdShape": thisData};
        var url = "/clbs/m/functionconfig/fence/managefence/previewFence";
        ajax_submit("POST", url, "json", false, thisParams, true, fenceOperation.editCallBack);
    },
    editCallBack: function (data) {
        if (data.success) {
            var datalist = data.obj[0];
            var text = datalist.line.description;
            var type = datalist.line.type;
            var width = datalist.line.width;
            var name = datalist.line.name;
            $("#lineWidth1").val(width);
            $("#lineDescription1").val(text);
            $("#lineType1").val(type);
            $("#lineName1").val(name);
        } else {
            layer.msg(data.msg, {move: false});
        }
    },
    //关键点验证
    validate_key: function () {
        return $("#monitoringTag").validate({
            rules: {
                name: {
                    required: true,
                    maxlength: 20
                },
                arriveTime: {
                    required: true
                },
                leaveTime: {
                    required: true,
                    compareDate: "#arriveTime"
                },
                description: {
                    maxlength: 100
                }
            },
            messages: {
                name: {
                    required: fenceOperationPointNameNull,
                    maxlength: publicSize20
                },
                arriveTime: {
                    required: fenceOperationArriveTimeSelect,
                },
                leaveTime: {
                    required: fenceOperationLeaveTimeSelect,
                    compareDate: fenceOperationAlTimeCheck
                },
                description: {
                    maxlength: publicSize100
                }
            }
        }).form();
    },
    //路段验证
    validate_Monitor: function () {
        return $("#monitoringSection").validate({
            ignore: '',
            rules: {
                offset: {
                    required: true,
                    range: [0, 255],
                },
                overlengthThreshold: {
                    required: false,
                    range: [0, 65535],
                    digits:true
                },
                shortageThreshold: {
                    required: false,
                    range: [0, 65535],
                    digits:true
                },
                maximumSpeed: {
                    required: true,
                    range: [0, 65535],
                },
                overspeedTime: {
                    required: true,
                    range: [0, 65535],
                    digits:true
                },
                lng: {
                    required: true,
                    range: [73.66, 135.05],
                },
                lat: {
                    required: true,
                    range: [3.86, 53.55],
                },
            },
            messages: {
                offset: {
                    required: fenceOperationOffsetNull,
                    maxlength: fenceOperationScope255
                },
                overlengthThreshold: {
                    required: fenceOperationOverLength,
                    range: fenceOperationScope65535,
                    digits: requiredInt
                },
                shortageThreshold: {
                    required: fenceOperationTooShort,
                    range: fenceOperationScope65535,
                    digits: requiredInt
                },
                maximumSpeed: {
                    required: fenceOperationMaxSpeed,
                    range: fenceOperationScope65535,
                },
                overspeedTime: {
                    required: fenceOperationOverSpeedTime,
                    range: fenceOperationScope65535,
                    digits: requiredInt
                },
                lng: {
                    required: fenceOperationLongitudeNull,
                    range: fenceOperationLongitudeScope,
                },
                lat: {
                    required: fenceOperationLatitudeNull,
                    range: fenceOperationLatitudeScope,
                },
            }
        }).form();
    },
    //图形画完回调事件
    createSuccess: function (data) {
        //区域查车成功后
        if ($("#queryClick i").hasClass("active")) {
            changeArray = data.obj.getBounds();
            var url = "/clbs/v/monitoring/regionalQuery";
            ajax_submit("POST", url, "json", true, null, true, fenceOperation.regionalQuery);
        }
        ;
        //标注
        if (data.obj.CLASS_NAME == "AMap.Marker") {
            $("#addOrUpdateMarkerFlag").val("0");
            var marker = data.obj.getPosition();
            $("#mark-lng").attr("value", marker.lng);
            $("#mark-lat").attr("value", marker.lat);
            pageLayout.closeVideo();
            $("#mark").modal('show');
        }
        ;
        //圆
        if (data.obj.CLASS_NAME == "AMap.Circle") {
            $("#addOrUpdateCircleFlag").val("0");
            var center = data.obj.getCenter();
            var radius = data.obj.getRadius();
            $("#circle-lng").attr("value", center.lng);
            $("#circle-lat").attr("value", center.lat);
            $("#circle-radius").attr("value", radius);
            $("#editCircleLng").val(center.lng);
            $("#editCircleLat").val(center.lat);
            $("#editCircleRadius").val(radius);
            pageLayout.closeVideo();
            $("#circleArea").modal('show');
        }
        ;
        if (data.obj.CLASS_NAME == "AMap.Polyline" || data.obj.CLASS_NAME == "AMap.Polygon") {
            var pointSeqs = ""; // 点序号
            var longitudes = ""; // 所有的经度
            var latitudes = ""; // 所有的纬度
            var array = new Array();
            var path = data.obj.getPath();
            for (var i = 0; i < path.length; i++) {
                array.push([path[i].lng, path[i].lat]);
            }
            ;
            // 去除array中相邻的重复点
            array = fenceOperation.removeAdjoinRepeatPoint(array);
            var fileinfo = "";
            for (var i = 0; i < array.length; i++) {
                fileinfo += '<tr>';
                fileinfo += '<td>' + i + '</td>';
                fileinfo += '<td>' + 'aa' + '</td>';
                fileinfo += '<td>' + 'bb' + '</td>';
                fileinfo += '</tr>';
            }
            ;
            $('#tal').html(fileinfo);
            //矩形判断
            for (var i = 0; i < array.length; i++) {
                $("#table-lng-lat tbody tr:nth-child(" + parseInt(i + 1) + ")").children("td:nth-child(2)").text(array[i][0]);
                $("#table-lng-lat tbody tr:nth-child(" + parseInt(i + 1) + ")").children("td:nth-child(3)").text(array[i][1]);
                pointSeqs += i + ","; // 点序号
                longitudes += array[i][0] + ","; // 把所有的经度组合到一起
                latitudes += array[i][1] + ","; // 把所有的纬度组合到一起
            }
            // 去掉点序号、经度、纬度最后的一个逗号
            if (pointSeqs.length > 0) {
                pointSeqs = pointSeqs.substr(0, pointSeqs.length - 1);
            }
            if (longitudes.length > 0) {
                longitudes = longitudes.substr(0, longitudes.length - 1);
            }
            if (latitudes.length > 0) {
                latitudes = latitudes.substr(0, latitudes.length - 1);
            }
            $("#pointSeqs").val(pointSeqs);
            $("#longitudes").val(longitudes);
            $("#latitudes").val(latitudes);
            $("#pointSeqsRectangles").val(pointSeqs);
            $("#longitudesRectangles").val(longitudes);
            $("#latitudesRectangles").val(latitudes);
            $("#pointSeqsPolygons").val(pointSeqs);
            $("#longitudesPolygons").val(longitudes);
            $("#latitudesPolygons").val(latitudes);
            //线
            if (data.obj.CLASS_NAME == "AMap.Polyline" && !isDistanceCount) {
                $("#addOrUpdateLineFlag").val("0");
                pageLayout.closeVideo();
                $("#addLine").modal('show');
            }
            ;
            //矩形
            if (data.obj.CLASS_NAME == "AMap.Polygon" && clickRectangleFlag && isAddFlag) {
                if (!isAreaSearchFlag) {
                    if (array.length < 4) {
                        return false;
                    } else {
                        $("#LUPointLngLat").val(array[0][0] + "," + array[0][1]);
                        $("#RDPointLngLat").val(array[2][0] + "," + array[2][1]);
                        $("#addOrUpdateRectangleFlag").val("0");
                        pageLayout.closeVideo();
                        $("#rectangle-form").modal('show');
                    }
                }
                ;
            }
            ;
            //多边形
            if (data.obj.CLASS_NAME == "AMap.Polygon" && !clickRectangleFlag && isAddFlag) {
                if (!$("#queryClick i").hasClass("active")) {
                    var html = '';
                    for (var i = 0; i < array.length; i++) {
                        html += '<div class="form-group">'
                            + '<label class="col-md-3 control-label">顶点' + (i + 1) + '经纬度：</label>'
                            + '<div class=" col-md-8">'
                            + '<input type="text" placeholder="请输入顶点经纬度" value="' + array[i][0] + "," + array[i][1] + '" class="form-control rectangleAllPointLngLat"/>'
                            + '</div>'
                            + '</div>'
                    }
                    ;
                    $("#rectangleAllPointShow").html(html);
                    $("#addOrUpdatePolygonFlag").val("0");
                    pageLayout.closeVideo();
                    $("#myModal").modal('show');
                }
            }
            ;
        }
        ;
    },
    regionalQuery: function (data) {
        $("#dataTable tbody").html('');
        var objRegional = data.obj;
        var isHasCar = false;
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        var html = '';
        var param = [];
        var select = [];//去重
        var sum = 0;
        for (var i = 0; i < objRegional.length; i++) {
            var longitude = objRegional[i][2];
            var latitude = objRegional[i][1];
            var flagssss = changeArray.contains([longitude, latitude]);
            if (flagssss == true) { // 判断车辆是否在指定区域内
                isHasCar = true;
                var carMsgID = objRegional[i][0];//车辆ID
                if (select.toString().indexOf(carMsgID) == -1) {
                    sum++;
                    var carName = objRegional[i][4];
                    var carGroup = objRegional[i][3];
                    var nodes = zTree.getNodesByParam("id", carMsgID, null);

                    crrentSubV.push(objRegional[i][0]);
                    crrentSubName.push(objRegional[i][4]);

                    for (var j = 0; j < nodes.length; j++) {
                        // crrentSubV.push(objRegional[i][0]);
                        // crrentSubName.push(objRegional[i][4]);
                        zTree.checkNode(nodes[j], true, true);
                        nodes[j].checkedOld = true;
                        zTree.updateNode(nodes[j]);
                    };

                    cheakdiyuealls.push(carMsgID);
                    html += '<tr><td>' + carName + '</td><td>' + carGroup + '</td></tr>';
                    var obj = new Object();
                    obj.vehicleID = carMsgID;
                    param.push(obj)
                    select.push(carMsgID);
                }
            }
            ;
        }
        ;
        $("#sumRegionalQuery").text("共计" + sum + "监控对象！");
        $("#dataTable tbody").html(html);
        if (isHasCar) {
            pageLayout.closeVideo();
            $("#areaSearchCar").modal('show');
            var requestStrS = {
                "desc": {
                    "MsgId": 40964,
                    "UserName": $("#userName").text()
                },
                "data": param
            };
            cancelList = [];
            isAreaSearch = true;
            webSocket.subscribe(headers, "/user/" + $("#userName").text() + "/location", dataTableOperation.updateRealLocation, "/app/vehicle/location", requestStrS);
        } else {
            layer.msg(trackAreaMonitorNull);
            mouseTool.close(true);
            $("#queryClick i").removeClass("active");
            $("#queryClick span").css('color', '#5c5e62');
        }
        ;
    },
    //去除array中相邻的重复点
    removeAdjoinRepeatPoint: function (array) {
        //去除array中相邻的重复点
        var tempArray = new Array();
        if (null != array && array.length > 1) {
            tempArray.push([array[0][0], array[0][1]]);
            for (var i = 1; i < array.length; i++) {
                var templongtitude = array[i][0];
                var templatitude = array[i][1];
                if (templongtitude == array[i - 1][0] && templatitude == array[i - 1][1]) {
                    continue;
                } else {
                    tempArray.push([templongtitude, templatitude]);
                }
            }
            array = tempArray;
        }
        return array;
    },
    //清空标注
    clearMapMarker: function () {
        $("#addOrUpdateMarkerFlag").val("0");
        $("#markerId").val("");
        $("#markerName").val("");
        $("#markerDescription").val("");
        $("#mark-lng").attr("value", "");
        $("#mark-lat").attr("value", "");
    },
    //清空线路
    clearLine: function () {
        $("#addOrUpdateLineFlag").val("0");
        $("#lineId").val("");
        $("#lineName1").val("");
        $("#lineWidth1").val("");
        $("#lineDescription1").val("");
        $("#pointSeqs").val("");
        $("#longitudes").val("");
        $("#latitudes").val("");
    },
    //清空矩形
    clearRectangle: function () {
        $("#addOrUpdateRectangleFlag").val("0");
        $("#rectangleId").val("");
        $("#rectangleName").val("");
        $("#rectangleDescription").val("");
        $("#pointSeqsRectangles").val("");
        $("#longitudesRectangles").val("");
        $("#latitudesRectangles").val("");
    },
    //清空多边形
    clearPolygon: function () {
        $("#addOrUpdatePolygonFlag").val("0");
        $("#polygonId").val("");
        $("#polygonName").val("");
        $("#polygonDescription").val("");
        $("#pointSeqsPolygons").val("");
        $("#longitudesPolygons").val("");
        $("#latitudesPolygons").val("");
    },
    //清空圆形
    clearCircle: function () {
        $("#addOrUpdateCircleFlag").val("0");
        $("#circleId").val("");
        $("#circleName").val("");
        $("#circleDescription").val("");
        $("#circle-lng").attr("value", "");
        $("#circle-lat").attr("value", "");
        $("#circle-radius").attr("value", "");
    },
    searchCarClose: function () {
        $("#areaSearchCar").modal('hide');
        $("#queryClick i").removeClass("active");
        $("#queryClick span").css('color', '#5c5e62');
        mouseTool.close(true);
    },
    //标注保存
    annotatedSave: function (thisBtn) {
        if (fenceOperation.validate_marker()) {
            thisBtn.disabled = true;
            $("#marker").ajaxSubmit(function (data) {
                var datas = eval("(" + data + ")");
                if (datas.success == true) {
                    saveFenceName = $('#markerName').val();
                    saveFenceType = 'zw_m_marker';
                    $("#mark").modal("hide");
                    mouseTool.close(true);
                    var markFenceID = $("#markerId").val();
                    fenceOperation.addNodes();
                    var markFence = fenceIDMap.get(markFenceID);
                    if (markFence != undefined) {
                        markFence.setDraggable(false);
                    }
                    ;
                    var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
                    var nodes = zTree.getNodesByParam("id", markFenceID, null);
                    fenceOperation.getFenceDetail(nodes, map);
                } else {
                    if (datas.msg == null) {
                        layer.msg(fenceOperationLableExist);
                    } else if (datas.msg != null) {
                        layer.msg(data.msg, {move: false});
                    }
                }
            });
        }
        ;
    },
    //标注添加时验证
    validate_marker: function () {
        return $("#marker").validate({
            rules: {
                name: {
                    required: true,
                    maxlength: 50
                },
                description: {
                    maxlength: 100
                },
                groupName: {
                    required: true,
                },
            },
            messages: {
                name: {
                    required: markerNameNull,
                    maxlength: publicSize50
                },
                description: {
                    maxlength: publicSize100
                },
                groupName: {
                    required: publicSelectGroupNull,
                },
            }
        }).form();
    },
    //线保存
    threadSave: function (thisBtn) {
        if (fenceOperation.validate_line()) {
            layer.load(2);
            thisBtn.disabled = true;
            $("#addLineForm").ajaxSubmit(function (data) {
                var datas = eval("(" + data + ")");
                if (datas.success == true) {
                    isEdit = true;
                    $("#addLine").modal("hide");
                    saveFenceName = $('#lineName1').val();
                    saveFenceType = 'zw_m_line';
                    mouseTool.close(true);
                    var lineId = $("#lineId").val();
                    var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
                    var node = zTree.getNodesByParam("id", lineId, null);
                    fenceOperation.getFenceDetail(node, map);
                    fenceOperation.addNodes();
                    map.off("rightclick", amendLine);
                    if (PolyEditorMap.containsKey(lineId)) {
                        var mapEditFence = PolyEditorMap.get(lineId);
                        if (Array.isArray(mapEditFence)) {
                            for (var i = 0; i < mapEditFence.length; i++) {
                                mapEditFence[i].close();
                            }
                            ;
                        } else {
                            mapEditFence.close();
                        }
                        ;
                    }
                    ;
                } else {
                    if (datas.msg == null) {
                        layer.msg(fenceOperationLineExist);
                        layer.closeAll('loading');
                    } else if (datas.msg != null) {
                        layer.msg(data.msg, {move: false});
                    }
                }
            });
        }
        ;
    },
    sectionThreadSave: function () {
        if (fenceOperation.validate_line()) {
            $("#addLineForm").ajaxSubmit();
        }
        ;
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
                    range: [0, 255],
                },
                description: {
                    maxlength: 100
                },
                groupName: {
                    required: true,
                }
            },
            messages: {
                name: {
                    required: lineNameNull,
                    maxlength: publicSize20
                },
                width: {
                    required: fenceOperationOffsetNull,
                    maxlength: fenceOperationScope255
                },
                description: {
                    maxlength: publicSize100
                },
                groupName: {
                    required: publicSelectGroupNull,
                }
            }
        }).form();
    },
    //矩形保存
    rectangleSave: function (thisBtn) {
        var nowLULnglat = $("#LUPointLngLat").val().split(',');
        var nowRDLngLat = $("#RDPointLngLat").val().split(',');
        $("#longitudesRectangles").attr('value', nowLULnglat[0] + "," + nowRDLngLat[0] + "," + nowRDLngLat[0] + "," + nowLULnglat[0]);
        $("#latitudesRectangles").attr('value', nowLULnglat[1] + "," + nowRDLngLat[1] + "," + nowRDLngLat[1] + "," + nowLULnglat[1]);
        if (fenceOperation.validate_rectangle()) {
            thisBtn.disabled = true;
            $("#rectangles").ajaxSubmit(function (data) {
                var datas = eval("(" + data + ")");
                if (datas.success == true) {
                    $("#rectangle-form").modal("hide");
                    saveFenceName = $('#rectangleName').val();
                    saveFenceType = 'zw_m_rectangle';
                    mouseToolEdit.close(true);
                    mouseTool.close(true);
                    var rectang_fenceId = $("#rectangleId").val();
                    if (rectang_fenceId != "") {
                        var thisFence = fenceIDMap.get(rectang_fenceId);
                        fenceIDMap.remove(rectang_fenceId);
                        thisFence.hide();
                    }
                    ;
                    fenceOperation.addNodes();
                } else {
                    if (datas.msg == null) {
                        layer.msg(fenceOperationRectangleExist);
                    } else if (datas.msg != null) {
                        layer.msg(data.msg, {move: false});
                    }
                }
            });
        }
    },
    //矩形添加时验证
    validate_rectangle: function () {
        return $("#rectangles").validate({
            rules: {
                name: {
                    required: true,
                    maxlength: 20
                },
                type: {
                    required: false,
                    maxlength: 20
                },
                description: {
                    maxlength: 100
                },
                lnglatQuery_LU: {
                    required: true,
                    isLngLat: [[135.05, 53.55], [73.66, 3.86]],
                },
                lnglatQuery_RD: {
                    required: true,
                    isLngLat: [[135.05, 53.55], [73.66, 3.86]],
                },
                groupName: {
                    required: true
                }
            },
            messages: {
                name: {
                    required: areaNameNull,
                    maxlength: publicSize20
                },
                type: {
                    required: deviationNull,
                    maxlength: publicSize20
                },
                description: {
                    maxlength: publicSize100
                },
                lnglatQuery_LU: {
                    required: fenceOperationLoAlaNull,
                    isLngLat: fenceOperationLoAlaError,
                },
                lnglatQuery_RD: {
                    required: fenceOperationLoAlaNull,
                    isLngLat: fenceOperationLoAlaError,
                },
                groupName: {
                    required: publicSelectGroupNull
                }
            },
        }).form();
    },
    //多边形保存
    polygonSave: function (thisBtn) {
        var polygonId = $("#polygonId").val();
        var rectanglePointMag = [];
        var allPointArray = [];
        $('.rectangleAllPointLngLat').each(function () {
            var value = $(this).val().split(',');
            var msgArray = [];
            msgArray.polygonId = polygonId;
            msgArray.longitude = value[0];
            msgArray.latitude = value[1];
            rectanglePointMag.push(msgArray);
            allPointArray.push(value);
        });
        var lngValue = '';
        var latValue = '';
        for (var i = 0, len = allPointArray.length; i < len; i++) {
            if (i != len - 1) {
                lngValue += allPointArray[i][0] + ",";
                latValue += allPointArray[i][1] + ",";
            } else {
                lngValue += allPointArray[i][0];
                latValue += allPointArray[i][1];
            }
            ;
        }
        ;
        $("#longitudesPolygons").attr('value', lngValue);
        $("#latitudesPolygons").attr('value', latValue);
        var polygonId = $("#polygonId").val();
        var rectanglePointMag = [];
        var allPointArray = [];
        $('.rectangleAllPointLngLat').each(function () {
            var value = $(this).val().split(',');
            var msgArray = [];
            msgArray.polygonId = polygonId;
            msgArray.longitude = value[0];
            msgArray.latitude = value[1];
            rectanglePointMag.push(msgArray);
            allPointArray.push(value);
        });
        var lngValue = '';
        var latValue = '';
        for (var i = 0, len = allPointArray.length; i < len; i++) {
            if (i != len - 1) {
                lngValue += allPointArray[i][0] + ",";
                latValue += allPointArray[i][1] + ",";
            } else {
                lngValue += allPointArray[i][0];
                latValue += allPointArray[i][1];
            }
            ;
        }
        ;
        $("#longitudesPolygons").attr('value', lngValue);
        $("#latitudesPolygons").attr('value', latValue);
        if (fenceOperation.validate_polygon()) {
            thisBtn.disabled = true;
            $("#polygons").ajaxSubmit(function (data) {
                var datas = eval("(" + data + ")");
                if (datas.success == true) {
                    $("#myModal").modal("hide");
                    saveFenceName = $('#polygonName').val();
                    saveFenceType = 'zw_m_polygon';
                    $(".fenceA").removeClass("fenceA-active");
                    mouseTool.close(true);
                    map.off("rightclick", amendPolygon);
                    var polygonId = $("#polygonId").val();
                    if (PolyEditorMap.containsKey(polygonId)) {
                        var mapEditFence = PolyEditorMap.get(polygonId);
                        mapEditFence.close();
                    }
                    ;
                    fenceOperation.addNodes();
                } else {
                    if (datas.msg == null) {
                        layer.msg(fenceOperationPolygonExist);
                    } else {
                        layer.msg(datas.msg, {move: false});
                    }
                }
            });
        }
    },
    //多边形区域添加时验证
    validate_polygon: function () {
        return $("#polygons").validate({
            rules: {
                name: {
                    required: true,
                    maxlength: 20
                },
                type: {
                    maxlength: 20
                },
                description: {
                    maxlength: 100
                },
                groupName: {
                    required: true
                }
            },
            messages: {
                name: {
                    required: areaNameNull,
                    maxlength: publicSize20
                },
                type: {
                    maxlength: publicSize20
                },
                description: {
                    maxlength: publicSize100
                },
                groupName: {
                    required: publicSelectGroupNull
                }
            }
        }).form();
    },
    //圆保存
    roundSave: function (thisBtn) {
        var circleLng = $("#editCircleLng").val();
        var circleLat = $("#editCircleLat").val();
        var circleRadius = $("#editCircleRadius").val();
        if (circleLng != '') {
            $("#circle-lng").attr('value', circleLng);
        }
        ;
        if (circleLat != '') {
            $("#circle-lat").attr('value', circleLat);
        }
        ;
        if (circleRadius != '') {
            $("#circle-radius").attr('value', circleRadius);
        }
        ;
        if (fenceOperation.validate_circle()) {
            thisBtn.disabled = true;
            $("#circles").ajaxSubmit(function (data) {
                var datas = eval("(" + data + ")");
                if (datas.success == true) {
                    $("#circleArea").modal("hide");
                    saveFenceName = $('#circleName').val();
                    saveFenceType = 'zw_m_circle';
                    mouseTool.close(true);
                    var circleId = $("#circleId").val();
                    if (PolyEditorMap.containsKey(circleId)) {
                        var mapEditFence = PolyEditorMap.get(circleId);
                        mapEditFence.close();
                    }
                    ;
                    map.off("rightclick", amendCircle);
                    fenceOperation.addNodes();
                } else {
                    if (datas.msg == null) {
                        layer.msg(fenceOperationCircleExist);
                    } else if (datas.msg != null) {
                        layer.msg(data.msg, {move: false});
                    }
                }
            });
        }
        ;
    },
    //圆形区域添加时验证
    validate_circle: function () {
        return $("#circles").validate({
            rules: {
                name: {
                    required: true,
                    maxlength: 20
                },
                type: {
                    maxlength: 20
                },
                description: {
                    maxlength: 100
                },
                centerPointLng: {
                    required: true,
                    isLng: [135.05, 53.55],
                },
                centerPointLat: {
                    required: true,
                    isLat: [73.66, 3.86],
                },
                centerRadius: {
                    required: true,
                    number: true,
                },
                groupName: {
                    required: true
                }
            },
            messages: {
                name: {
                    required: areaNameNull,
                    maxlength: publicSize20
                },
                type: {
                    maxlength: publicSize20
                },
                description: {
                    maxlength: publicSize100
                },
                centerPointLng: {
                    required: fenceOperationLongitudeNull,
                    isLng: fenceOperationLongitudeError,
                },
                centerPointLat: {
                    required: fenceOperationLatitudeNull,
                    isLat: fenceOperationLatitudeError,
                },
                centerRadius: {
                    required: fenceOperationCircleRadiusNull,
                    number: publicNumberNull,
                },
                groupName: {
                    required: publicSelectGroupNull
                }
            }
        }).form();
    },
    //清除错误信息
    clearErrorMsg: function () {
        mouseTool.close(true);
        $("label.error").hide();
        $(".error").removeClass("error");
    },
    // 新增围栏树节点
    addNodes: function () {
        fenceIdArray = [];
        fenceOpenArray = [];
        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
        var allNodes = zTree.getNodes();
        for (var i = 0, len = allNodes.length; i < len; i++) {
            if (allNodes[i].open == true) {
                fenceOpenArray.push(allNodes[i].id);
            }
            ;
        }
        ;
        var nodes = zTree.getCheckedNodes(true);
        for (var i = 0, len = nodes.length; i < len; i++) {
            fenceIdArray.push(nodes[i].id);
        }
        ;
        var fenceAll = {
            async: {
                url: "/clbs/m/functionconfig/fence/bindfence/fenceTree",
                type: "post",
                enable: true,
                autoParam: ["id"],
                dataType: "json",
                dataFilter: fenceOperation.ajaxFenceDataFilter,
                otherParam: {"type": "multiple"}
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
            view: {
                addHoverDom: fenceOperation.addHoverDom,
                removeHoverDom: fenceOperation.removeHoverDom,
                dblClickExpand: false,
                nameIsHTML: true,
                fontCss: setFontCss_ztree
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                onClick: fenceOperation.onClickFenceChar,
                onCheck: fenceOperation.onCheckFenceChar,
                onAsyncSuccess: fenceOperation.zTreeOnAsyncFenceSuccess
            }
        };
        $.fn.zTree.init($("#fenceDemo"), fenceAll, null);
    },
    //围栏绑定
    fenceBind: function (fenceId, fenceName, fenceInfoId, fenceIdstr) {
        fenceOperation.clearFenceBind();
        $("#fenceID").val(fenceId);
        $("#fenceName").val(fenceName);
        $("#fenceInfoId").val(fenceInfoId);
        pageLayout.closeVideo();
        $("#fenceBind").modal('show');
        fenceOperation.initBindFenceTree();

        // json_ajax("post", '/clbs/m/functionconfig/fence/bindfence/getVehicleIdsByFenceId', "json", false, {"fenceId": fenceIdstr}, function (data) {
        //     oldFencevehicleIds = data.obj;
        // })
        return false;
    },
    initBindFenceTree: function () {
        bindFenceSetChar = {
            async: {
                url: fenceOperation.getFenceTreeUrl,
                type: "post",
                enable: true,
                autoParam: ["id"],
                dataType: "json",
                otherParam: {"type": "multiple"},
                dataFilter: fenceOperation.ajaxDataFilter
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
            view: {
                dblClickExpand: false,
                nameIsHTML: true,
                fontCss: setFontCss_ztree
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                beforeClick: fenceOperation.beforeClickFenceVehicle,
                onAsyncSuccess: fenceOperation.zTreeVFenceOnAsyncSuccess,
                beforeCheck: fenceOperation.zTreeBeforeCheck,
                onCheck: fenceOperation.onCheckFenceVehicle,
                onExpand: fenceOperation.zTreeOnExpand,
                onNodeCreated: fenceOperation.zTreeOnNodeCreated,
            }
        };
        $.fn.zTree.init($("#treeDemoFence"), bindFenceSetChar, null);
    },
    getFenceTreeUrl: function (treeId, treeNode) {
        if (treeNode == null) {
            return "/clbs/m/functionconfig/fence/bindfence/alarmSearchTree";
        } else if (treeNode.type == "assignment") {
            return "/clbs/m/functionconfig/fence/bindfence/putMonitorByAssign?assignmentId=" + treeNode.id + "&isChecked=" + treeNode.checked + "&monitorType=monitor";
        }
    },
    //组织树预处理函数
    ajaxDataFilter: function (treeId, parentNode, responseData) {
//        responseData = JSON.parse(ungzip(responseData));
//        return responseData;
        var treeObj = $.fn.zTree.getZTreeObj("treeDemoFence");
        if (responseData.msg) {
            var obj = JSON.parse(ungzip(responseData.msg));
            var data;
            if (obj.tree != null && obj.tree != undefined) {
                data = obj.tree;
                fenceSize = obj.size;
            } else {
                data = obj
            }
            for (var i = 0; i < data.length; i++) {
                if (data[i].type == "group") {
                    data[i].open = true;
                }
            }
        }
        return data;
    },
    beforeClickFenceVehicle: function (treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("treeDemoFence");
        zTree.checkNode(treeNode, !treeNode.checked, null, true);
        return false;
    },
//    zTreeOnAsyncSuccess: function(event, treeId, treeNode, msg){
//
//  },
    zTreeBeforeCheck: function (treeId, treeNode) {
        var flag = true;
        if (!treeNode.checked) {
            if (treeNode.type == "group" || treeNode.type == "assignment") { //若勾选的为组织或分组
                var zTree = $.fn.zTree.getZTreeObj("treeDemo"), nodes = zTree
                    .getCheckedNodes(true), v = "";
                var nodesLength = 0;

                json_ajax("post", "/clbs/a/search/getMonitorNum",
                    "json", false, {"id": treeNode.id, "type": treeNode.type}, function (data) {
                        if (data.success) {
                            nodesLength += data.obj;
                        } else {
                            layer.msg(treeCheckError);
                        }
                    });

                //存放已记录的节点id(为了防止车辆有多个分组而引起的统计不准确)
                var ns = [];
                //节点id
                var nodeId;
                for (var i = 0; i < nodes.length; i++) {
                    nodeId = nodes[i].id;
                    if (nodes[i].type == "people" || nodes[i].type == "vehicle" || nodes[i].type == "thing") {
                        //查询该节点是否在勾选组织或分组下，若在则不记录，不在则记录
                        var nd = zTree.getNodeByParam("tId", nodes[i].tId, treeNode);
                        if (nd == null && $.inArray(nodeId, ns) == -1) {
                            ns.push(nodeId);
                        }
                    }
                }
                nodesLength += ns.length;
            } else if (treeNode.type == "people" || treeNode.type == "vehicle" || treeNode.type == "thing") { //若勾选的为监控对象
                var zTree = $.fn.zTree.getZTreeObj("treeDemo"), nodes = zTree
                    .getCheckedNodes(true), v = "";
                var nodesLength = 0;
                //存放已记录的节点id(为了防止车辆有多个分组而引起的统计不准确)
                var ns = [];
                //节点id
                var nodeId;
                for (var i = 0; i < nodes.length; i++) {
                    nodeId = nodes[i].id;
                    if (nodes[i].type == "people" || nodes[i].type == "vehicle" || nodes[i].type == "thing") {
                        if ($.inArray(nodeId, ns) == -1) {
                            ns.push(nodeId);
                        }
                    }
                }
                nodesLength = ns.length + 1;
            }
//            var zTree = $.fn.zTree.getZTreeObj("treeDemo"), nodes = zTree
//                .getCheckedNodes(true), v = "";
//            var nodesLength = 0;
//            for (var i=0;i<nodes.length;i++) {
//                if(nodes[i].type == "people" || nodes[i].type == "vehicle"){
//                    nodesLength += 1;
//                }
//            }
//            if (treeNode.type == "group" || treeNode.type == "assignment"){ // 判断若勾选节点数大于5000，提示
//                var zTree = $.fn.zTree.getZTreeObj("treeDemo")
//                json_ajax("post", "/clbs/a/search/getMonitorNum",
//                    "json", false, {"id": treeNode.id,"type": treeNode.type}, function (data) {
//                        nodesLength += data;
//                    })
//            } else if (treeNode.type == "people" || treeNode.type == "vehicle") {
//                nodesLength += 1;
//            }
            if (nodesLength > 5000) {
                layer.msg(treeMaxLength5000);
                flag = false;
            }
        }
        if (flag) {
            //若组织节点已被勾选，则是勾选操作，改变勾选操作标识
            if (treeNode.type == "group" && !treeNode.checked) {
                checkFlag = true;
            }
        }
        return flag;
    },
    onCheckFenceVehicle: function (e, treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("treeDemoFence"), nodes = zTree
            .getCheckedNodes(true), v = "";
        //若为取消勾选则不展开节点
        if (treeNode.checked) {
            zTree.expandNode(treeNode, true, true, true, true); // 展开节点
        }
        // 记录勾选的节点
        var v = "";
        for (var i = 0, l = nodes.length; i < l; i++) {
            if (nodes[i].type == "vehicle" || nodes[i].type == "people" || nodes[i].type == "thing") {
                v += nodes[i].id + ",";
            }
        }
        vehicleFenceList = v;
    },
    zTreeOnExpand: function (event, treeId, treeNode) {
        //判断是否是勾选操作展开的树(是则继续执行，不是则返回)
        if (treeNode.type == "group" && !checkFlag) {
            return;
        }
        var treeObj = $.fn.zTree.getZTreeObj("treeDemoFence");
        // if (treeNode.children) {
        //     for (var i = 0, l = treeNode.children.length; i < l; i++) {
        //         treeObj.checkNode(treeNode.children[i], false, true);
        //         if ($.inArray(treeNode.children[i].id, oldFencevehicleIds) != -1) {
        //             console.log(treeNode.children[i].id)
        //             treeObj.checkNode(treeNode.children[i], true, true);
        //         }
        //     }
        // }
        //初始化勾选操作判断表示
        checkFlag = false;

        if (treeNode.type == "group") {
            var url = "/clbs/m/functionconfig/fence/bindfence/putMonitorByGroup";
            json_ajax("post", url, "json", false, {
                "groupId": treeNode.id,
                "isChecked": treeNode.checked,
                "monitorType": "monitor"
            }, function (data) {
                var result = data.obj;
                if (result != null && result != undefined) {
                    $.each(result, function (i) {
                        var pid = i; //获取键值
                        var chNodes = result[i] //获取对应的value
                        var parentTid = fenceZTreeIdJson[pid][0];
                        var parentNode = treeObj.getNodeByTId(parentTid);
                        if (parentNode.children === undefined) {
                            treeObj.addNodes(parentNode, []);
                        }
                    });
                }
            })
        }
    },
    zTreeOnNodeCreated: function (event, treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("treeDemoFence");
        var id = treeNode.id.toString();
        var list = [];
        if (fenceZTreeIdJson[id] == undefined || fenceZTreeIdJson[id] == null) {
            list = [treeNode.tId];
            fenceZTreeIdJson[id] = list;
        } else {
            fenceZTreeIdJson[id].push(treeNode.tId)
        }
    },
    zTreeVFenceOnAsyncSuccess: function (event, treeId, treeNode, msg) {

        var treeObj = $.fn.zTree.getZTreeObj(treeId);
        // 更新节点数量
        treeObj.updateNodeCount(treeNode);
        // 默认展开200个节点
        var initLen = 0;
        notExpandNodeInit = treeObj.getNodesByFilter(assignmentNotExpandFilter);
        for (i = 0; i < notExpandNodeInit.length; i++) {
            treeObj.expandNode(notExpandNodeInit[i], true, true, false, true);
            initLen += notExpandNodeInit[i].children.length;
            if (initLen >= 200) {
                break;
            }
        }

    },
    /**
     * 选中已选的节点
     */
    checkCurrentNodes: function (treeNode) {
        // var crrentSubV = vehicleFenceList.split(",");
        // var treeObj = $.fn.zTree.getZTreeObj("treeDemoFence");
        // if (treeNode != undefined && treeNode != null && treeNode.type === "assignment" && treeNode.children != undefined) {
        //     var list = treeNode.children;
        //     if (list != null && list.length > 0) {
        //         for (var j = 0; j < list.length; j++) {
        //             var znode = list[j];
        //             if (crrentSubV != null && crrentSubV != undefined && crrentSubV.length !== 0 && $.inArray(znode.id, crrentSubV) != -1) {
        //                 treeObj.checkNode(znode, true, true);
        //             }
        //         }
        //     }
        // }
        var treeObj = $.fn.zTree.getZTreeObj("treeDemoFence");
        if (treeNode.children) {
            for (var i = 0, l = treeNode.children.length; i < l; i++) {
                if ($.inArray(treeNode.children[i].id, oldFencevehicleIds) != -1) {
                    treeObj.checkNode(treeNode.children[i], true, true);
                }
            }
        }
    },
    //围栏绑定模糊查询
    searchVehicleSearch: function () {
        //search_ztree('treeDemoFence', 'searchVehicle','vehicle');
        if (fenceInputChange !== undefined) {
            clearTimeout(fenceInputChange);
        }
        ;
        fenceInputChange = setTimeout(function () {
            var param = $("#searchVehicle").val();
            if (param == '') {
                fenceOperation.initBindFenceTree();
            } else {
                fenceOperation.searchBindFenceTree(param);
            }
        }, 500);
    },
    ajaxQueryDataFilter: function (treeId, parentNode, responseData) {
        responseData = JSON.parse(ungzip(responseData));
        var list = [];
        if (vehicleFenceList != null && vehicleFenceList != undefined && vehicleFenceList != "") {
            var str = (vehicleFenceList.slice(vehicleFenceList.length - 1) == ',') ? vehicleFenceList.slice(0, -1) : vehicleFenceList;
            list = str.split(",");
        }
        return filterQueryResult(responseData, list);
    },
    //check选择
    checkAllClick: function () {
        if ($(this).prop("checked") === true) {
            $("#checkAll").attr("checked", true);
            $("#tableList input[type='checkbox']").prop("checked",
                $(this).prop("checked"));
            $('#tableList tbody tr').addClass('selected');
            trid = [];
            for (i = 1; i < $("#tableList tr").length; i++) {
                trid.push("list" + i);
            }
        } else {
            $("#checkAll").attr("checked", false);
            $("#tableList input[type='checkbox']").prop("checked", false);
            $('#tableList tbody tr').removeClass('selected');
            trid = [];
        }
    },
    // 点击添加(按围栏 )
    addBtnClick: function () {
        trid = [];
        // 动态添加表格
        vehicelTree = $.fn.zTree.getZTreeObj("treeDemoFence");
        vehicleNode = vehicelTree.getCheckedNodes();
        if (vehicleNode == null || vehicleNode.length == 0) {
            layer.msg(fenceOperationMonitorNull, {move: false});
        } else {
            var fenceName = $("#fenceName").val();
            var fenceInfoId = $("#fenceInfoId").val();
            // 先清空table 中的数据
            $("#tableList tbody").html("");
            // 去重
            vehicleNode = vehicleNode.unique2();
            var j = 0;
            for (var i = 0; i < vehicleNode.length; i++) {
                if (vehicleNode[i].type == "vehicle" || vehicleNode[i].type == "people" || vehicleNode[i].type == "thing") {
                    j++;
                    var inRadioName = "Inradio" + j;
                    var outRadioName = "Outradio" + j;
                    var inDriverName = "InDriver" + j;
                    var outDriverName = "OutDriver" + j;
                    var sendFenceTypeName = "sendFenceType" + j;
                    var alarmSourceName = "alarmSourceName" + j;
                    var openDoorName = "openDoor" + j;
                    var communicationFlagName = "communicationFlag" + j;
                    var GNSSFlagName = "GNSSFlag" + j;
                    var fencetype = $("#fenceID").val();
                    var tr = "<tr id='list" + j + "'><td><input id='checkList" + j + "' type='checkbox' onclick='fenceOperation.checkboxis(this)'   name='thead'/></td><td>"
                        + fenceName
                        + "</td><td>"
                        + vehicleNode[i].name
                        + "</td><td><label name = 'fenceType' style='margin-bottom:0px;'>"
                        + fenceOperation.fencetypepid(fencetype, alarmSourceName)
                        + "</label></td>"
                        + fenceOperation.sendFenceTypeTd(fencetype, sendFenceTypeName)
                        + fenceOperation.alarmSourceCheck(fencetype, alarmSourceName)
                        + "<td id = 'startTime'><input id='startDatePlugin" + j + "' onclick='fenceOperation.selectDate(this)' style='width:120px;cursor:default;' class='form-control layer-date laydate-icon selectTime' name='startTime' readonly /></td>"
                        + "<td id = 'endTime'><input id='endDatePlugin" + j + "'onclick='fenceOperation.selectDate(this)' style='width:120px;cursor:default;'  class='form-control layer-date laydate-icon selectTime' name='endTime' readonly /></td>"
                        + "<td id = 'alarmStartDateTD'><input id='startTimeHMS" + j + "'onclick='fenceOperation.selectTime(this)' style='width:120px;cursor:default;'  class='form-control layer-date laydate-icon'  name='alarmStartDateTD'  readonly /></td>"
                        + "<td id = 'alarmEndDateTD'><input id='endTimeHMS" + j + "' onclick='fenceOperation.selectTime(this)' style='width:120px;cursor:default;'  class='form-control layer-date laydate-icon' name='alarmEndDateTD'  readonly /></td>"
                        + "<td id = 'alarmIn'><input type='radio' value = 1 checked name='" + inRadioName + "' id='" + inRadioName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + inRadioName + "'>是</label><input type='radio' value = 0 name='" + inRadioName + "' id='" + inRadioName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + inRadioName + "s'>否</label></td>"
                        + "<td id = 'alarmOut'><input type='radio'  value = 1 checked name='" + outRadioName + "' id='" + outRadioName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + outRadioName + "'>是</label><input type='radio'  value = 0 name='" + outRadioName + "' id='" + outRadioName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + outRadioName + "s'>否</label></td>"
                        + "<td id = 'alarmInDriver'><input type='radio' value = 1 checked name='" + inDriverName + "' id='" + inDriverName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + inDriverName + "'>是</label><input type='radio' value = 0 name='" + inDriverName + "' id='" + inDriverName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + inDriverName + "s'>否</label></td>"
                        + "<td id = 'alarmOutDriver'><input type='radio'  value = 1 checked name='" + outDriverName + "' id='" + outDriverName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + outDriverName + "'>是</label><input type='radio'  value = 0 name='" + outDriverName + "' id='" + outDriverName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + outDriverName + "s'>否</label></td>"
                        + "<td id='speed'><input type= 'text' name = 'speed' class='form-control' onkeyup=\"value=value.replace(/[^\\d]/g,'')\" /></td>"
                        + "<td id='overSpeedLastTime'><input type= 'text' name = 'overSpeedLastTime' class='form-control' onkeyup=\"value=value.replace(/[^\\d]/g,'')\" /></td>"
                        +
                        fenceOperation.travelLongAndSmallTime(fencetype)
                        +
                        fenceOperation.otherInfo(fencetype, openDoorName, communicationFlagName, GNSSFlagName)
                        + "<td class='hidden' id='fenceId'>"
                        + fenceInfoId
                        + "</td><td class='hidden' id = 'vehicleId'>"
                        + vehicleNode[i].id + "</td><td id = 'monitorType' class='hidden'>" + vehicleNode[i].type + "</td></tr>";
                    $("#tableList tbody").append(tr);
                    var checkRadio;
                    if (fencetype == "zw_m_administration" || fencetype == "zw_m_travel_line") {
                        checkRadio = $("input[name=" + alarmSourceName + "]")[1];
                    } else {
                        checkRadio = $("input[name=" + alarmSourceName + "]")[0];
                    }
                    if ($(checkRadio).val() == 1) {
                        $("#tableList tbody tr").find("#sendFenceType,#alarmInDriver,#alarmOutDriver,#overSpeedLastTime,#travelLongTime,#travelSmallTime,#openDoor,#communicationFlag,#GNSSFlag").css('opacity', '0');
                    }
                }
            }
            fenceOperation.accordingToFenceTypeSHTable(fencetype);
            // 区分终端报警平台报警
            $("input[name*='alarmSourceName']").change(function () {
                var value = $(this).val();
                var p_tr = $(this).parent().parent();
                if (value == 1) { // 若为平台报警，禁用与终端报警相关的参数
                    p_tr.children("td#sendFenceType").css('opacity', '0');
                    p_tr.children("td#alarmInDriver").css('opacity', '0');
                    p_tr.children("td#alarmOutDriver").css('opacity', '0');
                    p_tr.children("td#overSpeedLastTime").css('opacity', '0');
                    p_tr.children("td#travelLongTime").css('opacity', '0');
                    p_tr.children("td#travelSmallTime").css('opacity', '0');
                    p_tr.children("td#openDoor").css('opacity', '0');
                    p_tr.children("td#communicationFlag").css('opacity', '0');
                    p_tr.children("td#GNSSFlag").css('opacity', '0');
                } else {
                    p_tr.children("td#sendFenceType").css('opacity', '1');
                    p_tr.children("td#alarmInDriver").css('opacity', '1');
                    p_tr.children("td#alarmOutDriver").css('opacity', '1');
                    p_tr.children("td#overSpeedLastTime").css('opacity', '1');
                    p_tr.children("td#travelLongTime").css('opacity', '1');
                    p_tr.children("td#travelSmallTime").css('opacity', '1');
                    p_tr.children("td#openDoor").css('opacity', '1');
                    p_tr.children("td#communicationFlag").css('opacity', '1');
                    p_tr.children("td#GNSSFlag").css('opacity', '1');
                }
            });
        }
    },
    // 根据围栏类型显示隐藏数据表格内容
    accordingToFenceTypeSHTable: function (fenceType) {
        if (fenceType == "zw_m_rectangle" || fenceType == "zw_m_circle" || fenceType == "zw_m_polygon" || fenceType == "zw_m_administration") {
            $("#openDoor,#communicationFlag,#GNSSFlag").removeClass("hidden");
            $("#tableList thead tr th:nth-child(19)").removeClass("hidden");
            $("#tableList thead tr th:nth-child(20)").removeClass("hidden");
            $("#tableList thead tr th:nth-child(21)").removeClass("hidden");
            $("#travelLongTime,#travelSmallTime").addClass("hidden");
            $("#tableList thead tr th:nth-child(17)").addClass("hidden");
            $("#tableList thead tr th:nth-child(18)").addClass("hidden");
        }
        else if (fenceType == "zw_m_line" || fenceType == "zw_m_travel_line") {
            $("#travelLongTime,#travelSmallTime").removeClass("hidden");
            $("#tableList thead tr th:nth-child(17)").removeClass("hidden");
            $("#tableList thead tr th:nth-child(18)").removeClass("hidden");
            $("#openDoor,#communicationFlag,#GNSSFlag").addClass("hidden");
            $("#tableList thead tr th:nth-child(19)").addClass("hidden");
            $("#tableList thead tr th:nth-child(20)").addClass("hidden");
            $("#tableList thead tr th:nth-child(21)").addClass("hidden");
        }
        else {
            $("#travelLongTime,#travelSmallTime,#openDoor,#communicationFlag,#GNSSFlag").removeClass("hidden");
            $("#tableList thead tr th:nth-child(17)").removeClass("hidden");
            $("#tableList thead tr th:nth-child(18)").removeClass("hidden");
            $("#tableList thead tr th:nth-child(19)").removeClass("hidden");
            $("#tableList thead tr th:nth-child(20)").removeClass("hidden");
            $("#tableList thead tr th:nth-child(21)").removeClass("hidden");
        }
    },
    //点击解绑按围栏
    removeBtnClick: function () {
        if ($("#checkAll").attr("checked") == "checked") {
            for (var k = 0; k <= vehicleNode.length; k++) {
                trid.push($("#list" + k))
                $("#list" + k).remove();
            }
            $("#checkAll").attr("checked", false)
        } else {
            if (trid.length == 0) {
                layer.msg(userDeleteChooseNull, {move: false});
            }
            for (var i = 0; i < trid.length; i++) {
                $("#" + trid[i]).remove();
            }
        }
        trid = [];
    },
    //依例全设
    setAllClick: function () {
        var i = 0;
        var setSendFenceType = '';
        var setalarmSource = '';
        var setalarmIn = '';
        var setalarmOut = '';
        var setalarmInDriver = '';
        var setalarmOutDriver = '';
        var setOpenDoor = '';
        var setCommunicationFlag = '';
        var setGNSSFlag = '';
        var startTimeVal = '';
        var endTimeVal = '';
        var nameSendFenceType = '';
        var nameAlarmSource = '';
        var namein = '';
        var nameout = '';
        var nameinDriver = '';
        var nameoutDriver = '';
        var nameOpenDoor = '';
        var nameCommunicationFlag = '';
        var nameGNSSFlag = '';
        var startDateVal = '';
        var endDateVal = '';
        var speedVal = '';
        var overSpeedLastTimeVal = '';
        var travelLongTimeVal = '';
        var travelSmallTimeVal = '';
        var fenceType = $("#" + trid[0]).children("td").eq(3).find("label").text();
        console.log(trid);
        if(trid.indexOf('list1')!='-1'){
            console.log(1111);
        }
        if (trid.length < 1) {
            layer.msg("请选择一项！")
        } else if (trid.length > 1) {
            layer.msg("只能选择一项！")
        } else {
            if ($("#" + trid[0]).children("td").eq(4).id = "sendFenceType") {
                nameSendFenceType = $("#" + trid[0]).children("td").eq(4).find("input").attr("name")
                setSendFenceType = $('input[name="' + nameSendFenceType + '"]:checked').val();
            }
            if ($("#" + trid[0]).children("td").eq(5).id = "alarmSource") {
                nameAlarmSource = $("#" + trid[0]).children("td").eq(5).find("input").attr("name")
                setalarmSource = $('input[name="' + nameAlarmSource + '"]:checked').val();
            }
            if ($("#" + trid[0]).children("td").eq(6).find("input").val() != null) {
                startTimeVal = $("#" + trid[0]).children("td").eq(6).find("input").val();
            }
            if ($("#" + trid[0]).children("td").eq(7).find("input").val() != null) {
                endTimeVal = $("#" + trid[0]).children("td").eq(7).find("input").val();
            }
            if ($("#" + trid[0]).children("td").eq(8).find("input").val() != null) {
                startDateVal = $("#" + trid[0]).children("td").eq(8).find("input").val();
            }
            if ($("#" + trid[0]).children("td").eq(9).find("input").val() != null) {
                endDateVal = $("#" + trid[0]).children("td").eq(9).find("input").val();
            }
            if ($("#" + trid[0]).children("td").eq(10).id = "alarmIn") {
                namein = $("#" + trid[0]).children("td").eq(10).find("input").attr("name")
                setalarmIn = $('input[name="' + namein + '"]:checked').val();
            }
            if ($("#" + trid[0]).children("td").eq(11).id = "alarmOut") {
                nameout = $("#" + trid[0]).children("td").eq(11).find("input").attr("name")
                setalarmOut = $('input[name="' + nameout + '"]:checked').val();
            }
            if ($("#" + trid[0]).children("td").eq(12).id = "alarmInDriver") {
                nameinDriver = $("#" + trid[0]).children("td").eq(12).find("input").attr("name")
                setalarmInDriver = $('input[name="' + nameinDriver + '"]:checked').val();
            }
            if ($("#" + trid[0]).children("td").eq(13).id = "alarmOutDriver") {
                nameoutDriver = $("#" + trid[0]).children("td").eq(13).find("input").attr("name")
                setalarmOutDriver = $('input[name="' + nameoutDriver + '"]:checked').val();
            }

            if ($("#" + trid[0]).children("td").eq(14).find("input").val() != null) {
                speedVal = $("#" + trid[0]).children("td").eq(14).find("input").val();
            }
            if ($("#" + trid[0]).children("td").eq(15).find("input").val() != null) {
                overSpeedLastTimeVal = $("#" + trid[0]).children("td").eq(15).find("input").val();
            }
            if ($("#" + trid[0]).children("td").eq(16).find("input").val() != null) {
                travelLongTimeVal = $("#" + trid[0]).children("td").eq(16).find("input").val();
            }
            if ($("#" + trid[0]).children("td").eq(17).find("input").val() != null) {
                travelSmallTimeVal = $("#" + trid[0]).children("td").eq(17).find("input").val();
            }
            if ($("#" + trid[0]).children("td").eq(18).id = "openDoor") {
                nameOpenDoor = $("#" + trid[0]).children("td").eq(18).find("input").attr("name")
                setOpenDoor = $('input[name="' + nameOpenDoor + '"]:checked').val();
            }
            if ($("#" + trid[0]).children("td").eq(19).id = "communicationFlag") {
                nameCommunicationFlag = $("#" + trid[0]).children("td").eq(19).find("input").attr("name")
                setCommunicationFlag = $('input[name="' + nameCommunicationFlag + '"]:checked').val();
            }
            if ($("#" + trid[0]).children("td").eq(20).id = "GNSSFlag") {
                nameGNSSFlag = $("#" + trid[0]).children("td").eq(20).find("input").attr("name")
                setGNSSFlag = $('input[name="' + nameGNSSFlag + '"]:checked').val();
            }
            for (i = 2; i <= $("#tableList tbody tr").length; i++) {
                var tds = $("#tableList tbody tr")[i - 1];
                $(tds).each(function () {
                    var td = this;
                    if (fenceType != "路线" && fenceType != "多边形") {
                        if (setSendFenceType == 0) {
                            $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(0).prop("checked", true);
                            $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(1).prop("checked", false)
                            $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(2).prop("checked", false)
                        } else if (setSendFenceType == 1) {
                            $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(0).prop("checked", false);
                            $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(1).prop("checked", true)
                            $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(2).prop("checked", false)
                        } else if (setSendFenceType == 2) {
                            $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(0).prop("checked", false);
                            $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(1).prop("checked", false)
                            $(td).find('input[name="sendFenceType' + i + '"][type="radio"]').eq(2).prop("checked", true)
                        }
                    }
                    if (setalarmIn == 1) {
                        $(td).find('input[name="Inradio' + i + '"][type="radio"]').eq(0).prop("checked", true);
                        $(td).find('input[name="Inradio' + i + '"][type="radio"]').eq(1).prop("checked", false)
                    } else if (setalarmIn == 0) {
                        $(td).find('input[name="Inradio' + i + '"][type="radio"]').eq(1).prop("checked", true);
                        $(td).find('input[name="Inradio' + i + '"][type="radio"]').eq(0).prop("checked", false)
                    }
                    if (setalarmOut == 1) {
                        $(td).find('input[name="Outradio' + i + '"][type="radio"]').eq(0).prop("checked", true);
                        $(td).find('input[name="Outradio' + i + '"][type="radio"]').eq(1).prop("checked", false)
                    } else if (setalarmOut == 0) {
                        $(td).find('input[name="Outradio' + i + '"][type="radio"]').eq(1).prop("checked", true);
                        $(td).find('input[name="Outradio' + i + '"][type="radio"]').eq(0).prop("checked", false)
                    }
                    if (setalarmInDriver == 1) {
                        $(td).find('input[name="InDriver' + i + '"][type="radio"]').eq(0).prop("checked", true);
                        $(td).find('input[name="InDriver' + i + '"][type="radio"]').eq(1).prop("checked", false)
                    } else if (setalarmInDriver == 0) {
                        $(td).find('input[name="InDriver' + i + '"][type="radio"]').eq(1).prop("checked", true);
                        $(td).find('input[name="InDriver' + i + '"][type="radio"]').eq(0).prop("checked", false)
                    }
                    if (setalarmOutDriver == 1) {
                        $(td).find('input[name="OutDriver' + i + '"][type="radio"]').eq(0).prop("checked", true);
                        $(td).find('input[name="OutDriver' + i + '"][type="radio"]').eq(1).prop("checked", false)
                    } else if (setalarmOutDriver == 0) {
                        $(td).find('input[name="OutDriver' + i + '"][type="radio"]').eq(1).prop("checked", true);
                        $(td).find('input[name="OutDriver' + i + '"][type="radio"]').eq(0).prop("checked", false)
                    }
                    if (startTimeVal != null) {
                        $(td).find('input[name="startTime"]').val(startTimeVal);
                    }
                    if (endTimeVal != null) {
                        $(td).find('input[name="endTime"]').val(endTimeVal);
                    }
                    if (startDateVal != null) {
                        $(td).find('input[name="alarmStartDateTD"]').val(startDateVal);
                    }
                    if (endDateVal != null) {
                        $(td).find('input[name="alarmEndDateTD"]').val(endDateVal);
                    }
                    if (speedVal != null) {
                        $(td).find('input[name="speed"]').val(speedVal);
                    }
                    if (overSpeedLastTimeVal != null) {
                        $(td).find('input[name="overSpeedLastTime"]').val(overSpeedLastTimeVal);
                    }
                    if (fenceType == "路线") {
                        if (travelLongTimeVal != null) {
                            $(td).find('input[name="travelLongTime"]').val(travelLongTimeVal);
                        }
                        if (travelSmallTimeVal != null) {
                            $(td).find('input[name="travelSmallTime"]').val(travelSmallTimeVal);
                        }
                    }
                    if (fenceType != "路线") {
                        if (setOpenDoor == 0) {
                            $(td).find('input[name="openDoor' + i + '"][type="radio"]').eq(0).prop("checked", true);
                            $(td).find('input[name="openDoor' + i + '"][type="radio"]').eq(1).prop("checked", false)
                        } else if (setOpenDoor == 1) {
                            $(td).find('input[name="openDoor' + i + '"][type="radio"]').eq(1).prop("checked", true);
                            $(td).find('input[name="openDoor' + i + '"][type="radio"]').eq(0).prop("checked", false)
                        }
                        if (setCommunicationFlag == 0) {
                            $(td).find('input[name="communicationFlag' + i + '"][type="radio"]').eq(0).prop("checked", true);
                            $(td).find('input[name="communicationFlag' + i + '"][type="radio"]').eq(1).prop("checked", false)
                        } else if (setCommunicationFlag == 1) {
                            $(td).find('input[name="communicationFlag' + i + '"][type="radio"]').eq(1).prop("checked", true);
                            $(td).find('input[name="communicationFlag' + i + '"][type="radio"]').eq(0).prop("checked", false)
                        }
                        if (setGNSSFlag == 0) {
                            $(td).find('input[name="GNSSFlag' + i + '"][type="radio"]').eq(0).prop("checked", true);
                            $(td).find('input[name="GNSSFlag' + i + '"][type="radio"]').eq(1).prop("checked", false)
                        } else if (setGNSSFlag == 1) {
                            $(td).find('input[name="GNSSFlag' + i + '"][type="radio"]').eq(1).prop("checked", true);
                            $(td).find('input[name="GNSSFlag' + i + '"][type="radio"]').eq(0).prop("checked", false)
                        }
                    }

                    if (setalarmSource == 0) { // 终端报警
                        $(td).find('input[name="alarmSourceName' + i + '"][type="radio"]').eq(0).prop("checked", true);
                        $(td).find('input[name="alarmSourceName' + i + '"][type="radio"]').eq(1).prop("checked", false);

                        var y_tr = $(td).parent();
                        y_tr.find("td#sendFenceType").css('opacity', '1');
                        y_tr.find("td#alarmInDriver").css('opacity', '1');
                        y_tr.find("td#alarmOutDriver").css('opacity', '1');
                        y_tr.find("td#overSpeedLastTime").css('opacity', '1');
                        y_tr.find("td#travelLongTime").css('opacity', '1');
                        y_tr.find("td#travelSmallTime").css('opacity', '1');
                        y_tr.find("td#openDoor").css('opacity', '1');
                        y_tr.find("td#communicationFlag").css('opacity', '1');
                        y_tr.find("td#GNSSFlag").css('opacity', '1');
                    } else if (setalarmSource == 1) { // 平台报警
                        $(td).find('input[name="alarmSourceName' + i + '"][type="radio"]').eq(1).prop("checked", true);
                        $(td).find('input[name="alarmSourceName' + i + '"][type="radio"]').eq(0).prop("checked", false);

                        var y_tr = $(td).parent();
                        y_tr.find("td#sendFenceType").css('opacity', '0');
                        y_tr.find("td#alarmInDriver").css('opacity', '0');
                        y_tr.find("td#alarmOutDriver").css('opacity', '0');
                        y_tr.find("td#overSpeedLastTime").css('opacity', '0');
                        y_tr.find("td#travelLongTime").css('opacity', '0');
                        y_tr.find("td#travelSmallTime").css('opacity', '0');
                        y_tr.find("td#openDoor").css('opacity', '0');
                        y_tr.find("td#communicationFlag").css('opacity', '0');
                        y_tr.find("td#GNSSFlag").css('opacity', '0');
                    }
                });
            }
        }
    },
    fencetypepid: function (fencetype) {
        if (fencetype == "zw_m_marker") {
            return "标注";
        } else if (fencetype == "zw_m_line") {
            return "路线";
        } else if (fencetype == "zw_m_rectangle") {
            return "矩形";
        } else if (fencetype == "zw_m_circle") {
            return "圆形";
        } else if (fencetype == "zw_m_polygon") {
            return "多边形";
        } else if (fencetype == "zw_m_administration") {
            return "行政区划";
        } else if (fencetype == "zw_m_travel_line") {
            return "导航路线";
        }
    },
    laydateTime: function (e) {
        id = e.id;
        var offset = $("#" + id).offset();
        var height = $("#" + id).height();
        $("#hmsTime").show().css({
            "position": "absolute",
            "top": offset.top + height + 10 + "px",
            "left": offset.left + "px"
        });
    },
    checkboxis: function (checkbox) {
        $("#checkAll").attr("checked", false)
        if (checkbox.checked == true) {
            trid.push($("#" + checkbox.id).parents("tr").attr("id"));
        } else {
            trid = $.grep(trid, function (value, i) {
                return value != $("#" + checkbox.id).parents("tr").attr("id");
            });
            return trid;
        }
    },

    bodyClickEvent: function (event) {
        if ($(event.target).parents("#hmsTime").length == 0 && event.target.id != "hmsTime" && event.target.id.indexOf('TimeHMS') == -1) {
            $("#hmsTime").hide();
        }
        ;
        if ($(event.target).className != 'ztreeModelBox' && $(event.target).parents(".ztreeModelBox").length == 0 && event.target.id.indexOf('FenceEnterprise') == -1) {
            $('.ztreeModelBox').hide();
        }
        ;
    },
    hourseSelectClick: function () {
        hourseSelect = $(this).text();
        $("#hourseSelect").hide();
        $("#minuteSelect").show();
    },
    minuteSelectClick: function () {
        minuteSelect = $(this).text();
        $("#minuteSelect").hide();
        $("#secondSelect").show();
    },
    secondSelectClick: function () {
        secondSelect = $(this).text();
        $("#secondSelect").hide();
        $("#hourseSelect").show();
        $("#hmsTime").hide();
        time = hourseSelect + ":" + minuteSelect + ":" + secondSelect;
        $("#" + id).val(time);
    },
    // 提交(按围栏)
    fenceSaveBtnClick: function () {
        var arr = [];
        var errFlag = 1;
        var errMsg = "";
        var i = 0;
        // 遍历表格，组装Json
        $("#tableList tr").each(function () {
            var tr = this;
            var obj = {};
            $(tr).children("td").each(function () {
                var td = this;
                if (td.id == "fenceId") {
                    obj.fenceId = $(td).html();
                } else if (td.id == "vehicleId") {
                    obj.vehicleId = $(td).html();
                } else if (td.id == "monitorType") {
                    obj.monitorType = $(td).html();
                } else if (td.id == "sendFenceType") {
                    obj.sendFenceType = $(td).find("input[name='sendFenceType" + i + "']:checked ").attr("value");
                } else if (td.id == "alarmSource") {
                    obj.alarmSource = $(td).find("input[name='alarmSourceName" + i + "']:checked ").attr("value");
                } else if (td.id == "alarmIn") {
                    obj.alarmInPlatform = $(td).find("input[name='Inradio" + i + "']:checked ").attr("value");
                } else if (td.id == "alarmOut") {
                    obj.alarmOutPlatform = $(td).find("input[name='Outradio" + i + "']:checked ").attr("value");
                } else if (td.id == "alarmInDriver") {
                    obj.alarmInDriver = $(td).find("input[name='InDriver" + i + "']:checked ").attr("value");
                } else if (td.id == "alarmOutDriver") {
                    obj.alarmOutDriver = $(td).find("input[name='OutDriver" + i + "']:checked ").attr("value");
                } else if (td.id == "startTime") {
                    obj.alarmStartTime = $(td).find("input").val();
                } else if (td.id == "endTime") {
                    obj.alarmEndTime = $(td).find("input").val();
                } else if (td.id == "alarmStartDateTD") {
                    var time = $(td).find("input").val();
                    if (time != null && time != "") {
                        obj.alarmStartDate = "2016-01-01 " + time;
                    } else {
                      obj.alarmStartDate = "";
                    }
                } else if (td.id == "alarmEndDateTD") {
                    var time = $(td).find("input").val();
                    if (time != null && time != "") {
                        obj.alarmEndDate = "2016-01-01 " + time;
                    } else {
                      obj.alarmEndDate = "";
                    }
                } else if (td.id == "speed") {
                    obj.speed = $(td).find("input").val();
                } else if (td.id == "overSpeedLastTime") {
                    obj.overSpeedLastTime = $(td).find("input").val();
                } else if (td.id == "travelLongTime") {
                    var travelLongTimeVal = $(td).find("input").val();
                    if (travelLongTimeVal != undefined && travelLongTimeVal != null) {
                        obj.travelLongTime = travelLongTimeVal;
                    } else {
                        obj.travelLongTime = "";
                    }
                } else if (td.id == "travelSmallTime") {
                    var travelSmallTimeVal = $(td).find("input").val();
                    if (travelSmallTimeVal != undefined && travelSmallTimeVal != null) {
                        obj.travelSmallTime = travelSmallTimeVal;
                    } else {
                        obj.travelSmallTime = "";
                    }
                } else if (td.id == "openDoor") {
                    var openDoorVal = $(td).find("input[name='openDoor" + i + "']:checked ").attr("value");
                    if (openDoorVal != undefined && openDoorVal != null && openDoorVal != '') {
                        obj.openDoor = openDoorVal;
                    } else {
                        obj.openDoor = 2;
                    }
                } else if (td.id == "communicationFlag") {
                    var communicationFlagVal = $(td).find("input[name='communicationFlag" + i + "']:checked ").attr("value");
                    if (communicationFlagVal != undefined && communicationFlagVal != null && communicationFlagVal != '') {
                        obj.communicationFlag = communicationFlagVal;
                    } else {
                        obj.communicationFlag = 2;
                    }
                } else if (td.id == "GNSSFlag") {
                    var GNSSFlagVal = $(td).find("input[name='GNSSFlag" + i + "']:checked ").attr("value");
                    if (GNSSFlagVal != undefined && GNSSFlagVal != null && GNSSFlagVal != '') {
                        obj.GNSSFlag = GNSSFlagVal;
                    } else {
                        obj.GNSSFlag = 2;
                    }
                }
            });
            var a = i - 1;
            // 开始日期和结束日期要么都有，要么都没有
            if (obj.alarmStartTime != "" && obj.alarmEndTime == "") {
                errFlag = 0;
                errMsg += '第' + (a) + '条数据请选择结束日期！<br/>';
            } else if (obj.alarmStartTime == "" && obj.alarmEndTime != "") {
                errFlag = 0;
                errMsg += '第' + (a) + '条数据请选择开始日期！<br/>';
            } else if (obj.alarmStartTime != "" && obj.alarmEndTime != "") { // 结束日期必须大于开始日期
                if (fenceOperation.compareDate(obj.alarmStartTime, obj.alarmEndTime)) {
                    errFlag = 0;
                    errMsg += '第' + (a) + '条数据结束日期必须大于开始日期！<br/>';
                }
            }
            
            // 开始时间和结束时间要么都有，要么都没有
            if (obj.alarmStartDate != "" && obj.alarmEndDate == "") {
                errFlag = 0;
                errMsg += '第' + (a) + '条数据请选择结束时间！<br/>';
            } else if (obj.alarmStartDate == "" && obj.alarmEndDate != "") {
                errFlag = 0;
                errMsg += '第' + (a) + '条数据请选择开始时间！<br/>';
            } else if (obj.alarmStartDate != "" && obj.alarmEndDate != "") { // 结束日期必须大于开始日期
                if (fenceOperation.compareDate(obj.alarmStartDate, obj.alarmEndDate)) {
                    errFlag = 0;
                    errMsg += '第' + (a) + '条数据结束时间必须大于开始时间！<br/>';
                }
            }
            
            if (obj.speed < 0 || obj.speed > 65535) { // 限速校验最大值最小值
                errFlag = 0;
                errMsg += '第' + (a) + '条数限速的最小值为0，最大值为65535！<br/>';
            }
            if (obj.overSpeedLastTime < 0 || obj.overSpeedLastTime > 65535) { // 超速持续时长校验最大值最小值
                errFlag = 0;
                errMsg += '第' + (a) + '条数超速持续时长的最小值为0，最大值为65535！<br/>';
            }
            // 行驶过长阈值，行驶不足阈值，要么都有，要么都没有
            if (obj.travelLongTime != "" && obj.travelSmallTime == "") {
                errFlag = 0;
                errMsg += '第' + (a) + '条数据请输入行驶不足阈值！<br/>';
            } else if (obj.travelLongTime == "" && obj.travelSmallTime != "") {
                errFlag = 0;
                errMsg += '第' + (a) + '条数据请输入行驶过长阈值！<br/>';
            }
            if (!jQuery.isEmptyObject(obj)) {
                arr.push(obj);
            }
            i++;
        });
        // ajax访问后端
        if (arr == null || arr.length == 0) {
            layer.msg(fenceOperationFenceBound, {move: false});
        } else if (errFlag == 0) {
            layer.msg(errMsg);
        } else {
            var url = "/clbs/m/functionconfig/fence/bindfence/saveBindFence";
            var parameter = {"data": JSON.stringify(arr)};
            json_ajax("POST", url, "json", true, parameter, fenceOperation.saveBindCallback);
        }
        // 清空勾选框
        vehicleFenceList = "";
    },
    fenceCancelBtnClick: function () {
      // 清空勾选框
        vehicleFenceList = "";
        $("#fenceBind").modal('hide');
        myTable.filter();
    },
    //保存围栏绑定回调方法
    saveBindCallback: function (data) {
        if (data != null) {
            if (data.success) {
                if (data.obj.flag == 1) {
                    $("#fenceBind").modal('hide');
                    var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
                    fenceOperation.getcheckFenceNode(zTree);
                    myTable.filter();
                    layer.msg(fenceOperationFenceBoundSuccess, {closeBtn: 0}, function () {
                        layer.close();
                    });
                } else if (data.obj.flag == 2) {
                    // layer.msg(data.obj.errMsg,{move:false});
                    layer.alert(data.obj.errMsg, {
                        id: "promptMessage"
                    });
                }
            } else {
                layer.msg(data.msg, {move: false});
            }
        }
    },
    //比较时间大小 a > b true
    compareDate: function (a, b) {
        var dateA = new Date(a);
        var dateB = new Date(b);
        if (isNaN(dateA) || isNaN(dateB)) {
            return false;
        }
        if (dateA > dateB) {
            return true;
        } else {
            return false;
        }
    },
    TabCarBox: function () {
        monitoringObjMapHeight = $("#MapContainer").height();
        $("#carInfoTable").hide();
        $("#dragDIV").hide();
        $("#fenceBindTable").show();
        var bingLength = $('#dataTableBind tbody tr').length;
        var treeObj = $.fn.zTree.getZTreeObj("fenceDemo");
        var checkNode = treeObj.getCheckedNodes(true);
        if (checkNode.length == 0) {
            $("#MapContainer").css("height", newMapHeight + 'px');
        } else {
            if ($('#bingListClick i').hasClass('fa fa-chevron-down')) {
                if (bingLength == 0) {
                    $("#MapContainer").css("height", newMapHeight + 'px');
                } else {
                    $("#MapContainer").css('height', (newMapHeight - 80 - 44 * bingLength - 105) + 'px');
                }
                ;
            } else {
                $("#MapContainer").css("height", newMapHeight + 'px');
            }
            ;
        }
        ;
        // 订阅电子围栏
        if (clickFenceCount == 0) {
            webSocket.subscribe(headers,'/topic/fencestatus', fenceOperation.updataFenceData,"", null);
        }
        ;
        clickFenceCount = 1;
    },
    TabFenceBox: function () {
        $("#dragDIV").show();
        $("#MapContainer").css('height', monitoringObjMapHeight + 'px');
        $("#carInfoTable").show();
        $("#fenceBindTable").hide();
        $("body").css("overflow", 'hidden');
        $(document).scrollTop(0);
    },
    parametersTrace: function (data) {
        if (data.success) {
            layer.msg("开始跟踪！");
            $("#goTrace").modal("hide");
        } else {
            layer.msg(data.msg);
        }
    },
    updataFenceData: function (msg) {
        if (msg != null) {
            var result = $.parseJSON(msg.body);
            if (result != null) {
                myTable.refresh();
            }
        }
    },
    // 下发围栏 （单个）
    sendFenceOne: function (id, paramId, vehicleId, fenceId) {
        var arr = [];
        var obj = {};
        obj.fenceConfigId = id;
        obj.paramId = paramId;
        obj.vehicleId = vehicleId;
        obj.fenceId = fenceId
        arr.push(obj);
        var jsonStr = JSON.stringify(arr);
        fenceOperation.sendFence(jsonStr);
    },
    // 下发围栏
    sendFence: function (sendParam) {
        var url = "/clbs/m/functionconfig/fence/bindfence/sendFence";
        var parameter = {"sendParam": sendParam};
        json_ajax("POST", url, "json", true, parameter, fenceOperation.sendFenceCallback);
    },
    // 围栏下发回调
    sendFenceCallback: function (data) {
        layer.msg(fenceOperationFenceIssue, {closeBtn: 0}, function (refresh) {
            //取消全选勾
            $("#checkAll").prop('checked', false);
            $("input[name=subChk]").prop("checked", false);
            myTable.refresh(); //执行的刷新语句
            layer.close(refresh);
        });
    },
    //数据表格围栏显示
    tableFence: function (id) {
        var treeObj = $.fn.zTree.getZTreeObj("fenceDemo");
        var nodesArray = [];
        var nodes = treeObj.getNodeByParam("id", id, null);
        nodesArray.push(nodes);
        fenceOperation.getFenceDetail(nodesArray, map);
    },
    // 批量下发
    sendModelClick: function () {
        //判断是否至少选择一项
        var chechedNum = $("input[name='subChk']:checked").length;
        if (chechedNum == 0) {
            layer.msg(fenceOperationDataNull);
            return
        }
        var checkedList = new Array();
        $("input[name='subChk']:checked").each(function () {
            var jsonStr = $(this).val();
            var jsonObj = $.parseJSON(jsonStr);
            checkedList.push(jsonObj);
        });
        // 下发
        fenceOperation.sendFence(JSON.stringify(checkedList));
    },
    //批量删除
    delModelClick: function () {
        //判断是否至少选择一项
        var chechedNum = $("input[name='subChk']:checked").length;
        if (chechedNum == 0) {
            layer.msg(fenceOperationDataNull);
            return
        }
        var checkedList = new Array();
        $("input[name='subChk']:checked").each(function () {
            var jsonStr = $(this).val();
            var jsonObj = $.parseJSON(jsonStr);
            checkedList.push(jsonObj.fenceConfigId);
        });
        myTable.deleteItems({
            'deltems': checkedList.toString()
        });
    },
    //跟踪
    goTrace: function (id) {
        parametersID = id;top
        var listParameters = [];
        listParameters.push(parametersID);
        var validity = $("#validity").val();
        var interval = $("#interval").val();
        listParameters.push(interval);
        listParameters.push(validity);
        var url = "/clbs/v/monitoring/parametersTrace";
        var parameters = {"parameters": listParameters};
        ajax_submit("POST", url, "json", true, parameters, true, fenceOperation.parametersTrace);
        setTimeout("dataTableOperation.logFindCilck()", 500);
    },
    //F3跟踪
    goF3Trace: function (id) {
        parametersID = id;
        var validity = $("#validity").val();
        var interval = $("#interval").val();
        var url = "/clbs/v/monitoringLong/sendParam";
        var parameters = {"vid": parametersID, "longValidity": validity, "longInterval": interval, "orderType": 19};
        ajax_submit("POST", url, "json", true, parameters, true, fenceOperation.parametersTrace);
        setTimeout("dataTableOperation.logFindCilck()", 500);
    },
    // 围栏绑定列表模糊搜索
    searchBindTable: function () {
        myTable.filter();
    },
    //修改矩形取消
    rectangleEditClose: function () {
        mouseTool.close(true);
        mouseToolEdit.close(true);
    },
    //更新围栏预处理函数
    ajaxFenceDataFilter: function (treeId, parentNode, responseData) {
        if (responseData) {
            for (var i = 0; i < responseData.length; i++) {
                responseData[i].open = false;
                if (responseData[i].type == "fence" && fenceIdArray.indexOf(responseData[i].id) != -1) {
                    responseData[i].checked = true;
                }
                ;
                if (responseData[i].type == "fenceParent" && fenceOpenArray.indexOf(responseData[i].id) != -1) {
                    responseData[i].open = true;
                }
                ;
                if (responseData[i].type == "fenceParent" && responseData[i].id == saveFenceType) {
                    responseData[i].open = true;
                }
                ;
            }
            ;
        }
        ;
        return responseData;
    },
    //更新围栏成功函数
    zTreeOnAsyncFenceSuccess: function (event, treeId, treeNode, msg) {
        var rectang_fenceId = $("#rectangleId").val();
        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
        var nodes = zTree.getNodesByParam("id", rectang_fenceId, null);
        if (nodes.length != 0) {
            fenceOperation.getFenceDetail(nodes, map);
        }
        ;
        $("#rectangleId").val('');
        var fenceNode = zTree.getNodesByParam('id', saveFenceType, null);
        if (fenceNode != undefined && fenceNode != null && fenceNode.length > 0) {
            var childrenNode = fenceNode[0].children;
            if (childrenNode != undefined) {
                for (var i = 0, len = childrenNode.length; i < len; i++) {
                    if (saveFenceName == childrenNode[i].name) {
                        zTree.checkNode(childrenNode[i], true, true);
                        zTree.selectNode(childrenNode[i]); //选中第一个父节点下面第一个子节点
                        fenceCheckLength = zTree.getCheckedNodes(true).length;
                        childrenNode[i].checkedOld = true;
                        fenceOperation.getFenceDetail([childrenNode[i]], map);
                    }
                    ;
                }
                ;
            }
            ;
        }
        ;
    },
    //标注取消
    markFenceClose: function () {
        mouseTool.close(true);
        var markFenceID = $("#markerId").val();
        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
        var nodes = zTree.getNodesByParam("id", markFenceID, null);
        fenceOperation.getFenceDetail(nodes, map);
    },
    moveMarker: function (e) {
        $("#addOrUpdateMarkerFlag").val("1"); // 修改标注，给此文本框赋值为1
        $("#markerId").val(moveMarkerFenceId); // 标注id
        // 标注修改框弹出时给文本框赋值
        $("#markerName").val(moveMarkerBackData.name);
        $("#markerType").val(moveMarkerBackData.type);
        $("#markerDescription").val(moveMarkerBackData.description);
        $("#mark-lng").attr("value", e.lnglat.lng);
        $("#mark-lat").attr("value", e.lnglat.lat);
        pageLayout.closeVideo();
        $('#mark').modal('show');
        polyFence.off("mouseup", fenceOperation.moveMarker);
    },
    //线路取消
    lineEditClose: function () {
        mouseTool.close(true);
        map.off("rightclick", amendLine);
        var lineFenceID = $("#lineId").val();
        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
        var nodes = zTree.getNodesByParam("id", lineFenceID, null);
        fenceOperation.getFenceDetail(nodes, map);
    },
    //圆取消
    circleFenceClose: function () {
        mouseTool.close(true);
        var circleFenceID = $("#circleId").val();
        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
        var nodes = zTree.getNodesByParam("id", circleFenceID, null);
        fenceOperation.getFenceDetail(nodes, map);
    },
    //多边形取消
    polygonFenceClose: function () {
        mouseTool.close(true);
        var polygonFenceID = $("#polygonId").val();
        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
        var nodes = zTree.getNodesByParam("id", polygonFenceID, null);
        fenceOperation.getFenceDetail(nodes, map);
    },
    //数组大小排序
    sortNumber: function (a, b) {
        return a - b;
    },
    // 报警区分平台
    alarmSourceCheck: function (fencetype, alarmSourceName) {
        if (fencetype == "zw_m_administration" || fencetype == "zw_m_travel_line") {
            return "<td id = 'alarmSource'><input type='radio' disabled value = 0 name='" + alarmSourceName + "' id='" + alarmSourceName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + alarmSourceName + "'>终端报警</label><input type='radio' value = 1 checked='checked' name='" + alarmSourceName + "' id='" + alarmSourceName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + alarmSourceName + "s'>平台报警</label></td>"
        } else {
            return "<td id = 'alarmSource'><input type='radio' value = 0 checked='checked' name='" + alarmSourceName + "' id='" + alarmSourceName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + alarmSourceName + "'>终端报警</label><input type='radio' value = 1 name='" + alarmSourceName + "' id='" + alarmSourceName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + alarmSourceName + "s'>平台报警</label></td>"
        }
    },
    sendFenceTypeTd: function (fencetype, sendFenceTypeName) {
        if (fencetype != "zw_m_line" && fencetype != "zw_m_polygon" && fencetype != "zw_m_travel_line" && fencetype != "zw_m_administration") {
            return "<td id = 'sendFenceType'><input type='radio' value = 0 checked name='" + sendFenceTypeName + "' id='" + sendFenceTypeName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + sendFenceTypeName + "'>更新</label><input type='radio' value = 1 name='" + sendFenceTypeName + "' id='" + sendFenceTypeName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + sendFenceTypeName + "s'>追加</label><input type='radio' value = 2 name='" + sendFenceTypeName + "' id='" + sendFenceTypeName + "ss'><label style='margin-bottom:0px;cursor:pointer' for='" + sendFenceTypeName + "ss'>修改</label></td>";
        } else {
            return "<td id = 'sendFenceType'><input type='radio' disabled value = 0 checked name='" + sendFenceTypeName + "'>更新</td>"
        }
    },
    //判断绑定详细列表中行驶时间阈值过长或者不足是否需要填写
    travelLongAndSmallTime: function (fencetype) {
        if (fencetype == "zw_m_line" || fencetype == "zw_m_travel_line") {
            return "<td id='travelLongTime'><input type= 'text' name = 'travelLongTime' class='form-control' onkeyup=\"value=value.replace(/[^\\d]/g,'')\" /></td>" + "<td id='travelSmallTime'><input type= 'text' name = 'travelSmallTime' class='form-control' onkeyup=\"value=value.replace(/[^\\d]/g,'')\" /></td>";
        } else {
            return "<td id='travelLongTime'></td>" + "<td id='travelSmallTime'></td>";
        }
    },
    //判断绑定详细列表中最后三项是否需要显示
    otherInfo: function (fencetype, openDoorName, communicationFlagName, GNSSFlagName) {
        if (fencetype != "zw_m_line" && fencetype != "zw_m_travel_line") {
            return "<td id = 'openDoor'><input type='radio' value = 0 checked name='" + openDoorName + "' id='" + openDoorName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + openDoorName + "'>是</label><input type='radio' value =1 name='" + openDoorName + "' id='" + openDoorName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + openDoorName + "s'>否</lebal></td>"
                + "<td id = 'communicationFlag'><input type='radio'  value = 0 checked name='" + communicationFlagName + "' id='" + communicationFlagName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + communicationFlagName + "'>是</label><input type='radio'  value = 1 name='" + communicationFlagName + "' id='" + communicationFlagName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + communicationFlagName + "s'>否</lebal></td>"
                + "<td id = 'GNSSFlag'><input type='radio' value = 0 checked name='" + GNSSFlagName + "' id='" + GNSSFlagName + "'><label style='margin-bottom:0px;cursor:pointer' for='" + GNSSFlagName + "'>是</label><input type='radio' value = 1 name='" + GNSSFlagName + "' id='" + GNSSFlagName + "s'><label style='margin-bottom:0px;cursor:pointer' for='" + GNSSFlagName + "s'>否</lebal></td>";
        } else {
            return "<td id = 'openDoor'></td>"
                + "<td id = 'communicationFlag'></td>"
                + "<td id = 'GNSSFlag'></td>";
        }
    },
    //收缩绑定列表
    bingListClick: function () {
        if ($(this).children('i').hasClass('fa-chevron-down')) {
            $(this).children('i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
            $("#MapContainer").animate({'height': newMapHeight + "px"});
        } else {
            $(this).children('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
            var trLength = $('#dataTableBind tbody tr').length;
            $("#MapContainer").animate({'height': (winHeight - 80 - trLength * 46 - 220) + "px"});
        }
        ;
    },
    addaskQuestions: function () {
        addaskQuestionsIndex++;
        var html = '<div class="form-group" id="answer-add_' + addaskQuestionsIndex + '"><label class="col-md-3 control-label">答案：</label><div class="col-md-5"><input type="text" placeholder="请输入答案" class="form-control" name="value" id=""/><label class="error">请输入答案</label></div><div class="col-md-1"><button type="button" class="btn btn-danger answerDelete deleteIcon"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button></div></div>';
        $("#answer-add-content").append(html);
        $(".answerDelete").on("click", function () {
            $(this).parent().parent().remove();
        });
    },
    //分段限速取消
    sectionRateLimitingClose: function (id) {
        fenceOperation.clearErrorMsg();
        var sectionLineID
        if (typeof(id) === 'object') {
            sectionLineID = $("#lineIDms1").attr("value");
        } else {
            sectionLineID = id;
        }
        ;
        if (sectionMarkerPointArray.containsKey(sectionLineID)) {
            var thisValue = sectionMarkerPointArray.get(sectionLineID);
            thisValue[1] = false;
            sectionMarkerPointArray.remove(sectionLineID);
        }
        ;
        if (fenceSectionPointMap.containsKey(sectionLineID)) {
            fenceSectionPointMap.remove(sectionLineID);
        }
        ;
        if (sectionPointMarkerMap.containsKey(sectionLineID)) {
            var pointArray = sectionPointMarkerMap.get(sectionLineID);
            map.remove(pointArray);
            sectionPointMarkerMap.remove(sectionLineID);
            $("#tenples").html('');
            $("#pagecontent").html('');
        }
        ;
    },
    //围栏详情
    fenceDetails: function (data) {
        var fenceData = data[0].fenceData;
        var fenceType = data[0].fenceType;
        var detailsFenceShape = fenceOperation.fencetypepid(fenceType);
        var detailsFenceName;
        var detailsFenceType;
        var detailsFenceCreateName;
        var detailsFenceCreateTime;
        if (fenceType == 'zw_m_line') {
            detailsFenceType = data[0].line.type;
            detailsFenceDescribe = data[0].line.description;
            if (detailsFenceDescribe == "" || detailsFenceDescribe == null) {
                detailsFenceDescribe = "无任何描述"
            }
            detailsFenceCreateName = data[0].line.createDataUsername;
            detailsFenceCreateTime = data[0].line.createDataTime;
        } else if (fenceType == 'zw_m_polygon') {
            detailsFenceType = data[0].polygon.type;
            detailsFenceDescribe = data[0].polygon.description;
            if (detailsFenceDescribe == "" || detailsFenceDescribe == null) {
                detailsFenceDescribe = "无任何描述"
            }
            detailsFenceCreateName = data[0].polygon.createDataUsername;
            detailsFenceCreateTime = data[0].polygon.createDataTime;
        } else if (fenceType == "zw_m_administration") {
            detailsFenceType = "行政区域";
            detailsFenceDescribe = data[0].administration.description == '' ? '无任何描述' : data[0].administration.description;
            detailsFenceCreateName = data[0].administration.createDataUsername;
            detailsFenceCreateTime = data[0].administration.createDataTime;
        } else if (fenceType == "zw_m_travel_line") {
            detailsFenceShape = '导航路线';
            detailsFenceType = data[0].travelLine.lineType;
            detailsFenceCreateName = data[0].travelLine.createDataUsername;
            detailsFenceCreateTime = data[0].travelLine.createDataTime;
            detailsFenceDescribe = data[0].travelLine.description;
        } else {
            detailsFenceType = fenceData.type;
            detailsFenceCreateName = fenceData.createDataUsername;
            detailsFenceCreateTime = fenceData.createDataTime;
            detailsFenceDescribe = fenceData.description == '' ? '无任何描述' : fenceData.description;
        }
        ;
        $("#detailsFenceShape").text(detailsFenceShape);
        $("#detailsFenceType").text(detailsFenceType);
        $("#detailsFenceCreateName").text(detailsFenceCreateName);
        $("#detailsFenceCreateTime").text(detailsFenceCreateTime);
        $("#detailsFenceDescribe").text(detailsFenceDescribe);
    },
    //清空围栏绑定
    clearFenceBind: function () {
        $("#searchVehicle").val('');
        $("#tableList tbody").html('');
    },
    //添加拐点
    addLngLat: function () {
        var id = $(this).parent('.sectionLngLat').parent('div').parents('div').attr('id');
        var thisArea = $(this).parent('div.sectionLngLat').clone(true);
        var lastSectionLngLat = $(this).parent('.sectionLngLat').parent('div').children('.sectionLngLat:last-child');
        var this_lng_id = lastSectionLngLat.children('.sectionLng').children('input').attr('id') + 1;
        var this_lat_id = lastSectionLngLat.children('.sectionLat').children('input').attr('id') + 1;
        thisArea.children('div.sectionLng').children('input').attr('value', '').val('').attr('id', this_lng_id).siblings('label.error').remove();
        thisArea.children('div.sectionLat').children('input').attr('value', '').val('').attr('id', this_lat_id).siblings('label.error').remove();
        thisArea.children('button').attr('class', 'btn btn-danger removeLngLat').children('span').attr('class', 'glyphicon glyphicon-trash');
        $("#" + id).children('div.pointList').append(thisArea);
        $(".removeLngLat").unbind("click").bind("click", fenceOperation.removeLngLat);
    },
    //删除拐点
    removeLngLat: function () {
        $(this).parent('.sectionLngLat').remove();
    },
    //是否显示拐点
    isQueryShow: function () {
        if ($(this).next('div.pointList').is(':hidden')) {
            $(this).children('label').children('span').attr('class', 'fa fa-chevron-down');
            $(this).next('div.pointList').slideDown();
        } else {
            $(this).children('label').children('span').attr('class', 'fa fa-chevron-up');
            $(this).next('div.pointList').slideUp();
        }
        ;
    },
    //围栏经纬度区域显示
    lngLatTextShow: function () {
        var $pointList = $(this).parent('div').next('div.pointList');
        if ($pointList.is(':hidden')) {
            $(this).children('span').attr('class', 'fa fa-chevron-down');
            $pointList.slideDown();
        } else {
            $(this).children('span').attr('class', 'fa fa-chevron-up');
            $pointList.slideUp();
        }
        ;
    },
    //行政区域选择
    administrativeAreaSelect: function (obj) {
        var provin = $("#province").val();
        if (provin == "province") {
            $("#provinceError").css("display", "none");
        }
        else if (provin == "--请选择--") {
            $("#provinceError").css("display", "block");
        }
        for (var i = 0, l = administrativeAreaFence.length; i < l; i++) {
            administrativeAreaFence[i].setMap(null);
        }
        var option = obj[obj.options.selectedIndex];
        var keyword = option.text; //关键字
        var adcode = option.adcode;
        district.setLevel(option.value); //行政区级别
        district.setExtensions('all');
        //行政区查询
        //按照adcode进行查询可以保证数据返回的唯一性
        district.search(adcode, function (status, result) {
            if (status === 'complete') {
                fenceOperation.getData(result.districtList[0]);
            }
        });
    },
    //行政区域选择后数据处理
    getData: function (data) {
        var bounds = data.boundaries;
        if (bounds) {
            $('#administrativeLngLat').val(bounds.join('-'));
            for (var i = 0, l = bounds.length; i < l; i++) {
                var polygon = new AMap.Polygon({
                    map: map,
                    strokeWeight: 1,
                    strokeColor: '#CC66CC',
                    fillColor: '#CCF3FF',
                    fillOpacity: 0.5,
                    path: bounds[i]
                });
                administrativeAreaFence.push(polygon);
                map.setFitView(polygon);//地图自适应
            }
            ;
        }
        ;
        var subList = data.districtList;
        var level = data.level;
        //清空下一级别的下拉列表
        if (level === 'province') {
            document.getElementById('city').innerHTML = '';
            document.getElementById('district').innerHTML = '';
        } else if (level === 'city') {
            document.getElementById('district').innerHTML = '';
        } else if (level === 'district') {
        }
        if (subList) {
            var contentSub = new Option('--请选择--');
            for (var i = 0, l = subList.length; i < l; i++) {
                var name = subList[i].name;
                var levelSub = subList[i].level;
                if (levelSub == 'street') {
                    return false;
                }
                ;
                var cityCode = subList[i].citycode;
                if (i == 0) {
                    document.querySelector('#' + levelSub).add(contentSub);
                }
                contentSub = new Option(name);
                contentSub.setAttribute("value", levelSub);
                contentSub.center = subList[i].center;
                contentSub.adcode = subList[i].adcode;
                document.querySelector('#' + levelSub).add(contentSub);
            }
        }
    },
    //行政区域保存
    administrativeSave: function () {
        var province = $("#province").find('option:selected').text();
        $("#provinceVal").val(province);
        var city = $("#city").find('option:selected').text();
        $("#cityVal").val(city);
        var district = $("#district").find('option:selected').text();
        $("#districtVal").val(district);
        var provin = $("#province").val();
        if (provin == "--请选择--") {
            $("#provinceError").css("display", "block");
            return false;
        }
        if (fenceOperation.validate_administration()) {
            $("#administrativeSave").attr("disabled", "disabled");
            $("#administrativeSave").text("保存中");
            layer.load(2);
            $("#administration").ajaxSubmit(function (data) {
                var datas = eval("(" + data + ")");
                if (datas.success == true) {
                    layer.closeAll('loading');
                    $("#administrativeArea").modal("hide");
                    saveFenceName = $('#administrationName').val();
                    saveFenceType = 'zw_m_administration';
                    $(".fenceA").removeClass("fenceA-active");
                    mouseTool.close(true);
                    fenceOperation.addNodes();
                    $("#administrationName").val("");
                    $("#administrationDistrict").val("");
                    $("#administrativeSave").text("保存");
                    $("#administrativeSave").removeAttr("disabled");
                    fenceOperation.administrativeClose();
                } else {
                    if (datas.msg == null) {
                        $("#administrativeSave").text("保存");
                        $("#administrativeSave").removeAttr("disabled");
                        layer.msg(fenceOperationJudgementASExist);
                    } else {
                        layer.msg(datas.msg, {move: false});
                    }
                }
            });
        }
    },
    //行政区域添加时验证
    validate_administration: function () {
        return $("#administration").validate({
            rules: {
                province: {
                    required: true,

                },
                name: {
                    required: true,
                    maxlength: 20
                },
                description: {
                    maxlength: 50
                },
                groupName: {
                    required: true
                }
            },
            messages: {
                name: {
                    required: areaNameNull,
                    maxlength: publicSize20
                },
                description: {
                    maxlength: publicSize50
                },
                groupName: {
                    required: publicSelectGroupNull
                }
            }
        }).form();
    },
    //行政区域取消
    administrativeClose: function () {
        for (var i = 0, l = administrativeAreaFence.length; i < l; i++) {
            administrativeAreaFence[i].setMap(null);
        };
        $("#provinceError").hide();
    },
    //显示行政区域
    drawAdministration: function (data, aId, showMap) {
        var polygonAarry = [];
        if (administrationMap.containsKey(aId)) {
            var this_fence = administrationMap.get(aId);
            map.remove(this_fence);
            administrationMap.remove(aId);
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
            administrativeAreaFence.push(polygon);
        }
        ;
        administrationMap.put(aId, polygonAarry);
        map.setFitView(polygon);//地图自适应
    },
    //添加途经点
    addWayToPoint: function (msg) {
        var length = $('#wayPointArea').children('div').length;
        var searchId = 'wayPoint' + (length + 1);
        var html = '<div class="form-group">'
            + '<div class="col-md-10">'
            + '<input type="text" id="' + searchId + '" placeholder="请输入途经点" class="form-control wayPoint" name="wayPoint" />'
            + '</div>'
            + '<button type="button" class="btn btn-danger padBottom deleteWayPoint"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>'
            + '</div>';
        $(html).appendTo($('#wayPointArea'));
        $('#' + searchId).inputClear().on('onClearEvent', fenceOperation.wayPointInputClear);
        if (Array.isArray(msg)) {
            $('#' + searchId).val(msg[0]).attr('data-address', msg[0]).attr('data-lnglat', msg[2]);
        }
        ;
        var wayPoint = new AMap.Autocomplete({
            input: searchId
        });
        wayPoint.on('select', fenceOperation.dragRoute);
        $('.deleteWayPoint').off('click').on('click', fenceOperation.deleteWayPoint);
    },
    //途经点删除
    deleteWayPoint: function () {
        $(this).parent('div.form-group').remove();
        fenceOperation.dragRoute(null);
    },
    //隐藏区域划分
    hideFence: function (id) {
        if (administrationMap.containsKey(id)) {
            var this_fence = administrationMap.get(id);
            map.remove(this_fence);
            administrationMap.remove(id);
        }
        ;
        //行驶路线travelLineMap
        if (travelLineMap.containsKey(id)) {
            var this_fence = travelLineMap.get(id);
            map.remove(this_fence);
            travelLineMap.remove(id);
        }
        ;
    },
    //路径规划
    dragRoute: function (data) {
        var addressArray = [];
        if (data != null && data != 'drag') {
            var this_input_id = $(this)[0].input.id;
            $("#" + this_input_id).attr('data-address', data.poi.district + data.poi.name).removeAttr('data-lnglat');
        }
        ;
        var startAddress = $('#startPoint').attr('data-address');
        var start_lnglat = $('#startPoint').attr('data-lnglat');
        var endAddress = $('#endPoint').attr('data-address');
        var end_lnglat = $('#endPoint').attr('data-lnglat');
        if (startAddress != '' && endAddress != '' && startAddress != undefined && endAddress != undefined) {
            if (lineRoute != undefined) {
                lineRoute.destroy();//销毁拖拽导航插件
            }
            ;
            if (start_lnglat != undefined) {
                addressArray.push(start_lnglat);
            } else {
                addressArray.push(startAddress);
            }
            ;
            $('#wayPointArea input').each(function () {
                var this_value = $(this).val();
                if (this_value != '') {
                    var value = $(this).attr('data-address');
                    var lnglat = $(this).attr('data-lnglat');
                    if (lnglat != undefined) {
                        addressArray.push(lnglat);
                    } else {
                        addressArray.push(value);
                    }
                    ;
                } else {
                    $(this).parent('div').parent('div').remove();
                }
                ;
            });
            if (end_lnglat != undefined) {
                addressArray.push(end_lnglat);
            } else {
                addressArray.push(endAddress);
            }
            ;
            var lngLatArray = [];
            fenceOperation.getAddressLngLat(addressArray, 0, lngLatArray);
        }
        ;
    },
    //地理编码
    getAddressLngLat: function (addressArray, index, lngLatArray) {
        var this_address = addressArray[index];
        if (fenceOperation.isChineseChar(this_address)) {
            var geocoder = new AMap.Geocoder({
                city: "全国", //城市，默认：“全国”
                radius: 500 //范围，默认：500
            });
            geocoder.getLocation(this_address);
            geocoder.on('complete', function (GeocoderResult) {
                if (GeocoderResult.type == 'complete') {
                    var this_lng = GeocoderResult.geocodes[0].location.lng;
                    var this_lat = GeocoderResult.geocodes[0].location.lat;
                    lngLatArray.push([this_lng, this_lat]);
                    index++;
                    if (index == addressArray.length) {
                        fenceOperation.madeDragRoute(lngLatArray);
                    } else {
                        fenceOperation.getAddressLngLat(addressArray, index, lngLatArray);
                    }
                }
                ;
            });
        } else {
            index++;
            lngLatArray.push(this_address.split(';'));
            if (index == addressArray.length) {
                fenceOperation.madeDragRoute(lngLatArray);
            } else {
                fenceOperation.getAddressLngLat(addressArray, index, lngLatArray);
            }
            ;
        }
        ;
    },
    //开始路径规划
    madeDragRoute: function (array) {
        isDragRouteFlag = false;
        map.plugin("AMap.DragRoute", function () {
            lineRoute = new AMap.DragRoute(map, array, AMap.DrivingPolicy.REAL_TRAFFIC); //构造拖拽导航类
            lineRoute.search(); //查询导航路径并开启拖拽导航
            //路径规划完成
            lineRoute.on('complete', fenceOperation.dragRouteComplete);
        });
    },
    //行驶路线关闭
    lineDragRouteClose: function () {
        var dragRouteId = $('#travelLineId').val();
        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
        var node = zTree.getNodeByParam('id', dragRouteId, null);
        fenceOperation.getFenceDetail([node], map);
        fenceOperation.closeDragRoute();
        if (lineRoute != undefined) {
            lineRoute.destroy();
        }
        ;
        fenceOperation.clearLineDragRoute();
        isDragRouteFlag = false;
    },
    //清空行驶路线input
    clearLineDragRoute: function () {
        $('#drivenRoute').hide();
        $('#drivenRoute input').each(function () {
            $(this).val('').attr('data-address', '').removeAttr('data-lnglat');
        });
        $('#wayPointArea').html('');
        $('#dragRouteDescription').val('');
        var start_point = dragPointMarkerMap.get('0');
        var end_point = dragPointMarkerMap.get('2');
        var wayPoint = dragPointMarkerMap.get('1');
        if (start_point != undefined) {
            map.remove([start_point]);
        }
        ;
        if (end_point != undefined) {
            map.remove([end_point]);
        }
        ;
        if (wayPoint != undefined) {
            map.remove([wayPoint]);
        }
        ;
        dragPointMarkerMap.clear();
    },
    //行驶路线保存
    lineDragRouteSave: function () {
        if (isDragRouteFlag) {
            if (fenceOperation.validate_dragRoute()) {
                $("#dragRouteLine").ajaxSubmit(function (data) {
                    var datas = eval("(" + data + ")")
                    if (datas.success == true) {
                        var dragRouteId = $('#travelLineId').val();
                        saveFenceName = $('#dragRouteLineName').val();
                        saveFenceType = 'zw_m_travel_line';
                        var zTree = $.fn.zTree.getZTreeObj("fenceDemo");
                        var node = zTree.getNodeByParam('id', dragRouteId, null);
                        fenceOperation.getFenceDetail([node], map);
                        fenceOperation.closeDragRoute();
                        fenceOperation.addNodes();
                        fenceOperation.clearLineDragRoute();
                        if (lineRoute != undefined) {
                            lineRoute.destroy();//销毁拖拽导航插件
                        }
                        ;
                    } else {
                        if (datas.msg == null) {
                            layer.msg(fenceOperationTravelLineExist);
                        } else {
                            layer.msg(datas.msg, {move: false});
                        }
                    }
                });
            }
        } else {
            layer.msg(fenceOperationTravelLineError);
        }
        ;
    },
    //预览行驶路线
    drawTravelLine: function (data, thisMap, travelLine, wayPointArray) {
        $('#drivenRoute').hide();
        if (lineRoute != undefined) {
            lineRoute.destroy();
        }
        ;
        var lineID = travelLine.id;
        var path = [];
        var start_point_value = [travelLine.startLongitude, travelLine.startLatitude];
        var end_point_value = [travelLine.endLongitude, travelLine.endLatitude];
        var wayValue = [];
        if (wayPointArray != undefined) {
            for (var j = 0, len = wayPointArray.length; j < len; j++) {
                wayValue.push([wayPointArray[j].longitude, wayPointArray[j].latitude]);
            }
            ;
        }
        ;
        for (var i = 0, len = data.length; i < len; i++) {
            path.push([data[i].longitude, data[i].latitude]);
        }
        ;
        if (travelLineMap.containsKey(lineID)) {
            var this_line = travelLineMap.get(lineID);
            map.remove([this_line]);
            travelLineMap.remove(lineID);
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
        travelLineMap.put(lineID, polyFencec);
    },
    //路线规划逆地理编码
    getAddressValue: function (array, index, addressArray) {
        var this_lnglat = array[index];
        var geocoder = new AMap.Geocoder({
            radius: 1000,
            extensions: "all"
        });
        geocoder.getAddress(this_lnglat);
        geocoder.on('complete', function (GeocoderResult) {
            if (GeocoderResult.type == 'complete') {
                var this_address_value = GeocoderResult.regeocode.addressComponent.township
                var this_address = GeocoderResult.regeocode.formattedAddress;
                addressArray.push([this_address, this_address_value]);
                index++;
                if (index == array.length) {
                    // return addressArray;
                    var html = '';
                    for (var i = 1, len = addressArray.length - 1; i < len; i++) {
                        html += '<div class="form-group">'
                            + '<div class="col-md-10">'
                            + '<input type="text" id="wayPoint' + i + '" placeholder="请输入途经点" class="form-control wayPoint" name="wayPoint" />'
                            + '</div>'
                            + '<button type="button" class="btn btn-danger padBottom deleteWayPoint"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>'
                            + '</div>';
                    }
                    ;
                    $('#wayPointArea').html(html);
                    $('#startPoint').val(addressArray[0][0]).attr('data-address', addressArray[0][0]);
                    $('#endPoint').val(addressArray[addressArray.length - 1][0]).attr('data-address', addressArray[addressArray.length - 1][0]);
                    for (var j = 1, len = addressArray.length - 1; j < len; j++) {
                        var id = 'wayPoint' + j;
                        $('#' + id).val(addressArray[j][0]).attr('data-address', addressArray[j][0]).attr('data-lnglat', array[j][0] + ';' + array[j][1]);
                        var wayPoint = new AMap.Autocomplete({
                            input: id
                        });
                        wayPoint.on('select', fenceOperation.dragRoute);
                        $('#' + id).inputClear().on('onClearEvent', fenceOperation.wayPointInputClear);
                    }
                    ;
                    $('.deleteWayPoint').off('click').on('click', fenceOperation.deleteWayPoint);
                } else {
                    fenceOperation.getAddressValue(array, index, addressArray);
                }
            }
            ;
        });
    },
    //路径规划完成回调函数
    dragRouteComplete: function (data) {
        isDragRouteFlag = true;
        fenceOperation.clearPointMarker();
        var dragRouteArray = [];
        var start_lnglat = [data.data.start.location.lng, data.data.start.location.lat];
        var wayPointValue = data.data.waypoints;
        var end_lnglat = [data.data.end.location.lng, data.data.end.location.lat];
        dragRouteArray.push(start_lnglat);
        for (var j = 0, len = wayPointValue.length; j < len; j++) {
            dragRouteArray.push([wayPointValue[j].location.lng, wayPointValue[j].location.lat]);
        }
        ;
        dragRouteArray.push(end_lnglat);
        fenceOperation.getAddressValue(dragRouteArray, 0, []);
        var startToEndLngString = '', startToEndLatString = '', wayPointLngString = '', wayPointLatString = '';
        for (var i = 0, len = dragRouteArray.length; i < len; i++) {
            if (i == 0 || i == len - 1) {
                startToEndLngString += dragRouteArray[i][0] + ';';
                startToEndLatString += dragRouteArray[i][1] + ';';
            } else {
                wayPointLngString += dragRouteArray[i][0] + ';';
                wayPointLatString += dragRouteArray[i][1] + ';';
            }
            ;
        }
        ;
        $('#startToEndLng').val(startToEndLngString);
        $('#startToEndLat').val(startToEndLatString);
        $('#wayPointLng').val(wayPointLngString);
        $('#wayPointLat').val(wayPointLatString);
        //所有点
        var allPointLngLat = lineRoute.getRoute();
        var lngString = '';
        var latString = '';
        for (var i = 0, len = allPointLngLat.length; i < len; i++) {
            lngString += allPointLngLat[i].lng + ';';
            latString += allPointLngLat[i].lat + ';';
        }
        ;
        $('#allPointLng').val(lngString);
        $('#allPointLat').val(latString);
    },
    validate_dragRoute: function () {
        return $("#dragRouteLine").validate({
            rules: {
                name: {
                    required: true,
                    maxlength: 20
                },
                startPoint: {
                    required: true,
                },
                endPoint: {
                    required: true,
                },
                excursion: {
                    required: true,
                    maxlength: 10
                },
                description: {
                    maxlength: 100
                },
                groupName: {
                    required: true
                }
            },
            messages: {
                name: {
                    required: lineNameNull,
                    maxlength: publicSize20
                },
                startPoint: {
                    required: fenceOperationTravelLineStart
                },
                endPoint: {
                    required: fenceOperationTravelLineEnd
                },
                excursion: {
                    required: fenceOperationOffsetNull,
                    maxlength: publicSize10
                },
                description: {
                    maxlength: publicSize100
                },
                groupName: {
                    required: publicSelectGroupNull
                }
            }
        }).form();
    },
    //添加右键菜单
    addItem: function () {
        $('#addOrUpdateTravelFlag').val('0');
        isAddDragRoute = true;
        //创建右键菜单
        var this_point_lnglat;
        contextMenu = new AMap.ContextMenu();
        contextMenu.addItem("<i class='menu-icon menu-icon-from'></i>&nbsp;&nbsp;&nbsp;<span>起点</span>", function (e) {
            fenceOperation.itemCallBack(this_point_lnglat, 0);
        }, 0);
        contextMenu.addItem("<i class='menu-icon menu-icon-via'></i>&nbsp;&nbsp;&nbsp;<span>途经点</span>", function () {
            fenceOperation.itemCallBack(this_point_lnglat, 1);
        }, 1);
        contextMenu.addItem("<i class='menu-icon menu-icon-to'></i>&nbsp;&nbsp;&nbsp;<span>终点</span>", function () {
            fenceOperation.itemCallBack(this_point_lnglat, 2);
        }, 2);
        contextMenu.addItem("<i class='icon-clearmap'></i>&nbsp;&nbsp;&nbsp;<span>清除路线</span>", function () {
            fenceOperation.itemCallBack(this_point_lnglat, 3);
        }, 3);
        //地图绑定鼠标右击事件——弹出右键菜单
        map.on('rightclick', function (e) {
            if (isAddDragRoute) {
                this_point_lnglat = [e.lnglat.lng, e.lnglat.lat];
                contextMenu.open(map, e.lnglat);
                contextMenuPositon = e.lnglat;
            }
            ;
        });
    },
    //右键菜单选择回调函数
    itemCallBack: function (lnglat, type) {
        if (type != 3) {
            var iconType;
            if (type == 0) { // 起点
                iconType = '../../resources/img/start_point.png';
            } else if (type == 1) {// 途经
                iconType = '../../resources/img/mid_point.png';
            } else if (type == 2) {// 终点
                iconType = '../../resources/img/end_point.png';
            }
            ;
            var dragRouteMarker = new AMap.Marker({
                map: map,
                position: lnglat,
                icon: new AMap.Icon({
                    size: new AMap.Size(40, 40),  //图标大小
                    image: iconType
                })
            });
            if (type == 0) {
                if (dragPointMarkerMap.containsKey(type)) {
                    var this_marker = dragPointMarkerMap.get(type);
                    map.remove(this_marker);
                    dragPointMarkerMap.remove(type);
                }
                ;
                dragPointMarkerMap.put(type, dragRouteMarker);
            } else if (type == 2) {
                if (dragPointMarkerMap.containsKey(type)) {
                    var this_marker = dragPointMarkerMap.get(type);
                    map.remove(this_marker);
                    dragPointMarkerMap.remove(type);
                }
                ;
                dragPointMarkerMap.put(type, dragRouteMarker);
            } else if (type == 1) {
                var this_marker_array = [];
                if (dragPointMarkerMap.containsKey(type)) {
                    this_marker_array = dragPointMarkerMap.get(type);
                    dragPointMarkerMap.remove(type);
                }
                ;
                this_marker_array.push(dragRouteMarker);
                dragPointMarkerMap.put(type, this_marker_array);
            }
            ;
            fenceOperation.getAddressOneInfo(lnglat, type);
        } else {
            isDragRouteFlag = false;
            fenceOperation.clearLineDragRoute();
            fenceOperation.addItem();
            if (lineRoute != undefined) {
                lineRoute.destroy();
            }
            ;
            $('#drivenRoute').show();
        }
        ;
    },
    //单独一条信息逆地理编码
    getAddressOneInfo: function (array, type) {
        var arrayString = array[0] + ';' + array[1];
        var geocoder = new AMap.Geocoder({
            city: "全国", //城市，默认：“全国”
            radius: 500 //范围，默认：500
        });
        geocoder.getAddress(array);
        geocoder.on('complete', function (GeocoderResult) {
            if (GeocoderResult.type == 'complete') {
                var this_address_value = GeocoderResult.regeocode.addressComponent.township;
                var this_address = GeocoderResult.regeocode.formattedAddress;
                if (type == 0) {
                    $('#startPoint').val(this_address).attr('data-address', this_address).attr('data-lnglat', arrayString);
                }
                ;
                if (type == 2) {
                    $('#endPoint').val(this_address).attr('data-address', this_address).attr('data-lnglat', arrayString);
                }
                ;
                if (type == 1) {
                    fenceOperation.addWayToPoint([this_address, this_address_value, arrayString]);
                }
                ;
                fenceOperation.dragRoute('drag');
            }
            ;
        });
    },
    //清空右键规划的marker
    clearPointMarker: function () {
        if (dragPointMarkerMap != undefined) {
            if (dragPointMarkerMap.containsKey('0')) {
                var this_marker = dragPointMarkerMap.get('0');
                map.remove([this_marker]);
            }
            ;
            if (dragPointMarkerMap.containsKey('2')) {
                var this_marker = dragPointMarkerMap.get('2');
                map.remove([this_marker]);
            }
            ;
            if (dragPointMarkerMap.containsKey('1')) {
                var this_marker_array = dragPointMarkerMap.get('1');
                map.remove(this_marker_array);
            }
            ;
            dragPointMarkerMap.clear();
        }
        ;
    },
    //关闭路径规划
    closeDragRoute: function () {
        isAddDragRoute = false;
        if (contextMenu != undefined) {
            contextMenu.close();
        }
        ;
        $('#drivenRoute').hide();
    },
    //判断是否还有中文
    isChineseChar: function (str) {
        var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
        return reg.test(str);
    },
    //途经点文本框清除事件
    wayPointInputClear: function (e, data) {
        var id = data.id;
        $('#' + id).attr('data-address', '').removeAttr('data-lnglat');
    },
    //关闭围栏修改功能
    closeFenceEdit: function () {
        fenceOperation.lineDragRouteClose();
        if (polyFence != undefined && polyFence.CLASS_NAME == 'AMap.Marker') {
            polyFence.setDraggable(false);
            polyFence.off("mouseup", fenceOperation.moveMarker);
            polyFence = undefined;
        }
        ;
        mouseToolEdit.close(true);
        var polyEditorArray = PolyEditorMap.values();
        if (Array.isArray(polyEditorArray)) {
            for (var i = 0, len = polyEditorArray.length; i < len; i++) {
                if (Array.isArray(polyEditorArray[i])) {
                    for (var j = 0, fenceLength = polyEditorArray[i].length; j < fenceLength; j++) {
                        polyEditorArray[i][j].close();
                    }
                    ;
                } else {
                    polyEditorArray[i].close();
                }
                ;
            }
            ;
        } else {
            polyEditorArray.close();
        }
        ;
        PolyEditorMap.clear()
    },
    // //围栏所属企业
    // fenceEnterprise: function(){
    //     var setting = {
    //         async : {
    //             url : "/clbs/m/basicinfo/enterprise/professionals/tree",
    //             tyoe : "post",
    //             enable : true,
    //             autoParam : [ "id" ],
    //             contentType : "application/json",
    //             dataType : "json",
    //         },
    //         view : {
    //             dblClickExpand : false
    //         },
    //         data : {
    //             simpleData : {
    //                 enable : true
    //             }
    //         },
    //         callback : {
    //             onClick : fenceOperation.enterpriseonClick
    //         },
    //     };
    //     $.fn.zTree.init($("#markerFenceEnterprise-tree"), setting, null);
    //     $.fn.zTree.init($("#lineFenceEnterprise-tree"), setting, null);
    //     $.fn.zTree.init($("#rectangleFenceEnterprise-tree"), setting, null);
    //     $.fn.zTree.init($("#circleFenceEnterprise-tree"), setting, null);
    //     $.fn.zTree.init($("#polygonFenceEnterprise-tree"), setting, null);
    //     $.fn.zTree.init($("#areaFenceEnterprise-tree"), setting, null);
    //     $.fn.zTree.init($("#dragRouteFenceEnterprise-tree"), setting, null);
    // },
    //属于企业选择
    enterpriseonClick: function (event, treeId, treeNode) {
        var this_tId = treeNode.tId
        if (this_tId.indexOf('markerFenceEnterprise-tree') != -1) {//标注
            $('#markerFenceEnterprise').val(treeNode.name);
            $('#markerGroupId').val(treeNode.id);
            $('#markerFenceEnterprise-content').hide();
        } else if (this_tId.indexOf('lineFenceEnterprise-tree') != -1) {//线
            $('#lineFenceEnterprise').val(treeNode.name);
            $('#lineGroupId').val(treeNode.id);
            $('#lineFenceEnterprise-content').hide();
        } else if (this_tId.indexOf('rectangleFenceEnterprise-tree') != -1) {//矩形
            $('#rectangleFenceEnterprise').val(treeNode.name);
            $('#rectangleGroupId').val(treeNode.id);
            $('#rectangleFenceEnterprise-content').hide();
        } else if (this_tId.indexOf('circleFenceEnterprise-tree') != -1) {//圆形
            $('#circleFenceEnterprise').val(treeNode.name);
            $('#circleGroupId').val(treeNode.id);
            $('#circleFenceEnterprise-content').hide();
        } else if (this_tId.indexOf('polygonFenceEnterprise-tree') != -1) {//多边形
            $('#polygonFenceEnterprise').val(treeNode.name);
            $('#polygonGroupId').val(treeNode.id);
            $('#polygonFenceEnterprise-content').hide();
        } else if (this_tId.indexOf('areaFenceEnterprise-tree') != -1) {//行政区划
            $('#areaFenceEnterprise').val(treeNode.name);
            $('#areaGroupId').val(treeNode.id);
            $('#areaFenceEnterprise-content').hide();
        } else if (this_tId.indexOf('dragRouteFenceEnterprise-tree') != -1) {//行驶路线
            $('#dragRouteFenceEnterprise').val(treeNode.name);
            $('#dragRouteGroupId').val(treeNode.id);
            $('#dragRouteFenceEnterprise-content').hide();
        }
        ;
    },
    //电子围栏预处理的函数
    FenceAjaxDataFilter: function (treeId, parentNode, responseData) {
        if (responseData) {
            for (var i = 0; i < responseData.length; i++) {
                responseData[i].open = false;
            }
        }
        return responseData;
    },
    searchBindFenceTree: function (param) {
        var setQueryChar = {
            async: {
                url: "/clbs/a/search/monitorTreeFuzzy",
                type: "post",
                enable: true,
                autoParam: ["id"],
                dataType: "json",
                sync: false,
                otherParam: {"type": "multiple", "queryParam": param, "webType": "1"},
                dataFilter: fenceOperation.ajaxQueryDataFilter
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
            view: {
                dblClickExpand: false,
                nameIsHTML: true,
                fontCss: setFontCss_ztree,
                countClass: "group-number-statistics"
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                beforeClick: fenceOperation.beforeClickFenceVehicle,
                onAsyncSuccess: fenceOperation.fuzzyZTreeOnAsyncSuccess,
                //beforeCheck: fenceOperation.fuzzyZTreeBeforeCheck,
                onCheck: fenceOperation.fuzzyOnCheckVehicle,
                //onExpand: fenceOperation.zTreeOnExpand,
                //onNodeCreated: fenceOperation.zTreeOnNodeCreated,
            }
        };
        $.fn.zTree.init($("#treeDemoFence"), setQueryChar, null);
    },
    fuzzyZTreeOnAsyncSuccess: function (event, treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("treeDemoFence");
        zTree.expandAll(true);
        // var treeNodes = getAllChildNodes(zTree);
        // if (treeNodes) {
        //     for (var i = 0, l = treeNodes.length; i < l; i++) {
        //         zTree.checkNode(treeNodes[i], false, true);
        //         if ($.inArray(treeNodes[i].id, oldFencevehicleIds) != -1) {
        //             zTree.checkNode(treeNodes[i], true, true);
        //         }
        //     }
        // }
    },
    fuzzyOnCheckVehicle: function (e, treeId, treeNode) {
        //获取树结构
        var zTree = $.fn.zTree.getZTreeObj("treeDemoFence");
        //获取勾选状态改变的节点
        var changeNodes = zTree.getChangeCheckedNodes();
        if (treeNode.checked) { //若是取消勾选事件则不触发5000判断
            var checkedNodes = zTree.getCheckedNodes(true);
            var nodesLength = 0;
            for (var i = 0; i < checkedNodes.length; i++) {
                if (checkedNodes[i].type == "people" || checkedNodes[i].type == "vehicle" || checkedNodes[i].type == "thing") {
                    nodesLength += 1;
                }
            }

            if (nodesLength > 5000) {
                //zTree.checkNode(treeNode,false,true);
                layer.msg(treeMaxLength5000);
                for (var i = 0; i < changeNodes.length; i++) {
                    changeNodes[i].checked = false;
                    zTree.updateNode(changeNodes[i]);
                }
            }
        }
        //获取勾选状态被改变的节点并改变其原来勾选状态（用于5000准确校验）
        for (var i = 0; i < changeNodes.length; i++) {
            changeNodes[i].checkedOld = changeNodes[i].checked;
        }
        // 记录勾选的节点
        var v = "", nodes = zTree.getCheckedNodes(true);
        for (var i = 0, l = nodes.length; i < l; i++) {
            if (nodes[i].type == "vehicle" || nodes[i].type == "people" || nodes[i].type == "thing") {
                v += nodes[i].id + ",";
            }
        }
        vehicleFenceList = v;
    },
    selectDate:function(node){
        var id  = $(node).attr('id');
        laydate.render({elem: '#'+id, theme: '#6dcff6',show: true});
    },
    selectTime:function(node){
        var id  = $(node).attr('id');
        laydate.render({elem: '#'+id, theme: '#6dcff6', type: 'time',show: true});
    }
};


function getAllChildNodes(treeObj) {
    var nodes = new Array();
    var treeNode = treeObj.getNodes();
    getAllChildNodesFn(treeNode, nodes)
    return nodes;
}

function getAllChildNodesFn(treeNode, nodes) {
    $(treeNode).each(function (e, q) {
        if (q.children) {
            getAllChildNodesFn(q.children, nodes);
        } else {
            nodes.push(q);
        }
    })
}
var alarmFanceId = null;
var alarmFanceType = null;
var sendFlag = false;
var alarmTypeList = ['1', '2', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '29', '30', '18', '19', '23', '24', '25', '26'];
// 持续性报警pos,用于实时监控判断报警是否可处理
var continueAlarmsPosList = ["67", "6511", "6512", "6511", "6521", "6522", "6523", "6531", "6532", "6533", "6541", "6542", "6543", "6551", "6552", "6553", "6611", "6612", "6613", "6621", "6622", "6623", "6631", "6632", "6633", "6642", "6642", "6643", "6651", "6652", "6654", "6811", "6812", "6813", "6821", "6822", "6823", "6831", "6832", "6834", "6841", "6842", "6843", "18177", "18178", "18180", "18433", "18434", "18435", "18689", "18691", "18691", "18945", "18946", "18947", "19201", "19202", "19203", "19457", "19458", "19459", "19713", "19714", "19715", "19969", "19970", "19971", "12411", "124", "7012", "7021", "14000", "14001", "14002", "14003", "14004", "14100", "14101", "14102", "14103", "14104", "14105", "14106", "14107", "14108", "14109", "14110", "14112", "14112", "14113", "14114", "14115", "14116", "14117", "14118", "14119", "14120", "14122", "14122", "14123", "14124", "14125", "14126", "14127", "14128", "14129", "14130", "14131", "141000", "14200", "14201", "14202", "14203", "14204", "14205", "14206", "14207", "14208", "14209", "14210", "14211", "14212", "14213", "14214", "14215", "14217", "14217", "14218", "14219", "14220", "14221", "14222", "14223", "14224", "14225", "14226", "14227", "14228", "14229", "14230", "14231", "142000", "14311", "14511", "14521", "14411",
    "12511", "12512", "12513", "12514", "12515", "12516", "12517", "12518",
    "12519", "12520", "12521", "12521", "12523", "12524", "12525", "12526", "12527", "12528", "12529",
    "12530", "12531", "12532", "12533", "12534", "12535", "12536", "12537", "12538", "12539",
    "12539", "12541", "12542", "12611", "12612", "12613", "12614", "12615", "12616", "12616",
    "12618", "12619", "12620", "12621", "12622", "12623", "12624",
    "12625", "12626", "12627", "12628", "12629", "12630", "12631", "12632", "12633", "12634",
    "12635", "12636", "12637", "12638", "12639", "12639", "12641", "12642", "12711", "12712", "12713",
    "12714", "12715", "12716", "12717", "12718", "12719",
    "12720", "12721", "12722", "12723", "12724", "12725", "12726", "13011", "13012", "13013","13211","13212","13213","13214"];
//io报警
var ioAlarmTypeList = ['14100', '14101', '14102', '14103', '14104', '14105', '14106', '14107', '14108', '14109', '14110', '14111', '14112', '14113', '14114',
    '14115', '14116', '14117', '14118', '14119', '14120', '14121', '14122', '14123', '14124', '14125', '14126', '14127', '14128', '14129', '14130', '14131', '14200',
    '14201', '14202', '14203', '14204', '14205', '14206', '14207', '14208', '14209', '14210', '14211', '14212', '14213', '14214', '14215', '14216', '14217', '14218',
    '14219', '14220', '14221', '14222', '14223', '14224', '14225', '14226', '14227', '14228', '14229', '14230', '14231', '14000', '14001', '14002', '14003', '14004',
    '141000', '142000']
//创建报警信息集合信息
var alarmInfoList = new pageLayout.mapVehicle();
var toFixed = function (source, digit, omitZero) {
  if (typeof source === 'string') {
    source = parseFloat(source)
  }
  if (typeof source === 'number') {
    var afterFixed = source.toFixed(digit) //此时 afterFixed 为string类型
    if (omitZero) {
      afterFixed = parseFloat(afterFixed)
    }
    return afterFixed
  }
}
var dataTableOperation = {
  //报警信息(数量显示  声音  闪烁)
  realTimeAlarmInfoCalcFn: function () {
    alarmNum++;
    var alarmLength = $("#alarmTable tbody").find("tr").length;
    alarmNum = alarmLength;
    $("#showAlarmNum").text(alarmNum);
    if (alarmNum > 0) {
      //声音
      if (navigator.userAgent.indexOf('MSIE') >= 0) {
        if ($alarmSoundSpan.hasClass("soundOpen")) {
          $alarmMsgBox.html('<embed id="IEalarmMsg" src="../../file/music/alarm.wav" autostart="true"/>');
        } else {
          $alarmMsgBox.html('<embed id="IEalarmMsg" src=""/>');
        }
      } else {
        if ($alarmSoundSpan.hasClass("soundOpen")) {
          $alarmMsgBox.html('<audio id="alarmMsgAutoOff" src="../../file/music/alarm.wav" autoplay="autoplay"></audio>');
        } else {
          $alarmMsgBox.html('<audio id="alarmMsgAutoOff" src="../../file/music/alarm.wav"></audio>');
        }
      }
      //闪烁
      if ($alarmFlashesSpan.hasClass("flashesOpen")) {
        $showAlarmWinMark.css("background-position", "0px -134px");
        setTimeout(function () {
          $showAlarmWinMark.css("background-position", "0px 0px");
        }, 1500)
      } else {
        $showAlarmWinMark.css("background-position", "0px 0px");
      }
      pageLayout.showAlarmWindow();
    }
  },
  // 实时更新
  updateRealLocation: function (msg) {
    var data = $.parseJSON(msg.body);
    if (data.desc !== "neverOnline") {
      if (data.desc.msgID == 513) {
        var obj = {};
        obj.desc = data.desc;
        var da = {};
        da.msgHead = data.data.msgHead;
        da.msgBody = data.data.msgBody;
        obj.data = da;
        // 状态信息
        dataTableOperation.updateVehicleStatusInfoTable(obj);
      } else {
        var cid = data.data.msgBody.monitorInfo.monitorId;
        if (crrentSubV.isHas(cid)) {
          dataTableOperation.updateVehicleStatusInfoTable(data);
        }
      }
    } else {
      var objInfo = treeMonitoring.searchNeverOnline("treeDemo", data.vid)[0];
      var brand = objInfo.name;
      var objType = objInfo.type;
      if (!cancelList.isHas(brand) && crrentSubName.isHas(brand)) {
        if (objType == "vehicle" || objType == "people" || objType == "thing") {
          var business = (data.business == undefined || data.business === null) ? '' : data.business // 所属企业
              , assignmentName = data.assignmentName // 所属分组
              , groupName = data.groupName // 所属企业
              , objectType = data.objectType == 'default' ? '-' : data.objectType // 对象类型
              , plateColor = (data.plateColor == 'null' || data.plateColor === null) ? '-' : data.plateColor // 车牌颜色
              , deviceNumber = data.deviceNumber // 终端号
              , simNumber = data.simNumber // SIM卡号
              , professionals = data.professionals == 'null' ? '-' : data.professionals // 从业人员

          tdList = [0, brand, '未上线', '-', assignmentName, groupName, (objectType == null || objectType == 'null') ? '-' : objectType, plateColor, deviceNumber, simNumber, professionals, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', objInfo.id];
          dataTableOperation.dataTableList(stateName, tdList, "realTimeStateTable", 'state');
        }
        ;
      }
      ;
    }
    ;
  },
  // 状态信息数据更新
  updateVehicleStatusInfoTable: function (position) {
    var msgBody = position.data.msgBody;
    var msgDesc = position.desc;
    var monitorInfo = msgBody.monitorInfo;

    // 修改已订阅车辆的OBD信息
    var vid=monitorInfo.monitorId;
    var highLight = $("#realTimeStateTable .tableHighlight-blue,#realTimeStateTable .tableHighlight");
    var curId = highLight.find('td').eq(1).data('id');
    if(vid==curId){
        amapOperation.changeObdInfo(position);
    }

    // 监控对象名称
    var mObjectName = msgBody.monitorInfo.monitorName;
    // 定位时间
    var gpsTime = msgBody.gpsTime;
    var serviceGpsTime = 20 + gpsTime.substring(0, 2)
        + "-" + gpsTime.substring(2, 4)
        + "-" + gpsTime.substring(4, 6)
        + " " + gpsTime.substring(6, 8)
        + ":" + gpsTime.substring(8, 10)
        + ":" + gpsTime.substring(10, 12);
    // 服务器时间
    var uploadtime = msgBody.uploadtime;
    var serviceSystemTime = 20 + uploadtime.substring(0, 2)
        + "-" + uploadtime.substring(2, 4)
        + "-" + uploadtime.substring(4, 6)
        + " " + uploadtime.substring(6, 8)
        + ":" + uploadtime.substring(8, 10)
        + ":" + uploadtime.substring(10, 12);
    // 所属分组
    var groupName = msgBody.monitorInfo.assignmentName;
    // 所属企业
    var business = monitorInfo.groupName;
    // 对象类型
    var vehicleType = msgBody.monitorInfo.vehicleType;
    // 车牌颜色
    var plateColor = msgBody.monitorInfo.plateColorName;
    if (plateColor == "null" || plateColor == null) {
      plateColor = '-';
    }
    // 终端号
    var deviceId = msgBody.monitorInfo.deviceNumber;
    // SIM卡号
    var sNumber = msgBody.monitorInfo.simcardNumber;
    // 从业人员
    var professionalsName = msgBody.monitorInfo.professionalsName;
    // ACC
    var acc = msgBody.acc;
    if ((acc + "").length == 1) {
      acc = (acc == 0 ? "关" : "开");
    } else if (acc == "21") {
      acc = "点火静止";
    } else if (acc == "16") {
      acc = "熄火拖车";
    } else if (acc == "1A") {
      acc = "熄火假拖车";
    } else if (acc == "11") {
      acc = "熄火静止";
    } else if (acc == "12") {
      acc = "熄火移动";
    } else if (acc == "22") {
      acc = "点火移动";
    } else if (acc == "41") {
      acc = "无点火静止";
    } else if (acc == "42") {
      acc = "无点火移动";
    } else {
      layer.msg("ACC状态异常");
      return;
    }
    // 行驶状态
    var speed = (msgBody.gpsSpeed == '0' ? '停止' : '行驶');
    // 信号状态
    var signalStateFlag = msgBody.signalState;
    var signalStateFlagDetails = "";
    if (signalStateFlag != null && signalStateFlag != 0) {
      signalStateFlagDetails = dataTableOperation.signalStateFlagAnalysis(signalStateFlag);//获取详情信息
      if (signalStateFlagDetails != "") {
        signalStateFlagDetails = signalStateFlagDetails.substring(0, signalStateFlagDetails.length - 1);//删除字符串最后的“,”
      }
    } else {
      signalStateFlagDetails = '-';
    }

    // 速度
    var speed = msgBody.gpsSpeed;
    // 方向
    var angle = msgBody.direction;
    // 电池电压
    var batteryVoltage = msgBody.batteryVoltage;
    // 信号强度
    var signalStrength = msgBody.signalStrength;
    // 定位方式
    var locationType = msgBody.locationType;
    if (locationType == 1) {
      locationType = "卫星定位";
    } else if (locationType == 2) {
      locationType = "LBS定位";
    } else if (locationType == 3) {
      locationType = "WiFi+LBS定位";
    } else {
      locationType = "-";
    }
    // 当日里程
    var todayMileage = msgBody.dayMileage;
    todayMileage = parseFloat(todayMileage);
    // 总里程
    var allMileage;
    if (msgBody.mileageSensor != undefined && msgBody.mileageSensor != null) {
      allMileage = msgBody.mileageSensor.mileage == null ? 0.0 : msgBody.mileageSensor.mileage;
    } else {
      allMileage = msgBody.gpsMileage == null ? 0.0 : msgBody.gpsMileage;
    }
    // 当日油耗
    var todayFuelConsumption = msgBody.dayOilWear;
    todayFuelConsumption = parseFloat(todayFuelConsumption) / 100.0;
    todayFuelConsumption = todayFuelConsumption.toFixed(2);
    // 总油耗
    var allFuelConsumption;
    if (msgBody.oilExpend !== undefined && msgBody.oilExpend != null && msgBody.oilExpend.length > 0) {
      allFuelConsumption = msgBody.oilExpend[0].allExpend == null ? 0.0 : msgBody.oilExpend[0].allExpend;
    } else {
      allFuelConsumption = msgBody.gpsOil == null ? 0.0 : msgBody.gpsOil;
    }
    allFuelConsumption = allFuelConsumption / 100.0;
    allFuelConsumption = allFuelConsumption.toFixed(2);
    // 油量
    var gpsOil = msgBody.gpsOil;
    // 高程
    var altitude = msgBody.altitude;
    // 记录仪速度
    var grapherSpeed = msgBody.grapherSpeed;
    // 位置信息
    var address = msgBody.positionDescription;
    // 监控对象ID
    var mObjectId = msgBody.monitorInfo.monitorId;

    if (msgBody.durationTime !== undefined && msgBody.durationTime !== null) {
      var speeds = Number(msgBody.gpsSpeed) === 0 ? "停止(" + dataTableOperation.formatDuring(msgBody.durationTime) + ")" : "行驶(" + dataTableOperation.formatDuring(msgBody.durationTime) + ")"
    } else {
      var speeds = Number(msgBody.gpsSpeed) === 0 ? "停止" : "行驶"
    }
    //添加行驶状态
    var drivingStateValue = drivingState.get(msgDesc.deviceId);
    if (drivingStateValue != null && drivingStateValue != undefined) {
      speeds = drivingStateValue + speeds;
      drivingState.remove(msgDesc.deviceId);
    }

    var tableList = [
      0,
      mObjectName,
      serviceGpsTime,
      serviceSystemTime,
      ((groupName == 'null' || groupName == null) ? '-' : groupName),
      ((business == 'null' || business == null) ? '-' : business),
      ((vehicleType == 'null' || vehicleType == null) ? '-' : vehicleType),
      ((plateColor == 'null' || plateColor == null) ? '-' : plateColor),
      deviceId,
      sNumber,
      ((professionalsName == 'null' || professionalsName == null) ? '-' : professionalsName),
      acc,
      speeds,
      signalStateFlagDetails,//信号状态
      speed,
      dataTableOperation.toDirectionStr(angle),
      ((batteryVoltage == 'null' || batteryVoltage == null || batteryVoltage == undefined) ? '-' : batteryVoltage),
      ((signalStrength == 'null' || signalStrength == null || signalStrength == undefined || signalStrength == -1) ? '-' : signalStrength),
      locationType,
      ((todayMileage == 'null' || todayMileage == null) ? 0 : todayMileage),
      ((allMileage == 'null' || allMileage == null) ? 0 : allMileage),
      ((todayFuelConsumption == 'null' || todayFuelConsumption == null) ? 0 : todayFuelConsumption),
      ((allFuelConsumption == 'null' || allFuelConsumption == null) ? 0 : allFuelConsumption),
      ((gpsOil == 'null' || gpsOil == null) ? 0 : gpsOil),
      altitude,
      ((grapherSpeed == 'null' || grapherSpeed == null) ? 0 : grapherSpeed),
      ((address == 'null' || address == null) ? '未定位' : address),
      mObjectId
    ];
    /*var len = tableList.length;
     for (var i = 0; i < len; i++) {
     if (tableList[i] == 'null' || tableList[i] == '' || tableList[i] == null || tableList[i] == undefined) {
     tableList[i] = '-';
     }
     }*/
    // 更新状态信息
    dataTableOperation.updateRow('#realTimeStateTable', realTimeSet, tableList, 'state');
    // 更新信息弹窗信息
    if (msgBody.protocolType == '5') {//北斗天地
      var testInfo = [];//初始标注数据
      var monitorInfo = msgBody.monitorInfo;
      testInfo.push(parseDate2Str(msgBody.gpsTime));//时间
      testInfo.push(monitorInfo.monitorName);
      testInfo.push(((monitorInfo.assignmentName == 'null' || monitorInfo.assignmentName == null) ? '-' : monitorInfo.assignmentName));
      testInfo.push(monitorInfo.deviceNumber);
      testInfo.push(monitorInfo.simcardNumber);
      testInfo.push(msgBody.batteryVoltage);
      testInfo.push(msgBody.signalStrength);
      testInfo.push(msgBody.gpsSpeed);
      testInfo.push(msgBody.altitude);
      testInfo.push(msgBody.latitude);
      testInfo.push(msgBody.longitude);
      testInfo.push("people");
      testInfo.push(monitorInfo.monitorId);
      var angle = msgBody.direction;
      var direction = dataTableOperation.toDirectionStr(angle);
      var latitudeP = msgBody.latitude;//纬度
      var longitudeP = msgBody.longitude;//经度
      var locationType = msgBody.locationType;
      if (locationType == "1") {
        locationType = "北斗";
      } else {
        locationType = "北斗";
      }
      var lnglatXY = [longitudeP, latitudeP];
      var laglatObjct = {'lnglatXYs': lnglatXY};
      var geocoder = new AMap.Geocoder({
        radius: 1000,
        extensions: "all",
        batch: false
      });
      carAddress = msgBody.formattedAddress;
      testInfo.push(angle);//角度
      testInfo.push(msgBody.stateInfo);//状态信息
      testInfo.push((monitorInfo.monitorType == null || monitorInfo.monitorType == 'null' || monitorInfo.monitorType == undefined) ? '0' : monitorInfo.monitorType);//监控对象类型
      testInfo.push(monitorInfo.monitorIcon);//监控对象图标
      testInfo.push(msgBody.dayMileage);//当日里程
      //信息框数据调用
      amapOperation.completeEventHandler(testInfo);
    } else {//车和物
      var testInfo = [];//初始标注数据
      var monitorInfo = msgBody.monitorInfo;
      testInfo.push(monitorInfo.monitorName);//监控对象
      testInfo.push(monitorInfo.vehicleType);//对象类型
      testInfo.push(monitorInfo.assignmentName);//分组
      testInfo.push(monitorInfo.deviceNumber);//终端号
      testInfo.push(monitorInfo.simcardNumber);//SIM卡号
      testInfo.push(msgBody.dayMileage);//当日里程
      testInfo.push((msgBody.gpsMileage == '' || msgBody.gpsMileage == null || msgBody.gpsMileage == undefined) ? 0 : msgBody.gpsMileage);//总里程
      testInfo.push(msgBody.gpsSpeed);//速度
      testInfo.push(acc);//acc
      testInfo.push((msgBody.gpsSpeed == 0 ? '停止' : '行驶'));//行驶状态
      testInfo.push(parseDate2Str(msgBody.gpsTime));//时间
      testInfo.push(msgBody.latitude);//纬度
      testInfo.push(msgBody.longitude);//经度
      testInfo.push(monitorInfo.monitorId);//监控对象id
      testInfo.push((monitorInfo.professionalsName == 'null' ? '-' : monitorInfo.professionalsName));//从业人员
      testInfo.push(plateColor);//车辆颜色
      testInfo.push(dataTableOperation.toDirectionStr(msgBody.direction));//方向(东南西北等)
      testInfo.push(msgBody.positionDescription);//位置
      testInfo.push((msgDesc.msgID == 513 ? 1 : 0));
      testInfo.push(msgBody.status);
      testInfo.push('报警类型');//报警类型
      testInfo.push('');
      testInfo.push(msgBody.altitude);//高程
      testInfo.push(((msgBody.grapherSpeed == 'null' || msgBody.grapherSpeed == null) ? 0 : msgBody.grapherSpeed));//记录仪速度
      testInfo.push(msgBody.direction);//角度
      testInfo.push(monitorInfo.monitorIcon);//图标
      testInfo.push(((monitorInfo.groupName == 'null' || monitorInfo.groupName == null) ? '-' : monitorInfo.groupName));//所属企业
      testInfo.push(monitorInfo.deviceType);//终端类型
      testInfo.push(signalStateFlagDetails === undefined ? "-" : signalStateFlagDetails);
      testInfo.push(msgBody.stateInfo);//状态
      testInfo.push((monitorInfo.monitorType == null || monitorInfo.monitorType == 'null' || monitorInfo.monitorType == undefined) ? '0' : monitorInfo.monitorType);//监控对象类型
      testInfo.push(msgBody.protocolType);//协议类型
      //信息框数据调用
      amapOperation.completeEventHandler(testInfo);
    }
  },
  dateFormat: function (inputTime) {
    var date = new Date(inputTime * 1000);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
  },
  formatDuring: function (mss) {
    var days = parseInt(mss / (1000 * 60 * 60 * 24));
    var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = parseInt((mss % (1000 * 60)) / 1000);
    if (days === 0 && hours === 0 && minutes == 0) {
      return seconds + " 秒 ";
    } else if (days === 0 && hours === 0 && minutes !== 0) {
      return minutes + " 分 " + seconds + " 秒 ";
    } else if (days === 0 && hours !== 0) {
      return hours + " 小时 " + minutes + " 分 " + seconds + " 秒 ";
    } else if (days !== 0) {
      return days + " 天 " + hours + " 小时 " + minutes + " 分 " + seconds + " 秒 ";
    }
  },
  signalStateFlagAnalysis: function (signalStateFlag) {
    var signalStateFlags = signalStateFlag.toString(2);
    signalStateFlags = (Array(32).join(0) + signalStateFlags).slice(-32);//高位补零
    var details = "";
    if (signalStateFlags.substring(31, 32) == 1) {
      details += "近光灯,"
    }
    ;
    if (signalStateFlags.substring(30, 31) == 1) {
      details += "远光灯,"
    }
    ;
    if (signalStateFlags.substring(29, 30) == 1) {
      details += "右转向灯,"
    }
    ;
    if (signalStateFlags.substring(28, 29) == 1) {
      details += "左转向灯,"
    }
    ;
    if (signalStateFlags.substring(27, 28) == 1) {
      details += "制动,"
    }
    ;
    if (signalStateFlags.substring(26, 27) == 1) {
      details += "倒挡,"
    }
    ;
    if (signalStateFlags.substring(25, 26) == 1) {
      details += "雾灯,"
    }
    ;
    if (signalStateFlags.substring(24, 25) == 1) {
      details += "示廊灯,"
    }
    ;
    if (signalStateFlags.substring(23, 24) == 1) {
      details += "喇叭,"
    }
    ;
    if (signalStateFlags.substring(22, 23) == 1) {
      details += "空调开,"
    }
    ;
    if (signalStateFlags.substring(21, 22) == 1) {
      details += "空挡,"
    }
    ;
    if (signalStateFlags.substring(20, 21) == 1) {
      details += "缓速器工作,"
    }
    ;
    if (signalStateFlags.substring(19, 20) == 1) {
      details += "ABS工作,"
    }
    ;
    if (signalStateFlags.substring(18, 19) == 1) {
      details += "加热器工作,"
    }
    ;
    if (signalStateFlags.substring(17, 18) == 1) {
      details += "离合器状态,"
    }
    ;
    return details;
  },

  //若有超速报警、异动报警标识则更新状态列表中的行驶状态
  updateStateInfoByAlarm: function (position) {
    var msgBody = position.data.msgBody;
    var msgDesc = position.desc;
    //超速报警状态名称
    var speedAlarmName = "";
    //超速报警状态值
    var speedAlarmFlag = msgBody.speedAlarmFlag;
    if (speedAlarmFlag != null) {
      switch (speedAlarmFlag) {
        case 0:
          speedAlarmName = "开始超速,";
          break;
        case 1:
          speedAlarmName = "持续超速,";
          break;
        case 2:
        case -2:
          speedAlarmName = "结束超速,";
          break;
        case 10:
          speedAlarmName = "开始夜间超速,";
          break;
        case 11:
          speedAlarmName = "夜间持续超速,";
          break;
        case 12:
        case -12:
          speedAlarmName = "夜间超速结束,";
          break;
      }
    }
    //异动报警状态名称
    var exceptionMoveName = "";
    var exceptionMoveFlag = msgBody.exceptionMoveFlag;
    if (exceptionMoveFlag != null) {
      switch (exceptionMoveFlag) {
        case 0:
          exceptionMoveName = "开始异动,";
          break;
        case 1:
          exceptionMoveName = "持续异动,";
          break;
        case 2:
          exceptionMoveName = "结束异动,";
          break;
      }
    }
    if (speedAlarmName == "" && exceptionMoveName == "") { //若没有相关报警信息则删除行驶状态map中数据
      drivingState.remove(msgDesc.deviceId);
    } else { //若有相关报警数据则储存至行驶状态map中并更新状态信息中的行驶状态
      var drivingStateValue = speedAlarmName + exceptionMoveName;
      //先删除原有数据再存储
      drivingState.remove(msgDesc.deviceId);
      drivingState.put(msgDesc.deviceId, drivingStateValue);
      //获取车辆id
      var checkVehicleId = msgDesc.monitorId;
      dataTableOperation.updateDrivingState(drivingStateValue, checkVehicleId);
      if (speedAlarmFlag < 0 || exceptionMoveFlag < 0) {
        return true;
      }
    }
    return false;
  },

  //更新状态信息中的行驶状态
  updateDrivingState: function (drivingStateValue, vid) {
    if (drivingStateValue != null && drivingStateValue != "" && drivingStateValue != undefined) {
      if (stateName.indexOf(vid) != -1) {
        $("#realTimeStateTable").children("tbody").children("tr").each(function () {
          if ($(this).children("td:nth-child(2)").attr('data-id') == vid) {
            var existValue = $(this).children("td:nth-child(13)").text().split(",");
            //获取最后一个元素，及行驶/停止时长，并组装更新行驶状态
            drivingStateValue = drivingStateValue + existValue[existValue.length - 1];
            $(this).children("td:nth-child(13)").text(drivingStateValue);
          }
          ;
        });
      }
    }
  },
  //解析报警位置信息
  getAlarmAddress: function (vId,latitude,longitude) {
    var vid=vId;
    var url = '/clbs/v/monitoring/address';
    var param = {addressReverse: [latitude, longitude, '', "", 'vehicle']};

    $.ajax({
      type: "POST",//通常会用到两种：GET,POST。默认是：GET
      url: url,//(默认: 当前页地址) 发送请求的地址
      dataType: "json", //预期服务器返回的数据类型。"json"
      async: true, // 异步同步，true  false
      data: param,
      traditional: true,
      timeout: 8000, //超时时间设置，单位毫秒
      success: function (data) {//请求成功
        $('#alarmTable td[data-id="'+vid+'"]').closest('tr').find('td:last-child').html($.isPlainObject(data) ? '未定位' : data);
      },
    });
  },
  // 报警记录数据更新
  updateAlarmInfoTable: function (position) {
    var msgBody = position.data.msgBody;
    var msgDesc = position.desc;
    var monitorInfo = position.data.msgBody.monitorInfo;
    var alarmSource = msgBody.alarmSource;
    //更新行驶状态
    var updateAlarmFlag = dataTableOperation.updateStateInfoByAlarm(position);
    if (updateAlarmFlag) {
      return;
    }
    var monitorId = monitorInfo.monitorId;//监控对象id
    var alarmName = msgBody.alarmName;//报警名称
    var alarmInfo = msgBody.alarmName;//报警名称
    if (alarmInfo.indexOf('异常驾驶行为(疲劳)') != -1) {
      var number = '疲劳 ' + msgBody.gpsAttachInfoList[1].unusualDrive.level;
      alarmInfo = alarmInfo.replace('疲劳', number);
    }
    //判断集合是否为空 (此方法用于地图显示监控对象信息框)
    if (alarmInfoList.isEmpty()) {
      alarmInfoList.put(monitorId, alarmName);
    } else {
      if (alarmInfoList.containsKey(monitorId)) {
        alarmInfoList.remove(monitorId);
        alarmInfoList.put(monitorId, alarmName);
      } else {
        alarmInfoList.put(monitorId, alarmName);
      }
    }

    var monitorName = monitorInfo.monitorName;//监控对象
    var groupName = monitorInfo.assignmentName;//分组名称
    //var addresss = msgBody.formattedAddress;//位置信息
    var addresss = '<a onclick="dataTableOperation.getAlarmAddress(\''+monitorId+'\','+msgBody.latitude+','+msgBody.longitude+')">点击获取位置信息</a>';//位置信息
    var deviceNumber = monitorInfo.deviceNumber;//终端编号
    var simcardNumber = monitorInfo.simcardNumber;//SIM卡号
    var alarmNumber = msgBody.globalAlarmSet;//报警编号
    var msgSN = msgBody.swiftNumber;//流水号

    var plateColor = monitorInfo.plateColor;//车牌颜色
    if (plateColor == "1") {
      plateColor = "蓝色";
    } else if (plateColor == "2") {
      plateColor = "黄色";
    } else if (plateColor == "3") {
      plateColor = "黑色";
    } else if (plateColor == "4") {
      plateColor = "白色";
    } else if (plateColor == "9") {
      plateColor = "其他";
    } else {
      plateColor = ''
    }
    var monitorType = monitorInfo.monitorType;//监控对象类型
    switch (monitorType) {
      case 0:
        monitorType = '车';
        break;
      case 1:
        monitorType = '人';
        break;
      case 2:
        monitorType = '物';
        break;
      default:
        monitorType = '';
        break;
    }
    var professionalsName = monitorInfo.professionalsName;//从业人员
    var fenceType = msgBody.fenceType;//围栏类型
    /*if (fenceType == "zw_m_polygon") {
      fenceType = "多边形";
    } else if (fenceType == "zw_m_rectangle") {
      fenceType = "矩形";
    } else if (fenceType == "zw_m_line") {
      fenceType = "路线";
    } else if (fenceType == "zw_m_circle") {
      fenceType = "圆形";
    } else if (fenceType == "zw_m_administration") {
      fenceType = "行政区划";
    } else {
      fenceType = "";
    }*/
    var fenceName = msgBody.fenceName;//围栏名称
    //报警时间
    var alarmTime;
    var time = msgBody.gpsTime;
    if (time.length == 12) {
      alarmTime = 20 + time.substring(0, 2) + "-" + time.substring(2, 4) + "-" + time.substring(4, 6) + " " +
          time.substring(6, 8) + ":" + time.substring(8, 10) + ":" + time.substring(10, 12);
    } else {
      var alarmPeopleTime = msgDesc.sysTime;
      alarmTime = dataTableOperation.dateFormat(Number(alarmPeopleTime));
    }
    if (addresss == "" || addresss == null || addresss == 'null' || addresss == "[]") {
      addresss = "位置描述获取失败";
    }
    //拼装报警记录表格数据
    var alarm = [
      0,
      monitorName == "" ? "-" : monitorName,
      alarmTime,
      (groupName == "" || groupName == undefined) ? '未绑定分组' : groupName,
      monitorType,
      plateColor,
      alarmName,
      (professionalsName == "null" || professionalsName == null) ? "-" : professionalsName,
       (fenceType == "null" || fenceType == null || fenceType == undefined) ? "-" : fenceType,
      (fenceName == "null" || fenceName == null || fenceName == undefined) ? "-" : fenceName,
      addresss,
      "",
      simcardNumber,
      deviceNumber,
      msgSN,
      alarmNumber,
      alarmSource,
      monitorId
    ];
    dataTableOperation.updateRow('#alarmTable', alarmSet, alarm, 'alarm');
    //紧急报警弹窗
    //if (alarmName.indexOf("紧急报警") >= 0) {
    //var ssh = alarmString;
    //layer.msg('监控对象:' + monitorName + '发出紧急报警!请处理!', {
    //time: 5000,
    //btn: ['处理'],
    //btnAlign: 'c',
    //yes: function (index) {
    //layer.close(index);
    //$('.modal').map(function () {
    //$(this).modal('hide');
    //});
    //setTimeout(function () {
    //dataTableOperation.warningManage('' + ssh + '');
    //}, 50);
//
    //}
    //});
    //}
    //地图右下角报警提示
    dataTableOperation.realTimeAlarmInfoCalcFn();

  },
  distinguishPushAlarmSet: function (alarmSetType, msgBody) {
    //报警数据 围栏名称及类型
    var gpsAttachInfoList = msgBody.gpsAttachInfos;
    if (gpsAttachInfoList != undefined) {
      for (var i = 0; i < gpsAttachInfoList.length; i++) {
        var gpsAttachInfoID = gpsAttachInfoList[i].gpsAttachInfoID;
        // 17 围栏内超速
        if (gpsAttachInfoID == 17) {
          if (gpsAttachInfoList[i].speedAlarm != undefined) {
            var stype = gpsAttachInfoList[i].speedAlarm.type;
            alarmFanceType = dataTableOperation.getAlarmFanceIdAndType(stype);
            var alarmFanceIds = gpsAttachInfoList[i].speedAlarm.lineID;
            if (alarmFanceIds != null && alarmFanceIds != undefined && alarmFanceIds != "") {
              alarmFanceId = dataTableOperation.getFanceNameByFanceIdAndVid(msgBody.vehicleInfo.id, alarmFanceIds);
            }
          }
        }
        // 18 进出围栏
        else if (gpsAttachInfoID == 18) {
          if (gpsAttachInfoList[i].lineOutAlarm != undefined) {
            var ltype = gpsAttachInfoList[i].lineOutAlarm.type;
            alarmFanceType = dataTableOperation.getAlarmFanceIdAndType(ltype);
            var alarmFanceIds = gpsAttachInfoList[i].lineOutAlarm.lineID;
            if (alarmFanceIds != null && alarmFanceIds != undefined && alarmFanceIds != "") {
              alarmFanceId = dataTableOperation.getFanceNameByFanceIdAndVid(msgBody.vehicleInfo.id, alarmFanceIds);
            }
          }
        }
        // 19 过长 不足
        else if (gpsAttachInfoID == 19) {
          if (gpsAttachInfoList[i].timeOutAlarm != undefined) {
            var ttype = gpsAttachInfoList[i].timeOutAlarm.type;
            alarmFanceType = dataTableOperation.getAlarmFanceIdAndType(ttype);
            var alarmFanceIds = gpsAttachInfoList[i].timeOutAlarm.lineID;
            if (alarmFanceIds != null && alarmFanceIds != undefined && alarmFanceIds != "") {
              alarmFanceId = dataTableOperation.getFanceNameByFanceIdAndVid(msgBody.vehicleInfo.id, alarmFanceIds);
            }
          }
        }
      }

    }
  },
  // 围栏类型判断
  getAlarmFanceIdAndType: function (types) {
    if (types != undefined) {
      if (types == 1) {
        alarmFanceType = "圆形";
      } else if (types == 2) {
        alarmFanceType = "矩形";
      } else if (types == 3) {
        alarmFanceType = "多边形";
      } else if (types == 4) {
        alarmFanceType = "路线";
      }
      return alarmFanceType;
    }
  },
  //根据围栏Id及车Id查询围栏名称
  getFanceNameByFanceIdAndVid: function (vid, fcid) {
    var fenceName;
    $.ajax({
      type: "POST",
      url: "/clbs/v/monitoring/getFenceInfo",
      dataType: "json",
      async: false,
      data: {"vehicleId": vid, "sendDownId": fcid},
      success: function (data) {
        if (data.success) {
          if (data.obj != null) {
            fenceName = data.obj.name;
          } else {
            fenceName = null;
          }
        }
      }
    });
    return fenceName;
  },
  //数据表格html组装
  tableListHtml: function (dataMsg, type, dataString) {
    var html = '';
    var this_id = dataMsg[dataMsg.length - 1];
    if (type == 'state') {
      for (var i = 0; i < dataMsg.length - 1; i++) {
        if (i == 12) {
          var allinfo = dataMsg[i];
          if (dataMsg[i] != null) {
            if (dataMsg[i] != "" && dataMsg[i].length > 20) {
              dataMsg[i] = dataMsg[i].substring(0, 20) + "...";
              html += '<td class="demo demoUp" alt="' + allinfo + '"  data-id="' + this_id + '">' + dataMsg[i] + '</td>';
            } else {
              html += '<td  data-id="' + this_id + '">' + dataMsg[i] + '</td>';
            }
          } else {
            html += '<td  data-id="' + this_id + '"> </td>';
          }
        } else {
          html += '<td data-id="' + this_id + '">' + dataMsg[i] + '</td>';
        }
      }
      ;
    }
    ;
    if (type == 'alarm') {
      if (dataMsg[3] == '人') {
        html += "<td>" + dataMsg[0] + "</td><td data-id='" + this_id + "'>" + dataMsg[1] + "</td><td>" + dataMsg[7] + "</td><td onClick='dataTableOperation.warningManage(" + dataString + ")' style='color:#2ca2d1;'>未处理</td><td>" + dataMsg[2] + "</td><td>" + dataMsg[3] + "</td><td>" + dataMsg[4] + "</td><td>" + dataMsg[5] + "</td><td>" + dataMsg[6] + "</td><td>" + dataMsg[8] + "</td><td>" + dataMsg[9] + "</td><td>" + dataMsg[10] + "</td>";
      } else {
        html += "<td>" + dataMsg[0] + "</td><td data-id='" + this_id + "'>" + dataMsg[1] + "</td><td>" + dataMsg[2] + "</td><td onClick='dataTableOperation.warningManage(" + dataString + ")' style='color:#2ca2d1;'>未处理</td><td>" + dataMsg[3] + "</td><td>" + dataMsg[4] + "</td><td>" + dataMsg[5] + "</td><td data-alarmType='" + (dataTableOperation.endsWith(dataMsg[15], ",") ? dataMsg[15] : dataMsg[15] + ",") + "'>" + dataMsg[6] + "</td><td>" + dataMsg[7] + "</td><td>" + dataMsg[8] + "</td><td>" + dataMsg[9] + "</td><td>" + dataMsg[10] + "</td>";
      }
    }
    ;
    setTimeout(function () {
      $(".demoUp").mouseover(function () {

        var _this = $(this);
        if (_this.attr("alt")) {
          _this.justToolsTip({
            animation: "moveInTop",
            width: "auto",
            contents: _this.attr("alt"),
            gravity: 'top'
          });
        }
      })
    }, 1000)

    return html;

  },
  endsWith: function (val, str) {
    var reg = new RegExp(str + "$");
    return reg.test(val);
  },
  //表格插入数据
  dataTableList: function (array, data, id, type) {
    var dataMsg = data;
    var html = '';
    var dataString;
    // 列表不存在记录  添加
    if (array.indexOf(dataMsg[dataMsg.length - 1]) == -1) {
      if (type == 'state') {
        dataMsg[0] = stateIndex;
        html = dataTableOperation.tableListHtml(dataMsg, type, dataString);
      }
      //报警记录
      else if (type == 'alarm') {
        dataString = '"' + dataMsg[1] + "|" + dataMsg[2] + "|" + dataMsg[3] + "|" + dataMsg[4] + "|" + dataMsg[5] + "|" + dataMsg[6] + "|" + dataMsg[7] + "|" + dataMsg[11] + "|" + dataMsg[12] + "|" + dataMsg[13] + "|" + dataMsg[14] + "|" + dataMsg[15] + "|" + dataMsg[16] + "|" + dataMsg[17] + '"';
        alarmString = '' + dataMsg[1] + "|" + dataMsg[2] + "|" + dataMsg[3] + "|" + dataMsg[4] + "|" + dataMsg[5] + "|" + dataMsg[6] + "|" + dataMsg[7] + "|" + dataMsg[11] + "|" + dataMsg[12] + "|" + dataMsg[13] + "|" + dataMsg[14] + "|" + dataMsg[15] + "|" + dataMsg[16] + "|" + dataMsg[17] + '';
        dataMsg[0] = alarmIndex;
        html = dataTableOperation.tableListHtml(dataMsg, type, dataString);
      }
      ;
    }
    ;
    if (array.length == 0) {
      var htmlString = '<tr>' + html + '</tr>';
      $("#" + id).children("tbody").append(htmlString);

      dataTableOperation.typeGroup(type, dataMsg[dataMsg.length - 1]);
    } else {
      // 列表存在记录  更新
      if (array.indexOf(dataMsg[dataMsg.length - 1]) != -1) {
        $("#" + id).children("tbody").children("tr").each(function () {
          if ($(this).children("td:nth-child(2)").attr('data-id') == dataMsg[dataMsg.length - 1]) {
            //已有的报警时间
            var alarmTime = $(this).children("td:nth-child(3)").text();
            //如果是同一条位置信息上传的报警
            if (alarmTime == dataMsg[2] && type == 'alarm') {
              //已有报警类型名称
              var alarmTypeName = $(this).children("td:nth-child(8)").text();
              //已有的报警类型集合
              var alarmTypeStrs = $(this).children("td:nth-child(8)").attr('data-alarmType');
              if (alarmTypeStrs != dataMsg[15] && alarmTypeName != dataMsg[6]) {
                dataMsg[6] = alarmTypeName + "," + dataMsg[6];
                if (dataTableOperation.endsWith(alarmTypeStrs, ",")) {
                  dataMsg[15] = alarmTypeStrs + dataMsg[15];
                } else {
                  dataMsg[15] = alarmTypeStrs + "," + dataMsg[15];
                }
              }
            }
            var index = $(this).children("td:nth-child(1)").text();
            dataMsg[0] = index;
            dataString = '"' + dataMsg[1] + "|" + dataMsg[2] + "|" + dataMsg[3] + "|" + dataMsg[4] + "|" + dataMsg[5] + "|" + dataMsg[6] + "|" + dataMsg[7] + "|" + dataMsg[11] + "|" + dataMsg[12] + "|" + dataMsg[13] + "|" + dataMsg[14] + "|" + dataMsg[15] + "|" + dataMsg[16] + "|" + dataMsg[17] + '"';
            alarmString = '' + dataMsg[1] + "|" + dataMsg[2] + "|" + dataMsg[3] + "|" + dataMsg[4] + "|" + dataMsg[5] + "|" + dataMsg[6] + "|" + dataMsg[7] + "|" + dataMsg[11] + "|" + dataMsg[12] + "|" + dataMsg[13] + "|" + dataMsg[14] + "|" + dataMsg[15] + "|" + dataMsg[16] + "|" + dataMsg[17] + '';
            html = dataTableOperation.tableListHtml(dataMsg, type, dataString);
            $(this).html(html);
          }
          ;
        });
      } else {
        //表格数据判断报警数据最新推送排第一  更新数据除外
        var htmlString = '<tr>' + html + '</tr>';
        if (type == "alarm") {
          $("#" + id).children("tbody").prepend(htmlString);
          dataTableOperation.tableRank(id);
        } else {
          $("#" + id).children("tbody").append(htmlString);
        }
        dataTableOperation.typeGroup(type, dataMsg[dataMsg.length - 1]);
      }
      ;
    }
    ;
    if (uptFlag != false) {
      dataTableOperation.carStateAdapt(activeIndex);
    }
    if (type == 'alarm') {
      dataTableOperation.alarmInfoDataDbclick(type);
    } else {
      if (dbClickHeighlight) {
        dataTableOperation.tableHighlight(type, DblclickName);
      }
      ;
      dataTableOperation.dataTableDbclick(type);
    }
    ;
    setTimeout(
        function () {
          $("[data-toggle='popover']").popover({container: 'body'});
        }, 10000)
    //);
  },
  getAddressback: function (data) {
    carAddress = data;
  },
  getaddressParticulars: function (AddressNew, longitude, latitude) {
    var addressParticulars = {
      "longitude": Number(longitude).toFixed(3),
      "latitude": Number(latitude).toFixed(3),
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
      "roads": "",//道路名称
      "formattedAddress": AddressNew.regeocode.formattedAddress,//格式化地址
    };
    return JSON.stringify(addressParticulars);
  },
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
      direction = '未知数据';
    }
    return direction;
  },
  //点击页面隐藏相应的ul下拉列表
  updateRow: function (table, dataSet, obj, type) {
    if (type == 'state') {//状态信息(车)
      dataTableOperation.dataTableList(stateName, obj, "realTimeStateTable", "state");
    }
    else if (type == 'alarm') {//报警记录(车)
      dataTableOperation.dataTableList(alarmName, obj, "alarmTable", "alarm");
    }
  },
  //报警处理
  warningManage: function (data) {
    $('.sendTextFooter').hide();
    $('.takePicturesFooter').hide();
    $("#alarm-remark").show();
    $("#smsTxt").val("");
    $("#time").val("");
    $("#alarmRemark").val("");
    pageLayout.closeVideo();
    layer.closeAll();
    $('#warningManage').modal('show');
    var dataArray = data.split('|');
    var url = "/clbs/v/monitoring/getDeviceTypeByVid";
    var data = {"vehicleId": dataArray[13]};
    var warningType = "";
    json_ajax("POST", url, "json", false, data, function (data) {
      warningType = data;
    });
    var alarmType = dataArray[11].split(',');
    for (var i = 0; i < alarmType.length; i++) {
      var flag = $.inArray(alarmType[i], alarmTypeList);
      if (flag != -1) {
        $("#warningManagePhoto").attr("disabled", "disabled");
        $("#warningManageSend").attr("disabled", "disabled");
        $("#warningManageAffirm").attr("disabled", "disabled");
        $("#warningManageFuture").attr("disabled", "disabled");
        $("#warningManageCancel").attr("disabled", "disabled");
        $("#color").show();
        $("#color").text(alarmDisabled);
        break;
      }
    }
    // 持续性报警结束时间不会为"0", 因此如果是持续性报警无需判断此逻辑
    var url1 = "/clbs/a/search/findEndTime";
    var data1 = {"vehicleId": dataArray[13], "type": dataArray[11], "startTime": dataArray[1]};
    layer.load(2);
    json_ajax("POST", url1, "json", true, data1, function (result) {
      if (result.success == true) {
        if (result.msg == "0") {
          $("#color").show();
          $("#color").text(alarmError);
          $("#warningManagePhoto").attr("disabled", "disabled");
          $("#warningManageSend").attr("disabled", "disabled");
          $("#warningManageAffirm").attr("disabled", "disabled");
          $("#warningManageFuture").attr("disabled", "disabled");
          $("#warningManageCancel").attr("disabled", "disabled");
        } else {
          $("#color").show();
          $("#color").text(alarmDisabled);
        }
      } else {
        $("#warningManagePhoto").removeAttr("disabled");
        $("#warningManageSend").removeAttr("disabled");
        $("#warningManageAffirm").removeAttr("disabled");
        $("#warningManageFuture").removeAttr("disabled");
        $("#warningManageCancel").removeAttr("disabled");
        $("#color").hide();
        $("#colorMore").hide();
        layer.closeAll();
      }
    });
    $("#takePicturesContent,#sendTextMessages").hide();
    if (warningType == true || dataArray[12] == "1") {
      $("#warningHiden").removeAttr("style");
      $("#warningManagePhoto").hide();
      $("#warningManageSend").hide();
      $("#sno").val("0");
    } else {
      $("#warningHiden").attr("style", "text-align:center");
      $("#warningManagePhoto").show();
      $("#warningManageSend").show();
      $("#sno").val(dataArray[10]);
    }


    $("#warningCarName").text(dataArray[0]);
    $("#warningTime").text(dataArray[1]);
    $("#warningGroup").text(dataArray[2]);
    $("#warningDescription").text(dataArray[5]);
    $("#warningPeo").text(dataArray[6]);
    $("#simcard").val(dataArray[8]);
    $("#device").val(dataArray[9]);
    $("#warningType").val(dataArray[11]);
    $("#vUuid").val(dataArray[13]);
    var url = "/clbs/v/monitoring/getAlarmParam";
    var parameter = {"vehicleId": dataArray[13], "alarm": dataArray[5]};
    json_ajax("POST", url, "json", true, parameter, dataTableOperation.getAlarmParam);
  },
  getAlarmParam: function (data) {
    $(".warningDeal").hide();
    var len = data.obj.length;
    var valueList = data.obj;
    if (len != 0) {
      for (var i = 0; i < len; i++) {
        var name = valueList[i].name;
        var value = valueList[i].parameterValue;
        var paramCode = valueList[i].paramCode;
        if (name == "超速预警") {
          $("#overSpeedGap").show();
          $("#overSpeedGapValue").text(value);
        }
        ;
        if (name == "疲劳驾驶预警") {
          $("#tiredDriveGap").show();
          $("#tiredDriveGapValue").text(value);
        }
        ;
        if (name == "碰撞预警") {
          $("#crashWarning").show();
          if (paramCode == "param1") {
            $("#crashTime").text(value);
          } else if (paramCode == "param2") {
            $("#crashSpeed").text(value);
          }
        }
        ;
        if (name == "侧翻预警") {
          $("#turnOnWarning").show();
          $("#turnOnValue").text(value);
        }
        ;
        if (name == "超速报警") {
          $("#overSpeeds").show();
          if (paramCode == "param1") {
            $("#warningSpeed").text(value);
          } else if (paramCode == "param2") {
            $("#warningAllTime").text(value);
          }
        }
        ;
        if (name == "疲劳驾驶") {
          $("#tiredDrive").show();
          if (paramCode == "param1") {
            $("#continuousDriveTime").text((value && value !== "null")?value:"");
          } else if (paramCode == "param2") {
            $("#breakTime").text(value);
          }
        }
        ;
        if (name == "当天累积驾驶超时") {
          $("#addUpDrive").show();
          $("#addUpDriveTime").text(value);
        }
        ;
        if (name == "超时停车") {
          $("#overTimeStop").show();
          $("#overTimeStopTime").text(value);
        }
        ;
        if (name == "凌晨2-5点行驶报警") {
          $("#earlyRun").show();
          $("#earlyRunValue").text(value);
        }
        ;
        if (name == "车辆非法位移") {
          $("#displacementCar").show();
          $("#displacementCarDistance").text(value);
        }
        ;
        if (name == "车机疑似屏蔽报警") {
          $("#shieldWarning").show();
          if (paramCode == "param1") {
            $("#offLineTime").text(value);
          } else if (paramCode == "param2") {
            $("#offLineStartTime").text(value);
          } else if (paramCode == "param3") {
            $("#offLineEndTime").text(value);
          }
        }
        ;
      }
      ;
    }
    ;
  },
  // 拍照
  photo: function () {
    dataTableOperation.getPhoto();
  },
  getPhoto: function (data) {
    //拍照参数显示隐藏
    if ($("#takePicturesContent").is(":hidden")) {
      $("#takePicturesContent").slideDown();
      $('.takePicturesFooter').show();
      $("#sendTextMessages").hide();
      $('.sendTextFooter').hide();
    } else {
      $("#takePicturesContent").slideUp();
      $('.takePicturesFooter').hide();
    }
    setTimeout("dataTableOperation.logFindCilck()", 500);
  },
  send: function () {
    if ($("#sendTextMessages").is(":hidden")) {
      $("#sendTextMessages").slideDown();
      $('.sendTextFooter').show();
      $("#takePicturesContent").hide();
      $('.takePicturesFooter').hide();
    } else {
      $("#sendTextMessages").slideUp();
      $('.sendTextFooter').hide();
    }
    setTimeout("dataTableOperation.logFindCilck()", 500);
  },
  handleAlarm: function (handleType) {
    var startTime = $("#warningTime").text();
    var plateNumber = $("#warningCarName").text();
    var description = $("#warningDescription").text();
    var vehicleId = $("#vUuid").val();
    var simcard = $('#simcard').val();
    var device = $("#device").val();
    var sno = $("#sno").val();
    var alarm = $("#warningType").val();
    var remark = $("#alarmRemark").val();
    var url = "/clbs/v/monitoring/handleAlarm";
    var data = {
      "vehicleId": vehicleId,
      "plateNumber": plateNumber,
      "alarm": alarm,
      "description": description,
      "handleType": handleType,
      "startTime": startTime,
      "simcard": simcard,
      "device": device,
      "sno": sno,
      "remark":remark
    };
    json_ajax("POST", url, "json", true, data, null);
    $("#warningManage").modal('hide');
    dataTableOperation.updateHandleStatus($("#warningCarName").text());
    setTimeout("dataTableOperation.logFindCilck()", 500);
  },
  // 更新报警处理状态
  updateHandleStatus: function (plateNumber) {
    $alarmTable.children("tbody").children("tr").each(function () {
      if ($(this).children("td:nth-child(2)").text() == plateNumber) {
        $(this).children("td:nth-child(4)").removeAttr("onclick");
        $(this).children("td:nth-child(4)").text("已处理").removeAttr("style");
      }
    });
  },
  // 取消订阅后删除对应表格信息
  deleteRowByRealTime: function (plateNumber) {
    for (var i = 0; i < plateNumber.length; i++) {
      //车辆状态信息
      if (stateName.indexOf(plateNumber[i]) != -1) {
        $realTimeStateTableList.children("tbody").children("tr").each(function () {
          if ($(this).children("td:nth-child(2)").attr('data-id') == plateNumber[i]) {
            $(this).remove();
            stateIndex--;
            stateName.splice(stateName.indexOf(plateNumber[i]), 1);
          }
        });
      }
      ;
    }
    ;
    dataTableOperation.carStateAdapt(activeIndex);
    dataTableOperation.tableRank('realTimeStateTable');
    dataTableOperation.tableRank('alarmTable');
  },
  // 监控对象列表单双击
  dataTableDbclick: function (type) {
    var thisID = dataTableOperation.confirmID(type);
    var TimeFn = null;
    $("#" + thisID).children("tbody").children("tr").unbind("click").bind("click", function () {
      //判断当前单击后的信息是否高亮
      if ($(this).hasClass("tableHighlight") || $(this).hasClass("tableHighlight-blue")) {
        //清除车辆树高亮效果
        var plateInformationName = $(this).children("td:nth-child(2)").data('id');
        if (licensePlateInformation == plateInformationName) {
          $(".ztree li a").removeAttr("class", "curSelectedNode");
          $("#" + dbclickCheckedId).parent().removeAttr("class", "curSelectedNode_dbClick");
        }
        if (groupIconSkin == "assignmentSkin" || groupIconSkin == "groupSkin") {
          $(".ztree li a").removeAttr("class", "curSelectedNode");
          $("#" + dbclickCheckedId).parent().removeAttr("class", "curSelectedNode_dbClick");
        }
        //清除数据表高亮效果
        $(this).removeClass("tableHighlight");
        $(this).removeClass("tableHighlight-blue");
        $(".ztree li a").removeClass("curSelectedNode_dbClick");
        $(".ztree li a").removeClass("curSelectedNode");
        //取消聚焦跟踪
        treeMonitoring.centerMarkerNo();
      } else {
        $("#" + thisID).children("tbody").children("tr").removeClass("tableHighlight");
        $("#" + thisID).children("tbody").children("tr").removeClass("tableHighlight-blue");
        //为表格添加高亮
        var numberPlate = $(this).children("td:nth-child(2)").data('id');
        var realTimeDataTableTrNum = $("#realTimeStateTable").find("tr").length;
        for (var i = 0; i < realTimeDataTableTrNum; i++) {
          $(this).addClass("tableHighlight");
        }
        $(".ztree li a").removeClass("curSelectedNode_dbClick");
        $(".ztree li a").removeClass("curSelectedNode");
        //为车辆树添加高亮
        var zTreeDataTables = $.fn.zTree.getZTreeObj("treeDemo");
        var dataTabCheckedNum = zTreeDataTables.getCheckedNodes(true);
        for (var i = 0; i < dataTabCheckedNum.length; i++) {
          if (dataTabCheckedNum[i].id == numberPlate) {
            ztreeStyleDbclick = dataTabCheckedNum[i].tId;
            $("#" + ztreeStyleDbclick).children("a").addClass("curSelectedNode_dbClick");
          }
        }
        var $this = $(this);
        TimeFn = setTimeout(function () {
          var objID = $this.children("td:nth-child(2)").attr('data-id');
          //聚焦跟踪执行方法
          // dataTableOperation.centerMarkerBands(objID);
          treeMonitoring.centerMarker(objID, 'DBLCLICK');
        }, 300);
        if (!$('.obdContent').is(':hidden')) {
            amapOperation.setObdInfo();
        }
      }
    });
    $("#" + thisID).children("tbody").children("tr").unbind("dblclick").bind("dblclick", function () {
      var nodeName = $(this).children("td:nth-child(2)").data('id');
      dataTableOperation.tableHighlight(type, nodeName);
      //为表格添加高亮
      var numberPlate = $(this).children("td:nth-child(2)").data('id');
      var realTimeDataTableTrNum = $("#realTimeStateTable").find("tr").length;
      for (var i = 0; i < realTimeDataTableTrNum; i++) {
        $(this).addClass("tableHighlight");
      }
      $(".ztree li a").removeClass("curSelectedNode_dbClick");
      $(".ztree li a").removeClass("curSelectedNode");
      //为车辆树添加高亮
      var zTreeDataTables = $.fn.zTree.getZTreeObj("treeDemo");
      var dataTabCheckedNum = zTreeDataTables.getCheckedNodes(true);
      for (var i = 0; i < dataTabCheckedNum.length; i++) {
        if (dataTabCheckedNum[i].id == numberPlate) {
          ztreeStyleDbclick = dataTabCheckedNum[i].tId;
          $("#" + ztreeStyleDbclick).children("a").addClass("curSelectedNode_dbClick");
        }
      }
      //聚焦跟踪执行方法
      var objID = $(this).children("td:nth-child(2)").attr('data-id');
      // dataTableOperation.centerMarkerBands(objID);
      treeMonitoring.centerMarker(objID, 'DBLCLICK');
      clearTimeout(TimeFn);
      if (!$('.obdContent').is(':hidden')) {
          amapOperation.setObdInfo();
      }
    });
  },
  //报警记录单双击
  alarmInfoDataDbclick: function (type) {
    var thisID = dataTableOperation.confirmID(type);
    var alarmTimeFn = null;
    $("#" + thisID).children("tbody").children("tr").unbind("click").bind("click", function () {
      clearTimeout(alarmTimeFn);
      $("#" + thisID).children("tbody").children("tr").removeClass("tableHighlight-blue");
      var alarmDataTableTrNum = $("#" + thisID).find("tr").length;
      for (var i = 0; i < alarmDataTableTrNum; i++) {
        $(this).addClass("tableHighlight-blue");
      }
      alarmTimeFn = setTimeout(function () {
      }, 300);
    });
    $("#" + thisID).children("tbody").children("tr").unbind("dblclick").bind("dblclick", function () {
      clearTimeout(alarmTimeFn);
      var alarmVid;
      var timeFormat;
      var alarmStr;
      //获取当前点击行相对应的值
      if (type == 'alarm') {
        alarmVid = $(this).children("td:nth-child(2)").attr("data-id");
        timeFormat = $(this).children("td:nth-child(3)").text();
        alarmStr = $(this).children("td:nth-child(8)").text();
      } else if (type == 'peopleAlarm') {
        alarmVid = $(this).children("td:nth-child(2)").attr("data-id");
        timeFormat = $(this).children("td:nth-child(3)").text();
        alarmStr = $(this).children("td:nth-child(6)").text();
      }
      ;
      // 判断是否有报警查询的菜单权限
      var alarmFlag = false;
      var permissionUrls = $("#permissionUrls").val();
      if (permissionUrls != null && permissionUrls != undefined) {
        var urllist = permissionUrls.split(",");
        if (urllist.indexOf("/a/search/list") > -1) {
          alarmFlag = true;
          //跳转
          location.href = "/clbs/a/search/list?avid=" + alarmVid + "&atype=0" + "&atime=" + timeFormat + "";
        }
      }
      if (!alarmFlag) {
        layer.msg("无操作权限，请联系管理员");
      }
    });
  },
  //列表高亮
  tableHighlight: function (type, name) {
    var thisID = dataTableOperation.confirmID(type);
    $("#" + thisID).children("tbody").children("tr").removeClass("tableHighlight");
    $("#" + thisID).children("tbody").children("tr").removeClass("tableHighlight-blue");
    $("#" + thisID).children("tbody").children("tr").each(function () {
      if ($(this).children("td:nth-child(2)").data('id') == name) {
        dbClickHeighlight = false;
        $(this).addClass("tableHighlight");
        $(this).parent('div').scrollTop(0);
        $("#" + thisID).children('tbody').children('tr.tableHighlight').insertBefore($("#" + thisID).children("tbody").children("tr:first-child"));
        if (!$('.obdContent').is(':hidden')) {
            amapOperation.setObdInfo();
        }
      }
    });

    //序号重新进行排序
    dataTableOperation.tableRank(thisID);
  },
  //列表高亮
  tableHighlightBlue: function (type, name) {
    var thisID = dataTableOperation.confirmID(type);
    $("#" + thisID).children("tbody").children("tr").removeClass("tableHighlight-blue");
    $("#" + thisID).children("tbody").children("tr").removeClass("tableHighlight");
    $("#" + thisID).children("tbody").children("tr").each(function () {
      if ($(this).children("td:nth-child(2)").data('id') == name) {
        dbClickHeighlight = false;
        $(this).addClass("tableHighlight-blue");
        $(this).parent('div').scrollTop(0);
        $("#" + thisID).children('tbody').children('tr.tableHighlight-blue').insertBefore($("#" + thisID).children("tbody").children("tr:first-child"));
        if (!$('.obdContent').is(':hidden')) {
            amapOperation.setObdInfo();
        }
      }
    });
    //序号重新进行排序
    dataTableOperation.tableRank(thisID);
  },
  logFindCilck: function () {
    if (clickLogCount == 0) {
      // 终端上报日志updataFenceData
      webSocket.subscribe(headers, '/topic/deviceReportLog', function () {
        var data = {"eventDate": logTime}
        address_submit("POST", '/clbs/m/reportManagement/logSearch/findLog', "json", false, data, true, dataTableOperation.logFind);
      }, null, null);
      webSocket.subscribe(headers, '/user/' + $("#userName").text() + '/deviceReportLog', function () {
        var data = {"eventDate": logTime}
        address_submit("POST", '/clbs/m/reportManagement/logSearch/findLog', "json", false, data, true, dataTableOperation.logFind);
      }, null, null);
      clickLogCount = 1;
    }
    var data = {"eventDate": logTime}
    address_submit("POST", '/clbs/m/reportManagement/logSearch/findLog', "json", false, data, true, dataTableOperation.logFind);
  },
  logFind: function (data) {
    operationLogLength = data.length;
    if ($("#operationLog").hasClass("active")) {
      if (data.length <= 5) {
        $MapContainer.css('height', (newMapHeight - (41 * data.length + 43 + 17)) + 'px');
      } else {
        $("#operationLogTable").css({"overflow": "auto", "max-height": "248px"});
      }
    }
    $logging.children("tbody").empty();
    var logTable = 1;
    var html = "";
    var logType = "";
    var content = "";
    for (var i = 0; i < data.length; i++) {
      if (data[i].logSource == "1") {
        logType = '终端上传';
        content = "<a onclick = 'dataTableOperation.showLogContent(\"" + data[i].message + "\")'>" + data[i].monitoringOperation + "</a>";
      } else if (data[i].logSource == "2") {
        logType = '平台下发';
        content = data[i].message;
      } else {
        logType = '平台操作';
        content = data[i].message;
      }
      html += "<tr><td>" + logTable + "</td><td>" + data[i].eventDate + "</td><td>" + (data[i].ipAddress != null ? data[i].ipAddress : "") + "</td><td>" + (data[i].username != null ? data[i].username : "") + "</td><td>" + data[i].brand + "</td><td>" + data[i].plateColorStr + "</td><td>" + content + "</td><td>" + logType + "</td></tr>";
      logTable++;
    }
    $logging.children("tbody").append(html);
  },
  showLogContent: function (content) { // 显示log详情
    pageLayout.closeVideo();
    $("#logDetailDiv").modal("show");
    $("#logContent").html(content);
  },
  takePhoto: function () {
    if (dataTableOperation.photoValidate()) {
      $("#takePhoto").ajaxSubmit(function (data) {
        $("#goPhotograph").modal("hide");
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess);
          setTimeout("dataTableOperation.logFindCilck()", 500);
        }else {
            layer.msg(JSON.parse(data).msg);
        }
      });
    }
  },
  takePhotoForAlarm: function () {
    if (dataTableOperation.photoValidateForAlarm()) {
        // 为车id赋值
      var vehicleId = $("#vUuid").val();
      $("#vidforAlarm").val(vehicleId);
      $("#brandPhoto").val($("#warningCarName").text());
      $("#alarmPhoto").val($("#warningType").val());
      $("#startTimePhoto").val($("#warningTime").text());

      $("#simcardPhoto").val($('#simcard').val());
      $("#devicePhoto").val($("#device").val());
      $("#snoPhoto").val($("#sno").val());
      $("#handleTypePhoto").val("拍照");
      $("#description-photo").val($("#warningDescription").text());
      $("#remark-photo").val($("#alarmRemark").val());
        $("#goPhotographsForAlarm").attr("disabled", "disabled");
      $("#takePhotoForAlarm").ajaxSubmit(function (data) {
        /*$("#warningManage").modal('hide');
         if (JSON.parse(data).success) {
         layer.msg(publicIssuedSuccess)
         setTimeout("dataTableOperation.logFindCilck()", 500);
         } else {
         layer.msg(publicIssuedFailure);
         }*/

      });
      // 根据需求, 此处无需等待响应成功
      $("#warningManage").modal('hide');
      dataTableOperation.updateHandleStatus($("#warningCarName").text());
      setTimeout("dataTableOperation.logFindCilck()", 500);
    }
      $("#goPhotographsForAlarm").removeAttr("disabled");
  },
  getVideo: function () {
    if ($("#vtime").val() == "0") {
      $(".recording-timeline").show();
      $("#videoPlay").attr("class", "pause");
      videoTimeIndex = 1;
      videoPlay.src = "../../resources/img/pause.png";
      time = setInterval(function () {
        $("#videoTime").html((videoTimeIndex++) + "秒");
      }, 1000);
    }
    if (dataTableOperation.videoValidate()) {
      $("#getVideo").ajaxSubmit(function (data) {
        $("#goVideotape").modal("hide");
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess)
          setTimeout("dataTableOperation.logFindCilck()", 500);
        }else {
            layer.msg(JSON.parse(data).msg)
        }
      });
    }
  },
  goRegularReport: function () {
    if (dataTableOperation.regularReportValidate()) {
      $("#regularReport").ajaxSubmit(function (data) {
        $("#continuousReturnTiming").modal("hide");
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess)
          setTimeout("dataTableOperation.logFindCilck()", 500);
        }
      });
    }
  },
  regularReportValidate: function () {
    return $("#timeInterval0").validate({
      rules: {
        driverLoggingOutUpTimeSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        dormancyUpTimeSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        emergencyAlarmUpTimeSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        defaultTimeUpSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        }
      },
      messages: {
        driverLoggingOutUpTimeSpace: {
          required: drivingTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength
        },
        dormancyUpTimeSpace: {
          required: sleepTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength,
        },
        emergencyAlarmUpTimeSpace: {
          required: sosTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength,
        },
        defaultTimeUpSpace: {
          required: defaultTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength,
        }
      }
    }).form();
  },
  goDistanceReport: function () {
    if (dataTableOperation.distanceReportValidate()) {
      $("#distanceReport").ajaxSubmit(function (data) {
        $("#continuousReturnFixedDistance").modal("hide");
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess)
          setTimeout("dataTableOperation.logFindCilck()", 500);
        }
      });
    }
  },
  distanceReportValidate: function () {
    return $("#timeInterval1").validate({
      rules: {
        driverLoggingOutUpDistanceSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        dormancyUpDistanceSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        emergencyAlarmUpDistanceSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        defaultDistanceUpSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        }
      },
      messages: {
        driverLoggingOutUpDistanceSpace: {
          required: drivingTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength
        },
        dormancyUpDistanceSpace: {
          required: sleepTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength,
        },
        emergencyAlarmUpDistanceSpace: {
          required: sosTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength,
        },
        defaultDistanceUpSpace: {
          required: defaultTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength,
        }
      }
    }).form();
  },
  goTimeInterval: function () {
    var continuousReturnValue = $("#continuousReturnValue").val();
    if(continuousReturnValue == 0){
        if (!dataTableOperation.regularReportValidate()){
            return;
      }else {
            $("#timeInterval0").ajaxSubmit(function (data) {
                $("#continuousReturnTimingDistance").modal("hide");
                if (JSON.parse(data).success) {
                    layer.msg(publicIssuedSuccess)
                    setTimeout("dataTableOperation.logFindCilck()", 500);
                }
            });
        }
    }else if(continuousReturnValue == 1){
      if (!dataTableOperation.distanceReportValidate()){
        return;
      }else {
          $("#timeInterval1").ajaxSubmit(function (data) {
              $("#continuousReturnTimingDistance").modal("hide");
              if (JSON.parse(data).success) {
                  layer.msg(publicIssuedSuccess)
                  setTimeout("dataTableOperation.logFindCilck()", 500);
              }
          });
      }
    }else if(continuousReturnValue == 2){
      if (!dataTableOperation.timeIntervalValidate()){
        return;
      }else {
          $("#timeInterval2").ajaxSubmit(function (data) {
              $("#continuousReturnTimingDistance").modal("hide");
              if (JSON.parse(data).success) {
                  layer.msg(publicIssuedSuccess)
                  setTimeout("dataTableOperation.logFindCilck()", 500);
              }
          });
      }
    }else {
        layer.msg("请选择回报类型");
        return;
    }

  },
  timeIntervalValidate: function () {
    return $("#timeInterval2").validate({
      rules: {
        driverLoggingOutUpTimeSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        dormancyUpTimeSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        emergencyAlarmUpTimeSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        defaultTimeUpSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        driverLoggingOutUpDistanceSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        dormancyUpDistanceSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        emergencyAlarmUpDistanceSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        },
        defaultDistanceUpSpace: {
          required: true,
          digits: true,
          max: 4294967295,
          min: 1
        }
      },
      messages: {
        driverLoggingOutUpTimeSpace: {
          required: drivingTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength
        },
        dormancyUpTimeSpace: {
          required: sleepTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength,
        },
        emergencyAlarmUpTimeSpace: {
          required: sosTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength,
        },
        defaultTimeUpSpace: {
          required: defaultTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength,
        },
        driverLoggingOutUpDistanceSpace: {
          required: drivingTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength
        },
        dormancyUpDistanceSpace: {
          required: sleepTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength,
        },
        emergencyAlarmUpDistanceSpace: {
          required: sosTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength,
        },
        defaultDistanceUpSpace: {
          required: defaultTimeNull,
          digits: publicNumberInt,
          max: publicSizeMoreLength,
        }
      }
    }).form();
  },
  gpListening: function () {
    if (dataTableOperation.listeningValidate()) {
      $("#listening").ajaxSubmit(function (data) {
        $("#monitoringObjectListening").modal("hide");
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess)
          setTimeout("dataTableOperation.logFindCilck()", 500);
        }else {
            layer.msg(JSON.parse(data).msg)
        }
      });
    }
  },
  reportSet: function () {
    var ht = $("#hours").val();
    var mt = $("#minute").val();
    if ((ht != "" && !/^[0-9]+$/.test(ht)) || (mt != "" && !/^[0-9]+$/.test(mt))) {//输入了非法字符
      layer.msg("上报频率时间只能输入正整数");
    } else {//正常校验
      var hours = parseInt(ht);
      var minute = parseInt(mt);
      if (isNaN(hours) && isNaN(minute)) {
        $("#locationNumber").val(86400);
      } else if (isNaN(hours) && !isNaN(minute)) {
        $("#locationNumber").val(minute * 60);
      } else if (!isNaN(hours) && isNaN(minute)) {
        $("#locationNumber").val(hours * 60 * 60);
      } else if (!isNaN(hours) && !isNaN(minute)) {
        $("#locationNumber").val(hours * 60 * 60 + minute * 60);
      }
      var reportSetFalg = false;
      var locationNumber = $("#locationNumber").val();
      if (locationNumber != 0 && locationNumber < 300) {
        layer.msg("上报间隔最小为5分钟");
      } else {
        reportSetFalg = true;
      }
      var sada = $("#locationNumber").val();
      if (reportSetFalg && dataTableOperation.reportSetValidate()) {
        $("#reportFrequency").ajaxSubmit(function (data) {
          $("#reportFrequencySet").modal("hide");
          if (JSON.parse(data).obj.type) {
            layer.msg(publicIssuedSuccess);
            setTimeout("dataTableOperation.logFindCilck()", 500);
          } else {
            layer.msg(publicIssuedError);
          }
        });
      }
    }
  },
  goInfofixedPointAndTiming: function () {
    if (dataTableOperation.goInfofixedValidate()) {
      $("#fixedPointTimingList").ajaxSubmit(function (data) {
        if (JSON.parse(data).obj.type) {
          $("#fixedPointAndTiming").modal("hide");
          layer.msg(publicIssuedSuccess);
          setTimeout("dataTableOperation.logFindCilck()", 500);
        } else {
          layer.msg("指令发送失败,相邻时间点的间隔必须大于等于300秒");
        }
      });
    }
  },
  positionTrailing: function () {
    if (dataTableOperation.positionTrailingValidate()) {
      $("#locationTailAfterList").ajaxSubmit(function (data) {
        $("#locationTailAfter").modal("hide");
        if (JSON.parse(data).obj.type) {
          layer.msg(publicIssuedSuccess);
          setTimeout("dataTableOperation.logFindCilck()", 500);
        } else {
          layer.msg(publicIssuedError);
        }
      });
    }
  },
  listeningValidate: function () {
    return $("#listening").validate({
      rules: {
        regRet: {
          isTel: true,
          required: true
        }
      },
      messages: {
        regRet: {
          isTel: phoneError,
          required: phoneNull
        }
      }
    }).form();
  },
  reportSetValidate: function () {
    return $("#reportFrequency").validate({
      rules: {
        locationPattern: {
          required: true
        },
        requiteTime: {
          checkRequiteTime: longDeviceType
        }
      },
      messages: {
        locationPattern: {
          required: positionNull
        },
        requiteTime: {
          checkRequiteTime: reportNull
        }
      }
    }).form();
  },
  goInfofixedValidate: function () {
    return $("#fixedPointTimingList").validate({
      rules: {
        locationTimes: {
          checkLocationTimes: true
        }
      },
      messages: {
        locationTimes: {
          checkLocationTimes: fixedPointNull
        }
      }
    }).form();
  },
  positionTrailingValidate: function () {
    return $("#locationTailAfterList").validate({
      rules: {
        longValidity: {
          required: true,
          maxlength: 5
        },
        longInterval: {
          required: true,
          maxlength: 5
        }
      },
      messages: {
        longValidity: {
          required: trackingNull,
          maxlength: intervalTimeNull
        },
        longInterval: {
          required: trackingIntervalNull,
          maxlength: intervalTimeNull
        }
      }
    }).form();
  },
  goOverspeedSettings: function () {
    if (dataTableOperation.speedLimitValidate()) {
      $("#speedLimit").ajaxSubmit(function (data) {
        $("#goOverspeedSetting").modal("hide");
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess)
          setTimeout("dataTableOperation.logFindCilck()", 500);
        }else {
            layer.msg(JSON.parse(data).msg)
        }
      });
    }
  },
  speedLimitValidate: function () {
    return $("#speedLimit").validate({
      rules: {
        masSpeed: {
          required: true,
          digits: true,
          max: 2147483647,
          min: 1
        },
        speedTime: {
          required: true,
          digits: true,
          max: 2147483647,
          min: 1
        }
      },
      messages: {
        masSpeed: {
          required: maxSpeedNull,
          digits: maxSpeedError,
          max: maxSpeedErrorScope
        },
        speedTime: {
          required: speedTimeNull,
          digits: timeError,
          max: maxSpeedErrorScope
        }
      }
    }).form();
  },
  emergency: function () {
    if ($("#emergency").is(':checked')) {
      $("#emergency").val(1)
    } else {
      $("#emergency").val(0)
    }
  },
  emergency1: function () {
    if ($("#emergency1").is(':checked')) {
      $("#emergency1").val(1)
    } else {
      $("#emergency1").val(0)
    }
  },
  displayTerminalDisplay: function () {
    if ($("#displayTerminalDisplay").is(':checked')) {
      $("#displayTerminalDisplay").val(3)
    } else {
      $("#displayTerminalDisplay").val(0)
    }
  },
  tts: function () {
    if ($("#tts").is(':checked')) {
      $("#tts").val(4)
    } else {
      $("#tts").val(0)
    }
  },
  tts1: function () {
    if ($("#tts1").is(':checked')) {
      $("#tts1").val(4)
    } else {
      $("#tts1").val(0)
    }
  },
  advertisingDisplay: function () {
    if ($("#advertisingDisplay").is(':checked')) {
      $("#advertisingDisplay").val(5)
    } else {
      $("#advertisingDisplay").val(0)
    }
  },
  advertisingDisplay1: function () {
    if ($("#advertisingDisplay1").is(':checked')) {
      $("#advertisingDisplay1").val(5)
    } else {
      $("#advertisingDisplay1").val(0)
    }
  },
  deleteSign: function () {
    if ($("#deleteSign").is(':checked')) {
      $("#deleteSign").val(1)
    } else {
      $("#deleteSign").val(0)
    }
  },
  goTxtSend: function () {
    if (dataTableOperation.txtSendValidate()) {
      $("#txtSend").ajaxSubmit(function (data) {
        $("#textInfoSend").modal("hide");
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess)
          setTimeout("dataTableOperation.logFindCilck()", 500);
        }else {
            layer.msg(JSON.parse(data).msg)
        }
      });
    }
  },
  txtSendValidate: function () {
    return $("#txtSend").validate({
      rules: {
        txt: {
          required: true,
          maxlength: 50
        }
      },
      messages: {
        txt: {
          required: textNull,
          maxlength: '最多输入50个字符'
        }
      }
    }).form();
  },
  goTxtSendForAlarm: function () {
    // 为车id赋值
    var vehicleId = $("#vUuid").val();
    $("#vidSendTxtForAlarm").val(vehicleId);
    $("#brandTxt").val($("#warningCarName").text());
    $("#alarmTxt").val($("#warningType").val());
    $("#startTimeTxt").val($("#warningTime").text());

    $("#simcardTxt").val($('#simcard').val());
    $("#deviceTxt").val($("#device").val());
    $("#snoTxt").val($("#sno").val());
    $("#handleTypeTxt").val("下发短信");
    $("#description-Txt").val($("#warningDescription").text());
    $("#remark-Txt").val($("#alarmRemark").val());

    var smsTxt = $("#smsTxt").val();
    if (smsTxt.length > 255) {
      layer.msg("下发内容不能超过255个字符");
      return;
    }
      $("#goTxtSendForAlarm").attr("disabled", "disabled");
    $("#txtSendForAlarm").ajaxSubmit(function (data) {
      /*$("#warningManage").modal('hide');
      if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess)
          setTimeout("dataTableOperation.logFindCilck()", 500);
      } else {
          layer.msg(publicIssuedFailure);
      }*/
    });
      $("#goTxtSendForAlarm").removeAttr("disabled");
    // 根据需求, 此处无需等待响应成功
    $("#warningManage").modal('hide');
    dataTableOperation.updateHandleStatus($("#warningCarName").text());
    setTimeout("dataTableOperation.logFindCilck()", 500);
  },
  goSendQuestion: function () {
    dataTableOperation.sendQuestionValidateTwo();
    if (sendFlag) {
      $("#sendQuestion").ajaxSubmit(function (data) {
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess);

          //关闭并还原提问下发表单
          $("#askQuestionsIssued").modal("hide");
          $("#askQuestionsIssued input[type='text']").val('');
          $("#askQuestionsIssued .error").hide();
          $('#answer-add-content div[id^="answer-add"]').remove();

          setTimeout("dataTableOperation.logFindCilck()", 500);
        }else {
            layer.msg(JSON.parse(data).msg)
        }
      });
    }
    /*
     if (dataTableOperation.sendQuestionValidate()) {
     $("#sendQuestion").ajaxSubmit(function (data) {
     $("#askQuestionsIssued").modal("hide");
     if (JSON.parse(data).success) {
     layer.msg(publicIssuedSuccess)
     setTimeout("dataTableOperation.logFindCilck()", 500);
     }
     });
     }*/
  },
  goInfoService: function () {
    if (dataTableOperation.sendQuestionValidate()) {
      $("#infoService").ajaxSubmit(function (data) {
        $("#informationService").modal("hide");
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess)
          setTimeout("dataTableOperation.logFindCilck()", 500);
        }else {
            layer.msg(JSON.parse(data).msg)
        }
      });
    }
  },
  goThroughOrder: function () {
    if (dataTableOperation.throughOrderValidate()) {
      $("#throughOrder").ajaxSubmit(function (data) {
        $("#throughInstruction").modal("hide");
        if (JSON.parse(data).obj.type) {
          layer.msg(publicIssuedSuccess);
          setTimeout("dataTableOperation.logFindCilck()", 500);
        } else {
          layer.msg(publicIssuedError);
        }
      });
    }
  },
  throughOrderValidate: function () {
    return $("#throughOrder").validate({
      rules: {
        longData: {
          required: true
        }
      },
      messages: {
        longData: {
          required: instructionError
        }
      }
    }).form();
  },
  sendQuestionValidateTwo: function () {
    var inputArr = $("#askQuestionsIssued input[type='text']");
    var inpLen = 0;
    for (var i = 0; i < inputArr.length; i++) {
      var thisInput = inputArr[i];
      var inputVal = thisInput.value;
      if (inputVal == "") {
        $(thisInput).siblings(".error").show();
        inpLen = 1;
      }
      else {
        $(thisInput).siblings(".error").hide();
      }
    }
    if (inpLen == 0) {
      sendFlag = true;
    }
    else {
      sendFlag = false;
    }
  },
  sendQuestionValidate: function () {
    return $("#sendQuestion").validate({
      rules: {
        question: {
          required: true
        },
        value: {
          required: true
        }
      },
      messages: {
        question: {
          required: questionsNull
        },
        value: {
          required: answerNull
        }
      }
    }).form();
  },
  goTelBack: function () {
    if (dataTableOperation.telBackValidate()) {
      $("#telBack").ajaxSubmit(function (data) {
        $("#reantimeCallBack").modal("hide");
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess)
          setTimeout("dataTableOperation.logFindCilck()", 500);
        }else {
            layer.msg(JSON.parse(data).msg)
        }
      });
    }
  },
  telBackValidate: function () {
    return $("#telBack").validate({
      rules: {
        regRet: {
          isTel: true,
          required: true
        }
      },
      messages: {
        regRet: {
          isTel: phoneError,
          required: phoneNull
        }
      }
    }).form();
  },
  goMultimediaRetrieval: function () {
    if (dataTableOperation.multimediaRetrievalValidate()) {
      var startTime = $("#multimediaRetrieval input[name='startTime']").val();
      var endTime = $("#multimediaRetrieval input[name='endTime']").val();
      startTime = new Date(startTime.replace(/-/, "/"));
      endTime = new Date(endTime.replace(/-/, "/"));
      if (startTime > endTime) {
        layer.msg("开始时间不能大于结束时间");
        return;
      }
      $("#multimediaSearch").modal("hide");
      $("#multimediaRetrieval").ajaxSubmit(function (data) {
        $("#multimediaSearch").modal("hide");
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess)
          setTimeout("dataTableOperation.logFindCilck()", 500);
        }else {
            layer.msg(JSON.parse(data).msg)
        }
      });
    }
  },
  multimediaRetrievalValidate: function () {
    return $("#multimediaRetrieval").validate({
      rules: {
        startTime: {
          required: true
        },
        endTime: {
          required: true
        }
      },
      messages: {
        startTime: {
          required: publicInputStartTime
        },
        endTime: {
          required: publicInputEndTime
        }
      }
    }).form();
  },
  goMultimediaUploads: function () {
    if (dataTableOperation.multimediaUploadsValidate()) {
      $("#multimediaUploads").ajaxSubmit(function (data) {
        $("#multimediaUpload").modal("hide");
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess)
          setTimeout("dataTableOperation.logFindCilck()", 500);
        }else {
            layer.msg(JSON.parse(data).msg)
        }
      });
    }
  },
  multimediaUploadsValidate: function () {
    return $("#multimediaUploads").validate({
      rules: {
        startTime: {
          required: true
        },
        endTime: {
          required: true
        }
      },
      messages: {
        startTime: {
          required: publicInputStartTime
        },
        endTime: {
          required: publicInputEndTime
        }
      }
    }).form();
  },
  //录音上传参数下发
  goRecordUpload: function () {
    if (dataTableOperation.recordUploadValidate()) {
      $("#voiceCommand").val("1");
      $("#recordUpload").ajaxSubmit(function (data) {
        $("#recordingUpload").modal("hide");
        if (JSON.parse(data).success) {
          layer.msg(publicIssuedSuccess)
          setTimeout("dataTableOperation.logFindCilck()", 500);
        }else {
            layer.msg(JSON.parse(data).msg)
        }
      });
      if ($("#tapingTime").val() == "0") {
        $(".taping-timeline").show();
        $("#voicePlay").attr("class", "pause");
        voiceTimeIndex = 1;
        $("#voicePlay").attr("src", "../../resources/img/pause.png");
        tapingTime = setInterval(function () {
          $("#voiceTime").html((voiceTimeIndex++) + "秒");
        }, 1000);
      }
    }
  },
  //录音上传停止参数下发
  tapingTimelinePlay: function () {
    if ($("#voicePlay").hasClass("pause")) {
      $("#voicePlay").attr("src", "../../resources/img/play.png");
      voiceTimeIndex = 0;
      clearInterval(tapingTime);
      $("#voiceTime").html(voiceTimeIndex + "秒");
      $("#voiceCommand").val("0");
      //下发
      $("#recordUpload").ajaxSubmit(function (data) {
        if (JSON.parse(data).success) {
          setTimeout("dataTableOperation.logFindCilck()", 500);
        } else {
          layer.msg(publicIssuedError);
        }
      });
      //隐藏
      $(".taping-timeline").hide(500);
    }
  },
  recordUploadValidate: function () {
    return $("#recordUpload").validate({
      rules: {
        time: {
          required: true,
          max: 65535
        }
      },
      messages: {
        time: {
          required: recordingNull
        }
      }
    }).form();
  },
  goOriginalOrder: function () {
    $("#originalOrder").ajaxSubmit(function (data) {
      $("#sendOriginalCommand").modal("hide");
      if (JSON.parse(data).success) {
        layer.msg(publicIssuedSuccess)
        setTimeout("dataTableOperation.logFindCilck()", 500);
      }else {
          layer.msg(JSON.parse(data).msg)
      }
    });
  },
  photoValidate: function () {
    return $("#takePhoto").validate({
      rules: {
        wayID: {
          required: true
        },
        time: {
          required: true,
          digits: true,
          range: [0, 65535]
        },
        command: {
          range: [1, 10],
          required: true
        },
        saveSign: {
          required: true
        },
        distinguishability: {
          required: true
        },
        quality: {
          range: [1, 10],
          required: true
        },
        luminance: {
          range: [0, 255],
          required: true
        },
        contrast: {
          range: [0, 127],
          required: true
        },
        saturability: {
          range: [0, 127],
          required: true
        },
        chroma: {
          range: [0, 255],
          required: true
        },
      },
      messages: {
        wayID: {
          required: alarmSearchChannelID
        },
        time: {
          required: alarmSearchIntervalTime,
          digits: alarmSearchIntervalError,
          range: alarmSearchIntervalSize
        },
        command: {
          range: alarmSearchPhotoSize,
          required: alarmSearchPhotoNull
        },
        saveSign: {
          required: alarmSearchSaveNull
        },
        distinguishability: {
          required: alarmSearchResolutionNull
        },
        quality: {
          range: alarmSearchMovieSize,
          required: alarmSearchMovieNull
        },
        luminance: {
          range: alarmSearchBrightnessSize,
          required: alarmSearchBrightnessNull
        },
        contrast: {
          range: alarmSearchContrastSize,
          required: alarmSearchContrastNull
        },
        saturability: {
          range: alarmSearchSaturatedSize,
          required: alarmSearchSaturatedNull
        },
        chroma: {
          range: alarmSearchColorSize,
          required: alarmSearchColorNull
        }
      }
    }).form();
  },
  videoValidate: function () {
    return $("#getVideo").validate({
      rules: {
        wayID: {
          required: true
        },
        time: {
          required: true,
          digits: true,
          range: [0, 65535]
        },
        command: {
          range: [0, 10],
          required: true
        },
        saveSign: {
          required: true
        },
        distinguishability: {
          required: true
        },
        quality: {
          range: [1, 10],
          required: true
        },
        luminance: {
          range: [0, 255],
          required: true
        },
        contrast: {
          range: [0, 127],
          required: true
        },
        saturability: {
          range: [0, 127],
          required: true
        },
        chroma: {
          range: [0, 255],
          required: true
        },
      },
      messages: {
        wayID: {
          required: alarmSearchChannelID
        },
        time: {
          required: alarmSearchIntervalTime,
          digits: alarmSearchIntervalError,
          range: alarmSearchIntervalSize
        },
        command: {
          range: alarmSearchPhotoSize,
          required: alarmSearchPhotoNull
        },
        saveSign: {
          required: alarmSearchSaveNull
        },
        distinguishability: {
          required: alarmSearchResolutionNull
        },
        quality: {
          range: alarmSearchMovieSize,
          required: alarmSearchMovieNull
        },
        luminance: {
          range: alarmSearchBrightnessSize,
          required: alarmSearchBrightnessNull
        },
        contrast: {
          range: alarmSearchContrastSize,
          required: alarmSearchContrastNull
        },
        saturability: {
          range: alarmSearchSaturatedSize,
          required: alarmSearchSaturatedNull
        },
        chroma: {
          range: alarmSearchColorSize,
          required: alarmSearchColorNull
        }
      }
    }).form();
  },
  photoValidateForAlarm: function () {
    return $("#takePhotoForAlarm").validate({
      rules: {
        wayID: {
          required: true
        },
        time: {
          required: true,
          digits: true,
          range: [0, 65535]
        },
        command: {
          range: [0, 10],
          required: true
        },
        saveSign: {
          required: true
        },
        distinguishability: {
          required: true
        },
        quality: {
          range: [1, 10],
          required: true
        },
        luminance: {
          range: [0, 255],
          required: true
        },
        contrast: {
          range: [0, 127],
          required: true
        },
        saturability: {
          range: [0, 127],
          required: true
        },
        chroma: {
          range: [0, 255],
          required: true
        },
      },
      messages: {
        wayID: {
          required: alarmSearchChannelID
        },
        time: {
          required: alarmSearchIntervalTime,
          digits: alarmSearchIntervalError,
          range: alarmSearchIntervalSize
        },
        command: {
          range: alarmSearchPhotoSize,
          required: alarmSearchPhotoNull
        },
        saveSign: {
          required: alarmSearchSaveNull
        },
        distinguishability: {
          required: alarmSearchResolutionNull
        },
        quality: {
          range: alarmSearchMovieSize,
          required: alarmSearchMovieNull
        },
        luminance: {
          range: alarmSearchBrightnessSize,
          required: alarmSearchBrightnessNull
        },
        contrast: {
          range: alarmSearchContrastSize,
          required: alarmSearchContrastNull
        },
        saturability: {
          range: alarmSearchSaturatedSize,
          required: alarmSearchSaturatedNull
        },
        chroma: {
          range: alarmSearchColorSize,
          required: alarmSearchColorNull
        }
      }
    }).form();
  },
  //录像下发播放器隐藏
  recordingTimelinePlay: function () {
    if ($("#videoPlay").hasClass("pause")) {
      videoPlay.src = "../../resources/img/play.png";
      videoTimeIndex = 0;
      clearInterval(time);
      $("#videoTime").html(videoTimeIndex + "秒");
      //隐藏
      $(".recording-timeline").hide(500);
    }
  },
  //上传数据类型判断
  typeGroup: function (type, data) {
    if (type == 'state') {
      stateName.push(data);
      stateIndex++;
    } else if (type == 'alarm') {
      alarmName.push(data);
      alarmIndex++;
    }
  },
  //所有table重新排序
  tableRank: function (id) {
    var index = 1;
    $("#" + id).children("tbody").children("tr").each(function () {
      $(this).children("td:nth-child(1)").text(index);
      index++;
    });
  },
  //通过table条数计算显示高度
  realTtimeAlarmClick: function () {
    //从报警标识点击切换至报警记录时改变列表状态
    if ($("#scalingBtn").hasClass("fa fa-chevron-up")) {
      $("#scalingBtn").removeAttr("class");
      $("#scalingBtn").addClass("fa fa-chevron-down");
    }
    //日志记录及报警记录 状态信息
    if (alarmNum == 0) {
      $MapContainer.css({
        "height": newMapHeight + 'px'
      });
    } else if (alarmNum == 1) {
      $MapContainer.css({
        "height": (newMapHeight - 102) + 'px'
      });
    } else if (alarmNum == 2) {
      $MapContainer.css({
        "height": (newMapHeight - (100 + 42)) + 'px'
      });
    } else if (alarmNum == 3) {
      $MapContainer.css({
        "height": (newMapHeight - (100 + 42 * 2)) + 'px'
      });
    } else if (alarmNum == 4) {
      $MapContainer.css({
        "height": (newMapHeight - (100 + 42 * 3)) + 'px'
      });
    } else if (alarmNum >= 5) {
      $MapContainer.css({
        "height": (newMapHeight - 266) + 'px'
      });
    }
  },
  // 信息列表自适应显示
  carStateAdapt: function (type) {
    if (!($("#scalingBtn").hasClass("fa fa-chevron-up"))) {
      var listLength;
      var id;
      if (type == 1) {//状态信息车
        listLength = stateName.length;
        id = 'realTimeStateTable-div';
      } else if (type == 3) { //报警信息车
        listLength = alarmName.length;
        id = 'realTimeCall';
      }
      ;
      if (type == 4) {//日志
        listLength = $("#logging tbody tr").length;
        id = 'operationLogTable';
      }
      if (listLength <= 5 && $('#TabFenceBox').hasClass('active')) {
        if (listLength == 5) {
          $("#" + id).css({
            "max-height": "266px",
            "overflow": "auto",
          });
        }
        if (listLength == 0) {
          $MapContainer.css({'height': newMapHeight + 'px'});
        } else {
          $MapContainer.css({'height': (newMapHeight - (41 * listLength + 60)) + 'px'});
        }
        ;
      } else {
        if ($('#scalingBtn').hasClass('fa-chevron-down') && $('#TabFenceBox').hasClass('active')) {
          if (id == "operationLogTable") {
            $("#" + id).css({
              "max-height": "248px",
              "overflow": "auto",
            });
          } else {
            $("#" + id).css({
              "max-height": "266px",
              "overflow": "auto",
            });
          }
          $MapContainer.css({'height': (newMapHeight - (41 * 5 + 60)) + 'px'});
        }
        ;
      }
      ;
    }
  },
  //确定ID
  confirmID: function (type) {
    var id;
    if (type == 'vehicle' || type == 'people' || type == 'thing' || type == 'state') {
      id = 'realTimeStateTable';
    }
    if (type == 'alarm') {
      id = 'alarmTable';
    }
    return id;
  },
  //格式时间得到时间差
  gettimestamp: function (time) {
    if (time.length == 12) {
      var time = 20 + time.substring(0, 2) + "-" + time.substring(2, 4) + "-" + time.substring(4, 6) + " " +
          time.substring(6, 8) + ":" + time.substring(8, 10) + ":" + time.substring(10, 12);
    } else if (time.length == 14) {
      var time = time.substring(0, 4) + "-" + time.substring(4, 6) + "-" + time.substring(6, 8) + " " +
          time.substring(8, 10) + ":" + time.substring(10, 12) + ":" + time.substring(12, 14);
    }
    var timestamp = Date.parse(new Date(time));
    return timestamp / 1000;
  },
  //保留一位小数
  saveonedecimal: function (str) {
    var str = Number(str).toFixed(1);
    var strlast = str.substr(str.lenght - 1, 1);
    if (strlast == "0" || strlast == 0) {
      str = Math.round(str);
    }
    return str;
  },
  //过滤小数点为0
  fiterNumber: function (data) {
    if (data == null || data == undefined || data == "") {
      return data;
    }
    var data = data.toString();
    data = parseFloat(data);
    return data;

  },
    /**
     * 设置终端车牌号
     */
    parametersPlate:function () {
        if (dataTableOperation.isBrand()) {
            $("#setTerminalPlate").ajaxSubmit(function (data) {
                $("#setPlateNumber").modal("hide");
                if (JSON.parse(data).success) {
                    layer.msg(publicIssuedSuccess)
                    setTimeout("dataTableOperation.logFindCilck()", 500);
                }else {
                    layer.msg(JSON.parse(data).msg);
                }
            });
        }
    },

    isBrand:function () {
        return $("#setTerminalPlate").validate({
            rules: {
                brand: {
                    required: true,
                    minlength: 2,
                    maxlength: 20,
                    isBrand: true,
                    remote: {
                        type: "post",
                        async: false,
                        url: "/clbs/m/basicinfo/monitoring/vehicle/repetition",
                        dataType: "json",
                        data: {
                            username: function () {
                                return $("#brand").val();
                            }
                        },
                        dataFilter: function (data, type) {
                            var oldV = $("#oldNumber").val();
                            var newV = $("#brand").val();
                            var data2 = data;
                            if (oldV == newV) {
                                return true;
                            } else {
                                if (data2 == "true") {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                }
            },
            messages: {
                brand: {
                    required: vehicleBrandNull,
                    maxlength: vehicleBrandError,
                    minlength: vehicleBrandError,
                    isBrand: vehicleBrandError,
                    remote: vehicleBrandExists
                }
            }

        }).form();
    },

    /**
     * 下发OBD
     */
    toSetOBD:function () {
        if (dataTableOperation.OBDValidate()) {
            $("#setOBD").ajaxSubmit(function (data) {
                $("#OBD").modal("hide");
                if (JSON.parse(data).success) {
                    layer.msg(publicIssuedSuccess)
                    setTimeout("dataTableOperation.logFindCilck()", 500);
                }else {
                    layer.msg(JSON.parse(data).msg);
                }
            });
        }
    },


    OBDValidate: function () {
        return $("#setOBD").validate({
            rules: {
                classification:{
                    required:true
                },
                model:{
                  required:true
                },
                uploadTime:{
                  isRightNumber:true,
                  range:[1,10]
                }
            },
            messages: {
                classification: {
                    required: '请选择车型分类'
                },
                model:{
                  required:'请选择类型'
                },
                uploadTime:{
                  isRightNumber:'请输入正确的数字',
                  range:'请输入1-10之间的整数'
                }
            }

        }).form();
    }

};
$(function () {
    $('input').inputClear().on('onClearEvent', function (e, data) {
        var id = data.id;
        if (id == 'search_condition') {
            treeMonitoring.alltree();
        }
        ;
        if (id == 'searchVehicle') {
            fenceOperation.initBindFenceTree();
        }
        ;
        if (id == 'searchFence') {
            search_ztree('fenceDemo', id, 'fence');
        }
        ;
        if (id == 'vFenceSearch') {
            search_ztree('vFenceTree', id, 'fence');
        }
        ;
        if (id == 'startPoint' || id == 'endPoint' || id.indexOf('wayPoint') != -1) {
            $('#' + id).attr('data-address', '').removeAttr('data-lnglat');
        }
        ;
    });
    //地图
    var lineVid = [];//在线车辆id
    var allCid = [];
    var missVid = []//离线车辆id
    var lineAndRun = []//在线行驶id;
    var lineAndStop = [];//在线停止id
    var lineAndAlarm = [];//报警
    var lineAndmiss = [];//未定位
    var offLineTable = [];
    var overSpeed = [];
    var vnodesId = [];
    var vnodemId = [];
    var vnodelmId = [];
    var vnoderId = [];
    var vnodeaId = [];
    var vnodespId = [];
    var markerRealTime;
    var lineArr = [];
    var pathsTwo = null;
    var myTable;
    var nmoline;
    //初始化页面
    pageLayout.init();
    pageLayout.arrayExpand();
    pageLayout.createMap();
    pageLayout.responseSocket();
    fenceOperation.init();
    fenceOperation.fenceBindList();
    // fenceOperation.fenceEnterprise();
    amapOperation.init();
    treeMonitoring.init();
    pageLayout.getNowFormatDate();
    $("[data-toggle='tooltip']").tooltip();
    //右边菜单显示隐藏切换
    $("#toggle-left").on("click", pageLayout.toggleLeft);
    //左侧操作树点击隐藏
    $("#goHidden").on("click", pageLayout.goHidden);
    //左侧操作树点击显示
    $goShow.on("click", pageLayout.goShow);
    //输入时自动查询
    var inputChange;
    // $("#search_condition").unbind("focus");
    $("#search_condition").on('input propertychange', function (value) {
        var search_condition_value = $("#search_condition").val();
        if (search_condition_value) {
            if (inputChange !== undefined) {
                clearTimeout(inputChange);
            }
            ;
            inputChange = setTimeout(function () {
                // search
                treeMonitoring.search_condition();
            }, 500);
        }
    });
    //右键显示菜单节点跳动问题
    scorllDefaultTreeTop = 0;
    $("#thetree").scroll(function () {
        scorllDefaultTreeTop = $("#thetree").scrollTop();
    });
    // 搜索类型下拉框change事件
    $("#searchType").change(treeMonitoring.search_condition);
    //刷新文件树
    $("#refresh").on("click", treeMonitoring.refreshTree);
    $('#originalDataModalClose').on('click', treeMonitoring.modalCloseFun)
    $('#controlGetData').on('click', treeMonitoring.isGetOriginalData);
    // $('#copyOriginalData').on('click', treeMonitoring.copyDataFun);
    $('#clearOriginalData').on('click', treeMonitoring.clearDataFun);
    //状态信息可以拖动
    $("#realTimeStatus").on("click", function () {
        flagState = true;
        activeIndex = 1;
        dataTableOperation.carStateAdapt(activeIndex);
    });
    //报警记录不拖动
    $("#realTtimeAlarm").on("click", function () {
        flagState = false;
        activeIndex = 3;
        dataTableOperation.carStateAdapt(activeIndex)
    });
    //日志点击不拖动
    $("#operationLog").on("click", function () {
        flagState = false;
        activeIndex = 4;
        dataTableOperation.carStateAdapt(activeIndex);
        dataTableOperation.logFindCilck()
    });
    $("#dragDIV").mousedown(pageLayout.dragDiv);
    //$("#btn-videoRealTime-show").on("click",pageLayout.videoRealTimeShow);
    //报警弹窗显示
    $("#showAlarmWin").on("click", pageLayout.showAlarmWindow);
    //报警数量块单击
    $showAlarmWinMark.bind("click", pageLayout.showAlarmWinMarkRight);
    //屏蔽浏览器右键菜单
    $(".contextMenuContent,#showAlarmWin").bind("contextmenu", function (e) {
        return false;
    });
    $showAlarmWinMark.contextmenu();
    //最小化
    $(".alarmSettingsSmall").bind("click", pageLayout.alarmToolMinimize);
    //关闭声音
    $(".alarmSound").bind("click", pageLayout.alarmOffSound);
    //关闭闪烁
    $(".alarmFlashes").bind("click", pageLayout.alarmOffFlashes);
    // 应答确定
    $('#parametersResponse').on('click', pageLayout.platformMsgAck);
    //点击显示报警设置详情
    $(".alarmSettingsBtn").bind("click", pageLayout.showAlarmInfoSettings);
    $("ul.dropdown-menu").on("click", function (e) {
        e.stopPropagation();
    });
    // 电子围栏  树结构搜索
    $("#searchFence").bind('input oninput', fenceOperation.searchFenceCarSearch);
    //电子围栏搜索-刷新功能
    $("#refreshFence").on('click', function () {
        $("#searchFence").val('');
        fenceOperation.searchFenceCarSearch();
    });
    $("#vFenceSearch").bind('input oninput', treeMonitoring.vsearchFenceCarSearch);
    $("#fixSpan").mouseover(function () {
        $("#recentlyC").removeClass("hidden")
    });
    $("#fixSpan").mouseout(function () {
        $("#recentlyC").mouseover(function () {
            $("#recentlyC").removeClass("hidden");
        });
        $("#recentlyC").mouseout(function () {
            $("#recentlyC").addClass("hidden");
        });
    });
    $("#warningManageClose").on("click", function () {
        $("#warningManage").modal('hide')
    });
    $("#warningManagePhoto").bind("click", dataTableOperation.photo);
    $("#warningManageSend").bind("click", dataTableOperation.send);
    $("#warningManageAffirm").bind("click", function () {
        dataTableOperation.handleAlarm("人工确认报警")
    });
    $("#warningManageCancel").bind("click", function () {
        dataTableOperation.handleAlarm("不做处理")
    });
    $("#warningManageFuture").bind("click", function () {
        dataTableOperation.handleAlarm("将来处理")
    });
    // $("#magnifyClick, #shrinkClick, #countClick, #queryClick, #defaultMap, #realTimeRC, #btn-videoRealTime-show, #displayClick,#mapDropSetting").on("click",amapOperation.toolClickList);

    // wjk
    //先注释掉
    // $("#magnifyClick, #shrinkClick, #countClick, #queryClick, #defaultMap, #realTimeRC, #btn-videoRealTime-show, #displayClick,#mapDropSetting,#phoneCall").on("click",amapOperation.toolClickList);
    $("#magnifyClick, #shrinkClick, #countClick, #queryClick, #defaultMap, #realTimeRC, #btn-videoRealTime-show, #displayClick,#mapDropSetting").on("click", amapOperation.toolClickList);

    $("#toolClick").on("click", pageLayout.toolClick);
    $("#save").bind("click", fenceOperation.doSubmits1);

    //清空添加关键点表单
    $("#monitoringTagClose").bind("click", function () {
        $("#addMonitoringTag input").each(function (index, input) {
            $(input).val('');
        })
        $("#addMonitoringTag #description").val('');
    });

    $("#searchCarClose").on("click", fenceOperation.searchCarClose);
    $("#annotatedSave").on("click", fenceOperation.annotatedSave);
    $("#threadSave").on("click", fenceOperation.threadSave);
    $("#rectangleSave").on("click", fenceOperation.rectangleSave);
    $("#polygonSave").on("click", fenceOperation.polygonSave);
    $("#roundSave").on("click", fenceOperation.roundSave);
    $(".modalClose").on("click", fenceOperation.clearErrorMsg);
    $("#searchVehicle").bind('input oninput', fenceOperation.searchVehicleSearch);
    // 滚动展开绑定围栏的监控对象树结构
    // 滚动展开
    $("#bindVehicleTreeDiv").scroll(function () {
        var zTree = $.fn.zTree.getZTreeObj("treeDemoFence");
        zTreeScroll(zTree, this);
    });
    // 点击添加(按围栏 )
    $("#addBtn").bind("click", fenceOperation.addBtnClick);
    $("#tableCheckAll").bind("click", fenceOperation.tableCheckAll);
    //点击移除围栏
    $("#removeBtn").bind("click", fenceOperation.removeBtnClick);
    //check选择
    $("#checkAll").bind("click", fenceOperation.checkAllClick);
    //依例全设
    $("#setAll").bind("click", fenceOperation.setAllClick);
    // 提交(按围栏)
    $("#fenceSaveBtn").bind("click", fenceOperation.fenceSaveBtnClick);
    // 围栏绑定-取消按钮
    $("#fenceCancelBtn").bind("click", fenceOperation.fenceCancelBtnClick);
    // 批量下发
    $("#send_model").bind("click", fenceOperation.sendModelClick);
    //批量删除
    $("#del_model").bind("click", fenceOperation.delModelClick);
    // 模糊搜索围栏绑定列表
    $("#search_button").bind("click", fenceOperation.searchBindTable);
    $("body").bind("click", fenceOperation.bodyClickEvent);
    $("#hourseSelect tr td").bind("click", fenceOperation.hourseSelectClick);
    $("#minuteSelect tr td").bind("click", fenceOperation.minuteSelectClick);
    $("#secondSelect tr td").bind("click", fenceOperation.secondSelectClick);
    //切换电子围栏
    $("#TabCarBox").bind("click", fenceOperation.TabCarBox);
    //切换监控对象
    $("#TabFenceBox").bind("click", fenceOperation.TabFenceBox);
    $("#rectangleEditClose").bind("click", fenceOperation.rectangleEditClose);
    //围栏取消
    $("#markFenceClose").bind("click", fenceOperation.markFenceClose);
    $("#saveSection").bind("click", fenceOperation.doSubmitsMonitor);
    $("#lineEditClose").bind("click", fenceOperation.lineEditClose);
    $("#circleFenceClose").bind("click", fenceOperation.circleFenceClose);
    $("#polygonFenceClose").bind("click", fenceOperation.polygonFenceClose);
    $("#bingListClick").bind("click", fenceOperation.bingListClick);
    $("#fenceDemo").bind('contextmenu', function (event) {
        return false
    });
    $("#parameters").bind("click", function () {
        treeMonitoring.parameter(parametersID)
    });
    $("#askQuestions-add-btn").on("click", fenceOperation.addaskQuestions);
    $("#goPhotographs").bind("click", dataTableOperation.takePhoto);
    $("#goRecordCollect").bind("click", treeMonitoring.goRecordCollect);
    $("#goRecordSend").bind("click", treeMonitoring.goRecordSend);
    $("#goPhotographsForAlarm").bind("click", dataTableOperation.takePhotoForAlarm);
    $("#goVideotapes").bind("click", dataTableOperation.getVideo);
    $("#goRegularReport").bind("click", dataTableOperation.goRegularReport);
    $("#goDistanceReport").bind("click", dataTableOperation.goDistanceReport);
    $("#goTimeInterval").bind("click", dataTableOperation.goTimeInterval);
    $("#parametersPlate").bind("click", dataTableOperation.parametersPlate);
    $("#toSetOBD").bind("click", dataTableOperation.toSetOBD);
    $("#gpListening").bind("click", dataTableOperation.gpListening);
    $("#goOverspeedSettings").bind("click", dataTableOperation.goOverspeedSettings);
    $("#emergency").bind("click", dataTableOperation.emergency);
    $("#displayTerminalDisplay").bind("click", dataTableOperation.displayTerminalDisplay);
    $("#tts").bind("click", dataTableOperation.tts);
    $("#advertisingDisplay").bind("click", dataTableOperation.advertisingDisplay);
    $("#goTxtSend").bind("click", dataTableOperation.goTxtSend);
    $("#goTxtSendForAlarm").bind("click", dataTableOperation.goTxtSendForAlarm);
    $("#emergency1").bind("click", dataTableOperation.emergency1);
    $("#tts1").bind("click", dataTableOperation.tts1);
    $("#advertisingDisplay1").bind("click", dataTableOperation.advertisingDisplay1);
    $("#goSendQuestion").bind("click", dataTableOperation.goSendQuestion);
    $("#goTelBack").bind("click", dataTableOperation.goTelBack);
    $("#goMultimediaRetrieval").bind("click", dataTableOperation.goMultimediaRetrieval);
    $("#deleteSign").bind("click", dataTableOperation.deleteSign);
    $("#goMultimediaUploads").bind("click", dataTableOperation.goMultimediaUploads);
    $("#goRecordUpload").bind("click", dataTableOperation.goRecordUpload);
    $("#goOriginalOrder").bind("click", dataTableOperation.goOriginalOrder);
    //录像时间轴
    $("#videoPlay").on("click", dataTableOperation.recordingTimelinePlay);
    //录音时间轴
    $("#voicePlay").on("click", dataTableOperation.tapingTimelinePlay);
    $("#sectionRateLimitingClose").on("click", fenceOperation.sectionRateLimitingClose);
    $("#goInfoService").bind("click", dataTableOperation.goInfoService);
    //上报频率设置
    $("#reportSet").bind("click", dataTableOperation.reportSet);
    //定点和校时
    $("#goInfofixedPointAndTiming").bind("click", dataTableOperation.goInfofixedPointAndTiming);
    //位置跟踪
    $("#positionTrailing").bind("click", dataTableOperation.positionTrailing);
    //透传指令
    $("#goThroughOrder").bind("click", dataTableOperation.goThroughOrder);

    $('.lngLat_show').on('click', fenceOperation.lngLatTextShow);
    $('#province, #city, #district, #street').on('change', function () {
        fenceOperation.administrativeAreaSelect(this)
    });
    $('#administrativeSave').on('click', fenceOperation.administrativeSave);
    $('#administrativeClose').on('click', fenceOperation.administrativeClose);
    $('#tableCheckAll').on('click', function () {
        $("input[name='subChk']").prop("checked", this.checked);
    });
    //树优化测试代码
    $online.bind("click", {type: 1}, treeMonitoring.onlines);
    $chooseNot.bind("click", {type: 6}, treeMonitoring.onlines);
    $chooseAlam.bind("click", {type: 4}, treeMonitoring.onlines);
    $chooseRun.bind("click", {type: 3}, treeMonitoring.onlines);
    $chooseStop.bind("click", {type: 2}, treeMonitoring.onlines);
    $chooseOverSeep.bind("click", {type: 5}, treeMonitoring.onlines);
    $("#chooseHeartBeat").bind("click", {type: 9}, treeMonitoring.onlines);
    /* $("#chooseMissLine").bind("click",treeMonitoring.misslines);*/
    $("#chooseAll").bind("click", treeMonitoring.alltree);
    /* $("#chooseMiss").bind("click",treeMonitoring.misslines);*/
    var p = 0, t = 0, y = 0;
    $("#thetree").scroll(function () {
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        p = $(this).scrollTop();
        if (t <= p) {//下滚
            // 获取没有展开的分组节点
            var notExpandNodes = zTree.getNodesByFilter(assignmentNotExpandFilter);
            if (notExpandNodes != undefined && notExpandNodes.length > 0) {
                for (var i = 0; i < notExpandNodes.length; i++) {
                    var node = notExpandNodes[i];
                    var tid = node.tId + "_a";
                    var divHeight = $("#thetree").offset().top;
                    var nodeHeight = $("#" + tid).offset().top;
                    if (nodeHeight - divHeight > 696) {
                        break;
                    }
                    if (nodeHeight - divHeight > 0 && nodeHeight - divHeight < 696) {
                        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                        zTree.expandNode(node, true, true, false, true);
                        node.children[0].open = true;
                    }
                }
            }
        }
        setTimeout(function () {
            t = p;
        }, 0);
    });
    //树优化测试代码
    $('#addWayToPoint').on('click', fenceOperation.addWayToPoint);
    $('#lineDragRouteClose').on('click', fenceOperation.lineDragRouteClose);
    $('#lineDragRouteSave').on('click', fenceOperation.lineDragRouteSave);
    //围栏所属企业
    $('#markerFenceEnterprise, #markerFenceEnterprise-select, #lineFenceEnterprise, #lineFenceEnterprise-select, #rectangleFenceEnterprise, #rectangleFenceEnterprise-select, #circleFenceEnterprise, #circleFenceEnterprise-select, #polygonFenceEnterprise, #polygonFenceEnterprise-select, #areaFenceEnterprise, #areaFenceEnterprise-select, #dragRouteFenceEnterprise, #dragRouteFenceEnterprise-select').on('click', treeMonitoring.enterpriseShow);
    //显示设置
    $("#smoothMove,#logoDisplay,#icoUp").on("click", pageLayout.smoothMoveOrlogoDisplayClickFn);
    //地图设置
    $("#realTimeRC,#defaultMap,#googleMap").on("click", pageLayout.mapDropdownSettingClickFn);
    $("#fenceToolBtn").on("click", treeMonitoring.fenceToolClickSHFn);
    $("#TabCarBox,#TabFenceBox").on("click", treeMonitoring.fenceAndVehicleFn);
    // 跳转至轨迹回放
    $("#treeToTrackBlack").on("click", treeMonitoring.treeToTrackBlack);


    //关闭并还原提问下发表单
    $("#closeSendQuestion").on("click", function () {
        $("#askQuestionsIssued input[type='text']").val('');
        $("#askQuestionsIssued .error").hide();
        $('#answer-add-content div[id^="answer-add"]').remove();
    })
    //监听提问下发表单中input的value变化
    var askQuestionsIssued = $("#askQuestionsIssued");
    askQuestionsIssued.on("input propertychange change", 'input', function (event) {
        var inputVal = $(this).val();
        if (inputVal == "") {
            $(this).siblings(".error").show();
        }
        else {
            $(this).siblings(".error").hide();
        }
        //dataTableOperation.sendQuestionValidateTwo();
    });
    $("#askQuestionsIssued input").inputClear().on('onClearEvent', function (e) {
        $(this).siblings(".error").show();
    });

    //点击弹窗中的取消按钮后隐藏表单验证报错信息
    $("button").on("click", function () {
        var thisMiss = $(this).data("dismiss");
        if (thisMiss == "modal") {
            $("label.error").hide();
        }
    })

    //获取图标方向
    var icoUrl = '/clbs/m/personalized/ico/getIcodirection';
    json_ajax("POST", icoUrl, "json", false, null, function (data) {
        var icoMsg = data.msg;
        if (icoMsg == 'true') {
            icoUpFlag = true;
            $("#icoUp").attr("checked", true);
            $("#icoUpLab").addClass("preBlue");
        }
        else {
            icoUpFlag = false;
            $("#icoUp").attr("checked", false);
            $("#icoUpLab").removeClass("preBlue");
        }
    });

    $('.obdIco').on('click', function () {
        var highLight = $("#realTimeStateTable .tableHighlight-blue,#realTimeStateTable .tableHighlight");
        var len = highLight.length;
        if (len > 0) {
            $(this).hide();
            $('.loadingBox').show();
            $('#obdInfo').html('');
            amapOperation.setObdInfo();
            $('.obdContent').slideDown();
        } else {
            var curSelect = $('.curSelectedNode');
            var checkFlag = curSelect.prev('span.button').hasClass('checkbox_true_full');
            if (curSelect.length > 0 && checkFlag) {
                $(this).hide();
                $('.loadingBox').hide();
                $("#obdName").html();
                var name = curSelect.attr('title');
                var id = curSelect.attr('data-id');
                amapOperation.setObdInfo(name, id);
                $('.obdContent').slideDown();
                return;
            }
            layer.msg('请双击监控对象');
        }
    });
    $('.removeIcon').on('click', function () {
        $('.obdContent').slideUp();
        setTimeout(function () {
            $('.obdIco').show();
        }, 500)
    })
})

/*!
 * Bootstrap Context Menu
 * ========================================================= */
;(function($){'use strict';var toggle='[data-toggle="context"]';var ContextMenu=function(element,options){this.$element=$(element);this.before=options.before||this.before;this.onItem=options.onItem||this.onItem;this.scopes=options.scopes||null;if(options.target){this.$element.data('target',options.target)}this.listen()};ContextMenu.prototype={constructor:ContextMenu,show:function(e){var $menu,evt,tp,items,relatedTarget={relatedTarget:this,target:e.currentTarget};if(this.isDisabled())return;this.closemenu();if(this.before.call(this,e,$(e.currentTarget))===false)return;$menu=this.getMenu();$menu.trigger(evt=$.Event('show.bs.context',relatedTarget));tp=this.getPosition(e,$menu);items='li:not(.divider)';$menu.attr('style','').css(tp).addClass('open').on('click.context.data-api',items,$.proxy(this.onItem,this,$(e.currentTarget))).trigger('shown.bs.context',relatedTarget);$('html').on('click.context.data-api',$menu.selector,$.proxy(this.closemenu,this));return false},closemenu:function(e){var $menu,evt,items,relatedTarget;$menu=this.getMenu();if(!$menu.hasClass('open'))return;relatedTarget={relatedTarget:this};$menu.trigger(evt=$.Event('hide.bs.context',relatedTarget));items='li:not(.divider)';$menu.removeClass('open').off('click.context.data-api',items).trigger('hidden.bs.context',relatedTarget);$('html').off('click.context.data-api',$menu.selector);if(e){e.stopPropagation()}},keydown:function(e){if(e.which==27)this.closemenu(e)},before:function(e){return true},onItem:function(e){return true},listen:function(){this.$element.on('contextmenu.context.data-api',this.scopes,$.proxy(this.show,this));$('html').on('click.context.data-api',$.proxy(this.closemenu,this));$('html').on('keydown.context.data-api',$.proxy(this.keydown,this));$('#context-menu').bind('click.context.data-api',$(this).hasClass('open'))},destroy:function(){this.$element.off('.context.data-api').removeData('context');$('html').off('.context.data-api')},isDisabled:function(){return this.$element.hasClass('disabled')||this.$element.attr('disabled')},getMenu:function(){var selector=this.$element.data('target'),$menu;if(!selector){selector=this.$element.attr('href');selector=selector&&selector.replace(/.*(?=#[^\s]*$)/,'')}$menu=$(selector);return $menu&&$menu.length?$menu:this.$element.find(selector)},getPosition:function(e,$menu){var mouseX=e.clientX,mouseY=e.clientY,boundsX=$(window).width(),boundsY=$(window).height(),menuWidth=$menu.find('.dropdown-menu').outerWidth(),menuHeight=$menu.find('.dropdown-menu').outerHeight(),tp={"position":"absolute","z-index":9999},Y,X,parentOffset;if(mouseY+menuHeight>boundsY){Y={"top":mouseY-menuHeight+$(window).scrollTop()}}else{Y={"top":mouseY-menuHeight+$(window).scrollTop()}}if((mouseX+menuWidth>boundsX)&&((mouseX-menuWidth)>0)){X={"left":mouseX-menuWidth+$(window).scrollLeft()}}else{X={"left":mouseX-menuWidth+$(window).scrollLeft()}}parentOffset=$menu.offsetParent().offset();X.left=X.left-parentOffset.left;Y.top=Y.top-parentOffset.top;return $.extend(tp,Y,X)}};$.fn.contextmenu=function(option,e){return this.each(function(){var $this=$(this),data=$this.data('context'),options=(typeof option=='object')&&option;if(!data)$this.data('context',(data=new ContextMenu($this,options)));if(typeof option=='string')data[option].call(data,e)})};$.fn.contextmenu.Constructor=ContextMenu;$(document).on('contextmenu.context.data-api',function(){$(toggle).each(function(){var data=$(this).data('context');if(!data)return;data.closemenu()})}).on('contextmenu.context.data-api',toggle,function(e){$(this).contextmenu('show',e);e.preventDefault();e.stopPropagation()})}(jQuery));

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

/*!
 * jQuery Form Plugin
 * version: 3.51.0-2014.06.20
 * Requires jQuery v1.5 or later
 * Copyright (c) 2014 M. Alsup
 * Examples and documentation at: http://malsup.com/jquery/form/
 * Project repository: https://github.com/malsup/form
 * Dual licensed under the MIT and GPL licenses.
 * https://github.com/malsup/form#copyright-and-license
 */
/*global ActiveXObject */
(function(factory){"use strict";if(typeof define==='function'&&define.amd){define(['jquery'],factory)}else{factory((typeof(jQuery)!='undefined')?jQuery:window.Zepto)}}(function($){"use strict";var feature={};feature.fileapi=$("<input type='file'/>").get(0).files!==undefined;feature.formdata=window.FormData!==undefined;var hasProp=!!$.fn.prop;$.fn.attr2=function(){if(!hasProp){return this.attr.apply(this,arguments)}var val=this.prop.apply(this,arguments);if((val&&val.jquery)||typeof val==='string'){return val}return this.attr.apply(this,arguments)};$.fn.ajaxSubmit=function(options){if(!this.length){log('ajaxSubmit: skipping submit process - no element selected');return this}var method,action,url,$form=this;if(typeof options=='function'){options={success:options}}else if(options===undefined){options={}}method=options.type||this.attr2('method');action=options.url||this.attr2('action');url=(typeof action==='string')?$.trim(action):'';url=url||window.location.href||'';if(url){url=(url.match(/^([^#]+)/)||[])[1]}options=$.extend(true,{url:url,success:$.ajaxSettings.success,type:method||$.ajaxSettings.type,iframeSrc:/^https/i.test(window.location.href||'')?'javascript:false':'about:blank'},options);var veto={};this.trigger('form-pre-serialize',[this,options,veto]);if(veto.veto){log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');return this}if(options.beforeSerialize&&options.beforeSerialize(this,options)===false){log('ajaxSubmit: submit aborted via beforeSerialize callback');return this}var traditional=options.traditional;if(traditional===undefined){traditional=$.ajaxSettings.traditional}var elements=[];var qx,a=this.formToArray(options.semantic,elements);if(options.data){options.extraData=options.data;qx=$.param(options.data,traditional)}if(options.beforeSubmit&&options.beforeSubmit(a,this,options)===false){log('ajaxSubmit: submit aborted via beforeSubmit callback');return this}this.trigger('form-submit-validate',[a,this,options,veto]);if(veto.veto){log('ajaxSubmit: submit vetoed via form-submit-validate trigger');return this}var q=$.param(a,traditional);if(qx){q=(q?(q+'&'+qx):qx)}if(options.type.toUpperCase()=='GET'){options.url+=(options.url.indexOf('?')>=0?'&':'?')+q;options.data=null}else{options.data=q}var callbacks=[];if(options.resetForm){callbacks.push(function(){$form.resetForm()})}if(options.clearForm){callbacks.push(function(){$form.clearForm(options.includeHidden)})}if(!options.dataType&&options.target){var oldSuccess=options.success||function(){};callbacks.push(function(data){var fn=options.replaceTarget?'replaceWith':'html';$(options.target)[fn](data).each(oldSuccess,arguments)})}else if(options.success){callbacks.push(options.success)}options.success=function(data,status,xhr){var context=options.context||this;for(var i=0,max=callbacks.length;i<max;i++){callbacks[i].apply(context,[data,status,xhr||$form,$form])}};if(options.error){var oldError=options.error;options.error=function(xhr,status,error){var context=options.context||this;oldError.apply(context,[xhr,status,error,$form])}}if(options.complete){var oldComplete=options.complete;options.complete=function(xhr,status){var context=options.context||this;oldComplete.apply(context,[xhr,status,$form])}}var fileInputs=$('input[type=file]:enabled',this).filter(function(){return $(this).val()!==''});var hasFileInputs=fileInputs.length>0;var mp='multipart/form-data';var multipart=($form.attr('enctype')==mp||$form.attr('encoding')==mp);var fileAPI=feature.fileapi&&feature.formdata;log("fileAPI :"+fileAPI);var shouldUseFrame=(hasFileInputs||multipart)&&!fileAPI;var jqxhr;if(options.iframe!==false&&(options.iframe||shouldUseFrame)){if(options.closeKeepAlive){$.get(options.closeKeepAlive,function(){jqxhr=fileUploadIframe(a)})}else{jqxhr=fileUploadIframe(a)}}else if((hasFileInputs||multipart)&&fileAPI){jqxhr=fileUploadXhr(a)}else{jqxhr=$.ajax(options)}$form.removeData('jqxhr').data('jqxhr',jqxhr);for(var k=0;k<elements.length;k++){elements[k]=null}this.trigger('form-submit-notify',[this,options]);return this;function deepSerialize(extraData){var serialized=$.param(extraData,options.traditional).split('&');var len=serialized.length;var result=[];var i,part;for(i=0;i<len;i++){serialized[i]=serialized[i].replace(/\+/g,' ');part=serialized[i].split('=');result.push([decodeURIComponent(part[0]),decodeURIComponent(part[1])])}return result}function fileUploadXhr(a){var formdata=new FormData();for(var i=0;i<a.length;i++){formdata.append(a[i].name,a[i].value)}if(options.extraData){var serializedData=deepSerialize(options.extraData);for(i=0;i<serializedData.length;i++){if(serializedData[i]){formdata.append(serializedData[i][0],serializedData[i][1])}}}options.data=null;var s=$.extend(true,{},$.ajaxSettings,options,{contentType:false,processData:false,cache:false,type:method||'POST'});if(options.uploadProgress){s.xhr=function(){var xhr=$.ajaxSettings.xhr();if(xhr.upload){xhr.upload.addEventListener('progress',function(event){var percent=0;var position=event.loaded||event.position;var total=event.total;if(event.lengthComputable){percent=Math.ceil(position/total*100)}options.uploadProgress(event,position,total,percent)},false)}return xhr}}s.data=null;var beforeSend=s.beforeSend;s.beforeSend=function(xhr,o){if(options.formData){o.data=options.formData}else{o.data=formdata}if(beforeSend){beforeSend.call(this,xhr,o)}};return $.ajax(s)}function fileUploadIframe(a){var form=$form[0],el,i,s,g,id,$io,io,xhr,sub,n,timedOut,timeoutHandle;var deferred=$.Deferred();deferred.abort=function(status){xhr.abort(status)};if(a){for(i=0;i<elements.length;i++){el=$(elements[i]);if(hasProp){el.prop('disabled',false)}else{el.removeAttr('disabled')}}}s=$.extend(true,{},$.ajaxSettings,options);s.context=s.context||s;id='jqFormIO'+(new Date().getTime());if(s.iframeTarget){$io=$(s.iframeTarget);n=$io.attr2('name');if(!n){$io.attr2('name',id)}else{id=n}}else{$io=$('<iframe name="'+id+'" src="'+s.iframeSrc+'" />');$io.css({position:'absolute',top:'-1000px',left:'-1000px'})}io=$io[0];xhr={aborted:0,responseText:null,responseXML:null,status:0,statusText:'n/a',getAllResponseHeaders:function(){},getResponseHeader:function(){},setRequestHeader:function(){},abort:function(status){var e=(status==='timeout'?'timeout':'aborted');log('aborting upload... '+e);this.aborted=1;try{if(io.contentWindow.document.execCommand){io.contentWindow.document.execCommand('Stop')}}catch(ignore){}$io.attr('src',s.iframeSrc);xhr.error=e;if(s.error){s.error.call(s.context,xhr,e,status)}if(g){$.event.trigger("ajaxError",[xhr,s,e])}if(s.complete){s.complete.call(s.context,xhr,e)}}};g=s.global;if(g&&0===$.active++){$.event.trigger("ajaxStart")}if(g){$.event.trigger("ajaxSend",[xhr,s])}if(s.beforeSend&&s.beforeSend.call(s.context,xhr,s)===false){if(s.global){$.active--}deferred.reject();return deferred}if(xhr.aborted){deferred.reject();return deferred}sub=form.clk;if(sub){n=sub.name;if(n&&!sub.disabled){s.extraData=s.extraData||{};s.extraData[n]=sub.value;if(sub.type=="image"){s.extraData[n+'.x']=form.clk_x;s.extraData[n+'.y']=form.clk_y}}}var CLIENT_TIMEOUT_ABORT=1;var SERVER_ABORT=2;function getDoc(frame){var doc=null;try{if(frame.contentWindow){doc=frame.contentWindow.document}}catch(err){log('cannot get iframe.contentWindow document: '+err)}if(doc){return doc}try{doc=frame.contentDocument?frame.contentDocument:frame.document}catch(err){log('cannot get iframe.contentDocument: '+err);doc=frame.document}return doc}var csrf_token=$('meta[name=csrf-token]').attr('content');var csrf_param=$('meta[name=csrf-param]').attr('content');if(csrf_param&&csrf_token){s.extraData=s.extraData||{};s.extraData[csrf_param]=csrf_token}function doSubmit(){var t=$form.attr2('target'),a=$form.attr2('action'),mp='multipart/form-data',et=$form.attr('enctype')||$form.attr('encoding')||mp;form.setAttribute('target',id);if(!method||/post/i.test(method)){form.setAttribute('method','POST')}if(a!=s.url){form.setAttribute('action',s.url)}if(!s.skipEncodingOverride&&(!method||/post/i.test(method))){$form.attr({encoding:'multipart/form-data',enctype:'multipart/form-data'})}if(s.timeout){timeoutHandle=setTimeout(function(){timedOut=true;cb(CLIENT_TIMEOUT_ABORT)},s.timeout)}function checkState(){try{var state=getDoc(io).readyState;log('state = '+state);if(state&&state.toLowerCase()=='uninitialized'){setTimeout(checkState,50)}}catch(e){log('Server abort: ',e,' (',e.name,')');cb(SERVER_ABORT);if(timeoutHandle){clearTimeout(timeoutHandle)}timeoutHandle=undefined}}var extraInputs=[];try{if(s.extraData){for(var n in s.extraData){if(s.extraData.hasOwnProperty(n)){if($.isPlainObject(s.extraData[n])&&s.extraData[n].hasOwnProperty('name')&&s.extraData[n].hasOwnProperty('value')){extraInputs.push($('<input type="hidden" name="'+s.extraData[n].name+'">').val(s.extraData[n].value).appendTo(form)[0])}else{extraInputs.push($('<input type="hidden" name="'+n+'">').val(s.extraData[n]).appendTo(form)[0])}}}}if(!s.iframeTarget){$io.appendTo('body')}if(io.attachEvent){io.attachEvent('onload',cb)}else{io.addEventListener('load',cb,false)}setTimeout(checkState,15);try{form.submit()}catch(err){var submitFn=document.createElement('form').submit;submitFn.apply(form)}}finally{form.setAttribute('action',a);form.setAttribute('enctype',et);if(t){form.setAttribute('target',t)}else{$form.removeAttr('target')}$(extraInputs).remove()}}if(s.forceSync){doSubmit()}else{setTimeout(doSubmit,10)}var data,doc,domCheckCount=50,callbackProcessed;function cb(e){if(xhr.aborted||callbackProcessed){return}doc=getDoc(io);if(!doc){log('cannot access response document');e=SERVER_ABORT}if(e===CLIENT_TIMEOUT_ABORT&&xhr){xhr.abort('timeout');deferred.reject(xhr,'timeout');return}else if(e==SERVER_ABORT&&xhr){xhr.abort('server abort');deferred.reject(xhr,'error','server abort');return}if(!doc||doc.location.href==s.iframeSrc){if(!timedOut){return}}if(io.detachEvent){io.detachEvent('onload',cb)}else{io.removeEventListener('load',cb,false)}var status='success',errMsg;try{if(timedOut){throw'timeout';}var isXml=s.dataType=='xml'||doc.XMLDocument||$.isXMLDoc(doc);log('isXml='+isXml);if(!isXml&&window.opera&&(doc.body===null||!doc.body.innerHTML)){if(--domCheckCount){log('requeing onLoad callback, DOM not available');setTimeout(cb,250);return}}var docRoot=doc.body?doc.body:doc.documentElement;xhr.responseText=docRoot?docRoot.innerHTML:null;xhr.responseXML=doc.XMLDocument?doc.XMLDocument:doc;if(isXml){s.dataType='xml'}xhr.getResponseHeader=function(header){var headers={'content-type':s.dataType};return headers[header.toLowerCase()]};if(docRoot){xhr.status=Number(docRoot.getAttribute('status'))||xhr.status;xhr.statusText=docRoot.getAttribute('statusText')||xhr.statusText}var dt=(s.dataType||'').toLowerCase();var scr=/(json|script|text)/.test(dt);if(scr||s.textarea){var ta=doc.getElementsByTagName('textarea')[0];if(ta){xhr.responseText=ta.value;xhr.status=Number(ta.getAttribute('status'))||xhr.status;xhr.statusText=ta.getAttribute('statusText')||xhr.statusText}else if(scr){var pre=doc.getElementsByTagName('pre')[0];var b=doc.getElementsByTagName('body')[0];if(pre){xhr.responseText=pre.textContent?pre.textContent:pre.innerText}else if(b){xhr.responseText=b.textContent?b.textContent:b.innerText}}}else if(dt=='xml'&&!xhr.responseXML&&xhr.responseText){xhr.responseXML=toXml(xhr.responseText)}try{data=httpData(xhr,dt,s)}catch(err){status='parsererror';xhr.error=errMsg=(err||status)}}catch(err){log('error caught: ',err);status='error';xhr.error=errMsg=(err||status)}if(xhr.aborted){log('upload aborted');status=null}if(xhr.status){status=(xhr.status>=200&&xhr.status<300||xhr.status===304)?'success':'error'}if(status==='success'){if(s.success){s.success.call(s.context,data,'success',xhr)}deferred.resolve(xhr.responseText,'success',xhr);if(g){$.event.trigger("ajaxSuccess",[xhr,s])}}else if(status){if(errMsg===undefined){errMsg=xhr.statusText}if(s.error){s.error.call(s.context,xhr,status,errMsg)}deferred.reject(xhr,'error',errMsg);if(g){$.event.trigger("ajaxError",[xhr,s,errMsg])}}if(g){$.event.trigger("ajaxComplete",[xhr,s])}if(g&&!--$.active){$.event.trigger("ajaxStop")}if(s.complete){s.complete.call(s.context,xhr,status)}callbackProcessed=true;if(s.timeout){clearTimeout(timeoutHandle)}setTimeout(function(){if(!s.iframeTarget){$io.remove()}else{$io.attr('src',s.iframeSrc)}xhr.responseXML=null},100)}var toXml=$.parseXML||function(s,doc){if(window.ActiveXObject){doc=new ActiveXObject('Microsoft.XMLDOM');doc.async='false';doc.loadXML(s)}else{doc=(new DOMParser()).parseFromString(s,'text/xml')}return(doc&&doc.documentElement&&doc.documentElement.nodeName!='parsererror')?doc:null};var parseJSON=$.parseJSON||function(s){return window['eval']('('+s+')')};var httpData=function(xhr,type,s){var ct=xhr.getResponseHeader('content-type')||'',xml=type==='xml'||!type&&ct.indexOf('xml')>=0,data=xml?xhr.responseXML:xhr.responseText;if(xml&&data.documentElement.nodeName==='parsererror'){if($.error){$.error('parsererror')}}if(s&&s.dataFilter){data=s.dataFilter(data,type)}if(typeof data==='string'){if(type==='json'||!type&&ct.indexOf('json')>=0){data=parseJSON(data)}else if(type==="script"||!type&&ct.indexOf("javascript")>=0){$.globalEval(data)}}return data};return deferred}};$.fn.ajaxForm=function(options){options=options||{};options.delegation=options.delegation&&$.isFunction($.fn.on);if(!options.delegation&&this.length===0){var o={s:this.selector,c:this.context};if(!$.isReady&&o.s){log('DOM not ready, queuing ajaxForm');$(function(){$(o.s,o.c).ajaxForm(options)});return this}log('terminating; zero elements found by selector'+($.isReady?'':' (DOM not ready)'));return this}if(options.delegation){$(document).off('submit.form-plugin',this.selector,doAjaxSubmit).off('click.form-plugin',this.selector,captureSubmittingElement).on('submit.form-plugin',this.selector,options,doAjaxSubmit).on('click.form-plugin',this.selector,options,captureSubmittingElement);return this}return this.ajaxFormUnbind().bind('submit.form-plugin',options,doAjaxSubmit).bind('click.form-plugin',options,captureSubmittingElement)};function doAjaxSubmit(e){var options=e.data;if(!e.isDefaultPrevented()){e.preventDefault();$(e.target).ajaxSubmit(options)}}function captureSubmittingElement(e){var target=e.target;var $el=$(target);if(!($el.is("[type=submit],[type=image]"))){var t=$el.closest('[type=submit]');if(t.length===0){return}target=t[0]}var form=this;form.clk=target;if(target.type=='image'){if(e.offsetX!==undefined){form.clk_x=e.offsetX;form.clk_y=e.offsetY}else if(typeof $.fn.offset=='function'){var offset=$el.offset();form.clk_x=e.pageX-offset.left;form.clk_y=e.pageY-offset.top}else{form.clk_x=e.pageX-target.offsetLeft;form.clk_y=e.pageY-target.offsetTop}}setTimeout(function(){form.clk=form.clk_x=form.clk_y=null},100)}$.fn.ajaxFormUnbind=function(){return this.unbind('submit.form-plugin click.form-plugin')};$.fn.formToArray=function(semantic,elements){var a=[];if(this.length===0){return a}var form=this[0];var formId=this.attr('id');var els=semantic?form.getElementsByTagName('*'):form.elements;var els2;if(els&&!/MSIE [678]/.test(navigator.userAgent)){els=$(els).get()}if(formId){els2=$(':input[form="'+formId+'"]').get();if(els2.length){els=(els||[]).concat(els2)}}if(!els||!els.length){return a}var i,j,n,v,el,max,jmax;for(i=0,max=els.length;i<max;i++){el=els[i];n=el.name;if(!n||el.disabled){continue}if(semantic&&form.clk&&el.type=="image"){if(form.clk==el){a.push({name:n,value:$(el).val(),type:el.type});a.push({name:n+'.x',value:form.clk_x},{name:n+'.y',value:form.clk_y})}continue}v=$.fieldValue(el,true);if(v&&v.constructor==Array){if(elements){elements.push(el)}for(j=0,jmax=v.length;j<jmax;j++){a.push({name:n,value:v[j]})}}else if(feature.fileapi&&el.type=='file'){if(elements){elements.push(el)}var files=el.files;if(files.length){for(j=0;j<files.length;j++){a.push({name:n,value:files[j],type:el.type})}}else{a.push({name:n,value:'',type:el.type})}}else if(v!==null&&typeof v!='undefined'){if(elements){elements.push(el)}a.push({name:n,value:v,type:el.type,required:el.required})}}if(!semantic&&form.clk){var $input=$(form.clk),input=$input[0];n=input.name;if(n&&!input.disabled&&input.type=='image'){a.push({name:n,value:$input.val()});a.push({name:n+'.x',value:form.clk_x},{name:n+'.y',value:form.clk_y})}}return a};$.fn.formSerialize=function(semantic){return $.param(this.formToArray(semantic))};$.fn.fieldSerialize=function(successful){var a=[];this.each(function(){var n=this.name;if(!n){return}var v=$.fieldValue(this,successful);if(v&&v.constructor==Array){for(var i=0,max=v.length;i<max;i++){a.push({name:n,value:v[i]})}}else if(v!==null&&typeof v!='undefined'){a.push({name:this.name,value:v})}});return $.param(a)};$.fn.fieldValue=function(successful){for(var val=[],i=0,max=this.length;i<max;i++){var el=this[i];var v=$.fieldValue(el,successful);if(v===null||typeof v=='undefined'||(v.constructor==Array&&!v.length)){continue}if(v.constructor==Array){$.merge(val,v)}else{val.push(v)}}return val};$.fieldValue=function(el,successful){var n=el.name,t=el.type,tag=el.tagName.toLowerCase();if(successful===undefined){successful=true}if(successful&&(!n||el.disabled||t=='reset'||t=='button'||(t=='checkbox'||t=='radio')&&!el.checked||(t=='submit'||t=='image')&&el.form&&el.form.clk!=el||tag=='select'&&el.selectedIndex==-1)){return null}if(tag=='select'){var index=el.selectedIndex;if(index<0){return null}var a=[],ops=el.options;var one=(t=='select-one');var max=(one?index+1:ops.length);for(var i=(one?index:0);i<max;i++){var op=ops[i];if(op.selected){var v=op.value;if(!v){v=(op.attributes&&op.attributes.value&&!(op.attributes.value.specified))?op.text:op.value}if(one){return v}a.push(v)}}return a}return $(el).val()};$.fn.clearForm=function(includeHidden){return this.each(function(){$('input,select,textarea',this).clearFields(includeHidden)})};$.fn.clearFields=$.fn.clearInputs=function(includeHidden){var re=/^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i;return this.each(function(){var t=this.type,tag=this.tagName.toLowerCase();if(re.test(t)||tag=='textarea'){this.value=''}else if(t=='checkbox'||t=='radio'){this.checked=false}else if(tag=='select'){this.selectedIndex=-1}else if(t=="file"){if(/MSIE/.test(navigator.userAgent)){$(this).replaceWith($(this).clone(true))}else{$(this).val('')}}else if(includeHidden){if((includeHidden===true&&/hidden/.test(t))||(typeof includeHidden=='string'&&$(this).is(includeHidden))){this.value=''}}})};$.fn.resetForm=function(){return this.each(function(){if(typeof this.reset=='function'||(typeof this.reset=='object'&&!this.reset.nodeType)){this.reset()}})};$.fn.enable=function(b){if(b===undefined){b=true}return this.each(function(){this.disabled=!b})};$.fn.selected=function(select){if(select===undefined){select=true}return this.each(function(){var t=this.type;if(t=='checkbox'||t=='radio'){this.checked=select}else if(this.tagName.toLowerCase()=='option'){var $sel=$(this).parent('select');if(select&&$sel[0]&&$sel[0].type=='select-one'){$sel.find('option').selected(false)}this.selected=select}})};$.fn.ajaxSubmit.debug=false;function log(){if(!$.fn.ajaxSubmit.debug){return}var msg='[jquery.form] '+Array.prototype.join.call(arguments,'');if(window.console&&window.console.log){window.console.log(msg)}else if(window.opera&&window.opera.postError){window.opera.postError(msg)}}}));
/**
 * Created by Administrator on 2016/7/26.
 */
$(function () {
    // 判断整数value是否等于0
    jQuery.validator.addMethod("isIntEqZero", function (value, element) {
        if (/^[-\+]?\d+$/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || value == 0;
        } else {
            return false;
        }
    }, "整数必须为0");

    // 判断整数value是否大于0
    jQuery.validator.addMethod("isIntGtZero", function (value, element) {
        if (/^[-\+]?\d+$/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || value > 0;
        } else {
            return false;
        }
    }, "整数必须大于0");

    //验证组织机构代码格式
    jQuery.validator.addMethod("doubles", function (value, element) {
        if (value.length == 9) {
            var reg = /^[0-9]/;
            return this.optional(element) || (reg.test(value));
        } else if (value.length == 18) {
            // var reg = /^([A-Z]*\d+[A-Z]+)|(\d*[A-Z]+\d+)$/;
            var reg = /^[A-Z\d]{18}$/;
            return this.optional(element) || (reg.test(value));
        } else if (value.length == 0) {
            return true;
        } else {
            return false;
        }
    }, "请输入正确的组织结构代码(9位数字)或者18位的统一社会信用代码(数字和大写字母的组合)");

    //验证输入的文本是否为数字和字母
    jQuery.validator.addMethod("isRegisterNumber", function (value, element) {
        var reg = /^[a-zA-Z0-9-]{13}-[a-zA-Z0-9]/;
        return this.optional(element) || (reg.test(value));
    }, "请输入正确的数字和字母以及正确的长度");


    // 判断是否是正确的数字
    jQuery.validator.addMethod("isRightNumber", function (value, element) {
        var reg = /^[1-9]([0-9]*)$|^[0-9]$/;
        return this.optional(element) || reg.test(value);
    }, "请输入正确的数字");

    // 判断整数value是否大于或等于0
    jQuery.validator.addMethod("isIntGteZero", function (value, element) {
        if (/^[-\+]?\d+$/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || value >= 0;
        } else {
            return false;
        }
    }, "整数必须大于或等于0");

    // 判断整数value是否介于1-120
    jQuery.validator.addMethod("isInt1to120", function (value, element) {
        if (/^[-\+]?\d+$/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || (value >= 1 && value <= 120);
        } else {
            return false;
        }
    }, "介于1到120之间的整数");

    // 判断整数value是否介于1-400
    jQuery.validator.addMethod("isInt1to400", function (value, element) {
        if (/^[-\+]?\d+$/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || (value >= 1 && value <= 400);
        } else {
            return false;
        }
    }, "介于1到400之间的整数");

    // 判断整数value是否介于1tovalue
    jQuery.validator.addMethod("isInt1tov", function (value, element, param) {
        if (/^[-\+]?\d+$/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || (value >= 1 && value <= param);
        } else if (value == null || value == "") {
            return true;
        } else {
            return false;
        }
    }, "介于1到之间的整数");

    // 判断整数value是否介于1-60
    jQuery.validator.addMethod("isInt1to60", function (value, element) {
        if (/^[-\+]?\d+$/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || (value >= 1 && value <= 60);
        } else {
            return false;
        }
    }, "介于1到60之间的整数");

    // 判断整数value是否介于10-100
    jQuery.validator.addMethod("isInt10to100", function (value, element) {
        if (/^[-\+]?\d+$/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || (value >= 10 && value <= 100);
        } else {
            return false;
        }
    }, "介于10到100之间的整数");

    // 判断整数value是否介于1-10
    jQuery.validator.addMethod("isInt1to10", function (value, element) {
        if (/^[-\+]?\d+$/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || (value >= 1 && value <= 10);
        } else {
            return false;
        }
    }, "介于1到10之间的整数");

    // 判断整数value是否介于1-24
    jQuery.validator.addMethod("isInt1to24", function (value, element) {
        if (/^[-\+]?\d/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || (value >= 1 && value <= 24);
        } else {
            return false;
        }
    }, "介于1到24之间的整数");

    // 判断整数value是否介于0-59
    jQuery.validator.addMethod("isInt1to59", function (value, element) {
        if (/^[-\+]?\d/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || (value >= 0 && value <= 59);
        } else {
            return false;
        }
    }, "介于0到59之间的整数");
    /*// 判断整数value是否介于1-10
    jQuery.validator.addMethod("isInt7to15", function(value, element) {
        if(/^[-\+]?\d+$/.test(value)){
            value=parseInt(value);
            console.log(value);
            return this.optional(element) || (value >=7 && value <= 15);
        }else{
            return false;
        }
    }, "介于7到15之间的整数");
  */
    // 判断整数value是否不等于0
    jQuery.validator.addMethod("isIntNEqZero", function (value, element) {
        if (/^[-\+]?\d+$/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || value != 0;
        } else {
            return false;
        }
    }, "整数必须不等于0");

    // 判断整数value是否小于0
    jQuery.validator.addMethod("isIntLtZero", function (value, element) {
        if (/^[-\+]?\d+$/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || value < 0;
        } else {
            return false;
        }
    }, "整数必须小于0");

    // 判断整数value是否小于或等于0
    jQuery.validator.addMethod("isIntLteZero", function (value, element) {
        if (/^[-\+]?\d+$/.test(value)) {
            value = parseInt(value);
            return this.optional(element) || value <= 0;
        } else {
            return false;
        }
    }, "整数必须小于或等于0");

    // 判断浮点数value是否等于0
    jQuery.validator.addMethod("isFloatEqZero", function (value, element) {
        value = parseFloat(value);
        return this.optional(element) || value == 0;
    }, "浮点数必须为0");

    // 判断浮点数value是否大于0
    jQuery.validator.addMethod("isFloatGtZero", function (value, element) {
        value = parseFloat(value);
        return this.optional(element) || value > 0;
    }, "浮点数必须大于0");

    // 判断浮点数value是否大于或等于0
    jQuery.validator.addMethod("isFloatGteZero", function (value, element) {
        value = parseFloat(value);
        return this.optional(element) || value >= 0;
    }, "浮点数必须大于或等于0");

    // 判断浮点数value是否不等于0
    jQuery.validator.addMethod("isFloatNEqZero", function (value, element) {
        value = parseFloat(value);
        return this.optional(element) || value != 0;
    }, "浮点数必须不等于0");

    // 判断浮点数value是否小于0
    jQuery.validator.addMethod("isFloatLtZero", function (value, element) {
        value = parseFloat(value);
        return this.optional(element) || value < 0;
    }, "浮点数必须小于0");

    // 判断浮点数value是否小于或等于0
    jQuery.validator.addMethod("isFloatLteZero", function (value, element) {
        value = parseFloat(value);
        return this.optional(element) || value <= 0;
    }, "浮点数必须小于或等于0");

    // 判断浮点型
    jQuery.validator.addMethod("isFloat", function (value, element) {
        return this.optional(element) || /^[-\+]?\d+(\.\d+)?$/.test(value);
    }, "只能包含数字、小数点等字符");

    // 判断小数0-1
    jQuery.validator.addMethod("isDecimal", function (value, element) {
        return this.optional(element) || /^0\.\d+$/.test(value);
    }, "只能输入0-1的小数");

    // 匹配integer
    jQuery.validator.addMethod("isInteger", function (value, element) {
        return this.optional(element) || (/^[-\+]?\d+$/.test(value) && parseInt(value) >= 0);
    }, "匹配integer");

    // 判断数值类型，包括整数和浮点数
    jQuery.validator.addMethod("isNumber", function (value, element) {
        return this.optional(element) || /^[-\+]?\d+$/.test(value) || /^[-\+]?\d+(\.\d+)?$/.test(value);
    }, "匹配数值类型，包括整数和浮点数");

    // 只能输入[0-9]数字
    jQuery.validator.addMethod("isDigits", function (value, element) {
        return this.optional(element) || /^\d+$/.test(value);
    }, "只能输入0-9数字");

    // 判断中文字符
    jQuery.validator.addMethod("isChinese", function (value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5]+$/.test(value);
    }, "只能包含中文字符。");

    // 判断英文字符
    jQuery.validator.addMethod("isEnglish", function (value, element) {
        return this.optional(element) || /^[A-Za-z]+$/.test(value);
    }, "只能包含英文字符。");

    // 手机号码验证
    jQuery.validator.addMethod("isMobile", function (value, element) {
        var length = value.length;
        var mobile = /^((13[0-9]{1})|(14[5,7,9]{1})|(15[^4]{1})|(166)|(18[0-9]{1})|(19[8-9]{1})|(17[0,1,3,5,6,7,8]{1}))+\d{8}$/;
        return this.optional(element) || (length == 11 && mobile.test(value));
    }, "请正确填写您的手机号码。");

    // 电话号码验证
    jQuery.validator.addMethod("isPhone", function (value, element) {
        var tel = /^(\d{3,4}-?)?\d{7,9}$/g;
        return this.optional(element) || (tel.test(value));
    }, "请正确填写您的电话号码。");

    // 手机号码验证
    jQuery.validator.addMethod("mobilePhone", function (value, element) {
        var length = value.length;
        var mobile = /^((13[0-9]{1})|(14[5,7,9]{1})|(15[^4]{1})|(166)|(18[0-9]{1})|(19[8-9]{1})|(17[0,1,3,5,6,7,8]{1}))+\d{8}$/;
        return this.optional(element) || (length == 11 && mobile.test(value));
    }, "看起来不像手机号码呢");

    // 联系电话(手机/电话皆可)验证
    jQuery.validator.addMethod("isTel", function (value, element) {
        var length = value.length;
        var tel = /^(\d{3}-\d{8}|\d{4}-\d{7,8}|\d{7,13})?$/;
        var mobile = /^((13[0-9]{1})|(14[5,7,9]{1})|(15[^4]{1})|(166)|(18[0-9]{1})|(19[8-9]{1})|(17[0,1,3,5,6,7,8]{1}))+\d{8}$/;
        return this.optional(element) || tel.test(value) || (length == 11 && mobile.test(value));
    }, "请正确填写您的联系方式");

    // sim卡号验证
    jQuery.validator.addMethod("isSim", function (value, element) {
        var length = value.length;
        var tel = /^((\d{3,4}-\d{7,9})|([1-9]{1}\d{6,12}))$/g;
        var mobile = /^((13[0-9]{1})|(14[5,7,9]{1})|(15[^4]{1})|(166)|(18[0-9]{1})|(19[8-9]{1})|(17[0,1,3,5,6,7,8]{1}))+\d{8}$/;
        return this.optional(element) || tel.test(value) || (length == 11 && mobile.test(value));
    }, "请输入SIM卡号数字，范围：7~13,且不能以0开头");

    // 匹配qq
    jQuery.validator.addMethod("isQq", function (value, element) {
        return this.optional(element) || /^[1-9]\d{4,12}$/;
    }, "匹配QQ");

    // 邮政编码验证
    jQuery.validator.addMethod("isZipCode", function (value, element) {
        var zip = /^[0-9]{6}$/;
        return this.optional(element) || (zip.test(value));
    }, "请正确填写您的邮政编码。");

    // 匹配密码，以字母开头，长度在6-12之间，只能包含字符、数字和下划线。
    jQuery.validator.addMethod("isPwd", function (value, element) {
        return this.optional(element) || /^[a-zA-Z]\\w{6,12}$/.test(value);
    }, "以字母开头，长度在6-12之间，只能包含字符、数字和下划线。");

    // 身份证号码验证
    jQuery.validator.addMethod("isIdCardNo", function (value, element) {
        //var idCard = /^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/;
        return this.optional(element) || isIdCardNo(value);
    }, "请输入正确的身份证号码。");

    // IP地址验证
    jQuery.validator.addMethod("ip", function (value, element) {
        return this.optional(element) || /^(([0-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.)(([0-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.){2}([0-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))$/.test(value);
    }, "请填写正确的IP地址。");

    // 多个以 # 隔开的IP地址验证
    jQuery.validator.addMethod("batchIp", function (value, element) {
        var ips = value.split("#");
        var reg = /^(([0-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.)(([0-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.){2}([0-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))$/;
        for (var i = 0; i < ips.length; i++) {
            if (!reg.test(ips[i])) {
                return false;
            }
        }
        return true;
    }, "");

    // 字符验证，只能包含中文、英文、数字、下划线等字符。
    jQuery.validator.addMethod("stringCheck", function (value, element) {
        return this.optional(element) || /^[a-zA-Z0-9\u4e00-\u9fa5-_]+$/.test(value);
    }, "只能包含中文、英文、数字、下划线等字符");
    // 字符验证，只能包含中文、英文、数字、# ~字符。
    jQuery.validator.addMethod("fuelType", function (value, element) {
        return this.optional(element) || /^[a-zA-Z0-9\u4e00-\u9fa5-#~]+$/.test(value);
    }, "只能包含中文、英文、数字、#、~");

    // 字符验证，只能包含中文、英文、数字字符。
    jQuery.validator.addMethod("zysCheck", function (value, element) {
        return this.optional(element) || /^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value);
    }, "只能包含中文、英文、数字");

    //字符验证，只能包含中文和英文
    jQuery.validator.addMethod("isCE", function (value, element) {
        var reg = /^[a-zA-Z\u4e00-\u9fa5]$/
        return this.optional(element) || reg.test(value);
    }, "只能包含中文、英文");
    // 匹配english
    jQuery.validator.addMethod("isEnglish", function (value, element) {
        return this.optional(element) || /^[A-Za-z]+$/.test(value);
    }, "匹配english");

    // 匹配汉字
    jQuery.validator.addMethod("isChinese", function (value, element) {
        return this.optional(element) || /^[\u4e00-\u9fa5]+$/.test(value);
    }, "匹配汉字");

    // 匹配中文(包括汉字和字符)
    jQuery.validator.addMethod("isChineseChar", function (value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5]+$/.test(value);
    }, "匹配中文(包括汉字和字符) ");

    // 判断是否为合法字符(a-zA-Z0-9-_)
    jQuery.validator.addMethod("isRightfulString", function (value, element) {
        return this.optional(element) || /^[A-Za-z0-9_-]+$/.test(value);
    }, "判断是否为合法字符(a-zA-Z0-9-_)");

    // 判断是否为合法字符(油箱型号输入限制：中文、-、_、字母、数字、（）、*)
    jQuery.validator.addMethod("isRightfulString_oilBoxType", function (value, element) {
        return this.optional(element) || /^[A-Za-z0-9_.\(\)\（\）\*\u4e00-\u9fa5\-]+$/.test(value);
    }, "判断是否为合法字符(中文、-、_、字母、数字、（）、*)");

    // 判断是否为合法传感器型号(传感器型号输入限制：中文、字母、数字或特殊符号*、-、_、#)
    jQuery.validator.addMethod("isRightSensorModel", function (value, element) {
        return this.optional(element) || /^[A-Za-z0-9_#\*\u4e00-\u9fa5\-]+$/.test(value);
    }, "请输入中文、字母、数字或特殊符号*、-、_、#");

    // 判断是否为合法字符(工时传感器型号输入限制：-、字母、数字、+)
    jQuery.validator.addMethod("isRightfulString_workhourSensorType", function (value, element) {
        return this.optional(element) || /^[A-Za-z0-9-+]+$/.test(value);
    }, "判断是否为合法字符(-、字母、数字、+)");

    // 判断是否为合法字符(a-zA-Z0-9)
    jQuery.validator.addMethod("isRightfulStr", function (value, element) {
        return this.optional(element) || /^[A-Za-z0-9]+$/.test(value);
    }, "输入类型为数字和字母");

    // 判断是否包含中英文特殊字符，除英文"-_"字符外
    jQuery.validator.addMethod("isContainsSpecialChar", function (value, element) {
        var reg = RegExp(/[(\ )(\`)(\~)(\!)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\+)(\=)(\|)(\{)(\})(\')(\:)(\;)(\')(',)(\[)(\])(\.)(\<)(\>)(\/)(\?)(\~)(\！)(\@)(\#)(\￥)(\%)(\…)(\&)(\*)(\（)(\）)(\—)(\+)(\|)(\{)(\})(\【)(\】)(\‘)(\；)(\：)(\”)(\“)(\’)(\。)(\，)(\、)(\？)]+/);
        return this.optional(element) || !reg.test(value);
    }, "含有中英文特殊字符");

    //身份证号码的验证规则
    function isIdCardNo(num) {
        //if (isNaN(num)) {alert("输入的不是数字！"); return false;}
        var len = num.length, re;
        if (len == 15)
            re = new RegExp(/^(\d{6})()?(\d{2})(\d{2})(\d{2})(\d{2})(\w)$/);
        else if (len == 18)
            re = new RegExp(/^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/);
        else {
            //alert("输入的数字位数不对。");
            return false;
        }
        var a = num.match(re);
        if (a != null) {
            if (len == 15) {
                var D = new Date("19" + a[3] + "/" + a[4] + "/" + a[5]);
                var B = D.getYear() == a[3] && (D.getMonth() + 1) == a[4] && D.getDate() == a[5];
            }
            else {
                var D = new Date(a[3] + "/" + a[4] + "/" + a[5]);
                var B = D.getFullYear() == a[3] && (D.getMonth() + 1) == a[4] && D.getDate() == a[5];
            }
            if (!B) {
                //alert("输入的身份证号 "+ a[0] +" 里出生日期不对。");
                return false;
            }
        }
        if (!re.test(num)) {
            //alert("身份证最后一位只能是数字和字母。");
            return false;
        }
        return true;
    }

});

jQuery.validator.addMethod("compareDate", function (value, element, param) {
    var assigntime = value;
    var deadlinetime = jQuery(param).val();
    var reg = new RegExp('-', 'g');
    assigntime = assigntime.replace(reg, '/');//正则替换
    deadlinetime = deadlinetime.replace(reg, '/');
    assigntime = new Date(parseInt(Date.parse(assigntime), 10));
    deadlinetime = new Date(parseInt(Date.parse(deadlinetime), 10));
    if (deadlinetime > assigntime) {
        return false;
    } else {
        return true;
    }
}, "<font color='#E47068'>结束日期必须大于开始日期</font>");

jQuery.validator.addMethod("compareTime", function (value, element, param) {
    var assigntime = "2016-01-01 " + value;
    var deadlinetime = "2016-01-01 " + jQuery(param).val();
    var reg = new RegExp('-', 'g');
    assigntime = assigntime.replace(reg, '/');//正则替换
    deadlinetime = deadlinetime.replace(reg, '/');
    assigntime = new Date(parseInt(Date.parse(assigntime), 10));
    deadlinetime = new Date(parseInt(Date.parse(deadlinetime), 10));
    if (deadlinetime > assigntime) {
        return false;
    } else {
        return true;
    }
}, "<font color='#E47068'>结束时间必须大于开始时间</font>");

jQuery.validator.addMethod("compareDateDiff", function (value, element, param) {
    var sData1 = value;
    var sData2 = jQuery(param).val();
    if (DateDiff(sData1.substring(0, 10), sData2.substring(0, 10)) >= 7) {
        return false;
    } else {
        return true;
    }
}, "<font color='#E47068'>查询的日期必须小于一周</font>");

//判断是否为合法字符(.0-9)
jQuery.validator.addMethod("isContainsNumberAndPoint", function (value, element, param) {
    return this.optional(element) || /^[0-9.]+$/.test(value);
}, "只能包含数字和.");

function DateDiff(sDate1, sDate2) {  //sDate1和sDate2是yyyy-MM-dd格式

    var aDate, oDate1, oDate2, iDays;
    // aDate = sDate1.split("-");
    oDate1 = new Date(sDate1);  //转换为yyyy-MM-dd格式
    // aDate = sDate2.split("-");
    oDate2 = new Date(sDate2);
    iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数

    return iDays;  //返回相差天数
}

/**
 * 判断选择的时间是否大于等与今天
 */
jQuery.validator.addMethod("selectDate", function (value, element) {
    return this.optional(element) || operationTime(value);
}, "授权截止时间必须大于\等于今天");

function operationTime(value) {
    var sDate = value;//字符串格式yyyy-MM-dd
    var nowDate = new Date();
    var newDate = nowDate.toLocaleDateString();//获取当前时间的日期 年/月/日(IE浏览器获取当前时间为x年x月x日)----字符串
    var reg = new RegExp(/[-\u4E00-\u9FA5\uF900-\uFA2D]/g);
    var aDate = sDate.replace(reg, "/");//把用户选择时间的字符串中的-替换成/
    var normDate = new Date(newDate.replace(reg, "/"));//把当前时间字符串转换为时间格式
    var selDate = new Date(aDate);//把用户选择的日期(字符串格式)转换为日期格式 年/月/日
    var nowDateTimestamp = normDate.getTime();//把当前时间转换为时间戳
    var selDateTimestamp = selDate.getTime();//把用户选择的时间转换为时间戳
    if (selDateTimestamp - nowDateTimestamp >= 0) {
        return true;
    } else {
        return false;
    }

}

/**
 * 判断选择的时间是否小于等与今天
 */
jQuery.validator.addMethod("selectRegDate", function (value, element) {
    return this.optional(element) || operationRegTime(value);
}, "注册日期必须小与/等于今天");

function operationRegTime(value) {
    var sDate = value;//字符串格式yyyy-MM-dd
    var nowDate = new Date();
    var newDate = nowDate.toLocaleDateString();//获取当前时间的日期 年/月/日(IE浏览器获取当前时间为x年x月x日)----字符串
    var reg = new RegExp(/[-\u4E00-\u9FA5\uF900-\uFA2D]/g);
    var aDate = sDate.replace(reg, "/");//把用户选择时间的字符串中的-替换成/
    var normDate = new Date(newDate.replace(reg, "/"));//把当前时间字符串转换为时间格式
    var selDate = new Date(aDate);//把用户选择的日期(字符串格式)转换为日期格式 年/月/日
    var nowDateTimestamp = normDate.getTime();//把当前时间转换为时间戳
    var selDateTimestamp = selDate.getTime();//把用户选择的时间转换为时间戳
    if (nowDateTimestamp - selDateTimestamp >= 0) {
        return true;
    } else {
        return false;
    }

}

//小数点精度两位校验
jQuery.validator.addMethod("decimalTwo", function (value, element) {
    var reg = /^[0-9]+([.]{1}[0-9]{1,2})?$/;
    return this.optional(element) || reg.test(value);
}, "输入类型为非负数，精度0.01");

//小数点精度一位校验
jQuery.validator.addMethod("decimalOne", function (value, element) {
    var reg = /^(?:0\.\d|[1-9][0-9]{0,9}|[1-9][0-9]{0,7}\.\d)$/;
    return this.optional(element) || reg.test(value);
}, "输入类型为非负数，精度0.1");

//大小不限 小数点精度一位校验
jQuery.validator.addMethod("decimalOneMore", function (value, element) {
    var reg = /^(?:0\.\d|[1-9][0-9]*|[1-9][0-9]*\.\d)$/;
    return this.optional(element) || reg.test(value);
}, "输入类型为非负数，精度0.1");

// 小数点精度校验
jQuery.validator.addMethod("decimalFour", function (value, element) {
    var reg = /^(?:0\.\d|\d[0-9]{0,3}|[1-9][0-9]{0,3}\.\d)$/;
    return this.optional(element) || reg.test(value);
}, "输入类型为非负数，精度0.1");
//小数点精度校验
jQuery.validator.addMethod("decimalThree", function (value, element) {
    var reg = /^(?:0\.\d|\d[0-9]{0,2}|[1-9][0-9]{0,2}\.\d)$/;
    return this.optional(element) || reg.test(value);
}, "输入类型为非负数，精度0.1");
//小数点精度校验
jQuery.validator.addMethod("decimalSeven", function (value, element) {
    var reg = /^(?:0\.\d|\d[0-9]{0,6}|[1-9][0-9]{0,6}\.\d)$/;
    return this.optional(element) || reg.test(value);
}, "输入类型为非负数，精度0.1");


//座机校验
jQuery.validator.addMethod("isLandline", function (value, element) {
    var reg = /^(\d{3}-\d{8}|\d{4}-\d{7,8}|\d{7,13})?$/;
    return this.optional(element) || reg.test(value);
}, "看起来不像座机号呢");


//车牌号校验
jQuery.validator.addMethod("isBrand", function (value, element) {
    return isPlateNo(value);
}, "请输入汉字、字母、数字或短横杠，长度2-20位");

function isPlateNo(plateNo) {
    var reg = /^[0-9a-zA-Z\u4e00-\u9fa5-]{2,20}$/;
    if (reg.test(plateNo)) {
        return true;
    }
    return false;
}

/*function isPlateNo(plateNo){
//    var re = /^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
  // 京津冀晋蒙辽吉黑沪苏浙皖闽赣鲁豫鄂湘粤桂琼川贵云渝藏陕甘青宁新
  var re = /^[\u4eac\u6d25\u5180\u664b\u8499\u8fbd\u5409\u9ed1\u6caa\u82cf\u6d59\u7696\u95fd\u8d63\u9c81\u8c6b\u9102\u6e58\u7ca4\u6842\u743c\u5ddd\u8d35\u4e91\u6e1d\u85cf\u9655\u7518\u9752\u5b81\u65b0\u6d4b]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
  //香港车牌规则
  var reg1 = /^[A-Z]{2}[0-9]{4}$/;
  if(re.test(plateNo) || reg1.test(plateNo)){
        return true;
    }
    return false;
}*/
jQuery.validator.addMethod("isGroupRequired", function (value, element, param) {
    if (param == "true") {
        if (value) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }

}, "<font color='#E47068'>组织不能为空</font>");
//判断是否是大于0的合法数字 /^(?!(0[0-9]{0,}$))[0-9]{0,}[.]{0,}[0-9]{1,}$/ /^(?:[1-9]\d*|0)(?:\.\d+)?$/ 
jQuery.validator.addMethod("isFloatAndGtZero", function (value, element) {//
    return this.optional(element) || /^(?:[1-9]\d*|0)(?:\.\d+)?$/.test(value) && value > 0;
}, "只能包含数字、小数点等字符并且要大于零");
jQuery.validator.addMethod("minSize", function (value, element, param) {//
    var len = element.value.replace(/[\u4E00-\u9FA5]/g, 'aa').length;
    var flag = true;
    if (len < param) {
        flag = false;
    }
    return flag;
}, "");
jQuery.validator.addMethod("maxSize", function (value, element, param) {//
    var len = element.value.replace(/[\u4E00-\u9FA5]/g, 'aa').length;
    var flag = true;
    if (len > param) {
        flag = false;
    }
    return flag;
}, "");

/**
 * 分组管理现在每个组织下最多存在100个分组
 */
jQuery.validator.addMethod("assignmentLimit100", function (value, element, param) {//
    var flag = false;
    json_ajax("POST", "/clbs/m/basicinfo/enterprise/assignment/assignCountLimit", null, false, {"group": $(param).val()}, function (data) {
        if (data != null && data != undefined && data != "") {
            flag = data === 'true';
        }
    });
    return flag;
}, "");
/**
 * 判断树中是否选中车辆
 */
jQuery.validator.addMethod("zTreeChecked", function (value, element, param) {
    var check = false;
    var zTree = $.fn.zTree.getZTreeObj(param),
        nodes = zTree.getCheckedNodes(true),
        v = "";
    for (var i = 0, l = nodes.length; i < l; i++) {
        if (nodes[i].type == "vehicle" || nodes[i].type == "people" || nodes[i].type == "thing") {
            v += nodes[i].name + ",";
        }
    }
    if (v) {
        return true;
    }
    return check;
}, "");

jQuery.validator.addMethod("zTreePeopleChecked", function (value, element, param) {
    var check = false;
    var zTree = $.fn.zTree.getZTreeObj(param),
        nodes = zTree.getCheckedNodes(true),
        v = "";
    for (var i = 0, l = nodes.length; i < l; i++) {
        if (nodes[i].type == "user") {
            v += nodes[i].name + ",";
        }
    }
    if (v) {
        return true;
    }
    return check;
}, "");

/**
 * 开始时间和结束时间必须同时存在或者同时不存在
 */
jQuery.validator.addMethod("timeNotNull", function (value, element, param) {//
    if ($(param).val() != null && $(param).val() != "" && (value == null || value == "")) {
        return false;
    } else {
        return true;
    }
}, "");

/**
 * 根据不同监控对象类型校验终端编号
 */
jQuery.validator.addMethod("checkDeviceNumber", function (value, element, param) {//
    // var Dtype = $(param).val();//终端类型
    // if (Dtype == 5) {//判断人
    //     return this.optional(element) || /^[0-9a-zA-Z]{1,20}$/.test(value);
    // } else {//判断车
    //     if (/^[_-]+$/.test(value)) {//如果全是横杠和下划线则不通过
    //         return this.optional(element) || false;
    //     }
    //     return this.optional(element) || /^[0-9a-zA-Z_-]{7,15}$/.test(value);
    // }
    return this.optional(element) || /^[0-9a-zA-Z]{7,20}$/.test(value);
}, "");

/**
 * 校验人员姓名
 */
jQuery.validator.addMethod("checkPeopleName", function (value, element, param) {//
    if (/^[A-Za-z\u4e00-\u9fa5]{0,8}$/.test(value)) {
        return true;
    }
    return false;
}, "只能输入最多8位的中英文字符");

/**
 * 校验人员编号
 */
jQuery.validator.addMethod("checkRightPeopleNumber", function (value, element, param) {//
    if (/^[A-Za-z0-9\u4e00-\u9fa5_-]+$/.test(value)) {
        return true;
    }
    return false;
}, "");

//电子围栏输入的经纬度验证
jQuery.validator.addMethod("isLngLat", function (value, element, params) {
    var this_value = value;
    if (this_value.indexOf(',') != -1) {
        var this_value_array = this_value.split(',');
        if ((Number(this_value_array[0]) > 73.66 && Number(this_value_array[0]) < 135.05) && (Number(this_value_array[1]) > 3.86 && Number(this_value_array[1]) < 53.55)) {
            return true;
        } else {
            return false;
        }
        ;
    } else {
        return false;
    }
    ;
}, '请输入正确的经纬度');
//电子围栏输入的经度验证
jQuery.validator.addMethod("isLng", function (value, element, params) {
    var this_value = value;
    if (this_value != '') {
        if (Number(this_value) > 73.66 && Number(this_value) < 135.05) {
            return true;
        } else {
            return false;
        }
        ;
    } else {
        return false;
    }
    ;
}, '请输入正确的经度');
//电子围栏输入的纬度验证
jQuery.validator.addMethod("isLat", function (value, element, params) {
    var this_value = value;
    if (this_value != '') {
        if (Number(this_value) > 3.86 && Number(this_value) < 53.55) {
            return true;
        } else {
            return false;
        }
        ;
    } else {
        return false;
    }
    ;
}, '请输入正确的纬度');

//字符验证，只能包含中文和英文(全部匹配,只能包含中文和英文)
jQuery.validator.addMethod("isCN", function (value, element) {
    var reg = /^[a-zA-Z\u4e00-\u9fa5]+$/
    return this.optional(element) || reg.test(value);
}, "只能包含中文、英文");

//上报频率设置-上报起始时间校验
jQuery.validator.addMethod("checkRequiteTime", function (value, element, params) {
    if (params == 9) {
        return true;
    } else {
        return value != null && value != "";
    }
}, "");
//定点和校时-定点时间校验
jQuery.validator.addMethod("checkLocationTimes", function (value, element, params) {
    var obj = document.getElementsByName("locationTimes");
    for (i = 0; i < obj.length; i++) {
        if (obj[i].value) {
            return true;
        }
    }
    return false;
}, "");

/**
 * 如果勾选了，校验是否必填
 */
jQuery.validator.addMethod("isCheckedRequested", function (value, element, param) {//
    var checked = $(param).is(":checked"); //终端类型
    if (checked) { // 勾选
        if (value == null || value == undefined || value == "") {
            return false;
        }
    }
    return true;
}, "");

/**
 * 如果勾选了，校验是否是数字
 */
jQuery.validator.addMethod("isCheckedNumber", function (value, element, param) {//
    var paramlist = param.split(",");
    var checked = $(paramlist[0]).is(":checked"); //终端类型
    if (checked) { // 勾选
        var re = /^[0-9]+$/;
        if (!re.test(value) || Number(value) > Number(paramlist[2]) || Number(value) < Number(paramlist[1])) { //true:数字。false：非数字
            return false;
        }
    }
    return true;
}, "");

/**
 * 如果勾选了，校验是否是是在范围内
 */
jQuery.validator.addMethod("isCheckedNumber2", function (value, element, param) {//
    var paramlist = param.split(",");
    console.log("ffff" + paramlist[2] + paramlist[1])

    var checked = $(paramlist[0]).is(":checked"); //终端类型
    if (checked) { // 勾选
        var re = /^[0-9]+$/;
        if (Number(value) <= Number(paramlist[2]) && Number(value) >= Number(paramlist[1])) { //true:数字。false：非数字
            return true;
        } else {
            return false;
        }
    }
    return true;
}, "");
//校验如果启用了定时唤醒，进行时间校验不能为空
jQuery.validator.addMethod("isCheckedRequested2", function (value, element, param) {//
    var paramlist = param.split(",");
    var checked = $(paramlist[0]).is(":checked"); //终端类型
    var seleted = $(paramlist[1]).val();
    if (checked && seleted == "1") { // 勾选
        if (value == null || value == undefined || value == "") {
            return false;
        }
    }
    return true;
}, "");
//校验如果启用了定时唤醒，进行时间校验关闭时间不能大于开始时间
jQuery.validator.addMethod("isCheckedtime", function (value, element, param) {
    var paramlist = param.split(",");
    var checked = $(paramlist[0]).is(":checked"); //终端类型
    var seleted = $(paramlist[1]).val();
    var time1 = $(paramlist[2]).val();
    var time2 = $(paramlist[3]).val();
    if (checked && seleted == "1") { // 勾选
        if (compTime(time1, time2)) {
            return false;
        }
    }
    return true;
}, "");

/*
 * 校验中英文数字字符串，以传过来的参数做类型校验及输入限制(例：param = "1,1,20" 表示匹配中英文数字范围1-20)
 * 类型：1:中英文数字，2：中英文，3：中文数字，4：英文数字,5：中文,6：英文,7：数字,8:英文数字点
 */
jQuery.validator.addMethod("checkCAENumber", function (value, element, param) {
    var strs = param.split(",");
    var type = strs[0];//类型
    var minLimit = strs[1];//最小长度
    var maxLimit = strs[2];//最大长度
    var typeString;
    switch (type) {
        case "1":
            typeString = "[a-zA-Z0-9\u4e00-\u9fa5]";
            break;
        case "2":
            typeString = "[a-zA-Z\u4e00-\u9fa5]";
            break;
        case "3":
            typeString = "[0-9\u4e00-\u9fa5]";
            break;
        case "4":
            typeString = "[a-zA-Z0-9]";
            break;
        case "5":
            typeString = "[\u4e00-\u9fa5]";
            break;
        case "6":
            typeString = "[a-zA-Z]";
            break;
        case "7":
            typeString = "[0-9]";
            break;
        case "8":
            typeString = "[a-zA-Z0-9.]";
            break;

        default:
            return false;
            break;
    }
    var reg = new RegExp("^" + typeString + "{" + minLimit + "," + maxLimit + "}$");
    if (reg.test(value)) {
        return true;
    } else {
        return false;
    }
}, "");

/**
 * 检查是否是正确版本号
 */
jQuery.validator.addMethod("checkVersion", function (value, element, param) {
    var reg = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9])){0,2}$/;
    if (reg.test(value)) {
        return true;
    }
    return false;
}, "");


/**
 * 校验ICCID
 */
jQuery.validator.addMethod("checkICCID", function (value, element, param) {//
    if (/^[A-Z0-9]{20}$/.test(value) || value == '') {
        return true;
    }
    return false;
}, "请输入20位的数字或大写字母");

function compTime(time1, time2) {
    var array1 = time1.split(":");
    var total1 = parseInt(array1[0]) * 3600 + parseInt(array1[1]) * 60;
    var array2 = time2.split(":");
    var total2 = parseInt(array2[0]) * 3600 + parseInt(array2[1]) * 60;
    return total1 - total2 >= 0 ? true : false;

}  


(function(window,$){
    var addLocationTimeIndex = 2;
    
    realTimeMonitoringGsmCdma = {
        //基站参数设置 定点时间添加
        addLocationTimeEvent: function(){
            var bsfpLength = $("#baseStation-MainContent").find("div.form-group").length;
            var bs = parseInt(bsfpLength) + 1;
            if(bs > 12){
                layer.msg("定点时间最多允许存在12个哟！");
            }else{
              addLocationTimeIndex++;
                var html = "<div class='form-group'><label class='col-md-4 control-label'>定点时间：</label><div class='col-md-4'><input type='text' id='locationTimes_"+addLocationTimeIndex+"' name='locationTimes' onclick='' class='form-control' style='cursor: pointer;  background-color: #fafafa;' readonly/></div><div class='col-md-1'><button type='button' class='btn btn-danger baseStationDelete deleteIcon'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button></div></div>";
                $("#baseStation-MainContent").append(html);
                laydate.render({elem: '#locationTimes_'+addLocationTimeIndex,type: 'time',theme: '#6dcff6'});
                $("#locationTimes_"+addLocationTimeIndex).val(loadInitTime);
                $(".baseStationDelete").on("click",function(){
                    $(this).parent().parent().remove();
                });
            }
        },
        getHoursMinutesSeconds: function(){
          loadInitTime = 
            + (loadInitNowDate.getHours()< 10 ? "0" + loadInitNowDate.getHours() : loadInitNowDate.getHours())+":"
            + (loadInitNowDate.getMinutes() < 10 ? "0" + loadInitNowDate.getMinutes() : loadInitNowDate.getMinutes())+":"
            + (loadInitNowDate.getSeconds() < 10 ? "0" + loadInitNowDate.getSeconds() : loadInitNowDate.getSeconds());
          $("#requiteTime,#locationTimes").val(loadInitTime);
        },
        getsTheCurrentTime: function () {
          var nowDate = new Date();
            startTime = parseInt(nowDate.getFullYear()+1)
            + "-"
            + (parseInt(nowDate.getMonth() + 1) < 10 ? "0"
            + parseInt(nowDate.getMonth() + 1)
            : parseInt(nowDate.getMonth() + 1))
            + "-"
            + (nowDate.getDate() < 10 ? "0" + nowDate.getDate()
            : nowDate.getDate()) + " "
            + (nowDate.getHours()< 10 ? "0" + nowDate.getHours():nowDate.getHours())+":"
            + (nowDate.getMinutes() < 10 ? "0" + nowDate.getMinutes():nowDate.getMinutes())+":"
            + (nowDate.getSeconds() < 10 ? "0" + nowDate.getSeconds():nowDate.getSeconds())+" ";
            $("#reportStartTime").val(startTime);
        },
        reportformValide:function(){
            return $("#reportFrequency").validate({
                rules: {
                    hours: {
                        required: true,
                        isInt1to24:true,
                    },
                    minute: {
                        required: true,
                        isInt1to59:true
                    },
                    reportStartTime:{
                        required:true,
                        selectDate:true
                    }
                },
                messages: {
                    hours: {
                        required: "不能为空",
                        isInt1to24:"请输入1-24之间的整数"
                    },
                    minute: {
                        required: "不能为空",
                        isInt1to59:"请输入0-59之间的整数"
                    },
                    reportStartTime:{
                        required:"请选择一个时间",
                        selectDate:"选择的时间必须大于等于今天"
                    }
                }
            }).form();
        },
        tailAfter:function () {
            if (realTimeMonitoringGsmCdma.tailAfterFormValide) {
                $("#locationTailAfterList").ajaxSubmit(function (data) {
                    $("#locationTailAfter").modal("hide");
                    if(JSON.parse(data).success){
                        layer.msg("指令发送成功");
                        setTimeout("dataTableOperation.logFindCilck()",500);
                    }
                });
            }
        },
        tailAfterFormValide:function(){
            return $("#locationTailAfterList").validate({
                rules: {
                    tailAfterTime:{
                        required:true,
                        isDigits:true

                    },
                    IntervalTime:{
                        required:true,
                        isDigits:true
                    }
                },
                message:{
                    tailAfterTime:{
                        required:"跟踪时长不能为空",
                        isDigits:"请输入正确的数字"
                    },
                    IntervalTime:{
                        required:"时间间隔不能为空",
                        isDigits:"请输入正确的数字"
                    }
                }
            }).form()
        },
        getSystemTime:function(){
            var url="/clbs/v/monitoring/getTime";
            json_ajax("POST",url,"json",true,null,realTimeMonitoringGsmCdma.systemCallBack);
        },
        systemCallBack:function (data) {
            if(data != null){
                    $("#showTime").val(data);
            }
        },
    }
    $(function(){
        realTimeMonitoringGsmCdma.getsTheCurrentTime();
        realTimeMonitoringGsmCdma.getHoursMinutesSeconds();
      $(".modal-body").addClass("modal-body-overflow");
        laydate.render({elem: '#baseStationFixedTime',type: 'time',theme: '#6dcff6'});
        laydate.render({elem: '#tailAfterdTime',type: 'time',theme: '#6dcff6'});
        $("#goInfoLocationTailAfter").on("click",realTimeMonitoringGsmCdma.tailAfter);
        $("#systemTime").on("click",realTimeMonitoringGsmCdma.getSystemTime);
    })
})(window,$)
