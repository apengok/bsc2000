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
import datetime

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
    HdbFlowData,
    HdbFlowDataHour,
    HdbFlowDataDay,
    HdbFlowDataMonth,
    HdbPressureData,
)
# from .pagination import PostLimitOffsetPagination, PostPageNumberPagination
# from .permissions import IsOwnerOrReadOnly

from .serializers import (
    # PostCreateUpdateSerializer, 
    StationListSerializer, 
    create_BigmeterRTSerializer,
    MapStationSerializer,
    MapSecondWaterSerializer,
    BigmeterPushDataSerializer,
    ChangshaPushDataSerializer,
    BigmeterRTShowinfoSerializer,
    )

from amrs.serializers import (
    HdbFlowDataSerializer,
    HdbFlowDataHourSerializer,
    HdbFlowDataDaySerializer,
    HdbFlowDataMonthSerializer,
    HdbFlowDataInstanceSerializer,
    HdbPressureDataSerializer,
)
import logging
import logging.handlers

# logging.getLogger('apscheduler').setLevel(logging.WARNING)

class BigmeterRTListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    # serializer_class = BigmeterRTSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    # ordering_fields = ['fluxreadtime']
    # ordering = ['-fluxreadtime']
    # search_fields = ['simcardNumber', 'imei']
    # pagination_class = PostPageNumberPagination #PageNumberPagination

    def get_serializer_class(self):
        sTime = self.request.GET.get("sTime")
        eTime = self.request.GET.get("eTime")

        return create_BigmeterRTSerializer(sTime,eTime)

    def get_queryset(self, *args, **kwargs):
        t1 =time.time()

        groupName = self.request.GET.get("groupName")
        groupType = self.request.GET.get("groupType")
        districtId = self.request.GET.get("districtId")
        selectCommunity = self.request.GET.get("selectCommunity")
        selectBuilding = self.request.GET.get("selectBuilding")
        selectTreeType = self.request.GET.get("selectTreeType")
        simpleQueryParam = self.request.GET.get("simpleQueryParam")

        order_column = self.request.GET.get('order[0][column]')
        order_dir = self.request.GET.get('order[0][dir]')

        colo = self.request.GET.get('columns[%s][data]'%order_column) or 'none'
        #print(order_column,order_dir,colo)

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

        if colo == 'none':
            queryset_list = sorted(queryset_list, key=lambda x: x.fluxreadtime if x.fluxreadtime else '') #works fine
            queryset_list = queryset_list[::-1]
        elif colo in [ 'flux','plustotalflux','reversetotalflux']:
            try:
                queryset_list = sorted(queryset_list, key=lambda x: float(getattr(x,colo)) if getattr(x,colo) else 0)
            except:
                queryset_list = sorted(queryset_list, key=lambda x: getattr(x,colo) if getattr(x,colo) else '')

        else:
            
            queryset_list = sorted(queryset_list, key=lambda x: getattr(x,colo) if getattr(x,colo) else '')
        
        if order_dir != 'asc':
            queryset_list = queryset_list[::-1]
        
        # #print('time elapse:',time.time()-t1)
        
        return queryset_list


@api_view(['GET','POST'])
def getmapstationlist(request):

    groupName = request.GET.get("groupName") or ''
    user = request.user
    organs = user.belongto
    #print(organs,type(organs))
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
    #print(organs,type(organs))
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
    # #print(request.data)
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

@api_view(['GET','POST'])
def PostMDataList(request):
    
    #print(request.data)
    
    ret = {
        "Code":"0000",
        "info": "设备及数据全部成功插入",
        "errMsg":""
    }
    return Response(ret)


@api_view(['GET','POST'])
def PostMData_yuangu_test(request):
    belongto = Organization.objects.get(name='六合远古')

    queryset = belongto.station_list_queryset('')
    queryset_list = [s.amrs_bigmeter for s in queryset]
    extra_names = ["zxll","ssll","fxll","yl","jbdl","ycdl","xhqd","zt"]
    extra_dbnames = ['plustotalflux','flux','reversetotalflux','pressure','meterv','gprsv','signlen','commstate']
    push_data = []

    serializer_data = BigmeterPushDataSerializer(queryset_list,many=True).data
    for sd in serializer_data:
        DeviceID = sd.get("serialnumber")
        DeviceName = sd.get("username")
        pt = sd.get("fluxreadtime","1970-01-01 00:00:00")
        for i in range(len(extra_names)):
            # #print(extra_dbnames[i],':',sd.get(extra_dbnames[i]))
            pv = sd.get(extra_dbnames[i])
            push_data.append({
                "DeviceID":DeviceID + '-' + extra_names[i],
                "DeviceName":DeviceName,
                "RealData":{
                    "PT":pt if pt else '1970-01-01 00:00:00',
                    "PV":pv if pv else '0.0'
                },
                "HistoryData":[]
            })

    # #print(type(serializer_data))
    
    return Response(push_data)

@api_view(['GET','POST'])
def PostMData(request):
    belongto = Organization.objects.get(name='六合远古')

    queryset = belongto.station_list_queryset('')
    queryset_list = [s.amrs_bigmeter for s in queryset]
    extra_names = ["zxll","ssll","fxll","yl","jbdl","ycdl","xhqd","zt"]
    extra_dbnames = ['plustotalflux','flux','reversetotalflux','pressure','meterv','gprsv','signlen','commstate']
    push_data = []

    serializer_data = ChangshaPushDataSerializer(queryset_list,many=True).data
    
    return Response(serializer_data)

from .serializers import OrganizationWholeSerializer
@api_view(['GET','POST'])
def syncdata_bybelongto(request):
    belongto = Organization.objects.get(pk=17)
    querylist = belongto.sub_organizations(include_self=True)
    serializer_data = OrganizationWholeSerializer(querylist,many=True).data
    
    ret = {
        "belongtos":serializer_data
    }
    return Response(ret)

@api_view(['GET','POST'])
def showinfoStatics(request):
    '''
        realtime-showinfo.js 通过站点名显示表信息
    '''
    commaddr = request.GET.get("commaddr", None)
    #print("commaddr=",commaddr)        
    if commaddr is None:
        return ResourceWarning({"success":"true","records":[]})

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")
    watermeter = Bigmeter.objects.get(commaddr=commaddr)
    meter_serializer_data = BigmeterRTShowinfoSerializer(watermeter).data

    
    
    result = dict()
    result["obj"] = meter_serializer_data
    result["success"] = "true"
    
    
    
    return Response(result)



@api_view(['GET','POST'])
def getWatermeterflow(request):
    
    '''
        commaddr equal watermeter__id
    '''
    if request.method == "GET":
        commaddr = request.GET.get("commaddr", None)
        syear = int(request.GET.get("syear", None))
        smonth = int(request.GET.get("smonth", None))
        sday = int(request.GET.get("sday", None))
        

    if request.method == "POST":
        commaddr = int(request.POST.get("commaddr", None))
        syear = int(request.POST.get("syear", None))
        smonth = int(request.POST.get("smonth", None))
        sday = int(request.POST.get("sday", None))
        
    # commaddr=3219
    # smonth=3
    # sday=31
    if commaddr is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")

    # watermeter = Bigmeter.objects.get(id=commaddr)

    qmonth = '{}-{:02d}-{:02d}'.format(syear,smonth,sday)
    queryset = HdbFlowData.objects.filter(
            Q(commaddr=commaddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__startswith=qmonth)
        ).distinct().order_by('readtime')
    dosage_serializer_data =  HdbFlowDataSerializer(queryset,many=True).data
    #print(dosage_serializer_data)

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
            # #print(s.get("readtime")[11:16],s.get("totalflux"))
            dts = datetime.datetime.strptime(s.get("readtime")[11:16],"%H:%M") 
            if dts > dt1 and dts <= dt2:
                # 找到了 记录比较值
                
                if sflag:
                    sflag = False
                    if i == 0:
                        before_first = dosage_serializer_data[0].get("totalflux")
                    else:
                        before_first = dosage_serializer_data[i-1].get("totalflux")
                    #print('before_first',before_first)
                data_between.append(s.get("totalflux"))
        
        if len(data_between) > 0:
            #print(data_between,before_first)
            # 当天只有一条数据记录时，计算好这个数据落在的时间段直接返回
            if data_len == 1:
                return float(before_first)
            # 时间区间内最后一个数据减去 比较值
            return float(data_between[-1]) - float(before_first)

        return '-'
            
            

    # #print(datel)
    # #print(len(datel))
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
        # #print(t1,"ret=",ret)
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
            #print('need update ',tmp)
            #print('avg=',avg_value)
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
def getinstanceflow_data(request):
    if request.method == "GET":
        commaddr = request.GET.get("commaddr", None)
        stime = request.GET.get("stime", None)
        etime = request.GET.get("etime", None)
        
        

    if request.method == "POST":
        commaddr = int(request.POST.get("commaddr", None))
        stime = request.POST.get("stime", None)
        etime = request.POST.get("etime", None)
        
        
    # commaddr=3219
    # smonth=3
    # sday=31
    if commaddr is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    
    queryset = HdbFlowData.objects.filter(
            Q(commaddr=commaddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__range=[stime,etime])
        ).distinct().order_by('readtime')
    queryset = queryset.exclude(flux__isnull=True)
    dosage_serializer_data =  HdbFlowDataInstanceSerializer(queryset,many=True).data
    # #print(dosage_serializer_data)

    result = dict()
    result["rawdata"] = dosage_serializer_data
    result["success"] = "true"
    
    
    
    return Response(result)

@api_view(['GET','POST'])
def getinstanceflow(request):
    if request.method == "GET":
        commaddr = request.GET.get("commaddr", None)
        stime = request.GET.get("stime", None)
        etime = request.GET.get("etime", None)
        
        

    if request.method == "POST":
        commaddr = request.POST.get("commaddr", None)
        stime = request.POST.get("stime", None)
        etime = request.POST.get("etime", None)
        
    if commaddr is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    
    # qmonth = '{}-{:02d}-{:02d}'.format(syear,smonth,sday)
    queryset = HdbFlowData.objects.filter(
            Q(commaddr=commaddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__range=[stime,etime])
        ).distinct().order_by('readtime')
    # queryset = queryset.exclude(flux__isnull=True)
    #print('shit...')
    dosage_serializer_data =  HdbFlowDataInstanceSerializer(queryset,many=True).data
    # #print(dosage_serializer_data)
    # pressure 
    queryset_pressure = HdbPressureData.objects.filter(
            Q(commaddr=commaddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__range=[stime,etime])
        ).distinct().order_by('readtime')
    press_data = HdbPressureDataSerializer(queryset_pressure,many=True).data

    result = dict()
    result["rawdata"] = dosage_serializer_data
    result["pressdata"] = press_data
    result["success"] = "true"
    
    
    
    return Response(result)


@api_view(['GET','POST'])
def getWatermeterflow_data(request):
    if request.method == "GET":
        commaddr = request.GET.get("commaddr", None)
        syear = int(request.GET.get("syear", None))
        smonth = int(request.GET.get("smonth", None))
        sday = int(request.GET.get("sday", None))
        # commaddr = request.GET.get("commaddr")
        

    if request.method == "POST":
        commaddr = request.POST.get("commaddr", None)
        syear = int(request.POST.get("syear", None))
        smonth = int(request.POST.get("smonth", None))
        sday = int(request.POST.get("sday", None))
        
    # commaddr=3219
    # smonth=3
    # sday=31
    if commaddr is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")

    # watermeter = Watermeter.objects.get(id=commaddr)

    qmonth = '{}-{:02d}-{:02d}'.format(syear,smonth,sday)
    queryset = HdbFlowData.objects.filter(
            Q(commaddr=commaddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__startswith=qmonth)
        ).distinct().order_by('readtime')
    dosage_serializer_data =  HdbFlowDataSerializer(queryset,many=True).data
    #print(dosage_serializer_data)

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
        commaddr = request.GET.get("commaddr", None)
        syear = int(request.GET.get("syear", None))
        smonth = int(request.GET.get("smonth", None))
        # sday = int(request.GET.get("sday", None))
        # commaddr = request.GET.get("commaddr")
        

    if request.method == "POST":
        commaddr = int(request.POST.get("commaddr", None))
        syear = int(request.POST.get("syear", None))
        smonth = int(request.POST.get("smonth", None))
        # sday = int(request.POST.get("sday", None))
        
    # commaddr=3219
    # smonth=3
    # sday=31
    if commaddr is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")



    qmonth = '{}-{:02d}'.format(syear,smonth)
    queryset = HdbFlowData.objects.filter(
            Q(commaddr=commaddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__startswith=qmonth)
        ).distinct().order_by('readtime')
    dosage_serializer_data =  HdbFlowDataSerializer(queryset,many=True).data
    
    

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
            
            

    # #print(datel)
    # #print(len(datel))
    # 对时间段内没有数据记录的 计算平均值
    ret_data = []
    # 获取
    start_day = datel[0]
    try:
        query_before_first = HdbFlowData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__lte=start_day)
        ).distinct().order_by('readtime').last()
        tmp1 = query_before_first.totalflux
    except Exception as e:
        #print(e)
        tmp1 = 0 #被减值 当天不存在，记录上一天（上一条）记录,
    #print('tmp1=',tmp1)
    end_day = datel[-1]
    try:
        query_before_first = HdbFlowData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__gte=end_day)
        ).distinct().order_by('readtime').first()
        end_value = query_before_first.totalflux
    except Exception as e:
        #print(e)
        end_value = '-' #被减值 当天不存在，记录上一天（上一条）记录,
    #print('end_value=',end_value)
    tmp_date = []
    record_value = []
    record_date = []
    cnt = 1
    sflag = 'begin'
    for i in range(len(datel)):
        flag = 'invalid'
        t1 = datel[i]
        ret1 = get_data_from_day_first(t1)
        #print(i+1,t1,ret1,sflag)
        # 1. 有效值，如果是开始 invalid or valid
        if ret1 != '-' and sflag == 'begin':
            sflag = 'valid'
            tmp1 = float(ret1)
            record_date.append(t1)
            #print('\t1.',record_date)

        # 1.1 开始就无效值
        elif ret1 == '-' and sflag == 'begin':
            sflag = 'invalid'
            record_date.append(t1)
            #print('\t2.',record_date)

        # 2.有效值开始，直到下一个有效值
        elif ret1 != '-' and sflag == 'valid':
            value = float(ret1) - float(tmp1)
            #print('\t3.',record_date)
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
            #print('\t4.',record_date)
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
            #print('\t tmp1=',tmp1)
            #print('\t6.',record_date)
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
            #print('\t6.1.',record_date)
        # 后面都没有找到有效的数据了
        elif ret1 == '-' and sflag == 'invalid':
            record_date.append(t1)
            #print('\t7.',record_date)
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
        commaddr equal watermeter__id
    '''
    if request.method == "GET":
        commaddr = request.GET.get("commaddr", None)
        syear = int(request.GET.get("syear", None))
        smonth = int(request.GET.get("smonth", None))
        

    if request.method == "POST":
        commaddr = int(request.POST.get("commaddr", None))
        syear = int(request.POST.get("syear", None))
        smonth = int(request.POST.get("smonth", None))
        
    # commaddr=3219
    # smonth=3
    # sday=31
    if commaddr is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")


    qmonth = '{}-{:02d}'.format(syear,smonth)
    
    queryset = HdbFlowData.objects.filter(
            Q(commaddr=commaddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__startswith=qmonth)
        ).distinct().order_by('readtime')
    dosage_serializer_data =  HdbFlowDataSerializer(queryset,many=True).data

    
    # #print(dosage_serializer_data)

    # queryset = HdbWatermeterDay.objects.filter(
    #         Q(communityid=watermeter.communityid) &
    #         Q(waterid=watermeter.id) &
    #         Q(hdate__startswith=qmonth)
    #     ).distinct()
    # #print(queryset)
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
                #print(s.get("readtime")[0:10],s.get("totalflux"))
                if sflag:
                    sflag = False
                    if i == 0:
                        before_first = dosage_serializer_data[0].get("totalflux")
                    else:
                        before_first = dosage_serializer_data[i-1].get("totalflux")
                    #print('before_first',before_first)
                data_between.append(s.get("totalflux"))
        
        if len(data_between) > 0:
            #print(data_between,before_first)
            # 当天只有一条数据记录时，计算好这个数据落在的时间段直接返回
            if data_len == 1:
                return float(before_first)
            # 时间区间内最后一个数据减去 比较值
            return float(data_between[-1]) - float(before_first)

        return '-'
            
            

    # #print(datel)
    # #print(len(datel))
    ret_data = []
    for i in range(len(datel)-1):
        t1 = datel[i]
        t2 = datel[i+1]
        # ret = get_data_between_time(t1,t2)
        d1 = get_t_first(t1)
        d2 = get_t_first(t2)
        flag = 'invalid'
        ret = '-'
        #print(d2,d1)
        if d1  and d2 :
            flag = 'valid'
            ret = float(d2) - float(d1)
        # #print(t1,"ret=",ret)
        ret_data.append({
            "readtime":t1,
            "totalflux":ret,
            "flag":flag
        })

    #print(ret_data)
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
            #print('need update ',tmp)
            #print('avg=',avg_value)
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
def getWatermeterMonth_data(request):
    '''
    当月每天的第一条数据记录
    '''
    if request.method == "GET":
        commaddr = request.GET.get("commaddr", None)
        syear = int(request.GET.get("syear", None))
        # smonth = int(request.GET.get("smonth", None))
        # sday = int(request.GET.get("sday", None))
        # commaddr = request.GET.get("commaddr")
        

    if request.method == "POST":
        commaddr = int(request.POST.get("commaddr", None))
        syear = int(request.POST.get("syear", None))
        # smonth = int(request.POST.get("smonth", None))
        # sday = int(request.POST.get("sday", None))
        
    # commaddr=3219
    # smonth=3
    # sday=31
    if commaddr is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")


    # qmonth = '{}-{:02d}'.format(syear,smonth)
    # #print('this water:',watermeter,watermeter.wateraddr,qmonth)
    queryset = HdbFlowData.objects.filter(
            Q(commaddr=commaddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__startswith=syear)
        ).distinct().order_by('readtime')
    dosage_serializer_data =  HdbFlowDataSerializer(queryset,many=True).data
    # #print(dosage_serializer_data)

    

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
            
            

    # #print(datel)
    # #print(len(datel))
    # 对时间段内没有数据记录的 计算平均值
    ret_data = []
    # 获取
    start_day = datel[0]
    try:
        query_before_first = HdbFlowData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__lte=start_day)
        ).distinct().order_by('readtime').last()
        tmp1 = query_before_first.totalflux
    except Exception as e:
        #print(e)
        tmp1 = 0 #被减值 当天不存在，记录上一天（上一条）记录,
    #print('tmp1=',tmp1)
    end_day = datel[-1]
    try:
        query_before_first = HdbFlowData.objects.filter(
            Q(wateraddr=watermeter.wateraddr) &
            # Q(waterid=watermeter.id) &
            Q(readtime__gte=end_day)
        ).distinct().order_by('readtime').first()
        end_value = query_before_first.totalflux
    except Exception as e:
        #print(e)
        end_value = '-' #被减值 当天不存在，记录上一天（上一条）记录,
    #print('end_value=',end_value)
    tmp_date = []
    record_value = []
    record_date = []
    cnt = 1
    sflag = 'begin'
    for i in range(len(datel)):
        flag = 'invalid'
        t1 = datel[i]
        ret1 = get_data_from_day_first(t1)
        #print(i+1,t1,ret1,sflag)
        # 1. 有效值，如果是开始 invalid or valid
        if ret1 != '-' and sflag == 'begin':
            sflag = 'valid'
            tmp1 = float(ret1)
            record_date.append(t1)
            #print('\t1.',record_date)

        # 1.1 开始就无效值
        elif ret1 == '-' and sflag == 'begin':
            sflag = 'invalid'
            record_date.append(t1)
            #print('\t2.',record_date)

        # 2.有效值开始，直到下一个有效值
        elif ret1 != '-' and sflag == 'valid':
            value = float(ret1) - float(tmp1)
            #print('\t3.',record_date)
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
            #print('\t4.',record_date)
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
            #print('\t tmp1=',tmp1)
            #print('\t6.',record_date)
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
            #print('\t6.1.',record_date)
        # 后面都没有找到有效的数据了
        elif ret1 == '-' and sflag == 'invalid':
            record_date.append(t1)
            #print('\t7.',record_date)
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
        commaddr equal watermeter__id
    '''
    if request.method == "GET":
        commaddr = request.GET.get("commaddr", None)
        syear = int(request.GET.get("syear", None))
        

    if request.method == "POST":
        commaddr = int(request.POST.get("commaddr", None))
        syear = int(request.GET.get("syear", None))
        
    if commaddr is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    


   
    queryset = HdbFlowDataMonth.objects.filter(
            Q(commaddr=commaddr) &
            Q(hdate__startswith=syear)
        ).distinct()
    
    dosage_serializer =  HdbFlowDataMonthSerializer(queryset,many=True)

    

    result = dict()
    result["monthlydata"] = dosage_serializer.data
    result["success"] = "true"
    
    
    return Response(result)

