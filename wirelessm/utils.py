# -*- coding:utf-8 -*-
import datetime
from django.db.models import Q

from django.db.models import Avg, Max, Min, Sum,Count

from amrs.models import (
    Watermeter,
    HdbWatermeterData,
    HdbWatermeterDay,
    HdbWatermeterMonth,
)

# 按组织统计数据
def zerouse_by_belongto(belongto,days):
    '''
    零吨用水
    返回days到当前时刻零吨用水的用户
    '''
    queryset_list = belongto.watermeter_list_queryset('').order_by('-amrs_watermeter__rtime')

    today = datetime.datetime.now()
    theday = today - datetime.timedelta(days=days)
    # 先获得days到当前用水的表数
    exclude_data = queryset_list.filter(
            Q(amrs_watermeter__rtime__range=(theday,today))
            # Q(imei__icontains=query)
            ).values("id")
    print("exclude_data count",exclude_data.count())
    # 排除有用水的户表即为无用水的户表
    queryset_list = queryset_list.exclude(id__in=exclude_data)

    return queryset_list


def zerouse_by_community(community,days):
    '''
    community is amrs community
    零吨用水
    返回days到当前时刻零吨用水的用户
    '''
    community_id = community.id
    queryset_list = Watermeter.objects.filter(communityid=community_id)

    today = datetime.datetime.now()
    theday = today - datetime.timedelta(days=days)
    # 先获得days到当前用水的表数
    exclude_data = queryset_list.filter(
            Q(rtime__range=(theday,today))
            # Q(imei__icontains=query)
            ).values("id")
    print("exclude_data count",exclude_data.count())
    # 排除有用水的户表即为无用水的户表
    queryset_list = queryset_list.exclude(id__in=exclude_data)

    return queryset_list

def stastics_by_community(community,stime,etime):
    '''
    数据综合 水量统计报表 小区的统计信息
    '''
    today = datetime.datetime.today()
    today_str = today.strftime("%Y-%m-%d")
    yestoday = today - datetime.timedelta(days=1)
    yestoday_str = yestoday.strftime("%Y-%m-%d")
    this_month = today.strftime("%Y-%m")
    this_year = today.strftime("%Y")
    amrs_community_id = community.id
    queryset_today = HdbWatermeterDay.objects.filter(communityid=amrs_community_id).filter(hdate=today_str).aggregate(Sum('dosage'))
    todayuse=queryset_today['dosage__sum']
    queryset_yestoday = HdbWatermeterDay.objects.filter(communityid=amrs_community_id).filter(hdate=yestoday_str).aggregate(Sum('dosage'))
    yestodayuse=queryset_yestoday['dosage__sum']

    interval = datetime.datetime.strptime(etime,"%Y-%m-%d %H:%M:%S")  - datetime.datetime.strptime(stime,"%Y-%m-%d %H:%M:%S")
    days = interval.days
    zero_user = zerouse_by_community(community,days)

    community_watermeters = Watermeter.objects.filter(communityid=amrs_community_id)

    # 昨日抄见率
    total = community_watermeters.count()
    percent_list = community_watermeters.filter(rtime__startswith=yestoday_str)
    readed = percent_list.count()
    if total != 0:
        percent = int(readed / total * 100)
    else:
        percent = 0

    # nouse3m
    nouse3m_list = zerouse_by_community(community,90)
    nouse3m = nouse3m_list.count()
    
    ret = {
        'belongto':community.name,
        'todayuse':round(float(todayuse),2) if todayuse else '',
        'yestodayuse':round(float(yestodayuse),2) if yestodayuse else '',
        'totaluser':total,
        'zerouser':zero_user.count(),
        'yestodaypercent':percent,   
        'faultuser':'',
        'overflowuser':'',
        'nouse3m':nouse3m,
        'gongdan':''
    }
    return ret



def stastics_by_belongto(belongto,stime,etime):
    '''
    数据综合 水量统计报表 组织的统计信息
    '''
    commuity_all = belongto.community_list_queryset('').prefetch_related('amrs_community')
    watermeter_all = belongto.watermeter_list_queryset('').prefetch_related('amrs_watermeter')
    amrs_community_id_list = commuity_all.values_list('amrs_community__id',flat=True)

    today = datetime.datetime.today()
    today_str = today.strftime("%Y-%m-%d")
    yestoday = today - datetime.timedelta(days=1)
    yestoday_str = yestoday.strftime("%Y-%m-%d")
    this_month = today.strftime("%Y-%m")
    this_year = today.strftime("%Y")
    queryset_today = HdbWatermeterDay.objects.filter(communityid__in=amrs_community_id_list).filter(hdate=today_str).aggregate(Sum('dosage'))
    todayuse=queryset_today['dosage__sum']
    queryset_yestoday = HdbWatermeterDay.objects.filter(communityid__in=amrs_community_id_list).filter(hdate=yestoday_str).aggregate(Sum('dosage'))
    yestodayuse=queryset_yestoday['dosage__sum']

    interval = datetime.datetime.strptime(etime,"%Y-%m-%d %H:%M:%S")  - datetime.datetime.strptime(stime,"%Y-%m-%d %H:%M:%S")
    days = interval.days
    zero_user = zerouse_by_belongto(belongto,days)

    

    # 昨日抄见率
    total = watermeter_all.count()
    percent_list = watermeter_all.filter(amrs_watermeter__rtime__startswith=yestoday_str)
    readed = percent_list.count()
    if total != 0:
        percent = int(readed / total * 100)
    else:
        percent = 0

    # nouse3m
    nouse3m_list = zerouse_by_belongto(belongto,90)
    nouse3m = nouse3m_list.count()
    
    ret = {
        'belongto':belongto.name,
        'todayuse':round(float(todayuse),2) if todayuse else '',
        'yestodayuse':round(float(yestodayuse),2) if yestodayuse else '',
        'totaluser':total,
        'zerouser':zero_user.count(),
        'yestodaypercent':percent,   
        'faultuser':'',
        'overflowuser':'',
        'nouse3m':nouse3m,
        'gongdan':''
    }
    return ret
