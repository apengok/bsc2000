# -*- coding: utf-8 -*-

from django.contrib import admin
from core.models import Personalized
from core.mixins import ExportCsvMixin
# Register your models here.


@admin.register(Personalized)
class PersonalizedAdmin(admin.ModelAdmin,ExportCsvMixin):
    list_display = ['belongto','ptype','loginLogo', 'webIco','homeLogo','topTitle','copyright','websiteName','recordNumber','frontPageMsg','frontPageMsgUrl']

    actions = ['export_as_csv']
    