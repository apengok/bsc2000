# -*- coding: utf-8 -*-

from django import forms

from core.models import Personalized
from amrs.models import Metercomm

class logoPagesPhotoForm(forms.ModelForm):
    class Meta:
        model = Personalized
        fields = ('loginLogo', 'webIco','homeLogo','topTitle','copyright','websiteName','recordNumber','frontPageMsg' )



class MetercommForm(forms.ModelForm):
    class Meta:
        model = Metercomm
        fields = ('name','commtype','tcpport','commprotocol')