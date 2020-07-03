# -*- coding: utf-8 -*-

from rest_framework import status
from rest_framework import generics
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import PersonalizedSerializer
from core.models import Personalized


class PersonalizedViewSet(viewsets.ModelViewSet):
    queryset = Personalized.objects.all()
    serializer_class = PersonalizedSerializer

class PersonalizedListView(generics.ListAPIView):
    queryset = Personalized.objects.all()
    serializer_class = PersonalizedSerializer


def default_default(organ):
    oparent = organ.parent
    if oparent is None:
        pers = PersonalizedSerializer(data=PersonalizedViewSet.objects.filter(ptype="default"))
    else:
        pers = Personalized.objects.filter(belongto=oparent)
    if pers.exists():
        p = pers.first()
        pp = Personalized.objects.create(topTitle=p.topTitle,loginLogo=p.loginLogo,homeLogo=p.homeLogo,webIco=p.webIco,
            copyright=p.copyright,websiteName=p.websiteName,recordNumber=p.recordNumber,frontPageMsg=p.frontPageMsg,frontPageMsgUrl=p.frontPageMsgUrl,
            ptype='custom',belongto=organ,updateDataUsername=p.updateDataUsername)
        
    else:
        pp = default_default(oparent)
    
    return pp

@api_view(['GET'])
def personal_find(request):
    print(request.user)
    print(request.user.belongto)
    personal = Personalized.objects.first()
    serializer = PersonalizedSerializer(personal)
    return Response(serializer.data)