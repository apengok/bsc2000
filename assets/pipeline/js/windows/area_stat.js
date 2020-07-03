/*
 * 区域统计

  */
 Ext.define('Ext.ux.Windows.AreaStat', {
	 id: 'AreaStat',
	 title: '区域统计',
	 createWindow: function() {
		  var me = this;
		  var win = Ext.get('AreaStat');
		  if(!win) {
			 var area_stat_store = Ext.create('Ext.data.Store', {
				autoLoad : false,
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
              var iCol = 0;
			  var area_stat_panel = Ext.create('Ext.grid.Panel', {
				columnLines: true,
				columns: [
					{ text: '统计内容',  dataIndex: 'className', menuDisabled:true,
					 renderer:function(value, cellmeta, record, rowIndex, columnIndex, store){
                               if(value=='ws_fire_hydrant')
								   return '消防栓(个)';
							   else if(value=='ws_connector')
							       return '接头(个)';
							     else if(value=='ws_pipe'){
								   if(iCol == 0){
									   iCol++;
									   return '管线长度(米)';
								   }
								   else
									   return '管线数量';
							   }
							   else if(value=='ws_drain_valve')
							       return '排污阀(个)';
							   else if(value=='ws_valve')
							       return '阀门(个)';
							   else if(value=='ws_valve_well')
							       return '阀门井(个)';
							   else if(value=='ws_vent_valve')
							       return '排气阀(个)';
							   else if(value=='ws_watermeter_basin')
							       return '水表井(个)';
						} 
					},
					{ text: '统计结果', dataIndex: 'value', menuDisabled:true,width:160  }
				],
				store : area_stat_store
			 });
			 
			 win = app.createWindow({
                id: me.id,
                title : me.title,
                width : 298,
				height: 426,
                animCollapse:false,
                constrainHeader:true,
				layout : 'fit',
				items:[area_stat_panel],
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
						text : '统计',
						handler: function() {
							area_stat_store.removeAll(); 
							var length = drawOverlay.getSource().getFeatures().length;
							if(length!=0) {
								var feature = drawOverlay.getSource().getFeatures()[0];
								if(feature) {
									var coords = feature.getGeometry().getCoordinates();
									
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
									
									area_stat_store.load({
									   add: true,
									   params:{
											polygon: polygon 
									   },
									   callback: function(records, options, success){ 
									        var panel = tabs.items.items[0];
											panel.setTitle('管线(' + records.length + ')');
									   }
									});
								}
							}
						}
					},'->',{
					    width : 98,
						height : 32,
						text : '导出'
					},'->']
				}]
            });
		
		  }
		  return win;
		  
	 }
});
