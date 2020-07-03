Ext.define('Ext.ux.my.Window', {
	
	constructor: function () {
		
    },
	
	createWindow: function(config, cls) {
        var me = this, win, cfg = Ext.applyIf(config || {}, {
                stateful: false,
                isWindow: true,
                constrainHeader: true,
				collapsible: true,
				closable: true,
				animCollapse: true,
				collapseDirection : 'top'
            });

        cls = cls || Ext.window.Window;
        win = new cls(cfg);
		
		win.on({
            minimize: me.minimizeWindow,
            destroy: me.onWindowClose,
            scope: me
        });
		
		
		win.on({
            boxready: function () {
                win.dd.xTickSize = me.xTickSize;
                win.dd.yTickSize = me.yTickSize;

                if (win.resizer) {
                    win.resizer.widthIncrement = me.xTickSize;
                    win.resizer.heightIncrement = me.yTickSize;
                }
            },
            single: true
        });

        win.doClose = function ()  {
            win.doClose = Ext.emptyFn;
            win.el.disableShadow();
            win.el.fadeOut({
                listeners: {
                    afteranimate: function () {
						/*
						var tTool = map.getCurrentTool();
						if(tTool && tTool.interaction) {
							if(tTool.getFeature()) {
							  tTool.interaction.source_.removeFeature(tTool.getFeature());
							}
							tTool.interaction.setActive(false);
						}
						map.pTool_ = null;
						*/
						windowClose();
                        win.destroy();
                    }
                }
            });
        };
        return win;
    },
	
	minimizeWindow: function(win) {
        win.minimized = true;
        win.hide();
    },
	
	onWindowClose: function(win) {
        var me = this;
    }
});