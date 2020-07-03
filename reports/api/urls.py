# -*- coding:utf-8 -*-
from django.conf.urls import url
from django.contrib import admin

from .views import (
    LoginRecordListAPIView,
    ReportsFlowListAPIView,
    ReportsBiaowuListAPIView
    # SecondWaterListAPIView,
    # DMAListAPIView,
    # dmabaseinfo,
    # getDmaSelect,
)

app_name='reports-api'
urlpatterns = [
    # # 统计报表 --日志查询
    # url(r'^querylog/?$',views.QuerylogView.as_view(),name='querylog'),
    url(r'^querylogdata/?$',LoginRecordListAPIView.as_view(),name='querylogdata'),
    
    # # 报警报表
    # url(r'^alarm/?$',views.AlarmView.as_view(),name='alarm'),
    
    # # 大用户报表
    # url(r'^biguser/?$',views.BiguserView.as_view(),name='biguser'),
    # url(r'^biguser/biguserdata/?$',views.biguserdata,name='biguserdata'),
    # url(r'^meter/biguserlist/$',views.bigusermeterlist,name='bigusermeterlist'),
    
    # # DMA报表
    # url(r'^dmastatics/?$',views.DmastaticsView.as_view(),name='dmastatics'),
    # url(r'^dmareport/?$',views.dmareport,name='dmareport'),
    # url(r'^wenxinyuan/?$',views.WenxinyuanView.as_view(),name='wenxinyuan'),
    # # 流量报表-->历史数据
    # url(r'^flows/?$',views.FlowsView.as_view(),name='flows'),
    url(r'^historydata/?$',ReportsFlowListAPIView.as_view(),name='stationhistorylist'),
    # url(r'^historydata/export/?$',views.historydataexport,name='historydataexport'),
    # # 水量报表
    # url(r'^waters/?$',views.WatersView.as_view(),name='waters'),
    # # 表务表况
    # url(r'^biaowu/?$',views.BiaowuView.as_view(),name='biaowu'),
    # url(r'^biaowu/biaowudata/?$',views.biaowudata,name='biaowudata'),
    url(r'^meter/list/$',ReportsBiaowuListAPIView.as_view(),name='meterlist'),
   
    # # 车辆报表
    # url(r'^vehicle/?$',views.VehicleView.as_view(),name='vehicle'),
    # # 大数据报表
    # url(r'^bigdata/?$',views.BigdataView.as_view(),name='bigdata'),
    # url(r'^bigdata/bigDataReport/?$',views.bigDataReport,name='bigDataReport'),

]
