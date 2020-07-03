# -*- coding:utf-8 -*-
from django.db.models import Q

from django.db.models import Avg, Max, Min, Sum,Count
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
    VWatermeter
)
from amrs.models import (
    Concentrator,
    Community,
    Bigmeter,
    Watermeter,
    HdbWatermeterDay,
    HdbWatermeterMonth,
    HdbWatermeterData,
    Alarm
)
# from core.pagination import PostLimitOffsetPagination, DataTablePageNumberPagination
# from .permissions import IsOwnerOrReadOnly

from .serializers import (
    # PostCreateUpdateSerializer, 
    # WatermeterListSerializer, 
    VWatermeterListSerializer,
    WQSerializer,
    WQDetailSerializer,
    MapConcentratorSerializer,
    WAlarmSerializer,
    WStatsticsSerializer,
    create_wqSerializer,
    )

from amrs.serializers import (
    HdbWatermeterDaySerializer,
    HdbWatermeterDaySerializer_Lora,
    HdbWatermeterMonthSerializer,
    HdbWatermeterMonthSerializer_Lora,
    HdbWatermeterFlowSerializer,
    HdbWatermeterRawFlowSerializer,
)

from wirelessm.utils import zerouse_by_belongto,stastics_by_community,stastics_by_belongto

import datetime


class WatermeterListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = VWatermeterListSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    # search_fields = ['simcardNumber', 'imei']
    # pagination_class = DataTablePageNumberPagination #PageNumberPagination

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

        queryset_list = organ.watermeter_list_queryset('')
        # queryset_list = queryset_list.exclude(rid__isnull=True)
        # queryset_list.exclude(pId__exact='')
        # print('get_queryset:',queryset_list)

        if selectCommunity:
            queryset_list = queryset_list.filter(
                    Q(communityid__amrs_community__name__exact=selectCommunity)
                    # Q(imei__icontains=query)
                    ).distinct()

        if simpleQueryParam:
            queryset_list = queryset_list.filter(
                    Q(amrs_watermeter__serialnumber__icontains=simpleQueryParam)
                    # Q(imei__icontains=query)
                    ).distinct()
        return queryset_list



class WQListAPIView(ListAPIView):
    """
        户表管理 数据查询
    """
    # queryset = MyRoles.objects.all()
    # serializer_class = WQSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    # search_fields = ['simcardNumber', 'imei']
    # pagination_class = DataTablePageNumberPagination #PageNumberPagination

    def get_serializer_class(self):
        sTime = self.request.GET.get("sTime")
        eTime = self.request.GET.get("eTime")

        return create_wqSerializer(sTime,eTime)

    def get_queryset(self, *args, **kwargs):
        #queryset_list = super(PostListAPIView, self).get_queryset(*args, **kwargs)
        # print(self.request.GET)
        groupName = self.request.GET.get("groupName")
        groupType = self.request.GET.get("groupType")
        districtId = self.request.GET.get("districtId")
        selectCommunity = self.request.GET.get("selectCommunity")
        selectBuilding = self.request.GET.get("selectBuilding")
        selectTreeType = self.request.GET.get("selectTreeType")
        simpleQueryParam = self.request.GET.get("simpleQueryParam")

        manuselect = self.request.GET.get("manuselect")
        rmodeselect = self.request.GET.get("rmodeselect")
        zeroselect = self.request.GET.get("zeroselect") or 'none'
        dnselect = self.request.GET.get("dnselect")

        

        order_column = self.request.GET.get('order[0][column]')
        order_dir = self.request.GET.get('order[0][dir]')

        colo = self.request.GET.get('columns[%s][data]'%order_column) or 'none'
        print(order_column,order_dir,colo)
        

        organ = self.request.user.belongto
        if groupName and groupType == 'group':
            try:
                organ = Organization.objects.get(cid=groupName)
                print("slected organ is ",organ)
            except:
                pass
        if colo == 'none':
            queryset_list = organ.watermeter_list_queryset('').order_by('amrs_watermeter__buildingname','amrs_watermeter__roomname')
        else:
            if order_dir == 'asc':
                queryset_list = organ.watermeter_list_queryset('').order_by('amrs_watermeter__%s'%colo)
            else:
                queryset_list = organ.watermeter_list_queryset('').order_by('-amrs_watermeter__%s'%colo)
        # queryset_list = queryset_list.exclude(rid__isnull=True)
        # queryset_list.exclude(pId__exact='')
        # print('get_queryset:',queryset_list) buildingname

        if selectCommunity :
            print("selectCommunity ",selectCommunity)
            queryset_list = queryset_list.filter(
                    Q(communityid__amrs_community__name__exact=selectCommunity)
                    # |Q(amrs_watermeter__buildingname__icontains=selectBuilding)
                    ).distinct()

        if selectBuilding:
            print("selectBuilding",selectBuilding)
            queryset_list = queryset_list.filter(
                    Q(amrs_watermeter__buildingname__exact=selectBuilding)
                    ).distinct()

        if simpleQueryParam:
            queryset_list = queryset_list.filter(
                    Q(amrs_watermeter__serialnumber__icontains=simpleQueryParam)|
                    Q(amrs_watermeter__wateraddr__icontains=simpleQueryParam)|
                    Q(amrs_watermeter__numbersth__icontains=simpleQueryParam)
                    # Q(imei__icontains=query)
                    ).distinct()

        if manuselect != "none":
            print("filt by dn",dnselect)
            queryset_list = queryset_list.filter(
                    Q(amrs_watermeter__manufacturer__exact=manuselect)
                    # Q(imei__icontains=query)
                    ).distinct()

        if rmodeselect != "none":
            print("filt by rmodeselect",rmodeselect)
            queryset_list = queryset_list.filter(
                    Q(amrs_watermeter__metertype__exact=rmodeselect)
                    # Q(imei__icontains=query)
                    ).distinct()

        if zeroselect != "none":
            print("filt by zeroselect",zeroselect)
            days = int(zeroselect)
            today = datetime.datetime.now()
            theday = today - datetime.timedelta(days=days)
            exclude_data = queryset_list.filter(
                    Q(amrs_watermeter__rtime__range=(theday,today))
                    # Q(imei__icontains=query)
                    ).values("id")
            print("exclude_data count",exclude_data.count())
            queryset_list = queryset_list.exclude(id__in=exclude_data)
            print('filt days betwwen',theday,today)


        if dnselect != "none":
            print("filt by dn",dnselect)
            queryset_list = queryset_list.filter(
                    Q(amrs_watermeter__dn__exact=dnselect)
                    # Q(imei__icontains=query)
                    ).distinct()

        
        return queryset_list

@api_view(['GET','POST'])
def readpercent(request):
    '''
        抄收率
    '''
    groupName = request.GET.get("groupName")
    groupType = request.GET.get("groupType")
    districtId = request.GET.get("districtId")
    selectCommunity = request.GET.get("selectCommunity")
    selectBuilding = request.GET.get("selectBuilding")
    selectTreeType = request.GET.get("selectTreeType")
    simpleQueryParam = request.GET.get("simpleQueryParam")
    rdate = request.GET.get("rdate")
    dnselect = request.GET.get("dnselect")
    manuselect = request.GET.get("manuselect")
    rmodeselect = request.GET.get("rmodeselect")
    zeroselect = request.GET.get("zeroselect") or 'none'

    organ = request.user.belongto
    if groupName and groupType == 'group':
        try:
            organ = Organization.objects.get(cid=groupName)
            print(" readpercent --slected organ is ",organ)
        except:
            pass

    queryset_list = organ.watermeter_list_queryset('').order_by('-amrs_watermeter__rtime')
    # queryset_list = queryset_list.exclude(rid__isnull=True)
    # queryset_list.exclude(pId__exact='')
    # print('get_queryset:',queryset_list) buildingname

    if selectCommunity :
        print("selectCommunity ",selectCommunity)
        queryset_list = queryset_list.filter(
                Q(communityid__amrs_community__name__exact=selectCommunity)
                # |Q(amrs_watermeter__buildingname__icontains=selectBuilding)
                ).distinct()

    if selectBuilding:
        print("selectBuilding",selectBuilding)
        queryset_list = queryset_list.filter(
                Q(amrs_watermeter__buildingname__exact=selectBuilding)
                ).distinct()

    if simpleQueryParam:
        queryset_list = queryset_list.filter(
                Q(amrs_watermeter__serialnumber__icontains=simpleQueryParam)|
                Q(amrs_watermeter__numbersth__icontains=simpleQueryParam)
                # Q(imei__icontains=query)
                ).distinct()

    if manuselect != "none":
            print("filt by dn",dnselect)
            queryset_list = queryset_list.filter(
                    Q(amrs_watermeter__manufacturer__exact=manuselect)
                    # Q(imei__icontains=query)
                    ).distinct()

    if rmodeselect != "none":
        print("filt by rmodeselect",rmodeselect)
        queryset_list = queryset_list.filter(
                Q(amrs_watermeter__metertype__exact=rmodeselect)
                # Q(imei__icontains=query)
                ).distinct()

    if zeroselect != "none":
        print("filt by zeroselect",zeroselect)
        days = int(zeroselect)
        today = datetime.datetime.now()
        theday = today - datetime.timedelta(days=days)
        exclude_data = queryset_list.filter(
                Q(amrs_watermeter__rtime__range=(theday,today))
                # Q(imei__icontains=query)
                ).values("id")
        print("exclude_data count",exclude_data.count())
        queryset_list = queryset_list.exclude(id__in=exclude_data)
        print('filt days betwwen',theday,today)

    if dnselect != "none":
        print("filt by dn",dnselect)
        queryset_list = queryset_list.filter(
                Q(amrs_watermeter__dn__exact=dnselect)
                # Q(imei__icontains=query)
                ).distinct()


    total = queryset_list.count()
    percent_list = queryset_list.filter(amrs_watermeter__rtime__startswith=rdate)
    readed = percent_list.count()
    if total != 0:
        percent = int(readed / total * 100)
    else:
        percent = 0
    result = dict()
    result["totalmeter"] = total
    result["readpercent"] = percent 
    
    
    
    return Response(result)


    

class WAlarmListAPIView(ListAPIView):
    """
        户表管理 数据查询
    """
    # queryset = MyRoles.objects.all()
    serializer_class = WAlarmSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    # search_fields = ['simcardNumber', 'imei']
    # pagination_class = DataTablePageNumberPagination #PageNumberPagination

    def get_queryset(self, *args, **kwargs):
        #queryset_list = super(PostListAPIView, self).get_queryset(*args, **kwargs)
        wateraddr = self.request.GET.get("wateraddr")
        

        queryset_list = Alarm.objects.filter(commaddr=wateraddr)
        
        
        return queryset_list



@api_view(['GET','POST'])
def funcdatastastics(request):
    '''
    函数的形式返回组织的统计信息
    '''
    draw = 1
    length = 0
    start=0
    
    if request.method == "GET":
        draw = int(request.GET.get("draw", 1))
        length = int(request.GET.get("length", 10))
        start = int(request.GET.get("start", 0))
        search_value = request.GET.get("search[value]", None)
        pageSize = int(request.GET.get("pageSize", 10))
        # order_column = request.GET.get("order[0][column]", None)[0]
        # order = request.GET.get("order[0][dir]", None)[0]
        groupName = request.GET.get("groupName")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        # print("simpleQueryParam",simpleQueryParam)
        groupType = request.GET.get("groupType")
        districtId = request.GET.get("districtId")
        selectCommunity = request.GET.get("selectCommunity")
        selectBuilding = request.GET.get("selectBuilding")
        selectTreeType = request.GET.get("selectTreeType")
        stime = request.GET.get("stime")
        etime = request.GET.get("etime")

        print("groupName",groupName)
        print("groupType",groupType)
        print("districtId",districtId)
        print(stime,'--',etime)

    if request.method == "POST":
        draw = int(request.POST.get("draw", 1))
        length = int(request.POST.get("length", 10))
        start = int(request.POST.get("start", 0))
        pageSize = int(request.POST.get("pageSize", 10))
        search_value = request.POST.get("search[value]", None)
        order_column = int(request.POST.get("order[0][column]", None))
        order = request.POST.get("order[0][dir]", None)
        groupName = request.POST.get("groupName")
        districtId = request.POST.get("districtId")
        simpleQueryParam = request.POST.get("simpleQueryParam")

    belongto = request.user.belongto
    data = []
    if groupType == "building":
        data = []
    elif groupType == "community":
        print("community selected:",groupName)
        try:
            community = Community.objects.get(id=groupName)
            ret = stastics_by_community(community,stime,etime)
            print(ret)
            data.append(ret )
        except Exception as e:
            data = []
            print(e)

        
    else:
        if groupName and groupType == 'group':
            try:
                belongto = Organization.objects.get(cid=groupName)
                print("slected organ is ",belongto)
            except:
                pass

    

        

        queryset_list = belongto.watermeter_list_queryset('').order_by('-amrs_watermeter__rtime')
        childrens = belongto.children.all()
        community = belongto.vcommunity_set.all()

        data = []
        ret = stastics_by_belongto(belongto,stime,etime)
        data.append(ret)
        # data.append( {
        #     'belongto':belongto.name,
        #     'todayuse':'',
        #     'yestodayuse':'',
        #     'totaluser':queryset_list.count(),
        #     'zerouser':'',
        #     'yestodaypercent':'',
        #     'faultuser':'',
        #     'overflowuser':'',
        #     'nouse3m':'',
        #     'gongdan':''
        # })

        for c in community:
            ret = stastics_by_community(c,stime,etime)
            data.append(ret)
        #     data.append( {
        #     # "childrens":childrens,
        #     'belongto':c.amrs_community.name,
        #     'todayuse':'',
        #     'yestodayuse':'',
        #     'totaluser':0,
        #     'zerouser':'',
        #     'yestodaypercent':'',
        #     'faultuser':'',
        #     'overflowuser':'',
        #     'nouse3m':'',
        #     'gongdan':''
        # })
        for c in childrens:
            ret = stastics_by_belongto(c,stime,etime)
            data.append(ret)
        #     queryset_list = c.watermeter_list_queryset('').order_by('-amrs_watermeter__rtime')

        #     data.append( {
        #     # "childrens":childrens,
        #     'belongto':c.name,
        #     'todayuse':'',
        #     'yestodayuse':'',
        #     'totaluser':queryset_list.count(),
        #     'zerouser':'',
        #     'yestodaypercent':'',
        #     'faultuser':'',
        #     'overflowuser':'',
        #     'nouse3m':'',
        #     'gongdan':''
        # })
        
    recordsTotal = len(data)
    result = dict()
    result["records"] = data[start:start+length]
    result["draw"] = draw
    result["success"] = "true"
    result["pageSize"] = pageSize
    result["totalPages"] = recordsTotal/pageSize
    result["recordsTotal"] = recordsTotal
    result["recordsFiltered"] = recordsTotal
    result["start"] = 0
    result["end"] = 0
    return Response(result)


@api_view(['GET','POST'])
def wholedatastastics(request):
    '''
    无线抄表 综合统计数据
    '''
    belongto = request.user.belongto
    commuity_all = belongto.community_list_queryset('').prefetch_related('amrs_community')
    watermeter_all = belongto.watermeter_list_queryset('').prefetch_related('amrs_watermeter')
    amrs_community_id_list = commuity_all.values_list('amrs_community__id',flat=True)

    today = datetime.datetime.today()
    yestoday = today - datetime.timedelta(days=1)
    yestoday_str = yestoday.strftime("%Y-%m-%d")
    this_month = today.strftime("%Y-%m")
    this_year = today.strftime("%Y")
    queryset_yestoday = HdbWatermeterDay.objects.filter(communityid__in=amrs_community_id_list).filter(hdate=yestoday_str).aggregate(Sum('dosage'))
    yestoday=queryset_yestoday['dosage__sum']
    queryset_thismon = HdbWatermeterMonth.objects.filter(communityid__in=amrs_community_id_list).filter(hdate=this_month).aggregate(Sum('dosage'))
    thismonth=queryset_thismon['dosage__sum']
    last_month = datetime.date.today().replace(day=1) - datetime.timedelta(days=1)
    lastmon_str = last_month.strftime("%Y-%m")
    queryset_lastmon = HdbWatermeterMonth.objects.filter(communityid__in=amrs_community_id_list).filter(hdate=lastmon_str).aggregate(Sum('dosage'))
    lastmonth=queryset_lastmon['dosage__sum']
    queryset_thisyear = HdbWatermeterMonth.objects.filter(communityid__in=amrs_community_id_list).filter(dosage__gte=0,hdate__startswith=this_year).aggregate(Sum('dosage'))
    thisyear=queryset_thisyear['dosage__sum']

    # 用水情况
    wateruse = {
        "yestoday":round(float(yestoday),2),
        "thismonth":round(float(thismonth),2),
        "lastmonth":round(float(lastmonth),2),
        "thisyear":round(float(thisyear),2)
    }

    # 抄见数据
    total = watermeter_all.count()
    yestoday_percent_list = watermeter_all.filter(amrs_watermeter__rtime__startswith=yestoday_str)
    thismonth_percent_list = watermeter_all.filter(amrs_watermeter__rtime__startswith=this_month)
    readed1 = yestoday_percent_list.count()
    readed2 = thismonth_percent_list.count()
    if total != 0:
        percent1 = int(readed1 / total * 100)
        percent2 = int(readed2 / total * 100)
    else:
        percent1 = 0
        percent2 = 0
    rchao = {
        "communitynum":commuity_all.count(),
        "usernum":total,
        "yestodaypercent":percent1,
        "monthpercent":percent2
    }

    # 异常用水
    nouse1d = zerouse_by_belongto(belongto,1)
    nouse1m = zerouse_by_belongto(belongto,30)
    nouse3m = zerouse_by_belongto(belongto,90)
    faultuse = {
        "nouse1d":nouse1d.count(),
        "nouse1m":nouse1m.count(),
        "nouse3m":nouse3m.count(),
        "overflowuse":0
    }

    # 厂家统计
    # 集中器下小表的厂家统计
    manufacturer_sets = watermeter_all.values("amrs_watermeter__manufacturer").annotate(num_m=Count('id'))
    # manufacturer_sets = Concentrator.objects.filter(vconcentrator__belongto=request.user.belongto).values("manufacturer").annotate(num_m=Count('commaddr'))
    # print("manu",manufacturer_sets)

    manufacturer_data = {}
    for md in manufacturer_sets:
        name = md['amrs_watermeter__manufacturer'] 

        if name is None or name == "":
            name = "其它"
        count = md['num_m']
        manufacturer_data[name] = count
    # manufacturer_count = manufacturer_sets.count()
    # print(manufacturer_data)
    sorted_manu = {k: v for k, v in sorted(manufacturer_data.items(), key=lambda item: item[1])}
    from collections import Counter 
    k = Counter(manufacturer_data) 
  
    # Finding 3 highest values 
    manufactory = k.most_common(4)  


    # 使用年限饼状图
    
    useyears = [
        {"value":335, "name":'2017'},
        {"value":310, "name":'2018'},
        {"value":234, "name":'2019'},
        {"value":135, "name":'2020'}
    ]
    # 用水性质分布图
    useproperty = [
        {"name":"居民用水","value":340},
        {"name":"工业用水","value":40},
        {"name":"特种用水","value":54},
        {"name":"商业用水","value":690},
        {"name":"其他用水","value":69}
    ]
    # 表具类型分布图
    metertype_sets = watermeter_all.values("amrs_watermeter__metertype").annotate(num_m=Count('id'))
    metertypes_clean = {}
    for m in metertype_sets:
        name = m["amrs_watermeter__metertype"]
        value = m["num_m"]
        if name not in ["NB物联","LORA智能"]:
            name = "有线表"
        
        if name not in metertypes_clean.keys():
            metertypes_clean[name] = value
        else:
            metertypes_clean[name] += value
    metertypes = [{"name":k,"value":v} for k,v in metertypes_clean.items()]
    
    # metertypes = [
    #     {"name":"NB表","value":120},
    #     {"name":"Lora表","value":320},
    #     {"name":"有线表","value":120}
    # ]
    # 水表口径分布图
    
    dn_sets = watermeter_all.values("amrs_watermeter__dn").annotate(num_m=Count('id'))
    meterdns = [{"name":"DN"+k["amrs_watermeter__dn"],"value":k["num_m"]} for k in dn_sets]

    # meterdns = [
    #     {"name":"DN15","value":139},
    #     {"name":"DN20","value":239},
    #     {"name":"DN25","value":133},
    #     {"name":"DN32","value":169}
    # ]
    # 阀控表分布图
    metervalves = [
        {"name":"阀控表","value":259},
        {"name":"非阀控表","value":559}
    ]

    result = {
        "metertype_sets":metertype_sets,
        "wateruse":wateruse,
        "rchao":rchao,
        "faultuse":faultuse,
        "manufactory":manufactory,
        "useyears":useyears,
        "useproperty":useproperty,
        "metertypes":metertypes,
        "meterdns":meterdns,
        "metervalves":metervalves,
    }
    
    
    return Response(result)


@api_view(['GET','POST'])
def showinfoStatics(request):
    '''
        showinfo.js 用过户号显示表信息
    '''
    vwaterid = int(request.GET.get("vwaterid", None))
        # vwaterid = request.POST.get("vwaterid")
        
    if vwaterid is None:
        return ResourceWarning({"success":"true","records":[]})

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")
    watermeter = Watermeter.objects.get(id=vwaterid)
    meter_serializer_data = WQDetailSerializer(watermeter).data

    dailydata = meter_serializer_data["day_use"]
    tmonth = 0
    for k,v in dailydata.items():
        tmonth += v


    year_use = 0
    try:
        flows=HdbWatermeterMonth.objects.filter(waterid=watermeter.id,communityid=watermeter.communityid,hdate__contains=today.year).aggregate(Sum('dosage'))
        year_use= round(float(flows['dosage__sum']),2)
        
    except Exception as e:
        print('348:',e)
        pass
    
    yestoday = today - datetime.timedelta(days=1)
    tyestoday = ''
    try:
        ystd = HdbWatermeterDay.objects.filter(waterid=watermeter.id,communityid=watermeter.communityid,hdate=yestoday.strftime("%Y-%m-%d"))
        if ystd.exists():
            tyestoday = round(float(ystd[0].dosage),2)
    except:
        pass
    
    
    result = dict()
    result["obj"] = meter_serializer_data
    result["success"] = "true"
    result["tyestoday"] = tyestoday
    result["tyear"] = year_use
    result["tmonth"] = round(float(tmonth),2)
    
    
    return Response(result)


@api_view(['GET','POST'])
def getWatermeterflow(request):
    
    '''
        vwaterid equal watermeter__id
    '''
    if request.method == "GET":
        vwaterid = int(request.GET.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        smonth = int(request.GET.get("smonth", None))
        sday = int(request.GET.get("sday", None))
        # vwaterid = request.GET.get("vwaterid")
        

    if request.method == "POST":
        vwaterid = int(request.POST.get("vwaterid", None))
        syear = int(request.POST.get("syear", None))
        smonth = int(request.POST.get("smonth", None))
        sday = int(request.POST.get("sday", None))
        
    # vwaterid=3219
    # smonth=3
    # sday=31
    if vwaterid is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")

    watermeter = Watermeter.objects.get(id=vwaterid)

    qmonth = '{}-{:02d}-{:02d}'.format(syear,smonth,sday)
    print('this water:',watermeter,watermeter.wateraddr,qmonth)
    queryset = HdbWatermeterData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__startswith=qmonth)
        ).distinct().order_by('readtime')
    dosage_serializer_data =  HdbWatermeterFlowSerializer(queryset,many=True).data
    print(dosage_serializer_data)

    datel = ['0:00']
    for i in range(24):
        s1 = '{}:30'.format(i)
        s2 = '{}:00'.format(i+1)
        datel.append(s1)
        datel.append(s2)

    def get_data_between_time(t1,t2):
        dt1 = datetime.datetime.strptime(t1,"%H:%M") 
        dt2 = datetime.datetime.strptime(t2,"%H:%M") 
        data_between = []
        data_len = len(dosage_serializer_data)
        sflag = True
        before_first = ''
        for i in range(data_len):
            s = dosage_serializer_data[i]
            # print(s.get("readtime")[11:16],s.get("totalflux"))
            dts = datetime.datetime.strptime(s.get("readtime")[11:16],"%H:%M") 
            if dts > dt1 and dts <= dt2:
                # 找到了 记录比较值
                
                if sflag:
                    sflag = False
                    if i == 0:
                        before_first = dosage_serializer_data[0].get("totalflux")
                    else:
                        before_first = dosage_serializer_data[i-1].get("totalflux")
                    print('before_first',before_first)
                data_between.append(s.get("totalflux"))
        
        if len(data_between) > 0:
            print(data_between,before_first)
            # 当天只有一条数据记录时，计算好这个数据落在的时间段直接返回
            if data_len == 1:
                return float(before_first)
            # 时间区间内最后一个数据减去 比较值
            return float(data_between[-1]) - float(before_first)

        return '-'
            
            

    # print(datel)
    # print(len(datel))
    ret_data = []
    for i in range(len(datel)-1):
        t1 = datel[i]
        if i == len(datel)-2:
            t2 = "23:59"
        else:
            t2 = datel[i+1]
        ret = get_data_between_time(t1,t2)
        flag = 'valid'
        if ret == '-':
            flag = 'invalid'
        # print(t1,"ret=",ret)
        t2 = datel[i+1]
        ret_data.append({
            "readtime":t2,
            "totalflux":ret,
            "flag":flag
        })

    def update_avg(target,value):
        for s in ret_data:
            if s.get("readtime") in target:
                s["totalflux"] = value

    # 对时间段内没有数据记录的 计算平均值
    flag = 'begin'
    cnt = 1
    tmp = []
    seris_data = []
    for s in ret_data:
        
        if s.get("flag") == 'invalid':
            tmp.append(s.get("readtime"))
            cnt += 1
            flag = 'start'
        
        if s.get("flag") == 'valid' and flag == 'start':
            value = s.get("totalflux")
            avg_value = float(value) / cnt
            print('need update ',tmp)
            print('avg=',avg_value)
            # 它自己因为被平均了，也要换成平均值
            tmp.append(s.get("readtime"))
            # 写入平均值到 ret_data
            update_avg(tmp,avg_value)
            
            flag = 'end'
            cnt = 1
            tmp = []
                
    # 得出无效数据点的位置
    flags = [1 if s.get("flag") == 'valid' else 0 for s in ret_data]
    neg =[]
    shift = 0
    flag = ''
    for i in range(0,len(flags)):
        st = flags[i]
        if st == 0 and flag != 'start':
            flag = 'start'
            shift = i
        if st == 1 and flag == 'start':
            neg.append([shift,i])
            flag = 'restart'

        if i+1 == len(flags) and flag == 'start':
            neg.append([shift,i])
    # valid
    pos =[]
    shift = 0
    flag = ''
    for i in range(0,len(flags)):
        st = flags[i]
        if st == 1 and flag != 'start':
            flag = 'start'
            shift = i
        if st == 0 and flag == 'start':
            pos.append([shift,i])
            flag = 'restart'

        if i+1 == len(flags) and flag == 'start':
            pos.append([shift,i])
    
    def gene_seris(target,st):

        p0 = target[0]
        p1 = target[1]
        tmp = []
        for i in range(len(ret_data)):
            if i>=p0 and i<=p1:
                tmp.append(ret_data[i].get("totalflux"))
            else:
                tmp.append('-')
        return tmp

    pos_data = []
    neg_data = []

    for s in pos:
        pos_data.append(gene_seris(s,1))
    for s in neg:
        neg_data.append(gene_seris(s,0))



    del datel[0]
    result = dict()
    result["rawdata"] = dosage_serializer_data
    result["flowdata"] = ret_data #dosage_serializer_data
    result["pos"] = pos
    result["neg"] = neg
    result["pos_data"] = pos_data
    result["neg_data"] = neg_data
    result["datel"] = datel
    result["success"] = "true"
    
    
    return Response(result)


@api_view(['GET','POST'])
def getWatermeterflow_data(request):
    if request.method == "GET":
        vwaterid = int(request.GET.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        smonth = int(request.GET.get("smonth", None))
        sday = int(request.GET.get("sday", None))
        # vwaterid = request.GET.get("vwaterid")
        

    if request.method == "POST":
        vwaterid = int(request.POST.get("vwaterid", None))
        syear = int(request.POST.get("syear", None))
        smonth = int(request.POST.get("smonth", None))
        sday = int(request.POST.get("sday", None))
        
    # vwaterid=3219
    # smonth=3
    # sday=31
    if vwaterid is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")

    watermeter = Watermeter.objects.get(id=vwaterid)

    qmonth = '{}-{:02d}-{:02d}'.format(syear,smonth,sday)
    print('this water:',watermeter,watermeter.wateraddr,qmonth)
    queryset = HdbWatermeterData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__startswith=qmonth)
        ).distinct().order_by('readtime')
    dosage_serializer_data =  HdbWatermeterRawFlowSerializer(queryset,many=True).data
    print(dosage_serializer_data)

    result = dict()
    result["rawdata"] = dosage_serializer_data
    result["success"] = "true"
    
    
    
    return Response(result)



@api_view(['GET','POST'])
def getWatermeterdaily_data(request):
    '''
    当月每天的第一条数据记录 1
    '''
    if request.method == "GET":
        vwaterid = int(request.GET.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        smonth = int(request.GET.get("smonth", None))
        # sday = int(request.GET.get("sday", None))
        # vwaterid = request.GET.get("vwaterid")
        

    if request.method == "POST":
        vwaterid = int(request.POST.get("vwaterid", None))
        syear = int(request.POST.get("syear", None))
        smonth = int(request.POST.get("smonth", None))
        # sday = int(request.POST.get("sday", None))
        
    # vwaterid=3219
    # smonth=3
    # sday=31
    if vwaterid is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")

    watermeter = Watermeter.objects.get(id=vwaterid)

    qmonth = '{}-{:02d}'.format(syear,smonth)
    print('this water:',watermeter,watermeter.wateraddr,qmonth)
    queryset = HdbWatermeterData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__startswith=qmonth)
        ).distinct().order_by('readtime')
    dosage_serializer_data =  HdbWatermeterRawFlowSerializer(queryset,many=True).data
    # print(dosage_serializer_data)
    if  len(dosage_serializer_data) == 0:
        res = getWatermeterdaily_lora(request._request)
        return res
    

    print("&*^%*(&^&%^&**&")
    day_first = []
    mon_day =[31,28,31,30,31,30,31,31,30,31,30,31]
    day = today.day
    year = today.year
    month = today.month
    if smonth != month:
        if smonth == 2 and ((syear % 4 == 0) and (syear % 100 != 0)) or (syear % 400 == 0):
            day = 29
        else:
            day = mon_day[smonth-1]
                

    datel = []
    for i in range(day):
        s1 = '{}-{:02d}-{:02d}'.format(syear,smonth,i+1)
        
        datel.append(s1)

    def get_t_first(t1):
        for s in dosage_serializer_data:
            if t1 in s.get("readtime"):
                return s
        return None

    # day_first保存的是每天第一条数据记录，如果存在
    for d in datel:
        ret = get_t_first(d)
        if ret is not None:
            day_first.append(ret)

    # Vt2 - Vt1 应该是t2的值减去t1的值即为t1当天的流量,如果t2的流量存在
    # 如果t2的流量不存在，返回-
    def get_data_from_day_first(t1):
        for s in day_first:
            dts = s.get("readtime")[:10]
            if dts == t1:
                vt1 = s.get("totalflux")
                
                return float(vt1)
            
        return '-'
            
            

    # print(datel)
    # print(len(datel))
    # 对时间段内没有数据记录的 计算平均值
    ret_data = []
    # 获取
    start_day = datel[0]
    try:
        query_before_first = HdbWatermeterData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__lte=start_day)
        ).distinct().order_by('readtime').last()
        tmp1 = query_before_first.totalflux
    except Exception as e:
        print(e)
        tmp1 = 0 #被减值 当天不存在，记录上一天（上一条）记录,
    print('tmp1=',tmp1)
    end_day = datel[-1]
    try:
        query_before_first = HdbWatermeterData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__gte=end_day)
        ).distinct().order_by('readtime').first()
        end_value = query_before_first.totalflux
    except Exception as e:
        print(e)
        end_value = '-' #被减值 当天不存在，记录上一天（上一条）记录,
    print('end_value=',end_value)
    tmp_date = []
    record_value = []
    record_date = []
    cnt = 1
    sflag = 'begin'
    for i in range(len(datel)):
        flag = 'invalid'
        t1 = datel[i]
        ret1 = get_data_from_day_first(t1)
        print(i+1,t1,ret1,sflag)
        # 1. 有效值，如果是开始 invalid or valid
        if ret1 != '-' and sflag == 'begin':
            sflag = 'valid'
            tmp1 = float(ret1)
            record_date.append(t1)
            print('\t1.',record_date)

        # 1.1 开始就无效值
        elif ret1 == '-' and sflag == 'begin':
            sflag = 'invalid'
            record_date.append(t1)
            print('\t2.',record_date)

        # 2.有效值开始，直到下一个有效值
        elif ret1 != '-' and sflag == 'valid':
            value = float(ret1) - float(tmp1)
            print('\t3.',record_date)
            if len(record_date) == 1: #下一个就是有效值
                sflag = 'begin'
                flag = 'valid'
                ret_data.append({
                    "readtime":record_date[0],
                    "totalflux":value,
                    "flag":flag
                })
            else:
                flag = 'invalid'
                value = value/len(record_date)
                for s in record_date:
                    ret_data.append({
                        "readtime":s,
                        "totalflux":value,
                        "flag":flag
                    })
            tmp1 = ret1 #记录下这个值，
            
            record_date = []
            record_date.append(t1)
        # 有效值开始，到下一个还是无效值
        elif ret1 == '-' and sflag == 'valid':
            record_date.append(t1)
            print('\t4.',record_date)
            if t1 == end_day:
                if end_value != '-':
                    value = float(end_value) - float(tmp1)
                    avg = value/len(record_date)

                    for s in record_date:
                        ret_data.append({
                            "readtime":s,
                            "totalflux":avg,
                            "flag":'invalid'
                        })
                else:
                    for s in record_date:
                        ret_data.append({
                            "readtime":s,
                            "totalflux":'-',
                            "flag":'invalid'
                        })
        elif ret1 != '-' and sflag == 'invalid':
            # record_date.append(t1)
            sflag = 'valid'
            print('\t tmp1=',tmp1)
            print('\t6.',record_date)
            value = float(ret1) - float(tmp1)
            flag = 'invalid'
            value = value/len(record_date)
            for s in record_date:
                ret_data.append({
                    "readtime":s,
                    "totalflux":value,
                    "flag":flag
                })
            tmp1 = ret1
            record_date = []
            record_date.append(t1)
            print('\t6.1.',record_date)
        # 后面都没有找到有效的数据了
        elif ret1 == '-' and sflag == 'invalid':
            record_date.append(t1)
            print('\t7.',record_date)
            if t1 == end_day:
                if end_value != '-':
                    value = float(end_value) - float(tmp1)
                    avg = value/len(record_date)

                    for s in record_date:
                        ret_data.append({
                            "readtime":s,
                            "totalflux":avg,
                            "flag":'invalid'
                        })
                else:
                    for s in record_date:
                        ret_data.append({
                            "readtime":s,
                            "totalflux":'-',
                            "flag":'invalid'
                        })

    
    
    seris_data = []
    
                
    # 得出无效数据点的位置
    flags = [1 if s.get("flag") == 'valid' else 0 for s in ret_data]
    neg =[]
    shift = 0
    flag = ''
    for i in range(0,len(flags)):
        st = flags[i]
        if st == 0 and flag != 'start':
            flag = 'start'
            shift = i
        if st == 1 and flag == 'start':
            neg.append([shift,i])
            flag = 'restart'

        if i+1 == len(flags) and flag == 'start':
            neg.append([shift,i])
    # valid
    pos =[]
    shift = 0
    flag = ''
    for i in range(0,len(flags)):
        st = flags[i]
        if st == 1 and flag != 'start':
            flag = 'start'
            shift = i
        if st == 0 and flag == 'start':
            pos.append([shift,i])
            flag = 'restart'

        if i+1 == len(flags) and flag == 'start':
            pos.append([shift,i])
    
    def gene_seris(target,st):

        p0 = target[0]
        p1 = target[1]
        tmp = []
        for i in range(len(ret_data)):
            if i>=p0 and i<=p1:
                tmp.append(ret_data[i].get("totalflux"))
            else:
                tmp.append('-')
        return tmp

    pos_data = []
    neg_data = []

    for s in pos:
        pos_data.append(gene_seris(s,1))
    for s in neg:
        neg_data.append(gene_seris(s,0))

    result = dict()
    result["rawdata"] = dosage_serializer_data
    result["day_first"] = day_first
    result["flowdata"] = ret_data #dosage_serializer_data
    result["pos"] = pos
    result["neg"] = neg
    result["pos_data"] = pos_data
    result["neg_data"] = neg_data
    result["datel"] = datel
    result["success"] = "true"
    
    
    
    return Response(result)


@api_view(['GET','POST'])
def getWatermeterdaily(request):
    '''
        vwaterid equal watermeter__id
    '''
    if request.method == "GET":
        vwaterid = int(request.GET.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        smonth = int(request.GET.get("smonth", None))
        # vwaterid = request.GET.get("vwaterid")
        

    if request.method == "POST":
        vwaterid = int(request.POST.get("vwaterid", None))
        syear = int(request.POST.get("syear", None))
        smonth = int(request.POST.get("smonth", None))
        
    # vwaterid=3219
    # smonth=3
    # sday=31
    if vwaterid is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")

    watermeter = Watermeter.objects.get(id=vwaterid)

    qmonth = '{}-{:02d}'.format(syear,smonth)
    print('this water:',watermeter,watermeter.wateraddr,qmonth)
    queryset = HdbWatermeterData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__startswith=qmonth)
        ).distinct().order_by('readtime')
    dosage_serializer_data =  HdbWatermeterFlowSerializer(queryset,many=True).data

    
    # print(dosage_serializer_data)

    # queryset = HdbWatermeterDay.objects.filter(
    #         Q(communityid=watermeter.communityid) &
    #         Q(waterid=watermeter.id) &
    #         Q(hdate__startswith=qmonth)
    #     ).distinct()
    # print(queryset)
    # dosage_serializer_data =  HdbWatermeterDaySerializer(queryset,many=True).data
    mon_day =[31,28,31,30,31,30,31,31,30,31,30,31]
    day = today.day
    year = today.year
    month = today.month
    if smonth != month:
        if smonth == 2 and ((syear % 4 == 0) and (syear % 100 != 0)) or (syear % 400 == 0):
            day = 29
        else:
            day = mon_day[smonth-1]
                

    datel = []
    for i in range(day):
        s1 = '{}-{:02d}-{:02d}'.format(syear,smonth,i+1)
        
        datel.append(s1)

    def get_t_first(t1):
        for s in dosage_serializer_data:
            if t1 in s.get("readtime"):
                return s.get("totalflux")
        return None

    def get_data_between_time(t1,t2):
        dt1 = datetime.datetime.strptime(t1,"%Y-%m-%d") 
        dt2 = datetime.datetime.strptime(t1,"%Y-%m-%d") 
        data_between = []
        data_len = len(dosage_serializer_data)
        sflag = True
        before_first = ''
        for i in range(data_len):
            s = dosage_serializer_data[i]
            
            dts = datetime.datetime.strptime(s.get("readtime")[:10],"%Y-%m-%d") 
            if dts >= dt1 and dts <= dt2:
                # 找到了 记录比较值
                print(s.get("readtime")[0:10],s.get("totalflux"))
                if sflag:
                    sflag = False
                    if i == 0:
                        before_first = dosage_serializer_data[0].get("totalflux")
                    else:
                        before_first = dosage_serializer_data[i-1].get("totalflux")
                    print('before_first',before_first)
                data_between.append(s.get("totalflux"))
        
        if len(data_between) > 0:
            print(data_between,before_first)
            # 当天只有一条数据记录时，计算好这个数据落在的时间段直接返回
            if data_len == 1:
                return float(before_first)
            # 时间区间内最后一个数据减去 比较值
            return float(data_between[-1]) - float(before_first)

        return '-'
            
            

    # print(datel)
    # print(len(datel))
    ret_data = []
    for i in range(len(datel)-1):
        t1 = datel[i]
        t2 = datel[i+1]
        # ret = get_data_between_time(t1,t2)
        d1 = get_t_first(t1)
        d2 = get_t_first(t2)
        flag = 'invalid'
        ret = '-'
        print(d2,d1)
        if d1  and d2 :
            flag = 'valid'
            ret = float(d2) - float(d1)
        # print(t1,"ret=",ret)
        ret_data.append({
            "readtime":t1,
            "totalflux":ret,
            "flag":flag
        })

    print(ret_data)
    def update_avg(target,value):
        for s in ret_data:
            if s.get("readtime") in target:
                s["totalflux"] = value

    # 对时间段内没有数据记录的 计算平均值
    flag = 'begin'
    cnt = 1
    tmp = []
    seris_data = []
    for s in ret_data:
        
        if s.get("flag") == 'invalid':
            tmp.append(s.get("readtime"))
            cnt += 1
            flag = 'start'
        
        if s.get("flag") == 'valid' and flag == 'start':
            value = s.get("totalflux")
            avg_value = float(value) / cnt
            print('need update ',tmp)
            print('avg=',avg_value)
            # 它自己因为被平均了，也要换成平均值
            tmp.append(s.get("readtime"))
            # 写入平均值到 ret_data
            update_avg(tmp,avg_value)
            
            flag = 'end'
            cnt = 1
            tmp = []
                
    # 得出无效数据点的位置
    flags = [1 if s.get("flag") == 'valid' else 0 for s in ret_data]
    neg =[]
    shift = 0
    flag = ''
    for i in range(0,len(flags)):
        st = flags[i]
        if st == 0 and flag != 'start':
            flag = 'start'
            shift = i
        if st == 1 and flag == 'start':
            neg.append([shift,i])
            flag = 'restart'

        if i+1 == len(flags) and flag == 'start':
            neg.append([shift,i])
    # valid
    pos =[]
    shift = 0
    flag = ''
    for i in range(0,len(flags)):
        st = flags[i]
        if st == 1 and flag != 'start':
            flag = 'start'
            shift = i
        if st == 0 and flag == 'start':
            pos.append([shift,i])
            flag = 'restart'

        if i+1 == len(flags) and flag == 'start':
            pos.append([shift,i])
    
    def gene_seris(target,st):

        p0 = target[0]
        p1 = target[1]
        tmp = []
        for i in range(len(ret_data)):
            if i>=p0 and i<=p1:
                tmp.append(ret_data[i].get("totalflux"))
            else:
                tmp.append('-')
        return tmp

    pos_data = []
    neg_data = []

    for s in pos:
        pos_data.append(gene_seris(s,1))
    for s in neg:
        neg_data.append(gene_seris(s,0))



    
    result = dict()
    result["rawdata"] = dosage_serializer_data
    result["flowdata"] = ret_data #dosage_serializer_data
    result["pos"] = pos
    result["neg"] = neg
    result["pos_data"] = pos_data
    result["neg_data"] = neg_data
    result["datel"] = datel
    result["success"] = "true"
    
    
    return Response(result)


@api_view(['GET','POST'])
def getWatermeterdaily_lora(request):
    '''
    当月每天的第一条数据记录 1-2
    '''
    if request.method == "GET":
        vwaterid = int(request.GET.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        smonth = int(request.GET.get("smonth", None))
        # sday = int(request.GET.get("sday", None))
        # vwaterid = request.GET.get("vwaterid")
        

    if request.method == "POST":
        vwaterid = int(request.POST.get("vwaterid", None))
        syear = int(request.POST.get("syear", None))
        smonth = int(request.POST.get("smonth", None))
        # sday = int(request.POST.get("sday", None))
        
    print("vwaterid=",vwaterid," syear=",syear," smonth=",smonth)
    # vwaterid=3219
    # smonth=3
    # sday=31
    if vwaterid is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")

    watermeter = Watermeter.objects.get(id=vwaterid)

    qmonth = '{}-{:02d}'.format(syear,smonth)
    print('this water:',watermeter,watermeter.wateraddr,qmonth)
    queryset = HdbWatermeterDay.objects.filter(
            Q(waterid=vwaterid) &
            # Q(waterid=watermeter.id) &
            Q(hdate__startswith=qmonth)
        ).distinct().order_by('hdate')
    dosage_serializer_data =  HdbWatermeterDaySerializer_Lora(queryset,many=True).data
    print(dosage_serializer_data)
    
    

    print("&*^%*(&^&%^&**&")
    day_first = []
    mon_day =[31,28,31,30,31,30,31,31,30,31,30,31]
    day = today.day
    year = today.year
    month = today.month
    if smonth != month:
        if smonth == 2 and ((syear % 4 == 0) and (syear % 100 != 0)) or (syear % 400 == 0):
            day = 29
        else:
            day = mon_day[smonth-1]
                

    datel = []
    for i in range(day):
        s1 = '{}-{:02d}-{:02d}'.format(syear,smonth,i+1)
        
        datel.append(s1)

    def get_data_between_time(t1,t2):
        dt1 = datetime.datetime.strptime(t1,"%Y-%m-%d") 
        dt2 = datetime.datetime.strptime(t2,"%Y-%m-%d") 
        data_between = []
        data_len = len(dosage_serializer_data)
        sflag = True
        before_first = ''
        for i in range(data_len):
            s = dosage_serializer_data[i]
            # print(s.get("readtime")[11:16],s.get("totalflux"))
            dts = datetime.datetime.strptime(s.get("readtime"),"%Y-%m-%d") 
            if dts > dt1 and dts <= dt2:
                # 找到了 记录比较值
                
                if sflag:
                    sflag = False
                    if i == 0:
                        before_first = dosage_serializer_data[0].get("totalflux")
                    else:
                        before_first = dosage_serializer_data[i-1].get("totalflux")
                    print('before_first',before_first)
                data_between.append(s.get("totalflux"))
        
        if len(data_between) > 0:
            print(data_between,before_first)
            # 当天只有一条数据记录时，计算好这个数据落在的时间段直接返回
            if data_len == 1:
                return float(before_first)
            # 时间区间内最后一个数据减去 比较值
            return float(data_between[-1]) - float(before_first)

        return '-'
            
    
    tmplist = [s.get("readtime") for s in dosage_serializer_data]
    print("tmplist:",tmplist)

    def get_data(t1):
        for s in dosage_serializer_data:
            # print(t1,)
            if s.get("readtime") == t1:
                return 'valid',s.get("totalflux")
        return "invalid","-"

    # print(datel)
    # print(len(datel))
    ret_data = []
    for i in range(len(datel)):
        t1 = datel[i]
        # print(t1)
        flag,ret = get_data(t1)
        
        ret_data.append({
            "readtime":t1,
            "totalflux":ret,
            "flag":flag
        })

    def update_avg(target,value):
        for s in ret_data:
            if s.get("readtime") in target:
                s["totalflux"] = value

    # 对时间段内没有数据记录的 计算平均值
    flag = 'begin'
    cnt = 1
    tmp = []
    seris_data = []
    for s in ret_data:
        
        if s.get("flag") == 'invalid':
            tmp.append(s.get("readtime"))
            cnt += 1
            flag = 'start'
        
        if s.get("flag") == 'valid' and flag == 'start':
            value = s.get("totalflux")
            avg_value = float(value) / cnt
            print('need update ',tmp)
            print('avg=',avg_value)
            # 它自己因为被平均了，也要换成平均值
            tmp.append(s.get("readtime"))
            # 写入平均值到 ret_data
            update_avg(tmp,avg_value)
            
            flag = 'end'
            cnt = 1
            tmp = []
                
    # 得出无效数据点的位置
    flags = [1 if s.get("flag") == 'valid' else 0 for s in ret_data]
    neg =[]
    shift = 0
    flag = ''
    for i in range(0,len(flags)):
        st = flags[i]
        if st == 0 and flag != 'start':
            flag = 'start'
            shift = i
        if st == 1 and flag == 'start':
            neg.append([shift,i])
            flag = 'restart'

        if i+1 == len(flags) and flag == 'start':
            neg.append([shift,i])
    # valid
    pos =[]
    shift = 0
    flag = ''
    for i in range(0,len(flags)):
        st = flags[i]
        if st == 1 and flag != 'start':
            flag = 'start'
            shift = i
        if st == 0 and flag == 'start':
            pos.append([shift,i])
            flag = 'restart'

        if i+1 == len(flags) and flag == 'start':
            pos.append([shift,i])
    
    def gene_seris(target,st):

        p0 = target[0]
        p1 = target[1]
        tmp = []
        for i in range(len(ret_data)):
            if i>=p0 and i<=p1:
                tmp.append(ret_data[i].get("totalflux"))
            else:
                tmp.append('-')
        return tmp

    pos_data = []
    neg_data = []

    for s in pos:
        pos_data.append(gene_seris(s,1))
    for s in neg:
        neg_data.append(gene_seris(s,0))

    result = dict()
    result["rawdata"] = dosage_serializer_data
    result["day_first"] = day_first
    result["flowdata"] = ret_data #dosage_serializer_data
    result["pos"] = pos
    result["neg"] = neg
    result["pos_data"] = pos_data
    result["neg_data"] = neg_data
    result["datel"] = datel
    result["success"] = "true"
    
    
    
    return Response(result)


@api_view(['GET','POST'])
def getWatermeterMonth_data(request):
    '''
    当月每天的第一条数据记录
    '''
    if request.method == "GET":
        vwaterid = int(request.GET.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        # smonth = int(request.GET.get("smonth", None))
        # sday = int(request.GET.get("sday", None))
        # vwaterid = request.GET.get("vwaterid")
        

    if request.method == "POST":
        vwaterid = int(request.POST.get("vwaterid", None))
        syear = int(request.POST.get("syear", None))
        # smonth = int(request.POST.get("smonth", None))
        # sday = int(request.POST.get("sday", None))
        
    # vwaterid=3219
    # smonth=3
    # sday=31
    if vwaterid is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")

    watermeter = Watermeter.objects.get(id=vwaterid)

    # qmonth = '{}-{:02d}'.format(syear,smonth)
    # print('this water:',watermeter,watermeter.wateraddr,qmonth)
    queryset = HdbWatermeterData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__startswith=syear)
        ).distinct().order_by('readtime')
    dosage_serializer_data =  HdbWatermeterRawFlowSerializer(queryset,many=True).data
    print(dosage_serializer_data)

    if len(dosage_serializer_data) == 0:
        return getWatermeterMonth_lora(request._request)

    day_first = []
    

    datel = []
    for i in range(12):
        s1 = '{}-{:02d}'.format(syear,i+1)
        
        datel.append(s1)

    def get_t_first(t1):
        for s in dosage_serializer_data:
            if t1 in s.get("readtime"):
                return s
        return None

    for d in datel:
        ret = get_t_first(d)
        if ret is not None:
            day_first.append(ret)
    # day_first 每个月的第一天的数据列表，每个月的流量=下个月第一条减去这个月第一条

    
    # Vt2 - Vt1 应该是t2的值减去t1的值即为t1当天的流量,如果t2的流量存在
    # 如果t2的流量不存在，返回-
    def get_data_from_day_first(t1):
        for s in day_first:
            dts = s.get("readtime")[:7]
            if dts == t1:
                vt1 = s.get("totalflux")
                
                return float(vt1)
            
        return '-'
            
            

    # print(datel)
    # print(len(datel))
    # 对时间段内没有数据记录的 计算平均值
    ret_data = []
    # 获取
    start_day = datel[0]
    try:
        query_before_first = HdbWatermeterData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__lte=start_day)
        ).distinct().order_by('readtime').last()
        tmp1 = query_before_first.totalflux
    except Exception as e:
        print(e)
        tmp1 = 0 #被减值 当天不存在，记录上一天（上一条）记录,
    print('tmp1=',tmp1)
    end_day = datel[-1]
    try:
        query_before_first = HdbWatermeterData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__gte=end_day)
        ).distinct().order_by('readtime').first()
        end_value = query_before_first.totalflux
    except Exception as e:
        print(e)
        end_value = '-' #被减值 当天不存在，记录上一天（上一条）记录,
    print('end_value=',end_value)
    tmp_date = []
    record_value = []
    record_date = []
    cnt = 1
    sflag = 'begin'
    for i in range(len(datel)):
        flag = 'invalid'
        t1 = datel[i]
        ret1 = get_data_from_day_first(t1)
        print(i+1,t1,ret1,sflag)
        # 1. 有效值，如果是开始 invalid or valid
        if ret1 != '-' and sflag == 'begin':
            sflag = 'valid'
            tmp1 = float(ret1)
            record_date.append(t1)
            print('\t1.',record_date)

        # 1.1 开始就无效值
        elif ret1 == '-' and sflag == 'begin':
            sflag = 'invalid'
            record_date.append(t1)
            print('\t2.',record_date)

        # 2.有效值开始，直到下一个有效值
        elif ret1 != '-' and sflag == 'valid':
            value = float(ret1) - float(tmp1)
            print('\t3.',record_date)
            if len(record_date) == 1: #下一个就是有效值
                sflag = 'begin'
                flag = 'valid'
                ret_data.append({
                    "readtime":record_date[0],
                    "totalflux":value,
                    "flag":flag
                })
            else:
                flag = 'invalid'
                value = value/len(record_date)
                for s in record_date:
                    ret_data.append({
                        "readtime":s,
                        "totalflux":value,
                        "flag":flag
                    })
            tmp1 = ret1 #记录下这个值，
            
            record_date = []
            record_date.append(t1)
        # 有效值开始，到下一个还是无效值
        elif ret1 == '-' and sflag == 'valid':
            record_date.append(t1)
            print('\t4.',record_date)
            if t1 == end_day:
                if end_value != '-':
                    value = float(end_value) - float(tmp1)
                    avg = value/len(record_date)

                    for s in record_date:
                        ret_data.append({
                            "readtime":s,
                            "totalflux":avg,
                            "flag":'invalid'
                        })
                else:
                    for s in record_date:
                        ret_data.append({
                            "readtime":s,
                            "totalflux":'-',
                            "flag":'invalid'
                        })
        elif ret1 != '-' and sflag == 'invalid':
            # record_date.append(t1)
            sflag = 'valid'
            print('\t tmp1=',tmp1)
            print('\t6.',record_date)
            value = float(ret1) - float(tmp1)
            flag = 'invalid'
            value = value/len(record_date)
            for s in record_date:
                ret_data.append({
                    "readtime":s,
                    "totalflux":value,
                    "flag":flag
                })
            tmp1 = ret1
            record_date = []
            record_date.append(t1)
            print('\t6.1.',record_date)
        # 后面都没有找到有效的数据了
        elif ret1 == '-' and sflag == 'invalid':
            record_date.append(t1)
            print('\t7.',record_date)
            if t1 == end_day:
                if end_value != '-':
                    value = float(end_value) - float(tmp1)
                    avg = value/len(record_date)

                    for s in record_date:
                        ret_data.append({
                            "readtime":s,
                            "totalflux":avg,
                            "flag":'invalid'
                        })
                else:
                    for s in record_date:
                        ret_data.append({
                            "readtime":s,
                            "totalflux":'-',
                            "flag":'invalid'
                        })

    
    
    seris_data = []
                
    # 得出无效数据点的位置
    flags = [1 if s.get("flag") == 'valid' else 0 for s in ret_data]
    neg =[]
    shift = 0
    flag = ''
    for i in range(0,len(flags)):
        st = flags[i]
        if st == 0 and flag != 'start':
            flag = 'start'
            shift = i
        if st == 1 and flag == 'start':
            neg.append([shift,i])
            flag = 'restart'

        if i+1 == len(flags) and flag == 'start':
            neg.append([shift,i])
    # valid
    pos =[]
    shift = 0
    flag = ''
    for i in range(0,len(flags)):
        st = flags[i]
        if st == 1 and flag != 'start':
            flag = 'start'
            shift = i
        if st == 0 and flag == 'start':
            pos.append([shift,i])
            flag = 'restart'

        if i+1 == len(flags) and flag == 'start':
            pos.append([shift,i])
    
    def gene_seris(target,st):

        p0 = target[0]
        p1 = target[1]
        tmp = []
        for i in range(len(ret_data)):
            if i>=p0 and i<=p1:
                tmp.append(ret_data[i].get("totalflux"))
            else:
                tmp.append('-')
        return tmp

    pos_data = []
    neg_data = []

    for s in pos:
        pos_data.append(gene_seris(s,1))
    for s in neg:
        neg_data.append(gene_seris(s,0))

    result = dict()
    result["rawdata"] = dosage_serializer_data
    result["day_first"] = day_first
    result["flowdata"] = ret_data #dosage_serializer_data
    result["pos"] = pos
    result["neg"] = neg
    result["pos_data"] = pos_data
    result["neg_data"] = neg_data
    result["datel"] = datel
    result["success"] = "true"
    
    
    
    return Response(result)

@api_view(['GET','POST'])
def getWatermeterMonth(request):
    '''
        vwaterid equal watermeter__id
    '''
    if request.method == "GET":
        vwaterid = int(request.GET.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        

    if request.method == "POST":
        vwaterid = int(request.POST.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        
    if vwaterid is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    

    watermeter = Watermeter.objects.get(id=vwaterid)

   
    queryset = HdbWatermeterMonth.objects.filter(
            Q(communityid=watermeter.communityid) &
            Q(waterid=watermeter.id) &
            Q(hdate__startswith=syear)
        ).distinct()
    
    dosage_serializer =  HdbWatermeterMonthSerializer(queryset,many=True)

    

    result = dict()
    result["monthlydata"] = dosage_serializer.data
    result["success"] = "true"
    
    
    return Response(result)



@api_view(['GET','POST'])
def getWatermeterMonth_lora(request):
    '''
    当月每天的第一条数据记录 1-2
    '''
    if request.method == "GET":
        vwaterid = int(request.GET.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        # smonth = int(request.GET.get("smonth", None))
        # sday = int(request.GET.get("sday", None))
        # vwaterid = request.GET.get("vwaterid")
        

    if request.method == "POST":
        vwaterid = int(request.POST.get("vwaterid", None))
        syear = int(request.POST.get("syear", None))
        # smonth = int(request.POST.get("smonth", None))
        # sday = int(request.POST.get("sday", None))
        
    # vwaterid=3219
    # smonth=3
    # sday=31
    if vwaterid is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")

    watermeter = Watermeter.objects.get(id=vwaterid)

    # qmonth = '{}-{:02d}'.format(syear,smonth)
    queryset = HdbWatermeterMonth.objects.filter(
            Q(waterid=vwaterid) &
            # Q(waterid=watermeter.id) &
            Q(hdate__startswith=syear)
        ).distinct().order_by('hdate')
    dosage_serializer_data =  HdbWatermeterMonthSerializer_Lora(queryset,many=True).data
    print(dosage_serializer_data)
    
    

    datel = []
    for i in range(12):
        s1 = '{}-{:02d}'.format(syear,i+1)
        
        datel.append(s1)

    

    def get_data(t1):
        for s in dosage_serializer_data:
            # print(t1,)
            if s.get("readtime") == t1:
                return 'valid',s.get("totalflux")
        return "invalid","-"

    # print(datel)
    # print(len(datel))
    ret_data = []
    for i in range(len(datel)):
        t1 = datel[i]
        # print(t1)
        flag,ret = get_data(t1)
        
        ret_data.append({
            "readtime":t1,
            "totalflux":ret,
            "flag":flag
        })

    def update_avg(target,value):
        for s in ret_data:
            if s.get("readtime") in target:
                s["totalflux"] = value

    # 对时间段内没有数据记录的 计算平均值
    flag = 'begin'
    cnt = 1
    tmp = []
    seris_data = []
    for s in ret_data:
        
        if s.get("flag") == 'invalid':
            tmp.append(s.get("readtime"))
            cnt += 1
            flag = 'start'
        
        if s.get("flag") == 'valid' and flag == 'start':
            value = s.get("totalflux")
            avg_value = float(value) / cnt
            print('need update ',tmp)
            print('avg=',avg_value)
            # 它自己因为被平均了，也要换成平均值
            tmp.append(s.get("readtime"))
            # 写入平均值到 ret_data
            update_avg(tmp,avg_value)
            
            flag = 'end'
            cnt = 1
            tmp = []
                
    # 得出无效数据点的位置
    flags = [1 if s.get("flag") == 'valid' else 0 for s in ret_data]
    neg =[]
    shift = 0
    flag = ''
    for i in range(0,len(flags)):
        st = flags[i]
        if st == 0 and flag != 'start':
            flag = 'start'
            shift = i
        if st == 1 and flag == 'start':
            neg.append([shift,i])
            flag = 'restart'

        if i+1 == len(flags) and flag == 'start':
            neg.append([shift,i])
    # valid
    pos =[]
    shift = 0
    flag = ''
    for i in range(0,len(flags)):
        st = flags[i]
        if st == 1 and flag != 'start':
            flag = 'start'
            shift = i
        if st == 0 and flag == 'start':
            pos.append([shift,i])
            flag = 'restart'

        if i+1 == len(flags) and flag == 'start':
            pos.append([shift,i])
    
    def gene_seris(target,st):

        p0 = target[0]
        p1 = target[1]
        tmp = []
        for i in range(len(ret_data)):
            if i>=p0 and i<=p1:
                tmp.append(ret_data[i].get("totalflux"))
            else:
                tmp.append('-')
        return tmp

    pos_data = []
    neg_data = []

    for s in pos:
        pos_data.append(gene_seris(s,1))
    for s in neg:
        neg_data.append(gene_seris(s,0))

    result = dict()
    result["rawdata"] = dosage_serializer_data
    result["day_first"] = []
    result["flowdata"] = ret_data #dosage_serializer_data
    result["pos"] = pos
    result["neg"] = neg
    result["pos_data"] = pos_data
    result["neg_data"] = neg_data
    result["datel"] = datel
    result["success"] = "true"
    
    
    
    return Response(result)



@api_view(['GET','POST'])
def neiborhooddailydata(request):
    '''
        无线抄表 日用水查询，查询小区某月每日用水量
    '''
    
    communityid = request.GET.get("communityid") #communityid is VCommunity's id
    # sTime = request.GET.get("sTime")[:10]
    # eTIme = request.GET.get("eTime")[:10]
    month = request.GET.get("month")
    flag = request.GET.get("flag")
    # print(sTime,eTIme)

    today = datetime.datetime.today()
    if month is None or month == '':
        month = today.strftime("%Y-%m")

    if flag == "-1":    #上月
        last_month = datetime.date.today().replace(day=1) - datetime.timedelta(days=1)
        mon_str = last_month.strftime("%Y-%m")
    elif flag == "0":
        mon_str = today.strftime("%Y-%m")
    else:
        mon_str = month
        
    queryset = HdbWatermeterDay.objects.filter(
                Q(communityid=communityid) &
                Q(hdate__startswith=month)
            ).distinct()
    dosage_serializer_data =  HdbWatermeterDaySerializer(queryset,many=True).data
    
    dailydata = {}
    for d in dosage_serializer_data:
        day = d["hdate"]
        if d["dosage"] is None:
            dosage = 0
        else:
            dosage = round(float(d["dosage"]),2)
        if day not in dailydata.keys():
            dailydata[day] = round(float(dosage),2)
        else:
            dailydata[day] += round(float(dosage),2)

    return Response({"success":1,"monthdata":dailydata})



@api_view(['GET','POST'])
def neiborhoodmonthdata(request):
    # print(request.GET)
    communityid = request.GET.get("communityid") #communityid is VCommunity's id
    sMonth = request.GET.get("sMonth")
    eMonth = request.GET.get("eMonth")
    
    queryset = HdbWatermeterMonth.objects.filter(
                Q(communityid=communityid) &
                Q(hdate__range=[sMonth,eMonth])
            ).distinct()
    dosage_serializer_data = HdbWatermeterMonthSerializer(queryset,many=True).data
    monthdata = {}
    for d in dosage_serializer_data:
        day = d["hdate"]
        if d["dosage"] is None:
            dosage = 0
        else:
            dosage = round(float(d["dosage"]),2)
        if day not in monthdata.keys():
            monthdata[day] = round(float(dosage),2)
        else:
            monthdata[day] += round(float(dosage),2)

    return Response({"success":1,"monthdata":monthdata})


@api_view(['GET','POST'])
def getconcentratormaplist(request):
    '''
        无线抄表 抄表地图
    '''
    print('getconcentratormaplist:',request.POST) 

    groupName = request.POST.get("groupName") or ''
    user = request.user
    organs = user.belongto
    print(organs,type(organs))
    if groupName == '':
        selectedgroup = Organization.objects.filter(cid=organs.cid).values().first()
    else:
        selectedgroup = Organization.objects.filter(cid=groupName).values().first()

    concentrators = user.belongto.concentrator_list_queryset('') 
    concentrators = concentrators.exclude(amrs_concentrator__lng__isnull=True)

    
    if groupName != "":
        concentrators = concentrators.filter(belongto__cid=groupName)

    concentrator_lists = [s.amrs_concentrator for s in concentrators]

    
    serializer_data = MapConcentratorSerializer(concentrator_lists,many=True).data
    
    

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


class WStasticsListAPIView(ListAPIView):
    """
        户表管理 数据统计
    """
    # queryset = MyRoles.objects.all()
    serializer_class = WStatsticsSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    # search_fields = ['simcardNumber', 'imei']
    # pagination_class = DataTablePageNumberPagination #PageNumberPagination

    def get_queryset(self, *args, **kwargs):
        #queryset_list = super(PostListAPIView, self).get_queryset(*args, **kwargs)
        wateraddr = self.request.GET.get("wateraddr")
        

        queryset_list = Watermeter.objects.all()
        
        
        return queryset_list
