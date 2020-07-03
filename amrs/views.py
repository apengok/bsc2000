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

from rest_framework.mixins import DestroyModelMixin, UpdateModelMixin


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
    SecondWater
)

# from .pagination import PostLimitOffsetPagination, PostPageNumberPagination
# from .permissions import IsOwnerOrReadOnly

from .serializers import (
    BigmeterCreateSerializer, 
    
)


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
import json


class BigmeterCreateAPIView(CreateAPIView):
    queryset = Bigmeter.objects.all()
    serializer_class = BigmeterCreateSerializer
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        print('bigmeter post:',self.request.POST)
        print('bigmeter.data:',self.request.data)
        data = {}
        # data["name"] = self.request.data.get("name")
        # data["ftype"] = self.request.data.get("ftype")
        # data["pId"] = self.request.data.get("pId")
        # data["dma_no"] = self.request.data.get("dma_no")
        # data["description"] = self.request.data.get("description")
        # data["createDataUsername"] = self.request.user.user_name
        # data["updateDataUsername"] = self.request.user.user_name
        # # data["createDataUsername"] = self.request.data.get("createDataUsername")
        # organ_name = self.request.data.get("belongto")
        # try:
        #     belongto = Organization.objects.filter(name=organ_name).first()
        #     data["belongto"] = belongto.pk
        # except Exception as e:
        #     print(e)
        #     data["belongto"] = Organization.objects.first().pk
        # shape = {
        #     "zonetype":self.request.data.get("type"),
        #     "shape":self.request.data.get("shape"),
        #     "geomjson":self.request.data.get("pgeojson")
        # }
        # data["shape"] = shape
        
        user = self.request.user
        user_groupid = user.belongto.cid
        # instance = form.save(commit=False)
        organ_name = self.request.data.get('belongto')
        
        belongto = Organization.objects.get(name=organ_name)
        # instance.belongto = organization
        
        serialnumber = self.request.data.get("serialnumber")
        meter = Meter.objects.get(serialnumber=serialnumber)
        # instance.meter = meter

        # amrs bigmeter
        lng = self.request.data.get("lng")
        lat = self.request.data.get("lat")
        username = self.request.data.get("username")
        usertype = self.request.data.get("usertype")
        madedate = self.request.data.get("madedate")
        metertype = self.request.data.get("metertype")
        installationsite = self.request.data.get("installationsite")
        commaddr = meter.simid.simcardNumber
        amrs_bigmeter = {
            "serialnumber":serialnumber,
            "username":username,
            "usertype":usertype,
            "lng":lng,
            "lat":lat,
            "commaddr":commaddr,
            "simid":commaddr,
            "madedate":madedate,
            "metertype":metertype,
            "installationsite":installationsite,
            "belongto":belongto.pk
        }
        # print('\r\t\r\tdata:',data)
        serializer = BigmeterCreateSerializer(data=amrs_bigmeter)
        if serializer.is_valid():
            serializer.save()
            return Response({"success":1})
        return Response(serializer.errors)



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
    
    # per_hour = per_hour_in_day(commaddr,today_str)

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
            # "per_hour":per_hour,
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