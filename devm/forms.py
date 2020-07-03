# -*- coding: utf-8 -*-

from django import forms
from django.utils.dateparse import parse_datetime
from django.contrib.admin import widgets
from django.contrib.admin.widgets import AdminDateWidget,AdminSplitDateTime
from django.contrib.postgres.forms.ranges import DateRangeField, RangeWidget


import datetime

from amrs.models import (
    Concentrator,
    Community,
    Watermeter,
    Bigmeter,
)

from core.models import (
    Organization,
    DMABaseinfo,
    Station,
    Meter,
    SimCard,
    VConcentrator,
    VCommunity,
    VWatermeter,
    VPressure
)



class MeterAddForm(forms.ModelForm):
    belongto  = forms.CharField()
    simid  = forms.CharField()

    class Meta:
        model = Meter
        fields = ['serialnumber','version','dn','metertype','mtype','manufacturer','protocol','R','q4','q3','q2','q1','check_cycle','state']

    # def __init__(self,*args,**kwargs):
    #     super(MeterAddForm, self).__init__(*args, **kwargs)

    #     # self.fields['password'].widget = forms.PasswordInput()
    #     self.fields['belongto'].initial = self.instance.belongto.name
        

class MeterEditForm(forms.ModelForm):
    belongto  = forms.CharField()
    simid  = forms.CharField()

    class Meta:
        model = Meter
        fields = ['serialnumber','version','dn','metertype','mtype','manufacturer','protocol','R','q4','q3','q2','q1','check_cycle','state']

    def __init__(self,*args,**kwargs):
        super(MeterEditForm, self).__init__(*args, **kwargs)

        # self.fields['password'].widget = forms.PasswordInput()
        self.fields['belongto'].initial = self.instance.belongto.name
        self.fields['simid'].initial = self.instance.simid.simcardNumber if self.instance.simid else ''


class SimCardAddForm(forms.ModelForm):
    belongto  = forms.CharField()

    class Meta:
        model = SimCard
        fields = ['simcardNumber','isStart','iccid','imei','imsi','operator','simFlow','openCardTime','endTime','remark']

    
        

class SimCardEditForm(forms.ModelForm):
    belongto  = forms.CharField()

    class Meta:
        model = SimCard
        fields = ['simcardNumber','isStart','iccid','imei','imsi','operator','simFlow','openCardTime','endTime','remark']

    def __init__(self,*args,**kwargs):
        super(SimCardEditForm, self).__init__(*args, **kwargs)

        # self.fields['password'].widget = forms.PasswordInput()
        self.fields['belongto'].initial = self.instance.belongto.name


class ConcentratorCreateForm(forms.ModelForm):
    belongto  = forms.CharField()

    class Meta:
        model = Concentrator
        fields = ['name','lng','lat','coortype','model','serialnumber','manufacturer','madedate','commaddr','address']


class ConcentratorEditForm(forms.ModelForm):
    belongto  = forms.CharField()
    
    class Meta:
        model = Concentrator
        fields = ['name','lng','lat','coortype','model','serialnumber','manufacturer','madedate','commaddr','address']


    def __init__(self,*args,**kwargs):
        super(ConcentratorEditForm, self).__init__(*args, **kwargs)

        self.fields['belongto'].initial = self.instance.vconcentrator.belongto.name


class VConcentratorAddForm(forms.ModelForm):
    belongto  = forms.CharField()
    name  = forms.CharField()
    lng  = forms.CharField()
    lat  = forms.CharField()
    model  = forms.CharField()
    serialnumber  = forms.CharField()
    manufacturer  = forms.CharField()
    madedate  = forms.CharField()
    commaddr  = forms.CharField()
    address  = forms.CharField()
    
    class Meta:
        model = VConcentrator
        # fields = []
        exclude =['belongto']


class VConcentratorEditForm(forms.ModelForm):
    belongto  = forms.CharField()
    name  = forms.CharField()
    lng  = forms.CharField()
    lat  = forms.CharField()
    model  = forms.CharField()
    serialnumber  = forms.CharField()
    manufacturer  = forms.CharField()
    madedate  = forms.CharField()
    commaddr  = forms.CharField()
    address  = forms.CharField()
    
    class Meta:
        model = VConcentrator
        # fields = []
        exclude =['belongto']

    def __init__(self,*args,**kwargs):
        super(VConcentratorEditForm, self).__init__(*args, **kwargs)

        self.fields['belongto'].initial = self.instance.belongto.name




class WatermeterAddForm(forms.ModelForm):
    # communityid  = forms.CharField()
    concentrator = forms.CharField()
    wateraddr    = forms.CharField(required=False) # for sims IEMI
    useraddr    = forms.CharField(required=False) 
    # meter_catlog = forms.CharField(required=False)
    # useraddr    = forms.CharField(required=False) 
    # ValveMeter = forms.CharField(required=False)
    # belongto = forms.CharField()

    class Meta:
        model = Watermeter
        fields = ['numbersth','buildingname','roomname','username','usertel','dn','serialnumber','wateraddr',
            'communityid','manufacturer','madedate','installationsite','metercontrol','metertype'
        ]


class WatermeterEditForm(forms.ModelForm):
    # communityid  = forms.CharField()
    concentrator = forms.CharField()
    wateraddr    = forms.CharField(required=False) # for sims IEMI
    useraddr    = forms.CharField(required=False) # 
    
    communitysel    = forms.CharField(required=False) # 
    
    class Meta:
        model = Watermeter
        fields = ['numbersth','buildingname','roomname','username','usertel','dn','serialnumber',"wateraddr",
            'communityid','manufacturer','madedate','installationsite','metercontrol','metertype'
        ]

    def __init__(self,*args,**kwargs):
        super(WatermeterEditForm, self).__init__(*args, **kwargs)

        self.fields['communitysel'].initial = self.instance.vwatermeter.communityid.amrs_community.name
        self.fields['concentrator'].initial = self.instance.vwatermeter.communityid.vconcentrators.first().amrs_concentrator.name
        self.fields['useraddr'].initial = self.instance.vwatermeter.useraddr
        if 'wateraddr' in self.fields:
            self.fields['wateraddr'].initial = self.instance.wateraddr
        # if self.instance.concentrator:
        #     self.fields['concentrator'].initial = self.instance.concentrator.name




class PressureAddForm(forms.ModelForm):
    belongto  = forms.CharField()
    simid  = forms.CharField()
    protocol  = forms.CharField(required=False)
    check_cycle  = forms.CharField(required=False)
    state  = forms.CharField(required=False)
    version =  forms.CharField(required=False)

    class Meta:
        model = Bigmeter
        fields = ['username','serialnumber','dn','metertype','manufacturer',
            'lng','lat','coortype','commaddr'
        ]

    
        

class PressureEditForm(forms.ModelForm):
    belongto  = forms.CharField()
    simid  = forms.CharField()
    protocol  = forms.CharField(required=False)
    check_cycle  = forms.CharField(required=False)
    state  = forms.CharField(required=False)
    version =  forms.CharField(required=False)

    class Meta:
        model = Bigmeter
        fields = ['username','serialnumber','dn','metertype','manufacturer',
            'lng','lat','coortype','commaddr'
        ]

    def __init__(self,*args,**kwargs):
        super(PressureEditForm, self).__init__(*args, **kwargs)

        self.fields['belongto'].initial = self.instance.vpressure.belongto.name
        self.fields['check_cycle'].initial = self.instance.vpressure.check_cycle
        self.fields['protocol'].initial = self.instance.vpressure.protocol
        self.fields['state'].initial = self.instance.vpressure.state
        self.fields['version'].initial = self.instance.vpressure.version
        self.fields['simid'].initial = self.instance.commaddr
        self.fields['commaddr'].initial = self.instance.commaddr
