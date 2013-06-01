#!/usr/bin/env python

import copy
import datetime
import json
import settings

from django.shortcuts           import render_to_response
from django.template            import RequestContext
from django.utils.functional    import wraps

def view(ignore_extra_params=False, no_cache=False):
    def decorator(fn):
        assert callable(fn)
        
        @wraps(fn)
        def wrapper(request, *args, **kwargs):
            subkwargs = kwargs
            data = parse_request(request, overflow=ignore_extra_params, **kwargs)
            for k,v in data.iteritems():
                subkwargs[k] = v
            
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
    context["STATIC_ASSET_BASE"] = settings.STATIC_ASSET_BASE
    context["TEMPLATE_FILE"] = settings.TEMPLATE_FILE
    
    if preload is None:
        ctx = context
    else:
        ctx = dict(((k, context[k]) for k in preload))
    
    json_context = json.dumps(ctx)
    js_preload   = "var PRELOAD = %s;" % json_context
    
    context["PRELOAD_JS"] = js_preload
    
    return context

def parse_request(request, overflow, **kwargs):
    data = { }
    
    try:
        if request.method == 'GET':
            rawData = request.GET
        elif request.method == 'POST':
            rawData = request.POST
        else:
            raise "invalid HTTP method '%s'" % request.method
        
        # Build the dict because django sucks
        for k, v in rawData.iteritems():
            data[k] = v
    except Exception as e:
        raise e
    
    return data

