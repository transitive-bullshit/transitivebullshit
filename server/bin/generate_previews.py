#!/usr/bin/env python

import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import utils
from core.processing_test import get_sketches

for sketch in get_sketches():
    name = sketch['name']
    ret = utils.shell2('phantomjs generate_previews.js %s' % name)
    if ret: continue
    
    ret = utils.shell2('ffmpeg -c:v png -r 10 -sameq -i ".frame%%d.png" -y %s.mp4' % name)
    if ret: continue
    
    ret = utils.shell2('rm -f .frame*.png')

