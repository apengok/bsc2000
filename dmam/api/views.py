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
    SecondWater
)
# from .pagination import PostLimitOffsetPagination, PostPageNumberPagination
# from .permissions import IsOwnerOrReadOnly

from .serializers import (
    # PostCreateUpdateSerializer, 
    StationListSerializer, 
    CommunityListSerializer,
    SecondWaterListSerializer,
    DMASerializer,
    DmaSelectSerializer,
    )


class DMAListAPIView(ListAPIView):
    queryset = DMABaseinfo.objects.all()
    serializer_class = DMASerializer

@api_view(['GET',])
def dmabaseinfo(request):
    data = []
    ret = {
                "exceptionDetailMsg":"null",
                "msg":None,
                # "obj":{
                #         "baseinfo":,
                #         "dmastationlist":data
                # },
                "success":True
            }
    dma_no = request.GET.get("dma_no") or ''
    if dma_no == '':
        return Response(ret)

    dmabase = DMABaseinfo.objects.get(dma_no=dma_no)
    dma_serializer = DMASerializer(dmabase)
    ret["obj"] = dma_serializer.data

    return Response(ret)
    



class StationListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = StationListSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    # search_fields = ['simcardNumber', 'imei']
    # pagination_class = PostPageNumberPagination #PageNumberPagination

    def get_queryset(self, *args, **kwargs):
        
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
                organ = Organization.objects.get(cid=groupName)
            except:
                pass

        queryset_list = organ.station_list_queryset('')
        # queryset_list = queryset_list.exclude(rid__isnull=True)
        # queryset_list.exclude(pId__exact='')
        if simpleQueryParam:
            queryset_list = queryset_list.filter(
                    Q(amrs_bigmeter__username__icontains=simpleQueryParam)|
                    Q(amrs_bigmeter__commaddr__icontains=simpleQueryParam)|
                    Q(meter__serialnumber__icontains=simpleQueryParam)
                    ).distinct()

        return queryset_list



class CommunityListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = CommunityListSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    # search_fields = ['simcardNumber', 'imei']
    # pagination_class = PostPageNumberPagination #PageNumberPagination

    def get_queryset(self, *args, **kwargs):
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
                organ = Organization.objects.get(cid=groupName)
            except:
                pass

        queryset_list = organ.community_list_queryset('')
        # queryset_list = queryset_list.exclude(rid__isnull=True)
        # queryset_list.exclude(pId__exact='')
        if simpleQueryParam:
            queryset_list = queryset_list.filter(
                    Q(amrs_community__name__icontains=simpleQueryParam)
                    ).distinct()

        community_queryset_list = [s.amrs_community for s in queryset_list]

        return community_queryset_list



class SecondWaterListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = SecondWaterListSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    # search_fields = ['simcardNumber', 'imei']
    # pagination_class = PostPageNumberPagination #PageNumberPagination

    def get_queryset(self, *args, **kwargs):
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
                organ = Organization.objects.get(cid=groupName)
            except:
                pass

        queryset_list = organ.secondwater_list_queryset('')
        # queryset_list = queryset_list.exclude(rid__isnull=True)
        # queryset_list.exclude(pId__exact='')
        # if simpleQueryParam:
        #     queryset_list = queryset_list.filter(
        #             Q(amrs_secondwater__name__icontains=simpleQueryParam)
        #             ).distinct()

        secondwater_queryset_list = [s.amrs_secondwater for s in queryset_list]

        return secondwater_queryset_list



@api_view(['GET',])
def getDmaSelect(request):
    organ = request.POST.get("organ") or None


    # print("getDmaSelect organ",organ)
    
    if organ is None or organ == '':
        dma_lists = request.user.belongto.dma_list_queryset()
    else:
        organ_select = Organization.objects.get(uuid=organ)
        dma_lists = organ_select.dma_list_queryset()

    data = DmaSelectSerializer(dma_lists,many=True).data

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":data,
        "success":True
    }
   
    return Response(operarions_list)

@api_view(['GET','POST'])
def getCurrentAlarm(request):
    print(request.data)
    seqNo = request.data.get("seqNo","somerandnumber")
    
    ret = {
        "seqNo":seqNo,
        "res":"0",
        "rows":[
            {
                "stationId":"1",
                "devId":1,
                "alarmCode":"1",
                "alarmName":"媒体播放失败",
                "alarmLevel":"1",
                "firstCreateTime":"2019.07.05 14:00:00",
                "alarmCount":"2",
                "lastCreateTime":"2019.07.05 15:00:00",
            },
            {
                "stationId":"1",
                "devId":"3",
                "alarmCode":"1",
                "alarmName":"媒体播放失败",
                "alarmLevel":"1",
                "firstCreateTime":"2019.07.05 14:00:00",
                "alarmCount":"2",
                "lastCreateTime":"2019.07.05 15:00:00",
            },
            {
                "stationId":"1",
                "devId":1,
                "alarmCode":"20001",
                "alarmName":"媒体播放失败",
                "alarmLevel":"1",
                "firstCreateTime":"2019.07.05 14:00:00",
                "alarmCount":"2",
                "lastCreateTime":"2019.07.05 15:00:00",
            }
        ],
        "total":"3" 
    }
   
    return Response(ret,content_type="application/json;charset=gb2312")

@api_view(['GET','POST'])
def test_zxesi_view(request):
    print(request.data)
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
   
    return Response(ret,content_type="application/json;charset=gb2312")