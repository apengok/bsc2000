# -*- coding: utf-8 -*-
from rest_framework import generics 
from rest_framework import viewsets
from .serializers import OrganizationListSerializer, OrganizationDetailSerializer,OrganizationSerializer
from core.models import Organization

class OrganizationListView(generics.ListAPIView):
    """View For List All Published Organization"""

    queryset = Organization.objects.all()
    serializer_class = OrganizationListSerializer


class OrganizationDetailView(generics.RetrieveAPIView):
    """View For The Details Of A Single Organization"""

    queryset = Organization.objects.all()
    serializer_class = OrganizationDetailSerializer

class OrganizationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Organization to be viewed or edited.
    """
    queryset = Organization.objects.all()   #.order_by('-date_joined')
    serializer_class = OrganizationSerializer
