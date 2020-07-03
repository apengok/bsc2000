"""bsc2000 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url,include,handler404,handler500
from django.contrib import admin
from django.contrib.auth.views import LogoutView
from django.urls import path,include
from django.views.generic import TemplateView
from entm.views import i18n_javascript,error_404,error_500,StaticView,faviconredirect
# from rest_framework.routers import DefaultRouter
from accounts.views import LoginView

from dmam.api.views import test_zxesi_view,getCurrentAlarm

urlpatterns = [
    url(r'^$',LoginView.as_view(), name='login'),
    url(r'^login/$', LoginView.as_view(), name='login'),
    url(r'^logout/$', LogoutView.as_view(), name='logout'),
    path('admin/', admin.site.urls),

    url(r'^favicon\.ico$', faviconredirect,name='faviconredirect'),
    url(r'^(?P<page>.+\.html)$', StaticView.as_view()),
    url(r'^echarts/map/province/(?P<page>.+\.json)$', StaticView.as_view()),

    # 
    url(r'test/ol/',TemplateView.as_view(template_name='oltest.html'),name='oltest'),
    url(r'home/',TemplateView.as_view(template_name='_vbase.html'),name='home'),
    # url(r'entm/usermanager/',TemplateView.as_view(template_name='entm/userlist.html'),name='usermanager'),
    # url(r'entm/rolemanager/',TemplateView.as_view(template_name='entm/rolelist.html'),name='rolemanager'),
    # url(r'entm/roleadd/',TemplateView.as_view(template_name='entm/roleadd.html'),name='roleadd'),
    # url(r'entm/role/edit/',TemplateView.as_view(template_name='entm/roleedit.html'),name='roleedit'),

    # sysm
    url(r'sysm/system/',TemplateView.as_view(template_name='sysm/personalizedList.html'),name='sysm_personal'),

    #waterwork
    url(r'^entm/', include('entm.urls', namespace='entm')),
    url(r'^prodschedule/', include('prodschedule.urls', namespace='prodschedule')),
    url(r'^monitor/', include('monitor.urls', namespace='monitor')),
    url(r'^analysis/', include('analysis.urls', namespace='analysis')),
    url(r'^alarm/', include('alarm.urls', namespace='alarm')),
    url(r'^baseanalys/', include('baseanalys.urls', namespace='baseanalys')),
    url(r'^ggis/', include('ggis.urls', namespace='ggis')),
    url(r'^devm/', include('devm.urls', namespace='devm')),
    url(r'^dmam/', include('dmam.urls', namespace='dmam')),
    url(r'^wirelessm/', include('wirelessm.urls', namespace='wirelessm')),
    url(r'^reports/', include('reports.urls', namespace='reports')),
    url(r'^sysm/', include('sysm.urls', namespace='sysm')),

    # api urlpath
    # url(r'^prodschedule/', include('prodschedule.urls', namespace='prodschedule')),
    url(r'^api/monitor/', include('monitor.api.urls', namespace='monitor-api')),
    url(r'^api/analysis/', include('analysis.api.urls', namespace='analysis-api')),
    # url(r'^alarm/', include('alarm.urls', namespace='alarm')),
    # url(r'^baseanalys/', include('baseanalys.urls', namespace='baseanalys')),
    url(r'^api/ggis/', include('ggis.api.urls', namespace='ggis-api')),
    url(r'^api/entm/', include('entm.api.urls', namespace='entm-api')),
    url(r'^api/devm/', include('devm.api.urls', namespace='devm-api')),
    url(r'^api/dmam/', include('dmam.api.urls', namespace='dmam-api')),
    url(r'^api/wirelessm/', include('wirelessm.api.urls', namespace='wirelessm-api')),
    url(r'^api/reports/', include('reports.api.urls', namespace='reports-api')),
    # url(r'^sysm/', include('sysm.urls', namespace='sysm')),

    # path('api/', include('api.urls')),
    # path('api/entm/', include('api.entm.urls',namespace='entm-api')),
    path('api/sysm/', include('api.sysm.urls')),

    url(r'^api/amrs/', include('amrs.urls', namespace='amrs-api')),

    # 3rd test
    url(r'^pis/rest/unityPlatform/getDeviceState',test_zxesi_view,name='test_zxesi'),
    url(r'^pis/rest/unityPlatform/getCurrentAlarm',getCurrentAlarm,name='getCurrentAlarm'),

]

from django.conf import settings
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns