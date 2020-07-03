# -*- coding:utf-8 -*-
from django.conf.urls import url
from django.contrib import admin

from .views import (
    WatermeterListAPIView,
    WQListAPIView,
    WAlarmListAPIView,
    showinfoStatics,
    getWatermeterMonth,
    getWatermeterdaily,
    neiborhooddailydata,
    neiborhoodmonthdata,
    getconcentratormaplist,
    getWatermeterflow,
    getWatermeterflow_data,
    getWatermeterdaily_data,
    getWatermeterMonth_data,
    readpercent,
    WStasticsListAPIView,
    wholedatastastics,
    funcdatastastics,
)

app_name='devm-api'
urlpatterns = [
    # url(r'^user/oranizationtree/$', OrganizationListAPIView.as_view(), name='organlist'),
    # url(r'^create/$', PostCreateAPIView.as_view(), name='create'),
    # url(r'^(?P<slug>[\w-]+)/$', PostDetailAPIView.as_view(), name='detail'),
    # url(r'^(?P<slug>[\w-]+)/edit/$', PostUpdateAPIView.as_view(), name='update'),
    # url(r'^(?P<slug>[\w-]+)/delete/$', PostDeleteAPIView.as_view(), name='delete'),

    url(r'^watermeter/list/$', WatermeterListAPIView.as_view(), name='watermeterlist'),

    # 超收率
    url(r'^watermeter/readpercent/$', readpercent, name='readpercent'),
    url(r'^watermeter/comunitiquery/$', WQListAPIView.as_view(), name='comunitiquery'),
    url(r'^watermeter/comunitiwateralarm/$', WAlarmListAPIView.as_view(), name='comunitiwateralarm'),
    url(r'^watermeter/showinfoStatics/',showinfoStatics,name='showinfoStatics'),
    url(r'^watermeter/getWatermeterflow/',getWatermeterflow,name='getWatermeterflow'),
    url(r'^watermeter/getWatermeterflow_data/',getWatermeterflow_data,name='getWatermeterflow_data'),
    url(r'^watermeter/getWatermeterdaily/',getWatermeterdaily,name='getWatermeterdaily'),
    url(r'^watermeter/getWatermeterdaily_data/',getWatermeterdaily_data,name='getWatermeterdaily_data'),
    url(r'^watermeter/getWatermeterMonth/',getWatermeterMonth,name='getWatermeterMonth'),
    url(r'^watermeter/getWatermeterMonth_data/',getWatermeterMonth_data,name='getWatermeterMonth_data'),
    # url(r'^community/list/$', CommunityListAPIView.as_view(), name='communitylist'),
    url(r'^neiborhooddailydata/?$', neiborhooddailydata, name='neiborhooddailydata'),#
    url(r'^neiborhoodmonthdata/?$', neiborhoodmonthdata, name='neiborhoodmonthdata'),#

    # url(r'^concentratormap/?$',views.ConcentratorMapView.as_view(),name='concentratormap'),
    url(r'^getconcentratormaplist/?$',getconcentratormaplist,name='getconcentratormaplist'),
    # url(r'^contentratordatastastic/?$',views.ContentratorDataStasticView.as_view(),name='contentratordatastastic'),
    url(r'^datastastics/?$',WStasticsListAPIView.as_view(),name="datastastics"),
    url(r'^wholedatastastics/?$',wholedatastastics,name="wholedatastastics"),
    url(r'^funcdatastastics/?$',funcdatastastics,name="funcdatastastics"),


]
