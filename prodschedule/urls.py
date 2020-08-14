# -*- coding: utf-8 -*-

from django.conf.urls import url
from . import views
from django.views.generic import TemplateView

from . import views

app_name = 'prodschedule'
urlpatterns = [
    
    url(r'^$', TemplateView.as_view(template_name='prodschedule/alloverview.html')),

    url(r'^alloverview/?$',views.AllOverviewView.as_view(),name='alloverview'),
    url(r'^wwmonitor/?$',views.WwmonitorView.as_view(),name='wwmonitor'),
    url(r'^pumpersee/?$',views.PumperSeeView.as_view(),name='pumpersee'),
    url(r'^deepwell/?$',views.DeepWellView.as_view(),name='deepwell'),
    url(r'^electrosys/?$',views.ElectroSysView.as_view(),name='electrosys'),
    url(r'^realtimevideo/?$',views.RealtimeVideoView.as_view(),name='realtimevideo'),
    url(r'^warningcheck/?$',views.WarningCheckView.as_view(),name='warningcheck'),
    url(r'^historydata/?$',views.HistoryDataView.as_view(),name='historydata'),
    url(r'^generalreport/?$',views.GeneralReportView.as_view(),name='generalreport'),
    

    # 生产调度 --厂区总览
    url(r'^factoryview/?$',views.FactoryviewView.as_view(),name='factoryview'),
    
    # 水力模型
    url(r'^hydromodel/?$',views.HydromodelView.as_view(),name='hydromodel'),
    
    
        
]