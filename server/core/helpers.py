import json
from functools import wraps

from django.conf import settings
from django.shortcuts import render
from django.utils.cache import patch_cache_control, patch_response_headers


def view(no_cache=False):
    """Merges query params into the view's kwargs and sets cache headers."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(request, *args, **kwargs):
            kwargs.update(request.GET.dict())
            response = fn(request, *args, **kwargs)

            if no_cache or settings.DEBUG:
                patch_cache_control(response, no_cache=True)
            else:
                patch_response_headers(response, cache_timeout=600)

            return response

        return wrapper

    return decorator


def render_template(request, template, context):
    return render(request, template, get_context(context))


def get_context(context):
    context = dict(context)
    context["DEBUG"] = settings.DEBUG
    context["STATIC_ASSET_BASE"] = settings.STATIC_ASSET_BASE
    context["PRELOAD_JS"] = f"var PRELOAD = {json.dumps(context)};"
    return context
