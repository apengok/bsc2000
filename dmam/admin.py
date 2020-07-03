# -*- coding:utf-8 -*-

from django.contrib import admin
# Register your models here.
from amrs.models import Bigmeter,District
from core.mixins import ExportCsvMixin
from core.models import (
    WaterUserType,
    DMABaseinfo,
    DmaStation,
    Meter,
    Station,
    SimCard,
    DmaGisinfo,
    VCommunity,
    VConcentrator,
    VWatermeter,
    VPressure,
    VSecondWater,
)

@admin.register(WaterUserType)
class WaterUserTypeAdmin(admin.ModelAdmin):
    list_display = ['usertype','explains']


@admin.register(DmaStation)
class DmaStationAdmin(admin.ModelAdmin,ExportCsvMixin):
    list_display = ['dmaid','station_id','meter_type','station_type']
    actions = ['export_as_csv']



@admin.register(DMABaseinfo)
class DMABaseinfoAdmin(admin.ModelAdmin,ExportCsvMixin):
    list_display = ['dma_no','dma_level','dma_name','creator','create_date','belongto']
    search_fields = ("dma_no","dma_name" )
    actions = ['export_as_csv']
    


@admin.register(Meter)
class MeterAdmin(admin.ModelAdmin):
    list_display = ['serialnumber','simid','protocol','dn','metertype','belongto']

    search_fields = ('serialnumber',)
    list_filter = ('protocol',) 

# @admin.register(VPressure)
# class VPressureAdmin(admin.ModelAdmin):
#     list_display = ['username','serialnumber','simid','dn','metertype','belongto']


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    actions = ['sync_bigmeter']
    list_display = ['amrs_bigmeter','biguser','focus','meter','belongto','dmametertype']

    search_fields = ("meter__serialnumber","meter__simid__simcardNumber" )

    

    def get_form(self, request, obj=None, **kwargs):
        form = super(StationAdmin, self).get_form(request, obj, **kwargs)
        form.base_fields['dmaid'].required = False
        return form

@admin.register(SimCard)
class SimCardAdmin(admin.ModelAdmin):
    list_display = ['simcardNumber','belongto','isStart','iccid','imei','imsi','operator','simFlow','openCardTime','endTime','remark']
    search_fields = ['simcardNumber','imei']


@admin.register(DmaGisinfo)
class DmaGisInfoAdmin(admin.ModelAdmin):
    list_display = ['dma_no','geodata','strokeColor','fillColor']

# @admin.register(VConcentrator)
# class VConcentratorAdmin(admin.ModelAdmin):
#     list_display = ['id','amrs_concentratorid','name','belongto','commaddr','address','lng','lat','coortype','model','serialnumber','manufacturer','madedate']
#     search_fields = ['name','commaddr']


class MembershipInline(admin.TabularInline):
    model = VCommunity.vconcentrators.through


# @admin.register(VCommunity)
# class VCommunityAdmin(admin.ModelAdmin):
#     inlines = [
#         MembershipInline,
#     ]
#     list_display = ['id','amrs_commutid','name','belongto','commutid','amrs_commutid','address','parent','outter']

#     search_fields = ['name']

# @admin.register(VWatermeter)
# class VWatermeterAdmin(admin.ModelAdmin):
#     list_display = ['name','belongto','communityid','communityidnew','waterid','amrs_waterid','outter_communityid','concentrator','numbersth','buildingname','roomname','wateraddr','serialnumber','madedate']
#     search_fields = ['name','communityid__name','id','wateraddr','numbersth']


# @admin.register(VSecondWater)
# class VSecondWaterAdmin(admin.ModelAdmin):
#     list_display = ['name','belongto','coortype','lng','lat',]
#     search_fields = ['name']