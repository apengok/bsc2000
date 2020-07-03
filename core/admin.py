# -*- coding:utf-8 -*-
from django.contrib import admin
from .models import Organization,VCommunity
# Register your models here.

# @admin.register(Organization)
# class OrganizationAdmin(admin.ModelAdmin):
#     list_display = ['name','parent','attribute','organlevel','register_date','owner_name','phone_number','firm_address','cid','pId','is_org','uuid']
#     list_filter = ('organlevel','attribute')
#     search_fields = ['name']


# @admin.register(VCommunity)
# class VCommunityAdmin(admin.ModelAdmin):
#     list_display = ['name','address']
#     search_fields = ['name']