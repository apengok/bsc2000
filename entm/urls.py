# -*- coding: utf-8 -*-

from django.conf.urls import url
from . import views
from django.views.generic import TemplateView

from . import views

app_name = 'entm'
urlpatterns = [
    
    #使用hplus页面布局时的首页
    # url(r'^$', TemplateView.as_view(template_name='hplus.html'),name='virvo_home'),
    url(r'^$', TemplateView.as_view(template_name='_vbase.html'),name='virvo_home'),

    url(r'^(?P<page>.+\.html)$', views.StaticView.as_view()),
    url(r'^(?P<page>.+\.css)$', views.StaticView.as_view()),

    # url(r'^display_progress/$', views.progress_view,name='progress_view'),



    # url(r'^(?P<room_name>[^/]+)/$', views.room, name='room'),

    # tree list etc
    url(r'^role/choicePermissionTree',views.choicePermissionTree,name='choicePermissionTree'),
    url(r'^role/personlizedFrontTree',views.personlizedFrontTree,name='personlizedFrontTree'), #preview 预�??
    url(r'^user/oranizationtree/',views.oranizationtree,name='oranizationtree'),
    url(r'^user/oranizationSelectlist/',views.oranizationSelectlist,name='oranizationSelectlist'),

    # 企业管理 --角色管理
    #组织
    url(r'^user/group/add/?$',views.UserGroupAddView.as_view(),name='groupadd'),
    url(r'^user/group/edit/(?P<pId>\w+)/?$',views.UserGroupEditView.as_view(),name='groupedit'),
    url(r'^user/group/detail/(?P<pId>\w+)/?$',views.UserGroupDetailView.as_view(),name='groupdetail'),
    url(r'^user/group/delete/?$',views.UserGroupDeleteView.as_view(),name='groupdelete'),
    url(r'^group/findOperations',views.findOperations,name='findOperations'),
    # url(r'^group/findOperationCompare',views.findOperationCompare,name='findOperationCompare'),
    # url(r'^group/updateOperation',views.updateOperation,name='updateOperation'),

    #用户
    url(r'^user/verifyUserName/?$',views.verifyUserName,name='verifyUserName'),
    url(r'^user/verification/?$',views.verification,name='verification'),
    url(r'^user/roleList_/(?P<pk>[0-9]+)/?$',views.AssignRoleView.as_view(),name='roleList_'),
    url(r'^user/assign_stn/(?P<pk>[0-9]+)/?$',views.AssignStnView.as_view(),name='assign_stn'),
    url(r'^usermanager/?$', views.UserMangerView.as_view(), name='usermanager'),#组织和用户�?�理
    # url(r'^user/list/$',views.userlist,name='userlist'),
    url(r'^user/add',views.UserAddView.as_view(),name='useradd'),
    url(r'^user/edit/(?P<pk>[0-9]+)/?$',views.UserEditView.as_view(),name='useredit'),
    url(r'^user/delete/(?P<pk>[0-9]+)/?$',views.UserDeleteView.as_view(),name='userdelete'),
    url(r'^user/deletemore',views.userdeletemore,name='userdeletemore'),

    url(r'^user/export',views.userexport,name='userexport'),
    url(r'^user/import',views.UserImportView.as_view(),name='userimport'),
    url(r'^basetemp/download',views.download,name='download'),

    url(r'^infoconfig/infoinput/importProgress',views.importProgress,name='importProgress'),

    #角色
    url(r'^rolemanager/?$',views.RolesMangerView.as_view(),name='rolemanager'),
    # url(r'^role/list/$',views.rolelist,name='rolelist'),
    url(r'^role/add/',views.RolesAddView.as_view(),name='roleadd'),
    url(r'^role/edit/(?P<pk>[0-9]+)/?$',views.RoleEditView.as_view(),name='roleedit'),
    url(r'^role/export',views.roleexport,name='roleexport'),
    url(r'^role/import',views.roleimport,name='roleimport'),


    url(r'^role/delete_/(?P<cn>\w+)/?$',views.RoleDeleteView.as_view(),name='roledelete'),
    url(r'^role/deletemore',views.roledeletemore,name='roledeletemore'),

    
    # url(r'^roles/?$', views.RolesMangerView.as_view(), name='roles_manager'),
    # url(r'^roles/create/?$', views.RolesCreateMangerView.as_view(), name='role_create_manager'),
    # url(r'^roles/update/(?P<pk>[0-9]+)/?$', views.RolesUpdateManagerView.as_view(), name='role_edit_manager'),

    
    # url(r'^user/group/add/',views.groupadd,name='groupadd'),
    # url(r'^user/userlist/',views.userlist,name='userlist'),
    # url(r'^organ_users/?$', views.OrganUserMangerView.as_view(), name='organ_users'),#组织和用户�?�理
    # url(r'^user/create/?$', views.UserCreateMangerView.as_view(), name='user_create_manager'),
    # url(r'^user/update/(?P<pk>[0-9]+)/?$', views.UserUpdateManagerView.as_view(), name='user_edit_manager'),
    # url(r'^user/assign_role/(?P<pk>[0-9]+)/?$', views.AssignRoleView.as_view(), name='assign_role'),#分配角色
    # url(r'^user/auth_station/(?P<pk>[0-9]+)/?$', views.AuthStationView.as_view(), name='auth_station'),#授权站点


    
]