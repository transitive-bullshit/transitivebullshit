/*! utils.js
 * 
 * Copyright (c) 2012-2013 Travis Fischer
 */

/*global define, window */

// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f() { log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

if(typeof(console.debug) === 'undefined') {
    console.debug = console.log;
}

define(function() {
    return {
        'get_value' : function(object, prop)
        {
            if (object) {
                value = object[prop];
                
                if (value !== undefined) {
                    return _.isFunction(value) ? value() : value;
                }
            }
            
            return null;
        }, 
        
        'type_check' : function(value, type)
        {
            var array = false;
            
            if (type == 'array') {
                type  = 'object';
                array = true;
            }
            
            return (typeof(value) == type && (!array || typeof(value.length) != "undefined"));
        }, 
        
        'throw' : function(msg)
        {
            console.debug(msg);
            
            throw msg;
        }
    };
});

