from django.conf.urls import url, include
from rest_framework import routers
from api.entm.users.views import UserViewSet

from django.conf.urls import url
from django.contrib import admin

from .views import (
    OrganizationListAPIView,
    OrganizationDetailAPIView,
    MyRoleListAPIView,
    UserListAPIView,
    SimCardListAPIView,
    MeterListAPIView,
    StationListAPIView,
    StationDetailAPIView,
    VConcentratorListAPIView,
    VCommunityListAPIView,
    VPressureListAPIView,
    VPressureDetailAPIView,
    VSecondwaterListAPIView,
    VWatermeterListAPIView,
    VWatermeterDetailAPIView,
    WaterUserTypeListAPIView,
    MetercommListAPIView,
    MeterParameterListAPIView,
    MeterprotocolListAPIView,
    PersonalizedListAPIView,
)



router = routers.DefaultRouter()
router.register(r'users', UserViewSet)

app_name='api'
urlpatterns = [
    url(r'^', include(router.urls)),
    # url(r'^auth/', include('rest_auth.urls')),

    url(r'^personlized/list/$', PersonalizedListAPIView.as_view(), name='personlized'),
    url(r'^organizations/list/$', OrganizationListAPIView.as_view(), name='organlist'),
    url(r'^organizations/list/(?P<pk>\d+)/$', OrganizationDetailAPIView.as_view(), name='detail'),
    url(r'^role/list/$', MyRoleListAPIView.as_view(), name='myrolelist'),
    url(r'^user/list/$', UserListAPIView.as_view(), name='userlist'),
    url(r'^simcard/list/$', SimCardListAPIView.as_view(), name='simcardlist'),
    url(r'^meter/list/$', MeterListAPIView.as_view(), name='meterlist'),
    url(r'^station/list/$', StationListAPIView.as_view(), name='stationlist'),
    url(r'^station/list/(?P<pk>\d+)/$', StationDetailAPIView.as_view(), name='stationdetail'),
    url(r'^concentrator/list/$', VConcentratorListAPIView.as_view(), name='concentratorlist'),
    url(r'^community/list/$', VCommunityListAPIView.as_view(), name='communitylist'),
    url(r'^pressure/list/$', VPressureListAPIView.as_view(), name='pressurelist'),
    url(r'^pressure/list/(?P<pk>\d+)/$', VPressureDetailAPIView.as_view(), name='pressuredetail'),
    url(r'^secondwater/list/$', VSecondwaterListAPIView.as_view(), name='secondwaterlist'),
    url(r'^watermeter/list/$', VWatermeterListAPIView.as_view(), name='watermeterlist'),
    url(r'^watermeter/list/(?P<pk>\d+)/$', VWatermeterDetailAPIView.as_view(), name='watermeterdetail'),
    url(r'^waterusertype/list/$', WaterUserTypeListAPIView.as_view(), name='waterusertypelist'),

    url(r'^metercomm/list/$', MetercommListAPIView.as_view(), name='metercommlist'),
    url(r'^meterparameter/list/$', MeterParameterListAPIView.as_view(), name='meterparameterlist'),
    url(r'^meterprotocol/list/$', MeterprotocolListAPIView.as_view(), name='meterprotocollist'),
]