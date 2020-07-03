# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.urls import reverse
from mptt.models import MPTTModel, TreeForeignKey
from django.db.models.signals import post_save 
from django.db.models.signals import pre_save
from django.db.models import Q
import datetime

from amrs.utils import (HdbFlow_day_use,HdbFlow_day_hourly,HdbFlow_month_use,HdbFlow_monthly,hdb_watermeter_flow_monthly,
        Hdbflow_from_hdbflowmonth,hdb_watermeter_month,hdb_watermeter_flow_daily,Hdbflow_from_hdbflowday,
        ZERO_monthly_dict,generat_year_month,generat_year_month_from)

from amrs.models import (
    Community,
    Concentrator,
    Bigmeter,
    Watermeter,
    SecondWater,
    PipePressure
)

# from accounts.models import LoginRecord
# Create your models here.

class OrganizationQuerySet(models.query.QuerySet):
    def search(self, query): #RestaurantLocation.objects.all().search(query) #RestaurantLocation.objects.filter(something).search()
        if query:
            query = query.strip()
            return self.filter(
                Q(name__icontains=query)|
                Q(cid__iexact=query)
                ).distinct()
        return self


class OrganizationManager(models.Manager):
    def get_queryset(self):
        return OrganizationQuerySet(self.model, using=self._db)

    def search(self, query): #RestaurantLocation.objects.search()
        return self.get_queryset().search(query)

class Organization(MPTTModel):
    name               = models.CharField('组织机构名称',max_length=300,null=True)
    attribute          = models.CharField('组织机构性质',max_length=300,null=True,blank=True)
    register_date      = models.CharField('注册日期',max_length=30,null=True,blank=True)
    owner_name         = models.CharField('负责人',max_length=300,null=True,blank=True)
    phone_number       = models.CharField('电话号码',max_length=300,null=True,blank=True)
    firm_address       = models.CharField('地址',max_length=300,null=True,blank=True)

    # 组织级别
    organlevel         = models.CharField('Level',max_length=30,null=True,blank=True)
    # add new
    coorType    = models.CharField(max_length=30,null=True,blank=True)
    longitude   = models.CharField(max_length=30,null=True,blank=True)
    latitude    = models.CharField(max_length=30,null=True,blank=True)
    zoomIn      = models.CharField(max_length=30,null=True,blank=True)
    islocation  = models.CharField(max_length=30,null=True,blank=True)
    location    = models.CharField(max_length=30,null=True,blank=True)
    province    = models.CharField(max_length=30,null=True,blank=True)
    city        = models.CharField(max_length=30,null=True,blank=True)
    district    = models.CharField(max_length=30,null=True,blank=True)

    cid           = models.CharField(max_length=300,null=True,blank=True)
    pId           = models.CharField(max_length=300,null=True,blank=True)
    is_org        = models.BooleanField(max_length=300,blank=True)
    uuid          = models.CharField(max_length=300,null=True,blank=True)

    adcode        = models.CharField(max_length=300,null=True,blank=True) #行政代码
    districtlevel = models.CharField(max_length=300,null=True,blank=True)   #行政级别

    parent  = TreeForeignKey('self', null=True, blank=True,on_delete=models.CASCADE, related_name='children', db_index=True)

    class MPTTMeta:
        order_insertion_by = ['name']

    class Meta:
        managed = True
        db_table = 'bsc_organization'

    def __str__(self):
        return self.name 

    def sub_organizations(self,include_self=False):
        return self.get_descendants(include_self)

    def before_delete_it(self):
        '''
        1、当只有站点时，删除组织时，其所属的站点自动移到上级组织，包括SIM卡，表具和站点，
            如果该组织以下还有子组织，不论该子组织是否有站点，都不能删除，必须先删除了子组织，才可以删除该组织，
            以此类推。如果子组织下有站点时，删除子组织时，站点自动移入到父级组织。
            只要组织可以删除时，其下所有用户自动删除。
        2、当有DMA分区时，该组织不可删除，要想删除，步骤为：
            先解除DMA绑定站点，即把DMA分区内的所有站点和小区等全部移出分区，
            然后才可以删除DMA分区，等到组织内没有任何DMA分区时，再按照第一条原则删除组织。'''
        # station
        if self.dma.all().count() > 0:
            print('dma exists ,cant delete.')
            return False
        # 站点
        for s in self.station_set.all():
            print("before delete station set to parant organzation")
            s.belongto = self.parent
            s.save()
        # 表具
        for m in self.meter_set.all():
            print("before delete meter set to parant organzation")
            m.belongto = self.parent
            m.save()
        # SIM卡
        for s in self.simcard_set.all():
            print("before delete simcart set to parant organzation")
            s.belongto = self.parent
            s.save()
        # 小区
        for c in self.vcommunity_set.all():
            print("before delete comunity set to parant organzation")
            c.belongto = self.parent
            c.save()
        # 集中器
        for c in self.vconcentrator_set.all():
            print("before delete concentor set to parant organzation")
            c.belongto = self.parent
            c.save()
        # 二供
        for c in self.vsecondwater_set.all():
            print("before delete secondwater set to parant organzation")
            c.belongto = self.parent
            c.save()
        # 压力
        for c in self.vpressure_set.all():
            print("before delete pressure set to parant organzation")
            c.belongto = self.parent
            c.save()
        # 户表
        for c in self.vwatermeter_set.all():
            print("before delete watermeter set to parant organzation")
            c.belongto = self.parent
            c.save()

        return True

    #组织及下属组织下的所有集中器
    def concentrator_list_queryset(self,q):
        
        concentratorlist = VConcentrator.objects.none()
        #下级组织的用户
        sub_organs = self.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            concentratorlist |= g.vconcentrator_set.search(q)
            
        return concentratorlist

    #组织及下属组织下的所有simcard
    def simcard_list_queryset(self,q):
        simcardlist = SimCard.objects.none()
        #下级组织的用户
        sub_organs = self.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            simcardlist |= g.simcard_set.search(q)
            
        return simcardlist

    
    #组织及下属组织下的所有站点
    def station_list_queryset(self,q):
        stationlist = Station.objects.none()
        #下级组织的用户
        sub_organs = self.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            stationlist |= g.station_set.search(q)
            
        return stationlist

    #组织及下属组织下的所有表具
    def meter_list_queryset(self,q):
        meterlist = Meter.objects.none()
        #下级组织的用户
        sub_organs = self.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            meterlist |= g.meter_set.search(q)
            
        return meterlist

    #组织及下属组织下的所有simcard
    def simcard_list_queryset(self,q):
        simcardlist = SimCard.objects.none()
        #下级组织的用户
        sub_organs = self.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            simcardlist |= g.simcard_set.search(q)
            
        return simcardlist

    #组织及下属组织下的所有集中器
    def concentrator_list_queryset(self,q):
        concentratorlist = VConcentrator.objects.none()
        #下级组织的用户
        sub_organs = self.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            concentratorlist |= g.vconcentrator_set.search(q)
            
        return concentratorlist

     #组织及下属组织下的所有小区
    def community_list_queryset(self,q):
        communitylist = VCommunity.objects.none()
        #下级组织的用户
        sub_organs = self.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            communitylist |= g.vcommunity_set.search(q)
            
        return communitylist

    #组织及下属组织下的所有户表
    def watermeter_list_queryset(self,q):
        watermeterlist = VWatermeter.objects.none()
        #下级组织的用户
        sub_organs = self.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            watermeterlist |= g.vwatermeter_set.search(q)
            
        return watermeterlist


    #组织及下属组织下的所有户表
    def pressure_list_queryset(self,q):
        pressuremeterlist = VPressure.objects.none()
        #下级组织的用户
        sub_organs = self.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            pressuremeterlist |= g.vpressure_set.search(q)
            
        return pressuremeterlist

    # 组织下dma分区列表--二级和三级列表分开查询,组织cid、级别organlevel、dma_no
    def dma_list_queryset(self):
        dmalist = DMABaseinfo.objects.none()
        #下级组织的用户
        sub_organs = self.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            dmalist |= g.dma.all()
            
        return dmalist
    # 组织下dma分区围栏列表
    def fence_list_queryset(self):
        model_qs = ContentType.objects.filter(model='fencedistrict')
        if model_qs.exists() and model_qs.count() == 1:
            someModel = model_qs.first().model_class() 
        else:
            return []

        fencelist = someModel.objects.none()
        #下级组织的用户
        sub_organs = self.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            fencelist |= g.fencedistrict_set.all()
            
        return fencelist

    

    #组织及下属组织下的二供
    def secondwater_list_queryset(self,q):
        secondwaterlist = VSecondWater.objects.none()
        #下级组织的用户
        sub_organs = self.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            secondwaterlist |= g.vsecondwater_set.search(q)
            
        return secondwaterlist

    



'''
个性化设置
'''
class Personalized(models.Model):
    """docstring for Personalized"""
    # topTitle loginLogo homeLogo webIco copyright websiteName recordNumber groupId type frontPage
    ptype   =   models.CharField(max_length=10)   #default or custom
    # 登录页面
    loginLogo  = models.CharField(max_length=256,null=True,blank=True)
    # 平台网页标题ico
    webIco          = models.CharField(max_length=256,null=True,blank=True)
    # 平台首页Logo
    homeLogo = models.CharField(max_length=256,null=True,blank=True)
    # 平台首页登录标题
    topTitle     = models.CharField(max_length=256,null=True,blank=True)
    # 平台首页置底信息
    # bottomTitleMsg  = models.CharField(max_length=256,null=True,blank=True)
    copyright  = models.CharField(max_length=256,null=True,blank=True)
    websiteName  = models.CharField(max_length=256,null=True,blank=True)
    recordNumber  = models.CharField(max_length=256,null=True,blank=True)
    # 平台登录页设置
    frontPageMsg    = models.CharField(max_length=256,null=True,blank=True)
    frontPageMsgUrl    = models.CharField(max_length=256,null=True,blank=True)
    updateDataUsername = models.CharField(max_length=256,null=True,blank=True)
    updateDataTime = models.DateTimeField(db_column='updateDataTime', auto_now=True)  # Field name made lowercase.
    
    belongto        = models.ForeignKey(Organization,on_delete=models.CASCADE,blank=True,null=True)


    class Meta:
        managed = True
        db_table = 'bsc_personalized'

    def __unicode__(self):
        return self.topTitleMsg


'''
用水性质
'''
class WaterUserType(models.Model):
    """docstring for WaterUserType"""
    usertype = models.CharField(max_length=256,null=False,blank=False)
    explains = models.CharField(max_length=1000,null=True,blank=True)

    class Meta:
        managed = True
        db_table = 'waterusertype'

    def __unicode__(self):
        return self.usertype
        



class SimCardQuerySet(models.query.QuerySet):
    def search(self, query): #RestaurantLocation.objects.all().search(query) #RestaurantLocation.objects.filter(something).search()
        if query:
            query = query.strip()
            return self.filter(
                Q(meter__station__username__icontains=query)|
                Q(meter__serialnumber__icontains=query)|
                Q(simcardNumber__icontains=query)
                # Q(meter__simid__simcardNumber__iexact=query)
                ).distinct()
        return self


class SimCardManager(models.Manager):
    def get_queryset(self):
        return SimCardQuerySet(self.model, using=self._db)

    def search(self, query): #RestaurantLocation.objects.search()
        return self.get_queryset().search(query)

class SimCard(models.Model):
    simcardNumber       = models.CharField(db_column='SIMID', max_length=30, blank=True, null=True)  # Field name made lowercase.
    belongto            = models.ForeignKey(Organization,on_delete=models.CASCADE)
    isStart             = models.CharField(db_column='state', max_length=64, blank=True, null=True)  # Field name made lowercase.
    iccid               = models.CharField(db_column='ICCID', max_length=30, blank=True, null=True)  # Field name made lowercase.型号
    imei                = models.CharField(db_column='IMEI', max_length=30, blank=True, null=True)  # Field name made lowercase.
    imsi                = models.CharField(db_column='IMSI', max_length=30, blank=True, null=True)  # Field name made lowercase.
    operator            = models.CharField(db_column='operator', max_length=30, blank=True, null=True)  # Field name made lowercase.
    simFlow             = models.CharField(db_column='simFlow', max_length=30, blank=True, null=True)  # Field name made lowercase.
    openCardTime        = models.CharField(db_column='openCardTime', max_length=64, blank=True, null=True)  # Field name made lowercase.
    endTime             = models.CharField(db_column='endTime', max_length=64, blank=True, null=True)  # Field name made lowercase.
    create_date         = models.DateTimeField(db_column='create_date', auto_now_add=True)  # Field name made lowercase.
    update_date         = models.DateTimeField(db_column='update_date', auto_now=True)  # Field name made lowercase.
    remark              = models.CharField(db_column='remark', max_length=64, blank=True, null=True)  # Field name made lowercase.
    
    objects = SimCardManager()


    class Meta:
        managed = True
        db_table = 'bsc_simcard'

    def __unicode__(self):
        return '%s'%(self.simcardNumber)    

    def __str__(self):
        return '%s'%(self.simcardNumber)    



class MeterQuerySet(models.query.QuerySet):
    def search(self, query): #RestaurantLocation.objects.all().search(query) #RestaurantLocation.objects.filter(something).search()
        if query:
            query = query.strip()
            return self.filter(
                Q(station__username__icontains=query)|
                Q(serialnumber__icontains=query)|
                Q(simid__simcardNumber__icontains=query)
                ).distinct()
        return self


class MeterManager(models.Manager):
    def get_queryset(self):
        return MeterQuerySet(self.model, using=self._db)

    def search(self, query): #RestaurantLocation.objects.search()
        return self.get_queryset().search(query)

class Meter(models.Model):
    serialnumber= models.CharField(db_column='SerialNumber', max_length=30, blank=True, null=True)  # Field name made lowercase.
    # simid       = models.CharField(db_column='SIMID', max_length=30, blank=True, null=True)  # Field name made lowercase.
    simid       = models.ForeignKey(SimCard,on_delete=models.SET_NULL,related_name='meter', blank=True, null=True) # Field name made lowercase.
    version     = models.CharField(db_column='version', max_length=30, blank=True, null=True)  # Field name made lowercase.型号
    dn          = models.CharField(db_column='Dn', max_length=30, blank=True, null=True)  # Field name made lowercase.
    metertype   = models.CharField(db_column='MeterType', max_length=30, blank=True, null=True)  # Field name made lowercase.
    belongto    = models.ForeignKey(Organization,on_delete=models.CASCADE)
    # 0 - 电磁水表 1-超声水表 2-机械水表 3-插入电磁
    mtype       = models.CharField(db_column='Type', max_length=30, blank=True, null=True)  # Field name made lowercase. 
    manufacturer= models.CharField(db_column='Manufacturer', max_length=30, blank=True, null=True)  # Field name made lowercase.
    protocol    = models.CharField(db_column='Protocol', max_length=64, blank=True, null=True)  # Field name made lowercase.
    R           = models.CharField(db_column='R', max_length=64, blank=True, null=True)  # Field name made lowercase.
    q4          = models.CharField(db_column='Q4', max_length=64, blank=True, null=True)  # Field name made lowercase.
    q3          = models.CharField(db_column='Q3', max_length=64, blank=True, null=True)  # Field name made lowercase.
    q2          = models.CharField(db_column='Q2', max_length=64, blank=True, null=True)  # Field name made lowercase.
    q1          = models.CharField(db_column='Q1', max_length=64, blank=True, null=True)  # Field name made lowercase.
    check_cycle = models.CharField(db_column='check cycle', max_length=64, blank=True, null=True)  # Field name made lowercase.
    state       = models.CharField(db_column='state', max_length=64, blank=True, null=True)  # Field name made lowercase.


    objects = MeterManager()

    class Meta:
        managed = True
        db_table = 'bsc_meter'

    def __unicode__(self):
        return '%s'%(self.serialnumber)   

    def __str__(self):
        return '%s'%(self.serialnumber)    



class DMABaseinfoQuerySet(models.query.QuerySet):
    def search(self, cid,organlevel,dma_no): #RestaurantLocation.objects.all().search(query) #RestaurantLocation.objects.filter(something).search()
        if dma_no:
            dma_no = dma_no.strip()
            return self.filter(
                Q(dma_no__iexact=dma_no)
                ).distinct()
        else:
            cid = cid.strip()
            organlevel = organlevel.strip()
            return self.filter(
                Q(belongto__cid__icontains=cid)|
                Q(belongto__organlevel__iexact=organlevel)
                # Q(meter__simid__simcardNumber__iexact=query)
                ).distinct()
        return self



class DMABaseinfoManager(models.Manager):
    def get_queryset(self):
        return DMABaseinfoQuerySet(self.model, using=self._db)

    def search(self, cid,organlevel,dma_no): #RestaurantLocation.objects.search()
        return self.get_queryset().search(cid,organlevel,dma_no)


class DMABaseinfo(models.Model):
    dma_no        = models.CharField('分区编号',max_length=50, unique=True)
    dma_name      = models.CharField('分区名称',max_length=50, unique=True)

    pepoles_num   = models.CharField('服务人口',max_length=50, null=True,blank=True)
    acreage       = models.CharField('服务面积',max_length=50, null=True,blank=True)
    user_num      = models.CharField('用户数量',max_length=50, null=True,blank=True)
    pipe_texture  = models.CharField('管道材质',max_length=50, null=True, blank=True)
    pipe_length   = models.CharField('管道总长度(m)',max_length=50, null=True, blank=True)
    pipe_links    = models.CharField('管道连接总数(个)',max_length=50,null=True, blank=True)
    pipe_years    = models.CharField('管道最长服务年限(年)',max_length=50,null=True, blank=True)
    pipe_private  = models.CharField('私人拥有水管长度(m)',max_length=50,blank=True,null=True)
    ifc           = models.CharField('IFC参数',max_length=250, null=True, blank=True)
    aznp          = models.CharField('AZNP',max_length=250,null=True, blank=True)
    night_use     = models.CharField('正常夜间用水量',max_length=50,null=True, blank=True)
    cxc_value     = models.CharField('产销差目标值',max_length=50, null=True, blank=True)

    creator      = models.CharField('负责人',max_length=50, null=True, blank=True) 
    create_date  = models.CharField('建立日期',max_length=30, null=True, blank=True) 

    belongto = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='dma',
        # primary_key=True,
    )

    objects = DMABaseinfoManager()

    class Meta:
        managed=True
        unique_together = ('dma_no', )
        db_table = 'bsc_dmabaseinfo'

    @property
    def dma_level(self):
        return self.belongto.organlevel

        

    def get_absolute_url(self): #get_absolute_url
        # return "/organ/{}".format(self.pk)
        return reverse('dma:dma_manager', kwargs={'pk': self.pk})

    def __unicode__(self):
        return self.dma_name

    def __str__(self):
        return self.dma_name        

    def station_assigned(self):
        dmastations = self.dmastation_set.all()
        return dmastations

    def station_set_all(self):
        
        dmastations = self.dmastation_set.all()
        commaddr_list = []
        for d in dmastations:
            commaddr = d.station_id
            if d.station_type == "1":
                commaddr_list.append(commaddr)
        stationlist = Station.objects.filter(amrs_bigmeter__commaddr__in=commaddr_list)
            
        return stationlist

    def community_set_all(self):
        
        dmastations = self.dmastation_set.all()
        commaddr_list = []
        for d in dmastations:
            commaddr = d.station_id
            if d.station_type == "2":
                commaddr_list.append(commaddr)
        comminitylist = Community.objects.filter(pk__in=commaddr_list)
            
        return comminitylist

    def dma_statistic2(self,month_list1):
        """
            month_list1 是一整年的月份列表
            month_list 是dma创建日期的月份其实列表，统计数据是从创建日期开始计算的
            'notes:' dmastation 中保存的station_id是VCommunity的id，需要通过VCommunity获取抄表系统的小区
        """
        dmastations_list = self.station_assigned()
        
        # dmastations_list2 = self.station_set.values_list('meter__simid__simcardNumber','dmametertype')
        cre_data = datetime.datetime.strptime(self.create_date,"%Y-%m-%d")
        month_list = generat_year_month_from(cre_data.month,cre_data.year)
        # print("create data month_list",month_list)
        
        # meter_types = ["出水表","进水表","贸易结算表","未计费水表","官网检测表"] 管网监测表
        # 进水表  加和---> 进水总量
        water_in = 0
        monthly_in = ZERO_monthly_dict(month_list1)
        meter_in = dmastations_list.filter(meter_type='进水表')
        
        for m in meter_in:
            commaddr = m.station_id
            
            if m.station_type == "2": #小区-- commaddr=VCommunity id
                community = VCommunity.objects.get(id=commaddr)
                community_id = community.amrs_community.id
                monthly_use = hdb_watermeter_flow_monthly(community_id,month_list)

            else:
                monthly_use = Hdbflow_from_hdbflowmonth(commaddr,month_list) #HdbFlow_monthly(commaddr)
            
            print(commaddr,monthly_use)
            for k in monthly_in.keys():
                if k in monthly_use.keys():
                    monthly_in[k] += monthly_use[k]
                # else:
                #     monthly_in[k] = 0
        water_in = sum([monthly_in[k] for k in monthly_in.keys()])
        
        # 出水表 加和--->出水总量
        water_out = 0
        monthly_out = ZERO_monthly_dict(month_list1)
        meter_out = dmastations_list.filter(meter_type='出水表')
        for m in meter_out:
            commaddr = m.station_id
            if m.station_type == "2": #小区-- commaddr=VCommunity id
                community = VCommunity.objects.get(id=commaddr)
                community_id = community.amrs_community.id
                monthly_use = hdb_watermeter_flow_monthly(community_id,month_list)

            else:
                monthly_use = Hdbflow_from_hdbflowmonth(commaddr,month_list) #HdbFlow_monthly(commaddr)
            # print(m.username,commaddr,monthly_use)
            for k in monthly_out.keys():
                if k in monthly_use.keys():
                    monthly_out[k] += monthly_use[k]
                # else:
                #     monthly_out[k] = monthly_use[k]
        water_out = sum([monthly_out[k] for k in monthly_out.keys()])
        
        # 售水量 = 所有贸易结算表的和
        water_sale = 0
        monthly_sale = ZERO_monthly_dict(month_list1)
        meter_sale = dmastations_list.filter(meter_type='贸易结算表')

        for m in meter_sale:
            commaddr = m.station_id
            # print("&*^&*%&$*(&^&---",commaddr,m.station_type)
            # if m.username == "文欣苑户表总表":
            # if commaddr == '4022':
            if m.station_type == "2": #小区-- commaddr=VCommunity id
                community = VCommunity.objects.get(id=commaddr)
                community_id = community.amrs_community.id
                monthly_use = hdb_watermeter_flow_monthly(community_id,month_list)
                # print(community['name'],commaddr,community_id,monthly_use)
            else:
                monthly_use = Hdbflow_from_hdbflowmonth(commaddr,month_list) #HdbFlow_monthly(commaddr)
            print(commaddr,monthly_use)
            for k in monthly_sale.keys():
                if k in monthly_use.keys():
                    monthly_sale[k] += monthly_use[k]
                # else:
                #     monthly_sale[k] = monthly_use[k]

        water_sale += sum([monthly_sale[k] for k in monthly_sale.keys()])
        
        # 未计量水量 = 所有未计费水表的和
        water_uncount = 0
        monthly_uncount = ZERO_monthly_dict(month_list1)
        meter_uncount = dmastations_list.filter(meter_type='未计费水表')
        for m in meter_uncount:
            commaddr = m.station_id
            if m.station_type == "2": #小区-- commaddr=VCommunity id
                community = VCommunity.objects.get(id=commaddr)
                community_id = community.amrs_community.id
                monthly_use = hdb_watermeter_flow_monthly(community_id,month_list)
                # print(community['name'],commaddr,community_id,monthly_use)

            else:
                monthly_use = Hdbflow_from_hdbflowmonth(commaddr,month_list) #HdbFlow_monthly(commaddr)
            print(commaddr,monthly_use)
            for k in monthly_uncount.keys():
                if k in monthly_use.keys():
                    monthly_uncount[k] += monthly_use[k]
                # else:
                #     monthly_uncount[k] = monthly_use[k]
        water_uncount = sum([monthly_uncount[k] for k in monthly_uncount.keys()])
        
        # 漏损量 = 供水量-售水量-未计费水量 分区内部进水表要减去自己内部出水表才等于这个分区的供水量

        return {
            'water_in':water_in,
            'monthly_in':monthly_in,
            'water_out':water_out,
            'monthly_out':monthly_out,
            'water_sale':water_sale,
            'monthly_sale':monthly_sale,
            'water_uncount':water_uncount,
            'monthly_uncount':monthly_uncount,

        }

    def dma_statistic_daily(self,day_list):
        """
            需要统计的日期列表
            month_list 是dma创建日期的月份其实列表，统计数据是从创建日期开始计算的
        """
        dmastations_list = self.station_assigned()
        
        # dmastations_list2 = self.station_set.values_list('meter__simid__simcardNumber','dmametertype')
        
        # print("create data month_list",month_list)
        
        # meter_types = ["出水表","进水表","贸易结算表","未计费水表","官网检测表"] 管网监测表
        # 进水表  加和---> 进水总量
        water_in = 0
        daily_in = ZERO_monthly_dict(day_list)
        meter_in = dmastations_list.filter(meter_type='进水表')
        
        for m in meter_in:
            commaddr = m.station_id
            
            if m.station_type == "2": #小区-- commaddr=VCommunity id
                community = VCommunity.objects.get(id=commaddr)
                community_id = community.amrs_community.id
                daily_use = hdb_watermeter_flow_daily(community_id,day_list)

            else:
                daily_use = Hdbflow_from_hdbflowday(commaddr,day_list) #HdbFlow_monthly(commaddr)
            
            # print(m.username,commaddr,daily_use)
            for k in daily_in.keys():
                if k in daily_use.keys():
                    daily_in[k] += daily_use[k]
                # else:
                #     daily_in[k] = 0
        water_in = sum([daily_in[k] for k in daily_in.keys()])
        
        # 出水表 加和--->出水总量
        water_out = 0
        daily_out = ZERO_monthly_dict(day_list)
        meter_out = dmastations_list.filter(meter_type='出水表')
        for m in meter_out:
            commaddr = m.station_id
            if m.station_type == "2": #小区-- commaddr=VCommunity id
                community = VCommunity.objects.get(id=commaddr)
                community_id = community.amrs_community.id
                daily_use = hdb_watermeter_flow_daily(community_id,day_list)

            else:
                daily_use = Hdbflow_from_hdbflowday(commaddr,day_list) #HdbFlow_monthly(commaddr)
            # print(m.username,commaddr,daily_use)
            for k in daily_out.keys():
                if k in daily_use.keys():
                    daily_out[k] += daily_use[k]
                # else:
                #     daily_out[k] = daily_use[k]
        water_out = sum([daily_out[k] for k in daily_out.keys()])
        
        # 售水量 = 所有贸易结算表的和
        water_sale = 0
        daily_sale = ZERO_monthly_dict(day_list)
        meter_sale = dmastations_list.filter(meter_type='贸易结算表')

        for m in meter_sale:
            commaddr = m.station_id
            # print("&*^&*%&$*(&^&---",commaddr,m.station_type)
            # if m.username == "文欣苑户表总表":
            # if commaddr == '4022':
            if m.station_type == "2": #小区-- commaddr=VCommunity id
                community = VCommunity.objects.get(id=commaddr)
                community_id = community.amrs_community.id
                daily_use = hdb_watermeter_flow_daily(community_id,day_list)

            else:
                daily_use = Hdbflow_from_hdbflowday(commaddr,day_list) #HdbFlow_monthly(commaddr)
            # print(m.username,commaddr,daily_use)
            for k in daily_sale.keys():
                if k in daily_use.keys():
                    daily_sale[k] += daily_use[k]
                # else:
                #     daily_sale[k] = daily_use[k]

        water_sale += sum([daily_sale[k] for k in daily_sale.keys()])
        
        # 未计量水量 = 所有未计费水表的和
        water_uncount = 0
        daily_uncount = ZERO_monthly_dict(day_list)
        meter_uncount = dmastations_list.filter(meter_type='未计费水表')
        for m in meter_uncount:
            commaddr = m.station_id
            if m.station_type == "2": #小区-- commaddr=VCommunity id
                community = VCommunity.objects.get(id=commaddr)
                community_id = community.amrs_community.id
                daily_use = hdb_watermeter_flow_daily(community_id,day_list)

            else:
                daily_use = Hdbflow_from_hdbflowday(commaddr,day_list) #HdbFlow_monthly(commaddr)
            # print(m.username,commaddr,daily_use)
            for k in daily_uncount.keys():
                if k in daily_use.keys():
                    daily_uncount[k] += daily_use[k]
                # else:
                #     daily_uncount[k] = daily_use[k]
        water_uncount = sum([daily_uncount[k] for k in daily_uncount.keys()])
        
        # 漏损量 = 供水量-售水量-未计费水量 分区内部进水表要减去自己内部出水表才等于这个分区的供水量

        return {
            'water_in':water_in,
            'daily_in':daily_in,
            'water_out':water_out,
            'daily_out':daily_out,
            'water_sale':water_sale,
            'daily_sale':daily_sale,
            'water_uncount':water_uncount,
            'daily_uncount':daily_uncount,

        }


    def dma_map_realdata(self):
        '''
            数据监控 DMA在线监控 选中dma需要获取的数据
            monitor/mapmonitor/maprealdata
        '''
        today = datetime.date.today()
        c_month = today.strftime("%Y-%m")
        
        yesmonth = datetime.date.today().replace(day=1) - datetime.timedelta(days=1)
        bc_month = yesmonth.strftime("%Y-%m")
        lastmonth = yesmonth.replace(day=1) - datetime.timedelta(days=1)
        bbc_month = lastmonth.strftime("%Y-%m")

        month_list = [bbc_month,bc_month,c_month]
        # print(month_list)
        monthreport = self.dma_statistic2(month_list)
        
        # 供水量 = 进水总量 - 出水总量
        # 漏损量 = 供水量-售水量-未计费水量

        current_month=[]    # 本月
        bcurrent_month=[]   # 上月
        bbcurrent_month=[]  #前月

        for m in month_list:
            # 本月进水
            monthly_in = round(float(monthreport["monthly_in"][m]),2)
            monthly_out = round(float(monthreport["monthly_out"][m]),2)
            monthly_sale = round(float(monthreport["monthly_sale"][m]),2)
            monthly_uncount = round(float(monthreport["monthly_uncount"][m]),2)

            monthly_provider = round(float(float(monthly_in) - float(monthly_out)),2)
            monthly_leak = round(float(float(monthly_provider - float(monthly_sale) - float(monthly_uncount))),2)
            monthly_in = round(monthly_in/10000,2)
            monthly_out = round(monthly_out/10000,2)
            monthly_provider = round(monthly_provider/10000,2)
            monthly_leak = round(monthly_leak/10000,2)

            if m == c_month:
                # 供水，进水，出水，漏损
                current_month_sale = round(float(monthly_sale),2)
                current_month=[monthly_provider,monthly_in,monthly_out,monthly_leak]
            elif m == bc_month:
                bcurrent_month=[monthly_provider,monthly_in,monthly_out,monthly_leak]
            else:
                bbcurrent_month=[monthly_provider,monthly_in,monthly_out,monthly_leak]
        
        
        yestoday = today - datetime.timedelta(days=1)
        byestoday = today - datetime.timedelta(days=2)
        bbyestoday = today - datetime.timedelta(days=3)
        d1 = today.strftime("%Y-%m-%d")
        d2 = yestoday.strftime("%Y-%m-%d")
        d3 = byestoday.strftime("%Y-%m-%d")
        d4 = bbyestoday.strftime("%Y-%m-%d")
        day_list = [d1,d2,d3,d4]
        daily_report = self.dma_statistic_daily(day_list)

        current_day     = [] #今日
        bcurrent_day     = [] #昨日
        bbcurrent_day     = [] #前日
        bbbcurrent_day     = [] #前前日

        for d in day_list:
            daily_in = round(float(daily_report["daily_in"][d]),2)
            daily_out = round(float(daily_report["daily_out"][d]),2)
            daily_sale = round(float(daily_report["daily_sale"][d]),2)
            daily_uncount = round(float(daily_report["daily_uncount"][d]),2)

            daily_provider = round(float(daily_in) - float(daily_out),2)
            daily_leak = round(daily_provider - float(daily_sale) - float(daily_uncount),2)

            if d == d1:
                current_day = [daily_provider,daily_in,daily_out,daily_leak]
            elif d == d2:
                bcurrent_day = [daily_provider,daily_in,daily_out,daily_leak]
            elif d == d3:
                bbcurrent_day = [daily_provider,daily_in,daily_out,daily_leak]
            else:
                bbbcurrent_day = [daily_provider,daily_in,daily_out,daily_leak]
        
        


        return {
            "dma_name":self.dma_name,
            "dma_no":self.dma_no,
            "current_month":current_month,
            "current_month_sale":current_month_sale,
            "bcurrent_month":bcurrent_month,
            "bbcurrent_month":bbcurrent_month,
            "current_day":current_day,
            "bcurrent_day":bcurrent_day,
            "bbcurrent_day":bbcurrent_day,
            "bbbcurrent_day":bbbcurrent_day,
            "bbbday_str":bbyestoday.strftime("%m-%d"),
        }


class DmaStation(models.Model):
    dmaid           = models.ForeignKey(DMABaseinfo,blank=True, null=True,on_delete=models.CASCADE) 
    station_id      = models.CharField(max_length=30)   # 大表 通讯地址commaddr 或者 小区id(由于小区可能关联多个集中器，所以不能直接保存集中器的commaddr)，由station_type 标识
    meter_type      = models.CharField(max_length=30)   # dma计算类型 ["出水表","进水表","贸易结算表","未计费水表","管网检测表"]
    station_type    = models.CharField(max_length=30)   # 大表还是小区 1-大表 2-小区

    class Meta:
        managed=True
        db_table = 'bsc_dmastation'  

    def __unicode__(self):
        return self.dmaid.dma_name

    def __str__(self):
        return self.dmaid.dma_name   


class StationQuerySet(models.query.QuerySet):
    def search(self, query): #RestaurantLocation.objects.all().search(query) #RestaurantLocation.objects.filter(something).search()
        if query:
            query = query.strip()
            return self.filter(
                Q(username__icontains=query)|
                Q(meter__serialnumber__icontains=query)|
                Q(meter__simid__simcardNumber__icontains=query)
                ).distinct()
        return self


class StationManager(models.Manager):
    def get_queryset(self):
        return StationQuerySet(self.model, using=self._db)

    def search(self, query): #RestaurantLocation.objects.search()
        return self.get_queryset().search(query)


class Station(models.Model):
    amrs_bigmeter = models.OneToOneField(Bigmeter,on_delete=models.CASCADE)
    belongto    = models.ForeignKey(Organization,on_delete=models.CASCADE) #所属组织
    meter       = models.ForeignKey(Meter,on_delete=models.SET_NULL, blank=True, null=True) #关联表具

    description = models.CharField(db_column='Description', max_length=30, blank=True, null=True)  # Field name made lowercase.
    biguser     = models.CharField(db_column='biguser', max_length=30, blank=True, null=True)  # Field name made lowercase.
    focus       = models.CharField(db_column='focus', max_length=30, blank=True, null=True)  # Field name made lowercase.
    # locate      = models.CharField(db_column='locate', max_length=30, blank=True, null=True)  # Field name made lowercase.
    # dmaid       = models.ForeignKey(DMABaseinfo,blank=True, null=True,on_delete=models.CASCADE) #所在dma分区
    dmaid       = models.ManyToManyField(DMABaseinfo)

    dmametertype     = models.CharField(db_column='dmaMeterType', max_length=30, blank=True, null=True)  # Field name made lowercase.

    objects = StationManager()

    class Meta:
        managed = True
        db_table = 'bsc_bigmeter'

    def __unicode__(self):
        return '%s'%(self.amrs_bigmeter.username)  

    def __str__(self):
        return '%s'%(self.amrs_bigmeter.username)        

# 集中器
class VConcentratorQuerySet(models.query.QuerySet):
    def search(self, query): #RestaurantLocation.objects.all().search(query) #RestaurantLocation.objects.filter(something).search()
        if query:
            query = query.strip()
            return self.filter(
                Q(amrs_concentrator__name__icontains=query)|
                Q(amrs_concentrator__commaddr__icontains=query)|
                Q(amrs_concentrator__serialnumber__icontains=query)
                ).distinct()
        return self


class VConcentratorManager(models.Manager):
    def get_queryset(self):
        return VConcentratorQuerySet(self.model, using=self._db)

    def search(self, query): #RestaurantLocation.objects.search()
        return self.get_queryset().search(query)

class VConcentrator(models.Model):
    amrs_concentrator = models.OneToOneField(Concentrator,on_delete=models.CASCADE)
    belongto = models.ForeignKey(Organization,on_delete=models.CASCADE)
    updated = models.DateTimeField(auto_now=True, auto_now_add=False)
    timestamp = models.DateTimeField(auto_now=False, auto_now_add=True)
  
    objects = VConcentratorManager()

    class Meta:
        managed = True
        db_table = 'bsc_concentrator'


    def __str__(self):
        return '{}:{}'.format(self.belongto.name,self.amrs_concentrator.name)

    def __unicode__(self):
        return '{}:{}'.format(self.belongto.name,self.amrs_concentrator.name)




# 小区
class VCommunityQuerySet(models.query.QuerySet):
    def search(self, query): #RestaurantLocation.objects.all().search(query) #RestaurantLocation.objects.filter(something).search()
        if query:
            query = query.strip()
            return self.filter(
                Q(amrs_community__name__icontains=query)
                ).distinct()
        return self


class VCommunityManager(models.Manager):
    def get_queryset(self):
        return VCommunityQuerySet(self.model, using=self._db)

    def search(self, query): #RestaurantLocation.objects.search()
        return self.get_queryset().search(query)

'''
从歙县导入过来的id，在威尔沃的服务器抄表系统中，可能不是同一个

歙县导入的Community数据的id保存到commutid，通过查找amrs_commutid获得真正的id(pk)
'''
class VCommunity(models.Model):
    amrs_community = models.OneToOneField(Community,on_delete=models.CASCADE)
    belongto = models.ForeignKey(Organization,on_delete=models.CASCADE)
    vconcentrators = models.ManyToManyField( VConcentrator )

    objects = VCommunityManager()

    class Meta:
        managed = True
        db_table = 'bsc_community'

    def __str__(self):
        return self.amrs_community.name

    def __unicode__(self):
        return self.amrs_community.name

    @property
    def name(self):
        return self.amrs_community.name




class VPressureQuerySet(models.query.QuerySet):
    def search(self, query): #RestaurantLocation.objects.all().search(query) #RestaurantLocation.objects.filter(something).search()
        if query:
            query = query.strip()
            return self.filter(
                Q(amrs_pressure__username__icontains=query)|
                Q(amrs_pressure__serialnumber__icontains=query)
                ).distinct()
        return self


class VPressureManager(models.Manager):
    def get_queryset(self):
        return VPressureQuerySet(self.model, using=self._db)

    def search(self, query): #RestaurantLocation.objects.search()
        return self.get_queryset().search(query)

class VPressure(models.Model):
    # 抄表系统没有专门的Pressure表，使用的是Bigmeter表
    amrs_pressure = models.OneToOneField(Bigmeter,on_delete=models.CASCADE)
    belongto    = models.ForeignKey(Organization,on_delete=models.CASCADE)
    # simid       = models.ForeignKey(SimCard,on_delete=models.SET_NULL,null=True) # Field name made lowercase.
    protocol    = models.CharField(db_column='Protocol', max_length=64, blank=True, null=True)  # Field name made lowercase.
    check_cycle = models.CharField(db_column='check cycle', max_length=64, blank=True, null=True)  # Field name made lowercase.
    state       = models.CharField(db_column='state', max_length=64, blank=True, null=True)  # Field name made lowercase.
    version     = models.CharField(db_column='version', max_length=30, blank=True, null=True)  # Field name made lowercase.型号
    
    objects = VPressureManager()

    class Meta:
        managed = True
        db_table = 'bsc_pressure'

    def __unicode__(self):
        return '%s'%(self.amrs_pressure.username)   

    def __str__(self):
        return '%s'%(self.amrs_pressure.username)    


# 二供

class VSecondWaterQuerySet(models.query.QuerySet):
    def search(self, query): #RestaurantLocation.objects.all().search(query) #RestaurantLocation.objects.filter(something).search()
        if query:
            query = query.strip()
            return self.filter(
                Q(amrs_secondwater__name__icontains=query)|
                Q(serialnumber__icontains=query)
                ).distinct()
        return self


class VSecondWaterManager(models.Manager):
    def get_queryset(self):
        return VSecondWaterQuerySet(self.model, using=self._db)

    def search(self, query): #RestaurantLocation.objects.search()
        return self.get_queryset().search(query)


class VSecondWater(models.Model):
    amrs_secondwater = models.OneToOneField(SecondWater,on_delete=models.CASCADE)
    serialnumber= models.CharField(db_column='SerialNumber', max_length=30, blank=True, null=True)  # 出厂编号
    belongto    = models.ForeignKey(Organization,on_delete=models.CASCADE) # 所属组织
    
    # 0 - 常州天厚 等
    version     = models.CharField(db_column='version', max_length=30, blank=True, null=True)  # 型号
    manufacturer= models.CharField(db_column='Manufacturer', max_length=30, blank=True, null=True)  # 厂家.
    
    product_date = models.CharField(db_column='product date', max_length=64, blank=True, null=True)  # 生成日期.
    artist       = models.CharField(db_column='artist', max_length=64, blank=True, null=True)  # Field name made lowercase.
    artistPreview       = models.CharField(db_column='artistPreview', max_length=256, blank=True, null=True)  # Field name made lowercase.

    objects = VSecondWaterManager()

    class Meta:
        managed = True
        db_table = 'bsc_secondwater'

    def __unicode__(self):
        return '%s'%(self.name)   

    def __str__(self):
        return '%s'%(self.name)    



# 水表 小表
class VWatermeterQuerySet(models.query.QuerySet):
    def search(self, query): #RestaurantLocation.objects.all().search(query) #RestaurantLocation.objects.filter(something).search()
        if query:
            query = query.strip()
            return self.filter(
                # Q(name__icontains=query)|
                Q(amrs_watermeter__numbersth__icontains=query)|
                Q(amrs_watermeter__buildingname__icontains=query)|
                Q(amrs_watermeter__roomname__icontains=query)|
                Q(amrs_watermeter__serialnumber__icontains=query)|
                Q(amrs_watermeter__wateraddr__icontains=query)|
                Q(amrs_watermeter__nodeaddr__icontains=query)
                ).distinct()
        return self


class VWatermeterManager(models.Manager):
    def get_queryset(self):
        return VWatermeterQuerySet(self.model, using=self._db)

    def search(self, query): #RestaurantLocation.objects.search()
        return self.get_queryset().search(query)


class VWatermeter(models.Model):
    amrs_watermeter = models.OneToOneField(Watermeter,on_delete=models.CASCADE)
    belongto = models.ForeignKey(Organization,on_delete=models.CASCADE)

    communityid = models.ForeignKey( VCommunity ,on_delete=models.CASCADE,related_name='watermeter')    #所属小区
    # 集中器是和小区关联的，所以集中器就是小区关联的集中器 
    # concentrator = models.ForeignKey( VConcentrator ,on_delete=models.CASCADE,null=True, blank=True,)    #所属集中器
    useraddr = models.CharField(db_column='UserAddr', max_length=255, blank=True, null=True)  # Field name made lowercase.
    # meter_catlog = models.CharField(db_column='meter_catlog', max_length=30, blank=True, null=True)  # Field name made lowercase.

    objects = VWatermeterManager()

    class Meta:
        managed = True
        db_table = 'bsc_watermeter'


    def __str__(self):
        return str(self.amrs_watermeter.serialnumber)

    def __unicode__(self):
        return str(self.waamrs_watermeter.serialnumberterid)

    @property
    def communityidnew(self):
        return self.communityid.pk




class DmaGisinfo(models.Model):
    dma_no        = models.CharField('分区编号',max_length=50, unique=True)
    geodata       = models.TextField(blank=True,null=True)
    strokeColor   = models.CharField(max_length=100,blank=True,null=True)
    fillColor     = models.CharField(max_length=100,blank=True,null=True)

    class Meta:
        managed=True
        db_table = 'bsc_dmagisinfo'  

    def __unicode__(self):
        return "{} polygon path".format(self.dma_no)

    def __str__(self):
        return "{} polygon path".format(self.dma_no)


# 当表具重新关联sim卡号，对应的大表的通讯地址commaddr和simid也要更新
def post_save_meter_receiver(sender, instance, *args, **kwargs):
    print('post_save_meter_receiver',instance)
    station = Station.objects.filter(meter=instance)
    if station.exists():
        bigmeter = station.first()
        amrs_bigmeter = bigmeter.amrs_bigmeter
        print("commaddr:",amrs_bigmeter.commaddr)
        simid = instance.simid.simcardNumber
        if simid != amrs_bigmeter.simid:
            amrs_bigmeter.simid = simid
            amrs_bigmeter.commaddr = simid
            try:
                amrs_bigmeter.save()
                bigmeter.amrs_bigmeter = amrs_bigmeter
                bigmeter.save()
            except Exception as e:
                print(e)
                pass
     

post_save.connect(post_save_meter_receiver, sender=Meter)     