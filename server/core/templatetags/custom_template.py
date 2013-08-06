#!/usr/bin/env python

__author__    = "Travis Fischer (fisch0920@gmail.com)"
__copyright__ = "Copyright (c) 2013 Travis Fischer"

import os
import settings
import pybars

from django      import template
from pprint      import pformat
from ACustomNode import ACustomNode

__global_handlebars_template_library = None
def global_handlebars_template_library():
    global __global_handlebars_template_library
    
    if __global_handlebars_template_library is None:
        __global_handlebars_template_library = HandlebarsTemplateLibrary()
    
    return __global_handlebars_template_library

class HandlebarsTemplateLibrary(object):
    """
        Container for all custom handlebars templates used in this project.
    """
    
    def __init__(self):
        path = os.path.abspath(os.path.dirname(__file__))
        root = os.path.dirname(os.path.dirname(path))
        name = os.path.join(os.path.join(root, 'html'), 'handlebars')
        
        self._load_templates(name)
        self._renderer = pybars.Compiler()
        self._compiled = {}
        self._partials = {}
        
        for k, v in self.templates.iteritems():
            path, source = v
            source = unicode(source)
            
            try:
                compiled = self._renderer.compile(source)
                
                self._compiled[k] = compiled
                self._partials[k] = compiled
            except Exception, e:
                print "[%s] template compiler error (%s): %s" % (self, path, e)
                raise
    
    def _load_templates(self, directory):
        self.templates = {}
        suffix = '.html'
        
        for template in sorted(os.listdir(directory)):
            if not template.endswith(suffix):
                continue
            
            path = os.path.join(directory, template)
            with open(path, 'r') as f:
                text = f.read()
            
            name = template[:-len(suffix)]
            self.templates[name] = (path, text)
    
    def render(self, template_name, context):
        pad = "-" * 20
        pad = "%s %s(%s) %s" % (pad, self, template_name, pad)
        
        def helper_wrapper(helper):
            def _(*args, **kwargs):
                return helper(template_name, pad, *args, **kwargs)
            
            return _
        
        helpers = dict(
            debug=helper_wrapper(pybars_debug)
        )
        
        return self._compiled[template_name](context, helpers=helpers, partials=self._partials)
    
    def __str__(self):
        return self.__class__.__name__

def _flatten_scope(s):
    d = s
    
    if isinstance(s, pybars._compiler.Scope):
        d = s.context
        
        if not isinstance(d, dict):
            d = d.__dict__
    
    return dict((k, v if not isinstance(v, pybars._compiler.Scope) else _flatten_scope(v)) 
                 for k, v in d.iteritems())

def pybars_debug(template_name, pad, scope, *args, **kwargs):
    logs.info("\n%s\n%s\n%s" % (pad, pformat(_flatten_scope(scope)), pad))

class CustomTemplateNode(ACustomNode):
    """
        Defines the renderer (e.g., View in MVC) for our custom_template tag, 
        which renders custom templates w.r.t. django's current templating 
        context.
    """
    
    def __init__(self, name, library, context_variable=None):
        ACustomNode.__init__(self)
        
        self._name = name
        self._library = library
        
        if context_variable is not None:
            self._context_variable = template.Variable(context_variable)
        else:
            self._context_variable = None
    
    def render(self, context):
        try:
            if self._context_variable is None:
                context_dict = self._simplify_context(context)
            else:
                context_dict = self._context_variable.resolve(context)
            
            return unicode(self._library.render(self._name, context_dict))
        except Exception, e:
            print "%s.render error (%s): %s" % (self, self._name, e)
            
            return ''

