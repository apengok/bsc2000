var JscadaVideo = function(opts) {
	var options = opts || {};
	
	var path = options.path != undefined ? options.path : '';
	var target = options.target != undefined ? options.target : '';
	var autoplay = options.autoplay != undefined ? options.autoplay : true;
	var sourceSrc = options.sourceSrc != undefined ? options.sourceSrc : '';
	
	var url = path;
	
	var this_ = this;
	//异步
	var requestDispatcher = function(resource, params, method, success, error){
		$.ajax({
			type: method,
			url: resource,
			data: params,
			success: success,
			dataType: "json",
			success: success,
			error: error
		});
    }
	
	//同步
    var syncrequestDispatcher = function(resource, params, method, success, error){
		$.ajax({
			type: method,
			url: resource,
			data: params,
			async: false,
			success: success,
			dataType: "json",
			success: success,
			error: error
		});
    }
	
	
	var options = {
		bigPlayButton : false,
	    textTrackDisplay : false,
	    posterImage: true,
	    errorDisplay : false,
	    controlBar : false,
		autoplay : autoplay,
		sources : [{
			src : sourceSrc
		}]
	};

	var myPlayer = videojs(target, options, function onPlayerReady() {
		this.play();
  
		//判断视频是否卡住，卡主3s重新load视频
		var lastTime = -1,
		tryTimes = 0;
		        
		clearInterval(isVideoBreak);
		var isVideoBreak = setInterval(function(){
		    var currentTime = myPlayer.currentTime();

		    if(currentTime == lastTime){
		        //此时视频已卡主3s
		        //设置当前播放时间为超时时间，此时videojs会在play()后把currentTime设置为0
		        myPlayer.currentTime(currentTime+10000);
				myPlayer.load();
		        myPlayer.play();

		        //尝试5次播放后，如仍未播放成功提示刷新
		        if(++tryTimes > 5){
		            tryTimes = 0;
		        }else{
		            lastTime = currentTime;
		            tryTimes = 0;
				}
			}
		},3000);
	});
	
	//视频播放
	JscadaVideo.prototype.sourceSrc = function(src_) {
		myPlayer.src(src_);
		myPlayer.load();
		myPlayer.play();
	}
	
	//获取在线的设备列表
	JscadaVideo.prototype.deviceList = function(success, error){
        this.requestDispatcher('list', '' , 'GET', 	success, error);					
    }
	
	// nvr设备列表
	JscadaVideo.prototype.dvrList = function(success, error){
        this.requestDispatcher('dvrList', '' , 'GET', success, error);				
    }
	
	//添加NVR设备
	JscadaVideo.prototype.addNvr = function(serialNo, name, host, port, userName, passWord, success, error){
    	var sessionId = uuid(8, 16);
		var data  = "sessionId=" +sessionId + "&serialNo=" + serialNo +"&nvrName=" + name + "&nvrIp=" + ip + "&nvrPort=" + port + "&userName=" + userName + "&passWord=" + passWord;
        var this_ = this;
        this_.requestDispatcher('addNvr', data , 'POST', function(res){
        	 //就绪状态
		     if(res.header.commandId == 100011) {
		    	var interval = setInterval(function(){ 
		    		refresh(sessionId, function(res){
						 clearInterval(interval);
						 success(res);
					}, error);
		    	}, 2000); 
			 }else {
				success(res);
			 }
		}, error);						
    }
	
	
	//轮询获取数据
    var refresh = function(sessionID, callback, error){
		var data  = "sessionId=" + sessionID;
        this.syncrequestDispatcher('getRes', data , 'POST', callback, error);				
    }
	
	//开始操作云台
	JscadaVideo.prototype.startControl = function(serialNo, channel, commandId, success, error){
		var sessionId = uuid(8, 16);
		var data  = "sessionId=" +sessionId + "&serialNo=" + serialNo +"&channel=" + channel + "&commandId=" + commandId + "&speed=3";
		var this_ = this;
		this_.syncrequestDispatcher('control_start', data , 'GET', function(res){
       	     //就绪状态
		     if(res.header.commandId == 100011) {
		    	var interval = setInterval(function(){ 
		    		refresh(sessionId, function(res){
						 clearInterval(interval);
						 success(res);
					}, error);
		    	}, 2000); 
			 }else {
				success(res);
			 }
       }, error);
    }
	
	JscadaVideo.prototype.stopControl = function(serialNo, channel, commandId, success, error){
		var sessionId = uuid(8, 16);
		var data  = "sessionId=" +sessionId + "&serialNo=" + serialNo +"&channel=" + channel + "&commandId=" + commandId + "&speed=3";
		var this_ = this;
		this_.syncrequestDispatcher('control_stop', data , 'GET', function(res){
       	     //就绪状态
		     if(res.header.commandId == 100011) {
		    	var interval = setInterval(function(){ 
		    		refresh(sessionId, function(res){
						 clearInterval(interval);
						 success(res);
					}, error);
		    	}, 2000); 
			 }else {
				success(res);
			 }
       }, error);
    }
}