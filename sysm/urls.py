# -*- coding: utf-8 -*-

from django.conf.urls import url
from . import views
from django.views.generic import TemplateView

from . import views

app_name = 'sysm'
urlpatterns = [
    
    url(r'^$', TemplateView.as_view(template_name='sysm/personalizedList.html'),name='sysm_home'),

    url(r'^bigscreen/?$',views.BigScreenView.as_view(),name='bigscreen'),
    

    # 系统管理 --平台个性化配置
    url(r'^personalized/list/?$',views.personalizedView.as_view(),name='personalizedList'),
    
    
    url(r'^personalized/logoPagesPhoto/update/?$',views.logoPagesPhotoUpdate,name='logoPagesPhotoUpdate'),
    
    url(r'^personalized/update/?$',views.personalizedUpdate,name='personalizedUpdate'),
    url(r'^personalized/upload_img/?$',views.personalizedUpdate_img,name='personalizedUpdate_img'),
    url(r'^personalized/upload_ico/?$',views.personalizedUpdate_ico,name='personalizedUpdate_ico'),
    url(r'^personalized/find/?$',views.personalizedFind,name='personalizedFind'),
    url(r'^personalized/default/?$',views.personalizedDefault,name='personalizedDefault'),

    # 通讯管理
    url(r'^commconfig/?$',views.CommConfigView.as_view(),name='commlist'),
    url(r'^commconfig/list/?$',views.getmetercommlist,name='getmetercommlist'),
    url(r'^commconfig/add/?$',views.CommConfigAddView.as_view(),name='mcadd'),
    url(r'^commconfig/edit/(?P<pk>\w+)/?$',views.CommConfigEditView.as_view(),name='mcedit'),
    url(r'^commconfig/delete/(?P<pk>\w+)/?$',views.CommConfigDeleteView.as_view(),name='mcdelete'),
    url(r'^commconfig/getProtocolSelect/?$',views.getProtocolSelect,name='getProtocolSelect'),

    # 系统设置
    url(r'^system/?$',views.SystemView.as_view(),name='system'),
    # 转发设置
    url(r'^retransit/?$',views.RetransitView.as_view(),name='retransit'),
    # 图标配置
    url(r'^iconscfg/?$',views.IconscfgView.as_view(),name='iconscfg'),
        
]