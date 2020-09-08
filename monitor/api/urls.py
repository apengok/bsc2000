# -*- coding:utf-8 -*-
from django.conf.urls import url
from django.contrib import admin

from .views import (
    BigmeterRTListAPIView,
    getmapstationlist,
    getmapsecondwaterlist,
    showinfoStatics,
    getinstanceflow,
    getinstanceflow_data,
    getWatermeterflow,
    getWatermeterflow_data,
    getWatermeterdaily,
    getWatermeterdaily_data,
    getWatermeterMonth,
    getWatermeterMonth_data,
)

app_name='monitor-api'
urlpatterns = [
    # url(r'^user/oranizationtree/$', OrganizationListAPIView.as_view(), name='organlist'),
    # url(r'^create/$', PostCreateAPIView.as_view(), name='create'),
    # url(r'^(?P<slug>[\w-]+)/$', PostDetailAPIView.as_view(), name='detail'),
    # url(r'^(?P<slug>[\w-]+)/edit/$', PostUpdateAPIView.as_view(), name='update'),
    # url(r'^(?P<slug>[\w-]+)/delete/$', PostDeleteAPIView.as_view(), name='delete'),
    url(r'^station/list/$', BigmeterRTListAPIView.as_view(), name='stationlist'),
    url(r'^getmapstationlist/$',getmapstationlist,name='getmapstationlist'),
    url(r'^getmapsecondwaterlist/$',getmapsecondwaterlist,name='getmapsecondwaterlist'),

    # 
    url(r'^realtimedata/getinstanceflow/$',getinstanceflow,name='getinstanceflow'),
    url(r'^realtimedata/getinstanceflow_data/$',getinstanceflow_data,name='getinstanceflow_data'),
    url(r'^realtimedata/showinfoStatics/$',showinfoStatics,name='showinfoStatics'),
    url(r'^realtimedata/getWatermeterflow/$',getWatermeterflow,name='getWatermeterflow'),
    url(r'^realtimedata/getWatermeterflow_data/$',getWatermeterflow_data,name='getWatermeterflow_data'),
    url(r'^realtimedata/getWatermeterdaily/$',getWatermeterdaily,name='getWatermeterdaily'),
    url(r'^realtimedata/getWatermeterdaily_data/$',getWatermeterdaily_data,name='getWatermeterdaily_data'),
    url(r'^realtimedata/getWatermeterMonth/$',getWatermeterMonth,name='getWatermeterMonth'),
    url(r'^realtimedata/getWatermeterMonth_data/$',getWatermeterMonth_data,name='getWatermeterMonth_data'),

    # url(r'^dma/getDmaSelect/$', getDmaSelect, name='dmaselect'),
    # url(r'^dma/list/$', DMAListAPIView.as_view(), name='dmalist'),
    # url(r'^district/dmabaseinfo/$', dmabaseinfo, name='dmabaseinfo'),

    # url(r'^community/list/$', CommunityListAPIView.as_view(), name='communitylist'),

    # url(r'^secondwater/list/$', SecondWaterListAPIView.as_view(), name='secondwaterlist'),

]
