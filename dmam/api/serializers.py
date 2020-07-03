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

class DmaSelectSerializer(ModelSerializer):
    class Meta:
        model = DMABaseinfo
        fields = ['dma_no','dma_name']

class DMADetailSerializer(ModelSerializer):
    belongto = ReadOnlyField(source='belongto.name')

    class Meta:
        model = DMABaseinfo
        fields = ['belongto','dma_no','dma_name','pepoles_num','acreage','user_num',
            'pipe_texture','pipe_length','pipe_links','pipe_years','pipe_private','ifc','aznp','night_use','cxc_value'
        ]


class DMASerializer(ModelSerializer):
    details = SerializerMethodField()
    stationlist = SerializerMethodField()

    class Meta:
        model = DMABaseinfo
        fields = ['details','stationlist']

    def get_details(self,obj):
        return DMADetailSerializer(obj).data

    def get_stationlist(self,obj):
        # dmastations = self.dmastation_set.all()

        stations = obj.station_set_all()
        ret =  StationListSerializer(stations,many=True).data 
        communitys = obj.community_set_all()
        comminity_data = CommunityListSerializer(communitys,many=True).data
        # print('station:',ret)
        # print('community:',comminity_data)
        for comm in comminity_data:
            comm["username"] = comm["name"]
            comm["metertype"] = "集中器"
        return ret + comminity_data



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
        return obj.meter.dn

    def get_metertype(self,obj):
        return obj.meter.metertype

    def get_serialnumber(self,obj):
        return obj.meter.serialnumber

    def get_madedate(self,obj):
        return obj.amrs_bigmeter.madedate

    def get_related(self,obj):
        return DmaStation.objects.filter(station_id=obj.amrs_bigmeter.commaddr).exists()


class CommunityListSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    concentrator = SerializerMethodField()

    class Meta:
        model = Community
        fields = ['id','name','address','belongto','concentrator']

    def get_belongto(self,obj):
        return obj.vcommunity.belongto.name

    def get_concentrator(self,obj):
        ret = []
        
        for v in obj.vcommunity.vconcentrators.all():
            ret.append(v.amrs_concentrator.name)
            # return obj.vcommunity.vconcentrators.first().amrs_concentrator.name
        if len(ret) > 0:
            return ','.join(ret)
        return ''
    


class SecondWaterListSerializer(ModelSerializer):
    belongto = SerializerMethodField()
    version = SerializerMethodField()
    manufacturer = SerializerMethodField()
    product_date = SerializerMethodField()
    artist = SerializerMethodField()
    artistPreview = SerializerMethodField()
    serialnumber = SerializerMethodField()
    
    class Meta:
        model = SecondWater
        fields = ['id','name','address','lng','lat','coortype',
        'belongto','serialnumber','version','manufacturer','artist','artistPreview','product_date']

    def get_belongto(self,obj):
        return obj.vsecondwater.belongto.name

    def get_artist(self,obj):
        return obj.vsecondwater.artist

    def get_serialnumber(self,obj):
        return obj.vsecondwater.serialnumber

    def get_version(self,obj):
        return obj.vsecondwater.version

    def get_manufacturer(self,obj):
        return obj.vsecondwater.manufacturer

    def get_product_date(self,obj):
        return obj.vsecondwater.product_date

    def get_artistPreview(self,obj):
        return obj.vsecondwater.artistPreview

    
    

        