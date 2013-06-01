#!/usr/bin/env python

import os, pybars

from pprint import pformat
from django import template

register = template.Library()

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

def custom_template(parser, token, template_library):
    try:
        parts = token.split_contents()
        context_variable = None
        
        if len(parts) == 2:
            tag_name, template_name = parts
        elif len(parts) == 3:
            tag_name, template_name, context_variable = parts
        else:
            raise ValueError
    except ValueError:
        raise template.TemplateSyntaxError("%r tag invalid arguments" % token.contents.split())
    
    for s in [ '"', '"' ]:
        if (template_name.startswith(s) and template_name.endswith(s)):
            template_name = template_name[len(s):-len(s)]
            break
    
    if (template_name not in template_library.templates):
        raise template.TemplateDoesNotExist("%r '%s' not found" % (template_name, 
                                                                   token.contents.split()[0]));
    
    return CustomTemplateNode(template_name, template_library, context_variable)

@register.tag
def handlebars_template(parser, token):
    """
        Defines a custom tag for the django templating engine called 'handlebars_template' 
        which accepts exactly one parameter, the name of the custom template to render 
        in the context of the current django templating context.
    """
    
    return custom_template(parser, token, global_handlebars_template_library())

class ACustomTemplateNode(template.Node):
    
    def _simplify_context(self, context):
        context_dict = {}
        
        # convert django context object to a normal python dict for ease of 
        # use / interop with the custom template library's renderer.
        for d in context:
            for k, v in d.iteritems():
                if k not in context_dict:
                    context_dict[k] = v
        
        return context_dict
    
    def __str__(self):
        return self.__class__.__name__

class CustomTemplateNode(ACustomTemplateNode):
    """
        Defines the renderer (e.g., View in MVC) for our custom_template tag, 
        which renders custom templates w.r.t. django's current templating 
        context.
    """
    
    def __init__(self, name, library, context_variable=None):
        ACustomTemplateNode.__init__(self)
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

