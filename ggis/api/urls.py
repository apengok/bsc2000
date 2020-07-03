# -*- coding:utf-8 -*-
from django.conf.urls import url
from django.contrib import admin

from .views import (
    FenceDistrictListAPIView,
    FenceDistrictCreateAPIView,
    FenceDetailAPIView,
    fencetree,
    fenceselected,
    fencepreview,
    fenceupdate,
    fencedelete,
    getdmageojson,
    getFenceDetails,
)

app_name='ggis-api'
urlpatterns = [
    # url(r'^user/oranizationtree/$', OrganizationListAPIView.as_view(), name='organlist'),
    # url(r'^create/$', PostCreateAPIView.as_view(), name='create'),
    # url(r'^(?P<slug>[\w-]+)/$', PostDetailAPIView.as_view(), name='detail'),
    url(r'^fence/list/(?P<cid>[\w-]+)/$', FenceDetailAPIView.as_view(), name='fence-update'),
    # url(r'^fence/delete/(?P<cid>[\w-]+)/$', FenceDeleteAPIView.as_view(), name='fence-delete'),
    url(r'^fence/list/$', FenceDistrictListAPIView.as_view(), name='fencelist'),

    # url(r'^dma/list/$', DMAListAPIView.as_view(), name='dmalist'),
    url(r'^fence/tree/$', fencetree, name='fencetree'),
    url(r'^fence/selected/$', fenceselected, name='fenceselected'),
    url(r'^fence/preview/$', fencepreview, name='fencepreview'),
    url(r'^fence/update/$', fenceupdate, name='fenceupdate'),
    url(r'^fence/delete/$', fencedelete, name='fencedelete'),
    url(r'^getdmageojson/$', getdmageojson, name='getdmageojson'),
    url(r'^getFenceDetails/$', getFenceDetails, name='getFenceDetails'),

    url(r'^fence/create/$', FenceDistrictCreateAPIView.as_view(), name='fence-create'),

    # url(r'^secondwater/list/$', SecondWaterListAPIView.as_view(), name='secondwaterlist'),

]
