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
    Meter,
    Station,
)

from amrs.models import Bigmeter


#https://stackoverflow.com/questions/1108428/how-do-i-read-a-date-in-excel-format-in-python
def minimalist_xldate_as_datetime(xldate, datemode):
# datemode: 0 for 1900-based, 1 for 1904-based
    return (
        datetime.datetime(1899, 12, 30)
        + datetime.timedelta(days=xldate + 1462 * datemode)
        )



class ImportStationResource(resources.ModelResource):
    '''
    站点导入
     1          2           3           4       5           6           7         8         9           10      11      12          13          14      15      16      17      18      19 
    序号	用户编号	站点名称	站点描述	所属组织	表具编号	表具类型	类型	制造厂商	通讯协议	口径	用水性质	安装日期	经度	纬度	SIM卡号	IMEI	运营商	开户日期
    (1)表具类型：可填“水表”、“流量计”;
    (2)类型：可填“电磁水表”、“超声水表”、“机械水表”、“插入电磁”；
    

    (1)、根据参数5/16/17/18，后台自动新建SIM卡，自动启用，如果IMEI填写，则为NB表；
    (2)、根据参数5/6/7/8/9/10/11/16，后台自动新建表具；			
    (3)、根据参数2/3/4/5/6/12/13/14/15，后台自动新建站点。
    '''
    seqno           = fields.Field(column_name=u'序号')
    userid          = fields.Field(column_name=u'用户代码', attribute="userid")
    username        = fields.Field(column_name=u'站点名称', attribute="username")
    description     = fields.Field(column_name=u'站点描述', attribute="description")
    belongto        = fields.Field(column_name=u'所属组织', attribute="belongto")
    serialnumber    = fields.Field(column_name=u'表具编号', attribute="serialnumber")
    metertype       = fields.Field(column_name=u'表具类型', attribute="metertype")
    model           = fields.Field(column_name=u'类型', attribute="model")       #Meter -- mtype
    manufacturer    = fields.Field(column_name=u'制造厂商', attribute="manufacturer")
    protocol        = fields.Field(column_name=u'通讯协议', attribute="protocol") # Meter -- protocol
    dn              = fields.Field(column_name=u'口径', attribute="dn")

    usertype        = fields.Field(column_name=u'用水性质', attribute="usertype")
    madedate        = fields.Field(column_name=u'安装日期', attribute="madedate")
    lng             = fields.Field(column_name=u'经度', attribute="lng")
    lat             = fields.Field(column_name=u'纬度', attribute="lat")
    commaddr        = fields.Field(column_name=u'SIM卡号', attribute="commaddr") #SimCard -- simcardNumber
    imei            = fields.Field(column_name=u'IMEI', attribute="imei")  #SimCard -- IMEI
    operator        = fields.Field(column_name=u'运营商', attribute="operator")
    openCardTime    = fields.Field(column_name=u'开户日期', attribute="openCardTime") #SimCard -- openCardTime
    
    

    class Meta:
        model = Bigmeter
        import_id_fields = ['commaddr']
        fields = ('seqno', 'userid', 'username','description','belongto','serialnumber','metertype',
        'model','manufacturer','protocol','dn','usertype','madedate','lng','lat','commaddr','imei',
        'operator','openCardTime')
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
        super(ImportStationResource,self).before_import_row(row,**kwargs)
        



