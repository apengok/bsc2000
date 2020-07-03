# -*- coding:utf-8 -*-

from django.contrib import admin
from django.conf.urls import url
from django.shortcuts import render,redirect
from core.mixins import ExportCsvMixin
from . forms import CsvImportForm
import unicodecsv
from core.models import Organization

# Register your models here.

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin,ExportCsvMixin):
    list_display = ['name','parent','attribute','organlevel','register_date','owner_name','phone_number','firm_address','cid','pId','is_org','uuid']
    list_filter = ('organlevel','attribute')
    search_fields = ['name']

    actions = ['set_sublevel','export_as_csv']

    change_list_template = "entm/heroes_changelist.html"

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            # ...
            url('import-csv/', self.import_csv),
        ]
        return my_urls + urls

    def import_csv(self, request):
        if request.method == "POST":
            csv_file = request.FILES["csv_file"]
            reader = unicodecsv.reader(csv_file)
            # Create Hero objects from passed in data
            # ...
            headers = next(reader)
            print(headers,len(headers))
            # data = {i: v for (i, v) in enumerate(reader)}
            organ = Organization.objects.first()
            for row in reader:
                # print(row,len(row))
                data = {headers[i]:v for (i, v) in enumerate(row)}
                del data["id"]
                del data["lft"]
                del data["rght"]
                del data["tree_id"]
                del data["level"]
                
                data["parent"] = organ
                # data = ["{}={}".format(headers[i],v) for (i, v) in enumerate(row)]
                # tdata = list("{}={}".format(k,v) for k,v in data.items())
                print(data)
                
                Organization.objects.create(**data)
                # for i in range(len(row)):
                #     print("{}.{}={}".format(i,headers[i],row[i]))
            self.message_user(request, "Your csv file has been imported")
            return redirect("..")
        form = CsvImportForm()
        payload = {"form": form}
        return render(
            request, "entm/csv_form.html", payload
        )

    def set_sublevel(self,request,queryset):
        # rows_updated = queryset.update(meterstate='正常')
        rows_updated = queryset.count()

        def set_level(q):
            if q.parent:
                level = q.parent.organlevel
                attr = q.parent.attribute
                if attr == "自来水公司":
                    q.attribute = attr
                    q.organlevel = int(level)+1
                    q.save()
                else:
                    q.attribute = "非自来水公司"
                    q.save()
        
        for q in queryset:
            try:
                for s in q.sub_Organization(include_self=False):
                    print(s)
                    set_level(s)
            except Exception as e:
                print('error appear:',e)
                pass
        if rows_updated == 1:
            message_bit = "1 item was"
        else:
            message_bit = "%s items were" % rows_updated
        self.message_user(request, "%s successfully updated as nomal." % message_bit)
    set_sublevel.short_description = 'set sub organization level' 