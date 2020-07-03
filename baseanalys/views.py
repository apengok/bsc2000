# -*- coding: utf-8 -*-

from django.shortcuts import render
from django.views.generic import TemplateView, ListView, DetailView, CreateView, UpdateView,DeleteView,FormView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.mixins import PermissionRequiredMixin,UserPassesTestMixin

from core.mixins import AjaxableResponseMixin

# Create your views here.

class DmabaView(LoginRequiredMixin,TemplateView):
    template_name = "baseanalys/dmaba.html"

    def get_context_data(self, *args, **kwargs):
        context = super(DmabaView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "DMA基准"
        context["page_menu"] = "基准分析"
        
        return context  

class MnfbaView(LoginRequiredMixin,TemplateView):
    template_name = "baseanalys/mnfba.html"

    def get_context_data(self, *args, **kwargs):
        context = super(MnfbaView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "MNF基准"
        context["page_menu"] = "基准分析"
        
        return context  

class DayusebaView(LoginRequiredMixin,TemplateView):
    template_name = "baseanalys/dayuseba.html"

    def get_context_data(self, *args, **kwargs):
        context = super(DayusebaView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "日用水基准"
        context["page_menu"] = "基准分析"
        
        return context  
