# -*- coding:utf-8 -*-
from rest_framework.serializers import (
    HyperlinkedIdentityField,
    ModelSerializer,
    SerializerMethodField,
    ReadOnlyField
    )


# from accounts.api.serializers import UserDetailSerializer
# from comments.api.serializers import CommentSerializer
from accounts.models import MyRoles,User,LoginRecord

from amrs.models import (
    Concentrator,
    Community,
    Bigmeter,
    SecondWater,
    HdbFlowData,
    HdbPressureData
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


class LoginRecordSerializer(ModelSerializer):
    user = ReadOnlyField(source='user.user_name')
    belongto = ReadOnlyField(source='belongto.name')
    signin_time = SerializerMethodField()

    class Meta:
        model = LoginRecord
        fields = ['user','belongto','signin_time','ip','log_from','description']

    def get_signin_time(self,obj):
        return obj.signin_time.strftime("%Y-%m-%d %H:%M:%S")

# 查询历史数据 树列表中包括站点和压力表，根据groupType来返回对应的serializer
def create_HistoryQuery_serializer(groupType='station', commaddr=None):
    bigmeter = Bigmeter.objects.filter(commaddr=commaddr)

    class ReportsFlowSerializer(ModelSerializer):
        pressure = SerializerMethodField()
        meterv = SerializerMethodField()
        gprsv = SerializerMethodField()
        signlen = SerializerMethodField()

        class Meta:
            model = HdbFlowData
            fields = [
                'readtime',
                'flux',
                'plustotalflux',
                'reversetotalflux',
                'pressure',
                'meterv',
                'gprsv',
                'signlen'
            ]
        
        def get_pressure(self,obj):
            return '-'

        def get_meterv(self,obj):
            if bigmeter.exists():
                return bigmeter.first().meterv
            else:
                return ''

        def get_gprsv(self,obj):
            if bigmeter.exists():
                return bigmeter.first().gprsv
            else:
                return ''

        def get_signlen(self,obj):
            if bigmeter.exists():
                return bigmeter.first().signlen
            else:
                return ''

    class ReportsPressureSerializer(ModelSerializer):
        flux = SerializerMethodField()
        plustotalflux = SerializerMethodField()
        reversetotalflux = SerializerMethodField()
        meterv = SerializerMethodField()
        gprsv = SerializerMethodField()
        signlen = SerializerMethodField()

        class Meta:
            model = HdbPressureData
            fields = [
                'readtime',
                'flux',
                'plustotalflux',
                'reversetotalflux',
                'pressure',
                'meterv',
                'gprsv',
                'signlen'
            ]
        
        def get_flux(self,obj):
            return '-'
        
        def get_plustotalflux(self,obj):
            return '-'

        def get_reversetotalflux(self,obj):
            return '-'

        def get_meterv(self,obj):
            if bigmeter.exists():
                return bigmeter.first().meterv
            else:
                return ''

        def get_gprsv(self,obj):
            if bigmeter.exists():
                return bigmeter.first().gprsv
            else:
                return ''

        def get_signlen(self,obj):
            if bigmeter.exists():
                return bigmeter.first().signlen
            else:
                return ''

    if groupType == 'station':
        return ReportsFlowSerializer
    return ReportsPressureSerializer

class ReportsMeterSerializer(ModelSerializer):
    simid = SerializerMethodField()
    belongto = SerializerMethodField()
    flow_today = SerializerMethodField() 
    flow_yestoday = SerializerMethodField() 
    flow_b_yestoday = SerializerMethodField() 
    flow_tomon  = SerializerMethodField()
    flow_yestomon  = SerializerMethodField()
    flow_b_yestomon = SerializerMethodField() 
    station_name = SerializerMethodField()
    station = SerializerMethodField()

    class Meta:
        model = Meter
        fields = '__all__'
        extra_fields = [
            
            "flow_today", 
            "flow_yestoday", 
            "flow_b_yestoday", 
            "flow_tomon", 
            "flow_yestomon", 
            "flow_b_yestomon", 
            "station_name",
            "station"
        ]

    def get_simid(self,obj):
        return obj.simid.simcardNumber if obj.simid else ''

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_flow_today(self,obj):
        return 1

    def get_flow_yestoday(self,obj):
        return 2

    def get_flow_b_yestoday(self,obj):
        return 3

    def get_flow_tomon(self,obj):
        return 4

    def get_flow_yestomon(self,obj):
        return 5

    def get_flow_b_yestomon(self,obj):
        return 6

    def get_station(self,obj):
        if obj.station_set.first():
            return obj.station_set.first().amrs_bigmeter.username
        return ''

    def get_station_name(self,obj):
        if obj.station_set.first():
            return obj.station_set.first().amrs_bigmeter.username
        return ''