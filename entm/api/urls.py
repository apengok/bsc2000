# -*- coding:utf-8 -*-
from django.conf.urls import url
from django.contrib import admin

from .views import (
    OrganizationListAPIView,
    MyRoleListAPIView,
    UserListAPIView,
    oranizationtree,
    # PostCreateAPIView,
    # PostDeleteAPIView,
    # PostDetailAPIView,
    # PostUpdateAPIView,
    )

app_name='entm-api'
urlpatterns = [
    url(r'^user/oranizationtree/$', OrganizationListAPIView.as_view(), name='organlist'),
    url(r'^organization/tree',oranizationtree,name='oranizationtree'),
    # url(r'^create/$', PostCreateAPIView.as_view(), name='create'),
    # url(r'^(?P<slug>[\w-]+)/$', PostDetailAPIView.as_view(), name='detail'),
    # url(r'^(?P<slug>[\w-]+)/edit/$', PostUpdateAPIView.as_view(), name='update'),
    # url(r'^(?P<slug>[\w-]+)/delete/$', PostDeleteAPIView.as_view(), name='delete'),

    url(r'^role/list/$', MyRoleListAPIView.as_view(), name='rolelist'),

    url(r'^user/list/$', UserListAPIView.as_view(), name='userlist'),
]
