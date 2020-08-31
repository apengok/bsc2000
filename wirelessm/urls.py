# -*- coding: utf-8 -*-

from django.conf.urls import url
from . import views
from django.views.generic import TemplateView

from . import views

app_name = 'wirelessm'
urlpatterns = [
    
    #使用hplus页面布局时的首页
    # url(r'^$', TemplateView.as_view(template_name='hplus.html'),name='virvo_home'),
    url(r'^$', TemplateView.as_view(template_name='_vbase.html'),name='virvo_home'),


    #无线抄表
    url(r'^concentratormap/?$',views.ConcentratorMapView.as_view(),name='concentratormap'),
    url(r'^getconcentratormaplist/?$',views.getconcentratormaplist,name='getconcentratormaplist'),
    url(r'^contentratordatastastic/?$',views.ContentratorDataStasticView.as_view(),name='contentratordatastastic'),
    url(r'^concentratorStatics/?$',views.concentratorStatics,name="concentratorStatics"),

    # 数据查询 
    url(r'^wlquerydata/?$',views.WlquerydataView.as_view(),name='wlquerydata'),
    url(r'^wlquerydata/showinfo/(?P<pk>[0-9]+)/?$',views.WlqueryShowInfoView.as_view(),name='wlqueryshowinfo'),
    url(r'^wlquerydata/showalarm/(?P<pk>[0-9]+)/?$',views.WlqueryShowAlarmView.as_view(),name='wlqueryshowalarm'),
    url(r'^watermeter/comunitiquery/',views.comunitiquery,name='comunitiquery'),
    url(r'^watermeter/showinfoStatics/',views.showinfoStatics,name='showinfoStatics'),
    url(r'^watermeter/getWatermeterdaily/',views.getWatermeterdaily,name='getWatermeterdaily'),
    url(r'^watermeter/getWatermeterMonth/',views.getWatermeterMonth,name='getWatermeterMonth'),
    url(r'^watermeter/exportbyselect',views.exportbyselect,name='exportbyselect'),
    
    # 小区日用水
    url(r'^neighborhoodusedayly/?$', views.NeighborhoodusedaylyView.as_view(), name='neighborhoodusedayly'),#
    url(r'^neiborhooddailydata/?$', views.neiborhooddailydata, name='neiborhooddailydata'),#
    
    # 小区月用水
    url(r'^neighborhoodusemonthly/$',views.NeighborhoodusemonthlyView.as_view(),name='neighborhoodusemonthly'),
    url(r'^neiborhoodmonthdata/?$', views.neiborhoodmonthdata, name='neiborhoodmonthdata'),#
    
    # 户表管理
    url(r'^neighborhoodmetermanager/?$',views.NeighborhoodmeterMangerView.as_view(),name='neighborhoodmetermanager'),
    # url(r'^watermeter/list/$',views.watermeterlist,name='watermeterlist'),
    url(r'^watermeter/add',views.WatermeterAddView.as_view(),name='watermeteradd'),
    url(r'^watermeter/edit/(?P<pk>\w+)/?$',views.WatermeterEditView.as_view(),name='watermeteredit'),
    url(r'^watermeter/delete/(?P<pk>[0-9]+)/?$',views.WatermeterDeleteView.as_view(),name='watermeterdelete'),
    url(r'^watermeter/deletemore',views.watermeterdeletemore,name='watermeterdeletemore'),
    url(r'^communitymeter/repetition/$',views.watermeter_repetition,name='watermeter_repetition'),
    url(r'^watermeter/export',views.watermeterexport,name='watermeterexport'),
    url(r'^watermeter/import',views.WatermeterImportView.as_view(),name='import'),
    url(r'^watermeter/download',views.watermeterdownload,name='watermeterdownload'),

    # 批量修改
    url(r'^watermeter/batchupdate',views.WatermeterBatchUpdateView.as_view(),name='batchupdate'),
    
]