#!/usr/bin/env python

from helpers import view, render_template
import processing_test

@view()
def index(request, *args, **kwargs):
    return render_template(request, 'index.html', {
        'page'  : 'index', 
        'title' : 'TransitiveBullshit', 
    })

@view(ignore_extra_params=True)
def processing(request, *args, **kwargs):
    sketches = processing_test.get_sketches()
    sketch   = kwargs.get('sketch', None)
    params   = {}
    
    if sketch is not None:
        sketch = sketch.lower()
        
        if len(filter(lambda x: x['name'] == sketch, sketches)) != 1:
            sketch = None
    
    if sketch is not None:
        params['PROCESSING_SKETCH'] = sketch
    else:
        params['PROCESSING_SKETCHES'] = sketches
    
    params['page']  = 'processing'
    params['title'] = 'TransitiveBullshit - Processing Lab'
    
    return render_template(request, 'processing.test.html', params)

@view()
def test(request, *args, **kwargs):
    return render_template(request, 'test.html', {
        'page'  : 'test', 
        'title' : 'TransitiveBullshit - Test', 
    })

