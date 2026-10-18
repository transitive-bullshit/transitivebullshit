from django.conf import settings
from django.urls import re_path
from django.views.static import serve

from core import views

# Every page is also reachable under a legacy `mobile/` prefix.
_pages = [
    (r"(index(\.html?)?)?/?", views.index),
    (r"processing/?", views.processing),
    (r"test/?(?P<experiment>[\w-]{1,30})?", views.test),
    (r"articles/(?P<article>[\w-]{1,30})\.html?/?", views.article),
]

urlpatterns = [
    re_path(rf"^{prefix}{pattern}$", view)
    for prefix in ("", "mobile/")
    for pattern, view in _pages
]

urlpatterns += [
    re_path(
        r"^assets/(?P<path>.*)$", serve, {"document_root": settings.STATIC_DOC_ROOT}
    ),
]
