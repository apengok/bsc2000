# -*- coding:utf-8 -*-
from django.core.cache import cache
from import_export import resources,fields
from accounts.models import User,MyRoles
# from core.middleware import get_current_user
import datetime 
from entm import constant
from core.models import (
    Organization,
    SimCard,
    VWatermeter
)


def progress_add(num):
    constant.PROGRESS_COUNT += num

#https://stackoverflow.com/questions/1108428/how-do-i-read-a-date-in-excel-format-in-python
def minimalist_xldate_as_datetime(xldate, datemode):
# datemode: 0 for 1900-based, 1 for 1904-based
    return (
        datetime.datetime(1899, 12, 30)
        + datetime.timedelta(days=xldate + 1462 * datemode)
        )


class SimcardResource(resources.ModelResource):
    simcardNumber    = fields.Field(column_name=u'sim卡号', attribute="simcardNumber")
    belongto     = fields.Field(column_name=u'所属组织', attribute="belongto")
    isStart          = fields.Field(column_name=u'启停状态', attribute="isStart")
    iccid    = fields.Field(column_name=u'ICCID', attribute="iccid")
    imei = fields.Field(column_name=u'IMEI', attribute="imei")
    imsi        = fields.Field(column_name=u'IMSI', attribute="imsi")
    operator    = fields.Field(column_name=u'运营商', attribute="operator")
    simFlow  = fields.Field(column_name=u'套餐流量', attribute="simFlow")
    openCardTime         = fields.Field(column_name=u'激活日期', attribute="openCardTime")
    endTime         = fields.Field(column_name=u'到期时间', attribute="endTime")
    remark         = fields.Field(column_name=u'备注', attribute="remark")
    


    class Meta:
        model = SimCard
        import_id_fields = ['simcardNumber']
        fields = ('simcardNumber', 'belongto', 'isStart','iccid','imei','imsi','operator','simFlow','openCardTime','endTime','remark')
        # exclude = ('idstr')
        export_order = fields


    def dehydrate_isStart(self,user):
        # print('dehydrate_is_active:',user.is_active)
        #export
        
        return '启用' if user.isStart else '停用'

    def dehydrate_belongto(self,user):
        # print('dehydrate_belongto',user.belongto)
        if user.belongto:
            return user.belongto.name
        else:
            # raise Exception(" belongto is none ")
            return ''

    


class ImportSimcardResource(resources.ModelResource):
    simcardNumber    = fields.Field(column_name=u'sim卡号', attribute="simcardNumber")
    belongto     = fields.Field(column_name=u'所属组织', attribute="belongto")
    isStart          = fields.Field(column_name=u'启停状态', attribute="isStart")
    iccid    = fields.Field(column_name=u'ICCID', attribute="iccid")
    imei = fields.Field(column_name=u'IMEI', attribute="imei")
    imsi        = fields.Field(column_name=u'IMSI', attribute="imsi")
    operator    = fields.Field(column_name=u'运营商', attribute="operator")
    simFlow  = fields.Field(column_name=u'套餐流量', attribute="simFlow")
    openCardTime         = fields.Field(column_name=u'激活日期', attribute="openCardTime")
    endTime         = fields.Field(column_name=u'到期时间', attribute="endTime")
    remark         = fields.Field(column_name=u'备注', attribute="remark")
    


    class Meta:
        model = SimCard
        import_id_fields = ['simcardNumber']
        fields = ('simcardNumber', 'belongto', 'isStart','iccid','imei','imsi','operator','simFlow','openCardTime','endTime','remark')
        # exclude = ('idstr')
        export_order = fields

    

    def before_import_row(self, row, **kwargs):
        

        simcardNumber = str(row[u'sim卡号'])
        
        # 从excel读上来的数据全是数字都是float类型
        if '.' in simcardNumber:
            if isinstance(row[u'sim卡号'],float):
                simcardNumber = str(int(row[u'sim卡号']))
                row[u'sim卡号'] = simcardNumber
        org_name = row[u'所属组织']
        org = Organization.objects.filter(name=org_name)
        if org.exists():
            row[u'所属组织'] = org[0]
        else:
            row[u'所属组织'] = None
        iccid = str(row[u'ICCID'])
        
        if isinstance(row[u'ICCID'],float):
            iccid = str(int(row[u'ICCID']))
            row[u'ICCID'] = iccid

        imei = str(row[u'IMEI'])
        if isinstance(row[u'IMEI'],float):
            imei = str(int(row[u'IMEI']))
            row[u'IMEI'] = imei

        imsi = str(row[u'IMSI'])
        
        if isinstance(row[u'IMSI'],float):
            imsi = str(int(row[u'IMSI']))
            row[u'IMSI'] = imsi
        
        
        # Excel save date as float
        openCardTime = row[u'激活日期']
        if openCardTime == '':
            row[u'激活日期'] = datetime.date.today().strftime('%Y-%m-%d')
        else:
            if isinstance(openCardTime,str):
                b = datetime.datetime.strptime(openCardTime.strip(),"%Y-%m-%d")
            else:
                openCardTime = int(row[u'激活日期'])
                b = minimalist_xldate_as_datetime(openCardTime,0)
                row[u'激活日期'] = b.strftime('%Y-%m-%d')

        endTime = row[u'到期时间']
        if endTime == '':
            row[u'到期时间'] = datetime.date.today().strftime('%Y-%m-%d')
        else:
            if isinstance(endTime,str):
                b = datetime.datetime.strptime(endTime.strip(),"%Y-%m-%d")
            else:
                endTime = int(row[u'到期时间'])
                b = minimalist_xldate_as_datetime(endTime,0)
                row[u'到期时间'] = b.strftime('%Y-%m-%d')

        
        state = row[u'启停状态']
        if state == u'启用':
            row[u'启停状态'] = True
        elif state == u'停用':
            row[u'启停状态'] = False
        else:
            row[u'启停状态'] = True
        
        cache.incr('imported_num')
        super(ImportSimcardResource,self).before_import_row(row,**kwargs)
        




class WatermeterResource(resources.ModelResource):
    serialnumber        = fields.Field(column_name=u'表编号', attribute="serialnumber")
    communityid         = fields.Field(column_name=u'所属小区', attribute="communityid")
    meter_catlog        = fields.Field(column_name=u'表类型', attribute="meter_catlog")
    wateraddr           = fields.Field(column_name=u'关联IMEI', attribute="simID")
    numbersth           = fields.Field(column_name=u'户号', attribute="numbersth")
    buildingname        = fields.Field(column_name=u'栋号', attribute="buildingname")
    roomname            = fields.Field(column_name=u'房号', attribute="roomname")
    # concentrator   = fields.Field(column_name=u'所属集中器', attribute="concentrator")
    username            = fields.Field(column_name=u'用户姓名', attribute="username")
    usertel             = fields.Field(column_name=u'用户电话', attribute="usertel")
    dn                  = fields.Field(column_name=u'口径', attribute="dn")
    manufacturer        = fields.Field(column_name=u'厂家', attribute="manufacturer")
    
    useraddr            = fields.Field(column_name=u'用户地址', attribute="useraddr")
    installationsite    = fields.Field(column_name=u'安装位置', attribute="installationsite")
    ValveMeter          = fields.Field(column_name=u'阀控表', attribute="ValveMeter")
    madedate            = fields.Field(column_name=u'生产日期', attribute="madedate")
    
    # simcardNumber    = fields.Field(column_name=u'sim卡号', attribute="simcardNumber")
    # belongto     = fields.Field(column_name=u'所属组织', attribute="belongto")
    
    

    class Meta:
        model = VWatermeter
        import_id_fields = ['serialnumber']
        fields = ('serialnumber', 'communityid', 'meter_catlog','wateraddr','numbersth','buildingname','roomname',
        'username','usertel','dn','manufacturer','useraddr','installationsite','ValveMeter','madedate')
        # exclude = ('idstr')
        export_order = fields


    def dehydrate_ValveMeter(self):
        # print('dehydrate_is_active:',user.is_active)
        #export
        
        return '是' if self.ValveMeter else '否'

    def dehydrate_communityid(self):
        # print('dehydrate_belongto',user.belongto)
        if self.communityid:
            return self.communityid.name
        else:
            # raise Exception(" belongto is none ")
            return ''

    