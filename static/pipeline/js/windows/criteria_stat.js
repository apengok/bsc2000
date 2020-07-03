/*
 * 条件统计
 */
  
Ext.define('Ext.ux.Windows.CiteriaStat', {
	 id: 'citeriaStat',
	 title: '条件统计',
	 createWindow: function() {
		  var me = this;
		  var win = Ext.get('citeriaStat');
		  if(!win) {
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
				 store: new Ext.data.SimpleStore({
					fields: ['layerName', 'value'],
					data : [
					     ['管线层','ws_pipe'],
						 ['阀门层','ws_valve'],
						 ['排污阀层','ws_drain_valve'],
						 ['排气阀层','ws_vent_valve'],
						 ['阀门井层','ws_valve_well'],
						 ['水表井层','ws_watermeter_basin']
					]
				 })
             });
			 layers.setValue("ws_pipe");
			 
			 layers.on('select', function(){
				 
								 
							var pipe_line_data = [['编    号','industry_code','0'],
												  ['管线长度','length','1'],
												  ['管    材','material','0'],
								                  ['埋设方式','burying','0'],
								                  ['起点埋深','start_depth','1'],
								                  ['终点埋深','start_depth','1'],
								                  ['起点高程','start_altitude','1'],
								                  ['终点高程','end_altitude','1'],
								                  ['口径','caliber','1'],
								                  ['所在区域','area','0'],
								                  ['所在道路','road','0']
												];
							var point_point_data = [['编   号','industry_code','0'],
												   ['埋设方式','burying','0'],
			                                       ['高程','altitude','1'],
									               ['埋深','depth','1'],
									               ['口径','caliber','1'],
									               ['材质','material','0'],
									               ['所在区域','area','0'],
									               ['所在道路','road','0']
												];
							if(this.getValue() =='ws_pipe')
								 Ext.getCmp('fields').getStore().loadData(pipe_line_data, false);
							else 
							     Ext.getCmp('fields').getStore().loadData(point_point_data, false);
							
												
				 
			 });
             //'0' 字符串 1 double
			 var fields_store = new Ext.data.SimpleStore({
					fields: ['name', 'value','type'],
					data : [['编    号','industry_code','0'],
												  ['管线长度','length','1'],
												  ['管    材','material','0'],
								                  ['埋设方式','burying','0'],
								                  ['起点埋深','start_depth','1'],
								                  ['终点埋深','start_depth','1'],
								                  ['起点高程','start_altitude','1'],
								                  ['终点高程','end_altitude','1'],
								                  ['口径','caliber','1'],
								                  ['所在区域','area','0'],
								                  ['所在道路','road','0']]
			 });
			 
			 var fields = new Ext.form.ComboBox({
				 id: 'fields',
                 fieldLabel: '字段:',
                 displayField: 'name',
                 valueField: 'value',
                 triggerAction: 'all',
                 emptyText: '请选择...',
                 allowBlank: false,
                 blankText: '请选择...',
                 editable: false,
                 mode: 'local',
				 store: fields_store
             });
			 fields.setValue("编    号");
			 var ops = new Ext.form.ComboBox({
				 id:'ops',
                 fieldLabel: '符号:',
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
					     ['like','like'],
						 ['>','>'],
						 ['=','='],
						 ['<','<'],
						 ['!=','!='],
					]
				 })
             });
			 
			 ops.setValue("like");

			 var txtValue = new Ext.form.TextField({
				 fieldLabel : "联值:",
				 emptyText: '请输入...'
			 });
			 
			 var radiogroup = new Ext.form.RadioGroup({
                 fieldLabel: '运算符:',
				 width: 350,
                 items: [{
                     name: 'op',
                     inputValue: '0',
                     boxLabel: 'or',
                     checked: true
                 }, {
                     name: 'op',
                     inputValue: '1',
                     boxLabel: 'and'
                 }]
             });
			 
			 var criteria_panel = new Ext.Panel({
				height: 180,
				layout : "form",
				items : [layers,fields,ops,txtValue,radiogroup]
			 });
			 
			 //记录条件
			 var criteria_array_label = new Array();
			 //
			 var criteria_array_value = new Array();
			 var criteria_panel1 = new Ext.Panel({
				flex: 0.5,
				border:0,
				height: 180,
				layout: {  
					type: 'vbox',  
					align: 'middle',  
					pack: 'center'					
				},
				items: [{
					xtype: "button",
					text: "添加->",
                    margin: '0 0 10 0',
					handler: function() {
						var value = txtValue.getValue();
						if(value == "") {
							Ext.MessageBox.alert("提示","联值不能为空！！！");
							return;
						}
						
						var fieldName = fields.getRawValue();
						var fieldValue = fields.getStore().findRecord('name',fieldName).data.value;
						var type = fields.getStore().findRecord('name',fieldName).data.type;
						
						var type = fields.getStore().findRecord('name',fieldName).data.type;
						var ops = Ext.getCmp('ops').getValue(); 
					    var op = radiogroup.getChecked()[0].boxLabel;
						var queryWhereValue = "";
						var queryWhereText = "";
						if(criteria_array_label.length >= 1){
							queryWhereValue = op + " " + fieldValue + " " + ops;
							queryWhereText = op + " " + fieldName + " " + ops;
							if(type == '0') 
								value = "'" + value + "'";
							queryWhereValue +=" " + value;
							queryWhereText +=" " + value;
						}
						else{
						    queryWhereValue = fieldValue + " " + ops;
							queryWhereText = fieldName + " " + ops;
							if(type == '0') 
								value = "'" + value + "'";
							queryWhereValue +=" " + value;
							queryWhereText +=" " + value;
						}
						criteria_array_label.push(queryWhereText);
						criteria_array_value.push(queryWhereValue);
						criteria_panel2.items.items[0].setValue(criteria_panel2.items.items[0].getValue() + " " + queryWhereText);
					}
				},{
					xtype: "button",
					text: "退回<-",
					handler: function() {
						criteria_array_label.pop();
						criteria_array_value.pop();
						criteria_panel2.items.items[0].setValue("");
						var queryWhereText = "";
						for(var i=0; i<criteria_array_label.length; i++) {
							queryWhereText += criteria_array_label[i];
						}
						criteria_panel2.items.items[0].setValue(queryWhereText);
					}
				}]
			});
			
			var criteria_panel2 = new Ext.Panel({
				flex: 1,
				height: 175,
				border:1,
				layout: 'fit',
				items: [{
                    xtype: "textarea",
					disabled:true
                }]
			});
			
			var main_panel = new Ext.Panel({
				layout : 'hbox',
				width:520,
				flex: 0.6,
				items:[criteria_panel, criteria_panel1, criteria_panel2]
			});
			
	          var tTool = null;
			  var panel1 = Ext.create('Ext.Panel', {
				width : 520,
				flex: 1,
				autoScroll : true,
				html:'<table class="table table-bordered"><thead id="citeria_stat_view"><tr><th>统计图层</th><th>属    性</th><th>属 性 值</th><th>统计结果</th></tbody></table>',
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
							var polygon = '';
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
							var queryWhereValue = '';
							for(var i=0; i<criteria_array_value.length; i++) {
							    queryWhereValue += criteria_array_value[i] + " ";
							}
							Ext.Ajax.request( {
								url : 'citeriaStat',
								method : 'post',
								params : {
									layerName : layers.getValue(),
									layerAliasName: layers.getRawValue(),
									queryWhere: queryWhereValue,
									polygon : polygon
								},
								success : function(response, options) {
									var data = response.responseText
									$('#citeria_stat_view').empty();
									$('#citeria_stat_view').append('<tr><th>统计图层</th><th>属    性</th><th>属 性 值</th><th>统计结果</th>');
									for(var i in language) {
										if(language.hasOwnProperty(i)) { 
										    var regExp = new RegExp(i, "g"); 
											data = data.replace(regExp, language[i]);
										}
									 }
									$('#citeria_stat_view').append(data);
								}
							});
						}
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
				layout : 'vbox',
				resizable:false,
				items:[main_panel, panel1]
			});

		  }
		  return win;
		  
	 }
});