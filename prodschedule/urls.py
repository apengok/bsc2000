# -*- coding: utf-8 -*-

from django.conf.urls import url
from . import views
from django.views.generic import TemplateView

from . import views

app_name = 'prodschedule'
urlpatterns = [
    
    url(r'^$', TemplateView.as_view(template_name='prodschedule/factoryview.html')),

    

    # 生产调度 --厂区总览
    url(r'^factoryview/?$',views.FactoryviewView.as_view(),name='factoryview'),
    
    # 水力模型
    url(r'^hydromodel/?$',views.HydromodelView.as_view(),name='hydromodel'),
    
    
        
]