/*
 * 缓冲查询

  */
 Ext.define('Ext.ux.Windows.BuffQuery', {
	 id: 'BuffQuery',
	 title: '缓冲查询',
	 createWindow: function() {
		  var me = this;
		  var win = Ext.get('BuffQuery');
		  if(!win) {
			  Ext.create('Ext.data.Store', {
				storeId:'simpsonsStore',
				fields:['name', 'email', 'phone'],
				data:{'items':[
					{ 'name': 'Lisa',  "email":"lisa@simpsons.com",  "phone":"555-111-1224"  },
					{ 'name': 'Bart',  "email":"bart@simpsons.com",  "phone":"555-222-1234" },
					{ 'name': 'Homer', "email":"home@simpsons.com",  "phone":"555-222-1244"  },
					{ 'name': 'Marge', "email":"marge@simpsons.com", "phone":"555-222-1254"  }
				]},
				proxy: {
					type: 'memory',
					reader: {
						type: 'json',
						root: 'items'
					}
				}
		      });
			  
			  
			  var panel = Ext.create('Ext.grid.Panel', {
				columnLines: true,
				columns: [
					{ text: '管线编号',  dataIndex: 'name', menuDisabled:true },
					{ text: '管    长', dataIndex: 'phone', menuDisabled:true  },
					{ text: '分 类 码', dataIndex: 'phone', menuDisabled:true  },
					{ text: '管    径', dataIndex: 'phone', menuDisabled:true  },
					{ text: '管    材', dataIndex: 'phone', menuDisabled:true  },
					{ text: '起点埋深', dataIndex: 'phone', menuDisabled:true  },
					{ text: '终点埋深', dataIndex: 'phone', menuDisabled:true  },
					{ text: '埋设方式', dataIndex: 'phone', menuDisabled:true  },
					{ text: '起点高程', dataIndex: 'phone', menuDisabled:true  },
					{ text: '终点高程', dataIndex: 'phone', menuDisabled:true  },
					{ text: '所在区域', dataIndex: 'phone', menuDisabled:true  },
					{ text: '所在道路', dataIndex: 'phone', menuDisabled:true  },
				]
			 });
			 
			 
			 var layers = new Ext.form.ComboBox({
                 fieldLabel: '图层:',
                 displayField: 'name',
                 valueField: 'id',
                 triggerAction: 'all',
                 emptyText: '请选择...',
                 allowBlank: false,
                 blankText: '请选择...',
                 editable: false,
                 mode: 'local'
             });
			 
			 var distance = new Ext.form.NumberField({  
			    fieldLabel: '缓冲距离:',
				name: 'numberField',  
				value: 50, 				
				maxValue: 0  
			 });  
			 
			 var condition = Ext.create('Ext.form.FieldSet',{
				   title: "查询条件",
				   height: 100,
				   width : 500,
				   layout : "column",
				   items: [{
					    border: 0,
						columnWidth : 0.5,
						items:[{
							layout:'form',
                            border:0,							
							items:[layers]
						}]
                   },{
					    border: 0,
						columnWidth : 0.5,
						items:[{
							layout:'form', 
                            border:0,						
							items:[distance]
						}]
                   },{
					    border: 0,
						columnWidth : 1,
						layout: {  
							type: 'hbox',  
							align: 'middle',  
							pack: 'end'							
						},
						items:[{
								xtype: "button",
								height: 30,
								margin: '0 10 0 0',
								text: "绘制线路"
							},{
								xtype: "button",
								height: 30,
								margin: '0 0 0 0',
								text: "查&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp询"
							}]
                   }]
			  });
			 
			 
			 
			 win = app.createWindow({
                id: me.id,
                title : me.title,
                width : 520,
				height: 500,
                animCollapse:false,
                constrainHeader:true,
				layout : 'fit',
				items:[panel],
				dockedItems : [{
					xtype : 'toolbar',
					dock : 'top',
					items : [condition]
				}]
            });
		
		  }
		  return win;
		  
	 }
});
