# -*- coding: utf-8 -*-

from django.shortcuts import render
from django.views.generic import TemplateView, ListView, DetailView, CreateView, UpdateView,DeleteView,FormView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.mixins import PermissionRequiredMixin,UserPassesTestMixin

from core.mixins import AjaxableResponseMixin

# Create your views here.

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
