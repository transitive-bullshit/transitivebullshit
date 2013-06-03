/*! Model.js
 * 
 * Model combines the attribute binding benefits of Backbone.Model with the 
 * strict data validation provided by Schema.
 * 
 * NOTE: all Model subclasses must override _get_schema.
 * 
 * Copyright (c) 2012-2013 Travis Fischer
 */

define(["Backbone", "utils", "Schema"], 
function(Backbone,   utils,   Schema)
{
    return Backbone.Model.extend({
        validate : function(attributes) {
            try {
                this.schema().validate(attributes);
            } catch(e) {
                console.debug(e);
                utils.throw(e);
            }
        }, 
        
        schema : function() {
            if (arguments.length > 0) {
                return this._get_schema(arguments);
            }
            
            if (this.__schema === undefined) {
                this.__schema = this._get_schema();
            }
            
            if (this.__schema === null || this.__schema === undefined) {
                utils.throw("stamped model schema error: undefined schema");
            }
            
            if (!(this.__schema instanceof Schema)) {
                utils.throw("stamped model schema error: schema is of wrong type '" + type(this.__schema) + "'");
            }
            
            return this.__schema;
        }, 
        
        defaults : function() {
            return utils.get_value(this.schema(), 'defaults');
        }, 
        
        idAttribute : function() {
            return utils.get_value(this.schema(), 'idAttribute');
        }, 
        
        _get_schema : function() { utils.throw("must override _get_schema"); }
    });
});

