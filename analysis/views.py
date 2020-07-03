# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import get_object_or_404,render,redirect
from django.http import HttpResponse,JsonResponse,HttpResponseRedirect
from django.contrib import messages

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

from accounts.models import User,MyRoles
from amrs.models import District,Bigmeter,HdbFlowData,HdbFlowDataDay,HdbFlowDataMonth,HdbPressureData,HdbWatermeterDay,HdbWatermeterMonth,Concentrator,Watermeter
from core.models import Organization,DMABaseinfo,DmaStation,Station

from amrs.utils import HdbFlow_day_hourly,flow_day_dosage

# from django.core.urlresolvers import reverse_lazy


        
class MnfView(LoginRequiredMixin,TemplateView):
    template_name = "analysis/mnf.html"

    def get_context_data(self, *args, **kwargs):
        context = super(MnfView, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "数据监控"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "最小夜间流量分析（MNF）"

        bigmeter = Bigmeter.objects.first()
        dma = DMABaseinfo.objects.first()
        context["station"] = dma.dma_name
        context["organ"] = dma.belongto
        

        return context      

class MnfView2(LoginRequiredMixin,TemplateView):
    template_name = "analysis/mnf2.html"

    def get_context_data(self, *args, **kwargs):
        context = super(MnfView2, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "数据监控"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "最小夜间流量分析（MNF）"

        # bigmeter = Bigmeter.objects.first()
        # dma = DMABaseinfo.objects.first()
        # context["station"] = dma.dma_name
        # context["organ"] = dma.belongto
        

        return context                  


def flowdata_mnf(request):

    print("flowdata_mnf:",request.POST)

    stationid = request.POST.get("station") # DMABaseinfo pk
    treetype = request.POST.get("treetype")
    startTime = request.POST.get("startTime")
    endTime = request.POST.get("endTime")

    data = []

    if treetype == 'dma':
        # distict = District.objects.get(id=int(stationid))
        # bigmeter = distict.bigmeter.first()
        dmas = DMABaseinfo.objects.filter(pk=int(stationid))
        
        
    else:
        # dma = DMABaseinfo.objects.first()
        # dmastation = dma.dmastation.first()
        # comaddr = dmastation.station_id

        if treetype == '':
            organ = Organization.objects.first()

        if treetype == 'group':
            organ = Organization.objects.get(cid=stationid)

        organs = organ.get_descendants(include_self=True)

        dmas = None
        for o in organs:
            if dmas is None:
                dmas = o.dma.all()
            else:
                dmas |= o.dma.all()
    print('dmas:',dmas)
    ret = {"exceptionDetailMsg":"null",
            "msg":"没有dma分区信息",
            "obj":{
                "online":data, #reverse
                
            },
            "success":0}

    if len(dmas) == 0:
        return HttpResponse(json.dumps(ret))

    # if stationid != '':
    #     # distict = District.objects.get(id=int(stationid))
    #     # bigmeter = distict.bigmeter.first()
    #     dma = DMABaseinfo.objects.get(pk=int(stationid))
    #     print('DMA',dma,dma.dmastation)
    #     dmastation = dma.dmastation.first()
    #     comaddr = dmastation.station_id
    # else:
    #     dma = DMABaseinfo.objects.first()
    #     dmastation = dma.dmastation.first()
    #     comaddr = dmastation.station_id


    dma = dmas.first()
    dmastation = dma.station_set_all().first() # dma.station_set.first()
    
    if dmastation is None:
        return HttpResponse(json.dumps(ret))
        
    comaddr = dmastation.meter.simid.simcardNumber
    
    
    
    # if comaddr:
        # comaddr = bigmeter.commaddr
    flowday_stastic = HdbFlowDataDay.objects.filter(commaddr=comaddr)
    flowday = HdbFlowData.objects.filter(commaddr=comaddr).filter(readtime__range=[startTime,endTime])

    #pressure
    pressures = HdbPressureData.objects.filter(commaddr=comaddr).filter(readtime__range=[startTime,endTime])
    press = [round(float(f.pressure),2) for f in pressures]
    # print('pressures:',pressures)

    flows = [f.flux for f in flowday]
    hdates = [f.readtime for f in flowday]

    # print('mnf hdates',hdates)
    show_flag=1
    tmp = ''
    count_cnt = 1
    for i in range(len(hdates)):
        if i == 0:
            continue
        h = hdates[i]
        if tmp != h[:10]:
            tmp = h[:10]
            count_cnt += 1
            if count_cnt == 5:
                hdates[i] = h[:10] + " 00:00:00"
            else:
                hdates[i]=''
        


    flows_float = [round(float(f),2) for f in flows]
    flows_float = flows_float[::-1]
    

    #参考MNF
    ref_mnf = 4.46
    #MNF
    mnf = 8.63
    #表具信息
    
    #MNF/ADD
    mnf_add = 51
    #背景漏损
    back_leak = 4.46
    
    #设定报警
    alarm_set = 12

    #staticstic data
    #当天用水量
    today_use = 0
    #昨日用水量
    yestoday_use = 0
    #去年同期用水量
    last_year_same = 0
    #同比增长
    tongbi = 0
    #环比增长
    huanbi = 0
    #最大值
    maxflow = 0
    #最小值
    minflow = 0
    #平均值
    average = 0

    maxflow = max(flows_float) if len(flows_float)>0 else 0
    minflow = min(flows_float) if len(flows_float)>0 else 0
    average = sum(flows_float)/len(flows) if len(flows_float)>0 else 0
    mnf = minflow
    ref_mnf = mnf/2
    back_leak = ref_mnf * 0.8

    for i in range(len(flows_float)):
        data.append({
            "hdate":hdates[i],
            "dosage":flows_float[i],
            "assignmentName":dma.dma_name,
            "color":"红色",
            "ratio":"null",
            "maxflow":maxflow,
            "average":average,
            "mnf":mnf,
            "ref_mnf":ref_mnf,
            "press":press[i] if len(press)>0 else 0
            })
            
    

    today = datetime.date.today()
    today_str = today.strftime("%Y-%m-%d")
    today_flow = HdbFlowDataDay.objects.filter(hdate=today_str)
    
    if today_flow.exists():
        today_use = today_flow.first().dosage

    yestoday = today - datetime.timedelta(days=1)
    yestoday_str = yestoday.strftime("%Y-%m-%d")
    yestoday_flow = HdbFlowDataDay.objects.filter(hdate=yestoday_str)
    if yestoday_flow.exists():
        yestoday_use = yestoday_flow.first().dosage

    lastyear = datetime.datetime(year=today.year-1,month=today.month,day=today.day)
    lastyear_str = lastyear.strftime("%Y-%m-%d")
    lastyear_flow = HdbFlowDataDay.objects.filter(hdate=lastyear_str)
    if lastyear_flow.exists():
        last_year_same = lastyear_flow.first().dosage
    tongbi = float(today_use) - float(last_year_same)
    huanbi = float(today_use) - float(yestoday_use)
    



    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                "online":data, #reverse
                "today_use":round(float(today_use),2),
                "yestoday_use":round(float(yestoday_use),2),
                "last_year_same":round(float(last_year_same),2),
                "tongbi":round(tongbi,2),
                "huanbi":round(huanbi,2),
                "maxflow":round(maxflow,2),
                "minflow":round(minflow,2),
                "average":round(average,2),
                "mnf":round(mnf,2),
                "mnf_add":round(mnf_add,2),
                "ref_mnf":round(ref_mnf,2),
                "back_leak":round(back_leak,2),
                "alarm_set":round(alarm_set,2),


            },
            "success":1}

    
    
    return HttpResponse(json.dumps(ret))
        # LoginRequiredMixin,
class CXCView2(LoginRequiredMixin,TemplateView):
    template_name = "analysis/dmacxc2.html"

    def get_context_data(self, *args, **kwargs):
        context = super(CXCView2, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "数据监分析"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "产销差分析"

        bigmeter = Bigmeter.objects.first()
        context["station"] = bigmeter.username
        context["organ"] = "歙县自来水公司"

        # dmastations = DmaStations.objects.all()
        

        return context                  


class CXCView(LoginRequiredMixin,TemplateView):
    template_name = "analysis/dmacxc.html"

    def get_context_data(self, *args, **kwargs):
        context = super(CXCView, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "数据监控"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "DMA综合统计"

        bigmeter = Bigmeter.objects.first()
        context["station"] = bigmeter.username
        context["organ"] = "歙县自来水公司"

        # dmastations = DmaStations.objects.all()
        

        return context                  

def flowdata_cxc(request):

    print("flowdata_cxc:",request.POST)

    stationid = request.POST.get("station") or '' # DMABaseinfo pk
    endTime = request.POST.get("endTime") or ''
    treetype = request.POST.get("treetype") or ''

    today = datetime.date.today()
    endTime = today.strftime("%Y-%m")
    
    lastyear = datetime.datetime(year=today.year-1,month=today.month,day=today.day)
    startTime = lastyear.strftime("%Y-%m")

    data = []
    sub_dma_list = []
    print(startTime,'-',endTime)
    # etime = datetime.datetime.strptime(endTime.strip(),"%Y-%m-%d")
    # stime = etime - datetime.timedelta(days=10)
    # startTime = stime.strftime("%Y-%m-%d")
    echart_data = {}
    def month_year_iter( start_month, start_year, end_month, end_year ):
        ym_start= 12*start_year + start_month
        ym_end= 12*end_year + end_month
        for ym in range( ym_start, ym_end ):
            y, m = divmod( ym, 12 )
            # yield y, m+1
            yield '{}-{:02d}'.format(y,m+1)

    month_list = month_year_iter(lastyear.month,lastyear.year,today.month,today.year)
    # print(month_list)
    for m in month_list:
        # print (m)
        if m not in echart_data.keys():
            echart_data[m] = 0
    

    if treetype == 'dma':
        # distict = District.objects.get(id=int(stationid))
        # bigmeter = distict.bigmeter.first()
        dmas = DMABaseinfo.objects.filter(pk=int(stationid))
        
        
    else:
        # dma = DMABaseinfo.objects.first()
        # dmastation = dma.dmastation.first()
        # comaddr = dmastation.station_id

        if treetype == '':
            organ = Organization.objects.first()

        if treetype == 'group':
            organ = Organization.objects.get(cid=stationid)

        organs = organ.get_descendants(include_self=True)

        dmas = None
        for o in organs:
            if dmas is None:
                dmas = o.dma.all()
            else:
                dmas |= o.dma.all()
    print('dmas:',dmas)

    

    total_influx       = 0
    total_total        = 0
    total_leak         = 0
    total_uncharg      = 0
    total_sale         = 0
    total_cxc          = 0
    total_cxc_percent  = 0
    total_leak_percent = 0
    total_broken_pipe  = 0
    total_mnf          = 0
    total_back_leak    = 0
    huanbi=0
    tongbi=0
    mnf=1.2
    back_leak=1.8
    broken_pipe=0
    other_leak = 0

    if len(dmas) == 0:
        ret = {"exceptionDetailMsg":"null",
            "msg":"没有dma分区信息",
            "obj":{
                "online":data, #reverse
                "influx":round(total_influx,2),
                "total":round(total_total,2),
                "leak":round(total_leak,2),
                "uncharg":round(total_uncharg,2),
                "sale":round(total_sale,2),
                "cxc":round(total_cxc,2),
                "cxc_percent":round(total_cxc_percent,2),
                "broken_pipe":broken_pipe,
                "back_leak":back_leak,
                "mnf":mnf,
                "leak_percent":round(total_leak_percent,2),
                "stationsstastic":sub_dma_list

            },
            "success":0}

    
    
        return HttpResponse(json.dumps(ret))

    
    if dmas.first().dma_name == '文欣苑' or dmas.first().dma_no== '301':
        print('special process 文欣苑')

        dma = dmas.first()
        dmareport = dma.dma_statistic()
        flowday = HdbWatermeterMonth.objects.filter(communityid=105).filter(hdate__range=[startTime,endTime])
        print("wm_flowday count",flowday.count())

        #fill echart data
        for de,value in flowday.values_list('hdate','dosage'):
            if de in echart_data.keys():
                o_data = echart_data[de]
                echart_data[de] = o_data + float(value)/10000

        

        flows = [f.dosage for f in flowday]
        hdates = [f.hdate[-2:] for f in flowday]
        hdates = hdates[::-1]

        flows_float = [float(f) for f in flows]
        flows_float = flows_float[::-1]
        flows_leak = [random.uniform(float(f)/10,float(f)/5 ) for f in flows]
        uncharged =[random.uniform(float(f)/10,float(f)/5 ) for f in flows]

        #表具信息
        
        total = sum(flows_float)
        total /= 10000
        influx = sum(flows_float)
        influx /=10000
        leak = sum(flows_leak)
        leak /=10000
        uncharg = sum(uncharged)
        uncharg /=10000
        sale = total - leak - uncharg
        cxc = total - sale
        if total != 0:
            cxc_percent = (cxc / total)*100 
        else:
            cxc_percent = 0
        huanbi=0
        if total != 0 :
            leak_percent = (leak * 100)/total
        else:
            leak_percent = 0
        tongbi=0
        mnf=1.2
        back_leak=1.8
        broken_pipe=0
        other_leak = 0

        total_influx += influx
        total_total += total
        total_leak += leak
        total_uncharg += uncharg
        total_sale += sale
        total_cxc += cxc
        # total_cxc_percent += cxc_percent
        # total_leak_percent += leak_percent

        #记录每个dma分区的统计信息
        sub_dma_list.append({
                    "organ":dma.dma_name,
                    # "influx":round(influx,2),
                    "total":round(total,2),
                    "sale":round(sale,2),
                    "uncharg":round(uncharg,2),
                    "leak":round(leak,2),
                    "cxc":round(cxc,2),
                    "cxc_percent":round(cxc_percent,2),
                    "huanbi":round(huanbi,2),
                    "leak_percent":round(leak_percent,2),
                    "tongbi":round(tongbi,2),
                    "mnf":round(mnf,2),
                    "back_leak":round(back_leak,2),
                    "other_leak":round(other_leak,2),
                    "statis_date":endTime,
                })
    
    for dma in dmas:
        print('dma station is',dma.dmastation.all())
        if dma.dmastation.exists():
            dmastation = dma.dmastation.first()
            print("dmastation:",dmastation)
            comaddr = dmastation.station_id
        else:
            continue

        if comaddr == '':
            comaddr = '4892354820'
        
        
        # if comaddr:
            # comaddr = bigmeter.commaddr
        flowday = HdbFlowDataMonth.objects.filter(commaddr=comaddr).filter(hdate__range=[startTime,endTime])
        
        #fill echart data
        for de,value in flowday.values_list('hdate','dosage'):
            if de in echart_data.keys():
                o_data = echart_data[de]
                echart_data[de] = o_data + float(value)/10000

        # print('comaddr:',comaddr)
        # print('echart_data:',echart_data)
        
        # flowday = HdbFlowData.objects.filter(commaddr=comaddr).filter(readtime__range=[startTime,endTime])

        #pressure
        # pressures = HdbPressureData.objects.filter(commaddr=comaddr)

        # flows = [f.flux for f in flowday]
        # hdates = [f.readtime for f in flowday]

        flows = [f.dosage for f in flowday]
        hdates = [f.hdate[-2:] for f in flowday]
        hdates = hdates[::-1]

        flows_float = [float(f) for f in flows]
        flows_float = flows_float[::-1]
        flows_leak = [random.uniform(float(f)/10,float(f)/5 ) for f in flows]
        uncharged =[random.uniform(float(f)/10,float(f)/5 ) for f in flows]

        #表具信息
        
        total = sum(flows_float)
        total /= 10000
        influx = sum(flows_float)
        influx /=10000
        leak = sum(flows_leak)
        leak /=10000
        uncharg = sum(uncharged)
        uncharg /=10000
        sale = total - leak - uncharg
        cxc = total - sale
        if total != 0:
            cxc_percent = (cxc / total)*100 
        else:
            cxc_percent = 0
        huanbi=0
        if total != 0 :
            leak_percent = (leak * 100)/total
        else:
            leak_percent = 0
        tongbi=0
        mnf=1.2
        back_leak=1.8
        broken_pipe=0
        other_leak = 0

        total_influx += influx
        total_total += total
        total_leak += leak
        total_uncharg += uncharg
        total_sale += sale
        total_cxc += cxc
        # total_cxc_percent += cxc_percent
        # total_leak_percent += leak_percent

        #记录每个dma分区的统计信息
        sub_dma_list.append({
                    "organ":dma.dma_name,
                    # "influx":round(influx,2),
                    "total":round(total,2),
                    "sale":round(sale,2),
                    "uncharg":round(uncharg,2),
                    "leak":round(leak,2),
                    "cxc":round(cxc,2),
                    "cxc_percent":round(cxc_percent,2),
                    "huanbi":round(huanbi,2),
                    "leak_percent":round(leak_percent,2),
                    "tongbi":round(tongbi,2),
                    "mnf":round(mnf,2),
                    "back_leak":round(back_leak,2),
                    "other_leak":round(other_leak,2),
                    "statis_date":endTime,
                })
        

        
    dma_name = '歙县自来水公司'
    for k in echart_data:
        v = echart_data[k]
        l = v/5
        u = v/4
        cp = 0
        if v != 0:
            cp = (l+u)/v * 100;
        print(k,v,l,u,cp)
        data.append({
            "hdate":k[-2:],
            "dosage":round(v-l-u,2),
            "assignmentName":dma_name,
            "color":"红色",
            "ratio":"null",
            "leak":round(l,2),
            "uncharged":round(u,2),
            "cp_month":round(cp,2)
            })    
    

    
    if total_total != 0:
        total_cxc = total_total - total_sale
        total_cxc_percent = (total_cxc / total_total)*100
        total_leak_percent = (total_leak * 100)/total_total

    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                "online":data, #reverse
                "influx":round(total_influx,2),
                "total":round(total_total,2),
                "leak":round(total_leak,2),
                "uncharg":round(total_uncharg,2),
                "sale":round(total_sale,2),
                "cxc":round(total_cxc,2),
                "cxc_percent":round(total_cxc_percent,2),
                "broken_pipe":broken_pipe,
                "back_leak":back_leak,
                "mnf":mnf,
                "leak_percent":round(total_leak_percent,2),
                "stationsstastic":sub_dma_list

            },
            "success":1}

    
    
    return HttpResponse(json.dumps(ret))


def flowdata_wxy(request):

    print("flowdata_cxc:",request.POST)

    stationid = request.POST.get("station") or '' # DMABaseinfo pk
    endTime = request.POST.get("endTime") or ''
    treetype = request.POST.get("treetype") or ''

    stationid = 'virvo_organization_rzav_ehou_yslh'
    today = datetime.date.today()
    endTime = today.strftime("%Y-%m")
    
    lastyear = datetime.datetime(year=today.year-1,month=today.month,day=today.day)
    startTime = lastyear.strftime("%Y-%m")

    data = []
    sub_dma_list = []
    print("stationid:",stationid)
    print(startTime,'-',endTime)
    # etime = datetime.datetime.strptime(endTime.strip(),"%Y-%m-%d")
    # stime = etime - datetime.timedelta(days=10)
    # startTime = stime.strftime("%Y-%m-%d")
    echart_data = {}
    def month_year_iter( start_month, start_year, end_month, end_year ):
        ym_start= 12*start_year + start_month
        ym_end= 12*end_year + end_month
        for ym in range( ym_start, ym_end ):
            y, m = divmod( ym, 12 )
            # yield y, m+1
            yield '{}-{:02d}'.format(y,m+1)

    month_list = month_year_iter(lastyear.month,lastyear.year,today.month,today.year)
    # print(month_list)
    for m in month_list:
        # print (m)
        if m not in echart_data.keys():
            echart_data[m] = 0
    

    # if treetype == 'dma':
    #     # distict = District.objects.get(id=int(stationid))
    #     # bigmeter = distict.bigmeter.first()
    #     dmas = DMABaseinfo.objects.filter(pk=int(stationid))
        
        
    # else:
    #     # dma = DMABaseinfo.objects.first()
    #     # dmastation = dma.dmastation.first()
    #     # comaddr = dmastation.station_id

    #     if treetype == '':
    #         organ = Organization.objects.first()

    #     if treetype == 'group':
    #         organ = Organization.objects.get(cid=stationid)

    #     organs = organ.get_descendants(include_self=True)

    #     dmas = None
    #     for o in organs:
    #         if dmas is None:
    #             dmas = o.dma.all()
    #         else:
    #             dmas |= o.dma.all()

    dmas = DMABaseinfo.objects.get(dma_no='301')
    print('dmas:',dmas)

    

    total_influx       = 0
    total_total        = 0
    total_leak         = 0
    total_uncharg      = 0
    total_sale         = 0
    total_cxc          = 0
    total_cxc_percent  = 0
    total_leak_percent = 0
    total_broken_pipe  = 0
    total_mnf          = 0
    total_back_leak    = 0
    huanbi=0
    tongbi=0
    mnf=1.2
    back_leak=1.8
    broken_pipe=0
    other_leak = 0

    if len(dmas) == 0:
        ret = {"exceptionDetailMsg":"null",
            "msg":"没有dma分区信息",
            "obj":{
                "online":data, #reverse
                "influx":round(total_influx,2),
                "total":round(total_total,2),
                "leak":round(total_leak,2),
                "uncharg":round(total_uncharg,2),
                "sale":round(total_sale,2),
                "cxc":round(total_cxc,2),
                "cxc_percent":round(total_cxc_percent,2),
                "broken_pipe":broken_pipe,
                "back_leak":back_leak,
                "mnf":mnf,
                "leak_percent":round(total_leak_percent,2),
                "stationsstastic":sub_dma_list

            },
            "success":0}

    
    
        return HttpResponse(json.dumps(ret))

    
    if dmas.first().dma_name == '文欣苑' or dmas.first().dma_no== '301':
        print('special process 文欣苑')

        dma = dmas.first()
        flowday = HdbWatermeterMonth.objects.filter(communityid=105).filter(hdate__range=[startTime,endTime])
        print("wm_flowday count",flowday.count())

        #fill echart data
        for de,value in flowday.values_list('hdate','dosage'):
            if de in echart_data.keys():
                o_data = echart_data[de]
                echart_data[de] = o_data + float(value)/10000

        # print('comaddr:',comaddr)
        # print('echart_data:',echart_data)
        
        # flowday = HdbFlowData.objects.filter(commaddr=comaddr).filter(readtime__range=[startTime,endTime])

        #pressure
        # pressures = HdbPressureData.objects.filter(commaddr=comaddr)

        # flows = [f.flux for f in flowday]
        # hdates = [f.readtime for f in flowday]

        flows = [f.dosage for f in flowday]
        hdates = [f.hdate[-2:] for f in flowday]
        hdates = hdates[::-1]

        flows_float = [float(f) for f in flows]
        flows_float = flows_float[::-1]
        flows_leak = [random.uniform(float(f)/10,float(f)/5 ) for f in flows]
        uncharged =[random.uniform(float(f)/10,float(f)/5 ) for f in flows]

        #表具信息
        
        total = sum(flows_float)
        total /= 10000
        influx = sum(flows_float)
        influx /=10000
        leak = sum(flows_leak)
        leak /=10000
        uncharg = sum(uncharged)
        uncharg /=10000
        sale = total - leak - uncharg
        cxc = total - sale
        if total != 0:
            cxc_percent = (cxc / total)*100 
        else:
            cxc_percent = 0
        huanbi=0
        if total != 0 :
            leak_percent = (leak * 100)/total
        else:
            leak_percent = 0
        tongbi=0
        mnf=1.2
        back_leak=1.8
        broken_pipe=0
        other_leak = 0

        total_influx += influx
        total_total += total
        total_leak += leak
        total_uncharg += uncharg
        total_sale += sale
        total_cxc += cxc
        # total_cxc_percent += cxc_percent
        # total_leak_percent += leak_percent

        #记录每个dma分区的统计信息
        sub_dma_list.append({
                    "organ":dma.dma_name,
                    # "influx":round(influx,2),
                    "total":round(total,2),
                    "sale":round(sale,2),
                    "uncharg":round(uncharg,2),
                    "leak":round(leak,2),
                    "cxc":round(cxc,2),
                    "cxc_percent":round(cxc_percent,2),
                    "huanbi":round(huanbi,2),
                    "leak_percent":round(leak_percent,2),
                    "tongbi":round(tongbi,2),
                    "mnf":round(mnf,2),
                    "back_leak":round(back_leak,2),
                    "other_leak":round(other_leak,2),
                    "statis_date":endTime,
                })
    
    for dma in dmas:
        print('dma station is',dma.dmastation.all())
        if dma.dmastation.exists():
            dmastation = dma.dmastation.first()
            print("dmastation:",dmastation)
            comaddr = dmastation.station_id
        else:
            continue

        if comaddr == '':
            comaddr = '4892354820'
        
        
        # if comaddr:
            # comaddr = bigmeter.commaddr
        flowday = HdbFlowDataMonth.objects.filter(commaddr=comaddr).filter(hdate__range=[startTime,endTime])
        
        #fill echart data
        for de,value in flowday.values_list('hdate','dosage'):
            if de in echart_data.keys():
                o_data = echart_data[de]
                echart_data[de] = o_data + float(value)/10000

        # print('comaddr:',comaddr)
        # print('echart_data:',echart_data)
        
        # flowday = HdbFlowData.objects.filter(commaddr=comaddr).filter(readtime__range=[startTime,endTime])

        #pressure
        # pressures = HdbPressureData.objects.filter(commaddr=comaddr)

        # flows = [f.flux for f in flowday]
        # hdates = [f.readtime for f in flowday]

        flows = [f.dosage for f in flowday]
        hdates = [f.hdate[-2:] for f in flowday]
        hdates = hdates[::-1]

        flows_float = [float(f) for f in flows]
        flows_float = flows_float[::-1]
        flows_leak = [random.uniform(float(f)/10,float(f)/5 ) for f in flows]
        uncharged =[random.uniform(float(f)/10,float(f)/5 ) for f in flows]

        #表具信息
        
        total = sum(flows_float)
        total /= 10000
        influx = sum(flows_float)
        influx /=10000
        leak = sum(flows_leak)
        leak /=10000
        uncharg = sum(uncharged)
        uncharg /=10000
        sale = total - leak - uncharg
        cxc = total - sale
        if total != 0:
            cxc_percent = (cxc / total)*100 
        else:
            cxc_percent = 0
        huanbi=0
        if total != 0 :
            leak_percent = (leak * 100)/total
        else:
            leak_percent = 0
        tongbi=0
        mnf=1.2
        back_leak=1.8
        broken_pipe=0
        other_leak = 0

        total_influx += influx
        total_total += total
        total_leak += leak
        total_uncharg += uncharg
        total_sale += sale
        total_cxc += cxc
        # total_cxc_percent += cxc_percent
        # total_leak_percent += leak_percent

        #记录每个dma分区的统计信息
        sub_dma_list.append({
                    "organ":dma.dma_name,
                    # "influx":round(influx,2),
                    "total":round(total,2),
                    "sale":round(sale,2),
                    "uncharg":round(uncharg,2),
                    "leak":round(leak,2),
                    "cxc":round(cxc,2),
                    "cxc_percent":round(cxc_percent,2),
                    "huanbi":round(huanbi,2),
                    "leak_percent":round(leak_percent,2),
                    "tongbi":round(tongbi,2),
                    "mnf":round(mnf,2),
                    "back_leak":round(back_leak,2),
                    "other_leak":round(other_leak,2),
                    "statis_date":endTime,
                })
        

        
    dma_name = '歙县自来水公司'
    for k in echart_data:
        v = echart_data[k]
        l = v/5
        u = v/4
        cp = 0
        if v != 0:
            cp = (l+u)/v * 100;
        print(k,v,l,u,cp)
        data.append({
            "hdate":k[-2:],
            "dosage":round(v-l-u,2),
            "assignmentName":dma_name,
            "color":"红色",
            "ratio":"null",
            "leak":round(l,2),
            "uncharged":round(u,2),
            "cp_month":round(cp,2)
            })    
    

    
    if total_total != 0:
        total_cxc = total_total - total_sale
        total_cxc_percent = (total_cxc / total_total)*100
        total_leak_percent = (total_leak * 100)/total_total

    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                "online":data, #reverse
                "influx":round(total_influx,2),
                "total":round(total_total,2),
                "leak":round(total_leak,2),
                "uncharg":round(total_uncharg,2),
                "sale":round(total_sale,2),
                "cxc":round(total_cxc,2),
                "cxc_percent":round(total_cxc_percent,2),
                "broken_pipe":broken_pipe,
                "back_leak":back_leak,
                "mnf":mnf,
                "leak_percent":round(total_leak_percent,2),
                "stationsstastic":sub_dma_list

            },
            "success":1}

    
    
    return HttpResponse(json.dumps(ret))


#日用水分析        
class DailyUseView(LoginRequiredMixin,TemplateView):
    template_name = "analysis/dailyuse.html"

    def get_context_data(self, *args, **kwargs):
        context = super(DailyUseView, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "数据分析"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "日用水分析"

        # station_name = ""
        # organ = ""
        # stations = self.request.user.belongto.station_list_queryset('')
        # station = stations.first()
        # if station:
        #     station_name = station.amrs_bigmeter.username
        #     organ = station.belongto.name
        #     station_id = station.pk
        #     context["station_id"] = station_id 
        # else:
        #     context["station_id"] = Station.objects.first().pk 

        
        # context["station"] = station_name
        # context["organ"] = organ
        
        
        

        return context      

def flowdata_queryday(request):

    return


def flowdata_dailyuse(request):
    # print("flowdata_dailyuse:",request.POST)

    stationid = request.POST.get("station_id") # DMABaseinfo pk
    days = int(request.POST.get("days") or '1' ) #几天内
    data = []
    
    station = Station.objects.get(pk=int(stationid))

    commaddr = station.amrs_bigmeter.commaddr
    # commaddr = '64618742271' #for test
    print("commaddr:",commaddr,"days ",days)
    today = datetime.date.today()
    today_str = today.strftime("%Y-%m-%d")
    yestoday = today - datetime.timedelta(days=1)
    yestoday_str = yestoday.strftime("%Y-%m-%d")
    startTime = yestoday_str + " 23:59:59"
    endTime = today_str + " 23:59:59"

    #staticstic data
    #当天用水量
    today_use = flow_day_dosage(commaddr,today_str)
    print('today_us:',today_use)
    #昨日用水量
    yestoday_use = flow_day_dosage(commaddr,yestoday_str)
    #前日用水量
    before_yestoday = today - datetime.timedelta(days=2)
    before_yestoday_str = before_yestoday.strftime("%Y-%m-%d")
    before_yestoday_use = flow_day_dosage(commaddr,before_yestoday_str)
    
    #最大值,最小值,平均值
    average,maxflow,minflow = station.flow_hour_aggregate(startTime,endTime)
    

    days_flows = []
    xishu_daylist = {}

    flowdata_daylist = {}
    for i in range(days):
        # print(startTime,endTime)
        # flowdata_hour = station.flowData_Hour(startTime,endTime)
        day = today - datetime.timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        flowdata_hour,x = HdbFlow_day_hourly(commaddr,day_str)
        print("day use hourly:",flowdata_hour)
        flowdata_daylist[day_str] = flowdata_hour

        # x = flow_hour_xishu(commaddr,day_str)
        xishu_daylist[day_str] = x
        # days_flows.append(flowdata_hour)

        # today statistic
        if day_str == today_str:
            today_flow_vlist = [round(float(flowdata_hour[k]),2) for k in flowdata_hour.keys() if flowdata_hour[k] != '-']
            if len(today_flow_vlist)>0:
                maxflow = max(today_flow_vlist)
                minflow = min(today_flow_vlist)
                average = round(sum(today_flow_vlist) / len(today_flow_vlist),2)
                # avg_str = "{} m³".format(round(float(avg_value),2))
                # max_str = "{} m³ ({}:00)".format(round(float(max_value),2),max_date[-2:])
                # min_str = "{} m³ ({}:00)".format(round(float(min_value),2),min_date[-2:])

                      
    
    
    # fh_today = flowdata_hour[:] #[flowdata_hour[k] for k in flowdata_hour]

    pressdata_hour = station.press_Data(startTime,endTime)
    press_today = [pressdata_hour[k] for k in pressdata_hour]
    # print("press_today",press_today)
    pree_time = [k[11:] for k in pressdata_hour]

    

    

    hdates = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','00']
    
    # today_flow data
    # for d_flow in days_flows:
    #     fdates = [k for k in d_flow]
    #     flows = [d_flow[k] for k in d_flow]
    #     for i in range(len(flows)):
    #         data.append({
    #             "hdate":fdates[i],
    #             "flow":flows[i],
    #             "assignmentName":station.username,
    #             "color":"红色",
    #             "ratio":"null"
                
    #             })
    #pressure data
    p_data = []
    # for i in range(len(press_today)):
    #     p_data.append({
    #         "hdate":pree_time[i],
    #         "press":press_today[i],
    #         "assignmentName":station.username,
    #         "color":"green",
    #         "ratio":"null"
            
    #         })

    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                "flow_data":data, #reverse
                "flowdata_daylist":flowdata_daylist,#json.dumps(flowdata_daylist),
                "xishu_daylist":xishu_daylist,
                "hdate":['2018-10-31 01' , '2018-10-31 02' , '2018-10-31 03' , '2018-10-31 04' , '2018-10-31 05' , '2018-10-31 06' , '2018-10-31 07' , '2018-10-31 08' , '2018-10-31 09' , '2018-10-31 10' , '2018-10-31 11' , '2018-10-31 12' , '2018-10-31 13' , '2018-10-31 14' , '2018-10-31 15' , '2018-10-31 16' , '2018-10-31 17' , '2018-10-31 18' , '2018-10-31 19' , '2018-10-31 20', '2018-10-31 21' , '2018-10-31 22' , '2018-10-31 23' , '2018-10-31 24'],
                "pressure":p_data,
                "today_use":today_use,
                "yestoday_use":yestoday_use,
                "before_yestoday_use":before_yestoday_use,
                "maxflow":maxflow,
                "minflow":minflow,
                "average":average

            },
            "success":1}

    
    
    return HttpResponse(json.dumps(ret))


#日用水分析        
class MonthUseView(TemplateView):
    template_name = "analysis/monthuse.html"

    def get_context_data(self, *args, **kwargs):
        context = super(MonthUseView, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "数据分析"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "月用水分析"

        # station_name = ""
        # organ = ""
        # stations = self.request.user.station_list_queryset('')
        # station = stations.first()
        # if station:
        #     station_name = station.username
        #     organ = station.belongto.name
        #     station_id = station.pk
        #     context["station_id"] = station_id 
        # else:
        #     context["station_id"] = Station.objects.first().pk 
        # context["station"] = station_name
        # context["organ"] = organ
        

        return context      


def flowdata_monthuse(request):
    print("flowdata_monthuse:",request.POST)

    stationid = request.POST.get("station_id") # DMABaseinfo pk
    month = request.POST.get("month")
    station = Station.objects.get(pk=int(stationid))

    month_data1 = {}
    month_data2 = {}
    month_data3 = {}
    history_data = {}

    

    today = datetime.date.today()
    today_str = today.strftime("%Y-%m-%d")
    w=today.weekday()
    yestmonth = today - datetime.timedelta(days=28+w)
    yestoday_str = yestmonth.strftime("%Y-%m-%d")
    

    # startTime = yestmonth
    # endTime = today
    startTime = today - datetime.timedelta(days=21+w)
    endTime = today + datetime.timedelta(days=6-w)

    # pressure data
    pressdata_hour = station.press_Data(startTime,endTime)
    press_today = [pressdata_hour[k] for k in pressdata_hour]
    # print("press_today",press_today)
    pree_time = [k[11:] for k in pressdata_hour]

    #history
    lastyear_start = datetime.datetime(year=yestmonth.year-1,month=yestmonth.month,day=yestmonth.day)
    lastyear_end = datetime.datetime(year=today.year-1,month=today.month,day=today.day)
    history_data = station.flowData_Day(lastyear_start,lastyear_end)
    
    # startTime = "2018-08-04 23:59:59"
    # endTime = "2018-08-05 23:59:59"
    if month == "1":
        month_data1 = station.flowData_Day(startTime,endTime)
    

    if month == "2":
        month_data1 = station.flowData_Day(startTime,endTime)
        llastmonth = yestmonth - datetime.timedelta(days=28+w)
        startTime = llastmonth
        endTime = yestmonth
        month_data2 = station.flowData_Day(startTime,endTime)

    if month == "3":
        month_data1 = station.flowData_Day(startTime,endTime)

        llastmonth = yestmonth - datetime.timedelta(days=28+w)
        startTime = llastmonth
        endTime = yestmonth
        month_data2 = station.flowData_Day(startTime,endTime)

        blastmonth = llastmonth - datetime.timedelta(days=28+w)
        startTime = blastmonth
        endTime = llastmonth
        month_data3 = station.flowData_Day(startTime,endTime)
    
    

    
    
    #current moth
    data1 = []
    if len(month_data1) > 0:
        dates1 = [k for k in month_data1]
        flow_data1 = [month_data1[k] for k in month_data1]
        for i in range(len(flow_data1)):
            data1.append({
                "hdate":dates1[i],
                "flow":flow_data1[i],
                "assignmentName":station.username,
                "color":"红色",
                "ratio":"null",
                })

    #last month
    data2 = []
    if len(month_data2) > 0:
        dates2 = [k for k in month_data2]
        flow_data2 = [month_data2[k] for k in month_data2]
        for i in range(len(flow_data2)):
            data2.append({
                "hdate":dates2[i],
                "flow":flow_data2[i],
                "assignmentName":station.username,
                "color":"黄色",
                "ratio":"null",
                })

    #last month
    data3 = []
    if len(month_data3) > 0:
        dates3 = [k for k in month_data3]
        flow_data3 = [month_data3[k] for k in month_data3]
        for i in range(len(flow_data3)):
            data3.append({
                "hdate":dates3[i],
                "flow":flow_data3[i],
                "assignmentName":station.username,
                "color":"蓝色",
                "ratio":"null",
                })

    #history last year month
    data4 = []
    if len(history_data) > 0:
        dates4 = [k for k in history_data]
        flow_data4 = [history_data[k] for k in history_data]
        for i in range(len(history_data)):
            data4.append({
                "hdate":dates4[i],
                "flow":flow_data4[i],
                "assignmentName":station.username,
                "color":"蓝色",
                "ratio":"null",
                })

    #pressure data
    hdates = [k for k in month_data1]
    print(hdates)
    p_data = []
    for i in range(len(hdates)):
        p_data.append({
            "hdate":hdates[i],
            "press":"-",
            "assignmentName":station.username,
            "color":"green",
            "ratio":"null"
            
            })

    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                "current_month":data1, #reverse
                "last_month":data2, #reverse
                "before_last_month":data3, #reverse
                "history":data4,
                "pressure":p_data,
                
            },
            "success":1}

    
    
    return HttpResponse(json.dumps(ret))



def flowdata_dailyuse_compare(request):
    print("flowdata_dailyuse_compare:",request.POST)

    stationid = request.POST.get("station_id") # DMABaseinfo pk
    month = request.POST.get("month")
    station = Station.objects.get(pk=int(stationid))

    month_data1 = {}
    month_data2 = {}
    month_data3 = {}
    history_data = {}

    

    today = datetime.date.today()
    today_str = today.strftime("%Y-%m-%d")
    
    yestmonth = today - datetime.timedelta(days=28)
    yestoday_str = yestmonth.strftime("%Y-%m-%d")
    

    # startTime = yestmonth
    # endTime = today
    startTime = today - datetime.timedelta(days=28)
    endTime = today

    
    # startTime = "2018-08-04 23:59:59"
    # endTime = "2018-08-05 23:59:59"
    if month == "1":
        month_data1 = station.flowData_Day(startTime,endTime)
    
    
    #current moth
    data1 = []
    if len(month_data1) > 0:
        dates1 = [k for k in month_data1]
        flow_data1 = [month_data1[k] for k in month_data1]
        for i in range(len(flow_data1)):
            data1.append({
                "hdate":dates1[i],
                "flow":flow_data1[i],
                "assignmentName":station.username,
                "color":"红色",
                "ratio":"null",
                })

    

    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                "current_month":data1, #reverse
                
                
            },
            "success":1}

    
    
    return HttpResponse(json.dumps(ret))



class HistoryDataView(TemplateView):
    template_name = "analysis/historydata.html"

    def get_context_data(self, *args, **kwargs):
        context = super(HistoryDataView, self).get_context_data(*args, **kwargs)
        context["page_menu"] = "数据监控"
        # context["page_submenu"] = "组织和用户管理"
        context["page_title"] = "历史数据"

        

        return context      


def historydatalist(request):
    stationid = request.POST.get("station_id") or "1" # DMABaseinfo pk
    treetype = request.POST.get("treetype")
    startTime = request.POST.get("startTime")
    endTime = request.POST.get("endTime")

    print('historydaaaaa list',startTime,endTime,stationid)
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

    
    
    data = []

    # for m in stations[start:start+length]:
    #     data.append(m.historydata(startTime,endTime))

    station  = Station.objects.get(id=int(stationid))

    data = station.historydata(startTime,endTime)

    recordsTotal = len(data)
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

    print(draw,pageSize,recordsTotal/pageSize,recordsTotal)
    
    return HttpResponse(json.dumps(result))



class FlownalysView(LoginRequiredMixin,TemplateView):
    template_name = "analysis/flownalys.html"

    def get_context_data(self, *args, **kwargs):
        context = super(FlownalysView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "流量分析"
        context["page_menu"] = "数据分析"
        
        return context  

class ComparenalysView(LoginRequiredMixin,TemplateView):
    template_name = "analysis/comparenalys.html"

    def get_context_data(self, *args, **kwargs):
        context = super(ComparenalysView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "对比分析"
        context["page_menu"] = "数据分析"
        
        return context  


class PeibiaoView(LoginRequiredMixin,TemplateView):
    template_name = "analysis/peibiao.html"

    def get_context_data(self, *args, **kwargs):
        context = super(PeibiaoView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "配表分析"
        context["page_menu"] = "数据分析"
        
        return context  