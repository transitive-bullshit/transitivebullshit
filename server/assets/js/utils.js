/*! utils.js
 * 
 * Copyright (c) 2013 Travis Fischer
 */

/* vim: set tabstop=4 shiftwidth=4 softtabstop=4 expandtab: */
/* global window, console */

/* --------------------------------------------------------------------------
                                   Class
   -------------------------------------------------------------------------- */

/*! Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/ MIT Licensed. (inspired by base2 and Prototype)
 */
(function() {
    if (typeof(console.debug) === 'undefined') {
        console.debug = console.log;
    }
    
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    
    // The base Class implementation (does nothing)
    window.Class = function(){};
    
    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var _super = this.prototype;
        
        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;
        
        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn){
                     return function() {
                         var tmp = this._super;

                         // Add a new ._super() method that is the same method
                         // but on the super-class
                         this._super = _super[name];

                         // The method only need to be bound temporarily, so we
                         // remove it when we're done executing
                         var ret = fn.apply(this, arguments);        
                         this._super = tmp;

                         return ret;
                     };
                })(name, prop[name]) : prop[name];
        }
        
        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }
        
        // Populate our constructed prototype object
        Class.prototype = prototype;
        
        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;
        
        // And make this class extendable
        Class.extend = arguments.callee;
        
        return Class;
    };
})();

/* --------------------------------------------------------------------------
                                   Utils
   -------------------------------------------------------------------------- */

var Utils = {
    getRandom : function(min, max) {
        if (min === undefined) {
            return Math.random();
        } else {
            return Math.random() * (max - min) + min;
        }
    }, 
    
    getRandomInt : function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }, 
    
    shuffle : function(o) {
        for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }, 
    
    getProperty : function(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return prop;
            }
        }
    }
};

