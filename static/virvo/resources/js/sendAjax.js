/**
 * Created by Tdz on 2016-11-24.
 */
function json_ajax(type,url,dataType,async,data,callback){
    $.ajax(
        {
            type:type,//通常会用到两种：GET,POST。默认是：GET
            url:url,//(默认: 当前页地址) 发送请求的地址
            dataType:dataType, //预期服务器返回的数据类型。"json"
            async:async, // 异步同步，true  false
            data:data,
            timeout : 30000, //超时时间设置，单位毫秒
            beforeSend:beforeSend, //发送请求
            success:callback, //请求成功
            error:error,//请求出错
            complete:complete//请求完成
        });
}
function ajax_submit(type,url,dataType,async,data,traditional,callback){
    $.ajax(
        {
            type:type,//通常会用到两种：GET,POST。默认是：GET
            url:url,//(默认: 当前页地址) 发送请求的地址
            dataType:dataType, //预期服务器返回的数据类型。"json"
            async:async, // 异步同步，true  false
            data:data,
            traditional:traditional,
            timeout : 30000, //超时时间设置，单位毫秒
            beforeSend:beforeSend, //发送请求
            success:callback, //请求成功
            error:error,//请求出错
            complete:complete//请求完成
        });
}
//逆地理编码专用ajax
function address_submit(type,url,dataType,async,data,traditional,callback){
    $.ajax(
        {
            type:type,//通常会用到两种：GET,POST。默认是：GET
            url:url,//(默认: 当前页地址) 发送请求的地址
            dataType:dataType, //预期服务器返回的数据类型。"json"
            async:async, // 异步同步，true  false
            data:data,
            traditional:traditional,
            timeout : 30000, //超时时间设置，单位毫秒
            success:callback, //请求成功
            error:error,//请求出错
        });
}

function json_ajax_p(type,url,dataType,async,data,callback){
    $.ajax(
        {
            type:type,//通常会用到两种：GET,POST。默认是：GET
            url:url,//(默认: 当前页地址) 发送请求的地址
            dataType:dataType, //预期服务器返回的数据类型。"json"
            async:async, // 异步同步，true  false
            data:data,
            timeout : 30000, //超时时间设置，单位毫秒
            // beforeSend:beforeSend, //发送请求
            success:callback, //请求成功
            error:error,//请求出错
            // complete:complete//请求完成
        });
}

//支持Form方式excel导出
function exportExcelUseForm(url,params) {
	var form = $('<form method="POST" action="' + url + '">');
    $.each(params, function (k, v) {
        form.append($('<input type="hidden" name="' + k +
            '" value="' + v + '">'));
    });
    $('body').append(form);
    form.submit(); //自动提交
}



//支持post方式excel导出
function exportExcelUsePost(url,params) {
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
        beforeSend:beforeSend, //发送请求
        error:error,//请求出错
        complete:complete//请求完成
    })
}


function error(XMLHttpRequest, textStatus, errorThrown){
    layer.closeAll('loading');
    if(textStatus === "timeout"){
        layer.msg("加载超时，请重试");
        return;
    }
    if (XMLHttpRequest.responseText.indexOf("<form id=\"loginForm") > 0) {
        window.location.replace("/clbs/login?type=expired");
        return;
    }
    layer.msg("系统的情绪不稳定，并向你扔了一个错误~");
}


function beforeSend(XMLHttpRequest){
    // console.log('here?');
    var csrftoken = getCookie('csrftoken');
    XMLHttpRequest.setRequestHeader("X-CSRFToken", csrftoken);
    layer.load(2);
}
function complete(XMLHttpRequest, textStatus){
    layer.closeAll('loading');
}

//逆地理编码 -- 解析两个经纬度一组的数据
var startAddress, endAddress, pushIndex = 1;
function backAddressMsg(index,addressLngLat,goBackMsg,addressArray){
  var arrayIndex = index;
  $.ajax(
    {
      type:"POST",
      url:"/clbs/v/monitoring/getAddress",
      dataType:"json",
      async:true,
      data:{lnglatXYs:addressLngLat[index]},
      traditional:true,
      timeout : 30000,
      success:function(data){
    	  var carAddress = data;
    	  if(carAddress == "AddressNull"){
    	      var geocoder = new AMap.Geocoder({
    	          radius: 1000,
    	          extensions: "base"
    	      });
    	      geocoder.getAddress(addressLngLat[index]);
    	      AMap.event.addListener(geocoder,"complete",function(GeocoderResult){
    	        arrayIndex++;
    	        if(pushIndex == 1){
    	          if(GeocoderResult.info == 'NO_DATA'){
    	        	  startAddress = '未定位';
    	          }else{
    	        	  startAddress = GeocoderResult.regeocode.formattedAddress;
    	          };
    	          pushIndex++;
    	        }else{
	        	  if(GeocoderResult.info == 'NO_DATA'){
	        		  endAddress = '未定位';
       	          }else{
       	        	endAddress = GeocoderResult.regeocode.formattedAddress;
       	          };
    	          addressArray.push([startAddress, endAddress]);
    	          startAddress = null;
    	          endAddress == null;
    	          pushIndex = 1;
    	        }
    	        if(startAddress != '未定位' && endAddress != '未定位'){
    	        	var addressParticulars = getaddressParticulars(GeocoderResult,addressLngLat[index][0],addressLngLat[index][1]);
        	        $.ajax({
                    	type:"POST",
                        url:"/clbs/v/monitoring/setAddress",
                        dataType:"json",
                        async:true,
                        data:{"addressNew" : addressParticulars},
                        traditional:false,
                        timeout : 30000,
                    });
    	        };
    	        if(arrayIndex < addressLngLat.length){
    	          backAddressMsg(arrayIndex,addressLngLat,goBackMsg,addressArray);
    	        }else{
    	          return goBackMsg(addressArray);
    	        }
    	      });
    	  }else{
    	    arrayIndex++;
    	    if(pushIndex == 1){
    	      startAddress = carAddress;
    	      pushIndex++;
    	    }else{
    	      endAddress = carAddress;
    	      addressArray.push([startAddress, endAddress]);
    	      startAddress = null;
    	        endAddress == null;
    	        pushIndex = 1;
    	    };
	        if(arrayIndex < addressLngLat.length){
	          backAddressMsg(arrayIndex,addressLngLat,goBackMsg,addressArray);
	        }else{
	          return goBackMsg(addressArray);
	        }
    	  }
      },
  });
}
//逆地理编码 -- 解析一条加载一条
function backAddressMsg1(index,addressLngLat,goBackMsg,addressArray,tableID,tdIndex){
  var arrayIndex = index;
  $.ajax(
	{
	    type:"post",
	    url:"/clbs/v/monitoring/getAddress",
	    dataType:"json",
	    async:true,
	    data:{lnglatXYs:addressLngLat[index]},
	    traditional: true,
	    timeout : 30000,
	    success: function(data){
	    	var carAddress = data;
	    	if(carAddress == "AddressNull"){
	            var geocoder = new AMap.Geocoder({
	                radius: 1000,
	                extensions: "base"
	            });
	            geocoder.getAddress(addressLngLat[index]);
	            AMap.event.addListener(geocoder,"complete",function(GeocoderResult){
	              arrayIndex++;
	              var addressValue_index;
	              if(GeocoderResult.info == 'NO_DATA'){
	            	  addressValue_index = '未定位';
	              }else{
	            	  addressValue_index = GeocoderResult.regeocode.formattedAddress;
	            	  var addressParticulars = getaddressParticulars(GeocoderResult,addressLngLat[index][0],addressLngLat[index][1]);
	            	  $.ajax({
	                	type:"POST",
	                    url:"/clbs/v/monitoring/setAddress",
	                    dataType:"json",
	                    async:true,
	                    data:{"addressNew" : addressParticulars},
	                    traditional:false,
	                    timeout : 30000,
	            	  });
	              };
	              $("#" + tableID).children("tbody").children("tr:nth-child(" + arrayIndex + ")").children("td:nth-child("+ tdIndex +")").text(addressValue_index);
	              if(arrayIndex < addressLngLat.length){
	                  backAddressMsg1(arrayIndex,addressLngLat,goBackMsg,addressArray,tableID,tdIndex);
	              }else{
	                return;
	              }
	            });
	        }else{
	          arrayIndex++;
              var addressValue_index = carAddress;
              $("#" + tableID).children("tbody").children("tr:nth-child(" + arrayIndex + ")").children("td:nth-child("+ tdIndex +")").text(addressValue_index);
              if(arrayIndex < addressLngLat.length){
                backAddressMsg1(arrayIndex,addressLngLat,goBackMsg,addressArray,tableID,tdIndex);
              }else{
                return;
              }
	        }
	    },
	});
};
function getaddressParticulars(AddressNew,longitude,latitude){
    var addressParticulars = {
        "longitude" : longitude.substring(0,longitude.lastIndexOf(".")+4),
        "latitude" : latitude.substring(0,latitude.lastIndexOf(".")+4),
        "adcode" : AddressNew.regeocode.addressComponent.adcode,//区域编码
        "building" : AddressNew.regeocode.addressComponent.building,//所在楼/大厦
        "buildingType": AddressNew.regeocode.addressComponent.buildingType,
        "city" : AddressNew.regeocode.addressComponent.city,
        "cityCode" : AddressNew.regeocode.addressComponent.citycode,
        "district" : AddressNew.regeocode.addressComponent.district,//所在区
        "neighborhood" : AddressNew.regeocode.addressComponent.neighborhood,//所在社区
        "neighborhoodType" : AddressNew.regeocode.addressComponent.neighborhoodType,//社区类型
        "province" : AddressNew.regeocode.addressComponent.province,//省
        "street" : AddressNew.regeocode.addressComponent.street,//所在街道
        "streetNumber" : AddressNew.regeocode.addressComponent.streetNumber,//门牌号
        "township" : AddressNew.regeocode.addressComponent.township,//所在乡镇
        "crosses" : "",
        "pois" : "",
        "roads" : AddressNew.regeocode.roads.name,//道路名称
        "formattedAddress" : AddressNew.regeocode.formattedAddress,//格式化地址
    };
    return JSON.stringify(addressParticulars);
};

//跨域请求接口
function getJsonForCross(type,url,data,dataType,async,jsonp,jsonpCallback,callback) {
    $.ajax(
        {
            type: type,
            url: url,
            data: data,
            dataType: dataType,
            async: async,
            jsonp: jsonp,
            jsonpCallback: jsonpCallback,
            timeout : 30000, //超时时间设置，单位毫秒
            beforeSend:beforeSend, //发送请求
            success:callback, //请求成功
            error:error,//请求出错
            complete:complete//请求完成
        })
}

//校验监控对象是否输入正确
function checkBrands(id){
	//标准车牌规则
	var reg = /^[\u4eac\u6d25\u5180\u664b\u8499\u8fbd\u5409\u9ed1\u6caa\u82cf\u6d59\u7696\u95fd\u8d63\u9c81\u8c6b\u9102\u6e58\u7ca4\u6842\u743c\u5ddd\u8d35\u4e91\u6e1d\u85cf\u9655\u7518\u9752\u5b81\u65b0\u6d4b]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
	//香港车牌规则
	var reg1 = /^[A-Z]{2}[0-9]{4}$/;
	var value = $("#" + id).val();
    if(reg.test(value) || reg1.test(value)) {
        return true;
    } else {
        return false;
    }
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

(function($){  
    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    //备份jquery的ajax方法  
    var _ajax=$.ajax;  
      
    //重写jquery的ajax方法  
    $.ajax=function(opt){  
        //备份opt中error和success方法  
        var fn = {  
          /*  error:function(XMLHttpRequest, textStatus, errorThrown){},  
            success:function(data, textStatus){} ,*/
            complete:function(msg){}
        }  
      /*  if(opt.error){  
            fn.error=opt.error;  
        }  
        if(opt.success){  
            fn.success=opt.success;  
        }  */
        if(opt.complete){
        	fn.complete=opt.complete;
        }

          
        //扩展增强处理  
        var _opt = $.extend(opt,{  
         /*   error:function(XMLHttpRequest, textStatus, errorThrown){  
                //错误方法增强处理  
                  
                fn.error(XMLHttpRequest, textStatus, errorThrown);  
            },  
            success:function(data, textStatus){  
                //成功回调方法增强处理  
                  
                fn.success(data, textStatus);  
            },*/
            complete:function(msg){
            	if (msg.responseText && msg.responseText.indexOf("<form id=\"loginForm") > 0) {
			        window.location.replace("/clbs/login?type=expired");
			        return;
				}	
            	fn.complete(msg);
            }
        });  
        return _ajax(_opt);  
    };
    
   $(".fa-chevron-down").on("click",function(){
    	if($(this).next().is(":hidden")){
    	$(this).prev().trigger("focus");
    	$(this).prev().trigger("click");
    	}
    })
    $(".layer-date").unbind("click").on("click",function(){   	
        	$(this).trigger("focus");        	
        })
})(jQuery); 