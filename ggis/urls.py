# -*- coding: utf-8 -*-

from django.conf.urls import url
from . import views
from django.views.generic import TemplateView

from . import views

app_name = 'ggis'
urlpatterns = [
    
    url(r'^$', TemplateView.as_view(template_name='ggis/pipelinequery.html')),
    url(r'^pipeline/$', TemplateView.as_view(template_name='ggis/pipeline_home.html')),

    

    # GIS系统 --管网查询
    url(r'^getgeojson',views.getgeojson,name='getgeojson'),
    url(r'^getdmageojson',views.getdmageojson,name='getdmageojson'),
    url(r'^pipelinequery/?$',views.PipelineQueryView.as_view(),name='pipelinequery'),
    url(r'^bindfence/fenceTree/?$',views.fenceTree,name='fenceTree'),
    url(r'^bindfence/list/?$',views.fencelist,name='fencelist'),
    url(r'^fence/managefence/polygons',views.savePolygons,name='savePolygons'),
    url(r'^fence/bindfence/getFenceDetails',views.getFenceDetails,name='getFenceDetails'),
    url(r'^fence/managefence/previewFence',views.previewFence,name='previewFence'),
    url(r'^fence/managefence/delete_/',views.deleteFence,name='deleteFence'),
    url(r'^fence/bindfence/alterFillColor',views.alterFillColor,name='alterFillColor'),#修改蒙层颜色
    url(r'^fence/bindfence/alterstrokeColor',views.alterstrokeColor,name='alterstrokeColor'),#修改边框颜色
    url(r'^fence/bindfence/getDMAFenceDetails',views.getDMAFenceDetails,name='getDMAFenceDetails'),
    

    # url(r'^fence/managefence/delete_/(?P<fendeId>\w+)/',views.deteleFence,name='deteleFence'),

    # save rectangle
    url(r'^fence/managefence/rectangles',views.saveRectangles,name='saveRectangles'),

    # 圆形
    url(r'^fence/managefence/circles',views.saveCircles,name='saveCircles'),

    # addAdministration
    url(r'^fence/managefence/addAdministration',views.addAdministration,name='addAdministration'),
    
    
    # 管网统计
    url(r'^pipelinestastic/?$',views.PipelineStasticView.as_view(),name='pipelinestastic'),
    
    
    # GIS系统 --管网分析
    url(r'^pipelineanalys/?$',views.PipelineAnalysView.as_view(),name='pipelineanalys'),
    
    # 导入导出
    url(r'^pipelineimexport/?$',views.PipelineImexportView.as_view(),name='pipelineimexport'),
]