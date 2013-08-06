# Django settings for www project.

import os, utils

DEBUG           = (not utils.is_ec2())
TEMPLATE_DEBUG  = DEBUG
PROJ_ROOT       = os.path.abspath(os.path.dirname(__file__))
ASSET_VERSION   = 0
#utils.shell("cd %s && make version" % PROJ_ROOT)[0]

ADMINS = (
    ('Travis', 'fisch0920@gmail.com'), 
)

MANAGERS  = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': '',                      # Or path to database file if using sqlite3.
        'USER': '',                      # Not used with sqlite3.
        'PASSWORD': '',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
    }
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/New_York'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
#MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
#MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/assets/'

SITE_ROOT  = PROJ_ROOT

STATIC_DOC_ROOT = os.path.join(SITE_ROOT, 'assets')
STATIC_ASSET_BASE = STATIC_URL

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    STATIC_DOC_ROOT, 
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '3whjm6l=^ut&f=2@*8!%#&ds^1s!dqyhb9vw%*&x_@g^rhsiub'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware', 
)

ROOT_URLCONF = 'urls'

TEMPLATE_ROOT = os.path.join(PROJ_ROOT, "html")
ARTICLE_ROOT  = os.path.join(PROJ_ROOT, "articles")
LAB_ROOT      = os.path.join(STATIC_DOC_ROOT, "lab")
TEMPLATE_FILE = os.path.join(TEMPLATE_ROOT, "handlebars.generated.html")

TEMPLATE_DIRS = [
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    TEMPLATE_ROOT, 
    ARTICLE_ROOT, 
]
TEMPLATE_DIRS.extend(os.path.join(LAB_ROOT, d) for d in os.listdir(LAB_ROOT) if os.path.isdir(os.path.join(LAB_ROOT, d)))

TEMPLATE_DIRS = tuple(TEMPLATE_DIRS)

# A tuple of strings representing allowed prefixes for the {% ssi %} template 
# tag. This is a security measure, so that template authors can't access files 
# that they shouldn't be accessing.
# 
# For example, if ALLOWED_INCLUDE_ROOTS is ('/home/html', '/var/www'), then 
# {% ssi /home/html/foo.txt %} would work, but {% ssi /etc/passwd %} wouldn't.
ALLOWED_INCLUDE_ROOTS = TEMPLATE_DIRS

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.contrib.auth.context_processors.auth',
    'django.contrib.messages.context_processors.messages',
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core', 
)

# Basic logging configuration. The only tangible logging performed by this 
# configuration is to send an email to the site admins on every HTTP 500 
# error.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'CRITICAL',
            'filters': ['require_debug_false'], 
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'CRITICAL',
            'propagate': True,
        },
    }
}

