/*! views.js
 * 
 * Defines all client-side views used by this project.
 * 
 * Copyright (c) 2012-2013 Travis Fischer
 */

define(["View"], 
function(View)
{
    var ExampleView = View.extend({
        _get_template   : function() {
            return this._load_template('TODO');
        }, 
        
        _get_context    : function() {
            return { 'stamps' : View.prototype._get_context.apply(this) };
        }
    });
    
    return {
        'ExampleView'   : ExampleView, 
    };
});

