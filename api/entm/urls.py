from django.urls import path,include
from django.conf.urls import url
from rest_framework.routers import DefaultRouter

from .organizations import views
from .users import views as user_views
from .roles import views as role_views

# Create a router and register our viewsets with it.
router = DefaultRouter()
# router.register(r'snippets', views.SnippetViewSet)
router.register(r'organ', views.OrganizationViewSet)
router.register(r'users', user_views.UserViewSet)
# router.register(r'user/login', user_views.UserLoginView)
# router.register(r'role', role_views.role_list,basename='role_list')

app_name='entm-api'
urlpatterns = [
    path('', include(router.urls)),

    url('user/login/',user_views.LoginView.as_view(),name='userlogin'),
    # path('', views.OrganizationListView.as_view()),
    # path('view/<pk>/', views.OrganizationViewSet.as_view({'get':'list','post':'create'}), name='organ-detail'),

    # roles
    url('role/list/',role_views.role_list,name='rolelist'),
    url('role/add/',role_views.role_add,name='roleadd'),
    url('role/edit/<int:pk>/',role_views.role_edit,name='roleedit'),
    url('role/delete_/<int:pk>/',role_views.role_delete,name='roledelete'),
    url('role/deletemore/',role_views.role_deletemore,name='roledeletemore'),
    url('role/choicePermissionTree/',role_views.choicePermissionTree,name='choicePermissionTree'),
    # url('role/add/',role_views.roleadd,name='roleadd'),
]


# for url in router.urls:
#     print(url,'\n')