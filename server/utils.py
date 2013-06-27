#!/usr/bin/env python

import os

from subprocess import Popen, PIPE

def is_ec2():
    """ returns whether or not this python process is running on EC2 """
    return os.path.exists("/proc/xen") and os.path.exists("/etc/ec2_version")

def shell(cmd, customEnv=None):
    pp = Popen(cmd, shell=True, stdout=PIPE, stderr=PIPE, env=customEnv)
    
    output = pp.stdout.read().strip()
    status = pp.wait()
    
    return (output, status)

def shell2(cmd, customEnv=None):
    return Popen(cmd, shell=True, env=customEnv).wait()

