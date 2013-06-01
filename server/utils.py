#!/usr/bin/env python

import os

def is_ec2():
    """ returns whether or not this python process is running on EC2 """
    return os.path.exists("/proc/xen") and os.path.exists("/etc/ec2_version")

