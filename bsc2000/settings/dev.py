'''Use this for development'''

from .base import *

ALLOWED_HOSTS += ['127.0.0.1','*']
DEBUG = True

WSGI_APPLICATION = 'bsc2000.wsgi.dev.application'

INSTALLED_APPS += [
    'debug_toolbar',
    'api'
]

DATABASES = {
    'default': { 
        'ENGINE': 'django.contrib.gis.db.backends.mysql',#django.contrib.gis.db.backends.mysql,postgresql_psycopg2  or django.contrib.gis.db.backends.postgis or django.db.backends.postgresql_psycopg2
        'NAME': 'zncb',
        'USER': 'scada',
        'PASSWORD': 'scada',
        # 'HOST': '120.78.255.129',    #120.78.255.129 192.168.197.134
        'HOST': 'localhost',    #120.78.255.129 192.168.197.134
        'PORT': '3306',
        'STORAGE_ENGINE': 'INNODB',
        'OPTIONS': {'charset': 'utf8mb4'},
        'TEST_CHARSET': 'utf8mb4',
    }
}

CORS_ORIGIN_WHITELIST = (
    'http://localhost:3000',
)

#add geospatial something
GEOS_LIBRARY_PATH = 'C:/OSGeo4W64/bin/geos_c.dll'
GDAL_LIBRARY_PATH = 'C:/OSGeo4W64/bin/gdal111.dll'

#add geospatial something -my home env
# GEOS_LIBRARY_PATH = 'C:/OSGeo4W/bin/geos_c.dll'
# GDAL_LIBRARY_PATH = 'C:/OSGeo4W/bin/gdal111.dll'