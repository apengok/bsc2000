# -*- coding: utf-8 -*-
from __future__ import unicode_literals

# from django.db import models
from django.contrib.gis.db import models
from django.urls import reverse
import datetime
from django.db.models import Q
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.db.models.signals import pre_save
from django.db.models import Avg, Max, Min, Sum
from django.utils.functional import cached_property
import time
import json
from mptt.models import MPTTModel, TreeForeignKey

from ggis.GGaussCoordConvert import Mercator2lonLat
from django.contrib.gis.geos import GEOSGeometry
from django.db import connection

from core.models import Organization


def build_feature_collection(cur,prop):
    """
    Execute a JSON-returning SQL and return HTTP response
    :type sql: SQL statement that returns a a GeoJSON Feature
    """
    features = []
    for idx,row in enumerate(cur):
        print('row data',row)
        coords = row["coordinates"][0]
        coords_trans = [[float(p[0]),float(p[1])] for p in coords]
        row["coordinates"] = [coords_trans]
        feature = {
                "geometry":row,#json.dumps(row),
                "type":"Feature",
                "properties":prop[idx]
            }
        features.append(feature)
    
    FeatureCollection = {
        "type":"FeatureCollection",
        "features":features
    }
        
    return FeatureCollection

class FenceShape(models.Model):
    # shapeId   = models.CharField(max_length=255,null=True,blank=True)   # =FenceDistrict.cid 形状公用，由shape区分
    # name   = models.CharField('区域名称',max_length=100,unique=True)
    zonetype   = models.CharField('区域类型',max_length=30,null=True,blank=True)
    shape   = models.CharField('形状',max_length=30,null=True,blank=True)
    
    # 增加geometry 数据类型直接保存geom
    geomdata = models.GeometryField(srid=0, blank=True, null=True)
    geomjson = models.TextField(blank=True, null=True)
    

   
    # 行政区：省、市、区
    province   = models.CharField(max_length=30,null=True,blank=True)
    city   = models.CharField(max_length=30,null=True,blank=True)
    district   = models.CharField(max_length=30,null=True,blank=True)
    administrativeLngLat = models.TextField()

    # 边框和区域填色
    strokeColor   = models.CharField(max_length=100,blank=True,null=True)
    fillColor     = models.CharField(max_length=100,blank=True,null=True)



    class Meta:
        managed = True
        db_table = 'bsc_fenceshape'


    def __unicode__(self):
        return self.name    

    def __str__(self):
        return self.fencedistrict.name 


    def geojsondata(self):
        pointSeqs = self.pointSeqs.split(',')
        longitudes = self.longitudes.split(',')
        latitudes = self.latitudes.split(',')

        coords = [list(p) for p in zip(longitudes,latitudes)]
        coords.append([float(longitudes[0]),float(latitudes[0])])

        coords_trans = [[float(p[0]),float(p[1])] for p in coords]

        coordinates = []
        coordinates.append(coords_trans)


        geodata = {
            "type":"Polygon",
            "coordinates":coordinates,
            # "properties":{"name":self.name}
        }

        print('\r\n\r\n',geodata,type(geodata))

        return geodata

    def geojsondata_mercator(self):
        pointSeqs = self.pointSeqs.split(',')
        longitudes = self.longitudes.split(',')
        latitudes = self.latitudes.split(',')

        coords = [list(p) for p in zip(longitudes,latitudes)]
        coords.append([longitudes[0],latitudes[0]])

        coords_trans = [Mercator2lonLat(float(p[0]),float(p[1])) for p in coords]

        coordinates = []
        coordinates.append(coords_trans)

        geodata = {
            "type":"Polygon",
            "coordinates":coordinates,
            # "properties":{"name":self.name}
            
        }

        return geodata

    def featureCollection(self):
        data = []
        data_property = []
        properties = {"strokeColor":self.strokeColor,"fillColor":self.fillColor,"name":self.name}
        data.append(json.loads(self.geomdata.geojson))
        data_property.append(properties)
        

        return build_feature_collection(data,data_property)

    

'''
{"name":"标注","pId":"","id":"zw_m_marker","type":"fenceParent","open":"true"},
{"name":"矩形","pId":"","id":"zw_m_rectangle","type":"fenceParent","open":"true"},
{"name":"圆形","pId":"","id":"zw_m_circle","type":"fenceParent","open":"true"},
{"name":"多边形","pId":"0","id":"zw_m_polygon","type":"fenceParent","open":"true"},
{"name":"行政区划","pId":"0","id":"zw_m_administration","type":"fenceParent","open":"true"},
'''                
class FenceDistrict(models.Model):
    name               = models.CharField('区域名称',max_length=100,unique=True)
    ftype               = models.CharField('区域类型',max_length=30,null=True,blank=True) #fenceParent,fence
    createDataUsername  = models.CharField('创建人',max_length=30,null=True,blank=True)
    updateDataUsername  = models.CharField('修改人',max_length=30,null=True,blank=True)
    description       = models.TextField('描述',null=True,blank=True)

    cid          = models.CharField(max_length=100,null=True,blank=True)
    pId          = models.CharField(max_length=100,null=True,blank=True)

    belongto     = models.ForeignKey(Organization,on_delete=models.CASCADE,null=True)

    shape        = models.OneToOneField(FenceShape, null=True, blank=True,on_delete=models.CASCADE)
    dma_no       = models.CharField(max_length=30,null=True,blank=True) #关联的dma分区  

    updateDataTime = models.DateTimeField(auto_now=True, auto_now_add=False)
    createDataTime = models.DateTimeField(auto_now=False, auto_now_add=True)

    class Meta:
        managed = True
        db_table = 'bsc_fencedistrict'

        

    def __unicode__(self):
        return self.name    

    def __str__(self):
        return self.name 

    def featureCollection(self):
        '''
            self.shape.geomjson 保存的是FeatureCollection （之前保存的是geometry）
            但是strokeColor，fillColor暂时没有值，所以做一个转发
        '''
        data = []
        properties = {
            "strokeColor":self.shape.strokeColor,
            "fillColor":self.shape.fillColor,
            "name":self.name,
            "shapeId":self.cid,
            "fencetype":self.pId,
            "description":self.description,
            "belongto":self.belongto.name,
            "dma_no":self.dma_no,
            "type":self.shape.zonetype,
            "dma_level":"2"
        }
        jd = json.loads(self.shape.geomjson)
        if jd.get('type') == 'FeatureCollection':
            feature = jd['features'][0]['geometry']
        else:
            feature = jd['geometry']
        feature["properties"] = properties #json.dumps(properties)
        data.append(feature)
            
        # print(data)
        FeatureCollection = {
            "type":"FeatureCollection",
            "features":data,
            # "pgeojson":fence.shape.geomjson
        }

        return FeatureCollection


from entm.utils import unique_shapeid_generator,unique_cid_generator

def pre_save_post_receiver(sender, instance, *args, **kwargs):
    if not instance.cid:
        # instance.slug = create_slug(instance)
        instance.cid = unique_cid_generator(instance)
        
def polygon_pre_save_post_receiver(sender, instance, *args, **kwargs):
    '''
        This backend doesn't support the Transform function. 
        so,use the raw sql
    '''
    shape_id = instance.shape.id
    strokeColor = instance.shape.strokeColor
    fillColor = instance.shape.fillColor
    province   = instance.shape.province
    city   = instance.shape.city
    district   =instance.shape.district
    administrativeLngLat =instance.shape.administrativeLngLat
    try:
        

        # geomdata
        jd = json.loads(instance.shape.geomjson)
        if jd.get('type') == 'FeatureCollection':
            feature = jd['features'][0]['geometry']
        else:
            feature = jd['geometry']
        stype = feature.get('type')
        d = feature.get('coordinates')[0]
        coordstr = ','.join('%s %s'%(a[0],a[1]) for a in d)
        wkt = "GeomFromText('{}(({}))')".format(stype.upper(),coordstr)
        # name = instance.name
        strSql="""update bsc_fenceshape set geomdata=%s,geomjson='%s',fillColor='%s',strokeColor='%s',province='%s',city='%s',district='%s',administrativeLngLat='%s' where id='%s'  """%(
                wkt,instance.shape.geomjson,fillColor,strokeColor,province,city,district,administrativeLngLat,shape_id
            )
        print(strSql)
        # Warning: (1287, "'GEOMFROMTEXT' is deprecated and will be removed in a future release. Please use ST_GEOMFROMTEXT instead")
        with connection.cursor() as cursor:
            cursor.execute(strSql)

    except Exception as e:
        print('Error shows :',e)
        
pre_save.connect(pre_save_post_receiver, sender=FenceDistrict)        
post_save.connect(polygon_pre_save_post_receiver, sender=FenceDistrict)

