# # -*- coding: utf-8 -*-
# from __future__ import unicode_literals

# from django.db import models
# from django.urls import reverse
# from mptt.models import MPTTModel, TreeForeignKey
# # from dmam.models import DMABaseinfo

# # Create your models here.

# class OrganizationQuerySet(models.query.QuerySet):
#     def search(self, query): #RestaurantLocation.objects.all().search(query) #RestaurantLocation.objects.filter(something).search()
#         if query:
#             query = query.strip()
#             return self.filter(
#                 Q(name__icontains=query)|
#                 Q(cid__iexact=query)
#                 ).distinct()
#         return self


# class OrganizationManager(models.Manager):
#     def get_queryset(self):
#         return OrganizationQuerySet(self.model, using=self._db)

#     def search(self, query): #RestaurantLocation.objects.search()
#         return self.get_queryset().search(query)

# class Organizations(MPTTModel):
#     name               = models.CharField('组织机构名称',max_length=300,null=True)
#     attribute          = models.CharField('组织机构性质',max_length=300,null=True,blank=True)
#     register_date      = models.CharField('注册日期',max_length=30,null=True,blank=True)
#     owner_name         = models.CharField('负责人',max_length=300,null=True,blank=True)
#     phone_number       = models.CharField('电话号码',max_length=300,null=True,blank=True)
#     firm_address       = models.CharField('地址',max_length=300,null=True,blank=True)

#     # 组织级别
#     organlevel         = models.CharField('Level',max_length=30,null=True,blank=True)
#     # add new
#     coorType    = models.CharField(max_length=30,null=True,blank=True)
#     longitude   = models.CharField(max_length=30,null=True,blank=True)
#     latitude    = models.CharField(max_length=30,null=True,blank=True)
#     zoomIn      = models.CharField(max_length=30,null=True,blank=True)
#     islocation  = models.CharField(max_length=30,null=True,blank=True)
#     location    = models.CharField(max_length=30,null=True,blank=True)
#     province    = models.CharField(max_length=30,null=True,blank=True)
#     city        = models.CharField(max_length=30,null=True,blank=True)
#     district    = models.CharField(max_length=30,null=True,blank=True)

#     cid           = models.CharField(max_length=300,null=True,blank=True)
#     pId           = models.CharField(max_length=300,null=True,blank=True)
#     is_org        = models.BooleanField(max_length=300,blank=True)
#     uuid          = models.CharField(max_length=300,null=True,blank=True)

#     adcode        = models.CharField(max_length=300,null=True,blank=True) #行政代码
#     districtlevel = models.CharField(max_length=300,null=True,blank=True)   #行政级别

#     parent  = TreeForeignKey('self', null=True, blank=True,on_delete=models.CASCADE, related_name='children', db_index=True)

#     class MPTTMeta:
#         order_insertion_by = ['name']

#     class Meta:
#         managed = True
#         db_table = 'organizations'

#         permissions = (
            

#             # 企业管理 sub
#             ('firmmanager','企业管理'),
#             ('rolemanager_firmmanager','角色管理'),
#             ('rolemanager_firmmanager_edit','角色管理_可写'),
#             ('organusermanager_firmmanager','组织和用户管理'),
#             ('organusermanager_firmmanager_edit','组织和用户管理_可写'),

            
#         )

#     def __unicode__(self):
#         return self.name    

#     def __str__(self):
#         return self.name 

#     def sub_organizations(self,include_self=False):
#         return self.get_descendants(include_self)

#     def sub_stations(self,include_self=False):
#         return self.get_descendants(include_self)

#     def dma_list_queryset(self):
#         # if self.is_admin:
#         #     return DMABaseinfo.objects.search(cid,level,dma_no)

#         dmalist = Organizations.objects.none()
#         #下级组织的用户
#         sub_organs = self.sub_organizations(include_self=True)
#         # user | merge two QuerySet
#         for g in sub_organs:
#             dmalist |= g.dma.all()
            
#         return dmalist

#     def before_delete_it(self):
#         '''
#         1、当只有站点时，删除组织时，其所属的站点自动移到上级组织，包括SIM卡，表具和站点，
#             如果该组织以下还有子组织，不论该子组织是否有站点，都不能删除，必须先删除了子组织，才可以删除该组织，
#             以此类推。如果子组织下有站点时，删除子组织时，站点自动移入到父级组织。
#             只要组织可以删除时，其下所有用户自动删除。
#         2、当有DMA分区时，该组织不可删除，要想删除，步骤为：
#             先解除DMA绑定站点，即把DMA分区内的所有站点和小区等全部移出分区，
#             然后才可以删除DMA分区，等到组织内没有任何DMA分区时，再按照第一条原则删除组织。'''
#         # station
#         if self.dma.all().count() > 0:
#             print('dma exists ,cant delete.')
#             return False
#         # 站点
#         for s in self.station_set.all():
#             print("before delete station set to parant organzation")
#             s.belongto = self.parent
#             s.save()
#         # 表具
#         for m in self.meter_set.all():
#             print("before delete meter set to parant organzation")
#             m.belongto = self.parent
#             m.save()
#         # SIM卡
#         for s in self.simcard_set.all():
#             print("before delete simcart set to parant organzation")
#             s.belongto = self.parent
#             s.save()
#         # 小区
#         for c in self.vcommunity_set.all():
#             print("before delete comunity set to parant organzation")
#             c.belongto = self.parent
#             c.save()
#         # 集中器
#         for c in self.vconcentrator_set.all():
#             print("before delete concentor set to parant organzation")
#             c.belongto = self.parent
#             c.save()
#         # 二供
#         for c in self.vsecondwater_set.all():
#             print("before delete secondwater set to parant organzation")
#             c.belongto = self.parent
#             c.save()
#         # 压力
#         for c in self.vpressure_set.all():
#             print("before delete pressure set to parant organzation")
#             c.belongto = self.parent
#             c.save()
#         # 户表
#         for c in self.vwatermeter_set.all():
#             print("before delete watermeter set to parant organzation")
#             c.belongto = self.parent
#             c.save()

#         return True


# class PorgressBar(models.Model):
#     totoal      = models.IntegerField(default=1)
#     progress    = models.IntegerField(default=0)

#     class Meta:
#         managed=True
#         db_table='porgressbar'

#     def progress_add(self):
#         self.progress += 1

#     def progress_set(self,n):
#         self.totoal = n

#     def progress_reset(self):
#         self.totoal = 1
#         self.progress = 0

