# -*- coding:utf-8 -*-
from import_export import resources,fields
from amrs.models import HdbFlowData,Bigmeter

from bsc2000.middleware import get_current_user
import datetime 




#https://stackoverflow.com/questions/1108428/how-do-i-read-a-date-in-excel-format-in-python
def minimalist_xldate_as_datetime(xldate, datemode):
# datemode: 0 for 1900-based, 1 for 1904-based
    return (
        datetime.datetime(1899, 12, 30)
        + datetime.timedelta(days=xldate + 1462 * datemode)
        )


class HdbFlowDataResource(resources.ModelResource):
    commaddr    = fields.Field(column_name=u'SIMCARD', attribute="commaddr")
    readtime    = fields.Field(column_name=u'采样时间', attribute="readtime")
    flux    = fields.Field(column_name=u'瞬时流量', attribute="flux")
    plustotalflux          = fields.Field(column_name=u'正向流量', attribute="plustotalflux")
    reversetotalflux = fields.Field(column_name=u'反向流量', attribute="reversetotalflux")
    meterv        = fields.Field(column_name=u'基表电量', attribute="meterv")
    gprsv    = fields.Field(column_name=u'远传电量', attribute="gprsv")
    # siglen  = fields.Field(column_name=u'信号强度', attribute="siglen")
    
    


    class Meta:
        model = HdbFlowData
        import_id_fields = ['user_name']
        fields = ('commaddr','readtime', 'flux', 'plustotalflux','reversetotalflux','meterv','gprsv')
        # exclude = ('idstr')
        export_order = fields


    # def dehydrate_sex(self,user):
    #     # print('dehydrate_sex:',user.sex)
    #     # #export
    #     # if user.sex == '1':
    #     #     return '男'
    #     # if user.sex == '2':
    #     #     return '女'

    #     # #import
    #     # if user.sex == '男':
    #     #     return '1'
    #     # if user.sex == '女':
    #     #     return '2'
    #     return '男' if user.sex == '1' else '女'

    # def dehydrate_is_active(self,user):
    #     # print('dehydrate_is_active:',user.is_active)
    #     #export
        
    #     return '启用' if user.is_active else '停用'

    # def dehydrate_belongto(self,user):
    #     # print('dehydrate_belongto',user.belongto)
    #     if user.belongto:
    #         return user.belongto.name
    #     else:
    #         # raise Exception(" belongto is none ")
    #         return ''

    # def dehydrate_Role(self,user):
    #     # print('dehydrate_Role',user.Role)
    #     if user.Role:
    #         return user.Role.name
    #     else:
    #         return ''

