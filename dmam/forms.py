# -*- coding: utf-8 -*-

from django import forms
from django.utils.dateparse import parse_datetime
from django.contrib.admin import widgets
from django.contrib.admin.widgets import AdminDateWidget,AdminSplitDateTime
from django.contrib.postgres.forms.ranges import DateRangeField, RangeWidget

from amrs.models import (
    Bigmeter,
    Community,
    SecondWater
)

from core.models import (
    Organization,
    WaterUserType,
    DMABaseinfo,
    Station,
    Meter,
    VSecondWater
)
import datetime

class DMACreateForm(forms.ModelForm):

    class Meta:
        model = DMABaseinfo
        fields = ['dma_no','dma_name','creator','create_date']



class DMABaseinfoForm(forms.ModelForm):
    belongto  = forms.CharField()

    class Meta:
        model = DMABaseinfo
        fields = ['dma_no','pepoles_num','acreage','user_num','pipe_texture','pipe_length','pipe_links','pipe_years','pipe_private','ifc','aznp','night_use','cxc_value']

    def __init__(self,*args,**kwargs):
        super(DMABaseinfoForm, self).__init__(*args, **kwargs)

        # self.fields['password'].widget = forms.PasswordInput()
        self.fields['belongto'].initial = self.instance.belongto.name
        
    def clean_belongto(self):
        organ_name = self.cleaned_data.get("belongto")
        print('organ_name:',organ_name)
        organ = Organization.objects.get(name=organ_name)
        return organ

class WaterUserTypeForm(forms.ModelForm):
    
    class Meta:
        model = WaterUserType
        fields = ['usertype','explains']

    def __init__(self,instance,*args,**kwargs):
        super(WaterUserTypeForm, self).__init__(*args, **kwargs)
                        

class BigmeterCreateForm(forms.ModelForm):
    description = forms.CharField(required=False)
    biguser = forms.CharField(required=False)
    focus = forms.CharField(required=False)
    locate = forms.CharField(required=False)

    class Meta:
        model = Bigmeter
        fields = ['username','usertype','madedate','lng','lat']


class BigmeterEditForm(forms.ModelForm):
    description = forms.CharField(required = False)
    belongto = forms.CharField()
    serialnumber = forms.CharField()
    simid = forms.CharField(required = False)
    dn = forms.CharField()
    metertype = forms.CharField()
    meter = forms.CharField()


    def __init__(self, *args, **kwargs):
        super(StationsEditForm, self).__init__(*args, **kwargs)

        self.fields['belongto'].initial = self.instance.belongto.name
        self.fields['meter'].initial = self.instance.meter.serialnumber

        if self.instance.meter:
            self.fields['serialnumber'].initial = self.instance.meter.serialnumber
            self.fields['dn'].initial = self.instance.meter.dn
            self.fields['metertype'].initial = self.instance.meter.metertype
            
            if self.instance.meter.simid:
                self.fields['simid'].initial = self.instance.meter.simid.simcardNumber
        

    class Meta:
        model = Bigmeter    
        fields= ('username','usertype','madedate','lng','lat')


class StationsForm(forms.ModelForm):
    userid = forms.CharField(required = False)
    belongto = forms.CharField()
    username = forms.CharField()
    serialnumber = forms.CharField()
    simid = forms.CharField(required = False)
    dn = forms.CharField(required=False)
    metertype = forms.CharField(required=False)
    usertype = forms.CharField(required=False)
    lng = forms.CharField(required=False)
    lat = forms.CharField(required=False)
    madedate = forms.CharField(required=False)
    installationsite = forms.CharField(required = False)


    def __init__(self, *args, **kwargs):
        super(StationsForm, self).__init__(*args, **kwargs)
        

    class Meta:
        model = Station    
        fields= ('description','focus','biguser')


class StationsEditForm(forms.ModelForm):
    userid = forms.CharField(required = False)
    username = forms.CharField()
    belongto = forms.CharField()
    serialnumber = forms.CharField()
    simid = forms.CharField(required = False)
    dn = forms.CharField(required=False)
    usertype = forms.CharField(required=False)
    metertype = forms.CharField(required=False)
    meter = forms.CharField()
    lng = forms.CharField(required=False)
    lat = forms.CharField(required=False)
    madedate = forms.CharField(required=False)
    installationsite = forms.CharField(required=False)


    def __init__(self, *args, **kwargs):
        super(StationsEditForm, self).__init__(*args, **kwargs)

        self.fields['userid'].initial = self.instance.amrs_bigmeter.userid
        self.fields['username'].initial = self.instance.amrs_bigmeter.username
        self.fields['madedate'].initial = self.instance.amrs_bigmeter.madedate
        self.fields['lng'].initial = self.instance.amrs_bigmeter.lng
        self.fields['lat'].initial = self.instance.amrs_bigmeter.lat
        self.fields['usertype'].initial = self.instance.amrs_bigmeter.usertype
        self.fields['installationsite'].initial = self.instance.amrs_bigmeter.installationsite
        self.fields['belongto'].initial = self.instance.belongto.name
        self.fields['meter'].initial = self.instance.meter.serialnumber if self.instance.meter else ''

        if self.instance.meter:
            self.fields['serialnumber'].initial = self.instance.meter.serialnumber
            self.fields['dn'].initial = self.instance.meter.dn
            self.fields['metertype'].initial = self.instance.meter.metertype
            
            if self.instance.meter.simid:
                self.fields['simid'].initial = self.instance.meter.simid.simcardNumber
        

    class Meta:
        model = Station    
        fields= ('description','focus','biguser')


class AssignStationForm(forms.Form):
    stationassign = forms.CharField()

    # class Meta:
    #     model = DMABaseinfo
    #     fields = ('dma_no',)


class StationAssignForm(forms.ModelForm):
    stationassign = forms.CharField()

    class Meta:
        model = DMABaseinfo
        fields = ('dma_no',)



class SecondWaterAddForm(forms.ModelForm):
    belongto = forms.CharField()
    version = forms.CharField(required=False)
    manufacturer = forms.CharField(required=False)
    product_date = forms.CharField(required=False)
    artist = forms.CharField(required=False)
    artistPreview = forms.CharField(required=False)
    serialnumber = forms.CharField(required=False)

    class Meta:
        model = SecondWater
        fields = [
            'name','address','lng','lat','coortype'
        ]

class SecondWaterEditForm(forms.ModelForm):
    belongto = forms.CharField()
    version = forms.CharField(required=False)
    manufacturer = forms.CharField(required=False)
    product_date = forms.CharField(required=False)
    artist = forms.CharField(required=False)
    artistPreview = forms.CharField(required=False)
    serialnumber = forms.CharField(required=False)

    class Meta:
        model = SecondWater
        fields = ['name','address','lng','lat','coortype']

    def __init__(self, *args, **kwargs):
        super(SecondWaterEditForm, self).__init__(*args, **kwargs)

        self.fields['belongto'].initial = self.instance.vsecondwater.belongto.name
        self.fields['version'].initial = self.instance.vsecondwater.version
        self.fields['manufacturer'].initial = self.instance.vsecondwater.manufacturer
        self.fields['product_date'].initial = self.instance.vsecondwater.product_date
        self.fields['artist'].initial = self.instance.vsecondwater.artist
        self.fields['artistPreview'].initial = self.instance.vsecondwater.artistPreview
        self.fields['serialnumber'].initial = self.instance.vsecondwater.serialnumber


class CommunityCreateForm(forms.ModelForm):
    belongto  = forms.CharField()
    vconcentrator1 = forms.CharField(required=False)
    vconcentrator2 = forms.CharField(required=False)
    vconcentrator3 = forms.CharField(required=False)
    vconcentrator4 = forms.CharField(required=False)

    class Meta:
        model = Community
        fields = ['name','address']

class CommunityEditForm(forms.ModelForm):
    belongto  = forms.CharField()
    vconcentrator1 = forms.CharField(required=False)
    vconcentrator2 = forms.CharField(required=False)
    vconcentrator3 = forms.CharField(required=False)
    vconcentrator4 = forms.CharField(required=False)
    
    class Meta:
        model = Community
        fields = ['name','address']

    def __init__(self,*args,**kwargs):
        super(CommunityEditForm, self).__init__(*args, **kwargs)

        self.fields['belongto'].initial = self.instance.vcommunity.belongto.name
        vconcents = self.instance.vcommunity.vconcentrators.all()
        # print(vconcents)
        v_count = vconcents.count()
        if v_count == 1:
            self.fields['vconcentrator1'].initial = vconcents[0].amrs_concentrator.name
        if v_count == 2:
            self.fields['vconcentrator1'].initial = vconcents[0].amrs_concentrator.name
            self.fields['vconcentrator2'].initial = vconcents[1].amrs_concentrator.name

        if v_count == 3:
            self.fields['vconcentrator1'].initial = vconcents[0].amrs_concentrator.name
            self.fields['vconcentrator2'].initial = vconcents[1].amrs_concentrator.name
            self.fields['vconcentrator3'].initial = vconcents[2].amrs_concentrator.name

        if v_count == 4:
            self.fields['vconcentrator1'].initial = vconcents[0].amrs_concentrator.name
            self.fields['vconcentrator2'].initial = vconcents[1].amrs_concentrator.name
            self.fields['vconcentrator3'].initial = vconcents[2].amrs_concentrator.name
            self.fields['vconcentrator4'].initial = vconcents[3].amrs_concentrator.name