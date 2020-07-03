# -*- coding:utf-8 -*-
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
    SecondWater
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

class BigmeterRTSerializer(ModelSerializer):
    id = ReadOnlyField(source='commaddr')
    belongto = SerializerMethodField()
    alarm = SerializerMethodField()

    class Meta:
        model = Bigmeter
        fields = ['id','belongto','username','serialnumber','commstate','dn','fluxreadtime',
            'pickperiod','reportperiod','flux','plustotalflux','reversetotalflux',
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

