#!/usr/bin/env python

import datetime
import json
import settings

from django.utils.functional import wraps

def view(no_cache=False):
    def decorator(fn):
        assert callable(fn)
        
        @wraps(fn)
        def wrapper(request, *args, **kwargs):
            response = fn(request, *args, **subkwargs)
            
            if no_cache or settings.DEBUG:
                expires = (datetime.datetime.utcnow() - datetime.timedelta(minutes=10)).ctime()
                cache_control = 'no-cache'
            elif utils.is_ec2():
                expires = (datetime.datetime.utcnow() + datetime.timedelta(minutes=60)).ctime()
                cache_control = 'max-age=600'
            
            response['Expires']       = expires
            response['Cache-Control'] = cache_control
            
            return response
        return wrapper
    return decorator

def render_template(request, template, context, **kwargs):
    # augment template context with global django / stamped settings
    kwargs['context_instance'] = kwargs.get('context_instance', RequestContext(request))
    
    preload = kwargs.pop('preload', None)
    context = get_context(context, preload)
    
    return render_to_response(template, context, **kwargs)

def get_context(context, preload):
    context = copy.copy(context)
    
    context["DEBUG"] = settings.DEBUG
    
    if preload is None:
        ctx = context
    else:
        ctx = dict(((k, context[k]) for k in preload))
    
    json_context = json.dumps(ctx)
    js_preload   = "var PRELOAD = %s;" % json_context
    
    context["PRELOAD_JS"] = js_preload
    
    return context

