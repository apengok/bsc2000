# -*- coding:utf-8 -*-
from rest_framework.serializers import (
    HyperlinkedIdentityField,
    ModelSerializer,
    SerializerMethodField,
    ReadOnlyField,
    )

import random
# from accounts.api.serializers import UserDetailSerializer
# from comments.api.serializers import CommentSerializer
from accounts.models import MyRoles,User

from core.models import (
    Organization,
    DMABaseinfo,
    Station,
    VCommunity,
    VConcentrator,
    VWatermeter,
    VPressure,
    VSecondWater,
)

class OrganizationTreeSerializer_countstation(ModelSerializer):
    # user = UserDetailSerializer(read_only=True)
    id = SerializerMethodField()
    dma_no = SerializerMethodField()
    otype = SerializerMethodField()
    icon = SerializerMethodField()
    name = SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'name',
            'id',
            'pId',
            'dma_no',
            'attribute',
            'organlevel',
            'otype',
            'icon',
            'uuid'
        ]

    def get_name(self,obj):
        cont = obj.station_list_queryset('').count()
        return '{} ({})'.format(obj.name,cont)

    def get_id(self,obj):
        return obj.cid

    def get_dma_no(self,obj):
        return ""

    def get_otype(self,obj):
        return "group"

    def get_icon(self,obj):
        return "/static/virvo/resources/img/wenjianjia.png"

class OrganizationTreeSerializer(ModelSerializer):
    # user = UserDetailSerializer(read_only=True)
    id = SerializerMethodField()
    dma_no = SerializerMethodField()
    otype = SerializerMethodField()
    icon = SerializerMethodField()
    # name = SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'name',
            'id',
            'pId',
            'dma_no',
            'attribute',
            'organlevel',
            'otype',
            'icon',
            'uuid'
        ]

    # def get_name(self,obj):
    #     cont = obj.station_list_queryset('').count()
    #     return '{} ({})'.format(obj.name,cont)

    def get_id(self,obj):
        return obj.cid

    def get_dma_no(self,obj):
        return ""

    def get_otype(self,obj):
        return "group"

    def get_icon(self,obj):
        return "/static/virvo/resources/img/wenjianjia.png"


class DmaTreeSerializer(ModelSerializer):
    # user = UserDetailSerializer(read_only=True)
    name = ReadOnlyField(source='dma_name')
    pId = SerializerMethodField()
    otype = SerializerMethodField()
    icon = SerializerMethodField()
    districtid = ReadOnlyField(source='pk')
    dmalevel = SerializerMethodField()
    leakrate = SerializerMethodField()
    uuid = SerializerMethodField()

    class Meta:
        model = DMABaseinfo
        fields = [
            'name',
            'id',
            'pId',
            'dma_no',
            'districtid',
            'otype',
            'leakrate',
            'dmalevel',
            'icon',
            'uuid'
        ]

    def get_pId(self,obj):
        print(obj)
        return obj.belongto.cid

    def get_dmalevel(self,obj):
        return obj.belongto.organlevel

    def get_leakrate(self,obj):
        return random.choice([9.65,13.46,11.34,24.56,32.38,7.86,10.45,17.89,23.45,36,78])

    def get_otype(self,obj):
        return "dma"

    def get_uuid(self,obj):
        return ''

    def get_icon(self,obj):
        return "/static/virvo/resources/img/dma.png"



class StationTreeSerializer(ModelSerializer):
    # user = UserDetailSerializer(read_only=True)
    # name = ReadOnlyField(source='amrs_bigmeter__username')
    name = SerializerMethodField()
    pId = SerializerMethodField()
    otype = SerializerMethodField()
    icon = SerializerMethodField()
    commaddr = ReadOnlyField(source='amrs_bigmeter.pk')
    dma_station_type = SerializerMethodField()
    uuid = SerializerMethodField()
    alarm = SerializerMethodField()

    class Meta:
        model = Station
        fields = [
            'name',
            'id',
            'pId',
            # 'dma_no',
            'commaddr',
            'otype',
            'dma_station_type',
            'icon',
            'uuid',
            'focus',
            'biguser',
            'alarm'
        ]

    def get_name(self,obj):
        return obj.amrs_bigmeter.username

    def get_pId(self,obj):
        # print(obj)
        return obj.belongto.cid

    # # 在dma站点分配中标识该是站点=1还是小区=2
    def get_dma_station_type(self,obj):
        return '1'

    def get_otype(self,obj):
        return "station"

    def get_uuid(self,obj):
        return ''

    def get_icon(self,obj):
        return "/static/virvo/resources/img/station.png"     

    def get_alarm(self,obj):
        return '0'   



class PressureTreeSerializer(ModelSerializer):
    # user = UserDetailSerializer(read_only=True)
    name = ReadOnlyField(source='amrs_pressure.username')
    commaddr = ReadOnlyField(source='amrs_pressure.commaddr')
    pId = SerializerMethodField()
    otype = SerializerMethodField()
    icon = SerializerMethodField()
    

    class Meta:
        model = VPressure
        fields = [
            'name',
            'id',
            'pId',
            'commaddr',
            # 'districtid',
            'otype',
            'icon',
        ]

    def get_pId(self,obj):
        return obj.belongto.cid

    def get_otype(self,obj):
        return "pressure"

    def get_icon(self,obj):
        return "/static/virvo/resources/img/pressure.png" 


class SecondWaterTreeSerializer(ModelSerializer):
    # user = UserDetailSerializer(read_only=True)
    name = ReadOnlyField(source='amrs_secondwater.name')
    pId = SerializerMethodField()
    otype = SerializerMethodField()
    icon = SerializerMethodField()
    

    class Meta:
        model = VSecondWater
        fields = [
            'name',
            'id',
            'pId',
            # 'dma_no',
            # 'districtid',
            'otype',
            'icon',
        ]

    # def get_name(self,obj):
    #     return obj.amrs_secondwater.name

    def get_pId(self,obj):
        return obj.belongto.cid

    def get_otype(self,obj):
        return "secondwater"

    def get_icon(self,obj):
        return "/static/scada/img/bz_b.png" 



class CommunityTreeSerializer(ModelSerializer):
    # user = UserDetailSerializer(read_only=True)
    # name = ReadOnlyField(source='amrs_community__name')
    name = SerializerMethodField()
    pId = SerializerMethodField()
    otype = SerializerMethodField()
    icon = SerializerMethodField()
    commaddr = ReadOnlyField(source='amrs_community.pk')
    dma_station_type = SerializerMethodField()

    class Meta:
        model = VCommunity
        fields = [
            'name',
            'id',
            'pId',
            'commaddr',
            'dma_station_type',
            'otype',
            'icon',
        ]

    def get_name(self,obj):
        return obj.amrs_community.name

    def get_pId(self,obj):
        return obj.belongto.cid

    def get_dma_station_type(self,obj):
        return "2"

    def get_otype(self,obj):
        return "community"

    def get_icon(self,obj):
        return "/static/virvo/resources/img/home.png" 



class ConcentratorTreeSerializer(ModelSerializer):
    # user = UserDetailSerializer(read_only=True)
    name = ReadOnlyField(source='amrs_pressure__username')
    pId = SerializerMethodField()
    otype = SerializerMethodField()
    icon = SerializerMethodField()
    

    class Meta:
        model = VConcentrator
        fields = [
            'name',
            'id',
            'pId',
            # 'dma_no',
            # 'districtid',
            'otype',
            'icon',
        ]

    def get_pId(self,obj):
        return obj.belongto.cid

    def get_otype(self,obj):
        return "concentrator"

    def get_icon(self,obj):
        return "/static/scada/img/bz_b.png" 


class WatermeterTreeSerializer(ModelSerializer):
    # user = UserDetailSerializer(read_only=True)
    name = ReadOnlyField(source='amrs_pressure__username')
    name = SerializerMethodField()
    pId = SerializerMethodField()
    otype = SerializerMethodField()
    icon = SerializerMethodField()
    

    class Meta:
        model = VWatermeter
        fields = [
            'name',
            'id',
            'pId',
            # 'dma_no',
            # 'districtid',
            'otype',
            'icon',
        ]

    def get_name(self,obj):
        print(obj)
        return obj.buildingname

    def get_pId(self,obj):
        return obj.belongto.cid

    def get_otype(self,obj):
        return "building"

    def get_icon(self,obj):
        return "/static/virvo/resources/img/buildingno.png" 



class OrganizationListSerializer(ModelSerializer):
    # url = post_detail_url
    # user = UserDetailSerializer(read_only=True)
    class Meta:
        model = Organization
        fields = [
            'name','parent','attribute','organlevel','register_date','owner_name','phone_number','firm_address',
            'cid','pId','is_org','uuid',
            'coorType','longitude','latitude','zoomIn','islocation','location','province','city','district','adcode','districtlevel'
        ]


class MyRoleListSerializer(ModelSerializer):
    
    class Meta:
        model = MyRoles
        fields = ('name','belongto','permissionTree','notes','id')

    def validated_rid(self,rid):
        print('here validate rid')
        return rid


class UserListSerializer(ModelSerializer):
    # url = post_detail_url
    # user = UserDetailSerializer(read_only=True)
    belongto = SerializerMethodField()
    roleName = SerializerMethodField()
    groupName = SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'user_name','real_name','sex','phone_number','expire_date','belongto','roleName','email',
            'id','is_active','groupName'
        ]

    def get_belongto(self,obj):
        return obj.belongto.name

    def get_groupName(self,obj):
        return obj.belongto.name

    def get_roleName(self,obj):
        return obj.Role.name if obj.Role else ''


# class PostCreateUpdateSerializer(ModelSerializer):
#     class Meta:
#         model = Post
#         fields = [
#             #'id',
#             'title',
#             #'slug',
#             'content',
#             'publish'
#         ]


# post_detail_url = HyperlinkedIdentityField(
#         view_name='posts-api:detail',
#         lookup_field='slug'
#         )


# class PostDetailSerializer(ModelSerializer):
#     url = post_detail_url
#     user = UserDetailSerializer(read_only=True)
#     image = SerializerMethodField()
#     html = SerializerMethodField()
#     comments = SerializerMethodField()
#     class Meta:
#         model = Post
#         fields = [
#             'url',
#             'id',
#             'user',
#             'title',
#             'slug',
#             'content',
#             'html',
#             'publish',
#             'image',
#             'comments',
#         ]

#     def get_html(self, obj):
#         return obj.get_markdown()

#     def get_image(self, obj):
#         try:
#             image = obj.image.url
#         except:
#             image = None
#         return image

#     def get_comments(self, obj):
#         c_qs = Comment.objects.filter_by_instance(obj)
#         comments = CommentSerializer(c_qs, many=True).data
#         return comments





""""

from posts.models import Post
from posts.api.serializers import PostDetailSerializer


data = {
    "title": "Yeahh buddy",
    "content": "New content",
    "publish": "2016-2-12",
    "slug": "yeah-buddy",
    
}

obj = Post.objects.get(id=2)
new_item = PostDetailSerializer(obj, data=data)
if new_item.is_valid():
    new_item.save()
else:
    print(new_item.errors)


"""