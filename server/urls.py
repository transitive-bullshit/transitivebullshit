#!/usr/bin/env python

import re
import settings

from django.conf.urls.defaults  import patterns, include, url
from django.core.exceptions     import ImproperlyConfigured

urlpatterns = patterns('',
    # ------------------------------ INDEX -------------------------------------
    # e.g., transitivebullshit.com
    url(r'^index$',                             'core.views.index'), 
    url(r'^index\.html?$',                      'core.views.index'), 
    url(r'^/?$',                                'core.views.index'), 
    
    # e.g., transitivebullshit.com/processing
    url(r'^processing\/?$',                     'core.views.processing'), 
    
    # e.g., transitivebullshit.com/test
    url(r'^test\/?$',                           'core.views.test'), 
)

def custom_static(prefix, view='django.views.static.serve', **kwargs):
    """
        Helper function to return a URL pattern for serving files.
        
        from django.conf import settings
        from django.conf.urls.static import static
        
        urlpatterns = patterns('',
            # ... the rest of your URLconf goes here ...
        ) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    """
    
    if prefix and '://' in prefix:
        return []
    elif not prefix:
        raise ImproperlyConfigured("Empty static prefix not permitted")
    else:
        return patterns('', 
            url(r'^%s(?P<path>.*)$' % re.escape(prefix.lstrip('/')), view, kwargs=kwargs), 
        )

# static assets
urlpatterns += custom_static(settings.STATIC_URL, document_root=settings.STATIC_DOC_ROOT)

# setup error handler views
#handler404 = 'error.views.error_404'
#handler500 = 'error.views.error_500'

