/**
 * Created by feng on 2016/9/12.
 *
 @namespace 获取scada数据插件*/

 var NumericVal = function(id, pTag, pntAttr, dateTime1, dateTime2){
	 this.id = id;
	 this.tag = pTag;
	 this.pntAttr = pntAttr;
	 this.dateTime1 = dateTime1;
	 this.dateTime2 = dateTime2;
 }
 
 var DigitData = function(pTag){
	 this.tag = pTag;
 }
 
 var PointProperty = function(pTag, pProName){
	 this.tag = pTag;
	 this.proName = pProName;
 }

var JGaraphPlugin = window.JGaraphPlugin = JGaraphPlugin || {};

var DataSource = {
    dsEnergyManager : 0,             ///< 能源管理
    dsMeterManager: 1,              ///< 抄表管理
	dsAlarmManager : 2,           ///<  报警数据源
    dsWSNetwork : 3           ///<  水务管网
};

(function(){

    var ClientDataAccess =
        JGaraphPlugin.ClientDataAccess = function(opts){
            this._opts = {
                hostName: "127.0.0.1",  //数据服务器IP地址
                port: "80",             //端口号
                path: "dataengin-web"  //项目名称
            };
            $.extend(this._opts, opts);

            this.url = "http://" + this._opts.hostName + ":" + this._opts.port + "/" + this._opts.path;
            var me = this;
            //请求派发
            this.requestDispatcher = function(resource, params, method, success, error){
				$.ajax({
					type: method,
					url: me.url + "/" + resource,
					data: params,
					success: success,
					dataType: "text",
					success: success,
					error: error
				});
            }
        }
    /**
     * 获取遥测数据
     */
    ClientDataAccess.prototype.getSingleData = function(arr, success, error){
		if(arr.constructor != Array){
			success("", "failed");
			return;
		}
		//var data  = "params=" + JSON.stringify(arr);	
		var data  = "params=" + JSON.stringify(arr);
		// alert(data);
        this.requestDispatcher('getSingleData', data , 'POST', success, error);
    }

    /**
     * 读取遥信数据
     */
    ClientDataAccess.prototype.getDigitState = function(arr, success, error){
        if(arr.constructor != Array){
			success("", "failed");
			return;
		}
		var data  = "params=" + JSON.stringify(arr);
        this.requestDispatcher('getDigitState', data , 'POST', success, error);
    }

    /**
     * 获取组数据
     */
    ClientDataAccess.prototype.getGroupData = function(pTag, pntAttr, dateTime1, dateTime2, success, error){
        var data = "pTag="+pTag+"&pntAttr="+pntAttr+"&dateTime1="+dateTime1+"&dateTime2="+dateTime2+"";
        this.requestDispatcher('getGroupData', data, 'GET', success, error);
    }
	
    ClientDataAccess.prototype.sendAO = function(pTag, val, success, error){
        var data = "pTag="+pTag+"&val="+val;
        this.requestDispatcher('sendAO', data, 'GET', success, error);
    }
	
	ClientDataAccess.prototype.sendDO = function(pTag, val, success, error){
        var data = "pTag="+pTag+"&val="+val;
        this.requestDispatcher('sendDO', data, 'GET', success, error);
    }
	
	ClientDataAccess.prototype.sendCtrlDirect = function(pTag, val, success, error){
        var data = "pTag="+pTag+"&val="+val;
        this.requestDispatcher('sendCtrlDirect', data, 'GET', success, error);
    }

    /**
     * 根据tag获取点属性
     */
    ClientDataAccess.prototype.getPointPropertyByTag = function(arr, success, error){
        if(arr.constructor != Array){
			success("", "failed");
			return;
		}
		var data  = "params=" + JSON.stringify(arr);
        this.requestDispatcher('getPointPropertyByTag',data, 'POST',success, error);
    }

    /**
     * 根据tag获取点名
     */
    ClientDataAccess.prototype.getPointNameByTag = function(pTag, success, error){
        var data = "pTag=" + pTag;
        this.requestDispatcher('getPointNameByTag', data, 'GET', success, error);
    }
	
	 /**
     * 查询关系数据库
     */
	ClientDataAccess.prototype.executeQuery = function(dataSource, sql, success, error){
		
        var data = "sql=" +sql + "&databaseName=" + dataSource;
        this.requestDispatcher('executeQuery', data, 'GET', success, error);
    }
	


})();

/*
    //插件调用例子
    var obj = new JGaraphPlugin.ClientDataAccess({hostName:'192.168.1.89',port:'8080'});

	var arr = new Array();
	var nVal = new NumericVal('tag_14a1', 0, 'cccc/ccc/ccc_ccc:ccc:ccc', 'cccc/ccc/ccc_ccc:ccc:ccc');
	arr.push(nVal);
	
	obj.getSingleData(arr,function(res, textStatus){
	   if(textStatus === "success"){
	      for(var i=0; i<res.length; i++){
		     var tVal = res[i];
		     console.log("tag:" + tVal.ptag + " value:" + tVal.value);
		  }
	   }
	},function(XMLHttpRequest, textStatus, errorThrown){
	    console.log(" error msg: " + textStatus);
	});

	=========================================================================
	
    var arr = new Array();
	var digitData = new DigitData('tag_14d10');
	arr.push(digitData);
	
	obj.getDigitState(arr,function(res, textStatus){
	   if(textStatus === "success"){
	      for(var i=0; i<res.length; i++){
		     var tVal = res[i];
		     console.log("tag:" + tVal.ptag);
		  }
	   }
	},function(XMLHttpRequest, textStatus, errorThrown){
	    console.log(" error msg: " + textStatus);
	});
	
	=========================================================================

    obj.getGroupData('tag_14a1',1,"2016/10/13_16:20:34","cccc/ccc/ccc_ccc:ccc:ccc",function(res){
          alert(res);
    });

    =========================================================================
	
    var arr = new Array();
	var property = new PointProperty('tag_14a1','Eu_Value');
	arr.push(property);
	
	obj.getPointPropertyByTag(arr,function(res, textStatus){
	   if(textStatus === "success"){
	      for(var i=0; i<res.length; i++){
		     var tVal = res[i];
		     console.log("tag:" + tVal.ptag + " value:" + tVal.value);
		  }
	   }
	},function(XMLHttpRequest, textStatus, errorThrown){
	    console.log(" error msg: " + textStatus);
	});
	
	=========================================================================
	
	obj.getPointNameByTag('tag_14a1',function(res, textStatus){
	   if(textStatus === "success" && res!==null){
		     console.log("tag:" + res.ptag + " stnName:" + res.stnName + " pntName: " + res.stnName);
	   }
	},function(XMLHttpRequest, textStatus, errorThrown){
	    console.log(" error msg: " + textStatus);
	});
 */




