# -*- coding:utf-8 -*-

import json
import datetime
import time
from django.db.models import Avg, Max, Min, Sum

from .models import (District,Bigmeter,HdbFlowData,HdbFlowDataDay,HdbFlowDataMonth,HdbPressureData,
                            HdbWatermeterDay,HdbWatermeterMonth,Concentrator,Watermeter,
                            HdbWatermeterDay,HdbWatermeterMonth,HdbFlowDataHour)

from .serializers import(
    HdbFlowDataSerializer,
    HdbFlowDataHourSerializer,
    HdbFlowDataDaySerializer,
    HdbFlowDataMonthSerializer,

)

'''
today = datetime.date.today()
    today_str = today.strftime("%Y-%m-%d")
    yestoday = today - datetime.timedelta(days=1)
    yestoday_str = yestoday.strftime("%Y-%m-%d")
'''

def dosage_per_day(commaddr,stime,etime=None):
    '''
        返回大表
        commaddr:大表(Bigmeter.commaddr)
        stime:起始时间
        etime:结束时间
    '''
    if etime is None:
        etime = datetime.date.today().strftime("%Y-%m-%d") + " 23:59:59"
    queryset = HdbFlowData.objects.filter(commaddr=commaddr).filter(hdate__range=[stime,etime])
    serializer_data = HdbFlowDataSerializer(queryset,many=True).data

    return serializer_data


def per_hour_in_day(commaddr,stime,etime=None):
    '''
        返回 一天的流量按小时统计
        commaddr:大表(Bigmeter.commaddr)
        stime:起始时间
        etime:结束时间
    '''
    if etime is None:
        # today = datetime.date.today()
        etime = stime + " 23:59:59"
    queryset = HdbFlowData.objects.filter(commaddr=commaddr).filter(readtime__range=[stime,etime])
    dosage_serializer_data = HdbFlowDataSerializer(queryset,many=True).data

    datel = ['0:00']
    for i in range(24):
        s2 = '{:02d}:00'.format(i+1)
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

    tmp_dict = {}
    for s in ret_data:
        t = stime + ' '+ s.get("readtime")[:2]
        v = s.get("totalflux")
        if v == '-':
            v = 0
        tmp_dict[t] = round(float(v),2)

    return tmp_dict
    # return ret_data