/*! View.js
 * 
 * View combines the benefits of Backbone.View with the ability to render templates.
 * 
 * NOTE: all View subclasses must override _get_template and optionally _get_context.
 * 
 * Copyright (c) 2012-2013 Travis Fischer
 */

define(["Backbone", "utils"], 
function(Backbone,   utils)
{
    return Backbone.View.extend({
        render : function() {
            var result = this._render_template(this._get_context());
            $(this.el).html(result);
            
            return this;
        }, 
        
        _render_template : function(view) {
            if (this.__template === undefined) {
                this.__template = Handlebars.compile(this._get_template());
            }
            
            if (this.__template === undefined || this.__template === null) {
                utils.throw("stamped render error: invaild template");
            }
            
            // TODO: where to get partial_templates from?
            return this.__template(view, { partials : partial_templates });
            //return Mustache.render(this.__template, view, partial_templates);
        }, 
        
        _load_template  : function(template_name) {
            return $("#" + template_name).html();
        }, 
        
        _get_context    : function() {
            return this.model.toJSON();
        }, 
        
        _get_template   : function() { utils.throw("must override _get_template"); }
    });
});

