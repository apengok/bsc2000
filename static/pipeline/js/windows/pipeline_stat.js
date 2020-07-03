/*
 * 管线统计

  */
Ext.define('Ext.ux.Windows.PipeLineStat', {
	 id: 'PipeLineStat',
	 title: '管线统计',
	 createWindow: function() {
		  var me = this;
		  var win = Ext.get('PipeLineStat');
		  if(!win) {
			 var equipment_stat_store = Ext.create('Ext.data.Store', {
				autoLoad : true,
				fields:['className','value'],
				proxy : {  
					type : 'ajax',  
					url : 'areaStat',//请求 					
					reader : {  
						type : 'json',
						root : 'items'
				    }
			    }
		      });

			  var fields_lst_panel = Ext.create('Ext.Panel', {
				height: 415,
				autoScroll : true,
				html:'<table class="table table-bordered"><tbody><tr><td style="padding:5px;"><label><input type="checkbox" value="" name="">建设年代</label></td></tr><tr><td style="padding:5px;"><label><input type="checkbox" value="caliber" name="propNames">管径</label></td></tr><tr><tr><td style="padding:5px;"><label><input type="checkbox" value="material" name="propNames">管材</label></td></tr><tr><td style="padding:5px;"><label><input type="checkbox" value="burying" name="propNames">埋设方式</label></td></tr><tr><td style="padding:5px;"><label><input type="checkbox" value="start_depth" name="propNames">起点埋深</label></td></tr><tr><td style="padding:5px;"><label><input type="checkbox" value="end_depth" name="propNames">终点埋深</label></td></tr><tr><td style="padding:5px;"><label><input type="checkbox" value="start_altitude" name="propNames">起点高程</label></td></tr><tr><td style="padding:5px;"><label><input type="checkbox" value="end_altitude" name="propNames">终点高程</label></td></tr><tr><td style="padding:5px;"><label><input type="checkbox" value="road" name="propNames">所在道路</label></td></tr><tr><td style="padding:5px;"><label><input type="checkbox" value="input_time" name="propNames">录入时间</label></td></tr><tr><td style="padding:5px;"><label><input type="checkbox" value="input_staff" name="propNames">录入人员</label></td></tr><tr><td style="padding:5px;"><label><input type="checkbox" value="modify_time" name="propNames">修改时间</label></td></tr><tr><td style="padding:5px;"><label><input type="checkbox" value="modify_staff" name="propNames">修改人员</label></td></tr></tbody></table>'
			  });
			  
			 
			 var equipment_stat_panel = Ext.create('Ext.Panel', {
				height: 415,
				autoScroll : true,
				html:'<table class="table table-bordered"><thead id="stat_view"><tr><th>统计图层</th><th>属    性</th><th>属 性 值</th><th>统计结果</th></tbody></table>'
			 });
			 
			 
			 var tTool = null;
			 var layers = new Ext.form.ComboBox({
                 fieldLabel: '图层:',
                 displayField: 'layerName',
                 valueField: 'value',
                 triggerAction: 'all',
                 emptyText: '请选择...',
                 allowBlank: false,
                 blankText: '请选择...',
                 editable: false,
                 mode: 'local',
				 labelWidth : 35,
				 width: 150,
				 store: new Ext.data.SimpleStore({
					fields: ['layerName', 'value'],
					data : [
						 ['供水管线','ws_pipe']
					]
				 })
             });
			 
			 win = app.createWindow({
                id: me.id,
                title : me.title,
                width : 520,
				height: 500,
                animCollapse:false,
                constrainHeader:true,
				layout : 'hbox',
				items: [{  
					     layout:'fit', width:130, items:[fields_lst_panel]  
				       }, {  
					     layout:'fit', width:385, items:[equipment_stat_panel]  
				       }],
				dockedItems : [{
					xtype : 'toolbar',
					dock : 'top',
					items : [layers,'->',{
						xtype : "label",
						text : '选择范围:',
						style:'color: #157fcc;size: 15px;font-weight: 300;font-family: helvetica,arial,verdana,sans-serif;line-height: 16px;'
					},'->',{
					    width : 36,
						height : 32,
						style:'background-image:url('+$ctx+'/images/rectangle.png);background-repeat: no-repeat;background-position:center center;',
						handler: function() {
							activate(P.PlotTypes.RECTANGLE);
						}
					},'->',{
					    width : 36,
						height : 32,
						style:'background-image:url('+$ctx+'/images/polygon.png);background-repeat: no-repeat;background-position:center center;',
						handler: function() {
							activate(P.PlotTypes.POLYGON);
						}
					},'->',{
					    width : 55,
						height : 32,
						text : '统计',
						handler: function() {
							var polygon = '';
							var propNames = '';
							var length = drawOverlay.getSource().getFeatures().length;
							if(length!=0) {
								var feature = drawOverlay.getSource().getFeatures()[0];
								if(feature) {
									var coords = feature.getGeometry().getCoordinates();
									for(var i=0; i<coords[0].length; i++) {
											var coord = ol.proj.toLonLat(coords[0][i], "EPSG:3857");
											if(coords[0].length-1!=i)
											 polygon += coord[0] + " " + coord[1] + ",";
											else
											 polygon += coord[0] + " " + coord[1];
									}

									if(coords[0].length>0) {
										var coord = ol.proj.toLonLat(coords[0][0], "EPSG:3857");
										polygon += "," + coord[0] + " " + coord[1];
									}
								}
							}
							
							$("input[name='propNames']").each(function(){
							    if($(this).get(0).checked){
								   propNames += $(this).get(0).value + ",";
								}
							});
							 
							Ext.Ajax.request( {
								url : 'pipeLineStat',
								method : 'post',
								params : {
									layerName : layers.getValue(),
									layerAliasName: layers.getRawValue(),
									propNames : propNames,
									polygon : polygon
								},
								success : function(response, options) {
									var data = response.responseText;
									$('#stat_view').empty();
									$('#stat_view').append("<tr><th>统计图层</th><th>属    性</th><th>属 性 值</th><th>统计结果</th>");
									for(var i in language) {
										if(language.hasOwnProperty(i)) { 
										    var regExp = new RegExp(i, "g"); 
											data = data.replace(regExp, language[i]);
										}
									 }
									$('#stat_view').append(data);
								}
							});
						}
					},'->',{
					    width : 55,
						height : 32,
						text : '专题图',
						handler: function() {
							
							var tWin = Ext.create("Ext.window.Window", {
								modal: true,
								title: "专题图",
								width: 600,
								height: 500,
								layout: "fit",
								html: '<div id="myChart" style="width:100%;height:100%"></div>',
							});
							tWin.show();
							
							var polygon = '';
							var propNames = '';
							if(drawOverlay.getSource().getFeatures()[0]!=null) {
								var feature = drawOverlay.getSource().getFeatures()[0];
								if(feature) {
									var coords = feature.getGeometry().getCoordinates();
									for(var i=0; i<coords[0].length; i++) {
										var coord = ol.proj.toLonLat(coords[0][i], "EPSG:3857");
										if(coords[0].length-1!=i)
											polygon += coord[0] + " " + coord[1] + ",";
										else
											polygon += coord[0] + " " + coord[1];
									}
									if(coords[0].length>0) {
										var coord = ol.proj.toLonLat(coords[0][0], "EPSG:3857");
										polygon += "," + coord[0] + " " + coord[1];
									}
								}
							}
							
							$("input[name='propNames']").each(function(){
							    if($(this).get(0).checked){
								   propNames += $(this).get(0).value + ",";
								}
							});
							 
							Ext.Ajax.request( {
								url : 'pipeLineStatByReport',
								method : 'post',
								params : {
									layerName : layers.getValue(),
									layerAliasName: layers.getRawValue(),
									propNames : propNames,
									polygon : polygon
								},
								success : function(response, options) {
									 var data = response.responseText;
									 for(var i in language) {
										if(language.hasOwnProperty(i)) { 
										    var regExp = new RegExp(i, "g"); 
											data = data.replace(regExp, language[i]);
										}
									 }
									 var report = Ext.util.JSON.decode(data);
									
									 var myChart = echarts.init(document.getElementById('myChart'));
							   
									 var option = {
										legend: {
											x: 'left',
											orient:'vertical',
											top: 100,
											data:[]
										},
										title:{
											text: layers.getRawValue() + "统计结果",
											x:'center',
											y:'top',
											textAlign:'center'
										},
										tooltip : {
											trigger: 'axis',
											axisPointer : {            // 坐标轴指示器，坐标轴触发有效
												type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
											},
											formatter: function (params) {
												
												var tipText = params[0].name;
												for(var i=0; i<params.length;i++) {
													if(params[i].value != '-') {
														tipText += '<br/>' + params[i].seriesName + ' : ' + params[i].value;
													}
												}
											
												return tipText;
											}
										},
										toolbox: {
											show : true,
											feature : {
												magicType: {show: true, type: ['line', 'bar']}
											}
										},
									     grid: {
											left: '100',
											right: '4%',
											bottom: '3%',
											containLabel: true
										},
										xAxis : [
											{
												type : 'category',
												data : []
											}
										],
										yAxis : [
											{
													type : 'value'
											}
										],
										series : [
											   
										]
									 };
									 
									 var Item = function(name, stack, data){  
										  return {  
												name: name,  
												type:'bar', 
												stack: stack,											
												data:data  
											}  
									 };
									 
									 var legends = [];// 准备存放图例数据  
									 var xAxislabels = [];
									 var series = []; // 准备存放图表数据  
									 for(var i=0; i<report.length; i++) {
										  var tArray = report[i];
										  xAxislabels.push(tArray.category);
										  for(var j=0; j<tArray.datas.length; j++) {
											  var tObj = tArray.datas[j];
											  legends.push(tObj.propName+"");
											  var datas = [];
											  for(c=0;c<i;c++){
												  datas.push('-');
											  }
											  datas.push(tObj.length);
											  var item = new Item(tObj.propName+"", tArray.category,datas);
											  series.push(item);
										  }
										  
									 }
									 
									 option.legend.data = legends;// 设置图例  
									 option.series = series; // 设置图表
									 option.xAxis[0].data = xAxislabels;								 
									 myChart.setOption(option);
						        }
							});
						}
					}]
				}]
            });
		
		  }
		  return win;
		  
	 }
});
