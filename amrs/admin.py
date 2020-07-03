# -*- coding:utf-8 -*-

from django.contrib import admin
from . models import Bigmeter,HdbFlowData,MeterParameter,Watermeter,Community,HdbWatermeterDay
# Register your models here.

from django.contrib import admin
import datetime
import random
# Register your models here.

from core.models import (
    VCommunity,
    VConcentrator,
    VWatermeter,
)

from amrs.models import (
    Community,
    Concentrator,
    Watermeter,
    HdbWatermeterDay,
    HdbWatermeterMonth,
    HdbFlowData,
    HdbFlowDataDay,
    HdbFlowDataHour,
    HdbFlowDataMonth,
    HdbPressureData
)



@admin.register(Bigmeter)
class BigmeterAdmin(admin.ModelAdmin):
    list_display = ["username","commaddr","lat","lng"]

    search_fields = ("username","commaddr" )

    actions = ['gene_flow_data','gene_flow_data_hour','gene_flow_data_day','gene_flow_data_mon','gene_pressure_data']
    
    def gene_pressure_data(self,request,queryset):
        rows_updated = queryset.count()
        today = datetime.date.today().strftime("%Y-%m-%d")
        
        collect_data = []
        for q in queryset:
            for i in range(0,24):
                for j in range(0,59,10):
                    data = {
                        'commaddr':q.commaddr,
                        'readtime':today+' {:02d}:{:02d}:00'.format(i,j),
                        'pressure':random.uniform(2.5, 10.0) 
                    }
                    collect_data.append(HdbPressureData(**data))
            
            HdbPressureData.objects.bulk_create(collect_data)

                   
        if rows_updated == 1:
            message_bit = "1 item was"
        else:
            message_bit = "%s items were" % rows_updated
        self.message_user(request, "%s successfully updated as nomal." % message_bit)
    gene_pressure_data.short_description = 'generate pressure_data ' 

    def gene_flow_data(self,request,queryset):
        rows_updated = queryset.count()
        today = datetime.date.today().strftime("%Y-%m-%d")
        
        collect_data = []
        for q in queryset:
            for i in range(0,24):
                for j in range(0,59,10):
                    data = {
                        'commaddr':q.commaddr,
                        'readtime':today+' {:02d}:{:02d}:00'.format(i,j),
                        'flux':random.uniform(2.5, 10.0) 
                    }
                    collect_data.append(HdbFlowData(**data))

            HdbFlowData.objects.bulk_create(collect_data)
        if rows_updated == 1:
            message_bit = "1 item was"
        else:
            message_bit = "%s items were" % rows_updated
        self.message_user(request, "%s successfully updated as nomal." % message_bit)
    gene_flow_data.short_description = 'generate flow_data ' 

    def gene_flow_data_hour(self,request,queryset):
        rows_updated = queryset.count()

        today = datetime.date.today().strftime("%Y-%m-%d")
        
        collect_data = []
        for q in queryset:
            for i in range(1,24):
                try:
                    data = {
                        'commaddr':q.commaddr,
                        'hdate':today+' {:02d}'.format(i),
                        'dosage':random.uniform(12.5, 20.0) 
                    }

                    HdbFlowDataHour.objects.create(**data)

                except Exception as e:
                    print('error appear:',e)
                    pass
        if rows_updated == 1:
            message_bit = "1 item was"
        else:
            message_bit = "%s items were" % rows_updated
        self.message_user(request, "%s successfully updated as nomal." % message_bit)
    gene_flow_data_hour.short_description = 'generate flow_data_hour data' 


    def gene_flow_data_day(self,request,queryset):
        rows_updated = queryset.count()

        today = datetime.date.today().strftime("%Y-%m-%d")
        
        for q in queryset:
            for i in range(1,20):
                try:
                    data = {
                        'commaddr':q.commaddr,
                        'hdate':'2020-02-{:02d}'.format(i),
                        'dosage':random.uniform(12.5, 20.0) 
                    }

                    HdbFlowDataDay.objects.create(**data)

                except Exception as e:
                    print('error appear:',e)
                    pass
        if rows_updated == 1:
            message_bit = "1 item was"
        else:
            message_bit = "%s items were" % rows_updated
        self.message_user(request, "%s successfully updated as nomal." % message_bit)
    gene_flow_data_day.short_description = 'generate flow_data_day data' 

    def gene_flow_data_mon(self,request,queryset):
        rows_updated = queryset.count()

        
        for q in queryset:
            for i in range(1,13):
                try:
                    data = {
                        'commaddr':q.commaddr,
                        'hdate':'2020-{:02d}'.format(i),
                        'dosage':random.uniform(120.5, 200.0) 
                    }

                    HdbFlowDataMonth.objects.create(**data)

                except Exception as e:
                    print('error appear:',e)
                    pass
        if rows_updated == 1:
            message_bit = "1 item was"
        else:
            message_bit = "%s items were" % rows_updated
        self.message_user(request, "%s successfully updated as nomal." % message_bit)
    gene_flow_data_mon.short_description = 'generate flow_data_month data' 



@admin.register(HdbFlowData)
class HdbFlowDataAdmin(admin.ModelAdmin):
    list_display = ["commaddr","readtime","flux","plustotalflux"]

    list_filter = ("commaddr","readtime")



@admin.register(MeterParameter)
class HdbFlowDataAdmin(admin.ModelAdmin):
    list_display = ["commaddr","serialnumber","commandstate","commandtype","sendparametertime","readparametertime"]

    # list_filter = ("commaddr","readtime")



# @admin.register(Watermeter)
# class WatermeterAdmin(admin.ModelAdmin):
#     list_display = ["id","nodeaddr","wateraddr","communityid","numbersth","buildingname"]
#     list_filter = ("communityid",)
#     search_fields = ("id","nodeaddr","wateraddr","numbersth" )



@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ["id","name","districtid"]

    search_fields = ("id","name","districtid" )



@admin.register(HdbWatermeterDay)
class HdbWatermeterDayAdmin(admin.ModelAdmin):
    list_display = ["waterid","hdate","dosage","communityid"]

    # search_fields = ("id","name","districtid" )