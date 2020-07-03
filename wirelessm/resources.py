# -*- coding:utf-8 -*-
from import_export import resources,fields

import datetime 
from entm import constant
from amrs.models import HdbWatermeterDay,HdbWatermeterMonth
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


METER_CATLOG = ['NB物联','LORA智能','有线远传','其他']


class WatermeterResource(resources.ModelResource):
    serialnumber        = fields.Field(column_name=u'表编号', attribute="amrs_watermeter__serialnumber")
    communityid         = fields.Field(column_name=u'所属小区', attribute="communityid")
    concentrator        = fields.Field(column_name=u'所属集中器', attribute="concentrator")
    meter_catlog        = fields.Field(column_name=u'表类型', attribute="amrs_watermeter__meter_catlog")
    wateraddr           = fields.Field(column_name=u'关联IMEI', attribute="amrs_watermeter__wateraddr")
    numbersth           = fields.Field(column_name=u'户号', attribute="amrs_watermeter__numbersth")
    buildingname        = fields.Field(column_name=u'栋号', attribute="amrs_watermeter__buildingname")
    roomname            = fields.Field(column_name=u'房号', attribute="amrs_watermeter__roomname")
    # concentrator   = fields.Field(column_name=u'所属集中器', attribute="concentrator")
    username            = fields.Field(column_name=u'用户姓名', attribute="amrs_watermeter__username")
    usertel             = fields.Field(column_name=u'用户电话', attribute="amrs_watermeter__usertel")
    dn                  = fields.Field(column_name=u'口径', attribute="amrs_watermeter__dn")
    manufacturer        = fields.Field(column_name=u'厂家', attribute="amrs_watermeter__manufacturer")
    
    useraddr            = fields.Field(column_name=u'用户地址', attribute="useraddr")
    installationsite    = fields.Field(column_name=u'安装位置', attribute="amrs_watermeter__installationsite")
    metercontrol          = fields.Field(column_name=u'阀控表', attribute="amrs_watermeter__metercontrol")
    madedate            = fields.Field(column_name=u'生产日期', attribute="amrs_watermeter__madedate")
    
    # simcardNumber    = fields.Field(column_name=u'sim卡号', attribute="simcardNumber")
    # belongto     = fields.Field(column_name=u'所属组织', attribute="belongto") 
    
    

    class Meta:
        model = VWatermeter
        import_id_fields = ['serialnumber']
        fields = ('serialnumber', 'communityid','concentrator', 'meter_catlog','wateraddr','numbersth','buildingname','roomname',
        'username','usertel','dn','manufacturer','useraddr','installationsite','metercontrol','madedate')
        # exclude = ('idstr')
        export_order = fields


    def dehydrate_ValveMeter(self,instance):
        # print('dehydrate_is_active:',user.is_active)
        #export
        
        return '是' if instance.amrs_watermeter.metercontrol else '否'

    def dehydrate_communityid(self,instance):
        # print(instance,type(instance))
        # print('dehydrate_belongto',user.belongto)
        if instance.communityid:
            return instance.communityid.name
        else:
            # raise Exception(" belongto is none ")
            return ''

    def dehydrate_concentrator(self,instance):
        # print(instance,type(instance))
        # print('dehydrate_belongto',user.belongto)
        if instance.communityid:
            return instance.communityid.name
        else:
            # raise Exception(" belongto is none ")
            return ''

    def dehydrate_meter_catlog(self,instance):
        try:
            return METER_CATLOG[int(instance.amrs_watermeter.meter_catlog)]
        except:
            return METER_CATLOG[3]


class WatermeterSelectResource(resources.ModelResource):
    # seq           = fields.Field(column_name=u'序号', attribute="seq")
    numbersth           = fields.Field(column_name=u'用户代码', attribute="amrs_watermeter__numbersth")
    serialnumber        = fields.Field(column_name=u'表编号', attribute="amrs_watermeter__serialnumber")
    communityid         = fields.Field(column_name=u'小区名称', attribute="communityid")
    buildingname        = fields.Field(column_name=u'楼号', attribute="amrs_watermeter__buildingname")
    roomname            = fields.Field(column_name=u'单元号、房号', attribute="amrs_watermeter__roomname")
    rvalue        = fields.Field(column_name=u'表读数', attribute="amrs_watermeter__rvalue")
    rtime           = fields.Field(column_name=u'抄表时间', attribute="amrs_watermeter__rtime")
    commstate            = fields.Field(column_name=u'表状态', attribute="amrs_watermeter__commstate")
    

    class Meta:
        model = VWatermeter
        import_id_fields = ['serialnumber']
        fields = ('numbersth','serialnumber', 'communityid','buildingname','roomname','rvalue','rtime','commstate')
        # exclude = ('idstr')
        export_order = fields

    # def dehyrate_seq(self,instance):
    #     return 
    
    def dehydrate_communityid(self,instance):
        # print(instance,type(instance))
        # print('dehydrate_belongto',user.belongto)
        if instance.communityid:
            return instance.communityid.name
        else:
            # raise Exception(" belongto is none ")
            return ''

    def dehydrate_rvalue(self,instance):
        try:
            return int(round(float(instance.amrs_watermeter.rvalue)))
        except Exception as e:
            print(e)
            return ''

    

# class VWatermeterResource(resources.ModelResource):
#     class Meta:
#         model = VWatermeter

class ImportWatermeterResource(resources.ModelResource):
    serialnumber        = fields.Field(column_name=u'表编号', attribute="serialnumber")
    communityid         = fields.Field(column_name=u'所属小区', attribute="communityid")
    concentrator        = fields.Field(column_name=u'所属集中器', attribute="concentrator")
    meter_catlog        = fields.Field(column_name=u'表类型', attribute="meter_catlog")
    wateraddr           = fields.Field(column_name=u'关联IMEI', attribute="wateraddr")
    numbersth           = fields.Field(column_name=u'户号', attribute="numbersth")
    buildingname        = fields.Field(column_name=u'栋号', attribute="buildingname")
    roomname            = fields.Field(column_name=u'房号', attribute="roomname")
    username            = fields.Field(column_name=u'用户姓名', attribute="username")
    usertel             = fields.Field(column_name=u'用户电话', attribute="usertel")
    dn                  = fields.Field(column_name=u'口径', attribute="dn")
    manufacturer        = fields.Field(column_name=u'厂家', attribute="manufacturer")
    
    useraddr            = fields.Field(column_name=u'用户地址', attribute="useraddr")
    installationsite    = fields.Field(column_name=u'安装位置', attribute="installationsite")
    ValveMeter          = fields.Field(column_name=u'阀控表', attribute="ValveMeter")
    madedate            = fields.Field(column_name=u'生产日期', attribute="madedate")
    
    belongto            = fields.Field(column_name=u'所属组织', attribute="belongto")

    dosage              = fields.Field(column_name=u'表读数', attribute="dosage")
    readtime            = fields.Field(column_name=u'抄表时间', attribute="readtime")
    
    

    class Meta:
        model = VWatermeter
        import_id_fields = ['serialnumber']
        fields = ('serialnumber', 'communityid','concentrator', 'meter_catlog','wateraddr','numbersth','buildingname','roomname',
        'username','usertel','dn','manufacturer','useraddr','installationsite','ValveMeter','madedate','belongto','dosage','readtime')
        exclude = ('communityid','belongto') #'concentrator',
        export_order = fields

    

    def before_import_row(self, row, **kwargs):
        

        serialnumber = str(row[u'表编号'])
        
        # 从excel读上来的数据全是数字都是float类型
        if '.' in serialnumber:
            if isinstance(row[u'表编号'],float):
                serialnumber = str(int(row[u'表编号']))
                row[u'表编号'] = serialnumber
        # 小区 2020-01-11 改为集中器
        # communityname = row[u'所属小区'] #communityid
        # community = VCommunity.objects.get(name=communityname)
        # concentrator = community.vconcentrators.first()

        # row[u'所属集中器'] = concentrator
        
        # row[u'所属小区'] = community
        # row[u'所属组织'] = community.belongto

        # 所属集中器
        concentratorname = row[u'所属集中器']
        concentrator = VConcentrator.objects.get(name=concentratorname)
        community = VCommunity.objects.filter(vconcentrators__id=concentrator.id).first()
        # concentrator = community.vconcentrators.first()

        row[u'所属集中器'] = concentrator
        
        row[u'所属小区'] = community
        row[u'所属组织'] = community.belongto
        
        
        catlog = str(row[u'表类型'])
        row[u'表类型'] = METER_CATLOG.index(catlog)
        
        wateraddr = str(row[u'关联IMEI'])
        
        # 从excel读上来的数据全是数字都是float类型
        if '.' in wateraddr:
            if isinstance(row[u'关联IMEI'],float):
                wateraddr = str(int(row[u'关联IMEI']))
                row[u'关联IMEI'] = wateraddr

        if wateraddr == '' or wateraddr is None:
            wateraddr = serialnumber

        row[u'关联IMEI'] = wateraddr

        valve = str(row[u'阀控表'])
        if valve == '是':
            row[u'阀控表'] = 1
        else:
            row[u'阀控表'] = 0

        
        
        
        # Excel save date as float
        openCardTime = row[u'生产日期']
        if openCardTime == '':
            row[u'生产日期'] = datetime.date.today().strftime('%Y-%m-%d')
        else:
            if isinstance(openCardTime,str):
                b = datetime.datetime.strptime(openCardTime.strip(),"%Y-%m-%d")
            else:
                openCardTime = int(row[u'生产日期'])
                b = minimalist_xldate_as_datetime(openCardTime,0)
                row[u'生产日期'] = b.strftime('%Y-%m-%d')

        # import dosage and readtime
        dosage = str(row[u'表读数'])
        
        # 从excel读上来的数据全是数字都是float类型
        if '.' in dosage:
            if isinstance(row[u'表读数'],float):
                dosage = str(int(row[u'表读数']))
                row[u'表读数'] = dosage

        readtime = row[u'抄表时间']
        if readtime == '':
            row[u'抄表时间'] = datetime.date.today().strftime('%Y-%m-%d %H:%M:%S')
        else:
            if isinstance(readtime,str):
                b = datetime.datetime.strptime(readtime.strip(),"%Y-%m-%d %H:%M:%S")
            else:
                readtime = float(row[u'抄表时间'])
                b = minimalist_xldate_as_datetime(readtime,0)
                row[u'抄表时间'] = b.strftime('%Y-%m-%d %H:%M:%S')

        print("\r\n\r\n\r\nnew import watermeter data:{}{}\n\n\n".format(readtime,dosage))

        

        super(ImportWatermeterResource,self).before_import_row(row,**kwargs)
        
