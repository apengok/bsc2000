# -*- coding:utf-8 -*-

from rest_framework.serializers import (
    HyperlinkedIdentityField,
    ModelSerializer,
    SerializerMethodField,
    ReadOnlyField,
    CharField,
)



from amrs.models import (
    Concentrator,
    Community,
    Bigmeter,
    SecondWater,
    HdbWatermeterDay,
    HdbWatermeterMonth,
    HdbFlowData,
    HdbFlowDataHour,
    HdbFlowDataDay,
    HdbFlowDataMonth,
    HdbPressureData,
    HdbWatermeterData,
)


class HdbWatermeterRawFlowSerializer(ModelSerializer):
    class Meta:
        model = HdbWatermeterData

        fields = ['readtime','plustotalflux','reversetotalflux','totalflux']

class HdbWatermeterFlowSerializer(ModelSerializer):
    class Meta:
        model = HdbWatermeterData

        fields = ['readtime','totalflux']

class HdbWatermeterDaySerializer(ModelSerializer):
    class Meta:
        model = HdbWatermeterDay

        fields = ['hdate','dosage']

class HdbWatermeterDaySerializer_Lora(ModelSerializer):
    readtime = ReadOnlyField(source='hdate')
    totalflux = ReadOnlyField(source='dosage')
    class Meta:
        model = HdbWatermeterDay

        fields = ['readtime','totalflux']



class HdbWatermeterMonthSerializer(ModelSerializer):
    class Meta:
        model = HdbWatermeterMonth

        fields = ['hdate','dosage']        


class HdbWatermeterMonthSerializer_Lora(ModelSerializer):
    readtime = ReadOnlyField(source='hdate')
    totalflux = ReadOnlyField(source='dosage')
    class Meta:
        model = HdbWatermeterMonth

        fields = ['readtime','totalflux']



class HdbPressureDataSerializer(ModelSerializer):        
    class Meta:
        model = HdbPressureData
        fields = ['readtime','pressure']


class HdbFlowDataSerializer(ModelSerializer):        
    class Meta:
        model = HdbFlowData
        fields = ['readtime','flux','plustotalflux','reversetotalflux','totalflux']

class HdbFlowDataHourSerializer(ModelSerializer):        
    class Meta:
        model = HdbFlowDataHour
        fields = ['hdate','dosage']        


class HdbFlowDataDaySerializer(ModelSerializer):        
    class Meta:
        model = HdbFlowDataDay
        fields = ['hdate','dosage']        


class HdbFlowDataMonthSerializer(ModelSerializer):        
    class Meta:
        model = HdbFlowDataMonth
        fields = ['hdate','dosage']        

          

class BigmeterCreateSerializer(ModelSerializer):
    belongto = CharField(label='所属组织', max_length=100)
    # belongto = CharField(label='所属组织', max_length=100, validators=[UniqueValidator(queryset=FenceDistrict.objects.all(),message="该名称已存在")])

    class Meta:
        model = Bigmeter
        fields = ['serialnumber','username','usertype','lng',
            'lat','commaddr','simid','madedate','metertype','installationsite','belongto'    
        ]
        

    # def validate(self,data):
    #     print('vali........:',data)

    #     return data

    def create(self,validated_data):
        validated_data.pop("belongto")
        bigmeter = Bigmeter.objects.create(**validated_data)
        return bigmeter
