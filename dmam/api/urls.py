# -*- coding:utf-8 -*-
from django.conf.urls import url
from django.contrib import admin

from .views import (
    StationListAPIView,
    CommunityListAPIView,
    SecondWaterListAPIView,
    DMAListAPIView,
    dmabaseinfo,
    getDmaSelect,
)

app_name='devm-api'
urlpatterns = [
    # url(r'^user/oranizationtree/$', OrganizationListAPIView.as_view(), name='organlist'),
    # url(r'^create/$', PostCreateAPIView.as_view(), name='create'),
    # url(r'^(?P<slug>[\w-]+)/$', PostDetailAPIView.as_view(), name='detail'),
    # url(r'^(?P<slug>[\w-]+)/edit/$', PostUpdateAPIView.as_view(), name='update'),
    # url(r'^(?P<slug>[\w-]+)/delete/$', PostDeleteAPIView.as_view(), name='delete'),
    url(r'^stations/list/$', StationListAPIView.as_view(), name='stationlist'),

    url(r'^dma/getDmaSelect/$', getDmaSelect, name='dmaselect'),
    url(r'^dma/list/$', DMAListAPIView.as_view(), name='dmalist'),
    url(r'^district/dmabaseinfo/$', dmabaseinfo, name='dmabaseinfo'),

    url(r'^community/list/$', CommunityListAPIView.as_view(), name='communitylist'),

    url(r'^secondwater/list/$', SecondWaterListAPIView.as_view(), name='secondwaterlist'),

]
