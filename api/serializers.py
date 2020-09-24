# -*- coding:utf-8 -*-
from rest_framework.serializers import (
    HyperlinkedIdentityField,
    ModelSerializer,
    SerializerMethodField,
    ReadOnlyField,
    PrimaryKeyRelatedField
    )


# from accounts.api.serializers import UserDetailSerializer
# from comments.api.serializers import CommentSerializer
from accounts.models import MyRoles,User

from amrs.models import (
    Concentrator,
    Community,
    Bigmeter,
    SecondWater,
    Watermeter,
    HdbWatermeterDay,
    HdbWatermeterMonth,
    HdbFlowData,
    HdbFlowDataHour,
    HdbFlowDataDay,
    HdbFlowDataMonth,
    HdbPressureData,
    Metercomm,
    MeterParameter,
    Meterprotocol,
)


from core.models import(
    Organization,
    Personalized,
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
)

class PersonalizedSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    class Meta:
        model = Personalized
        fields = '__all__'

    def get_belongto(self,obj):
        return obj.belongto.name if obj.belongto else None

class MetercommSerializer(ModelSerializer):
    class Meta:
        model = Metercomm
        fields = '__all__'



class MeterParameterSerializer(ModelSerializer):
    class Meta:
        model = MeterParameter
        fields = '__all__'

class MeterprotocolSerializer(ModelSerializer):
    class Meta:
        model = Meterprotocol

        fields = '__all__'



class HdbWatermeterDaySerializer(ModelSerializer):
    class Meta:
        model = HdbWatermeterDay

        fields = '__all__'



class HdbWatermeterMonthSerializer(ModelSerializer):
    class Meta:
        model = HdbWatermeterMonth

        fields = '__all__'     


class HdbPressureDataSerializer(ModelSerializer):        
    class Meta:
        model = HdbPressureData
        fields = '__all__'


class HdbFlowDataSerializer(ModelSerializer):        
    class Meta:
        model = HdbFlowData
        fields = '__all__'

class HdbFlowDataHourSerializer(ModelSerializer):        
    class Meta:
        model = HdbFlowDataHour
        fields = '__all__'      


class HdbFlowDataDaySerializer(ModelSerializer):        
    class Meta:
        model = HdbFlowDataDay
        fields = '__all__'      


class HdbFlowDataMonthSerializer(ModelSerializer):        
    class Meta:
        model = HdbFlowDataMonth
        fields = '__all__'       

          
class WaterUserTypeSerializer(ModelSerializer):
    class Meta:
        model = WaterUserType
        fields = ['usertype','explains']


class WatermeterSerializer(ModelSerializer):
    # watermeter_day = SerializerMethodField()
    # watermeter_month = SerializerMethodField()

    class Meta:
        model = Watermeter
        fields = '__all__'
        # extra_fields = ['watermeter_day','watermeter_month']
        # fields = ['nodeaddr','wateraddr','numbersth','buildingname','roomname','username','usertel','dn','serialnumber',
        #     'communityid','manufacturer','madedate','installationsite','metercontrol','metertype']

    # def get_watermeter_day(self,obj):
    #     return HdbWatermeterDaySerializer(HdbWatermeterDay.objects.filter(waterid=obj.id,communityid=obj.communityid),many=True).data

    # def get_watermeter_month(self,obj):
    #     return HdbWatermeterMonthSerializer(HdbWatermeterMonth.objects.filter(waterid=obj.id,communityid=obj.communityid),many=True).data

    
class VWatermeterSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    communityid = SerializerMethodField()
    amrs_watermeter = SerializerMethodField()
    
    class Meta:
        model = VWatermeter
        fields = [
            'belongto','useraddr','communityid','amrs_watermeter'
        ]

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_communityid(self,obj):
        return obj.communityid.name

    def get_amrs_watermeter(self,obj):
        return WatermeterSerializer(obj.amrs_watermeter).data


class SecondWaterSerializer(ModelSerializer):

    class Meta:
        model = VSecondWater
        fields = ['name','address','lng','lat','coortype',]

    
class VSecondWaterSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    amrs_secondwater = SerializerMethodField()
    
    class Meta:
        model = VSecondWater
        fields = [
            'belongto','version','product_date','artist','artistPreview','manufacturer','amrs_secondwater'
        ]

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_amrs_secondwater(self,obj):
        return SecondWaterSerializer(obj).data

class HdbPressureDataSerializer(ModelSerializer):
    class Meta:
        model = HdbPressureData
        fields = '__all__'

class PressureSerializer(ModelSerializer):
    # pressure_data = SerializerMethodField()

    class Meta:
        model = Bigmeter
        fields = '__all__'
    #     extra_fields = ['pressure_data']

    # def get_pressure_data(self,obj):
    #     return HdbPressureDataSerializer(HdbPressureData.objects.filter(commaddr=obj.commaddr),many=True).data

class PressureDataSerializer(ModelSerializer):
    pressure_data = SerializerMethodField()

    class Meta:
        model = Bigmeter
        # fields = '__all__'
        fields = ['pressure_data']

    def get_pressure_data(self,obj):
        return HdbPressureDataSerializer(HdbPressureData.objects.filter(commaddr=obj.commaddr,readtime__range=['2019-12-01','2020-02-28']),many=True).data

class VPressureSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    amrs_pressure = SerializerMethodField()
    
    class Meta:
        model = VPressure
        fields = ['id',
            'belongto','version','check_cycle','state','protocol','amrs_pressure'
        ]

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_amrs_pressure(self,obj):
        return PressureSerializer(obj.amrs_pressure).data


class CommunitySerializer(ModelSerializer):
    class Meta:
        model = Community
        fields = '__all__'

class VCommunitySerializer(ModelSerializer):
    belongto = SerializerMethodField()
    vconcentrators = SerializerMethodField()
    amrs_community = SerializerMethodField()

    class Meta:
        model = VCommunity
        fields = [
            'belongto','vconcentrators','amrs_community'
            
        ]

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_vconcentrators(self,obj):
        concentrator = []
        for c in obj.vconcentrators.all():
            concentrator.append(c.amrs_concentrator.name)
        return concentrator

    def get_amrs_community(self,obj):
        return CommunitySerializer(obj.amrs_community).data


# zncb
class ConcentratorSerializer(ModelSerializer):
    class Meta:
        model = Concentrator
        fields = '__all__'
# bsc
class VConcentratorSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    amrs_concentrator = SerializerMethodField()
    
    class Meta:
        model = VConcentrator
        fields = [
            'belongto','amrs_concentrator'
        ]

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_amrs_concentrator(self,obj):
        return ConcentratorSerializer(obj.amrs_concentrator).data

class FlowdataSerializer(ModelSerializer):
    flow_data = SerializerMethodField()
    flow_data_hour = SerializerMethodField()
    flow_data_day = SerializerMethodField()
    flow_data_month = SerializerMethodField()

    class Meta:
        model = Bigmeter
        fields = ['flow_data','flow_data_hour','flow_data_day','flow_data_month']

    def get_flow_data(self,obj):
        return HdbFlowDataSerializer(HdbFlowData.objects.filter(commaddr=obj.commaddr),many=True).data


    def get_flow_data_hour(self,obj):
        return HdbFlowDataHourSerializer(HdbFlowDataHour.objects.filter(commaddr=obj.commaddr),many=True).data

    def get_flow_data_day(self,obj):
        return HdbFlowDataDaySerializer(HdbFlowDataDay.objects.filter(commaddr=obj.commaddr),many=True).data

    def get_flow_data_month(self,obj):
        return HdbFlowDataMonthSerializer(HdbFlowDataMonth.objects.filter(commaddr=obj.commaddr),many=True).data

class BigmeterSerializer(ModelSerializer):
    # flow_data = SerializerMethodField()
    # flow_data_hour = SerializerMethodField()
    # flow_data_day = SerializerMethodField()
    # flow_data_month = SerializerMethodField()

    class Meta:
        model = Bigmeter
        fields = '__all__'
    #     extra_fields = ['flow_data','flow_data_hour','flow_data_day','flow_data_month']

    # def get_flow_data(self,obj):
    #     return HdbFlowDataSerializer(HdbFlowData.objects.filter(commaddr=obj.commaddr),many=True).data


    # def get_flow_data_hour(self,obj):
    #     return HdbFlowDataHourSerializer(HdbFlowDataHour.objects.filter(commaddr=obj.commaddr),many=True).data

    # def get_flow_data_day(self,obj):
    #     return HdbFlowDataDaySerializer(HdbFlowDataDay.objects.filter(commaddr=obj.commaddr),many=True).data

    # def get_flow_data_month(self,obj):
    #     return HdbFlowDataMonthSerializer(HdbFlowDataMonth.objects.filter(commaddr=obj.commaddr),many=True).data

class StationSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    meter = SerializerMethodField()
    commaddr = SerializerMethodField()
    amrs_bigmeter = SerializerMethodField()

    class Meta:
        model = Station
        fields = [
            'id',
            'belongto',
            'meter',
            'commaddr',
            'biguser',
            'focus',
            'description',
            'amrs_bigmeter',
        ]

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_meter(self,obj):
        if obj.meter:
            return obj.meter.serialnumber
        return None
    
    def get_commaddr(self,obj):
        return obj.meter.simid.simcardNumber

    def get_amrs_bigmeter(self,obj):
        commaddr = obj.meter.simid.simcardNumber
        return BigmeterSerializer(obj.amrs_bigmeter).data


class MeterSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    simid = SerializerMethodField()

    class Meta:
        model = Meter
        fields = [
            'belongto','serialnumber','version','dn','metertype','mtype','simid',
            'manufacturer','protocol','R','q4','q3','q2','q1','check_cycle','state'
            
        ]

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_simid(self,obj):
        if obj.simid:
            return obj.simid.simcardNumber
        return None


class SimCardSerializer(ModelSerializer):
    belongto = SerializerMethodField()

    class Meta:
        model = SimCard
        fields = [
            'belongto','simcardNumber','isStart','iccid','imei','imsi','operator','simFlow','openCardTime','endTime','remark'
            
        ]

    def get_belongto(self,obj):
        return obj.belongto.name


class UserSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    Role = SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'user_name',
            'real_name',
            'sex',
            'phone_number',
            'expire_date',
            'Role',
            'idstr',
            'uuid',
            'is_active',
            'belongto',
            
        ]

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_Role(self,obj):
        return obj.Role.name

class MyRoleSerializer(ModelSerializer):
    belongto = SerializerMethodField()

    class Meta:
        model = MyRoles
        fields = [
            'name',
            'belongto',
            'rid',
            'uid',
            'notes',
            'permissionTree'
        ]

    def get_belongto(self,obj):
        return obj.belongto.name

class OrganizationSerializer(ModelSerializer):

    children = SerializerMethodField(
        read_only=True, method_name="get_child_children")

    class Meta:
        model = Organization
        fields = [
            # 'id',
            'name',
            'parent',
            'attribute',
            'organlevel',
            'register_date',
            'owner_name',
            'phone_number',
            'firm_address',
            'cid',
            'pId',
            'is_org',
            'uuid',
            'children',
        ]

    def get_child_children(self, obj):
        """ self referral field """
        serializer = OrganizationSerializer(
            instance=obj.children.all(),
            many=True
        )
        return serializer.data

class OrganizationChildSerializer(ModelSerializer):
    # user = UserDetailSerializer(read_only=True)
    childrens = SerializerMethodField()
    class Meta:
        model = Organization
        fields = [
            "pk",'name','parent','attribute','organlevel','register_date',
            'owner_name','phone_number','firm_address','cid','pId','is_org','uuid','childrens'
        ]

    def get_childrens(self,obj):
        if obj.is_parent:
            return OrganizationChildSerializer(obj.get_descendants(include_self=False),many=True).data
        return None


class OrganizationListSerializer(ModelSerializer):
    parent = SerializerMethodField()
    childrens = SerializerMethodField()
    class Meta:
        model = Organization
        fields = [
            "pk",'name','parent','attribute','organlevel','register_date',
            'owner_name','phone_number','firm_address','cid','pId','is_org','uuid','childrens'
        ]

        read_only_fields = ['childrens']
    
    def get_parent(self,obj):
        if obj.parent:
            return obj.parent.name
        return '' 
    
    def get_childrens(self,obj):
        if obj.is_parent:
            return OrganizationChildSerializer(obj.get_descendants(include_self=False),many=True).data
        return None


class OrganizationDetailSerializer(ModelSerializer):
    parent = SerializerMethodField()
    childrens = SerializerMethodField()
    class Meta:
        model = Organization
        fields = [
            "pk",'name','parent','attribute','organlevel','register_date',
            'owner_name','phone_number','firm_address','cid','pId','is_org','uuid','childrens'
        ]

        read_only_fields = ['childrens']
    
    def get_parent(self,obj):
        if obj.parent:
            return obj.parent.name
        return '' 
    
    def get_childrens(self,obj):
        if obj.is_parent:
            return OrganizationChildSerializer(obj.get_descendants(include_self=False),many=True).data
        return None


# class MeterListSerializer(ModelSerializer):
#     simid = SerializerMethodField()
#     belongto = SerializerMethodField()
#     station = SerializerMethodField()

#     class Meta:
#         model = Meter
#         fields = [
#             "pk","serialnumber","simid","version","dn",
#         "metertype","belongto","mtype","manufacturer","protocol","R","q3","q1","check_cycle","state","station"
#         ]

#     def get_simid(self,obj):
#         return obj.simid.simcardNumber

#     def get_belongto(self,obj):
#         return obj.belongto.name

#     def get_station(self,obj):
#         return 'test'




# class VConcentratorListSerializer(ModelSerializer):
#     belongto = SerializerMethodField()
#     id = SerializerMethodField()
    

#     class Meta:
#         model = Concentrator
#         fields = [
#             "id",'belongto',
#             'name','lng','lat','coortype','model','serialnumber','manufacturer','madedate','commaddr','address'
#         ]

#     def get_belongto(self,obj):
#         return obj.vconcentrator.belongto.name

#     def get_id(self,obj):
#         return obj.commaddr



# class VConcentratorSelectSerializer(ModelSerializer):
#     id = ReadOnlyField(source='pk')
    

#     class Meta:
#         model = Concentrator
#         fields = [
#             "id","name"
#         ]


# class CommunitySelectSerializer(ModelSerializer):
#     id = ReadOnlyField(source='pk')
    

#     class Meta:
#         model = Community
#         fields = [
#             "id","name"
#         ]



# class SimcardSelectSerializer(ModelSerializer):
#     name = ReadOnlyField(source='simcardNumber')
    

#     class Meta:
#         model = SimCard
#         fields = [
#             "id","name"
#         ]


# class SimcardIEMISelectSerializer(ModelSerializer):
#     name = ReadOnlyField(source='imei')
    

#     class Meta:
#         model = SimCard
#         fields = [
#             "id","name"
#         ]

    

# class VPressureSerializer(ModelSerializer):
#     belongto = SerializerMethodField()
#     id = SerializerMethodField()
#     serialnumber = SerializerMethodField()
#     manufacturer = SerializerMethodField()
#     lng = SerializerMethodField()
#     lat = SerializerMethodField()
#     coortype = SerializerMethodField()
#     commaddr = SerializerMethodField()
#     metertype = SerializerMethodField()

#     class Meta:
#         model = VPressure
#         fields = [
#             "id",'belongto','version','check_cycle','state','protocol','metertype',
#             'lng','lat','coortype','serialnumber','manufacturer','commaddr'
#         ]

#     def get_belongto(self,obj):
#         return obj.belongto.name

#     def get_id(self,obj):
#         return obj.amrs_pressure.commaddr

#     def get_commaddr(self,obj):
#         return obj.amrs_pressure.commaddr

#     def get_lng(self,obj):
#         return obj.amrs_pressure.lng

#     def get_lat(self,obj):
#         return obj.amrs_pressure.lat

#     def get_coortype(self,obj):
#         return obj.amrs_pressure.coortype

#     def get_serialnumber(self,obj):
#         return obj.amrs_pressure.serialnumber

#     def get_manufacturer(self,obj):
#         return obj.amrs_pressure.manufacturer

#     def get_metertype(self,obj):
#         return obj.amrs_pressure.metertype

    

    