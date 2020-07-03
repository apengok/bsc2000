# -*- coding:utf-8 -*-
from django.conf.urls import url
from django.contrib import admin

from .views import (
    flowdata_dailyuse,
    flowdata_monthuse,
    flowdata_mnf,
    flowdata_analys,
)

app_name='analysis-api'
urlpatterns = [
    # # 数据分析 -- 夜间最小流量
    # url(r'^mnf/?$',views.MnfView2.as_view(),name='mnf'),
    # url(r'^mnf2/?$',views.MnfView.as_view(),name='mnf2'),

    url(r'flowdata_mnf/?$',flowdata_mnf,name='flowdata_mnf'),

    # # 产销差分析
    # url(r'^cxc/?$',views.CXCView.as_view(),name='cxc'),
    # url(r'^dmacxc/?$',views.CXCView2.as_view(),name='dmacxc'),
    # url(r'flowdata_cxc/?$',views.flowdata_cxc,name='flowdata_cxc'),
    # url(r'flowdata_wxy/?$',views.flowdata_wxy,name='flowdata_wxy'),
    # # url(r'analysisCxc/dmastations//?$',views.dmastations,name='dmastations'),

    # # 日用水分析
    # url(r'^dailyuse/?$',views.DailyUseView.as_view(),name='dailyuse'),
    url(r'flowdata_dailyuse/?$',flowdata_dailyuse,name='flowdata_dailyuse'),
    # url(r'flowdata_dailyuse_compare/?$',views.flowdata_dailyuse_compare,name='flowdata_dailyuse_compare'),
    # url(r'flowdata_queryday/?$',views.flowdata_queryday,name='flowdata_queryday'),
    
    # # 月用水分析
    # url(r'^monthuse/?$',views.MonthUseView.as_view(),name='monthuse'),
    url(r'flowdata_monthuse/?$',flowdata_monthuse,name='flowdata_monthuse'),
        
    # url(r'^historydata/?$',views.HistoryDataView.as_view(),name='historydata'),
    # url(r'historydata/list/?$',views.historydatalist,name='historydatalist'),


    # # 流量分析
    url(r'^flowdata_analys/?$',flowdata_analys,name='flowdata_analys'),

    # # 对比分析
    # url(r'^comparenalys/?$',views.ComparenalysView.as_view(),name='comparenalys'),

    # # 配表分析
    # url(r'^peibiao/?$',views.PeibiaoView.as_view(),name='peibiao'),

]
