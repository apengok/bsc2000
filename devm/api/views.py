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
    VPressure,
    Station,
)
from amrs.models import (
    Concentrator,
    Community,
    Bigmeter,
    MeterParameter,
)
# from .pagination import PostLimitOffsetPagination, PostPageNumberPagination
# from .permissions import IsOwnerOrReadOnly

from .serializers import (
    # PostCreateUpdateSerializer, 
    SimCardListSerializer, 
    MeterListSerializer,
    VConcentratorListSerializer,
    VConcentratorSelectSerializer,
    CommunitySelectSerializer,
    SimcardSelectSerializer,
    SimcardIEMISelectSerializer,
    VPressureSerializer,
    MeterParameterListSerializer,
    MeterParameterSerializer,
    PressureSelectSerializer,
    MeterSelectSerializer,
    )

class MeterParameterListAPIView(ListAPIView):
    serializer_class = MeterParameterListSerializer
    
    def get_queryset(self,*args,**kwargs):
        return MeterParameter.objects.all()

class SimCardListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = SimCardListSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    search_fields = ['simcardNumber', 'imei']
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
                organ = Organization.objects.get(uuid=groupName)
            except:
                pass
        queryset_list = organ.simcard_list_queryset('')
        # queryset_list = queryset_list.exclude(rid__isnull=True)
        # queryset_list.exclude(pId__exact='')
        if simpleQueryParam:
            queryset_list = queryset_list.filter(
                    Q(meter__serialnumber__icontains=simpleQueryParam)|
                    Q(simcardNumber__icontains=simpleQueryParam)
                    # Q(imei__icontains=query)
                    ).distinct()
        return queryset_list
 


class MeterListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = MeterListSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    search_fields = ['serialnumber','simid.simcardNumber']
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
                organ = Organization.objects.get(uuid=groupName)
            except:
                pass
        queryset_list = organ.meter_list_queryset('')
        # queryset_list = queryset_list.exclude(rid__isnull=True)
        # queryset_list.exclude(pId__exact='')
        if simpleQueryParam:
            queryset_list = queryset_list.filter(
                    Q(serialnumber__icontains=simpleQueryParam)|
                    Q(simid__simcardNumber__icontains=simpleQueryParam)
                    # Q(imei__icontains=query)
                    ).distinct()
        return queryset_list


class VConcentratorListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = VConcentratorListSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    search_fields = ['name']
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
                organ = Organization.objects.get(uuid=groupName)
            except:
                pass
        queryset_list = organ.concentrator_list_queryset('')
        # queryset_list = queryset_list.exclude(rid__isnull=True)
        # queryset_list.exclude(pId__exact='')
        if simpleQueryParam:
            queryset_list = queryset_list.filter(
                    Q(amrs_concentrator__commaddr__icontains=simpleQueryParam)|
                    Q(amrs_concentrator__name__icontains=simpleQueryParam)
                    # Q(imei__icontains=query)
                    ).distinct()

        queryset_list = [s.amrs_concentrator for s in queryset_list]
        return queryset_list


class VPressureListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = VPressureSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    search_fields = ['name']
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
                organ = Organization.objects.get(uuid=groupName)
            except:
                pass
        queryset_list = organ.pressure_list_queryset('')
        # queryset_list = queryset_list.exclude(rid__isnull=True)
        # queryset_list.exclude(pId__exact='')
        if simpleQueryParam:
            queryset_list = queryset_list.filter(
                    Q(amrs_pressure__username__icontains=simpleQueryParam)|
                    Q(amrs_pressure__commaddr__icontains=simpleQueryParam)
                    # Q(imei__icontains=query)
                    ).distinct()
        return queryset_list


@api_view(['GET', ])
def getpressureSelect(request):
    # meters = Meter.objects.all()
    # concentrators = request.user.concentrator_list_queryset('').values()
    pressures = request.user.belongto.pressure_list_queryset('')

    serializer = PressureSelectSerializer(pressures,many=True)

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":serializer.data,
        "success":True
    }
   
    # print(operarions_list)
    return Response(operarions_list)



@api_view(['GET', ])
def getMeterSelect(request):
    # meters = Meter.objects.all()
    # concentrators = request.user.concentrator_list_queryset('').values()
    meter_lists = request.user.belongto.meter_list_queryset('')

    # 直接过滤掉已经被站点关联的表具
    meter_lists = meter_lists.filter(station__isnull=True).filter(simid__isnull=False)

    serializer = MeterSelectSerializer(meter_lists,many=True)
    

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":serializer.data,
        "success":True
    }
   
    # print(operarions_list)
    return Response(operarions_list)


@api_view(['GET', ])
def getConcentratorSelect(request):
    # meters = Meter.objects.all()
    # concentrators = request.user.concentrator_list_queryset('').values()
    concentrators = request.user.belongto.concentrator_list_queryset('')

    serializer = VConcentratorSelectSerializer(concentrators,many=True)

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":serializer.data,
        "success":True
    }
   
    # print(operarions_list)
    return Response(operarions_list)


@api_view(['GET', ])
def getCommunitySelect(request):
    # meters = Meter.objects.all()
    # concentrators = request.user.concentrator_list_queryset('').values()
    # communitylist = request.user.belongto.community_list_queryset('')
    communitylist = Community.objects.all()
    serializer = CommunitySelectSerializer(communitylist,many=True)

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":serializer.data,
        "success":True
    }
   
    # print(operarions_list)
    return Response(operarions_list)


@api_view(['GET', ])
def getSimcardSelect(request):
    # meters = Meter.objects.all()
    # concentrators = request.user.concentrator_list_queryset('').values()
    simcardlist = request.user.belongto.simcard_list_queryset('')
    simcardlist = simcardlist.filter(meter__isnull=True)
    # concentrator_list = request.user.belongto.pressure_list_queryset('')
    # simcardlist = simcardlist.filter()
    # simcardlist = SimCard.objects.all()
    # simcardlist = simcardlist.exclude(imei__isnull=True)

    serializer = SimcardSelectSerializer(simcardlist,many=True)

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":serializer.data,
        "success":True
    }
   
    # print(operarions_list)
    return Response(operarions_list)



@api_view(['GET', ])
def getIMEISelect(request):
    # meters = Meter.objects.all()
    # concentrators = request.user.concentrator_list_queryset('').values()
    concentrators = request.user.belongto.simcard_list_queryset('')
    simcardlist = SimCard.objects.all()
    simcardlist = simcardlist.exclude(imei__isnull=True)

    serializer = SimcardIEMISelectSerializer(simcardlist,many=True)

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":serializer.data,
        "success":True
    }
   
    # print(operarions_list)
    return Response(operarions_list)


@api_view(['GET','POST' ])
def getCommandParam(request):
    print("getCommandParam",request.POST)
    sid = request.POST.get("sid")   #station pk
    commandType = request.POST.get("commandType")   #参数类型 11-通讯参数 12-终端参数 13-采集指令 14-基表参数
    isRefer = request.POST.get("isRefer")
    commaddr = request.POST.get("commaddr")

    # user = request.user

    
    # current meter
    try:
        station = Station.objects.get(pk=int(sid)) #.values("pk","meter__serialnumber","meter__simid__simcardNumber","username")
    except:
        return Response({'success':False})

    commaddr = station.amrs_bigmeter.commaddr #["meter__simid__simcardNumber"]
    
    commParam = {}
    terminalParam = {}
    aquiryParam = {}
    meterbaseParam = {}

    paramlist = MeterParameter.objects.filter(commaddr=commaddr).values()
    if paramlist.exists():
        param = paramlist.first()
    

    
        if commandType == "11":
            commParam = {
                "tcpresendcount":param["tcpresendcount"],
                "tcpresponovertime":param["tcpresponovertime"],
                "udpresendcount":param["udpresendcount"],
                "udpresponovertime":param["udpresponovertime"],
                "smsresendcount":param["smsresendcount"],
                "smsresponovertime":param["smsresponovertime"],
                "heartbeatperiod":param["heartbeatperiod"],
            }

        if commandType == "12":
            terminalParam = {
                "ipaddr":param["ipaddr"],
                "port":param["port"],
                "entrypoint":param["entrypoint"],
                
            }

        if commandType == "13":
            aquiryParam = {
                "updatastarttime":param["updatastarttime"],
                "updatamode":param["updatamode"],
                "collectperiod":param["collectperiod"],
                "updataperiod":param["updataperiod"],
                "updatatime1":param["updatatime1"],
                "updatatime2":param["updatatime2"],
                "updatatime3":param["updatatime3"],
                "updatatime4":param["updatatime4"],
            }

        if commandType == "14":
            meterbaseParam = {
                "dn":param["dn"],
                "liciperoid":param["liciperoid"],
                "maintaindate":param["maintaindate"],
                "transimeterfactor":param["transimeterfactor"],
                "biaofactor":param["biaofactor"],
                "manufacturercode":param["manufacturercode"],
                "issmallsignalcutpoint":param["issmallsignalcutpoint"],
                "smallsignalcutpoint":param["smallsignalcutpoint"],
                "isflowzerovalue":param["isflowzerovalue"],
                "flowzerovalue":param["flowzerovalue"],
                "pressurepermit":param["pressurepermit"],
                "flowdorient":param["flowdorient"],
                "plusaccumupreset":param["plusaccumupreset"],
            }
    
    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":{
            "sid":station.id,
            "commaddr":commaddr,#station.first()["meter__simid__simcardNumber"],
            "serialnumber":station.meter.serialnumber if station.meter else '',#first()["meter__serialnumber"],
            "station__username":station.amrs_bigmeter.username, #first()["username"],
            # "referMeterList":meter_list,
            "commParam":commParam,
            "terminalParam":terminalParam,
            "aquiryParam":aquiryParam,
            "meterbaseParam":meterbaseParam,
            },
        "success":True
    }

    
    return Response(operarions_list)








