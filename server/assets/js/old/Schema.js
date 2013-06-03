/*! Schema.js
 * 
 * Defines three classes: Schema, Schema.Element, and Schema.List, which together 
 * form the basis for typing and validating arbitrarily deep, nested JSON documents.
 * 
 * Copyright (c) 2012-2013 Travis Fischer
 */

define(["Class", "utils"], 
function(Class,   utils)
{
    /**
     * SchemaElement provides a way to validate the type and integrity of a 
     * normal JS object. It takes in a dictionary of constraints to be 
     * enforced when validating a given value.
     * 
     * Note that as with all SchemaElements, the schema definition is 
     * decoupled from the value(s) themselves.
     */
    var SchemaElement = Class.extend({
        // optional String name, Object constraints
        init : function(name, constraints) {
            if (typeof(constraints) == "undefined" && typeof(name) != "string") {
                constraints = name;
                name = null;
            }
            
            this.name = name || "";
            this.constraints = constraints || {};
            
            this.has_default = ('default' in this.constraints);
            
            if (!('type' in this.constraints)) {
                utils.throw("(element '" + this.name + "') type is required");
            }
            
            if (this.has_default) {
                var d = this.constraints['default'];
                var type = this.constraints['type'];
                
                if (!utils.type_check(d, type)) {
                    utils.throw("(element '" + this.name + "') invalid default '" + d + "' (not of required type '" + type + "')");
                }
            }
        }, 
        
        validate : function(value) {
            if (!_is_defined(value)) {
                if ('required' in this.constraints && !!utils.get_value(this.constraints, 'required')) {
                    utils.throw("missing required element '" + this.name + "'");
                }
                
                if ("default" in this.constraints) {
                    return utils.get_value(this.constraints, "default");
                } else {
                    return undefined;
                }
            } else {
                var type = this.constraints['type'];
                
                if (!utils.type_check(value, type)) {
                    utils.throw("(element '" + name + "') type mismatch '" + typeof(value) + "' not of type '" + type + "'");
                }
                
                return value;
            }
        }
    });
    
    /**
     * SchemaList provides a way to validate the structure and integrity of a 
     * normal JS array. It takes in a SchemaElement instance subelements of 
     * the array should adhere to. This SchemaElement effectively acts as the 
     * validator for each array element.
     * 
     * Note that SchemaList itself is a SchemaElement, s.t. recursive Schema 
     * definitions are easily allowed.
     * 
     * Note that as with all SchemaElements, the schema definition is 
     * decoupled from the value(s) themselves.
     * 
     * This example creates a schema that validates number array values.
     * 
     * new SchemaList(new SchemaElement({ 'type' : "number" }));
     */
    var SchemaList = SchemaElement.extend({
        // optional String name, optional Object constraints, subelement schema
        init : function() {
            var varargs = Array.prototype.slice.call(arguments);
            
            var constraints = {
                'type' : "array", 
            };
            
            var length = varargs.length;
            var index  = 0;
            var name   = null;
            var that   = this;
            
            if (length > index && typeof(varargs[index]) == "string") {
                name   = varargs[index];
                index += 1;
            }
            
            if (length > index && typeof(varargs[index]) == "object" && !(varargs[index] instanceof SchemaElement)) {
                $.each(varargs[index], function(k, v) {
                    constraints[k] = v;
                });
                
                index += 1;
            }
            
            this._super(name, constraints);
            
            if (index != length - 1) {
                utils.throw("SchemaList.init must be given exactly one subelement type: " + index + " vs " + length);
            } else {
                this.schema = varargs[index];
                
                if (!(this.schema instanceof SchemaElement)) {
                    try {
                        this.schema = varargs[index].schema();
                    } catch(e) {
                        this.schema = null;
                    }
                    
                    if (!(this.schema instanceof SchemaElement)) {
                        utils.throw("invalid subelement type for SchemaList");
                    }
                }
            }
        }, 
        
        validate : function(value) {
            this._super(value);
            var that = this;
            
            $.each(value, function(index, element) {
                that.schema.validate(element);
            });
        }
    });
    
    /**
     * Schema provides a way to validate the structure and integrity of a 
     * normal JS object / dictionary. It takes in zero or more top-level 
     * SchemaElements representing the keys allowed / expected in the 
     * constrainted dictionary.
     * 
     * Note that Schema itself is a SchemaElement, s.t. recursive Schema 
     * definitions are easily allowed.
     * 
     * Note that as with all SchemaElements, the schema definition is 
     * decoupled from the value(s) themselves.
     * 
     * This example creates a schema that validates dictionary values 
     * containing a single, required element called 'name'.
     * 
     * new Schema(new SchemaElement('name, { 'required' : true }));
     */
    var Schema = SchemaElement.extend({
        // optional String name, optional Object constraints, optional varargs elements
        init : function() {
            var varargs = Array.prototype.slice.call(arguments);
            
            var constraints = {
                'type' : "object", 
                'allow_overflow' : true, 
            };
            
            var length  = varargs.length;
            var index   = 0;
            var name    = null;
            var primary = null;
            var that    = this;
            
            // attempt to parse name and constraints parameters via order and type constraints
            function parse_args(args, i) {
                var length2 = args.length;
                
                if (length2 > i && utils.type_check(args[i], "string")) {
                    name = args[i];
                    i   += 1;
                }
                
                if (length2 > i && utils.type_check(args[i], "object") && !(args[i] instanceof SchemaElement)) {
                    $.each(args[i], function(k, v) {
                        constraints[k] = v;
                    });
                    
                    i += 1;
                }
                
                return i;
            }
            
            // small hack to allow name and constraints to be passed to init as arguments from 
            // another function invokation (allows for more flexible chaining).
            if (length > index && utils.type_check(varargs[index], "array")) {
                args = varargs[index];
                
                while (args.length == 1 && utils.type_check(args, "array")) {
                    args = args[0];
                }
                
                parse_args(args, 0);
                index += 1;
            } else {
                index = parse_args(varargs, index);
            }
            
            this._super(name, constraints);
            
            this.elements = [];
            this.schema   = {};
            this.defaults = {};
            
            // if there are elements
            if (index < length) {
                $.each(varargs.slice(index), function(i, element) {
                    if (!(element instanceof SchemaElement)) {
                        var msg = "all arguments to Schema must be SchemaElements; element '" + (index + i) + 
                                  "' of incorrect type: '" + typeof(element) + "'";
                        
                        utils.throw(msg);
                    }
                    
                    if (utils.get_value(element.constraints, 'primary_id')) {
                        if (primary != null) {
                            utils.throw("only one key may be primary; primary_id set on '" + primary + "' and '" + element.name + "'");
                        }
                        
                        primary = element.name;
                    }
                    
                    that.elements.push(element);
                    that.schema[element.name] = element;
                });
                
                $.each(this.elements, function(i, element) {
                    if (element.has_default) {
                        that.defaults[element.name] = element.constraints["default"];
                    }
                });
                
                if (primary != null) {
                    this.idAttribute = primary;
                }
            }
        }, 
        
        validate : function(value) {
            this._super(value);
            var that = this;
            
            $.each(this.elements, function(index, element) {
                element.validate(utils.get_value(value, element.name));
            });
            
            if (!utils.get_value(this.constraints, 'allow_overflow')) {
                $.each(value, function(key, _) {
                    if (!(key in that.schema)) {
                        utils.throw("unrecognized attribute '" + key + "'");
                    }
                });
            }
        }
    });
    
    Schema.Element = SchemaElement;
    Schema.List    = SchemaList;
    
    return Schema;
});

