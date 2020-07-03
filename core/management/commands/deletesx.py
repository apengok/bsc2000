# -*- coding:utf-8 -*-
from django.core.management.base import BaseCommand, CommandError


from legacy.models import (HdbFlowData,HdbFlowDataDay,HdbFlowDataHour,HdbFlowDataMonth,HdbPressureData,Bigmeter,
    Watermeter,HdbWatermeterDay,HdbWatermeterMonth,Concentrator,Community,Alarm,SecondWater,
    HdbFlowDataMonth)

import time
import datetime
import logging
import string
import itertools
import threading

from dmam.models import VConcentrator,VWatermeter,VCommunity,Station,Meter,SimCard,DMABaseinfo,DmaStation
from entm.models import Organizations

from gis.models import FenceDistrict,Polygon,FenceShape

logger_info = logging.getLogger('info_logger')



def delete_alarms(delete_list):
    ret = Alarm.objects.filter(commaddr__in=delete_list).delete()
    print("deleted Alarm bigmeter ",ret)


def delete_wm_alarms(delete_list):
    ret = Alarm.objects.filter(waterid__in=delete_list).delete()
    print("deleted Alarm watermeter ",ret)


def delete_HdbFlowData(delete_list):
    ret = HdbFlowData.objects.filter(commaddr__in=delete_list).delete()
    print("deleted hdb_flow bigmeter ",ret)


def delete_HdbFlowDataDay(delete_list):
    ret = HdbFlowDataDay.objects.filter(commaddr__in=delete_list).delete()
    print("deleted hdb_flow_day bigmeter ",ret)

def delete_HdbFlowDataHour(delete_list):
    ret = HdbFlowDataHour.objects.filter(commaddr__in=delete_list).delete()
    print("deleted hdb_flow_hour bigmeter ",ret)


def delete_HdbFlowDataMonth(delete_list):
    ret = HdbFlowDataMonth.objects.filter(commaddr__in=delete_list).delete()
    print("deleted hdb_flow_month bigmeter ",ret)



def delete_HdbWatermeterDay(delete_list):
    ret = HdbWatermeterDay.objects.filter(waterid__in=delete_list).delete()
    print("deleted hdb_watermetere_day  ",ret)


def delete_HdbWatermeterMonth(delete_list):
    ret = HdbWatermeterMonth.objects.filter(waterid__in=delete_list).delete()
    print("deleted hdb_watermeter_month  ",ret)


def delete_HdbPressureData(delete_list):
    ret = HdbPressureData.objects.filter(commaddr__in=delete_list).delete()
    print("deleted hdb_pressure_data bigmeter ",ret)


def delete_Bigmeter(delete_list):
    ret = Bigmeter.objects.filter(commaddr__in=delete_list).delete()
    print("deleted  bigmeter ",ret)


def delete_Watermeter(delete_list):
    ret = Watermeter.objects.filter(id__in=delete_list).delete()
    print("deleted watermeter ",ret)


def delete_concentrator(delete_list):
    ret = Concentrator.objects.filter(name__in=delete_list).delete()
    print("delete concentrator ",ret)



def delete_Community(delete_list):
    ret = Community.objects.filter(id__in=delete_list).delete()
    print("delete Community ",ret)



def delete_SecondWater(delete_list):
    ret = SecondWater.objects.filter(name__in=delete_list).delete()
    print("delete SecondWater ",ret)



class Command(BaseCommand):
    help = 'Delete shexian data from virvo db'

    def add_arguments(self, parser):
        # parser.add_argument('sTime', type=str)

        

        parser.add_argument(
            '--commaddr',
            action='store_true',
            dest='commaddr',
            default=False,
            help='list shexian commaddr'
        )

        parser.add_argument(
            '--other',
            action='store_true',
            dest='other',
            default=False,
            help='list shexian commaddr'
        )

        parser.add_argument(
            '--shexian',
            action='store_true',
            dest='shexian',
            default=False,
            help='list shexian commaddr'
        )

    def handle(self, *args, **options):
        # sTime = options['sTime']
        t1=time.time()
        count = 0
        aft = 0

        if options['commaddr']:
            sx = Organizations.objects.get(name="歙县自来水公司")
            station_count = 0
            wm_count = 0
            

            sx_all = sx.sub_organizations(include_self=True)

            bigmeter_commaddr_list = []
            watermeter_commaddr_list = []
            wm_none_list = []
            total = 0

            for x in sx_all:
                station_count = x.station_set.count()
                # print("shexian organ:",x)
                # print("station_count:",station_count)
                # print("")

                total += station_count

                # 站点
                for s in x.station_set.all():
                    # print("     commaddr:",s.commaddr)

                    bigmeter_commaddr_list.append('{}'.format(s.commaddr))

                # 户表
                wm_count += x.vwatermeter_set.count()
                for s in x.vwatermeter_set.all():
                    # print("vwatermeter")
                    if s.amrs_waterid is None:
                        print(s.waterid)
                        wm_none_list.append(s.waterid)
                    else:
                        watermeter_commaddr_list.append('{}'.format(s.amrs_waterid))
                        

                # dma
                # if x.dma.all().count() > 0:
                #     print('dma exists ,cant delete.')
                #     return False
                
                # # 表具
                # for m in x.meter_set.all():
                #     pass
                # # SIM卡
                # for s in x.simcard_set.all():
                #     pass
                # # 小区
                # for c in x.vcommunity_set.all():
                #     pass
                # # 集中器
                # for c in x.vconcentrator_set.all():
                #     pass
                # # 二供
                # for c in x.vsecondwater_set.all():
                #     pass
                # # 压力
                # for c in x.vpressure_set.all():
                #     pass
                

            # a_count = Alarm.objects.filter(waterid__in=watermeter_commaddr_list).delete()
            # print("ac-count=",a_count)

            # t1 = threading.Thread(target=delete_wm_alarms,args=(wm_none_list,))
            # t1.start()

            fd = threading.Thread(target=delete_HdbFlowData,args=(bigmeter_commaddr_list,))
            fd.start()

            fdd = threading.Thread(target=delete_HdbFlowDataDay,args=(bigmeter_commaddr_list,))
            fdd.start()

            fdm = threading.Thread(target=delete_HdbFlowDataMonth,args=(bigmeter_commaddr_list,))
            fdm.start()

            fdh = threading.Thread(target=delete_HdbFlowDataHour,args=(bigmeter_commaddr_list,))
            fdh.start()

            fdd = threading.Thread(target=delete_HdbPressureData,args=(bigmeter_commaddr_list,))
            fdd.start()

            wmd = threading.Thread(target=delete_HdbWatermeterDay,args=(watermeter_commaddr_list,))
            wmd.start()

            wmd = threading.Thread(target=delete_HdbWatermeterMonth,args=(watermeter_commaddr_list,))
            wmd.start()

            

            
        if options['other']:
            sx = Organizations.objects.get(name="歙县自来水公司")
            
            meter_list = []
            dma_list = []
            simcard_list = []
            community_list = []
            concentrator_list = []
            secondwater_list = []
            pressure_list = []

            sx_all = sx.sub_organizations(include_self=True)

            for x in sx_all:
                # dma
                if x.dma.all().count() > 0:
                    print('dma exists ,cant delete.',x.dma.all().count())
                
                # 表具
                # for s in x.meter_set.all():
                #     meter_list.append(s.)
                # SIM卡
                # for s in x.simcard_set.all():
                #     pass
                # 小区 amrs_commutid
                for s in x.vcommunity_set.all():
                    community_list.append(s.amrs_commutid)
                    try:
                        Community.objects.filter(id=s.amrs_commutid).delete()
                    except Exception as e:
                        print(e)
                # 集中器
                for s in x.vconcentrator_set.all():
                    concentrator_list.append(s.name)
                # 二供
                # for s in x.vsecondwater_set.all():
                #     secondwater_list.append(s.name)
                # 压力
                # for s in x.vpressure_set.all():
                #     pass

            wmd = threading.Thread(target=delete_concentrator,args=(concentrator_list,))
            wmd.start()

            print(community_list)
            # comu = threading.Thread(target=delete_Community,args=(concentrator_list,))
            # comu.start()

            # sw = threading.Thread(target=delete_SecondWater,args=(concentrator_list,))
            # sw.start()


        if options['shexian']:
            sx = Organizations.objects.get(name="歙县自来水公司")
            
            

            sx_all = sx.sub_organizations(include_self=True)

            for x in sx_all:
                # dma
                if x.dma.all().count() > 0:
                    print('dma exists ,cant delete.',x.dma.all().count())
                    x.dma.all().delete()
                
                # 表具
                ret = x.meter_set.all().delete()
                print("delete meter ",ret)
                
                # SIM卡
                ret = x.simcard_set.all().delete()
                print("delete simcard_set ",ret)
                
                # 小区 amrs_commutid
                ret = x.vcommunity_set.all().delete()
                print("delete vcommunity_set ",ret)

                
                # 集中器
                ret = x.vconcentrator_set.all().delete()
                print("delete vconcentrator_set ",ret)
                
                # 二供
                ret = x.vsecondwater_set.all().delete()
                print("delete vsecondwater_set ",ret)
                

                ret = x.vpressure_set.all().delete()
                print("delete vpressure_set ",ret)

            sx_all.delete()