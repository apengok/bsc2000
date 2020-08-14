# -*- coding: utf-8 -*-

from django.shortcuts import render
from django.views.generic import TemplateView, ListView, DetailView, CreateView, UpdateView,DeleteView,FormView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.mixins import PermissionRequiredMixin,UserPassesTestMixin

from core.mixins import AjaxableResponseMixin

# Create your views here.

class AllOverviewView(LoginRequiredMixin,TemplateView):
    template_name = "prodschedule/alloverview.html"

    def get_context_data(self, *args, **kwargs):
        context = super(AllOverviewView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "运行总览"
        context["page_menu"] = "生产调度"
        
        return context  



class WwmonitorView(LoginRequiredMixin,TemplateView):
    template_name = "prodschedule/wwmonitor.html"

    def get_context_data(self, *args, **kwargs):
        context = super(WwmonitorView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "水厂监控"
        context["page_menu"] = "生产调度"
        
        return context  



class PumperSeeView(LoginRequiredMixin,TemplateView):
    template_name = "prodschedule/pumpersee.html"

    def get_context_data(self, *args, **kwargs):
        context = super(PumperSeeView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "泵站监测"
        context["page_menu"] = "生产调度"
        
        return context  



class DeepWellView(LoginRequiredMixin,TemplateView):
    template_name = "prodschedule/deepwell.html"

    def get_context_data(self, *args, **kwargs):
        context = super(DeepWellView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "深水源井"
        context["page_menu"] = "生产调度"
        
        return context  



class ElectroSysView(LoginRequiredMixin,TemplateView):
    template_name = "prodschedule/electrosys.html"

    def get_context_data(self, *args, **kwargs):
        context = super(ElectroSysView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "配电系统"
        context["page_menu"] = "生产调度"
        
        return context  



class RealtimeVideoView(LoginRequiredMixin,TemplateView):
    template_name = "prodschedule/realtimevideo.html"

    def get_context_data(self, *args, **kwargs):
        context = super(RealtimeVideoView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "实时视频"
        context["page_menu"] = "生产调度"
        
        return context  



class WarningCheckView(LoginRequiredMixin,TemplateView):
    template_name = "prodschedule/warningcheck.html"

    def get_context_data(self, *args, **kwargs):
        context = super(WarningCheckView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "报警查询"
        context["page_menu"] = "生产调度"
        
        return context  



class HistoryDataView(LoginRequiredMixin,TemplateView):
    template_name = "prodschedule/historydata.html"

    def get_context_data(self, *args, **kwargs):
        context = super(HistoryDataView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "历史数据"
        context["page_menu"] = "生产调度"
        
        return context  



class GeneralReportView(LoginRequiredMixin,TemplateView):
    template_name = "prodschedule/generalreport.html"

    def get_context_data(self, *args, **kwargs):
        context = super(GeneralReportView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "综合报表"
        context["page_menu"] = "生产调度"
        
        return context  




class FactoryviewView(LoginRequiredMixin,TemplateView):
    template_name = "prodschedule/factoryview.html"

    def get_context_data(self, *args, **kwargs):
        context = super(FactoryviewView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "厂区总览"
        context["page_menu"] = "生产调度"
        
        return context  


class HydromodelView(LoginRequiredMixin,TemplateView):
    template_name = "prodschedule/hydromodel.html"

    def get_context_data(self, *args, **kwargs):
        context = super(HydromodelView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "水力模型"
        context["page_menu"] = "生产调度"
        
        return context  
