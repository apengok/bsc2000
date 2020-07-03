
# -*- coding: utf-8 -*-
from rest_framework import serializers
from accounts.models import MyRoles


class MyRolesSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = MyRoles
        fields = ('name','belongto','permissionTree','notes','id')

    def validated_rid(self,rid):
        print('here validate rid')
        return rid


class MyRolesCreateSerializer(serializers.ModelSerializer):
    """Serializer For Creating A MyRoles For Logged In Users"""

    class Meta:
        model = MyRoles
        fields = ('name','belongto','permissionTree','notes')


class MyRolesListSerializer(serializers.ModelSerializer):
    """Serializer For Listing Only Relevant Information
    Of Posts Of A Particular User"""

    # total_comments = serializers.IntegerField()
    # name = GroupSerializer()

    class Meta:
        model = MyRoles
        fields = ('name','rid','notes')

class MyRolesDetailSerializer(serializers.ModelSerializer):
    """Serializer For Listing Only Relevant Information
    Of Posts Of A Particular User"""

    # total_comments = serializers.IntegerField()

    class Meta:
        model = MyRoles
        fields = ('name','belongto','permissionTree','notes')

class MyRolesUpdateSerializer(serializers.ModelSerializer):
    """Serializer For Creating A MyRoles For Logged In Users"""

    class Meta:
        model = MyRoles
        fields = ('name','belongto','permissionTree','notes')
