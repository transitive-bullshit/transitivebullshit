#!/usr/bin/env python

__author__    = "Travis Fischer (fisch0920@gmail.com)"
__copyright__ = "Copyright (c) 2013 Travis Fischer"

import gzip
import htmlentitydefs
import httplib
import os
import sys
import threading
import time
import traceback
import urllib
import urllib2

from subprocess         import Popen, PIPE
from BeautifulSoup      import BeautifulSoup
from StringIO           import StringIO

def is_ec2():
    """ returns whether or not this python process is running on EC2 """
    return os.path.exists("/proc/xen") and os.path.exists("/etc/ec2_version")

def log(s=""):
    s = __formatLog(s) + "\n"

    sys.stderr.write(s)
    sys.stdout.flush()
    sys.stderr.flush()

def __formatLog(s):
    try:
        return normalize(str(s), strict=True)
    except Exception:
        return "[%s] __error__ printout" % (threading.currentThread().getName(), )

def printException():
    traceback.print_exc()

def getFormattedException():
    exc_type, exc_value, exc_traceback = sys.exc_info()

    f = traceback.format_exception(exc_type, exc_value, exc_traceback)
    return string.joinfields(f, '')

def removeNonAscii(s):
    return "".join(ch for ch in s if ord(ch) < 128)

def normalize(s, strict=False):
    """
        Attempts to normalize the given value. If it is a string, this includes
        escaping html codes and possibly removing non-ascii characters.
    """
    
    try:
        if isinstance(s, basestring):
            # replace html escape sequences with their unicode equivalents
            if '&' in s and ';' in s:
                for name in htmlentitydefs.name2codepoint:
                    escape_seq = '&%s;' % name

                    while True:
                        l = s.lower().find(escape_seq)
                        if l < 0:
                            break

                        if name == 'lsquo' or name == 'rsquo':
                            # simplify unicode single quotes to use the ascii apostrophe character
                            val = "'"
                        else:
                            val = unichr(htmlentitydefs.name2codepoint[name])

                        s = u"%s%s%s" % (s[:l], val, s[l+len(escape_seq):])

            # handle &#xxxx;
            escape_seq = '&#'
            while True:
                l = s.find(escape_seq)
                if l < 0:
                    break

                m = s.find(';', l)
                if m < 0 or m <= l + 2:
                    break

                try:
                    val = unichr(int(s[l + 2 : m]))
                except ValueError:
                    try:
                        val = unichr(int(s[l + 3 : m]))
                    except ValueError:
                        break

                s = u"%s%s%s" % (s[:l], val, s[m + 1:])

        if strict and isinstance(s, unicode):
            s = removeNonAscii(s.encode("utf-8"))
    except Exception as e:
        printException()
        log(e)
    
    return s

def getFile(url, request=None, params=None, maxDelay=16, delay=0.5):
    """
        Wrapper around urllib2.urlopen(url).read(), which attempts to increase
        the success rate by sidestepping server-side issues and usage limits by
        retrying unsuccessful attempts with increasing delays between retries,
        capped at a maximum possibly delay, after which the request will simply
        fail and propagate any exceptions normally.
    """
    
    data     = None
    request  = None
    
    if request is None:
        if params is not None and isinstance(params, dict):
            params = urllib.urlencode(params)
        
        request = urllib2.Request(url, params)
        request.add_header('Accept-encoding', 'gzip')
    
    while True:
        try:
            response = urllib2.urlopen(request)
            data = response.read()
            break
        except urllib2.HTTPError, e:
            #log("'%s' fetching url '%s'" % (str(e), url))
            #printException()

            # reraise the exception if the request resulted in an HTTP client 4xx error code,
            # since it was a problem with the url / headers and retrying most likely won't
            # solve the problem.
            if e.code >= 400 and e.code < 500:
                print "Failed: %s" % e
                raise
            
            # if delay is already too large, request will likely not complete successfully,
            # so propagate the error and return.
            if delay > maxDelay:
                raise
        except (ValueError, IOError, httplib.BadStatusLine) as e:
            #log("Error '%s' fetching url '%s'" % (str(e), url))
            #printException()
            
            # if delay is already too large, request will likely not complete successfully,
            # so propagate the error and return.
            if delay > maxDelay:
                raise
        except Exception, e:
            print type(e)
            log("[utils] Unexpected Error '%s' fetching url '%s'" % (str(e), url))
            if delay > maxDelay:
                raise

        # encountered error fetching document. delay for a bit and try again
        #log("Attempting to recover with delay of %d" % delay)

        # put the current thread to sleep for a bit, increase the delay,
        # and retry the request
        print 'wait %s' % delay
        time.sleep(delay)
        delay *= 2

    if response.info().get('Content-Encoding') == 'gzip':
        #data = zlib.decompress(data)
        buf = StringIO(data)
        f = gzip.GzipFile(fileobj=buf)
        data = f.read()
        buf.close()
    
    if hasattr(response, 'fp') and hasattr(response.fp, '_sock') and hasattr(response.fp._sock, 'recv'):
        response.fp._sock.recv = None
    
    response.close()
    
    # return the successfully downloaded file
    return data

def getSoup(url, opener=None):
    """ downloads and returns the BeautifulSoup parsed version of the file at the given url """
    return BeautifulSoup(getFile(url, opener))

def shell(cmd, customEnv=None):
    pp = Popen(cmd, shell=True, stdout=PIPE, stderr=PIPE, env=customEnv)
    
    output = pp.stdout.read().strip()
    status = pp.wait()
    
    return (output, status)

def shell2(cmd, customEnv=None):
    return Popen(cmd, shell=True, env=customEnv).wait()

def slugify(s):
    return s.lower().replace(' ', '-').strip()

