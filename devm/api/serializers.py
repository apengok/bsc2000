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
    MeterParameter,
)

from core.models import (
    Organization,
    SimCard,
    Meter,
    VConcentrator,
    VPressure,
)



class SimCardListSerializer(ModelSerializer):
    meter = SerializerMethodField()
    belongto = ReadOnlyField(source='belongto.name')
    
    class Meta:
        model = SimCard
        fields = [
            "id","simcardNumber","isStart","iccid","imei","imsi","belongto",
            "operator","simFlow","openCardTime","endTime","remark","create_date","update_date","meter"
        ]

    def get_meter(self,obj):
        if obj.meter and obj.meter.count()>0:
            
            return obj.meter.first().serialnumber
        return ''



class MeterListSerializer(ModelSerializer):
    simid = SerializerMethodField()
    belongto = SerializerMethodField()
    station = SerializerMethodField()

    class Meta:
        model = Meter
        fields = [
            "id","serialnumber","simid","version","dn",
        "metertype","belongto","mtype","manufacturer","protocol","R","q3","q1","check_cycle","state","station"
        ]

    def get_simid(self,obj):
        if obj.simid:
            return obj.simid.simcardNumber
        return None

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_station(self,obj):
        if obj.station_set.count() > 0:
            return obj.station_set.first().amrs_bigmeter.username
        return ''




class VConcentratorListSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    id = SerializerMethodField()
    

    class Meta:
        model = Concentrator
        fields = [
            "id",'belongto',
            'name','lng','lat','coortype','model','serialnumber','manufacturer','madedate','commaddr','address'
        ]

    def get_belongto(self,obj):
        return obj.vconcentrator.belongto.name

    def get_id(self,obj):
        return obj.commaddr



class VConcentratorSelectSerializer(ModelSerializer):
    id = ReadOnlyField(source='amrs_concentrator.id')
    name = ReadOnlyField(source='amrs_concentrator.name')
    

    class Meta:
        model = VConcentrator
        fields = [
            "id","name"
        ]


class CommunitySelectSerializer(ModelSerializer):
    id = ReadOnlyField(source='pk')
    

    class Meta:
        model = Community
        fields = [
            "id","name"
        ]


class MeterSelectSerializer(ModelSerializer):
    id = ReadOnlyField(source='pk')
    name = ReadOnlyField(source='serialnumber')
    

    class Meta:
        model = Meter
        fields = [
            "id","name"
        ]

class SimcardSelectSerializer(ModelSerializer):
    name = ReadOnlyField(source='simcardNumber')
    

    class Meta:
        model = SimCard
        fields = [
            "id","name"
        ]


class SimcardIEMISelectSerializer(ModelSerializer):
    name = ReadOnlyField(source='imei')
    

    class Meta:
        model = SimCard
        fields = [
            "id","name"
        ]


class PressureSelectSerializer(ModelSerializer):
    id = ReadOnlyField(source='amrs_pressure.commaddr')
    name = ReadOnlyField(source='amrs_pressure.username')
    # id = SerializerMethodField()
    # name = SerializerMethodField()

    class Meta:
        model = VPressure
        fields = [
            "id","name"
        ]

    # def get_id(self,obj):
    #     return obj.amrs_pressure.commaddr

    # def get_name(self,obj):
    #     return obj.amrs_pressure.username
    

class VPressureSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    id = SerializerMethodField()
    serialnumber = SerializerMethodField()
    manufacturer = SerializerMethodField()
    lng = SerializerMethodField()
    lat = SerializerMethodField()
    coortype = SerializerMethodField()
    commaddr = SerializerMethodField()
    metertype = SerializerMethodField()

    class Meta:
        model = VPressure
        fields = [
            "id",'belongto','version','check_cycle','state','protocol','metertype',
            'lng','lat','coortype','serialnumber','manufacturer','commaddr'
        ]

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_id(self,obj):
        return obj.amrs_pressure.commaddr

    def get_commaddr(self,obj):
        return obj.amrs_pressure.commaddr

    def get_lng(self,obj):
        return obj.amrs_pressure.lng

    def get_lat(self,obj):
        return obj.amrs_pressure.lat

    def get_coortype(self,obj):
        return obj.amrs_pressure.coortype

    def get_serialnumber(self,obj):
        return obj.amrs_pressure.serialnumber

    def get_manufacturer(self,obj):
        return obj.amrs_pressure.manufacturer

    def get_metertype(self,obj):
        return obj.amrs_pressure.metertype


    
class MeterParameterSerializer(ModelSerializer):
    class Meta:
        model = MeterParameter
        fields = '__all__'
   
    
class MeterParameterListSerializer(ModelSerializer):
    class Meta:
        model = MeterParameter
        fields = ["commaddr","commandstate","commandtype","sendparametertime","readparametertime"]
    