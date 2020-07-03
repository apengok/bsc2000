# -*- coding: utf-8 -*-

from django.conf.urls import url
from . import views
from django.views.generic import TemplateView

from . import views

app_name = 'devm'
urlpatterns = [
    
    #使用hplus页面布局时的首页
    # url(r'^$', TemplateView.as_view(template_name='hplus.html'),name='virvo_home'),
    url(r'^$', TemplateView.as_view(template_name='_vbase.html'),name='dma_home'),




    #meters   表具管理
    url(r'^meter/repetition/$',views.repetition,name='repetition'),

    url(r'^metermanager/?$', views.MeterMangerView.as_view(), name='metermanager'),#组织和用户管理
    url(r'^meter/list/$',views.meterlist,name='meterlist'),
    url(r'^meter/add',views.MeterAddView.as_view(),name='meteradd'),
    url(r'^meter/edit/(?P<pk>\w+)/?$',views.MeterEditView.as_view(),name='meteredit'),
    url(r'^meter/delete/(?P<pk>[0-9]+)/?$',views.MeterDeleteView.as_view(),name='meterdelete'),
    url(r'^meter/deletemore',views.meterdeletemore,name='meterdeletemore'),
    url(r'^meter/getMeterSelect/$',views.getMeterSelect,name='getMeterSelect'),
    
    #simcards   
    url(r'^simcard/repetition/$',views.simcard_repetition,name='simcard_repetition'),
    url(r'^simcard/getSimcardSelect/$',views.getSimcardSelect,name='getSimcardSelect'),
    url(r'^simcard/getIMEISelect/$',views.getIMEISelect,name='getIMEISelect'),
    url(r'^simcard/getSimRelated/$',views.getSimRelated,name='getSimRelated'),
    url(r'^simcard/releaseRelate/$',views.releaseRelate,name='releaseRelate'),

    url(r'^simcardmanager/?$', views.SimCardMangerView.as_view(), name='simcardmanager'),#组织和用户管理
    url(r'^simcard/list/$',views.simcardlist,name='simcardlist'),
    url(r'^simcard/add',views.SimCardAddView.as_view(),name='simcardadd'),
    url(r'^simcard/edit/(?P<pk>\w+)/?$',views.SimCardEditView.as_view(),name='simcardedit'),
    url(r'^simcard/delete/(?P<pk>[0-9]+)/?$',views.SimCardDeleteView.as_view(),name='simcarddelete'),

    url(r'^simcard/export',views.simcardexport,name='simcardexport'),
    url(r'^simcard/import',views.SimcardImportView.as_view(),name='simcardimport'),
    url(r'^simcard/basetemp/download',views.simcarddownload,name='simcarddownload'),


    # 压力管理
    url(r'^pressuremanager/?$', views.PressureMangerView.as_view(), name='pressuremanager'),
    url(r'^pressure/list/$',views.pressurelist,name='pressurelist'),
    url(r'^pressure/add',views.VPressureAddView.as_view(),name='pressureadd'),
    url(r'^pressure/edit/(?P<pk>\w+)/?$',views.VPressureEditView.as_view(),name='pressureedit'),
    url(r'^pressure/delete/(?P<pk>[0-9]+)/?$',views.VPressureDeleteView.as_view(),name='pressuredelete'),
    url(r'^pressure/deletemore',views.pressuredeletemore,name='pressuredeletemore'),
    url(r'^pressure/pressure_repetition/$',views.pressure_repetition,name='pressure_repetition'),

    # 消防栓管理
    url(r'^fireboltmanager/?$', views.FireboltMangerView.as_view(), name='fireboltmanager'),

    # 集中器管理
    url(r'^concentratormanager/?$', views.ConcentratorMangerView.as_view(), name='concentratormanager'),
    url(r'^concentrator/list/$',views.concentratorlist,name='concentratorlist'),
    url(r'^concentrator/add',views.ConcentratorAddView.as_view(),name='concentratoradd'),
    url(r'^concentrator/edit/(?P<pk>\w+)/?$',views.ConcentratorEditView.as_view(),name='concentratoredit'),
    url(r'^concentrator/config/(?P<pk>\w+)/?$',views.ConcentratorConfigView.as_view(),name='concentratorconfig'),
    url(r'^concentrator/config/(?P<pk>\w+)/nb/?$',views.ConcentratorConfigNBView.as_view(),name='concentratorconfig-nb'),
    url(r'^concentrator/delete/(?P<pk>[0-9]+)/?$',views.ConcentratorDeleteView.as_view(),name='concentratordelete'),
    url(r'^concentrator/deletemore',views.concentratordeletemore,name='concentratordeletemore'),
    url(r'^concentrator/repetition/$',views.concentrator_repetition,name='concentrator_repetition'),
    url(r'^concentrator/repetition_commaddr/$',views.repetition_commaddr,name='repetition_commaddr'),
    url(r'^concentrator/getConcentratorSelect/$',views.getConcentratorSelect,name='getConcentratorSelect'),
    url(r'^concentrator/getConcentratorByComunityId/$',views.getConcentratorByComunityId,name='getConcentratorByComunityId'),
    url(r'^concentrator/getwatermeterlistbyconId/$',views.getwatermeterlistbyconId,name='getConcentragetwatermeterlistbyconIdtorByComunityId'),
    url(r'^concentrator/getConcentratorReplyStatus/$',views.getConcentratorReplyStatus,name='getConcentratorReplyStatus'),
    url(r'^concentrator/deletemeter_bystatus/$',views.deletemeter_bystatus,name='deletemeter_bystatus'),
    url(r'^concentrator/clearmeter_bystatus/$',views.clearmeter_bystatus,name='clearmeter_bystatus'),
    # url(r'^concentrator/add',views.ConcentratorAddView.as_view(),name='concentratoradd'),
    # url(r'^concentrator/edit/(?P<pk>\w+)/?$',views.ConcentratorEditView.as_view(),name='concentratoredit'),
    # url(r'^concentrator/delete/(?P<pk>[0-9]+)/?$',views.ConcentratorDeleteView.as_view(),name='concentratordelete'),
    # url(r'^concentrator/deletemore',views.concentratordeletemore,name='concentratordeletemore'),

    # 参数指令
    url(r'^paramsmanager/?$', views.ParamsMangerView.as_view(), name='paramsmanager'),
    url(r'^paramsmanager/command/list/?$', views.commandlist, name='commandlist'),
    url(r'^paramsmanager/command/saveCommand/?$', views.saveCommand, name='saveCommand'),
    url(r'^paramsmanager/command/getCommandTypes/?$', views.getCommandTypes, name='getCommandTypes'),
    url(r'^paramsmanager/command/getCommandParam/?$', views.getCommandParam, name='getCommandParam'),
    url(r'^paramsmanager/command/getReferCommand/?$', views.getReferCommand, name='getReferCommand'),

    
]