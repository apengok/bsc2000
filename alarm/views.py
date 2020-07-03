# -*- coding: utf-8 -*-

from django.shortcuts import render
from django.views.generic import TemplateView, ListView, DetailView, CreateView, UpdateView,DeleteView,FormView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.mixins import PermissionRequiredMixin,UserPassesTestMixin

from core.mixins import AjaxableResponseMixin

# Create your views here.

class StationalarmView(LoginRequiredMixin,TemplateView):
    template_name = "alarm/stationalarm.html"

    def get_context_data(self, *args, **kwargs):
        context = super(StationalarmView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "站点报警设置"
        context["page_menu"] = "报警中心"
        
        return context  



class DmaalarmView(LoginRequiredMixin,TemplateView):
    template_name = "alarm/dmaalarm.html"

    def get_context_data(self, *args, **kwargs):
        context = super(DmaalarmView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "DMA报警设置"
        context["page_menu"] = "报警中心"
        
        return context  



class QueryalarmView(LoginRequiredMixin,TemplateView):
    template_name = "alarm/queryalarm.html"

    def get_context_data(self, *args, **kwargs):
        context = super(QueryalarmView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "报警查询"
        context["page_menu"] = "报警中心"
        
        return context  
