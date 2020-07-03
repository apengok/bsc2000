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
)


@admin.register(VWatermeter)
class VWatermeterAdmin(admin.ModelAdmin):
    list_display = ["id","amrs_watermeter","communityid","belongto"]
    list_filter = ('belongto',)
    search_fields = ['amrs_watermeter__serialnumber','amrs_watermeter__numbersth']


@admin.register(Watermeter)
class WatermeterAdmin(admin.ModelAdmin):
    list_display = ["id","serialnumber","numbersth","buildingname","roomname","communityid",
            "username","usertel","metercontrol"]
    list_filter = ('serialnumber','numbersth')
    search_fields = ['serialnumber']

    actions = ['gene_data_daily','gene_data_monthly']
    
    def gene_data_daily(self,request,queryset):
        rows_updated = queryset.count()

        
        for q in queryset:
            for i in range(1,15):
                try:
                    print('what this for:',q.id,q.communityid)
                    data = {
                        'waterid':q.id,
                        'communityid':q.communityid,
                        'rtime':datetime.date.today().strftime('%Y-%m-%d %H:%M:%S'),
                        'hdate':'2020-02-{:02d}'.format(i),
                        'dosage':random.uniform(2.5, 10.0) 
                    }

                    HdbWatermeterDay.objects.create(**data)

                except Exception as e:
                    print('error appear:',e)
                    pass
        if rows_updated == 1:
            message_bit = "1 item was"
        else:
            message_bit = "%s items were" % rows_updated
        self.message_user(request, "%s successfully updated as nomal." % message_bit)
    gene_data_daily.short_description = 'generate a daily data' 


    def gene_data_monthly(self,request,queryset):
        rows_updated = queryset.count()

        
        for q in queryset:
            for i in range(1,3):
                try:
                    print('what this for:',q.id,q.communityid)
                    data = {
                        'waterid':q.id,
                        'communityid':q.communityid,
                        'hdate':'2020-{:02d}'.format(i),
                        'dosage':random.uniform(12.5, 20.0) 
                    }

                    HdbWatermeterMonth.objects.create(**data)

                except Exception as e:
                    print('error appear:',e)
                    pass
        if rows_updated == 1:
            message_bit = "1 item was"
        else:
            message_bit = "%s items were" % rows_updated
        self.message_user(request, "%s successfully updated as nomal." % message_bit)
    gene_data_monthly.short_description = 'generate a month data' 