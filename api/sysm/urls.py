from django.urls import path,include
from rest_framework.routers import DefaultRouter
from django.conf.urls import url
from .personalized import views as personal_views


# Create a router and register our viewsets with it.
router = DefaultRouter()
# router.register(r'snippets', views.SnippetViewSet)
router.register(r'personalized', personal_views.PersonalizedViewSet)



urlpatterns = [
    path('', include(router.urls)),
    
    url(r'personalized/find/',personal_views.personal_find,name='personal_find'),
]