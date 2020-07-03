# -*- coding: utf-8 -*-

from rest_framework import serializers

from core.models import Personalized

class PersonalizedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personalized
        fields = ('ptype','loginLogo','webIco','homeLogo','topTitle','copyright','websiteName','recordNumber',
            'frontPageMsg','frontPageMsgUrl','updateDataUsername','updateDataTime','belongto')
