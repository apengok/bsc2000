# -*- coding:utf-8 -*-

import json
import datetime
import time
from django.db.models import Avg, Max, Min, Sum

from .models import (
    District,Bigmeter,HdbFlowData,HdbFlowDataDay,HdbFlowDataMonth,HdbPressureData,
                            HdbWatermeterDay,HdbWatermeterMonth,Concentrator,Watermeter,
                            HdbWatermeterDay,HdbWatermeterMonth,HdbFlowDataHour
)


from .serializers import(
    HdbFlowDataSerializer,
    HdbFlowDataHourSerializer,
    HdbFlowDataDaySerializer,
    HdbFlowDataMonthSerializer,
    HdbPressureDataSerializer,

)

# .exclude(plustotalflux__icontains='429490176') 因为抄表系统处理负数的问题，数据库写入很多不正确的数据，负值貌似都写入了429490176，所以排除这些数据


def generat_year_month():
    today = datetime.date.today()
    endTime = today.strftime("%Y-%m")
    
    lastyear = datetime.datetime(year=today.year-1,month=today.month,day=today.day)
    startTime = lastyear.strftime("%Y-%m")

    def month_year_iter( start_month, start_year, end_month, end_year ):
        ym_start= 12*start_year + start_month
        ym_end= 12*end_year + end_month
        for ym in range( ym_start, ym_end ):
            y, m = divmod( ym, 12 )
            # yield y, m+1
            yield '{}-{:02d}'.format(y,m+1)
    
    month_list = list(month_year_iter(lastyear.month,lastyear.year,today.month,today.year))

    return month_list

def generat_year_month_from(start_month, start_year):
    today = datetime.date.today()
    endTime = today.strftime("%Y-%m")
    
    def month_year_iter( start_month, start_year, end_month, end_year ):
        ym_start= 12*start_year + start_month
        ym_end= 12*end_year + end_month
        for ym in range( ym_start, ym_end ):
            y, m = divmod( ym, 12 )
            # yield y, m+1
            yield '{}-{:02d}'.format(y,m+1)
    
    month_list = list(month_year_iter(start_month-1, start_year,today.month,today.year))

    return month_list

def ZERO_monthly_dict(month_list):
    # month_list = generat_year_month()
    month_dict = {}
    for m in month_list:
        month_dict[m] = 0
    return month_dict

###################################################################################
#
#新增数据表具数据统计函数
###################################################################################

def flow_data_raw(commaddr,stime,etime=None):
    '''
        从HdbFlowData中获取一天的流量值
    '''
    if stime is None:
        stime = datetime.date.today().strftime("%Y-%m-%d")
    if etime is None:
        etime = datetime.date.today().strftime("%Y-%m-%d")
    # stime = sday + " 00:00:00"
    # etime = sday + " 23:59:59"
    queryset = HdbFlowData.objects.filter(commaddr=commaddr).filter(readtime__range=[stime,etime])
    serializer_data = HdbFlowDataSerializer(queryset,many=True).data
    # print(serializer_data)
    data = {}
    for s in serializer_data:
        data[s.get('readtime')] = round(float(s.get('flux')),2) if s.get('flux') else 0
    return data


def pressure_data_of_day(commaddr,stime,etime=None):
    '''
        返回一天中整点时间的流量值
        从HdbPressureData中获取一天的流量值
    '''
    if stime is None:
        stime = datetime.date.today().strftime("%Y-%m-%d")
    if etime is None:
        etime = datetime.date.today().strftime("%Y-%m-%d")
    # stime = sday + " 00:00:00"
    # etime = sday + " 23:59:59"
    queryset = HdbPressureData.objects.filter(commaddr=commaddr).filter(readtime__range=[stime,etime])
    serializer_data = HdbPressureDataSerializer(queryset,many=True).data
    # print(serializer_data)
    data = {}
    for s in serializer_data:
        data[s.get('readtime')] = round(float(s.get('pressure')),2) if s.get('pressure') else 0
    return data


def flow_data_of_month(commaddr,stime,etime=None):
    '''
        返回一个月的流量数据（从某日的前30天）
        从HdbFlowMonth中获取一天的流量值
    '''
    if etime is None:
        etime = datetime.date.today().strftime("%Y-%m-%d")
    
    queryset = HdbFlowDataDay.objects.filter(commaddr=commaddr).filter(hdate__range=[stime,etime])
    serializer_data = HdbFlowDataDaySerializer(queryset,many=True).data
    # print(serializer_data)
    data = {}
    for s in serializer_data:
        data[s.get('hdate')] = round(float(s.get('dosage')),2)
    return data

def flow_data_of_day(commaddr,sday=None):
    '''
        返回一天中整点时间的流量值
        从HdbFlowHour中获取一天的流量值
    '''
    if sday is None:
        sday = datetime.date.today().strftime("%Y-%m-%d")
    stime = sday + " 00:00:00"
    etime = sday + " 23:59:59"
    queryset = HdbFlowDataHour.objects.filter(commaddr=commaddr).filter(hdate__range=[stime,etime])
    serializer_data = HdbFlowDataHourSerializer(queryset,many=True).data
    # print(serializer_data)
    data = {}
    for s in serializer_data:
        data[s.get('hdate')] = round(float(s.get('dosage')),2)
    return data

def max_flow_of_day(commaddr,sday=None):
    '''
        返回一天中最大流量值和对应时间
        从HdbFlowHour中获取一天的流量值比较
    '''
    if sday is None:
        sday = datetime.date.today().strftime("%Y-%m-%d")

    data = flow_data_of_day(commaddr,sday)
    if not data:
        return 0,None

    timestr = list(data.keys())[0]
    max_flow = float(data[timestr])
    for h,d in data.items():
        v = round(float(d),2)
        if v > max_flow:
            max_flow = v
            timestr = h
    
    return {timestr:max_flow}
    
def min_flow_of_day(commaddr,sday=None):
    '''
        返回一天中最小流量值和对应时间
        从HdbFlowHour中获取一天的流量值比较
    '''
    if sday is None:
        sday = datetime.date.today().strftime("%Y-%m-%d")

    data = flow_data_of_day(commaddr,sday)
    if not data:
        return 0,None
    timestr = list(data.keys())[0]
    min_flow = data[timestr]
    for h,d in data.items():
        if d > min_flow:
            min_flow = d
            timestr = h
    
    return {timestr:min_flow}

def avg_flow_of_day(commaddr,sday=None):
    if sday is None:
        sday = datetime.date.today().strftime("%Y-%m-%d")
    stime = sday + " 00:00:00"
    etime = sday + " 23:59:59"
    avg_flow = HdbFlowDataHour.objects.filter(commaddr=commaddr).filter(hdate__range=[stime,etime]).aggregate(Avg('dosage'))
    avg_value = avg_flow['dosage__avg']
    if avg_value is not None:
        return round(float(avg_value),2)

    return 0



###################################################################################
def HdbFlow_day_use(commaddr,day):
    '''
        返回日用水量
        取出当日所有数据，用最后一笔数据的正向流量值减去第一条数据的差值得出当日用水量的值
    '''
    day_use = 0
    flows = HdbFlowData.objects.search(commaddr,day).exclude(plustotalflux__icontains='429490176').values_list('readtime','plustotalflux')
    print(flows)
    n=flows.count()
    if n > 0:
        day_use = float(flows[n-1][1]) - float(flows[0][1])
    return round(day_use,2)

# 
def HdbFlow_day_hourly_static(commaddr,day):
    '''
        返回日整点用水量
        当前整点正向流量-上一整点正向流量
    '''
    flow_data = []
    
    etime = datetime.datetime.strptime(day.strip(),"%Y-%m-%d")
    stime = etime + datetime.timedelta(days=1)
    startTime =day + ' 00:00:00'
    endTime = stime.strftime("%Y-%m-%d") + ' 00:01:00'
    flows = HdbFlowDataHour.objects.filter(commaddr=commaddr).filter(hdate__range=[startTime,endTime]).values_list("hdate","dosage")
    # f_dict =dict(flows)
    return flows

def HdbFlow_day_hourly(commaddr,day):
    '''
        返回日整点用水量
        当前整点正向流量-上一整点正向流量
    '''
    flow_data = []
    
    etime = datetime.datetime.strptime(day.strip(),"%Y-%m-%d")
    stime = etime + datetime.timedelta(days=1)
    startTime =day + ' 00:00:00'
    endTime = stime.strftime("%Y-%m-%d") + ' 00:10:00'
    print("start -endtime ",startTime,endTime)
    flows = HdbFlowData.objects.filter(commaddr=commaddr).filter(readtime__range=[startTime,endTime]).values_list("readtime","plustotalflux")
    f_dict =dict(flows)
    # return f_dict
    print('f_dict',f_dict)
    hours = ['00:00:00','01:00:00','02:00:00','03:00:00','04:00:00','05:00:00','06:00:00','07:00:00','08:00:00','09:00:00','10:00:00','11:00:00','12:00:00','13:00:00','14:00:00','15:00:00','16:00:00','17:00:00','18:00:00','19:00:00','20:00:00','21:00:00','22:00:00','23:00:00']
    zhengdian_value = []
    for h in hours:
        th=startTime[:11] + h
        v='-'
        if th in f_dict.keys():
            v=f_dict[th]
        zhengdian_value.append(v)
    end_value = '-'
    if endTime[:11]+"00:00:00" in f_dict.keys():
        end_value = f_dict[endTime[:11]+"00:00:00"]
    zhengdian_value.append(end_value)
    # print('zhengdian_value',zhengdian_value)
    diff_value={}
    xishu_for = [] #用来计算系数
    for i in range(len(zhengdian_value)-1):
        if zhengdian_value[i+1] != '-' and zhengdian_value[i] != '-':
            try:
                v = float(zhengdian_value[i+1]) - float(zhengdian_value[i])
            except:
                v=0
            fv = round(v,2)
            xishu_for.append(fv)
        else:
            fv = '-'
        th = day + " %02d"%(i+1)
        diff_value[th] = fv
        # diff_value.append(round(v,2))

    # print('diff_value',diff_value)
    # 计算时变化系数
    x = 0
    if len(xishu_for) > 0:
        max_value = max(xishu_for)
        min_value = min(xishu_for)
        avg_value = sum(xishu_for) / len(xishu_for)

        
        if avg_value != 0:
            x1 = max_value - avg_value
            x2 = avg_value - min_value  
            # print("x1=",x1,"x2=",x2)
            if x1 > x2:
                x = max_value / avg_value
            else:
                x = min_value / avg_value


    return diff_value,round(x,2)


def flow_day_dosage_old(commaddr,day):
    f = HdbFlowDataDay.objects.filter(commaddr=commaddr,hdate=day).values_list("dosage")
    # print("flow_day_dosage",day,f)
    if f.exists():
        return round(float(f[0][0]),2)
    else:
        return 0

def flow_day_dosage(commaddr,day):
    """
    后一天的第一条记录 - 前一天的第一条记录 = 改日的流量
    """
    t1=time.time()
    day_str = day.strftime("%Y-%m-%d")
    query1 = HdbFlowData.objects.filter(commaddr=commaddr,readtime__startswith=day_str)
    f1 = HdbFlowDataSerializer(query1,many=True).data
    # print(f1)
    # print("retrieve data from hdb_flow_data time elapse is ",time.time() - t1)
    sday = day + datetime.timedelta(days=1)
    day_str = sday.strftime("%Y-%m-%d")
    query2 = HdbFlowData.objects.filter(commaddr=commaddr,readtime__startswith=day_str)
    f2 = HdbFlowDataSerializer(query2,many=True).data
    # print("flow_day_dosage",day,f)
    if len(f1) > 0 and len(f2) > 0:
        return round(float(f2[0].get("totalflux")) - float(f1[0].get("totalflux")),2)
    else:
        return 0

    # 时变化系数
def flow_hour_xishu(commaddr,day):
    '''
    时变化系数：每天中瞬时流量的最大值除以平均值，瞬时流量的最小值除以平均值，这两个数都是个系数，取其中最大的，
    举例如下：
        最大值：1.2m³/h，最小值：0.7 m³/h，平均值：1 m³/h
        那么（1.2-1）<（1-0.7），取最大，时变化系数是：0.7/1=0.7
        最大值：1.2 m³/h，最小值：0.9 m³/h，平均值：1 m³/h
        那么（1.2-1）>（1-0.9），取最大，时变化系数是1.2/1=1.2
    '''

    avg_flow = HdbFlowData.objects.search(commaddr,day).aggregate(Avg('flux'))
    avg_value = avg_flow['flux__avg']
    

    max_flow = HdbFlowData.objects.search(commaddr,day).aggregate(Max('flux'))
    max_value = float(max_flow['flux__max'])
    
    min_flow = HdbFlowData.objects.search(commaddr,day).aggregate(Min('flux'))
    min_value = float(min_flow['flux__min'])

    print(min_value,max_value,avg_value)

    x = 0
    if avg_value != 0:
        x1 = max_value - avg_value
        x2 = avg_value - min_value  
        print("x1=",x1,"x2=",x2)
        if x1 > x2:
            x = max_value / avg_value
        else:
            x = min_value / avg_value
        print("x=",x)
    

    return round(x,2)

# 统计大表月用水量，从流量历史数据查询当月的数据，最后一条记录减去第一条记录的差值
def HdbFlow_month_use(commaddr,day):
    '''
        返回月用水量
        取出当月所有数据，用最后一笔数据的正向流量值减去第一条数据的差值得出当月用水量的值
    '''
    month_use = 0
    t1=time.time()
    flows = HdbFlowData.objects.search(commaddr,day).exclude(plustotalflux__icontains='429490176').values_list('readtime','plustotalflux')
    t2=time.time()
    # print('HdbFlow_month_use time elpse',t2-t1)
    # print(flows)
    n=flows.count()
    if n > 0:
        month_use = float(flows[n-1][1]) - float(flows[0][1])
    return round(month_use,2)



def HdbFlow_monthly(commaddr):
    '''
        返回过去一年内每月用水量
        取出当月所有数据，用最后一笔数据的正向流量值减去第一条数据的差值得出当月用水量的值
    '''
    today = datetime.date.today()
    endTime = today.strftime("%Y-%m")
    
    lastyear = datetime.datetime(year=today.year-1,month=today.month,day=today.day)
    startTime = lastyear.strftime("%Y-%m")

    data = []
    sub_dma_list = []
    
    monthly_data = {}
    def month_year_iter( start_month, start_year, end_month, end_year ):
        ym_start= 12*start_year + start_month
        ym_end= 12*end_year + end_month
        for ym in range( ym_start, ym_end ):
            y, m = divmod( ym, 12 )
            # yield y, m+1
            yield '{}-{:02d}'.format(y,m+1)
    
    month_list = list(month_year_iter(lastyear.month,lastyear.year,today.month,today.year))
    # mon = ['2017-11', '2017-12', '2018-01', '2018-02', '2018-03', '2018-04', '2018-05', '2018-06', '2018-07', '2018-08', '2018-09', '2018-10']
    today = datetime.date.today()
    # flows = HdbFlowData.objects.filter(commaddr=commaddr).filter(readtime__range=[month_list[0],today]).exclude(plustotalflux__icontains='429490176').values_list('readtime','plustotalflux')
    flows = HdbFlowData.objects.filter(commaddr=commaddr).filter(readtime__range=[month_list[0],today]).values_list('readtime','plustotalflux')
    # 一次获取整年的数据再按月统计，减少查询数据库次数，查询数据库比较耗时
    # print(list(month_list))
    t=0
    for m in month_list:

        if m not in monthly_data.keys():
            monthly_data[m] = 0
        
        month_flow_list = [float(f[1]) for f in flows if f[0][:7] == m]
        
        if len(month_flow_list) == 0:
            month_use = 0
        else:
            month_use = month_flow_list[-1] - month_flow_list[0] #HdbFlow_month_use(commaddr,m)
        
        monthly_data[m] = round(month_use,2)
    
    return monthly_data


# 直接从hdb_flow_month读取月用水量返回
def Hdbflow_from_hdbflowmonth(commaddr,month_list):
    '''
        返回过去一年内每月用水量
        取出当月所有数据，用最后一笔数据的正向流量值减去第一条数据的差值得出当月用水量的值
    '''
    data = []
    sub_dma_list = []
    
    monthly_data = {}
    today = datetime.date.today()
    # flows = HdbFlowData.objects.filter(commaddr=commaddr).filter(readtime__range=[month_list[0],today]).exclude(plustotalflux__icontains='429490176').values_list('readtime','plustotalflux')
    flows = HdbFlowDataMonth.objects.filter(commaddr=commaddr).filter(hdate__range=[month_list[0],today]).values_list('hdate','dosage')
    # 一次获取整年的数据再按月统计，减少查询数据库次数，查询数据库比较耗时
    # print(list(month_list))
    dict_month = dict(flows)
    # print('dict_month',dict_month)
    t=0
    for m in month_list:

        if m not in dict_month.keys():
            month_use = 0
        else:
            month_use = float(dict_month[m]) #HdbFlow_month_use(commaddr,m)
        
        monthly_data[m] = round(month_use,2)
    
    return monthly_data

# 计算小区月用水量：月统计表里面属于这个小区的表数据加起来
def hdb_watermeter_month(communityid,hdate):
    flows=HdbWatermeterMonth.objects.filter(communityid=communityid,hdate=hdate).aggregate(Sum('dosage'))
    flow=flows['dosage__sum']
    if flow is None:
        flow = 0
    return round(float(flow),2)

def hdb_watermeter_flow_monthly(communityid,month_list):
    monthly_data = {}
    
    
    for m in month_list:
        f = hdb_watermeter_month(communityid,m)
        monthly_data[m] = f

    return monthly_data



# 直接从 hdb_flow_data_day 读取日用水量返回
def Hdbflow_from_hdbflowday(commaddr,day_list):
    '''
        返回day_list中每日数据
        直接从日统计表中取出数据
    '''
    data = []
    sub_dma_list = []
    
    daily_data = {}
    
    flows = HdbFlowDataDay.objects.filter(commaddr=commaddr).filter(hdate__range=[day_list[-1],day_list[0]]).values_list('hdate','dosage')
    # 一次获取整年的数据再按月统计，减少查询数据库次数，查询数据库比较耗时
    # print(list(day_list))
    dict_month = dict(flows)
    # print('dict_month',dict_month)
    t=0
    for d in day_list:

        if d not in dict_month.keys():
            day_use = 0
        else:
            day_use = float(dict_month[d]) #HdbFlow_month_use(commaddr,m)
        
        daily_data[d] = round(day_use,2)
    
    return daily_data
    
# 计算小区日用水量：日统计表里面属于这个小区的表数据加起来
def hdb_watermeter_daily(communityid,hdate):
    flows=HdbWatermeterDay.objects.filter(communityid=communityid,hdate=hdate).aggregate(Sum('dosage'))
    flow=flows['dosage__sum']
    if flow is None:
        flow = 0
    return round(float(flow),2)

def hdb_watermeter_flow_daily(communityid,day):
    daily_data = {}
    
    
    for m in day:
        f = hdb_watermeter_daily(communityid,m)
        daily_data[m] = f

    return daily_data