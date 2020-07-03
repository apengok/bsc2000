import os

BASE_DIR = os.path.dirname(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))))
SECRET_KEY = '#$64mfyq%&52ogf-5#wgt*fe=v2gc49=m=7#7+a+#i%42&*m@1'
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 'debug_toolbar',
    'mptt',
    'import_export',
    'django_extensions',

    'django.contrib.sites',
    # 'allauth',
    # 'allauth.account',
    # 'allauth.socialaccount',
    'corsheaders',
    # 'rest_auth',
    # 'rest_auth.registration',
    'rest_framework',
    # 'rest_framework.authtoken',
    'accounts',
    'amrs',
    'core',
    'entm',
    'devm',
    'dmam',
    'wirelessm',
    'ggis',
    'monitor',
    'reports',
    'analysis',
    'alarm',
    'prodschedule',
    'baseanalys',
    'sysm',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware', #
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bsc2000.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR,"templates"),os.path.join(BASE_DIR,"echarts","map","province")],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

INTERNAL_IPS = [
    # ...
    '127.0.0.1',
    # ...
]

AUTH_USER_MODEL = 'accounts.User' #change buikld-in user model to us
# AUTH_GROUP_MODEL = 'accounts.MyRoles'

LOGIN_URL = '/login/'
LOGIN_URL_REDIRECT = '/home/'
LOGOUT_URL = '/logout/'

LOGOUT_REDIRECT_URL = '/login/'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Shanghai'
USE_I18N = True
USE_L10N = False
USE_TZ = False

DATE_INPUT_FORMATS = ['%d-%m-%Y']


#add geospatial something
# GEOS_LIBRARY_PATH = '/usr/local/lib/libgeos_c.so'
# GDAL_LIBRARY_PATH = '/usr/local/lib/libgdal.so'


STATIC_URL = '/static/'
MEDIA_URL = '/media/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "assets"),
    os.path.join(BASE_DIR,"echarts","map","province"),
]

STATIC_ROOT = os.path.join(BASE_DIR, 'static')
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
SITE_ID = 1

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        # 'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'core.pagination.DataTablePageNumberPagination',
    'PAGE_SIZE': 10
}

ACCOUNT_EMAIL_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'username'
ACCOUNT_EMAIL_VERIFICATION = 'none'
# WSGIPassAuthorization On

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

try:
    from .loggers_seeting import *
except Exception as e:
    pass