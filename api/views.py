# -*- coding:utf-8 -*-
from django.db.models import Q

from core.pagination import TempDataTablePageNumberPagination
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

from amrs.models import (
    Concentrator,
    Community,
    Bigmeter,
    Metercomm,
    MeterParameter,
    Meterprotocol,
)
# from .pagination import PostLimitOffsetPagination, PostPageNumberPagination
# from .permissions import IsOwnerOrReadOnly

from core.models import (
    Organization,
    SimCard,
    Meter,
    Station,
    DMABaseinfo,
    VConcentrator,
    VCommunity,
    VPressure,
    VSecondWater,
    VWatermeter,
    DmaGisinfo,
    DmaStation,
    WaterUserType,
    Personalized
)


from .serializers import (
    # PostCreateUpdateSerializer, 
    OrganizationListSerializer, 
    OrganizationDetailSerializer,
    OrganizationSerializer,
    MyRoleSerializer,
    UserSerializer,
    SimCardSerializer,
    MeterSerializer,
    StationSerializer,
    VConcentratorSerializer,
    VCommunitySerializer,
    VPressureSerializer,
    VSecondWaterSerializer,
    VWatermeterSerializer,
    WaterUserTypeSerializer,
    MetercommSerializer,
    MeterParameterSerializer,
    MeterprotocolSerializer,
    FlowdataSerializer,
    PressureDataSerializer,
    PersonalizedSerializer,
    )


class PersonalizedListAPIView(ListAPIView):
    queryset = Personalized.objects.all()
    serializer_class = PersonalizedSerializer

class MetercommListAPIView(ListAPIView):
    queryset = Metercomm.objects.all()
    serializer_class = MetercommSerializer
    pagination_class = TempDataTablePageNumberPagination #PageNumberPagination


class MeterParameterListAPIView(ListAPIView):
    queryset = MeterParameter.objects.all()
    serializer_class = MeterParameterSerializer
    pagination_class = TempDataTablePageNumberPagination #PageNumberPagination



class MeterprotocolListAPIView(ListAPIView):
    queryset = Meterprotocol.objects.all()
    serializer_class = MeterprotocolSerializer
    pagination_class = TempDataTablePageNumberPagination #PageNumberPagination


class WaterUserTypeListAPIView(ListAPIView):
    queryset = WaterUserType.objects.all()
    serializer_class = WaterUserTypeSerializer
    pagination_class = TempDataTablePageNumberPagination #PageNumberPagination

    


class VWatermeterListAPIView(ListAPIView):
    queryset = VWatermeter.objects.all()
    serializer_class = VWatermeterSerializer
    pagination_class = TempDataTablePageNumberPagination #PageNumberPagination

    def get_queryset(self):
        belongto = Organization.objects.get(id=17)
        queryset = belongto.watermeter_list_queryset('')
        return queryset



class VSecondwaterListAPIView(ListAPIView):
    queryset = VSecondWater.objects.all()
    serializer_class = VSecondWaterSerializer
    pagination_class = TempDataTablePageNumberPagination #PageNumberPagination

class VPressureListAPIView(ListAPIView):
    queryset = VPressure.objects.all()
    serializer_class = VPressureSerializer
    pagination_class = TempDataTablePageNumberPagination #PageNumberPagination

    def get_queryset(self):
        queryset = VPressure.objects.all()
        # queryset = queryset.exclude(simid__isnull=True)
        # queryset = queryset.exclude(meter__simid__isnull=True)
        return queryset

class VPressureDetailAPIView(RetrieveAPIView):
    queryset = Bigmeter.objects.filter(commaddr__gte=0)
    serializer_class = PressureDataSerializer

    

class VCommunityListAPIView(ListAPIView):
    queryset = VCommunity.objects.all()
    serializer_class = VCommunitySerializer
    pagination_class = TempDataTablePageNumberPagination #PageNumberPagination

    def get_queryset(self):
        belongto = Organization.objects.get(id=17)
        queryset = belongto.community_list_queryset('')
        return queryset


class VConcentratorListAPIView(ListAPIView):
    queryset = VConcentrator.objects.all()
    serializer_class = VConcentratorSerializer
    pagination_class = TempDataTablePageNumberPagination #PageNumberPagination

    def get_queryset(self):
        belongto = Organization.objects.get(id=17)
        queryset = belongto.concentrator_list_queryset('')
        return queryset


class StationListAPIView(ListAPIView):
    # queryset = Station.objects.all()
    serializer_class = StationSerializer
    pagination_class = TempDataTablePageNumberPagination #PageNumberPagination

    def get_queryset(self):
        belongto = Organization.objects.get(id=17)
        queryset = belongto.station_list_queryset('')
        # queryset = Station.objects.all()
        queryset = queryset.exclude(meter__isnull=True)
        queryset = queryset.exclude(meter__simid__isnull=True)
        return queryset


class StationDetailAPIView(RetrieveAPIView):
    queryset = Bigmeter.objects.filter(commaddr__gte=0)
    serializer_class = FlowdataSerializer    


class MeterListAPIView(ListAPIView):
    queryset = Meter.objects.all()
    serializer_class = MeterSerializer
    pagination_class = TempDataTablePageNumberPagination #PageNumberPagination

    def get_queryset(self):
        belongto = Organization.objects.get(id=17)
        queryset = belongto.meter_list_queryset('')
        return queryset


class SimCardListAPIView(ListAPIView):
    queryset = SimCard.objects.all()
    serializer_class = SimCardSerializer
    pagination_class = TempDataTablePageNumberPagination #PageNumberPagination

    def get_queryset(self):
        belongto = Organization.objects.get(id=17)
        queryset = belongto.simcard_list_queryset('')
        return queryset


class UserListAPIView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_queryset(self):
        queryset = User.objects.all()
        queryset = queryset.exclude(Role__isnull=True)
        return queryset
    
class MyRoleListAPIView(ListAPIView):
    queryset = MyRoles.objects.all()
    serializer_class = MyRoleSerializer
    

class OrganizationListAPIView(ListAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationListSerializer
    


class OrganizationDetailAPIView( RetrieveAPIView):
    queryset = Organization.objects.filter(id__gte=0)
    serializer_class = OrganizationSerializer
    # permission_classes = [IsOwnerOrReadOnly]
    

class VWatermeterDetailAPIView(RetrieveAPIView):
    queryset = VWatermeter.objects.filter(id__gte=0)
    serializer_class = VWatermeterSerializer


# @api_view(['GET', ])
# def getSimcardSelect(request):
#     # meters = Meter.objects.all()
#     # concentrators = request.user.concentrator_list_queryset('').values()
#     simcardlist = request.user.belongto.simcard_list_queryset('')
#     # simcardlist = SimCard.objects.all()
#     # simcardlist = simcardlist.exclude(imei__isnull=True)

#     serializer = SimcardSelectSerializer(simcardlist,many=True)

#     operarions_list = {
#         "exceptionDetailMsg":"null",
#         "msg":None,
#         "obj":serializer.data,
#         "success":True
#     }
   
#     # print(operarions_list)
#     return Response(operarions_list)



# @api_view(['GET', ])
# def getIMEISelect(request):
#     # meters = Meter.objects.all()
#     # concentrators = request.user.concentrator_list_queryset('').values()
#     concentrators = request.user.belongto.simcard_list_queryset('')
#     simcardlist = SimCard.objects.all()
#     simcardlist = simcardlist.exclude(imei__isnull=True)

#     serializer = SimcardIEMISelectSerializer(simcardlist,many=True)

#     operarions_list = {
#         "exceptionDetailMsg":"null",
#         "msg":None,
#         "obj":serializer.data,
#         "success":True
#     }
   
#     # print(operarions_list)
#     return Response(operarions_list)








