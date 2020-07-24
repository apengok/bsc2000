# -*- coding: utf-8 -*-

from django.conf.urls import url
from . import views
from django.views.generic import TemplateView

from . import views

app_name = 'monitor'
urlpatterns = [
    
    url(r'^$', TemplateView.as_view(template_name='monitor/mapmonitor.html'),name='monitor_home'),

    # 站点地图
    url(r'^mapstation/?$',views.MapStationView.as_view(),name='mapstation'),
    url(r'^getmapstationlist/$',views.getmapstationlist,name='getmapstationlist'),
    
    # 实时曲线
    url(r'^realcurlv/?$',views.RealcurlvView.as_view(),name='realcurlv'),

    # 实时数据
    url(r'^realtimedata/?$',views.RealTimeDataView.as_view(),name='realtimedata'),
    url(r'^realtimedata/export/?$',views.exportbyselect,name='exportbyselect'),
    url(r'^rtdata/showalarm/(?P<pk>[0-9]+)/$',views.RtdataAmarm.as_view(),name='rtalarm'),

    # 车辆监控
    url(r'^vehicle/?$',views.VehicleView.as_view(),name='vehicle'),
    # 实时视频
    url(r'^vedio/?$',views.VedioView.as_view(),name='vedio'),
    # 二次供水 
    url(r'^secondwater/?$',views.SecondwaterView.as_view(),name='secondwater'),
    url(r'^getmapsecondwaterlist/$',views.getmapsecondwaterlist,name='getmapsecondwaterlist'),
    
    # 数据监控 --地图监控
    url(r'^mapmonitor2/?$',views.MapMonitorView.as_view(),name='mapmonitor2'),
    url(r'^mapmonitor/?$',views.MapMonitorView2.as_view(),name='mapmonitor'),
    url(r'^maprealdata/?$',views.maprealdata,name='maprealdata'),
    
    
    url(r'^station/list/?$',views.stationlist,name='stationlist'),
        
]