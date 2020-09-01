# -*- coding:utf-8 -*-
from django.db.models import Q

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.filters import (
        SearchFilter,
        OrderingFilter,
    )
from rest_framework.generics import (
    CreateAPIView,
    DestroyAPIView,
    ListAPIView, 
    UpdateAPIView,
    RetrieveAPIView,
    RetrieveUpdateAPIView
    )

from rest_framework.mixins import DestroyModelMixin, UpdateModelMixin


from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,

    )

from accounts.models import MyRoles,User
from core.models import (
    Organization,
    SimCard,
    Meter,
    VConcentrator,
    Station,
    VSecondWater,
    DMABaseinfo,
    DmaStation,
)
from amrs.models import (
    Concentrator,
    Community,
    Bigmeter,
    SecondWater
)
from django.contrib.gis.geos import Polygon
from ggis.models import FenceDistrict,FenceShape
# from .pagination import PostLimitOffsetPagination, PostPageNumberPagination
# from .permissions import IsOwnerOrReadOnly

from .serializers import (
    FenceDistrictSerializer, 
    FenceCreateSerializer,
    FenceDetailSerializer,
    FenceTreeSerializer,
)

import json


class FenceDistrictCreateAPIView(CreateAPIView):
    queryset = FenceDistrict.objects.all()
    serializer_class = FenceCreateSerializer
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        # print('fence post:',self.request.POST)
        # print('request.data:',self.request.data)
        data = {}
        data["name"] = self.request.data.get("name")
        data["ftype"] = self.request.data.get("ftype")
        data["pId"] = self.request.data.get("pId")
        data["dma_no"] = self.request.data.get("dma_no")
        data["description"] = self.request.data.get("description")
        data["createDataUsername"] = self.request.user.user_name
        data["updateDataUsername"] = self.request.user.user_name
        # data["createDataUsername"] = self.request.data.get("createDataUsername")
        organ_name = self.request.data.get("belongto")
        try:
            belongto = Organization.objects.filter(name=organ_name).first()
            data["belongto"] = belongto.pk
        except Exception as e:
            print(e)
            data["belongto"] = Organization.objects.first().pk
        shape = {
            "zonetype":self.request.data.get("type"),
            "shape":self.request.data.get("shape"),
            "geomjson":self.request.data.get("pgeojson")
        }
        data["shape"] = shape
        # print('\r\t\r\tdata:',data)
        serializer = FenceCreateSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success":1})
        return Response(serializer.errors)
    
    # def post(self, request, *args, **kwargs):
    #     print(self.request)
    #     return self.create(request, *args, **kwargs)

    # def perform_create(self, serializer):
    #     print('perform_create:',self.request)

    #     serializer.save()


class FenceDetailAPIView(DestroyModelMixin, UpdateModelMixin,RetrieveAPIView):
    queryset = FenceDistrict.objects.filter(id__gte=0)
    serializer_class = FenceDetailSerializer
    lookup_field = 'cid'
    # permission_classes = [IsOwnerOrReadOnly]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = {}
        data["name"] = self.request.data.get("name")
        data["ftype"] = self.request.data.get("ftype")
        data["pId"] = self.request.data.get("pId")
        data["dma_no"] = self.request.data.get("dma_no")
        data["description"] = self.request.data.get("description")
        data["createDataUsername"] = self.request.user.user_name
        data["updateDataUsername"] = self.request.user.user_name
        data["description"] = self.request.data.get("description")
        organ_name = self.request.data.get("belongto")
        try:
            belongto = Organization.objects.filter(name=organ_name).first()
            data["belongto"] = belongto
        except Exception as e:
            print(e)
            data["belongto"] = Organization.objects.first()

        shape = {
            "zonetype":self.request.data.get("type"),
            "shape":self.request.data.get("shape"),
            "geomjson":self.request.data.get("pgeojson")
        }
        data["shape"] = shape

        


        serializer = self.get_serializer(instance, data=data, partial=partial)
        if serializer.is_valid(raise_exception=True):
            serializer.save()

            return Response({"success":1})
        return Response(serializer.errors)


        # return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)
        
    def post(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class FenceDistrictListAPIView(ListAPIView):
    queryset = FenceDistrict.objects.all()
    serializer_class = FenceDistrictSerializer

@api_view(['GET',])
def fencetree(request):
    fentree = [{"name":"圆形","pId":"-","id":"zw_m_circle","type":"fenceParent","open":"true"},
                {"name":"矩形","pId":"-","id":"zw_m_rectangle","type":"fenceParent","open":"true"},
                {"name":"多边形","pId":"-","id":"zw_m_polygon","type":"fenceParent","open":"true"},
                {"name":"行政区划","pId":"-","id":"zw_m_administration","type":"fenceParent","open":"true"},]

    fence_lists = request.user.belongto.fence_list_queryset()
    # dmabase = DMABaseinfo.objects.get(dma_no=dma_no)
    fence_serializer = FenceTreeSerializer(fence_lists,many=True).data
    # fentree += [s for s in fence_serializer]
    organ = {}
    for fs in fence_serializer:
        tmp_key = "{}_{}".format(fs["belongto__cid"],fs["pId"])
        if tmp_key not in organ:
            organ[tmp_key] = fs["belongto__name"]
            fens_organ = {
            "name":fs["belongto__name"],
            "pId":fs["pId"],
            "id":tmp_key, #fs["belongto__cid"]
            }
            fentree.append(fens_organ)
        polygon = {
            "name":fs["name"],
            "pId":tmp_key,#fs["belongto__cid"],
            "pType":fs["pId"],
            "id":fs["cid"],
            "type":fs["ftype"],
            "open":"true"
            }
        
        if fs["pId"] == "zw_m_polygon":
            polygon["iconSkin"]="zw_m_polygon_skin",
        if fs["pId"] == "zw_m_rectangle":
            polygon["iconSkin"]="zw_m_rectangle_skin",
        if fs["pId"] == "zw_m_circle":
            polygon["iconSkin"]="zw_m_circle_skin",
        if fs["pId"] == "zw_m_administration":
            polygon["iconSkin"]="zw_m_administration_skin",
        fentree.append(polygon)

    return Response(fentree)
    
@api_view(['GET',])
def getFenceDetails(request):
    dma_no = request.GET.get("dma_no") or ''
    fenceNodes = request.GET.get("fenceNodes")
    data = []

    
    
    if dma_no != '':
        try:
            fence = FenceDistrict.objects.get(dma_no=dma_no)
            
            properties = {
                "strokeColor":fence.shape.strokeColor,
                "fillColor":fence.shape.fillColor,
                "name":fence.name,
                "shapeId":fence.cid,
                "description":fence.description,
                "belongto":fence.belongto.name,
                "dma_no":fence.dma_no,
                "type":fence.shape.zonetype
            }
            jd = json.loads(fence.shape.geomjson)
            # print("jd:",jd)
            
            if jd.get('type') == 'FeatureCollection':
                feature = jd['features'][0]['geometry']
            else:
                feature = jd #jd['geometry']
            feature["properties"] = properties
            # feature['features'][0]["properties"] = properties 
            data.append(feature)
        except Exception as e:
            print(e)
            pass
        
    
        
    # print(data)
    FeatureCollection = {
        "type":"FeatureCollection",
        "features":data
    }
    
    return Response(FeatureCollection)

@api_view(['GET',])
def fenceselected(request):
    fenceNodes = request.GET.get("fenceNodes")

    
    fenceNodes_json = json.loads(fenceNodes)
    print("json ?",fenceNodes_json,type(fenceNodes_json[0]),len(fenceNodes_json))

    

    data = []
    for i in range(len(fenceNodes_json)):
        name=fenceNodes_json[i]["name"]
        fence = FenceDistrict.objects.get(name=name)
        
        properties = {
            "strokeColor":fence.shape.strokeColor,
            "fillColor":fence.shape.fillColor,
            "name":fence.name,
            "shapeId":fence.cid,
            "description":fence.description,
            "belongto":fence.belongto.name,
            "dma_no":fence.dma_no,
            "type":fence.shape.zonetype
        }
        jd = json.loads(fence.shape.geomjson)
        # print(feature)
        if jd.get('type') == 'FeatureCollection':
            feature = jd['features'][0]['geometry']
        else:
            feature = jd #jd['geometry']
        feature["properties"] = properties
        # feature['features'][0]["properties"] = properties 
        data.append(feature)
        
    # print(data)
    FeatureCollection = {
        "type":"FeatureCollection",
        "features":data
    }
    
    return Response(FeatureCollection)



@api_view(['GET',])
def fencepreview(request):
    fenceId = request.GET.get("fenceId")

    
    data = []
    fence = FenceDistrict.objects.get(cid=fenceId)
        
    properties = {
        "strokeColor":fence.shape.strokeColor,
        "fillColor":fence.shape.fillColor,
        "name":fence.name,
        "shapeId":fence.cid,
        "fencetype":fence.pId,
        "description":fence.description,
        "belongto":fence.belongto.name,
        "dma_no":fence.dma_no,
        "type":fence.shape.zonetype
    }
    jd = json.loads(fence.shape.geomjson)
    if jd.get('type') == 'FeatureCollection':
        feature = jd['features'][0]['geometry']
    else:
        feature = jd #jd['geometry']
    feature["properties"] = properties

    # return Response(feature)

    data.append(feature)
        
    # print(data)
    FeatureCollection = {
        "type":"FeatureCollection",
        "features":data,
        "pgeojson":fence.shape.geomjson
    }
    
    return Response(FeatureCollection)

        

@api_view(['POST',])
def fenceupdate(request):    
    '''
        ggis 官网查询 修改分区框图
    '''    
    polygonId = request.data.get("polygonId")
    try:
        instance = FenceDistrict.objects.get(cid=polygonId)
    except Exception as e:
        print(e)
        return Response({"success":False})
        
    data = {}
    data["name"] = request.data.get("name")
    data["ftype"] = request.data.get("ftype")
    data["pId"] = request.data.get("pId")
    data["dma_no"] = request.data.get("dma_no")
    data["description"] = request.data.get("description")
    data["createDataUsername"] = request.user.user_name
    data["updateDataUsername"] = request.user.user_name
    # data["createDataUsername"] = request.data.get("createDataUsername")
    organ_name = request.data.get("belongto")
    belongto = Organization.objects.filter(name=organ_name).first()
    data["belongto"] = belongto.pk
    shape = {
        "zonetype":request.data.get("type"),
        "shape":request.data.get("shape"),
        "geomjson":request.data.get("pgeojson")
    }
    data["shape"] = shape
    
    serializer = FenceDetailSerializer(instance, data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({"success":1})
    return Response(serializer.errors)



@api_view(['POST',])
def fencedelete(request):    
    '''
        ggis 官网查询 修改分区框图
    '''    
    fenceId = request.data.get("fenceId")
    try:
        instance = FenceDistrict.objects.get(cid=fenceId)
    except Exception as e:
        print(e)
        return Response({"success":False})

    try:
        instance.shape.delete()
    except:
        print(e)
        return Response({"error":e})

    return Response({"success":False})
        

@api_view(['GET',])
def getdmageojson_box(request):
    print(request.GET)
    print(request.POST)
    left = request.GET.get('left')
    top = request.GET.get('top')
    right = request.GET.get('right')
    bottom = request.GET.get('bottom')
    # fenceNode = request.GET.get('fenceNode','resere')
    fenceNodes = request.GET.get("fenceNodes")

    # (u'118.28575800964357', u'29.8010417315232', u'118.53518199035648', u'29.924899835516314')
    # left = 118.28575800964357
    # top = 29.8010417315232
    # right = 118.53518199035648
    # bottom = 29.924899835516314
    print('1.12...',left,top,right,bottom)
    bbox = (float(left),float(top),float(right),float(bottom))
    print(bbox)
    geom = Polygon.from_bbox(bbox)
    print('geom:',geom)

    # pgeojson = {"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[13178892.355395831,3489944.851357296],[13181281.012238158,3490454.4314972665],[13181822.4413829,3488777.063506157],[13180803.280811375,3487460.647792236],[13178648.181393484,3487938.3792190184],[13178202.298825681,3489021.2372169197],[13178892.355395831,3489944.851357296]]]},"properties":"null"}]}
    # return JsonResponse(pgeojson)

    # geodata=FenceShape.objects.filter(geomdata__intersects=geom)
    rsql = '''
        SELECT id,geomdata,geomjson FROM  `bsc_fenceshape` 
        WHERE 
            within(geomdata,
                GEOMFROMTEXT('{}', 0 )
            )
    ;
    '''.format(geom)
    geodata = FenceShape.objects.raw(rsql)
    data = []
    data_property = []
    for q in geodata:
        f=FenceShape.objects.get(name=q.name)
        dma_no = f.dma_no
        try:
            dma = DMABaseinfo.objects.get(dma_no=dma_no)
            # 地图初始只显示2级分区
            dma_level = dma.dma_level
            # if dma_level != '2':
            #     continue
        except:
            dma_level = '2'
        
        properties = {"strokeColor":q.strokeColor,"fillColor":q.fillColor,"name":q.name,"dma_level":dma_level}
        data.append(json.loads(f.geomdata.geojson))
        data_property.append(properties)

        
    
    # return return_feature_collection(data)
    ret =  build_feature_collection(data,data_property)
    
    return JsonResponse(ret)        


@api_view(['GET',])
def getdmageojson(request):
    left = request.GET.get('left') or 118.28575800964357
    top = request.GET.get('top') or 29.8010417315232
    right = request.GET.get('right') or 118.53518199035648
    bottom = request.GET.get('bottom') or 29.924899835516314
    # fenceNode = request.GET.get('fenceNode','resere')
    fenceNodes = request.GET.get("fenceNodes")

    # (u'118.28575800964357', u'29.8010417315232', u'118.53518199035648', u'29.924899835516314')
    # left = 118.28575800964357
    # top = 29.8010417315232
    # right = 118.53518199035648
    # bottom = 29.924899835516314
    print('1.12...',left,top,right,bottom)
    bbox = (float(left),float(top),float(right),float(bottom))
    print(bbox)
    geom = Polygon.from_bbox(bbox)
    print('geom:',geom)

    # pgeojson = {"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[13178892.355395831,3489944.851357296],[13181281.012238158,3490454.4314972665],[13181822.4413829,3488777.063506157],[13180803.280811375,3487460.647792236],[13178648.181393484,3487938.3792190184],[13178202.298825681,3489021.2372169197],[13178892.355395831,3489944.851357296]]]},"properties":"null"}]}
    # return JsonResponse(pgeojson)

    # geodata=FenceShape.objects.filter(geomdata__intersects=geom)
    rsql = '''
        SELECT id,geomdata,geomjson FROM  `bsc_fenceshape` 
        WHERE 
            within(geomdata,
                GEOMFROMTEXT('{}', 0 )
            )
    ;
    '''.format(geom)
    geodata = FenceShape.objects.raw(rsql)
    data = []
    data_property = []
    for q in geodata:

    # data = []
    # for fence in FenceDistrict.objects.all():
        fence = q.fencedistrict
        properties = {
            "strokeColor":fence.shape.strokeColor,
            "fillColor":fence.shape.fillColor,
            "name":fence.name,
            "shapeId":fence.cid,
            "description":fence.description,
            "belongto":fence.belongto.name,
            "dma_no":fence.dma_no,
            "dma_level":2,
            "type":fence.shape.zonetype
        }
        feature = json.loads(fence.shape.geomjson)
        feature["properties"] = properties #json.dumps(properties)
        data.append(feature)
        
    # print(data)
    FeatureCollection = {
        "type":"FeatureCollection",
        "features":data
    }
    
    return Response(FeatureCollection)

