/*
 * 管线查询

  */
 Ext.define('Ext.ux.Windows.PipeQuery', {
	 id: 'PipeQuery',
	 title: '管线查询',
	 createWindow: function() {
		  var me = this;
		  var win = Ext.get('PipeQuery');
		  if(!win) {
			  
		       var pipe_line_store = Ext.create('Ext.data.Store', {
				fields:['id','material','caliber','length','burying','start_depth','end_depth','burying','start_altitude','end_altitude','area','road','unit','industry_code'],
				proxy : {  
					type : 'ajax',  
					url : 'pipeLineQuery',//请求 					
					reader : {  
						type : 'json',
						root : 'items'
				    },
					actionMethods: {  
						create : 'POST',  
						read   : 'POST', // by default GET  
						update : 'POST',  
						destroy: 'POST'  
					} 
			    }
		      });
			  
			 
			 var material = new Ext.form.ComboBox({
                 fieldLabel: '管线材质:',
                 displayField: 'name',
                 valueField: 'value',
                 triggerAction: 'all',
                 emptyText: '请选择...',
                 allowBlank: false,
                 blankText: '请选择...',
                 editable: false,
                 mode: 'local',
				 store: new Ext.data.SimpleStore({
					fields: ['name', 'value'],
					data : [
					     ['PE管','PE管'],
						 ['球墨管','球墨管'],
						 ['铸铁管','铸铁管'],
						 ['砼','砼'],
						 ['球墨铸铁','球墨铸铁'],
						 ['钢铁管','钢铁管'],
						 ['其他','其他']
					]
				 })
             });
			 var caliber = new Ext.form.ComboBox({
                 fieldLabel: '管线口径:',
                 displayField: 'name',
                 valueField: 'value',
                 triggerAction: 'all',
                 emptyText: '请选择...',
                 allowBlank: false,
                 blankText: '请选择...',
                 editable: false,
                 mode: 'local',
				 store: new Ext.data.SimpleStore({
					fields: ['name', 'value'],
					data : [
						 ['DN50','50'],
						 ['DN63','63'],
						 ['DN80','80'],
						 ['DN90','90'],
						 ['DN100','100'],
						 ['DN110','110'],
						 ['DN150','150'],
						 ['DN160','160'],
						 ['DN200','200'],
						 ['DN225','225'],
						 ['DN300','300'],
						 ['DN400','400'],
						 ['DN500','500'],
						 ['DN600','600'],
						 ['DN800','800']
					]
				 })
             });
			  
			  
			 var year = new Ext.form.ComboBox({
                 fieldLabel: '管线年份:',
                 displayField: 'name',
                 valueField: 'id',
                 triggerAction: 'all',
                 emptyText: '请选择...',
                 allowBlank: false,
                 blankText: '请选择...',
                 editable: false,
                 mode: 'local',
				 store: new Ext.data.SimpleStore({
					fields: ['name', 'value'],
					data : [
					     ['2010','2010'],
					     ['2011','2011'],
					     ['2012','2012'],
					     ['2013','2013'],
						 ['2014','2014'],
						 ['2015','2015'],
						 ['2016','2016'],
						 ['2017','2017']
					]
				 })
             });
			 
			 /*
			  var burying = new Ext.form.ComboBox({
                 fieldLabel: '埋设方式:',
                 displayField: 'name',
                 valueField: 'id',
                 triggerAction: 'all',
                 emptyText: '请选择...',
                 allowBlank: false,
                 blankText: '请选择...',
                 editable: false,
                 mode: 'local'
             });
			 */
			 
			 var txtRoad = new Ext.form.TextField({
				 fieldLabel : "所在道路:",
				 emptyText: '请输入...'
			 });
			  
			  
			  var condition = Ext.create('Ext.form.FieldSet',{
				   title: "查询条件",
				   height: 125,
				   width: 500,
				   layout : "column",
				   items: [{
					    border: 0,
						columnWidth : 0.5,
						items:[{
							layout:'form',
                            border:0,							
							items:[year]
						}]
                   },{
					    border: 0,
						columnWidth : 0.5,
						items:[{
							layout:'form', 
                            border:0,							
							items:[material]
						}]
                   },{
					    border: 0,
						columnWidth : 0.5,
						items:[{
							layout:'form',
                            border:0,							
							items:[caliber]
						}]
                   },{
					    border: 0,
						columnWidth : 0.5,
						items:[{
							layout:'form', 
                            border:0,							
							items:[txtRoad]
						}]
                   },{
					    border: 0,
						columnWidth : 1,
						items:[{
							layout:'form', 
                            border:0,					
							items:[{
								xtype: "button",
								height: 30,
								margin: '0 0 0 418',
								text: "查询",
								handler: function() {
									 pipe_line_store.removeAll();  
									 pipe_line_store.load({
									   add: true,
									   params:{
											build: year.getValue(),
                                            material: material.getValue(),
											caliber: caliber.getValue(),
                                            road: txtRoad.getValue()											
									   }
								    });
								}
							}]
						}]
                   }]
			  });
			  
			  
			  var panel = Ext.create('Ext.grid.Panel', {
				columnLines: true,
				store: pipe_line_store,
				width : 520,
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
					{ text: '所在道路', dataIndex: 'road', menuDisabled:true  }
				],
				dockedItems : [{
					xtype : 'toolbar',
					dock : 'top',
					items : [condition]
				}],
				listeners: { 
					itemdblclick: function (me, record, item, index, e, eOpts) { 
					       fitToNode(record.id, 'ws_pipe');
					}
				}
			 });
			 
			win = app.createWindow({
                id: me.id,
                title : me.title,
                width : 520,
				height: 500,
                animCollapse:false,
                constrainHeader:true,
				layout : 'fit',
				resizable:false,
				items:[panel]
			});
		  }
		  return win;
		  
	 }
});
