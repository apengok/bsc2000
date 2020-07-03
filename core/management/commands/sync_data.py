# -*- coding:utf-8 -*-
from django.core.management.base import BaseCommand, CommandError

import os
import time
import datetime
import logging
import logging.handlers
import string
import itertools
import requests
import json
import threading

from accounts.models import MyRoles,User

from amrs.models import (HdbFlowData,HdbFlowDataDay,HdbFlowDataHour,HdbFlowDataMonth,HdbPressureData,
    HdbFlowDataMonth,
    HdbWatermeterDay,
    HdbWatermeterMonth,
    Bigmeter,
    Watermeter,
    Concentrator,
    Community,
    SecondWater,
    Metercomm,
    MeterParameter,
    Meterprotocol,
)

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


# logger_info = logging.getLogger('info_logger')

logging.getLogger('apscheduler').setLevel(logging.WARNING)
filename = './collect_data_server2.log'
logging.basicConfig()
collect_data_logger = logging.getLogger('collect_data')
collect_data_logger.setLevel(logging.INFO)
time_file_handler = logging.handlers.TimedRotatingFileHandler(filename, when='H', interval=1, backupCount=1)
time_file_handler.suffix = '%Y-%m-%d_%H.log'
formatter = logging.Formatter('[%(asctime)s-%(levelname)s:%(message)s]')
time_file_handler.setFormatter(formatter)
collect_data_logger.addHandler(time_file_handler)

API_ROOT='http://localhost:5000/api/data/'


def walk_watermeter():
    watermeter_list = Watermeter.objects.filter(vwatermeter__isnull=True)
    print(watermeter_list.count())
    for w in watermeter_list:
        print(w.serialnumber)
        w.delete()

def walk_community():
    # f=open("tekmdfe.txt","w")
    concentrators = VConcentrator.objects.all()
    for c in concentrators:
        # 集中器
        print(f"{c.id}-{c.amrs_concentrator.name}-{c.amrs_concentrator.pk}-{c.amrs_concentrator.communityid}\n")
        # concentrator = amrs_concentrator.vconcentrator
        # 集中器绑定的小区
        try:
            community = VCommunity.objects.filter(vconcentrators__id=c.id).first()
            print(f"\t{community.id}-{community.amrs_community.name}-{community.amrs_community.id}\n")
            
            c.amrs_concentrator.communityid = community.amrs_community.id
            c.amrs_concentrator.save()
            # for m in community.watermeter.all():
            #     collect_data_logger.info(f"\t\t{m.communityid.id}-{m.communityid.amrs_community.id}-{m.amrs_watermeter.communityid}\n")
                # logger_info.info("\t\t\t",m.amrs_watermeter.communityid)
        except Exception as e:
            print(e)
            pass

    # f.close()

def check_bigmeter():
    for s in Station.objects.all():
        if s.meter:
            s.amrs_bigmeter.serialnumber = s.meter.serialnumber
            s.amrs_bigmeter.dn = s.meter.dn
            s.amrs_bigmeter.reportperiod = s.meter.check_cycle
            s.amrs_bigmeter.save()



def personlied():
    
    url = API_ROOT + 'personlized/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)

    count = 0
    collect_data = []
    for sub in data:
        sub.pop('id')
        bname = sub.pop('belongto')
        if bname:
            # print(bname)
            organ = Organization.objects.filter(name=bname)
            if organ.exists():
                sub['belongto'] = organ.first()
            
        collect_data.append(Personalized(**sub))
    Personalized.objects.bulk_create(collect_data)

def metercomm():
    
    url = API_ROOT + 'metercomm/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)

    count = 0
    # print(type(data))
    for sub in data:
        sub.pop('id')
        
        try:
            metercomm_obj = Metercomm.objects.update_or_create(**sub)
            count += 1
        except Exception as e:
            print("create Metrecomm error:",e)

    print('add metercomm count=',count)

def meterparameter():
    
    url = API_ROOT + 'meterparameter/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)

    count = 0
    # print(type(data))
    for sub in data:
        sub.pop('id')
        
        try:
            param_obj = MeterParameter.objects.update_or_create(**sub)
            count += 1
        except Exception as e:
            print("create Metrecomm error:",e)

    print('add parameter count=',count)

def meterprotocol():
    
    url = API_ROOT + 'meterprotocol/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)

    count = 0
    # print(type(data))
    for sub in data:
        sub.pop('id')
        
        try:
            mprotocol_obj = Meterprotocol.objects.update_or_create(**sub)
            count += 1
        except Exception as e:
            print("create MeterProtocol error:",e)

    print('add meterprotocol count=',count)

def waterusertype():
    url = API_ROOT + 'waterusertype/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)
    count = 0
    # print(type(data))
    for sub in data:
        # print(sub.get('name'),sub.get('belongto'))
        
        try:
            waterusertype_obj = WaterUserType.objects.update_or_create(**sub)
            count += 1
        except Exception as e:
            print("create WaterUserType error:",e)

def watermeter():
    '''
    create watermeter error: (1062, "Duplicate entry '28-64061190702052-862458047971814' for key 'NodeAddr'")
    create watermeter error: (1062, "Duplicate entry '28-64061190700809-865118046381889' for key 'NodeAddr'")
    create watermeter error: (1062, "Duplicate entry '28-64061190700746-865118046382804' for key 'NodeAddr'")
    (1406, "Data too long for column 'UserAddr' at row 1")
    total 2884 row(s) Affected !,elapsed 91.65679454803467
    '''
    url = API_ROOT + 'watermeter/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)
    count = 0
    # print(type(data))
    for sub in data:
        # print(sub.get('name'),sub.get('belongto'))
        
        organ_name = sub.pop('belongto')
        belongto = Organization.objects.get(name=organ_name)
        sub['belongto'] = belongto
        amrs_watermeter_data = sub.pop('amrs_watermeter')
        # waterid = sub.pop('waterid') # remove waterid

        communityid_name = sub.get('communityid')
        communityid_obj = VCommunity.objects.get(amrs_community__name=communityid_name)
        amrs_watermeter_data['communityid'] = communityid_obj.amrs_community.id

        watermeter_day = amrs_watermeter_data.pop('watermeter_day')
        watermeter_month = amrs_watermeter_data.pop('watermeter_month')
        
        # create amrs concentrator
        try:
            amrs_watermeter_data.pop('id')
            amrs_watermeter_obj = Watermeter.objects.create(**amrs_watermeter_data)
            # create concentrator
            sub['amrs_watermeter'] = amrs_watermeter_obj
            sub['communityid'] = communityid_obj
            try:
                vwatermeter_obj = VWatermeter.objects.create(**sub)
                count += 1
            except Exception as e:
                print(e)
        except Exception as e:
            print("create watermeter error:",e)
            continue

        # create flow data
        for data in watermeter_day:
            data['waterid'] = amrs_watermeter_obj.id
            data['communityid'] = amrs_watermeter_obj.communityid
            HdbWatermeterDay.objects.create(**data)

        for data in watermeter_month:
            data['waterid'] = amrs_watermeter_obj.id
            data['communityid'] = amrs_watermeter_obj.communityid
            HdbWatermeterMonth.objects.create(**data)

def secondwater():
    url = API_ROOT + 'secondwater/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)
    count = 0
    # print(type(data))
    for sub in data:
        # print(sub.get('name'),sub.get('belongto'))
        
        organ_name = sub.pop('belongto')
        belongto = Organization.objects.get(name=organ_name)
        sub['belongto'] = belongto
        amrs_secondwater_data = sub.pop('amrs_secondwater')
        
        # create amrs concentrator
        try:
            amrs_secondwater_obj = SecondWater.objects.create(**amrs_secondwater_data)
            # create concentrator
            sub['amrs_secondwater'] = amrs_secondwater_obj
            
            try:
                vsecondwater_obj = VSecondWater.objects.create(**sub)
                count += 1
            except Exception as e:
                print(e)
        except Exception as e:
            print("create secondwater error:",e)
            continue

def pressure():
    url = API_ROOT + 'pressure/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)
    count = 0
    # print(type(data))
    for sub in data:
        # print(sub.get('name'),sub.get('belongto'))
        
        organ_name = sub.pop('belongto')
        belongto = Organization.objects.get(name=organ_name)
        sub['belongto'] = belongto
        amrs_pressure_data = sub.pop('amrs_pressure')

        # pressure_data = amrs_pressure_data.pop('pressure_data')
        
        # create amrs concentrator
        try:
            amrs_pressure_obj = Bigmeter.objects.create(**amrs_pressure_data)
            # create concentrator
            sub['amrs_pressure'] = amrs_pressure_obj
            
            try:
                vpressure_obj = VPressure.objects.create(**sub)
                count += 1
            except Exception as e:
                print(e)
        except Exception as e:
            print("create pressure error:",e)
            continue

        # create hdb_pressure_data
        # for data in pressure_data:
        #     data.pop('id')
        #     HdbPressureData.objects.create(**data)

def community():
    url = API_ROOT + 'community/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)
    count = 0
    # print(type(data))
    for sub in data:
        # print(sub.get('name'),sub.get('belongto'))
        
        organ_name = sub.pop('belongto')
        belongto = Organization.objects.get(name=organ_name)
        vconcentrators = sub.pop('vconcentrators')
        
        # create amrs concentrator
        try:
            amrs_community = Community.objects.create(**sub)
            # create concentrator
            vcommunity = {
                'amrs_community':amrs_community,
                'belongto':belongto,
                
            }
            
            try:
                vcommunity_obj = VCommunity.objects.create(**vcommunity)
                # bind concentrator
                for name in vconcentrators:
                    concetntrator = VConcentrator.objects.get(amrs_concentrator__name__exact=name)
                    vcommunity_obj.vconcentrators.add(concetntrator)
                vcommunity_obj.save()

                count += 1
            except Exception as e:
                print(e)
        except Exception as e:
            print("create community error:",e)
            continue

def concentrator():
    url = API_ROOT + 'concentrator/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)
    count = 0
    # print(type(data))
    for sub in data:
        # print(sub.get('name'),sub.get('belongto'))
        
        organ_name = sub.pop('belongto')
        belongto = Organization.objects.get(name=organ_name)
        # sub['belongto'] = belongto
        address = sub.pop('address')
        amrs_concentrator = sub.pop('amrs_concentrator')
        # create amrs concentrator
        try:
            amrs_concentrator['address'] = address
            amrs_concentrator_obj = Concentrator.objects.create(**amrs_concentrator)
            # create concentrator
            concentrator = {
                'amrs_concentrator':amrs_concentrator_obj,
                'belongto':belongto,
                
            }
            
            try:
                VConcentrator.objects.create(**concentrator)
                count += 1
            except Exception as e:
                print(e)
        except Exception as e:
            print("create concentrator error:",e,meter)
            continue


def retrieve_flow(commaddr):
    url = API_ROOT + 'station/list/'+commaddr +'/'
    response = requests.get(url)
    response.raise_for_status()
    data_data = json.loads(response.text)

    flow_data = data_data.pop('flow_data') # This is zncb.bigmeter
    flow_data_hour = data_data.pop('flow_data_hour') # This is zncb.bigmeter
    flow_data_day = data_data.pop('flow_data_day') # This is zncb.bigmeter
    flow_data_month = data_data.pop('flow_data_month')

    # create flow data
    collect_data = []
    for data in flow_data:
        data.pop("id")
        collect_data.append(HdbFlowData(**data))
        # HdbFlowData.objects.create(**data)
    HdbFlowData.objects.bulk_create(collect_data)

    collect_data = []
    for data in flow_data_hour:
        data.pop("id")
        collect_data.append(HdbFlowDataHour(**data))
    HdbFlowDataHour.objects.bulk_create(collect_data)

    collect_data = []
    for data in flow_data_day:
        data.pop("id")
        collect_data.append(HdbFlowDataDay(**data))
    HdbFlowDataDay.objects.bulk_create(collect_data)

    collect_data = []
    for data in flow_data_month:
        data.pop("id")
        collect_data.append(HdbFlowDataMonth(**data))
    HdbFlowDataMonth.objects.bulk_create(collect_data)


def flow_data():
    retrieve_flow('868246046995395')
    return
    count = 0
    station_lists = Station.objects.filter(id__gte=803)
    for bigm in station_lists:
        commaddr = bigm.amrs_bigmeter.commaddr
        try:
            retrieve_flow(commaddr)
        except Exception as e:
            print(e,commaddr)
            continue
        # thd = threading.Thread(target=retrieve_flow,args=(commaddr,))
        # thd.start()

        
        
        
def pressure_data():
    count = 0
    # pressure_lists = VPressure.objects.all()
    # for bigm in pressure_lists:
    #     commaddr = bigm.amrs_pressure.commaddr
    for commaddr in ['012345678903','012345678902','012345678901']:
        url = API_ROOT + 'pressure/list/'+commaddr +'/'
        response = requests.get(url)
        response.raise_for_status()
        data_data = json.loads(response.text)

        flow_data = data_data.pop('pressure_data') # This is zncb.bigmeter
        

        # create flow data
        collect_data=[]
        for data in flow_data:
            data.pop("id")
            collect_data.append(HdbPressureData(**data))
        HdbPressureData.objects.bulk_create(collect_data)
            

def station():
    url = API_ROOT + 'station/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)
    count = 0
    # print(type(data))
    for sub in data:
        # print(sub.get('name'),sub.get('belongto'))
        organ_name = sub.pop('belongto')
        description = sub.pop('description')
        biguser = sub.pop('biguser')
        focus = sub.pop('focus')
        
        belongto = Organization.objects.get(name=organ_name)
        # sub['belongto'] = belongto
        meter = sub.pop('meter') # This is meter-serialnumber

        amrs_bigmeter = sub.pop('amrs_bigmeter') # This is zncb.bigmeter
        # flow_data = amrs_bigmeter.pop('flow_data') # This is zncb.bigmeter
        # flow_data_hour = amrs_bigmeter.pop('flow_data_hour') # This is zncb.bigmeter
        # flow_data_day = amrs_bigmeter.pop('flow_data_day') # This is zncb.bigmeter
        # flow_data_month = amrs_bigmeter.pop('flow_data_month')
        

        # create Bigmeter
        try:
            
            amrs_bigmeter_obj = Bigmeter.objects.create(**amrs_bigmeter)
            meter_obj = Meter.objects.get(serialnumber=meter)
            # create station
            station = {
                'amrs_bigmeter':amrs_bigmeter_obj,
                'belongto':belongto,
                'meter':meter_obj,
                'biguser':biguser,
                'focus':focus,
                'description':description
            }
            
            try:
                Station.objects.create(**station)
                count += 1
            except Exception as e:
                print(e)

        except Exception as e:
            print("create Station error:",e,meter)
            continue

        # create flow data
        # for data in flow_data:
        #     data.pop("id")
        #     HdbFlowData.objects.create(**data)

        # for data in flow_data_hour:
        #     data.pop("id")
        #     HdbFlowDataHour.objects.create(**data)

        # for data in flow_data_day:
        #     data.pop("id")
        #     HdbFlowDataDay.objects.create(**data)

        # for data in flow_data_month:
        #     data.pop("id")
        #     HdbFlowDataMonth.objects.create(**data)
        
def meter():
    # repeted meter : 064893483823 , 201905116 ,201905116
    url = API_ROOT + 'meter/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)
    count = 0
    # print(type(data))
    for sub in data:
        # print(sub.get('name'),sub.get('belongto'))
        organ_name = sub.get('belongto')
        belongto = Organization.objects.get(name=organ_name)
        sub['belongto'] = belongto
        simid = sub.get('simid')
        if simid is not None:
            try:
                simid = SimCard.objects.get(simcardNumber=simid)
                sub['simid'] = simid
            except Exception as e:
                print(e,simid)
        try:
            Meter.objects.create(**sub)
            count += 1
        except Exception as e:
            print(e)        

def simcard():
    url = API_ROOT + 'simcard/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)
    count = 0
    # print(type(data))
    for sub in data:
        # print(sub.get('name'),sub.get('belongto'))
        organ_name = sub.get('belongto')
        belongto = Organization.objects.get(name=organ_name)
        sub['belongto'] = belongto
        try:
            SimCard.objects.create(**sub)
            count += 1
        except Exception as e:
            print(e)

def user():
    url = API_ROOT + 'user/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)
    count = 0
    # print(type(data))
    for sub in data:
        # print(sub.get('name'),sub.get('belongto'))
        organ_name = sub.get('belongto')
        belongto = Organization.objects.get(name=organ_name)
        sub['belongto'] = belongto
        role_name = sub.get('Role')
        Role = MyRoles.objects.get(name=role_name)
        sub['Role'] = Role
        try:
            user = User.objects.create(**sub)
            user.set_password('123456')
            user.save()
            count += 1
        except Exception as e:
            print(e)

def myrole():
    url = API_ROOT + 'role/list/'
    response = requests.get(url)
    response.raise_for_status()
    data = json.loads(response.text)
    count = 0
    # print(type(data))
    for sub in data:
        # print(sub.get('name'),sub.get('belongto'))
        organ_name = sub.get('belongto')
        belongto = Organization.objects.get(name=organ_name)
        sub['belongto'] = belongto
        try:
            MyRoles.objects.create(**sub)
        except Exception as e:
            print(e)

def organization():
    url = API_ROOT + 'organizations/list/1/'
    response = requests.get(url)
    response.raise_for_status()

    organfile = open("organ.json","w")
    organfile.write(response.text)
    organfile.close()

    orgs = json.loads(response.text)
    childrens = orgs.get('children')

    virvo = Organization.objects.get(name='威尔沃')
    
    def iter_child(foo,data):
        name = data.get('name')
        # parent = data.get('parent')
        child = data.pop('children')
        if name != '威尔沃':
            data['parent'] = foo
            parent = Organization.objects.create(**data)
        else:
            parent = foo

        print(name,len(child))
        if len(child) > 0:
            for sub in child:
                iter_child(parent,sub)

    iter_child(virvo,orgs)
    

def simcardchange():
    for s in Station.objects.all():
        simid = s.meter.simid.simcardNumber
        amrs_bigmeter = s.amrs_bigmeter
        commaddr = amrs_bigmeter.commaddr
        if simid != commaddr:
            print(simid,commaddr)
            amrs_bigmeter.commaddr = simid
            amrs_bigmeter.simid = simid
            amrs_bigmeter.save()
            s.amrs_bigmeter = amrs_bigmeter
            s.save()

def random_string_generator(size=10, chars=string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))


"""
When you call values() on a queryset where the Model has a ManyToManyField
and there are multiple related items, it returns a separate dictionary for each
related item. This function merges the dictionaries so that there is only
one dictionary per id at the end, with lists of related items for each.
"""
def merge_values(values):
    grouped_results = itertools.groupby(values, key=lambda value: value['id'])
    print(grouped_results)
    merged_values = []
    for k, g in grouped_results:
        print( k)
        groups = list(g)
        merged_value = {}
        for group in groups:
            for key, val in group.items():
                if not merged_value.get(key):
                    merged_value[key] = val
                elif val != merged_value[key]:
                    if isinstance(merged_value[key], list):
                        if val not in merged_value[key]:
                            merged_value[key].append(val)
                    else:
                        old_val = merged_value[key]
                        merged_value[key] = [old_val, val]
        merged_values.append(merged_value)
    return merged_values

class Command(BaseCommand):
    help = 'import data from A to B'

    def add_arguments(self, parser):
        # parser.add_argument('sTime', type=str)

        

        parser.add_argument(
            '--organization',
            action='store_true',
            dest='organization',
            default=False,
            help='sync myroles data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--myrole',
            action='store_true',
            dest='myrole',
            default=False,
            help='sync organizations data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--user',
            action='store_true',
            dest='user',
            default=False,
            help='sync User data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--simcard',
            action='store_true',
            dest='simcard',
            default=False,
            help='sync User data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--meter',
            action='store_true',
            dest='meter',
            default=False,
            help='sync meter data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--station',
            action='store_true',
            dest='station',
            default=False,
            help='sync station data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--concentrator',
            action='store_true',
            dest='concentrator',
            default=False,
            help='sync concentrator data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--community',
            action='store_true',
            dest='community',
            default=False,
            help='sync community data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--pressure',
            action='store_true',
            dest='pressure',
            default=False,
            help='sync pressure data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--secondwater',
            action='store_true',
            dest='secondwater',
            default=False,
            help='sync secondwater data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--watermeter',
            action='store_true',
            dest='watermeter',
            default=False,
            help='sync watermeter data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--waterusertype',
            action='store_true',
            dest='waterusertype',
            default=False,
            help='sync waterusertype data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--metercomm',
            action='store_true',
            dest='metercomm',
            default=False,
            help='sync metercomm data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--meterparameter',
            action='store_true',
            dest='meterparameter',
            default=False,
            help='sync meterparameter data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--meterprotocol',
            action='store_true',
            dest='meterprotocol',
            default=False,
            help='sync meterprotocol data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--alldata',
            action='store_true',
            dest='alldata',
            default=False,
            help='sync alldata data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--flow_data',
            action='store_true',
            dest='flow_data',
            default=False,
            help='sync flow_data data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--pressure_data',
            action='store_true',
            dest='pressure_data',
            default=False,
            help='sync pressure_data data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--personlied',
            action='store_true',
            dest='personlied',
            default=False,
            help='sync personlied data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--check_bigmeter',
            action='store_true',
            dest='check_bigmeter',
            default=False,
            help='sync check_bigmeter data between waterwork and bsc2000'
        )

        parser.add_argument(
            '--simcardchange',
            action='store_true',
            dest='simcardchange',
            default=False,
            help='sync simcardchange data between waterwork and bsc2000'
        )

        



    def handle(self, *args, **options):
        # sTime = options['sTime']
        t1=time.time()
        count = 0
        aft = 0

        if options['simcardchange']:
            simcardchange()

        if options['alldata']:
            # organization()
            # myrole()
            # user()
            # simcard()
            # meter()
            # station()
            # concentrator()
            # community()
            # pressure()
            # secondwater()
            # watermeter()
            # waterusertype()
            # meterprotocol()
            # meterparameter()
            # metercomm()
            # flow_data()
            # pressure_data()
            # walk_community()
            walk_watermeter()

        if options['check_bigmeter']:
            check_bigmeter()
            

        if options['personlied']:
            personlied()

        if options['flow_data']:
            flow_data()

        if options['pressure_data']:
            pressure_data()

        if options['metercomm']:
            metercomm()

        if options['meterparameter']:
            meterparameter()

        if options['meterprotocol']:
            meterprotocol()

        if options['waterusertype']:
            waterusertype()
        

        if options['watermeter']:
            watermeter()
        

        if options['secondwater']:
            secondwater()
        

        if options['pressure']:
            pressure()
        

        if options['community']:
            community()
        

        if options['concentrator']:
            concentrator()
        

        if options['station']:
            station()
        


        if options['meter']:
            meter()
        

        if options['simcard']:
            simcard()
        

        if options['user']:
            user()
        

        if options['myrole']:
            myrole()
        

        if options['organization']:
            organization()
        

        # print('cnt=',cnt,cnt2)
        t2 = time.time() - t1
        self.stdout.write(self.style.SUCCESS(f'total {count} row(s) Affected !,elapsed {t2}'))
