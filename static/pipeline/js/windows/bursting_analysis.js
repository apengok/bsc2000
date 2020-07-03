/*
 * 区域查询

  */
 Ext.define('Ext.ux.Windows.BurstingAnalysis', {
	 id: 'BurstingAnalysis',
	 title: '爆管分析',
	 pipe_id: '',
	 createWindow: function() {
		  var me = this;
		  var win = Ext.get('BurstingAnalysis');
		  if(!win) {
			  
			  var point_store = Ext.create('Ext.data.Store', {
				autoLoad : true,
				fields:['altitude','depth','className','caliber','material','area','road','unit','external_code'],
				proxy : {  
					type : 'ajax',  
					url : 'burstingAnalysis?id=' +me.pipe_id ,//请求 
					timeout: 100000, 					
					reader : {  
						type : 'json',
						root : 'items'
				    }
			    }
		      });
			 
			 
			 var point_panel = Ext.create('Ext.grid.Panel', {
			 columnLines: true,
				columns: [
					{ text: '编    号',  dataIndex: 'external_code', menuDisabled:true },
					{ text: '管点类型', dataIndex: 'className', menuDisabled:true,
						renderer:function(value, cellmeta, record, rowIndex, columnIndex, store){
							      return '阀门';
						}					
					},
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
					title: '阀门列表',
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
				items:[tabs]/*,
				dockedItems : [{
					xtype : 'toolbar',
					dock : 'bottom',
					items : ['->',{
					    width : 98,
						height : 32,
						text : '模拟关阀'
					}]
				}]*/
            });
		
		  }
		  return win;
		  
	 }
});
