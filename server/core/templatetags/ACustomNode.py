#!/usr/bin/env python

__author__    = "Travis Fischer (fisch0920@gmail.com)"
__copyright__ = "Copyright (c) 2013 Travis Fischer"

from django import template

class ACustomNode(template.Node):
    
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

