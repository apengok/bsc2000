# -*- coding: utf-8 -*-
from rest_framework import generics 
from rest_framework import status,viewsets
from .serializers import MyRolesListSerializer, MyRolesDetailSerializer,MyRolesSerializer
from accounts.models import MyRoles
from rest_framework.decorators import action,api_view
from rest_framework.response import Response

from django.http import HttpResponse,JsonResponse,HttpResponseRedirect,StreamingHttpResponse,Http404
import json
from core.menus import choicetreedict

from rest_framework.permissions import IsAdminUser,IsAuthenticated
from rest_framework import renderers
from rest_framework.mixins import (
    CreateModelMixin,
    ListModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
    DestroyModelMixin
)


class MyRolesListView(generics.ListAPIView):
    """View For List All Published MyRoles"""

    queryset = MyRoles.objects.all()
    serializer_class = MyRolesListSerializer


class MyRolesDetailView(generics.RetrieveAPIView):
    """View For The Details Of A Single MyRoles"""

    queryset = MyRoles.objects.all()
    serializer_class = MyRolesDetailSerializer

class MyRolesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows MyRoles to be viewed or edited.
    """
    queryset = MyRoles.objects.all()   #.order_by('-date_joined')
    serializer_class = MyRolesSerializer



def buildFrontbasetree2():
    ctree = []
    

    for key in choicetreedict.keys():
        pname = choicetreedict[key]["name"]
        pid = key
        

        tmp1 = {}
        tmp1["name"] = pname
        tmp1["pId"] = 0
        tmp1["id"] = pid
        # tmp1["checked"] = "true"    #nocheck
        tmp1["nocheck"] = "true"
        
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
            # tmp2["checked"] = "true"
            
            ctree.append(tmp2)

        

            

    return ctree    

@api_view(['GET','POST'])
def choicePermissionTree(request):
    user = request.user
    if not user.Role:
        if user.is_admin:
            return HttpResponse(json.dumps(buildFrontbasetree2())) 
    rid = user.Role.rid
    # rid = request.POST.get("roleId") or ''
    print(" get choicePermissionTree",rid)

    
    # print('buildtree:',buildtree)

    if len(rid) <= 0:
        user = request.user
        if user.is_admin:
            return HttpResponse(json.dumps(buildFrontbasetree2()))
        permissiontree = user.Role.permissionTree

    else:
        instance = MyRoles.objects.get(rid=rid)
        permissiontree = instance.permissionTree


    if len(permissiontree) > 0:
        ptree = json.loads(permissiontree)
        buildtree = buildFrontbasetree(request,ptree)
            


    return Response(result)

    return HttpResponse(json.dumps(buildtree))


class MyRoleViewSet(CreateModelMixin,
    ListModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
    DestroyModelMixin,
    generics.GenericAPIView,
    viewsets.ViewSet):

    serializer_class = MyRolesSerializer
    queryset = MyRoles.objects.all()

    def list(self, request):
        draw = 1
        length = 0
        start=0
        print('role list')
        if request.method == "GET":
            draw = int(request.GET.get("draw", 1))
            length = int(request.GET.get("length", 10))
            start = int(request.GET.get("start", 0))
            pageSize = int(request.GET.get("pageSize", 10))
            search_value = request.GET.get("search[value]", None)
            simpleQueryParam = request.POST.get("simpleQueryParam")
            # order_column = request.GET.get("order[0][column]", None)[0]
            # order = request.GET.get("order[0][dir]", None)[0]

        if request.method == "POST":
            draw = int(request.POST.get("draw", 1))
            length = int(request.POST.get("length", 10))
            start = int(request.POST.get("start", 0))
            pageSize = int(request.POST.get("pageSize", 10))
            search_value = request.POST.get("search[value]", None)
            simpleQueryParam = request.POST.get("simpleQueryParam")
            # order_column = request.POST.get("order[0][column]", None)[0]
            # order = request.POST.get("order[0][dir]", None)[0]

        # print("get rolelist:",draw,length,start,search_value)
        current_user = request.user
        

        data = []
        # rolel = current_user.role_list()
        serializer = self.get_serializer(self.queryset,many=True)
        
        rolel = serializer.data
        recordsTotal = len(rolel)

        # def search_role(r):
        #     if simpleQueryParam in r.name:
        #         return True


        # if simpleQueryParam != "":
        #     print('simpleQueryParam:',simpleQueryParam)
        #     # userl = userl.filter(real_name__icontains=simpleQueryParam)
        #     rolel = [r for r in rolel if search_role(r) is True]

        # for r in rolel[start:start+length]:
        #     data.append({"idstr":r.rid,"name":r.name,"notes":r.notes})

        
        # recordsTotal = len(data) #rolel.count()

        result = dict()
        result["records"] = serializer.data
        result["draw"] = draw
        result["success"] = "true"
        result["pageSize"] = pageSize
        result["totalPages"] = recordsTotal/pageSize
        result["recordsTotal"] = recordsTotal
        result["recordsFiltered"] = recordsTotal
        result["start"] = 0
        result["end"] = 0
        
        return Response(result)

    def create(self, request, *args, **kwargs):
        print("create role")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            self.perform_create(serializer)
            # headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, pk=None,*args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        pass

    def destroy(self, request, pk=None):
        pass

    @action(detail=True, renderer_classes=[renderers.StaticHTMLRenderer])
    def deletemore(self,request, *args, **kwargs):
        
        ret = {"success":True}
        return Response(ret)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'list':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

role_list = MyRoleViewSet.as_view({
    'get': 'list'
})

role_add = MyRoleViewSet.as_view({
    'post': 'create'
})

role_delete = MyRoleViewSet.as_view({
    'post': 'destroy'
})

role_edit = MyRoleViewSet.as_view({
    'post': 'update'
})

role_deletemore = MyRoleViewSet.as_view({
    'post': 'deletemore'
}, renderer_classes=[renderers.StaticHTMLRenderer])