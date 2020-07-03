# -*- coding:utf-8 -*-
from django.conf.urls import url
from django.contrib import admin

from .views import (
    SimCardListAPIView,
    MeterListAPIView,
    VConcentratorListAPIView,
    VPressureListAPIView,
    getConcentratorSelect,
    getCommunitySelect,
    getSimcardSelect,
    getIMEISelect,
    MeterParameterListAPIView,
    getCommandParam,
    getpressureSelect,
    getMeterSelect,
)

app_name='devm-api'
urlpatterns = [
    # url(r'^user/oranizationtree/$', OrganizationListAPIView.as_view(), name='organlist'),
    # url(r'^create/$', PostCreateAPIView.as_view(), name='create'),
    # url(r'^(?P<slug>[\w-]+)/$', PostDetailAPIView.as_view(), name='detail'),
    # url(r'^(?P<slug>[\w-]+)/edit/$', PostUpdateAPIView.as_view(), name='update'),
    # url(r'^(?P<slug>[\w-]+)/delete/$', PostDeleteAPIView.as_view(), name='delete'),

    url(r'^simcard/list/$', SimCardListAPIView.as_view(), name='simcardlist'),

    url(r'^meter/list/$', MeterListAPIView.as_view(), name='meterlist'),

    url(r'^concentrator/list/$', VConcentratorListAPIView.as_view(), name='concentratorlist'),


    url(r'^pressure/list/$', VPressureListAPIView.as_view(), name='pressurelist'),
    url(r'^pressure/getpressureSelect',getpressureSelect,name='getpressureSelect'),

    url(r'^concentrator/getConcentratorSelect',getConcentratorSelect,name='getConcentratorSelect'),
    url(r'^community/getCommunitySelect',getCommunitySelect,name='getConcentratorSelect'),
    url(r'^simcard/getSimcardSelect',getSimcardSelect,name='getSimcardSelect'),
    url(r'^simcard/getIMEISelect',getIMEISelect,name='getConcentratorSelect'),
    url(r'^meter/getMeterSelect',getMeterSelect,name='getMeterSelect'),

    # 参数指令
    # url(r'^paramsmanager/?$', views.ParamsMangerView.as_view(), name='paramsmanager'),
    url(r'^paramsmanager/command/list/?$', MeterParameterListAPIView.as_view(), name='commandlist'),
    # url(r'^paramsmanager/command/saveCommand/?$', views.saveCommand, name='saveCommand'),
    # url(r'^paramsmanager/command/getCommandTypes/?$', views.getCommandTypes, name='getCommandTypes'),
    url(r'^paramsmanager/command/getCommandParam/?$', getCommandParam, name='getCommandParam'),
    # url(r'^paramsmanager/command/getReferCommand/?$', views.getReferCommand, name='getReferCommand'),

]
