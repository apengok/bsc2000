'''Use this for production'''

from .base import *

DEBUG = False
ALLOWED_HOSTS += ['http://domain.com']
WSGI_APPLICATION = 'bsc2000.wsgi.prod.application'

DATABASES = {
    'default': { 
        'ENGINE': 'django.contrib.gis.db.backends.mysql',#django.contrib.gis.db.backends.mysql,postgresql_psycopg2  or django.contrib.gis.db.backends.postgis or django.db.backends.postgresql_psycopg2
        'NAME': 'zncb',
        'USER': 'scada',
        'PASSWORD': 'scada',
        'HOST': '120.78.255.129',    #120.78.255.129 192.168.197.134
        'PORT': '3306',
        'STORAGE_ENGINE': 'INNODB',
        'OPTIONS': {'charset': 'utf8mb4'},
        'TEST_CHARSET': 'utf8mb4',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

STATICFILES_STORAGE = 'whitenoise.django.GzipManifestStaticFilesStorage'
