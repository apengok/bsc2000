/*
 * 区域查询

  */
 Ext.define('Ext.ux.Windows.AreaQuery', {
	 id: 'AreaQuery',
	 title: '区域查询',
	 createWindow: function() {
		  var me = this;
		  var win = Ext.get('AreaQuery');
		  if(!win) {
			 var pipeLine_store = Ext.create('Ext.data.Store', {
				autoLoad : false,
				fields:['id','material','caliber','length','burying','start_depth','end_depth','burying','start_altitude','end_altitude','area','road','unit','industry_code'],
				proxy : {  
					type : 'ajax',  
					url : 'areaQueryByPipeLine',//请求 					
					reader : {  
						type : 'json',
						root : 'items'
				    }
			    }
		      });
			  
			  
			  var point_store = Ext.create('Ext.data.Store', {
				autoLoad : false,
				fields:['altitude','depth','className','caliber','material','area','road','unit','industry_code'],
				proxy : {  
					type : 'ajax',  
					url : 'areaQueryByPipePoint',//请求 					
					reader : {  
						type : 'json',
						root : 'items'
				    }
			    }
		      });
			  
			  
			  var pipeLine_panel = Ext.create('Ext.grid.Panel', {
				columnLines: true,
				columns: [
					{ text: '编    号',  dataIndex: 'industry_code', menuDisabled:true },
					{ text: '管    长', dataIndex: 'length', menuDisabled:true  },
					{ text: '管    径', dataIndex: 'caliber', menuDisabled:true  },
					{ text: '管    材', dataIndex: 'material', menuDisabled:true  },
					{ text: '起点埋深', dataIndex: 'start_depth', menuDisabled:true  },
					{ text: '终点埋深', dataIndex: 'end_depth', menuDisabled:true  },
					{ text: '埋设方式', dataIndex: 'burying', menuDisabled:true  },
					{ text: '起点高程', dataIndex: 'start_altitude', menuDisabled:true  },
					{ text: '终点高程', dataIndex: 'end_altitude', menuDisabled:true  },
					{ text: '所在区域', dataIndex: 'area', menuDisabled:true  },
					{ text: '所在道路', dataIndex: 'road', menuDisabled:true  },
				],
				store : pipeLine_store,
				listeners: { 
					itemdblclick: function (me, record, item, index, e, eOpts) { 
					       fitToNode(record.id, 'ws_pipe');
					}
				} 
			 });
			 
			 
			 var point_panel = Ext.create('Ext.grid.Panel', {
			 columnLines: true,
				columns: [
					{ text: '编    号',  dataIndex: 'industry_code', menuDisabled:true },
					{ text: '管点类型', dataIndex: 'className', menuDisabled:true,
						renderer:function(value, cellmeta, record, rowIndex, columnIndex, store){
                               if(value=='ws_fire_hydrant')
								   return '消防栓';
							   else if(value=='ws_connector')
							       return '接头';
							   else if(value=='ws_drain_valve')
							       return '排污阀';
							   else if(value=='ws_valve')
							       return '阀门';
							   else if(value=='ws_valve_well')
							       return '阀门井';
							   else if(value=='ws_vent_valve')
							       return '排气阀';
							   else if(value=='ws_watermeter_basin')
							       return '水表井';
						}					
					},
					{ text: '地面高程', dataIndex: 'altitude', menuDisabled:true  },
					{ text: '埋    深', dataIndex: 'depth', menuDisabled:true  },
					{ text: '口    径', dataIndex: 'caliber', menuDisabled:true  },
					{ text: '材    质', dataIndex: 'material', menuDisabled:true  },
					{ text: '埋设方式', dataIndex: 'burying', menuDisabled:true  },
					{ text: '所在区域', dataIndex: 'area', menuDisabled:true  },
					{ text: '所在道路', dataIndex: 'road', menuDisabled:true  }
				],
				store : point_store,
				listeners: { 
					itemdblclick: function (me, record, item, index, e, eOpts) { 
					       fitToNode(record.id, record.data.className);
					}
				}
			 });
			 
			 
			 var tabs = Ext.create('Ext.tab.Panel', { 
				tabPosition:'top',		
				items: [{  
					title: '管线',
					layout : 'fit',
					items:[pipeLine_panel]
				}, {  
					title: '管点',
					layout : 'fit',
					items:[point_panel]
				}]  
			 }); 
			 
			 win = app.createWindow({
                id: me.id,
                title : me.title,
                width : 450,
				height: 500,
                animCollapse:false,
                constrainHeader:true,
				layout : 'fit',
				items:[tabs],
				dockedItems : [{
					xtype : 'toolbar',
					dock : 'top',
					items : ['->',{
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
					    width : 98,
						height : 32,
						text : '查询',
						handler: function() {
							pipeLine_store.removeAll();  
							point_store.removeAll();  
							var length = drawOverlay.getSource().getFeatures().length;
							if(length!=0) {
								var feature = drawOverlay.getSource().getFeatures()[0];
								if(feature) {
									var coords = feature.getGeometry().getCoordinates();
									console.log(coords);
									var polygon = '';
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
									
									pipeLine_store.load({
									   add: true,
									   params:{
											polygon: polygon 
									   },
									   callback: function(records, options, success){ 
									        var panel = tabs.items.items[0];
											panel.setTitle('管线(' + records.length + ')');
									   }
									});
									
									point_store.load({
									   add: true,
									   params:{
											polygon: polygon 
									   },
									   callback: function(records, options, success){ 
									        var panel = tabs.items.items[1];
											panel.setTitle('管点(' + records.length + ')');
									   }
								    });
								}
							}
						}
					},'->',{
					    width : 98,
						height : 32,
						text : '导出',
						handler: function() {
							var panel = tabs.getActiveTab();
							if(panel.title.startsWith("管线")) {
							  var excel="<table>";
							  var array = panel.items.items[0].columns;
							  excel += "<tr>";
							  for(var i=0; i<array.length; i++) {
									  excel += "<td>" + array[i].text+ "</td>";
							  }
							  excel += '</tr>';
							  for(var i=0;i<pipeLine_store.data.items.length; i++){
								    excel += "<tr>";
								    excel += "<td>"+pipeLine_store.data.items[i].data.industry_code+"</td>";
									excel += "<td>"+pipeLine_store.data.items[i].data.length+"</td>";
									excel += "<td>"+pipeLine_store.data.items[i].data.caliber+"</td>";
									excel += "<td>"+pipeLine_store.data.items[i].data.material+"</td>";
									excel += "<td>"+pipeLine_store.data.items[i].data.start_depth+"</td>";
									excel += "<td>"+pipeLine_store.data.items[i].data.end_depth+"</td>";
									excel += "<td>"+pipeLine_store.data.items[i].data.burying+"</td>";
									excel += "<td>"+pipeLine_store.data.items[i].data.start_altitude+"</td>";
									excel += "<td>"+pipeLine_store.data.items[i].data.end_altitude+"</td>";
									excel += "<td>"+pipeLine_store.data.items[i].data.area+"</td>";
									excel += "<td>"+pipeLine_store.data.items[i].data.road+"</td>";
									excel += '</tr>';
							  }
							  excel += '</table>'
							  exportExcel(excel);
							}
							else{
							  var excel="<table>";
							  var array = panel.items.items[0].columns;
							  excel += "<tr>";
							  for(var i=0; i<array.length; i++) {
									  excel += "<td>" + array[i].text+ "</td>";
							  }
							  excel += '</tr>';
							  for(var i=0;i<point_store.data.items.length; i++){
								    excel += "<tr>";
								    excel += "<td>"+point_store.data.items[i].data.industry_code+"</td>";
									var type = point_store.data.items[i].data.className;
									var value = "";
									if(type=='ws_fire_hydrant')
									   value = '消防栓';
								    else if(type=='ws_connector')
									   value = '接头';
								    else if(type=='ws_drain_valve')
									   value =  '排污阀';
								    else if(type=='ws_valve')
									   value = '阀门';
								    else if(type=='ws_valve_well')
									   value = '阀门井';
								    else if(type=='ws_vent_valve')
									   value = '排气阀';
								    else if(type=='ws_watermeter_basin')
									   value = '水表井';
									excel += "<td>"+value+"</td>";
									excel += "<td>"+point_store.data.items[i].data.altitude+"</td>";
									excel += "<td>"+point_store.data.items[i].data.depth+"</td>";
									excel += "<td>"+point_store.data.items[i].data.caliber+"</td>";
									excel += "<td>"+point_store.data.items[i].data.material+"</td>";
									excel += "<td>"+point_store.data.items[i].data.burying+"</td>";
									excel += "<td>"+point_store.data.items[i].data.area+"</td>";
									excel += "<td>"+point_store.data.items[i].data.road+"</td>";
									excel += '</tr>';
							  }
							  excel += '</table>'
							  exportExcel(excel);
							}
						    
						}
					},'->']
				}]
            });
		
		  }
		  return win;
		  
	 }
});
