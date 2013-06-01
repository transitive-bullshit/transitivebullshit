/*! models.js
 * 
 * Defines all models used by this project.
 * 
 * Copyright (c) 2012-2013 Travis Fischer
 */

define(["Schema", "Model"], 
function(Schema,   Model)
{
    var ExampleModel = Model.extend({
        _get_schema : function() {
            return new Schema(arguments, 
                new Schema.Element('user_id',           { 'type' : "string", 'required' : true, 'primary_id' : true }), 
                new Schema.Element('name',              { 'type' : "string", 'required' : true }), 
                new Schema.Element('screen_name',       { 'type' : "string", 'required' : true }), 
                new Schema.Element('color_primary',     { 'type' : "string", 'default'  : "004AB2" }), 
                new Schema.Element('color_secondary',   { 'type' : "string", 'default'  : "0057D1" }), 
                new Schema.Element('bio',               { 'type' : "string", }), 
                new Schema.Element('website',           { 'type' : "string", }), 
                new Schema.Element('location',          { 'type' : "string", }), 
                new Schema.Element('privacy',           { 'type' : "boolean", 'required' : true }), 
                new MultiScaleImage('image',            { }).schema(), 
                new Schema.List   ('distribution',      new Schema(
                    new SchemaElement('category',       { 'type' : "string", 'required' : true }), 
                    new SchemaElement('name',           { 'type' : "string" }), 
                    new SchemaElement('icon',           { 'type' : "string" }), 
                    new SchemaElement('count',          { 'type' : "number", 'default'  : 0 })
                ))
            );
        }
    });
    
    return {
        "ExampleModel" : ExampleModel, 
    };
});

