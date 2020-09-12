# -*- coding:utf-8 -*-
from django.db.models import Q
from django.views.decorators.cache import cache_page
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
from core.models import Organization,VWatermeter
from amrs.models import Watermeter

# from .pagination import PostLimitOffsetPagination, PostPageNumberPagination
# from .permissions import IsOwnerOrReadOnly

from .serializers import (
    # PostCreateUpdateSerializer, 
    OrganizationTreeSerializer, 
    OrganizationTreeSerializer_countstation,
    DmaTreeSerializer,
    StationTreeSerializer,
    PressureTreeSerializer,
    SecondWaterTreeSerializer,
    CommunityTreeSerializer,
    ConcentratorTreeSerializer,
    WatermeterTreeSerializer,
    OrganizationListSerializer,

    MyRoleListSerializer,

    UserListSerializer,
    )


class OrganizationListAPIView(ListAPIView):
    serializer_class = OrganizationTreeSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    search_fields = ['name', 'owner_name','phone_number','firm_address']
    # pagination_class = PostPageNumberPagination #PageNumberPagination

    def get_queryset(self, *args, **kwargs):
        #queryset_list = super(PostListAPIView, self).get_queryset(*args, **kwargs)
        queryset_list = Organization.objects.all() #filter(user=self.request.user)
        queryset_list = queryset_list.exclude(pId__isnull=True)
        # queryset_list.exclude(pId__exact='')
        query = self.request.GET.get("q")
        if query:
            queryset_list = queryset_list.filter(
                    Q(name__icontains=query)|
                    Q(owner_name__icontains=query)|
                    # Q(user__first_name__icontains=query) |
                    Q(phone_number__icontains=query)|
                    Q(firm_address__icontains=query)
                    ).distinct()
        return queryset_list



class MyRoleListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = MyRoleListSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    search_fields = ['name', 'owner_name','phone_number','firm_address']
    # pagination_class = PostPageNumberPagination #PageNumberPagination

    def get_queryset(self, *args, **kwargs):
        #queryset_list = super(PostListAPIView, self).get_queryset(*args, **kwargs)
        queryset_list = MyRoles.objects.all() #filter(user=self.request.user)
        # queryset_list = queryset_list.exclude(rid__isnull=True)
        # queryset_list.exclude(pId__exact='')
        print('get_queryset:',queryset_list)
        query = self.request.GET.get("q")
        if query:
            queryset_list = queryset_list.filter(
                    Q(name__icontains=query)
                    ).distinct()
        return queryset_list


class UserListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = UserListSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    search_fields = ['user_name', 'real_name','phone_number']
    # pagination_class = PostPageNumberPagination #PageNumberPagination

    def get_queryset(self, *args, **kwargs):
        #queryset_list = super(PostListAPIView, self).get_queryset(*args, **kwargs)
        groupName = self.request.GET.get("groupName")
        groupType = self.request.GET.get("groupType")
        districtId = self.request.GET.get("districtId")
        selectCommunity = self.request.GET.get("selectCommunity")
        selectBuilding = self.request.GET.get("selectBuilding")
        selectTreeType = self.request.GET.get("selectTreeType")
        simpleQueryParam = self.request.GET.get("simpleQueryParam")

        organ = self.request.user.belongto
        if groupName and groupType == 'group':
            try:
                organ = Organization.objects.get(cid=groupName)
            except:
                pass

        queryset_list = self.request.user.user_list_queryset()
        if groupName:
            queryset_list = queryset_list.filter(belongto__cid=groupName)
        # queryset_list = queryset_list.exclude(rid__isnull=True)
        # queryset_list.exclude(pId__exact='')
        # print('get_queryset:',queryset_list)
        query = self.request.GET.get("simpleQueryParam")
        if query:
            queryset_list = queryset_list.filter(
                    Q(user_name__icontains=query)|
                    Q(real_name__icontains=query)|
                    Q(phone_number__icontains=query)
                    ).distinct()
        return queryset_list


@api_view(['GET', ])
# @cache_page(60 * 150)
def oranizationtree(request):   
    organtree = []
    isFilter = request.GET.get("isFilter") or ''
    stationflag = request.GET.get("isStation") or ''
    dmaflag = request.GET.get("isDma") or ''
    communityflag = request.GET.get("isCommunity") or ''
    buidlingflag = request.GET.get("isBuilding") or ''
    pressureflag = request.GET.get("isPressure") or ''
    protocolflag = request.GET.get("isProtocol") or ''
    secondwaterflag = request.GET.get("isSecondwater") or ''
    concentratorflag = request.GET.get("isConcentrator") or ''
    iscountstation = request.GET.get("iscountstation") or ''
    user = request.user
    
    # if user.is_anonymous:
    if not user.is_authenticated:
        organs = Organization.objects.first()
    else:
        organs = user.belongto #Organization.objects.all()
    
    # 组织
    organ_lists = organs.get_descendants(include_self=True).all()
    if iscountstation == '1':
        organ_serializer = OrganizationTreeSerializer_countstation(organ_lists,many=True)
    else:   
        organ_serializer = OrganizationTreeSerializer(organ_lists,many=True)
    
    p_dma_no='' #dma_lists[0]['dma_no'] 
    
    
    
    # #dma
    if dmaflag == '1':
        dma_lists = organs.dma_list_queryset()
        dma_serializer = DmaTreeSerializer(dma_lists,many=True)
        organtree += [ s for s in dma_serializer.data]
            
            

    #     #station
    if stationflag == '1':
        station_lists = organs.station_list_queryset('')
        if isFilter == "1":
            station_lists = station_lists.filter(belongto=user.belongto)
        station_serializer = StationTreeSerializer(station_lists,many=True)
        organtree += [s for s in station_serializer.data]
    
        

    # # pressure
    if pressureflag == '1':
        pressure_lists = organs.pressure_list_queryset('')
        pressure_serializer = PressureTreeSerializer(pressure_lists,many=True)
        organtree += [s for s in pressure_serializer.data]
    

    # # secondwater 
    if secondwaterflag == '1':
        secondwaterlists = organs.secondwater_list_queryset('')
        secondwataer_serializer = SecondWaterTreeSerializer(secondwaterlists,many=True)
        organtree += [ s for s in secondwataer_serializer.data]
    
    
    if concentratorflag == '1':
        concentratorlists = organs.concentrator_list_queryset('')
        concentrator_serializer = ConcentratorTreeSerializer(concentratorlists,many=True)
        organtree += [ s for s in concentrator_serializer.data]
    
    # #community
    if communityflag == '1':
        comunity_lists = organs.community_list_queryset('')
        community_serializer = CommunityTreeSerializer(comunity_lists,many=True)
        # organtree += [ s for s in community_serializer.data]
        for s in community_serializer.data:
            organtree.append(s)
            
            if buidlingflag == "1":
                community_name = s.get("name")
                watermeter_lists = VWatermeter.objects.filter(communityid__amrs_community__name=community_name).values('amrs_watermeter__buildingname').distinct()
                # print(watermeter_lists)
                # watermeter_serializer = WatermeterTreeSerializer(watermeter_lists,many=True)
                # organtree += [ s for s in watermeter_serializer.data]
                for w in watermeter_lists:
                    organtree.append({
                        "name":w["amrs_watermeter__buildingname"],
                        "id":'',
                        "districtid":'',
                        "pId":s.get("id"),
                        "otype":"building",
                        "dma_no":'',
                        "open":False,
                        "commaddr":'commaddr',
                        # "dma_station_type":"", # 在dma站点分配中标识该是站点还是小区
                        "icon":"/static/virvo/resources/img/buildingno.png",
                        "uuid":''
                    })

    
    organtree += [s for s in organ_serializer.data]

    return Response(organtree)
    











