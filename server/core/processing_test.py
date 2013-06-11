#!/usr/bin/env python

def get_sketches():
    return [
        {
            'name'  : 'not_found', 
            'hname' : '404 Page RRT', 
            'desc'  : "404 page utilizing rapidly exploring random trees (<a href='http://en.wikipedia.org/wiki/Rapidly_exploring_random_tree'>RTTs</a>).", 
        }, 
        {
            'name'  : 'rrt', 
            'hname' : 'Rapidly Exploring Random Trees', 
            'desc'  : "Exploration of rapidly exploring random trees (<a href='http://en.wikipedia.org/wiki/Rapidly_exploring_random_tree'>RTTs</a>) in the form of generative art.", 
        }, 
        {
            'name'  : 'hilbert', 
            'hname' : 'Hilbert', 
            'desc'  : "Generative art simulation based around a series of recursive Hilbert space-filling curves. (<a href='http://en.wikipedia.org/wiki/Hilbert_curve'>more info</a>).", 
        }, 
        {
            'name'  : 'intersection', 
            'hname' : 'Intersection', 
            'desc'  : "A surface filled with N circles, each with a different size and direction but constant velocity. Display the aggregate intersections of the circles.", 
            'attr'  : "Original <a href='http://reas.com/iperimage.php?section=works&work=preprocess_s&images=4&id=1&bgcolor=FFFFFF'>concept</a> by <a href='http://reas.com'>Casey Reas</a>", 
        }, 
        {
            'name'  : 'primordial', 
            'hname' : 'Primordial', 
            'desc'  : "Petri dish simulation comprised of several types of hierarchical organisms.", 
        }, 
        {
            'name'  : 'gravity', 
            'hname' : 'Gravity', 
            'desc'  : "Exploration of a simple n-body gravity system, in which every body is attracted to every other body dependent on mass, proximity, etc.", 
        }, 
        {
            'name'  : 'displaced', 
            'hname' : 'Displaced', 
            'desc'  : "Old-school wave simulation.", 
        }, 
        {
            'name'  : 'substrate', 
            'hname' : 'Substrate', 
            'desc'  : "Recursive line particles.", 
            'attr'  : "Original concept by <a href='http://www.complexification.net/'>J. Tarbell</a>", 
        }, 
        {
            'name'  : 'tenebrous', 
            'hname' : 'Tenebrous', 
            'desc'  : "Recursive \"tree\" branches.", 
        }, 
        {
            'name'  : 'thering', 
            'hname' : 'The Ring', 
            'desc'  : "Alternating black and white rings comprised of thousands of particles, all moving with respect to <a href='http://en.wikipedia.org/wiki/Brownian_motion'>Brownian motion</a>.", 
            'attr'  : "Original <a href='http://www.complexification.net/gallery/machines/binaryRing/'>concept</a> and implementation by <a href='http://www.complexification.net/'>J. Tarbell</a>", 
        }, 
        {
            'name'  : 'trema', 
            'hname' : 'Trema', 
            'desc'  : "Whiteout of various shape primitives overlaid on top of each other ad infinitum.", 
            'attr'  : "Original <a href='http://www.complexification.net/gallery/machines/tremaSpike/'>concept</a> and implementation by <a href='http://www.complexification.net/'>J. Tarbell</a>", 
        }, 
        {
            'name'  : 'intersection2', 
            'hname' : 'Intersection2', 
            'desc'  : "Combining the gravity sketch's movement with the intersection sketch's visualization.", 
        }, 
    ]

