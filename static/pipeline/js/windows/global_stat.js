/*
 * 区域统计

  */
 Ext.define('Ext.ux.Windows.GlobalStat', {
	 id: 'GlobalStat',
	 title: '全区统计',
	 createWindow: function() {
		  var me = this;
		  var win = Ext.get('GlobalStat');
		  if(!win) {
			 var area_stat_store = Ext.create('Ext.data.Store', {
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
				items:[area_stat_panel]
            });
		
		  }
		  return win;
		  
	 }
});
