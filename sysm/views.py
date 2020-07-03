# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import get_object_or_404,render,redirect
from django.http import HttpResponse,JsonResponse,HttpResponseRedirect
from django.contrib import messages

import os
import json
import random
import datetime

from django.template.loader import render_to_string
from django.shortcuts import render,HttpResponse
from django.views import View
from django.views.generic import TemplateView, ListView, DetailView, CreateView, UpdateView,DeleteView,FormView
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib import admin
from django.contrib.auth.models import Permission
from django.utils.safestring import mark_safe
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.mixins import PermissionRequiredMixin,UserPassesTestMixin

from accounts.models import User,MyRoles
from amrs.models import District,Bigmeter,HdbFlowData,HdbFlowDataDay,HdbFlowDataMonth,HdbPressureData,Metercomm,Meterprotocol
from core.models import Organization,DMABaseinfo,DmaStation,Station,Personalized
from .forms import logoPagesPhotoForm,MetercommForm
from django.core.files.storage import FileSystemStorage
# from django.core.urlresolvers import reverse_lazy
from core.mixins import AjaxableResponseMixin
from django.conf import settings

        
class personalizedView(LoginRequiredMixin,TemplateView):
    template_name = "sysm/personalizedList.html"

    def get_context_data(self, *args, **kwargs):
        context = super(personalizedView, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "系统管理"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "个性化设置"

        
        return context      


def logoPagesPhotoUpdate(request):
    if request.method == 'POST':
        form = DocumentForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = DocumentForm()
    return render(request, 'core/model_form_upload.html', {
        'form': form
    })        


def personalizedUpdate(request):
    print("update:",request.POST)

    user = request.user
    
    belongto = user.belongto

    topTitle = request.POST.get('topTitle')
    loginLogo = request.POST.get('loginLogo')
    homeLogo = request.POST.get('homeLogo')
    webIco = request.POST.get('webIco')
    copyright = request.POST.get('copyright')
    websiteName = request.POST.get('websiteName')   
    recordNumber = request.POST.get('recordNumber')
    frontPageMsg = request.POST.get('frontPage')
    frontPageUrl = request.POST.get('frontPageUrl')
    updateDataUsername = user.user_name
    
    

    obj = Personalized.objects.filter(belongto=belongto)
    if obj.exists():
        p = obj.first()
        p.topTitle = topTitle
        p.loginLogo = loginLogo
        p.homeLogo = homeLogo
        p.webIco = webIco
        p.copyright = copyright
        p.websiteName = websiteName
        p.recordNumber = recordNumber
        p.frontPageMsg = frontPageMsg
        p.frontPageMsgUrl = frontPageUrl
        p.updateDataUsername = updateDataUsername

        p.save()
    else:
        Personalized.objects.create(topTitle=topTitle,loginLogo=loginLogo,homeLogo=homeLogo,webIco=webIco,
            copyright=copyright,websiteName=websiteName,recordNumber=recordNumber,frontPageMsg=frontPageMsg,frontPageMsgUrl=frontPageUrl,
            ptype='custom',belongto=belongto,updateDataUsername=updateDataUsername)
        # Personalized.objects.create(topTitle=topTitle,loginLogo=loginLogo,homeLogo=homeLogo,webIco=webIco,
        #     copyright=copyright,websiteName=websiteName,recordNumber=recordNumber,frontPageMsg=frontPageMsg,frontPageMsgUrl=frontPageUrl,
        #     ptype='custom',belongto=belongto,updateDataUsername=updateDataUsername)
    

    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":"null",
            "success":1}
    return HttpResponse(json.dumps(ret))

def personalizedUpdate_img(request):

    print("update_img:",request.FILES)
    # form = logoPagesPhotoForm(request.POST,request.FILES)
    # print (form)
    imgName = ''
    if request.method == 'POST' and request.FILES['file']:
        myfile = request.FILES['file']
        new_path =  os.path.join(settings.MEDIA_ROOT, 'resources','img','logo')
        # fs = FileSystemStorage()
        fs = FileSystemStorage(new_path)
        filename = fs.save(myfile.name, myfile)
        initial_path = fs.path(filename)
        
        # os.rename(initial_path, new_path)
        imgName = filename
        print(filename,initial_path,new_path)

    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":"null",
            "imgName":imgName,
            "success":1}
    return HttpResponse(json.dumps(ret))


def personalizedUpdate_ico(request):

    print("update_img:",request.FILES)
    # form = logoPagesPhotoForm(request.POST,request.FILES)
    # print (form)
    imgName = ''
    if request.method == 'POST' and request.FILES['file']:
        myfile = request.FILES['file']
        new_path =  os.path.join(settings.MEDIA_ROOT, 'resources','img','logo')
        fs = FileSystemStorage(new_path)
        filename = fs.save(myfile.name, myfile)
        uploaded_file_url = fs.url(filename)
        imgName = filename
        print(filename,uploaded_file_url)

    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":"null",
            "imgName":imgName,
            "success":1}
    return HttpResponse(json.dumps(ret))

def default_default(organ):
    oparent = organ.parent
    if oparent is None:
        pers = Personalized.objects.filter(ptype="default")
    else:
        pers = Personalized.objects.filter(belongto=oparent)
    if pers.exists():
        p = pers.first()
        pp = Personalized.objects.create(topTitle=p.topTitle,loginLogo=p.loginLogo,homeLogo=p.homeLogo,webIco=p.webIco,
            copyright=p.copyright,websiteName=p.websiteName,recordNumber=p.recordNumber,frontPageMsg=p.frontPageMsg,frontPageMsgUrl=p.frontPageMsgUrl,
            ptype='custom',belongto=organ,updateDataUsername=p.updateDataUsername)
        # Personalized.objects.create(topTitle=p.topTitle,loginLogo=p.loginLogo,homeLogo=p.homeLogo,webIco=p.webIco,
        #     copyright=p.copyright,websiteName=p.websiteName,recordNumber=p.recordNumber,frontPageMsg=p.frontPageMsg,
        #     ptype='custom',belongto=organ,updateDataUsername=p.updateDataUsername)
    else:
        pp = default_default(oparent)
    
    return pp

def personalizedFind(request):

    user = request.user
    ubelongto = user.belongto
    pers = Personalized.objects.filter(belongto=ubelongto)

    if pers.exists():
        p = pers.first()
    else:
        p = default_default(ubelongto)
        # p = Personalized.objects.first()

    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                "list":{
                    "copyright":p.copyright,
                    "createDataTime":p.updateDataTime.strftime("%Y-%m-%d"),
                    "createDataUsername":p.updateDataUsername,
                    "editable":1,
                    "enabled":1,
                    "flag":1,
                    "frontPage":p.frontPageMsg,
                    "frontPageUrl":p.frontPageMsgUrl,
                    "groupId":"338c7dc2-384a-1037-8466-cb3a0ec2dddf",
                    "homeLogo":str(p.homeLogo),
                    "id":"afa33228-1f5d-4f6d-8183-888bf6ff01f9",
                    "loginLogo":str(p.loginLogo),
                    "priority":1,
                    "recordNumber":p.recordNumber,
                    "sortOrder":1,
                    "topTitle":p.topTitle,
                    "updateDataTime":p.updateDataTime.strftime("%Y-%m-%d"),
                    "updateDataUsername":p.updateDataUsername,
                    "webIco":str(p.webIco),
                    "websiteName":p.websiteName
                    }
                },
            "success":1}

    
    # ret = {"exceptionDetailMsg":"null",
    #         "msg":"null",
    #         "obj":{
    #             "list":{
    #                 "copyright":"?2015-2017威尔沃自动化设备（深圳）有限公司",
    #                 "createDataTime":"2017-10-22 10:51:16",
    #                 "createDataUsername":"13911755733",
    #                 "editable":1,
    #                 "enabled":1,
    #                 "flag":1,
    #                 "frontPage":"",
    #                 "frontPageUrl":"null",
    #                 "groupId":"338c7dc2-384a-1037-8466-cb3a0ec2dddf",
    #                 "homeLogo":"LOGO3.png",
    #                 "id":"afa33228-1f5d-4f6d-8183-888bf6ff01f9",
    #                 "loginLogo":"loginLogo.png",
    #                 "priority":1,
    #                 "recordNumber":"京ICP备15041746号-1",
    #                 "sortOrder":1,
    #                 "topTitle":"智慧水务管控一体化",
    #                 "updateDataTime":"2018-08-15 15:47:57",
    #                 "updateDataUsername":"13911755733",
    #                 "webIco":"favicon.ico",
    #                 "websiteName":"www.virvo.com.cn"
    #                 }
    #             },
    #         "success":1}
    return HttpResponse(json.dumps(ret))

DEFAULT_PERSONLIZED = {
    "topTitle":"智慧水务管控一体化",
    "websiteName":"www.virvo.com.cn",
    "copyright":"?2015-2017威尔沃自动化设备（深圳）有限公司",
    "recordNumber":"京ICP备15041746号-1",
    "webIco":"favicon.ico",
    "homeLogo":"LOGO3.png",
    "frontPage":"",
    "frontPageUrl":"null",
}

def personalizedDefault(request):
    print("set default:",request.POST)

    user = request.user
    
    belongto = user.belongto
    #0-defaultLoginLogo 1-defaultIndexLogo 2-defaultIndexTitle 3-defaultBottomTitle 4-defaultResourceName 5-defaultWebIco
    dtype = request.POST.get("type")
    topTitle = request.POST.get('topTitle')
    loginLogo = request.POST.get('loginLogo')
    homeLogo = request.POST.get('homeLogo')
    webIco = request.POST.get('webIco')
    copyright = request.POST.get('copyright')
    websiteName = request.POST.get('websiteName')   
    recordNumber = request.POST.get('recordNumber')
    frontPageMsg = request.POST.get('frontPage')
    updateDataUsername = user.user_name

    # 恢复默认---恢复成上级的设置
    if belongto.parent is not None:
        default = Personalized.objects.filter(belongto=belongto.parent).first()
    else:
        default = Personalized.objects.filter(ptype="default").first()
    custom = Personalized.objects.filter(belongto=belongto).first()
    if dtype == "0":
        custom.loginLogo = default.loginLogo
    elif dtype == "1":
        custom.homeLogo = default.homeLogo
    elif dtype == "2":
        custom.topTitle = default.topTitle
    elif dtype =="3":
        custom.websiteName = default.websiteName
        custom.copyright = default.copyright
        custom.recordNumber = default.recordNumber
    elif dtype == "4":
        custom.frontPageMsg = ''    #default.frontPageMsg
        custom.frontPageMsgUrl = '/entm/' #default.frontPageMsgUrl
    elif dtype == "5":
        custom.webIco = default.webIco
    else:
        print(" type is null ")
    custom.save()
    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":"null",
            "success":1}
    return HttpResponse(json.dumps(ret))




def getProtocolSelect(request):
    commtype = request.POST.get("commtype")
    protocls = Meterprotocol.objects.filter(commtype=int(commtype))

    print("getProtocolSelect",commtype,request.POST)
    
    data = []

    for p in protocls:
        print(p.name)
        data.append(p.protocol())

    protocls_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":data,
        "success":True
    }
   
    # print(operarions_list)
    return JsonResponse(protocls_list)


def getmetercommlist(request):
    
    draw = 1
    length = 0
    start=0
    
    if request.method == "GET":
        draw = int(request.GET.get("draw", 1))
        length = int(request.GET.get("length", 10))
        start = int(request.GET.get("start", 0))
        pageSize = int(request.GET.get("pageSize", 10))
        search_value = request.GET.get("search[value]", None)
        # order_column = request.GET.get("order[0][column]", None)[0]
        # order = request.GET.get("order[0][dir]", None)[0]
        groupName = request.GET.get("groupName")
        districtId = request.GET.get("districtId")
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

    

    #当前登录用户
    metercomms = Metercomm.objects.all()

    
    data = []

    for m in metercomms[start:start+length]:
        data.append(m.mclist())
    
    # userl = current_user.user_list()

    # bigmeters = Bigmeter.objects.all()
    # dma_pk = request.POST.get("pk") or 4
    
    
    recordsTotal = len(metercomms)
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

    
    
    return HttpResponse(json.dumps(result))

class CommConfigView(LoginRequiredMixin,TemplateView):
    template_name = "sysm/commconfig.html"

    def get_context_data(self, *args, **kwargs):
        context = super(CommConfigView, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "系统管理"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "通讯管理"
        
        

        return context  


class CommConfigAddView(AjaxableResponseMixin,UserPassesTestMixin,CreateView):
    model = Metercomm
    template_name = "sysm/commconfigadd.html"
    form_class = MetercommForm
    success_url = reverse_lazy("sysm:commlist");

    # @method_decorator(permission_required("dma.change_stations"))
    def dispatch(self, *args, **kwargs):
        
        return super(CommConfigAddView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('commconfig_sysm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "修改用户",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"dmam/permission_error.html",data)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        

        return super(CommConfigAddView,self).form_valid(form)   

class CommConfigEditView(AjaxableResponseMixin,UserPassesTestMixin,UpdateView):
    model = Metercomm
    form_class = MetercommForm
    template_name = "sysm/commconfigedit.html"
    success_url = reverse_lazy("sysm:commlist");

    # @method_decorator(permission_required("dma.change_stations"))
    def dispatch(self, *args, **kwargs):
        # self.role_id = kwargs["pk"]
        return super(CommConfigEditView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('commconfig_sysm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "修改用户",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"dmam/permission_error.html",data)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        

        return super(CommConfigEditView,self).form_valid(form)

    def get_object(self):
        print(self.kwargs)
        return Metercomm.objects.get(pk=self.kwargs["pk"])
        


"""
Assets comment deletion, manager
"""
class CommConfigDeleteView(AjaxableResponseMixin,UserPassesTestMixin,DeleteView):
    model = Metercomm
    # template_name = "aidsbank/asset_comment_confirm_delete.html"

    def dispatch(self, *args, **kwargs):
        # self.comment_id = kwargs["pk"]

        return super(CommConfigDeleteView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('commconfig_sysm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "success": 0,
                "msg":"您没有权限进行操作，请联系管理员."
                    
            }
        return HttpResponse(json.dumps(data))
        # return render(self.request,"dmam/permission_error.html",data)

    def get_object(self,*args, **kwargs):
        print("delete objects:",self.kwargs,kwargs)
        return Metercomm.objects.get(pk=kwargs["pk"])

    def delete(self, request, *args, **kwargs):
        """
        Calls the delete() method on the fetched object and then
        redirects to the success URL.
        """
        print("delete?",args,kwargs)
        self.object = self.get_object(*args,**kwargs)
            

        self.object.delete()
        return HttpResponse(json.dumps({"success":1}))
        # return JsonResponse("true", safe=False)



class SystemView(LoginRequiredMixin,TemplateView):
    template_name = "sysm/system.html"

    def get_context_data(self, *args, **kwargs):
        context = super(SystemView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "系统设置"
        context["page_menu"] = "系统管理"
        
        return context  

class RetransitView(LoginRequiredMixin,TemplateView):
    template_name = "sysm/retransit.html"

    def get_context_data(self, *args, **kwargs):
        context = super(RetransitView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "转发设置"
        context["page_menu"] = "系统管理"
        
        return context  


class IconscfgView(LoginRequiredMixin,TemplateView):
    template_name = "sysm/iconscfg.html"

    def get_context_data(self, *args, **kwargs):
        context = super(IconscfgView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "图标配置"
        context["page_menu"] = "系统管理"
        
        return context  
