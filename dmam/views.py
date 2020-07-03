# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import get_object_or_404,render,redirect
from django.http import HttpResponse,JsonResponse,HttpResponseRedirect,StreamingHttpResponse
from django.contrib import messages
from django.template import TemplateDoesNotExist
import json
import random
import datetime
import time

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
from accounts.forms import RoleCreateForm,MyRolesForm,RegisterForm,UserDetailChangeForm

from entm.utils import unique_cid_generator,unique_uuid_generator,unique_rid_generator
from entm.forms import OrganizationAddForm,OrganizationEditForm

import os
from django.conf import settings
from core.utils import merge_values,merge_values_to_dict
from core.mixins import AjaxableResponseMixin
from django.core.files.storage import FileSystemStorage

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
    Watermeter,
    SecondWater
)

from core.models import (
    WaterUserType,
    Organization,
    DMABaseinfo,
    DmaStation,
    Station,
    Meter,
    VCommunity,
    VConcentrator,
    DmaGisinfo,
    VWatermeter,
    VSecondWater
)


from .forms import (
    WaterUserTypeForm,
    DMACreateForm,
    DMABaseinfoForm,
    StationAssignForm,
    StationsForm,
    StationsEditForm,
    SecondWaterAddForm,
    SecondWaterEditForm,
    CommunityCreateForm,
    CommunityEditForm
)

import logging

logger_info = logging.getLogger('info_logger')
logger_error = logging.getLogger('error_logger')


# dmaam

def dmatree_revise(request):   
    organtree = []
    
    stationflag = request.POST.get("isStation") or ''
    dmaflag = request.POST.get("isDma") or ''
    communityflag = request.POST.get("isCommunity") or ''
    buidlingflag = request.POST.get("isBuilding") or ''
    pressureflag = request.POST.get("isPressure") or ''
    protocolflag = request.POST.get("isProtocol") or ''
    user = request.user
    
    # if user.is_anonymous:
    if not user.is_authenticated:
        organs = Organization.objects.first()
    else:
        organs = user.belongto #Organization.objects.all()
    print("dmatree",organs)
    # 组织
    o_lists = organs.get_descendants(include_self=True).values("id","name","cid","pId","uuid","dma__pk","dma__dma_name","dma__dma_no",
        "station__pk","station__username","station__meter__simid__simcardNumber","station__meter__protocol","organlevel","attribute",
        "vcommunity__pk","vcommunity__name","vpressure__pk","vpressure__username","vpressure__simid__simcardNumber")
    
    mergeds = merge_values(o_lists)


    
    for o in mergeds:
        # o1 = o.objects.all().values("name","cid","pId","uuid","dma__dma_no")
        if isinstance(o["dma__pk"],list):
            p_dma_no = o["dma__dma_no"][0]
        elif isinstance(o["dma__pk"],int):
            p_dma_no = o["dma__pk"]
        elif isinstance(o["dma__pk"],str):
            p_dma_no = o["dma__pk"]
        else:
            p_dma_no = ''
        organtree.append({
            "name":o["name"],
            "id":o["cid"],
            "pId":o["pId"],
            "attribute":o["attribute"],
            "organlevel":o["organlevel"],
            "districtid":'',
            "type":"group",
            "dma_no":p_dma_no,  #如果存在dma分区，分配第一个dma分区的dma_no，点击数条目的时候使用
            "icon":"/static/virvo/resources/img/wenjianjia.png",
            "uuid":o["uuid"]
        })

        #dma
        if dmaflag == '1':
            if isinstance(o["dma__pk"],list):
                for i in range(len(o["dma__pk"])):

                    organtree.append({
                    "name":o["dma__dma_name"][i],
                    "id":o["dma__pk"][i],
                    "districtid":o["dma__pk"],
                    "pId":o["cid"],
                    "type":"dma",
                    "dma_no":o["dma__dma_no"][i],
                    "icon":"/static/virvo/resources/img/dma.png",
                    "uuid":''
                })
            elif isinstance(o["dma__pk"],int):
                organtree.append({
                    "name":o["dma__dma_name"],
                    "id":o["dma__pk"],
                    "districtid":o["dma__pk"],
                    "pId":o["cid"],
                    "type":"dma",
                    "dma_no":o["dma__dma_no"],
                    "icon":"/static/virvo/resources/img/dma.png",
                    "uuid":''
                })
            
            

        #station
        # 会出现pk 和 username list长度不等的情况，可能有同名站点
        if stationflag == '1':
            print(o["station__username"],type(o["station__username"]))
            print('protocolflag',o["station__meter__protocol"],type(o["station__meter__protocol"]))
            if isinstance(o["station__username"],list):
                for i in range(len(o["station__username"])):
                    if protocolflag == '1':
                        if o["station__meter__protocol"] != '0':
                            continue
                    organtree.append({
                        "name":o['station__username'][i],
                        "id":o['station__pk'][i],
                        "districtid":'',
                        "pId":o["cid"],
                        "type":"station",
                        "dma_no":'',

                        "commaddr":o["station__meter__simid__simcardNumber"][i],
                        "dma_station_type":"1", # 在dma站点分配中标识该是站点还是小区
                        "icon":"/static/virvo/resources/img/station.png",
                        "uuid":''
                    })
            elif isinstance(o["station__username"],int) or isinstance(o["station__username"],str):
                if protocolflag == '1':
                    # print('protocolflag',o["station__meter__protocol"])

                    if o["station__meter__protocol"] == '0':
                        organtree.append({
                            "name":o['station__username'],
                            "id":o['station__pk'],
                            "districtid":'',
                            "pId":o["cid"],
                            "type":"station",
                            "dma_no":'',

                            "commaddr":o["station__meter__simid__simcardNumber"],
                            "dma_station_type":"1", # 在dma站点分配中标识该是站点还是小区
                            "icon":"/static/virvo/resources/img/station.png",
                            "uuid":''
                        })
                else:
                    organtree.append({
                    "name":o['station__username'],
                    "id":o['station__pk'],
                    "districtid":'',
                    "pId":o["cid"],
                    "type":"station",
                    "dma_no":'',

                    "commaddr":o["station__meter__simid__simcardNumber"],
                    "dma_station_type":"1", # 在dma站点分配中标识该是站点还是小区
                    "icon":"/static/virvo/resources/img/station.png",
                    "uuid":''
                })
            

        # pressure
        if pressureflag == '1':
            # print(o["station__username"],type(o["station__username"]))
            
            if isinstance(o["vpressure__username"],list):
                for i in range(len(o["vpressure__username"])):
                    
                    organtree.append({
                        "name":o['vpressure__username'][i],
                        "id":o['vpressure__pk'][i],
                        "districtid":'',
                        "pId":o["cid"],
                        "type":"pressure",
                        "dma_no":'',

                        "commaddr":o["vpressure__simid__simcardNumber"][i],
                        # "dma_station_type":"1", # 在dma站点分配中标识该是站点还是小区
                        "icon":"/static/virvo/resources/img/pressure.png",
                        "uuid":''
                    })
            elif isinstance(o["vpressure__username"],int):
                organtree.append({
                    "name":o['vpressure__username'],
                    "id":o['vpressure__pk'],
                    "districtid":'',
                    "pId":o["cid"],
                    "type":"pressure",
                    "dma_no":'',

                    "commaddr":o["vpressure__simid__simcardNumber"],
                    # "dma_station_type":"1", # 在dma站点分配中标识该是站点还是小区
                    "icon":"/static/virvo/resources/img/pressure.png",
                    "uuid":''
                })
            elif isinstance(o["vpressure__username"],str):
                organtree.append({
                    "name":o['vpressure__username'],
                    "id":o['vpressure__pk'],
                    "districtid":'',
                    "pId":o["cid"],
                    "type":"pressure",
                    "dma_no":'',

                    "commaddr":o["vpressure__simid__simcardNumber"],
                    # "dma_station_type":"1", # 在dma站点分配中标识该是站点还是小区
                    "icon":"/static/virvo/resources/img/pressure.png",
                    "uuid":''
                })

        #community
        if communityflag == '1':
            if isinstance(o["vcommunity__name"],list):

                for i in range(len(o["vcommunity__name"])):
                    community_name = o['vcommunity__name'][i]
                    # 小区列表
                    organtree.append({
                        "name":o['vcommunity__name'][i],
                        "id":o['vcommunity__pk'][i],
                        "districtid":'',
                        "pId":o["cid"],
                        "type":"community",
                        "dma_no":'',
                        "open":False,
                        "commaddr":o['vcommunity__pk'][i],#在dma站点分配中需要加入小区的分配，在这里传入小区的id，在后续处理中通过小区id查找小区及对应的集中器等
                        "dma_station_type":"2", # 在dma站点分配中标识该是站点还是小区
                        "icon":"/static/virvo/resources/img/home.png",
                        "uuid":''
                    })

                    # 小区下级栋列表
                    if buidlingflag == "1":
                        wt = VWatermeter.objects.filter(communityid__name=community_name).values('buildingname').distinct()
                        # if s['name'] == '新城花苑':
                        for w in wt:
                            organtree.append({
                                "name":w["buildingname"],
                                "id":'',
                                "districtid":'',
                                "pId":o['vcommunity__pk'][i],
                                "type":"building",
                                "dma_no":'',
                                "open":False,
                                "commaddr":'commaddr',
                                # "dma_station_type":"", # 在dma站点分配中标识该是站点还是小区
                                "icon":"/static/virvo/resources/img/buildingno.png",
                                "uuid":''
                            })

            elif isinstance(o["vcommunity__name"],str):
                community_name = o['vcommunity__name']
                # 小区列表
                organtree.append({
                    "name":o['vcommunity__name'],
                    "id":o['vcommunity__pk'],
                    "districtid":'',
                    "pId":o["cid"],
                    "type":"community",
                    "dma_no":'',
                    "open":False,
                    "commaddr":o['vcommunity__pk'],
                    "dma_station_type":"2", # 在dma站点分配中标识该是站点还是小区
                    "icon":"/static/virvo/resources/img/home.png",
                    "uuid":''
                })

                # 小区下级栋列表
                if buidlingflag == "1":
                    wt = VWatermeter.objects.filter(communityid__name=community_name).values('buildingname').distinct()
                    # if s['name'] == '新城花苑':
                    for w in wt:
                        organtree.append({
                            "name":w["buildingname"],
                            "id":'',
                            "districtid":'',
                            "pId":o['vcommunity__pk'][i],
                            "type":"building",
                            "dma_no":'',
                            "open":False,
                            "commaddr":'commaddr',
                            # "dma_station_type":"", # 在dma站点分配中标识该是站点还是小区
                            "icon":"/static/virvo/resources/img/buildingno.png",
                            "uuid":''
                        })
            
    
    
    result = dict()
    result["data"] = organtree
    
    # print(json.dumps(result))
    
    return HttpResponse(json.dumps(organtree))


def dmatree(request):   
    organtree = []
    
    stationflag = request.POST.get("isStation") or ''
    dmaflag = request.POST.get("isDma") or ''
    communityflag = request.POST.get("isCommunity") or ''
    buidlingflag = request.POST.get("isBuilding") or ''
    pressureflag = request.POST.get("isPressure") or ''
    protocolflag = request.POST.get("isProtocol") or ''
    secondwaterflag = request.POST.get("isSecondwater") or ''
    concentratorflag = request.POST.get("isConcentrator") or ''
    user = request.user
    
    # if user.is_anonymous:
    if not user.is_authenticated:
        organs = Organization.objects.first()
    else:
        organs = user.belongto #Organization.objects.all()
    
    # 组织
    organ_lists = organs.get_descendants(include_self=True).values("id","name","cid","pId","uuid","organlevel","attribute")
    
    # mergeds = merge_values(o_lists)
    #dma
    dma_lists = user.belongto.dma_list_queryset().values("pk","dma_name","dma_no","belongto__cid","belongto__organlevel")
    # merged_dma = merge_values_to_dict(dma_lists,"belongto__cid")
    #station
    station_lists = user.belongto.station_list_queryset('').values("pk","username","meter__simid__simcardNumber","meter__protocol","belongto__cid")
    #community
    comunity_lists = user.belongto.community_list_queryset('').values("pk","name","belongto__cid")
    #pressure
    pressure_lists = user.belongto.pressure_list_queryset('').values("pk","username","simid__simcardNumber","belongto__cid")

    p_dma_no='' #dma_lists[0]['dma_no'] 
    
    
    
    #dma
    if dmaflag == '1':
        for d in dma_lists:
            organtree.append({
                "name":d["dma_name"],
                "id":d["pk"],
                "districtid":d["pk"],
                "pId":d["belongto__cid"],
                "type":"dma",
                "dma_no":d["dma_no"],
                "leakrate":random.choice([9.65,13.46,11.34,24.56,32.38,7.86,10.45,17.89,23.45,36,78]),
                "dmalevel":d["belongto__organlevel"],
                "icon":"/static/virvo/resources/img/dma.png",
                "uuid":''
            })
            
            

        #station
        # 会出现pk 和 username list长度不等的情况，可能有同名站点
    if stationflag == '1':
        for s in station_lists:
            if protocolflag == '1':
                if s["meter__protocol"] == '0':
                    organtree.append({
                        "name":s['username'],
                        "id":s['pk'],
                        "districtid":'',
                        "pId":s["belongto__cid"],
                        "type":"station",
                        "dma_no":'',

                        "commaddr":s["meter__simid__simcardNumber"],
                        "dma_station_type":"1", # 在dma站点分配中标识该是站点还是小区
                        "icon":"/static/virvo/resources/img/station.png",
                        "uuid":''
                    })
            else:
                organtree.append({
                        "name":s['username'],
                        "id":s['pk'],
                        "districtid":'',
                        "pId":s["belongto__cid"],
                        "type":"station",
                        "dma_no":'',

                        "commaddr":s["meter__simid__simcardNumber"],
                        "dma_station_type":"1", # 在dma站点分配中标识该是站点还是小区
                        "icon":"/static/virvo/resources/img/station.png",
                        "uuid":''
                    })
        

    # pressure
    if pressureflag == '1':
        for p in pressure_lists:
                
            organtree.append({
                "name":p['username'],
                "id":p['pk'],
                "districtid":'',
                "pId":p["belongto__cid"],
                "type":"pressure",
                "dma_no":'',

                "commaddr":p["simid__simcardNumber"],
                # "dma_station_type":"1", # 在dma站点分配中标识该是站点还是小区
                "icon":"/static/virvo/resources/img/pressure.png",
                "uuid":''
            })

    # pressure 
    if secondwaterflag == '1':
        secondwaterlists = user.secondwater_list_queryset('').values('pk','name','belongto__cid')
        for p in secondwaterlists:
                
            organtree.append({
                "name":p['name'],
                "id":p['pk'],
                "districtid":'',
                "pId":p["belongto__cid"],
                "type":"secondwater",
                "dma_no":'',

                "commaddr":p["pk"],
                # "dma_station_type":"1", # 在dma站点分配中标识该是站点还是小区
                "icon":"/static/scada/img/bz_b.png",
                "uuid":''
            })
    
    if concentratorflag == '1':
        concentratorlists = user.concentrator_list_queryset('').values('pk','name','belongto__cid')
        for p in concentratorlists:
                
            organtree.append({
                "name":p['name'],
                "id":p['pk'],
                "districtid":'',
                "pId":p["belongto__cid"],
                "type":"concentrator",
                "dma_no":'',

                "commaddr":p["pk"],
                # "dma_station_type":"1", # 在dma站点分配中标识该是站点还是小区
                "icon":"/static/scada/img/bz_b.png",
                "uuid":''
            })

    #community
    if communityflag == '1':
        for c in comunity_lists:
            community_name = c['name']
            # 小区列表
            organtree.append({
                "name":c['name'],
                "id":c['pk'],
                "districtid":'',
                "pId":c["belongto__cid"],
                "type":"community",
                "dma_no":'',
                "open":False,
                "commaddr":c['pk'],#在dma站点分配中需要加入小区的分配，在这里传入小区的id，在后续处理中通过小区id查找小区及对应的集中器等
                "dma_station_type":"2", # 在dma站点分配中标识该是站点还是小区
                "icon":"/static/virvo/resources/img/home.png",
                "uuid":''
            })

            # 小区下级栋列表
            if buidlingflag == "1":
                wt = VWatermeter.objects.filter(communityid__name=community_name).values('buildingname').distinct()
                # if s['name'] == '新城花苑':
                for w in wt:
                    organtree.append({
                        "name":w["buildingname"],
                        "id":'',
                        "districtid":'',
                        "pId":c['pk'],
                        "type":"building",
                        "dma_no":'',
                        "open":False,
                        "commaddr":'commaddr',
                        # "dma_station_type":"", # 在dma站点分配中标识该是站点还是小区
                        "icon":"/static/virvo/resources/img/buildingno.png",
                        "uuid":''
                    })

        
    for o in organ_lists:
        organtree.append({
            "name":o["name"],
            "id":o["cid"],
            "pId":o["pId"],
            "attribute":o["attribute"],
            "organlevel":o["organlevel"],
            "districtid":'',
            "type":"group",
            # "dma_no":o["dma__dma_no"] if o["dma__dma_no"] else '',  #如果存在dma分区，分配第一个dma分区的dma_no，点击数条目的时候使用
            "icon":"/static/virvo/resources/img/wenjianjia.png",
            "uuid":o["uuid"]
        })   
    
    
    result = dict()
    result["data"] = organtree
    
    # print(json.dumps(result))

    
    return HttpResponse(json.dumps(organtree))



def dmatree_preserver(request):   
    organtree = []
    
    stationflag = request.POST.get("isStation") or ''
    dmaflag = request.POST.get("isDma") or ''
    communityflag = request.POST.get("isCommunity") or ''
    user = request.user
    
    # if user.is_anonymous:
    if not user.is_authenticated:
        organs = Organization.objects.first()
    else:
        organs = user.belongto #Organization.objects.all()
    print("dmatree",organs)
    # o_lists = organs.get_descendants(include_self=True).values("name","cid","pId","uuid","dma__no")
    for o in organs.get_descendants(include_self=True):
        # o1 = o.objects.all().values("name","cid","pId","uuid","dma__dma_no")
        if o.dma.exists():
            p_dma_no = o.dma.first().dma_no
        else:
            p_dma_no = ''
        organtree.append({
            "name":o.name,
            "id":o.cid,
            "pId":o.pId,
            "districtid":'',
            "type":"group",
            "dma_no":p_dma_no,  #如果存在dma分区，分配第一个dma分区的dma_no，点击数条目的时候使用
            "icon":"/static/virvo/resources/img/wenjianjia.png",
            "uuid":o.uuid
        })

        #dma
        if dmaflag == '1':
            for d in o.dma.values("pk","dma_name","dma_no"):

                organtree.append({
                "name":d["dma_name"],
                "id":d["pk"],
                "districtid":d["pk"],
                "pId":o.cid,
                "type":"dma",
                "dma_no":d["dma_no"],
                "icon":"/static/virvo/resources/img/dma.png",
                "uuid":''
            })
            
            

        #station
        if stationflag == '1':

            for s in o.station_set.values('username','meter__simid__simcardNumber','pk'):
                if  s['meter__simid__simcardNumber'] :
                    commaddr = s['meter__simid__simcardNumber']
                else:
                    commaddr = ""
                    print(s['username']," not related meter.")
                    continue
                # if s.dmaid is None: #已分配dma分区的不显示
                organtree.append({
                    "name":s['username'],
                    "id":s['pk'],
                    "districtid":'',
                    "pId":o.cid,
                    "type":"station",
                    "dma_no":'',

                    "commaddr":commaddr,
                    "dma_station_type":"1", # 在dma站点分配中标识该是站点还是小区
                    "icon":"/static/virvo/resources/img/station.png",
                    "uuid":''
                })

        #community
        if communityflag == '1':

            for s in o.vcommunity_set.values('name','pk'):
                
                # 小区列表
                organtree.append({
                    "name":s['name'],
                    "id":s['pk'],
                    "districtid":'',
                    "pId":o.cid,
                    "type":"community",
                    "dma_no":'',
                    "open":False,
                    "commaddr":'commaddr',
                    "dma_station_type":"2", # 在dma站点分配中标识该是站点还是小区
                    "icon":"/static/virvo/resources/img/home.png",
                    "uuid":''
                })

                # 小区下级栋列表
                wt = VWatermeter.objects.filter(communityid__name=s["name"]).values('buildingname').distinct()
                # if s['name'] == '新城花苑':
                for w in wt:
                    organtree.append({
                        "name":w["buildingname"],
                        "id":'',
                        "districtid":'',
                        "pId":s['pk'],
                        "type":"building",
                        "dma_no":'',
                        "open":False,
                        "commaddr":'commaddr',
                        # "dma_station_type":"", # 在dma站点分配中标识该是站点还是小区
                        "icon":"/static/virvo/resources/img/buildingno.png",
                        "uuid":''
                    })
            
    # district
    # districts = District.objects.all()
    # for d in districts:
    #     organtree.append({
    #         "name":d.name,
    #         "id":d.id,
    #         "districtid":d.id,
    #         "pId":organs.cid,
    #         "type":"district",
    #         "icon":"/static/virvo/resources/img/u8836.png",
    #         "uuid":''
    #     })
        
    
    result = dict()
    result["data"] = organtree
    
    # print(json.dumps(result))
    
    return HttpResponse(json.dumps(organtree))


def getDmaSelect(request):
    organ = request.POST.get("organ") or None


    print("getDmaSelect organ",organ)
    
    if organ is None or organ == '':
        dma_lists = request.user.dma_list_queryset()
    else:
        organ_select = Organization.objects.get(uuid=organ)
        dma_lists = organ_select.dma_list_queryset()

    dmas = dma_lists.values("dma_no","dma_name")

    def m_info(m):
        
        return {
            "dma_no":m["dma_no"],
            "dma_name":m["dma_name"],
            
        }
    data = []

    for m in dmas:
        data.append(m_info(m))

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":data,
        "success":True
    }
   
    # print(operarions_list)
    return JsonResponse(operarions_list)

def getmeterlist(request):

    meters = Meter.objects.all()

    def m_info(m):
        
        return {
            "id":m.pk,
            "serialnumber":m.serialnumber,
            
        }
    data = []

    for m in meters:
        data.append(m_info(m))

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":{
                "meterlist":data
        },
        "success":True
    }
   

    return JsonResponse(operarions_list)


def getmeterParam(request):

    mid = request.POST.get("mid")
    meter = Meter.objects.get(id=int(mid))
    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":{
                "id":meter.pk,
                "simid":meter.simid.simcardNumber if meter.simid else "",
                "dn":meter.dn,
                "belongto":meter.belongto.name,#current_user.belongto.name,
                "metertype":meter.metertype,
                "serialnumber":meter.serialnumber,
        },
        "success":True
    }
   

    return JsonResponse(operarions_list)

# dma管理-站点管理页面站点列表
def stationlist(request):
    draw = 1
    length = 0
    start=0
    t1 = time.time()
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
        groupName = request.POST.get("groupName")   #selected treeid
        districtId = request.POST.get("districtId")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        # print(request.POST.get("draw"))
        print("groupName",groupName)
        print("districtId:",districtId)
        # print("post simpleQueryParam",simpleQueryParam)

    

    #当前登录用户
    current_user = request.user

    
    data = []
    
    stations = current_user.station_list_queryset(simpleQueryParam)

    if districtId != '': #dma
        dma = DMABaseinfo.objects.get(pk=int(districtId))
        dma_stations = dma.station_set.all()
        # stations = [s for s in dma_stations if s in stations]
    elif groupName != '':
        filter_group = Organization.objects.get(cid=groupName)
        filter_group_name = filter_group.name
        # stations = [s for s in stations if s.belongto == filter_group]
    
    def u_info(u):  #u means station

        return {
            "id":u["id"],
            "username":u["username"],
            "usertype":u["usertype"],
            "simid":u["meter__simid__simcardNumber"],
            "dn":u["meter__dn"],
            "belongto":u["belongto__name"],# if u.meter else '',#current_user.belongto.name,
            "metertype":u["meter__metertype"],
            "serialnumber":u["meter__serialnumber"],
            "big_user":u["biguser"],
            "focus":u["focus"],
            "createdate":u["madedate"],
            "related":DmaStation.objects.filter(station_id=u["meter__simid__simcardNumber"]).exists()
            # "related":False if u["dmaid__dma_no"] is None else True
        }

    for m in stations.values("id","username","usertype","meter__dn","biguser","focus",
                    "meter__metertype","meter__serialnumber","meter__simid__simcardNumber","madedate","belongto__name","dmaid__dma_no"):
        if groupName != "":
            if filter_group_name != m["belongto__name"]:
                continue
        data.append(u_info(m))
    
    recordsTotal = len(stations)
    # recordsTotal = len(data)
    
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

    
    print("dma station time last ",time.time()-t1)
    return HttpResponse(json.dumps(result))


def dmastationlist(request):
    print("dmastationlist where are from?",request.POST,request.kwargs)
    draw = 1
    length = 0
    start=0
    
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

    

    #当前登录用户
    current_user = request.user

    def u_info(u):
        
        return {
            "id":u.pk,
            "username":u.username,
            "usertype":u.usertype,
            "simid":u.meter.simid.simcardNumber if u.meter and u.meter.simid else '',
            "dn":u.meter.dn if u.meter else '',
            "belongto":u.meter.belongto.name if u.meter else '',#current_user.belongto.name,
            "metertype":u.meter.metertype if u.meter else '',
            "serialnumber":u.meter.serialnumber if u.meter else '',
            "big_user":1,
            "focus":1,
            "createdate":u.madedate
        }
    data = []
    
    
    # userl = current_user.user_list()

    # bigmeters = Bigmeter.objects.all()
    # dma_pk = request.POST.get("pk") or 4
    dma_pk=4
    dma = DMABaseinfo.objects.first() #get(pk=int(dma_pk))
    stations = dma.station_set_all() # dma.station_set.all()
    
    
    

    

    for m in stations[start:start+length]:
        data.append(u_info(m))
    
    recordsTotal = len(stations)
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

# class DistrictFormView(FormView):
#     form_class = DMABaseinfoForm
# DMA管理基础页面
def dmabaseinfo(request):
    t1 = time.time()
    if request.method == 'GET':
        
        data = []
        dma_no = request.GET.get("dma_no")
        if dma_no == '':
            operarions_list = {
                "exceptionDetailMsg":"null",
                "msg":None,
                "obj":{
                        "baseinfo":{
                            "dma_no":'',
                            "pepoles_num":'',
                            "acreage":'',
                            "user_num":'',
                            "pipe_texture":'',
                            "pipe_length":'',
                            "pipe_links":'',
                            "pipe_years":'',
                            "pipe_private":'',
                            "ifc":'',
                            "aznp":'',
                            "night_use":'',
                            "cxc_value":'',
                            "belongto":''
                            },
                        "dmastationlist":data
                },
                "success":True
            }
           

            return JsonResponse(operarions_list)
            

        # dmabase = DMABaseinfo.objects.get(dma_no=dma_no)

        
        def assigned(a):
            commaddr = a["station_id"]     # 大表 通讯地址commaddr 或者 小区关联的集中器pk(or id)，由station_type 标识
            station_type = a["station_type"] # 大表还是小区 1-大表 2-小区
            if station_type == '1':
                s = Station.objects.filter(meter__simid__simcardNumber=commaddr).values("id","username","usertype","meter__dn",
                    "meter__metertype","meter__serialnumber","madedate","meter__belongto__name")[0]
                edit_id = s["id"]
                username = s["username"]
                usertype = s["usertype"]
                simid =commaddr
                dn = s["meter__dn"]
                belongto_name = s["meter__belongto__name"]
                metertype = s["meter__metertype"]
                serialnumber = s["meter__serialnumber"]
                createdate = s["madedate"]
            elif station_type == '2':
                s = VCommunity.objects.filter(id=commaddr).values("id","name","vconcentrators__name","belongto__name")[0]
                edit_id = s["id"]
                username = s["name"]
                usertype = "小区"
                simid =commaddr
                dn = ""
                belongto_name = s["belongto__name"]
                metertype = "小区"
                serialnumber = ""
                createdate = ""
        
            return {
                "id":edit_id,
                "username":username,
                "usertype":usertype,
                "simid":simid, #u.meter.simid.simcardNumber if u.meter and u.meter.simid else '',
                "dn":dn, #u.meter.dn if u.meter else '',
                "belongto":belongto_name, # u.meter.belongto.name if u.meter else '',#current_user.belongto.name,
                "metertype":metertype, #u.meter.metertype if u.meter else '',
                "serialnumber":serialnumber, # u.meter.serialnumber if u.meter else '',
                "big_user":1,
                "focus":1,
                "createdate":createdate, #u.madedate
            }
        
        #dma分区的站点
        # stations = dmabase.station_set.all()
        # for s in stations:
        #     data.append(u_info(s))
        # 从DmaStation获取dma分配的站点
        dmabase = DMABaseinfo.objects.get(dma_no=dma_no)
        belongto_name = dmabase.belongto.name
        stations = dmabase.station_assigned().values()
        for s in stations:
            data.append(assigned(s))

        dmabase = DMABaseinfo.objects.filter(dma_no=dma_no).values()[0]
        operarions_list = {
            "exceptionDetailMsg":"null",
            "msg":None,
            "obj":{
                    "baseinfo":{
                        "dma_no":dmabase["dma_no"],
                        "pepoles_num":dmabase["pepoles_num"],
                        "acreage":dmabase["acreage"],
                        "user_num":dmabase["user_num"],
                        "pipe_texture":dmabase["pipe_texture"],
                        "pipe_length":dmabase["pipe_length"],
                        "pipe_links":dmabase["pipe_links"],
                        "pipe_years":dmabase["pipe_years"],
                        "pipe_private":dmabase["pipe_private"],
                        "ifc":dmabase["ifc"],
                        "aznp":dmabase["aznp"],
                        "night_use":dmabase["night_use"],
                        "cxc_value":dmabase["cxc_value"],
                        "belongto":belongto_name
                        },
                    "dmastationlist":data
            },
            "success":True
        }
       
        print("dmabase time last ",time.time()-t1)
        return JsonResponse(operarions_list)

    if request.method == 'POST':
        print('dmabaseinfo post:',request.POST)
        # dma_no = request.POST.get("dma_no")
        # dmabase = DMABaseinfo.objects.get(dma_no=dma_no)
        # form = DMABaseinfoForm(request.POST or None)
        # if form.is_valid():
        #     form.save()
        #     flag = 1
        # err_str = ""
        # if form.errors:
        #     flag = 0
        #     for k,v in form.errors.items():
        #         print(k,v)
        #         err_str += v[0]
    
        # data = {
        #     "success": flag,
        #     "errMsg":err_str
            
        # }
        
        # return HttpResponse(json.dumps(data)) #JsonResponse(data)


    return HttpResponse(json.dumps({"success":True}))


def getdmamapusedata(request):
    print('getdmamapusedata:',request.GET)
    dma_name = request.GET.get("dma_name")
    dma = DMABaseinfo.objects.get(dma_name=dma_name)
    dmastation = dma.dmastation.first()
    commaddr = dmastation.station_id

    dmaflow = 0
    month_sale = 0
    lastmonth_sale = 0
    bili = 0
    today = datetime.date.today()
    today_str = today.strftime("%Y-%m-%d")
    today_flow = HdbFlowDataDay.objects.filter(hdate=today_str)
    if today_flow.exists():
        dmaflow = today_flow.first().dosage

    month_str = today.strftime("%Y-%m")
    month_flow = HdbFlowDataMonth.objects.filter(hdate=month_str)
    if month_flow.exists():
        month_sale = month_flow.first().dosage

    lastmonth = datetime.date.today().replace(day=1) - datetime.timedelta(days=1)
    lastmonth_str = lastmonth.strftime("%Y-%m")
    lastmonth_flow = HdbFlowDataMonth.objects.filter(hdate=lastmonth_str)
    if lastmonth_flow.exists():
        lastmonth_sale = lastmonth_flow.first().dosage

    if float(month_sale) > 0 and float(lastmonth_sale) > 0:
        bili =  (float(month_sale) - float(lastmonth_sale) ) / float(lastmonth_sale)

    data = {
        "dma_statics":{
            "belongto":dma.belongto.name,
            "dma_level":"二级",
            "dma_status":"在线",
            "dmaflow":round(float(dmaflow),2),
            "month_sale":round(float(month_sale),2),
            "lastmonth_sale":round(float(lastmonth_sale),2),
            "bili":round(bili,2)
        }
    }

    return HttpResponse(json.dumps(data))

class DMABaseinfoEditView(AjaxableResponseMixin,UserPassesTestMixin,UpdateView):
    model = DMABaseinfo
    form_class = DMABaseinfoForm
    template_name = "dmam/baseinfo.html"
    success_url = reverse_lazy("dmam:districtmanager");

    # @method_decorator(permission_required("dma.change_stations"))
    def dispatch(self, *args, **kwargs):
        # self.role_id = kwargs["pk"]
        return super(DMABaseinfoEditView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('districtmanager_dmam'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "修改用户",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"dmam/permission_error.html",data)

    def form_invalid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("dmabaseinfo edit form_invalid?:",self.request.POST)
        # print(form)
        # do something
        
                

        return super(DMABaseinfoEditView,self).form_invalid(form)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("dmabaseinfo edit here?:",self.request.POST)
        # print(form)
        # do something
        belongto_name = form.cleaned_data.get("belongto")
        print('belongto_name',belongto_name)
        organ = Organization.objects.get(name=belongto_name)
        instance = form.save(commit=False)
        instance.belongto = organ
                

        return super(DMABaseinfoEditView,self).form_valid(form)

    # def get_object(self):
    #     print(self.kwargs)
    #     return Organization.objects.get(cid=self.kwargs["pId"])

class DistrictMangerView(LoginRequiredMixin,TemplateView):
    template_name = "dmam/dmamanager.html"

    def get_context_data(self, *args, **kwargs):
        context = super(DistrictMangerView, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "dma管理"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "dma分区管理"
        user_organ = self.request.user.belongto

        default_dma = DMABaseinfo.objects.first()   # user_organ.dma.all().first()
        # print('districtmanager',default_dma.pk,default_dma.dma_name)
        context["current_dma_pk"] = default_dma.pk if default_dma else ''
        context["current_dma_no"] = default_dma.dma_no if default_dma else ''
        context["current_dma_name"] = default_dma.dma_name if default_dma else ''

        # context["user_list"] = User.objects.all()
        

        return context  

    """
group add
"""
def verifydmano(request):
    dma_no = request.POST.get("dma_no")
    bflag = not DMABaseinfo.objects.filter(dma_no=dma_no).exists()

    return HttpResponse(json.dumps({"success":bflag}))

def verifydmaname(request):
    dma_name = request.POST.get("dma_name")
    bflag = not DMABaseinfo.objects.filter(dma_name=dma_name).exists()

    return HttpResponse(json.dumps({"success":bflag}))    


def verifyusername(request):
    username = request.POST.get("username")
    bflag = not Station.objects.filter(amrs_bigmeter__username=username).exists()

    return HttpResponse(json.dumps({"success":bflag}))  

class DistrictAddView(LoginRequiredMixin,AjaxableResponseMixin,UserPassesTestMixin,CreateView):
    model = Organization
    template_name = "dmam/dmaadd.html"
    form_class = DMACreateForm
    success_url = reverse_lazy("dmam:districtmanager");

    # @method_decorator(permission_required("dma.change_stations"))
    def dispatch(self, *args, **kwargs):
        print("dispatch",args,kwargs)
        if self.request.method == "GET":
            cid = self.request.GET.get("id")
            pid = self.request.GET.get("pid")
            kwargs["cid"] = cid
            kwargs["pId"] = pid
        return super(DistrictAddView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('districtmanager_dmam'):
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
        print("dma add here?:",self.request.POST)
        print(form)
        # do something
        instance = form.save(commit=False)
        instance.is_org = True
        cid = self.request.POST.get("pId","oranization")  #cid is parent orgnizations
        print('cid:',cid)
        organizaiton_belong = Organization.objects.get(cid=cid)
        instance.belongto = organizaiton_belong
        
        


        return super(DistrictAddView,self).form_valid(form)   

    # def get_context_data(self, *args, **kwargs):
    #     context = super(DistrictAddView, self).get_context_data(*args, **kwargs)
    #     context["cid"] = kwargs.get("cid")
    #     context["pId"] = kwargs.get("pId")
        

    #     return context  

    def get(self,request, *args, **kwargs):
        print("get::::",args,kwargs)
        form = super(DistrictAddView, self).get_form()
        # Set initial values and custom widget
        # initial_base = self.get_initial() #Retrieve initial data for the form. By default, returns a copy of initial.
       
        # initial_base["cid"] = kwargs.get("cid")
        # initial_base["pId"] = kwargs.get("pId")
        # form.initial = initial_base
        cid = kwargs.get("cid")
        pId = kwargs.get("pId")
        
        return render(request,self.template_name,
                      {"form":form,"cid":cid,"pId":pId})


"""
Group edit, manager
"""
class DistrictEditView(LoginRequiredMixin,AjaxableResponseMixin,UserPassesTestMixin,UpdateView):
    model = DMABaseinfo
    form_class = DMACreateForm
    template_name = "dmam/dmaedit.html"
    success_url = reverse_lazy("dmam:districtmanager");

    # @method_decorator(permission_required("dma.change_stations"))
    def dispatch(self, *args, **kwargs):
        # self.role_id = kwargs["pk"]
        return super(DistrictEditView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('districtmanager_dmam'):
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
        print("group update here?:",self.request.POST)
        # print(form)
        # do something
        
                

        return super(DistrictEditView,self).form_valid(form)

    def get_object(self):
        print(self.kwargs)
        return DMABaseinfo.objects.get(pk=self.kwargs["pId"])
        

"""
Group Detail, manager
"""
class DistrictDetailView(LoginRequiredMixin,DetailView):
    model = DMABaseinfo
    form_class = DMABaseinfoForm
    template_name = "dmam/dmadetail.html"
    # success_url = reverse_lazy("entm:rolemanager");

    # @method_decorator(permission_required("dma.change_stations"))
    def dispatch(self, *args, **kwargs):
        # self.role_id = kwargs["pk"]
        return super(DistrictDetailView, self).dispatch(*args, **kwargs)

    
    def get_object(self):
        print(self.kwargs)
        return DMABaseinfo.objects.get(pk=self.kwargs["pId"])

"""
Assets comment deletion, manager
"""
class DistrictDeleteView(LoginRequiredMixin,AjaxableResponseMixin,UserPassesTestMixin,DeleteView):
    model = DMABaseinfo
    # template_name = "aidsbank/asset_comment_confirm_delete.html"

    def dispatch(self, *args, **kwargs):
        # self.comment_id = kwargs["pk"]

        
        print(self.request.POST)
        kwargs["pId"] = self.request.POST.get("pId")
        print("delete dispatch:",args,kwargs)
        return super(DistrictDeleteView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('districtmanager_dmam'):
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
        return DMABaseinfo.objects.get(pk=kwargs["pId"])

    def delete(self, request, *args, **kwargs):
        """
        Calls the delete() method on the fetched object and then
        redirects to the success URL.
        """
        print("delete?",args,kwargs)
        self.object = self.get_object(*args,**kwargs)
            

        self.object.delete()
        return JsonResponse({"success":True})


class DistrictAssignStationView(LoginRequiredMixin,AjaxableResponseMixin,UserPassesTestMixin,UpdateView):
    model = DMABaseinfo
    form_class = StationAssignForm
    template_name = "dmam/dmaassignstation.html"
    success_url = reverse_lazy("dmam:districtmanager");

    # @method_decorator(permission_required("dma.change_stations"))
    def dispatch(self, *args, **kwargs):
        # self.role_id = kwargs["pk"]
        return super(DistrictAssignStationView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('districtmanager_dmam'):
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
        print("dma station assign here?:",self.request.POST)
        print(form)
        # do something
        stationassign = form.cleaned_data.get("stationassign")
        jd = json.loads(stationassign)

        print(jd)
        self.object = self.get_object()
        for d in jd:
            print(d["station_id"],d["dma_name"],d["station_name"],d["metertype"])
            station_id = int(d["station_id"])
            metertype = d["metertype"]
            station = Station.objects.get(pk=station_id)
            station.dmaid = self.object
            station.dmametertype = metertype
            station.save()
        
        data = {
                "success": 1,
                "obj":{"flag":1}
            }
        return HttpResponse(json.dumps(data)) #JsonResponse(data)        

        # return super(DistrictAssignStationView,self).form_valid(form)

    def get_object(self):
        print(self.kwargs)
        return DMABaseinfo.objects.get(pk=int(self.kwargs["pk"]))
        
    def get_context_data(self, *args, **kwargs):
        context = super(DistrictAssignStationView, self).get_context_data(*args, **kwargs)
        

        self.object = self.get_object()  # user_organ.dma.all().first()
        
        context["dma_pk"] = self.object.pk
        context["dma_no"] = self.object.dma_no
        context["dma_name"] = self.object.dma_name
        context["dma_group"] = self.object.belongto.name

        #dma station
        # dmastaions = self.object.station_set.all()
        dmastaions = self.object.station_assigned()
        data = []
        #dma分区的站点
        
        for a in dmastaions:
            commaddr = a.station_id     # 大表 通讯地址commaddr 或者 小区关联的集中器commaddr，由station_type 标识
            meter_type = a.meter_type
            station_type = a.station_type # 大表还是小区 1-大表 2-小区
            if station_type == '1':
                s = Station.objects.get(amrs_bigmeter__commaddr=commaddr)
                edit_id = s.pk
                username = s.amrs_bigmeter.username
                
            elif station_type == '2':
                # d = VConcentrator.objects.get(id=commaddr)
                d = VCommunity.objects.get(id=commaddr)
                edit_id = d.pk
                username = d.name

            data.append({
                "id":edit_id,  #s.pk,
                "username":username,  #s.username,
                "pid":self.object.belongto.cid,
                "dmametertype":meter_type #s.dmametertype
            })

        dmastation_list = {
            "obj":{
                    "dmastationlist":data
            }
        }

        context["dmastation_list"] = json.dumps(dmastation_list)
        

        return context  


def saveDmaStation(request):
    dma_pk = request.POST.get("dma_pk")
    dma = DMABaseinfo.objects.get(pk=int(dma_pk))
    stationassign = request.POST.get("stationassign")
    jd = json.loads(stationassign)

    # old_dmastations = dma.station_set_all()
    # dmastations = dma.station_set.all() #old
    # dmastations = dma.station_set_all()
    old_assigned = dma.station_assigned()
    # print("dma old stations:",old_dmastations)

    refresh_list = []
    # 更新dma分区站点信息，
    for d in jd:
        print(d["station_id"],d["dma_name"],d["station_name"],d["metertype"],d["commaddr"],d["station_type"])
        station_id = int(d["station_id"])
        metertype = d["metertype"]
        station_type = d["station_type"]
        commaddr = d["commaddr"]
        refresh_list.append(commaddr) # add commaddr in fresh list
        station = DmaStation.objects.filter(dmaid=dma,station_id=commaddr)
        if not station.exists():
            # station.dmaid.add(dma)
            DmaStation.objects.create(dmaid=dma,station_id=commaddr,meter_type=metertype,station_type=station_type)
        else:
            s = station.first()
            s.station_type = station_type
            s.meter_type = metertype
            s.save()

        # station.dmametertype = metertype
        # station.save()
    
    print("refresh_list:",refresh_list)
    # 删除不在更新列表里的已分配的站点dmastation item
    for s in old_assigned:
        if s.station_id not in refresh_list:
            s.delete()
            # 修改dma相关站点信息

    data = {
            "success": 1,
            "obj":{"flag":1}
        }
    return HttpResponse(json.dumps(data)) #JsonResponse(data)   

# DMA 分配站点初始化连接
def getdmastationsbyId(request):

    dma_pk = request.POST.get("dma_pk")
    dma = DMABaseinfo.objects.get(pk = int(dma_pk))

    #dma station
    # dmastaions = dma.station_set_all()
    assigned_station = dma.station_assigned()

    data = []
    #dma分区的站点
    
    for a in assigned_station:
        commaddr = a.station_id
        station_type = a.station_type
        if station_type == "1":
            s= Station.objects.get(amrs_bigmeter__commaddr=commaddr)
            edit_id = s.id
            username = s.amrs_bigmeter.username
        else:
            s = VCommunity.objects.get(id=commaddr)
            edit_id = s.id
            username = s.name
        data.append({
            "id":edit_id,
            "username":username,
            "pid":dma.belongto.cid,
            "dmametertype":a.meter_type,
            "commaddr":a.station_id,
            "station_type":a.station_type
        })

    dmastation_list = {
        "obj":data,
        "success":True
    }

    return HttpResponse(json.dumps(dmastation_list)) 

"""
用水性质
"""

def findusertypeByusertype(request):
    print(request.POST)
    usertype = request.POST.get('type')
    flag = not WaterUserType.objects.filter(usertype=usertype).exists()

    return JsonResponse(flag, safe=False)

def findUsertypeCompare(request):
    print('findUsertypeCompare',request.POST)
    usertype = request.POST.get('usertype')
    updateuserType = request.POST.get("updateuserType")
    recomposeType = request.POST.get("recomposeType")
    print(usertype,updateuserType,recomposeType)

    tmp = WaterUserType.objects.filter(usertype=updateuserType)
    print('tmp:',tmp)
    flag = not WaterUserType.objects.filter(usertype=usertype).exists()

    return JsonResponse(flag, safe=False)

def findUsertypes(request):
    usertypes = WaterUserType.objects.all()
    data = []
    for ut in usertypes:
        data.append({
            "explains":ut.explains,
            "id":ut.pk,
            "userType":ut.usertype
            })
    operarions_list = {
        "exceptionDetailMsg":"",
        "msg":"",
        "obj":{
                "operation":data
        },
        "success":True
    }
   

    return JsonResponse(operarions_list)



def usertypeadd(request):
    if not request.user.has_menu_permission_edit('stationmanager_dmam'):
        return HttpResponse(json.dumps({"success":0,"msg":"您没有权限进行操作，请联系管理员."}))

    print('usertypeadd:',request.POST)
    usertypeform = WaterUserTypeForm(request.POST or None)
    print('usertypeform',usertypeform)

    usertype = request.POST.get("usertype")
    explains = request.POST.get("explains")
    obj = WaterUserType.objects.create(
            usertype = usertype,
            explains = explains)

    if obj:
        flag = 1
    else:
        flag = 0

    return HttpResponse(json.dumps({"success":flag}))

def findUsertypeById(request):
    print(request.POST)
    tid = request.POST.get("id")
    tid = int(tid)
    ut = WaterUserType.objects.get(pk=tid)

    operarions_list = {
        "exceptionDetailMsg":"",
        "msg":"",
        "obj":{
                "operation":{
                    "explains":ut.explains,
                    "id":ut.pk,
                    "userType":ut.usertype}
        },
        "success":True
    }
   

    return JsonResponse(operarions_list)

def updateOperation(request):
    print('updateOperation:',request.POST)
    tid = request.POST.get("id")
    usertype = request.POST.get("userType")
    explains = request.POST.get("explains")
    tid = int(tid)
    ut = WaterUserType.objects.get(pk=tid)
    ut.usertype = usertype
    ut.explains = explains
    ut.save()

    return JsonResponse({"success":True})


def deleteOperation(request):
    tid = request.POST.get("id")
    tid = int(tid)
    ut = WaterUserType.objects.get(pk=tid)
    ut.delete()

    return JsonResponse({"success":True})

def deleteOperationMore(request):
    print("deleteOperationMore:",request.POST)
    deltems = request.POST.get("ids")
    deltems_list = deltems.split(',')
    print(deltems_list)
    for uid in deltems_list:
        if uid !='':
            u = WaterUserType.objects.get(id=int(uid))
            u.delete()
    return JsonResponse({"success":True})

def usertypeedit(request):
    pass


def usertypedeletemore(request):
    if not request.user.has_menu_permission_edit('stationmanager_dmam'):
        return HttpResponse(json.dumps({"success":0,"msg":"您没有权限进行操作，请联系管理员."}))

    deltems = request.POST.get("deltems")
    deltems_list = deltems.split(';')

    for uid in deltems_list:
        u = User.objects.get(id=int(uid))
        # print('delete user ',u)
        #删除用户 并且删除用户在分组中的角色
        for g in u.groups.all():
            g.user_set.remove(u)
        u.delete()

    return HttpResponse(json.dumps({"success":1}))


def userdeletemore(request):
    # print('userdeletemore',request,request.POST)

    if not request.user.has_menu_permission_edit('districtmanager_dmam'):
        return HttpResponse(json.dumps({"success":0,"msg":"您没有权限进行操作，请联系管理员."}))

    deltems = request.POST.get("deltems")
    deltems_list = deltems.split(';')

    for uid in deltems_list:
        u = User.objects.get(id=int(uid))
        # print('delete user ',u)
        #删除用户 并且删除用户在分组中的角色
        for g in u.groups.all():
            g.user_set.remove(u)
        u.delete()

    return HttpResponse(json.dumps({"success":1}))

"""
Assets comment deletion, manager
"""
class UsertypeDeleteView(AjaxableResponseMixin,UserPassesTestMixin,DeleteView):
    model = WaterUserType
    # template_name = "aidsbank/asset_comment_confirm_delete.html"

    def test_func(self):
        
        if self.request.user.has_menu_permission_edit('stationmanager_dmam'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "success": 0,
                "msg":"您没有权限进行操作，请联系管理员."
                    
            }
        HttpResponse(json.dumps(data))
        # return render(self.request,"dmam/permission_error.html",data)

    def dispatch(self, *args, **kwargs):
        # self.comment_id = kwargs["pk"]

        print("user delete:",args,kwargs)
        
        return super(StationDeleteView, self).dispatch(*args, **kwargs)

    def get_object(self,*args, **kwargs):
        # print("delete objects:",self.kwargs,kwargs)
        return User.objects.get(pk=kwargs["pk"])

    def delete(self, request, *args, **kwargs):
        """
        Calls the delete() method on the fetched object and then
        redirects to the success URL.
        """
        print("delete?",args,kwargs)
        self.object = self.get_object(*args,**kwargs)

        #delete user role in groups
        for g in self.object.groups.all():
            g.user_set.remove(self.object)

        self.object.delete()
        result = dict()
        # result["success"] = 1
        return HttpResponse(json.dumps({"success":1}))
        

class StationMangerView(LoginRequiredMixin,TemplateView):
    template_name = "dmam/stationmanager.html"

    def get_context_data(self, *args, **kwargs):
        context = super(StationMangerView, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "dma管理"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "站点管理"

        # context["user_list"] = User.objects.all()
        

        return context  


"""
User add, manager
"""
class StationAddView(AjaxableResponseMixin,UserPassesTestMixin,CreateView):
    model = Station
    form_class = StationsForm
    template_name = "dmam/stationadd.html"
    success_url = reverse_lazy("dmam:stationsmanager")
    # permission_required = ('entm.rolemanager_perms_basemanager_edit', 'entm.dmamanager_perms_basemanager_edit')

    # @method_decorator(permission_required("dma.change_stations"))
    def dispatch(self, *args, **kwargs):
        #uuid is selectTreeIdAdd namely Organization uuid
        if self.request.method == 'GET':
            uuid = self.request.GET.get("uuid")
            kwargs["uuid"] = uuid

        if self.request.method == 'POST':
            uuid = self.request.POST.get("uuid")
            kwargs["uuid"] = uuid
        print("uuid:",kwargs.get('uuid'))
        return super(StationAddView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('stationmanager_dmam'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "增加用户",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"dmam/permission_error.html",data)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        
        # print(form)
        # do something
        user = self.request.user
        user_groupid = user.belongto.cid
        instance = form.save(commit=False)
        organ_name = self.request.POST.get('belongto')
        
        organization = Organization.objects.get(name=organ_name)
        instance.belongto = organization
        
        serialnumber = self.request.POST.get("serialnumber")
        meter = Meter.objects.get(serialnumber=serialnumber)
        instance.meter = meter

        # amrs bigmeter
        dn = meter.dn
        lng = self.request.POST.get("lng")
        lat = self.request.POST.get("lat")
        username = self.request.POST.get("username")
        usertype = self.request.POST.get("usertype")
        madedate = self.request.POST.get("madedate")
        metertype = self.request.POST.get("metertype")
        installationsite = self.request.POST.get("installationsite")
        commaddr = meter.simid.simcardNumber
        amrs_bigmeter = {
            "serialnumber":serialnumber,
            "username":username,
            "usertype":usertype,
            "dn":dn,
            "lng":lng,
            "lat":lat,
            "commaddr":commaddr,
            "simid":commaddr,
            "madedate":madedate,
            "metertype":metertype,
            "installationsite":installationsite
        }
        # //The update_or_create method tries to fetch an object from database based on the given kwargs. If a match is found, it updates the fields passed in the defaults dictionary.
        amrs_obj,created = Bigmeter.objects.update_or_create(defaults=amrs_bigmeter,commaddr=commaddr)
        # bigmeter = Bigmeter.objects.create(**amrs_bigmeter)
        instance.amrs_bigmeter = amrs_obj

        return super(StationAddView,self).form_valid(form)   

    def get_context_data(self, *args, **kwargs):
        context = super(StationAddView, self).get_context_data(*args, **kwargs)

        
        uuid = self.request.GET.get('uuid') or ''
        
        groupId = self.request.user.belongto.cid
        groupname = self.request.user.belongto.name
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
class StationEditView(AjaxableResponseMixin,UserPassesTestMixin,UpdateView):
    model = Station
    form_class = StationsEditForm
    template_name = "dmam/stationedit.html"
    success_url = reverse_lazy("dmam:stationsmanager")
    
    # @method_decorator(permission_required("dma.change_stations"))
    def dispatch(self, *args, **kwargs):
        # self.user_id = kwargs["pk"]
        return super(StationEditView, self).dispatch(*args, **kwargs)

    def get_object(self):
        return Station.objects.get(id=self.kwargs["pk"])

    def test_func(self):
        if self.request.user.has_menu_permission_edit('stationmanager_dmam'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "修改站点",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"dmam/permission_error.html",data)

    def form_invalid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("user edit form_invalid:::")
        return super(StationEditView,self).form_invalid(form)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        

        
        instance = form.save(commit=False)
        organ_name = self.request.POST.get('belongto')
        
        organization = Organization.objects.get(name=organ_name)
        instance.belongto = organization
        
        serialnumber = self.request.POST.get("serialnumber")
        meter = Meter.objects.get(serialnumber=serialnumber)
        instance.meter = meter

        # amrs bigmeter
        commaddr = meter.simid.simcardNumber
        dn = meter.dn
        username = self.request.POST.get("username")
        usertype = self.request.POST.get("usertype")
        lng = self.request.POST.get("lng")
        lat = self.request.POST.get("lat")
        madedate = self.request.POST.get("madedate")
        metertype = self.request.POST.get("metertype")
        installationsite = self.request.POST.get("installationsite")

        # amrs bigmeter
        amrs_bigmeter = {
            "serialnumber":serialnumber,
            "username":username,
            "usertype":usertype,
            "dn":dn,
            "lng":lng,
            "lat":lat,
            "commaddr":commaddr,
            "simid":commaddr,
            "madedate":madedate,
            "metertype":metertype,
            "installationsite":installationsite
        }
        amrs_obj,created = Bigmeter.objects.update_or_create(defaults=amrs_bigmeter,commaddr=commaddr)
        
        return super(StationEditView,self).form_valid(form)
        
    

"""
Assets comment deletion, manager
"""
class StationDeleteView(AjaxableResponseMixin,UserPassesTestMixin,DeleteView):
    model = Station
    # template_name = "aidsbank/asset_comment_confirm_delete.html"

    def test_func(self):
        
        if self.request.user.has_menu_permission_edit('stationmanager_dmam'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "success": 0,
                "msg":"您没有权限进行操作，请联系管理员."
                    
            }
        HttpResponse(json.dumps(data))
        # return render(self.request,"dmam/permission_error.html",data)

    def dispatch(self, *args, **kwargs):
        # self.comment_id = kwargs["pk"]

        print("user delete:",args,kwargs)
        
        return super(StationDeleteView, self).dispatch(*args, **kwargs)

    def get_object(self,*args, **kwargs):
        # print("delete objects:",self.kwargs,kwargs)
        return Station.objects.get(pk=kwargs["pk"])

    def delete(self, request, *args, **kwargs):
        """
        Calls the delete() method on the fetched object and then
        redirects to the success URL.
        """
        self.object = self.get_object(*args,**kwargs)
        # commaddr = self.object.amrs_bigmeter.commaddr
        # on_delete set to CASCADE,so delete amrs_bigmeter also delete the object contain the foreignkey
        self.object.amrs_bigmeter.delete()
        # self.object.delete()
        # 删除历史采样数据
        # HdbFlowData.objects.filter(commaddr=commaddr).delete()
        # HdbFlowDataHour.objects.filter(commaddr=commaddr).delete()
        # HdbFlowDataDay.objects.filter(commaddr=commaddr).delete()
        # HdbFlowDataMonth.objects.filter(commaddr=commaddr).delete()
        # Alarm.objects.filter(commaddr=commaddr).delete()
        
        return HttpResponse(json.dumps({"success":1}))
        

def stationdeletemore(request):
    # print("stationdeletemore:",request.POST)
    deltems = request.POST.get("deltems")
    deltems_list = deltems.split(';')
    # print(deltems_list)
    for uid in deltems_list:
        if uid !='':
            obj = Station.objects.get(id=int(uid))
            # commaddr = obj.amrs_bigmeter.commaddr
            # on_delete set to CASCADE,so delete amrs_bigmeter also delete the object contain the foreignkey
            obj.amrs_bigmeter.delete()
            # obj.delete()
            # 删除历史采样数据
            # HdbFlowData.objects.filter(commaddr=commaddr).delete()
            # HdbFlowDataHour.objects.filter(commaddr=commaddr).delete()
            # HdbFlowDataDay.objects.filter(commaddr=commaddr).delete()
            # HdbFlowDataMonth.objects.filter(commaddr=commaddr).delete()
            # Alarm.objects.filter(commaddr=commaddr).delete()

            # 因为在js端使用的是 $.parseJSON(d);解释返回结果，所以不能直接用JsonResponse
    return HttpResponse(json.dumps({"success":1}))
    # return JsonResponse({"success":True})
    

class SecondMangerView(LoginRequiredMixin,TemplateView):
    template_name = "dmam/secondmanager.html"

    def get_context_data(self, *args, **kwargs):
        context = super(SecondMangerView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "二供管理"
        context["page_menu"] = "基础管理"
        
        return context  


    

def secondwater_repetition(request):
    name = request.POST.get("name")
    bflag = not SecondWater.objects.filter(name=name).exists()

    # return HttpResponse(json.dumps(bflag))
    return HttpResponse(json.dumps({"success":bflag}))


"""
User add, manager
"""
class SecondWaterAddView(AjaxableResponseMixin,UserPassesTestMixin,CreateView):
    model = SecondWater
    form_class = SecondWaterAddForm
    template_name = "dmam/secondwaterAdd.html"
    success_url = reverse_lazy("dmam:secondmanager")
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
        return super(SecondWaterAddView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('secondmanager_dmam'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "新增二供设备",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("secondwater  add here?:",self.request.POST)
        print(self.kwargs,self.args)
        # print(form)
        # do something
        user = self.request.user
        user_groupid = user.belongto.cid
        amrs_secondwater = form.save(commit=True)
        organ_name = self.request.POST.get('belongto')
        
        belongto = Organization.objects.get(name=organ_name)
        version = self.request.POST.get("version")
        manufacturer = self.request.POST.get("manufacturer")
        product_date = self.request.POST.get("product_date")
        serialnumber = self.request.POST.get("serialnumber")
        artist = self.request.POST.get("artist")
        # artistPreview = self.request.POST.get("artistPreview")
        vsecondwater = {
            "amrs_secondwater":amrs_secondwater,
            "version":version,
            "belongto":belongto,
            "manufacturer":manufacturer,
            "product_date":product_date,
            "serialnumber":serialnumber,
            "artist":artist
        }
        vsecondwater_obj = VSecondWater.objects.create(**vsecondwater)

        imgName = ''
        if self.request.FILES['file']:
            myfile = self.request.FILES['file']
            new_path =  os.path.join(settings.MEDIA_ROOT, 'resources','img','secondwater')
            # fs = FileSystemStorage()
            fs = FileSystemStorage(new_path)
            filename = fs.save(myfile.name, myfile)
            initial_path = fs.path(filename)
            
            # os.rename(initial_path, new_path)
            imgName = filename

        if imgName != '':
            vsecondwater_obj.artistPreview = imgName
            vsecondwater_obj.save()

        return super(SecondWaterAddView,self).form_valid(form)   

    def get_context_data(self, *args, **kwargs):
        context = super(SecondWaterAddView, self).get_context_data(*args, **kwargs)

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
class SecondWaterEditView(AjaxableResponseMixin,UserPassesTestMixin,UpdateView):
    model = SecondWater
    form_class = SecondWaterEditForm
    template_name = "dmam/secondwateredit.html"
    success_url = reverse_lazy("dmam:secondmanager")
    
    # @method_decorator(permission_required("dma.change_meters"))
    def dispatch(self, *args, **kwargs):
        # self.user_id = kwargs["pk"]
        return super(SecondWaterEditView, self).dispatch(*args, **kwargs)

    def get_object(self):
        return SecondWater.objects.get(id=self.kwargs["pk"])

    def test_func(self):
        if self.request.user.has_menu_permission_edit('secondmanager_dmam'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "修改二供",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def form_invalid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("user edit form_invalid:::")
        return super(SecondWaterEditView,self).form_invalid(form)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print(form)
        print(self.request.POST)

        
        amrs_secondwater = form.save(commit=True)
        organ_name = self.request.POST.get('belongto')
        
        belongto = Organization.objects.get(name=organ_name)
        version = self.request.POST.get("version")
        manufacturer = self.request.POST.get("manufacturer")
        product_date = self.request.POST.get("product_date")
        serialnumber = self.request.POST.get("serialnumber")
        artist = self.request.POST.get("artist")
        
        vsecondwater_obj = self.get_object().vsecondwater
        vsecondwater_obj.belongto = Organization.objects.get(name=organ_name)
        vsecondwater_obj.version = self.request.POST.get("version")
        vsecondwater_obj.manufacturer = self.request.POST.get("manufacturer")
        vsecondwater_obj.product_date = self.request.POST.get("product_date")
        vsecondwater_obj.serialnumber = self.request.POST.get("serialnumber")
        vsecondwater_obj.artist = self.request.POST.get("artist")

        imgchange  = self.request.POST.get('imgchange')
        if imgchange == '1' and self.request.FILES['file']:
            myfile = self.request.FILES['file']
            new_path =  os.path.join(settings.MEDIA_ROOT, 'resources','img','secondwater')
            # fs = FileSystemStorage()
            fs = FileSystemStorage(new_path)
            filename = fs.save(myfile.name, myfile)
            initial_path = fs.path(filename)
            

        
            vsecondwater_obj.artistPreview = filename
            vsecondwater_obj.save()

        
        # instance.uuid=unique_uuid_generator(instance)
        return super(SecondWaterEditView,self).form_valid(form)
       


def secondwaterdeletemore(request):
    # print('userdeletemore',request,request.POST)

    if not request.user.has_menu_permission_edit('metermanager_dmam'):
        return HttpResponse(json.dumps({"success":0,"msg":"您没有权限进行操作，请联系管理员."}))

    deltems = request.POST.get("deltems")
    print('deltems:',deltems)
    deltems_list = deltems.split(',')

    for uid in deltems_list:
        u = SecondWater.objects.get(id=int(uid))
        u.delete()

    return HttpResponse(json.dumps({"success":1}))

"""
Assets comment deletion, manager
"""
class SecondWaterDeleteView(AjaxableResponseMixin,UserPassesTestMixin,DeleteView):
    model = SecondWater
    # template_name = "aidsbank/asset_comment_confirm_delete.html"

    def test_func(self):
        
        if self.request.user.has_menu_permission_edit('metermanager_dmam'):
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
        
        return super(SecondWaterDeleteView, self).dispatch(*args, **kwargs)

    def get_object(self,*args, **kwargs):
        # print("delete objects:",self.kwargs,kwargs)
        return SecondWater.objects.get(pk=kwargs["pk"])

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
        

def getSecondWaterSelect(request):
    # meters = Meter.objects.all()
    secondwaters = request.user.secondwater_list_queryset('').values()

    def m_info(m):
        
        return {
            "id":m["id"],
            "name":m["name"],
            
        }
    data = []

    for m in secondwaters:
        data.append(m_info(m))

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":data,
        "success":True
    }
   
    # print(operarions_list)
    return JsonResponse(operarions_list)


# 二供设备列表
def secondwaterlist(request):
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

    user = request.user
    organs = user.belongto

    secondwaters = user.secondwater_list_queryset(simpleQueryParam).values("id","name","belongto__name","address","lng","lat","coortype",
        "version","serialnumber","manufacturer","product_date","artist","artistPreview")
    # meged_secondwater = merge_values(comunities)
    # meters = SecondWater.objects.all() #.filter(secondwaterid=105)  #文欣苑105

    def m_info(m):
        
        return {
            "id":m["id"],
            "name":m["name"],
            "belongto":m["belongto__name"],
            "address":m["address"],
            "lng":m["lng"],
            "lat":m["lat"],
            "coortype":m["coortype"],
            "version":m["version"],
            "serialnumber":m["serialnumber"],
            "manufacturer":m["manufacturer"],
            "product_date":m["product_date"],
            "artist":m["artist"],
            "artistPreview":m["artistPreview"],
            # "lng":m["lng"],
            
        }
    data = []

    for m in secondwaters:
        data.append(m_info(m))

    recordsTotal = secondwaters.count()
    # recordsTotal = len(meged_secondwater)
    
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



class VedioMangerView(LoginRequiredMixin,TemplateView):
    template_name = "dmam/vediomanager.html"

    def get_context_data(self, *args, **kwargs):
        context = super(VedioMangerView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "视频管理"
        context["page_menu"] = "基础管理"
        
        return context  



class VehicleMangerView(LoginRequiredMixin,TemplateView):
    template_name = "dmam/vehiclemanager.html"

    def get_context_data(self, *args, **kwargs):
        context = super(VehicleMangerView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "车辆管理"
        context["page_menu"] = "基础管理"
        
        return context  

# 小区管理，取错名字，将就着先
class NeighborhoodMangerView(LoginRequiredMixin,TemplateView):
    template_name = "dmam/neighborhoodmanager.html"

    def get_context_data(self, *args, **kwargs):
        context = super(NeighborhoodMangerView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "小区管理"
        context["page_menu"] = "基础管理"
        
        return context  



def community_repetition(request):
    name = request.POST.get("name")
    bflag = not VCommunity.objects.filter(amrs_community__name=name).exists()

    # return HttpResponse(json.dumps(bflag))
    return HttpResponse(json.dumps({"success":bflag}))


"""
User add, manager
"""
class CommunityAddView(AjaxableResponseMixin,UserPassesTestMixin,CreateView):
    model = Community
    form_class = CommunityCreateForm
    template_name = "dmam/communityadd.html"
    success_url = reverse_lazy("dmam:neighborhoodmanager")
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
        return super(CommunityAddView, self).dispatch(*args, **kwargs)

    def test_func(self):
        if self.request.user.has_menu_permission_edit('neighborhoodmanager_dmam'):
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
        print("community  add here?:",self.request.POST)
        print(self.kwargs,self.args)
        # print(form)
        # do something
        user = self.request.user
        user_groupid = user.belongto.cid
        amrs_community = form.save(commit=True)
        organ_name = self.request.POST.get('belongto')
        
        organization = Organization.objects.get(name=organ_name)
        vcommunity = VCommunity.objects.create(
            amrs_community=amrs_community,
            belongto=organization
        )

        
        vconcentrator1 = self.request.POST.get('vconcentrator1') #集中器1名称
        vconcentrator2 = self.request.POST.get('vconcentrator2') #集中器2名称
        vconcentrator3 = self.request.POST.get('vconcentrator3') #集中器3名称
        vconcentrator4 = self.request.POST.get('vconcentrator4') #集中器4名称
        vc1 = VConcentrator.objects.filter(amrs_concentrator__name=vconcentrator1)
        
        if vc1.exists():
            concentrator1 = vc1.first()
            vcommunity.vconcentrators.add(vc1.first())

            # 更新集中器的communityid
            # 更新集中器的communityid
            amrs_cot = concentrator1.amrs_concentrator
            
            amrs_cot.communityid = amrs_community.id
            amrs_cot.save()

        if vconcentrator2 != '':
            vc2 = VConcentrator.objects.filter(amrs_concentrator__name=vconcentrator2)
            if vc2.exists():
                vcommunity.vconcentrators.add(vc2.first())

        if vconcentrator3 != '':
            vc3 = VConcentrator.objects.filter(amrs_concentrator__name=vconcentrator3)
            if vc3.exists():
                vcommunity.vconcentrators.add(vc3.first())

        if vconcentrator4 != '':
            vc4 = VConcentrator.objects.filter(amrs_concentrator__name=vconcentrator4)
            if vc4.exists():
                vcommunity.vconcentrators.add(vc4.first())

        vcommunity.save()

        return super(CommunityAddView,self).form_valid(form)   

    def get_context_data(self, *args, **kwargs):
        context = super(CommunityAddView, self).get_context_data(*args, **kwargs)

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
class CommunityEditView(AjaxableResponseMixin,UserPassesTestMixin,UpdateView):
    model = Community
    form_class = CommunityEditForm
    template_name = "dmam/communityedit.html"
    success_url = reverse_lazy("dmam:neighborhoodmanager")
    
    # @method_decorator(permission_required("dma.change_meters"))
    def dispatch(self, *args, **kwargs):
        # self.user_id = kwargs["pk"]
        return super(CommunityEditView, self).dispatch(*args, **kwargs)

    def get_object(self):
        return Community.objects.get(id=self.kwargs["pk"])

    def test_func(self):
        if self.request.user.has_menu_permission_edit('neighborhoodmanager_dmam'):
            return True
        return False

    def handle_no_permission(self):
        data = {
                "mheader": "修改小区",
                "err_msg":"您没有权限进行操作，请联系管理员."
                    
            }
        # return HttpResponse(json.dumps(err_data))
        return render(self.request,"entm/permission_error.html",data)

    def form_invalid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        print("user edit form_invalid:::")
        return super(CommunityEditView,self).form_invalid(form)

    def form_valid(self, form):
        """
        If the form is valid, redirect to the supplied URL.
        """
        # print(form)
        print(self.request.POST)

        
        instance = form.save(commit=True)
        organ_name = self.request.POST.get('belongto')
        
        organization = Organization.objects.get(name=organ_name)
        instance.belongto = organization

        # 直接清除
        vcommunity = self.get_object().vcommunity
        print(vcommunity)
        vcommunity.belongto = organization
        
        vcommunity.vconcentrators.clear()

        vconcentrator1 = self.request.POST.get('vconcentrator1') #集中器1名称
        vconcentrator2 = self.request.POST.get('vconcentrator2') #集中器2名称
        vconcentrator3 = self.request.POST.get('vconcentrator3') #集中器3名称
        vconcentrator4 = self.request.POST.get('vconcentrator4') #集中器4名称
        vc1 = VConcentrator.objects.filter(amrs_concentrator__name=vconcentrator1)
        
        if vc1.exists():
            concentrator1 = vc1.first()
            vcommunity.vconcentrators.add(vc1.first())

            # 更新集中器的communityid
            amrs_cot = concentrator1.amrs_concentrator
            
            amrs_cot.communityid = instance.id
            amrs_cot.save()

        if vconcentrator2 != '':
            vc2 = VConcentrator.objects.filter(amrs_concentrator__name=vconcentrator2)
            if vc2.exists():
                vcommunity.vconcentrators.add(vc2.first())

        if vconcentrator3 != '':
            vc3 = VConcentrator.objects.filter(amrs_concentrator__name=vconcentrator3)
            if vc3.exists():
                vcommunity.vconcentrators.add(vc3.first())

        if vconcentrator4 != '':
            vc4 = VConcentrator.objects.filter(amrs_concentrator__name=vconcentrator4)
            if vc4.exists():
                vcommunity.vconcentrators.add(vc4.first())

        vcommunity.save()
        # instance.uuid=unique_uuid_generator(instance)
        return super(CommunityEditView,self).form_valid(form)
       


def communitydeletemore(request):
    # print('userdeletemore',request,request.POST)

    if not request.user.has_menu_permission_edit('metermanager_devm'):
        return HttpResponse(json.dumps({"success":0,"msg":"您没有权限进行操作，请联系管理员."}))

    deltems = request.POST.get("deltems")
    print('deltems:',deltems)
    deltems_list = deltems.split(',')

    for uid in deltems_list:
        u = Community.objects.get(id=int(uid))
        u.delete()

    return HttpResponse(json.dumps({"success":1}))

"""
Assets comment deletion, manager
"""
class CommunityDeleteView(AjaxableResponseMixin,UserPassesTestMixin,DeleteView):
    model = Community
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
        
        return super(CommunityDeleteView, self).dispatch(*args, **kwargs)

    def get_object(self,*args, **kwargs):
        # print("delete objects:",self.kwargs,kwargs)
        return Community.objects.get(pk=kwargs["pk"])

    def delete(self, request, *args, **kwargs):
        """
        Calls the delete() method on the fetched object and then
        redirects to the success URL.
        """
        print("delete?",args,kwargs)
        self.object = self.get_object(*args,**kwargs)

        self.object.delete()
        return HttpResponse(json.dumps({"success":1}))
        

def getCommunitySelect(request):
    # meters = Meter.objects.all()
    communitys = request.user.belongto.community_list_queryset('').values()

    def m_info(m):
        
        return {
            "id":m["id"],
            "name":m["name"],
            
        }
    data = []

    for m in communitys:
        data.append(m_info(m))

    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":data,
        "success":True
    }
   
    # print(operarions_list)
    return JsonResponse(operarions_list)


# 小区列表
def communitylist(request):
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

    comunities = user.community_list_queryset(simpleQueryParam).values("id","name","belongto__name","address","vconcentrators__name")
    meged_community = merge_values(comunities)
    # meters = Community.objects.all() #.filter(communityid=105)  #文欣苑105

    def m_info(m):
        
        return {
            "id":m["id"],
            # "simid":m.simid,
            # "dn":m.dn,
            # "belongto":m.belongto.name,#current_user.belongto.name,
            # "metertype":m.metertype,
            "name":m["name"],
            "belongto":m["belongto__name"],
            "address":m["address"],
            "concentrator":m["vconcentrators__name"],
            "related":DmaStation.objects.filter(station_id=m["id"]).exists()
            # "station":m.station_set.first().username if m.station_set.count() > 0 else ""
        }
    data = []

    for m in meged_community:
        data.append(m_info(m))

    recordsTotal = comunities.count()
    # recordsTotal = len(meged_community)
    
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


def getDmaGisinfo(request):
    dma_no = request.POST.get("dma_no")

    dma = DmaGisinfo.objects.filter(dma_no=dma_no).values("geodata","strokeColor","fillColor")
    data = []

    if dma.exists():
        d = dma.first()
        data.append({"geoJsonData":json.loads(d["geodata"]),
        # data.append({"geoJsonData":d["geodata"],
            "strokeColor":d["strokeColor"],
            "fillColor":d["fillColor"]})
    else:
        data = []


    operarions_list = {
        "exceptionDetailMsg":"null",
        "msg":None,
        "obj":data,
        "success":True
    }
   

    return JsonResponse(operarions_list)


def saveDmaGisinfo(request):
    print("saveDmaGisinfo",request.POST)
    dma_no = request.POST.get("dma_no")
    geodata = request.POST.get("geodata")
    strokeColor = request.POST.get("strokeColor")
    fillColor = request.POST.get("fillColor")

    if dma_no is None:
        data = {
            "success": 0,
            "obj":{"flag":0}
        }
        return JsonResponse(data)

    dma = DmaGisinfo.objects.filter(dma_no=dma_no)
    if dma.exists():
        d = dma.first()
        d.geodata = geodata
        d.strokeColor = strokeColor
        d.fillColor = fillColor
        d.save()
    else:
        DmaGisinfo.objects.create(dma_no=dma_no,geodata=geodata,strokeColor=strokeColor,fillColor=fillColor)

    data = {
            "success": 1,
            "obj":{"flag":1}
        }

    return JsonResponse(data)