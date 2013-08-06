#!/usr/bin/env python

__author__    = "Travis Fischer (fisch0920@gmail.com)"
__copyright__ = "Copyright (c) 2013 Travis Fischer"

import codecs
import os
import settings
import urlparse
import utils

from ACustomNode import ACustomNode

ASSET_TYPES = set([ None, 'js', 'css' ])
GENERATED_LINE_LENGTH = 512

__global_asset_library = None
def global_asset_library():
    global __global_asset_library
    
    if __global_asset_library is None:
        __global_asset_library = GlobalAssetLibrary()
    
    return __global_asset_library

class GlobalAssetLibrary(object):
    """
        Container for all custom assets used in this project.
    """
    
    def __init__(self):
        self._compressor = os.path.join(settings.SITE_ROOT, "bin/compressor.jar")
    
    def get_include(self, asset_path, asset_type):
        if asset_type is None:
            return ''
        else:
            prefix = (settings.STATIC_ASSET_BASE if self._is_local(asset_path) else '')
            
            if asset_type == 'js':
                return '<script src="%s%s"></script>' % (prefix, asset_path)
            elif asset_type == 'css':
                return '<link rel="stylesheet" href="%s%s">' % (prefix, asset_path)
    
    def _compress(self, infile, outfile, asset_type, munge):
        cmd = "java -jar %s --type %s %s --charset 'utf-8' --line-break %d -o %s %s" % \
            (self._compressor, asset_type, "" if munge else "--nomunge", GENERATED_LINE_LENGTH, 
            outfile, infile)
        
        _, status = utils.shell(cmd)
        
        if status != 0:
            raise Exception("error compressing '%s' for asset type '%s'\n%s\n%s" % \
                            (infile, asset_type, cmd, _))
    
    def _is_local(self, path):
        urlinfo = urlparse.urlparse(path)
        
        return not urlinfo.scheme or not urlinfo.netloc
    
    def render(self, asset_path, asset_type, context):
        if 'assets' not in context.render_context:
            context.render_context['assets'] = { }
        
        assets = context.render_context['assets']
        
        if asset_type not in ASSET_TYPES:
            raise Exception("unknown asset type '%s' for asset '%s'" % (asset_type, asset_path))
        
        if settings.DEBUG:
            return self.get_include(asset_path, asset_type)
        elif asset_type is None:
            asset_type = asset_path
            ctx  = self._simplify_context(context)
            page = 'default'
            
            if 'page' in ctx:
                page = ctx['page']
            
            uri0  = 'gen/%s.%s' % (page, asset_type)
            uri1  = 'gen/%s.min.%s' % (page, asset_type)
            path0 = os.path.join(settings.STATIC_DOC_ROOT, uri0)
            path1 = os.path.join(settings.STATIC_DOC_ROOT, uri1)
            
            f = codecs.open(path0, encoding='utf-8', mode='w')
            f.write(assets[asset_path])
            f.close()
            
            munge = (asset_type == 'js')
            self._compress(path0, path1, asset_type, munge)
            
            return self.get_include(uri1, asset_type)
        else:
            urlinfo = urlparse.urlparse(asset_path)
            
            if self._is_local(asset_path):
                path = os.path.join(settings.STATIC_DOC_ROOT, asset_path)
                
                f = codecs.open(path, encoding='utf-8', mode='r')
                r = f.read()
                f.close()
            else:
                r = unicode(utils.getFile(asset_path))
                r = u"/*! %s */\n%s\n" % (asset_path, r)
            
            if asset_type in assets:
                assets[asset_type] += r
            else:
                assets[asset_type] = r
            
            return ''
    
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

class CustomAssetNode(ACustomNode):
    """
        Defines the renderer (e.g., View in MVC) for our custom_asset tag.
    """
    
    def __init__(self, asset_path, asset_type, library):
        ACustomNode.__init__(self)
        
        if asset_type not in ASSET_TYPES:
            for t in ASSET_TYPES:
                if t is not None and t in asset_path:
                    asset_type = t
                    break
        
        if asset_type not in ASSET_TYPES:
            raise Exception("unknown asset type '%s' for asset '%s'" % (asset_type, asset_path))
        
        self._asset_path = asset_path
        self._asset_type = asset_type
        self._library = library
    
    def render(self, context):
        try:
            return unicode(self._library.render(self._asset_path, self._asset_type, context))
        except Exception, e:
            print "%s error (%s): %s" % (self, self._asset_path, e)
            utils.printException()
            
            if settings.DEBUG:
                raise
            else:
                return ''

