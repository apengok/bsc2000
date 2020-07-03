# -*- coding: utf-8 -*-

from django.conf.urls import url
from . import views
from django.views.generic import TemplateView

from . import views

app_name = 'alarm'
urlpatterns = [
    
    url(r'^$', TemplateView.as_view(template_name='alarm/stationalarm.html')),

    

    # 报警中心 --站点报警设置
    url(r'^stationalarm/?$',views.StationalarmView.as_view(),name='stationalarm'),
    
    # DMA报警设置
    url(r'^dmaalarm/?$',views.DmaalarmView.as_view(),name='dmaalarm'),
    
    # 报警查询
    url(r'^queryalarm/?$',views.QueryalarmView.as_view(),name='queryalarm'),
    
    
        
]