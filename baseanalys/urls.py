# -*- coding: utf-8 -*-

from django.conf.urls import url
from . import views
from django.views.generic import TemplateView

from . import views

app_name = 'baseanalys'
urlpatterns = [
    
    url(r'^$', TemplateView.as_view(template_name='baseanalys/dmaba.html')),

    

    # 基准分析 --DMA基准
    url(r'^dmaba/?$',views.DmabaView.as_view(),name='dmaba'),
    
    # MNF基准
    url(r'^mnfba/?$',views.MnfbaView.as_view(),name='mnfba'),

    # 日用水基准
    url(r'^dayuseba/?$',views.DayusebaView.as_view(),name='dayuseba'),

    
    
        
]