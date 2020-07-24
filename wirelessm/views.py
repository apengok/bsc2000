# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core.cache import cache
from django.shortcuts import get_object_or_404,render,redirect
from django.http import HttpResponse,JsonResponse,HttpResponseRedirect,StreamingHttpResponse
from django.contrib import messages
from django.template import TemplateDoesNotExist
import json
import random
import datetime
from django.conf import settings
from django.db.models import Avg, Max, Min, Sum,Count
from django.http import Http404
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
from django.db.models import Q

from core.utils import unique_cid_generator,unique_uuid_generator,unique_rid_generator
import os

from core.mixins import AjaxableResponseMixin
import logging
from amrs.models import (
    Alarm,
    Bigmeter,
    District,
    Community,
    HdbFlowData,
    HdbFlowDataDay,
    HdbFlowDataMonth,
    HdbPressureData,
    HdbWatermeterData,
    HdbWatermeterDay,
    HdbWatermeterMonth,
    Watermeter,
    Concentrator
)

from core.models import (
    Organization,
    VCommunity,
    VConcentrator,
    VWatermeter,
    SimCard
)
from devm.forms import (
    WatermeterAddForm,
    WatermeterEditForm
)

from amrs.utils import hdb_watermeter_month,hdb_watermeter_flow_monthly,generat_year_month,ZERO_monthly_dict
from .resources import WatermeterResource,ImportWatermeterResource,minimalist_xldate_as_datetime,WatermeterSelectResource
from tablib import Dataset

from wirelessm.api.serializers import VWatermeterImportSerializer

logger_info = logging.getLogger('info_logger')
logger_error = logging.getLogger('error_logger')




class ConcentratorMapView(LoginRequiredMixin,TemplateView):
    template_name = "wirelessm/concentratormap.html"

    def get_context_data(self, *args, **kwargs):
        context = super(ConcentratorMapView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "抄表地图"
        context["page_menu"] = "无线抄表"
        
        return context  


 
# 返回二供信息
# @login_required
def getconcentratormaplist(request):
    print('getconcentratormaplist:',request.POST)

    groupName = request.POST.get("groupName")
    user = request.user
    organs = user.belongto
    print(organs,type(organs))
    if groupName == '':
        selectedgroup = Organization.objects.filter(cid=organs.cid).values().first()
    else:
        selectedgroup = Organization.objects.filter(cid=groupName).values().first()

    concentrators = user.belongto.concentrator_list_queryset('') 
    
    if groupName != "":
        concentrators = concentrators.filter(belongto__cid=groupName)
    
    # 一次获取全部所需数据，减少读取数据库耗时
    stations_value_list = concentrators.values('name','belongto__name','lng','lat','coortype')
    
    
    def append_data(s):
        # try:

        #     amrs_concentrator = Concentrator.objects.get(name=s["name"])
        #     # print(s["name"],amrs_concentrator,amrs_concentrator.communityid)
        # except Exception as e:
        #     print(e)
        #     return None

        # commutid = amrs_concentrator.communityid

        # flow = hdb_watermeter_month(commutid,"2019-10")
        # print(s["name"],commutid,flow)

        return {
                "stationname":s["name"],
                "belongto":s["belongto__name"],
                "coortype":s["coortype"],
                "lng":s["lng"],
                "lat":s["lat"],
                "status":"在线" ,
                "readtime":"13:14" ,
                "flux":"0.0",
                "press_out":"1",
                "press_in":'',
                
                
            }
        

    data = []
    # s:station b:bigmeter
    for s in stations_value_list:

        ret=append_data(s)
        
        if ret is not None:
            data.append(ret)

    entminfo = {
        "coorType":selectedgroup["coorType"],
        "longitude":selectedgroup["longitude"],
        "latitude":selectedgroup["latitude"],
        "zoomIn":selectedgroup["zoomIn"],
        "islocation":selectedgroup["islocation"],
        "adcode":selectedgroup["adcode"],
        "districtlevel":selectedgroup["districtlevel"],

    }

    result = dict()
    result["success"] = "true"
    result["obj"] = data
    result["entminfo"] = entminfo

    
    
    return HttpResponse(json.dumps(result))

# 小表抄表地图统计数据
def concentratorStatics(request):

    commutid = request.GET.get("communityid")
    comunity = VCommunity.objects.get(id=commutid)
    concentrator = comunity.vconcentrators.first()
    concentrator_count = comunity.vconcentrators.count()
    total_meter = Watermeter.objects.filter(communityid=commutid).count()

    
    # allmeter = concentrator.vwatermeter_set.values_list('wateraddr')
    # mlist = [s[0] for s in allmeter]
    mlist=[]
    # print(mlist)
    waterlist = Watermeter.objects.filter(wateraddr__in=mlist)
    online_water = waterlist.filter(commstate='正常').count()
    online_ratio = online_water/total_meter * 100
    nb_count = Watermeter.objects.filter(communityid=commutid).filter(manufacturer__icontains='NB').count()
    lora_count = Watermeter.objects.filter(communityid=commutid).filter(manufacturer__icontains='LORA').count()
    wire_count = Watermeter.objects.filter(communityid=commutid).filter(manufacturer__icontains='无线').count()

    today = datetime.date.today()
    month_str = today.strftime("%Y-%m")
    lastmonth = datetime.date.today().replace(day=1) - datetime.timedelta(days=1)
    lastmonth_str = lastmonth.strftime("%Y-%m")
    import time
    t1= time.time()
    this_mon_use = hdb_watermeter_month(comunity.amrs_community.id,month_str)
    last_mon_use = hdb_watermeter_month(comunity.amrs_community.id,lastmonth_str)
    # mon_list = generat_year_month()
    # # month_use = ZERO_monthly_dict(mon_list)

    # ret = hdb_watermeter_flow_monthly(comunity.amrs_commutid,mon_list)
    print(time.time()-t1)

    flows=HdbWatermeterMonth.objects.filter(communityid=comunity.amrs_community.id,hdate__contains=today.year).aggregate(Sum('dosage'))
    year_use=flows['dosage__sum']
    if year_use is None:
        year_use = 0
    print(time.time()-t1)

    # for w in concentrator.vwatermeter_set.all():
    #     print(w.wateraddr)

    condata = {
        "name":concentrator.amrs_concentrator.name if concentrator else '',
        # "longitude":selectedgroup["longitude"],
        # "latitude":selectedgroup["latitude"],
        "concentrator_count":concentrator_count,
        "total_meter":total_meter,
        "online_water":online_water,
        "online_ratio":round(online_ratio,2),
        "alarm_count":0,
        "nb_count":nb_count,
        "lora_count":lora_count,
        "this_mon_use":round(this_mon_use,2),
        "last_mon_use":round(last_mon_use,2),
        "year_use":round(year_use,2),

    }

    data = []
    # 集中器下小表的厂家统计
    manufacturer_sets = Watermeter.objects.filter(communityid=commutid).values("manufacturer").annotate(num_m=Count('id'))
    # manufacturer_sets = Concentrator.objects.filter(vconcentrator__belongto=request.user.belongto).values("manufacturer").annotate(num_m=Count('commaddr'))
    print("manu",manufacturer_sets)

    manufacturer_data = []
    for md in manufacturer_sets:
        name = md['manufacturer']
        count = md['num_m']
        manufacturer_data.append({
            'name':name if name != None else "其他",
            'value':count
            })
    # manufacturer_count = manufacturer_sets.count()
    print(manufacturer_data)

    monthlydata = HdbWatermeterDay.communityDailydetail(comunity.amrs_community.id,month_str)
    print('daasaddadsadfa4545',monthlydata)


    result = dict()
    result["success"] = "true"
    result["monthlydata"] = monthlydata
    result["condata"] = condata
    result["manufacturer_data"] = manufacturer_data

    
    
    return HttpResponse(json.dumps(result))




class ContentratorDataStasticView(AjaxableResponseMixin,UserPassesTestMixin,TemplateView):
    template_name = "wirelessm/contentratordatastastic.html"

    def test_func(self):
        if self.request.user.has_menu_permission_edit('contentratordatastastic_wirelessm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "抄表地图",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def get_context_data(self, *args, **kwargs):
        context = super(ContentratorDataStasticView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "数据统计"
        context["page_menu"] = "无线抄表"
        
        return context  

class WlqueryShowInfoView(TemplateView):
    # model = VWatermeter
    template_name = "wirelessm/showinfo.html"

    def get_object(self):
        return VWatermeter.objects.get(id=self.kwargs["pk"])

    def get_context_data(self, *args, **kwargs):
        context = super(WlqueryShowInfoView, self).get_context_data(*args, **kwargs)
        print(args,kwargs)
        context["page_title"] = "数据查询"
        context["page_menu"] = "yongh"
        obj = self.get_object()
        # print("dasfefaesdfsdf----",obj.numbersth,obj.id,obj.serialnumber)
        context["object"] = self.get_object()
        context["numbersth"] = obj.amrs_watermeter.numbersth

        return context


class WlqueryShowAlarmView(TemplateView):
    # model = VWatermeter
    template_name = "wirelessm/showalarm.html"

    def get_object(self):
        return VWatermeter.objects.get(id=self.kwargs["pk"])

    def get_context_data(self, *args, **kwargs):
        context = super(WlqueryShowAlarmView, self).get_context_data(*args, **kwargs)
        print(args,kwargs)
        context["page_title"] = "报警信息"
        context["page_menu"] = "yongh"
        obj = self.get_object()
        # print("dasfefaesdfsdf----",obj.numbersth,obj.id,obj.serialnumber)
        context["object"] = self.get_object()
        context["numbersth"] = obj.amrs_watermeter.numbersth
        context["wateraddr"] = obj.amrs_watermeter.wateraddr

        return context


def showinfoStatics(request):
    
    if request.method == "GET":
        vwaterid = int(request.GET.get("vwaterid", None))
        # vwaterid = request.GET.get("vwaterid")
        

    if request.method == "POST":
        vwaterid = int(request.POST.get("vwaterid", None))
        # vwaterid = request.POST.get("vwaterid")
        
    if vwaterid is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")

    # v_community = VCommunity.objects.values_list("commutid","amrs_commutid")
    # v_community_dict = dict(v_community)

    meter = VWatermeter.objects.filter(id=vwaterid).values("id","amrs_waterid","numbersth","buildingname","roomname","belongto__name","nodeaddr","wateraddr",
        "communityid__amrs_commutid","communityid__name","serialnumber","username","usertel","installationsite","manufacturer","dn","meter_catlog")
    # meters = Watermeter.objects.all() #.filter(watermeterid=105)  #文欣苑105

    
    def m_info(m):
        waterid = m["amrs_waterid"]
        communityid = m["communityid__amrs_commutid"]
        tmp =  {
            "id":m["id"],
            "numbersth":m["numbersth"],
            "buildingname":m["buildingname"],
            "roomname":m["roomname"],
            "belongto":m["belongto__name"],#current_user.belongto.name,
            "nodeaddr":m["nodeaddr"],
            "wateraddr":m["wateraddr"],
            "community":m["communityid__name"],
            "serialnumber":m["serialnumber"],
        }

        try:
            zncb_wm = Watermeter.objects.get(id=waterid)
            tmp["rvalue"] = zncb_wm.rvalue or ''
            tmp["rtime"] = zncb_wm.rtime or ''
            tmp["commstate"] = zncb_wm.commstate or ''
            tmp["valvestate"] = zncb_wm.valvestate or ''
            tmp["signlen"] = zncb_wm.signlen or ''
            tmp["temperature"] = zncb_wm.temperature or ''
            tmp["meterv"] = zncb_wm.meterv or ''
        except Exception as e:
            print("\r\n exception??\r\n",e)
            tmp["lastwritevalue"] = ""
            tmp["lastwritedate"] = ""
            tmp["commstate"] = ""
            tmp["valvestate"] = ""
            tmp["signalen"] = ""
            tmp["tempelature"] = ""
            tmp["meterv"] = ""

        dailydata = HdbWatermeterDay.waterid_daily_use(waterid,communityid,ymon)
        
        tmonth = 0
        for k,v in dailydata.items():
            d = "d"+k[-2:]
            tmp[d] = v
            tmonth += v

        tmp["tmonth"] = tmonth

        try:
            flows=HdbWatermeterMonth.objects.filter(waterid=waterid,communityid=communityid,hdate__contains=today.year).aggregate(Sum('dosage'))
            year_use=flows['dosage__sum']
            tmp["tyear"] = year_use
            
        except Exception as e:
            print('348:',e)
            tmp["tyear"] = ''
        
        yestoday = today - datetime.timedelta(days=1)
        try:
            ystd = HdbWatermeterDay.objects.filter(waterid=waterid,communityid=communityid,hdate=yestoday.strftime("%Y-%m-%d"))
            if ystd.exists():
                tmp["tyestoday"] = ystd[0].dosage
        except:
            tmp["tyestoday"] = ''
        return tmp
    data = []

    data = m_info(meter[0])

    
    result = dict()
    result["obj"] = data
    result["success"] = "true"
    
    
    return HttpResponse(json.dumps(result))

def getWatermeterdaily(request):
    if request.method == "GET":
        vwaterid = int(request.GET.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        smonth = int(request.GET.get("smonth", None))
        # vwaterid = request.GET.get("vwaterid")
        

    if request.method == "POST":
        vwaterid = int(request.POST.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        smonth = int(request.GET.get("smonth", None))
        
    if vwaterid is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")

    # v_community = VCommunity.objects.values_list("commutid","amrs_commutid")
    # v_community_dict = dict(v_community)

    meters = VWatermeter.objects.filter(id=vwaterid).values("id","amrs_waterid","nodeaddr","wateraddr",
        "communityid__amrs_commutid")
    # meters = Watermeter.objects.all() #.filter(watermeterid=105)  #文欣苑105

    m =  meters[0]
    waterid = m["amrs_waterid"]
    communityid = m["communityid__amrs_commutid"]

    ymon = '{}-{}'.format(syear,smonth)
    dailydata = HdbWatermeterDay.waterid_daily_use(waterid,communityid,ymon)
    

    
    result = dict()
    result["dailydata"] = dailydata
    result["success"] = "true"
    
    
    return HttpResponse(json.dumps(result))


def getWatermeterMonth(request):
    if request.method == "GET":
        vwaterid = int(request.GET.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        

    if request.method == "POST":
        vwaterid = int(request.POST.get("vwaterid", None))
        syear = int(request.GET.get("syear", None))
        
    if vwaterid is None:
        return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()

    # v_community = VCommunity.objects.values_list("commutid","amrs_commutid")
    # v_community_dict = dict(v_community)

    meters = VWatermeter.objects.filter(id=vwaterid).values("id","amrs_waterid","nodeaddr","wateraddr",
        "communityid__amrs_commutid")
    # meters = Watermeter.objects.all() #.filter(watermeterid=105)  #文欣苑105

    m =  meters[0]
    waterid = m["amrs_waterid"]
    communityid = m["communityid__amrs_commutid"]

    monthlydata = HdbWatermeterMonth.waterid_monthly_use(waterid,communityid,syear)
    

    
    result = dict()
    result["monthlydata"] = monthlydata
    result["success"] = "true"
    
    
    return HttpResponse(json.dumps(result))


class WlquerydataView(AjaxableResponseMixin,UserPassesTestMixin,TemplateView):
    template_name = "wirelessm/wlquerydata.html"

    def test_func(self):
        if self.request.user.has_menu_permission_edit('wlquerydata_wirelessm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "小区日用水",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)


    def get_context_data(self, *args, **kwargs):
        context = super(WlquerydataView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "数据查询"
        context["page_menu"] = "无线抄表"
        
        return context  


def comunitiquery(request):
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
        selectCommunity = request.POST.get("selectCommunity")
        selectBuilding = request.POST.get("selectBuilding")
        selectTreeType = request.POST.get("selectTreeType")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        print(request.POST.get("selectBuilding"))
        print("groupName",groupName)
        print("districtId:",districtId)
        # print("post simpleQueryParam",simpleQueryParam)

    print("get userlist:",draw,length,start,search_value)

    if simpleQueryParam == "":
        if selectCommunity == "" and selectBuilding == "":
            return HttpResponse(json.dumps({"success":"true","records":[]}))

    user = request.user
    organs = user.belongto
    today = datetime.datetime.today()
    ymon = today.strftime("%Y-%m")

    # v_community = VCommunity.objects.values_list("commutid","amrs_commutid")
    # v_community_dict = dict(v_community)

    watermeters = user.watermeter_list_queryset(simpleQueryParam).values("id","amrs_waterid","numbersth","buildingname","roomname","belongto__name","nodeaddr","wateraddr",
        "communityid__amrs_commutid","communityid__name")
    # meters = Watermeter.objects.all() #.filter(watermeterid=105)  #文欣苑105

    if selectCommunity != "":
        watermeters = [w for w in watermeters if selectCommunity == w["communityid__name"]]

    if selectBuilding != "":
        watermeters = [w for w in watermeters if selectBuilding == w["buildingname"]]

    def m_info(m):
        waterid = m["amrs_waterid"]
        communityid = m["communityid__amrs_commutid"]
        tmp =  {
            "id":m["id"],
            "numbersth":m["numbersth"],
            "buildingname":m["buildingname"],
            "roomname":m["roomname"],
            "belongto":m["belongto__name"],#current_user.belongto.name,
            "nodeaddr":m["nodeaddr"],
            "wateraddr":m["wateraddr"],
            "community":m["communityid__name"],
            
        }

        try:
            zncb_wm = Watermeter.objects.get(id=waterid)
            tmp["rvalue"] = zncb_wm.rvalue
            tmp["rtime"] = zncb_wm.rtime
            tmp["commstate"] = zncb_wm.commstate
            tmp["valvestate"] = zncb_wm.valvestate
            tmp["signlen"] = zncb_wm.signlen
            tmp["temperature"] = zncb_wm.temperature
            tmp["meterv"] = zncb_wm.meterv
        except Exception as e:
            print("\r\n exception??\r\n",e)
            tmp["lastwritevalue"] = ""
            tmp["lastwritedate"] = ""
            tmp["commstate"] = ""
            tmp["valvestate"] = ""
            tmp["signalen"] = ""
            tmp["tempelature"] = ""
            tmp["meterv"] = ""

        dailydata = HdbWatermeterDay.waterid_daily_use(waterid,communityid,ymon)
        
        for k,v in dailydata.items():
            d = "d"+k[-2:]
            tmp[d] = v

        return tmp
    data = []

    for m in watermeters:
        data.append(m_info(m))

    # recordsTotal = watermeters.count()
    recordsTotal = len(watermeters)
    
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

class NeighborhoodusedaylyView(AjaxableResponseMixin,UserPassesTestMixin,TemplateView):
    template_name = "wirelessm/neighborhoodusedayly.html"

    def test_func(self):
        if self.request.user.has_menu_permission_edit('neighborhoodusedayly_wirelessm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "小区日用水",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def get_context_data(self, *args, **kwargs):
        context = super(NeighborhoodusedaylyView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "小区日用水"
        context["page_menu"] = "无线抄表"
        
        return context  


class NeighborhoodusemonthlyView(AjaxableResponseMixin,UserPassesTestMixin,TemplateView):
    template_name = "wirelessm/neighborhoodusemonthly.html"


    def test_func(self):
        if self.request.user.has_menu_permission_edit('neighborhoodusemonthly_wirelessm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "小区月用水",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)
    def get_context_data(self, *args, **kwargs):
        context = super(NeighborhoodusemonthlyView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "小区月用水"
        context["page_menu"] = "无线抄表"
        
        return context  


class NeighborhoodmeterMangerView(AjaxableResponseMixin,UserPassesTestMixin,TemplateView):
    template_name = "wirelessm/neighborhoodmetermanager.html"

    def test_func(self):
        if self.request.user.has_menu_permission_edit('neighborhoodmetermanager_wirelessm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "新增户表",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def get_context_data(self, *args, **kwargs):
        context = super(NeighborhoodmeterMangerView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "户表管理"
        context["page_menu"] = "无线抄表"
        
        return context  



def watermeter_repetition(request):
    numbersth = request.POST.get("numbersth")
    buildingname = request.POST.get("buildingname")
    roomname = request.POST.get("roomname")

    bflag = not VWatermeter.objects.filter(numbersth=numbersth,buildingname=buildingname,roomname=roomname).exists()

    # return HttpResponse(json.dumps(bflag))
    return HttpResponse(json.dumps({"success":bflag}))


"""
User add, manager
"""
class WatermeterAddView(AjaxableResponseMixin,UserPassesTestMixin,CreateView):
    model = Watermeter
    form_class = WatermeterAddForm
    template_name = "wirelessm/watermeteradd.html"
    success_url = reverse_lazy("wirelessm:neighborhoodmetermanager")
    # permission_required = ('entm.rolemanager_perms_basemanager_edit', 'entm.wirelessmanager_perms_basemanager_edit')

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
        return super(WatermeterAddView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('neighborhoodmetermanager_wirelessm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "新增户表",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("watermeter  add here?:",self.request.POST)
        print(self.kwargs,self.args)
        print(form)
        # do something
        user = self.request.user
        user_groupid = user.belongto.cid
        amrs_watermeter = form.save(commit=True)
        # organ_name = self.request.POST.get('belongto')
        
        # organization = Organization.objects.get(name=organ_name)
        communityid = self.request.POST.get("communityid")
        # get amrs_community
        community = Community.objects.get(id=communityid)
        # get vcommunity
        vcommunity = community.vcommunity
        # set the meter belongto along with community
        belongto = vcommunity.belongto
        useraddr = self.request.POST.get("useraddr")

        vwatermeter = {
            "amrs_watermeter":amrs_watermeter,
            "belongto":belongto,
            "communityid":vcommunity,
            "useraddr":useraddr
        }

        vwatermeter_obj = VWatermeter.objects.create(**vwatermeter)


        #simid save to wateraddr
        amrs_watermeter.wateraddr = self.request.POST.get("simid")

        # amrs_watermeter.save()
        # 去掉小表的集中器设置，直接取关联小区的集中器
        # concentrator = self.request.POST.get('concentrator') #集中器1名称
        
        # vc1 = VConcentrator.objects.filter(name=concentrator)
        
        # if vc1.exists():
        #     instance.concentrator = vc1.first()

        
        

        return super(WatermeterAddView,self).form_valid(form)   

    def get_context_data(self, *args, **kwargs):
        context = super(WatermeterAddView, self).get_context_data(*args, **kwargs)

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
class WatermeterEditView(AjaxableResponseMixin,UserPassesTestMixin,UpdateView):
    model = Watermeter
    form_class = WatermeterEditForm
    template_name = "wirelessm/watermeteredit.html"
    success_url = reverse_lazy("wirelessm:neighborhoodmetermanager")
    
    # @method_decorator(permission_required("dma.change_meters"))
    def dispatch(self, *args, **kwargs):
        # self.user_id = kwargs["pk"]
        return super(WatermeterEditView, self).dispatch(*args, **kwargs)

    def get_object(self):
        return Watermeter.objects.get(id=self.kwargs["pk"])

    def test_func(self):
        if self.request.user.has_menu_permission_edit('neighborhoodmetermanager_wirelessm'):
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
        return super(WatermeterEditView,self).form_invalid(form)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        
        amrs_watermeter = form.save(commit=True)
        # organ_name = self.request.POST.get('belongto')
        
        # organization = Organization.objects.get(name=organ_name)
        communityid = self.request.POST.get("communityid")
        # get amrs_community
        community = Community.objects.get(id=communityid)
        # get vcommunity
        vcommunity = community.vcommunity
        # set the meter belongto along with community
        belongto = vcommunity.belongto
        useraddr = self.request.POST.get("useraddr")

        vwatermeter = {
            "amrs_watermeter":amrs_watermeter,
            "belongto":belongto,
            "communityid":vcommunity,
            "useraddr":useraddr
        }

        vwatermeter_obj = self.get_object().vwatermeter
        vwatermeter_obj.belongto = belongto
        vwatermeter_obj.communityid = vcommunity
        vwatermeter_obj.useraddr = useraddr
        vwatermeter_obj.save()


        #simid save to wateraddr
        amrs_watermeter.wateraddr = self.request.POST.get("simid")

# 
        
        
        # instance.uuid=unique_uuid_generator(instance)
        return super(WatermeterEditView,self).form_valid(form)
       


def watermeterdeletemore(request):
    # print('userdeletemore',request,request.POST)

    if not request.user.has_menu_permission_edit('neighborhoodmetermanager_wirelessm'):
        return HttpResponse(json.dumps({"success":0,"msg":"您没有权限进行操作，请联系管理员."}))

    deltems = request.POST.get("deltems")
    print('deltems:',deltems)
    deltems_list = deltems.split(',')

    for uid in deltems_list:
        u = Watermeter.objects.get(id=int(uid))
        u.delete()
        # 删除历史采样数据
        # waterid = u.id
        # wateraddr = u.wateraddr
        # HdbWatermeterDay.objects.filter(waterid=waterid).delete()
        # HdbWatermeterMonth.objects.filter(waterid=waterid).delete()
        # HdbWatermeterData.objects.filter(wateraddr=wateraddr).delete()
        # Alarm.objects.filter(waterid=waterid).delete()

    return HttpResponse(json.dumps({"success":1}))

"""
Assets comment deletion, manager
"""
class WatermeterDeleteView(AjaxableResponseMixin,UserPassesTestMixin,DeleteView):
    model = Watermeter
    # template_name = "aidsbank/asset_comment_confirm_delete.html"

    def test_func(self):
        
        if self.request.user.has_menu_permission_edit('neighborhoodmetermanager_wirelessm'):
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
        
        return super(WatermeterDeleteView, self).dispatch(*args, **kwargs)

    def get_object(self,*args, **kwargs):
        # print("delete objects:",self.kwargs,kwargs)
        return Watermeter.objects.get(pk=kwargs["pk"])

    def delete(self, request, *args, **kwargs):
        """
        Calls the delete() method on the fetched object and then
        redirects to the success URL.
        """
        print("delete?",args,kwargs)
        self.object = self.get_object(*args,**kwargs)
        # waterid = self.object.id
        # wateraddr = self.object.wateraddr
        # bsc_watermeter = self.object.vwatermeter
        # bsc_watermeter.delete()

        self.object.delete()

        # 删除历史采样数据
        # HdbWatermeterDay.objects.filter(waterid=waterid).delete()
        # HdbWatermeterMonth.objects.filter(waterid=waterid).delete()
        # HdbWatermeterData.objects.filter(wateraddr=wateraddr).delete()
        # Alarm.objects.filter(waterid=waterid).delete()
        # result["success"] = 1
        return HttpResponse(json.dumps({"success":1}))
        

def neiborhooddailydata(request):
    '''
        无线抄表 日用水查询，查询小区某月每日用水量
    '''
    
    communityid = request.GET.get("communityid") #communityid is VCommunity's id
    # sTime = request.GET.get("sTime")[:10]
    # eTIme = request.GET.get("eTime")[:10]
    month = request.GET.get("month")
    flag = request.GET.get("flag")
    # print(sTime,eTIme)

    if month is None or month == '':
        month = today.strftime("%Y-%m")
    realcommutid = VCommunity.objects.get(id=communityid).amrs_commutid #get real id

    today = datetime.datetime.today()
    if flag == "-1":    #上月
        last_month = datetime.date.today().replace(day=1) - datetime.timedelta(days=1)
        mon_str = last_month.strftime("%Y-%m")
    elif flag == "0":
        mon_str = today.strftime("%Y-%m")
    else:
        mon_str = month
        # dailydata = HdbWatermeterDay.communityDailyRange(realcommutid,sTime,eTIme)
    
    # if flag == "1":
    #     monthdata = dailydata
    # else:
    monthdata = HdbWatermeterDay.communityDailydetail(realcommutid,mon_str)
    # dailydata = HdbWatermeterDay.communityDailyRange(realcommutid,sTime,eTIme)
    print (monthdata)
    # print (dailydata)

    return HttpResponse(json.dumps({"success":1,"monthdata":monthdata}))



def neiborhoodmonthdata(request):
    # print(request.GET)
    communityid = request.GET.get("communityid") #communityid is VCommunity's id
    sMonth = request.GET.get("sMonth")
    eMonth = request.GET.get("eMonth")
    realcommutid = VCommunity.objects.get(id=communityid).amrs_commutid #get real id
    print(communityid,realcommutid)
    monthdata = HdbWatermeterMonth.community_range_use(realcommutid,sMonth,eMonth)

    return HttpResponse(json.dumps({"success":1,"monthdata":monthdata}))




class WatermeterImportView(TemplateView,UserPassesTestMixin):
    """docstring for AssignRoleView"""
    template_name = "wirelessm/importwatermeter.html"
        
    def test_func(self):
        
        if self.request.user.has_menu_permission_edit('neighborhoodmetermanager_wirelessm'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "户表导入",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def get_context_data(self, **kwargs):
        context = super(WatermeterImportView, self).get_context_data(**kwargs)
        context["page_title"] = "导入户表"
        
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

        serialnumber = str(row[u'表编号(水表表身编码)'])
        
        # 从excel读上来的数据全是数字都是float类型
        if '.' in serialnumber:
            if isinstance(row[u'表编号(水表表身编码)'],float):
                serialnumber = str(int(row[u'表编号(水表表身编码)']))
                row[u'表编号(水表表身编码)'] = serialnumber

        bflag = Watermeter.objects.filter(serialnumber=serialnumber).exists()
        if bflag:
            err_msg.append(u"表编号(水表表身编码)%s已存在"%(serialnumber))

        # 小区
        # communityname = row[u'所属小区'] #communityid
        # bflag = VCommunity.objects.filter(name=communityname).exists()
        # if not bflag:
        #     err_msg.append(u"该小区%s不存在"%(communityname))

        # 集中器
        concentratorname = row[u'所属集中器']
        # print('所属集中器',concentratorname)
        bflag = Concentrator.objects.filter(name=concentratorname).exists()
        if not bflag:
            err_msg.append(u"该集中器%s不存在"%(concentratorname))
        else:

            amrs_concentrator = Concentrator.objects.get(name=concentratorname)
            concentrator = amrs_concentrator.vconcentrator
            bflag = VCommunity.objects.filter(vconcentrators__id=concentrator.id).exists()
            if not bflag:
                err_msg.append(u"该集中器%s没有绑定小区"%(communityname))
        
        wateraddr = str(row[u'关联IMEI'])
        
        # 从excel读上来的数据全是数字都是float类型
        if '.' in wateraddr:
            if isinstance(row[u'关联IMEI'],float):
                wateraddr = str(int(row[u'关联IMEI']))
                row[u'关联IMEI'] = wateraddr

        

        if wateraddr == '' or wateraddr is None:
            wateraddr = serialnumber
        else:
            bflag = SimCard.objects.filter(simcardNumber=wateraddr).exists()
            if not bflag:
                err_msg.append(u"该IMEI %s 不存在"%(wateraddr))

        row[u'关联IMEI'] = wateraddr

        # 用户代码(收费编号)
        numbersth = str(row[u'用户代码(收费编号)'])
        if '.' in numbersth:
            if isinstance(row[u'用户代码(收费编号)'],float):
                numbersth = str(int(row[u'用户代码(收费编号)']))
                row[u'用户代码(收费编号)'] = numbersth

        # 栋号
        buildingname = str(row[u'楼号'])
        if '.' in buildingname:
            if isinstance(row[u'楼号'],float):
                buildingname = str(int(row[u'楼号']))
                row[u'楼号'] = buildingname

        # 单元号、房号
        roomname = str(row[u'单元号、房号'])
        if '.' in roomname:
            if isinstance(row[u'单元号、房号'],float):
                roomname = str(int(row[u'单元号、房号']))
                row[u'单元号、房号'] = roomname

        # 用户电话
        usertel = str(row[u'用户电话'])
        if '.' in usertel:
            if isinstance(row[u'用户电话'],float):
                usertel = str(int(row[u'用户电话']))
                row[u'用户电话'] = usertel

        # dn
        dn = str(row[u'口径'])
        if '.' in dn:
            if isinstance(row[u'口径'],float):
                dn = str(int(row[u'口径']))
                row[u'口径'] = dn

        # 
        metercontrol = str(row[u'是否阀控表'])
        if metercontrol == '是' or metercontrol == '阀控表':
            row[u'是否阀控表'] = 1
        else:
            row[u'是否阀控表'] = 0


        # import dosage and readtime
        dosage = str(row[u'表初始读数'])
        
        # 从excel读上来的数据全是数字都是float类型
        # if '.' in dosage:
        #     if isinstance(row[u'表读数'],float):
        #         dosage = str(int(row[u'表读数']))
        #         row[u'表读数'] = dosage

        readtime = row[u'安装日期']
        if readtime == '':
            row[u'安装日期'] = datetime.date.today().strftime('%Y-%m-%d')
        else:
            try:
                if isinstance(readtime,str):
                    b = datetime.datetime.strptime(readtime.strip(),"%Y-%m-%d")
                else:
                    readtime = float(row[u'安装日期'])
                    b = minimalist_xldate_as_datetime(readtime,0)
                row[u'安装日期'] = b.strftime('%Y-%m-%d')
            except Exception as e:
                err_msg.append(u"{}".format(e))
                err_msg.append(u"日期格式不对:yyyy-mm-dd")
        
        return err_msg


    def post(self,request,*args,**kwargs):
        
        context = self.get_context_data(**kwargs)

        user = request.user

        # watermeter_resource = ImportWatermeterResource()
        dataset = Dataset()
        dataset.headers = ('serialnumber', 'communityid','meter_catlog','wateraddr','numbersth','buildingname','roomname',
        'username','usertel','dn','manufacturer','useraddr','installationsite','ValveMeter','madedate','dosage','readtime')
        user_post = self.request.FILES['file']
        # print('new_persons:',user_post.read())
        file_contents = user_post.read()  #.decode('iso-8859-15')
        imported_data = dataset.load(file_contents,'xls')
        # print('height:',dataset.height,'width:',dataset.width)

        row_count = 0
        err_msgs = []
        import_lists = []
        for row in imported_data.dict:
            if row[u'表编号(水表表身编码)'] == '':
                continue
            row_count += 1
            print('\r\n\r\nrow:',row)
            err = self.check_row(row,**kwargs)
            
            if len(err) > 0:
                emsg = u'第%s条错误:<br/>'%(row_count) + '<br/>'.join(e for e in err)
                err_msgs.append(emsg)
            else:
                # 所属集中器
                concentratorname = row[u'所属集中器']
                amrs_concentrator = Concentrator.objects.get(name=concentratorname)
                # 获取集中器绑定的小区
                concentrator = amrs_concentrator.vconcentrator
                community = VCommunity.objects.filter(vconcentrators__id=concentrator.id).first()
                # concentrator = community.vconcentrators.first()

                row[u'所属集中器'] = concentrator
                
                row[u'所属小区'] = community
                belongto =  community.belongto
                
                data = {}
                amrs_data = {
                    'numbersth':row[u'用户代码(收费编号)'], 
                    'serialnumber':row[u'表编号(水表表身编码)'], 
                    'communityid':community.amrs_community.id, 
                    'metertype':row[u'表类型(抄表远传方式)'],
                    'wateraddr':row[u'关联IMEI'],
                    'buildingname':row[u'楼号'],
                    'roomname':row[u'单元号、房号'],
                    'username':row[u'用户姓名'],
                    'usertel':row[u'用户电话'],
                    'dn':row[u'口径'],
                    'manufacturer':row[u'厂家'],
                    'installationsite':row[u'安装位置'],
                    'metercontrol':row[u'是否阀控表'],
                    'madedate':row[u'安装日期'],
                    'dosage':row[u'表初始读数'],
                    # 'rtime':row[u'抄表时间']
                }
                data = {
                    'belongto':belongto.id,
                    'communityid':community.id,
                    'useraddr':row[u'用户地址'],
                    'descriptions':row[u'备注'],
                    'amrs_watermeter':amrs_data
                }

                import_lists.append(data)


        err_count = len(err_msgs)
        success_count = row_count - err_count
        
        if err_count > 0:
            msg = '导入结果:正确%s条<br />'%(success_count)+'错误%s条<br/>'%(err_count)+'<br/>'.join(e for e in err_msgs)
            
        else:
            msg = '导入结果:成功导入%s条<br />'%(success_count)+'失败%s条<br/>'%(err_count)
            
            # print(dataset)
            # result = watermeter_resource.import_data(dataset, dry_run=False,raise_errors=True,collect_failed_rows=True,**kwargs)  # Actually import now
            cache.set('TOTAL_IMPORT_COUNT',len(import_lists))
            cache.set('imported_num',1)
            for data in import_lists:
                serializer = VWatermeterImportSerializer(data=data)
                if serializer.is_valid():
                    serializer.save()
                    cache.incr('imported_num')
                else:
                    print(serializer.errors)
                    print(data)
                    msg = 'no reason error...'
            
        
        data={"exceptionDetailMsg":"null",
                "msg":msg,
                "obj":"null",
                "success":True
        }

        return HttpResponse(json.dumps(data))



def watermeterdownload(request):
    # file_path = os.path.join(settings.STATICFILES_DIRS[0] , '用户模板.xls') #development
    
    file_path = os.path.join(settings.STATIC_ROOT , 'watermetertemplate-new.xls')
    
    if os.path.exists(file_path):
        with open(file_path, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type="application/vnd.ms-excel")
            response['Content-Disposition'] = 'attachment; filename=' + escape_uri_path("户表模板.xls")
            return response
    raise Http404('file not found')
    # return HttpResponse(json.dumps({'success':0,'msg':'file not found'}))


def watermeterexport(request):
    communityid = request.GET.get("communityid")
    otype = request.GET.get("otype")
    print("otype is ",otype," and id=",communityid)
    watermeter_resource = WatermeterResource()
    user_query_set = request.user.belongto.watermeter_list_queryset('')
    if otype == "community":
        if communityid is not None:
            user_query_set = user_query_set.filter(
                    Q(communityid__id__exact=communityid)
                    # |Q(amrs_watermeter__buildingname__icontains=selectBuilding)
                    ).distinct()
    dataset = watermeter_resource.export(user_query_set)
    response = HttpResponse(dataset.xls, content_type='text/xls')
    response['Content-Disposition'] = 'attachment; filename='+ escape_uri_path("导出户表.xls")
    return response


def exportbyselect(request):
    '''
    无线抄表 数据查询 导出
    '''
    groupName = request.GET.get("groupName")
    groupType = request.GET.get("groupType")
    districtId = request.GET.get("districtId")
    selectCommunity = request.GET.get("selectCommunity")
    selectBuilding = request.GET.get("selectBuilding")
    selectTreeType = request.GET.get("selectTreeType")
    simpleQueryParam = request.GET.get("simpleQueryParam")
    dnselect = request.GET.get("dnselect") or "none"
    manuselect = request.GET.get("manuselect") or "none"
    rmodeselect = request.GET.get("rmodeselect") or "none"
    zeroselect = request.GET.get("zeroselect") or "none"

    organ = request.user.belongto
    if groupName and groupType == 'group':
        try:
            organ = Organization.objects.get(cid=groupName)
            print("export -- slected organ is ",organ)
        except:
            pass

    queryset_list = organ.watermeter_list_queryset('').order_by('amrs_watermeter__buildingname','amrs_watermeter__roomname')
    # queryset_list = queryset_list.exclude(rid__isnull=True)
    # queryset_list.exclude(pId__exact='')
    # print('get_queryset:',queryset_list) buildingname

    if selectCommunity :
        print("selectCommunity ",selectCommunity)
        queryset_list = queryset_list.filter(
                Q(communityid__amrs_community__name__exact=selectCommunity)
                # |Q(amrs_watermeter__buildingname__icontains=selectBuilding)
                ).distinct()

    if selectBuilding:
        print("selectBuilding",selectBuilding)
        queryset_list = queryset_list.filter(
                Q(amrs_watermeter__buildingname__exact=selectBuilding)
                ).distinct()

    if simpleQueryParam:
        queryset_list = queryset_list.filter(
                Q(amrs_watermeter__serialnumber__icontains=simpleQueryParam)|
                Q(amrs_watermeter__numbersth__icontains=simpleQueryParam)
                # Q(imei__icontains=query)
                ).distinct()

    if manuselect != "none":
            print("filt by dn",dnselect)
            queryset_list = queryset_list.filter(
                    Q(amrs_watermeter__manufacturer__exact=manuselect)
                    # Q(imei__icontains=query)
                    ).distinct()

    if rmodeselect != "none":
        print("filt by rmodeselect",rmodeselect)
        queryset_list = queryset_list.filter(
                Q(amrs_watermeter__metertype__exact=rmodeselect)
                # Q(imei__icontains=query)
                ).distinct()

    if zeroselect != "none":
        print("filt by zeroselect",zeroselect)
        days = int(zeroselect)
        today = datetime.datetime.now()
        theday = today - datetime.timedelta(days=days)
        exclude_data = queryset_list.filter(
                Q(amrs_watermeter__rtime__range=(theday,today))
                # Q(imei__icontains=query)
                ).values("id")
        print("exclude_data count",exclude_data.count())
        queryset_list = queryset_list.exclude(id__in=exclude_data)
        print('filt days betwwen',theday,today)

    if dnselect != "none":
        print("filt by dn",dnselect)
        queryset_list = queryset_list.filter(
                Q(amrs_watermeter__dn__exact=dnselect)
                # Q(imei__icontains=query)
                ).distinct()
    print("what the fucking ",queryset_list.count() )
    watermeter_resource = WatermeterSelectResource()
    # dataset = watermeter_resource.export(queryset_list)

    HEADERS = []
    # name 是路由url中的参数
    # resource_name = '%s_Resource()' % name
    # export_resource = eval(resource_name)

    HEADERS = watermeter_resource.get_export_headers()
    dataset = watermeter_resource.export(queryset_list)
    import xlwt
    book = xlwt.Workbook()
    sheet = book.add_sheet('Sheet1')  # 创建一个sheet
    # -----样式设置----------------
    alignment = xlwt.Alignment()  # 创建居中
    alignment.horz = xlwt.Alignment.HORZ_CENTER
    alignment.vert = xlwt.Alignment.VERT_CENTER
    # 头部样式
    header = xlwt.XFStyle()
    header.alignment = alignment
    header.font.height = 200
    header.font.name = '宋体'
    header.font.bold = True  # 加粗
    # 内容样式
    style = xlwt.XFStyle()  # 创建样式
    style.alignment = alignment  # 给样式添加文字居中属性
    style.font.height = 200  # 设置200字体大小(默认10号)
    style.font.name = '宋体'  # 设置 宋体
    style.font.colour_index = 0x77  # 颜色
    # 序号
    sheet.write(0,0,"序号",header)
    # 头部标题 设置样式
    for tag in range(0, len(HEADERS)):
        sheet.write(0, tag+1, HEADERS[tag], header)
        # ----------设置列宽--------------
        col = sheet.col(tag)
        if 420 * (len(HEADERS[tag]) + 2) > 65536:
            col.width = 65000
        else:
            col.width = 420 * (len(HEADERS[tag]) + 2)

    # 内容样式
    if dataset:
        for line in range(0, len(dataset)):
            sheet.write(line + 1, 0, line+1, style) #seq
            for col in range(0, len(HEADERS)):
                sheet.write(line + 1, col+1, dataset[line][col], style)
                length = len(HEADERS[col])
                for row in range(0, len(dataset)):
                    if len(str(dataset[row][col])) >= len(str(dataset[row - 1][col])) and len(
                                str(dataset[row][col])) > length:
                        length = len(str(dataset[row][col]))
                # 设置列宽
                colwidth = sheet.col(col+1)
                if 420 * (length + 2) > 65536:
                    colwidth.width = 65000
                else:
                    colwidth.width = 420 * (length + 2)

    response = HttpResponse(content_type='application/vnd.ms-excel')
    response['Content-Disposition'] = 'attachment; filename='+ escape_uri_path("小表导出.xls")
    # response['Content-Disposition'] = 'attachment; filename=%s.xls' % urlquote(name)
    book.save(response)
    return response

    response = HttpResponse(dataset.xls, content_type='text/xls')
    response['Content-Disposition'] = 'attachment; filename='+ escape_uri_path("小表导出.xls")
    return response