#!/usr/bin/env python

__author__    = "Travis Fischer (fisch0920@gmail.com)"
__version__   = "1.0"
__copyright__ = "Copyright (c) 2012 Travis Fischer"
__license__   = "TODO"

from boto.ec2.connection import EC2Connection
from optparse            import OptionParser

import sys

def parseCommandLine():
    usage   = "Usage: %prog [options] node-name"
    version = "%prog " + __version__
    parser  = OptionParser(usage=usage, version=version)
    
    (options, args) = parser.parse_args()
    
    if len(args) == 0:
        options.stackName = None
        options.nodeName  = None
    else:
        name = args[0].lower()
        
        if '.' in name:
            options.stackName, options.nodeName = name.split('.')
        else:
            options.stackName, options.nodeName = name, None
    
    return options

def main():
    options = parseCommandLine()
    if options is None:
        return
    
    conn = EC2Connection()
    reservations = conn.get_all_instances()
    
    for reservation in reservations:
        for instance in reservation.instances:
            if instance.state != 'running':
                continue
            
            if 'stack' in instance.tags:
                stackName = instance.tags['stack']
                
                if options.stackName is None or stackName.lower() == options.stackName:
                    if not options.nodeName or \
                        ('Name' in instance.tags and instance.tags['Name'].lower() == options.nodeName):
                        
                        if len(instance.public_dns_name) > 0:
                            print instance.public_dns_name
                            sys.exit(0)
    
    print "error: unable to find instance matching stack-name '%s'" % options.stackName
    sys.exit(1)

if __name__ == '__main__':
    main()

