# -*- coding:utf-8 -*-
from django.core.management.base import BaseCommand, CommandError


import time
import datetime
import logging
import string
import itertools
from accounts.models import MyRoles,User
from core.models import Organization
from core.menus import buildbasetree
import json
from monitor.api.serializers import BigmeterRTSerializer,BigmeterPushDataSerializer
from amrs.models import Bigmeter
import requests

logger_info = logging.getLogger('info_logger')


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


def auto_push_yuangu_bigmeter_data():
    '''
    南京远古、六合远古、南京远古东珀 下面的表主动推送数据到第三方平台
    http://58.213.198.18:8081/CityInterface/rest/services/CountyProduct.svc/PostMData
    http://58.213.198.18:8081/CityInterface/rest/services/CountyProduct.svc/PostMDataList
    '''
    belongto_names = ['南京远古','六合远古','南京远古东珀']
    extra_names = ["zxll","ssll","fxll","yl","jbdl","ycdl","xhqd","zt"]
    extra_dbnames = ['plustotalflux','flux','reversetotalflux','pressure','meterv','gprsv','signlen','commstate']
    push_data = []
    belongto = Organization.objects.get(name='南京远古东珀')

    queryset = belongto.station_list_queryset('')
    queryset_list = [s.amrs_bigmeter for s in queryset]

    serializer_data = BigmeterPushDataSerializer(queryset_list,many=True).data
    for sd in serializer_data:
        DeviceID = sd.get("serialnumber")
        DeviceName = sd.get("username")
        pt = sd.get("fluxreadtime","1970-01-01 00:00:00")
        for i in range(len(extra_names)):
            # print(extra_dbnames[i],':',sd.get(extra_dbnames[i]))
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
    
    # push_url = 'http://localhost:8000/CityInterface/rest/services/CountyProduct.svc/PostMDataList'
    push_url = 'http://58.213.198.18:8081/CityInterface/rest/services/CountyProduct.svc/PostMDataList'
    # print(push_data)
    try:
        # 111.231.140.214
        res = requests.post(push_url,json=push_data).text
        # logger_info.info(f"Web Server response information: {res}")
        print('res:',res)
    except Exception as e:
        print(f"Failed to send  to the cloud: {e}")


class Command(BaseCommand):
    help = 'deloy project by intializer related data.'

    def add_arguments(self, parser):
        # parser.add_argument('sTime', type=str)

        

        parser.add_argument(
            '--push_data',
            action='store_true',
            dest='push_data',
            default=False,
            help='push data test'
        )




    def handle(self, *args, **options):
        # sTime = options['sTime']
        t1=time.time()
        count = 0
        aft = 0

        

        if options['push_data']:

            auto_push_yuangu_bigmeter_data()
            
            
            
                
        
        # print('cnt=',cnt,cnt2)
        t2 = time.time() - t1
        self.stdout.write(self.style.SUCCESS(f'total {count}  Affected {aft} row(s)!,elapsed {t2}'))
