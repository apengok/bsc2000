# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import get_object_or_404,render,redirect
from django.http import HttpResponse,JsonResponse,HttpResponseRedirect,StreamingHttpResponse
from django.contrib import messages
from django.template import TemplateDoesNotExist
import json
import random
import datetime

from django.core.cache import cache
from mptt.utils import get_cached_trees
from mptt.templatetags.mptt_tags import cache_tree_children
from django.contrib.auth.mixins import PermissionRequiredMixin,UserPassesTestMixin
from django.template.loader import render_to_string
from django.shortcuts import render,HttpResponse
from django.views import View
from django.views.generic import TemplateView, ListView, DetailView, CreateView, UpdateView,DeleteView,FormView
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib import admin
from django.contrib.auth.models import Permission
from django.utils.safestring import mark_safe
from django.utils.encoding import escape_uri_path
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from collections import OrderedDict
from accounts.models import User,MyRoles

from core.utils import unique_cid_generator,unique_uuid_generator,unique_rid_generator
import os
from django.conf import settings
from core.utils import merge_values_to_dict
from core.mixins import AjaxableResponseMixin
import logging
from tablib import Dataset
from .resources import SimcardResource,ImportSimcardResource,minimalist_xldate_as_datetime
from entm.forms import OrganizationAddForm,OrganizationEditForm
from amrs.models import (
    Alarm,
    Bigmeter,
    District,
    Community,
    HdbFlowData,
    HdbFlowDataHour,
    HdbFlowDataDay,
    HdbFlowDataMonth,
    HdbPressureData,
    Concentrator,
    MeterParameter,
    Watermeter
)
from core.models import (
    Organization,
    DMABaseinfo,
    DmaStation,
    Station,
    Meter,
    SimCard,
    VConcentrator,
    VCommunity,
    VWatermeter,
    VPressure
)

logger_info = logging.getLogger('info_logger')
logger_error = logging.getLogger('error_logger')



from .forms import (
    MeterAddForm,MeterEditForm,SimCardAddForm,SimCardEditForm,
    PressureAddForm,
    PressureEditForm,
    ConcentratorCreateForm,
    ConcentratorEditForm
)
# Create your views here.

# 表具管理/表具列表 dataTable
def meterlist(request):
    draw = 1
    length = 0
    start=0
    print('userlist:',request.user)
    if request.method == "GET":
        draw = int(request.GET.get("draw", 1))
        length = int(request.GET.get("length", 10))
        start = int(request.GET.get("start", 0))
        search_value = request.GET.get("search[value]", None)
        # order_column = request.GET.get("order[0][column]", None)[0]
        # order = request.GET.get("order[0][dir]", None)[0]
        groupName = request.GET.get("groupName")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        # print("simpleQueryParam",simpleQueryParam)

    if request.method == "POST":
        draw = int(request.POST.get("draw", 1))
        length = int(request.POST.get("length", 10))
        start = int(request.POST.get("start", 0))
        pageSize = int(request.POST.get("pageSize", 10))
        search_value = request.POST.get("search[value]", None)
        # order_column = request.POST.get("order[0][column]", None)[0]
        # order = request.POST.get("order[0][dir]", None)[0]
        groupName = request.POST.get("groupName")
        districtId = request.POST.get("districtId")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        # print(request.POST.get("draw"))
        print("groupName",groupName)
        print("districtId:",districtId)
        # print("post simpleQueryParam",simpleQueryParam)

    print("get userlist:",draw,length,start,search_value)

    user = request.user
    organs = user.belongto

    meters = user.meter_list_queryset(simpleQueryParam).values("pk","serialnumber","simid__simcardNumber","version","dn",
        "metertype","belongto__name","mtype","manufacturer","protocol","R","q3","q1","check_cycle","state","station__username")
    # meters = Meter.objects.all()

    def m_info(m):
        
        return {
            "id":m["pk"],
            # "simid":m.simid,
            # "dn":m.dn,
            # "belongto":m.belongto.name,#current_user.belongto.name,
            # "metertype":m.metertype,
            "serialnumber":m["serialnumber"],
            "simid":m["simid__simcardNumber"] if m["simid__simcardNumber"] else "",
            "version":m["version"],
            "dn":m["dn"],
            "metertype":m["metertype"],
            "belongto":m["belongto__name"],
            "mtype":m["mtype"],
            "manufacturer":m["manufacturer"],
            "protocol":m["protocol"],
            "R":m["R"],
            "q3":m["q3"],
            "q1":m["q1"],
            "check_cycle":m["check_cycle"],
            "state":m["state"],
            "station":m["station__username"] #m.station_set.first().username if m.station_set.count() > 0 else ""
        }
    data = []

    for m in meters[start:start+length]:
        data.append(m_info(m))

    recordsTotal = meters.count()
    # recordsTotal = len(data)
    
    result = dict()
    result["records"] = data
    result["draw"] = draw
    result["success"] = "true"
    result["pageSize"] = pageSize
    result["totalPages"] = recordsTotal/pageSize
    result["recordsTotal"] = recordsTotal
    result["recordsFiltered"] = recordsTotal
    result["start"] = 0
    result["end"] = 0

    print(draw,pageSize,recordsTotal/pageSize,recordsTotal)
    
    return HttpResponse(json.dumps(result))


def repetition(request):
    serialnumber = request.POST.get("serialnumber")
    bflag = not Meter.objects.filter(serialnumber=serialnumber).exists()

    # return HttpResponse(json.dumps(bflag))
    return HttpResponse(json.dumps({"success":bflag}))



class MeterMangerView(LoginRequiredMixin,TemplateView):
    template_name = "devm/meterlist.html"

    def get_context_data(self, *args, **kwargs):
        context = super(MeterMangerView, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "设备管理"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "表具管理"

        # context["user_list"] = User.objects.all()
        

        return context  


"""
User add, manager
"""
class MeterAddView(AjaxableResponseMixin,UserPassesTestMixin,CreateView):
    model = Meter
    form_class = MeterAddForm
    template_name = "devm/meteradd.html"
    success_url = reverse_lazy("devm:metermanager")
    # permission_required = ('entm.rolemanager_perms_basemanager_edit', 'entm.dmamanager_perms_basemanager_edit')

    # @method_decorator(permission_required("dma.change_meters"))
    def dispatch(self, *args, **kwargs):
        #uuid is selectTreeIdAdd namely Organization uuid
        if self.request.method == 'GET':
            uuid = self.request.GET.get("uuid")
            kwargs["uuid"] = uuid

        if self.request.method == 'POST':
            uuid = self.request.POST.get("uuid")
            kwargs["uuid"] = uuid
        print("uuid:",kwargs.get('uuid'))
        return super(MeterAddView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('metermanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "增加用户",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("meter  add here?:",self.request.POST)
        print(self.kwargs,self.args)
        # print(form)
        # do something
        user = self.request.user
        user_groupid = user.belongto.cid
        instance = form.save(commit=False)
        organ_name = self.request.POST.get('belongto')
        
        organization = Organization.objects.get(name=organ_name)
        instance.belongto = organization
        simcardNumber = self.request.POST.get('simid') or ''
        if SimCard.objects.filter(simcardNumber=simcardNumber).exists():
            instance.simid = SimCard.objects.get(simcardNumber=simcardNumber)
        # else:
        #     tmp=SimCard.objects.create(simcardNumber=simcardNumber,belongto=organization)
        #     instance.simid = tmp
        # instance.simid = SimCard.objects.get_or_create(simcardNumber=simcardNumber)
        # instance.simid = SimCard.objects.get_or_create(simcardNumber=simcardNumber)

        return super(MeterAddView,self).form_valid(form)   

    def get_context_data(self, *args, **kwargs):
        context = super(MeterAddView, self).get_context_data(*args, **kwargs)

        print('useradd context',args,kwargs,self.request)
        uuid = self.request.GET.get('uuid') or ''
        
        groupId = ''
        groupname = ''
        if len(uuid) > 0:
            organ = Organization.objects.get(uuid=uuid)
            groupId = organ.cid
            groupname = organ.name
        # else:
        #     user = self.request.user
        #     groupId = user.belongto.cid
        #     groupname = user.belongto.name
        
        context["groupId"] = groupId
        context["groupname"] = groupname

        

        return context  


"""
User edit, manager
"""
class MeterEditView(AjaxableResponseMixin,UserPassesTestMixin,UpdateView):
    model = Meter
    form_class = MeterEditForm
    template_name = "devm/meteredit.html"
    success_url = reverse_lazy("devm:metermanager")
    
    # @method_decorator(permission_required("dma.change_meters"))
    def dispatch(self, *args, **kwargs):
        # self.user_id = kwargs["pk"]
        return super(MeterEditView, self).dispatch(*args, **kwargs)

    def get_object(self):
        return Meter.objects.get(id=self.kwargs["pk"])

    def test_func(self):
        if self.request.user.has_menu_permission_edit('metermanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "修改站点",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def form_invalid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("user edit form_invalid:::")
        return super(MeterEditView,self).form_invalid(form)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print(form)
        print(self.request.POST)

        
        instance = form.save(commit=False)
        organ_name = self.request.POST.get('belongto')
        
        organization = Organization.objects.get(name=organ_name)
        instance.belongto = organization
        
        simcardNumber = self.request.POST.get('simid') or ''
        if SimCard.objects.filter(simcardNumber=simcardNumber).exists():
            instance.simid = SimCard.objects.get(simcardNumber=simcardNumber)

        # 表绑定的站点也要更新simid，尤其是抄表系统的大表
        
        
        # instance.uuid=unique_uuid_generator(instance)
        return super(MeterEditView,self).form_valid(form)
        # role_list = MyRoles.objects.get(id=self.role_id)
        # return HttpResponse(render_to_string("dma/role_manager.html", {"role_list":role_list}))

    # def get(self,request, *args, **kwargs):
    #     print("get::::",args,kwargs)
    #     form = super(MeterEditView, self).get_form()
    #     print("edit form:",form)
    #     # Set initial values and custom widget
    #     initial_base = self.get_initial() #Retrieve initial data for the form. By default, returns a copy of initial.
    #     # initial_base["menu"] = Menu.objects.get(id=1)
    #     self.object = self.get_object()

    #     initial_base["belongto"] = self.object.belongto.name
    #     initial_base["serialnumber"] = self.object.meter.serialnumber
    #     initial_base["dn"] = self.object.meter.dn
    #     initial_base["meter"] = self.object.meter.serialnumber
    #     initial_base["simid"] = self.object.meter.simid
    #     form.initial = initial_base
        
    #     return render(request,self.template_name,
    #                   {"form":form,"object":self.object})

    # def get_context_data(self, **kwargs):
    #     context = super(UserEditView, self).get_context_data(**kwargs)
    #     context["page_title"] = "修改用户"
    #     return context



def meterdeletemore(request):
    # print('userdeletemore',request,request.POST)

    if not request.user.has_menu_permission_edit('metermanager_devm'):
        return HttpResponse(json.dumps({"success":0,"msg":"您没有权限进行操作，请联系管理员."}))

    deltems = request.POST.get("deltems")
    print('deltems:',deltems)
    deltems_list = deltems.split(',')

    for uid in deltems_list:
        u = Meter.objects.get(id=int(uid))
        # print('delete user ',u)
        #删除用户 并且删除用户在分组中的角色
        
        u.delete()

    return HttpResponse(json.dumps({"success":1}))

"""
Assets comment deletion, manager
"""
class MeterDeleteView(AjaxableResponseMixin,UserPassesTestMixin,DeleteView):
    model = Meter
    # template_name = "aidsbank/asset_comment_confirm_delete.html"

    def test_func(self):
        
        if self.request.user.has_menu_permission_edit('metermanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "success": 0,
                "msg":"您没有权限进行操作，请联系管理员."
                    
            }
        HttpResponse(json.dumps(data))
        # return render(self.request,"entm/permission_error.html",data)

    def dispatch(self, *args, **kwargs):
        # self.comment_id = kwargs["pk"]

        print("user delete:",args,kwargs)
        
        return super(MeterDeleteView, self).dispatch(*args, **kwargs)

    def get_object(self,*args, **kwargs):
        # print("delete objects:",self.kwargs,kwargs)
        return Meter.objects.get(pk=kwargs["pk"])

    def delete(self, request, *args, **kwargs):
        """
        Calls the delete() method on the fetched object and then
        redirects to the success URL.
        """
        print("delete?",args,kwargs)
        self.object = self.get_object(*args,**kwargs)

        

        self.object.delete()
        result = dict()
        # result["success"] = 1
        return HttpResponse(json.dumps({"success":1}))
        



#simcard manager
def simcardlist(request):
    draw = 1
    length = 0
    start=0
    print('userlist:',request.user)
    if request.method == "GET":
        draw = int(request.GET.get("draw", 1))
        length = int(request.GET.get("length", 10))
        start = int(request.GET.get("start", 0))
        search_value = request.GET.get("search[value]", None)
        # order_column = request.GET.get("order[0][column]", None)[0]
        # order = request.GET.get("order[0][dir]", None)[0]
        groupName = request.GET.get("groupName")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        # print("simpleQueryParam",simpleQueryParam)

    if request.method == "POST":
        draw = int(request.POST.get("draw", 1))
        length = int(request.POST.get("length", 10))
        start = int(request.POST.get("start", 0))
        pageSize = int(request.POST.get("pageSize", 10))
        search_value = request.POST.get("search[value]", None)
        # order_column = request.POST.get("order[0][column]", None)[0]
        # order = request.POST.get("order[0][dir]", None)[0]
        groupName = request.POST.get("groupName")
        districtId = request.POST.get("districtId")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        # print(request.POST.get("draw"))
        print("groupName",groupName)
        print("districtId:",districtId)
        # print("post simpleQueryParam",simpleQueryParam)

    print("get simcardlist:",draw,length,start,search_value)
    import time
    t1=time.time()
    user = request.user
    organs = user.belongto

    simcards = user.simcard_list_queryset(simpleQueryParam).values("pk","simcardNumber","isStart","iccid","imei","imsi","belongto__name",
        "operator","simFlow","openCardTime","endTime","remark","create_date","update_date","meter__serialnumber","meter__station__username")
    # simcards = SimCard.objects.all()

    def m_info(s):

        #关联表具
        # s_m = ""
        # s_m_t = ""
        # related = "" #是否关联了表具
        # if s.meter.count() > 0:
        #     m = s.meter.first()
        #     s_m = m.serialnumber
        # else:
        #     m = ""

        # #关联站点，站点由表具关联，所以取表具关联的站点
        # if m != "":
        #     if m.station_set.count() > 0:
        #         t = m.station_set.first()
        #         s_m_t = t.username
        #     else:
        #         t = ""
        
        return {
            "id":s["pk"],
            "simcardNumber":s["simcardNumber"],
            "isStart":s["isStart"],
            "iccid":s["iccid"],
            "imei":s["imei"],
            "imsi":s["imsi"],
            "belongto":s["belongto__name"],
            "operator":s["operator"],
            "simFlow":s["simFlow"],
            "openCardTime":s["openCardTime"],
            "endTime":s["endTime"],
            "remark":s["remark"],
            "createDataTime":s["create_date"].strftime("%Y-%m-%d %H:%M:%S"),
            "updateDataTime":s["update_date"].strftime("%Y-%m-%d %H:%M:%S"),
            "meter":s["meter__serialnumber"],
            "station": s["meter__station__username"]
        }
    data = []

    for m in simcards[start:start+length]:
        data.append(m_info(m))

    recordsTotal = simcards.count()
    # recordsTotal = len(data)
    
    result = dict()
    result["records"] = data
    result["draw"] = draw
    result["success"] = "true"
    result["pageSize"] = pageSize
    result["totalPages"] = recordsTotal/pageSize
    result["recordsTotal"] = recordsTotal
    result["recordsFiltered"] = recordsTotal
    result["start"] = 0
    result["end"] = 0

    print(draw,pageSize,recordsTotal/pageSize,recordsTotal)
    print("simcard list time elapsed ",time.time()-t1)
    return HttpResponse(json.dumps(result))

def releaseRelate(request):
    sid = request.POST.get("sid")
    sim = SimCard.objects.get(pk=int(sid))

    sim.meter.clear()
    # sim.meter.simid = None
    return HttpResponse(json.dumps(True))

def getSimRelated(request):
    simcardNumber = request.POST.get("simcardNumber")
    bflag = not SimCard.objects.filter(simcardNumber=simcardNumber).exists()

    return HttpResponse(json.dumps(bflag))

def simcard_repetition(request):
    simcardNumber = request.POST.get("simcardNumber")
    bflag = not SimCard.objects.filter(simcardNumber=simcardNumber).exists()

    return HttpResponse(json.dumps(bflag))
    # return HttpResponse(json.dumps({"success":bflag}))

class SimCardMangerView(LoginRequiredMixin,TemplateView):
    template_name = "devm/simcardlist.html"

    def get_context_data(self, *args, **kwargs):
        context = super(SimCardMangerView, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "设备管理"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "SIM卡管理"

        # context["user_list"] = User.objects.all()
        

        return context  


"""
User add, manager
"""
class SimCardAddView(AjaxableResponseMixin,UserPassesTestMixin,CreateView):
    model = SimCard
    form_class = SimCardAddForm
    template_name = "devm/simcardadd.html"
    success_url = reverse_lazy("devm:simcardmanager")
    # permission_required = ('entm.rolemanager_perms_basemanager_edit', 'entm.dmamanager_perms_basemanager_edit')

    # @method_decorator(permission_required("dma.change_simcards"))
    def dispatch(self, *args, **kwargs):
        #uuid is selectTreeIdAdd namely Organization uuid
        if self.request.method == 'GET':
            uuid = self.request.GET.get("uuid")
            kwargs["uuid"] = uuid

        if self.request.method == 'POST':
            uuid = self.request.POST.get("uuid")
            kwargs["uuid"] = uuid
        print("uuid:",kwargs.get('uuid'))
        return super(SimCardAddView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('simcardmanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "增加用户",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("simcard  add here?:",self.request.POST)
        print(self.kwargs,self.args)
        # print(form)
        # do something
        user = self.request.user
        user_groupid = user.belongto.cid
        instance = form.save(commit=False)
        organ_name = self.request.POST.get('belongto')
        
        organization = Organization.objects.get(name=organ_name)
        instance.belongto = organization
        
        

        return super(SimCardAddView,self).form_valid(form)   

    def get_context_data(self, *args, **kwargs):
        context = super(SimCardAddView, self).get_context_data(*args, **kwargs)

        print('useradd context',args,kwargs,self.request)
        uuid = self.request.GET.get('uuid') or ''
        
        groupId = ''
        groupname = ''
        if len(uuid) > 0:
            organ = Organization.objects.get(uuid=uuid)
            groupId = organ.cid
            groupname = organ.name
        # else:
        #     user = self.request.user
        #     groupId = user.belongto.cid
        #     groupname = user.belongto.name
        
        context["groupId"] = groupId
        context["groupname"] = groupname

        

        return context  


"""
User edit, manager
"""
class SimCardEditView(AjaxableResponseMixin,UserPassesTestMixin,UpdateView):
    model = SimCard
    form_class = SimCardEditForm
    template_name = "devm/simcardedit.html"
    success_url = reverse_lazy("devm:simcardmanager")
    
    # @method_decorator(permission_required("dma.change_simcards"))
    def dispatch(self, *args, **kwargs):
        # self.user_id = kwargs["pk"]
        return super(SimCardEditView, self).dispatch(*args, **kwargs)

    def get_object(self):
        return SimCard.objects.get(id=self.kwargs["pk"])

    def test_func(self):
        if self.request.user.has_menu_permission_edit('simcardmanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "修改站点",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def form_invalid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("user edit form_invalid:::")
        return super(SimCardEditView,self).form_invalid(form)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print(form)
        print(self.request.POST)

        
        instance = form.save(commit=False)
        organ_name = self.request.POST.get('belongto')
        
        organization = Organization.objects.get(name=organ_name)
        instance.belongto = organization
        
        
        
        # instance.uuid=unique_uuid_generator(instance)
        return super(SimCardEditView,self).form_valid(form)
        # role_list = MyRoles.objects.get(id=self.role_id)
        # return HttpResponse(render_to_string("dma/role_manager.html", {"role_list":role_list}))

    # def get(self,request, *args, **kwargs):
    #     print("get::::",args,kwargs)
    #     form = super(SimCardEditView, self).get_form()
    #     print("edit form:",form)
    #     # Set initial values and custom widget
    #     initial_base = self.get_initial() #Retrieve initial data for the form. By default, returns a copy of initial.
    #     # initial_base["menu"] = Menu.objects.get(id=1)
    #     self.object = self.get_object()

    #     initial_base["belongto"] = self.object.belongto.name
    #     initial_base["serialnumber"] = self.object.simcard.serialnumber
    #     initial_base["dn"] = self.object.simcard.dn
    #     initial_base["simcard"] = self.object.simcard.serialnumber
    #     initial_base["simid"] = self.object.simcard.simid
    #     form.initial = initial_base
        
    #     return render(request,self.template_name,
    #                   {"form":form,"object":self.object})

    # def get_context_data(self, **kwargs):
    #     context = super(UserEditView, self).get_context_data(**kwargs)
    #     context["page_title"] = "修改用户"
    #     return context



def simcarddeletemore(request):
    # print('userdeletemore',request,request.POST)

    if not request.user.has_menu_permission_edit('simcardmanager_devm'):
        return HttpResponse(json.dumps({"success":0,"msg":"您没有权限进行操作，请联系管理员."}))

    deltems = request.POST.get("deltems")
    deltems_list = deltems.split(',')

    for uid in deltems_list:
        u = SimCard.objects.get(id=int(uid))
        # print('delete user ',u)
        
        u.delete()

    return HttpResponse(json.dumps({"success":1}))

"""
Assets comment deletion, manager
"""
class SimCardDeleteView(AjaxableResponseMixin,UserPassesTestMixin,DeleteView):
    model = SimCard
    # template_name = "aidsbank/asset_comment_confirm_delete.html"

    def test_func(self):
        
        if self.request.user.has_menu_permission_edit('simcardmanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "success": 0,
                "msg":"您没有权限进行操作，请联系管理员."
                    
            }
        HttpResponse(json.dumps(data))
        # return render(self.request,"entm/permission_error.html",data)

    def dispatch(self, *args, **kwargs):
        # self.comment_id = kwargs["pk"]

        print("user delete:",args,kwargs)
        
        return super(SimCardDeleteView, self).dispatch(*args, **kwargs)

    def get_object(self,*args, **kwargs):
        # print("delete objects:",self.kwargs,kwargs)
        return SimCard.objects.get(pk=kwargs["pk"])

    def delete(self, request, *args, **kwargs):
        """
        Calls the delete() method on the fetched object and then
        redirects to the success URL.
        """
        print("delete?",args,kwargs)
        self.object = self.get_object(*args,**kwargs)

        

        self.object.delete()
        result = dict()
        # result["success"] = 1
        return HttpResponse(json.dumps({"success":1}))

# 移动到devm.api.views
def getSimcardSelect(request):
    # meters = Meter.objects.all()
    # simcards = request.user.simcard_list_queryset('')
    simcards = SimCard.objects.all()

    def m_info(m):
        
        return {
            "id":m.pk,
            # "simid":m.simid,
            # "dn":m.dn,
            # "belongto":m.belongto.name,#current_user.belongto.name,
            # "metertype":m.metertype,
            "name":m.simcardNumber,
            
        }
    data = []

    for m in simcards:
        if m.meter.count() == 0 and m.vpressure_set.count() == 0:
            data.append(m_info(m))

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":data,
        "success":True
    }
   
    # print(operarions_list)
    return JsonResponse(operarions_list)

def getIMEISelect(request):
    # meters = Meter.objects.all()
    # simcards = request.user.belongto.simcard_list_queryset('')
    simcards = SimCard.objects.all()

    def m_info(m):
        
        return {
            "id":m.pk,
            # "simid":m.simid,
            # "dn":m.dn,
            # "belongto":m.belongto.name,#current_user.belongto.name,
            # "metertype":m.metertype,
            "name":m.imei,
            
        }
    data = []

    for m in simcards:
        if  m.imei is not None and m.imei != "":
            data.append(m_info(m))

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":data,
        "success":True
    }
   
    print(operarions_list)
    return JsonResponse(operarions_list)




def getMeterSelect(request):
    meters = Meter.objects.all()
    # meters = request.user.meter_list_queryset('')

    def m_info(m):
        
        return {
            "id":m.pk,
            "name":m.serialnumber,
            
        }
    data = []

    for m in meters:
        if m.station_set.count() == 0:    #len(m.serialnumber) > 2
            data.append(m_info(m))

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":data,
        "success":True
    }
   
    # print(operarions_list)
    return JsonResponse(operarions_list)



# 压力管理/压力表列表 dataTable
def pressurelist(request):
    draw = 1
    length = 0
    start=0
    print('userlist:',request.user)
    if request.method == "GET":
        draw = int(request.GET.get("draw", 1))
        length = int(request.GET.get("length", 10))
        start = int(request.GET.get("start", 0))
        search_value = request.GET.get("search[value]", None)
        # order_column = request.GET.get("order[0][column]", None)[0]
        # order = request.GET.get("order[0][dir]", None)[0]
        groupName = request.GET.get("groupName")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        # print("simpleQueryParam",simpleQueryParam)

    if request.method == "POST":
        draw = int(request.POST.get("draw", 1))
        length = int(request.POST.get("length", 10))
        start = int(request.POST.get("start", 0))
        pageSize = int(request.POST.get("pageSize", 10))
        search_value = request.POST.get("search[value]", None)
        # order_column = request.POST.get("order[0][column]", None)[0]
        # order = request.POST.get("order[0][dir]", None)[0]
        groupName = request.POST.get("groupName")
        districtId = request.POST.get("districtId")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        # print(request.POST.get("draw"))
        print("groupName",groupName)
        print("districtId:",districtId)
        # print("post simpleQueryParam",simpleQueryParam)

    print("get userlist:",draw,length,start,search_value)

    user = request.user
    organs = user.belongto

    meters = user.pressure_list_queryset(simpleQueryParam).values("pk","serialnumber","simid__simcardNumber","version","dn",
        "metertype","belongto__name","mtype","manufacturer","protocol","lng","lat","coortype","check_cycle","state")
    # meters = Meter.objects.all()

    def m_info(m):
        
        return {
            "id":m["pk"],
            # "simid":m.simid,
            # "dn":m.dn,
            # "belongto":m.belongto.name,#current_user.belongto.name,
            # "metertype":m.metertype,
            "serialnumber":m["serialnumber"],
            "simid":m["simid__simcardNumber"] if m["simid__simcardNumber"] else "",
            "version":m["version"],
            "dn":m["dn"],
            "metertype":m["metertype"],
            "belongto":m["belongto__name"],
            "mtype":m["mtype"],
            "manufacturer":m["manufacturer"],
            "protocol":m["protocol"],
            "lng":m["lng"],
            "lat":m["lat"],
            "coortype":m["coortype"],
            "check_cycle":m["check_cycle"],
            "state":m["state"],
            
        }
    data = []

    for m in meters[start:start+length]:
        data.append(m_info(m))

    recordsTotal = meters.count()
    # recordsTotal = len(data)
    
    result = dict()
    result["records"] = data
    result["draw"] = draw
    result["success"] = "true"
    result["pageSize"] = pageSize
    result["totalPages"] = recordsTotal/pageSize
    result["recordsTotal"] = recordsTotal
    result["recordsFiltered"] = recordsTotal
    result["start"] = 0
    result["end"] = 0

    print(draw,pageSize,recordsTotal/pageSize,recordsTotal)
    
    return HttpResponse(json.dumps(result))


def pressure_repetition(request):
    serialnumber = request.POST.get("serialnumber")
    bflag = not VPressure.objects.filter(amrs_pressure__serialnumber=serialnumber).exists()

    # return HttpResponse(json.dumps(bflag))
    return HttpResponse(json.dumps({"success":bflag}))



class PressureMangerView(LoginRequiredMixin,TemplateView):
    template_name = "devm/pressuremanager.html"

    def get_context_data(self, *args, **kwargs):
        context = super(PressureMangerView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "压力管理"
        context["page_menu"] = "设备管理"
        
        return context  



"""
User add, manager
"""
class VPressureAddView(AjaxableResponseMixin,UserPassesTestMixin,CreateView):
    model = Bigmeter
    form_class = PressureAddForm
    template_name = "devm/pressureadd.html"
    success_url = reverse_lazy("devm:pressuremanager")
    # permission_required = ('entm.rolemanager_perms_basemanager_edit', 'entm.dmamanager_perms_basemanager_edit')

    # @method_decorator(permission_required("dma.change_pressures"))
    def dispatch(self, *args, **kwargs):
        #uuid is selectTreeIdAdd namely Organization uuid
        if self.request.method == 'GET':
            uuid = self.request.GET.get("uuid")
            kwargs["uuid"] = uuid

        if self.request.method == 'POST':
            uuid = self.request.POST.get("uuid")
            kwargs["uuid"] = uuid
        print("uuid:",kwargs.get('uuid'))
        return super(VPressureAddView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('pressuremanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "增加用户",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("pressure  add here?:",self.request.POST)
        print(self.kwargs,self.args)
        print(form)
        # do something
        user = self.request.user
        user_groupid = user.belongto.cid
        organ_name = self.request.POST.get('belongto')
        belongto = Organization.objects.get(name=organ_name)

        amrs_bigmeter_press = form.save(commit=True)

        if amrs_bigmeter_press.username == None:
            amrs_bigmeter_press.username = amrs_bigmeter_press.serialnumber
        
        protocol = self.request.POST.get("protocol")
        check_cycle = self.request.POST.get("check_cycle")
        version = self.request.POST.get("version")
        state = self.request.POST.get("state")
        vpressure = {
            "amrs_pressure":amrs_bigmeter_press,
            "belongto":belongto,
            "protocol":protocol,
            "check_cycle":check_cycle,
            "version":version,
            "state":state
        }
        
        vpressure_obj = VPressure.objects.create(**vpressure)
        
        # instance.belongto = organization
        # simcardNumber = self.request.POST.get('simid') or ''
        # if SimCard.objects.filter(simcardNumber=simcardNumber).exists():
        #     instance.simid = SimCard.objects.get(simcardNumber=simcardNumber)
        # else:
        #     tmp=SimCard.objects.create(simcardNumber=simcardNumber,belongto=organization)
        #     instance.simid = tmp
        # instance.simid = SimCard.objects.get_or_create(simcardNumber=simcardNumber)
        # instance.simid = SimCard.objects.get_or_create(simcardNumber=simcardNumber)

        return super(VPressureAddView,self).form_valid(form)   

    def get_context_data(self, *args, **kwargs):
        context = super(VPressureAddView, self).get_context_data(*args, **kwargs)

        print('useradd context',args,kwargs,self.request)
        uuid = self.request.GET.get('uuid') or ''
        
        groupId = ''
        groupname = ''
        if len(uuid) > 0:
            organ = Organization.objects.get(uuid=uuid)
            groupId = organ.cid
            groupname = organ.name
        # else:
        #     user = self.request.user
        #     groupId = user.belongto.cid
        #     groupname = user.belongto.name
        
        context["groupId"] = groupId
        context["groupname"] = groupname

        

        return context  


"""
User edit, manager
"""
class VPressureEditView(AjaxableResponseMixin,UserPassesTestMixin,UpdateView):
    model = Bigmeter
    form_class = PressureEditForm
    template_name = "devm/pressureedit.html"
    success_url = reverse_lazy("devm:pressuremanager")
    
    # @method_decorator(permission_required("dma.change_pressures"))
    def dispatch(self, *args, **kwargs):
        # self.user_id = kwargs["pk"]
        return super(VPressureEditView, self).dispatch(*args, **kwargs)

    def get_object(self):
        return Bigmeter.objects.get(pk=self.kwargs["pk"])

    def test_func(self):
        if self.request.user.has_menu_permission_edit('pressuremanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "修改站点",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def form_invalid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("user edit form_invalid:::")
        return super(VPressureEditView,self).form_invalid(form)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print(form)
        print(self.request.POST)

        
        organ_name = self.request.POST.get('belongto')
        belongto = Organization.objects.get(name=organ_name)
        amrs_bigmeter_press = form.save(commit=True)

        if amrs_bigmeter_press.username != amrs_bigmeter_press.serialnumber:
            amrs_bigmeter_press.username = amrs_bigmeter_press.serialnumber
        
        protocol = self.request.POST.get("protocol")
        check_cycle = self.request.POST.get("check_cycle")
        state = self.request.POST.get("state")
        version = self.request.POST.get("version")
        
        vpressure_obj = self.get_object().vpressure
        vpressure_obj.belongto = belongto
        vpressure_obj.check_cycle = check_cycle
        vpressure_obj.protocol = protocol
        vpressure_obj.state = state
        vpressure_obj.version = version
        vpressure_obj.save()
        
        return super(VPressureEditView,self).form_valid(form)
        

    # def get(self,request, *args, **kwargs):
    #     print("get::::",args,kwargs)
    #     form = super(VPressureEditView, self).get_form()
    #     print("edit form:",form)
    #     # Set initial values and custom widget
    #     initial_base = self.get_initial() #Retrieve initial data for the form. By default, returns a copy of initial.
    #     # initial_base["menu"] = Menu.objects.get(id=1)
    #     self.object = self.get_object()

    #     initial_base["belongto"] = self.object.belongto.name
    #     initial_base["serialnumber"] = self.object.pressure.serialnumber
    #     initial_base["dn"] = self.object.pressure.dn
    #     initial_base["pressure"] = self.object.pressure.serialnumber
    #     initial_base["simid"] = self.object.pressure.simid
    #     form.initial = initial_base
        
    #     return render(request,self.template_name,
    #                   {"form":form,"object":self.object})

    # def get_context_data(self, **kwargs):
    #     context = super(UserEditView, self).get_context_data(**kwargs)
    #     context["page_title"] = "修改用户"
    #     return context



def pressuredeletemore(request):
    # print('userdeletemore',request,request.POST)

    if not request.user.has_menu_permission_edit('pressuremanager_devm'):
        return HttpResponse(json.dumps({"success":0,"msg":"您没有权限进行操作，请联系管理员."}))

    deltems = request.POST.get("deltems")
    print('deltems:',deltems)
    deltems_list = deltems.split(',')

    for commaddr in deltems_list:
        pressure = Bigmeter.objects.get(commaddr=commaddr)
        # print('delete user ',u)
        # obj.amrs_bigmeter.delete()
        # obj.delete()
        # 删除历史采样数据
        # HdbFlowData.objects.filter(commaddr=commaddr).delete()
        # HdbFlowDataHour.objects.filter(commaddr=commaddr).delete()
        # HdbFlowDataDay.objects.filter(commaddr=commaddr).delete()
        # HdbFlowDataMonth.objects.filter(commaddr=commaddr).delete()
        # HdbPressureData.objects.filter(commaddr=commaddr).delete()
        # Alarm.objects.filter(commaddr=commaddr).delete()
        
        pressure.delete()

    return HttpResponse(json.dumps({"success":1}))

"""
Assets comment deletion, manager
"""
class VPressureDeleteView(AjaxableResponseMixin,UserPassesTestMixin,DeleteView):
    model = Bigmeter
    # template_name = "aidsbank/asset_comment_confirm_delete.html"

    def test_func(self):
        
        if self.request.user.has_menu_permission_edit('pressuremanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "success": 0,
                "msg":"您没有权限进行操作，请联系管理员."
                    
            }
        HttpResponse(json.dumps(data))
        # return render(self.request,"entm/permission_error.html",data)

    def dispatch(self, *args, **kwargs):
        # self.comment_id = kwargs["pk"]

        print("user delete:",args,kwargs)
        
        return super(VPressureDeleteView, self).dispatch(*args, **kwargs)

    def get_object(self,*args, **kwargs):
        # print("delete objects:",self.kwargs,kwargs)
        return Bigmeter.objects.get(pk=kwargs["pk"])

    def delete(self, request, *args, **kwargs):
        """
        Calls the delete() method on the fetched object and then
        redirects to the success URL.
        """
        print("delete?",args,kwargs)
        self.object = self.get_object(*args,**kwargs)
        commaddr = self.object.commaddr
        # 删除历史采样数据
        # HdbFlowData.objects.filter(commaddr=commaddr).delete()
        # HdbFlowDataHour.objects.filter(commaddr=commaddr).delete()
        # HdbFlowDataDay.objects.filter(commaddr=commaddr).delete()
        # HdbFlowDataMonth.objects.filter(commaddr=commaddr).delete()
        # HdbPressureData.objects.filter(commaddr=commaddr).delete()
        # Alarm.objects.filter(commaddr=commaddr).delete()

        # self.object.delete()
        
        return HttpResponse(json.dumps({"success":1}))
        


class FireboltMangerView(LoginRequiredMixin,TemplateView):
    template_name = "devm/fireboltmanager.html"

    def get_context_data(self, *args, **kwargs):
        context = super(FireboltMangerView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "消防栓管理"
        context["page_menu"] = "设备管理"
        
        return context  


class ConcentratorMangerView(LoginRequiredMixin,TemplateView):
    template_name = "devm/concentratormanager.html"

    def get_context_data(self, *args, **kwargs):
        context = super(ConcentratorMangerView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "集中器管理"
        context["page_menu"] = "设备管理"
        
        return context  


def concentrator_repetition(request):
    name = request.POST.get("name")
    # commaddr = request.POST.get("commaddr")
    bflag = not VConcentrator.objects.filter(amrs_concentrator__name=name).exists()

    # return HttpResponse(json.dumps(bflag))
    return HttpResponse(json.dumps({"success":bflag}))

def repetition_commaddr(request):
    # name = request.POST.get("name")
    commaddr = request.POST.get("commaddr")
    bflag = not VConcentrator.objects.filter(amrs_concentrator__commaddr=commaddr).exists()

    # return HttpResponse(json.dumps(bflag))
    return HttpResponse(json.dumps({"success":bflag}))

"""
User add, manager
"""
class ConcentratorAddView(AjaxableResponseMixin,UserPassesTestMixin,CreateView):
    model = Concentrator
    form_class = ConcentratorCreateForm
    template_name = "devm/concentratoradd.html"
    success_url = reverse_lazy("devm:concentratormanager")
    # permission_required = ('entm.rolemanager_perms_basemanager_edit', 'entm.dmamanager_perms_basemanager_edit')

    # @method_decorator(permission_required("dma.change_meters"))
    def dispatch(self, *args, **kwargs):
        #uuid is selectTreeIdAdd namely Organization uuid
        if self.request.method == 'GET':
            uuid = self.request.GET.get("uuid")
            kwargs["uuid"] = uuid

        if self.request.method == 'POST':
            uuid = self.request.POST.get("uuid")
            kwargs["uuid"] = uuid
        print("uuid:",kwargs.get('uuid'))
        return super(ConcentratorAddView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('concentratormanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "新增集中器",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("concentrator  add here?:",self.request.POST)
        print(self.kwargs,self.args)
        print(form)
        # do something
        user = self.request.user
        user_groupid = user.belongto.cid
        try:
            print(form)
            amrs_concentrator = form.save(commit=True)
        except Exception as e:
            print(e)
            print(form)
            # tmp = Concentrator.objects.filter(commaddr=form.)
            amrs_concentrator = None

        organ_name = self.request.POST.get('belongto')
        
        organization = Organization.objects.get(name=organ_name)
        # instance.belongto = organization
        bsc_concentrator = VConcentrator.objects.create(
            amrs_concentrator=amrs_concentrator,
            belongto=organization)
        
        

        return super(ConcentratorAddView,self).form_valid(form)  

    def form_invalid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("concentrator  add here?:",self.request.POST)
        # print(self.kwargs,self.args)
        # print(form)
        
        
            
        # do something
        # 当amrs数据库中已经有该commaddr记录时直接更新
        user = self.request.user
        user_groupid = user.belongto.cid
        try:
            commaddr = self.request.POST.get("commaddr")
            # 'name','lng','lat','coortype','model','serialnumber','manufacturer','madedate',,'address'
            amrs_concentrator = Concentrator.objects.get(commaddr=commaddr)
            amrs_concentrator.name = self.request.POST.get("name")
            amrs_concentrator.lng = self.request.POST.get("lng")
            amrs_concentrator.lat = self.request.POST.get("lat")
            amrs_concentrator.coortype = self.request.POST.get("coortype")
            amrs_concentrator.serialnumber = self.request.POST.get("serialnumber")
            amrs_concentrator.manufacturer = self.request.POST.get("manufacturer")
            amrs_concentrator.madedate = self.request.POST.get("madedate")
            amrs_concentrator.address = self.request.POST.get("address")
            amrs_concentrator.save()

        except Exception as e:
            print(e)
            return super(ConcentratorAddView,self).form_invalid(form)   

        organ_name = self.request.POST.get('belongto')
        
        organization = Organization.objects.get(name=organ_name)
        # instance.belongto = organization
        bsc_concentrator = VConcentrator.objects.create(
            amrs_concentrator=amrs_concentrator,
            belongto=organization)
        
        

        return HttpResponse(json.dumps({
                "success": 1,
                "obj":{"flag":1}
            }))

    def get_context_data(self, *args, **kwargs):
        context = super(ConcentratorAddView, self).get_context_data(*args, **kwargs)

        uuid = self.request.GET.get('uuid') or ''
        
        groupId = ''
        groupname = ''
        if len(uuid) > 0:
            organ = Organization.objects.get(uuid=uuid)
            groupId = organ.cid
            groupname = organ.name
        # else:
        #     user = self.request.user
        #     groupId = user.belongto.cid
        #     groupname = user.belongto.name
        
        context["groupId"] = groupId
        context["groupname"] = groupname

        

        return context  


class ConcentratorConfigView(AjaxableResponseMixin,UserPassesTestMixin,DetailView):
    '''
        集中器配置
    '''
    model = Concentrator
    template_name = "devm/concentratorconfig.html"
    success_url = reverse_lazy("devm:concentratormanager")
    
    # @method_decorator(permission_required("dma.change_meters"))
    def dispatch(self, *args, **kwargs):
        # self.user_id = kwargs["pk"]
        return super(ConcentratorConfigView, self).dispatch(*args, **kwargs)

    def get_object(self):
        return Concentrator.objects.get(commaddr=self.kwargs["pk"])

    def test_func(self):
        if self.request.user.has_menu_permission_edit('concentratormanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "修改集中器",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def get_context_data(self, *args, **kwargs):
        context = super(ConcentratorConfigView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "配置集中器"
        context["page_menu"] = "设备管理"

        obj = self.get_object()
        context["object"] = obj

        # watermeters = obj.vwatermeter_set.all()
        # print("concentrator waterlis:",watermeters)
        # wmlist = []
        # for w in watermeters:
        #     wmlist.append({
        #         "id":w.pk,
        #         "operation":"",
        #         "serialnumber":w.serialnumber,
        #         "valvestate":"open",
        #         "dosage":"123",
        #         "lastreadtime":"2019-12-16 16:42:59",
        #         "status":"sending...",
        #     })
        
        return context  


class ConcentratorConfigNBView(AjaxableResponseMixin,UserPassesTestMixin,DetailView):
    '''
        NB1.0 集中器配置
    '''
    model = Concentrator
    template_name = "devm/concentrator_nbconfig.html"
    success_url = reverse_lazy("devm:concentratormanager")
    
    # @method_decorator(permission_required("dma.change_meters"))
    def dispatch(self, *args, **kwargs):
        # self.user_id = kwargs["pk"]
        return super(ConcentratorConfigNBView, self).dispatch(*args, **kwargs)

    def get_object(self):
        return Concentrator.objects.get(commaddr=self.kwargs["pk"])

    def test_func(self):
        if self.request.user.has_menu_permission_edit('concentratormanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "修改集中器",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def get_context_data(self, *args, **kwargs):
        context = super(ConcentratorConfigNBView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "配置集中器"
        context["page_menu"] = "设备管理"

        obj = self.get_object()
        context["object"] = obj

        # watermeters = obj.vwatermeter_set.all()
        # print("concentrator waterlis:",watermeters)
        # wmlist = []
        # for w in watermeters:
        #     wmlist.append({
        #         "id":w.pk,
        #         "operation":"",
        #         "serialnumber":w.serialnumber,
        #         "valvestate":"open",
        #         "dosage":"123",
        #         "lastreadtime":"2019-12-16 16:42:59",
        #         "status":"sending...",
        #     })
        
        return context  

def getConcentratorReplyStatus(request):
    print("getConcentratorReplyStatus")
    con_id = request.GET.get("con_id")

    try:
        concentrator = VConcentrator.objects.get(id=int(con_id))
        amrs_conid = concentrator.amrs_concentratorid
        amrs_concentrator = Concentrator.objects.get(commaddr=amrs_conid)
        bflag = amrs_concentrator.replystatus == '删除表计[成功]' or amrs_concentrator.replystatus == '清除表计[成功]'
        
    except Exception as e:
        print("getwatermeter error:",e)
        bflag = False

    return HttpResponse(json.dumps({"success":bflag}))
    

    # 删除表计
def deletemeter_bystatus(request):
    con_id = request.GET.get("con_id")

    try:
        concentrator = VConcentrator.objects.get(id=int(con_id))

        for m in concentrator.vwatermeter_set.all():
            amrs_id = m.waterid
            amrs_watermeter = Watermeter.objects.get(id=amrs_id)
            if amrs_watermeter.metersetstate=='删除成功':
                amrs_watermeter.delete()
                m.delete()

        bflag = True
        
    except Exception as e:
        print("getwatermeter error:",e)
        bflag = False

    return HttpResponse(json.dumps({"success":bflag}))
    
    # 清除表计 和删除表计同
def clearmeter_bystatus(request):
    con_id = request.GET.get("con_id")

    try:
        concentrator = VConcentrator.objects.get(id=int(con_id))
        # concentrator.vwatermeter_set.all().delete()
        for m in concentrator.vwatermeter_set.all():
            amrs_id = m.waterid
            amrs_watermeter = Watermeter.objects.get(id=amrs_id)
            if amrs_watermeter.metersetstate=='删除成功':
                amrs_watermeter.delete()
                m.delete()

        
        
    except Exception as e:
        print("getwatermeter error:",e)
        bflag = False

    return HttpResponse(json.dumps({"success":bflag}))

def getwatermeterlistbyconId(request):
    '''
        集中器config，送上来的是amrs.concentrator.commaddr
    '''
    print("getwatermeterlistbyconId")
    commaddr = request.GET.get("con_id")
    print('con_id:',commaddr)

    try:
        amrs_concentrator = Concentrator.objects.get(commaddr=commaddr)
        concentrator_info = {
            "readtime":amrs_concentrator.readtime,
            "readperiod":amrs_concentrator.readperiod,
            "readip":amrs_concentrator.readip,
            "readport":amrs_concentrator.readport,
            "replystatus":amrs_concentrator.replystatus,
        }
    except Exception as e:
        print("get concentrator error:",e)
        concentrator_info = {}

    def get_operation(simid):
        simcard = Simcard.objects.filter(simid=simid)
        if simcard.exists():
            return simcard.first().operator
        else:
            return ''

    def m_info(m):
        # amrs_id = m.waterid
        # amrs_watermeter = Watermeter.objects.get(id=amrs_id)
        simid=m.amrs_watermeter.wateraddr
        print('simid=',simid)
        simcard = SimCard.objects.filter(imei=simid)
        if simcard.exists():
            operator =  simcard.first().operator
        else:
            operator =  ''

        return {
            "id":m.amrs_watermeter.id,
            "serialnumber":m.amrs_watermeter.serialnumber,
            "wateraddr":m.amrs_watermeter.wateraddr,
            "operation":'',
            "operator":operator,
            "valvestate":m.amrs_watermeter.valvestate,
            "dosage":m.amrs_watermeter.rvalue,
            "lastreadtime":m.amrs_watermeter.rtime,
            "status":m.amrs_watermeter.metersetstate,
            "deviceid":m.amrs_watermeter.deviceid
        }
    data = []

    # 集中器
    concentrator = amrs_concentrator.vconcentrator
    # 集中器绑定的小区
    try:
        community = VCommunity.objects.filter(vconcentrators__id=concentrator.id).first()
        print(community)
        print('dsaf===',community.watermeter.all())
        for m in community.watermeter.all():
            
            data.append(m_info(m))
    except Exception as e:
        print(e)
        pass

    print(data)
    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "meterlist":data,
        "concentrator_info":concentrator_info,
        "success":True
    }
   

    return JsonResponse(operarions_list)


"""
User edit, manager
"""
class ConcentratorEditView(AjaxableResponseMixin,UserPassesTestMixin,UpdateView):
    model = Concentrator
    form_class = ConcentratorEditForm
    template_name = "devm/concentratoredit.html"
    success_url = reverse_lazy("devm:concentratormanager")
    
    # @method_decorator(permission_required("dma.change_meters"))
    def dispatch(self, *args, **kwargs):
        # self.user_id = kwargs["pk"]
        return super(ConcentratorEditView, self).dispatch(*args, **kwargs)

    def get_object(self):
        print(self.kwargs["pk"])
        return Concentrator.objects.get(commaddr=self.kwargs["pk"])

    def test_func(self):
        if self.request.user.has_menu_permission_edit('concentratormanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "修改集中器",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def form_invalid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("user edit form_invalid:::")
        return super(ConcentratorEditView,self).form_invalid(form)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        # print(form)
        # print(self.request.POST)

        
        amrs_instance = form.save(commit=False)
        organ_name = self.request.POST.get('belongto')
        print('change organ to',organ_name)
        organization = Organization.objects.get(name=organ_name)
        # amrs_instance.belongto = organization
        if self.get_object().vconcentrator.belongto.name != organ_name:
            print("??????----")
            vconcentrator = self.get_object().vconcentrator
            print(vconcentrator)
            # vconcentrator.objects.update(belongto=organization)
            vconcentrator.belongto = organization
            vconcentrator.save()
            
        # instance.uuid=unique_uuid_generator(instance)
        return super(ConcentratorEditView,self).form_valid(form)
       


def concentratordeletemore(request):
    # print('userdeletemore',request,request.POST)

    if not request.user.has_menu_permission_edit('metermanager_devm'):
        return HttpResponse(json.dumps({"success":0,"msg":"您没有权限进行操作，请联系管理员."}))

    deltems = request.POST.get("deltems")
    print('deltems:',deltems)
    deltems_list = deltems.split(',')

    for uid in deltems_list:
        u = VConcentrator.objects.get(id=int(uid))
        # print('delete user ',u)
        #删除用户 并且删除用户在分组中的角色
        commaddr = u.commaddr
        zncb_concentrator = Concentrator.objects.filter(commaddr=commaddr)
        if zncb_concentrator.exists():
            z = zncb_concentrator.first()
            z.delete()
        
        u.delete()

    return HttpResponse(json.dumps({"success":1}))

"""
Assets comment deletion, manager
"""
class ConcentratorDeleteView(AjaxableResponseMixin,UserPassesTestMixin,DeleteView):
    model = Concentrator
    # template_name = "aidsbank/asset_comment_confirm_delete.html"

    def test_func(self):
        
        if self.request.user.has_menu_permission_edit('metermanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "success": 0,
                "msg":"您没有权限进行操作，请联系管理员."
                    
            }
        HttpResponse(json.dumps(data))
        # return render(self.request,"entm/permission_error.html",data)

    def dispatch(self, *args, **kwargs):
        # self.comment_id = kwargs["pk"]

        print("user delete:",args,kwargs)
        
        return super(ConcentratorDeleteView, self).dispatch(*args, **kwargs)

    def get_object(self,*args, **kwargs):
        # print("delete objects:",self.kwargs,kwargs)
        return Concentrator.objects.get(commaddr=kwargs["pk"])

    def delete(self, request, *args, **kwargs):
        """
        Calls the delete() method on the fetched object and then
        redirects to the success URL.
        """
        print("delete?",args,kwargs)
        self.object = self.get_object(*args,**kwargs)

        self.object.delete()
        
        # result["success"] = 1
        return HttpResponse(json.dumps({"success":1}))
        


def getConcentratorSelect(request):
    # meters = Meter.objects.all()
    # concentrators = request.user.concentrator_list_queryset('').values()
    concentrators = request.user.belongto.concentrator_list_queryset('')

    def m_info(m):
        
        return {
            "id":m.id,
            "name":m.amrs_concentrator.name,
            
        }
    data = []

    for m in concentrators:
        data.append(m_info(m))

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":data,
        "success":True
    }
   
    # print(operarions_list)
    return JsonResponse(operarions_list)


# 获取小区绑定的集中器
def getConcentratorByComunityId(request):
    commut_id = request.POST.get("commut_id")

    try:
        amrs_community = Community.objects.get(id=commut_id)
        community = amrs_community.vcommunity
        if community.vconcentrators.count() > 0:
            concentrator_name = community.vconcentrators.first().amrs_concentrator.name
        else:
            concentrator_name = '小区未绑定集中器'
    except Exception as e:
        print("get community's concentrator error:",e)
        concentrator_name = '小区未绑定集中器'

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":concentrator_name,
        "success":True
    }
   
    # print(operarions_list)
    return JsonResponse(operarions_list)

def concentratorlist(request):
    draw = 1
    length = 0
    start=0
    print('userlist:',request.user)
    if request.method == "GET":
        draw = int(request.GET.get("draw", 1))
        length = int(request.GET.get("length", 10))
        start = int(request.GET.get("start", 0))
        search_value = request.GET.get("search[value]", None)
        # order_column = request.GET.get("order[0][column]", None)[0]
        # order = request.GET.get("order[0][dir]", None)[0]
        groupName = request.GET.get("groupName")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        # print("simpleQueryParam",simpleQueryParam)

    if request.method == "POST":
        draw = int(request.POST.get("draw", 1))
        length = int(request.POST.get("length", 10))
        start = int(request.POST.get("start", 0))
        pageSize = int(request.POST.get("pageSize", 10))
        search_value = request.POST.get("search[value]", None)
        # order_column = request.POST.get("order[0][column]", None)[0]
        # order = request.POST.get("order[0][dir]", None)[0]
        groupName = request.POST.get("groupName")
        districtId = request.POST.get("districtId")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        # print(request.POST.get("draw"))
        print("groupName",groupName)
        print("districtId:",districtId)
        # print("post simpleQueryParam",simpleQueryParam)

    print("get userlist:",draw,length,start,search_value)

    user = request.user
    organs = user.belongto

    user_concentrators = user.concentrator_list_queryset(simpleQueryParam)
    concentrators = user_concentrators.values("id","name","belongto__name","address","manufacturer","model","madedate",
                "lng","lat","coortype","commaddr") #.filter(communityid=105)  #文欣苑105

    def m_info(m):
        commaddr = m["commaddr"]
        comunity = VCommunity.objects.filter(vconcentrators__id=m["id"])
        if comunity.exists():
            c = comunity.first()
            comunity_name = c.name
        else:
            comunity_name = ''
        return {
            "id":m["id"],
            "name":m["name"],
            "belongto":m["belongto__name"],
            "address":m["address"],
            "manufacturer":m["manufacturer"],
            "model":m["model"],
            "madedate":m["madedate"],
            "lng":m["lng"],
            "lat":m["lat"],
            "coortype":m["coortype"],
            "commaddr":m["commaddr"],#simcard
            # "simid":m.simid,
            # "gpflow":m.gpflow,
            # "uplimitflow":m.uplimitflow,
            # "monthdownflow":m.monthdownflow,
            "communityid":comunity_name,
            # "station":m.station_set.first().username if m.station_set.count() > 0 else ""
        }
    data = []

    for m in concentrators:
        data.append(m_info(m))

    recordsTotal = concentrators.count()
    
    
    result = dict()
    result["records"] = data[start:start+length]
    result["draw"] = draw
    result["success"] = "true"
    result["pageSize"] = pageSize
    result["totalPages"] = recordsTotal/pageSize
    result["recordsTotal"] = recordsTotal
    result["recordsFiltered"] = recordsTotal
    result["start"] = 0
    result["end"] = 0

    print(draw,pageSize,recordsTotal/pageSize,recordsTotal)
    
    return HttpResponse(json.dumps(result))

# class ParamsMangerView(LoginRequiredMixin,TemplateView):
class ParamsMangerView(LoginRequiredMixin,TemplateView):
    template_name = "devm/paramsmanager.html"

    def get_context_data(self, *args, **kwargs):
        context = super(ParamsMangerView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "参数指令"
        context["page_menu"] = "设备管理"
        
        return context  

# 指令参数列表
def commandlist(request):

    draw = 1
    length = 0
    start=0
    print('userlist:',request.user)
    if request.method == "GET":
        draw = int(request.GET.get("draw", 1))
        length = int(request.GET.get("length", 10))
        start = int(request.GET.get("start", 0))
        search_value = request.GET.get("search[value]", None)
        # order_column = request.GET.get("order[0][column]", None)[0]
        # order = request.GET.get("order[0][dir]", None)[0]
        groupName = request.GET.get("groupName")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        # print("simpleQueryParam",simpleQueryParam)

    if request.method == "POST":
        draw = int(request.POST.get("draw", 1))
        length = int(request.POST.get("length", 10))
        start = int(request.POST.get("start", 0))
        pageSize = int(request.POST.get("pageSize", 10))
        search_value = request.POST.get("search[value]", None)
        # order_column = request.POST.get("order[0][column]", None)[0]
        # order = request.POST.get("order[0][dir]", None)[0]
        groupName = request.POST.get("groupName")
        districtId = request.POST.get("districtId")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        sid = request.POST.get("sid")
        # print(request.POST.get("draw"))
        print("groupName",groupName)
        print("districtId:",districtId)
        # print("post simpleQueryParam",simpleQueryParam)

    data = []
    stations = request.user.station_list_queryset(simpleQueryParam) 
    station_values = stations.values('meter__simid__simcardNumber','username','belongto__name','meter__serialnumber','madedate')
    merged_station = merge_values_to_dict(station_values,'meter__simid__simcardNumber')

        
    # 应该从表具参数数据库获取表的
    meterparams = MeterParameter.objects.values("commaddr","commandstate","commandtype","sendparametertime","readparametertime").order_by('readparametertime')
    
    for m in meterparams:
        commaddr = m["commaddr"]
        if commaddr in merged_station.keys():
            data.append({
                "status":m["commandstate"],
                "commandType":m["commandtype"],
                "sierialnumber":merged_station[commaddr]["meter__serialnumber"],
                "station_name":merged_station[commaddr]["username"],
                "simcardnumber":merged_station[commaddr]["meter__simid__simcardNumber"],
                "belongto":merged_station[commaddr]["belongto__name"],
                "sendparametertime":m["sendparametertime"],
                "readparametertime":m["readparametertime"],
                "createDataTime":merged_station[commaddr]["madedate"],
            })

    

    # recordsTotal = 1
    recordsTotal = len(data)
    
    result = dict()
    result["records"] = data
    result["draw"] = draw
    result["success"] = "true"
    result["pageSize"] = pageSize
    result["totalPages"] = recordsTotal/pageSize
    result["recordsTotal"] = recordsTotal
    result["recordsFiltered"] = recordsTotal
    result["start"] = 0
    result["end"] = 0

    print(draw,pageSize,recordsTotal/pageSize,recordsTotal)
    
    return HttpResponse(json.dumps(result))


def saveCommand(request):

    print("saveCommand",request.POST)

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":{"commandTypes":[]},
        "success":True
    }
   

    return JsonResponse(operarions_list)

# obslete
def getCommandTypes(request):

    sid = request.POST.get("sid") #station id

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":{"commandTypes":[11]},
        "success":True
    }
   

    return JsonResponse(operarions_list)


def getCommandParam(request):
    print("getCommandParam",request.POST)
    sid = request.POST.get("sid")   #station pk
    commandType = request.POST.get("commandType")   #参数类型 11-通讯参数 12-终端参数 13-采集指令 14-基表参数
    isRefer = request.POST.get("isRefer")
    commaddr = request.POST.get("commaddr")

    # user = request.user

    # current meter
    station = Station.objects.filter(pk=int(sid)).values("pk","meter__serialnumber","meter__simid__simcardNumber","username")
    if station.exists():
        s = station.first()
        commaddr = s["meter__simid__simcardNumber"]
    
    commParam = {}
    terminalParam = {}
    aquiryParam = {}
    meterbaseParam = {}

    paramlist = MeterParameter.objects.filter(commaddr=commaddr).values()
    if paramlist.exists():
        param = paramlist.first()
    

    
        if commandType == "11":
            commParam = {
                "tcpresendcount":param["tcpresendcount"],
                "tcpresponovertime":param["tcpresponovertime"],
                "udpresendcount":param["udpresendcount"],
                "udpresponovertime":param["udpresponovertime"],
                "smsresendcount":param["smsresendcount"],
                "smsresponovertime":param["smsresponovertime"],
                "heartbeatperiod":param["heartbeatperiod"],
            }

        if commandType == "12":
            terminalParam = {
                "ipaddr":param["ipaddr"],
                "port":param["port"],
                "entrypoint":param["entrypoint"],
                
            }

        if commandType == "13":
            aquiryParam = {
                "updatastarttime":param["updatastarttime"],
                "updatamode":param["updatamode"],
                "collectperiod":param["collectperiod"],
                "updataperiod":param["updataperiod"],
                "updatatime1":param["updatatime1"],
                "updatatime2":param["updatatime2"],
                "updatatime3":param["updatatime3"],
                "updatatime4":param["updatatime4"],
            }

        if commandType == "14":
            meterbaseParam = {
                "dn":param["dn"],
                "liciperoid":param["liciperoid"],
                "maintaindate":param["maintaindate"],
                "transimeterfactor":param["transimeterfactor"],
                "biaofactor":param["biaofactor"],
                "manufacturercode":param["manufacturercode"],
                "issmallsignalcutpoint":param["issmallsignalcutpoint"],
                "smallsignalcutpoint":param["smallsignalcutpoint"],
                "isflowzerovalue":param["isflowzerovalue"],
                "flowzerovalue":param["flowzerovalue"],
                "pressurepermit":param["pressurepermit"],
                "flowdorient":param["flowdorient"],
                "plusaccumupreset":param["plusaccumupreset"],
            }
    
    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":{
            "sid":station.first()["pk"],
            "commaddr":station.first()["meter__simid__simcardNumber"],
            "serialnumber":station.first()["meter__serialnumber"],
            "station__username":station.first()["username"],
            # "referMeterList":meter_list,
            "commParam":commParam,
            "terminalParam":terminalParam,
            "aquiryParam":aquiryParam,
            "meterbaseParam":meterbaseParam,
            },
        "success":True
    }

    
    return JsonResponse(operarions_list)

# 指令参数设置的表具列表
def getReferCommand(request):
    print("getReferCommand",request.POST)
    sid = request.POST.get("sid") #station id

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":{"referMeterList":[{
                    "updateDataTime":1541254778932,
                    "commandType":19,
                    "flag":1,
                    "editable":1,
                    "priority":1,
                    "enabled":1,
                    "vid":"d05821ab-5446-48f9-a7fe-a4e1f07ca7f0",
                    "createDataTime":1525928798000,
                    "sortOrder":1,
                    "id":"0da146c7-699c-443d-af11-5b8f6ddc4e35",
                    "createDataUsername":"13188906758",
                    "paramId":"e5cf0e5d-b7bd-4f8f-b5ba-2a14cba3a064,1f1e70de-308c-4bf8-b0c8-b959227e41aa",
                    "brand":"鲁A12345"
                },{
                    "updateDataTime":1541254778932,
                    "commandType":19,
                    "flag":1,
                    "editable":1,
                    "priority":1,
                    "enabled":1,
                    "vid":"d05821ab-5446-48f9-a7fe-a4e1f07ca7f0",
                    "createDataTime":1525928798000,
                    "sortOrder":1,
                    "id":"0da146c7-699c-443d-af11-5b8f6ddc4e35",
                    "createDataUsername":"13188906758",
                    "paramId":"e5cf0e5d-b7bd-4f8f-b5ba-2a14cba3a064,1f1e70de-308c-4bf8-b0c8-b959227e41aa",
                    "brand":"鲁A12346"
                }]},
        "success":True
    }
   

    return JsonResponse(operarions_list)




class SimcardImportView(TemplateView,UserPassesTestMixin):
    """docstring for AssignRoleView"""
    template_name = "devm/importsimcard.html"
        
    def test_func(self):
        
        if self.request.user.has_menu_permission_edit('simcardmanager_devm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "simcard导入",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def get_context_data(self, **kwargs):
        context = super(SimcardImportView, self).get_context_data(**kwargs)
        context["page_title"] = "导入simcard"
        
        return context

    # def get_object(self):
    #     # print(self.kwargs)
    #     return User.objects.get(id=self.kwargs["pk"])

    def check_row(self, row, **kwargs):
        # user = kwargs["user"]
        # print("row :::",row)

        # for k in row:
        #     print(k,row[k],type(row[k]))

        err_msg = []
        
        simcardNumber = str(row[u'sim卡号'])
        
        # 从excel读上来的数据全是数字都是float类型
        if '.' in simcardNumber:
            if isinstance(row[u'sim卡号'],float):
                simcardNumber = str(int(row[u'sim卡号']))
                
        bflag = SimCard.objects.filter(simcardNumber=simcardNumber).exists()
        if bflag:
            err_msg.append(u"sim卡号%s已存在"%(simcardNumber))

        org_name = row[u'所属组织']
        if org_name != '':
            org = Organization.objects.filter(name=org_name)
            if not org.exists():
                err_msg.append(u"该组织%s不存在"%(org_name))
        else:
            err_msg.append(u"组织不能为空")

        isStart = row[u'启停状态']
        if isStart != '':
            if isStart == u'启用':
                row[u'启停状态'] = True
            elif isStart == u'停用':
                row[u'启停状态'] = False
            else:
                err_msg.append(u"请输入正确的启停状态")

        iccid = row[u'ICCID']
        try:
            if isinstance(iccid,float):
                iccid = str(int(iccid))
        except:
            pass

        imei = row[u'IMEI']
        try:
            if isinstance(imei,float):
                imei = str(int(imei))
        except:
            pass

        imsi = row[u'IMSI']
        try:
            if isinstance(imsi,float):
                imsi = str(int(imsi))
        except:
            pass


        operator = row[u'运营商']
        

        simFlow = str(row[u'套餐流量'])
        

        openCardTime = row[u'激活日期']
        if openCardTime != '':
            if isinstance(openCardTime,str):
                b = datetime.strptime(openCardTime.strip(),"%Y-%m-%d")
            else:
                openCardTime = int(row[u'授权截止日期'])

        endTime = row[u'到期时间']
        if endTime != '':
            if isinstance(endTime,str):
                b = datetime.strptime(endTime.strip(),"%Y-%m-%d")
            else:
                endTime = int(row[u'授权截止日期'])

        

        print('check row end')

        remark = row[u'备注']
        

        return err_msg


    def post(self,request,*args,**kwargs):
        
        context = self.get_context_data(**kwargs)

        user = request.user

        simcard_resource = ImportSimcardResource()
        dataset = Dataset()
        dataset.headers = ('serialnumber', 'communityid','concentrator', 'meter_catlog','wateraddr','numbersth','buildingname','roomname',
        'username','usertel','dn','manufacturer','useraddr','installationsite','ValveMeter','madedate','belongto','dosage','readtime')
        user_post = self.request.FILES['file']
        # print('new_persons:',user_post.read())
        file_contents = user_post.read()  #.decode('iso-8859-15')
        imported_data = dataset.load(file_contents,'xls')
        

        row_count = 0
        err_msgs = []
        for row in imported_data.dict:
            row_count += 1
            print(row)
            err = self.check_row(row,**kwargs)
            
            if len(err) > 0:
                emsg = u'第%s条错误:<br/>'%(row_count) + '<br/>'.join(e for e in err)
                err_msgs.append(emsg)

        err_count = len(err_msgs)
        success_count = row_count - err_count
        
        if err_count > 0:
            msg = '检查结果:正确%s条<br />'%(success_count)+'错误%s条<br/> (请修改后再导入)'%(err_count)+'<br/>'.join(e for e in err_msgs)
            
        else:
            msg = '导入结果:成功导入%s条<br />'%(success_count)+'失败%s条<br/>'%(err_count)
            
            cache.set('TOTAL_IMPORT_COUNT',success_count)
            cache.set('imported_num',1)
            simcard_resource.import_data(dataset, dry_run=False,**kwargs)  # Actually import now

            
        
        data={"exceptionDetailMsg":"null",
                "msg":msg,
                "obj":"null",
                "success":True
        }

        return HttpResponse(json.dumps(data))



def simcarddownload(request):
    # file_path = os.path.join(settings.STATICFILES_DIRS[0] , '用户模板.xls') #development
    
    file_path = os.path.join(settings.STATIC_ROOT , 'simcardtemplate.xls')
    
    if os.path.exists(file_path):
        with open(file_path, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type="application/vnd.ms-excel")
            response['Content-Disposition'] = 'attachment; filename=' + escape_uri_path("simcard模板.xls")
            return response
    # raise Http404
    return HttpResponse(json.dumps({'success':0,'msg':'file not found'}))


def simcardexport(request):
    simcard_resource = SimcardResource()
    user_query_set = request.user.simcard_list_queryset('')
    dataset = simcard_resource.export(user_query_set)
    response = HttpResponse(dataset.xls, content_type='text/xls')
    response['Content-Disposition'] = 'attachment; filename='+ escape_uri_path("导出simcard.xls")
    return response