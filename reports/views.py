# -*- coding: utf-8 -*-

import json
import random
import datetime
import time 

from django.shortcuts import render
from django.views.generic import TemplateView, ListView, DetailView, CreateView, UpdateView,DeleteView,FormView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.mixins import PermissionRequiredMixin,UserPassesTestMixin
from django.http import HttpResponse,JsonResponse,HttpResponseRedirect

from core.mixins import AjaxableResponseMixin

from accounts.models import User,MyRoles,LoginRecord
from amrs.models import (District,Bigmeter,HdbFlowData,HdbFlowDataDay,HdbFlowDataMonth,HdbPressureData,HdbWatermeterDay,
                            HdbWatermeterMonth,Concentrator,Watermeter,Alarm)
from django.db import connection

from amrs.utils import generat_year_month_from,generat_year_month,ZERO_monthly_dict
from django.db.models import Avg, Max, Min, Sum,Count
from django.utils.encoding import escape_uri_path
from . resources import HdbFlowDataResource
import monthdelta

from core.models import (
    Organization,
    DMABaseinfo,DmaStation,Station,Meter
)


# Create your views here.

class QuerylogView(LoginRequiredMixin,TemplateView):
    template_name = "reports/querylog.html"

    def get_context_data(self, *args, **kwargs):
        context = super(QuerylogView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "日志查询"
        context["page_menu"] = "统计报表"
        
        return context  

# 日志查询页面日志列表内容
def querylogdata(request):
    
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
        search_user = request.GET.get("search_user","")
        

    if request.method == "POST":
        draw = int(request.POST.get("draw", 1))
        length = int(request.POST.get("length", 10))
        start = int(request.POST.get("start", 0))
        pageSize = int(request.POST.get("pageSize", 10))
        search_value = request.POST.get("search[value]", None)
        order_column = int(request.POST.get("order[0][column]", None))
        order = request.POST.get("order[0][dir]", None)
        search_user = request.POST.get("search_user","")
        
        sTime = request.POST.get("startTime") #or '2018-10-31 00:00:00'
        eTime = request.POST.get("endTime") #or '2018-11-01 23:59:59'
        
    
    print("querylog request suer",request.user,type(request.user))
    user = request.user
    organs = user.belongto
    print(search_user,sTime,eTime)
    # commaddr = '13470906292'
    # sTime = '2015-09-20'
    # eTime = '2015-09-21'
    
    # logs = LoginRecord.objects.values("signin_time","user__user_name","belongto__name","ip","description","log_from")
    logs = request.user.logrecord_list_queryset(search_user,sTime,eTime).order_by("-signin_time").values("signin_time","user__user_name","belongto__name","ip","description","log_from")
    print("\r\n\r\n logs ???????????????\r\n")
    def log_record(b):
        
        return {
            # "stationname":s[1],
            "signin_time":b["signin_time"].strftime("%Y-%m-%d %H:%M:%S") ,
            "user":b["user__user_name"],
            "belongto":b["belongto__name"],
            "ip":b["ip"],
            "description":b["description"],
            "log_from":b["log_from"],
            
            
        }

    data = []

    for b in logs:  #[start:start+length]
        
        ret=log_record(b)
        
        if ret is not None:
            data.append(ret)

    
        
    
    
    
    
    recordsTotal = logs.count()
    # recordsTotal = bgms.count()
    
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

    # print(draw,pageSize,recordsTotal/pageSize,recordsTotal)
    
    return HttpResponse(json.dumps(result))


class AlarmView(LoginRequiredMixin,TemplateView):
    template_name = "reports/alarm.html"

    def get_context_data(self, *args, **kwargs):
        context = super(AlarmView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "报警报表"
        context["page_menu"] = "统计报表"
        
        return context  

class BiguserView(LoginRequiredMixin,TemplateView):
    template_name = "reports/biguser.html"

    def get_context_data(self, *args, **kwargs):
        context = super(BiguserView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "大用户报表"
        context["page_menu"] = "统计报表"
        
        return context  

class DmastaticsView(LoginRequiredMixin,TemplateView):
    template_name = "reports/dmastatics.html"

    def get_context_data(self, *args, **kwargs):
        context = super(DmastaticsView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "DMA报表"
        context["page_menu"] = "统计报表"

        # bigmeter = Bigmeter.objects.first()
        # context["station"] = bigmeter.username
        # context["organ"] = "歙县自来水公司"
        
        return context  


def dmareport(request):
    print("dmareport:",request.POST)

    stationid = request.POST.get("station") or '' # DMABaseinfo pk
    endTime = request.POST.get("endTime") or ''
    treetype = request.POST.get("treetype") or ''

    today = datetime.date.today()
    endTime = today.strftime("%Y-%m")
    
    lastyear = datetime.datetime(year=today.year-1,month=today.month,day=today.day)
    startTime = lastyear.strftime("%Y-%m")

    data = []
    sub_dma_list = []
    
    # echart_data = {}
    # def month_year_iter( start_month, start_year, end_month, end_year ):
    #     ym_start= 12*start_year + start_month
    #     ym_end= 12*end_year + end_month
    #     for ym in range( ym_start, ym_end ):
    #         y, m = divmod( ym, 12 )
    #         # yield y, m+1
    #         yield '{}-{:02d}'.format(y,m+1)

    # month_list = list(month_year_iter(lastyear.month,lastyear.year,today.month,today.year))
    # # print(month_list)
    # for m in month_list:
    #     # print (m)
    #     if m not in echart_data.keys():
    #         echart_data[m] = 0
    
    # hdates = [f[-2:] for f in echart_data.keys()]
    # hdates = hdates[::-1]
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
    total_outflux      = 0
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

    month_list = generat_year_month()
    hdates = [f[-2:] for f in month_list]
    total_monthly_in = ZERO_monthly_dict(month_list)
    total_monthly_out = ZERO_monthly_dict(month_list)
    total_monthly_sale = ZERO_monthly_dict(month_list)
    total_monthly_uncount = ZERO_monthly_dict(month_list)

    def same_dict_value_add(dict1,dict2):
        ret = {}
        for k in dict1.keys():
            ret[k] = dict1[k] + dict2[k]
        return ret
    
    for dma in dmas:
        
        # dma = dmas.first()
        # dmareport = dma.dma_statistic(month_list)
        dmareport = dma.dma_statistic2(month_list)
        
        water_in = dmareport['water_in']
        water_out = dmareport['water_out']
        water_sale = dmareport['water_sale']
        water_uncount = dmareport['water_uncount']
        monthly_in = dmareport['monthly_in']    #进水表每月流量
        monthly_out = dmareport['monthly_out']  #出水表每月流量
        monthly_sale = dmareport['monthly_sale']  #贸易结算表每月流量
        monthly_uncount = dmareport['monthly_uncount'] #未计费水表每月流量

        total_monthly_in = same_dict_value_add(total_monthly_in,monthly_in)
        total_monthly_out = same_dict_value_add(total_monthly_out,monthly_out)
        total_monthly_sale = same_dict_value_add(total_monthly_sale,monthly_sale)
        total_monthly_uncount = same_dict_value_add(total_monthly_uncount,monthly_uncount)
        

        if len(monthly_in) == 0:
            monthly_in_flow = [0 for i in range(12)]
        else:
            monthly_in_flow = [monthly_in[k] for k in monthly_in.keys()]
        if len(monthly_out) == 0:
            monthly_out_flow = [0 for i in range(12)]
        else:
            monthly_out_flow = [monthly_out[k] for k in monthly_out.keys()]
        # 供水量  （分区内部进水表要减去自己内部出水表才等于这个分区的供水量）
        monthly_water = [monthly_in_flow[i]-monthly_out_flow[i] for i in range(len(monthly_in_flow))]
        # 售水量
        if len(monthly_sale) == 0:
            monthly_sale_flow = [0 for i in range(12)]
        else:
            monthly_sale_flow = [monthly_sale[k] for k in monthly_sale.keys()]
        # 未计费水量
        if len(monthly_uncount) == 0:
            monthly_uncount_flow = [0 for i in range(12)]
        else:
            monthly_uncount_flow =[monthly_uncount[k] for k in monthly_uncount.keys()]


        # 漏损量 = 供水量-售水量-未计费水量
        monthly_leak_flow = [monthly_water[i]-monthly_sale_flow[i]-monthly_uncount_flow[i] for i in range(len(monthly_water))]
        
        
        influx = sum(monthly_in_flow)   #进水总量
        influx /=10000
        outflux = sum(monthly_out_flow) #出水总量
        outflux /=10000
        total = influx - outflux    #供水量
        # total /= 10000
        sale = sum(monthly_sale_flow)   #售水量
        sale /= 10000
        uncharg = sum(monthly_uncount_flow) #未计费水量
        uncharg /=10000
        leak = sum(monthly_leak_flow)   #漏损量
        leak /=10000
        
        
        cxc = total - sale  #产销差 = 供水量-售水量
        #产销差率 = （供水量-售水量）/月供水量*100%
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
        total_outflux += outflux
        total_total += total
        total_leak += leak
        total_uncharg += uncharg
        total_sale += sale
        total_cxc += cxc
        # print('total_influx',total_influx,water_in)
        # print('total_outflux',total_outflux,water_out)
        # print('total_total',total_total)
        # print('total_leak',total_leak)
        # print('total_uncharg',total_uncharg,water_uncount)
        # print('total_sale',total_sale,water_sale)
        # print('total_cxc',total_cxc)
        
        # dma 每个月统计
        if treetype == "dma":
            for m in month_list:
                m_in = monthly_in[m]/10000
                m_out = monthly_out[m]/10000
                m_sale = monthly_sale[m]/10000
                m_uncount = monthly_uncount[m]/10000
                m_total = m_in - m_out #供水量=进水总量-出水总量
                m_leak= m_total - m_sale - m_uncount # 漏损量 = 供水量-售水量-未计费水量
                if m_leak < 0:
                    m_leak = 0
                m_cxc = m_total - m_sale    #产销差 = 供水量-售水量
                if m_total == 0:
                    m_cxc_percent = 0
                else:
                    m_cxc_percent = (m_cxc/m_total) * 100     #产销差率 = （供水量-售水量）/供水量*100%

                if m_total != 0 :
                    m_leak_percent = (m_leak * 100)/m_total
                else:
                    m_leak_percent = 0

                sub_dma_list.append({
                    "organ":dma.dma_name,
                    # "influx":round(influx,2),
                    "total":round(m_total,2),#供水量
                    "sale":round(m_sale,2),#售水量
                    "uncharg":round(m_uncount,2),#未计费水量
                    "leak":round(m_leak,2),#漏损量
                    "cxc":round(m_cxc,2),#产销差 = 供水量-售水量
                    "cxc_percent":round(m_cxc_percent,2),#产销差率
                    "huanbi":round(huanbi,2),
                    "leak_percent":round(m_leak_percent,2),
                    "tongbi":round(tongbi,2),
                    "mnf":round(mnf,2),
                    "back_leak":round(back_leak,2),
                    "other_leak":round(other_leak,2),
                    "statis_date":m,
                })
        else:
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
    
    
        

    # 产销差 = （供水量-售水量）/月供水量*100%     
    # echart data filling
    total_monthly_in_flow = [total_monthly_in[k] for k in total_monthly_in.keys()]
    total_monthly_out_flow = [total_monthly_out[k] for k in total_monthly_out.keys()]
    total_monthly_sale_flow = [total_monthly_sale[k] for k in total_monthly_sale.keys()]
    total_monthly_uncount_flow = [total_monthly_uncount[k] for k in total_monthly_uncount.keys()]

    total_monthly_water = [total_monthly_in_flow[i]-total_monthly_out_flow[i] for i in range(len(total_monthly_in_flow))]
    total_monthly_leak_flow = [total_monthly_water[i]-total_monthly_sale_flow[i]-total_monthly_uncount_flow[i] for i in range(len(total_monthly_water))]

    dma_name = '歙县自来水公司'
    for i in range(len(monthly_in_flow)):
        cp = 0
        if monthly_water[i] != 0:
            cp = (total_monthly_water[i] - total_monthly_sale_flow[i])/total_monthly_water[i] *100
            if cp < 0:
                cp = 0
        data.append({
            "hdate":hdates[i],
            "dosage":total_monthly_sale_flow[i]/10000,
            "assignmentName":dma_name,
            "color":"红色",
            "ratio":"null",
            "leak":total_monthly_leak_flow[i]/10000,
            "uncharged":total_monthly_uncount_flow[i]/10000,
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
                "outflux":round(total_outflux,2),
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
                "stationsstastic":sub_dma_list[::-1]

            },
            "success":1}

    
    
    return HttpResponse(json.dumps(ret))


class WenxinyuanView(TemplateView):
    template_name = "reports/wenxinyuan.html"

    def get_context_data(self, *args, **kwargs):
        context = super(WenxinyuanView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "DMA报表"
        context["page_menu"] = "统计报表"

        bigmeter = Bigmeter.objects.first()
        context["station"] = bigmeter.username
        context["organ"] = "歙县自来水公司"
        
        return context  

class FlowsView(LoginRequiredMixin,TemplateView):
    template_name = "reports/flows.html"

    def get_context_data(self, *args, **kwargs):
        context = super(FlowsView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "历史数据"
        context["page_menu"] = "统计报表"

        bigmeter = Bigmeter.objects.first()
        user = self.request.user
        # station = user.station_list_queryset('').first()
        # context["station"] = station.username
        # context["commaddr"] = station.commaddr
        # context["organ"] = "歙县自来水公司"
        
        return context  

# 返回历史数据页面站点历史数据
def stationhistorylist(request):
    
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
        groupType = request.GET.get("groupType")
        groupName = request.GET.get("groupName")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        sTime = request.GET.get("startTime") #or '2018-10-31 00:00:00'
        eTime = request.GET.get("endTime") #or '2018-11-01 23:59:59'
        commaddr = request.GET.get("commaddr") or '064893856864'

    if request.method == "POST":
        draw = int(request.POST.get("draw", 1))
        length = int(request.POST.get("length", 10))
        start = int(request.POST.get("start", 0))
        pageSize = int(request.POST.get("pageSize", 10))
        search_value = request.POST.get("search[value]", None)
        order_column = int(request.POST.get("order[0][column]", None))
        order = request.POST.get("order[0][dir]", None)
        groupName = request.POST.get("groupName")
        groupType = request.POST.get("groupType")
        districtId = request.POST.get("districtId")
        simpleQueryParam = request.POST.get("simpleQueryParam")
        sTime = request.POST.get("startTime") #or '2018-10-31 00:00:00'
        eTime = request.POST.get("endTime") #or '2018-11-01 23:59:59'
        commaddr = request.POST.get("commaddr") or '064893856864'
    
    
    user = request.user
    organs = user.belongto
    print(commaddr,sTime,eTime)
    # commaddr = '13470906292'
    # sTime = '2015-09-20'
    # eTime = '2015-09-21'

    try:
        bmeter = Bigmeter.objects.get(commaddr=commaddr)
        meterv = bmeter.meterv
        gprsv = bmeter.gprsv
        signlen = bmeter.signlen
    except:
        meterv = ''
        gprsv = ''
        signlen = ''

    
    flows = HdbFlowData.objects.filter(commaddr=commaddr,readtime__range=[sTime,eTime]).values()
    press = HdbPressureData.objects.filter(commaddr=commaddr,readtime__range=[sTime,eTime]).values_list("readtime","pressure")
    press_dict = dict(press)
    
    # bgm = Bigmeter.objects.filter(commaddr=commaddr).values_list("commaddr","signlen")
    # bgm_dict = dict(bgm)
    
    def flows_data(b):
        readtime = b["readtime"]
        p = ''
        if readtime in press_dict.keys():
            p = press_dict[readtime]
        # if commaddr in bgm_dict.keys():
        #     signlen = bgm_dict[commaddr]
        return {
            # "stationname":s[1],
            "readtime":readtime ,
            "flux":round(float(b["flux"]),2) if b["flux"] else '',
            "plustotalflux":round(float(b["plustotalflux"]),2)  if b["plustotalflux"] else '',
            "reversetotalflux":round(float(b["reversetotalflux"]),2) if b["reversetotalflux"] else '',
            "pressure":p,
            "meterv":meterv,
            "gprsv":gprsv,
            "signlen":signlen, #signlen
            
        }

    data = []
    if groupType == "pressure":
        # add pressure
        pressures = HdbPressureData.objects.filter(commaddr=commaddr,readtime__range=[sTime,eTime]).values().order_by('-readtime')
        for p in pressures:
            data.append({
                'readtime':p["readtime"],
                'press':p["pressure"],
                'influx':'-',
                'plusflux':'-',
                'revertflux':'-',
                'baseelectricity':p["gprsv"],
                'remoteelectricity':p["meterv"],
                'signal':'-',
                })
        recordsTotal = pressures.count()

    else:
        for b in flows:  #[start:start+length]
            
            ret=flows_data(b)
            
            if ret is not None:
                data.append(ret)

    
        
    
    
    
    
        recordsTotal = flows.count()
    # recordsTotal = bgms.count()
    
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

    # print(draw,pageSize,recordsTotal/pageSize,recordsTotal)
    
    return HttpResponse(json.dumps(result))


def historydataexport(request):
    commaddr = request.GET.get("commaddr") or '064893856864'
    sTime = request.GET.get("startTime") or '2018-10-31 00:00:00'
    eTime = request.GET.get("endTime") or '2018-11-01 23:59:59'
    print(commaddr,sTime,eTime)
    flows = HdbFlowData.objects.filter(commaddr=commaddr,readtime__range=[sTime,eTime])
    user_resource = HdbFlowDataResource()
    # f= HdbFlowData.objects.filter(commaddr='064811210332',readtime__range=['2018-10-31 00:00:00','2018-10-31 23:59:59'])
    user_query_set = flows #request.user.user_list_queryset()
    dataset = user_resource.export(user_query_set)
    response = HttpResponse(dataset.xls, content_type='text/xls')
    response['Content-Disposition'] = 'attachment; filename='+ escape_uri_path("导出历史数据.xls")
    
    return response

class WatersView(LoginRequiredMixin,TemplateView):
    template_name = "reports/waters.html"

    def get_context_data(self, *args, **kwargs):
        context = super(WatersView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "水量报表"
        context["page_menu"] = "统计报表"
        
        return context  

class BiaowuView(LoginRequiredMixin,TemplateView):
    template_name = "reports/biaowu.html"

    def get_context_data(self, *args, **kwargs):
        context = super(BiaowuView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "表务表况综合统计"
        context["page_menu"] = "统计报表"
        
        return context  

class VehicleView(LoginRequiredMixin,TemplateView):
    template_name = "reports/vehicle.html"

    def get_context_data(self, *args, **kwargs):
        context = super(VehicleView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "车辆报表"
        context["page_menu"] = "统计报表"
        
        return context  

class BigdataView(LoginRequiredMixin,TemplateView):
    template_name = "reports/bigdata.html"

    def get_context_data(self, *args, **kwargs):
        context = super(BigdataView, self).get_context_data(*args, **kwargs)
        context["page_title"] = "大数据报表"
        context["page_menu"] = "统计报表"
        
        return context  


# 大数据报表详细数据
def bigDataReport(request):
    print("bigDataReport:",request)

    dma_no = request.POST.get("dma_no") or '' # DMABaseinfo pk
    endTime = request.POST.get("endTime") or ''
    treetype = request.POST.get("treetype") or ''

    today = datetime.date.today()
    endTime = today.strftime("%Y-%m")
    
    lastyear = datetime.datetime(year=today.year-1,month=today.month,day=today.day)
    startTime = lastyear.strftime("%Y-%m")

    data = []
    sub_dma_list = []
    
    
    dmas = DMABaseinfo.objects.filter(dma_no=dma_no)
        
    
    print('dmas:',dmas)

    

    total_influx       = 0
    total_outflux      = 0
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

    month_list = generat_year_month()
    hdates = [f[-2:] for f in month_list]
    total_monthly_in = ZERO_monthly_dict(month_list)
    total_monthly_out = ZERO_monthly_dict(month_list)
    total_monthly_sale = ZERO_monthly_dict(month_list)
    total_monthly_uncount = ZERO_monthly_dict(month_list)

    def same_dict_value_add(dict1,dict2):
        ret = {}
        for k in dict1.keys():
            ret[k] = dict1[k] + dict2[k]
        return ret
    
    for dma in dmas:
        
        # dma = dmas.first()
        # dmareport = dma.dma_statistic(month_list)
        dmareport = dma.dma_statistic2(month_list)
        
        water_in = dmareport['water_in']
        water_out = dmareport['water_out']
        water_sale = dmareport['water_sale']
        water_uncount = dmareport['water_uncount']
        monthly_in = dmareport['monthly_in']    #进水表每月流量
        monthly_out = dmareport['monthly_out']  #出水表每月流量
        monthly_sale = dmareport['monthly_sale']  #贸易结算表每月流量
        monthly_uncount = dmareport['monthly_uncount'] #未计费水表每月流量

        total_monthly_in = same_dict_value_add(total_monthly_in,monthly_in)
        total_monthly_out = same_dict_value_add(total_monthly_out,monthly_out)
        total_monthly_sale = same_dict_value_add(total_monthly_sale,monthly_sale)
        total_monthly_uncount = same_dict_value_add(total_monthly_uncount,monthly_uncount)
        

        if len(monthly_in) == 0:
            monthly_in_flow = [0 for i in range(12)]
        else:
            monthly_in_flow = [monthly_in[k] for k in monthly_in.keys()]
        if len(monthly_out) == 0:
            monthly_out_flow = [0 for i in range(12)]
        else:
            monthly_out_flow = [monthly_out[k] for k in monthly_out.keys()]
        # 供水量  （分区内部进水表要减去自己内部出水表才等于这个分区的供水量）
        monthly_water = [monthly_in_flow[i]-monthly_out_flow[i] for i in range(len(monthly_in_flow))]
        # 售水量
        if len(monthly_sale) == 0:
            monthly_sale_flow = [0 for i in range(12)]
        else:
            monthly_sale_flow = [monthly_sale[k] for k in monthly_sale.keys()]
        # 未计费水量
        if len(monthly_uncount) == 0:
            monthly_uncount_flow = [0 for i in range(12)]
        else:
            monthly_uncount_flow =[monthly_uncount[k] for k in monthly_uncount.keys()]


        # 漏损量 = 供水量-售水量-未计费水量
        monthly_leak_flow = [monthly_water[i]-monthly_sale_flow[i]-monthly_uncount_flow[i] for i in range(len(monthly_water))]
        
        
        influx = sum(monthly_in_flow)   #进水总量
        influx /=10000
        outflux = sum(monthly_out_flow) #出水总量
        outflux /=10000
        total = influx - outflux    #供水量
        # total /= 10000
        sale = sum(monthly_sale_flow)   #售水量
        sale /= 10000
        uncharg = sum(monthly_uncount_flow) #未计费水量
        uncharg /=10000
        leak = sum(monthly_leak_flow)   #漏损量
        leak /=10000
        
        cxc = total - sale  #产销差 = 供水量-售水量
        #产销差率 = （供水量-售水量）/月供水量*100%
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
        total_outflux += outflux
        total_total += total
        total_leak += leak
        total_uncharg += uncharg
        total_sale += sale
        total_cxc += cxc
        # print('total_influx',total_influx,water_in)
        # print('total_outflux',total_outflux,water_out)
        # print('total_total',total_total)
        # print('total_leak',total_leak)
        # print('total_uncharg',total_uncharg,water_uncount)
        # print('total_sale',total_sale,water_sale)
        # print('total_cxc',total_cxc)
        
        # dma 每个月统计
        if treetype == "dma":
            for m in month_list:
                m_in = monthly_in[m]/10000
                m_out = monthly_out[m]/10000
                m_sale = monthly_sale[m]/10000
                m_uncount = monthly_uncount[m]/10000
                m_total = m_in - m_out #供水量=进水总量-出水总量
                m_leak= m_total - m_sale - m_uncount # 漏损量 = 供水量-售水量-未计费水量
                m_cxc = m_total - m_sale    #产销差 = 供水量-售水量
                if m_total == 0:
                    m_cxc_percent = 0
                else:
                    m_cxc_percent = (m_cxc/m_total) * 100     #产销差率 = （供水量-售水量）/供水量*100%

                if m_total != 0 :
                    m_leak_percent = (m_leak * 100)/m_total
                else:
                    m_leak_percent = 0

                sub_dma_list.append({
                    "organ":dma.dma_name,
                    # "influx":round(influx,2),
                    "total":round(m_total,2),#供水量
                    "sale":round(m_sale,2),#售水量
                    "uncharg":round(m_uncount,2),#未计费水量
                    "leak":round(m_leak,2),#漏损量
                    "cxc":round(m_cxc,2),#产销差 = 供水量-售水量
                    "cxc_percent":round(m_cxc_percent,2),#产销差率
                    "huanbi":round(huanbi,2),
                    "leak_percent":round(m_leak_percent,2),
                    "tongbi":round(tongbi,2),
                    "mnf":round(mnf,2),
                    "back_leak":round(back_leak,2),
                    "other_leak":round(other_leak,2),
                    "statis_date":m,
                })
        else:
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
    
    
        

    # 产销差 = （供水量-售水量）/月供水量*100%     
    # echart data filling
    total_monthly_in_flow = [total_monthly_in[k] for k in total_monthly_in.keys()]
    total_monthly_out_flow = [total_monthly_out[k] for k in total_monthly_out.keys()]
    total_monthly_sale_flow = [total_monthly_sale[k] for k in total_monthly_sale.keys()]
    total_monthly_uncount_flow = [total_monthly_uncount[k] for k in total_monthly_uncount.keys()]

    total_monthly_water = [total_monthly_in_flow[i]-total_monthly_out_flow[i] for i in range(len(total_monthly_in_flow))]
    total_monthly_leak_flow = [total_monthly_water[i]-total_monthly_sale_flow[i]-total_monthly_uncount_flow[i] for i in range(len(total_monthly_water))]

    dma_name = '歙县自来水公司'
    for i in range(len(monthly_in_flow)):
        cp = 0
        if monthly_water[i] != 0:
            cp = (total_monthly_water[i] - total_monthly_sale_flow[i])/total_monthly_water[i] *100
        data.append({
            "hdate":hdates[i],
            "dosage":total_monthly_sale_flow[i]/10000,
            "assignmentName":dma_name,
            "color":"红色",
            "ratio":"null",
            "leak":total_monthly_leak_flow[i]/10000,
            "uncharged":total_monthly_uncount_flow[i]/10000,
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
                "outflux":round(total_outflux,2),
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
                "stationsstastic":sub_dma_list[::-1]

            },
            "success":1}

    
    
    return HttpResponse(json.dumps(ret))


def biaowudata(request):
    '''
        报表管理 表务表况 ajax url
    '''
    user_stations = request.user.belongto.station_list_queryset('')
    commaddr_name = user_stations.values_list("meter__simid__simcardNumber","amrs_bigmeter__username")
    cname = dict(commaddr_name)
    # 故障排行 alarmtype=13
    fault_count = 0
    print('biaowudata:')
    t1 = time.time()
    # alams_sets = Alarm.objects.filter(alarmtype=13,commaddr__in=cname.keys()).exclude(commaddr="").values('commaddr').annotate(num_alrms=Count('id')).order_by('-num_alrms')[:5]
    print('1.:',time.time() - t1)
    # alarm_data = []
    # for ad in alams_sets:
    #     name = cname[ad['commaddr']]
    #     count = ad['num_alrms']
    #     alarm_data.append({
    #         'name':name,
    #         'count':count
    #         })
    #     fault_count += count

    # str_query = "SELECT `alarm`.`Id`, `alarm`.`CommAddr`, COUNT(`alarm`.`Id`) AS `num_alrms` FROM `zncb`.`alarm` WHERE (`alarm`.`AlarmType` = 13 AND NOT (`alarm`.`CommAddr` = ''  AND `alarm`.`CommAddr` IS NOT NULL)) GROUP BY `alarm`.`CommAddr` ORDER BY `num_alrms` DESC LIMIT 5"

    # with connection.cursor() as cursor:
    #     # cursor.execute("UPDATE bar SET foo = 1 WHERE baz = %s", [self.baz])
    #     cursor.execute(str_query)
    #     row = cursor.fetchall()

    #     for r in row:
    #         print(r)

    # cursor = connection.cursor()
    # cursor.execute("DECLARE gigantic_cursor BINARY CURSOR  FOR {}".format(str_query))
    # while True:
    #     cursor.execute(str_query)
    #     rows = cursor.fetchall()

    #     if not rows:
    #         break
    #     for row in rows():
    #         print(row)


    # qs = Alarm.objects.raw(str_query)
    # for q in qs:
    #     print(q)
    # print(qs,type(qs))
    fault_count= 6026
    alarm_data = [{'name': '老化0013', 'count': 2389}, {'name': '沅江可以删除-325', 'count': 1744}, {'name': '三市镇库房里', 'count': 1081}, {'name': '长寿-金坪中学', 'count': 540}, {'name': '601', 'count': 272}]

    # 口径统计
    dn_count = 0
    dn_sets = user_stations.values('meter__dn').annotate(num_dn=Count('id')).order_by('-num_dn')[:5]
    print('2.:',time.time() - t1)
    dn_data = []
    for dd in dn_sets:
        name = dd['meter__dn']
        count = dd['num_dn']
        dn_data.append({
            'name':name,
            'count':count
            })
        dn_count += count
    # 厂家统计 manufacturer
    manufacturer_count = 0
    manufacturer_sets = user_stations.values('meter__manufacturer').annotate(num_manufacturer=Count('id')).order_by('-meter__manufacturer')
    manufacturer_data = []
    for md in manufacturer_sets:
        name = md['meter__manufacturer']
        count = md['num_manufacturer']
        manufacturer_data.append({
            'name':name if name != None else "其他",
            'count':count
            })
    manufacturer_count = manufacturer_sets.count()

    # 类型统计
    metertype_count = 0
    metertype_sets = user_stations.values('meter__mtype').annotate(num_type=Count('id')).order_by('-meter__mtype')
    metertype_data = []
    for ud in metertype_sets:
        name = ud['meter__mtype']
        if name == "0":
            name = "电磁水表"
        elif name == "1":
            name = "超声水表"
        elif name == "2":
            name = "机械水表"
        elif name == "3":
            name = "插入电磁"
        else:
            name = "其他"
        count = ud['num_type']
        metertype_data.append({
            'name':name,
            'count':count
            })
        metertype_count = metertype_sets.count()
    # 使用年限
    # 用水性质
    usertype_count = 0
    usertype_sets = user_stations.values('amrs_bigmeter__usertype').annotate(num_type=Count('id')).order_by('-amrs_bigmeter__usertype')
    usertype_data = []
    for ud in usertype_sets:
        name = ud['amrs_bigmeter__usertype']
        count = ud['num_type']
        usertype_data.append({
            'name':name if name != None else "其他",
            'count':count
            })
        usertype_count += count
    # 排行榜
    today = datetime.date.today()
    month_str = today.strftime("%Y-%m")

    # 最大流量
    max_flows = HdbFlowDataMonth.objects.filter(commaddr__in=cname.keys()).filter(hdate__startswith=month_str).aggregate(Max('dosage'))
    try:
        mon_max_flow = max_flows["dosage__max"]
        max_commaddr = HdbFlowDataMonth.objects.filter(dosage=mon_max_flow).values("commaddr")[0]["commaddr"]
        max_flow_station = cname[max_commaddr]
    except:
        mon_max_flow = ""
        max_flow_station = ""
    # 最小流量
    min_flows = HdbFlowDataMonth.objects.filter(commaddr__in=cname.keys()).filter(hdate__startswith=month_str).aggregate(Min('dosage'))
    mon_min_flow = min_flows["dosage__min"]
    try:
        min_commaddr = HdbFlowDataMonth.objects.filter(dosage=mon_min_flow).values("commaddr")[0]["commaddr"]
        min_flow_station = cname[min_commaddr]
    except:
        min_flow_station = ""



    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                'fault_count':fault_count,
                'dn_count':dn_count,
                'manufacturer_count':manufacturer_count,
                'metertype_count':metertype_count,
                'usertype_count':usertype_count,
                'alarm_data':alarm_data,
                'dn_data':dn_data,
                'manufacturer_data':manufacturer_data,
                'metertype_data':metertype_data,
                'usertype_data':usertype_data,
                'mon_max_flow':mon_max_flow,
                'max_flow_station':max_flow_station,
                'mon_min_flow':mon_min_flow,
                'min_flow_station':min_flow_station,
            },
            "success":1}

    
    
    return HttpResponse(json.dumps(ret))

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

    meters = user.belongto.meter_list_queryset(simpleQueryParam).values("pk","serialnumber","simid__simcardNumber","version","dn",
        "metertype","belongto__name","mtype","manufacturer","protocol","R","q3","q1","check_cycle","state","station__username")
    # meters = Meter.objects.all()
    # flow_today
    today = datetime.date.today()
    yestoday = today - datetime.timedelta(days=1)

    b_yestoday =today - datetime.timedelta(days=2)
    today_str = today.strftime("%Y-%m-%d")
    yestoday_str = yestoday.strftime("%Y-%m-%d")
    b_yestoday_str = b_yestoday.strftime("%Y-%m-%d")

    


    month_str = today.strftime("%Y-%m")
    month_flow = HdbFlowDataMonth.objects.filter(hdate=month_str)
    
    yesmonth = datetime.date.today().replace(day=1) - datetime.timedelta(days=1)
    yesmonth_str = yesmonth.strftime("%Y-%m")
    lastmonth = yesmonth.replace(day=1) - datetime.timedelta(days=1)
    lastmonth_str = lastmonth.strftime("%Y-%m")
    

    def m_info(m):
        commaddr = m["simid__simcardNumber"]
        today_flow = HdbFlowDataDay.objects.filter(commaddr=commaddr,hdate__range=[b_yestoday_str,today_str]).values_list('hdate','dosage')
        lastmonth_flow = HdbFlowDataMonth.objects.filter(commaddr=commaddr,hdate__range=[lastmonth_str,month_str]).values_list('hdate','dosage')
        # print("today_flow",today_flow)
        flow_today = ''
        flow_yestoday = ''
        flow_b_yestoday = ''
        if today_flow.exists():
            flow_dict = dict(today_flow)
            if today_str in flow_dict.keys():
                flow_today = round(float(flow_dict[today_str]),2)
            if yestoday_str in flow_dict.keys():
                flow_yestoday = round(float(flow_dict[yestoday_str]),2)
            if b_yestoday_str in flow_dict.keys():
                flow_b_yestoday = round(float(flow_dict[b_yestoday_str]),2)

        flow_tomon = ''
        flow_yestomon = ''
        flow_b_yestomon = ''
        if lastmonth_flow.exists():
            mflow_dict = dict(lastmonth_flow)
            if month_str in mflow_dict.keys():
                flow_tomon = round(float(mflow_dict[month_str]),2)
            if yesmonth_str in mflow_dict.keys():
                flow_yestomon = round(float(mflow_dict[yesmonth_str]),2)
            if lastmonth_str in mflow_dict.keys():
                flow_b_yestomon = round(float(mflow_dict[lastmonth_str]),2)
            
            
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
            "station_name":m["station__username"],
            "station":m["station__username"],
            "flow_today":flow_today, 
            "flow_yestoday":flow_yestoday, 
            "flow_b_yestoday":flow_b_yestoday, 
            "flow_tomon":flow_tomon, 
            "flow_yestomon":flow_yestomon, 
            "flow_b_yestomon":flow_b_yestomon, 
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


# 大用户报表初始化页面数据
def biguserdata(request):
    user_stations = request.user.belongto.station_list_queryset('')
    # commaddr_name = user_stations.values_list("amrs_bigmeter__commaddr","username")
    # cname = dict(commaddr_name)
    # 大用户数量
    biguserCount = user_stations.filter(biguser=1).count()


    ret = {"exceptionDetailMsg":"null",
            "msg":"null",
            "obj":{
                'biguserCount':biguserCount,
                
            },
            "success":1}

    
    
    return HttpResponse(json.dumps(ret))

# 表具管理/表具列表 dataTable
def bigusermeterlist(request):
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

    user_stations = user.station_list_queryset('')
    commaddr_name = user_stations.filter(biguser=1).values_list("meter__simid__simcardNumber","username")
    cname = dict(commaddr_name)

    meters = user.meter_list_queryset(simpleQueryParam).filter(simid__simcardNumber__in=cname.keys()).values("pk","serialnumber","simid__simcardNumber","version","dn",
        "metertype","belongto__name","mtype","manufacturer","protocol","R","q3","q1","check_cycle","state","station__username")
    # meters = Meter.objects.all()
    # flow_today
    today = datetime.date.today()
    yestoday = today - datetime.timedelta(days=1)

    b_yestoday =today - datetime.timedelta(days=2)
    today_str = today.strftime("%Y-%m-%d")
    yestoday_str = yestoday.strftime("%Y-%m-%d")
    b_yestoday_str = b_yestoday.strftime("%Y-%m-%d")

    


    month_str = today.strftime("%Y-%m")
    month_flow = HdbFlowDataMonth.objects.filter(hdate=month_str)
    yesmonth = datetime.datetime.today()-monthdelta.monthdelta(1) #datetime.date.today().replace(day=1) - datetime.timedelta(days=1)
    yesmonth_str = yesmonth.strftime("%Y-%m")
    lastmonth = datetime.datetime.today()-monthdelta.monthdelta(2)
    lastmonth_str = lastmonth.strftime("%Y-%m")
    

    def m_info(m):
        commaddr = m["simid__simcardNumber"]
        today_flow = HdbFlowDataDay.objects.filter(commaddr=commaddr,hdate__range=[b_yestoday_str,today_str]).values_list('hdate','dosage')
        lastmonth_flow = HdbFlowDataMonth.objects.filter(commaddr=commaddr,hdate__range=[lastmonth_str,month_str]).values_list('hdate','dosage')
        # print("today_flow",today_flow)
        flow_today = ''
        flow_yestoday = ''
        flow_b_yestoday = ''
        if today_flow.exists():
            flow_dict = dict(today_flow)
            if today_str in flow_dict.keys():
                flow_today = round(float(flow_dict[today_str]),2)
            if yestoday_str in flow_dict.keys():
                flow_yestoday = round(float(flow_dict[yestoday_str]),2)
            if b_yestoday_str in flow_dict.keys():
                flow_b_yestoday = round(float(flow_dict[b_yestoday_str]),2)

        flow_tomon = ''
        flow_yestomon = ''
        flow_b_yestomon = ''
        if lastmonth_flow.exists():
            mflow_dict = dict(lastmonth_flow)
            if month_str in mflow_dict.keys():
                flow_tomon = round(float(mflow_dict[month_str]),2)
            if yesmonth_str in mflow_dict.keys():
                flow_yestomon = round(float(mflow_dict[yesmonth_str]),2)
            if lastmonth_str in mflow_dict.keys():
                flow_b_yestomon = round(float(mflow_dict[lastmonth_str]),2)
            
            
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
            "station_name":m["station__username"],
            "station":m["station__username"],
            "flow_today":flow_today, 
            "flow_yestoday":flow_yestoday, 
            "flow_b_yestoday":flow_b_yestoday, 
            "flow_tomon":flow_tomon, 
            "flow_yestomon":flow_yestomon, 
            "flow_b_yestomon":flow_b_yestomon, 
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

