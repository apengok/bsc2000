# -*- coding: utf-8 -*-
import random
import time
import datetime
from apscheduler.schedulers.background import BackgroundScheduler

from django_apscheduler.jobstores import DjangoJobStore, register_events, register_job
from django.db import connections

from legacy.models import (HdbFlowData,HdbFlowDataDay,HdbFlowDataHour,HdbFlowDataMonth,HdbPressureData,Bigmeter,
    Watermeter,HdbWatermeterDay,HdbWatermeterMonth)
from dmam.models import VCommunity,VWatermeter
import logging

logger_info = logging.getLogger('info_logger')


scheduler = BackgroundScheduler()
scheduler.add_jobstore(DjangoJobStore(), "default")




from functools import wraps
from django.db import connection

def db_auto_reconnect(func):
    """Auto reconnect db when mysql has gone away."""
    @wraps(func)
    def wrapper(*args, **kwagrs):
        try:
            connection.connection.ping()
        except Exception:
            connection.close()
        return func(*args, **kwagrs)
    return wrapper
    

def close_old_connections():
    for conn in connections.all():
        conn.close_if_unusable_or_obsolete()



# ('scheduler',"interval", seconds=1)  #用interval方式循环，每一秒执行一次  
# @register_job(scheduler, 'cron', day_of_week='mon-fri', hour='9', minute='30', second='10',id='task_time')  
#         
# 
# 大表数据 从歙县服务器数据库同步到威尔沃服务器数据库
# 舍弃 test_sync_bigmeter取代
# @register_job(scheduler, "interval", seconds=3600, replace_existing=True)
def test_job():
    time.sleep(random.randrange(1, 100, 1)/100.)
    # print("I'm a test job!")
    logger_info.info("synchronize data from shexian")
    count = 0
    bigmeters_qset = Bigmeter.objects.using("shexian").values_list('commaddr','commstate','meterstate','gprsv','meterv',
                'signlen','lastonlinetime','pressure','plustotalflux','reversetotalflux','flux','totalflux','pressurereadtime',
                'fluxreadtime','username')

    for b in bigmeters_qset:
        commaddr = b[0]

        try:
            d2=Bigmeter.objects.using("zncb").get(commaddr=commaddr)
        except:
            logger_info.info("{} {} not exists in virovo db".format(b[14],b[0]))
            continue
        if d2:
            d2.commstate = b[1]
            d2.meterstate = b[2]
            d2.gprsv = b[3]
            d2.meterv = b[4]
            d2.signlen = b[5]
            d2.lastonlinetime = b[6]
            d2.pressure = b[7]
            d2.plustotalflux = b[8]
            d2.reversetotalflux = b[9]
            d2.flux = b[10]
            d2.totalflux = b[11]
            d2.pressurereadtime = b[12]
            d2.fluxreadtime = b[13]
            
            d2.save(using='zncb')

        # logger_info.info("1.hdb_flow_data")
        # 威尔沃数据库最后一条数据记录
        zncb_last = HdbFlowData.objects.using("zncb").filter(commaddr=commaddr).last()
        if zncb_last:
            last_readtime = zncb_last.readtime

            if last_readtime is None:
                continue
            # 取歙县服务器该条数据记录对比
            sx_last = HdbFlowData.objects.using("shexian").filter(commaddr=commaddr).filter(readtime=last_readtime).first()
            # 取出上次最后一条数据记录之后增加的记录
            if sx_last:
                # print('last_readtime',last_readtime,zncb_last)
                # print('sx_last',sx_last)
                added = HdbFlowData.objects.using("shexian").filter(commaddr=commaddr).filter(readtime__gt=datetime.datetime.strptime(last_readtime.strip(),"%Y-%m-%d %H:%M:%S")).all()
                if added.exists():
                    count += added.count()
                    for d in added:
                        d.save(using='zncb')

        # logger_info.info("2.hdb_flow_data_day")
        zncb_last = HdbFlowDataDay.objects.using("zncb").filter(commaddr=commaddr).last()
        if zncb_last:
            last_readtime = zncb_last.hdate

            if last_readtime is None:
                continue
            # 取歙县服务器该条数据记录对比
            sx_last = HdbFlowDataDay.objects.using("shexian").filter(commaddr=commaddr).filter(hdate=last_readtime).first()
            # 取出上次最后一条数据记录之后增加的记录
            if sx_last:
                added = HdbFlowDataDay.objects.using("shexian").filter(commaddr=commaddr).filter(hdate__gt=datetime.datetime.strptime(last_readtime.strip(),"%Y-%m-%d")).all()
                if added.exists():
                    count += added.count()
                    for d in added:
                        d.save(using='zncb')

        # logger_info.info("3.hdb_flow_data_hour")
        zncb_last = HdbFlowDataHour.objects.using("zncb").filter(commaddr=commaddr).last()
        if zncb_last:
            last_readtime = zncb_last.hdate

            if last_readtime is None:
                continue
            # 取歙县服务器该条数据记录对比
            sx_last = HdbFlowDataHour.objects.using("shexian").filter(commaddr=commaddr).filter(hdate=last_readtime).first()
            # 取出上次最后一条数据记录之后增加的记录
            if sx_last:
                added = HdbFlowDataHour.objects.using("shexian").filter(commaddr=commaddr).filter(hdate__gt=datetime.datetime.strptime(last_readtime.strip(),"%Y-%m-%d %H")).all()
                if added.exists():
                    count += added.count()
                    for d in added:
                        d.save(using='zncb')

        # logger_info.info("4.hdb_flow_data_month")
        zncb_last = HdbFlowDataMonth.objects.using("zncb").filter(commaddr=commaddr).last()
        if zncb_last:
            last_readtime = zncb_last.hdate

            if last_readtime is None:
                continue
            # 取歙县服务器该条数据记录对比
            sx_last = HdbFlowDataMonth.objects.using("shexian").filter(commaddr=commaddr).filter(hdate=last_readtime).first()
            # 取出上次最后一条数据记录之后增加的记录
            if sx_last:
                added = HdbFlowDataMonth.objects.using("shexian").filter(commaddr=commaddr).filter(hdate__gt=datetime.datetime.strptime(last_readtime.strip(),"%Y-%m")).all()
                if added.exists():
                    count += added.count()
                    for d in added:
                        d.save(using='zncb')

        # logger_info.info("5.hdb_pressure_data")
        zncb_last = HdbPressureData.objects.using("zncb").filter(commaddr=commaddr).last()
        if zncb_last:
            last_readtime = zncb_last.readtime

            if last_readtime is None:
                continue
            # 取歙县服务器该条数据记录对比
            sx_last = HdbPressureData.objects.using("shexian").filter(commaddr=commaddr).filter(readtime=last_readtime).first()
            # 取出上次最后一条数据记录之后增加的记录
            if sx_last:
                added = HdbPressureData.objects.using("shexian").filter(commaddr=commaddr).filter(readtime__gt=datetime.datetime.strptime(last_readtime.strip(),"%Y-%m-%d %H:%M:%S")).all()
                if added.exists():
                    count += added.count()
                    for d in added:
                        d.save(using='zncb')
    # raise ValueError("Olala!")

    logger_info.info("added total {}".format(count))

def test_sync_wm_day(waterid,day,communityid):
    wm_flow_day = HdbWatermeterDay.objects.using("shexian").filter(waterid=waterid,hdate=day).values()
    added_list = []
    for wd in wm_flow_day:
        rvalue = wd["rvalue"]
        fvalue = wd["fvalue"]
        meterstate = wd["meterstate"]
        commstate = wd["commstate"]
        rtime = wd["rtime"]
        dosage = wd["dosage"]
        communityid= wd["communityid"]

        vd = HdbWatermeterDay.objects.filter(waterid=waterid,hdate=day)
        if vd.exists():
            vd.update(rvalue=rvalue,fvalue=fvalue,meterstate=meterstate,commstate=commstate,rtime=rtime,dosage=dosage)
        else:
            t=HdbWatermeterDay(waterid=waterid,hdate=day,rvalue=rvalue,fvalue=fvalue,meterstate=meterstate,
                commstate=commstate,rtime=rtime,communityid=communityid)
            added_list.append(t)

    if len(added_list) > 0:
        HdbWatermeterDay.objects.bulk_create(added_list)


def test_sync_wm_month(waterid,ymon,communityid):
    wm_flow_day = HdbWatermeterMonth.objects.using("shexian").filter(waterid=waterid,hdate=ymon).values()
    added_list = []
    for wd in wm_flow_day:
        dosage = wd["dosage"]
        communityid= wd["communityid"]

        vd = HdbWatermeterMonth.objects.filter(waterid=waterid,hdate=ymon)
        if vd.exists():
            vd.update(dosage=dosage)
        else:
            t=HdbWatermeterMonth(waterid=waterid,hdate=ymon,dosage=dosage,communityid=communityid)
            added_list.append(t)

    if len(added_list) > 0:
        HdbWatermeterMonth.objects.bulk_create(added_list)


def test_sync_bgm_flows(commaddr,day):
    
    flow_day = HdbFlowData.objects.using("shexian").filter(commaddr=commaddr,readtime__startswith=day).values()
    
    added_list = []
    for fd in flow_day:
        readtime=fd["readtime"]
        flux = fd["flux"]
        plustotalflux = fd["plustotalflux"]
        reversetotalflux = fd["reversetotalflux"]
        totalflux = fd["totalflux"]
        gprsv = fd["gprsv"]
        meterv = fd["meterv"]
        meterstate = fd["meterstate"]
        
        vd = HdbFlowData.objects.filter(commaddr=commaddr,readtime=readtime)
        if vd.exists():
            vd.update(flux=flux,plustotalflux=plustotalflux,reversetotalflux=reversetotalflux,
                totalflux=totalflux,gprsv=gprsv,meterv=meterv,meterstate=meterstate)
        else:
            d = HdbFlowData(commaddr=commaddr,readtime=readtime,flux=flux,plustotalflux=plustotalflux,reversetotalflux=reversetotalflux,
                totalflux=totalflux,gprsv=gprsv,meterv=meterv,meterstate=meterstate)
            added_list.append(d)

    if len(added_list)>0:
        try:
            added=HdbFlowData.objects.bulk_create(added_list)
            logger_info.info("HdbFlowData:added_list count {} added :{}".format(len(added_list),len(added)))
            
        except Exception as e:
            logger_info.info("sync flow  error,reason :{}".format(e))
        

def test_sync_bgm_flow_hour(commaddr,day):
    
    flow_day = HdbFlowDataHour.objects.using("shexian").filter(commaddr=commaddr,hdate__startswith=day).values()
    
    added_list = []
    for fd in flow_day:
        hdate=fd["hdate"]
        dosage = fd["dosage"]
        vd = HdbFlowDataHour.objects.filter(commaddr=commaddr,hdate=hdate)
        if vd.exists():
            vd.update(dosage=dosage)
        else:
            d = HdbFlowDataHour(commaddr=commaddr,hdate=hdate,dosage=dosage)
            added_list.append(d)

    if len(added_list)>0:
        try:
            added=HdbFlowDataHour.objects.bulk_create(added_list)
            logger_info.info("HdbFlowDataHour:added_list count {} added :{}".format(len(added_list),len(added)))
            
        except Exception as e:
            logger_info.info("sync flow hour error,reason :",e)

def test_sync_bgm_flow_daily(commaddr,day):
    
    flow_day = HdbFlowDataDay.objects.using("shexian").filter(commaddr=commaddr,hdate=day).values()
    
    added_list = []
    for fd in flow_day:
        dosage = fd["dosage"]
        vd = HdbFlowDataDay.objects.filter(commaddr=commaddr,hdate=day)
        if vd.exists():
            vd.update(dosage=dosage)
        else:
            d = HdbFlowDataDay(commaddr=commaddr,hdate=day,dosage=dosage)
            added_list.append(d)

    if len(added_list)>0:
        try:
            added=HdbFlowDataDay.objects.bulk_create(added_list)
            logger_info.info("HdbFlowDataDay:added_list count {} added :{}".format(len(added_list),len(added)))
            
        except Exception as e:
            logger_info.info("sync flow day error,reason :{}".format(e))

def test_sync_bgm_flow_month(commaddr,ymon):
    
    flow_day = HdbFlowDataMonth.objects.using("shexian").filter(commaddr=commaddr,hdate=ymon).values()
    # print("{} count:",flow_day.count())
    added_list = []
    for fd in flow_day:
        dosage = fd["dosage"]
        vd = HdbFlowDataMonth.objects.filter(commaddr=commaddr,hdate=ymon)
        if vd.exists():
            vd.update(dosage=dosage)
        else:
            d = HdbFlowDataMonth(commaddr=commaddr,hdate=ymon,dosage=dosage)
            added_list.append(d)

    if len(added_list)>0:
        try:
            added=HdbFlowDataMonth.objects.bulk_create(added_list)
            logger_info.info("HdbFlowDataMonth:added_list count {} added :{}".format(len(added_list),len(added)))
            
        except Exception as e:
            logger_info.info("sync flow month error,reason :{}".format(e))


# 大表数据 从歙县服务器数据库同步到威尔沃服务器数据库
# @register_job(scheduler, "interval", seconds=3600, replace_existing=True)
def test_sync_bigmeter():
    nocnt = 0
    close_old_connections()
    today = datetime.datetime.today()
    # day = today.strftime("%Y-%m-%d")
    logger_info.info("sync Bigmeter data and flow data:")
    sx_bms = Bigmeter.objects.using("shexian").values('commaddr','commstate','meterstate','gprsv','meterv',
                'signlen','lastonlinetime','pressure','plustotalflux','reversetotalflux','flux','totalflux','pressurereadtime',
                'fluxreadtime','username')
    for sb in sx_bms:
        commaddr = sb["commaddr"]
        name = sb["username"]

        fluxreadtime = sb["fluxreadtime"]
        flux = sb["flux"]
        totalflux = sb["totalflux"]
        plustotalflux = sb["plustotalflux"]
        reversetotalflux = sb["reversetotalflux"]
        pressurereadtime = sb["pressurereadtime"]
        pressure = sb["pressure"]
        gprsv = sb["gprsv"]
        meterv = sb["meterv"]
        signlen = sb["signlen"]
        lastonlinetime = sb["lastonlinetime"]
        commstate = sb["commstate"]
        meterstate = sb["meterstate"]
        vb = Bigmeter.objects.filter(commaddr=commaddr)
        if vb.exists():
            vb.update(fluxreadtime=fluxreadtime,flux=flux,totalflux=totalflux,plustotalflux=plustotalflux,reversetotalflux=reversetotalflux,
                pressurereadtime=pressurereadtime,pressure=pressure,gprsv=gprsv,meterv=meterv,signlen=signlen,lastonlinetime=lastonlinetime,
                commstate=commstate,meterstate=meterstate,)
            logger_info.info("{}({}):".format(name,commaddr))
            # sync flow history data
            
            day_str = today.strftime("%Y-%m-%d")
            
            test_sync_bgm_flows(commaddr,day_str)
            test_sync_bgm_flow_hour(commaddr,day_str)
            test_sync_bgm_flow_daily(commaddr,day_str)
        else:
            nocnt+=1
            logger_info.info("{}({}) not in Virvo DB".format(name,commaddr))

    logger_info.info("all cnt is {} ,{} not exists".format(sx_bms.count(),nocnt))


# 小表数据 从歙县服务器数据库同步到威尔沃服务器数据库
@register_job(scheduler, "cron", hour='05',minute='10', replace_existing=True)
def test_sync_watermeter():
    nocnt = 0
    close_old_connections()
    today = datetime.datetime.today()
    t1=time.time()

    logger_info.info("sync Watermeter data and flow data from shexian")

    sx_wms = Watermeter.objects.using("shexian").values("id","communityid","rvalue","fvalue","meterstate","commstate",
                "rtime","lastrvalue","lastrtime","dosage","valvestate","lastwritedate","lastwritevalue","meterv","wateraddr")
    bool(sx_wms)
    v_community = VCommunity.objects.values_list("commutid","amrs_commutid")
    v_community_dict = dict(v_community)
    v_watermeter = VWatermeter.objects.values_list("waterid","amrs_waterid")
    v_watermeter_dict = dict(v_watermeter)

    for w in sx_wms:
        waterid = w["id"] #歙县watermeter id
        communityid = w["communityid"]
        rvalue = w["rvalue"],
        fvalue = w["fvalue"],
        meterstate = w["meterstate"],
        commstate = w["commstate"],
        rtime = w["rtime"],
        lastrvalue = w["lastrvalue"],
        lastrtime = w["lastrtime"],
        dosage = w["dosage"],
        valvestate = w["valvestate"],
        lastwritedate = w["lastwritedate"],
        lastwritevalue = w["lastwritevalue"],
        meterv = w["meterv"]
        v_ww_waterid = v_watermeter_dict.get(waterid) or None

        


        if v_ww_waterid is not None:
            v_ww_commutid = v_community_dict.get(communityid)
            if v_ww_commutid is None:
                logger_info("community id {} is None ".format(v_ww_commutid))
                continue

            Watermeter.objects.filter(id=v_ww_waterid).update(
                rvalue = w["rvalue"],
                fvalue = w["fvalue"],
                meterstate = w["meterstate"],
                commstate = w["commstate"],
                rtime = w["rtime"],
                lastrvalue = w["lastrvalue"],
                lastrtime = w["lastrtime"],
                dosage = w["dosage"],
                valvestate = w["valvestate"],
                lastwritedate = w["lastwritedate"],
                lastwritevalue = w["lastwritevalue"],
                meterv = w["meterv"])

            # update flow data day and month
            for i in range(2):
                day = today - datetime.timedelta(days=i)
                day_str = day.strftime("%Y-%m-%d")
                test_sync_wm_day(waterid,day_str,v_ww_commutid)
            test_sync_wm_month(waterid,day.strftime("%Y-%m"),v_ww_commutid)

        else:
            nocnt += 1
            logger_info.info("{} not in virvo DB".format(waterid))

    if nocnt > 0:
        logger_info.info("total {} not in virvo DB".format(nocnt))
    
    t2 = time.time() - t1
    logger_info.info("time last{}:".format(t2))  




def sync_bgm_flows(commaddr,day):
    
    flow_day = HdbFlowData.objects.using("shexian").filter(commaddr=commaddr,readtime__startswith=day).values()
    update_cnt = 0
    added_list = []
    for fd in flow_day:
        if "id" in fd:
            del fd["id"]
        readtime = fd["readtime"]
        
        vd = HdbFlowData.objects.filter(commaddr=commaddr,readtime=readtime)
        if vd.exists():
            vd.update(**fd)
            update_cnt += 1
        else:
            d = HdbFlowData(**fd)
            added_list.append(d)

    if len(added_list)>0:
        try:
            added=HdbFlowData.objects.bulk_create(added_list)
            
        except Exception as e:
            logger_info.info("sync flow  error,reason :{}".format(e))

    return update_cnt,len(added_list)
        

def sync_bgm_flow_hour(commaddr,day):
    
    flow_day = HdbFlowDataHour.objects.using("shexian").filter(commaddr=commaddr,hdate__startswith=day).values()
    update_cnt = 0
    added_list = []
    for fd in flow_day:
        if "id" in fd:
            del fd["id"]
        hdate=fd["hdate"]
        dosage = fd["dosage"]
        vd = HdbFlowDataHour.objects.filter(commaddr=commaddr,hdate=hdate)
        if vd.exists():
            vd.update(dosage=dosage)
            update_cnt += 1
        else:
            d = HdbFlowDataHour(**fd)
            added_list.append(d)

    if len(added_list)>0:
        try:
            added=HdbFlowDataHour.objects.bulk_create(added_list)
            
        except Exception as e:
            logger_info.info("sync flow hour error,reason :{}".format(e))

    return update_cnt,len(added_list)

def sync_bgm_flow_daily(commaddr,day):
    
    flow_day = HdbFlowDataDay.objects.using("shexian").filter(commaddr=commaddr,hdate=day).values()
    update_cnt = 0
    added_list = []
    for fd in flow_day:
        if "id" in fd:
            del fd["id"]
        dosage = fd["dosage"]
        vd = HdbFlowDataDay.objects.filter(commaddr=commaddr,hdate=day)
        if vd.exists():
            vd.update(dosage=dosage)
            update_cnt += 1
        else:
            d = HdbFlowDataDay(**fd)
            added_list.append(d)

    if len(added_list)>0:
        try:
            added=HdbFlowDataDay.objects.bulk_create(added_list)
            
        except Exception as e:
            logger_info.info("sync flow day error,reason :{}".format(e))

    return update_cnt,len(added_list)

def sync_bgm_flow_month(commaddr,ymon):
    update_cnt = 0
    flow_day = HdbFlowDataMonth.objects.using("shexian").filter(commaddr=commaddr,hdate=ymon).values()
    # print("{} count:",flow_day.count())
    added_list = []
    for fd in flow_day:
        if "id" in fd:
            del fd["id"]
        dosage = fd["dosage"]
        vd = HdbFlowDataMonth.objects.filter(commaddr=commaddr,hdate=ymon)
        if vd.exists():
            vd.update(dosage=dosage)
            update_cnt += 1
        else:
            d = HdbFlowDataMonth(**fd)
            added_list.append(d)

    if len(added_list)>0:
        try:
            added=HdbFlowDataMonth.objects.bulk_create(added_list)
            
        except Exception as e:
            logger_info.info("sync flow month error,reason :".format(e))

    return update_cnt,len(added_list)



#晚间同步大表数据
@register_job(scheduler, "cron", hour='23',minute='52', replace_existing=True)
def night_sync_bigmeter(day=None):

    close_old_connections()
    nocnt = 0
    if day is None:
        today = datetime.datetime.today()
        day_str = today.strftime("%Y-%m-%d")
    else:
        day_str = day
    # day = today.strftime("%Y-%m-%d")
    logger_info.info("sync Bigmeter data and flow data:")
    sx_bms = Bigmeter.objects.using("shexian").all().values()
    for sb in sx_bms:
        if "id" in sb:
            del sb["id"]
        if "pk" in sb:
            del sb["pk"]
        commaddr = sb["commaddr"]
        
        vb = Bigmeter.objects.filter(commaddr=commaddr)
        if vb.exists():
            vb.update(**sb)
            # sync flow history data
            
            
            update_flow,added_flow = sync_bgm_flows(commaddr,day_str)
            update_flow_h,added_flow_h = sync_bgm_flow_hour(commaddr,day_str)
            update_flow_d,added_flow_d = sync_bgm_flow_daily(commaddr,day_str)
            update_flow_m,added_flow_m = sync_bgm_flow_month(commaddr,day_str[:7])
            info = "update {}({}) flows({},{}) hour(update-{},added-{}) daily(update-{},added-{}) month(update-{},added-{}):".format(sb["username"],commaddr,
                update_flow,added_flow,update_flow_h,added_flow_h,update_flow_d,added_flow_d,update_flow_m,added_flow_m)
            # print(info)
            logger_info.info(info)

        else:
            nocnt+=1
            logger_info.info("{}({}) not in Virvo DB".format(sb["username"],commaddr))

    logger_info.info("all cnt is {} ,{} not exists".format(sx_bms.count(),nocnt))
    
register_events(scheduler)

scheduler.start()
print("Scheduler started!")
# test_sync_bigmeter()
# test_sync_watermeter()