'''Use this for development'''

from .base import *

ALLOWED_HOSTS += ['127.0.0.1','*']
DEBUG = True

WSGI_APPLICATION = 'bsc2000.wsgi.zhaoqin.application'

INSTALLED_APPS += [
    'debug_toolbar',
    # 'sqlserver_ado.sql_app'
]

DATABASES = {
    'default': {
        'NAME': 'testtest',
        'ENGINE': 'sql_server.pyodbc',
        # 'ENGINE': 'django.db.backends.sqlserver_ado',
        'HOST': 'localhost',
        'USER': 'sa',
        'PASSWORD': 'scada',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'isolation_level': 'READ UNCOMMITTED',  # prevent SELECT deadlocks
        },
    }
}

CORS_ORIGIN_WHITELIST = (
    'http://localhost:3000',
)

#add geospatial something
GEOS_LIBRARY_PATH = 'C:/OSGeo4W64/bin/geos_c.dll'
GDAL_LIBRARY_PATH = 'C:/OSGeo4W64/bin/gdal111.dll'