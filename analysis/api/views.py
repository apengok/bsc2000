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
    HdbFlowData,
    HdbFlowDataDay,
    HdbFlowDataHour,
    HdbFlowDataMonth,
    HdbPressureData,
)
# from .pagination import PostLimitOffsetPagination, PostPageNumberPagination
# from .permissions import IsOwnerOrReadOnly

from .serializers import (
    # PostCreateUpdateSerializer, 
    StationListSerializer, 
    BigmeterRTSerializer,
    
)

from amrs.datacollect import dosage_per_day

import logging
import logging.handlers

from amrs.utils import (
    flow_day_dosage,
    flow_data_of_day,
    max_flow_of_day,
    min_flow_of_day,
    avg_flow_of_day,

    HdbFlow_day_hourly,
    pressure_data_of_day,
    flow_data_of_month,
    flow_data_raw,
)

from amrs.datacollect import per_hour_in_day

import datetime
# logging.getLogger('apscheduler').setLevel(logging.WARNING)

class BigmeterRTListAPIView(ListAPIView):
    # queryset = MyRoles.objects.all()
    serializer_class = BigmeterRTSerializer
    filter_backends= [SearchFilter, OrderingFilter]
    permission_classes = [AllowAny]
    # search_fields = ['simcardNumber', 'imei']
    # pagination_class = PostPageNumberPagination #PageNumberPagination

    def get_queryset(self, *args, **kwargs):
        #queryset_list = super(PostListAPIView, self).get_queryset(*args, **kwargs)
        # queryset_list = Bigmeter.objects.none()
        t1 =time.time()
        belongto_name = self.request.user.belongto.name
        station_queryset = self.request.user.belongto.station_list_queryset('')
        # commaddr_list = [s.amrs_bigmeter.commaddr for s in station_queryset]
        pressure_queryset = self.request.user.belongto.pressure_list_queryset('')
        commaddr_list = [s.amrs_pressure.commaddr for s in pressure_queryset]
        queryset_list = Bigmeter.objects.all().filter(commaddr__in=commaddr_list)
        # queryset_list = queryset_list.exclude(rid__isnull=True)
        # queryset_list.exclude(pId__exact='')
        # print('get_queryset:',queryset_list)
        print("\r\ttime elasdrt:",time.time()-t1)
        query = self.request.GET.get("q")
        # if query:
        #     queryset_list = queryset_list.filter(
        #             Q(simcardNumber__icontains=query)|
        #             Q(imei__icontains=query)
        #             ).distinct()
        return queryset_list


@api_view(['GET'])
def flowdata_dailyuse_old(request):
    stationid = request.GET.get("station_id") # DMABaseinfo pk
    days = int(request.GET.get("days") or '1' ) #几天内
    data = []
    
    station = Station.objects.get(pk=int(stationid))
    # bigmetre = Bigmeter.objects.get()

    commaddr = station.amrs_bigmeter.commaddr
    print('commaddr:',commaddr)
    # days = 2
    # commaddr = '64618742271' #for test
    today = datetime.date.today()
    today_str = today.strftime("%Y-%m-%d")
    yestoday = today - datetime.timedelta(days=1)
    yestoday_str = yestoday.strftime("%Y-%m-%d")
    
    # today_str='2020-02-19'
    #staticstic data
    #当天用水量
    today_use = flow_day_dosage(commaddr,today_str)
    print('today_us:',today_use)
    #昨日用水量
    yestoday_use = flow_day_dosage(commaddr,yestoday_str)
    #前日用水量
    before_yestoday = today - datetime.timedelta(days=2)
    before_yestoday_str = before_yestoday.strftime("%Y-%m-%d")
    before_yestoday_use = flow_day_dosage(commaddr,before_yestoday_str)
    
    #最大值,最小值,平均值
    
    maxflow = max_flow_of_day(commaddr)
    minflow = min_flow_of_day(commaddr)
    avgflow = avg_flow_of_day(commaddr)

    xishu_daylist = {}
    data=[]
    p_data = []
    flowdata_daylist = {}
    for i in range(days):
        # print(startTime,endTime)
        # flowdata_hour = station.flowData_Hour(startTime,endTime)
        day = today - datetime.timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        flowdata_hour = flow_data_of_day(commaddr,day_str)
        
        flowdata_daylist[day_str] = flowdata_hour

        # 计算时变化系数
        x = 0
        if len(flowdata_hour) > 0:
            xishu_for = flowdata_hour.values()
            # xishu_for = [float(s.get('dosage')) for s in flowdata_hour]
            max_value = max(xishu_for)
            min_value = min(xishu_for)
            avg_value = avgflow

            
            if avg_value != 0:
                print(max_value,min_value,avg_value)
                x1 = max_value - avg_value
                x2 = avg_value - min_value  
                # print("x1=",x1,"x2=",x2)
                if x1 > x2:
                    x = max_value / avg_value
                else:
                    x = min_value / avg_value
        xishu_daylist[day_str] = x
        

    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                "flow_data":data, #reverse
                "flowdata_daylist":flowdata_daylist,#json.dumps(flowdata_daylist),
                "xishu_daylist":xishu_daylist,
                # "hdate":['2018-10-31 01' , '2018-10-31 02' , '2018-10-31 03' , '2018-10-31 04' , '2018-10-31 05' , '2018-10-31 06' , '2018-10-31 07' , '2018-10-31 08' , '2018-10-31 09' , '2018-10-31 10' , '2018-10-31 11' , '2018-10-31 12' , '2018-10-31 13' , '2018-10-31 14' , '2018-10-31 15' , '2018-10-31 16' , '2018-10-31 17' , '2018-10-31 18' , '2018-10-31 19' , '2018-10-31 20', '2018-10-31 21' , '2018-10-31 22' , '2018-10-31 23' , '2018-10-31 24'],
                "pressure":p_data,
                "today_use":today_use,
                "yestoday_use":yestoday_use,
                "before_yestoday_use":before_yestoday_use,
                "maxflow":maxflow,
                "minflow":minflow,
                "average":avgflow

            },
            "success":1}

    return Response(ret)

@api_view(['GET'])
def flowdata_dailyuse(request):
    stationid = request.GET.get("station_id") # DMABaseinfo pk
    days = int(request.GET.get("days") or '1' ) #几天内
    data = []
    
    station = Station.objects.get(pk=int(stationid))
    # bigmetre = Bigmeter.objects.get()

    commaddr = station.amrs_bigmeter.commaddr
    print('commaddr:',commaddr)
    # days = 2
    # commaddr = '64618742271' #for test
    today = datetime.date.today()
    today_str = today.strftime("%Y-%m-%d")
    yestoday = today - datetime.timedelta(days=1)
    yestoday_str = yestoday.strftime("%Y-%m-%d")
    
    # today_str='2020-02-19'
    #staticstic data
    #当天用水量
    today_use = flow_day_dosage(commaddr,today)
    print('today_us:',today_use)
    #昨日用水量
    yestoday_use = flow_day_dosage(commaddr,yestoday)
    #前日用水量
    before_yestoday = today - datetime.timedelta(days=2)
    before_yestoday_str = before_yestoday.strftime("%Y-%m-%d")
    before_yestoday_use = flow_day_dosage(commaddr,before_yestoday)
    
    #最大值,最小值,平均值
    
    maxflow = max_flow_of_day(commaddr)
    minflow = min_flow_of_day(commaddr)
    avgflow = avg_flow_of_day(commaddr)

    xishu_daylist = {}
    data=[]
    p_data = []
    flowdata_daylist = {}
    for i in range(days):
        # print(startTime,endTime)
        # flowdata_hour = station.flowData_Hour(startTime,endTime)
        day = today - datetime.timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        flowdata_hour = per_hour_in_day(commaddr,day_str)
        
        flowdata_daylist[day_str] = flowdata_hour

        # 计算时变化系数
        x = 0
        if len(flowdata_hour) > 0:
            xishu_for = flowdata_hour.values()
            # xishu_for = [float(s.get('dosage')) for s in flowdata_hour]
            max_value = max(xishu_for)
            min_value = min(xishu_for)
            avg_value = avgflow

            
            if avg_value != 0:
                print(max_value,min_value,avg_value)
                x1 = max_value - avg_value
                x2 = avg_value - min_value  
                # print("x1=",x1,"x2=",x2)
                if x1 > x2:
                    x = max_value / avg_value
                else:
                    x = min_value / avg_value
        xishu_daylist[day_str] = x
        

    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                "flow_data":data, #reverse
                "flowdata_daylist":flowdata_daylist,#json.dumps(flowdata_daylist),
                "xishu_daylist":xishu_daylist,
                # "hdate":['2018-10-31 01' , '2018-10-31 02' , '2018-10-31 03' , '2018-10-31 04' , '2018-10-31 05' , '2018-10-31 06' , '2018-10-31 07' , '2018-10-31 08' , '2018-10-31 09' , '2018-10-31 10' , '2018-10-31 11' , '2018-10-31 12' , '2018-10-31 13' , '2018-10-31 14' , '2018-10-31 15' , '2018-10-31 16' , '2018-10-31 17' , '2018-10-31 18' , '2018-10-31 19' , '2018-10-31 20', '2018-10-31 21' , '2018-10-31 22' , '2018-10-31 23' , '2018-10-31 24'],
                "pressure":p_data,
                "today_use":today_use,
                "yestoday_use":yestoday_use,
                "before_yestoday_use":before_yestoday_use,
                "maxflow":maxflow,
                "minflow":minflow,
                "average":avgflow

            },
            "success":1}

    return Response(ret)

@api_view(['GET','POST'])
def flowdata_monthuse(request):
    print("flowdata_monthuse:",request.POST)

    stationid = request.GET.get("station_id") # DMABaseinfo pk
    month = request.GET.get("month")
    station = Station.objects.get(pk=int(stationid))
    commaddr = station.amrs_bigmeter.commaddr

    month_data1 = {}
    month_data2 = {}
    month_data3 = {}
    history_data = {}

    

    today = datetime.date.today()
    today_str = today.strftime("%Y-%m-%d")
    w=today.weekday()
    yestmonth = today - datetime.timedelta(days=28+w)
    yestoday_str = yestmonth.strftime("%Y-%m-%d")
    

    # startTime = yestmonth
    # endTime = today
    startTime = today - datetime.timedelta(days=21+w)
    endTime = today + datetime.timedelta(days=6-w)

    # pressure data
    pressdata_hour = pressure_data_of_day(commaddr,startTime,endTime)
    press_today = [pressdata_hour[k] for k in pressdata_hour]
    # print("press_today",press_today)
    pree_time = [k[11:] for k in pressdata_hour]

    #history
    lastyear_start = datetime.datetime(year=yestmonth.year-1,month=yestmonth.month,day=yestmonth.day)
    lastyear_end = datetime.datetime(year=today.year-1,month=today.month,day=today.day)
    history_data =  [] #station.flowData_Day(lastyear_start,lastyear_end)
    
    # startTime = "2018-08-04 23:59:59"
    # endTime = "2018-08-05 23:59:59"
    if month == "1":
        # 从当日起前一个月的流量数据
        month_data1 = flow_data_of_month(commaddr,startTime,endTime)
    

    if month == "2":
        month_data1 = flow_data_of_month(commaddr,startTime,endTime)
        llastmonth = yestmonth - datetime.timedelta(days=28+w)
        startTime = llastmonth
        endTime = yestmonth
        month_data2 = flow_data_of_month(commaddr,startTime,endTime)

    if month == "3":
        month_data1 = flow_data_of_month(commaddr,startTime,endTime)

        llastmonth = yestmonth - datetime.timedelta(days=28+w)
        startTime = llastmonth
        endTime = yestmonth
        month_data2 = flow_data_of_month(commaddr,startTime,endTime)

        blastmonth = llastmonth - datetime.timedelta(days=28+w)
        startTime = blastmonth
        endTime = llastmonth
        month_data3 = flow_data_of_month(commaddr,startTime,endTime)
    
    

    
    
    #current moth
    data1 = []
    if len(month_data1) > 0:
        dates1 = [k for k in month_data1]
        flow_data1 = [month_data1[k] for k in month_data1]
        for i in range(len(flow_data1)):
            data1.append({
                "hdate":dates1[i],
                "flow":flow_data1[i],
                "assignmentName":station.amrs_bigmeter.username,
                "color":"红色",
                "ratio":"null",
                })

    #last month
    data2 = []
    if len(month_data2) > 0:
        dates2 = [k for k in month_data2]
        flow_data2 = [month_data2[k] for k in month_data2]
        for i in range(len(flow_data2)):
            data2.append({
                "hdate":dates2[i],
                "flow":flow_data2[i],
                "assignmentName":station.amrs_bigmeter.username,
                "color":"黄色",
                "ratio":"null",
                })

    #last month
    data3 = []
    if len(month_data3) > 0:
        dates3 = [k for k in month_data3]
        flow_data3 = [month_data3[k] for k in month_data3]
        for i in range(len(flow_data3)):
            data3.append({
                "hdate":dates3[i],
                "flow":flow_data3[i],
                "assignmentName":station.amrs_bigmeter.username,
                "color":"蓝色",
                "ratio":"null",
                })

    #history last year month
    data4 = []
    if len(history_data) > 0:
        dates4 = [k for k in history_data]
        flow_data4 = [history_data[k] for k in history_data]
        for i in range(len(history_data)):
            data4.append({
                "hdate":dates4[i],
                "flow":flow_data4[i],
                "assignmentName":station.amrs_bigmeter.username,
                "color":"蓝色",
                "ratio":"null",
                })

    #pressure data
    hdates = [k for k in month_data1]
    print(hdates)
    p_data = []
    # for i in range(len(hdates)):
    for k,v in pressdata_hour.items():
        p_data.append({
            "hdate":k,
            "press":v,
            "assignmentName":station.amrs_bigmeter.username,
            "color":"green",
            "ratio":"null"
            
            })

    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                "current_month":data1, #reverse
                "last_month":data2, #reverse
                "before_last_month":data3, #reverse
                "history":data4,
                "pressure":p_data,
                
            },
            "success":1}

    
    
    return Response(ret)



@api_view(['GET','POST'])
def flowdata_mnf(request):

    # print("flowdata_mnf:",request.POST)

    stationid = request.GET.get("station") # DMABaseinfo pk
    treetype = request.GET.get("treetype")
    startTime = request.GET.get("startTime")
    endTime = request.GET.get("endTime")

    data = []

    if treetype == 'dma':
        # distict = District.objects.get(id=int(stationid))
        # bigmeter = distict.bigmeter.first()
        dmas = DMABaseinfo.objects.filter(pk=int(stationid))
        
        
    else:
        # dma = DMABaseinfo.objects.first()
        # dmastation = dma.dmastation.first()
        # commaddr = dmastation.station_id

        organ = Organization.objects.first()

        if treetype == 'group':
            organ = Organization.objects.get(cid=stationid)

        organs = organ.get_descendants(include_self=True)

        dmas = None
        for o in organs:
            if dmas is None:
                dmas = o.dma.all()
            else:
                dmas |= o.dma.all()
    print('dmas:',dmas)
    ret = {"exceptionDetailMsg":"null",
            "msg":"没有dma分区信息",
            "obj":{
                "online":data, #reverse
                
            },
            "success":0}

    if len(dmas) == 0:
        return Response(ret)

    # if stationid != '':
    #     # distict = District.objects.get(id=int(stationid))
    #     # bigmeter = distict.bigmeter.first()
    #     dma = DMABaseinfo.objects.get(pk=int(stationid))
    #     print('DMA',dma,dma.dmastation)
    #     dmastation = dma.dmastation.first()
    #     commaddr = dmastation.station_id
    # else:
    #     dma = DMABaseinfo.objects.first()
    #     dmastation = dma.dmastation.first()
    #     commaddr = dmastation.station_id


    dma = dmas.first()
    dmastation = dma.station_set_all().first() # dma.station_set.first()
    
    if dmastation is None:
        return Response(ret)
        
    commaddr = dmastation.amrs_bigmeter.commaddr
    # commaddr = '64618742271'
    
    
    # if commaddr:
        # commaddr = bigmeter.commaddr
    flowday_stastic = HdbFlowDataDay.objects.filter(commaddr=commaddr)
    flowday = HdbFlowData.objects.filter(commaddr=commaddr).filter(readtime__range=[startTime,endTime])

    #pressure
    pressures = HdbPressureData.objects.filter(commaddr=commaddr).filter(readtime__range=[startTime,endTime])
    press = [round(float(f.pressure),2) for f in pressures]
    # print('pressures:',pressures)

    flows = [f.flux for f in flowday]
    hdates = [f.readtime for f in flowday]

    # print('mnf hdates',hdates)
    show_flag=1
    tmp = ''
    count_cnt = 1
    for i in range(len(hdates)):
        if i == 0:
            continue
        h = hdates[i]
        if tmp != h[:10]:
            tmp = h[:10]
            count_cnt += 1
            if count_cnt == 5:
                hdates[i] = h[:10] + " 00:00:00"
            else:
                hdates[i]=''
        


    flows_float = [round(float(f),2) for f in flows]
    flows_float = flows_float[::-1]
    

    #参考MNF
    ref_mnf = 4.46
    #MNF
    mnf = 8.63
    #表具信息
    
    #MNF/ADD
    mnf_add = 51
    #背景漏损
    back_leak = 4.46
    
    #设定报警
    alarm_set = 12

    #staticstic data
    #当天用水量
    today_use = 0
    #昨日用水量
    yestoday_use = 0
    #去年同期用水量
    last_year_same = 0
    #同比增长
    tongbi = 0
    #环比增长
    huanbi = 0
    #最大值
    maxflow = 0
    #最小值
    minflow = 0
    #平均值
    average = 0

    maxflow = max(flows_float) if len(flows_float)>0 else 0
    minflow = min(flows_float) if len(flows_float)>0 else 0
    average = sum(flows_float)/len(flows) if len(flows_float)>0 else 0
    mnf = minflow
    ref_mnf = mnf/2
    back_leak = ref_mnf * 0.8

    for i in range(len(flows_float)):
        data.append({
            "hdate":hdates[i],
            "dosage":flows_float[i],
            "assignmentName":dma.dma_name,
            "color":"红色",
            "ratio":"null",
            "maxflow":maxflow,
            "average":average,
            "mnf":mnf,
            "ref_mnf":ref_mnf,
            "press":press[i] if len(press)>0 else 0
            })
            
    

    today = datetime.date.today()
    today_str = today.strftime("%Y-%m-%d")
    today_flow = HdbFlowDataDay.objects.filter(hdate=today_str)
    
    if today_flow.exists():
        today_use = today_flow.first().dosage

    yestoday = today - datetime.timedelta(days=1)
    yestoday_str = yestoday.strftime("%Y-%m-%d")
    yestoday_flow = HdbFlowDataDay.objects.filter(hdate=yestoday_str)
    if yestoday_flow.exists():
        yestoday_use = yestoday_flow.first().dosage

    lastyear = today - datetime.timedelta(days=365)
    
    lastyear_str = lastyear.strftime("%Y-%m-%d")
    lastyear_flow = HdbFlowDataDay.objects.filter(hdate=lastyear_str)
    if lastyear_flow.exists():
        last_year_same = lastyear_flow.first().dosage
    tongbi = float(today_use) - float(last_year_same)
    huanbi = float(today_use) - float(yestoday_use)
    



    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                "online":data, #reverse
                "today_use":round(float(today_use),2),
                "yestoday_use":round(float(yestoday_use),2),
                "last_year_same":round(float(last_year_same),2),
                "tongbi":round(tongbi,2),
                "huanbi":round(huanbi,2),
                "maxflow":round(maxflow,2),
                "minflow":round(minflow,2),
                "average":round(average,2),
                "mnf":round(mnf,2),
                "mnf_add":round(mnf_add,2),
                "ref_mnf":round(ref_mnf,2),
                "back_leak":round(back_leak,2),
                "alarm_set":round(alarm_set,2),


            },
            "success":1}

    
    
    return Response(ret)



@api_view(['GET'])
def flowdata_analys(request):

    # print("flowdata_mnf:",request.POST)

    stationid = request.GET.get("station") # DMABaseinfo pk
    treetype = request.GET.get("treetype")
    startTime = request.GET.get("startTime")
    endTime = request.GET.get("endTime")
    press_in_commaddr = request.GET.get("press_in")
    press_out_commaddr = request.GET.get("press_out")
    press_key_commaddr = request.GET.get("press_key")

    data = []
    pressure_in = []
    pressure_out = []
    pressure_key = []

    station = Station.objects.get(pk=int(stationid))
    # bigmetre = Bigmeter.objects.get()

    commaddr = station.amrs_bigmeter.commaddr
    # print(station.amrs_bigmeter.username,commaddr)

    flow_raw = flow_data_raw(commaddr,startTime,endTime)

    if press_in_commaddr:
        pressure_in = pressure_data_of_day(press_in_commaddr,startTime,endTime)

    if press_out_commaddr:
        pressure_out = pressure_data_of_day(press_out_commaddr,startTime,endTime)
    
    if press_key_commaddr:
        pressure_key = pressure_data_of_day(press_key_commaddr,startTime,endTime)


    ret = {"exceptionDetailMsg":"null",
            "msg":"没有dma分区信息",
            "obj":{
                "online":data, #reverse
                
            },
            "success":0}

    

    flows_float = [v for k,v in flow_raw.items()]

    # print('mnf hdates',hdates)
    show_flag=1


    #参考MNF
    ref_mnf = 4.46
    #MNF
    mnf = 8.63
    #表具信息
    
    #MNF/ADD
    mnf_add = 51
    #背景漏损
    back_leak = 4.46
    
    #设定报警
    alarm_set = 12

    #staticstic data
    #当天用水量
    today_use = 0
    #昨日用水量
    yestoday_use = 0
    #去年同期用水量
    last_year_same = 0
    #同比增长
    tongbi = 0
    #环比增长
    huanbi = 0
    #最大值
    maxflow = 0
    #最小值
    minflow = 0
    #平均值
    average = 0

    maxflow = max(flows_float) if len(flows_float)>0 else 0
    minflow = min(flows_float) if len(flows_float)>0 else 0
    average = sum(flows_float)/len(flows_float) if len(flows_float)>0 else 0
    mnf = minflow
    ref_mnf = mnf/2
    back_leak = ref_mnf * 0.8

    
    



    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                "flow_raw":flow_raw, #reverse
                "pressure_in":pressure_in,
                "pressure_out":pressure_out,
                "pressure_key":pressure_key,
                "average":average,
                "mnf":round(mnf,2),
                "mnf_add":round(mnf_add,2),
                "ref_mnf":round(ref_mnf,2),
                "back_leak":round(back_leak,2),
                "alarm_set":round(alarm_set,2),


            },
            "success":1}

    
    
    return Response(ret)
