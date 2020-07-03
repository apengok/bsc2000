# -*- coding:utf-8 -*-
from rest_framework.serializers import (
    HyperlinkedIdentityField,
    ModelSerializer,
    SerializerMethodField,
    ReadOnlyField,
    CharField,
    )
from rest_framework.validators import UniqueValidator
from rest_framework.exceptions import ValidationError
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

from ggis.models import FenceShape,FenceDistrict

class FenceShapeSerializer(ModelSerializer):

    class Meta:
        model = FenceShape
        fields = ['zonetype','shape','geomdata','geomjson','province','city',
            'district','administrativeLngLat','strokeColor','fillColor',
        ]


class ShapeCreateSerializer(ModelSerializer):

    class Meta:
        model = FenceShape
        fields = ['zonetype','shape','geomjson']


class FenceCreateSerializer(ModelSerializer):
    # uniqueness constraint is being explicitly enforced by a validator on the serializer field.
    name = CharField(label='区域名称', max_length=100, validators=[UniqueValidator(queryset=FenceDistrict.objects.all(),message="该名称已存在")])
    shape = ShapeCreateSerializer()
    # belongto = SerializerMethodField

    class Meta:
        model = FenceDistrict
        fields = ['name','ftype','createDataUsername','updateDataUsername',
            'description','cid','pId','dma_no','belongto','shape'    
        ]
        # validators = []  # Remove a default "unique together" constraint.
        # read_only_fields = [
        #     #'content_type',
        #     #'object_id',
        #     'belongto',
        #     'shape',
        # ]


    def validate_dma_no(self,data):
        if data and FenceDistrict.objects.filter(dma_no=data).exists():
            raise ValidationError("dma分区已被关联")
        return data

    # def validate(self,data):
    #     print('vali........:',data)

    #     return data

    def create(self,validated_data):
        zonetype = validated_data.get("zonetype")
        shape = validated_data.pop("shape")
        shape_obj = FenceShape.objects.create(**shape)
        validated_data["shape"] = shape_obj
        fence = FenceDistrict.objects.create(**validated_data)
        return fence


class ShapeDetailSerializer(ModelSerializer):

    class Meta:
        model = FenceShape
        fields = ['zonetype','shape','geomjson']


class FenceDetailSerializer(ModelSerializer):
    # shape = SerializerMethodField()
    shape = ShapeDetailSerializer()
    # belongto = SerializerMethodField()

    class Meta:
        model = FenceDistrict
        fields = ['name','ftype','createDataUsername','updateDataUsername',
            'description','cid','pId','dma_no','belongto','shape'    
        ]

    def __init__(self, *args, **kwargs):
        super(FenceDetailSerializer,self).__init__(*args,**kwargs)
        print(self.get_initial())
        print('__init:',self.instance)
        # self.fields['belongto'].initial = self.instance.belongto.name


    # def get_belongto(self,obj):
    #     if obj.belongto:
    #         return obj.belongto.name
    #     return ''

    # def get_shape(self,instance):
    #     return ShapeDetailSerializer(instance.shape).data

    def validate_belongto(self,data):
        print('validate belongto',data,type(data))
        return data

    def update(self,instance,validated_data):
        print('validated_data, update:',validated_data)
        shape = validated_data.pop("shape")
        for attr, value in shape.items():
            setattr(instance.shape, attr, value)
        # instance.shape.save() #error:NotSupportedError: This backend doesn't support the Transform function.
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance


    

class FenceDistrictSerializer(ModelSerializer):
    belongto = ReadOnlyField(source='belongto.name')
    shape = SerializerMethodField()

    class Meta:
        model = FenceDistrict
        fields = ['name','ftype','createDataTime','updateDataTime','createDataUsername','updateDataUsername',
            'description','cid','pId','shape','dma_no','belongto'    
        ]

    def get_shape(self,obj):
        return FenceShapeSerializer(obj.shape).data

    
class FenceTreeSerializer(ModelSerializer):
    # pType = ReadOnlyField(source='pId')
    # otype = ReadOnlyField(source='pId')
    belongto__name = ReadOnlyField(source='belongto.name')
    belongto__cid = ReadOnlyField(source='belongto.cid')

    class Meta:
        model = FenceDistrict
        fields = ["name","cid","pId","ftype","belongto__name","belongto__cid"]#"name","cid","pId","ftype","belongto__name","belongto__cid"