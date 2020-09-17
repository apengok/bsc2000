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
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'kingda.db'),
    }
}

CORS_ORIGIN_WHITELIST = (
    'http://localhost:3000',
)
