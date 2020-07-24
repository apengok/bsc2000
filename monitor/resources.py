# -*- coding:utf-8 -*-
from import_export import resources,fields

import datetime 
from entm import constant
from amrs.models import Bigmeter
from accounts.models import User,MyRoles
from core.models import (
    Organization,
    SimCard,
    VWatermeter,
    VCommunity,
    VConcentrator
)

#https://stackoverflow.com/questions/1108428/how-do-i-read-a-date-in-excel-format-in-python
def minimalist_xldate_as_datetime(xldate, datemode):
# datemode: 0 for 1900-based, 1 for 1904-based
    return (
        datetime.datetime(1899, 12, 30)
        + datetime.timedelta(days=xldate + 1462 * datemode)
        )
        
        
        
class BigmeterRTSelectResource(resources.ModelResource):
    '''
    数据监控 实际数据 导出
    序号 用户代码（收费编号） 表编号（水表表身编码） 站点名称 表读数 抄表时间 表状态（正常或离线）
    '''
    # seq           = fields.Field(column_name=u'序号', attribute="seq")
    userid           = fields.Field(column_name=u'用户代码(收费编号)', attribute="userid")
    serialnumber        = fields.Field(column_name=u'表编号(水表表身编码)', attribute="serialnumber")
    username         = fields.Field(column_name=u'站点名称', attribute="username")
    plustotalflux        = fields.Field(column_name=u'表读数', attribute="plustotalflux")
    fluxreadtime           = fields.Field(column_name=u'抄表时间', attribute="fluxreadtime")
    commstate            = fields.Field(column_name=u'表状态', attribute="commstate")
    

    class Meta:
        model = Bigmeter
        import_id_fields = ['useris']
        fields = ('userid','serialnumber', 'username','plustotalflux','fluxreadtime','commstate')
        # exclude = ('idstr')
        export_order = fields

    # def dehyrate_seq(self,instance):
    #     return 
    
    def dehydrate_commstate(self,instance):
        now = datetime.datetime.now()
        d7 = now - datetime.timedelta(days=7)
        try:
            dn = datetime.datetime.strptime(instance.fluxreadtime,"%Y-%m-%d %H:%M:%S")
            if d7 < dn:
                return '正常'
        except:

            return '离线'
        

    # def dehydrate_plustotalflux(self,instance):
    #     try:
    #         return int(round(float(instance.plustotalflux)))
    #     except Exception as e:
    #         print(e)
    #         return ''
