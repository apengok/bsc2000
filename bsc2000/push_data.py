# -*- coding: utf-8 -*-
import random
import time
import datetime
from apscheduler.schedulers.background import BackgroundScheduler

from django_apscheduler.jobstores import DjangoJobStore, register_events, register_job
from django.db import connections

from amrs.models import (
    Bigmeter,
    Watermeter,
)
from core.models import (
    Organization,
    Station,
    VWatermeter
)

from monitor.api.serializers import BigmeterPushDataSerializer
import logging
import json
import requests

logger_info = logging.getLogger('info_logger')


scheduler = BackgroundScheduler()
scheduler.add_jobstore(DjangoJobStore(), "default")


@register_job(scheduler, "interval", seconds=1200, replace_existing=True)
def auto_push_yuangu_bigmeter_data():
    '''
    南京远古、六合远古、南京远古东珀 下面的表主动推送数据到第三方平台
    http://58.213.198.18:8081/CityInterface/rest/services/CountyProduct.svc/PostMData
    http://58.213.198.18:8081/CityInterface/rest/services/CountyProduct.svc/PostMDataList
    '''
    # push_url = 'http://localhost:8000/CityInterface/rest/services/CountyProduct.svc/PostMDataList'
    push_url = 'http://58.213.198.18:8081/CityInterface/rest/services/CountyProduct.svc/PostMDataList'

    belongto_names = ['南京远古','六合远古','南京远古东珀']

    for name in belongto_names:
        belongto = Organization.objects.get(name=name)

        queryset = belongto.station_list_queryset('')
        queryset_list = [s.amrs_bigmeter for s in queryset]

        serializer_data = BigmeterPushDataSerializer(queryset_list,many=True).data
        
        # print(serializer_data)
        try:
            # 111.231.140.214
            res = requests.post(push_url,json=serializer_data).text
            # logger_info.info(f"Web Server response information: {res}")
            # print(res)
        except Exception as e:
            logger_info.error(f"Failed to send  to the cloud: {e}")

    
register_events(scheduler)

scheduler.start()
print("Scheduler started!")