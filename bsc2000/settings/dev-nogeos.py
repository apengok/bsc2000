'''Use this for development'''

from .base import *

ALLOWED_HOSTS += ['127.0.0.1','*']
DEBUG = True

WSGI_APPLICATION = 'bsc2000.wsgi.dev.application'

debug_toolbar_exists = 1
try:
    import debug_toolbar
    
except Exception as e:
    print(e)
    debug_toolbar_exists = 0
    pass
if debug_toolbar_exists:
    INSTALLED_APPS += [
        'debug_toolbar'
    ]

DATABASES = {
    'default': { 
        'ENGINE': 'django.contrib.gis.db.backends.mysql',#django.contrib.gis.db.backends.mysql,postgresql_psycopg2  or django.contrib.gis.db.backends.postgis or django.db.backends.postgresql_psycopg2
        'NAME': 'zncb',
        'USER': 'scada',
        'PASSWORD': 'scada',
        'HOST': '120.78.255.129',    #120.78.255.129 192.168.197.134
        # 'HOST': 'localhost',    #120.78.255.129 192.168.197.134
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
# GEOS_LIBRARY_PATH = 'C:/OSGeo4W64/bin/geos_c.dll'
# GDAL_LIBRARY_PATH = 'D:/ProgramData/Anaconda3/envs/kingda/Lib/site-packages/osgeo/gdal301.dll'

# GDAL_LIBRARY_PATH = 'C:/Users/HP/Envs/venpy36\Lib/site-packages/osgeo/gdal301.dll'
# GEOS_LIBRARY_PATH = 'C:/OSGeo4W/bin/geos_c.dll'
# GDAL_LIBRARY_PATH = 'C:/OSGeo4W/bin/gdal300.dll'

#add geospatial something -my home env
GEOS_LIBRARY_PATH = 'D:/pengwl/webapp/bsc2000/extra_geos_lib/geos_c.dll'
GDAL_LIBRARY_PATH = 'D:/pengwl/webapp/bsc2000/extra_geos_lib/gdal300.dll'