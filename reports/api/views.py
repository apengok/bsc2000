# -*- coding:utf-8 -*-
from django.db.models import Q

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.filters import (
        SearchFilter,
        OrderingFilter,
    )
from rest_framework.generics import (
    CreateAPIView,
    DestroyAPIView,
    ListAPIView, 
    UpdateAPIView,
    RetrieveAPIView,
    RetrieveUpdateAPIView
    )

import time

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,

    )

from accounts.models import MyRoles,User,LoginRecord
from core.models import (
    Organization,
    SimCard,
    Meter,
    VConcentrator,
    Station,
    VSecondWater,
    DMABaseinfo,
    DmaStation,
)
from amrs.models import (
    Concentrator,
    Community,
    Bigmeter,
    SecondWater,
    Bigmeter,
    HdbFlowData,
    HdbPressureData,
)
# from .pagination import PostLimitOffsetPagination, PostPageNumberPagination
# from .permissions import IsOwnerOrReadOnly

from .serializers import (
    # PostCreateUpdateSerializer, 
    LoginRecordSerializer, 
    
    ReportsMeterSerializer,
    create_HistoryQuery_serializer,

    )

import logging
import logging.handlers

# logging.getLogger('apscheduler').setLevel(logging.WARNING)

class LoginRecordListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = LoginRecordSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    ordering_fields = ['signin_time']
    ordering = ['-signin_time']

    # permission_classes = [AllowAny]
    # search_fields = ['simcardNumber', 'imei']
    # pagination_class = PostPageNumberPagination #PageNumberPagination

    def get_queryset(self, *args, **kwargs):
        #queryset_list = super(PostListAPIView, self).get_queryset(*args, **kwargs)
        search_user = self.request.GET.get("search_user","")
        
        sTime = self.request.GET.get("startTime") #or '2018-10-31 00:00:00'
        eTime = self.request.GET.get("endTime") #or '2018-11-01 23:59:59'
        
        queryset_list = self.request.user.logrecord_list_queryset(search_user,sTime,eTime)
        
        query = self.request.GET.get("q")
        # if query:
        #     queryset_list = queryset_list.filter(
        #             Q(simcardNumber__icontains=query)|
        #             Q(imei__icontains=query)
        #             ).distinct()
        return queryset_list



class ReportsFlowListAPIView(ListAPIView):
    '''
        统计报表 历史数据查询
    '''
    # queryset = MyRoles.objects.all()
    # serializer_class = ReportsFlowSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    # search_fields = ['simcardNumber', 'imei']
    # pagination_class = PostPageNumberPagination #PageNumberPagination

    def get_serializer_class(self):
        commaddr = self.request.GET.get("commaddr")
        groupType = self.request.GET.get("groupType")

        return create_HistoryQuery_serializer(
            groupType=groupType,
            commaddr=commaddr
        )


    def get_queryset(self, *args, **kwargs):
        #queryset_list = super(PostListAPIView, self).get_queryset(*args, **kwargs)
        # queryset_list = Bigmeter.objects.none()
        t1 =time.time()
        commaddr = self.request.GET.get("commaddr")
        groupType = self.request.GET.get("groupType")
        sTime = self.request.GET.get("startTime") #or '2018-10-31 00:00:00'
        eTime = self.request.GET.get("endTime") #or '2018-11-01 23:59:59' 

        
        if groupType == 'station':
            queryset_list = HdbFlowData.objects.all().filter(commaddr=commaddr,readtime__range=[sTime,eTime])
        else:
            queryset_list = HdbPressureData.objects.all().filter(commaddr=commaddr,readtime__range=[sTime,eTime])
        
        return queryset_list


class ReportsBiaowuListAPIView(ListAPIView):
    '''
        统计报表 历史数据查询
    '''
    # queryset = MyRoles.objects.all()
    serializer_class = ReportsMeterSerializer
    
    def get_queryset(self, *args, **kwargs):
        #queryset_list = super(PostListAPIView, self).get_queryset(*args, **kwargs)
        # queryset_list = Bigmeter.objects.none()
        queryset_list = self.request.user.belongto.meter_list_queryset('')
        
        return queryset_list

@api_view(['GET','POST'])
def test_zxesi_view(request):
    # print(request.data)
    seqNo = request.data.get("seqNo","somerandnumber")
    
    ret = {
        "seqNo":seqNo,
        "res":"0",
        "center_state":"1",
        "device_state":[
            {
                "deviceId":1,
                "deviceName":"设备1",
                "state":0
            },
            {
                "deviceId":2,
                "deviceName":"设备2",
                "state":1
            }
        ] 
    }
   
    return Response(ret)