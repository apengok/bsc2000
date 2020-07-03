# -*- coding: utf-8 -*-

from collections import OrderedDict

choicetreedict=OrderedDict()
choicetreedict["prodschedule"]={
        "name":"生产调度",
        "submenu":[{
            "factoryview":{"name":"厂区总览","url":"/prodschedule/factoryview/","sub":{"name":"可写"}},
            "hydromodel":{"name":"水力模型","url":"/prodschedule/hydromodel/","sub":{"name":"可写"}},
            
        }],
    }
choicetreedict["monitor"]={
        "name":"数据监控",
        "submenu":[{
            "mapstation":{"name":"站点地图","url":"/monitor/mapstation/","sub":{"name":"可写"}},
            "realcurlv":{"name":"实时曲线","url":"/monitor/realcurlv/","sub":{"name":"可写"}},
            "realtimedata":{"name":"实时数据","url":"/monitor/realtimedata/","sub":{"name":"可写"}},
            "vehicle":{"name":"车辆监控","url":"/monitor/vehicle/","sub":{"name":"可写"}},
            "vedio":{"name":"实时视频","url":"/monitor/vedio/","sub":{"name":"可写"}},
            "secondwater":{"name":"二次供水","url":"/monitor/secondwater/","sub":{"name":"可写"}},
            "mapmonitor":{"name":"DMA在线监控","url":"/monitor/mapmonitor/","sub":{"name":"可写"}},
            # "dmaonline":{"name":"DMA在线监控","url":"/monitor/dmaonline/","sub":{"name":"可写"}},
        }],
    }
choicetreedict["analysis"] = {
        "name":"数据分析",
        "submenu":[{
            "dailyuse":{"name":"日用水分析","url":"/analysis/dailyuse/","sub":{"name":"可写"}},
            "monthlyuse":{"name":"月用水分析","url":"/analysis/monthuse/","sub":{"name":"可写"}},
            "flownalys":{"name":"流量分析","url":"/analysis/flownalys/","sub":{"name":"可写"}},
            "comparenalys":{"name":"对比分析","url":"/analysis/comparenalys/","sub":{"name":"可写"}},
            "peibiao":{"name":"配表分析","url":"/analysis/peibiao/","sub":{"name":"可写"}},
            "dmacxc":{"name":"产销差分析","url":"/analysis/dmacxc/","sub":{"name":"可写"}},
            "mnf":{"name":"夜间小流分析","url":"/analysis/mnf/","sub":{"name":"可写"}},
        }],
    }
choicetreedict["alarm"] = {
        "name":"报警中心",
        "submenu":[{
            "stationalarm":{"name":"站点报警设置","url":"/alarm/stationalarm/","sub":{"name":"可写"}},
            "dmaalarm":{"name":"DMA报警设置","url":"/alarm/dmaalarm/","sub":{"name":"可写"}},
            "queryalarm":{"name":"报警查询","url":"/alarm/queryalarm/","sub":{"name":"可写"}},
        }],
    }

choicetreedict["baseanalys"] = {
        "name":"基准分析",
        "submenu":[{
            "dmaba":{"name":"DMA基准","url":"/baseanalys/dmaba/","sub":{"name":"可写"}},
            "mnfba":{"name":"MNF基准","url":"/baseanalys/mnfba/","sub":{"name":"可写"}},
            "dayuseba":{"name":"日用水基准","url":"/baseanalys/dayuseba/","sub":{"name":"可写"}},
        }],
    }

choicetreedict["gis"] = {
        "name":"GIS系统",
        "submenu":[{
            "pipelinequery":{"name":"管网查询","url":"/gis/pipelinequery/","sub":{"name":"可写"}},
            "pipelinestastic":{"name":"管网统计","url":"/gis/pipelinestastic/","sub":{"name":"可写"}},
            "pipelineanalys":{"name":"管网分析","url":"/gis/pipelineanalys/","sub":{"name":"可写"}},
            "pipelineimexport":{"name":"导入导出","url":"/gis/pipelineimexport/","sub":{"name":"可写"}},
            
        }],
    }

choicetreedict["entm"] = {
        "name":"企业管理",
        "submenu":[{
            "usermanager":{"name":"组织与用户","url":"/entm/usermanager/","sub":{"name":"可写"}},
            "rolemanager":{"name":"角色管理","url":"/entm/rolemanager/","sub":{"name":"可写"}},
        }],
    }
choicetreedict["devm"] = {
        "name":"设备管理",
        "submenu":[{
            "metermanager":{"name":"表具管理","url":"/devm/metermanager/","sub":{"name":"可写"}},
            "pressuremanager":{"name":"压力管理","url":"/devm/pressuremanager/","sub":{"name":"可写"}},
            "fireboltmanager":{"name":"消防栓管理","url":"/devm/fireboltmanager/","sub":{"name":"可写"}},
            "concentratormanager":{"name":"集中器管理","url":"/devm/concentratormanager/","sub":{"name":"可写"}},
            "simcardmanager":{"name":"SIM卡管理","url":"/devm/simcardmanager/","sub":{"name":"可写"}},
            "paramsmanager":{"name":"参数指令","url":"/devm/paramsmanager/","sub":{"name":"可写"}},
        }],
    }


choicetreedict["dmam"] = {
        "name":"基础管理",
        "submenu":[{
            "stationmanager":{"name":"站点管理","url":"/dmam/stationsmanager/","sub":{"name":"可写"}},
            "districtmanager":{"name":"DMA管理","url":"/dmam/districtmanager/","sub":{"name":"可写"}},
            "secondmanager":{"name":"二供管理","url":"/dmam/secondmanager/","sub":{"name":"可写"}},
            "vediomanager":{"name":"视频管理","url":"/dmam/vediomanager/","sub":{"name":"可写"}},
            "vehiclemanager":{"name":"车辆管理","url":"/dmam/vehiclemanager/","sub":{"name":"可写"}},
            "neighborhoodmanager":{"name":"小区管理","url":"/dmam/neighborhoodmanager/","sub":{"name":"可写"}},
        }],
    }

choicetreedict["wirelessm"] = {
        "name":"无线抄表",
        "submenu":[{
            "concentratormap":{"name":"抄表地图","url":"/wirelessm/concentratormap/","sub":{"name":"可写"}},
            "wlquerydata":{"name":"数据查询","url":"/wirelessm/wlquerydata/","sub":{"name":"可写"}},
            "neighborhoodusedayly":{"name":"小区日用水","url":"/wirelessm/neighborhoodusedayly/","sub":{"name":"可写"}},
            "neighborhoodusemonthly":{"name":"小区月用水","url":"/wirelessm/neighborhoodusemonthly/","sub":{"name":"可写"}},
            "neighborhoodmetermanager":{"name":"户表管理","url":"/wirelessm/neighborhoodmetermanager/","sub":{"name":"可写"}},
            "contentratordatastastic":{"name":"数据统计","url":"/wirelessm/contentratordatastastic/","sub":{"name":"可写"}},
            
        }],
    }

choicetreedict["reports"] = {
        "name":"统计报表",
        "submenu":[{
            "querylog":{"name":"日志查询","url":"/reports/querylog/","sub":{"name":"可写"}},
            "alarm":{"name":"报警报表","url":"/reports/alarm/","sub":{"name":"可写"}},
            "flows":{"name":"历史数据","url":"/reports/flows/","sub":{"name":"可写"}},
            "biaowu":{"name":"表务表况","url":"/reports/biaowu/","sub":{"name":"可写"}},
            "waters":{"name":"水量报表","url":"/reports/waters/","sub":{"name":"可写"}},
            "vehicle":{"name":"车辆报表","url":"/reports/vehicle/","sub":{"name":"可写"}},
            "biguser":{"name":"大用户报表","url":"/reports/biguser/","sub":{"name":"可写"}},
            "dmastatics":{"name":"DMA报表","url":"/reports/dmastatics/","sub":{"name":"可写"}},
            "bigdata":{"name":"大数据报表","url":"/reports/bigdata/","sub":{"name":"可写"}},
        }],
    }

choicetreedict["sysm"] = {
        "name":"系统管理",
        "submenu":[{
            "commconfig":{"name":"通讯管理","url":"/sysm/commconfig/","sub":{"name":"可写"}},
            "personalized":{"name":"平台个性化配置","url":"/sysm/personalized/list/","sub":{"name":"可写"}},
            "system":{"name":"系统设置","url":"/sysm/system/","sub":{"name":"可写"}},
            "retransit":{"name":"转发设置","url":"/sysm/retransit/","sub":{"name":"可写"}},
            "iconscfg":{"name":"图标配置","url":"/sysm/iconscfg/","sub":{"name":"可写"}},
        }],
    }



# 基本权限树 ，默认全部勾选
def buildbasetree():
    ctree = []
    

    for key in choicetreedict.keys():
        pname = choicetreedict[key]["name"]
        pid = key
        

        tmp1 = {}
        tmp1["name"] = pname
        tmp1["pId"] = 0
        tmp1["id"] = pid
        tmp1["checked"] = "true"
        
        ctree.append(tmp1)
        
        submenu = choicetreedict[key]["submenu"][0]
        for sub_key in submenu.keys():
            name = submenu[sub_key]["name"]
            idstr = "{id}_{pid}".format(id=sub_key,pid=pid)
            cid = pid

            tmp2 = {}
            tmp2["name"] = name
            tmp2["pId"] = cid
            tmp2["id"] = idstr
            tmp2["checked"] = "true"
            
            ctree.append(tmp2)

        
            
            #可写
            edit_id = "{pid}_edit".format(pid=idstr)
            tmp3 = {}
            tmp3["name"] = "可写"
            tmp3["pId"] = idstr
            tmp3["id"] = edit_id
            tmp3["type"] = "premissionEdit"
            tmp3["checked"] = "true"
            
            ctree.append(tmp3)

            

    return ctree    

def updateMenuPermission():
    from accounts.models import MyRoles
    try:
        MyRoles.objects.get(name='超级管理员')
    except:
        pass
