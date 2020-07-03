
# -*- coding: utf-8 -*-
from rest_framework import serializers

from core.models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ('name','parent','attribute','organlevel','register_date','owner_name','phone_number','firm_address','cid','pId','is_org','uuid')


class OrganizationCreateSerializer(serializers.ModelSerializer):
    """Serializer For Creating A Organization For Logged In Users"""

    class Meta:
        model = Organization
        fields = ('name','parent','attribute','organlevel','register_date','owner_name','phone_number','firm_address','cid','pId','is_org','uuid')


class OrganizationListSerializer(serializers.ModelSerializer):
    """Serializer For Listing Only Relevant Information
    Of Posts Of A Particular User"""

    # total_comments = serializers.IntegerField()

    class Meta:
        model = Organization
        fields = ('name','parent','attribute','organlevel','register_date','owner_name','phone_number','firm_address','cid','pId','is_org','uuid')

class OrganizationDetailSerializer(serializers.ModelSerializer):
    """Serializer For Listing Only Relevant Information
    Of Posts Of A Particular User"""

    # total_comments = serializers.IntegerField()

    class Meta:
        model = Organization
        fields = ('name','parent','attribute','organlevel','register_date','owner_name','phone_number','firm_address','cid','pId','is_org','uuid')

class OrganizationUpdateSerializer(serializers.ModelSerializer):
    """Serializer For Creating A Organization For Logged In Users"""

    class Meta:
        model = Organization
        fields = ('name','parent','attribute','organlevel','register_date','owner_name','phone_number','firm_address','cid','pId','is_org','uuid')
