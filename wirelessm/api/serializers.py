# -*- coding:utf-8 -*-
from django.db.models import Q

from rest_framework.serializers import (
    HyperlinkedIdentityField,
    ModelSerializer,
    SerializerMethodField,
    ReadOnlyField,
    )


# from accounts.api.serializers import UserDetailSerializer
# from comments.api.serializers import CommentSerializer
from accounts.models import MyRoles,User

from amrs.models import (
    Concentrator,
    Community,
    Watermeter,
    HdbWatermeterData,
    HdbWatermeterDay,
    HdbWatermeterMonth,
    Alarm

)

from core.models import (
    Organization,
    SimCard,
    Meter,
    VConcentrator,
    VCommunity,
    Station,
    DmaStation,
    VWatermeter
)

from amrs.serializers import (
    HdbWatermeterDaySerializer,
)

import datetime



class WatermeterStaticSerializer(ModelSerializer):
    
    class Meta:
        model = Watermeter
        fields = ["id","serialnumber","numbersth","buildingname","roomname",#"communityid","concentrator",
            "username","usertel","metercontrol"]

class WatermeterSerializer(ModelSerializer):
    
    class Meta:
        model = Watermeter
        fields = ["id","serialnumber","numbersth","buildingname","roomname",#"communityid","concentrator",
            "username","usertel","metercontrol"]

class VWatermeterListSerializer(ModelSerializer):
    communityid = SerializerMethodField()
    concentrator = SerializerMethodField()
    amrs = SerializerMethodField()

    class Meta:
        model = Watermeter
        fields = ["id","communityid","concentrator","amrs"]

    def get_communityid(self,obj):
        return obj.communityid.amrs_community.name

    def get_concentrator(self,obj):
        if obj.communityid.vconcentrators.count() > 0:
            return obj.communityid.vconcentrators.first().amrs_concentrator.name
        return ''

    def get_amrs(self,obj):
        return WatermeterSerializer(obj.amrs_watermeter).data

    # def get_concentrator(self,obj):
    #     ret = []
        
    #     for v in obj.vcommunity.vconcentrators.all():
    #         ret.append(v.amrs_concentrator.name)
    #         # return obj.vcommunity.vconcentrators.first().amrs_concentrator.name
    #     if len(ret) > 0:
    #         return ','.join(ret)
    #     return ''
    

# class HdbWatermeterDayQSerializer(ModelSerializer):
    
#     class Meta:
#         model = HdbWatermeterDay

#         fields = ['hdate','dosage']

class WAlarmSerializer(ModelSerializer):
    """
    集中器 户表报警信息
    """
    class Meta:
        model = Alarm
        fields = [
            'alarmtime',
            'alarmcontent',
        ]

class WStatsticsSerializer(ModelSerializer):
    """
    无线抄表 综合数据
    """
    belongto = SerializerMethodField()
    todayuse = SerializerMethodField()
    yestodayuse = SerializerMethodField()
    totaluser = SerializerMethodField()
    zerouser = SerializerMethodField()
    yestodaypercent = SerializerMethodField()
    faultuser = SerializerMethodField()
    overflowuser = SerializerMethodField()
    nouse3m = SerializerMethodField()
    gongdan = SerializerMethodField()

    class Meta:
        model = Watermeter
        fields = [
            'belongto',
            'todayuse',
            'yestodayuse',
            'totaluser',
            'zerouser',
            'yestodaypercent',
            'faultuser',
            'overflowuser',
            'nouse3m',
            'gongdan'
        ]
    
    def get_belongto(self,obj):
        return 'virvo'
    
    def get_todayuse(self,obj):
        return '1'
    def get_yestodayuse(self,obj):
        return '2'
    def get_totaluser(self,obj):
        return '3'
    def get_zerouser(self,obj):
        return '4'
    def get_yestodaypercent(self,obj):
        return '5'
    def get_faultuser(self,obj):
        return '6'
    def get_overflowuser(self,obj):
        return 7
    def get_nouse3m(self,obj):
        return 8
    def get_gongdan(self,obj):
        return '123456'
    

class WQDetailSerializer(ModelSerializer):
    """
        户表管理 数据查询 table list 
    """
    # belongto = ReadOnlyField(source='vwatermeter.belongto.name')
    day_use = SerializerMethodField()
    alarm = SerializerMethodField()
    community = SerializerMethodField()
    rvalue = SerializerMethodField()
    roomname = SerializerMethodField()
    dur_use = SerializerMethodField()

    class Meta:
        model = Watermeter
        fields = [
            "id",
            "numbersth",
            "buildingname",
            "roomname",
            # "belongto",#current_user.belongto.name,
            "nodeaddr",
            "wateraddr",
            "serialnumber",
            "communityid",
            "username",
            "usertel",
            "installationsite",
            "manufacturer",
            "metertype",
            "dn",
            "rvalue",
            "rtime",
            "commstate",
            "valvestate",
            "signlen",
            "temperature",
            "meterv",
            "day_use",
            "alarm",
            "community",
            "dur_use"
            
        ]
    
    def get_community(self,obj):
        try:
            return obj.vwatermeter.communityid.amrs_community.name
        except:
            pass
        return ''

    def get_rvalue(self,obj):
        try:
            return float(obj.rvalue)
        except:
            return ''
    
    def get_roomname(self,obj):
        return obj.roomname
        try:
            # print(type(obj.roomname))
            return int(float(obj.roomname))
        except:
            return obj.roomname

    def get_day_use(self,obj):
        today = datetime.datetime.today()
        qmonth = today.strftime("%Y-%m")
        tmp = HdbWatermeterDay.objects.filter(
                Q(communityid=obj.communityid) &
                Q(waterid=obj.id) &
                Q(hdate__startswith=qmonth)
            ).distinct()
        dosage_serializer =  HdbWatermeterDaySerializer(tmp,many=True).data
        tmp = {}
        for s in dosage_serializer:
            d = "d"+s["hdate"][-2:]
            tmp[d] = round(float(s["dosage"]),2)

        return tmp

    def get_dur_use(self,obj):
        return ''

    def get_alarm(self,obj):
        return ''
        try:
            content = Alarm.objects.filter(commaddr=obj.wateraddr).last().alarmcontent
        except:
            content = ''
        return content



class WQSerializer(ModelSerializer):
    """
        户表管理 数据查询 table list 
    """
    belongto = ReadOnlyField(source='vwatermeter.belongto.name')
    community = ReadOnlyField(source='communityid.amrs_community.name')
    details = SerializerMethodField()

    class Meta:
        model = VWatermeter        
        fields = ['belongto','community','details']

    def get_details(self,obj):
        return WQDetailSerializer(obj.amrs_watermeter).data

def create_wqSerializer(sTime,eTime):

    class WQSerializer(ModelSerializer):
        """
            户表管理 数据查询 table list 
        """
        belongto = ReadOnlyField(source='vwatermeter.belongto.name')
        community = ReadOnlyField(source='communityid.amrs_community.name')
        details = SerializerMethodField()
        dur_use = SerializerMethodField()

        class Meta:
            model = VWatermeter        
            fields = ['belongto','community','details','dur_use']

        def get_details(self,obj):
            return WQDetailSerializer(obj.amrs_watermeter).data

        # def get_dur_use(self,obj):
        #     waterid = obj.amrs_watermeter.id
        #     flux_obj = HdbWatermeterDay.objects.all() #.filter(waterid=waterid,rtime__range=[sTime,eTime]).all()
        #     try:
        #         return float(flux_obj.last().dosage)# - float(flux_obj.first().dosage)
        #     except Exception as e:
        #         print(waterid,obj.amrs_watermeter.wateraddr,e,flux_obj.count())
        #         return '0'
        
        def get_dur_use(self,obj):
            wateraddr = obj.amrs_watermeter.wateraddr
            flux_obj = HdbWatermeterData.objects.filter(wateraddr=wateraddr,readtime__range=[sTime,eTime]).all()
            # print("\r\n\r\nkdasfjewqru*&^&$%^*&()(*&^%^",flux_obj.count())
            try:
                # print(float(flux_obj.last().totalflux) ,'-', float(flux_obj.first().totalflux))
                return float(flux_obj.last().totalflux) - float(flux_obj.first().totalflux)
            except Exception as e:
                # print(wateraddr,obj.amrs_watermeter.wateraddr,e,flux_obj.count())
                return '0'


    return WQSerializer

class MapConcentratorSerializer(ModelSerializer):
    properties = SerializerMethodField()

    class Meta:
        model = Concentrator
        fields = ['lng','lat','properties']


    def get_properties(self,obj):
        prop = {
            'name':obj.name,
            'belongto':obj.vconcentrator.belongto.name,
            "status":"在线" ,
            "readtime":"13:14" ,
            "flux":'3.14',
            "press_out":"1",
            "press_in":'',
        }

        return prop


class WatermeterImportSerializer(ModelSerializer):
    class Meta:
        model = Watermeter
        fields = ('serialnumber', 'communityid', 'metertype','wateraddr','numbersth','buildingname','roomname',
            'username','usertel','dn','manufacturer','installationsite','metercontrol','madedate','dosage','rtime'
        )


class VWatermeterImportSerializer(ModelSerializer):
    amrs_watermeter = WatermeterImportSerializer()

    class Meta:
        model = VWatermeter
        fields = ['belongto','communityid','useraddr','amrs_watermeter']

    def create(self,validated_data):
        amrs_watermeter = validated_data.pop("amrs_watermeter")
        amrs_watermeter_obj = Watermeter.objects.create(**amrs_watermeter)
        validated_data["amrs_watermeter"] = amrs_watermeter_obj
        vwatermeter_obj = VWatermeter.objects.create(**validated_data)
        return vwatermeter_obj
        