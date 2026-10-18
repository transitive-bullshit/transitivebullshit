"""Django settings for the old Transitive Bullshit portfolio site."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Local-only defaults; override via the environment for anything public.
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "insecure-local-dev-key")
ALLOWED_HOSTS = os.environ.get(
    "DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,[::1]"
).split(",")

ROOT_URLCONF = "urls"

# The site is fully static content; no database or sessions are needed.
DATABASES = {}
INSTALLED_APPS = ["core"]
MIDDLEWARE = ["django.middleware.common.CommonMiddleware"]

TIME_ZONE = "America/New_York"
LANGUAGE_CODE = "en-us"
USE_I18N = False
USE_TZ = True

STATIC_URL = "/assets/"
STATIC_DOC_ROOT = BASE_DIR / "assets"
STATIC_ASSET_BASE = STATIC_URL

TEMPLATE_ROOT = BASE_DIR / "html"
ARTICLE_ROOT = BASE_DIR / "articles"
LAB_ROOT = STATIC_DOC_ROOT / "lab"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            TEMPLATE_ROOT,
            ARTICLE_ROOT,
            *sorted(d for d in LAB_ROOT.iterdir() if d.is_dir()),
        ],
        "APP_DIRS": True,
        "OPTIONS": {"debug": DEBUG},
    }
]
