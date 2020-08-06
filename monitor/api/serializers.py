# -*- coding:utf-8 -*-
import datetime

from rest_framework.serializers import (
    HyperlinkedIdentityField,
    ModelSerializer,
    SerializerMethodField,
    ReadOnlyField
    )


# from accounts.api.serializers import UserDetailSerializer
# from comments.api.serializers import CommentSerializer
from accounts.models import MyRoles,User

from amrs.models import (
    Concentrator,
    Community,
    Bigmeter,
    SecondWater,
    Alarm,
)

from core.models import (
    Organization,
    SimCard,
    Meter,
    VConcentrator,
    VCommunity,
    Station,
    DmaStation,
    VSecondWater,
    DMABaseinfo,
)

class BigmeterPushDataSerializer(ModelSerializer):
    DeviceID = ReadOnlyField(source='serialnumber')
    DeviceName = ReadOnlyField(source='username')
    RealData = SerializerMethodField()
    HistoryData = SerializerMethodField()

    class Meta:
        model = Bigmeter

        fields = ['DeviceID','DeviceName','RealData','HistoryData']

    def get_RealData(self,obj):

        return {
            "PT":obj.fluxreadtime if obj.fluxreadtime else '1970-01-01 00:00:00',
            "PV":obj.plustotalflux if obj.plustotalflux else '0.0'
        }

    def get_HistoryData(self,obj):
        return []

class BigmeterRTSerializer(ModelSerializer):
    id = ReadOnlyField(source='commaddr')
    belongto = SerializerMethodField()
    alarm = SerializerMethodField()
    commstate = SerializerMethodField()
    
    # fluxreadtime = SerializerMethodField()
    # serialnumber = SerializerMethodField()
    # reportperiod = SerializerMethodField()
    
    class Meta:
        model = Bigmeter
        fields = ['id','userid','belongto','username','serialnumber','commstate','dn','fluxreadtime','manufacturer',
            'pickperiod','reportperiod','flux','plustotalflux','reversetotalflux','pressurereadtime',
            'pressure','meterv','gprsv','signlen','alarm'
        ]

    def get_belongto(self,obj):
        try:
            return obj.station.belongto.name
        except:
            pass
        try:
            return obj.vpressure.belongto.name
        except:
            pass
        return ''

    def get_alarm(self,obj):
        return 0
        return  Alarm.objects.filter(commaddr=obj.commaddr).count()

    def get_commstate(self,obj):
        now = datetime.datetime.now()
        d7 = now - datetime.timedelta(days=7)
        try:
            dn = datetime.datetime.strptime(obj.fluxreadtime,"%Y-%m-%d %H:%M:%S")
            if d7 < dn:
                return 1
            
        except:
            pass

        return 0

    # def get_fluxreadtime(self,obj):
    #     try:
    #         return obj.station.meter.dn
    #     except:
    #         pass
        
    #     return ''

    # def get_reportperiod(self,obj):
    #     try:
    #         return obj.station.meter.check_cycle
    #     except:
    #         pass
        
    #     return ''

    # def get_serialnumber(self,obj):
    #     try:
    #         return obj.station.meter.serialnumber
    #     except:
    #         pass
    #     try:
    #         return obj.vpressure.serialnumber
    #     except:
    #         pass
    #     return ''

class StationListSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    username = SerializerMethodField()
    usertype = SerializerMethodField()
    simid = SerializerMethodField()
    dn = SerializerMethodField()
    metertype = SerializerMethodField()
    serialnumber = SerializerMethodField()
    madedate = SerializerMethodField()
    related = SerializerMethodField()

    class Meta:
        model = Station
        fields = [
            "id","belongto","biguser","focus","username","usertype","simid","dn","metertype","serialnumber","madedate","related"
        ]

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_username(self,obj):
        return obj.amrs_bigmeter.username

    def get_usertype(self,obj):
        return obj.amrs_bigmeter.usertype

    def get_simid(self,obj):
        return obj.amrs_bigmeter.simid

    def get_dn(self,obj):
        return obj.amrs_bigmeter.dn

    def get_metertype(self,obj):
        return obj.amrs_bigmeter.metertype

    def get_serialnumber(self,obj):
        return obj.amrs_bigmeter.serialnumber

    def get_madedate(self,obj):
        return obj.amrs_bigmeter.madedate

    def get_related(self,obj):
        return DmaStation.objects.filter(station_id=obj.amrs_bigmeter.commaddr).exists()



class MapStationSerializer(ModelSerializer):
    properties = SerializerMethodField()

    class Meta:
        model = Bigmeter
        fields = ['lng','lat','properties']


    def get_properties(self,obj):
        prop = {
            'username':obj.username,
            'belongto':obj.station.belongto.name,
            'meter':obj.station.meter.serialnumber if obj.station.meter else '',
            'metertype':obj.metertype,
            'dn':obj.dn,
            'commstate':obj.commstate,
            'fluxreadtime':obj.fluxreadtime,
            'flux':obj.flux,
            'plustotalflux':obj.plustotalflux,
            'pressure':obj.pressure,
            'signlen':obj.signlen
        }

        return prop



class MapSecondWaterSerializer(ModelSerializer):
    properties = SerializerMethodField()

    class Meta:
        model = SecondWater
        fields = ['lng','lat','properties']


    def get_properties(self,obj):
        prop = {
            'name':obj.name,
            'belongto':obj.vsecondwater.belongto.name,
            'coortype':obj.coortype,
            "status":"在线" ,
            "readtime":"13:14" ,
            "flux":'3.14',
            "press_out":"1",
            "press_in":'',
        }

        return prop
