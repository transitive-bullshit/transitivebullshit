from urllib.parse import urlparse

from django import template
from django.conf import settings
from django.utils.html import format_html

register = template.Library()


@register.simple_tag
def custom_asset(asset_path):
    """Emits a <script> or <link> tag for a local or remote asset."""

    url = urlparse(asset_path)
    if not url.netloc:
        asset_path = f"{settings.STATIC_ASSET_BASE}{asset_path}"

    if url.path.endswith(".js"):
        return format_html('<script src="{}"></script>', asset_path)
    return format_html('<link rel="stylesheet" href="{}">', asset_path)
