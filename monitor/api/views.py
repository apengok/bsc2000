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

from accounts.models import MyRoles,User
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
)
# from .pagination import PostLimitOffsetPagination, PostPageNumberPagination
# from .permissions import IsOwnerOrReadOnly

from .serializers import (
    # PostCreateUpdateSerializer, 
    StationListSerializer, 
    BigmeterRTSerializer,
    MapStationSerializer,
    MapSecondWaterSerializer,
    )

import logging
import logging.handlers

# logging.getLogger('apscheduler').setLevel(logging.WARNING)

class BigmeterRTListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = BigmeterRTSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    # ordering_fields = ['fluxreadtime']
    # ordering = ['-fluxreadtime']
    # search_fields = ['simcardNumber', 'imei']
    # pagination_class = PostPageNumberPagination #PageNumberPagination

    def get_queryset(self, *args, **kwargs):
        t1 =time.time()

        groupName = self.request.GET.get("groupName")
        groupType = self.request.GET.get("groupType")
        districtId = self.request.GET.get("districtId")
        selectCommunity = self.request.GET.get("selectCommunity")
        selectBuilding = self.request.GET.get("selectBuilding")
        selectTreeType = self.request.GET.get("selectTreeType")
        simpleQueryParam = self.request.GET.get("simpleQueryParam")

        organ = self.request.user.belongto
        
        if groupName:# and groupType == 'group':
            try:
                organ = Organization.objects.get(uuid=groupName)
            except:
                pass

        pressure_queryset = organ.pressure_list_queryset('')#.filter(amrs_pressure__fluxreadtime__isnull=False)#.order_by('-amrs_pressure__fluxreadtime')
        station_queryset = organ.station_list_queryset('')#.filter(amrs_bigmeter__fluxreadtime__isnull=False)#.order_by('-amrs_bigmeter__fluxreadtime')
        if simpleQueryParam:
            station_queryset = station_queryset.filter(
                    Q(amrs_bigmeter__username__icontains=simpleQueryParam)|
                    Q(amrs_bigmeter__commaddr__icontains=simpleQueryParam)|
                    Q(amrs_bigmeter__serialnumber__icontains=simpleQueryParam)
                    # Q(imei__icontains=query)
                    ).distinct()

            pressure_queryset = pressure_queryset.filter(
                    Q(amrs_pressure__username__icontains=simpleQueryParam)|
                    Q(amrs_pressure__commaddr__icontains=simpleQueryParam)|
                    Q(amrs_pressure__serialnumber__icontains=simpleQueryParam)
                    # Q(imei__icontains=query)
                    ).distinct()
        
        queryset_list = [s.amrs_bigmeter for s in station_queryset]
        queryset_list += [s.amrs_pressure for s in pressure_queryset]

        queryset_list = sorted(queryset_list, key=lambda x: x.fluxreadtime if x.fluxreadtime else '')
        queryset_list = queryset_list[::-1]
        
        print('time elapse:',time.time()-t1)
        
        return queryset_list


@api_view(['GET','POST'])
def getmapstationlist(request):

    groupName = request.GET.get("groupName") or ''
    user = request.user
    organs = user.belongto
    print(organs,type(organs))
    if groupName == '':
        selectedgroup = Organization.objects.filter(cid=organs.cid).values().first()
    else:
        selectedgroup = Organization.objects.filter(cid=groupName).values().first()

    stations = user.belongto.station_list_queryset('') 
    stations = stations.exclude(amrs_bigmeter__lng__isnull=True)

    
    if groupName != "":
        stations = stations.filter(belongto__cid=groupName)

    bigmeter_lists = [s.amrs_bigmeter for s in stations]

    
    serializer_data = MapStationSerializer(bigmeter_lists,many=True).data
    # 一次获取全部所需数据，减少读取数据库耗时
    

    entminfo = {
        "coorType":selectedgroup["coorType"],
        "longitude":selectedgroup["longitude"],
        "latitude":selectedgroup["latitude"],
        "zoomIn":selectedgroup["zoomIn"],
        "islocation":selectedgroup["islocation"],
        "adcode":selectedgroup["adcode"],
        "districtlevel":selectedgroup["districtlevel"],

    }

    result = dict()
    result["success"] = "true"
    result["obj"] = serializer_data
    result["entminfo"] = entminfo

    
    
    return Response(result)


@api_view(['GET','POST'])
def getmapsecondwaterlist(request):
    groupName = request.GET.get("groupName") or ''
    user = request.user
    organs = user.belongto
    print(organs,type(organs))
    if groupName == '':
        selectedgroup = Organization.objects.filter(cid=organs.cid).values().first()
    else:
        selectedgroup = Organization.objects.filter(cid=groupName).values().first()

    stations = user.belongto.secondwater_list_queryset('') 
    stations = stations.exclude(amrs_secondwater__lng__isnull=True)

    
    if groupName != "":
        stations = stations.filter(belongto__cid=groupName)

    bigmeter_lists = [s.amrs_secondwater for s in stations]

    
    serializer_data = MapSecondWaterSerializer(bigmeter_lists,many=True).data
    # 一次获取全部所需数据，减少读取数据库耗时
    

    entminfo = {
        "coorType":selectedgroup["coorType"],
        "longitude":selectedgroup["longitude"],
        "latitude":selectedgroup["latitude"],
        "zoomIn":selectedgroup["zoomIn"],
        "islocation":selectedgroup["islocation"],
        "adcode":selectedgroup["adcode"],
        "districtlevel":selectedgroup["districtlevel"],

    }

    result = dict()
    result["success"] = "true"
    result["obj"] = serializer_data
    result["entminfo"] = entminfo

    
    
    return Response(result)


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