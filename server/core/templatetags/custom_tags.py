#!/usr/bin/env python

import os

from django import template

from custom_template import *
from custom_asset    import *

register = template.Library()

@register.tag
def handlebars_template(parser, token):
    """
        Defines a custom tag for the django templating engine called 'handlebars_template' 
        which accepts exactly one parameter, the name of the custom template to render 
        in the context of the current django templating context.
    """
    
    template_library = global_handlebars_template_library()
    
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
def custom_asset(parser, token):
    """
        Defines a custom tag for the django templating engine called 'custom_asset' 
        which accepts exactly one parameter, the name of the custom asset to import.
    """
    
    library = global_asset_library()
    
    try:
        parts = token.split_contents()
        asset_type = None
        
        if len(parts) == 2:
            tag_name, asset_path = parts
        elif len(parts) == 3:
            tag_name, asset_path, asset_type = parts
        else:
            raise ValueError
    except ValueError:
        raise template.TemplateSyntaxError("%r tag invalid arguments" % token.contents.split())
    
    for s in [ '"', '"' ]:
        if (asset_path.startswith(s) and asset_path.endswith(s)):
            asset_path = asset_path[len(s):-len(s)]
            break
    
    if asset_type is None:
        if asset_path in ASSET_TYPES:
            asset_type = None
        else:
            asset_type = asset_path[asset_path.rfind('.') + 1:]
    
    return CustomAssetNode(asset_path, asset_type, library)

